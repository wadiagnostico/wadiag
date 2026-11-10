import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Upload,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Save,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { StageAudio, Dimension } from '../../types';

export const AdminAudios: React.FC = () => {
  const [stageAudios, setStageAudios] = useState<StageAudio[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'INTRO' | 'TRANSITION' | 'CLOSING'>('ALL');

  useEffect(() => {
    async function load() {
      try {
        const [audios, dims] = await Promise.all([
          dataService.getStageAudios(),
          dataService.getDimensions(),
        ]);
        setStageAudios(audios);
        setDimensions(dims.sort((a, b) => a.order_num - b.order_num));
      } catch (err) {
        console.error('Erro ao carregar áudios:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleFileUpload = (stageKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      const updated = stageAudios.map((a) =>
        a.stage_key === stageKey
          ? { ...a, audio_url: base64Url, audio_filename: file.name }
          : a
      );
      setStageAudios(updated);
      await dataService.saveStageAudios(updated);
      setSaveSuccess(`Áudio "${file.name}" salvo com sucesso!`);
      setTimeout(() => setSaveSuccess(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = async (stageKey: string, url: string) => {
    const updated = stageAudios.map((a) =>
      a.stage_key === stageKey
        ? { ...a, audio_url: url.trim() || null, audio_filename: url.trim() ? 'Link Externo' : null }
        : a
    );
    setStageAudios(updated);
    await dataService.saveStageAudios(updated);
  };

  const handleRemoveAudio = async (stageKey: string) => {
    if (!confirm('Deseja remover o áudio desta etapa?')) return;
    const updated = stageAudios.map((a) =>
      a.stage_key === stageKey ? { ...a, audio_url: null, audio_filename: null } : a
    );
    setStageAudios(updated);
    await dataService.saveStageAudios(updated);
    setSaveSuccess('Áudio removido.');
    setTimeout(() => setSaveSuccess(''), 2500);
  };

  const filteredAudios = stageAudios.filter((audio) => {
    if (activeTab === 'INTRO') return audio.stage_key.includes('intro') || audio.stage_key === 'welcome' || audio.stage_key === 'instructions';
    if (activeTab === 'TRANSITION') return audio.stage_key.includes('transition');
    if (activeTab === 'CLOSING') return audio.stage_key === 'closing' || audio.stage_key === 'results';
    return true;
  });

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-[#8B7355]">Carregando gerenciador de áudios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C5A9]/60 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E1F] flex items-center gap-2.5">
            <Headphones className="w-6 h-6 text-[#8B7355]" />
            Gerenciamento de Áudios das Etapas
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5B4D] mt-1 max-w-2xl leading-relaxed">
            Aqui você cadastra os áudios gravados pela Larissa para cada momento do diagnóstico: áudios de introdução, áudios de encerramento e os áudios de transição entre cada etapa.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'Todos os Áudios' },
          { key: 'INTRO', label: 'Introduções das Etapas' },
          { key: 'TRANSITION', label: 'Transições / Final de Etapa' },
          { key: 'CLOSING', label: 'Encerramento & Resultados' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              activeTab === tab.key
                ? 'bg-[#8B7355] border-[#8B7355] text-white shadow-sm'
                : 'bg-white border-[#D4C5A9] text-[#6B5B4D] hover:bg-[#F0E6D6]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAudios.map((audio) => {
          const hasAudio = Boolean(audio.audio_url);
          const isTransition = audio.stage_key.includes('transition');

          return (
            <div
              key={audio.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition ${
                hasAudio
                  ? 'border-[#D4C5A9]'
                  : 'border-dashed border-[#D4C5A9] bg-[#FAF8F5]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isTransition
                          ? 'bg-[#C9A96E]/20 text-[#5C4A32] border-[#C9A96E]/40'
                          : 'bg-[#F0E6D6] text-[#8B7355] border-[#D4C5A9]'
                      }`}
                    >
                      {isTransition ? 'Transição de Etapa' : 'Apresentação'}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasAudio
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hasAudio ? 'Áudio Ativo' : 'Aguardando Áudio'}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#3D2E1F]">
                    {audio.stage_label}
                  </h3>
                  <p className="text-xs text-[#6B5B4D] leading-relaxed">
                    {audio.description}
                  </p>
                </div>
              </div>

              {/* Player se houver áudio */}
              {hasAudio && (
                <div className="bg-[#FAF8F5] border border-[#D4C5A9]/70 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8B7355]">
                    <span className="font-medium truncate max-w-[200px]">
                      🎵 {audio.audio_filename || 'Arquivo de áudio'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAudio(audio.stage_key)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[11px] font-medium"
                      title="Excluir áudio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  </div>

                  <audio
                    controls
                    src={audio.audio_url || undefined}
                    className="w-full h-8"
                  />
                </div>
              )}

              {/* Upload ou URL externa */}
              <div className="space-y-2 pt-1 border-t border-[#D4C5A9]/40">
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer bg-[#FAF8F5] hover:bg-[#F0E6D6] border border-[#D4C5A9] rounded-xl px-3 py-2 text-xs font-semibold text-[#8B7355] transition flex items-center justify-center gap-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{hasAudio ? 'Substituir Arquivo' : 'Enviar Arquivo (.mp3, .m4a)'}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileUpload(audio.stage_key, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Ou cole o link direto do áudio..."
                    defaultValue={audio.audio_url?.startsWith('http') ? audio.audio_url : ''}
                    onBlur={(e) => handleUrlChange(audio.stage_key, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#D4C5A9] text-xs focus:outline-none focus:ring-1 focus:ring-[#8B7355] bg-white text-[#3D2E1F]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
