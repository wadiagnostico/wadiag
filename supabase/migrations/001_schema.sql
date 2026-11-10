-- ============================================================
-- MAPA DOS BLOQUEIOS - Schema Completo do Banco de Dados
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de configurações da plataforma
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL DEFAULT 'Mapa dos Bloqueios',
  subtitle TEXT DEFAULT 'Diagnóstico de mentalidade, comportamento e prosperidade',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#8B7355',
  secondary_color TEXT DEFAULT '#C9A96E',
  accent_color TEXT DEFAULT '#FAF8F5',
  welcome_message TEXT DEFAULT 'Descubra quais padrões de pensamento, comportamento e escolhas podem estar impedindo você de construir a vida que deseja.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de dimensões
CREATE TABLE IF NOT EXISTS dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  order_num INT NOT NULL,
  max_score INT NOT NULL DEFAULT 32,
  audio_url TEXT,
  audio_filename TEXT,
  version INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de perguntas
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension_id UUID NOT NULL REFERENCES dimensions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  order_num INT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de perfis de resultado
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  phrase TEXT,
  guidance TEXT,
  recommendations TEXT,
  priority_dimensions JSONB DEFAULT '[]',
  combination_rules JSONB DEFAULT '{}',
  min_threshold NUMERIC DEFAULT 0,
  order_num INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de avaliações (assessments)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_name TEXT NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_dimension INT DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  questionnaire_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de respostas individuais
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value >= 0 AND value <= 4),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

-- 7. Tabela de resultados calculados
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE UNIQUE,
  dimension_scores JSONB NOT NULL DEFAULT '{}',
  overall_score NUMERIC,
  primary_profile_id UUID REFERENCES profiles(id),
  secondary_profile_ids UUID[] DEFAULT '{}',
  report_text TEXT,
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  interpretation TEXT,
  priorities TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de plano de ação de 21 dias
CREATE TABLE IF NOT EXISTS action_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dimension_id UUID REFERENCES dimensions(id) ON DELETE SET NULL,
  week INT NOT NULL CHECK (week >= 1 AND week <= 3),
  day_num INT NOT NULL CHECK (day_num >= 1 AND day_num <= 21),
  title TEXT NOT NULL,
  description TEXT,
  estimated_time TEXT,
  instruction TEXT,
  reflection_prompt TEXT,
  order_num INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Progresso do plano de ação do participante
CREATE TABLE IF NOT EXISTS action_plan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  action_plan_item_id UUID NOT NULL REFERENCES action_plan_items(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  reflection_answer TEXT,
  UNIQUE(assessment_id, action_plan_item_id)
);

-- 10. Tabela de áudios por etapa
CREATE TABLE IF NOT EXISTS stage_audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_key TEXT NOT NULL UNIQUE,
  stage_label TEXT NOT NULL,
  dimension_id UUID REFERENCES dimensions(id) ON DELETE SET NULL,
  audio_url TEXT,
  audio_filename TEXT,
  description TEXT,
  order_num INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabela de faixas de pontuação
CREATE TABLE IF NOT EXISTS score_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B7355',
  order_num INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabela de textos interpretativos por dimensão e faixa
CREATE TABLE IF NOT EXISTS dimension_interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension_id UUID NOT NULL REFERENCES dimensions(id) ON DELETE CASCADE,
  score_range_id UUID NOT NULL REFERENCES score_ranges(id) ON DELETE CASCADE,
  interpretation_text TEXT NOT NULL,
  reflection_questions TEXT,
  strengths TEXT,
  attention_points TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dimension_id, score_range_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_questions_dimension ON questions(dimension_id);
