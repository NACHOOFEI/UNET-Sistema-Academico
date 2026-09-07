/** Espejo de backend/Data/Dtos/Rol/RolDto.cs. */
export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  permisosSobreRecurso: string[];
}

/** Espejo de CreateRolDto/UpdateRolDto - misma forma para alta y edicion. */
export interface RolPayload {
  nombre: string;
  descripcion: string | null;
  permisosSobreRecursoIds: string[];
}
