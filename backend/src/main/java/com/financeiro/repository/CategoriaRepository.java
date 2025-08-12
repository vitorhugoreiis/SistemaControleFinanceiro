package com.financeiro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.Categoria;
import com.financeiro.entity.Perfil;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    List<Categoria> findByTipo(String tipo);
    
    List<Categoria> findByPerfilAndTipo(Perfil perfil, String tipo);
    
    List<Categoria> findByPerfil(Perfil perfil);
    
    Optional<Categoria> findByNomeAndTipo(String nome, String tipo);
    
    Optional<Categoria> findByNomeAndTipoAndPerfil(String nome, String tipo, Perfil perfil);
    
    boolean existsByNomeAndTipo(String nome, String tipo);
    
    boolean existsByNomeAndTipoAndPerfil(String nome, String tipo, Perfil perfil);
}