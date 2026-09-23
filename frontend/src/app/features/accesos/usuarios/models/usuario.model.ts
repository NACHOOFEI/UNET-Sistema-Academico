/**
 * Espejo de backend/Data/Dtos/Usuario/UsuarioDto.cs. No confundir con el `Usuario`
 * de core/models/usuario.model.ts, que es el usuario de la sesion actual.
 */
export interface Usuario {
  id: string;
  legajo: string;
  nombre: string | null;
  apellido: string | null;
  email: string;
  activo: boolean;
  roles: string[];
}

/** Espejo del enum EstadoUsuarioFiltro del backend. */
export type EstadoUsuario = 'Activos' | 'Inactivos' | 'Todos';

/** Filtros que viajan como query string a GET /api/usuarios. */
export interface UsuarioFiltro {
  busqueda: string;
  estado: EstadoUsuario;
  pagina: number;
  tamanoPagina: number;
}
