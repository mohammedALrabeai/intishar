# ADR-0006: التخطيطات والهوية في API المنصة لا في Firebase Remote Config

- الحالة: مقترح
- التاريخ: 2026-11-10
- مرتبط بـ: ADR-0004

## السياق
Firebase Remote Config محدود بمليون حرف و3,000 معامل لكل مشروع، والمشروع الواحد لا يحمل أكثر من 30 تطبيقًا. والتخطيطات تحتاج نسخًا، ومسودات، وجدولة، واستهدافًا حسب الشريحة.

## القرار
1. التخطيطات والـ tokens تُقدَّم من API المنصة خلف CDN مع ETag، بمفتاح `{tenant}/{page}/{segment}/{locale}/{schema_version}`.
2. كل نشر نسخة ثابتة غير قابلة للتعديل، والرجوع إلى نسخة سابقة بنقرة.
3. **الإقلاع**: يبقى السبلاش الأصلي، ثم يُحمَّل آخر تخطيط من القرص، أو من لقطة مضمّنة في الملف التنفيذي عند أول تشغيل. يُرسم التطبيق، ثم يُعاد التحقق في الخلفية بـ `If-None-Match`، والنسخة الجديدة تُطبَّق عند التنقل التالي.
4. **endpoint أعلام منفصل** لمفاتيح الإيقاف الطارئ و`min_supported_app_version` وطلب التحديث الإجباري.
5. **Shorebird** لإصلاحات Dart الطارئة فقط، لا لتغيير الوظائف.

## البدائل المرفوضة
- **Firebase Remote Config للتخطيطات**: حدوده لا تكفي، ولا نسخ فيه ولا مسودات.

## العواقب
- المنصة مسؤولة عن توفر هذا الـ API. لذلك يحتاج CDN، وتخزينًا مؤقتًا على الجهاز، ولقطة احتياطية مضمّنة.

## المصادر
- [Firebase Remote Config limits](https://firebase.google.com/docs/remote-config/parameters)، [Firebase FAQ](https://firebase.google.com/support/faq)
- [Shorebird FAQ](https://docs.shorebird.dev/code-push/faq/)

## تعديلات 2026-11-10 من مواصفات الوحدات

1. **معنى `schema_version`:** رقم مراجعة حزمة العقود كلها. فالتحقق من `min_app_version` لكل كتلة يتم على الجهاز، و`X-Supported-Blocks` للتحقق من الاتساق فقط ([M03](../modules/M03-blocks-pages.md)، و[M11](../modules/M11-app-config-service.md)).
2. **CDN:** يُستخدم ETag مع cache tags في Cloudflare، ويُطهَّر عند النشر. ولا يُستخدم `s-maxage`، لأن Cloudflare يعامله كـ `proxy-revalidate` فيعطّل تقديم النسخة القديمة أثناء إعادة التحقق.
3. **اللقطة المضمّنة:** لقطة واحدة تجمع الأعلام والهوية والـ shell والرئيسية لكل لغة مدعومة، وتُبنى وقت البناء ([M01](../modules/M01-app-foundation.md)، و[M13](../modules/M13-build-release.md)).
