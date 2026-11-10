import React, { useState, useEffect } from 'react';
import { Palette, Save, CheckCircle2, Upload, Sparkles } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { PlatformSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    id: '',
    platform_name: 'Mapa dos Bloqueios',
    subtitle: 'Diagnóstico de mentalidade, comportamento e prosperidade',
    logo_url: null,
    primary_color: '#8B7355',
    secondary_color: '#C9A96E',
    accent_color: '#FAF8F5',
    welcome_message:
      'Descubra quais padrões de pensamento, comportamento e escolhas podem estar impedindo você de construir a vida que deseja.',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    dataService.getSettings().then((sett) => {
      setSettings(sett);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.updateSettings(settings);
    setNotification('Configurações visuais salvas com sucesso!');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      setSettings((prev) => ({ ...prev, logo_url: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-[#8B7355]">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4C5A9]/60 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2E1F] flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-[#8B7355]" />
            Personalização Visual & Textos
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5B4D] mt-1">
            Configure o nome do diagnóstico, mensagem de abertura, logotipo e paleta da plataforma.
          </p>
        </div>

        {notification && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#D4C5A9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Nomes e Textos */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-[#3D2E1F] border-b border-[#D4C5A9]/40 pb-2">
            Identidade do Produto
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
              Nome da Plataforma
            </label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D4C5A9] text-xs sm:text-sm bg-[#FAF8F5] text-[#3D2E1F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
              Subtítulo do Produto
            </label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D4C5A9] text-xs sm:text-sm bg-[#FAF8F5] text-[#3D2E1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
              Mensagem de Abertura / Boas-Vindas
            </label>
            <textarea
              rows={3}
              value={settings.welcome_message}
              onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D4C5A9] text-xs sm:text-sm bg-[#FAF8F5] text-[#3D2E1F]"
            />
          </div>
        </div>

        {/* Cores da Identidade Visual */}
        <div className="space-y-4 pt-4 border-t border-[#D4C5A9]/40">
          <h3 className="font-serif font-bold text-base text-[#3D2E1F]">
            Paleta de Cores Recomendada (Documento Oficial)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                Cor Primária (Marrom Terra)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-[#D4C5A9]"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                Cor Secundária (Dourado Discreto)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-[#D4C5A9]"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D2E1F] mb-1">
                Fundo (Off-White / Bege)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-[#D4C5A9]"
                />
                <input
                  type="text"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4C5A9] text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-4 pt-4 border-t border-[#D4C5A9]/40">
          <h3 className="font-serif font-bold text-base text-[#3D2E1F]">
            Logomarca
          </h3>

          <div className="flex items-center gap-4">
            {settings.logo_url ? (
              <div className="w-16 h-16 rounded-2xl border border-[#D4C5A9] overflow-hidden bg-[#FAF8F5] flex items-center justify-center p-2">
                <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl border border-dashed border-[#D4C5A9] bg-[#FAF8F5] flex items-center justify-center text-xs text-[#9B8B7D]">
                Sem logo
              </div>
            )}

            <div>
              <label className="cursor-pointer bg-[#FAF8F5] hover:bg-[#F0E6D6] border border-[#D4C5A9] px-4 py-2 rounded-xl text-xs font-semibold text-[#8B7355] inline-flex items-center gap-2 transition shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Enviar Logomarca (.png, .svg)</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-[11px] text-[#9B8B7D] mt-1">Formato ideal: PNG transparente ou SVG com 400x120px.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#D4C5A9]/40 flex justify-end">
          <button
            type="submit"
            className="bg-[#8B7355] hover:bg-[#5C4A32] text-white font-semibold py-3 px-6 rounded-xl shadow-md transition flex items-center gap-2 text-xs sm:text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Personalização</span>
          </button>
        </div>
      </form>
    </div>
  );
};
