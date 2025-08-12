package com.financeiro.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "perfis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Perfil {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "O nome é obrigatório")
    private String nome;
    
    @NotBlank(message = "O tipo é obrigatório")
    @Column(name = "tipo_perfil")
    private String tipoPerfil; // PF ou PJ
    
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @NotNull(message = "O usuário é obrigatório")
    private Usuario usuario;
    
    @OneToMany(mappedBy = "perfil", cascade = CascadeType.ALL)
    private List<Instituicao> instituicoes;
    
    @OneToMany(mappedBy = "perfil", cascade = CascadeType.ALL)
    private List<Transacao> transacoes;
    
    @OneToMany(mappedBy = "perfil", cascade = CascadeType.ALL)
    private List<Categoria> categorias;
}