CREATE INDEX IF NOT EXISTS idx_responses_assessment ON responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_assessments_session ON assessments(session_token);
CREATE INDEX IF NOT EXISTS idx_assessments_name ON assessments(participant_name);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment ON assessment_results(assessment_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimension_interpretations ENABLE ROW LEVEL SECURITY;

-- Políticas para LEITURA PÚBLICA (dados do questionário)
CREATE POLICY "Dimensões visíveis publicamente" ON dimensions FOR SELECT USING (active = true);
CREATE POLICY "Perguntas visíveis publicamente" ON questions FOR SELECT USING (active = true);
CREATE POLICY "Perfis visíveis publicamente" ON profiles FOR SELECT USING (active = true);
CREATE POLICY "Configurações visíveis publicamente" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Áudios visíveis publicamente" ON stage_audios FOR SELECT USING (true);
CREATE POLICY "Faixas visíveis publicamente" ON score_ranges FOR SELECT USING (true);
CREATE POLICY "Interpretações visíveis publicamente" ON dimension_interpretations FOR SELECT USING (true);
CREATE POLICY "Itens do plano visíveis publicamente" ON action_plan_items FOR SELECT USING (active = true);

-- Políticas para PARTICIPANTES (via session_token - anon)
CREATE POLICY "Participante cria avaliação" ON assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Participante vê sua avaliação" ON assessments FOR SELECT USING (true);
CREATE POLICY "Participante atualiza sua avaliação" ON assessments FOR UPDATE USING (true);

CREATE POLICY "Participante insere respostas" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Participante vê suas respostas" ON responses FOR SELECT USING (true);
CREATE POLICY "Participante atualiza respostas" ON responses FOR UPDATE USING (true);

CREATE POLICY "Participante vê seu resultado" ON assessment_results FOR SELECT USING (true);
CREATE POLICY "Sistema insere resultado" ON assessment_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Sistema atualiza resultado" ON assessment_results FOR UPDATE USING (true);

CREATE POLICY "Participante vê progresso do plano" ON action_plan_progress FOR SELECT USING (true);
CREATE POLICY "Participante registra progresso" ON action_plan_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Participante atualiza progresso" ON action_plan_progress FOR UPDATE USING (true);

-- Políticas ADMIN (autenticado)
CREATE POLICY "Admin gerencia dimensões" ON dimensions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia perguntas" ON questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia perfis" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia configurações" ON platform_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia áudios" ON stage_audios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia faixas" ON score_ranges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia interpretações" ON dimension_interpretations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia avaliações" ON assessments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia respostas" ON responses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia resultados" ON assessment_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia plano" ON action_plan_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gerencia progresso" ON action_plan_progress FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS (executar separadamente se necessário)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audios', 'audios', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- ============================================================
-- DADOS INICIAIS - Configuração da Plataforma
-- ============================================================
INSERT INTO platform_settings (platform_name, subtitle, welcome_message)
VALUES (
  'Mapa dos Bloqueios',
  'Diagnóstico de mentalidade, comportamento e prosperidade',
  'Descubra quais padrões de pensamento, comportamento e escolhas podem estar impedindo você de construir a vida que deseja.'
);

-- ============================================================
-- DADOS INICIAIS - Faixas de Pontuação
-- ============================================================
INSERT INTO score_ranges (min_score, max_score, label, description, color, order_num) VALUES
(0, 24, 'Poucos sinais', 'Poucos sinais identificados nas respostas.', '#4CAF50', 1),
(25, 49, 'Sinais leves', 'Sinais leves ou ocasionais.', '#8BC34A', 2),
(50, 69, 'Merece atenção', 'Padrão presente e que merece atenção.', '#FFC107', 3),
(70, 84, 'Bastante recorrente', 'Padrão bastante recorrente.', '#FF9800', 4),
(85, 100, 'Muito recorrente', 'Padrão muito recorrente nas respostas.', '#F44336', 5);

-- ============================================================
-- DADOS INICIAIS - 7 Dimensões
-- ============================================================
INSERT INTO dimensions (name, description, order_num) VALUES
('Crenças e programação mental', 'Pensamentos repetidos e crenças que influenciam escolhas.', 1),
('Merecimento e relação com a prosperidade', 'Relação com receber, cobrar, aceitar oportunidades e prosperidade.', 2),
('Clareza e direcionamento', 'Prioridades, objetivos e direção.', 3),
('Ação e consistência', 'Execução, continuidade e hábitos.', 4),
('Procrastinação e autossabotagem', 'Adiamentos, justificativas e interrupções.', 5),
('Emocional e manifestação', 'Emoções, expectativas e relação entre intenção e ação.', 6),
('Ambiente e relacionamentos', 'Influências, apoio, limites e ambiente.', 7);

-- ============================================================
-- DADOS INICIAIS - 56 Perguntas
-- ============================================================

-- Dimensão 1: Crenças e programação mental
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 1), 'Costumo pensar que não sou capaz de conquistar algo maior do que tenho hoje.', 1),
((SELECT id FROM dimensions WHERE order_num = 1), 'Quando surge uma oportunidade, minha primeira reação costuma ser imaginar por que pode não dar certo.', 2),
((SELECT id FROM dimensions WHERE order_num = 1), 'Tenho dificuldade de acreditar que posso mudar minha realidade de forma consistente.', 3),
((SELECT id FROM dimensions WHERE order_num = 1), 'Repito pensamentos negativos sobre mim, mesmo quando existem evidências de que sou capaz.', 4),
((SELECT id FROM dimensions WHERE order_num = 1), 'Costumo associar sucesso a algo distante ou reservado para outras pessoas.', 5),
((SELECT id FROM dimensions WHERE order_num = 1), 'Tenho medo de tentar algo novo e confirmar uma crença negativa sobre mim.', 6),
((SELECT id FROM dimensions WHERE order_num = 1), 'Percebo que minhas decisões são influenciadas por ideias que aprendi no passado e nunca questionei.', 7),
((SELECT id FROM dimensions WHERE order_num = 1), 'Quando penso em crescer, aparecem pensamentos que diminuem minhas possibilidades.', 8);

