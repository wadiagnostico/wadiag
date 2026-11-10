import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Headphones,
  HelpCircle,
  FileBadge,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Assessment, Profile, Dimension } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [asm, profs, dims] = await Promise.all([
          dataService.getAllAssessments(),
          dataService.getProfiles(),
          dataService.getDimensions(),
        ]);
        setAssessments(asm);
        setProfiles(profs);
        setDimensions(dims);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const total = assessments.length;
  const completed = assessments.filter((a) => a.status === 'completed').length;
  const inProgress = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const completedWithTime = assessments.filter((a) => a.duration_seconds && a.duration_seconds > 0);
  const avgMinutes =
    completedWithTime.length > 0
      ? Math.round(
          completedWithTime.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) /
            completedWithTime.length /
            60
        )
      : 32;

  const recentAssessments = assessments.slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E1F]">
          Visão Geral do Sistema
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5B4D] mt-1">
          Acompanhe o desempenho, volume de avaliações e indicadores do Mapa dos Bloqueios.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D4C5A9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B7355]">Total de Avaliações</span>
            <div className="w-8 h-8 rounded-xl bg-[#8B7355]/10 flex items-center justify-center text-[#8B7355]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#3D2E1F]">
            {total}
          </div>
          <div className="text-[11px] text-[#6B5B4D]">Iniciadas por participantes</div>
        </div>

        <div className="bg-white border border-[#D4C5A9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Concluídas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#3D2E1F]">
            {completed}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {completionRate}% de taxa de conclusão
          </div>
        </div>

        <div className="bg-white border border-[#D4C5A9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Em Andamento</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#3D2E1F]">
            {inProgress}
          </div>
          <div className="text-[11px] text-[#6B5B4D]">Aguardando finalização</div>
        </div>

        <div className="bg-white border border-[#D4C5A9] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B7355]">Tempo Médio</span>
            <div className="w-8 h-8 rounded-xl bg-[#8B7355]/10 flex items-center justify-center text-[#8B7355]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#3D2E1F]">
            ~{avgMinutes} min
          </div>
          <div className="text-[11px] text-[#6B5B4D]">Por diagnóstico completo</div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/audios"
          className="bg-gradient-to-br from-white to-[#FAF8F5] border border-[#D4C5A9] rounded-2xl p-5 hover:border-[#8B7355] transition shadow-sm group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#3D2E1F]">Áudios das Etapas</h4>
              <p className="text-[11px] text-[#6B5B4D]">Subir áudios da Larissa</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8B7355] group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/perguntas"
          className="bg-gradient-to-br from-white to-[#FAF8F5] border border-[#D4C5A9] rounded-2xl p-5 hover:border-[#8B7355] transition shadow-sm group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#3D2E1F]">Perguntas & Etapas</h4>
              <p className="text-[11px] text-[#6B5B4D]">56 questões cadastradas</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8B7355] group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/perfis"
          className="bg-gradient-to-br from-white to-[#FAF8F5] border border-[#D4C5A9] rounded-2xl p-5 hover:border-[#8B7355] transition shadow-sm group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#3D2E1F]">Perfis e Regras</h4>
              <p className="text-[11px] text-[#6B5B4D]">10 perfis de diagnóstico</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8B7355] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Avaliações Recentes */}
      <div className="bg-white border border-[#D4C5A9] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#3D2E1F]">
            Avaliações Recentes
          </h3>
          <Link
            to="/admin/avaliacoes"
            className="text-xs font-semibold text-[#8B7355] hover:text-[#5C4A32] flex items-center gap-1"
          >
            <span>Ver todas as avaliações</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAssessments.length === 0 ? (
          <p className="text-xs text-[#9B8B7D] py-6 text-center italic">
            Nenhuma avaliação realizada ainda. Abra o aplicativo público para testar!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D4C5A9]/50 text-[#8B7355] uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Participante</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4C5A9]/30">
                {recentAssessments.map((asm) => {
                  const isDone = asm.status === 'completed';
                  const dateStr = new Date(asm.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={asm.id} className="hover:bg-[#FAF8F5] transition">
                      <td className="py-3 pl-2 font-semibold text-[#3D2E1F]">
                        {asm.participant_name}
                      </td>
                      <td className="py-3 text-[#6B5B4D]">{dateStr}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isDone ? 'Concluída' : 'Em andamento'}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <Link
                          to={isDone ? `/resultado/${asm.id}` : `/diagnostico/${asm.id}`}
                          target="_blank"
                          className="text-[#8B7355] hover:text-[#5C4A32] font-semibold inline-flex items-center gap-1"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
