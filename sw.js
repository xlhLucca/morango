// Service Worker para Maravilha Sound
// Versão do cache
const CACHE_NAME = 'maravilha-sound-v1';

// Arquivos estáticos para cache inicial
const staticAssets = [
  '/',
  '/index.html',
  '/styles.css',
  'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando arquivos estáticos');
        // Tenta cachear os arquivos, mas não falha se algum externo falhar
        return cache.addAll(staticAssets).catch((err) => {
          console.log('Service Worker: Alguns arquivos não puderam ser cacheados:', err);
        });
      })
  );
  
  // Força a ativação imediata do novo service worker
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Remove caches antigos que não correspondem ao nome atual
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Assume o controle de todas as páginas imediatamente
  return self.clients.claim();
});

// Interceptação de requisições (estratégia: Network First, fallback para Cache)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignora requisições que não são GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignora requisições de iframes (YouTube)
  if (request.url.includes('youtube.com') || request.url.includes('youtu.be')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a requisição foi bem-sucedida, clona e adiciona ao cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          // Só cacheia requisições do mesmo domínio ou recursos estáticos
          if (request.url.startsWith(self.location.origin) || 
              request.url.startsWith('https://fonts.googleapis.com') ||
              request.url.startsWith('https://cdnjs.cloudflare.com')) {
            cache.put(request, responseToCache);
          }
        });
        
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tenta buscar no cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Se não encontrar no cache e for a página principal, retorna o index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
