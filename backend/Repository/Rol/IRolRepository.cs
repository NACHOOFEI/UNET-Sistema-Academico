using Backend.Data.Entities;

namespace Backend.Repository.Rol;

public interface IRolRepository
{
    Task<bool> ExisteNombreAsync(string nombre);
    Task<List<PermisoSobreRecurso>> ObtenerPermisosSobreRecursoPorIdsAsync(List<Guid> ids);
    Task<Backend.Data.Entities.Rol> CrearAsync(Backend.Data.Entities.Rol rol);
}
