import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Order, DeliveryMethod, Branch, ShipTo } from '../types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  selectedBranch: Branch | null;
  selectedShipTo: ShipTo | null;
  itemsWithPrice: any[];
  addToCart: (productId: string, quantity: number, uom: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  setSelectedBranch: (branch: Branch | null) => void;
  setSelectedShipTo: (shipTo: ShipTo | null) => void;
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
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedShipTo, setSelectedShipTo] = useState<ShipTo | null>(null);

  // Load state from local storage on mount
  useEffect(() => {
    const savedBranch = localStorage.getItem('abc_selectedBranch');
    const savedShipTo = localStorage.getItem('abc_selectedShipTo');
    const savedItems = localStorage.getItem('abc_cartItems');

    if (savedBranch) setSelectedBranch(JSON.parse(savedBranch));
    if (savedShipTo) setSelectedShipTo(JSON.parse(savedShipTo));
    if (savedItems) setItems(JSON.parse(savedItems));
  }, []);

  // Save state updates
  useEffect(() => {
    if (selectedBranch) localStorage.setItem('abc_selectedBranch', JSON.stringify(selectedBranch));
    else localStorage.removeItem('abc_selectedBranch');
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedShipTo) localStorage.setItem('abc_selectedShipTo', JSON.stringify(selectedShipTo));
    else localStorage.removeItem('abc_selectedShipTo');
  }, [selectedShipTo]);

  useEffect(() => {
    localStorage.setItem('abc_cartItems', JSON.stringify(items));
  }, [items]);

  const addToCart = async (productId: string, quantity: number, uom: string): Promise<boolean> => {
    const newItem: CartItem = { productId, quantity, uom };
    setItems(prev => {
      // Check if item already exists
      const existing = prev.find(i => i.productId === productId && i.uom === uom);
      if (existing) {
        return prev.map(i => i.productId === productId && i.uom === uom
          ? { ...i, quantity: i.quantity + quantity }
          : i
        );
      }
      return [...prev, newItem];
    });
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
    total: 0, // In a real app involving pricing, this would be calculated from itemsWithPrice
    selectedBranch,
    selectedShipTo,
    itemsWithPrice: [], // Placeholder for priced items
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setSelectedBranch,
    setSelectedShipTo
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};