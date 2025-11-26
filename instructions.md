# Instructions for GitHub Copilot 🤖

Este documento establece los lineamientos y principios de desarrollo que GitHub Copilot debe seguir al trabajar en el proyecto CaliTrack 360.

## 🎯 Objetivo del Proyecto

Desarrollar una PWA (Progressive Web App) ligera, funcional y elegante para capturar información de proyectos de infraestructura en campo, con énfasis en usabilidad móvil.

## 📐 Principios de Desarrollo

### 1. Programación Funcional

- **Preferir funciones puras** sin efectos secundarios
- **Usar composición** de funciones sobre herencia
- **Evitar mutaciones** de estado; preferir inmutabilidad
- **Separar lógica de presentación** en componentes

**Ejemplo correcto:**

```typescript
// Función pura
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("es-CO");
};

// Composición
const processData = (data) =>
  pipe(validateData, transformData, formatData)(data);
```

**Evitar:**

```typescript
// Estado mutable
let count = 0;
function increment() {
  count++; // Mutación
}
```

### 2. Reutilización de Código

- **Crear componentes genéricos** y reutilizables
- **Extraer lógica común** en funciones utility
- **Usar composición** en lugar de duplicación
- **Crear hooks/stores** para lógica compartida

**Estructura recomendada:**

```
src/
├── components/
│   ├── common/          # Componentes reutilizables
│   │   ├── Button.svelte
│   │   ├── Input.svelte
│   │   └── Card.svelte
│   └── features/        # Componentes específicos
├── utils/               # Funciones utility
│   ├── validation.ts
│   ├── formatting.ts
│   └── api.ts
└── stores/              # Estado compartido
    ├── authStore.ts
    └── dataStore.ts
```

### 3. Simplicidad y Ligereza

- **Minimizar dependencias**: Solo agregar librerías si son necesarias
- **Código conciso**: Evitar over-engineering
- **Bundle pequeño**: Monitorear tamaño del build
- **Lazy loading**: Cargar componentes bajo demanda cuando sea apropiado

**Checklist antes de agregar dependencia:**

- ¿Se puede implementar fácilmente sin librería?
- ¿El tamaño justifica la funcionalidad?
- ¿Tiene alternativa más liviana?

### 4. Diseño Minimalista y Elegante

#### Paleta de Colores

```css
--primary: #2563eb; /* Azul principal */
--primary-dark: #1d4ed8; /* Azul oscuro */
--primary-light: #3b82f6; /* Azul claro */
--secondary: #64748b; /* Gris secundario */
--background: #ffffff; /* Fondo */
--surface: #f8fafc; /* Superficie */
--error: #ef4444; /* Error */
--success: #10b981; /* Éxito */
--text-primary: #0f172a; /* Texto principal */
--text-secondary: #475569; /* Texto secundario */
```

#### Principios de UI

- **Espaciado consistente**: Usar múltiplos de 4px o 8px
- **Tipografía clara**: Tamaños legibles en móvil (mínimo 14px)
- **Contraste suficiente**: WCAG AA como mínimo
- **Touch targets**: Mínimo 44x44px para botones
- **Feedback visual**: Estados hover, active, disabled

### 5. Optimización Móvil

- **Mobile-first**: Diseñar primero para móvil
- **Responsive**: Usar media queries apropiadas
- **Touch-friendly**: Botones y áreas táctiles grandes
- **Viewport units**: Usar dvh/dvw para altura/ancho dinámicos
- **Safe areas**: Respetar notches y bordes redondeados

**Breakpoints estándar:**

```css
/* Móvil: < 640px (por defecto) */
@media (min-width: 640px) {  /* Tablet */
@media (min-width: 768px) {  /* Tablet grande */
@media (min-width: 1024px) { /* Desktop */
```

## 🏗️ Arquitectura

### Frontend (Svelte)

**Stores (Estado Global):**

- Usar Svelte stores para estado compartido
- Mantener stores pequeños y enfocados
- Implementar persistencia en localStorage cuando sea necesario

**Componentes:**

- **Presentacionales**: Solo UI, sin lógica de negocio
- **Contenedores**: Conectan stores y manejan lógica
- **Props tipados**: Siempre definir tipos TypeScript

**Ejemplo:**

