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
   
   **Principais dependências do projeto:**
   - Angular 16 (framework principal)
   - Chart.js e ng2-charts (gráficos e visualizações)
   - RxJS (programação reativa)
   - Angular CDK (componentes de desenvolvimento)
   - TypeScript (linguagem de programação)

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

### Rotas Disponíveis no Frontend

Após iniciar o frontend, as seguintes rotas estarão disponíveis:

- **/** - Redireciona para o dashboard
- **/login** - Página de autenticação
- **/cadastro** - Página de registro de novos usuários
- **/dashboard** - Dashboard principal com resumo financeiro (protegida)
- **/perfil** - Gerenciamento do perfil do usuário (protegida)
- **/categorias** - Gerenciamento de categorias (protegida)
- **/subcategorias** - Gerenciamento de subcategorias (protegida)
- **/transacoes** - Gerenciamento de transações (protegida)
- **/instituicoes** - Gerenciamento de instituições financeiras (protegida)
- **/importacao** - Importação de extratos bancários (protegida)

*Nota: Rotas marcadas como "protegidas" requerem autenticação e redirecionam para /login se o usuário não estiver logado.*

### Primeiros Passos no Sistema

1. **Primeiro acesso**: Acesse `/cadastro` para criar uma conta
2. **Login**: Use `/login` para autenticar-se no sistema
3. **Dashboard**: Após o login, você será redirecionado para o dashboard principal
4. **Navegação**: Use o menu lateral (sidebar) para acessar as diferentes funcionalidades
5. **Perfil**: Acesse `/perfil` para gerenciar seus dados pessoais (nome, email, senha)
6. **Configuração inicial**: Configure categorias e instituições antes de registrar transações

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
- **Componentes principais**: 
  - Login: Autenticação de usuários
  - Cadastro: Registro de novos usuários
  - Dashboard: Resumo financeiro com gráficos e estatísticas
  - Sidebar: Menu de navegação lateral
  - Perfil: Gerenciamento de dados pessoais (nome, email, senha)
  - Categoria: Gerenciamento de categorias de transações
  - Subcategoria: Gerenciamento de subcategorias
  - Transação: Gerenciamento de transações financeiras
  - Instituição: Gerenciamento de instituições financeiras
  - Importação: Importação de extratos bancários
- **Funcionalidades implementadas**:
  - Autenticação JWT com interceptor HTTP
  - Proteção de rotas com AuthGuard
  - Visualização de dados com gráficos (Chart.js)
  - Formulários reativos com validação
  - Gerenciamento completo de entidades financeiras
  - Sistema de perfil do usuário com alteração de dados pessoais

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

4. **Problemas com ng2-charts**:
   Se encontrar erros relacionados ao ng2-charts:
   ```bash
   npm install @angular/cdk@^16.2.0 --save
   npm install
   ```

5. **Problemas de compatibilidade Angular**:
   Certifique-se de que todas as dependências Angular estão na versão 16:
   ```bash
   ng update
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