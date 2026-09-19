/** Un panel/pantalla del sistema, visible solo para quien tenga el permiso indicado. */
export interface Panel {
  /** Codigo de PermisoSobreRecurso que habilita ver este panel (ej. "ver_roles"). */
  permiso: string;
  etiqueta: string;
  descripcion: string;
  ruta: string;
}
