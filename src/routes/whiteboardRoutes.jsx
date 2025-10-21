import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ProtectedRoute from '../components/ProtectedRoute';

// Placeholder para whiteboard (funcionalidade removida)
const WhiteboardPlaceholder = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Quadro Branco Desativado</h1>
      <p className="text-slate-600">Esta funcionalidade foi removida temporariamente.</p>
    </div>
  </div>
);

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
            <WhiteboardPlaceholder />
          </ErrorBoundary>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default WhiteboardRoutes;
