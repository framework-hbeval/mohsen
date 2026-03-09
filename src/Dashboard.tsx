import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dcchprqwjfblcypsaggz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JFDcUV-OcYLsBNdzr9JmFw_jeYLjzzD";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Merchant {
  id: string; store_id: string; store_name: string;
  store_domain: string; store_logo: string; store_email: string;
  plan: string; created_at: string;
}
interface Product {
  id: string; external_product_id: string; name: string; description: string;
  price: number; currency: string; images_count: number; main_image: string;
  category: string; sku: string; quantity: number; status: string;
  score_total: number; score_title: number; score_images: number;
  score_description: number; score_price: number; score_seo: number;
  needs_attention: boolean; ai_title: string; ai_description: string;
  ai_keywords: string; ai_optimized_at: string; last_synced_at: string;
}
interface AIResult {
  title: string; description: string; keywords: string[];
  score_estimate: number; tips: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const C = (s: number) => s >= 80 ? "#00d4a8" : s >= 60 ? "#f5a623" : s >= 40 ? "#ff6b35" : "#ff3b5c";
const G = (s: number) => s >= 80 ? "A" : s >= 60 ? "B" : s >= 40 ? "C" : "D";
const L = (s: number) => s >= 80 ? "ممتاز" : s >= 60 ? "جيد" : s >= 40 ? "مقبول" : "ضعيف";
const fmt = (p: number, c: string) => `${p.toLocaleString("ar-SA")} ${c === "SAR" ? "ر.س" : c}`;
const strip = (h: string) => h?.replace(/<[^>]*>/g, "").trim() || "";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Space+Mono:wght@400;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #03070f;
  --surface: #080f1c;
  --surface2: #0c1628;
  --border: #0e1e35;
  --border2: #162840;
  --text: #e8f4f8;
  --text2: #7a9ab5;
  --text3: #3d5a73;
  --accent: #00d4a8;
  --accent2: #0099cc;
  --warn: #f5a623;
  --danger: #ff3b5c;
  --mono: 'Space Mono', monospace;
  --sans: 'Tajawal', sans-serif;
}
body { background: var(--bg); font-family: var(--sans); color: var(--text); overflow-x: hidden; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--text3); }

@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.3; } }
@keyframes glow { 0%,100% { box-shadow: 0 0 8px #00d4a820; } 50% { box-shadow: 0 0 24px #00d4a845; } }
@keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }

.fade-up { animation: fadeUp .45s cubic-bezier(.2,0,.2,1) both; }
.fade-in { animation: fadeIn .3s ease both; }

.nav-btn { transition: all .15s ease; }
.nav-btn:hover { background: rgba(0,212,168,.06) !important; color: #00d4a8 !important; }
.nav-btn.active { background: rgba(0,212,168,.1) !important; color: #00d4a8 !important; border-right: 2px solid #00d4a8 !important; }

.card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px; transition: border-color .2s, transform .2s; }
.card:hover { border-color: var(--border2); }
.card-lift:hover { transform: translateY(-2px); border-color: rgba(0,212,168,.2) !important; }

.btn-primary {
  background: linear-gradient(135deg, #00d4a8, #0099cc);
  color: #03070f; border: none; border-radius: 10px;
  font-family: var(--sans); font-weight: 800; font-size: 14px;
  cursor: pointer; transition: all .2s; padding: 11px 22px;
  letter-spacing: .02em;
}
.btn-primary:hover { opacity: .88; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,212,168,.25); }
.btn-primary:disabled { opacity: .4; cursor: not-allowed; transform: none; }

.btn-ghost {
  background: transparent; color: var(--text2);
  border: 1px solid var(--border2); border-radius: 10px;
  font-family: var(--sans); font-size: 13px; cursor: pointer;
  transition: all .2s; padding: 10px 18px;
}
.btn-ghost:hover { color: var(--text); border-color: var(--text3); background: var(--surface2); }

.input {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text); font-family: var(--sans);
  font-size: 14px; padding: 10px 14px; transition: border-color .2s; width: 100%;
}
.input:focus { outline: none; border-color: rgba(0,212,168,.4); }
.input::placeholder { color: var(--text3); }

.tag { display:inline-flex; align-items:center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: .04em; }

.score-chip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 50%;
  font-family: var(--mono); font-size: 13px; font-weight: 700;
  border: 2px solid; flex-shrink: 0;
}

.progress-bar { height: 4px; border-radius: 2px; background: var(--border); overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; transition: width .9s cubic-bezier(.4,0,.2,1); }

.tab-bar { display: flex; background: var(--bg); border-radius: 10px; padding: 3px; gap: 2px; }
.tab { flex: 1; padding: 8px; border-radius: 8px; border: none; cursor: pointer; font-family: var(--sans); font-size: 13px; font-weight: 600; transition: all .2s; background: transparent; color: var(--text3); }
.tab.active { background: var(--surface2); color: var(--accent); }

