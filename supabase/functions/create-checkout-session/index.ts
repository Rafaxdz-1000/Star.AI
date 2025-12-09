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
    const { formDataId, email, priceId, successUrl, cancelUrl } = await req.json();

    if (!formDataId || !email || !priceId) {
      throw new Error('formDataId, email e priceId são obrigatórios');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    // Criar sessão de checkout na Stripe
    const checkoutResponse = await fetch(
      'https://api.stripe.com/v1/checkout/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'payment_method_types[]': 'card',
          'line_items[0][price]': priceId,
          'line_items[0][quantity]': '1',
          'customer_email': email,
          'success_url': successUrl || `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/resultado?session_id={CHECKOUT_SESSION_ID}`,
          'cancel_url': cancelUrl || `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/pagamento?canceled=true`,
          'metadata[form_data_id]': formDataId,
          'metadata[email]': email,
        }).toString(),
      }
    );

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.json();
      throw new Error(error.message || 'Erro ao criar sessão de checkout');
    }

    const session = await checkoutResponse.json();

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
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

