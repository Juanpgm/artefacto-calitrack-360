<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../ui/Button.svelte';
  import type { UnidadProyecto } from '../../types/visitas';
  
  export let unidadesProyecto: UnidadProyecto[];
  export let selectedUP: UnidadProyecto | null;
  export let onSelect: (up: UnidadProyecto) => void;
  export let onLoadUPs: () => Promise<void>;
  export let isLoading: boolean;

  let searchTerm = '';
  let showColumnSelector = false;
  
  // Paginación
  let currentPage = 1;
  let itemsPerPage = 10;

  // Columnas disponibles (por defecto solo UP ID, Nombre UP y Avance % visibles)
  interface ColumnConfig {
    key: keyof UnidadProyecto;
    label: string;
    visible: boolean;
    width?: string;
  }

  let columns: ColumnConfig[] = [
    { key: 'upid', label: 'UP ID', visible: true, width: '80px' },
    { key: 'nombre_up', label: 'Nombre UP', visible: true, width: '200px' },
    { key: 'nombre_up_detalle', label: 'Detalle UP', visible: true, width: '200px' },
    { key: 'tipo_equipamiento', label: 'Tipo Equipamiento', visible: false, width: '150px' },
    { key: 'tipo_intervencion', label: 'Tipo Intervención', visible: false, width: '150px' },
    { key: 'estado', label: 'Estado', visible: false, width: '100px' },
    { key: 'avance_obra', label: 'Avance %', visible: true, width: '90px' },
    { key: 'presupuesto_base', label: 'Presupuesto', visible: false, width: '120px' },
  ];

  $: visibleColumns = columns.filter(col => col.visible);

  // Filtrar proyectos por búsqueda
  $: filteredProyectos = unidadesProyecto.filter(up => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      up.upid.toString().includes(term) ||
      up.nombre_up?.toLowerCase().includes(term) ||
      up.nombre_up_detalle?.toLowerCase().includes(term) ||
      up.tipo_equipamiento?.toLowerCase().includes(term) ||
      up.tipo_intervencion?.toLowerCase().includes(term) ||
      up.estado?.toLowerCase().includes(term)
    );
  });

  // Paginación
  $: totalPages = Math.ceil(filteredProyectos.length / itemsPerPage);
  $: paginatedProyectos = filteredProyectos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Resetear a página 1 cuando cambie la búsqueda
  $: if (searchTerm) {
    currentPage = 1;
  }

  onMount(async () => {
    if (unidadesProyecto.length === 0) {
      await onLoadUPs();
    }
  });

  function handleSelectUP(up: UnidadProyecto) {
    console.log('Proyecto seleccionado:', up);
    onSelect(up);
  }

  function openGoogleMaps(geometry: UnidadProyecto['geometry']) {
    console.log('openGoogleMaps llamado con:', JSON.stringify(geometry, null, 2));
    
    if (!geometry || !geometry.coordinates) {
      alert('Este proyecto no tiene coordenadas geográficas disponibles.');
      return;
    }

    let lat: number, lng: number;

    try {
      // PASO 1: Parsear coordenadas si vienen como string
      let coords = geometry.coordinates;
      if (typeof coords === 'string') {
        console.log('Parseando coordenadas desde string:', coords);
        coords = JSON.parse(coords);
      }

      console.log('Procesando coordenadas:', { type: geometry.type, coords, isArray: Array.isArray(coords) });

      // PASO 2: Extraer coordenadas según el tipo de geometría
      if (geometry.type === 'Point') {
        // Point: [lng, lat]
        if (!Array.isArray(coords) || coords.length !== 2) {
          throw new Error(`Point inválido: esperaba [lng, lat], recibió ${JSON.stringify(coords)}`);
        }
        [lng, lat] = coords as [number, number];
      } else if (geometry.type === 'LineString') {
        // LineString: [[lng, lat], [lng, lat], ...] - USAR PRIMER PUNTO
        if (!Array.isArray(coords) || coords.length === 0) {
          throw new Error('LineString sin coordenadas');
        }
        const lineCoords = coords as [number, number][];
        [lng, lat] = lineCoords[0]; // Primer punto del trazo
        console.log('📍 Usando primer punto del trazo LineString:', { lng, lat });
      } else if (geometry.type === 'MultiLineString') {
        // MultiLineString: [[[lng, lat], ...], [[lng, lat], ...]] - USAR PRIMER PUNTO DE LA PRIMERA LÍNEA
        if (!Array.isArray(coords) || coords.length === 0 || !Array.isArray(coords[0]) || coords[0].length === 0) {
          throw new Error('MultiLineString sin coordenadas');
        }
        const firstLine = coords[0] as [number, number][];
        [lng, lat] = firstLine[0]; // Primer punto de la primera línea
        console.log('📍 Usando primer punto del MultiLineString:', { lng, lat });
      } else if (geometry.type === 'Polygon') {
        // Polygon: [[[lng, lat], ...]] - USAR PRIMER PUNTO DEL PRIMER ANILLO
        if (!Array.isArray(coords) || coords.length === 0 || !coords[0] || coords[0].length === 0) {
          throw new Error('Polygon sin coordenadas');
        }
        const ring = coords[0] as [number, number][];
        [lng, lat] = ring[0]; // Primer punto del polígono
        console.log('📍 Usando primer punto del Polygon:', { lng, lat });
      } else {
        throw new Error(`Tipo de geometría no soportado: ${geometry.type}`);
      }

      console.log('Coordenadas extraídas:', { lat, lng });

      // PASO 3: Validar que las coordenadas sean números válidos
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        throw new Error(`Coordenadas no válidas: lat=${lat}, lng=${lng}`);
      }

      // Validar rangos razonables (Cali está en lat: 3-4, lng: -77 a -76)
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error(`Coordenadas fuera de rango: lat=${lat}, lng=${lng}`);
      }
      
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      console.log('✅ Abriendo Google Maps:', { type: geometry.type, lat, lng, url: mapsUrl });
      window.open(mapsUrl, '_blank');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Las coordenadas del proyecto no son válidas.\n\nDetalle: ${errorMsg}`);
      console.error('❌ Error procesando coordenadas:', { error: errorMsg, geometry });
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  function toggleColumnVisibility(columnKey: keyof UnidadProyecto) {
    columns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
  }

  function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  function getCellValue(up: UnidadProyecto, key: keyof UnidadProyecto): string {
    const value = up[key];
    
    if (value === null || value === undefined) return '-';
    
    if (key === 'avance_obra' && typeof value === 'number') {
      return `${value}%`;
    }
    
    if (key === 'presupuesto_base' && typeof value === 'number') {
      return formatCurrency(value);
    }
    
    return String(value);
  }
</script>

<div class="step-container">
  <div class="step-header">
    <h2 class="step-title">Selección de Proyecto</h2>
    <p class="step-description">
      Busque y seleccione la Unidad de Proyecto
    </p>
  </div>

  <div class="step-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando proyectos...</p>
      </div>
    {:else}
      <!-- Barra de herramientas -->
      <div class="toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, tipo, estado..."
          bind:value={searchTerm}
          class="search-input"
        />
        
        <div class="toolbar-actions">
          <button 
            class="btn-toggle-columns"
            on:click={() => showColumnSelector = !showColumnSelector}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Columnas
          </button>
          <span class="results-count">{filteredProyectos.length} proyecto(s)</span>
        </div>
      </div>

      <!-- Selector de columnas -->
      {#if showColumnSelector}
        <div class="column-selector">
          <p class="column-selector-title">Mostrar/Ocultar Columnas:</p>
          <div class="column-options">
            {#each columns as column}
              <label class="column-option">
                <input
                  type="checkbox"
                  checked={column.visible}
                  on:change={() => toggleColumnVisibility(column.key)}
                />
                <span>{column.label}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Tabla de proyectos -->
      <div class="table-container">
        <table class="projects-table">
          <thead>
            <tr>
              {#each visibleColumns as column}
                <th style="width: {column.width || 'auto'}">{column.label}</th>
              {/each}
              <th style="width: 140px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredProyectos.length === 0}
              <tr>
                <td colspan={visibleColumns.length + 1} class="empty-state">
                  No se encontraron proyectos
                </td>
              </tr>
            {:else}
              {#each paginatedProyectos as up}
                <tr class:selected={selectedUP?.upid === up.upid}>
                  {#each visibleColumns as column}
                    <td>{getCellValue(up, column.key)}</td>
                  {/each}
                  <td class="actions-cell">
                    <button
                      class="btn-action btn-maps"
                      on:click={() => openGoogleMaps(up.geometry)}
                      disabled={!up.geometry?.coordinates}
                      title={up.geometry?.coordinates ? 'Abrir en Google Maps' : 'Sin coordenadas'}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C5.2 0 3 2.2 3 5c0 3.9 5 11 5 11s5-7.1 5-11c0-2.8-2.2-5-5-5zm0 7.5c-1.4 0-2.5-1.1-2.5-2.5S6.6 2.5 8 2.5s2.5 1.1 2.5 2.5S9.4 7.5 8 7.5z"/>
                      </svg>
                    </button>
                    <button
                      class="btn-action btn-select"
                      on:click={() => handleSelectUP(up)}
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      {#if filteredProyectos.length > 0}
        <div class="pagination">
          <div class="pagination-info">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProyectos.length)} de {filteredProyectos.length}
          </div>
          
          <div class="pagination-controls">
            <button
              class="btn-page"
              on:click={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Anterior
            </button>
            
            <div class="page-numbers">
              {#each Array(totalPages) as _, i}
                {#if totalPages <= 5 || i === 0 || i === totalPages - 1 || Math.abs(i + 1 - currentPage) <= 1}
                  <button
                    class="btn-page-number"
                    class:active={currentPage === i + 1}
                    on:click={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                {:else if i === 1 || i === totalPages - 2}
                  <span class="page-ellipsis">...</span>
                {/if}
              {/each}
            </div>
            
            <button
              class="btn-page"
              on:click={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente ›
            </button>
          </div>
        </div>
      {/if}

      {#if selectedUP}
        <div class="up-preview">
          <h4>Proyecto seleccionado: {selectedUP.nombre_up}</h4>
          <p class="selected-id">UP ID: {selectedUP.upid}</p>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .step-container {
    padding: 1rem;
    width: 100%;
    max-width: 100%;
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

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 250px;
    padding: 0.625rem 0.875rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .toolbar-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .btn-toggle-columns {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-toggle-columns:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .results-count {
    font-size: 0.875rem;
    color: #6b7280;
    white-space: nowrap;
  }

  /* Column Selector */
  .column-selector {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
  }

  .column-selector-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .column-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }

  .column-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
  }

  .column-option input[type="checkbox"] {
    cursor: pointer;
  }

  /* Table */
  .table-container {
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .projects-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .projects-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
  }

  .projects-table th {
    padding: 0.75rem 0.875rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    position: sticky;
    top: 0;
    background: #f9fafb;
    z-index: 10;
  }

  .projects-table td {
    padding: 0.75rem 0.875rem;
    border-bottom: 1px solid #f3f4f6;
    color: #111827;
  }

  .projects-table tbody tr {
    transition: background-color 0.15s;
  }

  .projects-table tbody tr:hover {
    background: #f9fafb;
  }

  .projects-table tbody tr.selected {
    background: #eff6ff;
  }

  .projects-table tbody tr.selected:hover {
    background: #dbeafe;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem !important;
    color: #9ca3af;
    font-style: italic;
  }

  .actions-cell {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
  }

  .btn-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .btn-maps {
    background: #f0fdf4;
    color: #15803d;
    border-color: #bbf7d0;
    padding: 0.5rem;
  }

  .btn-maps:hover:not(:disabled) {
    background: #dcfce7;
    border-color: #86efac;
  }

  .btn-maps:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-select {
    background: #667eea;
    color: white;
    border-color: #667eea;
    padding: 0.5rem 0.75rem;
  }

  .btn-select:hover {
    background: #5568d3;
    border-color: #5568d3;
  }

  /* Paginación */
  .pagination {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .pagination-info {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .pagination-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-page {
    padding: 0.5rem 0.875rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-page:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-numbers {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .btn-page-number {
    min-width: 36px;
    height: 36px;
    padding: 0.5rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-page-number:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .btn-page-number.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .page-ellipsis {
    padding: 0 0.25rem;
    color: #9ca3af;
  }

  /* Selected Preview */
  .up-preview {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 1rem;
  }

  .up-preview h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e40af;
    margin: 0 0 0.25rem 0;
  }

  .selected-id {
    font-size: 0.75rem;
    color: #3b82f6;
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-input {
      min-width: 100%;
    }

    .toolbar-actions {
      justify-content: space-between;
    }

    .column-options {
      grid-template-columns: 1fr;
    }

    .table-container {
      font-size: 0.75rem;
    }

    .projects-table th,
    .projects-table td {
      padding: 0.5rem 0.25rem;
      font-size: 0.75rem;
    }

    .btn-action {
      padding: 0.375rem;
      font-size: 0.7rem;
    }

    .btn-select {
      padding: 0.375rem 0.5rem;
    }

    .pagination {
      font-size: 0.8125rem;
    }

    .btn-page,
    .btn-page-number {
      padding: 0.375rem 0.5rem;
      font-size: 0.8125rem;
      min-width: 32px;
      height: 32px;
    }
  }
</style>
