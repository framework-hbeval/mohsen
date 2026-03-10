import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const SUPABASE_URL = "https://dcchprqwjfblcypsaggz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JFDcUV-OcYLsBNdzr9JmFw_jeYLjzzD";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Merchant {
  id: string; store_id: string; store_name: string;
  store_domain: string; plan: string; created_at: string;
}
interface Product {
  id: string; external_product_id: string; name: string; description: string;
  price: number; currency: string; images_count: number; main_image: string;
  category: string; sku: string; quantity: number; status: string;
  score_total: number; score_title: number; score_images: number;
  score_description: number; score_price: number; score_seo: number;
  needs_attention: boolean; ai_optimized_at: string; last_synced_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const C  = (s: number) => s >= 80 ? "#00d4a8" : s >= 60 ? "#f5a623" : s >= 40 ? "#ff6b35" : "#ff3b5c";
const G  = (s: number) => s >= 80 ? "A" : s >= 60 ? "B" : s >= 40 ? "C" : "D";
const LB = (s: number) => s >= 80 ? "ممتاز" : s >= 60 ? "جيد" : s >= 40 ? "مقبول" : "ضعيف";
const fmt = (p: number, c: string) => `${p.toLocaleString("ar-SA")} ${c === "SAR" ? "ر.س" : c}`;
const strip = (h: string) => (h || "").replace(/<[^>]*>/g, "").trim();

// ─── CSS ──────────────────────────────────────────────────────────────────────
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Space+Mono:wght@400;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:#03070f; --surf:#080f1c; --surf2:#0c1628;
  --b1:#0e1e35; --b2:#162840;
  --t1:#e8f4f8; --t2:#7a9ab5; --t3:#3d5a73;
  --ac:#00d4a8; --ac2:#0099cc;
  --warn:#f5a623; --danger:#ff3b5c;
  --sans:'Tajawal',sans-serif; --mono:'Space Mono',monospace;
}
html, body, #root {
  background: var(--bg); font-family: var(--sans); color: var(--t1);
  overflow-x: hidden; -webkit-tap-highlight-color: transparent; width: 100%;
}
::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:2px}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

.fu{animation:fadeUp .4s cubic-bezier(.2,0,.2,1) both}
.fi{animation:fadeIn .25s ease both}
.spin{animation:spin .8s linear infinite}
.pulse{animation:pulse 1.4s ease infinite}

.btn-p{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:linear-gradient(135deg,#00d4a8,#0099cc);color:#03070f;border:none;border-radius:10px;font-family:var(--sans);font-weight:800;font-size:14px;cursor:pointer;padding:10px 18px;transition:all .2s;white-space:nowrap}
.btn-p:hover{opacity:.88;box-shadow:0 6px 20px rgba(0,212,168,.3)}
.btn-p:disabled{opacity:.4;cursor:not-allowed}
.btn-p.full{width:100%;padding:13px;font-size:15px}

.btn-g{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:transparent;color:var(--t2);border:1px solid var(--b2);border-radius:10px;font-family:var(--sans);font-size:13px;cursor:pointer;padding:9px 16px;transition:all .2s;white-space:nowrap}
.btn-g:hover{color:var(--t1);border-color:var(--t3)}
.btn-g:disabled{opacity:.4;cursor:not-allowed}

.btn-ic{display:inline-flex;align-items:center;justify-content:center;background:var(--surf2);border:1px solid var(--b1);border-radius:10px;color:var(--t2);cursor:pointer;padding:9px 12px;font-size:16px;transition:all .2s}

.card{background:var(--surf);border:1px solid var(--b1);border-radius:14px;padding:18px}
.card-ac{border-color:rgba(0,212,168,.2)}

.inp{background:var(--surf2);border:1px solid var(--b1);border-radius:10px;color:var(--t1);font-family:var(--sans);font-size:14px;padding:10px 14px;width:100%;transition:border-color .2s}
.inp:focus{outline:none;border-color:rgba(0,212,168,.4)}
.inp::placeholder{color:var(--t3)}

.tag{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
.tag-a{background:rgba(0,212,168,.1);color:var(--ac);border:1px solid rgba(0,212,168,.2)}
.tag-w{background:rgba(245,166,35,.1);color:var(--warn);border:1px solid rgba(245,166,35,.2)}

.prog{height:4px;background:var(--b1);border-radius:2px;overflow:hidden}
.prog-f{height:100%;border-radius:2px;transition:width .9s cubic-bezier(.4,0,.2,1)}

.tabs{display:flex;background:var(--bg);border-radius:10px;padding:3px;gap:2px}
.tab{flex:1;padding:8px 4px;border-radius:8px;border:none;cursor:pointer;font-family:var(--sans);font-size:12px;font-weight:700;transition:all .2s;background:transparent;color:var(--t3)}
.tab.on{background:var(--surf2);color:var(--ac)}

.sp{width:20px;height:20px;border:2px solid var(--b2);border-top-color:var(--ac);border-radius:50%;display:inline-block}
.sp-lg{width:40px;height:40px;border-width:3px}

.nv-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;border-right:2px solid transparent;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:600;width:100%;text-align:right;color:var(--t3);background:transparent;transition:all .15s;margin-bottom:2px}
.nv-item:hover{background:rgba(0,212,168,.05);color:var(--t2)}
.nv-item.on{background:rgba(0,212,168,.1);color:var(--ac);border-right-color:var(--ac)}

.modal-bg{position:fixed;inset:0;background:rgba(3,7,15,.9);backdrop-filter:blur(8px);display:flex;z-index:500;animation:fadeIn .2s ease}

/* Sync loading bar */
.sync-loading-bar{
  position:fixed;top:0;left:0;right:0;height:3px;z-index:9999;
  background:linear-gradient(90deg,transparent,var(--ac),var(--ac2),var(--ac),transparent);
  background-size:200% 100%;
  animation:shimmer 1.2s linear infinite;
}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
`;

// ─── Empty State SVG — صندوق منتجات ─────────────────────────────────────────
function EmptyBox() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="36" width="64" height="44" rx="6" stroke="#0e1e35" strokeWidth="3" fill="#080f1c"/>
      <path d="M16 48h64" stroke="#0e1e35" strokeWidth="3"/>
      <path d="M36 36V28a12 12 0 0124 0v8" stroke="#0e1e35" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="48" cy="60" r="6" stroke="#00d4a8" strokeWidth="2.5" fill="none"/>
      <path d="M48 57v3l2 2" stroke="#00d4a8" strokeWidth="2" strokeLinecap="round"/>
      {/* Tag on box */}
      <rect x="58" y="22" width="20" height="12" rx="3" fill="#0c1628" stroke="#162840" strokeWidth="1.5"/>
      <path d="M62 28h12M62 31h8" stroke="#3d5a73" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function Ring({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r;
  const arc = circ * 0.75, fill = arc * (score / 100);
  const cx = size / 2, cy = size / 2, color = C(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(135deg)", flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0e1e35" strokeWidth={6}
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 4px ${color}55)` }}/>
      <text x={cx} y={cy + (size > 80 ? 8 : 5)} textAnchor="middle" fill={color}
        style={{ transform:`rotate(-135deg)`, transformOrigin:`${cx}px ${cy}px`,
          fontSize: size > 80 ? 20 : 12, fontWeight:700, fontFamily:"Space Mono,monospace" }}>
        {score}
      </text>
    </svg>
  );
}

