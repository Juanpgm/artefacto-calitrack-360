# 🚀 Deployment Automático en Vercel

Esta guía te muestra cómo configurar el deployment automático en Vercel. **Cada vez que hagas `git push`, tu aplicación se desplegará automáticamente.**

---

## 📋 Requisitos Previos

1. Cuenta en [GitHub](https://github.com) con tu repositorio
2. Cuenta en [Vercel](https://vercel.com) (puedes usar tu cuenta de GitHub)
3. Credenciales de Firebase listas

---

## 🔗 Paso 1: Conectar GitHub con Vercel

### 1.1 Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"** (recomendado)
4. Autoriza a Vercel para acceder a tu cuenta de GitHub

### 1.2 Importar tu Repositorio

1. En el Dashboard de Vercel, click en **"Add New..."** → **"Project"**
2. Verás una lista de tus repositorios de GitHub
3. Busca **"artefacto-calitrack-360"**
4. Click en **"Import"**

---

## ⚙️ Paso 2: Configurar el Proyecto

### 2.1 Configuración de Build

Vercel detectará automáticamente que es un proyecto Vite. Configura lo siguiente:

```
Framework Preset:    Vite
Root Directory:      frontend
Build Command:       npm run build
Output Directory:    dist
Install Command:     npm install
```

### 2.2 Variables de Entorno

**Antes de hacer deploy**, agrega las variables de entorno:

1. Click en **"Environment Variables"**
2. Agrega las siguientes variables (copia los valores desde `frontend/.env.local`):

```bash
# API Backend
VITE_API_URL=https://gestorproyectoapi-production.up.railway.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
```

⚠️ **Importante:**

- Copia los valores exactos de tu archivo `.env.local`
- Estas variables son obligatorias para que la aplicación funcione

### 2.3 Iniciar Deploy

1. Verifica que todas las configuraciones estén correctas
2. Click en **"Deploy"**
3. Espera 1-2 minutos mientras Vercel construye tu aplicación
4. ¡Listo! Tu aplicación estará en línea

---

## 🔄 Deployment Automático

### Cómo Funciona

Una vez configurado, **cada vez que hagas `git push`**:

```bash
# 1. Hacer cambios en tu código
git add .
git commit -m "Mejoras en la aplicación"

# 2. Push a GitHub
git push origin main

# 3. Vercel detecta el cambio automáticamente y despliega
# No necesitas hacer nada más! 🎉
```

### Proceso Automático

1. **Push a GitHub** → Vercel detecta el cambio
2. **Build automático** → Vercel ejecuta `npm install` y `npm run build`
3. **Deploy automático** → La nueva versión se publica
4. **Notificación** → Recibes un email con el resultado

### URLs de Deploy

- **Producción (main):** `https://tu-proyecto.vercel.app`
- **Preview (otras ramas):** `https://tu-proyecto-git-branch.vercel.app`

Cada rama obtiene su propia URL de preview para testing.

---

## 📱 Verificar el Deployment

### Desde Vercel Dashboard

1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard)
2. Verás el historial de deployments
3. Click en cualquier deployment para ver:
   - Logs de build
   - Variables de entorno
   - Estado del deployment

### Desde GitHub

Si conectaste GitHub, verás:

- ✅ Check en tus commits cuando el deploy es exitoso
- ❌ Error si el deploy falla
- Link directo al preview en cada Pull Request

---

## 🔧 Configuración Avanzada

### Cambiar la Rama de Producción

Por defecto, la rama `main` o `master` se despliega a producción.

Para cambiar:

1. Settings → Git
2. En **"Production Branch"**, selecciona otra rama

### Deployment con Ramas Protegidas

1. Settings → Git
2. Habilita **"Production Branch"**
3. Solo los commits a esa rama se desplegarán a producción

### Deshabilitar Deployment Automático

Si necesitas deshabilitar temporalmente:

1. Settings → Git
2. En **"Deploy Hooks"**, deshabilita el deployment automático

---

## 🐛 Troubleshooting

### Error: "Build failed"

**Causa:** Faltan variables de entorno o error en el código

**Solución:**

1. Ve a los logs del deployment en Vercel
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que el código compile localmente con `npm run build`

### Error: "Firebase not initialized"

**Causa:** Variables de Firebase no configuradas

**Solución:**

1. Settings → Environment Variables
2. Verifica que todas las variables `VITE_FIREBASE_*` estén presentes
3. Re-deploy: Deployments → Click en los 3 puntos → **"Redeploy"**

### La aplicación no carga

**Causa:** Root directory incorrecto

**Solución:**

1. Settings → General
2. En **"Root Directory"**, debe decir `frontend`
3. Guarda cambios y re-deploy

### Cambios no se reflejan

**Causa:** Cache del navegador o build cache

**Solución:**

```bash
# Limpiar cache local
cd frontend
rm -rf node_modules/.vite
npm run build

# Hacer commit y push
git add .
git commit -m "Force rebuild"
git push
```

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)
- [Integración con GitHub](https://vercel.com/docs/git/vercel-for-github)

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en el Dashboard de Vercel
2. Verifica que las variables de entorno estén correctas
3. Asegúrate que el build funcione localmente con `npm run build`
4. Consulta la [documentación oficial de Vercel](https://vercel.com/docs)
