import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PRODUCT_CATALOG, type StaticProduct } from '@/data/products';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: StaticProduct;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const { toast } = useToast();
  
  // Get or create session ID
  useEffect(() => {
    let id = localStorage.getItem('cart-session-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('cart-session-id', id);
    }
    setSessionId(id);
  }, []);

  // Sync cart with server on mount and clear localStorage
  useEffect(() => {
    const syncCartWithServer = async () => {
      if (!sessionId) return;
      
      try {
        console.log('🔄 Syncing cart with server for sessionId:', sessionId);
        
        // Get cart from server
        const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
          headers: {
            'cart-session-id': sessionId,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const serverCartItems = await response.json();
          console.log('📥 Server cart items:', serverCartItems);
          
          // Convert server items to frontend format
          const itemsWithProducts = serverCartItems.map((serverItem: any) => {
            const product = PRODUCT_CATALOG.find(p => p.id === serverItem.productId);
            console.log('🔍 Converting server item:', {
              serverItemId: serverItem.id,
              productId: serverItem.productId,
              quantity: serverItem.quantity,
              foundProduct: product ? product.name : 'NOT FOUND'
            });
            return {
              id: serverItem.id, // Use server-generated ID
              productId: serverItem.productId,
              quantity: serverItem.quantity,
              product
            };
          });
          
          console.log('🎯 Setting cart items:', itemsWithProducts);
          console.log('🎯 Items count before setState:', itemsWithProducts.length);
          setItems(itemsWithProducts);
          
          // Force a re-render debug
          setTimeout(() => {
            console.log('🕐 Cart items after 100ms:', itemsWithProducts.length);
          }, 100);
          // Clear localStorage to prevent conflicts
          localStorage.removeItem('wepink_cart');
        } else {
          console.log('📭 No cart found on server, starting fresh');
          // Clear localStorage and start fresh
          localStorage.removeItem('wepink_cart');
          setItems([]);
        }
      } catch (error) {
        console.error('❌ Error syncing cart with server:', error);
        // Clear localStorage to prevent further conflicts
        localStorage.removeItem('wepink_cart');
        setItems([]);
      }
    };
    
    if (sessionId) {
      syncCartWithServer();
    }
  }, [sessionId]);

  // Save cart to localStorage whenever items change (for backup only)
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('wepink_cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('wepink_cart');
    }
  }, [items]);

  // Add to cart function - NOW SYNCS WITH SERVER
  const addToCart = async (productId: string, quantity = 1) => {
    const product = PRODUCT_CATALOG.find(p => p.id === productId);
    if (!product) return;
    
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    try {
      console.log('🛒 Adding to cart - sessionId:', sessionId, 'productId:', productId);
      
      // Call server API to add to cart
      const response = await apiRequest('POST', '/api/cart', {
        sessionId,
        productId,
        quantity
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }
      
      const serverCartItem = await response.json();
      console.log('✅ Server cart item:', serverCartItem);
      
      // Update local state
      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.productId === productId);
        
        if (existingItem) {
          // Update quantity of existing item
          return currentItems.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            id: serverCartItem.id,
            productId,
            quantity,
            product
          };
          return [...currentItems, newItem];
        }
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      toast({
        title: "Erro ao adicionar ao carrinho",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Remove from cart function - NOW SYNCS WITH SERVER
  const removeFromCart = async (itemId: string) => {
    if (!sessionId) return;
    
    try {
      console.log('🗑️ Removing from cart - itemId:', itemId);
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'cart-session-id': sessionId,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove from cart');
      }
      
      // Update local state
      setItems(currentItems => currentItems.filter(item => item.id !== itemId));
      
    } catch (error: any) {
      console.error('❌ Erro ao remover do carrinho:', error);
      toast({
        title: "Erro ao remover do carrinho",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Update quantity function - NOW SYNCS WITH SERVER
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    if (!sessionId) return;

    try {
      console.log('🔢 Updating quantity - itemId:', itemId, 'quantity:', quantity);
      
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'cart-session-id': sessionId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update quantity');
      }
      
      // Update local state
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar quantidade:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Clear cart function - NOW SYNCS WITH SERVER
  const clearCart = async () => {
    if (!sessionId) {
      setItems([]);
      return;
    }
    
    try {
      console.log('🧹 Clearing cart - sessionId:', sessionId);
      
      const response = await apiRequest('DELETE', '/api/cart/clear', {
        sessionId
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.warn('⚠️ Failed to clear cart on server:', error);
      }
      
      // Update local state regardless
      setItems([]);
      
    } catch (error: any) {
      console.error('❌ Erro ao limpar carrinho:', error);
      // Still clear local state even if server fails
      setItems([]);
    }
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.currentPrice) : 0;
    return sum + (price * item.quantity);
  }, 0);
  
  // Debug log computed values when items change
  useEffect(() => {
    console.log('🧮 Cart computed values:', {
      itemsLength: items.length,
      totalItems,
      totalPrice,
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        hasProduct: !!item.product,
        productName: item.product?.name
      }))
    });
  }, [items, totalItems, totalPrice]);

  const value: CartContextType = {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart: () => setIsOpen(!isOpen),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}