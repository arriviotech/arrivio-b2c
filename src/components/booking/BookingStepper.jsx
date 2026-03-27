import React from "react";
import { Check } from "lucide-react";

/**
 * BookingStepper - A horizontal stepper component for the booking flow
 */
const BookingStepper = ({ currentStep = 2, bgClass = "bg-[#FDF9F6]" }) => {
    const steps = [
        { id: 1, label: "Log in or sign up" },
        { id: 2, label: "Verify identity" },
        { id: 3, label: "Pay advance" },
        { id: 4, label: "Sign contract" },
    ];

    return (
        <div className="w-full py-2">
            <div className="relative flex justify-between items-start">
                {/* Background Line */}
                <div className="absolute top-5 left-6 right-6 h-[1px] bg-[#0f4c3a]/10 -z-0" />

                {/* Progress Line */}
                <div
                    className="absolute top-5 left-6 h-[1px] bg-[#0f4c3a] transition-all duration-500 -z-0"
                    style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 3rem + 12px)` }}
                />

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;

                    return (
                        <div key={step.id} className={`relative flex flex-col items-center gap-3 z-10 px-2 ${bgClass}`}>
                            {/* Circle Wrapper with masking background */}
                            <div className={`p-1 ${bgClass} rounded-full`}>
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border ${isCompleted
                                        ? "bg-[#0f4c3a] border-[#0f4c3a] text-white"
                                        : isActive
                                            ? "bg-white border-[#0f4c3a] text-[#111827] shadow-md scale-110"
                                            : "bg-white border-[#0f4c3a]/10 text-[#111827]/30"
                                        }`}
                                >
                                    {isCompleted ? <Check size={18} /> : step.id}
                                </div>
                            </div>

                            <span
                                className={`text-[9px] font-bold tracking-tight transition-colors duration-300 text-center max-w-[70px] leading-tight ${isActive || isCompleted ? "text-[#111827]" : "text-[#111827]/30"
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
