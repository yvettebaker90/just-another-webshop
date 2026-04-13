import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.services';

// Interface representing a single item in the shopping cart
export interface CartItem {
    id: number;         // Product ID
    title: string;      // Product title
    brand: string;      // Product brand
    price: number;      // Product price
    image: string;      // Product image URL
    category: string;   // Product category
    quantity: number;   // Quantity in cart
}

@Injectable({ providedIn: 'root' })
export class ShoppingCartService {
    // Inject SupabaseService for database operations
    private readonly supabaseService = inject(SupabaseService);
    // Key for storing cart items in localStorage
    private readonly storageKey = 'jaw_cart_items';
    // Table name in Supabase
    private readonly tableName = 'shopping_cart_items';

    // Signal to hold the current cart items
    private readonly cartItemsSignal = signal<CartItem[]>([]);

    // Readonly signal for cart items (for use in components)
    readonly cartItems = this.cartItemsSignal.asReadonly();
    // Computed property for number of unique items in cart
    readonly totalItems = computed(() => this.cartItemsSignal().length);
    // Computed property for total quantity of all items
    readonly totalQuantity = computed(() => this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0));

    constructor() {
        // Initialize cart on service creation
        void this.initializeCart();
        // Listen for authentication state changes
        this.supabaseService.client.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
                // If user logs out, clear local state
                this.clearLocalState();
                return;
            }
            // On login, load from localStorage and sync with Supabase
            this.loadFromLocalStorage();
            void this.syncWithSupabase(session.user.id);
        });
    }

    // Initialize the cart for the current user
    private async initializeCart(): Promise<void> {
        const userId = await this.getCurrentUserId();
        if (!userId) {
            this.clearLocalState();
            return;
        }
        this.loadFromLocalStorage();
        await this.syncWithSupabase(userId);
    }

    // Check if a product is already in the cart
    isInCart(productId: number): boolean {
        return this.cartItemsSignal().some((item) => item.id === productId);
    }

    // Add a new item to the cart, or update quantity if it already exists
    async add(item: CartItem): Promise<void> {
        if (this.isInCart(item.id)) {
            await this.updateQuantity(item.id, this.cartItemsSignal().find(i => i.id === item.id)!.quantity + item.quantity);
            return;
        }
        this.cartItemsSignal.update((items) => [...items, item]);
        this.saveToLocalStorage();
        const userId = await this.getCurrentUserId();
        if (!userId) return;
        await this.upsertSupabaseRows(userId, [item]);
    }

    // Remove an item from the cart
    async remove(productId: number): Promise<void> {
        this.cartItemsSignal.update((items) => items.filter((item) => item.id !== productId));
        this.saveToLocalStorage();
        const userId = await this.getCurrentUserId();
        if (!userId) return;
        const { error } = await this.supabaseService.client
            .from(this.tableName)
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        if (error) {
            console.warn('Could not remove cart item from Supabase:', error.message);
        }
    }

    // Update the quantity of a specific item in the cart
    async updateQuantity(productId: number, newQuantity: number): Promise<void> {
        if (newQuantity <= 0) {
            await this.remove(productId);
            return;
        }
        this.cartItemsSignal.update((items) =>
            items.map((i) => (i.id === productId ? { ...i, quantity: newQuantity } : i))
        );
        this.saveToLocalStorage();
        const userId = await this.getCurrentUserId();
        if (!userId) return;
        const item = this.cartItemsSignal().find((i) => i.id === productId);
        if (item) {
            await this.upsertSupabaseRows(userId, [item]);
        }
    }

    // Synchronize local cart with Supabase (merge local and remote items)
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

    // Get the current logged-in user's ID from Supabase auth
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

    // Read all cart items for a user from Supabase
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

    // Upsert (insert or update) cart items in Supabase for a user
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
        const { error, data } = await this.supabaseService.client
            .from(this.tableName)
            .upsert(payload, { onConflict: 'user_id,product_id' });
        if (error) {
            console.error('Supabase error:', error.message, error.details);
        } else {
            console.log('Supabase upsert success:', data);
        }
    }

    // Map a Supabase row to a CartItem object
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

    // Merge local and remote cart items by product ID (remote takes precedence)
    private mergeById(localItems: CartItem[], remoteItems: CartItem[]): CartItem[] {
        const mergedMap = new Map<number, CartItem>();
        for (const item of [...remoteItems, ...localItems]) {
            mergedMap.set(item.id, item);
        }
        return Array.from(mergedMap.values());
    }

    // Load cart items from localStorage
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

    // Save current cart items to localStorage
    private saveToLocalStorage(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cartItemsSignal()));
    }

    // Clear cart state from both memory and localStorage
    private clearLocalState(): void {
        this.cartItemsSignal.set([]);
        localStorage.removeItem(this.storageKey);
    }
}
