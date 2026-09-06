using Microsoft.AspNetCore.Authorization;

namespace UNET.Authorization;

public class PermisoHandler : AuthorizationHandler<PermisoRequirement>
{
    private const string TipoClaimPermiso = "permiso";

    private readonly ILogger<PermisoHandler> _logger;

    public PermisoHandler(ILogger<PermisoHandler> logger)
    {
        _logger = logger;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermisoRequirement requirement)
    {
        var usuario = context.User.Identity?.Name ?? "anonimo";
        var tienePermiso = context.User.Claims.Any(c => c.Type == TipoClaimPermiso && c.Value == requirement.Permiso);

        if (tienePermiso)
        {
            _logger.LogInformation("Autorizacion concedida: {Usuario} tiene el permiso {Permiso}", usuario, requirement.Permiso);
            context.Succeed(requirement);
        }
        else
        {
            _logger.LogWarning("Autorizacion denegada: {Usuario} no tiene el permiso {Permiso}", usuario, requirement.Permiso);
        }

        return Task.CompletedTask;
    }
}
