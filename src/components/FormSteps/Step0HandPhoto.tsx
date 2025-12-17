import { StepProps } from "@/types/form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Hand, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Step0HandPhoto({ data, onUpdate, onNext }: StepProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

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
    if (data.fotoMao) {
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
          <h2 className="text-2xl font-bold">Foto da Palma da Mão</h2>
          <p className="text-sm text-muted-foreground">
            Comece enviando uma foto da palma da sua mão para análise
          </p>
        </div>
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

      <Button
        onClick={handleNext}
        disabled={!data.fotoMao}
        className="w-full gradient-mystic mystic-glow-hover font-semibold disabled:opacity-50"
        size="lg"
      >
        Continuar
      </Button>
    </div>
  );
}

