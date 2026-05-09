import { create } from 'zustand';

export interface User {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AppState {
  user: User | null;
  authLoaded: boolean;
  setUser: (user: User | null) => void;
  setAuthLoaded: (loaded: boolean) => void;
  
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  authLoaded: false,
  setUser: (user) => set({ user }),
  setAuthLoaded: (loaded) => set({ authLoaded: loaded }),

  cart: [],
  addToCart: (item) => set((state) => {
    const existing = state.cart.find((c) => c.id === item.id);
    if (existing) {
      return { cart: state.cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + item.quantity } : c) };
    }
    return { cart: [...state.cart, item] };
  }),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(c => c.id !== id)
  })),
  updateQuantity: (id, qty) => set((state) => ({
    cart: state.cart.map(c => c.id === id ? { ...c, quantity: qty } : c).filter(c => c.quantity > 0)
  })),
  clearCart: () => set({ cart: [] }),
}));
