import { Progenitor, SolicitudInscripcion } from '../models/inscripcion.model';

/**
 * Solicitudes ya existentes al abrir la aplicacion.
 *
 * Sirven para dos cosas mientras no hay backend:
 * - probar el curso alternativo de solicitud duplicada (6.a);
 * - tener datos visibles en el dashboard de gestion (UNET-M3-CU01).
 *
 * Para reproducir el duplicado, inscribirse con documento 33444555 o con el
 * correo lucia.paz@correo.com.
 */
const PROGENITOR_VACIO: Progenitor = {
  apellidoNombre: '',
  fechaNacimiento: '',
  vive: '',
  nivelEstudios: '',
  trabajo: '',
  situacionLaboral: '',
  obraSocial: ''
};

export const SOLICITUDES_MOCK: SolicitudInscripcion[] = [
  {
    id: 1,
    codigo: 'INS-2026-000001',
    estado: 'pendiente',
    enviadaEl: '2026-03-02T13:45:00.000Z',
    personales: {
      apellido: 'Paz',
      nombre: 'Lucía',
      sexo: 'Femenino',
      identidadGenero: 'Femenino',
      tipoDocumento: 'DNI',
      numeroDocumento: '33444555',
      cuil: '27334445558',
      grupoSanguineo: 'O+',
      nacionalidad: 'Argentina',
      estadoCivil: 'Soltero/a',
      fechaNacimiento: '2007-05-14',
      paisNacimiento: 'Argentina',
      provinciaNacimiento: 'Buenos Aires',
      ciudadNacimiento: 'San Miguel',
      partidoNacimiento: 'San Miguel'
    },
    domicilio: {
      paisResidencia: 'Argentina',
      provinciaResidencia: 'Buenos Aires',
      ciudad: 'San Miguel',
      codigoPostal: '1663',
      calle: 'Rivadavia',
      numero: '1450',
      departamentoPiso: '3 B'
    },
    contacto: {
      emailPrincipal: 'lucia.paz@correo.com',
      emailAlternativo: 'lpaz.alt@correo.com',
      celular: '+54 11 5544 2211',
      telefonoFijo: ''
    },
    emergencia: {
      vinculo: 'Madre',
      nombreApellido: 'Silvia Paz',
      telefono: '011 4455 6677'
    },
    secundaria: {
      secundarioCompleto: 'si',
      anioEgreso: '2025',
      tituloSecundario: 'Bachiller en Economía',
      secundarioTecnico: 'no',
      cueColegio: '060123400',
      nombreColegio: 'Escuela Normal Superior N 3',
      paisColegio: 'Argentina',
      provinciaColegio: 'Buenos Aires',
      ciudadColegio: 'San Miguel'
    },
    laborales: {
      situacion: 'no-trabaja',
      empleador: '',
      puesto: '',
      cargaHoraria: '',
      ocupacion: 'Estudiante'
    },
    actividadFisica: 'Vóley',
    tecnologia: {
      accesoComputadora: 'si',
      lugarComputadora: 'Hogar',
      celularesEnHogar: 3,
      accesoInternet: 'si',
      lugarInternet: 'Hogar',
      usosInternet: { estudio: true, trabajo: false, tramites: true, redesSociales: true }
    },
    familia: {
      hijosACargo: 0,
      familiaresACargo: 0,
      padre: PROGENITOR_VACIO,
      madre: PROGENITOR_VACIO,
      hermanos: { cantidad: 1, edades: '12', actividades: 'Escuela primaria' }
    },
    vivienda: {
      tipo: 'Casa',
      condicion: 'Propia',
      traslado: 'Transporte público'
    },
    inscripcion: {
      carreraId: 'lsi',
      modalidad: 'Presencial',
      turno: 'Mañana'
    },
    documentos: {}
  },
  {
    id: 2,
    codigo: 'INS-2026-000002',
    estado: 'aprobada',
    enviadaEl: '2026-03-04T10:10:00.000Z',
    personales: {
      apellido: 'Sosa',
      nombre: 'Mateo',
      sexo: 'Masculino',
      identidadGenero: 'Masculino',
      tipoDocumento: 'DNI',
      numeroDocumento: '41222333',
      cuil: '20412223339',
      grupoSanguineo: 'A+',
      nacionalidad: 'Argentina',
      estadoCivil: 'Soltero/a',
      fechaNacimiento: '2004-11-02',
      paisNacimiento: 'Argentina',
      provinciaNacimiento: 'Buenos Aires',
      ciudadNacimiento: 'Morón',
      partidoNacimiento: 'Morón'
    },
    domicilio: {
      paisResidencia: 'Argentina',
      provinciaResidencia: 'Buenos Aires',
      ciudad: 'Morón',
      codigoPostal: '1708',
      calle: 'San Martín',
      numero: '820',
      departamentoPiso: ''
    },
    contacto: {
      emailPrincipal: 'mateo.sosa@correo.com',
      emailAlternativo: 'msosa.alt@correo.com',
      celular: '+54 11 4433 9876',
      telefonoFijo: '011 4629 1122'
    },
    emergencia: {
      vinculo: 'Padre',
      nombreApellido: 'Jorge Sosa',
      telefono: '011 4629 1122'
    },
    secundaria: {
      secundarioCompleto: 'si',
      anioEgreso: '2022',
      tituloSecundario: 'Técnico en Electrónica',
      secundarioTecnico: 'si',
      cueColegio: '060987600',
      nombreColegio: 'Instituto Técnico Regional',
      paisColegio: 'Argentina',
      provinciaColegio: 'Buenos Aires',
      ciudadColegio: 'Morón'
    },
    laborales: {
      situacion: 'trabaja',
      empleador: 'Servicios Norte SA',
      puesto: 'Soporte técnico',
      cargaHoraria: '21 a 30 hs',
      ocupacion: ''
    },
    actividadFisica: '',
    tecnologia: {
      accesoComputadora: 'si',
      lugarComputadora: 'Trabajo',
      celularesEnHogar: 2,
      accesoInternet: 'si',
      lugarInternet: 'Datos móviles',
      usosInternet: { estudio: true, trabajo: true, tramites: false, redesSociales: false }
    },
    familia: {
      hijosACargo: 0,
      familiaresACargo: 1,
      padre: PROGENITOR_VACIO,
      madre: PROGENITOR_VACIO,
      hermanos: { cantidad: 0, edades: '', actividades: '' }
    },
    vivienda: {
      tipo: 'Departamento',
      condicion: 'Alquilada',
      traslado: 'Moto'
    },
    inscripcion: {
      carreraId: 'tup',
      modalidad: 'Virtual',
      turno: 'Noche'
    },
    documentos: {}
  }
];
