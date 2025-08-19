import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Caso, StatusCaso } from '../../../models/caso.model';
import { Cliente } from '../../../models/cliente.model';
import { CasoService } from '../../../services/caso.service';
import { ClienteService } from '../../../services/cliente.service';
import { AuthService } from '../../../services/auth.service';
import { TipoUsuario } from '../../../models/usuario.model';

interface HonorarioInfo {
  caso: Caso;
  cliente: Cliente;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  percentualPago: number;
  diasAtraso?: number;
}

interface EstatisticasHonorarios {
  totalCasos: number;
  valorTotalHonorarios: number;
  valorPago: number;
  valorPendente: number;
  percentualRecebimento: number;
  casosComAtraso: number;
}

@Component({
  selector: 'app-honorarios',
  templateUrl: './honorarios.component.html',
  styleUrls: ['./honorarios.component.scss']
})
export class HonorariosComponent implements OnInit {
  honorarios: HonorarioInfo[] = [];
  honorariosFiltrados: HonorarioInfo[] = [];
  estatisticas: EstatisticasHonorarios = {
    totalCasos: 0,
    valorTotalHonorarios: 0,
    valorPago: 0,
    valorPendente: 0,
    percentualRecebimento: 0,
    casosComAtraso: 0
  };

  carregando = true;
  erro: string | null = null;
  filtroStatus = 'todos';
  filtroCliente = '';
  ordenacao = 'valor-desc';
  podeEditar = false;

  // Enums para template
  StatusCaso = StatusCaso;
  TipoUsuario = TipoUsuario;

  constructor(
    private router: Router,
    private casoService: CasoService,
    private clienteService: ClienteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.verificarPermissoes();
    this.carregarHonorarios();
  }

  private verificarPermissoes(): void {
    const usuario = this.authService.getUsuarioAtual();
    if (usuario) {
      this.podeEditar = usuario.tipoUsuario === TipoUsuario.ADMINISTRADOR || 
                       usuario.tipoUsuario === TipoUsuario.ADVOGADO;
    }
  }

  carregarHonorarios(): void {
    this.carregando = true;
    this.erro = null;

    const usuario = this.authService.getUsuarioAtual();
    if (!usuario) {
      this.erro = 'Usuário não autenticado';
      this.carregando = false;
      return;
    }

    // Carregar casos do advogado logado
    this.casoService.listarCasos().subscribe({
      next: (casos: any) => {
        this.processarHonorarios(casos);
      },
      error: (error: any) => {
        console.error('Erro ao carregar casos:', error);
        this.erro = 'Erro ao carregar dados dos honorários';
        this.carregando = false;
      }
    });
  }

  private async processarHonorarios(casos: Caso[]): Promise<void> {
    const honorariosPromises = casos
      .filter(caso => caso.valorHonorarios && caso.valorHonorarios > 0)
      .map(async (caso) => {
        try {
          const cliente = await this.clienteService.buscarClientePorId(caso.clienteId).toPromise();
          if (!cliente) return null;

          const valorTotal = caso.valorHonorarios || 0;
          const valorPago = caso.honorariosPagos ? valorTotal : 0;
          const valorPendente = valorTotal - valorPago;
          const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;

          let diasAtraso: number | undefined;
          if (!caso.honorariosPagos && caso.dataInicio) {
            const dataInicio = new Date(caso.dataInicio);
            const hoje = new Date();
            const diffTime = hoje.getTime() - dataInicio.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 30) { // Considera atraso após 30 dias
              diasAtraso = diffDays - 30;
            }
          }

          return {
            caso,
            cliente,
            valorTotal,
            valorPago,
            valorPendente,
            percentualPago,
            diasAtraso
          } as HonorarioInfo;
        } catch (error) {
          console.error('Erro ao processar caso:', caso.id, error);
          return null;
        }
      });

