import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { Credenciales, ResultadoLogin, Usuario } from '../models/usuario.model';
import { USUARIOS_MOCK } from '../mock/usuarios.mock';

/** Clave con la que se recuerda la sesion mientras dura la pestana. */
const CLAVE_SESION = 'unet.sesion';

/**
 * Sesion guardada en la pestana. Se usa para que recargar la pagina no expulse
 * al usuario mientras se trabaja sin backend. Devuelve null si no hay nada
 * guardado o si el navegador bloquea el almacenamiento.
 */
function leerSesionGuardada(): Usuario | null {
  try {
    const guardado = sessionStorage.getItem(CLAVE_SESION);
    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  } catch {
    return null;
  }
}

/**
 * Servicio de autenticacion - UNET-M1-CU01 (Iniciar sesion).
 *
 * Resuelve la validacion contra datos de prueba locales (usuarios.mock.ts):
 * el frontend funciona completo sin backend. Al integrar la API, solo cambia
 * el cuerpo de iniciarSesion() por la llamada HTTP; la firma y el resto de la
 * aplicacion quedan igual.
 *
 * Fuera del alcance de este ticket:
 * - Recuperar contrasena (UNET-M1-CU02)
 * - Cerrar sesion completo (UNET-M1-CU03); aca solo esta cerrarSesion(),
 *   lo minimo para poder salir mientras se prueba con la sesion recordada.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Latencia simulada para que el estado de carga del formulario sea visible. */
  private static readonly LATENCIA_SIMULADA_MS = 600;

  private readonly usuarioActual = signal<Usuario | null>(leerSesionGuardada());

  /** Usuario autenticado, o null si no hay sesion iniciada. */
  readonly usuario = this.usuarioActual.asReadonly();

  readonly estaAutenticado = computed(() => this.usuarioActual() !== null);

  /**
   * Valida las credenciales y, si son correctas y el usuario esta activo,
   * deja la sesion iniciada.
   *
   * Se admite legajo o correo como identificador: con datos de prueba es
   * comun recordar el correo antes que el numero de legajo.
   *
   * Cursos alternativos cubiertos:
   * - 3.a credenciales incorrectas
   * - 4.a usuario inactivo
   */
  iniciarSesion(credenciales: Credenciales): Observable<ResultadoLogin> {
    const identificador = credenciales.legajo.trim().toLowerCase();

    const encontrado = USUARIOS_MOCK.find(
      (usuario) =>
        (usuario.legajo.toLowerCase() === identificador ||
          usuario.email.toLowerCase() === identificador) &&
        usuario.password === credenciales.password
    );

    if (!encontrado) {
      return this.responder({ exito: false, motivo: 'credenciales-invalidas' });
    }

    if (!encontrado.activo) {
      return this.responder({ exito: false, motivo: 'usuario-inactivo' });
    }

    const { password, ...usuario } = encontrado;
    this.guardarSesion(usuario);

    return this.responder({ exito: true, usuario });
  }

  /** Termina la sesion y olvida al usuario recordado. */
  cerrarSesion(): void {
    this.usuarioActual.set(null);

    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      // Sin almacenamiento disponible alcanza con limpiar el estado en memoria.
    }
  }

  private guardarSesion(usuario: Usuario): void {
    this.usuarioActual.set(usuario);

    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    } catch {
      // La sesion sigue valida en memoria aunque no se pueda recordar.
    }
  }

  private responder(resultado: ResultadoLogin): Observable<ResultadoLogin> {
    return of(resultado).pipe(delay(AuthService.LATENCIA_SIMULADA_MS));
  }
}
