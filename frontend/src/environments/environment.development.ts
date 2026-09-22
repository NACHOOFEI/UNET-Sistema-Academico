/**
 * Configuracion de desarrollo.
 *
 * Apunta al perfil "http" de launchSettings.json del backend (puerto 5143).
 * Si se levanta la API con el perfil "https", cambiar a https://localhost:7149/api.
 */
export const environment = {
  produccion: false,
  apiUrl: 'http://localhost:5143/api'
};
