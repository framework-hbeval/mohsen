import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dcchprqwjfblcypsaggz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JFDcUV-OcYLsBNdzr9JmFw_jeYLjzzD";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

const C = (s: number) => s >= 80 ? "#00d4a8" : s >= 60 ? "#f5a623" : s >= 40 ? "#ff6b35" : "#ff3b5c";
const G = (s: number) => s >= 80 ? "A" : s >= 60 ? "B" : s >= 40 ? "C" : "D";
const L = (s: number) => s >= 80 ? "ممتاز" : s >= 60 ? "جيد" : s >= 40 ? "مقبول" : "ضعيف";
const fmt = (p: number, c: string) => `${p.toLocaleString("ar-SA")} ${c === "SAR" ? "ر.س" : c}`;
const strip = (h: string) => h?.replace(/<[^>]*>/g, "").trim() || "";

// ─── CSS المتجاوب الكامل ──────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Space+Mono:wght@400;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #03070f; --surface: #080f1c; --surface2: #0c1628;
  --border: #0e1e35; --border2: #162840;
  --text: #e8f4f8; --text2: #7a9ab5; --text3: #3d5a73;
  --accent: #00d4a8; --accent2: #0099cc;
  --warn: #f5a623; --danger: #ff3b5c;
  --sans: 'Tajawal', sans-serif; --mono: 'Space Mono', monospace;
  --nav-h: 64px; --sidebar-w: 220px;
}
html, body { background: var(--bg); font-family: var(--sans); color: var(--text); overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }

.fu { animation: fadeUp .4s cubic-bezier(.2,0,.2,1) both; }
.fi { animation: fadeIn .25s ease both; }

/* ── Layout ── */
.app { display: flex; min-height: 100vh; min-height: 100dvh; direction: rtl; }

/* Sidebar — Desktop */
.sidebar {
  width: var(--sidebar-w); background: var(--surface);
  border-left: 1px solid var(--border);
  display: flex; flex-direction: column;
  position: fixed; top: 0; right: 0;
  height: 100vh; height: 100dvh;
  z-index: 100; overflow-y: auto;
  padding: 20px 10px;
  transition: transform .3s ease;
}
.main {
  flex: 1; margin-right: var(--sidebar-w);
  padding: 28px 24px 100px;
  min-height: 100vh; overflow-x: hidden;
}

/* Bottom Nav — Mobile */
.bottom-nav {
  display: none;
  position: fixed; bottom: 0; left: 0; right: 0;
  height: var(--nav-h); z-index: 200;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 0 8px;
  align-items: center; justify-content: space-around;
  backdrop-filter: blur(12px);
}
.bottom-nav-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; flex: 1; padding: 8px 4px;
  background: none; border: none; cursor: pointer;
  color: var(--text3); transition: color .2s;
  font-family: var(--sans); position: relative;
}
.bottom-nav-btn.active { color: var(--accent); }
.bottom-nav-btn .nav-icon { font-size: 20px; line-height: 1; }
.bottom-nav-btn .nav-label { font-size: 10px; font-weight: 700; letter-spacing: .03em; }
.bottom-nav-btn .nav-badge {
  position: absolute; top: 4px; right: calc(50% - 14px);
  background: var(--danger); color: #fff;
  font-size: 9px; font-weight: 800; font-family: var(--mono);
  padding: 1px 5px; border-radius: 10px; min-width: 16px; text-align: center;
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: sticky; top: 0; z-index: 50;
  background: var(--surface); border-bottom: 1px solid var(--border);
  padding: 12px 16px;
  align-items: center; justify-content: space-between;
}
.mobile-header .logo { font-size: 20px; font-weight: 900; color: var(--accent); }
.mobile-header .store-badge {
  font-size: 12px; color: var(--text2); font-weight: 600;
  background: var(--surface2); padding: 5px 12px;
  border-radius: 20px; border: 1px solid var(--border);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar { display: none !important; }
  .bottom-nav { display: flex; }
  .mobile-header { display: flex; }
  .main { margin-right: 0; padding: 16px 14px 80px; }
}

