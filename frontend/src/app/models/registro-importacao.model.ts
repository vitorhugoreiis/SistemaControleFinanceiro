export interface RegistroImportacao {
    id?: number;
    nomeArquivo: string;
    dataImportacao: string;
    quantidadeRegistros: number;
    usuarioId?: number;
}