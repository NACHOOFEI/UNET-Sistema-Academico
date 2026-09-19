import { Routes } from '@angular/router';

import { sesionGuard } from './core/guards/sesion.guard';

export const routes: Routes = [
  {
    // Portada institucional publica: punto de entrada del sistema.
    path: '',
    pathMatch: 'full',
    title: 'Universidad de San Nicolas',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent)
  },
  {
    path: 'auth',
    title: 'Iniciar sesion | USN',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    // UNET-M3-CU10: formulario publico, sin guard: lo usa gente sin cuenta.
    path: 'inscripcion',
    title: 'Inscripcion a carrera | USN',
    loadComponent: () =>
      import('./features/inscripcion/solicitud/solicitud-inscripcion.component').then(
        (m) => m.SolicitudInscripcionComponent
      )
  },
  {
    path: 'dashboard',
    canActivate: [sesionGuard],
    children: [
      {
        path: 'alumno',
        title: 'Portal del alumno | USN',
        loadComponent: () =>
          import('./features/dashboard/inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'docente',
        title: 'Portal docente | USN',
        loadComponent: () =>
          import('./features/dashboard/inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'gestion',
        title: 'Portal de gestion | USN',
        loadComponent: () =>
          import('./features/dashboard/inicio/inicio.component').then((m) => m.InicioComponent)
      }
    ]
  },
  // Rutas anteriores, para que los enlaces ya repartidos sigan funcionando.
  { path: 'ingresar', redirectTo: 'auth' },
  { path: 'inicio', redirectTo: 'dashboard' },
  { path: '**', redirectTo: '' }
];
