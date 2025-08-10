# Frontend do Sistema de Controle Financeiro

## Visão Geral

Este é o frontend do Sistema de Controle Financeiro, desenvolvido com Angular para fornecer uma interface de usuário intuitiva e responsiva para gerenciar finanças pessoais.

## Estrutura do Projeto

O projeto segue a estrutura padrão do Angular:

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── cadastro/
│   │   │   └── shared/
│   │   │       └── sidebar/
│   │   ├── models/
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── assets/
│   ├── environments/
│   ├── index.html
│   └── styles.scss
├── angular.json
├── package.json
└── tsconfig.json
```

## Componentes Implementados

1. **Login**: Autenticação de usuários
2. **Cadastro**: Registro de novos usuários
3. **Dashboard**: Exibe resumo financeiro, gráficos e estatísticas
4. **Sidebar**: Menu de navegação lateral

## Serviços Implementados

1. **AuthService**: Autenticação e autorização
2. **CategoriaService**: Operações relacionadas a categorias
3. **SubcategoriaService**: Operações relacionadas a subcategorias
4. **InstituicaoService**: Operações relacionadas a instituições
5. **TransacaoService**: Operações relacionadas a transações
6. **RegistroImportacaoService**: Operações relacionadas a registros de importação
7. **ResumoFinanceiroService**: Geração de resumos financeiros

## Modelos de Dados

1. **Usuario**: Modelo para usuários
2. **Categoria**: Modelo para categorias
3. **Subcategoria**: Modelo para subcategorias
4. **Instituicao**: Modelo para instituições financeiras
5. **Transacao**: Modelo para transações
6. **RegistroImportacao**: Modelo para registros de importação
7. **ResumoFinanceiro**: Modelo para resumos financeiros

## Instalação e Execução

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Angular CLI

### Passos para Instalação

1. Instale o Node.js e o npm a partir do [site oficial](https://nodejs.org/)

2. Instale o Angular CLI globalmente:
   ```
   npm install -g @angular/cli
   ```

3. Navegue até a pasta do frontend:
   ```
   cd frontend
   ```

4. Instale as dependências do projeto:
   ```
   npm install
   ```

### Execução do Projeto

1. Inicie o servidor de desenvolvimento:
   ```
   ng serve
   ```

2. Acesse a aplicação em seu navegador:
   ```
   http://localhost:4200
   ```

## Integração com o Backend

O frontend se comunica com o backend Spring Boot através de requisições HTTP para a API REST. A URL base da API é configurada no arquivo `environment.ts` como `http://localhost:8080/api`.

## Bibliotecas Utilizadas

1. **Angular 16**: Framework principal
2. **Chart.js e ng2-charts**: Para gráficos e visualizações
3. **RxJS**: Para programação reativa

## Funcionalidades Implementadas

1. **Autenticação**: Login e registro de usuários
2. **Dashboard**: Visualização de resumo financeiro com gráficos
3. **Proteção de Rotas**: Utilizando AuthGuard para proteger rotas privadas
4. **Interceptor HTTP**: Para adicionar token de autenticação às requisições

## Próximos Passos

1. Implementar os componentes para gerenciamento de categorias
2. Implementar os componentes para gerenciamento de subcategorias
3. Implementar os componentes para gerenciamento de instituições
4. Implementar os componentes para gerenciamento de transações
5. Implementar os componentes para importação de extratos