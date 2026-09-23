/**
 * Pagina de resultados de un listado paginado del backend
 * (espejo de backend/Common/PaginaDto.cs).
 */
export interface Pagina<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanoPagina: number;
}
