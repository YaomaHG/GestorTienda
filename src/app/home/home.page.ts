import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonItem, IonLabel, IonAvatar, IonList } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

/**
 * Página de inicio: muestra datos de la tienda y sirve de landing tras login.
 * - Usa `user()` desde AuthService para pintar avatar y nombre.
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonItem, IonLabel, IonAvatar, IonList],
})
export class HomePage {
  // Usuario actual (tienda) para mostrar saludo/información
  user = computed(() => this.auth.currentUser());
  fallbackUrl = 'https://cdn.jsdelivr.net/gh/ionic-team/ionicons@7.0.0/src/svg/storefront.svg';

  constructor(private auth: AuthService) {}

  /** Fallback de imagen cuando la URL remota falla. */
  onStoreImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src !== this.fallbackUrl) img.src = this.fallbackUrl;
  }
}
