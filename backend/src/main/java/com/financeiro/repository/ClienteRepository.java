package com.financeiro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.Cliente;
import com.financeiro.entity.Usuario;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    List<Cliente> findByAdvogadoOrderByNomeAsc(Usuario advogado);
    
    Optional<Cliente> findByCpfCnpj(String cpfCnpj);
    
    boolean existsByCpfCnpj(String cpfCnpj);
    
    @Query("SELECT c FROM Cliente c WHERE c.advogado = :advogado AND " +
           "(LOWER(c.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           "c.cpfCnpj LIKE CONCAT('%', :termo, '%') OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :termo, '%')))")
    List<Cliente> buscarPorTermoEAdvogado(@Param("termo") String termo, @Param("advogado") Usuario advogado);
    
    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.advogado = :advogado")
    Long contarClientesPorAdvogado(@Param("advogado") Usuario advogado);
    
    List<Cliente> findByAdvogadoAndCidadeIgnoreCase(Usuario advogado, String cidade);
    
    List<Cliente> findByAdvogadoAndEstadoIgnoreCase(Usuario advogado, String estado);
}