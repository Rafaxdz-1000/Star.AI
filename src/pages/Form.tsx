import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormData } from "@/types/form";
import { Progress } from "@/components/ui/progress";
import Step1Personal from "@/components/FormSteps/Step1Personal";
import Step2Education from "@/components/FormSteps/Step2Education";
import Step3Family from "@/components/FormSteps/Step3Family";
import Step4Location from "@/components/FormSteps/Step4Location";
import Step5Goals from "@/components/FormSteps/Step5Goals";
import { Moon, Sparkles } from "lucide-react";

export default function Form() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Navigate to payment
      navigate("/pagamento", { state: { formData } });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: formData,
      onUpdate: updateFormData,
      onNext: nextStep,
      onBack: prevStep,
    };

    switch (currentStep) {
      case 1:
        return <Step1Personal {...stepProps} />;
      case 2:
        return <Step2Education {...stepProps} />;
      case 3:
        return <Step3Family {...stepProps} />;
      case 4:
        return <Step5Goals {...stepProps} />;
      case 5:
        return <Step4Location {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-galaxy relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
            size={16}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Moon className="w-12 h-12 text-primary animate-float" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Sua Jornada Mística
          </h1>
          <p className="text-muted-foreground">
            Etapa {currentStep} de {totalSteps}
          </p>
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Início</span>
            <span>Resultado</span>
          </div>
        </div>

        {/* Form card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-3xl p-6 md:p-8 mystic-glow">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
