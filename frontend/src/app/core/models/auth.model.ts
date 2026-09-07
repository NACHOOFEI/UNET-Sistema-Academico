/**
 * Formas que viajan por HTTP contra el backend (espejo de
 * backend/Data/Dtos/Auth, en camelCase por el serializador de ASP.NET Core).
 * No se exponen al resto de la app: `AuthService` las traduce a `Usuario`/`ResultadoLogin`.
 */
export interface LoginRequest {
  legajo: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuarioId: string;
  legajo: string;
  roles: string[];
  permisos: string[];
  expiracion: string;
}

export interface LoginResponse {
  exito: boolean;
  auth: AuthResponse | null;
  motivo: string | null;
}

/** Sesion persistida en localStorage para sobrevivir a un refresh de pagina. */
export interface SesionAlmacenada {
  token: string;
  usuarioId: string;
  legajo: string;
  roles: string[];
  permisos: string[];
  expiracion: string;
}
