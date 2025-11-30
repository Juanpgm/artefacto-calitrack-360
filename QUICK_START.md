# 🚀 Guía Rápida de Desarrollo Local

Esta guía te ayudará a configurar y ejecutar el proyecto CaliTrack 360 en tu máquina local.

## ⚡ Inicio Rápido (3 Pasos)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Juanpgm/artefacto-calitrack-360.git
cd artefacto-calitrack-360
```

### 2. Configurar el Entorno

**Windows:**

```powershell
.\setup.ps1
```

**Linux/macOS:**

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Iniciar el Servidor

```bash
cd frontend
npm run dev
```

¡Abre http://localhost:5173 en tu navegador! 🎉

---

## 📋 Checklist de Configuración

Antes de empezar a desarrollar, verifica que todo esté correcto:

**Windows:**

```powershell
.\verify-setup.ps1
```

**Linux/macOS:**

```bash
./verify-setup.sh
```

O desde npm:

```bash
npm run verify
```

El script verificará:

- ✅ Node.js y npm instalados
- ✅ Estructura de directorios correcta
- ✅ Archivos de configuración presentes
- ✅ Dependencias instaladas (node_modules)
- ✅ Variables de entorno configuradas (.env.local)
- ✅ Credenciales de Firebase válidas
- ✅ .gitignore configurado (seguridad)
- ✅ API Backend accesible

---

## 🔧 Configuración de Firebase

### Obtener Credenciales

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **Project Settings** (⚙️ ícono)
4. En **Your apps**, selecciona tu app web o crea una
5. Copia las credenciales de configuración

### Configurar Variables de Entorno

Edita el archivo `frontend/.env.local` con tus credenciales:

```env
# API Backend
VITE_API_URL=https://gestorproyectoapi-production.up.railway.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env.local` a GitHub. Ya está en `.gitignore`.

---

## 🛠️ Comandos Útiles

### Scripts de Configuración

```bash
# Configurar el proyecto completo
npm run setup

# Verificar la configuración
npm run verify

# Instalar solo dependencias del frontend
npm run install:all
```

### Scripts de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev                 # Desde raíz
cd frontend && npm run dev  # Desde frontend/

# Build de producción
npm run build

# Preview del build
npm run preview

# Verificar tipos TypeScript
cd frontend && npm run check
```

---

## 📱 Probar la Aplicación

### Login de Prueba

Si tienes usuarios configurados en Firebase Authentication:

1. Abre http://localhost:5173
2. Ingresa email y contraseña
3. El sistema se conectará a Firebase y al backend

### API Backend

La aplicación se conecta automáticamente a:

- **URL**: https://gestorproyectoapi-production.up.railway.app
- **Docs**: https://gestorproyectoapi-production.up.railway.app/docs

---

## 🐛 Solución de Problemas

### Error: "Firebase configuration is missing"

**Causa**: Variables de entorno no configuradas o incorrectas

**Solución**:

```bash
# 1. Verificar que .env.local existe
ls frontend/.env.local

# 2. Verificar configuración
npm run verify

# 3. Si falta, copiar desde template
cd frontend
cp .env.example .env.local
# Editar con tus credenciales reales
```

### Error: "npm: command not found"

**Causa**: Node.js o npm no instalados

**Solución**:

1. Descarga Node.js desde https://nodejs.org/
2. Instala la versión LTS (18+)
3. Verifica: `node --version` y `npm --version`

### Error: "Port 5173 already in use"

**Causa**: El puerto ya está siendo usado por otro proceso

**Solución**:

```bash
# Opción 1: Usar otro puerto
cd frontend
npm run dev -- --port 3000

# Opción 2: Matar el proceso (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Opción 2: Matar el proceso (Linux/macOS)
lsof -ti:5173 | xargs kill -9
```

### Build falla

**Causa**: Errores de TypeScript o dependencias faltantes

**Solución**:

```bash
# 1. Verificar errores de tipos
cd frontend
npm run check

# 2. Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# 3. Intentar build nuevamente
npm run build
```

### No se puede conectar con API Backend

**Causa**: Sin conexión a internet o API caída

**Solución**:

```bash
# Verificar que la API esté disponible
curl https://gestorproyectoapi-production.up.railway.app/docs

# O en Windows PowerShell
Invoke-WebRequest https://gestorproyectoapi-production.up.railway.app/docs
```

---

## 📂 Estructura del Proyecto

```
artefacto-calitrack-360/
├── frontend/                    # Aplicación Svelte
│   ├── src/
│   │   ├── components/         # Componentes UI
│   │   │   ├── Home.svelte     # Página principal
│   │   │   └── Login.svelte    # Página de login
│   │   ├── stores/             # Estado global
│   │   │   └── authStore.ts    # Store de autenticación
│   │   ├── api/                # Servicios de API
│   │   │   ├── auth.ts         # Autenticación
│   │   │   └── capturas.ts     # Capturas (próximamente)
│   │   ├── lib/                # Utilidades
│   │   │   ├── firebase.ts     # Config Firebase
│   │   │   └── api-client.ts   # Cliente HTTP
│   │   ├── App.svelte          # Componente raíz
│   │   └── main.ts             # Entry point
│   ├── public/                 # Recursos estáticos
│   ├── .env.local              # Variables de entorno (no subir)
│   ├── .env.example            # Template de variables
│   ├── package.json
│   ├── vite.config.ts          # Config Vite + PWA
│   └── tsconfig.json           # Config TypeScript
│
├── setup.ps1                   # Script de instalación (Windows)
├── setup.sh                    # Script de instalación (Linux/macOS)
├── verify-setup.ps1            # Script de verificación (Windows)
├── verify-setup.sh             # Script de verificación (Linux/macOS)
├── package.json                # Workspace raíz
├── README.md                   # Documentación principal
└── vercel.json                 # Config de despliegue
```

---

## 🔐 Seguridad

### Archivos Sensibles

Estos archivos **NUNCA** deben subirse a GitHub:

- `frontend/.env.local` - Credenciales de Firebase
- `frontend/node_modules/` - Dependencias
- `.vercel/` - Config de Vercel

Ya están incluidos en `.gitignore` ✅

### Buenas Prácticas

1. **Nunca** hardcodees credenciales en el código
2. **Siempre** usa variables de entorno
3. **Verifica** que `.env.local` esté en `.gitignore`
4. **No compartas** tus credenciales de Firebase

---

## 📚 Recursos Adicionales

- [README.md](./README.md) - Documentación completa del proyecto
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Guía de despliegue en Vercel
- [ERRORES_CONOCIDOS.md](./ERRORES_CONOCIDOS.md) - Errores comunes y soluciones
- [Firebase Docs](https://firebase.google.com/docs) - Documentación de Firebase
- [Svelte Docs](https://svelte.dev/docs) - Documentación de Svelte
- [Vite Docs](https://vitejs.dev/) - Documentación de Vite

---

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📞 Soporte

Si tienes problemas:

1. **Ejecuta** `npm run verify` para diagnosticar
2. **Consulta** [ERRORES_CONOCIDOS.md](./ERRORES_CONOCIDOS.md)
3. **Revisa** los logs en la consola del navegador (F12)
4. **Verifica** que todas las variables de entorno estén configuradas

---

**¡Feliz desarrollo! 🚀**
