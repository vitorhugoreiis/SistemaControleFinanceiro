package com.financeiro.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.financeiro.dto.UsuarioCadastroDTO;
import com.financeiro.dto.UsuarioDTO;
import com.financeiro.entity.Usuario;
import com.financeiro.repository.UsuarioRepository;
import com.financeiro.service.PerfilService;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PerfilService perfilService;
    
    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public UsuarioDTO buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::converterParaDTO)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
    
    public Optional<UsuarioDTO> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(this::converterParaDTO);
    }
    
    public UsuarioDTO cadastrar(UsuarioCadastroDTO dto) {
        if (!dto.getSenha().equals(dto.getConfirmacaoSenha())) {
            throw new RuntimeException("As senhas não conferem");
        }
        
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenhaHash(dto.getSenha()); // Em uma aplicação real, a senha deve ser criptografada
        
        usuario = usuarioRepository.save(usuario);
        
        // Criar perfil padrão para o novo usuário
        perfilService.criarPerfilPadrao(usuario);
        
        return converterParaDTO(usuario);
    }
    
    public UsuarioDTO atualizar(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        usuario.setNome(dto.getNome());
        
        if (!usuario.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        
        usuario.setEmail(dto.getEmail());
        
        usuario = usuarioRepository.save(usuario);
        
        return converterParaDTO(usuario);
    }
    
    public void excluir(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        
        usuarioRepository.deleteById(id);
    }
    
    private UsuarioDTO converterParaDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        return dto;
    }
}