using UNET.Authorization;
using UNET.Data.Dtos.Rol;
using UNET.Services;
using Microsoft.AspNetCore.Mvc;

namespace UNET.Controllers;

[ApiController]
[Route("api/roles")]
public class RolController : ApiControllerBase
{
    private readonly IRolService _rolService;
    private readonly ILogger<RolController> _logger;

    public RolController(IRolService rolService, ILogger<RolController> logger)
    {
        _rolService = rolService;
        _logger = logger;
    }

    [HttpGet]
    [RequierePermiso("crear_gestionar_roles")]
    public async Task<ActionResult<List<RolDto>>> GetAll()
    {
        _logger.LogInformation("Listando roles");

        try
        {
            var result = await _rolService.GetRolesAsync();
            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al listar los roles");
            return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrio un error al listar los roles.");
        }
    }

    [HttpPost]
    [RequierePermiso("crear_gestionar_roles")]
    public async Task<ActionResult<RolDto>> Create([FromBody] CreateRolDto request)
    {
        _logger.LogInformation("Creando rol {Nombre}", request.Nombre);

        try
        {
            var result = await _rolService.CreateRolAsync(request);

            if (result.IsFailure)
            {
                _logger.LogWarning("No se pudo crear el rol {Nombre}: {Error}", request.Nombre, result.Error);
                return Conflict(new { error_description = result.Error });
            }

            _logger.LogInformation("Rol {Nombre} creado con Id {RolId}", request.Nombre, result.Value!.Id);
            return StatusCode(StatusCodes.Status201Created, result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al crear el rol {Nombre}", request.Nombre);
            return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrio un error al crear el rol.");
        }
    }

    [HttpPut("{id:guid}")]
    [RequierePermiso("crear_gestionar_roles")]
    public async Task<ActionResult<RolDto>> Update(Guid id, [FromBody] UpdateRolDto request)
    {
        _logger.LogInformation("Actualizando rol {RolId}", id);

        var userId = GetUsuarioId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result = await _rolService.UpdateRolAsync(id, request, userId.Value);

            if (result.IsFailure)
            {
                _logger.LogWarning("No se pudo actualizar el rol {RolId}: {Error}", id, result.Error);

                if (result.Error == "rol-no-encontrado")
                {
                    return NotFound(new { error_description = result.Error });
                }

                return Conflict(new { error_description = result.Error });
            }

            _logger.LogInformation("Rol {RolId} actualizado por usuario {UsuarioId}", id, userId);
            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al actualizar el rol {RolId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrio un error al actualizar el rol.");
        }
    }

    [HttpDelete("{id:guid}")]
    [RequierePermiso("crear_gestionar_roles")]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Eliminando rol {RolId}", id);

        var userId = GetUsuarioId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result = await _rolService.DeleteRolAsync(id, userId.Value);

            if (result.IsFailure)
            {
                _logger.LogWarning("No se pudo eliminar el rol {RolId}: {Error}", id, result.Error);

                if (result.Error == "rol-no-encontrado")
                {
                    return NotFound(new { error_description = result.Error });
                }

                return Conflict(new { error_description = result.Error });
            }

            _logger.LogInformation("Rol {RolId} eliminado por usuario {UsuarioId}", id, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al eliminar el rol {RolId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrio un error al eliminar el rol.");
        }
    }
}
