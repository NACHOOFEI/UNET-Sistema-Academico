namespace Backend.Data.Dtos.Rol;

public record CrearRolRequestDto(string Nombre, string? Descripcion, List<Guid> PermisosSobreRecursoIds);
