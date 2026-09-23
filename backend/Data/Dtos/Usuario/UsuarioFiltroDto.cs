using UNET.Data.Enums;

namespace UNET.Data.Dtos.Usuario;
public record UsuarioFiltroDto
{
    public string? Busqueda { get; init; }

    public EstadoUsuarioFiltro Estado { get; init; } = EstadoUsuarioFiltro.Activos;

    public int Pagina { get; init; } = 1;

    public int TamanoPagina { get; init; } = 20;
}
