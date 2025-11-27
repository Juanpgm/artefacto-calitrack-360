// Utilidad para hacer peticiones autenticadas a la API
import { authStore } from '../stores/authStore';
import { get } from 'svelte/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gestorproyectoapi-production.up.railway.app';

/**
 * Cliente HTTP con autenticación automática
 */
export class ApiClient {
  /**
   * Obtiene headers con autenticación
   */
  private static async getHeaders(): Promise<HeadersInit> {
    const state = get(authStore);
    
    if (!state.token) {
      // Intentar refrescar token
      const newToken = await authStore.refreshToken();
      if (!newToken) {
        throw new Error('No authentication token available');
      }
      return {
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    }

    return {
      'Authorization': `Bearer ${state.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * GET request
   */
  static async get<T = any>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getHeaders();
      console.log(`[API] GET ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers
      });

      console.log(`[API] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Error response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[API] Response data:`, data);
      return data;
    } catch (error) {
      console.error(`[API] Request failed:`, error);
      throw error;
    }
  }

  /**
   * POST request
   */
  static async post<T = any>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * PUT request
   */
  static async put<T = any>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
