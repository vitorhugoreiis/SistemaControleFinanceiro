package com.financeiro.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.financeiro.dto.ClienteDTO;
import com.financeiro.entity.Cliente;
import com.financeiro.entity.Usuario;
import com.financeiro.repository.ClienteRepository;
import com.financeiro.repository.UsuarioRepository;

@Service
@Transactional
public class ClienteService {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public List<ClienteDTO> listarClientesPorAdvogado(Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        List<Cliente> clientes = clienteRepository.findByAdvogadoOrderByNomeAsc(advogado);
        return clientes.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public ClienteDTO buscarClientePorId(Long id, Long advogadoId) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        if (!cliente.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Cliente não pertence ao advogado informado");
        }
        
        return convertToDTO(cliente);
    }
    
    public ClienteDTO criarCliente(ClienteDTO clienteDTO, Long advogadoId) {
        if (clienteRepository.existsByCpfCnpj(clienteDTO.getCpfCnpj())) {
            throw new RuntimeException("Já existe um cliente com este CPF/CNPJ");
        }
        
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        Cliente cliente = convertToEntity(clienteDTO);
        cliente.setAdvogado(advogado);
        
        Cliente clienteSalvo = clienteRepository.save(cliente);
        return convertToDTO(clienteSalvo);
    }
    
    public ClienteDTO atualizarCliente(Long id, ClienteDTO clienteDTO, Long advogadoId) {
        Cliente clienteExistente = clienteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        if (!clienteExistente.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Cliente não pertence ao advogado informado");
        }
        
        // Verificar se o CPF/CNPJ já existe em outro cliente
        Optional<Cliente> clienteComMesmoCpf = clienteRepository.findByCpfCnpj(clienteDTO.getCpfCnpj());
        if (clienteComMesmoCpf.isPresent() && !clienteComMesmoCpf.get().getId().equals(id)) {
            throw new RuntimeException("Já existe outro cliente com este CPF/CNPJ");
        }
        
        clienteExistente.setNome(clienteDTO.getNome());
        clienteExistente.setCpfCnpj(clienteDTO.getCpfCnpj());
        clienteExistente.setTelefone(clienteDTO.getTelefone());
        clienteExistente.setEmail(clienteDTO.getEmail());
        clienteExistente.setEndereco(clienteDTO.getEndereco());
        clienteExistente.setCidade(clienteDTO.getCidade());
        clienteExistente.setEstado(clienteDTO.getEstado());
        clienteExistente.setCep(clienteDTO.getCep());
        clienteExistente.setObservacoes(clienteDTO.getObservacoes());
        
        Cliente clienteAtualizado = clienteRepository.save(clienteExistente);
        return convertToDTO(clienteAtualizado);
    }
    
    public void excluirCliente(Long id, Long advogadoId) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        
        if (!cliente.getAdvogado().getId().equals(advogadoId)) {
            throw new RuntimeException("Cliente não pertence ao advogado informado");
        }
        
        // Verificar se o cliente possui casos ativos
        if (cliente.getCasos() != null && !cliente.getCasos().isEmpty()) {
            throw new RuntimeException("Não é possível excluir cliente que possui casos cadastrados");
        }
        
        clienteRepository.delete(cliente);
    }
    
    public List<ClienteDTO> buscarClientes(String termo, Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        List<Cliente> clientes = clienteRepository.buscarPorTermoEAdvogado(termo, advogado);
        return clientes.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public Long contarClientesPorAdvogado(Long advogadoId) {
        Usuario advogado = usuarioRepository.findById(advogadoId)
            .orElseThrow(() -> new RuntimeException("Advogado não encontrado"));
        
        return clienteRepository.contarClientesPorAdvogado(advogado);
    }
    
    private ClienteDTO convertToDTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(cliente.getId());
        dto.setNome(cliente.getNome());
        dto.setCpfCnpj(cliente.getCpfCnpj());
        dto.setTelefone(cliente.getTelefone());
        dto.setEmail(cliente.getEmail());
        dto.setEndereco(cliente.getEndereco());
        dto.setCidade(cliente.getCidade());
        dto.setEstado(cliente.getEstado());
        dto.setCep(cliente.getCep());
        dto.setDataCadastro(cliente.getDataCadastro());
        dto.setDataAtualizacao(cliente.getDataAtualizacao());
        dto.setObservacoes(cliente.getObservacoes());
        dto.setAdvogadoId(cliente.getAdvogado().getId());
        dto.setAdvogadoNome(cliente.getAdvogado().getNome());
        dto.setTotalCasos(cliente.getCasos() != null ? cliente.getCasos().size() : 0);
        return dto;
    }
    
    private Cliente convertToEntity(ClienteDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setId(dto.getId());
        cliente.setNome(dto.getNome());
        cliente.setCpfCnpj(dto.getCpfCnpj());
        cliente.setTelefone(dto.getTelefone());
        cliente.setEmail(dto.getEmail());
        cliente.setEndereco(dto.getEndereco());
        cliente.setCidade(dto.getCidade());
        cliente.setEstado(dto.getEstado());
        cliente.setCep(dto.getCep());
        cliente.setObservacoes(dto.getObservacoes());
        return cliente;
    }
}