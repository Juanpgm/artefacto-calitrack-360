<script lang="ts">
  import { onMount } from 'svelte';
  import Input from '../ui/Input.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Select from '../ui/Select.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import type { Coordenadas, CentroGestor, UPEntorno, UnidadProyecto } from '../../types/visitas';
  import { formatCoordinates, calculateDistanceToGeometry } from '../../lib/geolocation';
  
  export let coordenadas: Coordenadas | undefined;
  export let descripcionIntervencion: string;
  export let descripcionSolicitud: string;
  export let upEntorno: UPEntorno[];
  export let centrosGestores: CentroGestor[];
  export let selectedUP: UnidadProyecto | undefined;
  export let onCaptureGPS: () => Promise<void>;
  export let onLoadCentros: () => Promise<void>;
  export let onAddEntorno: (entorno: Omit<UPEntorno, 'id'>) => void;
  export let onRemoveEntorno: (id: string) => void;
  export let onUpdateEntorno: (id: string, updates: Partial<UPEntorno>) => void;
  export let isLoading: boolean;

  let gpsError = '';
  let nuevoCentroGestor = '';
  let nuevaDescripcion = '';
  let autoCaptureAttempted = false;
  let distanceToProject: number | null = null;
  let showDistanceWarning = false;

  // Recalcular distancia cuando cambien las coordenadas
  $: if (coordenadas && selectedUP?.geometry) {
    distanceToProject = calculateDistanceToGeometry(coordenadas, selectedUP.geometry);
    showDistanceWarning = distanceToProject !== null && distanceToProject > 200;
  }

  onMount(async () => {
    // Cargar centros gestores si no están cargados
    if (centrosGestores.length === 0) {
      await onLoadCentros();
    }

    // Capturar GPS automáticamente al entrar al paso
    if (!coordenadas && !autoCaptureAttempted) {
      autoCaptureAttempted = true;
      await handleCaptureGPS();
    }
  });

  async function handleCaptureGPS() {
    gpsError = '';
    
    try {
      await onCaptureGPS();
    } catch (error) {
      gpsError = error instanceof Error ? error.message : 'Error al capturar GPS';
    }
  }

  function formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  }

  function handleAddEntorno() {
    if (!nuevoCentroGestor || !nuevaDescripcion.trim()) {
      return;
    }

    onAddEntorno({
      centro_gestor: nuevoCentroGestor,
      descripcion_complemento: nuevaDescripcion
    });

    // Resetear campos
    nuevoCentroGestor = '';
    nuevaDescripcion = '';
  }
</script>

