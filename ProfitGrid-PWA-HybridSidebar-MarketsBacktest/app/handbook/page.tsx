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
  category: "Technical / SMC" | "Risk & Rules" | "Psychology & Mindset" | "Checklists";
  summary: string;
  readTime: string;
  content: string[];
  checklist?: string[];
};

const ARTICLES: Article[] = [
  {
    id: "fvg-guide",
    title: "Fair Value Gaps (FVG) & Imbalance",
    category: "Technical / SMC",
    summary: "How to identify price displacement, three-candle imbalances, and high-probability entry zones.",
    readTime: "4 min read",
    content: [
      "A Fair Value Gap (FVG) occurs when institutional order flow enters the market with such aggressive momentum that a three-candle sequence leaves a gap where either buyers or sellers were completely unable to transact.",
      "To identify a Bullish FVG: Look at three consecutive candles during displacement. The high of Candle 1 does not overlap with the low of Candle 3, leaving an open void on Candle 2's body.",
      "How to trade FVGs in ProfitGrid: Mark up the FVG zone on your 15m or 1h chart. When price retraces into the top 50% (Consequent Encroachment) of the gap during London or New York open, look for a lower timeframe Break of Structure (BOS) before entering.",
    ],
    checklist: [
      "Is the FVG formed after a clear liquidity sweep?",
      "Does the FVG align with the daily session directional bias?",
      "Is price retracing into Consequent Encroachment (50% level)?",
      "Is your Stop Loss placed safely below the swing low / order block?",
    ],
  },
  {
    id: "market-structure",
    title: "Market Structure & BOS vs CHoCH",
    category: "Technical / SMC",
    summary: "Mastering higher highs, lower lows, Break of Structure (BOS), and Change of Character (CHoCH).",
    readTime: "5 min read",
    content: [
      "Market structure is the absolute foundation of price action. In a bullish trend, price creates Higher Highs (HH) and Higher Lows (HL). A valid Break of Structure (BOS) occurs when a candle body closes above the previous swing high.",
      "Change of Character (CHoCH): When price breaks below the most recent Higher Low that led to the highest high, institutional flow is signaling a potential trend reversal.",
      "Pro Tip: Never confuse internal minor structure on a 1m chart with macro structure on a 1H/4H chart. Always establish your bias on the 4H and execute on the 5m/15m.",
    ],
    checklist: [
      "Have you checked the 4H timeframe for macro structural trend?",
      "Did the breakout candle close with body displacement (not just a wick)?",
      "Are you trading in the direction of the dominant session flow?",
    ],
  },
  {
    id: "liquidity-sweeps",
    title: "Liquidity Pools & Stop Runs",
    category: "Technical / SMC",
    summary: "Where retail stops sit and how algorithms hunt equal highs, equal lows, and session extremes.",
    readTime: "6 min read",
    content: [
      "Markets move from one liquidity pool to the next. Equal Highs (EQH) and Equal Lows (EQL) act as magnets because retail breakout traders and swing traders cluster their stop losses precisely above or below those levels.",
      "The Asian Session range often builds a tight box of buy-side and sell-side liquidity. At London Open (07:00 UTC), algorithms frequently sweep one side of the Asian high/low before initiating the real move of the day.",
    ],
    checklist: [
      "Has Asian high or low been taken prior to your entry?",
      "Did price reject immediately after sweeping the liquidity pool?",
      "Are there obvious equal highs targeting your Take Profit?",
    ],
  },
  {
    id: "order-blocks",
    title: "Institutional Order Blocks (OB)",
    category: "Technical / SMC",
    summary: "Identifying the last down-candle before aggressive institutional buying (or last up-candle before selling).",
    readTime: "4 min read",
    content: [
      "An Order Block represents the precise price footprint where major institutions accumulated their positions before igniting a massive market impulse.",
      "A high-probability Bullish Order Block is the last bearish candle prior to a strong bullish move that breaks structure (BOS) and creates a Fair Value Gap.",
    ],
  },
  {
    id: "prop-firm-rules",
    title: "Prop Firm Constitution & Drawdown Math",
    category: "Risk & Rules",
    summary: "Survival guide for FTMO, Apex, TopStep, and FundedNext limits. Master trailing vs static drawdown.",
    readTime: "7 min read",
    content: [
      "Over 90% of prop firm challenges fail not because of a bad strategy, but due to breaching Daily Loss or Maximum Drawdown rules during emotional tilt.",
      "Daily Maximum Loss (e.g. 5%): This includes closed P&L plus floating open equity drawdown across your active account. Always stop trading after losing 2R in a single day.",
      "ProfitGrid Risk Rule Engine: Set up your rules in the Analytics & Profile tabs. Our dashboard tracks your real-time drawdown against your starting balance to protect your funded status.",
    ],
    checklist: [
      "Did you check economic news calendar before session start?",
      "Is your total daily risk capped strictly under 2% to 3%?",
      "Do you have static stop losses set immediately upon order execution?",
    ],
  },
  {
    id: "risk-management",
    title: "The 1% Rule & Asymmetric Expectancy",
    category: "Risk & Rules",
    summary: "Why a 40% win rate strategy with a 2.5R average risk-to-reward makes you consistently profitable.",
    readTime: "5 min read",
    content: [
      "Expectancy = (Win Rate × Average Win) - (Loss Rate × Average Loss). If your average win is $250 (2.5R) and average loss is $100 (1R), even winning only 4 out of 10 trades yields a net positive expectancy of +$400 every 10 trades.",
      "Never risk more than 1% per trade on a live account (or 0.5% on a funded prop challenge). Position sizing must be adjusted based on stop loss pips, never fixed lot sizes.",
    ],
  },
  {
    id: "trading-psychology",
    title: "Overcoming FOMO, Revenge Trading & Tilt",
    category: "Psychology & Mindset",
    summary: "Neurological triggers of losses, accepting uncertainty, and executing like a casino rather than a gambler.",
    readTime: "6 min read",
    content: [
      "After a painful loss, the amygdala triggers a fight-or-flight response. Revenge trading is the desperate attempt to force the market to give back what was lost right immediately.",
      "The Casino Mindset: A casino doesn't get angry when a player hits a jackpot at the roulette table. They know that over 10,000 spins, their 52% mathematical edge guarantees profitability. Treat every individual trade as just one random sample in your 100-trade playbook.",
    ],
    checklist: [
      "Am I taking this trade out of FOMO because I missed the initial move?",
      "Am I calm, rested, and detached from the monetary outcome?",
      "Did I log my pre-session emotional score in my ProfitGrid journal?",
    ],
  },
  {
    id: "journaling-mastery",
    title: "Structured Journaling & Weekly Audits",
    category: "Psychology & Mindset",
    summary: "Why top 1% institutional traders review every single execution with markups and checklists.",
    readTime: "4 min read",
    content: [
      "If you cannot measure your habits, you cannot improve your edge. A trading journal is not just a list of numbers; it is your business ledger and diagnostic laboratory.",
      "Weekly Review Habit: Every Saturday morning, open ProfitGrid's Reviews module. Filter your trades by 'Losses' and inspect your screenshots. Did you break your rules or was it a high-quality losing setup?",
    ],
  },
];

