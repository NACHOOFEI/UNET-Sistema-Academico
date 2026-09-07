using UNET.Common;
using UNET.Data.Dtos.Rol;
using UNET.Repositories;

namespace UNET.Services;

public interface IRolService
{
    Task<Result<List<RolDto>>> GetRolesAsync();
    Task<Result<RolDto>> CreateRolAsync(CreateRolDto request);
    Task<Result<RolDto>> UpdateRolAsync(Guid rolId, UpdateRolDto request, Guid userId);
    Task<Result> DeleteRolAsync(Guid rolId, Guid userId);
}

public class RolService : IRolService
{
    private const string PermisoGestionRoles = "crear_gestionar_roles";

    private readonly IRolRepository _rolRepository;

    public RolService(IRolRepository rolRepository)
    {
        _rolRepository = rolRepository;
    }

    public async Task<Result<List<RolDto>>> GetRolesAsync()
    {
        var roles = await _rolRepository.GetAllAsync();
        return Result<List<RolDto>>.Ok(roles);
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

    public async Task<Result> DeleteRolAsync(Guid rolId, Guid userId)
    {
        if (await _rolRepository.EsUltimoRolConPermisoAsync(rolId, PermisoGestionRoles))
        {
            return Result.Fail("ultimo-rol-administracion");
        }

        if (!await _rolRepository.DeleteAsync(rolId, userId))
        {
            return Result.Fail("rol-no-encontrado");
        }

        return Result.Ok();
    }
}
