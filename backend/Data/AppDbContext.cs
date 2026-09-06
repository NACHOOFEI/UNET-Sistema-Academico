using Backend.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

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
                .UsingEntity(j => j.ToTable("UsuarioRoles"));
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasIndex(r => r.Nombre).IsUnique();

            entity.HasMany(r => r.PermisosSobreRecurso)
                .WithMany(p => p.Roles)
                .UsingEntity(j => j.ToTable("RolPermisosSobreRecurso"));
        });

        modelBuilder.Entity<Permiso>(entity =>
        {
            entity.HasIndex(p => p.Nombre).IsUnique();
        });

        modelBuilder.Entity<Recurso>(entity =>
        {
            entity.HasIndex(r => r.Nombre).IsUnique();
            entity.Property(r => r.Tipo).HasConversion<string>();
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
        });
    }
}
