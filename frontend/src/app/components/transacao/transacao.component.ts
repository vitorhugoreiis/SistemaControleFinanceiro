import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransacaoService } from '../../services/transacao.service';
import { CategoriaService } from '../../services/categoria.service';
import { SubcategoriaService } from '../../services/subcategoria.service';
import { InstituicaoService } from '../../services/instituicao.service';
import { AuthService } from '../../services/auth.service';
import { PerfilService, Perfil } from '../../services/perfil.service';
import { Transacao } from '../../models/transacao.model';
import { Categoria } from '../../models/categoria.model';
import { Subcategoria } from '../../models/subcategoria.model';
import { Instituicao } from '../../models/instituicao.model';

@Component({
  selector: 'app-transacao',
  templateUrl: './transacao.component.html',
  styleUrls: ['./transacao.component.scss']
})
export class TransacaoComponent implements OnInit {
  transacoes: Transacao[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  instituicoes: Instituicao[] = [];
  transacaoForm: FormGroup;
  categoriaForm: FormGroup;
  subcategoriaForm: FormGroup;
  editingTransacao: Transacao | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  filtroTipo = '';
  filtroCategoria = '';
  
  // Perfil do usuário
  perfilAtual: Perfil | null = null;
  
  // Propriedades para os modais
  mostrarModalCategoria = false;
  mostrarModalSubcategoria = false;
  salvandoCategoria = false;
  salvandoSubcategoria = false;
  categoriaSelecionadaNome = '';

  constructor(
    private transacaoService: TransacaoService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private instituicaoService: InstituicaoService,
    private authService: AuthService,
    private perfilService: PerfilService,
    private formBuilder: FormBuilder
  ) {
    this.transacaoForm = this.formBuilder.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      data: ['', [Validators.required]],
      tipo: ['DESPESA', [Validators.required]],
      categoriaId: ['', [Validators.required]],
      subcategoriaId: [''],
      instituicaoId: ['', [Validators.required]],
      observacao: ['']
    });