<div class="step-container">
  <div class="step-header">
    <h2 class="step-title">Captura Técnica</h2>
    <p class="step-description">
      Registre la información técnica
    </p>
  </div>

  <div class="step-content">
    <!-- GPS -->
    <Card variant="outlined" padding="sm">
      <div class="gps-section">
        <div class="section-header">
          <h4>📍 Coordenadas GPS</h4>
          {#if coordenadas}
            <Button size="sm" variant="outline" onClick={handleCaptureGPS} disabled={isLoading}>
              {isLoading ? '...' : 'Actualizar'}
            </Button>
          {:else if gpsError}
            <Button size="sm" onClick={handleCaptureGPS} disabled={isLoading}>
              {isLoading ? '...' : 'Reintentar'}
            </Button>
          {/if}
        </div>

        {#if isLoading && !coordenadas}
          <div class="gps-loading">
            <div class="spinner"></div>
            <p>Obteniendo ubicación GPS...</p>
          </div>
        {:else if coordenadas}
          <div class="gps-info">
            <div class="gps-grid">
              <Input
                label="Latitud"
                value={coordenadas.latitude.toFixed(6)}
                readonly={true}
              />
              <Input
                label="Longitud"
                value={coordenadas.longitude.toFixed(6)}
                readonly={true}
              />
            </div>
            <div class="gps-meta">
              {#if coordenadas.accuracy}
                <span class="gps-accuracy">
                  Precisión: ±{coordenadas.accuracy.toFixed(0)}m
                </span>
              {/if}
              {#if distanceToProject !== null}
                <span class="gps-distance" class:warning={showDistanceWarning}>
                  Distancia al proyecto: {formatDistance(distanceToProject)}
                </span>
              {/if}
            </div>
          </div>

          {#if showDistanceWarning}
            <div class="warning-message">
              ⚠️ Está a más de 200m del proyecto. Verifique que esté en la ubicación correcta.
            </div>
          {/if}
        {/if}

        {#if gpsError}
          <div class="error-message">{gpsError}</div>
        {/if}
      </div>
    </Card>

    <!-- Descripciones -->
    <Textarea
      label="Descripción de la Intervención"
      bind:value={descripcionIntervencion}
      placeholder="Describa las actividades realizadas..."
      rows={3}
      required={true}
      maxLength={1000}
    />

    <Textarea
      label="Descripción de la Solicitud"
      bind:value={descripcionSolicitud}
      placeholder="Describa las solicitudes..."
      rows={3}
      required={true}
      maxLength={1000}
    />

    <!-- UP Entorno -->
    <Card variant="default" padding="sm">
      <div class="entorno-section">
        <h4 class="section-title">UP Entorno (Opcional)</h4>
        
        <!-- Formulario para agregar nuevo -->
        <div class="entorno-form">
          <Select
            label="Centro Gestor"
            bind:value={nuevoCentroGestor}
            options={centrosGestores}
            placeholder="Seleccionar..."
            searchable={true}
          />

          <Textarea
            label="Descripción"
            bind:value={nuevaDescripcion}
            placeholder="Breve descripción..."
            rows={2}
            maxLength={200}
          />

          <Button
            variant="secondary"
            size="sm"
            fullWidth={true}
            onClick={handleAddEntorno}
            disabled={!nuevoCentroGestor || !nuevaDescripcion.trim()}
          >
            + Agregar
          </Button>
        </div>

        <!-- Lista de entornos agregados -->
        {#if upEntorno.length > 0}
          <div class="entorno-list">
            {#each upEntorno as entorno}
              <div class="entorno-item">
                <div class="entorno-info">
                  <span class="entorno-centro">{entorno.centro_gestor}</span>
                  <span class="entorno-desc">{entorno.descripcion_complemento}</span>
                </div>
                <button
                  class="remove-btn"
                  on:click={() => onRemoveEntorno(entorno.id)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </Card>
  </div>
</div>

<style>
  .step-container {
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .step-header {
    margin-bottom: 1.5rem;
  }

  .step-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
  }

  .step-description {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .section-header h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .gps-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .gps-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .gps-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .gps-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .gps-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    gap: 0.75rem;
  }

  .gps-loading p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #e5e7eb;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .gps-placeholder {
    text-align: center;
    padding: 1rem;
    color: #6b7280;
    font-size: 0.8125rem;
    background: #f9fafb;
    border-radius: 6px;
    margin: 0;
  }

  .gps-accuracy {
    font-size: 0.75rem;
    color: #059669;
    background: #d1fae5;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
  }

  .gps-distance {
    font-size: 0.75rem;
    color: #0284c7;
    background: #e0f2fe;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
  }

  .gps-distance.warning {
    color: #ea580c;
    background: #ffedd5;
  }

  .error-message {
    padding: 0.5rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 6px;
    font-size: 0.75rem;
    border-left: 3px solid #ef4444;
  }

  .warning-message {
    padding: 0.5rem;
    background: #ffedd5;
    color: #9a3412;
    border-radius: 6px;
    font-size: 0.75rem;
    border-left: 3px solid #f97316;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .entorno-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .entorno-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px dashed #d1d5db;
  }

  .entorno-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .entorno-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    background: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .entorno-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .entorno-centro {
    font-weight: 600;
    color: #111827;
    font-size: 0.8125rem;
  }

  .entorno-desc {
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.3;
  }

  .remove-btn {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: #fee2e2;
    color: #991b1b;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }
</style>
