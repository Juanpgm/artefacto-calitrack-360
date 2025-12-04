<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchHistorialVisitas } from '../../api/visitas';
  import { ApiClient } from '../../lib/api-client';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import Input from '../ui/Input.svelte';
  import MultiSelect from '../ui/MultiSelect.svelte';

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

  let todasLasVisitas: VisitaRegistrada[] = [];
  let visitasFiltradas: VisitaRegistrada[] = [];
  let loading = false;
  let error: string | null = null;
  
  // Filtros
  let filtroUPID = '';
  let filtroCentrosGestores: string[] = [];
  let filtroEstado360 = '';
  let filtroTipoVisita = '';
  let filtroAlcalde = '';
  let filtroEntregaPublica = '';
  let filtroFechaDesde = '';
  let filtroFechaHasta = '';

  // Estado de acordeón
  let seccionBasicosAbierta = true;
  let seccionAvanzadosAbierta = false;

  // Paginación
  let paginaActual = 1;
  let itemsPorPagina = 10;
  $: totalPaginas = Math.ceil(visitasFiltradas.length / itemsPorPagina);
  $: visitasPaginadas = visitasFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  // Opciones para multiselect
  let centrosGestoresDisponibles: string[] = [];
  let loadingCentros = false;

  // Reactive statements para filtrado automático
  $: {
    // Cuando cambia cualquier filtro, aplicar filtros
    filtroUPID;
    filtroCentrosGestores;
    filtroEstado360;
    filtroTipoVisita;
    filtroAlcalde;
    filtroEntregaPublica;
    filtroFechaDesde;
    filtroFechaHasta;
    
    if (todasLasVisitas.length > 0) {
      aplicarFiltrosReactive();
    }
  }

  onMount(async () => {
    await Promise.all([
      cargarHistorial(),
      cargarCentrosGestores()
    ]);
  });

  async function cargarCentrosGestores() {
    loadingCentros = true;
    try {
      const response = await ApiClient.get<{
        success: boolean;
        data: string[];
        count: number;
      }>('/centros-gestores/nombres-unicos');
      
      if (response.success && response.data) {
        centrosGestoresDisponibles = response.data;
      }
    } catch (err) {
      console.error('Error al cargar centros gestores:', err);
    } finally {
      loadingCentros = false;
    }
  }

  async function cargarHistorial() {
    loading = true;
    error = null;

    try {
      const response = await fetchHistorialVisitas({});
      todasLasVisitas = response.data;
      aplicarFiltrosReactive();
    } catch (err) {
      console.error('Error al cargar historial:', err);
      error = err instanceof Error ? err.message : 'Error al cargar el historial';
    } finally {
      loading = false;
    }
  }

  function aplicarFiltrosReactive() {
    const filtradas = todasLasVisitas.filter(visita => {
      // Filtro UPID
      if (filtroUPID && !visita.upid.toLowerCase().includes(filtroUPID.toLowerCase())) {
        return false;
      }

      // Filtro Centros Gestores (multiselect)
      if (filtroCentrosGestores.length > 0) {
        if (!visita.nombre_centro_gestor || !filtroCentrosGestores.includes(visita.nombre_centro_gestor)) {
          return false;
        }
      }

      // Filtro Estado 360
      if (filtroEstado360 && visita.estado_360 !== filtroEstado360) {
        return false;
      }

      // Filtro Tipo Visita
      if (filtroTipoVisita && visita.tipo_visita !== filtroTipoVisita) {
        return false;
      }

      // Filtro Alcalde
      if (filtroAlcalde === 'si' && !visita.requiere_alcalde) return false;
      if (filtroAlcalde === 'no' && visita.requiere_alcalde) return false;

      // Filtro Entrega Pública
      if (filtroEntregaPublica === 'si' && !visita.entrega_publica) return false;
      if (filtroEntregaPublica === 'no' && visita.entrega_publica) return false;

      // Filtro Fecha Desde
      if (filtroFechaDesde) {
        const fechaVisita = new Date(visita.fecha_registro);
        const fechaDesde = new Date(filtroFechaDesde);
        if (fechaVisita < fechaDesde) return false;
      }

      // Filtro Fecha Hasta
      if (filtroFechaHasta) {
        const fechaVisita = new Date(visita.fecha_registro);
        const fechaHasta = new Date(filtroFechaHasta);
        fechaHasta.setHours(23, 59, 59, 999);
        if (fechaVisita > fechaHasta) return false;
      }

      return true;
    });

    visitasFiltradas = filtradas;
    paginaActual = 1; // Resetear a página 1
  }

  function handleLimpiarFiltros() {
    filtroUPID = '';
    filtroCentrosGestores = [];
    filtroEstado360 = '';
    filtroTipoVisita = '';
    filtroAlcalde = '';
    filtroEntregaPublica = '';
    filtroFechaDesde = '';
    filtroFechaHasta = '';
  }

  function cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      paginaActual = nuevaPagina;
    }
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
  <Card padding="sm">
    <div class="filtros-section">
      <div class="filtros-header">
        <h3>🔍 Filtros</h3>
        <button class="clear-filters-btn" on:click={handleLimpiarFiltros}>
          Limpiar
        </button>
      </div>
      
      <!-- Filtros Básicos (Siempre visibles) -->
      <div class="filtros-basicos">
        <Input
          label="UPID"
          bind:value={filtroUPID}
          placeholder="Ej: UNP-MASIVO-001"
        />

        <MultiSelect
          label="Centro Gestor"
          options={centrosGestoresDisponibles}
          bind:selected={filtroCentrosGestores}
          placeholder="Todos"
          searchPlaceholder="Buscar..."
        />

        <div class="date-filters">
          <div class="filter-input">
            <label>Desde</label>
            <input type="date" bind:value={filtroFechaDesde} />
          </div>
          <div class="filter-input">
            <label>Hasta</label>
            <input type="date" bind:value={filtroFechaHasta} />
          </div>
        </div>
      </div>

      <!-- Acordeón Filtros Avanzados -->
      <div class="filtros-acordeon">
        <button 
          class="acordeon-toggle"
          on:click={() => seccionAvanzadosAbierta = !seccionAvanzadosAbierta}
          type="button"
        >
          <span class="acordeon-title">Filtros Avanzados</span>
          <span class="acordeon-icon" class:open={seccionAvanzadosAbierta}>▼</span>
        </button>

        {#if seccionAvanzadosAbierta}
          <div class="acordeon-content">
            <!-- Tipo y Estado 360 en 2 columnas -->
            <div class="filters-two-cols">
              <div class="filter-radio-compact">
                <label class="filter-label-small">Tipo</label>
                <div class="radio-options-inline">
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroTipoVisita} value="" />
                    <span>Todos</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroTipoVisita} value="Verificación" />
                    <span>Verificación</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroTipoVisita} value="Comunicaciones" />
                    <span>Comunicaciones</span>
                  </label>
                </div>
              </div>

              <div class="filter-radio-compact">
                <label class="filter-label-small">Estado 360</label>
                <div class="radio-options-inline">
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroEstado360} value="" />
                    <span>Todos</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroEstado360} value="Antes" />
                    <span>Antes</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroEstado360} value="Durante" />
                    <span>Durante</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroEstado360} value="Después" />
                    <span>Después</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Alcalde y Entrega Pública -->
            <div class="filters-two-cols">
              <div class="filter-radio-compact">
                <label class="filter-label-small">Alcalde</label>
                <div class="radio-options-inline">
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroAlcalde} value="" />
                    <span>Todos</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroAlcalde} value="si" />
                    <span>Sí</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroAlcalde} value="no" />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div class="filter-radio-compact">
                <label class="filter-label-small">Entrega Pública</label>
                <div class="radio-options-inline">
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroEntregaPublica} value="" />
                    <span>Todos</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroEntregaPublica} value="si" />
                    <span>Sí</span>
                  </label>
                  <label class="radio-option-small">
                    <input type="radio" bind:group={filtroEntregaPublica} value="no" />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        {/if}
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
    {:else if visitasFiltradas.length === 0}
      <div class="empty-state">
        <p>📋 No se encontraron visitas con los filtros aplicados</p>
      </div>
    {:else}
      <div class="results-header">
        <p>Se encontraron <strong>{visitasFiltradas.length}</strong> visitas</p>
        {#if totalPaginas > 1}
          <p class="pagination-info">
            Mostrando {(paginaActual - 1) * itemsPorPagina + 1} - {Math.min(paginaActual * itemsPorPagina, visitasFiltradas.length)} de {visitasFiltradas.length}
          </p>
        {/if}
      </div>

      {#each visitasPaginadas as visita (visita.document_id)}
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

      <!-- Paginación -->
      {#if totalPaginas > 1}
        <div class="pagination">
          <button
            class="pagination-btn"
            on:click={() => cambiarPagina(1)}
            disabled={paginaActual === 1}
          >
            ⏮️
          </button>
          <button
            class="pagination-btn"
            on:click={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            ◀️
          </button>
          
          <div class="pagination-pages">
            {#each Array.from({ length: totalPaginas }, (_, i) => i + 1) as pagina}
              {#if pagina === 1 || pagina === totalPaginas || (pagina >= paginaActual - 1 && pagina <= paginaActual + 1)}
                <button
                  class="pagination-page"
                  class:active={pagina === paginaActual}
                  on:click={() => cambiarPagina(pagina)}
                >
                  {pagina}
                </button>
              {:else if pagina === paginaActual - 2 || pagina === paginaActual + 2}
                <span class="pagination-ellipsis">...</span>
              {/if}
            {/each}
          </div>

          <button
            class="pagination-btn"
            on:click={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            ▶️
          </button>
          <button
            class="pagination-btn"
            on:click={() => cambiarPagina(totalPaginas)}
            disabled={paginaActual === totalPaginas}
          >
            ⏭️
          </button>
        </div>
      {/if}
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
    gap: 0.75rem;
  }

  .filtros-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .filtros-section h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #2d3748;
  }

  .clear-filters-btn {
    padding: 0.25rem 0.625rem;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    color: #718096;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-filters-btn:hover {
    border-color: #cbd5e0;
    background: #f7fafc;
    color: #4a5568;
  }

  /* Filtros Básicos */
  .filtros-basicos {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Acordeón */
  .filtros-acordeon {
    margin-top: 0.625rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .acordeon-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.625rem;
    background: #f7fafc;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .acordeon-toggle:hover {
    background: #edf2f7;
  }

  .acordeon-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #2d3748;
  }

  .acordeon-icon {
    font-size: 0.625rem;
    color: #718096;
    transition: transform 0.2s ease;
  }

  .acordeon-icon.open {
    transform: rotate(180deg);
  }

  .acordeon-content {
    padding: 0.625rem;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid #e2e8f0;
  }

  /* Grid 2 columnas para filtros avanzados */
  .filters-two-cols {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }

  @media (min-width: 640px) {
    .filters-two-cols {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* Grid 2 columnas */
  .filtros-two-columns {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 768px) {
    .filtros-two-columns {
      grid-template-columns: 1fr 1fr;
    }
  }

  .filter-column {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .filters-inline-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.375rem;
  }

  .date-filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.375rem;
  }

  .filter-input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .filter-input label {
    font-size: 0.6875rem;
    font-weight: 500;
    color: #4a5568;
  }

  .filter-input input[type="date"] {
    padding: 0.375rem 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 0.75rem;
    background: white;
    min-height: 32px;
  }

  .filter-input input[type="date"]:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }

  /* Radio Buttons Compactos */
  .filter-radio-compact {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.5rem;
    background: #f7fafc;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  .filter-label-small {
    font-size: 0.6875rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }

  .radio-options-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .radio-option-small {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
  }

  .radio-option-small:hover {
    border-color: #cbd5e0;
  }

  .radio-option-small:has(input:checked) {
    border-color: #667eea;
    background: #eef2ff;
  }

  .radio-option-small input[type="radio"] {
    width: 14px;
    height: 14px;
    margin: 0;
    cursor: pointer;
    accent-color: #667eea;
  }

  .radio-option-small span {
    font-size: 0.75rem;
    font-weight: 500;
    color: #2d3748;
    white-space: nowrap;
  }

  .radio-option-small:has(input:checked) span {
    color: #667eea;
    font-weight: 600;
  }

  /* Override Input component styles for compact layout */
  .filter-column :global(.input-wrapper) {
    margin-bottom: 0;
  }

  .filter-column :global(.input-label) {
    font-size: 0.6875rem;
    margin-bottom: 0.25rem;
  }

  .filter-column :global(.input-field) {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    min-height: 32px;
    border-radius: 4px;
  }

  /* Override MultiSelect styles for compact layout */
  .filter-column :global(.multiselect-label) {
    font-size: 0.6875rem;
  }

  .filter-column :global(.multiselect-trigger) {
    min-height: 32px;
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 4px;
  }

  .filter-column :global(.multiselect-arrow) {
    font-size: 0.625rem;
  }

  .filter-column :global(.multiselect-dropdown) {
    border-radius: 4px;
  }

  .filter-column :global(.search-input) {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .filter-column :global(.multiselect-option) {
    padding: 0.5rem;
  }

  .filter-column :global(.option-text) {
    font-size: 0.75rem;
  }

  .filter-column :global(.clear-btn) {
    font-size: 0.75rem;
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

  .pagination-info {
    font-size: 0.8125rem !important;
    color: #6b7280 !important;
    margin-top: 0.25rem !important;
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

  /* Paginación */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.625rem 0.5rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 6px;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .pagination-btn {
    min-width: 32px;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    color: #4a5568;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
  }

  .pagination-btn:hover:not(:disabled) {
    border-color: #667eea;
    background: #f7fafc;
  }

  .pagination-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .pagination-pages {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    flex-shrink: 0;
  }

  .pagination-page {
    min-width: 32px;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: white;
    color: #4a5568;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pagination-page:hover {
    border-color: #667eea;
    background: #f7fafc;
  }

  .pagination-page.active {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .pagination-ellipsis {
    color: #a0aec0;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 0 0.125rem;
    flex-shrink: 0;
  }
</style>
