/**
 * Servicio API para el módulo de Visitas de Verificación
 */

import { ApiClient } from '../lib/api-client';
import type { UnidadProyecto, CentroGestor, VisitaVerificacion } from '../types/visitas';

/**
 * Obtiene el listado de Unidades de Proyecto filtrado para 360
 * Endpoint: GET /unidades-proyecto/init-360
 */
export async function fetchUnidadesProyecto(): Promise<UnidadProyecto[]> {
  try {
    const response = await ApiClient.get<{
      success: boolean;
      data: UnidadProyecto[];
      count: number;
      timestamp: string;
    }>('/unidades-proyecto/init-360');
    
    console.log('API Response:', response);
    
    if (!response.success || !response.data) {
      throw new Error('Respuesta inválida del servidor');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al cargar unidades de proyecto:', error);
    throw new Error('No se pudieron cargar las unidades de proyecto');
  }
}

/**
 * Obtiene los nombres únicos de Centros Gestores
 * Endpoint: GET /centros-gestores/nombres-unicos
 */
export async function fetchCentrosGestores(): Promise<CentroGestor[]> {
  try {
    const response = await ApiClient.get<{
      success: boolean;
      data: string[];
      count: number;
    }>('/centros-gestores/nombres-unicos');
    
    console.log('API Response Centros Gestores:', response);
    
    if (!response.success || !response.data) {
      throw new Error('Respuesta inválida del servidor');
    }
    
    // Transformar array de strings a formato { label, value }
    return response.data.map((nombre) => ({
      label: nombre,
      value: nombre
    }));
  } catch (error) {
    console.error('Error al cargar centros gestores:', error);
    throw new Error('No se pudieron cargar los centros gestores');
  }
}

/**
 * Respuesta del endpoint POST /unidades-proyecto/captura-estado-360
 */
interface CapturaEstado360Response {
  success: boolean;
  message: string;
  data: Record<string, any>;
  document_id: string;
  estado_360: string;
  photos_uploaded: Array<Record<string, any>>;
  photos_failed: Array<Record<string, any>>;
  timestamp: string;
}

/**
 * Respuesta del endpoint GET /unidades-proyecto/captura-estado-360
 */
interface HistorialVisitasResponse {
  success: boolean;
  data: any[];
  count: number;
  filtros_aplicados: Record<string, any>;
  collection: string;
  timestamp: string;
}

/**
 * Crea/actualiza un registro de captura estado 360 para una unidad de proyecto
 * Endpoint: POST /unidades-proyecto/captura-estado-360
 * 
 * @param visitaData - Datos de la visita de verificación
 * @param selectedUP - Unidad de proyecto seleccionada (para datos complementarios)
 * @param userEmail - Email del usuario registrado
 * @param userDisplayName - Nombre del usuario registrado
 * @returns Respuesta del servidor con el document_id y URLs de fotos
 */
export async function createVisitaVerificacion(
  visitaData: VisitaVerificacion,
  selectedUP: UnidadProyecto,
  userEmail: string,
  userDisplayName: string,
  photoFiles: File[] = []
): Promise<CapturaEstado360Response> {
  try {
    const formData = new FormData();
    
    // Campos requeridos según la API
    formData.append('upid', selectedUP.upid.toString());
    formData.append('nombre_up', selectedUP.nombre_up);
    formData.append('nombre_up_detalle', visitaData.validacion?.comentario || selectedUP.tipo_equipamiento || '');
    formData.append('descripcion_intervencion', visitaData.descripcion_intervencion);
    formData.append('solicitud_intervencion', visitaData.descripcion_solicitud);
    
    // Centro gestor (del primer elemento de up_entorno o vacío)
    const centroGestor = visitaData.up_entorno?.[0]?.centro_gestor || '';
    const solicitudCentroGestor = visitaData.up_entorno?.[0]?.descripcion_complemento || '';
    formData.append('nombre_centro_gestor', centroGestor);
    formData.append('solicitud_centro_gestor', solicitudCentroGestor);
    
    // Estado 360 - El backend lo calcula automáticamente, pero lo enviamos igual
    formData.append('estado_360', visitaData.estado_360);
    
    // Booleanos
    formData.append('requiere_alcalde', visitaData.viabilidad_alcalde.toString());
    formData.append('entrega_publica', visitaData.entrega_publica.toString());
    
    // Tipo de visita
    formData.append('tipo_visita', visitaData.tipo_visita === 'verificacion' ? 'Verificación' : 'Comunicaciones');
    
    // Usuario registrado
    formData.append('registrado_por_username', userDisplayName);
    formData.append('registrado_por_email', userEmail);
    
    // Coordenadas GPS
    const coords = visitaData.coordenadas_gps;
    if (coords) {
      formData.append('coordinates_type', 'Point');
      formData.append('coordinates_data', JSON.stringify([coords.longitude, coords.latitude]));
    } else if (selectedUP.geometry) {
      // Usar las coordenadas del proyecto si no hay GPS
      formData.append('coordinates_type', selectedUP.geometry.type || 'Point');
      formData.append('coordinates_data', JSON.stringify(selectedUP.geometry.coordinates));
    } else {
      // Coordenadas por defecto (Cali)
      formData.append('coordinates_type', 'Point');
      formData.append('coordinates_data', '[-76.5225, 3.4516]');
    }
    
    // Fotos - El backend las sube a S3
    if (photoFiles && photoFiles.length > 0) {
      photoFiles.forEach((file) => {
        formData.append('photosUrl', file);
      });
    } else {
      console.warn('No se han adjuntado fotos para la visita');
    }
    
    // Hacer la petición POST usando fetch directamente porque necesitamos FormData
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gestorproyectoapi-production.up.railway.app';
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/unidades-proyecto/captura-estado-360`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    const result: CapturaEstado360Response = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al registrar la visita');
    }
    
    console.log('Visita registrada exitosamente:', result);
    return result;
    
  } catch (error) {
    console.error('Error al crear visita de verificación:', error);
    throw error instanceof Error ? error : new Error('No se pudo registrar la visita de verificación');
  }
}

/**
 * Obtiene el historial de visitas registradas con filtros opcionales
 * Endpoint: GET /unidades-proyecto/captura-estado-360
 * 
 * @param filtros - Filtros opcionales (upid, nombre_centro_gestor, estado_360, tipo_visita)
 * @returns Lista de visitas registradas
 */
export async function fetchHistorialVisitas(filtros?: {
  upid?: string;
  nombre_centro_gestor?: string;
  estado_360?: string;
  tipo_visita?: string;
}): Promise<HistorialVisitasResponse> {
  try {
    // Construir query params
    const params = new URLSearchParams();
    if (filtros?.upid) params.append('upid', filtros.upid);
    if (filtros?.nombre_centro_gestor) params.append('nombre_centro_gestor', filtros.nombre_centro_gestor);
    if (filtros?.estado_360) params.append('estado_360', filtros.estado_360);
    if (filtros?.tipo_visita) params.append('tipo_visita', filtros.tipo_visita);
    
    const queryString = params.toString();
    const endpoint = `/unidades-proyecto/captura-estado-360${queryString ? `?${queryString}` : ''}`;
    
    const response = await ApiClient.get<HistorialVisitasResponse>(endpoint);
    
    if (!response.success) {
      throw new Error('Respuesta inválida del servidor');
    }
    
    console.log(`Historial de visitas obtenido: ${response.count} registros`);
    return response;
    
  } catch (error) {
    console.error('Error al obtener historial de visitas:', error);
    throw new Error('No se pudo cargar el historial de visitas');
  }
}

/**
 * Prepara los archivos de fotos para el envío
 * Esta función convierte File objects a un formato compatible con FormData
 * 
 * @param photos - Array de archivos File o URLs
 * @returns Array de archivos File listos para FormData
 */
export function preparePhotosForUpload(photos: (File | string)[]): File[] {
  return photos.filter((photo): photo is File => photo instanceof File);
}
