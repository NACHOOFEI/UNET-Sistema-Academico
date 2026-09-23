/**
 * Espejo de backend/Data/Dtos/Permiso/PermisoSobreRecursoDto.cs.
 * El nombre del recurso y del permiso vienen aplanados para poder agrupar
 * por recurso y armar la matriz Recurso x Permiso (Ver/Crear/Editar/Eliminar)
 * en el formulario de rol.
 */
export interface PermisoSobreRecurso {
  id: string;
  nombre: string;
  recursoNombre: string;
  recursoTipo: string;
  permisoNombre: string;
}
