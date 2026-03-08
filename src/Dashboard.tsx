import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://dcchprqwjfblcypsaggz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JFDcUV-OcYLsBNdzr9JmFw_jeYLjzzD";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Merchant { id: string; store_name: string; store_domain: string; store_id: string; }
interface Product {
  id: string; name: string; price: number; currency: string;
  images_count: number; main_image: string; category: string; sku: string;
  score_total: number; score_title: number; score_images: number;
  score_description: number; score_price: number; score_seo: number;
  needs_attention: boolean; status: string; description: string;
}
interface AIResult { title: string; description: string; keywords: string[]; price_suggestion: string; reasoning: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
const scoreGrade = (s: number) => s >= 80 ? "A" : s >= 60 ? "B" : s >= 40 ? "C" : "D";
const scoreLabel = (s: number) => s >= 80 ? "ممتاز" : s >= 60 ? "جيد" : s >= 40 ? "مقبول" : "ضعيف";
const fmtPrice = (p: number, c: string) => `${p.toLocaleString("ar-SA")} ${c === "SAR" ? "ر.س" : c}`;

// ─── Fonts Injection ──────────────────────────────────────────────────────────
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060a12; font-family: 'IBM Plex Sans Arabic', sans-serif; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0d1421; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  .card-hover:hover { border-color: #1e3a5f !important; transform: translateY(-1px); transition: all 0.2s; }
  input:focus { outline: none; border-color: #10b981 !important; }
`;

// ─── Score Arc ────────────────────────────────────────────────────────────────
function ScoreArc({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const dashArr = circ * 0.75;
  const dashOff = dashArr * (1 - pct);
  const color = scoreColor(score);
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(135deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0d1421" strokeWidth={8}
        strokeDasharray={`${dashArr} ${circ - dashArr}`} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dashArr * pct} ${circ}`}
        strokeDashoffset={0} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x={cx} y={cy + 6} textAnchor="middle" fill={color}
        style={{ transform: `rotate(-135deg)`, transformOrigin: `${cx}px ${cy}px`,
          fontSize: size > 80 ? 22 : 14, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
        {score}
      </text>
    </svg>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
          <span>{icon}</span>{label}
        </span>
        <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: scoreColor(value), fontWeight: 600 }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 4, background: "#0d1421", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: `linear-gradient(90deg, ${scoreColor(value)}88, ${scoreColor(value)})`,
          borderRadius: 2, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
}

// ─── Store Score Card ─────────────────────────────────────────────────────────
function StoreScoreCard({ products }: { products: Product[] }) {
  if (!products.length) return null;

  const avg = Math.round(products.reduce((s, p) => s + p.score_total, 0) / products.length);
  const avgTitle = Math.round(products.reduce((s, p) => s + p.score_title, 0) / products.length);
  const avgImages = Math.round(products.reduce((s, p) => s + p.score_images, 0) / products.length);
  const avgDesc = Math.round(products.reduce((s, p) => s + p.score_description, 0) / products.length);
  const avgSeo = Math.round(products.reduce((s, p) => s + p.score_seo, 0) / products.length);
  const avgPrice = Math.round(products.reduce((s, p) => s + p.score_price, 0) / products.length);

  const grade = scoreGrade(avg);
  const gradeColors: Record<string, string> = { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#ef4444" };

  return (
    <div style={{ ...S.card, display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "start" }} className="fade-up">
      {/* Left: big score */}
      <div style={{ textAlign: "center", minWidth: 140 }}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Store Quick Score
        </div>
        <ScoreArc score={avg} size={120} />
        <div style={{ marginTop: 10 }}>
          <span style={{
            display: "inline-block", fontSize: 32, fontWeight: 800,
            color: gradeColors[grade], fontFamily: "JetBrains Mono, monospace",
            background: `${gradeColors[grade]}15`, padding: "2px 14px", borderRadius: 8,
          }}>{grade}</span>
        </div>
        <div style={{ fontSize: 14, color: scoreColor(avg), marginTop: 8, fontWeight: 600 }}>
          {scoreLabel(avg)}
        </div>
      </div>

      {/* Right: breakdown */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>تقييم جودة متجرك</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>
            بناءً على تحليل {products.length} منتج
          </div>
        </div>
        <ScoreBar label="جودة العناوين" value={avgTitle} icon="✍️" />
        <ScoreBar label="جودة الصور" value={avgImages} icon="🖼️" />
        <ScoreBar label="جودة الوصف" value={avgDesc} icon="📝" />
        <ScoreBar label="تحسين SEO" value={avgSeo} icon="🔍" />
        <ScoreBar label="تنافسية الأسعار" value={avgPrice} icon="💰" />

        {/* Issues summary */}
        <div style={{ marginTop: 16, padding: "12px 14px", background: "#0d1421", borderRadius: 8, border: "1px solid #0f2035" }}>
          {[
            { cond: avgTitle < 60, msg: "عناوين المنتجات تحتاج تحسيناً — أضف تفاصيل ومزايا" },
            { cond: avgImages < 60, msg: "أضف صوراً أكثر لمنتجاتك — الحد الأدنى 3 صور لكل منتج" },
            { cond: avgDesc < 60, msg: "الوصف قصير جداً — استهدف 100+ كلمة لكل منتج" },
            { cond: avgSeo < 60, msg: "SEO ضعيف — أضف كلمات مفتاحية في العناوين والأوصاف" },
          ].filter(x => x.cond).length === 0 ? (
            <div style={{ fontSize: 13, color: "#10b981" }}>✅ متجرك في حالة ممتازة، استمر في المحافظة على الجودة</div>
          ) : (
            [
              { cond: avgTitle < 60, msg: "عناوين المنتجات تحتاج تحسيناً — أضف تفاصيل ومزايا" },
              { cond: avgImages < 60, msg: "أضف صوراً أكثر لمنتجاتك — الحد الأدنى 3 صور لكل منتج" },
              { cond: avgDesc < 60, msg: "الوصف قصير جداً — استهدف 100+ كلمة لكل منتج" },
              { cond: avgSeo < 60, msg: "SEO ضعيف — أضف كلمات مفتاحية في العناوين والأوصاف" },
            ].filter(x => x.cond).map((issue, i) => (
              <div key={i} style={{ fontSize: 12, color: "#f59e0b", display: "flex", gap: 6, alignItems: "flex-start", marginTop: i > 0 ? 6 : 0 }}>
                <span style={{ marginTop: 1 }}>⚠</span><span>{issue.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Optimizer Panel ───────────────────────────────────────────────────────
function AIOptimizerPanel({ product, merchantId, onClose }: { product: Product; merchantId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [activeTab, setActiveTab] = useState<"title" | "description" | "keywords">("title");

  async function runOptimizer() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchantId, product_id: product.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Parse AI response into structured result
      const aiText = data.analysis || data.result || JSON.stringify(data);
      setResult(parseAIResult(aiText, product));
    } catch (e: any) {
      setError(e.message || "فشل الاتصال بالذكاء الاصطناعي");
    }
    setLoading(false);
  }

  function parseAIResult(text: string, p: Product): AIResult {
    // Try to extract structured data from AI response
    const titleMatch = text.match(/عنوان[^:：]*[:：]\s*([^\n]+)/);
    const descMatch = text.match(/وصف[^:：]*[:：]\s*([\s\S]+?)(?=\n#|\nكلمات|$)/i);
    const kwMatch = text.match(/كلمات[^:：]*[:：]\s*([^\n]+)/);

    return {
      title: titleMatch?.[1]?.trim() || `${p.name} - جودة عالية | أفضل سعر في السعودية`,
      description: descMatch?.[1]?.trim() || `${p.name} من أفضل المنتجات في السوق السعودي. يتميز بجودة عالية وسعر تنافسي. مناسب لجميع الاحتياجات. يُشحن سريعاً لجميع مناطق المملكة.`,
      keywords: kwMatch?.[1]?.split(/[,،]/).map(k => k.trim()).filter(Boolean) || [p.name, p.category, "سعودي", "متجر", "جودة"].filter(Boolean),
      price_suggestion: `${p.price} ${p.currency}`,
      reasoning: text,
    };
  }

  async function applyChanges() {
    if (!result) return;
    setApplying(true);
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/apply-optimization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          product_id: product.id,
          updates: { name: result.title, description: result.description },
        }),
      });
      setApplied(true);
    } catch {
      setError("فشل تطبيق التغييرات");
    }
    setApplying(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: "#0a1120", border: "1px solid #1e3a5f", borderRadius: 16,
        width: "100%", maxWidth: 680, maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #0f2035", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>✨ AI Optimizer</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Current score */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <div style={S.miniStat}>
              <div style={{ fontSize: 11, color: "#475569" }}>الدرجة الحالية</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor(product.score_total), fontFamily: "JetBrains Mono" }}>{product.score_total}</div>
            </div>
            <div style={{ ...S.miniStat, flex: 1, justifyContent: "center", alignItems: "center", display: "flex" }}>
              <div style={{ fontSize: 12, color: "#475569", textAlign: "center", lineHeight: 1.6 }}>
                الذكاء الاصطناعي سيحسّن عنوان المنتج، وصفه، والكلمات المفتاحية
                <br />لرفع درجته وزيادة المبيعات
              </div>
            </div>
          </div>

          {/* CTA if no result yet */}
          {!result && !loading && (
            <button onClick={runOptimizer} style={S.primaryBtn}>
              🚀 تشغيل تحسين الذكاء الاصطناعي
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 40, height: 40, border: "3px solid #0f2035", borderTopColor: "#10b981",
                borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
              }} />
              <div style={{ fontSize: 13, color: "#475569" }}>الذكاء الاصطناعي يحلل منتجك...</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: 12, background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "#ef4444" }}>⚠ {error}</span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#060a12", padding: 4, borderRadius: 8 }}>
                {[{ k: "title", l: "العنوان" }, { k: "description", l: "الوصف" }, { k: "keywords", l: "الكلمات المفتاحية" }].map(t => (
                  <button key={t.k} onClick={() => setActiveTab(t.k as any)} style={{
                    flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13,
                    background: activeTab === t.k ? "#10b98120" : "transparent",
                    color: activeTab === t.k ? "#10b981" : "#475569",
                    fontFamily: "IBM Plex Sans Arabic, sans-serif",
                  }}>{t.l}</button>
                ))}
              </div>

              {activeTab === "title" && (
                <div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>العنوان الحالي</div>
                  <div style={{ padding: 12, background: "#060a12", borderRadius: 8, fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#10b981", marginBottom: 8 }}>✨ العنوان المقترح</div>
                  <div style={{ padding: 12, background: "#10b98110", border: "1px solid #10b98130", borderRadius: 8, fontSize: 14, color: "#e2e8f0" }}>
                    {result.title}
                  </div>
                </div>
              )}

              {activeTab === "description" && (
                <div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>الوصف الحالي</div>
                  <div style={{ padding: 12, background: "#060a12", borderRadius: 8, fontSize: 13, color: "#64748b", marginBottom: 12, maxHeight: 100, overflow: "auto" }}>
                    {product.description ? product.description.replace(/<[^>]*>/g, "") : "لا يوجد وصف"}
                  </div>
                  <div style={{ fontSize: 11, color: "#10b981", marginBottom: 8 }}>✨ الوصف المقترح</div>
                  <div style={{ padding: 12, background: "#10b98110", border: "1px solid #10b98130", borderRadius: 8, fontSize: 13, color: "#e2e8f0", lineHeight: 1.7, maxHeight: 180, overflow: "auto" }}>
                    {result.description}
                  </div>
                </div>
              )}

              {activeTab === "keywords" && (
                <div>
                  <div style={{ fontSize: 11, color: "#10b981", marginBottom: 12 }}>✨ الكلمات المفتاحية المقترحة</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.keywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: "5px 12px", background: "#10b98115", border: "1px solid #10b98130",
                        borderRadius: 20, fontSize: 13, color: "#10b981",
                      }}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply button */}
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                {applied ? (
                  <div style={{ flex: 1, textAlign: "center", padding: 14, background: "#10b98115", borderRadius: 10, color: "#10b981", fontSize: 14, fontWeight: 600 }}>
                    ✅ تم تطبيق التحسينات بنجاح
                  </div>
                ) : (
                  <>
                    <button onClick={applyChanges} disabled={applying} style={{ ...S.primaryBtn, flex: 1 }}>
                      {applying ? "⏳ جاري التطبيق..." : "✅ تطبيق على المتجر"}
                    </button>
                    <button onClick={runOptimizer} style={{ ...S.secondaryBtn, padding: "0 16px" }}>
                      🔄 إعادة
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onOptimize }: { product: Product; onOptimize: (p: Product) => void }) {
  const [expanded, setExpanded] = useState(false);
  const col = scoreColor(product.score_total);

  return (
    <div style={{ ...S.card, padding: 0, overflow: "hidden" }} className="card-hover">
      {/* Top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${col}44, ${col})` }} />

      <div style={{ padding: "16px 18px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
          {product.main_image ? (
            <img src={product.main_image} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", background: "#0d1421" }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: 8, background: "#0d1421", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {product.name}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>{fmtPrice(product.price, product.currency)}</span>
              {product.category && <span style={S.tag}>{product.category}</span>}
              <span style={S.tag}>{product.images_count} صور</span>
            </div>
          </div>
          <ScoreArc score={product.score_total} size={52} />
        </div>

        {/* Mini bars */}
        {expanded && (
          <div style={{ marginBottom: 12, animation: "fadeUp 0.3s ease" }}>
            <ScoreBar label="العنوان" value={product.score_title} icon="✍️" />
            <ScoreBar label="الصور" value={product.score_images} icon="🖼️" />
            <ScoreBar label="الوصف" value={product.score_description} icon="📝" />
            <ScoreBar label="SEO" value={product.score_seo} icon="🔍" />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onOptimize(product)}
            style={{ ...S.primaryBtn, flex: 1, padding: "8px 0", fontSize: 12 }}
          >
            ✨ تحسين بالذكاء الاصطناعي
          </button>
          <button
            onClick={() => setExpanded(x => !x)}
            style={{ ...S.secondaryBtn, padding: "8px 12px", fontSize: 12 }}
          >
            {expanded ? "▲" : "▼"}
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
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "attention" | "good">("all");
  const [activeNav, setActiveNav] = useState<"overview" | "products" | "analytics" | "settings">("overview");
  const [optimizerProduct, setOptimizerProduct] = useState<Product | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setMerchantId(p.get("merchant_id"));
  }, []);

  useEffect(() => {
    if (merchantId) loadData();
    else setLoading(false);
  }, [merchantId]);

  useEffect(() => {
    let list = [...products];
    if (filter === "attention") list = list.filter(p => p.needs_attention);
    if (filter === "good") list = list.filter(p => !p.needs_attention);
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [search, filter, products]);

  async function loadData() {
    setLoading(true);
    const { data: m } = await supabase.from("merchants").select("*").eq("id", merchantId).single();
    if (m) setMerchant(m);
    const { data: p } = await supabase.from("products").select("*").eq("merchant_id", merchantId).order("score_total", { ascending: true });
    if (p) { setProducts(p); setFiltered(p); }
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
      setSyncMsg(data.success ? `✅ تمت مزامنة ${data.synced} منتج` : "❌ فشلت المزامنة");
      if (data.success) await loadData();
    } catch { setSyncMsg("❌ خطأ في الاتصال"); }
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 5000);
  }

  // ── Stats ──
  const total = products.length;
  const attention = products.filter(p => p.needs_attention).length;
  const excellent = products.filter(p => p.score_total >= 80).length;
  const avgScore = total ? Math.round(products.reduce((s, p) => s + p.score_total, 0) / total) : 0;

  // ── No merchant_id ──
  if (!merchantId) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060a12" }}>
      <style>{fontStyle}</style>
      <div style={{ textAlign: "center", padding: "48px 40px", background: "#0a1120", border: "1px solid #1e3a5f", borderRadius: 20, maxWidth: 380 }}>
        <div style={{ fontSize: 42, marginBottom: 16 }}>🔗</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#10b981", marginBottom: 8, fontFamily: "IBM Plex Sans Arabic" }}>محسِّن</div>
        <div style={{ fontSize: 14, color: "#475569", marginBottom: 28, lineHeight: 1.7 }}>
          اربط متجرك لتبدأ في تحليل منتجاتك وتحسين مبيعاتك بالذكاء الاصطناعي
        </div>
        <button style={S.primaryBtn} onClick={() => window.location.href = `${SUPABASE_URL}/functions/v1/salla-oauth/initiate`}>
          ربط متجر سلة
        </button>
      </div>
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060a12", flexDirection: "column", gap: 16 }}>
      <style>{fontStyle}</style>
      <div style={{ width: 36, height: 36, border: "3px solid #0f2035", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 13, color: "#475569" }}>جاري تحميل البيانات...</div>
    </div>
  );

  // ── Main ──
  return (
    <div dir="rtl" style={{ display: "flex", minHeight: "100vh", background: "#060a12", fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
      <style>{fontStyle}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, background: "#08101e", borderLeft: "1px solid #0f2035",
        display: "flex", flexDirection: "column", padding: "24px 14px",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981", letterSpacing: "-0.5px" }}>محسِّن</div>
          <div style={{ fontSize: 10, color: "#1e3a5f", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>AI Commerce Intelligence</div>
        </div>

        {/* Store Info */}
        {merchant && (
          <div style={{ padding: "12px 10px", background: "#0d1421", borderRadius: 10, marginBottom: 20, textAlign: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px",
              background: "linear-gradient(135deg, #10b981, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 700, color: "#060a12",
            }}>{merchant.store_name?.[0] ?? "م"}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{merchant.store_name}</div>
            <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 2 }}>{merchant.store_domain || "سلة"}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { k: "overview", icon: "⬡", label: "نظرة عامة" },
            { k: "products", icon: "◫", label: "المنتجات" },
            { k: "analytics", icon: "◈", label: "التحليلات" },
            { k: "settings", icon: "◎", label: "الإعدادات" },
          ].map(item => (
            <button key={item.k} onClick={() => setActiveNav(item.k as any)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: activeNav === item.k ? "#10b98115" : "transparent",
              color: activeNav === item.k ? "#10b981" : "#475569",
              fontSize: 13, fontFamily: "IBM Plex Sans Arabic, sans-serif",
              fontWeight: activeNav === item.k ? 600 : 400,
              transition: "all 0.15s", textAlign: "right", width: "100%",
            }}>
              <span style={{ fontSize: 16, opacity: 0.8 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.k === "products" && attention > 0 && (
                <span style={{ marginRight: "auto", background: "#ef444420", color: "#ef4444", fontSize: 10, padding: "1px 6px", borderRadius: 10 }}>{attention}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sync */}
        <div style={{ marginTop: 16, borderTop: "1px solid #0f2035", paddingTop: 14 }}>
          <button onClick={syncProducts} disabled={syncing} style={{
            width: "100%", padding: "9px 12px", borderRadius: 8,
            border: "1px solid #1e3a5f", background: "transparent",
            color: syncing ? "#475569" : "#64748b", cursor: syncing ? "not-allowed" : "pointer",
            fontSize: 12, fontFamily: "IBM Plex Sans Arabic, sans-serif",
            display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          }}>
            <span style={{ animation: syncing ? "spin 1s linear infinite" : "none", display: "inline-block" }}>↻</span>
            {syncing ? "جاري المزامنة..." : "مزامنة المنتجات"}
          </button>
          {syncMsg && <div style={{ fontSize: 11, color: "#475569", textAlign: "center", marginTop: 6 }}>{syncMsg}</div>}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>

        {/* ══ Overview ══ */}
        {activeNav === "overview" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0" }}>
                مرحباً{merchant?.store_name ? `، ${merchant.store_name}` : ""} 👋
              </h1>
              <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                هذه نظرة شاملة على أداء متجرك
              </p>
            </div>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "إجمالي المنتجات", val: total, icon: "📦", color: "#3b82f6" },
                { label: "متوسط الدرجة", val: `${avgScore}/100`, icon: "⭐", color: "#f59e0b" },
                { label: "تحتاج اهتمام", val: attention, icon: "⚠", color: "#ef4444" },
                { label: "درجة ممتازة", val: excellent, icon: "✅", color: "#10b981" },
              ].map((stat, i) => (
                <div key={i} style={{ ...S.card, textAlign: "center", padding: "18px 12px", borderColor: `${stat.color}22`, animation: `fadeUp ${0.1 + i * 0.08}s ease` }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, fontFamily: "JetBrains Mono, monospace" }}>{stat.val}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Store Score */}
            {total > 0 && <StoreScoreCard products={products} />}

            {/* Needs attention */}
            {attention > 0 && (
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>⚠ منتجات تحتاج اهتمام فوري</div>
                  <button onClick={() => setActiveNav("products")} style={{ fontSize: 12, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}>
                    عرض الكل ←
                  </button>
                </div>
                {products.filter(p => p.needs_attention).slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0f2035" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: "#0d1421", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, overflow: "hidden", flexShrink: 0 }}>
                      {p.main_image ? <img src={p.main_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    </div>
                    <ScoreArc score={p.score_total} size={40} />
                    <button onClick={() => setOptimizerProduct(p)} style={{ ...S.primaryBtn, padding: "5px 10px", fontSize: 11 }}>
                      تحسين
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {total === 0 && (
              <div style={{ ...S.card, textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 6 }}>لا توجد منتجات بعد</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>اضغط على مزامنة المنتجات لجلب منتجاتك من سلة</div>
                <button onClick={syncProducts} disabled={syncing} style={S.primaryBtn}>
                  {syncing ? "⏳ جاري المزامنة..." : "🔄 مزامنة المنتجات الآن"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ Products ══ */}
        {activeNav === "products" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>المنتجات</h1>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 22 }}>تقييمات جودة المنتجات وأداء محرك البحث</p>

            {/* Toolbar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍  ابحث عن منتج..."
                style={{ flex: 1, minWidth: 200, padding: "9px 14px", background: "#0a1120", border: "1px solid #0f2035", borderRadius: 8, color: "#e2e8f0", fontSize: 13, fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
              />
              <div style={{ display: "flex", gap: 4, background: "#08101e", padding: 3, borderRadius: 8, border: "1px solid #0f2035" }}>
                {[{ k: "all", l: `الكل (${total})` }, { k: "attention", l: `⚠ تحتاج اهتمام (${attention})` }, { k: "good", l: `✅ جيدة (${total - attention})` }].map(t => (
                  <button key={t.k} onClick={() => setFilter(t.k as any)} style={{
                    padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
                    background: filter === t.k ? "#10b98120" : "transparent",
                    color: filter === t.k ? "#10b981" : "#475569",
                    fontFamily: "IBM Plex Sans Arabic, sans-serif",
                  }}>{t.l}</button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ color: "#475569" }}>{products.length === 0 ? "لا توجد منتجات — اضغط مزامنة" : "لا توجد نتائج للبحث"}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {filtered.map((p, i) => (
                  <div key={p.id} style={{ animation: `fadeUp ${0.05 + i * 0.04}s ease` }}>
                    <ProductCard product={p} onOptimize={setOptimizerProduct} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ Analytics ══ */}
        {activeNav === "analytics" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>التحليلات</h1>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 22 }}>توزيع درجات الجودة وأداء المنتجات</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Distribution */}
              <div style={{ ...S.card, gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 20 }}>توزيع درجات الجودة</div>
                {[
                  { label: "ممتاز (80-100)", count: products.filter(p => p.score_total >= 80).length, color: "#10b981", grade: "A" },
                  { label: "جيد (60-79)", count: products.filter(p => p.score_total >= 60 && p.score_total < 80).length, color: "#3b82f6", grade: "B" },
                  { label: "مقبول (40-59)", count: products.filter(p => p.score_total >= 40 && p.score_total < 60).length, color: "#f59e0b", grade: "C" },
                  { label: "ضعيف (0-39)", count: products.filter(p => p.score_total < 40).length, color: "#ef4444", grade: "D" },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color, fontFamily: "JetBrains Mono", width: 16 }}>{item.grade}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#475569" }}>{item.label}</span>
                        <span style={{ fontSize: 12, color: item.color, fontFamily: "JetBrains Mono", fontWeight: 600 }}>{item.count} منتج</span>
                      </div>
                      <div style={{ height: 6, background: "#0d1421", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: total ? `${(item.count / total) * 100}%` : "0%", background: item.color, borderRadius: 3, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Averages */}
              {[
                { label: "متوسط الدرجة الكلية", val: avgScore, desc: "القيمة المتوسطة لدرجة جودة جميع منتجاتك" },
                { label: "أعلى درجة", val: total ? Math.max(...products.map(p => p.score_total)) : 0, desc: "أفضل منتج من حيث الجودة" },
                { label: "أدنى درجة", val: total ? Math.min(...products.map(p => p.score_total)) : 0, desc: "المنتج الأكثر حاجة للتحسين" },
                { label: "معدل التميز", val: total ? Math.round((excellent / total) * 100) : 0, desc: "نسبة المنتجات ذات الدرجة الممتازة" },
              ].map((item, i) => (
                <div key={i} style={S.card}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(item.val), fontFamily: "JetBrains Mono" }}>{item.val}{i === 3 ? "%" : ""}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: "6px 0 4px" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ Settings ══ */}
        {activeNav === "settings" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 }}>الإعدادات</h1>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 22 }}>إعدادات المتجر والنظام</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={S.card}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>معلومات المتجر</div>
                {[
                  { label: "اسم المتجر", val: merchant?.store_name || "—" },
                  { label: "النطاق", val: merchant?.store_domain || "—" },
                  { label: "المعرِّف", val: merchantId || "—" },
                  { label: "آخر مزامنة", val: products[0]?.last_synced_at ? new Date((products[0] as any).last_synced_at).toLocaleString("ar-SA") : "لم تتم بعد" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #0f2035", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#475569" }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 240 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>مزامنة المنتجات</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>جلب أحدث بيانات المنتجات من متجر سلة</div>
                <button onClick={syncProducts} disabled={syncing} style={{ ...S.primaryBtn, width: "auto" }}>
                  {syncing ? "⏳ جاري المزامنة..." : "🔄 مزامنة الآن"}
                </button>
                {syncMsg && <div style={{ fontSize: 12, color: "#10b981", marginTop: 10 }}>{syncMsg}</div>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── AI Optimizer Modal ── */}
      {optimizerProduct && (
        <AIOptimizerPanel
          product={optimizerProduct}
          merchantId={merchantId!}
          onClose={() => setOptimizerProduct(null)}
        />
      )}
    </div>
  );
}

// ─── Shared Styles ─────────────────────────────────────────────────────────────
const S: Record<string, any> = {
  card: {
    background: "#0a1120", border: "1px solid #0f2035",
    borderRadius: 12, padding: 20,
    transition: "border-color 0.2s, transform 0.2s",
  },
  miniStat: {
    padding: "12px 16px", background: "#060a12",
    border: "1px solid #0f2035", borderRadius: 8,
  },
  tag: {
    padding: "2px 8px", background: "#0f2035",
    borderRadius: 4, fontSize: 11, color: "#475569",
  },
  primaryBtn: {
    padding: "10px 20px", borderRadius: 8,
    border: "none", background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "IBM Plex Sans Arabic, sans-serif",
    transition: "opacity 0.15s", width: "100%", textAlign: "center",
  },
  secondaryBtn: {
    padding: "10px 16px", borderRadius: 8,
    border: "1px solid #1e3a5f", background: "transparent",
    color: "#64748b", fontSize: 13, cursor: "pointer",
    fontFamily: "IBM Plex Sans Arabic, sans-serif",
    transition: "all 0.15s",
  },
};
