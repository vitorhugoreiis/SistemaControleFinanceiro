import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubcategoriaService } from '../../services/subcategoria.service';
import { CategoriaService } from '../../services/categoria.service';
import { Subcategoria } from '../../models/subcategoria.model';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-subcategoria',
  templateUrl: './subcategoria.component.html',
  styleUrls: ['./subcategoria.component.scss']
})
export class SubcategoriaComponent implements OnInit {
  subcategorias: Subcategoria[] = [];
  categorias: Categoria[] = [];
  subcategoriaForm: FormGroup;
  editingSubcategoria: Subcategoria | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  filtroCategoria = '';

  constructor(
    private subcategoriaService: SubcategoriaService,
    private categoriaService: CategoriaService,
    private formBuilder: FormBuilder
  ) {
    this.subcategoriaForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      categoriaId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarSubcategorias();
  }

  carregarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar categorias';
        console.error('Erro:', error);
      }
    });
  }

  carregarSubcategorias(): void {
    this.loading = true;
    this.subcategoriaService.listar().subscribe({
      next: (subcategorias) => {
        this.subcategorias = subcategorias;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar subcategorias';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.subcategoriaForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const subcategoriaData = {
      ...this.subcategoriaForm.value,
      categoriaId: parseInt(this.subcategoriaForm.value.categoriaId)
    };

    if (this.editingSubcategoria) {
      // Atualizar subcategoria existente
      this.subcategoriaService.atualizar(this.editingSubcategoria.id!, subcategoriaData).subscribe({
        next: () => {
          this.successMessage = 'Subcategoria atualizada com sucesso!';
          this.resetForm();
          this.carregarSubcategorias();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar subcategoria';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    } else {
      // Criar nova subcategoria
      this.subcategoriaService.salvar(subcategoriaData).subscribe({
        next: () => {
          this.successMessage = 'Subcategoria criada com sucesso!';
          this.resetForm();
          this.carregarSubcategorias();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao criar subcategoria';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    }
  }

  editarSubcategoria(subcategoria: Subcategoria): void {
    this.editingSubcategoria = subcategoria;
    this.subcategoriaForm.patchValue({
      nome: subcategoria.nome,
      categoriaId: subcategoria.categoriaId
    });
  }

  excluirSubcategoria(subcategoria: Subcategoria): void {
    if (confirm(`Tem certeza que deseja excluir a subcategoria "${subcategoria.nome}"?`)) {
      this.subcategoriaService.excluir(subcategoria.id!).subscribe({
        next: () => {
          this.successMessage = 'Subcategoria excluída com sucesso!';
          this.carregarSubcategorias();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao excluir subcategoria';
          console.error('Erro:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.subcategoriaForm.reset();
    this.editingSubcategoria = null;
    this.loading = false;
  }

  cancelarEdicao(): void {
    this.resetForm();
  }

  filtrarPorCategoria(): void {
    if (this.filtroCategoria) {
      const categoriaId = parseInt(this.filtroCategoria);
      this.subcategoriaService.listarPorCategoria(categoriaId).subscribe({
        next: (subcategorias) => {
          this.subcategorias = subcategorias;
        },
        error: (error) => {
          this.errorMessage = 'Erro ao filtrar subcategorias';
          console.error('Erro:', error);
        }
      });
    } else {
      this.carregarSubcategorias();
    }
  }

  getNomeCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nome : 'Categoria não encontrada';
  }

  getTipoCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.tipo : '';
  }
}