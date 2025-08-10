import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ResumoFinanceiroService } from '../../services/resumo-financeiro.service';
import { ResumoFinanceiro } from '../../models/resumo-financeiro.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  periodoForm: FormGroup;
  resumoFinanceiro: ResumoFinanceiro | null = null;
  loading = false;
  errorMessage = '';
  
  // Para gráficos
  receitasChartData: any;
  despesasChartData: any;
  balanceChartData: any;
  
  constructor(
    private formBuilder: FormBuilder,
    private resumoFinanceiroService: ResumoFinanceiroService
  ) {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    this.periodoForm = this.formBuilder.group({
      dataInicio: [this.formatDate(primeiroDiaMes)],
      dataFim: [this.formatDate(ultimoDiaMes)]
    });
  }

  ngOnInit(): void {
    this.buscarResumoFinanceiro();
  }

  buscarResumoFinanceiro(): void {
    this.loading = true;
    this.errorMessage = '';
    
    const { dataInicio, dataFim } = this.periodoForm.value;
    
    this.resumoFinanceiroService.gerarResumo(dataInicio, dataFim).subscribe({
      next: (resumo) => {
        this.resumoFinanceiro = resumo;
        this.prepararDadosGraficos();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao buscar resumo financeiro';
        this.loading = false;
      }
    });
  }

  prepararDadosGraficos(): void {
    if (!this.resumoFinanceiro) return;
    
    // Dados para gráfico de receitas por categoria
    const receitasCategorias = this.resumoFinanceiro.resumoCategorias
      .filter(cat => cat.tipo === 'RECEITA')
      .map(cat => cat.categoriaNome);
      
    const receitasValores = this.resumoFinanceiro.resumoCategorias
      .filter(cat => cat.tipo === 'RECEITA')
      .map(cat => cat.valor);
    
    this.receitasChartData = {
      labels: receitasCategorias,
      datasets: [{
        data: receitasValores,
        backgroundColor: [
          '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
        ]
      }]
    };
    
    // Dados para gráfico de despesas por categoria
    const despesasCategorias = this.resumoFinanceiro.resumoCategorias
      .filter(cat => cat.tipo === 'DESPESA')
      .map(cat => cat.categoriaNome);
      
    const despesasValores = this.resumoFinanceiro.resumoCategorias
      .filter(cat => cat.tipo === 'DESPESA')
      .map(cat => cat.valor);
    
    this.despesasChartData = {
      labels: despesasCategorias,
      datasets: [{
        data: despesasValores,
        backgroundColor: [
          '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4'
        ]
      }]
    };
    
    // Dados para gráfico de balanço (receitas vs despesas)
    this.balanceChartData = {
      labels: ['Receitas', 'Despesas', 'Saldo'],
      datasets: [{
        data: [
          this.resumoFinanceiro.totalReceitas,
          this.resumoFinanceiro.totalDespesas,
          this.resumoFinanceiro.saldoTotal
        ],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3']
      }]
    };
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}