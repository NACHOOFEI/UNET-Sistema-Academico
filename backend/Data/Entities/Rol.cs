namespace UNET.Data.Entities;

public class Rol
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public Guid? ActualizadoPorUsuarioId { get; set; }
    public DateTime? FechaActualizacion { get; set; }

    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<PermisoSobreRecurso> PermisosSobreRecurso { get; set; } = new List<PermisoSobreRecurso>();
}
