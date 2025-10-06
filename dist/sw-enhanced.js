// public/sw-enhanced.js
// Service Worker aprimorado com cache inteligente e funcionalidades offline

const CACHE_NAME = 'tamanduai-v3.0.0';
const STATIC_CACHE = 'tamanduai-static-v3.0.0';
const DYNAMIC_CACHE = 'tamanduai-dynamic-v3.0.0';
const API_CACHE = 'tamanduai-api-v3.0.0';

// Recursos críticos que sempre devem estar em cache
const CRITICAL_RESOURCES = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/offline',
  '/manifest.json',
];

// Recursos estáticos para cache de longo prazo
const STATIC_RESOURCES = [
  '/favicon.svg',
  '/vite.svg',
  // Adicione outros recursos estáticos conforme necessário
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First - para recursos estáticos
  CACHE_FIRST: 'cache-first',
  // Network First - para dados dinâmicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - para dados que podem ser stale
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network Only - para requests críticos
  NETWORK_ONLY: 'network-only',
};

// Configuração de cache por rota/tipo
const CACHE_CONFIG = {
  '/api/': CACHE_STRATEGIES.NETWORK_FIRST,
  '/supabase/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/assets/': CACHE_STRATEGIES.CACHE_FIRST,
  '/': CACHE_STRATEGIES.NETWORK_FIRST,
};

// URLs que nunca devem ser cacheadas
const NEVER_CACHE = [
  '/api/auth',
  '/api/logout',
  '/api/user-onboarding',
];

// Instalar service worker e cachear recursos críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing enhanced service worker');

  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll([
          ...CRITICAL_RESOURCES,
          ...STATIC_RESOURCES,
        ]);
      }),

      // Pré-carregar fontes e recursos importantes
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll([
          // Adicione recursos importantes que devem estar sempre disponíveis
        ]);
      }),
    ])
  );

  // Forçar ativação do service worker
  self.skipWaiting();
});

// Ativar service worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating enhanced service worker');

  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Tomar controle de todas as páginas abertas
      self.clients.claim(),
    ])
  );
});

// Interceptar requests de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests para outras origens
  if (url.origin !== location.origin) {
    return;
  }

  // Ignorar requests que nunca devem ser cacheados
  if (NEVER_CACHE.some(pattern => url.pathname.includes(pattern))) {
    return;
  }

  // Determinar estratégia de cache baseada na URL
  const strategy = getCacheStrategy(url.pathname);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(request));
      break;

    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(request));
      break;

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(request));
      break;

    case CACHE_STRATEGIES.NETWORK_ONLY:
      event.respondWith(fetch(request));
      break;

    default:
      event.respondWith(networkFirst(request));
  }
});

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline - conteúdo não disponível', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Se sucesso, atualizar cache
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache');

    // Se falhou na rede, tentar cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Se não há cache, retornar página offline
    return caches.match('/offline') || new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Buscar da rede em background
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', error);
      return cachedResponse;
    });

  // Retornar cache imediatamente se disponível
  return cachedResponse || networkPromise;
}

// Determinar estratégia de cache baseada na URL
function getCacheStrategy(pathname) {
  for (const [pattern, strategy] of Object.entries(CACHE_CONFIG)) {
    if (pathname.includes(pattern)) {
      return strategy;
    }
  }

  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Sincronização em background para ações offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

// Função para sincronizar ações realizadas offline
async function syncOfflineActions() {
  try {
    // Buscar ações offline do IndexedDB
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        await syncAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('[SW] Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Placeholder functions para integração com IndexedDB
async function getOfflineActions() {
  // Implementar integração com IndexedDB para armazenar ações offline
  return [];
}

async function syncAction(action) {
  // Implementar sincronização específica por tipo de ação
  console.log('[SW] Syncing action:', action);
}

async function removeOfflineAction(actionId) {
  // Implementar remoção de ação sincronizada
  console.log('[SW] Removing synced action:', actionId);
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova notificação',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {},
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'TamanduAI', options)
    );
  } catch (error) {
    console.error('[SW] Push notification failed:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  const data = event.notification.data || {};

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se há janela aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes(data.url || '/')) {
          return client.focus();
        }
      }

      // Se não há janela, abrir nova
      if (self.clients.openWindow) {
        return self.clients.openWindow(data.url || '/');
      }
    })
  );
});

// Mensagens do main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'CACHE_CRITICAL_RESOURCES':
        cacheCriticalResources();
        break;

      case 'CLEAR_CACHE':
        clearAllCaches();
        break;

      default:
        console.log('[SW] Unknown message type:', event.data.type);
    }
  }
});

// Cache recursos críticos
async function cacheCriticalResources() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CRITICAL_RESOURCES);
    console.log('[SW] Critical resources cached');
  } catch (error) {
    console.error('[SW] Failed to cache critical resources:', error);
  }
}

// Limpar todos os caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

console.log('[SW] Enhanced Service Worker loaded');
