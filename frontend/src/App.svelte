<script lang="ts">
  import { onMount } from "svelte";
  import Login from "./components/Login.svelte";
  import Home from "./components/Home.svelte";
  import { authStore, initAuth } from "./stores/authStore";

  onMount(() => {
    initAuth();
  });
</script>

<main>
  {#if $authStore.loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Verificando sesión...</p>
    </div>
  {:else if $authStore.isAuthenticated}
    <Home />
  {:else}
    <Login />
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
    min-height: 100dvh;
  }

  .loading-container {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-container p {
    color: white;
    font-size: 1rem;
    font-weight: 500;
  }
</style>
