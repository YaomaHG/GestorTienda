import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar, IonToast } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

/**
 * Página de Registro
 * - Crea un usuario y guarda datos de la tienda (nombre + URL imagen).
 * - Tras registro exitoso, inicia sesión automáticamente y redirige a /home.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonToast, IonNote],
})
export default class RegisterPage {
  toastOpen = false;
  toastMsg = '';

  // Controles del formulario de registro
  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    storeName: ['', [Validators.required, Validators.minLength(2)]],
    storeImageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\//i)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) {
      return this.showToast('Completa el formulario correctamente');
    }
    const res = this.auth.register(this.form.getRawValue());
    if (!res.ok) return this.showToast(res.message || 'Error al registrar');
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  private showToast(message: string) {
    this.toastMsg = message;
    this.toastOpen = true;
  }
}
