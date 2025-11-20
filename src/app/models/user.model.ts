/**
 * Modelo de usuario de la app (persistido en localStorage).
 * Nota: la contraseña se guarda en claro solo para fines de DEMO local.
 * En producción, debe almacenarse un hash de la contraseña.
 */
export interface User {
  id: string; // uuid
  username: string;
  password: string; // stored as plain for local demo only; in real apps hash it
  storeName: string;
  storeImageUrl: string; // url de la imagen
}

/** Estado de autenticación actual (usuario activo). */
export interface AuthState {
  currentUser: User | null;
}
