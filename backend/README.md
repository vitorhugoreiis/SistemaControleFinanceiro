# Backend do Sistema de Controle Financeiro

## Visão Geral

Este é o backend do Sistema de Controle Financeiro, desenvolvido com Spring Boot para fornecer uma API REST completa para gerenciamento de finanças pessoais.

## Tecnologias Utilizadas

- Java 21
- Spring Boot 3.2.3
- Spring Data JPA
- Spring Web
- Spring Validation
- Spring Security com JWT
- Lombok
- H2 Database (desenvolvimento)
- PostgreSQL (produção)
- Swagger/OpenAPI para documentação da API

## Recursos do Java 21 Implementados

- **Virtual Threads**: Implementados no servidor Tomcat para melhorar o desempenho de operações de I/O sem aumentar o consumo de recursos.
- **Records**: Utilizados para criar DTOs imutáveis de forma concisa (exemplo: `TransacaoView`).
- **Pattern Matching para switch**: Implementado para simplificar a lógica de classificação de transações.
- **Sequenced Collections**: Utilizados para manipular coleções ordenadas de forma mais intuitiva.

## Estrutura do Projeto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── controle/
│   │   │           └── financeiro/
│   │   │               ├── config/
│   │   │               ├── controller/
│   │   │               ├── dto/
│   │   │               ├── exception/
│   │   │               ├── model/
│   │   │               ├── repository/
│   │   │               ├── security/
│   │   │               ├── service/
│   │   │               └── util/
│   │   └── resources/
│   └── test/
└── pom.xml
```

## Entidades

1. **Usuario**: Modelo para usuários
2. **Categoria**: Modelo para categorias
3. **Subcategoria**: Modelo para subcategorias
4. **Instituicao**: Modelo para instituições financeiras
5. **Transacao**: Modelo para transações
6. **RegistroImportacao**: Modelo para registros de importação

## Endpoints da API

### Usuários
- `GET /api/usuarios`: Lista todos os usuários
- `GET /api/usuarios/{id}`: Busca um usuário por ID
- `POST /api/usuarios`: Cadastra um novo usuário
- `PUT /api/usuarios/{id}`: Atualiza um usuário existente
- `DELETE /api/usuarios/{id}`: Remove um usuário

### Categorias
- `GET /api/categorias`: Lista todas as categorias (com filtro por tipo)
- `GET /api/categorias/{id}`: Busca uma categoria por ID
- `POST /api/categorias`: Cria uma nova categoria
- `PUT /api/categorias/{id}`: Atualiza uma categoria existente
- `DELETE /api/categorias/{id}`: Remove uma categoria

### Subcategorias
- `GET /api/subcategorias`: Lista todas as subcategorias (com filtro por categoria)
- `GET /api/subcategorias/{id}`: Busca uma subcategoria por ID
- `POST /api/subcategorias`: Cria uma nova subcategoria
- `PUT /api/subcategorias/{id}`: Atualiza uma subcategoria existente
- `DELETE /api/subcategorias/{id}`: Remove uma subcategoria

### Instituições
- `GET /api/instituicoes`: Lista todas as instituições (com filtro por tipo)
- `GET /api/instituicoes/{id}`: Busca uma instituição por ID
- `POST /api/instituicoes`: Cria uma nova instituição
- `PUT /api/instituicoes/{id}`: Atualiza uma instituição existente
- `DELETE /api/instituicoes/{id}`: Remove uma instituição

### Transações
- `GET /api/transacoes`: Lista todas as transações (com filtros por usuário, tipo e período)
- `GET /api/transacoes/{id}`: Busca uma transação por ID
- `POST /api/transacoes`: Cria uma nova transação
- `PUT /api/transacoes/{id}`: Atualiza uma transação existente
- `DELETE /api/transacoes/{id}`: Remove uma transação

### Registros de Importação
- `GET /api/registros-importacao`: Lista todos os registros (com filtros por banco e período)
- `GET /api/registros-importacao/{id}`: Busca um registro por ID
- `POST /api/registros-importacao`: Cria um novo registro
- `PUT /api/registros-importacao/{id}`: Atualiza um registro existente
- `DELETE /api/registros-importacao/{id}`: Remove um registro

### Resumo Financeiro
- `GET /api/resumo-financeiro/usuario/{usuarioId}`: Gera um resumo financeiro por período

## Documentação da API

A documentação completa da API está disponível através do Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

## Como Executar

1. Configure o banco de dados no arquivo `application.properties`
2. Execute o projeto usando Maven:

```bash
./mvnw spring-boot:run
```

## Ambiente de Desenvolvimento

- Para desenvolvimento, o projeto utiliza o banco de dados H2 em memória
- O console do H2 está disponível em `http://localhost:8080/h2-console`
- Para produção, configure as propriedades do PostgreSQL no arquivo `application.properties`