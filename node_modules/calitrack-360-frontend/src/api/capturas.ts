// API Cliente para "Artefacto de Captura #360"
import { getAuthHeaders } from './auth';

const API_BASE_URL = 'https://gestorproyectoapi-production.up.railway.app';

/**
 * Interfaces para el artefacto de captura
 * Estas se actualizarán según la documentación real de la API
 */
export interface CapturaData {
  proyecto_id?: string;
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
  fotos?: string[];
  observaciones?: string;
  fecha_captura?: string;
}

/**
 * Obtener capturas - Endpoint del "Artefacto de Captura #360"
 * Este es un placeholder que se actualizará con el endpoint real
 */
export const getCapturas = async () => {
  const response = await fetch(`${API_BASE_URL}/capturas`, {
    method: 'GET',
    headers: await getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Error al obtener capturas');
  }

  return response.json();
};

/**
 * Crear una nueva captura - Endpoint del "Artefacto de Captura #360"
 * Este es un placeholder que se actualizará con el endpoint real
 */
export const crearCaptura = async (data: CapturaData) => {
  const response = await fetch(`${API_BASE_URL}/capturas`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Error al crear captura');
  }

  return response.json();
};

/**
 * Subir fotos - Endpoint del "Artefacto de Captura #360"
 * Este es un placeholder que se actualizará con el endpoint real
 */
export const subirFoto = async (foto: File) => {
  const formData = new FormData();
  formData.append('file', foto);

  const headers = await getAuthHeaders();
  // Para FormData, no incluir Content-Type para que el navegador lo establezca con el boundary
  const { 'Content-Type': _, ...headersWithoutContentType } = headers as any;

  const response = await fetch(`${API_BASE_URL}/capturas/fotos`, {
    method: 'POST',
    headers: headersWithoutContentType,
    body: formData
  });

  if (!response.ok) {
    throw new Error('Error al subir foto');
  }

  return response.json();
};
