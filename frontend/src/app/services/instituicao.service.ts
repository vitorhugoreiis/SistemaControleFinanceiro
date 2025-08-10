import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Instituicao } from '../models/instituicao.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstituicaoService {
  private apiUrl = `${environment.apiUrl}/instituicoes`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Instituicao[]> {
    return this.http.get<Instituicao[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Instituicao> {
    return this.http.get<Instituicao>(`${this.apiUrl}/${id}`);
  }

  salvar(instituicao: Instituicao): Observable<Instituicao> {
    return this.http.post<Instituicao>(this.apiUrl, instituicao);
  }

  atualizar(id: number, instituicao: Instituicao): Observable<Instituicao> {
    return this.http.put<Instituicao>(`${this.apiUrl}/${id}`, instituicao);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}