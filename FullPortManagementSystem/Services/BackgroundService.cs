using FullPortManagementSystem.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

public class VesselDataGenerator : BackgroundService
{
    private readonly IServiceProvider _services;

    public VesselDataGenerator(IServiceProvider services)
    {
        _services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<PortDbContext>();

                // 👇 Add 100 vessels without deleting old ones
                DataSeeder.AppendNew(db, 100);
            }

            // 🕒 Wait 3 minutes before adding more
            await Task.Delay(TimeSpan.FromMinutes(3), stoppingToken);
        }
    }
}
