import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Loading from '../components/Loading';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Helper function for dynamic imports with error handling
const lazyLoad = (importFunction) => {
  return lazy(() => importFunction().catch(() => ({
    default: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error loading component</h2>
          <p className="mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    )
  })));
};

// Lazy load route components
const MeetingRoutes = lazyLoad(() => import('./meetingRoutes'));
const WhiteboardRoutes = lazyLoad(() => import('./whiteboardRoutes'));

// Lazy load components for better performance
const Dashboard = lazyLoad(() => import('../pages/Dashboard'));
const LandingPage = lazyLoad(() => import('../pages/LandingPage'));
const LoginPage = lazyLoad(() => import('../pages/LoginPage'));
const RegisterPage = lazyLoad(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazyLoad(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyLoad(() => import('../pages/ResetPasswordPage'));
const EmailConfirmationPage = lazyLoad(() => import('../pages/EmailConfirmationPage'));
const PricingPage = lazyLoad(() => import('../pages/PricingPage'));
const PrivacyPolicy = lazyLoad(() => import('../pages/PrivacyPolicy'));
const TermsOfUse = lazyLoad(() => import('../pages/TermsOfUse'));
const ImprovedDocumentationPage = lazyLoad(() => import('../pages/docs/DocumentationPage'));
const SpecCoveragePage = lazyLoad(() => import('../pages/admin/SpecCoveragePage'));
const ContactPage = lazyLoad(() => import('../pages/ContactPage'));
const BetaPage = lazyLoad(() => import('../pages/BetaPage'));
const LogoutPage = lazyLoad(() => import('../pages/LogoutPage'));
const JoinClassPage = lazyLoad(() => import('../pages/JoinClassPage'));
const UserProfilePage = lazyLoad(() => import('../pages/UserProfilePage'));

// Dashboard Components
const DashboardHome = lazyLoad(() => import('../components/dashboard/DashboardHome'));
const ClassesPage = lazyLoad(() => import('../components/dashboard/ClassesPage'));
const ClassDetailsPage = lazyLoad(() => import('../components/dashboard/ClassDetailsPage'));
const StudentsPage = lazyLoad(() => import('../components/students/StudentsPage'));
const StudentProfilePage = lazyLoad(() => import('../pages/dashboard/StudentProfilePage'));
const InviteStudentPage = lazyLoad(() => import('../pages/students/InviteStudentPage'));
const ActivitiesPage = lazyLoad(() => import('../components/dashboard/ActivitiesPage'));
const ActivityPage = lazyLoad(() => import('../pages/ActivityPage'));
const ReportsPage = lazyLoad(() => import('../components/dashboard/ReportsPage'));
const ChatbotPage = lazyLoad(() => import('../components/dashboard/ChatbotPageWrapper'));
const NotificationTest = lazyLoad(() => import('../pages/notifications/NotificationTest'));
const AcademicHistoryPage = lazyLoad(() => import('../pages/dashboard/AcademicHistoryPage'));
const PerformanceAnalyticsPage = lazyLoad(() => import('../pages/dashboard/PerformanceAnalyticsPage'));
const SettingsPage = lazyLoad(() => import('../components/dashboard/SettingsPage'));
const AgendaPage = lazyLoad(() => import('../components/dashboard/AgendaPageWrapper'));
const ActivitySubmissionsPage = lazyLoad(() => import('../pages/classes/ActivitySubmissionsPage'));
const CreateClassroomForm = lazyLoad(() => import('../components/classrooms/CreateClassroomForm'));
const CreateClassForm = lazyLoad(() => import('../components/classes/CreateClassForm'));
const ClassroomDetailsPage = lazyLoad(() => import('../pages/ClassroomDetailsPage'));
const ActivitiesListPage = lazyLoad(() => import('../pages/ActivitiesListPage'));
const CreateActivityPage = lazyLoad(() => import('../pages/CreateActivityPage'));
const DraftsPage = lazyLoad(() => import('../pages/activities/DraftsPage'));
const StudentActivitiesPage = lazyLoad(() => import('../pages/student/StudentActivitiesPage'));
const ActivityDetailsPage = lazyLoad(() => import('../components/activities/ActivityDetailsPage'));
const NotificationCenter = lazyLoad(() => import('../pages/notifications/NotificationCenter'));
const PrivacyPreferences = lazyLoad(() => import('@/components/PrivacyPreferences'));
const OnboardingPage = lazyLoad(() => import('../pages/OnboardingPage'));

// HMR test component only in development
const HMRTest = import.meta.env.DEV ? React.lazy(() => import('../hmr-test')) : null;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route
        path="/"
        element={
          <Suspense fallback={<Loading />}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<Loading />}>
            <RegisterPage />
          </Suspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<Loading />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<Loading />}>
            <ResetPasswordPage />
          </Suspense>
        }
      />
      <Route
        path="/confirm-email"
        element={
          <Suspense fallback={<Loading />}>
            <EmailConfirmationPage />
          </Suspense>
        }
      />
      <Route
        path="/pricing"
        element={
          <Suspense fallback={<Loading />}>
            <PricingPage />
          </Suspense>
        }
      />
      <Route
        path="/privacy"
        element={
          <Suspense fallback={<Loading />}>
            <PrivacyPolicy />
          </Suspense>
        }
      />
      <Route
        path="/terms"
        element={
          <Suspense fallback={<Loading />}>
            <TermsOfUse />
          </Suspense>
        }
      />
      <Route
        path="/docs"
        element={
          <Suspense fallback={<Loading />}>
            <ImprovedDocumentationPage />
          </Suspense>
        }
      />
      
      <Route
        path="/admin/spec-coverage"
        element={
          <Suspense fallback={<Loading />}>
            <SpecCoveragePage />
          </Suspense>
        }
      />
      <Route
        path="/beta"
        element={
          <Suspense fallback={<Loading />}>
            <BetaPage />
          </Suspense>
        }
      />
      <Route
        path="/contact"
        element={
          <Suspense fallback={<Loading />}>
            <ContactPage />
          </Suspense>
        }
      />
      <Route
        path="/privacy-preferences"
        element={
          <Suspense fallback={<Loading />}>
            <PrivacyPreferences />
          </Suspense>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <OnboardingPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/logout"
        element={
          <Suspense fallback={<Loading />}>
            <LogoutPage />
          </Suspense>
        }
      />
      <Route
        path="/join/:token"
        element={
          <Suspense fallback={<Loading />}>
            <JoinClassPage />
          </Suspense>
        }
      />

      {/* Development-only routes */}
      {import.meta.env.DEV && HMRTest && (
        <Route
          path="/hmr-test"
          element={
            <Suspense fallback={<Loading />}>
              <HMRTest />
            </Suspense>
          }
        />
      )}

      {/* Rotas Protegidas com Layout de Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ErrorBoundary errorTitle="Erro no Dashboard" errorMessage="Não foi possível carregar o dashboard. Tente recarregar a página.">
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <DashboardHome />
            </Suspense>
          }
        />
        <Route
          path="classes"
          element={
            <ErrorBoundary errorTitle="Erro ao carregar Turmas" errorMessage="Não foi possível carregar a página de turmas. Tente recarregar a página.">
              <Suspense fallback={<Loading />}>
                <ClassesPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="classes/new"
          element={
            <Suspense fallback={<Loading />}>
              <CreateClassForm />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId"
          element={
            <Suspense fallback={<Loading />}>
              <ClassDetailsPage />
            </Suspense>
          }
        />
        <Route
          path="students"
          element={
            <Suspense fallback={<Loading />}>
              <StudentsPage />
            </Suspense>
          }
        />
        <Route
          path="students/:id"
          element={
            <Suspense fallback={<Loading />}>
              <StudentProfilePage />
            </Suspense>
          }
        />
        <Route
          path="students/invite"
          element={
            <Suspense fallback={<Loading />}>
              <InviteStudentPage />
            </Suspense>
          }
        />
        <Route
          path="activities"
          element={
            <Suspense fallback={<Loading />}>
              <ActivitiesPage />
            </Suspense>
          }
        />
        <Route
          path="student/activities"
          element={
            <ProtectedRoute allowRoles={['student']}>
              <Suspense fallback={<Loading />}>
                <StudentActivitiesPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="activities/drafts"
          element={
            <Suspense fallback={<Loading />}>
              <DraftsPage />
            </Suspense>
          }
        />
        <Route
          path="activities/create"
          element={
            <Suspense fallback={<Loading />}>
              <CreateActivityPage />
            </Suspense>
          }
        />
        <Route
          path="activities/:id"
          element={
            <Suspense fallback={<Loading />}>
              <ActivityPage />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId/activities/:activityId/submissions"
          element={
            <Suspense fallback={<Loading />}>
              <ActivitySubmissionsPage />
            </Suspense>
          }
        />
        <Route
          path="activities/edit/:id"
          element={
            <Suspense fallback={<Loading />}>
              <ActivityPage mode="edit" />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<Loading />}>
              <ReportsPage />
            </Suspense>
          }
        />
        <Route
          path="calendar"
          element={
            <Suspense fallback={<Loading />}>
              <AgendaPage />
            </Suspense>
          }
        />
        <Route
          path="meetings/*"
          element={
            <Suspense fallback={<Loading />}>
              <MeetingRoutes />
            </Suspense>
          }
        />
        <Route
          path="chatbot"
          element={
            <Suspense fallback={<Loading />}>
              <ChatbotPage />
            </Suspense>
          }
        />
        <Route
          path="notification-test"
          element={
            <Suspense fallback={<Loading />}>
              <NotificationTest />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<Loading />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<Loading />}>
              <div>Página não encontrada</div>
            </Suspense>
          }
        />
      </Route>

      {/* Outras Rotas Protegidas */}
      <Route
        path="/classrooms"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <CreateClassForm />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/whiteboard/*"
        element={
          <Suspense fallback={<Loading />}>
            <WhiteboardRoutes />
          </Suspense>
        }
      />
      <Route
        path="/aluno/:studentId/historico"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <AcademicHistoryPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/:studentId/desempenho"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <PerformanceAnalyticsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms/:roomUuid"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <ClassroomDetailsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/atividades"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <ActivitiesListPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/atividades/criar"
        element={
          <ProtectedRoute requiredRoles="teacher">
            <Suspense fallback={<Loading />}>
              <CreateActivityPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <UserProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/atividades/:id"
        element={
          <ProtectedRoute requiredRoles={["teacher", "student"]}>
            <Suspense fallback={<Loading />}>
              <ActivityDetailsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <NotificationCenter />
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
