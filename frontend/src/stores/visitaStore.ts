/**
 * Store Svelte para gestionar el estado del formulario de Visitas de Verificación
 */

import { writable, derived, get } from 'svelte/store';
import type {
  FormularioState,
  VisitaVerificacion,
  StepNumber,
  UnidadProyecto,
  CentroGestor,
  UPEntorno,
  Estado360
} from '../types/visitas';
import { fetchUnidadesProyecto, fetchCentrosGestores } from '../api/visitas';
import { getCurrentPosition } from '../lib/geolocation';

/**
 * Estado inicial del formulario
 */
const initialState: FormularioState = {
  currentStep: 0,
  completedSteps: new Set<StepNumber>(),
  data: {
    tipo_visita: 'verificacion',
    descripcion_intervencion: '',
    descripcion_solicitud: '',
    up_entorno: [],
    photos_url: [],
    fecha_registro: new Date().toISOString(),
    viabilidad_alcalde: false,
    entrega_publica: false
  },
  isLoading: false,
  error: null,
  unidadesProyecto: [],
  centrosGestores: [],
  selectedUP: null
};

/**
 * Store principal del formulario
 */
function createVisitaStore() {
  const { subscribe, set, update } = writable<FormularioState>(initialState);

  return {
    subscribe,
    
    /**
     * Resetea el formulario al estado inicial
     */
    reset: () => {
      set({
        ...initialState,
        data: {
          tipo_visita: 'verificacion',
          descripcion_intervencion: '',
          descripcion_solicitud: '',
          up_entorno: [],
          photos_url: [],
          fecha_registro: new Date().toISOString(),
          viabilidad_alcalde: false,
          entrega_publica: false
        },
        completedSteps: new Set<StepNumber>()
      });
    },

    /**
     * Navega al siguiente paso
     */
    nextStep: () => {
      update(state => {
        const nextStep = Math.min(state.currentStep + 1, 4) as StepNumber;
        
        let updates: Partial<VisitaVerificacion> = {};
        
        // Si vamos al paso 4, inicializar datos si faltan
        if (nextStep === 4) {
            const currentData = state.data;
            
            // 1. Estado 360
            if (!currentData.estado_360) {
                const estadoProyecto = state.selectedUP?.estado || '';
                let inferred: Estado360 = 'Después'; // Default fallback
                
                // Normalizar para comparación
                const estadoNorm = estadoProyecto.trim();
                
                if (estadoNorm === 'En alistamiento') inferred = 'Antes';
                else if (estadoNorm === 'En ejecución' || estadoNorm === 'Suspendido') inferred = 'Durante';
                else if (estadoNorm === 'Terminado' || estadoNorm === 'Inaugurado') inferred = 'Después';
                else {
                     // Fallback a avance_obra
                     const avance = state.selectedUP?.avance_obra || 0;
                     if (avance < 30) inferred = 'Antes';
                     else if (avance < 90) inferred = 'Durante';
                     else inferred = 'Después';
                }
                updates.estado_360 = inferred;
                console.log('Estado 360 inferido en nextStep:', inferred, 'desde estado:', estadoProyecto);
            }
            
            // 2. Toggles
            if (currentData.viabilidad_alcalde === undefined) updates.viabilidad_alcalde = false;
            if (currentData.entrega_publica === undefined) updates.entrega_publica = false;
        }

        // Crear nuevo Set con el paso actual agregado (inmutabilidad)
        const newCompletedSteps = new Set(state.completedSteps);
        newCompletedSteps.add(state.currentStep);
        
        console.log('nextStep - Agregando paso', state.currentStep, 'a completados. Nuevos completados:', Array.from(newCompletedSteps));
        
        return {
          ...state,
          currentStep: nextStep,
          completedSteps: newCompletedSteps,
          data: { ...state.data, ...updates }
        };
      });
    },

    /**
     * Navega al paso anterior
     */
    previousStep: () => {
      update(state => ({
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0) as StepNumber
      }));
    },

    /**
     * Va a un paso específico
     */
    goToStep: (step: StepNumber) => {
      update(state => ({ ...state, currentStep: step }));
    },

    /**
     * Actualiza los datos del formulario
     */
    updateData: (partialData: Partial<VisitaVerificacion>) => {
      update(state => ({
        ...state,
        data: { ...state.data, ...partialData }
      }));
    },

    /**
     * Selecciona una Unidad de Proyecto
     */
    selectUnidadProyecto: (up: UnidadProyecto) => {
      update(state => ({
        ...state,
        selectedUP: up,
        data: {
          ...state.data,
          upid: up.upid,
          nombre_up: up.nombre_up
        }
      }));
    },

    /**
     * Pre-selecciona el Estado 360 basado en el estado del proyecto
     */
    inferEstado360: (): Estado360 => {
      const state = get({ subscribe });
      const estadoProyecto = state.selectedUP?.estado || '';
      
      // Mapeo basado en el estado del proyecto (igual que el backend)
      if (estadoProyecto === 'En alistamiento') return 'Antes';
      if (estadoProyecto === 'En ejecución' || estadoProyecto === 'Suspendido') return 'Durante';
      if (estadoProyecto === 'Terminado' || estadoProyecto === 'Inaugurado') return 'Después';
      
      // Fallback: usar avance_obra si el estado no coincide
      const avance = state.selectedUP?.avance_obra || 0;
      if (avance < 30) return 'Antes';
      if (avance >= 30 && avance < 90) return 'Durante';
      return 'Después';
    },

    /**
     * Agrega un registro de UP Entorno
     */
    addUPEntorno: (entorno: Omit<UPEntorno, 'id'>) => {
      update(state => {
        const newEntorno: UPEntorno = {
          ...entorno,
          id: `entorno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        return {
          ...state,
          data: {
            ...state.data,
            up_entorno: [...(state.data.up_entorno || []), newEntorno]
          }
        };
      });
    },

    /**
     * Elimina un registro de UP Entorno
     */
    removeUPEntorno: (id: string) => {
      update(state => ({
        ...state,
        data: {
          ...state.data,
          up_entorno: (state.data.up_entorno || []).filter(e => e.id !== id)
        }
      }));
    },

    /**
     * Actualiza un registro de UP Entorno
     */
    updateUPEntorno: (id: string, updates: Partial<UPEntorno>) => {
      update(state => ({
        ...state,
        data: {
          ...state.data,
          up_entorno: (state.data.up_entorno || []).map(e =>
            e.id === id ? { ...e, ...updates } : e
          )
        }
      }));
    },

    /**
     * Captura coordenadas GPS automáticamente
     */
    captureGPS: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const coords = await getCurrentPosition();
        update(state => ({
          ...state,
          isLoading: false,
          data: {
            ...state.data,
            coordenadas_gps: coords
          }
        }));
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error al capturar GPS'
        }));
      }
    },

    /**
     * Carga las Unidades de Proyecto desde la API
     */
    loadUnidadesProyecto: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const ups = await fetchUnidadesProyecto();
        update(state => ({
          ...state,
          isLoading: false,
          unidadesProyecto: ups
        }));
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error al cargar UPs'
        }));
      }
    },

    /**
     * Carga los Centros Gestores desde la API
     */
    loadCentrosGestores: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const centros = await fetchCentrosGestores();
        update(state => ({
          ...state,
          isLoading: false,
          centrosGestores: centros
        }));
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error al cargar centros gestores'
        }));
      }
    },

    /**
     * Establece estado de error
     */
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },

    /**
     * Establece estado de carga
     */
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    }
  };
}

/**
 * Store global del formulario de visitas
 */
export const visitaStore = createVisitaStore();

/**
 * Derived stores útiles
 */

// Progreso del formulario (0-100%)
export const formProgress = derived(
  visitaStore,
  $store => (($store.completedSteps.size / 5) * 100)
);

// Verifica si el paso actual está completo
export const isCurrentStepValid = derived(
  visitaStore,
  $store => {
    const { currentStep, data, selectedUP } = $store;
    
    switch (currentStep) {
      case 0:
        return !!data.tipo_visita;
      
      case 1:
        return !!selectedUP;
      
      case 2:
        return data.validacion !== undefined &&
               (data.validacion.esCorrecta || !!data.validacion.comentario);
      
      case 3:
        const hasGPS = !!data.coordenadas_gps;
        const hasIntervencion = !!data.descripcion_intervencion?.trim();
        const hasSolicitud = !!data.descripcion_solicitud?.trim();
        console.log('Validación Step 3:', { 
          hasGPS, 
          hasIntervencion, 
          hasSolicitud,
          gps: data.coordenadas_gps,
          intervencion: data.descripcion_intervencion,
          solicitud: data.descripcion_solicitud
        });
        return hasGPS && hasIntervencion && hasSolicitud;
      
      case 4:
        // Validar que estado_360 esté definido y que los toggles tengan valor booleano
        const hasEstado360 = data.estado_360 !== undefined && data.estado_360 !== null;
        const hasViabilidad = typeof data.viabilidad_alcalde === 'boolean';
        const hasEntrega = typeof data.entrega_publica === 'boolean';
        console.log('Validación Step 4:', { hasEstado360, hasViabilidad, hasEntrega, data: { estado_360: data.estado_360, viabilidad: data.viabilidad_alcalde, entrega: data.entrega_publica } });
        return hasEstado360 && hasViabilidad && hasEntrega;
      
      default:
        return false;
    }
  }
);

// Nombres de los pasos para el stepper UI
export const stepNames = [
  'Tipo de Visita',
  'Selección UP',
  'Validación',
  'Captura Técnica',
  'Comunicaciones'
];
