/**
 * Tipos base de la aplicación de tareas.
 *
 * Convenciones:
 * - Todas las fechas/horas se almacenan como ISO 8601 (string) para facilitar persistencia.
 * - Los nombres están en español para mantener coherencia con la UI.
 */
export enum Categoria {
  Personal = 'personal',
  Trabajo = 'trabajo',
  Social = 'social',
}

export enum Prioridad {
  Baja = 'baja',
  Media = 'media',
  Alta = 'alta',
}

export enum Estado {
  Inicial = 'inicial',
  EnEjecucion = 'en_ejecucion',
  Finalizada = 'finalizada',
}

/**
 * Representa una tarea completa persistible.
 * - fechaHora: Fecha/hora de vencimiento en ISO (ej.: 2025-11-11T09:30:00.000Z)
 * - recordatorio: Fecha/hora del recordatorio en ISO. Si está definida, se programa notificación.
 * - completada: banderín redundante sincronizado con el estado Finalizada.
 */
export interface Tarea {
  id: string;
  /** Título corto descriptivo */
  titulo: string;
  /** Descripción ampliada opcional */
  descripcion?: string;
  /** Fecha y hora de vencimiento (ISO 8601) */
  fechaHora?: string; // ISO 8601, incluye fecha y hora
  prioridad: Prioridad;
  estado: Estado;
  categoria: Categoria;
  /** Notas u observaciones libres */
  notas?: string;
  /** Redundante, se actualiza acorde al estado */
  completada: boolean;
  /** ISO 8601 para recordatorios programados */
  recordatorio?: string; // ISO 8601 para recordatorios programados
}

export type NuevaTarea = Omit<Tarea, 'id' | 'completada'>;
