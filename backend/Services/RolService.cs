using UNET.Data.Dtos.Rol;
using UNET.Repositories;

namespace UNET.Services;

public class RolService : IRolService
{
    private readonly IRolRepository _rolRepository;

    public RolService(IRolRepository rolRepository)
    {
        _rolRepository = rolRepository;
    }

    public async Task<CreateRolResponseDto> CreateRolAsync(CreateRolRequestDto request)
    {
        var nombre = request.Nombre.Trim();

        if (await _rolRepository.ExisteNombreAsync(nombre))
        {
            return new CreateRolResponseDto(false, null, "rol-ya-existente");
        }

        var permisosSobreRecurso = await _rolRepository.GetPermisosSobreRecursoByIdsAsync(request.PermisosSobreRecursoIds);

        var rol = new UNET.Data.Entities.Rol
        {
            Id = Guid.NewGuid(),
            Nombre = nombre,
            Descripcion = request.Descripcion,
            PermisosSobreRecurso = permisosSobreRecurso
        };

        var creado = await _rolRepository.CreateAsync(rol);

        var rolDto = new RolDto(
            creado.Id,
            creado.Nombre,
            creado.Descripcion,
            creado.PermisosSobreRecurso.Select(p => p.Nombre).ToList());

        return new CreateRolResponseDto(true, rolDto, null);
    }
}
