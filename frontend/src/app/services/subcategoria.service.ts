import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subcategoria } from '../models/subcategoria.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaService {
  private apiUrl = `${environment.apiUrl}/subcategorias`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(this.apiUrl);
  }

  listarPorCategoria(categoriaId: number): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.apiUrl}/categoria/${categoriaId}`);
  }

  buscarPorId(id: number): Observable<Subcategoria> {
    return this.http.get<Subcategoria>(`${this.apiUrl}/${id}`);
  }

  salvar(subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.post<Subcategoria>(this.apiUrl, subcategoria);
  }

  atualizar(id: number, subcategoria: Subcategoria): Observable<Subcategoria> {
    return this.http.put<Subcategoria>(`${this.apiUrl}/${id}`, subcategoria);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}