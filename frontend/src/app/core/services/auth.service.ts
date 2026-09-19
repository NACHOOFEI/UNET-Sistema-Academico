import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

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
   * - 3.a credenciales incorrectas
   * - 4.a usuario inactivo
   */
  iniciarSesion(credenciales: Credenciales): Observable<ResultadoLogin> {
    const legajo = credenciales.legajo.trim();

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { legajo, password: credenciales.password })
      .pipe(map((respuesta) => this.procesarRespuesta(respuesta)));
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
      return { exito: false, motivo: (respuesta.motivo as MotivoFalloLogin) ?? 'credenciales-invalidas' };
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
