using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace UNET.Services;

public interface IJwtTokenGenerator
{
    (string Token, DateTime Expiracion) Generar(
        UNET.Data.Entities.Usuario usuario,
        IEnumerable<string> roles,
        IEnumerable<string> permisos);
}

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtOptions _opciones;

    public JwtTokenGenerator(IOptions<JwtOptions> opciones)
    {
        _opciones = opciones.Value;
    }

    public (string Token, DateTime Expiracion) Generar(
        UNET.Data.Entities.Usuario usuario,
        IEnumerable<string> roles,
        IEnumerable<string> permisos)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, usuario.Legajo),
            new("legajo", usuario.Legajo)
        };

        claims.AddRange(roles.Select(rol => new Claim("rol", rol)));
        claims.AddRange(permisos.Select(permiso => new Claim("permiso", permiso)));

        var expiracion = DateTime.UtcNow.AddMinutes(_opciones.ExpirationMinutes);
        var credenciales = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opciones.SigningKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _opciones.Issuer,
            audience: _opciones.Audience,
            claims: claims,
            expires: expiracion,
            signingCredentials: credenciales);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiracion);
    }
}
