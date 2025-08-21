# 🚀 Deploy Econômico na AWS - Guia Completo

## 💰 Objetivo: Sistema Completo por ~$3/mês

### 📋 Resumo da Estratégia
- **Instância:** t4g.nano Spot (ARM Graviton)
- **Armazenamento:** EBS gp3 15GB
- **Backup:** S3 Glacier Deep Archive
- **DNS/CDN:** CloudFlare (gratuito)
- **Custo Total:** $2.50-3.00/mês

---

## 🏗️ Arquitetura Final

```
┌─────────────────────────────────────┐
│         CloudFlare (FREE)           │
│      DNS + CDN + SSL + DDoS         │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│      EC2 t4g.nano Spot Instance     │
│         ($0.50-1.00/mês)            │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │   Docker    │  │  EBS gp3    │  │
│  │ All-in-One  │──│   15GB      │  │
│  │ Container   │  │  $1.20/mês  │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  Frontend + Backend + PostgreSQL    │
└─────────────────────────────────────┘
              │
┌─────────────▼───────────────────────┐
│         S3 Glacier Deep             │
│       Backup ($0.30/mês)            │
└─────────────────────────────────────┘
```

---

## 📝 Pré-requisitos

### 1. Conta AWS
- [ ] Conta AWS ativa
- [ ] AWS CLI configurado
- [ ] Chave SSH criada

### 2. Domínio (Opcional)
- [ ] Domínio registrado
- [ ] Conta CloudFlare
- [ ] DNS apontado para CloudFlare

### 3. Ferramentas Locais
- [ ] Docker Desktop
- [ ] Git
- [ ] Editor de código

---

## 🔧 Fase 1: Preparação dos Containers (1-2 horas)

### 1.1 Criar Dockerfile All-in-One

**Arquivo:** `Dockerfile.production`

```dockerfile
# Multi-stage build para ARM64
FROM --platform=linux/arm64 node:18-alpine AS frontend-builder

# Build do Frontend Angular
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build -- --configuration=production

# Build do Backend Java
FROM --platform=linux/arm64 maven:3.9-openjdk-17-slim AS backend-builder

WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Imagem final - All-in-One
FROM --platform=linux/arm64 alpine:3.18

# Instalar dependências
RUN apk add --no-cache \
    openjdk17-jre \
    nginx \
    postgresql \
    postgresql-contrib \
    supervisor \
    bash \
    curl

# Configurar PostgreSQL
RUN mkdir -p /run/postgresql && \
    chown postgres:postgres /run/postgresql && \
    su postgres -c 'initdb -D /var/lib/postgresql/data'

# Copiar aplicações
COPY --from=backend-builder /app/backend/target/*.jar /app/backend.jar
COPY --from=frontend-builder /app/frontend/dist/controle-financeiro/ /var/www/html/

# Configurar Nginx
COPY nginx-production.conf /etc/nginx/nginx.conf

# Configurar Supervisor
COPY supervisord.conf /etc/supervisord.conf

# Script de inicialização
COPY start-production.sh /start.sh
RUN chmod +x /start.sh

# Configurar usuário não-root
RUN addgroup -g 1001 appuser && \
    adduser -D -s /bin/bash -u 1001 -G appuser appuser

# Ajustar permissões
RUN chown -R appuser:appuser /app /var/www/html
RUN chown -R postgres:postgres /var/lib/postgresql

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

CMD ["/start.sh"]
```

### 1.2 Configurar Nginx Otimizado

**Arquivo:** `nginx-production.conf`

```nginx
user appuser;
worker_processes 1;
worker_rlimit_nofile 1024;

events {
    worker_connections 512;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Otimizações
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    keepalive_requests 100;
    
    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Cache
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    server {
        listen 80;
        server_name _;
        root /var/www/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Frontend (SPA)
        location / {
            try_files $uri $uri/ /index.html;
            expires 1h;
        }
        
        # Static assets cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # API Backend
        location /api/ {
            proxy_pass http://127.0.0.1:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 10s;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 1.3 Configurar Supervisor

**Arquivo:** `supervisord.conf`

```ini
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisord.log
pidfile=/var/run/supervisord.pid

[program:postgresql]
command=su postgres -c 'postgres -D /var/lib/postgresql/data'
autorestart=true
user=root
stdout_logfile=/var/log/postgresql.log
stderr_logfile=/var/log/postgresql.log

