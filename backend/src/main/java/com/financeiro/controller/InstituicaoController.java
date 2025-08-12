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

import com.financeiro.dto.InstituicaoDTO;
import com.financeiro.service.InstituicaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/instituicoes")
public class InstituicaoController {

    @Autowired
    private InstituicaoService instituicaoService;
    
    @GetMapping
    public ResponseEntity<List<InstituicaoDTO>> listar(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Long perfilId) {
        
        if (perfilId != null && tipo != null && !tipo.isEmpty()) {
            return ResponseEntity.ok(instituicaoService.listarPorPerfilETipo(perfilId, tipo));
        }
        
        if (perfilId != null) {
            return ResponseEntity.ok(instituicaoService.listarPorPerfil(perfilId));
        }
        
        if (tipo != null && !tipo.isEmpty()) {
            return ResponseEntity.ok(instituicaoService.listarPorTipo(tipo));
        }
        
        return ResponseEntity.ok(instituicaoService.listarTodas());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InstituicaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(instituicaoService.buscarPorId(id));
    }
    
    @PostMapping
    public ResponseEntity<InstituicaoDTO> criar(@Valid @RequestBody InstituicaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(instituicaoService.salvar(dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InstituicaoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody InstituicaoDTO dto) {
        return ResponseEntity.ok(instituicaoService.atualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        instituicaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}