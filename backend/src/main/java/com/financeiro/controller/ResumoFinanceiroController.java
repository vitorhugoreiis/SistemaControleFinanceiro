package com.financeiro.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.financeiro.dto.ResumoFinanceiroDTO;
import com.financeiro.service.TransacaoService;

@RestController
@RequestMapping("/api/resumo-financeiro")
public class ResumoFinanceiroController {

    @Autowired
    private TransacaoService transacaoService;
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ResumoFinanceiroDTO> gerarResumoFinanceiro(
            @PathVariable Long usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        
        ResumoFinanceiroDTO resumo = transacaoService.gerarResumoFinanceiro(usuarioId, dataInicio, dataFim);
        return ResponseEntity.ok(resumo);
    }
}