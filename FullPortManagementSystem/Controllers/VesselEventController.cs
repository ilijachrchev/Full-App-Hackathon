using Amazon.Runtime;
using FullPortManagementSystem.Data;
using FullPortManagementSystem.Models;
using FullPortManagementSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace FullPortManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VesselEventController : ControllerBase
    {
        private readonly PortDbContext _context;
        private readonly BerthAssignmentService _assignmentService;
        private readonly HttpClient _httpClient;

        public VesselEventController(PortDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _assignmentService = new BerthAssignmentService();
            _httpClient = httpClientFactory.CreateClient();
        }

        // GET: api/vesselEvent
        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var vessels = _context.VesselEvents.ToList();
                return Ok(vessels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/vesselEvent
        [HttpPost]
        public IActionResult Add(VesselEvent vessel)
        {
            try
            {
                var berthMap = new Dictionary<string, string>
                {
                    { "Tanker", "A" },
                    { "Container", "B" },
                    { "Bulk", "C" },
                    { "RoRo", "D" }
                };

                const int berthCap = 150;

                // Decide the intended berth
                if (!berthMap.TryGetValue(vessel.vessel_type, out var intendedBerthId))
                {
                    return BadRequest(new { error = "Invalid vessel type." });
                }

                // Calculate used space in this berth (by vessels that already Arrived)
                var used = _context.VesselEvents
                    .Where(v => v.berth_id == intendedBerthId && v.Status == "Arrived")
                    .Sum(v => v.vessel_size);

                if (used + vessel.vessel_size <= berthCap)
                {
                    // Assign directly
                    vessel.Status = "Arrived";
                    vessel.berth_id = intendedBerthId;
                    vessel.berth_type = vessel.vessel_type;
                }
                else
                {
                    // Not enough space → go to waiting
                    vessel.Status = "Waiting";
                    vessel.berth_id = null;
                    vessel.berth_type = vessel.vessel_type;
                }

                _context.VesselEvents.Add(vessel);
                _context.SaveChanges();

                return Ok(vessel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/vesselEvent/berth-status
        [HttpGet("berth-status")]
        public IActionResult GetBerthStatus()
        {
            try
            {
                var vessels = _context.VesselEvents.ToList();
                var result = _assignmentService.GetBerthAssignments(vessels);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/vesselEvent/status
        [HttpGet("status")]
        public IActionResult GetStatusSummary()
        {
            // group by status, count each
            var summary = _context.VesselEvents
                .GroupBy(v => v.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToList();

            return Ok(summary);
        }

        // POST api/ai/results
        [HttpPost("results")]
        public async Task<IActionResult> ReceiveResults()
        {
            // 1) Read the raw CSV body
            using var sr = new StreamReader(Request.Body);
            var csv = await sr.ReadToEndAsync();

            // 2) Parse into objects
            var schedules = CsvParserService.ParseAiCsv(csv);

            // 3) Now you can store them, update VesselEvents, etc.
            foreach (var s in schedules)
            {
                // Example: find the corresponding vessel by index
                var vessel = _context.VesselEvents.Find(s.VesselIndex);
                if (vessel != null)
                {
                    vessel.Status = s.RealtimeStatus;
                    vessel.berth_id = s.AssignedBerth;
                    // You can convert ScheduledStart/ScheduledEnd into TimeSpans:
                    vessel.eta_hour = TimeSpan.FromHours(s.AdjustedEtaHour);
                                        
                    // etc…
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { received = schedules.Count });
        }

        [HttpGet("fetch")]
        public async Task<IActionResult> FetchFromNgrok([FromQuery] string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest(new { error = "You must supply a valid url query parameter." });

            try
            {
                // 1) GET the remote payload
                HttpResponseMessage resp = await _httpClient.GetAsync(url);
                resp.EnsureSuccessStatusCode();

                // 2) Read as string (you could read as stream too)
                var json = await resp.Content.ReadAsStringAsync();

                // 3) Deserialize into your DTO(s).
                //    If it’s the same PayloadDTO you used before:
                var payloads = System.Text.Json.JsonSerializer
                    .Deserialize<List<PayloadDTO>>(json, new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (payloads == null)
                    return BadRequest(new { error = "Failed to parse payloads." });

                // 4) Ingest into your DB just like in your POST:
                foreach (var p in payloads)
                {
                    // map PayloadDTO → VesselEvent, apply business logic, etc.
                    var vessel = new VesselEvent
                    {
                        Message = p.Message,
                        Value = p.Value,
                        // …other fields…
                    };
                    _context.VesselEvents.Add(vessel);
                }
                await _context.SaveChangesAsync();

                return Ok(new { fetched = payloads.Count });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, new { error = "Error fetching remote data", detail = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


    // Define PayloadDTO here or in its own file:
    public record PayloadDTO(string Message, int Value);

}
}
