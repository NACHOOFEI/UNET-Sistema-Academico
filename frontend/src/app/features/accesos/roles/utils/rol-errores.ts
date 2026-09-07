import { HttpErrorResponse } from '@angular/common/http';

/** Extrae el codigo de error que devuelven los endpoints de /api/roles ({ error_description }). */
export function codigoErrorRol(error: unknown): string | null {
  if (error instanceof HttpErrorResponse) {
    return (error.error as { error_description?: string } | null)?.error_description ?? null;
  }
  return null;
}

/** Traduce el codigo de error de negocio a un mensaje para el usuario. */
export function mensajeErrorRol(codigo: string | null): string {
  switch (codigo) {
    case 'rol-ya-existente':
      return 'Ya existe un rol con ese nombre.';
    case 'rol-no-encontrado':
      return 'El rol ya no existe. Puede haber sido eliminado por otro usuario.';
    case 'ultimo-rol-administracion':
      return 'No se puede eliminar: es el unico rol con permiso para gestionar roles.';
    default:
      return 'Ocurrio un error inesperado. Intente nuevamente.';
  }
}
