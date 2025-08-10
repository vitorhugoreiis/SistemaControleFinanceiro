export interface Instituicao {
    id?: number;
    nome: string;
    tipo: 'BANCO' | 'CORRETORA' | 'OUTRO';
    saldo?: number;
    usuarioId?: number;
}