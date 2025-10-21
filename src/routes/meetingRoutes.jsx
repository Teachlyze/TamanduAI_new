import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load meeting components
const MeetingsPage = lazy(() => import('../pages/meetings/MeetingsPageWrapper'));

// Placeholder para sala de reunião (Agora SDK removido)
const MeetingRoomPlaceholder = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Salas de Reunião Desativadas</h1>
      <p className="text-slate-600">Esta funcionalidade foi removida temporariamente.</p>
    </div>
  </div>
);

export const MeetingRoutes = () => (
  <Routes>
    <Route
      index
      element={
        <ErrorBoundary 
          errorTitle="Erro ao carregar Reuniões" 
          errorMessage="Não foi possível carregar a página de reuniões."
        >
          <Suspense fallback={<Loading />}>
            <MeetingsPage />
          </Suspense>
        </ErrorBoundary>
      }
    />
    <Route
      path=":meetingId"
      element={
        <ProtectedRoute>
          <ErrorBoundary 
            errorTitle="Erro na Sala de Reunião" 
            errorMessage="Não foi possível carregar a sala de reunião."
          >
            <MeetingRoomPlaceholder />
          </ErrorBoundary>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default MeetingRoutes;
