import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Caso, CasoResponse, StatusCaso } from '../../../../models/caso.model';
import { Cliente } from '../../../../models/cliente.model';
import { CasoService } from '../../../../services/caso.service';
import { ClienteService } from '../../../../services/cliente.service';
import { AuthService } from '../../../../services/auth.service';
import { TipoUsuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-caso-detalhes',
  templateUrl: './caso-detalhes.component.html',
  styleUrls: ['./caso-detalhes.component.scss']
})
export class CasoDetalhesComponent implements OnInit {
  caso: CasoResponse | null = null;
  cliente: Cliente | null = null;
  carregando = true;
  erro: string | null = null;
  podeEditar = false;
  podeDeletar = false;

  // Enums para template
  StatusCaso = StatusCaso;
  TipoUsuario = TipoUsuario;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casoService: CasoService,
    private clienteService: ClienteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.verificarPermissoes();
    this.carregarCaso();
  }

  private verificarPermissoes(): void {
    const usuario = this.authService.getUsuarioAtual();
    if (usuario) {
      this.podeEditar = usuario.tipoUsuario === TipoUsuario.ADMINISTRADOR || 
                       usuario.tipoUsuario === TipoUsuario.ADVOGADO;
      this.podeDeletar = usuario.tipoUsuario === TipoUsuario.ADMINISTRADOR || 
                        usuario.tipoUsuario === TipoUsuario.ADVOGADO;
    }
  }

  private carregarCaso(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.erro = 'ID do caso não fornecido';
      this.carregando = false;
      return;
    }

    this.casoService.buscarCasoPorId(+id).subscribe({
      next: (caso: any) => {
        this.caso = caso;
        this.carregarCliente(caso.clienteId);
      },
      error: (error: any) => {
        console.error('Erro ao carregar caso:', error);
        this.erro = 'Erro ao carregar dados do caso';
        this.carregando = false;
      }
    });
  }

  private carregarCliente(clienteId: number): void {
    this.clienteService.buscarClientePorId(clienteId).subscribe({
      next: (cliente: any) => {
        this.cliente = cliente;
        this.carregando = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar cliente:', error);
        this.erro = 'Erro ao carregar dados do cliente';
        this.carregando = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/juridico/casos']);
  }

  editarCaso(): void {
    if (this.caso) {
      this.router.navigate(['/juridico/casos/editar', this.caso.id]);
    }
  }

  excluirCaso(): void {
    if (!this.caso) return;

    const confirmacao = confirm(
      `Tem certeza que deseja excluir o caso "${this.caso.descricao}"?\n\n` +
      'Esta ação não pode ser desfeita.'
    );

    if (confirmacao) {
      this.casoService.excluirCaso(this.caso.id).subscribe({
        next: () => {
          alert('Caso excluído com sucesso!');
          this.router.navigate(['/juridico/casos']);
        },
        error: (error: any) => {
          console.error('Erro ao excluir caso:', error);
          alert('Erro ao excluir caso. Tente novamente.');
        }
      });
    }
  }

  verCliente(): void {
    if (this.cliente) {
      this.router.navigate(['/juridico/clientes/detalhes', this.cliente.id]);
    }
  }

  // Métodos de formatação e utilitários
  formatarMoeda(valor: number | null | undefined): string {
    return this.casoService.formatarMoeda(valor || 0);
  }

  formatarData(data: string | Date | null | undefined): string {
    if (!data) return 'Não informado';
    
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR');
  }

  formatarNumeroProcesso(numero: string | null | undefined): string {
    return this.casoService.formatarNumeroProcesso(numero || '');
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

  calcularDuracao(): string {
    if (!this.caso?.dataInicio) return '';
    
    const inicio = new Date(this.caso.dataInicio);
    const fim = this.caso.dataFim ? new Date(this.caso.dataFim) : new Date();
    
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      const diasRestantes = diffDays % 30;
      let resultado = `${meses} mês${meses !== 1 ? 'es' : ''}`;
      if (diasRestantes > 0) {
        resultado += ` e ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`;
      }
      return resultado;
    } else {
      const anos = Math.floor(diffDays / 365);
      const diasRestantes = diffDays % 365;
      let resultado = `${anos} ano${anos !== 1 ? 's' : ''}`;
      if (diasRestantes > 0) {
        const meses = Math.floor(diasRestantes / 30);
        if (meses > 0) {
          resultado += ` e ${meses} mês${meses !== 1 ? 'es' : ''}`;
        }
      }
      return resultado;
    }
  }

  obterStatusPagamento(): { texto: string; cor: string; icone: string } {
    if (!this.caso?.valorHonorarios || this.caso.valorHonorarios <= 0) {
      return {
        texto: 'Sem honorários definidos',
        cor: '#6c757d',
        icone: 'fas fa-minus-circle'
      };
    }

    if (this.caso.honorariosPagos) {
      return {
        texto: 'Honorários pagos',
        cor: '#28a745',
        icone: 'fas fa-check-circle'
      };
    } else {
      return {
        texto: 'Honorários pendentes',
        cor: '#dc3545',
        icone: 'fas fa-exclamation-circle'
      };
    }
  }

  formatarCpfCnpj(documento: string): string {
    return this.clienteService.formatarCpfCnpj(documento);
  }

  formatarTelefone(telefone: string): string {
    return this.clienteService.formatarTelefone(telefone);
  }

  gerarCorAvatar(nome: string): string {
    const cores = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    const indice = nome.length % cores.length;
    return cores[indice];
  }

  obterIniciais(nome: string): string {
    return nome
      .split(' ')
      .map(parte => parte.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}