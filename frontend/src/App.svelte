<script lang="ts">
  import { onMount } from "svelte";
  import Login from "./components/Login.svelte";
  import Home from "./components/Home.svelte";
  import { authStore, initAuth } from "./stores/authStore";

  let initError: string | null = null;

  onMount(() => {
    try {
      // Verificar variables de entorno críticas
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
      
      if (!apiKey || !authDomain) {
        initError = "Firebase no está configurado. Por favor configure las variables de entorno en Vercel.";
        console.error("❌ Missing Firebase configuration");
        return;
      }
      
      initAuth();
    } catch (error) {
      console.error("❌ Error initializing app:", error);
      initError = "Error al inicializar la aplicación: " + (error as Error).message;
    }
  });
</script>

<main>
  {#if initError}
    <div class="error-container">
      <div class="error-card">
        <h1>⚠️ Error de Configuración</h1>
        <p>{initError}</p>
        <details>
          <summary>Información técnica</summary>
          <p>Variables de entorno requeridas:</p>
          <ul>
            <li>VITE_FIREBASE_API_KEY</li>
            <li>VITE_FIREBASE_AUTH_DOMAIN</li>
            <li>VITE_FIREBASE_PROJECT_ID</li>
            <li>VITE_API_URL</li>
          </ul>
        </details>
      </div>
    </div>
  {:else if $authStore.loading}
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

  .error-container {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .error-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .error-card h1 {
    color: #e53e3e;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .error-card p {
    color: #4a5568;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .error-card details {
    margin-top: 1.5rem;
  }

  .error-card summary {
    cursor: pointer;
    color: #667eea;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .error-card ul {
    list-style: none;
    padding-left: 0;
    margin-top: 0.5rem;
  }

  .error-card li {
    background: #edf2f7;
    padding: 0.5rem;
    margin: 0.25rem 0;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.875rem;
  }
</style>
