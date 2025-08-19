import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteResponse } from '../../../../models/cliente.model';
import { CasoResponse, StatusCaso } from '../../../../models/caso.model';
import { ClienteService } from '../../../../services/cliente.service';
import { CasoService } from '../../../../services/caso.service';
import { AuthService } from '../../../../services/auth.service';
import { TipoUsuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-cliente-detalhes',
  templateUrl: './cliente-detalhes.component.html',
  styleUrls: ['./cliente-detalhes.component.scss']
})
export class ClienteDetalhesComponent implements OnInit {
  cliente?: ClienteResponse;
  casos: CasoResponse[] = [];
  clienteId!: number;
  carregando = false;
  carregandoCasos = false;
  erro = '';
  erroCasos = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private casoService: CasoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.verificarPermissao();
    this.obterClienteId();
    this.carregarCliente();
    this.carregarCasos();
  }

  verificarPermissao(): void {
    const usuario = this.authService.getUsuarioAtual();
    if (!usuario || (usuario.tipoUsuario !== TipoUsuario.ADVOGADO && usuario.tipoUsuario !== TipoUsuario.ADMINISTRADOR)) {
      this.router.navigate(['/dashboard']);
      return;
    }
  }

  obterClienteId(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/juridico/clientes']);
      return;
    }
    this.clienteId = +id;
  }

  carregarCliente(): void {
    this.carregando = true;
    this.erro = '';

    this.clienteService.buscarClientePorId(this.clienteId).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.erro = 'Erro ao carregar dados do cliente';
        this.carregando = false;
      }
    });
  }

  carregarCasos(): void {
    this.carregandoCasos = true;
    this.erroCasos = '';

    this.casoService.listarCasosPorCliente(this.clienteId).subscribe({
      next: (casos) => {
        this.casos = casos;
        this.carregandoCasos = false;
      },
      error: (error) => {
        console.error('Erro ao carregar casos:', error);
        this.erroCasos = 'Erro ao carregar casos do cliente';
        this.carregandoCasos = false;
      }
    });
  }

  editarCliente(): void {
    this.router.navigate(['/juridico/clientes/editar', this.clienteId]);
  }

  excluirCliente(): void {
    if (!this.cliente) return;

    const confirmacao = confirm(
      `Tem certeza que deseja excluir o cliente "${this.cliente.nome}"?\n\n` +
      'Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.'
    );

    if (confirmacao) {
      this.clienteService.excluirCliente(this.clienteId).subscribe({
        next: () => {
          alert('Cliente excluído com sucesso!');
          this.router.navigate(['/juridico/clientes']);
        },
        error: (error) => {
          console.error('Erro ao excluir cliente:', error);
          if (error.status === 400) {
            alert('Não é possível excluir este cliente pois ele possui casos ativos.');
          } else {
            alert('Erro ao excluir cliente. Tente novamente.');
          }
        }
      });
    }
  }

  novoCaso(): void {
    this.router.navigate(['/juridico/casos/novo'], {
      queryParams: { clienteId: this.clienteId }
    });
  }

  verCaso(casoId: number): void {
    this.router.navigate(['/juridico/casos/detalhes', casoId]);
  }

  voltarParaLista(): void {
    this.router.navigate(['/juridico/clientes']);
  }

  // Formatação e utilitários
  formatarCpfCnpj(cpfCnpj: string): string {
    return this.clienteService.formatarCpfCnpj(cpfCnpj);
  }

  formatarTelefone(telefone: string): string {
    return this.clienteService.formatarTelefone(telefone);
  }

  formatarCep(cep: string): string {
    return this.clienteService.formatarCep(cep);
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

  formatarMoeda(valor: number): string {
    return this.casoService.formatarMoeda(valor);
  }

  obterStatusCor(status: StatusCaso): string {
    return this.casoService.obterCorStatus(status);
  }

  obterStatusIcone(status: StatusCaso): string {
    return this.casoService.obterIconeStatus(status);
  }

  calcularTotalHonorarios(): number {
    return this.casos.reduce((total, caso) => total + (caso.valorHonorarios || 0), 0);
  }

  calcularTotalPago(): number {
    return this.casos
      .reduce((total, caso) => total + (caso.honorariosPagos || 0), 0);
  }

  calcularTotalPendente(): number {
    return this.casos
      .reduce((total, caso) => total + ((caso.valorHonorarios || 0) - (caso.honorariosPagos || 0)), 0);
  }

  obterCasosAtivos(): CasoResponse[] {
    return this.casos.filter(caso => caso.status === 'ATIVO');
  }

  obterCasosFinalizados(): CasoResponse[] {
    return this.casos.filter(caso => caso.status === 'FINALIZADO');
  }

  formatarData(data: Date | string | undefined): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  calcularDiasDesdeInicio(dataInicio: Date | undefined): number {
    if (!dataInicio) return 0;
    const inicio = new Date(dataInicio);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}