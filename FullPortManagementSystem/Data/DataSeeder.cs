using FullPortManagementSystem.Models;

namespace FullPortManagementSystem.Data
{
    public class DataSeeder
    {
        public static void Seed(PortDbContext context)
        {
            return; // Commented out to prevent seeding on every run
                    //        context.VesselEvents.RemoveRange(context.VesselEvents);
                    //        context.SaveChanges();

            //        var vesselTypes = new[] { "Tanker", "RoRo", "Container", "Bulk" };
            //        var berthMap = new Dictionary<string, string>
            //{
            //    { "Tanker", "A" },
            //    { "Container", "B" },
            //    { "Bulk", "C" },
            //    { "RoRo", "D" }
            //};

            //        var possibleSizes = new[] { 50, 75, 100, 150 };
            //        var possibleMinutes = new[] { 0, 15, 30, 45 };
            //        var containerSubtypes = new[] { "ShortExpiryDateFood", "LongExpiryDateFood", "Others" };

            //        var random = new Random();
            //        var berthSchedules = new Dictionary<string, List<(int start, int end)>>()
            //{
            //    { "A", new List<(int, int)>() },
            //    { "B", new List<(int, int)>() },
            //    { "C", new List<(int, int)>() },
            //    { "D", new List<(int, int)>() }
            //};

            //        int created = 0;
            //        int maxToCreate = 2; // <-- Adjust how many you want

            //        while (created < maxToCreate)
            //        {
            //            var type = vesselTypes[random.Next(vesselTypes.Length)];
            //            var size = possibleSizes[random.Next(possibleSizes.Length)];
            //            var berthId = berthMap[type];
            //            var schedule = berthSchedules[berthId];

            //            string? containerSubtype = null;
            //            if (type.Equals("Container", StringComparison.OrdinalIgnoreCase))
            //            {
            //                containerSubtype = containerSubtypes[random.Next(containerSubtypes.Length)];
            //            }

            //            int etaHour = random.Next(0, 24);
            //            int etaMinute = possibleMinutes[random.Next(possibleMinutes.Length)];
            //            int etaTotalMinutes = etaHour * 60 + etaMinute;

            //            int unloadMinutes = size switch
            //            {
            //                50 => 60,
            //                75 => 90,
            //                100 => 120,
            //                150 => 180,
            //                _ => 60
            //            };

            //            int latestStart = (23 * 60 + 45) - unloadMinutes;
            //            if (etaTotalMinutes > latestStart)
            //                continue;

            //            int actualStart = etaTotalMinutes;
            //            int actualEnd = actualStart + unloadMinutes;

            //            if (IsOverlapping(schedule, actualStart, actualEnd))
            //                continue;

            //            schedule.Add((actualStart, actualEnd));

            //            TimeSpan actualEta = TimeSpan.FromMinutes(actualStart);
            //            TimeSpan plannedDeparture = TimeSpan.FromMinutes(actualEnd);
            //            int weatherScore = actualEta.Hours / 4;

            //            context.VesselEvents.Add(new VesselEvent
            //            {
            //                vessel_type = type,
            //                vessel_size = size,
            //                eta_hour = actualEta,
            //                planned_departure_hour = plannedDeparture,
            //                berth_id = berthId,
            //                berth_type = type,
            //                weather_score = weatherScore,
            //                container_subtype = containerSubtype
            //            });

            //            created++; // Only count if actually created
            //        }

            //        context.SaveChanges();
        }


        private static bool IsOverlapping(List<(int start, int end)> schedule, int newStart, int newEnd)
        {
            foreach (var (start, end) in schedule)
            {
                if (newStart < end && newEnd > start)
                {
                    return true;
                }
            }
            return false;
        }

        public static void AppendNew(PortDbContext context, int count)
        {
            //var vesselTypes = new[] { "Tanker", "RoRo", "Container", "Bulk" };
            //var berthMap = new Dictionary<string, string>
            //{
            //    { "Tanker", "A" },
            //    { "Container", "B" },
            //    { "Bulk", "C" },
            //    { "RoRo", "D" }
            //};

            //var possibleSizes = new[] { 50, 75, 100, 150 };
            //var possibleMinutes = new[] { 0, 15, 30, 45 };
            //var containerSubtypes = new[] { "ShortExpiryDateFood", "LongExpiryDateFood", "Others" };

            //var random = new Random();

            //for (int i = 0; i < count; i++)
            //{
            //    var type = vesselTypes[random.Next(vesselTypes.Length)];
            //    var size = possibleSizes[random.Next(possibleSizes.Length)];
            //    var berthId = berthMap[type];

            //    int etaHour = random.Next(0, 24);
            //    int etaMinute = possibleMinutes[random.Next(possibleMinutes.Length)];
            //    int etaTotalMinutes = etaHour * 60 + etaMinute;

            //    int unloadMinutes = size switch
            //    {
            //        50 => 60,
            //        75 => 90,
            //        100 => 120,
            //        150 => 180,
            //        _ => 60
            //    };

            //    int latestStart = (23 * 60 + 45) - unloadMinutes;
            //    if (etaTotalMinutes > latestStart) continue;

            //    TimeSpan actualEta = TimeSpan.FromMinutes(etaTotalMinutes);
            //    TimeSpan plannedDeparture = TimeSpan.FromMinutes(etaTotalMinutes + unloadMinutes);
            //    int weatherScore = actualEta.Hours / 4;

            //    string? containerSubtype = null;
            //    if (type == "Container")
            //    {
            //        containerSubtype = containerSubtypes[random.Next(containerSubtypes.Length)];
            //    }

            //    context.VesselEvents.Add(new VesselEvent
            //    {
            //        vessel_type = type,
            //        vessel_size = size,
            //        eta_hour = actualEta,
            //        planned_departure_hour = plannedDeparture,
            //        berth_id = berthId,
            //        berth_type = type,
            //        weather_score = weatherScore,
            //        container_subtype = containerSubtype
            //    });
            //}

            //context.SaveChanges();

            return;
        }
    }
}
