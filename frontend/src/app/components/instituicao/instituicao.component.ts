import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstituicaoService } from '../../services/instituicao.service';
import { Instituicao } from '../../models/instituicao.model';

@Component({
  selector: 'app-instituicao',
  templateUrl: './instituicao.component.html',
  styleUrls: ['./instituicao.component.scss']
})
export class InstituicaoComponent implements OnInit {
  instituicoes: Instituicao[] = [];
  instituicaoForm: FormGroup;
  editingInstituicao: Instituicao | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  filtroTipo = '';

  tiposInstituicao = [
    { value: 'BANCO', label: 'Banco' },
    { value: 'CARTEIRA', label: 'Carteira' },
    { value: 'POUPANCA', label: 'Poupança' },
    { value: 'INVESTIMENTO', label: 'Investimento' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'OUTRO', label: 'Outro' }
  ];

  constructor(
    private instituicaoService: InstituicaoService,
    private formBuilder: FormBuilder
  ) {
    this.instituicaoForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['BANCO', [Validators.required]],
      saldo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.carregarInstituicoes();
  }

  carregarInstituicoes(): void {
    this.loading = true;
    this.instituicaoService.listar().subscribe({
      next: (instituicoes) => {
        this.instituicoes = instituicoes;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar instituições';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.instituicaoForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const instituicaoData = {
      ...this.instituicaoForm.value,
      saldo: parseFloat(this.instituicaoForm.value.saldo)
    };

    if (this.editingInstituicao) {
      // Atualizar instituição existente
      this.instituicaoService.atualizar(this.editingInstituicao.id!, instituicaoData).subscribe({
        next: () => {
          this.successMessage = 'Instituição atualizada com sucesso!';
          this.resetForm();
          this.carregarInstituicoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao atualizar instituição';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    } else {
      // Criar nova instituição
      this.instituicaoService.salvar(instituicaoData).subscribe({
        next: () => {
          this.successMessage = 'Instituição criada com sucesso!';
          this.resetForm();
          this.carregarInstituicoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao criar instituição';
          this.loading = false;
          console.error('Erro:', error);
        }
      });
    }
  }

  editarInstituicao(instituicao: Instituicao): void {
    this.editingInstituicao = instituicao;
    this.instituicaoForm.patchValue({
      nome: instituicao.nome,
      tipo: instituicao.tipo,
      saldo: instituicao.saldo
    });
  }

  excluirInstituicao(instituicao: Instituicao): void {
    if (confirm(`Tem certeza que deseja excluir a instituição "${instituicao.nome}"?`)) {
      this.instituicaoService.excluir(instituicao.id!).subscribe({
        next: () => {
          this.successMessage = 'Instituição excluída com sucesso!';
          this.carregarInstituicoes();
        },
        error: (error) => {
          this.errorMessage = 'Erro ao excluir instituição';
          console.error('Erro:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.instituicaoForm.reset({
      tipo: 'BANCO',
      saldo: 0
    });
    this.editingInstituicao = null;
    this.loading = false;
  }

  cancelarEdicao(): void {
    this.resetForm();
  }

  filtrarPorTipo(): void {
    if (this.filtroTipo) {
      // Filtrar localmente
      // Como não há endpoint específico para filtrar por tipo, fazemos localmente
      this.carregarInstituicoes();
    } else {
      this.carregarInstituicoes();
    }
  }

  get instituicoesFiltradas(): Instituicao[] {
    if (!this.filtroTipo) {
      return this.instituicoes;
    }
    return this.instituicoes.filter(inst => inst.tipo === this.filtroTipo);
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposInstituicao.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  calcularSaldoAtual(instituicao: Instituicao): number {
    // Retorna o saldo da instituição
    return instituicao.saldo || 0;
  }
}