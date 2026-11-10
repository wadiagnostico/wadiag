import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, ShieldCheck, History } from 'lucide-react';
import { PlatformSettings } from '../../types';

interface NavbarProps {
  settings?: PlatformSettings;
  progressPercent?: number;
  currentStepLabel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  progressPercent,
  currentStepLabel,
}) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#D4C5A9]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#5C4A32] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-[#FAF8F5]" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg sm:text-xl text-[#3D2E1F] tracking-tight block leading-none">
              {settings?.platform_name || 'Mapa dos Bloqueios'}
            </span>
            <span className="text-[11px] text-[#8B7355] font-medium tracking-wide">
              Larissa Maykot
            </span>
          </div>
        </Link>

        {/* Progress or Actions */}
        <div className="flex items-center gap-3">
          {typeof progressPercent === 'number' && (
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-[#8B7355]">
                {currentStepLabel || `Progresso: ${progressPercent}%`}
              </span>
              <div className="w-32 h-2 bg-[#EAE0D0] rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-[#C9A96E] to-[#8B7355] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <Link
            to="/historico"
            className="p-2 text-[#6B5B4D] hover:text-[#3D2E1F] hover:bg-[#F0E6D6]/50 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
            title="Histórico de avaliações"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">Histórico</span>
          </Link>

          <Link
            to="/admin"
            className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-medium ${
              isAdmin
                ? 'bg-[#8B7355] text-white shadow-sm'
                : 'text-[#6B5B4D] hover:text-[#3D2E1F] hover:bg-[#F0E6D6]/50'
            }`}
            title="Área Administrativa"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">Área ADM</span>
          </Link>
        </div>
      </div>

      {/* Mobile progress bar line */}
      {typeof progressPercent === 'number' && (
        <div className="sm:hidden w-full h-1 bg-[#EAE0D0]">
          <div
            className="h-full bg-gradient-to-r from-[#C9A96E] to-[#8B7355] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </header>
  );
};
