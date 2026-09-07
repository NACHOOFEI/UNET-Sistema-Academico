import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { MotivoFalloLogin } from '../../../core/models/usuario.model';

/**
 * UNET-M1-CU01 - Iniciar sesion.
 *
 * Permite al usuario autenticarse con legajo y contrasena. Valida los campos,
 * verifica credenciales y estado de la cuenta, y redirige al dashboard que
 * corresponde a su rol.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Peticion en curso: bloquea el formulario y evita envios duplicados. */
  readonly enviando = signal(false);

  /** Mensaje de error del intento de ingreso. Null cuando no hay error. */
  readonly errorIngreso = signal<string | null>(null);

  readonly mostrarPassword = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    legajo: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    password: ['', [Validators.required]]
  });

  get legajo() {
    return this.formulario.controls.legajo;
  }

  get password() {
    return this.formulario.controls.password;
  }

  /** Un control muestra su error recien cuando el usuario interactuo con el. */
  campoInvalido(control: { invalid: boolean; touched: boolean; dirty: boolean }): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  alternarPassword(): void {
    this.mostrarPassword.update((visible) => !visible);
  }

  enviar(): void {
    this.errorIngreso.set(null);

    // Cursos alternativos 2.a (campos vacios) y 2.b (formato invalido).
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    this.auth.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: (resultado) => {
        this.enviando.set(false);

        if (!resultado.exito || !resultado.usuario) {
          this.errorIngreso.set(this.mensajeDeFallo(resultado.motivo));
          this.password.reset();
          return;
        }

        void this.router.navigateByUrl('/inicio');
      },
      error: () => {
        this.enviando.set(false);
        this.errorIngreso.set(
          'No se pudo conectar con el servidor. Intente nuevamente en unos minutos.'
        );
      }
    });
  }

  /**
   * Ante credenciales invalidas se devuelve un mensaje generico a proposito:
   * indicar si el legajo existe permitiria enumerar usuarios del sistema.
   */
  private mensajeDeFallo(motivo?: MotivoFalloLogin): string {
    if (motivo === 'usuario-inactivo') {
      return 'Su cuenta se encuentra inactiva. Comuniquese con la administracion academica.';
    }
    return 'El legajo o la contrasena son incorrectos.';
  }
}
