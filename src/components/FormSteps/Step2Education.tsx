import { StepProps } from "@/types/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Step2Education({ data, onUpdate, onNext, onBack }: StepProps) {
  const handleNext = () => {
    if (data.estudando !== undefined) {
      if (data.estudando && data.nivelEstudo) {
        onNext();
      } else if (!data.estudando) {
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Educação</h2>
          <p className="text-sm text-muted-foreground">
            Seu caminho de aprendizado influencia suas previsões
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base mb-3 block">Você está estudando atualmente?</Label>
          <RadioGroup
            value={data.estudando?.toString()}
            onValueChange={(value) => onUpdate({ estudando: value === "true" })}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-primary/30 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
              <RadioGroupItem value="true" id="sim" />
              <Label htmlFor="sim" className="cursor-pointer flex-1">Sim, estou estudando</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-primary/30 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
              <RadioGroupItem value="false" id="nao" />
              <Label htmlFor="nao" className="cursor-pointer flex-1">Não, não estou estudando</Label>
            </div>
          </RadioGroup>
        </div>

        {data.estudando && (
          <div className="animate-fade-in">
            <Label htmlFor="nivel" className="text-base">Qual nível de estudo?</Label>
            <Select value={data.nivelEstudo} onValueChange={(value) => onUpdate({ nivelEstudo: value })}>
              <SelectTrigger className="mt-2 bg-card/50 border-primary/30">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                <SelectItem value="medio">Ensino Médio</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="graduacao">Graduação</SelectItem>
                <SelectItem value="pos-graduacao">Pós-graduação</SelectItem>
                <SelectItem value="mestrado">Mestrado</SelectItem>
                <SelectItem value="doutorado">Doutorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-primary/30 hover:bg-card/50"
          size="lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          disabled={data.estudando === undefined || (data.estudando && !data.nivelEstudo)}
          className="flex-1 gradient-mystic mystic-glow-hover font-semibold"
          size="lg"
        >
          Continuar
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
