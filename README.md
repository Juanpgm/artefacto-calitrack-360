# CaliTrack 360 🏗️

Aplicación PWA para la captura de información del estado de proyectos de infraestructura en la ciudad.

## 📋 Descripción

CaliTrack 360 es una Progressive Web App (PWA) diseñada para facilitar la captura y registro de información de proyectos de infraestructura en campo. La aplicación permite a los usuarios autenticarse con Firebase, tomar fotografías, registrar ubicaciones GPS y capturar datos relevantes de manera eficiente desde dispositivos móviles.

**🚀 Deployment Automático**: Cada `git push` despliega automáticamente en Vercel.

## 🚀 Características

- ✅ **Autenticación Firebase**: Login seguro con persistencia de sesión
- ✅ **PWA**: Instalable y funciona offline
- ✅ **Diseño Responsivo**: Optimizado para móviles y tablets
- ✅ **Deployment Automático**: Integración con Vercel
- 🚧 **Captura de fotos**: Acceso a la cámara del dispositivo (próximamente)
- 🚧 **Geolocalización**: Registro automático de ubicación GPS (próximamente)
- 🚧 **Sincronización Offline**: IndexedDB + Service Worker (próximamente)

## 🛠️ Stack Tecnológico

- **Frontend**: Svelte 4 + TypeScript + Vite
- **Auth**: Firebase Authentication SDK
- **PWA**: vite-plugin-pwa (service worker + manifest)
- **API Backend**: Railway (gestorproyectoapi-production.up.railway.app)
- **Deployment**: Vercel con integración GitHub (auto-deploy)

## 📁 Estructura del Proyecto

```
artefacto-calitrack-360/
├── frontend/                 # Aplicación Svelte PWA
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── stores/          # Estado global (Svelte stores)
│   │   ├── api/             # Servicios de API
│   │   ├── App.svelte       # Componente principal
│   │   └── main.ts          # Punto de entrada
│   ├── vite.config.ts       # Configuración Vite + PWA
│   └── package.json
│
├── backend/                  # Servidor de desarrollo local (opcional)
│   ├── main.py              # Servidor FastAPI mínimo
│   └── requirements.txt
│
├── README.md
└── instructions.md
```

## 🔧 Instalación Rápida

### Requisitos Previos

- Node.js 18+ y npm
- Git
- Credenciales de Firebase

### Instalación Automática (Recomendado)

**Windows (PowerShell):**

```powershell
# Instalar dependencias y configurar proyecto
.\setup.ps1

# Verificar que todo esté listo
.\verify-setup.ps1
```

**Linux/macOS:**

```bash
# Instalar dependencias y configurar proyecto
chmod +x setup.sh verify-setup.sh
./setup.sh

# Verificar que todo esté listo
./verify-setup.sh
```

### Instalación Manual

```bash
cd frontend
npm install

# Copiar template y configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase

npm run dev
```

### Scripts Disponibles

- **`setup.ps1` / `setup.sh`**: Instala dependencias, crea archivo de configuración y verifica el entorno
- **`verify-setup.ps1` / `verify-setup.sh`**: Verifica que todo esté correctamente configurado antes de desarrollar
- Ejecuta `verify-setup` después de clonar o si encuentras problemas de configuración

## 🚦 Ejecución

### Desarrollo Local

```bash
cd frontend
npm run dev
```

Accede a: `http://localhost:5173`

La aplicación se conecta automáticamente a:

- **API Backend**: `https://gestorproyectoapi-production.up.railway.app`
- **Firebase Auth**: Configurado en `.env.local`

### Build de Producción

```bash
cd frontend
npm run build
npm run preview
```

## 🔐 Autenticación

La aplicación utiliza **Firebase Authentication SDK** con el siguiente flujo:

1. Login con email/password en Firebase
2. Obtención de ID Token de Firebase
3. Validación del token con el backend: `GET /auth/validate-session`
4. Backend retorna roles y permisos del usuario
5. Persistencia automática de sesión (localStorage + sessionStorage)

**API Backend**: `https://gestorproyectoapi-production.up.railway.app`  
**Documentación**: `/docs`

## 📦 Artefacto de Captura #360

La aplicación utiliza los endpoints del TAG "Artefacto de Captura #360" para:

- Registrar capturas de campo
- Subir fotografías
- Guardar ubicaciones GPS
- Gestionar información de proyectos

## 🌐 Deployment en Vercel

La aplicación está configurada para **deployment automático**. Cada `git push` a la rama principal despliega automáticamente en Vercel.

### Configuración:

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Configura Root Directory: `frontend`
3. Agrega las variables de entorno de Firebase
4. ¡Listo! Cada push desplegará automáticamente

**Ver [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) para instrucciones detalladas.**

## 📱 Uso de la PWA

### Instalación en Móvil

1. Abrir la aplicación en el navegador
2. Seleccionar "Agregar a pantalla de inicio"
3. La app se instala como aplicación nativa

### Funcionalidades Offline

- ✅ Cacheo de recursos estáticos
- 🚧 Sincronización automática (próximamente)

## 📚 Documentación

- **[QUICK_START.md](./QUICK_START.md)**: Guía rápida para configurar el entorno local (⭐ Comienza aquí)
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**: Guía completa de deployment automático
- **[ERRORES_CONOCIDOS.md](./ERRORES_CONOCIDOS.md)**: Errores conocidos y soluciones
- **[frontend/.env.example](./frontend/.env.example)**: Template de variables de entorno

## 🛠️ Comandos Disponibles

### Scripts de Configuración

```powershell
# Windows PowerShell
.\setup.ps1           # Instalar y configurar proyecto
.\verify-setup.ps1    # Verificar configuración completa

# Linux/macOS
./setup.sh            # Instalar y configurar proyecto
./verify-setup.sh     # Verificar configuración completa
```

### Scripts de Desarrollo (en directorio frontend/)

```bash
# Desarrollo
npm run dev           # Servidor de desarrollo (http://localhost:5173)

# Build
npm run build         # Build para producción
npm run preview       # Preview del build local

# Validación
npm run check         # Verificar tipos TypeScript
```

### Scripts del Workspace Raíz

```bash
npm run setup         # Ejecuta setup.ps1 o setup.sh automáticamente
npm run dev           # Inicia servidor de desarrollo del frontend
npm run build         # Build del frontend
```

## 📝 Próximos Pasos

- [ ] Implementar captura de fotos con cámara
- [ ] Integrar geolocalización GPS
- [ ] Crear formularios de captura de datos
- [ ] Implementar sincronización offline
- [ ] Agregar tests unitarios

## 🔐 Seguridad

- ✅ Credenciales Firebase en `.env.local` (no se suben a GitHub)
- ✅ Variables de entorno protegidas en Vercel
- ✅ Autenticación con Firebase Auth SDK
- ✅ Tokens seguros con persistencia local

## 🤝 Contribución

Este proyecto sigue principios de:

- Código limpio y mantenible
- Diseño responsive y mobile-first
- PWA best practices
- TypeScript para type safety

---

**Versión**: 0.1.0  
**Última actualización**: Noviembre 2025  
**Deployment**: Vercel con auto-deploy desde GitHub
