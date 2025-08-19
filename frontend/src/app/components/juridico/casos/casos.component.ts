import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CasoResponse, StatusCaso } from '../../../models/caso.model';
import { ClienteResponse } from '../../../models/cliente.model';
import { CasoService } from '../../../services/caso.service';
import { ClienteService } from '../../../services/cliente.service';
import { AuthService } from '../../../services/auth.service';
import { TipoUsuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-casos',
  templateUrl: './casos.component.html',
  styleUrls: ['./casos.component.scss']
})
export class CasosComponent implements OnInit {
  casos: CasoResponse[] = [];
  clientes: ClienteResponse[] = [];
  casosFiltrados: CasoResponse[] = [];
  
  carregando = false;
  erro = '';
  
  // Filtros
  termoPesquisa = '';
  statusFiltro = '';
  clienteFiltro = '';
  
  // Estatísticas
  totalCasos = 0;
  casosAtivos = 0;
  casosFinalizados = 0;
  totalHonorarios = 0;
  honorariosPagos = 0;
  honorariosPendentes = 0;

  // Opções de status
  statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'SUSPENSO', label: 'Suspenso' },
    { value: 'ARQUIVADO', label: 'Arquivado' },
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  constructor(
    private casoService: CasoService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarPermissao();
    this.carregarDados();
  }

  verificarPermissao(): void {
    const usuario = this.authService.getUsuarioAtual();
    if (!usuario || (usuario.tipoUsuario !== TipoUsuario.ADVOGADO && usuario.tipoUsuario !== TipoUsuario.ADMINISTRADOR)) {
      this.router.navigate(['/dashboard']);
      return;
    }
  }

  carregarDados(): void {
    this.carregando = true;
    this.erro = '';

    // Carregar casos e clientes em paralelo
    Promise.all([
      this.carregarCasos(),
      this.carregarClientes()
    ]).then(() => {
      this.aplicarFiltros();
      this.calcularEstatisticas();
      this.carregando = false;
    }).catch(error => {
      console.error('Erro ao carregar dados:', error);
      this.erro = 'Erro ao carregar dados';
      this.carregando = false;
    });
  }

  carregarCasos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.casoService.listarCasos().subscribe({
        next: (casos: any) => {
          this.casos = casos;
          resolve();
        },
        error: (error: any) => {
          console.error('Erro ao carregar casos:', error);
          resolve();
        }
      });
    });
  }

  carregarClientes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clienteService.listarClientes().subscribe({
        next: (clientes: any) => {
          this.clientes = clientes;
          resolve();
        },
        error: (error: any) => {
          console.error('Erro ao carregar clientes:', error);
          resolve();
        }
      });
    });
  }

  aplicarFiltros(): void {
    let casosFiltrados = [...this.casos];

    // Filtro por termo de pesquisa
    if (this.termoPesquisa.trim()) {
      const termo = this.termoPesquisa.toLowerCase().trim();
      casosFiltrados = casosFiltrados.filter(caso =>
        caso.descricao.toLowerCase().includes(termo) ||
        (caso.numeroProcesso && caso.numeroProcesso.toLowerCase().includes(termo)) ||
        caso.clienteNome.toLowerCase().includes(termo)
      );
    }

    // Filtro por status
    if (this.statusFiltro) {
      casosFiltrados = casosFiltrados.filter(caso => caso.status === this.statusFiltro);
    }

    // Filtro por cliente
    if (this.clienteFiltro) {
      casosFiltrados = casosFiltrados.filter(caso => caso.clienteId === +this.clienteFiltro);
    }

    this.casosFiltrados = casosFiltrados;
  }

  calcularEstatisticas(): void {
    this.totalCasos = this.casos.length;
    this.casosAtivos = this.casos.filter(caso => caso.status === 'ATIVO').length;
    this.casosFinalizados = this.casos.filter(caso => caso.status === 'FINALIZADO').length;
    
    this.totalHonorarios = this.casos.reduce((total, caso) => total + (caso.valorHonorarios || 0), 0);
    this.honorariosPagos = this.casos
      .filter(caso => caso.honorariosPagos)
      .reduce((total, caso) => total + (caso.valorHonorarios || 0), 0);
    this.honorariosPendentes = this.totalHonorarios - this.honorariosPagos;
  }

  onPesquisaChange(): void {
    this.aplicarFiltros();
  }

  onStatusChange(): void {
    this.aplicarFiltros();
  }

  onClienteChange(): void {
    this.aplicarFiltros();
  }

  limparFiltros(): void {
    this.termoPesquisa = '';
    this.statusFiltro = '';
    this.clienteFiltro = '';
    this.aplicarFiltros();
  }

  novoCaso(): void {
    this.router.navigate(['/juridico/casos/novo']);
  }

  verCaso(casoId: number): void {
    this.router.navigate(['/juridico/casos/detalhes', casoId]);
  }

  editarCaso(casoId: number): void {
    this.router.navigate(['/juridico/casos/editar', casoId]);
  }

  excluirCaso(caso: CasoResponse): void {
    const confirmacao = confirm(
      `Tem certeza que deseja excluir o caso "${caso.descricao}"?\n\n` +
      'Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.'
    );

    if (confirmacao) {
      this.casoService.excluirCaso(caso.id).subscribe({
        next: () => {
          this.casos = this.casos.filter(c => c.id !== caso.id);
          this.aplicarFiltros();
          this.calcularEstatisticas();
          alert('Caso excluído com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir caso:', error);
          alert('Erro ao excluir caso. Tente novamente.');
        }
      });
    }
  }

  // Formatação e utilitários
  formatarMoeda(valor: number): string {
    return this.casoService.formatarMoeda(valor);
  }

  obterCorStatus(status: StatusCaso): string {
    return this.casoService.obterCorStatus(status);
  }

  obterIconeStatus(status: StatusCaso): string {
    return this.casoService.obterIconeStatus(status);
  }

  formatarData(data: Date | string | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  calcularDiasDesdeInicio(dataInicio: Date | string | undefined): number {
    if (!dataInicio) return 0;
    const inicio = new Date(dataInicio);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  obterNomeCliente(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  }

  obterIniciais(nome: string): string {
    return nome
      .split(' ')
      .map(parte => parte.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  obterCorAvatar(nome: string): string {
    const cores = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    const indice = nome.length % cores.length;
    return cores[indice];
  }

  // Navegação para cliente
  verCliente(clienteId: number): void {
    this.router.navigate(['/juridico/clientes/detalhes', clienteId]);
  }

  // Ações rápidas
  marcarHonorariosPago(caso: CasoResponse): void {
    const casoAtualizado = { ...caso, honorariosPagos: caso.valorHonorarios || 0 };
    
    this.casoService.atualizarCaso(caso.id, casoAtualizado).subscribe({
      next: (casoResponse) => {
        const index = this.casos.findIndex(c => c.id === caso.id);
        if (index !== -1) {
          this.casos[index] = casoResponse;
          this.aplicarFiltros();
          this.calcularEstatisticas();
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar honorários:', error);
        alert('Erro ao atualizar honorários. Tente novamente.');
      }
    });
  }

  marcarHonorariosPendente(caso: CasoResponse): void {
    const casoAtualizado = { ...caso, honorariosPagos: 0 };
    
    this.casoService.atualizarCaso(caso.id, casoAtualizado).subscribe({
      next: (casoResponse) => {
        const index = this.casos.findIndex(c => c.id === caso.id);
        if (index !== -1) {
          this.casos[index] = casoResponse;
          this.aplicarFiltros();
          this.calcularEstatisticas();
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar honorários:', error);
        alert('Erro ao atualizar honorários. Tente novamente.');
      }
    });
  }
}