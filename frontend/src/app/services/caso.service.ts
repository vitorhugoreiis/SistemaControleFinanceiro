import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Caso, CasoRequest, CasoResponse, StatusCaso } from '../models/caso.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CasoService {
  private apiUrl = `${environment.apiUrl}/casos`;

  constructor(private http: HttpClient) { }

  listarCasos(): Observable<CasoResponse[]> {
    return this.http.get<CasoResponse[]>(this.apiUrl);
  }

  listarCasosPorCliente(clienteId: number): Observable<CasoResponse[]> {
    return this.http.get<CasoResponse[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  listarCasosPorStatus(status: StatusCaso): Observable<CasoResponse[]> {
    return this.http.get<CasoResponse[]>(`${this.apiUrl}/status/${status}`);
  }

  buscarCasoPorId(id: number): Observable<CasoResponse> {
    return this.http.get<CasoResponse>(`${this.apiUrl}/${id}`);
  }

  criarCaso(caso: CasoRequest): Observable<CasoResponse> {
    return this.http.post<CasoResponse>(this.apiUrl, caso);
  }

  atualizarCaso(id: number, caso: CasoRequest): Observable<CasoResponse> {
    return this.http.put<CasoResponse>(`${this.apiUrl}/${id}`, caso);
  }

  excluirCaso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  buscarCasos(termo: string): Observable<CasoResponse[]> {
    const params = new HttpParams().set('termo', termo);
    return this.http.get<CasoResponse[]>(`${this.apiUrl}/buscar`, { params });
  }

  registrarPagamentoHonorarios(id: number, valor: number): Observable<CasoResponse> {
    const params = new HttpParams().set('valor', valor.toString());
    return this.http.post<CasoResponse>(`${this.apiUrl}/${id}/pagamento-honorarios`, null, { params });
  }

  listarCasosComHonorariosEmAberto(): Observable<CasoResponse[]> {
    return this.http.get<CasoResponse[]>(`${this.apiUrl}/honorarios-em-aberto`);
  }

  calcularHonorariosTotais(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/honorarios/totais`);
  }

  calcularHonorariosPagos(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/honorarios/pagos`);
  }

  calcularPercentualPagamento(caso: CasoResponse): number {
    if (!caso.valorHonorarios || caso.valorHonorarios === 0) {
      return 0;
    }
    const honorariosPagos = caso.honorariosPagos || 0;
    return Math.round((honorariosPagos / caso.valorHonorarios) * 100);
  }

  obterCorStatus(status: StatusCaso): string {
    switch (status) {
      case StatusCaso.ATIVO:
        return 'success';
      case StatusCaso.SUSPENSO:
        return 'warning';
      case StatusCaso.ARQUIVADO:
        return 'secondary';
      case StatusCaso.FINALIZADO:
        return 'primary';
      case StatusCaso.CANCELADO:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  obterIconeStatus(status: StatusCaso): string {
    switch (status) {
      case StatusCaso.ATIVO:
        return 'fas fa-play-circle';
      case StatusCaso.SUSPENSO:
        return 'fas fa-pause-circle';
      case StatusCaso.ARQUIVADO:
        return 'fas fa-archive';
      case StatusCaso.FINALIZADO:
        return 'fas fa-check-circle';
      case StatusCaso.CANCELADO:
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  validarNumeroProcesso(numeroProcesso: string): boolean {
    // Remove espaços e caracteres especiais
    const numero = numeroProcesso.replace(/\D/g, '');
    
    // Verifica se tem pelo menos 15 dígitos (formato básico)
    if (numero.length < 15) {
      return false;
    }
    
    // Aqui você pode implementar validações mais específicas
    // dependendo do padrão de numeração dos processos
    return true;
  }

  formatarNumeroProcesso(numeroProcesso: string): string {
    // Remove caracteres não numéricos
    const numeros = numeroProcesso.replace(/\D/g, '');
    
    // Formato padrão: 0000000-00.0000.0.00.0000
    if (numeros.length >= 20) {
      return numeros.replace(
        /(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/,
        '$1-$2.$3.$4.$5.$6'
      );
    }
    
    return numeroProcesso;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  calcularDiasEmAndamento(dataInicio: Date): number {
    if (!dataInicio) {
      return 0;
    }
    
    const hoje = new Date();
    const inicio = new Date(dataInicio);
    const diffTime = Math.abs(hoje.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  obterStatusOptions(): { value: StatusCaso; label: string }[] {
    return [
      { value: StatusCaso.ATIVO, label: 'Ativo' },
      { value: StatusCaso.SUSPENSO, label: 'Suspenso' },
      { value: StatusCaso.ARQUIVADO, label: 'Arquivado' },
      { value: StatusCaso.FINALIZADO, label: 'Finalizado' },
      { value: StatusCaso.CANCELADO, label: 'Cancelado' }
    ];
  }
}