using UNET.Common;
using UNET.Data.Dtos.Rol;
using UNET.Repositories;

namespace UNET.Services;

public interface IRolService
{
    Task<Result<RolDto>> CreateRolAsync(CreateRolDto request);
    Task<Result<RolDto>> UpdateRolAsync(Guid rolId, UpdateRolDto request, Guid userId);
}

public class RolService : IRolService
{
    private readonly IRolRepository _rolRepository;

    public RolService(IRolRepository rolRepository)
    {
        _rolRepository = rolRepository;
    }

    public async Task<Result<RolDto>> CreateRolAsync(CreateRolDto request)
    {
        var nombre = request.Nombre.Trim();

        if (await _rolRepository.ExisteNombreAsync(nombre))
        {
            return Result<RolDto>.Fail("rol-ya-existente");
        }

        var creado = await _rolRepository.CreateAsync(request with { Nombre = nombre });

        return Result<RolDto>.Ok(creado);
    }

    public async Task<Result<RolDto>> UpdateRolAsync(Guid rolId, UpdateRolDto request, Guid userId)
    {
        var nombre = request.Nombre.Trim();

        if (await _rolRepository.ExisteOtroConNombreAsync(nombre, rolId))
        {
            return Result<RolDto>.Fail("rol-ya-existente");
        }

        var data = new UpdateRolData(nombre, request.Descripcion, request.PermisosSobreRecursoIds, userId);
        var actualizado = await _rolRepository.UpdateAsync(rolId, data);

        if (actualizado is null)
        {
            return Result<RolDto>.Fail("rol-no-encontrado");
        }

        return Result<RolDto>.Ok(actualizado);
    }
}
