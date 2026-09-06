using Backend.Data.Dtos.Auth;
using Backend.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResultDto>> Login([FromBody] LoginRequestDto request)
    {
        _logger.LogInformation("Intento de inicio de sesion para el legajo {Legajo}", request.Legajo);

        try
        {
            var resultado = await _authService.IniciarSesionAsync(request);

            if (!resultado.Exito)
            {
                _logger.LogWarning("Inicio de sesion rechazado para el legajo {Legajo}: {Motivo}", request.Legajo, resultado.Motivo);

                return resultado.Motivo switch
                {
                    "usuario-inactivo" => StatusCode(StatusCodes.Status403Forbidden, resultado),
                    _ => Unauthorized(resultado)
                };
            }

            _logger.LogInformation("Inicio de sesion exitoso para el legajo {Legajo}", request.Legajo);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al iniciar sesion para el legajo {Legajo}", request.Legajo);
            return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrio un error al iniciar sesion.");
        }
    }
}
