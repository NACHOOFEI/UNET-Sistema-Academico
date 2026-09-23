import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';

import {
  ArchivoCargado,
  DOCUMENTO,
  REQUISITO_ACTA_NACIMIENTO,
  REQUISITO_CERTIFICADO_ANALITICO,
  REQUISITO_CONSTANCIA_CUIL,
  REQUISITO_CONSTANCIA_ESTUDIOS,
  REQUISITO_DNI
} from '../../../core/models/documento.model';
import {
  CARGAS_HORARIAS,
  CONDICIONES_VIVIENDA,
  Carrera,
  EDAD_MINIMA_INSCRIPCION,
  ESTADOS_CIVILES,
  GRUPOS_SANGUINEOS,
  IDENTIDADES_GENERO,
  LUGARES_COMPUTADORA,
  LUGARES_INTERNET,
  MEDIOS_TRASLADO,
  MODALIDADES,
  Modalidad,
  MotivoFalloSolicitud,
  NACIONALIDADES,
  NIVELES_ESTUDIO,
  OCUPACIONES,
  PAISES,
  PAIS_LOCAL,
  PROVINCIAS,
  PROVINCIA_CON_PARTIDO,
  SEXOS,
  SITUACIONES_LABORALES,
  SITUACIONES_LABORALES_FAMILIA,
  SI_NO,
  SolicitudInscripcion,
  SolicitudInscripcionNueva,
  TIPOS_DOCUMENTO,
  TIPOS_VIVIENDA,
  TURNOS,
  VINCULOS_EMERGENCIA,
  aOpciones,
  aniosDeEgreso
} from '../../../core/models/inscripcion.model';
import { CueService, EstablecimientoCue } from '../../../core/services/cue.service';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { CargaDocumentoComponent } from '../../../shared/components/carga-documento/carga-documento.component';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';
import {
  correosDistintos,
  edadMinima,
  fechaNoFutura
} from '../../../core/validators/inscripcion.validators';

/** Etapa del formulario: agrupa las secciones que se completan juntas. */
interface Paso {
  id: string;
  titulo: string;
  /** Grupos del formulario que se validan al pasar a la etapa siguiente. */
  grupos: string[];
}

/** Seccion del formulario, usada en el resumen de errores. */
interface Seccion {
  id: string;
  titulo: string;
  /** Grupo del formulario que agrupa sus campos. Null cuando son campos sueltos. */
  grupo: string | null;
}

/**
 * UNET-M3-CU10 - Inscripcion a carrera (formulario publico).
 *
 * Permite a un pre-postulante, sin cuenta ni sesion, enviar su solicitud de
 * inscripcion: datos personales, domicilio, contacto, contacto de emergencia,
 * educacion secundaria, CUE, datos laborales, tecnologia, grupo familiar,
 * vivienda, documentacion (via UNET-CUS2) y carrera elegida.
 *
 * Cursos alternativos cubiertos:
 * - 2.a campos vacios o con formato invalido: mensajes por campo y resumen,
 *   conservando todo lo ya cargado.
 * - 4.a y 4.b tipo/tamano invalido y fallo del almacenamiento: los resuelve el
 *   control de carga (CUS2), que permite reintentar sin rehacer el formulario.
 * - 6.a solicitud pendiente duplicada por documento o correo: se avisa y no se
 *   crea una nueva.
 *
 * Fuera del alcance de este ticket:
 * - Revisar la solicitud desde gestion (UNET-M3-CU01)
 * - Notificacion por correo al postulante (M7)
 */
