<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let fullWidth = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let onClick: (() => void) | undefined = undefined;

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };
</script>

<button
  class="btn btn-{variant} btn-{size}"
  class:btn-full={fullWidth}
  {type}
  {disabled}
  on:click={handleClick}
>
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Tamaños */
  .btn-sm {
    padding: 0.375rem 0.875rem;
    font-size: 0.8125rem;
    min-height: 36px;
  }

  .btn-md {
    padding: 0.625rem 1.25rem;
    font-size: 0.9375rem;
    min-height: 44px;
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    min-height: 48px;
  }

  .btn-full {
    width: 100%;
  }

  /* Variantes */
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .btn-outline {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .btn-outline:hover:not(:disabled) {
    background: rgba(102, 126, 234, 0.1);
  }

  .btn-danger {
    background: #ef4444;
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  .btn-danger:hover:not(:disabled) {
    background: #dc2626;
  }

  /* Estado deshabilitado */
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Dark mode removed */
</style>
