import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import {
  ArchivoCargado,
  MotivoRechazoArchivo,
  formatearTamano
} from '../models/documento.model';

/**
 * Servicio de carga de archivos - UNET-CUS2 (Cargar archivo).
 *
 * Simula el servicio externo de almacenamiento: valida el archivo del lado del
 * cliente y devuelve el identificador con el que la solicitud lo referencia.
 * Al integrar el backend solo cambia el cuerpo de subir() por la llamada real
 * (multipart o URL prefirmada); validar() se mantiene porque la validacion
 * local evita subidas inutiles, sin reemplazar la del servidor.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenamientoService {
  static readonly TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
  static readonly EXTENSIONES_PERMITIDAS = '.pdf,.jpg,.jpeg,.png';
  static readonly TAMANO_MAXIMO_BYTES = 2 * 1024 * 1024;

  /** Latencia simulada para que el estado "Subiendo..." sea visible. */
  private static readonly LATENCIA_SIMULADA_MS = 900;

  /**
   * Nombre que fuerza un fallo del almacenamiento para poder probar el curso
   * alternativo 4.b (reintento sin rehacer el formulario). Se elimina junto
   * con la simulacion al conectar el servicio real.
   */
  private static readonly NOMBRE_QUE_FALLA = 'falla';

  private siguienteId = 1;

  readonly tiposPermitidosTexto = 'PDF, JPG y PNG';
  readonly tamanoMaximoTexto = formatearTamano(AlmacenamientoService.TAMANO_MAXIMO_BYTES);

  /** Valida tipo y tamano antes de subir. Null cuando el archivo es aceptable. */
  validar(archivo: File): MotivoRechazoArchivo | null {
    if (archivo.size === 0) {
      return 'archivo-vacio';
    }

    if (!AlmacenamientoService.TIPOS_PERMITIDOS.includes(archivo.type)) {
      return 'tipo-invalido';
    }

    if (archivo.size > AlmacenamientoService.TAMANO_MAXIMO_BYTES) {
      return 'tamano-excedido';
    }

    return null;
  }

  /**
   * Sube el archivo al almacenamiento y devuelve su referencia.
   * Falla con 'almacenamiento-no-disponible' cuando el servicio no responde;
   * el componente que la consume debe ofrecer reintentar (curso alternativo 4.b).
   */
  subir(archivo: File): Observable<ArchivoCargado> {
    if (archivo.name.toLowerCase().includes(AlmacenamientoService.NOMBRE_QUE_FALLA)) {
      return throwError(() => new Error('almacenamiento-no-disponible')).pipe(
        delay(AlmacenamientoService.LATENCIA_SIMULADA_MS)
      );
    }

    const cargado: ArchivoCargado = {
      id: `arch-${String(this.siguienteId++).padStart(6, '0')}`,
      nombre: archivo.name,
      tamano: archivo.size,
      tipo: archivo.type,
      // El backend devuelve la URL definitiva; aca alcanza con una referencia local.
      url: `about:blank#${encodeURIComponent(archivo.name)}`,
      subidoEl: new Date().toISOString()
    };

    return of(cargado).pipe(delay(AlmacenamientoService.LATENCIA_SIMULADA_MS));
  }
}
