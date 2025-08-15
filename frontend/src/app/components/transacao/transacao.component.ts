import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransacaoService } from '../../services/transacao.service';
import { CategoriaService } from '../../services/categoria.service';
import { SubcategoriaService } from '../../services/subcategoria.service';
import { InstituicaoService } from '../../services/instituicao.service';
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
  editingTransacao: Transacao | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  filtroTipo = '';
  filtroCategoria = '';

  constructor(
    private transacaoService: TransacaoService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private instituicaoService: InstituicaoService,
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
  }

  ngOnInit(): void {
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
        this.errorMessage = 'Erro ao carregar transações';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.transacaoForm.invalid) {
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
      valor: parseFloat(this.transacaoForm.value.valor)
    };

    if (this.editingTransacao) {
      // Atualizar transação existente
      this.transacaoService.atualizar(this.editingTransacao.id!, transacaoData).subscribe({
        next: () => {
          this.successMessage = 'Transação atualizada com sucesso!';
          this.resetForm();
          this.carregarTransacoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar transação';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    } else {
      // Criar nova transação
      this.transacaoService.salvar(transacaoData).subscribe({
        next: () => {
          this.successMessage = 'Transação criada com sucesso!';
          this.resetForm();
          this.carregarTransacoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao criar transação';
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
    if (confirm(`Tem certeza que deseja excluir a transação "${transacao.descricao}"?`)) {
      this.transacaoService.excluir(transacao.id!).subscribe({
        next: () => {
          this.successMessage = 'Transação excluída com sucesso!';
          this.carregarTransacoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao excluir transação';
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
    let transacoesFiltradas = [...this.transacoes];

    if (this.filtroTipo) {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === this.filtroTipo);
    }

    if (this.filtroCategoria) {
      const categoriaId = parseInt(this.filtroCategoria);
      transacoesFiltradas = transacoesFiltradas.filter(t => t.categoriaId === categoriaId);
    }

    // Aplicar filtros via API se necessário
    if (this.filtroTipo && !this.filtroCategoria) {
      this.transacaoService.listarPorTipo(this.filtroTipo as 'RECEITA' | 'DESPESA').subscribe({
        next: (transacoes) => {
          this.transacoes = transacoes.sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
          );
        },
        error: (error) => {
          console.error('Erro ao filtrar transações:', error);
        }
      });
    } else if (this.filtroCategoria && !this.filtroTipo) {
      const categoriaId = parseInt(this.filtroCategoria);
      this.transacaoService.listarPorCategoria(categoriaId).subscribe({
        next: (transacoes) => {
          this.transacoes = transacoes.sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
          );
        },
        error: (error) => {
          console.error('Erro ao filtrar transações:', error);
        }
      });
    } else if (!this.filtroTipo && !this.filtroCategoria) {
      this.carregarTransacoes();
    }
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
}