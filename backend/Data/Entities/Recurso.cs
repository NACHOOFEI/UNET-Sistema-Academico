using UNET.Data.Enums;

namespace UNET.Data.Entities;

public class Recurso
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public RecursoTipo Tipo { get; set; }

    public ICollection<PermisoSobreRecurso> PermisosSobreRecurso { get; set; } = new List<PermisoSobreRecurso>();
}
