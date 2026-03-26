import { useState } from "react";

interface VoltWarningBannerProps {
  voltsRemaining: number;
  show: boolean;
}

export function VoltWarningBanner({ voltsRemaining, show }: VoltWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed || voltsRemaining > 3) return null;

  return (
    <div
      className="w-full px-4 py-2.5 flex items-center justify-between text-sm font-medium"
      style={{ backgroundColor: "#f5c842", color: "#06080e" }}
    >
      <div className="flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="flex-shrink-0"
        >
          <path
            d="M8.866 1.5L1.5 9.5H7.134L7.134 14.5L14.5 6.5H9.134L8.866 1.5Z"
            fill="#06080e"
            stroke="#06080e"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          <strong>{voltsRemaining} VOLT{voltsRemaining !== 1 ? "s" : ""}</strong> remaining.
          Top up to keep going.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 hover:opacity-70 transition-opacity text-lg leading-none font-bold"
        aria-label="Dismiss warning"
      >
        ×
      </button>
    </div>
  );
}
