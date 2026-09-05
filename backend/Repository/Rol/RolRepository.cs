using Backend.Data;
using Backend.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.Rol;

public class RolRepository : IRolRepository
{
    private readonly AppDbContext _context;

    public RolRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExisteNombreAsync(string nombre) =>
        await _context.Roles.AnyAsync(r => r.Nombre == nombre);

    public async Task<List<PermisoSobreRecurso>> ObtenerPermisosSobreRecursoPorIdsAsync(List<Guid> ids) =>
        await _context.PermisosSobreRecurso.Where(p => ids.Contains(p.Id)).ToListAsync();

    public async Task<Backend.Data.Entities.Rol> CrearAsync(Backend.Data.Entities.Rol rol)
    {
        _context.Roles.Add(rol);
        await _context.SaveChangesAsync();
        return rol;
    }
}
