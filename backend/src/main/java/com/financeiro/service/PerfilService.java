package com.financeiro.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.financeiro.dto.PerfilDTO;
import com.financeiro.entity.Categoria;
import com.financeiro.entity.Instituicao;
import com.financeiro.entity.Perfil;
import com.financeiro.entity.Usuario;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.InstituicaoRepository;
import com.financeiro.repository.PerfilRepository;
import com.financeiro.repository.UsuarioRepository;

@Service
public class PerfilService {

    @Autowired
    private PerfilRepository perfilRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private InstituicaoRepository instituicaoRepository;
    
    public List<PerfilDTO> listarPorUsuario(Long usuarioId) {
        return perfilRepository.findByUsuarioId(usuarioId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public PerfilDTO buscarPorId(Long id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));
        return converterParaDTO(perfil);
    }
    
    public PerfilDTO salvar(PerfilDTO perfilDTO) {
        Perfil perfil = converterParaEntidade(perfilDTO);
        perfil = perfilRepository.save(perfil);
        return converterParaDTO(perfil);
    }
    
    public PerfilDTO atualizar(Long id, PerfilDTO perfilDTO) {
        if (!perfilRepository.existsById(id)) {
            throw new RuntimeException("Perfil não encontrado");
        }
        
        Perfil perfil = converterParaEntidade(perfilDTO);
        perfil.setId(id);
        perfil = perfilRepository.save(perfil);
        return converterParaDTO(perfil);
    }
    
    public void excluir(Long id) {
        if (!perfilRepository.existsById(id)) {
            throw new RuntimeException("Perfil não encontrado");
        }
        perfilRepository.deleteById(id);
    }
    
    private PerfilDTO converterParaDTO(Perfil perfil) {
        PerfilDTO dto = new PerfilDTO();
        dto.setId(perfil.getId());
        dto.setNome(perfil.getNome());
        dto.setTipoPerfil(perfil.getTipoPerfil());
        dto.setUsuarioId(perfil.getUsuario().getId());
        
        if (perfil.getInstituicoes() != null) {
            dto.setInstituicoesIds(perfil.getInstituicoes().stream()
                    .map(Instituicao::getId)
                    .collect(Collectors.toList()));
        }
        
        if (perfil.getCategorias() != null) {
            dto.setCategoriasIds(perfil.getCategorias().stream()
                    .map(Categoria::getId)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private Perfil converterParaEntidade(PerfilDTO dto) {
        Perfil perfil = new Perfil();
        perfil.setId(dto.getId());
        perfil.setNome(dto.getNome());
        perfil.setTipoPerfil(dto.getTipoPerfil());
        
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        perfil.setUsuario(usuario);
        
        return perfil;
    }
    
    public void criarPerfilPadrao(Usuario usuario) {
        Perfil perfilPessoal = new Perfil();
        perfilPessoal.setNome("Pessoal");
        perfilPessoal.setTipoPerfil("PF");
        perfilPessoal.setUsuario(usuario);
        
        perfilRepository.save(perfilPessoal);
    }
}