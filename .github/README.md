# 🚀 CI/CD Pipeline - Sistema de Controle Financeiro

Este diretório contém os workflows de CI/CD configurados para automatizar testes, builds e deploys do sistema.

## 📋 Workflows Disponíveis

### 1. `ci-cd.yml` - Pipeline Principal
**Trigger:** Push para `main` ou `develop`, Pull Requests

**Funcionalidades:**
- ✅ Testes automatizados (Backend + Frontend)
- 🏗️ Build das aplicações
- 🔍 Análise de qualidade de código (SonarQube)
- 🚀 Deploy automático para produção (branch `main`)

**Jobs:**
- `backend`: Testes e build do Spring Boot
- `frontend`: Testes, linting e build do Angular
- `code-quality`: Análise com SonarQube
- `deploy`: Deploy automático

### 2. `pr-validation.yml` - Validação de Pull Requests
**Trigger:** Abertura/atualização de PRs para `main` ou `develop`

**Funcionalidades:**
- 🧪 Validação completa do código
- 🔒 Análise de segurança com Trivy
- 💬 Comentários automáticos no PR com resultados
- 📊 Relatórios de cobertura de testes

### 3. `deploy.yml` - Deploy Avançado
**Trigger:** Push para branches específicas ou manual

**Funcionalidades:**
- 🐳 Build de imagens Docker
- 🌍 Deploy para múltiplos ambientes (staging/production)
- 🔄 Rollback automático em caso de falha
- 🏥 Health checks pós-deploy

## 🛠️ Configuração Necessária

### Secrets do GitHub
Configure os seguintes secrets no repositório:

```bash
# Para SonarQube (opcional)
SONAR_TOKEN=seu_token_sonarqube

# Para deploy (configure conforme sua infraestrutura)
HOST=seu_servidor
USERNAME=usuario_deploy
KEY=chave_ssh_privada

# Para notificações (opcional)
SLACK_WEBHOOK_URL=webhook_slack
DISCORD_WEBHOOK_URL=webhook_discord

# JWT Secret para produção
JWT_SECRET=sua_chave_jwt_super_segura
```

### Variáveis de Ambiente
```bash
# Configurações do banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=controle_financeiro
DB_USER=financeiro
DB_PASSWORD=senha_segura

# Configurações da aplicação
SPRING_PROFILES_ACTIVE=production
ANGULAR_ENV=production
```

## 🔧 Estrutura dos Ambientes

### 🧪 Staging
- **Branch:** `develop`
- **URL:** https://staging.seudominio.com
- **Banco:** MySQL (staging)
- **Deploy:** Automático após push

### 🚀 Production
- **Branch:** `main`
- **URL:** https://seudominio.com
- **Banco:** MySQL (production)
- **Deploy:** Automático após push (com aprovação manual opcional)

## 📊 Monitoramento e Logs

### Health Checks
- **Backend:** `GET /actuator/health`
- **Frontend:** `GET /health`
- **Database:** Ping MySQL

### Logs Disponíveis
- Build logs no GitHub Actions
- Application logs via Docker
- Nginx access/error logs
- MySQL slow query logs

## 🐳 Docker

### Imagens Criadas
- `ghcr.io/usuario/sistema-controle-financeiro-backend:latest`
- `ghcr.io/usuario/sistema-controle-financeiro-frontend:latest`

### Executar Localmente
```bash
# Desenvolvimento
docker-compose up -d

# Produção
docker-compose --profile production up -d

# Apenas banco de dados
docker-compose up -d mysql redis
```

## 🔒 Segurança

### Análises Automáticas
- **Trivy:** Vulnerabilidades em dependências
- **CodeQL:** Análise estática de código
- **Dependabot:** Atualizações automáticas de dependências

### Boas Práticas Implementadas
- Imagens Docker não-root
- Secrets não expostos em logs
- HTTPS obrigatório em produção
- Headers de segurança configurados

## 🚨 Troubleshooting

### Falhas Comuns

**Build falha no backend:**
```bash
# Verificar logs do Maven
mvn clean test -X

# Verificar conexão com banco
mysql -h localhost -u root -p
```

**Build falha no frontend:**
```bash
# Limpar cache do npm
npm ci --cache /tmp/empty-cache

# Verificar linting
npm run lint -- --fix
```

**Deploy falha:**
```bash
# Verificar health checks
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:80/health

# Verificar logs dos containers
docker logs controle-financeiro-backend
docker logs controle-financeiro-frontend
```

## 📈 Métricas e Performance

### Tempos Esperados
- **Testes Backend:** ~2-3 minutos
- **Testes Frontend:** ~1-2 minutos
- **Build Completo:** ~5-7 minutos
- **Deploy:** ~3-5 minutos

### Otimizações Implementadas
- Cache de dependências Maven/npm
- Multi-stage Docker builds
- Paralelização de jobs
- Reutilização de artefatos

## 🤝 Contribuindo

### Workflow de Desenvolvimento
1. Criar branch feature: `git checkout -b feature/nova-funcionalidade`
2. Fazer alterações e commits
3. Push da branch: `git push origin feature/nova-funcionalidade`
4. Abrir Pull Request
5. Aguardar validações automáticas
6. Review e merge

### Convenções
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`)
- **Branches:** `feature/`, `bugfix/`, `hotfix/`
- **Tags:** Semantic Versioning (`v1.0.0`)

---

📝 **Nota:** Este pipeline está configurado para GitHub Actions. Para outros provedores (GitLab CI, Jenkins, etc.), adapte os arquivos conforme necessário.