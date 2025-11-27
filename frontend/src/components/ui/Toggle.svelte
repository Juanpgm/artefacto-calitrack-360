<script lang="ts">
  export let label: string;
  export let checked = false;
  export let disabled = false;
  export let hint: string | undefined = undefined;
</script>

<div class="toggle-wrapper">
  <label class="toggle-label">
    <input
      type="checkbox"
      class="toggle-input"
      bind:checked
      {disabled}
    />
    <span class="toggle-slider" class:checked></span>
    
    <span class="toggle-text">
      {label}
    </span>
  </label>

  {#if hint}
    <span class="toggle-hint">{hint}</span>
  {/if}
</div>

<style>
  .toggle-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: relative;
    width: 52px;
    height: 28px;
    background: #d1d5db;
    border-radius: 100px;
    transition: background 0.2s ease;
    flex-shrink: 0;
  }

  .toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-slider.checked {
    background: #667eea;
  }

  .toggle-slider.checked::after {
    transform: translateX(24px);
  }

  .toggle-input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-input:focus + .toggle-slider {
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  .toggle-text {
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
  }

  .toggle-hint {
    font-size: 0.75rem;
    color: #6b7280;
    margin-left: calc(52px + 0.75rem);
  }

  /* Dark mode removed */
</style>
