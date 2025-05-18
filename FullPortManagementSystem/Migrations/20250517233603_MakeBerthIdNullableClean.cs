using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FullPortManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class MakeBerthIdNullableClean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
    name: "berth_id",
    table: "VesselEvents",
    type: "nvarchar(max)",
    nullable: true,
    oldClrType: typeof(string),
    oldType: "nvarchar(max)");


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
