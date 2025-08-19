-- Adicionar coluna tipo_usuario na tabela usuarios
ALTER TABLE usuarios ADD COLUMN tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'COMUM';

-- Atualizar o primeiro usuário (admin@financeiro.com) para ser ADMINISTRADOR
UPDATE usuarios SET tipo_usuario = 'ADMINISTRADOR' WHERE email = 'admin@financeiro.com';