[program:backend]
command=java -Xmx200m -Xms100m -XX:+UseG1GC -jar /app/backend.jar
autorestart=true
user=appuser
stdout_logfile=/var/log/backend.log
stderr_logfile=/var/log/backend.log
environment=SPRING_PROFILES_ACTIVE=prod,DATABASE_URL=jdbc:postgresql://localhost:5432/controle_financeiro

[program:nginx]
command=nginx -g 'daemon off;'
autorestart=true
user=root
stdout_logfile=/var/log/nginx.log
stderr_logfile=/var/log/nginx.log
```

### 1.4 Script de Inicialização

**Arquivo:** `start-production.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Iniciando Sistema de Controle Financeiro..."

# Configurar PostgreSQL se necessário
if [ ! -f /var/lib/postgresql/data/postgresql.conf ]; then
    echo "📊 Configurando PostgreSQL..."
    su postgres -c 'initdb -D /var/lib/postgresql/data'
    
    # Configurações otimizadas para t4g.nano
    cat >> /var/lib/postgresql/data/postgresql.conf << EOF
# Otimizações para t4g.nano (512MB RAM)
shared_buffers = 32MB
effective_cache_size = 256MB
work_mem = 2MB
maintenance_work_mem = 16MB
max_connections = 20
wal_buffers = 1MB
checkpoint_completion_target = 0.9
random_page_cost = 1.1
EOF

    # Iniciar PostgreSQL temporariamente
    su postgres -c 'pg_ctl -D /var/lib/postgresql/data start'
    sleep 3
    
    # Criar banco e usuário
    su postgres -c "createdb controle_financeiro"
    su postgres -c "psql -c \"CREATE USER admin WITH PASSWORD 'senha_segura';\""
    su postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE controle_financeiro TO admin;\""
    
    # Parar PostgreSQL
    su postgres -c 'pg_ctl -D /var/lib/postgresql/data stop'
    sleep 2
fi

echo "✅ Configuração concluída. Iniciando serviços..."

# Iniciar Supervisor
exec /usr/bin/supervisord -c /etc/supervisord.conf
```

### 1.5 Docker Compose para Produção

**Arquivo:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
      platforms:
        - linux/arm64
    ports:
      - "80:80"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - app_logs:/var/log
      - backups:/backups
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JAVA_OPTS=-Xmx200m -Xms100m -XX:+UseG1GC
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 400M
          cpus: '0.5'
        reservations:
          memory: 200M
          cpus: '0.25'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  postgres_data:
    driver: local
  app_logs:
    driver: local
  backups:
    driver: local
```

---

## 🚀 Fase 2: Deploy na AWS (30 minutos)

### 2.1 Configurar Security Group

```bash
# Criar Security Group
aws ec2 create-security-group \
    --group-name controle-financeiro-sg \
    --description "Security group para Controle Financeiro"

# Permitir HTTP (80)
aws ec2 authorize-security-group-ingress \
    --group-name controle-financeiro-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Permitir SSH (22)
aws ec2 authorize-security-group-ingress \
    --group-name controle-financeiro-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0
```

### 2.2 Script de User Data

**Arquivo:** `user-data.sh`

```bash
#!/bin/bash
yum update -y

# Instalar Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-aarch64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Git
yum install -y git

# Clonar repositório
cd /home/ec2-user
git clone https://github.com/seu-usuario/SistemaControleFinanceiro.git
cd SistemaControleFinanceiro

# Build e deploy
docker-compose -f docker-compose.prod.yml up -d

# Configurar backup automático
echo "0 2 * * * /home/ec2-user/SistemaControleFinanceiro/backup.sh" | crontab -
```

### 2.3 Criar Spot Request

**Arquivo:** `create-spot-instance.sh`

