interface ArchonGatewayPanelProps {
  analysisScores?: {
    pink?: number;
    volt?: number;
    moat?: number;
  };
}

export default function ArchonGatewayPanel({ analysisScores }: ArchonGatewayPanelProps) {
  const pink = analysisScores?.pink ?? 0;
  const volt = analysisScores?.volt ?? 5;
  const moat = analysisScores?.moat ?? 5;
  const qtac7 = ((pink * 0.3 + volt * 0.35 + moat * 0.35) * 10).toFixed(1);

  const handleRequestAccess = () => {
    const openWaitlist = (window as any).__openWaitlist;
    if (typeof openWaitlist === "function") {
      openWaitlist();
    }
  };

  return (
    <div
      className="rounded-xl p-6 mt-6"
      style={{
        backgroundColor: "#06080e",
        border: "1px solid rgba(245, 200, 66, 0.15)",
        boxShadow: "0 0 24px rgba(245, 200, 66, 0.04)",
      }}
    >
      <h3
        className="text-lg font-bold tracking-wider mb-3"
        style={{ color: "#f5c842", fontFamily: "JetBrains Mono, monospace" }}
      >
        ARCHON &#936;
      </h3>

      <p className="text-sm leading-relaxed mb-5" style={{ color: "#eef2f8" }}>
        This product's cognitive output profile suggests a QTAC
        <sub>7</sub> composite of{" "}
        <span className="font-mono font-bold" style={{ color: "#f5c842" }}>
          {qtac7}
        </span>
        . Full scoring requires human capital attestation.
      </p>

      <button
        onClick={handleRequestAccess}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
        style={{ backgroundColor: "#f5c842", color: "#06080e" }}
      >
        Request ARCHON &#936; Access &rarr;
      </button>
    </div>
  );
}
