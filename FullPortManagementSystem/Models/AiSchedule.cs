using CsvHelper.Configuration.Attributes;

namespace FullPortManagementSystem.Models
{
    public class AiSchedule
    {
        [Name("vessel_index")]
        public int VesselIndex { get; set; }

        [Name("assigned_berth")]
        public string AssignedBerth { get; set; }

        [Name("scheduled_start")]
        public double ScheduledStart { get; set; }

        [Name("scheduled_end")]
        public double ScheduledEnd { get; set; }

        [Name("waiting_time")]
        public double WaitingTime { get; set; }

        [Name("vessel_type")]
        public string VesselType { get; set; }

        [Name("vessel_size")]
        public double VesselSize { get; set; }

        [Name("planned_departure_hour")]
        public double PlannedDepartureHour { get; set; }

        [Name("adjusted_eta_hour")]
        public double AdjustedEtaHour { get; set; }

        [Name("dtb")]
        public double Dtb { get; set; }

        [Name("realtime_status")]
        public string RealtimeStatus { get; set; }
    }

}
