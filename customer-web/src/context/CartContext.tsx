import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menu_item_id: number) => void;
  updateQuantity: (menu_item_id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.menu_item_id === item.menu_item_id);
      if (existing) {
        return prev.map(i =>
          i.menu_item_id === item.menu_item_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (menu_item_id: number) => {
    setCart(prev => prev.filter(i => i.menu_item_id !== menu_item_id));
  };

  const updateQuantity = (menu_item_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menu_item_id);
      return;
    }
    setCart(prev => prev.map(i => i.menu_item_id === menu_item_id ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}