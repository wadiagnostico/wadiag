import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Compass,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { AudioPlayer } from '../../components/audio/AudioPlayer';
import {
  Assessment,
  AssessmentResult,
  Dimension,
  Profile,
  StageAudio,
  ActionPlanItem,
  PlatformSettings,
} from '../../types';
import { generateAssessmentPDF } from '../../lib/pdfGenerator';
import { generate21DayPlan } from '../../lib/scoring';

export const Results: React.FC = () => {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stageAudios, setStageAudios] = useState<StageAudio[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const [primaryProfile, setPrimaryProfile] = useState<Profile | null>(null);
  const [secondaryProfiles, setSecondaryProfiles] = useState<Profile[]>([]);

  const [actionPlan, setActionPlan] = useState<ActionPlanItem[]>([]);
  const [planProgress, setPlanProgress] = useState<Record<number, boolean>>({});
  const [activeWeekTab, setActiveWeekTab] = useState<number>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      if (!assessmentId) {
        navigate('/');
        return;
      }

      try {
        const [asm, res, dims, profs, audios, sett, progress] = await Promise.all([
          dataService.getAssessment(assessmentId),
          dataService.getAssessmentResult(assessmentId),
          dataService.getDimensions(),
          dataService.getProfiles(),
          dataService.getStageAudios(),
          dataService.getSettings(),
          dataService.getPlanProgress(assessmentId),
        ]);

        if (!asm || !res) {
          navigate('/');
          return;
        }

        setAssessment(asm);
        setResult(res);
        setDimensions(dims.sort((a, b) => a.order_num - b.order_num));
        setProfiles(profs);
        setStageAudios(audios);
        setSettings(sett);
        setPlanProgress(progress);

        // Find primary and secondary profiles
        const prim = profs.find((p) => p.id === res.primary_profile_id) || profs[0];
        setPrimaryProfile(prim);

        const secIds = res.secondary_profile_ids || [];
        const sec = profs.filter((p) => secIds.includes(p.id));
        setSecondaryProfiles(sec);

        // Generate 21-day plan
        const topDimScore = Object.values(res.dimension_scores).sort(
          (a, b) => b.normalized_score - a.normalized_score
        )[0];
        const plan = generate21DayPlan(prim, topDimScore);
        setActionPlan(plan);
      } catch (err) {
        console.error('Erro ao carregar resultado:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, [assessmentId, navigate]);

  const handleToggleDay = async (dayNum: number) => {
    if (!assessmentId) return;
    const current = !planProgress[dayNum];
    const updated = { ...planProgress, [dayNum]: current };
    setPlanProgress(updated);
    await dataService.togglePlanDay(assessmentId, dayNum, current);
  };

  const handleDownloadPDF = async () => {
    if (!assessment || !result || !primaryProfile) return;
    setIsGeneratingPdf(true);
    try {
      await generateAssessmentPDF({
        assessment,
        result,
        dimensions,
        primaryProfile,
        secondaryProfiles,
        platformName: settings?.platform_name || 'Mapa dos Bloqueios',
      });
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading || !assessment || !result || !primaryProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-[#8B7355] font-semibold text-lg">Preparando seu relatório...</p>
        </div>
      </div>
    );
  }

  const resultAudio = stageAudios.find((a) => a.stage_key === 'results');
  const weekTasks = actionPlan.filter((item) => item.week === activeWeekTab);
  const completedCount = Object.values(planProgress).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5]">
      <Navbar settings={settings || undefined} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-10 animate-fade-in">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#F0E6D6] border border-[#D4C5A9] px-4 py-1.5 rounded-full text-xs font-semibold text-[#8B7355]">
            <Sparkles className="w-4 h-4 text-[#C9A96E]" />
            <span>Diagnóstico Concluído com Sucesso</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#3D2E1F] tracking-tight">
            Mapa de {assessment.participant_name}
          </h1>

          <p className="text-sm sm:text-base text-[#8B7355] font-serif italic max-w-xl mx-auto">
            Este relatório reflete seus padrões de pensamento, comportamento e escolhas no momento atual.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm disabled:opacity-50 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Gerando Relatório...' : 'Baixar Relatório em PDF'}</span>
            </button>

            <Link
              to="/?novo=true"
              onClick={() => {
                localStorage.removeItem('wa_current_assessment_id');
              }}
              className="px-4 py-3 rounded-xl border border-[#D4C5A9] text-[#6B5B4D] hover:bg-white text-sm font-medium transition flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Fazer Nova Avaliação</span>
            </Link>
          </div>
        </div>

        {/* Áudio Oficial da Leitura do Resultado */}
        <div className="max-w-2xl mx-auto">
          <AudioPlayer
            title="Áudio: Leitura e Interpretação do Resultado"
            subtitle="Larissa Maykot explica como acolher suas pontuações e aplicar as orientações"
            audioUrl={resultAudio?.audio_url}
          />
        </div>

        {/* ======================================================== */}
        {/* PERFIL PREDOMINANTE (CARD 3D FLUTUANTE EM OURO E LUXO)   */}
        {/* ======================================================== */}
        <div className="relative group">
          {/* Luz Neon Dourada Flutuante no Fundo */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#C9A96E]/50 via-[#E8D5A3]/75 to-[#C9A96E]/50 rounded-[2.5rem] blur-2xl opacity-75 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-700 pointer-events-none" />

          {/* Card 3D com acabamento dourado e relevo elegante */}
          <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#F3E7D3] border-2 border-[#C9A96E] rounded-[2.2rem] p-7 sm:p-11 shadow-[inset_0_3px_6px_rgba(255,255,255,1),0_20px_45px_-10px_rgba(92,74,50,0.25),0_0_35px_rgba(201,169,110,0.35)] transform group-hover:-translate-y-1 group-hover:shadow-[inset_0_3px_8px_rgba(255,255,255,1),0_28px_55px_-10px_rgba(92,74,50,0.32),0_0_50px_rgba(201,169,110,0.55)] transition-all duration-500 overflow-hidden">
            {/* Ornamento dourado sutil no canto superior */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#C9A96E]/25 via-[#E8D5A3]/15 to-transparent rounded-bl-full pointer-events-none" />

            <div className="space-y-7 relative z-10">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A96E] to-[#9E7E3F] text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md shadow-[#C9A96E]/40">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Perfil Predominante</span>
                </span>

                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#2E2013] tracking-tight leading-tight">
                  {primaryProfile.name}
                </h2>
              </div>

              {/* Frase em destaque estilizada */}
              <div className="bg-gradient-to-r from-white/95 to-[#FAF5EC]/95 border border-[#D4C5A9]/80 border-l-4 border-l-[#C9A96E] p-6 sm:p-7 rounded-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,1),0_4px_12px_rgba(139,115,85,0.08)]">
                <p className="text-sm sm:text-base text-[#4A3725] leading-relaxed italic font-serif">
                  “{primaryProfile.phrase || primaryProfile.description}”
                </p>
              </div>

              {/* Blocos de Ação e Diretriz 3D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <div className="bg-white/90 border border-[#D4C5A9]/80 rounded-2xl p-6 shadow-[inset_0_1px_2px_rgba(255,255,255,1),0_6px_16px_rgba(139,115,85,0.08)] hover:border-[#C9A96E] transition-all space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#EAE0D0] border border-[#D4C5A9] flex items-center justify-center text-[#8B7355] shadow-sm">
                      <Compass className="w-4 h-4 text-[#8B7355]" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#3D2E1F]">
                      Diretriz Central
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B5B4D] leading-relaxed font-normal">
                    {primaryProfile.guidance}
                  </p>
                </div>

                <div className="bg-white/90 border border-[#D4C5A9]/80 rounded-2xl p-6 shadow-[inset_0_1px_2px_rgba(255,255,255,1),0_6px_16px_rgba(139,115,85,0.08)] hover:border-[#C9A96E] transition-all space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#EAE0D0] border border-[#D4C5A9] flex items-center justify-center text-[#8B7355] shadow-sm">
                      <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#3D2E1F]">
                      Ação Recomendada
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B5B4D] leading-relaxed font-normal">
                    {primaryProfile.recommendations}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PERFIS SECUNDÁRIOS                                       */}
        {/* ======================================================== */}
        {secondaryProfiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#3D2E1F] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#8B7355]" />
              Perfis Secundários Observados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryProfiles.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-white border border-[#D4C5A9] rounded-2xl p-5 shadow-sm space-y-2"
                >
                  <span className="text-[11px] font-bold text-[#8B7355] bg-[#F0E6D6] px-2.5 py-0.5 rounded-full inline-block">
                    Padrão Secundário
                  </span>
                  <h4 className="font-serif font-bold text-lg text-[#3D2E1F]">
                    {sec.name}
                  </h4>
                  <p className="text-xs text-[#6B5B4D] leading-relaxed">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PONTUAÇÃO NAS 7 DIMENSÕES                                */}
        {/* ======================================================== */}
        <div className="bg-white border border-[#D4C5A9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4C5A9]/50 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3D2E1F]">
                Análise das Sete Dimensões
              </h3>
              <p className="text-xs text-[#6B5B4D]">
                Pontuação normalizada de 0 a 100% calculada com base nas suas respostas.
              </p>
            </div>
            <div className="text-xs text-[#8B7355] font-semibold bg-[#FAF8F5] border border-[#D4C5A9] px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Média Geral: {result.overall_score}%
            </div>
          </div>

          <div className="space-y-5">
            {dimensions.map((dim) => {
              const scoreObj = result.dimension_scores[dim.id];
              const score = scoreObj ? scoreObj.normalized_score : 0;
              const rangeLabel = scoreObj ? scoreObj.range_label : 'Poucos sinais';

              // Visual indicator color
              let barColor = 'bg-emerald-500';
              let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              if (score >= 70) {
                barColor = 'bg-red-500';
                badgeColor = 'bg-red-50 text-red-800 border-red-200';
              } else if (score >= 50) {
                barColor = 'bg-amber-500';
                badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
              } else if (score >= 25) {
                barColor = 'bg-lime-500';
                badgeColor = 'bg-lime-50 text-lime-800 border-lime-200';
              }

              return (
                <div key={dim.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-[#3D2E1F]">
                      {dim.order_num}. {dim.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {rangeLabel}
                      </span>
                      <span className="font-bold text-[#3D2E1F] w-12 text-right">
                        {score}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-[#FAF8F5] border border-[#D4C5A9]/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda de faixas */}
          <div className="pt-4 border-t border-[#D4C5A9]/40 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#6B5B4D]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 0-24% Poucos sinais
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500" /> 25-49% Sinais leves
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 50-69% Merece atenção
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 70-100% Padrão recorrente
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PLANO DE AÇÃO DE 21 DIAS                                 */}
        {/* ======================================================== */}
        <div className="bg-white border border-[#D4C5A9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4C5A9]/50 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8B7355]" />
                <h3 className="font-serif text-xl font-bold text-[#3D2E1F]">
                  Plano Individual de Ação — 21 Dias
                </h3>
              </div>
              <p className="text-xs text-[#6B5B4D] mt-0.5">
                Microações práticas divididas em três semanas para transformar percepção em atitudes reais.
              </p>
            </div>

            <div className="text-xs font-semibold text-[#8B7355] bg-[#F0E6D6] px-3 py-1.5 rounded-xl border border-[#D4C5A9]">
              {completedCount} de 21 concluídos
            </div>
          </div>

          {/* Abas das 3 semanas */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, label: 'Semana 1', subtitle: 'Consciência (Dias 1-7)' },
              { num: 2, label: 'Semana 2', subtitle: 'Ajuste (Dias 8-14)' },
              { num: 3, label: 'Semana 3', subtitle: 'Consistência (Dias 15-21)' },
            ].map((tab) => (
              <button
                key={tab.num}
                type="button"
                onClick={() => setActiveWeekTab(tab.num)}
                className={`p-3 rounded-2xl border text-center transition ${
                  activeWeekTab === tab.num
                    ? 'bg-[#8B7355] border-[#8B7355] text-white shadow-sm'
                    : 'bg-[#FAF8F5] border-[#D4C5A9] text-[#6B5B4D] hover:bg-[#F0E6D6]/50'
                }`}
              >
                <div className="font-serif font-bold text-xs sm:text-sm">{tab.label}</div>
                <div className="text-[10px] opacity-80 hidden sm:block">{tab.subtitle}</div>
              </button>
            ))}
          </div>

          {/* Lista de Atividades da Semana Selecionada */}
          <div className="space-y-3 pt-2">
            {weekTasks.map((task) => {
              const isDone = Boolean(planProgress[task.day_num]);
              return (
                <div
                  key={task.day_num}
                  className={`p-4 rounded-2xl border transition ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-[#FAF8F5] border-[#D4C5A9]/70 hover:border-[#8B7355]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(task.day_num)}
                        className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center transition ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-[#D4C5A9] bg-white hover:border-[#8B7355]'
                        }`}
                      >
                        {isDone && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#8B7355]">
                            Dia {task.day_num}: {task.title}
                          </span>
                          <span className="text-[10px] text-[#9B8B7D] bg-white border border-[#D4C5A9]/50 px-2 py-0.5 rounded-full">
                            {task.estimated_time}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5B4D] leading-relaxed">
                          {task.instruction}
                        </p>
                        {task.reflection_prompt && (
                          <p className="text-[11px] text-[#8B7355] italic pt-1">
                            Reflexão: {task.reflection_prompt}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé da Página de Resultados com Botão de Baixar PDF */}
        <div className="bg-[#F0E6D6] border border-[#D4C5A9] rounded-3xl p-8 text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#3D2E1F]">
            Guarde seu Relatório Editorial
          </h3>
          <p className="text-xs sm:text-sm text-[#6B5B4D] max-w-lg mx-auto">
            O documento completo em PDF inclui a capa personalizada com seu nome, gráficos de todas as dimensões, interpretação profunda do seu perfil e o plano de 21 dias diagramado com elegância.
          </p>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-3.5 px-8 rounded-2xl shadow-md hover:shadow-lg transition inline-flex items-center gap-2 text-base disabled:opacity-50 active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>{isGeneratingPdf ? 'Gerando Relatório Editorial...' : 'Baixar Meu Relatório em PDF'}</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
