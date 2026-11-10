# ADR-0003: تسوق أصلي عبر Storefront API، والدفع والدخول في WebView

- الحالة: مقترح (بند الدخول معلّق على SPK-05 وSPK-06، وبند كشف النجاح على SPK-01)
- التاريخ: 2026-11-10
- مرتبط بـ: SPK-01 إلى SPK-07

## السياق
توثيق زد ينص على أن Storefront APIs لا توفر endpoints للدخول ولا للدفع، وأن تطبيقات الجوال تفتح صفحتيهما كصفحات ويب. ويشترط أن يشارك الـ WebView مخزن cookies عميل الـ API، وأن تُرسل الترويسة `Zid-Client-Platform: mobile-app` مع كل طلب. أما تفاصيل الطلب وتتبعه والاسترجاع فلا وجود لها في Storefront API، وهي متاحة في Merchant API.

## القرار
1. **من الجهاز مباشرة إلى نطاق المتجر** `https://{store-domain}/api/v1/`: الكتالوج، والبحث، والتصنيفات، وصفحة المنتج، والمراجعات، والسلة، والكوبونات، والنقاط، والمفضلة، والعناوين، والملف الشخصي، وقائمة الطلبات. ويتم ذلك بمخزن cookies واحد وترويستي `Zid-Client-Platform` و`Accept-Language`.
2. **الدفع** في `webview_flutter` على `/checkout` أو `/checkout/guest`، بعد ضبط cookies الجلسة. لا يُستخدم SFSafariViewController ولا Custom Tabs، ولا يُحقن أي سكربت في صفحة الدفع.
3. **الدخول** يبدأ في WebView. ويُنقل إلى OTP أصلي فقط إن نجح SPK-06 ووافقت زد.
4. **كشف نجاح الطلب** بثلاث طبقات: مراقبة التنقل، ثم تأكيد من الخادم (webhook `order.create` أو `account/orders`)، ثم حدث `purchase_event` اختياريًا. تُعرض بعدها شاشة تأكيد أصلية.
5. **تفاصيل الطلب والتتبع والاسترجاع** عبر خادم المنصة (BFF) الذي يستدعي Merchant API، بعد التحقق من أن الطلب يخص العميل المسجّل. ورمز التاجر لا يصل إلى الجهاز أبدًا.
6. المسارات غير الموثقة (`settings` و`brands` و`wallet` و`referral`) تُستخدم خلف أعلام ميزات، مع بديل عبر Merchant API في الخادم.

## البدائل المرفوضة
- **دفع أصلي عبر مسارات checkout غير الموثقة في SDK زد**: تخالف توجيه زد، وقد تنكسر دون إنذار.
- **إنشاء الطلب من الخادم عبر Merchant API (`drafts`) ثم رابط ZidPay**: مصمم لطلبات الشركاء، ويتجاوز سلة المتسوق وكوبوناته ونقاطه.
- **تطبيق WebView كامل**: يضحّي بالتجربة الأصلية، وهي سبب وجود المنتج.

## العواقب
- سقف تجربة الدفع واحد لكل المنافسين. التفوق يكون في ما قبل الدفع وما بعده.
- Apple Pay يعمل فقط حيث تسمح به صفحة زد داخل WKWebView (SPK-02).
- تابي تمنع أزرار الإغلاق أثناء الدفع، لذا يُخفى زر الإغلاق الأصلي على نطاق مزوّد التقسيط.

## المصادر
- [Zid: Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- [Zid: View Order](https://docs.zid.sa/view-order-12479054e0)
- [Tabby: integration without SDK](https://docs.tabby.ai/pay-in-4-custom-integration/mobile-apps/integration-without-sdk)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md`
