export interface Transacao {
    id?: number;
    descricao: string;
    valor: number;
    data: string;
    tipo: 'Receita' | 'Despesa';
    categoriaId: number;
    categoriaNome?: string;
    subcategoriaId?: number;
    subcategoriaNome?: string;
    instituicaoId: number;
    instituicaoNome?: string;
    usuarioId?: number;
    perfilId?: number;
    observacao?: string;
    
    // Campos para parcelamento
    parcelaAtual?: number;
    totalParcelas?: number;
    grupoParcelamento?: string;
    ehParcelada?: boolean;
    numeroParcelas?: number; // Usado apenas na criação
}