using UNET.Data;
using UNET.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace UNET.Repositories;

public class RolRepository : IRolRepository
{
    private readonly AppDbContext _context;

    public RolRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExisteNombreAsync(string nombre) =>
        await _context.Roles.AnyAsync(r => r.Nombre == nombre);

    public async Task<List<PermisoSobreRecurso>> GetPermisosSobreRecursoByIdsAsync(List<Guid> ids) =>
        await _context.PermisosSobreRecurso.Where(p => ids.Contains(p.Id)).ToListAsync();

    public async Task<UNET.Data.Entities.Rol> CreateAsync(UNET.Data.Entities.Rol rol)
    {
        _context.Roles.Add(rol);
        await _context.SaveChangesAsync();
        return rol;
    }
}
