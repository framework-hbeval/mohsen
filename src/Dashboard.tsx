import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Merchant {
  id: string;
  store_name: string;
  store_logo: string;
  plan: "free" | "pro" | "enterprise";
  products_analyzed: number;
  monthly_limit: number;
}

interface Product {
  id: string;
  external_product_id: string;
  name: string;
  image_url: string;
  price: number;
  quick_score: number;
  score_grade: string;
  score_title: number;
  score_description: number;
  score_images: number;
  score_pricing: number;
  analysis_json: {
    issues: string[];
    suggestions: {
      title?: string;
      description?: string;
      price_suggestion?: number;
      price_reasoning?: string;
    };
    keywords: string[];
  } | null;
  is_optimized: boolean;
  last_analyzed: string | null;
}

interface MerchantStats {
  total_products: number;
  avg_score: number;
  needs_attention: number;
  optimized_count: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  if (score >= 20) return "#ef4444";
  return "#6b7280";
}

function getGradeLabel(grade: string): string {
  const map: Record<string, string> = {
    A: "ممتاز", B: "جيد", C: "متوسط", D: "ضعيف", F: "سيئ",
  };
  return map[grade] ?? grade;
}

function ScoreRing({ score, size = 60 }: { score: number; size?: number }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = getScoreColor(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2430" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="700"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  );
}

function MiniBar({ label, value, max = 25, color }: {
  label: string; value: number; max?: number; color: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</span>
        <span style={{ fontSize: "12px", color, fontWeight: "600" }}>{value}/{max}</span>
      </div>
      <div style={{ height: "4px", background: "#1e2430", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px",
          transition: "width 0.8s ease" }}/>
      </div>
    </div>
  );
}

function ScorePill({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = getScoreColor(pct);
  if (!value && value !== 0) return <span style={{ color: "#6b7280", fontSize: "12px" }}>—</span>;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "100px",
      fontSize: "12px", fontWeight: "600", background: `${color}18`, color,
      border: `1px solid ${color}30` }}>
      {value}/{max}
    </span>
  );
}

function ProductModal({ product, onClose, onOptimized, merchantId }: {
  product: Product; onClose: () => void; onOptimized: () => void; merchantId: string;
}) {
  const [applying, setApplying] = useState(false);

  const applyOptimization = async () => {
    setApplying(true);
    try {
      await supabase.from("products")
        .update({ is_optimized: true, optimized_at: new Date().toISOString() })
        .eq("merchant_id", merchantId)
        .eq("external_product_id", product.external_product_id);
      onOptimized();
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} dir="rtl">
        <div style={styles.modalHeader}>
          <h3 style={{ fontFamily: "Tajawal, sans-serif", fontSize: "18px", fontWeight: "700" }}>
            تحليل: {product.name}
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{ textAlign: "center" }}>
            <ScoreRing score={product.quick_score} size={80}/>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>الدرجة الإجمالية</div>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <MiniBar label="جودة العنوان" value={product.score_title}
            color={getScoreColor((product.score_title/25)*100)}/>
          <MiniBar label="جودة الوصف" value={product.score_description}
            color={getScoreColor((product.score_description/25)*100)}/>
          <MiniBar label="جودة الصور" value={product.score_images}
            color={getScoreColor((product.score_images/25)*100)}/>
          <MiniBar label="تنافسية السعر" value={product.score_pricing}
            color={getScoreColor((product.score_pricing/25)*100)}/>
        </div>

        {product.analysis_json?.issues && product.analysis_json.issues.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", color: "#ef4444", marginBottom: "10px", fontWeight: "600" }}>
              ⚠️ المشاكل المكتشفة
            </h4>
            {product.analysis_json.issues.map((issue, i) => (
              <div key={i} style={styles.issuePill}>{issue}</div>
            ))}
          </div>
        )}

        {product.analysis_json?.suggestions?.title && (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", color: "#00d4aa", marginBottom: "10px", fontWeight: "600" }}>
              ✨ العنوان المقترح
            </h4>
            <div style={styles.suggestionBox}>{product.analysis_json.suggestions.title}</div>
          </div>
        )}

        {product.analysis_json?.suggestions?.description && (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", color: "#00d4aa", marginBottom: "10px", fontWeight: "600" }}>
              📝 الوصف المقترح
            </h4>
            <div style={styles.suggestionBox}>{product.analysis_json.suggestions.description}</div>
          </div>
        )}

        {product.analysis_json?.keywords && product.analysis_json.keywords.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "14px", color: "#3b82f6", marginBottom: "10px", fontWeight: "600" }}>
              🔑 الكلمات المفتاحية
            </h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {product.analysis_json.keywords.map((kw, i) => (
                <span key={i} style={styles.kwBadge}>{kw}</span>
              ))}
            </div>
          </div>
        )}

        <button onClick={applyOptimization} disabled={applying}
          style={{ ...styles.btnPrimary, width: "100%", justifyContent: "center",
            opacity: applying ? 0.7 : 1 }}>
          {applying ? "⏳ جاري التطبيق..." : "✨ تطبيق التحسينات"}
        </button>
      </div>
    </div>
  );
}

