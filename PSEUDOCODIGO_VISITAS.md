# 🧠 Pseudocódigo: Lógica del Formulario Progresivo de Visitas

## 📋 Estructura General

```pseudocode
CLASE FormularioVisitaVerificacion:
    
    // ============================================
    // ESTADO DEL FORMULARIO
    // ============================================
    
    ESTADO:
        pasoActual = 0                          // Paso actual (0-4)
        pasosCompletados = []                   // Array de pasos completados
        
        // Datos del formulario
        tipoVisita = null
        upSeleccionada = null
        validacionDatos = null
        coordenadasGPS = null
        descripcionIntervencion = ""
        descripcionSolicitud = ""
        upEntorno = []                          // Array dinámico
        estado360 = null
        viabilidadAlcalde = null
        entregaPublica = null
        campoComunicaciones = ""
        fotos = []
        
        // Estados auxiliares
        cargando = false
        error = null
        listaUPs = []
        listaCentrosGestores = []
    
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    FUNCIÓN inicializar():
        LLAMAR resetearFormulario()
        MOSTRAR paso 0
    
    
    FUNCIÓN resetearFormulario():
        pasoActual = 0
        pasosCompletados = []
        tipoVisita = "verificacion"
        LIMPIAR todos los campos
        upEntorno = []
        fotos = []
    
    
    // ============================================
    // PASO 0: TIPO DE VISITA
    // ============================================
    
    FUNCIÓN manejarSeleccionTipoVisita(tipo):
        tipoVisita = tipo
        
        SI tipo == "verificacion":
            MARCAR paso 0 como completado
            NAVEGAR a paso 1
        SINO:
            MOSTRAR mensaje "Próximamente disponible"
    
    
    // ============================================
    // PASO 1: SELECCIÓN DE UP
    // ============================================
    
    FUNCIÓN alMontarPaso1():
        SI listaUPs está vacía:
            LLAMAR cargarUnidadesProyecto()
    
    
    FUNCIÓN cargarUnidadesProyecto():
        cargando = true
        error = null
        
        INTENTAR:
            respuesta = AWAIT API.GET("/unidades-proyecto/init-360")
            listaUPs = respuesta
            cargando = false
        CAPTURAR error:
            error = "Error al cargar proyectos"
            cargando = false
    
    
    FUNCIÓN manejarSeleccionUP(upId):
        upSeleccionada = BUSCAR en listaUPs DONDE upid == upId
        
        SI upSeleccionada existe:
            MOSTRAR vista previa de la UP
            HABILITAR botón "Continuar"
        SINO:
            error = "Proyecto no encontrado"
    
    
    FUNCIÓN validarPaso1():
        SI upSeleccionada es null:
            RETORNAR false
        RETORNAR true
    
    
    // ============================================
    // PASO 2: VALIDACIÓN DE DATOS
    // ============================================
    
    FUNCIÓN manejarRespuestaValidacion(esCorrecta):
        validacionDatos = {
            esCorrecta: esCorrecta,
            comentario: null
        }
        
        SI esCorrecta == true:
            HABILITAR botón "Continuar"
            OCULTAR campo comentario
        SINO:
            MOSTRAR campo comentario
            DESHABILITAR botón "Continuar"
    
    
    FUNCIÓN manejarComentarioValidacion(texto):
        validacionDatos.comentario = texto
        
        SI texto NO está vacío:
            HABILITAR botón "Continuar"
        SINO:
            DESHABILITAR botón "Continuar"
    
    
    FUNCIÓN validarPaso2():
        SI validacionDatos es null:
            RETORNAR false
        
        SI validacionDatos.esCorrecta == false:
            SI validacionDatos.comentario está vacío:
                RETORNAR false
        
        RETORNAR true
    
    
    // ============================================
    // PASO 3: CAPTURA TÉCNICA
    // ============================================
    
    FUNCIÓN alMontarPaso3():
        SI coordenadasGPS es null:
            LLAMAR capturarGPS()
        
        SI listaCentrosGestores está vacía:
            LLAMAR cargarCentrosGestores()
    
    
    FUNCIÓN capturarGPS():
        cargando = true
        error = null
        
        SI Geolocalización NO está disponible:
            error = "GPS no disponible en este dispositivo"
            cargando = false
            RETORNAR
        
        INTENTAR:
            posición = AWAIT navigator.geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            })
            
            coordenadasGPS = {
                latitude: posición.coords.latitude,
                longitude: posición.coords.longitude,
                accuracy: posición.coords.accuracy,
                timestamp: posición.timestamp
            }
            
            cargando = false
            MOSTRAR coordenadas en pantalla (solo lectura)
            
        CAPTURAR error:
            SI error.code == PERMISSION_DENIED:
                error = "Permiso de ubicación denegado"
            SI error.code == POSITION_UNAVAILABLE:
                error = "Ubicación no disponible. Activa el GPS"
            SI error.code == TIMEOUT:
                error = "Tiempo agotado al obtener ubicación"
            
            cargando = false
    
    
    FUNCIÓN cargarCentrosGestores():
        cargando = true
        
        INTENTAR:
            respuesta = AWAIT API.GET("/centros-gestores/nombres-unicos")
            
            // Transformar array de strings a objetos
            listaCentrosGestores = respuesta.MAP(nombre => {
                label: nombre,
                value: nombre
            })
            
            cargando = false
        CAPTURAR error:
            error = "Error al cargar centros gestores"
            cargando = false
    
    
    FUNCIÓN agregarUPEntorno(centroGestor, descripcion):
        SI centroGestor está vacío O descripcion está vacía:
            RETORNAR
        
        nuevoEntorno = {
            id: GENERAR_ID_UNICO(),  // timestamp + random
            centro_gestor: centroGestor,
            descripcion_complemento: descripcion
        }
        
        AGREGAR nuevoEntorno a upEntorno
        
        // Limpiar campos del formulario
        RESETEAR campos de entrada
    
    
    FUNCIÓN eliminarUPEntorno(id):
        upEntorno = FILTRAR upEntorno DONDE entorno.id != id
    
    
    FUNCIÓN validarPaso3():
        SI coordenadasGPS es null:
            RETORNAR false
        
        SI descripcionIntervencion está vacío:
            RETORNAR false
        
        SI descripcionSolicitud está vacío:
            RETORNAR false
        
        RETORNAR true
    
    
    // ============================================
    // PASO 4: COMUNICACIONES Y CIERRE
    // ============================================
    
    FUNCIÓN alMontarPaso4():
        SI estado360 es null:
            estado360 = LLAMAR inferirEstado360()
    
    
    FUNCIÓN inferirEstado360():
        avance = upSeleccionada.avance_obra
        
        SI avance < 30:
            RETORNAR "Antes"
        SI avance >= 30 Y avance < 90:
            RETORNAR "Durante"
        SI avance >= 90:
            RETORNAR "Después"
        
        // Por defecto
        RETORNAR "Durante"
    
    
    FUNCIÓN manejarSeleccionFotos(archivos):
        fotos = []
        vistasPrevias = []
        
        PARA CADA archivo EN archivos:
            // Generar vista previa
            reader = new FileReader()
            
            reader.onload = (evento) => {
                vistasPrevias.AGREGAR(evento.target.result)
            }
            
            reader.readAsDataURL(archivo)
            fotos.AGREGAR(archivo)
    
    
    FUNCIÓN eliminarFoto(indice):
        fotos = ELIMINAR foto en posición indice
        vistasPrevias = ELIMINAR vista en posición indice
    
    
    FUNCIÓN validarPaso4():
        SI estado360 es null:
            RETORNAR false
        
        SI viabilidadAlcalde es null:
            RETORNAR false
        
        SI entregaPublica es null:
            RETORNAR false
        
        RETORNAR true
    
    
    // ============================================
    // NAVEGACIÓN ENTRE PASOS
    // ============================================
    
    FUNCIÓN irSiguientePaso():
        pasoActualEsValido = LLAMAR validarPaso(pasoActual)
        
        SI NO pasoActualEsValido:
            MOSTRAR mensaje de error
            RETORNAR
        
        // Marcar paso como completado
        SI pasoActual NO está en pasosCompletados:
            AGREGAR pasoActual a pasosCompletados
        
        // Avanzar
        SI pasoActual < 4:
            pasoActual = pasoActual + 1
            ACTUALIZAR UI del stepper
    
    
    FUNCIÓN irPasoAnterior():
        SI pasoActual > 0:
            pasoActual = pasoActual - 1
            ACTUALIZAR UI del stepper
    
    
    FUNCIÓN irAPaso(numeroPaso):
        // Solo permite ir a pasos ya visitados o el siguiente
        SI numeroPaso <= pasoActual:
            pasoActual = numeroPaso
            ACTUALIZAR UI del stepper
    
    
    FUNCIÓN validarPaso(numeroPaso):
        SEGÚN numeroPaso:
            CASO 0: RETORNAR validarPaso0()
            CASO 1: RETORNAR validarPaso1()
            CASO 2: RETORNAR validarPaso2()
            CASO 3: RETORNAR validarPaso3()
            CASO 4: RETORNAR validarPaso4()
    
    
    // ============================================
    // ENVÍO DEL FORMULARIO
    // ============================================
    
    FUNCIÓN enviarFormulario():
        enviando = true
        error = null
        
        SI NO validarPaso4():
            error = "Complete todos los campos requeridos"
            enviando = false
            RETORNAR
        
        INTENTAR:
            // 1. Subir fotos (si existen)
            urlsFotos = []
            
            SI fotos.length > 0:
                urlsFotos = AWAIT subirFotos(fotos)
            
            // 2. Preparar datos completos
            datosVisita = {
                tipo_visita: tipoVisita,
                upid: upSeleccionada.upid,
                nombre_up: upSeleccionada.nombre_up,
                validacion: validacionDatos,
                coordenadas_gps: coordenadasGPS,
                descripcion_intervencion: descripcionIntervencion,
                descripcion_solicitud: descripcionSolicitud,
                up_entorno: upEntorno,
                estado_360: estado360,
                viabilidad_alcalde: viabilidadAlcalde,
                entrega_publica: entregaPublica,
                campo_comunicaciones: campoComunicaciones,
                photos_url: urlsFotos,
                fecha_registro: FECHA_ACTUAL_ISO()
            }
            
            // 3. Enviar al backend
            respuesta = AWAIT API.POST("/visitas-verificacion", datosVisita)
            
            SI respuesta.success:
                MOSTRAR mensaje de éxito
                ESPERAR 2 segundos
                LLAMAR resetearFormulario()
                CERRAR modal/vista
            SINO:
                error = "Error al registrar visita"
            
        CAPTURAR error:
            error = "No se pudo enviar la visita: " + error.mensaje
        
        FINALMENTE:
            enviando = false
    
    
    FUNCIÓN subirFotos(archivos):
        // TODO: Implementar según estrategia elegida
        // Opción 1: Firebase Storage
        // Opción 2: Endpoint backend Railway
        // Opción 3: S3/CloudStorage
        
        urls = []
        
        PARA CADA archivo EN archivos:
            // Comprimir imagen si es necesario
            imagenComprimida = AWAIT comprimirImagen(archivo)
            
            // Subir a storage
            url = AWAIT STORAGE.upload(imagenComprimida)
            urls.AGREGAR(url)
        
        RETORNAR urls
    
    
    // ============================================
    // UTILIDADES
    // ============================================
    
    FUNCIÓN calcularProgreso():
        totalPasos = 5
        progreso = (pasosCompletados.length / totalPasos) * 100
        RETORNAR progreso
    
    
    FUNCIÓN formatearCoordenadas(coords):
        lat = coords.latitude.toFixed(6)
        lng = coords.longitude.toFixed(6)
        latDir = coords.latitude >= 0 ? "N" : "S"
        lngDir = coords.longitude >= 0 ? "E" : "W"
        
        RETORNAR lat + "° " + latDir + ", " + lng + "° " + lngDir
    
    
    FUNCIÓN confirmarCancelacion():
        SI CONFIRMAR("¿Cancelar? Se perderán los datos"):
            LLAMAR resetearFormulario()
            CERRAR vista


// ============================================
// EJEMPLO DE USO
// ============================================

AL_CARGAR_COMPONENTE:
    formulario = new FormularioVisitaVerificacion()
    formulario.inicializar()

CUANDO usuario_hace_clic_en_nueva_visita:
    formulario.resetearFormulario()
    MOSTRAR formulario

CUANDO usuario_completa_paso:
    formulario.irSiguientePaso()

CUANDO usuario_envía_formulario:
    formulario.enviarFormulario()
```

