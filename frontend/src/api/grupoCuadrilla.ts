/**
 * Servicio API para el módulo de Grupo Cuadrilla
 * Endpoint: POST /grupo-cuadrilla/reporte_intervencion
 *
 * El campo arboles_data reemplaza a los anteriores tipo_arbol y
 * numero_individuos_intervenidos. Ahora se envía como un array JSON
 * de objetos { especie, cantidad }.
 */

import type {
  ArbolItem,
  ReporteIntervencionResponse,
  ReporteIntervencionRecord
} from '../types/grupoCuadrilla';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://gestorproyectoapi-production.up.railway.app';

/**
 * Crea un reporte de intervención con la lista de árboles intervenidos.
 * Endpoint: POST /grupo-cuadrilla/reporte_intervencion
 *
 * @param arboles  - Lista de árboles: [{ especie, cantidad }, ...]
 * @param descripcion - Descripción opcional de la intervención
 * @returns Respuesta del servidor
 */
export async function createReporteIntervencion(
  arboles: ArbolItem[],
  descripcion?: string
): Promise<ReporteIntervencionResponse> {
  const token = localStorage.getItem('auth_token');

  const formData = new FormData();
  formData.append('arboles_data', JSON.stringify(arboles));
  if (descripcion?.trim()) {
    formData.append('descripcion', descripcion.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/grupo-cuadrilla/reporte_intervencion`,
    {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string }).message ||
        `Error ${response.status}: ${response.statusText}`
    );
  }

  const result: ReporteIntervencionResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Error al registrar el reporte');
  }

  return result;
}

/**
 * Obtiene el historial de reportes de intervención.
 * Endpoint: GET /grupo-cuadrilla/reporte_intervencion
 *
 * @returns Lista de reportes registrados
 */
export async function fetchReportesIntervencion(): Promise<
  ReporteIntervencionRecord[]
> {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(
    `${API_BASE_URL}/grupo-cuadrilla/reporte_intervencion`,
    {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // La API puede devolver un array directamente o un objeto con .data
  if (Array.isArray(data)) return data as ReporteIntervencionRecord[];
  if (Array.isArray(data?.data)) return data.data as ReporteIntervencionRecord[];

  return [];
}
