/**
 * Tipos y estructuras de datos para el Módulo de Visitas de Verificación
 */

// ============================================
// 1. TIPOS PARA DATOS DE LA API
// ============================================

/**
 * Unidad de Proyecto (UP) desde /unidades-proyecto/init-360
 */
export interface UnidadProyecto {
  upid: number;
  nombre_up: string;
  nombre_up_detalle?: string;
  tipo_equipamiento: string;
  tipo_intervencion?: string;
  estado: string;
  avance_obra?: number | null;
  presupuesto_base?: number | null;
  geometry?: {
    type: 'Point' | 'LineString' | 'MultiLineString' | 'Polygon' | string;
    coordinates: string | [number, number] | [number, number][] | [number, number][][]; // Puede venir como string JSON
  } | null;
  // Campos adicionales que pueda retornar la API
  localidad?: string;
  direccion?: string;
  alcalde_local?: string;
}

/**
 * Centro Gestor desde /centros-gestores/nombres-unicos
 */
export interface CentroGestor {
  label: string;
  value: string;
}

// ============================================
// 2. TIPOS PARA EL FORMULARIO
// ============================================

/**
 * Tipo de visita
 */
export type TipoVisita = 'verificacion' | 'comunicaciones';

/**
 * Estado 360
 */
export type Estado360 = 'Antes' | 'Durante' | 'Después';

/**
 * Registro dinámico de UP Entorno
 */
export interface UPEntorno {
  id: string; // ID único temporal para manejo en frontend
  centro_gestor: string;
  descripcion_complemento: string;
}

/**
 * Coordenadas GPS
 */
export interface Coordenadas {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

/**
 * Respuesta de validación del Paso 2
 */
export interface ValidacionDatos {
  esCorrecta: boolean;
  comentario?: string; // Obligatorio si esCorrecta = false
}

// ============================================
// 3. ESTRUCTURA DEL FORMULARIO COMPLETO
// ============================================

/**
 * Datos completos de la Visita de Verificación
 * Este es el JSON final que se enviará al backend
 */
export interface VisitaVerificacion {
  // Paso 0
  tipo_visita: TipoVisita;
  
  // Paso 1 & 2
  upid: number;
  nombre_up: string;
  validacion: ValidacionDatos;
  
  // Paso 3
  coordenadas_gps: Coordenadas;
  descripcion_intervencion: string;
  descripcion_solicitud: string;
  up_entorno: UPEntorno[]; // Array de objetos dinámicos
  
  // Paso 4
  estado_360: Estado360;
  viabilidad_alcalde: boolean;
  entrega_publica: boolean;
  photos_url: string[]; // URLs de las fotos subidas
  
  // Metadata
  fecha_registro: string; // ISO 8601
  usuario_id?: string; // Si tienes autenticación
}

// ============================================
// 4. ESTADO DEL STEPPER
// ============================================

/**
 * Paso activo del formulario
 */
export type StepNumber = 0 | 1 | 2 | 3 | 4;

/**
 * Estado completo del formulario progresivo
 */
export interface FormularioState {
  currentStep: StepNumber;
  completedSteps: Set<StepNumber>;
  
  // Datos del formulario
  data: Partial<VisitaVerificacion>;
  
  // Estado de carga
  isLoading: boolean;
  error: string | null;
  
  // Datos auxiliares cargados
  unidadesProyecto: UnidadProyecto[];
  centrosGestores: CentroGestor[];
  selectedUP: UnidadProyecto | null;
}

// ============================================
// 5. TIPOS PARA VALIDACIÓN
// ============================================

/**
 * Resultado de validación de un paso
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Configuración de validación por paso
 */
export type StepValidation = {
  [K in StepNumber]: (data: Partial<VisitaVerificacion>) => ValidationResult;
};
