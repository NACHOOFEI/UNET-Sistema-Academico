import { ArchivoCargado } from './documento.model';

/**
 * Modelo de inscripcion a carrera - UNET-M3-CU10.
 *
 * Representa la solicitud que envia un pre-postulante (usuario sin cuenta) y
 * las opciones que ofrecen los selectores del formulario publico. Los nombres
 * acompanan a los de la API para que la integracion no requiera mapeos.
 */

/** Carrera ofertada en el ciclo lectivo vigente. */
export interface Carrera {
  id: string;
  nombre: string;
  titulo: string;
  duracionAnios: number;
  sede: string;
  /** Modalidades en las que se dicta; acota el selector de modalidad. */
  modalidades: Modalidad[];
  /** Requisito academico minimo, se muestra como ayuda en el formulario. */
  requisito: string;
}

export type Modalidad = 'Presencial' | 'Virtual';
export type SiNo = 'si' | 'no';

/** Estado del circuito de la solicitud. CU10 solo genera 'pendiente'. */
export type EstadoSolicitud = 'pendiente' | 'en-revision' | 'aprobada' | 'rechazada';

export interface DatosPersonales {
  apellido: string;
  nombre: string;
  sexo: string;
  identidadGenero: string;
  tipoDocumento: string;
  numeroDocumento: string;
  cuil: string;
  grupoSanguineo: string;
  nacionalidad: string;
  estadoCivil: string;
  fechaNacimiento: string;
  paisNacimiento: string;
  /** Solo se completa cuando el pais de nacimiento es Argentina. */
  provinciaNacimiento: string;
  ciudadNacimiento: string;
  /** Solo se completa cuando la provincia de nacimiento es Buenos Aires. */
  partidoNacimiento: string;
}

export interface Domicilio {
  paisResidencia: string;
  /** Solo se completa cuando el pais de residencia es Argentina. */
  provinciaResidencia: string;
  ciudad: string;
  codigoPostal: string;
  calle: string;
  numero: string;
  departamentoPiso: string;
}

export interface Contacto {
  emailPrincipal: string;
  emailAlternativo: string;
  celular: string;
  telefonoFijo: string;
}

export interface ContactoEmergencia {
  vinculo: string;
  nombreApellido: string;
  telefono: string;
}

export interface EducacionSecundaria {
  secundarioCompleto: SiNo;
  /** Solo se completa cuando el secundario esta completo. */
  anioEgreso: string;
  tituloSecundario: string;
  secundarioTecnico: SiNo;
  cueColegio: string;
  nombreColegio: string;
  paisColegio: string;
  provinciaColegio: string;
  ciudadColegio: string;
}

export type SituacionLaboral = 'trabaja' | 'no-trabaja';

export interface DatosLaborales {
  situacion: SituacionLaboral;
  /** Datos de quien trabaja. */
  empleador: string;
  puesto: string;
  cargaHoraria: string;
  /** Ocupacion declarada por quien no trabaja. */
  ocupacion: string;
}

export interface UsosInternet {
  estudio: boolean;
  trabajo: boolean;
  tramites: boolean;
  redesSociales: boolean;
}

export interface Tecnologia {
  accesoComputadora: SiNo;
  /** Solo se completa cuando hay acceso a computadora. */
  lugarComputadora: string;
  celularesEnHogar: number | null;
  accesoInternet: SiNo;
  /** Solo se completa cuando hay acceso a internet. */
  lugarInternet: string;
  usosInternet: UsosInternet;
}

/** Datos de un progenitor. Todos los campos son opcionales. */
export interface Progenitor {
  apellidoNombre: string;
  fechaNacimiento: string;
  vive: string;
  nivelEstudios: string;
  trabajo: string;
  situacionLaboral: string;
  obraSocial: string;
}

export interface Hermanos {
  cantidad: number | null;
  /** Edades separadas por comas, tal como las escribe el postulante. */
  edades: string;
  actividades: string;
}

export interface GrupoFamiliar {
  hijosACargo: number | null;
  familiaresACargo: number | null;
  padre: Progenitor;
  madre: Progenitor;
  hermanos: Hermanos;
}

export interface Vivienda {
  tipo: string;
  condicion: string;
  traslado: string;
}

export interface DatosInscripcion {
  carreraId: string;
  modalidad: string;
  turno: string;
}

/** Datos que el formulario entrega al servicio al enviar (paso 5). */
export interface SolicitudInscripcionNueva {
  personales: DatosPersonales;
  domicilio: Domicilio;
  contacto: Contacto;
  emergencia: ContactoEmergencia;
  secundaria: EducacionSecundaria;
  laborales: DatosLaborales;
  /** Deporte que practica; campo libre y opcional. */
  actividadFisica: string;
  tecnologia: Tecnologia;
  familia: GrupoFamiliar;
  vivienda: Vivienda;
  inscripcion: DatosInscripcion;
  /** Documentacion cargada via CUS2, indexada por id de requisito. */
  documentos: Record<string, ArchivoCargado>;
}

/** Solicitud ya registrada por el sistema. */
export interface SolicitudInscripcion extends SolicitudInscripcionNueva {
  id: number;
  /** Codigo visible para el postulante y para la gestion (CU01). */
  codigo: string;
  estado: EstadoSolicitud;
  enviadaEl: string;
}

/**
 * Motivos por los que el envio puede fallar.
 * - duplicada: curso alternativo 6.a (ya hay una pendiente con ese documento o correo).
 * - servicio-no-disponible: el backend no responde; se permite reintentar.
 */
export type MotivoFalloSolicitud = 'duplicada' | 'servicio-no-disponible';

