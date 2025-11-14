import { Suspense, type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AnimalsPage from '@/pages/AnimalsPage';
import InstitutionsPage from '@/pages/InstitutionsPage';
import AdoptionFlowPage from '@/pages/AdoptionFlowPage';
import MyAdoptionsPage from '@/pages/MyAdoptionsPage';
import DonationFlowPage from '@/pages/DonationFlowPage';
import MyDonationsPage from '@/pages/MyDonationsPage';
import ConsultationsPage from '@/pages/ConsultationsPage';
import CitiesPage from '@/pages/CitiesPage';
import VeterinariansPage from '@/pages/VeterinariansPage';
import TutorsPage from '@/pages/TutorsPage';
import SurgeriesPage from '@/pages/SurgeriesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AppLayout from '@/layouts/AppLayout';
import { FullscreenLoader } from '@/components/ui/fullscreen-loader';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }: { children: ReactElement }) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/app/animais" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <AuthProvider>
      <Suspense fallback={<FullscreenLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<FullscreenLoader />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="dashboard"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />
            <Route path="animais" element={<AnimalsPage />} />
            <Route path="instituicoes" element={<InstitutionsPage />} />
            <Route path="consultas" element={<ConsultationsPage />} />
            <Route path="cidades" element={<CitiesPage />} />
            <Route path="veterinarios" element={<VeterinariansPage />} />
            <Route path="tutores" element={<TutorsPage />} />
            <Route path="cirurgias" element={<SurgeriesPage />} />

            <Route path="adocao" element={<AdoptionFlowPage />} />
            <Route path="minhas-adocoes" element={<MyAdoptionsPage />} />

            <Route path="doacao" element={<DonationFlowPage />} />
            <Route path="minhas-doacoes" element={<MyDonationsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
