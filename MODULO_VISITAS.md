# 📋 Módulo de Registro de Visitas de Verificación

## 🎯 Descripción General

Módulo completo para el registro de **Visitas de Verificación** en campo, optimizado para dispositivos móviles como Progressive Web App (PWA). Implementa un formulario progresivo (stepper) de 5 pasos para capturar información técnica, validación de datos, coordenadas GPS y evidencia fotográfica.

---

## 🏗️ Arquitectura del Módulo

### 📁 Estructura de Archivos

```
frontend/src/
├── types/
│   └── visitas.ts                    # Interfaces TypeScript
├── api/
│   └── visitas.ts                    # Servicios API
├── lib/
│   └── geolocation.ts                # Utilidades GPS
├── stores/
│   └── visitaStore.ts                # Estado global del formulario
├── components/
│   ├── ui/                           # Componentes reutilizables
│   │   ├── Button.svelte
│   │   ├── Card.svelte
│   │   ├── Input.svelte
│   │   ├── Textarea.svelte
│   │   ├── Select.svelte
│   │   ├── Toggle.svelte
│   │   └── Stepper.svelte
│   └── visitas/                      # Componentes del módulo
│       ├── VisitaVerificacion.svelte # Componente principal
│       ├── Step0TipoVisita.svelte
│       ├── Step1SeleccionUP.svelte
│       ├── Step2Validacion.svelte
│       ├── Step3Captura.svelte
│       └── Step4Comunicaciones.svelte
```

---

## 📊 Estructura de Datos

### 1. **Interface Principal: `VisitaVerificacion`**

```typescript
interface VisitaVerificacion {
  // Paso 0
  tipo_visita: 'verificacion' | 'comunicaciones';
  
  // Paso 1 & 2
  upid: number;
  nombre_up: string;
  validacion: {
    esCorrecta: boolean;
    comentario?: string;  // Obligatorio si esCorrecta = false
  };
  
  // Paso 3
  coordenadas_gps: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
  };
  descripcion_intervencion: string;
  descripcion_solicitud: string;
  up_entorno: Array<{
    id: string;
    centro_gestor: string;
    descripcion_complemento: string;
  }>;
  
  // Paso 4
  estado_360: 'Antes' | 'Durante' | 'Después';
  viabilidad_alcalde: boolean;
  entrega_publica: boolean;
  campo_comunicaciones: string;
  photos_url: string[];
  
  // Metadata
  fecha_registro: string; // ISO 8601
  usuario_id?: string;
}
```

---

## 🚀 Flujo de Usuario (UX)

### **Paso 0: Selección de Tipo de Visita**
- **UI**: Dos tarjetas grandes tipo "card" con iconos
- **Opciones**:
  - ✅ Visita de Verificación (habilitada)
  - 🚧 Visita de Comunicaciones (próximamente)
- **Acción**: Al seleccionar "Verificación" → avanza automáticamente al Paso 1

### **Paso 1: Selección de Unidad de Proyecto**
- **Componente**: Select con búsqueda (searchable)
- **Fuente de datos**: `GET /unidades-proyecto/init-360`
- **Campos mostrados**:
  - Nombre UP
  - Tipo de equipamiento
  - Localidad
- **Vista previa**: Muestra información básica de la UP seleccionada
- **Validación**: Debe seleccionar una UP para continuar

### **Paso 2: Validación de Datos**
- **UI**: Card con información completa de la UP
  - Nombre
  - Tipo de equipamiento
  - Estado
  - Avance de obra (barra de progreso visual)
  - Localidad
  - Dirección
  - Alcalde local
- **Pregunta**: "¿La información es correcta?"
  - **Botón Sí** → Habilita "Continuar"
  - **Botón No** → Muestra textarea obligatorio para comentarios
- **Validación**: Campo comentario requerido si selecciona "No"

### **Paso 3: Captura Técnica**

#### 📍 **GPS (Automático)**
- Botón "Capturar ubicación"
- Muestra latitud, longitud y precisión
- Campos de solo lectura (readonly)
- Opción para recapturar si es necesario

#### ✍️ **Descripciones**
- **Descripción Intervención**: Textarea (max 1000 caracteres)
- **Descripción Solicitud**: Textarea (max 1000 caracteres)

#### 🏢 **UP Entorno (Dinámico)**
- Permite agregar múltiples registros
- Cada registro contiene:
  - **Centro Gestor**: Select con búsqueda
    - Fuente: `GET /centros-gestores/nombres-unicos`
  - **Descripción Complementaria**: Texto corto (max 200 caracteres)
- Botón "➕ Agregar" para añadir más registros
- Cada registro tiene botón "✕" para eliminar

### **Paso 4: Comunicaciones y Cierre**

#### 📊 **Estado 360**
- Select con opciones: ["Antes", "Durante", "Después"]
- **Lógica inteligente**: Pre-selección automática basada en `avance_obra`:
  - < 30% → "Antes"
  - 30-89% → "Durante"
  - ≥ 90% → "Después"

