# M12: نواة المنصة (Platform Core)

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Laravel (وحدتا `Platform` و`Tenancy`)، والبنية التحتية (PostgreSQL، وRedis، وKMS، وSecret Manager، وSentry). وواجهات الإدارة في Next.js من M15 |
| المتطلبات | F-P01, F-P03, F-P04 (Must)، وF-P06 (Should)، وF-M14 (Could)، ويستهلك F-P05 من M10 |
| القرارات | ADR-0005، وADR-0010، وADR-0007 (خزنة الأسرار)، وADR-0008 (أسرار الإشعارات)، وADR-0006 (API التخطيطات) |
| تعتمد على | لا شيء، فهي الأساس. وتستهلك عبر عقود معكوسة: `EntitlementsProvider` من M10، ومؤشر الإعداد من M11 |
| بادئة القصص | CORE |

> **ملاحظة على النطاقات**: `intishar.sa` مثال حتى يُحسم النطاق (القسم 8). والملزم هو البنية: اللوحة والـ API على نطاقين فرعيين لنطاق أب واحد، وstaging على نطاق أب **مختلف**.

## 1. الغرض والنطاق

M12 هي الأرضية التي تُبنى عليها كل وحدات الخادم: كيف يُقسَّم الكود، وكيف يُعزل كل تاجر، وكيف يدخل المستخدمون، وكيف تُحفظ الأسرار، وكيف يُراقب النظام ويُنشر ويُستعاد.

### داخل الإصدار الأول (Must)
1. **هيكل Modular Monolith** في Laravel، بحدود وحدات تُفرض باختبارات معمارية (ADR-0005).
2. **تعدد المستأجرين**: قاعدة واحدة، و`tenant_id`، ونطاق عام (global scope) يرفض العمل دون سياق.
3. **مصادقة اللوحة**: Sanctum SPA بالـ cookies بين `app.` و`api.`، ودخول التاجر برمز عبر البريد، ودخول الإدارة بكلمة مرور وTOTP.
4. **المستخدمون والأدوار**: مالك واحد لكل متجر في الإصدار الأول، وأدوار الإدارة الداخلية.
5. **سجل التدقيق**: إلحاق فقط.
6. **الأعلام ومفاتيح الإيقاف** لكل تاجر وعامة، و`min_supported_app_version`، وendpoint يستهلكه التطبيق (M01، F-P04).
7. **خزنة الأسرار**: تشفير مغلف (envelope) عبر KMS، وسياسات وصول، وتدوير.
8. **المراقبة**: Sentry، وسجلات منظمة، ومؤشرات، وUptime، وHorizon (F-P03).
9. **اصطلاحات الـ API**: الإصدارات، والأخطاء، والترقيم، ومفاتيح عدم التكرار، وحدود المعدّل.
10. **البيئات والتشغيل**: local وstaging وprod، والنشر، والنسخ الاحتياطي والاستعادة.
11. **الطوابير والجدولة** لكل الوحدات.
12. **أدوات الإدارة** لـ F-P01: المتاجر وحالتها، والأعلام، والتدقيق، وملخص التشغيل.

### لاحقًا (Should وCould)
- F-P06 (Should): عرض إعداد التاجر للقراءة ومعاينته.
- تقوية العزل بـ PostgreSQL RLS (Should).
- تصدير بيانات المستأجر وحذفها (Should).
- F-M14 (Could): فريق التاجر وأدواره.
- مفتاح KMS لكل مستأجر (Should، حسب تفسير ADR-0007).

### ليس من مسؤولية M12
- شاشات اللوحة والإدارة: M15. وM12 يقدم الـ API فقط (ADR-0010).
- منطق الوحدات: M10 للربط بزد، وM11 للإعداد، وM13 للبناء، وM06 للإشعارات، وغيرها.
- تطبيق Flutter: M01 يستهلك endpoint التشغيل المعرّف هنا.

## 2. المكونات حسب الطبقة

### 2.1 بيئة التشغيل والحزم

