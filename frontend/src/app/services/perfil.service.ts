import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Perfil {
  id: number;
  nome: string;
  tipoPerfil: string;
  usuarioId: number;
  instituicoesIds?: number[];
  categoriasIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = `${environment.apiUrl}/perfis`;

  constructor(private http: HttpClient) { }

  listarPorUsuario(usuarioId: number): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  buscarPorId(id: number): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.apiUrl}/${id}`);
  }

  salvar(perfil: Perfil): Observable<Perfil> {
    return this.http.post<Perfil>(this.apiUrl, perfil);
  }

  atualizar(id: number, perfil: Perfil): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.apiUrl}/${id}`, perfil);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}