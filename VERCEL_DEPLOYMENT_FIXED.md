# 🚀 Guía de Despliegue en Vercel - ACTUALIZADO

## ✅ Correcciones Aplicadas

Se han corregido los siguientes problemas de configuración:

1. ✅ **Eliminado `vercel.json` duplicado** en la carpeta `frontend/`
2. ✅ **Actualizado `vercel.json` raíz** con configuración completa
3. ✅ **Creado `.vercelignore`** para excluir archivos innecesarios
4. ✅ **Agregado `.nvmrc`** para especificar Node.js v18.18.0
5. ✅ **Actualizado scripts** en ambos `package.json` con comandos compatibles
6. ✅ **Agregado `engines`** en package.json para asegurar versiones correctas

---

## 📋 Pasos para Desplegar en Vercel

### 1️⃣ Preparar el Proyecto

**Verificar que tienes las variables de entorno:**
```bash
# Asegúrate de que este archivo existe y tiene las credenciales correctas
frontend/.env.local
```

### 2️⃣ Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Click en **"Add New..."** → **"Project"**
4. Importa tu repositorio **"artefacto-calitrack-360"**

### 3️⃣ Configurar el Proyecto en Vercel

**⚠️ IMPORTANTE: Deja la configuración automática**

Vercel leerá el archivo `vercel.json` de la raíz del proyecto. **NO necesitas configurar nada manualmente** en la UI de Vercel, excepto las variables de entorno.

La configuración se aplicará automáticamente desde `vercel.json`:
- ✅ Build Command: `cd frontend && npm install && npm run build`
- ✅ Output Directory: `frontend/dist`
- ✅ Install Command: `cd frontend && npm install`
- ✅ Node Version: 18.18.0 (desde `.nvmrc`)

### 4️⃣ Configurar Variables de Entorno

**Antes de desplegar**, agrega estas variables en Vercel:

1. En la configuración del proyecto, ve a **"Environment Variables"**
2. Agrega las siguientes variables (copia los valores desde `frontend/.env.local`):

```bash
# API Backend
VITE_API_URL=https://gestorproyectoapi-production.up.railway.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
```

**Asegúrate de seleccionar los tres entornos:**
- ✅ Production
- ✅ Preview
- ✅ Development

### 5️⃣ Desplegar

1. Click en **"Deploy"**
2. Espera 1-2 minutos
3. ¡Listo! Tu aplicación estará en línea

---

## 🔄 Despliegue Automático

Una vez configurado, cada `git push` desplegará automáticamente:

```bash
# 1. Hacer cambios
git add .
git commit -m "Actualización"

# 2. Push a GitHub
git push origin main

# 3. Vercel desplegará automáticamente 🎉
```

---

## 🐛 Solución de Problemas

### Error: "Build failed"

1. **Verifica las variables de entorno** - Todas deben estar configuradas
2. **Revisa los logs de build** en el dashboard de Vercel
3. **Asegúrate de que el build local funciona**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Error: "Module not found"

- Verifica que todas las dependencias estén en `frontend/package.json`
- Asegúrate de que no hay imports incorrectos

### Error: "VITE_* undefined"

- Las variables de entorno deben empezar con `VITE_`
- Deben estar configuradas en el dashboard de Vercel
- Verifica que estén en los tres entornos (Production, Preview, Development)

### La página no carga correctamente

- Verifica que `frontend/dist` se generó correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que la URL de la API es accesible

---

## 📊 Archivos de Configuración

### `vercel.json` (raíz)
Configuración principal de Vercel con comandos de build, headers y rewrites.

### `.vercelignore`
Excluye archivos innecesarios del despliegue (node_modules, .env, docs, etc.).

### `.nvmrc`
Especifica la versión de Node.js a usar (18.18.0).

### `package.json` (ambos)
Scripts optimizados para Vercel y especificación de engines.

---

## ✅ Checklist Pre-Despliegue

Antes de desplegar, verifica:

- [ ] Las variables de entorno están en `frontend/.env.local`
- [ ] El build local funciona: `cd frontend && npm run build`
- [ ] Las credenciales de Firebase son correctas
- [ ] La URL de la API es accesible
- [ ] No hay errores en la consola local
- [ ] El repositorio está actualizado en GitHub

---

## 🔗 Links Útiles

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentación de Vercel](https://vercel.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Railway Dashboard](https://railway.app/dashboard)

---

## 📝 Notas Adicionales

- **PWA**: La aplicación se instalará como PWA automáticamente
- **Service Worker**: Se actualizará automáticamente en cada despliegue
- **Cache**: Los assets estáticos se cachearán automáticamente
- **HTTPS**: Vercel proporciona HTTPS automáticamente
- **Custom Domain**: Puedes agregar un dominio personalizado en Vercel

---

**¿Problemas?** Revisa los logs en el dashboard de Vercel o contacta al equipo de desarrollo.
