package com.financeiro.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumoFinanceiroDTO {
    
    private BigDecimal totalReceitas;
    private BigDecimal totalDespesas;
    private BigDecimal saldoTotal;
    private List<ResumoCategoria> resumoPorCategoria;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumoCategoria {
        private Long categoriaId;
        private String categoriaNome;
        private String tipo;
        private BigDecimal valor;
    }
}