package com.financeiro.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "registros_importacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroImportacao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "A data de extração é obrigatória")
    @PastOrPresent(message = "A data não pode ser futura")
    private LocalDate dataExtracao;
    
    @NotBlank(message = "O banco é obrigatório")
    private String banco;
    
    @NotBlank(message = "O período é obrigatório")
    private String periodo;
    
    @NotBlank(message = "O nome do arquivo é obrigatório")
    private String nomeArquivo;
}