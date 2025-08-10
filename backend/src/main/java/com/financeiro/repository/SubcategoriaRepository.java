package com.financeiro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.Categoria;
import com.financeiro.entity.Subcategoria;

@Repository
public interface SubcategoriaRepository extends JpaRepository<Subcategoria, Long> {
    
    List<Subcategoria> findByCategoria(Categoria categoria);
    
    List<Subcategoria> findByCategoriaId(Long categoriaId);
    
    boolean existsByNomeAndCategoria(String nome, Categoria categoria);
}