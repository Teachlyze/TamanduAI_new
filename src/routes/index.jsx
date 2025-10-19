import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
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
const Dashboard = lazyLoad(() => import('../pages/DashboardHome'));
const LandingPage = lazyLoad(() => import('../pages/LandingPage'));
const LoginPage = lazyLoad(() => import('../pages/LoginPagePremium'));
const RegisterPage = lazyLoad(() => import('../pages/RegisterPagePremium'));
const RegisterTeacherPage = lazyLoad(() => import('../pages/RegisterTeacherPage'));
const ForgotPasswordPage = lazyLoad(() => import('../pages/auth/ForgotPasswordPagePremium'));
const ResetPasswordPage = lazyLoad(() => import('../pages/auth/ResetPasswordPagePremium'));
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
const JoinClassWithCodePage = lazyLoad(() => import('../pages/JoinClassWithCodePage'));
const UserProfilePage = lazyLoad(() => import('../pages/UserProfilePagePremium'));
const StrategicPlanPage = lazyLoad(() => import('../pages/StrategicPlanPage'));

// Dashboard Components
const RoleBasedDashboard = lazyLoad(() => import('../components/dashboard/RoleBasedDashboard'));
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
const AgendaPage = lazyLoad(() => import('../pages/AgendaPagePremium'));
const AnalyticsPage = lazyLoad(() => import('../pages/AnalyticsPagePremium'));
const ActivitySubmissionsPage = lazyLoad(() => import('../pages/classes/ActivitySubmissionsPage'));
const CreateClassroomForm = lazyLoad(() => import('../components/classrooms/CreateClassroomForm'));
const CreateClassForm = lazyLoad(() => import('../components/classes/CreateClassForm'));
const ClassroomsPagePremium = lazyLoad(() => import('../pages/ClassroomsPagePremium'));
const ActivitiesListPage = lazyLoad(() => import('../pages/ActivitiesListPagePremium'));
const CreateActivityPage = lazyLoad(() => import('../pages/CreateActivityPage'));
const ActivityErrorBoundary = lazyLoad(() => import('../components/ui/ActivityErrorBoundary'));
const DraftsPage = lazyLoad(() => import('../pages/activities/DraftsPage'));
const StudentActivitiesPage = lazyLoad(() => import('../pages/student/StudentActivitiesPage'));
const StudentGamificationPage = lazyLoad(() => import('../pages/student/StudentGamificationPage'));
const ActivityDetailsPage = lazyLoad(() => import('../components/activities/ActivityDetailsPage'));
const NotificationCenter = lazyLoad(() => import('../pages/notifications/NotificationCenter'));
const PrivacyPreferences = lazyLoad(() => import('@/components/PrivacyPreferences'));
const OnboardingPage = lazyLoad(() => import('../pages/OnboardingPage'));

// Additional pages
const StudentHistoryPage = lazyLoad(() => import('../pages/StudentHistoryPage'));
const JoinClassInvitationPage = lazyLoad(() => import('../pages/JoinClassInvitationPage'));
const ActivityPublishPage = lazyLoad(() => import('../pages/ActivityPublishPage'));
const VerifyEmailPage = lazyLoad(() => import('../pages/VerifyEmailPage'));
const ActivitySubmissionsPageNew = lazyLoad(() => import('../pages/activities/ActivitySubmissionsPage'));
const ClassActivitiesPage = lazyLoad(() => import('../pages/classes/ClassActivitiesPage'));
const ClassSchedulePage = lazyLoad(() => import('../pages/classes/ClassSchedulePage'));
const CorrectionsPage = lazyLoad(() => import('../pages/activities/CorrectionsPage'));
const UserProfileEditPage = lazyLoad(() => import('../pages/profile/UserProfileEditPage'));

// School pages
const SchoolDashboard = lazyLoad(() => import('../pages/school/SchoolDashboard'));
const SchoolTeachersPage = lazyLoad(() => import('../pages/school/SchoolTeachersPage'));
const SchoolClassesPage = lazyLoad(() => import('../pages/school/SchoolClassesPage'));
const SchoolReportsPage = lazyLoad(() => import('../pages/school/SchoolReportsPage'));
const SchoolCommsPage = lazyLoad(() => import('../pages/school/SchoolCommsPage'));
const SchoolSettingsPage = lazyLoad(() => import('../pages/school/SchoolSettingsPage'));
const SchoolRankingPage = lazyLoad(() => import('../pages/school/SchoolRankingPage'));
const SchoolStudentsPage = lazyLoad(() => import('../pages/school/SchoolStudentsPage'));
const SchoolAnalyticsPage = lazyLoad(() => import('../components/school/SchoolAnalyticsPage'));
const SchoolAnalyticsMLPage = lazyLoad(() => import('../pages/school/SchoolAnalyticsMLPage'));
const SchoolClassMembersPage = lazyLoad(() => import('../components/school/SchoolClassMembersPage'));
const InviteTeacherPage = lazyLoad(() => import('../pages/school/InviteTeacherPage'));
const RewardSettingsPage = lazyLoad(() => import('../pages/school/RewardSettingsPage'));

