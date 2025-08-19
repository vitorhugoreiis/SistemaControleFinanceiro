package com.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.financeiro.enums.StatusCaso;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CasoDTO {
    
    private Long id;
    
    @NotBlank(message = "O número do processo é obrigatório")
    @Size(max = 50, message = "O número do processo deve ter no máximo 50 caracteres")
    private String numeroProcesso;
    
    @NotBlank(message = "A descrição é obrigatória")
    @Size(min = 10, max = 500, message = "A descrição deve ter entre 10 e 500 caracteres")
    private String descricao;
    
    @NotNull(message = "O status é obrigatório")
    private StatusCaso status;
    
    private LocalDate dataInicio;
    
    private LocalDate dataFim;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "O valor dos honorários deve ser maior que zero")
    private BigDecimal valorHonorarios;
    
    private BigDecimal honorariosPagos;
    
    private BigDecimal honorariosRestantes;
    
    private LocalDateTime dataCadastro;
    
    private LocalDateTime dataAtualizacao;
    
    private String observacoes;
    
    @NotNull(message = "O cliente é obrigatório")
    private Long clienteId;
    
    private String clienteNome;
    
    private String clienteCpfCnpj;
    
    private Long advogadoId;
    
    private String advogadoNome;
    
    private boolean honorariosPagosCompletos;
}