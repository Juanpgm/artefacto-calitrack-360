<script lang="ts">
  export let label: string;
  export let value: string = '';
  export let placeholder = '';
  export let type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text';
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let error: string | undefined = undefined;
  export let hint: string | undefined = undefined;
  export let icon: string | undefined = undefined;
  export let autocomplete: string | undefined = undefined;
</script>

<div class="input-wrapper">
  <label class="input-label" for={label}>
    {label}
    {#if required}
      <span class="required">*</span>
    {/if}
  </label>
  
  <div class="input-container" class:has-icon={icon} class:has-error={error}>
    {#if icon}
      <span class="input-icon">{icon}</span>
    {/if}
    
    {#if type === 'text'}
      <input
        id={label}
        class="input-field"
        type="text"
        {placeholder}
        {disabled}
        {readonly}
        {required}
        {autocomplete}
        bind:value
      />
    {:else if type === 'email'}
      <input
        id={label}
        class="input-field"
        type="email"
        {placeholder}
        {disabled}
        {readonly}
        {required}
        {autocomplete}
        bind:value
      />
    {:else if type === 'password'}
      <input
        id={label}
        class="input-field"
        type="password"
        {placeholder}
        {disabled}
        {readonly}
        {required}
        {autocomplete}
        bind:value
      />
    {:else if type === 'number'}
      <input
        id={label}
        class="input-field"
        type="number"
        {placeholder}
        {disabled}
        {readonly}
        {required}
        {autocomplete}
        bind:value
      />
    {:else if type === 'tel'}
      <input
        id={label}
        class="input-field"
        type="tel"
        {placeholder}
        {disabled}
        {readonly}
        {required}
        {autocomplete}
        bind:value
      />
    {/if}
  </div>

  {#if hint && !error}
    <span class="input-hint">{hint}</span>
  {/if}

  {#if error}
    <span class="input-error">{error}</span>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: 100%;
  }

  .input-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .required {
    color: #ef4444;
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-container.has-icon .input-field {
    padding-left: 2.75rem;
  }

  .input-icon {
    position: absolute;
    left: 1rem;
    font-size: 1.25rem;
    color: #9ca3af;
    pointer-events: none;
  }

  .input-field {
    width: 100%;
    min-height: 44px;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #1f2937;
    transition: all 0.2s ease;
    font-family: inherit;
    -webkit-appearance: none;
    appearance: none;
  }

  .input-field:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .input-field:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .input-field:read-only {
    background: #f9fafb;
    cursor: default;
  }

  .has-error .input-field {
    border-color: #ef4444;
  }

  .has-error .input-field:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .input-hint {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .input-error {
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
  }
</style>
