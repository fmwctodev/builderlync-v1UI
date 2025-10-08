export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  isNew: boolean;
  products: Product[];
}