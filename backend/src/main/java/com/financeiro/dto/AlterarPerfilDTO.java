package com.financeiro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AlterarPerfilDTO {
    
    @NotBlank(message = "Senha atual é obrigatória")
    private String senhaAtual;
    
    // Campos para alteração de senha (opcionais)
    @Size(min = 6, message = "Nova senha deve ter pelo menos 6 caracteres")
    private String novaSenha;
    
    private String confirmacaoNovaSenha;
    
    // Campo para alteração de email (opcional)
    @Email(message = "Email deve ter um formato válido")
    private String novoEmail;
    
    // Campo para alteração de nome (opcional)
    private String novoNome;
    
    // Constructors
    public AlterarPerfilDTO() {}
    
    public AlterarPerfilDTO(String senhaAtual) {
        this.senhaAtual = senhaAtual;
    }
    
    public AlterarPerfilDTO(String senhaAtual, String novaSenha, String confirmacaoNovaSenha) {
        this.senhaAtual = senhaAtual;
        this.novaSenha = novaSenha;
        this.confirmacaoNovaSenha = confirmacaoNovaSenha;
    }
    
    public AlterarPerfilDTO(String senhaAtual, String novoEmail) {
        this.senhaAtual = senhaAtual;
        this.novoEmail = novoEmail;
    }
    
    // Métodos de validação
    public boolean isAlteracaoSenha() {
        return novaSenha != null && !novaSenha.trim().isEmpty();
    }
    
    public boolean isAlteracaoEmail() {
        return novoEmail != null && !novoEmail.trim().isEmpty();
    }
    
    public boolean isAlteracaoNome() {
        return novoNome != null && !novoNome.trim().isEmpty();
    }
    
    // Getters and Setters
    public String getSenhaAtual() {
        return senhaAtual;
    }
    
    public void setSenhaAtual(String senhaAtual) {
        this.senhaAtual = senhaAtual;
    }
    
    public String getNovaSenha() {
        return novaSenha;
    }
    
    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }
    
    public String getConfirmacaoNovaSenha() {
        return confirmacaoNovaSenha;
    }
    
    public void setConfirmacaoNovaSenha(String confirmacaoNovaSenha) {
        this.confirmacaoNovaSenha = confirmacaoNovaSenha;
    }
    
    public String getNovoEmail() {
        return novoEmail;
    }
    
    public void setNovoEmail(String novoEmail) {
        this.novoEmail = novoEmail;
    }
    
    public String getNovoNome() {
        return novoNome;
    }
    
    public void setNovoNome(String novoNome) {
        this.novoNome = novoNome;
    }
}