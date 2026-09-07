import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { Rol } from '../models/rol.model';
import { RolService } from '../services/rol.service';
import { codigoErrorRol, mensajeErrorRol } from '../utils/rol-errores';

/** UNET-M2-CU05 - Ver roles (con acceso a CU01 Crear, CU02 Modificar, CU03 Eliminar). */
@Component({
  selector: 'app-roles-list',
  imports: [RouterLink],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css'
})
export class RolesListComponent implements OnInit {
  private readonly rolService = inject(RolService);
  private readonly auth = inject(AuthService);

  private readonly permisos = computed(() => this.auth.usuario()?.permisos ?? []);
  readonly puedeCrear = computed(() => this.permisos().includes('crear_roles'));
  readonly puedeEditar = computed(() => this.permisos().includes('editar_roles'));
  readonly puedeEliminar = computed(() => this.permisos().includes('eliminar_roles'));

  readonly roles = signal<Rol[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  /** Rol pendiente de confirmacion de borrado (CU03). Null = modal cerrado. */
  readonly rolAEliminar = signal<Rol | null>(null);
  readonly eliminando = signal(false);
  readonly errorEliminar = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarRoles();
  }

  pedirEliminar(rol: Rol): void {
    this.errorEliminar.set(null);
    this.rolAEliminar.set(rol);
  }

  cancelarEliminar(): void {
    if (this.eliminando()) {
      return;
    }
    this.rolAEliminar.set(null);
  }

  confirmarEliminar(): void {
    const rol = this.rolAEliminar();
    if (!rol) {
      return;
    }

    this.eliminando.set(true);
    this.errorEliminar.set(null);

    this.rolService.eliminarRol(rol.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.rolAEliminar.set(null);
        this.roles.update((actuales) => actuales.filter((r) => r.id !== rol.id));
      },
      error: (error) => {
        this.eliminando.set(false);
        this.errorEliminar.set(mensajeErrorRol(codigoErrorRol(error)));
      }
    });
  }

  private cargarRoles(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.rolService.obtenerRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudieron cargar los roles. Intente nuevamente.');
        this.cargando.set(false);
      }
    });
  }
}
