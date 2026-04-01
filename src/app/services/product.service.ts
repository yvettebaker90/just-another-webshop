import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.services';

export interface Product {
  id: number;
  category: string;
  title: string;
  price: number;
  image: string;
  image_1?: string;
  description?: string;
  brand: string;
}

// ProductService handles fetching and searching products from Supabase
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private supabase: SupabaseService) { }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from('Jaw Products')
      .select('*');

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    const rows = (data ?? []) as Array<Partial<Product>>;
    return rows.map((row, index) => this.mapRowToProduct(row, index));
  }

  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabase.client
      .from('Jaw Products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapRowToProduct(data as Partial<Product>, id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return this.getProducts();
    }

    const { data, error } = await this.supabase.client
      .from('Jaw Products')
      .select('*')
      .or(`title.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`);

    if (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }

    const rows = (data ?? []) as Array<Partial<Product>>;
    return rows.map((row, index) => this.mapRowToProduct(row, index));
  }

  private mapRowToProduct(row: Partial<Product>, index: number): Product {
    return {
      id: Number(row.id ?? index),
      category: String(row.category ?? ''),
      title: String(row.title ?? ''),
      price: typeof row.price === 'number' ? row.price : Number(row.price ?? 0),
      image: String(row.image ?? row.image_1 ?? ''),
      image_1: row.image_1 ? String(row.image_1) : undefined,
      description: row.description ? String(row.description) : undefined,
      brand: String(row.brand ?? 'Unknown Brand'),
    };
  }
}
