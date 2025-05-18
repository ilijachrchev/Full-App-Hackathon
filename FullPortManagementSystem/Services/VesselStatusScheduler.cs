using FullPortManagementSystem.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class VesselStatusScheduler : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly int MaxBerthSize = 150;

    public VesselStatusScheduler(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<PortDbContext>();
            var now = DateTime.UtcNow.TimeOfDay;

            // 1. Promote ANNOUNCEMENT → QUEUE
            var announcements = await db.VesselEvents
                .Where(v => v.Status == "announcement" && v.eta_hour <= now)
                .ToListAsync();

            foreach (var vessel in announcements)
            {
                vessel.Status = "queue";
            }

            await db.SaveChangesAsync();

            // 2. Promote BERTH → DEPARTURE
            var departures = await db.VesselEvents
                .Where(v => v.Status == "berth" && v.planned_departure_hour <= now)
                .ToListAsync();

            foreach (var vessel in departures)
            {
                vessel.Status = "departure";
            }

            await db.SaveChangesAsync();

            // 3. Promote QUEUE → BERTH
            var queueVessels = await db.VesselEvents
                .Where(v => v.Status == "queue")
                .OrderBy(v => v.eta_hour)
                .ToListAsync();

            foreach (var vessel in queueVessels)
            {
                var vesselsInBerth = await db.VesselEvents
                    .Where(vb => vb.berth_id == vessel.berth_id && vb.Status == "berth")
                    .ToListAsync();

                int used = vesselsInBerth.Sum(v => v.vessel_size);

                if (used + vessel.vessel_size <= MaxBerthSize)
                {
                    vessel.Status = "berth";
                    used += vessel.vessel_size;
                }
            }

            await db.SaveChangesAsync();
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
