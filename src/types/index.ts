// ============================================================
// TIPOS DO SISTEMA - Mapa dos Bloqueios
// ============================================================

export interface PlatformSettings {
  id: string;
  platform_name: string;
  subtitle: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  welcome_message: string;
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  order_num: number;
  max_score: number;
  audio_url: string | null;
  audio_filename: string | null;
  version: number;
  active: boolean;
}

export interface Question {
  id: string;
  dimension_id: string;
  text: string;
  order_num: number;
  active: boolean;
  version: number;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  phrase: string;
  guidance: string;
  recommendations: string;
  priority_dimensions: string[];
  combination_rules: Record<string, any>;
  min_threshold: number;
  order_num: number;
  active: boolean;
  version: number;
}

export interface Assessment {
  id: string;
  participant_name: string;
  session_token: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_dimension: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  questionnaire_version: number;
  created_at: string;
}

export interface Response {
  id: string;
  assessment_id: string;
  question_id: string;
  value: number;
  answered_at: string;
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  dimension_scores: Record<string, DimensionScore>;
  overall_score: number;
  primary_profile_id: string | null;
  secondary_profile_ids: string[];
  report_text: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  interpretation: string | null;
  priorities: string | null;
}

export interface DimensionScore {
  dimension_id: string;
  dimension_name: string;
  raw_score: number;
  max_score: number;
  normalized_score: number;
  range_label: string;
  range_color: string;
}

export interface ScoreRange {
  id: string;
  min_score: number;
  max_score: number;
  label: string;
  description: string;
  color: string;
  order_num: number;
}

export interface StageAudio {
  id: string;
  stage_key: string;
  stage_label: string;
  dimension_id: string | null;
  audio_url: string | null;
  audio_filename: string | null;
  description: string;
  order_num: number;
}

export interface ActionPlanItem {
  id: string;
  profile_id: string | null;
  dimension_id: string | null;
  week: number;
  day_num: number;
  title: string;
  description: string;
  estimated_time: string;
  instruction: string;
  reflection_prompt: string;
  order_num: number;
  active: boolean;
}

export interface ActionPlanProgress {
  id: string;
  assessment_id: string;
  action_plan_item_id: string;
  completed: boolean;
  completed_at: string | null;
  reflection_answer: string | null;
}

export interface DimensionInterpretation {
  id: string;
  dimension_id: string;
  score_range_id: string;
  interpretation_text: string;
  reflection_questions: string;
  strengths: string;
  attention_points: string;
}

// Tipos auxiliares para o Quiz
export interface QuizState {
  assessment: Assessment | null;
  currentDimension: number;
  currentQuestion: number;
  responses: Map<string, number>;
  dimensions: Dimension[];
  questions: Question[];
  isLoading: boolean;
}

export const SCALE_OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Raramente' },
  { value: 2, label: 'Às vezes' },
  { value: 3, label: 'Frequentemente' },
  { value: 4, label: 'Quase sempre' },
] as const;