```bash
#!/bin/bash

# Configurações
KEY_NAME="sua-chave-ssh"
SECURITY_GROUP="controle-financeiro-sg"
SUBNET_ID="subnet-xxxxxxxxx"  # Substitua pelo seu subnet
USER_DATA=$(base64 -w 0 user-data.sh)

# Criar Spot Request
SPOT_REQUEST_ID=$(aws ec2 request-spot-instances \
    --spot-price "0.002" \
    --instance-count 1 \
    --type "one-time" \
    --launch-specification "{
        \"ImageId\": \"ami-0c02fb55956c7d316\",
        \"InstanceType\": \"t4g.nano\",
        \"KeyName\": \"$KEY_NAME\",
        \"SecurityGroups\": [\"$SECURITY_GROUP\"],
        \"SubnetId\": \"$SUBNET_ID\",
        \"UserData\": \"$USER_DATA\"
    }" \
    --query 'SpotInstanceRequests[0].SpotInstanceRequestId' \
    --output text)

echo "Spot Request ID: $SPOT_REQUEST_ID"

# Aguardar instância
echo "Aguardando instância ser criada..."
aws ec2 wait spot-instance-request-fulfilled --spot-instance-request-ids $SPOT_REQUEST_ID

# Obter Instance ID
INSTANCE_ID=$(aws ec2 describe-spot-instance-requests \
    --spot-instance-request-ids $SPOT_REQUEST_ID \
    --query 'SpotInstanceRequests[0].InstanceId' \
    --output text)

echo "Instance ID: $INSTANCE_ID"

# Aguardar instância estar rodando
echo "Aguardando instância inicializar..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Obter IP público
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "✅ Instância criada com sucesso!"
echo "IP Público: $PUBLIC_IP"
echo "Acesse: http://$PUBLIC_IP"
echo "SSH: ssh -i $KEY_NAME.pem ec2-user@$PUBLIC_IP"
```

---

## 📦 Fase 3: Configurar Backup Automático (15 minutos)

### 3.1 Script de Backup

**Arquivo:** `backup.sh`

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups"
S3_BUCKET="seu-bucket-backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.tar.gz"

echo "🔄 Iniciando backup - $DATE"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
docker exec $(docker ps -q) su postgres -c "pg_dump -U admin controle_financeiro" > $BACKUP_DIR/database_$DATE.sql

# Backup dos logs
docker cp $(docker ps -q):/var/log $BACKUP_DIR/logs_$DATE

# Compactar backup
tar -czf $BACKUP_DIR/$BACKUP_FILE -C $BACKUP_DIR database_$DATE.sql logs_$DATE

# Upload para S3 Glacier Deep Archive
aws s3 cp $BACKUP_DIR/$BACKUP_FILE s3://$S3_BUCKET/backups/ --storage-class DEEP_ARCHIVE

# Limpar backups locais antigos (manter apenas 3)
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +4 | xargs -r rm

# Limpar arquivos temporários
rm -f $BACKUP_DIR/database_$DATE.sql
rm -rf $BACKUP_DIR/logs_$DATE

echo "✅ Backup concluído: $BACKUP_FILE"
echo "📊 Tamanho: $(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"
```

### 3.2 Configurar S3 Bucket

```bash
# Criar bucket S3
aws s3 mb s3://seu-bucket-backup-controle-financeiro

# Configurar lifecycle para economia
cat > lifecycle.json << EOF
{
    "Rules": [
        {
            "ID": "BackupLifecycle",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "backups/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                },
                {
                    "Days": 90,
                    "StorageClass": "DEEP_ARCHIVE"
                }
            ],
            "Expiration": {
                "Days": 2555  // 7 anos
            }
        }
    ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
    --bucket seu-bucket-backup-controle-financeiro \
    --lifecycle-configuration file://lifecycle.json
```

---

## 🌐 Fase 4: Configurar CloudFlare (Opcional - 10 minutos)

### 4.1 Configurar DNS Dinâmico

**Arquivo:** `update-dns.sh`

```bash
#!/bin/bash

# Configurações CloudFlare
ZONE_ID="sua-zone-id"
RECORD_ID="seu-record-id"
CF_TOKEN="seu-token"
DOMAIN="app.seudominio.com"

# Obter IP atual da instância
CURRENT_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Atualizar DNS
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"type\": \"A\",
        \"name\": \"app\",
        \"content\": \"$CURRENT_IP\",
        \"ttl\": 300
    }"

echo "✅ DNS atualizado: $DOMAIN -> $CURRENT_IP"
```

---

## 📊 Fase 5: Monitoramento e Manutenção

### 5.1 Script de Monitoramento

**Arquivo:** `monitor.sh`

```bash
#!/bin/bash

# Configurações
LOG_FILE="/var/log/monitor.log"
ALERT_EMAIL="seu-email@exemplo.com"
MAX_MEMORY_PERCENT=85
MAX_DISK_PERCENT=80

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Verificar saúde da aplicação
if ! curl -f -s http://localhost/health > /dev/null; then
    log "❌ ERRO: Aplicação não responde"
    log "🔄 Reiniciando containers..."
    docker-compose -f /home/ec2-user/SistemaControleFinanceiro/docker-compose.prod.yml restart
    sleep 30
    
    if curl -f -s http://localhost/health > /dev/null; then
        log "✅ Aplicação restaurada"
    else
        log "🚨 CRÍTICO: Falha ao restaurar aplicação"
        # Enviar alerta (configurar SES ou SNS)
    fi
