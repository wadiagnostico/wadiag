import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Search, ArrowRight, Download, Calendar, User, Compass } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Assessment, AssessmentResult, PlatformSettings } from '../../types';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [allAsm, sett] = await Promise.all([
          dataService.getAllAssessments(),
          dataService.getSettings(),
        ]);
        setAssessments(allAsm);
        setSettings(sett);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = assessments.filter((a) =>
    a.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5]">
      <Navbar settings={settings || undefined} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C5A9]/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#8B7355] font-serif text-sm font-semibold mb-1">
              <HistoryIcon className="w-4 h-4" />
              <span>Registro de Avaliações</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E1F]">
              Histórico de Diagnósticos
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5B4D] mt-1">
              Consulte suas avaliações anteriores, compare seu progresso ao longo do tempo ou baixe relatórios.
            </p>
          </div>

          <Link
            to="/"
            className="bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm text-xs sm:text-sm transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Nova Avaliação</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#8B7355] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D4C5A9] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-[#3D2E1F]"
          />
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#8B7355]">Carregando histórico...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#D4C5A9] rounded-2xl p-10 text-center space-y-3">
            <Compass className="w-10 h-10 text-[#C9A96E] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#3D2E1F]">
              Nenhuma avaliação encontrada
            </h3>
            <p className="text-xs text-[#6B5B4D] max-w-md mx-auto">
              {searchTerm
                ? 'Nenhum resultado corresponde ao termo pesquisado.'
                : 'Você ainda não concluiu nenhum diagnóstico neste dispositivo. Inicie o seu primeiro agora!'}
            </p>
            <Link
              to="/"
              className="inline-block mt-2 text-xs font-semibold text-[#8B7355] hover:text-[#5C4A32] underline"
            >
              Iniciar meu primeiro diagnóstico
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((asm) => {
              const isCompleted = asm.status === 'completed';
              const dateStr = new Date(asm.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={asm.id}
                  className="bg-white border border-[#D4C5A9] rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-[#8B7355] font-medium">
                        <User className="w-3.5 h-3.5" />
                        <strong className="text-[#3D2E1F]">{asm.participant_name}</strong>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isCompleted ? 'Concluído' : 'Em andamento'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#9B8B7D] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#D4C5A9]/40 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          isCompleted ? `/resultado/${asm.id}` : `/diagnostico/${asm.id}`
                        )
                      }
                      className="text-xs font-semibold text-[#8B7355] hover:text-[#5C4A32] flex items-center gap-1 transition"
                    >
                      <span>{isCompleted ? 'Ver Diagnóstico Completo' : 'Continuar Perguntas'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
