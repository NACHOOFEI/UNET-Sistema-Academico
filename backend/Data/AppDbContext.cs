using UNET.Data.Entities;
using UNET.Data.Enums;
using UNET.Data.Seed;
using Microsoft.EntityFrameworkCore;

namespace UNET.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Persona> Personas => Set<Persona>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Permiso> Permisos => Set<Permiso>();
    public DbSet<Recurso> Recursos => Set<Recurso>();
    public DbSet<PermisoSobreRecurso> PermisosSobreRecurso => Set<PermisoSobreRecurso>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(u => u.Legajo).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();

            // Sin HasQueryFilter a proposito: la baja logica de Usuario es Activo = false
            // y la pantalla de Usuarios necesita poder listar tambien los inactivos.

            entity.HasOne(u => u.Persona)
                .WithOne(p => p.Usuario)
                .HasForeignKey<Usuario>(u => u.PersonaId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indice filtrado: sin el filtro SQL Server considera iguales a todos los
            // NULL y dejaria un unico usuario sin persona asociada en todo el sistema.
            entity.HasIndex(u => u.PersonaId)
                .IsUnique()
                .HasFilter("[PersonaId] IS NOT NULL");

            entity.HasMany(u => u.Roles)
                .WithMany(r => r.Usuarios)
                .UsingEntity(j =>
                {
                    j.ToTable("UsuarioRoles");
                    j.HasData(new { UsuariosId = SeedIds.UsuarioAdmin, RolesId = SeedIds.RolAdministrador });
                });

            entity.HasData(new Usuario
            {
                Id = SeedIds.UsuarioAdmin,
                Legajo = "0000",
                Email = "admin@unet.edu.ar",
                PasswordHash = "$2a$11$PZLTd1lgBc/J9fbWUMAkXOzVu1sVgye9og5ozbsh.h/Xji2k1uhiK",
                Activo = true,
                PersonaId = SeedIds.PersonaAdmin
            });
        });

        modelBuilder.Entity<Persona>(entity =>
        {
            entity.Property(p => p.Nombre).HasMaxLength(120);
            entity.Property(p => p.Apellido).HasMaxLength(120);

            // La pantalla de Usuarios ordena y busca por apellido + nombre.
            entity.HasIndex(p => new { p.Apellido, p.Nombre });

            entity.HasQueryFilter(p => !p.Eliminado);

            entity.HasData(new Persona
            {
                Id = SeedIds.PersonaAdmin,
                Nombre = "Administrador",
                Apellido = "UNET",
                Eliminado = false
            });
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasIndex(r => r.Nombre).IsUnique().HasFilter("[Eliminado] = 0");

            entity.HasQueryFilter(r => !r.Eliminado);

            entity.HasMany(r => r.PermisosSobreRecurso)
                .WithMany(p => p.Roles)
                .UsingEntity(j =>
                {
                    j.ToTable("RolPermisosSobreRecurso");
                    j.HasData(
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoVerRoles },
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoCrearRoles },
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoEditarRoles },
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoEliminarRoles },
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoVerUsuarios },
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoCrearUsuarios },
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoEditarUsuarios },
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoEliminarUsuarios }
                    );
                });

            entity.HasData(new Rol
            {
                Id = SeedIds.RolAdministrador,
                Nombre = "Administrador",
                Descripcion = "Rol con acceso total al sistema",
                Eliminado = false
            });
        });

        modelBuilder.Entity<Permiso>(entity =>
        {
            entity.HasIndex(p => p.Nombre).IsUnique();

            entity.HasData(
                new Permiso { Id = SeedIds.PermisoVer, Nombre = "Ver" },
                new Permiso { Id = SeedIds.PermisoCrear, Nombre = "Crear" },
                new Permiso { Id = SeedIds.PermisoEditar, Nombre = "Editar" },
                new Permiso { Id = SeedIds.PermisoEliminar, Nombre = "Eliminar" }
            );
        });

        modelBuilder.Entity<Recurso>(entity =>
        {
            entity.HasIndex(r => r.Nombre).IsUnique();
            entity.Property(r => r.Tipo).HasConversion<string>();

            entity.HasData(
                new Recurso
                {
                    Id = SeedIds.RecursoRoles,
                    Nombre = "Roles",
                    Tipo = RecursoTipo.Entidad
                },
                new Recurso
                {
                    Id = SeedIds.RecursoUsuarios,
                    Nombre = "Usuarios",
                    Tipo = RecursoTipo.Entidad
                }
            );
        });

        modelBuilder.Entity<PermisoSobreRecurso>(entity =>
        {
            entity.HasIndex(p => p.Nombre).IsUnique();

            entity.HasOne(p => p.Permiso)
                .WithMany(p => p.PermisosSobreRecurso)
                .HasForeignKey(p => p.PermisoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Recurso)
                .WithMany(r => r.PermisosSobreRecurso)
                .HasForeignKey(p => p.RecursoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasData(
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoVerRoles,
                    Nombre = "ver_roles",
                    PermisoId = SeedIds.PermisoVer,
                    RecursoId = SeedIds.RecursoRoles
                },
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoCrearRoles,
                    Nombre = "crear_roles",
                    PermisoId = SeedIds.PermisoCrear,
                    RecursoId = SeedIds.RecursoRoles
                },
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoEditarRoles,
                    Nombre = "editar_roles",
                    PermisoId = SeedIds.PermisoEditar,
                    RecursoId = SeedIds.RecursoRoles
                },
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoEliminarRoles,
                    Nombre = "eliminar_roles",
                    PermisoId = SeedIds.PermisoEliminar,
                    RecursoId = SeedIds.RecursoRoles
                },
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoVerUsuarios,
                    Nombre = "ver_usuarios",
                    PermisoId = SeedIds.PermisoVer,
                    RecursoId = SeedIds.RecursoUsuarios
                },
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoCrearUsuarios,
                    Nombre = "crear_usuarios",
                    PermisoId = SeedIds.PermisoCrear,
                    RecursoId = SeedIds.RecursoUsuarios
                },
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoEditarUsuarios,
                    Nombre = "editar_usuarios",
                    PermisoId = SeedIds.PermisoEditar,
                    RecursoId = SeedIds.RecursoUsuarios
                },
                new PermisoSobreRecurso
                {
                    Id = SeedIds.PermisoSobreRecursoEliminarUsuarios,
                    Nombre = "eliminar_usuarios",
                    PermisoId = SeedIds.PermisoEliminar,
                    RecursoId = SeedIds.RecursoUsuarios
                }
            );
        });
    }
}
