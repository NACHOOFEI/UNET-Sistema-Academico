using UNET.Data.Entities;
using UNET.Data.Enums;
using UNET.Data.Seed;
using Microsoft.EntityFrameworkCore;

namespace UNET.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

    public DbSet<Usuario> Usuarios => Set<Usuario>();
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
                Activo = true
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
                        new { RolesId = SeedIds.RolAdministrador, PermisosSobreRecursoId = SeedIds.PermisoSobreRecursoEliminarRoles }
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

            entity.HasData(new Recurso
            {
                Id = SeedIds.RecursoRoles,
                Nombre = "Roles",
                Tipo = RecursoTipo.Entidad
            });
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
                }
            );
        });
    }
}
