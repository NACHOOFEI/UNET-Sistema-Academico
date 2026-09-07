namespace UNET.Data.Dtos.Auth;

public record AuthResponseDto(
    string Token,
    Guid UsuarioId,
    string Legajo,
    List<string> Roles,
    List<string> Permisos,
    DateTime Expiracion);
