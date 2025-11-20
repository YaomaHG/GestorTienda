import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, PermissionStatus, ScheduleOptions } from '@capacitor/local-notifications';
import { Tarea } from '../modelos/tarea';

/**
 * Servicio que encapsula el plugin de notificaciones locales.
 * - Es tolerante a ejecución en web (simplemente no hace nada si no está disponible el plugin).
 * - Genera IDs determinísticos basados en el id de la tarea para poder cancelar/actualizar.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private disponible = false;

  constructor() {
    this.iniciar();
  }

  private async iniciar() {
    try {
      if (Capacitor.isPluginAvailable('LocalNotifications')) {
        const permiso: PermissionStatus = await LocalNotifications.requestPermissions();
        this.disponible = permiso.display === 'granted';
      }
    } catch {
      this.disponible = false;
    }
  }

  /** Convierte un id string a un entero estable para usarlo como identificador de notificación */
  private idNotificacionDeTarea(tareaId: string): number {
    let hash = 0;
    for (let i = 0; i < tareaId.length; i++) {
      hash = (hash << 5) - hash + tareaId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 2147483647);
  }

  /** Programa una notificación para la tarea si tiene recordatorio */
  async programar(tarea: Tarea): Promise<void> {
    if (!this.disponible) return;
    if (!tarea.recordatorio) return;
    const id = this.idNotificacionDeTarea(tarea.id);
    const schedule: ScheduleOptions = {
      notifications: [
        {
          id,
          title: 'Recordatorio',
          body: `${tarea.titulo}`,
          schedule: { at: new Date(tarea.recordatorio) },
          smallIcon: 'ic_stat_icon',
        },
      ],
    };
    try {
      await LocalNotifications.schedule(schedule);
    } catch {
      // ignorar en web o errores silenciosos
    }
  }

  /** Cancela la notificación asociada a una tarea */
  async cancelar(tareaId: string): Promise<void> {
    if (!this.disponible) return;
    const id = this.idNotificacionDeTarea(tareaId);
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch {
      // ignorar
    }
  }
}
