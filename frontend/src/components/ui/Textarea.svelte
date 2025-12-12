<script lang="ts">
  export let label: string;
  export let value: string = '';
  export let rows = 4;
  export let placeholder = '';
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let error: string | undefined = undefined;
  export let hint: string | undefined = undefined;
  export let maxLength: number | undefined = undefined;

  $: charCount = maxLength ? value.length : 0;
</script>

<div class="textarea-wrapper">
  <label class="textarea-label" for={label}>
    {label}
    {#if required}
      <span class="required">*</span>
    {/if}
    {#if maxLength}
      <span class="char-count">{charCount}/{maxLength}</span>
    {/if}
  </label>
  
  <textarea
    id={label}
    class="textarea-field"
    class:has-error={error}
    {rows}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    maxlength={maxLength}
    bind:value
    on:input
    on:change
    on:blur
  />

  {#if hint && !error}
    <span class="textarea-hint">{hint}</span>
  {/if}

  {#if error}
    <span class="textarea-error">{error}</span>
  {/if}
</div>

<style>
  .textarea-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: 100%;
  }

  .textarea-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .required {
    color: #ef4444;
  }

  .char-count {
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 400;
  }

  .textarea-field {
    width: 100%;
    min-height: 80px;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    line-height: 1.5;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #1f2937;
    resize: vertical;
    transition: all 0.2s ease;
    font-family: inherit;
    -webkit-appearance: none;
    appearance: none;
  }

  .textarea-field:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .textarea-field:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    resize: none;
  }

  .textarea-field:read-only {
    background: #f9fafb;
    cursor: default;
  }

  .textarea-field.has-error {
    border-color: #ef4444;
  }

  .textarea-field.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .textarea-hint {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .textarea-error {
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
  }
</style>
