import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  async function loadProducts(): Promise<void> {
    const productsStored = await AsyncStorage.getItem(productKey);
    setProducts([...JSON.parse(productsStored || '')]);
  }

  const productKey = '@DesafioFundamentosReactNative:products';
  useEffect(() => {
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExistent = products.find(
        _product => _product.id === product.id,
      );

      if (productExistent)
        setProducts([
          ...products.map(prod =>
            prod.id !== product.id
              ? product
              : { ...product, quantity: prod.quantity + 1 },
          ),
        ]);
      else
        setProducts([
          ...products,
          { ...product, quantity: product.quantity + 1 },
        ]);

      await AsyncStorage.setItem(productKey, JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(prod =>
        prod.id !== id ? prod : { ...prod, quantity: prod.quantity + 1 },
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(productKey, JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(prod =>
        prod.id !== id ? prod : { ...prod, quantity: prod.quantity - 1 },
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(productKey, JSON.stringify(newProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
