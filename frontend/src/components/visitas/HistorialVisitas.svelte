<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchHistorialVisitas } from '../../api/visitas';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';

  export let onClose: () => void;

  interface VisitaRegistrada {
    document_id: string;
    upid: string;
    nombre_up: string;
    estado_360: string;
    tipo_visita?: string;
    fecha_registro: string;
    nombre_centro_gestor?: string;
    entrega_publica: boolean;
    requiere_alcalde: boolean;
    observaciones?: string;
    photosUrl?: {
      photosBeforeUrl?: string | string[];
      photoWhileUrl?: string | string[];
      photosAfterUrl?: string | string[];
    };
  }

  let visitas: VisitaRegistrada[] = [];
  let loading = false;
  let error: string | null = null;
  
  // Filtros
  let filtroUPID = '';
  let filtroCentroGestor = '';
  let filtroEstado360 = '';
  let filtroTipoVisita = '';

  onMount(async () => {
    await cargarHistorial();
  });

  async function cargarHistorial() {
    loading = true;
    error = null;

    try {
      const filtros: any = {};
      if (filtroUPID) filtros.upid = filtroUPID;
      if (filtroCentroGestor) filtros.nombre_centro_gestor = filtroCentroGestor;
      if (filtroEstado360) filtros.estado_360 = filtroEstado360;
      if (filtroTipoVisita) filtros.tipo_visita = filtroTipoVisita;

      const response = await fetchHistorialVisitas(filtros);
      visitas = response.data;
    } catch (err) {
      console.error('Error al cargar historial:', err);
      error = err instanceof Error ? err.message : 'Error al cargar el historial';
    } finally {
      loading = false;
    }
  }

  function handleBuscar() {
    cargarHistorial();
  }

  function handleLimpiarFiltros() {
    filtroUPID = '';
    filtroCentroGestor = '';
    filtroEstado360 = '';
    filtroTipoVisita = '';
    cargarHistorial();
  }

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function contarFotos(photosUrl: any): number {
    if (!photosUrl) return 0;
    let total = 0;
    
    if (Array.isArray(photosUrl.photosBeforeUrl)) total += photosUrl.photosBeforeUrl.length;
    else if (photosUrl.photosBeforeUrl) total += 1;
    
    if (Array.isArray(photosUrl.photoWhileUrl)) total += photosUrl.photoWhileUrl.length;
    else if (photosUrl.photoWhileUrl) total += 1;
    
    if (Array.isArray(photosUrl.photosAfterUrl)) total += photosUrl.photosAfterUrl.length;
    else if (photosUrl.photosAfterUrl) total += 1;
    
    return total;
  }

  function getEstadoClass(estado: string): string {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'antes') return 'estado-antes';
    if (estadoLower === 'durante') return 'estado-durante';
    if (estadoLower === 'después') return 'estado-despues';
    return '';
  }
</script>

