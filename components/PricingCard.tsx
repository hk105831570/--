interface PlanFeature {
  label: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  priceSub?: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  ctaStyle?: "primary" | "outline" | "disabled";
  onCtaClick?: () => void;
}

export default function PricingCard({
  title,
  price,
  priceSub,
  features,
  highlighted,
  badge,
  cta,
  ctaStyle = "primary",
  onCtaClick,
}: PricingCardProps) {
  const btnClass = {
    primary:
      "inline-flex w-full items-center justify-center rounded-md bg-[#1a2b4a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f1f36]",
    outline:
      "inline-flex w-full items-center justify-center rounded-md border border-[#1a2b4a] px-5 py-3 text-sm font-semibold text-[#1a2b4a] hover:bg-gray-50",
    disabled:
      "inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed",
  }[ctaStyle];

  return (
    <div
      className={`relative flex flex-col rounded-lg border bg-white p-6 ${
        highlighted
          ? "border-[#1a2b4a] ring-2 ring-[#1a2b4a]"
          : "border-gray-200"
      }`}
    >
      {badge && (
        <span className="absolute -right-px -top-px rounded-bl-lg rounded-tr-lg bg-[#1a2b4a] px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </span>
      )}

      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="mt-3">
        <span className="text-3xl font-bold text-gray-900">{price}</span>
        {priceSub && (
          <span className="ml-2 text-sm text-gray-500">{priceSub}</span>
        )}
      </div>

      <ul className="mt-5 flex-1 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {f.included ? (
              <span className="mt-0.5 text-emerald-600">✓</span>
            ) : (
              <span className="mt-0.5 text-gray-300">✗</span>
            )}
            <span className={f.included ? "text-gray-700" : "text-gray-400"}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onCtaClick}
        disabled={ctaStyle === "disabled"}
        className={`mt-6 ${btnClass}`}
      >
        {cta}
      </button>
    </div>
  );
}
