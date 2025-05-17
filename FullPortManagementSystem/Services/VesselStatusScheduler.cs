using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;
using FullPortManagementSystem.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

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
            using (var scope = _serviceProvider.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<PortDbContext>();
                var now = DateTime.UtcNow.TimeOfDay;

                // 1. Handle DEPARTURES
                var vesselsToDepart = await db.VesselEvents
                    .Where(v => v.Status == "berth" && v.planned_departure_hour <= now)
                    .ToListAsync();

                foreach (var vessel in vesselsToDepart)
                {
                    vessel.Status = "departure";
                }

                // 2. Promote ANNOUNCEMENTS to queue or berth
                var announcements = await db.VesselEvents
                    .Where(v => v.Status == "announcement")
                    .ToListAsync();

                foreach (var vessel in announcements)
                {
                    if (vessel.eta_hour <= now)
                    {
                        var usedSize = await db.VesselEvents
                            .Where(v => v.berth_id == vessel.berth_id && v.Status == "berth")
                            .SumAsync(v => v.vessel_size);

                        if (usedSize + vessel.vessel_size <= MaxBerthSize)
                        {
                            vessel.Status = "berth";
                        }
                        else
                        {
                            vessel.Status = "queue";
                        }
                    }
                }

                // 3. Promote QUEUED vessels to BERTH if space is available (FIFO per berth)
                var queueGroups = await db.VesselEvents
                    .Where(v => v.Status == "queue")
                    .OrderBy(v => v.eta_hour)
                    .GroupBy(v => v.berth_id)
                    .ToListAsync();

                foreach (var group in queueGroups)
                {
                    var berthId = group.Key;

                    var usedSize = await db.VesselEvents
                        .Where(v => v.berth_id == berthId && v.Status == "berth")
                        .SumAsync(v => v.vessel_size);

                    foreach (var vessel in group)
                    {
                        if (usedSize + vessel.vessel_size <= MaxBerthSize)
                        {
                            vessel.Status = "berth";
                            usedSize += vessel.vessel_size;
                        }
                        else
                        {
                            vessel.Status = "queue";
                        }
                    }
                }

                await db.SaveChangesAsync();
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
