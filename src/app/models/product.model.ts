/** Estructura de un producto almacenado en la app. */
export interface Product {
  id: string; // uuid
  name: string;
  description: string;
  stock: number;
  costPrice: number;
  salePrice: number;
  imageUrl: string;
}
