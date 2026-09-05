namespace Backend.Data.Entities;

public class Permiso
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<PermisoSobreRecurso> PermisosSobreRecurso { get; set; } = new List<PermisoSobreRecurso>();
}
