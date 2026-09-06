using UNET.Authorization;
using UNET.Data.Dtos.Rol;
using UNET.Services;
using Microsoft.AspNetCore.Mvc;

namespace UNET.Controllers;

[ApiController]
[Route("api/roles")]
public class RolController : ControllerBase
{
    private readonly IRolService _rolService;
    private readonly ILogger<RolController> _logger;

    public RolController(IRolService rolService, ILogger<RolController> logger)
    {
        _rolService = rolService;
        _logger = logger;
    }

    [HttpPost]
    [RequierePermiso("crear_gestionar_roles")]
    public async Task<ActionResult<CreateRolResponseDto>> Create([FromBody] CreateRolRequestDto request)
    {
        _logger.LogInformation("Creando rol {Nombre}", request.Nombre);

        try
        {
            var resultado = await _rolService.CreateRolAsync(request);

            if (!resultado.Exito)
            {
                _logger.LogWarning("No se pudo crear el rol {Nombre}: {Motivo}", request.Nombre, resultado.Motivo);
                return Conflict(resultado);
            }

            _logger.LogInformation("Rol {Nombre} creado con Id {RolId}", request.Nombre, resultado.Rol?.Id);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al crear el rol {Nombre}", request.Nombre);
            return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrio un error al crear el rol.");
        }
    }
}
