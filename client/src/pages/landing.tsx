import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// CORTEXCHAIN LANDING — Product Intelligence Infrastructure
// Block #25 + #26 doctrine: The Castle Comes First
// Three-lane: SPARK (free) → SURGE ($20) → SOVEREIGN ($79)
// The One Question on the wall: "What does CortexChain know — that nobody
// else knows — that makes a buyer's decision materially better?"

const DEMO = {
  subject: "Apple AirPods Pro 2",
  verdict: "ACQUIRE",
  pink: { score: 7.2, node: "H2 custom SiP — single-source, no substitution path" },
  volt: { score: 8.4, signal: "40+ active patents · ANC algorithm defensible 6+ yrs" },
  moat: { score: 6.1, label: "Switching Costs + Brand · switching_costs: 8/10" },
  cogs: "$41", retail: "$249", margin: 83,
  brief: "AirPods Pro 2 generates 83% gross margin on a $41 BOM. The real moat is the H2 SiP and ecosystem lock-in. To compete requires a custom silicon program ($30M+) or a platform differentiation strategy. PINK: single-source risk on TSMC 4nm is the kill switch.",
};

const LANES = [
  { id:"spark", name:"SPARK", price:"Free", period:"", volts:"3 analyses", badge:null, style:"outline", cta:"Start Free",
    features:["Factorizer Engine","Reality Lens","PINK + VOLT + MOAT","PDF export"] },
  { id:"surge", name:"SURGE", price:"$20", period:"/mo", volts:"20 analyses/mo", badge:"Most Popular", style:"cyan", cta:"Start Surge",
    features:["Everything in SPARK","Intelligence Ledger","Compare mode","Team sharing"] },
  { id:"sovereign", name:"SOVEREIGN", price:"$79", period:"/mo", volts:"100 analyses/mo", badge:"For Investors", style:"gold", cta:"Request Access",
    features:["Everything in SURGE","Deal Room PDF format","API access","ARCHON Ψ cert"] },
];

const STEPS = [
  { n:"01", t:"Point", d:"Type any product, company, or technology. Upload a photo. No setup required." },
  { n:"02", t:"X-Ray", d:"NVIDIA NIM runs the 5-layer factorization — anatomy, process, economics, ecosystem, verdict — in 60 seconds." },
  { n:"03", t:"Decide", d:"Walk into any meeting with a PINK risk score, VOLT novelty rating, and a decision brief written for your deal room." },
];

const C = {
  bg:"#050a14", card:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
  cyan:"#00d4ff", gold:"#f59e0b", red:"#ef4444", green:"#10b981",
  text:"#f8fafc", muted:"rgba(255,255,255,0.45)", subtle:"rgba(255,255,255,0.15)",
};

