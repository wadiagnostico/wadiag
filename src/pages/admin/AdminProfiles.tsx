import React, { useState, useEffect } from 'react';
import {
  FileBadge,
  Edit2,
  Save,
  X,
  Compass,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Profile } from '../../types';

export const AdminProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Editing modal
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    async function load() {
      try {
        const profs = await dataService.getProfiles();
        setProfiles(profs.sort((a, b) => a.order_num - b.order_num));
      } catch (err) {
        console.error('Erro ao carregar perfis:', err);
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

  const handleOpenEdit = (p: Profile) => {
    setEditingProfile(p);
    setFormData({ ...p });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !formData.name) return;

    const updated = profiles.map((p) =>
      p.id === editingProfile.id ? ({ ...p, ...formData } as Profile) : p
    );
    setProfiles(updated);
    await dataService.saveProfiles(updated);
    showNotification(`Perfil "${formData.name}" atualizado!`);
    setEditingProfile(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C5A9]/60 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E1F] flex items-center gap-2.5">
            <FileBadge className="w-6 h-6 text-[#8B7355]" />
            Gerenciamento dos 10 Perfis e Diagnósticos
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5B4D] mt-1">
            Edite as leituras, orientações, diretrizes centrais e recomendações práticas de cada um dos dez perfis.
          </p>
        </div>

        {notification && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      <div className="bg-[#FAF8F5] border border-[#D4C5A9] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#6B5B4D]">
        <Info className="w-4 h-4 text-[#8B7355] shrink-0 mt-0.5" />
        <p>
          Os resultados do Mapa dos Bloqueios são calculados a partir da combinação das pontuações das 7 dimensões. Você pode ajustar a linguagem de acolhimento e as recomendações de cada perfil diretamente abaixo.
        </p>
      </div>

      {/* Grid de Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white border border-[#D4C5A9] rounded-2xl p-6 shadow-sm hover:border-[#8B7355] transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8B7355] bg-[#F0E6D6] px-2.5 py-0.5 rounded-full">
                  Perfil #{profile.order_num}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(profile)}
                  className="text-xs font-semibold text-[#8B7355] hover:text-[#5C4A32] flex items-center gap-1 p-1 hover:bg-[#FAF8F5] rounded-lg transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#3D2E1F]">
                {profile.name}
              </h3>

              <p className="text-xs text-[#6B5B4D] italic bg-[#FAF8F5] p-3 rounded-xl border border-[#D4C5A9]/50">
                “{profile.phrase || profile.description}”
              </p>

              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-[#3D2E1F] block text-[11px] uppercase tracking-wider">
                    Diretriz Central:
                  </strong>
                  <p className="text-[#6B5B4D] mt-0.5 leading-relaxed">{profile.guidance}</p>
                </div>

                <div>
                  <strong className="text-[#3D2E1F] block text-[11px] uppercase tracking-wider">
                    Ação Recomendada:
                  </strong>
                  <p className="text-[#6B5B4D] mt-0.5 leading-relaxed">{profile.recommendations}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Editar Perfil */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C5A9] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-[#D4C5A9]/60 flex items-center justify-between bg-[#FAF8F5] rounded-t-3xl">
              <h3 className="font-serif text-lg font-bold text-[#3D2E1F]">
                Editar Perfil: {editingProfile.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="p-1.5 text-[#6B5B4D] hover:text-[#3D2E1F] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                  Nome do Perfil
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs bg-white text-[#3D2E1F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                  Frase de Leitura Inicial (com acolhimento)
                </label>
                <textarea
                  rows={3}
                  value={formData.phrase || ''}
                  onChange={(e) => setFormData({ ...formData, phrase: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs bg-[#FAF8F5] text-[#3D2E1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                  Diretriz Central
                </label>
                <textarea
                  rows={3}
                  value={formData.guidance || ''}
                  onChange={(e) => setFormData({ ...formData, guidance: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs bg-[#FAF8F5] text-[#3D2E1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                  Recomendações Práticas
                </label>
                <textarea
                  rows={3}
                  value={formData.recommendations || ''}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs bg-[#FAF8F5] text-[#3D2E1F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 rounded-xl border border-[#D4C5A9] text-xs font-semibold text-[#6B5B4D]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B7355] hover:bg-[#5C4A32] text-white text-xs font-semibold shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
