<script lang="ts">
  import { onMount } from 'svelte';
  import { visitaStore, stepNames, isCurrentStepValid } from '../../stores/visitaStore';
  import { authStore } from '../../stores/authStore';
  import { createVisitaVerificacion } from '../../api/visitas';
  import Stepper from '../ui/Stepper.svelte';
  import Button from '../ui/Button.svelte';
  import Modal from '../ui/Modal.svelte';
  import Step0TipoVisita from './Step0TipoVisita.svelte';
  import Step1SeleccionUP from './Step1SeleccionUP.svelte';
  import Step2Validacion from './Step2Validacion.svelte';
  import Step3Captura from './Step3Captura.svelte';
  import Step4Comunicaciones from './Step4Comunicaciones.svelte';
  import type { TipoVisita, UnidadProyecto, ValidacionDatos, Estado360 } from '../../types/visitas';

  export let onClose: () => void;

  let submitting = false;
  let submitError: string | null = null;
  let submitSuccess = false;
  let photoFiles: File[] = []; // Archivos de fotos para subir
  
  // Estado del modal
  let modalOpen = false;
  let modalTitle = '';
  let modalMessage = '';
  let modalType: 'success' | 'error' | 'info' | 'warning' = 'info';
  let modalShowCancel = false;
  let modalConfirmText = 'Entendido';
  let modalCancelText = 'Cancelar';
  let modalOnConfirm: (() => void) | null = null;

  // Suscripción al store
  $: state = $visitaStore;
  $: canContinue = $isCurrentStepValid;
  $: currentStep = state.currentStep;
  
  // Debug: Log validation state
  $: {
    console.log('Estado paso 4:', {
      currentStep,
      estado_360: state.data.estado_360,
      viabilidad_alcalde: state.data.viabilidad_alcalde,
      entrega_publica: state.data.entrega_publica,
      canContinue
    });
  }

  onMount(() => {
    // Resetear formulario al montar
    visitaStore.reset();
  });

  // Handlers para Step 0
  function handleTipoVisitaSelect(tipo: TipoVisita) {
    visitaStore.updateData({ tipo_visita: tipo });
    visitaStore.nextStep();
  }

  // Handlers para Step 1
  function handleUPSelect(up: UnidadProyecto) {
    visitaStore.selectUnidadProyecto(up);
    // Avanzar automáticamente al siguiente paso después de seleccionar
    visitaStore.nextStep();
  }

  async function handleLoadUPs() {
    await visitaStore.loadUnidadesProyecto();
  }

  // Handlers para Step 2
  function handleValidation(validacion: ValidacionDatos) {
    visitaStore.updateData({ validacion });
  }

  // Handlers para Step 3
  async function handleCaptureGPS() {
    await visitaStore.captureGPS();
  }

  async function handleLoadCentros() {
    await visitaStore.loadCentrosGestores();
  }

  // Navegación
  function handleNext() {
    if (!canContinue) return;
    
    // Validaciones específicas por paso antes de continuar
    if (currentStep === 1 && !state.selectedUP) {
      visitaStore.setError('Debe seleccionar una Unidad de Proyecto');
      return;
    }

    if (currentStep === 2 && !state.data.validacion) {
      visitaStore.setError('Debe validar la información');
      return;
    }

    visitaStore.setError(null);
    visitaStore.nextStep();
  }

  function handleBack() {
    visitaStore.previousStep();
  }

  function handleStepClick(step: number) {
    visitaStore.goToStep(step as any);
  }
  
  function handleModalClose() {
    modalOpen = false;
    if (modalType === 'success') {
      visitaStore.reset();
      onClose();
    }
  }

  function handleModalConfirm() {
    modalOpen = false;
    if (modalOnConfirm) {
      modalOnConfirm();
    }
  }

  // Envío del formulario
  async function handleSubmit() {
    if (!canContinue) return;

    submitError = null;
    submitting = true;

    try {
      // Validar que todos los campos requeridos estén completos
      const data = state.data;
      
      if (!data.upid || !data.coordenadas_gps || !data.descripcion_intervencion ||
          !data.descripcion_solicitud || !data.estado_360 ||
          data.viabilidad_alcalde === undefined || data.entrega_publica === undefined) {
        throw new Error('Faltan campos requeridos');
      }

      // Validar que haya una UP seleccionada
      if (!state.selectedUP) {
        throw new Error('No se ha seleccionado una Unidad de Proyecto');
      }

      // Obtener datos del usuario desde el store de autenticación
      const user = $authStore.user || authStore.getUser();
      const userEmail = user?.email || 'usuario@calitrack360.gov.co';
      const userDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario Calitrack 360';

      console.log('Datos de usuario para el reporte:', { userEmail, userDisplayName });

      // Preparar datos completos
      const visitaCompleta = {
        ...data,
        fecha_registro: new Date().toISOString()
      } as any;

      console.log('Enviando visita al servidor...', {
        upid: state.selectedUP.upid,
        estado_360: data.estado_360,
        tipo_visita: data.tipo_visita
      });

      // Enviar al backend usando el nuevo endpoint
      const response = await createVisitaVerificacion(
        visitaCompleta,
        state.selectedUP,
        userEmail,
        userDisplayName,
        photoFiles
      );

      if (response.success) {
        submitSuccess = true;
        console.log('Visita registrada exitosamente:', {
          document_id: response.document_id,
          photos_uploaded: response.photos_uploaded?.length || 0,
          photos_failed: response.photos_failed?.length || 0
        });
        
        // Mostrar modal de éxito
        modalTitle = '¡Visita Registrada!';
        modalMessage = 'La visita se ha guardado correctamente en el sistema.';
        modalType = 'success';
        modalShowCancel = false;
        modalConfirmText = 'Entendido';
        modalOpen = true;
      }

    } catch (error) {
      console.error('Error al enviar visita:', error);
      submitError = error instanceof Error ? error.message : 'Error al registrar la visita';
      
      // Mostrar modal de error
      modalTitle = 'Error';
      modalMessage = submitError || 'Ocurrió un error al guardar la visita.';
      modalType = 'error';
      modalShowCancel = false;
      modalConfirmText = 'Entendido';
      modalOpen = true;
    } finally {
      submitting = false;
    }
  }

  function handleCancel() {
    modalTitle = '¿Cancelar visita?';
    modalMessage = 'Se perderán todos los datos ingresados hasta el momento.';
    modalType = 'warning';
    modalShowCancel = true;
    modalConfirmText = 'Sí, cancelar';
    modalCancelText = 'Volver';
    modalOnConfirm = () => {
      visitaStore.reset();
      onClose();
    };
    modalOpen = true;
  }
