<script lang="ts">
  import { authStore } from "../stores/authStore";

  const handleLogout = async () => {
    await authStore.logout();
  };
</script>

<div class="home-container">
  <header class="header">
    <h1>CaliTrack 360</h1>
    <button class="btn-logout" on:click={handleLogout}>Cerrar sesión</button>
  </header>

  <div class="content">
    <div class="welcome">
      <h2>¡Bienvenido!</h2>
      <p>La aplicación está lista para comenzar el desarrollo.</p>

      <div class="user-card">
        <div class="user-avatar">
          {#if $authStore.user?.photoURL}
            <img src={$authStore.user.photoURL} alt="Avatar" />
          {:else}
            <div class="avatar-placeholder">
              {($authStore.user?.email?.[0] || "U").toUpperCase()}
            </div>
          {/if}
        </div>

        <div class="user-details">
          <p class="user-name">
            {$authStore.user?.displayName ||
              $authStore.user?.email ||
              "Usuario"}
          </p>
          <p class="user-email">{$authStore.user?.email}</p>

          {#if $authStore.user?.roles?.length > 0}
            <div class="user-roles">
              <strong>Roles:</strong>
              {#each $authStore.user.roles as role}
                <span class="badge">{role}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .home-container {
    min-height: 100vh;
    min-height: 100dvh;
    background-color: var(--surface);
  }

  .header {
    background-color: white;
    padding: 1rem 1.5rem;
    box-shadow: 0 1px 3px var(--shadow);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header h1 {
    color: var(--primary);
    font-size: 1.5rem;
    font-weight: 700;
  }

  .btn-logout {
    background-color: transparent;
    color: var(--error);
    border: 1px solid var(--error);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .btn-logout:hover {
    background-color: var(--error);
    color: white;
  }

  .content {
    padding: 2rem 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 80px);
  }

  .welcome {
    text-align: center;
    background: white;
    padding: 3rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px var(--shadow);
    max-width: 500px;
  }

  .welcome h2 {
    color: var(--text-primary);
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .welcome p {
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .user-card {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: var(--surface);
    border-radius: 0.75rem;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .user-avatar {
    flex-shrink: 0;
  }

  .user-avatar img,
  .avatar-placeholder {
    width: 64px;
    height: 64px;
    border-radius: 50%;
  }

  .avatar-placeholder {
    background: linear-gradient(
      135deg,
      var(--primary) 0%,
      var(--primary-dark) 100%
    );
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .user-details {
    flex: 1;
    text-align: left;
  }

  .user-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .user-email {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }

  .user-roles {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    font-size: 0.875rem;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: var(--primary);
    color: white;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .header {
      padding: 1rem;
    }

    .header h1 {
      font-size: 1.25rem;
    }

    .content {
      padding: 1.5rem 1rem;
    }

    .welcome {
      padding: 2rem 1.5rem;
    }

    .welcome h2 {
      font-size: 1.5rem;
    }
  }
</style>
