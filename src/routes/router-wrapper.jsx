import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import { ErrorFallback, Loading } from '@/components/shared/ErrorComponents';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import App from '../App';

// Sistema avançado de carregamento dinâmico com prefetching
const pageModules = import.meta.glob([
  '../pages/**/*.jsx',
  '../pages/*.jsx',
  '../pages/classes/*.jsx',
  '../pages/activities/*.jsx',
  '../pages/meetings/*.jsx',
  '../pages/students/*.jsx',
  '../pages/errors/*.jsx',
  '../components/**/*.jsx',
  '../components/*/*.jsx',
  '../components/*/*/*.jsx',
]);
// console.log('Available page modules:', Object.keys(pageModules));

// Sistema inteligente de lazy loading com prefetching
const createLazyComponent = (componentName, options = {}) => {
  const {
    priority = 'normal', // 'high', 'normal', 'low'
    prefetchOnHover = false,
    preloadOnRouteChange = true
  } = options;

  const lazyComponent = lazy(() => {
    // console.log(`Carregando componente: ${componentName} (prioridade: ${priority})`);

    // Buscar o módulo correspondente
    const possiblePaths = [
      `../pages/${componentName}.jsx`,
      `../pages/activities/${componentName}.jsx`,
      `../pages/meetings/${componentName}.jsx`,
      `../pages/errors/${componentName}.jsx`,
      `../pages/dashboard/${componentName}.jsx`,
      `../pages/students/${componentName}.jsx`,
      `../components/${componentName}.jsx`,
      `../components/classes/${componentName}.jsx`,
      `../components/activities/${componentName}.jsx`,
      `../components/meetings/${componentName}.jsx`,
      `../components/errors/${componentName}.jsx`,
      `../components/dashboard/${componentName}.jsx`,
      `../components/students/${componentName}.jsx`,
    ];

    let loader = null;
    for (const possiblePath of possiblePaths) {
      if (pageModules[possiblePath]) {
        loader = pageModules[possiblePath];
        break;
      }
    }

    if (!loader) {
      const entry = Object.entries(pageModules).find(([key]) => key.endsWith(`/${componentName}.jsx`));
      if (entry) {
        loader = entry[1];
      }
    }

    if (!loader) {
      console.error(`Componente ${componentName} não encontrado. Available:`, Object.keys(pageModules));
      return import(/* @vite-ignore */ `../pages/${componentName}.jsx`);
    }

    return loader()
      .then(module => {
        // console.log(`✅ Componente ${componentName} carregado com sucesso`);

        // Pré-carregar componentes relacionados baseado na prioridade
        if (priority === 'high' && preloadOnRouteChange) {
          setTimeout(() => {
            preloadRelatedComponents(componentName);
          }, 1000);
        }

        return { default: module.default };
      })
      .catch(error => {
        console.error(`❌ Erro ao carregar ${componentName}:`, error);
        throw error;
      });
  });

  // Adicionar funcionalidades de prefetching se habilitado
  if (prefetchOnHover && typeof window !== 'undefined') {
    return Object.assign(lazyComponent, {
      _prefetchTrigger: null,
      preload: () => lazyComponent._ctor || lazyComponent,
    });
  }

  return lazyComponent;
};

// Função para pré-carregar componentes relacionados
const preloadRelatedComponents = (currentComponent) => {
  const relatedComponents = {
    Dashboard: ['ActivitiesListPage', 'ClassroomsPage'],
    LandingPage: ['LoginPagePremium', 'RegisterPagePremium'],
    LoginPagePremium: ['Dashboard', 'ForgotPasswordPage'],
    ClassroomsPage: ['ClassDetailsPage', 'CreateActivityPage'],
    ActivitiesListPage: ['CreateActivityPage', 'ActivityPage'],
  };

  const related = relatedComponents[currentComponent] || [];
  related.forEach(componentName => {
    const lazyComponent = createLazyComponent(componentName, { priority: 'low' });
    // Pré-carregar em background
    lazyComponent._ctor = lazyComponent._payload._result;
  });
};

