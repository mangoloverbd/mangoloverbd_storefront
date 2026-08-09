import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createEventId, trackMetaEvent } from "@/lib/meta";
import { trackMerchantSuiteEvent } from "@/lib/merchant-suite";
import { getStorefrontHandle } from "@/lib/config";

export interface CartItem {
    id: string;
    productId: number;
    variantId: string;
    title: string;
    price: string;
    image: string;
    size: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: { id: number; title: string; price: string; image: string; variantId: string }, size: string, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartStorageKey(): string {
    const handle = getStorefrontHandle() || "default";
    return `storefront-cart:${handle}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(getCartStorageKey());
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (e) {
            console.error('Failed to parse cart from localStorage', e);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
    }, [items]);

    const addToCart = useCallback((
        product: { id: number; title: string; price: string; image: string; variantId: string },
        size: string,
        quantity: number = 1
    ) => {
        const itemId = `${product.id}-${product.variantId}-${size}`;

        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === itemId);

            if (existingItem) {
                return prevItems.map(item =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        id: itemId,
                        productId: product.id,
                        variantId: product.variantId,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                        size,
                        quantity
                    }
                ];
            }
        });

        setIsOpen(true);
        trackMerchantSuiteEvent("cart");

        const value = Number(String(product.price).replace(/[^0-9.]/g, "")) || 0;
        const eventId = createEventId();
        trackMetaEvent({
          eventName: "AddToCart",
          eventId,
          capi: true,
          customData: {
            currency: "BDT",
            value,
            content_type: "product",
            content_ids: [String(product.variantId || product.id)],
            contents: [{ id: String(product.variantId || product.id), quantity, item_price: value }],
          },
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isOpen,
                setIsOpen,
                itemCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
