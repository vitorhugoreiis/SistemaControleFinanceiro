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

import com.financeiro.dto.RegistroImportacaoDTO;
import com.financeiro.service.RegistroImportacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/registros-importacao")
public class RegistroImportacaoController {

    @Autowired
    private RegistroImportacaoService registroImportacaoService;
    
    @GetMapping
    public ResponseEntity<List<RegistroImportacaoDTO>> listar(
            @RequestParam(required = false) String banco,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        
        if (banco != null && !banco.isEmpty()) {
            return ResponseEntity.ok(registroImportacaoService.listarPorBanco(banco));
        }
        
        if (dataInicio != null && dataFim != null) {
            return ResponseEntity.ok(registroImportacaoService.listarPorPeriodo(dataInicio, dataFim));
        }
        
        return ResponseEntity.ok(registroImportacaoService.listarTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RegistroImportacaoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(registroImportacaoService.buscarPorId(id));
    }
    
    @PostMapping
    public ResponseEntity<RegistroImportacaoDTO> criar(@Valid @RequestBody RegistroImportacaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registroImportacaoService.salvar(dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RegistroImportacaoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody RegistroImportacaoDTO dto) {
        return ResponseEntity.ok(registroImportacaoService.atualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        registroImportacaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}