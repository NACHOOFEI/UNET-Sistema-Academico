import { Usuario } from '../models/usuario.model';

/**
 * Datos de prueba mientras el backend no esta disponible.
 *
 * IMPORTANTE: las contrasenas figuran en texto plano porque este archivo
 * solo simula la respuesta del servidor durante el desarrollo del frontend.
 * La validacion real y el hash de contrasenas son responsabilidad del backend;
 * este archivo debe eliminarse al integrar la API.
 */
export interface UsuarioMock extends Usuario {
  password: string;
}

export const USUARIOS_MOCK: UsuarioMock[] = [
  {
    id: 1,
    legajo: '10001',
    password: 'Alumno.2026',
    nombre: 'Micaela',
    apellido: 'Ferreyra',
    email: 'mferreyra@unet.edu.ar',
    roles: ['alumno'],
    activo: true
  },
  {
    id: 2,
    legajo: '20001',
    password: 'Docente.2026',
    nombre: 'Rodrigo',
    apellido: 'Bustos',
    email: 'rbustos@unet.edu.ar',
    roles: ['docente'],
    activo: true
  },
  {
    id: 3,
    legajo: '30001',
    password: 'Gestion.2026',
    nombre: 'Carla',
    apellido: 'Nunez',
    email: 'cnunez@unet.edu.ar',
    roles: ['administrativo'],
    activo: true
  },
  {
    id: 4,
    legajo: '40001',
    password: 'Admin.2026',
    nombre: 'Ariel',
    apellido: 'Quiroga',
    email: 'aquiroga@unet.edu.ar',
    roles: ['administrador', 'administrativo'],
    activo: true
  },
  {
    id: 5,
    legajo: '10002',
    password: 'Baja.2026',
    nombre: 'Tomas',
    apellido: 'Aguirre',
    email: 'taguirre@unet.edu.ar',
    roles: ['alumno'],
    activo: false
  }
];
