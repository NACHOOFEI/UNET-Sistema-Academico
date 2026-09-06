namespace Backend.Data.Dtos.Auth;

public record LoginResultDto(bool Exito, AuthResponseDto? Auth, string? Motivo);
