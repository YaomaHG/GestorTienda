/**
 * Formulario de Cliente (crear/editar)
 * - Carga por id cuando procede y parchea valores.
 * - Valida nombre/teléfono/correo/URL de imagen.
 * - Al guardar, persiste y regresa al listado.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  templateUrl: './client-form.page.html',
  styleUrls: ['./client-form.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonLabel, IonInput, IonNote],
})
export default class ClientFormPage implements OnInit {
  id: string | null = null;

  // FormGroup con validaciones necesarias por campo
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
  phone: ['', [Validators.required]],
  email: ['', [Validators.required, Validators.email]],
    imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\//i)]],
  });

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private service: ClientService, private router: Router, private toast: ToastController) {}

  ngOnInit(): void {
    // Cargar el cliente si llega un id en la ruta
    this.id = this.route.snapshot.params['id'] || null;
    if (this.id) {
      const c = this.service.getById(this.id);
      if (c) {
        this.form.patchValue(c);
      }
    }
  }

  /** Guarda el formulario creando o actualizando en función del id */
  async save() {
    if (this.form.invalid) return;
    if (this.id) {
      this.service.update(this.id, this.form.getRawValue());
    } else {
      this.service.create(this.form.getRawValue());
    }
    const t = await this.toast.create({ message: 'Guardado', duration: 1200, position: 'bottom' });
    t.present();
    this.router.navigateByUrl('/clients');
  }
}
