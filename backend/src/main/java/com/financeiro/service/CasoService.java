package com.financeiro.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.financeiro.dto.CasoDTO;
import com.financeiro.entity.Caso;
import com.financeiro.entity.Cliente;
import com.financeiro.entity.Usuario;
import com.financeiro.enums.StatusCaso;
import com.financeiro.repository.CasoRepository;
import com.financeiro.repository.ClienteRepository;
import com.financeiro.repository.UsuarioRepository;

@Service
@Transactional
public class CasoService {
    
    @Autowired
    private CasoRepository casoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<CasoDTO> listarCasosPorAdvogado(Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        List<Caso> casos = casoRepository.findByAdvogadoOrderByDataCadastroDesc(advogado);
        return casos.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public List<CasoDTO> listarCasosPorCliente(Long clienteId, Long advogadoId) {
        Cliente cliente = clienteRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        if (!cliente.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Cliente não pertence ao advogado informado");
        }
        
        List<Caso> casos = casoRepository.findByClienteOrderByDataCadastroDesc(cliente);
        return casos.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public List<CasoDTO> listarCasosPorStatus(Long advogadoId, StatusCaso status) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        List<Caso> casos = casoRepository.findByAdvogadoAndStatusOrderByDataCadastroDesc(advogado, status);
        return casos.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public CasoDTO buscarCasoPorId(Long id, Long advogadoId) {
        Caso caso = casoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caso não encontrado"));
        
        if (!caso.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Caso não pertence ao advogado informado");
        }
        
        return convertToDTO(caso);
    }
    
    public CasoDTO criarCaso(CasoDTO casoDTO, Long advogadoId) {
        if (casoRepository.existsByNumeroProcesso(casoDTO.getNumeroProcesso())) {
            throw new RuntimeException("Já existe um caso com este número de processo");
        }
        
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        Cliente cliente = clienteRepository.findById(casoDTO.getClienteId())
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        if (!cliente.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Cliente não pertence ao advogado informado");
        }
        
        Caso caso = convertToEntity(casoDTO);
        caso.setAdvogado(advogado);
        caso.setCliente(cliente);
        
        Caso casoSalvo = casoRepository.save(caso);
        return convertToDTO(casoSalvo);
    }
    
    public CasoDTO atualizarCaso(Long id, CasoDTO casoDTO, Long advogadoId) {
        Caso casoExistente = casoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caso não encontrado"));
        
        if (!casoExistente.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Caso não pertence ao advogado informado");
        }
        
        // Verificar se o número do processo já existe em outro caso
        Optional<Caso> casoComMesmoNumero = casoRepository.findByNumeroProcesso(casoDTO.getNumeroProcesso());
        if (casoComMesmoNumero.isPresent() && !casoComMesmoNumero.get().getId().equals(id)) {
            throw new RuntimeException("Já existe outro caso com este número de processo");
        }
        
        // Verificar se o cliente pertence ao advogado
        Cliente cliente = clienteRepository.findById(casoDTO.getClienteId())
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        if (!cliente.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Cliente não pertence ao advogado informado");
        }
        
        casoExistente.setNumeroProcesso(casoDTO.getNumeroProcesso());
        casoExistente.setDescricao(casoDTO.getDescricao());
        casoExistente.setStatus(casoDTO.getStatus());
        casoExistente.setDataInicio(casoDTO.getDataInicio());
        casoExistente.setDataFim(casoDTO.getDataFim());
        casoExistente.setValorHonorarios(casoDTO.getValorHonorarios());
        casoExistente.setHonorariosPagos(casoDTO.getHonorariosPagos());
        casoExistente.setObservacoes(casoDTO.getObservacoes());
        casoExistente.setCliente(cliente);
        
        Caso casoAtualizado = casoRepository.save(casoExistente);
        return convertToDTO(casoAtualizado);
    }
    
    public void excluirCaso(Long id, Long advogadoId) {
        Caso caso = casoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caso não encontrado"));
        
        if (!caso.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Caso não pertence ao advogado informado");
        }
        
        casoRepository.delete(caso);
    }
    
    public List<CasoDTO> buscarCasos(String termo, Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        List<Caso> casos = casoRepository.buscarPorTermoEAdvogado(termo, advogado);
        return casos.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public CasoDTO registrarPagamentoHonorarios(Long id, BigDecimal valorPagamento, Long advogadoId) {
        Caso caso = casoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Caso não encontrado"));
        
        if (!caso.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Caso não pertence ao advogado informado");
        }
        
        BigDecimal honorariosAtuais = caso.getHonorariosPagos() != null ? caso.getHonorariosPagos() : BigDecimal.ZERO;
        caso.setHonorariosPagos(honorariosAtuais.add(valorPagamento));
        
        Caso casoAtualizado = casoRepository.save(caso);
        return convertToDTO(casoAtualizado);
    }
    
    public List<CasoDTO> listarCasosComHonorariosEmAberto(Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        List<Caso> casos = casoRepository.findCasosComHonorariosEmAberto(advogado);
        return casos.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public BigDecimal calcularHonorariosTotais(Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        BigDecimal total = casoRepository.somarHonorariosTotaisPorAdvogado(advogado);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal calcularHonorariosPagos(Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        BigDecimal total = casoRepository.somarHonorariosPagosPorAdvogado(advogado);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    private CasoDTO convertToDTO(Caso caso) {
        CasoDTO dto = new CasoDTO();
        dto.setId(caso.getId());
        dto.setNumeroProcesso(caso.getNumeroProcesso());
        dto.setDescricao(caso.getDescricao());
        dto.setStatus(caso.getStatus());
        dto.setDataInicio(caso.getDataInicio());
        dto.setDataFim(caso.getDataFim());
        dto.setValorHonorarios(caso.getValorHonorarios());
        dto.setHonorariosPagos(caso.getHonorariosPagos());
        dto.setHonorariosRestantes(caso.getHonorariosRestantes());
        dto.setDataCadastro(caso.getDataCadastro());
        dto.setDataAtualizacao(caso.getDataAtualizacao());
        dto.setObservacoes(caso.getObservacoes());
        dto.setClienteId(caso.getCliente().getId());
        dto.setClienteNome(caso.getCliente().getNome());
        dto.setClienteCpfCnpj(caso.getCliente().getCpfCnpj());
        dto.setAdvogadoId(caso.getAdvogado().getId());
        dto.setAdvogadoNome(caso.getAdvogado().getNome());
        dto.setHonorariosPagosCompletos(caso.isHonorariosPagosCompletos());
        return dto;
    }
    
    private Caso convertToEntity(CasoDTO dto) {
        Caso caso = new Caso();
        caso.setId(dto.getId());
        caso.setNumeroProcesso(dto.getNumeroProcesso());
        caso.setDescricao(dto.getDescricao());
        caso.setStatus(dto.getStatus());
        caso.setDataInicio(dto.getDataInicio());
        caso.setDataFim(dto.getDataFim());
        caso.setValorHonorarios(dto.getValorHonorarios());
        caso.setHonorariosPagos(dto.getHonorariosPagos());
        caso.setObservacoes(dto.getObservacoes());
        return caso;
    }
}