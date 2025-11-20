/**
 * Formulario de Producto (crear/editar)
 * - Carga por id desde la ruta cuando existe.
 * - Valida campos requeridos y no negativos.
 * - Al guardar, crea/actualiza vía ProductService y navega al listado.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonLabel, IonInput, IonNote],
})
export default class ProductFormPage implements OnInit {
  id: string | null = null;

  // FormGroup tipado con validaciones mínimas por campo
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    stock: [0, [Validators.required, Validators.min(0)]],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\//i)]],
  });

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private service: ProductService, private router: Router, private toast: ToastController) {}

  ngOnInit(): void {
    // Si hay id en la ruta, precargar el producto para edición
    this.id = this.route.snapshot.params['id'] || null;
    if (this.id) {
      const p = this.service.getById(this.id);
      if (p) {
        this.form.patchValue(p);
      }
    }
  }

  /** Guarda el formulario: crea o actualiza según exista id */
  async save() {
    if (this.form.invalid) return;
    if (this.id) {
      this.service.update(this.id, this.form.getRawValue());
    } else {
      this.service.create(this.form.getRawValue());
    }
    const t = await this.toast.create({ message: 'Guardado', duration: 1200, position: 'bottom' });
    t.present();
    this.router.navigateByUrl('/products');
  }
}
