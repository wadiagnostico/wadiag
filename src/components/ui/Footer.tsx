import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F4EFE6] border-t border-[#D4C5A9]/70 py-10 mt-16 text-center text-xs text-[#6B5B4D]">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-[#8B7355] font-serif text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-[#C9A96E]" />
          <span>Mapa dos Bloqueios — Larissa Maykot</span>
          <Sparkles className="w-4 h-4 text-[#C9A96E]" />
        </div>

        <p className="max-w-2xl mx-auto text-[#6B5B4D]/90 leading-relaxed text-[11px] sm:text-xs bg-white/50 p-4 rounded-xl border border-[#D4C5A9]/50">
          <strong className="text-[#3D2E1F]">Posicionamento e Responsabilidade:</strong> O Mapa é uma ferramenta educativa e de reflexão baseada em respostas autorrelatadas. Não é teste psicológico, diagnóstico clínico, avaliação médica ou instrumento científico validado. Os resultados devem ser acolhidos como tendências e pontos de atenção para seu desenvolvimento pessoal, nunca como rótulos definitivos.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#8B7355] pt-2">
          <span>Privacidade & LGPD Respeitada</span>
          <span>•</span>
          <Link to="/admin" className="hover:text-[#3D2E1F] flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Acesso Administrativo
          </Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
};
