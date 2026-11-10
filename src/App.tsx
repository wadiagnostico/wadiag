import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/public/Home';
import { Quiz } from './pages/public/Quiz';
import { Results } from './pages/public/Results';
import { History } from './pages/public/History';

// Admin
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAssessments } from './pages/admin/AdminAssessments';
import { AdminAudios } from './pages/admin/AdminAudios';
import { AdminQuestions } from './pages/admin/AdminQuestions';
import { AdminProfiles } from './pages/admin/AdminProfiles';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/diagnostico/:id" element={<Quiz />} />
        <Route path="/resultado/:id" element={<Results />} />
        <Route path="/historico" element={<History />} />

        {/* Rotas Administrativas */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="avaliacoes" element={<AdminAssessments />} />
          <Route path="audios" element={<AdminAudios />} />
          <Route path="perguntas" element={<AdminQuestions />} />
          <Route path="perfis" element={<AdminProfiles />} />
          <Route path="configuracoes" element={<AdminSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
