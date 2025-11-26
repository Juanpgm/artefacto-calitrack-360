# Notas de Implementación - CaliTrack 360

## Arquitectura Simplificada

La aplicación fue diseñada con una arquitectura minimalista:

### Frontend (Svelte PWA)

- **Consumo directo de API**: El frontend se conecta directamente a `https://gestorproyectoapi-production.up.railway.app`
- **Sin backend intermedio**: No hay proxy, el frontend es autosuficiente
- **PWA completa**: Instalable, funciona offline, cachea recursos

### Backend (Opcional)

- **Solo para desarrollo**: El backend FastAPI es opcional y mínimo
- **No es necesario para producción**: El frontend funciona independientemente

## Endpoints Utilizados

### TAG: "Administración y Control de Accesos"

- `POST /auth/login` - Autenticación de usuarios
  - Body: `FormData { username, password }`
  - Response: `{ access_token, token_type }`

### TAG: "Artefacto de Captura #360"

Los endpoints específicos se implementarán según la documentación real de la API.

## Próximos Pasos de Desarrollo

1. **Revisar documentación completa de la API**

   - Obtener lista exacta de endpoints de "Artefacto de Captura #360"
   - Documentar schemas de request/response

2. **Implementar captura de fotos**

   - Acceso a cámara con `navigator.mediaDevices`
   - Comprimir imágenes antes de subir
   - Soporte para múltiples fotos

3. **Implementar geolocalización**

   - Obtener coordenadas GPS con `navigator.geolocation`
   - Mostrar ubicación en mapa (opcional: Leaflet/Mapbox)
   - Guardar metadata de ubicación

4. **Formularios de captura**

   - Diseñar según necesidades del proyecto
   - Validaciones funcionales
   - Manejo de errores

5. **Sincronización offline**
   - IndexedDB para almacenamiento local
   - Queue de sincronización cuando hay conexión
   - Indicadores visuales de estado

## Decisiones de Diseño

### ¿Por qué sin backend intermedio?

- **Simplicidad**: Menos código, menos mantenimiento
- **Rendimiento**: Una petición menos (no hay proxy)
- **CORS**: La API de Railway permite peticiones cross-origin
- **Despliegue**: Solo se necesita desplegar el frontend (Vercel/Netlify)

### ¿Por qué programación funcional?

- **Testeable**: Funciones puras son fáciles de probar
- **Predecible**: Sin efectos secundarios
- **Reutilizable**: Composición sobre herencia
- **Mantenible**: Código más claro y conciso

### ¿Por qué Svelte?

- **Ligero**: Bundle pequeño (~50KB compilado)
- **Rápido**: No usa Virtual DOM
- **Simple**: Sintaxis cercana a HTML/CSS/JS vanilla
- **Reactivo**: Sistema de reactividad incorporado

## Estructura de Archivos Importantes

```
frontend/src/
├── api/
│   ├── auth.ts          # Login y autenticación
│   └── capturas.ts      # CRUD de capturas (placeholder)
├── components/
│   ├── Login.svelte     # Pantalla de login
│   └── Home.svelte      # Página principal (placeholder)
├── stores/
│   └── authStore.ts     # Estado de autenticación
├── app.css              # Estilos globales y variables
└── App.svelte           # Componente raíz
```

## Variables CSS Globales

```css
--primary: #2563eb         /* Azul principal */
--primary-dark: #1d4ed8    /* Azul oscuro (hover) */
--error: #ef4444           /* Rojo error */
--success: #10b981         /* Verde éxito */
--text-primary: #0f172a    /* Texto principal */
--text-secondary: #475569  /* Texto secundario */
```

## Testing Local

Para probar el login, necesitarás credenciales válidas de la API de Railway.

1. Abrir `http://localhost:5173`
2. Ingresar credenciales
3. Verificar que se muestre la página de bienvenida
4. Verificar que el token se guarde en localStorage

## Despliegue

### Frontend

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Requiere configuración de base path

### Backend (si se usa)

- **Railway**: Conectar repositorio
- **Heroku**: `heroku create && git push heroku main`
- **Render**: Conectar repositorio

---

**Última actualización**: Noviembre 26, 2025
