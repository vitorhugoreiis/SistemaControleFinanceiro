export interface ResumoCategoria {
    categoriaId: number;
    categoriaNome: string;
    tipo: 'Receita' | 'Despesa';
    valor: number;
}

export interface ResumoFinanceiro {
    totalReceitas: number;
    totalDespesas: number;
    saldoTotal: number;
    resumoPorCategoria: ResumoCategoria[];
}