    const resultados = await Promise.all(honorariosPromises);
    this.honorarios = resultados.filter(h => h !== null) as HonorarioInfo[];
    
    this.calcularEstatisticas();
    this.aplicarFiltros();
    this.carregando = false;
  }

  private calcularEstatisticas(): void {
    const totalCasos = this.honorarios.length;
    const valorTotalHonorarios = this.honorarios.reduce((sum, h) => sum + h.valorTotal, 0);
    const valorPago = this.honorarios.reduce((sum, h) => sum + h.valorPago, 0);
    const valorPendente = this.honorarios.reduce((sum, h) => sum + h.valorPendente, 0);
    const percentualRecebimento = valorTotalHonorarios > 0 ? (valorPago / valorTotalHonorarios) * 100 : 0;
    const casosComAtraso = this.honorarios.filter(h => h.diasAtraso && h.diasAtraso > 0).length;

    this.estatisticas = {
      totalCasos,
      valorTotalHonorarios,
      valorPago,
      valorPendente,
      percentualRecebimento,
      casosComAtraso
    };
  }

  aplicarFiltros(): void {
    let filtrados = [...this.honorarios];

    // Filtro por status de pagamento
    if (this.filtroStatus === 'pagos') {
      filtrados = filtrados.filter(h => h.valorPago >= h.valorTotal);
    } else if (this.filtroStatus === 'pendentes') {
      filtrados = filtrados.filter(h => h.valorPendente > 0);
    } else if (this.filtroStatus === 'atraso') {
      filtrados = filtrados.filter(h => h.diasAtraso && h.diasAtraso > 0);
    }

    // Filtro por cliente
    if (this.filtroCliente.trim()) {
      const termo = this.filtroCliente.toLowerCase().trim();
      filtrados = filtrados.filter(h => 
        h.cliente.nome.toLowerCase().includes(termo) ||
        h.cliente.cpfCnpj.includes(termo)
      );
    }

    // Ordenação
    filtrados.sort((a, b) => {
      switch (this.ordenacao) {
        case 'valor-desc':
          return b.valorTotal - a.valorTotal;
        case 'valor-asc':
          return a.valorTotal - b.valorTotal;
        case 'cliente':
          return a.cliente.nome.localeCompare(b.cliente.nome);
        case 'data':
          return new Date(b.caso.dataInicio || '').getTime() - new Date(a.caso.dataInicio || '').getTime();
        case 'atraso':
          return (b.diasAtraso || 0) - (a.diasAtraso || 0);
        default:
          return 0;
      }
    });

    this.honorariosFiltrados = filtrados;
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  marcarComoPago(honorario: HonorarioInfo): void {
    if (!this.podeEditar) return;

    const confirmacao = confirm(
      `Confirmar pagamento dos honorários do caso "${honorario.caso.descricao}"?\n\n` +
      `Valor: ${this.formatarMoeda(honorario.valorTotal)}\n` +
      `Cliente: ${honorario.cliente.nome}`
    );

    if (confirmacao) {
      const casoAtualizado = { ...honorario.caso, honorariosPagos: honorario.valorTotal };
      
      this.casoService.atualizarCaso(casoAtualizado.id!, casoAtualizado).subscribe({
        next: () => {
          honorario.caso.honorariosPagos = honorario.valorTotal;
          honorario.valorPago = honorario.valorTotal;
          honorario.valorPendente = 0;
          honorario.percentualPago = 100;
          honorario.diasAtraso = undefined;
          
          this.calcularEstatisticas();
          this.aplicarFiltros();
          
          alert('Pagamento registrado com sucesso!');
        },
        error: (error: any) => {
          console.error('Erro ao atualizar pagamento:', error);
          alert('Erro ao registrar pagamento. Tente novamente.');
        }
      });
    }
  }

  marcarComoPendente(honorario: HonorarioInfo): void {
    if (!this.podeEditar) return;

    const confirmacao = confirm(
      `Marcar honorários como pendentes para o caso "${honorario.caso.descricao}"?\n\n` +
      `Valor: ${this.formatarMoeda(honorario.valorTotal)}\n` +
      `Cliente: ${honorario.cliente.nome}`
    );

    if (confirmacao) {
      const casoAtualizado = { ...honorario.caso, honorariosPagos: 0 };
      
      this.casoService.atualizarCaso(casoAtualizado.id!, casoAtualizado).subscribe({
        next: () => {
          honorario.caso.honorariosPagos = 0;
          honorario.valorPago = 0;
          honorario.valorPendente = honorario.valorTotal;
          honorario.percentualPago = 0;
          
          // Recalcular dias de atraso
          if (honorario.caso.dataInicio) {
            const dataInicio = new Date(honorario.caso.dataInicio);
            const hoje = new Date();
            const diffTime = hoje.getTime() - dataInicio.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 30) {
              honorario.diasAtraso = diffDays - 30;
            }
          }
          
          this.calcularEstatisticas();
          this.aplicarFiltros();
          
          alert('Status atualizado com sucesso!');
        },
        error: (error: any) => {
          console.error('Erro ao atualizar status:', error);
          alert('Erro ao atualizar status. Tente novamente.');
        }
      });
    }
  }

  verCaso(caso: Caso): void {
    this.router.navigate(['/juridico/casos/detalhes', caso.id]);
  }

  verCliente(cliente: Cliente): void {
    this.router.navigate(['/juridico/clientes/detalhes', cliente.id]);
  }

  editarCaso(caso: Caso): void {
    this.router.navigate(['/juridico/casos/editar', caso.id]);
  }

  // Métodos de formatação e utilitários
  formatarMoeda(valor: number): string {
    return this.casoService.formatarMoeda(valor);
  }

  formatarData(data: string | Date | undefined): string {
    if (!data) return '-';
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR');
  }

  formatarCpfCnpj(documento: string): string {
    return this.clienteService.formatarCpfCnpj(documento);
  }

  obterCorStatus(status: StatusCaso): string {
    return this.casoService.obterCorStatus(status);
  }

  obterIconeStatus(status: StatusCaso): string {
    return this.casoService.obterIconeStatus(status);
  }

  obterLabelStatus(status: StatusCaso): string {
    const labels = {
      [StatusCaso.ATIVO]: 'Ativo',
      [StatusCaso.SUSPENSO]: 'Suspenso',
      [StatusCaso.ARQUIVADO]: 'Arquivado',
      [StatusCaso.FINALIZADO]: 'Finalizado',
      [StatusCaso.CANCELADO]: 'Cancelado'
    };
    return labels[status] || status;
  }

  gerarCorAvatar(nome: string): string {
    const cores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    return cores[Math.abs(hash) % cores.length];
  }

  obterIniciais(nome: string): string {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  obterCorPagamento(honorario: HonorarioInfo): string {
    if (honorario.percentualPago >= 100) {
      return '#28a745'; // Verde - Pago
    } else if (honorario.diasAtraso && honorario.diasAtraso > 0) {
      return '#dc3545'; // Vermelho - Em atraso
    } else {
      return '#ffc107'; // Amarelo - Pendente
    }
  }

  obterIconePagamento(honorario: HonorarioInfo): string {
    if (honorario.percentualPago >= 100) {
      return 'fas fa-check-circle';
    } else if (honorario.diasAtraso && honorario.diasAtraso > 0) {
      return 'fas fa-exclamation-triangle';
    } else {
      return 'fas fa-clock';
    }
  }

  obterTextoPagamento(honorario: HonorarioInfo): string {
    if (honorario.percentualPago >= 100) {
      return 'Pago';
    } else if (honorario.diasAtraso && honorario.diasAtraso > 0) {
      return `${honorario.diasAtraso} dias de atraso`;
    } else {
      return 'Pendente';
    }
  }
}