/* ── Cards ── */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
.card-sm { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
.card-accent { border-color: rgba(0,212,168,.2); }

/* ── Buttons ── */
.btn-primary {
  background: linear-gradient(135deg, #00d4a8, #0099cc);
  color: #03070f; border: none; border-radius: 10px;
  font-family: var(--sans); font-weight: 800; font-size: 14px;
  cursor: pointer; padding: 10px 18px; transition: all .2s;
  white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary:hover { opacity: .88; box-shadow: 0 6px 20px rgba(0,212,168,.3); }
.btn-primary:disabled { opacity: .4; cursor: not-allowed; }
.btn-primary-full { width: 100%; justify-content: center; padding: 13px; font-size: 15px; }

.btn-ghost {
  background: transparent; color: var(--text2);
  border: 1px solid var(--border2); border-radius: 10px;
  font-family: var(--sans); font-size: 13px; cursor: pointer;
  padding: 9px 16px; transition: all .2s; white-space: nowrap;
}
.btn-ghost:hover { color: var(--text); border-color: var(--text3); }
.btn-ghost:disabled { opacity: .4; cursor: not-allowed; }

.btn-icon {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text2); cursor: pointer;
  padding: 9px 12px; font-size: 16px; transition: all .2s;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-icon:hover { color: var(--text); border-color: var(--border2); }

/* ── Nav Sidebar ── */
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  border: none; border-right: 2px solid transparent;
  cursor: pointer; font-family: var(--sans); font-size: 13px;
  font-weight: 600; width: 100%; text-align: right;
  color: var(--text3); background: transparent;
  transition: all .15s; margin-bottom: 2px;
}
.nav-item:hover { background: rgba(0,212,168,.05); color: var(--text2); }
.nav-item.active { background: rgba(0,212,168,.1); color: var(--accent); border-right-color: var(--accent); }
.nav-item .ni-icon { font-size: 17px; opacity: .8; }
.nav-item .ni-badge {
  margin-right: auto; background: rgba(255,59,92,.15);
  color: var(--danger); font-size: 10px; font-family: var(--mono);
  padding: 1px 7px; border-radius: 10px; font-weight: 700;
}

/* ── Input ── */
.input {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text); font-family: var(--sans);
  font-size: 14px; padding: 10px 14px; width: 100%; transition: border-color .2s;
}
.input:focus { outline: none; border-color: rgba(0,212,168,.4); }
.input::placeholder { color: var(--text3); }

/* ── Tags ── */
.tag { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.tag-default { background: var(--surface2); color: var(--text3); border: 1px solid var(--border); }
.tag-accent { background: rgba(0,212,168,.1); color: var(--accent); border: 1px solid rgba(0,212,168,.2); }
.tag-warn { background: rgba(245,166,35,.1); color: var(--warn); border: 1px solid rgba(245,166,35,.2); }
.tag-danger { background: rgba(255,59,92,.1); color: var(--danger); border: 1px solid rgba(255,59,92,.2); }

/* ── Progress ── */
.progress { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; transition: width .9s cubic-bezier(.4,0,.2,1); }

/* ── Tabs ── */
.tabs { display: flex; background: var(--bg); border-radius: 10px; padding: 3px; gap: 2px; }
.tab { flex: 1; padding: 8px 6px; border-radius: 8px; border: none; cursor: pointer; font-family: var(--sans); font-size: 12px; font-weight: 700; transition: all .2s; background: transparent; color: var(--text3); }
.tab.active { background: var(--surface2); color: var(--accent); }

/* ── Modal ── */
.modal-bg { position: fixed; inset: 0; background: rgba(3,7,15,.88); backdrop-filter: blur(8px); display: flex; align-items: flex-end; justify-content: center; z-index: 500; padding: 0; animation: fadeIn .2s ease; }
.modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px 20px 0 0; width: 100%; max-height: 92vh; max-height: 92dvh; overflow-y: auto; animation: slideUp .3s cubic-bezier(.2,0,.2,1); }
@media (min-width: 640px) {
  .modal-bg { align-items: center; padding: 20px; }
  .modal-box { border-radius: 20px; max-width: 680px; animation: fadeUp .3s ease; }
}

/* ── Grids ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
@media (max-width: 640px) {
  .grid-2 { grid-template-columns: 1fr; }
  .grid-4 { grid-template-columns: repeat(2,1fr); }
}

/* ── Product Card ── */
.product-row {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden; margin-bottom: 10px;
  transition: border-color .2s;
}
.product-row:hover { border-color: var(--border2); }

/* ── Stat Card ── */
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; padding: 16px;
  position: relative; overflow: hidden;
}
.stat-card-glow { position: absolute; inset: 0; pointer-events: none; }

/* ── Score Chip ── */
.score-chip {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; font-family: var(--mono); font-weight: 700;
  border: 2px solid; flex-shrink: 0;
}

