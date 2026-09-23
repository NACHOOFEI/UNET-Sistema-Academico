namespace UNET.Common;

public record PaginaDto<T>(List<T> Items, int Total, int Pagina, int TamanoPagina);
