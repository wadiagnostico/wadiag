-- ============================================================
-- PARTE 1: CRIAÇÃO DAS TABELAS, ÍNDICES E SEGURANÇA (RLS)
-- ============================================================

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

CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value >= 0 AND value <= 4),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

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

CREATE TABLE IF NOT EXISTS action_plan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  action_plan_item_id UUID NOT NULL REFERENCES action_plan_items(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  reflection_answer TEXT,
  UNIQUE(assessment_id, action_plan_item_id)
);

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_questions_dimension ON questions(dimension_id);
CREATE INDEX IF NOT EXISTS idx_responses_assessment ON responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_assessments_session ON assessments(session_token);
CREATE INDEX IF NOT EXISTS idx_assessments_name ON assessments(participant_name);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment ON assessment_results(assessment_id);

-- RLS
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

-- Políticas Públicas
DROP POLICY IF EXISTS "Dimensões visíveis publicamente" ON dimensions;
CREATE POLICY "Dimensões visíveis publicamente" ON dimensions FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Perguntas visíveis publicamente" ON questions;
CREATE POLICY "Perguntas visíveis publicamente" ON questions FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Perfis visíveis publicamente" ON profiles;
CREATE POLICY "Perfis visíveis publicamente" ON profiles FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Configurações visíveis publicamente" ON platform_settings;
CREATE POLICY "Configurações visíveis publicamente" ON platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Áudios visíveis publicamente" ON stage_audios;
CREATE POLICY "Áudios visíveis publicamente" ON stage_audios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Faixas visíveis publicamente" ON score_ranges;
CREATE POLICY "Faixas visíveis publicamente" ON score_ranges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Interpretações visíveis publicamente" ON dimension_interpretations;
CREATE POLICY "Interpretações visíveis publicamente" ON dimension_interpretations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Itens do plano visíveis publicamente" ON action_plan_items;
CREATE POLICY "Itens do plano visíveis publicamente" ON action_plan_items FOR SELECT USING (active = true);

-- Políticas de Participante
DROP POLICY IF EXISTS "Participante cria avaliação" ON assessments;
CREATE POLICY "Participante cria avaliação" ON assessments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Participante vê sua avaliação" ON assessments;
CREATE POLICY "Participante vê sua avaliação" ON assessments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participante atualiza sua avaliação" ON assessments;
CREATE POLICY "Participante atualiza sua avaliação" ON assessments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Participante insere respostas" ON responses;
CREATE POLICY "Participante insere respostas" ON responses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Participante vê suas respostas" ON responses;
CREATE POLICY "Participante vê suas respostas" ON responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participante atualiza respostas" ON responses;
CREATE POLICY "Participante atualiza respostas" ON responses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Participante vê seu resultado" ON assessment_results;
CREATE POLICY "Participante vê seu resultado" ON assessment_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sistema insere resultado" ON assessment_results;
CREATE POLICY "Sistema insere resultado" ON assessment_results FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Sistema atualiza resultado" ON assessment_results;
CREATE POLICY "Sistema atualiza resultado" ON assessment_results FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Participante vê progresso do plano" ON action_plan_progress;
CREATE POLICY "Participante vê progresso do plano" ON action_plan_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participante registra progresso" ON action_plan_progress;
CREATE POLICY "Participante registra progresso" ON action_plan_progress FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Participante atualiza progresso" ON action_plan_progress;
CREATE POLICY "Participante atualiza progresso" ON action_plan_progress FOR UPDATE USING (true);

-- Políticas de Admin
DROP POLICY IF EXISTS "Admin gerencia dimensões" ON dimensions;
CREATE POLICY "Admin gerencia dimensões" ON dimensions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia perguntas" ON questions;
CREATE POLICY "Admin gerencia perguntas" ON questions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia perfis" ON profiles;
CREATE POLICY "Admin gerencia perfis" ON profiles FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia configurações" ON platform_settings;
CREATE POLICY "Admin gerencia configurações" ON platform_settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia áudios" ON stage_audios;
CREATE POLICY "Admin gerencia áudios" ON stage_audios FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia faixas" ON score_ranges;
CREATE POLICY "Admin gerencia faixas" ON score_ranges FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia interpretações" ON dimension_interpretations;
CREATE POLICY "Admin gerencia interpretações" ON dimension_interpretations FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia avaliações" ON assessments;
CREATE POLICY "Admin gerencia avaliações" ON assessments FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia respostas" ON responses;
CREATE POLICY "Admin gerencia respostas" ON responses FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia resultados" ON assessment_results;
CREATE POLICY "Admin gerencia resultados" ON assessment_results FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia plano" ON action_plan_items;
CREATE POLICY "Admin gerencia plano" ON action_plan_items FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin gerencia progresso" ON action_plan_progress;
CREATE POLICY "Admin gerencia progresso" ON action_plan_progress FOR ALL USING (auth.role() = 'authenticated');
