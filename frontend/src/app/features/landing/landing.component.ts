import { Component, ElementRef, OnDestroy, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Carrera } from '../../core/models/inscripcion.model';
import { InscripcionService } from '../../core/services/inscripcion.service';

/** Novedad institucional publicada en la portada. */
interface Novedad {
  id: string;
  etiqueta: string;
  fecha: string;
  titulo: string;
  bajada: string;
  imagen: string;
}

/** Dato destacado del encabezado; el numero se anima al entrar en pantalla. */
interface Destacado {
  valor: number;
  /** Valor ya formateado: es lo que se ve si las animaciones estan desactivadas. */
  texto: string;
  sufijo: string;
  etiqueta: string;
}

/**
 * Landing institucional de la Universidad de San Nicolas.
 *
 * Es el punto de entrada publico del sistema: presenta la institucion, la
 * oferta academica y las novedades, y lleva a las dos acciones que importan,
 * ingresar al sistema (/auth) e inscribirse a una carrera (/inscripcion).
 *
 * Las animaciones usan GSAP con ScrollTrigger y quedan desactivadas cuando el
 * sistema operativo pide menos movimiento.
 */
@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly inscripcion = inject(InscripcionService);

  /** Contexto de GSAP: agrupa las animaciones para poder revertirlas juntas. */
  private contexto?: gsap.Context;

  /** Recalcula el estado de la barra superior; se registra en scroll y resize. */
  private actualizarBarra?: () => void;

  /**
   * Imagen del encabezado. Se usa la fotografia institucional si esta presente
   * en assets/imagenes/; si falta, se cae a la ilustracion para no dejar un
   * hueco roto en la portada.
   */
  readonly imagenHero = signal('assets/imagenes/campus-usn.jpg');

  /** Oferta academica que se muestra en la portada. */
  readonly carreras: Carrera[] = this.inscripcion.catalogo();

  readonly destacados: Destacado[] = [
    { valor: 48, texto: '48', sufijo: '', etiqueta: 'Años formando profesionales' },
    { valor: 6, texto: '6', sufijo: '', etiqueta: 'Carreras de grado y pregrado' },
    { valor: 9200, texto: '9.200', sufijo: '+', etiqueta: 'Estudiantes activos' },
    { valor: 94, texto: '94', sufijo: '%', etiqueta: 'Inserción laboral' }
  ];

  readonly novedades: Novedad[] = [
    {
      id: 'inscripciones',
      etiqueta: 'Ingreso',
      fecha: '12 de marzo',
      titulo: 'Abren las inscripciones 2026',
      bajada: 'El formulario de preinscripción ya está disponible en línea, sin turno previo.',
      imagen: 'assets/imagenes/campus.svg'
    },
    {
      id: 'biblioteca',
      etiqueta: 'Campus',
      fecha: '28 de febrero',
      titulo: 'Nueva biblioteca central',
      bajada: 'Más de 40.000 volúmenes y salas de estudio abiertas hasta las 22 h.',
      imagen: 'assets/imagenes/biblioteca.svg'
    },
    {
      id: 'laboratorio',
      etiqueta: 'Investigación',
      fecha: '20 de febrero',
      titulo: 'Laboratorio de datos aplicados',
      bajada: 'Un espacio para proyectos conjuntos entre estudiantes y empresas de la región.',
      imagen: 'assets/imagenes/laboratorio.svg'
    },
    {
      id: 'graduacion',
      etiqueta: 'Comunidad',
      fecha: '5 de febrero',
      titulo: 'Colación de grado de verano',
      bajada: 'Más de 300 egresados recibieron su título en el Aula Magna.',
      imagen: 'assets/imagenes/graduacion.svg'
    }
  ];

  constructor() {
    afterNextRender(() => this.animar());
  }

  ngOnDestroy(): void {
    this.contexto?.revert();

    if (this.actualizarBarra) {
      window.removeEventListener('scroll', this.actualizarBarra);
      window.removeEventListener('resize', this.actualizarBarra);
    }
  }

  /**
   * La barra pasa de transparente (sobre la foto) a solida apenas se empieza a
   * bajar: mas abajo la foto tiene zonas claras y el texto blanco se pierde.
   *
   * Se resuelve con un listener propio y no con ScrollTrigger porque tiene que
   * ser correcto tambien al cargar la pagina ya scrolleada, sin depender de que
   * se dispare un evento de entrada.
   */
  private vigilarBarra(): void {
    const navbar = this.host.nativeElement.querySelector('[data-navbar]');

    if (!navbar) {
      return;
    }

    this.actualizarBarra = () => {
      navbar.classList.toggle('navbar--solida', window.scrollY >= 80);
    };

    this.actualizarBarra();
    window.addEventListener('scroll', this.actualizarBarra, { passive: true });
    window.addEventListener('resize', this.actualizarBarra);
  }

  /**
   * La foto del encabezado cambia la altura del bloque al terminar de cargar:
   * se recalculan las posiciones de las animaciones y el punto en el que la
   * barra superior pasa a fondo solido.
   */
  alCargarHero(): void {
    ScrollTrigger.refresh();
    this.actualizarBarra?.();
  }

  /** La foto institucional no esta disponible: se muestra la ilustracion. */
  usarRespaldoHero(): void {
    this.imagenHero.set('assets/imagenes/facultad.svg');
  }

  /** Duracion en anios, con la palabra que corresponde. */
  duracion(carrera: Carrera): string {
    return carrera.duracionAnios === 1 ? '1 año' : `${carrera.duracionAnios} años`;
  }

  private animar(): void {
    gsap.registerPlugin(ScrollTrigger);
    this.vigilarBarra();

    this.contexto = gsap.context(() => {
      // La barra superior se vuelve solida apenas se deja atras el encabezado.
      // Todo el movimiento queda condicionado a que el usuario no pida lo contrario.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const entrada = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });

        entrada
          .from('[data-hero-imagen]', { scale: 1.12, opacity: 0, duration: 1.4 })
          .from('[data-hero-texto] > *', { y: 32, opacity: 0, stagger: 0.12 }, '-=1')
          .from('[data-destacado]', { y: 24, opacity: 0, stagger: 0.08 }, '-=0.6');

        // Parallax suave del fondo del encabezado.
        gsap.to('[data-hero-imagen]', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true }
        });

        gsap.utils.toArray<HTMLElement>('[data-revelar]').forEach((elemento) => {
          gsap.from(elemento, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: elemento, start: 'top 85%' }
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-grupo]').forEach((grupo) => {
          gsap.from(grupo.children, {
            y: 48,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: grupo, start: 'top 82%' }
          });
        });

        this.animarNumeros();
      }
    }, this.host.nativeElement);
  }

  /** Cuenta hasta el valor final de cada dato destacado. */
  private animarNumeros(): void {
    gsap.utils.toArray<HTMLElement>('[data-numero]').forEach((elemento) => {
      const final = Number(elemento.dataset['numero'] ?? 0);
      const contador = { valor: 0 };

      gsap.to(contador, {
        valor: final,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: elemento, start: 'top 90%', once: true },
        onUpdate: () => {
          elemento.textContent = Math.round(contador.valor).toLocaleString('es-AR');
        }
      });
    });
  }
}