| المكون | الإصدار | لماذا |
|---|---|---|
| PHP | 8.4 | يدعمه Laravel 13 (من 8.3 إلى 8.5). وحزم مثل Pest 5 وspatie/laravel-backup 10 تشترط `^8.4` |
| `laravel/framework` | `^13.40` | انظر القسم 8: Laravel 12 تنتهي إصلاحاته الأمنية في 24 فبراير 2027، قبل الإطلاق ([Support Policy](https://laravel.com/docs/13.x/releases#support-policy)) |
| PostgreSQL | 17 (خدمة مُدارة) | `jsonb`، و`pg_trgm` لبحث المنتجات، وPITR، وRLS لاحقًا |
| Redis أو Valkey | 7.2 أو أحدث، أو Valkey 8 (مُدار) | الطوابير، والمخبأ، والأقفال، ومحدِّدات المعدّل. **ليس مصدر حقيقة** |
| `laravel/sanctum` | `^4.3` | مصادقة SPA بالـ cookies ([Sanctum](https://laravel.com/docs/13.x/sanctum#spa-authentication)) |
| `laravel/fortify` | `^1.41` | للإدارة فقط (حارس `admin`): كلمة مرور وTOTP ورموز استرداد، و`views => false` |
| `laravel/horizon` | `^5.50` | الطوابير وإحصاءاتها |
| `sentry/sentry-laravel` | `^4.29` | الأخطاء، والأداء، وCrons، والسجلات اختياريًا |
| `spatie/laravel-health` | `^1.41` | فحوص الجاهزية بصيغة JSON |
| `spatie/laravel-backup` | `^10.4` | نسخة منطقية أسبوعية إلى تخزين منفصل |
| `dedoc/scramble` | `^0.13` | توليد OpenAPI من الكود |
| `google/cloud-kms` `^2.14` أو `aws/aws-sdk-php` `^3.403` | حسب D-06 | محرك KMS لخزنة الأسرار |
| `pestphp/pest` | `^5.3` | الاختبارات، واختبارات المعمارية (`arch()`) |
| `larastan/larastan` | `^3.14` | التحليل الساكن، يبدأ بالمستوى 6 ويُرفع إلى 8 |
| `laravel/pint` | `^1.32` | التنسيق |
| `laravel/telescope` | `^5.27` | محليًا فقط |

**حزم مرفوضة**:

| الحزمة | السبب |
|---|---|
| `stancl/tenancy` (v3.10)، و`spatie/laravel-multitenancy` (4.3) | نحتاج سلوكًا يرفض العمل دون سياق، وتعريف المستأجر يختلف حسب السطح (اللوحة، والتطبيق، وwebhooks زد، والمهام). وstancl في الوضع أحادي القاعدة **لا يقيّد الاستعلام** عند غياب المستأجر ([Single-database tenancy](https://tenancyforlaravel.com/docs/v3/single-database-tenancy)). التنفيذ الذاتي نحو 200 سطر يملكه المنفذ |
| `laravel/pennant` (1.26) | يخزّن القيمة المحسوبة لكل نطاق عند أول فحص، فيصعب تغيير القيمة الافتراضية لاحقًا. ولا يناسب أعلامًا تُقدَّم للتطبيق مع مفاتيح إيقاف واستحقاقات |
| `spatie/laravel-permission` (8.5) | الإصدار الأول فيه دور واحد للتاجر. تُعاد دراسته مع F-M14 |
| `spatie/laravel-activitylog` (5.1)، و`owen-it/laravel-auditing` (14) | يتمحوران حول النماذج، ونحتاج تدقيقًا بأفعال مسماة وفاعل من أنواع متعددة (تاجر، ومدير، ونظام، وزد) |
| `laravel/pulse` (1.8) | واجهته Livewire، وADR-0010 يمنع Livewire |
| `laravel/octane` (2.23) | الحالة المشتركة بين الطلبات خطر على سياق المستأجر. لا حاجة أداء تبرره الآن |
| `nwidart/laravel-modules` (13.3) | يولّد هيكلًا ثقيلًا. يكفينا PSR-4 مع provider لكل وحدة |
| HashiCorp Vault | تشغيله (التوفر العالي، وفك الختم، والترقيات) عبء على منفذ واحد. انظر 2.7 |
| Filament | مرفوض في ADR-0010 |

### 2.2 هيكل Modular Monolith وحدود الوحدات

```text
backend/
  bootstrap/app.php            # التوجيه، والوسطاء، والاستثناءات (Laravel 13)
  bootstrap/providers.php      # provider لكل وحدة
  config/
  modules/
    Platform/      M12  نواة مشتركة: Api, Audit, Flags, Secrets, Observability, Idempotency, Runtime
    Tenancy/       M12  المستأجرون، والمستخدمون، والعضويات، ومدراء المنصة، والمصادقة
    Commerce/      M10  عقود محايدة فقط (ADR-0005 البند 3)
    ZidConnector/  M10
    AppConfig/     M11  ومعه أجزاء الخادم من M02 وM03
    Engagement/    M09
    Push/          M06
    Orders/        M05  (BFF للطلبات والتتبع)
    Analytics/     M08
    Links/         M07
    Onboarding/    M14
    Builds/        M13
    Billing/       لاحقًا
  tests/Architecture/          # اختبارات حدود الوحدات
```

**الهيكل الداخلي لكل وحدة**:

```text
modules/{Module}/
  src/
    Contracts/   واجهات عامة تستهلكها الوحدات الأخرى
    Data/        DTOs عامة (readonly classes)
    Events/      أحداث عامة
    Http/        Controllers, Requests, Resources, Middleware
    Jobs/  Models/  Services/  Policies/  Console/
    {Module}ServiceProvider.php   يسجل المسارات والترحيلات والجدولة وتوجيه الطوابير والسياسات
  database/migrations/
  routes/
  tests/
```

`composer.json` يحتوي `"Modules\\": "modules/"` بنمط PSR-4، مع `src/` لكل وحدة عبر classmap أو PSR-4 لكل وحدة.

**قواعد الحدود** (كل قاعدة لها اختبار `arch()` في CI):
1. الوحدة لا تستخدم من وحدة أخرى إلا `Contracts` و`Data` و`Events`.
2. لا علاقات Eloquent ولا joins بين جداول وحدتين. الإشارة بالمعرّف فقط. والاستثناء الوحيد `tenant_id` الذي يشير إلى `tenants`.
3. **كل وحدة تملك جداولها**، ولا تكتب وحدة في جدول غيرها. وأسماء الجداول تحددها مواصفة كل وحدة (القائمة في 4.2). وكل جدول جديد يُسجَّل في `ownership.php` للوحدة، واختبار يرفض جدولًا بلا مالك.
   - **قيد على البادئات**: لا تستخدم وحدة بادئة توحي بوحدة أخرى. فالبادئة `zid_` لـ M10 وحدها، وجداول M11 الحالية `zid_imports` و`zid_section_*` تحتاج تسمية أخرى (القسم 8).
4. **الاتجاه**: كل الوحدات تعتمد على `Platform` و`Tenancy`، وهما لا تعتمدان على أي وحدة. وما تحتاجه النواة من غيرها يمر بعقد تعرّفه النواة وتنفّذه الوحدة. أمثلة:
   - `EntitlementsProvider` تنفذه M10.
   - `RuntimeContributor` تنفذه M11، فيضيف `config` و`blocks` إلى endpoint الأعلام.
   - `CdnPurger` تنفذه M11، لأن تكامل الـ CDN عنده.
   - `TenantHealthContributor` تنفذه M10 وM13.
5. **لا دورات** بين الوحدات (اختبار `arch()` على الـ namespaces).
6. **التواصل**:
   - المتزامن: عبر واجهات تُربط في الـ provider.
   - غير المتزامن: عبر أحداث Laravel بعد commit، ومستمعين في الطابور.
7. **لا `env()` خارج `config/`**، ولا `Http::` خارج الصنف المخصص لكل تكامل، ولا `DB::` خام في الوحدات خارج أصناف `*Query` المراجَعة.

**الربط مع ADR-0005**: الوحدات المذكورة فيه هي `Tenancy`، و`ZidConnector`، و`AppConfig`، و`Builds`، و`Push`، و`Orders`، و`Analytics`، و`Billing`. هذه المواصفة تضيف خمس وحدات (القسم 8):
- `Platform`: نواة مشتركة.
- `Commerce`: عقود الموصل.
- `Links` و`Engagement` و`Onboarding`: لأن M07 وM09 وM14 وحدات مستقلة في خريطة النظام.

### 2.3 نموذج تعدد المستأجرين

| المعيار | قاعدة واحدة و`tenant_id` | Schema لكل مستأجر (PostgreSQL) | قاعدة لكل مستأجر |
|---|---|---|---|
| التشغيل لمنفذ واحد | ترحيل واحد ونسخة احتياطية واحدة | الترحيل يعمل N مرة. و500 مستأجر تعني 500 تشغيل لكل ترحيل | الأثقل |
| الاستعلامات عبر المستأجرين (الإدارة F-P01، وبناء الأسطول F-P02، والتحليلات، والجدولة) | استعلام واحد | `UNION` أو تكرار على كل schema | تكرار على اتصالات |
| تجميع الاتصالات (PgBouncer بوضع transaction) | يعمل | `search_path` لكل طلب يتعارض مع هذا الوضع | اتصال لكل قاعدة |
| قوة العزل | منطقي (نطاق عام، ثم RLS لاحقًا) | أقوى (فصل بالأسماء) | الأقوى |
| استعادة مستأجر واحد | استعادة لنقطة زمنية في نسخة جانبية، ثم نسخ صفوفه | أسهل (dump للـ schema) | الأسهل |
| حجم البيانات المتوقع | عشرات إلى مئات من التجار، وبيانات متوسطة لكل تاجر (لا نسخة كاملة للطلبات ولا للعملاء) | — | — |

**التوصية: قاعدة واحدة و`tenant_id` ونطاقات عامة.** الأسباب:
- معظم عمل المنصة عبر المستأجرين: الإدارة، وبناء الأسطول، والجدولة، وفحص صحة الـ webhooks.
- المنفذ واحد.
- PII محدودة بالتصميم (M10 لا ينسخ العملاء).

وضعف العزل المنطقي يُعالج بما يلي:
1. **رفض العمل دون سياق**: `TenantScope` يرمي `MissingTenantContext` إن لم يوجد مستأجر ولا وضع نظام صريح. لا يعيد بيانات كل المستأجرين أبدًا.
2. **الإنشاء**: `BelongsToTenant` يملأ `tenant_id` عند الإنشاء، ويرفض تغييره عند التحديث.
3. **الفهارس الفريدة** تبدأ بـ `tenant_id`. وقواعد `unique` و`exists` تمر بـ `TenantRule::unique()` و`TenantRule::exists()`.
4. **وضع النظام** صريح وبسبب مكتوب: `Tenancy::runAsSystem(fn () => …, reason: 'fleet-build')`. وإن بدأه مدير يُسجَّل في التدقيق.
5. **المخبأ والتخزين**: مفاتيح المخبأ تبدأ بـ `t:{tenant_id}:`، ومسارات التخزين `tenants/{tenant_id}/…`.
6. **مجموعة اختبارات العزل**: لكل نموذج فيه `BelongsToTenant`، يُنشأ صف في المستأجر A، ويُستعلم عنه من المستأجر B، والنتيجة صفر. ويُختبر الرفض دون سياق.
7. **لاحقًا** (CORE-17): PostgreSQL RLS بسياسة `tenant_id = current_setting('app.tenant_id')` كخط دفاع ثانٍ.

**تحديد المستأجر حسب السطح**:

| السطح | المصدر | الوسيط |
|---|---|---|
| لوحة التاجر `/api/v1/tenants/{tenant}/…` | `{tenant}` في المسار، ويُتحقق من عضوية المستخدم فيه | `tenant.member` |
| تطبيق المتسوق `/api/app/v1/t/{tenant}/…` | `{tenant}` في المسار، وهو المعرّف العام المحقون في الملف التنفيذي (`TENANT_ID` في M01)، مع مخبأ 10 دقائق | `tenant.public` |
| webhooks زد | التثبيت من المسار (M10) | `VerifyStoreWebhookAuth` |
| الإدارة `/api/v1/admin/…` | لا سياق افتراضيًا. والعمليات على مستأجر محدد عبر `Tenancy::run($tenant, …)` | — |
| المهام | خاصية `tenantId` في المهمة، ووسيط المهمة `WithTenant` يضبط السياق بعد فك التسلسل | `WithTenant` |
| الأوامر المجدولة | وضع النظام، ثم تفريع مهمة لكل مستأجر | — |

**لماذا المستأجر في المسار لا في ترويسة**:
- مسارات التطبيق تُخزَّن في CDN بمفتاح المسار، كما يقضي ADR-0006.
- Cloudflare لا يحترم `Vary` على الترويسات المخصصة. فلو جاء المستأجر في ترويسة، لأمكن أن تُقدَّم أعلام تاجر لتطبيق تاجر آخر.
- في اللوحة، المسار يطابق مسارات Next.js (`/{tenant}/…`) في M15.

**المعرّف العام للمستأجر** (`tenants.public_id`):
- الصيغة: `t_` ثم 10 أحرف base32 صغيرة، مثل `t_8f2k1q9x3m`.
- ثابت لا يتغير، ويُستخدم في اللوحة والتطبيق والـ CDN.
- المعرّف الداخلي ULID لا يظهر في المسارات.

**سياق السجلات**: كل وسيط يضبط السياق يضيف أيضًا `Context::add('tenant_id', …)`، فيظهر في كل سطر سجل، ويُنقل إلى المهام ([Context](https://laravel.com/docs/13.x/context)).

### 2.4 مصادقة اللوحة (Sanctum SPA)

**النطاقات**: `app.intishar.sa` لتطبيق Next.js، و`api.intishar.sa` لـ Laravel. نطاق أب مشترك كما يشترط Sanctum ([Sanctum SPA](https://laravel.com/docs/13.x/sanctum#spa-authentication)) وADR-0010 (البند 5).

**الإعداد**:

```dotenv
SESSION_DRIVER=database
SESSION_COOKIE=intishar_session
SESSION_DOMAIN=.intishar.sa
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_LIFETIME=720
SANCTUM_STATEFUL_DOMAINS=app.intishar.sa
```

```php
// config/cors.php
return [
    'paths' => ['api/v1/*', 'sanctum/csrf-cookie'],   // مسارات التطبيق /api/app/v1 لا تحتاج CORS
    'allowed_origins' => [env('DASHBOARD_ORIGIN', 'https://app.intishar.sa')],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['Accept', 'Accept-Language', 'Content-Type', 'X-XSRF-TOKEN',
        'X-Requested-With', 'If-Match', 'Idempotency-Key', 'X-Request-Id'],
    'exposed_headers' => ['X-Request-Id', 'Retry-After', 'X-RateLimit-Limit',
        'X-RateLimit-Remaining', 'Deprecation', 'Sunset'],
    'max_age' => 7200,
    'supports_credentials' => true,
];
```

```php
// bootstrap/app.php (مقتطف)
->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();                 // جلسة Sanctum لطلبات app.intishar.sa
    $middleware->preventRequestForgery();       // الافتراضي: Sec-Fetch-Site ثم رمز XSRF
    $middleware->alias([
        'tenant.member' => \Modules\Tenancy\Http\Middleware\ResolveMemberTenant::class,
        'tenant.public' => \Modules\Tenancy\Http\Middleware\ResolvePublicTenant::class,
    ]);
})
```

**CSRF**:
1. يبدأ Next.js بطلب `GET https://api.intishar.sa/sanctum/csrf-cookie`، فيضبط Laravel الـ cookie `XSRF-TOKEN` على `.intishar.sa`. يقرؤها Next.js من `document.cookie`، ويرسلها في الترويسة `X-XSRF-TOKEN` بعد `decodeURIComponent`.
2. في Laravel 13، الوسيط `PreventRequestForgery` يفحص `Sec-Fetch-Site` أولًا. والطلب من `app.` إلى `api.` قيمته `same-site` لا `same-origin`، فيُفحص الرمز ([CSRF: Origin Verification](https://laravel.com/docs/13.x/csrf#origin-verification)).
3. **لا نفعّل `allowSameSite: true`**، لأنه يثق بكل النطاقات الفرعية. والقاعدة: أي محتوى غير موثوق تمامًا (CDN، والوسائط، ومعاينة Flutter Web، وروابط M07) يُخدم من **نطاق أب منفصل** (مثل `intishar-cdn.net`)، فلا تصله cookies اللوحة.

**عميل Next.js** (عقد مع M15):
- كل طلب: `credentials: 'include'`، و`Accept: application/json`، و`X-XSRF-TOKEN`. والمستأجر في المسار.
- عند 419 (رمز CSRF منتهٍ): يطلب `csrf-cookie` ثم يعيد الطلب مرة واحدة.
- عند 401: يحوّل إلى صفحة الدخول.
- **عند العرض من الخادم (SSR)**: Next.js يمرر ترويسة `cookie`، ويضبط `Origin: https://app.intishar.sa` ليعامل Sanctum الطلب كطلب جلسة. ويُسمح بـ GET فقط من الخادم. والكتابة من المتصفح.

**دخول التاجر برمز عبر البريد** (بلا كلمة مرور):
- **لماذا**: لا تخزين لكلمات المرور، وتذاكر دعم أقل، والتاجر يدخل أصلًا ببريده من زد.
- **المواصفات**: رمز من 6 أرقام صالح 10 دقائق، ويُخزَّن hash له بـ HMAC. والحد 5 محاولات للرمز الواحد.
- **حدود الإرسال**: 3 رموز كل 15 دقيقة لكل بريد، و20 في الساعة لكل IP.
- **منع كشف الحسابات**: الرد دائمًا 202، سواء وُجد البريد أم لا.
- **الدخول عبر زد** (زر «الدخول عبر زد» الذي يفترضه M15): Should، في القصة ZID-18، بعد التحقق من سلوك إعادة `authorize` (M10، القسم 8). والسبب الأمني: OAuth زد يثبت **المتجر** لا **الشخص**. فأي مستخدم فرعي في لوحة زد للمتجر سيدخل لوحتنا بصلاحية المالك، إلا إن طلبنا نطاق هوية الحساب (`third_account_identity_read`) وربطنا الشخص.

**مدد الجلسة**:

| | خمول | مطلق |
|---|---|---|
| التاجر | 12 ساعة | 30 يومًا |
| الإدارة | 60 دقيقة | 12 ساعة |

- الحد المطلق يفرضه الوسيط `EnforceAbsoluteSessionLifetime` من `auth_started_at` في الجلسة.
- الجلسة تُجدَّد (`regenerate`) عند الدخول.
- «الخروج من كل الأجهزة» يحذف صفوف `sessions` للمستخدم.

**حراس منفصلون**:
- `web` لجدول `users` (التجار)، ومساراتهم `auth:web`.
- `admin` لجدول `admin_users`، ومساراتهم `auth:admin` مع الوسيط `admin.2fa`.
- لا نستخدم رموز Sanctum API للوحة. Sanctum هنا لوسيط الجلسة ومسار `csrf-cookie` فقط.

### 2.5 المستخدمون والأدوار

**التجار** (الجدولان `users` و`memberships`):
- في الإصدار الأول عضوية واحدة بالدور `owner` لكل متجر.
- المستخدم يمكن أن يملك أكثر من متجر (عضويات متعددة)، ويختار المتجر في اللوحة، فيظهر في المسار.
- **F-M14 (Could)** يفعّل الأدوار التالية دون تغيير المخطط، لأن `memberships.role` قيمة نصية والقدرات تُحسب من خريطة في الكود. أسماء القدرات تطابق `permissions` في M15:

| القدرة | owner | manager | editor | marketer | viewer |
|---|---|---|---|---|---|
| `design.edit` | ✓ | ✓ | ✓ | — | — |
| `design.publish` | ✓ | ✓ | — | — | — |
| `push.send` | ✓ | ✓ | — | ✓ | — |
| `builds.request`، و`builds.submit` | ✓ | ✓ | — | — | — |
| `settings.manage` (مفاتيح Apple وGoogle، والربط) | ✓ | — | — | — | — |
| `analytics.view` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `team.manage` | ✓ | — | — | — | — |

**التنفيذ**: `enum Capability`، و`RoleCapabilities::for(Role)`، و`Gate::before` يربط القدرة بعضوية المستخدم في المستأجر الحالي. والسياسات تستدعي `$user->can('design.publish')`.

**مدراء المنصة** (الجدول `admin_users`):
- يُنشأ المدير بالأمر `php artisan admin:create` فقط. لا تسجيل ذاتي.
- TOTP إلزامي.
- قائمة IP اختيارية في `ADMIN_IP_ALLOWLIST`.

| القدرة | super_admin | ops | support |
|---|---|---|---|
| عرض المتاجر والتثبيتات والصحة والتدقيق | ✓ | ✓ | ✓ |
| عرض إعداد التاجر للقراءة (F-P06) | ✓ | ✓ | ✓ |
| تجديد رموز زد، وإعادة تسجيل الـ webhooks، وإعادة معالجة الإيصالات | ✓ | ✓ | — |
| تشغيل البناء للتاجر أو للأسطول (M13) | ✓ | ✓ | — |
| الاستحقاق اليدوي، وإيقاف مستأجر وإعادته | ✓ | ✓ | — |
| أعلام مستأجر | ✓ | ✓ | — |
| مفاتيح الإيقاف العامة، و`min_supported_app_version` العام | ✓ | — | — |
| إدارة المدراء، وبيانات الأسرار الوصفية | ✓ | — | — |

**لا انتحال لهوية التاجر**: الدعم يرى ولا يكتب نيابة عن التاجر، حسب PRD: «إصلاح المشكلات دون الدخول إلى حساب التاجر».

### 2.6 سجل التدقيق

- **الخدمة**: `AuditLogger::record(string $action, ?Model $subject, array $changes = [], array $meta = [])`.
- **الفاعل** يُستخرج من السياق:
  - `merchant_user` أو `admin_user` مع المعرّف.
  - `system` مع اسم المهمة.
  - `zid` لأحداث زد.
  - `app_device` نادرًا.
- **الحجب**: الحقول في `config('audit.redact')` (مثل `token` و`password` و`secret` و`code`) تُستبدل بـ `[REDACTED]`، وبصمة SHA-256 لأول 8 أحرف فقط عند الحاجة للمقارنة.
- **إلحاق فقط**: مستخدم قاعدة البيانات للتطبيق له `INSERT` و`SELECT` فقط على `audit_events`. والحذف بعد 24 شهرًا يجريه أمر مجدول باتصال منفصل له `DELETE`.

**الأفعال المدققة إلزاميًا**:
- **الدخول**: `auth.login`، و`auth.logout`، و`auth.login_locked`.
- **المستأجر والعضوية**: `tenant.provisioned`، و`tenant.status_changed`، و`membership.created` و`.role_changed` و`.removed`.
- **زد** (M10): `zid.installation.connected`، و`.tokens_replaced`، و`.uninstalled`، و`zid.webhooks.reregistered`، و`zid.receipt.retried`.
- **الأسرار**: `secret.created`، و`.rotated`، و`.destroyed`، و`.read_for_build`.
- **الأعلام والاستحقاق**: `flag.override_set` و`.override_removed`، و`kill_switch.toggled`، و`entitlement.manual_set`.
- **الإدارة**: `admin.tenant_viewed_config` (F-P06)، و`admin.created`.
- **أفعال الوحدات**: `layout.published` (M11)، و`push.campaign_sent` (M06)، و`build.requested` و`store.submitted` (M13).

### 2.7 خزنة الأسرار

**الأنواع**:

| النوع | المحتوى | المالك والمستهلك | التدوير |
|---|---|---|---|
| `zid_oauth_tokens` | JSON بالرموز الثلاثة | ZidConnector | مع كل تجديد (نحو 10 أشهر) |
| `zid_webhook_basic_auth` | JSON بالمستخدم وكلمة المرور | ZidConnector | عند إعادة التسجيل، وسنويًا |
| `asc_api_key` | ملف `.p8`، و`key_id`، و`issuer_id` | Builds (ADR-0007) | حين يلغيه التاجر أو يدوّره، ونكتشف ذلك بـ 401 من Apple |
| `play_service_account` | JSON | Builds | سنويًا (توصية) |
| `apns_auth_key` | ملف `.p8`، و`key_id`، و`team_id` | Push وBuilds (رفعه إلى Firebase، ADR-0008) | عند الطلب |
| `android_upload_keystore` | `.jks`، وكلمتا المرور، والـ alias | Builds | لا يُدوَّر. وفقده قابل للاسترداد بإعادة ضبط مفتاح الرفع، لأن Google تحفظ مفتاح التوقيع (Play App Signing) |
| `firebase_service_account` (`tenant_id = null`) | JSON لكل مشروع Firebase | Push | سنويًا |

**التشفير المغلف (envelope)**:
1. **الكتابة**:
   1. `random_bytes(32)` يولّد مفتاح بيانات (DEK) لكل نسخة سر.
   2. تشفير بـ AES-256-GCM، مع AAD = `secret_id|tenant_id|type|version`، فلا يمكن نقل نص مشفر إلى مستأجر آخر.
   3. تغليف DEK بمفتاح KMS للبيئة (`intishar-{env}-secrets`، بحماية HSM).
   4. حفظ النص المشفر والـ nonce والـ tag والـ DEK المغلف ونسخة المفتاح، ثم مسح DEK من الذاكرة.
2. **القراءة**: فك تغليف DEK عبر KMS، ثم فك التشفير. ومخبأ داخل العملية فقط (LRU، 500 عنصر، 5 دقائق). **لا يُخزَّن نص صريح في Redis ولا في القاعدة ولا في السجلات.**
3. **المسار الساخن دون KMS**: التحقق من Basic Auth للـ webhooks يقارن بصمة HMAC محفوظة (M10)، فلا يتوقف استقبال الأحداث إن تعطل KMS.

**سياسات الوصول**:
- كل وحدة تأخذ نسخة مقيّدة: `SecretVault::forModule('Builds')`. تُربط في الـ provider، وترفض أي نوع غير مسموح لها.
- البشر:
  - **التاجر**: يرفع فقط (كتابة دون قراءة).
  - **المدير**: يرى البيانات الوصفية فقط: النوع، والتاريخ، والبصمة، وآخر استخدام، وتاريخ الانتهاء.
  - **لا أحد** يقرأ النص الصريح عبر الـ API.
  - **الاستثناء الوحيد**: خط البناء (M13) يأخذ السر برابط موقّع لمرة واحدة وصالح 10 دقائق، ويُسجَّل `secret.read_for_build`.
- **صلاحيات KMS (IAM)**:
  - حساب خدمة التطبيق له `encrypt` و`decrypt` على مفتاح البيئة فقط.
  - إدارة المفاتيح لحساب بشري منفصل بـ MFA، للطوارئ (break-glass).
  - حماية من الإتلاف: لا يُجدول إتلاف المفتاح أبدًا. إتلافه يعني فقد كل الأسرار.

**التدوير**:
- **مفتاح KMS (KEK)**: تدوير تلقائي كل 365 يومًا. والنسخ القديمة تبقى لفك التشفير. والأمر `secrets:rewrap` (كل ربع سنة) يعيد تغليف كل DEK بالنسخة الأساسية دون فك تشفير المحتوى.
- **السر**: نسخة جديدة بالحالة `active`. والقديمة `previous` لمدة 7 أيام، ثم تُتلف. وفي رموز زد تُتلف القديمة فورًا.
- **إتلاف تشفيري (crypto-shred)**: حذف صف السر عند فصل المستأجر أو حذف بياناته يجعل النص المشفر في النسخ الاحتياطية بلا قيمة بعد انتهاء احتفاظها.
- **أسرار المنصة** (مفاتيح عملاء زد، وكلمات مرور القاعدة، وSentry DSN، ورمز Codemagic): في Secret Manager السحابي، وتُحقن متغيرات بيئة عند بدء الحاوية. و`.env` محليًا فقط. والتدوير بدليل تشغيل.

**التوصية لـ KMS** (تُحسم مع D-06):
1. إن اختير GCP: **Cloud KMS في `me-central2` (الدمام)**. الموقع يدعم مفاتيح software وHSM ([Cloud KMS locations](https://docs.cloud.google.com/kms/docs/locations)).
2. إن اختير AWS: **AWS KMS في منطقة السعودية** عند إتاحتها العامة. أُعلن أنها مخططة لديسمبر 2026، ولم تتأكد إتاحتها حتى كتابة هذه الوثيقة ([w.media](https://w.media/?p=43003)).
3. **Vault مرفوض**: يحتاج تشغيلًا عالي التوفر وفك ختم وترقيات، ولا يضيف لهذا الحجم ما يبرر ذلك.
4. **التكلفة**: مفتاح HSM واحد لكل بيئة، وبضعة آلاف عملية يوميًا. التكلفة الشهرية دولارات قليلة.

### 2.8 المراقبة (F-P03)

| الجانب | الأداة | الإعداد |
|---|---|---|
| الأخطاء والأداء | Sentry (مشروع `backend`) | `send_default_pii=false`، و`traces_sample_rate` بقيمة 0.1 في prod و1.0 في staging، و`release` = git SHA. الوسوم: `tenant_id`، و`module`، و`queue`، و`job`. و`before_send` يحجب الحقول الحساسة |
| المهام المجدولة | Sentry Crons | `->sentryMonitor()` على كل مهمة مجدولة ([Sentry Crons](https://docs.sentry.io/platforms/php/guides/laravel/crons/)) |
| التوفر | Sentry Uptime كل دقيقة | `https://api.intishar.sa/up`، و`/api/app/v1/t/{probe}/flags` بمستأجر اختباري (عبر الـ CDN)، و`https://app.intishar.sa` ([Uptime Monitoring](https://docs.sentry.io/product/uptime-monitoring/)) |
| السجلات | Monolog JSON إلى stdout، ثم خدمة السجلات لدى المزود (D-06) | الحقول: `ts`، و`level`، و`msg`، و`channel`، و`request_id`، و`trace_id`، و`tenant_id`، و`actor`، و`module`، و`env`، و`release`. ومعالج حجب للمفاتيح المطابقة لـ `/token\|secret\|password\|authorization\|code/i`، ولقيم JWT و`def50…`. الاحتفاظ 30 يومًا |
| المؤشرات | واجهة `Metrics` (`increment`، و`timing`، و`gauge`) | المحرك الافتراضي `log`، يكتب سطر `metric` منظمًا، فتُبنى منه مؤشرات وتنبيهات في خدمة المزود. ولاحقًا `otlp` دون تغيير الكود |
| الجاهزية | `/up` (حيوية Laravel)، و`/health/ready` (spatie/laravel-health: القاعدة، وRedis، وHorizon، ونبض الجدولة، وطول الطوابير، والقرص) | `/health/ready` مفصّل بترويسة رمز داخلي، ومختصر للموازن |
| الطوابير | Horizon | `horizon:snapshot` كل 5 دقائق. وحدود `waits` لكل طابور (2.9)، وتنبيه بالبريد عند تجاوزها |
| انهيارات التطبيق (M01) | Sentry (مشروع `mobile`) | **اصطلاح**: `release` = `{bundle_id}@{version}+{build}`، فتُحسب نسبة الجلسات الخالية من الانهيار لكل تاجر تلقائيًا (مؤشر PRD ≥ 99.5%)، مع وسمي `tenant_id` و`app_id` |
| اللوحة (M15) | Sentry (مشروع `dashboard`) | الوسوم نفسها |

**التنبيهات** (القناة: بريد الفريق، وتطبيق Sentry على الجوال):

| التنبيه | الشرط | المستوى |
|---|---|---|
| أخطاء جديدة أو متصاعدة | خطأ جديد في prod، أو أكثر من 50 حدثًا في 10 دقائق | P2، ثم P1 إن مس `/app/v1` |
| التوفر | فشل فحصين متتاليين لأي هدف Uptime | P1 |
| مهمة مجدولة | فاتت أو فشلت (Crons) | P1 لمهام الرموز والصحة، وP2 لغيرها |
| انتظار الطابور | أكثر من الحد في 2.9 لمدة 5 دقائق | P2، وP1 لـ `zid-webhooks` و`critical` |
| المهام الفاشلة | أكثر من 20 في الساعة | P2 |
| الأسرار | أي `decrypt` فاشل، أو KMS غير متاح أكثر من دقيقتين | P1 |
| القاعدة | الاتصالات فوق 80%، أو القرص فوق 80%، أو تأخر النسخ | P2 |

### 2.9 الطوابير والجدولة

| الطابور | الاستخدام | المشرف (Horizon) | العمليات (أدنى-أقصى) | المهلة (ث) | المحاولات | حد الانتظار للتنبيه |
|---|---|---|---|---|---|---|
| `critical` | رموز الدخول بالبريد، وإشعارات الأمان | `sv-critical` | 1-3 | 30 | 3 | 30 ثانية |
| `zid-webhooks`، و`zid-events` | M10 | `sv-integrations` | 2-8 | 60 | 5 | 60 ثانية |
| `push` | M06 | `sv-push` | 2-10 | 120 | 3 | 120 ثانية |
| `default` | العام | `sv-default` | 1-4 | 90 | 3 | 5 دقائق |
| `zid-sync`، و`zid-maintenance`، و`maintenance` | الاستيراد، والتوفيق، والتنظيف | `sv-background` (اتصال `redis-long`) | 1-3 | 600 | 3 | 30 دقيقة |
| `builds` | M13: التنسيق ومتابعة CI | `sv-builds` (اتصال `redis-long`) | 1-2 | 300 | 5 | 10 دقائق |

```php
// config/horizon.php (مقتطف production)
'environments' => [
    'production' => [
        'sv-critical'     => ['connection' => 'redis', 'queue' => ['critical'], 'balance' => 'auto',
                              'minProcesses' => 1, 'maxProcesses' => 3, 'timeout' => 30, 'tries' => 3],
        'sv-integrations' => ['connection' => 'redis', 'queue' => ['zid-webhooks', 'zid-events'],
                              'balance' => 'auto', 'autoScalingStrategy' => 'time',
                              'minProcesses' => 2, 'maxProcesses' => 8, 'timeout' => 60, 'tries' => 5],
        'sv-push'         => ['connection' => 'redis', 'queue' => ['push'], 'balance' => 'auto',
                              'minProcesses' => 2, 'maxProcesses' => 10, 'timeout' => 120, 'tries' => 3],
        'sv-default'      => ['connection' => 'redis', 'queue' => ['default'],
                              'minProcesses' => 1, 'maxProcesses' => 4, 'timeout' => 90, 'tries' => 3],
        'sv-background'   => ['connection' => 'redis-long', 'queue' => ['zid-sync', 'zid-maintenance', 'maintenance'],
                              'minProcesses' => 1, 'maxProcesses' => 3, 'timeout' => 600, 'tries' => 3],
        'sv-builds'       => ['connection' => 'redis-long', 'queue' => ['builds'],
                              'minProcesses' => 1, 'maxProcesses' => 2, 'timeout' => 300, 'tries' => 5],
    ],
],
'waits' => ['redis:critical' => 30, 'redis:zid-webhooks' => 60, 'redis:push' => 120,
            'redis:default' => 300, 'redis-long:zid-sync' => 1800, 'redis-long:builds' => 600],
```

**قواعد المهام**:
- **`retry_after` أكبر من أطول مهلة في الاتصال**: 150 ثانية لاتصال `redis`، و900 ثانية لـ `redis-long`.
- **توجيه الطوابير** في provider كل وحدة عبر `Queue::route(Job::class, connection: …, queue: …)`، وهي ميزة جديدة في Laravel 13 ([Release notes](https://laravel.com/docs/13.x/releases)). فلا يُكتب اسم الطابور داخل كل مهمة.
- **مهام المستأجر لا تمرر نماذج Eloquent** (`SerializesModels`)، بل المعرّفات وخاصية `public string $tenantId`.
  - السبب: النطاق العام يرفض الاستعلام قبل ضبط السياق.
  - الوسيط `WithTenant` يضبط السياق بعد فك التسلسل.
  - المهام العامة تنفّذ الواجهة `SystemJob`.
  - اختبار معمارية يفرض أحد الخيارين.
- **أنماط الوقاية**: `ShouldBeUnique` لما لا يجوز تكراره، و`WithoutOverlapping` للتحديث المتزامن، و`#[DebounceFor]` للأحداث المتلاحقة، و`RateLimitedWithRedis` للحدود الخارجية ([Queues](https://laravel.com/docs/13.x/queues)).
- **المهام الفاشلة**: في `failed_jobs` (`database-uuids`)، وتُحذف بعد 14 يومًا (`queue:prune-failed --hours=336`).

**الجدولة**: عملية `scheduler` واحدة (`php artisan schedule:work`) بنسخة واحدة. وكل مهمة تُعرَّف في provider وحدتها بالسلسلة `->onOneServer()->withoutOverlapping()->sentryMonitor()` ([Scheduling](https://laravel.com/docs/13.x/scheduling)). والتوقيت بـ UTC، والتعليقات بتوقيت الرياض.

| المهمة | التكرار | الوحدة |
|---|---|---|
| `horizon:snapshot` | كل 5 دقائق | M12 |
| `queue:prune-failed --hours=336` | يوميًا | M12 |
| `auth:prune-login-codes` | كل ساعة | M12 |
| `idempotency:prune` | كل ساعة | M12 |
| `audit:prune --months=24` | يوميًا | M12 |
| `sessions:prune-expired` | يوميًا | M12 |
| `flags:expire-overrides` | كل 5 دقائق | M12 |
| `secrets:rewrap` | كل ربع سنة | M12 |
| `backup:run --only-db` | أسبوعيًا (الجمعة 01:00 بتوقيت الرياض) | M12 |
| `backup:clean`، و`backup:monitor` | يوميًا | M12 |
| `health:schedule-check-heartbeat` | كل دقيقة | M12 |
| `zid:tokens:refresh-due`، و`zid:webhooks:health`، و`zid:reconcile`، و`zid:receipts:redispatch` | انظر [M10](M10-zid-connector.md) | M10 |

### 2.10 البيئات والنشر

| البيئة | النطاقات | البيانات | تطبيق زد | النشر | ملاحظات |
|---|---|---|---|---|---|
| local | `api.intishar.test` و`app.intishar.test` (Laravel Herd أو Caddy)، و`SESSION_DOMAIN=.intishar.test` | بذور وfixtures | `local` أو Zid Bridge | Docker Compose: `pgsql:17` و`redis:7` و`mailpit` | Telescope مفعّل، وKMS بالمحرك `local` |
| staging | **نطاق أب منفصل**، مثل `api.intishar-staging.com` و`app.intishar-staging.com` | متجر زد التطويري، ولا بيانات حقيقية | `staging` | تلقائي بعد الدمج في `main` | Sentry `environment=staging`، وKMS حقيقي بمفتاح منفصل |
| prod | `api.intishar.sa` و`app.intishar.sa` | حقيقية | `public` و`pilot` | يدوي بموافقة، بالصورة نفسها التي اختُبرت في staging | — |

**لماذا staging على نطاق أب منفصل**: الـ cookie المضبوطة على `.intishar.sa` في prod تُرسل إلى كل نطاق فرعي. فلو كان staging تحته، لوصلت جلسات prod إلى خوادم staging.

**الحاوية وأنواع العمليات**: صورة واحدة (`php:8.4-fpm` مع nginx) بثلاث عمليات:

| العملية | الأمر | النسخ |
|---|---|---|
| `web` | — | 2 أو أكثر |
| `horizon` | `php artisan horizon` | 1 أو أكثر |
| `scheduler` | `php artisan schedule:work` | 1 بالضبط |

- عند البدء: `php artisan optimize`.
- بعد النشر: `php artisan horizon:terminate`.

**خط CI/CD** (GitHub Actions):
1. **عند كل PR**:
   - `pint --test`، و`phpstan` (Larastan)، و`pest --parallel`. والخدمات: PostgreSQL 17 وRedis.
   - اختبارات المعمارية والعزل.
   - تصدير OpenAPI، والفشل إن تغيّر دون commit.
   - `migrate:fresh` ثم `migrate:rollback --step=1` للتحقق من قابلية التراجع.
   - **الهدف**: 10 دقائق أو أقل.
2. **عند الدمج في `main`**: بناء الصورة ووسمها بالـ SHA، ثم النشر إلى staging: `migrate --force` كخطوة قبل تحويل الحركة، ثم اختبارات دخان.
3. **إلى prod**: موافقة يدوية على الصورة نفسها، وتسجيل الإصدار في Sentry.

**قواعد الترحيل دون توقف**: expand ثم contract.
- لا حذف ولا إعادة تسمية لعمود في نفس إصدار الكود الذي يتوقف عن استخدامه.
- الفهارس الكبيرة بـ `CREATE INDEX CONCURRENTLY`، مع `public $withinTransaction = false` في الترحيل.
- كل ترحيل له `down()`. أو يُوسم «لا رجعة» مع خطة.

### 2.11 النسخ الاحتياطي والاستعادة

| المصدر | الآلية | الاحتفاظ | الهدف |
|---|---|---|---|
| PostgreSQL | PITR مُدار (WAL مستمر) | 14 يومًا | RPO ≤ 5 دقائق |
| PostgreSQL | لقطة يومية مُدارة | 30 يومًا | — |
| PostgreSQL | نسخة منطقية أسبوعية (`spatie/laravel-backup`، `pg_dump`، مشفرة) إلى تخزين في **حساب أو مشروع منفصل** | 8 أسبوعية و12 شهرية | حماية من خطأ على مستوى الحساب |
| تخزين الكائنات (الوسائط، والأصول، ومخرجات البناء) | Versioning ودورة حياة | النسخ غير الحالية 30 يومًا | — |
| Redis | لا نسخ. ليس مصدر حقيقة | — | الأنماط «القاعدة أولًا» (إيصالات M10، والتوفيق) تعيد بناء ما فُقد |
| مفاتيح KMS | لا تُنسخ ولا تُتلف | دائم | فقدها يعني فقد كل الأسرار |

**دليل الاستعادة**:
1. استعادة لنقطة زمنية إلى نسخة جديدة.
2. تشغيل `php artisan migrate:status` واختبارات الدخان على النسخة.
3. تحويل الاتصال (تغيير السر في Secret Manager، ثم إعادة تشغيل العمليات).
4. `zid:webhooks:health --all` و`zid:reconcile --since=<لحظة العطل>` لتعويض الأحداث.
5. إعادة إرسال الإيصالات المعلقة.
6. تقرير.

**الهدف**: RTO ≤ 4 ساعات. وتمرين استعادة كل ربع سنة إلى قاعدة جانبية، وتسجيل الزمن الفعلي في سجل التشغيل.

**استعادة مستأجر واحد** (Should، CORE-18): استعادة جانبية، ثم الأمر `tenancy:export {tenant}` لنسخ صفوفه.

### 2.12 Next.js
لا مكونات هنا. M15 يبني شاشات الإدارة والأعلام والتدقيق وصفحات الدخول على العقود في القسم 5، وعميل الـ API بالقواعد في 2.4.

## 3. التدفقات

### 3.1 دخول التاجر برمز البريد
1. Next.js يطلب `GET /sanctum/csrf-cookie`، والرد 204 مع الـ cookie `XSRF-TOKEN`.
2. `POST /api/v1/auth/email/code` بالجسم `{"email":"owner@alward.sa"}`، والرد **202 دائمًا**.
   - إن وُجد المستخدم وحالته نشطة: يُولَّد رمز ويُخزَّن hash له، ويُرسل البريد عبر الطابور `critical` بلغة المستخدم.
3. `POST /api/v1/auth/email/verify` بالجسم `{"email":"…","code":"482913"}`:
   1. يُتحقق من الرمز، ويُزاد عدّاد المحاولات. وبعد 5 محاولات يُقفل الرمز.
   2. عند النجاح: `Auth::guard('web')->login($user)`، ثم `session()->regenerate()`.
   3. يُضبط `auth_started_at`، ويُضبط `email_verified_at` إن كان فارغًا، ويُسجَّل `auth.login`.
   4. الرد 200 بجسم `/api/v1/me`.
4. **الخطأ**:
   - رمز خاطئ أو منتهٍ: 422 `login_code_invalid`.
   - تجاوز الحد: 429 `rate_limited` مع `Retry-After`.

### 3.2 تسليم الجلسة من callback زد (عقد مع ZID-04)
1. M10 يستدعي `Modules\Tenancy\Contracts\ZidHandoff::complete(StoreIdentity $store, string $tenantId): RedirectResponse` داخل طلب الـ callback. والمسار في مجموعة `web`، فالجلسة متاحة.
2. **إن كان المتصفح فيه جلسة `web`**:
   - المستخدم عضو في المستأجر: تحويل إلى `app.intishar.sa/{tenant}/onboarding` (M15).
   - المستخدم ليس عضوًا: `session(['pending_link' => $tenantId])`، ثم تحويل إلى `app.intishar.sa/connect/confirm`.
3. **إن لم توجد جلسة**:
   - المستأجر جديد ولا يوجد مستخدم ببريد المتجر: يُنشأ مستخدم بعضوية `owner`، ويُسجَّل دخوله (التاجر أثبت ملكيته للمتجر عبر OAuth)، ثم تحويل إلى `/{tenant}/onboarding`.
   - المستأجر موجود وله مالك: `pending_link`، ثم تحويل إلى `/connect/sign-in`.
   - يوجد مستخدم بالبريد نفسه: **لا ربط بالتطابق**. `pending_link`، ثم تحويل إلى `/connect/sign-in`.
4. `POST /api/v1/connect/confirm` (بعد الدخول) ينشئ العضوية من `pending_link` فقط إن كان صاحب الجلسة قد دخل بعد بدء الربط، ويسجّل `membership.created`.
5. **إعادة تثبيت لمستأجر له مالك**، والمتصفح فيه جلسة المالك نفسه: لا سؤال، بل تحويل إلى `/{tenant}`.

### 3.3 دخول الإدارة
1. `GET /sanctum/csrf-cookie`، ثم `POST /api/v1/auth/login` بالجسم `{email, password}` (إجراءات Fortify بحارس `admin`، ومسارات مخصصة بأسماء M15). والرد `{"two_factor": true}`.
2. `POST /api/v1/auth/two-factor` بالجسم `{code}` أو `{recovery_code}`. ويُرفض الدخول إن لم يُفعَّل TOTP بعد، فيُوجَّه المدير إلى تفعيله أولًا.
3. الوسيط `admin.2fa` يتحقق في كل طلب. والوسيط `admin.ip` يتحقق إن ضُبطت قائمة IP. ومدد الجلسة في 2.4.

### 3.4 تقييم الأعلام وendpoint الأعلام للتطبيق (M01)
1. التطبيق يرسل `GET {CONFIG_CDN_URL}/api/app/v1/t/{tenant}/flags` مع `If-None-Match`، وترويسات M01 (`X-App-Version` و`X-Platform`) للتسجيل فقط.
2. يمر الطلب بالـ CDN، ومفتاح التخزين هو المسار وحده. **الرد لا يختلف بإصدار التطبيق ولا بمنصته**:
   - الرد يحمل قيم iOS وأندرويد معًا.
   - التطبيق يقارن إصداره بـ `min_supported_version` بنفسه.
   - فيبقى الرد قابلًا للتخزين دون `Vary`.
3. عند وصول الطلب إلى الأصل، يعمل الوسيط `tenant.public`، ثم `FlagsComposer`:
   1. يقرأ `FlagSet` المجمّع للمستأجر من Redis (`t:{tenant}:flags:v{n}`)، أو يحسبه.
   2. يستدعي كل `RuntimeContributor`. وM11 يضيف `config` و`blocks` (M11، القسم 5.2).
   3. يحسب ETag من `hash(flags_version, contributors)`.
4. **ترتيب تقييم كل علم** (أول قيمة موجودة تفوز):
   1. مفتاح إيقاف عام مفعّل.
   2. تجاوز للمستأجر.
   3. تجاوز عام.
   4. استحقاق مربوط (`entitlement_feature`)، من `EntitlementsProvider` في M10. وإن لم يملكه المستأجر تكون القيمة `false`.
   5. القيمة الافتراضية.
5. **الرد**:
   - 304 إن طابق ETag.
   - وإلا 200 مع `Cache-Control: public, max-age=60, stale-while-revalidate=300, stale-if-error=86400`، و`Cache-Tag: t-{tenant},flags`.
6. **عند تغيير علم**:
   1. `flags_version++`، فيُبطل المخبأ في Redis، ويُسجَّل التغيير في التدقيق.
   2. يُستدعى `CdnPurger` (M11) بالوسم: `t-{tenant}` لتجاوز مستأجر، و`flags` لمفتاح إيقاف عام. فيظهر الأثر فورًا، والحد الأعلى 60 ثانية إن فشل الإبطال. وهذا ضمن مؤشر PRD «≤ 5 دقائق».
7. **الخطأ**:
   - `{tenant}` مجهول: 404 `tenant_not_found`، ويُخزَّن 60 ثانية (مطابق لـ M11).
   - الأصل معطل: الـ CDN يخدم آخر نسخة (`stale-if-error`).

### 3.5 كتابة سر وقراءته
1. التاجر يرفع مفتاح App Store Connect (M14) بالطلب `POST /api/v1/secrets/asc-api-key` (multipart). يتحقق M13 من الصيغة، ثم `SecretVault::forModule('Builds')->put($tenant, 'asc_api_key', $payload, $meta)`.
2. **الخزنة**:
   1. تولّد DEK، وتشفّر المحتوى، وتغلّف DEK عبر KMS.
   2. تكتب صف `vault_secrets` (version = آخر نسخة + 1، و`status=active`)، وتحوّل السابق إلى `previous`.
   3. تسجّل `secret.created` أو `secret.rotated` في التدقيق. والرد يحمل البيانات الوصفية فقط.
3. **القراءة** (`get`): من مخبأ العملية، أو فك التغليف عبر KMS. ويُحدَّث `last_used_at` بحد كتابة واحدة في الساعة.
4. **KMS غير متاح**:
   - القراءة من المخبأ تعمل حتى 5 دقائق، ثم 503 `secrets_unavailable`.
   - الكتابة تفشل فورًا بـ 503.
   - تنبيه P1.

### 3.6 طلب بمفتاح عدم التكرار
1. العميل يرسل `POST /api/v1/…` مع `Idempotency-Key: 01JCF…` على المسارات المعلّمة (القسم 5.1).
2. الوسيط يحسب `scope = tenant_id|actor_id|METHOD|route`، و`request_hash = sha256(body)`.
3. يأخذ القفل `idem:{scope}:{key}` لمدة 30 ثانية.
   - إن لم يتمكن: 409 `idempotency_in_progress`.
4. **صف موجود**:
   - `request_hash` نفسه: يعيد الرد المخزن مع `Idempotent-Replayed: true`.
   - `request_hash` مختلف: 422 `idempotency_key_reused`.
5. **صف غير موجود**: ينفذ الطلب. ثم يخزن الحالة والجسم إن كان الرد 2xx أو 4xx (عدا 409 و429)، لمدة 24 ساعة.
   - ومعنى `tenant_id` في `scope` هو المستأجر من المسار.
6. أخطاء 5xx لا تُخزَّن، فيمكن إعادة المحاولة بالمفتاح نفسه.

### 3.7 مهمة في الطابور بسياق مستأجر
1. الإرسال: `SendCampaign::dispatch(tenantId: $t, campaignId: $c)`.
2. عند المعالجة: `middleware()` يعيد `[new WithTenant($this->tenantId)]`.
3. الوسيط:
   1. يحمّل المستأجر دون نطاق.
   2. يتحقق أن حالته تسمح بالعمل. والحالات `offboarded` و`suspended` تُرفض حسب نوع المهمة.
   3. يضبط `TenantContext` و`Context`، ثم ينفّذ، ثم يمسح السياق في `finally`.
4. تحميل النماذج داخل `handle()` بعد ضبط السياق.

### 3.8 النشر والترحيل
1. الدمج في `main`.
2. CI يبني الصورة.
3. خطوة الإصدار: `php artisan migrate --force` بمستخدم قاعدة له صلاحيات الترحيل، ثم `php artisan optimize`.
4. تحويل الحركة تدريجيًا، ثم `horizon:terminate` فيعيد المشرف تشغيل Horizon بالصورة الجديدة، وإعادة تشغيل `scheduler`.
5. اختبارات دخان: `/up`، و`/health/ready`، و`/api/app/v1/t/{probe}/flags`.
6. تسجيل الإصدار في Sentry.
7. **عند فشل الدخان**: رجوع إلى الصورة السابقة. والترحيلات متوافقة للخلف بقاعدة expand ثم contract، فلا تُعكس.

## 4. نموذج البيانات

### 4.1 جداول M12

| الجدول | الحقول الأساسية | الفهارس والقيود |
|---|---|---|
| `tenants` | `id` (ULID داخلي)، و`public_id` (مثل `t_8f2k1q9x3m`، ثابت)، و`platform` (`zid`)، و`external_store_uuid`، و`external_store_id`، و`name` (jsonb: ar وen)، و`status` (`provisioning`، أو `connected_setup_required`، أو `active`، أو `suspended`، أو `disconnected`، أو `offboarded`)، و`status_reason`، و`primary_locale`، و`timezone`، و`created_at`، و`activated_at`، و`disconnected_at`، و`offboard_after` | فريد (`public_id`)، وفريد (`platform`, `external_store_uuid`)، وفهرس (`status`) |
| `users` | `id`، و`name`، و`email` (citext)، و`email_verified_at`، و`locale` (`ar` أو `en`)، و`status` (`active` أو `disabled`)، و`last_login_at`، و`created_at` | فريد (`email`) |
| `memberships` | `id`، و`tenant_id`، و`user_id`، و`role`، و`invited_by_user_id`، و`created_at` | فريد (`tenant_id`, `user_id`)، وفهرس (`user_id`) |
| `login_codes` | `id`، و`email`، و`code_hash`، و`attempts`، و`expires_at`، و`consumed_at`، و`ip_hash` | فهرس (`email`, `expires_at`)، ويُحذف بعد 24 ساعة |
| `sessions` | جدول Laravel الافتراضي، مع `user_id` و`guard` | فهرس (`user_id`) |
| `admin_users` | `id`، و`name`، و`email`، و`password`، و`two_factor_secret` (مشفر)، و`two_factor_recovery_codes` (مشفر)، و`two_factor_confirmed_at`، و`role` (`super_admin` أو `ops` أو `support`)، و`status`، و`last_login_at` | فريد (`email`) |
| `audit_events` | `id` (ULID)، و`occurred_at`، و`tenant_id` (nullable)، و`actor_type`، و`actor_id`، و`action`، و`subject_type`، و`subject_id`، و`changes` (jsonb محجوب)، و`ip` (inet)، و`user_agent` (أول 255 حرفًا)، و`request_id`، و`metadata` (jsonb) | فهرس (`tenant_id`, `occurred_at desc`)، وفهرس (`action`, `occurred_at`)، وفهرس (`actor_type`, `actor_id`) |
| `feature_flags` | `key` (pk، مثل `app.feature.brand_strip`)، و`description`، و`value_type` (`bool` أو `string` أو `int` أو `json`)، و`default_value` (jsonb)، و`is_kill_switch`، و`expose_to` (`server` أو `dashboard` أو `app`)، و`entitlement_feature` (nullable)، و`owner_module`، و`review_by` (تاريخ مراجعة إزالة العلم) | — |
| `feature_flag_overrides` | `id`، و`flag_key`، و`scope` (`global` أو `tenant`)، و`tenant_id`، و`value` (jsonb)، و`reason`، و`created_by_admin_id`، و`expires_at`، و`created_at` | فريد (`flag_key`, `scope`, `tenant_id`) |
| `app_version_policies` | `id`، و`scope` (`global` أو `tenant`)، و`tenant_id`، و`platform` (`ios` أو `android`)، و`min_supported`، و`latest`، و`force_update_message` (jsonb)، و`updated_by_admin_id` | فريد (`scope`, `tenant_id`, `platform`) |
| `vault_secrets` | `id`، و`tenant_id` (nullable لأسرار المنصة)، و`type`، و`version`، و`status` (`active` أو `previous` أو `destroyed`)، و`ciphertext` (bytea)، و`nonce`، و`tag`، و`wrapped_dek` (bytea)، و`kek_ref` (اسم المفتاح ونسخته)، و`aad_hash`، و`metadata` (jsonb غير سري: `key_id`، و`team_id`، و`fingerprint`، و`expires_at`)، و`created_by`، و`created_at`، و`last_used_at`، و`destroyed_at` | فريد (`tenant_id`, `type`, `version`)، وفهرس جزئي (`tenant_id`, `type`) حيث `status='active'` |
| `idempotency_keys` | `id`، و`scope_hash`، و`key`، و`request_hash`، و`response_status`، و`response_body` (jsonb)، و`created_at`، و`expires_at` | فريد (`scope_hash`, `key`)، وفهرس (`expires_at`) |
| `failed_jobs`، و`jobs` غير مستخدم، و`cache_locks` غير مستخدم | افتراضي Laravel | — |

### 4.2 نظرة عامة على الجداول الأساسية لكل الوحدات

التفصيل الملزم في مواصفة كل وحدة، ثم في `05-data-model.md`. وهذه الصورة للربط فقط، بالأسماء كما وردت في مواصفات الوحدات يوم كتابة هذه الوثيقة:

| الوحدة | الجداول الأساسية |
|---|---|
| Tenancy وPlatform ([M12](M12-platform-core.md)) | `tenants`، و`users`، و`memberships`، و`admin_users`، و`login_codes`، و`sessions`، و`audit_events`، و`feature_flags`، و`feature_flag_overrides`، و`app_version_policies`، و`vault_secrets`، و`idempotency_keys` |
| ZidConnector ([M10](M10-zid-connector.md)) | `zid_apps`، و`zid_installations`، و`zid_subscriptions`، و`plan_catalog`، و`tenant_entitlements`، و`zid_webhook_subscriptions`، و`zid_webhook_receipts`، و`zid_app_events`، و`zid_order_refs`، و`zid_abandoned_cart_refs`، و`zid_products`، و`zid_categories`، و`zid_store_profiles`، و`zid_sync_runs` |
| AppConfig ([M11](M11-app-config-service.md)، و[M02](M02-theming-i18n.md)) | `config_documents`، و`config_variants`، و`config_drafts`، و`config_versions`، و`config_releases`، و`config_publications`، و`assets`، و`asset_usages`، و`zid_imports`، و`zid_section_bindings`، و`zid_section_snapshots`، و`presets`، و`font_families` |
| Engagement ([M09](M09-in-app-engagement.md)) | `eng_announcements`، و`eng_popups`، و`eng_welcome_flows`، و`eng_settings` |
| Push ([M06](M06-notifications.md)) | `push_firebase_projects`، و`push_tenant_apps` (`apns_secret_ref` يشير إلى `vault_secrets`)، و`push_devices`، و`push_order_links`، و`push_campaigns`، و`push_automations`، و`push_settings`، و`push_messages`، و`push_dedup`، و`push_sequences`، و`push_pending_sends`، و`push_attributions`، و`push_campaign_stats`، و`push_daily_stats`، و`push_pairing_codes` |
| Orders ([M05](M05-account-orders.md)) | `shopper_sessions`، و`order_status_events` |
| Analytics ([M08](M08-analytics.md)) | `anl_events` (مقسّم يوميًا)، و`anl_orders`، و`anl_daily_tenant_metrics`، و`anl_daily_active_devices`، و`anl_daily_block_metrics`، و`anl_daily_push_metrics`، و`anl_crash_stats_daily`، و`anl_tenant_settings` |
| Links ([M07](M07-deep-links.md)) | `tenant_link_config`، و`link_slug_history`، و`campaign_links`، و`link_fallback_daily` |
| Onboarding ([M14](M14-merchant-onboarding.md)) | `onboardings`، و`onboarding_steps`، و`store_credentials` (`vault_ref` يشير إلى `vault_secrets`)، و`onboarding_notifications`، و`support_escalations` |
| Builds ([M13](M13-build-release.md)) | `store_apps`، و`release_trains`، و`builds`، و`build_events`، و`store_listings`، و`listing_assets`، و`store_submissions` |

```text
                               ┌──────────────────────┐
             ┌────────────────▶│ tenants (public_id)  │◀──────────────────────────────┐
             │                 └──────────┬───────────┘                               │
             │ tenant_id                  │ 1..n                                      │ tenant_id
   ┌─────────┴───────┐      ┌─────────────┴──────┐      ┌──────────────────────────┐  │
   │  memberships    │      │  zid_installations │──1:n─│ zid_webhook_subscriptions│  │
   │ (user_id, role) │      │ (token_secret_id) ─┼──┐   └──────────────────────────┘  │
   └─────────┬───────┘      └──────────┬─────────┘  │                                 │
             │ n:1                     │ 1:1        │   ┌──────────────────────┐      │
   ┌─────────┴───────┐      ┌──────────┴─────────┐  └──▶│    vault_secrets     │◀─────┤ store_credentials.vault_ref (M14)
   │     users       │      │ zid_subscriptions  │      │ (tenant_id, type, v) │◀─────┤ push_tenant_apps.apns_secret_ref (M06)
   └─────────────────┘      └──────────┬─────────┘      └──────────────────────┘      │
                                       ▼                                              │
                            ┌────────────────────┐   ┌───────────────────────┐        │
                            │ tenant_entitlements│   │ feature_flag_overrides│────────┤
                            └────────────────────┘   └───────────────────────┘        │
   ┌─────────────────┐  ┌──────────────────────┐  ┌───────────────┐  ┌──────────────┐  │
   │ zid_products    │  │ config_documents     │  │ store_apps    │  │ push_devices │──┤
   │ zid_categories  │  │  └1:n config_variants│  │ builds        │  │ push_campaign│  │
   │ zid_order_refs  │  │     └ config_versions│  │ store_submiss.│  │ push_messages│  │
   └────────┬────────┘  └──────────┬───────────┘  └───────┬───────┘  └──────┬───────┘  │
            └──────────────────────┴──────── tenant_id ───┴─────────────────┴──────────┘
   audit_events (tenant_id nullable, actor_type/actor_id) ── يشير بالمعرّف إلى أي كيان
```

### 4.3 ما على الجهاز وما على الخادم
M12 لا يخزن شيئًا على جهاز المتسوق.
- **التطبيق** (M01): يخزن آخر رد من endpoint الأعلام مع ETag للعمل دون اتصال، وقيم `DEFAULT_FLAGS` المحقونة وقت البناء.
- **اللوحة**: تعتمد على cookie الجلسة (HttpOnly)، و`XSRF-TOKEN`. ولا تخزن أي رمز في `localStorage`.

## 5. الواجهات والعقود

### 5.1 اصطلاحات الـ API (ملزمة لكل الوحدات)

**مجموعات المسارات**:

| المجموعة | البادئة | المصادقة | المستهلك |
|---|---|---|---|
| لوحة التاجر | `/api/v1/tenants/{tenant}/…`، ومعها `/api/v1/me` | جلسة `web` و`tenant.member` | Next.js |
| الإدارة | `/api/v1/admin/…` | جلسة `admin` و`admin.2fa` | Next.js (منطقة الإدارة) |
| الدخول | `/api/v1/auth/…`، و`/sanctum/csrf-cookie` | — | Next.js |
| تطبيق المتسوق | `/api/app/v1/t/{tenant}/…` (أعلام وإعداد عامة خلف CDN، وأجهزة الإشعارات في M06) | المعرّف العام في المسار، وما يلزم M06 للأجهزة | Flutter |
| التكاملات | `/zid/*` | حسب M10 | زد |
| التشغيل | `/up`، و`/health/ready` | — أو رمز داخلي | الموازن، وUptime |

**الإصدارات**:
- رقم رئيسي في المسار.
- داخل الإصدار تُسمح الإضافات فقط: حقل جديد أو endpoint جديد.
- `/api/app/v1` أشد التزامًا، لأن نسخ التطبيق القديمة تبقى لدى المتسوقين:
  - يجب أن يخدم كل إصدار تطبيق أعلى من `min_supported_version`.
  - الإصدار الرئيسي الجديد يُخدم بجانب القديم 12 شهرًا على الأقل.
- الإيقاف يُعلن بالترويستين `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745)) و`Sunset` ([RFC 8594](https://www.rfc-editor.org/rfc/rfc8594)).

**الصيغة**:
- JSON بترميز UTF-8، والمفاتيح snake_case.
- الوقت بصيغة RFC 3339 وبتوقيت UTC (`2026-11-10T12:01:44Z`).
- المال نص عشري مع عملة (`"price":"149.00","currency":"SAR"`).
- النصوص بلغتين `{"ar":"…","en":"…"}`.
- النجاح `{"data": …, "meta": {…}}`.
- **المعرّفات العامة** ULID ببادئة نوع: `usr_` للمستخدم، و`adm_` للمدير، وغيرها حسب الوحدة. والمستأجر وحده بمعرّفه العام القصير `t_…` (2.3).

**الأخطاء**: صيغة [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) (`application/problem+json`) مع الامتدادات `code` و`request_id` و`errors`.
- `code` ثابت بحروف صغيرة وشرطة سفلية (snake_case)، كما في M11 وM15.
- الرسالة حسب `Accept-Language` (`ar` افتراضيًا).

```json
{
  "type": "https://docs.intishar.sa/errors/validation_failed",
  "title": "تعذّر حفظ البيانات",
  "status": 422,
  "code": "validation_failed",
  "detail": "بعض الحقول غير صحيحة.",
  "request_id": "01JCF4A2M9X3K7P1Q5T8W2Z6RB",
  "errors": [
    { "field": "email", "code": "email", "message": "صيغة البريد غير صحيحة." }
  ]
}
```

| `code` | HTTP | متى |
|---|---|---|
| `unauthenticated` | 401 | لا جلسة |
| `csrf_token_mismatch` | 419 | رمز XSRF مفقود أو منتهٍ |
| `forbidden` | 403 | لا قدرة |
| `tenant_access_denied` | 403 | `{tenant}` ليس من عضويات المستخدم |
| `tenant_suspended` | 423 | المستأجر موقوف إداريًا |
| `entitlement_required` | 403 | الميزة ليست في خطة المستأجر (`feature` في الجسم) |
| `feature_disabled` | 404 | علم مطفأ أو مفتاح إيقاف |
| `not_found`، و`tenant_not_found` | 404 | — |
| `conflict` | 409 | تعارض نسخة (`If-Match`). والوحدات تعرّف رموزًا أدق، مثل `draft_conflict` في M11 |
| `idempotency_in_progress` | 409 | طلب بالمفتاح نفسه قيد التنفيذ |
| `idempotency_key_reused` | 422 | المفتاح نفسه بجسم مختلف |
| `validation_failed` | 422 | — |
| `login_code_invalid` | 422 | — |
| `rate_limited` | 429 | مع `Retry-After` |
| `secrets_unavailable` | 503 | — |
| `service_unavailable` | 503 | — |
| `internal_error` | 500 | دون تفاصيل داخلية |

**الترقيم**:
- **لوحة التاجر والتطبيق**: بالمؤشر. `?page[cursor]=…&page[size]=25` (أقصى 100)، والرد `meta: {next_cursor, page_size}`، كما في M15.
- **جداول الإدارة**: بالصفحات. `?page[number]=…&page[size]=…` والرد `meta: {page, page_size, total}`، داخل `/api/v1/admin` فقط.

**مفاتيح عدم التكرار**:
- الترويسة `Idempotency-Key` ([IETF draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/))، ULID أو UUID، بحد 64 حرفًا. والسلوك في 3.6.
- **إلزامية** على:
  - نشر صفحة (M11)
  - إرسال حملة أو جدولتها (M06)
  - طلب بناء، والتقديم للمراجعة (M13)
  - `resync` (M10)
  - رفع سر
  - أفعال الإدارة التي تغيّر الحالة
- **اختيارية** على بقية `POST`.

**حدود المعدّل** (محدِّدات مسماة في `AppServiceProvider` عبر `RateLimiter::for` ([Rate Limiting](https://laravel.com/docs/13.x/rate-limiting))):

| المحدِّد | المفتاح | الحد |
|---|---|---|
| `dashboard` | `user_id` | 120 في الدقيقة |
| `dashboard-write` | `user_id` | 30 في الدقيقة |
| `auth-code-send` | البريد، والـ IP | 3 كل 15 دقيقة لكل بريد، و20 في الساعة لكل IP |
| `auth-code-verify` | البريد | 10 كل 15 دقيقة |
| `admin` | `admin_id` | 300 في الدقيقة |
| `admin-login` | البريد والـ IP | 5 في الدقيقة |
| `app` | `X-Install-Id`، أو الـ IP | 300 في الدقيقة |
| `app-flags` | الـ IP | 60 في الدقيقة (الـ CDN يمتص معظمها) |
| `zid-ingest` | — | بلا حد. 429 لا يُحتسب فشلًا عند زد ([Webhook Health](https://docs.zid.sa/webhook-health-tracking-2197281m0))، فيمكن استخدامه عند الحمل الزائد |

**الترويسات العامة**:
- `X-Request-Id`: يُقبل من العميل، أو يُولَّد ULID. ويُعاد في الرد، ويظهر في السجلات وSentry.
- `Accept-Language`: `ar` أو `en`.
- **اللوحة**: `X-XSRF-TOKEN`، و`If-Match` للمسودات (M11)، و`Idempotency-Key`.
- **التطبيق** (من M01): `X-App-Version`، و`X-Platform`، و`X-OS-Version`، و`X-Install-Id`. للتسجيل فقط، ولا تدخل مفتاح الـ CDN.

**التوثيق الآلي**:
- Scramble يولّد OpenAPI 3.1 من الكود.
- `php artisan scramble:export --path=openapi/openapi.json` في CI.
- M15 يولّد أنواع TypeScript بـ `openapi-typescript`.
- واجهة Scramble للعرض في local وstaging فقط.

### 5.2 الدخول

| المسار | الطريقة | الجسم | الرد |
|---|---|---|---|
| `/sanctum/csrf-cookie` | GET | — | 204، مع الـ cookie `XSRF-TOKEN` |
| `/api/v1/auth/email/code` | POST | `{"email":"owner@alward.sa"}` | `202 {"data":{"status":"sent","expires_in":600}}` |
| `/api/v1/auth/email/verify` | POST | `{"email":"owner@alward.sa","code":"482913"}` | `200` بجسم `/api/v1/me` |
| `/api/v1/auth/zid/redirect` | GET | — | **Should (ZID-18)**: 302 إلى OAuth زد. وحتى ذلك الحين خلف العلم `dash.feature.zid_login` ويرد 404 |
| `/api/v1/auth/login` | POST | `{"email":"…","password":"…"}` (المدراء فقط، حارس `admin`) | `200 {"two_factor":true}` |
| `/api/v1/auth/two-factor` | POST | `{"code":"123456"}` أو `{"recovery_code":"…"}` | 204 |
| `/api/v1/auth/logout` | POST | — | 204، ويخرج من الحارس النشط |
| `/api/v1/auth/logout-others` | POST | — | 204 |

### 5.3 اللوحة: النواة

**`GET /api/v1/me?tenant=t_8f2k1q9x3m`**: الشكل الذي يستهلكه M15 (القسم 5.2 فيه)، داخل الغلاف `data`. وبلا `tenant` يكون `current_tenant` آخر متجر استخدمه المستخدم.

```json
{
  "data": {
    "user": { "id": "usr_01JC9X4T5A7B9C1D3E5F7G9H1J", "name": "نورة العتيبي", "email": "noura@example.sa", "kind": "merchant", "locale": "ar" },
    "tenants": [
      { "id": "t_8f2k1q9x3m", "name": "متجر ورد", "zid_store_id": 412823, "role": "owner", "status": "active" }
    ],
    "current_tenant": {
      "id": "t_8f2k1q9x3m",
      "role": "owner",
      "permissions": ["design.edit", "design.publish", "push.send", "builds.request", "builds.submit", "settings.manage", "analytics.view", "team.manage"],
      "entitlements": { "plan_code": "growth", "state": "trial", "features": { "push_campaigns": true, "ai_assistant": false, "scheduling": false } },
      "connection": { "status": "connected" },
      "app_locales": ["ar", "en"],
      "timezone": "Asia/Riyadh"
    },
    "flags": { "dash.preview_flutter": true, "dash.brand_strip": false },
    "pending_link": null
  }
}
```

- `kind` قيمته `merchant` أو `admin`، حسب الحارس.
- `flags` هي الأعلام ذات `expose_to=dashboard` للمستأجر الحالي.
- **`POST /api/v1/connect/confirm`**: الرد `200 {"data":{"tenant_id":"t_8f2k1q9x3m","role":"owner"}}`. وإن لم يوجد `pending_link` صالح: 422 `validation_failed`.

### 5.4 endpoint الأعلام للتطبيق (عقد مع M01 وM11)

**`GET {CONFIG_CDN_URL}/api/app/v1/t/{tenant}/flags`**، مع `If-None-Match`. الشكل كما يستهلكه M01 (القسم 5.1 فيه)، ويضيف إليه M11 الحقلين `config` و`blocks` عبر `RuntimeContributor`. والإضافة من M12 هي الكائن `service`.

```json
{
  "tenant_id": "t_8f2k1q9x3m",
  "generated_at": "2026-11-10T09:12:00Z",
  "app": {
    "ios": {
      "min_supported_version": "1.2.0",
      "latest_version": "1.4.0",
      "update_policy": "soft",
      "store_url": "https://apps.apple.com/app/id6737545437"
    },
    "android": {
      "min_supported_version": "1.2.0",
      "latest_version": "1.4.0",
      "update_policy": "soft",
      "store_url": "https://play.google.com/store/apps/details?id=sa.alward.app"
    }
  },
  "maintenance": {
    "active": false,
    "message": { "ar": "نحدّث المتجر، نعود خلال دقائق", "en": "We are updating the store" },
    "retry_after_seconds": 300
  },
  "service": {
    "suspended": false,
    "message": null,
    "fallback_url": "https://alward.sa"
  },
  "kill": {
    "checkout": false,
    "native_reviews_write": false,
    "zid.settings_endpoint": false
  },
  "features": {
    "wishlist": true,
    "brand_strip": false,
    "native_login_otp": false,
    "zid.csrf_header": false
  },
  "config": { "home": 1843, "app-shell": 12, "theme": 57 },
  "blocks": { "disabled": [ { "type": "countdown", "v": 1, "app_versions": ">=1.3.0 <1.3.2" } ] }
}
```

- **الترويسات**:
  - `ETag: W/"r-1842"`
  - `Cache-Control: public, max-age=60, stale-while-revalidate=300, stale-if-error=86400`
  - `Cache-Tag: t-t_8f2k1q9x3m,flags`
  - لا `Vary` على ترويسات مخصصة.
- **مصادر الحقول**:
  - `app`: من `app_version_policies` (التجاوز للمستأجر، ثم العام). و`store_url` من M13.
  - `maintenance`: من العلم `app.maintenance` وقيمته JSON.
  - `kill`: الأعلام `app.kill.*` دون البادئة.
  - `features`: الأعلام `app.feature.*` دون البادئة.
- **الحجم**: أقل من 2 KB (M01).
- **سلوك التطبيق** (M01):
  - `min_supported_version` أعلى من إصدار التطبيق: تحديث إجباري.
  - `maintenance.active`: شاشة صيانة مؤقتة.
  - `service.suspended`: شاشة «التطبيق غير متاح الآن» بزر يفتح `fallback_url`. **هذا حقل جديد يحتاج دعمًا في M01** (القسم 8).
  - `kill`: تعطيل المسار المعني.

**أعلام البداية** (تُزرع بالـ seeders، وكل وحدة تضيف أعلامها):

| المفتاح | النوع | الافتراضي | مفتاح إيقاف؟ | المرجع |
|---|---|---|---|---|
| `app.kill.checkout` | bool | false | نعم | عطل في صفحة الدفع (M01، M04) |
| `app.kill.native_reviews_write` | bool | false | نعم | M04 |
| `app.kill.zid.settings_endpoint` (ومثله لكل مسار غير موثق) | bool | false | نعم | المسارات غير الموثقة N\* (ADR-0003، وR-001) |
| `app.feature.wishlist` | bool | true | لا | F-S13 |
| `app.feature.brand_strip` | bool | false | لا | PRD 5.4 «خلف علم» |
| `app.feature.native_login_otp` | bool | false | لا | F-S11b وSPK-06 |
| `app.maintenance` | json | `{"active":false}` | لا | M01 |
| `app.service_suspended` | bool | false | نعم | M10: انتهاء الاشتراك، ويظهر في `service` |
| `dash.preview_flutter`، و`dash.brand_strip` | bool | — | لا | M15 |
| `dash.feature.zid_login` | bool | false | لا | ZID-18 |
| `dash.feature.ai_assistant` | bool | false | لا | F-M12 لاحقًا |
| `push.automation.abandoned_cart` | bool | true | لا | مربوط بالاستحقاق `push.automations` |
| `zid.customer_update_events`، و`zid.trust_product_payload` | bool | false | لا | M10 |

### 5.5 واجهات الإدارة (F-P01 Must، وF-P06 Should)

أسماء المسارات تطابق جدول الإدارة في M15 (`/admin/tenants`، و`/admin/flags`، و`/admin/monitoring`، و`/admin/audit-logs`). ومسارات `/admin/connections` و`/admin/webhooks` في M10، و`/admin/builds` في M13.

| المسار | الطريقة | الدور | الوصف |
|---|---|---|---|
| `/api/v1/admin/tenants?q=&status=&entitlement=&health=&page[number]=&page[size]=` | GET | support | قائمة المتاجر مع ملخص الصحة |
| `/api/v1/admin/tenants/{tenant}` | GET | support | التفاصيل المجمعة (أدناه) |
| `/api/v1/admin/tenants/{tenant}/suspend` و`/unsuspend` | POST | ops | `{"reason":"…"}`، مع `Idempotency-Key` |
| `/api/v1/admin/flags` | GET | support | كل الأعلام والتجاوزات |
| `/api/v1/admin/flags/{key}` | PUT | super_admin | القيمة العامة أو مفتاح الإيقاف: `{"value":true,"reason":"…"}` |
| `/api/v1/admin/flags/{key}/overrides/{tenant}` | PUT، وDELETE | ops | `{"value":true,"reason":"…","expires_at":"2026-12-31T00:00:00Z"}` |
| `/api/v1/admin/app-version-policies` | GET، وPUT | super_admin (العام)، وops (لمستأجر) | `{"scope":"tenant","tenant":"t_8f2k1q9x3m","platform":"ios","min_supported_version":"1.2.0","latest_version":"1.4.0","update_policy":"soft"}` |
| `/api/v1/admin/audit-logs?tenant=&actor_type=&action=&from=&to=&page[cursor]=` | GET | support | — |
| `/api/v1/admin/tenants/{tenant}/secrets` | GET | super_admin | البيانات الوصفية فقط |
| `/api/v1/admin/monitoring` | GET | support | الطوابير (من Horizon repository)، والمهام الفاشلة، وآخر تشغيل لكل مهمة مجدولة، وفحوص الجاهزية |
| `/api/v1/admin/admins` | GET، وPOST، وPATCH | super_admin | إدارة المدراء |
| `/api/v1/admin/tenants/{tenant}/config-snapshot` | GET | support | **Should، F-P06**: إعداد التاجر المنشور والمسودة للقراءة (من M11)، ويُسجَّل في التدقيق |
| `/api/v1/admin/tenants/{tenant}/preview-link` | POST | support | **Should، F-P06**: رابط معاينة صالح 15 دقيقة (M11 وSPK-15) |

**`GET /api/v1/admin/tenants/{tenant}`** (المكونات من `TenantHealthContributor` لكل وحدة):

```json
{
  "data": {
    "tenant": {
      "id": "t_8f2k1q9x3m",
      "name": { "ar": "متجر الورد", "en": "Alward" },
      "status": "active",
      "created_at": "2026-11-10T09:12:00Z"
    },
    "members": [{ "user_id": "usr_01JC9X4T5A7B9C1D3E5F7G9H1J", "email": "owner@alward.sa", "role": "owner", "last_login_at": "2026-11-10T10:02:00Z" }],
    "health": {
      "zid": { "status": "active", "webhooks": "healthy", "refresh_due_at": "2027-09-06T09:12:00Z" },
      "builds": { "last_build": "succeeded", "ios_version": "1.3.0", "android_version": "1.3.0" },
      "config": { "last_published_at": "2026-11-10T11:30:00Z" }
    },
    "entitlements": { "plan_code": "growth", "state": "trial", "source": "zid" },
    "flag_overrides": [{ "flag": "app.feature.brand_strip", "value": true, "expires_at": null }],
    "recent_audit": [{ "action": "layout.published", "occurred_at": "2026-11-10T11:30:00Z", "actor_type": "merchant_user" }]
  }
}
```

### 5.6 عقود PHP للوحدات

| العقد | المكان | الطرائق |
|---|---|---|
| `TenantContext` | Tenancy | `current(): ?Tenant`، و`id(): string` (يرمي إن غاب)، و`run(Tenant, Closure)`، و`runAsSystem(Closure, string $reason)`، و`isSystem(): bool` |
| `BelongsToTenant` (trait) و`TenantScope` | Tenancy | يُضاف إلى كل نموذج فيه `tenant_id` |
| `TenantRule` | Tenancy | `unique($table, $column)`، و`exists($table, $column)` |
| `TenantProvisioner` | Tenancy | `provision(StoreIdentity): Tenant`، ويُطابق على (`platform`, `external_store_uuid`)، ويولّد `public_id` |
| `ZidHandoff` | Tenancy | `complete(StoreIdentity, string $tenantId): RedirectResponse` (القسم 3.2) |
| `AuditLogger` | Platform | `record(...)` (2.6) |
| `SecretVault` | Platform | `forModule(string): ScopedVault`، ثم `put`، و`get`، و`rotate`، و`destroy`، و`metadata`، و`issueBuildFetchUrl` |
| `Flags` | Platform | `enabled(string $key, ?TenantId)`، و`value(string $key, ?TenantId)`، و`forApp(TenantId): array` |
| `Metrics` | Platform | `increment`، و`timing`، و`gauge` |
| `RuntimeContributor` | Platform (تنفذه M11 وغيرها) | `contribute(TenantId): array`، فيضيف مفاتيح عليا إلى endpoint الأعلام (`config` و`blocks` من M11) |
| `CdnPurger` | Platform (تنفذه M11) | `purgeTags(array $tags): void` |
| `EntitlementsProvider` | Commerce (تنفذه M10) | انظر [M10](M10-zid-connector.md) |
| `TenantHealthContributor` | Platform (تنفذه M10 وM11 وM13) | `health(TenantId): array` |

**أحداث M12**:
- `TenantProvisioned(tenant_id)`
- `TenantStatusChanged(tenant_id, old, new, reason)`
- `MembershipCreated(tenant_id, user_id, role)`
- `FlagsChanged(tenant_id|null, keys[])`
- `KillSwitchToggled(key, value, admin_id)`

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| استعلام على نموذج مستأجر دون سياق | `MissingTenantContext` (خطأ 500 في الطلب، وفشل في المهمة)، مع تنبيه Sentry. **لا يُعاد أي صف** |
| محاولة تغيير `tenant_id` لصف موجود | استثناء، ولا حفظ |
| `{tenant}` في المسار ليس من عضويات المستخدم | 403 `tenant_access_denied` |
| حذف عضوية المستخدم أثناء جلسته | الطلب التالي بهذا المستأجر يرد 403. وبقية مستأجريه تعمل |
| المستأجر `suspended` | اللوحة للقراءة، والكتابة ترد 423 `tenant_suspended`. والتطبيق يعمل ما لم يُفعَّل `app.service_suspended` |
| المستأجر `disconnected` (حُذف تطبيق زد) | اللوحة تعرض «أعد الربط»، والمهام المعتمدة على زد تُرفض في `WithTenant` |
| انتهاء الجلسة أو CSRF | 401 أو 419. Next.js يطلب `csrf-cookie` مرة ثم يعيد، أو يحوّل إلى الدخول |
| رمز البريد خاطئ 5 مرات | يُقفل الرمز. والجديد يحتاج طلبًا جديدًا ضمن حدود الإرسال |
| البريد لا يصل | `/api/v1/auth/email/code` يرد 202 دائمًا. والإرسال في `critical` مع 3 محاولات. وفشله يُسجَّل ويُنبَّه عليه إن تكرر. والدعم يرى حالة آخر رمز (لا قيمته) |
| مدير بلا TOTP مفعّل | لا يدخل إلا إلى شاشة التفعيل |
| cookies prod تصل إلى staging | ممنوع بالتصميم (نطاق أب منفصل). واختبار في CI يرفض `SESSION_DOMAIN` لـ staging إن انتهى بـ `intishar.sa` |
| KMS معطل | القراءة من المخبأ حتى 5 دقائق، ثم 503 `secrets_unavailable`. والكتابة 503 فورًا. وwebhooks زد تستمر (البصمة). تنبيه P1 |
| فشل فك تشفير سر (AAD لا يطابق، أو المفتاح خطأ) | 500، وتنبيه حرج، ولا محاولة كتابة فوقه |
| Redis معطل | الطوابير تتوقف. والـ webhooks تُكتب في القاعدة وتُعاد لاحقًا (M10). والمخبأ يتجاوز إلى القاعدة. ومحدِّدات المعدّل ترد 503 للعمليات الخارجية. والجلسات لا تتأثر (القاعدة) |
| القاعدة معطلة | `/up` يفشل، والموازن يخرج النسخ، وUptime ينبه. والتطبيق يعمل من رد الأعلام المخزن في CDN (`stale-if-error`) والإعداد المخزن (M11) |
| طلب مكرر بـ `Idempotency-Key` | الرد المخزن مع `Idempotent-Replayed: true` |
| المفتاح نفسه بجسم مختلف | 422 `idempotency_key_reused` |
| طلبان متزامنان بالمفتاح نفسه | الثاني يرد 409 `idempotency_in_progress` |
| مهمة مجدولة تأخرت أو فشلت | Sentry Crons ينبه. و`withoutOverlapping` يمنع التراكب. و`onOneServer` يمنع التكرار عند تعدد النسخ |
| مهمة تتجاوز `retry_after` | ممنوع بالإعداد (`retry_after` أكبر من المهلة). واختبار يتحقق من الإعداد |
| ترحيل فشل في منتصف النشر | لا تحويل للحركة. والصورة السابقة تبقى. والترحيلات expand متوافقة للخلف |
| تغيير علم بالخطأ (مفتاح إيقاف عام) | التدقيق يسجّل الفاعل والقيمة. والإرجاع يأخذ أقل من دقيقة، والأثر خلال 60 ثانية |
| تجاوز علم انتهت صلاحيته | `flags:expire-overrides` يحذفه، ويرفع `flags_version` |
| تطبيق قديم لا يفهم حقلًا جديدًا في الأعلام | الحقول إضافية فقط في v1. والمفتاح المجهول يُتجاهل (M01) |
| `{tenant}` مجهول في مسار التطبيق | 404 `tenant_not_found`، ومخبأ 60 ثانية. والتطبيق يستخدم آخر رد محفوظ |
| تغيير علم والـ CDN لم يُبطل (فشل `CdnPurger`) | الأثر يظهر خلال 60 ثانية بانتهاء `max-age`، ويُسجَّل الفشل |
| حذف بيانات تاجر (PDPL) | CORE-18 (Should). حتى ذلك الحين يدويًا بدليل تشغيل، مع إتلاف الأسرار |

## 7. المتطلبات غير الوظيفية

### 7.1 المقاييس

| البند | المقياس |
|---|---|
| زمن الـ API في اللوحة | p95 ≤ 300 ms للقراءة، و≤ 600 ms للكتابة، دون الاستدعاءات الخارجية |
| endpoint الأعلام `/api/app/v1/t/{tenant}/flags` | p95 ≤ 100 ms من الأصل، ونسبة الإصابة في CDN ≥ 90% |
| التوفر الشهري | 99.9% لـ `/app/v1` ومسارات `/zid`، و99.5% للوحة والإدارة |
| انتشار تغيير علم أو مفتاح إيقاف | ≤ 60 ثانية في CDN، و≤ 5 دقائق في التطبيق (مؤشر PRD) |
| النسخ والاستعادة | RPO ≤ 5 دقائق، وRTO ≤ 4 ساعات، وتمرين ناجح كل ربع سنة |
| العزل | صفر تسرب بين المستأجرين. اختبارات العزل تغطي 100% من النماذج التي فيها `BelongsToTenant` (اختبار يعدّها) |
| الأسرار | 100% مشفرة تشفيرًا مغلفًا، وصفر نص صريح في السجلات (فحص آلي للسجلات في CI بعد الاختبارات) |
| التدقيق | 100% من الأفعال المدرجة في 2.6 تُسجَّل (اختبار لكل فعل) |
| الجلسات | التاجر: خمول 12 ساعة ومطلق 30 يومًا. والإدارة: خمول 60 دقيقة ومطلق 12 ساعة. وTOTP إلزامي لكل مدير |
| رمز البريد | 6 أرقام، و10 دقائق، و5 محاولات. ووصول البريد p95 ≤ 30 ثانية |
| الطوابير | انتظار p95 تحت حدود 2.9. وصفر مهام تتجاوز `retry_after` |
| المراقبة | 100% من الاستثناءات غير المعالجة تصل Sentry بوسم `tenant_id` حين يوجد. و100% من المهام المجدولة لها Cron monitor |
| CI | ≤ 10 دقائق لكل PR |
| العربية | كل رسائل الأخطاء الموجهة للمستخدم بلغتين، والافتراض `ar`. والأرقام في JSON لاتينية دائمًا، والعرض مسؤولية الواجهات |
| الخصوصية | `send_default_pii=false` في Sentry. والـ IP في التدقيق يُحذف بعد 12 شهرًا (يُستبدل بـ hash). ولا بيانات عملاء المتاجر في جداول النواة |

### 7.2 استراتيجية الاختبار في الخادم

| الطبقة | الأداة | ما يُختبر | المعيار |
|---|---|---|---|
| وحدة (Unit) | Pest | منطق خالص: تقييم الأعلام، وحساب الاستحقاق، ورياضيات محدِّد المعدّل، والحجب، والتشفير وفكه (محرك محلي) | تغطية ≥ 90% لـ `Platform` و`Tenancy` |
| ميزة (Feature) | Pest مع `LazilyRefreshDatabase` على PostgreSQL 17 حقيقي (لا SQLite) | كل endpoint: النجاح، والتحقق، والصلاحيات، وصيغة الخطأ، و`X-Request-Id` | كل endpoint له اختبار نجاح ورفض |
| العزل | مجموعة بيانات (dataset) بكل نماذج المستأجر | عدم التسرب، والرفض دون سياق، و`TenantRule` | يفشل CI إن أُضيف نموذج دون اختبار |
| المعمارية | `arch()` في Pest | حدود الوحدات، ولا `env()` خارج config، ولا `Http::` خارج الأصناف المخصصة، ومهام المستأجر فيها `tenantId`، ولا `dd` أو `dump` | صفر استثناءات غير موثقة |
| العقود الخارجية | `Http::fake` و`Http::preventStrayRequests()` مع تسجيلات حقيقية | عملاء زد وKMS وApple وGoogle | لا طلب شبكي حقيقي في CI |
| الطوابير والجدولة | `Queue::fake`، و`Bus::fake`، واختبار قائمة الجدولة | التوجيه، والوسطاء، و`onOneServer`، و`sentryMonitor` | — |
| الترحيل | `migrate:fresh`، ثم `migrate:rollback --step=1` | — | في كل PR |
| الأمان | اختبارات مخصصة | CSRF على كل `POST` في اللوحة، وCORS (الأصل المسموح فقط)، وحجب السجلات، وعدم ظهور الأسرار في الموارد، وحدود المعدّل | — |
| الأداء | k6 (ليلي على staging) | endpoint الأعلام بـ 500 طلب في الثانية من الأصل، ومسار webhooks زد بدفعة 200 طلب في الثانية | تحقيق NFR في 7.1 |
| التحليل الساكن | Larastan المستوى 6 ثم 8، وPint | — | صفر أخطاء |
| الدخان بعد النشر | سكربت CI | `/up`، و`/health/ready`، و`/api/app/v1/t/{probe}/flags` | يمنع اكتمال النشر |
| الاستعادة | تمرين ربع سنوي | القسم 2.11 | زمن ≤ 4 ساعات |

## 8. الاعتماديات والمجهول

### قرارات ومجهول تعتمد عليه M12
| البند | الأثر | ما يُبنى الآن |
|---|---|---|
| D-06 (الاستضافة ومنطقتها) | يحدد KMS وSecret Manager وخدمة السجلات والمؤشرات وPostgreSQL وRedis المُدارة | كل شيء بواجهات ومحركات محلية: `local` لـ KMS، و`log` للمؤشرات، وDocker Compose. والمحرك السحابي قصة منفصلة |
| **قرار جديد: النطاق** (اسم النطاق الأب لـ prod، والنطاق المنفصل لـ staging، ونطاق المحتوى غير الموثوق) | الجلسات وCORS وعناوين زد (التي تُراجع في التقديم) | متغيرات بيئة. ولا نطاق مكتوب في الكود |
| **قرار جديد: مزود بريد المعاملات** (لرموز الدخول) | الدخول كله يعتمد عليه، ويحتاج إعداد SPF وDKIM وDMARC | `mailpit` محليًا، ومحرك SMTP قابل للتبديل |
| SPK-15 (معاينة Flutter Web) | أصل المعاينة يحتاج CORS على `/app/v1` دون credentials | الإعداد قابل للإضافة عبر متغير بيئة |
| SPK-13 وSPK-14 | أنواع أسرار البناء وصيغها (`.p8`، وJSON، و`.jks`) | الأنواع معرّفة في 2.7، والتحقق من الصيغة في M13 |
| M10 | `EntitlementsProvider` | تنفيذ مؤقت يعيد `manual/active` |
| M11 | `RuntimeContributor` (الحقلان `config` و`blocks`)، و`CdnPurger` | تنفيذ مؤقت يعيد قيمًا ثابتة، وإبطال لا يفعل شيئًا |
| M01 | دعم الحقل الجديد `service` في endpoint الأعلام | حتى يدعمه M01، يُعكس `service.suspended` أيضًا في `maintenance.active` برسالة الإيقاف |

### تعارضات مع الـ ADRs والتكليف
1. **Laravel 12 مقابل 13**: التكليف ذكر Laravel 12. لكن جدول الدعم الرسمي يقول إن إصلاحات أخطاء Laravel 12 انتهت في 13 أغسطس 2026، وإصلاحاته الأمنية تنتهي في **24 فبراير 2027**، أي قبل الإطلاق المتوقع (الأسبوع 38 فما بعد). أما Laravel 13 (صدر في 17 مارس 2026) فله أمان حتى 17 مارس 2028، والترقية إليه شبه بلا كسر ([Support Policy](https://laravel.com/docs/13.x/releases#support-policy)).
   - **التوصية**: Laravel 13 وPHP 8.4.
   - ADR-0005 لا يحدد إصدارًا، فلا تعارض معه. لكنه يحتاج تأكيد المشرف.
   - كل ما في المواصفة ينطبق على 12 أيضًا، عدا `Queue::route` و`#[DebounceFor]` و`PreventRequestForgery`.
2. **ADR-0010 («لا Blade»)**: لوحة Horizon واجهة جاهزة مبنية بـ Blade وVue يقدمها Laravel على `/horizon`.
   - **المقترح**: استثناء صريح لأدوات التشغيل الداخلية (Horizon فقط، خلف حارس `admin` ودور `ops`)، لأنها ليست واجهة منتج.
   - **البديل**: تعطيل الواجهة، والاكتفاء بـ `/api/v1/admin/monitoring` في Next.js.
   - Pulse مرفوض لأنه Livewire.
   - **يحتاج قرار المشرف.**
3. **ADR-0005 (قائمة الوحدات)**: أُضيفت `Platform` (نواة مشتركة)، و`Commerce` (عقود الموصل، تحقيقًا للبند 3)، و`Links` (M07)، و`Onboarding` (M14). وأجزاء الخادم من M02 وM03 وM09 داخل `AppConfig`. هذا توسيع للقائمة لا تغيير للقرار، ويُقترح تحديث ADR-0005 عند اعتماده.
4. **ADR-0007 («خزنة أسرار معزولة لكل تاجر»)**: التصميم هنا يعزل **تشفيريًا** بمفتاح بيانات لكل سر، وAAD مربوط بـ `tenant_id`، تحت مفتاح KMS واحد لكل بيئة.
   - التفسير الأشد: مفتاح KMS لكل تاجر، يتيح إتلاف مفاتيح تاجر بإتلاف مفتاحه وصلاحيات IAM لكل مفتاح. تكلفته بضعة سنتات لكل تاجر شهريًا، لكنه يضيف إدارة مئات المفاتيح.
   - **التوصية**: المفتاح الواحد في الإصدار الأول، والمفتاح لكل تاجر قصة Should. ويحتاج تأكيد المشرف.
5. **ADR-0010 (البند 5)**: Sanctum على نطاق أب مشترك، وهو مطبَّق. والإضافة هنا: staging على نطاق أب منفصل، والمحتوى غير الموثوق على نطاق منفصل، و`allowSameSite` مطفأ.

### مواءمة مع مواصفات الوحدات الأخرى (كُتبت بالتوازي)
اعتمدت M12 ما سبقت إليه M01 وM11 وM15 حيث لا ضرر:
- المستأجر في المسار.
- `/api/app/v1/t/{tenant}/flags` بشكل M01.
- رموز الأخطاء snake_case.
- `page[cursor]` للترقيم.
- `/api/v1/admin` للإدارة.
- أسماء القدرات وشكل `/me` كما في M15.

وبقيت فروق تحتاج تعديلًا في وحداتها:

| الفرق | أين | المطلوب |
|---|---|---|
| معرّف المستأجر العام | M15 وأمثلة لوحة M11 تستخدم `tnt_…`. وM01 ومسارات تطبيق M11 تستخدم `t_…` | معرّف واحد `t_…` (2.3) |
| مسارات اللوحة | M13 وM14 تستخدمان `/api/v1/merchant/…` دون مستأجر | `/api/v1/tenants/{tenant}/…` |
| مسارات أجهزة الإشعارات | M06 يستخدم `/app/v1/push/…` | `/api/app/v1/t/{tenant}/push/…` |
| جداول ببادئة وحدة أخرى | M11: `zid_imports`، و`zid_section_bindings`، و`zid_section_snapshots` | بادئة `config_` أو ما يناسب M11 (2.2) |
| الحقل `service` في endpoint الأعلام | M01 لا يعرفه | دعمه في APP-10. وحتى ذلك الحين يُعكس في `maintenance` (القسم 8 أعلاه) |
| زر «الدخول عبر زد» كمسار أساسي للتاجر | M15 | الإصدار الأول برمز البريد، والدخول عبر زد Should (ZID-18). وM15 نفسها تركت القرار لـ M12 وM10 |

### أسئلة يحسمها المشرف
1. Laravel 13 بدل 12 (البند 1 أعلاه).
2. استثناء لوحة Horizon من ADR-0010، أو تعطيلها.
3. مفتاح KMS واحد لكل بيئة، أو مفتاح لكل تاجر.
4. **دخول التاجر**: برمز البريد في الإصدار الأول، والدخول عبر زد لاحقًا (ZID-18)، أو كلمة مرور.
   - التوصية: رمز البريد.
   - السبب: OAuth زد يثبت المتجر لا الشخص (2.4).
5. النطاقات ومزود البريد (قراران جديدان).
6. مدد الاحتفاظ: التدقيق 24 شهرًا، والسجلات 30 يومًا، وIP 12 شهرًا. تمس PDPL.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| CORE-01 | هيكل المستودع: Laravel 13 وPHP 8.4، وDocker Compose (PostgreSQL 17، وRedis، وMailpit)، وهيكل الوحدات والـ providers، وPint وLarastan وPest، واختبارات المعمارية الأولى، وخط CI | Must | نعم | — |
| CORE-02 | اصطلاحات الـ API: RFC 9457 ومعالج الاستثناءات، و`X-Request-Id`، والغلاف والموارد الأساسية، والترقيم بالمؤشر وبالصفحات، والتوطين بلغتين، والمحدِّدات المسماة، وترويسات الإصدار والإيقاف، وScramble وتصدير OpenAPI | Must | نعم | CORE-01 |
| CORE-03 | تعدد المستأجرين: `tenants`، و`TenantContext`، و`BelongsToTenant` و`TenantScope` بالرفض دون سياق، ووضع النظام، و`TenantRule`، ووسطاء التعريف، و`WithTenant`، ومفاتيح المخبأ ومسارات التخزين، و`TenantProvisioner`، ومجموعة اختبارات العزل | Must | نعم | CORE-01 |
| CORE-04 | مصادقة اللوحة: Sanctum SPA، وCORS، والجلسة (`database`، والنطاق)، وCSRF، ودخول برمز البريد، والخروج، ومدد الجلسة، و`/api/v1/me`، والعضويات والمستأجر في المسار (`tenant.member`)، و`public_id`، و`ZidHandoff`، وتأكيد الربط | Must | نعم | CORE-02, CORE-03 |
| CORE-05 | الإدارة: `admin_users`، وحارس `admin`، وFortify (كلمة مرور وTOTP ورموز استرداد)، ومصفوفة الأدوار، ومدد الجلسة، وقائمة IP، و`admin:create` | Must | نعم | CORE-02 |
| CORE-06 | سجل التدقيق: الجدول بصلاحيات الإلحاق فقط، و`AuditLogger` والحجب، وواجهة العرض في الإدارة، والحذف بعد 24 شهرًا | Must | نعم | CORE-03 |
| CORE-07 | خزنة الأسرار: التشفير المغلف، والمحرك المحلي، وواجهة KMS، و`vault_secrets`، والنسخ المقيّدة لكل وحدة، والتدوير وإعادة التغليف والإتلاف، ومخبأ العملية، والرابط الموقّع للبناء | Must | نعم (المحرك المحلي). والمحرك السحابي ينتظر D-06 | CORE-03, CORE-06 |
| CORE-08 | الأعلام ومفاتيح الإيقاف: الجداول، والتقييم بالترتيب، والمخبأ بالإصدار، وواجهات الإدارة، وأعلام اللوحة في `/me`، و`/api/app/v1/t/{tenant}/flags` بشكل M01 مع `RuntimeContributor` و`CdnPurger` وسياسات الإصدار، وترويسات CDN | Must | نعم | CORE-03, CORE-06 |
| CORE-09 | الطوابير والجدولة: Horizon والمشرفون والاتصالان، وتوجيه الطوابير، و`WithTenant` و`SystemJob`، والمهام الفاشلة وحذفها، وعملية الجدولة الواحدة، وحدود الانتظار والتنبيه | Must | نعم | CORE-03 |
| CORE-10 | المراقبة: Sentry (أخطاء، وأداء، وCrons، وUptime)، وسجلات JSON مع الحجب، وواجهة `Metrics`، و`/up` و`/health/ready`، وقواعد التنبيه، واصطلاح وسوم Sentry وإصداراته للتطبيق واللوحة | Must | نعم | CORE-01 |
| CORE-11 | البيئات والنشر: صورة Docker وأنواع العمليات، وstaging وprod، والنطاقات وTLS، وحقن الأسرار من Secret Manager، وخط النشر، واختبارات الدخان، وقواعد الترحيل دون توقف | Must | ينتظر D-06 وقرار النطاق | CORE-01, CORE-10 |
| CORE-12 | النسخ الاحتياطي والاستعادة: PITR، والنسخة المنطقية الأسبوعية، وإصدارات التخزين، ودليل الاستعادة، وأول تمرين | Must | ينتظر D-06 | CORE-11 |
| CORE-13 | أدوات الإدارة F-P01: قائمة المستأجرين وتفاصيلهم المجمعة عبر `TenantHealthContributor`، والإيقاف والإعادة، وواجهات الأعلام وسياسات الإصدار، و`ops/summary` | Must | نعم (الأجزاء الأساسية). وصحة الربط تنتظر M10 (ZID-13) | CORE-05, CORE-06, CORE-08, CORE-09 |
| CORE-14 | مفاتيح عدم التكرار: الوسيط، والجدول، والقفل، والحذف، وقائمة المسارات الإلزامية | Must | نعم | CORE-02 |
| CORE-15 | أدوات الدعم F-P06: عرض الإعداد للقراءة، ورابط معاينة قصير العمر، وتدقيق كل عرض | Should | ينتظر M11 وSPK-15 | CORE-13 |
| CORE-16 | فريق التاجر F-M14: الدعوات بالبريد، والأدوار والقدرات (2.5)، ونقل الملكية، وإزالة العضو | Could | نعم (بعد CORE-04) | CORE-04 |
| CORE-17 | تقوية العزل بـ PostgreSQL RLS على جداول المستأجرين، مع `SET LOCAL app.tenant_id` في كل معاملة | Should | نعم (بعد CORE-03) | CORE-03 |
| CORE-18 | تصدير بيانات مستأجر وحذفها (PDPL، وإنهاء الاشتراك)، و`tenancy:export`، والإتلاف التشفيري | Should | ينتظر M10 وM11 | CORE-03, CORE-07 |
| CORE-19 | مفتاح KMS لكل تاجر (التفسير الأشد لـ ADR-0007) | Should | ينتظر قرار المشرف وD-06 | CORE-07 |

### معايير القبول لأهم القصص

**CORE-03: تعدد المستأجرين**
- **Given** نموذج فيه `BelongsToTenant` وصف للمستأجر A، **When** يُستعلم عنه في سياق المستأجر B، **Then** النتيجة صفر صفوف.
- **Given** لا سياق مستأجر ولا وضع نظام، **When** يُستعلم عن أي نموذج مستأجر، **Then** يُرمى `MissingTenantContext` ولا يُنفَّذ أي SQL.
- **Given** مهمة أُرسلت بـ `tenantId` للمستأجر A، **When** تُعالج في عامل عالج قبلها مهمة للمستأجر B، **Then** كل استعلاماتها مقيّدة بـ A، والسياق يُمسح بعدها.
- **Given** نموذج مستأجر جديد أُضيف دون إدراجه في مجموعة اختبارات العزل، **When** يعمل CI، **Then** يفشل اختبار العدّ.
- **Given** `Tenancy::runAsSystem` بدأها مدير، **Then** يُسجَّل حدث تدقيق فيه السبب.

**CORE-04: مصادقة اللوحة**
- **Given** Next.js على `app.intishar.sa`، **When** يطلب `csrf-cookie` ثم `/api/v1/auth/email/code` ثم `/api/v1/auth/email/verify` برمز صحيح، **Then** يُضبط `intishar_session` على `.intishar.sa` بالخصائص `HttpOnly` و`Secure` و`SameSite=Lax`، و`GET /api/v1/me` يرد 200.
- **Given** طلب `POST` من `app.intishar.sa` دون `X-XSRF-TOKEN`، **Then** الرد 419 `csrf_token_mismatch`.
- **Given** طلب من أصل غير `https://app.intishar.sa`، **Then** لا تُعاد ترويسات CORS مع credentials.
- **Given** بريد غير مسجل، **When** يُطلب رمز، **Then** الرد 202 مطابق لرد البريد المسجل في الشكل، ولا يُرسل بريد.
- **Given** جلسة تاجر عمرها 30 يومًا ونشطة، **When** يرسل طلبًا، **Then** يرد 401 ويُطلب الدخول.
- **Given** callback زد لمتجر جديد دون جلسة، ولا يوجد مستخدم ببريد المتجر، **When** يكتمل `ZidHandoff`، **Then** يُنشأ مالك ويدخل، ويُحوَّل المتصفح إلى `/onboarding`.
- **Given** يوجد مستخدم بالبريد نفسه، **Then** لا تُنشأ عضوية حتى يدخل ويؤكد.

**CORE-07: خزنة الأسرار**
- **Given** سر `asc_api_key` محفوظ، **When** تُقرأ القاعدة مباشرة، **Then** لا يظهر المحتوى ولا DEK صريحًا.
- **Given** نسخ `ciphertext` من المستأجر A إلى صف المستأجر B، **When** يُقرأ، **Then** يفشل فك التشفير (AAD).
- **Given** الوحدة `Push`، **When** تطلب نوع `asc_api_key`، **Then** تُرفض بـ `SecretAccessDenied`.
- **Given** تدوير مفتاح KMS ثم `secrets:rewrap`، **Then** كل الأسرار تُقرأ، و`kek_ref` يشير إلى النسخة الأساسية.
- **Given** أي اختبار يكتب سرًا ثم يسجّل، **When** يُفحص ملف السجل، **Then** لا تظهر القيمة.

**CORE-08: الأعلام وendpoint التشغيل**
- **Given** علم `app.feature.brand_strip` افتراضيه `false`، وتجاوز للمستأجر A بقيمة `true`، **When** يطلب تطبيق A `/api/app/v1/t/{A}/flags`، **Then** `features.brand_strip = true`، ولتطبيق B `false`.
- **Given** مفتاح الإيقاف العام `app.kill.checkout` فُعِّل، **Then** يظهر `kill.checkout = true` لكل المستأجرين خلال 60 ثانية (إبطال الوسم `flags`)، ويُسجَّل في التدقيق.
- **Given** طلب بـ `If-None-Match` يطابق الإصدار الحالي، **Then** الرد 304 دون جسم.
- **Given** علم مربوط بالاستحقاق `push.automations`، والمستأجر حالته `expired`، **Then** قيمته `false` مهما كان الافتراضي.
- **Given** سياسة `min_supported_version=1.2.0` لـ iOS، **Then** الرد يحملها في `app.ios`، ولا يختلف باختلاف `X-App-Version` ولا `X-Platform`، ولا يحمل `Vary` على ترويسة مخصصة.

**CORE-09: الطوابير والجدولة**
- **Given** إعداد Horizon، **When** يعمل اختبار الإعداد، **Then** `retry_after` لكل اتصال أكبر من أكبر `timeout` لمشرفيه.
- **Given** كل مهمة مجدولة مسجلة، **Then** لكل منها `onOneServer` و`withoutOverlapping` و`sentryMonitor` (اختبار يمر على `Schedule::events()`).
- **Given** تأخر طابور `zid-webhooks` فوق 60 ثانية لمدة 5 دقائق، **Then** يصل تنبيه.
- **Given** مهمة في وحدة مستأجر لا تملك `tenantId` ولا `SystemJob`، **Then** يفشل اختبار المعمارية.

**CORE-14: مفاتيح عدم التكرار**
- **Given** `POST` لطلب بناء بـ `Idempotency-Key: K`، **When** يُعاد بالجسم نفسه خلال 24 ساعة، **Then** يُعاد الرد الأول مع `Idempotent-Replayed: true` دون بناء ثانٍ.
- **Given** المفتاح نفسه بجسم مختلف، **Then** الرد 422 `idempotency_key_reused`.
- **Given** طلبان متزامنان بالمفتاح نفسه، **Then** أحدهما ينفَّذ والآخر يرد 409.

## 10. المصادر

**Laravel**
- [Release Notes and Support Policy (13.x)](https://laravel.com/docs/13.x/releases)
- [Sanctum: SPA Authentication](https://laravel.com/docs/13.x/sanctum#spa-authentication)، [CSRF Protection: Origin Verification](https://laravel.com/docs/13.x/csrf#origin-verification)، [Session](https://laravel.com/docs/13.x/session)
- [Context](https://laravel.com/docs/13.x/context)، [Encryption (APP_PREVIOUS_KEYS)](https://laravel.com/docs/13.x/encryption)، [Rate Limiting](https://laravel.com/docs/13.x/rate-limiting)
- [Queues](https://laravel.com/docs/13.x/queues)، [Horizon](https://laravel.com/docs/13.x/horizon)، [Task Scheduling](https://laravel.com/docs/13.x/scheduling)
- إصدارات الحزم من Packagist في 2026-11-10: [laravel/framework](https://packagist.org/packages/laravel/framework)، [laravel/sanctum](https://packagist.org/packages/laravel/sanctum)، [laravel/horizon](https://packagist.org/packages/laravel/horizon)، [laravel/fortify](https://packagist.org/packages/laravel/fortify)، [sentry/sentry-laravel](https://packagist.org/packages/sentry/sentry-laravel)، [spatie/laravel-health](https://packagist.org/packages/spatie/laravel-health)، [spatie/laravel-backup](https://packagist.org/packages/spatie/laravel-backup)، [dedoc/scramble](https://packagist.org/packages/dedoc/scramble)، [pestphp/pest](https://packagist.org/packages/pestphp/pest)، [larastan/larastan](https://packagist.org/packages/larastan/larastan)

**تعدد المستأجرين**
- [Tenancy for Laravel: Single-database tenancy](https://tenancyforlaravel.com/docs/v3/single-database-tenancy)

**الأسرار والاستضافة**
- [Google Cloud KMS locations (me-central2)](https://docs.cloud.google.com/kms/docs/locations)
- [AWS Saudi Arabia region, December 2026 (w.media)](https://w.media/?p=43003)

**المراقبة**
- [Sentry Laravel Crons](https://docs.sentry.io/platforms/php/guides/laravel/crons/)، [Sentry Uptime Monitoring](https://docs.sentry.io/product/uptime-monitoring/)

**المعايير**
- [RFC 9457: Problem Details](https://www.rfc-editor.org/rfc/rfc9457)، [RFC 9745: Deprecation header](https://www.rfc-editor.org/rfc/rfc9745)، [RFC 8594: Sunset header](https://www.rfc-editor.org/rfc/rfc8594)
- [IETF draft: Idempotency-Key header](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/)

**زد** (لما يخص M12)
- [Webhook Health Tracking (429 لا يُحتسب فشلًا)](https://docs.zid.sa/webhook-health-tracking-2197281m0)، [Public Apps OAuth Requirements (لا ربط بالبريد)](https://docs.zid.sa/oauth-requirements)
