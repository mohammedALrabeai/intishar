# ADR-0005: خادم Laravel بنمط Modular Monolith يعمل كـ BFF

- الحالة: مقترح
- التاريخ: 2026-11-10
- مرتبط بـ: ADR-0010, D-06

## السياق
يحتاج المنتج خادمًا يربط المتاجر عبر OAuth، ويستقبل webhooks زد، ويخزن التخطيطات والهوية، ويرسل الإشعارات، ويقدم تفاصيل الطلب. وزد ترسل webhook ثلاث محاولات فقط، وتعلّق الإرسال بعد 30 فشلًا في الساعة، وبلا توقيع HMAC. وحد Merchant API هو 60 طلبًا في الدقيقة لكل متجر.

## القرار
1. **Laravel** بنمط Modular Monolith، مع PostgreSQL وRedis وطوابير وتخزين كائنات مع CDN.
2. **الوحدات**: `Tenancy`، و`ZidConnector` (OAuth والرموز وwebhooks وMerchant API)، و`AppConfig` (التخطيطات والـ tokens والنسخ والجدولة)، و`Builds` (خط البناء)، و`Push`، و`Orders` (BFF للطلبات والتتبع)، و`Analytics`، و`Billing` لاحقًا.
3. **طبقة Connector** بواجهة عامة، وزد أول تنفيذ لها، حتى يمكن إضافة منصة أخرى لاحقًا دون إعادة بناء.
4. **Webhooks**: ترد فورًا بـ 200 وتعالج في طابور، وتتحقق بـ Basic Auth، وتعيد جلب الكيان من API قبل الوثوق بمحتوى الحمولة.
5. **حدود المعدّل**: محدِّد طلبات لكل متجر، يحترم `Retry-After`، ولا يوقف بقية المتاجر بسبب متجر واحد.
6. **تجديد refresh token** مجدول قبل انتهائه، كل نحو 10 أشهر.

## البدائل المرفوضة
- **Microservices من البداية**: تعقيد تشغيلي بلا حمل يبرره.
- **Firebase أو Supabase خادمًا وحيدًا**: لا يناسب webhooks وطوابير وتكامل OAuth الخاص بالخادم.

## العواقب
- كل وحدة لها حدود واضحة، ويمكن فصلها لاحقًا إن احتاجت.
- الواجهات كلها (لوحة التاجر ولوحة الإدارة) بـ Next.js وفق ADR-0010. وLaravel يقدم API فقط، بلا Blade ولا Filament.

## المصادر
- [Zid: Webhooks](https://docs.zid.sa/webhooks)، [Webhook Health](https://docs.zid.sa/webhook-health-tracking-2197281m0)
- [Zid: Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0)، [Authorization](https://docs.zid.sa/authorization)

## تعديلات 2026-11-10 من مواصفات الوحدات

1. **الإصدار:** Laravel 13 مع PHP 8.4، لأن دعم Laravel 12 الأمني ينتهي في 24 فبراير 2027، أي قبل الإطلاق ([M12](../modules/M12-platform-core.md)).
2. **الوحدات بعد التفصيل:** `Platform`، و`Tenancy`، و`Commerce`، و`ZidConnector`، و`AppConfig`، و`Shoppers` (هوية المتسوق)، و`Orders`، و`Push`، و`Links`، و`Analytics`، و`Engagement`، و`Builds`، و`Onboarding`. وحدودها تحرسها اختبارات `arch()` في Pest.
3. **حقيقتان عن زد تُضافان إلى السياق:** الـ webhook المعطّل يُسقط الأحداث المعلّقة، واستعادته تحتاج عنوانًا جديدًا. لذلك يحمل عنوان كل webhook رقم جيل، ويغطي الفجوات تصالح ليلي ([M10](../modules/M10-zid-connector.md)).
4. **تعدد المستأجرين:** قاعدة واحدة بعمود `tenant_id`، والـ global scope يرمي خطأ إن غاب سياق المستأجر. والمستأجر يُحمل في مسار الـ API لا في ترويسة، لأن Cloudflare يتجاهل `Vary` على الترويسات المخصصة.
