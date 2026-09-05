using Backend.Data.Dtos.Rol;

namespace Backend.Services.Rol;

public interface IRolService
{
    Task<CrearRolResponseDto> CrearRolAsync(CrearRolRequestDto request);
}
