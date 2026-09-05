namespace Backend.Data.Dtos.Rol;

public record CrearRolResponseDto(bool Exito, RolDto? Rol, string? Motivo);
