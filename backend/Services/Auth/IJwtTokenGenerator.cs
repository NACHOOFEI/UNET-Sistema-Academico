namespace Backend.Services.Auth;

public interface IJwtTokenGenerator
{
    (string Token, DateTime Expiracion) Generar(
        Backend.Data.Entities.Usuario usuario,
        IEnumerable<string> roles,
        IEnumerable<string> permisos);
}
