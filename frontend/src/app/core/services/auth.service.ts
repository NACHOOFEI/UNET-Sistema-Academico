import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Credenciales,
  LoginRequestApi,
  LoginResultApi,
  MotivoFalloLogin,
  ResultadoLogin,
  Sesion,
  aUsuario
} from '../models/usuario.model';

/** Clave con la que se recuerda la sesion mientras dura la pestana. */
const CLAVE_SESION = 'unet.sesion';

/**
 * Sesion guardada en la pestana. Se usa para que recargar la pagina no expulse
 * al usuario. Devuelve null si no hay nada guardado, si el navegador bloquea el
 * almacenamiento o si el token ya vencio: un token vencido no sirve para pedir
 * datos, asi que arrancar con el equivale a no tener sesion.
 */
function leerSesionGuardada(): Sesion | null {
  try {
    const guardado = sessionStorage.getItem(CLAVE_SESION);

    if (!guardado) {
      return null;
    }

    const sesion = JSON.parse(guardado) as Sesion;
    return sesionVigente(sesion) ? sesion : null;
  } catch {
    return null;
  }
}

function sesionVigente(sesion: Sesion): boolean {
  const vence = new Date(sesion.expiracion).getTime();
  return !Number.isNaN(vence) && vence > Date.now();
}

/**
 * Traduce el motivo que informa la API. Un valor que el frontend no conoce se
 * trata como credenciales invalidas: es el mensaje generico y el mas seguro.
 */
function aMotivo(motivo: string | null): MotivoFalloLogin {
  return motivo === 'usuario-inactivo' ? 'usuario-inactivo' : 'credenciales-invalidas';
}

/**
 * Servicio de autenticacion - UNET-M1-CU01 (Iniciar sesion).
 *
 * Resuelve contra POST /api/auth/login. La API valida las credenciales y
 * devuelve un JWT junto con el legajo y los roles del usuario (AuthResponseDto).
 *
 * Fuera del alcance de este ticket:
 * - Recuperar contrasena (UNET-M1-CU02)
 * - Cerrar sesion completo (UNET-M1-CU03); aca solo esta cerrarSesion(),
 *   lo minimo para poder salir mientras dura la sesion recordada.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly sesionActual = signal<Sesion | null>(leerSesionGuardada());

  /** Usuario autenticado, o null si no hay sesion iniciada. */
  readonly usuario = computed(() => this.sesionActual()?.usuario ?? null);

  readonly estaAutenticado = computed(() => this.sesionActual() !== null);

  /** Token de la sesion vigente. Lo usa el interceptor para firmar los pedidos. */
  token(): string | null {
    return this.sesionActual()?.token ?? null;
  }

  /**
   * Valida las credenciales contra la API y, si son correctas, deja la sesion
   * iniciada.
   *
   * Cursos alternativos cubiertos:
   * - 3.a credenciales incorrectas (401)
   * - 4.a usuario inactivo (403)
   * - servicio no disponible: la API no responde o falla (0, 5xx)
   */
  iniciarSesion(credenciales: Credenciales): Observable<ResultadoLogin> {
    const cuerpo: LoginRequestApi = {
      legajo: credenciales.legajo.trim(),
      password: credenciales.password
    };

    return this.http
      .post<LoginResultApi>(`${environment.apiUrl}/auth/login`, cuerpo)
      .pipe(
        map((respuesta) => this.aResultado(respuesta)),
        catchError((error: HttpErrorResponse) => of(this.aResultadoDeError(error)))
      );
  }

  /** Termina la sesion y olvida al usuario recordado. */
  cerrarSesion(): void {
    this.sesionActual.set(null);

    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      // Sin almacenamiento disponible alcanza con limpiar el estado en memoria.
    }
  }

  private aResultado(respuesta: LoginResultApi): ResultadoLogin {
    if (!respuesta.exito || !respuesta.auth) {
      return { exito: false, motivo: aMotivo(respuesta.motivo) };
    }

    const sesion: Sesion = {
      usuario: aUsuario(respuesta.auth),
      token: respuesta.auth.token,
      expiracion: respuesta.auth.expiracion
    };

    this.guardarSesion(sesion);

    return { exito: true, sesion };
  }

  /**
   * El rechazo tambien llega como error HTTP: 401 para credenciales invalidas y
   * 403 para usuario inactivo, ambos con el LoginResultDto en el cuerpo.
   */
  private aResultadoDeError(error: HttpErrorResponse): ResultadoLogin {
    if (error.status === 401 || error.status === 403) {
      const cuerpo = error.error as LoginResultApi | null;

      return {
        exito: false,
        motivo: cuerpo?.motivo
          ? aMotivo(cuerpo.motivo)
          : error.status === 403
            ? 'usuario-inactivo'
            : 'credenciales-invalidas'
      };
    }

    return { exito: false, motivo: 'servicio-no-disponible' };
  }

  private guardarSesion(sesion: Sesion): void {
    this.sesionActual.set(sesion);

    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {
      // La sesion sigue valida en memoria aunque no se pueda recordar.
    }
  }
}