<div class="historial-container">
  <!-- Header -->
  <div class="historial-header">
    <button class="back-btn" on:click={onClose}>
      ← Volver
    </button>
    <h1 class="header-title">Historial de Visitas</h1>
  </div>

  <!-- Filtros -->
  <Card padding="md">
    <div class="filtros-section">
      <h3>Filtros de búsqueda</h3>
      
      <div class="filtros-grid">
        <Input
          label="UPID"
          bind:value={filtroUPID}
          placeholder="Ej: UNP-MASIVO-001"
        />

        <Input
          label="Centro Gestor"
          bind:value={filtroCentroGestor}
          placeholder="Ej: Secretaría de..."
        />

        <div class="filter-select">
          <label>Estado 360</label>
          <select bind:value={filtroEstado360}>
            <option value="">Todos</option>
            <option value="Antes">Antes</option>
            <option value="Durante">Durante</option>
            <option value="Después">Después</option>
          </select>
        </div>

        <div class="filter-select">
          <label>Tipo de Visita</label>
          <select bind:value={filtroTipoVisita}>
            <option value="">Todos</option>
            <option value="Verificación">Verificación</option>
            <option value="Comunicaciones">Comunicaciones</option>
          </select>
        </div>
      </div>

      <div class="filtros-actions">
        <Button variant="primary" size="md" onClick={handleBuscar}>
          🔍 Buscar
        </Button>
        <Button variant="outline" size="md" onClick={handleLimpiarFiltros}>
          Limpiar Filtros
        </Button>
      </div>
    </div>
  </Card>

  <!-- Listado de visitas -->
  <div class="visitas-list">
    {#if loading}
      <div class="loading-state">
        <p>Cargando historial...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <p>⚠️ {error}</p>
        <Button variant="primary" size="md" onClick={cargarHistorial}>
          Reintentar
        </Button>
      </div>
    {:else if visitas.length === 0}
      <div class="empty-state">
        <p>📋 No se encontraron visitas registradas</p>
      </div>
    {:else}
      <div class="results-header">
        <p>Se encontraron <strong>{visitas.length}</strong> visitas</p>
      </div>

      {#each visitas as visita (visita.document_id)}
        <Card padding="md">
          <div class="visita-item">
            <div class="visita-header">
              <div class="visita-title">
                <h3>{visita.nombre_up}</h3>
                <span class="visita-upid">{visita.upid}</span>
              </div>
              <div class="visita-badges">
                <span class="badge {getEstadoClass(visita.estado_360)}">
                  {visita.estado_360}
                </span>
                {#if visita.tipo_visita}
                  <span class="badge badge-tipo">
                    {visita.tipo_visita}
                  </span>
                {/if}
              </div>
            </div>

            <div class="visita-details">
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">{formatDate(visita.fecha_registro)}</span>
              </div>

              {#if visita.nombre_centro_gestor}
                <div class="detail-row">
                  <span class="detail-label">🏛️ Centro Gestor:</span>
                  <span class="detail-value">{visita.nombre_centro_gestor}</span>
                </div>
              {/if}

              <div class="detail-row">
                <span class="detail-label">👥 Alcalde:</span>
                <span class="detail-value">{visita.requiere_alcalde ? '✅ Sí' : '❌ No'}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">🎉 Entrega Pública:</span>
                <span class="detail-value">{visita.entrega_publica ? '✅ Sí' : '❌ No'}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">📸 Fotos:</span>
                <span class="detail-value">{contarFotos(visita.photosUrl)} archivos</span>
              </div>

              {#if visita.observaciones}
                <div class="detail-row observaciones">
                  <span class="detail-label">💬 Observaciones:</span>
                  <span class="detail-value">{visita.observaciones}</span>
                </div>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    {/if}
  </div>
</div>

<style>
  .historial-container {
    min-height: 100dvh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
    padding-bottom: 2rem;
  }

  .historial-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .back-btn {
    background: none;
    border: none;
    color: #667eea;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .header-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0;
  }

  .filtros-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .filtros-section h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .filtros-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }

  @media (min-width: 640px) {
    .filtros-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .filter-select {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .filter-select label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #4a5568;
  }

  .filter-select select {
    padding: 0.625rem 0.875rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 0.9375rem;
    background: white;
    min-height: 44px;
  }

  .filter-select select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .filtros-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .visitas-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    background: white;
    border-radius: 12px;
  }

  .loading-state p,
  .error-state p,
  .empty-state p {
    font-size: 1rem;
    color: #4a5568;
    margin-bottom: 1rem;
  }

  .results-header {
    background: rgba(255, 255, 255, 0.95);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .results-header p {
    margin: 0;
    font-size: 0.9375rem;
    color: #2d3748;
  }

  .visita-item {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .visita-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .visita-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
  }

  .visita-title h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #1a202c;
  }

  .visita-upid {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #667eea;
  }

  .visita-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.25rem 0.625rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .estado-antes {
    background: #fef3c7;
    color: #92400e;
  }

  .estado-durante {
    background: #dbeafe;
    color: #1e40af;
  }

  .estado-despues {
    background: #d1fae5;
    color: #065f46;
  }

  .badge-tipo {
    background: #e9d5ff;
    color: #6b21a8;
  }

  .visita-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .detail-row {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .detail-row.observaciones {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    font-weight: 600;
    color: #4a5568;
    min-width: 140px;
  }

  .detail-value {
    color: #2d3748;
  }
</style>
