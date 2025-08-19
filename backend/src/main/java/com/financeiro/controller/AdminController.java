package com.financeiro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeiro.dto.UsuarioCadastroDTO;
import com.financeiro.dto.UsuarioDTO;
import com.financeiro.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UsuarioService usuarioService;
    
    // Método auxiliar para verificar se o usuário atual é administrador
    private void verificarPermissaoAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String emailUsuarioAtual = authentication.getName();
        
        if (!usuarioService.isAdministrador(emailUsuarioAtual)) {
            throw new RuntimeException("Acesso negado. Apenas administradores podem acessar esta funcionalidade.");
        }
    }
    
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioDTO>> listarTodosUsuarios() {
        verificarPermissaoAdmin();
        return ResponseEntity.ok(usuarioService.listarTodos());
    }
    
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDTO> buscarUsuarioPorId(@PathVariable Long id) {
        verificarPermissaoAdmin();
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }
    
    @PostMapping("/usuarios")
    public ResponseEntity<UsuarioDTO> criarUsuario(@Valid @RequestBody UsuarioCadastroDTO dto) {
        verificarPermissaoAdmin();
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.cadastrar(dto));
    }
    
    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDTO> atualizarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioDTO dto) {
        verificarPermissaoAdmin();
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }
    
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable Long id) {
        verificarPermissaoAdmin();
        
        // Verificar se não está tentando excluir a si mesmo
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String emailUsuarioAtual = authentication.getName();
        UsuarioDTO usuarioParaExcluir = usuarioService.buscarPorId(id);
        
        if (usuarioParaExcluir.getEmail().equals(emailUsuarioAtual)) {
            throw new RuntimeException("Não é possível excluir seu próprio usuário.");
        }
        
        usuarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/usuarios/{id}/promover")
    public ResponseEntity<UsuarioDTO> promoverParaAdministrador(@PathVariable Long id) {
        verificarPermissaoAdmin();
        return ResponseEntity.ok(usuarioService.promoverParaAdministrador(id));
    }
    
    @PutMapping("/usuarios/{id}/rebaixar")
    public ResponseEntity<UsuarioDTO> rebaixarParaComum(@PathVariable Long id) {
        verificarPermissaoAdmin();
        
        // Verificar se não está tentando rebaixar a si mesmo
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String emailUsuarioAtual = authentication.getName();
        UsuarioDTO usuarioParaRebaixar = usuarioService.buscarPorId(id);
        
        if (usuarioParaRebaixar.getEmail().equals(emailUsuarioAtual)) {
            throw new RuntimeException("Não é possível rebaixar seu próprio usuário.");
        }
        
        return ResponseEntity.ok(usuarioService.rebaixarParaComum(id));
    }
    
    @GetMapping("/verificar-permissao")
    public ResponseEntity<Boolean> verificarPermissaoAdministrador() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String emailUsuarioAtual = authentication.getName();
        
        boolean isAdmin = usuarioService.isAdministrador(emailUsuarioAtual);
        return ResponseEntity.ok(isAdmin);
    }
}