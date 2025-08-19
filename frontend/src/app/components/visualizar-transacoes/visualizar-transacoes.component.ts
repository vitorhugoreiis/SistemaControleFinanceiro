import { Component, OnInit } from '@angular/core';
import { TransacaoService } from '../../services/transacao.service';
import { CategoriaService } from '../../services/categoria.service';
import { InstituicaoService } from '../../services/instituicao.service';
import { Transacao } from '../../models/transacao.model';
import { Categoria } from '../../models/categoria.model';
import { Instituicao } from '../../models/instituicao.model';

@Component({
  selector: 'app-visualizar-transacoes',
  templateUrl: './visualizar-transacoes.component.html',
  styleUrls: ['./visualizar-transacoes.component.scss']
})
export class VisualizarTransacoesComponent implements OnInit {
  transacoes: Transacao[] = [];
  transacoesFiltradas: Transacao[] = [];
  categorias: Categoria[] = [];
  instituicoes: Instituicao[] = [];
  loading = false;
  
  // Filtros
  filtroTipo: string = '';
  filtroCategoria: number | null = null;
  filtroInstituicao: number | null = null;
  filtroDataInicio: string = '';
  filtroDataFim: string = '';
  filtroValorMin: number | null = null;
  filtroValorMax: number | null = null;
  
  // Paginação
  paginaAtual = 1;
  itensPorPagina: number = 10;
  totalItens = 0;
  
  // Ordenação
  campoOrdenacao = 'data';
  direcaoOrdenacao: 'asc' | 'desc' = 'desc';
  
  // Visualização
  modoVisualizacao: 'tabela' | 'cards' = 'tabela';

  constructor(
    private transacaoService: TransacaoService,
    private categoriaService: CategoriaService,
    private instituicaoService: InstituicaoService
  ) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.loading = true;
    
    Promise.all([
      this.transacaoService.listar().toPromise(),
      this.categoriaService.listar().toPromise(),
      this.instituicaoService.listar().toPromise()
    ]).then(([transacoes, categorias, instituicoes]) => {
      this.transacoes = transacoes || [];
      this.categorias = categorias || [];
      this.instituicoes = instituicoes || [];
      this.aplicarFiltros();
      this.loading = false;
    }).catch(error => {
      console.error('Erro ao carregar dados:', error);
      this.loading = false;
    });
  }

  aplicarFiltros(): void {
    let transacoesFiltradas = [...this.transacoes];

    // Filtro por tipo
    if (this.filtroTipo) {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === this.filtroTipo);
    }

    // Filtro por categoria
    if (this.filtroCategoria) {
      const categoriaIdFiltro = Number(this.filtroCategoria);
      transacoesFiltradas = transacoesFiltradas.filter(t => t.categoriaId === categoriaIdFiltro);
    }

    // Filtro por instituição
    if (this.filtroInstituicao) {
      const instituicaoIdFiltro = Number(this.filtroInstituicao);
      transacoesFiltradas = transacoesFiltradas.filter(t => t.instituicaoId === instituicaoIdFiltro);
    }

    // Filtro por período
    if (this.filtroDataInicio) {
      transacoesFiltradas = transacoesFiltradas.filter(t => 
        new Date(t.data) >= new Date(this.filtroDataInicio)
      );
    }
    if (this.filtroDataFim) {
      transacoesFiltradas = transacoesFiltradas.filter(t => 
        new Date(t.data) <= new Date(this.filtroDataFim)
      );
    }

    // Filtro por valor
    if (this.filtroValorMin !== null) {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.valor >= this.filtroValorMin!);
    }
    if (this.filtroValorMax !== null) {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.valor <= this.filtroValorMax!);
    }

    // Aplicar ordenação
    this.ordenarTransacoes(transacoesFiltradas);
    
    this.totalItens = transacoesFiltradas.length;
    this.transacoesFiltradas = transacoesFiltradas;
  }

  ordenarTransacoes(transacoes: Transacao[]): void {
    transacoes.sort((a, b) => {
      let valorA: any, valorB: any;
      
      switch (this.campoOrdenacao) {
        case 'data':
          valorA = new Date(a.data);
          valorB = new Date(b.data);
          break;
        case 'valor':
          valorA = a.valor;
          valorB = b.valor;
          break;
        case 'descricao':
          valorA = a.descricao.toLowerCase();
          valorB = b.descricao.toLowerCase();
          break;
        case 'categoria':
          valorA = a.categoriaNome?.toLowerCase() || '';
          valorB = b.categoriaNome?.toLowerCase() || '';
          break;
        case 'tipo':
          valorA = a.tipo;
          valorB = b.tipo;
          break;
        default:
          return 0;
      }
      
      if (valorA < valorB) {
        return this.direcaoOrdenacao === 'asc' ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.direcaoOrdenacao === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  alterarOrdenacao(campo: string): void {
    if (this.campoOrdenacao === campo) {
      this.direcaoOrdenacao = this.direcaoOrdenacao === 'asc' ? 'desc' : 'asc';
    } else {
      this.campoOrdenacao = campo;
      this.direcaoOrdenacao = 'asc';
    }
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.filtroTipo = '';
    this.filtroCategoria = null;
    this.filtroInstituicao = null;
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    this.filtroValorMin = null;
    this.filtroValorMax = null;
    this.paginaAtual = 1;
    this.aplicarFiltros();
  }

  get transacoesPaginadas(): Transacao[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.transacoesFiltradas.slice(inicio, fim);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalItens / this.itensPorPagina);
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  alterarModoVisualizacao(modo: 'tabela' | 'cards'): void {
    this.modoVisualizacao = modo;
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  onItensPorPaginaChange(): void {
    this.paginaAtual = 1; // Reset para primeira página
    this.aplicarFiltros();
  }
}