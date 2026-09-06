using UNET.Data.Dtos.Auth;
using UNET.Repositories;

namespace UNET.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IUsuarioRepository usuarioRepository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _usuarioRepository = usuarioRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<LoginResultDto> IniciarSesionAsync(LoginRequestDto request)
    {
        var legajo = request.Legajo.Trim();
        var usuario = await _usuarioRepository.ObtenerPorLegajoConRolesYPermisosAsync(legajo);

        // Curso alternativo 3.a: credenciales incorrectas. Mensaje generico a proposito:
        // informar si el legajo existe permitiria enumerar usuarios del sistema.
        if (usuario is null || !PasswordHasher.Verify(request.Password, usuario.PasswordHash))
        {
            return new LoginResultDto(false, null, "credenciales-invalidas");
        }

        // Curso alternativo 4.a: usuario inactivo.
        if (!usuario.Activo)
        {
            return new LoginResultDto(false, null, "usuario-inactivo");
        }

        var roles = usuario.Roles.Select(r => r.Nombre).ToList();
        var permisos = usuario.Roles
            .SelectMany(r => r.PermisosSobreRecurso)
            .Select(p => p.Nombre)
            .Distinct()
            .ToList();

        var (token, expiracion) = _jwtTokenGenerator.Generar(usuario, roles, permisos);

        var auth = new AuthResponseDto(
            token,
            usuario.Id,
            usuario.Legajo,
            roles,
            expiracion);

        return new LoginResultDto(true, auth, null);
    }
}
