import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario, TipoUsuario } from '../../models/usuario.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  perfilForm: FormGroup;
  
  successMessage = '';
  errorMessage = '';
  loading = false;
  
  showPasswordFields = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.perfilForm = this.formBuilder.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senhaAtual: [''],
      novaSenha: [''],
      confirmacaoNovaSenha: ['']
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.perfilForm.patchValue({
          nome: usuario.nome,
          email: usuario.email
        });
      }
    });
  }
  
  checkPasswords(group: FormGroup) {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmacaoNovaSenha = group.get('confirmacaoNovaSenha')?.value;
    
    if (novaSenha || confirmacaoNovaSenha) {
      return novaSenha === confirmacaoNovaSenha ? null : { notSame: true };
    }
    return null;
  }
  
  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      this.perfilForm.patchValue({
        senhaAtual: '',
        novaSenha: '',
        confirmacaoNovaSenha: ''
      });
    }
    this.clearMessages();
  }
  
  onSalvarPerfil(): void {
    if (!this.usuario || !this.usuario.id) {
      return;
    }
    
    const formValue = this.perfilForm.value;
    const isPasswordChange = this.showPasswordFields && formValue.novaSenha;
    const isEmailChange = formValue.email !== this.usuario.email;
    const isNameChange = formValue.nome !== this.usuario.nome;
    
    // Validações específicas
    if (isPasswordChange && (!formValue.senhaAtual || !formValue.novaSenha || !formValue.confirmacaoNovaSenha)) {
      this.errorMessage = 'Para alterar a senha, preencha todos os campos de senha.';
      return;
    }
    
    if (isPasswordChange && formValue.novaSenha !== formValue.confirmacaoNovaSenha) {
      this.errorMessage = 'A nova senha e confirmação devem ser iguais.';
      return;
    }
    
    if (isPasswordChange && formValue.novaSenha.length < 6) {
      this.errorMessage = 'A nova senha deve ter pelo menos 6 caracteres.';
      return;
    }
    
    this.loading = true;
    this.clearMessages();
    
    // Preparar dados para o backend
    const alterarPerfilData: {
      senhaAtual?: string;
      novaSenha?: string;
      confirmacaoNovaSenha?: string;
      novoEmail?: string;
    } = {};
    
    // Incluir senha atual apenas se houver mudança de senha
    if (isPasswordChange) {
      if (!formValue.senhaAtual) {
        this.errorMessage = 'Para alterar a senha, é necessário informar a senha atual.';
        this.loading = false;
        return;
      }
      alterarPerfilData.senhaAtual = formValue.senhaAtual;
    } else if (formValue.senhaAtual) {
      // Se o usuário preencheu a senha atual mas não está alterando senha, incluir mesmo assim
      alterarPerfilData.senhaAtual = formValue.senhaAtual;
    }
    
    if (isPasswordChange) {
      alterarPerfilData.novaSenha = formValue.novaSenha;
      alterarPerfilData.confirmacaoNovaSenha = formValue.confirmacaoNovaSenha;
    }
    
    if (isEmailChange) {
      alterarPerfilData.novoEmail = formValue.email;
    }
    
    if (isNameChange) {
      alterarPerfilData.novoNome = formValue.nome;
    }
    
    // Se não há mudanças significativas, apenas atualizar dados locais
    if (!isPasswordChange && !isEmailChange && !isNameChange) {
      this.successMessage = 'Perfil atualizado com sucesso!';
      this.loading = false;
      return;
    }
    
    this.authService.alterarPerfil(this.usuario.id, alterarPerfilData).subscribe({
      next: () => {
        let message = 'Perfil atualizado com sucesso!';
        const changes = [];
        if (isPasswordChange) changes.push('senha');
        if (isEmailChange) changes.push('email');
        if (isNameChange) changes.push('nome');
        
        if (changes.length > 0) {
          message = `${changes.join(', ').replace(/,([^,]*)$/, ' e$1')} alterado${changes.length > 1 ? 's' : ''} com sucesso!`;
          message = message.charAt(0).toUpperCase() + message.slice(1);
        }
        
        this.successMessage = message;
        
        // Limpar campos de senha
        if (isPasswordChange) {
          this.perfilForm.patchValue({
            senhaAtual: '',
            novaSenha: '',
            confirmacaoNovaSenha: ''
          });
          this.showPasswordFields = false;
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao atualizar perfil. Tente novamente.';
        this.loading = false;
      }
    });
  }
  
  resetForm(): void {
    if (this.usuario) {
      this.perfilForm.patchValue({
        nome: this.usuario.nome,
        email: this.usuario.email,
        senhaAtual: '',
        novaSenha: '',
        confirmacaoNovaSenha: ''
      });
    }
    this.showPasswordFields = false;
    this.clearMessages();
  }
  
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  isAdministrador(): boolean {
    return this.usuario?.tipoUsuario === TipoUsuario.ADMINISTRADOR;
  }

  navegarParaAdminUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}