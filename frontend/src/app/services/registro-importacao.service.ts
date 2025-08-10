import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroImportacao } from '../models/registro-importacao.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroImportacaoService {
  private apiUrl = `${environment.apiUrl}/registros-importacao`;

  constructor(private http: HttpClient) { }

  listar(): Observable<RegistroImportacao[]> {
    return this.http.get<RegistroImportacao[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<RegistroImportacao> {
    return this.http.get<RegistroImportacao>(`${this.apiUrl}/${id}`);
  }

  importarArquivo(formData: FormData): Observable<RegistroImportacao> {
    return this.http.post<RegistroImportacao>(`${this.apiUrl}/importar`, formData);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}