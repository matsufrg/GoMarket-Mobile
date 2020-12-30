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

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageExists = await AsyncStorage.getItem(
        '@GoMarketPlaceProducts',
      );

      if (storageExists) {
        setProducts(JSON.parse(storageExists));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.findIndex(prod => prod.id === product.id);

      if (productExists === -1) {
        setProducts(state => [...state, { ...product, quantity: 1 }]);
      } else {
        const productsList = [...products];
        productsList[productExists].quantity += 1;
        setProducts(productsList);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlaceProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(
        (product: Product) => product.id === id,
      );
      const productsList = [...products];

      if (productIndex !== -1) {
        productsList[productIndex].quantity += 1;
        setProducts(productsList);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlaceProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(
        (product: Product) => product.id === id,
      );
      const productsList = [...products];

      if (productIndex !== -1) {
        if (productsList[productIndex].quantity === 1) {
          productsList.splice(productIndex, 1);
        } else {
          productsList[productIndex].quantity -= 1;
        }
      }

      setProducts(productsList);

      await AsyncStorage.setItem(
        '@GoMarketPlaceProducts',
        JSON.stringify(products),
      );
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
