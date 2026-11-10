import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Volume2,
  Check,
  Compass,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { AudioPlayer } from '../../components/audio/AudioPlayer';
import { CompactAudioPlayer } from '../../components/audio/CompactAudioPlayer';
import { Navbar } from '../../components/ui/Navbar';
import {
  Assessment,
  Dimension,
  Question,
  StageAudio,
  SCALE_OPTIONS,
  PlatformSettings,
} from '../../types';
import { calculateDimensionScores, determineProfiles, generate21DayPlan } from '../../lib/scoring';

type StepMode =
  | 'WELCOME_INTRO'
  | 'DIMENSION_INTRO'
  | 'QUESTIONS'
  | 'DIMENSION_TRANSITION'
  | 'CLOSING'
  | 'PROCESSING';

export const Quiz: React.FC = () => {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stageAudios, setStageAudios] = useState<StageAudio[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0); // 0 to 6
  const [currentQuestionIndexInDim, setCurrentQuestionIndexInDim] = useState(0); // 0 to 7
  const [responses, setResponses] = useState<Record<string, number>>({});

  const [stepMode, setStepMode] = useState<StepMode>('WELCOME_INTRO');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      if (!assessmentId) {
        navigate('/');
        return;
      }

      try {
        const [asm, dims, qst, audios, sett, savedResponses] = await Promise.all([
          dataService.getAssessment(assessmentId),
          dataService.getDimensions(),
          dataService.getQuestions(),
          dataService.getStageAudios(),
          dataService.getSettings(),
          dataService.getResponses(assessmentId),
        ]);

        if (!asm) {
          navigate('/');
          return;
        }

        setAssessment(asm);
        setDimensions(dims.sort((a, b) => a.order_num - b.order_num));
        setQuestions(qst.sort((a, b) => a.order_num - b.order_num));
        setStageAudios(audios);
        setSettings(sett);
        setResponses(savedResponses);

        // Resume if already started
        const answeredCount = Object.keys(savedResponses).length;
        if (answeredCount > 0 && answeredCount < 56) {
          setStepMode('QUESTIONS');
          // Find first unanswered question
          const firstUnansweredIndex = qst.findIndex((q) => typeof savedResponses[q.id] !== 'number');
          if (firstUnansweredIndex !== -1) {
            const dimId = qst[firstUnansweredIndex].dimension_id;
            const dIdx = dims.findIndex((d) => d.id === dimId);
            if (dIdx !== -1) {
              setCurrentDimensionIndex(dIdx);
              const dimQuestions = qst.filter((q) => q.dimension_id === dimId);
              const qIdx = dimQuestions.findIndex((q) => q.id === qst[firstUnansweredIndex].id);
              setCurrentQuestionIndexInDim(qIdx !== -1 ? qIdx : 0);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do diagnóstico:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [assessmentId, navigate]);

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-[#8B7355] font-semibold text-xl">Carregando seu diagnóstico...</p>
        </div>
      </div>
    );
  }

  const currentDim = dimensions[currentDimensionIndex] || dimensions[0];
  const questionsInCurrentDim = questions.filter((q) => q.dimension_id === currentDim?.id);
  const currentQuestion = questionsInCurrentDim[currentQuestionIndexInDim];

  const totalAnswered = Object.keys(responses).length;
  const progressPercent = Math.min(100, Math.round((totalAnswered / (questions.length || 56)) * 100));

  const getAudio = (stageKey: string) => {
    return stageAudios.find((a) => a.stage_key === stageKey);
  };

  const handleSelectOption = (value: number) => {
    if (!currentQuestion || !assessmentId) return;

    const newResponses = { ...responses, [currentQuestion.id]: value };
    setResponses(newResponses);
    dataService.saveResponses(assessmentId, { [currentQuestion.id]: value });

    setTimeout(() => {
      handleNextQuestion(newResponses);
    }, 280);
  };

  const handleNextQuestion = (currentResp = responses) => {
    if (currentQuestionIndexInDim < questionsInCurrentDim.length - 1) {
      setCurrentQuestionIndexInDim((prev) => prev + 1);
    } else {
      const allInDimAnswered = questionsInCurrentDim.every((q) => typeof currentResp[q.id] === 'number');
      if (allInDimAnswered) {
        setStepMode('DIMENSION_TRANSITION');
      } else {
        setErrorMsg('Por favor, responda a todas as perguntas desta etapa para continuar.');
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndexInDim > 0) {
      setCurrentQuestionIndexInDim((prev) => prev - 1);
    } else {
      setStepMode('DIMENSION_INTRO');
    }
  };

  const handleNextDimension = () => {
    if (currentDimensionIndex < dimensions.length - 1) {
      setCurrentDimensionIndex((prev) => prev + 1);
      setCurrentQuestionIndexInDim(0);
      setStepMode('DIMENSION_INTRO');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStepMode('CLOSING');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalize = async () => {
    if (!assessmentId) return;
    setStepMode('PROCESSING');

    try {
      const profiles = await dataService.getProfiles();
      const dimensionScores = calculateDimensionScores(dimensions, questions, responses);
      const { primaryProfile, secondaryProfiles } = determineProfiles(dimensionScores, profiles, dimensions);

      const dimScoreValues = Object.values(dimensionScores);
      const overallScore =
        dimScoreValues.length > 0
          ? Math.round(dimScoreValues.reduce((a, b) => a + b.normalized_score, 0) / dimScoreValues.length)
          : 0;

      const durationSeconds = Math.round(
        (new Date().getTime() - new Date(assessment.started_at).getTime()) / 1000
      );

      const resultData = {
        id: 'res_' + assessmentId,
        assessment_id: assessmentId,
        dimension_scores: dimensionScores,
        overall_score: overallScore,
        primary_profile_id: primaryProfile.id,
        secondary_profile_ids: secondaryProfiles.map((p) => p.id),
        report_text: primaryProfile.guidance,
        pdf_url: null,
        pdf_generated_at: null,
        interpretation: primaryProfile.phrase,
        priorities: primaryProfile.recommendations,
      };

      await dataService.completeAssessment(assessmentId, resultData, durationSeconds);
      navigate(`/resultado/${assessmentId}`);
    } catch (err) {
      console.error('Erro ao processar diagnóstico:', err);
      setStepMode('CLOSING');
      setErrorMsg('Ocorreu um erro ao processar seus resultados. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5]">
      <Navbar
        settings={settings || undefined}
        progressPercent={progressPercent}
        currentStepLabel={
          stepMode === 'QUESTIONS'
            ? `Dimensão ${currentDimensionIndex + 1}/7 • Pergunta ${currentQuestionIndexInDim + 1}/8`
            : undefined
        }
      />

      {/* Container Otimizado: Mais Largo e Preenchido no Desktop (max-w-4xl / lg:max-w-5xl) */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-10 lg:py-14 flex-1 w-full">
        {/* ======================================================== */}
        {/* ETAPA 0: BOAS-VINDAS E ORIENTAÇÕES MODERNAS & AMPLAS     */}
        {/* ======================================================== */}
        {stepMode === 'WELCOME_INTRO' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Amplo e Institucional */}
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#8B7355] bg-white border border-[#D4C5A9] px-4 py-1.5 rounded-full shadow-xs">
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                Diagnóstico Oficial • Larissa Maykot
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2E2013] tracking-tight">
                Bem-vinda, {assessment.participant_name}
              </h2>

              <p className="text-sm sm:text-base lg:text-lg text-[#6B5B4D] max-w-2xl mx-auto leading-relaxed">
                Seu mapa de autoconhecimento foi iniciado. Reserve um momento tranquilo para ouvir as instruções e responder com máxima autenticidade.
              </p>
            </div>

            {/* Áudio Principal de Boas-vindas (Card 3D Flutuante Dourado) */}
            <AudioPlayer
              title="Áudio de Boas-Vindas da Larissa"
              subtitle="Propósito do diagnóstico e convite à sinceridade"
              audioUrl={getAudio('welcome')?.audio_url}
            />

            {/* Card das Instruções: 3 Pilares Modernos com mais espaço */}
            <div className="bg-white border border-[#D4C5A9] rounded-3xl p-6 sm:p-9 shadow-sm space-y-6">
              <div className="border-b border-[#D4C5A9]/50 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A96E] block mb-1">
                  Guia do Participante
                </span>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#3D2E1F]">
                  Como Responder para um Diagnóstico Preciso
                </h3>
              </div>

              {/* 3 Pilares com Tipografia Mais Legível */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FAF8F5] border border-[#D4C5A9]/70 rounded-2xl p-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-[#8B7355] tracking-wider block">
                    01 • Momento Presente
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#3D2E1F]">
                    O que acontece agora
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B5B4D] leading-relaxed">
                    Responda pensando em como você realmente age hoje, e não em como gostaria de agir.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] border border-[#D4C5A9]/70 rounded-2xl p-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-[#8B7355] tracking-wider block">
                    02 • Sem Julgamentos
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#3D2E1F]">
                    Autenticidade Real
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B5B4D] leading-relaxed">
                    Não existem respostas certas ou erradas. Quanto mais sincera for, mais libertador o mapa.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] border border-[#D4C5A9]/70 rounded-2xl p-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-[#8B7355] tracking-wider block">
                    03 • Confidencial
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#3D2E1F]">
                    100% Protegido
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B5B4D] leading-relaxed">
                    Suas respostas geram um relatório estritamente pessoal e seguro com plano de 21 dias.
                  </p>
                </div>
              </div>
            </div>

            {/* O Áudio de Como Responder FORA do Card, como Bloco Dedicado */}
            <div>
              <CompactAudioPlayer
                label="Áudio explicativo: Como responder com sinceridade"
                audioUrl={getAudio('instructions')?.audio_url}
                estimatedDuration="1:20"
              />
            </div>

            {/* Botão de Início Amplo */}
            <button
              onClick={() => {
                setStepMode('DIMENSION_INTRO');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-4 sm:py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group text-base sm:text-lg active:scale-[0.99]"
            >
              <span>Começar a Dimensão 1 de 7 (Crenças e Programação Mental)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ETAPA 1 a 7: INTRODUÇÃO DA DIMENSÃO (AMPLO & OTIMIZADO) */}
        {/* ======================================================== */}
        {stepMode === 'DIMENSION_INTRO' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <span className="text-xs sm:text-sm uppercase tracking-widest font-bold text-[#8B7355] bg-[#F0E6D6] px-4 py-1.5 rounded-full border border-[#D4C5A9]">
                Etapa {currentDimensionIndex + 1} de 7
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#3D2E1F] pt-2">
                {currentDim.name}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-[#6B5B4D] max-w-2xl mx-auto leading-relaxed">
                {currentDim.description}
              </p>
            </div>

            {/* Áudio explicativo da Dimensão */}
            <AudioPlayer
              title={`Áudio da Dimensão ${currentDimensionIndex + 1}`}
              subtitle={`Reflexão guiada sobre ${currentDim.name}`}
              audioUrl={getAudio(`dim-${currentDimensionIndex + 1}-intro`)?.audio_url}
            />

            <div className="bg-white border border-[#D4C5A9] rounded-2xl p-6 sm:p-8 text-center text-xs sm:text-sm text-[#6B5B4D] space-y-2 shadow-xs">
              <p className="font-semibold text-base sm:text-lg text-[#3D2E1F]">
                Nesta etapa, você responderá a <strong>8 perguntas breves</strong> sobre este tema.
              </p>
              <p>Escute o áudio acima com calma e clique abaixo quando estiver pronta para responder.</p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              {currentDimensionIndex > 0 && (
                <button
                  onClick={() => {
                    setCurrentDimensionIndex((prev) => prev - 1);
                    setCurrentQuestionIndexInDim(0);
                    setStepMode('DIMENSION_INTRO');
                  }}
                  className="px-6 py-4 rounded-xl border border-[#D4C5A9] text-[#6B5B4D] hover:bg-white text-sm sm:text-base font-semibold flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Etapa Anterior</span>
                </button>
              )}

              <button
                onClick={() => {
                  setStepMode('QUESTIONS');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-4 sm:py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3 group text-base sm:text-lg active:scale-[0.99]"
              >
                <span>Responder as 8 Perguntas</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERGUNTAS DEDICADAS (ESPAÇOSO E OTIMIZADO PARA COMPUTADOR)*/}
        {/* ======================================================== */}
        {stepMode === 'QUESTIONS' && currentQuestion && (
          <div className="space-y-8 animate-fade-in">
            {/* Header com Dimensão e Contador */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#8B7355] font-semibold border-b border-[#D4C5A9]/50 pb-4">
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <Compass className="w-5 h-5 text-[#C9A96E]" />
                Dimensão {currentDimensionIndex + 1}: {currentDim.name}
              </span>
              <span className="bg-[#FAF8F5] border border-[#D4C5A9] px-3.5 py-1 rounded-xl">
                Pergunta {currentQuestionIndexInDim + 1} de {questionsInCurrentDim.length}
              </span>
            </div>

            {/* Card da Pergunta com Espaço Generoso */}
            <div className="bg-white border border-[#D4C5A9] rounded-3xl p-7 sm:p-10 lg:p-12 shadow-sm space-y-8">
              <span className="text-xs sm:text-sm font-bold text-[#8B7355] tracking-widest uppercase block">
                Avalie com que frequência isso acontece com você:
              </span>

              <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#3D2E1F] leading-snug">
                “{currentQuestion.text}”
              </h3>

              {/* Escala Likert de 5 pontos com Cards Grandes e Confortáveis */}
              <div className="space-y-3.5">
                {SCALE_OPTIONS.map((opt) => {
                  const isSelected = responses[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full text-left p-4 sm:p-5 lg:p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-[#8B7355] border-[#8B7355] text-white shadow-md -translate-y-0.5'
                          : 'bg-[#FAF8F5] border-[#D4C5A9] text-[#3D2E1F] hover:bg-[#F0E6D6]/60 hover:border-[#8B7355]/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border transition ${
                            isSelected
                              ? 'bg-white text-[#8B7355] border-white'
                              : 'bg-white text-[#6B5B4D] border-[#D4C5A9] group-hover:border-[#8B7355]'
                          }`}
                        >
                          {opt.value}
                        </div>
                        <span className="font-semibold text-sm sm:text-lg">
                          {opt.label}
                        </span>
                      </div>

                      {isSelected && (
                        <Check className="w-6 h-6 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navegação entre perguntas */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevQuestion}
                className="px-6 py-3 rounded-xl border border-[#D4C5A9] text-[#6B5B4D] hover:bg-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => handleNextQuestion()}
                disabled={typeof responses[currentQuestion.id] !== 'number'}
                className="px-8 py-3.5 rounded-xl bg-[#8B7355] disabled:opacity-40 hover:bg-[#5C4A32] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-md"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-center text-xs sm:text-sm text-red-600 font-semibold">{errorMsg}</p>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* CONCLUSÃO DA ETAPA & ÁUDIO DE TRANSIÇÃO                  */}
        {/* ======================================================== */}
        {stepMode === 'DIMENSION_TRANSITION' && (
          <div className="space-y-8 animate-fade-in text-center">
            <div className="w-20 h-20 rounded-full bg-[#8B7355]/10 border border-[#8B7355]/30 flex items-center justify-center text-[#8B7355] mx-auto">
              <CheckCircle className="w-10 h-10 text-[#8B7355]" />
            </div>

            <div className="space-y-3">
              <span className="text-xs sm:text-sm font-bold text-[#8B7355] bg-[#F0E6D6] px-4 py-1.5 rounded-full border border-[#D4C5A9]">
                Etapa {currentDimensionIndex + 1} de 7 Concluída!
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#3D2E1F] pt-2">
                Você finalizou: {currentDim.name}
              </h2>
              <p className="text-sm sm:text-base text-[#6B5B4D] max-w-lg mx-auto">
                Respire fundo. Suas respostas desta dimensão foram gravadas com segurança.
              </p>
            </div>

            {/* ÁUDIO DE TRANSIÇÃO */}
            <div className="text-left">
              <AudioPlayer
                title={`Áudio de Conclusão da Etapa ${currentDimensionIndex + 1}`}
                subtitle="Mensagem da Larissa sobre o fechamento desta dimensão e o que esperar a seguir"
                audioUrl={getAudio(`dim-${currentDimensionIndex + 1}-transition`)?.audio_url}
              />
            </div>

            <div className="bg-white border border-[#D4C5A9] rounded-2xl p-6 max-w-lg mx-auto text-xs sm:text-sm text-[#6B5B4D] space-y-1.5 shadow-xs">
              <p className="font-semibold text-base text-[#3D2E1F]">
                Progresso Geral: <strong>{progressPercent}% respondido</strong>
              </p>
              <p>
                {currentDimensionIndex < 6
                  ? `Próxima etapa: Dimensão ${currentDimensionIndex + 2} — ${dimensions[currentDimensionIndex + 1]?.name}`
                  : 'Você concluiu todas as 7 etapas! Pronto para ver seu diagnóstico.'}
              </p>
            </div>

            <button
              onClick={handleNextDimension}
              className="w-full max-w-md mx-auto bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-4 sm:py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3 group text-base sm:text-lg"
            >
              <span>
                {currentDimensionIndex < 6
                  ? `Prosseguir para a Dimensão ${currentDimensionIndex + 2}`
                  : 'Prosseguir para o Encerramento'}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ETAPA FINAL: ENCERRAMENTO                                */}
        {/* ======================================================== */}
        {stepMode === 'CLOSING' && (
          <div className="space-y-8 animate-fade-in text-center">
            <div className="w-20 h-20 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center text-[#8B7355] mx-auto">
              <Sparkles className="w-10 h-10 text-[#C9A96E]" />
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#3D2E1F]">
                Parabéns, {assessment.participant_name}!
              </h2>
              <p className="text-base sm:text-xl text-[#8B7355] font-serif italic">
                Você concluiu todas as 56 perguntas do seu Mapa dos Bloqueios.
              </p>
              <p className="text-xs sm:text-sm text-[#6B5B4D] max-w-xl mx-auto leading-relaxed">
                Antes de revelar seus resultados, ouça esta mensagem especial de encerramento da Larissa sobre como acolher o que você vai ver.
              </p>
            </div>

            <div className="text-left">
              <AudioPlayer
                title="Áudio de Encerramento da Larissa"
                subtitle="Como interpretar suas pontuações com leveza e responsabilidade"
                audioUrl={getAudio('closing')?.audio_url}
              />
            </div>

            <button
              onClick={handleFinalize}
              className="w-full max-w-md mx-auto bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-4 sm:py-5 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group text-base sm:text-lg active:scale-95"
            >
              <Sparkles className="w-6 h-6 text-[#FAF8F5]" />
              <span>Processar Meu Diagnóstico Completo</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* PROCESSANDO RESULTADOS...                                */}
        {/* ======================================================== */}
        {stepMode === 'PROCESSING' && (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 border-4 border-[#8B7355] border-t-transparent rounded-full animate-spin" />
            <h3 className="font-serif text-3xl font-bold text-[#3D2E1F]">
              Calculando seu Mapa...
            </h3>
            <p className="text-sm sm:text-base text-[#8B7355] max-w-md">
              Cruzando as 7 dimensões, identificando padrões de pensamento e construindo seu plano de 21 dias...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
