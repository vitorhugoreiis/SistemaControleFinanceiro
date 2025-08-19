export interface Cliente {
  id?: number;
  nome: string;
  cpfCnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
  observacoes?: string;
  advogadoId?: number;
  advogadoNome?: string;
  totalCasos?: number;
}

export interface ClienteRequest {
  nome: string;
  cpfCnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}

export interface ClienteResponse extends Cliente {
  id: number;
  dataCadastro: Date;
  dataAtualizacao: Date;
  advogadoId: number;
  advogadoNome: string;
  totalCasos: number;
}