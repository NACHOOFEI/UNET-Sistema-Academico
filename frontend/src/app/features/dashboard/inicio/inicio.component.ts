import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { panelesPara } from '../../../core/navegacion/paneles-disponibles';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Destino unico tras iniciar sesion (UNET-M1-CU01, paso 5).
 *
 * No decide una ruta segun el nombre del rol: muestra el menu de paneles
 * habilitados por los permisos del usuario (ver core/navegacion/paneles-disponibles.ts).
 * Agregar o combinar roles no requiere tocar este componente.
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.auth.usuario;

  readonly paneles = computed(() => panelesPara(this.usuario()?.permisos ?? []));

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigateByUrl('/ingresar');
  }
}
