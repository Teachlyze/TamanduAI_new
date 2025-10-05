import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load meeting components
const MeetingsPage = lazy(() => import('../pages/meetings/MeetingsPageWrapper'));
const MeetingRoomPage = lazy(() => import('../pages/meetings/MeetingRoomPage'));

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
            <Suspense fallback={<Loading />}>
              <MeetingRoomPage />
            </Suspense>
          </ErrorBoundary>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default MeetingRoutes;
