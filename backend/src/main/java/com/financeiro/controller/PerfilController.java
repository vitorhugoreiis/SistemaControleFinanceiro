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
import org.springframework.web.bind.annotation.RestController;

import com.financeiro.dto.PerfilDTO;
import com.financeiro.service.PerfilService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/perfis")
public class PerfilController {

    @Autowired
    private PerfilService perfilService;
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PerfilDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
        List<PerfilDTO> perfis = perfilService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(perfis);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PerfilDTO> buscarPorId(@PathVariable Long id) {
        PerfilDTO perfil = perfilService.buscarPorId(id);
        return ResponseEntity.ok(perfil);
    }
    
    @PostMapping
    public ResponseEntity<PerfilDTO> criar(@Valid @RequestBody PerfilDTO perfilDTO) {
        PerfilDTO perfil = perfilService.salvar(perfilDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(perfil);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PerfilDTO> atualizar(@PathVariable Long id, @Valid @RequestBody PerfilDTO perfilDTO) {
        PerfilDTO perfil = perfilService.atualizar(id, perfilDTO);
        return ResponseEntity.ok(perfil);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        perfilService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}