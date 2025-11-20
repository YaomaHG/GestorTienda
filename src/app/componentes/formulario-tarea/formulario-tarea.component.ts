import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Categoria, Estado, Prioridad, Tarea } from '../../modelos/tarea';
import { TareasService } from '../../servicios/tareas.service';

@Component({
  selector: 'app-formulario-tarea',
  templateUrl: './formulario-tarea.component.html',
  styleUrls: ['./formulario-tarea.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class FormularioTareaComponent {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private tareasSrv = inject(TareasService);
  @Input() tarea?: Tarea;

  Categoria = Categoria;
  Prioridad = Prioridad;
  Estado = Estado;

  /**
   * Formulario reactivo con validaciones básicas.
   * - fechaHora y recordatorio usan formato ISO (string) compatible con ion-datetime.
   */
  formulario = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    fechaHora: [''], // ISO string
    prioridad: [Prioridad.Media, Validators.required],
    estado: [Estado.Inicial, Validators.required],
    categoria: [Categoria.Personal, Validators.required],
    notas: [''],
    recordatorio: [''],
  });

  // (Las inyecciones se declaran antes del uso del form group)

  /** Pre-carga valores si se está editando una tarea existente */
  ionViewWillEnter() {
    if (this.tarea) {
      const { titulo, descripcion, fechaHora, prioridad, estado, categoria, notas, recordatorio } = this.tarea;
      this.formulario.patchValue({ titulo, descripcion, fechaHora, prioridad, estado, categoria, notas, recordatorio });
    }
  }

  /** Cierra el modal devolviendo datos opcionales */
  cerrar(datos?: any) {
    this.modalCtrl.dismiss(datos);
  }

  /** Crea o actualiza la tarea según corresponda */
  guardar() {
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    if (this.tarea) {
      const cambios = {
        titulo: valores.titulo || undefined,
        descripcion: valores.descripcion || undefined,
        fechaHora: valores.fechaHora || undefined,
        prioridad: valores.prioridad || undefined,
        estado: valores.estado || undefined,
        categoria: valores.categoria || undefined,
        notas: valores.notas || undefined,
        recordatorio: valores.recordatorio || undefined,
      };
      const actualizado = this.tareasSrv.actualizar(this.tarea.id, cambios);
      this.cerrar({ accion: 'actualizado', id: actualizado?.id });
    } else {
      const creada = this.tareasSrv.agregar({
        titulo: valores.titulo!,
        descripcion: valores.descripcion || undefined,
        fechaHora: valores.fechaHora || undefined,
        prioridad: valores.prioridad!,
        estado: valores.estado!,
        categoria: valores.categoria!,
        notas: valores.notas || undefined,
        recordatorio: valores.recordatorio || undefined,
      });
      this.cerrar({ accion: 'creado', id: creada.id });
    }
  }
}
