# 📋 Guia Completo de Gerenciamento de Branches no Git

## 🎯 Objetivo
Este guia ensina como criar, gerenciar e trabalhar com branches no Git de forma eficiente e organizada.

## 📚 Índice
- [Conceitos Básicos](#conceitos-básicos)
- [Criando Branches](#criando-branches)
- [Verificando Status](#verificando-status)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)
- [Fluxo de Trabalho Completo](#fluxo-de-trabalho-completo)
- [Comandos Úteis](#comandos-úteis)
- [Boas Práticas](#boas-práticas)

## 🔍 Conceitos Básicos

### O que é uma Branch?
Uma branch é uma linha independente de desenvolvimento que permite trabalhar em funcionalidades sem afetar o código principal (main/master).

### Por que usar Branches?
- ✅ **Isolamento**: Desenvolva funcionalidades sem afetar o código principal
- ✅ **Colaboração**: Múltiplos desenvolvedores podem trabalhar simultaneamente
- ✅ **Organização**: Mantenha o histórico limpo e organizado
- ✅ **Segurança**: Teste alterações antes de integrar ao código principal

## 🌿 Criando Branches

### Método 1: Criar e Mudar (Recomendado)
```bash
git checkout -b nome-da-nova-branch
```

**Exemplo:**
```bash
git checkout -b feature/sistema-relatorios
```

### Método 2: Criar Branch sem Mudar
```bash
git branch nome-da-nova-branch
git checkout nome-da-nova-branch
```

### Método 3: Usando Git Switch (Moderno)
```bash
git switch -c nome-da-nova-branch
```

## 🔍 Verificando Status

### Ver Branch Atual
```bash
git branch
```
**Saída:**
```
  feature/admin-usuarios
* main                    ← Branch atual (asterisco)
  feature/modulo-juridico
```

### Ver Todas as Branches (Local e Remoto)
```bash
git branch -a
```

### Ver Status Geral
```bash
git status
```

### Ver Últimos Commits
```bash
git log --oneline -5
```

## 📝 Convenções de Nomenclatura

### Para Funcionalidades (Features)
```bash
feature/nome-da-funcionalidade
feature/sistema-relatorios
feature/dashboard-admin
feature/autenticacao-2fa
```

### Para Correções (Fixes)
```bash
fix/correcao-bug
fix/erro-login
hotfix/falha-critica
```

### Para Melhorias (Improvements)
```bash
improvement/otimizacao-performance
refactor/reorganizar-componentes
enhancement/ui-responsiva
```

### Para Releases
```bash
release/v1.2.0
release/v2.0.0-beta
```

## 🔄 Fluxo de Trabalho Completo

### 1. Preparar Ambiente
```bash
# Ir para a branch main
git checkout main

# Atualizar com as últimas alterações
git pull origin main
```

### 2. Criar Nova Branch
```bash
# Criar branch a partir da main atualizada
git checkout -b feature/minha-nova-funcionalidade
```

### 3. Verificar Criação
```bash
# Confirmar que está na nova branch
git branch
```

### 4. Desenvolver
```bash
# Fazer suas alterações nos arquivos...
# Adicionar arquivos modificados
git add .

# Fazer commit das alterações
git commit -m "Implementa nova funcionalidade X"
```

### 5. Enviar para Repositório Remoto
```bash
# Primeira vez (criar branch remota)
git push -u origin feature/minha-nova-funcionalidade

# Próximas vezes
git push
```

### 6. Criar Pull Request
- Acesse o GitHub/GitLab
- Crie um Pull Request da sua branch para a main
- Aguarde revisão e aprovação

### 7. Após Merge
```bash
# Voltar para main
git checkout main

# Atualizar main local
git pull origin main

# Deletar branch local (opcional)
git branch -d feature/minha-nova-funcionalidade
```

## 🛠️ Comandos Úteis

### Navegação entre Branches
```bash
# Mudar para branch existente
git checkout nome-da-branch

# Ou usando switch (moderno)
git switch nome-da-branch
```

### Comparar Branches
```bash
# Ver commits que estão na feature mas não na main
git log main..feature/minha-branch --oneline

# Ver commits que estão na main mas não na feature
git log feature/minha-branch..main --oneline
```

### Verificar Sincronização
```bash
# Ver status das branches remotas
git remote show origin

# Buscar atualizações sem fazer merge
git fetch --all
```

### Deletar Branches
```bash
# Deletar branch local
git branch -d nome-da-branch

# Forçar deleção (se não foi mergeada)
git branch -D nome-da-branch

# Deletar branch remota
git push origin --delete nome-da-branch
```

## ✅ Boas Práticas

### 1. **Sempre partir da main atualizada**
```bash
git checkout main
git pull origin main
git checkout -b feature/nova-funcionalidade
```

### 2. **Use nomes descritivos**
- ❌ `git checkout -b branch1`
- ✅ `git checkout -b feature/sistema-autenticacao`

### 3. **Commits frequentes e descritivos**
```bash
git commit -m "feat: adiciona validação de email no formulário de login"
git commit -m "fix: corrige erro de validação em campos obrigatórios"
```

### 4. **Mantenha branches pequenas e focadas**
- Uma branch = Uma funcionalidade
- Evite branches que ficam abertas por muito tempo

### 5. **Sincronize regularmente**
```bash
# Buscar atualizações da main regularmente
git checkout main
git pull origin main
git checkout feature/minha-branch
git merge main  # ou git rebase main
```

### 6. **Limpe branches antigas**
```bash
# Listar branches que já foram mergeadas
git branch --merged

# Deletar branches mergeadas (exceto main)
git branch --merged | grep -v "main" | xargs -n 1 git branch -d
```

## 🚨 Comandos de Emergência

### Desfazer Mudanças Não Commitadas
```bash
# Descartar todas as mudanças
git checkout .

# Descartar mudanças de um arquivo específico
git checkout -- nome-do-arquivo.txt
```

### Voltar para Commit Anterior
```bash
# Ver histórico
git log --oneline

# Voltar para commit específico (temporário)
git checkout hash-do-commit

# Criar branch a partir de commit específico
git checkout -b fix/reverter-mudancas hash-do-commit
```

### Renomear Branch
```bash
# Renomear branch atual
git branch -m novo-nome

# Renomear branch específica
git branch -m nome-antigo novo-nome
```

## 📋 Checklist de Verificação

Antes de criar uma nova branch:
- [ ] Estou na branch main?
- [ ] A main está atualizada? (`git pull origin main`)
- [ ] O nome da branch segue as convenções?
- [ ] Não há mudanças não commitadas?

Antes de fazer merge:
- [ ] Todos os testes passam?
- [ ] O código foi revisado?
- [ ] A branch está atualizada com a main?
- [ ] Os commits têm mensagens descritivas?

---

## 📞 Comandos de Referência Rápida

```bash
# Criar nova branch
git checkout -b feature/nome

# Ver branches
git branch -a

# Mudar branch
git checkout nome-branch

# Status atual
git status

# Commits recentes
git log --oneline -5

# Comparar branches
git log main..feature/nome --oneline

# Atualizar main
git checkout main && git pull origin main

# Enviar branch
git push -u origin feature/nome
```

---

**💡 Dica:** Mantenha este guia como referência e pratique os comandos regularmente para dominar o gerenciamento de branches no Git!