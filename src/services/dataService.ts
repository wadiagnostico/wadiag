import { supabase } from '../lib/supabase';
import {
  PlatformSettings,
  Dimension,
  Question,
  Profile,
  StageAudio,
  Assessment,
  AssessmentResult,
  ActionPlanProgress,
  ActionPlanItem,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_DIMENSIONS,
  INITIAL_QUESTIONS,
  INITIAL_PROFILES,
  INITIAL_STAGE_AUDIOS,
} from '../data/initialData';

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'wa_settings',
  DIMENSIONS: 'wa_dimensions',
  QUESTIONS: 'wa_questions',
  PROFILES: 'wa_profiles',
  AUDIOS: 'wa_stage_audios',
  ASSESSMENTS: 'wa_assessments',
  RESPONSES: 'wa_responses',
  RESULTS: 'wa_results',
  PLAN_PROGRESS: 'wa_plan_progress',
  ADMIN_AUTH: 'wa_admin_authenticated',
};

// Helper: Check if Supabase is live and configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder') && !url.includes('YOUR_SUPABASE_URL'));
};

export const dataService = {
  // ==========================================
  // SETTINGS
  // ==========================================
  async getSettings(): Promise<PlatformSettings> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('platform_settings').select('*').limit(1).single();
        if (data && !error) return data as PlatformSettings;
      } catch (err) {
        console.warn('Fallback to local settings:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  },

  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('platform_settings').upsert(updated);
      } catch (err) {
        console.error('Supabase update settings error:', err);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // ==========================================
  // DIMENSIONS
  // ==========================================
  async getDimensions(): Promise<Dimension[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('dimensions')
          .select('*')
          .eq('active', true)
          .order('order_num', { ascending: true });
        if (data && !error && data.length > 0) return data as Dimension[];
      } catch (err) {
        console.warn('Fallback to local dimensions:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.DIMENSIONS);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(LOCAL_STORAGE_KEYS.DIMENSIONS, JSON.stringify(INITIAL_DIMENSIONS));
    return INITIAL_DIMENSIONS;
  },

  async saveDimensions(dimensions: Dimension[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('dimensions').upsert(dimensions);
      } catch (err) {
        console.error('Supabase save dimensions error:', err);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.DIMENSIONS, JSON.stringify(dimensions));
  },

  // ==========================================
  // QUESTIONS
  // ==========================================
  async getQuestions(): Promise<Question[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('active', true)
          .order('order_num', { ascending: true });
        if (data && !error && data.length > 0) return data as Question[];
      } catch (err) {
        console.warn('Fallback to local questions:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTIONS);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    return INITIAL_QUESTIONS;
  },

  async saveQuestions(questions: Question[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('questions').upsert(questions);
      } catch (err) {
        console.error('Supabase save questions error:', err);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  // ==========================================
  // PROFILES
  // ==========================================
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('active', true)
          .order('order_num', { ascending: true });
        if (data && !error && data.length > 0) return data as Profile[];
      } catch (err) {
        console.warn('Fallback to local profiles:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILES);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    return INITIAL_PROFILES;
  },

  async saveProfiles(profiles: Profile[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').upsert(profiles);
      } catch (err) {
        console.error('Supabase save profiles error:', err);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  },

  // ==========================================
  // STAGE AUDIOS (Audios por Etapa e Transições)
  // ==========================================
  async getStageAudios(): Promise<StageAudio[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('stage_audios')
          .select('*')
          .order('order_num', { ascending: true });
        if (data && !error && data.length > 0) return data as StageAudio[];
      } catch (err) {
        console.warn('Fallback to local stage audios:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.AUDIOS);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUDIOS, JSON.stringify(INITIAL_STAGE_AUDIOS));
    return INITIAL_STAGE_AUDIOS;
  },

  async saveStageAudios(audios: StageAudio[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('stage_audios').upsert(audios);
      } catch (err) {
        console.error('Supabase save stage audios error:', err);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUDIOS, JSON.stringify(audios));
  },

  async updateSingleAudio(stageKey: string, audioUrl: string, audioFilename: string): Promise<void> {
    const audios = await this.getStageAudios();
    const updated = audios.map((a) =>
      a.stage_key === stageKey ? { ...a, audio_url: audioUrl, audio_filename: audioFilename } : a
    );
    await this.saveStageAudios(updated);
  },

  // ==========================================
  // ASSESSMENTS & PARTICIPANTS
  // ==========================================
  async startAssessment(participantName: string): Promise<Assessment> {
    const sessionToken = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
    const newAssessment: Assessment = {
      id: 'asm_' + Math.random().toString(36).substring(2, 9),
      participant_name: participantName.trim(),
      session_token: sessionToken,
      status: 'in_progress',
      current_dimension: 1,
      started_at: new Date().toISOString(),
      completed_at: null,
      duration_seconds: null,
      questionnaire_version: 1,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .insert(newAssessment)
          .select()
          .single();
        if (data && !error) return data as Assessment;
      } catch (err) {
        console.warn('Supabase start assessment fallback:', err);
      }
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSESSMENTS);
    const assessments: Assessment[] = saved ? JSON.parse(saved) : [];
    assessments.unshift(newAssessment);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));

    return newAssessment;
  },

  async getAssessment(id: string): Promise<Assessment | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('assessments').select('*').eq('id', id).single();
        if (data && !error) return data as Assessment;
      } catch (err) {
        console.warn('Supabase get assessment fallback:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSESSMENTS);
    const assessments: Assessment[] = saved ? JSON.parse(saved) : [];
    return assessments.find((a) => a.id === id) || null;
  },

  async getAllAssessments(): Promise<Assessment[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error) return data as Assessment[];
      } catch (err) {
        console.warn('Supabase get all assessments fallback:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSESSMENTS);
    return saved ? JSON.parse(saved) : [];
  },

  async saveResponses(assessmentId: string, responsesMap: Record<string, number>): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const records = Object.entries(responsesMap).map(([questionId, value]) => ({
          assessment_id: assessmentId,
          question_id: questionId,
          value,
          answered_at: new Date().toISOString(),
        }));
        await supabase.from('responses').upsert(records, { onConflict: 'assessment_id,question_id' });
      } catch (err) {
        console.warn('Supabase save responses fallback:', err);
      }
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.RESPONSES);
    const allResponses: Record<string, Record<string, number>> = saved ? JSON.parse(saved) : {};
    allResponses[assessmentId] = { ...(allResponses[assessmentId] || {}), ...responsesMap };
    localStorage.setItem(LOCAL_STORAGE_KEYS.RESPONSES, JSON.stringify(allResponses));
  },

  async getResponses(assessmentId: string): Promise<Record<string, number>> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('responses').select('*').eq('assessment_id', assessmentId);
        if (data && !error && data.length > 0) {
          const map: Record<string, number> = {};
          data.forEach((r: any) => {
            map[r.question_id] = r.value;
          });
          return map;
        }
      } catch (err) {
        console.warn('Supabase get responses fallback:', err);
      }
    }
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.RESPONSES);
    const allResponses: Record<string, Record<string, number>> = saved ? JSON.parse(saved) : {};
    return allResponses[assessmentId] || {};
  },

  async completeAssessment(
    assessmentId: string,
    resultData: AssessmentResult,
    durationSeconds: number
  ): Promise<void> {
    const completedAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('assessments')
          .update({
            status: 'completed',
            completed_at: completedAt,
            duration_seconds: durationSeconds,
          })
          .eq('id', assessmentId);

        await supabase.from('assessment_results').upsert({
          ...resultData,
          assessment_id: assessmentId,
        });
      } catch (err) {
        console.error('Supabase complete assessment error:', err);
      }
    }

    // Local storage update
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ASSESSMENTS);
    if (saved) {
      const assessments: Assessment[] = JSON.parse(saved);
      const idx = assessments.findIndex((a) => a.id === assessmentId);
      if (idx !== -1) {
        assessments[idx].status = 'completed';
        assessments[idx].completed_at = completedAt;
        assessments[idx].duration_seconds = durationSeconds;
        localStorage.setItem(LOCAL_STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
      }
    }

    const savedResults = localStorage.getItem(LOCAL_STORAGE_KEYS.RESULTS);
    const allResults: Record<string, AssessmentResult> = savedResults ? JSON.parse(savedResults) : {};
    allResults[assessmentId] = resultData;
    localStorage.setItem(LOCAL_STORAGE_KEYS.RESULTS, JSON.stringify(allResults));
  },

  async getAssessmentResult(assessmentId: string): Promise<AssessmentResult | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('assessment_results')
          .select('*')
          .eq('assessment_id', assessmentId)
          .single();
        if (data && !error) return data as AssessmentResult;
      } catch (err) {
        console.warn('Supabase get result fallback:', err);
      }
    }
    const savedResults = localStorage.getItem(LOCAL_STORAGE_KEYS.RESULTS);
    const allResults: Record<string, AssessmentResult> = savedResults ? JSON.parse(savedResults) : {};
    return allResults[assessmentId] || null;
  },

  // ==========================================
  // ACTION PLAN PROGRESS
  // ==========================================
  async getPlanProgress(assessmentId: string): Promise<Record<number, boolean>> {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAN_PROGRESS);
    const all: Record<string, Record<number, boolean>> = saved ? JSON.parse(saved) : {};
    return all[assessmentId] || {};
  },

  async togglePlanDay(assessmentId: string, dayNum: number, completed: boolean): Promise<void> {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAN_PROGRESS);
    const all: Record<string, Record<number, boolean>> = saved ? JSON.parse(saved) : {};
    if (!all[assessmentId]) all[assessmentId] = {};
    all[assessmentId][dayNum] = completed;
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLAN_PROGRESS, JSON.stringify(all));
  },

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  isAdminAuthenticated(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminAuthenticated(auth: boolean): void {
    if (auth) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH);
    }
  },
};
