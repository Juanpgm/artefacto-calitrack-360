<script lang="ts">
  import Card from '../ui/Card.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import Button from '../ui/Button.svelte';
  import type { UnidadProyecto, ValidacionDatos } from '../../types/visitas';
  
  export let selectedUP: UnidadProyecto;
  export let validacion: ValidacionDatos | undefined;
  export let onValidate: (data: ValidacionDatos) => void;

  let esCorrecta: boolean | null = null;
  let comentario = '';
  let error = '';

  $: if (validacion) {
    esCorrecta = validacion.esCorrecta;
    comentario = validacion.comentario || '';
  }

  function handleValidation(isCorrect: boolean) {
    esCorrecta = isCorrect;
    error = '';
    
    if (isCorrect) {
      comentario = '';
      onValidate({ esCorrecta: true });
    }
  }

  function handleContinue() {
    if (esCorrecta === null) {
      error = 'Debe indicar si la información es correcta';
      return;
    }

    if (!esCorrecta && !comentario.trim()) {
      error = 'Debe proporcionar un comentario cuando la información no es correcta';
      return;
    }

    onValidate({
      esCorrecta: esCorrecta,
      comentario: esCorrecta ? undefined : comentario
    });
  }

  function openGoogleMaps(geometry: UnidadProyecto['geometry']) {
    if (!geometry || !geometry.coordinates) {
      alert('Este proyecto no tiene coordenadas geográficas disponibles.');
      return;
    }

    let lat: number, lng: number;

    try {
      // Parsear coordenadas si vienen como string
      let coords = geometry.coordinates;
      if (typeof coords === 'string') {
        coords = JSON.parse(coords);
      }

      // Extraer coordenadas según el tipo de geometría
      if (geometry.type === 'Point') {
        [lng, lat] = coords as [number, number];
      } else if (geometry.type === 'LineString') {
        const lineCoords = coords as [number, number][];
        [lng, lat] = lineCoords[0]; // Primer punto
      } else if (geometry.type === 'MultiLineString') {
        const firstLine = coords[0] as [number, number][];
        [lng, lat] = firstLine[0]; // Primer punto de la primera línea
      } else if (geometry.type === 'Polygon') {
        const ring = coords[0] as [number, number][];
        [lng, lat] = ring[0]; // Primer punto del polígono
      } else {
        throw new Error(`Tipo de geometría no soportado: ${geometry.type}`);
      }

      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        throw new Error('Coordenadas no válidas');
      }
      
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(mapsUrl, '_blank');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Error al abrir Google Maps: ${errorMsg}`);
      console.error('Error procesando coordenadas:', { error: errorMsg, geometry });
    }
  }
</script>

<div class="step-container">
  <div class="step-header">
    <h2 class="step-title">Validación de Datos</h2>
    <p class="step-description">
      Verifique que la información sea correcta
    </p>
  </div>

  <div class="step-content">
    <Card variant="elevated" padding="md">
      <div class="up-details">
        <div class="header-with-map">
          <h3 class="up-name">{selectedUP.upid} - {selectedUP.nombre_up}</h3>
          {#if selectedUP.geometry && selectedUP.geometry.coordinates}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openGoogleMaps(selectedUP.geometry)}
            >
              📍 Ver en Maps
            </Button>
          {/if}
        </div>
        
        <div class="details-grid">
          <!-- UP ID -->
          <div class="detail-item">
            <span class="detail-label">UP ID</span>
            <span class="detail-value code">{selectedUP.upid}</span>
          </div>

          <!-- Nombre UP Detalle -->
          {#if selectedUP.nombre_up_detalle}
            <div class="detail-item">
              <span class="detail-label">Detalle UP</span>
              <span class="detail-value">{selectedUP.nombre_up_detalle}</span>
            </div>
          {/if}

          <!-- Tipo de Equipamiento -->
          <div class="detail-item">
            <span class="detail-label">Tipo de Equipamiento</span>
            <span class="detail-value">{selectedUP.tipo_equipamiento}</span>
          </div>

          <!-- Tipo de Intervención -->
          {#if selectedUP.tipo_intervencion}
            <div class="detail-item">
              <span class="detail-label">Tipo de Intervención</span>
              <span class="detail-value">{selectedUP.tipo_intervencion}</span>
            </div>
          {/if}

          <!-- Estado -->
          {#if selectedUP.estado}
            <div class="detail-item">
              <span class="detail-label">Estado</span>
              <span class="detail-value badge">{selectedUP.estado}</span>
            </div>
          {/if}

          <!-- Avance de Obra -->
          {#if selectedUP.avance_obra !== null && selectedUP.avance_obra !== undefined}
            <div class="detail-item full-width">
              <span class="detail-label">Avance de Obra</span>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: {selectedUP.avance_obra}%"></div>
                </div>
                <span class="progress-text">{selectedUP.avance_obra}%</span>
              </div>
            </div>
          {/if}

          <!-- Presupuesto Base -->
          {#if selectedUP.presupuesto_base !== null && selectedUP.presupuesto_base !== undefined}
            <div class="detail-item">
              <span class="detail-label">Presupuesto Base</span>
              <span class="detail-value money">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(selectedUP.presupuesto_base)}
              </span>
            </div>
          {/if}

          <!-- Localidad -->
          {#if selectedUP.localidad}
            <div class="detail-item">
              <span class="detail-label">Localidad</span>
              <span class="detail-value">{selectedUP.localidad}</span>
            </div>
          {/if}

          <!-- Dirección -->
          {#if selectedUP.direccion}
            <div class="detail-item">
              <span class="detail-label">Dirección</span>
              <span class="detail-value">{selectedUP.direccion}</span>
            </div>
          {/if}

          <!-- Alcalde Local -->
          {#if selectedUP.alcalde_local}
            <div class="detail-item">
              <span class="detail-label">Alcalde Local</span>
              <span class="detail-value">{selectedUP.alcalde_local}</span>
            </div>
          {/if}

          <!-- Geometría -->
          {#if selectedUP.geometry}
            <div class="detail-item">
              <span class="detail-label">Tipo de Geometría</span>
              <span class="detail-value code">{selectedUP.geometry.type}</span>
            </div>
          {/if}
        </div>
      </div>
    </Card>

    <div class="validation-question">
      <h4 class="question-title">¿La información es correcta?</h4>
      
      <div class="validation-buttons">
        <Button
          variant={esCorrecta === true ? 'primary' : 'outline'}
          size="md"
          fullWidth={true}
          onClick={() => handleValidation(true)}
        >
          ✓ Sí, es correcta
        </Button>
        
        <Button
          variant={esCorrecta === false ? 'danger' : 'outline'}
          size="md"
          fullWidth={true}
          onClick={() => handleValidation(false)}
        >
          ✗ No, requiere actualización
        </Button>
      </div>
    </div>

    {#if esCorrecta === false}
      <div class="comentario-section">
        <Textarea
          label="Comentario / Solicitud de actualización"
          bind:value={comentario}
          placeholder="Describa qué información necesita ser actualizada..."
          rows={3}
          required={true}
          maxLength={500}
          hint="Especifique qué datos están desactualizados"
        />
      </div>
    {/if}

    {#if error}
      <div class="error-message">{error}</div>
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

  .up-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header-with-map {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .up-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #4f46e5;
    margin: 0;
    flex: 1;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  /* Make full width items */
  .detail-item.full-width {
    grid-column: span 2;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .detail-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .detail-value {
    font-size: 0.9375rem;
    color: #111827;
    font-weight: 500;
  }

  .detail-value.badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    background: #eff6ff;
    color: #1e40af;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    width: fit-content;
  }

  .detail-value.code {
    font-family: 'Courier New', monospace;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    width: fit-content;
  }

  .detail-value.money {
    color: #059669;
    font-weight: 600;
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-bar {
    flex: 1;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #4f46e5;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: #4f46e5;
    min-width: 35px;
  }

  .validation-question {
    padding-top: 0.5rem;
  }

  .question-title {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.75rem;
    text-align: center;
  }

  .validation-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .comentario-section {
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .error-message {
    padding: 0.75rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    border-left: 4px solid #ef4444;
  }
</style>
