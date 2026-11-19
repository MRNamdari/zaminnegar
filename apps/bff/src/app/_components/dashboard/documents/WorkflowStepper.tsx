interface WorkflowStep {
  id: number;
  title: string;
}

const steps: WorkflowStep[] = [
  {
    id: 1,
    title: 'در انتظار تکمیل',
  },
  {
    id: 2,
    title: 'آپلود مدارک',
  },
  {
    id: 3,
    title: 'تأیید همسایه‌ها',
  },
  {
    id: 4,
    title: 'بررسی مدارک',
  },
  {
    id: 5,
    title: 'تأیید زمین',
  },
];

export default function WorkflowStepper() {
  // Current Active Step
  const currentStep = 2;

  const lastStep = steps[steps.length - 1];

  // Workflow Completed
  const isWorkflowCompleted = currentStep > lastStep.id;

  const activeStep = steps.find((step) => step.id === currentStep);

  // Progress Percentage
  const progress = Math.max(
    0,
    Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100),
  );

  return (
    <div
      dir="ltr"
      aria-label="مراحل فرایند"
      className="relative mt-2 w-full min-w-0 pb-3"
    >
      {/* Mobile View */}
      <div
        className={`
          rounded-2xl border p-4 md:hidden
          ${
            isWorkflowCompleted
              ? 'border-[#00d66b]/30 bg-[#00d66b]/5'
              : 'border-border bg-action-primary/5'
          }
        `}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Step Counter */}
          <span
            dir="rtl"
            className={`
              shrink-0 text-xs font-semibold
              ${
                isWorkflowCompleted ? 'text-[#00d66b]' : 'text-muted-foreground'
              }
            `}
          >
            {isWorkflowCompleted
              ? `${steps.length} از ${steps.length}`
              : `${currentStep} از ${steps.length}`}
          </span>

          {/* Active Step Info */}
          <div dir="rtl" className="flex min-w-0 items-center gap-3">
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full font-bold text-foreground transition-all duration-500
                ${
                  isWorkflowCompleted
                    ? 'border-2 border-[#00d66b] bg-[#00d66b] text-foreground shadow-[0_0_0_3px_rgba(0,214,107,0.12),0_0_16px_rgba(0,214,107,0.3)]'
                    : 'border-2 border-[#75b4ff] bg-action-primary text-foreground shadow-[0_0_0_3px_rgba(8,120,255,0.16)]'
                }
              `}
            >
              {isWorkflowCompleted ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path
                    d="M5 12.5L10 17L19.5 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span className="relative translate-y-0.5 text-surface">{currentStep}</span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {isWorkflowCompleted ? 'وضعیت فرایند' : 'مرحله فعلی'}
              </p>

              <h3
                className={`
                  truncate text-sm font-bold
                  ${isWorkflowCompleted ? 'text-[#00d66b]' : 'text-foreground'}
                `}
              >
                {isWorkflowCompleted ? 'فرایند تکمیل شد' : activeStep?.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-[#354b76]/30">
          <div
            className={`
              h-full rounded-full transition-all duration-700 ease-in-out
              ${
                isWorkflowCompleted
                  ? 'bg-[#00d66b] shadow-[0_0_10px_rgba(0,214,107,0.5)]'
                  : 'bg-linear-to-r from-[#00d66b] via-[#00d6a0] to-[#0878ff]'
              }
            `}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Desktop & Tablet View */}
      <div className="relative hidden md:block">
        {/* Progress Line */}
        <div
          className="
            absolute left-[calc(10%+24px)] right-[calc(10%+24px)]
            top-5 z-0 h-0.75 rounded-full bg-[#354b76]
          "
        >
          <div
            className={`
              h-full rounded-full transition-all duration-700 ease-in-out
              ${
                isWorkflowCompleted
                  ? 'bg-[#00d66b] shadow-[0_0_10px_rgba(0,214,107,0.5)]'
                  : 'bg-linear-to-r from-[#00d66b] via-[#00d6a0] to-[#0878ff]'
              }
            `}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 grid grid-cols-5">
          {steps.map((step) => {
            const isCompleted = isWorkflowCompleted || step.id < currentStep;

            const isActive = !isWorkflowCompleted && step.id === currentStep;

            return (
              <div
                key={step.id}
                className="flex min-w-0 flex-col items-center gap-2.5"
              >
                {/* Step Number */}
                <div className="flex h-10.5 w-full items-center justify-center">
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center
                      rounded-full font-bold transition-all duration-500
                      ${
                        isCompleted
                          ? 'bg-[#00d66b] text-foreground shadow-[0_0_12px_rgba(0,214,107,0.3)]'
                          : isActive
                            ? 'h-10.5 w-10.5 border-2 border-[#75b4ff] bg-action-primary text-white shadow-[0_0_0_3px_rgba(8,120,255,0.16),0_0_16px_rgba(8,120,255,0.65)]'
                            : 'bg-[#52658d] text-surface'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                        <path
                          d="M5 12.5L10 17L19.5 7"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="relative translate-y-0.5 text-lg font-bold">
                        {step.id}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step Title */}
                <span
                  dir="rtl"
                  className={`
                    text-center text-sm font-semibold
                    transition-colors duration-500
                    ${
                      isWorkflowCompleted
                        ? 'text-[#00d66b]'
                        : isCompleted
                          ? 'text-[#e8f4ff]'
                          : isActive
                            ? 'font-bold text-foreground'
                            : 'text-muted-foreground'
                    }
                  `}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