    this.categoriaForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['DESPESA', [Validators.required]]
    });

    this.subcategoriaForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      categoriaId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarPerfilPadrao();
    this.carregarDados();
    this.carregarTransacoes();
    
    // Observar mudanças na categoria para filtrar subcategorias
    this.transacaoForm.get('categoriaId')?.valueChanges.subscribe(categoriaId => {
      if (categoriaId) {
        this.carregarSubcategoriasPorCategoria(parseInt(categoriaId));
      } else {
        this.subcategorias = [];
      }
      this.transacaoForm.get('subcategoriaId')?.setValue('');
    });
  }

  carregarPerfilPadrao(): void {
    const usuario = this.authService.getUsuarioAtual();
    if (usuario && usuario.id) {
      this.perfilService.listarPorUsuario(usuario.id).subscribe({
        next: (perfis) => {
          // Pegar o primeiro perfil (perfil padrão)
          if (perfis.length > 0) {
            this.perfilAtual = perfis[0];
          }
        },
        error: (error) => {
          console.error('Erro ao carregar perfil:', error);
        }
      });
    }
  }

  carregarDados(): void {
    // Carregar categorias
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });

    // Carregar instituições
    this.instituicaoService.listar().subscribe({
      next: (instituicoes) => {
        this.instituicoes = instituicoes;
      },
      error: (error) => {
        console.error('Erro ao carregar instituições:', error);
      }
    });
  }

  carregarSubcategoriasPorCategoria(categoriaId: number): void {
    this.subcategoriaService.listarPorCategoria(categoriaId).subscribe({
      next: (subcategorias) => {
        this.subcategorias = subcategorias;
      },
      error: (error) => {
        console.error('Erro ao carregar subcategorias:', error);
      }
    });
  }

  carregarTransacoes(): void {
    this.loading = true;
    this.transacaoService.listar().subscribe({
      next: (transacoes) => {
        this.transacoes = transacoes.sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar lançamentos';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.transacaoForm.invalid) {
      return;
    }

    // Verificar se o perfil foi carregado
    if (!this.perfilAtual || !this.perfilAtual.id) {
      this.errorMessage = 'Erro: Perfil não carregado. Tente recarregar a página.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const transacaoData = {
      ...this.transacaoForm.value,
      categoriaId: parseInt(this.transacaoForm.value.categoriaId),
      subcategoriaId: this.transacaoForm.value.subcategoriaId ? parseInt(this.transacaoForm.value.subcategoriaId) : null,
      instituicaoId: parseInt(this.transacaoForm.value.instituicaoId),
      valor: parseFloat(this.transacaoForm.value.valor),
      perfilId: this.perfilAtual.id
    };

    console.log('Dados da transação:', transacaoData); // Para debug

    if (this.editingTransacao) {
      // Atualizar lançamento existente
      this.transacaoService.atualizar(this.editingTransacao.id!, transacaoData).subscribe({
        next: () => {
          this.successMessage = 'Lançamento atualizado com sucesso!';
          this.resetForm();
          this.carregarTransacoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar lançamento';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    } else {
      // Criar novo lançamento
      this.transacaoService.salvar(transacaoData).subscribe({
        next: () => {
          this.successMessage = 'Lançamento criado com sucesso!';
          this.resetForm();
          this.carregarTransacoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao criar lançamento';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    }
  }

  editarTransacao(transacao: Transacao): void {
    this.editingTransacao = transacao;
    
    // Carregar subcategorias da categoria selecionada
    if (transacao.categoriaId) {
      this.carregarSubcategoriasPorCategoria(transacao.categoriaId);
    }
    
    this.transacaoForm.patchValue({
      descricao: transacao.descricao,
      valor: transacao.valor,
      data: transacao.data,
      tipo: transacao.tipo,
      categoriaId: transacao.categoriaId.toString(),
      subcategoriaId: transacao.subcategoriaId ? transacao.subcategoriaId.toString() : '',
      instituicaoId: transacao.instituicaoId.toString(),
      observacao: transacao.observacao || ''
    });
  }

  excluirTransacao(transacao: Transacao): void {
    if (confirm(`Tem certeza que deseja excluir o lançamento "${transacao.descricao}"?`)) {
      this.transacaoService.excluir(transacao.id!).subscribe({
        next: () => {
          this.successMessage = 'Lançamento excluído com sucesso!';
          this.carregarTransacoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao excluir lançamento';
          console.error('Erro:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.transacaoForm.reset({
      tipo: 'DESPESA',
      data: new Date().toISOString().split('T')[0]
    });
    this.editingTransacao = null;
    this.subcategorias = [];
    this.loading = false;
  }

  cancelarEdicao(): void {
    this.resetForm();
  }

  filtrarTransacoes(): void {
    this.loading = true;
    
    // Se não há filtros, carregar todas as transações
    if ((!this.filtroTipo || this.filtroTipo === '') && (!this.filtroCategoria || this.filtroCategoria === '')) {
      this.carregarTransacoes();
      return;
    }

    // Preparar parâmetros para o filtro
    const tipoFiltro = this.filtroTipo && this.filtroTipo !== '' ? this.filtroTipo : undefined;
    const categoriaFiltro = this.filtroCategoria && this.filtroCategoria !== '' ? this.filtroCategoria : undefined;

    // Usar o endpoint principal com parâmetros de query
    this.transacaoService.listarComFiltros(this.perfilAtual?.id, tipoFiltro, categoriaFiltro).subscribe({
      next: (transacoes) => {
        this.transacoes = transacoes.sort((a, b) => 
          new Date(b.data).getTime() - new Date(a.data).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao filtrar lançamentos:', error);
        this.errorMessage = 'Erro ao filtrar lançamentos';
        this.loading = false;
      }
    });
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  formatarData(data: string): string {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  // Métodos para Modal de Categoria
  abrirModalNovaCategoria(): void {
    this.categoriaForm.reset();
    this.categoriaForm.patchValue({
      tipo: this.transacaoForm.get('tipo')?.value || 'DESPESA'
    });
    this.mostrarModalCategoria = true;
  }

  fecharModalCategoria(): void {
    this.mostrarModalCategoria = false;
    this.categoriaForm.reset();
  }

  criarCategoria(): void {
    if (this.categoriaForm.valid && this.perfilAtual) {
      this.salvandoCategoria = true;
      const novaCategoria: any = {
        nome: this.categoriaForm.get('nome')?.value,
        tipo: this.categoriaForm.get('tipo')?.value,
        perfilId: this.perfilAtual.id
      };

      this.categoriaService.salvar(novaCategoria).subscribe({
        next: (categoria) => {
          this.salvandoCategoria = false;
          this.categorias.push(categoria);
          this.categorias.sort((a, b) => a.nome.localeCompare(b.nome));
          this.transacaoForm.patchValue({ categoriaId: categoria.id });
          this.fecharModalCategoria();
          this.successMessage = 'Categoria criada com sucesso!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.salvandoCategoria = false;
          this.errorMessage = 'Erro ao criar categoria: ' + (error.error?.message || error.message);
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    }
  }

  // Métodos para Modal de Subcategoria
  abrirModalNovaSubcategoria(): void {
    const categoriaId = this.transacaoForm.get('categoriaId')?.value;
    if (categoriaId) {
      const categoria = this.categorias.find(c => c.id == categoriaId);
      this.categoriaSelecionadaNome = categoria ? categoria.nome : '';
      
      this.subcategoriaForm.reset();
      this.subcategoriaForm.patchValue({
        categoriaId: parseInt(categoriaId)
      });
      this.mostrarModalSubcategoria = true;
    }
  }

  fecharModalSubcategoria(): void {
    this.mostrarModalSubcategoria = false;
    this.subcategoriaForm.reset();
    this.categoriaSelecionadaNome = '';
  }

  criarSubcategoria(): void {
    if (this.subcategoriaForm.valid) {
      this.salvandoSubcategoria = true;
      const novaSubcategoria: Subcategoria = {
        nome: this.subcategoriaForm.get('nome')?.value,
        categoriaId: this.subcategoriaForm.get('categoriaId')?.value
      };

      this.subcategoriaService.salvar(novaSubcategoria).subscribe({
        next: (subcategoria) => {
          this.salvandoSubcategoria = false;
          this.subcategorias.push(subcategoria);
          this.subcategorias.sort((a, b) => a.nome.localeCompare(b.nome));
          this.transacaoForm.patchValue({ subcategoriaId: subcategoria.id });
          this.fecharModalSubcategoria();
          this.successMessage = 'Subcategoria criada com sucesso!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.salvandoSubcategoria = false;
          this.errorMessage = 'Erro ao criar subcategoria: ' + (error.error?.message || error.message);
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    }
  }
}