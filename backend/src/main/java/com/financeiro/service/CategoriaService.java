package com.financeiro.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.financeiro.dto.CategoriaDTO;
import com.financeiro.dto.SubcategoriaDTO;
import com.financeiro.entity.Categoria;
import com.financeiro.entity.Perfil;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.PerfilRepository;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private PerfilRepository perfilRepository;
    
    @Autowired
    private SubcategoriaService subcategoriaService;
    
    public List<CategoriaDTO> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<CategoriaDTO> listarPorTipo(String tipo) {
        return categoriaRepository.findByTipo(tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<CategoriaDTO> listarPorPerfil(Long perfilId) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        
        return categoriaRepository.findByPerfil(perfil).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<CategoriaDTO> listarPorPerfilETipo(Long perfilId, String tipo) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        
        return categoriaRepository.findByPerfilAndTipo(perfil, tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public CategoriaDTO buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .map(this::converterParaDTO)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }
    
    public CategoriaDTO salvar(CategoriaDTO dto) {
        if (categoriaRepository.existsByNomeAndTipo(dto.getNome(), dto.getTipo())) {
            throw new RuntimeException("Já existe uma categoria com este nome e tipo");
        }
        
        Categoria categoria = new Categoria();
        categoria.setNome(dto.getNome());
        categoria.setTipo(dto.getTipo());
        
        categoria = categoriaRepository.save(categoria);
        
        return converterParaDTO(categoria);
    }
    
    public CategoriaDTO atualizar(Long id, CategoriaDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        
        if (!categoria.getNome().equals(dto.getNome()) && 
                categoriaRepository.existsByNomeAndTipo(dto.getNome(), dto.getTipo())) {
            throw new RuntimeException("Já existe uma categoria com este nome e tipo");
        }
        
        categoria.setNome(dto.getNome());
        categoria.setTipo(dto.getTipo());
        
        categoria = categoriaRepository.save(categoria);
        
        return converterParaDTO(categoria);
    }
    
    public void excluir(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("Categoria não encontrada");
        }
        
        categoriaRepository.deleteById(id);
    }
    
    private CategoriaDTO converterParaDTO(Categoria categoria) {
        CategoriaDTO dto = new CategoriaDTO();
        dto.setId(categoria.getId());
        dto.setNome(categoria.getNome());
        dto.setTipo(categoria.getTipo());
        
        // Buscar subcategorias relacionadas
        List<SubcategoriaDTO> subcategorias = subcategoriaService.listarPorCategoria(categoria.getId());
        dto.setSubcategorias(subcategorias);
        
        return dto;
    }
}