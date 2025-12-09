import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormData, StepProps } from "@/types/form";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";

const objetivosOptions = [
  "Mudar de carreira",
  "Comprar a casa própria",
  "Viajar mais / conhecer novos lugares",
  "Cuidar mais da minha saúde física e mental",
  "Empreender ou expandir meu negócio",
  "Aumentar minha renda ou conquistar estabilidade financeira",
  "Concluir meus estudos ou começar uma nova formação",
  "Encontrar o amor ou fortalecer um relacionamento",
  "Ter mais equilíbrio entre vida pessoal e profissional",
  "Dedicar mais tempo à família",
  "Desenvolver minha espiritualidade",
];

const areasOptions = [
  "Relacionamentos (amorosos, familiares, amizades)",
  "Saúde física",
  "Saúde mental / emocional",
  "Finanças pessoais",
  "Carreira / profissão",
  "Autoconhecimento e autoestima",
  "Organização e produtividade",
  "Espiritualidade",
  "Lazer e bem-estar",
  "Comunicação e habilidades sociais",
];

const desafiosOptions = [
  "Falta de tempo",
  "Dificuldade em manter o foco ou disciplina",
  "Insegurança ou medo de mudar",
  "Problemas financeiros",
  "Questões familiares",
  "Sobrecarga emocional ou estresse",
  "Falta de clareza sobre o que quero",
  "Falta de apoio ou motivação",
  "Equilibrar vida pessoal e profissional",
  "Saúde física ou mental prejudicada",
];

