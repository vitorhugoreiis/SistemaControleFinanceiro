import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TipoUsuario } from '../../models/usuario.model';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  errorMessage = '';
  loading = false;
  tiposUsuario = [
    { value: TipoUsuario.COMUM, label: 'Usuário Comum' },
    { value: TipoUsuario.ADVOGADO, label: 'Advogado' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.cadastroForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmacaoSenha: ['', [Validators.required]],
      tipoUsuario: [TipoUsuario.COMUM, [Validators.required]]
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) {
    const senha = group.get('senha')?.value;
    const confirmacaoSenha = group.get('confirmacaoSenha')?.value;

    return senha === confirmacaoSenha ? null : { notSame: true };
  }

  onSubmit(): void {
    if (this.cadastroForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.cadastrar(this.cadastroForm.value).subscribe({
      next: () => {
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao cadastrar usuário. Tente novamente.';
        this.loading = false;
      }
    });
  }
}