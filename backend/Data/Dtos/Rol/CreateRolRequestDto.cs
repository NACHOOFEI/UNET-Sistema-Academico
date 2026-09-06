namespace UNET.Data.Dtos.Rol;

public record CreateRolRequestDto(string Nombre, string? Descripcion, List<Guid> PermisosSobreRecursoIds);
