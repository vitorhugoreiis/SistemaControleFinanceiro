package com.financeiro.util;

import com.financeiro.entity.Transacao;

/**
 * Utilitário para classificar transações utilizando Pattern Matching para switch,
 * um recurso introduzido no Java 21 que melhora a legibilidade e segurança do código.
 */
public class TransacaoClassificador {

    /**
     * Classifica uma transação com base em suas características usando Pattern Matching para switch.
     * 
     * @param transacao A transação a ser classificada
     * @return Uma classificação textual da transação
     */
    public static String classificarTransacao(Transacao transacao) {
        return switch(transacao) {
            // Pattern matching com guardas (when)
            case Transacao t when t.getValor().compareTo(new java.math.BigDecimal("1000.0")) > 0 -> "Alto Valor";
            case Transacao t when t.getCategoria() != null && 
                               t.getCategoria().getNome().equals("Investimento") -> "Investimento";
            case Transacao t when t.getDescricao().toLowerCase().contains("salário") -> "Renda";
            case Transacao t when "DESPESA".equals(t.getTipo()) -> "Despesa Regular";
            // Caso padrão
            default -> "Transação Padrão";
        };
    }
}