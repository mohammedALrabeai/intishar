# M10: موصل زد (Zid Connector)

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Laravel (وحدتا `ZidConnector` و`Commerce`)، وخدمة خارجية (زد: OAuth، وMerchant API، وwebhooks المتجر، وأحداث التطبيق من Partner Dashboard). واجهات الحالة في Next.js من M15 |
| المتطلبات | F-M01, F-P05، ويخدم F-P01 (صحة الربط)، وF-M07 وF-S10 وF-M11 عبر الأحداث وعميل الـ API |
| القرارات | ADR-0005 (أساسي)، وADR-0008 (محفزات الإشعارات)، وADR-0010 (لا واجهات في Laravel)، وADR-0003 (المتجر من Storefront API لا من هنا) |
| تعتمد على | M12: تعدد المستأجرين، وخزنة الأسرار، والطوابير والجدولة، وسجل التدقيق، واصطلاحات الـ API، والأعلام |
| بادئة القصص | ZID |

> **ملاحظة على النطاقات**: أسماء النطاقات في هذه الوثيقة (`api.intishar.sa` و`app.intishar.sa`) أمثلة حتى يُحسم النطاق الفعلي. والقاعدة الملزمة هي البنية: الـ API واللوحة على نطاقين فرعيين لنطاق أب واحد ([M12](M12-platform-core.md)).

## 1. الغرض والنطاق

M10 هي البوابة الوحيدة بين المنصة وزد من جهة التاجر. لا تستدعي أي وحدة أخرى `api.zid.sa` أو `oauth.zid.sa` مباشرة، بل عبر العقود التي تنشرها M10. وحسب ADR-0005 (البند 3)، تُعرَّف العقود بأسماء محايدة في وحدة `Commerce`، وزد أول تنفيذ لها.

### داخل الإصدار الأول (Must)
1. **التثبيت**: من سوق تطبيقات زد (تطبيق عام)، ومن تطبيق خاص (Private app) للتجار التجريبيين وحالات التعاقد المباشر.
2. **OAuth**: Authorization Code دون PKCE، مع `state`، وتبادل الرمز داخل طلب الـ callback، وحفظ الرموز الثلاثة مشفرة.
3. **دورة حياة الرموز**: تجديد مجدول كل نحو 10 أشهر، وقفل لكل متجر، وشجرة قرار لأخطاء 401، والإلغاء عند حذف التطبيق.
4. **أحداث التطبيق والاشتراك** من Partner Dashboard، وتحويلها إلى استحقاقات (Entitlements) للمزايا (F-P05).
5. **تسجيل webhooks المتجر** عبر الـ API عند التثبيت وإعادة التفعيل.
6. **استقبال الـ webhooks**: Basic Auth، ومنع التكرار، ورد 200 سريع، ثم معالجة في الطابور، وإعادة جلب الكيان قبل الوثوق بالحمولة.
7. **مراقبة صحة الـ webhooks** واستعادة المعطّل منها عبر الـ API، ثم مطابقة الفجوة.
8. **عميل Merchant API**: الترويسات، والترقيم، ومحدِّد معدّل لكل متجر (leaky bucket) يحترم `Retry-After`، وعدالة بين المتاجر.
9. **المزامنة**: ملف المتجر (الهوية، والعلامة، واللغات، والتشغيل، والتواصل)، وشجرة التصنيفات، وذاكرة منتجات مختصرة لاختيار المنتجات وتعبئة الكتل.
10. **بيانات الإدارة** لـ F-P01: حالة كل ربط، وتواريخ الرموز (لا قيمها)، وصحة الـ webhooks، وإجراءات الدعم.

### لاحقًا (Should وCould)
مذكورة في القسم 9: معالجة `customer.update`، وكتابة إعدادات OneSignal (تنتظر SPK-10)، والدخول إلى اللوحة عبر زد (SSO)، وفروق السعر والمخزون لـ F-S16، والتطبيق المضمّن داخل لوحة زد.

### ليس من مسؤولية M10
- **طلبات المتسوق**: الكتالوج والسلة والحساب يطلبها تطبيق Flutter مباشرة من `https://{store-domain}/api/v1/` (ADR-0003). M10 لا يمرر حركة المتسوقين عبر Merchant API، لأن حدّه 60 طلبًا في الدقيقة لكل متجر.
- **إرسال الإشعارات** (M06)، و**تجربة الإعداد** (M14)، و**شاشات اللوحة** (M15)، و**التخطيطات واستيراد الرئيسية** (M11 مع SPK-09)، و**منطق ملكية الطلب وعرض التتبع** (M05، ويستخدم عميل M10).
- **الفوترة خارج زد**: وحدة `Billing` لاحقًا (ADR-0005).

## 2. المكونات حسب الطبقة