-- Dimensão 2: Merecimento e relação com a prosperidade
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 2), 'Sinto desconforto quando preciso cobrar um valor justo pelo meu trabalho.', 1),
((SELECT id FROM dimensions WHERE order_num = 2), 'Tenho dificuldade de receber elogios, dinheiro ou ajuda sem sentir que preciso compensar de alguma forma.', 2),
((SELECT id FROM dimensions WHERE order_num = 2), 'Às vezes sinto que ainda não mereço viver a realidade que desejo.', 3),
((SELECT id FROM dimensions WHERE order_num = 2), 'Quando algo bom acontece, espero que logo apareça um problema para equilibrar a situação.', 4),
((SELECT id FROM dimensions WHERE order_num = 2), 'Tenho receio de desejar mais por medo de parecer ambiciosa ou ingrata.', 5),
((SELECT id FROM dimensions WHERE order_num = 2), 'Costumo diminuir minhas conquistas ou achar que foi apenas sorte.', 6),
((SELECT id FROM dimensions WHERE order_num = 2), 'Tenho dificuldade de me permitir investir em mim ou priorizar meus objetivos.', 7),
((SELECT id FROM dimensions WHERE order_num = 2), 'Quando penso em prosperar, sinto culpa, medo ou desconforto.', 8);

-- Dimensão 3: Clareza e direcionamento
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 3), 'Tenho dificuldade de definir com clareza o que quero construir nos próximos meses.', 1),
((SELECT id FROM dimensions WHERE order_num = 3), 'Mudo de objetivo com frequência antes de dar tempo para uma estratégia amadurecer.', 2),
((SELECT id FROM dimensions WHERE order_num = 3), 'Começo o dia sem saber quais são as prioridades que realmente importam.', 3),
((SELECT id FROM dimensions WHERE order_num = 3), 'Tenho muitas ideias, mas dificuldade de escolher uma direção e sustentá-la.', 4),
((SELECT id FROM dimensions WHERE order_num = 3), 'Costumo confundir estar ocupada com estar avançando.', 5),
((SELECT id FROM dimensions WHERE order_num = 3), 'Adio decisões importantes por não ter certeza de qual caminho escolher.', 6),
((SELECT id FROM dimensions WHERE order_num = 3), 'Meus objetivos ficam mais no campo da vontade do que em um plano concreto.', 7),
((SELECT id FROM dimensions WHERE order_num = 3), 'Tenho dificuldade de perceber quais ações aproximam meus resultados do que desejo.', 8);

-- Dimensão 4: Ação e consistência
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 4), 'Começo projetos com entusiasmo, mas tenho dificuldade de manter o ritmo.', 1),
((SELECT id FROM dimensions WHERE order_num = 4), 'Espero sentir motivação para fazer tarefas que já sei que são importantes.', 2),
((SELECT id FROM dimensions WHERE order_num = 4), 'Tenho dificuldade de manter hábitos mesmo quando reconheço que fazem bem para mim.', 3),
((SELECT id FROM dimensions WHERE order_num = 4), 'Deixo de executar ações importantes quando os resultados demoram a aparecer.', 4),
((SELECT id FROM dimensions WHERE order_num = 4), 'Costumo abandonar uma estratégia antes de avaliar se dei tempo suficiente para ela funcionar.', 5),
((SELECT id FROM dimensions WHERE order_num = 4), 'Tenho dificuldade de transformar planos em pequenas ações realizadas com frequência.', 6),
((SELECT id FROM dimensions WHERE order_num = 4), 'Quando minha rotina muda, perco a consistência com facilidade.', 7),
((SELECT id FROM dimensions WHERE order_num = 4), 'Se não consigo fazer tudo como planejei, acabo fazendo menos do que poderia.', 8);

