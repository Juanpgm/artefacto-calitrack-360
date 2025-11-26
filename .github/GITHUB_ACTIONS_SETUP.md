# Instrucciones para Configurar GitHub Actions

Si deseas usar GitHub Actions para desplegar automáticamente, sigue estos pasos:

## 1. Configurar Secrets en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions

Agrega los siguientes secrets:

### Vercel (si usas Vercel)

- `VERCEL_TOKEN`: Tu token de Vercel
- `VERCEL_ORG_ID`: ID de tu organización
- `VERCEL_PROJECT_ID`: ID del proyecto

### Firebase

- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 2. Habilitar GitHub Actions

El workflow en `.github/workflows/deploy.yml` se ejecutará automáticamente en cada push a main/master.

## 3. Obtener Token de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login y obtener token
vercel login
vercel --token

# Obtener IDs del proyecto
vercel link
```

Los IDs se encuentran en `.vercel/project.json`
