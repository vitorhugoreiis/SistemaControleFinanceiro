export interface Usuario {
    id?: number;
    nome: string;
    email: string;
}

export interface UsuarioCadastro {
    nome: string;
    email: string;
    senha: string;
    confirmacaoSenha: string;
}