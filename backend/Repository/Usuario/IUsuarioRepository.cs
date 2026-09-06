namespace Backend.Repository.Usuario;

public interface IUsuarioRepository
{
    Task<Backend.Data.Entities.Usuario?> ObtenerPorLegajoConRolesYPermisosAsync(string legajo);
}
