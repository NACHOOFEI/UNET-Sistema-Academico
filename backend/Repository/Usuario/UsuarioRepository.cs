using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.Usuario;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Backend.Data.Entities.Usuario?> ObtenerPorLegajoConRolesYPermisosAsync(string legajo) =>
        await _context.Usuarios
            .AsSplitQuery()
            .Include(u => u.Roles)
                .ThenInclude(r => r.PermisosSobreRecurso)
            .FirstOrDefaultAsync(u => u.Legajo == legajo);
}
