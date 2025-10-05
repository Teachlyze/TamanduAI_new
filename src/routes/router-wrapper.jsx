import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ErrorFallback, Loading } from '@/components/shared/ErrorComponents';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import App from '../App';

// Sistema avançado de carregamento dinâmico com prefetching
const pageModules = import.meta.glob(['../pages/**/*.jsx', '../pages/*.jsx', '../pages/classes/*.jsx']);
console.log('Available page modules:', Object.keys(pageModules));

// Sistema inteligente de lazy loading com prefetching
const createLazyComponent = (componentName, options = {}) => {
  const {
    priority = 'normal', // 'high', 'normal', 'low'
    prefetchOnHover = false,
    preloadOnRouteChange = true
  } = options;

  const lazyComponent = lazy(() => {
    console.log(`Carregando componente: ${componentName} (prioridade: ${priority})`);

    // Buscar o módulo correspondente
    const possiblePaths = [
      `../pages/${componentName}.jsx`,
      `../pages/classes/${componentName}.jsx`,
      `../pages/activities/${componentName}.jsx`,
      `../pages/meetings/${componentName}.jsx`,
      `../pages/errors/${componentName}.jsx`,
      `../pages/dashboard/${componentName}.jsx`,
      `../pages/students/${componentName}.jsx`,
      `../pages/notifications/${componentName}.jsx`,
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
        console.log(`✅ Componente ${componentName} carregado com sucesso`);

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
    LandingPage: ['LoginPage', 'RegisterPage'],
    LoginPage: ['Dashboard', 'ForgotPasswordPage'],
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
const LoginPage = createLazyComponent('LoginPage', { priority: 'normal' });
const RegisterPage = createLazyComponent('RegisterPage', { priority: 'normal' });
const ForgotPasswordPage = createLazyComponent('ForgotPasswordPage', { priority: 'low' });
const ResetPasswordPage = createLazyComponent('ResetPasswordPage', { priority: 'low' });
const ClassroomsPage = createLazyComponent('ClassroomsPage', { priority: 'normal' });
const ClassDetailPage = createLazyComponent('ClassDetailsPage', { priority: 'normal' });
const ClassOverview = createLazyComponent('ClassDetailsPage', { priority: 'normal' });
const ClassStudents = createLazyComponent('ClassDetailsPage', { priority: 'normal' });
const ClassActivities = createLazyComponent('classes/ClassActivitiesPage', { priority: 'normal' });
const ClassSettings = createLazyComponent('ClassDetailsPage', { priority: 'normal' });
const MeetingsPage = createLazyComponent('MeetingDetailsPage', { priority: 'normal' });
const CreateMeetingPage = createLazyComponent('MeetingDetailsPage', { priority: 'normal' });
const MeetingDetailPage = createLazyComponent('MeetingDetailsPage', { priority: 'normal' });
const ActivitiesPage = createLazyComponent('ActivitiesListPage', { priority: 'normal' });
const CreateActivityPage = createLazyComponent('CreateActivityPage', { priority: 'normal' });
const ActivityDetailPage = createLazyComponent('ActivityPage', { priority: 'normal' });
const ProfilePage = createLazyComponent('UserProfilePage', { priority: 'low' });
const SettingsPage = createLazyComponent('UserProfilePage', { priority: 'low' });
const NotFoundPage = createLazyComponent('errors/NotFoundPage', { priority: 'low' });
const OnboardingPage = createLazyComponent('OnboardingPage', { priority: 'normal' });

// Component to wrap protected routes with enhanced error boundaries
const withProtectedRoute = (Component, name) => {
  console.log(`🔒 Criando rota protegida para: ${name}`);
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
  console.log(`🌐 Criando rota pública para: ${name}`);
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


console.log('Criando configuração de rotas...');

// Create the router instance
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
        path: 'onboarding',
        element: withProtectedRoute(OnboardingPage, 'OnboardingPage')
      },
      {
        path: 'forgot-password',
        element: withPublicRoute(ForgotPasswordPage, 'ForgotPasswordPage')
      },
      {
        path: 'reset-password',
        element: withPublicRoute(ResetPasswordPage, 'ResetPasswordPage')
      },

      // Protected routes
      {
        path: 'dashboard',
        element: withProtectedRoute(Dashboard, 'Dashboard')
      },
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
              }
            ]
          }
        ]
      },
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
      {
        path: 'activities',
        children: [
          {
            index: true,
            element: withProtectedRoute(ActivitiesPage, 'ActivitiesPage')
          },
          {
            path: 'new',
            element: withProtectedRoute(CreateActivityPage, 'CreateActivityPage')
          },
          {
            path: ':activityId',
            element: withProtectedRoute(ActivityDetailPage, 'ActivityDetailPage')
          }
        ]
      },
      {
        path: 'profile',
        element: withProtectedRoute(ProfilePage, 'ProfilePage')
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
]);

console.log('Configuração de rotas criada com sucesso');

export default router;
