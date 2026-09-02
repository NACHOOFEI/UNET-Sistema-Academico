import { Routes } from '@angular/router';

import { sesionGuard } from './core/guards/sesion.guard';

export const routes: Routes = [
  {
    path: 'ingresar',
    title: 'Iniciar sesion | UNET',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'inicio',
    canActivate: [sesionGuard],
    children: [
      {
        path: 'alumno',
        title: 'Portal del alumno | UNET',
        loadComponent: () =>
          import('./features/dashboard/inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'docente',
        title: 'Portal docente | UNET',
        loadComponent: () =>
          import('./features/dashboard/inicio/inicio.component').then((m) => m.InicioComponent)
      },
      {
        path: 'gestion',
        title: 'Portal de gestion | UNET',
        loadComponent: () =>
          import('./features/dashboard/inicio/inicio.component').then((m) => m.InicioComponent)
      }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'ingresar' },
  { path: '**', redirectTo: 'ingresar' }
];
