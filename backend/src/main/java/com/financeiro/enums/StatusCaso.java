package com.financeiro.enums;

public enum StatusCaso {
    ATIVO("Ativo"),
    SUSPENSO("Suspenso"),
    ARQUIVADO("Arquivado"),
    FINALIZADO("Finalizado"),
    CANCELADO("Cancelado");
    
    private final String descricao;
    
    StatusCaso(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
}