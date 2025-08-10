import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResumoFinanceiro } from '../models/resumo-financeiro.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResumoFinanceiroService {
  private apiUrl = `${environment.apiUrl}/resumo-financeiro`;

  constructor(private http: HttpClient) { }

  gerarResumo(dataInicio: string, dataFim: string): Observable<ResumoFinanceiro> {
    let params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);
    return this.http.get<ResumoFinanceiro>(this.apiUrl, { params });
  }
}