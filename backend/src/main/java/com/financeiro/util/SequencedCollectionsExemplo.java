package com.financeiro.util;

import java.util.ArrayList;
import java.util.List;

/**
 * Classe de exemplo para demonstrar o uso de Sequenced Collections,
 * um recurso introduzido no Java 21 que adiciona métodos úteis para
 * manipulação de coleções ordenadas.
 */
public class SequencedCollectionsExemplo {

    /**
     * Exemplo de uso dos novos métodos de Sequenced Collections.
     * 
     * @param transacoes Lista de IDs de transações
     * @return Mensagem com informações sobre a primeira e última transação
     */
    public static String demonstrarSequencedCollections(List<Long> transacoes) {
        if (transacoes.isEmpty()) {
            return "Nenhuma transação encontrada";
        }
        
        // Novos métodos do Java 21 para Sequenced Collections
        Long primeiraTransacao = transacoes.getFirst(); // Substitui get(0)
        Long ultimaTransacao = transacoes.getLast();    // Substitui get(size()-1)
        
        // Cria uma cópia reversa da lista
        List<Long> transacoesReversas = new ArrayList<>(transacoes.reversed());
        
        return String.format("Primeira transação: %d, Última transação: %d, " +
                            "Primeira na lista reversa: %d", 
                            primeiraTransacao, ultimaTransacao, transacoesReversas.getFirst());
    }
}