#### ✅ **Toggles**
- **Viabilidad Alcalde**: Sí/No
- **Entrega Pública**: Sí/No

#### 💬 **Campo Comunicaciones**
- Textarea opcional (max 1000 caracteres)

#### 📸 **Evidencia Fotográfica**
- Input tipo file con `accept="image/*"` y `capture="environment"`
- Permite seleccionar múltiples fotos
- Vista previa en grid responsive
- Cada foto tiene botón para eliminar

---

## 🔌 Integración con API

### **Endpoints Consumidos**

#### 1. **Listado de Unidades de Proyecto**
```typescript
GET /unidades-proyecto/init-360

// Respuesta
[
  {
    upid: 123,
    nombre_up: "Nombre del Proyecto",
    tipo_equipamiento: "CEREZOS ROSADOS",
    estado: "En ejecución",
    avance_obra: 45.5,
    localidad: "Usaquén",
    direccion: "Calle 123 #45-67",
    alcalde_local: "Nombre Alcalde",
    geometry: {
      type: "Point",
      coordinates: [-74.0817, 4.6097]
    }
  }
]
```

#### 2. **Centros Gestores**
```typescript
GET /centros-gestores/nombres-unicos

// Respuesta
["SDIS", "IDRD", "IDPAC", "Secretaría de Cultura"]

// Transformado a:
[
  { label: "SDIS", value: "SDIS" },
  { label: "IDRD", value: "IDRD" }
]
```

#### 3. **Crear Visita** (Endpoint a implementar en backend)
```typescript
POST /visitas-verificacion

// Body
{
  tipo_visita: "verificacion",
  upid: 123,
  nombre_up: "Nombre del Proyecto",
  validacion: {
    esCorrecta: true
  },
  coordenadas_gps: {
    latitude: 4.6097,
    longitude: -74.0817,
    accuracy: 15
  },
  descripcion_intervencion: "...",
  descripcion_solicitud: "...",
  up_entorno: [...],
  estado_360: "Durante",
  viabilidad_alcalde: true,
  entrega_publica: false,
  campo_comunicaciones: "...",
  photos_url: ["https://..."],
  fecha_registro: "2025-11-27T10:30:00Z"
}

// Respuesta
{
  success: true,
  id: 456,
  message: "Visita registrada exitosamente"
}
```

---

## 🎨 Diseño Mobile-First

### **Características UI/UX**

#### ✅ **Optimizaciones Táctiles**
- Botones con `min-height: 44px` (estándar Apple)
- Áreas táctiles amplias
- `-webkit-tap-highlight-color: transparent`
- `touch-action: manipulation`

#### 📱 **Responsive**
- Componentes fluidos (100% width)
- Grids adaptables con `grid-template-columns`
- Breakpoint principal: `640px`
- Uso de `dvh` para altura dinámica en móviles

#### 🎨 **Paleta de Colores**
```css
--primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--success: #10b981
--error: #ef4444
--text-primary: #1f2937
--text-secondary: #6b7280
--border: #e5e7eb
```

#### 🌙 **Dark Mode**
- Soporte automático con `@media (prefers-color-scheme: dark)`
- Backgrounds: `#111827`, `#1f2937`
- Borders: `#374151`

#### 🔄 **Animaciones**
```css
/* Transiciones suaves */
transition: all 0.2s ease;

/* Efectos hover */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);

/* Slide-in */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 📍 Geolocalización

### **API Geolocation**

```typescript
// Capturar ubicación actual
const coords = await getCurrentPosition({
  enableHighAccuracy: true,  // GPS de alta precisión
  timeout: 10000,            // 10 segundos máximo
  maximumAge: 0              // Sin caché
});

// Resultado
{
  latitude: 4.6097,
  longitude: -74.0817,
  accuracy: 15.5,  // metros
  timestamp: 1701089400000
}
```

### **Manejo de Errores GPS**
- `PERMISSION_DENIED`: Solicita permisos al usuario
- `POSITION_UNAVAILABLE`: Verifica que GPS esté activado
- `TIMEOUT`: Intenta recapturar

---

## 🗃️ Gestión de Estado

### **Store Svelte (`visitaStore`)**

```typescript
// Acciones principales
visitaStore.reset()                    // Resetear formulario
visitaStore.nextStep()                 // Siguiente paso
visitaStore.previousStep()             // Paso anterior
visitaStore.updateData(partialData)    // Actualizar datos
visitaStore.selectUnidadProyecto(up)   // Seleccionar UP
visitaStore.captureGPS()               // Capturar GPS
visitaStore.addUPEntorno(entorno)      // Agregar entorno
visitaStore.removeUPEntorno(id)        // Eliminar entorno

