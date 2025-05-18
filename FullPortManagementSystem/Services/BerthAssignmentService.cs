using FullPortManagementSystem.Models;

namespace FullPortManagementSystem.Services
{
    public class BerthAssignmentService
    {
        private const int MaxSize = 150;

        public List<BerthStatus> GetBerthAssignments(List<VesselEvent> vessels)
        {
            var berthMap = new Dictionary<string, string>
            {
                { "A", "Tanker" },
                { "B", "Container" },
                { "C", "Bulk" },
                { "D", "RoRo" }
            };

            var result = new List<BerthStatus>();

            foreach (var (berthId, type) in berthMap)
            {
                var vesselsForBerth = vessels
                    .Where(v => v.berth_id == berthId && v.vessel_type == type)
                    .OrderBy(v => v.eta_hour)
                    .ToList();

                var berthStatus = new BerthStatus { BerthId = berthId };
                int used = 0;

                foreach (var vessel in vesselsForBerth)
                {
                    if (used + vessel.vessel_size <= MaxSize)
                    {
                        berthStatus.AssignedVessels.Add(vessel);
                        used += vessel.vessel_size;
                    }
                    else
                    {
                        berthStatus.WaitingQueue.Add(vessel);
                    }
                }

                result.Add(berthStatus);
            }

            return result;
        }
    }
}
