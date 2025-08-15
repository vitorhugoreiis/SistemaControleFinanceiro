package com.financeiro.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.financeiro.dto.ResumoFinanceiroDTO;
import com.financeiro.dto.ResumoFinanceiroDTO.ResumoCategoria;
import com.financeiro.dto.TransacaoDTO;
import com.financeiro.entity.Categoria;
import com.financeiro.entity.Instituicao;
import com.financeiro.entity.Perfil;
import com.financeiro.entity.Subcategoria;
import com.financeiro.entity.Transacao;
import com.financeiro.entity.Usuario;
import com.financeiro.exception.RecursoNaoEncontradoException;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.InstituicaoRepository;
import com.financeiro.repository.PerfilRepository;
import com.financeiro.repository.SubcategoriaRepository;
import com.financeiro.repository.TransacaoRepository;
import com.financeiro.repository.UsuarioRepository;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private SubcategoriaRepository subcategoriaRepository;
    
    @Autowired
    private InstituicaoRepository instituicaoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private InstituicaoService instituicaoService;
    
    public List<TransacaoDTO> listarTodas() {
        return transacaoRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        return transacaoRepository.findByUsuario(usuario).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorTipo(String tipo) {
        return transacaoRepository.findByTipo(tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return transacaoRepository.findByDataBetween(dataInicio, dataFim).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorUsuarioETipo(Long usuarioId, String tipo) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        return transacaoRepository.findByUsuarioAndTipo(usuario, tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorUsuarioEPeriodo(Long usuarioId, LocalDate dataInicio, LocalDate dataFim) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        return transacaoRepository.findByUsuarioAndDataBetween(usuario, dataInicio, dataFim).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public TransacaoDTO buscarPorId(Long id) {
        return transacaoRepository.findById(id)
                .map(this::converterParaDTO)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Transação", id));
    }
    
    @Transactional
    public TransacaoDTO salvar(TransacaoDTO dto, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", usuarioId));
        
        // Se for uma transferência entre perfis, criar duas transações vinculadas
        if (Boolean.TRUE.equals(dto.getTransferenciaEntrePerfis()) && dto.getPerfilDestinoId() != null) {
            return criarTransferenciaEntrePerfis(dto, usuario);
        }
        
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", dto.getCategoriaId()));
        
        Subcategoria subcategoria = null;
        if (dto.getSubcategoriaId() != null) {
            subcategoria = subcategoriaRepository.findById(dto.getSubcategoriaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Subcategoria", dto.getSubcategoriaId()));
        }
        
        Instituicao instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Instituição", dto.getInstituicaoId()));
        
        Transacao transacao = new Transacao();
        transacao.setData(dto.getData());
        transacao.setDescricao(dto.getDescricao());
        transacao.setValor(dto.getValor());
        transacao.setTipo(dto.getTipo());
        transacao.setCategoria(categoria);
        transacao.setSubcategoria(subcategoria);
        transacao.setInstituicao(instituicao);
        transacao.setUsuario(usuario);
        
        // Adicionar informações de perfil
        Perfil perfil;
        if (dto.getPerfilId() != null) {
            perfil = perfilRepository.findById(dto.getPerfilId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", dto.getPerfilId()));
        } else {
            // Se não foi especificado um perfil, usar o primeiro perfil do usuário
            List<Perfil> perfis = perfilRepository.findByUsuario(usuario);
            if (perfis.isEmpty()) {
                throw new RuntimeException("Usuário não possui perfis configurados");
            }
            perfil = perfis.get(0); // Usar o primeiro perfil como padrão
        }
        transacao.setPerfil(perfil);
        
        transacao = transacaoRepository.save(transacao);
        
        // Atualizar o saldo da instituição
        atualizarSaldoInstituicao(instituicao, dto.getValor(), dto.getTipo());
        
        return converterParaDTO(transacao);
    }
    
    @Transactional
    public TransacaoDTO salvarPorPerfil(TransacaoDTO dto, Long perfilId) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", perfilId));
        
        Usuario usuario = perfil.getUsuario();
        
        // Se for uma transferência entre perfis, criar duas transações vinculadas
        if (Boolean.TRUE.equals(dto.getTransferenciaEntrePerfis()) && dto.getPerfilDestinoId() != null) {
            return criarTransferenciaEntrePerfis(dto, usuario);
        }
        
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", dto.getCategoriaId()));
        
        Subcategoria subcategoria = null;
        if (dto.getSubcategoriaId() != null) {
            subcategoria = subcategoriaRepository.findById(dto.getSubcategoriaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Subcategoria", dto.getSubcategoriaId()));
        }
        
        Instituicao instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Instituição", dto.getInstituicaoId()));
        
        Transacao transacao = new Transacao();
        transacao.setData(dto.getData());
        transacao.setDescricao(dto.getDescricao());
        transacao.setValor(dto.getValor());
        transacao.setTipo(dto.getTipo());
        transacao.setCategoria(categoria);
        transacao.setSubcategoria(subcategoria);
        transacao.setInstituicao(instituicao);
        transacao.setUsuario(usuario);
        transacao.setPerfil(perfil);
        
        transacao = transacaoRepository.save(transacao);
        
        // Atualizar o saldo da instituição
        atualizarSaldoInstituicao(instituicao, dto.getValor(), dto.getTipo());
        
        return converterParaDTO(transacao);
    }
    
    @Transactional
    public TransacaoDTO atualizar(Long id, TransacaoDTO dto) {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Transação", id));
        
        // Reverter o efeito da transação anterior no saldo
        atualizarSaldoInstituicao(transacao.getInstituicao(), transacao.getValor(), 
                transacao.getTipo().equals("Receita") ? "Despesa" : "Receita");
        
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", dto.getCategoriaId()));
        
        Subcategoria subcategoria = null;
        if (dto.getSubcategoriaId() != null) {
            subcategoria = subcategoriaRepository.findById(dto.getSubcategoriaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Subcategoria", dto.getSubcategoriaId()));
        }
        
        Instituicao instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Instituição", dto.getInstituicaoId()));
        
        transacao.setData(dto.getData());
        transacao.setDescricao(dto.getDescricao());
        transacao.setValor(dto.getValor());
        transacao.setTipo(dto.getTipo());
        transacao.setCategoria(categoria);
        transacao.setSubcategoria(subcategoria);
        transacao.setInstituicao(instituicao);
        
        transacao = transacaoRepository.save(transacao);
        
        // Aplicar o efeito da nova transação no saldo
        atualizarSaldoInstituicao(instituicao, dto.getValor(), dto.getTipo());
        
        return converterParaDTO(transacao);
    }
    
    @Transactional
    public void excluir(Long id) {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Transação", id));
        
        // Reverter o efeito da transação no saldo
        atualizarSaldoInstituicao(transacao.getInstituicao(), transacao.getValor(), 
                transacao.getTipo().equals("Receita") ? "Despesa" : "Receita");
        
        transacaoRepository.deleteById(id);
    }
    
    private void atualizarSaldoInstituicao(Instituicao instituicao, BigDecimal valor, String tipo) {
        BigDecimal novoSaldo;
        
        if (tipo.equals("Receita")) {
            novoSaldo = instituicao.getSaldoAtual().add(valor);
        } else {
            novoSaldo = instituicao.getSaldoAtual().subtract(valor);
        }
        
        instituicaoService.atualizarSaldo(instituicao.getId(), novoSaldo);
    }
    
    @Autowired
    private PerfilRepository perfilRepository;
    
    public List<TransacaoDTO> listarPorPerfil(Long perfilId) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", perfilId));
        
        return transacaoRepository.findByPerfil(perfil).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorPerfilETipo(Long perfilId, String tipo) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", perfilId));
        
        return transacaoRepository.findByPerfilAndTipo(perfil, tipo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorPerfilEPeriodo(Long perfilId, LocalDate dataInicio, LocalDate dataFim) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", perfilId));
        
        return transacaoRepository.findByPerfilAndDataBetween(perfil, dataInicio, dataFim).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorPerfilECategoria(Long perfilId, Long categoriaId) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", perfilId));
        
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", categoriaId));
        
        return transacaoRepository.findByPerfilAndCategoria(perfil, categoria).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransacaoDTO> listarPorPerfilTipoECategoria(Long perfilId, String tipo, Long categoriaId) {
        Perfil perfil = perfilRepository.findById(perfilId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", perfilId));
        
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", categoriaId));
        
        return transacaoRepository.findByPerfilAndTipoAndCategoria(perfil, tipo, categoria).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    private TransacaoDTO converterParaDTO(Transacao transacao) {
        TransacaoDTO dto = new TransacaoDTO();
        dto.setId(transacao.getId());
        dto.setData(transacao.getData());
        dto.setDescricao(transacao.getDescricao());
        dto.setValor(transacao.getValor());
        dto.setTipo(transacao.getTipo());
        dto.setCategoriaId(transacao.getCategoria().getId());
        dto.setCategoriaNome(transacao.getCategoria().getNome());
        
        if (transacao.getSubcategoria() != null) {
            dto.setSubcategoriaId(transacao.getSubcategoria().getId());
            dto.setSubcategoriaNome(transacao.getSubcategoria().getNome());
        }
        
        dto.setInstituicaoId(transacao.getInstituicao().getId());
        dto.setInstituicaoNome(transacao.getInstituicao().getNome());
        
        if (transacao.getPerfil() != null) {
            dto.setPerfilId(transacao.getPerfil().getId());
            dto.setPerfilNome(transacao.getPerfil().getNome());
        }
        
        dto.setTransferenciaEntrePerfis(transacao.getTransferenciaEntrePerfis());
        
        if (transacao.getPerfilDestino() != null) {
            dto.setPerfilDestinoId(transacao.getPerfilDestino().getId());
            dto.setPerfilDestinoNome(transacao.getPerfilDestino().getNome());
        }
        
        if (transacao.getTransacaoRelacionada() != null) {
            dto.setTransacaoRelacionadaId(transacao.getTransacaoRelacionada().getId());
        }
        
        return dto;
    }
    
    @Transactional
    private TransacaoDTO criarTransferenciaEntrePerfis(TransacaoDTO dto, Usuario usuario) {
        // Buscar perfis de origem e destino
        Perfil perfilOrigem = perfilRepository.findById(dto.getPerfilId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil de origem", dto.getPerfilId()));
        
        Perfil perfilDestino = perfilRepository.findById(dto.getPerfilDestinoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil de destino", dto.getPerfilDestinoId()));
        
        // Buscar categorias para transferência entre perfis
        Categoria categoriaDespesa = categoriaRepository.findByNomeAndTipo("Transferência entre Perfis", "Despesa")
                .orElseThrow(() -> new RuntimeException("Categoria 'Transferência entre Perfis' do tipo Despesa não encontrada"));
        
        Categoria categoriaReceita = categoriaRepository.findByNomeAndTipo("Transferência entre Perfis", "Receita")
                .orElseThrow(() -> new RuntimeException("Categoria 'Transferência entre Perfis' do tipo Receita não encontrada"));
        
        // Buscar instituições
        Instituicao instituicaoOrigem = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Instituição", dto.getInstituicaoId()));
        
        // 1. Criar transação de saída (Despesa) no perfil de origem
        Transacao transacaoSaida = new Transacao();
        transacaoSaida.setData(dto.getData());
        transacaoSaida.setDescricao(dto.getDescricao() + " (Saída para " + perfilDestino.getNome() + ")");
        transacaoSaida.setValor(dto.getValor());
        transacaoSaida.setTipo("Despesa");
        transacaoSaida.setCategoria(categoriaDespesa);
        transacaoSaida.setInstituicao(instituicaoOrigem);
        transacaoSaida.setUsuario(usuario);
        transacaoSaida.setPerfil(perfilOrigem);
        transacaoSaida.setTransferenciaEntrePerfis(true);
        transacaoSaida.setPerfilDestino(perfilDestino);
        
        transacaoSaida = transacaoRepository.save(transacaoSaida);
        
        // Atualizar o saldo da instituição de origem (reduzir)
        atualizarSaldoInstituicao(instituicaoOrigem, dto.getValor(), "Despesa");
        
        // 2. Criar transação de entrada (Receita) no perfil de destino
        Transacao transacaoEntrada = new Transacao();
        transacaoEntrada.setData(dto.getData());
        transacaoEntrada.setDescricao(dto.getDescricao() + " (Entrada de " + perfilOrigem.getNome() + ")");
        transacaoEntrada.setValor(dto.getValor());
        transacaoEntrada.setTipo("Receita");
        transacaoEntrada.setCategoria(categoriaReceita);
        transacaoEntrada.setInstituicao(instituicaoOrigem); // Mesma instituição ou poderia ser outra
        transacaoEntrada.setUsuario(usuario);
        transacaoEntrada.setPerfil(perfilDestino);
        transacaoEntrada.setTransferenciaEntrePerfis(true);
        transacaoEntrada.setTransacaoRelacionada(transacaoSaida);
        
        transacaoEntrada = transacaoRepository.save(transacaoEntrada);
        
        // Atualizar a transação de saída para referenciar a de entrada
        transacaoSaida.setTransacaoRelacionada(transacaoEntrada);
        transacaoRepository.save(transacaoSaida);
        
        // Retornar a transação de saída como resultado
        return converterParaDTO(transacaoSaida);
    }
    
    public ResumoFinanceiroDTO gerarResumoFinanceiro(Long usuarioId, LocalDate dataInicio, LocalDate dataFim) {
        return gerarResumoFinanceiro(usuarioId, null, dataInicio, dataFim);
    }
    
    public ResumoFinanceiroDTO gerarResumoFinanceiro(Long usuarioId, Long perfilId, LocalDate dataInicio, LocalDate dataFim) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", usuarioId));
        
        Perfil perfil = null;
        if (perfilId != null) {
            perfil = perfilRepository.findById(perfilId)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil", perfilId));
        }
        
        // Calcular total de receitas
        Double totalReceitasDouble = transacaoRepository.calcularSomaPorTipoEPeriodo(usuario, "Receita", dataInicio, dataFim);
        BigDecimal totalReceitas = totalReceitasDouble != null ? BigDecimal.valueOf(totalReceitasDouble) : BigDecimal.ZERO;
        
        // Calcular total de despesas
        Double totalDespesasDouble = transacaoRepository.calcularSomaPorTipoEPeriodo(usuario, "Despesa", dataInicio, dataFim);
        BigDecimal totalDespesas = totalDespesasDouble != null ? BigDecimal.valueOf(totalDespesasDouble) : BigDecimal.ZERO;
        
        // Calcular saldo total
        BigDecimal saldoTotal = totalReceitas.subtract(totalDespesas);
        
        // Buscar todas as categorias
        List<Categoria> categorias = categoriaRepository.findAll();
        
        // Calcular resumo por categoria
        List<ResumoCategoria> resumoPorCategoria = new ArrayList<>();
        
        for (Categoria categoria : categorias) {
            Double valorDouble = transacaoRepository.calcularSomaPorCategoriaEPeriodo(usuario, categoria, dataInicio, dataFim);
            
            if (valorDouble != null && valorDouble > 0) {
                BigDecimal valor = BigDecimal.valueOf(valorDouble);
                
                ResumoCategoria resumoCategoria = ResumoCategoria.builder()
                        .categoriaId(categoria.getId())
                        .categoriaNome(categoria.getNome())
                        .tipo(categoria.getTipo())
                        .valor(valor)
                        .build();
                
                resumoPorCategoria.add(resumoCategoria);
            }
        }
        
        return ResumoFinanceiroDTO.builder()
                .totalReceitas(totalReceitas)
                .totalDespesas(totalDespesas)
                .saldoTotal(saldoTotal)
                .resumoPorCategoria(resumoPorCategoria)
                .build();
    }
}