// ─── Bar ──────────────────────────────────────────────────────────────────────
function Bar({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:12, color:"var(--t2)", display:"flex", alignItems:"center", gap:5 }}>
          {icon} {label}
        </span>
        <span style={{ fontFamily:"var(--mono)", fontSize:11, color:C(value), fontWeight:700 }}>{value}%</span>
      </div>
      <div className="prog">
        <div className="prog-f" style={{ width:`${value}%`, background:`linear-gradient(90deg,${C(value)}66,${C(value)})` }}/>
      </div>
    </div>
  );
}

// ─── Sync Button — مع Spinner واضح ───────────────────────────────────────────
function SyncBtn({ onSync, syncing, full = false }: { onSync: () => void; syncing: boolean; full?: boolean }) {
  return (
    <button className={`btn-p${full ? " full" : ""}`} onClick={onSync} disabled={syncing}
      style={full ? {} : { fontSize: 13 }}>
      {syncing
        ? <><span className="sp spin" style={{ width:16, height:16, borderWidth:"2px" }}/> جاري جلب المنتجات...</>
        : <><span style={{ fontSize:16 }}>🔄</span> مزامنة الآن</>
      }
    </button>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ products, merchant, onSync, syncing, syncMsg, onOptimize, onNav, onUpgrade, isMobile }: any) {
  const total    = products.length;
  const attention = products.filter((p:Product) => p.needs_attention).length;
  const excellent = products.filter((p:Product) => p.score_total >= 80).length;
  const avg  = total ? Math.round(products.reduce((s:number,p:Product)=>s+p.score_total,0)/total) : 0;
  const avgT = total ? Math.round(products.reduce((s:number,p:Product)=>s+p.score_title,0)/total) : 0;
  const avgI = total ? Math.round(products.reduce((s:number,p:Product)=>s+p.score_images,0)/total) : 0;
  const avgD = total ? Math.round(products.reduce((s:number,p:Product)=>s+p.score_description,0)/total) : 0;
  const avgS = total ? Math.round(products.reduce((s:number,p:Product)=>s+p.score_seo,0)/total) : 0;

  // اسم المتجر — يستخدم store_name أولاً، وإذا لم يتوفر يستخدم "متجرك"
  const storeName = merchant?.store_name && !merchant.store_name.startsWith("متجر ")
    ? merchant.store_name
    : merchant?.store_name || "متجرك";

  return (
    <div className="fu">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight:900, color:"var(--t1)" }}>
          مرحباً، {storeName} 👋
        </h1>
        <p style={{ fontSize:13, color:"var(--t2)", marginTop:4 }}>نظرة شاملة على أداء متجرك</p>
      </div>

      {/* Upgrade Banner */}
      {merchant?.plan !== "pro" && (
        <div style={{ background:"linear-gradient(135deg,rgba(0,212,168,.08),rgba(0,153,204,.05))", border:"1px solid rgba(0,212,168,.2)", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
          <span style={{ fontSize:26 }}>⭐</span>
          <div style={{ flex:1, minWidth:160 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"var(--t1)" }}>جرّب <span style={{color:"var(--ac)"}}>StorePilot</span> Pro</div>
            <div style={{ fontSize:12, color:"var(--t2)", marginTop:2 }}>تحسين غير محدود بالذكاء الاصطناعي</div>
          </div>
          <button className="btn-p" onClick={onUpgrade} style={{ fontSize:12, padding:"8px 14px" }}>ابدأ مجاناً ←</button>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          { l:"المنتجات",    v:total,     color:"var(--ac2)", icon:"📦" },
          { l:"متوسط الجودة", v:`${avg}`, color:C(avg),       icon:"⭐" },
          { l:"تحتاج اهتمام", v:attention, color:"var(--warn)",icon:"⚠️" },
          { l:"ممتازة",       v:excellent, color:"var(--ac)",  icon:"✅" },
        ].map((s,i) => (
          <div key={i} className="card" style={{ textAlign:"center", padding: isMobile ? "12px 6px" : "16px 12px" }}>
            <div style={{ fontSize: isMobile ? 18 : 22, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize: isMobile ? 20 : 28, fontWeight:900, color:s.color, fontFamily:"var(--mono)", lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize: isMobile ? 9 : 11, color:"var(--t3)", marginTop:4, lineHeight:1.3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Store Score */}
      {total > 0 && (
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ textAlign:"center", minWidth:100 }}>
              <div style={{ fontSize:10, color:"var(--t3)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Store Score</div>
              <Ring score={avg} size={isMobile ? 90 : 110}/>
              <div style={{ marginTop:8 }}>
                <span style={{ fontFamily:"var(--mono)", fontSize:28, fontWeight:700, color:C(avg) }}>{G(avg)}</span>
                <div style={{ fontSize:12, color:C(avg), marginTop:2, fontWeight:700 }}>{LB(avg)}</div>
              </div>
            </div>
            <div style={{ flex:1, minWidth:200, width: isMobile ? "100%" : "auto" }}>
              <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:3 }}>تقييم جودة المتجر</div>
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:14 }}>بناءً على {total} منتج</div>
              <Bar label="جودة العناوين"  value={avgT} icon="✍️"/>
              <Bar label="جودة الصور"    value={avgI} icon="🖼️"/>
              <Bar label="جودة الوصف"    value={avgD} icon="📝"/>
              <Bar label="تحسين SEO"      value={avgS} icon="🔍"/>
            </div>
          </div>
        </div>
      )}

      {/* Needs Attention */}
      {attention > 0 && (
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight:800, color:"var(--t1)", fontSize:14 }}>⚠️ تحتاج اهتمام فوري</div>
            <button className="btn-g" onClick={()=>onNav("products")} style={{ fontSize:12, padding:"6px 12px" }}>الكل ←</button>
          </div>
          {products.filter((p:Product)=>p.needs_attention).slice(0,4).map((p:Product, i:number)=>(
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderTop: i>0 ? "1px solid var(--b1)" : "none" }}>
              <div style={{ width:36, height:36, borderRadius:8, background:"var(--surf2)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                {p.main_image ? <img src={p.main_image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : "📦"}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, color:"var(--t1)", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                <div style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>{fmt(p.price, p.currency)}</div>
              </div>
              <Ring score={p.score_total} size={38}/>
              <button className="btn-p" onClick={()=>onOptimize(p)} style={{ fontSize:12, padding:"6px 10px" }}>✨</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State — صندوق منتجات مع loading واضح ── */}
      {total === 0 && (
        <div className="card" style={{ textAlign:"center", padding:"48px 24px" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <EmptyBox/>
          </div>
          <div style={{ fontSize:17, fontWeight:800, color:"var(--t1)", marginBottom:8 }}>
            متجرك جاهز — ابدأ بالمزامنة
          </div>
          <div style={{ fontSize:13, color:"var(--t2)", marginBottom:8, lineHeight:1.8 }}>
            اضغط الزر أدناه لجلب منتجاتك من سلة<br/>
            وسيبدأ التطبيق في حساب درجة جودة كل منتج تلقائياً
          </div>

          {/* خطوات العملية للتاجر */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, margin:"18px 0 24px", textAlign:"right" }}>
            {[
              { n:"١", t:"جلب بيانات منتجاتك من سلة" },
              { n:"٢", t:"حساب درجة الجودة لكل منتج (Quick Score)" },
              { n:"٣", t:"تحديد المنتجات التي تحتاج تحسيناً" },
            ].map(s=>(
              <div key={s.n} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"var(--surf2)", borderRadius:10, border:"1px solid var(--b1)" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(0,212,168,.1)", border:"1px solid rgba(0,212,168,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontSize:11, color:"var(--ac)", flexShrink:0 }}>{s.n}</div>
                <span style={{ fontSize:13, color:"var(--t2)" }}>{s.t}</span>
                {syncing && <span className="sp spin" style={{ width:12, height:12, borderWidth:"2px", marginRight:"auto" }}/>}
              </div>
            ))}
          </div>

          <SyncBtn onSync={onSync} syncing={syncing} full/>
          {syncMsg && (
            <div style={{ fontSize:13, color: syncMsg.includes("✅") ? "var(--ac)" : "var(--danger)", marginTop:14, padding:"8px 14px", background: syncMsg.includes("✅") ? "rgba(0,212,168,.06)" : "rgba(255,59,92,.06)", borderRadius:8, border:`1px solid ${syncMsg.includes("✅") ? "rgba(0,212,168,.2)" : "rgba(255,59,92,.2)"}` }}>
              {syncMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────
function Products({ products, onOptimize }: { products: Product[]; onOptimize: (p:Product)=>void }) {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all"|"attention"|"good">("all");
  const [expanded, setExpanded] = useState<string|null>(null);

  const list = products
    .filter(p => filter==="attention" ? p.needs_attention : filter==="good" ? !p.needs_attention : true)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => a.score_total - b.score_total);

  return (
    <div className="fu">
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--t1)" }}>المنتجات</h1>
        <p style={{ fontSize:13, color:"var(--t2)", marginTop:4 }}>تقييمات الجودة وفرص التحسين</p>
      </div>
      <input className="inp" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="ابحث عن منتج..." style={{ marginBottom:12 }}/>
      <div className="tabs" style={{ marginBottom:14 }}>
        {[
          { k:"all",       l:`الكل (${products.length})` },
          { k:"attention", l:`⚠️ (${products.filter(p=>p.needs_attention).length})` },
          { k:"good",      l:`✅ (${products.filter(p=>!p.needs_attention).length})` },
        ].map(t=>(
          <button key={t.k} className={`tab ${filter===t.k?"on":""}`}
            onClick={()=>setFilter(t.k as any)}>{t.l}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:"40px", color:"var(--t3)" }}>
          {products.length===0 ? "لا توجد منتجات — قم بالمزامنة أولاً من الرئيسية" : "لا توجد نتائج تطابق البحث"}
        </div>
      ) : list.map(p=>(
        <div key={p.id} style={{ background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:14, overflow:"hidden", marginBottom:10 }}>
          <div style={{ height:3, background:`linear-gradient(90deg,${C(p.score_total)}33,${C(p.score_total)})` }}/>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:50, height:50, borderRadius:10, background:"var(--surf2)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                {p.main_image ? <img src={p.main_image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : "📦"}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:4 }}>{p.name}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <span style={{ fontSize:13, color:"var(--ac)", fontWeight:700 }}>{fmt(p.price, p.currency)}</span>
                  {p.needs_attention && <span className="tag tag-w">⚠️ يحتاج اهتمام</span>}
                  {p.ai_optimized_at && <span className="tag tag-a">✨ محسَّن</span>}
                </div>
              </div>
              <Ring score={p.score_total} size={48}/>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button className="btn-p" onClick={()=>onOptimize(p)} style={{ flex:1, fontSize:13 }}>✨ تحسين بالذكاء الاصطناعي</button>
              <button className="btn-ic" onClick={()=>setExpanded(expanded===p.id ? null : p.id)}>
                {expanded===p.id ? "▲" : "▼"}
              </button>
            </div>
            {expanded===p.id && (
              <div style={{ marginTop:12, padding:14, background:"var(--bg)", borderRadius:10, animation:"fadeUp .3s ease" }}>
                <Bar label="العنوان"  value={p.score_title}       icon="✍️"/>
                <Bar label="الصور"    value={p.score_images}      icon="🖼️"/>
                <Bar label="الوصف"    value={p.score_description} icon="📝"/>
                <Bar label="SEO"       value={p.score_seo}         icon="🔍"/>
                <Bar label="السعر"    value={p.score_price}       icon="💰"/>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function Analytics({ products, isMobile }: { products:Product[]; isMobile:boolean }) {
  const total = products.length;
  if (!total) return (
    <div className="fu card" style={{ textAlign:"center", padding:"48px", color:"var(--t3)" }}>
      لا توجد بيانات — قم بمزامنة المنتجات أولاً
    </div>
  );
  const avg = Math.round(products.reduce((s,p)=>s+p.score_total,0)/total);
  const grades = [
    { l:"ممتاز A", min:80, max:101, color:"var(--ac)" },
    { l:"جيد B",   min:60, max:80,  color:"var(--ac2)" },
    { l:"مقبول C", min:40, max:60,  color:"var(--warn)" },
    { l:"ضعيف D",  min:0,  max:40,  color:"var(--danger)" },
  ].map(g=>({ ...g, count: products.filter(p=>p.score_total>=g.min && p.score_total<g.max).length }));

  return (
    <div className="fu">
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--t1)" }}>التحليلات</h1>
        <p style={{ fontSize:13, color:"var(--t2)", marginTop:4 }}>تحليل شامل لأداء متجرك</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        {[
          { l:"متوسط الدرجة", v:avg, color:C(avg) },
          { l:"أعلى درجة",    v:Math.max(...products.map(p=>p.score_total)), color:"var(--ac)" },
          { l:"أدنى درجة",    v:Math.min(...products.map(p=>p.score_total)), color:"var(--danger)" },
          { l:"محسَّنة AI",   v:products.filter(p=>p.ai_optimized_at).length, color:"var(--ac2)" },
        ].map((s,i)=>(
          <div key={i} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:30, fontWeight:900, color:s.color, fontFamily:"var(--mono)" }}>{s.v}</div>
            <div style={{ fontSize:11, color:"var(--t3)", marginTop:5 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom:14 }}>
        <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:16 }}>توزيع درجات الجودة</div>
        {grades.map(g=>(
          <div key={g.l} style={{ marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:56, fontSize:12, fontWeight:700, color:g.color, flexShrink:0 }}>{g.l}</div>
            <div className="prog" style={{ flex:1, height:8 }}>
              <div className="prog-f" style={{ width:`${total?(g.count/total)*100:0}%`, background:g.color, height:"100%" }}/>
            </div>
            <div style={{ fontFamily:"var(--mono)", fontSize:11, color:g.color, width:55, textAlign:"left" }}>
              {g.count} ({total?Math.round((g.count/total)*100):0}%)
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 }}>
        {[
          { title:"⬇️ الأضعف — تحتاج تحسيناً", list:[...products].sort((a,b)=>a.score_total-b.score_total).slice(0,5) },
          { title:"⬆️ الأقوى — منتجات ممتازة",  list:[...products].sort((a,b)=>b.score_total-a.score_total).slice(0,5) },
        ].map(sec=>(
          <div key={sec.title} className="card">
            <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:12, fontSize:13 }}>{sec.title}</div>
            {sec.list.map((p,i)=>(
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop: i>0 ? "1px solid var(--b1)" : "none" }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--t3)", width:14 }}>#{i+1}</div>
                <div style={{ flex:1, minWidth:0, fontSize:12, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:12, fontWeight:700, color:C(p.score_total) }}>{p.score_total}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pricing Plans Component ─────────────────────────────────────────────────
function PricingPlans({ currentPlan, onUpgrade, isMobile }: { currentPlan:string; onUpgrade:()=>void; isMobile:boolean }) {
  const free = [
    { f:"تحليل جودة المنتجات (Quick Score)",  y:true },
    { f:"مزامنة يدوية للمنتجات",              y:true },
    { f:"لوحة تحكم التحليلات",               y:true },
    { f:"تحسين AI — حتى ٥ منتجات/يوم",       y:true },
    { f:"تحسين AI غير محدود",                 y:false },
    { f:"مزامنة تلقائية يومية",               y:false },
    { f:"اكتشاف المنتجات الرابحة",            y:false },
    { f:"تقارير متقدمة وتوصيات مخصصة",        y:false },
    { f:"أولوية في الدعم الفني",              y:false },
  ];
  const pro = free.map(f => ({ ...f, y: true }));

  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontWeight:800, color:"var(--t1)", fontSize:14, marginBottom:16 }}>⚡ خطط الأسعار والخدمات</div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 }}>

        {/* Free Plan */}
        <div style={{ background:"var(--bg)", border:"1px solid var(--b1)", borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"16px 18px 14px", borderBottom:"1px solid var(--b1)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:900, color:"var(--t1)", marginBottom:3 }}>Free</div>
                <div style={{ fontSize:11, color:"var(--t3)" }}>المجاني · للبداية</div>
              </div>
              <div style={{ textAlign:"left" }}>
                <span style={{ fontFamily:"var(--mono)", fontSize:22, fontWeight:700, color:"var(--t2)" }}>٠</span>
                <span style={{ fontSize:11, color:"var(--t3)", marginRight:3 }}>ر.س / شهر</span>
              </div>
            </div>
            {currentPlan === "free" && (
              <div style={{ marginTop:10, padding:"5px 10px", background:"rgba(122,154,181,.1)", border:"1px solid rgba(122,154,181,.2)", borderRadius:8, fontSize:11, color:"var(--t2)", fontWeight:700, display:"inline-block" }}>
                ✓ خطتك الحالية
              </div>
            )}
          </div>
          <div style={{ padding:"14px 18px" }}>
            {free.map((item,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom: i<free.length-1 ? "1px solid var(--b1)" : "none" }}>
                <span style={{ fontSize:14, flexShrink:0, color: item.y ? "var(--ac)" : "var(--t3)" }}>
                  {item.y ? "✓" : "✗"}
                </span>
                <span style={{ fontSize:12, color: item.y ? "var(--t2)" : "var(--t3)", textDecoration: item.y ? "none" : "none" }}>
                  {item.f}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Plan */}
        <div style={{ background:"var(--surf)", border:"1px solid rgba(0,212,168,.3)", borderRadius:14, overflow:"hidden", position:"relative" }}>
          {/* Glow */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--ac),var(--ac2))" }}/>
          <div style={{ padding:"16px 18px 14px", borderBottom:"1px solid rgba(0,212,168,.15)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14, fontWeight:900, color:"var(--ac)" }}>Pro</span>
                  <span style={{ fontSize:10, padding:"2px 8px", background:"rgba(0,212,168,.12)", border:"1px solid rgba(0,212,168,.25)", borderRadius:20, color:"var(--ac)", fontWeight:700, letterSpacing:".06em" }}>الأفضل</span>
                </div>
                <div style={{ fontSize:11, color:"var(--t3)", marginTop:3 }}>للمتاجر الجادة</div>
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--t3)", textDecoration:"line-through", textAlign:"left" }}>٣٩٩</div>
                <div>
                  <span style={{ fontFamily:"var(--mono)", fontSize:22, fontWeight:700, color:"var(--ac)" }}>١٩٩</span>
                  <span style={{ fontSize:11, color:"var(--t3)", marginRight:3 }}>ر.س / شهر</span>
                </div>
              </div>
            </div>
            {currentPlan === "pro" ? (
              <div style={{ marginTop:10, padding:"5px 10px", background:"rgba(0,212,168,.1)", border:"1px solid rgba(0,212,168,.25)", borderRadius:8, fontSize:11, color:"var(--ac)", fontWeight:700, display:"inline-block" }}>
                ✓ خطتك الحالية
              </div>
            ) : (
              <button onClick={onUpgrade}
                style={{ marginTop:12, width:"100%", padding:"9px", background:"linear-gradient(135deg,#00d4a8,#0099cc)", color:"#03070f", border:"none", borderRadius:10, fontFamily:"var(--sans)", fontWeight:800, fontSize:13, cursor:"pointer" }}>
                ابدأ الآن — ١٩٩ ر.س / شهر
              </button>
            )}
          </div>
          <div style={{ padding:"14px 18px" }}>
            {pro.map((item,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom: i<pro.length-1 ? "1px solid rgba(0,212,168,.08)" : "none" }}>
                <span style={{ fontSize:14, flexShrink:0, color:"var(--ac)" }}>✓</span>
                <span style={{ fontSize:12, color:"var(--t2)" }}>{item.f}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {currentPlan !== "pro" && (
        <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(245,166,35,.05)", border:"1px solid rgba(245,166,35,.15)", borderRadius:10, fontSize:12, color:"var(--warn)", lineHeight:1.7 }}>
          💡 المتاجر التي ترفع درجة جودة منتجاتها فوق ٨٠ تحصل على ظهور أعلى في نتائج البحث داخل سلة.
          ابدأ خطة Pro لتحسين جميع منتجاتك دفعة واحدة.
        </div>
      )}
    </div>
  );
}

// ─── Settings — مع روابط الدعم والقانونية ────────────────────────────────────
function Settings({ merchant, products, onSync, syncing, syncMsg, onUpgrade, isMobile }: any) {
  const navigate = useNavigate();

  const legalLinks = [
    { icon:"🛡️", label:"سياسة الخصوصية",   desc:"كيف نحمي بياناتك",              path:"/privacy" },
    { icon:"📋", label:"شروط الاستخدام",     desc:"الشروط والأحكام القانونية",     path:"/terms" },
    { icon:"💬", label:"الدعم الفني",         desc:"تواصل مع فريقنا",               path:"/support" },
    { icon:"❓", label:"الأسئلة الشائعة",    desc:"أجوبة على أكثر الأسئلة شيوعاً", path:"/support#faq" },
  ];

  return (
    <div className="fu">
      <div style={{ marginBottom:18 }}>
        <h1 style={{ fontSize:22, fontWeight:900, color:"var(--t1)" }}>الإعدادات</h1>
        <p style={{ fontSize:13, color:"var(--t2)", marginTop:4 }}>إدارة متجرك وإعدادات النظام</p>
      </div>

      {/* Plan */}
      <div className="card card-ac" style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:"var(--t1)", marginBottom:3 }}>
              {merchant?.plan==="pro" ? "⭐ الخطة Pro" : "الخطة المجانية"}
            </div>
            <div style={{ fontSize:12, color:"var(--t2)" }}>
              {merchant?.plan==="pro" ? "جميع الميزات مفعّلة" : "ارقِّ للاستفادة الكاملة من الذكاء الاصطناعي"}
            </div>
          </div>
          {merchant?.plan !== "pro" && (
            <button className="btn-p" onClick={onUpgrade} style={{ fontSize:12 }}>⬆️ ترقية — 199 ر.س</button>
          )}
        </div>
      </div>

      {/* Store Info */}
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:12, fontSize:14 }}>🏪 معلومات المتجر</div>
        {[
          { l:"اسم المتجر",     v: merchant?.store_name   || "—" },
          { l:"النطاق",          v: merchant?.store_domain || "—" },
          { l:"رقم المتجر",     v: merchant?.store_id     || "—" },
          { l:"الخطة الحالية",  v: merchant?.plan==="pro" ? "⭐ Pro" : "مجانية" },
          { l:"تاريخ الانضمام", v: merchant?.created_at ? new Date(merchant.created_at).toLocaleDateString("ar-SA") : "—" },
        ].map((r,i,a)=>(
          <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom: i<a.length-1 ? "1px solid var(--b1)" : "none", gap:12 }}>
            <span style={{ fontSize:13, color:"var(--t3)", flexShrink:0 }}>{r.l}</span>
            <span style={{ fontSize:12, color:"var(--t2)", fontFamily:"var(--mono)", overflow:"hidden", textOverflow:"ellipsis", textAlign:"left", maxWidth:"60%" }}>{r.v}</span>
          </div>
        ))}
      </div>

      {/* Sync */}
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:6, fontSize:14 }}>🔄 مزامنة المنتجات</div>
        <div style={{ fontSize:13, color:"var(--t2)", marginBottom:14, lineHeight:1.6 }}>
          جلب أحدث بيانات المنتجات من سلة وإعادة حساب درجات الجودة — قد يستغرق بضع ثوانٍ
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <SyncBtn onSync={onSync} syncing={syncing}/>
          <span style={{ fontSize:12, color:"var(--t3)" }}>
            آخر مزامنة: {products[0]?.last_synced_at ? new Date(products[0].last_synced_at).toLocaleString("ar-SA") : "لم تتم بعد"}
          </span>
        </div>
        {syncMsg && (
          <div style={{ marginTop:10, fontSize:13, padding:"8px 12px", borderRadius:8,
            color: syncMsg.includes("✅") ? "var(--ac)" : "var(--danger)",
            background: syncMsg.includes("✅") ? "rgba(0,212,168,.06)" : "rgba(255,59,92,.06)",
            border:`1px solid ${syncMsg.includes("✅") ? "rgba(0,212,168,.2)" : "rgba(255,59,92,.2)"}` }}>
            {syncMsg}
          </div>
        )}
      </div>

      {/* Reconnect */}
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:6, fontSize:14 }}>🔗 إعادة ربط المتجر</div>
        <div style={{ fontSize:13, color:"var(--t2)", marginBottom:14 }}>في حال انتهاء صلاحية التصريح أو تغيير المتجر</div>
        <button className="btn-g" onClick={()=>window.location.href=`${SUPABASE_URL}/functions/v1/salla-oauth/initiate`}>
          🔑 إعادة ربط سلة
        </button>
      </div>

      {/* Legal & Support — مطلوب لقبول التطبيق في سلة */}
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:14, fontSize:14 }}>📚 الدعم والوثائق القانونية</div>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {legalLinks.map((item,i)=>(
            <button key={i} onClick={()=>navigate(item.path)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 12px", background:"transparent", border:"none", borderRadius:10, cursor:"pointer", textAlign:"right", transition:"background .15s", width:"100%" }}
              onMouseEnter={e=>(e.currentTarget.style.background="var(--surf2)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--t1)" }}>{item.label}</div>
                <div style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>{item.desc}</div>
              </div>
              <span style={{ color:"var(--t3)", fontSize:14 }}>←</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ fontWeight:800, color:"var(--t1)", marginBottom:14, fontSize:14 }}>📊 إحصائيات</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[
            { l:"إجمالي المنتجات", v: products.length },
            { l:"محسَّن AI",        v: products.filter((p:Product)=>p.ai_optimized_at).length },
            { l:"يحتاج اهتمام",    v: products.filter((p:Product)=>p.needs_attention).length },
          ].map((s,i)=>(
            <div key={i} style={{ textAlign:"center", padding:"12px 8px", background:"var(--bg)", borderRadius:10, border:"1px solid var(--b1)" }}>
              <div style={{ fontSize:24, fontWeight:900, color:"var(--ac)", fontFamily:"var(--mono)" }}>{s.v}</div>
              <div style={{ fontSize:10, color:"var(--t3)", marginTop:4, lineHeight:1.3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About StorePilot */}
      <div className="card" style={{ background:"linear-gradient(135deg,rgba(0,212,168,.04),rgba(0,153,204,.03))", border:"1px solid rgba(0,212,168,.15)", marginBottom:12 }}>
        <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ fontSize:32, flexShrink:0 }}>🚀</div>
          <div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:15, fontWeight:900, color:"var(--ac)" }}>StorePilot</span>
              <span style={{ fontSize:12, color:"var(--t3)", fontFamily:"var(--mono)" }}>|</span>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--t2)" }}>محسِّن</span>
            </div>
            <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.8 }}>
              منصة ذكاء اصطناعي متخصصة في تحسين جودة منتجات المتاجر السعودية على سلة وزيد.
              نساعد التجار على رفع درجات جودة منتجاتهم وزيادة ظهورها في نتائج البحث وزيادة مبيعاتهم.
            </div>
            <div style={{ fontSize:11, color:"var(--t3)", marginTop:8, fontFamily:"var(--mono)" }}>
              v1.1.0 · صُنع بـ ❤️ للتجار السعوديين
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <PricingPlans currentPlan={merchant?.plan || "free"} onUpgrade={onUpgrade} isMobile={isMobile}/>
    </div>
  );
}

