namespace UNET.Data.Entities;

public class Persona
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;

    public Guid? UsuarioModificacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public bool Eliminado { get; set; }

    public Usuario? Usuario { get; set; }
}
