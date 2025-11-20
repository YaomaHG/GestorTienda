# AdminTareas

Aplicación Ionic/Angular para gestión de tareas con categorías, prioridades, estados, calendario, recordatorios y respaldo.

## Funcionalidades
- Lista de tareas con búsqueda, filtros (categoría, prioridad, estado) y reordenamiento por arrastrar/soltar.
- Crear/editar tareas en un modal (título, descripción, fecha/hora, prioridad, estado, categoría, notas, recordatorio).
- Vista Calendario (por día) y reprogramación rápida de hora.
- Persistencia local (Ionic Storage) y respaldo/restauración (exportar/importar JSON).
- Notificaciones locales (Capacitor Local Notifications) para recordatorios.
- Accesibilidad: texto grande y alto contraste con preferencia persistida.

## Requisitos
- Node.js 18+ recomendado.
- Ionic Angular 8 / Angular 20 (ya incluidos en `package.json`).

## Instalación
1. Instalar dependencias:
   
   En PowerShell puede fallar `npm` por políticas de ejecución. Si ocurre, use `cmd`:
   
   ```powershell
   cmd /c npm install
   ```

2. (Ya instalado por el proyecto) Ionic Storage y Capacitor Preferences:
   ```powershell
   cmd /c npm install @ionic/storage-angular @capacitor/preferences
   ```

3. (Opcional) Notificaciones locales:
   ```powershell
   cmd /c npm install @capacitor/local-notifications
   ```

4. (Opcional nativo) Sincronizar Capacitor para iOS/Android:
   ```powershell
   cmd /c npx cap sync
   ```

## Ejecutar en desarrollo
```powershell
cmd /c npm start
```
Abrir http://localhost:4200/ en el navegador.

## Uso
- Botón + para crear tareas.
- Desliza un ítem para editar/eliminar.
- Reordenar: icono de arrastrar al inicio del ítem.
- Segmento Lista/Calendario para cambiar vista.
- FAB de accesibilidad (abajo izquierda) para texto grande/alto contraste.
- Botones Exportar/Importar para respaldo/restauración.

## Construir
```powershell
cmd /c npm run build
```

## Notificaciones
- En web, las notificaciones pueden no mostrarse (depende del navegador). En dispositivos nativos requieren permisos.
- En producción nativa: recuerda ejecutar `npx cap sync` tras instalar el plugin.

## Estructura destacada
- `src/app/modelos/tarea.ts`: tipos y enums (Categoria, Prioridad, Estado, Tarea).
- `src/app/servicios/tareas.service.ts`: CRUD, filtros, reordenar, persistencia, export/import, integración con notificaciones.
- `src/app/servicios/notificaciones.service.ts`: manejo de recordatorios.
- `src/app/servicios/preferencias.service.ts`: preferencias de accesibilidad.
- `src/app/componentes/formulario-tarea/*`: modal de creación/edición.
- `src/app/home/*`: pantalla principal con lista y calendario.
- `src/global.scss`: estilos globales y clases de accesibilidad.

## Próximos pasos
- Añadir pruebas unitarias a servicios y componentes.
- Toastr/Toast en operaciones (crear/editar/eliminar/importar) y manejo de errores más visible.
- Estadísticas y gráficos (progreso por estado/prioridad/categoría).
