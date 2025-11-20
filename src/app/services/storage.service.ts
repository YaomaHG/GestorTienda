import { Injectable } from '@angular/core';

/**
 * Envoltorio simple sobre localStorage con serialización JSON.
 * - Centraliza el acceso y facilita testear o migrar a otra capa de almacenamiento.
 */

@Injectable({ providedIn: 'root' })
export class StorageService {
  getItem<T>(key: string, fallback: T | null = null): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      // Si el parse falla o el navegador bloquea acceso, devolvemos el fallback
      return fallback;
    }
  }

  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
