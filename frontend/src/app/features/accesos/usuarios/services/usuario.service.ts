import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { Pagina } from '../../../../core/models/pagina.model';
import { Usuario, UsuarioFiltro } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  /**
   * Listado paginado. El filtrado y la paginacion se hacen en el backend: la tabla
   * Usuarios puede tener miles de filas y no tiene sentido traerlas todas al navegador.
   */
  obtenerUsuarios(filtro: UsuarioFiltro): Observable<Pagina<Usuario>> {
    let params = new HttpParams()
      .set('estado', filtro.estado)
      .set('pagina', filtro.pagina)
      .set('tamanoPagina', filtro.tamanoPagina);

    const busqueda = filtro.busqueda.trim();
    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }

    return this.http.get<Pagina<Usuario>>(this.baseUrl, { params });
  }
}
