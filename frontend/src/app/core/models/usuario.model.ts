/**
 * Roles del sistema. Coinciden con los actores definidos en la
 * documentacion del proyecto (alumno, docente, administrativo, administrador).
 * La gestion de roles como entidad editable corresponde al modulo M2.
 */
export type Rol = 'alumno' | 'docente' | 'administrativo' | 'administrador';

export interface Usuario {
  id: number;
  legajo: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: Rol[];
  activo: boolean;
}

/** Credenciales que el usuario ingresa en el formulario de inicio de sesion. */
export interface Credenciales {
  legajo: string;
  password: string;
}

/**
 * Motivos por los que el inicio de sesion puede fallar.
 * Se distinguen internamente para poder registrar y actuar distinto,
 * aunque al usuario se le muestre un mensaje generico cuando corresponde.
 */
export type MotivoFalloLogin = 'credenciales-invalidas' | 'usuario-inactivo';

export interface ResultadoLogin {
  exito: boolean;
  usuario?: Usuario;
  motivo?: MotivoFalloLogin;
}

/** Ruta de inicio segun el rol principal del usuario. */
export function rutaInicioSegunRol(rol: Rol): string {
  switch (rol) {
    case 'alumno':
      return '/inicio/alumno';
    case 'docente':
      return '/inicio/docente';
    case 'administrativo':
    case 'administrador':
      return '/inicio/gestion';
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
