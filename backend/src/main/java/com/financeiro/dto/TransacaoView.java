package com.financeiro.dto;

import java.time.LocalDate;

/**
 * Record para visualização simplificada de transações.
 * Records são um recurso introduzido no Java 16 e aprimorado no Java 21
 * que simplifica a criação de classes imutáveis para transferência de dados.
 */
public record TransacaoView(
        Long id,
        String descricao,
        Double valor,
        String tipo,
        LocalDate data,
        String categoria,
        String subcategoria,
        String instituicao
) {
    // Os records automaticamente geram:
    // - Construtor com todos os campos
    // - Métodos getters (com nome igual ao do campo)
    // - equals(), hashCode() e toString()
}