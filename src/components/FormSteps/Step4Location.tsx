import { StepProps } from "@/types/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hand, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Step4Location({ data, onUpdate, onNext, onBack }: StepProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const estadosBrasil = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, envie uma imagem menor que 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUpdate({ fotoMao: file });
    }
  };

  const handleNext = () => {
    if (data.estado && data.cidade && data.fotoMao) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary/20 border-2 border-primary/40">
          <Hand className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Localização e Leitura</h2>
          <p className="text-sm text-muted-foreground">
            Finalize com sua localização e foto da palma da mão
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-base font-semibold">Estado *</Label>
            <Select value={data.estado} onValueChange={(value) => onUpdate({ estado: value })}>
              <SelectTrigger className="bg-card/50 border-primary/30 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {estadosBrasil.map((estado) => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade" className="text-base font-semibold">Cidade *</Label>
            <Input
              id="cidade"
              value={data.cidade || ""}
              onChange={(e) => onUpdate({ cidade: e.target.value })}
              placeholder="Ex: São Paulo"
              className="bg-card/50 border-primary/30 hover:border-primary/50 transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro" className="text-base font-semibold">Bairro (opcional)</Label>
          <Input
            id="bairro"
            value={data.bairro || ""}
            onChange={(e) => onUpdate({ bairro: e.target.value })}
            placeholder="Ex: Centro, Jardins..."
            className="bg-card/50 border-primary/30 hover:border-primary/50 transition-colors"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold block">Foto da palma da mão *</Label>
          
          <Alert className="bg-accent/10 border-accent/30">
            <Info className="h-4 w-4 text-accent" />
            <AlertDescription className="text-sm">
              <strong className="block mb-2">Dicas para uma boa foto:</strong>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Tire a foto em ambiente bem iluminado (luz natural é ideal)</li>
                <li>Mantenha a palma da mão aberta e dedos levemente separados</li>
                <li>Deixe a mão relaxada, sem tensão</li>
                <li>Centralize a mão na foto, ocupando a maior parte da imagem</li>
                <li>Evite sombras sobre as linhas da mão</li>
                <li>Foto nítida, sem tremores</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="border-2 border-dashed border-primary/40 rounded-xl p-6 bg-gradient-to-br from-card/40 to-primary/5 hover:from-card/60 hover:to-primary/10 transition-all cursor-pointer group">
            <input
              type="file"
              id="foto-mao"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required
            />
            <label htmlFor="foto-mao" className="cursor-pointer flex flex-col items-center">
              {imagePreview ? (
                <div className="w-full">
                  <img
                    src={imagePreview}
                    alt="Preview da mão"
                    className="w-full h-56 object-cover rounded-lg mb-3 border-2 border-primary/30"
                  />
                  <p className="text-sm text-center text-muted-foreground hover:text-foreground transition-colors">
                    Clique para trocar a foto
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Hand className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-base font-semibold mb-2">Clique para enviar</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG ou JPEG até 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
          size="lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          disabled={!data.estado || !data.cidade || !data.fotoMao}
          className="flex-1 gradient-mystic mystic-glow-hover font-semibold disabled:opacity-50"
          size="lg"
        >
          Descobrir Seu Futuro ✨
        </Button>
      </div>
    </div>
  );
}
