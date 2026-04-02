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
  tags?: string[];
}

// ProductService is responsible for fetching, searching, and normalizing product data from Supabase.
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private supabase: SupabaseService) { }

  /* Fetches all products from the 'Jaw Products' table in Supabase */
  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from('Jaw Products')
      .select('*');

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    // Normalize each row to a Product object
    const rows = (data ?? []) as Array<Partial<Product>>;
    return rows.map((row, index) => this.mapRowToProduct(row, index));
  }

  /* Fetches a single product by id from Supabase */
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabase.client
      .from('Jaw Products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    // Normalize the single row to a Product object
    return this.mapRowToProduct(data as Partial<Product>, id);
  }

  /* Searches for products in Supabase matching the query in title, category, or brand.
    Returns a list of normalized Product objects.
    If query is empty, returns all products.
   */
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

    // Normalize each row to a Product object
    const rows = (data ?? []) as Array<Partial<Product>>;
    return rows.map((row, index) => this.mapRowToProduct(row, index));
  }

  /* Converts a raw row from Supabase to a strongly typed Product object.
      Ensures all fields are present and tags are normalized */
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
      tags: this.parseTags(row.tags ?? (row as any).Tags),
    };
  }

  /* Normalizes the tags field to always be a lowercase string array containing only allowed tags.
    Accepts either an array or a comma-separated string from Supabase.
    Only 'new', 'popular', and 'sale' are allowed as tags. */
  private parseTags(tagsValue: unknown): string[] {
    // If tags is already an array, normalize and filter
    if (Array.isArray(tagsValue)) {
      return tagsValue
        .map(tag => String(tag).trim().toLowerCase())
        .filter(tag => ['new', 'popular', 'sale'].includes(tag));
    }

    // If tags is a string (e.g. "new" or "new, popular"), split and normalize
    if (typeof tagsValue === 'string' && tagsValue.trim()) {
      return tagsValue
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => ['new', 'popular', 'sale'].includes(tag));
    }

    // If tags is null, undefined, or anything else, return an empty array
    return [];
  }
}
