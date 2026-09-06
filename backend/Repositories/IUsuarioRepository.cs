namespace UNET.Repositories;

public interface IUsuarioRepository
{
    Task<UNET.Data.Entities.Usuario?> ObtenerPorLegajoConRolesYPermisosAsync(string legajo);
}
