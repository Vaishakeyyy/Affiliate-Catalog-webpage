export interface Dress {
  id: string;
  orderNumber: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  sizes: string[];
  colors: string[];
  material: string;
  specifications: Record<string, string>;
  tags: string[];
  purchaseLink: string;
  createdAt: string;
}

export interface CatalogFilters {
  search: string;
  brand: string;
  category: string;
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'latest' | 'price-low' | 'price-high' | 'name-asc';
}

export interface AdminUser {
  email: string;
  isAuthenticated: boolean;
}
