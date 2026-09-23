using UNET.Common;
using UNET.Data;
using UNET.Data.Dtos.Usuario;
using UNET.Data.Enums;
using Microsoft.EntityFrameworkCore;

namespace UNET.Repositories;

public interface IUsuarioRepository
{
    Task<UNET.Data.Entities.Usuario?> ObtenerPorLegajoConRolesYPermisosAsync(string legajo);
    Task<PaginaDto<UsuarioDto>> GetAllAsync(UsuarioFiltroDto filtro);
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

    // Filtra y pagina en la base, y proyecta directo a UsuarioDto para no traer
    // entidades enteras ni la coleccion de roles cuando solo hacen falta los nombres.
    public async Task<PaginaDto<UsuarioDto>> GetAllAsync(UsuarioFiltroDto filtro)
    {
        IQueryable<UNET.Data.Entities.Usuario> consulta = _context.Usuarios.AsNoTracking();

        consulta = filtro.Estado switch
        {
            EstadoUsuarioFiltro.Activos => consulta.Where(u => u.Activo),
            EstadoUsuarioFiltro.Inactivos => consulta.Where(u => !u.Activo),
            _ => consulta
        };

        if (!string.IsNullOrWhiteSpace(filtro.Busqueda))
        {
            var patron = $"%{EscaparLike(filtro.Busqueda)}%";

            consulta = consulta.Where(u =>
                EF.Functions.Like(u.Legajo, patron) ||
                EF.Functions.Like(u.Email, patron) ||
                (u.Persona != null &&
                    (EF.Functions.Like(u.Persona.Nombre, patron) ||
                     EF.Functions.Like(u.Persona.Apellido, patron))));
        }

        var total = await consulta.CountAsync();

        var items = await consulta
            .OrderBy(u => u.Legajo)
            .Skip((filtro.Pagina - 1) * filtro.TamanoPagina)
            .Take(filtro.TamanoPagina)
            .Select(u => new UsuarioDto(
                u.Id,
                u.Legajo,
                u.Persona == null ? null : u.Persona.Nombre,
                u.Persona == null ? null : u.Persona.Apellido,
                u.Email,
                u.Activo,
                u.Roles.OrderBy(r => r.Nombre).Select(r => r.Nombre).ToList()))
            .ToListAsync();

        return new PaginaDto<UsuarioDto>(items, total, filtro.Pagina, filtro.TamanoPagina);
    }

    /// <summary>
    /// Escapa los comodines de LIKE con la notacion de corchetes de SQL Server, para
    /// que un % o un _ tipeado en el buscador se busque literal y no haga match con todo.
    /// </summary>
    private static string EscaparLike(string termino) =>
        termino
            .Replace("[", "[[]")
            .Replace("%", "[%]")
            .Replace("_", "[_]");
}
