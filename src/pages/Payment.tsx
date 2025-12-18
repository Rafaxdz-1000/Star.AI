import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Sparkles, Loader2, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveFormDataToSupabase } from "@/utils/saveToSupabase";
import { getProductPrice, formatPrice, createCheckoutSession } from "@/utils/stripe";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos em segundos
  const [price, setPrice] = useState<number | null>(null);
  const [anchorPrice, setAnchorPrice] = useState<number | null>(null);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  const formData = location.state?.formData;

  if (!formData) {
    navigate("/formulario");
    return null;
  }

  // Verificar se foi cancelado
  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o pagamento. Pode tentar novamente quando quiser.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  // Buscar preço do produto da Stripe
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const productInfo = await getProductPrice();
        if (productInfo) {
          setPrice(productInfo.price);
          setAnchorPrice(productInfo.anchorPrice);
          // Se não tem priceId, ainda permite continuar com valores padrão
          if (productInfo.priceId) {
            setPriceId(productInfo.priceId);
          } else {
            // Se não tem priceId, usa valores padrão mas permite continuar
            console.warn("Edge Function não disponível ou produto não encontrado. Usando valores padrão.");
            setPriceId("default"); // Placeholder para permitir continuar
          }
        } else {
          // Valores padrão se não conseguir buscar
          setPrice(990);
          setAnchorPrice(1980);
          setPriceId("default");
        }
      } catch (error) {
        console.error("Erro ao buscar preço:", error);
        // Valores padrão em caso de erro
        setPrice(990); // R$ 9,90
        setAnchorPrice(1980); // R$ 19,80
        setPriceId("default"); // Permite continuar mesmo sem Edge Function
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPrice();
  }, []);

  // Timer regressivo
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && value) {
      setEmailError("");
    }
  };

  const processPayment = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Por favor, informe seu email");
      toast({
        title: "Email obrigatório",
        description: "Precisamos do seu email para processar o pagamento",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Por favor, informe um email válido");
      toast({
        title: "Email inválido",
        description: "Verifique se o email está correto",
        variant: "destructive",
      });
      return;
    }

    // Se não tem priceId válido e não é o placeholder, avisar mas permitir continuar
    if (!priceId || priceId === "default") {
      // Se está usando valores padrão, avisar mas permitir continuar
      if (priceId === "default") {
        toast({
          title: "Modo de desenvolvimento",
          description: "Usando valores padrão. Configure as Edge Functions para usar preços reais da Stripe.",
          variant: "default",
        });
        // Continuar com valores padrão - não bloquear o fluxo
      } else {
        toast({
          title: "Erro de configuração",
          description: "Preço não disponível. Por favor, recarregue a página.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Salvar dados no Supabase primeiro
      const result = await saveFormDataToSupabase(formData, email);

      if (!result.success || !result.formDataId) {
        setIsProcessing(false);
        console.error("Erro detalhado ao salvar:", result.error);
        
        // Se for erro de RLS, dar instruções específicas
        if (result.error?.includes("row-level security") || result.error?.includes("RLS") || result.error?.includes("violates row-level security")) {
          toast({
            title: "Erro de permissão",
            description: "Execute o SQL em SQL_RAPIDO_COPIAR_COLAR.sql no Supabase SQL Editor.",
            variant: "destructive",
          });
          console.error("=== ERRO DE RLS ===");
          console.error("Execute este SQL no Supabase:");
          console.error("DROP POLICY IF EXISTS \"Anyone can insert form_data\" ON public.form_data;");
          console.error("CREATE POLICY \"insert_form_data_policy\" ON public.form_data FOR INSERT WITH CHECK (true);");
        } else {
          toast({
            title: "Erro ao salvar dados",
            description: result.error || "Não foi possível salvar seus dados. Tente novamente.",
            variant: "destructive",
          });
        }
        return;
      }

      // Sempre tentar criar checkout session da Stripe e redirecionar
      // A verificação de pagamento será feita quando voltar da Stripe (na página Result)
      
      if (!priceId || priceId === "default") {
        setIsProcessing(false);
        toast({
          title: "Configuração necessária",
          description: "Edge Functions não configuradas. Faça o deploy das funções e configure o priceId.",
          variant: "destructive",
        });
        console.error("priceId não disponível. Verifique se:");
        console.error("1. Edge Function 'get-product-price' está deployada");
        console.error("2. STRIPE_SECRET_KEY está configurado no Supabase");
        console.error("3. O produto prod_TZcFhxhzwHMX3b existe na Stripe");
        return;
      }

      // Criar sessão de checkout da Stripe
      const checkoutSession = await createCheckoutSession(
        result.formDataId,
        email,
        priceId
      );

      // Se não conseguiu criar checkout, mostrar erro
      if (!checkoutSession || !checkoutSession.url) {
        setIsProcessing(false);
        toast({
          title: "Erro ao criar checkout",
          description: "Não foi possível iniciar o processo de pagamento. Verifique se as Edge Functions estão deployadas.",
          variant: "destructive",
        });
        console.error("Erro ao criar checkout session. Verifique:");
        console.error("1. Edge Function 'create-checkout-session' está deployada?");
        console.error("2. STRIPE_SECRET_KEY configurado no Supabase?");
        console.error("3. VITE_STRIPE_PUBLISHABLE_KEY no .env?");
        return;
      }

      // Enviar evento para Google Tag Manager
      if (typeof window !== 'undefined') {
        const dataLayer = (window as any).dataLayer;
        if (dataLayer) {
          dataLayer.push({
            event: 'checkout_initiated',
            formDataId: result.formDataId,
            email: email,
            price: price,
          });
        }
      }

      // Redirecionar para o checkout da Stripe
      // Quando o usuário completar ou cancelar, será redirecionado de volta
      // A verificação de pagamento será feita na página Result
      window.location.href = checkoutSession.url;
    } catch (error) {
      setIsProcessing(false);
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen gradient-galaxy relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(25)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
            size={20}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {isProcessing ? (
            <Card className="p-8 md:p-12 text-center bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow">
              <div className="animate-float mb-6">
                <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Lendo seus caminhos para 2026...
              </h2>
              <p className="text-muted-foreground mb-6">
                Estamos analisando as linhas da sua mão e conectando com as energias
                do universo
              </p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </Card>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-accent/20 border border-accent/30">
                    <CreditCard className="w-12 h-12 text-accent" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Finalize sua Leitura Mística
                </h1>
                <p className="text-muted-foreground text-lg">
                  Estamos quase lá! Complete o pagamento para receber suas previsões
                  personalizadas
                </p>
              </div>

              <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow mb-6">
                {/* Timer de Urgência */}
                {timeLeft > 0 && (
                  <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-center gap-2 animate-pulse">
                    <Clock className="w-5 h-5 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">
                      Oferta expira em: <span className="text-lg font-bold">{formatTime(timeLeft)}</span>
                    </span>
                  </div>
                )}

                <div className="space-y-6 mb-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" />
                      Email para autenticação
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      disabled={isProcessing}
                    />
                    {emailError && (
                      <p className="text-sm text-destructive">{emailError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Seu email será usado para autenticação e envio do relatório
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-b border-border/50">
                    <span className="text-muted-foreground">Leitura Completa 2026</span>
                    {loadingPrice ? (
                      <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                    ) : (
                      <div className="flex items-center gap-2">
                        {anchorPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(anchorPrice)}
                          </span>
                        )}
                        {price && (
                          <span className="font-semibold text-lg text-accent">
                            {formatPrice(price)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 py-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      O que está incluído:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Análise quiromântica completa baseada na foto da sua mão</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Previsões personalizadas usando antroposofia e superstições brasileiras</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Cone da plausibilidade: cenários prováveis, possíveis e ousados</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Rituais e simpatias para a virada do ano</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Relatório completo para download em PDF</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border/50 font-bold text-xl">
                    <span>Total</span>
                    {loadingPrice ? (
                      <div className="h-7 w-32 bg-muted animate-pulse rounded" />
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        {anchorPrice && (
                          <span className="text-sm text-muted-foreground line-through font-normal">
                            {formatPrice(anchorPrice)}
                          </span>
                        )}
                        {price && (
                          <span className="text-accent">{formatPrice(price)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {!loadingPrice && price && anchorPrice && (
                    <div className="text-center py-2 px-4 rounded-lg bg-accent/10 border border-accent/30">
                      <span className="text-sm font-semibold text-accent">
                        Você economiza {formatPrice(anchorPrice - price)} (
                        {Math.round(((anchorPrice - price) / anchorPrice) * 100)}% de desconto)
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={processPayment}
                  className="w-full gradient-gold text-accent-foreground mystic-glow-hover font-bold text-lg py-6 h-auto"
                  size="lg"
                  disabled={isProcessing || !email.trim()}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Pagar Agora com Segurança
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Pagamento 100% seguro e criptografado</span>
                </div>
              </Card>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/formulario")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Voltar ao formulário
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
