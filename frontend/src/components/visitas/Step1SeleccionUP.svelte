<script lang="ts">
  import { onMount } from 'svelte';
  import Select from '../ui/Select.svelte';
  import Button from '../ui/Button.svelte';
  import type { UnidadProyecto } from '../../types/visitas';
  
  export let unidadesProyecto: UnidadProyecto[];
  export let selectedUP: UnidadProyecto | null;
  export let onSelect: (up: UnidadProyecto) => void;
  export let onLoadUPs: () => Promise<void>;
  export let isLoading: boolean;

  let selectedUpId = '';
  let error = '';

  $: upOptions = unidadesProyecto.map(up => ({
    label: `${up.nombre_up} - ${up.tipo_equipamiento}`,
    value: up.upid.toString()
  }));

  $: if (selectedUP) {
    selectedUpId = selectedUP.upid.toString();
  }

  // Detectar cuando cambia la selección en el Select
  $: if (selectedUpId && selectedUpId !== selectedUP?.upid.toString()) {
    handleSelectChange();
  }

  onMount(async () => {
    if (unidadesProyecto.length === 0) {
      await onLoadUPs();
    }
  });

  function handleSelectChange() {
    error = '';
    
    if (!selectedUpId) {
      return;
    }

    const up = unidadesProyecto.find(u => u.upid.toString() === selectedUpId);
    if (up) {
      console.log('Proyecto seleccionado:', up);
      onSelect(up);
    }
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
      <Select
        label="Unidad de Proyecto"
        bind:value={selectedUpId}
        options={upOptions}
        placeholder="Buscar proyecto..."
        searchable={true}
        required={true}
        {error}
        hint="Puede buscar por nombre o tipo de equipamiento"
      />

      {#if selectedUP}
        <div class="up-preview">
          <h4>Proyecto seleccionado</h4>
          <div class="up-info">
            <div class="info-row">
              <span class="label">Nombre:</span>
              <span class="value highlight">{selectedUP.nombre_up}</span>
            </div>
            <div class="info-row">
              <span class="label">Tipo:</span>
              <span class="value">{selectedUP.tipo_equipamiento}</span>
            </div>
            {#if selectedUP.estado}
              <div class="info-row">
                <span class="label">Estado:</span>
                <span class="value status">{selectedUP.estado}</span>
              </div>
            {/if}
            {#if selectedUP.avance_obra !== null && selectedUP.avance_obra !== undefined}
              <div class="info-row">
                <span class="label">Avance:</span>
                <span class="value">{selectedUP.avance_obra}%</span>
              </div>
            {/if}
            {#if selectedUP.localidad}
              <div class="info-row">
                <span class="label">Localidad:</span>
                <span class="value">{selectedUP.localidad}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
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

  .up-preview {
    background: white;
    border-radius: 8px;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .up-preview h4 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .up-info {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .info-row {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .info-row .label {
    font-weight: 500;
    color: #6b7280;
    min-width: 70px;
  }

  .info-row .value {
    color: #111827;
    flex: 1;
  }
  
  .info-row .value.highlight {
    font-weight: 600;
    color: #4f46e5;
  }

  .info-row .value.status {
    display: inline-block;
    background: #eff6ff;
    color: #1e40af;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    width: fit-content;
  }
</style>
