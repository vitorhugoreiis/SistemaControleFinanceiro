package com.financeiro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.Perfil;
import com.financeiro.entity.Usuario;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    
    List<Perfil> findByUsuario(Usuario usuario);
    
    List<Perfil> findByUsuarioId(Long usuarioId);
}