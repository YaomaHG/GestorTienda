import { Injectable, signal } from '@angular/core';
import { Client } from '../models/client.model';
import { StorageService } from './storage.service';
import { genId } from '../utils/id.util';

const CLIENTS_KEY = 'gt_clients';

/**
 * Gestión de clientes con persistencia en localStorage.
 * - Señales para estado reactivo.
 * - CRUD y lookup por id.
 */
@Injectable({ providedIn: 'root' })
export class ClientService {
  // Estado de clientes inicializado desde storage
  private clients = signal<Client[]>(this.storage.getItem<Client[]>(CLIENTS_KEY, []) || []);

  clients$ = this.clients.asReadonly();

  constructor(private storage: StorageService) {
    if (this.clients().length === 0) {
      const demo = [
        {
          id: genId(),
          name: 'Ana Pérez',
          address: 'Calle 123, Col. Centro',
          phone: '555-123-4567',
          email: 'ana.perez@example.com',
          imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
        },
        {
          id: genId(),
          name: 'Luis Gómez',
          address: 'Av. Reforma 456',
          phone: '555-987-6543',
          email: 'luis.gomez@example.com',
          imageUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop',
        },
      ];
      this.clients.set(demo);
      this.persist();
    }
  }

  /** Persistir arreglo de clientes en localStorage. */
  private persist() {
    this.storage.setItem(CLIENTS_KEY, this.clients());
  }

  /** Listado de clientes actual (snapshot). */
  list(): Client[] {
    return this.clients();
  }

  /** Busca un cliente por id. */
  getById(id: string): Client | undefined {
    return this.clients().find(p => p.id === id);
  }

  /** Crea un cliente y lo añade al inicio. */
  create(data: Omit<Client, 'id'>) {
    const item: Client = { id: genId(), ...data };
    this.clients.update(arr => [item, ...arr]);
    this.persist();
    return item;
  }

  /** Actualiza un cliente por id (merge). */
  update(id: string, patch: Partial<Client>) {
    this.clients.update(arr => arr.map(p => (p.id === id ? { ...p, ...patch, id } : p)));
    this.persist();
  }

  /** Elimina un cliente por id. */
  delete(id: string) {
    this.clients.update(arr => arr.filter(p => p.id !== id));
    this.persist();
  }
}
