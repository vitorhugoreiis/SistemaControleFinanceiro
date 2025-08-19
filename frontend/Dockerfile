# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do npm
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação Angular
RUN npm run build --prod

# Estágio final - servidor web Nginx
FROM nginx:1.25-alpine

# Instalar dependências para health check
RUN apk add --no-cache curl

# Remover configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copiar arquivos buildados do Angular
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# Ajustar permissões
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d

# Criar diretórios necessários com permissões corretas
RUN touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Mudar para usuário não-root
USER nginx-user

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]