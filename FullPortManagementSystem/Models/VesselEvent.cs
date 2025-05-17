namespace FullPortManagementSystem.Models
{
    public class VesselEvent
    {
        public int Id { get; set; } // Primary Key
        public string vessel_type { get; set; } // Tanker, RoRo, Container, Bulk
        public int vessel_size { get; set; } // Size in meters
        
        public TimeSpan eta_hour { get; set; } // ETA
        public TimeSpan planned_departure_hour { get; set; } // ETA + duration

        public string berth_id { get; set; } // A, B, C, D
        public string berth_type { get; set; } // Tanker, RoRo, Container, Bulk
        public int weather_score { get; set; } // 0-5

        public string? container_subtype { get; set; } // Nullable, only used for Containers
    }
}
