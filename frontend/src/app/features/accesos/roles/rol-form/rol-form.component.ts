import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PermisoSobreRecurso } from '../models/permiso-sobre-recurso.model';
import { RolPayload } from '../models/rol.model';
import { RolService } from '../services/rol.service';
import { codigoErrorRol, mensajeErrorRol } from '../utils/rol-errores';

/** Nivel de acceso excluyente que el usuario asigna a cada recurso (estilo RBAC de Omada). */
type NivelAcceso = 'modificar' | 'ver' | 'bloquear';

/**
 * Un recurso (pantalla) del catalogo con los ids de PermisoSobreRecurso que
 * lo componen, separados para poder traducir el nivel elegido a la lista de
 * permisos granulares que espera el backend.
 */
interface FilaRecurso {
  recursoNombre: string;
  verId: string | null;
  todosLosIds: string[];
}

/** Nombre del permiso granular que representa la lectura. */
const PERMISO_VER = 'Ver';
const LIMITE_DESCRIPCION = 250;

/**
 * UNET-M2-CU01 (Crear rol) y CU02 (Modificar rol) - mismo formulario para ambos.
 *
 * "Permisos de rol" se presenta como una lista fija de recursos (pantallas),
 * cada uno con tres niveles de acceso mutuamente excluyentes al estilo del RBAC
 * de Omada: Modificar (acceso total), Solo ver (lectura) y Bloquear (sin acceso).
 * El backend sigue trabajando con permisos granulares (ver/crear/editar/eliminar),
 * asi que el nivel elegido se traduce a los ids correspondientes al guardar.
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

  /** Catalogo completo de recursos, siempre visible. */
  readonly filasRecurso = signal<FilaRecurso[]>([]);
  /** Nivel de acceso elegido por recurso; los ausentes se consideran "bloquear". */
  private readonly nivelesPorRecurso = signal<ReadonlyMap<string, NivelAcceso>>(new Map());

  /** Opciones del control segmentado, en el orden en que se muestran. */
  readonly niveles: { valor: NivelAcceso; etiqueta: string }[] = [
    { valor: 'modificar', etiqueta: 'Modificar' },
    { valor: 'ver', etiqueta: 'Solo ver' },
    { valor: 'bloquear', etiqueta: 'Bloquear' }
  ];

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
        this.filasRecurso.set(this.agruparPorRecurso(catalogo));

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

  nivelDe(recursoNombre: string): NivelAcceso {
    return this.nivelesPorRecurso().get(recursoNombre) ?? 'bloquear';
  }

  establecerNivel(recursoNombre: string, nivel: NivelAcceso): void {
    this.nivelesPorRecurso.update((actuales) => {
      const nuevos = new Map(actuales);
      nuevos.set(recursoNombre, nivel);
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
      permisosSobreRecursoIds: this.idsSeleccionados()
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

  /** Traduce el nivel de cada recurso a la lista de PermisoSobreRecurso que espera el backend. */
  private idsSeleccionados(): string[] {
    const ids: string[] = [];

    for (const fila of this.filasRecurso()) {
      const nivel = this.nivelDe(fila.recursoNombre);

      if (nivel === 'modificar') {
        ids.push(...fila.todosLosIds);
      } else if (nivel === 'ver' && fila.verId) {
        ids.push(fila.verId);
      }
    }

    return ids;
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

        const idsDelRol = new Set(
          catalogo
            .filter((permiso) => rol.permisosSobreRecurso.includes(permiso.nombre))
            .map((permiso) => permiso.id)
        );

        this.nivelesPorRecurso.set(this.derivarNiveles(idsDelRol));
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el rol.');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Deduce el nivel de cada recurso a partir de los permisos guardados:
   * algun permiso de escritura => Modificar, solo "Ver" => Solo ver, ninguno => Bloquear.
   */
  private derivarNiveles(idsDelRol: ReadonlySet<string>): ReadonlyMap<string, NivelAcceso> {
    const niveles = new Map<string, NivelAcceso>();

    for (const fila of this.filasRecurso()) {
      const asignados = fila.todosLosIds.filter((id) => idsDelRol.has(id));

      if (asignados.length === 0) {
        niveles.set(fila.recursoNombre, 'bloquear');
      } else if (asignados.length === 1 && asignados[0] === fila.verId) {
        niveles.set(fila.recursoNombre, 'ver');
      } else {
        niveles.set(fila.recursoNombre, 'modificar');
      }
    }

    return niveles;
  }

  private agruparPorRecurso(catalogo: PermisoSobreRecurso[]): FilaRecurso[] {
    const mapa = new Map<string, FilaRecurso>();

    for (const item of catalogo) {
      if (!mapa.has(item.recursoNombre)) {
        mapa.set(item.recursoNombre, { recursoNombre: item.recursoNombre, verId: null, todosLosIds: [] });
      }

      const fila = mapa.get(item.recursoNombre)!;
      fila.todosLosIds.push(item.id);
      if (item.permisoNombre === PERMISO_VER) {
        fila.verId = item.id;
      }
    }

    return Array.from(mapa.values());
  }
}
