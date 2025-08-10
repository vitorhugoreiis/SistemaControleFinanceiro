import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transacao } from '../models/transacao.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {
  private apiUrl = `${environment.apiUrl}/transacoes`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(this.apiUrl);
  }

  listarPorTipo(tipo: 'RECEITA' | 'DESPESA'): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  listarPorCategoria(categoriaId: number): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  listarPorInstituicao(instituicaoId: number): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/instituicao/${instituicaoId}`);
  }

  listarPorPeriodo(dataInicio: string, dataFim: string): Observable<Transacao[]> {
    let params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.get<Transacao[]>(`${this.apiUrl}/periodo`, { params });
  }

  buscarPorId(id: number): Observable<Transacao> {
    return this.http.get<Transacao>(`${this.apiUrl}/${id}`);
  }

  salvar(transacao: Transacao): Observable<Transacao> {
    return this.http.post<Transacao>(this.apiUrl, transacao);
  }

  atualizar(id: number, transacao: Transacao): Observable<Transacao> {
    return this.http.put<Transacao>(`${this.apiUrl}/${id}`, transacao);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}