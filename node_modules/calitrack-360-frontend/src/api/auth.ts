import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gestorproyectoapi-production.up.railway.app';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user?: any;
}

/**
 * Login con Firebase Auth SDK
 * 1. Autentica con Firebase usando email/password
 * 2. Obtiene idToken de Firebase
 * 3. Valida con backend que agrega roles/permisos
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  console.log('🔐 Attempting login with Firebase Auth SDK:', { email: credentials.username });

  try {
    // 1. Autenticar con Firebase
    console.log('📡 Authenticating with Firebase...');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.username,
      credentials.password
    );

    console.log('✅ Firebase authentication successful');

    // 2. Obtener ID token de Firebase
    const idToken = await userCredential.user.getIdToken();
    console.log('✅ ID token obtained:', idToken.substring(0, 20) + '...');

    // 3. Validar con backend para obtener roles y permisos
    console.log('🌐 Validating session with backend:', `${API_BASE_URL}/auth/validate-session`);
    
    const response = await fetch(`${API_BASE_URL}/auth/validate-session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📥 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend validation failed:', errorText);
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { detail: errorText || 'Error de validación' };
      }
      
      throw new Error(error.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const backendData = await response.json();
    console.log('✅ Backend validation successful:', backendData);

    // 4. Combinar datos de Firebase + Backend
    const email = userCredential.user.email || '';
    const userData = {
      // Datos de Firebase
      email: email,
      uid: userCredential.user.uid,
      displayName: userCredential.user.displayName || backendData.user?.nombre_completo || backendData.user?.nombre || email.split('@')[0],
      photoURL: userCredential.user.photoURL,
      
      // Extraer username del email si no existe
      username: backendData.user?.username || backendData.user?.nombre_usuario || email.split('@')[0],
      
      // Datos del backend (pueden sobrescribir los anteriores si existen)
      ...backendData.user,
      
      // Roles y permisos
      roles: backendData.roles || [],
      permissions: backendData.permissions || []
    };

    const result: LoginResponse = {
      access_token: idToken,
      token_type: 'Bearer',
      user: userData
    };

    console.log('✅ Login complete:', result);
    
    // Guardar datos completos en sessionStorage también
    sessionStorage.setItem('userData', JSON.stringify(userData));
    sessionStorage.setItem('authToken', idToken);
    
    return result;

  } catch (err: any) {
    console.error('💥 Login error:', err);
    
    // Mapear errores de Firebase a mensajes legibles
    if (err.code === 'auth/user-not-found') {
      throw new Error('Usuario no encontrado');
    } else if (err.code === 'auth/wrong-password') {
      throw new Error('Contraseña incorrecta');
    } else if (err.code === 'auth/invalid-email') {
      throw new Error('Email inválido');
    } else if (err.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos. Intenta más tarde.');
    }
    
    throw err;
  }
};

/**
 * Obtiene el token actual del usuario autenticado
 */
export const getCurrentToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

/**
 * Headers de autenticación para requests protegidos
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getCurrentToken();
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

/**
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  await auth.signOut();
  console.log('✅ Logout successful');
};