-- Dimensão 5: Procrastinação e autossabotagem
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 5), 'Adio tarefas importantes mesmo sabendo que isso pode me prejudicar.', 1),
((SELECT id FROM dimensions WHERE order_num = 5), 'Encontro justificativas para não começar algo que desejo muito.', 2),
((SELECT id FROM dimensions WHERE order_num = 5), 'Quando estou perto de avançar, acabo criando outras prioridades ou distrações.', 3),
((SELECT id FROM dimensions WHERE order_num = 5), 'Espero o momento ideal para começar, mesmo sabendo que ele talvez não exista.', 4),
((SELECT id FROM dimensions WHERE order_num = 5), 'Deixo decisões importantes para depois por medo de errar.', 5),
((SELECT id FROM dimensions WHERE order_num = 5), 'Tenho dificuldade de concluir o que começo.', 6),
((SELECT id FROM dimensions WHERE order_num = 5), 'Às vezes faço escolhas que aliviam o desconforto imediato, mas me afastam dos meus objetivos.', 7),
((SELECT id FROM dimensions WHERE order_num = 5), 'Percebo que repito comportamentos que já identifiquei como pouco úteis.', 8);

-- Dimensão 6: Emocional e manifestação
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 6), 'Minha confiança muda muito de acordo com o que acontece ao meu redor.', 1),
((SELECT id FROM dimensions WHERE order_num = 6), 'Quando algo não sai como espero, tenho dificuldade de recuperar o foco.', 2),
((SELECT id FROM dimensions WHERE order_num = 6), 'Fico tão preocupada com o resultado que tenho dificuldade de aproveitar o processo.', 3),
((SELECT id FROM dimensions WHERE order_num = 6), 'Tenho dificuldade de sustentar pensamentos construtivos quando enfrento incertezas.', 4),
((SELECT id FROM dimensions WHERE order_num = 6), 'Costumo interpretar obstáculos como sinais de que não devo continuar.', 5),
((SELECT id FROM dimensions WHERE order_num = 6), 'Tenho dificuldade de reconhecer emoções sem deixar que elas decidam todas as minhas ações.', 6),
((SELECT id FROM dimensions WHERE order_num = 6), 'Às vezes espero que as coisas mudem sem ajustar atitudes práticas.', 7),
((SELECT id FROM dimensions WHERE order_num = 6), 'Tenho dificuldade de conciliar esperança, confiança e ação concreta.', 8);

-- Dimensão 7: Ambiente e relacionamentos
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 7), 'Convivo com pessoas que frequentemente desestimulam meus planos.', 1),
((SELECT id FROM dimensions WHERE order_num = 7), 'Tenho dificuldade de estabelecer limites para proteger meu tempo e energia.', 2),
((SELECT id FROM dimensions WHERE order_num = 7), 'Permito que opiniões externas influenciem decisões que são importantes para mim.', 3),
((SELECT id FROM dimensions WHERE order_num = 7), 'Meu ambiente físico ou digital costuma favorecer distrações e falta de foco.', 4),
((SELECT id FROM dimensions WHERE order_num = 7), 'Tenho dificuldade de pedir apoio quando preciso.', 5),
((SELECT id FROM dimensions WHERE order_num = 7), 'Assumo responsabilidades demais e deixo pouco espaço para meus próprios objetivos.', 6),
((SELECT id FROM dimensions WHERE order_num = 7), 'Comparo meu caminho com o de pessoas que vivem realidades diferentes da minha.', 7),
((SELECT id FROM dimensions WHERE order_num = 7), 'Percebo que alguns hábitos ou relações reforçam comportamentos que desejo mudar.', 8);

