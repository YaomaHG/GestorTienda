import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Categoria, Estado, Prioridad, Tarea } from '../modelos/tarea';
import { TareasService } from '../servicios/tareas.service';
import { PreferenciasService } from '../servicios/preferencias.service';
import { FormularioTareaComponent } from '../componentes/formulario-tarea/formulario-tarea.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  /** Inyecciones a través de API inject() para cumplir reglas de lint y facilitar pruebas */
  private tareasSrv = inject(TareasService);
  private modalCtrl = inject(ModalController);
  private prefs = inject(PreferenciasService);
  Categoria = Categoria;
  Prioridad = Prioridad;
  Estado = Estado;

  // filtros y búsqueda
  /** Filtro por categoría (null = todas) */
  private _categoria$ = new BehaviorSubject<Categoria | null>(null);
  /** Filtro por prioridad (null = todas) */
  private _prioridad$ = new BehaviorSubject<Prioridad | null>(null);
  /** Filtro por estado (null = todos) */
  private _estado$ = new BehaviorSubject<Estado | null>(null);
  /** Término de búsqueda para coincidencias en texto */
  private _termino$ = new BehaviorSubject<string>('');

  /** Lista reactiva filtrada según los BehaviorSubjects anteriores */
  tareasFiltradas$: Observable<Tarea[]> = combineLatest([
    this.tareasSrv.tareas$,
    this._categoria$,
    this._prioridad$,
    this._estado$,
    this._termino$,
  ]).pipe(
    map(([tareas, categoria, prioridad, estado, termino]) => {
      let resultado = tareas;
      if (categoria) resultado = resultado.filter((t) => t.categoria === categoria);
      if (prioridad) resultado = resultado.filter((t) => t.prioridad === prioridad);
      if (estado) resultado = resultado.filter((t) => t.estado === estado);
      const q = termino.trim().toLowerCase();
      if (q) {
        resultado = resultado.filter((t) =>
          (t.titulo + ' ' + (t.descripcion || '') + ' ' + (t.notas || ''))
            .toLowerCase()
            .includes(q)
        );
      }
      return resultado;
    })
  );

  // Segmento vista: 'lista' | 'calendario'
  vista: 'lista' | 'calendario' = 'lista';
  /** Fecha seleccionada (YYYY-MM-DD) para vista calendario */
  private _fechaSeleccion$ = new BehaviorSubject<string>(this.hoyISO());
  /** Tareas del día elegido, derivadas de tareas$ + fecha */
  tareasDelDia$: Observable<Tarea[]> = combineLatest([
    this.tareasSrv.tareas$,
    this._fechaSeleccion$,
  ]).pipe(
    map(([tareas, fecha]) => {
      return tareas.filter((t) => {
        if (!t.fechaHora) return false;
        const fechaTarea = t.fechaHora.slice(0, 10);
        return fechaTarea === fecha;
      });
    })
  );

  /** Devuelve la fecha actual en formato ISO (YYYY-MM-DD) */
  private hoyISO(): string {
    return new Date().toISOString().slice(0, 10);
  }


  /** Abre modal para crear una nueva tarea */
  async nuevaTarea() {
    const modal = await this.modalCtrl.create({
      component: FormularioTareaComponent,
    });
    await modal.present();
  }

  /** Abre modal para editar una tarea existente */
  async editarTarea(tarea: Tarea) {
    const modal = await this.modalCtrl.create({
      component: FormularioTareaComponent,
      componentProps: { tarea },
    });
    await modal.present();
  }

  /** Elimina una tarea por id */
  eliminarTarea(tarea: Tarea) {
    this.tareasSrv.eliminar(tarea.id);
  }

  /** Marca como completada/no-completada alternando el estado */
  alternarTarea(tarea: Tarea) {
    this.tareasSrv.alternarCompletada(tarea.id);
  }

  /** Actualiza término de búsqueda */
  buscarCambio(ev: CustomEvent) {
    const valor = (ev.detail as any).value || '';
    this._termino$.next(valor);
  }

  /** Cambia filtro de categoría */
  seleccionarCategoria(ev: CustomEvent) {
    this._categoria$.next((ev.detail as any).value || null);
  }

  /** Cambia filtro de prioridad */
  seleccionarPrioridad(ev: CustomEvent) {
    this._prioridad$.next((ev.detail as any).value || null);
  }

  /** Cambia filtro de estado */
  seleccionarEstado(ev: CustomEvent) {
    this._estado$.next((ev.detail as any).value || null);
  }

  /** Reordena ítems tras arrastrar/soltar */
  reordenar(ev: CustomEvent) {
    const from = (ev as any).detail.from as number;
    const to = (ev as any).detail.to as number;
    this.tareasSrv.reordenar(from, to);
    (ev as any).detail.complete();
  }

  /** Cambia entre vista de lista y de calendario */
  cambiarVista(ev: CustomEvent) {
    const value = (ev.detail as any).value as 'lista' | 'calendario';
    this.vista = value;
  }

  /** Cambia la fecha activa de la vista calendario */
  fechaCambio(ev: CustomEvent) {
    const valor = (ev.detail as any).value as string; // ISO
    if (valor) {
      const soloFecha = valor.slice(0, 10);
      this._fechaSeleccion$.next(soloFecha);
    }
  }

  /** Reprograma fecha/hora de una tarea desde la vista calendario */
  reprogramar(tarea: Tarea, ev: CustomEvent) {
    const nuevaFechaHora = (ev.detail as any).value as string;
    if (nuevaFechaHora) {
      this.tareasSrv.reprogramar(tarea.id, nuevaFechaHora);
    }
  }

  /** Alterna preferencia de texto grande */
  alternarTextoGrande() {
    const actual = document.body.classList.contains('texto-grande');
    this.prefs.actualizar({ textoGrande: !actual });
  }

  /** Alterna preferencia de alto contraste */
  alternarAltoContraste() {
    const actual = document.body.classList.contains('alto-contraste');
    this.prefs.actualizar({ altoContraste: !actual });
  }

  /** Exporta todas las tareas a un archivo JSON descargable */
  exportarJSON() {
    const data = this.tareasSrv.exportarJSON();
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tareas-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Abre el selector de archivo oculto para importar */
  abrirImportar() {
    const input = document.querySelector('input[type="file"][accept="application/json"]') as HTMLInputElement | null;
    input?.click();
  }

  /** Lee un archivo .json y lo importa al servicio de tareas */
  importarDesdeArchivo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const texto = String(reader.result);
        this.tareasSrv.importarJSON(texto, false);
      } catch (e) {
        console.error('Error al importar', e);
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

}
