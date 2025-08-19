import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteResponse } from '../../../models/cliente.model';
import { ClienteService } from '../../../services/cliente.service';
import { AuthService } from '../../../services/auth.service';
import { TipoUsuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit {
  clientes: ClienteResponse[] = [];
  clientesFiltrados: ClienteResponse[] = [];
  carregando = false;
  erro = '';
  termoBusca = '';
  totalClientes = 0;

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.verificarPermissao();
    this.carregarClientes();
    this.carregarContadores();
  }

  verificarPermissao(): void {
    const usuario = this.authService.getUsuarioAtual();
    if (!usuario || (usuario.tipoUsuario !== TipoUsuario.ADVOGADO && usuario.tipoUsuario !== TipoUsuario.ADMINISTRADOR)) {
      this.router.navigate(['/dashboard']);
      return;
    }
  }

  carregarClientes(): void {
    this.carregando = true;
    this.erro = '';
    
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.clientesFiltrados = clientes;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.erro = 'Erro ao carregar a lista de clientes';
        this.carregando = false;
      }
    });
  }

  carregarContadores(): void {
    this.clienteService.contarClientes().subscribe({
      next: (total) => {
        this.totalClientes = total;
      },
      error: (error) => {
        console.error('Erro ao carregar contadores:', error);
      }
    });
  }

  buscarClientes(): void {
    if (!this.termoBusca.trim()) {
      this.clientesFiltrados = this.clientes;
      return;
    }

    this.carregando = true;
    this.clienteService.buscarClientes(this.termoBusca).subscribe({
      next: (clientes) => {
        this.clientesFiltrados = clientes;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao buscar clientes:', error);
        this.erro = 'Erro ao buscar clientes';
        this.carregando = false;
      }
    });
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.clientesFiltrados = this.clientes;
  }

  novoCliente(): void {
    this.router.navigate(['/juridico/clientes/novo']);
  }

  editarCliente(id: number): void {
    this.router.navigate(['/juridico/clientes/editar', id]);
  }

  visualizarCliente(id: number): void {
    this.router.navigate(['/juridico/clientes/detalhes', id]);
  }

  excluirCliente(cliente: ClienteResponse): void {
    if (confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      this.carregando = true;
      
      this.clienteService.excluirCliente(cliente.id).subscribe({
        next: () => {
          this.carregarClientes();
          this.carregarContadores();
        },
        error: (error) => {
          console.error('Erro ao excluir cliente:', error);
          this.erro = 'Erro ao excluir cliente. Verifique se não há casos associados.';
          this.carregando = false;
        }
      });
    }
  }

  formatarCpfCnpj(cpfCnpj: string): string {
    return this.clienteService.formatarCpfCnpj(cpfCnpj);
  }

  formatarTelefone(telefone: string): string {
    if (!telefone) return '';
    return this.clienteService.formatarTelefone(telefone);
  }

  obterIniciais(nome: string): string {
    return nome
      .split(' ')
      .map(palavra => palavra.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  obterCorAvatar(nome: string): string {
    const cores = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return cores[Math.abs(hash) % cores.length];
  }
}