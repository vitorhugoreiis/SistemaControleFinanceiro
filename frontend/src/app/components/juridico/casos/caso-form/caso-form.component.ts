import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CasoRequest, CasoResponse, StatusCaso } from '../../../../models/caso.model';
import { ClienteResponse } from '../../../../models/cliente.model';
import { CasoService } from '../../../../services/caso.service';
import { ClienteService } from '../../../../services/cliente.service';
import { AuthService } from '../../../../services/auth.service';
import { TipoUsuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-caso-form',
  templateUrl: './caso-form.component.html',
  styleUrls: ['./caso-form.component.scss']
})
export class CasoFormComponent implements OnInit {
  casoForm: FormGroup;
  isEdicao = false;
  casoId?: number;
  carregando = false;
  salvando = false;
  erro = '';
  sucesso = '';
  
  clientes: ClienteResponse[] = [];
  carregandoClientes = false;
  
  // Opções de status
  statusOptions = [
    { value: StatusCaso.ATIVO, label: 'Ativo' },
    { value: StatusCaso.SUSPENSO, label: 'Suspenso' },
    { value: StatusCaso.ARQUIVADO, label: 'Arquivado' },
    { value: StatusCaso.FINALIZADO, label: 'Finalizado' },
    { value: StatusCaso.CANCELADO, label: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private casoService: CasoService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.casoForm = this.criarFormulario();
  }

  ngOnInit(): void {
    this.verificarPermissao();
    this.carregarClientes();
    this.verificarRota();
  }

  verificarPermissao(): void {
    const usuario = this.authService.getUsuarioAtual();
    if (!usuario || (usuario.tipoUsuario !== TipoUsuario.ADVOGADO && usuario.tipoUsuario !== TipoUsuario.ADMINISTRADOR)) {
      this.router.navigate(['/dashboard']);
      return;
    }
  }

  verificarRota(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const clienteId = this.route.snapshot.queryParamMap.get('clienteId');
    
    if (id) {
      this.isEdicao = true;
      this.casoId = +id;
      this.carregarCaso();
    } else if (clienteId) {
      // Pré-selecionar cliente se fornecido via query param
      this.casoForm.patchValue({ clienteId: +clienteId });
    }
  }

  criarFormulario(): FormGroup {
    return this.fb.group({
      numeroProcesso: [''],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      status: [StatusCaso.ATIVO, [Validators.required]],
      dataInicio: ['', [Validators.required]],
      dataFim: [''],
      valorHonorarios: ['', [Validators.min(0)]],
      honorariosPagos: [false],
      clienteId: ['', [Validators.required]],
      observacoes: ['', [Validators.maxLength(1000)]]
    });
  }

  carregarClientes(): void {
    this.carregandoClientes = true;
    
    this.clienteService.listarClientes().subscribe({
      next: (clientes: any) => {
        this.clientes = clientes;
        this.carregandoClientes = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar clientes:', error);
        this.erro = 'Erro ao carregar lista de clientes';
        this.carregandoClientes = false;
      }
    });
  }

  carregarCaso(): void {
    if (!this.casoId) return;
    
    this.carregando = true;
    this.erro = '';
    
    this.casoService.buscarCasoPorId(this.casoId).subscribe({
      next: (caso) => {
        this.preencherFormulario(caso);
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar caso:', error);
        this.erro = 'Erro ao carregar dados do caso';
        this.carregando = false;
      }
    });
  }

  preencherFormulario(caso: CasoResponse): void {
    this.casoForm.patchValue({
      numeroProcesso: caso.numeroProcesso,
      descricao: caso.descricao,
      status: caso.status,
      dataInicio: caso.dataInicio ? this.formatarDataParaInput(caso.dataInicio) : '',
      dataFim: caso.dataFim ? this.formatarDataParaInput(caso.dataFim) : '',
      valorHonorarios: caso.valorHonorarios,
      honorariosPagos: caso.honorariosPagos,
      clienteId: caso.clienteId,
      observacoes: caso.observacoes
    });
  }

  formatarDataParaInput(data: Date | string | undefined): string {
    if (!data) return '';
    return new Date(data).toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.casoForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    // Validar datas
    if (!this.validarDatas()) {
      return;
    }

    this.salvando = true;
    this.erro = '';
    this.sucesso = '';

    const casoData: CasoRequest = this.prepararDadosCaso();

    const operacao = this.isEdicao
      ? this.casoService.atualizarCaso(this.casoId!, casoData)
      : this.casoService.criarCaso(casoData);

    operacao.subscribe({
      next: (caso) => {
        this.sucesso = `Caso ${this.isEdicao ? 'atualizado' : 'criado'} com sucesso!`;
        this.salvando = false;
        
        setTimeout(() => {
          this.router.navigate(['/juridico/casos']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao salvar caso:', error);
        this.erro = this.obterMensagemErro(error);
        this.salvando = false;
      }
    });
  }

  prepararDadosCaso(): CasoRequest {
    const formValue = this.casoForm.value;
    
    return {
      numeroProcesso: formValue.numeroProcesso || null,
      descricao: formValue.descricao,
      status: formValue.status,
      dataInicio: formValue.dataInicio,
      dataFim: formValue.dataFim || null,
      valorHonorarios: formValue.valorHonorarios || null,
      honorariosPagos: formValue.honorariosPagos || false,
      clienteId: formValue.clienteId,
      observacoes: formValue.observacoes || null
    };
  }

  validarDatas(): boolean {
    const dataInicio = this.casoForm.get('dataInicio')?.value;
    const dataFim = this.casoForm.get('dataFim')?.value;
    
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      
      if (fim < inicio) {
        this.erro = 'A data de fim não pode ser anterior à data de início.';
        return false;
      }
    }
    
    return true;
  }

  obterMensagemErro(error: any): string {
    if (error.status === 400) {
      return 'Dados inválidos. Verifique as informações preenchidas.';
    } else if (error.status === 404) {
      return 'Cliente não encontrado.';
    } else {
      return 'Erro interno do servidor. Tente novamente.';
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.casoForm.controls).forEach(key => {
      this.casoForm.get(key)?.markAsTouched();
    });
  }

  cancelar(): void {
    this.router.navigate(['/juridico/casos']);
  }

  // Formatação de campos
  onNumeroProcessoChange(event: any): void {
    const valor = event.target.value;
    const valorFormatado = this.casoService.formatarNumeroProcesso(valor);
    this.casoForm.patchValue({ numeroProcesso: valorFormatado });
  }

  onValorHonorariosChange(event: any): void {
    let valor = event.target.value;
    
    // Remove caracteres não numéricos exceto vírgula e ponto
    valor = valor.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto
    valor = valor.replace(',', '.');
    
    // Garante apenas um ponto decimal
    const partes = valor.split('.');
    if (partes.length > 2) {
      valor = partes[0] + '.' + partes.slice(1).join('');
    }
    
    this.casoForm.patchValue({ valorHonorarios: valor });
  }

  // Validações de campo
  isCampoInvalido(campo: string): boolean {
    const control = this.casoForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  obterMensagemErroCampo(campo: string): string {
    const control = this.casoForm.get(campo);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) {
      return `${this.obterLabelCampo(campo)} é obrigatório`;
    }
    if (errors['minlength']) {
      return `${this.obterLabelCampo(campo)} deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['maxlength']) {
      return `${this.obterLabelCampo(campo)} deve ter no máximo ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['min']) {
      return `${this.obterLabelCampo(campo)} deve ser maior ou igual a ${errors['min'].min}`;
    }

    return 'Campo inválido';
  }

  obterLabelCampo(campo: string): string {
    const labels: { [key: string]: string } = {
      numeroProcesso: 'Número do Processo',
      descricao: 'Descrição',
      status: 'Status',
      dataInicio: 'Data de Início',
      dataFim: 'Data de Fim',
      valorHonorarios: 'Valor dos Honorários',
      clienteId: 'Cliente',
      observacoes: 'Observações'
    };
    return labels[campo] || campo;
  }

  // Ações auxiliares
  novoCliente(): void {
    this.router.navigate(['/juridico/clientes/novo']);
  }

  onStatusChange(): void {
    const status = this.casoForm.get('status')?.value;
    
    // Se o status for FINALIZADO ou CANCELADO, definir data de fim como hoje
    if ((status === StatusCaso.FINALIZADO || status === StatusCaso.CANCELADO) && !this.casoForm.get('dataFim')?.value) {
      const hoje = new Date().toISOString().split('T')[0];
      this.casoForm.patchValue({ dataFim: hoje });
    }
  }

  calcularDuracao(): string {
    const dataInicio = this.casoForm.get('dataInicio')?.value;
    const dataFim = this.casoForm.get('dataFim')?.value;
    
    if (!dataInicio) return '';
    
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : new Date();
    
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dia';
    return `${diffDays} dias`;
  }

  formatarMoeda(valor: number): string {
    return this.casoService.formatarMoeda(valor);
  }
}