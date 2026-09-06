using UNET.Data.Dtos.Rol;

namespace UNET.Services;

public interface IRolService
{
    Task<CreateRolResponseDto> CreateRolAsync(CreateRolRequestDto request);
}
