import { StepProps } from "@/types/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, User } from "lucide-react";

export default function Step1Personal({ data, onUpdate, onNext }: StepProps) {
  const handleNext = () => {
    if (data.idade && data.sexo && data.profissao) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Informações Pessoais</h2>
          <p className="text-sm text-muted-foreground">
            Comece nos contando um pouco sobre você
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="idade" className="text-base">Qual sua idade?</Label>
          <Input
            id="idade"
            type="number"
            placeholder="Ex: 28"
            value={data.idade || ""}
            onChange={(e) => onUpdate({ idade: parseInt(e.target.value) })}
            className="mt-2 bg-card/50 border-primary/30 focus:border-primary"
            min={1}
            max={120}
          />
        </div>

        <div>
          <Label htmlFor="sexo" className="text-base">Sexo</Label>
          <Select value={data.sexo} onValueChange={(value) => onUpdate({ sexo: value })}>
            <SelectTrigger className="mt-2 bg-card/50 border-primary/30">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
              <SelectItem value="prefiro-nao-dizer">Prefiro não dizer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="profissao" className="text-base">Profissão</Label>
          <Input
            id="profissao"
            type="text"
            placeholder="Ex: Designer, Professora, Estudante..."
            value={data.profissao || ""}
            onChange={(e) => onUpdate({ profissao: e.target.value })}
            className="mt-2 bg-card/50 border-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!data.idade || !data.sexo || !data.profissao}
        className="w-full gradient-mystic mystic-glow-hover font-semibold"
        size="lg"
      >
        Continuar
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
