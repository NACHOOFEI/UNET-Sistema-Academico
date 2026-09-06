namespace UNET.Data.Dtos.Rol;

public record RolDto(Guid Id, string Nombre, string? Descripcion, List<string> PermisosSobreRecurso);
