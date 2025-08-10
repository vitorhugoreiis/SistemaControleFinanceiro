package com.financeiro.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.financeiro.dto.SubcategoriaDTO;
import com.financeiro.entity.Categoria;
import com.financeiro.entity.Subcategoria;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.SubcategoriaRepository;

@Service
public class SubcategoriaService {

    @Autowired
    private SubcategoriaRepository subcategoriaRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    public List<SubcategoriaDTO> listarTodas() {
        return subcategoriaRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<SubcategoriaDTO> listarPorCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaId(categoriaId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public SubcategoriaDTO buscarPorId(Long id) {
        return subcategoriaRepository.findById(id)
                .map(this::converterParaDTO)
                .orElseThrow(() -> new RuntimeException("Subcategoria não encontrada"));
    }
    
    public SubcategoriaDTO salvar(SubcategoriaDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        
        if (subcategoriaRepository.existsByNomeAndCategoria(dto.getNome(), categoria)) {
            throw new RuntimeException("Já existe uma subcategoria com este nome nesta categoria");
        }
        
        Subcategoria subcategoria = new Subcategoria();
        subcategoria.setNome(dto.getNome());
        subcategoria.setCategoria(categoria);
        
        subcategoria = subcategoriaRepository.save(subcategoria);
        
        return converterParaDTO(subcategoria);
    }
    
    public SubcategoriaDTO atualizar(Long id, SubcategoriaDTO dto) {
        Subcategoria subcategoria = subcategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoria não encontrada"));
        
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        
        if (!subcategoria.getNome().equals(dto.getNome()) && 
                subcategoriaRepository.existsByNomeAndCategoria(dto.getNome(), categoria)) {
            throw new RuntimeException("Já existe uma subcategoria com este nome nesta categoria");
        }
        
        subcategoria.setNome(dto.getNome());
        subcategoria.setCategoria(categoria);
        
        subcategoria = subcategoriaRepository.save(subcategoria);
        
        return converterParaDTO(subcategoria);
    }
    
    public void excluir(Long id) {
        if (!subcategoriaRepository.existsById(id)) {
            throw new RuntimeException("Subcategoria não encontrada");
        }
        
        subcategoriaRepository.deleteById(id);
    }
    
    private SubcategoriaDTO converterParaDTO(Subcategoria subcategoria) {
        SubcategoriaDTO dto = new SubcategoriaDTO();
        dto.setId(subcategoria.getId());
        dto.setNome(subcategoria.getNome());
        dto.setCategoriaId(subcategoria.getCategoria().getId());
        return dto;
    }
}