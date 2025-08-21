# 🏗️ Planejamento da Infraestrutura Terraform - AWS

## 🎯 Objetivo
Criar uma infraestrutura completa na AWS usando Terraform para deploy econômico do Sistema de Controle Financeiro, mantendo custos abaixo de $5/mês.

---

## 📋 Requisitos Funcionais

### Aplicação
- [ ] Frontend Angular (SPA)
- [ ] Backend Spring Boot (API REST)
- [ ] Banco PostgreSQL
- [ ] Nginx como proxy reverso
- [ ] SSL/TLS automático

### Infraestrutura
- [ ] Alta disponibilidade (multi-AZ)
- [ ] Backup automático
- [ ] Monitoramento básico
- [ ] Deploy automatizado
- [ ] Rollback capability

### Segurança
- [ ] Security Groups restritivos
- [ ] IAM roles com least privilege
- [ ] Dados criptografados
- [ ] VPC isolada

---

## 🏛️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet Gateway                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      VPC (10.0.0.0/16)                     │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Public Subnet     │    │      Private Subnet         │ │
│  │   (10.0.1.0/24)    │    │     (10.0.2.0/24)          │ │
│  │                     │    │                             │ │
│  │  ┌─────────────┐    │    │   ┌─────────────────────┐   │ │
│  │  │    ALB      │    │    │   │   EC2 Spot Instance │   │ │
│  │  │ (Optional)  │────┼────┼──▶│    t4g.nano ARM     │   │ │
│  │  └─────────────┘    │    │   │                     │   │ │
│  │                     │    │   │  ┌─────────────┐    │   │ │
│  │  ┌─────────────┐    │    │   │  │   Docker    │    │   │ │
│  │  │   NAT GW    │    │    │   │  │ All-in-One  │    │   │ │
│  │  │ (Optional)  │    │    │   │  └─────────────┘    │   │ │
│  │  └─────────────┘    │    │   │                     │   │ │
│  └─────────────────────┘    │   │  ┌─────────────┐    │   │ │
│                             │   │  │  EBS gp3    │    │   │ │
│                             │   │  │   20GB      │    │   │ │
│                             │   │  └─────────────┘    │   │ │
│                             │   └─────────────────────┘   │ │
│                             └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    S3 Bucket (Backups)                     │
│                  Glacier Deep Archive                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes Terraform

### 1. **Estrutura de Diretórios**
```
terraform/
├── main.tf                 # Configuração principal
├── variables.tf            # Variáveis de entrada
├── outputs.tf              # Outputs do Terraform
├── terraform.tfvars        # Valores das variáveis
├── versions.tf             # Versões dos providers
├── data.tf                 # Data sources
├── locals.tf               # Variáveis locais
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── security/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── storage/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       └── terraform.tfvars
└── scripts/
    ├── user-data.sh
    ├── deploy.sh
    └── backup.sh
```

### 2. **Módulos Principais**

#### **VPC Module**
- VPC com CIDR 10.0.0.0/16
- 1 Public Subnet (10.0.1.0/24)
- 1 Private Subnet (10.0.2.0/24)
- Internet Gateway
- Route Tables
- NAT Gateway (opcional para economia)

#### **Security Module**
- Security Group para ALB (80, 443)
- Security Group para EC2 (22, 8080)
- Security Group para RDS (5432)
- IAM Roles e Policies
- Key Pair para SSH

#### **Compute Module**
- Launch Template para Spot Instances
- Auto Scaling Group (min: 1, max: 2)
- Application Load Balancer (opcional)
- Target Group
- User Data script

#### **Storage Module**
- EBS Volume gp3 (20GB)
- S3 Bucket para backups
- S3 Lifecycle policies
- CloudWatch Logs (opcional)

---

## 💰 Análise de Custos

### **Cenário 1: Ultra Econômico (~$3/mês)**
| Componente | Especificação | Custo/Mês |
|------------|---------------|------------|
| EC2 Spot | t4g.nano | $0.50-1.00 |
| EBS gp3 | 20GB | $1.60 |
| S3 Standard | 1GB | $0.02 |
| S3 Glacier | 10GB | $0.10 |
| Data Transfer | 1GB | $0.09 |
| **Total** | | **~$2.31-2.81** |

### **Cenário 2: Básico com ALB (~$18/mês)**
| Componente | Especificação | Custo/Mês |
|------------|---------------|------------|
| EC2 Spot | t4g.small | $2.00-4.00 |
| EBS gp3 | 20GB | $1.60 |
| ALB | 1 instância | $16.20 |
| S3 + Glacier | 11GB | $0.12 |
| **Total** | | **~$19.92-21.92** |

### **Cenário 3: Produção (~$35/mês)**
| Componente | Especificação | Custo/Mês |
|------------|---------------|------------|
| EC2 On-Demand | t4g.small | $12.41 |
| EBS gp3 | 50GB | $4.00 |
| ALB | 1 instância | $16.20 |
| NAT Gateway | 1 instância | $32.40 |
| S3 + Glacier | 50GB | $0.60 |
| **Total** | | **~$65.61** |

**Recomendação: Cenário 1 para MVP/Desenvolvimento**

---

## 🚀 Estratégia de Implementação