// Componentes carregados dinamicamente com diferentes prioridades
const LandingPage = createLazyComponent('LandingPage', { priority: 'high', prefetchOnHover: true });
const Dashboard = createLazyComponent('Dashboard', { priority: 'high' });
const LoginPage = createLazyComponent('LoginPagePremium', { priority: 'normal' });
const RegisterPage = createLazyComponent('RegisterPagePremium', { priority: 'normal' });
const DocumentationPage = createLazyComponent('docs/DocumentationPage', { priority: 'normal' });
const PricingPage = createLazyComponent('PricingPage', { priority: 'normal' });
const ContactPage = createLazyComponent('ContactPage', { priority: 'normal' });
const PrivacyPolicyPage = createLazyComponent('PrivacyPolicy', { priority: 'low' });
const TermsOfUsePage = createLazyComponent('TermsOfUse', { priority: 'low' });
const CookiesPolicyPage = createLazyComponent('CookiesPolicy', { priority: 'low' });
const PrivacyPreferencesPage = createLazyComponent('PrivacyPreferences', { priority: 'low' });
const ForgotPasswordPage = createLazyComponent('auth/ForgotPasswordPagePremium', { priority: 'low' });
const ResetPasswordPage = createLazyComponent('auth/ResetPasswordPagePremium', { priority: 'low' });
const VerifyEmailPage = createLazyComponent('VerifyEmailPage', { priority: 'low' });
const ClassroomsPage = createLazyComponent('ClassroomsPagePremium', { priority: 'normal' });
const ClassDetailPage = createLazyComponent('classes/ClassDetailsPagePremium', { priority: 'normal' });
const ClassOverview = createLazyComponent('classes/ClassDetailsPagePremium', { priority: 'normal' });
const ClassStudents = createLazyComponent('classes/ClassDetailsPagePremium', { priority: 'normal' });
const ClassActivities = createLazyComponent('classes/ClassActivitiesPage', { priority: 'normal' });
const ClassSettings = createLazyComponent('classes/ClassDetailsPagePremium', { priority: 'normal' });
const MeetingsPage = createLazyComponent('MeetingDetailsPage', { priority: 'normal' });
const CreateMeetingPage = createLazyComponent('MeetingDetailsPage', { priority: 'normal' });
const MeetingDetailPage = createLazyComponent('MeetingDetailsPage', { priority: 'normal' });
const ActivitiesPage = createLazyComponent('ActivitiesListPagePremium', { priority: 'normal' });
const DraftsPage = createLazyComponent('activities/DraftsPage', { priority: 'normal' });
const CreateActivityPage = createLazyComponent('CreateActivityPage', { priority: 'normal' });
const ActivityDetailPage = createLazyComponent('ActivityPage', { priority: 'normal' });
const ProfilePage = createLazyComponent('UserProfilePagePremium', { priority: 'low' });
const SettingsPage = createLazyComponent('UserProfilePagePremium', { priority: 'low' });
const StudentsPage = createLazyComponent('StudentsPagePremium', { priority: 'normal' });
const AgendaPage = createLazyComponent('AgendaPagePremium', { priority: 'normal' });
const ReportsPage = createLazyComponent('ReportsPagePremium', { priority: 'normal' });
const ChatbotPage = createLazyComponent('ChatbotPagePremium', { priority: 'normal' });
const NotFoundPage = createLazyComponent('errors/NotFoundPage', { priority: 'low' });
const OnboardingPage = createLazyComponent('OnboardingPage', { priority: 'normal' });
const DashboardHome = createLazyComponent('DashboardHome', { priority: 'high' });
const RoleBasedDashboard = createLazyComponent('dashboard/RoleBasedDashboard', { priority: 'high' });

