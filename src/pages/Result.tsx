import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Share2, Sparkles, Moon, TrendingUp, Lightbulb, Instagram, MessageCircle, Loader2, Lock, Mail, CheckCircle2 } from "lucide-react";
import { generateReport, Report } from "@/utils/generateReport";
import { useToast } from "@/hooks/use-toast";
import { verifyPayment } from "@/utils/stripe";
import { supabase } from "@/integrations/supabase/client";
import { fetchFormDataFromSupabase } from "@/utils/saveToSupabase";
import { FormData } from "@/types/form";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [formData, setFormData] = useState<Partial<FormData> | null>(location.state?.formData || null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ formDataId?: string; email?: string } | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyAccess = async () => {
      // Se tem session_id na URL, verificar pagamento via Stripe
      if (sessionId) {
        try {
          const paymentStatus = await verifyPayment(sessionId);
          
          if (paymentStatus.paid) {
            // Se não tem formData no state, mostrar tela de confirmação
            if (!formData) {
              setPaymentInfo({
                formDataId: paymentStatus.formDataId,
                email: paymentStatus.email,
              });
              // Pré-preencher email se disponível
              if (paymentStatus.email) {
                setConfirmationEmail(paymentStatus.email);
              }
              setShowConfirmation(true);
              setIsVerifying(false);
              return;
            }
            
            // Se tem formData, processar normalmente
            setPaymentVerified(true);
            const generatedReport = generateReport(formData);
            setReport(generatedReport);
            setIsVerifying(false);
          } else {
            toast({
              title: "Pagamento não confirmado",
              description: "Por favor, complete o pagamento para acessar o resultado.",
              variant: "destructive",
            });
            navigate("/pagamento");
          }
        } catch (error) {
          console.error("Erro ao verificar pagamento:", error);
          toast({
            title: "Erro ao verificar pagamento",
            description: "Não foi possível verificar o status do pagamento.",
            variant: "destructive",
          });
          navigate("/pagamento");
        } finally {
          setIsVerifying(false);
        }
        return;
      }

      // Se não tem session_id, verificar no banco se o relatório está pago
      const formDataId = location.state?.formDataId;
      if (formDataId) {
        try {
          const { data: reportData, error } = await supabase
            .from("reports")
            .select("is_paid")
            .eq("form_data_id", formDataId)
            .single();

          if (error || !reportData?.is_paid) {
            toast({
              title: "Acesso restrito",
              description: "Você precisa completar o pagamento para acessar o resultado.",
              variant: "destructive",
            });
            navigate("/pagamento");
            return;
          }

          setPaymentVerified(true);
          
          // Se não tem formData no state, buscar do banco
          let dataToUse = formData;
          if (!dataToUse) {
            const fetchResult = await fetchFormDataFromSupabase(formDataId);
            if (fetchResult.success && fetchResult.formData) {
              dataToUse = fetchResult.formData;
              setFormData(dataToUse);
            } else {
              toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível recuperar os dados do formulário.",
                variant: "destructive",
              });
              navigate("/");
              return;
            }
          }
          
          if (dataToUse) {
            const generatedReport = generateReport(dataToUse);
            setReport(generatedReport);
          } else {
            toast({
              title: "Dados não encontrados",
              description: "Não foi possível encontrar os dados do formulário.",
              variant: "destructive",
            });
            navigate("/");
          }
        } catch (error) {
          console.error("Erro ao verificar no banco:", error);
          toast({
            title: "Erro ao verificar acesso",
            description: "Não foi possível verificar seu acesso ao resultado.",
            variant: "destructive",
          });
          navigate("/pagamento");
        } finally {
          setIsVerifying(false);
        }
        return;
      }

      // Se não tem nem session_id nem formDataId, mostrar tela de verificação por email
      setIsVerifying(false);
      setShowEmailVerification(true);
    };

    verifyAccess();
  }, [formData, sessionId, navigate, toast, location.state]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailVerification = async () => {
    if (!verificationEmail.trim()) {
      setEmailError("Por favor, informe seu email");
      return;
    }

    if (!validateEmail(verificationEmail)) {
      setEmailError("Por favor, informe um email válido");
      return;
    }

    setIsVerifyingEmail(true);
    setEmailError("");

    try {
      // Buscar form_data pelo email e verificar pagamento usando join com reports
      const emailLower = verificationEmail.trim().toLowerCase();
      
      // Buscar registros de form_data com join em reports para verificar pagamento confirmado
      const { data: formDataRecords, error: formDataError } = await supabase
        .from("form_data")
        .select(`
          id,
          email,
          reports!inner(is_paid, form_data_id)
        `)
        .eq("reports.is_paid", true);

      if (formDataError) {
        console.error("Erro ao buscar registros:", formDataError);
        // Se o erro for porque não encontrou nenhum registro com join, tentar busca alternativa
        if (formDataError.code === "PGRST116" || formDataError.message?.includes("No rows")) {
          setEmailError("Nenhum pagamento confirmado encontrado para este email");
          setIsVerifyingEmail(false);
          return;
        }
        setEmailError("Erro ao buscar registros");
        setIsVerifyingEmail(false);
        return;
      }

      // Filtrar pelo email (case-insensitive)
      const matchingRecord = formDataRecords?.find((record: any) => {
        const emailMatches = record.email?.toLowerCase() === emailLower;
        const hasPaidReport = Array.isArray(record.reports) 
          ? record.reports.some((r: any) => r.is_paid === true)
          : record.reports?.is_paid === true;
        return emailMatches && hasPaidReport;
      });

      if (!matchingRecord) {
        setEmailError("Nenhum pagamento confirmado encontrado para este email");
        setIsVerifyingEmail(false);
        return;
      }

      const foundPaidRecord = {
        formDataId: matchingRecord.id,
        email: matchingRecord.email,
      };

      // Buscar dados do formulário
      const fetchResult = await fetchFormDataFromSupabase(foundPaidRecord.formDataId);
      if (fetchResult.success && fetchResult.formData) {
        setFormData(fetchResult.formData);
        setPaymentVerified(true);
        const generatedReport = generateReport(fetchResult.formData);
        setReport(generatedReport);
        setShowEmailVerification(false);
        toast({
          title: "Pagamento confirmado! ✨",
          description: "Carregando suas previsões...",
        });
      } else {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível recuperar os dados do formulário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar seu email.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleConfirmation = async () => {
    if (!confirmationEmail.trim()) {
      setEmailError("Por favor, informe seu email");
      return;
    }

    if (!validateEmail(confirmationEmail)) {
      setEmailError("Por favor, informe um email válido");
      return;
    }

    if (!paymentInfo?.formDataId) {
      toast({
        title: "Erro",
        description: "Não foi possível verificar o pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    setEmailError("");

    try {
      // Verificar se o email corresponde ao pagamento
      const { data: formDataRecord, error } = await supabase
        .from("form_data")
        .select("email")
        .eq("id", paymentInfo.formDataId)
        .single();

      if (error || !formDataRecord) {
        toast({
          title: "Erro",
          description: "Não foi possível verificar seu email. Verifique se o email está correto.",
          variant: "destructive",
        });
        setIsConfirming(false);
        return;
      }

      // Verificar se o email corresponde (case-insensitive)
      if (formDataRecord.email.toLowerCase() !== confirmationEmail.toLowerCase()) {
        setEmailError("Este email não corresponde ao pagamento realizado");
        setIsConfirming(false);
        return;
      }

      // Buscar dados do formulário
      const fetchResult = await fetchFormDataFromSupabase(paymentInfo.formDataId);
      if (fetchResult.success && fetchResult.formData) {
        setFormData(fetchResult.formData);
        setPaymentVerified(true);
        const generatedReport = generateReport(fetchResult.formData);
        setReport(generatedReport);
        setShowConfirmation(false);
        toast({
          title: "Pagamento confirmado! ✨",
          description: "Carregando suas previsões...",
        });
      } else {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível recuperar os dados do formulário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao confirmar:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao confirmar seu pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper to add text with wrap
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Title
      addText("SUAS PREVISÕES MÍSTICAS PARA 2026", 18, true);
      yPosition += 5;

      // Summary
      addText("RESUMO DA LEITURA", 14, true);
      addText(report.resumo, 10);
      yPosition += 5;

      // Rituals
      addText("RITUAIS PARA A VIRADA DO ANO", 14, true);
      report.rituais.forEach((ritual, i) => {
        addText(`${i + 1}. ${ritual}`, 10);
      });
      yPosition += 5;

      // Plausibility Cone
      addText("CONE DA PLAUSIBILIDADE - SEU PRÓXIMO ANO", 14, true);
      
      addText("📊 CENÁRIOS MAIS PROVÁVEIS:", 12, true);
      report.cenarios.provaveis.forEach((c, i) => addText(`${i + 1}. ${c}`, 10));
      
      addText("🎯 CENÁRIOS POSSÍVEIS:", 12, true);
      report.cenarios.possiveis.forEach((c, i) => addText(`${i + 1}. ${c}`, 10));
      
      addText("✨ CENÁRIOS OUSADOS:", 12, true);
      report.cenarios.ousados.forEach((c, i) => addText(`${i + 1}. ${c}`, 10));
      
      yPosition += 5;

      // Insights
      addText("INSIGHTS E AUTOCONHECIMENTO", 14, true);
      report.insights.forEach((insight, i) => {
        addText(`${i + 1}. ${insight}`, 10);
      });

      // Footer
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(8);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, margin, pageHeight - 10);

      doc.save("previsoes-misticas-2026.pdf");

      toast({
        title: "PDF baixado! ✨",
        description: "Seu relatório foi salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: "whatsapp" | "instagram" | "facebook") => {
    const shareText = `✨ Acabei de receber minhas Previsões Místicas para 2026! 

Descubra o que o universo reserva para você através de quiromancia, superstições brasileiras e autoconhecimento profundo. 

🔮 A leitura revelou caminhos incríveis para o próximo ano!

#Previsoes2026 #Misticismo #Quiromancia #Autoconhecimento`;

    const encodedText = encodeURIComponent(shareText);

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");
      toast({
        title: "Abrindo WhatsApp! 💚",
        description: "Compartilhe suas previsões.",
      });
    } else if (platform === "instagram") {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Texto copiado! 📋",
        description: "Abra o Instagram e cole para compartilhar.",
      });
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`, "_blank");
      toast({
        title: "Abrindo Facebook! 💙",
        description: "Compartilhe suas previsões.",
      });
    }
  };

  // Mostrar loading enquanto verifica pagamento
  if (isVerifying) {
    return (
      <div className="min-h-screen gradient-galaxy relative overflow-hidden flex items-center justify-center">
        <Card className="p-8 md:p-12 text-center bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow max-w-md">
          <div className="animate-float mb-6">
            <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Verificando acesso...
          </h2>
          <p className="text-muted-foreground mb-6">
            Estamos confirmando seu pagamento para liberar suas previsões
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar tela de verificação por email (quando não tem session_id nem formDataId)
  if (showEmailVerification) {
    return (
      <div className="min-h-screen gradient-galaxy relative overflow-hidden flex items-center justify-center">
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

        <Card className="p-8 md:p-12 text-center bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow max-w-md w-full mx-4 relative z-10">
          <div className="animate-float mb-6">
            <div className="p-4 rounded-full bg-primary/20 border border-primary/30 mx-auto w-20 h-20 flex items-center justify-center">
              <Mail className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Verificar Pagamento
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Informe o email usado no pagamento para acessar suas previsões:
          </p>

          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="verification-email" className="text-base font-semibold flex items-center gap-2 justify-start">
                <Mail className="w-4 h-4 text-accent" />
                Email de pagamento
              </Label>
              <Input
                id="verification-email"
                type="email"
                placeholder="seu@email.com"
                value={verificationEmail}
                onChange={(e) => {
                  setVerificationEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={`w-full ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                disabled={isVerifyingEmail}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isVerifyingEmail) {
                    handleEmailVerification();
                  }
                }}
              />
              {emailError && (
                <p className="text-sm text-destructive text-left">{emailError}</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleEmailVerification}
            className="w-full gradient-mystic mystic-glow-hover font-semibold"
            size="lg"
            disabled={isVerifyingEmail || !verificationEmail.trim()}
          >
            {isVerifyingEmail ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Verificar e Acessar Resultados
              </>
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Se você já efetuou o pagamento, informe o email usado para acessar suas previsões místicas personalizadas.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar tela de confirmação/login
  if (showConfirmation) {
    return (
      <div className="min-h-screen gradient-galaxy relative overflow-hidden flex items-center justify-center">
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

        <Card className="p-8 md:p-12 text-center bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow max-w-md w-full mx-4 relative z-10">
          <div className="animate-float mb-6">
            <div className="p-4 rounded-full bg-success/20 border border-success/30 mx-auto w-20 h-20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pagamento Confirmado! ✨
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Para acessar suas previsões personalizadas, confirme o email usado no pagamento:
          </p>

          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="confirmation-email" className="text-base font-semibold flex items-center gap-2 justify-start">
                <Mail className="w-4 h-4 text-accent" />
                Email de confirmação
              </Label>
              <Input
                id="confirmation-email"
                type="email"
                placeholder="seu@email.com"
                value={confirmationEmail}
                onChange={(e) => {
                  setConfirmationEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={`w-full ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                disabled={isConfirming}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isConfirming) {
                    handleConfirmation();
                  }
                }}
              />
              {emailError && (
                <p className="text-sm text-destructive text-left">{emailError}</p>
              )}
              {paymentInfo?.email && (
                <p className="text-xs text-muted-foreground text-left">
                  Dica: Use o email <span className="font-semibold">{paymentInfo.email}</span>
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleConfirmation}
            className="w-full gradient-mystic mystic-glow-hover font-semibold"
            size="lg"
            disabled={isConfirming || !confirmationEmail.trim()}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Confirmar e Ver Resultados
              </>
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Seu pagamento foi processado com sucesso. Confirme seu email para acessar suas previsões místicas personalizadas.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Se não tem pagamento verificado, não mostrar nada (já redirecionou)
  if (!paymentVerified || !report) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-galaxy relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(30)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
            size={16}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4 animate-float">
              <Moon className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-mystic-blue to-accent bg-clip-text text-transparent">
              Suas Previsões para 2026
            </h1>
            <p className="text-lg text-muted-foreground">
              Análise completa baseada em quiromancia e autoconhecimento
            </p>
          </div>

          {/* Main Report Card */}
          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow mb-6 animate-fade-in">
            <div className="prose prose-invert max-w-none">
              <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
                Resumo da Leitura
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {report.resumo}
              </p>
            </div>
          </Card>

          {/* Rituals Card */}
          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow mb-6 animate-fade-in">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
              <Moon className="w-6 h-6 text-primary" />
              Rituais para a Virada
            </h2>
            <div className="space-y-4">
              {report.rituais.map((ritual, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-background/30 rounded-lg border border-primary/20"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-muted-foreground">{ritual}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Cone da Plausibilidade */}
          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow mb-6 animate-fade-in">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
              <TrendingUp className="w-6 h-6 text-accent" />
              Cone da Plausibilidade
            </h2>

            <div className="space-y-6">
              {/* Prováveis */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  📊 Cenários Mais Prováveis
                </h3>
                <div className="space-y-3">
                  {report.cenarios.provaveis.map((cenario, index) => (
                    <div
                      key={index}
                      className="p-4 bg-primary/10 rounded-lg border border-primary/30"
                    >
                      <p className="text-muted-foreground">{cenario}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Possíveis */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-mystic-blue">
                  🎯 Cenários Possíveis
                </h3>
                <div className="space-y-3">
                  {report.cenarios.possiveis.map((cenario, index) => (
                    <div
                      key={index}
                      className="p-4 bg-mystic-blue/10 rounded-lg border border-mystic-blue/30"
                    >
                      <p className="text-muted-foreground">{cenario}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ousados */}
              <div>
                <h3 className="text-xl font-semibold mb-3 text-accent">
                  ✨ Cenários Ousados
                </h3>
                <div className="space-y-3">
                  {report.cenarios.ousados.map((cenario, index) => (
                    <div
                      key={index}
                      className="p-4 bg-accent/10 rounded-lg border border-accent/30"
                    >
                      <p className="text-muted-foreground">{cenario}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Insights Card */}
          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-primary/30 mystic-glow mb-8 animate-fade-in">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
              <Lightbulb className="w-6 h-6 text-accent" />
              Insights e Autoconhecimento
            </h2>
            <div className="space-y-4">
              {report.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-background/30 rounded-lg border border-accent/20"
                >
                  <p className="text-muted-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>

            {/* Numerologia Section */}
            <div className="mt-8 p-6 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl border-2 border-accent/40">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Sua Numerologia e os Números da Sorte
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Seu Número de Destino para 2026:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-accent/30 border-2 border-accent flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">{report.numerologia.numeroDestino}</span>
                    </div>
                    <p className="text-sm flex-1">{report.numerologia.significado}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-primary/30">
                  <p className="text-sm font-semibold mb-3">Seus números para a Mega-Sena 2026:</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {report.numerologia.numerosMegaSena.map((numero, idx) => (
                      <div 
                        key={idx} 
                        className="w-12 h-12 rounded-full bg-success/20 border-2 border-success flex items-center justify-center"
                      >
                        <span className="text-lg font-bold text-success">{numero}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Números calculados com base na numerologia do seu perfil místico
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleDownload}
                className="gradient-mystic mystic-glow-hover font-semibold"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar PDF
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Novo
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => handleShare("whatsapp")}
                className="bg-success hover:bg-success/90 text-success-foreground font-semibold"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShare("instagram")}
                className="gradient-gold text-accent-foreground font-semibold"
                size="lg"
              >
                <Instagram className="w-5 h-5 mr-2" />
                Instagram
              </Button>
              <Button
                onClick={() => handleShare("facebook")}
                className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-semibold"
                size="lg"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Facebook
              </Button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
