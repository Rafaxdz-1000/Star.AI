export interface FormData {
  idade: number;
  sexo: string;
  profissao: string;
  estudando: boolean;
  nivelEstudo?: string;
  situacaoCivil: string;
  filhos: boolean;
  quantidadeFilhos?: number;
  estado: string;
  cidade: string;
  bairro?: string;
  fotoMao?: File;
  objetivoPrincipal?: string[];
  objetivoPrincipalOutro?: string;
  areaMelhorar?: string[];
  areaMelhorarOutro?: string;
  desafioAtual?: string[];
  desafioAtualOutro?: string;
}

export interface StepProps {
  data: Partial<FormData>;
  onUpdate: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}
