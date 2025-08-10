# Sistema de Controle Financeiro

Um sistema web completo para controle financeiro pessoal desenvolvido com Spring Boot (backend) e Angular (frontend).

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

1. **Backend**: API REST desenvolvida com Spring Boot
2. **Frontend**: Interface de usuário desenvolvida com Angular

```
SistemaControleFinanceiro/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── controle/
│   │   │   │           └── financeiro/
│   │   │   │               ├── config/
│   │   │   │               ├── controller/
│   │   │   │               ├── dto/
│   │   │   │               ├── exception/
│   │   │   │               ├── model/
│   │   │   │               ├── repository/
│   │   │   │               ├── security/
│   │   │   │               ├── service/
│   │   │   │               └── util/
│   │   │   └── resources/
│   │   └── test/
│   ├── target/
│   ├── pom.xml
│   └── README.md
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   ├── models/
    │   │   ├── services/
    │   │   ├── guards/
    │   │   ├── interceptors/
    │   │   └── pipes/
    │   ├── assets/
    │   ├── environments/
    │   ├── index.html
    │   └── styles.scss
    ├── angular.json
    ├── package.json
    └── README.md
```

## Tecnologias Utilizadas

### Backend
- Java 17
- Spring Boot 3.1.0
- Spring Data JPA
- Spring Web
- Spring Validation
- Spring Security com JWT
- Lombok
- H2 Database (desenvolvimento)
- PostgreSQL (produção)
- Swagger/OpenAPI para documentação da API

### Frontend
- Angular 16
- TypeScript
- RxJS
- Chart.js para gráficos
- SCSS para estilos
- Angular CLI

## Funcionalidades

- Autenticação e autorização de usuários
- Dashboard com resumo financeiro e gráficos
- Gerenciamento de categorias e subcategorias de receitas e despesas
- Gerenciamento de instituições financeiras
- Registro de transações financeiras (receitas e despesas)
- Importação de extratos bancários
- Geração de resumos financeiros por período

## Como Executar

### Backend

1. Navegue até a pasta do backend: `cd backend`
2. Configure o banco de dados no arquivo `application.properties`
3. Execute o projeto usando Maven: `./mvnw spring-boot:run`
4. A API estará disponível em: `http://localhost:8080`
5. A documentação da API estará disponível em: `http://localhost:8080/swagger-ui.html`

### Frontend

1. Navegue até a pasta do frontend: `cd frontend`
2. Instale as dependências: `npm install`
3. Execute o servidor de desenvolvimento: `ng serve`
4. Acesse a aplicação em: `http://localhost:4200`

## Próximos Passos

1. Implementação de relatórios financeiros
2. Exportação de dados em diferentes formatos
3. Notificações e lembretes
4. Planejamento financeiro e metas
5. Versão mobile com React Native

## Documentação Detalhada

Para mais detalhes sobre cada parte do projeto, consulte os READMEs específicos:

- [Documentação do Backend](backend/README.md)
- [Documentação do Frontend](frontend/README.md)