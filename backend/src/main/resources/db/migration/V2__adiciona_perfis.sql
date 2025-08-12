-- Criação da tabela de perfis
CREATE TABLE perfis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_perfil VARCHAR(50) NOT NULL,
    usuario_id BIGINT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Adicionar coluna perfil_id nas tabelas existentes
ALTER TABLE categorias ADD COLUMN perfil_id BIGINT;
ALTER TABLE categorias ADD CONSTRAINT fk_categoria_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id);

ALTER TABLE instituicoes ADD COLUMN perfil_id BIGINT;
ALTER TABLE instituicoes ADD CONSTRAINT fk_instituicao_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id);

ALTER TABLE transacoes ADD COLUMN perfil_id BIGINT;
ALTER TABLE transacoes ADD CONSTRAINT fk_transacao_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id);

-- Adicionar colunas para transferências entre perfis
ALTER TABLE transacoes ADD COLUMN transferencia_entre_perfis BOOLEAN DEFAULT FALSE;
ALTER TABLE transacoes ADD COLUMN perfil_destino_id BIGINT;
ALTER TABLE transacoes ADD CONSTRAINT fk_transacao_perfil_destino FOREIGN KEY (perfil_destino_id) REFERENCES perfis(id);

ALTER TABLE transacoes ADD COLUMN transacao_relacionada_id BIGINT;
ALTER TABLE transacoes ADD CONSTRAINT fk_transacao_relacionada FOREIGN KEY (transacao_relacionada_id) REFERENCES transacoes(id);

-- Criar perfil padrão para cada usuário existente
INSERT INTO perfis (nome, tipo_perfil, usuario_id)
SELECT 'Pessoal', 'PF', id FROM usuarios;

-- Atualizar registros existentes para associar ao perfil padrão
UPDATE categorias c
JOIN perfis p ON p.usuario_id = (
    SELECT usuario_id FROM transacoes t WHERE t.categoria_id = c.id LIMIT 1
)
SET c.perfil_id = p.id;

UPDATE instituicoes i
JOIN perfis p ON p.usuario_id = (
    SELECT usuario_id FROM transacoes t WHERE t.instituicao_id = i.id LIMIT 1
)
SET i.perfil_id = p.id;

UPDATE transacoes t
JOIN perfis p ON p.usuario_id = t.usuario_id
SET t.perfil_id = p.id;

-- Tornar as colunas perfil_id NOT NULL após a migração
ALTER TABLE categorias MODIFY COLUMN perfil_id BIGINT NOT NULL;
ALTER TABLE instituicoes MODIFY COLUMN perfil_id BIGINT NOT NULL;
ALTER TABLE transacoes MODIFY COLUMN perfil_id BIGINT NOT NULL;