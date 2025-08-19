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

  listarPorTipo(tipo: 'Receita' | 'Despesa'): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  listarPorCategoria(categoriaId: number): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  listarComFiltros(perfilId?: number, tipo?: string, categoriaId?: string): Observable<Transacao[]> {
    let params = new HttpParams();
    
    if (perfilId) {
      params = params.set('perfilId', perfilId.toString());
    }
    
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId);
    }
    
    return this.http.get<Transacao[]>(this.apiUrl, { params });
  }

  listarPorInstituicao(instituicaoId: number): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/instituicao/${instituicaoId}`);
  }

  listarPorPeriodo(dataInicio: string, dataFim: string): Observable<Transacao[]> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.get<Transacao[]>(`${this.apiUrl}/periodo`, { params });
  }

  buscarPorId(id: number): Observable<Transacao> {
    return this.http.get<Transacao>(`${this.apiUrl}/${id}`);
  }

  salvar(transacao: Transacao): Observable<Transacao> {
    let params = new HttpParams();
    
    // Se a transação tem perfilId, enviar como parâmetro de query
    if (transacao.perfilId) {
      params = params.set('perfilId', transacao.perfilId.toString());
      // Remover perfilId do corpo da requisição
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { perfilId: _, ...transacaoSemPerfilId } = transacao;
      return this.http.post<Transacao>(this.apiUrl, transacaoSemPerfilId, { params });
    }
    
    return this.http.post<Transacao>(this.apiUrl, transacao);
  }

  atualizar(id: number, transacao: Transacao): Observable<Transacao> {
    return this.http.put<Transacao>(`${this.apiUrl}/${id}`, transacao);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}