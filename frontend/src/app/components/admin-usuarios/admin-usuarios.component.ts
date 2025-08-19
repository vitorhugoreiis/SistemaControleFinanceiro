import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Usuario, UsuarioCadastro, TipoUsuario } from '../../models/usuario.model';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.scss']
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioForm: FormGroup;
  editandoUsuario: Usuario | null = null;
  mostrarFormulario = false;
  
  successMessage = '';
  errorMessage = '';
  loading = false;
  
  TipoUsuario = TipoUsuario;

  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder
  ) {
    this.usuarioForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmacaoSenha: ['', [Validators.required]]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  checkPasswords(group: FormGroup): { [key: string]: boolean } | null {
    const senha = group.get('senha')?.value;
    const confirmacaoSenha = group.get('confirmacaoSenha')?.value;
    return senha === confirmacaoSenha ? null : { notSame: true };
  }

  carregarUsuarios(): void {
    this.loading = true;
    this.adminService.listarTodosUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar usuários.';
        this.loading = false;
      }
    });
  }

  mostrarFormularioNovo(): void {
    this.editandoUsuario = null;
    this.mostrarFormulario = true;
    this.usuarioForm.reset();
    this.limparMensagens();
  }

  editarUsuario(usuario: Usuario): void {
    this.editandoUsuario = usuario;
    this.mostrarFormulario = true;
    this.usuarioForm.patchValue({
      nome: usuario.nome,
      email: usuario.email
    });
    // Remover validação de senha para edição
    this.usuarioForm.get('senha')?.clearValidators();
    this.usuarioForm.get('confirmacaoSenha')?.clearValidators();
    this.usuarioForm.get('senha')?.updateValueAndValidity();
    this.usuarioForm.get('confirmacaoSenha')?.updateValueAndValidity();
    this.limparMensagens();
  }

  cancelarEdicao(): void {
    this.mostrarFormulario = false;
    this.editandoUsuario = null;
    this.usuarioForm.reset();
    // Restaurar validação de senha
    this.usuarioForm.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('confirmacaoSenha')?.setValidators([Validators.required]);
    this.limparMensagens();
  }

  salvarUsuario(): void {
    if (this.usuarioForm.invalid) {
      return;
    }

    this.loading = true;
    this.limparMensagens();

    if (this.editandoUsuario) {
      // Atualizar usuário existente
      const usuarioAtualizado: Usuario = {
        ...this.editandoUsuario,
        nome: this.usuarioForm.value.nome,
        email: this.usuarioForm.value.email
      };

      this.adminService.atualizarUsuario(this.editandoUsuario.id!, usuarioAtualizado).subscribe({
        next: () => {
          this.successMessage = 'Usuário atualizado com sucesso!';
          this.carregarUsuarios();
          this.cancelarEdicao();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao atualizar usuário.';
          this.loading = false;
        }
      });
    } else {
      // Criar novo usuário
      const novoUsuario: UsuarioCadastro = this.usuarioForm.value;

      this.adminService.criarUsuario(novoUsuario).subscribe({
        next: () => {
          this.successMessage = 'Usuário criado com sucesso!';
          this.carregarUsuarios();
          this.cancelarEdicao();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao criar usuário.';
          this.loading = false;
        }
      });
    }
  }

  excluirUsuario(usuario: Usuario): void {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      this.loading = true;
      this.limparMensagens();

      this.adminService.excluirUsuario(usuario.id!).subscribe({
        next: () => {
          this.successMessage = 'Usuário excluído com sucesso!';
          this.carregarUsuarios();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao excluir usuário.';
          this.loading = false;
        }
      });
    }
  }

  promoverUsuario(usuario: Usuario): void {
    if (confirm(`Tem certeza que deseja promover ${usuario.nome} para administrador?`)) {
      this.loading = true;
      this.limparMensagens();

      this.adminService.promoverParaAdministrador(usuario.id!).subscribe({
        next: () => {
          this.successMessage = 'Usuário promovido para administrador!';
          this.carregarUsuarios();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao promover usuário.';
          this.loading = false;
        }
      });
    }
  }

  rebaixarUsuario(usuario: Usuario): void {
    if (confirm(`Tem certeza que deseja rebaixar ${usuario.nome} para usuário comum?`)) {
      this.loading = true;
      this.limparMensagens();

      this.adminService.rebaixarParaComum(usuario.id!).subscribe({
        next: () => {
          this.successMessage = 'Usuário rebaixado para comum!';
          this.carregarUsuarios();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erro ao rebaixar usuário.';
          this.loading = false;
        }
      });
    }
  }

  isAdministrador(usuario: Usuario): boolean {
    return usuario.tipoUsuario === TipoUsuario.ADMINISTRADOR;
  }

  private limparMensagens(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}