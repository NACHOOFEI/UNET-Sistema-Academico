namespace Backend.Data.Dtos.Rol;

public record RolDto(Guid Id, string Nombre, string? Descripcion, List<string> PermisosSobreRecurso);
