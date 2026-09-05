namespace Backend.Data.Entities;

public class PermisoSobreRecurso
{
    public Guid Id { get; set; }

    /// <summary>Codigo unico, ej "leer_ver_usuarios". Es el valor que viaja en el claim "permiso" del JWT.</summary>
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public Guid PermisoId { get; set; }
    public Permiso Permiso { get; set; } = null!;

    public Guid RecursoId { get; set; }
    public Recurso Recurso { get; set; } = null!;

    public ICollection<Rol> Roles { get; set; } = new List<Rol>();
}
