import {
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Opcion } from '../../../core/models/inscripcion.model';

/**
 * Selector desplegable propio.
 *
 * Reemplaza al <select> nativo: las <option> las dibuja el sistema operativo y
 * no admiten estilos, asi que la lista se construye con marcado propio para que
 * se vea igual en todos los navegadores. Se comporta como un combobox de la
 * especificacion ARIA (rol combobox + listbox) y se usa como control de
 * formulario reactivo, igual que el nativo.
 *
 * Con [buscable]="true" agrega un cuadro de busqueda dentro del panel, para
 * listas largas como paises o nacionalidades.
 */
@Component({
  selector: 'app-selector',
  imports: [],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorComponent),
      multi: true
    }
  ],
  host: {
    '(document:click)': 'alClicEnDocumento($event)',
    '(keydown.escape)': 'cerrar()'
  }
})
export class SelectorComponent implements ControlValueAccessor {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly opciones = input.required<Opcion[]>();
  readonly idControl = input.required<string>();
  readonly placeholder = input('Seleccione una opción');
  readonly buscable = input(false);
  readonly invalido = input(false);

  private readonly campoBusqueda = viewChild<ElementRef<HTMLInputElement>>('busqueda');
  private readonly disparador = viewChild<ElementRef<HTMLButtonElement>>('disparador');

  readonly abierto = signal(false);
  readonly valor = signal('');
  readonly filtro = signal('');
  readonly deshabilitado = signal(false);

  /** Opcion sobre la que esta el teclado; -1 cuando no hay ninguna. */
  readonly resaltada = signal(-1);

  readonly visibles = computed(() => {
    const texto = this.filtro().trim().toLowerCase();

    if (!texto) {
      return this.opciones();
    }

    return this.opciones().filter((opcion) => opcion.etiqueta.toLowerCase().includes(texto));
  });

  readonly etiquetaActual = computed(
    () => this.opciones().find((opcion) => opcion.valor === this.valor())?.etiqueta ?? ''
  );

  private alCambiar: (valor: string) => void = () => {};
  private alTocar: () => void = () => {};

  get idLista(): string {
    return `${this.idControl()}-lista`;
  }

  idOpcion(indice: number): string {
    return `${this.idControl()}-opcion-${indice}`;
  }

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.alCambiar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  alternar(): void {
    this.abierto() ? this.cerrar() : this.abrir();
  }

  abrir(): void {
    if (this.deshabilitado()) {
      return;
    }

    this.abierto.set(true);
    this.filtro.set('');
    this.resaltada.set(this.visibles().findIndex((opcion) => opcion.valor === this.valor()));

    if (this.buscable()) {
      // El cuadro de busqueda recien existe cuando el panel esta en pantalla.
      setTimeout(() => this.campoBusqueda()?.nativeElement.focus());
    }
  }

  cerrar(): void {
    if (!this.abierto()) {
      return;
    }

    this.abierto.set(false);
    this.filtro.set('');
    this.resaltada.set(-1);
    this.alTocar();
  }

  elegir(opcion: Opcion): void {
    this.valor.set(opcion.valor);
    this.alCambiar(opcion.valor);
    this.cerrar();
    this.disparador()?.nativeElement.focus();
  }

  /** Vacia la seleccion; solo se ofrece cuando el campo no es obligatorio. */
  limpiar(evento: Event): void {
    evento.stopPropagation();

    this.valor.set('');
    this.alCambiar('');
    this.alTocar();
  }

  alEscribirBusqueda(evento: Event): void {
    this.filtro.set((evento.target as HTMLInputElement).value);
    this.resaltada.set(this.visibles().length > 0 ? 0 : -1);
  }

  /** Teclado del disparador y del cuadro de busqueda. */
  alPresionarTecla(evento: KeyboardEvent): void {
    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        this.abierto() ? this.mover(1) : this.abrir();
        break;

      case 'ArrowUp':
        evento.preventDefault();
        this.abierto() ? this.mover(-1) : this.abrir();
        break;

      case 'Home':
        if (this.abierto()) {
          evento.preventDefault();
          this.resaltada.set(0);
        }
        break;

      case 'End':
        if (this.abierto()) {
          evento.preventDefault();
          this.resaltada.set(this.visibles().length - 1);
        }
        break;

      case 'Enter':
        if (this.abierto()) {
          evento.preventDefault();
          const opcion = this.visibles()[this.resaltada()];

          if (opcion) {
            this.elegir(opcion);
          }
        } else {
          evento.preventDefault();
          this.abrir();
        }
        break;

      case ' ':
        if (!this.abierto()) {
          evento.preventDefault();
          this.abrir();
        }
        break;

      case 'Tab':
        this.cerrar();
        break;
    }
  }

  /** Un clic fuera del componente cierra el panel. */
  alClicEnDocumento(evento: MouseEvent): void {
    if (!this.abierto()) {
      return;
    }

    if (!this.host.nativeElement.contains(evento.target as Node)) {
      this.cerrar();
    }
  }

  private mover(paso: number): void {
    const total = this.visibles().length;

    if (total === 0) {
      return;
    }

    const actual = this.resaltada();
    const siguiente = actual < 0 ? 0 : (actual + paso + total) % total;

    this.resaltada.set(siguiente);
  }
}
