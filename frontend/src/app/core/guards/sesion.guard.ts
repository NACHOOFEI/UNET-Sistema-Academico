import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Impide entrar a las rutas privadas sin sesion iniciada.
 * Alcance minimo necesario para que la redireccion de UNET-M1-CU01 tenga sentido;
 * el manejo completo de sesion y expiracion se define en UNET-M1-CU03.
 */
export const sesionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.estaAutenticado() ? true : router.createUrlTree(['/ingresar']);
};
