export interface Transacao {
    id?: number;
    descricao: string;
    valor: number;
    data: string;
    tipo: 'RECEITA' | 'DESPESA';
    categoriaId: number;
    categoriaNome?: string;
    subcategoriaId?: number;
    subcategoriaNome?: string;
    instituicaoId: number;
    instituicaoNome?: string;
    usuarioId?: number;
    observacao?: string;
}