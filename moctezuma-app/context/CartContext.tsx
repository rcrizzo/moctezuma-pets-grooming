// Archivo: context/CartContext.tsx
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Función para agregar productos reales
  const addToCart = (producto: any, qty: number, precioReal: number) => {
    setCartItems(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        // Si ya está en el carrito, solo sumamos la cantidad
        return prev.map(item => item.id === producto.id ? { ...item, qty: item.qty + qty } : item);
      }
      // Si es nuevo, lo agregamos a la lista
      return [...prev, { id: producto.id, nombre: producto.nombre, precioVenta: precioReal, qty }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => setCartItems(prev => prev.filter(item => item.id !== id));
  
  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.precioVenta * item.qty), 0);
  const total = subtotal;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeItem, clearCart, subtotal, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);