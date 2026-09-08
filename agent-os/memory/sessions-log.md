# 🗄️ Memory — سجل الجلسات (Sessions Log)

ملخّص مختصر لكل جلسة عمل (الأحدث فوق). الغرض: تتبّع القرارات والمخرجات.

## قالب القيد
```
### <تاريخ> — <عنوان الجلسة>
- الهدف:
- اتعمل:
- قرارات:
- متبقّي:
```

---

### مرحلة تفعيل الـ Agent OS — مهارات/أدوات فعّالة + ذاكرة حيّة
- الهدف: تنفيذ الأربع خطوات دفعة واحدة (Skills/Tools تفاعلية، Memory حيّة، جاهزية Play، جاهزية Vercel).
- اتعمل: خلّيت بطاقات Skills/Tools في الديسكتوب تشتغل بضغطة فعليّة (نيّة تكتب على طول،
  تحرير يعدّل آخر رسالة، أدوات واتساب/نسخ/متصفح حقيقية)؛ سكربت `agent-os/memory/sync.js`
  + workflow `memory-sync.yml` يجدّد سجل الجلسات أوتوماتيك من تاريخ Git بعد كل دمج؛
  دليل توقيع Play ودليل نشر Vercel (الكود جاهز، الباقي أسرار/حساب من المستخدم).
- قرارات: الأدوات كلها human-in-the-loop (مفيش إرسال تلقائي)؛ الذاكرة تتولّد من Git مش يدوي.
- متبقّي (من ناحية المستخدم): أسرار keystore على GitHub + حساب Play؛ ربط Vercel.

### مرحلة تأسيس الـ Agent OS — تنظيم + واجهة OS
- الهدف: تنظيم الريبو بهيكل agentic (ج) + إعادة تصميم الديسكتوب كواجهة OS (ب).
- اتعمل: مجلد `agent-os/` بالأعمدة الستة (Agents/Skills/MCP/Memory/Brain/LLM)؛
  وإعادة تصميم واجهة `wisal-desktop` لشكل نظام تشغيل agentic.
- قرارات: النطاق لعائلة وصال فقط (مش مشروع lahza)؛ الأدوات محلية (MCP مفهوم تنظيمي).
- متبقّي: توقيع Play، تكامل أسعار حقيقي، قنوات إرسال إضافية.

### مرحلة الديسكتوب + النشر
- الهدف: نسخة ويندوز + تجهيز Play + مراجعة.
- اتعمل: تطبيق Electron (`wisal-desktop`) + CI ويندوز + أيقونة مخصّصة؛ AAB + صفحة خصوصية
  + اسم تجاري «وصال» + `com.wisal.app`؛ أزرار تنزيل أندرويد/ويندوز في الموقع.
- قرارات: Electron لتوافق واسع؛ توقيع رسمي مؤجّل لحد ما المستخدم يضيف الأسرار.

---

<!-- AUTO:START -->

## سجل تلقائي (Auto Log) — من تاريخ Git

| التاريخ | الميلستون | commit |
| --- | --- | --- |
| 2026-09-08 | Add GitHub Actions workflow for GitHub Pages deployment | `8d67cec` |
| 2026-08-07 | Add Beyond Style storefront as a second brand surface (PWA + SEO/AIO) (#60) | `7cd6545` |
| 2026-08-03 | Performance: lazy broadcast list (LazyColumn) + single-read next-action (#93) | `d8071f5` |
| 2026-08-02 | Privacy transparency + accessibility labels + CI signing status (#90) | `b36d99b` |
| 2026-07-23 | feat(checkout): actually deliver the completed order to the business (WhatsApp) | `176ec43` |
| 2026-07-21 | Add V0.2: live KPI entry, full bilingual UI, snapshot save/load | `78f2947` |
| 2026-07-12 | Add generic Annual Operational Plan 2026 V0.1 (single self-contained HTML) | `e08e330` |
| 2026-07-20 | Transformation audit: P1 main-thread IO fix, P2 DRY+tests, CI resilience (#78) | `e003da2` |
| 2026-07-15 | Smart feature: رد ذكي — suggest replies to a received message (#77) | `6cb47b5` |
| 2026-07-15 | Debug review fixes: desktop occasion/slot, Android member-key collision, re-import state (#76) | `b03807c` |
| 2026-07-15 | Smart: proactive next-best-action on Android home + remove desktop tap effect (#75) | `954d4a0` |
| 2026-07-15 | Android: Material 3 Expressive redesign (modern 3D), remove tap effect, smarter hero (#74) | `53fc862` |
| 2026-07-14 | Android broadcast UX: copy-all/export, preview-first, favorite templates (#73) | `815b69a` |
| 2026-07-14 | Review fixes: phone-normalize bug + testable util + desktop parity + bulk cap (#72) | `a4bc92c` |
| 2026-07-14 | Android: AI-personalized message per member + watercolor tap effect (#71) | `3f13af6` |
| 2026-07-14 | Android: group broadcast — country code, CSV import, saved groups, unknown-number send (#70) | `701329e` |
| 2026-07-14 | Desktop: group broadcast (import + persona) + 3D/watercolor redesign (#69) | `cd6cc1e` |
| 2026-07-14 | Agent-OS: interactive Skills/Tools, live Memory sync, deploy guide (#67) | `d79ad16` |
| 2026-07-14 | Agentic OS: workspace structure (agent-os/) + Wisal desktop OS shell (#65) | `d8f1ff4` |
| 2026-07-14 | Desktop custom icon + Windows download buttons on landing (#64) | `86f8d0c` |
| 2026-07-13 | feat(media): fill every gallery tile & preview with real imagery (#63) | `156d37b` |
| 2026-07-12 | Add Wisal desktop app for Windows (Electron) + CI installer build (#62) | `d27e71a` |
| 2026-07-12 | CI: prune stale release assets so the download link stays clean (#57) | `411e1e7` |
| 2026-07-11 | docs: fix broken README links + verify no cross-project conflict (#56) | `2b187b1` |
| 2026-07-08 | Add privacy policy page for Play Store (wisal-web/privacy) (#53) | `33d8a30` |

> بيتولّد أوتوماتيك بواسطة `agent-os/memory/sync.js` — متعدّلش القسم ده بإيدك.

<!-- AUTO:END -->
