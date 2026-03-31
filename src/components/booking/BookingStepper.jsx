import React from "react";
import { Check, FileText, CreditCard, ClipboardList, PenTool } from "lucide-react";

const BookingStepper = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, label: "Review", icon: FileText },
    { id: 2, label: "Pay deposit", icon: CreditCard },
    { id: 3, label: "Application", icon: ClipboardList },
    { id: 4, label: "Sign lease", icon: PenTool },
  ];

  return (
    <div className="w-full">
      {/* Line behind circles */}
      <div className="relative flex items-start justify-between">
        {/* Background track */}
        <div className="absolute top-[22px] left-[22px] right-[22px] h-[2px] bg-[#e5e7eb]" />
        {/* Progress fill */}
        <div
          className="absolute top-[22px] left-[22px] h-[2px] bg-[#0f4c3a] transition-all duration-500"
          style={{ width: `calc(${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}% - 44px * ${(Math.min(currentStep, steps.length) - 1) / (steps.length - 1)})` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-[#0f4c3a] text-white"
                    : isActive
                    ? "bg-white border-2 border-[#0f4c3a] text-[#0f4c3a] shadow-sm"
                    : "bg-[#f2f2f2] text-[#9ca3af] border border-[#e5e7eb]"
                }`}
              >
                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider text-center leading-tight max-w-[80px] ${
                  isActive
                    ? "text-[#0f4c3a]"
                    : isCompleted
                    ? "text-[#111827]"
                    : "text-[#9ca3af]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepper;
