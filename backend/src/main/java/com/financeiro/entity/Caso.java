package com.financeiro.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.financeiro.enums.StatusCaso;

@Entity
@Table(name = "casos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Caso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "O número do processo é obrigatório")
    @Size(max = 50, message = "O número do processo deve ter no máximo 50 caracteres")
    @Column(name = "numero_processo", nullable = false, unique = true, length = 50)
    private String numeroProcesso;
    
    @NotBlank(message = "A descrição é obrigatória")
    @Size(min = 10, max = 500, message = "A descrição deve ter entre 10 e 500 caracteres")
    @Column(nullable = false, length = 500)
    private String descricao;
    
    @NotNull(message = "O status é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCaso status;
    
    @Column(name = "data_inicio")
    private LocalDate dataInicio;
    
    @Column(name = "data_fim")
    private LocalDate dataFim;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "O valor dos honorários deve ser maior que zero")
    @Column(name = "valor_honorarios", precision = 10, scale = 2)
    private BigDecimal valorHonorarios;
    
    @Column(name = "honorarios_pagos", precision = 10, scale = 2)
    private BigDecimal honorariosPagos = BigDecimal.ZERO;
    
    @Column(name = "data_cadastro", nullable = false)
    private LocalDateTime dataCadastro;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    @Column(columnDefinition = "TEXT")
    private String observacoes;
    
    @NotNull(message = "O cliente é obrigatório")
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
    
    @NotNull(message = "O advogado é obrigatório")
    @ManyToOne
    @JoinColumn(name = "advogado_id", nullable = false)
    private Usuario advogado;
    
    @PrePersist
    protected void onCreate() {
        dataCadastro = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
        if (honorariosPagos == null) {
            honorariosPagos = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
    
    public BigDecimal getHonorariosRestantes() {
        if (valorHonorarios == null || honorariosPagos == null) {
            return BigDecimal.ZERO;
        }
        return valorHonorarios.subtract(honorariosPagos);
    }
    
    public boolean isHonorariosPagosCompletos() {
        return getHonorariosRestantes().compareTo(BigDecimal.ZERO) <= 0;
    }
}