function Bar({ score, max=10, color }: any) {
  return (
    <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${(score/max)*100}%`, background:color, borderRadius:2 }} />
    </div>
  );
}

function ScoreCard({ label, score, color, sub }: any) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"16px 18px", flex:1, minWidth:200 }}>
      <div style={{ fontSize:10, letterSpacing:"0.2em", color:C.muted, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:8 }}>
        <span style={{ fontSize:30, fontWeight:700, color, fontFamily:"monospace" }}>{score}</span>
        <span style={{ fontSize:13, color:C.subtle }}>/10</span>
      </div>
      <Bar score={score} color={color} />
      <div style={{ fontSize:11, color:C.muted, marginTop:8, lineHeight:1.4 }}>{sub}</div>
    </div>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  const go = () => {
    if (query.trim()) navigate(`/reality-lens?q=${encodeURIComponent(query.trim())}`);
    else navigate("/reality-lens");
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',system-ui,sans-serif", overflowX:"hidden" }}>
      <style>{`
        @keyframes scan { 0%{top:-1px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        input::placeholder{color:rgba(255,255,255,0.2)}
        button:hover{opacity:0.85;transition:opacity 0.15s}
      `}</style>

      {/* Scan line */}
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent)`, animation:"scan 7s linear infinite" }} />
      </div>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:58, borderBottom:`1px solid ${C.border}`, background:"rgba(5,10,20,0.93)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:28, height:28, background:`linear-gradient(135deg,${C.cyan},${C.gold})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>C</div>
            <span style={{ fontSize:14, fontWeight:800, letterSpacing:"0.06em" }}>CortexChain</span>
            <span style={{ fontSize:10, color:C.muted, letterSpacing:"0.16em", textTransform:"uppercase" }}>Intelligence</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => navigate("/analyze")} style={{ padding:"7px 14px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, fontSize:12, cursor:"pointer" }}>Factorizer</button>
            <button onClick={() => navigate("/reality-lens")} style={{ padding:"7px 14px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, fontSize:12, cursor:"pointer" }}>Reality Lens</button>
            <button onClick={() => navigate("/reality-lens")} style={{ padding:"7px 20px", background:C.cyan, border:"none", borderRadius:6, color:"#000", fontSize:12, fontWeight:700, cursor:"pointer" }}>Start Free</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 24px 80px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(0,212,255,0.05) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none", zIndex:1 }} />
        <div style={{ position:"absolute", top:"25%", left:"50%", transform:"translateX(-50%)", width:800, height:400, background:`radial-gradient(ellipse,rgba(0,212,255,0.05) 0%,transparent 70%)`, pointerEvents:"none", zIndex:1 }} />

        <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth:820, animation:"up 0.9s ease both" }}>
          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", background:"rgba(0,212,255,0.07)", border:`1px solid rgba(0,212,255,0.2)`, borderRadius:100, marginBottom:36, fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:C.cyan }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.cyan, animation:"blink 2s infinite" }} />
            NVIDIA Inception · ARCHON Ψ Standard · 19 Patents Pending
          </div>

          <h1 style={{ fontSize:"clamp(38px,6.5vw,74px)", fontWeight:900, lineHeight:1.02, marginBottom:22, letterSpacing:"-0.04em" }}>
            X-ray any product<br />
            <span style={{ background:`linear-gradient(120deg,${C.cyan} 30%,${C.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>before you invest in it</span>
          </h1>

          <p style={{ fontSize:"clamp(15px,2vw,19px)", color:C.muted, lineHeight:1.65, margin:"0 auto 44px", maxWidth:600 }}>
            The only system that surfaces the Critical Node of any product — the single point most likely to destroy your investment thesis — before a dollar of capital is committed.
          </p>

          <div style={{ display:"flex", gap:8, maxWidth:600, margin:"0 auto 12px" }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && go()}
              placeholder="Apple Vision Pro, Neuralink, Waymo, Tesla FSD..."
              style={{ flex:1, padding:"16px 20px", background:"rgba(255,255,255,0.05)", border:`1px solid rgba(0,212,255,0.28)`, borderRadius:8, color:C.text, fontSize:15, outline:"none", fontFamily:"inherit" }}
            />
            <button onClick={go} style={{ padding:"16px 28px", background:C.cyan, border:"none", borderRadius:8, color:"#000", fontSize:14, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap" }}>
              Run Analysis →
            </button>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, fontSize:12, color:C.subtle }}>
            <button onClick={() => navigate("/analyze")} style={{ background:"none", border:"none", color:C.subtle, cursor:"pointer", fontSize:12, textDecoration:"underline" }}>Upload photo instead</button>
            <span>·</span>
            <span>3 free analyses. No credit card.</span>
          </div>
        </div>
      </section>

      {/* LIVE OUTPUT DEMO */}
      <section style={{ padding:"80px 24px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:11, letterSpacing:"0.25em", textTransform:"uppercase", color:C.cyan, marginBottom:12 }}>Live Output · Sample Analysis</div>
          <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-0.025em" }}>60 seconds. One decision.</h2>
          <p style={{ color:C.muted, marginTop:10, fontSize:14 }}>Apple AirPods Pro 2 — actual report structure</p>
        </div>

        <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
          <ScoreCard label="PINK — Critical Risk" score={DEMO.pink.score} color={C.red} sub={DEMO.pink.node} />
          <ScoreCard label="VOLT — IP Novelty" score={DEMO.volt.score} color={C.cyan} sub={DEMO.volt.signal} />
          <ScoreCard label="MOAT — Defensibility" score={DEMO.moat.score} color={C.gold} sub={DEMO.moat.label} />
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:24, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
            <span style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:C.gold }}>PM Decision Brief</span>
            <span style={{ padding:"4px 12px", background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.25)`, borderRadius:100, fontSize:10, color:C.green, letterSpacing:"0.12em" }}>VERDICT: {DEMO.verdict}</span>
          </div>
          <p style={{ color:C.muted, fontSize:14, lineHeight:1.75, marginBottom:18 }}>{DEMO.brief}</p>
          <div style={{ display:"flex", gap:32, flexWrap:"wrap" }}>
            {[["COGS",DEMO.cogs,C.text],["Retail",DEMO.retail,C.text],["Gross Margin",`${DEMO.margin}%`,C.green]].map(([l,v,col]) => (
              <div key={l as string}>
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:C.subtle, textTransform:"uppercase", marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:22, fontWeight:800, fontFamily:"monospace", color:col as string }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center" }}>
          <button onClick={() => navigate("/reality-lens")} style={{ padding:"12px 32px", background:"transparent", border:`1px solid rgba(0,212,255,0.35)`, borderRadius:8, color:C.cyan, fontSize:13, cursor:"pointer" }}>
            Run a real analysis →
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"80px 24px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, letterSpacing:"0.25em", textTransform:"uppercase", color:C.cyan, marginBottom:10 }}>Protocol</div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-0.025em" }}>Three steps. One better decision.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:28 }}>
                <div style={{ fontSize:11, letterSpacing:"0.2em", color:C.cyan, marginBottom:14, fontFamily:"monospace" }}>{s.n}</div>
                <h3 style={{ fontSize:20, fontWeight:700, marginBottom:12 }}>{s.t}</h3>
                <p style={{ color:C.muted, fontSize:14, lineHeight:1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE-LANE PRICING */}
      <section style={{ padding:"80px 24px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, letterSpacing:"0.25em", textTransform:"uppercase", color:C.cyan, marginBottom:10 }}>Pricing</div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-0.025em" }}>One engine. Three lanes.</h2>
            <p style={{ color:C.muted, marginTop:10, fontSize:14 }}>Same X-ray. Different depth. Different deal size.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {LANES.map(lane => (
              <div key={lane.id} style={{ position:"relative", background:lane.style==="cyan"?"rgba(0,212,255,0.04)":C.card, border:`1px solid ${lane.style==="cyan"?"rgba(0,212,255,0.28)":lane.style==="gold"?"rgba(245,158,11,0.28)":C.border}`, borderRadius:10, padding:28 }}>
                {lane.badge && (
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", padding:"3px 14px", background:lane.style==="cyan"?C.cyan:C.gold, borderRadius:100, fontSize:10, fontWeight:700, color:"#000", letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>
                    {lane.badge}
                  </div>
                )}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:C.muted, marginBottom:8 }}>{lane.name}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:2, marginBottom:4 }}>
                    <span style={{ fontSize:38, fontWeight:900, fontFamily:"monospace" }}>{lane.price}</span>
                    <span style={{ fontSize:14, color:C.muted }}>{lane.period}</span>
                  </div>
                  <div style={{ fontSize:12, color:C.cyan }}>{lane.volts}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{ lane.id==="spark"?"Run your first X-ray":lane.id==="surge"?"For strategy teams":"Deal room grade"}</div>
                </div>
                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:18, marginBottom:22 }}>
                  {lane.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                      <div style={{ width:14, height:14, borderRadius:"50%", background:"rgba(0,212,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:8, color:C.cyan }}>✓</div>
                      <span style={{ fontSize:13, color:C.muted }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/reality-lens")}
                  style={{ width:"100%", padding:"13px", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", background:lane.style==="cyan"?C.cyan:lane.style==="gold"?C.gold:"transparent", border:lane.style==="outline"?`1px solid ${C.border}`:"none", color:lane.style==="outline"?C.text:"#000" }}
                >
                  {lane.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ padding:"44px 24px", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:40 }}>
          {[["NVIDIA","Inception Member"],["ARCHON Ψ","Judgment Standard"],["19 Patents","Pending"],["NIM Models","Nemotron · Phi-3.5V"],["CortexChain","Inc. · Waveform Tech"]].map(([l,s]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:13, fontWeight:700, letterSpacing:"0.04em" }}>{l}</div>
              <div style={{ fontSize:10, color:C.subtle, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding:"100px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(28px,4.5vw,52px)", fontWeight:900, marginBottom:20, letterSpacing:"-0.04em", lineHeight:1.05 }}>
            What does your<br />
            <span style={{ background:`linear-gradient(120deg,${C.cyan},${C.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>next $50M decision</span>
            <br />look like with an X-ray?
          </h2>
          <p style={{ color:C.muted, fontSize:16, lineHeight:1.65, marginBottom:40 }}>
            Three free analyses. No credit card. The same intelligence infrastructure Moody's wishes it had built for products.
          </p>
          <button onClick={() => navigate("/reality-lens")} style={{ padding:"18px 48px", background:C.cyan, border:"none", borderRadius:8, color:"#000", fontSize:16, fontWeight:900, cursor:"pointer", letterSpacing:"0.05em" }}>
            Run Your First X-ray →
          </button>
          <div style={{ marginTop:14, fontSize:12, color:C.subtle }}>60 seconds. No setup. No card.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"28px 24px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:11, color:C.subtle }}>© 2026 CortexChain, Inc. · Waveform Tech LLC · ARCHON Ψ (Hines, B.) · Powered by NVIDIA NIM</div>
          <div style={{ display:"flex", gap:20 }}>
            {["Privacy","Terms","API Docs","Deal Room"].map(l => <span key={l} style={{ fontSize:11, color:C.subtle, cursor:"pointer" }}>{l}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
