<script lang="ts">
  import { onMount } from 'svelte';
  import Select from '../ui/Select.svelte';
  import Toggle from '../ui/Toggle.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import type { Estado360 } from '../../types/visitas';
  
  export let estado360: Estado360 | undefined;
  export let viabilidadAlcalde: boolean | undefined;
  export let entregaPublica: boolean | undefined;
  export let photosUrl: string[];
  export let photoFiles: File[] = []; // Nuevo prop para los archivos
  export let inferEstado360: () => Estado360;

  let selectedFiles: FileList | null = null;
  let photoPreviewUrls: string[] = [];
  
  // Debug: Log cambios en los valores
  $: {
    console.log('Step4 valores actualizados:', {
      estado360,
      viabilidadAlcalde,
      entregaPublica,
      filesCount: photoFiles?.length
    });
  }

  onMount(() => {
    console.log('Step4 montado - valores recibidos:', { estado360, viabilidadAlcalde, entregaPublica });
  });

  $: estado360Options = [
    { label: 'Antes', value: 'Antes' },
    { label: 'Durante', value: 'Durante' },
    { label: 'Después', value: 'Después' }
  ];

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      // Convertir FileList a Array y agregar a los existentes
      const newFiles = Array.from(files);
      photoFiles = [...photoFiles, ...newFiles];
      
      // Generar previsualizaciones para los nuevos archivos
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            photoPreviewUrls = [...photoPreviewUrls, e.target.result as string];
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Limpiar el input para permitir seleccionar los mismos archivos nuevamente si se desea
      target.value = '';
    }
  }

  function removePhoto(index: number) {
    photoPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index);
    photoFiles = photoFiles.filter((_, i) => i !== index);
  }
</script>

<div class="step-container">
  <div class="step-header">
    <h2 class="step-title">Comunicaciones y Cierre</h2>
    <p class="step-description">
      Complete la información final
    </p>
  </div>

  <div class="step-content">
    <!-- Estado 360 -->
    <Select
      label="Estado 360"
      bind:value={estado360}
      options={estado360Options}
      required={true}
      hint="Estado inferido automáticamente"
    />

    <!-- Toggles -->
    <Card variant="default" padding="sm">
      <div class="toggles-section">
        <h4 class="section-title">Información Adicional</h4>
        
        <Toggle
          label="¿Viabilidad del Alcalde Local?"
          bind:checked={viabilidadAlcalde}
        />

        <Toggle
          label="¿Entrega Pública?"
          bind:checked={entregaPublica}
        />
      </div>
    </Card>

    <!-- Evidencia Fotográfica -->
    <Card variant="outlined" padding="sm">
      <div class="photos-section">
        <h4 class="section-title">📸 Evidencia Fotográfica</h4>
        
        <div class="file-input-wrapper">
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            on:change={handleFileChange}
            id="photo-input"
            class="file-input"
          />
          <label for="photo-input" class="file-label">
            <span class="file-icon">📷</span>
            <span class="file-text">
              {photoFiles.length > 0 ? `${photoFiles.length} foto(s)` : 'Tomar fotos'}
            </span>
          </label>
        </div>

        {#if photoPreviewUrls.length > 0}
          <div class="photo-previews">
            {#each photoPreviewUrls as photoUrl, index}
              <div class="photo-preview">
                <img src={photoUrl} alt="Preview {index + 1}" />
                <button
                  class="remove-photo-btn"
                  on:click={() => removePhoto(index)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>
        {/if}

        <p class="photos-hint">
          Tome fotos claras del estado actual
        </p>
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

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.75rem 0;
  }

  .toggles-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .photos-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .file-input-wrapper {
    position: relative;
  }

  .file-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .file-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #4f46e5;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 600;
    -webkit-tap-highlight-color: transparent;
  }

  .file-label:active {
    transform: scale(0.98);
  }

  .file-icon {
    font-size: 1.25rem;
  }

  .file-text {
    font-size: 0.875rem;
  }

  .photo-previews {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .photo-preview {
    position: relative;
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
  }

  .photo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-photo-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }

  .photos-hint {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
    text-align: center;
  }
</style>
