import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistroImportacaoService } from '../../services/registro-importacao.service';
import { RegistroImportacao } from '../../models/registro-importacao.model';

@Component({
  selector: 'app-importacao',
  templateUrl: './importacao.component.html',
  styleUrls: ['./importacao.component.scss']
})
export class ImportacaoComponent implements OnInit {
  registros: RegistroImportacao[] = [];
  importacaoForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  filtroForm: FormGroup;

  bancos = [
    'Banco do Brasil',
    'Itaú',
    'Bradesco',
    'Santander',
    'Caixa Econômica',
    'Nubank',
    'Inter',
    'C6 Bank',
    'Outros'
  ];

  constructor(
    private registroImportacaoService: RegistroImportacaoService,
    private formBuilder: FormBuilder
  ) {
    this.importacaoForm = this.formBuilder.group({
      dataExtracao: ['', [Validators.required]],
      banco: ['', [Validators.required]],
      periodo: ['', [Validators.required]],
      arquivo: ['', [Validators.required]]
    });

    this.filtroForm = this.formBuilder.group({
      banco: [''],
      dataInicio: [''],
      dataFim: ['']
    });
  }

  ngOnInit(): void {
    this.carregarRegistros();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.importacaoForm.patchValue({
        arquivo: file.name
      });
    }
  }

  onSubmit(): void {
    if (this.importacaoForm.invalid || !this.selectedFile) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios e selecione um arquivo.';
      this.successMessage = '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('arquivo', this.selectedFile);
    formData.append('dataExtracao', this.importacaoForm.get('dataExtracao')?.value);
    formData.append('banco', this.importacaoForm.get('banco')?.value);
    formData.append('periodo', this.importacaoForm.get('periodo')?.value);

    this.registroImportacaoService.importarArquivo(formData).subscribe({
      next: () => {
        this.successMessage = 'Arquivo importado com sucesso!';
        this.errorMessage = '';
        this.resetForm();
        this.carregarRegistros();
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Erro na importação:', error);
        this.errorMessage = 'Erro ao importar arquivo. Verifique o formato e tente novamente.';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }

  carregarRegistros(): void {
    this.loading = true;
    this.registroImportacaoService.listar().subscribe({
      next: (registros: RegistroImportacao[]) => {
        this.registros = registros;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Erro ao carregar registros:', error);
        this.errorMessage = 'Erro ao carregar registros de importação';
        this.successMessage = '';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    if (this.filtroForm.valid) {
      // Por enquanto, vamos usar o método listar() padrão
      // TODO: Implementar filtros no backend se necessário
      this.carregarRegistros();
    }
  }

  limparFiltros(): void {
    this.filtroForm.reset();
    this.carregarRegistros();
  }

  excluirRegistro(id: number): void {
    if (confirm('Tem certeza que deseja excluir este registro de importação?')) {
      this.registroImportacaoService.excluir(id).subscribe({
        next: () => {
          this.successMessage = 'Registro excluído com sucesso!';
          this.errorMessage = '';
          this.carregarRegistros();
        },
        error: (error: Error) => {
          console.error('Erro ao excluir registro:', error);
          this.errorMessage = 'Erro ao excluir registro';
          this.successMessage = '';
        }
      });
    }
  }

  resetForm(): void {
    this.importacaoForm.reset();
    this.selectedFile = null;
    const fileInput = document.getElementById('arquivo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  formatarData(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  limparMensagens(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}