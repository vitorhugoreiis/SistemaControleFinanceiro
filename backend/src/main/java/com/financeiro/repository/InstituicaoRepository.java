package com.financeiro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.Instituicao;
import com.financeiro.entity.Perfil;

@Repository
public interface InstituicaoRepository extends JpaRepository<Instituicao, Long> {
    
    List<Instituicao> findByTipo(String tipo);
    
    List<Instituicao> findByPerfil(Perfil perfil);
    
    List<Instituicao> findByPerfilAndTipo(Perfil perfil, String tipo);
    
    boolean existsByNome(String nome);
}