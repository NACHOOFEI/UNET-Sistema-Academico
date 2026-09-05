using Microsoft.AspNetCore.Authorization;

namespace Backend.Authorization;

public class PermisoRequirement : IAuthorizationRequirement
{
    public string Permiso { get; }

    public PermisoRequirement(string permiso)
    {
        Permiso = permiso;
    }
}