```svelte
<script lang="ts">
  import type { Project } from '../types';

  export let project: Project;
  export let onEdit: (id: string) => void;

  // Lógica funcional
  const formatDate = (date: Date) => { /* ... */ };
</script>
```

### Backend (FastAPI)

**Estructura de servicios:**

```python
# Funciones puras que retornan resultados
async def get_user_data(user_id: str) -> UserData:
    """Obtiene datos del usuario"""
    # Lógica sin efectos secundarios
    pass

# Composición de servicios
async def process_user_request(user_id: str):
    user_data = await get_user_data(user_id)
    validated = validate_user(user_data)
    return transform_user_data(validated)
```

**Principios:**

- Funciones async para I/O
- Type hints siempre
- Pydantic para validación
- Manejo de errores con HTTPException

## 🔌 Integración con API Externa

**API Base:** `https://gestorproyectoapi-production.up.railway.app`

### Autenticación

- Endpoint: `/auth/login`
- Método: POST (form-data)
- Campos: `username`, `password`
- Respuesta: `{ access_token, token_type, user? }`

### Manejo de Tokens

```typescript
// Guardar token
localStorage.setItem('token', accessToken);

// Incluir en requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📸 Características Especiales

### 1. Acceso a Cámara

```typescript
// Usar API nativa del navegador
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" },
});

// Capturar imagen
const canvas = document.createElement("canvas");
canvas.getContext("2d").drawImage(video, 0, 0);
const imageData = canvas.toDataURL("image/jpeg");
```

### 2. Geolocalización GPS

```typescript
// Obtener posición actual
const position = await new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  });
});

const { latitude, longitude } = position.coords;
```

## 🎨 Guía de Estilos

### CSS

- Usar **variables CSS** para colores y espaciado
- **BEM o scoped styles** para evitar conflictos
- **Flexbox/Grid** para layouts
- **Mobile-first** en media queries

### TypeScript

- Tipos explícitos para parámetros y retornos
- Interfaces para objetos complejos
- Evitar `any`, usar `unknown` si es necesario
- Enums para valores constantes

### Python

- PEP 8 para estilo
- Type hints en funciones públicas
- Docstrings para funciones complejas
- Snake_case para nombres

## ✅ Checklist de Desarrollo

Antes de completar una feature:

- [ ] **Funcional**: Implementa principios funcionales
- [ ] **Reutilizable**: Código genérico y composable
- [ ] **Ligero**: Sin dependencias innecesarias
- [ ] **Responsivo**: Funciona en móvil y desktop
- [ ] **Tipado**: TypeScript/Python types completos
- [ ] **Testeable**: Funciones puras fáciles de probar
- [ ] **Documentado**: Comentarios para lógica compleja
- [ ] **Accesible**: ARIA labels y contraste adecuado

## 🚫 Anti-patrones a Evitar

❌ **Clases con estado mutable**

```typescript
class Counter {
  count = 0;
  increment() {
    this.count++;
  }
}
```

✅ **Funciones puras**

```typescript
const increment = (count: number) => count + 1;
```

❌ **Componentes gigantes**

```svelte
<script>
  // 500 líneas de código...
</script>
```

✅ **Componentes pequeños y enfocados**

```svelte
<script>
  // 50-100 líneas máximo
  // Extraer lógica a funciones/stores
</script>
```

❌ **Lógica en templates**

```svelte
{#if user && user.role === 'admin' && user.active && !user.suspended}
```

✅ **Funciones derivadas**

```typescript
const isActiveAdmin = (user) =>
  user?.role === "admin" && user?.active && !user?.suspended;
```

## 📚 Recursos de Referencia

- [Svelte Documentation](https://svelte.dev/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Functional Programming Principles](https://en.wikipedia.org/wiki/Functional_programming)

## 🔄 Workflow de Desarrollo

1. **Entender el requisito** completamente
2. **Diseñar la solución** funcionalmente
3. **Implementar incrementalmente** con commits pequeños
4. **Probar en móvil** y desktop
5. **Refactorizar** para simplicidad
6. **Documentar** decisiones importantes

---

**Nota para Copilot**: Siempre prioriza código simple, funcional y reutilizable. Cuando tengas dudas, elige la solución más minimalista que cumpla el requisito.
