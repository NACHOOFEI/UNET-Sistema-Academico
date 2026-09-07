using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace UNET.Migrations
{
    /// <inheritdoc />
    public partial class SeedCatalogoYRolAdministrador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Permisos",
                columns: new[] { "Id", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000002"), null, "Ver" },
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000006"), null, "Crear" },
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000007"), null, "Editar" },
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000008"), null, "Eliminar" }
                });

            migrationBuilder.InsertData(
                table: "Recursos",
                columns: new[] { "Id", "Nombre", "Tipo" },
                values: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000001"), "Roles", "Entidad" });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "Descripcion", "Eliminado", "FechaModificacion", "Nombre", "UsuarioModificacionId" },
                values: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000004"), "Rol con acceso total al sistema", false, null, "Administrador", null });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "Activo", "Email", "Legajo", "PasswordHash" },
                values: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000005"), true, "admin@unet.edu.ar", "0000", "$2a$11$PZLTd1lgBc/J9fbWUMAkXOzVu1sVgye9og5ozbsh.h/Xji2k1uhiK" });

            migrationBuilder.InsertData(
                table: "PermisosSobreRecurso",
                columns: new[] { "Id", "Descripcion", "Nombre", "PermisoId", "RecursoId" },
                values: new object[,]
                {
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000003"), null, "ver_roles", new Guid("6f1a1f2a-0000-4000-8000-000000000002"), new Guid("6f1a1f2a-0000-4000-8000-000000000001") },
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000009"), null, "crear_roles", new Guid("6f1a1f2a-0000-4000-8000-000000000006"), new Guid("6f1a1f2a-0000-4000-8000-000000000001") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000a"), null, "editar_roles", new Guid("6f1a1f2a-0000-4000-8000-000000000007"), new Guid("6f1a1f2a-0000-4000-8000-000000000001") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000b"), null, "eliminar_roles", new Guid("6f1a1f2a-0000-4000-8000-000000000008"), new Guid("6f1a1f2a-0000-4000-8000-000000000001") }
                });

            migrationBuilder.InsertData(
                table: "UsuarioRoles",
                columns: new[] { "RolesId", "UsuariosId" },
                values: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000004"), new Guid("6f1a1f2a-0000-4000-8000-000000000005") });

            migrationBuilder.InsertData(
                table: "RolPermisosSobreRecurso",
                columns: new[] { "PermisosSobreRecursoId", "RolesId" },
                values: new object[,]
                {
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000003"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") },
                    { new Guid("6f1a1f2a-0000-4000-8000-000000000009"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000a"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") },
                    { new Guid("6f1a1f2a-0000-4000-8000-00000000000b"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000003"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000009"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-00000000000a"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "RolPermisosSobreRecurso",
                keyColumns: new[] { "PermisosSobreRecursoId", "RolesId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-00000000000b"), new Guid("6f1a1f2a-0000-4000-8000-000000000004") });

            migrationBuilder.DeleteData(
                table: "UsuarioRoles",
                keyColumns: new[] { "RolesId", "UsuariosId" },
                keyValues: new object[] { new Guid("6f1a1f2a-0000-4000-8000-000000000004"), new Guid("6f1a1f2a-0000-4000-8000-000000000005") });

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000003"));

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000009"));

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-00000000000a"));

            migrationBuilder.DeleteData(
                table: "PermisosSobreRecurso",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-00000000000b"));

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Usuarios",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000005"));

            migrationBuilder.DeleteData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000006"));

            migrationBuilder.DeleteData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000007"));

            migrationBuilder.DeleteData(
                table: "Permisos",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000008"));

            migrationBuilder.DeleteData(
                table: "Recursos",
                keyColumn: "Id",
                keyValue: new Guid("6f1a1f2a-0000-4000-8000-000000000001"));
        }
    }
}
