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
    title: 'Inicio | UNET',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./features/dashboard/inicio/inicio.component').then((m) => m.InicioComponent)
  },
  {
    path: 'accesos/roles',
    canActivate: [sesionGuard],
    children: [
      {
        path: '',
        title: 'Gestionar roles | UNET',
        loadComponent: () =>
          import('./features/accesos/roles/roles-list/roles-list.component').then(
            (m) => m.RolesListComponent
          )
      },
      {
        path: 'nuevo',
        title: 'Nuevo rol | UNET',
        loadComponent: () =>
          import('./features/accesos/roles/rol-form/rol-form.component').then((m) => m.RolFormComponent)
      },
      {
        path: ':id/editar',
        title: 'Editar rol | UNET',
        loadComponent: () =>
          import('./features/accesos/roles/rol-form/rol-form.component').then((m) => m.RolFormComponent)
      }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'ingresar' },
  { path: '**', redirectTo: 'ingresar' }
];
