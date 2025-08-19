export interface Categoria {
    id?: number;
    nome: string;
    tipo: 'Receita' | 'Despesa';
    usuarioId?: number;
    perfilId?: number;
}