fi

# Verificar uso de memória
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", ($3/$2) * 100}')
if [ $MEM_USAGE -gt $MAX_MEMORY_PERCENT ]; then
    log "⚠️ AVISO: Uso de memória alto: ${MEM_USAGE}%"
fi

# Verificar uso de disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt $MAX_DISK_PERCENT ]; then
    log "⚠️ AVISO: Uso de disco alto: ${DISK_USAGE}%"
    # Limpar logs antigos
    find /var/log -name "*.log" -mtime +7 -delete
fi

# Verificar se é instância Spot
if curl -s http://169.254.169.254/latest/meta-data/spot/instance-action | grep -q action; then
    log "🚨 SPOT INTERRUPTION: Criando backup de emergência"
    /home/ec2-user/SistemaControleFinanceiro/backup.sh
fi

log "✅ Monitoramento concluído - Mem: ${MEM_USAGE}% | Disk: ${DISK_USAGE}%"
```

### 5.2 Configurar Cron Jobs

```bash
# Adicionar ao crontab
crontab -e

# Adicionar estas linhas:
# Backup diário às 2h
0 2 * * * /home/ec2-user/SistemaControleFinanceiro/backup.sh

# Monitoramento a cada 5 minutos
*/5 * * * * /home/ec2-user/SistemaControleFinanceiro/monitor.sh

# Atualizar DNS a cada hora (se usando CloudFlare)
0 * * * * /home/ec2-user/SistemaControleFinanceiro/update-dns.sh

# Limpeza de logs semanalmente
0 3 * * 0 find /var/log -name "*.log" -mtime +7 -delete
```

---

## 💰 Resumo de Custos

| Componente | Custo Mensal | Anual |
|------------|--------------|-------|
| **t4g.nano Spot** | $0.50-1.00 | $6-12 |
| **EBS gp3 15GB** | $1.20 | $14.40 |
| **S3 Backup** | $0.30 | $3.60 |
| **Data Transfer** | $0.50 | $6.00 |
| **CloudFlare** | $0.00 | $0.00 |
| **Total** | **$2.50-3.00** | **$30-36** |

---

## ✅ Checklist de Deploy

### Preparação
- [ ] Dockerfiles criados e testados
- [ ] Scripts de configuração prontos
- [ ] Chave SSH configurada na AWS
- [ ] Security Group criado
- [ ] S3 Bucket para backup criado

### Deploy
- [ ] Spot Instance criada
- [ ] Aplicação deployada
- [ ] Health check funcionando
- [ ] Backup automático configurado
- [ ] Monitoramento ativo

### Pós-Deploy
- [ ] DNS configurado (se aplicável)
- [ ] SSL configurado (CloudFlare)
- [ ] Testes de carga básicos
- [ ] Documentação atualizada

---

## 🚨 Troubleshooting

### Problemas Comuns

1. **Container não inicia**
   ```bash
   docker logs $(docker ps -aq)
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **Banco de dados não conecta**
   ```bash
   docker exec -it $(docker ps -q) su postgres -c "psql -l"
   ```

3. **Spot Instance terminada**
   ```bash
   # Re-executar script de criação
   ./create-spot-instance.sh
   ```

4. **Falta de memória**
   ```bash
   # Verificar uso
   free -h
   docker stats
   
   # Otimizar JVM
   export JAVA_OPTS="-Xmx150m -Xms100m"
   ```

### Comandos Úteis

```bash
# Status geral
docker ps
docker stats
df -h
free -h

# Logs
docker logs $(docker ps -q)
tail -f /var/log/monitor.log

# Backup manual
./backup.sh

# Restart completo
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Próximos Passos

1. **Otimizações Futuras**
   - Implementar cache Redis (quando necessário)
   - Configurar CDN para assets estáticos
   - Implementar auto-scaling (quando crescer)

2. **Monitoramento Avançado**
   - CloudWatch Logs
   - Alertas SNS
   - Dashboard personalizado

3. **Segurança**
   - WAF CloudFlare
   - Certificados SSL automáticos
   - Backup encryption

---

**🎉 Parabéns! Seu sistema está rodando por menos de $3/mês na AWS!**

*Última atualização: $(date '+%Y-%m-%d')*