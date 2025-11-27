# 🚀 Inicio Rápido - Módulo de Visitas de Verificación

## ✅ ¿Qué se ha creado?

Se ha implementado un **módulo completo** de registro de visitas de verificación con:

- ✅ 7 componentes UI reutilizables mobile-first
- ✅ 5 componentes de pasos del formulario
- ✅ Sistema de gestión de estado con Svelte stores
- ✅ Integración con API Railway
- ✅ Captura automática de GPS
- ✅ Formulario progresivo (stepper) de 5 pasos
- ✅ Documentación completa

---

## 📂 Archivos Creados

### **Tipos TypeScript**
- `frontend/src/types/visitas.ts` - Interfaces y tipos

### **Servicios API**
- `frontend/src/api/visitas.ts` - Consumo de endpoints

### **Utilidades**
- `frontend/src/lib/geolocation.ts` - Captura de GPS

### **Estado Global**
- `frontend/src/stores/visitaStore.ts` - Store del formulario

### **Componentes UI** (7)
- `frontend/src/components/ui/Button.svelte`
- `frontend/src/components/ui/Card.svelte`
- `frontend/src/components/ui/Input.svelte`
- `frontend/src/components/ui/Textarea.svelte`
- `frontend/src/components/ui/Select.svelte`
- `frontend/src/components/ui/Toggle.svelte`
- `frontend/src/components/ui/Stepper.svelte`

### **Componentes del Módulo** (6)
- `frontend/src/components/visitas/VisitaVerificacion.svelte` ← **Principal**
- `frontend/src/components/visitas/Step0TipoVisita.svelte`
- `frontend/src/components/visitas/Step1SeleccionUP.svelte`
- `frontend/src/components/visitas/Step2Validacion.svelte`
- `frontend/src/components/visitas/Step3Captura.svelte`
- `frontend/src/components/visitas/Step4Comunicaciones.svelte`

### **Integración**
- `frontend/src/components/Home.svelte` - Actualizado con navegación

### **Documentación**
- `MODULO_VISITAS.md` - Documentación completa del módulo
- `PSEUDOCODIGO_VISITAS.md` - Lógica del formulario
- `RECOMENDACIONES_UI.md` - Guía de librerías UI
- `INICIO_RAPIDO.md` - Este archivo

---

## 🎯 Próximos Pasos

### 1️⃣ **Verificar la instalación**

```bash
cd frontend
npm install
```

### 2️⃣ **Ejecutar en desarrollo**

```bash
npm run dev
```

### 3️⃣ **Probar el módulo**

1. Abre la aplicación en el navegador
2. Inicia sesión
3. Haz clic en el botón **"Nueva Visita"**
4. Completa el flujo de 5 pasos

---

## 🔧 Configuración Necesaria

### **API Base URL**

Verifica que la variable de entorno apunte a tu API:

```typescript
// frontend/src/lib/api-client.ts (ya configurado)
const API_BASE_URL = 'https://gestorproyectoapi-production.up.railway.app';
```

### **Endpoints Requeridos**

Tu backend Railway debe tener estos endpoints:

✅ `GET /unidades-proyecto/init-360` - Listado de UPs  
✅ `GET /centros-gestores/nombres-unicos` - Centros gestores  
🔴 `POST /visitas-verificacion` - **Crear visita (PENDIENTE)**

---

## ⚠️ Tareas Pendientes (TODO)

### 🔴 **Alta Prioridad**

#### 1. **Implementar endpoint de creación de visitas**

```typescript
// En tu backend Railway
POST /visitas-verificacion

// Recibe:
{
  tipo_visita: "verificacion",
  upid: 123,
  nombre_up: "Proyecto XYZ",
  validacion: { esCorrecta: true },
  coordenadas_gps: { latitude: 4.6097, longitude: -74.0817 },
  descripcion_intervencion: "...",
  descripcion_solicitud: "...",
  up_entorno: [...],
  estado_360: "Durante",
  viabilidad_alcalde: true,
  entrega_publica: false,
  campo_comunicaciones: "...",
  photos_url: [],
  fecha_registro: "2025-11-27T10:30:00Z"
}

// Retorna:
{
  success: true,
  id: 456,
  message: "Visita registrada exitosamente"
}
```

