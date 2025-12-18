# Instrucciones para Subir a GitHub y Activar Deploy Automático en Vercel

## ✅ Estado Actual
- ✅ Git inicializado
- ✅ Commit inicial realizado
- ✅ Archivos listos para subir

## Pasos para Subir a GitHub

### 1. Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Configura el repositorio:
   - **Repository name**: `cabanas-la-delfina` (o el nombre que prefieras)
   - **Description**: "Sitio web de Cabañas La Delfina - Oliveros, Santa Fe"
   - **Visibility**: Público o Privado (tu elección)
   - ⚠️ **NO marques** "Add a README file", "Add .gitignore", ni "Choose a license"
4. Haz clic en **"Create repository"**

### 2. Conectar el Repositorio Local con GitHub

Ejecuta estos comandos (reemplaza `TU_USUARIO` y `TU_REPO` con tus datos):

```bash
cd /Users/daeiman/oliveros/oliveros

# Agregar el remote de GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Cambiar a rama main (si es necesario)
git branch -M main

# Subir el código
git push -u origin main
```

**Ejemplo real:**
```bash
git remote add origin https://github.com/daeiman/cabanas-la-delfina.git
git branch -M main
git push -u origin main
```

### 3. Verificar que se Subió Correctamente

- Ve a tu repositorio en GitHub
- Deberías ver todos los archivos: `index.html`, `styles.css`, `script.js`, `images/`, etc.

## Pasos para Activar Deploy Automático en Vercel

### ⚠️ IMPORTANTE: Vercel NO Requiere CI/CD Manual

**Vercel automáticamente:**
- ✅ Detecta cuando haces push a GitHub
- ✅ Hace deploy automático
- ✅ Crea previews para Pull Requests
- ✅ No necesitas configurar GitHub Actions ni CI/CD

### 1. Conectar Vercel con GitHub

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
   - Puedes usar tu cuenta de GitHub directamente

2. En el Dashboard, haz clic en **"Add New..."** → **"Project"**

3. Selecciona **"Import Git Repository"**

4. Si es la primera vez:
   - Autoriza a Vercel a acceder a tus repositorios de GitHub
   - Selecciona los repositorios que quieres conectar (o "All repositories")

5. Busca y selecciona tu repositorio `cabanas-la-delfina` (o el nombre que le pusiste)

6. Haz clic en **"Import"**

### 2. Configurar el Proyecto en Vercel

En la pantalla de configuración:

- **Framework Preset**: Selecciona **"Other"** o déjalo en "Auto-detect"
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: Déjalo **vacío** (no necesitamos build)
- **Output Directory**: Déjalo **vacío**
- **Install Command**: Déjalo **vacío** (no hay dependencias npm)

### 3. Deploy

1. Haz clic en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel despliega tu sitio
3. ¡Listo! Tu sitio estará disponible en `tu-proyecto.vercel.app`

### 4. Verificar Deploy Automático

1. Haz un pequeño cambio en cualquier archivo:
```bash
# Edita index.html o styles.css con un cambio pequeño
# Por ejemplo, cambia un texto o color
```

2. Haz commit y push:
```bash
git add .
git commit -m "Test deploy automático"
git push origin main
```

3. Ve al Dashboard de Vercel:
   - Deberías ver que se inicia automáticamente un nuevo deploy
   - En 1-2 minutos tu sitio se actualizará automáticamente

## 🎉 ¡Eso es Todo!

**No necesitas configurar CI/CD manualmente.** Vercel lo hace automáticamente cuando:
- Haces push a la rama `main` → Deploy de producción
- Creas un Pull Request → Preview deploy
- Haces merge de un PR → Deploy de producción

## Comandos Útiles

### Ver el estado del repositorio:
```bash
git status
```

### Ver commits:
```bash
git log --oneline
```

### Ver remotes configurados:
```bash
git remote -v
```

### Si necesitas cambiar el remote:
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
```

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### El deploy no se activa automáticamente
- Verifica que el repositorio esté conectado en Vercel
- Verifica que estés haciendo push a la rama `main`
- Revisa los logs en Vercel Dashboard

## Próximos Pasos

1. ✅ Subir código a GitHub
2. ✅ Conectar con Vercel
3. ✅ Verificar deploy automático
4. ✅ Configurar dominio personalizado (opcional)
5. ✅ Agregar Google Analytics (opcional)

---

**¿Necesitas ayuda?** Revisa los logs en Vercel o consulta la documentación en [vercel.com/docs](https://vercel.com/docs)

