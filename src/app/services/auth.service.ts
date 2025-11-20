import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthState, User } from '../models/user.model';
import { genId } from '../utils/id.util';

const USERS_KEY = 'gt_users';
const AUTH_KEY = 'gt_auth';

/**
 * Servicio de autenticación con persistencia en localStorage.
 * - Registra usuarios (guardándolos en `gt_users`).
 * - Mantiene el estado de sesión (`gt_auth`) con el usuario actual.
 * - Expone señales reactivas `currentUser` e `isLoggedIn` para usar en componentes.
 * Nota: Contraseñas en claro por simplicidad DEMO; no usar así en producción.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Lista de usuarios registrado, inicializada desde localStorage
  private users = signal<User[]>(this.storage.getItem<User[]>(USERS_KEY, []) || []);
  // Estado de autenticación (usuario actual logueado)
  private state = signal<AuthState>(this.storage.getItem<AuthState>(AUTH_KEY, { currentUser: null }) || { currentUser: null });

  currentUser = computed(() => this.state().currentUser);
  isLoggedIn = computed(() => !!this.state().currentUser);

  constructor(private storage: StorageService) {}

  /** Persiste usuarios y estado de auth en localStorage. */
  private persist() {
    this.storage.setItem(USERS_KEY, this.users());
    this.storage.setItem(AUTH_KEY, this.state());
  }

  /**
   * Registra un nuevo usuario y deja la sesión iniciada.
   * Retorna `{ok:false}` si el usuario ya existe.
   */
  register(data: Omit<User, 'id'>): { ok: boolean; message?: string } {
    const existing = this.users().find(u => u.username.toLowerCase() === data.username.toLowerCase());
    if (existing) {
      return { ok: false, message: 'El nombre de usuario ya existe' };
    }
  const user: User = { id: genId(), ...data };
    this.users.update(u => [...u, user]);
    this.state.set({ currentUser: user });
    this.persist();
    return { ok: true };
  }

  /**
   * Inicia sesión validando usuario/contraseña. En éxito, persiste el estado.
   */
  login(username: string, password: string): { ok: boolean; message?: string } {
    const user = this.users().find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) return { ok: false, message: 'Credenciales inválidas' };
    this.state.set({ currentUser: user });
    this.persist();
    return { ok: true };
  }

  /** Cierra sesión eliminando el usuario actual del estado. */
  logout() {
    this.state.set({ currentUser: null });
    this.persist();
  }

  /** Actualiza datos del usuario actual y sincroniza la lista de usuarios. */
  updateCurrentUser(patch: Partial<User>) {
    const cu = this.state().currentUser;
    if (!cu) return;
    const updated: User = { ...cu, ...patch };
    this.state.set({ currentUser: updated });
    this.users.update(arr => arr.map(u => (u.id === updated.id ? updated : u)));
    this.persist();
  }
}
