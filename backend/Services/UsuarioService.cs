using UNET.Common;
using UNET.Data.Dtos.Usuario;
using UNET.Repositories;

namespace UNET.Services;

public interface IUsuarioService
{
    Task<Result<PaginaDto<UsuarioDto>>> GetUsuariosAsync(UsuarioFiltroDto filtro);
}

public class UsuarioService : IUsuarioService
{
    private const int TamanoPaginaDefecto = 20;

    private const int TamanoPaginaMaximo = 100;

    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<Result<PaginaDto<UsuarioDto>>> GetUsuariosAsync(UsuarioFiltroDto filtro)
    {
        var busqueda = filtro.Busqueda?.Trim();

        var normalizado = filtro with
        {
            Busqueda = string.IsNullOrEmpty(busqueda) ? null : busqueda,
            Pagina = filtro.Pagina < 1 ? 1 : filtro.Pagina,
            TamanoPagina = filtro.TamanoPagina switch
            {
                < 1 => TamanoPaginaDefecto,
                > TamanoPaginaMaximo => TamanoPaginaMaximo,
                _ => filtro.TamanoPagina
            }
        };

        var pagina = await _usuarioRepository.GetAllAsync(normalizado);

        return Result<PaginaDto<UsuarioDto>>.Ok(pagina);
    }
}
