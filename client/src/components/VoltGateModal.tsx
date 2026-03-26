import { StripeBuyButton } from "./StripeBuyButton";

interface VoltGateModalProps {
  open: boolean;
  onClose: () => void;
}

export function VoltGateModal({ open, onClose }: VoltGateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl mx-4 rounded-lg border border-white/10 shadow-2xl"
        style={{ background: "#06080e" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            You're out of VOLTs.
          </h2>
          <p className="mt-2 text-white/50 text-sm">
            Every analysis costs 1 VOLT. Choose your tier to continue.
          </p>
        </div>

        {/* Tier comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 pb-8">
          {/* SPARK */}
          <div className="rounded-lg border border-white/10 p-6 flex flex-col items-center text-center">
            <div className="text-xs font-mono tracking-widest text-white/40 uppercase mb-2">
              Spark
            </div>
            <div className="text-3xl font-bold text-white mb-1">Free</div>
            <div className="text-white/50 text-sm mb-4">3 VOLTs</div>
            <ul className="text-white/40 text-xs space-y-1 mb-6">
              <li>3 analyses total</li>
              <li>No card needed</li>
              <li>Basic reports</li>
            </ul>
            <div className="mt-auto text-white/30 text-xs font-mono">
              CURRENT TIER
            </div>
          </div>

          {/* SURGE */}
          <div className="rounded-lg border border-cyan-500/40 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase mb-2">
              Surge
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              $20<span className="text-base font-normal text-white/50">/mo</span>
            </div>
            <div className="text-white/50 text-sm mb-4">20 VOLTs / month</div>
            <ul className="text-white/60 text-xs space-y-1 mb-6">
              <li>20 analyses per month</li>
              <li>PINK + VOLT + MOAT scoring</li>
              <li>Full strategic reports</li>
            </ul>
            <div className="mt-auto w-full">
              <StripeBuyButton buttonId="SINGLE_REPORT" />
            </div>
          </div>

          {/* SOVEREIGN */}
          <div className="rounded-lg border border-amber-500/40 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="text-xs font-mono tracking-widest text-amber-400 uppercase mb-2">
              Sovereign
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              $79<span className="text-base font-normal text-white/50">/mo</span>
            </div>
            <div className="text-white/50 text-sm mb-4">100 VOLTs / month</div>
            <ul className="text-white/60 text-xs space-y-1 mb-6">
              <li>100 analyses per month</li>
              <li>Priority processing</li>
              <li>Signal Box access</li>
              <li>Custom agent builds</li>
            </ul>
            <div className="mt-auto w-full">
              <StripeBuyButton buttonId="PRO_MONTHLY" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-white/30 text-xs font-mono">
            FACTORIZER × WAVEFORM TECH — ALL ANALYSES IRREVERSIBLE
          </p>
        </div>
      </div>
    </div>
  );
}