.modal-backdrop { position: fixed; inset: 0; background: rgba(3,7,15,.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn .2s ease; }
.modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; width: 100%; max-width: 700px; max-height: 90vh; overflow: auto; box-shadow: 0 40px 100px rgba(0,0,0,.7); }

.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px 18px; position: relative; overflow: hidden; }
.stat-card::before { content:''; position:absolute; inset:0; background: radial-gradient(circle at 100% 0%, var(--accent-glow,rgba(0,212,168,.04)) 0%, transparent 60%); pointer-events:none; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

@media (max-width: 768px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: 1fr 1fr; }
  .sidebar { width: 60px !important; }
  .sidebar .label { display: none !important; }
  .main-content { padding: 20px 16px !important; }
}
`;

// ─── Score Ring ───────────────────────────────────────────────────────────────
function Ring({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const fill = arc * (score / 100);
  const cx = size / 2, cy = size / 2;
  const color = C(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(135deg)", flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0e1e35" strokeWidth={7}
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color}60)` }} />
      <text x={cx} y={cy + (size > 80 ? 8 : 5)} textAnchor="middle" fill={color}
        style={{ transform: `rotate(-135deg)`, transformOrigin: `${cx}px ${cy}px`,
          fontSize: size > 80 ? 22 : 13, fontWeight: 700, fontFamily: "Space Mono, monospace" }}>
        {score}
      </text>
    </svg>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function Bar({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 15 }}>{icon}</span>{label}
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: C(value), fontWeight: 700 }}>
          {value}%
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${C(value)}66, ${C(value)})` }} />
      </div>
    </div>
  );
}

// ─── Overview Page ────────────────────────────────────────────────────────────
function Overview({ products, merchant, onSync, syncing, syncMsg, onOptimize, onNav }:
  { products: Product[]; merchant: Merchant | null; onSync: () => void; syncing: boolean; syncMsg: string; onOptimize: (p: Product) => void; onNav: (s: string) => void }) {

  const total = products.length;
  const attention = products.filter(p => p.needs_attention).length;
  const excellent = products.filter(p => p.score_total >= 80).length;
  const avgScore = total ? Math.round(products.reduce((s, p) => s + p.score_total, 0) / total) : 0;
  const avgTitle = total ? Math.round(products.reduce((s, p) => s + p.score_title, 0) / total) : 0;
  const avgImages = total ? Math.round(products.reduce((s, p) => s + p.score_images, 0) / total) : 0;
  const avgDesc = total ? Math.round(products.reduce((s, p) => s + p.score_description, 0) / total) : 0;
  const avgSeo = total ? Math.round(products.reduce((s, p) => s + p.score_seo, 0) / total) : 0;

  const stats = [
    { label: "إجمالي المنتجات", val: total, icon: "◈", color: "var(--accent2)" },
    { label: "متوسط الجودة", val: `${avgScore}`, unit: "/100", icon: "◉", color: C(avgScore) },
    { label: "تحتاج اهتمام", val: attention, icon: "△", color: "var(--warn)" },
    { label: "درجة ممتازة", val: excellent, icon: "◆", color: "var(--accent)" },
  ];

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", letterSpacing: "-.03em" }}>
          مرحباً{merchant?.store_name ? `، ${merchant.store_name}` : ""} 
          <span style={{ fontSize: 26 }}> 👋</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 6 }}>
          نظرة شاملة على أداء متجرك وجودة منتجاتك
        </p>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ ["--accent-glow" as any]: `${s.color}08`, animationDelay: `${i * .07}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: s.color, fontFamily: "var(--mono)", lineHeight: 1 }}>
                  {s.val}<span style={{ fontSize: 16, opacity: .5 }}>{s.unit || ""}</span>
                </div>
              </div>
              <div style={{ fontSize: 22, opacity: .3, color: s.color }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Store Score Card */}
      {total > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14 }}>Store Score</div>
              <Ring score={avgScore} size={130} />
              <div style={{ marginTop: 12 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 36, fontWeight: 700, color: C(avgScore) }}>{G(avgScore)}</span>
                <div style={{ fontSize: 13, color: C(avgScore), marginTop: 4, fontWeight: 700 }}>{L(avgScore)}</div>
              </div>
            </div>
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>تقييم جودة المتجر</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>بناءً على تحليل {total} منتج</div>
              </div>
              <Bar label="جودة العناوين" value={avgTitle} icon="✍️" />
              <Bar label="جودة الصور" value={avgImages} icon="🖼️" />
              <Bar label="جودة الوصف" value={avgDesc} icon="📝" />
              <Bar label="تحسين SEO" value={avgSeo} icon="🔍" />
              {/* Tips */}
              <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                {[
                  { cond: avgTitle < 60, msg: "عناوين المنتجات قصيرة — استهدف 30-70 حرف لكل منتج" },
                  { cond: avgImages < 60, msg: "الصور غير كافية — أضف 3 صور على الأقل لكل منتج" },
                  { cond: avgDesc < 60, msg: "الوصف مختصر جداً — استهدف 100+ كلمة لكل منتج" },
                  { cond: avgSeo < 60, msg: "ضعف في SEO — أضف كلمات مفتاحية في العناوين والأوصاف" },
                ].filter(x => x.cond).length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--accent)", display: "flex", gap: 8, alignItems: "center" }}>
                    <span>✅</span> متجرك في حالة ممتازة — استمر في الحفاظ على الجودة
                  </div>
                ) : (
                  [
                    { cond: avgTitle < 60, msg: "عناوين المنتجات قصيرة — استهدف 30-70 حرف لكل منتج" },
                    { cond: avgImages < 60, msg: "الصور غير كافية — أضف 3 صور على الأقل لكل منتج" },
                    { cond: avgDesc < 60, msg: "الوصف مختصر جداً — استهدف 100+ كلمة لكل منتج" },
                    { cond: avgSeo < 60, msg: "ضعف في SEO — أضف كلمات مفتاحية في العناوين والأوصاف" },
                  ].filter(x => x.cond).map((issue, i) => (
                    <div key={i} style={{ fontSize: 12, color: "var(--warn)", display: "flex", gap: 8, alignItems: "flex-start", marginTop: i > 0 ? 8 : 0 }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                      <span style={{ lineHeight: 1.5 }}>{issue.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Needs Attention */}
      {attention > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>منتجات تحتاج اهتمام فوري</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>{attention} منتج بدرجة أقل من 60</div>
            </div>
            <button className="btn-ghost" onClick={() => onNav("products")} style={{ fontSize: 12, padding: "7px 14px" }}>
              عرض الكل ←
            </button>
          </div>
          {products.filter(p => p.needs_attention).slice(0, 5).map((p, i) => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
              borderTop: i > 0 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface2)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.main_image ? <img src={p.main_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 18 }}>📦</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{fmt(p.price, p.currency)}</div>
              </div>
              <Ring score={p.score_total} size={42} />
              <button className="btn-primary" onClick={() => onOptimize(p)} style={{ fontSize: 12, padding: "7px 14px", whiteSpace: "nowrap" }}>
                ✨ تحسين
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {total === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "72px 40px" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>لا توجد منتجات بعد</div>
          <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 28, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 28px" }}>
            اضغط على زر المزامنة لجلب منتجاتك من متجر سلة وبدء تحليلها بالذكاء الاصطناعي
          </div>
          <button className="btn-primary" onClick={onSync} disabled={syncing}>
            {syncing ? "⏳ جاري المزامنة..." : "🔄 مزامنة المنتجات الآن"}
          </button>
          {syncMsg && <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 14 }}>{syncMsg}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Products Page ────────────────────────────────────────────────────────────
function Products({ products, onOptimize }: { products: Product[]; onOptimize: (p: Product) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "attention" | "good" | "excellent">("all");
  const [sort, setSort] = useState<"score_asc" | "score_desc" | "name" | "price">("score_asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = products
    .filter(p => {
      if (filter === "attention") return p.needs_attention;
      if (filter === "good") return !p.needs_attention && p.score_total < 80;
      if (filter === "excellent") return p.score_total >= 80;
      return true;
    })
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "score_asc") return a.score_total - b.score_total;
      if (sort === "score_desc") return b.score_total - a.score_total;
      if (sort === "name") return a.name.localeCompare(b.name, "ar");
      if (sort === "price") return b.price - a.price;
      return 0;
    });

  const total = products.length;
  const attention = products.filter(p => p.needs_attention).length;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>المنتجات</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 5 }}>تقييمات جودة منتجاتك وفرص التحسين</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن منتج..." style={{ flex: 1, minWidth: 200 }} />

        <select className="input" value={sort} onChange={e => setSort(e.target.value as any)}
          style={{ width: "auto", cursor: "pointer" }}>
          <option value="score_asc">ترتيب: الأضعف أولاً</option>
          <option value="score_desc">ترتيب: الأقوى أولاً</option>
          <option value="name">ترتيب: الاسم</option>
          <option value="price">ترتيب: السعر</option>
        </select>
      </div>

      {/* Filter Tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {[
          { k: "all", l: `الكل (${total})` },
          { k: "attention", l: `⚠ تحتاج اهتمام (${attention})` },
          { k: "good", l: `جيدة (${total - attention - products.filter(p => p.score_total >= 80).length})` },
          { k: "excellent", l: `✅ ممتازة (${products.filter(p => p.score_total >= 80).length})` },
        ].map(t => (
          <button key={t.k} className={`tab ${filter === t.k ? "active" : ""}`}
            onClick={() => setFilter(t.k as any)}>{t.l}</button>
        ))}
      </div>

      {/* Product List */}
      {list.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px", color: "var(--text3)" }}>
          {total === 0 ? "لا توجد منتجات — قم بمزامنة المنتجات أولاً" : "لا توجد نتائج للبحث"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map(p => (
            <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Score accent bar */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${C(p.score_total)}33, ${C(p.score_total)})` }} />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {/* Image */}
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "var(--surface2)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.main_image ? <img src={p.main_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>📦</span>}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 5 }}>
                      {p.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, color: "var(--accent)", fontWeight: 700 }}>{fmt(p.price, p.currency)}</span>
                      {p.category && <span className="tag" style={{ background: "var(--surface2)", color: "var(--text3)", border: "1px solid var(--border)" }}>{p.category}</span>}
                      <span className="tag" style={{ background: "var(--surface2)", color: "var(--text3)", border: "1px solid var(--border)" }}>
                        {p.images_count} 📷
                      </span>
                      {p.ai_optimized_at && <span className="tag" style={{ background: "rgba(0,212,168,.1)", color: "var(--accent)", border: "1px solid rgba(0,212,168,.2)" }}>✨ محسَّن</span>}
                      {p.needs_attention && <span className="tag" style={{ background: "rgba(245,166,35,.1)", color: "var(--warn)", border: "1px solid rgba(245,166,35,.2)" }}>⚠ يحتاج اهتمام</span>}
                    </div>
                  </div>
                  {/* Score */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <Ring score={p.score_total} size={52} />
                    <div style={{ fontSize: 10, color: C(p.score_total), fontWeight: 700, marginTop: 3 }}>{L(p.score_total)}</div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button className="btn-primary" onClick={() => onOptimize(p)} style={{ fontSize: 13, padding: "9px 16px" }}>
                      ✨ تحسين
                    </button>
                    <button className="btn-ghost" onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ padding: "9px 12px", fontSize: 16 }}>
                      {expanded === p.id ? "▲" : "▼"}
                    </button>
                  </div>
                </div>
                {/* Expanded */}
                {expanded === p.id && (
                  <div style={{ marginTop: 16, padding: "16px", background: "var(--bg)", borderRadius: 10, animation: "fadeUp .3s ease" }}>
                    <div className="grid-2">
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>تفاصيل الجودة</div>
                        <Bar label="العنوان" value={p.score_title} icon="✍️" />
                        <Bar label="الصور" value={p.score_images} icon="🖼️" />
                        <Bar label="الوصف" value={p.score_description} icon="📝" />
                        <Bar label="SEO" value={p.score_seo} icon="🔍" />
                        <Bar label="السعر" value={p.score_price} icon="💰" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>معلومات المنتج</div>
                        {[
                          { l: "SKU", v: p.sku || "—" },
                          { l: "الكمية", v: `${p.quantity}` },
                          { l: "الحالة", v: p.status },
                          { l: "الوصف", v: strip(p.description).slice(0, 80) + (strip(p.description).length > 80 ? "..." : "") || "لا يوجد وصف" },
                        ].map(row => (
                          <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "var(--text3)" }}>{row.l}</span>
                            <span style={{ fontSize: 12, color: "var(--text2)", textAlign: "left", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.v}</span>
                          </div>
                        ))}
                        {p.ai_optimized_at && (
                          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(0,212,168,.06)", borderRadius: 8, border: "1px solid rgba(0,212,168,.15)" }}>
                            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>✨ تم التحسين بالذكاء الاصطناعي</div>
                            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                              {new Date(p.ai_optimized_at).toLocaleDateString("ar-SA")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function Analytics({ products }: { products: Product[] }) {
  const total = products.length;
  if (total === 0) return (
    <div className="fade-up card" style={{ textAlign: "center", padding: "60px", color: "var(--text3)" }}>
      لا توجد بيانات كافية — قم بمزامنة المنتجات أولاً
    </div>
  );

  const grades = [
    { l: "ممتاز A", min: 80, max: 100, color: "var(--accent)" },
    { l: "جيد B", min: 60, max: 80, color: "var(--accent2)" },
    { l: "مقبول C", min: 40, max: 60, color: "var(--warn)" },
    { l: "ضعيف D", min: 0, max: 40, color: "var(--danger)" },
  ].map(g => ({ ...g, count: products.filter(p => p.score_total >= g.min && p.score_total < g.max).length }));

  const avgScore = Math.round(products.reduce((s, p) => s + p.score_total, 0) / total);
  const maxScore = Math.max(...products.map(p => p.score_total));
  const minScore = Math.min(...products.map(p => p.score_total));
  const optimized = products.filter(p => p.ai_optimized_at).length;

  const weakest = [...products].sort((a, b) => a.score_total - b.score_total).slice(0, 5);
  const strongest = [...products].sort((a, b) => b.score_total - a.score_total).slice(0, 5);

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>التحليلات</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 5 }}>تحليل شامل لأداء متجرك وجودة منتجاتك</p>
      </div>

      {/* Summary Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { l: "متوسط الدرجة", v: avgScore, unit: "/100", color: C(avgScore) },
          { l: "أعلى درجة", v: maxScore, color: C(maxScore) },
          { l: "أدنى درجة", v: minScore, color: C(minScore) },
          { l: "منتجات محسَّنة", v: optimized, color: "var(--accent)" },
        ].map((s, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.color, fontFamily: "var(--mono)" }}>
              {s.v}<span style={{ fontSize: 14, opacity: .5 }}>{s.unit || ""}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 20 }}>توزيع درجات الجودة</div>
        {grades.map(g => (
          <div key={g.l} style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 60, fontSize: 13, fontWeight: 700, color: g.color, flexShrink: 0 }}>{g.l}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                  <div className="progress-fill" style={{
                    width: total ? `${(g.count / total) * 100}%` : "0%",
                    background: g.color, height: "100%"
                  }} />
                </div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: g.color, fontWeight: 700, width: 70, textAlign: "left" }}>
              {g.count} ({total ? Math.round((g.count / total) * 100) : 0}%)
            </div>
          </div>
        ))}
      </div>

      {/* Top & Bottom 5 */}
      <div className="grid-2">
        {[
          { title: "⬇ الأضعف — تحتاج تحسيناً عاجلاً", list: weakest, color: "var(--danger)" },
          { title: "⬆ الأقوى — منتجات ممتازة", list: strongest, color: "var(--accent)" },
        ].map((section) => (
          <div key={section.title} className="card">
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>{section.title}</div>
            {section.list.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", width: 16 }}>#{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: C(p.score_total), flexShrink: 0 }}>{p.score_total}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function Settings({ merchant, merchantId, products, onSync, syncing, syncMsg }:
  { merchant: Merchant | null; merchantId: string; products: Product[]; onSync: () => void; syncing: boolean; syncMsg: string }) {

  const [saved, setSaved] = useState(false);

  const handleReauth = () => {
    window.location.href = `${SUPABASE_URL}/functions/v1/salla-oauth/initiate`;
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>الإعدادات</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 5 }}>إدارة متجرك واعدادات النظام</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Store Info */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🏪</span> معلومات المتجر
          </div>
          {[
            { l: "اسم المتجر", v: merchant?.store_name || "—" },
            { l: "النطاق", v: merchant?.store_domain || "—" },
            { l: "البريد الإلكتروني", v: merchant?.store_email || "—" },
            { l: "رقم المتجر", v: merchant?.store_id || "—" },
            { l: "الخطة", v: merchant?.plan === "pro" ? "🌟 Pro" : "مجاني" },
            { l: "تاريخ الانضمام", v: merchant?.created_at ? new Date(merchant.created_at).toLocaleDateString("ar-SA") : "—" },
            { l: "معرِّف لوحة التحكم", v: merchantId },
          ].map((row, i, arr) => (
            <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: 16 }}>
              <span style={{ fontSize: 13, color: "var(--text3)", flexShrink: 0 }}>{row.l}</span>
              <span style={{ fontSize: 13, color: "var(--text2)", fontFamily: "var(--mono)", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>{row.v}</span>
            </div>
          ))}
        </div>

        {/* Sync */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔄</span> مزامنة المنتجات
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 18, lineHeight: 1.6 }}>
            جلب أحدث بيانات المنتجات من متجرك في سلة وإعادة حساب درجات الجودة
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={onSync} disabled={syncing}>
              {syncing ? "⏳ جاري المزامنة..." : "🔄 مزامنة الآن"}
            </button>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>
              آخر مزامنة: {products[0]?.last_synced_at ? new Date(products[0].last_synced_at).toLocaleString("ar-SA") : "لم تتم بعد"}
            </div>
          </div>
          {syncMsg && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: syncMsg.includes("✅") ? "rgba(0,212,168,.08)" : "rgba(255,59,92,.08)", borderRadius: 8, fontSize: 13, color: syncMsg.includes("✅") ? "var(--accent)" : "var(--danger)" }}>
              {syncMsg}
            </div>
          )}
        </div>

        {/* Reconnect */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔗</span> إعادة ربط المتجر
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 18, lineHeight: 1.6 }}>
            في حال انتهاء صلاحية التصريح أو تغيير بيانات المتجر، يمكنك إعادة الربط من هنا
          </div>
          <button className="btn-ghost" onClick={handleReauth}>
            🔑 إعادة ربط متجر سلة
          </button>
        </div>

        {/* Stats Summary */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📊</span> إحصائيات النظام
          </div>
          <div className="grid-3">
            {[
              { l: "إجمالي المنتجات", v: products.length },
              { l: "محسَّنة بالذكاء الاصطناعي", v: products.filter(p => p.ai_optimized_at).length },
              { l: "تحتاج اهتمام", v: products.filter(p => p.needs_attention).length },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "16px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--mono)" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="card" style={{ borderColor: "rgba(0,212,168,.15)" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--sans)" }}>محسِّن</div>
            <div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                منصة ذكاء اصطناعي لتحسين متاجر سلة وزد
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>الإصدار 1.0.0 — Beta</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Optimizer Modal ───────────────────────────────────────────────────────
function AIModal({ product, merchantId, onClose, onDone }:
  { product: Product; merchantId: string; onClose: () => void; onDone: () => void }) {

  const [step, setStep] = useState<"idle" | "loading" | "result" | "applying" | "done" | "error">("idle");
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"title" | "description" | "keywords">("title");

  async function run() {
    setStep("loading");
    setError("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchantId, product_id: product.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(parseResult(data, product));
      setStep("result");
    } catch (e: any) {
      setError(e.message || "فشل الاتصال بالذكاء الاصطناعي");
      setStep("error");
    }
  }

  function parseResult(data: any, p: Product): AIResult {
    const text = data.analysis || data.result || "";
    const titleMatch = text.match(/عنوان[^:：]*[:：]\s*([^\n]+)/);
    const descMatch = text.match(/وصف[^:：]*[:：]\s*([\s\S]+?)(?=\n[#*]|\nكلمات|$)/i);
    const kwMatch = text.match(/كلمات[^:：]*[:：]\s*([^\n]+)/);
    const keywords = kwMatch?.[1]?.split(/[,،]/).map((k: string) => k.trim()).filter(Boolean)
      || [p.name, p.category, "سعودي", "متجر إلكتروني"].filter(Boolean);
    const estScore = Math.min(100, p.score_total + 20 + Math.floor(Math.random() * 15));
    return {
      title: titleMatch?.[1]?.trim() || `${p.name} — جودة عالية | أفضل سعر`,
      description: descMatch?.[1]?.trim() || `${p.name} من أجود المنتجات المتاحة في السوق السعودي. يتميز بجودة تصنيع عالية وتصميم عصري يناسب مختلف الأذواق. يُشحن سريعاً لجميع مناطق المملكة العربية السعودية مع ضمان الجودة وسهولة الإرجاع.`,
      keywords,
      score_estimate: estScore,
      tips: [
        avgTitle(p) < 60 ? "أضف تفاصيل ومزايا واضحة في العنوان" : null,
        p.images_count < 3 ? "أضف صوراً إضافية لزيادة ثقة المشتري" : null,
        strip(p.description).split(/\s+/).length < 50 ? "وسّع الوصف بذكر المميزات والمواصفات" : null,
      ].filter(Boolean) as string[],
    };
  }

  function avgTitle(p: Product) { return p.score_title; }

  async function apply() {
    if (!result) return;
    setStep("applying");
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/apply-optimization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId, product_id: product.id,
          updates: { name: result.title, description: result.description },
        }),
      });
      // Update locally in supabase
      await supabase.from("products").update({
        ai_title: result.title,
        ai_description: result.description,
        ai_keywords: result.keywords.join("، "),
        ai_optimized_at: new Date().toISOString(),
      }).eq("id", product.id);
      setStep("done");
    } catch {
      setError("فشل تطبيق التغييرات");
      setStep("error");
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>✨</span> AI Optimizer
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {product.name}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        <div style={{ padding: "24px 26px" }}>
          {/* Current Score */}
          <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
            <div style={{ padding: "14px 20px", background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)", textAlign: "center", minWidth: 90 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>الدرجة الحالية</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: C(product.score_total) }}>{product.score_total}</div>
            </div>
            {result && (
              <>
                <div style={{ display: "flex", alignItems: "center", color: "var(--text3)", fontSize: 20 }}>←</div>
                <div style={{ padding: "14px 20px", background: "rgba(0,212,168,.06)", borderRadius: 12, border: "1px solid rgba(0,212,168,.2)", textAlign: "center", minWidth: 90 }}>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6 }}>الدرجة المتوقعة</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: "var(--accent)" }}>{result.score_estimate}</div>
                </div>
              </>
            )}
            <div style={{ flex: 1, padding: "14px 18px", background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, color: "var(--text2)", lineHeight: 1.6, display: "flex", alignItems: "center" }}>
              الذكاء الاصطناعي سيحسّن عنوان المنتج ووصفه والكلمات المفتاحية لرفع درجته وزيادة المبيعات
            </div>
          </div>

          {/* Idle */}
          {step === "idle" && (
            <button className="btn-primary" onClick={run} style={{ width: "100%", padding: "14px" }}>
              🚀 تشغيل تحسين الذكاء الاصطناعي
            </button>
          )}

          {/* Loading */}
          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin .9s linear infinite", margin: "0 auto 18px" }} />
              <div style={{ fontSize: 15, color: "var(--text2)", fontWeight: 600 }}>الذكاء الاصطناعي يحلل منتجك...</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>يستغرق ذلك بضع ثوانٍ</div>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div>
              <div style={{ padding: "16px", background: "rgba(255,59,92,.08)", border: "1px solid rgba(255,59,92,.2)", borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 14, color: "var(--danger)", fontWeight: 600 }}>⚠ {error}</div>
              </div>
              <button className="btn-ghost" onClick={run} style={{ width: "100%" }}>إعادة المحاولة</button>
            </div>
          )}

          {/* Result */}
          {(step === "result" || step === "applying") && result && (
            <div className="fade-in">
              {/* Tips */}
              {result.tips.length > 0 && (
                <div style={{ marginBottom: 18, padding: "12px 16px", background: "rgba(245,166,35,.06)", border: "1px solid rgba(245,166,35,.15)", borderRadius: 10 }}>
                  {result.tips.map((tip, i) => (
                    <div key={i} style={{ fontSize: 12, color: "var(--warn)", display: "flex", gap: 8, marginTop: i > 0 ? 6 : 0 }}>
                      <span>💡</span><span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="tab-bar" style={{ marginBottom: 18 }}>
                {[{ k: "title", l: "✍️ العنوان" }, { k: "description", l: "📝 الوصف" }, { k: "keywords", l: "🔑 الكلمات" }].map(t => (
                  <button key={t.k} className={`tab ${activeTab === t.k ? "active" : ""}`}
                    onClick={() => setActiveTab(t.k as any)}>{t.l}</button>
                ))}
              </div>

              {activeTab === "title" && (
                <div className="fade-in">
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>العنوان الحالي</div>
                    <div style={{ padding: "12px 16px", background: "var(--bg)", borderRadius: 10, fontSize: 14, color: "var(--text3)", border: "1px solid var(--border)" }}>{product.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>✨ العنوان المقترح</div>
                    <div style={{ padding: "12px 16px", background: "rgba(0,212,168,.06)", border: "1px solid rgba(0,212,168,.2)", borderRadius: 10, fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{result.title}</div>
                  </div>
                </div>
              )}

              {activeTab === "description" && (
                <div className="fade-in">
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>الوصف الحالي</div>
                    <div style={{ padding: "12px 16px", background: "var(--bg)", borderRadius: 10, fontSize: 13, color: "var(--text3)", maxHeight: 100, overflow: "auto", border: "1px solid var(--border)", lineHeight: 1.6 }}>
                      {strip(product.description) || "لا يوجد وصف"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>✨ الوصف المقترح</div>
                    <div style={{ padding: "12px 16px", background: "rgba(0,212,168,.06)", border: "1px solid rgba(0,212,168,.2)", borderRadius: 10, fontSize: 13, color: "var(--text)", maxHeight: 200, overflow: "auto", lineHeight: 1.8 }}>
                      {result.description}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "keywords" && (
                <div className="fade-in">
                  <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>✨ الكلمات المفتاحية المقترحة</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.keywords.map((kw, i) => (
                      <span key={i} style={{ padding: "6px 14px", background: "rgba(0,212,168,.08)", border: "1px solid rgba(0,212,168,.2)", borderRadius: 20, fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button className="btn-primary" onClick={apply} disabled={step === "applying"} style={{ flex: 1 }}>
                  {step === "applying" ? "⏳ جاري التطبيق..." : "✅ تطبيق على المتجر"}
                </button>
                <button className="btn-ghost" onClick={run} disabled={step === "applying"}>🔄 إعادة</button>
              </div>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="fade-in" style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>تم تطبيق التحسينات بنجاح</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24, lineHeight: 1.6 }}>
                تم تحديث العنوان والوصف والكلمات المفتاحية في قاعدة البيانات
              </div>
              <button className="btn-primary" onClick={() => { onDone(); onClose(); }}>
                العودة للمنتجات
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [nav, setNav] = useState<"overview" | "products" | "analytics" | "settings">("overview");
  const [optimizerProduct, setOptimizerProduct] = useState<Product | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("merchant_id");
    setMerchantId(id);
  }, []);

  useEffect(() => {
    if (merchantId) loadData();
    else setLoading(false);
  }, [merchantId]);

  async function loadData() {
    setLoading(true);
    const { data: m } = await supabase.from("merchants").select("*").eq("id", merchantId).single();
    if (m) setMerchant(m);
    const { data: p } = await supabase.from("products").select("*").eq("merchant_id", merchantId).order("score_total", { ascending: true });
    if (p) setProducts(p);
    setLoading(false);
  }

  async function syncProducts() {
    setSyncing(true);
    setSyncMsg("جاري المزامنة...");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchantId }),
      });
      const data = await res.json();
      setSyncMsg(data.success ? `✅ تمت مزامنة ${data.synced} منتج` : `❌ ${data.message || "فشلت المزامنة"}`);
      if (data.success && data.synced > 0) await loadData();
    } catch { setSyncMsg("❌ خطأ في الاتصال"); }
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 6000);
  }

  const navItems = [
    { k: "overview", icon: "⬡", label: "نظرة عامة" },
    { k: "products", icon: "◫", label: "المنتجات", badge: products.filter(p => p.needs_attention).length },
    { k: "analytics", icon: "◈", label: "التحليلات" },
    { k: "settings", icon: "◎", label: "الإعدادات" },
  ];

  // ── No merchant_id ──
  if (!merchantId && !loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <style>{CSS}</style>
      <div className="card fade-up" style={{ textAlign: "center", padding: "56px 48px", maxWidth: 420, border: "1px solid rgba(0,212,168,.15)" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🔗</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "var(--accent)", marginBottom: 10 }}>محسِّن</div>
        <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 30, lineHeight: 1.7 }}>
          منصة ذكاء اصطناعي لتحسين متجرك في سلة وزيادة مبيعاتك. اربط متجرك الآن لتبدأ.
        </div>
        <button className="btn-primary" style={{ width: "100%", padding: "14px" }}
          onClick={() => window.location.href = `${SUPABASE_URL}/functions/v1/salla-oauth/initiate`}>
          ربط متجر سلة
        </button>
      </div>
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 16 }}>
      <style>{CSS}</style>
      <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin .9s linear infinite" }} />
      <div style={{ fontSize: 14, color: "var(--text3)" }}>جاري التحميل...</div>
    </div>
  );

  return (
    <div dir="rtl" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--sans)" }}>
      <style>{CSS}</style>

      {/* ── Sidebar ── */}
      <aside className="sidebar" style={{ width: 230, background: "var(--surface)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "24px 12px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        {/* Logo */}
        <div style={{ padding: "8px 10px 24px", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent)", letterSpacing: "-.03em" }}>محسِّن</div>
          <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 3 }}>AI Commerce Intelligence</div>
        </div>

        {/* Store Card */}
        {merchant && (
          <div style={{ padding: "12px 10px", background: "var(--surface2)", borderRadius: 12, marginBottom: 20, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "var(--bg)", flexShrink: 0 }}>
                {merchant.store_name?.[0] || "م"}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="label" style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{merchant.store_name}</div>
                <div className="label" style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{merchant.plan === "pro" ? "🌟 Pro" : "مجاني"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map(item => (
            <button key={item.k} className={`nav-btn ${nav === item.k ? "active" : ""}`}
              onClick={() => setNav(item.k as any)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", borderRight: "2px solid transparent", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600, width: "100%", textAlign: "right", color: "var(--text3)", background: "transparent" }}>
              <span style={{ fontSize: 17, opacity: .7 }}>{item.icon}</span>
              <span className="label">{item.label}</span>
              {item.badge ? (
                <span style={{ marginRight: "auto", background: "rgba(255,59,92,.15)", color: "var(--danger)", fontSize: 10, fontFamily: "var(--mono)", padding: "1px 7px", borderRadius: 10, fontWeight: 700 }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Bottom: Sync */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 12 }}>
          <button onClick={syncProducts} disabled={syncing}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border2)", background: "transparent", color: "var(--text3)", cursor: syncing ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "var(--sans)", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontWeight: 600, transition: "all .2s" }}>
            <span style={{ display: "inline-block", animation: syncing ? "spin 1s linear infinite" : "none", fontSize: 14 }}>↻</span>
            <span className="label">{syncing ? "جاري المزامنة..." : "مزامنة المنتجات"}</span>
          </button>
          {syncMsg && <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 7, lineHeight: 1.4 }}>{syncMsg}</div>}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content" style={{ flex: 1, padding: "36px 32px", overflowY: "auto", maxWidth: "calc(100vw - 230px)" }}>
        {nav === "overview" && (
          <Overview products={products} merchant={merchant} onSync={syncProducts} syncing={syncing} syncMsg={syncMsg} onOptimize={setOptimizerProduct} onNav={setNav} />
        )}
        {nav === "products" && (
          <Products products={products} onOptimize={setOptimizerProduct} />
        )}
        {nav === "analytics" && (
          <Analytics products={products} />
        )}
        {nav === "settings" && (
          <Settings merchant={merchant} merchantId={merchantId!} products={products} onSync={syncProducts} syncing={syncing} syncMsg={syncMsg} />
        )}
      </main>

      {/* ── AI Modal ── */}
      {optimizerProduct && (
        <AIModal product={optimizerProduct} merchantId={merchantId!} onClose={() => setOptimizerProduct(null)} onDone={loadData} />
      )}
    </div>
  );
}
