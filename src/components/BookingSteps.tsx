
import { Circle, CircleCheck } from "lucide-react";

interface BookingStepsProps {
  currentStep: number;
}

const BookingSteps = ({ currentStep }: BookingStepsProps) => {
  const steps = [
    "Escolha uma data disponível",
    "Selecione um horário",
    "Digite seu nome",
  ];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              {index + 1 <= currentStep ? (
                <CircleCheck className="h-8 w-8 text-green-500" />
              ) : (
                <Circle className="h-8 w-8 text-gray-300" />
              )}
              <span className="text-sm mt-2 text-center max-w-[120px]">
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mx-2 ${
                  index + 1 < currentStep ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingSteps;
