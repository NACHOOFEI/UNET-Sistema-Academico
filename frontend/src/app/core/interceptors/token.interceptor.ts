import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Agrega el JWT de la sesion a los pedidos dirigidos a la API.
 *
 * Solo firma las URL de la API propia: mandar el token a un tercero lo filtraria
 * fuera del sistema. El login queda afuera porque es el pedido que emite el token.
 */
export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const esApiPropia = peticion.url.startsWith(environment.apiUrl);
  const esLogin = peticion.url.endsWith('/auth/login');

  if (!esApiPropia || esLogin) {
    return siguiente(peticion);
  }

  const token = inject(AuthService).token();

  if (!token) {
    return siguiente(peticion);
  }

  return siguiente(
    peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  );
};