// Student pages
const StudentDashboard = lazyLoad(() => import('../pages/student/StudentDashboard'));
const StudentPerformancePage = lazyLoad(() => import('../pages/student/StudentPerformancePage'));
const StudentClassesPage = lazyLoad(() => import('../components/student/StudentClassesPage'));
const StudentClassDetailsPage = lazyLoad(() => import('../components/student/StudentClassDetailsPage'));
const StudentActivityDetailsPage = lazyLoad(() => import('../components/student/StudentActivityDetailsPage'));
const StudentCalendarPage = lazyLoad(() => import('../components/student/StudentCalendarPage'));
const StudentRankingPage = lazyLoad(() => import('../components/student/StudentRankingPage'));
const StudentDiscussionPage = lazyLoad(() => import('../components/student/StudentDiscussionPage'));
const StudentMissionsPage = lazyLoad(() => import('../components/student/StudentMissionsPage'));

// Teacher pages
const TeacherDashboard = lazyLoad(() => import('../pages/teacher/TeacherDashboard'));
const TeacherClassroomsPage = lazyLoad(() => import('../pages/teacher/TeacherClassroomsPage'));
const TeacherActivitiesPage = lazyLoad(() => import('../pages/teacher/TeacherActivitiesPage'));
const TeacherStudentsPage = lazyLoad(() => import('../pages/teacher/TeacherStudentsPage'));
const TeacherRankingPage = lazyLoad(() => import('../pages/teacher/TeacherRankingPage'));
const TeacherAnalyticsPage = lazyLoad(() => import('../components/teacher/TeacherAnalyticsPage'));
const TeacherClassMembersPage = lazyLoad(() => import('../components/teacher/TeacherClassMembersPage'));
const TeacherChatbotSettingsPage = lazyLoad(() => import('../components/teacher/TeacherChatbotSettingsPage'));
const StudentDetailPage = lazyLoad(() => import('../pages/teacher/StudentDetailPage'));
const MissionsListPage = lazyLoad(() => import('../pages/teacher/MissionsListPage'));
const CreateMissionPage = lazyLoad(() => import('../pages/teacher/CreateMissionPage'));
const MissionDetailPage = lazyLoad(() => import('../pages/teacher/MissionDetailPage'));
const QuestionBankPage = lazyLoad(() => import('../pages/teacher/QuestionBankPage'));
const CreateQuestionPage = lazyLoad(() => import('../pages/teacher/CreateQuestionPage'));
const AnalyticsMLPage = lazyLoad(() => import('../pages/teacher/AnalyticsMLPage'));

// Layouts
const StudentLayout = lazyLoad(() => import('../components/student/StudentLayout'));
const TeacherLayout = lazyLoad(() => import('../components/teacher/TeacherLayout'));
const SchoolLayout = lazyLoad(() => import('../components/school/SchoolLayout'));

// Error pages
const NotFound = lazyLoad(() => import('../pages/errors/NotFound'));
const AccessDenied = lazyLoad(() => import('../pages/errors/AccessDenied'));

