using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FullPortManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class InitWithTimeSpan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VesselEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    vessel_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    vessel_size = table.Column<int>(type: "int", nullable: false),
                    eta_hour = table.Column<TimeSpan>(type: "time", nullable: false),
                    planned_departure_hour = table.Column<TimeSpan>(type: "time", nullable: false),
                    berth_id = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    berth_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    weather_score = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VesselEvents", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VesselEvents");
        }
    }
}