</script>

<div class="visita-container">
  <!-- Header -->
  <div class="visita-header">
    <div class="header-content">
      <button class="back-btn" on:click={handleCancel}>
        <span class="back-icon">←</span>
      </button>
      <h1 class="header-title">Nueva Visita</h1>
    </div>
  </div>

  <!-- Stepper -->
  <div class="stepper-section">
    <Stepper
      currentStep={state.currentStep}
      steps={stepNames}
      completedSteps={state.completedSteps}
      onStepClick={handleStepClick}
    />
  </div>

  <!-- Contenido del paso actual -->
  <div class="step-content">
    {#if currentStep === 0}
      <Step0TipoVisita onSelect={handleTipoVisitaSelect} />
    
    {:else if currentStep === 1}
      <Step1SeleccionUP
        unidadesProyecto={state.unidadesProyecto}
        selectedUP={state.selectedUP}
        onSelect={handleUPSelect}
        onLoadUPs={handleLoadUPs}
        isLoading={state.isLoading}
      />
    
    {:else if currentStep === 2}
      {#if state.selectedUP}
        <Step2Validacion
          selectedUP={state.selectedUP}
          validacion={state.data.validacion}
          onValidate={handleValidation}
        />
      {/if}
    
    {:else if currentStep === 3}
      <Step3Captura
        coordenadas={state.data.coordenadas_gps}
        bind:descripcionIntervencion={state.data.descripcion_intervencion}
        bind:descripcionSolicitud={state.data.descripcion_solicitud}
        bind:upEntorno={state.data.up_entorno}
        centrosGestores={state.centrosGestores}
        selectedUP={state.selectedUP}
        onCaptureGPS={handleCaptureGPS}
        onLoadCentros={handleLoadCentros}
        onAddEntorno={visitaStore.addUPEntorno}
        onRemoveEntorno={visitaStore.removeUPEntorno}
        onUpdateEntorno={visitaStore.updateUPEntorno}
        isLoading={state.isLoading}
      />
    
    {:else if currentStep === 4}
      <Step4Comunicaciones
        bind:estado360={state.data.estado_360}
        bind:viabilidadAlcalde={state.data.viabilidad_alcalde}
        bind:entregaPublica={state.data.entrega_publica}
        bind:photosUrl={state.data.photos_url}
        bind:photoFiles={photoFiles}
      />
    {/if}

    <!-- Error global -->
    {#if state.error}
      <div class="global-error">
        {state.error}
      </div>
    {/if}

    <!-- Navegación inferior (dentro del flujo) -->
    <div class="navigation-footer">
      <div class="nav-buttons">
        {#if currentStep > 0}
          <div class="btn-wrapper left">
            <Button
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={submitting}
            >
              Atrás
            </Button>
          </div>
        {:else}
          <div class="btn-wrapper left"></div> <!-- Spacer -->
        {/if}

        {#if currentStep < 4}
          <div class="btn-wrapper right">
            <Button
              variant="primary"
              size="md"
              fullWidth={currentStep === 0}
              onClick={handleNext}
              disabled={!canContinue || state.isLoading}
            >
              Continuar
            </Button>
          </div>
        {:else}
          <div class="btn-wrapper right">
            <Button
              variant="primary"
              size="md"
              fullWidth={true}
              onClick={handleSubmit}
              disabled={!canContinue || submitting}
            >
              {submitting ? 'Enviando...' : 'Finalizar'}
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Modal de confirmación -->
  <Modal
    isOpen={modalOpen}
    title={modalTitle}
    message={modalMessage}
    type={modalType}
    showCancel={modalShowCancel}
    confirmText={modalConfirmText}
    cancelText={modalCancelText}
    on:close={handleModalClose}
    on:confirm={handleModalConfirm}
  />
</div>

<style>
  .visita-container {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #f9fafb; /* Light background always */
  }

  .visita-header {
    background: white;
    color: #111827;
    padding: 0.5rem 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid #f3f4f6;
  }

  .header-content {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 44px;
  }

  .back-btn {
    background: transparent;
    border: none;
    color: #4b5563;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .back-btn:hover {
    background: #f3f4f6;
  }
  
  .back-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .header-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #111827;
  }

  .stepper-section {
    background: white;
    padding: 0 1rem;
    border-bottom: 1px solid #f3f4f6;
    position: sticky;
    top: 53px; /* Height of header + padding */
    z-index: 99;
  }

  .step-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 2rem;
    background: #f9fafb;
    display: flex;
    flex-direction: column;
  }

  .global-error {
    margin: 0.75rem;
    padding: 0.75rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    border-left: 4px solid #ef4444;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .navigation-footer {
    margin-top: auto; /* Push to bottom of flex container */
    padding: 2rem 1rem 1rem 1rem; /* Top margin/padding from content */
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .nav-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .btn-wrapper {
    flex: 1;
  }

  .btn-wrapper.left {
    display: flex;
    justify-content: flex-start;
  }

  .btn-wrapper.right {
    display: flex;
    justify-content: flex-end;
  }
</style>
