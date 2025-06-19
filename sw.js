// ===== SERVICE WORKER CONFIGURATION =====
const CACHE_NAME = 'InnovaTech-solutions-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Archivos críticos que siempre deben estar en caché
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/js/chatbot.js',
    '/manifest.json',
    '/assets/img/logo.png',
    // Iconos
    '/assets/img/icons/icon-192x192.png',
    '/assets/img/icons/icon-512x512.png',
    // Fuentes externas
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Archivos que se pueden cachear bajo demanda
const RUNTIME_CACHE_URLS = [
    '/pages/about.html',
    '/pages/products.html',
    '/pages/services.html',
    '/pages/news.html',
    '/pages/downloads.html',
    '/pages/support.html'
];

// URLs que no deben ser cacheadas
const EXCLUDE_URLS = [
    '/admin',
    '/api',
    'analytics',
    'facebook.com',
    'google-analytics.com',
    'googletagmanager.com'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                console.log('Caching critical assets...');
                
                // Cachear archivos críticos
                await cache.addAll(CRITICAL_ASSETS);
                console.log('Critical assets cached successfully');
                
                // Forzar activación inmediata
                self.skipWaiting();
            } catch (error) {
                console.error('Error during service worker installation:', error);
            }
        })()
    );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        (async () => {
            try {
                // Limpiar cachés antiguos
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
                
                // Tomar control de todas las pestañas
                await self.clients.claim();
                console.log('Service Worker activated successfully');
                
                // Notificar a los clientes sobre la actualización
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        message: 'Service Worker updated successfully'
                    });
                });
                
            } catch (error) {
                console.error('Error during service worker activation:', error);
            }
        })()
    );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo manejar requests GET
    if (request.method !== 'GET') return;
    
    // Excluir URLs específicas
    if (EXCLUDE_URLS.some(excludeUrl => url.href.includes(excludeUrl))) {
        return;
    }
    
    // Estrategia específica para diferentes tipos de recursos
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        event.respondWith(handleHTMLRequest(request));
    } else if (url.pathname.includes('/api/')) {
        event.respondWith(handleAPIRequest(request));
    } else if (isStaticAsset(url.pathname)) {
        event.respondWith(handleStaticAsset(request));
    } else {
        event.respondWith(handleOtherRequests(request));
    }
});

// ===== ESTRATEGIAS DE CACHE =====

// Cache First - Para recursos estáticos
async function handleStaticAsset(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Error handling static asset:', error);
        return new Response('Asset not available offline', { status: 503 });
    }
}

// Network First - Para páginas HTML
async function handleHTMLRequest(request) {
    try {
        // Intentar red primero
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        throw new Error('Network response not ok');
    } catch (error) {
        // Si falla la red, usar caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Si no hay caché, mostrar página offline
        return caches.match('/index.html');
    }
}

// Network Only - Para APIs
async function handleAPIRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'API not available offline' }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Stale While Revalidate - Para otros requests
async function handleOtherRequests(request) {
    try {
        const cachedResponse = await caches.match(request);
        const networkResponsePromise = fetch(request);
        
        if (cachedResponse) {
            // Actualizar caché en background
            networkResponsePromise.then(async networkResponse => {
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
            }).catch(() => {
                // Silenciar errores de red en background
            });
            
            return cachedResponse;
        }
        
        const networkResponse = await networkResponsePromise;
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Error in stale-while-revalidate:', error);
        return new Response('Content not available', { status: 503 });
    }
}

// ===== UTILIDADES =====
function isStaticAsset(pathname) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', event => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForms());
    }
});

async function syncContactForms() {
    try {
        // Obtener formularios pendientes del IndexedDB
        const pendingForms = await getPendingForms();
        
        for (const form of pendingForms) {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form.data)
                });
                
                if (response.ok) {
                    await removePendingForm(form.id);
                    console.log('Form synced successfully:', form.id);
                }
            } catch (error) {
                console.error('Error syncing form:', error);
            }
        }
    } catch (error) {
        console.error('Error in background sync:', error);
    }
}

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación de INNOVATECH',
        icon: '/assets/img/icons/icon-192x192.png',
        badge: '/assets/img/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir',
                icon: '/assets/img/icons/open-24x24.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/assets/img/icons/close-24x24.png'
            }
        ],
        requireInteraction: true,
        tag: 'InnovaTech-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification('INNOVATECH', options)
    );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// ===== MESSAGE HANDLER =====
self.addEventListener('message', event => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            cacheUrls(event.data.urls)
        );
    }
    
    if (event.data && event.data.type === 'STORE_FORM') {
        event.waitUntil(
            storePendingForm(event.data.formData)
        );
    }
});

// ===== CACHE MANAGEMENT =====
async function cacheUrls(urls) {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urls);
        console.log('URLs cached successfully:', urls);
    } catch (error) {
        console.error('Error caching URLs:', error);
    }
}

// ===== INDEXEDDB HELPERS =====
async function getPendingForms() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('InnovaTechDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pendingForms'], 'readonly');
            const store = transaction.objectStore('pendingForms');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingForms')) {
                db.createObjectStore('pendingForms', { keyPath: 'id' });
            }
        };
    });
}

async function storePendingForm(formData) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('InnovaTechDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pendingForms'], 'readwrite');
            const store = transaction.objectStore('pendingForms');
            
            const pendingForm = {
                id: Date.now().toString(),
                data: formData,
                timestamp: new Date().toISOString()
            };
            
            const addRequest = store.add(pendingForm);
            addRequest.onsuccess = () => resolve(pendingForm.id);
            addRequest.onerror = () => reject(addRequest.error);
        };
    });
}

async function removePendingForm(formId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('InnovaTechDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pendingForms'], 'readwrite');
            const store = transaction.objectStore('pendingForms');
            
            const deleteRequest = store.delete(formId);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// ===== PERFORMANCE MONITORING =====
self.addEventListener('fetch', event => {
    // Monitor performance of critical resources
    if (event.request.url.includes('InnovaTech-solutions.com')) {
        const startTime = performance.now();
        
        event.respondWith(
            fetch(event.request).then(response => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Log slow requests
                if (duration > 3000) {
                    console.warn(`Slow request detected: ${event.request.url} took ${duration}ms`);
                }
                
                return response;
            })
        );
    }
});

// ===== CLEANUP =====
self.addEventListener('beforeunload', () => {
    // Cleanup before service worker unloads
    console.log('Service Worker unloading...');
});

console.log('INNOVATECH Service Worker loaded successfully');