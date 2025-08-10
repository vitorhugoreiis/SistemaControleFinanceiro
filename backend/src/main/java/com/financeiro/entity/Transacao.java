package com.financeiro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transacoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    @NotNull(message = "A categoria é obrigatória")
    private Categoria categoria;
    
    @ManyToOne
    @JoinColumn(name = "subcategoria_id")
    private Subcategoria subcategoria;
    
    @ManyToOne
    @JoinColumn(name = "instituicao_id")
    @NotNull(message = "A instituição é obrigatória")
    private Instituicao instituicao;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @NotNull(message = "O usuário é obrigatório")
    private Usuario usuario;
}