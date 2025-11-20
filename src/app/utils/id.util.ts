/**
 * Genera un identificador único tipo UUID v4.
 * - Intenta usar `crypto.randomUUID()` si el navegador lo soporta.
 * - Si no, usa un fallback determinístico basado en Math.random (solo para demo local).
 */
export function genId(): string {
  const g = (globalThis as any).crypto?.randomUUID?.();
  if (g) return g;
  // Fallback simple UUID v4-like
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
