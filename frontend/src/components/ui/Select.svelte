<script lang="ts">
  export let label: string;
  export let value: string = '';
  export let options: Array<{ label: string; value: string }> = [];
  export let placeholder = 'Seleccione una opción';
  export let disabled = false;
  export let required = false;
  export let error: string | undefined = undefined;
  export let hint: string | undefined = undefined;
  export let searchable = false;

  let isOpen = false;
  let searchTerm = '';
  let dropdownRef: HTMLDivElement;

  $: filteredOptions = searchable && searchTerm
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  $: selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  function toggleDropdown() {
    if (!disabled) {
      isOpen = !isOpen;
      if (isOpen) searchTerm = '';
    }
  }

  function selectOption(optionValue: string) {
    value = optionValue;
    isOpen = false;
    searchTerm = '';
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="select-wrapper">
  <label class="select-label" for={label}>
    {label}
    {#if required}
      <span class="required">*</span>
    {/if}
  </label>

  <div 
    class="select-container" 
    class:has-error={error}
    class:is-open={isOpen}
    bind:this={dropdownRef}
  >
    <button
      type="button"
      class="select-trigger"
      class:disabled
      {disabled}
      on:click|stopPropagation={toggleDropdown}
    >
      <span class="select-value" class:placeholder={!value}>
        {selectedLabel}
      </span>
      <span class="select-arrow" class:rotate={isOpen}>▼</span>
    </button>

    {#if isOpen}
      <div class="select-dropdown">
        {#if searchable}
          <div class="search-box">
            <input
              type="text"
              placeholder="Buscar..."
              bind:value={searchTerm}
              on:click|stopPropagation
            />
          </div>
        {/if}

        <div class="options-list">
          {#if filteredOptions.length === 0}
            <div class="no-options">No hay opciones disponibles</div>
          {:else}
            {#each filteredOptions as option}
              <button
                type="button"
                class="option-item"
                class:selected={value === option.value}
                on:click|stopPropagation={() => selectOption(option.value)}
              >
                {option.label}
              </button>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>

  {#if hint && !error}
    <span class="select-hint">{hint}</span>
  {/if}

  {#if error}
    <span class="select-error">{error}</span>
  {/if}
</div>

<style>
  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .select-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .required {
    color: #ef4444;
  }

  .select-container {
    position: relative;
  }

  .select-trigger {
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #1f2937;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    text-align: left;
  }

  .select-trigger:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .select-trigger.disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .has-error .select-trigger {
    border-color: #ef4444;
  }

  .select-value.placeholder {
    color: #9ca3af;
  }

  .select-arrow {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
    color: #6b7280;
  }

  .select-arrow.rotate {
    transform: rotate(180deg);
  }

  .select-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #667eea;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-height: 300px;
    overflow: hidden;
    z-index: 1000;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .search-box {
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .search-box input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .search-box input:focus {
    outline: none;
    border-color: #667eea;
  }

  .options-list {
    max-height: 250px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .option-item {
    width: 100%;
    padding: 0.875rem 1rem;
    border: none;
    background: white;
    color: #1f2937;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease;
    font-size: 1rem;
    font-family: inherit;
  }

  .option-item:hover {
    background: #f3f4f6;
  }

  .option-item.selected {
    background: #ede9fe;
    color: #667eea;
    font-weight: 600;
  }

  .no-options {
    padding: 2rem 1rem;
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
  }

  .select-hint {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .select-error {
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
  }
</style>
