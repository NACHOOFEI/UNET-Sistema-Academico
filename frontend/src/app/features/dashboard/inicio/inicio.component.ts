import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { rolPrincipal } from '../../../core/models/usuario.model';

/**
 * Destino de la redireccion posterior al inicio de sesion (UNET-M1-CU01, paso 5).
 *
 * Es una pantalla minima de confirmacion: solo verifica que la sesion quedo
 * iniciada y que el usuario aterrizo en el portal de su rol. El contenido real
 * de cada dashboard corresponde a los modulos M3, M5 y M6.
 */
@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.auth.usuario;

  readonly nombreCompleto = computed(() => {
    const usuario = this.usuario();
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
  });

  readonly rol = computed(() => {
    const usuario = this.usuario();
    return usuario ? rolPrincipal(usuario.roles) : null;
  });

  readonly portal = computed(() => {
    switch (this.rol()) {
      case 'alumno':
        return 'Portal del alumno';
      case 'docente':
        return 'Portal docente';
      case 'administrativo':
      case 'administrador':
        return 'Portal de gestion';
      default:
        return 'Portal';
    }
  });

  /**
   * Sale del sistema. Minimo necesario ahora que la sesion se recuerda en la
   * pestana; el cierre de sesion completo corresponde a UNET-M1-CU03.
   */
  salir(): void {
    this.auth.cerrarSesion();
    void this.router.navigateByUrl('/auth');
  }
}
