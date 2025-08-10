package com.financeiro.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.financeiro.dto.RegistroImportacaoDTO;
import com.financeiro.entity.RegistroImportacao;
import com.financeiro.repository.RegistroImportacaoRepository;

@Service
public class RegistroImportacaoService {

    @Autowired
    private RegistroImportacaoRepository registroImportacaoRepository;
    
    public List<RegistroImportacaoDTO> listarTodos() {
        return registroImportacaoRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<RegistroImportacaoDTO> listarPorBanco(String banco) {
        return registroImportacaoRepository.findByBanco(banco).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<RegistroImportacaoDTO> listarPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return registroImportacaoRepository.findByDataExtracaoBetween(dataInicio, dataFim).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public RegistroImportacaoDTO buscarPorId(Long id) {
        return registroImportacaoRepository.findById(id)
                .map(this::converterParaDTO)
                .orElseThrow(() -> new RuntimeException("Registro de importação não encontrado"));
    }
    
    public RegistroImportacaoDTO salvar(RegistroImportacaoDTO dto) {
        if (registroImportacaoRepository.existsByNomeArquivo(dto.getNomeArquivo())) {
            throw new RuntimeException("Já existe um registro com este nome de arquivo");
        }
        
        RegistroImportacao registro = new RegistroImportacao();
        registro.setDataExtracao(dto.getDataExtracao());
        registro.setBanco(dto.getBanco());
        registro.setPeriodo(dto.getPeriodo());
        registro.setNomeArquivo(dto.getNomeArquivo());
        
        registro = registroImportacaoRepository.save(registro);
        
        return converterParaDTO(registro);
    }
    
    public RegistroImportacaoDTO atualizar(Long id, RegistroImportacaoDTO dto) {
        RegistroImportacao registro = registroImportacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de importação não encontrado"));
        
        if (!registro.getNomeArquivo().equals(dto.getNomeArquivo()) && 
                registroImportacaoRepository.existsByNomeArquivo(dto.getNomeArquivo())) {
            throw new RuntimeException("Já existe um registro com este nome de arquivo");
        }
        
        registro.setDataExtracao(dto.getDataExtracao());
        registro.setBanco(dto.getBanco());
        registro.setPeriodo(dto.getPeriodo());
        registro.setNomeArquivo(dto.getNomeArquivo());
        
        registro = registroImportacaoRepository.save(registro);
        
        return converterParaDTO(registro);
    }
    
    public void excluir(Long id) {
        if (!registroImportacaoRepository.existsById(id)) {
            throw new RuntimeException("Registro de importação não encontrado");
        }
        
        registroImportacaoRepository.deleteById(id);
    }
    
    private RegistroImportacaoDTO converterParaDTO(RegistroImportacao registro) {
        RegistroImportacaoDTO dto = new RegistroImportacaoDTO();
        dto.setId(registro.getId());
        dto.setDataExtracao(registro.getDataExtracao());
        dto.setBanco(registro.getBanco());
        dto.setPeriodo(registro.getPeriodo());
        dto.setNomeArquivo(registro.getNomeArquivo());
        return dto;
    }
}