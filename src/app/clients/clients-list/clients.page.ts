import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonAvatar, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemOptions, IonItemOption, IonItemSliding, IonLabel, IonList, IonSearchbar, IonThumbnail, IonTitle, IonToolbar, ToastController, AlertController } from '@ionic/angular/standalone';
import { ClientService } from '../../services/client.service';
import { addIcons } from 'ionicons';
import { addCircle, trash } from 'ionicons/icons';

addIcons({ addCircle, trash });

@Component({
  selector: 'app-clients',
  standalone: true,
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonLabel, IonThumbnail, IonAvatar, IonFab, IonFabButton, IonIcon, IonButtons, IonButton, IonSearchbar],
})
export default class ClientsPage {
  // Texto de búsqueda (ion-searchbar)
  q = signal('');
  // Lista derivada de clientes, filtrada por nombre
  items = computed(() => {
    const query = this.q().trim().toLowerCase();
    return this.service.list().filter(c => c.name.toLowerCase().includes(query));
  });

  // Inyección de servicios: dominio, navegación y componentes UI
  constructor(
    private service: ClientService,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController,
  ) {
      addIcons({addCircle,trash});}

  /** Actualiza la consulta al escribir en el buscador */
  onSearch(ev: any) { this.q.set(ev.detail.value || ''); }

  /** Confirma y elimina un cliente, mostrando un toast al finalizar */
  async remove(id: string) {
    const a = await this.alert.create({
      header: 'Confirmar',
      message: '¿Eliminar este cliente?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: async () => {
          this.service.delete(id);
          const t = await this.toast.create({ message: 'Cliente eliminado', duration: 1500, position: 'bottom' });
          t.present();
        }},
      ],
    });
    await a.present();
  }
}
