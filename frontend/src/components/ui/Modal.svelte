<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let message: string;
  export let type: 'success' | 'error' | 'info' | 'warning' = 'info';
  export let isOpen: boolean = false;
  export let showCancel: boolean = false;
  export let confirmText: string = 'Entendido';
  export let cancelText: string = 'Cancelar';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function confirm() {
    dispatch('confirm');
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={showCancel ? undefined : close} transition:fade={{ duration: 200 }}>
    <div class="modal-content" on:click|stopPropagation transition:scale={{ duration: 200, start: 0.95 }}>
      <div class="icon-container {type}">
        {#if type === 'success'}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        {:else if type === 'error'}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        {:else if type === 'warning'}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        {/if}
      </div>
      
      <h3 class="modal-title">{title}</h3>
      <p class="modal-message">{message}</p>
      
      <div class="modal-actions">
        {#if showCancel}
          <button class="modal-button secondary" on:click={close}>
            {cancelText}
          </button>
        {/if}
        <button class="modal-button primary" on:click={showCancel ? confirm : close}>
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    padding: 2rem 1.5rem;
    width: 100%;
    max-width: 320px;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .icon-container {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .icon-container svg {
    width: 32px;
    height: 32px;
  }

  .icon-container.success {
    background: #d1fae5;
    color: #059669;
  }

  .icon-container.error {
    background: #fee2e2;
    color: #dc2626;
  }

  .icon-container.warning {
    background: #fef3c7;
    color: #d97706;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
    line-height: 1.2;
  }

  .modal-message {
    font-size: 0.9375rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    margin-top: 0.5rem;
  }

  .modal-button {
    flex: 1;
    padding: 0.875rem;
    border-radius: 12px;
    border: none;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.1s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .modal-button.primary {
    background: #111827;
    color: white;
  }

  .modal-button.secondary {
    background: #f3f4f6;
    color: #374151;
  }

  .modal-button:active {
    transform: scale(0.98);
  }

  /* Light theme enforcement */
  :global(body) {
    background-color: #f9fafb;
  }
</style>
