import { StepProps } from "@/types/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Step3Family({ data, onUpdate, onNext, onBack }: StepProps) {
  const handleNext = () => {
    if (data.situacaoCivil && data.filhos !== undefined) {
      if (data.filhos && data.quantidadeFilhos) {
        onNext();
      } else if (!data.filhos) {
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Vida Pessoal</h2>
          <p className="text-sm text-muted-foreground">
            Seus relacionamentos moldam seu destino
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="situacao" className="text-base">Situação civil</Label>
          <Select value={data.situacaoCivil} onValueChange={(value) => onUpdate({ situacaoCivil: value })}>
            <SelectTrigger className="mt-2 bg-card/50 border-primary/30">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solteira">Solteiro(a)</SelectItem>
              <SelectItem value="relacionamento">Em relacionamento</SelectItem>
              <SelectItem value="noiva">Noivo(a)</SelectItem>
              <SelectItem value="casada">Casado(a)</SelectItem>
              <SelectItem value="divorciada">Divorciado(a)</SelectItem>
              <SelectItem value="viuva">Viúvo(a)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-base mb-3 block">Você tem filhos?</Label>
          <RadioGroup
            value={data.filhos?.toString()}
            onValueChange={(value) => onUpdate({ filhos: value === "true" })}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-primary/30 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
              <RadioGroupItem value="true" id="filhos-sim" />
              <Label htmlFor="filhos-sim" className="cursor-pointer flex-1">Sim</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-primary/30 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
              <RadioGroupItem value="false" id="filhos-nao" />
              <Label htmlFor="filhos-nao" className="cursor-pointer flex-1">Não</Label>
            </div>
          </RadioGroup>
        </div>

        {data.filhos && (
          <div className="animate-fade-in">
            <Label htmlFor="quantidade" className="text-base">Quantos filhos?</Label>
            <Input
              id="quantidade"
              type="number"
              placeholder="Digite a quantidade"
              value={data.quantidadeFilhos || ""}
              onChange={(e) => onUpdate({ quantidadeFilhos: parseInt(e.target.value) })}
              className="mt-2 bg-card/50 border-primary/30 focus:border-primary"
              min={1}
              max={20}
            />
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
          disabled={!data.situacaoCivil || data.filhos === undefined || (data.filhos && !data.quantidadeFilhos)}
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
