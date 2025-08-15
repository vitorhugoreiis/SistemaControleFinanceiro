export interface RegistroImportacao {
    id?: number;
    dataExtracao: string;
    banco: string;
    periodo: string;
    nomeArquivo: string;
}