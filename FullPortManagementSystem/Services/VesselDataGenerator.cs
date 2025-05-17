using FullPortManagementSystem.Data;

namespace FullPortManagementSystem.Services
{
    public class VesselDataGenerator : BackgroundService
    {
        private readonly IServiceProvider _services;

        public VesselDataGenerator(IServiceProvider services)
        {
            _services = services;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // ✅ Delay initial execution to avoid conflict with Seed()
            await Task.Delay(TimeSpan.FromMinutes(3), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _services.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<PortDbContext>();
                    Console.WriteLine($"[VesselDataGenerator] Adding 2 vessels at {DateTime.Now}");
                    DataSeeder.AppendNew(db, 2);
                }

                await Task.Delay(TimeSpan.FromMinutes(3), stoppingToken);
            }
        }
    }
}
