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
    // Destino tras iniciar sesion: los paneles se arman por permisos, no por rol.
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
  {
    path: 'accesos/usuarios',
    title: 'Usuarios | UNET',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./features/accesos/usuarios/usuarios-list/usuarios-list.component').then(
        (m) => m.UsuariosListComponent
      )
  },
  // Rutas anteriores, para que los enlaces ya repartidos sigan funcionando.
  { path: 'ingresar', redirectTo: 'auth' },
  { path: '**', redirectTo: '' }
];
