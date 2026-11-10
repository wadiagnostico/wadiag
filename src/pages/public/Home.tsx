import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Headphones,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  RotateCcw,
  Play,
  Sparkles,
  Award,
  Layers,
  FileText,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { PlatformSettings, Assessment } from '../../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [participantName, setParticipantName] = useState('');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [existingAssessment, setExistingAssessment] = useState<Assessment | null>(null);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  useEffect(() => {
    async function init() {
      const sett = await dataService.getSettings();
      setSettings(sett);

      const params = new URLSearchParams(location.search);
      const isNewRequested = params.get('novo') === 'true';

      const lastId = localStorage.getItem('wa_current_assessment_id');
      if (lastId && !isNewRequested) {
        const asm = await dataService.getAssessment(lastId);
        if (asm) {
          // Se já finalizou a avaliação, redireciona direto para a página final do resultado!
          if (asm.status === 'completed') {
            navigate(`/resultado/${asm.id}`, { replace: true });
            return;
          }
          // Se estiver em andamento, mostra o card para continuar
          if (asm.status === 'in_progress') {
            setExistingAssessment(asm);
            const resp = await dataService.getResponses(lastId);
            setAnsweredCount(Object.keys(resp).length);
          }
        }
      }
    }
    init();
  }, [location.search, navigate]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = participantName.trim();
    if (!name) {
      setErrorMsg('Por favor, informe seu nome para emitir seu diagnóstico.');
      return;
    }
    if (name.length < 2) {
      setErrorMsg('O nome deve conter pelo menos 2 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const assessment = await dataService.startAssessment(name);
      localStorage.setItem('wa_current_assessment_id', assessment.id);
      navigate(`/diagnostico/${assessment.id}`);
    } catch (err) {
      console.error('Erro ao iniciar diagnóstico:', err);
      setErrorMsg('Ocorreu um erro ao iniciar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = () => {
    if (existingAssessment) {
      navigate(`/diagnostico/${existingAssessment.id}`);
    }
  };

  const handleStartFresh = () => {
    setExistingAssessment(null);
    localStorage.removeItem('wa_current_assessment_id');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20 flex-1 flex flex-col items-center">
        {/* ======================================================== */}
        {/* HERO SECTION DE ALTO IMPACTO & CREDIBILIDADE             */}
        {/* ======================================================== */}
        <div className="text-center max-w-2xl mb-10 space-y-4 animate-fade-in">
          {/* Selo Oficial de Autoria */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-white via-[#FAF6EF] to-white border border-[#D4C5A9] px-4 py-1.5 rounded-full text-xs font-semibold text-[#8B7355] shadow-xs">
            <Award className="w-4 h-4 text-[#C9A96E]" />
            <span className="tracking-wide">Metodologia Oficial • Larissa Maykot</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#2E2013] tracking-tight leading-tight">
            {settings?.platform_name || 'Mapa dos Bloqueios'}
          </h1>

          <p className="text-base sm:text-2xl text-[#8B7355] font-serif italic max-w-xl mx-auto">
            {settings?.subtitle || 'Diagnóstico de mentalidade, comportamento e prosperidade'}
          </p>

          <p className="text-xs sm:text-sm text-[#6B5B4D] leading-relaxed max-w-xl mx-auto font-normal">
            {settings?.welcome_message ||
              'Identifique com precisão quais padrões inconscientes de pensamento, decisões e atitudes estão limitando seus resultados financeiros e a construção da sua realidade.'}
          </p>

          {/* Faixa com 4 Indicadores de Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-[11px] sm:text-xs text-[#8B7355] font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C9A96E]" />
              7 Dimensões
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A96E]" />
              56 Indicadores
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#C9A96E]" />
              Relatório em PDF
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
              100% Confidencial
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD CENTRAL 3D FLUTUANTE (RETOMADA OU CADASTRO DO NOME) */}
        {/* ======================================================== */}
        <div className="w-full max-w-lg relative group mb-16">
          {/* Luz Neon Dourada no Fundo */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#C9A96E]/40 via-[#E8D5A3]/65 to-[#C9A96E]/40 rounded-[2.5rem] blur-2xl opacity-75 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

          {/* Card 3D em Relevo Ouro & Champanhe */}
          <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#F3E7D3] border-2 border-[#C9A96E] rounded-[2.2rem] p-7 sm:p-10 shadow-[inset_0_3px_6px_rgba(255,255,255,1),0_20px_45px_-10px_rgba(92,74,50,0.25),0_0_35px_rgba(201,169,110,0.3)] transition-all duration-500 overflow-hidden">
            {/* Ornamento dourado superior */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#C9A96E]/20 to-transparent rounded-bl-full pointer-events-none" />

            {existingAssessment ? (
              /* Caso haja avaliação em andamento */
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A96E] to-[#8B7355] text-white flex items-center justify-center font-bold shadow-md shadow-[#C9A96E]/40 shrink-0">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E7E3F] block">
                      Sessão em Andamento
                    </span>
                    <h3 className="font-serif font-bold text-2xl text-[#2E2013]">
                      Olá, {existingAssessment.participant_name}!
                    </h3>
                  </div>
                </div>

                <div className="bg-white/80 border border-[#D4C5A9]/80 rounded-2xl p-5 space-y-2.5 text-xs text-[#6B5B4D] shadow-inner">
                  <div className="flex justify-between font-semibold">
                    <span>Progresso Registrado:</span>
                    <strong className="text-[#8B7355]">{answeredCount} de 56 perguntas respondidas</strong>
                  </div>
                  <div className="w-full h-2.5 bg-[#EAE0D0] rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9A96E] to-[#8B7355] rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.round((answeredCount / 56) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#8B7355] pt-0.5">
                    Todas as suas respostas estão sincronizadas e salvas no banco.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResume}
                    className="w-full bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 group text-base active:scale-[0.99]"
                  >
                    <span>Continuar de Onde Parei</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="w-full text-xs text-[#8B7355] hover:text-[#5C4A32] py-2 font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Iniciar um novo diagnóstico do zero</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário de Identificação do Participante */
              <form onSubmit={handleStart} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E7E3F] block">
                    Acesso Individual
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-[#2E2013]">
                    Identificação do Participante
                  </h3>
                  <p className="text-xs text-[#6B5B4D] leading-relaxed">
                    Informe seu nome para personalizar seus relatórios, gráficos e o plano de ação individual.
                  </p>
                </div>

                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-[#3D2E1F] mb-1.5">
                    Seu Nome Completo ou Primeiro Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={participantName}
                    onChange={(e) => {
                      setParticipantName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Ex: Larissa Silva"
                    className="w-full px-4 py-3.5 rounded-xl border border-[#D4C5A9] focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent text-sm text-[#3D2E1F] placeholder-[#9B8B7D] bg-white shadow-xs transition"
                    autoFocus
                  />
                  {errorMsg && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium">{errorMsg}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8B7355] hover:bg-[#5C4A32] disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group text-base active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span>Iniciando seu mapa...</span>
                  ) : (
                    <>
                      <span>Iniciar Diagnóstico Personalizado</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-[#8B7355] pt-4 border-t border-[#D4C5A9]/50">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> 30-45 min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Headphones className="w-3.5 h-3.5" /> Experiência Guiada
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Seguro & Privado
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARDS 3D COM TEXTURA, FONTE ELEGANTE E NEON DOURADO      */}
        {/* ======================================================== */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 7 Dimensões Chave */}
          <div className="relative group">
            {/* Brilho Neon Dourado de Fundo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A96E]/50 via-[#E8D5A3]/60 to-[#C9A96E]/40 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 group-hover:blur-2xl transition duration-500 transform group-hover:scale-105" />

            {/* Card 3D com textura e relevo */}
            <div className="relative h-full bg-gradient-to-b from-[#FFFFFF] via-[#FAF7F2] to-[#F1EAE0] border border-[#D4C5A9]/80 rounded-3xl p-6 sm:p-7 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_14px_28px_-6px_rgba(92,74,50,0.18),0_0_20px_rgba(201,169,110,0.22)] transform group-hover:-translate-y-2 group-hover:shadow-[inset_0_2px_6px_rgba(255,255,255,1),0_22px_40px_-8px_rgba(92,74,50,0.28),0_0_35px_rgba(201,169,110,0.55)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EAE0D0] border border-[#D4C5A9] shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),0_4px_10px_rgba(139,115,85,0.2)] flex items-center justify-center text-[#8B7355] mb-4 group-hover:scale-110 group-hover:text-[#5C4A32] transition-transform">
                  <Compass className="w-6 h-6 drop-shadow-sm text-[#8B7355]" />
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#3D2E1F] tracking-tight mb-2.5 leading-snug">
                  7 Dimensões Chave
                </h3>

                <p className="text-xs sm:text-[13px] text-[#6B5B4D] leading-relaxed font-normal">
                  56 perguntas estruturadas para mapear crenças, merecimento, clareza, ação consistente e relacionamentos.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D4C5A9]/40 flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7355]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Mapeamento Profundo</span>
              </div>
            </div>
          </div>

          {/* Card 2: Voz e Acolhimento */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A96E]/50 via-[#E8D5A3]/60 to-[#C9A96E]/40 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 group-hover:blur-2xl transition duration-500 transform group-hover:scale-105" />

            <div className="relative h-full bg-gradient-to-b from-[#FFFFFF] via-[#FAF7F2] to-[#F1EAE0] border border-[#D4C5A9]/80 rounded-3xl p-6 sm:p-7 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_14px_28px_-6px_rgba(92,74,50,0.18),0_0_20px_rgba(201,169,110,0.22)] transform group-hover:-translate-y-2 group-hover:shadow-[inset_0_2px_6px_rgba(255,255,255,1),0_22px_40px_-8px_rgba(92,74,50,0.28),0_0_35px_rgba(201,169,110,0.55)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EAE0D0] border border-[#D4C5A9] shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),0_4px_10px_rgba(139,115,85,0.2)] flex items-center justify-center text-[#8B7355] mb-4 group-hover:scale-110 group-hover:text-[#5C4A32] transition-transform">
                  <Headphones className="w-6 h-6 drop-shadow-sm text-[#8B7355]" />
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#3D2E1F] tracking-tight mb-2.5 leading-snug">
                  Voz e Acolhimento
                </h3>

                <p className="text-xs sm:text-[13px] text-[#6B5B4D] leading-relaxed font-normal">
                  Áudios da Larissa em cada etapa e transições acolhedoras para desacelerar e responder com sinceridade.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D4C5A9]/40 flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7355]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Experiência Guiada</span>
              </div>
            </div>
          </div>

          {/* Card 3: PDF & Plano 21 Dias */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C9A96E]/50 via-[#E8D5A3]/60 to-[#C9A96E]/40 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 group-hover:blur-2xl transition duration-500 transform group-hover:scale-105" />

            <div className="relative h-full bg-gradient-to-b from-[#FFFFFF] via-[#FAF7F2] to-[#F1EAE0] border border-[#D4C5A9]/80 rounded-3xl p-6 sm:p-7 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_14px_28px_-6px_rgba(92,74,50,0.18),0_0_20px_rgba(201,169,110,0.22)] transform group-hover:-translate-y-2 group-hover:shadow-[inset_0_2px_6px_rgba(255,255,255,1),0_22px_40px_-8px_rgba(92,74,50,0.28),0_0_35px_rgba(201,169,110,0.55)] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EAE0D0] border border-[#D4C5A9] shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),0_4px_10px_rgba(139,115,85,0.2)] flex items-center justify-center text-[#8B7355] mb-4 group-hover:scale-110 group-hover:text-[#5C4A32] transition-transform">
                  <CheckCircle2 className="w-6 h-6 drop-shadow-sm text-[#8B7355]" />
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#3D2E1F] tracking-tight mb-2.5 leading-snug">
                  PDF & Plano 21 Dias
                </h3>

                <p className="text-xs sm:text-[13px] text-[#6B5B4D] leading-relaxed font-normal">
                  Relatório editorial personalizado para download e microações práticas para destravar seu momento.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D4C5A9]/40 flex items-center gap-1.5 text-[11px] font-semibold text-[#8B7355]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Entrega Completa</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
