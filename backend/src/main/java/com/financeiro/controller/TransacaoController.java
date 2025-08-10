package com.financeiro.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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

import com.financeiro.dto.TransacaoDTO;
import com.financeiro.service.TransacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;
    
    @GetMapping
    public ResponseEntity<List<TransacaoDTO>> listar(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        
        if (usuarioId != null && tipo != null) {
            return ResponseEntity.ok(transacaoService.listarPorUsuarioETipo(usuarioId, tipo));
        }
        
        if (usuarioId != null && dataInicio != null && dataFim != null) {
            return ResponseEntity.ok(transacaoService.listarPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim));
        }
        
        if (usuarioId != null) {
            return ResponseEntity.ok(transacaoService.listarPorUsuario(usuarioId));
        }
        
        if (tipo != null) {
            return ResponseEntity.ok(transacaoService.listarPorTipo(tipo));
        }
        
        if (dataInicio != null && dataFim != null) {
            return ResponseEntity.ok(transacaoService.listarPorPeriodo(dataInicio, dataFim));
        }
        
        return ResponseEntity.ok(transacaoService.listarTodas());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TransacaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(transacaoService.buscarPorId(id));
    }
    
    @PostMapping
    public ResponseEntity<TransacaoDTO> criar(
            @Valid @RequestBody TransacaoDTO dto,
            @RequestParam Long usuarioId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transacaoService.salvar(dto, usuarioId));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TransacaoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody TransacaoDTO dto) {
        return ResponseEntity.ok(transacaoService.atualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        transacaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}