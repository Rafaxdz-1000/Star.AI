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
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error('sessionId é obrigatório');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    // Buscar sessão da Stripe
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!sessionResponse.ok) {
      throw new Error('Sessão não encontrada');
    }

    const session = await sessionResponse.json();

    // Verificar se o pagamento foi concluído
    const paid = session.payment_status === 'paid';
    const formDataId = session.metadata?.form_data_id;
    const email = session.metadata?.email || session.customer_email;

    // Se pago, atualizar o relatório no banco
    if (paid && formDataId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Verificar se já existe um relatório para este form_data_id
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('form_data_id', formDataId)
        .single();

      // Se não existe, criar um novo relatório marcado como pago
      if (!existingReport) {
        await supabase.from('reports').insert({
          form_data_id: formDataId,
          is_paid: true,
          summary: '', // Será preenchido depois
          destiny_number: 0, // Será calculado depois
          numerology_meaning: '', // Será preenchido depois
        });
      } else {
        // Atualizar relatório existente
        await supabase
          .from('reports')
          .update({ is_paid: true })
          .eq('form_data_id', formDataId);
      }
    }

    return new Response(
      JSON.stringify({
        paid,
        formDataId,
        email,
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

