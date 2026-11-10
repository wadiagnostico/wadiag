import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Compass,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Dimension, Question } from '../../types';

export const AdminQuestions: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedDimensionId, setSelectedDimensionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionDimensionId, setQuestionDimensionId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [dims, qst] = await Promise.all([
          dataService.getDimensions(),
          dataService.getQuestions(),
        ]);
        const sortedDims = dims.sort((a, b) => a.order_num - b.order_num);
        setDimensions(sortedDims);
        setQuestions(qst.sort((a, b) => a.order_num - b.order_num));
        if (sortedDims.length > 0) {
          setSelectedDimensionId(sortedDims[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar perguntas:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setQuestionDimensionId(selectedDimensionId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.text);
    setQuestionDimensionId(q.dimension_id);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !questionDimensionId) return;

    if (editingQuestion) {
      // Edit
      const updated = questions.map((q) =>
        q.id === editingQuestion.id
          ? { ...q, text: questionText.trim(), dimension_id: questionDimensionId }
          : q
      );
      setQuestions(updated);
      await dataService.saveQuestions(updated);
      showNotification('Pergunta atualizada com sucesso!');
    } else {
      // Add
      const questionsInDim = questions.filter((q) => q.dimension_id === questionDimensionId);
      const newQ: Question = {
        id: 'q_' + Math.random().toString(36).substring(2, 9),
        dimension_id: questionDimensionId,
        text: questionText.trim(),
        order_num: questionsInDim.length + 1,
        active: true,
        version: 1,
      };
      const updated = [...questions, newQ];
      setQuestions(updated);
      await dataService.saveQuestions(updated);
      showNotification('Nova pergunta criada com sucesso!');
    }

    setIsModalOpen(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta pergunta?')) return;
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    await dataService.saveQuestions(updated);
    showNotification('Pergunta excluída.');
  };

  const filteredQuestions = questions
    .filter((q) => q.dimension_id === selectedDimensionId)
    .sort((a, b) => a.order_num - b.order_num);

  const selectedDimObj = dimensions.find((d) => d.id === selectedDimensionId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C5A9]/60 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E1F] flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-[#8B7355]" />
            Gerenciamento de Perguntas e Etapas
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5B4D] mt-1">
            Cadastre, edite ou reorganize as 56 perguntas do questionário organizadas nas 7 dimensões.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notification && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notification}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Pergunta</span>
          </button>
        </div>
      </div>

      {/* Seletor de Dimensão */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dimensions.map((dim) => (
          <button
            key={dim.id}
            type="button"
            onClick={() => setSelectedDimensionId(dim.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
              selectedDimensionId === dim.id
                ? 'bg-[#8B7355] border-[#8B7355] text-white shadow-sm'
                : 'bg-white border-[#D4C5A9] text-[#6B5B4D] hover:bg-[#F0E6D6]/40'
            }`}
          >
            {dim.order_num}. {dim.name}
          </button>
        ))}
      </div>

      {/* Info da Dimensão Selecionada */}
      {selectedDimObj && (
        <div className="bg-[#F0E6D6]/60 border border-[#D4C5A9] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-[#8B7355] uppercase tracking-wider text-[10px]">
              Dimensão {selectedDimObj.order_num}
            </span>
            <h3 className="font-serif font-bold text-base text-[#3D2E1F]">
              {selectedDimObj.name}
            </h3>
            <p className="text-[#6B5B4D] mt-0.5">{selectedDimObj.description}</p>
          </div>
          <div className="text-[#8B7355] font-semibold bg-white px-3 py-1.5 rounded-xl border border-[#D4C5A9] self-start sm:self-auto">
            {filteredQuestions.length} perguntas ativas
          </div>
        </div>
      )}

      {/* Lista de Perguntas */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white border border-[#D4C5A9] rounded-2xl p-4 shadow-sm hover:border-[#8B7355] transition flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#D4C5A9] text-[#8B7355] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#3D2E1F] leading-relaxed">
                  “{q.text}”
                </p>
                <span className="text-[10px] text-[#9B8B7D]">
                  Escala de 5 pontos: Nunca (0) a Quase sempre (4)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEdit(q)}
                className="p-1.5 text-[#6B5B4D] hover:text-[#3D2E1F] hover:bg-[#FAF8F5] rounded-lg transition"
                title="Editar texto da pergunta"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                title="Excluir pergunta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C5A9] rounded-3xl max-w-lg w-full shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-[#D4C5A9]/60 flex items-center justify-between bg-[#FAF8F5] rounded-t-3xl">
              <h3 className="font-serif text-lg font-bold text-[#3D2E1F]">
                {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#6B5B4D] hover:text-[#3D2E1F] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                  Dimensão / Etapa
                </label>
                <select
                  value={questionDimensionId}
                  onChange={(e) => setQuestionDimensionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs bg-white text-[#3D2E1F] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                >
                  {dimensions.map((dim) => (
                    <option key={dim.id} value={dim.id}>
                      {dim.order_num}. {dim.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                  Texto da Pergunta
                </label>
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Ex: Costumo pensar que não sou capaz de conquistar algo maior..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs bg-[#FAF8F5] text-[#3D2E1F] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D4C5A9] text-xs font-semibold text-[#6B5B4D] hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B7355] hover:bg-[#5C4A32] text-white text-xs font-semibold shadow-sm"
                >
                  Salvar Pergunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
