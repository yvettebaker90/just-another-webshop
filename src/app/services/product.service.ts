import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.services';

export interface Product {
  id: number;
  category: string;
  title: string;
  price: number;
  image: string;
  image_1?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private supabase: SupabaseService) {}

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from('Jaw Products')
      .select('*');
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data as Product[];
  }
}
