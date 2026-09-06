namespace Backend.Data.Dtos.Auth;

public record AuthResponseDto(
    string Token,
    Guid UsuarioId,
    string Legajo,
    string Nombre,
    string Apellido,
    List<string> Roles,
    DateTime Expiracion);
