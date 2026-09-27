const steps = ["Tests", "Appointment", "Patient", "Payment"];

export default function BookingStepper({ current = 0 }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const active = index <= current;

        return (
          <div
            key={step}
            className="flex flex-1 items-center gap-2"
          >
            {index > 0 && (
              <div
                className={`h-px flex-1 ${
                  active ? "bg-brand-400" : "bg-gray-200"
                }`}
              />
            )}

            <div
              className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                active
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
              aria-current={index === current ? "step" : undefined}
            >
              {index + 1}
            </div>

            <span
              className={`hidden text-xs font-semibold sm:block ${
                active ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}