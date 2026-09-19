import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { edadEnAnios } from '../models/inscripcion.model';

/**
 * Validadores propios del formulario de inscripcion (UNET-M3-CU10).
 * Replican en el frontend las reglas que el backend debe volver a aplicar:
 * la validacion del cliente evita envios inutiles, no reemplaza la del servidor.
 */

/** La fecha de nacimiento no puede ser futura ni corresponder a un menor de `anios`. */
export function edadMinima(anios: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string;

    if (!valor) {
      return null;
    }

    const edad = edadEnAnios(valor);

    if (edad === null) {
      return { fechaInvalida: true };
    }

    if (edad < 0) {
      return { fechaFutura: true };
    }

    return edad < anios ? { edadMinima: { requerida: anios } } : null;
  };
}

/** La fecha indicada no puede ser posterior a hoy. */
export function fechaNoFutura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as string;

    if (!valor) {
      return null;
    }

    const fecha = new Date(`${valor}T00:00:00`);

    if (Number.isNaN(fecha.getTime())) {
      return { fechaInvalida: true };
    }

    return fecha.getTime() > Date.now() ? { fechaFutura: true } : null;
  };
}

/**
 * Los dos correos declarados deben ser distintos: el alternativo existe para
 * poder contactar al postulante cuando el principal falla.
 */
export function correosDistintos(nombrePrincipal: string, nombreAlternativo: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const principal = (grupo.get(nombrePrincipal)?.value as string)?.trim().toLowerCase();
    const alternativo = (grupo.get(nombreAlternativo)?.value as string)?.trim().toLowerCase();

    if (!principal || !alternativo) {
      return null;
    }

    return principal === alternativo ? { correosIguales: true } : null;
  };
}
