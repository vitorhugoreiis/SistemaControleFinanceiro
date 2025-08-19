export enum TipoUsuario {
    COMUM = 'COMUM',
    ADMINISTRADOR = 'ADMINISTRADOR',
    ADVOGADO = 'ADVOGADO'
}

export interface Usuario {
    id?: number;
    nome: string;
    email: string;
    tipoUsuario?: TipoUsuario;
}

export interface UsuarioCadastro {
    nome: string;
    email: string;
    senha: string;
    confirmacaoSenha: string;
}