using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace FullPortManagementSystem.Models
{
    public class VesselEvent
    {
        public int Id { get; set; }

        public string vessel_type { get; set; } = string.Empty;
        public int vessel_size { get; set; }

        // ← Add this back in:
        [Column("status")]
        public string Status { get; set; } = "Announcement";

        public TimeSpan eta_hour { get; set; }
        public TimeSpan planned_departure_hour { get; set; }

        [Column("berth_id")]
        public string? berth_id { get; set; }

        [Column("berth_type")]
        public string? berth_type { get; set; }

        public int weather_score { get; set; }

        public string? container_subtype { get; set; }
    }
}
