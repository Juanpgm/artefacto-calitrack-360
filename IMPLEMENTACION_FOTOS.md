# Implementación de Carga de Fotos

## Resumen

El backend de Railway maneja automáticamente la subida de fotos a S3. El frontend solo necesita enviar los archivos `File` en el FormData del POST.

## Estado Actual

✅ **Completado:**
- Función `createVisitaVerificacion()` en `frontend/src/api/visitas.ts`
- Integración con endpoint POST `/unidades-proyecto/captura-estado-360`
- Componente `HistorialVisitas.svelte` para ver registros

⚠️ **Pendiente:**
- Manejo de archivos `File` desde el componente Step4

## Cómo Funciona

### 1. Backend (Railway API)

El endpoint `POST /unidades-proyecto/captura-estado-360` acepta:
- **Tipo de contenido**: `multipart/form-data`
- **Campo de fotos**: `photosUrl` (array de archivos)
- **Proceso automático**:
  1. Recibe los archivos en el campo `photosUrl`
  2. Determina el `estado_360` basado en el estado del proyecto
  3. Sube las fotos a S3 en la estructura:
     ```
     /images/{centro_gestor}/{upid}/{estado}/{fecha}/
     ```
  4. Retorna las URLs de las fotos subidas

**Ejemplo de estructura S3:**
```
360-photos-cali/
└── images/
    └── Secretaría_de_Infraestructura/
        └── UNP-MASIVO-001/
            ├── antes/
            │   └── 2025-11-27T10-30-00/
            │       ├── foto1.jpg
            │       └── foto2.jpg
            ├── durante/
            │   └── 2025-11-27T14-30-00/
            │       └── foto3.jpg
            └── despues/
                └── 2025-12-15T16-00-00/
                    └── foto4.jpg
```

### 2. Frontend (Implementación Actual)

**Archivo**: `frontend/src/api/visitas.ts`

```typescript
export async function createVisitaVerificacion(
  visitaData: VisitaVerificacion,
  selectedUP: UnidadProyecto,
  userEmail: string,
  userDisplayName: string
): Promise<CapturaEstado360Response>
```

**Proceso:**
1. Crea un `FormData` con todos los campos requeridos
2. **Pendiente**: Agregar los archivos File al FormData
3. Envía el POST con `fetch()` (no con ApiClient porque necesitamos FormData)
4. El backend procesa y retorna:
   ```json
   {
     "success": true,
     "document_id": "abc123",
     "estado_360": "Durante",
     "photos_uploaded": [...],  // URLs de S3
     "photos_failed": [...]     // Fotos que fallaron
   }
   ```

## Implementación Pendiente

### Paso 1: Modificar Step4Comunicaciones.svelte

Necesitas agregar un input de archivos y almacenar los File objects:

```svelte
<script lang="ts">
  // ... código existente ...
  
  let selectedFiles: File[] = [];
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      selectedFiles = Array.from(input.files);
      
      // Actualizar el store con los archivos
      // NOTA: No podemos almacenar File objects en el store directamente
      // Los pasaremos como parámetro en handleSubmit
    }
  }
</script>

<!-- En el template -->
<div class="photo-upload">
  <label for="photos">📸 Cargar Fotos</label>
  <input
    type="file"
    id="photos"
    accept="image/*"
    multiple
    capture="environment"
    on:change={handleFileSelect}
  />
  
  {#if selectedFiles.length > 0}
    <p>{selectedFiles.length} foto(s) seleccionada(s)</p>
  {/if}
</div>
```

### Paso 2: Pasar los archivos a createVisitaVerificacion

**En VisitaVerificacion.svelte:**

```typescript
// Modificar handleSubmit para recibir los archivos
async function handleSubmit(photoFiles: File[] = []) {
  // ... código existente ...
  
  // Modificar la llamada a la API
  const response = await createVisitaVerificacion(
    visitaCompleta,
    state.selectedUP,
    userEmail,
    userDisplayName,
    photoFiles  // <-- Nuevo parámetro
  );
}
```

### Paso 3: Actualizar la función createVisitaVerificacion

**En frontend/src/api/visitas.ts:**

```typescript
export async function createVisitaVerificacion(
  visitaData: VisitaVerificacion,
  selectedUP: UnidadProyecto,
  userEmail: string,
  userDisplayName: string,
  photoFiles: File[] = []  // <-- Nuevo parámetro
): Promise<CapturaEstado360Response> {
  try {
    const formData = new FormData();
    
    // ... todos los campos existentes ...
    
    // NUEVO: Agregar las fotos al FormData
    if (photoFiles.length > 0) {
      photoFiles.forEach((file) => {
        formData.append('photosUrl', file);
      });
    }
    
    // ... resto del código existente ...
  }
}
```

## Ejemplo de Uso Completo

```typescript
// 1. Usuario selecciona fotos en Step4
const photoFiles = [file1.jpg, file2.jpg, file3.jpg];

// 2. Al hacer submit, se envían al backend
const response = await createVisitaVerificacion(
  visitaData,
  selectedUP,
  'juan@example.com',
  'Juan Pérez',
  photoFiles
);

// 3. Backend retorna las URLs de S3
console.log(response.photos_uploaded);
// [
//   { url: 'https://360-photos-cali.s3.../foto1.jpg' },
//   { url: 'https://360-photos-cali.s3.../foto2.jpg' }
// ]
```

## Notas Importantes

1. **Capture de Cámara**: El atributo `capture="environment"` en el input abre directamente la cámara en móviles
2. **Múltiples Fotos**: El atributo `multiple` permite seleccionar varias fotos a la vez
3. **Validación**: El backend valida que al menos haya una foto (`photosUrl` es obligatorio)
4. **Límite de Tamaño**: Verificar con el backend cuál es el límite de tamaño por foto
5. **Estados**: El backend organiza automáticamente las fotos según el `estado_360`

## Historial de Visitas

Ya implementado en `HistorialVisitas.svelte`:

```typescript
// Buscar todas las visitas
const response = await fetchHistorialVisitas();

// Buscar con filtros
const response = await fetchHistorialVisitas({
  upid: 'UNP-MASIVO-001',
  estado_360: 'Durante',
  tipo_visita: 'Verificación'
});
```

## Próximos Pasos

1. [ ] Implementar input de archivos en Step4Comunicaciones.svelte
2. [ ] Agregar preview de las fotos seleccionadas
3. [ ] Pasar los archivos File a handleSubmit
4. [ ] Actualizar createVisitaVerificacion para aceptar photoFiles
5. [ ] Probar subida de fotos con el backend
6. [ ] Manejar errores de subida (photos_failed)
7. [ ] Agregar indicador de progreso durante la subida

## Referencias

- **API Endpoint**: POST `/unidades-proyecto/captura-estado-360`
- **Bucket S3**: `360-photos-cali`
- **Documentación Backend**: Ver Swagger en Railway
