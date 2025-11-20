# CODEPRIME - Sitio Web Empresarial

Sitio web corporativo para CODEPRIME, empresa líder en desarrollo de software y soluciones tecnológicas innovadoras.

## 🚀 Características

- **Responsive Design**: Optimizado para todos los dispositivos
- **PWA (Progressive Web App)**: Instalable y funciona offline
- **Chatbot Integrado**: Asistente virtual para soporte al cliente
- **Sistema de Soporte**: Tickets, FAQ y documentación
- **Centro de Descargas**: Aplicaciones y recursos
- **Secciones Completas**: Productos, servicios, noticias, y más

## 📁 Estructura del Proyecto

```
CODEPRIME-solutions/
├── index.html              # Página principal
├── manifest.json          # Configuración PWA
├── sw.js                  # Service Worker
├── css/styles.css         # Estilos principales
├── js/
│   ├── main.js           # JavaScript principal
│   └── chatbot.js        # Funcionalidad del chatbot
├── pages/                # Páginas adicionales
├── assets/               # Imágenes y recursos
└── docs/                # Documentación
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Variables CSS, Grid, Flexbox, Animaciones
- **JavaScript ES6+**: Funcionalidad interactiva
- **PWA**: Service Worker, Web App Manifest
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografía (Inter)

## 🎨 Diseño

### Paleta de Colores
- **Azul Oscuro Principal**: `#1a237e`
- **Azul Medio**: `#3f51b5`
- **Cyan Elegante**: `#00bcd4`
- **Blanco**: `#ffffff`
- **Gris Claro**: `#f8f9fa`

### Tipografía
- **Fuente Principal**: Inter (Google Fonts)
- **Jerarquía**: 6 niveles de tamaño definidos
- **Peso**: 300, 400, 500, 600, 700

## 📱 Funcionalidades

### Página Principal (index.html)
- Hero section con animaciones
- Secciones: Quiénes Somos, Productos, Servicios, Noticias, Descargas, Contacto, Soporte
- Chatbot integrado
- Formulario de contacto funcional

### Páginas Adicionales
- **about.html**: Historia, misión, equipo, metodología
- **products.html**: Showcase de productos con filtros
- **services.html**: Servicios detallados con casos de éxito
- **news.html**: Noticias con filtros y búsqueda
- **downloads.html**: Centro de descargas con categorización
- **support.html**: FAQ, documentación, tickets de soporte

### Componentes Interactivos
- **Navegación**: Responsive con hamburger menu
- **Chatbot**: Asistente virtual con respuestas predefinidas
- **Formularios**: Validación en tiempo real
- **Filtros**: Funcionalidad de filtrado y búsqueda
- **Modales**: Para información adicional

## 🚀 Instalación y Configuración

### 1. Clonar/Descargar el Proyecto
```bash
git clone [URL-del-repositorio]
cd CODEPRIME-solutions
```

### 2. Estructura de Archivos
Asegúrate de tener la siguiente estructura:
- Coloca las imágenes en `assets/img/`
- Los archivos de descarga en `assets/downloads/`
- Documentos PDF en `docs/`

### 3. Servidor Local
Para desarrollo local, puedes usar cualquier servidor HTTP:

**Opción 1: Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Opción 2: Node.js (http-server)**
```bash
npm install -g http-server
http-server
```

**Opción 3: Live Server (VS Code)**
- Instalar extensión "Live Server"
- Click derecho en index.html → "Open with Live Server"

### 4. Acceder al Sitio
Abrir navegador en: `http://localhost:8000`

## 🔧 Personalización

### Colores
Editar variables CSS en `css/styles.css`:
```css
:root {
    --primary-color: #1a237e;
    --secondary-color: #3f51b5;
    --accent-color: #00bcd4;
    /* ... más variables */
}
```

### Contenido
- **Textos**: Editar directamente en archivos HTML
- **Imágenes**: Reemplazar en carpeta `assets/img/`
- **Logo**: Actualizar `assets/img/logo.png`
- **Iconos PWA**: Generar y colocar en `assets/img/icons/`

### Chatbot
Personalizar respuestas en `js/chatbot.js`:
```javascript
const CHATBOT_RESPONSES = {
    // Agregar/modificar respuestas aquí
}
```

## 📱 PWA (Progressive Web App)

### Características PWA
- **Instalable**: Puede instalarse como app nativa
- **Offline**: Funciona sin conexión (archivos cacheados)
- **Service Worker**: Gestiona cache y actualizaciones
- **Manifest**: Configuración de la aplicación

### Configuración PWA
1. **Manifest** (`manifest.json`): Configuración de la app
2. **Service Worker** (`sw.js`): Cache y funcionalidad offline
3. **Iconos**: Diferentes tamaños para distintos dispositivos

## 🔍 SEO y Accesibilidad

### SEO Optimizado
- Meta tags descriptivos
- Estructura semántica HTML5
- URLs amigables
- Sitemap incluido
- Open Graph tags

### Accesibilidad
- Contraste de colores adecuado
- Navegación por teclado
- Alt text en imágenes
- ARIA labels donde es necesario
- Estructura de encabezados lógica

## 📊 Analytics y Tracking

### Implementación
El código incluye funciones para integrar:
- Google Analytics
- Facebook Pixel
- Otros sistemas de tracking

### Configuración
Editar en `js/main.js`:
```javascript
function trackEvent(action, category, label) {
    // Integrar con tu sistema de analytics
}
```

## 🛡️ Seguridad

### Buenas Prácticas Implementadas
- Validación de formularios client-side
- Sanitización de inputs
- CSP headers recomendados
- HTTPS requerido para PWA

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px
- **Tablet**: 481px - 768px
- **Desktop**: > 768px

### Características Responsive
- Grid layouts adaptativos
- Imágenes responsive
- Navegación móvil optimizada
- Touch-friendly buttons

## 🚀 Deployment

### Hosting Recomendado
- **Netlify**: Deploy automático desde Git
- **Vercel**: Optimizado para sitios estáticos
- **GitHub Pages**: Gratuito para repositorios públicos
- **AWS S3 + CloudFront**: Para mayor control

### Pasos para Deploy
1. Subir archivos al servidor
2. Configurar HTTPS (requerido para PWA)
3. Configurar headers de cache
4. Testear funcionalidades PWA

## 🔧 Mantenimiento

### Actualizaciones Regulares
- Revisar y actualizar contenido
- Actualizar noticias y productos
- Mantener FAQ actualizado
- Monitorear rendimiento

### Performance
- Optimizar imágenes
- Minificar CSS/JS en producción
- Configurar compresión en servidor
- Monitorear Core Web Vitals

## 📞 Soporte

### Contacto Técnico
- Email: desarrollo@CODEPRIME.com
- Documentación: Ver carpeta `/docs`
- Issues: Reportar en repositorio Git

### Recursos Adicionales
- [Documentación MDN PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google Web Fundamentals](https://developers.google.com/web/fundamentals)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

## 📄 Licencia

Copyright © 2025 CODEPRIME. Todos los derechos reservados.

---

**Desarrollado con ❤️ por CODEPRIME**