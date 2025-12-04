<script lang="ts">
  export let label: string = '';
  export let options: string[] = [];
  export let selected: string[] = [];
  export let placeholder: string = 'Seleccionar...';
  export let searchPlaceholder: string = 'Buscar...';

  let isOpen = false;
  let searchQuery = '';

  $: filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      searchQuery = '';
    }
  }

  function toggleOption(option: string) {
    if (selected.includes(option)) {
      selected = selected.filter(s => s !== option);
    } else {
      selected = [...selected, option];
    }
  }

  function clearAll() {
    selected = [];
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.multiselect-container')) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="multiselect-wrapper">
  {#if label}
    <label class="multiselect-label">{label}</label>
  {/if}
  
  <div class="multiselect-container">
    <button
      type="button"
      class="multiselect-trigger"
      on:click|stopPropagation={toggleDropdown}
    >
      <span class="multiselect-value">
        {#if selected.length === 0}
          <span class="placeholder">{placeholder}</span>
        {:else if selected.length === 1}
          {selected[0]}
        {:else}
          {selected.length} seleccionados
        {/if}
      </span>
      <span class="multiselect-arrow" class:open={isOpen}>▼</span>
    </button>

    {#if isOpen}
      <div class="multiselect-dropdown">
        <div class="multiselect-search">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder={searchPlaceholder}
            class="search-input"
            on:click|stopPropagation
          />
        </div>

        {#if selected.length > 0}
          <div class="multiselect-clear">
            <button
              type="button"
              class="clear-btn"
              on:click|stopPropagation={clearAll}
            >
              Limpiar selección
            </button>
          </div>
        {/if}

        <div class="multiselect-options">
          {#if filteredOptions.length === 0}
            <div class="no-results">No se encontraron resultados</div>
          {:else}
            {#each filteredOptions as option}
              <label class="multiselect-option" on:click|stopPropagation>
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  on:change={() => toggleOption(option)}
                />
                <span class="option-text">{option}</span>
                {#if selected.includes(option)}
                  <span class="checkmark">✓</span>
                {/if}
              </label>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .multiselect-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .multiselect-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #4a5568;
  }

  .multiselect-container {
    position: relative;
  }

  .multiselect-trigger {
    width: 100%;
    min-height: 44px;
    padding: 0.625rem 0.875rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    background: white;
    font-size: 0.9375rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    transition: all 0.2s ease;
  }

  .multiselect-trigger:hover {
    border-color: #a0aec0;
  }

  .multiselect-trigger:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .multiselect-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .placeholder {
    color: #a0aec0;
  }

  .multiselect-arrow {
    font-size: 0.75rem;
    color: #718096;
    transition: transform 0.2s ease;
  }

  .multiselect-arrow.open {
    transform: rotate(180deg);
  }

  .multiselect-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .multiselect-search {
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .multiselect-clear {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .clear-btn {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .clear-btn:hover {
    background: #fee2e2;
  }

  .multiselect-options {
    overflow-y: auto;
    max-height: 200px;
  }

  .multiselect-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .multiselect-option:hover {
    background: #f7fafc;
  }

  .multiselect-option input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .option-text {
    flex: 1;
    font-size: 0.875rem;
    color: #2d3748;
  }

  .checkmark {
    color: #667eea;
    font-weight: 700;
  }

  .no-results {
    padding: 1.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: #a0aec0;
  }
</style>
