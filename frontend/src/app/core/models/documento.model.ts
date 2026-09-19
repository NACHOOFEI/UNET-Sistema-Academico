/**
 * Modelo de carga de archivos - UNET-CUS2 (Cargar archivo).
 *
 * Es el caso de uso del que depende UNET-M3-CU10: define que se considera un
 * archivo valido, que devuelve el servicio de almacenamiento y como se informa
 * un rechazo. Queda en core/ porque otros modulos tambien adjuntan documentacion.
 */

/** Documento que el postulante debe o puede adjuntar a su solicitud. */
export interface RequisitoDocumental {
  id: string;
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
}

/** Motivos de rechazo previos a la subida (validacion local, curso alternativo 4.a). */
export type MotivoRechazoArchivo = 'tipo-invalido' | 'tamano-excedido' | 'archivo-vacio';

/** Archivo ya persistido por el servicio externo de almacenamiento. */
export interface ArchivoCargado {
  /** Identificador que devuelve el almacenamiento; es lo que viaja al backend. */
  id: string;
  nombre: string;
  /** Tamano en bytes. */
  tamano: number;
  /** MIME type informado por el navegador. */
  tipo: string;
  url: string;
  subidoEl: string;
}

/** Estado del control de carga de un requisito. */
export type EstadoCarga = 'vacio' | 'subiendo' | 'cargado' | 'error';

/** Ids de los documentos que intervienen en la inscripcion (UNET-M3-CU10). */
export const DOCUMENTO = {
  constanciaEstudios: 'constancia-estudios',
  dni: 'dni',
  constanciaCuil: 'constancia-cuil',
  actaNacimiento: 'acta-nacimiento',
  certificadoAnalitico: 'certificado-analitico'
} as const;

/** Constancia de estudios o analitico, dentro de educacion secundaria. */
export const REQUISITO_CONSTANCIA_ESTUDIOS: RequisitoDocumental = {
  id: DOCUMENTO.constanciaEstudios,
  nombre: 'Constancia de estudios / Analítico',
  descripcion: 'Documento emitido por el colegio secundario.',
  obligatorio: true
};

export const REQUISITO_DNI: RequisitoDocumental = {
  id: DOCUMENTO.dni,
  nombre: 'DNI (frente y dorso)',
  descripcion: 'Un único archivo con ambas caras del documento.',
  obligatorio: true
};

export const REQUISITO_CONSTANCIA_CUIL: RequisitoDocumental = {
  id: DOCUMENTO.constanciaCuil,
  nombre: 'Constancia de CUIL',
  descripcion: 'Constancia emitida por ANSES.',
  obligatorio: true
};

export const REQUISITO_ACTA_NACIMIENTO: RequisitoDocumental = {
  id: DOCUMENTO.actaNacimiento,
  nombre: 'Acta de nacimiento',
  descripcion: 'Partida o acta de nacimiento legible.',
  obligatorio: true
};

export const REQUISITO_CERTIFICADO_ANALITICO: RequisitoDocumental = {
  id: DOCUMENTO.certificadoAnalitico,
  nombre: 'Certificado analítico o constancia de título en trámite',
  descripcion: 'Analítico definitivo o constancia de título en trámite.',
  obligatorio: true
};

/** Documentacion general de la solicitud, en el orden en que se pide. */
export const REQUISITOS_DOCUMENTACION: RequisitoDocumental[] = [
  REQUISITO_DNI,
  REQUISITO_CONSTANCIA_CUIL,
  REQUISITO_ACTA_NACIMIENTO,
  REQUISITO_CERTIFICADO_ANALITICO
];

/** Mensaje que se le muestra al postulante cuando se rechaza un archivo. */
export function mensajeRechazoArchivo(
  motivo: MotivoRechazoArchivo,
  tiposPermitidos: string,
  tamanoMaximo: string
): string {
  switch (motivo) {
    case 'tipo-invalido':
      return `Formato no admitido. Se aceptan ${tiposPermitidos}.`;
    case 'tamano-excedido':
      return `El archivo supera el máximo de ${tamanoMaximo}. Cargue una versión más liviana.`;
    case 'archivo-vacio':
      return 'El archivo está vacío. Seleccione otro archivo.';
  }
}

/** Tamano legible para mostrar en pantalla (1.4 MB, 820 KB). */
export function formatearTamano(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
