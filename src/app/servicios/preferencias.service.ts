import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

/** Clave para persistir preferencias de accesibilidad en Storage */
const CLAVE_PREFS = 'preferencias_ui';

/** Preferencias de accesibilidad de la UI */
export interface PreferenciasUI {
  textoGrande: boolean;
  altoContraste: boolean;
}

/** Valores por defecto (estado inicial) */
const DEFAULT_PREFS: PreferenciasUI = {
  textoGrande: false,
  altoContraste: false,
};

@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  private _prefs$ = new BehaviorSubject<PreferenciasUI>(DEFAULT_PREFS);
  readonly prefs$ = this._prefs$.asObservable();
  private init = false;

  private storage = inject(Storage);

  constructor() { this.iniciar(); }

  private async iniciar() {
    if (this.init) return;
    await this.storage.create();
    const guardado = (await this.storage.get(CLAVE_PREFS)) as PreferenciasUI | null;
    if (guardado) this._prefs$.next(guardado);
    this.init = true;
    this.aplicarClases();
  }

  /** Guarda las preferencias actuales en Storage */
  private async persistir() {
    await this.storage.set(CLAVE_PREFS, this._prefs$.value);
  }

  /** Actualiza parcialmente y aplica clases CSS en el body */
  actualizar(p: Partial<PreferenciasUI>) {
    const nuevo = { ...this._prefs$.value, ...p };
    this._prefs$.next(nuevo);
    this.persistir();
    this.aplicarClases();
  }

  /** Sincroniza clases CSS del body con las preferencias actuales */
  private aplicarClases() {
    const body = document.body;
    const { textoGrande, altoContraste } = this._prefs$.value;
    body.classList.toggle('texto-grande', !!textoGrande);
    body.classList.toggle('alto-contraste', !!altoContraste);
  }
}
