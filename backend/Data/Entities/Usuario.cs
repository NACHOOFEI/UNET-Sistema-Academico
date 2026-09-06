namespace Backend.Data.Entities;

public class Usuario
{
    public Guid Id { get; set; }
    public string Legajo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;

    public ICollection<Rol> Roles { get; set; } = new List<Rol>();
}
