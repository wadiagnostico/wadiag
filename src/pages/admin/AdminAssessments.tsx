import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Download,
  ExternalLink,
  Eye,
  X,
  CheckCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import {
  Assessment,
  AssessmentResult,
  Dimension,
  Question,
  Profile,
  SCALE_OPTIONS,
} from '../../types';
import { generateAssessmentPDF } from '../../lib/pdfGenerator';

export const AdminAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'completed' | 'in_progress'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal details
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [asm, dims, qst, profs] = await Promise.all([
          dataService.getAllAssessments(),
          dataService.getDimensions(),
          dataService.getQuestions(),
          dataService.getProfiles(),
        ]);
        setAssessments(asm);
        setDimensions(dims.sort((a, b) => a.order_num - b.order_num));
        setQuestions(qst.sort((a, b) => a.order_num - b.order_num));
        setProfiles(profs);
      } catch (err) {
        console.error('Erro ao carregar avaliações:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleOpenDetails = async (asm: Assessment) => {
    setSelectedAssessment(asm);
    const [res, resp] = await Promise.all([
      dataService.getAssessmentResult(asm.id),
      dataService.getResponses(asm.id),
    ]);
    setSelectedResult(res);
    setSelectedResponses(resp);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = async (asm: Assessment) => {
    const res = await dataService.getAssessmentResult(asm.id);
    if (!res) {
      alert('Esta avaliação ainda não possui resultados consolidados para gerar o PDF.');
      return;
    }
    const prim = profiles.find((p) => p.id === res.primary_profile_id) || profiles[0];
    const sec = profiles.filter((p) => res.secondary_profile_ids?.includes(p.id));

    await generateAssessmentPDF({
      assessment: asm,
      result: res,
      dimensions,
      primaryProfile: prim,
      secondaryProfiles: sec,
    });
  };

  const filtered = assessments.filter((a) => {
    const matchName = a.participant_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C5A9]/60 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E1F] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#8B7355]" />
            Gerenciamento de Avaliações
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5B4D] mt-1">
            Consulte todas as respostas, acompanhe os perfis gerados e baixe os relatórios em PDF.
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#8B7355] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar participante pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D4C5A9] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white text-[#3D2E1F]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { key: 'ALL', label: 'Todas' },
            { key: 'completed', label: 'Concluídas' },
            { key: 'in_progress', label: 'Em Andamento' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                statusFilter === tab.key
                  ? 'bg-[#8B7355] border-[#8B7355] text-white shadow-sm'
                  : 'bg-white border-[#D4C5A9] text-[#6B5B4D] hover:bg-[#F0E6D6]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Avaliações */}
      <div className="bg-white border border-[#D4C5A9] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#8B7355]">Carregando avaliações...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#9B8B7D]">
            Nenhuma avaliação encontrada com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#D4C5A9] text-[#8B7355] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Participante</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Duração</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4C5A9]/30">
                {filtered.map((asm) => {
                  const isDone = asm.status === 'completed';
                  const dateStr = new Date(asm.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={asm.id} className="hover:bg-[#FAF8F5]/80 transition">
                      <td className="py-3 px-4 font-semibold text-[#3D2E1F]">
                        {asm.participant_name}
                      </td>
                      <td className="py-3 px-4 text-[#6B5B4D]">{dateStr}</td>
                      <td className="py-3 px-4 text-[#6B5B4D]">
                        {asm.duration_seconds
                          ? `${Math.round(asm.duration_seconds / 60)} min`
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(asm)}
                          className="px-2.5 py-1 rounded-lg border border-[#D4C5A9] text-[#6B5B4D] hover:text-[#3D2E1F] hover:bg-white text-[11px] font-semibold transition inline-flex items-center gap-1"
                          title="Ver respostas individuais"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Respostas</span>
                        </button>

                        {isDone && (
                          <>
                            <Link
                              to={`/resultado/${asm.id}`}
                              target="_blank"
                              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#D4C5A9] text-[#8B7355] hover:text-[#5C4A32] text-[11px] font-semibold transition inline-flex items-center gap-1"
                              title="Abrir página de resultado"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Resultado</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(asm)}
                              className="px-2.5 py-1 rounded-lg bg-[#8B7355] text-white hover:bg-[#5C4A32] text-[11px] font-semibold transition inline-flex items-center gap-1 shadow-sm"
                              title="Baixar PDF deste participante"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes com Respostas Individuais */}
      {isModalOpen && selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C5A9] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D4C5A9]/60 flex items-center justify-between bg-[#FAF8F5] rounded-t-3xl">
              <div>
                <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                  Respostas Individuais
                </span>
                <h3 className="font-serif text-xl font-bold text-[#3D2E1F]">
                  {selectedAssessment.participant_name}
                </h3>
                <p className="text-xs text-[#6B5B4D]">
                  Realizado em {new Date(selectedAssessment.created_at).toLocaleString('pt-BR')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#6B5B4D] hover:text-[#3D2E1F] rounded-full hover:bg-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {dimensions.map((dim) => {
                const dimQuestions = questions.filter((q) => q.dimension_id === dim.id);
                return (
                  <div key={dim.id} className="space-y-3">
                    <h4 className="font-serif font-bold text-sm text-[#8B7355] border-b border-[#D4C5A9]/50 pb-1">
                      {dim.order_num}. {dim.name}
                    </h4>

                    <div className="space-y-2">
                      {dimQuestions.map((q) => {
                        const val = selectedResponses[q.id];
                        const opt = SCALE_OPTIONS.find((o) => o.value === val);

                        return (
                          <div
                            key={q.id}
                            className="bg-[#FAF8F5] p-3 rounded-xl border border-[#D4C5A9]/50 flex items-start justify-between gap-3 text-xs"
                          >
                            <span className="text-[#3D2E1F] font-medium leading-relaxed">
                              {q.order_num}. {q.text}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 border ${
                                typeof val === 'number'
                                  ? 'bg-white border-[#D4C5A9] text-[#8B7355]'
                                  : 'bg-gray-100 text-gray-400 border-gray-200'
                              }`}
                            >
                              {opt ? `${val} — ${opt.label}` : 'Não respondida'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D4C5A9]/60 bg-[#FAF8F5] rounded-b-3xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#D4C5A9] text-xs font-semibold text-[#6B5B4D] hover:bg-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