/* ── Upgrade Banner ── */
.upgrade-banner {
  background: linear-gradient(135deg, rgba(0,212,168,.08), rgba(0,153,204,.05));
  border: 1px solid rgba(0,212,168,.2); border-radius: 14px;
  padding: 18px; display: flex; align-items: center;
  gap: 14px; margin-bottom: 20px; flex-wrap: wrap;
}

/* ── Sync bar ── */
.sync-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* ── Spinner ── */
.spinner { width: 20px; height: 20px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite; display: inline-block; }
.spinner-lg { width: 40px; height: 40px; border-width: 3px; }
`;

// ─── Score Ring ───────────────────────────────────────────────────────────────
function Ring({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r;
  const arc = circ * 0.75, fill = arc * (score / 100);
  const cx = size / 2, cy = size / 2, color = C(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(135deg)", flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0e1e35" strokeWidth={6}
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 4px ${color}60)` }} />
      <text x={cx} y={cy + (size > 80 ? 8 : 5)} textAnchor="middle" fill={color}
        style={{ transform: `rotate(-135deg)`, transformOrigin: `${cx}px ${cy}px`, fontSize: size > 80 ? 20 : 12, fontWeight: 700, fontFamily: "Space Mono,monospace" }}>
        {score}
      </text>
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function Bar({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "var(--text2)", display: "flex", alignItems: "center", gap: 5 }}>
          <span>{icon}</span>{label}
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: C(value), fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg,${C(value)}66,${C(value)})` }} />
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ products, merchant, onSync, syncing, syncMsg, onOptimize, onNav, onUpgrade }:
  any) {
  const total = products.length;
  const attention = products.filter((p: Product) => p.needs_attention).length;
  const excellent = products.filter((p: Product) => p.score_total >= 80).length;
  const avgScore = total ? Math.round(products.reduce((s: number, p: Product) => s + p.score_total, 0) / total) : 0;
  const avgTitle = total ? Math.round(products.reduce((s: number, p: Product) => s + p.score_title, 0) / total) : 0;
  const avgImages = total ? Math.round(products.reduce((s: number, p: Product) => s + p.score_images, 0) / total) : 0;
  const avgDesc = total ? Math.round(products.reduce((s: number, p: Product) => s + p.score_description, 0) / total) : 0;
  const avgSeo = total ? Math.round(products.reduce((s: number, p: Product) => s + p.score_seo, 0) / total) : 0;

  return (
    <div className="fu">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>
          مرحباً{merchant?.store_name ? `، ${merchant.store_name}` : ""} 👋
        </h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>نظرة شاملة على أداء متجرك</p>
      </div>

      {/* Upgrade Banner */}
      {merchant?.plan !== "pro" && (
        <div className="upgrade-banner">
          <div style={{ fontSize: 28 }}>⭐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>جرّب محسِّن Pro</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>تحسين غير محدود بالذكاء الاصطناعي + تقارير متقدمة</div>
          </div>
          <button className="btn-primary" onClick={onUpgrade} style={{ fontSize: 13 }}>
            ابدأ مجاناً →
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        {[
          { l: "المنتجات", v: total, color: "var(--accent2)", icon: "📦" },
          { l: "متوسط الجودة", v: `${avgScore}`, color: C(avgScore), icon: "⭐" },
          { l: "تحتاج اهتمام", v: attention, color: "var(--warn)", icon: "⚠️" },
          { l: "ممتازة", v: excellent, color: "var(--accent)", icon: "✅" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, fontFamily: "var(--mono)", lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 5 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Store Score */}
      {total > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", minWidth: 110 }}>
              <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>Store Score</div>
              <Ring score={avgScore} size={110} />
              <div style={{ marginTop: 8 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 30, fontWeight: 700, color: C(avgScore) }}>{G(avgScore)}</span>
                <div style={{ fontSize: 12, color: C(avgScore), marginTop: 3, fontWeight: 700 }}>{L(avgScore)}</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>تقييم جودة المتجر</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>بناءً على {total} منتج</div>
              <Bar label="جودة العناوين" value={avgTitle} icon="✍️" />
              <Bar label="جودة الصور" value={avgImages} icon="🖼️" />
              <Bar label="جودة الوصف" value={avgDesc} icon="📝" />
              <Bar label="تحسين SEO" value={avgSeo} icon="🔍" />
            </div>
          </div>
        </div>
      )}

      {/* Needs Attention */}
      {attention > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 14 }}>⚠️ تحتاج اهتمام فوري</div>
            <button className="btn-ghost" onClick={() => onNav("products")} style={{ fontSize: 12, padding: "6px 12px" }}>الكل ←</button>
          </div>
          {products.filter((p: Product) => p.needs_attention).slice(0, 4).map((p: Product, i: number) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--surface2)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.main_image ? <img src={p.main_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>📦</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{fmt(p.price, p.currency)}</div>
              </div>
              <Ring score={p.score_total} size={40} />
              <button className="btn-primary" onClick={() => onOptimize(p)} style={{ fontSize: 12, padding: "7px 12px" }}>✨</button>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {total === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "52px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>لا توجد منتجات بعد</div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 24, lineHeight: 1.7 }}>اضغط مزامنة لجلب منتجاتك من سلة</div>
          <button className="btn-primary btn-primary-full" onClick={onSync} disabled={syncing}>
            {syncing ? <><span className="spinner" style={{ width: 16, height: 16 }} /> جاري...</> : "🔄 مزامنة الآن"}
          </button>
          {syncMsg && <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 12 }}>{syncMsg}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────
function Products({ products, onOptimize }: { products: Product[]; onOptimize: (p: Product) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "attention" | "good">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = products
    .filter(p => filter === "attention" ? p.needs_attention : filter === "good" ? !p.needs_attention : true)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.score_total - b.score_total);

  return (
    <div className="fu">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>المنتجات</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>تقييمات جودة منتجاتك وفرص التحسين</p>
      </div>

      <input className="input" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="ابحث عن منتج..." style={{ marginBottom: 12 }} />

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[
          { k: "all", l: `الكل (${products.length})` },
          { k: "attention", l: `⚠️ تحتاج (${products.filter(p => p.needs_attention).length})` },
          { k: "good", l: `✅ جيدة (${products.filter(p => !p.needs_attention).length})` },
        ].map(t => (
          <button key={t.k} className={`tab ${filter === t.k ? "active" : ""}`}
            onClick={() => setFilter(t.k as any)}>{t.l}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px", color: "var(--text3)" }}>
          {products.length === 0 ? "لا توجد منتجات — قم بالمزامنة أولاً" : "لا نتائج"}
        </div>
      ) : list.map(p => (
        <div key={p.id} className="product-row">
          <div style={{ height: 3, background: `linear-gradient(90deg,${C(p.score_total)}33,${C(p.score_total)})` }} />
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 50, height: 50, borderRadius: 10, background: "var(--surface2)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.main_image ? <img src={p.main_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22 }}>📦</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>{fmt(p.price, p.currency)}</span>
                  {p.needs_attention && <span className="tag tag-warn">⚠️ يحتاج اهتمام</span>}
                  {p.ai_optimized_at && <span className="tag tag-accent">✨ محسَّن</span>}
                </div>
              </div>
              <Ring score={p.score_total} size={48} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn-primary" onClick={() => onOptimize(p)} style={{ flex: 1, fontSize: 13, justifyContent: "center" }}>
                ✨ تحسين بالذكاء الاصطناعي
              </button>
              <button className="btn-icon" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                {expanded === p.id ? "▲" : "▼"}
              </button>
            </div>

            {/* Expanded Details */}
            {expanded === p.id && (
              <div style={{ marginTop: 14, padding: "14px", background: "var(--bg)", borderRadius: 10, animation: "fadeUp .3s ease" }}>
                <Bar label="العنوان" value={p.score_title} icon="✍️" />
                <Bar label="الصور" value={p.score_images} icon="🖼️" />
                <Bar label="الوصف" value={p.score_description} icon="📝" />
                <Bar label="SEO" value={p.score_seo} icon="🔍" />
                <Bar label="السعر" value={p.score_price} icon="💰" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function Analytics({ products }: { products: Product[] }) {
  const total = products.length;
  if (!total) return (
    <div className="fu card" style={{ textAlign: "center", padding: "48px", color: "var(--text3)" }}>
      لا توجد بيانات — قم بمزامنة المنتجات أولاً
    </div>
  );

  const avgScore = Math.round(products.reduce((s, p) => s + p.score_total, 0) / total);
  const grades = [
    { l: "ممتاز A", min: 80, color: "var(--accent)" },
    { l: "جيد B", min: 60, color: "var(--accent2)" },
    { l: "مقبول C", min: 40, color: "var(--warn)" },
    { l: "ضعيف D", min: 0, color: "var(--danger)" },
  ].map((g, i, arr) => ({
    ...g,
    count: products.filter(p => p.score_total >= g.min && p.score_total < (arr[i - 1]?.min ?? 101)).length
  }));

  return (
    <div className="fu">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>التحليلات</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>تحليل شامل لأداء متجرك</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        {[
          { l: "متوسط الدرجة", v: avgScore, color: C(avgScore) },
          { l: "أعلى درجة", v: Math.max(...products.map(p => p.score_total)), color: "var(--accent)" },
          { l: "أدنى درجة", v: Math.min(...products.map(p => p.score_total)), color: "var(--danger)" },
          { l: "محسَّنة AI", v: products.filter(p => p.ai_optimized_at).length, color: "var(--accent2)" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: "var(--mono)" }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 18 }}>توزيع درجات الجودة</div>
        {grades.map(g => (
          <div key={g.l} style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 60, fontSize: 12, fontWeight: 700, color: g.color, flexShrink: 0 }}>{g.l}</div>
            <div className="progress" style={{ flex: 1, height: 8 }}>
              <div className="progress-fill" style={{ width: `${total ? (g.count / total) * 100 : 0}%`, background: g.color, height: "100%" }} />
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: g.color, width: 60, textAlign: "left" }}>
              {g.count} ({total ? Math.round((g.count / total) * 100) : 0}%)
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {[
          { title: "⬇️ الأضعف — تحتاج تحسيناً", list: [...products].sort((a, b) => a.score_total - b.score_total).slice(0, 5) },
          { title: "⬆️ الأقوى — منتجات ممتازة", list: [...products].sort((a, b) => b.score_total - a.score_total).slice(0, 5) },
        ].map(sec => (
          <div key={sec.title} className="card">
            <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 14, fontSize: 13 }}>{sec.title}</div>
            {sec.list.map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", width: 14 }}>#{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: C(p.score_total), flexShrink: 0 }}>{p.score_total}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function Settings({ merchant, merchantId, products, onSync, syncing, syncMsg, onUpgrade }: any) {
  return (
    <div className="fu">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em" }}>الإعدادات</h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>إدارة متجرك وإعدادات النظام</p>
      </div>

      {/* Plan Card */}
      <div className="card card-accent" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
              {merchant?.plan === "pro" ? "⭐ الخطة Pro" : "الخطة المجانية"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>
              {merchant?.plan === "pro" ? "جميع الميزات مفعّلة" : "تحسين محدود — ارقِّ للاستفادة الكاملة"}
            </div>
          </div>
          {merchant?.plan !== "pro" && (
            <button className="btn-primary" onClick={onUpgrade} style={{ fontSize: 13 }}>
              ⬆️ ترقية الآن — 199 ر.س
            </button>
          )}
        </div>
      </div>

      {/* Store Info */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>🏪 معلومات المتجر</div>
        {[
          { l: "اسم المتجر", v: merchant?.store_name || "—" },
          { l: "النطاق", v: merchant?.store_domain || "—" },
          { l: "البريد", v: merchant?.store_email || "—" },
          { l: "رقم المتجر", v: merchant?.store_id || "—" },
          { l: "تاريخ الانضمام", v: merchant?.created_at ? new Date(merchant.created_at).toLocaleDateString("ar-SA") : "—" },
        ].map((row, i, arr) => (
          <div key={row.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text3)", flexShrink: 0 }}>{row.l}</span>
            <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left", maxWidth: "60%" }}>{row.v}</span>
          </div>
        ))}
      </div>

      {/* Sync */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 6, fontSize: 14 }}>🔄 مزامنة المنتجات</div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14, lineHeight: 1.6 }}>
          جلب أحدث بيانات المنتجات من متجرك وإعادة حساب درجات الجودة
        </div>
        <div className="sync-bar">
          <button className="btn-primary" onClick={onSync} disabled={syncing}>
            {syncing ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: "2px" }} /> جاري...</> : "🔄 مزامنة الآن"}
          </button>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            آخر مزامنة: {products[0]?.last_synced_at ? new Date(products[0].last_synced_at).toLocaleString("ar-SA") : "لم تتم"}
          </span>
        </div>
        {syncMsg && <div style={{ marginTop: 10, fontSize: 13, color: syncMsg.includes("✅") ? "var(--accent)" : "var(--danger)" }}>{syncMsg}</div>}
      </div>

      {/* Reconnect */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 6, fontSize: 14 }}>🔗 إعادة ربط المتجر</div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>في حال انتهاء صلاحية التصريح يمكنك إعادة الربط</div>
        <button className="btn-ghost" onClick={() => window.location.href = `${SUPABASE_URL}/functions/v1/salla-oauth/initiate`}>
          🔑 إعادة ربط سلة
        </button>
      </div>

      {/* Stats */}
      <div className="card">
        <div style={{ fontWeight: 800, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>📊 إحصائيات</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { l: "إجمالي المنتجات", v: products.length },
            { l: "محسَّن AI", v: products.filter((p: Product) => p.ai_optimized_at).length },
            { l: "يحتاج اهتمام", v: products.filter((p: Product) => p.needs_attention).length },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "var(--accent)", fontFamily: "var(--mono)" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 5, lineHeight: 1.3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Optimizer Modal ───────────────────────────────────────────────────────
function AIModal({ product, merchantId, onClose, onDone }: any) {
  const [step, setStep] = useState<"idle" | "loading" | "result" | "applying" | "done" | "error">("idle");
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"title" | "description" | "keywords">("title");

  async function run() {
    setStep("loading"); setError("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-product`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchantId, product_id: product.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const s = data.structured;
      setResult({
        title: s?.title || product.name,
        description: s?.description || strip(product.description),
        keywords: s?.keywords || [],
        score_estimate: s?.score_estimate || product.score_total,
        tips: s?.top_tip ? [s.top_tip] : [],
      });
      setStep("result");
    } catch (e: any) {
      setError(e.message || "فشل الاتصال"); setStep("error");
    }
  }

  async function apply() {
    if (!result) return;
    setStep("applying");
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/apply-optimization`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchantId, product_id: product.id, updates: { title: result.title, description: result.description, keywords: result.keywords } }),
      });
      setStep("done");
    } catch { setError("فشل التطبيق"); setStep("error"); }
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Handle bar mobile */}
        <div style={{ width: 36, height: 4, background: "var(--border2)", borderRadius: 2, margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>✨ AI Optimizer</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 22, padding: 4 }}>✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Score comparison */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, padding: "12px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>الدرجة الحالية</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: C(product.score_total) }}>{product.score_total}</div>
            </div>
            {result && <>
              <div style={{ display: "flex", alignItems: "center", color: "var(--text3)", fontSize: 18 }}>→</div>
              <div style={{ flex: 1, padding: "12px", background: "rgba(0,212,168,.06)", borderRadius: 10, border: "1px solid rgba(0,212,168,.2)", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--accent)", marginBottom: 4 }}>الدرجة المتوقعة</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{result.score_estimate}</div>
              </div>
            </>}
          </div>

          {step === "idle" && (
            <button className="btn-primary btn-primary-full" onClick={run}>🚀 تشغيل تحسين الذكاء الاصطناعي</button>
          )}

          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <div className="spinner spinner-lg" style={{ margin: "0 auto 16px" }} />
              <div style={{ fontSize: 14, color: "var(--text2)", fontWeight: 600 }}>الذكاء الاصطناعي يحلل منتجك...</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>يستغرق بضع ثوانٍ</div>
            </div>
          )}

          {step === "error" && (
            <div>
              <div style={{ padding: "14px", background: "rgba(255,59,92,.08)", border: "1px solid rgba(255,59,92,.2)", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "var(--danger)" }}>⚠️ {error}</div>
              <button className="btn-ghost" style={{ width: "100%" }} onClick={run}>إعادة المحاولة</button>
            </div>
          )}

          {(step === "result" || step === "applying") && result && (
            <div className="fi">
              {result.tips.length > 0 && (
                <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(245,166,35,.06)", border: "1px solid rgba(245,166,35,.15)", borderRadius: 10, fontSize: 12, color: "var(--warn)" }}>
                  💡 {result.tips[0]}
                </div>
              )}
              <div className="tabs" style={{ marginBottom: 14 }}>
                {[{ k: "title", l: "✍️ العنوان" }, { k: "description", l: "📝 الوصف" }, { k: "keywords", l: "🔑 الكلمات" }].map(t => (
                  <button key={t.k} className={`tab ${tab === t.k ? "active" : ""}`} onClick={() => setTab(t.k as any)}>{t.l}</button>
                ))}
              </div>

              {tab === "title" && (
                <div className="fi">
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, fontWeight: 700 }}>الحالي</div>
                  <div style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, fontSize: 14, color: "var(--text3)", marginBottom: 12, border: "1px solid var(--border)" }}>{product.name}</div>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6, fontWeight: 700 }}>✨ المقترح</div>
                  <div style={{ padding: "10px 14px", background: "rgba(0,212,168,.06)", border: "1px solid rgba(0,212,168,.2)", borderRadius: 10, fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{result.title}</div>
                </div>
              )}

              {tab === "description" && (
                <div className="fi">
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, fontWeight: 700 }}>الحالي</div>
                  <div style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, fontSize: 13, color: "var(--text3)", maxHeight: 90, overflow: "auto", marginBottom: 12, border: "1px solid var(--border)", lineHeight: 1.6 }}>
                    {strip(product.description) || "لا يوجد وصف"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6, fontWeight: 700 }}>✨ المقترح</div>
                  <div style={{ padding: "10px 14px", background: "rgba(0,212,168,.06)", border: "1px solid rgba(0,212,168,.2)", borderRadius: 10, fontSize: 13, color: "var(--text)", maxHeight: 160, overflow: "auto", lineHeight: 1.8 }}>{result.description}</div>
                </div>
              )}

              {tab === "keywords" && (
                <div className="fi">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.keywords.map((k, i) => (
                      <span key={i} style={{ padding: "6px 14px", background: "rgba(0,212,168,.08)", border: "1px solid rgba(0,212,168,.2)", borderRadius: 20, fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                <button className="btn-primary" onClick={apply} disabled={step === "applying"} style={{ flex: 1, justifyContent: "center" }}>
                  {step === "applying" ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: "2px" }} /> جاري...</> : "✅ تطبيق على المتجر"}
                </button>
                <button className="btn-ghost" onClick={run} disabled={step === "applying"}>🔄</button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="fi" style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>تم التطبيق بنجاح</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>تم حفظ التحسينات في قاعدة البيانات</div>
              <button className="btn-primary btn-primary-full" onClick={() => { onDone(); onClose(); }}>العودة ←</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
function UpgradeModal({ merchantId, onClose }: { merchantId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: "✨", title: "تحسين غير محدود بالذكاء الاصطناعي", desc: "حسِّن جميع منتجاتك بعناوين ووصف احترافي" },
    { icon: "📊", title: "تقارير وتحليلات متقدمة", desc: "رؤى عميقة وتوصيات مخصصة لزيادة مبيعاتك" },
    { icon: "🔄", title: "مزامنة تلقائية يومية", desc: "يُحدِّث درجات منتجاتك تلقائياً" },
    { icon: "🎯", title: "اكتشاف المنتجات الرابحة", desc: "أفضل المنتجات المطلوبة في السوق السعودي" },
    { icon: "⚡", title: "أولوية في المعالجة", desc: "تحليل أسرع وخدمة أفضل" },
  ];

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ background: "#080f1c" }}>
        <div style={{ width: 36, height: 4, background: "var(--border2)", borderRadius: 2, margin: "12px auto 0" }} />

        {/* Hero */}
        <div style={{ padding: "24px 20px 20px", textAlign: "center", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,168,.1) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 20, background: "rgba(0,212,168,.1)", border: "1px solid rgba(0,212,168,.25)", color: "var(--accent)", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>
            ⭐ خطة Pro
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: "-.02em", marginBottom: 8 }}>
            ارفع متجرك <span style={{ color: "var(--accent)" }}>لمستوى آخر</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
            احصل على جميع أدوات التحسين المتقدمة وابدأ في زيادة مبيعاتك
          </div>

          {/* Price */}
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 4, marginTop: 18, padding: "12px 24px", background: "rgba(0,212,168,.06)", border: "1px solid rgba(0,212,168,.15)", borderRadius: 14 }}>
            <span style={{ fontSize: 16, color: "var(--accent)", fontWeight: 700 }}>ر.س</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 40, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>199</span>
            <div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>/ شهرياً</div>
              <div style={{ fontSize: 11, textDecoration: "line-through", color: "var(--text3)" }}>399 ر.س</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "18px 20px 24px" }}>
          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div style={{ fontSize: 20 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button className="btn-primary btn-primary-full" disabled={loading}
            onClick={() => { setLoading(true); setTimeout(() => { window.open(`https://mohsen-sigma.vercel.app/checkout?merchant_id=${merchantId}&plan=pro`, "_blank"); setLoading(false); }, 600); }}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: "2px" }} /> جاري...</> : "🚀 ابدأ الخطة Pro — 199 ر.س / شهر"}
          </button>

          <div style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", margin: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            🔒 دفع آمن عبر Moyasar · يمكن الإلغاء في أي وقت · ضمان 7 أيام
          </div>

          <button className="btn-ghost" style={{ width: "100%" }} onClick={onClose}>
            ليس الآن — استمر بالخطة المجانية
          </button>
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
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("merchant_id");
    setMerchantId(id);
  }, []);

  useEffect(() => { merchantId ? loadData() : setLoading(false); }, [merchantId]);

  async function loadData() {
    setLoading(true);
    const { data: m } = await supabase.from("merchants").select("*").eq("id", merchantId).single();
    if (m) setMerchant(m);
    const { data: p } = await supabase.from("products").select("*").eq("merchant_id", merchantId).order("score_total");
    if (p) setProducts(p);
    setLoading(false);
  }

  async function syncProducts() {
    setSyncing(true); setSyncMsg("جاري المزامنة...");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-products`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchantId }),
      });
      const data = await res.json();
      setSyncMsg(data.success ? `✅ تمت مزامنة ${data.synced} منتج` : `❌ ${data.message || "فشلت المزامنة"}`);
      if (data.success && data.synced > 0) await loadData();
    } catch { setSyncMsg("❌ خطأ في الاتصال"); }
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 6000);
  }

  const attention = products.filter(p => p.needs_attention).length;

  const navItems = [
    { k: "overview", icon: "⬡", label: "الرئيسية", badge: 0 },
    { k: "products", icon: "◫", label: "المنتجات", badge: attention },
    { k: "analytics", icon: "◈", label: "التحليلات", badge: 0 },
    { k: "settings", icon: "◎", label: "الإعدادات", badge: 0 },
  ];

  // ── No merchant ──
  if (!merchantId && !loading) return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <style>{CSS}</style>
      <div className="card fu" style={{ textAlign: "center", padding: "48px 32px", maxWidth: 380, width: "100%", border: "1px solid rgba(0,212,168,.15)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", marginBottom: 8 }}>محسِّن</div>
        <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 28, lineHeight: 1.7 }}>
          منصة ذكاء اصطناعي لتحسين متجرك في سلة وزيادة مبيعاتك. اربط متجرك الآن.
        </div>
        <button className="btn-primary btn-primary-full"
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
      <div className="spinner spinner-lg" />
      <div style={{ fontSize: 13, color: "var(--text3)" }}>جاري التحميل...</div>
    </div>
  );

  const pageProps = { products, merchant, merchantId, onSync: syncProducts, syncing, syncMsg, onOptimize: setOptimizerProduct, onNav: setNav, onUpgrade: () => setShowUpgrade(true) };

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* ── Sidebar (Desktop) ── */}
      <aside className="sidebar">
        <div style={{ padding: "4px 8px 20px", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent)" }}>محسِّن</div>
          <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: ".12em", textTransform: "uppercase", marginTop: 2 }}>AI Commerce</div>
        </div>

        {merchant && (
          <div style={{ padding: "10px", background: "var(--surface2)", borderRadius: 12, marginBottom: 18, border: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--accent),var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: "var(--bg)", flexShrink: 0 }}>
              {merchant.store_name?.[0] || "م"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{merchant.store_name}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{merchant.plan === "pro" ? "⭐ Pro" : "مجاني"}</div>
            </div>
          </div>
        )}

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.k} className={`nav-item ${nav === item.k ? "active" : ""}`}
              onClick={() => setNav(item.k as any)}>
              <span className="ni-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="ni-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <button onClick={syncProducts} disabled={syncing}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border2)", background: "transparent", color: "var(--text3)", cursor: syncing ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "var(--sans)", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontWeight: 600 }}>
            <span style={{ display: "inline-block", animation: syncing ? "spin 1s linear infinite" : "none" }}>↻</span>
            {syncing ? "جاري المزامنة..." : "مزامنة المنتجات"}
          </button>
          {syncMsg && <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 6 }}>{syncMsg}</div>}
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className="mobile-header">
        <div className="logo">محسِّن</div>
        {merchant && <div className="store-badge">{merchant.store_name}</div>}
      </header>

      {/* ── Main Content ── */}
      <main className="main">
        {nav === "overview" && <Overview {...pageProps} />}
        {nav === "products" && <Products products={products} onOptimize={setOptimizerProduct} />}
        {nav === "analytics" && <Analytics products={products} />}
        {nav === "settings" && <Settings {...pageProps} />}
      </main>

      {/* ── Bottom Nav (Mobile) ── */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <button key={item.k} className={`bottom-nav-btn ${nav === item.k ? "active" : ""}`}
            onClick={() => setNav(item.k as any)}>
            {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Modals ── */}
      {optimizerProduct && (
        <AIModal product={optimizerProduct} merchantId={merchantId!} onClose={() => setOptimizerProduct(null)} onDone={loadData} />
      )}
      {showUpgrade && (
        <UpgradeModal merchantId={merchantId!} onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  );
}
