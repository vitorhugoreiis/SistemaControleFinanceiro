package com.financeiro.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.financeiro.dto.InstituicaoDTO;
import com.financeiro.entity.Instituicao;
import com.financeiro.entity.Perfil;
import com.financeiro.repository.InstituicaoRepository;
import com.financeiro.repository.PerfilRepository;

@Service
public class InstituicaoService {

    @Autowired
    private InstituicaoRepository instituicaoRepository;
    
    @Autowired
    private PerfilRepository perfilRepository;
    
    public List<InstituicaoDTO> listarTodas() {
        return instituicaoRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<InstituicaoDTO> listarPorTipo(String tipo) {
        return instituicaoRepository.findByTipo(tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<InstituicaoDTO> listarPorPerfil(Long perfilId) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        
        return instituicaoRepository.findByPerfil(perfil).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<InstituicaoDTO> listarPorPerfilETipo(Long perfilId, String tipo) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        
        return instituicaoRepository.findByPerfilAndTipo(perfil, tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public InstituicaoDTO buscarPorId(Long id) {
        return instituicaoRepository.findById(id)
                .map(this::converterParaDTO)
                .orElseThrow(() -> new RuntimeException("Instituição não encontrada"));
    }
    
    public InstituicaoDTO salvar(InstituicaoDTO dto) {
        if (instituicaoRepository.existsByNome(dto.getNome())) {
            throw new RuntimeException("Já existe uma instituição com este nome");
        }
        
        Instituicao instituicao = new Instituicao();
        instituicao.setNome(dto.getNome());
        instituicao.setTipo(dto.getTipo());
        instituicao.setSaldoInicial(dto.getSaldoInicial());
        instituicao.setSaldoAtual(dto.getSaldoInicial()); // Inicialmente, o saldo atual é igual ao saldo inicial
        
        instituicao = instituicaoRepository.save(instituicao);
        
        return converterParaDTO(instituicao);
    }
    
    public InstituicaoDTO atualizar(Long id, InstituicaoDTO dto) {
        Instituicao instituicao = instituicaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instituição não encontrada"));
        
        if (!instituicao.getNome().equals(dto.getNome()) && 
                instituicaoRepository.existsByNome(dto.getNome())) {
            throw new RuntimeException("Já existe uma instituição com este nome");
        }
        
        instituicao.setNome(dto.getNome());
        instituicao.setTipo(dto.getTipo());
        
        // Se o saldo inicial for alterado, ajustar o saldo atual proporcionalmente
        if (!instituicao.getSaldoInicial().equals(dto.getSaldoInicial())) {
            // Calcula a diferença entre o novo saldo inicial e o antigo
            var diferenca = dto.getSaldoInicial().subtract(instituicao.getSaldoInicial());
            // Adiciona a diferença ao saldo atual
            instituicao.setSaldoAtual(instituicao.getSaldoAtual().add(diferenca));
            instituicao.setSaldoInicial(dto.getSaldoInicial());
        }
        
        instituicao = instituicaoRepository.save(instituicao);
        
        return converterParaDTO(instituicao);
    }
    
    public void atualizarSaldo(Long id, java.math.BigDecimal novoSaldo) {
        Instituicao instituicao = instituicaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instituição não encontrada"));
        
        instituicao.setSaldoAtual(novoSaldo);
        instituicaoRepository.save(instituicao);
    }
    
    public void excluir(Long id) {
        if (!instituicaoRepository.existsById(id)) {
            throw new RuntimeException("Instituição não encontrada");
        }
        
        instituicaoRepository.deleteById(id);
    }
    
    private InstituicaoDTO converterParaDTO(Instituicao instituicao) {
        InstituicaoDTO dto = new InstituicaoDTO();
        dto.setId(instituicao.getId());
        dto.setNome(instituicao.getNome());
        dto.setTipo(instituicao.getTipo());
        dto.setSaldoInicial(instituicao.getSaldoInicial());
        dto.setSaldoAtual(instituicao.getSaldoAtual());
        return dto;
    }
}