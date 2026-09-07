namespace UNET.Data.Dtos.Rol;

public record UpdateRolData(
    string Nombre,
    string? Descripcion,
    List<Guid> PermisosSobreRecursoIds,
    Guid UsuarioEjecutorId);
