export enum StatusCaso {
  ATIVO = 'ATIVO',
  SUSPENSO = 'SUSPENSO',
  ARQUIVADO = 'ARQUIVADO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}

export interface Caso {
  id?: number;
  numeroProcesso: string;
  descricao: string;
  status: StatusCaso;
  dataInicio?: Date;
  dataFim?: Date;
  valorHonorarios?: number;
  honorariosPagos?: number;
  honorariosRestantes?: number;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
  observacoes?: string;
  clienteId: number;
  clienteNome?: string;
  clienteCpfCnpj?: string;
  advogadoId?: number;
  advogadoNome?: string;
  honorariosPagosCompletos?: boolean;
}

export interface CasoRequest {
  numeroProcesso: string;
  descricao: string;
  status: StatusCaso;
  dataInicio?: Date;
  dataFim?: Date;
  valorHonorarios?: number;
  honorariosPagos?: number;
  observacoes?: string;
  clienteId: number;
}

export interface CasoResponse extends Caso {
  id: number;
  dataCadastro: Date;
  dataAtualizacao: Date;
  clienteNome: string;
  clienteCpfCnpj: string;
  advogadoId: number;
  advogadoNome: string;
  honorariosRestantes: number;
  honorariosPagosCompletos: boolean;
}

export const StatusCasoLabels = {
  [StatusCaso.ATIVO]: 'Ativo',
  [StatusCaso.SUSPENSO]: 'Suspenso',
  [StatusCaso.ARQUIVADO]: 'Arquivado',
  [StatusCaso.FINALIZADO]: 'Finalizado',
  [StatusCaso.CANCELADO]: 'Cancelado'
};