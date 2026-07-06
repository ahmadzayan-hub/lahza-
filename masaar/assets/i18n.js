// Bilingual strings, hand-written. No AI hedging or filler.
export const STRINGS = {
  en: {
    dir:'ltr', lang:'en',
    brand:'Masaar', tagline:'Rail Asset Performance Platform',
    subtag:'From operational plan to informed decisions.',
    install:'Install app', installed:'Installed',
    themeLight:'Light', themeDark:'Dark',
    langSwitch:'العربية',
    nav: {
      overview:'Overview', dashboard:'Dashboard', plan:'Plan',
      projects:'Projects', risks:'Risks', security:'Security', agent:'Agent'
    },
    overview: {
      title:'What Masaar does',
      body:'Masaar turns an annual maintenance plan into a live decision surface. You enter what actually happened, it computes status, it flags gaps, and its assistant works alongside your team — reading the plan, checking the numbers, and proposing what to do next.',
      pillars:[
        { t:'Enter what happened', d:'Type your monthly numbers. Nothing is fabricated.' },
        { t:'See where you stand',  d:'Targets, trend, status computed on the spot.' },
        { t:'Ship the decision',    d:'Turn every red light into an owned action.' },
        { t:'Works offline',         d:'Install once, use anywhere, sync when back online.' }
      ]
    },
    dashboard: {
      title:'Monthly KPI Dashboard',
      note:'Numbers you enter stay on this device. Nothing is sent anywhere until you ask the assistant.',
      enterValue:'Enter value', target:'Target', trend:'Trend', status:'Status',
      lastUpdated:'Last updated', save:'Save', clear:'Clear',
      states:{ ok:'On track', warn:'Watch', bad:'Off track', none:'No data' }
    },
    plan: {
      title:'Transformation plan',
      body:'Five stages that move maintenance from output reporting to outcome accountability.',
      stages:[
        { t:'Data cleanup', d:'Trusted baseline data before anything else.' },
        { t:'Asset criticality', d:'Prioritise by service and safety impact.' },
        { t:'Reliability baseline', d:'Quantify MTBF, MTTR, top failure modes.' },
        { t:'Predictive maintenance', d:'Move from time-based to condition-based.' },
        { t:'Performance governance', d:'Monthly reliability board, quarterly digital review.' }
      ]
    },
    projects: {
      title:'Project portfolio',
      search:'Search project or category',
      priority:'Priority', status:'Status', category:'Category', budget:'Budget',
      reset:'Reset', est:'Estimated', b26:'Approved 2026', action:'Required action',
      all:'All', empty:'No project matches these filters.'
    },
    risks: {
      title:'Risk register',
      rating:'Rating', likelihood:'Likelihood', impact:'Impact', mitigation:'Mitigation',
      empty:'No risk matches these filters.',
      heatmap:'Likelihood × Impact heatmap'
    },
    security: {
      title:'Security posture',
      lead:'Application and environment threat model, with a live gap check.',
      appLayer:'Application layer', envLayer:'Environment layer',
      threats:'Threats', controls:'Controls', gaps:'Live gaps',
      scan:'Scan now', clean:'No gaps detected.',
      severity:'Severity', control:'Control', scenario:'Scenario', status:'Status',
      st:{ mitigated:'Mitigated', partial:'Partial', open:'Open' }
    },
    agent: {
      title:'Operations assistant',
      lead:'Reads the plan, tracks the numbers, proposes actions. Bring your own key.',
      key:'Provider key', provider:'Provider', model:'Model',
      save:'Save & connect', connected:'Connected', disconnected:'Not connected',
      placeholder:'Ask about MTTR trends, top risks, next actions…',
      send:'Send', loop:'Loop mode', loopMin:'Every X minutes', start:'Start', stop:'Stop',
      memory:'Memory', clearMem:'Clear memory', tools:'Tools available',
      systemNote:'This assistant reads your plan and can propose changes. Every write asks for confirmation.'
    },
    common:{ pending:'Pending', high:'High', medium:'Medium', low:'Low',
             critical:'Critical', red:'Red', amber:'Amber', green:'Green' }
  },
  ar: {
    dir:'rtl', lang:'ar',
    brand:'مسار', tagline:'منصة أداء أصول السكك الحديدية',
    subtag:'من الخطة التشغيلية إلى قرارات مدروسة.',
    install:'تثبيت التطبيق', installed:'مثبَّت',
    themeLight:'فاتح', themeDark:'داكن',
    langSwitch:'English',
    nav: {
      overview:'نظرة عامة', dashboard:'اللوحة', plan:'الخطة',
      projects:'المشاريع', risks:'المخاطر', security:'الأمن', agent:'المساعد'
    },
    overview: {
      title:'ماذا يقدم مسار',
      body:'يحوّل مسار الخطة السنوية للصيانة إلى واجهة قرار حية. تُدخل ما حدث فعلًا، فيحسب الحالة ويكشف الفجوات، ويعمل مساعده الذكي إلى جانب فريقك: يقرأ الخطة، ويراجع الأرقام، ويقترح الخطوة التالية.',
      pillars:[
        { t:'أدخل ما حدث', d:'اكتب أرقامك الشهرية، ولا يُختلق أي رقم.' },
        { t:'اعرف موقعك', d:'الهدف والاتجاه والحالة تُحسب فورًا.' },
        { t:'أنجز القرار', d:'حوّل كل إشارة حمراء إلى إجراء بمالك محدد.' },
        { t:'يعمل بدون إنترنت', d:'ثبّته مرة، واستخدمه في أي مكان، وسيُزامَن لاحقًا.' }
      ]
    },
    dashboard: {
      title:'لوحة المؤشرات الشهرية',
      note:'الأرقام التي تدخلها تبقى على هذا الجهاز. لا يُرسَل شيء إلى أي مكان قبل أن تطلب من المساعد.',
      enterValue:'أدخل القيمة', target:'الهدف', trend:'الاتجاه', status:'الحالة',
      lastUpdated:'آخر تحديث', save:'حفظ', clear:'مسح',
      states:{ ok:'ضمن المسار', warn:'تحت المراقبة', bad:'خارج المسار', none:'لا توجد بيانات' }
    },
    plan: {
      title:'خطة التحول',
      body:'خمس مراحل تنقل الصيانة من التقارير إلى المساءلة عن النتائج.',
      stages:[
        { t:'تنقية البيانات', d:'بيانات موثوقة قبل أي شيء آخر.' },
        { t:'أهمية الأصول', d:'ترتيب الأولويات بحسب أثر الخدمة والسلامة.' },
        { t:'خط أساس الموثوقية', d:'قياس متوسط زمن الأعطال والإصلاح وأنماط الفشل.' },
        { t:'الصيانة التنبؤية', d:'الانتقال من الصيانة الزمنية إلى الصيانة المشروطة.' },
        { t:'حوكمة الأداء', d:'لجنة موثوقية شهرية ومراجعة رقمية ربع سنوية.' }
      ]
    },
    projects: {
      title:'محفظة المشاريع',
      search:'ابحث باسم المشروع أو الفئة',
      priority:'الأولوية', status:'الحالة', category:'الفئة', budget:'الميزانية',
      reset:'إعادة ضبط', est:'القيمة التقديرية', b26:'المعتمد ٢٠٢٦', action:'الإجراء المطلوب',
      all:'الكل', empty:'لا يوجد مشروع يطابق هذه المرشحات.'
    },
    risks: {
      title:'سجل المخاطر',
      rating:'التصنيف', likelihood:'الاحتمال', impact:'الأثر', mitigation:'المعالجة',
      empty:'لا توجد مخاطر تطابق هذه المرشحات.',
      heatmap:'خارطة حرارية للاحتمال والأثر'
    },
    security: {
      title:'الوضع الأمني',
      lead:'نموذج تهديد على مستوى التطبيق والبيئة، مع فحص فجوات حي.',
      appLayer:'طبقة التطبيق', envLayer:'طبقة البيئة',
      threats:'التهديدات', controls:'الضوابط', gaps:'الفجوات الحيّة',
      scan:'افحص الآن', clean:'لا توجد فجوات.',
      severity:'الخطورة', control:'الضابط', scenario:'السيناريو', status:'الحالة',
      st:{ mitigated:'معالَج', partial:'جزئي', open:'مفتوح' }
    },
    agent: {
      title:'مساعد العمليات',
      lead:'يقرأ الخطة، ويتابع الأرقام، ويقترح الإجراءات. يعمل بمفتاحك الخاص.',
      key:'مفتاح المزوّد', provider:'المزوّد', model:'النموذج',
      save:'حفظ واتصال', connected:'متصل', disconnected:'غير متصل',
      placeholder:'اسأل عن اتجاه زمن الإصلاح، أعلى المخاطر، أو الخطوة التالية…',
      send:'إرسال', loop:'وضع الحلقة', loopMin:'كل × دقيقة', start:'ابدأ', stop:'أوقف',
      memory:'الذاكرة', clearMem:'مسح الذاكرة', tools:'الأدوات المتاحة',
      systemNote:'يقرأ المساعد الخطة، ويمكنه اقتراح تعديلات. كل تعديل يستوجب تأكيدًا صريحًا منك.'
    },
    common:{ pending:'قيد الاستكمال', high:'مرتفع', medium:'متوسط', low:'منخفض',
             critical:'حرِج', red:'أحمر', amber:'كهرماني', green:'أخضر' }
  }
};