-- ============================================================
-- DADOS INICIAIS - 10 Perfis
-- ============================================================
INSERT INTO profiles (name, description, phrase, guidance, recommendations, priority_dimensions, combination_rules, order_num) VALUES
('A Sonhadora', 
 'Tem desejos e visualiza possibilidades, mas pode encontrar dificuldade em transformar intenção em ações concretas e frequentes.',
 'Suas respostas sugerem que você tem muitos desejos e visualiza possibilidades, mas pode encontrar dificuldade em transformar essas intenções em ações concretas.',
 'Considere definir um único objetivo prioritário para as próximas semanas e criar pequenos passos diários para avançar em direção a ele.',
 'Comece pequeno, mas comece. Escolha uma ação que pode fazer hoje e faça. Amanhã, repita.',
 '["Clareza e direcionamento", "Ação e consistência"]',
 '{"primary_dimensions": [3, 4], "min_score": 50}',
 1),

('A Perfeccionista',
 'Pode esperar segurança, preparo ou condições ideais antes de se permitir começar ou avançar.',
 'Suas respostas sugerem que você pode estar esperando condições ideais para agir, buscando segurança e preparo antes de se permitir avançar.',
 'Considere que a ação imperfeita é melhor que a espera perfeita. Permita-se começar antes de sentir que está totalmente pronta.',
 'Defina o "bom o suficiente" para cada tarefa. Nem tudo precisa ser impecável para gerar resultado.',
 '["Procrastinação e autossabotagem", "Ação e consistência"]',
 '{"primary_dimensions": [5, 4], "min_score": 50}',
 2),

('A Autocobradora',
 'Pode exigir muito de si, minimizar conquistas e sentir que nunca fez o suficiente.',
 'Suas respostas sugerem que você pode ser muito exigente consigo mesma, minimizando suas conquistas e sentindo que nunca fez o suficiente.',
 'Pratique reconhecer o que já realizou antes de listar o que falta. Celebre cada passo dado.',
 'Faça uma lista semanal de conquistas, por menores que sejam. Mude o foco do que falta para o que já foi feito.',
 '["Crenças e programação mental", "Emocional e manifestação"]',
 '{"primary_dimensions": [1, 6], "min_score": 50}',
 3),

('A Merecedora em Construção',
 'Pode sentir conflito ao receber, cobrar, ocupar espaços ou reconhecer o próprio valor.',
 'Suas respostas sugerem que você pode sentir conflito ao receber, cobrar ou ocupar espaços, como se ainda precisasse provar que merece.',
 'Considere que merecimento não é algo a ser conquistado — é um ponto de partida. Permita-se receber sem culpa.',
 'Observe quando surgir o pensamento "eu não mereço" e questione: quem disse isso? É verdade?',
 '["Merecimento e relação com a prosperidade", "Crenças e programação mental"]',
 '{"primary_dimensions": [2, 1], "min_score": 50}',
 4),

('A Executora sem Direção',
 'Pode fazer muitas coisas ao mesmo tempo, mas dispersar energia por falta de prioridade clara.',
 'Suas respostas sugerem que você é uma pessoa que age, mas pode estar dispersando energia por falta de uma direção clara e prioridades definidas.',
 'Antes de fazer mais, defina o que importa mais. Uma prioridade clara vale mais que dez tarefas concluídas.',
 'Toda manhã, escolha 3 prioridades. Se algo não está nessa lista, pode esperar.',
 '["Clareza e direcionamento", "Procrastinação e autossabotagem"]',
 '{"primary_dimensions": [3, 5], "min_score": 50}',
 5),

('A Desconfiada do Processo',
 'Pode perder confiança quando os resultados demoram ou quando precisa lidar com incerteza.',
 'Suas respostas sugerem que você pode perder a confiança quando os resultados demoram a aparecer ou quando precisa lidar com incerteza.',
 'Lembre-se de que resultados consistentes levam tempo. Confie no processo e foque no que pode controlar.',
 'Registre seus avanços semanalmente, mesmo os pequenos. A evidência de progresso alimenta a confiança.',
 '["Emocional e manifestação", "Ação e consistência"]',
 '{"primary_dimensions": [6, 4], "min_score": 50}',
 6),

('A Comparadora',
 'Pode medir seu progresso pela trajetória de outras pessoas e desconsiderar o próprio contexto.',
 'Suas respostas sugerem que você pode estar medindo seu progresso pela trajetória de outras pessoas, desconsiderando seu próprio contexto e caminho.',
 'Cada pessoa tem seu tempo, seus recursos e suas circunstâncias. Compare-se com quem você era ontem.',
 'Limite o tempo em redes sociais e pratique gratidão pelo que já construiu até aqui.',
 '["Ambiente e relacionamentos", "Crenças e programação mental"]',
 '{"primary_dimensions": [7, 1], "min_score": 50}',
 7),

