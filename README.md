# Cabañas La Delfina

Sitio web profesional one-page para el alquiler de cabañas en Oliveros, Santa Fe.

## Características

- Diseño moderno y profesional
- Totalmente responsive (mobile-first)
- Optimizado para SEO
- Carrusel de imágenes en hero
- Galería con modal interactivo
- Formulario de contacto integrado con WhatsApp
- Compartir en redes sociales
- Navegación suave entre secciones
- Animaciones sutiles y transiciones suaves

## Estructura

- `index.html` - Estructura HTML del sitio
- `styles.css` - Estilos CSS modernos
- `script.js` - Funcionalidad JavaScript
- `images/` - Imágenes del sitio
- `vercel.json` - Configuración de Vercel
- `package.json` - Configuración del proyecto

## Deploy

El sitio está configurado para deploy automático en Vercel. Cada push a `main` activa un nuevo deploy automáticamente.

### Configuración del Admin (Galería de Videos)

Para que el admin pueda guardar cambios en el JSON, necesitas configurar un token de GitHub:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo` (acceso completo a repositorios)
3. Copia el token
4. En Vercel → Tu proyecto → Settings → Environment Variables
5. Agrega: `GITHUB_TOKEN` = [tu token de GitHub]
6. Haz redeploy del proyecto

Sin este token, el admin podrá leer el JSON pero no podrá guardar cambios.

## Tecnologías

- HTML5
- CSS3 (Variables CSS, Grid, Flexbox)
- JavaScript Vanilla (ES6+)
- Google Fonts (Playfair Display, Inter)
- Google Maps API

## Licencia

© 2025 Cabañas La Delfina. Todos los derechos reservados.