export default function HandbookPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selectedArticle, setSelectedArticle] = useState<Article>(ARTICLES[0]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({ "fvg-guide": true, "prop-firm-rules": true });
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
    <AppShell title="Trading Handbook & Rules" subtitle="SMC education • prop firm rules • interactive checklists • psychology">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 font-sans">
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-soft rounded-3xl p-5 border border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[rgb(var(--muted))]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FVG, Liquidity, Prop Rules, Tilt..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {["All", "Technical / SMC", "Risk & Rules", "Psychology & Mindset", "Bookmarks"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                    category === c ? "bg-purple-500/20 border border-purple-500/40 text-purple-200" : "bg-white/5 hover:bg-white/10 text-[rgb(var(--muted))]"
                  }`}
                >
                  {c === "Bookmarks" ? "★ Bookmarked" : c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((art) => {
              const active = selectedArticle.id === art.id;
              const isBm = bookmarks[art.id];
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className={`glass rounded-3xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                    active ? "bg-purple-500/15 border-purple-500/40 shadow-lg" : "border-white/10 hover:border-white/20 bg-white/5"
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
                <div className="mt-3 text-2xl font-extrabold tracking-tight">{selectedArticle.title}</div>
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
              <div className="mt-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 p-6 space-y-4">
                <div className="flex items-center gap-2 text-base font-bold text-purple-300">
                  <CheckSquare className="h-5 w-5" /> Interactive Pre-Entry Checklist
                </div>
                <div className="text-xs text-[rgb(var(--muted))]">
                  Check off each rule before placing your trade to verify alignment with institutional flow.
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
            <span>ProfitGrid Integrated Education Handbook</span>
            <button
              onClick={() => alert("Bookmark saved to your cloud profile! Access anytime during live review.")}
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
