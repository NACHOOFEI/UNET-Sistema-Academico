import { Carrera } from '../models/inscripcion.model';

/**
 * Oferta academica de prueba mientras el backend no esta disponible.
 * Al integrar la API este archivo se elimina: el servicio pasa a pedir
 * GET /carreras con la misma forma de datos.
 */
export const CARRERAS_MOCK: Carrera[] = [
  {
    id: 'tup',
    nombre: 'Tecnicatura Universitaria en Programación',
    titulo: 'Técnico Universitario en Programación',
    duracionAnios: 2,
    sede: 'Sede Central',
    modalidades: ['Presencial', 'Virtual'],
    requisito: 'Secundario completo o en curso con egreso previsto en el ciclo.'
  },
  {
    id: 'lsi',
    nombre: 'Licenciatura en Sistemas de Información',
    titulo: 'Licenciado en Sistemas de Información',
    duracionAnios: 5,
    sede: 'Sede Central',
    modalidades: ['Presencial'],
    requisito: 'Secundario completo.'
  },
  {
    id: 'cpn',
    nombre: 'Contador Público Nacional',
    titulo: 'Contador Público Nacional',
    duracionAnios: 5,
    sede: 'Sede Norte',
    modalidades: ['Presencial'],
    requisito: 'Secundario completo.'
  },
  {
    id: 'adm',
    nombre: 'Licenciatura en Administración',
    titulo: 'Licenciado en Administración',
    duracionAnios: 4,
    sede: 'Sede Norte',
    modalidades: ['Presencial', 'Virtual'],
    requisito: 'Secundario completo.'
  },
  {
    id: 'enf',
    nombre: 'Licenciatura en Enfermería',
    titulo: 'Licenciado en Enfermería',
    duracionAnios: 5,
    sede: 'Sede Salud',
    modalidades: ['Presencial'],
    requisito: 'Secundario completo y apto psicofísico al momento de ingresar.'
  },
  {
    id: 'dis',
    nombre: 'Tecnicatura en Diseño Multimedial',
    titulo: 'Técnico en Diseño Multimedial',
    duracionAnios: 3,
    sede: 'Campus virtual',
    modalidades: ['Virtual'],
    requisito: 'Secundario completo o en curso.'
  }
];