export default function MohsenDashboard() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "needs_attention" | "optimized">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const merchantId = new URLSearchParams(window.location.search).get("merchant_id");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    if (!merchantId) return;
    setLoading(true);
    try {
      const { data: m } = await supabase.from("merchants")
        .select("id, store_name, store_logo, plan, products_analyzed, monthly_limit")
        .eq("id", merchantId).single();
      if (m) setMerchant(m);

      const { data: p } = await supabase.from("products").select("*")
        .eq("merchant_id", merchantId).order("quick_score", { ascending: true });
      if (p) setProducts(p);

      const { data: s } = await supabase.rpc("get_merchant_stats", { p_merchant_id: merchantId });
      if (s) setStats(s);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => { loadData(); }, [loadData]);

  const analyzeProduct = async (externalProductId: string) => {
    setAnalyzing(externalProductId);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { merchant_id: merchantId, product_id: externalProductId },
      });
      if (error) throw error;
      showToast(`تم التحليل — الدرجة: ${data.score}/100`);
      await loadData();
    } catch {
      showToast("حدث خطأ أثناء التحليل", "error");
    } finally {
      setAnalyzing(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "needs_attention") return p.quick_score < 40;
    if (filter === "optimized") return p.is_optimized;
    return true;
  });

  if (!merchantId) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔗</div>
          <h2 style={{ color: "#e8eaf0", fontFamily: "Tajawal, sans-serif",
            fontSize: "28px", marginBottom: "12px", fontWeight: "800" }}>
            ربط متجرك بـ محسِّن
          </h2>
          <p style={{ color: "#9ca3af", marginBottom: "32px", fontSize: "15px", lineHeight: "1.8" }}>
            سجّل دخولك بمتجر سلة لتبدأ في تحليل منتجاتك وتحسين مبيعاتك
          </p>
          <button
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/salla-oauth/initiate`;
            }}
            style={styles.btnPrimary}>
            ربط متجر سلة
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <div style={styles.spinner}/>
          <p style={{ color: "#9ca3af", marginTop: "16px" }}>جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} dir="rtl">
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)"
        }}>
          {toast.type === "success" ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={{ fontSize: "22px" }}>✦</span>
          <span style={{ fontFamily: "Tajawal, sans-serif", fontWeight: "800", fontSize: "20px" }}>
            محسِّن
          </span>
        </div>

        {merchant && (
          <div style={styles.storeCard}>
            <div style={styles.storeLogoPlaceholder}>🏪</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#e8eaf0" }}>
                {merchant.store_name}
              </div>
              <div style={{
                fontSize: "11px",
                background: merchant.plan === "free" ? "rgba(107,114,128,0.2)" : "rgba(0,212,170,0.15)",
                color: merchant.plan === "free" ? "#9ca3af" : "#00d4aa",
                padding: "2px 8px", borderRadius: "100px", display: "inline-block", marginTop: "4px"
              }}>
                {merchant.plan === "free" ? "مجاني" : "Pro ✓"}
              </div>
            </div>
          </div>
        )}

        <nav style={styles.nav}>
          {[
            { icon: "📊", label: "لوحة التحكم" },
            { icon: "📦", label: "المنتجات" },
            { icon: "📈", label: "التحليلات" },
            { icon: "⚙️", label: "الإعدادات" },
          ].map((item, i) => (
            <div key={item.label}
              style={{ ...styles.navItem, ...(i === 0 ? styles.navItemActive : {}) }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {merchant?.plan === "free" && (
          <div style={styles.upgradeBox}>
            <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "600", marginBottom: "6px" }}>
              ⚡ الخطة المجانية
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>
              {merchant.products_analyzed}/{merchant.monthly_limit} منتجات هذا الشهر
            </div>
            <div style={styles.usageBar}>
              <div style={{
                ...styles.usageFill,
                width: `${Math.min((merchant.products_analyzed / merchant.monthly_limit) * 100, 100)}%`
              }}/>
            </div>
            <button style={styles.btnUpgrade}>ترقية لـ Pro — 199 ريال/شهر</button>
          </div>
        )}
      </aside>

      <main style={styles.main}>
        {stats && (
          <div style={styles.statsRow}>
            {[
              { label: "إجمالي المنتجات", value: stats.total_products, icon: "📦", color: "#3b82f6" },
              { label: "متوسط الدرجة", value: `${stats.avg_score || 0}/100`, icon: "⭐", color: "#f59e0b" },
              { label: "تحتاج اهتمام", value: stats.needs_attention, icon: "⚠️", color: "#ef4444" },
              { label: "تم تحسينها", value: stats.optimized_count, icon: "✅", color: "#10b981" },
            ].map((s) => (
              <div key={s.label} style={styles.statCard}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: s.color,
                  fontFamily: "Tajawal, sans-serif" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "13px", color: "#9ca3af" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.productsHeader}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", fontFamily: "Tajawal, sans-serif" }}>
            المنتجات وتقييمات الجودة
          </h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input placeholder="🔍 ابحث عن منتج..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput}/>
            <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "needs_attention" | "optimized")}
              style={styles.select}>
              <option value="all">جميع المنتجات</option>
              <option value="needs_attention">تحتاج اهتمام</option>
              <option value="optimized">تم تحسينها</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <h3 style={{ color: "#e8eaf0", marginBottom: "8px", fontFamily: "Tajawal, sans-serif" }}>
              لا توجد منتجات بعد
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>
              ستظهر منتجاتك هنا بعد مزامنة متجرك
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["المنتج", "الدرجة", "العنوان", "الوصف", "الصور", "السعر", "الحالة", ""].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={styles.productThumbPlaceholder}>🖼️</div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "500", color: "#e8eaf0",
                            maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis",
                            whiteSpace: "nowrap" }}>
                            {product.name || "منتج بلا اسم"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>{product.price} ريال</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {product.last_analyzed ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <ScoreRing score={product.quick_score} size={48}/>
                          <div style={{ fontSize: "11px", color: getScoreColor(product.quick_score),
                            fontWeight: "600" }}>
                            {getGradeLabel(product.score_grade)}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>لم يُحلَّل</span>
                      )}
                    </td>
                    <td style={styles.td}><ScorePill value={product.score_title} max={25}/></td>
                    <td style={styles.td}><ScorePill value={product.score_description} max={25}/></td>
                    <td style={styles.td}><ScorePill value={product.score_images} max={25}/></td>
                    <td style={styles.td}><ScorePill value={product.score_pricing} max={25}/></td>
                    <td style={styles.td}>
                      {product.is_optimized
                        ? <span style={{ ...styles.badge, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>✓ محسَّن</span>
                        : product.last_analyzed
                          ? <span style={{ ...styles.badge, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>بحاجة تحسين</span>
                          : <span style={{ ...styles.badge, background: "rgba(107,114,128,0.1)", color: "#9ca3af" }}>جديد</span>
                      }
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => analyzeProduct(product.external_product_id)}
                          disabled={analyzing === product.external_product_id}
                          style={{ ...styles.btnSm,
                            opacity: analyzing === product.external_product_id ? 0.6 : 1 }}>
                          {analyzing === product.external_product_id ? "⏳" : "🔍"} تحليل
                        </button>
                        {product.last_analyzed && !product.is_optimized && (
                          <button onClick={() => setSelectedProduct(product)}
                            style={{ ...styles.btnSm, background: "rgba(0,212,170,0.1)",
                              color: "#00d4aa" }}>
                            ✨ تحسين
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOptimized={() => {
            loadData();
            setSelectedProduct(null);
            showToast("تم تطبيق التحسينات بنجاح ✨");
          }}
          merchantId={merchantId}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0c10", color: "#e8eaf0",
    fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif", fontSize: "14px" },
  centerBox: { margin: "auto", textAlign: "center", padding: "40px", maxWidth: "440px" },
  spinner: { width: "40px", height: "40px", border: "3px solid #1e2430",
    borderTop: "3px solid #00d4aa", borderRadius: "50%", margin: "0 auto",
    animation: "spin 0.8s linear infinite" },
  toast: { position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
    padding: "12px 28px", borderRadius: "100px", color: "white", fontWeight: "600",
    fontSize: "14px", zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" },
  sidebar: { width: "240px", minHeight: "100vh", background: "#0d0f14",
    borderLeft: "1px solid #1e2430", display: "flex", flexDirection: "column",
    padding: "24px 16px", flexShrink: 0 },
  logo: { display: "flex", alignItems: "center", gap: "10px", color: "#00d4aa",
    fontWeight: "800", fontSize: "20px", marginBottom: "28px", paddingBottom: "20px",
    borderBottom: "1px solid #1e2430" },
  storeCard: { display: "flex", alignItems: "center", gap: "10px", background: "#111318",
    borderRadius: "12px", padding: "12px", marginBottom: "24px", border: "1px solid #1e2430" },
  storeLogoPlaceholder: { width: "36px", height: "36px", borderRadius: "8px",
    background: "#1e2430", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px" },
  nav: { flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
    borderRadius: "10px", cursor: "pointer", color: "#6b7280", fontSize: "14px",
    marginBottom: "4px" },
  navItemActive: { background: "rgba(0,212,170,0.08)", color: "#00d4aa", fontWeight: "600" },
  upgradeBox: { background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
    borderRadius: "12px", padding: "14px", marginTop: "auto" },
  usageBar: { height: "4px", background: "#1e2430", borderRadius: "2px", overflow: "hidden",
    marginBottom: "12px" },
  usageFill: { height: "100%", background: "#f59e0b", borderRadius: "2px" },
  btnUpgrade: { width: "100%", padding: "8px", background: "rgba(245,158,11,0.15)",
    color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px",
    cursor: "pointer", fontSize: "12px", fontWeight: "600", fontFamily: "inherit" },
  main: { flex: 1, padding: "32px", overflow: "auto" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px",
    marginBottom: "28px" },
  statCard: { background: "#111318", border: "1px solid #1e2430", borderRadius: "16px",
    padding: "20px", textAlign: "center" },
  productsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "16px", flexWrap: "wrap", gap: "12px" },
  searchInput: { background: "#111318", border: "1px solid #1e2430", borderRadius: "8px",
    padding: "8px 14px", color: "#e8eaf0", fontSize: "13px", outline: "none",
    fontFamily: "inherit", width: "200px" },
  select: { background: "#111318", border: "1px solid #1e2430", borderRadius: "8px",
    padding: "8px 12px", color: "#e8eaf0", fontSize: "13px", outline: "none",
    fontFamily: "inherit", cursor: "pointer" },
  tableWrapper: { background: "#111318", border: "1px solid #1e2430", borderRadius: "16px",
    overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "right", padding: "12px 16px", fontSize: "11px", letterSpacing: "1px",
    textTransform: "uppercase", color: "#6b7280", borderBottom: "1px solid #1e2430",
    fontWeight: "500", background: "#0d0f14", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #1e2430" },
  td: { padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" },
  productThumbPlaceholder: { width: "40px", height: "40px", borderRadius: "8px",
    background: "#1e2430", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", flexShrink: 0 },
  badge: { padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "600" },
  btnSm: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #1e2430",
    background: "#181c24", color: "#e8eaf0", fontSize: "12px", cursor: "pointer",
    fontFamily: "inherit", fontWeight: "500", whiteSpace: "nowrap" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "12px 28px", background: "#00d4aa", color: "#000", border: "none",
    borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "700",
    fontFamily: "Tajawal, sans-serif" },
  emptyState: { textAlign: "center", padding: "60px", background: "#111318",
    borderRadius: "16px", border: "1px solid #1e2430" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal: { background: "#111318", border: "1px solid #1e2430", borderRadius: "20px",
    padding: "28px", maxWidth: "540px", width: "100%", maxHeight: "85vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "20px" },
  closeBtn: { background: "none", border: "none", color: "#6b7280", cursor: "pointer",
    fontSize: "18px", padding: "4px 8px" },
  issuePill: { display: "inline-block", background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.15)", color: "#fca5a5", padding: "5px 12px",
    borderRadius: "100px", fontSize: "12px", marginLeft: "6px", marginBottom: "6px" },
  suggestionBox: { background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.15)",
    borderRadius: "10px", padding: "14px", fontSize: "14px", color: "#d1fae5",
    lineHeight: "1.8" },
  kwBadge: { background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
    color: "#93c5fd", padding: "4px 10px", borderRadius: "100px", fontSize: "12px" },
};
