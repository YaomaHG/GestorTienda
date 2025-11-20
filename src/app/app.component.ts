import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonMenuToggle } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { addIcons } from 'ionicons';
import { home, storefront, people, cart, barChart, logOut } from 'ionicons/icons';

addIcons({ home, storefront, people, cart, barChart, logOut });

/**
 * Shell principal de la app.
 * - Renderiza un `IonSplitPane` con menú lateral (avatar + nombre de tienda) y contenido principal.
 * - Ofrece navegación rápida y acción de `logout`.
 * - Gestiona imagen de tienda con fallback si la URL falla.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [CommonModule, IonApp, IonRouterOutlet, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonMenuToggle, RouterLink],
})
export class AppComponent {
  // Usuario actual (reactivo) para pintar datos de la tienda en el menú
  user = computed(() => this.auth.currentUser());
  fallbackUrl = 'https://cdn.jsdelivr.net/gh/ionic-team/ionicons@7.0.0/src/svg/storefront.svg';

  constructor(private auth: AuthService) {}

  /** Cierra sesión; la ruta ya redirige a login desde el ítem del menú. */
  logout() { this.auth.logout(); }

  /** Sustituye la imagen por un ícono cuando la URL remota falla. */
  onStoreImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src !== this.fallbackUrl) {
      img.src = this.fallbackUrl;
    }
  }
}
