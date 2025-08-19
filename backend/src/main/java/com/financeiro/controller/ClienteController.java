package com.financeiro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.financeiro.dto.ClienteDTO;
import com.financeiro.entity.Usuario;
import com.financeiro.service.ClienteService;
import com.financeiro.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:4200")
public class ClienteController {
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    public ResponseEntity<List<ClienteDTO>> listarClientes(Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            List<ClienteDTO> clientes = clienteService.listarClientesPorAdvogado(usuario.getId());
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ClienteDTO> buscarCliente(@PathVariable Long id, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            ClienteDTO cliente = clienteService.buscarClientePorId(id, usuario.getId());
            return ResponseEntity.ok(cliente);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<ClienteDTO> criarCliente(@Valid @RequestBody ClienteDTO clienteDTO, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            ClienteDTO clienteCriado = clienteService.criarCliente(clienteDTO, usuario.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(clienteCriado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> atualizarCliente(@PathVariable Long id, @Valid @RequestBody ClienteDTO clienteDTO, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            ClienteDTO clienteAtualizado = clienteService.atualizarCliente(id, clienteDTO, usuario.getId());
            return ResponseEntity.ok(clienteAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCliente(@PathVariable Long id, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            clienteService.excluirCliente(id, usuario.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<ClienteDTO>> buscarClientes(@RequestParam String termo, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            List<ClienteDTO> clientes = clienteService.buscarClientes(termo, usuario.getId());
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/contador")
    public ResponseEntity<Long> contarClientes(Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            long count = clienteService.contarClientesPorAdvogado(usuario.getId());
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}