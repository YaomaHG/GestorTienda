import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { StorageService } from './storage.service';
import { genId } from '../utils/id.util';

const PRODUCTS_KEY = 'gt_products';

/**
 * Gestión de productos en memoria con persistencia en localStorage.
 * - Usa señales para exponer el listado reactivo.
 * - CRUD básico con `create/update/delete` y helper `getById`.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  // Estado reactivo de productos (inicializa desde localStorage)
  private products = signal<Product[]>(this.storage.getItem<Product[]>(PRODUCTS_KEY, []) || []);

  products$ = this.products.asReadonly();

  constructor(private storage: StorageService) {
    // semillas demo si está vacío
    if (this.products().length === 0) {
      const demo = [
        {
          id: genId(),
          name: 'Café molido 500g',
          description: 'Tueste medio, origen Colombia',
          stock: 25,
          costPrice: 80,
          salePrice: 120,
          imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
        },
        {
          id: genId(),
          name: 'Pan artesanal',
          description: 'Masa madre, recién horneado',
          stock: 15,
          costPrice: 20,
          salePrice: 35,
          imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
        },
      ];
      this.products.set(demo);
      this.persist();
    }
  }

  /** Persistir el arreglo de productos en localStorage. */
  private persist() {
    this.storage.setItem(PRODUCTS_KEY, this.products());
  }

  /** Retorna el listado actual (snapshot). */
  list(): Product[] {
    return this.products();
  }

  /** Busca un producto por id. */
  getById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  /** Crea un nuevo producto y lo pone al inicio del listado. */
  create(data: Omit<Product, 'id'>) {
    const product: Product = { id: genId(), ...data };
    this.products.update(arr => [product, ...arr]);
    this.persist();
    return product;
  }

  /** Actualiza un producto por id (merge de campos). */
  update(id: string, patch: Partial<Product>) {
    this.products.update(arr => arr.map(p => (p.id === id ? { ...p, ...patch, id } : p)));
    this.persist();
  }

  /** Elimina un producto por id. */
  delete(id: string) {
    this.products.update(arr => arr.filter(p => p.id !== id));
    this.persist();
  }
}
