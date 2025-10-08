import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Order, DeliveryMethod } from '../types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  addToCart: (productId: string, quantity: number, uom: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = async (productId: string, quantity: number, uom: string): Promise<boolean> => {
    const newItem: CartItem = { productId, quantity, uom };
    setItems(prev => [...prev, newItem]);
    return true;
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    setItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
    return true;
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    setItems(prev => prev.filter(item => item.productId !== productId));
    return true;
  };

  const clearCart = async (): Promise<boolean> => {
    setItems([]);
    return true;
  };

  const value = {
    items,
    loading,
    error,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};