// Derived stores
$formProgress         // 0-100% progreso
$isCurrentStepValid   // Validación paso actual
```

---

## ✅ Validaciones por Paso

| Paso | Validaciones |
|------|-------------|
| **0** | `tipo_visita` debe estar definido |
| **1** | Debe haber una UP seleccionada |
| **2** | `validacion.esCorrecta` definido<br/>Si `false`, `comentario` obligatorio |
| **3** | GPS capturado<br/>`descripcion_intervencion` no vacía<br/>`descripcion_solicitud` no vacía |
| **4** | `estado_360` seleccionado<br/>`viabilidad_alcalde` definido<br/>`entrega_publica` definido |

---

## 🚧 Tareas Pendientes (TODO)

### 🔴 **Alta Prioridad**
1. **Implementar subida de fotos**
   - Opciones:
     - Firebase Storage (recomendado para PWA)
     - Endpoint backend Railway
     - Servicio S3/CloudStorage
   - Actualizar función `uploadPhotos()` en `visitas.ts`

2. **Crear endpoint backend**
   - `POST /visitas-verificacion`
   - Validar estructura de datos
   - Guardar en base de datos

3. **Manejo de archivos en formulario**
   - Actualizar `selectedFiles` al eliminar fotos
   - Compresión de imágenes antes de subir
   - Límite de tamaño por foto

### 🟡 **Media Prioridad**
4. **Modo offline**
   - IndexedDB para almacenar visitas pendientes
   - Sincronización automática al recuperar conexión
   - Service Worker para cache de datos

5. **Validaciones avanzadas**
   - Límite de distancia entre GPS y ubicación de la UP
   - Verificar calidad de fotos (tamaño mínimo, formato)
   - Validar duplicados de visitas

6. **Mejoras UX**
   - Guardar borradores automáticamente
   - Indicador de progreso al subir fotos
   - Confirmación visual de éxito con animación

### 🟢 **Baja Prioridad**
7. **Analytics**
   - Tracking de pasos completados
   - Tiempo promedio por formulario
   - Tasa de abandono por paso

8. **Accesibilidad**
   - Atributos ARIA para lectores de pantalla
   - Navegación por teclado
   - Alto contraste para visibilidad

---

## 🧪 Pruebas Recomendadas

### **Checklist de Testing**

#### ✅ **Funcional**
- [ ] Flujo completo de 5 pasos
- [ ] Validaciones en cada paso
- [ ] Captura de GPS exitosa
- [ ] Agregar/eliminar UP Entorno
- [ ] Selección de fotos múltiples

#### ✅ **API**
- [ ] Cargar UPs correctamente
- [ ] Cargar Centros Gestores
- [ ] Enviar visita al backend
- [ ] Manejo de errores de red

#### ✅ **Responsive**
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] Android estándar (360px)
- [ ] Tablets (768px+)

#### ✅ **GPS**
- [ ] Permisos denegados
- [ ] GPS desactivado
- [ ] Timeout en captura
- [ ] Recaptura de coordenadas

---

## 📚 Guía de Uso para Desarrolladores

### **1. Agregar un nuevo campo al formulario**

```typescript
// 1. Actualizar interface en types/visitas.ts
interface VisitaVerificacion {
  // ...campos existentes
  nuevo_campo: string;
}

// 2. Actualizar validación en stores/visitaStore.ts
export const isCurrentStepValid = derived(
  visitaStore,
  $store => {
    // Agregar validación del nuevo campo
  }
);

// 3. Agregar campo en el componente Step correspondiente
<Input
  label="Nuevo Campo"
  bind:value={state.data.nuevo_campo}
/>
```

### **2. Crear un componente UI reutilizable**

```svelte
<!-- components/ui/NuevoComponente.svelte -->
<script lang="ts">
  export let label: string;
  export let value: string = '';
  // Props adicionales
</script>

<div class="componente-wrapper">
  <label>{label}</label>
  <input bind:value />
</div>

<style>
  .componente-wrapper {
    /* Estilos mobile-first */
  }
</style>
```

### **3. Integrar nuevo endpoint**

```typescript
// api/visitas.ts
export async function nuevoEndpoint(): Promise<Tipo> {
  try {
    return await ApiClient.get<Tipo>('/nuevo-endpoint');
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Mensaje usuario');
  }
}
```

---

## 🎓 Conceptos Clave Implementados

1. **Svelte Stores** para estado global reactivo
2. **TypeScript** para type-safety completo
3. **Mobile-First Design** con componentes táctiles
4. **Progressive Disclosure** en formulario por pasos
5. **Geolocation API** para captura GPS
6. **Derived Stores** para validaciones reactivas
7. **Component Composition** con slots y props
8. **Accessibility** con labels, roles y ARIA

---

## 📞 Soporte

Para dudas o problemas:
- Revisar errores en consola del navegador
- Verificar permisos de GPS en el dispositivo
- Comprobar conectividad a API Railway
- Revisar formato de datos en Network tab

---

**Desarrollado con ❤️ usando Svelte + TypeScript + Mobile-First Design**