---

## 🔄 Flujo de Datos Reactivo (Svelte)

```pseudocode
// Store reactivo en Svelte
STORE visitaStore:
    
    // Estado observable
    $state = {
        currentStep: 0,
        data: {},
        isLoading: false,
        error: null
    }
    
    // Cualquier componente puede suscribirse
    COMPONENTE.subscribe($state)
    
    // Los cambios se propagan automáticamente
    CUANDO $state.currentStep cambia:
        TODOS los componentes suscritos se actualizan
    
    // Derived stores (valores calculados)
    $formProgress = calcular(($state.completedSteps.size / 5) * 100)
    $isValid = calcular validación del paso actual
    
    // Los componentes reaccionan automáticamente
    <Button disabled={!$isValid} />
```

---

## 📊 Diagrama de Flujo

```
┌─────────────────┐
│   Paso 0        │
│ Tipo de Visita  │
│   (Card UI)     │
└────────┬────────┘
         │
         ▼ Selecciona "Verificación"
┌─────────────────┐
│   Paso 1        │
│ Selección UP    │
│ (Select Search) │
└────────┬────────┘
         │
         ▼ Selecciona UP
┌─────────────────┐
│   Paso 2        │
│  Validación     │
│   (Card +       │
│   Yes/No)       │
└────────┬────────┘
         │
         ▼ Valida datos
┌─────────────────┐
│   Paso 3        │
│   Captura       │
│  - GPS Auto     │
│  - Textareas    │
│  - UP Entorno   │
└────────┬────────┘
         │
         ▼ Completa campos
┌─────────────────┐
│   Paso 4        │
│ Comunicaciones  │
│  - Estado 360   │
│  - Toggles      │
│  - Fotos        │
└────────┬────────┘
         │
         ▼ Enviar
┌─────────────────┐
│  POST /visitas  │
│   Backend API   │
└────────┬────────┘
         │
         ▼
    ✅ ÉXITO
```

---

## 🎯 Patrones de Diseño Utilizados

1. **State Management Pattern**: Store centralizado (visitaStore)
2. **Observer Pattern**: Componentes reactivos suscritos al store
3. **Strategy Pattern**: Validaciones por paso
4. **Composite Pattern**: Componentes UI compuestos
5. **Factory Pattern**: Creación de objetos UP Entorno
6. **Singleton Pattern**: ApiClient único

---

**Nota**: Este pseudocódigo es una representación simplificada. La implementación real en Svelte + TypeScript es más robusta y type-safe.
