namespace UNET.Data.Dtos.Usuario;

public record UsuarioDto(
    Guid Id,
    string Legajo,
    string? Nombre,
    string? Apellido,
    string Email,
    bool Activo,
    List<string> Roles);
