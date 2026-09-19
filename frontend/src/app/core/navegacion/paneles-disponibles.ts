import { Panel } from '../models/panel.model';

/**
 * Registro de paneles del sistema. Es el UNICO lugar que hay que tocar al
 * agregar una pantalla nueva - agregar o combinar ROLES (que solo asignan
 * permisos ya existentes de esta lista) no requiere tocar ningun codigo, el
 * menu de inicio se arma solo a partir de los permisos del usuario logueado.
 */
export const PANELES_DISPONIBLES: Panel[] = [
  {
    permiso: 'ver_roles',
    etiqueta: 'Gestionar roles',
    descripcion: 'Ver, crear, editar y eliminar los roles del sistema.',
    ruta: '/accesos/roles'
  }
];

/** Paneles visibles para un usuario, segun sus permisos. */
export function panelesPara(permisos: string[]): Panel[] {
  return PANELES_DISPONIBLES.filter((panel) => permisos.includes(panel.permiso));
}
