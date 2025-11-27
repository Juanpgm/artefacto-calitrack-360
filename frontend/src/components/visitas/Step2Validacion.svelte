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
        <h3 class="up-name">{selectedUP.nombre_up}</h3>
        
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Tipo de Equipamiento</span>
            <span class="detail-value">{selectedUP.tipo_equipamiento}</span>
          </div>

          {#if selectedUP.estado}
            <div class="detail-item">
              <span class="detail-label">Estado</span>
              <span class="detail-value badge">{selectedUP.estado}</span>
            </div>
          {/if}

          {#if selectedUP.avance_obra !== null && selectedUP.avance_obra !== undefined}
            <div class="detail-item">
              <span class="detail-label">Avance de Obra</span>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: {selectedUP.avance_obra}%"></div>
                </div>
                <span class="progress-text">{selectedUP.avance_obra}%</span>
              </div>
            </div>
          {/if}

          {#if selectedUP.localidad}
            <div class="detail-item">
              <span class="detail-label">Localidad</span>
              <span class="detail-value">{selectedUP.localidad}</span>
            </div>
          {/if}

          {#if selectedUP.direccion}
            <div class="detail-item">
              <span class="detail-label">Dirección</span>
              <span class="detail-value">{selectedUP.direccion}</span>
            </div>
          {/if}

          {#if selectedUP.alcalde_local}
            <div class="detail-item">
              <span class="detail-label">Alcalde Local</span>
              <span class="detail-value">{selectedUP.alcalde_local}</span>
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

  .up-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #4f46e5;
    margin: 0;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  /* Make full width on very small screens or for long content */
  .detail-item:nth-child(odd):last-child {
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
