package com.financeiro.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.financeiro.dto.LoginRequestDTO;
import com.financeiro.dto.LoginResponseDTO;
import com.financeiro.dto.UsuarioCadastroDTO;
import com.financeiro.dto.UsuarioDTO;
import com.financeiro.entity.Usuario;
import com.financeiro.repository.UsuarioRepository;
import com.financeiro.security.JwtService;
import com.financeiro.service.PerfilService;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PerfilService perfilService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtService jwtService;
    
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
        usuario.setSenhaHash(passwordEncoder.encode(dto.getSenha())); // Agora a senha é criptografada
        
        usuario = usuarioRepository.save(usuario);
        
        // Criar perfil padrão para o novo usuário
        perfilService.criarPerfilPadrao(usuario);
        
        return converterParaDTO(usuario);
    }
    
    public LoginResponseDTO autenticar(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getSenha())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Modificar esta linha para garantir que estamos passando um UserDetails
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtService.generateToken(userDetails);
        
        return LoginResponseDTO.builder()
                .token(jwt)
                .usuario(converterParaDTO(usuario))
                .build();
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