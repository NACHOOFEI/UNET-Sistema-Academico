using UNET.Data;
using UNET.Data.Dtos.Rol;
using UNET.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace UNET.Repositories;

public interface IRolRepository
{
    Task<bool> ExisteNombreAsync(string nombre);
    Task<bool> ExisteOtroConNombreAsync(string nombre, Guid idExcluido);
    Task<RolDto> CreateAsync(CreateRolDto data);
    Task<RolDto?> UpdateAsync(Guid id, UpdateRolData data);
}

public class RolRepository : IRolRepository
{
    private readonly AppDbContext _context;

    public RolRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExisteNombreAsync(string nombre) =>
        await _context.Roles.AnyAsync(r => r.Nombre == nombre);

    public async Task<bool> ExisteOtroConNombreAsync(string nombre, Guid idExcluido) =>
        await _context.Roles.AnyAsync(r => r.Nombre == nombre && r.Id != idExcluido);

    public async Task<RolDto> CreateAsync(CreateRolDto data)
    {
        var rol = new Rol
        {
            Id = Guid.NewGuid(),
            Nombre = data.Nombre,
            Descripcion = data.Descripcion,
            PermisosSobreRecurso = await GetPermisosSobreRecursoByIdsAsync(data.PermisosSobreRecursoIds)
        };

        _context.Roles.Add(rol);
        await _context.SaveChangesAsync();

        return MapToDto(rol);
    }

    public async Task<RolDto?> UpdateAsync(Guid id, UpdateRolData data)
    {
        var rol = await _context.Roles
            .Include(r => r.PermisosSobreRecurso)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rol is null)
        {
            return null;
        }

        rol.Nombre = data.Nombre;
        rol.Descripcion = data.Descripcion;
        rol.PermisosSobreRecurso = await GetPermisosSobreRecursoByIdsAsync(data.PermisosSobreRecursoIds);
        rol.ActualizadoPorUsuarioId = data.UsuarioEjecutorId;
        rol.FechaActualizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(rol);
    }

    private async Task<List<PermisoSobreRecurso>> GetPermisosSobreRecursoByIdsAsync(List<Guid> ids) =>
        await _context.PermisosSobreRecurso.Where(p => ids.Contains(p.Id)).ToListAsync();

    private static RolDto MapToDto(Rol rol) =>
        new(rol.Id, rol.Nombre, rol.Descripcion, rol.PermisosSobreRecurso.Select(p => p.Nombre).ToList());
}
