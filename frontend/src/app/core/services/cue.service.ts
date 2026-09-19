import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

/**
 * Consulta del CUE de un establecimiento educativo - apoyo de UNET-M3-CU10.
 *
 * El padron oficial se consulta por API externa. Mientras esa integracion no
 * existe, se resuelve contra un padron de prueba: la busqueda necesita nombre
 * de la institucion, pais, provincia y ciudad, igual que el servicio real.
 */

export interface ConsultaCue {
  institucion: string;
  pais: string;
  provincia: string;
  ciudad: string;
}

export interface EstablecimientoCue {
  cue: string;
  nombre: string;
  provincia: string;
  ciudad: string;
}

/** Padron de prueba. Se elimina al conectar la API del padron educativo. */
const PADRON_MOCK: EstablecimientoCue[] = [
  {
    cue: '060123400',
    nombre: 'Escuela Normal Superior N 3',
    provincia: 'Buenos Aires',
    ciudad: 'San Miguel'
  },
  {
    cue: '060987600',
    nombre: 'Instituto Técnico Regional',
    provincia: 'Buenos Aires',
    ciudad: 'Morón'
  },
  {
    cue: '020445500',
    nombre: 'Colegio Nacional de Buenos Aires',
    provincia: 'Ciudad Autónoma de Buenos Aires',
    ciudad: 'Ciudad Autónoma de Buenos Aires'
  },
  {
    cue: '140332200',
    nombre: 'Escuela Provincial de Comercio N 1',
    provincia: 'Córdoba',
    ciudad: 'Córdoba'
  }
];

@Injectable({ providedIn: 'root' })
export class CueService {
  private static readonly LATENCIA_SIMULADA_MS = 800;

  /**
   * Devuelve los establecimientos que coinciden con la consulta.
   * Arreglo vacio cuando no hay coincidencias: el postulante puede cargar el
   * CUE a mano o seguir sin el, porque el campo no es obligatorio.
   */
  buscar(consulta: ConsultaCue): Observable<EstablecimientoCue[]> {
    const institucion = this.normalizar(consulta.institucion);
    const provincia = this.normalizar(consulta.provincia);
    const ciudad = this.normalizar(consulta.ciudad);

    const resultados = PADRON_MOCK.filter(
      (establecimiento) =>
        this.normalizar(establecimiento.nombre).includes(institucion) &&
        this.normalizar(establecimiento.provincia) === provincia &&
        this.normalizar(establecimiento.ciudad) === ciudad
    );

    return of(resultados).pipe(delay(CueService.LATENCIA_SIMULADA_MS));
  }

  /** Compara sin acentos, sin mayusculas y sin espacios sobrantes. */
  private normalizar(valor: string): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase();
  }
}