// ─── AI Modal ─────────────────────────────────────────────────────────────────
function AIModal({ product, merchantId, onClose, onDone, isMobile }: any) {
  const [step, setStep] = useState<"idle"|"loading"|"result"|"applying"|"done"|"error">("idle");
  const [result, setResult] = useState<any>(null);
  const [error,  setError]  = useState("");
  const [tab,    setTab]    = useState<"title"|"description"|"keywords">("title");

  async function run() {
    setStep("loading"); setError("");
    try {
      const res  = await fetch(`${SUPABASE_URL}/functions/v1/analyze-product`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ merchant_id:merchantId, product_id:product.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.structured);
      setStep("result");
    } catch (e:any) { setError(e.message); setStep("error"); }
  }

  async function apply() {
    if (!result) return;
    setStep("applying");
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/apply-optimization`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ merchant_id:merchantId, product_id:product.id, updates:{ title:result.title, description:result.description, keywords:result.keywords } }),
      });
      setStep("done");
    } catch { setError("فشل التطبيق"); setStep("error"); }
  }

  const boxStyle: any = isMobile
    ? { background:"var(--surf)", border:"1px solid var(--b2)", borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"92dvh", overflowY:"auto", animation:"slideUp .3s cubic-bezier(.2,0,.2,1)" }
    : { background:"var(--surf)", border:"1px solid var(--b2)", borderRadius:20, width:"100%", maxWidth:660, maxHeight:"90vh", overflowY:"auto", animation:"fadeUp .3s ease" };

  return (
    <div className="modal-bg"
      style={{ alignItems: isMobile ? "flex-end" : "center", justifyContent:"center", padding: isMobile ? 0 : 20 }}
      onClick={e=>e.target===e.currentTarget && onClose()}>
      <div style={boxStyle}>
        {isMobile && <div style={{ width:36, height:4, background:"var(--b2)", borderRadius:2, margin:"12px auto 0" }}/>}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--b1)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"var(--t1)" }}>✨ AI Optimizer</div>
            <div style={{ fontSize:12, color:"var(--t3)", marginTop:2, maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:22 }}>✕</button>
        </div>

        <div style={{ padding:"18px 20px" }}>
          {/* Score comparison */}
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <div style={{ flex:1, padding:"12px", background:"var(--bg)", borderRadius:10, border:"1px solid var(--b1)", textAlign:"center" }}>
              <div style={{ fontSize:10, color:"var(--t3)", marginBottom:4 }}>الدرجة الحالية</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:22, fontWeight:700, color:C(product.score_total) }}>{product.score_total}</div>
            </div>
            {result && <>
              <div style={{ display:"flex", alignItems:"center", color:"var(--t3)", fontSize:18 }}>→</div>
              <div style={{ flex:1, padding:"12px", background:"rgba(0,212,168,.06)", borderRadius:10, border:"1px solid rgba(0,212,168,.2)", textAlign:"center" }}>
                <div style={{ fontSize:10, color:"var(--ac)", marginBottom:4 }}>الدرجة المتوقعة</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:22, fontWeight:700, color:"var(--ac)" }}>{result.score_estimate}</div>
              </div>
            </>}
          </div>

          {step==="idle" && <button className="btn-p full" onClick={run}>🚀 تشغيل تحسين الذكاء الاصطناعي</button>}

          {step==="loading" && (
            <div style={{ textAlign:"center", padding:"36px 0" }}>
              <div className="sp sp-lg spin" style={{ margin:"0 auto 16px" }}/>
              <div style={{ fontSize:14, color:"var(--t2)", fontWeight:600 }}>الذكاء الاصطناعي يحلل منتجك...</div>
              <div style={{ fontSize:12, color:"var(--t3)", marginTop:6 }}>يستغرق عادةً 5–10 ثوانٍ</div>
            </div>
          )}

          {step==="error" && (
            <div>
              <div style={{ padding:"12px 16px", background:"rgba(255,59,92,.08)", border:"1px solid rgba(255,59,92,.2)", borderRadius:10, marginBottom:12, fontSize:13, color:"var(--danger)" }}>⚠️ {error}</div>
              <button className="btn-g" style={{ width:"100%" }} onClick={run}>إعادة المحاولة</button>
            </div>
          )}

          {(step==="result" || step==="applying") && result && (
            <div className="fi">
              {result.top_tip && (
                <div style={{ marginBottom:12, padding:"10px 14px", background:"rgba(245,166,35,.06)", border:"1px solid rgba(245,166,35,.15)", borderRadius:10, fontSize:12, color:"var(--warn)" }}>
                  💡 {result.top_tip}
                </div>
              )}
              <div className="tabs" style={{ marginBottom:14 }}>
                {[{ k:"title",l:"✍️ العنوان" },{ k:"description",l:"📝 الوصف" },{ k:"keywords",l:"🔑 الكلمات" }]
                  .map(t=><button key={t.k} className={`tab ${tab===t.k?"on":""}`} onClick={()=>setTab(t.k as any)}>{t.l}</button>)}
              </div>
              {tab==="title" && (
                <div className="fi">
                  <div style={{ fontSize:11, color:"var(--t3)", marginBottom:5, fontWeight:700 }}>الحالي</div>
                  <div style={{ padding:"10px 14px", background:"var(--bg)", borderRadius:10, fontSize:14, color:"var(--t3)", marginBottom:10, border:"1px solid var(--b1)" }}>{product.name}</div>
                  <div style={{ fontSize:11, color:"var(--ac)", marginBottom:5, fontWeight:700 }}>✨ المقترح</div>
                  <div style={{ padding:"10px 14px", background:"rgba(0,212,168,.06)", border:"1px solid rgba(0,212,168,.2)", borderRadius:10, fontSize:14, color:"var(--t1)", lineHeight:1.6 }}>{result.title}</div>
                </div>
              )}
              {tab==="description" && (
                <div className="fi">
                  <div style={{ fontSize:11, color:"var(--t3)", marginBottom:5, fontWeight:700 }}>الحالي</div>
                  <div style={{ padding:"10px 14px", background:"var(--bg)", borderRadius:10, fontSize:13, color:"var(--t3)", maxHeight:80, overflow:"auto", marginBottom:10, border:"1px solid var(--b1)", lineHeight:1.6 }}>
                    {strip(product.description) || "لا يوجد وصف"}
                  </div>
                  <div style={{ fontSize:11, color:"var(--ac)", marginBottom:5, fontWeight:700 }}>✨ المقترح</div>
                  <div style={{ padding:"10px 14px", background:"rgba(0,212,168,.06)", border:"1px solid rgba(0,212,168,.2)", borderRadius:10, fontSize:13, color:"var(--t1)", maxHeight:160, overflow:"auto", lineHeight:1.8 }}>{result.description}</div>
                </div>
              )}
              {tab==="keywords" && (
                <div className="fi" style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {(result.keywords||[]).map((k:string,i:number)=>(
                    <span key={i} style={{ padding:"6px 14px", background:"rgba(0,212,168,.08)", border:"1px solid rgba(0,212,168,.2)", borderRadius:20, fontSize:13, color:"var(--ac)", fontWeight:600 }}>{k}</span>
                  ))}
                </div>
              )}
              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <button className="btn-p" onClick={apply} disabled={step==="applying"} style={{ flex:1, justifyContent:"center" }}>
                  {step==="applying" ? <><span className="sp spin" style={{ width:14, height:14 }}/> جاري...</> : "✅ تطبيق على المتجر"}
                </button>
                <button className="btn-g" onClick={run} disabled={step==="applying"}>🔄</button>
              </div>
            </div>
          )}

          {step==="done" && (
            <div className="fi" style={{ textAlign:"center", padding:"28px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:16, fontWeight:800, color:"var(--t1)", marginBottom:6 }}>تم التطبيق بنجاح</div>
              <div style={{ fontSize:13, color:"var(--t2)", marginBottom:20 }}>تم حفظ التحسينات في قاعدة البيانات</div>
              <button className="btn-p full" onClick={()=>{ onDone(); onClose(); }}>العودة ←</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
function UpgradeModal({ merchantId, onClose, isMobile }: any) {
  const [loading, setLoading] = useState(false);
  const boxStyle: any = isMobile
    ? { background:"var(--surf)", border:"1px solid var(--b2)", borderRadius:"20px 20px 0 0", width:"100%", maxHeight:"92dvh", overflowY:"auto", animation:"slideUp .3s ease" }
    : { background:"var(--surf)", border:"1px solid var(--b2)", borderRadius:20, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", animation:"fadeUp .3s ease" };

  return (
    <div className="modal-bg"
      style={{ alignItems: isMobile ? "flex-end" : "center", justifyContent:"center", padding: isMobile ? 0 : 20 }}
      onClick={e=>e.target===e.currentTarget && onClose()}>
      <div style={boxStyle}>
        {isMobile && <div style={{ width:36, height:4, background:"var(--b2)", borderRadius:2, margin:"12px auto 0" }}/>}
        <div style={{ padding:"24px 20px 18px", textAlign:"center", borderBottom:"1px solid var(--b1)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%,rgba(0,212,168,.1) 0%,transparent 65%)", pointerEvents:"none" }}/>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", borderRadius:20, background:"rgba(0,212,168,.1)", border:"1px solid rgba(0,212,168,.25)", color:"var(--ac)", fontSize:11, fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", marginBottom:14 }}>⭐ خطة Pro</div>
          <div style={{ fontSize:22, fontWeight:900, color:"var(--t1)", marginBottom:8 }}>ارفع متجرك <span style={{ color:"var(--ac)" }}>لمستوى آخر</span></div>
          <div style={{ display:"inline-flex", alignItems:"baseline", gap:4, marginTop:14, padding:"10px 20px", background:"rgba(0,212,168,.06)", border:"1px solid rgba(0,212,168,.15)", borderRadius:12 }}>
            <span style={{ fontSize:14, color:"var(--ac)", fontWeight:700 }}>ر.س</span>
            <span style={{ fontFamily:"var(--mono)", fontSize:36, fontWeight:700, color:"var(--ac)", lineHeight:1 }}>199</span>
            <div><div style={{ fontSize:12, color:"var(--t3)" }}>/ شهرياً</div><div style={{ fontSize:10, textDecoration:"line-through", color:"var(--t3)" }}>399 ر.س</div></div>
          </div>
        </div>
        <div style={{ padding:"18px 20px 24px" }}>
          {[
            { icon:"✨", t:"تحسين غير محدود بالذكاء الاصطناعي", d:"حسِّن جميع منتجاتك بعناوين ووصف احترافي" },
            { icon:"📊", t:"تقارير وتحليلات متقدمة",             d:"رؤى عميقة وتوصيات مخصصة لزيادة مبيعاتك" },
            { icon:"🔄", t:"مزامنة تلقائية يومية",               d:"يُحدِّث درجات منتجاتك تلقائياً كل يوم" },
            { icon:"🎯", t:"اكتشاف المنتجات الرابحة",             d:"أفضل المنتجات المطلوبة في السوق السعودي" },
          ].map((f,i)=>(
            <div key={i} style={{ display:"flex", gap:12, padding:"10px 12px", background:"var(--bg)", border:"1px solid var(--b1)", borderRadius:12, marginBottom:8 }}>
              <div style={{ fontSize:18 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--t1)", marginBottom:2 }}>{f.t}</div>
                <div style={{ fontSize:11, color:"var(--t3)", lineHeight:1.5 }}>{f.d}</div>
              </div>
            </div>
          ))}
          <button className="btn-p full" style={{ marginTop:16 }} disabled={loading}
            onClick={()=>{ setLoading(true); setTimeout(()=>{ window.open(`https://mohsen-sigma.vercel.app/checkout?merchant_id=${merchantId}&plan=pro`,"_blank"); setLoading(false); },600); }}>
            {loading ? <><span className="sp spin" style={{ width:16, height:16 }}/> جاري...</> : "🚀 ابدأ الخطة Pro — 199 ر.س / شهر"}
          </button>
          <div style={{ textAlign:"center", fontSize:11, color:"var(--t3)", margin:"10px 0" }}>
            🔒 دفع آمن عبر Moyasar · يمكن الإلغاء في أي وقت
          </div>
          <button className="btn-g" style={{ width:"100%" }} onClick={onClose}>ليس الآن</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [merchantId,        setMerchantId]        = useState<string|null>(null);
  const [merchant,          setMerchant]           = useState<Merchant|null>(null);
  const [products,          setProducts]           = useState<Product[]>([]);
  const [loading,           setLoading]            = useState(true);
  const [syncing,           setSyncing]            = useState(false);
  const [syncMsg,           setSyncMsg]            = useState("");
  const [nav,               setNav]                = useState<"overview"|"products"|"analytics"|"settings">("overview");
  const [optimizerProduct,  setOptimizerProduct]   = useState<Product|null>(null);
  const [showUpgrade,       setShowUpgrade]        = useState(false);

  const [isMobile, setIsMobile] = useState(()=> typeof window!=="undefined" ? window.innerWidth<768 : false);
  useEffect(()=>{
    const check = ()=> setIsMobile(window.innerWidth<768);
    check();
    window.addEventListener("resize", check);
    return ()=> window.removeEventListener("resize", check);
  },[]);

  useEffect(()=>{
    const id = new URLSearchParams(window.location.search).get("merchant_id");
    setMerchantId(id);
  },[]);

  useEffect(()=>{ merchantId ? loadData() : setLoading(false); },[merchantId]);

  async function loadData() {
    setLoading(true);
    const { data:m } = await supabase.from("merchants").select("*").eq("id", merchantId).single();
    if (m) setMerchant(m);
    const { data:p } = await supabase.from("products").select("*").eq("merchant_id", merchantId).order("score_total");
    if (p) setProducts(p);
    setLoading(false);
  }

  async function syncProducts() {
    setSyncing(true); setSyncMsg("جاري جلب منتجاتك من سلة...");
    try {
      const res  = await fetch(`${SUPABASE_URL}/functions/v1/sync-products`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ merchant_id:merchantId }),
      });
      const data = await res.json();
      setSyncMsg(data.success ? `✅ تمت مزامنة ${data.synced} منتج بنجاح` : `❌ ${data.message || "فشلت المزامنة"}`);
      if (data.success && data.synced>0) await loadData();
    } catch { setSyncMsg("❌ خطأ في الاتصال — تحقق من اتصالك بالإنترنت"); }
    setSyncing(false);
    setTimeout(()=>setSyncMsg(""), 7000);
  }

  const attention = products.filter(p=>p.needs_attention).length;
  const navItems  = [
    { k:"overview",   icon:"⬡", label:"الرئيسية",  badge:0 },
    { k:"products",   icon:"◫", label:"المنتجات",   badge:attention },
    { k:"analytics",  icon:"◈", label:"التحليلات",  badge:0 },
    { k:"settings",   icon:"◎", label:"الإعدادات",  badge:0 },
  ];
  const pageProps = { products, merchant, merchantId, onSync:syncProducts, syncing, syncMsg, onOptimize:setOptimizerProduct, onNav:setNav, onUpgrade:()=>setShowUpgrade(true), isMobile };

  // ── No Merchant ──
  if (!merchantId && !loading) return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:20 }}>
      <style>{GCSS}</style>
      <div className="card fu" style={{ textAlign:"center", padding:"48px 28px", maxWidth:380, width:"100%", border:"1px solid rgba(0,212,168,.15)" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}><EmptyBox/></div>
        <div style={{ fontSize:28, fontWeight:900, marginBottom:4 }}><span style={{ color:"var(--ac)" }}>Store</span><span style={{ color:"var(--t1)" }}>Pilot</span></div><div style={{ fontSize:13, color:"var(--t3)", marginBottom:8, fontFamily:"var(--mono)" }}>محسِّن</div>
        <div style={{ fontSize:14, color:"var(--t2)", marginBottom:26, lineHeight:1.7 }}>
          منصة ذكاء اصطناعي لتحسين منتجاتك في سلة<br/>وزيادة ظهورها في نتائج البحث
        </div>
        <button className="btn-p full" onClick={()=>window.location.href=`${SUPABASE_URL}/functions/v1/salla-oauth/initiate`}>
          ربط متجر سلة
        </button>
      </div>
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", flexDirection:"column", gap:16 }}>
      <style>{GCSS}</style>
      <div className="sp sp-lg spin"/>
      <div style={{ fontSize:13, color:"var(--t3)" }}>جاري التحميل...</div>
    </div>
  );

  return (
    <div dir="rtl" style={{ display:"flex", minHeight:"100dvh", background:"var(--bg)", fontFamily:"var(--sans)", width:"100%" }}>
      <style>{GCSS}</style>

      {/* Sync global loading bar */}
      {syncing && <div className="sync-loading-bar"/>}

      {/* ══ DESKTOP: Sidebar ══ */}
      {!isMobile && (
        <aside style={{ width:220, background:"var(--surf)", borderLeft:"1px solid var(--b1)", display:"flex", flexDirection:"column", position:"fixed", top:0, right:0, height:"100dvh", padding:"20px 10px", overflowY:"auto", zIndex:100 }}>
          <div style={{ padding:"4px 8px 18px", borderBottom:"1px solid var(--b1)", marginBottom:14 }}>
            <div style={{ fontSize:18, fontWeight:900, lineHeight:1 }}><span style={{ color:"var(--ac)" }}>Store</span><span style={{ color:"var(--t1)" }}>Pilot</span></div><div style={{ fontSize:9, color:"var(--t3)", letterSpacing:".08em", marginTop:1 }}>محسِّن · AI Commerce</div>
            <div style={{ fontSize:9, color:"var(--t3)", letterSpacing:".12em", textTransform:"uppercase", marginTop:2 }}>AI Commerce</div>
          </div>
          {merchant && (
            <div style={{ padding:10, background:"var(--surf2)", borderRadius:12, marginBottom:16, border:"1px solid var(--b1)", display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,var(--ac),var(--ac2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:"var(--bg)", flexShrink:0 }}>
                {merchant.store_name?.[0] || "م"}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{merchant.store_name}</div>
                <div style={{ fontSize:10, color:"var(--t3)", marginTop:2 }}>{merchant.plan==="pro" ? "⭐ Pro" : "مجاني"}</div>
              </div>
            </div>
          )}
          <nav style={{ flex:1 }}>
            {navItems.map(item=>(
              <button key={item.k} className={`nv-item ${nav===item.k?"on":""}`} onClick={()=>setNav(item.k as any)}>
                <span style={{ fontSize:17, opacity:.8 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge>0 && <span style={{ marginRight:"auto", background:"rgba(255,59,92,.15)", color:"var(--danger)", fontSize:10, fontFamily:"var(--mono)", padding:"1px 7px", borderRadius:10, fontWeight:700 }}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{ borderTop:"1px solid var(--b1)", paddingTop:12 }}>
            <SyncBtn onSync={syncProducts} syncing={syncing}/>
          </div>
        </aside>
      )}

      {/* ══ MOBILE: Header ══ */}
      {isMobile && (
        <header style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"var(--surf)", borderBottom:"1px solid var(--b1)", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
          <div style={{ fontSize:18, fontWeight:900, lineHeight:1 }}><span style={{ color:"var(--ac)" }}>Store</span><span style={{ color:"var(--t1)" }}>Pilot</span></div>
          {merchant && (
            <div style={{ fontSize:12, color:"var(--t2)", fontWeight:600, background:"var(--surf2)", padding:"5px 12px", borderRadius:20, border:"1px solid var(--b1)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {merchant.store_name}
            </div>
          )}
        </header>
      )}

      {/* ══ Main Content ══ */}
      <main style={{ flex:1, width:"100%", marginRight: isMobile ? 0 : 220, padding: isMobile ? "68px 14px 76px" : "28px 26px 40px", minHeight:"100dvh", overflowX:"hidden", maxWidth: isMobile ? "100vw" : "calc(100vw - 220px)" }}>
        {nav==="overview"  && <Overview  {...pageProps}/>}
        {nav==="products"  && <Products  products={products} onOptimize={setOptimizerProduct}/>}
        {nav==="analytics" && <Analytics products={products} isMobile={isMobile}/>}
        {nav==="settings"  && <Settings  {...pageProps}/>}
      </main>

      {/* ══ MOBILE: Bottom Navigation ══ */}
      {isMobile && (
        <nav style={{ position:"fixed", bottom:0, left:0, right:0, height:60, zIndex:200, background:"var(--surf)", borderTop:"1px solid var(--b1)", display:"flex", alignItems:"center", justifyContent:"space-around", padding:"0 4px", width:"100%" }}>
          {navItems.map(item=>(
            <button key={item.k} onClick={()=>setNav(item.k as any)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, flex:1, padding:"6px 4px", background:"none", border:"none", cursor:"pointer", color: nav===item.k ? "var(--ac)" : "var(--t3)", transition:"color .2s", fontFamily:"var(--sans)", position:"relative" }}>
              {item.badge>0 && <span style={{ position:"absolute", top:4, right:"calc(50% - 16px)", background:"var(--danger)", color:"#fff", fontSize:9, fontWeight:800, fontFamily:"var(--mono)", padding:"1px 5px", borderRadius:10, minWidth:16, textAlign:"center" }}>{item.badge}</span>}
              <span style={{ fontSize:22, lineHeight:1 }}>{item.icon}</span>
              <span style={{ fontSize:10, fontWeight:700 }}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ══ Modals ══ */}
      {optimizerProduct && <AIModal product={optimizerProduct} merchantId={merchantId!} onClose={()=>setOptimizerProduct(null)} onDone={loadData} isMobile={isMobile}/>}
      {showUpgrade       && <UpgradeModal merchantId={merchantId!} onClose={()=>setShowUpgrade(false)} isMobile={isMobile}/>}
    </div>
  );
}
