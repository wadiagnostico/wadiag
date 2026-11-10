import React, { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Headphones,
  HelpCircle,
  FileBadge,
  Palette,
  LogOut,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { dataService } from '../../services/dataService';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!dataService.isAdminAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    dataService.setAdminAuthenticated(false);
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Painel Principal' },
    { to: '/admin/avaliacoes', icon: Users, label: 'Avaliações' },
    { to: '/admin/audios', icon: Headphones, label: 'Áudios das Etapas' },
    { to: '/admin/perguntas', icon: HelpCircle, label: 'Perguntas e Etapas' },
    { to: '/admin/perfis', icon: FileBadge, label: 'Perfis e Regras' },
    { to: '/admin/configuracoes', icon: Palette, label: 'Personalização' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Admin Header */}
      <header className="bg-[#3D2E1F] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A96E] flex items-center justify-center text-[#3D2E1F] font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-base sm:text-lg tracking-tight leading-none text-[#FAF8F5]">
                Painel Administrativo
              </div>
              <div className="text-[10px] text-[#C9A96E] font-medium tracking-wider uppercase">
                Mapa dos Bloqueios • Larissa Maykot
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="text-xs text-[#E8D5A3] hover:text-white flex items-center gap-1 transition px-3 py-1.5 rounded-lg hover:bg-white/10"
              title="Abrir página pública em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver App Público</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-red-100 flex items-center gap-1 transition px-3 py-1.5 rounded-lg hover:bg-red-900/30"
              title="Sair do painel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#2C1F13] border-t border-white/10 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                      isActive
                        ? 'border-[#C9A96E] text-[#C9A96E] bg-white/5'
                        : 'border-transparent text-[#FAF8F5]/70 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};