#### 2. **Implementar subida de fotos**

**Opción A: Firebase Storage** (Recomendado para PWA)

```bash
# Ya tienes Firebase instalado
# Actualiza frontend/src/api/visitas.ts
```

```typescript
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (const file of files) {
    // Crear referencia única
    const storageRef = ref(storage, `visitas/${Date.now()}_${file.name}`);
    
    // Subir archivo
    await uploadBytes(storageRef, file);
    
    // Obtener URL pública
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  
  return urls;
}
```

**Opción B: Endpoint Backend**

```typescript
// En tu API Railway
POST /visitas/upload-photos
Content-Type: multipart/form-data

// Retorna:
{ urls: ["https://...", "https://..."] }
```

#### 3. **Configurar Firebase Storage** (si eliges Opción A)

```typescript
// frontend/src/lib/firebase.ts
import { getStorage } from 'firebase/storage';

export const storage = getStorage(app);
```

Configura reglas de seguridad en Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /visitas/{fileName} {
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024; // Max 5MB
      allow read: if request.auth != null;
    }
  }
}
```

---

## 🧪 Testing Manual

### **Checklist de Pruebas**

#### ✅ Paso 0 - Tipo de Visita
- [ ] Se muestran dos cards
- [ ] Al hacer clic en "Verificación" avanza al paso 1
- [ ] "Comunicaciones" muestra mensaje "Próximamente"

#### ✅ Paso 1 - Selección UP
- [ ] Se carga el listado de UPs desde la API
- [ ] El select permite buscar por texto
- [ ] Al seleccionar una UP muestra vista previa
- [ ] El botón "Continuar" solo se habilita con UP seleccionada

#### ✅ Paso 2 - Validación
- [ ] Muestra información completa de la UP
- [ ] Avance de obra se ve como barra de progreso
- [ ] Botón "Sí" habilita continuar directamente
- [ ] Botón "No" muestra textarea obligatorio
- [ ] No permite continuar sin comentario si marca "No"

#### ✅ Paso 3 - Captura Técnica
- [ ] Botón "Capturar ubicación" solicita permisos GPS
- [ ] Muestra coordenadas capturadas (readonly)
- [ ] Se cargan centros gestores en el select
- [ ] Permite agregar múltiples UP Entorno
- [ ] Cada UP Entorno tiene botón eliminar
- [ ] Textareas de descripción son obligatorias

#### ✅ Paso 4 - Comunicaciones
- [ ] Estado 360 se pre-selecciona según avance_obra
- [ ] Toggles funcionan correctamente
- [ ] Input de fotos permite seleccionar múltiples
- [ ] Muestra previsualizaciones de fotos
- [ ] Botón eliminar foto funciona

#### ✅ Navegación
- [ ] Stepper muestra progreso visual
- [ ] Botón "Atrás" funciona en todos los pasos
- [ ] No permite continuar si paso no es válido
- [ ] Puede hacer clic en pasos anteriores
- [ ] Botón "Cancelar" confirma antes de salir

#### ✅ Envío
- [ ] Botón "Finalizar" se deshabilita si falta algo
- [ ] Muestra "Enviando..." mientras procesa
- [ ] Muestra mensaje de éxito
- [ ] Cierra el formulario tras éxito
- [ ] Muestra errores si falla

---

## 📱 Pruebas en Dispositivos Móviles

### **Chrome DevTools**

1. Abre DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Selecciona "iPhone 12 Pro" o "Pixel 5"
4. Prueba el flujo completo

### **Prueba Real en Móvil**

1. Ejecuta `npm run dev`
2. Encuentra tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
3. En tu móvil, abre: `http://TU_IP:5173`
4. Acepta permisos de ubicación cuando lo solicite

