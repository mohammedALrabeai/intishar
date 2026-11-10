# M08: التحليلات

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter، وLaravel، وNext.js، وخدمة خارجية (Sentry، وZid Merchant API) |
| المتطلبات | F-M11 (Must)، وF-P03 (Must، جزء الانهيارات لكل تاجر)، وF-P01 (Must، صحة البيانات في لوحة الإدارة). ويخدم مؤشرات PRD §3 |
| القرارات | ADR-0003 (كشف نجاح الطلب، ومنع الحقن في صفحة الدفع)، وADR-0004 (`unknown_block` ومعرّف الكتلة)، وADR-0005 (وحدة `Analytics` في الخادم)، وADR-0006 (`page_version`)، وADR-0008 (مشاريع Firebase المشتركة)، وADR-0010 (العقد المشترك في `06-api/`) |
| تعتمد على | M10 (webhooks الطلبات وMerchant API)، وM12 (المستأجر ومفتاح التطبيق والأعلام والأسرار وSentry)، وM01 (العميل الشبكي والتخزين المحلي ودورة حياة التطبيق)، وM03 (هوية الكتل)، وM04 (أحداث التسوق ورابط الدفع)، وM06 (الإرسال وفتح الإشعار)، وM07 (فتح الروابط)، وM11 (بيانات الصفحات المنشورة)، وM13 (اسم الإصدار في Sentry)، وM15 (هيكل اللوحة ونظام التصميم) |
| بادئة القصص | ANL |

## 1. الغرض والنطاق

الوحدة تملك **التصنيف الموحّد للأحداث**، و**جمعها** من التطبيق، و**استقبالها وتخزينها** في الخادم، و**نسبة طلبات زد إلى التطبيق**، و**تعريف المؤشرات** التي تظهر للتاجر وللمنصة. كل وحدة أخرى تعلن أحداثها في مواصفتها بالأسماء الواردة هنا، ولا تضيف حدثًا جديدًا إلا عبر سجل الأحداث في هذه الوحدة.

**القرار الأساسي**: في الإصدار الأول خط تحليلات خاص بالمنصة (التطبيق إلى Laravel إلى PostgreSQL) هو المصدر الوحيد للأرقام. ولا يُضمَّن `firebase_analytics` في التطبيق. وأسماء الأحداث وخصائصها مطابقة لأحداث GA4 الموصى بها، حتى يكون التمرير إلى GA4 أو شبكات الإعلان لاحقًا بلا تحويل. التبرير في القسم 3.1.

### داخل الإصدار الأول (Must)
- سجل أحداث مكتوب (`06-api/analytics/events.v1.yaml`) تُولَّد منه أنواع Dart وقواعد تحقق PHP.
- مكتبة جمع في التطبيق: غلاف موحّد، وجلسات، وطابور على القرص يعمل بلا اتصال، وإرسال بدفعات، ومعاينة عيّنات يتحكم بها الخادم، ومفتاح إيقاف.
- واجهة استقبال في Laravel، وجدول أحداث مقسّم يوميًا في PostgreSQL، وحذف آلي بحسب مدة الاحتفاظ.
- نسبة الطلبات إلى التطبيق من طلبات زد نفسها (`source`، ثم `marketing_source`، ثم إشارة الشراء من التطبيق)، مع مطابقة ليلية.
- مؤشرات لوحة التاجر بتعريفات دقيقة (القسم 5.4): إيرادات التطبيق وطلباته، ومتوسط قيمة الطلب، ومعدل التحويل، وDAU وMAU، وفتح الإشعارات والإيراد المنسوب إليها، وأعلى الكتل نقرًا وإيرادًا، والجلسات الخالية من الانهيار من Sentry.
- واجهات API للوحة التاجر ولوحة الإدارة، وصفحة التحليلات في Next.js فوق هيكل M15.
- الخصوصية: لا معرّف إعلاني، ولا IP مخزّن، وحذف بيانات العميل عند حذف حسابه، ومفتاح «مشاركة بيانات الاستخدام» في إعدادات التطبيق.

### لاحقًا (Should وCould)
- **Should**: بكسلات التاجر (Meta وGoogle وTikTok وSnap) بتمرير من الخادم، مع ATT (القسم 3.8). ومجموعات الاحتفاظ (cohorts). وتصدير CSV. ونسبة إيراد التطبيق من إجمالي إيراد المتجر.
- **Could**: الانتقال إلى ClickHouse عند تجاوز العتبات (القسم 4.4). وتمرير الأحداث إلى GA4 الخاص بالتاجر عبر Measurement Protocol. ومستكشف المسارات (funnels) الحر. وتحليل اختبارات A/B (F-M13).

### ليس من مسؤوليتها
- إرسال الإشعارات وإحصاء ما أُرسل فعلًا: M06 يملكها، وM08 يستهلك أعداد الإرسال الناجح.
- كشف نجاح الدفع وشاشة التأكيد: M04 وفق ADR-0003. وM08 يستقبل إشارة الشراء فقط.
- هيكل اللوحة ومكوّنات الرسوم: M15. وM08 يحدد المحتوى والعقد.
- إعداد Sentry في التطبيق والخادم: M12 وM01. وM08 يقرأ نتائج release health فقط.

## 2. المكونات حسب الطبقة

### 2.1 تطبيق المتسوق (Flutter)

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `uuid` | ^4.6.0 | `event_id` بصيغة UUIDv7 (مرتبة زمنيًا)، و`session_id` و`device_id` و`checkout_attempt_id` بصيغة UUIDv4 |
| `sqflite` | ^2.4.6 | جدول الطابور على القرص. وإن اعتمد M01 `drift` (^2.35.4) قاعدةً محلية يُستخدم جدول فيها بدلًا منه |
| `dio` | ^5.11.1 | العميل الشبكي المشترك من M01، مع ضغط gzip للطلب |
| `package_info_plus` | ^10.2.2 | `app_version` و`build` |
| `device_info_plus` | ^13.3.0 | `os_version` فقط. لا يُرسل طراز الجهاز ولا أي معرّف عتادي |
| `connectivity_plus` | ^7.3.2 | تأجيل الإرسال حين لا يوجد اتصال |
| `sentry_flutter` | ^10.3.0 | يهيئه M01 وM12. وM08 يعتمد على جلسات release health فيه |
| ليست في الإصدار الأول | — | `firebase_analytics` (13.0.1)، و`app_tracking_transparency` (2.0.7) تدخل مع ANL-16 فقط |

**الملفات** (حزمة داخلية `packages/intishar_analytics/`):

| الملف | المسؤولية |
|---|---|
| `lib/src/analytics_client.dart` | الواجهة `AnalyticsClient`: `track(AnalyticsEvent e)` و`setCustomer(String? id)` و`setScreen(String name)` و`flush()` و`setEnabled(bool)` |
| `lib/src/envelope.dart` | بناء الغلاف الموحّد (القسم 5.2) من السياق الحالي |
| `lib/src/session_manager.dart` | بدء الجلسة وانتهاؤها، وإطلاق `app_open` مرة واحدة لكل جلسة |
| `lib/src/event_queue.dart` | الطابور على القرص بسقف وأولويات وعمر أقصى |
| `lib/src/uploader.dart` | الدفعات، وإعادة المحاولة بتراجع أسّي، وقراءة `Retry-After` |
| `lib/src/sampling.dart` | تطبيق نسب العيّنة من endpoint الأعلام (M01) |
| `lib/src/attribution_context.dart` | آخر لمسة: فتح إشعار، أو فتح رابط، أو نقرة كتلة في الجلسة |
| `lib/src/checkout_attribution.dart` | يبني معاملات UTM التي يلحقها M04 برابط الدفع (القسم 3.4) |
| `lib/src/redaction.dart` | تنقية نص البحث من الأرقام الطويلة وعناوين البريد |
| `lib/generated/analytics_events.g.dart` | أصناف الأحداث المولّدة من السجل، فلا يكتب أحد اسم حدث نصًا حرًا |
| `lib/src/noop_analytics_client.dart` | تنفيذ فارغ لمعاينة Flutter Web في اللوحة (ADR-0004، البند 7) |

### 2.2 خادم المنصة (Laravel)

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `laravel/framework` | ^13 (13.40.0 وقت الكتابة، والإصدار الملزم في `07-engineering-handbook.md`) | الوحدة `Analytics` ضمن Modular Monolith (ADR-0005) |
| Redis وطوابير Laravel | بحسب 07 | فصل الاستقبال عن الكتابة |
| PostgreSQL | 18 (توثيق التقسيم المرجعي) | الجدول المقسّم والجداول المجمّعة |
| `smi2/phpclickhouse` | ^1.26 (Could فقط) | كاتب ClickHouse عند الانتقال (القسم 4.4) |

**الملفات** (`app/Modules/Analytics/`):

| الملف | المسؤولية |
|---|---|
| `Http/Controllers/App/IngestController.php` | `POST /app/v1/analytics/events` |
| `Http/Requests/IngestBatchRequest.php` | التحقق من الغلاف والحدود |
| `Ingest/EventSchemaRegistry.php` | قواعد كل حدث، مولّدة من `events.v1.yaml` |
| `Jobs/PersistEventBatch.php` | تصحيح الساعة، والإثراء، والكتابة بدفعات |
| `Sinks/EventSink.php` و`Sinks/PostgresEventSink.php` | واجهة الكتابة وتنفيذها. وتنفيذ ClickHouse لاحقًا خلف الواجهة نفسها |
| `Orders/OrderAttributionService.php` | قاعدة النسبة إلى التطبيق (القسم 3.3) |
| `Listeners/RecordZidOrder.php` | يستهلك أحداث M10 للطلبات |
| `Listeners/LinkCheckoutAttempt.php` | يستهلك `Orders\CheckoutConfirmed` من وحدة الطلبات |
| `Rollups/DailyTenantMetrics.php` و`DailyBlockMetrics.php` و`DailyPushMetrics.php` و`DailyActiveDevices.php` | التجميع |
| `Sentry/SentrySessionsClient.php` | قراءة Sessions API |
| `Console/Commands/ManagePartitions.php` | إنشاء الأقسام مسبقًا وحذف القديمة |
| `Console/Commands/ReconcileOrders.php` | المطابقة الليلية مع Merchant API |
| `Http/Controllers/Dashboard/*` و`Http/Controllers/Admin/*` | واجهات القراءة |
| `Privacy/ForgetCustomer.php` و`Privacy/PurgeTenant.php` | الحذف |

### 2.3 لوحة التاجر ولوحة الإدارة (Next.js)

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| shadcn/ui charts فوق `recharts` | ^3.10.1 | الرسوم الزمنية والأعمدة |
| `@tanstack/react-query` | ^5.107 | جلب البيانات وتحديثها كل 5 دقائق |
| `date-fns` | ^4.4.0 | النطاقات الزمنية بمنطقة المتجر |
| `zod` | ^4.6 | التحقق من استجابات API |

الصفحات: `app/(merchant)/analytics/page.tsx` و`app/(merchant)/analytics/blocks/page.tsx` و`app/(admin)/analytics-health/page.tsx`. والمكوّنات المشتركة (بطاقة مؤشر، ومنتقي المدة) من M15.

### 2.4 خدمات خارجية

