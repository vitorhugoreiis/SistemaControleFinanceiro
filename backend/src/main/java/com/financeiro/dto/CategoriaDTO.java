package com.financeiro.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaDTO {
    
    private Long id;
    
    @NotBlank(message = "O nome é obrigatório")
    private String nome;
    
    @NotBlank(message = "O tipo é obrigatório")
    private String tipo; // Receita ou Despesa
    
    private Long perfilId;
    
    private List<SubcategoriaDTO> subcategorias;
}