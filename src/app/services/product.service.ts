import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.services';

export interface Product {
  id: number;
  category: string;
  title: string;
  price: number;
  image: string;
  image_1?: string;
  brand: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private supabase: SupabaseService) { }

  /* Search products server-side (from Supabase)
    Searches in: title, brand, category */
  async searchProducts(searchQuery: string): Promise<Product[]> {
    try {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return this.getProducts();
      }

      // Direct search (searchbar) against Supabase with query on title, brand, category
      const { data, error } = await this.supabase.client
        .from('Jaw Products')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);

      if (error) {
        throw new Error(`Error searching products: ${error.message}`);
      }

      const products = (data ?? []) as Array<Partial<Product>>;
      return products.map((row, index) => this.mapRowToProduct(row, index));
    } catch (error) {
      console.error('ProductService.searchProducts failed:', error);
      throw error;
    }
  }

  /* Fetch all products (no search) */
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('Jaw Products')
        .select('*');

      if (error) {
        throw new Error(`Error fetching products: ${error.message}`);
      }

      const rows = (data ?? []) as Array<Partial<Product>>;
      return rows.map((row, index) => this.mapRowToProduct(row, index));
    } catch (error) {
      console.error('ProductService.getProducts failed:', error);
      throw error;
    }
  }

  /* Map Supabase row to Product interface */
  private mapRowToProduct(row: Partial<Product>, index: number): Product {
    return {
      id: Number(row.id ?? index),
      category: String(row.category ?? ''),
      title: String(row.title ?? ''),
      price:
        typeof row.price === 'number' ? row.price : Number(row.price ?? 0),
      image: String(row.image ?? row.image_1 ?? ''),
      image_1: row.image_1 ? String(row.image_1) : undefined,
      brand: String(row.brand ?? 'Unknown Brand'),
    };
  }
}