export interface ResultadoSolicitud {
  exito: boolean;
  solicitud?: SolicitudInscripcion;
  motivo?: MotivoFalloSolicitud;
  /** Codigo de la solicitud activa que provoco el rechazo. */
  codigoExistente?: string;
}

/* ------------------------------------------------------------------
   Opciones de los selectores
   ------------------------------------------------------------------ */

export interface Opcion {
  valor: string;
  etiqueta: string;
}

/** Arma opciones cuyo valor coincide con la etiqueta. */
function opciones(...etiquetas: string[]): Opcion[] {
  return etiquetas.map((etiqueta) => ({ valor: etiqueta, etiqueta }));
}

/** Convierte una lista de textos en opciones de selector. */
export function aOpciones(valores: string[]): Opcion[] {
  return opciones(...valores);
}

export const SEXOS: Opcion[] = opciones('Masculino', 'Femenino');

export const IDENTIDADES_GENERO: Opcion[] = opciones(
  'Masculino',
  'Femenino',
  'No binario',
  'Prefiere no informar'
);

export const TIPOS_DOCUMENTO: Opcion[] = opciones('DNI', 'Pasaporte', 'LC', 'LE');

export const GRUPOS_SANGUINEOS: Opcion[] = opciones(
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-'
);

export const ESTADOS_CIVILES: Opcion[] = opciones(
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Unión convivencial'
);

export const VINCULOS_EMERGENCIA: Opcion[] = opciones(
  'Madre',
  'Padre',
  'Abuelo/a',
  'Tutor/a',
  'Otro'
);

export const SI_NO: Opcion[] = [
  { valor: 'si', etiqueta: 'Sí' },
  { valor: 'no', etiqueta: 'No' }
];

export const SITUACIONES_LABORALES: Opcion[] = [
  { valor: 'trabaja', etiqueta: 'Trabaja' },
  { valor: 'no-trabaja', etiqueta: 'No trabaja' }
];

export const CARGAS_HORARIAS: Opcion[] = opciones('Hasta 20 hs', '21 a 30 hs', 'Más de 30 hs');

export const OCUPACIONES: Opcion[] = opciones(
  'Estudiante',
  'Desocupado/a',
  'Ama de casa',
  'Otro'
);

export const LUGARES_COMPUTADORA: Opcion[] = opciones('Hogar', 'Trabajo', 'Escuela', 'Otro');

export const LUGARES_INTERNET: Opcion[] = opciones(
  'Hogar',
  'Datos móviles',
  'Espacio público',
  'Otro'
);

export const NIVELES_ESTUDIO: Opcion[] = opciones(
  'Primario incompleto',
  'Primario completo',
  'Secundario incompleto',
  'Secundario completo',
  'Terciario incompleto',
  'Terciario completo',
  'Universitario incompleto',
  'Universitario completo',
  'Posgrado'
);

export const SITUACIONES_LABORALES_FAMILIA: Opcion[] = opciones(
  'Trabaja',
  'Desocupado/a',
  'Jubilado/a',
  'Ama de casa',
  'Otro'
);

export const TIPOS_VIVIENDA: Opcion[] = opciones('Casa', 'Departamento', 'Otro');

export const CONDICIONES_VIVIENDA: Opcion[] = opciones('Propia', 'Alquilada', 'Prestada');

export const MEDIOS_TRASLADO: Opcion[] = opciones(
  'A pie',
  'Transporte público',
  'Bicicleta',
  'Moto',
  'Auto'
);

export const MODALIDADES: Opcion[] = opciones('Presencial', 'Virtual');

export const TURNOS: Opcion[] = opciones('Mañana', 'Tarde', 'Noche');

export const PROVINCIAS: string[] = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

/** Provincia que habilita el campo Partido en los datos de nacimiento. */
export const PROVINCIA_CON_PARTIDO = 'Buenos Aires';

/** Pais que habilita los campos de provincia. */
export const PAIS_LOCAL = 'Argentina';

export const PAISES: string[] = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Estados Unidos',
  'Guatemala',
  'Haití',
  'Honduras',
  'Italia',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'Portugal',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro'
];

export const NACIONALIDADES: string[] = [
  'Argentina',
  'Boliviana',
  'Brasileña',
  'Chilena',
  'Colombiana',
  'Costarricense',
  'Cubana',
  'Dominicana',
  'Ecuatoriana',
  'Española',
  'Estadounidense',
  'Guatemalteca',
  'Haitiana',
  'Hondureña',
  'Italiana',
  'Mexicana',
  'Nicaragüense',
  'Panameña',
  'Paraguaya',
  'Peruana',
  'Portuguesa',
  'Salvadoreña',
  'Uruguaya',
  'Venezolana',
  'Otra'
];

/** Anios de egreso ofrecidos, del mas reciente al mas antiguo. */
export function aniosDeEgreso(hasta: number = new Date().getFullYear() + 1): string[] {
  const anios: string[] = [];

  for (let anio = hasta; anio >= 1960; anio--) {
    anios.push(String(anio));
  }

  return anios;
}

/** Edad minima admitida para inscribirse sin autorizacion de un tutor. */
export const EDAD_MINIMA_INSCRIPCION = 16;

/** Edad cumplida a la fecha indicada. Devuelve null si la fecha no es valida. */
export function edadEnAnios(fechaNacimiento: string, hoy: Date = new Date()): number | null {
  const fecha = new Date(`${fechaNacimiento}T00:00:00`);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  let edad = hoy.getFullYear() - fecha.getFullYear();
  const cumplioEsteAnio =
    hoy.getMonth() > fecha.getMonth() ||
    (hoy.getMonth() === fecha.getMonth() && hoy.getDate() >= fecha.getDate());

  if (!cumplioEsteAnio) {
    edad -= 1;
  }

  return edad;
}
