import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginResponse, SesionAlmacenada } from '../models/auth.model';
import { Credenciales, MotivoFalloLogin, ResultadoLogin, Usuario } from '../models/usuario.model';

/**
 * Servicio de autenticacion - UNET-M1-CU01 (Iniciar sesion).
 *
 * Habla contra el backend real (POST /api/auth/login) y persiste la sesion en
 * localStorage para que un refresh de pagina no obligue a volver a loguearse.
 *
 * Fuera del alcance de este ticket:
 * - Recuperar contrasena (UNET-M1-CU02)
 * - Cambiar contrasena (UNET-M1-CU04)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly CLAVE_SESION = 'unet_sesion';

  private readonly usuarioActual = signal<Usuario | null>(this.restaurarSesion());

  /** Usuario autenticado, o null si no hay sesion iniciada. */
  readonly usuario = this.usuarioActual.asReadonly();

  readonly estaAutenticado = computed(() => this.usuarioActual() !== null);

  constructor(private readonly http: HttpClient) {}

  /**
   * Valida las credenciales y, si son correctas y el usuario esta activo,
   * deja la sesion iniciada.
   *
   * Cursos alternativos cubiertos:
   * - 3.a credenciales incorrectas (401)
   * - 4.a usuario inactivo (403)
   * - servicio no disponible: la API no responde o falla (0, 5xx)
   */
  iniciarSesion(credenciales: Credenciales): Observable<ResultadoLogin> {
    const legajo = credenciales.legajo.trim();

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { legajo, password: credenciales.password })
      .pipe(
        map((respuesta) => this.procesarRespuesta(respuesta)),
        catchError((error: HttpErrorResponse) => of(this.procesarError(error)))
      );
  }

  /** Limpia la sesion actual (memoria + localStorage). */
  cerrarSesion(): void {
    localStorage.removeItem(AuthService.CLAVE_SESION);
    this.usuarioActual.set(null);
  }

  /** Token JWT de la sesion actual, o null si no hay sesion. Lo usa el interceptor HTTP. */
  obtenerToken(): string | null {
    return this.leerSesionAlmacenada()?.token ?? null;
  }

  private procesarRespuesta(respuesta: LoginResponse): ResultadoLogin {
    if (!respuesta.exito || !respuesta.auth) {
      return { exito: false, motivo: this.aMotivo(respuesta.motivo) };
    }

    const sesion: SesionAlmacenada = {
      token: respuesta.auth.token,
      usuarioId: respuesta.auth.usuarioId,
      legajo: respuesta.auth.legajo,
      roles: respuesta.auth.roles,
      permisos: respuesta.auth.permisos,
      expiracion: respuesta.auth.expiracion
    };

    localStorage.setItem(AuthService.CLAVE_SESION, JSON.stringify(sesion));

    const usuario = this.sesionAUsuario(sesion);
    this.usuarioActual.set(usuario);

    return { exito: true, usuario };
  }

  /**
   * El rechazo tambien puede llegar como error HTTP: 401 para credenciales
   * invalidas y 403 para usuario inactivo, ambos con el LoginResponse en el
   * cuerpo. Cualquier otra falla (sin respuesta, 5xx) se informa como servicio
   * no disponible.
   */
  private procesarError(error: HttpErrorResponse): ResultadoLogin {
    if (error.status === 401 || error.status === 403) {
      const cuerpo = error.error as LoginResponse | null;

      return {
        exito: false,
        motivo: cuerpo?.motivo
          ? this.aMotivo(cuerpo.motivo)
          : error.status === 403
            ? 'usuario-inactivo'
            : 'credenciales-invalidas'
      };
    }

    return { exito: false, motivo: 'servicio-no-disponible' };
  }

  /**
   * Traduce el motivo que informa la API. Un valor que el frontend no conoce se
   * trata como credenciales invalidas: es el mensaje generico y el mas seguro.
   */
  private aMotivo(motivo: string | null): MotivoFalloLogin {
    return motivo === 'usuario-inactivo' ? 'usuario-inactivo' : 'credenciales-invalidas';
  }

  private restaurarSesion(): Usuario | null {
    const sesion = this.leerSesionAlmacenada();
    if (!sesion) {
      return null;
    }

    if (new Date(sesion.expiracion).getTime() <= Date.now()) {
      localStorage.removeItem(AuthService.CLAVE_SESION);
      return null;
    }

    return this.sesionAUsuario(sesion);
  }

  private leerSesionAlmacenada(): SesionAlmacenada | null {
    const crudo = localStorage.getItem(AuthService.CLAVE_SESION);
    if (!crudo) {
      return null;
    }

    try {
      return JSON.parse(crudo) as SesionAlmacenada;
    } catch {
      localStorage.removeItem(AuthService.CLAVE_SESION);
      return null;
    }
  }

  private sesionAUsuario(sesion: SesionAlmacenada): Usuario {
    return { id: sesion.usuarioId, legajo: sesion.legajo, roles: sesion.roles, permisos: sesion.permisos };
  }
}
