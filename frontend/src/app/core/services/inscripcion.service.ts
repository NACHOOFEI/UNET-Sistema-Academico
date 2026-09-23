import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import {
  Carrera,
  ResultadoSolicitud,
  SolicitudInscripcion,
  SolicitudInscripcionNueva
} from '../models/inscripcion.model';
import { CARRERAS_MOCK } from '../mock/carreras.mock';
import { SOLICITUDES_MOCK } from '../mock/solicitudes.mock';

/**
 * Servicio de inscripcion a carrera - UNET-M3-CU10.
 *
 * Mantiene la oferta academica y las solicitudes enviadas. Hoy resuelve todo
 * en memoria con datos de prueba; al integrar el backend cambian solo los
 * cuerpos de los metodos (GET /carreras y POST /solicitudes-inscripcion),
 * la firma que usa el formulario queda igual.
 *
 * Fuera del alcance de este ticket:
 * - Revisar y aprobar solicitudes (UNET-M3-CU01)
 * - Notificar por correo al postulante (M7)
 */
@Injectable({ providedIn: 'root' })
export class InscripcionService {
  /** Latencia simulada para que los estados de carga sean visibles. */
  private static readonly LATENCIA_SIMULADA_MS = 700;

  private readonly listado = signal<SolicitudInscripcion[]>([...SOLICITUDES_MOCK]);

  /** Solicitudes registradas. Lo consume el dashboard de gestion (CU01). */
  readonly solicitudes = this.listado.asReadonly();

  readonly pendientes = computed(() =>
    this.listado().filter((solicitud) => solicitud.estado === 'pendiente')
  );

  /** Oferta academica vigente para el selector del formulario. */
  obtenerCarreras(): Observable<Carrera[]> {
    return of([...CARRERAS_MOCK]).pipe(delay(InscripcionService.LATENCIA_SIMULADA_MS));
  }

  /** Oferta academica sin latencia, para pantallas publicas como la portada. */
  catalogo(): Carrera[] {
    return [...CARRERAS_MOCK];
  }

  carreraPorId(id: string): Carrera | undefined {
    return CARRERAS_MOCK.find((carrera) => carrera.id === id);
  }

  /**
   * Registra la solicitud en estado Pendiente con su fecha de envio.
   *
   * Validacion de negocio que resuelve el envio (6.a): no se duplica si ya hay
   * una solicitud pendiente con el mismo documento o el mismo correo.
   */
  enviarSolicitud(datos: SolicitudInscripcionNueva): Observable<ResultadoSolicitud> {
    const duplicada = this.buscarPendienteDuplicada(
      datos.personales.numeroDocumento,
      datos.contacto.emailPrincipal
    );

    if (duplicada) {
      return this.responder({
        exito: false,
        motivo: 'duplicada',
        codigoExistente: duplicada.codigo
      });
    }

    const id = this.listado().length + 1;

    const solicitud: SolicitudInscripcion = {
      ...datos,
      id,
      codigo: `INS-2026-${String(id).padStart(6, '0')}`,
      estado: 'pendiente',
      enviadaEl: new Date().toISOString()
    };

    this.listado.update((solicitudes) => [...solicitudes, solicitud]);

    return this.responder({ exito: true, solicitud });
  }

  /**
   * El documento y el correo se comparan normalizados porque el postulante
   * puede escribirlos con puntos, espacios o mayusculas distintas.
   */
  private buscarPendienteDuplicada(
    numeroDocumento: string,
    email: string
  ): SolicitudInscripcion | undefined {
    const documento = this.soloDigitos(numeroDocumento);
    const correo = email.trim().toLowerCase();

    return this.listado().find(
      (solicitud) =>
        solicitud.estado === 'pendiente' &&
        (this.soloDigitos(solicitud.personales.numeroDocumento) === documento ||
          solicitud.contacto.emailPrincipal.trim().toLowerCase() === correo)
    );
  }

  private soloDigitos(valor: string): string {
    return (valor ?? '').replace(/\D/g, '');
  }

  private responder(resultado: ResultadoSolicitud): Observable<ResultadoSolicitud> {
    return of(resultado).pipe(delay(InscripcionService.LATENCIA_SIMULADA_MS));
  }
}
