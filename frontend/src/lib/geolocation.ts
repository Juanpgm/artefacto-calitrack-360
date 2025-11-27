/**
 * Utilidad para capturar coordenadas GPS del dispositivo móvil
 */

import type { Coordenadas } from '../types/visitas';

/**
 * Opciones para la geolocalización
 */
interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Verifica si la API de Geolocalización está disponible
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Captura las coordenadas GPS actuales del dispositivo
 * @param options - Opciones de geolocalización
 * @returns Promise con las coordenadas capturadas
 */
export async function getCurrentPosition(
  options: GeolocationOptions = {}
): Promise<Coordenadas> {
  if (!isGeolocationAvailable()) {
    throw new Error('La geolocalización no está disponible en este dispositivo');
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true, // Usar GPS de alta precisión
    timeout: 10000, // 10 segundos máximo
    maximumAge: 0, // No usar caché, obtener posición actual
    ...options
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordenadas = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        resolve(coords);
      },
      (error) => {
        let errorMessage = 'Error al obtener ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación en tu dispositivo.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible. Verifica que tu GPS esté activado.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      defaultOptions
    );
  });
}

/**
 * Observa cambios en la posición GPS (útil para tracking en tiempo real)
 * @param callback - Función que se ejecuta cada vez que cambia la posición
 * @param options - Opciones de geolocalización
 * @returns ID del watcher para poder detenerlo después
 */
export function watchPosition(
  callback: (coords: Coordenadas) => void,
  onError?: (error: Error) => void,
  options: GeolocationOptions = {}
): number {
  if (!isGeolocationAvailable()) {
    throw new Error('La geolocalización no está disponible en este dispositivo');
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000, // Aceptar posiciones de hasta 5 segundos de antigüedad
    ...options
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      const coords: Coordenadas = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      callback(coords);
    },
    (error) => {
      if (onError) {
        onError(new Error(error.message));
      }
    },
    defaultOptions
  );
}

/**
 * Detiene el seguimiento de posición
 * @param watchId - ID retornado por watchPosition
 */
export function clearWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Formatea coordenadas para mostrar en UI
 * @param coords - Coordenadas a formatear
 * @returns String formateado (ej: "4.6097° N, 74.0817° W")
 */
export function formatCoordinates(coords: Coordenadas): string {
  const lat = coords.latitude.toFixed(6);
  const lng = coords.longitude.toFixed(6);
  const latDir = coords.latitude >= 0 ? 'N' : 'S';
  const lngDir = coords.longitude >= 0 ? 'E' : 'W';
  
  return `${lat}° ${latDir}, ${lng}° ${lngDir}`;
}

/**
 * Calcula la distancia entre dos coordenadas (fórmula de Haversine)
 * @param coords1 - Primera coordenada
 * @param coords2 - Segunda coordenada
 * @returns Distancia en metros
 */
export function calculateDistance(coords1: Coordenadas, coords2: Coordenadas): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (coords1.latitude * Math.PI) / 180;
  const φ2 = (coords2.latitude * Math.PI) / 180;
  const Δφ = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
  const Δλ = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}
