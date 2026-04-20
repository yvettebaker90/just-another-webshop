import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.services';

export type WishlistItem = {
  id: number;
  title: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  tags?: string[];
  discount_percentage?: number;
};

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly storageKey = 'jaw_wishlist_items';
  private readonly tableName = 'wishlist_items';
  private currentUserId: string | null | undefined = undefined;

  private readonly wishlistItemsSignal = signal<WishlistItem[]>([]);

  readonly wishlistItems = this.wishlistItemsSignal.asReadonly();
  readonly totalItems = computed(() => this.wishlistItemsSignal().length);

  constructor() {
    this.scheduleInitialization();

    this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.currentUserId = session?.user?.id ?? null;

      if (!this.currentUserId) {
        this.clearLocalState();
        return;
      }

      this.loadFromLocalStorage();
      this.scheduleSyncWithSupabase(this.currentUserId);
    });
  }

  private scheduleInitialization(): void {
    this.runWhenIdle(() => {
      void this.initializeWishlist();
    });
  }

  private scheduleSyncWithSupabase(userId: string): void {
    this.runWhenIdle(() => {
      void this.syncWithSupabase(userId);
    });
  }

  private async initializeWishlist(): Promise<void> {
    const userId = await this.getCurrentUserId();

    if (!userId) {
      this.clearLocalState();
      return;
    }

    this.loadFromLocalStorage();
    await this.syncWithSupabase(userId);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItemsSignal().some((item) => item.id === productId);
  }

  async toggle(item: WishlistItem): Promise<void> {
    if (this.isInWishlist(item.id)) {
      await this.remove(item.id);
      return;
    }

    await this.add(item);
  }

  async add(item: WishlistItem): Promise<void> {
    if (this.isInWishlist(item.id)) {
      return;
    }

    this.wishlistItemsSignal.update((items) => [...items, item]);
    this.saveToLocalStorage();

    const userId = await this.getCurrentUserId();
    if (!userId) {
      return;
    }

    await this.upsertSupabaseRows(userId, [item]);
  }

  async remove(productId: number): Promise<void> {
    this.wishlistItemsSignal.update((items) => items.filter((item) => item.id !== productId));
    this.saveToLocalStorage();

    const userId = await this.getCurrentUserId();
    if (!userId) {
      return;
    }

    const { error } = await this.supabaseService.client
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      // Keep local state as source of truth if remote persistence fails.
      console.warn('Could not remove wishlist item from Supabase:', error.message);
    }
  }

  private async syncWithSupabase(userId?: string): Promise<void> {
    const resolvedUserId = userId ?? await this.getCurrentUserId();
    if (!resolvedUserId) {
      this.clearLocalState();
      return;
    }

    const remoteItems = await this.readSupabaseWishlist(resolvedUserId);
    const merged = this.mergeById(this.wishlistItemsSignal(), remoteItems);

    this.wishlistItemsSignal.set(merged);
    this.saveToLocalStorage();

    await this.upsertSupabaseRows(resolvedUserId, merged);
  }

  private async getCurrentUserId(): Promise<string | null> {
    if (this.currentUserId !== undefined) {
      return this.currentUserId;
    }

    const {
      data: { session },
      error,
    } = await this.supabaseService.client.auth.getSession();

    if (error || !session?.user) {
      this.currentUserId = null;
      return null;
    }

    this.currentUserId = session.user.id;
    return this.currentUserId;
  }

  private async readSupabaseWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await this.supabaseService.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId);

    if (error || !data) {
      console.warn('Could not read wishlist from Supabase:', error?.message ?? 'Unknown error');
      return [];
    }

    return (data as Record<string, unknown>[])
      .map((row) => this.mapSupabaseRowToWishlistItem(row))
      .filter((item): item is WishlistItem => item !== null);
  }

  private async upsertSupabaseRows(userId: string, items: WishlistItem[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const payload = items.map((item) => ({
      user_id: userId,
      product_id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      image: item.image,
      category: item.category,
    }));

    const { error } = await this.supabaseService.client
      .from(this.tableName)
      .upsert(payload, { onConflict: 'user_id,product_id' });

    if (error) {
      // Keep local state as source of truth if remote persistence fails.
      console.warn('Could not upsert wishlist items to Supabase:', error.message);
    }
  }

  private mapSupabaseRowToWishlistItem(row: Record<string, unknown>): WishlistItem | null {
    const productIdRaw = row['product_id'] ?? row['id'];
    const id = typeof productIdRaw === 'number' ? productIdRaw : Number(productIdRaw ?? NaN);

    if (!Number.isFinite(id)) {
      return null;
    }

    const title = String(row['title'] ?? row['product_title'] ?? 'Untitled product');
    const brand = String(row['brand'] ?? 'Unknown brand');
    const priceRaw = row['price'] ?? 0;
    const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw ?? 0);
    const image = String(row['image'] ?? row['image_url'] ?? '');
    const category = String(row['category'] ?? '');

    return {
      id,
      title,
      brand,
      price: Number.isFinite(price) ? price : 0,
      image,
      category,
      tags: this.parseTags(row['tags'] ?? row['Tags']),
      discount_percentage: this.parseDiscountPercentage(row['discount_percentage']),
    };
  }

  private mergeById(localItems: WishlistItem[], remoteItems: WishlistItem[]): WishlistItem[] {
    const mergedMap = new Map<number, WishlistItem>();

    for (const item of [...remoteItems, ...localItems]) {
      mergedMap.set(item.id, item);
    }

    return Array.from(mergedMap.values());
  }

  private loadFromLocalStorage(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return;
      }

      const items = parsed
        .map((item) => this.mapLocalStorageEntry(item))
        .filter((item): item is WishlistItem => item !== null);

      this.wishlistItemsSignal.set(items);
    } catch {
      this.wishlistItemsSignal.set([]);
    }
  }

  private mapLocalStorageEntry(entry: unknown): WishlistItem | null {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const row = entry as Record<string, unknown>;
    const idRaw = row['id'];
    const id = typeof idRaw === 'number' ? idRaw : Number(idRaw ?? NaN);

    if (!Number.isFinite(id)) {
      return null;
    }

    const title = String(row['title'] ?? 'Untitled product');
    const brand = String(row['brand'] ?? 'Unknown brand');
    const priceRaw = row['price'] ?? 0;
    const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw ?? 0);
    const image = String(row['image'] ?? '');
    const category = String(row['category'] ?? '');

    return {
      id,
      title,
      brand,
      price: Number.isFinite(price) ? price : 0,
      image,
      category,
      tags: this.parseTags(row['tags'] ?? row['Tags']),
      discount_percentage: this.parseDiscountPercentage(row['discount_percentage']),
    };
  }

  private saveToLocalStorage(): void {
    const items = this.wishlistItemsSignal();

    if (items.length === 0) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private clearLocalState(): void {
    this.wishlistItemsSignal.set([]);
    localStorage.removeItem(this.storageKey);
  }

  private parseTags(tagsValue: unknown): string[] | undefined {
    if (Array.isArray(tagsValue)) {
      return tagsValue.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
    }

    if (typeof tagsValue === 'string' && tagsValue.trim()) {
      return tagsValue
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
    }

    return undefined;
  }

  private parseDiscountPercentage(value: unknown): number | undefined {
    const parsed = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return undefined;
    }

    return Math.min(parsed, 100);
  }

  private runWhenIdle(task: () => void): void {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => task(), { timeout: 1500 });
      return;
    }

    setTimeout(task, 250);
  }
}
