package com.financeiro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.RegistroImportacao;

@Repository
public interface RegistroImportacaoRepository extends JpaRepository<RegistroImportacao, Long> {
    
    List<RegistroImportacao> findByBanco(String banco);
    
    List<RegistroImportacao> findByDataExtracaoBetween(LocalDate dataInicio, LocalDate dataFim);
    
    boolean existsByNomeArquivo(String nomeArquivo);
}