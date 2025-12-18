# Instrucciones para Deploy Automático en Vercel

## Prerrequisitos

1. **Cuenta en Vercel**: Crea una cuenta gratuita en [vercel.com](https://vercel.com)
2. **Repositorio en GitHub**: El código debe estar en un repositorio de GitHub

## Pasos para Configurar el Deploy Automático

### Paso 1: Preparar el Repositorio

1. **Inicializar Git** (si aún no lo has hecho):
```bash
cd /Users/daeiman/oliveros/oliveros
git init
git add .
git commit -m "Initial commit - Cabañas La Delfina website"
```

2. **Crear repositorio en GitHub**:
   - Ve a [github.com](https://github.com)
   - Crea un nuevo repositorio (público o privado)
   - **NO** inicialices con README, .gitignore o licencia

3. **Conectar el repositorio local con GitHub**:
```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. **Iniciar sesión en Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Sign Up" o "Log In"
   - Puedes usar tu cuenta de GitHub para iniciar sesión directamente

2. **Importar el proyecto**:
   - En el dashboard de Vercel, haz clic en "Add New..." → "Project"
   - Selecciona "Import Git Repository"
   - Busca y selecciona tu repositorio `oliveros` (o el nombre que le hayas dado)
   - Haz clic en "Import"

### Paso 3: Configurar el Proyecto en Vercel

1. **Configuración del proyecto**:
   - **Framework Preset**: Selecciona "Other" o déjalo en "Auto-detect"
   - **Root Directory**: Deja en `./` (raíz del proyecto)
   - **Build Command**: Déjalo vacío (no necesitamos build)
   - **Output Directory**: Déjalo vacío
   - **Install Command**: Déjalo vacío (no hay dependencias)

2. **Variables de Entorno** (si las necesitas más adelante):
   - Por ahora no necesitas ninguna
   - Si en el futuro agregas APIs, las puedes configurar aquí

3. **Haz clic en "Deploy"**

### Paso 4: Configurar el Dominio Personalizado (Opcional)

1. **Dominio personalizado**:
   - En el dashboard del proyecto, ve a "Settings" → "Domains"
   - Agrega tu dominio personalizado si lo tienes
   - Sigue las instrucciones para configurar los DNS

2. **Dominio de Vercel**:
   - Vercel te asignará automáticamente un dominio como `tu-proyecto.vercel.app`
   - Este dominio ya está configurado y funcionando

### Paso 5: Verificar el Deploy Automático

1. **Hacer un cambio de prueba**:
```bash
# Edita cualquier archivo, por ejemplo index.html
# Haz un pequeño cambio visible

git add .
git commit -m "Test deploy automático"
git push origin main
```

2. **Verificar en Vercel**:
   - Ve al dashboard de Vercel
   - Deberías ver que se inicia automáticamente un nuevo deploy
   - Espera a que termine (generalmente toma 1-2 minutos)
   - El sitio se actualizará automáticamente

## Configuración Adicional Recomendada

### Archivo `vercel.json` (Opcional)

Crea un archivo `vercel.json` en la raíz del proyecto para optimizaciones:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Optimización de Imágenes

Vercel optimiza automáticamente las imágenes, pero puedes mejorar esto:

1. **Usar formato WebP** para mejor compresión
2. **Redimensionar imágenes grandes** antes de subirlas
3. Vercel tiene un servicio de optimización de imágenes integrado

## Comandos Útiles

### Ver el estado del deploy:
```bash
# Instala Vercel CLI (opcional)
npm i -g vercel

# Login
vercel login

# Ver información del proyecto
vercel ls
```

### Deploy manual (si es necesario):
```bash
vercel --prod
```

## Troubleshooting

### Problema: Las imágenes no se cargan
- **Solución**: Verifica que las rutas sean relativas (`images/...` no `/images/...`)
- Verifica que las imágenes estén en el repositorio

### Problema: El sitio muestra 404
- **Solución**: Asegúrate de que `index.html` esté en la raíz del proyecto
- Verifica la configuración de "Output Directory" en Vercel

### Problema: Los cambios no se reflejan
- **Solución**: 
  - Verifica que hayas hecho push a GitHub
  - Revisa los logs del deploy en Vercel
  - Limpia la caché del navegador

### Problema: El deploy falla
- **Solución**:
  - Revisa los logs en Vercel
  - Verifica que no haya errores de sintaxis en HTML/CSS/JS
  - Asegúrate de que todos los archivos estén en el repositorio

## Estructura del Proyecto para Vercel

```
oliveros/
├── index.html          # Página principal
├── styles.css          # Estilos
├── script.js           # JavaScript
├── images/             # Imágenes
│   ├── hero.png
│   ├── cabana-*.png
│   ├── loft.png
│   └── galeria-*.png
├── vercel.json         # Configuración de Vercel (opcional)
└── README.md           # Documentación
```

## Notas Importantes

1. **Deploy Automático**: Cada vez que hagas `git push` a la rama `main`, Vercel desplegará automáticamente
2. **Preview Deploys**: Vercel crea previews automáticos para cada Pull Request
3. **Gratuito**: El plan gratuito de Vercel es suficiente para este proyecto
4. **SSL**: Vercel proporciona SSL automático y gratuito
5. **CDN**: Tu sitio se sirve desde una CDN global para mejor rendimiento

## Próximos Pasos Después del Deploy

1. ✅ Verificar que el sitio funciona correctamente
2. ✅ Probar en diferentes dispositivos
3. ✅ Configurar Google Analytics (si lo necesitas)
4. ✅ Configurar dominio personalizado (opcional)
5. ✅ Optimizar imágenes si es necesario

## Soporte

- **Documentación de Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Comunidad**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**¡Listo!** Una vez que subas el código a GitHub y lo conectes con Vercel, tendrás deploy automático configurado. 🚀

