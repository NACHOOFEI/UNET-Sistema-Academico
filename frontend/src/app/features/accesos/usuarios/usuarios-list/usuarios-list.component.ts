import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import { EstadoUsuario, Usuario, UsuarioFiltro } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';

const TAMANO_PAGINA = 20;

/** Espera antes de consultar mientras se escribe, para no pegarle al backend por tecla. */
const ESPERA_BUSQUEDA_MS = 300;

/**
 * Pantalla de Usuarios: listado con busqueda y filtro por estado.
 *
 * El filtrado, la busqueda y la paginacion se resuelven en el backend en una sola
 * consulta. Un unico input busca a la vez en legajo, email, nombre y apellido: con
 * el volumen esperado (miles de usuarios) un LIKE sobre esas cuatro columnas es
 * barato, y lo que realmente conviene evitar es renderizar la tabla completa.
 */
@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.css'
})
export class UsuariosListComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly textoBusqueda = signal('');
  readonly estado = signal<EstadoUsuario>('Activos');
  readonly pagina = signal(1);

  readonly usuarios = signal<Usuario[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);

  readonly estados: { valor: EstadoUsuario; etiqueta: string }[] = [
    { valor: 'Activos', etiqueta: 'Activos' },
    { valor: 'Inactivos', etiqueta: 'Inactivos' },
    { valor: 'Todos', etiqueta: 'Todos' }
  ];

  /** La columna Estado solo aporta cuando el listado mezcla activos e inactivos. */
  readonly muestraEstado = computed(() => this.estado() === 'Todos');

  readonly hayBusqueda = computed(() => this.textoBusqueda().trim().length > 0);

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / TAMANO_PAGINA)));
  readonly desde = computed(() => (this.total() === 0 ? 0 : (this.pagina() - 1) * TAMANO_PAGINA + 1));
  readonly hasta = computed(() => Math.min(this.pagina() * TAMANO_PAGINA, this.total()));
  readonly hayAnterior = computed(() => this.pagina() > 1);
  readonly haySiguiente = computed(() => this.pagina() < this.totalPaginas());

  /** Dispara una consulta con el filtro actual. */
  private readonly consulta$ = new Subject<void>();
  /** Texto tipeado, antes de la espera. */
  private readonly tecleo$ = new Subject<string>();

  ngOnInit(): void {
    // Una sola tuberia para todas las recargas: switchMap cancela la consulta anterior,
    // asi la respuesta de una busqueda vieja no puede sobreescribir a la actual.
    this.consulta$
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.errorCarga.set(null);
        }),
        switchMap(() =>
          this.usuarioService.obtenerUsuarios(this.filtroActual()).pipe(
            catchError(() => {
              this.errorCarga.set('No se pudieron cargar los usuarios. Intente nuevamente.');
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((pagina) => {
        this.cargando.set(false);
        this.usuarios.set(pagina?.items ?? []);
        this.total.set(pagina?.total ?? 0);
      });

    this.tecleo$
      .pipe(
        debounceTime(ESPERA_BUSQUEDA_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.pagina.set(1);
        this.consulta$.next();
      });

    this.consulta$.next();
  }

  buscar(texto: string): void {
    this.textoBusqueda.set(texto);
    this.tecleo$.next(texto);
  }

  limpiarBusqueda(): void {
    if (this.textoBusqueda() === '') {
      return;
    }

    this.textoBusqueda.set('');
    this.tecleo$.next('');
  }

  cambiarEstado(estado: EstadoUsuario): void {
    if (this.estado() === estado) {
      return;
    }

    this.estado.set(estado);
    this.pagina.set(1);
    this.consulta$.next();
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.pagina()) {
      return;
    }

    this.pagina.set(pagina);
    this.consulta$.next();
  }

  /** Nombre y apellido de la persona asociada, o null si el usuario no tiene una. */
  nombreCompleto(usuario: Usuario): string | null {
    const partes = [usuario.nombre, usuario.apellido].filter((parte): parte is string => !!parte);
    return partes.length > 0 ? partes.join(' ') : null;
  }

  private filtroActual(): UsuarioFiltro {
    return {
      busqueda: this.textoBusqueda(),
      estado: this.estado(),
      pagina: this.pagina(),
      tamanoPagina: TAMANO_PAGINA
    };
  }
}
