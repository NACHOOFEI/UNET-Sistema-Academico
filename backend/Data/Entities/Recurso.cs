using Backend.Data.Enums;

namespace Backend.Data.Entities;

public class Recurso
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public RecursoTipo Tipo { get; set; }

    public ICollection<PermisoSobreRecurso> PermisosSobreRecurso { get; set; } = new List<PermisoSobreRecurso>();
}
