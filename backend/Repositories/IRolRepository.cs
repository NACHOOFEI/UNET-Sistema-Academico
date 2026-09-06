using UNET.Data.Entities;

namespace UNET.Repositories;

public interface IRolRepository
{
    Task<bool> ExisteNombreAsync(string nombre);
    Task<List<PermisoSobreRecurso>> GetPermisosSobreRecursoByIdsAsync(List<Guid> ids);
    Task<UNET.Data.Entities.Rol> CreateAsync(UNET.Data.Entities.Rol rol);
}
