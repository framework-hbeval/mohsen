import { useNavigate } from "react-router-dom";

const CSS = 
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#03070f;--surf:#080f1c;--b1:#0e1e35;--t1:#e8f4f8;--t2:#7a9ab5;--t3:#3d5a73;--ac:#00d4a8;--sans:'Tajawal',sans-serif}
html,body,#root{background:var(--bg);font-family:var(--sans);color:var(--t1);-webkit-tap-highlight-color:transparent}
`;

export default function Terms() {
  const navigate = useNavigate();
  const lastUpdate = "١ مارس ٢٠٢٥";

  const sections = [
    {
      title: "١. قبول الشروط",
      content: `باستخدامك لتطبيق محسِّن AI أو ربط متجرك به، فإنك توافق على الالتزام بهذه الشروط والأحكام بالكامل. إذا كنت لا توافق على أي جزء منها، فيرجى عدم استخدام التطبيق. يحق لنا تعديل هذه الشروط في أي وقت، وسيتم إشعارك بأي تغييرات جوهرية قبل سريانها.`
    },
    {
      title: "٢. وصف الخدمة",
      content: `StorePilot (محسِّن) هو تطبيق متخصص في تحليل جودة منتجات المتاجر الإلكترونية على منصتَي سلة وزيد، وتقديم مقترحات تحسين مدعومة بالذكاء الاصطناعي. تشمل الخدمة: حساب درجة Quick Score لكل منتج، توليد عناوين وأوصاف وكلمات مفتاحية محسّنة، وعرض تقارير أداء تفصيلية. الخطة المجانية تتيح عدداً محدوداً من التحسينات يومياً، بينما توفر خطة Pro وصولاً غير محدود.`
    },
    {
      title: "٣. صلاحيات الوصول إلى المتجر",
      content: `عند ربط متجرك، تمنح محسِّن AI صلاحية قراءة بيانات المنتجات وتعديلها عبر واجهة برمجة سلة. نلتزم باستخدام هذه الصلاحية حصراً لأغراض تحسين المنتجات التي تطلبها صراحةً. لن نجري أي تعديل على منتجاتك دون موافقتك الصريحة على كل تحسين. يمكنك إلغاء هذه الصلاحية في أي وقت من إعدادات التطبيق أو من لوحة تحكم سلة.`
    },
    {
      title: "٤. الاشتراك والدفع",
      content: `الخطة المجانية متاحة لجميع المستخدمين دون قيود زمنية. خطة Pro تُحتسب شهرياً بسعر 199 ريال سعودي وتُجدَّد تلقائياً حتى إلغائها. يتم الدفع عبر Moyasar، وهي بوابة دفع سعودية مرخصة ومعتمدة. يحق لك إلغاء الاشتراك في أي وقت دون رسوم إضافية. في حال وجود مشكلة في الخدمة، نضمن استرداداً كاملاً خلال 7 أيام من بدء الاشتراك.`
    },
    {
      title: "٥. الاستخدام المقبول",
      content: `يُحظر استخدام التطبيق لأغراض غير مشروعة أو لنشر محتوى مضلل أو مسيء. يُحظر محاولة اختراق الأنظمة أو الوصول غير المصرح إلى بيانات مستخدمين آخرين. يُحظر إعادة بيع الخدمة أو تأجيرها لأطراف ثالثة دون موافقة كتابية مسبقة. يحق لـ StorePilot إيقاف أي حساب يُثبَت انتهاكه لهذه الشروط فوراً دون إشعار مسبق.`
    },
    {
      title: "٦. دقة المحتوى المُولَّد بالذكاء الاصطناعي",
      content: `المقترحات التي يُنتجها الذكاء الاصطناعي هي اقتراحات استرشادية وليست ضمانات بنتائج تجارية محددة. يُنصح بمراجعة كل مقترح قبل تطبيقه على متجرك والتأكد من مطابقته لمعايير منصة سلة. محسِّن AI غير مسؤول عن أي قرارات تجارية تتخذها بناءً على المقترحات المُوَلَّدة. نرفض مسؤوليتنا عن أي محتوى لا يتوافق مع سياسات منصات البيع التي تستخدمها.`
    },
    {
      title: "٧. حدود المسؤولية",
      content: `تُقدَّم الخدمة "كما هي" (As Is) دون ضمانات صريحة أو ضمنية بشأن توافر الخدمة بشكل مستمر أو خلوّها من الأخطاء. لا تتحمل StorePilot مسؤولية الأضرار غير المباشرة أو خسائر الأرباح الناتجة عن استخدام الخدمة أو التوقف عنها. الحد الأقصى لمسؤوليتنا المالية في جميع الأحوال لا يتجاوز مبلغ الاشتراك المدفوع في الأشهر الثلاثة الأخيرة.`
    },
    {
      title: "٨. القانون المُطبَّق",
      content: `تخضع هذه الشروط وأي نزاع ينشأ عنها لأحكام نظام التجارة الإلكترونية السعودي ولوائح هيئة الاتصالات والفضاء والتقنية. أي نزاع لا يمكن تسويته وُدِّياً يُحال إلى المحاكم السعودية المختصة في المملكة العربية السعودية.`
    },
  ];

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:"var(--bg)", fontFamily:"var(--sans)" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background:"var(--surf)", borderBottom:"1px solid var(--b1)", padding:"14px 20px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={()=>navigate(-1)} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", fontSize:22, display:"flex", alignItems:"center" }}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"var(--t1)" }}>شروط الاستخدام</div>
          <div style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>آخر تحديث: {lastUpdate}</div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 20px 60px" }}>
        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,rgba(0,212,168,.06),rgba(0,153,204,.03))", border:"1px solid rgba(0,212,168,.15)", borderRadius:16, padding:"24px", marginBottom:28, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:18, fontWeight:900, color:"var(--t1)", marginBottom:8 }}>شروط وأحكام استخدام StorePilot</div>
          <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.8 }}>
            يرجى قراءة هذه الشروط بعناية قبل استخدام التطبيق. باستخدامك للخدمة فإنك توافق على الالتزام بها.
          </div>
        </div>

        {/* Sections */}
        {sections.map((sec,i)=>(
          <div key={i} style={{ marginBottom:16, background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:14, padding:"20px" }}>
            <div style={{ fontSize:15, fontWeight:800, color:"var(--ac)", marginBottom:10 }}>{sec.title}</div>
            <div style={{ fontSize:13, color:"var(--t2)", lineHeight:2 }}>{sec.content}</div>
          </div>
        ))}

        {/* Contact */}
        <div style={{ background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:14, padding:"20px", textAlign:"center" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--t1)", marginBottom:8 }}>للاستفسار القانوني</div>
          <div style={{ fontSize:13, color:"var(--t2)", marginBottom:14 }}>للأسئلة المتعلقة بالشروط القانونية تواصل معنا</div>
          <a href="mailto:legal@mohsen.ai"
            style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", background:"rgba(0,212,168,.08)", border:"1px solid rgba(0,212,168,.2)", borderRadius:10, color:"var(--ac)", fontSize:14, fontWeight:700, textDecoration:"none" }}>
            ✉️ legal@mohsen.ai
          </a>
        </div>
      </div>
    </div>
  );
}