// New Premium Pages
const CorrectionsPage = createLazyComponent('activities/CorrectionsPage', { priority: 'normal' });
const SubmitActivityPage = createLazyComponent('activities/SubmitActivityPage', { priority: 'normal' });
const TasksKanbanPage = createLazyComponent('tasks/TasksKanbanPage', { priority: 'normal' });
const AnalyticsPage = createLazyComponent('analytics/AnalyticsPage', { priority: 'normal' });
const StudentDetailsPage = createLazyComponent('students/StudentDetailsPage', { priority: 'normal' });
const ChatbotConfigPage = createLazyComponent('chatbot/ChatbotConfigPage', { priority: 'normal' });
// Student Pages
const StudentDashboard = createLazyComponent('student/StudentDashboard', { priority: 'normal' });
const StudentActivitiesPage = createLazyComponent('student/StudentActivitiesPage', { priority: 'normal' });
const StudentGamificationPage = createLazyComponent('student/StudentGamificationPage', { priority: 'normal' });
const StudentPerformancePage = createLazyComponent('student/StudentPerformancePage', { priority: 'normal' });
const StudentPublicQuizzesPage = createLazyComponent('student/StudentPublicQuizzesPage', { priority: 'normal' });
const StudentQuizPlayPage = createLazyComponent('student/StudentQuizPlayPage', { priority: 'normal' });
const NotificationCenter = createLazyComponent('notifications/NotificationCenter', { priority: 'normal' });

// Teacher Pages
const TeacherDashboard = createLazyComponent('teacher/TeacherDashboard', { priority: 'normal' });
const TeacherClassroomsPage = createLazyComponent('teacher/TeacherClassroomsPage', { priority: 'normal' });
const TeacherActivitiesPage = createLazyComponent('teacher/TeacherActivitiesPage', { priority: 'normal' });
const TeacherStudentsPage = createLazyComponent('teacher/TeacherStudentsPage', { priority: 'normal' });

// School Pages
const SchoolDashboard = createLazyComponent('school/SchoolDashboard', { priority: 'normal' });
const SchoolTeachersPage = createLazyComponent('school/SchoolTeachersPage', { priority: 'normal' });
const SchoolClassesPage = createLazyComponent('school/SchoolClassesPage', { priority: 'normal' });
const SchoolStudentsPage = createLazyComponent('school/SchoolStudentsPage', { priority: 'normal' });
const SchoolReportsPage = createLazyComponent('school/SchoolReportsPage', { priority: 'normal' });
const SchoolCommsPage = createLazyComponent('school/SchoolCommsPage', { priority: 'normal' });
const SchoolRankingPage = createLazyComponent('school/SchoolRankingPage', { priority: 'normal' });
const SchoolSettingsPage = createLazyComponent('school/SchoolSettingsPage', { priority: 'normal' });

// Public Pages
const BetaPage = createLazyComponent('BetaPage', { priority: 'normal' });
const UserProfileEditPage = createLazyComponent('profile/UserProfileEditPage', { priority: 'low' });
const StrategicPlanPage = createLazyComponent('StrategicPlanPage', { priority: 'low' });

// Component to wrap protected routes with enhanced error boundaries
const withProtectedRoute = (Component, name) => {
  // console.log(`🔒 Criando rota protegida para: ${name}`);
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Carregando {name}...
              </p>
            </div>
          </div>
        }
      >
        <Component />
      </Suspense>
    </ProtectedRoute>
  );
};

// Component to wrap public routes
const withPublicRoute = (Component, name) => {
  // console.log(`🌐 Criando rota pública para: ${name}`);
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Carregando página...
            </p>
          </div>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
};


// console.log('Criando configuração de rotas...');

