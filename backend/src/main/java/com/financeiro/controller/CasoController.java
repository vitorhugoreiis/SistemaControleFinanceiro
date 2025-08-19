package com.financeiro.controller;

import java.math.BigDecimal;
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

import com.financeiro.dto.CasoDTO;
import com.financeiro.entity.Usuario;
import com.financeiro.enums.StatusCaso;
import com.financeiro.service.CasoService;
import com.financeiro.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/casos")
@CrossOrigin(origins = "http://localhost:4200")
public class CasoController {
    
    @Autowired
    private CasoService casoService;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @GetMapping
    public ResponseEntity<List<CasoDTO>> listarCasos(Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            List<CasoDTO> casos = casoService.listarCasosPorAdvogado(usuario.getId());
            return ResponseEntity.ok(casos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<CasoDTO>> listarCasosPorCliente(@PathVariable Long clienteId, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            List<CasoDTO> casos = casoService.listarCasosPorCliente(clienteId, usuario.getId());
            return ResponseEntity.ok(casos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CasoDTO>> listarCasosPorStatus(@PathVariable StatusCaso status, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            List<CasoDTO> casos = casoService.listarCasosPorStatus(usuario.getId(), status);
            return ResponseEntity.ok(casos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CasoDTO> buscarCaso(@PathVariable Long id, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            CasoDTO caso = casoService.buscarCasoPorId(id, usuario.getId());
            return ResponseEntity.ok(caso);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<CasoDTO> criarCaso(@Valid @RequestBody CasoDTO casoDTO, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            CasoDTO casoCriado = casoService.criarCaso(casoDTO, usuario.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(casoCriado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CasoDTO> atualizarCaso(@PathVariable Long id, @Valid @RequestBody CasoDTO casoDTO, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            CasoDTO casoAtualizado = casoService.atualizarCaso(id, casoDTO, usuario.getId());
            return ResponseEntity.ok(casoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCaso(@PathVariable Long id, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            casoService.excluirCaso(id, usuario.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<CasoDTO>> buscarCasos(@RequestParam String termo, Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            List<CasoDTO> casos = casoService.buscarCasos(termo, usuario.getId());
            return ResponseEntity.ok(casos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/pagamento-honorarios")
    public ResponseEntity<CasoDTO> registrarPagamentoHonorarios(
            @PathVariable Long id, 
            @RequestParam BigDecimal valor, 
            Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            CasoDTO casoAtualizado = casoService.registrarPagamentoHonorarios(id, valor, usuario.getId());
            return ResponseEntity.ok(casoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/honorarios-em-aberto")
    public ResponseEntity<List<CasoDTO>> listarCasosComHonorariosEmAberto(Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            List<CasoDTO> casos = casoService.listarCasosComHonorariosEmAberto(usuario.getId());
            return ResponseEntity.ok(casos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/honorarios/totais")
    public ResponseEntity<BigDecimal> calcularHonorariosTotais(Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            BigDecimal total = casoService.calcularHonorariosTotais(usuario.getId());
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/honorarios/pagos")
    public ResponseEntity<BigDecimal> calcularHonorariosPagos(Authentication authentication) {
        try {
            Usuario usuario = usuarioService.buscarUsuarioPorEmail(authentication.getName());
            BigDecimal total = casoService.calcularHonorariosPagos(usuario.getId());
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}