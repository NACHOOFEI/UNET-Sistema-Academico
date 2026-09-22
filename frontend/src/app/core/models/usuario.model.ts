/**
 * Roles del sistema. Coinciden con los actores definidos en la
 * documentacion del proyecto (alumno, docente, administrativo, administrador).
 * La gestion de roles como entidad editable corresponde al modulo M2.
 */
export type Rol = 'alumno' | 'docente' | 'administrativo' | 'administrador';

const ROLES_CONOCIDOS: readonly Rol[] = [
  'alumno',
  'docente',
  'administrativo',
  'administrador'
];

/**
 * Usuario autenticado, con los datos que devuelve la API al iniciar sesion.
 *
 * El backend responde unicamente el identificador, el legajo y los roles
 * (AuthResponseDto); el perfil completo (nombre, apellido, correo) todavia no
 * existe como entidad, asi que ninguna pantalla puede darlo por disponible.
 */
export interface Usuario {
  /** Guid que genera el backend. */
  id: string;
  legajo: string;
  roles: Rol[];
}

/** Sesion activa: el usuario mas el token con el que se firma cada pedido. */
export interface Sesion {
  usuario: Usuario;
  token: string;
  /** Vencimiento del token en formato ISO, tal como lo emite la API. */
  expiracion: string;
}

/** Credenciales que el usuario ingresa en el formulario de inicio de sesion. */
export interface Credenciales {
  legajo: string;
  password: string;
}

/**
 * Motivos por los que el inicio de sesion puede fallar.
 * Los dos primeros los informa la API; 'servicio-no-disponible' lo agrega el
 * frontend cuando no hay respuesta o el backend devuelve un error inesperado.
 */
export type MotivoFalloLogin =
  | 'credenciales-invalidas'
  | 'usuario-inactivo'
  | 'servicio-no-disponible';

export interface ResultadoLogin {
  exito: boolean;
  sesion?: Sesion;
  motivo?: MotivoFalloLogin;
}

/* ------------------------------------------------------------------
   Contrato de la API (backend/Data/Dtos/Auth)
   ------------------------------------------------------------------ */

/** Cuerpo que espera POST /api/auth/login (LoginRequestDto). */
export interface LoginRequestApi {
  legajo: string;
  password: string;
}

/** Datos de la sesion que devuelve la API (AuthResponseDto). */
export interface AuthResponseApi {
  token: string;
  usuarioId: string;
  legajo: string;
  roles: string[];
  expiracion: string;
}

/** Respuesta de POST /api/auth/login (LoginResultDto). */
export interface LoginResultApi {
  exito: boolean;
  auth: AuthResponseApi | null;
  motivo: string | null;
}

/**
 * Traduce un nombre de rol de la base al tipo Rol.
 *
 * Los roles se administran desde M2, asi que el nombre llega tal como lo
 * cargaron: se compara en minusculas y sin espacios. Un rol que no pertenece
 * a los cuatro actores del sistema se descarta en vez de romper la sesion.
 */
export function normalizarRol(nombre: string): Rol | null {
  const normalizado = nombre.trim().toLowerCase();
  return ROLES_CONOCIDOS.find((rol) => rol === normalizado) ?? null;
}

/** Arma el usuario de la aplicacion a partir de la respuesta de la API. */
export function aUsuario(auth: AuthResponseApi): Usuario {
  return {
    id: auth.usuarioId,
    legajo: auth.legajo,
    roles: (auth.roles ?? [])
      .map(normalizarRol)
      .filter((rol): rol is Rol => rol !== null)
  };
}

/** Ruta de inicio segun el rol principal del usuario. */
export function rutaInicioSegunRol(rol: Rol): string {
  switch (rol) {
    case 'alumno':
      return '/dashboard/alumno';
    case 'docente':
      return '/dashboard/docente';
    case 'administrativo':
    case 'administrador':
      return '/dashboard/gestion';
  }
}

/**
 * Rol con el que se decide el dashboard cuando el usuario tiene varios.
 * Se prioriza el de mayor alcance administrativo.
 */
export function rolPrincipal(roles: Rol[]): Rol {
  const prioridad: Rol[] = ['administrador', 'administrativo', 'docente', 'alumno'];
  return prioridad.find((rol) => roles.includes(rol)) ?? 'alumno';
}
