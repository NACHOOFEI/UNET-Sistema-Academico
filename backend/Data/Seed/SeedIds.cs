namespace UNET.Data.Seed;

/// <summary>
/// GUIDs fijos para los datos de arranque (HasData). Deben ser constantes:
/// si cambian, EF Core los interpreta como una fila distinta en la proxima migracion.
/// </summary>
public static class SeedIds
{
    public static readonly Guid RecursoRoles = new("6f1a1f2a-0000-4000-8000-000000000001");

    // Permiso = verbo generico, reutilizable a futuro sobre cualquier Recurso.
    public static readonly Guid PermisoVer = new("6f1a1f2a-0000-4000-8000-000000000002");
    public static readonly Guid PermisoCrear = new("6f1a1f2a-0000-4000-8000-000000000006");
    public static readonly Guid PermisoEditar = new("6f1a1f2a-0000-4000-8000-000000000007");
    public static readonly Guid PermisoEliminar = new("6f1a1f2a-0000-4000-8000-000000000008");

    // PermisoSobreRecurso = combinacion Verbo x Recurso "Roles", lo que se asigna a un Rol.
    public static readonly Guid PermisoSobreRecursoVerRoles = new("6f1a1f2a-0000-4000-8000-000000000003");
    public static readonly Guid PermisoSobreRecursoCrearRoles = new("6f1a1f2a-0000-4000-8000-000000000009");
    public static readonly Guid PermisoSobreRecursoEditarRoles = new("6f1a1f2a-0000-4000-8000-00000000000a");
    public static readonly Guid PermisoSobreRecursoEliminarRoles = new("6f1a1f2a-0000-4000-8000-00000000000b");

    public static readonly Guid RolAdministrador = new("6f1a1f2a-0000-4000-8000-000000000004");
    public static readonly Guid UsuarioAdmin = new("6f1a1f2a-0000-4000-8000-000000000005");
}
