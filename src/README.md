# 🔮 Previsões Místicas para 2026

Aplicação web para análise quiromântica e previsões personalizadas baseadas em dados do usuário.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Pagamentos**: Stripe
- **UI**: shadcn/ui + Tailwind CSS

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta no Stripe (modo Live/Produção)

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon_aqui

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_publica_aqui
```

### 2. Configurar Secrets no Supabase

1. Acesse: https://app.supabase.com
2. Vá em **Edge Functions** → **Settings** → **Secrets**
3. Adicione:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_live_sua_chave_secreta_aqui` (obtenha em: https://dashboard.stripe.com/apikeys)

### 3. Deploy das Edge Functions

As Edge Functions estão nos arquivos:
- `CODIGO_FUNCAO_1_get-product-price.txt`
- `CODIGO_FUNCAO_2_create-checkout-session.txt`
- `CODIGO_FUNCAO_3_verify-payment.txt`

Faça o deploy via Dashboard do Supabase ou CLI.

## 🏃 Executar

```bash
npm install
npm run dev
```

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes React
├── pages/          # Páginas da aplicação
├── utils/          # Utilitários e helpers
├── integrations/   # Integrações (Supabase)
└── types/          # Tipos TypeScript
```

## 🔒 Segurança

- ✅ Chaves secretas nunca são expostas no código
- ✅ Variáveis de ambiente protegidas via `.gitignore`
- ✅ Secrets configurados no Supabase Dashboard
- ✅ Validação de pagamento antes de exibir resultados

## 📚 Documentação Adicional

- `STRIPE_SETUP.md` - Configuração completa do Stripe
- `SUPABASE_SETUP.md` - Configuração do Supabase
- `ATUALIZAR_SECRET_SUPABASE.md` - Como atualizar secrets

## 📝 Licença

Proprietário - Todos os direitos reservados

