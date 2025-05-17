namespace FullPortManagementSystem.Models
{
    public class BerthStatus
    {
        public string BerthId { get; set; }
        public List<VesselEvent> AssignedVessels { get; set; } = new();
        public List<VesselEvent> WaitingQueue { get; set; } = new();
    }
}
