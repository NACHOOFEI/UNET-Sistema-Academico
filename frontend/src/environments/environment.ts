/**
 * Configuracion por defecto (build de produccion).
 *
 * La API se sirve bajo el mismo origen que el frontend, asi que alcanza con
 * una ruta relativa: no hay CORS ni host que mantener sincronizado.
 */
export const environment = {
  produccion: true,
  apiUrl: '/api'
};