// Create the router instance (support subpath deployments via basename)
const basename = (import.meta?.env?.BASE_URL || import.meta?.env?.VITE_BASE_PATH || '/').replace(/\/$/, '') || '/';
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <ErrorFallback />,
    children: [
      // Public routes
      {
        index: true,
        element: withPublicRoute(LandingPage, 'LandingPage')
      },
      {
        path: 'login',
        element: withPublicRoute(LoginPage, 'LoginPage')
      },
      {
        path: 'register',
        element: withPublicRoute(RegisterPage, 'RegisterPage')
      },
      {
        path: 'verify-email',
        element: withPublicRoute(VerifyEmailPage, 'VerifyEmailPage')
      },
      {
        path: 'docs',
        element: withPublicRoute(DocumentationPage, 'DocumentationPage')
      },
      {
        path: 'pricing',
        element: withPublicRoute(PricingPage, 'PricingPage')
      },
      {
        path: 'contact',
        element: withPublicRoute(ContactPage, 'ContactPage')
      },
      {
        path: 'onboarding',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'forgot-password',
        element: withPublicRoute(ForgotPasswordPage, 'ForgotPasswordPage')
      },
      {
        path: 'reset-password',
        element: withPublicRoute(ResetPasswordPage, 'ResetPasswordPage')
      },
      {
        path: 'privacy-policy',
        element: withPublicRoute(PrivacyPolicyPage, 'PrivacyPolicy')
      },
      {
        path: 'privacy',
        element: withPublicRoute(PrivacyPolicyPage, 'PrivacyPolicy')
      },
      {
        path: 'terms-of-use',
        element: withPublicRoute(TermsOfUsePage, 'TermsOfUse')
      },
      {
        path: 'cookies',
        element: withPublicRoute(CookiesPolicyPage, 'CookiesPolicy')
      },
      {
        path: 'privacy-preferences',
        element: withPublicRoute(PrivacyPreferencesPage, 'PrivacyPreferences')
      },
      {
        path: 'beta',
        element: withPublicRoute(BetaPage, 'BetaPage')
      },
      {
        path: 'strategic-plan',
        element: withPublicRoute(StrategicPlanPage, 'StrategicPlanPage')
      },

      // Protected routes - All under Dashboard layout
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }>
                <RoleBasedDashboard />
              </Suspense>
            )
          },
          // Classes routes
          {
            path: 'classes',
            children: [
              {
                index: true,
                element: withProtectedRoute(ClassroomsPage, 'ClassroomsPage')
              },
              {
                path: ':classId',
                element: withProtectedRoute(ClassDetailPage, 'ClassDetailPage'),
                children: [
                  {
                    index: true,
                    element: withProtectedRoute(ClassOverview, 'ClassOverview')
                  },
                  {
                    path: 'students',
                    element: withProtectedRoute(ClassStudents, 'ClassStudents')
                  },
                  {
                    path: 'activities',
                    element: withProtectedRoute(ClassActivities, 'ClassActivities')
                  },
                  {
                    path: 'settings',
                    element: withProtectedRoute(ClassSettings, 'ClassSettings')
                  },
                  {
                    path: 'chatbot',
                    element: withProtectedRoute(ChatbotConfigPage, 'ChatbotConfigPage')
                  }
                ]
              }
            ]
          },
          // Meetings routes
          {
            path: 'meetings',
            children: [
              {
                index: true,
                element: withProtectedRoute(MeetingsPage, 'MeetingsPage')
              },
              {
                path: 'new',
                element: withProtectedRoute(CreateMeetingPage, 'CreateMeetingPage')
              },
              {
                path: ':meetingId',
                element: withProtectedRoute(MeetingDetailPage, 'MeetingDetailPage')
              }
            ]
          },
          // Activities routes
          {
            path: 'activities',
            children: [
              {
                index: true,
                element: withProtectedRoute(ActivitiesPage, 'ActivitiesPage')
              },
              {
                path: 'drafts',
                element: withProtectedRoute(DraftsPage, 'DraftsPage')
              },
              {
                path: 'new',
                element: withProtectedRoute(CreateActivityPage, 'CreateActivityPage')
              },
              {
                path: ':activityId',
                element: withProtectedRoute(ActivityDetailPage, 'ActivityDetailPage')
              },
              {
                path: ':activityId/corrections',
                element: withProtectedRoute(CorrectionsPage, 'CorrectionsPage')
              },
              {
                path: ':activityId/submit',
                element: withProtectedRoute(SubmitActivityPage, 'SubmitActivityPage')
              }
            ]
          },
          // Students routes
          {
            path: 'students',
            children: [
              {
                index: true,
                element: withProtectedRoute(StudentsPage, 'StudentsPage')
              },
              {
                path: 'new',
                element: withProtectedRoute(StudentsPage, 'CreateStudent')
              },
              {
                path: ':studentId',
                element: withProtectedRoute(StudentDetailsPage, 'StudentDetailsPage')
              }
            ]
          },
          // Tasks routes
          {
            path: 'tasks',
            element: withProtectedRoute(TasksKanbanPage, 'TasksKanbanPage')
          },
          // Analytics routes
          {
            path: 'analytics',
            element: withProtectedRoute(AnalyticsPage, 'AnalyticsPage')
          },
          // Calendar routes
          {
            path: 'calendar',
            element: withProtectedRoute(AgendaPage, 'AgendaPage')
          },
          // Reports routes
          {
            path: 'reports',
            element: withProtectedRoute(ReportsPage, 'ReportsPage')
          },
          // Chatbot routes
          {
            path: 'chatbot',
            element: withProtectedRoute(ChatbotPage, 'ChatbotPage')
          },
          // Student routes with dedicated layout
          {
            path: 'student',
            children: [
              {
                index: true,
                element: withProtectedRoute(StudentDashboard, 'StudentDashboard')
              },
              {
                path: 'activities',
                element: withProtectedRoute(StudentActivitiesPage, 'StudentActivitiesPage')
              },
              {
                path: 'classes',
                element: withProtectedRoute(StudentActivitiesPage, 'StudentClassesPage')
              },
              {
                path: 'gamification',
                element: withProtectedRoute(StudentGamificationPage, 'StudentGamificationPage')
              },
              {
                path: 'performance',
                element: withProtectedRoute(StudentPerformancePage, 'StudentPerformancePage')
              },
              {
                path: 'quizzes',
                element: withProtectedRoute(StudentPublicQuizzesPage, 'StudentPublicQuizzesPage')
              },
              {
                path: 'quizzes/:quizId',
                element: withProtectedRoute(StudentQuizPlayPage, 'StudentQuizPlayPage')
              },
              {
                path: 'notifications',
                element: withProtectedRoute(NotificationCenter, 'NotificationCenter')
              }
            ]
          },
          // Teacher routes with dedicated layout
          {
            path: 'teacher',
            children: [
              {
                index: true,
                element: withProtectedRoute(TeacherDashboard, 'TeacherDashboard')
              },
              {
                path: 'classes',
                element: withProtectedRoute(TeacherClassroomsPage, 'TeacherClassroomsPage')
              },
              {
                path: 'activities',
                element: withProtectedRoute(TeacherActivitiesPage, 'TeacherActivitiesPage')
              },
              {
                path: 'students',
                element: withProtectedRoute(TeacherStudentsPage, 'TeacherStudentsPage')
              }
            ]
          },
          // School routes with dedicated layout
          {
            path: 'school',
            children: [
              {
                index: true,
                element: withProtectedRoute(SchoolDashboard, 'SchoolDashboard')
              },
              {
                path: 'teachers',
                element: withProtectedRoute(SchoolTeachersPage, 'SchoolTeachersPage')
              },
              {
                path: 'classes',
                element: withProtectedRoute(SchoolClassesPage, 'SchoolClassesPage')
              },
              {
                path: 'students',
                element: withProtectedRoute(SchoolStudentsPage, 'SchoolStudentsPage')
              },
              {
                path: 'reports',
                element: withProtectedRoute(SchoolReportsPage, 'SchoolReportsPage')
              },
              {
                path: 'comms',
                element: withProtectedRoute(SchoolCommsPage, 'SchoolCommsPage')
              },
              {
                path: 'ranking',
                element: withProtectedRoute(SchoolRankingPage, 'SchoolRankingPage')
              },
              {
                path: 'settings',
                element: withProtectedRoute(SchoolSettingsPage, 'SchoolSettingsPage')
              },
              {
                path: 'notifications',
                element: withProtectedRoute(NotificationCenter, 'NotificationCenter')
              }
            ]
          },
          // Settings routes
          {
            path: 'settings',
            element: withProtectedRoute(SettingsPage, 'SettingsPage')
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            index: true,
            element: withProtectedRoute(ProfilePage, 'ProfilePage')
          },
          {
            path: 'edit',
            element: withProtectedRoute(UserProfileEditPage, 'UserProfileEditPage')
          }
        ]
      },
      {
        path: 'settings',
        element: withProtectedRoute(SettingsPage, 'SettingsPage')
      },

      // 404 - Not Found (must be the last route)
      {
        path: '*',
        element: withPublicRoute(NotFoundPage, 'NotFoundPage')
      }
    ]
  }
], { basename });

// console.log('Configuração de rotas criada com sucesso');

export default router;
