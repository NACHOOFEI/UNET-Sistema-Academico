using System.ComponentModel.DataAnnotations;

namespace UNET.Data.Dtos.Auth;

public record LoginRequestDto(
    [Required(ErrorMessage = "El legajo es obligatorio.")] string Legajo,
    [Required(ErrorMessage = "La contrasena es obligatoria.")] string Password);
