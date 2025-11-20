/** Estructura de un cliente con datos básicos de contacto. */
export interface Client {
  id: string; // uuid
  name: string;
  address: string;
  phone: string;
  email: string;
  imageUrl: string;
}