| الخدمة | ما نستخدمه | الصلاحية |
|---|---|---|
| Sentry | [Sessions API](https://docs.sentry.io/api/releases/retrieve-release-health-session-statistics/) لمعدل الجلسات الخالية من الانهيار | رمز منظمة بصلاحية قراءة فقط، في خزنة M12 |
| Zid Merchant API | `GET /orders/{id}` و`List Orders` عبر عميل M10 | ما يمنحه تثبيت التطبيق |

## 3. التدفقات

### 3.1 لماذا خط خاص لا Firebase Analytics

| المعيار | خط خاص إلى Laravel | Firebase Analytics وGA4 لكل تاجر | الاثنان معًا |
|---|---|---|---|
| عزل بيانات التاجر | كامل، بـ `tenant_id` | مشروع Firebase الواحد يرتبط بخاصية GA4 واحدة، وكل تطبيق فيه تدفق بيانات داخلها ([Firebase Management API: addGoogleAnalytics](https://firebase.google.com/docs/projects/api/reference/rest/v1beta1/projects/addGoogleAnalytics)). وADR-0008 يجمع 15 تاجرًا في المشروع، فتختلط بياناتهم في خاصية واحدة ولا يمكن منح التاجر وصولًا إليها | يرث مشكلة العزل |
| الربط بطلبات زد والكتل | مباشر في SQL | يحتاج تصدير BigQuery ثم ربطًا خارجيًا | ممكن، بتكلفة تشغيل مضاعفة |
| حجم التطبيق والخصوصية | لا SDK إضافي، ولا معرّف إعلاني | SDK إضافي. والحزمة الكاملة تربط AdSupport على iOS ما لم تُستخدم `FirebaseAnalyticsCore` ([Firebase: configure data collection](https://firebase.google.com/docs/analytics/configure-data-collection?platform=ios)) | الاثنان |
| الحدود | نحددها نحن | 500 اسم حدث مميز لكل تطبيق، و25 معاملًا لكل حدث، و25 خاصية مستخدم ([GA4 collection limits](https://support.google.com/analytics/answer/9267744)). والاحتفاظ بالبيانات الحدثية شهران أو 14 شهرًا في الخاصية العادية ([GA4 data retention](https://support.google.com/analytics/answer/7667196)) | — |
| التكلفة | تخزين وحساب على خادمنا | Analytics بلا تكلفة في الخطتين ([Firebase pricing](https://firebase.google.com/pricing)) | — |
| جهد المنفذ | مكتبة جمع وواجهة استقبال وجداول تجميع (نحو 4 سباقات) | أقل في الجمع، وأكثر في الربط والعزل | الأعلى |

**التوصية**: خط خاص وحده في الإصدار الأول. وتُكتب ADR-0011 بهذا القرار (القسم 8). وتبقى أسماء الأحداث متوافقة مع GA4، فيصبح التمرير لاحقًا (Could) تحويلًا مباشرًا لا إعادة تصميم.

### 3.2 جمع حدث وإرساله (التطبيق)

1. تستدعي الشاشة `analytics.track(AddToCart(items: [...], value: 189.0, currency: 'SAR', origin: 'pdp'))` بصنف مولّد. لا يوجد `track(String name, Map props)` عام.
2. إن كان `analytics.enabled = false` من endpoint الأعلام، أو أطفأ المتسوق «مشاركة بيانات الاستخدام»، يُهمل الحدث ويتوقف.
3. تطبّق `sampling.dart` نسبة العيّنة للحدث: `keep = fnv1a(device_id + event_name) mod 10000 < rate × 10000`. والنسبة الافتراضية 1.0 لكل أحداث الإصدار الأول. والقرار حتمي لكل جهاز، فلا تنكسر الجلسات. وتُرسل `sample_rate` مع الحدث.
4. يُبنى الغلاف: `event_id` (UUIDv7)، و`occurred_at` بتوقيت UTC بالمللي ثانية، و`seq` تسلسل متزايد لكل جهاز، والسياق (القسم 5.2).
5. يُكتب الحدث في جدول `anl_queue` على القرص. والكتابة مجمّعة كل ثانية واحدة خارج إطار الرسم، فلا تتجاوز كلفة `track()` على خيط الواجهة 1 ms.
6. **شروط الإرسال**: كل 30 ثانية والتطبيق في المقدمة، أو حين يبلغ الطابور 20 حدثًا، أو عند `AppLifecycleState.paused`، أو فورًا بعد `begin_checkout` و`purchase` و`push_open`.
7. تُسحب دفعة حتى 50 حدثًا أو 64 KB قبل الضغط، وتُرسل `POST /app/v1/analytics/events` مضغوطة بـ gzip.
8. **الاستجابة**:
   - 202: تُحذف الأحداث المقبولة والمكرّرة والمرفوضة من الطابور. وتُسجَّل الرموز المرفوضة في breadcrumb لـ Sentry.
   - 413: تُقسم الدفعة نصفين وتُعاد.
   - 429 أو 5xx أو انقطاع: تراجع أسّي 2 ثم 4 ثم 8 ثوانٍ حتى 5 دقائق، بتذبذب ±20%، مع احترام `Retry-After`.
   - 401: يتوقف الإرسال حتى التشغيل التالي، ويبقى الطابور.
   - 403 بالرمز `analytics_disabled`: يُفرَّغ الطابور ويتوقف الجمع حتى تتغير الأعلام.
9. **السقف**: 2,000 حدث أو 5 MB. وعند الامتلاء يُحذف الأقدم من الأحداث منخفضة الأولوية أولًا (`block_impression`، ثم `screen_view`، ثم `view_item_list`). ولا يُحذف `begin_checkout` ولا `purchase` ولا `push_open` بسبب السقف.
10. يُحذف أي حدث عمره في الطابور أكثر من 72 ساعة، لأن الخادم يرفضه (القسم 3.3).

**الجلسة**: تبدأ جلسة جديدة عند التشغيل البارد، أو عند العودة إلى المقدمة بعد أكثر من 30 دقيقة في الخلفية. وهذا يطابق مهلة GA4 الافتراضية ([GA4 sessions](https://support.google.com/analytics/answer/9191807)). ويُطلق `app_open` مرة واحدة في بداية كل جلسة، فيصبح عدد الجلسات هو عدد أحداث `app_open`.

**معرّف الجهاز**: UUIDv4 يُولَّد عند أول تشغيل، ويُحفظ في تخزين التطبيق، ويُحذف مع حذف التطبيق. لا يُستخدم IDFA ولا IDFV ولا Android ID ولا advertising ID.

### 3.3 استقبال الدفعة وتخزينها (الخادم)

1. تستقبل `IngestController` الطلب. يُحدَّد المستأجر من `X-Tenant-Key`، وهو مفتاح عام يُحقن في `tenant.json` وقت البناء (ADR-0002) ويديره M12. وإن خالف `tenant_id` في الجسم المفتاح يُرفض الطلب بـ 401.
2. حدود المعدّل (Laravel RateLimiter): 120 طلبًا في الدقيقة لكل `device_id`، و20,000 لكل مستأجر. وما زاد يُرد بـ 429 مع `Retry-After`.
3. يُتحقق من الغلاف: حتى 50 حدثًا، وحجم مفكوك حتى 256 KB، وكل حدث معروف في السجل، والخصائص مطابقة لقواعده. والحدث المخالف يُرفض وحده برمز، ولا تُرفض الدفعة كلها.
4. **تصحيح الساعة**: `skew = received_at − sent_at`، ثم `occurred_at_corrected = occurred_at + skew`. فإن وقع الوقت المصحح خارج النافذة من 72 ساعة مضت إلى 5 دقائق قادمة يُرفض الحدث بالرمز `out_of_window`.
5. يُرد 202 خلال أقل من 150 ms (p95)، وتُدفع الأحداث المقبولة إلى طابور `analytics-ingest`.
6. تكتب المهمة `PersistEventBatch` بإدخال متعدد الصفوف (1,000 صف لكل أمر) مع `ON CONFLICT (occurred_at, tenant_id, event_id) DO NOTHING`. فإعادة إرسال الدفعة نفسها لا تكرّر شيئًا.
7. **الإثراء**: الدولة من ترويسة الـ CDN إن وُجدت (بحسب D-06)، ثم يُهمل عنوان IP ولا يُكتب في أي جدول. وتُضاف `received_at`.
8. يُحدَّث عدّاد `anl_ingest_stats` لكل مستأجر ويوم: المقبول، والمكرر، والمرفوض حسب الرمز.

### 3.4 نسبة الطلب إلى التطبيق

**الهدف**: أن يأتي «إيراد التطبيق» من طلبات زد نفسها، لا من أحداث العميل. فأحداث العميل قد تضيع، وكشف نجاح الدفع غير مضمون (SPK-01).

**ما يلحقه التطبيق برابط الدفع**: يطلب M04 من `checkout_attribution.dart` معاملات يلحقها بالرابط الأول فقط (`/checkout` أو `/checkout/guest`). هذا ليس حقنًا في الصفحة، فلا يخالف ADR-0003. وكل القيم معرّفات عشوائية، بلا أي بيانات شخصية.

| المعامل | القيمة | الغرض |
|---|---|---|
| `utm_source` | `intishar_app` | مسار النسبة الاحتياطي إن لم يحمل الطلب `source` المتوقع (SPK-03) |
| `utm_medium` | `ios` أو `android` | المنصة |
| `utm_campaign` | `push_{campaign_id}` أو `link_{campaign}` أو `organic` | آخر لمسة خلال 24 ساعة |
| `utm_content` | `blk_{page_id}.{block_id}` أو `none` | آخر كتلة نُقرت في الجلسة |
| `utm_id` | `checkout_attempt_id` (UUIDv4) | ربط الطلب بالجلسة ربطًا حتميًا |

مثال: `https://store.example.sa/checkout?utm_source=intishar_app&utm_medium=ios&utm_campaign=push_8812&utm_content=blk_home.b1&utm_id=6f0c2a8e-1d3b-4f6a-9c1e-2b7d5a0e4c11`

**خطوات التسجيل**:
1. يصل حدث `ZidOrderCreated` من M10 (webhook `order.create`). يعيد M10 جلب الطلب من `GET /orders/{id}` قبل الوثوق بالحمولة (ADR-0005، البند 4).
2. يقرأ `RecordZidOrder` الحقول: معرّف الطلب، والحالة، والإجمالي، والعملة، و`source`، و`source_code`، وحقول `marketing_source` (`utm_*` و`platform` و`device_type`)، ومعرّف العميل، ووقت الإنشاء ([Zid: View Order](https://docs.zid.sa/view-order-12479054e0)). وأسماء حقول المبالغ تُثبَّت في عقد M10.
3. يطبّق `OrderAttributionService` القاعدة بالترتيب، ويقف عند أول تطابق:
   1. `source` ضمن `analytics.app_source_values` للمستأجر (القيمة المؤقتة `["mobile_app"]` حتى يحسمها SPK-03، والمستند [Zid: List Orders](https://docs.zid.sa/list-of-orders) يذكر `Store App`) ← `attribution_method = source`.
   2. `marketing_source.utm_source = intishar_app` ← `utm`.
   3. وجود حدث `purchase` من تطبيقنا يحمل `transaction_id` نفسه، أو حدث `Orders\CheckoutConfirmed` لهذا الطلب ← `client_signal`.
   4. غير ذلك: الطلب ليس من التطبيق، ويُخزَّن بـ `attributed = false` لحساب نسبة التطبيق من الإجمالي لاحقًا.
4. **حماية من قناة تطبيق أخرى**: إن كان لدى التاجر تطبيق آخر يحمل `source = mobile_app` (مثل تطبيق منافس ما زال على أجهزة المتسوقين)، يُضبط العلم `other_app_channel = true`. عندها لا تكفي القاعدة 1 وحدها، ويلزم معها تطابق القاعدة 2 أو 3. ويُضبط العلم آليًا إن تجاوزت نسبة الطلبات المنسوبة بالقاعدة 1 وحدها دون أي تأكيد 20% في 7 أيام، أو يدويًا من لوحة الإدارة.
5. يُربط الطلب بالجلسة: من `utm_id` إلى `checkout_attempt_id` في حدث `begin_checkout` ثم إلى `session_id`. وإن غاب يُستخدم `transaction_id` في حدث `purchase`.
6. يُحدَّث `anl_orders`، ويُعلَّم يوم الطلب «متسخًا» لإعادة التجميع.
7. `ZidOrderStatusUpdated` يحدّث الحالة. والإلغاء يعلّم يوم الإنشاء متسخًا، فيُعاد حسابه ولو كان قديمًا.
8. **المطابقة الليلية** (`analytics:orders-reconcile`، 03:00 بتوقيت المتجر): لكل مستأجر نشط تُقرأ طلبات اليوم السابق من `List Orders`، ويُضاف ما فات من webhooks. زد تعيد المحاولة 3 مرات فقط (ADR-0005). وتستهلك المطابقة 20% على الأكثر من حد 60 طلبًا في الدقيقة لكل متجر، عبر محدِّد M10.

### 3.5 ربط آخر لمسة (إشعار، أو رابط، أو كتلة)

1. عند `push_open` يحفظ `attribution_context.dart` اللمسة `{kind: push, campaign_id, at}` لمدة 24 ساعة. وعند `link_open` بحملة يحفظ `{kind: link, campaign, at}`. واللمسة الأحدث تحل محل الأقدم.
2. عند `block_click` يحفظ `{page_id, page_version, block_id}` بوصفها «آخر كتلة» في الجلسة الحالية فقط.
3. تُرفق اللمستان بخصائص `add_to_cart` و`begin_checkout` و`purchase` (`attr_campaign` و`attr_block`)، وبمعاملات رابط الدفع (القسم 3.4).
4. في الخادم: الطلب المنسوب يُنسب إلى حملة إشعار إن حمل `utm_campaign = push_{id}`، أو إن سبق إنشاءه `push_open` من الجهاز نفسه أو العميل نفسه خلال 24 ساعة (آخر لمسة تفوز). وإلى كتلة إن حمل `utm_content`، أو إن سبقت `begin_checkout` في الجلسة المرتبطة نقرةُ كتلة (آخر نقرة تفوز).

### 3.6 التجميع

| المهمة | التوقيت | النطاق | الناتج |
|---|---|---|---|
| `analytics:rollup-intraday` | كل 15 دقيقة | اليوم الحالي بتوقيت كل متجر، للمستأجرين الذين وصلتهم أحداث | الجداول اليومية لليوم الجاري |
| `analytics:rollup-daily` | 03:30 بتوقيت المتجر | الأيام D-1 وD-2 وD-3، وكل يوم متسخ | إعادة حساب كاملة متساوية الأثر (upsert) |
| `analytics:sentry-sync` | 04:00 بتوقيت الرياض | D-1 | `anl_crash_stats_daily` |
| `analytics:partitions` | يوميًا 00:10 UTC | إنشاء أقسام 7 أيام قادمة، وحذف ما تجاوز مدة الاحتفاظ | — |
| `analytics:purge` | يوميًا | الجداول المجمّعة والأجهزة اليومية بحسب الاحتفاظ | — |

كل مهمة تجميع تقرأ من `anl_events` و`anl_orders` وتكتب في الجداول اليومية فقط. **واجهات اللوحة لا تقرأ الجدول الخام أبدًا**، وهذا ما يسمح باستبدال المخزن الخام لاحقًا دون أثر على M15.

### 3.7 مزامنة Sentry

1. اسم الإصدار في Sentry هو الافتراضي في `sentry_flutter`: `{bundle_id}@{version}+{build}`. ومعرّف الحزمة مختلف لكل تاجر (ADR-0002)، فيكفي لتمييزه. ويثبّت M13 هذا الاسم في خط البناء.
2. يستدعي `SentrySessionsClient`:
   `GET /api/0/organizations/{org}/sessions/?field=sum(session)&field=crash_free_rate(session)&field=crash_free_rate(user)&field=count_unique(user)&groupBy=release&environment=production&interval=1d&start=...&end=...&per_page=100`
   مع التنقل بين الصفحات.
3. يُربط كل إصدار بمستأجره من `bundle_id` (iOS) أو `applicationId` (أندرويد)، ويُخزَّن صف لكل مستأجر ويوم ومنصة.
4. إن فشل الاستدعاء يُعاد بعد ساعة حتى 6 مرات، ثم تُعرض البطاقة بـ «غير متاح» مع آخر قيمة معروفة وتاريخها.

### 3.8 لاحقًا (Should): بكسلات التاجر

**ما يحدث اليوم دون أي عمل منا**: صفحة الدفع في WebView هي صفحة زد، وهي تحمّل بكسلات الويب التي ضبطها التاجر في زد. فـ `GET /api/v1/scripts` يعيد معرّفات GA4 وGTM وMeta وTikTok وSnap وGoogle Ads ضمن `app_scripts_bundle.params` ([Zid: Scripts](https://docs.zid.sa/scripts-1758413m0)). لذا يُسجَّل الشراء في بكسل الويب للتاجر حدثًا ويبيًا. أما التصفح والإضافة إلى السلة فيحدثان أصليًا في التطبيق، فلا تراهما البكسلات. والنتيجة قمع ناقص عند التاجر، وشراء لا يُنسب إلى حملات تطبيقات.

| الطبقة | الآلية | الأولوية | ملاحظات |
|---|---|---|---|
| A | بكسلات الويب داخل صفحة الدفع، يحمّلها زد | قائمة الآن | لا حقن منا (ADR-0003). خطر ATT مفتوح (القسم 8، O-ANL-2) |
| B | تمرير من خادمنا إلى Conversions APIs: [Meta CAPI لأحداث التطبيق](https://developers.facebook.com/docs/marketing-api/conversions-api/app-events)، وTikTok Events API، و[Snap CAPI v3](https://developers.snap.com/api/marketing-api/Conversions-API/UsingTheAPI) | Should | الأحداث: `view_item` و`add_to_cart` و`begin_checkout` و`purchase`. و`event_id` هو معرّفنا نفسه، و`transaction_id` للشراء، لإزالة التكرار مع بكسل الويب |
| C | SDKs أصلية لكل شبكة في التطبيق | Won't في هذا الإصدار | تضخّم الملف التنفيذي (هدف 40 MB)، وتحتاج إعدادًا لكل تاجر وقت البناء، وتفرض ATT |
| D | App Script من زد على `purchase_event` يرسل `transaction_id` إلى خادمنا بـ `navigator.sendBeacon` | Could | لا يُستخدم `addJavaScriptChannel`، لأنه يضيف سكربت مستخدم في WKWebView، وهذا ممنوع في صفحة الدفع (ADR-0003). والسكربت يعمل لكل زوار الويب، فيُقيَّد بعلامة يلحقها التطبيق بالـ User-Agent. والتسجيل في لوحة شريك زد (P-1) |

**قيود الطبقة B**:
- Meta تشترط لأحداث التطبيق ربطها بـ dataset، و`action_source = app`، وحقلَي `advertiser_tracking_enabled` و`extinfo` ([Meta: Conversions API for App Events](https://developers.facebook.com/docs/marketing-api/conversions-api/app-events)).
- Snap يرسل أحداث التطبيق إلى مسار بمعرّف تطبيق Snap مع `action_source = MOBILE_APP` ([Snap Conversions API](https://developers.snap.com/api/marketing-api/Conversions-API/UsingTheAPI)).
- TikTok يحتاج تسجيل التطبيق للحصول على App ID، ويعتمد `event_id` لإزالة التكرار ([Twilio Segment: TikTok App Events](https://www.twilio.com/docs/segment/connections/destinations/catalog/tiktok-app-events.md)، وهو مصدر ثانوي يُتحقق منه عند التنفيذ).
- على iOS: تمرير أحداث التطبيق إلى شبكة إعلان لقياس الإعلانات «تتبّع» بتعريف Apple، ولا يجوز استبداله ببريد مشفّر دون إذن ([Apple: User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)). لذا لا يُمرَّر حدث iOS إلا بعد `ATTrackingManager` بحالة `authorized`، وتُرسل `advertiser_tracking_enabled = 1` مع كل حدث.
- على أندرويد: لا يُمرَّر إلا بعد موافقة صريحة على «الإعلانات المخصصة» في إعدادات التطبيق.
- المعرّفات ورموز الوصول يولّدها التاجر في حساباته الإعلانية، وتُحفظ في خزنة M12. لا تُطلب كلمة مرور أي حساب (روح ADR-0008، البند 5).

## 4. نموذج البيانات

### 4.1 على الجهاز

| الجدول أو المفتاح | الحقول | ملاحظات |
|---|---|---|
| `anl_queue` | `id INTEGER PK`، و`event_id TEXT`، و`priority INTEGER` (0 حرج، و1 عادي، و2 منخفض)، و`payload TEXT` (JSON)، و`created_at INTEGER`، و`attempts INTEGER` | فهرس على `(priority, id)` |
| `anl_state` (مفاتيح) | `device_id`، و`seq`، و`session_id`، و`session_started_at`، و`last_active_at`، و`last_touch` (JSON)، و`last_block` (JSON)، و`analytics_enabled_by_user` | — |

### 4.2 على الخادم (PostgreSQL)

**`anl_events`**: مقسّم `PARTITION BY RANGE (occurred_at)` بقسم لكل يوم UTC.

| الحقل | النوع | ملاحظات |
|---|---|---|
| `occurred_at` | `timestamptz NOT NULL` | بعد تصحيح الساعة. مفتاح التقسيم |
| `tenant_id` | `bigint NOT NULL` | — |
| `event_id` | `uuid NOT NULL` | من العميل |
| `event_name` | `text NOT NULL` | من السجل |
| `received_at` | `timestamptz NOT NULL` | — |
| `device_id` | `uuid NOT NULL` | — |
| `session_id` | `uuid NOT NULL` | — |
| `seq` | `bigint` | لقياس الفقد |
| `customer_id` | `text NULL` | معرّف عميل زد بعد الدخول |
| `platform` | `smallint NOT NULL` | 1 iOS، و2 أندرويد |
| `app_version` | `text NOT NULL` | — |
| `locale` | `char(2) NOT NULL` | `ar` أو `en` |
| `screen` | `text NULL` | — |
| `page_id` و`page_version` و`block_id` و`experiment_variant` | `text` و`integer` و`text` و`text`، كلها NULL | — |
| `country` | `char(2) NULL` | من الـ CDN |
| `sample_rate` | `real NOT NULL DEFAULT 1` | — |
| `props` | `jsonb NOT NULL` | خصائص الحدث الخاصة |

- المفتاح الأساسي `(occurred_at, tenant_id, event_id)`. يجب أن يتضمن مفتاح التقسيم، وهو أيضًا مفتاح إزالة التكرار.
- فهرس `(tenant_id, event_name, occurred_at)` على كل قسم.
- **لماذا قسم يومي**: الحذف بـ `DROP TABLE` للقسم أسرع كثيرًا من `DELETE` ولا يخلّف عبء `VACUUM`، والمخطِّط يتعامل جيدًا مع بضعة آلاف من الأقسام حين يُقصي معظمها ([PostgreSQL 18: Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)). و90 يومًا تعني نحو 97 قسمًا.
- **إدارة الأقسام**: أمر Laravel خاص (`analytics:partitions`) هو المسار الأساسي، حتى لا نرتبط بإضافة قد لا يدعمها مزوّد الاستضافة (D-06). ويُستخدم `pg_partman` 5.x بدلًا منه إن توفر ([pg_partman releases](https://www.postgresql.org/message-id/173628104842.818647.202629578334557073%40wrigleys.postgresql.org)).

**`anl_orders`**:

| الحقل | النوع | ملاحظات |
|---|---|---|
| `tenant_id`، و`zid_order_id` | `bigint`، و`text` | فريد معًا |
| `created_at` | `timestamptz` | من زد |
| `local_date` | `date` | بمنطقة المتجر الزمنية |
| `status` | `text` | `new` و`preparing` و`ready` و`inDelivery` و`delivered` و`cancelled` |
| `total`، و`tax`، و`shipping` | `numeric(12,2)` | كما تعيدها زد |
| `currency` | `char(3)` | — |
| `source`، و`source_code` | `text` | كما هما |
| `utm_source`، و`utm_medium`، و`utm_campaign`، و`utm_content`، و`utm_id` | `text` | من `marketing_source` |
| `attributed` | `boolean` | — |
| `attribution_method` | `text` | `source` أو `utm` أو `client_signal` أو NULL |
| `platform` | `smallint NULL` | من `utm_medium` أو من الحدث |
| `checkout_attempt_id`، و`session_id`، و`device_id` | `uuid NULL` | بعد الربط |
| `zid_customer_id` | `text NULL` | — |
| `push_campaign_id` | `text NULL` | بعد نسبة الإشعار |
| `attr_page_id`، و`attr_block_id` | `text NULL` | بعد نسبة الكتلة |
| `updated_at` | `timestamptz` | — |

فهارس: `(tenant_id, local_date) WHERE attributed`، و`(tenant_id, utm_id)`.

**الجداول المجمّعة**:

| الجدول | المفتاح | الحقول |
|---|---|---|
| `anl_daily_tenant_metrics` | `(tenant_id, day, platform)`، و`platform` قيمته `all` أو `ios` أو `android` | `sessions`، و`active_devices`، و`new_devices`، و`app_orders`، و`app_revenue`، و`linked_orders`، و`converting_sessions`، و`push_sent`، و`push_opens_unique`، و`push_attr_orders`، و`push_attr_revenue`، و`computed_at` |
| `anl_daily_active_devices` | `(tenant_id, day, device_id)` | `platform`، و`is_new`، و`customer_id` |
| `anl_daily_block_metrics` | `(tenant_id, day, page_id, block_id)` | `block_type`، و`last_page_version`، و`impression_sessions`، و`clicks`، و`click_sessions`، و`attr_orders`، و`attr_revenue` |
| `anl_daily_push_metrics` | `(tenant_id, day, campaign_id)` | `sent`، و`opens_unique`، و`attr_orders`، و`attr_revenue` |
| `anl_crash_stats_daily` | `(tenant_id, day, platform)` | `sessions`، و`crash_free_sessions_rate`، و`users`، و`crash_free_users_rate`، و`releases` (jsonb) |
| `anl_ingest_stats` | `(tenant_id, day)` | `accepted`، و`duplicates`، و`rejected` (jsonb حسب الرمز)، و`seq_gaps` |
| `anl_dirty_days` | `(tenant_id, day)` | `reason`، و`marked_at` |
| `anl_tenant_settings` | `tenant_id` | `app_source_values` (jsonb)، و`other_app_channel`، و`raw_retention_days` |

### 4.3 الاحتفاظ والحجم

| البيانات | المدة | السبب |
|---|---|---|
| `anl_events` الخام | 90 يومًا (قابلة للضبط من 30 إلى 180 لكل مستأجر من لوحة الإدارة) | إعادة التجميع والتحقيق في الأخطاء |
| `anl_daily_active_devices` | 400 يوم | MAU، ومجموعات الاحتفاظ حتى 12 شهرًا لاحقًا |
| الجداول المجمّعة | 25 شهرًا | مقارنة سنة بسنة |
| `anl_orders` | 25 شهرًا | المؤشرات التاريخية |
| `anl_queue` على الجهاز | 72 ساعة | نافذة القبول في الخادم |

**تقدير الحجم**: 50 تاجرًا × 300 جهاز نشط يوميًا × 80 حدثًا ≈ 1.2 مليون حدث يوميًا. وبنحو 600 بايت للصف مع الفهارس ≈ 0.7 GB يوميًا، ونحو 65 GB لـ 90 يومًا. وهذا مريح لـ PostgreSQL.

### 4.4 لاحقًا (Could): ClickHouse

**عتبات الانتقال** (أيها تحقق أولًا، لسبعة أيام متتالية): أكثر من 20 مليون حدث يوميًا، أو p95 لمدة `rollup-daily` أكثر من 10 دقائق، أو حجم `anl_events` أكثر من 500 GB، أو طلب مستكشف مسارات حر.

**التصميم**:
- جدول `ReplacingMergeTree` بمفتاح ترتيب `(tenant_id, event_name, occurred_at, event_id)`، وتقسيم شهري، وTTL للحذف. وإزالة التكرار تحدث أثناء الدمج فقط، فالاستعلامات الدقيقة تحتاج `FINAL` ([ClickHouse: ReplacingMergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replacingmergetree)).
- خطوات الانتقال: `ClickHouseEventSink` خلف `EventSink` بكتابة مزدوجة، ثم نسخ 90 يومًا، ثم نقل مهام التجميع إلى القراءة منه. والجداول المجمّعة تبقى في PostgreSQL، فلا تتغير واجهات اللوحة.

## 5. الواجهات والعقود

مسارات الـ API أدناه تتبع البادئات المقترحة `/app/v1` (التطبيق) و`/dashboard/v1` (التاجر) و`/admin/v1` (المنصة). والاصطلاح النهائي للأخطاء والترقيم من M12.

### 5.1 اصطلاح التسمية

1. إن وُجد حدث GA4 موصى به للفعل، يُستخدم اسمه ومعاملاته كما هي: `items`، و`currency`، و`value`، و`transaction_id`، و`item_list_id`، و`item_list_name`، و`search_term`، و`promotion_id`، و`creative_slot`، و`method` ([GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)).
2. وإلا فاسم مخصص بصيغة `snake_case`، من 40 حرفًا على الأكثر، يبدأ بحرف، ومن `[a-z0-9_]` فقط. ولا يبدأ بـ `firebase_` ولا `google_` ولا `ga_` ([Firebase event names](https://firebase.google.com/docs/reference/cpp/group/event-names)).
3. لا يُستخدم اسم يجمعه GA4 آليًا، مثل `first_open` و`session_start` و`notification_open` و`notification_receive` و`user_engagement` ([GA4 automatically collected events](https://support.google.com/analytics/answer/9234069)). لذلك نستخدم `push_open` و`push_received`، والجلسة الأولى خاصية في `app_open`.
4. أسماء المعاملات بالصيغة نفسها، وقيمها النصية تُقص عند 100 حرف، ولا تتجاوز خصائص الحدث الخاصة 20 خاصية. هكذا يبقى الحدث مع السياق المختار ضمن حد GA4 البالغ 25 معاملًا ([GA4 collection limits](https://support.google.com/analytics/answer/9267744)).
5. التطور إضافي فقط: لا يُعاد استخدام اسم بمعنى آخر، ولا تُحذف خاصية بل تُعلَّم `deprecated`، على غرار ADR-0004 (البند 6).
6. الأسعار والقيم في التطبيق **شاملة الضريبة** كما تُعرض للمتسوق السعودي. وهذا يخالف تعريف GA4 لـ `value`، لذا تُرسل في السياق `tax_included = true`. وإيراد اللوحة يأتي من طلبات زد لا من هذه القيم.

### 5.2 الغلاف والخصائص المشتركة

كل حدث يحمل هذه الحقول. والحقل الذي لا ينطبق يُرسل بقيمة `null`، ولا يُحذف.

| الحقل | النوع | المصدر | ملاحظات |
|---|---|---|---|
| `tenant_id` | string | `tenant.json` | على مستوى الدفعة، ويُتحقق منه مقابل المفتاح |
| `event_id` | UUIDv7 | العميل | مفتاح إزالة التكرار |
| `name` | string | السجل | — |
| `occurred_at` | ISO-8601 UTC بالمللي ثانية | العميل | — |
| `session_id` | UUIDv4 | `session_manager` | — |
| `device_id` | UUIDv4 | `anl_state` | على مستوى الدفعة |
| `seq` | integer | العميل | تسلسل لكل جهاز |
| `app_version`، و`build` | string، وinteger | `package_info_plus` | — |
| `platform` | `ios` أو `android` | — | — |
| `os_version` | string | `device_info_plus` | — |
| `locale` | `ar` أو `en` | لغة الواجهة الفعلية | — |
| `customer_id` | string أو null | جلسة زد بعد الدخول (M05) | — |
| `screen` | string | الموجّه (M01) | `home` و`category_tree` و`product_list` و`search` و`product` و`cart` و`checkout` و`order_confirmation` و`orders` و`order_details` و`account` و`wishlist` و`page` و`login` و`addresses` و`notification_settings` |
| `page_id`، و`page_version` | string، وinteger | غلاف الصفحة من M11 (ADR-0006) | للأحداث داخل صفحات الكتل |
| `block_id` | string | الكتلة (M03) | ثابت عبر نسخ الصفحة (عقد مع M11) |
| `experiment_variant` | string أو null | M11 (F-M13، Could) | `null` في الإصدار الأول |
| `sample_rate` | number | `sampling.dart` | — |
| `tax_included` | boolean | ثابت `true` | — |

**الكائن `items[]`** (بأسماء GA4): `item_id` (معرّف منتج زد)، و`item_name` بلغة العرض، و`item_variant` (معرّف الخيار)، و`item_brand`، و`item_category`، و`price` (سعر الوحدة شاملًا الضريبة بعد الخصم)، و`discount`، و`quantity`، و`index`، و`item_list_id`. والحد 10 عناصر في `view_item_list`، و50 في `begin_checkout` و`view_cart`.

### 5.3 سجل أحداث الإصدار الأول

الأولوية تتبع أولوية الميزة التي تطلقه. والوحدة المذكورة هي التي تستدعي `track()`.

| الحدث | GA4 | الوحدة | متى يُطلق | الخصائص الخاصة | الأولوية |
|---|---|---|---|---|---|
| `app_open` | موصى به | M08 (`session_manager`) | بداية كل جلسة | `launch_type` (`cold` أو `warm`)، و`entry` (`direct` أو `push` أو `link` أو `qr`)، و`is_first_open` | Must |
| `screen_view` | موصى به | M01 (مراقب الموجّه) | كل شاشة تظهر | `screen_name`، و`previous_screen`، و`entity_id` | Must |
| `login` | موصى به | M05 | نجاح الدخول | `method` (`webview` أو `otp`) | Must |
| `search` | موصى به | M04 | إرسال بحث | `search_term` (بعد التنقية)، و`results_count`، و`input` (`typed` أو `history` أو `suggestion`) | Must |
| `view_item_list` | موصى به | M04 وM03 | ظهور قائمة أو شبكة أو كاروسيل | `item_list_id` (مثل `cat_412823` أو `search` أو `blk_home.b2`)، و`item_list_name`، و`items` (أول 10)، و`sort`، و`filters_count` | Must |
| `select_item` | موصى به | M04 وM03 | نقر بطاقة منتج | `item_list_id`، و`item_list_name`، و`items` (عنصر واحد) | Must |
| `view_item` | موصى به | M04 | فتح صفحة المنتج | `currency`، و`value`، و`items` (عنصر واحد)، و`in_stock` | Must |
| `add_to_cart` | موصى به | M04 وM03 | نجاح الإضافة في زد | `currency`، و`value`، و`items`، و`origin` (`pdp` أو `quick_add` أو `block` أو `wishlist`)، و`attr_campaign`، و`attr_block` | Must |
| `remove_from_cart` | موصى به | M04 | نجاح الحذف أو إنقاص الكمية | `currency`، و`value`، و`items` | Must |
| `view_cart` | موصى به | M04 | فتح السلة | `currency`، و`value`، و`items`، و`coupon` | Must |
| `add_to_wishlist` | موصى به | M04 | إضافة إلى المفضلة | `currency`، و`value`، و`items`، و`guest` | Must |
| `remove_from_wishlist` | مخصص | M04 | حذف من المفضلة | `items` | Must |
| `stock_alert_subscribe` | مخصص | M04 | «نبهني» لمنتج نافد | `items`، و`channel` | Must |
| `begin_checkout` | موصى به | M04 | قبل فتح WebView الدفع | `currency`، و`value`، و`coupon`، و`items`، و`checkout_attempt_id`، و`checkout_type` (`guest` أو `logged_in`)، و`attr_campaign`، و`attr_block` | Must |
| `checkout_exit` | مخصص | M04 | إغلاق WebView الدفع دون نجاح | `checkout_attempt_id`، و`last_url_kind` (`checkout` أو `payment` أو `gateway` أو `external`)، و`duration_ms` | Must |
| `purchase` | موصى به | M04 | بعد كشف النجاح (ADR-0003) | `transaction_id` (إن عُرف)، و`checkout_attempt_id`، و`currency`، و`value`، و`coupon`، و`detection_layer` (`navigation` أو `server` أو `script`)، و`attr_campaign`، و`attr_block` | Must |
| `share` | موصى به | M04 | مشاركة منتج | `method` (`whatsapp` أو `system`)، و`content_type`، و`item_id` | Must |
| `block_impression` | مخصص | M03 | أول ظهور للكتلة في الجلسة بنسبة 50% أو أكثر لمدة ثانية | `block_type`، و`block_position` | Must |
| `block_click` | مخصص | M03 | نقرة تنفّذ فعلًا | `block_type`، و`block_position`، و`item_index`، و`action_type` (من قائمة ADR-0004)، و`target_id` | Must |
| `unknown_block` | مخصص | M03 | كتلة لا يعرفها السجل (ADR-0004) | `block_type`، و`block_v` | Must |
| `view_promotion` | موصى به | M09 | ظهور الشريط الإعلاني أو نافذة | `promotion_id`، و`promotion_name`، و`creative_slot` (`announcement_bar` أو `popup` أو `welcome`)، و`creative_name` | Must للشريط، وShould للنوافذ |
| `select_promotion` | موصى به | M09 | نقر الشريط أو زر النافذة | مثل السابق، مع `action_type` | Must للشريط، وShould للنوافذ |
| `popup_dismiss` | مخصص | M09 | إغلاق نافذة | `promotion_id`، و`reason` (`close` أو `backdrop` أو `back`) | Should |
| `coupon_copy` | مخصص | M09 | نسخ كود من نافذة | `promotion_id`، و`coupon` | Should |
| `push_received` | مخصص | M06 | استلام إشعار والتطبيق في المقدمة، أو عبر Notification Service Extension إن وُجدت | `notification_id`، و`campaign_id`، و`type`، و`foreground` | Must |
| `push_open` | مخصص | M06 | فتح إشعار | `notification_id`، و`campaign_id`، و`type`، و`deeplink_route` | Must |
| `notification_pref_change` | مخصص | M06 | تغيير فئة في مركز التفضيلات | `category`، و`enabled` | Must |
| `link_open` | مخصص | M07 | فتح التطبيق من رابط أو QR | `link_type` (`universal` أو `app_link` أو `deferred` أو `qr`)، و`path` (بلا query عدا `utm_*`)، و`campaign`، و`resolved_route`، و`success` | Must |
| `permission_prompt` | مخصص | M09 | كل مرحلة في طلب إذن | `permission` (`notifications` أو `camera` أو `location` أو `tracking`)، و`stage` (`primer_shown` أو `primer_accepted` أو `primer_declined` أو `system_shown` أو `granted` أو `denied` أو `permanently_denied`)، و`context` | Must |
| `update_prompt` | مخصص | M09 | ظهور طلب التحديث | `type` (`hard` أو `soft`)، و`min_version`، و`action` | Must |
| `store_closed_shown` | مخصص | M09 | ظهور حالة «المتجر مغلق» | `browsable` | Must |
| `whatsapp_click` | مخصص | M09 وM05 | فتح WhatsApp | `surface` (`floating` أو `order_details` أو `product`)، و`screen` | Must |
| `review_prompt` | مخصص | M09 | استدعاء `requestReview()` | `trigger` | Should |
| `consent_change` | مخصص | M05 (الإعدادات) | تغيير مفتاح المشاركة | `analytics`، و`ads` | Must |

**تنقية `search_term`**: تُستبدل كل سلسلة من 7 أرقام أو أكثر بـ `[num]`، وكل بريد إلكتروني بـ `[email]`، ثم تُقص عند 100 حرف.

### 5.4 تعريفات مؤشرات لوحة التاجر

**الاصطلاح**: `T` المستأجر. والفترة `[d1, d2]` أيام بمنطقة المتجر الزمنية (من `settings`، والافتراضي `Asia/Riyadh`). و`O` مجموعة طلبات `anl_orders` حيث `tenant_id = T` و`attributed = true` و`status ≠ cancelled` و`local_date ∈ [d1, d2]`. ومرشّح المنصة اختياري.

| المؤشر | التعريف الدقيق | ملاحظات العرض |
|---|---|---|
| طلبات التطبيق | `app_orders = ∣O∣` | — |
| إيراد التطبيق | `app_revenue = Σ o.total` لكل `o ∈ O` بعملة المتجر | إجمالي يشمل الضريبة والشحن كما دفع المتسوق، ولا يخصم الاسترجاع في الإصدار الأول. وتُستبعد الطلبات بعملة أخرى وتُعرض عدًّا منفصلًا (O-ANL-4) |
| متوسط قيمة الطلب | `aov = app_revenue / app_orders`، ولا قيمة إن كان المقام صفرًا | — |
| الجلسات | `sessions = ∣{session_id : app_open في الفترة}∣` | — |
| معدل التحويل | `conversion_rate = converting_sessions / sessions`، حيث `converting_sessions = ∣{o.session_id : o ∈ O، o.session_id ≠ null}∣` | إن كانت تغطية الربط `linked_orders / app_orders` أقل من 80% يُعرض التقدير `app_orders / sessions` بشارة «تقديري» |
| المستخدمون النشطون يوميًا | `DAU(d) = ∣{device_id : app_open في اليوم d}∣`. وتعرض البطاقة متوسط DAU في الفترة | — |
| المستخدمون النشطون شهريًا | `MAU(d2) = ∣{device_id : app_open في [d2−29, d2]}∣` | ثابت 30 يومًا متحركة، لا شهر تقويمي |
| الالتصاق | `avg(DAU) / MAU(d2)` | — |
| أجهزة جديدة | عدد `app_open` بـ `is_first_open = true` | إعادة التثبيت تُحسب جهازًا جديدًا |
| معدل فتح الإشعارات | `push_open_rate = opens_unique / sent`. حيث `sent` أجهزة قبل FCM إرسالها بنجاح (من M06)، و`opens_unique` أجهزة أطلقت `push_open` للحملة خلال 7 أيام من الإرسال | لكل حملة، وللفترة بمتوسط موزون |
| إيراد الإشعارات المنسوب | `Σ o.total` لكل `o ∈ O` حيث `o.push_campaign_id ≠ null`. والنسبة: `utm_campaign = push_{id}`، أو `push_open` من الجهاز أو العميل نفسه قبل `o.created_at` بما لا يزيد عن **24 ساعة**، وآخر لمسة تفوز | يُكتب تحت الرقم «خلال 24 ساعة من فتح الإشعار». النافذة ثابت `ANL_PUSH_WINDOW_HOURS = 24` في الإصدار الأول |
| ظهور الكتلة | `impression_sessions = ∣{session_id : block_impression للكتلة}∣` | — |
| نقرات الكتلة | `clicks = count(block_click)`. و`CTR = click_sessions / impression_sessions` | — |
| إيراد الكتلة | `Σ o.total` لكل `o ∈ O` حيث `o.attr_block_id` هي الكتلة. والنسبة: `utm_content`، أو آخر `block_click` قبل `begin_checkout` في الجلسة المرتبطة | نسبة آخر نقرة داخل الجلسة فقط |
| أعلى الكتل | ترتيب `(page_id, block_id)` تنازليًا بـ `clicks` أو بإيراد الكتلة، مع الحد 20 | تُعرض الكتلة المحذوفة باسم نوعها ووسم «محذوفة» |
| الجلسات الخالية من الانهيار | `CFS = Σ_r (rate_r × sessions_r) / Σ_r sessions_r`، حيث `r` إصدارات المستأجر و`rate_r` قيمة `crash_free_rate(session)` من Sentry | الهدف ≥ 99.5% (PRD §3). وجلسة Sentry تنتهي بعد 30 ثانية في الخلفية ([Sentry: Release Health](https://docs.sentry.io/product/releases/health/))، فهي غير جلسة التحليلات، ولا يُجمع الرقمان |
| المستخدمون الخالون من الانهيار | متوسط `crash_free_rate(user)` موزون بـ `count_unique(user)` | تقريبي، لأن المستخدم قد يظهر في أكثر من إصدار. مؤشر ثانوي |
| تغطية النسبة | حصة كل `attribution_method` من `O`، و`linked_orders / app_orders` | في لوحة الإدارة، وتلميح في لوحة التاجر |

**لاحقًا: مجموعات الاحتفاظ (Should)**: المجموعة هي الأجهزة ذات `is_first_open` في أسبوع ISO. و`retention(k) = ∣أجهزة المجموعة النشطة في الأسبوع k∣ / ∣المجموعة∣` للأسابيع من 1 إلى 12، من `anl_daily_active_devices`.

### 5.5 Endpoints

**استقبال الأحداث**

`POST /app/v1/analytics/events`

الترويسات: `X-Tenant-Key`، و`X-App-Version`، و`X-Platform`، و`Content-Encoding: gzip`.

```json
{
  "tenant_id": "t_1042",
  "device_id": "4b1f0c6e-2f7a-4c55-9d1e-8a3b6c2d1e90",
  "sent_at": "2026-11-10T18:42:05.120Z",
  "events": [
    {
      "event_id": "019a6f3e-7c1a-7b9e-9d2a-3f5e2c1b0a99",
      "name": "block_click",
      "occurred_at": "2026-11-10T18:41:58.004Z",
      "session_id": "a3c1d2e4-5f60-4a7b-8c9d-0e1f2a3b4c5d",
      "seq": 1842,
      "ctx": {
        "app_version": "1.4.0", "build": 52, "platform": "ios", "os_version": "18.1",
        "locale": "ar", "customer_id": null, "screen": "home",
        "page_id": "home", "page_version": 1842, "block_id": "b1",
        "experiment_variant": null, "sample_rate": 1.0, "tax_included": true
      },
      "props": {
        "block_type": "hero_slider", "block_position": 0, "item_index": 2,
        "action_type": "open_category", "target_id": "412823"
      }
    }
  ]
}
```

الاستجابة `202 Accepted`:

```json
{
  "accepted": 49,
  "duplicates": 0,
  "rejected": [{ "index": 12, "code": "invalid_props", "field": "items" }],
  "server_time": "2026-11-10T18:42:05.410Z"
}
```

| الرمز | المعنى | سلوك العميل |
|---|---|---|
| 400 `invalid_envelope` | الغلاف نفسه مخالف | تُحذف الدفعة، ويُرسل خطأ إلى Sentry |
| 401 `invalid_tenant_key` | المفتاح غير صحيح أو لا يطابق `tenant_id` | يتوقف الإرسال حتى التشغيل التالي |
| 403 `analytics_disabled` | المفتاح العام للتحليلات مطفأ للمستأجر | يُفرَّغ الطابور |
| 413 `payload_too_large` | تجاوز 256 KB بعد فك الضغط أو 50 حدثًا | تُقسم الدفعة |
| 429 | تجاوز المعدّل | `Retry-After` |

رموز رفض الحدث المفرد: `unknown_event`، و`invalid_props`، و`out_of_window`، و`sampled_out_mismatch`.

**نظرة عامة للتاجر**

`GET /dashboard/v1/analytics/overview?from=2026-11-01&to=2026-11-07&platform=all&compare=previous_period`

```json
{
  "range": { "from": "2026-11-01", "to": "2026-11-07", "tz": "Asia/Riyadh" },
  "currency": "SAR",
  "freshness": {
    "events_until": "2026-11-10T18:30:00Z",
    "orders_until": "2026-11-10T18:41:00Z",
    "crash_until": "2026-11-09"
  },
  "attribution": {
    "status": "provisional",
    "method_mix": { "source": 0.93, "utm": 0.05, "client_signal": 0.02 },
    "session_link_coverage": 0.88
  },
  "metrics": {
    "app_revenue": { "value": 48210.5, "previous": 41002.0, "change": 0.1758 },
    "app_orders": { "value": 212, "previous": 190, "change": 0.1158 },
    "aov": { "value": 227.41, "previous": 215.8, "change": 0.0538 },
    "sessions": { "value": 9120, "previous": 8410, "change": 0.0844 },
    "conversion_rate": { "value": 0.0204, "estimated": false, "previous": 0.0197, "change": 0.0355 },
    "dau_avg": { "value": 1210, "previous": 1105, "change": 0.095 },
    "mau": { "value": 6410, "previous": 6022, "change": 0.0644 },
    "new_devices": { "value": 740, "previous": 802, "change": -0.0773 },
    "push_open_rate": { "value": 0.071, "previous": 0.064, "change": 0.1094 },
    "push_attributed_revenue": { "value": 5120.0, "window_hours": 24, "previous": 3900.0, "change": 0.3128 },
    "crash_free_sessions": { "value": 0.9962, "target": 0.995, "previous": 0.9958, "change": 0.0004 }
  }
}
```

`status` قيمته `provisional` حتى يُغلق SPK-03، فتعرض اللوحة تنبيهًا بأن النسبة مؤقتة.

**سلسلة زمنية**

`GET /dashboard/v1/analytics/timeseries?metric=app_revenue&from=2026-11-01&to=2026-11-07&granularity=day&platform=all`

```json
{
  "metric": "app_revenue",
  "granularity": "day",
  "points": [
    { "date": "2026-11-01", "value": 6120.0 },
    { "date": "2026-11-02", "value": 7015.5 }
  ]
}
```

قيم `metric` المقبولة: `app_revenue`، و`app_orders`، و`aov`، و`sessions`، و`conversion_rate`، و`dau`، و`push_attributed_revenue`، و`crash_free_sessions`. و`granularity` يوم أو أسبوع.

**الكتل**

`GET /dashboard/v1/analytics/blocks?from=2026-11-01&to=2026-11-07&page_id=home&sort=revenue&limit=20`

```json
{
  "items": [
    {
      "page_id": "home", "block_id": "b1", "block_type": "hero_slider",
      "deleted": false, "impression_sessions": 8800, "clicks": 1430,
      "ctr": 0.1281, "attr_orders": 41, "attr_revenue": 9800.0
    }
  ]
}
```

**الإشعارات** (تستهلكها شاشة الحملات في M06 أيضًا)

`GET /dashboard/v1/analytics/push?from=2026-11-01&to=2026-11-07`

```json
{
  "window_hours": 24,
  "campaigns": [
    {
      "campaign_id": "8812", "sent": 5120, "opens_unique": 402,
      "open_rate": 0.0785, "attr_orders": 19, "attr_revenue": 4210.0
    }
  ]
}
```

**صحة البيانات للمنصة** (لوحة الإدارة، F-P01 وF-P03)

`GET /admin/v1/analytics/health?day=2026-11-09`

```json
{
  "tenants": [
    {
      "tenant_id": "t_1042", "events_accepted": 98210, "rejected_rate": 0.002,
      "seq_gap_rate": 0.004, "app_orders": 31, "session_link_coverage": 0.9,
      "method_mix": { "source": 0.94, "utm": 0.06, "client_signal": 0.0 },
      "other_app_channel": false, "crash_free_sessions": 0.9971, "last_rollup_at": "2026-11-10T00:30:00Z"
    }
  ]
}
```

`PATCH /admin/v1/analytics/tenants/{id}/settings` بجسم `{"app_source_values": ["mobile_app"], "other_app_channel": true, "raw_retention_days": 90}`، ويُسجَّل في سجل التدقيق (M12).

### 5.6 الأحداث بين المكونات (داخل الخادم)

| الحدث | المصدر | ما يفعله M08 |
|---|---|---|
| `Zid\OrderCreated`، و`Zid\OrderStatusUpdated` | M10 | تسجيل الطلب ونسبته وتحديث حالته |
| `Orders\CheckoutConfirmed {tenant_id, checkout_attempt_id, zid_order_id}` | وحدة الطلبات (M04 وM05) | ربط الطلب بالجلسة |
| `Push\NotificationDispatched {tenant_id, campaign_id, notification_id, success_count, failure_count, sent_at}` | M06 | عدّاد `sent` |
| `Config\PagePublished {tenant_id, page_id, version, blocks[{id, type}]}` | M11 | أسماء الكتل وأنواعها، ووسم المحذوفة |
| `Account\CustomerDeleted {tenant_id, zid_customer_id}` | M05 | تشغيل `ForgetCustomer` |
| `Tenancy\TenantUninstalled {tenant_id}` | M10 وM12 | جدولة `PurgeTenant` بعد 30 يومًا |

### 5.7 العقود مع الوحدات الأخرى

| الوحدة | ما تلتزم به |
|---|---|
| M01 | توفير `AnalyticsClient` في حاوية الاعتماديات، ومراقب الموجّه لـ `screen_view`، وإشعارات دورة الحياة، وأعلام `analytics.enabled` و`analytics.sampling` في endpoint الأعلام |
| M03 | `block_id` ثابت لكل كتلة عبر النسخ، وإطلاق `block_impression` و`block_click` و`unknown_block` |
| M04 | أحداث التسوق، وإلحاق معاملات `checkout_attribution` برابط الدفع الأول، وإطلاق `purchase` و`checkout_exit` |
| M05 | `setCustomer()` عند الدخول والخروج، وإطلاق `CustomerDeleted`، ومفتاح «مشاركة بيانات الاستخدام» في الإعدادات |
| M06 | `push_received` و`push_open` و`notification_pref_change`، و`NotificationDispatched` |
| M07 | `link_open` بعد حل الرابط، وتمرير `campaign` إلى سياق النسبة |
| M09 | أحداث الشريط والنوافذ والأذونات والتحديث وWhatsApp |
| M10 | إعادة جلب الطلب، وحقول `source` و`marketing_source`، و`List Orders` للمطابقة ضمن حصة المعدّل |
| M11 | `PagePublished`، وعدم تغيير `block_id` عند التعديل |
| M12 | `X-Tenant-Key`، والخزنة لرمز Sentry ولمفاتيح البكسلات، وسجل التدقيق |
| M13 | اسم الإصدار في Sentry `{bundle_id}@{version}+{build}`، و`environment = production`، وإجابات ملصقات الخصوصية (القسم 7.2) |

### 5.8 متطلبات واجهة التحليلات المسلَّمة إلى M15

1. **صفحة «التحليلات»** في لوحة التاجر:
   - شريط علوي: منتقي مدة (اليوم، وآخر 7 أيام، وآخر 30 يومًا، وهذا الشهر، ومخصص حتى 365 يومًا)، ومقارنة بالفترة السابقة، ومرشّح المنصة (الكل، وiOS، وأندرويد).
   - صف بطاقات: إيراد التطبيق، والطلبات، ومتوسط قيمة الطلب، ومعدل التحويل، والمستخدمون النشطون (متوسط DAU، وMAU)، وفتح الإشعارات، وإيراد الإشعارات، والجلسات الخالية من الانهيار مع خط الهدف 99.5%. ولكل بطاقة نسبة التغيّر بسهم ولون دلالي، وتلميح فيه التعريف بجملة واحدة.
   - رسم زمني بمؤشر يختاره التاجر.
   - جدول «أعلى الكتل» بالترتيب حسب النقرات أو الإيراد، مع زر «افتح في المحرر» يحدد الكتلة.
   - جدول الحملات (مشترك مع M06).
2. **الحالات**: تحميل بهيكل عظمي (skeleton)، وفارغة قبل إطلاق التطبيق («ستظهر الأرقام بعد أول جلسة في تطبيقك»)، وخطأ مع إعادة محاولة، وبيانات جزئية (Sentry غير متاح، أو النسبة مؤقتة) بتنبيه غير مانع.
3. **الحداثة**: سطر «آخر تحديث قبل N دقيقة» من `freshness`.
4. **الأرقام**: أرقام لاتينية، ورمز الريال وفق M02، ومنازل عشرية: اثنتان للمبالغ، وواحدة للنسب المئوية. والتواريخ ميلادية، مع التسمية الهجرية في منتقي المدة (M15).
5. **RTL**: الرسوم تبدأ من اليمين زمنيًا وفق اتجاه اللوحة. والمحور الرقمي لا يُعكس.
6. **إمكانية الوصول**: لكل رسم جدول بديل يُفتح بزر «عرض كجدول».
7. **لوحة الإدارة**: صفحة «صحة التحليلات» من `GET /admin/v1/analytics/health`، بفرز حسب المرفوض، والفجوات، وتغطية الربط، والانهيار، ونموذج لتعديل إعدادات المستأجر.

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| الجهاز بلا اتصال أيامًا | الطابور يحتفظ حتى 2,000 حدث و72 ساعة. وما زاد يُحذف حسب الأولوية. ويُقاس الفقد من فجوات `seq` |
| ساعة الجهاز خاطئة بساعات | تصحيح بفرق `sent_at` و`received_at`. وما خرج عن النافذة يُرفض `out_of_window` |
| إعادة إرسال الدفعة نفسها بعد انقطاع | `ON CONFLICT DO NOTHING` على المفتاح الأساسي، وتُعد `duplicates` |
| حدث باسم غير معروف من إصدار تطبيق أحدث من الخادم | يُرفض `unknown_event` ولا تُرفض الدفعة. ويظهر العدد في صحة التحليلات |
| حدث من إصدار قديم بخاصية حُذفت | الخاصية `deprecated` تُقبل وتُهمل |
| المتسوق أطفأ «مشاركة بيانات الاستخدام» | لا يُجمع أي حدث بعدها، ويُحذف الطابور. وطلباته تبقى في `anl_orders`، لأنها من زد لا من التطبيق، لكن دون ربط بجلسة |
| `source` لا يأتي `mobile_app` (SPK-03 فشل) | تعمل القاعدة 2 (`utm_source`). وإن لم تلتقط زد UTM من رابط الدفع تبقى القاعدة 3 وحدها، وتُعرض النسبة «مؤقتة» |
| التاجر لديه تطبيق آخر يصنع طلبات `mobile_app` | `other_app_channel = true`، ولا تكفي القاعدة 1 وحدها |
| طلب أُلغي بعد أسابيع | `OrderStatusUpdated` يعلّم يوم الإنشاء متسخًا، ويُعاد تجميعه |
| webhook ضاع (زد تعيد 3 مرات فقط) | المطابقة الليلية تضيفه |
| طلب بعملة غير عملة المتجر | يُستبعد من الإيراد ويُعد في `other_currency_orders` حتى يُحسم O-ANL-4 |
| فتح إشعارين ثم شراء بعد 23 ساعة من الأول وساعة من الثاني | يُنسب إلى الثاني (آخر لمسة) |
| شراء بعد 25 ساعة من فتح الإشعار | لا يُنسب إلى الإشعار |
| الكتلة حُذفت من الصفحة | تبقى بياناتها التاريخية، وتظهر بوسم «محذوفة» |
| صفحة أعيد نشرها بنسخة جديدة | `block_id` ثابت، فتُجمع المقاييس عبر النسخ. و`page_version` للتحقيق فقط |
| Sentry لا يستجيب | البطاقة «غير متاح» مع آخر قيمة وتاريخها، وتنبيه في لوحة الإدارة بعد 24 ساعة |
| مستأجر جديد بلا جلسات | الحالة الفارغة. وكل القسمات على صفر تعيد `null` لا خطأ |
| معاينة Flutter Web في اللوحة | `NoopAnalyticsClient`، فلا تتلوث أرقام التاجر بالمعاينة |
| بناء staging أو dev | مفتاح مستأجر غير مفتاح الإنتاج، ويُرفض في خادم الإنتاج |
| حذف حساب المتسوق | `ForgetCustomer` يضع `customer_id = NULL` في `anl_events` و`anl_daily_active_devices` ويحذف `zid_customer_id` من `anl_orders` خلال 24 ساعة |
| إلغاء تثبيت التاجر | حذف كل بياناته التحليلية بعد 30 يومًا، إلا إن أعاد التثبيت قبلها |
| ذروة رمضان بعد الإفطار (ضعف الحمل أو أكثر) | الاستقبال يدفع إلى الطابور فقط. والعمال يتوسعون أفقيًا، والتأخير المقبول في الكتابة حتى 5 دقائق |

## 7. المتطلبات غير الوظيفية

### 7.1 الأداء والموثوقية

| المتطلب | الهدف | القياس |
|---|---|---|
| كلفة `track()` على خيط الواجهة | أقل من 1 ms (p95) | اختبار أداء في CI على جهاز أندرويد متوسط |
| زمن استجابة الاستقبال | p95 أقل من 150 ms، وp99 أقل من 400 ms | مقاييس الخادم (M12) |
| السعة | 500 حدث في الثانية بعامل واحد، وتوسع أفقي بالعمال | اختبار حمل قبل M4 |
| تأخير الكتابة | من الاستقبال إلى `anl_events` أقل من 60 ثانية (p95)، وأقل من 5 دقائق في الذروة | `received_at` مقابل وقت الإدخال |
| حداثة اللوحة | بطاقات اليوم أقدم من 30 دقيقة على الأكثر. والطلب يظهر في الإيراد خلال 15 دقيقة من webhook | `freshness` |
| زمن واجهات اللوحة | p95 أقل من 500 ms لمدة حتى 90 يومًا، وأقل من 1.5 ثانية لـ 365 يومًا | — |
| فقد الأحداث | أقل من 1% أسبوعيًا لكل مستأجر | فجوات `seq` |
| دقة الإيراد | مجموع `app_revenue` ليوم D-1 بعد المطابقة يساوي مجموع طلبات زد المنسوبة بفرق أقل من 0.5% | مقارنة آلية أسبوعية في المطابقة |
| أثر البطارية | لا إيقاظ في الخلفية. والإرسال في المقدمة أو عند الانتقال إلى الخلفية فقط | مراجعة الكود |
| حجم الحمولة | 64 KB قبل الضغط لكل دفعة | — |

### 7.2 الخصوصية والموافقة

- **ما يُجمع**: معرّف جهاز عشوائي، ومعرّف جلسة، ومعرّف عميل زد بعد الدخول، وتفاعلات التطبيق، ونص البحث بعد التنقية، والطلبات من زد. ولا يُجمع: IDFA، ولا IDFV، ولا advertising ID، ولا الاسم، ولا البريد، ولا الجوال، ولا الموقع الدقيق، ولا عنوان IP.
- **متى لا يلزم ATT**: Apple تعرّف التتبع بأنه ربط بيانات التطبيق ببيانات شركات أخرى لاستهداف الإعلانات أو قياسها، أو مشاركتها مع وسطاء بيانات ([Apple: User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)). وتحليلاتنا الخاصة وSentry لا تفعلان ذلك. لذا لا يُطلب ATT في الإصدار الأول، ولا يُضاف `NSUserTrackingUsageDescription`، ولا يُربط إطار AdSupport.
- **متى يلزم ATT**:
  1. عند تفعيل تمرير البكسلات (ANL-16): إذن ATT قبل أي تمرير لحدث iOS. وApple تمنع ربط أي ميزة بالموافقة أو تقديم حافز عليها (الإرشادة 5.1.2(i)) ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)).
  2. **خطر مفتوح**: بكسلات زد داخل صفحة الدفع قد تعدّها Apple تتبعًا من التطبيق. وتقارير مطوّرين تذكر رفضًا بسبب cookies تتبع في WebView لمحتوى يملكه صاحب التطبيق ([Apple Developer Forums 688288](https://developer.apple.com/forums/thread/688288)، و[682191](https://developer.apple.com/forums/thread/682191)). التفصيل في O-ANL-2.
- **أندرويد**: لا يُعلن إذن `com.google.android.gms.permission.AD_ID` في الإصدار الأول ([Google Play: Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248)).
- **الموافقة**: التحليلات الخاصة تعمل افتراضيًا، مع مفتاح «مشاركة بيانات الاستخدام لتحسين المتجر» في إعدادات الحساب (M05) يوقفها فورًا. والإعلانات المخصصة (ANL-16) لا تعمل إلا بموافقة صريحة. والأساس النظامي وفق نظام حماية البيانات الشخصية السعودي يحتاج مراجعة قانونية (O-ANL-3). فاللائحة التنفيذية تفرّق بين الموافقة الصريحة والضمنية، وتلزم بالتوقف عند سحب الموافقة ([HSF: Saudi PDPL](https://www.hsfkramer.com/insights/2023-11/saudi-arabias-personal-data-protection-law-%E2%80%93-what-you-need-to-know)). وقد فتحت سدايا استشارة لتعديل اللائحة في أكتوبر 2026 ([Al Tamimi](https://www.tamimi.com/news/sdaia-opens-public-consultation-on-proposed-amendments-to-the-pdpl-implementing-regulation/)).
- **ملصقات الخصوصية** (يسلّمها M08 إلى M13 لإجابات App Store وData safety): «Usage Data: Product Interaction» و«Purchases: Purchase History» و«Identifiers: User ID» (معرّف عميل زد)، كلها مرتبطة بالمستخدم، ولغرض Analytics وApp Functionality، ولا تتبع. و«Diagnostics: Crash Data» من Sentry.
- **الوصول**: التاجر يرى مؤشرات مجمّعة فقط. لا شاشة في الإصدار الأول تعرض أحداث متسوق بعينه.
- **العزل**: كل استعلام في الوحدة يمر بـ scope المستأجر من M12، ويُختبر بقصة اختبار عبور المستأجرين.

### 7.3 العربية وإمكانية الوصول والمراقبة

- كل نصوص اللوحة بالعربية والإنجليزية، وأسماء المؤشرات والتعريفات في التلميحات بلغة اللوحة.
- مراقبة الوحدة نفسها: مقاييس `ingest_requests_total` و`ingest_rejected_total{code}` و`persist_lag_seconds` و`rollup_duration_seconds{job}`، وتنبيه حين يتجاوز `persist_lag` 5 دقائق لمدة 10 دقائق، أو حين تتأخر `rollup-daily` بعد 06:00.

## 8. الاعتماديات والمجهول

### 8.1 التجارب المرتبطة

| SPK | الأثر على M08 | البديل حتى الحسم |
|---|---|---|
| SPK-03 | قيمة `source` لطلب WebView. **ويُضاف إليه سؤالان**: هل تلتقط زد `utm_*` من رابط `/checkout` في `marketing_source` حين تكون الجلسة قد أُنشئت قبل ذلك عبر API؟ وهل يحمل الطلب `source = mobile_app` لأي تطبيق جوال، فيختلط بتطبيق منافس؟ | قاعدة نسبة قابلة للضبط لكل مستأجر، و`status = provisional` في اللوحة |
| SPK-01 | توقيت إشارة الشراء ومعرّف الطلب فيها | الاعتماد على الطلبات من الخادم. وإشارة العميل لمعدل التحويل فقط |
| SPK-04 | بقاء الترويسة. ويُضاف إليه: هل تبقى معاملات UTM وعلامة الـ User-Agent عبر التحويل إلى `sso.zid.store` والعودة؟ | — |
| SPK-02 | مكان ATT من صفحة الدفع (O-ANL-2) | — |

### 8.2 القرارات المفتوحة

| المعرّف | السؤال | التوصية | يقرره |
|---|---|---|---|
| O-ANL-1 | خط خاص أم Firebase Analytics | **خط خاص**، وتُكتب ADR-0011. لا تعارض مع ADR قائم، لكن القرار معماري ويجب تسجيله | المشرف |
| O-ANL-2 | بكسلات زد (Meta وTikTok وSnap) داخل صفحة الدفع قد تُعد تتبعًا في مراجعة Apple. ولا يمكن حجبها بالحقن (ADR-0003)، و`webview_flutter` لا يعرض قوائم حجب المحتوى (WKContentRuleList) | تجربة تُضاف إلى SPK-02: تقديم TestFlight وطرح السؤال على App Review. فإن لزم الحجب يُدرس بديل يدعم قوائم الحجب دون حقن سكربت، وهذا يمس اختيار الحزمة في ADR-0003. وإن لزم ATT يُطلب قبل أول دفع فقط في المتاجر التي لها بكسلات في `scripts.params` | المشرف، بعد SPK-02 |
| O-ANL-3 | الأساس النظامي للتحليلات (موافقة أم مصلحة مشروعة)، ومنطقة بيانات Sentry (نقل خارج المملكة) | مراجعة قانونية قصيرة قبل G1. واستضافة الخادم وفق D-06، ومنطقة Sentry في الاتحاد الأوروبي مع حذف PII في `beforeSend` | المعتمِد |
| O-ANL-4 | الطلبات بعملة غير عملة المتجر | استبعادها في الإصدار الأول وعرض عددها. ويُراجع بعد SPK-03 إن كانت زد تعيد الإجمالي بعملة المتجر | المشرف |
| O-ANL-5 | الإيراد: إجمالي أم صافٍ بعد الاسترجاع وقبل الضريبة | إجمالي في الإصدار الأول، مع تسمية واضحة. والصافي Should | المشرف |
| O-ANL-6 | نافذة نسبة الإشعار | 24 ساعة ثابتة، وتُعرض بجانب الرقم | المشرف |

### 8.3 ما يتعارض أو يحتاج توضيحًا في ADRs وPRD

- **ADR-0003، البند 4 (الطبقة الثالثة لكشف النجاح)**: قناة `addJavaScriptChannel` في `webview_flutter` تضيف سكربت مستخدم إلى WKWebView، والبند 2 يمنع الحقن في صفحة الدفع. لذلك تقترح هذه المواصفة أن يرسل App Script إشارته إلى خادمنا مباشرة (القسم 3.8، الطبقة D)، لا إلى التطبيق. ويحتاج ADR-0003 توضيحًا بهذا المعنى.
- **ADR-0008 مع GA4**: تجميع 15 تاجرًا في مشروع Firebase واحد يمنع GA4 منفصلًا لكل تاجر. هذا ليس خطأ في ADR-0008، لكنه سبب إضافي لقرار O-ANL-1.
- **PRD F-M11**: لا يذكر «إيراد الإشعارات المنسوب» ولا «أعلى الكتل إيرادًا»، بل «فتح الإشعارات» و«نقرات الكتل». هذه المواصفة تضيفهما لأن كلفتهما صغيرة فوق النسبة نفسها. فإن رأى المشرف إبقاء النطاق كما هو، تُنقلان إلى Should دون أثر على البقية.

### 8.4 ما يمكن بناؤه الآن خلف واجهات مؤقتة

- السجل والتوليد، ومكتبة الجمع بخادم وهمي، وواجهة الاستقبال والجدول المقسّم، والتجميع ببيانات مولّدة، ومزامنة Sentry على مشروع تجريبي.
- النسبة تُبنى بقيمة `app_source_values` قابلة للضبط، وتُشغَّل على طلبات المتجر التطويري بعد P-2.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| ANL-01 | سجل الأحداث `events.v1.yaml`، ومولّد أصناف Dart وقواعد PHP، واختبار عقد بينهما | Must | نعم | — |
| ANL-02 | مكتبة الجمع: الغلاف، والجلسة، و`device_id`، والطابور على القرص، والدفعات، وإعادة المحاولة، والعيّنة، ومفتاح الإيقاف، و`NoopAnalyticsClient` | Must | نعم (بخادم وهمي، وتُربط بقاعدة M01 المحلية لاحقًا) | ANL-01 |
| ANL-03 | واجهة الاستقبال، والتحقق، والطابور، و`anl_events` المقسّم، وأمر إدارة الأقسام، و`anl_ingest_stats` | Must | نعم (بمفتاح مستأجر مؤقت حتى M12) | ANL-01، وM12 للمفتاح النهائي |
| ANL-04 | ربط أحداث دورة الحياة والتسوق في الشاشات: `app_open` و`screen_view` و`search` والقوائم والمنتج والسلة والمفضلة و«نبهني» و`share` و`login` | Must | ينتظر M04 | ANL-02، وM01، وM04، وM05 |
| ANL-05 | أحداث الكتل: `block_impression` بقاعدة الظهور، و`block_click`، و`unknown_block` | Must | ينتظر M03 | ANL-02، وM03 |
| ANL-06 | تسجيل طلبات زد، ومحرك النسبة بالقواعد الثلاث وعلم القناة الأخرى، والمطابقة الليلية | Must | جزئيًا: يُبنى الآن بقيم مؤقتة، ويُثبَّت بعد SPK-03 | M10، وSPK-03 |
| ANL-07 | معاملات النسبة في رابط الدفع، وسياق آخر لمسة، و`begin_checkout` و`purchase` و`checkout_exit`، والربط بـ `CheckoutConfirmed` | Must | ينتظر SPK-01 وSPK-03 | ANL-02، وM04 |
| ANL-08 | مهام التجميع والجداول اليومية: المستأجر، والأجهزة النشطة، والكتل، والإشعارات، والأيام المتسخة | Must | نعم (ببيانات مولّدة) | ANL-03، وANL-06 |
| ANL-09 | مزامنة Sentry وجدول الانهيار اليومي | Must | نعم (على مشروع Sentry تجريبي) | M12 (Sentry)، وM13 (اسم الإصدار) |
| ANL-10 | واجهات اللوحة: `overview` و`timeseries` و`blocks` و`push`، مع اختبار عزل المستأجرين | Must | نعم بعد ANL-08 | ANL-08، وANL-09 |
| ANL-11 | قياس الإشعارات: استهلاك `NotificationDispatched`، ونسبة الإيراد بنافذة 24 ساعة | Must | ينتظر M06 | ANL-07، وANL-08، وM06 |
| ANL-12 | `link_open` وتمرير الحملة إلى سياق النسبة | Must | ينتظر M07 | ANL-02، وM07 |
| ANL-13 | صفحة التحليلات في لوحة التاجر (Next.js) وفق القسم 5.8 | Must | ينتظر M15 (الهيكل ونظام التصميم) | ANL-10، وM15 |
| ANL-14 | صحة التحليلات في لوحة الإدارة، وإعدادات المستأجر مع التدقيق | Must | ينتظر M15 | ANL-10، وM12 |
| ANL-15 | الخصوصية: مفتاح المشاركة، و`ForgetCustomer`، و`PurgeTenant`، وأوامر الاحتفاظ، وإجابات ملصقات الخصوصية لـ M13 | Must | نعم | ANL-03 |
| ANL-16 | بكسلات التاجر بتمرير من الخادم (Meta وTikTok وSnap)، مع ATT بالتنسيق مع M09 | Should | ينتظر O-ANL-2 وO-ANL-3 | ANL-07، وENG-14، وM12 |
| ANL-17 | مجموعات الاحتفاظ الأسبوعية | Should | نعم بعد ANL-08 | ANL-08 |
| ANL-18 | تصدير CSV، ونسبة إيراد التطبيق من إجمالي المتجر | Should | نعم بعد ANL-10 | ANL-06، وANL-10 |
| ANL-19 | الانتقال إلى ClickHouse عند العتبات | Could | لا (مشروط بالعتبات) | ANL-03 |

### معايير القبول لأهم القصص

**ANL-02: مكتبة الجمع**
1. **بافتراض** أن الجهاز بلا اتصال وأن المتسوق أطلق 30 حدثًا، **عندما** يعود الاتصال والتطبيق في المقدمة، **إذن** تُرسل الأحداث في دفعة أو اثنتين خلال 30 ثانية، ويُفرَّغ الطابور، ولا تظهر فجوة في `seq` على الخادم.
2. **بافتراض** أن الخادم رد بـ 429 و`Retry-After: 120`، **عندما** يحاول العميل مجددًا، **إذن** لا يرسل قبل 120 ثانية، وتبقى الأحداث في الطابور.
3. **بافتراض** أن الطابور بلغ 2,000 حدث، **عندما** يُطلق `purchase`، **إذن** يُقبل في الطابور، ويُحذف أقدم `block_impression` بدلًا منه.
4. **بافتراض** أن التطبيق بقي في الخلفية 31 دقيقة، **عندما** يعود إلى المقدمة، **إذن** يُولَّد `session_id` جديد ويُطلق `app_open` واحد بـ `launch_type = warm`.
5. **بافتراض** أن المتسوق أطفأ «مشاركة بيانات الاستخدام»، **عندما** يتصفح، **إذن** لا يُكتب أي حدث في الطابور، ولا يصدر أي طلب إلى `/analytics/events`.

**ANL-03: الاستقبال**
1. **بافتراض** دفعة صحيحة من 50 حدثًا، **عندما** تُرسل مرتين بالمحتوى نفسه، **إذن** يرد الخادم 202 في المرتين، ويوجد في `anl_events` 50 صفًا فقط، و`duplicates = 50` في الثانية.
2. **بافتراض** دفعة فيها حدث واحد باسم غير مسجل، **عندما** تُرسل، **إذن** تُقبل 49 ويُرفض واحد بالرمز `unknown_event` و`index` الصحيح.
3. **بافتراض** أن ساعة الجهاز متأخرة 3 ساعات، **عندما** تصل دفعة، **إذن** يُخزَّن `occurred_at` مصححًا بفارق `sent_at` و`received_at`، بخطأ أقل من ثانيتين.
4. **بافتراض** أن `X-Tenant-Key` لمستأجر و`tenant_id` لآخر، **عندما** تُرسل الدفعة، **إذن** يرد 401 ولا يُكتب شيء.
5. **بافتراض** أن اليوم 91 تجاوز مدة الاحتفاظ، **عندما** يعمل `analytics:partitions`، **إذن** يُحذف القسم بـ `DROP TABLE`، ويوجد قسم جاهز لكل يوم من الأيام السبعة القادمة.

**ANL-06: نسبة الطلبات**
1. **بافتراض** أن `app_source_values = ["mobile_app"]` وأن طلبًا وصل بـ `source = mobile_app`، **عندما** يعالجه `RecordZidOrder`، **إذن** يُخزَّن بـ `attributed = true` و`attribution_method = source`.
2. **بافتراض** طلبًا بـ `source = web` و`marketing_source.utm_source = intishar_app`، **عندما** يُعالج، **إذن** `attribution_method = utm`.
3. **بافتراض** أن `other_app_channel = true` وأن طلبًا جاء بـ `source = mobile_app` دون UTM ودون إشارة شراء، **عندما** يُعالج، **إذن** `attributed = false`.
4. **بافتراض** أن webhook طلب لم يصل، **عندما** تعمل المطابقة الليلية، **إذن** يُضاف الطلب بالقاعدة نفسها، ويُعاد تجميع يومه، ولا يتجاوز استهلاك المطابقة 12 طلبًا في الدقيقة للمتجر.
5. **بافتراض** طلبًا منسوبًا أُلغي بعد 20 يومًا، **عندما** يصل `order.status.update`، **إذن** يُستبعد من إيراد يوم إنشائه بعد إعادة التجميع التالية.

**ANL-08: التجميع والمؤشرات**
1. **بافتراض** بيانات اختبار ثابتة (fixture) لمتجر: 3 أجهزة، و5 جلسات، وطلبان منسوبان بـ 100 و300 ريال وأحدهما مرتبط بجلسة، **عندما** يعمل `rollup-daily`، **إذن** `app_revenue = 400` و`app_orders = 2` و`aov = 200` و`sessions = 5` و`DAU = 3`، ومعدل التحويل يُعرض تقديريًا `2/5`، لأن تغطية الربط 50% أقل من 80%.
2. **بافتراض** فتح إشعار الحملة A ثم طلبًا بعد 23 ساعة من الجهاز نفسه، وطلبًا آخر بعد 25 ساعة، **عندما** يُجمَّع اليوم، **إذن** يُنسب الأول فقط إلى A.
3. **بافتراض** أن التجميع شُغّل مرتين لليوم نفسه، **عندما** تُقرأ الجداول، **إذن** القيم متطابقة (لا تضاعف).

**ANL-09: الانهيار**
1. **بافتراض** أن Sentry أعاد إصدارين لمتجر: 9,000 جلسة بمعدل 0.998، و1,000 جلسة بمعدل 0.990، **عندما** تعمل المزامنة، **إذن** `crash_free_sessions_rate = 0.9972`.
2. **بافتراض** أن Sentry أعاد 5xx ست مرات، **عندما** تفتح اللوحة، **إذن** تعرض البطاقة «غير متاح» مع آخر قيمة معروفة وتاريخها، ويظهر تنبيه في صحة التحليلات.

**ANL-10: واجهات اللوحة**
1. **بافتراض** تاجرين A وB، **عندما** يطلب مستخدم A `overview` بأي معاملات، **إذن** لا تتضمن الاستجابة أي رقم من بيانات B (اختبار عزل آلي).
2. **بافتراض** فترة 90 يومًا، **عندما** تُطلب `overview`، **إذن** تصل الاستجابة خلال أقل من 500 ms (p95) على بيانات 50 تاجرًا.

## 10. المصادر

- [GA4: Recommended events reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [GA4: Event collection limits](https://support.google.com/analytics/answer/9267744)
- [GA4: Data retention](https://support.google.com/analytics/answer/7667196)
- [GA4: About sessions](https://support.google.com/analytics/answer/9191807)
- [GA4: Automatically collected events](https://support.google.com/analytics/answer/9234069)
- [Firebase: Event names reference](https://firebase.google.com/docs/reference/cpp/group/event-names)
- [Firebase: Configure Analytics data collection (iOS)](https://firebase.google.com/docs/analytics/configure-data-collection?platform=ios)
- [Firebase pricing](https://firebase.google.com/pricing)
- [Firebase Management API: projects.addGoogleAnalytics](https://firebase.google.com/docs/projects/api/reference/rest/v1beta1/projects/addGoogleAnalytics)
- [Apple: User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple Developer Forums: ATT and WebView rejection 688288](https://developer.apple.com/forums/thread/688288)، و[682191](https://developer.apple.com/forums/thread/682191)
- [Google Play: Advertising ID](https://support.google.com/googleplay/android-developer/answer/6048248)
- [Sentry: Release Health](https://docs.sentry.io/product/releases/health/)
- [Sentry: Retrieve Release Health Session Statistics](https://docs.sentry.io/api/releases/retrieve-release-health-session-statistics/)
- [PostgreSQL 18: Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [pg_partman 5.2.4 release announcement](https://www.postgresql.org/message-id/173628104842.818647.202629578334557073%40wrigleys.postgresql.org)
- [ClickHouse: ReplacingMergeTree](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replacingmergetree)
- [Meta: Conversions API for App Events](https://developers.facebook.com/docs/marketing-api/conversions-api/app-events)
- [Snap: Conversions API](https://developers.snap.com/api/marketing-api/Conversions-API/UsingTheAPI)
- [Twilio Segment: TikTok App Events](https://www.twilio.com/docs/segment/connections/destinations/catalog/tiktok-app-events.md)
- [Zid: Scripts (JS Apps API)](https://docs.zid.sa/scripts-1758413m0)، و[StoreFront Events](https://docs.zid.sa/storefront-events-649611m0)
- [Zid: View Order](https://docs.zid.sa/view-order-12479054e0)، و[List Orders](https://docs.zid.sa/list-of-orders)
- [HSF: Saudi Arabia's Personal Data Protection Law](https://www.hsfkramer.com/insights/2023-11/saudi-arabias-personal-data-protection-law-%E2%80%93-what-you-need-to-know)
- [Al Tamimi: SDAIA consultation on PDPL implementing regulation amendments](https://www.tamimi.com/news/sdaia-opens-public-consultation-on-proposed-amendments-to-the-pdpl-implementing-regulation/)
- حزم pub.dev وPackagist وnpm بإصداراتها المذكورة، كما ظهرت في سجلاتها الرسمية بتاريخ 2026-11-10
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md` (Q8 وQ9)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/global_builders_features.md` (القسم 4)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/local_builders_teardown.md`
- `reports/مزايا وتخصيص تطبيقات متاجر زد.md`
