import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { PermisoSobreRecurso } from '../models/permiso-sobre-recurso.model';
import { Rol, RolPayload } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }

  obtenerPermisosSobreRecurso(): Observable<PermisoSobreRecurso[]> {
    return this.http.get<PermisoSobreRecurso[]>(`${this.baseUrl}/permisos-sobre-recurso`);
  }

  crearRol(payload: RolPayload): Observable<Rol> {
    return this.http.post<Rol>(this.baseUrl, payload);
  }

  actualizarRol(id: string, payload: RolPayload): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl}/${id}`, payload);
  }

  eliminarRol(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