@Component({
  selector: 'app-solicitud-inscripcion',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CargaDocumentoComponent, SelectorComponent],
  templateUrl: './solicitud-inscripcion.component.html',
  styleUrl: './solicitud-inscripcion.component.css'
})
export class SolicitudInscripcionComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly inscripcion = inject(InscripcionService);
  private readonly cue = inject(CueService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  /* ---------- Opciones de los selectores ---------- */
  readonly sexos = SEXOS;
  readonly identidadesGenero = IDENTIDADES_GENERO;
  readonly tiposDocumento = TIPOS_DOCUMENTO;
  readonly gruposSanguineos = GRUPOS_SANGUINEOS;
  readonly estadosCiviles = ESTADOS_CIVILES;
  readonly opcionesNacionalidades = aOpciones(NACIONALIDADES);
  readonly opcionesPaises = aOpciones(PAISES);
  readonly opcionesProvincias = aOpciones(PROVINCIAS);
  readonly vinculos = VINCULOS_EMERGENCIA;
  readonly siNo = SI_NO;
  readonly situacionesLaborales = SITUACIONES_LABORALES;
  readonly cargasHorarias = CARGAS_HORARIAS;
  readonly ocupaciones = OCUPACIONES;
  readonly lugaresComputadora = LUGARES_COMPUTADORA;
  readonly lugaresInternet = LUGARES_INTERNET;
  readonly nivelesEstudio = NIVELES_ESTUDIO;
  readonly situacionesLaboralesFamilia = SITUACIONES_LABORALES_FAMILIA;
  readonly tiposVivienda = TIPOS_VIVIENDA;
  readonly condicionesVivienda = CONDICIONES_VIVIENDA;
  readonly mediosTraslado = MEDIOS_TRASLADO;
  readonly turnos = TURNOS;
  readonly opcionesAnios = aOpciones(aniosDeEgreso());
  readonly edadMinimaInscripcion = EDAD_MINIMA_INSCRIPCION;

  /* ---------- Requisitos documentales (CUS2) ---------- */
  readonly requisitoConstanciaEstudios = REQUISITO_CONSTANCIA_ESTUDIOS;
  readonly requisitoDni = REQUISITO_DNI;
  readonly requisitoConstanciaCuil = REQUISITO_CONSTANCIA_CUIL;
  readonly requisitoActaNacimiento = REQUISITO_ACTA_NACIMIENTO;
  readonly requisitoCertificadoAnalitico = REQUISITO_CERTIFICADO_ANALITICO;

  readonly secciones: Seccion[] = [
    { id: 'personales', titulo: 'Datos personales', grupo: 'personales' },
    { id: 'domicilio', titulo: 'Domicilio', grupo: 'domicilio' },
    { id: 'contacto', titulo: 'Datos de contacto', grupo: 'contacto' },
    { id: 'emergencia', titulo: 'Contacto de emergencia', grupo: 'emergencia' },
    { id: 'secundaria', titulo: 'Educación secundaria', grupo: 'secundaria' },
    { id: 'laborales', titulo: 'Datos laborales', grupo: 'laborales' },
    { id: 'actividad', titulo: 'Actividad física', grupo: null },
    { id: 'tecnologia', titulo: 'Acceso a tecnología', grupo: 'tecnologia' },
    { id: 'familia', titulo: 'Grupo familiar', grupo: 'familia' },
    { id: 'vivienda', titulo: 'Vivienda', grupo: 'vivienda' },
    { id: 'documentacion', titulo: 'Documentación', grupo: 'documentacion' },
    { id: 'inscripcion', titulo: 'Inscripción', grupo: 'inscripcion' }
  ];

  /** Etapas del formulario, en el orden en que se completan. */
  readonly pasos: Paso[] = [
    { id: 'identidad', titulo: 'Datos personales', grupos: ['personales'] },
    { id: 'contacto', titulo: 'Contacto', grupos: ['domicilio', 'contacto', 'emergencia'] },
    { id: 'estudios', titulo: 'Estudios', grupos: ['secundaria'] },
    {
      id: 'contexto',
      titulo: 'Situación',
      grupos: ['laborales', 'tecnologia', 'familia', 'vivienda']
    },
    { id: 'documentacion', titulo: 'Documentación', grupos: ['documentacion'] },
    { id: 'inscripcion', titulo: 'Inscripción', grupos: ['inscripcion'] }
  ];

  readonly pasoActual = signal(0);

  /** Etapa mas avanzada alcanzada: habilita volver atras desde el indicador. */
  readonly maximoVisitado = signal(0);

  /** Aviso de la etapa cuando falta completar algo para continuar. */
  readonly avisoPaso = signal<string | null>(null);

  readonly esPrimerPaso = computed(() => this.pasoActual() === 0);
  readonly esUltimoPaso = computed(() => this.pasoActual() === this.pasos.length - 1);
  readonly progreso = computed(() => ((this.pasoActual() + 1) / this.pasos.length) * 100);

  /* ---------- Estado de pantalla ---------- */
  readonly carreras = signal<Carrera[]>([]);
  readonly cargandoCarreras = signal(true);
  readonly enviando = signal(false);
  readonly errorEnvio = signal<string | null>(null);
  readonly intentoEnvio = signal(false);
  readonly solicitudEnviada = signal<SolicitudInscripcion | null>(null);

  /** Visibilidad de los campos condicionales. */
  readonly naceEnPaisLocal = signal(false);
  readonly tieneProvinciaNacimiento = signal(false);
  readonly naceEnProvinciaConPartido = signal(false);
  readonly resideEnPaisLocal = signal(false);
  readonly secundarioCompleto = signal(false);
  readonly trabaja = signal(false);
  readonly tieneComputadora = signal(false);
  readonly tieneInternet = signal(false);

  /** Busqueda del CUE del colegio contra el padron (seccion secundaria). */
  readonly buscandoCue = signal(false);
  readonly resultadosCue = signal<EstablecimientoCue[]>([]);
  readonly mensajeCue = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    personales: this.fb.nonNullable.group({
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      sexo: ['', Validators.required],
      identidadGenero: ['', Validators.required],
      tipoDocumento: ['DNI', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
      cuil: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      grupoSanguineo: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      estadoCivil: [''],
      fechaNacimiento: ['', [Validators.required, edadMinima(EDAD_MINIMA_INSCRIPCION)]],
      paisNacimiento: ['', Validators.required],
      provinciaNacimiento: [''],
      ciudadNacimiento: [''],
      partidoNacimiento: ['']
    }),
    domicilio: this.fb.nonNullable.group({
      paisResidencia: ['', Validators.required],
      provinciaResidencia: [''],
      ciudad: ['', Validators.required],
      codigoPostal: [''],
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      departamentoPiso: ['']
    }),
    contacto: this.fb.nonNullable.group(
      {
        emailPrincipal: ['', [Validators.required, Validators.email]],
        emailAlternativo: ['', [Validators.required, Validators.email]],
        celular: ['', [Validators.required, Validators.pattern(/^\+?[\d\s()-]{8,20}$/)]],
        telefonoFijo: ['', Validators.pattern(/^\+?[\d\s()-]{6,20}$/)]
      },
      { validators: correosDistintos('emailPrincipal', 'emailAlternativo') }
    ),
    emergencia: this.fb.nonNullable.group({
      vinculo: ['', Validators.required],
      nombreApellido: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s()-]{8,20}$/)]]
    }),
    secundaria: this.fb.nonNullable.group({
      secundarioCompleto: ['', Validators.required],
      anioEgreso: [''],
      tituloSecundario: ['', Validators.required],
      secundarioTecnico: [''],
      constanciaEstudios: this.fb.nonNullable.control<ArchivoCargado | null>(
        null,
        Validators.required
      ),
      cueColegio: ['', Validators.pattern(/^\d{6,12}$/)],
      nombreColegio: ['', Validators.required],
      paisColegio: [PAIS_LOCAL, Validators.required],
      provinciaColegio: ['', Validators.required],
      ciudadColegio: ['', Validators.required]
    }),
    laborales: this.fb.nonNullable.group({
      situacion: ['', Validators.required],
      empleador: [''],
      puesto: [''],
      cargaHoraria: [''],
      ocupacion: ['']
    }),
    actividadFisica: [''],
    tecnologia: this.fb.nonNullable.group({
      accesoComputadora: ['', Validators.required],
      lugarComputadora: [''],
      celularesEnHogar: this.fb.nonNullable.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(20)
      ]),
      accesoInternet: ['', Validators.required],
      lugarInternet: [''],
      usosInternet: this.fb.nonNullable.group({
        estudio: [false],
        trabajo: [false],
        tramites: [false],
        redesSociales: [false]
      })
    }),
    familia: this.fb.nonNullable.group({
      hijosACargo: this.fb.nonNullable.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(20)
      ]),
      familiaresACargo: this.fb.nonNullable.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(20)
      ]),
      padre: this.fb.nonNullable.group({
        apellidoNombre: [''],
        fechaNacimiento: ['', fechaNoFutura()],
        vive: [''],
        nivelEstudios: [''],
        trabajo: [''],
        situacionLaboral: [''],
        obraSocial: ['']
      }),
      madre: this.fb.nonNullable.group({
        apellidoNombre: [''],
        fechaNacimiento: ['', fechaNoFutura()],
        vive: [''],
        nivelEstudios: [''],
        trabajo: [''],
        situacionLaboral: [''],
        obraSocial: ['']
      }),
      hermanos: this.fb.nonNullable.group({
        cantidad: this.fb.nonNullable.control<number | null>(null, [
          Validators.min(0),
          Validators.max(20)
        ]),
        edades: [''],
        actividades: ['']
      })
    }),
    vivienda: this.fb.nonNullable.group({
      tipo: [''],
      condicion: [''],
      traslado: ['']
    }),
    documentacion: this.fb.nonNullable.group({
      dni: this.fb.nonNullable.control<ArchivoCargado | null>(null, Validators.required),
      constanciaCuil: this.fb.nonNullable.control<ArchivoCargado | null>(
        null,
        Validators.required
      ),
      actaNacimiento: this.fb.nonNullable.control<ArchivoCargado | null>(
        null,
        Validators.required
      ),
      certificadoAnalitico: this.fb.nonNullable.control<ArchivoCargado | null>(
        null,
        Validators.required
      )
    }),
    inscripcion: this.fb.nonNullable.group({
      carreraId: ['', Validators.required],
      modalidad: ['', Validators.required],
      turno: ['']
    }),
    declaracion: [false, Validators.requiredTrue]
  });

  /** Carrera elegida, para mostrar su detalle y acotar las modalidades. */
  readonly carreraSeleccionada = signal<Carrera | null>(null);

  /** Carreras como opciones del selector, con la sede como referencia. */
  readonly opcionesCarreras = computed(() =>
    this.carreras().map((carrera) => ({
      valor: carrera.id,
      etiqueta: `${carrera.nombre} · ${carrera.sede}`
    }))
  );

  readonly modalidadesDisponibles = computed(() => {
    const carrera = this.carreraSeleccionada();

    if (!carrera) {
      return MODALIDADES;
    }

    return MODALIDADES.filter((opcion) =>
      carrera.modalidades.includes(opcion.valor as Modalidad)
    );
  });

  /** Contexto de GSAP: agrupa las animaciones para revertirlas al salir. */
  private contexto?: gsap.Context;

  constructor() {
    afterNextRender(() => this.animarEntrada());
    this.cargarCarreras();
    this.escucharPaisNacimiento();
    this.escucharProvinciaNacimiento();
    this.escucharPaisResidencia();
    this.escucharSecundaria();
    this.escucharSituacionLaboral();
    this.escucharTecnologia();
    this.escucharCarrera();
  }

  ngOnDestroy(): void {
    this.contexto?.revert();
  }

  /* ------------------------------------------------------------------
     Navegacion por etapas
     ------------------------------------------------------------------ */

  /** True cuando la etapa indicada es la que se esta completando. */
  enPaso(id: string): boolean {
    return this.pasos[this.pasoActual()].id === id;
  }

  /** Todos los grupos de la etapa estan completos y sin errores. */
  pasoCompleto(indice: number): boolean {
    return this.pasos[indice].grupos.every((grupo) => this.formulario.get(grupo)?.valid ?? false);
  }

  siguiente(): void {
    const actual = this.pasoActual();

    // Se valida etapa por etapa para no abrumar con todos los errores juntos.
    if (!this.pasoCompleto(actual)) {
      this.pasos[actual].grupos.forEach((grupo) => this.formulario.get(grupo)?.markAllAsTouched());
      this.avisoPaso.set('Faltan datos en esta etapa. Revise los campos marcados.');
      this.sacudirAviso();
      this.enfocarPrimerCampoInvalido();
      return;
    }

    this.irA(actual + 1);
  }

  anterior(): void {
    this.irA(this.pasoActual() - 1);
  }

  /** Va a una etapa ya visitada (o a la siguiente, desde siguiente()). */
  irA(indice: number): void {
    const destino = Math.min(Math.max(indice, 0), this.pasos.length - 1);

    if (destino > this.maximoVisitado() + 1) {
      return;
    }

    this.avisoPaso.set(null);
    this.pasoActual.set(destino);
    this.maximoVisitado.update((maximo) => Math.max(maximo, destino));

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.animarPaso();
  }

  /** Lleva a la etapa que contiene una seccion con errores. */
  irASeccion(seccion: Seccion): void {
    const indice = this.pasos.findIndex(
      (paso) => seccion.grupo !== null && paso.grupos.includes(seccion.grupo)
    );

    if (indice >= 0) {
      this.irA(indice);
    }
  }

  /* ---------- Accesos para la plantilla ---------- */
  get personales() {
    return this.formulario.controls.personales.controls;
  }

  get domicilio() {
    return this.formulario.controls.domicilio.controls;
  }

  get contacto() {
    return this.formulario.controls.contacto.controls;
  }

  get grupoContacto() {
    return this.formulario.controls.contacto;
  }

  get emergencia() {
    return this.formulario.controls.emergencia.controls;
  }

  get secundaria() {
    return this.formulario.controls.secundaria.controls;
  }

  get laborales() {
    return this.formulario.controls.laborales.controls;
  }

  get tecnologia() {
    return this.formulario.controls.tecnologia.controls;
  }

  get usosInternet() {
    return this.formulario.controls.tecnologia.controls.usosInternet.controls;
  }

  get familia() {
    return this.formulario.controls.familia.controls;
  }

  get padre() {
    return this.formulario.controls.familia.controls.padre.controls;
  }

  get madre() {
    return this.formulario.controls.familia.controls.madre.controls;
  }

  get hermanos() {
    return this.formulario.controls.familia.controls.hermanos.controls;
  }

  get vivienda() {
    return this.formulario.controls.vivienda.controls;
  }

  get documentacion() {
    return this.formulario.controls.documentacion.controls;
  }

  get datosInscripcion() {
    return this.formulario.controls.inscripcion.controls;
  }

  get declaracion() {
    return this.formulario.controls.declaracion;
  }

  /** Un control muestra su error recien cuando el usuario interactuo con el. */
  campoInvalido(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  /**
   * Mensaje por campo (curso alternativo 2.a). `formato` describe la forma
   * esperada cuando el control usa un patron propio.
   */
  mensajeError(control: AbstractControl, etiqueta: string, formato?: string): string {
    if (control.hasError('required')) {
      return `${etiqueta} es obligatorio.`;
    }

    if (control.hasError('email')) {
      return 'Ingrese un correo electrónico válido.';
    }

    if (control.hasError('minlength')) {
      const minimo = control.getError('minlength').requiredLength as number;
      return `${etiqueta} debe tener al menos ${minimo} caracteres.`;
    }

    if (control.hasError('min')) {
      return `${etiqueta} no puede ser menor que ${control.getError('min').min}.`;
    }

    if (control.hasError('max')) {
      return `${etiqueta} no puede ser mayor que ${control.getError('max').max}.`;
    }

    if (control.hasError('edadMinima')) {
      return `Debe tener al menos ${EDAD_MINIMA_INSCRIPCION} años para inscribirse.`;
    }

    if (control.hasError('fechaFutura')) {
      return 'La fecha no puede ser posterior a hoy.';
    }

    if (control.hasError('fechaInvalida')) {
      return 'Ingrese una fecha válida.';
    }

    if (control.hasError('pattern')) {
      return formato ?? `${etiqueta} tiene un formato inválido.`;
    }

    return `Revise ${etiqueta.toLowerCase()}.`;
  }

  /** Secciones con campos pendientes, para el resumen posterior al envio. */
  seccionesConErrores(): Seccion[] {
    if (!this.intentoEnvio()) {
      return [];
    }

    return this.secciones.filter((seccion) => {
      if (!seccion.grupo) {
        return false;
      }

      return this.formulario.get(seccion.grupo)?.invalid ?? false;
    });
  }

  /**
   * Busca el CUE del colegio en el padron. Requiere institucion, pais,
   * provincia y ciudad; si falta alguno se marcan esos campos y no se consulta.
   */
  buscarCueColegio(): void {
    const requeridos = [
      this.secundaria.nombreColegio,
      this.secundaria.paisColegio,
      this.secundaria.provinciaColegio,
      this.secundaria.ciudadColegio
    ];

    if (requeridos.some((control) => control.invalid || !control.value.trim())) {
      requeridos.forEach((control) => control.markAsTouched());
      this.resultadosCue.set([]);
      this.mensajeCue.set(
        'Complete institución, país, provincia y ciudad del colegio para buscar el CUE.'
      );
      return;
    }

    this.buscandoCue.set(true);
    this.mensajeCue.set(null);
    this.resultadosCue.set([]);

    this.cue
      .buscar({
        institucion: this.secundaria.nombreColegio.value,
        pais: this.secundaria.paisColegio.value,
        provincia: this.secundaria.provinciaColegio.value,
        ciudad: this.secundaria.ciudadColegio.value
      })
      .subscribe({
        next: (establecimientos) => {
          this.buscandoCue.set(false);
          this.resultadosCue.set(establecimientos);

          if (establecimientos.length === 0) {
            this.mensajeCue.set(
              'No se encontraron establecimientos con esos datos. Puede cargar el CUE manualmente.'
            );
            return;
          }

          if (establecimientos.length === 1) {
            this.usarCue(establecimientos[0]);
          }
        },
        error: () => {
          this.buscandoCue.set(false);
          this.mensajeCue.set(
            'No se pudo consultar el padrón. Cargue el CUE manualmente o reintente.'
          );
        }
      });
  }

  /** Toma el CUE de un resultado del padron y lo escribe en el formulario. */
  usarCue(establecimiento: EstablecimientoCue): void {
    this.secundaria.cueColegio.setValue(establecimiento.cue);
    this.secundaria.cueColegio.markAsDirty();
    this.mensajeCue.set(`CUE ${establecimiento.cue} tomado de ${establecimiento.nombre}.`);
  }

  enviar(): void {
    this.errorEnvio.set(null);
    this.intentoEnvio.set(true);

    // Curso alternativo 2.a: nada se pierde, solo se marcan los campos pendientes.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      const pendiente = this.pasos.findIndex((_, indice) => !this.pasoCompleto(indice));

      if (pendiente >= 0 && pendiente !== this.pasoActual()) {
        this.irA(pendiente);
      }

      this.sacudirAviso();
      this.enfocarPrimerCampoInvalido();
      return;
    }

    this.enviando.set(true);

    this.inscripcion.enviarSolicitud(this.armarSolicitud()).subscribe({
      next: (resultado) => {
        this.enviando.set(false);

        if (!resultado.exito || !resultado.solicitud) {
          this.errorEnvio.set(this.mensajeDeFallo(resultado.motivo, resultado.codigoExistente));
          return;
        }

        this.solicitudEnviada.set(resultado.solicitud);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.animarConfirmacion();
      },
      // El formulario queda intacto: el postulante solo vuelve a presionar Enviar.
      error: () => {
        this.enviando.set(false);
        this.errorEnvio.set(
          'No se pudo enviar la solicitud. Reintente en unos minutos; los datos cargados se conservan.'
        );
      }
    });
  }

  /** Cantidad de archivos adjuntos de una solicitud, para la confirmacion. */
  cantidadDocumentos(solicitud: SolicitudInscripcion): number {
    return Object.keys(solicitud.documentos).length;
  }

  /** Nombre de la carrera de la solicitud enviada, para la confirmacion. */
  nombreCarrera(id: string): string {
    return this.inscripcion.carreraPorId(id)?.nombre ?? id;
  }

  /** Arma el objeto que espera el servicio a partir del valor del formulario. */
  private armarSolicitud(): SolicitudInscripcionNueva {
    const valor = this.formulario.getRawValue();

    const {
      constanciaEstudios,
      secundarioCompleto,
      secundarioTecnico,
      ...secundaria
    } = valor.secundaria;

    return {
      personales: valor.personales,
      domicilio: valor.domicilio,
      contacto: valor.contacto,
      emergencia: valor.emergencia,
      secundaria: {
        ...secundaria,
        secundarioCompleto: secundarioCompleto as 'si' | 'no',
        secundarioTecnico: secundarioTecnico as 'si' | 'no'
      },
      laborales: {
        ...valor.laborales,
        situacion: valor.laborales.situacion as 'trabaja' | 'no-trabaja'
      },
      actividadFisica: valor.actividadFisica,
      tecnologia: {
        ...valor.tecnologia,
        accesoComputadora: valor.tecnologia.accesoComputadora as 'si' | 'no',
        accesoInternet: valor.tecnologia.accesoInternet as 'si' | 'no'
      },
      familia: valor.familia,
      vivienda: valor.vivienda,
      inscripcion: valor.inscripcion,
      documentos: this.documentosCargados()
    };
  }

  /** Documentacion adjunta indexada por id de requisito (CUS2). */
  private documentosCargados(): Record<string, ArchivoCargado> {
    const adjuntos: [string, ArchivoCargado | null][] = [
      [DOCUMENTO.constanciaEstudios, this.secundaria.constanciaEstudios.value],
      [DOCUMENTO.dni, this.documentacion.dni.value],
      [DOCUMENTO.constanciaCuil, this.documentacion.constanciaCuil.value],
      [DOCUMENTO.actaNacimiento, this.documentacion.actaNacimiento.value],
      [DOCUMENTO.certificadoAnalitico, this.documentacion.certificadoAnalitico.value]
    ];

    return Object.fromEntries(
      adjuntos.filter((entrada): entrada is [string, ArchivoCargado] => entrada[1] !== null)
    );
  }

  private mensajeDeFallo(motivo?: MotivoFalloSolicitud, codigo?: string): string {
    switch (motivo) {
      case 'duplicada':
        return `Ya existe una solicitud pendiente${
          codigo ? ` (${codigo})` : ''
        } con ese documento o correo electrónico. No se generó una nueva; comuníquese con la institución si necesita modificarla.`;
      default:
        return 'No se pudo registrar la solicitud. Reintente en unos minutos.';
    }
  }

  private cargarCarreras(): void {
    this.inscripcion.obtenerCarreras().subscribe({
      next: (carreras) => {
        this.carreras.set(carreras);
        this.cargandoCarreras.set(false);
      },
      error: () => {
        this.cargandoCarreras.set(false);
        this.errorEnvio.set(
          'No se pudo cargar la oferta académica. Actualice la página e intente nuevamente.'
        );
      }
    });
  }

  /* ------------------------------------------------------------------
     Campos condicionales: visibilidad y validadores dinamicos
     ------------------------------------------------------------------ */

  private escucharPaisNacimiento(): void {
    const control = this.personales.paisNacimiento;

    control.valueChanges.pipe(takeUntilDestroyed()).subscribe((pais) => {
      const esLocal = this.esPaisLocal(pais);
      this.naceEnPaisLocal.set(esLocal);

      this.alternarObligatorio(this.personales.provinciaNacimiento, esLocal);

      if (!esLocal) {
        this.personales.provinciaNacimiento.setValue('');
        this.personales.ciudadNacimiento.setValue('');
        this.personales.partidoNacimiento.setValue('');
      }
    });
  }

  private escucharProvinciaNacimiento(): void {
    const control = this.personales.provinciaNacimiento;

    control.valueChanges.pipe(takeUntilDestroyed()).subscribe((provincia) => {
      const elegida = provincia.trim().length > 0;

      this.tieneProvinciaNacimiento.set(elegida);
      this.naceEnProvinciaConPartido.set(provincia === PROVINCIA_CON_PARTIDO);

      this.alternarObligatorio(this.personales.ciudadNacimiento, elegida);

      if (!elegida) {
        this.personales.ciudadNacimiento.setValue('');
      }

      if (provincia !== PROVINCIA_CON_PARTIDO) {
        this.personales.partidoNacimiento.setValue('');
      }
    });
  }

  private escucharPaisResidencia(): void {
    const control = this.domicilio.paisResidencia;

    control.valueChanges.pipe(takeUntilDestroyed()).subscribe((pais) => {
      const esLocal = this.esPaisLocal(pais);
      this.resideEnPaisLocal.set(esLocal);

      this.alternarObligatorio(this.domicilio.provinciaResidencia, esLocal);

      if (!esLocal) {
        this.domicilio.provinciaResidencia.setValue('');
      }

      // El codigo postal se valida segun el pais: cuatro digitos con letras
      // opcionales en Argentina, formato libre acotado en el resto.
      this.domicilio.codigoPostal.setValidators(
        Validators.pattern(esLocal ? /^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/ : /^[A-Za-z0-9 -]{3,10}$/)
      );
      this.domicilio.codigoPostal.updateValueAndValidity({ emitEvent: false });
    });
  }

  private escucharSecundaria(): void {
    this.secundaria.secundarioCompleto.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((valor) => {
        const completo = valor === 'si';
        this.secundarioCompleto.set(completo);

        this.alternarObligatorio(this.secundaria.anioEgreso, completo);

        if (!completo) {
          this.secundaria.anioEgreso.setValue('');
        }
      });
  }

  private escucharSituacionLaboral(): void {
    this.laborales.situacion.valueChanges.pipe(takeUntilDestroyed()).subscribe((valor) => {
      const trabaja = valor === 'trabaja';
      this.trabaja.set(trabaja);

      this.alternarObligatorio(this.laborales.empleador, trabaja);
      this.alternarObligatorio(this.laborales.puesto, trabaja);
      this.alternarObligatorio(this.laborales.cargaHoraria, trabaja);
      this.alternarObligatorio(this.laborales.ocupacion, !trabaja && valor === 'no-trabaja');

      if (trabaja) {
        this.laborales.ocupacion.setValue('');
      } else {
        this.laborales.empleador.setValue('');
        this.laborales.puesto.setValue('');
        this.laborales.cargaHoraria.setValue('');
      }
    });
  }

  private escucharTecnologia(): void {
    this.tecnologia.accesoComputadora.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((valor) => {
        const tiene = valor === 'si';
        this.tieneComputadora.set(tiene);

        this.alternarObligatorio(this.tecnologia.lugarComputadora, tiene);

        if (!tiene) {
          this.tecnologia.lugarComputadora.setValue('');
        }
      });

    this.tecnologia.accesoInternet.valueChanges.pipe(takeUntilDestroyed()).subscribe((valor) => {
      const tiene = valor === 'si';
      this.tieneInternet.set(tiene);

      this.alternarObligatorio(this.tecnologia.lugarInternet, tiene);

      if (!tiene) {
        this.tecnologia.lugarInternet.setValue('');
      }
    });
  }

  private escucharCarrera(): void {
    this.datosInscripcion.carreraId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((id) => {
        const carrera = this.carreras().find((item) => item.id === id) ?? null;
        this.carreraSeleccionada.set(carrera);

        const modalidad = this.datosInscripcion.modalidad;

        // La modalidad elegida puede no dictarse en la carrera nueva.
        if (carrera && !carrera.modalidades.includes(modalidad.value as Modalidad)) {
          modalidad.setValue('');
        }
      });
  }

  /** Agrega o quita Validators.required conservando el resto de validadores. */
  private alternarObligatorio(control: AbstractControl, obligatorio: boolean): void {
    if (obligatorio) {
      control.addValidators(Validators.required);
    } else {
      control.removeValidators(Validators.required);
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  private esPaisLocal(pais: string): boolean {
    return pais.trim().toLowerCase() === PAIS_LOCAL.toLowerCase();
  }

  /* ------------------------------------------------------------------
     Animaciones (GSAP)
     ------------------------------------------------------------------ */

  /** Entrada de la pantalla: encabezado, indicador de etapas y primera etapa. */
  private animarEntrada(): void {
    if (this.prefiereMenosMovimiento()) {
      return;
    }

    this.contexto = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-encabezado] > *', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 })
        .from('[data-pasos]', { y: 16, opacity: 0, duration: 0.5 }, '-=0.35')
        .from('[data-paso] .seccion', { y: 28, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.2');
    }, this.host.nativeElement);
  }

  /** Transicion entre etapas: entran las tarjetas y avanza la barra de progreso. */
  private animarPaso(): void {
    if (this.prefiereMenosMovimiento()) {
      return;
    }

    // La etapa nueva recien esta en el DOM en el siguiente cuadro.
    requestAnimationFrame(() => {
      const raiz = this.host.nativeElement;

      gsap.from(raiz.querySelectorAll('[data-paso] .seccion'), {
        y: 28,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.08
      });

      gsap.to(raiz.querySelector('[data-progreso]'), {
        width: `${this.progreso()}%`,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }

  /** Sacude el aviso para que se note que falta completar algo. */
  private sacudirAviso(): void {
    if (this.prefiereMenosMovimiento()) {
      return;
    }

    requestAnimationFrame(() => {
      const aviso = this.host.nativeElement.querySelector('[data-aviso]');

      if (aviso) {
        gsap.fromTo(aviso, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      }
    });
  }

  private animarConfirmacion(): void {
    if (this.prefiereMenosMovimiento()) {
      return;
    }

    requestAnimationFrame(() => {
      const tarjeta = this.host.nativeElement.querySelector('[data-confirmacion]');

      if (tarjeta) {
        gsap.from(tarjeta, { y: 30, opacity: 0, scale: 0.98, duration: 0.7, ease: 'power3.out' });
      }
    });
  }

  private prefiereMenosMovimiento(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Lleva el foco al primer campo pendiente para que el error se vea. */
  private enfocarPrimerCampoInvalido(): void {
    const elemento = this.host.nativeElement.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    );

    elemento?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elemento?.focus({ preventScroll: true });
  }
}
