package com.financeiro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.financeiro.entity.Categoria;
import com.financeiro.entity.Instituicao;
import com.financeiro.entity.Perfil;
import com.financeiro.entity.Transacao;
import com.financeiro.entity.Usuario;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    
    List<Transacao> findByUsuario(Usuario usuario);
    
    List<Transacao> findByPerfil(Perfil perfil);
    
    List<Transacao> findByTipo(String tipo);
    
    List<Transacao> findByCategoria(Categoria categoria);
    
    List<Transacao> findByInstituicao(Instituicao instituicao);
    
    List<Transacao> findByDataBetween(LocalDate dataInicio, LocalDate dataFim);
    
    List<Transacao> findByUsuarioAndTipo(Usuario usuario, String tipo);
    
    List<Transacao> findByPerfilAndTipo(Perfil perfil, String tipo);
    
    List<Transacao> findByUsuarioAndDataBetween(Usuario usuario, LocalDate dataInicio, LocalDate dataFim);
    
    List<Transacao> findByPerfilAndDataBetween(Perfil perfil, LocalDate dataInicio, LocalDate dataFim);
    
    List<Transacao> findByPerfilAndCategoria(Perfil perfil, Categoria categoria);
    
    List<Transacao> findByPerfilAndTipoAndCategoria(Perfil perfil, String tipo, Categoria categoria);
    
    @Query("SELECT t FROM Transacao t WHERE t.usuario = ?1 AND t.tipo = ?2 AND t.data BETWEEN ?3 AND ?4")
    List<Transacao> buscarTransacoesPorTipoEPeriodo(Usuario usuario, String tipo, LocalDate dataInicio, LocalDate dataFim);
    
    @Query("SELECT t FROM Transacao t WHERE t.perfil = ?1 AND t.tipo = ?2 AND t.data BETWEEN ?3 AND ?4")
    List<Transacao> buscarTransacoesPorPerfilTipoEPeriodo(Perfil perfil, String tipo, LocalDate dataInicio, LocalDate dataFim);
    
    @Query("SELECT SUM(t.valor) FROM Transacao t WHERE t.usuario = ?1 AND t.tipo = ?2 AND t.data BETWEEN ?3 AND ?4")
    Double calcularSomaPorTipoEPeriodo(Usuario usuario, String tipo, LocalDate dataInicio, LocalDate dataFim);
    
    @Query("SELECT SUM(t.valor) FROM Transacao t WHERE t.perfil = ?1 AND t.tipo = ?2 AND t.data BETWEEN ?3 AND ?4")
    Double calcularSomaPorPerfilTipoEPeriodo(Perfil perfil, String tipo, LocalDate dataInicio, LocalDate dataFim);
    
    @Query("SELECT SUM(t.valor) FROM Transacao t WHERE t.usuario = ?1 AND t.categoria = ?2 AND t.data BETWEEN ?3 AND ?4")
    Double calcularSomaPorCategoriaEPeriodo(Usuario usuario, Categoria categoria, LocalDate dataInicio, LocalDate dataFim);
    
    @Query("SELECT SUM(t.valor) FROM Transacao t WHERE t.perfil = ?1 AND t.categoria = ?2 AND t.data BETWEEN ?3 AND ?4")
    Double calcularSomaPorPerfilCategoriaEPeriodo(Perfil perfil, Categoria categoria, LocalDate dataInicio, LocalDate dataFim);
}