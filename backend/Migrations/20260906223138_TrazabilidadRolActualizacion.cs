using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UNET.Migrations
{
    /// <inheritdoc />
    public partial class TrazabilidadRolActualizacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ActualizadoPorUsuarioId",
                table: "Roles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Roles",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualizadoPorUsuarioId",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Roles");
        }
    }
}
