using Amazon.Runtime;
using FullPortManagementSystem.Data;
using FullPortManagementSystem.Models;
using FullPortManagementSystem.Services;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;

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

    }
}
