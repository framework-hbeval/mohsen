import { useNavigate } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#03070f;--surf:#080f1c;--b1:#0e1e35;--t1:#e8f4f8;--t2:#7a9ab5;--t3:#3d5a73;--ac:#00d4a8;--sans:'Tajawal',sans-serif}
html,body,#root{background:var(--bg);font-family:var(--sans);color:var(--t1);-webkit-tap-highlight-color:transparent}
`;

export default function Privacy() {
  const navigate = useNavigate();
  const lastUpdate = "١ مارس ٢٠٢٥";

  const sections = [
    {
      title: "١. المعلومات التي نجمعها",
      content: `عند ربط متجرك بمحسِّن AI، نجمع المعلومات التالية حصراً لغرض تقديم الخدمة: بيانات المنتجات (الاسم، الوصف، السعر، الصور، الفئة) من متجرك على منصة سلة أو زيد. معلومات المتجر الأساسية كالاسم والنطاق ورقم المتجر. رمز الوصول (Access Token) المُصدَر من منصة سلة للتواصل مع واجهة برمجتها.`
    },
    {
      title: "٢. كيف نستخدم بياناتك",
      content: `نستخدم البيانات المجمّعة للأغراض التالية فقط: تحليل جودة منتجاتك وحساب درجة Quick Score لكل منتج. توليد مقترحات تحسين للعناوين والأوصاف والكلمات المفتاحية باستخدام الذكاء الاصطناعي. عرض التقارير والإحصائيات داخل لوحة التحكم. لا نستخدم بياناتك لأي غرض تجاري آخر، ولا نشاركها مع أطراف ثالثة خارج نطاق الخدمة.`
    },
    {
      title: "٣. تخزين البيانات وأمانها",
      content: `تُخزَّن جميع بياناتك بأمان في Supabase، وهي منصة قواعد بيانات سحابية تلتزم بمعايير SOC 2 وISO 27001. رمز الوصول (Access Token) مُشفَّر ومحمي بصلاحيات وصول محدودة لا تتجاوز متطلبات الخدمة. لا يمكن لأي طرف ثالث الوصول إلى بياناتك دون إذن صريح منك. خوادم التطبيق مستضافة على Vercel وتعمل وفق أعلى معايير الأمان.`
    },
    {
      title: "٤. مشاركة البيانات مع الذكاء الاصطناعي",
      content: `لتوليد مقترحات التحسين، نرسل بيانات المنتج (الاسم، الوصف، السعر، الفئة) إلى خدمة OpenRouter لمعالجتها بنموذج Qwen3. هذه البيانات لا تتضمن أي معلومات شخصية للتاجر أو للعملاء. نلتزم بسياسة عدم الاحتفاظ بالبيانات (Zero Data Retention) مع مزودي خدمة الذكاء الاصطناعي.`
    },
    {
      title: "٥. حقوقك في بياناتك",
      content: `لديك الحق الكامل في: طلب حذف جميع بياناتك من أنظمتنا في أي وقت. تصدير بيانات منتجاتك ونتائج التحليلات. إلغاء ربط متجرك وإنهاء الخدمة متى شئت. للممارسة أي من هذه الحقوق، تواصل معنا عبر البريد الإلكتروني: privacy@mohsen.ai`
    },
    {
      title: "٦. ملفات تعريف الارتباط (Cookies)",
      content: `يستخدم التطبيق ملفات تعريف ارتباط ضرورية فقط للحفاظ على جلسة المستخدم وضمان عمل التطبيق بشكل صحيح. لا نستخدم ملفات تعريف ارتباط تتبع لأغراض إعلانية أو تحليلية من طرف ثالث.`
    },
    {
      title: "٧. تحديثات هذه السياسة",
      content: `قد نُحدِّث سياسة الخصوصية هذه من وقت لآخر لتعكس تغييرات في خدماتنا أو المتطلبات القانونية. سيتم إشعارك بأي تغييرات جوهرية عبر لوحة التحكم. آخر تحديث لهذه السياسة كان بتاريخ ${lastUpdate}.`
    },
  ];

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:"var(--bg)", fontFamily:"var(--sans)" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background:"var(--surf)", borderBottom:"1px solid var(--b1)", padding:"14px 20px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={()=>navigate(-1)} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", fontSize:22, display:"flex", alignItems:"center" }}>←</button>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"var(--t1)" }}>سياسة الخصوصية</div>
          <div style={{ fontSize:11, color:"var(--t3)", marginTop:1 }}>آخر تحديث: {lastUpdate}</div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 20px 60px" }}>
        {/* Hero */}
        <div style={{ background:"linear-gradient(135deg,rgba(0,212,168,.06),rgba(0,153,204,.03))", border:"1px solid rgba(0,212,168,.15)", borderRadius:16, padding:"24px", marginBottom:28, textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🛡️</div>
          <div style={{ fontSize:18, fontWeight:900, color:"var(--t1)", marginBottom:8 }}>خصوصيتك أولويتنا</div>
          <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.8 }}>
            StorePilot | محسِّن يلتزم بحماية بيانات متجرك وعدم مشاركتها مع أي طرف ثالث خارج نطاق الخدمة.
            نجمع فقط ما يلزم لتقديم الخدمة، ونتيح لك التحكم الكامل في بياناتك.
          </div>
        </div>

        {/* Sections */}
        {sections.map((sec, i) => (
          <div key={i} style={{ marginBottom:20, background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:14, padding:"20px" }}>
            <div style={{ fontSize:15, fontWeight:800, color:"var(--ac)", marginBottom:10 }}>{sec.title}</div>
            <div style={{ fontSize:13, color:"var(--t2)", lineHeight:2 }}>{sec.content}</div>
          </div>
        ))}

        {/* Contact */}
        <div style={{ background:"var(--surf)", border:"1px solid var(--b1)", borderRadius:14, padding:"20px", textAlign:"center" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"var(--t1)", marginBottom:8 }}>للاستفسار عن سياسة الخصوصية</div>
          <div style={{ fontSize:13, color:"var(--t2)", marginBottom:14 }}>يمكنك التواصل مع فريق الخصوصية لدينا مباشرة</div>
          <a href="mailto:privacy@mohsen.ai"
            style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", background:"rgba(0,212,168,.08)", border:"1px solid rgba(0,212,168,.2)", borderRadius:10, color:"var(--ac)", fontSize:14, fontWeight:700, textDecoration:"none" }}>
            ✉️ privacy@mohsen.ai
          </a>
        </div>
      </div>
    </div>
  );
}
