# Guia de Execução Local - Sistema de Controle Financeiro

Este documento fornece instruções detalhadas para configurar e executar o Sistema de Controle Financeiro em seu ambiente local.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em seu sistema:

- **Java 21** (JDK)
- **Maven** (para gerenciamento de dependências do backend)
- **Node.js** (versão 16 ou superior)
- **npm** (geralmente instalado com o Node.js)
- **Angular CLI** (para o frontend)

## Configuração e Execução do Backend (Spring Boot)

### Opção 1: Usando Maven diretamente

1. Navegue até o diretório do backend:
   ```bash
   cd SistemaControleFinanceiro/backend
   ```

2. Compile e execute o projeto usando Maven:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
### Verificação do Backend

Após iniciar o backend, você pode verificar se está funcionando corretamente acessando:

- **API**: http://localhost:8080/api
- **Documentação Swagger**: http://localhost:8080/swagger-ui/index.html
- **Console H2 (banco de dados)**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:financeirodb` (conforme configurado no application.properties)
  - Usuário: `sa`
  - Senha: (deixe em branco)

## Configuração e Execução do Frontend (Angular)

1. Navegue até o diretório do frontend:
   ```bash
   cd SistemaControleFinanceiro/frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   ng serve
   ```
   ou
   ```bash
   npm start
   ```

4. Acesse o aplicativo em seu navegador:
   ```
   http://localhost:4200
   ```

## Notas Importantes

### Banco de Dados

- Por padrão, o projeto utiliza o banco de dados H2 em memória para desenvolvimento, o que significa que os dados serão perdidos quando a aplicação for reiniciada.
- Para persistência de dados, você pode configurar o PostgreSQL descomentando as configurações no arquivo `application.properties` e comentando as configurações do H2.

### Configuração do PostgreSQL (opcional)

Se desejar usar o PostgreSQL em vez do H2:

1. Instale o PostgreSQL em seu sistema
2. Crie um banco de dados chamado `financeirodb`
3. Edite o arquivo `application.properties` no diretório `backend/src/main/resources`:
   - Comente as configurações do H2
   - Descomente as configurações do PostgreSQL
   - Ajuste o usuário e senha conforme sua instalação do PostgreSQL

## Estrutura do Projeto

### Backend

- **Tecnologias**: Java 21, Spring Boot 3.2.3, Spring Data JPA, Spring Security
- **Recursos do Java 21 implementados**:
  - Virtual Threads (via `VirtualThreadConfig`)
  - Records (via `TransacaoView`)
  - Pattern Matching para switch (via `TransacaoClassificador`)
  - Sequenced Collections (via `SequencedCollectionsExemplo`)

### Frontend

- **Tecnologias**: Angular 16, TypeScript, SCSS
- **Componentes principais**: Login, Cadastro, Dashboard, Sidebar

## Solução de Problemas

### Problemas com o Maven

Se o comando `mvn` não for reconhecido:

1. **Verifique a instalação do Maven**:
   - No Windows, verifique se o Maven está no PATH do sistema
   - Você pode instalar o Maven via Chocolatey: `choco install maven`
   - Ou usar o Maven Wrapper incluído no projeto (comandos `.\mvnw.cmd`)

2. **Verifique a instalação do JDK**:
   - Certifique-se de que o JDK 21 está instalado e configurado corretamente
   - Verifique a variável de ambiente JAVA_HOME

### Problemas com o Node.js/npm

Se encontrar erros relacionados ao Node.js ou npm:

1. **Verifique as versões**:
   ```bash
   node -v
   npm -v
   ```

2. **Limpe o cache do npm**:
   ```bash
   npm cache clean --force
   ```

3. **Reinstale as dependências**:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Problemas de Porta

Se as portas 8080 (backend) ou 4200 (frontend) estiverem em uso:

1. **Para o backend**, você pode alterar a porta no `application.properties`:
   ```properties
   server.port=8081
   ```

2. **Para o frontend**, você pode iniciar com uma porta diferente:
   ```bash
   ng serve --port 4201
   ```

## Suporte

Se encontrar problemas adicionais, verifique:

1. Logs do aplicativo para mensagens de erro detalhadas
2. Documentação do Spring Boot e Angular para questões específicas da plataforma
3. Certifique-se de que todas as dependências estão instaladas corretamente