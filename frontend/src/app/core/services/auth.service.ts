import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { Credenciales, ResultadoLogin, Usuario } from '../models/usuario.model';
import { USUARIOS_MOCK } from '../mock/usuarios.mock';

/**
 * Servicio de autenticacion - UNET-M1-CU01 (Iniciar sesion).
 *
 * Hoy resuelve la validacion contra datos de prueba locales. Al integrar el
 * backend, solo cambia el cuerpo de iniciarSesion() por una llamada HTTP:
 * la firma y el resto de la aplicacion quedan igual.
 *
 * Fuera del alcance de este ticket:
 * - Cerrar sesion (UNET-M1-CU03)
 * - Recuperar contrasena (UNET-M1-CU02)
 * - Cambiar contrasena (UNET-M1-CU04)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Latencia simulada para que el estado de carga del formulario sea visible. */
  private static readonly LATENCIA_SIMULADA_MS = 600;

  private readonly usuarioActual = signal<Usuario | null>(null);

  /** Usuario autenticado, o null si no hay sesion iniciada. */
  readonly usuario = this.usuarioActual.asReadonly();

  readonly estaAutenticado = computed(() => this.usuarioActual() !== null);

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

    const encontrado = USUARIOS_MOCK.find(
      (usuario) => usuario.legajo === legajo && usuario.password === credenciales.password
    );

    if (!encontrado) {
      return this.responder({ exito: false, motivo: 'credenciales-invalidas' });
    }

    if (!encontrado.activo) {
      return this.responder({ exito: false, motivo: 'usuario-inactivo' });
    }

    const { password, ...usuario } = encontrado;
    this.usuarioActual.set(usuario);

    return this.responder({ exito: true, usuario });
  }

  private responder(resultado: ResultadoLogin): Observable<ResultadoLogin> {
    return of(resultado).pipe(delay(AuthService.LATENCIA_SIMULADA_MS));
  }
}
