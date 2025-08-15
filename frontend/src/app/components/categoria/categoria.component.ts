import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss']
})
export class CategoriaComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriaForm: FormGroup;
  editingCategoria: Categoria | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private categoriaService: CategoriaService,
    private formBuilder: FormBuilder
  ) {
    this.categoriaForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['Despesa', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.loading = true;
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar categorias';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const categoriaData = this.categoriaForm.value;

    if (this.editingCategoria) {
      // Atualizar categoria existente
      this.categoriaService.atualizar(this.editingCategoria.id!, categoriaData).subscribe({
        next: () => {
          this.successMessage = 'Categoria atualizada com sucesso!';
          this.resetForm();
          this.carregarCategorias();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar categoria';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    } else {
      // Criar nova categoria
      this.categoriaService.salvar(categoriaData).subscribe({
        next: () => {
          this.successMessage = 'Categoria criada com sucesso!';
          this.resetForm();
          this.carregarCategorias();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao criar categoria';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    }
  }

  editarCategoria(categoria: Categoria): void {
    this.editingCategoria = categoria;
    this.categoriaForm.patchValue({
      nome: categoria.nome,
      tipo: categoria.tipo
    });
  }

  excluirCategoria(categoria: Categoria): void {
    if (confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      this.categoriaService.excluir(categoria.id!).subscribe({
        next: () => {
          this.successMessage = 'Categoria excluída com sucesso!';
          this.carregarCategorias();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao excluir categoria';
          console.error('Erro:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.categoriaForm.reset({
      tipo: 'Despesa'
    });
    this.editingCategoria = null;
    this.loading = false;
  }

  cancelarEdicao(): void {
    this.resetForm();
  }
}