using System.ComponentModel.DataAnnotations;

namespace UNET.Data.Dtos.Rol;

public record CreateRolDto(
    [Required(ErrorMessage = "El nombre es obligatorio.")] string Nombre,
    string? Descripcion,
    List<Guid> PermisosSobreRecursoIds);
