using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace UNET.Migrations
{
    /// <inheritdoc />
    public partial class PersonaYRecursoUsuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FechaModificacion",
                table: "Usuarios",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PersonaId",
                table: "Usuarios",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioModificacionId",
                table: "Usuarios",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Personas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Apellido = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    UsuarioModificacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Eliminado = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personas", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Personas",
                columns: new[] { "Id", "Apellido", "Eliminado", "FechaModificacion", "Nombre", "UsuarioModificacionId" },
                values: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000011"), "UNET", false, null, "Administrador", null });

            migrationBuilder.InsertData(
                table: "Recursos",
                columns: new[] { "Id", "Nombre", "Tipo" },
                values: new object[] { new Guid("6f1a1f2a-0000-4000-8000-00000000000c"), "Usuarios", "Entidad" });

            migrationBuilder.UpdateData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000005"),
                columns: new[] { "FechaModificacion", "PersonaId", "UsuarioModificacionId" },
                values: new object[] { null, new Guid("6f1a1f2a-0000-4000-8000-000000000011"), null });

            migrationBuilder.InsertData(
                table: "PermisosSobreRecurso",
                columns: new[] { "Id", "Descripcion", "Nombre", "PermisoId", "RecursoId" },
                values: new object[,]
                {
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000d"), null, "ver_usuarios", new Guid("6f1a1f2a-0000-4000-8000-000000000002"), new Guid("6f1a1f2a-0000-4000-8000-00000000000c") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000e"), null, "crear_usuarios", new Guid("6f1a1f2a-0000-4000-8000-000000000006"), new Guid("6f1a1f2a-0000-4000-8000-00000000000c") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000f"), null, "editar_usuarios", new Guid("6f1a1f2a-0000-4000-8000-000000000007"), new Guid("6f1a1f2a-0000-4000-8000-00000000000c") },
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000010"), null, "eliminar_usuarios", new Guid("6f1a1f2a-0000-4000-8000-000000000008"), new Guid("6f1a1f2a-0000-4000-8000-00000000000c") }
                });

            migrationBuilder.InsertData(
                table: "RolPermisosSobreRecurso",
                columns: new[] { "PermisosSobreRecursoId", "RolesId" },
                values: new object[,]
                {
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000d"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000e"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000f"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") },
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000010"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_PersonaId",
                table: "Usuarios",
                column: "PersonaId",
                unique: true,
                filter: "[PersonaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_Apellido_Nombre",
                table: "Personas",
                columns: new[] { "Apellido", "Nombre" });

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Personas_PersonaId",
                table: "Usuarios",
                column: "PersonaId",
                principalTable: "Personas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Personas_PersonaId",
                table: "Usuarios");

            migrationBuilder.DropTable(
                name: "Personas");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_PersonaId",
                table: "Usuarios");

            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-00000000000d"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-00000000000e"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-00000000000f"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000010"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-00000000000d"));

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-00000000000e"));

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-00000000000f"));

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000010"));

            migrationBuilder.DeleteData(
                table: "Recursos",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-00000000000c"));

            migrationBuilder.DropColumn(
                name: "FechaModificacion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "PersonaId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "UsuarioModificacionId",
                table: "Usuarios");
        }
    }
}
