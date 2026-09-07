using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UNET.Migrations
{
    /// <inheritdoc />
    public partial class AuditoriaYBorradoRol : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Roles_Nombre",
                table: "Roles");

            migrationBuilder.AddColumn<bool>(
                name: "Eliminado",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaModificacion",
                table: "Roles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioModificacionId",
                table: "Roles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Nombre",
                table: "Roles",
                column: "Nombre",
                unique: true,
                filter: "[Eliminado] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Roles_Nombre",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "Eliminado",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "FechaModificacion",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "UsuarioModificacionId",
                table: "Roles");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Nombre",
                table: "Roles",
                column: "Nombre",
                unique: true);
        }
    }
}
