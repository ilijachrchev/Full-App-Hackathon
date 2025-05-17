using FullPortManagementSystem.Data;
using FullPortManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;

namespace FullPortManagementSystem.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class VesselEventController : ControllerBase
    {
        private readonly PortDbContext _context;

        public VesselEventController(PortDbContext context)
        {
            _context = context;
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
            _context.VesselEvents.Add(vessel);
            _context.SaveChanges();
            return Ok(vessel);
        }

    }
}
