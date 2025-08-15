package com.financeiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoDTO {
    
    private Long id;
    
    @NotNull(message = "A data é obrigatória")
    @PastOrPresent(message = "A data não pode ser futura")
    private LocalDate data;
    
    @NotBlank(message = "A descrição é obrigatória")
    private String descricao;
    
    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor deve ser positivo")
    private BigDecimal valor;
    
    @NotBlank(message = "O tipo é obrigatório")
    private String tipo; // Receita ou Despesa
    
    @NotNull(message = "O ID da categoria é obrigatório")
    private Long categoriaId;
    
    private Long subcategoriaId;
    
    @NotNull(message = "O ID da instituição é obrigatório")
    private Long instituicaoId;
    
    private Long perfilId;
    
    private Boolean transferenciaEntrePerfis = false;
    
    private Long perfilDestinoId;
    
    private Long transacaoRelacionadaId;
    
    private String categoriaNome;
    private String subcategoriaNome;
    private String instituicaoNome;
    private String perfilNome;
    private String perfilDestinoNome;
}