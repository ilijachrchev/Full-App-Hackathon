using FullPortManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace FullPortManagementSystem.Data
{
    public class PortDbContext : DbContext
    {
        public PortDbContext(DbContextOptions<PortDbContext> options) : base(options) { }

        public DbSet<VesselEvent> VesselEvents { get; set; }
    }
}
