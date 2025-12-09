import { Moon, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-galaxy relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          >
            <Star className="w-1 h-1 text-mystic-gold opacity-60" fill="currentColor" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating moon icon */}
          <div className="flex justify-center mb-8 animate-float">
            <div className="mystic-glow-hover rounded-full p-6 bg-card/30 backdrop-blur-sm border border-primary/20">
              <Moon className="w-16 h-16 md:w-20 md:h-20 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-mystic-blue to-accent bg-clip-text text-transparent leading-tight">
            Decifre o que 2026 Reserva Para Você
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Previsões personalizadas baseadas em quiromancia, superstições
            brasileiras e autoconhecimento profundo através da análise da sua mão
          </p>

          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/30 mystic-glow-hover">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Leitura de Mão</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/30 mystic-glow-hover">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Antroposofia</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/30 mystic-glow-hover">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Superstições Brasileiras</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/formulario")}
            size="lg"
            className="gradient-mystic mystic-glow-hover text-lg px-8 py-6 h-auto font-semibold rounded-2xl border-2 border-primary/50 hover:border-accent/50 transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Começar Leitura
          </Button>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              ✨ Análise personalizada baseada em seus dados únicos
            </p>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent" fill="currentColor" />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                Milhares de leituras realizadas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
