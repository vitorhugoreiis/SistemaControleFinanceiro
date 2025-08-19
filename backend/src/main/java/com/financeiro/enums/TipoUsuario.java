package com.financeiro.enums;

public enum TipoUsuario {
    COMUM("Comum"),
    ADMINISTRADOR("Administrador"),
    ADVOGADO("Advogado");
    
    private final String descricao;
    
    TipoUsuario(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
}