import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteRequest, ClienteResponse } from '../../../../models/cliente.model';
import { ClienteService } from '../../../../services/cliente.service';
import { AuthService } from '../../../../services/auth.service';
import { TipoUsuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup;
  isEdicao = false;
  clienteId?: number;
  carregando = false;
  salvando = false;
  erro = '';
  sucesso = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.clienteForm = this.criarFormulario();
  }

  ngOnInit(): void {
    this.verificarPermissao();
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
    if (id) {
      this.isEdicao = true;
      this.clienteId = +id;
      this.carregarCliente();
    }
  }

  criarFormulario(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      cpfCnpj: ['', [Validators.required, this.validadorCpfCnpj.bind(this)]],
      telefone: [''],
      email: ['', [Validators.email]],
      endereco: ['', [Validators.maxLength(200)]],
      cidade: ['', [Validators.maxLength(50)]],
      estado: ['', [Validators.maxLength(2)]],
      cep: [''],
      observacoes: ['', [Validators.maxLength(1000)]]
    });
  }

  validadorCpfCnpj(control: any) {
    if (!control.value) {
      return null;
    }
    
    const isValid = this.clienteService.validarCpfCnpj(control.value);
    return isValid ? null : { cpfCnpjInvalido: true };
  }

  carregarCliente(): void {
    if (!this.clienteId) return;
    
    this.carregando = true;
    this.erro = '';
    
    this.clienteService.buscarClientePorId(this.clienteId).subscribe({
      next: (cliente) => {
        this.preencherFormulario(cliente);
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.erro = 'Erro ao carregar dados do cliente';
        this.carregando = false;
      }
    });
  }

  preencherFormulario(cliente: ClienteResponse): void {
    this.clienteForm.patchValue({
      nome: cliente.nome,
      cpfCnpj: cliente.cpfCnpj,
      telefone: cliente.telefone,
      email: cliente.email,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
      cep: cliente.cep,
      observacoes: cliente.observacoes
    });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.salvando = true;
    this.erro = '';
    this.sucesso = '';

    const clienteData: ClienteRequest = this.clienteForm.value;

    const operacao = this.isEdicao
      ? this.clienteService.atualizarCliente(this.clienteId!, clienteData)
      : this.clienteService.criarCliente(clienteData);

    operacao.subscribe({
      next: (cliente) => {
        this.sucesso = `Cliente ${this.isEdicao ? 'atualizado' : 'criado'} com sucesso!`;
        this.salvando = false;
        
        setTimeout(() => {
          this.router.navigate(['/juridico/clientes']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erro ao salvar cliente:', error);
        this.erro = this.obterMensagemErro(error);
        this.salvando = false;
      }
    });
  }

  obterMensagemErro(error: any): string {
    if (error.status === 400) {
      return 'Dados inválidos. Verifique as informações preenchidas.';
    } else if (error.status === 409) {
      return 'Já existe um cliente com este CPF/CNPJ.';
    } else {
      return 'Erro interno do servidor. Tente novamente.';
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      this.clienteForm.get(key)?.markAsTouched();
    });
  }

  cancelar(): void {
    this.router.navigate(['/juridico/clientes']);
  }

  // Formatação de campos
  onCpfCnpjChange(event: any): void {
    const valor = event.target.value;
    const valorFormatado = this.clienteService.formatarCpfCnpj(valor);
    this.clienteForm.patchValue({ cpfCnpj: valorFormatado });
  }

  onTelefoneChange(event: any): void {
    const valor = event.target.value;
    const valorFormatado = this.clienteService.formatarTelefone(valor);
    this.clienteForm.patchValue({ telefone: valorFormatado });
  }

  onCepChange(event: any): void {
    const valor = event.target.value;
    const valorFormatado = this.clienteService.formatarCep(valor);
    this.clienteForm.patchValue({ cep: valorFormatado });
  }

  // Validações de campo
  isCampoInvalido(campo: string): boolean {
    const control = this.clienteForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  obterMensagemErroCampo(campo: string): string {
    const control = this.clienteForm.get(campo);
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
    if (errors['email']) {
      return 'Email inválido';
    }
    if (errors['cpfCnpjInvalido']) {
      return 'CPF/CNPJ inválido';
    }

    return 'Campo inválido';
  }

  obterLabelCampo(campo: string): string {
    const labels: { [key: string]: string } = {
      nome: 'Nome',
      cpfCnpj: 'CPF/CNPJ',
      telefone: 'Telefone',
      email: 'Email',
      endereco: 'Endereço',
      cidade: 'Cidade',
      estado: 'Estado',
      cep: 'CEP',
      observacoes: 'Observações'
    };
    return labels[campo] || campo;
  }

  // Estados brasileiros
  obterEstados(): { sigla: string; nome: string }[] {
    return [
      { sigla: 'AC', nome: 'Acre' },
      { sigla: 'AL', nome: 'Alagoas' },
      { sigla: 'AP', nome: 'Amapá' },
      { sigla: 'AM', nome: 'Amazonas' },
      { sigla: 'BA', nome: 'Bahia' },
      { sigla: 'CE', nome: 'Ceará' },
      { sigla: 'DF', nome: 'Distrito Federal' },
      { sigla: 'ES', nome: 'Espírito Santo' },
      { sigla: 'GO', nome: 'Goiás' },
      { sigla: 'MA', nome: 'Maranhão' },
      { sigla: 'MT', nome: 'Mato Grosso' },
      { sigla: 'MS', nome: 'Mato Grosso do Sul' },
      { sigla: 'MG', nome: 'Minas Gerais' },
      { sigla: 'PA', nome: 'Pará' },
      { sigla: 'PB', nome: 'Paraíba' },
      { sigla: 'PR', nome: 'Paraná' },
      { sigla: 'PE', nome: 'Pernambuco' },
      { sigla: 'PI', nome: 'Piauí' },
      { sigla: 'RJ', nome: 'Rio de Janeiro' },
      { sigla: 'RN', nome: 'Rio Grande do Norte' },
      { sigla: 'RS', nome: 'Rio Grande do Sul' },
      { sigla: 'RO', nome: 'Rondônia' },
      { sigla: 'RR', nome: 'Roraima' },
      { sigla: 'SC', nome: 'Santa Catarina' },
      { sigla: 'SP', nome: 'São Paulo' },
      { sigla: 'SE', nome: 'Sergipe' },
      { sigla: 'TO', nome: 'Tocantins' }
    ];
  }
}