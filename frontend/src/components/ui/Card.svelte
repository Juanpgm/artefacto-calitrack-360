<script lang="ts">
  export let variant: 'default' | 'outlined' | 'elevated' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let clickable = false;
  export let onClick: (() => void) | undefined = undefined;

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
</script>

<div
  class="card card-{variant} card-padding-{padding}"
  class:card-clickable={clickable}
  on:click={handleClick}
  on:keypress={(e) => e.key === 'Enter' && handleClick()}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
>
  <slot />
</div>

<style>
  .card {
    border-radius: 12px;
    background: white;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  /* Variantes */
  .card-default {
    border: 1px solid #e5e7eb;
  }

  .card-outlined {
    border: 1px solid #d1d5db; /* Neutral gray instead of purple */
  }

  .card-elevated {
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  /* Padding */
  .card-padding-none {
    padding: 0;
  }

  .card-padding-sm {
    padding: 0.5rem;
  }

  .card-padding-md {
    padding: 1rem;
  }

  .card-padding-lg {
    padding: 1.25rem;
  }

  /* Estado clickable */
  .card-clickable {
    cursor: pointer;
  }

  .card-clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  .card-clickable:active {
    transform: translateY(0);
  }

  /* Dark mode removed */
</style>
