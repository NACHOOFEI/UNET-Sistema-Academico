namespace UNET.Services;

public interface IJwtTokenGenerator
{
    (string Token, DateTime Expiracion) Generar(
        UNET.Data.Entities.Usuario usuario,
        IEnumerable<string> roles,
        IEnumerable<string> permisos);
}
