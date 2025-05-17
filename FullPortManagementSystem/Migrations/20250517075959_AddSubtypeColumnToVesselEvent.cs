using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FullPortManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddSubtypeColumnToVesselEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "container_subtype",
                table: "VesselEvents",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "container_subtype",
                table: "VesselEvents");
        }
    }
}
