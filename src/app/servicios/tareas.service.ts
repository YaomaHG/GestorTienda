import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Categoria, Estado, Prioridad, Tarea } from '../modelos/tarea';
import { NotificacionesService } from './notificaciones.service';

/** Clave única en Storage para persistir el arreglo de tareas */
const CLAVE_TAREAS = 'tareas';

/**
 * Servicio central de gestión de tareas.
 * Responsabilidades:
 *  - CRUD en memoria (BehaviorSubject) + persistencia en Ionic Storage.
 *  - Filtros y búsqueda textual simple.
 *  - Reordenamiento (drag & drop) preservando el estado en Storage.
 *  - Exportación/Importación en JSON.
 *  - Programar / cancelar notificaciones según recordatorios.
 */
@Injectable({ providedIn: 'root' })
export class TareasService {
  private _tareas$ = new BehaviorSubject<Tarea[]>([]);
  readonly tareas$ = this._tareas$.asObservable();
  private _inicializado = false;

  private almacenamiento = inject(Storage);
  private notifs = inject(NotificacionesService);

  constructor() { this.iniciar(); }

  private async iniciar() {
    if (!this._inicializado) {
      await this.almacenamiento.create();
      await this.cargar();
      this._inicializado = true;
    }
  }

  /** Genera un ID pseudo-único (no cripto) combinando tiempo + aleatorio */
  private generarId(): string {
    return (
      Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8)
    ).toLowerCase();
  }

  /** Carga las tareas desde Storage al iniciar la app */
  async cargar(): Promise<void> {
    const guardadas = (await this.almacenamiento.get(CLAVE_TAREAS)) as
      | Tarea[]
      | null;
    if (Array.isArray(guardadas)) {
      this._tareas$.next(guardadas);
    } else {
      this._tareas$.next([]);
    }
  }

  /** Persiste el estado actual en Storage */
  private async guardar(): Promise<void> {
    await this.almacenamiento.set(CLAVE_TAREAS, this._tareas$.value);
  }

  /** Devuelve snapshot inmutable (copia) de las tareas */
  listar(): Tarea[] {
    return this._tareas$.value;
  }

  /** Crea una nueva tarea y la inserta al inicio del arreglo */
  agregar(parcial: Omit<Tarea, 'id' | 'completada'>): Tarea {
    const nueva: Tarea = {
      ...parcial,
      id: this.generarId(),
      completada: parcial.estado === Estado.Finalizada,
    };
    const actual = this._tareas$.value;
    this._tareas$.next([nueva, ...actual]);
    this.guardar();
    // programar notificación si aplica
    this.notifs.programar(nueva);
    return nueva;
  }

  /** Actualiza propiedades parciales de la tarea con id dado */
  actualizar(id: string, cambios: Partial<Omit<Tarea, 'id'>>): Tarea | null {
    const actual = this._tareas$.value.slice();
    const idx = actual.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const actualizado: Tarea = { ...actual[idx], ...cambios };
    // sincronizar completada con estado
    if (cambios.estado) {
      actualizado.completada = cambios.estado === Estado.Finalizada;
    }
    actual[idx] = actualizado;
    this._tareas$.next(actual);
    this.guardar();
    // actualizar notificación
    if (actualizado.recordatorio) {
      this.notifs.programar(actualizado);
    } else {
      this.notifs.cancelar(actualizado.id);
    }
    return actualizado;
  }

  /** Elimina una tarea por id. Devuelve true si existía. */
  eliminar(id: string): boolean {
    const actual = this._tareas$.value;
    const siguiente = actual.filter((t) => t.id !== id);
    const cambiado = siguiente.length !== actual.length;
    if (cambiado) {
      this._tareas$.next(siguiente);
      this.guardar();
      this.notifs.cancelar(id);
    }
    return cambiado;
  }

  /** Alterna bandera completada y ajusta estado (Finalizada / EnEjecucion) */
  alternarCompletada(id: string): Tarea | null {
    const t = this.listar().find((x) => x.id === id);
    if (!t) return null;
    const completada = !t.completada;
    const estado = completada ? Estado.Finalizada : Estado.EnEjecucion;
    return this.actualizar(id, { completada, estado });
  }

  /** Reordena tareas simulando drag & drop */
  reordenar(indiceDesde: number, indiceHasta: number): void {
    const arr = this._tareas$.value.slice();
    const [movida] = arr.splice(indiceDesde, 1);
    arr.splice(indiceHasta, 0, movida);
    this._tareas$.next(arr);
    this.guardar();
  }

  /** Filtra tareas según criterios básicos. Rango de fechas compara cadenas ISO. */
  filtrar(opciones: {
    categoria?: Categoria;
    prioridad?: Prioridad;
    estado?: Estado;
    fechaDesdeISO?: string;
    fechaHastaISO?: string;
  }): Tarea[] {
    const { categoria, prioridad, estado, fechaDesdeISO, fechaHastaISO } = opciones;
    return this.listar().filter((t) => {
      if (categoria && t.categoria !== categoria) return false;
      if (prioridad && t.prioridad !== prioridad) return false;
      if (estado && t.estado !== estado) return false;
      if (fechaDesdeISO && t.fechaHora && t.fechaHora < fechaDesdeISO) return false;
      if (fechaHastaISO && t.fechaHora && t.fechaHora > fechaHastaISO) return false;
      return true;
    });
  }

  /** Búsqueda full-text simple en título, descripción y notas (case-insensitive) */
  buscar(termino: string): Tarea[] {
    const q = termino.trim().toLowerCase();
    if (!q) return this.listar();
    return this.listar().filter((t) =>
      (t.titulo + ' ' + (t.descripcion || '') + ' ' + (t.notas || ''))
        .toLowerCase()
        .includes(q)
    );
  }

  /** Serializa el arreglo completo (pretty JSON) */
  exportarJSON(): string {
    return JSON.stringify(this._tareas$.value, null, 2);
  }

  /**
   * Importa un JSON de tareas.
   * @param reemplazar Si true sustituye las actuales; si false concatena (nuevas primero).
   */
  importarJSON(json: string, reemplazar = false): { insertadas: number } {
    try {
      const datos = JSON.parse(json) as Tarea[];
      if (!Array.isArray(datos)) throw new Error('Formato no válido');
      const actuales = this._tareas$.value;
      const nuevas = reemplazar ? datos : [...datos, ...actuales];
      // normalizar ids faltantes
      const normalizadas = nuevas.map((t) => ({ ...t, id: t.id || this.generarId() }));
      this._tareas$.next(normalizadas);
      this.guardar();
      return { insertadas: datos.length };
    } catch (e) {
      throw new Error('No se pudo importar: ' + (e as Error).message);
    }
  }

  /** Cambia la fecha/hora de vencimiento de una tarea */
  reprogramar(id: string, nuevaFechaHoraISO?: string): Tarea | null {
    return this.actualizar(id, { fechaHora: nuevaFechaHoraISO });
  }
}