// HMR test component only in development
const HMRTest = import.meta.env.DEV ? React.lazy(() => import('../hmr-test')) : null;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      {/* Redirects para caminhos legados/errados */}
      <Route path="/dashboard/student/*" element={<Navigate to="/students" replace />} />
      <Route path="/dashboard/school/*" element={<Navigate to="/school" replace />} />
      <Route path="/student/*" element={<Navigate to="/students" replace />} />
      <Route path="/escola/*" element={<Navigate to="/school" replace />} />
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
        path="/register/teacher"
        element={
          <Suspense fallback={<Loading />}>
            <RegisterTeacherPage />
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
        path="/strategic-plan"
        element={
          <Suspense fallback={<Loading />}>
            <StrategicPlanPage />
          </Suspense>
        }
      />
      <Route
        path="/verify-email"
        element={
          <Suspense fallback={<Loading />}>
            <VerifyEmailPage />
          </Suspense>
        }
      />
      <Route
        path="/join-class/:token"
        element={
          <Suspense fallback={<Loading />}>
            <JoinClassInvitationPage />
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
      <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />

      {/* Profile Edit - Accessible for all authenticated users */}
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <Suspense fallback={<Loading />}>
              <UserProfileEditPage />
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
        path="/join/:invitationCode"
        element={
          <Suspense fallback={<Loading />}>
            <JoinClassPage />
          </Suspense>
        }
      />
      <Route
        path="/join-class"
        element={
          <Suspense fallback={<Loading />}>
            <JoinClassWithCodePage />
          </Suspense>
        }
      />
      <Route
        path="/join-class/:code"
        element={
          <Suspense fallback={<Loading />}>
            <JoinClassWithCodePage />
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

      {/* ========================================
          ROTAS DE ESTUDANTES - /students/*
          ======================================== */}
      <Route
        path="/students"
        element={
          <RoleProtectedRoute allowedRoles={['student']}>
            <ErrorBoundary errorTitle="Erro" errorMessage="Não foi possível carregar a página. Tente recarregar.">
              <Suspense fallback={<Loading />}>
                <StudentLayout />
              </Suspense>
            </ErrorBoundary>
          </RoleProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <StudentDashboard />
            </Suspense>
          }
        />
        <Route
          path="activities"
          element={
            <Suspense fallback={<Loading />}>
              <StudentActivitiesPage />
            </Suspense>
          }
        />
        <Route
          path="classes"
          element={
            <Suspense fallback={<Loading />}>
              <StudentClassesPage />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId"
          element={
            <Suspense fallback={<Loading />}>
              <StudentClassDetailsPage />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId/discussions/:discussionId"
          element={
            <Suspense fallback={<Loading />}>
              <StudentDiscussionPage />
            </Suspense>
          }
        />
        <Route
          path="gamification"
          element={
            <Suspense fallback={<Loading />}>
              <StudentGamificationPage />
            </Suspense>
          }
        />
        <Route
          path="quizzes"
          element={
            <Suspense fallback={<Loading />}>
              {React.createElement(lazyLoad(() => import('../pages/student/StudentPublicQuizzesPage')))}
            </Suspense>
          }
        />
        <Route
          path="quizzes/:quizId"
          element={
            <Suspense fallback={<Loading />}>
              {React.createElement(lazyLoad(() => import('../pages/student/StudentQuizPlayPage')))}
            </Suspense>
          }
        />
        <Route
          path="performance"
          element={
            <Suspense fallback={<Loading />}>
              <StudentPerformancePage />
            </Suspense>
          }
        />
        <Route
          path="calendar"
          element={
            <Suspense fallback={<Loading />}>
              <StudentCalendarPage />
            </Suspense>
          }
        />
        <Route
          path="ranking"
          element={
            <Suspense fallback={<Loading />}>
              <StudentRankingPage />
            </Suspense>
          }
        />
        <Route
          path="missions"
          element={
            <Suspense fallback={<Loading />}>
              <StudentMissionsPage />
            </Suspense>
          }
        />
        <Route
          path="history"
          element={
            <Suspense fallback={<Loading />}>
              <StudentHistoryPage />
            </Suspense>
          }
        />
        <Route
          path="activities/:id"
          element={
            <Suspense fallback={<Loading />}>
              <StudentActivityDetailsPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<Loading />}>
              <NotificationCenter />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<Loading />}>
              <StudentDetailPage />
            </Suspense>
          }
        />
      </Route>

      {/* ========================================
          ROTAS DE PROFESSORES - /dashboard/*
          ======================================== */}
      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <ErrorBoundary errorTitle="Erro no Dashboard" errorMessage="Não foi possível carregar o dashboard. Tente recarregar a página.">
              <Suspense fallback={<Loading />}>
                <TeacherLayout />
              </Suspense>
            </ErrorBoundary>
          </RoleProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <TeacherDashboard />
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
              <TeacherStudentsPage />
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
              <TeacherActivitiesPage />
            </Suspense>
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
          path="activities/new"
          element={
            <Suspense fallback={<Loading />}>
              <ActivityErrorBoundary>
                <CreateActivityPage />
              </ActivityErrorBoundary>
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
          path="analytics"
          element={
            <Suspense fallback={<Loading />}>
              <AnalyticsPage />
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
          path="ranking"
          element={
            <Suspense fallback={<Loading />}>
              <TeacherRankingPage />
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
          path="analytics-advanced"
          element={
            <Suspense fallback={<Loading />}>
              <TeacherAnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="analytics-ml/:classId"
          element={
            <Suspense fallback={<Loading />}>
              <AnalyticsMLPage />
            </Suspense>
          }
        />
        <Route
          path="question-bank"
          element={
            <Suspense fallback={<Loading />}>
              <QuestionBankPage />
            </Suspense>
          }
        />
        <Route
          path="question-bank/create"
          element={
            <Suspense fallback={<Loading />}>
              <CreateQuestionPage />
            </Suspense>
          }
        />
        <Route
          path="corrections"
          element={
            <Suspense fallback={<Loading />}>
              <CorrectionsPage />
            </Suspense>
          }
        />
        <Route
          path="activities/:activityId/submissions"
          element={
            <Suspense fallback={<Loading />}>
              <ActivitySubmissionsPageNew />
            </Suspense>
          }
        />
        <Route
          path="activities/:activityId/publish"
          element={
            <Suspense fallback={<Loading />}>
              <ActivityPublishPage />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId/activities"
          element={
            <Suspense fallback={<Loading />}>
              <ClassActivitiesPage />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId/schedule"
          element={
            <Suspense fallback={<Loading />}>
              <ClassSchedulePage />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId/members"
          element={
            <Suspense fallback={<Loading />}>
              <TeacherClassMembersPage />
            </Suspense>
          }
        />
        <Route
          path="chatbot/settings"
          element={
            <Suspense fallback={<Loading />}>
              <TeacherChatbotSettingsPage />
            </Suspense>
          }
        />
        <Route
          path="drafts"
          element={
            <Suspense fallback={<Loading />}>
              <DraftsPage />
            </Suspense>
          }
        />
        <Route
          path="students/:studentId"
          element={
            <Suspense fallback={<Loading />}>
              <StudentDetailPage />
            </Suspense>
          }
        />
        <Route
          path="students/profile"
          element={
            <Suspense fallback={<Loading />}>
              <StudentDetailPage />
            </Suspense>
          }
        />
        <Route
          path="missions"
          element={
            <Suspense fallback={<Loading />}>
              <MissionsListPage />
            </Suspense>
          }
        />
        <Route
          path="missions/create"
          element={
            <Suspense fallback={<Loading />}>
              <CreateMissionPage />
            </Suspense>
          }
        />
        <Route
          path="missions/:missionId"
          element={
            <Suspense fallback={<Loading />}>
              <MissionDetailPage />
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
              <NotFound />
            </Suspense>
          }
        />
      </Route>

      {/* ========================================
          ROTAS DE ESCOLA - /school/*
          ======================================== */}
      <Route
        path="/school"
        element={
          <RoleProtectedRoute allowedRoles={['school']}>
            <ErrorBoundary errorTitle="Erro" errorMessage="Não foi possível carregar a página. Tente recarregar.">
              <Suspense fallback={<Loading />}>
                <SchoolLayout />
              </Suspense>
            </ErrorBoundary>
          </RoleProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <SchoolDashboard />
            </Suspense>
          }
        />
        {/* Compat: garantir correspondência explícita da raiz "/school" */}
        <Route
          path=""
          element={
            <Suspense fallback={<Loading />}>
              <SchoolDashboard />
            </Suspense>
          }
        />
        <Route
          path="teachers"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolTeachersPage />
            </Suspense>
          }
        />
        <Route
          path="classes"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolClassesPage />
            </Suspense>
          }
        />
        <Route
          path="students"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolStudentsPage />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolReportsPage />
            </Suspense>
          }
        />
        <Route
          path="comms"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolCommsPage />
            </Suspense>
          }
        />
        <Route
          path="ranking"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolRankingPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolSettingsPage />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<Loading />}>
              <NotificationCenter />
            </Suspense>
          }
        />
        <Route
          path="analytics-advanced"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolAnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="analytics-ml"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolAnalyticsMLPage />
            </Suspense>
          }
        />
        <Route
          path="classes/:classId/members"
          element={
            <Suspense fallback={<Loading />}>
              <SchoolClassMembersPage />
            </Suspense>
          }
        />
        <Route
          path="invite-teacher"
          element={
            <Suspense fallback={<Loading />}>
              <InviteTeacherPage />
            </Suspense>
          }
        />
        <Route
          path="rewards"
          element={
            <Suspense fallback={<Loading />}>
              <RewardSettingsPage />
            </Suspense>
          }
        />
        <Route
          path="students/:studentId"
          element={
            <Suspense fallback={<Loading />}>
              <StudentDetailPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<Loading />}>
              <NotFound />
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
              <ClassroomsPagePremium />
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
              <ActivityErrorBoundary>
                <CreateActivityPage />
              </ActivityErrorBoundary>
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

      {/* Rota de Acesso Negado */}
      <Route
        path="/access-denied"
        element={
          <Suspense fallback={<Loading />}>
            <AccessDenied />
          </Suspense>
        }
      />

      {/* 404 - Deve ser a última rota */}
      <Route
        path="*"
        element={
          <Suspense fallback={<Loading />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
