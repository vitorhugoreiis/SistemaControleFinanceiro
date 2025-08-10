package com.financeiro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.financeiro.dto.SubcategoriaDTO;
import com.financeiro.service.SubcategoriaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subcategorias")
public class SubcategoriaController {

    @Autowired
    private SubcategoriaService subcategoriaService;
    
    @GetMapping
    public ResponseEntity<List<SubcategoriaDTO>> listar(
            @RequestParam(required = false) Long categoriaId) {
        
        if (categoriaId != null) {
            return ResponseEntity.ok(subcategoriaService.listarPorCategoria(categoriaId));
        }
        
        return ResponseEntity.ok(subcategoriaService.listarTodas());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SubcategoriaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(subcategoriaService.buscarPorId(id));
    }
    
    @PostMapping
    public ResponseEntity<SubcategoriaDTO> criar(@Valid @RequestBody SubcategoriaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subcategoriaService.salvar(dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SubcategoriaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody SubcategoriaDTO dto) {
        return ResponseEntity.ok(subcategoriaService.atualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        subcategoriaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}