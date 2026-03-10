import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#03070f;--surf:#080f1c;--surf2:#0c1628;--b1:#0e1e35;--b2:#162840;--t1:#e8f4f8;--t2:#7a9ab5;--t3:#3d5a73;--ac:#00d4a8;--ac2:#0099cc;--warn:#f5a623;--sans:'Tajawal',sans-serif;--mono:'Space Mono',monospace}
html,body,#root{background:var(--bg);font-family:var(--sans);color:var(--t1);-webkit-tap-highlight-color:transparent}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp .35s ease both}
`;

const faqs = [
  {
    q: "كيف أحصل على درجة 100/100 لمنتجي؟",
    a: "لتحقيق الدرجة الكاملة يجب أن يتوفر في المنتج: عنوان بين 30–70 حرفاً يحتوي كلمات مفتاحية (25 نقطة)، 5 صور أو أكثر بجودة عالية (30 نقطة)، وصف يتجاوز 100 كلمة يشرح المزايا ولمن المنتج مناسب (20 نقطة)، سعر محدد أكبر من صفر (10 نقاط)، وتقاطع 3 كلمات أو أكثر بين العنوان والوصف لتعزيز SEO (15 نقطة). استخدم تحسين الذكاء الاصطناعي لتحقيق معظم هذه المعايير تلقائياً."
  },
  {
    q: "هل التطبيق يؤثر على سرعة متجري في سلة؟",
    a: "لا. محسِّن AI يعمل خارج متجرك تماماً ويتواصل مع سلة فقط عند طلبك للمزامنة أو التحسين. لا يوجد أي كود مُثبَّت في متجرك ولا أي اتصال مستمر قد يؤثر على أدائه أو سرعته."
  },
  {
    q: "هل التحسينات تُطبَّق مباشرة على متجري في سلة؟",
    a: "يُحفظ كل تحسين في قاعدة البيانات أولاً ليمكنك مراجعته. يحاول التطبيق تطبيقه على سلة تلقائياً إذا توفرت الصلاحية. في حال عدم توفر صلاحية الكتابة (products.write) — وهو قيد مؤقت للتطبيقات في مرحلة المراجعة — تبقى التحسينات محفوظة ويمكنك تطبيقها يدوياً من لوحة تحكم سلة."
  },
  {
    q: "ما الفرق بين الخطة المجانية وخطة Pro؟",
    a: "الخطة المجانية تتيح تحسين عدد محدود من المنتجات يومياً ومزامنة يدوية. خطة Pro (199 ر.س/شهر) تتيح: تحسين غير محدود بالذكاء الاصطناعي لجميع منتجاتك، مزامنة تلقائية يومية، تقارير متقدمة، واكتشاف المنتجات الرابحة في السوق السعودي."
  },
  {
    q: "كيف أُلغي ربط متجري بمحسِّن AI؟",
    a: "يمكنك إلغاء ربط المتجر بطريقتين: الأولى من داخل التطبيق في قسم الإعدادات → إعادة ربط المتجر. الثانية مباشرة من لوحة تحكم سلة في قسم التطبيقات المرتبطة حيث يمكنك إلغاء صلاحية أي تطبيق. عند الإلغاء يتوقف محسِّن AI فوراً عن الوصول إلى متجرك."
  },
  {
    q: "ماذا يحدث لبياناتي إذا ألغيت الاشتراك؟",
    a: "تظل بياناتك محفوظة لمدة 30 يوماً بعد إلغاء الاشتراك لإتاحة استعادتها. بعد ذلك تُحذف نهائياً من جميع أنظمتنا. يمكنك طلب الحذف الفوري في أي وقت عبر البريد الإلكتروني: support@mohsen.ai"
  },
  {
    q: "هل محسِّن AI يدعم منصة زيد أيضاً؟",
    a: "حالياً يدعم محسِّن AI منصة سلة بشكل كامل. دعم منصة زيد في المرحلة التالية من التطوير وسيُعلَن عنه قريباً."
  },
  {
    q: "لماذا تظهر رسالة 'لا صلاحية للوصول' عند المزامنة؟",
    a: "تظهر هذه الرسالة عادةً لأحد سببين: انتهاء صلاحية رمز الوصول (Access Token) وهو ما يمكن حله بالضغط على 'إعادة ربط سلة' في الإعدادات، أو لأن التطبيق في مرحلة المراجعة ولم تُمنح صلاحية الكتابة الكاملة بعد. في الحالة الثانية تبقى المزامنة الأساسية عبر Storefront API تعمل لجلب المنتجات وحساب درجاتها."
  },
];

export default function Support() {
  const navigate  = useNavigate();
  const [open, setOpen] = useState<number|null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!name.trim() || !msg.trim()) return;
    // في المستقبل: إرسال عبر API
    setSent(true);
  }

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:"var(--bg)", fontFamily:"var(--sans)" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background:"var(--surf)", borderBottom:"1px solid var(--b1)", padding:"14px 20px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={()=>navigate(-1)} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", fontSize:22 }}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"var(--t1)" }}>الدعم الفني</div>
          <div style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>نرد خلال 24 ساعة عمل</div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 20px 60px" }}>

        {/* قنوات التواصل */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:16, fontWeight:800, color:"var(--t1)", marginBottom:14 }}>تواصل معنا مباشرة</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { icon:"💬", label:"واتساب", sub:"ردّ فوري في أوقات الدوام", href:"https://wa.me/966500000000?text=مرحباً، أحتاج مساعدة في تطبيق StorePilot", color:"rgba(0,212,168,.08)", border:"rgba(0,212,168,.2)" },
              { icon:"✉️", label:"البريد الإلكتروني", sub:"support@mohsen.ai", href:"mailto:support@mohsen.ai", color:"rgba(0,153,204,.08)", border:"rgba(0,153,204,.2)" },
            ].map((c,i)=>(
              <a key={i} href={c.href} target="_blank" rel="noreferrer"
                style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:"20px 14px", background:c.color, border:`1px solid ${c.border}`, borderRadius:14, textDecoration:"none", textAlign:"center", transition:"opacity .2s" }}
                onMouseEnter={e=>(e.currentTarget.style.opacity=".8")}
                onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                <span style={{ fontSize:28 }}>{c.icon}</span>
                <div style={{ fontSize:14, fontWeight:800, color:"var(--t1)" }}>{c.label}</div>
                <div style={{ fontSize:11, color:"var(--t3)" }}>{c.sub}</div>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom:28 }} id="faq">
          <div style={{ fontSize:16, fontWeight:800, color:"var(--t1)", marginBottom:14 }}>❓ الأسئلة الشائعة</div>
          {faqs.map((faq,i)=>(
            <div key={i} style={{ background:"var(--surf)", border:`1px solid ${open===i ? "rgba(0,212,168,.25)" : "var(--b1)"}`, borderRadius:12, marginBottom:8, overflow:"hidden", transition:"border-color .2s" }}>
              <button onClick={()=>setOpen(open===i ? null : i)}
                style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"transparent", border:"none", cursor:"pointer", textAlign:"right", gap:12 }}>
                <span style={{ fontSize:13, fontWeight:700, color: open===i ? "var(--ac)" : "var(--t1)", flex:1, lineHeight:1.5 }}>{faq.q}</span>
                <span style={{ fontSize:18, color: open===i ? "var(--ac)" : "var(--t3)", flexShrink:0, transition:"transform .2s", transform: open===i ? "rotate(180deg)" : "none" }}>▾</span>
              </button>
              {open===i && (
                <div className="fu" style={{ padding:"0 16px 16px", fontSize:13, color:"var(--t2)", lineHeight:1.9, borderTop:"1px solid var(--b1)", paddingTop:12 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div style={{ background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:14, padding:"22px" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"var(--t1)", marginBottom:6 }}>📩 أرسل استفساراً</div>
          <div style={{ fontSize:13, color:"var(--t2)", marginBottom:18 }}>لم تجد إجابة سؤالك؟ أرسل لنا استفساراً وسنرد خلال 24 ساعة عمل.</div>

          {sent ? (
            <div style={{ textAlign:"center", padding:"28px 0" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--t1)", marginBottom:6 }}>تم إرسال رسالتك</div>
              <div style={{ fontSize:13, color:"var(--t2)" }}>سنرد عليك قريباً على البريد الإلكتروني الذي أدخلته</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <div style={{ fontSize:12, color:"var(--t3)", marginBottom:6, fontWeight:600 }}>الاسم *</div>
                  <input value={name} onChange={e=>setName(e.target.value)}
                    placeholder="اسمك الكريم"
                    style={{ background:"var(--surf2)", border:`1px solid ${name?"var(--b2)":"var(--b1)"}`, borderRadius:10, color:"var(--t1)", fontFamily:"var(--sans)", fontSize:14, padding:"10px 14px", width:"100%", outline:"none", transition:"border-color .2s" }}/>
                </div>
                <div>
                  <div style={{ fontSize:12, color:"var(--t3)", marginBottom:6, fontWeight:600 }}>البريد الإلكتروني</div>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="بريدك الإلكتروني"
                    style={{ background:"var(--surf2)", border:"1px solid var(--b1)", borderRadius:10, color:"var(--t1)", fontFamily:"var(--sans)", fontSize:14, padding:"10px 14px", width:"100%", outline:"none" }}/>
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, color:"var(--t3)", marginBottom:6, fontWeight:600 }}>الرسالة *</div>
                <textarea value={msg} onChange={e=>setMsg(e.target.value)}
                  placeholder="اشرح استفسارك أو المشكلة التي تواجهها بالتفصيل..."
                  rows={5}
                  style={{ background:"var(--surf2)", border:`1px solid ${msg?"var(--b2)":"var(--b1)"}`, borderRadius:10, color:"var(--t1)", fontFamily:"var(--sans)", fontSize:14, padding:"10px 14px", width:"100%", outline:"none", resize:"vertical", transition:"border-color .2s" }}/>
              </div>
              <button onClick={handleSend} disabled={!name.trim() || !msg.trim()}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background: (!name.trim()||!msg.trim()) ? "var(--surf2)" : "linear-gradient(135deg,#00d4a8,#0099cc)", color: (!name.trim()||!msg.trim()) ? "var(--t3)" : "#03070f", border:"none", borderRadius:10, fontFamily:"var(--sans)", fontWeight:800, fontSize:14, cursor:(!name.trim()||!msg.trim())?"not-allowed":"pointer", padding:"12px", transition:"all .2s" }}>
                📩 إرسال الرسالة
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{ textAlign:"center", marginTop:24, fontSize:12, color:"var(--t3)", lineHeight:1.7 }}>
          فريق StorePilot متواجد من الأحد إلى الخميس، ٩ صباحاً حتى ٦ مساءً بتوقيت الرياض.<br/>
          للمسائل العاجلة استخدم واتساب للحصول على رد فوري.
        </div>
      </div>
    </div>
  );
}
