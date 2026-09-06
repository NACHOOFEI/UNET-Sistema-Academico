using UNET.Data.Dtos.Auth;

namespace UNET.Services;

public interface IAuthService
{
    Task<LoginResultDto> IniciarSesionAsync(LoginRequestDto request);
}
