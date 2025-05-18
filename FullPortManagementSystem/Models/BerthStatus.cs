namespace FullPortManagementSystem.Models
{
    public class BerthStatus
    {
        public string BerthId { get; set; } = string.Empty; // A, B, C, D
        public List<VesselEvent> AssignedVessels { get; set; } = new();
        public List<VesselEvent> WaitingQueue { get; set; } = new();
    }
}
