import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load whiteboard components
const WhiteboardPage = lazy(() => import('../components/Whiteboard/Whiteboard'));

export const WhiteboardRoutes = () => (
  <Routes>
    <Route
      path="/whiteboard/:boardId"
      element={
        <ProtectedRoute>
          <ErrorBoundary 
            errorTitle="Erro ao carregar o Quadro Branco" 
            errorMessage="Não foi possível carregar o quadro branco. Por favor, tente novamente."
          >
            <Suspense fallback={<Loading />}>
              <WhiteboardPage />
            </Suspense>
          </ErrorBoundary>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default WhiteboardRoutes;
