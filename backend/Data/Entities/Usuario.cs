namespace UNET.Data.Entities;

public class Usuario
{
    public Guid Id { get; set; }
    public string Legajo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;

    public Guid? UsuarioModificacionId { get; set; }
    public DateTime? FechaModificacion { get; set; }

    public Guid? PersonaId { get; set; }
    public Persona? Persona { get; set; }

    public ICollection<Rol> Roles { get; set; } = new List<Rol>();
}
