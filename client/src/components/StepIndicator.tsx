interface Step {
  number: number;
  label: string;
}

const steps: Step[] = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Personal' },
  { number: 3, label: 'Documents' },
  { number: 4, label: 'Loan' },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors
                ${current === step.number ? 'bg-blue-600 border-blue-600 text-white' : ''}
                ${current > step.number ? 'bg-blue-600 border-blue-600 text-white' : ''}
                ${current < step.number ? 'bg-white border-gray-300 text-gray-400' : ''}
              `}
            >
              {current > step.number ? '✓' : step.number}
            </div>
            <span className={`text-xs mt-1 font-medium ${current >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-1 mb-4 transition-colors ${current > step.number ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}