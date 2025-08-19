package com.financeiro.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteDTO {
    
    private Long id;
    
    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    private String nome;
    
    @NotBlank(message = "O CPF/CNPJ é obrigatório")
    @Size(min = 11, max = 18, message = "CPF/CNPJ deve ter entre 11 e 18 caracteres")
    private String cpfCnpj;
    
    private String telefone;
    
    @Email(message = "Email inválido")
    private String email;
    
    private String endereco;
    
    private String cidade;
    
    private String estado;
    
    private String cep;
    
    private LocalDateTime dataCadastro;
    
    private LocalDateTime dataAtualizacao;
    
    private String observacoes;
    
    private Long advogadoId;
    
    private String advogadoNome;
    
    private Integer totalCasos;
}