export default function Step5Goals({ data, onUpdate, onNext, onBack }: StepProps) {
  const [showObjetivoOutro, setShowObjetivoOutro] = useState(!!data.objetivoPrincipalOutro);
  const [showAreaOutro, setShowAreaOutro] = useState(!!data.areaMelhorarOutro);
  const [showDesafioOutro, setShowDesafioOutro] = useState(!!data.desafioAtualOutro);

  const handleCheckboxChange = (
    field: "objetivoPrincipal" | "areaMelhorar" | "desafioAtual",
    value: string,
    checked: boolean
  ) => {
    const currentValues = (data[field] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    onUpdate({ [field]: newValues });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: pelo menos uma opção selecionada em cada pergunta
    const hasObjetivo = (data.objetivoPrincipal && data.objetivoPrincipal.length > 0) || data.objetivoPrincipalOutro;
    const hasArea = (data.areaMelhorar && data.areaMelhorar.length > 0) || data.areaMelhorarOutro;
    const hasDesafio = (data.desafioAtual && data.desafioAtual.length > 0) || data.desafioAtualOutro;
    
    if (!hasObjetivo || !hasArea || !hasDesafio) {
      alert("Por favor, selecione pelo menos uma opção em cada pergunta.");
      return;
    }
    
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 animate-fade-in">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 text-accent mx-auto mb-3 animate-float" />
        <h2 className="text-2xl font-bold mb-2">Seus Objetivos e Desejos</h2>
        <p className="text-muted-foreground text-sm">
          O que você deseja manifestar em 2026?
        </p>
      </div>

      {/* Pergunta 1: Objetivo Principal */}
      <div className="space-y-3 pb-4">
        <Label className="text-base font-semibold">
          Qual é o seu principal objetivo para 2026? *
        </Label>
        <p className="text-xs text-muted-foreground -mt-1 mb-3">
          Escolha uma ou mais opções
        </p>
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 bg-background/30 rounded-lg p-4 border border-primary/20">
          {objetivosOptions.map((option) => (
            <div key={option} className="flex items-start space-x-3">
              <Checkbox
                id={`objetivo-${option}`}
                checked={(data.objetivoPrincipal || []).includes(option)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("objetivoPrincipal", option, checked as boolean)
                }
                className="mt-0.5"
              />
              <label
                htmlFor={`objetivo-${option}`}
                className="text-sm leading-relaxed cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
          <div className="flex items-start space-x-3 pt-2 border-t border-border/50">
            <Checkbox
              id="objetivo-outro"
              checked={showObjetivoOutro}
              onCheckedChange={(checked) => {
                setShowObjetivoOutro(checked as boolean);
                if (!checked) onUpdate({ objetivoPrincipalOutro: "" });
              }}
              className="mt-0.5"
            />
            <label htmlFor="objetivo-outro" className="text-sm font-medium cursor-pointer">
              Outros
            </label>
          </div>
          {showObjetivoOutro && (
            <Input
              value={data.objetivoPrincipalOutro || ""}
              onChange={(e) => onUpdate({ objetivoPrincipalOutro: e.target.value })}
              placeholder="Digite sua própria resposta..."
              className="mt-2 bg-background border-primary/30"
            />
          )}
        </div>
      </div>

      {/* Pergunta 2: Área a Melhorar */}
      <div className="space-y-3 pb-4 border-t border-border/30 pt-8">
        <Label className="text-base font-semibold">
          Qual área da sua vida você mais deseja melhorar? *
        </Label>
        <p className="text-xs text-muted-foreground -mt-1 mb-3">
          Escolha uma ou mais opções
        </p>
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 bg-background/30 rounded-lg p-4 border border-primary/20">
          {areasOptions.map((option) => (
            <div key={option} className="flex items-start space-x-3">
              <Checkbox
                id={`area-${option}`}
                checked={(data.areaMelhorar || []).includes(option)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("areaMelhorar", option, checked as boolean)
                }
                className="mt-0.5"
              />
              <label
                htmlFor={`area-${option}`}
                className="text-sm leading-relaxed cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
          <div className="flex items-start space-x-3 pt-2 border-t border-border/50">
            <Checkbox
              id="area-outro"
              checked={showAreaOutro}
              onCheckedChange={(checked) => {
                setShowAreaOutro(checked as boolean);
                if (!checked) onUpdate({ areaMelhorarOutro: "" });
              }}
              className="mt-0.5"
            />
            <label htmlFor="area-outro" className="text-sm font-medium cursor-pointer">
              Outros
            </label>
          </div>
          {showAreaOutro && (
            <Input
              value={data.areaMelhorarOutro || ""}
              onChange={(e) => onUpdate({ areaMelhorarOutro: e.target.value })}
              placeholder="Digite sua própria resposta..."
              className="mt-2 bg-background border-primary/30"
            />
          )}
        </div>
      </div>

      {/* Pergunta 3: Desafio Atual */}
      <div className="space-y-3 pb-4 border-t border-border/30 pt-8">
        <Label className="text-base font-semibold">
          Qual é o seu maior desafio atualmente? *
        </Label>
        <p className="text-xs text-muted-foreground -mt-1 mb-3">
          Escolha uma ou mais opções
        </p>
        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 bg-background/30 rounded-lg p-4 border border-primary/20">
          {desafiosOptions.map((option) => (
            <div key={option} className="flex items-start space-x-3">
              <Checkbox
                id={`desafio-${option}`}
                checked={(data.desafioAtual || []).includes(option)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("desafioAtual", option, checked as boolean)
                }
                className="mt-0.5"
              />
              <label
                htmlFor={`desafio-${option}`}
                className="text-sm leading-relaxed cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
          <div className="flex items-start space-x-3 pt-2 border-t border-border/50">
            <Checkbox
              id="desafio-outro"
              checked={showDesafioOutro}
              onCheckedChange={(checked) => {
                setShowDesafioOutro(checked as boolean);
                if (!checked) onUpdate({ desafioAtualOutro: "" });
              }}
              className="mt-0.5"
            />
            <label htmlFor="desafio-outro" className="text-sm font-medium cursor-pointer">
              Outros
            </label>
          </div>
          {showDesafioOutro && (
            <Input
              value={data.desafioAtualOutro || ""}
              onChange={(e) => onUpdate({ desafioAtualOutro: e.target.value })}
              placeholder="Digite sua própria resposta..."
              className="mt-2 bg-background border-primary/30"
            />
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex-1 border-primary/30 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 gradient-mystic mystic-glow-hover font-semibold"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
