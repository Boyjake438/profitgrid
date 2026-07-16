"use client";

import React, { useMemo, useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import {
  BookOpen,
  Search,
  Bookmark,
  CheckSquare,
  ShieldAlert,
  Brain,
  TrendingUp,
  Layers,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Award,
  Filter,
} from "lucide-react";

type Article = {
  id: string;
  title: string;
  category: "ICT Concepts & SMC" | "ICT Execution Models" | "Risk & Prop Rules" | "Psychology & Mindset";
  summary: string;
  readTime: string;
  content: string[];
  checklist?: string[];
};

const ARTICLES: Article[] = [
  {
    id: "ict-liquidity-killzones",
    title: "ICT Liquidity Pools & Killzone Sweeps (BSL / SSL)",
    category: "ICT Concepts & SMC",
    summary: "How algorithms engineer Buy-Side Liquidity (BSL) & Sell-Side Liquidity (SSL) and trap retail in Killzones.",
    readTime: "6 min read",
    content: [
      "In Michael J. Huddleston's (Inner Circle Trader) methodology, price delivery is completely algorithmic. The interbank delivery algorithm has only two objectives: 1) Rebalance price inefficiencies (Fair Value Gaps), and 2) Seek liquidity pools.",
      "Buy-Side Liquidity (BSL) sits directly above Equal Highs (EQH) and previous session/daily/weekly swing highs because retail short sellers place their buy-stop loss orders above those levels.",
      "Sell-Side Liquidity (SSL) sits directly below Equal Lows (EQL) and previous swing lows because retail buyers place their sell-stop orders there.",
      "The Judas Swing & Killzones: During the London Open Killzone (02:00 - 05:00 EST) and New York Open Killzone (07:00 - 10:00 EST), the algorithm engineers a false breakout (Judas Swing) that sweeps BSL or SSL to accumulate institutional inventory before reversing aggressively in the true intended daily direction.",
    ],
    checklist: [
      "Are you currently inside an ICT Killzone (London 02:00-05:00 EST or NY 07:00-10:00 EST)?",
      "Has a major Buy-Side (BSL) or Sell-Side (SSL) liquidity pool been swept?",
      "Did price reject immediately after taking the liquidity without continuing higher/lower?",
      "Are there opposing equal highs/lows acting as the target draw on liquidity?",
    ],
  },
  {
    id: "ict-fvg-bisi-sibi",
    title: "ICT Fair Value Gaps (FVG) & BISI / SIBI",
    category: "ICT Concepts & SMC",
    summary: "Mastering three-candle imbalances, Buyside Imbalance Sellside Inefficiency (BISI), and Consequent Encroachment.",
    readTime: "5 min read",
    content: [
      "An ICT Fair Value Gap (FVG) is a specific three-candle price sequence where institutional order flow enters with such aggressive displacement that one side of the market is completely absent.",
      "BISI (Buyside Imbalance Sellside Inefficiency): A Bullish FVG where candle 1's high and candle 3's low leave an open void across candle 2's body. Only buyers transacted; sellers were unable to participate.",
      "SIBI (Sellside Imbalance Buyside Inefficiency): A Bearish FVG where candle 1's low and candle 3's high leave an open void across candle 2's body. Only sellers transacted.",
      "Consequent Encroachment (CE): The exact 50% midpoint of the Fair Value Gap body. Institutions use CE as a precision execution level. When price retraces into the CE of a high-timeframe FVG inside a Killzone, expect immediate algorithmic reaction.",
    ],
    checklist: [
      "Is the FVG formed by energetic candle displacement (large bodies, minimal wicks)?",
      "Have you marked the 50% midpoint (Consequent Encroachment - CE) level?",
      "Does this FVG reside inside a Discount array (for longs) or Premium array (for shorts)?",
    ],
  },
  {
    id: "ict-order-blocks-breakers",
    title: "ICT Order Blocks, Breakers & Mitigation",
    category: "ICT Concepts & SMC",
    summary: "Institutional accumulation footprints, Mean Thresholds, and Breaker Block polarity flips.",
    readTime: "6 min read",
    content: [
      "An ICT Order Block is not just any red or green candle before a move. A true high-probability Bullish Order Block is the lowest down-candle prior to energetic upward displacement that breaks structure (MSS) and leaves a Fair Value Gap.",
      "Mean Threshold: The 50% midpoint of the Order Block's real body. For a valid bullish order block, price should never close below the Mean Threshold during a retracement.",
      "ICT Breaker Block: When a high-timeframe liquidity sweep occurs and an existing order block fails (is broken through with displacement), that broken block flips polarity. A Bullish Breaker is the highest up-candle prior to the lowest swing low that swept SSL before reversing above the swing high.",
      "Mitigation Block: Similar to a Breaker Block, but occurs when price fails to take out the previous swing high or low before reversing through the order block.",
    ],
    checklist: [
      "Did the Order Block cause a Market Structure Shift (MSS) with displacement?",
      "Does the Order Block have an open Fair Value Gap attached directly above/below it?",
      "Is price respecting the Mean Threshold (50% level of the OB body)?",
    ],
  },
  {
    id: "ict-mss-displacement",
    title: "ICT Market Structure Shift (MSS) & Displacement",
    category: "ICT Concepts & SMC",
    summary: "Differentiating between minor internal structure vs. true institutional structural shifts.",
    readTime: "4 min read",
    content: [
      "A true ICT Market Structure Shift (MSS) occurs ONLY after price has tapped into a higher-timeframe point of interest (PD Array) or swept Buy-Side/Sell-Side Liquidity.",
      "Dis Displacement: The most critical requirement for an MSS is displacement—large, high-energy institutional candles closing beyond the previous swing high or low. If price merely wicks above/below a swing without body displacement, it is often just another liquidity sweep rather than a true structure shift.",
    ],
  },
  {
    id: "ict-silver-bullet-model",
    title: "ICT 2022 Mentorship Silver Bullet Model",
    category: "ICT Execution Models",
    summary: "The repeatable institutional execution template for 10:00 AM EST and London Killzones.",
    readTime: "7 min read",
    content: [
      "The ICT Silver Bullet is a time-based execution model that repeats almost daily within specific 60-minute windows: 1) London Open Silver Bullet (03:00 - 04:00 AM EST), and 2) NY AM Silver Bullet (10:00 - 11:00 AM EST).",
      "Step 1 (Time & Draw): Wait until exactly 10:00 AM EST. Identify where the nearest Buy-Side Liquidity (BSL) or Sell-Side Liquidity (SSL) resides.",
      "Step 2 (The Sweep): Watch price sweep either BSL or SSL after 10:00 AM.",
      "Step 3 (The Shift): On the 1m, 3m, or 5m chart, wait for a Market Structure Shift (MSS) with clear displacement that creates a Fair Value Gap (FVG).",
      "Step 4 (Execution & Target): Enter a limit order at the FVG Consequent Encroachment (or open edge). Place Stop Loss just beyond the sweep extreme. Target the opposing liquidity pool for a minimum 2R to 3R payoff.",
    ],
    checklist: [
      "Is the time strictly within the 10:00 AM - 11:00 AM EST window (or 03:00 - 04:00 AM London)?",
      "Did price sweep Buy-Side or Sell-Side Liquidity within this window?",
      "Did a clear 1m/3m/5m Market Structure Shift occur with an open FVG?",
      "Is your Take Profit targeting obvious opposing liquidity at a minimum of 2:1 R:R?",
    ],
  },
  {
    id: "ict-power-of-three-amd",
    title: "ICT Daily Bias & Power of Three (AMD)",
    category: "ICT Execution Models",
    summary: "Accumulation, Manipulation, and Distribution across daily open price and session killzones.",
    readTime: "5 min read",
    content: [
      "The ICT Power of Three (AMD) explains how institutional daily candles are constructed: Accumulation, Manipulation, and Distribution.",
      "In a Bullish Daily Profile: 1) Accumulation happens during the Asian range near the New York Midnight Open (00:00 EST). 2) Manipulation happens at London Open or NY 08:30 AM when price drops BELOW the midnight open (forming the daily low / Judas Swing) to trap short sellers and sweep SSL. 3) Distribution happens when price expands aggressively upwards through New York lunch and closes near the daily high.",
      "Golden Rule of AMD: If your daily bias is bullish, NEVER buy above the 00:00 Midnight Open price during accumulation. Always wait for the manipulation drop into Discount below the midnight open before initiating longs.",
    ],
    checklist: [
      "Have you marked the exact 00:00 Midnight EST Open price on your chart?",
      "If Bullish Bias: Has price manipulated and dropped BELOW the midnight open price?",
      "If Bearish Bias: Has price manipulated and spiked ABOVE the midnight open price?",
    ],
  },
  {
    id: "ict-ote-premium-discount",
    title: "ICT Optimal Trade Entry (OTE) & PD Arrays",
    category: "ICT Execution Models",
    summary: "The institutional pricing matrix using 62% - 79% Fibonacci retracements and OTE precision.",
    readTime: "5 min read",
    content: [
      "Institutions buy in Discount arrays and sell in Premium arrays. To define Premium and Discount, draw a Fibonacci grid from the major swing low to swing high of the current dealing range.",
      "50% Equilibrium: Any price above 50% is Premium (look only for short/sell setups). Any price below 50% is Discount (look only for long/buy setups).",
      "Optimal Trade Entry (OTE): The precision Fibonacci zone between the 62% and 79% retracement levels, with the 70.5% level acting as the exact institutional sweet spot. When an OTE zone aligns directly with a Fair Value Gap or Order Block inside Discount/Premium, you have high-probability institutional confluence.",
    ],
    checklist: [
      "Have you drawn the dealing range from confirmed swing low to swing high?",
      "Is your Long entry strictly below the 50% Equilibrium level (inside Discount)?",
      "Does the 62% - 79% OTE Fibonacci zone overlap with a clear FVG or Order Block?",
    ],
  },
  {
    id: "ict-prop-firm-defense",
    title: "ICT Risk Defense for Funded Prop Accounts",
    category: "Risk & Prop Rules",
    summary: "Why ICT methodology requires strict 0.5% risk limits and disciplined killzone patience.",
    readTime: "5 min read",
    content: [
      "Michael Huddleston constantly emphasizes that capital preservation is far more important than high win rates. In prop firm challenges (FTMO, Apex, TopStep), maximum daily drawdown limits can be breached instantly during emotional revenge trading.",
      "The 0.5% Execution Rule: On a $100,000 funded account, 0.5% risk equals $500 per trade. By risking only 0.5%, you can endure 10 consecutive losing setups while only drawing down 5% of your capital—leaving your funded account completely safe and active.",
      "If you miss the morning Killzone (07:00 - 10:00 AM EST), close your charts. Never force setups during low-volume lunchtime chop (12:00 - 13:00 EST).",
    ],
    checklist: [
      "Is your total position risk capped strictly at or below 0.5% to 1.0%?",
      "Did you check forexfactory / economic news before entering during 08:30 AM EST red folders?",
      "Have you logged your exact trade markup and ICT model in ProfitGrid?",
    ],
  },
];

export default function HandbookPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selectedArticle, setSelectedArticle] = useState<Article>(ARTICLES[0]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({ "ict-silver-bullet-model": true, "ict-liquidity-killzones": true });
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const bm = localStorage.getItem("pg_handbook_bookmarks");
      if (bm) {
        try {
          setBookmarks(JSON.parse(bm));
        } catch {}
      }
    }
  }, []);

  const toggleBookmark = (id: string) => {
    const next = { ...bookmarks, [id]: !bookmarks[id] };
    setBookmarks(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("pg_handbook_bookmarks", JSON.stringify(next));
    }
  };

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchQuery =
        !query.trim() ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.summary.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "All" || (category === "Bookmarks" ? bookmarks[a.id] : a.category === category);
      return matchQuery && matchCat;
    });
  }, [query, category, bookmarks]);

  return (
    <AppShell title="ICT Concepts & Trading Handbook" subtitle="SMC & Inner Circle Trader mentorship • Silver Bullet • OTE • Killzones">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-sans">
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-soft rounded-3xl p-5 border border-white/10 space-y-3 shadow-xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[rgb(var(--muted))]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FVG, Killzone, Silver Bullet, OTE..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {["All", "ICT Concepts & SMC", "ICT Execution Models", "Risk & Prop Rules", "Bookmarks"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                    category === c ? "bg-purple-500/20 border border-purple-500/40 text-purple-200 shadow-sm" : "bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))]"
                  }`}
                >
                  {c === "Bookmarks" ? "★ Bookmarked" : c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filtered.map((art) => {
              const active = selectedArticle.id === art.id;
              const isBm = bookmarks[art.id];
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className={`glass rounded-3xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                    active ? "bg-purple-500/15 border-purple-500/40 shadow-xl" : "border-white/10 hover:border-white/20 bg-white/5"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-300">
                        {art.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(art.id);
                        }}
                        className="text-[rgb(var(--muted))] hover:text-amber-400 transition"
                      >
                        <Bookmark className={`h-4 w-4 ${isBm ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                    </div>

                    <div className="mt-3 text-sm font-bold text-white leading-snug">{art.title}</div>
                    <div className="mt-1 text-xs text-[rgb(var(--muted))] line-clamp-2">{art.summary}</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[rgb(var(--muted))]">
                    <span>⏱ {art.readTime}</span>
                    <span className="text-purple-400 font-semibold flex items-center gap-1">
                      Read Guide <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 glass rounded-3xl p-7 border border-white/10 flex flex-col justify-between space-y-6 shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-[11px] font-bold text-purple-300 uppercase">
                  {selectedArticle.category}
                </span>
                <div className="mt-3 text-2xl font-extrabold tracking-tight text-white">{selectedArticle.title}</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">{selectedArticle.summary} • {selectedArticle.readTime}</div>
              </div>

              <button
                onClick={() => toggleBookmark(selectedArticle.id)}
                className={`rounded-2xl p-3 border transition ${
                  bookmarks[selectedArticle.id]
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-white/5 border-white/10 text-[rgb(var(--muted))] hover:text-white"
                }`}
              >
                <Bookmark className={`h-5 w-5 ${bookmarks[selectedArticle.id] ? "fill-amber-400" : ""}`} />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-200">
              {selectedArticle.content.map((p, i) => (
                <p key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  {p}
                </p>
              ))}
            </div>

            {selectedArticle.checklist && (
              <div className="mt-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-base font-bold text-purple-300">
                  <CheckSquare className="h-5 w-5" /> ICT Model Execution Checklist
                </div>
                <div className="text-xs text-[rgb(var(--muted))]">
                  Verify every institutional confluence point before placing limit orders inside your active session killzone.
                </div>

                <div className="space-y-2.5 pt-2">
                  {selectedArticle.checklist.map((item, idx) => {
                    const key = `${selectedArticle.id}-check-${idx}`;
                    const checked = checklistProgress[key] || false;
                    return (
                      <div
                        key={idx}
                        onClick={() => setChecklistProgress((prev) => ({ ...prev, [key]: !checked }))}
                        className={`flex items-center gap-3 rounded-2xl p-3.5 border transition cursor-pointer select-none ${
                          checked ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200" : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-lg flex items-center justify-center border shrink-0 transition ${
                            checked ? "bg-emerald-500 border-emerald-400 text-black" : "border-white/30 bg-white/5"
                          }`}
                        >
                          {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span className={`text-xs font-medium ${checked ? "line-through opacity-80" : ""}`}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
            <span>ProfitGrid • Authentic Inner Circle Trader (ICT) Mentorship Reference</span>
            <button
              onClick={() => alert("ICT execution guide & checklist bookmarked to your active trader profile! ✅")}
              className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-white transition"
            >
              Save Guide to Profile ✅
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
