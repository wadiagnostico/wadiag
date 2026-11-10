import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Compass } from 'lucide-react';
import { dataService } from '../../services/dataService';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Senha de acesso definida pela proprietária
    const validKeys = [
      'Maykot2026On',
    ];

    setTimeout(() => {
      if (validKeys.includes(password.trim())) {
        dataService.setAdminAuthenticated(true);
        navigate('/admin/dashboard');
      } else {
        setErrorMsg('Senha administrativa incorreta. Acesso restrito à proprietária.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-[#D4C5A9] rounded-3xl p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#8B7355]/10 border border-[#8B7355]/20 flex items-center justify-center text-[#8B7355] mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#3D2E1F]">
            Área Administrativa
          </h1>
          <p className="text-xs text-[#6B5B4D]">
            Acesso exclusivo e protegido da gestão do Mapa dos Bloqueios.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3D2E1F] mb-1.5">
              Senha de Acesso Restrito
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8B7355] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Digite a senha de administradora..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D4C5A9] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-[#FAF8F5]"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-[#8B7355] hover:bg-[#5C4A32] disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? <span>Validando...</span> : <span>Entrar no Painel</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-[#8B7355] hover:underline"
          >
            ← Voltar para a página pública
          </button>
        </div>
      </div>
    </div>
  );
};
