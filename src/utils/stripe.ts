/// <reference types="../vite-env.d.ts" />
import { loadStripe } from "@stripe/stripe-js";

// ID do produto na Stripe
export const STRIPE_PRODUCT_ID = "prod_TZcFhxhzwHMX3b";

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export const getStripe = () => stripePromise;

/**
 * Formata valor em centavos para formato brasileiro (R$ X,XX)
 */
export function formatPrice(amountInCents: number): string {
  const amountInReais = amountInCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInReais);
}

/**
 * Busca informações do produto e preço da Stripe
 */
export async function getProductPrice(): Promise<{
  price: number; // em centavos
  priceId: string;
  currency: string;
  anchorPrice: number; // preço de ancoragem (2x o preço)
} | null> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-product-price`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          productId: STRIPE_PRODUCT_ID,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar preço do produto");
    }

    const data = await response.json();
    return {
      price: data.price,
      priceId: data.priceId,
      currency: data.currency || "brl",
      anchorPrice: data.price * 2, // Sempre 2x o preço
    };
  } catch (error) {
    console.error("Erro ao buscar preço:", error);
    // Fallback para valores padrão caso a API falhe
    return {
      price: 990, // R$ 9,90 em centavos
      priceId: "", // Será preenchido pela Edge Function
      currency: "brl",
      anchorPrice: 1980, // R$ 19,80 em centavos
    };
  }
}

/**
 * Cria uma sessão de checkout da Stripe
 */
export async function createCheckoutSession(
  formDataId: string,
  email: string,
  priceId: string
): Promise<{ sessionId: string; url: string } | null> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          formDataId,
          email,
          priceId,
          successUrl: `${window.location.origin}/resultado?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pagamento?canceled=true`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
      console.error("Erro da Edge Function:", errorData);
      throw new Error(errorData.error || errorData.message || "Erro ao criar sessão de checkout");
    }

    const data = await response.json();
    return {
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (error) {
    console.error("Erro ao criar checkout session:", error);
    return null;
  }
}

/**
 * Verifica o status de pagamento de uma sessão
 */
export async function verifyPayment(sessionId: string): Promise<{
  paid: boolean;
  formDataId?: string;
  email?: string;
}> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao verificar pagamento");
    }

    const data = await response.json();
    return {
      paid: data.paid || false,
      formDataId: data.formDataId,
      email: data.email,
    };
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    return { paid: false };
  }
}

