using UNET.Authorization;
using UNET.Common;
using UNET.Data.Dtos.Usuario;
using UNET.Services;
using Microsoft.AspNetCore.Mvc;

namespace UNET.Controllers;

[ApiController]
[Route("api/usuarios")]
public class UsuarioController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly ILogger<UsuarioController> _logger;

    public UsuarioController(IUsuarioService usuarioService, ILogger<UsuarioController> logger)
    {
        _usuarioService = usuarioService;
        _logger = logger;
    }

    [HttpGet]
    [RequierePermiso("ver_usuarios")]
    public async Task<ActionResult<PaginaDto<UsuarioDto>>> GetAll([FromQuery] UsuarioFiltroDto filtro)
    {
        _logger.LogInformation(
            "Listando usuarios (estado {Estado}, pagina {Pagina}, busqueda {Busqueda})",
            filtro.Estado,
            filtro.Pagina,
            filtro.Busqueda ?? "-");

        try
        {
            var result = await _usuarioService.GetUsuariosAsync(filtro);
            return Ok(result.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error inesperado al listar los usuarios");
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { error_description = "Ocurrio un error al listar los usuarios." });
        }
    }
}