### **Fase 1: Base Infrastructure (1-2h)**
1. ✅ Configurar provider AWS
2. ✅ Criar módulo VPC básico
3. ✅ Configurar Security Groups
4. ✅ Testar conectividade

### **Fase 2: Compute Resources (1-2h)**
1. ✅ Criar Launch Template
2. ✅ Configurar Spot Instance
3. ✅ Implementar User Data
4. ✅ Testar deploy da aplicação

### **Fase 3: Storage & Backup (30min)**
1. ✅ Configurar EBS otimizado
2. ✅ Criar S3 bucket
3. ✅ Implementar lifecycle policies
4. ✅ Testar backup automático

### **Fase 4: Monitoring & Automation (30min)**
1. ✅ Configurar CloudWatch básico
2. ✅ Implementar health checks
3. ✅ Criar scripts de deploy
4. ✅ Documentar uso

---

## 🔧 Configurações Específicas

### **EC2 Spot Instance**
```hcl
instance_type = "t4g.nano"
architecture = "arm64"
spot_price = "0.002"  # ~50% economia
spot_type = "one-time"
interruption_behavior = "terminate"
```

### **EBS Optimization**
```hcl
volume_type = "gp3"
volume_size = 20
iops = 3000
throughput = 125
encrypted = true
delete_on_termination = false
```

### **S3 Lifecycle**
```hcl
standard_ia_days = 30
glacier_days = 90
deep_archive_days = 180
expiration_days = 2555  # 7 anos
```

---

## 🛡️ Considerações de Segurança

### **Network Security**
- VPC isolada com subnets privadas
- Security Groups com least privilege
- NACLs para camada adicional
- Sem SSH direto da internet

### **Data Security**
- EBS volumes criptografados
- S3 bucket com encryption
- Secrets no AWS Systems Manager
- Backup criptografado

### **Access Control**
- IAM roles específicas por serviço
- MFA obrigatório para admin
- CloudTrail para auditoria
- Rotation de chaves automática

---

## 📊 Monitoramento

### **Métricas Essenciais**
- CPU, Memory, Disk usage
- Application response time
- Database connections
- Spot interruption alerts

### **Alertas**
- High resource usage (>80%)
- Application down
- Spot interruption warning
- Backup failures

### **Logs**
- Application logs → CloudWatch
- System logs → CloudWatch
- Access logs → S3
- Audit logs → CloudTrail

---

## 🔄 Disaster Recovery

### **Backup Strategy**
- Database backup diário
- Application data backup semanal
- Infrastructure as Code (Terraform)
- Multi-region backup (opcional)

### **Recovery Procedures**
1. **Spot Interruption**: Auto-restart em nova AZ
2. **Data Loss**: Restore do último backup
3. **Region Failure**: Manual deploy em nova região
4. **Complete Failure**: Terraform apply + data restore

---

## 📝 Próximos Passos

### **Imediatos**
1. [ ] Validar arquitetura com stakeholders
2. [ ] Definir ambiente (dev/prod)
3. [ ] Configurar AWS CLI e credenciais
4. [ ] Criar repositório Terraform

### **Desenvolvimento**
1. [ ] Implementar módulo VPC
2. [ ] Configurar Security Groups
3. [ ] Criar Launch Template
4. [ ] Testar Spot Instance

### **Deploy**
1. [ ] Validar custos reais
2. [ ] Implementar monitoramento
3. [ ] Configurar backup
4. [ ] Documentar operação

---

## ❓ Decisões Pendentes

### **Arquitetura**
- [ ] **ALB**: Usar ou não? (+$16/mês vs simplicidade)
- [ ] **NAT Gateway**: Necessário? (+$32/mês vs segurança)
- [ ] **Multi-AZ**: Implementar desde o início?
- [ ] **RDS**: Usar ou PostgreSQL no container?

### **Custos**
- [ ] **Budget limite**: $5, $20 ou $50/mês?
- [ ] **Reserved Instances**: Considerar após 6 meses?
- [ ] **Savings Plans**: Avaliar para economia adicional?

### **Operação**
- [ ] **CI/CD**: GitHub Actions ou AWS CodePipeline?
- [ ] **Secrets**: AWS Secrets Manager ou Systems Manager?
- [ ] **DNS**: Route53 ou CloudFlare?
- [ ] **SSL**: ACM ou Let's Encrypt?

---

## 🎯 Critérios de Sucesso

### **Técnicos**
- [ ] Deploy automatizado em <10 minutos
- [ ] Uptime >99% (excluindo Spot interruptions)
- [ ] Response time <2s para 95% requests
- [ ] Backup recovery testado e funcional

### **Financeiros**
- [ ] Custo mensal <$5 para MVP
- [ ] Custo por usuário <$0.10/mês
- [ ] ROI positivo em 6 meses

### **Operacionais**
- [ ] Zero-downtime deployments
- [ ] Rollback em <5 minutos
- [ ] Monitoramento 24/7 automatizado
- [ ] Documentação completa e atualizada

---

**📅 Criado em:** $(date '+%Y-%m-%d %H:%M:%S')  
**👤 Responsável:** Equipe DevOps  
**🔄 Próxima revisão:** Após implementação da Fase 1  

---

> 💡 **Nota**: Este planejamento será atualizado conforme o progresso da implementação e feedback dos stakeholders.