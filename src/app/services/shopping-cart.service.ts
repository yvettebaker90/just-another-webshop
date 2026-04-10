import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.services';

export interface CartItem {
    id: number;
    title: string;
    brand: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
}

@Injectable({ providedIn: 'root' })
export class ShoppingCartService {
    private readonly supabaseService = inject(SupabaseService);
    private readonly storageKey = 'jaw_cart_items';
    private readonly tableName = 'shopping_cart_items';

    private readonly cartItemsSignal = signal<CartItem[]>([]);

    readonly cartItems = this.cartItemsSignal.asReadonly();
    readonly totalItems = computed(() => this.cartItemsSignal().length);
    readonly totalQuantity = computed(() => this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0));

    constructor() {
        void this.initializeCart();
        this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
                this.clearLocalState();
                return;
            }
            this.loadFromLocalStorage();
            void this.syncWithSupabase(session.user.id);
        });
    }

    private async initializeCart(): Promise<void> {
        const userId = await this.getCurrentUserId();
        if (!userId) {
            this.clearLocalState();
            return;
        }
        this.loadFromLocalStorage();
        await this.syncWithSupabase(userId);
    }

    isInCart(productId: number): boolean {
        return this.cartItemsSignal().some((item) => item.id === productId);
    }

    async add(item: CartItem): Promise<void> {
        const existing = this.cartItemsSignal().find((i) => i.id === item.id);
        if (existing) {
            await this.updateQuantity(item.id, existing.quantity + item.quantity);
            return;
        }
        this.cartItemsSignal.update((items) => [...items, item]);
        this.saveToLocalStorage();
        const userId = await this.getCurrentUserId();
        if (userId) await this.upsertSupabaseRows(userId, [item]);
    }

    async remove(productId: number): Promise<void> {
        const item = this.cartItemsSignal().find((i) => i.id === productId);
        if (!item) return;
        this.cartItemsSignal.update((items) => items.filter((i) => i.id !== productId));
        this.saveToLocalStorage();
        const userId = await this.getCurrentUserId();
        if (userId) {
            await this.supabaseService.client
                .from(this.tableName)
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);
        }
    }

    async updateQuantity(productId: number, newQuantity: number): Promise<void> {
        const items = this.cartItemsSignal();
        const item = items.find((i) => i.id === productId);
        if (!item) return;
        if (newQuantity <= 0) {
            await this.remove(productId);
            return;
        }
        this.cartItemsSignal.update((items) =>
            items.map((i) => (i.id === productId ? { ...i, quantity: newQuantity } : i))
        );
        this.saveToLocalStorage();
        const userId = await this.getCurrentUserId();
        if (userId) {
            await this.upsertSupabaseRows(userId, [{ ...item, quantity: newQuantity }]);
        }
    }

    private async syncWithSupabase(userId?: string): Promise<void> {
        const resolvedUserId = userId ?? await this.getCurrentUserId();
        if (!resolvedUserId) {
            this.clearLocalState();
            return;
        }
        const remoteItems = await this.readSupabaseCart(resolvedUserId);
        const merged = this.mergeById(this.cartItemsSignal(), remoteItems);
        this.cartItemsSignal.set(merged);
        this.saveToLocalStorage();
        await this.upsertSupabaseRows(resolvedUserId, merged);
    }

    private async getCurrentUserId(): Promise<string | null> {
        const {
            data: { user },
            error,
        } = await this.supabaseService.client.auth.getUser();
        if (error || !user) {
            return null;
        }
        return user.id;
    }

    private async readSupabaseCart(userId: string): Promise<CartItem[]> {
        const { data, error } = await this.supabaseService.client
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId);
        if (error || !data) {
            console.warn('Could not read cart from Supabase:', error?.message ?? 'Unknown error');
            return [];
        }
        return (data as Record<string, unknown>[])
            .map((row) => this.mapSupabaseRowToCartItem(row))
            .filter((item): item is CartItem => item !== null);
    }

    private async upsertSupabaseRows(userId: string, items: CartItem[]): Promise<void> {
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
            quantity: item.quantity,
        }));
        const { error } = await this.supabaseService.client
            .from(this.tableName)
            .upsert(payload, { onConflict: 'user_id,product_id' });
        if (error) {
            console.warn('Could not upsert cart items to Supabase:', error.message);
        }
    }

    private mapSupabaseRowToCartItem(row: Record<string, unknown>): CartItem | null {
        const productIdRaw = row['product_id'] ?? row['id'];
        const id = typeof productIdRaw === 'number' ? productIdRaw : Number(productIdRaw ?? NaN);
        if (!Number.isFinite(id)) {
            return null;
        }
        const title = String(row['title'] ?? 'Untitled product');
        const brand = String(row['brand'] ?? 'Unknown brand');
        const priceRaw = row['price'] ?? 0;
        const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw ?? 0);
        const image = String(row['image'] ?? '');
        const category = String(row['category'] ?? '');
        const quantityRaw = row['quantity'] ?? 1;
        const quantity = typeof quantityRaw === 'number' ? quantityRaw : Number(quantityRaw ?? 1);
        return {
            id,
            title,
            brand,
            price: Number.isFinite(price) ? price : 0,
            image,
            category,
            quantity: Number.isFinite(quantity) ? quantity : 1,
        };
    }

    private mergeById(localItems: CartItem[], remoteItems: CartItem[]): CartItem[] {
        const mergedMap = new Map<number, CartItem>();
        for (const item of [...remoteItems, ...localItems]) {
            mergedMap.set(item.id, item);
        }
        return Array.from(mergedMap.values());
    }

    private loadFromLocalStorage(): void {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as unknown;
            if (!Array.isArray(parsed)) return;
            const items = parsed.filter((item) => typeof item.id === 'number' && typeof item.quantity === 'number');
            this.cartItemsSignal.set(items);
        } catch {
            this.cartItemsSignal.set([]);
        }
    }

    private saveToLocalStorage(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cartItemsSignal()));
    }

    private clearLocalState(): void {
        this.cartItemsSignal.set([]);
        localStorage.removeItem(this.storageKey);
    }
}
