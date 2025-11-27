<script lang="ts">
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import type { TipoVisita } from '../../types/visitas';
  
  export let onSelect: (tipo: TipoVisita) => void;
</script>

<div class="step-container">
  <div class="step-header">
    <h2 class="step-title">Tipo de Visita</h2>
    <p class="step-description">Seleccione el tipo de visita a registrar</p>
  </div>

  <div class="tipo-visita-grid">
    <Card variant="elevated" padding="md" clickable onClick={() => onSelect('verificacion')}>
      <div class="visita-card">
        <div class="visita-icon">📋</div>
        <div class="visita-content">
          <h3 class="visita-title">Visita de Verificación</h3>
          <p class="visita-description">
            Registro de verificación técnica en obra
          </p>
        </div>
        <div class="visita-arrow">→</div>
      </div>
    </Card>

    <Card variant="default" padding="md">
      <div class="visita-card disabled">
        <div class="visita-icon">📢</div>
        <div class="visita-content">
          <h3 class="visita-title">Visita de Comunicaciones</h3>
          <p class="visita-description">
            Próximamente disponible
          </p>
        </div>
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
    text-align: center;
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

  .tipo-visita-grid {
    display: grid;
    gap: 1rem;
  }

  .visita-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
  }

  .visita-card.disabled {
    opacity: 0.6;
  }

  .visita-icon {
    font-size: 2rem;
    background: #f3f4f6;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .visita-content {
    flex: 1;
  }

  .visita-title {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .visita-description {
    font-size: 0.8125rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
  }
  
  .visita-arrow {
    color: #9ca3af;
    font-weight: bold;
  }
</style>
