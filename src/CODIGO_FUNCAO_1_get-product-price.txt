import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      throw new Error('productId é obrigatório');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    // Buscar produto e preços da Stripe
    const productResponse = await fetch(
      `https://api.stripe.com/v1/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!productResponse.ok) {
      throw new Error(`Erro ao buscar produto: ${productResponse.statusText}`);
    }

    const product = await productResponse.json();

    // Buscar preços do produto
    const pricesResponse = await fetch(
      `https://api.stripe.com/v1/prices?product=${productId}&active=true&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!pricesResponse.ok) {
      throw new Error(`Erro ao buscar preços: ${pricesResponse.statusText}`);
    }

    const pricesData = await pricesResponse.json();
    const price = pricesData.data[0];

    if (!price) {
      throw new Error('Nenhum preço ativo encontrado para este produto');
    }

    return new Response(
      JSON.stringify({
        price: price.unit_amount, // em centavos
        priceId: price.id,
        currency: price.currency,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

