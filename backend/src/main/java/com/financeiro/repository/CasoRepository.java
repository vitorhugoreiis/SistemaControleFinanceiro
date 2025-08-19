package com.financeiro.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.Caso;
import com.financeiro.entity.Cliente;
import com.financeiro.entity.Usuario;
import com.financeiro.enums.StatusCaso;

@Repository
public interface CasoRepository extends JpaRepository<Caso, Long> {
    
    List<Caso> findByAdvogadoOrderByDataCadastroDesc(Usuario advogado);
    
    List<Caso> findByClienteOrderByDataCadastroDesc(Cliente cliente);
    
    List<Caso> findByAdvogadoAndStatusOrderByDataCadastroDesc(Usuario advogado, StatusCaso status);
    
    Optional<Caso> findByNumeroProcesso(String numeroProcesso);
    
    boolean existsByNumeroProcesso(String numeroProcesso);
    
    @Query("SELECT c FROM Caso c WHERE c.advogado = :advogado AND " +
           "(LOWER(c.numeroProcesso) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(c.descricao) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "LOWER(c.cliente.nome) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Caso> buscarPorTermoEAdvogado(@Param("termo") String termo, @Param("advogado") Usuario advogado);
    
    @Query("SELECT COUNT(c) FROM Caso c WHERE c.advogado = :advogado")
    Long contarCasosPorAdvogado(@Param("advogado") Usuario advogado);
    
    @Query("SELECT COUNT(c) FROM Caso c WHERE c.advogado = :advogado AND c.status = :status")
    Long contarCasosPorAdvogadoEStatus(@Param("advogado") Usuario advogado, @Param("status") StatusCaso status);
    
    @Query("SELECT SUM(c.valorHonorarios) FROM Caso c WHERE c.advogado = :advogado")
    BigDecimal somarHonorariosTotaisPorAdvogado(@Param("advogado") Usuario advogado);
    
    @Query("SELECT SUM(c.honorariosPagos) FROM Caso c WHERE c.advogado = :advogado")
    BigDecimal somarHonorariosPagosPorAdvogado(@Param("advogado") Usuario advogado);
    
    @Query("SELECT c FROM Caso c WHERE c.advogado = :advogado AND " +
           "c.dataInicio BETWEEN :dataInicio AND :dataFim")
    List<Caso> findByAdvogadoAndPeriodo(@Param("advogado") Usuario advogado, 
                                       @Param("dataInicio") LocalDate dataInicio, 
                                       @Param("dataFim") LocalDate dataFim);
    
    @Query("SELECT c FROM Caso c WHERE c.advogado = :advogado AND " +
           "c.valorHonorarios > c.honorariosPagos")
    List<Caso> findCasosComHonorariosEmAberto(@Param("advogado") Usuario advogado);
}