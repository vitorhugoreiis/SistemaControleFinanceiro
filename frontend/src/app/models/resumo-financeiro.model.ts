export interface ResumoCategoria {
    categoriaId: number;
    categoriaNome: string;
    tipo: 'RECEITA' | 'DESPESA';
    valor: number;
}

export interface ResumoFinanceiro {
    totalReceitas: number;
    totalDespesas: number;
    saldoTotal: number;
    resumoCategorias: ResumoCategoria[];
}