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

        public VesselEventController(PortDbContext context)
        {
            _context = context;
            _assignmentService = new BerthAssignmentService();
        }

        // GET api/vesselEvent
        [HttpGet]
        public IActionResult GetAll()
        {
            var vessels = _context.VesselEvents.ToList();
            return Ok(vessels);
        }

        // POST api/vesselEvent
        [HttpPost]
        public IActionResult Add(VesselEvent vessel)
        {
            var berthMap = new Dictionary<string, string>
    {
        { "Tanker", "A" },
        { "Container", "B" },
        { "Bulk", "C" },
        { "RoRo", "D" }
    };

            var berthCap = 150;

            // Decide the intended berth
            var intendedBerthId = berthMap.ContainsKey(vessel.vessel_type)
                ? berthMap[vessel.vessel_type]
                : null;

            if (intendedBerthId == null)
                return BadRequest("Invalid vessel type.");

            // Check how much space is used on that berth
            var used = _context.VesselEvents
                .Where(v => v.berth_id == intendedBerthId && v.Status == "Arrived")
                .Sum(v => v.vessel_size);

            if (used + vessel.vessel_size <= berthCap)
            {
                // Enough space → assign directly
                vessel.Status = "Arrived";
                vessel.berth_id = intendedBerthId;
                vessel.berth_type = vessel.vessel_type;
            }
            else
            {
                // Not enough space → wait
                vessel.Status = "Waiting";
                vessel.berth_id = null;
                vessel.berth_type = vessel.vessel_type;
            }

            _context.VesselEvents.Add(vessel);
            _context.SaveChanges();

            return Ok(vessel);
        }


        [HttpGet("berth-status")]
        public IActionResult GetBerthStatus()
        {
            var vessels = _context.VesselEvents.ToList();
            var result = _assignmentService.GetBerthAssignments(vessels);
            return Ok(result);
        }



    }
}
