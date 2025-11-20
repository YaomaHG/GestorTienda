import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar, IonToast } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

/**
 * Página de Login
 * - Formulario reactivo con validaciones mínimas.
 * - En `ngOnInit` redirige a /home si ya hay sesión.
 * - `submit()` intenta autenticar y navega a /home en éxito.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonToast, IonNote],
})
export default class LoginPage implements OnInit {
  toastOpen = false;
  toastMsg = '';

  // Controles del formulario (username/password)
  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Si ya hay sesión activa, evitar mostrar login
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  submit() {
    // Validaciones de formulario en front
    if (this.form.invalid) {
      this.showToast('Completa el formulario correctamente');
      return;
    }
    const { username, password } = this.form.getRawValue();
    const res = this.auth.login(username, password);
    if (!res.ok) return this.showToast(res.message || 'Error de autenticación');
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  private showToast(message: string) {
    this.toastMsg = message;
    this.toastOpen = true;
  }
}
