<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../ui/Button.svelte';
  import Card from '../ui/Card.svelte';
  import Textarea from '../ui/Textarea.svelte';
  import type { ArbolItem } from '../../types/grupoCuadrilla';
  import { createReporteIntervencion } from '../../api/grupoCuadrilla';

  export let onClose: () => void;

  const dispatch = createEventDispatcher();

  // ---- estado del formulario ----
  let arboles: ArbolItem[] = [{ especie: '', cantidad: 1 }];
  let descripcion = '';
  let isLoading = false;
  let errorMsg = '';
  let successMsg = '';

  // ---- nueva fila vacía ----
  function addArbol() {
    arboles = [...arboles, { especie: '', cantidad: 1 }];
  }

  function removeArbol(index: number) {
    if (arboles.length === 1) return;
    arboles = arboles.filter((_, i) => i !== index);
  }

  function updateEspecie(index: number, value: string) {
    arboles = arboles.map((a, i) => (i === index ? { ...a, especie: value } : a));
  }

  function updateCantidad(index: number, value: string) {
    const n = parseInt(value, 10);
    arboles = arboles.map((a, i) =>
      i === index ? { ...a, cantidad: isNaN(n) || n < 1 ? 1 : n } : a
    );
  }

  // ---- validación ----
  function validate(): string | null {
    if (arboles.length === 0) return 'Agregue al menos un árbol.';
    for (let i = 0; i < arboles.length; i++) {
      if (!arboles[i].especie.trim())
        return `La especie del árbol ${i + 1} es requerida.`;
      if (!Number.isInteger(arboles[i].cantidad) || arboles[i].cantidad < 1)
        return `La cantidad del árbol ${i + 1} debe ser un entero positivo.`;
    }
    return null;
  }

  // ---- envío ----
  async function handleSubmit() {
    errorMsg = '';
    successMsg = '';
    const validationError = validate();
    if (validationError) {
      errorMsg = validationError;
      return;
    }

    isLoading = true;
    try {
      await createReporteIntervencion(arboles, descripcion);
      successMsg = '¡Reporte registrado exitosamente!';
      // Resetear el formulario tras éxito
      arboles = [{ especie: '', cantidad: 1 }];
      descripcion = '';
      dispatch('success');
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Error al enviar el reporte.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container">
  <!-- Encabezado -->
  <header class="page-header">
    <button class="btn-back" on:click={onClose} aria-label="Volver">
      ← Volver
    </button>
    <h1>Reporte de Intervención</h1>
  </header>

  <div class="form-wrapper">
    <form on:submit|preventDefault={handleSubmit} novalidate>

      <!-- Sección árboles -->
      <Card variant="outlined" padding="md">
        <div class="section-header">
          <h2 class="section-title">🌳 Árboles intervenidos</h2>
          <p class="section-desc">
            Registre cada especie de árbol y la cantidad de individuos intervenidos.
          </p>
        </div>

        <div class="arboles-list">
          {#each arboles as arbol, index (index)}
            <div class="arbol-row">
              <div class="arbol-fields">
                <div class="field-group">
                  <label class="field-label" for="especie-{index}">
                    Especie <span class="required">*</span>
                  </label>
                  <input
                    id="especie-{index}"
                    class="field-input"
                    type="text"
                    placeholder="Ej: Ceiba, Guayacán…"
                    value={arbol.especie}
                    on:input={(e) => updateEspecie(index, e.currentTarget.value)}
                    required
                  />
                </div>
                <div class="field-group">
                  <label class="field-label" for="cantidad-{index}">
                    Cantidad <span class="required">*</span>
                  </label>
                  <input
                    id="cantidad-{index}"
                    class="field-input"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={arbol.cantidad}
                    on:input={(e) => updateCantidad(index, e.currentTarget.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                class="btn-remove"
                on:click={() => removeArbol(index)}
                disabled={arboles.length === 1}
                aria-label="Eliminar árbol {index + 1}"
              >
                🗑
              </button>
            </div>
          {/each}
        </div>

        <div class="add-row">
          <Button variant="outline" size="sm" type="button" onClick={addArbol}>
            + Agregar árbol
          </Button>
        </div>
      </Card>

      <!-- Descripción opcional -->
      <Card variant="outlined" padding="md">
        <Textarea
          label="Descripción (opcional)"
          placeholder="Detalles adicionales de la intervención…"
          bind:value={descripcion}
          rows={3}
          maxLength={500}
        />
      </Card>

      <!-- Mensajes de estado -->
      {#if errorMsg}
        <div class="alert alert-error" role="alert">{errorMsg}</div>
      {/if}
      {#if successMsg}
        <div class="alert alert-success" role="status">{successMsg}</div>
      {/if}

      <!-- Acciones -->
      <div class="form-actions">
        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando…' : 'Registrar reporte'}
        </Button>
      </div>
    </form>
  </div>
</div>

<style>
  .container {
    min-height: 100vh;
    min-height: 100dvh;
    background-color: var(--surface);
    display: flex;
    flex-direction: column;
  }

  .page-header {
    background: white;
    padding: 1rem 1.5rem;
    box-shadow: 0 1px 3px var(--shadow, rgba(0,0,0,0.1));
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .page-header h1 {
    color: var(--primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .btn-back {
    background: none;
    border: none;
    color: var(--primary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.25rem 0;
    white-space: nowrap;
  }

  .form-wrapper {
    padding: 1.5rem;
    max-width: 640px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-header {
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.25rem;
  }

  .section-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .field-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
  }

  .required {
    color: #ef4444;
  }

  .field-input {
    width: 100%;
    min-height: 44px;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #1f2937;
    transition: border-color 0.2s ease;
    font-family: inherit;
    -webkit-appearance: none;
    appearance: none;
    box-sizing: border-box;
  }

  .field-input:focus {
    outline: none;
    border-color: var(--primary, #2563eb);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .arboles-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .arbol-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .arbol-fields {
    flex: 1;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0.5rem;
  }

  .btn-remove {
    background: none;
    border: 1px solid var(--error, #ef4444);
    border-radius: 0.5rem;
    color: var(--error, #ef4444);
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
    margin-bottom: 0;
  }

  .btn-remove:hover:not(:disabled) {
    background-color: var(--error, #ef4444);
    color: white;
  }

  .btn-remove:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .add-row {
    margin-top: 0.75rem;
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .alert-error {
    background-color: #fef2f2;
    color: var(--error, #ef4444);
    border: 1px solid #fecaca;
  }

  .alert-success {
    background-color: #f0fdf4;
    color: var(--success, #10b981);
    border: 1px solid #bbf7d0;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-bottom: 2rem;
  }

  @media (max-width: 480px) {
    .form-wrapper {
      padding: 1rem;
    }

    .arbol-fields {
      grid-template-columns: 1fr;
    }

    .arbol-row {
      align-items: flex-end;
    }

    .form-actions {
      flex-direction: column-reverse;
    }
  }
</style>
