using UNET.Data;
using Microsoft.EntityFrameworkCore;

namespace UNET.Repositories;

public interface IUsuarioRepository
{
    Task<UNET.Data.Entities.Usuario?> ObtenerPorLegajoConRolesYPermisosAsync(string legajo);
}

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UNET.Data.Entities.Usuario?> ObtenerPorLegajoConRolesYPermisosAsync(string legajo) =>
        await _context.Usuarios
            .AsSplitQuery()
            .Include(u => u.Roles)
                .ThenInclude(r => r.PermisosSobreRecurso)
            .FirstOrDefaultAsync(u => u.Legajo == legajo);
}
