using Microsoft.AspNetCore.Authorization;

namespace UNET.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequierePermisoAttribute : AuthorizeAttribute
{
    public RequierePermisoAttribute(string permiso) : base(permiso)
    {
    }
}
