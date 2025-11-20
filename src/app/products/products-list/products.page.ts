import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemSliding, IonItemOption, IonItemOptions, IonLabel, IonList, IonSearchbar, IonThumbnail, IonTitle, IonToolbar, ToastController, AlertController } from '@ionic/angular/standalone';
import { ProductService } from '../../services/product.service';
import { addIcons } from 'ionicons';
import { addCircle, create, trash } from 'ionicons/icons';

addIcons({ addCircle, create, trash });

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonThumbnail, IonAvatar, IonFab, IonFabButton, IonIcon, IonButtons, IonButton, IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip],
})
export default class ProductsPage {
  // Texto de búsqueda introducido en el ion-searchbar
  q = signal('');
  // Lista derivada y filtrada por nombre; se reactualiza al cambiar q() o el store
  products = computed(() => {
    const query = this.q().trim().toLowerCase();
    return this.productService.list().filter(p => p.name.toLowerCase().includes(query));
  });

  // Servicios inyectados: dominio, navegación, UI (toast/alert)
  constructor(
    private productService: ProductService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
  ) {
      addIcons({addCircle,trash});}

  /** Actualiza la consulta al escribir en el buscador (ev.detail.value) */
  onSearch(ev: any) {
    this.q.set(ev.detail.value || '');
  }

  /** Pide confirmación y elimina el producto; muestra un toast corto */
  async remove(id: string) {
    const a = await this.alert.create({
      header: 'Confirmar',
      message: '¿Eliminar este producto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: async () => {
          this.productService.delete(id);
          const t = await this.toast.create({ message: 'Producto eliminado', duration: 1500, position: 'bottom' });
          t.present();
        }},
      ],
    });
    await a.present();
  }
}
