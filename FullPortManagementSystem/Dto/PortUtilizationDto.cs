namespace FullPortManagementSystem.Dto
{
    public class PortUtilizationDto
    {
        public int TotalBerths { get; set; }
        public int OccupiedBerths { get; set; }
        public int ScheduledToday { get; set; }
        public int AvailableBerths { get; set; }
        public double UtilizationPercent { get; set; }
    }
}
