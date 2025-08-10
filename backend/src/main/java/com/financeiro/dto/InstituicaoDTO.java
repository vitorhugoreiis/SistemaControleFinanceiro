package com.financeiro.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstituicaoDTO {
    
    private Long id;
    
    @NotBlank(message = "O nome é obrigatório")
    private String nome;
    
    @NotBlank(message = "O tipo é obrigatório")
    private String tipo; // Conta Corrente, Poupança, Cartão de Crédito, etc.
    
    @NotNull(message = "O saldo inicial é obrigatório")
    private BigDecimal saldoInicial;
    
    private BigDecimal saldoAtual;
}