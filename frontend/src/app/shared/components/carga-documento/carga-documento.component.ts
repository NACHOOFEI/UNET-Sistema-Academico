import { Component, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import {
  ArchivoCargado,
  EstadoCarga,
  RequisitoDocumental,
  formatearTamano,
  mensajeRechazoArchivo
} from '../../../core/models/documento.model';
import { AlmacenamientoService } from '../../../core/services/almacenamiento.service';

/**
 * Control de carga de un documento - UNET-CUS2 (Cargar archivo).
 *
 * Se usa como control de formulario reactivo: su valor es el ArchivoCargado que
 * devuelve el almacenamiento, o null si todavia no hay archivo. Asi el
 * formulario de inscripcion (UNET-M3-CU10) puede exigirlo con Validators.required
 * sin conocer el detalle de la subida.
 *
 * Cursos alternativos cubiertos:
 * - 4.a tipo o tamano invalido: se rechaza antes de subir y se pide otro archivo.
 * - 4.b falla el almacenamiento: se ofrece reintentar con el mismo archivo,
 *   sin tocar el resto del formulario.
 */
@Component({
  selector: 'app-carga-documento',
  imports: [],
  templateUrl: './carga-documento.component.html',
  styleUrl: './carga-documento.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CargaDocumentoComponent),
      multi: true
    }
  ]
})
export class CargaDocumentoComponent implements ControlValueAccessor {
  private readonly almacenamiento = inject(AlmacenamientoService);

  readonly requisito = input.required<RequisitoDocumental>();

  /** El formulario avisa que el requisito obligatorio quedo sin cargar. */
  readonly invalido = input(false);

  readonly estado = signal<EstadoCarga>('vacio');
  readonly archivo = signal<ArchivoCargado | null>(null);
  readonly mensajeError = signal<string | null>(null);
  readonly deshabilitado = signal(false);
  readonly arrastrando = signal(false);

  /**
   * Ultimo archivo elegido. Se conserva para poder reintentar la subida cuando
   * falla el almacenamiento, sin pedirle al postulante que lo vuelva a buscar.
   */
  private ultimoArchivo: File | null = null;

  readonly extensionesPermitidas = AlmacenamientoService.EXTENSIONES_PERMITIDAS;
  readonly tiposPermitidosTexto = this.almacenamiento.tiposPermitidosTexto;
  readonly tamanoMaximoTexto = this.almacenamiento.tamanoMaximoTexto;

  private alCambiar: (valor: ArchivoCargado | null) => void = () => {};
  private alTocar: () => void = () => {};

  /** True cuando el fallo admite reintento (paso 4.b), no cuando el archivo es invalido. */
  readonly permiteReintento = signal(false);

  get idInput(): string {
    return `archivo-${this.requisito().id}`;
  }

  get idError(): string {
    return `error-archivo-${this.requisito().id}`;
  }

  formatearTamano = formatearTamano;

  writeValue(valor: ArchivoCargado | null): void {
    this.archivo.set(valor);
    this.estado.set(valor ? 'cargado' : 'vacio');
    this.mensajeError.set(null);
    this.permiteReintento.set(false);
  }

  registerOnChange(fn: (valor: ArchivoCargado | null) => void): void {
    this.alCambiar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  alSeleccionar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    // Se limpia el input para que elegir dos veces el mismo archivo dispare el change.
    input.value = '';

    if (archivo) {
      this.procesar(archivo);
    }
  }

  alArrastrar(evento: DragEvent): void {
    if (this.deshabilitado()) {
      return;
    }

    evento.preventDefault();
    this.arrastrando.set(true);
  }

  alSalirDelArea(): void {
    this.arrastrando.set(false);
  }

  alSoltar(evento: DragEvent): void {
    if (this.deshabilitado()) {
      return;
    }

    evento.preventDefault();
    this.arrastrando.set(false);

    const archivo = evento.dataTransfer?.files?.[0];

    if (archivo) {
      this.procesar(archivo);
    }
  }

  reintentar(): void {
    if (this.ultimoArchivo) {
      this.subir(this.ultimoArchivo);
    }
  }

  quitar(): void {
    this.ultimoArchivo = null;
    this.archivo.set(null);
    this.estado.set('vacio');
    this.mensajeError.set(null);
    this.permiteReintento.set(false);
    this.alCambiar(null);
    this.alTocar();
  }

  /** Valida el archivo (4.a) y, si es aceptable, lo sube. */
  private procesar(archivo: File): void {
    this.alTocar();
    this.ultimoArchivo = archivo;

    const rechazo = this.almacenamiento.validar(archivo);

    if (rechazo) {
      this.ultimoArchivo = null;
      this.archivo.set(null);
      this.estado.set('error');
      this.permiteReintento.set(false);
      this.mensajeError.set(
        mensajeRechazoArchivo(rechazo, this.tiposPermitidosTexto, this.tamanoMaximoTexto)
      );
      this.alCambiar(null);
      return;
    }

    this.subir(archivo);
  }

  private subir(archivo: File): void {
    this.estado.set('subiendo');
    this.mensajeError.set(null);
    this.permiteReintento.set(false);

    this.almacenamiento.subir(archivo).subscribe({
      next: (cargado) => {
        this.archivo.set(cargado);
        this.estado.set('cargado');
        this.alCambiar(cargado);
      },
      // Curso alternativo 4.b: el archivo queda retenido para reintentar.
      error: () => {
        this.archivo.set(null);
        this.estado.set('error');
        this.permiteReintento.set(true);
        this.mensajeError.set(
          'No se pudo guardar el archivo. Reintente; el resto del formulario se conserva.'
        );
        this.alCambiar(null);
      }
    });
  }
}