### 2.1 Laravel

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `laravel/framework` | `^13.40` | انظر M12 (القسم 8 فيها: لماذا 13 لا 12) |
| عميل HTTP في Laravel (`Http::`) | ضمن الإطار | عميل Merchant API. نستخدمه بدل Saloon لأن `Http::fake()` و`preventStrayRequests()` يكفيان للاختبار، ولا نحتاج طبقة إضافية يتعلمها المنفذ |
| Redis (امتداد `phpredis`) | Redis 7.2 أو Valkey 8 | محدِّد المعدّل (سكربت Lua)، والأقفال، وتأخير المهام المكررة |
| `laravel/horizon` | `^5.50` | الطوابير `zid-webhooks` و`zid-events` و`zid-sync` و`zid-maintenance` (M12) |
| لا SDK من زد | — | SDK الخاص بـ Laravel «قريبًا» ([Zid SDKs](https://docs.zid.sa/zid-sdks-2008123m0)). المرجع هو [laravel-sample-app](https://github.com/zidsa/laravel-sample-app) |

**هيكل الوحدة** (وفق اصطلاح M12):

```text
modules/Commerce/src/                # عقود محايدة فقط، بلا تنفيذ
  Contracts/ CommerceOrders.php, CommerceCatalog.php, StoreProfileProvider.php, EntitlementsProvider.php
  Data/      OrderData.php, ProductSummary.php, CategoryNode.php, StoreProfileSnapshot.php, EntitlementSet.php
  Events/    StoreConnected.php, StoreDisconnected.php, StoreReconnected.php, EntitlementsChanged.php,
             OrderCreated.php, OrderStatusChanged.php, OrderPaymentStatusChanged.php,
             AbandonedCartCreated.php, AbandonedCartCompleted.php, CustomerCreated.php,
             ProductChanged.php, ProductDeleted.php, CategoriesChanged.php, StoreProfileChanged.php
modules/ZidConnector/
  src/
    Http/Controllers/  InstallController, OAuthCallbackController, AppEventController, StoreWebhookController,
                       ConnectionController (لوحة التاجر), Admin/InstallationController (F-P01)
    Http/Middleware/   VerifyZidAppEventKey, VerifyStoreWebhookAuth
    OAuth/             StateStore, TokenExchanger, TokenRefresher, InstallationBinder
    Client/            ZidClient, ZidRequest, Priority (enum), StoreRateLimiter, RateLimiterScript.lua,
                       CircuitBreaker, Paginator, Exceptions/*
    Webhooks/          WebhookRegistrar, DesiredWebhooks, ReceiptRecorder, Processors/*
    AppEvents/         AppEventRecorder, AppEventProcessor, SubscriptionReconciler
    Entitlements/      PlanCatalog, EntitlementResolver (ينفّذ Commerce EntitlementsProvider)
    Sync/              StoreProfileSync, CategorySync, ProductCacheSync, Reconciler
    Jobs/              (القسم 3)
    Models/            ZidApp, ZidInstallation, ZidWebhookSubscription, ZidWebhookReceipt, ZidAppEvent,
                       ZidSubscription, TenantEntitlement, PlanCatalogEntry, ZidProduct, ZidCategory,
                       ZidStoreProfile, ZidOrderRef, ZidAbandonedCartRef, ZidSyncRun, ZidOAuthAttempt
    Console/           zid:tokens:refresh-due, zid:webhooks:health, zid:reconcile, zid:receipts:redispatch,
                       zid:simulate (محلي فقط)
    ZidConnectorServiceProvider.php
  database/migrations/
  routes/zid.php (مسارات زد)، routes/api.php (اللوحة والإدارة)
  tests/Feature, tests/Unit, tests/Fixtures/zid/*.json
```

### 2.2 تطبيقات زد والبيئات

لكل بيئة تطبيق مستقل في Partner Dashboard، بمفاتيح مستقلة. والسبب أن مراجعة زد ترفض أي عنوان staging أو tunnel في تطبيق منشور ([Test your app](https://docs.zid.sa/test-your-app))، وأن خلط `client_id` بين البيئات يسبب الخطأ `EC2` ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)).

| مفتاح التطبيق (`app_key`) | النوع في زد | البيئة | الاستخدام |
|---|---|---|---|
| `public` | Public app | prod | التطبيق المنشور في السوق. لا يُقدَّم للمراجعة إلا بعد تحقق قائمة [Test your app](https://docs.zid.sa/test-your-app) |
| `pilot` | Private app | prod | التجار التجريبيون قبل النشر، والتعاقد المباشر. يشترط على المتجر باقة Professional أو Enterprise أو إضافة API Access ([Zid Apps Overview](https://docs.zid.sa/zid-apps-overview)) |
| `staging` | Public app بحالة Draft لا تُقدَّم أبدًا | staging | التطوير والاختبار على المتجر التطويري (Development Store)، وعناوينه على نطاق staging |
| `local` | اختياري: تطبيق Draft ثالث، أو [Zid Bridge](https://docs.zid.sa/zid-bridge) لتوليد رموز يدويًا | local | التجربة على جهاز المنفذ. ولا يُسجَّل عنوان Bridge في أي تطبيق عام |

**ملاحظات على المتجر التطويري**:
- متاجر العرض (Demo) للقراءة فقط، وأي طلب غير `GET` يعيد 403 «This action is not allowed on demo store». لذلك يجب أن يكون متجر الاختبار Development Store حقيقيًا، وإلا فشل تسجيل الـ webhooks ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)).
- مراجعة زد تبدأ بالتحقق من وجود تثبيت على متجر تطويري، وتُرجع التطبيق دون مراجعة إن لم يوجد ([Submit for review](https://docs.zid.sa/submit-app-for-review)).

### 2.3 Next.js
لا مكونات في M10. الشاشات (حالة الربط، وتنبيه «أعد تفعيل التطبيق»، وجداول الإدارة) تبنيها M15 على العقود في القسم 5.

## 3. التدفقات

### 3.1 التثبيت من سوق زد (تطبيق عام)

```text
التاجر ── Activate ──▶ زد ──302──▶ GET api/zid/public/install ──302──▶ oauth.zid.sa/oauth/authorize
     ◀── موافقة ──  زد ──302──▶ GET api/zid/public/callback?code&state ──▶ POST oauth/token
                                         └──▶ GET /v1/managers/account/store ──▶ ربط المستأجر ──302──▶ app/{tenant}/onboarding
```

1. التاجر يشترك في خطة (مجانية، أو تجريبية، أو مدفوعة) ويضغط **Activate**. أي دفع يتم في زد قبل التفعيل ([Public Apps OAuth Requirements](https://docs.zid.sa/oauth-requirements)).
2. زد تحوّل المتصفح إلى **Redirection URL**: `GET https://api.intishar.sa/zid/public/install`.
3. `InstallController`:
   1. يولّد `state` عشوائيًا (32 بايت، بصيغة hex).
   2. يخزّن في Redis المفتاح `zid:oauth:state:{sha256(state)}` بقيمة `{app_key, nonce_hash, created_at}` ومدة 10 دقائق.
   3. يضع cookie باسم `zid_oauth_nonce` (`HttpOnly`، و`Secure`، و`SameSite=Lax`، والمسار `/zid`، ومدة 10 دقائق). وظيفته ربط `state` بالمتصفح الذي بدأ التدفق.
   4. يسجّل محاولة في `zid_oauth_attempts` بالحالة `started`.
   5. يحوّل بـ 302 إلى `https://oauth.zid.sa/oauth/authorize?client_id=…&redirect_uri=…&response_type=code&state=…`.
   - لا صفحة تسجيل ولا صفحة تسويق قبل OAuth، لأن زد ترفض ذلك صراحة.
4. زد تعرض الموافقة على النطاقات. وقد تتخطاها إن وُجدت موافقة سابقة صالحة.
5. **عند الرفض**: زد لا تستدعي الـ callback أصلًا، وتعيد التاجر إلى لوحته مع `error_code`. فتنتهي المحاولة عندنا بالحالة `expired` بعد 10 دقائق دون إنشاء أي شيء. هذا مسار طبيعي لا خطأ ([OAuth Requirements](https://docs.zid.sa/oauth-requirements)).
6. `OAuthCallbackController` يستقبل `GET /zid/public/callback?code=…&state=…`:
   1. يتحقق أن `state` موجود في Redis، وأن `sha256` للـ cookie يطابق `nonce_hash`. ثم يحذف المفتاح ذريًا (`GETDEL`) لأنه للاستعمال مرة واحدة.
   2. **إن فشل التحقق**: إن كان المتصفح نفسه أكمل التثبيت خلال آخر 10 دقائق (إعادة تحميل الصفحة)، يحوَّل إلى اللوحة. وإلا يُحوَّل إلى صفحة الدخول برسالة الخطأ: `app.intishar.sa/login?error=zid_state`، بصيغة M15 (`zid_denied` و`zid_state` و`zid_no_subscription`).
7. **تبادل الرمز** داخل الطلب نفسه: `POST https://oauth.zid.sa/oauth/token` بجسم form من خمسة حقول (`grant_type=authorization_code`، و`client_id`، و`client_secret`، و`redirect_uri` مطابقًا حرفيًا، و`code`). المهلة 10 ثوانٍ، ولا إعادة محاولة بالرمز نفسه، لأن الرمز صالح 10 دقائق ولمرة واحدة ([Authorization](https://docs.zid.sa/authorization)).
8. **أخطاء التبادل**:
   - الجسم فيه مفتاح `error` بقيمة `App installation is not allowed`: لا اشتراك نشط. تُعرض صفحة «أكمل الاشتراك في سوق زد ثم فعّل التطبيق».
   - غلاف زد مع `Client authentication failed`: خطأ إعدادات. تنبيه P1 للفريق.
   - النص العام «missing a required parameter…»: الرمز مستعمل أو منتهٍ. تُعرض صفحة فيها زر «أعد المحاولة» يبدأ من الخطوة 2.
9. **تعريف المتجر**: `GET /v1/managers/account/store` (النطاق `third_store_details_read`) يعيد `id` و`uuid` و`title` و`url` و`email` و`phone` و`timezone` ([Store](https://docs.zid.sa/store-33664558e0)). المعرّف الثابت للمتجر عندنا هو `uuid`، وهو ما تستخدمه أحداث التطبيق أيضًا.
10. **الربط** (`InstallationBinder`) داخل قفل `zid:install:{store_uuid}` لمدة 30 ثانية، وفي معاملة قاعدة بيانات واحدة:
    - **تثبيت موجود** لـ (`zid_app_id`, `store_uuid`)، أي إعادة تثبيت أو إعادة تفعيل بعد تغيير النطاقات: تُستبدل الرموز كاملة، ويُزاد `token_generation`، وتصبح الحالة `active`. **لا يُرفض كتثبيت مكرر**، لأن رفضه يُبقي الربط معطلًا ([OAuth Requirements](https://docs.zid.sa/oauth-requirements)).
    - **متجر جديد**: يُستدعى `TenantProvisioner::provision(StoreIdentity)` من M12، فيُنشأ مستأجر بالحالة `connected_setup_required`، ثم يُنشأ التثبيت.
    - **المتجر نفسه مثبت عبر تطبيق آخر لنا** (مثلًا `pilot` ثم `public`): المستأجر نفسه، ويصبح التثبيت الجديد أساسيًا، والقديم `superseded` (القسم 3.6).
11. حفظ الرموز في خزنة M12 بالنوع `zid_oauth_tokens`. ثم حساب التواريخ:
    - `access_expires_at` = الآن + `expires_in`
    - `refresh_token_expires_at` = الآن + 365 يومًا
    - `refresh_due_at` = الآن + 300 يوم
12. تسجيل في سجل التدقيق: `zid.installation.connected` أو `zid.installation.tokens_replaced`.
13. بعد نجاح المعاملة (`afterCommit`) تُرسل المهام: `RegisterStoreWebhooks`، و`SyncStoreProfile`، و`SyncCategories`، و`SyncProductCache` (أول 200 منتج أولًا)، و`ReconcileSubscription`. ويُطلق الحدث `StoreConnected`، أو `StoreReconnected` إن كان التثبيت موجودًا.
14. **جلسة اللوحة**، وفق قواعد M12:
    - إن كان في المتصفح جلسة لمستخدم مسجل: يُحفظ `pending_link` في الجلسة، ويُحوَّل المتصفح إلى `app.intishar.sa/connect/confirm`، فيؤكد المستخدم ربط المتجر بحسابه.
    - إن لم توجد جلسة، ولا يوجد مستخدم ببريد المتجر: يُنشأ مالك جديد، ويُسجَّل دخوله، ويُحوَّل المتصفح إلى `app.intishar.sa/{tenant}/onboarding` (M15).
    - إن لم توجد جلسة، ويوجد مستخدم ببريد المتجر: **لا ربط تلقائي بتطابق البريد**. يُحوَّل المتصفح إلى `app.intishar.sa/connect/sign-in` ليدخل المستخدم ثم يؤكد الربط ([OAuth Requirements](https://docs.zid.sa/oauth-requirements)).
15. لا يظهر `code` ولا أي رمز في أي عنوان بعد الـ callback، ولا في السجلات.

### 3.2 التثبيت عبر التطبيق الخاص (`pilot`)
1. المشرف ينشئ Private app في Partner Dashboard، ويمنح المتجر المحدد صلاحية التثبيت.
2. يتحقق الدعم من أن المتجر على Professional أو Enterprise أو مفعِّل API Access. وإلا يظهر للتاجر عند التفعيل خطأ HTML من زد ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)).
3. التدفق نفسه في 3.1، بالمسار `/zid/pilot/install` والمسار `/zid/pilot/callback`.
4. **الفروق**:
   - التطبيق الخاص بلا خطط ولا أحداث اشتراك ([Subscription and app events](https://docs.zid.sa/subscription-and-app-events-2490915m0)). فالاستحقاق يضبطه مدير المنصة يدويًا (`source = manual`) بتاريخ انتهاء إلزامي.
   - **غير مؤكد** أن حدث `uninstall` يُرسل للتطبيقات الخاصة. لذلك يعمل فحص يومي للرموز (3.4، الخطوة 6).

### 3.3 تجديد الرموز المجدول
1. المجدول يشغّل `zid:tokens:refresh-due` يوميًا الساعة 02:00 بتوقيت الرياض. يختار التثبيتات النشطة التي `refresh_due_at` لها قد حلّ، ويرسل لكل منها `RefreshInstallationTokens` إلى `zid-maintenance` بتأخير عشوائي بين 0 و30 دقيقة.
2. المهمة تأخذ القفل `zid:refresh:{installation_id}` لمدة 120 ثانية، لأن تجديدين متزامنين يتركان أحدهما برمز ملغى ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)). ثم تعيد قراءة الصف من القاعدة.
3. ترسل `POST https://oauth.zid.sa/oauth/token` بالحقول `grant_type=refresh_token`، و`refresh_token`، و`client_id`، و`client_secret`، و`redirect_uri`.
4. **عند النجاح**: تكتب الطقم كاملًا ذريًا في معاملة واحدة: `authorization` و`access_token` و`refresh_token` الجديدة، والتواريخ، و`token_generation + 1`. الـ refresh token القديم يُلغى فور إصدار الجديد ([Authorization](https://docs.zid.sa/authorization)).
5. **عند الفشل** تصنّف المهمة السبب:
   - **«The refresh token is invalid.»**: تفحص الرموز الحالية بـ `GET /v1/managers/account/store`.
     - إن أعاد 401: التطبيق محذوف، فتُطبَّق 3.4.
     - إن نجح: الـ refresh token ميت والوصول ما زال صالحًا. تنبيه P1، ولافتة للتاجر «أعد تفعيل التطبيق» قبل أن ينتهي الوصول.
   - **`server_error` أو خطأ شبكة**: إعادة بعد 1 دقيقة، ثم 10 دقائق، ثم ساعة، ثم 6 ساعات، ثم يوميًا حتى 5 أيام. ثم تنبيه.
6. **التجديد الاستثنائي**: عند 401 في أي طلب، تجديد **مرة واحدة فقط لكل رمز** (القسم 6.2).
7. **مؤشر إلزامي**: عدد التثبيتات التي `refresh_token_expires_at` لها أقل من الآن + 30 يومًا يجب أن يبقى صفرًا. وإلا تنبيه P1.

### 3.4 حذف التطبيق وإلغاء الوصول
1. يصل الحدث `app.market.application.uninstall` (3.5)، أو يُكتشف الحذف بـ 401 يبقى بعد تجديد ناجح.
2. التثبيت يصبح `uninstalled`، ويُتلف سر الرموز في الخزنة (crypto-shred)، ويُسجَّل `uninstalled_at`.
3. اشتراكات الـ webhooks تُعلَّم محذوفة محليًا. زد تحذف سجلات الرموز وتلغيها فورًا ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)). أي webhook يصل لاحقًا لهذا التثبيت يُرد عليه بـ 200 ويُتجاهل.
4. يُطلق الحدث `StoreDisconnected` بالسبب `uninstalled`. فيضع M12 المستأجر في الحالة `disconnected`، ويوقف M06 الآليات التلقائية.
5. **الاحتفاظ بالبيانات** (القيم مقترحة، والقرار للمشرف، انظر القسم 8):
   - الرموز: تُحذف فورًا.
   - إيصالات الـ webhooks: 14 يومًا كالمعتاد.
   - ذاكرة المنتجات والتصنيفات ومراجع الطلبات: 30 يومًا.
   - إعداد التطبيق في M11: 90 يومًا، لتعود عند إعادة التثبيت.
6. **فحص يومي للتطبيقات الخاصة** (`zid:tokens:probe`): طلب `GET /v1/managers/account/store` لكل تثبيت `pilot` نشط. إن أعاد 401 يبقى بعد التجديد، تُطبَّق هذه الخطوات.
7. **تأخر الانتشار**: حالة الرموز عند زد مخزنة حتى 5 دقائق، لذلك قد ينجح طلب بعد الحذف بقليل. والقاعدة أن **حدث الحذف هو المرجع** لا نتيجة الطلب.

### 3.5 أحداث التطبيق والاشتراك (F-P05)
1. في Partner Dashboard، تحت Webhooks، تُنشأ مجموعة واحدة للتطبيق `public`:
   - العنوان: `POST https://api.intishar.sa/zid/public/app-events`
   - ترويسة مخصصة: `X-Intishar-Hook-Key` بقيمة عشوائية من 48 حرفًا.
   - الأحداث (12): `app.market.application.authorized`، و`.install`، و`.uninstall`، و`.rated`، و`app.market.private.plan.request`، و`app.market.subscription.active`، و`.warning`، و`.suspended`، و`.expired`، و`.renew`، و`.upgrade`، و`.refunded`.
   - زد لا ترسل حدثًا لم يُشترك فيه صراحة ([Subscription and app events](https://docs.zid.sa/subscription-and-app-events-2490915m0)).
2. `VerifyZidAppEventKey` يقارن الترويسة بمقارنة ثابتة الزمن مع المفتاح الحالي والمفتاح السابق (لفترة التدوير). فإن فشلت، يرد بـ 401 ويرسل تنبيه أمان.
3. `AppEventRecorder`:
   - يحسب `dedupe_hash = sha256(raw_body)`، لأن الحمولة بلا معرّف حدث.
   - يدرج الحدث في `zid_app_events` بإدراج يتجاهل التكرار (`ON CONFLICT DO NOTHING`).
   - يرد `200 {"ok":true}` خلال 200 ms، ثم يرسل `ProcessAppEvent` إلى `zid-events`.
4. `AppEventProcessor` يتفرع على `event_name`، **لا على `status`**، لأن `status` مختصر وغير مميز بين الأحداث ([Subscription and app events](https://docs.zid.sa/subscription-and-app-events-2490915m0)):

| الحدث | الإجراء |
|---|---|
| `application.authorized` | تسجيل فقط. يُرسل قبل اكتمال التبادل، فلا يثبت أن التثبيت تم ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)) |
| `application.install` | يؤكد التثبيت. وإن لم يصل الـ callback بعد، يبقى الحدث `pending_installation`، ويُعاد بعد 1 و5 و15 دقيقة |
| `application.uninstall` | التدفق 3.4 |
| `application.rated` | تسجيل، وبريد لفريق المنصة |
| `private.plan.request` | بريد لفريق المنصة لإنشاء خطة خاصة يدويًا |
| `subscription.active`، و`.renew`، و`.upgrade`، و`.refunded` | `ReconcileSubscription` |
| `subscription.warning` | `ReconcileSubscription`، ثم حالة `grace` ولافتة في اللوحة |
| `subscription.suspended` | الاستحقاق يصبح `suspended` |
| `subscription.expired` | الاستحقاق يصبح `expired` |
| `subscription.usage_based.*` | تسجيل وتجاهل، لأن خططنا ليست حسب الاستخدام. وشكل الحمولة مختلف ويحمل `store_id` فقط |

5. **`ReconcileSubscription`**:
   1. يستدعي `GET https://api.zid.sa/v1/market/app/subscription` (النطاق `Subscription.read`) بالرموز الحالية، لأن الحدث إشارة وليس مصدر الحقيقة ([Subscription and app events](https://docs.zid.sa/subscription-and-app-events-2490915m0)).
   2. يحدّث `zid_subscriptions`. ويأخذ `plan_id` و`plan_type` من آخر حدث، لأن الـ endpoint لا يعيدهما.
   3. يحسب الاستحقاق عبر `EntitlementResolver`، ويطلق `EntitlementsChanged` إن تغيّر.
6. **الترتيب**: الأحداث قد تتكرر وتصل بغير ترتيب. فالحالة تُشتق دائمًا من الـ endpoint، لا من آخر حدث.
7. **حالة يجب قبولها**: قد يصل `renew` يحمل خطة **أرخص**، عند استئناف خطة مجمدة (`frozen`). هذا ليس خطأ ([Changing a plan](https://docs.zid.sa/changing-a-plan-2499430m0)).

**حالات الاستحقاق (`tenant_entitlements.state`)**:

| الحالة | المصدر | الأثر المقترح (القرار التجاري في القسم 8) |
|---|---|---|
| `trial` | `plan_type = Free Trial` و`start_date` + مدة التجربة لم تنتهِ | كل مزايا الخطة |
| `active` | `subscription_status = active` أو `renew` | كل مزايا الخطة |
| `grace` | `warning` | المزايا كاملة، ولافتة تجديد |
| `suspended` | `suspended` (بعد يوم من انتهاء الاشتراك) | اللوحة للقراءة، وإيقاف الحملات الجديدة وطلبات البناء. التطبيق لدى المتسوقين يعمل |
| `expired` | `expired` (بعد 5 أيام من انتهاء الاشتراك) | كما في `suspended`، وبعد 14 يومًا يُفعَّل مفتاح الإيقاف `app.service_suspended` (M12) |
| `manual` | مدير المنصة (`pilot` أو استثناء) | حسب الخطة المحددة حتى `valid_until` |
| `none` | لا اشتراك | المعاينة فقط |

وقيمة `plan_type = "Free Trial"` تبقى على الاشتراك بعد تحوله إلى مدفوع. لذلك تُحسب نهاية التجربة من `start_date` ومدة التجربة في `plan_catalog`.

### 3.6 الانتقال من التطبيق الخاص إلى العام
1. عند ربط تثبيت `public` لمتجر له تثبيت `pilot` نشط: التثبيت الخاص يصبح `superseded`.
2. تُحذف webhooks التطبيق الخاص بـ `DELETE /v1/managers/webhooks?original_id={pilot_app_id}` بالرموز الخاصة، لمنع وصول كل حدث مرتين.
3. يُطلب من التاجر، عبر لافتة، حذف التطبيق الخاص من لوحته.
4. الاستحقاق اليدوي يبقى حتى يصل أول `subscription.active` للتطبيق العام، ثم يُلغى.

### 3.7 تسجيل webhooks المتجر
1. `RegisterStoreWebhooks` (على `zid-maintenance`) يعمل:
   - بعد التثبيت أو إعادة التفعيل.
   - عند تدوير بيانات Basic Auth.
   - يدويًا من الإدارة.
2. **عنوان الهدف**: `https://api.intishar.sa/zid/webhooks/{installation_id}/g{generation}/{event}`، حيث `installation_id` معرّف ULID لدينا، والجيل رقم يزيد عند كل تسجيل جديد.
   - **لماذا الجيل**: استعادة webhook معطل تشترط عنوانًا جديدًا ([Webhook Health](https://docs.zid.sa/webhook-health-tracking-2197281m0)).
   - **لماذا اسم الحدث في المسار**: لا يضمن التوثيق أن الحمولة تحمل اسم الحدث (صفحات المخطط تعيد 404، انظر [inbox N-003](../inbox.md)).
   - **لا سر في العنوان**: زد لا تقبل رمزًا في `target_url` ([Test your app](https://docs.zid.sa/test-your-app)).
3. **بيانات Basic Auth لكل تثبيت**: اسم مستخدم بالصيغة `zid-{installation_id}`، وكلمة مرور عشوائية من 32 بايت تُحفظ في الخزنة (`zid_webhook_basic_auth`). وتُحفظ بصمتها `HMAC-SHA256(pepper, "Basic " + base64(user:pass))` في `zid_installations.webhook_auth_hash`، فلا يحتاج التحقق إلى KMS في المسار الساخن.
4. **التنفيذ**:
   1. `GET /v1/managers/webhooks` يقرأ الموجود (النطاق `third_webhook_read`).
   2. إن اختلف عن المجموعة المطلوبة، أو تغيّر الجيل، يحذف الكل بـ `DELETE /v1/managers/webhooks?original_id={zid_app_id}`. لا يوجد في التوثيق endpoint لتعديل webhook واحد ولا لحذفه منفردًا ([Delete Webhook](https://docs.zid.sa/delete-a-webhook-by-original-id)).
   3. ينشئ كل حدث بـ `POST /v1/managers/webhooks` بالحقول `event`، و`target_url`، و`original_id`، و`username`، و`password` ([Create Webhook](https://docs.zid.sa/create-a-webhook)).
   4. يحفظ معرّف كل اشتراك (`id` من نوع UUID) في `zid_webhook_subscriptions`.
   5. إن حدث حذف وإعادة إنشاء، يرسل `ReconcileGap(since = لحظة الحذف)` لتغطية الثواني التي لا تصل فيها أحداث.

**المجموعة المطلوبة (`DesiredWebhooks`)**:

| الحدث | الأولوية | المستهلك | ملاحظة |
|---|---|---|---|
| `order.create` | Must | M06 (تأكيد الطلب)، وM08 (إيرادات التطبيق)، وSPK-01 (التأكيد من الخادم) | بلا شروط |
| `order.status.update` | Must | M06 (إشعار الحالة F-M07)، وM05 | بلا شروط. نريد كل الحالات |
| `order.payment_status.update` | Must | M08، وM06 (رسالة «تم الدفع» للتحويل البنكي) | لم يذكره التكليف، وأُضيف لأن الطلب البنكي يتغير دفعه بعد إنشائه |
| `abandoned_cart.created` | Must | M06 (السلة المتروكة F-M07) | |
| `abandoned_cart.completed` | Must | M06 (إيقاف التسلسل) | |
| `product.update` | Must | ذاكرة المنتجات، وF-S16 لاحقًا (SPK-08) | يُجمَّع بالتأخير (3.8) |
| `product.create`، و`product.publish`، و`product.delete` | Must | ذاكرة المنتجات | أُضيفت لأن التحديث وحده لا يكشف المنتج الجديد ولا المحذوف |
| `category.create`، و`category.update`، و`category.delete` | Must | شجرة التصنيفات | |
| `customer.create` | Must بشرط | M06 (ترحيب، ADR-0008) | يعمل فقط إن مُنح النطاق `customers.read` (القسم 5.5) |
| `customer.update` | Should | M06 (تحديث لغة العميل للاستهداف) | خلف العلم `zid.customer_update_events` |
| `customer.login`، و`customer.merchant.update` | لا | — | لا ميزة تحتاجهما |

### 3.8 استقبال webhooks المتجر ومعالجتها
1. يصل `POST /zid/webhooks/{installation_id}/g{gen}/{event}`.
2. `VerifyStoreWebhookAuth`:
   1. يحمّل التثبيت من ذاكرة Redis مؤقتة (60 ثانية).
   2. إن كان التثبيت مجهولًا: 404.
   3. إن كان محذوفًا أو `superseded`: 200 مع التجاهل، حتى لا يتعطل webhook بلا داعٍ.
   4. يحسب `HMAC` لترويسة `Authorization`، ويقارنها بمقارنة ثابتة الزمن مع البصمة الحالية والسابقة. فإن فشلت: 401، وعدّاد `zid.webhook.auth_failed`، وتنبيه عند تكرارها.
3. **حد الحجم**: 2 MB. وما زاد يُرد عليه بـ 200، ويُسجَّل بالحالة `skipped_oversize`، ويُطلق تنبيه. نتجنب ردًا غير 2xx لأنه يُحتسب فشلًا عند زد.
4. `ReceiptRecorder`:
   1. يحسب `dedupe_key = sha256(event + "\n" + raw_body)`، لأن زد لا توثق معرّف تسليم.
   2. يستخرج `entity_id` من الحمولة (`id` للطلب والمنتج والتصنيف والسلة والعميل).
   3. يدرج في `zid_webhook_receipts` مع تجاهل التكرار. والحمولة الخام تُخزَّن مشفرة (فيها بيانات شخصية).
   4. إن كان مكررًا يرد 200 فورًا.
5. يرسل `ProcessStoreWebhook($receiptId)` إلى `zid-webhooks`، ويرد `200 {"ok":true}`. **الهدف: p95 أقل من 200 ms.**
   - إن تعذر الإرسال لأن Redis معطل، يبقى الإيصال بالحالة `pending_dispatch`، ويرد 200. ثم يعيد إرساله الأمر `zid:receipts:redispatch` كل 5 دقائق. القاعدة: القاعدة أولًا، والطابور ثانيًا.
6. **`ProcessStoreWebhook`**:
   1. يضبط سياق المستأجر (M12).
   2. يختار المعالج حسب الحدث.
   3. كل معالج **يعيد جلب الكيان** عبر `ZidClient` بأولوية `webhook` قبل أي قرار ([ADR-0005](../adr/0005-laravel-modular-monolith-bff.md) البند 4).

| المعالج | إعادة الجلب | المنطق | الحدث الصادر |
|---|---|---|---|
| الطلبات | `GET /v1/managers/store/orders/{id}/view` | يقارن الحالة وحالة الدفع و`updated_at` بآخر قيمة في `zid_order_refs`. وإن لم يتغير شيء لا يُطلق حدث | `OrderCreated`، أو `OrderStatusChanged`، أو `OrderPaymentStatusChanged` |
| السلة المتروكة (إنشاء) | `GET /v1/managers/store/abandoned-carts/{id}` | يحفظ مرجعًا مختصرًا: `phase`، و`source`، و`customer_id`، والإجمالي، ورابط الاسترجاع مشفرًا | `AbandonedCartCreated` |
| السلة المتروكة (اكتمال) | لا | إشارة إيقاف آمنة التكرار | `AbandonedCartCompleted` |
| المنتجات | دفعي: `GET /v1/products/?id__in=…` | `RefreshProducts` مع `#[DebounceFor(30, maxWait: 120)]` لكل مستأجر. يجمع المعرفات ويجلبها 50 في الطلب | `ProductChanged` مع فرق السعر والتوفر، و`ProductDeleted` |
| التصنيفات | `GET /v1/managers/store/categories` كاملة | تأخير 60 ثانية لكل مستأجر | `CategoriesChanged` |
| العملاء | لا، الحمولة إشارة | لا نخزن بيانات العميل، بل `customer_id` فقط | `CustomerCreated` |

7. **الحالات الخاصة أثناء المعالجة**:
   - **404 في إعادة الجلب**: الكيان محذوف. للمنتج يُطلق `ProductDeleted`، وغيره يُتجاهل.
   - **429**: `release(Retry-After + jitter)` دون احتساب محاولة.
   - **5xx**: إعادة بعد 10 ثوانٍ، ثم 60، ثم 300. وبعد 3 محاولات يصبح الإيصال `failed`، ويلتقطه التوفيق الليلي.
8. **الترتيب غير مضمون** ([Test your app](https://docs.zid.sa/test-your-app)). لكن إعادة الجلب تعطي الحالة الحالية دائمًا، فلا تتراجع الحالة بسبب حدث قديم.
9. **أثر الأحداث على حد المعدّل** (تقدير):
   - متجر فيه 1,000 طلب يوميًا يولّد نحو 3,000 حدث طلب، أي متوسط طلبين في الدقيقة.
   - وفي الذروة (300 طلب في الساعة) نحو 15 طلبًا في الدقيقة.
   - استيراد CSV لـ 5,000 منتج يُجمَّع في نحو 100 طلب على مدى دقائق.
   - كل ذلك ضمن حصة الخلفية (3.10).

### 3.9 مراقبة صحة الـ webhooks واستعادتها
1. **المرجع عند زد** ([Webhook Health](https://docs.zid.sa/webhook-health-tracking-2197281m0)):
   - تعيد زد المحاولة 3 مرات (بعد 1 و5 و15 دقيقة).
   - تصبح الحالة `degraded` عند 10 إخفاقات في الساعة، و`broken` عند 30.
   - في حالة `broken` **يتوقف الإرسال وتُحذف الأحداث المعلقة**.
   - الرد 429 لا يُحتسب فشلًا.
2. **فحص دوري**: `zid:webhooks:health` كل ساعة، وكل 5 دقائق للتثبيتات `degraded`. يرسل طلبًا واحدًا لكل متجر بأولوية `sync`: `GET /v1/managers/webhooks/health-summary`، ويحدّث `health_status`.
3. **إن وُجد `broken`**:
   1. `GET /v1/managers/webhooks/broken` يجلب القائمة.
   2. يُزاد `webhook_generation`.
   3. `POST /v1/managers/webhooks/broken/recover` بالجسم `{"webhooks":[{"broken_webhook_id":"…","target_url":"…/g{new}/{event}"}]}`. الاستعادة الجزئية مدعومة، فيُعاد ما فشل في الدورة التالية.
   4. يُرسل `ReconcileGap(since = broken_at - 15 دقيقة)`.
4. **`ReconcileGap`**: يجلب الطلبات المحدثة منذ `since` (List Orders بفلاتر `date_from` و`date_attribute`)، والمنتجات بالترتيب `updated_at`. ثم يشغّل المعالجات نفسها كأن الأحداث وصلت. وهذا آمن لأن المعالجات تقارن بآخر حالة.
5. **بعد أي انقطاع عندنا** (5xx من طرفنا لأكثر من 5 دقائق، يكشفه Sentry): يُشغَّل فحص الصحة فورًا لكل المتاجر بدل انتظار الدورة.
6. **توفيق ليلي** (`zid:reconcile`، الساعة 03:00): طلبات آخر 26 ساعة من List Orders (صفحة أو صفحتان لكل متجر) تُقارن بـ `zid_order_refs`. وكل فرق يُعالج، ويُحتسب في المؤشر `zid.webhook.missed`.
7. **التنبيه**: الحالة `degraded` تحذير في Sentry، والحالة `broken` P1. ورسالة زد البريدية الساعية لا تُستخدم آليًا، بل تبقى مرجعًا يدويًا.

### 3.10 عميل Merchant API ومحدِّد المعدّل
1. **الطلب الموحد**: `ZidClient::for($installation)->get($path, $query, Priority::Webhook)`. لا يوجد في الكود أي استدعاء لـ `Http::` خارج `ZidClient` (اختبار معمارية).
2. **الترويسات**:

| الترويسة | القيمة | متى |
|---|---|---|
| `Authorization` | `Bearer` ثم قيمة `authorization` | كل الطلبات |
| `X-Manager-Token` | قيمة `access_token` | كل الطلبات |
| `Access-Token` | القيمة نفسها | مسارات المنتجات `/v1/products/…` |
| `Store-Id` | `zid_store_id` الرقمي | مسارات المنتجات |
| `Role` | `Manager` | مسارات المنتجات |
| `Accept` | `application/json` | كل الطلبات |
| `Accept-Language` | `en` افتراضيًا، و`ar` أو `all-languages` عند الحاجة | دائمًا. بدونها ترد زد بالعربية، حتى في رسائل الخطأ ([Authorization](https://docs.zid.sa/authorization)) |
| `User-Agent` | `Intishar/{version} (+https://intishar.sa)` | كل الطلبات |

3. **المهلة**: اتصال 3 ثوانٍ. والإجمالي 5 ثوانٍ للطلبات التفاعلية و15 ثانية للخلفية.
4. **الترقيم** (`Paginator`)، وحد أعلى 1,000 صفحة كحماية:
   - الطلبات: `page` و`per_page`.
   - المنتجات: `page` و`page_size`، والاستجابة فيها `next` و`previous` ([List Products](https://docs.zid.sa/retrieve-a-list-of-products)).
   - التصنيفات: قائمة كاملة.
   - الحد الأقصى لـ `page_size` غير موثق. نبدأ بـ 50 ونقيس في ZID-01.
5. **محدِّد المعدّل** (`StoreRateLimiter`): سكربت Lua ذري في Redis، والمفتاح `zid:rl:{zid_app_id}:{zid_store_id}`، لأن حد زد لكل تطبيق ولكل متجر ([Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0)).
   - النموذج leaky bucket: التسرب طلب واحد في الثانية (60 في 60 ثانية)، والسعة 50، أي هامش أمان 10 عن حد زد. والقيم قابلة للتعديل لكل تثبيت، لأن زد تعدّ الرقم «حدًا أدنى لا عقدًا» ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)).
   - **الأولويات** (حد الامتلاء المسموح لكل فئة):

| الأولوية | السقف | أمثلة |
|---|---|---|
| `interactive` | 50 | تفاصيل الطلب للمتسوق عبر M05، وأفعال الإدارة، والـ callback |
| `webhook` | 40 | إعادة جلب الكيانات |
| `sync` | 30 | الاستيراد الأول، والتوفيق، وفحص الصحة |

   - السكربت يعيد `0` (مسموح) أو زمن الانتظار بالملّي ثانية.
     - المهمة في الخلفية **لا تنام**. إن تجاوز الانتظار ثانيتين، تعود إلى الطابور بـ `release(ceil(wait))`.
     - الطلب التفاعلي ينتظر ثانيتين على الأكثر، ثم يرد بـ `503 zid_rate_limited` مع `Retry-After`. وM05 يعرض حينها آخر نسخة مخزنة.
6. **عند 429 من زد**:
   - يقرأ `Retry-After` (بالثواني). ويضع المفتاح `zid:rl:block:{app}:{store}` حتى انتهائه، فتتوقف كل العمليات على هذا المتجر وحده.
   - ثم `release(retry_after + jitter 0..3s)`.
   - إن غابت الترويسة: تراجع أُسّي، 5 ثوانٍ مضروبة في 2^n، بسقف 300 ثانية.
   - المصدر: [Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0) و[Responses](https://docs.zid.sa/responses).
7. **العدالة بين المتاجر**:
   1. لا تنام أي مهمة داخل عامل، فلا يحجز متجر مزدحم العمال.
   2. أعمال الاستيراد مقسّمة صفحة لكل مهمة، فتتداخل مع أعمال المتاجر الأخرى.
   3. التزامن لكل متجر محدود بمهمتين عبر `Redis::funnel("zid:conc:{store}")->limit(2)`.
   4. طابور `zid-sync` منفصل بعمال محدودين، فلا يزاحم `zid-webhooks` (M12).
8. **قاطع الدائرة** (`CircuitBreaker`): إن تجاوزت ردود 5xx أو انقضاء المهلة من `api.zid.sa` نسبة 50% في نافذة دقيقتين (بحد أدنى 20 طلبًا)، يُفتح القاطع 60 ثانية.
   - أعمال الخلفية تعود إلى الطابور.
   - الطلبات التفاعلية ترد بـ `503 zid_unavailable`.
   - بعدها يُختبر الوضع بطلب واحد (half-open).
9. **التسجيل**: لا رموز ولا `code` في أي سجل، وتتولى ذلك طبقة الحجب في M12. ويُسجَّل `X-Request-Id` من رد زد عند الخطأ، لأن الدعم يطلبه ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)).

### 3.11 المزامنة: ما يُنسخ وما يُجلب عند الطلب

| البيانات | الأسلوب | المصدر | التحديث | السبب |
|---|---|---|---|---|
| هوية المتجر (المعرّف، والاسم، والرابط، والبريد، والهاتف، والمنطقة الزمنية) | نسخة | `GET /v1/managers/account/store` | عند التثبيت، ويوميًا، وعند الطلب | التوجيه، والإعداد، وتغيّر النطاق المخصص |
| العلامة (الشعار بلغتين، والأيقونة، والغلاف، وألوان الأزرار، والثيم) | لقطة (snapshot) | `GET /v1/managers/account/store/branding` ([Branding](https://docs.zid.sa/branding-33664604e0)) | عند التثبيت، وعند «أعد الاستيراد» | F-M01. يستوردها M14 وM11 إلى الهوية، ثم يملكها التاجر |
| اللغات والعملات والدولة | نسخة | `…/store/localization` | عند التثبيت، ويوميًا | افتراضات اللغة (M02) |
| التشغيل (الصيانة، والمتجر مغلق، وطرق دخول العملاء، و`has_mobile_app`) | نسخة | `…/store/operations` | عند التثبيت، وكل 6 ساعات | لافتة «المتجر مغلق» (M01)، وفحص تعارض مع تطبيق آخر |
| حسابات التواصل | نسخة | `…/store/social` | عند التثبيت، ويوميًا | كتل الثقة، والتواصل |
| شجرة التصنيفات | نسخة كاملة | `GET /v1/managers/store/categories` | عند التثبيت، وأحداث `category.*`، وليلًا | منتقي `category_strip` في المحرر، والتحقق من الروابط (M07) |
| ذاكرة المنتجات (إسقاط مختصر) | نسخة جزئية | `GET /v1/products/` مع `extended=true` و`ordering=created_at` ([List Products](https://docs.zid.sa/retrieve-a-list-of-products)) | الاستيراد الأول، وأحداث `product.*`، وتوفيق ليلي | منتقي المنتجات، وتعبئة الكتل في المعاينة، وفروق F-S16 لاحقًا |
| الطلبات | **عند الطلب**، مع مرجع مختصر | `…/orders/{id}/view` | لا نسخة كاملة | تقليل البيانات الشخصية (PDPL). ومرجع الحالة لمنع تكرار الإشعارات ولإيرادات التطبيق |
| تفاصيل الطلب للمتسوق (F-S10) | عند الطلب عبر M05، مع تخزين 60 ثانية لكل طلب | `…/orders/{id}/view` | — | M05 يتحقق من الملكية (SPK-07) |
| السلال المتروكة | عند الحدث، مع مرجع مختصر | `…/abandoned-carts/{id}` | — | آلية F-M07 |
| العملاء | لا نسخة | — | — | M06 يربط `customer_id` بالجهاز عند الدخول |
| الاشتراك | نسخة | `/v1/market/app/subscription` | الأحداث، ويوميًا | الاستحقاقات |

**قواعد ذاكرة المنتجات**:
- الأسعار في التطبيق تأتي من Storefront API لحظيًا (شاملة الضريبة وخاصة بالعميل). الذاكرة هنا للمحرر والمعاينة وكبديل عند الفشل. ولا تُعرض للمتسوق كسعر نهائي إلا عبر عقد M11 وM03.
- **الاستيراد الأول**:
  1. التصنيفات، ثم أول 200 منتج (4 صفحات)، ثم الحدث `CatalogReady(partial)`، فيبدأ M14 المعاينة.
  2. ثم البقية بالأولوية `sync`، صفحة لكل مهمة.
  3. متجر بـ 10,000 منتج يحتاج نحو 200 طلب، أي نحو 7 دقائق بحصة 30 طلبًا في الدقيقة.
- **لا تُحذف المنتجات حذفًا نهائيًا**: `deleted_at` حتى التوفيق التالي، لأن حدث الحذف قد يسبق حدث التعديل.

### 3.12 اختبار المتجر التطويري (تشغيلي)
1. **مرة واحدة** (ZID-01): إنشاء التطبيقات الأربعة (2.2)، وتسجيل النطاقات الحرفية كما تظهر في اللوحة، وتسجيل عناوين الـ webhooks والأحداث.
2. **محليًا**: الأمر `php artisan zid:simulate {event} --installation=…` يرسل حمولات من `tests/Fixtures/zid/` إلى المسار المحلي ببيانات Basic Auth صحيحة. والعميل يعمل على `Http::fake` بتسجيلات حقيقية من المتجر التطويري.
3. **على staging**، بالتطبيق `staging` والمتجر التطويري، قائمة يدوية قبل كل إصدار يمس M10:
   - تثبيت جديد، ثم حذف، ثم إعادة تثبيت.
   - رفض الموافقة.
   - تعطيل التطبيق ثم تفعيله (يصدر رموزًا جديدة).
   - طلب بكل طريقة دفع متاحة، وتغيير حالته في كل المراحل.
   - سلة متروكة ثم اكتمالها.
   - تعديل منتج وتصنيف.
   - كل حدث اشتراك عبر «إرسال تجريبي» في سجل الـ webhooks في Partner Dashboard.
   - إيقاف المسار عمدًا حتى يصبح الـ webhook `broken`، ثم التحقق من الاستعادة.
4. **قبل التقديم للمراجعة**: قائمة [Test your app](https://docs.zid.sa/test-your-app) كاملة على `public` بعناوين prod.

## 4. نموذج البيانات

كل الجداول على الخادم (PostgreSQL). لا شيء من M10 يُخزَّن على الجهاز. والجداول التي فيها `tenant_id` تستخدم `BelongsToTenant` من M12. المعرّفات الداخلية ULID (`char(26)`).

| الجدول | الحقول الأساسية | الفهارس والقيود |
|---|---|---|
| `zid_apps` | `id`، و`key` (`public` أو `pilot` أو `staging` أو `local`)، و`kind` (`public` أو `private`)، و`zid_app_id` (int)، و`client_id`، و`client_secret_ref` (مرجع في Secret Manager)، و`redirect_uri`، و`app_event_key_hashes` (jsonb: الحالي والسابق)، و`is_active` | فريد (`key`) |
| `zid_oauth_attempts` | `id`، و`zid_app_id`، و`state_hash`، و`status` (`started` أو `completed` أو `failed` أو `expired`)، و`failure_reason`، و`store_uuid`، و`ip_hash`، و`created_at`، و`completed_at` | (`status`, `created_at`)، ويُحذف بعد 30 يومًا |
| `zid_installations` | `id`، و`tenant_id`، و`zid_app_id`، و`zid_store_id` (bigint)، و`zid_store_uuid` (uuid)، و`store_url`، و`status` (`active` أو `consent_pending` أو `store_blocked` أو `revoked` أو `uninstalled` أو `superseded`)، و`blocked_reason`، و`token_secret_id`، و`token_generation`، و`access_expires_at`، و`refresh_token_expires_at`، و`refresh_due_at`، و`last_refreshed_at`، و`last_refresh_error`، و`webhook_generation`، و`webhook_auth_secret_id`، و`webhook_auth_hash`، و`webhook_auth_hash_prev`، و`webhooks_registered_at`، و`health_status`، و`last_webhook_at`، و`rate_limit_capacity` (افتراضي 50)، و`installed_at`، و`uninstalled_at` | فريد (`zid_app_id`, `zid_store_uuid`)، وفهرس (`status`, `refresh_due_at`)، وفهرس (`tenant_id`) |
| `zid_app_events` | `id`، و`zid_app_id`، و`event_name`، و`store_uuid`، و`store_id`، و`dedupe_hash` (char 64)، و`payload` (jsonb، فيها بريد التاجر وهاتفه)، و`status` (`received` أو `processed` أو `pending_installation` أو `ignored` أو `failed`)، و`attempts`، و`error`، و`received_at`، و`processed_at` | فريد (`dedupe_hash`)، وفهرس (`store_uuid`, `received_at`)، والاحتفاظ سنة |
| `zid_subscriptions` | `id`، و`tenant_id`، و`installation_id`، و`zid_plan_id`، و`plan_name`، و`plan_type`، و`subscription_status`، و`start_date`، و`end_date`، و`amount_paid`، و`last_event_name`، و`last_event_at`، و`reconciled_at`، و`raw` (jsonb) | فريد (`installation_id`) |
| `plan_catalog` | `code` (pk، مثل `growth`)، و`name` (jsonb: ar وen)، و`zid_plan_ids` (int[])، و`trial_days`، و`features` (jsonb: قائمة مفاتيح)، و`limits` (jsonb، مثل `{"push_campaigns_per_month":30,"builds_per_month":4}`)، و`is_active` | فهرس GIN على `zid_plan_ids` |
| `tenant_entitlements` | `tenant_id` (pk)، و`plan_code`، و`state`، و`source` (`zid` أو `manual`)، و`features`، و`limits`، و`valid_until`، و`computed_at`، و`manual_by_admin_id`، و`manual_reason` | — |
| `zid_webhook_subscriptions` | `id`، و`installation_id`، و`zid_webhook_id` (uuid)، و`event`، و`target_url`، و`generation`، و`health_status`، و`consecutive_failures`، و`broken_at`، و`last_success_at`، و`created_at`، و`deleted_at` | فريد (`zid_webhook_id`)، وفهرس (`installation_id`, `event`) |
| `zid_webhook_receipts` | `id`، و`tenant_id`، و`installation_id`، و`event`، و`dedupe_key` (char 64)، و`entity_type`، و`entity_id`، و`payload_ciphertext` (bytea)، و`status` (`pending_dispatch` أو `queued` أو `processed` أو `skipped_oversize` أو `failed`)، و`attempts`، و`error_code`، و`received_at`، و`processed_at` | فريد (`dedupe_key`)، وفهرس (`status`, `received_at`)، وفهرس (`tenant_id`, `entity_type`, `entity_id`)، والاحتفاظ 14 يومًا |
| `zid_order_refs` | `tenant_id`، و`zid_order_id` (bigint)، و`zid_customer_id`، و`order_status`، و`payment_status`، و`source`، و`source_code`، و`total` (numeric 14,2)، و`currency_code`، و`zid_created_at`، و`zid_updated_at`، و`last_event_at` | فريد (`tenant_id`, `zid_order_id`)، وفهرس (`tenant_id`, `zid_created_at`) |
| `zid_abandoned_cart_refs` | `tenant_id`، و`zid_cart_id`، و`zid_customer_id`، و`phase`، و`source`، و`cart_total`، و`recovery_url_ciphertext`، و`status` (`open` أو `completed`)، و`created_at`، و`completed_at` | فريد (`tenant_id`, `zid_cart_id`)، والاحتفاظ 30 يومًا |
| `zid_products` | `tenant_id`، و`zid_product_id` (varchar 64)، و`sku`، و`slug`، و`name` (jsonb)، و`price` (numeric 12,2)، و`sale_price`، و`currency_code`، و`is_published`، و`in_stock`، و`quantity`، و`is_infinite`، و`has_variants`، و`main_image_url`، و`images` (jsonb، 5 صور على الأكثر)، و`category_ids` (bigint[])، و`zid_updated_at`، و`synced_at`، و`deleted_at` | فريد (`tenant_id`, `zid_product_id`)، وفهرس GIN بـ `pg_trgm` على `name->>'ar'` و`name->>'en'`، وGIN على `category_ids` |
| `zid_categories` | `tenant_id`، و`zid_category_id` (bigint)، و`parent_id`، و`name` (jsonb)، و`slug`، و`image_url`، و`cover_url`، و`is_published`، و`sort_order`، و`products_count`، و`synced_at` | فريد (`tenant_id`, `zid_category_id`) |
| `zid_store_profiles` | `tenant_id` (pk)، و`store` و`branding` و`localization` و`operations` و`social` (jsonb لكل منها)، و`fetched_at` (jsonb لكل قسم) | — |
| `zid_sync_runs` | `id`، و`tenant_id`، و`kind` (`initial_catalog` أو `categories` أو `profile` أو `nightly` أو `gap`)، و`status`، و`cursor` (jsonb)، و`pages_done`، و`items_upserted`، و`started_at`، و`finished_at`، و`error` | فهرس (`tenant_id`, `kind`, `started_at`) |

**الأسرار** (في `tenant_secrets` من M12، لا في جداول M10):
- `zid_oauth_tokens`، وقيمته JSON بالحقول `authorization` و`access_token` و`refresh_token` و`expires_in` و`issued_at`.
- `zid_webhook_basic_auth`، وقيمته JSON بالحقلين `username` و`password`.

**Redis** (مؤقت، ليس مصدر حقيقة):
- `zid:oauth:state:*`
- `zid:rl:*` و`zid:rl:block:*`
- `zid:conc:*`
- `zid:refresh:*` و`zid:install:*` (أقفال)
- `zid:cb:*` (قاطع الدائرة)
- `zid:inst:{id}` (ذاكرة مؤقتة للتثبيت)

## 5. الواجهات والعقود

### 5.1 مسارات زد (عامة، خارج `/api`)

| المسار | الطريقة | الحماية | الاستجابة |
|---|---|---|---|
| `/zid/{app_key}/install` | GET | لا (يولّد `state`) | 302 إلى `oauth.zid.sa` |
| `/zid/{app_key}/callback` | GET | `state` والـ cookie | 302 إلى اللوحة، أو صفحة خطأ في اللوحة |
| `/zid/{app_key}/app-events` | POST | `X-Intishar-Hook-Key` | `200 {"ok":true}` |
| `/zid/webhooks/{installation_id}/g{generation}/{event}` | POST | Basic Auth لكل تثبيت | `200 {"ok":true}` |

**مثال حمولة حدث تطبيق** (من [Subscription and app events](https://docs.zid.sa/subscription-and-app-events-2490915m0)):

```json
{
  "app_id": 1292,
  "store_id": 507530,
  "store_uuid": "d78468cd-4b44-4fee-a00d-76561f35787c",
  "store_url": "https://wyatt.com.sa/",
  "plan_name": "النمو",
  "plan_id": 904,
  "plan_type": "Paid",
  "status": "active",
  "start_date": "2025-02-21T08:05:29.000000Z",
  "end_date": "2025-03-22T08:05:29.000000Z",
  "amount_paid": 79.01,
  "old_plan_name": null,
  "merchant_email": "info@example.sa",
  "merchant_phone_no": "966554349999",
  "event_name": "app.market.subscription.active",
  "payment_date": "2025-02-21T08:05:29.000000Z"
}
```

**استجابة تبادل الرمز** (من [Authorization](https://docs.zid.sa/authorization)):

```json
{
  "token_type": "Bearer",
  "expires_in": 94608000,
  "authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "access_token": "eyJpdiI6Ii8vZ...",
  "refresh_token": "def5020035c1f..."
}
```

### 5.2 واجهات لوحة التاجر (`/api/v1/tenants/{tenant}`، جلسة Sanctum، وسياق المستأجر من M12)

المسارات تطابق جدول M15 (القسم 5.2 فيه): `connection`، و`reauthorize`، و`reimport`، و`subscription`، و`catalog`.

**`GET /api/v1/tenants/{tenant}/connection`**: حالة الربط.

```json
{
  "data": {
    "status": "active",
    "store": {
      "name": "متجر الورد",
      "url": "https://alward.sa",
      "zid_store_id": 507530
    },
    "app": "public",
    "consent": { "pending": false, "missing_features": [] },
    "tokens": {
      "refreshed_at": "2026-11-10T09:12:00Z",
      "refresh_due_at": "2027-09-06T09:12:00Z"
    },
    "webhooks": {
      "health": "healthy",
      "last_received_at": "2026-11-10T11:58:31Z"
    },
    "sync": {
      "profile_at": "2026-11-10T09:13:02Z",
      "categories_at": "2026-11-10T09:13:05Z",
      "products": { "status": "running", "cached": 1450, "total_estimate": 8100 }
    },
    "entitlements": {
      "plan_code": "growth",
      "state": "trial",
      "valid_until": "2026-12-10T09:12:00Z"
    },
    "actions": []
  }
}
```

قيم `actions` الممكنة تخبر M15 بما يعرضه للتاجر:
- `reactivate_app_in_zid`: تغيّرت النطاقات، أو مات الـ refresh token.
- `renew_zid_store_plan`: اشتراك المتجر في زد منتهٍ.
- `complete_zid_store_setup`
- `verify_store_mobile`
- `remove_pilot_app`

**`POST /api/v1/tenants/{tenant}/connection/reimport`**: الجسم `{"sections":["profile","categories","products"]}`، مع `Idempotency-Key`.
- يعيد `202` ومعرفات `zid_sync_runs`.
- الحد مرة كل 10 دقائق لكل مستأجر. وإن تجاوزه يعيد `429` بالرمز `rate_limited`.

**`POST /api/v1/tenants/{tenant}/connection/reauthorize`**: زد لا تتيح بدء إعادة الموافقة من جهتنا. فالتاجر يعطّل التطبيق ويفعّله من لوحته ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)). لذلك يعيد الـ endpoint التعليمات والرابط:

```json
{
  "data": {
    "method": "reactivate_in_zid",
    "zid_app_url": "https://web.zid.sa/market/app/1292",
    "steps": { "ar": ["افتح التطبيق في سوق زد", "اضغط تعطيل ثم تفعيل"], "en": ["Open the app in Zid App Market", "Deactivate, then activate"] },
    "subscription_unaffected": true
  }
}
```

فإن كان السبب أن الـ refresh token ميت والتطبيق مثبت، يعيد `method: "reinstall_from_zid"` بالرابط نفسه.

**`GET /api/v1/tenants/{tenant}/subscription`**: يعيد `{"data":{"plan_code":"growth","plan_name":{"ar":"النمو","en":"Growth"},"state":"trial","source":"zid","valid_until":"2026-12-10T09:12:00Z","features":{…},"limits":{…}}}`.

**`GET /api/v1/tenants/{tenant}/catalog/products?q=عطر&category_id=1261106&page[cursor]=…&page[size]=24`**: منتقي المنتجات في المحرر، من الذاكرة.

```json
{
  "data": [
    {
      "id": "8f1c2c1e-6c0b-4c7e-9d0a-1a2b3c4d5e6f",
      "name": { "ar": "عطر العود", "en": "Oud Perfume" },
      "price": "149.00",
      "sale_price": "119.00",
      "currency": "SAR",
      "in_stock": true,
      "image_url": "https://media.zid.store/…/oud.jpg",
      "is_published": true
    }
  ],
  "meta": { "next_cursor": "eyJpZCI6Ij…", "page_size": 24, "cache_synced_at": "2026-11-10T11:40:00Z" }
}
```

**`GET /api/v1/tenants/{tenant}/catalog/categories`**: الشجرة كاملة بالحقول `id` و`name` و`children` و`image_url` و`is_published`.

### 5.3 واجهات الإدارة (`/api/v1/admin`، حارس الإدارة من M12، F-P01)

الأسماء تطابق جدول الإدارة في M15: `/admin/connections` و`/admin/webhooks`.

| المسار | الطريقة | الدور الأدنى | الوصف |
|---|---|---|---|
| `/connections?status=&health=&q=&page[number]=&page[size]=` | GET | `support` | جدول التثبيتات بترقيم صفحات |
| `/connections/{id}` | GET | `support` | التفاصيل: تواريخ الرموز (لا القيم)، وسجل التجديد، والاشتراكات وصحتها، وعدد الإيصالات في 24 ساعة حسب الحالة، و429 في 24 ساعة، والاستحقاق |
| `/connections/{id}/refresh-tokens` | POST | `ops` | تجديد فوري، ويُسجَّل في التدقيق |
| `/connections/{id}/webhooks/re-register` | POST | `ops` | إعادة تسجيل بجيل جديد |
| `/connections/{id}/sync` | POST | `ops` | الجسم `{"sections":[…]}` |
| `/webhooks/receipts?connection={id}&status=failed` | GET | `ops` | الإيصالات الفاشلة دون الحمولة |
| `/webhooks/receipts/{id}/retry` | POST | `ops` | إعادة معالجة إيصال |
| `/tenants/{tenant}/entitlements` | PUT | `ops` | الجسم `{"plan_code":"growth","valid_until":"2027-01-31","reason":"تاجر تجريبي pilot"}` |
| `/webhooks` | GET | `support` | ملخص الأسطول للربط والـ webhooks (المثال أدناه) |

```json
{
  "data": {
    "installations": { "active": 41, "consent_pending": 2, "store_blocked": 1, "uninstalled_30d": 3 },
    "webhooks": { "healthy": 39, "degraded": 1, "broken": 1 },
    "tokens": { "refresh_due_7d": 0, "refresh_failing": 0, "refresh_token_expiring_30d": 0 },
    "rate_limit": { "throttled_requests_24h": 112, "zid_429_24h": 3 },
    "receipts": { "failed_24h": 4, "p95_ack_ms_24h": 87, "p95_process_s_24h": 6.4 }
  }
}
```

الأخطاء بصيغة RFC 9457 الموحدة من M12 (رموز snake_case). ورموز M10:
- `zid_rate_limited`
- `zid_unavailable`
- `zid_consent_pending`
- `zid_store_blocked`
- `zid_not_connected`
- `zid_scope_missing`
- `zid_entity_not_found`

### 5.4 العقود مع الوحدات الأخرى (PHP، في `Modules\Commerce`)

| العقد | المستهلك | الطرائق |
|---|---|---|
| `CommerceOrders` | M05، وM08 | `getOrder(TenantId, string $orderId, Priority): OrderData`، و`listOrdersUpdatedSince(TenantId, DateTimeImmutable): iterable` |
| `CommerceCatalog` | M11، وM03، وM14، وM07 | `products(TenantId, array $ids): Collection`، و`searchProducts(TenantId, string $q, int $limit)`، و`categoryTree(TenantId): CategoryNode` |
| `StoreProfileProvider` | M14، وM11، وM02، وM07 | `snapshot(TenantId): StoreProfileSnapshot`، و`refresh(TenantId, array $sections)` |
| `EntitlementsProvider` | M12 (الأعلام)، وM06، وM13، وM15 | `for(TenantId): EntitlementSet`، فيه `has(string $feature)` و`limit(string $key)` و`state()` |

**الأحداث الصادرة** (Laravel events بعد commit، والمستمعون في الوحدات المستهلكة على طوابيرها):

| الحدث | الحقول | المستهلك |
|---|---|---|
| `StoreConnected`، و`StoreReconnected`، و`StoreDisconnected` | `tenant_id`، و`platform`، و`external_store_id`، و`reason` | M12، وM14، وM06، وM13 |
| `EntitlementsChanged` | `tenant_id`، و`old_state`، و`new_state`، و`plan_code` | M12، وM15، وM06، وM13 |
| `OrderCreated`، و`OrderStatusChanged`، و`OrderPaymentStatusChanged` | انظر المثال أدناه | M06، وM05، وM08 |
| `AbandonedCartCreated`، و`AbandonedCartCompleted` | `tenant_id`، و`cart_id`، و`customer_id`، و`phase`، و`source`، و`total`، و`recovery_url` (للخادم فقط) | M06 |
| `CustomerCreated` | `tenant_id`، و`customer_id`، و`created_at` | M06 |
| `ProductChanged`، و`ProductDeleted` | `tenant_id`، و`product_id`، و`price` (قديم وجديد)، و`in_stock` (قديم وجديد)، و`is_published` | M11 (إبطال الذاكرة)، وM06 (F-S16 لاحقًا) |
| `CategoriesChanged` | `tenant_id` | M11، وM07 |
| `StoreProfileChanged` | `tenant_id`، و`sections`، و`domain_changed` | M07، وM11، وM01 (عبر M11) |
| `CatalogReady` | `tenant_id`، و`completeness` (`partial` أو `full`) | M14 |

مثال `OrderStatusChanged`:

```json
{
  "event": "commerce.order.status_changed",
  "event_id": "01JCF3Q8Z6W2V9M4T7K1N5R8XA",
  "occurred_at": "2026-11-10T12:01:44Z",
  "tenant_id": "01JC9W3T5A7B9C1D3E5F7G9H1J",
  "platform": "zid",
  "order": {
    "id": "48211033",
    "customer_id": "9134221",
    "status_old": "preparing",
    "status_new": "inDelivery",
    "payment_status": "paid",
    "source": "Store App",
    "total": "359.00",
    "currency": "SAR"
  }
}
```

### 5.5 النطاقات (Scopes): الحد الأدنى ومبرر كل نطاق

قاعدة زد: كل نطاق يجب أن تستخدمه ميزة موجودة يوم التقديم، وإلا يُرفض التطبيق. وإضافة نطاق بعد الإطلاق تضع كل التثبيتات في حالة «موافقة معلقة» (`403 APP_PERMISSIONS_PENDING_APPROVAL`) حتى يعطّل كل تاجر التطبيق ثم يفعّله ([Justifying your scopes](https://docs.zid.sa/justifying-your-scopes-2490953m0)، [OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)). لذلك تُحسم القائمة قبل التقديم الأول.

| مجموعة النطاق (المعرّف كما في التوثيق) | المستوى | الميزة التي تستخدمه | Endpoints | القرار |
|---|---|---|---|---|
| Store Core Details (`third_store_details_read`) | Read | تعريف المتجر بعد OAuth، واستيراد الشعار والألوان واللغات (F-M01) | `/v1/managers/account/store` و`/branding` و`/localization` و`/operations` و`/social` | **مطلوب** |
| Products (`products.read`) | Read | ذاكرة المنتجات والتصنيفات للمحرر والكتل، وإعادة جلب المنتج عند الحدث | `/v1/products/`، و`/v1/managers/store/categories` | **مطلوب** |
| Orders (`orders.read`) | Read | إشعارات حالة الطلب (F-M07)، وتفاصيل الطلب وتتبعه (F-S10)، وإيرادات التطبيق (F-M11) | `/v1/managers/store/orders…` | **مطلوب** (حساس) |
| Abandoned Carts (`abandoned_carts.read`) | Read | إشعار السلة المتروكة برابط الاسترجاع (F-M07) | `/v1/managers/store/abandoned-carts/{id}` | **مطلوب** (حساس) |
| Webhooks (`third_webhook_read` و`third_webhook_write`) | Read & Write | تسجيل أحداث الطلب والسلة والمنتج والتصنيف، وفحص الصحة والاستعادة | `/v1/managers/webhooks…` | **مطلوب** |
| Subscription (`Subscription.read`) | Read | التحقق من الاشتراك قبل تفعيل المزايا (F-P05) | `/v1/market/app/subscription` | **مطلوب** (التطبيق العام فقط) |
| Customers (`customers.read`) | Read | الاشتراك في `customer.create` لآلية الترحيب (ADR-0008) | webhooks العملاء | **قرار للمشرف**: يُطلب فقط إن كانت آلية الترحيب في M06 ستُسلَّم مع الإطلاق |
| OneSignal Store Settings (`third_one_signal_write`) | Write | الروابط العامة عبر ملفات AASA التي تخدمها زد | `/v1/managers/store/settings/one-signal` | **ينتظر SPK-10**. إن نجحت التجربة يُضاف قبل التقديم الأول |
| Account (`account.read`)، وAccount Identity (`third_account_identity_read`) | — | — | — | **مرفوض**: بريد المتجر من Store Details يكفي، والحساب حساس |
| Embedded apps (`embedded_apps_tokens_write`) | — | — | — | **مرفوض في الإصدار الأول**: طلبه دون تجربة مضمّنة سبب شائع للرفض ([Test your app](https://docs.zid.sa/test-your-app)) |
| Coupons، وOrder Create، وPayments، وCustomers write | — | — | — | **مرفوض**: لا ميزة تحتاجها |

**نص المبرر** في Partner Dashboard (بين 50 و200 حرف، يسمّي المزايا لا النطاقات):

> Imports store branding; caches products/categories for the app editor; sends order-status and abandoned-cart push; verifies subscription.

**تنبيه**: التوثيق يكتب المعرّفات بأشكال مختلفة (`products.read` و`Product.read` و`third_*`). المعرّف الحرفي يُسجَّل من اللوحة في ZID-01، ويُحدَّث هذا الجدول.

## 6. الحالات الحدية والأخطاء

### 6.1 الحالات الحدية

| الحالة | السلوك المتوقع |
|---|---|
| إعادة تحميل صفحة الـ callback (الرمز مستعمل) | `state` مستهلك. إن اكتمل التثبيت من المتصفح نفسه خلال 10 دقائق يُحوَّل إلى اللوحة، وإلا صفحة «ابدأ التثبيت من جديد». **لا يُعاد إرسال الرمز** |
| `state` غير موجود أو منتهٍ أو لا يطابق الـ cookie | 403 بصفحة خطأ في اللوحة، وتسجيل أمني. لا تبادل للرمز |
| التاجر رفض الموافقة | لا callback. المحاولة تنتهي بالحالة `expired`، ولا مستأجر ولا تثبيت |
| `App installation is not allowed` (لا اشتراك) | صفحة توضح «اشترك في خطة من سوق زد ثم فعّل». والسبب يُسجَّل في المحاولة |
| مهلة الشبكة أثناء التبادل | لا إعادة بالرمز نفسه. صفحة فيها زر يبدأ التدفق من `/install` |
| callback مزدوج للمتجر نفسه في اللحظة نفسها | القفل `zid:install:{uuid}`، فالثاني ينتظر ثم يحدّث التثبيت نفسه. لا مستأجر مكرر |
| إعادة التثبيت بعد الحذف | المستأجر نفسه (بمعرّف المتجر الموثق من OAuth، لا بالبريد)، ورموز جديدة، وتسجيل webhooks بجيل جديد، واسترجاع الإعداد إن كان داخل مدة الاحتفاظ |
| إعادة التفعيل بعد إضافة نطاق | الرموز تُستبدل، و`consent_pending` يُمسح، والمزايا المتأثرة تعود |
| `403 APP_PERMISSIONS_PENDING_APPROVAL` في بعض المسارات | التثبيت `consent_pending`، والميزة المعنية تتعطل وحدها، ولافتة للتاجر بالخطوات. **لا إعادة محاولة مجدولة** |
| الرد نفسه في كل المسارات | إيقاف كل أعمال المتجر حتى يعيد التاجر التفعيل |
| 401 برمز `null` ونص يذكر نطاقًا | خطأ إعدادات من جهتنا. لا تجديد ولا إعادة. تنبيه P1، والميزة تتعطل |
| 401 يبقى بعد تجديد ناجح | التطبيق محذوف: التدفق 3.4 |
| الـ refresh token ميت والوصول صالح | تنبيه P1، ولافتة «أعد تفعيل التطبيق»، وبريد للتاجر. المهلة حتى `access_expires_at` |
| `403 Subscription is not active` (اشتراك التاجر في زد نفسها) | `store_blocked` بالسبب `zid_plan_inactive`، وإيقاف المزامنة 6 ساعات ثم إعادة الفحص، ولافتة |
| `Store readiness isn't completed` أو `Store mobile isn't verified` | `store_blocked` بالسبب المناسب، ولافتة بالخطوة المطلوبة في لوحة زد |
| متجر عرض (Demo) | فشل تسجيل الـ webhooks برسالة واضحة في الإدارة: «استخدم متجرًا تطويريًا» |
| تغيّر نطاق المتجر (`store.url`) | مزامنة الملف تكشفه، فيصدر `StoreProfileChanged(domain_changed=true)`، وM11 وM01 يحدّثان العنوان الأساسي للـ Storefront |
| حدث تطبيق يصل قبل الـ callback | `pending_installation`، وإعادة بعد 1 و5 و15 دقيقة، ثم `failed` مع تنبيه |
| webhook مكرر | `dedupe_key` يرفضه، ورد 200 |
| أحداث بغير ترتيب | إعادة الجلب تعطي الحالة الحالية، ولا يُطلق حدث إن لم تتغير الحالة |
| الكيان محذوف عند إعادة الجلب (404) | المنتج: `ProductDeleted`. غيره: يُتجاهل ويُسجَّل |
| حمولة أكبر من 2 MB | 200 مع `skipped_oversize` وتنبيه |
| فشل Basic Auth | 401، وعدّاد، وتنبيه إن زاد عن 10 في الساعة لتثبيت واحد |
| انقطاع خادمنا أكثر من ساعة | زد تعطّل الـ webhooks وتحذف المعلّق، فتُشغَّل الاستعادة (3.9) ثم مطابقة الفجوة |
| تعديل جماعي لآلاف المنتجات | التأخير يجمع الأحداث، والجلب 50 في الطلب، بأولوية `webhook` ثم `sync` |
| عاصفة 429 | حجب على مستوى المتجر حتى `Retry-After`، والمتاجر الأخرى لا تتأثر |
| طلب بعملة غير عملة المتجر | يُحفظ `total` بعملة الطلب مع `currency_code`. والتحويل مسؤولية M08 حسب سعر الصرف في الطلب ([Order schema](https://docs.zid.sa/webhook-events-order)) |
| بريد placeholder في حمولة الطلب | لا يُستخدم للتواصل أبدًا. ونحن لا نخزن البريد أصلًا |
| حدث `renew` بخطة أرخص (استئناف خطة مجمدة) | يُقبل. الاستحقاق يتبع الـ endpoint |
| `subscription` فارغة في الـ endpoint (`[]`) | الحالة `none`. التثبيت وحده لا يعني اشتراكًا |
| تثبيت `pilot` و`public` للمتجر نفسه | التدفق 3.6. لا تكرار للأحداث |
| فشل فك تشفير الرموز (خلل مفاتيح) | تنبيه حرج، والتثبيت يتوقف دون حذف. لا محاولة تبادل جديدة |
| زد معطلة (5xx واسع) | قاطع الدائرة، وإعادة الأعمال، وM05 يعرض المخزن |
| تطبيق آخر للمتجر (`has_mobile_app = true`) | تحذير في الإعداد (M14)، لأنه قد يتنافس على إعدادات OneSignal وAASA (SPK-10) |

### 6.2 تصنيف الأخطاء (Error taxonomy)

كل استثناء من `ZidClient` يرث `ZidException`، ويحمل `httpStatus` و`zidCode` (أي `message.code`، والتفرع عليه لا على الوصف) و`retryable` و`zidRequestId`.

| الفئة | المؤشر من زد | الاستثناء | إعادة المحاولة | الإجراء |
|---|---|---|---|---|
| حد المعدّل | 429، `MSG_HIDDEN` | `ZidRateLimited` | نعم، بعد `Retry-After` | حجب المتجر، و`release` |
| انتهاء الجلسة | 401، `ERROR_SESSION_INVALID` «Login session expired» | `ZidTokenExpired` | تجديد مرة واحدة ثم إعادة | إن بقي 401 فهو حذف (3.4) |
| رمز ملغى | 401 «The authentication token has been revoked» | `ZidTokenRevoked` | لا | التدفق 3.4 |
| رمز تالف | 401 «Invalid authentication» | `ZidTokenCorrupted` | لا | تنبيه حرج (خلل تخزين) |
| نطاق ناقص | 401، `code = null`، ونص يذكر scope | `ZidScopeMissing` | **لا، ولا تجديد** | تنبيه P1، وتعطيل الميزة |
| موافقة معلقة | 403 `APP_PERMISSIONS_PENDING_APPROVAL` | `ZidConsentPending` | لا | `consent_pending`، ولافتة |
| نطاق أُزيل | 403 `APP_PERMISSION_REMOVED` | `ZidScopeRemoved` | لا | تنبيه لنا لا للتاجر |
| حالة حساب التاجر | 403 `ERROR_POPUP_OK` أو `ERROR_POPUP_BACK` (اشتراك زد، أو جاهزية، أو تحقق الجوال، أو Permission Denied، أو demo) | `ZidStoreBlocked` | بعد 6 ساعات | `store_blocked` مع السبب |
| غير موجود | 404 | `ZidNotFound` | لا | حسب المعالج |
| متجر مفقود | 404 `ERROR_SESSION_INVALID` «Store not found» | `ZidStoreMissing` | لا | تذكرة لزد، والتثبيت `revoked` |
| تحقق | 422، و`status = validation_error`، و`message.validations[]` | `ZidValidationFailed` | لا | تسجيل الحقول |
| خطأ خادم زد | 500 أو 502 أو 503 أو 504، أو انقضاء المهلة | `ZidServerError` | نعم: 10 ثوانٍ، ثم 60، ثم 300 (لطلبات GET) | قاطع الدائرة |
| خطأ OAuth في التبادل والتجديد | 400 بشكلين (غلاف زد، أو `error` حسب RFC 6749) | `ZidOAuthError` مع `reason` | حسب السبب (3.1 و3.3) | — |

**قاعدة 401**: تجديد واحد لكل `token_generation`. فإن عاد 401 بالجيل الجديد، يتوقف الطلب، ويُصنَّف `ZidScopeMissing` أو حذفًا. هذا يمنع حلقة «401 ثم تجديد» التي تستهلك الحصة وتنتج 429 ([OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)).

## 7. المتطلبات غير الوظيفية

| البند | المقياس |
|---|---|
| زمن رد الـ webhook | p95 أقل من 200 ms، وp99 أقل من 500 ms (من دخول الطلب إلى الرد) |
| من الـ webhook إلى الحدث الداخلي | p95 ≤ 30 ثانية في الحمل العادي، و≤ 2 دقيقة في الذروة |
| التثبيت (الـ callback) | ≤ 3 ثوانٍ p95 على الخادم، بما فيه التبادل وجلب المتجر |
| من التثبيت إلى التصنيفات وأول 200 منتج | ≤ 3 دقائق p95. يخدم مؤشر PRD «≤ 15 دقيقة إلى أول معاينة» |
| الاستيراد الكامل لـ 10,000 منتج | ≤ 15 دقيقة |
| حد المعدّل | 429 من زد ≤ 1% من طلبات كل متجر يوميًا |
| العدالة | متجر يستورد 10,000 منتج لا يرفع p95 معالجة webhooks المتاجر الأخرى بأكثر من 10% (اختبار حمل) |
| الرموز | 100% من التثبيتات النشطة تُجدَّد قبل اليوم 330 من آخر تجديد. وصفر تثبيتات بـ refresh token ينتهي خلال 30 يومًا |
| توفر مسار الـ webhooks | 99.9% شهريًا. انقطاع ساعة ينتج 30 فشلًا ويعطّل الـ webhooks عند زد |
| الأحداث المفقودة | `zid.webhook.missed` في التوفيق الليلي ≤ 0.5% من الطلبات |
| الأمان: الرموز | مشفرة بتشفير مغلف (M12)، ولا تظهر في السجلات ولا الاستجابات ولا العناوين. اختبار آلي يفحص السجلات بحثًا عن أنماط JWT و`def50` |
| الأمان: الـ webhooks | بيانات Basic Auth لكل تثبيت، ومقارنة ثابتة الزمن، وTLS فقط. ومفتاح أحداث التطبيق قابل للتدوير بمفتاحين |
| الخصوصية (PDPL) | لا نسخة من بيانات العملاء الشخصية، بل المعرّف فقط. الحمولة الخام مشفرة وتُحذف بعد 14 يومًا. ومراجع السلال بعد 30 يومًا |
| العربية | رسائل الحالة والأفعال للتاجر بالعربية والإنجليزية (M15). وحقول الأسماء تُخزَّن بلغتين |
| المراقبة | المؤشرات أدناه، مع وسم Sentry بـ `tenant_id` و`zid_store_id` و`installation_id` |

**المؤشرات** (عبر واجهة المؤشرات في M12):
- `zid.api.requests` (الوسوم: `endpoint_group` و`status` و`priority`)، و`zid.api.latency_ms`، و`zid.api.429`
- `zid.rl.throttled`، و`zid.cb.open`
- `zid.webhook.ack_ms`، و`zid.webhook.received` (الوسم: `event`)، و`zid.webhook.duplicate`، و`zid.webhook.auth_failed`، و`zid.webhook.process_s`، و`zid.webhook.failed`، و`zid.webhook.missed`
- `zid.tokens.refresh_ok`، و`zid.tokens.refresh_failed`، و`zid.tokens.expiring_30d`
- `zid.health.degraded`، و`zid.health.broken`، و`zid.health.recovered`
- `zid.app_event.received` (الوسم: `event_name`)

**التنبيهات**:

| المستوى | الشرط |
|---|---|
| P1 | `broken` أكثر من 0، أو `refresh_failed` أكثر من 0، أو `expiring_30d` أكثر من 0، أو `ZidScopeMissing`، أو `auth_failed` أكثر من 10 في الساعة، أو فشل `ProcessAppEvent` 3 مرات |
| P2 | `degraded`، أو `webhook.failed` أكثر من 1% في الساعة، أو 429 أكثر من 1% يوميًا |

## 8. الاعتماديات والمجهول

### التجارب المرتبطة
| SPK | الأثر على M10 | ما يُبنى الآن |
|---|---|---|
| SPK-08 (حمولة `product.update`) | لا يغيّر التصميم، لأننا نعيد الجلب دائمًا. لكنه قد يوفّر طلبات إن كانت الحمولة كافية | المعالج بإعادة الجلب، وتحسين لاحق خلف العلم `zid.trust_product_payload` |
| SPK-10 (OneSignal وAASA) | يحدد هل يُطلب `third_one_signal_write` قبل التقديم الأول | لا شيء. القصة ZID-17 تنتظر |
| SPK-12 (حدود المعدّل) | يحدد السعة الفعلية والاستثناءات | محدِّد بقيم قابلة للتعديل لكل تثبيت |
| SPK-03 (قيمة `source`) | M08 يقرأ `source` و`source_code` من `zid_order_refs` | تخزين القيمتين كما هما دون تفسير |
| SPK-07 (تطابق `customer_id`) | M05 يتحقق من الملكية عبر `getOrder` | العقد جاهز |
| SPK-01 (كشف نجاح الدفع) | `OrderCreated` هو التأكيد من الخادم كحد أدنى | جاهز |

### مجهول جديد يُتحقق منه في ZID-01 على المتجر التطويري (يُقترح إضافته إلى spikes.md)
1. هل تحمل حمولة webhook المتجر اسم الحدث ومعرّف تسليم؟ صفحات المخطط تعيد 404. والتصميم لا يعتمد عليهما.
2. هل يتطلب الاشتراك في حدث نطاق القراءة للمورد نفسه (مثلًا `orders.read` لأحداث الطلبات)؟
3. الحد الأقصى لـ `page_size` في المنتجات، و`per_page` في الطلبات.
4. المعرّفات الحرفية للنطاقات في Partner Dashboard.
5. هل يُرسل `app.market.application.uninstall` للتطبيقات الخاصة؟
6. **سياسة إعادة المحاولة لأحداث التطبيق** (غير موثقة). ونفترض مثل webhooks المتجر.
7. **إعادة تشغيل `authorize` لتطبيق مثبت** (لاستخدامها في الدخول إلى اللوحة عبر زد، القصة ZID-18): هل تصدر رموزًا جديدة وتلغي القديمة؟

### تعارضات مع الـ ADRs وملاحظات عليها
- **ADR-0005 (البند 4)** صحيح، لكن ينقصه أمران من التوثيق الحالي:
  - زد **تحذف الأحداث المعلقة** حين يصبح الـ webhook `broken`.
  - الاستعادة **تشترط عنوانًا جديدًا**.

  لذلك أضافت هذه المواصفة جيل العنوان ومطابقة الفجوة والتوفيق الليلي. هذا تفصيل لا انحراف، ويُقترح ذكره في ADR-0005 عند اعتماده.
- **ADR-0005 (البند 6)**: «تجديد كل نحو 10 أشهر» مطبَّق: الاستحقاق عند 300 يوم، لأن الـ refresh token يعيش سنة واحدة بينما يعيش رمز الوصول 3 سنوات ([Authorization](https://docs.zid.sa/authorization)).
- **قائمة أحداث التكليف**: أُضيف إليها `order.payment_status.update` و`product.create` و`product.publish` و`product.delete`، لأن ذاكرة المنتجات وتأكيد الدفع البنكي لا تكتمل بدونها. وهذا لا يحتاج نطاقًا إضافيًا.

### قرارات مفتوحة للمشرف
1. **طلب `customers.read` في التقديم الأول**: لازم إن كانت آلية الترحيب (ADR-0008) ستُسلَّم مع الإطلاق. وإن أُضيف لاحقًا فسيضطر كل تاجر إلى تعطيل التطبيق وتفعيله.
2. **أثر انتهاء الاشتراك على التطبيق لدى المتسوقين**: المقترح في 3.5 (اللوحة للقراءة، ثم مفتاح إيقاف بعد 14 يومًا من `expired`). قرار تجاري.
3. **مدد الاحتفاظ بعد الحذف**: 30 يومًا للذاكرة، و90 يومًا للإعداد. يمس الخصوصية والتجربة.
4. **كتالوج الخطط** (`plan_catalog`): المزايا والحدود لكل خطة. خارج PRD (F-P05: «التفاصيل التجارية خارج هذه الوثيقة»)، لكنه لازم قبل ZID-06.
5. **التطبيق المضمّن داخل لوحة زد**: خارج الإصدار الأول. المحرر الثقيل في iframe بسياسة CSP الخاصة بزد غير مختبر.

### ما يُبنى الآن خلف واجهة مؤقتة
- العميل والمحدِّد والمعالجات تُبنى على تسجيلات JSON و`Http::fake` قبل الوصول إلى Partner Dashboard (P-1).
- `EntitlementsProvider` له تنفيذ مؤقت يعيد `manual/active` لكل مستأجر حتى تكتمل ZID-06.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| ZID-01 | إعداد Partner Dashboard: التطبيقات الأربعة، والمتجر التطويري، وتسجيل النطاقات الحرفية، وعناوين staging، وتسجيل fixtures حقيقية، والإجابة عن المجهول 1 إلى 4 في القسم 8 | Must | ينتظر P-1 وP-2 | — |
| ZID-02 | هيكل الوحدتين `Commerce` و`ZidConnector`، والجداول (القسم 4)، و`zid_apps`، والعقود والأحداث المحايدة، وأمر `zid:simulate`، ومجموعة fixtures | Must | ينتظر M12 (CORE-01، CORE-03) | — |
| ZID-03 | عميل Merchant API: الترويسات، والترقيم، وتصنيف الأخطاء، ومحدِّد leaky bucket بالأولويات، و`Retry-After`، والحجب لكل متجر، والتزامن لكل متجر، وقاطع الدائرة، واختبارات العدالة | Must | نعم | ZID-02 (يمكن تطويره بالتوازي داخل هيكل CORE-01) |
| ZID-04 | التثبيت وOAuth: `/install` و`state` والـ cookie، و`/callback` والتبادل المتزامن، وتعريف المتجر، و`InstallationBinder` بالقفل، وتوفير المستأجر، وتسليم الجلسة (عقد M12)، وصفحات الخطأ، والتطبيق الخاص | Must | ينتظر M12 (CORE-03، CORE-04، CORE-07) | ZID-02، وZID-03 |
| ZID-05 | دورة حياة الرموز: التشفير في الخزنة، والتجديد المجدول بالقفل والكتابة الذرية، وشجرة 401، وفحص التطبيقات الخاصة، والحذف والإتلاف | Must | ينتظر M12 (CORE-07، CORE-09) | ZID-04 |
| ZID-06 | أحداث التطبيق والاشتراك: المسار والمفتاح ومنع التكرار، والمعالج حسب `event_name`، و`ReconcileSubscription`، و`plan_catalog`، و`EntitlementResolver`، والحدث `EntitlementsChanged`، والاستحقاق اليدوي | Must | ينتظر M12 (CORE-08)، وقرار كتالوج الخطط | ZID-04، وZID-05 |
| ZID-07 | تسجيل webhooks المتجر: المجموعة المطلوبة، وعنوان بجيل، وBasic Auth لكل تثبيت مع البصمة، والحذف بـ `original_id` وإعادة الإنشاء، وجدول الاشتراكات | Must | نعم بعد ZID-04 | ZID-03، وZID-04 |
| ZID-08 | استقبال الـ webhooks: التحقق، والإيصالات ومنع التكرار، والرد السريع، والطابور، وإعادة الإرسال، ومعالجات الطلبات والسلال والعملاء مع إعادة الجلب والأحداث الداخلية، و`zid_order_refs` | Must | نعم بعد ZID-07 | ZID-07، وM12 (CORE-09) |
| ZID-09 | الصحة والاستعادة: فحص `health-summary` الدوري، والاستعادة بجيل جديد، و`ReconcileGap`، والتوفيق الليلي، والتنبيهات | Must | نعم بعد ZID-08 | ZID-08، وM12 (CORE-10) |
| ZID-10 | مزامنة ملف المتجر: الهوية والعلامة واللغات والتشغيل والتواصل، و`StoreProfileProvider`، والحدث `StoreProfileChanged`، وواجهة إعادة الاستيراد | Must | نعم بعد ZID-04 | ZID-03 |
| ZID-11 | التصنيفات وذاكرة المنتجات: الاستيراد الأول على مرحلتين، ومعالجات `product.*` و`category.*` بالتأخير والجلب الدفعي، والتوفيق الليلي، وواجهات المنتقي، و`CatalogReady` | Must | نعم بعد ZID-08 | ZID-08 |
| ZID-12 | الحذف والانفصال: التدفق 3.4، ومهام الحذف حسب مدد الاحتفاظ، والانتقال من `pilot` إلى `public` (3.6) | Must | نعم بعد ZID-05 | ZID-05، وZID-07 |
| ZID-13 | واجهات الإدارة لـ F-P01: قائمة التثبيتات وتفاصيلها، والأفعال المدققة، وملخص الأسطول، وإعادة معالجة الإيصالات | Must | ينتظر M12 (CORE-05، CORE-06) | ZID-05، وZID-09 |
| ZID-14 | واجهات التاجر: `connection`، و`reimport`، و`reauthorize`، و`subscription`، وقيم `actions` للافتات، والرسائل بلغتين | Must | نعم بعد ZID-06 | ZID-06، وZID-10 |
| ZID-15 | قائمة التحقق قبل التقديم: تمرير [Test your app](https://docs.zid.sa/test-your-app) على `public` بعناوين prod، وفيديو المراجعة، ونص المبرر، وصفحة الخصوصية | Must | ينتظر M14 وM15 (رحلة التفعيل كاملة) | كل ما سبق |
| ZID-16 | معالجة `customer.update` وتحديث لغة العميل للاستهداف | Should | ينتظر M06 | ZID-08 |
| ZID-17 | كتابة إعدادات OneSignal للمتجر (`third_one_signal_write`) للروابط العامة | Should | ينتظر SPK-10 | ZID-05 |
| ZID-18 | الدخول إلى اللوحة عبر زد من زر «Open app» (إعادة `authorize`) | Should | ينتظر نتيجة المجهول 7 في القسم 8 | ZID-04، وM12 (CORE-04) |
| ZID-19 | فروق السعر والمخزون لـ F-S16 في `ProductChanged`، مع لقطات للمنتجات المتابَعة | Should | ينتظر SPK-08 | ZID-11 |
| ZID-20 | التطبيق المضمّن داخل لوحة زد (`embedded_apps_tokens_write`، وسياسة CSP) | Could | ينتظر قرار المشرف | ZID-04 |

### معايير القبول لأهم القصص

**ZID-03: عميل Merchant API ومحدِّد المعدّل**
- **Given** متجر سعته 50 وتسربه طلب في الثانية، **When** تُرسل 100 مهمة إعادة جلب بأولوية `webhook` دفعة واحدة، **Then** لا يتجاوز عدد الطلبات إلى زد 40 في أول ثانية، ثم طلبًا واحدًا في الثانية، والمهام الزائدة تعود إلى الطابور (`release`) دون أن ينام أي عامل.
- **Given** زد ترد بـ 429 و`Retry-After: 17`، **When** تصل مهمة جديدة للمتجر نفسه بعد 5 ثوانٍ، **Then** تعود إلى الطابور بتأخير لا يقل عن 12 ثانية دون أي طلب إلى زد، **And** مهمة لمتجر آخر في اللحظة نفسها تُنفَّذ فورًا.
- **Given** متجر A يستورد 10,000 منتج، **When** تصل 200 webhook لمتجر B في الدقيقة نفسها، **Then** p95 لمعالجة أحداث B لا يزيد أكثر من 10% عن قياسه دون استيراد A (اختبار حمل في CI الليلي).
- **Given** رد 401 برمز `null` ونص فيه «scope»، **When** يعالجه العميل، **Then** يُرمى `ZidScopeMissing` دون أي طلب تجديد، ويُسجَّل تنبيه P1.

**ZID-04: التثبيت وOAuth**
- **Given** تاجر ضغط Activate، **When** يصل المتصفح إلى `/zid/public/install`، **Then** يُحوَّل خلال أقل من 300 ms إلى `oauth.zid.sa/oauth/authorize` ومعه `client_id` و`redirect_uri` المسجل حرفيًا و`response_type=code` و`state` من 64 حرفًا، **And** يُضبط الـ cookie `zid_oauth_nonce` بالخصائص `HttpOnly` و`Secure` و`SameSite=Lax`.
- **Given** callback فيه `code` صالح و`state` صحيح، **When** يُعالج، **Then** يحدث التبادل داخل الطلب نفسه، **And** يُنشأ مستأجر واحد وتثبيت واحد، **And** الرموز في الخزنة مشفرة، ولا تظهر في أي سجل أو رد، **And** يُحوَّل المتصفح إلى اللوحة بجلسة صالحة.
- **Given** تثبيت موجود للمتجر نفسه، **When** يصل callback جديد بعد إعادة التفعيل، **Then** تُستبدل الرموز الثلاثة ويزيد `token_generation`، ولا يُنشأ مستأجر جديد.
- **Given** callback بـ `state` لا يطابق الـ cookie، **When** يُعالج، **Then** يرد 403 دون استدعاء `oauth/token`.
- **Given** مستخدم موجود بريده يطابق بريد المتجر ولا جلسة في المتصفح، **When** يكتمل الـ callback، **Then** لا يُربط المتجر بحسابه تلقائيًا، ويُحوَّل المتصفح إلى صفحة الدخول ثم التأكيد.

**ZID-05: دورة حياة الرموز**
- **Given** تثبيت `refresh_due_at` له الأمس، **When** يعمل `zid:tokens:refresh-due`، **Then** يُجدَّد مرة واحدة فقط ولو أُرسلت المهمة مرتين بالتوازي (قفل)، **And** يُكتب الطقم الجديد كاملًا في معاملة واحدة، و`refresh_due_at` = الآن + 300 يوم.
- **Given** تجديد فشل بـ «The refresh token is invalid.» وفحص المتجر أعاد 401، **When** تكتمل المهمة، **Then** يصبح التثبيت `uninstalled`، ويُتلف سر الرموز، ويُطلق `StoreDisconnected`.
- **Given** أي تثبيت نشط، **Then** المؤشر `zid.tokens.expiring_30d` يساوي صفرًا في كل قياس يومي، وإلا يُطلق تنبيه P1.

**ZID-06: أحداث الاشتراك والاستحقاقات**
- **Given** حدث `app.market.subscription.active` صحيح المفتاح، **When** يصل، **Then** يُرد 200 خلال أقل من 200 ms، **And** يُستدعى endpoint الاشتراك قبل تغيير الاستحقاق، **And** يُطلق `EntitlementsChanged` مرة واحدة.
- **Given** الحمولة نفسها أُرسلت مرتين، **When** تُعالج، **Then** يُنشأ صف واحد في `zid_app_events` ولا يُطلق الحدث مرتين.
- **Given** `renew` بخطة أرخص من الحالية، **When** يُعالج، **Then** ينخفض الاستحقاق إلى مزايا الخطة الأرخص حسب الـ endpoint.
- **Given** حدث `install` وصل قبل الـ callback، **When** يكتمل الـ callback بعد دقيقتين، **Then** يُعالج الحدث المعلّق ويصبح `processed`.

**ZID-08: استقبال الـ webhooks**
- **Given** webhook `order.status.update` ببيانات Basic Auth صحيحة، **When** يصل، **Then** يُرد 200 في p95 أقل من 200 ms، ويُنشأ إيصال، وتُرسل مهمة.
- **Given** الحمولة نفسها وصلت مرتين، **Then** يُنشأ إيصال واحد ومهمة واحدة.
- **Given** حدثا `preparing` ثم `ready` وصلا بترتيب معكوس، **When** يُعالجان، **Then** يُطلق `OrderStatusChanged` بالحالة `ready` مرة واحدة فقط، ولا يُطلق حدث بالحالة `preparing` بعد `ready`.
- **Given** Redis معطل، **When** يصل webhook، **Then** يُرد 200 والإيصال `pending_dispatch`، **And** يُعالج خلال 5 دقائق من عودة Redis.
- **Given** بيانات Basic Auth خاطئة، **Then** يُرد 401 ولا يُنشأ إيصال.

**ZID-09: الصحة والاستعادة**
- **Given** webhook حالته `broken` منذ 40 دقيقة، **When** يعمل فحص الصحة، **Then** يُستعاد بعنوان جيله أعلى بواحد، **And** تُشغَّل مطابقة الفجوة من `broken_at` ناقص 15 دقيقة، **And** كل طلب تغيرت حالته في الفجوة يُطلق حدثه مرة واحدة.
- **Given** انقطاع خادمنا 70 دقيقة، **When** يعود، **Then** خلال 15 دقيقة لا يبقى أي webhook `broken` لأي متجر نشط.

## 10. المصادر

**زد: التفويض والتثبيت**
- [Authorization](https://docs.zid.sa/authorization)، [Public Apps OAuth Requirements](https://docs.zid.sa/oauth-requirements)، [OAuth Errors & Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)، [Zid Bridge](https://docs.zid.sa/zid-bridge)، [Embedded Apps](https://docs.zid.sa/embedded-apps-2168216m0)
- [Zid Apps Overview](https://docs.zid.sa/zid-apps-overview)، [Test your app](https://docs.zid.sa/test-your-app)، [Submitting your app for review](https://docs.zid.sa/submit-app-for-review)، [Justifying your scopes](https://docs.zid.sa/justifying-your-scopes-2490953m0)

**زد: الخطط والاشتراكات**
- [Plans and pricing](https://docs.zid.sa/plans-and-pricing-2490911m0)، [Changing a plan](https://docs.zid.sa/changing-a-plan-2499430m0)، [Private plans](https://docs.zid.sa/private-plans-2490914m0)
- [Subscription and app events](https://docs.zid.sa/subscription-and-app-events-2490915m0)، [App Management Events](https://docs.zid.sa/events-878234m0)، [Subscription Details](https://docs.zid.sa/app-subscription-details)

**زد: الحدود والـ webhooks**
- [Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0)، [Responses](https://docs.zid.sa/responses)
- [Webhooks Overview](https://docs.zid.sa/webhooks)، [Webhook Health Tracking](https://docs.zid.sa/webhook-health-tracking-2197281m0)
- [Create Webhook](https://docs.zid.sa/create-a-webhook)، [List Webhooks](https://docs.zid.sa/list-of-webhooks)، [Delete Webhook](https://docs.zid.sa/delete-a-webhook-by-original-id)
- [Health Summary](https://docs.zid.sa/health-summary-37247358e0)، [Broken Webhooks](https://docs.zid.sa/broken-webhooks-37378513e0)، [Recover Broken Webhooks](https://docs.zid.sa/recover-broken-webhooks-37378520e0)
- [Order webhook schema](https://docs.zid.sa/webhook-events-order)

**زد: Merchant API**
- [Store](https://docs.zid.sa/store-33664558e0)، [Branding](https://docs.zid.sa/branding-33664604e0)، [Localization](https://docs.zid.sa/localization-33664641e0)، [Operations](https://docs.zid.sa/operations-33664677e0)، [Social](https://docs.zid.sa/social-33664667e0)
- [List Products](https://docs.zid.sa/retrieve-a-list-of-products)، [List Categories](https://docs.zid.sa/get-all-categories)
- [View Order](https://docs.zid.sa/view-order-12479054e0)، [List Orders](https://docs.zid.sa/list-of-orders)، [View Abandoned Cart](https://docs.zid.sa/get-abandoned-cart-details)
- [Zid SDKs](https://docs.zid.sa/zid-sdks-2008123m0)، [laravel-sample-app](https://github.com/zidsa/laravel-sample-app)

**Laravel**
- [Laravel 13: Queues (Debounced jobs، Rate limiting، WithoutOverlapping)](https://laravel.com/docs/13.x/queues)، [Cache: Atomic locks](https://laravel.com/docs/13.x/cache#atomic-locks)، [HTTP Client](https://laravel.com/docs/13.x/http-client)، [Horizon](https://laravel.com/docs/13.x/horizon)

**ملاحظات البحث الداخلية**
- `research_notes/جدوى منصة تطبيقات متاجر زد/zid_api_headless.md` (الأقسام Q2 وQ4 وQ5)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md` (الأقسام Q3 وQ7 وQ9)
