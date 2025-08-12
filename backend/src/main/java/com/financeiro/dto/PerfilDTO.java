package com.financeiro.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilDTO {
    
    private Long id;
    
    @NotBlank(message = "O nome é obrigatório")
    private String nome;
    
    @NotBlank(message = "O tipo é obrigatório")
    private String tipoPerfil; // PF ou PJ
    
    @NotNull(message = "O usuário é obrigatório")
    private Long usuarioId;
    
    private List<Long> instituicoesIds;
    
    private List<Long> categoriasIds;
}