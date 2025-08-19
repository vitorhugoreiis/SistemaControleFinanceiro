package com.financeiro.enums;

public enum TipoUsuario {
    COMUM("Comum"),
    ADMINISTRADOR("Administrador");
    
    private final String descricao;
    
    TipoUsuario(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
}