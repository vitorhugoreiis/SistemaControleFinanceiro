-- Inserção de usuários
INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES
('Administrador', 'admin@financeiro.com', '$2a$10$Y50UaMFOxteibQEYLrwuHeehHYfcoafCopUazP12.rqB41bsolF5.', 'ADMINISTRADOR'), -- senha: admin123
('Usuário Teste', 'usuario@teste.com', '$2a$10$Y50UaMFOxteibQEYLrwuHeehHYfcoafCopUazP12.rqB41bsolF5.', 'COMUM'); -- senha: admin123

-- Inserção de perfis
INSERT INTO perfis (nome, tipo_perfil, usuario_id) VALUES
('Pessoal', 'PF', 1),
('Pessoal', 'PF', 2);

-- Inserção de categorias de receita
INSERT INTO categorias (nome, tipo, perfil_id) VALUES
('Salário', 'Receita', 1),
('Investimentos', 'Receita', 1),
('Freelance', 'Receita', 1),
('Outros', 'Receita', 1);

-- Inserção de categorias de despesa
INSERT INTO categorias (nome, tipo, perfil_id) VALUES
('Alimentação', 'Despesa', 1),
('Moradia', 'Despesa', 1),
('Transporte', 'Despesa', 1),
('Saúde', 'Despesa', 1),
('Educação', 'Despesa', 1),
('Lazer', 'Despesa', 1),
('Vestuário', 'Despesa', 1),
('Outros', 'Despesa', 1);

-- Inserção de subcategorias de receita
INSERT INTO subcategorias (nome, categoria_id) VALUES
('Salário CLT', 1),
('Décimo Terceiro', 1),
('Férias', 1),
('Dividendos', 2),
('Juros', 2),
('Aluguel', 2),
('Desenvolvimento Web', 3),
('Design', 3),
('Consultoria', 3),
('Presentes', 4),
('Restituição de Impostos', 4);

-- Inserção de subcategorias de despesa
INSERT INTO subcategorias (nome, categoria_id) VALUES
('Supermercado', 5),
('Restaurantes', 5),
('Delivery', 5),
('Aluguel', 6),
('Condomínio', 6),
('Água', 6),
('Energia', 6),
('Internet', 6),
('Combustível', 7),
('Transporte Público', 7),
('Manutenção', 7),
('Consultas', 8),
('Medicamentos', 8),
('Plano de Saúde', 8),
('Cursos', 9),
('Livros', 9),
('Material Escolar', 9),
('Cinema', 10),
('Viagens', 10),
('Streaming', 10),
('Roupas', 11),
('Calçados', 11),
('Acessórios', 11);

-- Inserção de instituições financeiras
INSERT INTO instituicoes (nome, tipo, saldo_inicial, saldo_atual, perfil_id) VALUES
('Banco do Brasil', 'Conta Corrente', 1000.00, 1000.00, 1),
('Nubank', 'Conta Corrente', 500.00, 500.00, 1),
('Itaú', 'Conta Corrente', 1500.00, 1500.00, 1),
('Cartão Nubank', 'Cartão de Crédito', 0.00, 0.00, 1),
('Cartão Itaú', 'Cartão de Crédito', 0.00, 0.00, 1),
('XP Investimentos', 'Investimento', 5000.00, 5000.00, 1);

-- Inserção de transações para o primeiro usuário
INSERT INTO transacoes (data, descricao, valor, tipo, categoria_id, subcategoria_id, instituicao_id, usuario_id, perfil_id) VALUES
-- Receitas
(CURRENT_DATE - 15, 'Salário Mensal', 5000.00, 'Receita', 1, 1, 1, 1, 1),
(CURRENT_DATE - 10, 'Dividendos Ações', 350.00, 'Receita', 2, 4, 6, 1, 1),
(CURRENT_DATE - 5, 'Freelance Website', 1200.00, 'Receita', 3, 7, 2, 1, 1),

-- Despesas
(CURRENT_DATE - 14, 'Aluguel Apartamento', 1200.00, 'Despesa', 6, 4, 1, 1, 1),
(CURRENT_DATE - 13, 'Conta de Luz', 150.00, 'Despesa', 6, 7, 1, 1, 1),
(CURRENT_DATE - 12, 'Internet Fibra', 120.00, 'Despesa', 6, 8, 1, 1, 1),
(CURRENT_DATE - 11, 'Supermercado Mensal', 800.00, 'Despesa', 5, 1, 4, 1, 1),
(CURRENT_DATE - 9, 'Jantar Restaurante', 120.00, 'Despesa', 5, 2, 4, 1, 1),
(CURRENT_DATE - 8, 'Combustível', 200.00, 'Despesa', 7, 9, 2, 1, 1),
(CURRENT_DATE - 6, 'Medicamentos', 80.00, 'Despesa', 8, 13, 2, 1, 1),
(CURRENT_DATE - 4, 'Curso Online', 300.00, 'Despesa', 9, 15, 5, 1, 1),
(CURRENT_DATE - 3, 'Cinema', 60.00, 'Despesa', 10, 18, 4, 1, 1),
(CURRENT_DATE - 2, 'Assinatura Streaming', 40.00, 'Despesa', 10, 20, 2, 1, 1),
(CURRENT_DATE - 1, 'Roupas', 250.00, 'Despesa', 11, 21, 5, 1, 1);

-- Inserção de transações para o segundo usuário
INSERT INTO transacoes (data, descricao, valor, tipo, categoria_id, subcategoria_id, instituicao_id, usuario_id, perfil_id) VALUES
-- Receitas
(CURRENT_DATE - 15, 'Salário Mensal', 4000.00, 'Receita', 1, 1, 3, 2, 2),
(CURRENT_DATE - 8, 'Freelance Design', 800.00, 'Receita', 3, 8, 2, 2, 2),

-- Despesas
(CURRENT_DATE - 14, 'Aluguel', 900.00, 'Despesa', 6, 4, 3, 2, 2),
(CURRENT_DATE - 10, 'Supermercado', 600.00, 'Despesa', 5, 1, 4, 2, 2),
(CURRENT_DATE - 7, 'Combustível', 150.00, 'Despesa', 7, 9, 3, 2, 2),
(CURRENT_DATE - 5, 'Restaurante', 90.00, 'Despesa', 5, 2, 4, 2, 2),
(CURRENT_DATE - 3, 'Livros', 120.00, 'Despesa', 9, 16, 4, 2, 2);

-- Inserção de registros de importação
INSERT INTO registros_importacao (data_extracao, banco, periodo, nome_arquivo) VALUES
(CURRENT_DATE - 30, 'Banco do Brasil', 'Janeiro/2023', 'extrato_bb_jan_2023.csv'),
(CURRENT_DATE - 20, 'Nubank', 'Janeiro/2023', 'extrato_nubank_jan_2023.csv'),
(CURRENT_DATE - 10, 'Itaú', 'Janeiro/2023', 'extrato_itau_jan_2023.csv');