### **Prueba de GPS**

- **En DevTools**: Sensors → Location → Custom
- **En Móvil Real**: Asegúrate que GPS esté activado

---

## 🐛 Solución de Problemas

### **Error: "No se pudieron cargar las unidades de proyecto"**

✅ Verifica que el endpoint esté disponible:
```bash
curl https://gestorproyectoapi-production.up.railway.app/unidades-proyecto/init-360
```

✅ Revisa headers de autenticación en Network tab

---

### **Error: "Permiso de ubicación denegado"**

✅ En Chrome: Settings → Privacy → Site Settings → Location  
✅ En móvil: Configuración → Permisos → Ubicación

---

### **Error al enviar visita: "Error 404"**

✅ Normal - el endpoint `POST /visitas-verificacion` aún no existe  
✅ Implementa el endpoint en tu backend Railway  

---

### **Fotos no se suben**

✅ La función `uploadPhotos()` está pendiente de implementación  
✅ Sigue las instrucciones en "Tareas Pendientes" arriba

---

## 📖 Documentación Completa

Lee los siguientes archivos para más detalles:

1. **`MODULO_VISITAS.md`** - Arquitectura y especificaciones técnicas
2. **`PSEUDOCODIGO_VISITAS.md`** - Lógica del formulario explicada
3. **`RECOMENDACIONES_UI.md`** - Librerías UI para Svelte

---

## 🎨 Personalización

### **Cambiar colores del tema**

Edita `frontend/src/app.css`:

```css
:root {
  --primary: #667eea;        /* Color principal */
  --primary-dark: #764ba2;   /* Color secundario */
  --success: #10b981;        /* Verde éxito */
  --error: #ef4444;          /* Rojo error */
}
```

### **Cambiar textos**

Edita `frontend/src/stores/visitaStore.ts`:

```typescript
export const stepNames = [
  'Tipo',           // Paso 0
  'Proyecto',       // Paso 1
  'Validación',     // Paso 2
  'Captura',        // Paso 3
  'Cierre'          // Paso 4
];
```

---

## 🚀 Despliegue

### **Build para producción**

```bash
cd frontend
npm run build
```

### **Previsualizar build**

```bash
npm run preview
```

### **Deploy a Vercel** (si está configurado)

```bash
# Desde la raíz del proyecto
./deploy-vercel.ps1   # Windows
./deploy-vercel.sh    # Mac/Linux
```

---

## 📞 Soporte

Si encuentras problemas:

1. ✅ Revisa la consola del navegador (F12)
2. ✅ Verifica Network tab para errores de API
3. ✅ Comprueba que los endpoints existan en Railway
4. ✅ Lee la documentación en `MODULO_VISITAS.md`

---

## ✨ Características Destacadas

- 📱 **100% Mobile-First** - Optimizado para pantallas pequeñas
- 🎨 **UI Custom** - Sin dependencias pesadas
- 📍 **GPS Automático** - Captura coordenadas con un clic
- 🔄 **Formulario Progresivo** - UX limpia sin saturar pantalla
- ✅ **Validaciones Robustas** - No permite continuar sin datos completos
- 🌙 **Dark Mode** - Soporte automático
- ♿ **Accesible** - Labels, ARIA, y navegación por teclado

---

## 🎯 Siguientes Desarrollos Sugeridos

1. **Historial de Visitas** - Ver visitas anteriores
2. **Edición de Visitas** - Modificar registros
3. **Modo Offline** - Guardar borradores sin conexión
4. **Sincronización** - Subir visitas pendientes
5. **Exportar a PDF** - Generar reportes
6. **Filtros y Búsqueda** - Encontrar visitas por criterios
7. **Dashboard** - Estadísticas de visitas

---

**¡El módulo está listo para usar! 🎉**

Comienza probándolo en desarrollo y luego implementa las tareas pendientes según tus prioridades.
