namespace UNET.Data.Dtos.Rol;

public record CreateRolResponseDto(bool Exito, RolDto? Rol, string? Motivo);