('A Reiniciadora',
 'Pode começar com intensidade, mas ter dificuldade de sustentar hábitos e projetos.',
 'Suas respostas sugerem que você costuma começar com muita intensidade, mas pode ter dificuldade de sustentar hábitos e projetos ao longo do tempo.',
 'Comece com menos intensidade e mais consistência. Sustentabilidade vale mais que intensidade.',
 'Reduza pela metade o que planejou fazer e mantenha por 21 dias. Depois ajuste.',
 '["Ação e consistência", "Procrastinação e autossabotagem"]',
 '{"primary_dimensions": [4, 5], "min_score": 50}',
 8),

('A Sobrecarregada',
 'Pode assumir responsabilidades demais e deixar pouco espaço para seus objetivos e necessidades.',
 'Suas respostas sugerem que você pode estar sobrecarregada, assumindo responsabilidades demais e deixando pouco espaço para seus próprios objetivos.',
 'Cuidar de si não é egoísmo. Estabeleça limites e proteja tempo para o que importa para você.',
 'Pratique dizer "não" ou "agora não" pelo menos uma vez por semana. Proteja seu tempo.',
 '["Ambiente e relacionamentos", "Emocional e manifestação"]',
 '{"primary_dimensions": [7, 6], "min_score": 50}',
 9),

('A Construtora em Potencial',
 'Pode apresentar recursos e atitudes consistentes, com pontos específicos que ainda merecem atenção.',
 'Suas respostas sugerem que você possui recursos e atitudes consistentes, com pontos específicos que ainda merecem atenção para potencializar seus resultados.',
 'Você já tem uma base sólida. Foque nos pontos de atenção identificados para potencializar o que já faz bem.',
 'Identifique as 1-2 dimensões com maior pontuação e dedique atenção específica a elas.',
 '[]',
 '{"is_default": true, "max_avg_score": 49}',
 10);

-- ============================================================
-- DADOS INICIAIS - Áudios por Etapa
-- ============================================================
INSERT INTO stage_audios (stage_key, stage_label, description, order_num) VALUES
('welcome', 'Boas-vindas', 'Explicar propósito, desacelerar e incentivar sinceridade.', 1),
('instructions', 'Como responder', 'Explicar escala, autorrelato, ausência de resposta certa e importância de responder sobre o momento atual.', 2);

INSERT INTO stage_audios (stage_key, stage_label, dimension_id, description, order_num) VALUES
('dimension_1', 'Dimensão 1 — Crenças e programação mental', (SELECT id FROM dimensions WHERE order_num = 1), 'Introduzir pensamentos repetidos e crenças que influenciam escolhas.', 3),
('dimension_2', 'Dimensão 2 — Merecimento e prosperidade', (SELECT id FROM dimensions WHERE order_num = 2), 'Refletir sobre receber, cobrar, aceitar oportunidades e relação com prosperidade.', 4),
('dimension_3', 'Dimensão 3 — Clareza e direcionamento', (SELECT id FROM dimensions WHERE order_num = 3), 'Explorar prioridades, objetivos e direção.', 5),
('dimension_4', 'Dimensão 4 — Ação e consistência', (SELECT id FROM dimensions WHERE order_num = 4), 'Observar execução, continuidade e hábitos.', 6),
('dimension_5', 'Dimensão 5 — Procrastinação e autossabotagem', (SELECT id FROM dimensions WHERE order_num = 5), 'Observar adiamentos, justificativas e interrupções sem julgamento.', 7),
('dimension_6', 'Dimensão 6 — Emocional e manifestação', (SELECT id FROM dimensions WHERE order_num = 6), 'Explorar emoções, expectativas e relação entre intenção e ação.', 8),
('dimension_7', 'Dimensão 7 — Ambiente e relacionamentos', (SELECT id FROM dimensions WHERE order_num = 7), 'Refletir sobre influências, apoio, limites e ambiente.', 9),
('closing', 'Encerramento', NULL, 'Agradecer, preparar para a leitura e lembrar que resultado é ponto de partida.', 10),
('results', 'Leitura do resultado', NULL, 'Explicar como interpretar pontuações e perfis com leveza e responsabilidade.', 11);
