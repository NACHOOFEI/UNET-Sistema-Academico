/**
 * Usuario autenticado. Los roles son nombres libres definidos en el modulo de
 * gestion de roles (M2) - no hay un set fijo, por eso son string[]. Los
 * permisos son los codigos de PermisoSobreRecurso (ej. "ver_roles", "crear_roles")
 * y son la unidad real de autorizacion: la navegacion se decide por permiso,
 * nunca por nombre de rol (ver core/navegacion/paneles-disponibles.ts).
 */
export interface Usuario {
  id: string;
  legajo: string;
  roles: string[];
  permisos: string[];
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
