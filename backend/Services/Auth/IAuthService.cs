using Backend.Data.Dtos.Auth;

namespace Backend.Services.Auth;

public interface IAuthService
{
    Task<LoginResultDto> IniciarSesionAsync(LoginRequestDto request);
}
