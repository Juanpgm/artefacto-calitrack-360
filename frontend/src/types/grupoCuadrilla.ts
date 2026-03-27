/**
 * Tipos y estructuras de datos para el Módulo de Grupo Cuadrilla
 */

// ============================================
// 1. TIPOS DE ÁRBOLES
// ============================================

/**
 * Árbol individual con especie y cantidad
 */
export interface ArbolItem {
  especie: string;
  cantidad: number;
}

// ============================================
// 2. TIPOS PARA EL FORMULARIO
// ============================================

/**
 * Datos del formulario de Reporte de Intervención
 */
export interface ReporteIntervencionForm {
  arboles: ArbolItem[];
  descripcion?: string;
  fecha_reporte?: string;
}

// ============================================
// 3. TIPOS PARA LA API
// ============================================

/**
 * Respuesta del endpoint POST /grupo-cuadrilla/reporte_intervencion
 */
export interface ReporteIntervencionResponse {
  success: boolean;
  message: string;
  document_id?: string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Respuesta del endpoint GET /grupo-cuadrilla/reporte_intervencion
 */
export interface ReporteIntervencionRecord {
  id?: string;
  arboles: ArbolItem[];
  descripcion?: string;
  fecha_reporte?: string;
  registrado_por?: string;
  timestamp?: string;
}
