using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FullPortManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class MapStatusToLowercase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "VesselEvents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "VesselEvents");
        }
    }
}
