# Guia de Segurança - Sistema de Controle Financeiro

## ⚠️ Vulnerabilidades Identificadas na Configuração Atual

### 1. **CRÍTICO: Endpoints Públicos Desnecessários**
- **Problema**: `/api/categorias/**` está aberto publicamente
- **Risco**: Qualquer pessoa pode acessar, modificar ou deletar categorias
- **Solução**: Endpoint agora protegido em produção, público apenas em desenvolvimento

### 2. **CRÍTICO: Console H2 Exposto**
- **Problema**: Console H2 acessível em produção (`/h2-console`)
- **Risco**: Acesso direto ao banco de dados
- **Solução**: Console desabilitado em produção

### 3. **ALTO: JWT Secret Fraco**
- **Problema**: Chave JWT hardcoded e previsível
- **Risco**: Tokens podem ser forjados
- **Solução**: Usar variáveis de ambiente com chaves fortes

### 4. **ALTO: Swagger Exposto em Produção**
- **Problema**: Documentação da API acessível publicamente
- **Risco**: Exposição da estrutura da API para atacantes
- **Solução**: Swagger desabilitado em produção

### 5. **MÉDIO: Headers de Segurança Ausentes**
- **Problema**: Falta de proteções XSS, clickjacking, etc.
- **Risco**: Ataques de injeção e clickjacking
- **Solução**: Headers de segurança implementados

### 6. **MÉDIO: CORS Muito Permissivo**
- **Problema**: CORS não configurado adequadamente
- **Risco**: Ataques CSRF de domínios maliciosos
- **Solução**: CORS restritivo em produção

## 🛡️ Medidas de Proteção Implementadas

### 1. **Configuração Baseada em Ambiente**
```java
@Value("${app.environment:development}")
private String environment;
```
- Comportamento diferente entre desenvolvimento e produção
- Endpoints sensíveis bloqueados em produção

### 2. **Headers de Segurança**
- **X-Frame-Options**: Proteção contra clickjacking
- **X-Content-Type-Options**: Proteção contra MIME sniffing
- **Referrer-Policy**: Controle de informações de referrer
- **HSTS**: Força uso de HTTPS em produção

### 3. **CORS Configurado**
- Desenvolvimento: Permite localhost
- Produção: Apenas domínios específicos
- Cache de preflight para performance

### 4. **BCrypt Fortalecido**
- Força aumentada de 10 para 12
- Maior resistência a ataques de força bruta

### 5. **Configuração de Produção Separada**
- Arquivo `application-production.properties`
- Variáveis de ambiente para dados sensíveis
- Logging e debugging desabilitados

## 🚀 Como Usar em Produção

### 1. **Configurar Variáveis de Ambiente**
```bash
# JWT Secret (gere com: openssl rand -base64 64)
export JWT_SECRET="sua_chave_super_secreta_aqui"

# Banco de dados
export DATABASE_URL="jdbc:postgresql://seu-servidor:5432/financeirodb"
export DATABASE_USERNAME="seu_usuario"
export DATABASE_PASSWORD="sua_senha"

# Porta (opcional)
export PORT="8080"
```

### 2. **Executar com Perfil de Produção**
```bash
java -jar -Dspring.profiles.active=production seu-app.jar
```

### 3. **Configurar CORS para Seus Domínios**
Edite o método `corsConfigurationSource()` em `SecurityConfig.java`:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "https://seudominio.com",
    "https://www.seudominio.com"
));
```

## 🔒 Recomendações Adicionais de Segurança

### 1. **HTTPS Obrigatório**
- Configure SSL/TLS em produção
- Use certificados válidos (Let's Encrypt)
- Redirecione HTTP para HTTPS

### 2. **Rate Limiting**
```java
// Implementar limitação de requisições
@RateLimiter(name = "api", fallbackMethod = "rateLimitFallback")
```

### 3. **Validação de Entrada**
- Sempre validar dados de entrada
- Usar `@Valid` e `@Validated`
- Sanitizar dados antes de processar

### 4. **Logging de Segurança**
- Log tentativas de login falhadas
- Monitor acessos suspeitos
- Alertas para atividades anômalas

### 5. **Backup e Recuperação**
- Backups regulares do banco
- Plano de recuperação de desastres
- Testes de restauração

### 6. **Monitoramento**
- Use ferramentas como Prometheus + Grafana
- Monitore métricas de segurança
- Alertas automáticos

### 7. **Atualizações de Segurança**
- Mantenha dependências atualizadas
- Use ferramentas como OWASP Dependency Check
- Monitore CVEs relacionadas

## 🧪 Testes de Segurança

### 1. **Testes Automatizados**
```java
@Test
void shouldBlockUnauthorizedAccess() {
    // Teste que endpoints protegidos retornam 401/403
}

@Test
void shouldValidateJWTTokens() {
    // Teste validação de tokens JWT
}
```

### 2. **Ferramentas Recomendadas**
- **OWASP ZAP**: Scanner de vulnerabilidades
- **SonarQube**: Análise de código
- **Snyk**: Verificação de dependências

## 📋 Checklist de Segurança

- [ ] JWT secret configurado via variável de ambiente
- [ ] Console H2 desabilitado em produção
- [ ] Swagger desabilitado em produção
- [ ] CORS configurado para domínios específicos
- [ ] HTTPS configurado
- [ ] Headers de segurança implementados
- [ ] Rate limiting implementado
- [ ] Logging de segurança configurado
- [ ] Backups automatizados
- [ ] Monitoramento ativo
- [ ] Testes de segurança executados
- [ ] Dependências atualizadas

## 🆘 Em Caso de Incidente

1. **Isole o sistema** afetado
2. **Documente** o incidente
3. **Analise** logs e evidências
4. **Corrija** a vulnerabilidade
5. **Monitore** atividades suspeitas
6. **Comunique** stakeholders relevantes

---

**⚠️ IMPORTANTE**: Esta configuração fornece uma base sólida de segurança, mas a segurança é um processo contínuo. Sempre mantenha-se atualizado com as melhores práticas e realize auditorias regulares.