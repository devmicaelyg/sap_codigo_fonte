import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from './../../environments/environment.prod';
import { Lider } from './../models/lider.model';

@Injectable({
  providedIn: 'root'
})
export class LiderService {

    // api: string = environment.apiUrl + '/lideres';
    api: string = `${environment.apiUrl}/lideres`;

  constructor(
      private http: HttpClient
  ) { }

  obterTodos(): Observable<any> {
    return this.http.get(`${this.api}`)
  }

  salvar(recurso: Lider): Observable<any> {
      if (recurso.id) {
          return this.atualizar(recurso);
      }
      return this.cadastrar(recurso);
  }

  private cadastrar(recurso: Lider): Observable<Lider> {
      return this.http.post(`${this.api}`, recurso).pipe(
          map(recurso => Object.assign(new Lider(), recurso))

      );
  }

  private atualizar(recurso: Lider): Observable<Lider> {
      return this.http.put(`${this.api}`, recurso).pipe(
          map(recurso => Object.assign(new Lider(), recurso))
      );
  }

  deletar (id: number):void {
      return this.http.delete(`${this.api}/${id}`);

  }

}
