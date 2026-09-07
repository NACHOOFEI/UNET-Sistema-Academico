namespace UNET.Data.Dtos.Permiso;

/// <summary>
/// Catalogo de PermisoSobreRecurso disponibles para asignar a un rol, con el
/// nombre del recurso y del permiso ya aplanados para que el frontend arme
/// la matriz Recurso x Permiso sin pegarle a mas de un endpoint.
/// </summary>
public record PermisoSobreRecursoDto(
    Guid Id,
    string Nombre,
    string RecursoNombre,
    string RecursoTipo,
    string PermisoNombre);
