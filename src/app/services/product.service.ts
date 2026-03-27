import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.services';

export interface Product {
  id: number;
  category: string;
  title: string;
  price: number;
  image: string;
  image_1?: string;
  brand?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private supabase: SupabaseService) {}

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from('Jaw Products')
      .select('*');

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    const rows = (data ?? []) as Array<Partial<Product>>;

    return rows.map((row, index) => ({
      id: Number(row.id ?? index),
      category: String(row.category ?? ''),
      title: String(row.title ?? ''),
      price: typeof row.price === 'number' ? row.price : Number(row.price ?? 0),
      image: String(row.image ?? row.image_1 ?? ''),
      image_1: row.image_1 ? String(row.image_1) : undefined,
      brand: row.brand ? String(row.brand) : undefined,
    }));
  }
}
