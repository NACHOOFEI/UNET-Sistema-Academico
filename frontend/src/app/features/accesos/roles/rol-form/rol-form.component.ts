import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PermisoSobreRecurso } from '../models/permiso-sobre-recurso.model';
import { RolPayload } from '../models/rol.model';
import { RolService } from '../services/rol.service';
import { codigoErrorRol, mensajeErrorRol } from '../utils/rol-errores';

/** Fila de la matriz Recurso x Permiso que arma el formulario de rol. */
interface FilaPermiso {
  recursoNombre: string;
  celdas: { id: string; permisoNombre: string }[];
}

const LIMITE_DESCRIPCION = 250;

/**
 * UNET-M2-CU01 (Crear rol) y CU02 (Modificar rol) - mismo formulario para ambos.
 *
 * Flujo de "Permisos de rol" en dos pasos, tal como lo describe la
 * documentacion: primero se agrega un recurso (modulo/pantalla/entidad) y
 * recien ahi aparecen sus permisos (Ver/Crear/Editar/Eliminar) para tildar.
 * No se muestran de entrada los permisos de recursos que no se agregaron.
 */
@Component({
  selector: 'app-rol-form',
  imports: [ReactiveFormsModule],
  templateUrl: './rol-form.component.html',
  styleUrl: './rol-form.component.css'
})
export class RolFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rolService = inject(RolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly limiteDescripcion = LIMITE_DESCRIPCION;

  private readonly rolId = this.route.snapshot.paramMap.get('id');
  readonly esEdicion = this.rolId !== null;

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly errorGuardar = signal<string | null>(null);

  /** Catalogo completo, agrupado por recurso. */
  private readonly filasPermisos = signal<FilaPermiso[]>([]);
  /** Recursos que el usuario agrego a este rol (paso 1). */
  private readonly recursosAgregados = signal<ReadonlySet<string>>(new Set());
  /** Ids de PermisoSobreRecurso tildados (paso 2, solo dentro de recursos agregados). */
  private readonly permisosSeleccionados = signal<ReadonlySet<string>>(new Set());

  readonly recursosDisponibles = computed(() => {
    const agregados = this.recursosAgregados();
    return this.filasPermisos()
      .map((fila) => fila.recursoNombre)
      .filter((nombre) => !agregados.has(nombre));
  });

  readonly filasAgregadas = computed(() => {
    const agregados = this.recursosAgregados();
    return this.filasPermisos().filter((fila) => agregados.has(fila.recursoNombre));
  });

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.maxLength(LIMITE_DESCRIPCION)]]
  });

  get nombre() {
    return this.formulario.controls.nombre;
  }

  campoInvalido(control: { invalid: boolean; touched: boolean; dirty: boolean }): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  ngOnInit(): void {
    this.rolService.obtenerPermisosSobreRecurso().subscribe({
      next: (catalogo) => {
        this.filasPermisos.set(this.agruparPorRecurso(catalogo));

        if (this.esEdicion) {
          this.cargarRolExistente(catalogo);
        } else {
          this.cargando.set(false);
        }
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el catalogo de permisos.');
        this.cargando.set(false);
      }
    });
  }

  agregarRecurso(nombre: string): void {
    if (!nombre) {
      return;
    }

    this.recursosAgregados.update((actuales) => new Set(actuales).add(nombre));
  }

  quitarRecurso(recursoNombre: string): void {
    const fila = this.filasPermisos().find((f) => f.recursoNombre === recursoNombre);
    const idsDelRecurso = new Set(fila?.celdas.map((celda) => celda.id) ?? []);

    this.recursosAgregados.update((actuales) => {
      const nuevos = new Set(actuales);
      nuevos.delete(recursoNombre);
      return nuevos;
    });

    this.permisosSeleccionados.update((actuales) => {
      const nuevos = new Set(actuales);
      for (const id of idsDelRecurso) {
        nuevos.delete(id);
      }
      return nuevos;
    });
  }

  estaSeleccionado(id: string): boolean {
    return this.permisosSeleccionados().has(id);
  }

  alternarPermiso(id: string): void {
    this.permisosSeleccionados.update((actuales) => {
      const nuevos = new Set(actuales);
      if (nuevos.has(id)) {
        nuevos.delete(id);
      } else {
        nuevos.add(id);
      }
      return nuevos;
    });
  }

  guardar(): void {
    this.errorGuardar.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const payload: RolPayload = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim() || null,
      permisosSobreRecursoIds: Array.from(this.permisosSeleccionados())
    };

    this.guardando.set(true);

    const peticion = this.esEdicion
      ? this.rolService.actualizarRol(this.rolId!, payload)
      : this.rolService.crearRol(payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        void this.router.navigate(['/accesos/roles']);
      },
      error: (error) => {
        this.guardando.set(false);
        this.errorGuardar.set(mensajeErrorRol(codigoErrorRol(error)));
      }
    });
  }

  cancelar(): void {
    void this.router.navigate(['/accesos/roles']);
  }

  private cargarRolExistente(catalogo: PermisoSobreRecurso[]): void {
    this.rolService.obtenerRoles().subscribe({
      next: (roles) => {
        const rol = roles.find((r) => r.id === this.rolId);
        if (!rol) {
          this.errorCarga.set('El rol ya no existe. Puede haber sido eliminado por otro usuario.');
          this.cargando.set(false);
          return;
        }

        this.formulario.patchValue({ nombre: rol.nombre, descripcion: rol.descripcion ?? '' });

        const permisosDelRol = catalogo.filter((permiso) => rol.permisosSobreRecurso.includes(permiso.nombre));

        this.permisosSeleccionados.set(new Set(permisosDelRol.map((permiso) => permiso.id)));
        this.recursosAgregados.set(new Set(permisosDelRol.map((permiso) => permiso.recursoNombre)));
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el rol.');
        this.cargando.set(false);
      }
    });
  }

  private agruparPorRecurso(catalogo: PermisoSobreRecurso[]): FilaPermiso[] {
    const mapa = new Map<string, FilaPermiso>();

    for (const item of catalogo) {
      if (!mapa.has(item.recursoNombre)) {
        mapa.set(item.recursoNombre, { recursoNombre: item.recursoNombre, celdas: [] });
      }
      mapa.get(item.recursoNombre)!.celdas.push({ id: item.id, permisoNombre: item.permisoNombre });
    }

    return Array.from(mapa.values());
  }
}
