# M15: لوحة التاجر ولوحة الإدارة

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Next.js (واجهات الويب). ومعها عقد بروتوكول المعاينة الذي تنفذ M03 طرفه في Flutter Web، وعقود مع Laravel |
| المتطلبات | واجهات F-M01 إلى F-M14، وواجهات F-P01 إلى F-P06 |
| القرارات | [ADR-0010](../adr/0010-nextjs-web-frontends.md)، و[ADR-0004](../adr/0004-hybrid-sdui-typed-blocks.md)، و[ADR-0006](../adr/0006-layouts-in-platform-api.md)، و[ADR-0009](../adr/0009-import-then-own-home.md)، و[ADR-0007](../adr/0007-merchant-owned-store-accounts.md) |
| تعتمد على | M12 (الجلسة والأدوار واصطلاحات الـ API)، وM11 (المسودات والنسخ والنشر والوسائط)، وM03 (مخططات الكتل والشاشات)، وM02 (الـ tokens والهويات الجاهزة)، وM06 وM08 وM09 وM10 وM13 وM14 (منطق شاشاتها وعقودها) |
| بادئة القصص | DASH |

> **قاعدة الحدود** ([خريطة الوحدات](README.md)): M15 تملك هيكل اللوحة، ونظام تصميمها، وتجربة المحرر، وبروتوكول المعاينة. أما منطق كل شاشة وعقدها فمن الوحدة المعنية. لذلك كل endpoint في هذه الوثيقة **عقد متوقَّع** بصيغة مقترحة، والصيغة النهائية تكتبها الوحدة المالكة في مواصفتها وفي `06-api/`.

## 1. الغرض والنطاق

### 1.1 ما تفعله الوحدة

1. **تطبيق Next.js واحد** بمنطقتين: لوحة التاجر في `/{tenant}/...`، ولوحة إدارة المنصة في `/admin/...` (ADR-0010).
2. **نظام التصميم**: shadcn/ui فوق Tailwind v4، عربي وRTL أولًا، بخط IBM Plex Sans Arabic، مع أنماط موحدة لحالات التحميل والفراغ والخطأ، والتنبيهات، والتأكيد، وإمكانية الوصول (D-08).
3. **هيكل المعلومات**: القائمة الجانبية، والمسارات، وظهور العناصر حسب الدور.
4. **تجربة المحرر**: محرر كتل بثلاث لوحات، وكتالوج، وسحب وترتيب، وإعدادات أساسية ومتقدمة تتولد من مخطط JSON، ورفع صور باكتشاف النسبة، ومحرر الهوية، والتراجع، والحفظ التلقائي، ومراجعة الفرق، والنشر، وسجل النسخ والرجوع.
5. **بروتوكول المعاينة**: رسائل `postMessage` بين اللوحة و`iframe` يعرض بناء Flutter Web من `storefront_ui`، مع جهة اللوحة كاملة. والطرف المستقبِل في Flutter Web تنفذه M03 (BLK-13) وفق هذا العقد.
6. **طبقة البيانات**: عميل API مولَّد، وTanStack Query، ونماذج تتولد من مخططات الكتل.
7. **شاشات الإدارة**: المتاجر، وصحة الربط والرموز، وصحة الـ webhooks، والبناء والأسطول، والأعلام ومفاتيح الإيقاف، والمراقبة، وسجل التدقيق.

### 1.2 النطاق حسب أولوية PRD

| الأولوية | ما يدخل في M15 | المتطلب |
|---|---|---|
| **Must** | الأساس التقني، ونظام التصميم، والهيكل، والمصادقة | F-M01، وF-P01 |
| **Must** | محرر الكتل وقائمة الصفحات ومراجعة الاستيراد | F-M02، وF-M03 |
| **Must** | محرر الهوية: هويات جاهزة، وtokens، وخطوط مضمّنة، ووضع داكن بثلاثة خيارات، وفحص التباين | F-M04 |
| **Must** | ضبط الشاشات الأصلية: وحدات صفحة المنتج، ونمط البطاقة، والشريط السفلي، والشريط الإعلاني | F-M05 |
| **Must** | دورة النشر: مسودة، فمعاينة، فمراجعة الفرق، فنشر فوري، مع سجل النسخ والرجوع بنقرة | F-M06 |
| **Must** | واجهات الإشعارات: الحملات (فورية ومجدولة) والآليات التلقائية | F-M07 |
| **Must** | المعاينة الحية داخل اللوحة | F-M08 (مرتبط بـ SPK-15) |
| **Must** | واجهات الأصول وطلب البناء والإصدارات، وغلاف معالج حسابات المطوّر | F-M09، وF-M10 |
| **Must** | واجهة التحليلات الأساسية | F-M11 |
| **Must** | شاشات الإدارة | F-P01 إلى F-P05 |
| Should | جدولة النشر، والحزم الموسمية، ومحاكاة التاريخ في المعاينة | F-M06b |
| Should | المعاينة على الجهاز بـ QR | F-M08b |
| Should | مساعد الذكاء الاصطناعي بأوامر عربية وبطاقة فرق | F-M12 |
| Should | رفع خط خاص، والنوافذ المنبثقة وشاشات الترحيب، ولقطات المتجر من المعاينة | F-M04b، وF-M05b، وF-M09b |
| Should | أدوات الدعم: عرض إعداد التاجر للقراءة فقط ومعاينة تطبيقه | F-P06 |
| Could | محاكاة الشريحة، واستهداف الكتل، واختبارات A/B | F-M13 |
| Could | فريق التاجر وأدواره | F-M14 |
| Could | الوضع الداكن للوحة نفسها، وواجهة اللوحة بالإنجليزية | — |

تفاصيل Should وCould مختصرة في القسم 3.6 «لاحقًا».

### 1.3 ما ليس من مسؤولية M15

- منطق النشر وتخزين النسخ والـ CDN والتحقق النهائي بالمخطط: **M11**.
- عقد كل كتلة (JSON Schema) وكلمة `x-ui` فيه، ورسمها في التطبيق، ومستقبِل المعاينة: **M03**. وM15 تقترح مفاتيح `x-ui` التي تحتاجها (القسم 5.4).
- محتوى الهويات الجاهزة وعقد الـ tokens وتحويلها إلى `ThemeData`: **M02**.
- إرسال الإشعارات والاستهداف: **M06**. وصيغة الروابط والأفعال: **M07** وADR-0004.
- حساب المؤشرات: **M08**. والشريط الإعلاني والنوافذ المنبثقة: **M09**.
- OAuth والرموز والـ webhooks وتفعيل المزايا من اشتراك زد: **M10**.
- الحسابات والأدوار والصلاحيات والتدقيق والأعلام في الخادم: **M12**.
- خط البناء والتوقيع والرفع: **M13**. ومنطق معالج الإعداد وحسابات المطوّر: **M14**، وهي تبني شاشاتها بمكونات M15.

## 2. المكونات حسب الطبقة

### 2.1 الحزم والإصدارات

الإصدارات أدناه تحققتُ منها في سجل npm بتاريخ 2026-11-10 (`npm view`). تُثبَّت بدقة (`--save-exact`) في `package.json`، ولا يرقّي المنفذ إصدارًا رئيسيًا دون طلب تغيير.

| الحزمة | الإصدار | الدور | ملاحظة |
|---|---|---|---|
| `next` | 16.4.6 | الإطار، App Router | Node.js 20.9 فأحدث ([Next.js 16](https://nextjs.org/blog/next-16)) |
| `react` و`react-dom` | 19.3.1 | — | يأتي مع Next.js 16.4 ([Next.js 16.4](https://nextjs.org/blog/next-16-4)) |
| `typescript` | 6.0.3 | — | لا 7.x الآن، لأن `@hey-api/openapi-ts` يعلن توافقه حتى 6 في `peerDependencies` |
| `tailwindcss` و`@tailwindcss/postcss` | 4.3.5 | التنسيق | إعداد CSS أولًا بـ `@theme` |
| `shadcn` (CLI) | 4.23.0 | توليد المكونات | `rtl: true` ونمط `radix-nova` ([shadcn RTL](https://ui.shadcn.com/docs/rtl)) |
| `radix-ui` | 1.8.1 | أساس المكونات | يثبّته `shadcn` |
| `tw-animate-css` | 1.4.0 | الحركات | فيه مشكلة معروفة مع الانزلاق المنطقي في RTL |
| `lucide-react` | 1.71.0 | الأيقونات | الاتجاهية تُقلب بـ `rtl:rotate-180` |
| `sonner` | 2.0.8 | التنبيهات (toast) | — |
| `next-intl` | 4.14.9 | الترجمة والتنسيق | دون توجيه لغوي في المسار ([next-intl](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing)) |
| `@tanstack/react-query` و`-devtools` | 5.107.1 | جلب البيانات | — |
| `@tanstack/eslint-plugin-query` | 5.107.1 | قواعد lint | — |
| `react-hook-form` | 7.91.0 | النماذج | — |
| `zod` | 4.6.7 | التحقق | لبقية النماذج، ورسائل المعاينة، والاستجابات |
| `@hookform/resolvers` | 7.0.5 | ربط zod وAjv بالنموذج | يدعم zod 4 وAjv 8 |
| `@hey-api/openapi-ts` | 0.99.0 | توليد أنواع واجهات API وعميلها ومخططات zod للاستجابات من `06-api/openapi.yaml` | قبل 1.0، فيُثبَّت بدقة |
| `json-schema-to-typescript` | 16.0.0 | توليد أنواع الكتل من `06-api/blocks/` (`json2ts`) | قرار M03 |
| `ajv` و`ajv-formats` | 8.20.0 و3.0.1 | تحقق نماذج الكتل من مخطط التحرير، عبر `@hookform/resolvers/ajv` | قرار M03، بوضع draft 2020-12 |
| `@dnd-kit/react` و`@dnd-kit/helpers` | 0.5.3 | السحب والترتيب | خط «Latest» في التوثيق. انظر القسم 8 |
| `zustand` | 5.1.0 | مخزن المحرر | — |
| `immer` | 11.2.9 | التعديل غير القابل للتغيير وpatches التراجع | `produceWithPatches` |
| `jsondiffpatch` | 0.7.7 | بطاقة فرق المساعد (Should) فقط | الفرق قبل النشر يحسبه M11 |
| `react-easy-crop` | 6.2.5 | تعديل مستطيل القص المقترح من M11 | — |
| `react-dropzone` | 20.2.0 | منطقة الإفلات للرفع | — |
| `culori` | 4.0.2 | حساب التباين وOKLCH | `wcagContrast` |
| `@date-fns/tz` و`date-fns` | 1.5.0 و4.4.0 | التوقيت `Asia/Riyadh` | الهجري عبر `Intl` بلا مكتبة |
| `nuqs` | 2.10.3 | حالة الواجهة في الرابط | الكتلة المحددة والجهاز |
| `@tanstack/react-table` | 8.21.3 | جداول البيانات | 9.x صدر في أغسطس 2026. نبقى على 8 لتطابق أمثلة data-table في shadcn |
| `recharts` و`react-day-picker` | ما يثبّته `shadcn add chart` و`shadcn add calendar` | الرسوم والتقويم | يُسجَّل الإصدار في lockfile |
| `@sentry/nextjs` | 11.11.0 | الأخطاء والأداء | — |
| `msw` | 3.0.4 | محاكاة الـ API قبل جاهزية الخادم | للتطوير والاختبار |
| `vitest` و`@testing-library/react` | 5.1.0 و16.3.3 | اختبارات الوحدة | — |
| `@playwright/test` | 1.65.0 | اختبارات E2E | — |
| `@axe-core/playwright` | 4.14.0 | فحص إمكانية الوصول | — |
| `eslint` و`eslint-config-next` | 10.14.0 و16.4.6 | — | `next lint` أُزيل في Next.js 16 |
| Node.js | 24 LTS (24.22.x) | التشغيل والبناء | 26 LTS متاح أيضًا، والترقية بقرار لاحق |
| Flutter (للمعاينة) | 3.47.9 stable | بناء مستقبِل المعاينة | التوثيق يعكس 3.47 ([Embedding Flutter web](https://docs.flutter.dev/platform-integration/web/embedding-flutter-web)) |

### 2.2 هيكل المشروع

مكانه المقترح `apps/dashboard/` في مستودع `intishar` (D-09)، والقرار النهائي في الدليل الهندسي `07`.

```text
apps/dashboard/
├─ next.config.ts              # cacheComponents، reactCompiler، output: 'standalone'، رؤوس الأمان
├─ components.json             # shadcn: style radix-nova، rtl: true، iconLibrary lucide
├─ openapi-ts.config.ts        # توليد src/gen/api من 06-api/openapi.yaml
├─ contracts/                  # 06-api كـ git submodule على وسم contracts-r{N} (M03)
├─ src/
│  ├─ proxy.ts                 # حارس متفائل: لا كوكي جلسة ← /login (Next.js 16 بدل middleware)
│  ├─ env.ts                   # تحقق zod من متغيرات البيئة عند الإقلاع
│  ├─ i18n/request.ts          # next-intl: اللغة من كوكي locale، والافتراضي ar
│  ├─ messages/ar.json         # كل نصوص الواجهة، ومنها تسميات حقول الكتل
│  ├─ messages/en.json         # يُملأ لاحقًا (Could)
│  ├─ app/
│  │  ├─ layout.tsx            # html lang/dir، الخط، Providers
│  │  ├─ global-error.tsx  not-found.tsx
│  │  ├─ (public)/login/page.tsx              # دخول التاجر برمز البريد (M12)
│  │  ├─ (public)/connect/{sign-in,confirm}/page.tsx  # ربط متجر بحساب قائم (M12 القسم 3.2)
│  │  ├─ select-store/page.tsx
│  │  ├─ (internal)/ui-catalog/page.tsx      # كتالوج المكونات، 404 في الإنتاج
│  │  ├─ [tenant]/
│  │  │  ├─ layout.tsx                      # TenantGate: العضوية والصلاحيات
│  │  │  ├─ (shell)/layout.tsx              # AppShell: الشريط الجانبي والعلوي
│  │  │  ├─ (shell)/page.tsx                # نظرة عامة
│  │  │  ├─ (shell)/design/pages/page.tsx   # قائمة الصفحات
│  │  │  ├─ (shell)/design/screens/page.tsx
│  │  │  ├─ (shell)/design/history/page.tsx
│  │  │  ├─ (shell)/notifications/campaigns/{page,new/page,[campaignId]/page}.tsx
│  │  │  ├─ (shell)/notifications/automations/page.tsx
│  │  │  ├─ (shell)/analytics/page.tsx
│  │  │  ├─ (shell)/app/{assets,releases,developer-accounts}/page.tsx
│  │  │  ├─ (shell)/settings/{connection,team,subscription}/page.tsx
│  │  │  ├─ (editor)/layout.tsx             # EditorShell بلا شريط جانبي، ويحمل PreviewHost المستمر
│  │  │  ├─ (editor)/design/brand/page.tsx
│  │  │  ├─ (editor)/design/pages/[pageId]/page.tsx
│  │  │  ├─ (editor)/design/screens/[screen]/page.tsx
│  │  │  └─ (focus)/onboarding/...          # تملكه M14، بتخطيط مركّز
│  │  └─ admin/
│  │     ├─ (auth)/login/page.tsx
│  │     └─ (console)/{layout,page}.tsx  tenants/  connections/  webhooks/
│  │        builds/  flags/  monitoring/  audit/
│  ├─ components/ui/           # مولّد من shadcn، يُعدَّل بحذر
│  ├─ components/app/          # مكونات المنتج المشتركة (القسم 2.6.2)
│  ├─ features/
│  │  ├─ editor/               # store، history، autosave، outline، settings، diff، publish
│  │  ├─ preview/              # PreviewHost، transport، مخططات الرسائل
│  │  ├─ schema-form/          # SchemaForm وسجل الـ widgets
│  │  ├─ brand/  screens/  notifications/  analytics/  app-release/  settings/  admin/
│  ├─ lib/api/                 # العميل، وXSRF، وتحويل الأخطاء
│  ├─ lib/query/               # QueryClient ومفاتيح الاستعلام
│  ├─ lib/format/              # الأرقام، والعملة، والتاريخ الهجري
│  └─ gen/                     # مولّد آليًا، لا يُعدَّل يدويًا
│     ├─ api/                  # types، client، zod، query options
│     └─ blocks/               # blocks.d.ts من json2ts، وخريطة الإسقاط، وحقول x-ui
├─ mocks/                      # MSW handlers وfixtures
└─ e2e/                        # Playwright
```

### 2.3 إعداد Next.js

1. **App Router وTypeScript**، وTurbopack هو الافتراضي في 16 ([Next.js 16](https://nextjs.org/blog/next-16)).
2. **`proxy.ts` بدل `middleware.ts`**، لأن الأخير صار مهجورًا في 16. وهو حارس متفائل فقط: إن غابت كوكي الجلسة أعاد التوجيه إلى `/login?next=...`. أما التحقق الفعلي فعبر `GET /api/v1/me`.
3. **Cache Components** مفعّل كما يفعل `create-next-app` منذ 16.4 ([Next.js 16.4](https://nextjs.org/blog/next-16-4)). لكن لا يُستخدم `'use cache'` لأي بيانات خاصة بمتجر. بيانات اللوحة كلها تُجلب في العميل بـ TanStack Query. وما يقرأ الكوكي في الخادم يوضع داخل `Suspense`.
4. **مكونات الخادم** للغلاف الثابت فقط: التخطيط، والترجمة، والعناوين. والشاشات التفاعلية مكونات عميل (`'use client'`). السبب أن الجلسة كوكي على نطاق الـ API، وتمريرها من خادم Next.js إلى Laravel يضيف تعقيدًا بلا فائدة للوحة خلف تسجيل دخول.
5. **`reactCompiler: true`** (مستقر منذ 16). وإن أبطأ البناء بوضوح يُطفأ، فهو تحسين لا وظيفة.
6. **`output: 'standalone'`** لصورة Docker، لأن الاستضافة لم تُحسم بعد (D-06).
7. **رؤوس الأمان** في `next.config.ts`: CSP بـ `frame-src` لأصل المعاينة فقط، و`frame-ancestors 'none'` للوحة نفسها، و`connect-src` للـ API وSentry، و`img-src` لـ CDN المنصة و`img.zid.store`.

### 2.4 اللغة واتجاه RTL

| البند | القرار |
|---|---|
| اللغة الافتراضية | العربية `ar`. والإنجليزية للواجهة لاحقًا (Could)، لكن كل نص يمر عبر `next-intl` من اليوم الأول. لا نص عربي مكتوب داخل مكوّن |
| تحديد اللغة | كوكي `locale` يقرؤه `i18n/request.ts` بلا توجيه في المسار ([next-intl](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing)) |
| الوسم الجذري | `html lang="ar" dir="rtl"`، ويتبدل مع اللغة |
| shadcn | المشروع يُنشأ بـ `pnpm dlx shadcn@latest create --template next --rtl`، فيصير في `components.json` الحقل `"rtl": true`. ويُضاف `DirectionProvider` من `@/components/ui/direction` حول التطبيق ([shadcn RTL في Next.js](https://ui.shadcn.com/docs/rtl/next)) |
| مكونات تحتاج يدًا | Calendar وPagination وSidebar لا تُرحَّل آليًا، ولها خطوات يدوية في التوثيق ([shadcn RTL](https://ui.shadcn.com/docs/rtl)). والشريط الجانبي يوضع على جهة البداية (اليمين في RTL) |
| النوافذ الطافية | يُمرَّر `dir` صراحةً إلى عناصر portal مثل `PopoverContent` و`TooltipContent`، وتُتجنب حركات الانزلاق المنطقية من `tw-animate-css` لمشكلتها المعروفة |
| الأصناف | المنطقية فقط: `ms-`، و`me-`، و`ps-`، و`pe-`، و`start-`، و`end-`، و`text-start`، و`border-s`، و`rounded-s` ([Tailwind padding](https://tailwindcss.com/docs/padding)). وقاعدة lint تمنع `ml-` و`mr-` و`pl-` و`pr-` و`left-` و`right-` و`text-left` و`text-right` |
| الأيقونات | الأسهم والأسهم المزدوجة والتراجع والإعادة تُقلب بـ `rtl:rotate-180`. والساعة والتشغيل والبحث لا تُقلب |
| الحقول ثنائية اللغة | حقل الإنجليزية `dir="ltr"`، وحقل العربية `dir="rtl"`. والنصوص التي يُدخلها المستخدم تُعرض بـ `dir="auto"` |
| الأرقام | أرقام لاتينية افتراضيًا: `Intl.NumberFormat('ar-SA-u-nu-latn')`. القرار للمشرف (القسم 8) |
| العملة | `Intl.NumberFormat('ar-SA-u-nu-latn', { style: 'currency', currency: 'SAR' })`، فتظهر «ر.س». ورمز الريال الجديد U+20C1 (Unicode 17.0) لا يُستخدم في اللوحة حتى يُتحقق من وجوده في الخط ([Saudi riyal sign](https://en.wikipedia.org/wiki/Saudi_riyal_sign)) |
| التاريخ | ميلادي أساسي بتوقيت `Asia/Riyadh`، والهجري تسمية ثانوية عبر `Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn')` في أدوات الجدولة والسجل ([MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)) |
| الجمع | صيغ ICU في `next-intl` بقواعد الجمع العربية الست (`zero`، و`one`، و`two`، و`few`، و`many`، و`other`) |

### 2.5 المصادقة مع Laravel Sanctum (مشتركة مع M12)

**المبدأ**: Sanctum بنمط SPA. جلسة كوكي، بلا رموز في `localStorage`. ويشترط Sanctum أن تشترك اللوحة والـ API في النطاق الأعلى نفسه، ولو كانا نطاقين فرعيين مختلفين ([Laravel 13 Sanctum](https://laravel.com/docs/13.x/sanctum#spa-authentication)).

| الإعداد | القيمة | المالك |
|---|---|---|
| النطاقات | اللوحة `app.{domain}`، والـ API `api.{domain}`، والمعاينة على أصل مختلف (القسم 5.3.7) | D-06 |
| Laravel | `SANCTUM_STATEFUL_DOMAINS=app.{domain}`، و`SESSION_DOMAIN=.{domain}`، و`$middleware->statefulApi()`، و`supports_credentials=true` في CORS | M12 |
| العميل | كل طلب بـ `credentials: 'include'`، و`Accept: application/json`، و`X-XSRF-TOKEN` مأخوذ من كوكي `XSRF-TOKEN` بعد فك ترميزه | M15 (DASH-04) |
| CSRF | `GET /sanctum/csrf-cookie` قبل أول طلب يغيّر شيئًا، وبعد كل 419 | M15 |
| انتهاء الجلسة | 401 أو 419 ← محاولة واحدة لتجديد CSRF عند 419، ثم توجيه إلى `/login?next=...` | M15 |

**شكل الدخول** (حسمته [M12](M12-platform-core.md)):
- **أول دخول للتاجر** يأتي من callback زد في M10 مباشرة إلى `/{tenant}/onboarding`، لأن زد تشترط أن يبدأ OAuth لحظة الضغط على «تفعيل» بلا تسجيل قبله. وM12 يسلّم الجلسة (`ZidHandoff`).
- **عودة التاجر**: رمز يصل إلى البريد. `POST /api/v1/auth/email/code` ثم `POST /api/v1/auth/email/verify`. و«الدخول عبر زد» (`/api/v1/auth/zid/redirect`) Should خلف العلم `dash.feature.zid_login`، فيظهر زره فقط حين يكون العلم مفعّلًا.
- **ربط متجر بحساب قائم**: الصفحتان `/connect/sign-in` و`/connect/confirm` حين يحوّل M12 إليهما (`pending_link`).
- **فريق المنصة**: بريد وكلمة مرور ثم TOTP إلزامي في `/admin/login`، بحارس `admin` منفصل.

### 2.6 نظام التصميم

#### 2.6.1 الـ tokens والخط

- **الأساس**: tokens shadcn بصيغة OKLCH، ومعرّفة في `:root` ومربوطة بـ Tailwind عبر `@theme inline` ([shadcn theming](https://ui.shadcn.com/docs/theming)). وهي `background` و`foreground` و`card` و`popover` و`primary` و`secondary` و`muted` و`accent` و`destructive` و`border` و`input` و`ring` و`chart-1` إلى `chart-5` و`sidebar-*` و`radius`.
- **إضافات المنتج**: `success` و`warning` و`info`، ولكل منها `-foreground`. تُستخدم لشارات الحالة: نجح البناء، أو يحتاج إعادة تفويض، أو قيد المراجعة.
- **القيم**: لون أساسي واحد للمنصة يختاره المشرف في DASH-02. والمقترح المبدئي `--primary: oklch(0.46 0.11 180)`، وكل لون نص فوق خلفية يحقق 4.5:1 على الأقل.
- **الخط**: `IBM_Plex_Sans_Arabic` من `next/font/google`، بأوزان 400 و500 و600 و700، ومجموعتي `arabic` و`latin`، ومتغير `--font-sans`، و`display: 'swap'`. ولا `letter-spacing` على العربية (`tracking-normal` دائمًا).
- **المقاسات**: نص الجسم 15px بارتفاع سطر 1.7، والجداول 14px بارتفاع 1.6، والعناوين بوزن 600. والأرقام في الجداول ومؤشرات الأداء بـ `tabular-nums`.
- **المسافات**: وحدة Tailwind الافتراضية 4px. و`--radius: 0.625rem`.
- **الكثافة**: الحد الأدنى لهدف النقر 32px في الجداول و40px في الأزرار الرئيسية.

#### 2.6.2 المكونات

**من shadcn/ui** (تُضاف بـ `shadcn add`):

| الفئة | المكونات |
|---|---|
| الهيكل | Sidebar، وBreadcrumb، وSeparator، وScrollArea، وResizable، وTabs، وAccordion، وCard، وSheet، وDialog، وAlertDialog |
| الإدخال | Button، وButtonGroup، وInput، وInputGroup، وTextarea، وSelect، وCombobox (Popover مع Command)، وCheckbox، وSwitch، وRadioGroup، وToggleGroup، وSlider، وCalendar، وField، وLabel |
| العرض | Table مع data-table، وBadge، وAvatar، وSkeleton، وProgress، وSpinner، وKbd، وTooltip، وHoverCard، وChart، وEmpty، وItem |
| التغذية الراجعة | Sonner، وAlert، وAlertDialog |
| التنقل | DropdownMenu، وContextMenu، وCommand، وPagination |

**مكونات المنتج** في `components/app/` و`features/*`:

| المكوّن | الوظيفة |
|---|---|
| `AppShell` و`AppSidebar` و`TopBar` | الهيكل والقائمة حسب الدور، ومبدّل المتجر، وقائمة الحساب |
| `PageHeader` | العنوان، وسطر وصف، والفعل الرئيسي في جهة النهاية |
| `EmptyState` و`ErrorState` و`LockedState` و`DisconnectedState` | أنماط الحالات (القسم 2.6.3) |
| `StatusBadge` و`HealthDot` | حالات البناء والربط والـ webhooks بلون وأيقونة ونص معًا |
| `KpiCard` و`TrendChart` | مؤشرات التحليلات |
| `DateTimeField` و`HijriHint` | التاريخ والوقت بتوقيت الرياض مع التسمية الهجرية |
| `ConfirmAction` | غلاف AlertDialog بالنمط الموحد (القسم 2.6.4) |
| `SaveStatus` | حالة الحفظ التلقائي مع `aria-live="polite"` |
| `PhoneFrame` و`PreviewHost` و`PreviewToolbar` | المعاينة |
| `BlockOutline` و`BlockRow` و`BlockCatalog` | لوحة الكتل |
| `SchemaForm` وسجل الـ widgets | لوحة الإعدادات |
| `LocalizedTextField` و`ImageField` و`ImageCropDialog` و`ActionPicker` و`SourcePicker` و`TokenColorField` و`SizeToggle` و`ItemsRepeater` | حقول النموذج المولَّد |
| `ContrastBadge` | نسبة التباين مع «إصلاح تلقائي» |
| `DiffList` و`DiffCard` | مراجعة الفرق، وبطاقة المساعد لاحقًا |
| `VersionTimeline` | سجل النسخ |
| `PushPreview` | محاكاة إشعار iOS وأندرويد في المنشئ |

**كتالوج حي**: صفحة `(internal)/ui-catalog` تعرض كل مكوّن بحالاته بالعربية. تعمل في dev وstaging فقط، وهي مرجع المشرف للتصميم بدل Figma للوحة (D-08).

#### 2.6.3 أنماط حالات الشاشة

| الحالة | متى | الشكل |
|---|---|---|
| تحميل | أول جلب للشاشة | `Skeleton` يطابق تخطيط المحتوى، ويظهر بعد 300 ms فقط حتى لا يومض. ولا spinner بملء الشاشة |
| تحديث في الخلفية | إعادة جلب أو تحويل | مؤشر صغير في `PageHeader`، والمحتوى يبقى ظاهرًا |
| فارغ | لا بيانات بعد | `EmptyState`: أيقونة، وعنوان، وجملة واحدة تشرح السبب، وفعل رئيسي واحد. مثل: «لا حملات بعد. أرسل أول إشعار لعملائك» مع زر «حملة جديدة» |
| خطأ جزئي | فشل مكوّن أو استعلام واحد | `Alert` داخل البطاقة مع «إعادة المحاولة»، وبقية الصفحة تعمل |
| خطأ الشاشة | فشل المسار كله | `error.tsx` لكل مقطع مسار: رسالة عربية، و«إعادة المحاولة»، ورمز الخطأ للدعم (`request_id`) |
| لا صلاحية | 403 | صفحة «لا تملك صلاحية هذه الصفحة» مع الرجوع إلى نظرة عامة |
| غير متاح في الباقة | الميزة غير مفعّلة من اشتراك زد (F-P05) | `LockedState`: ما الميزة، وأي باقة تفعّلها، ورابط «إدارة الاشتراك في زد» |
| المتجر غير مربوط | الرموز ملغاة أو أُزيل التطبيق | `DisconnectedState` بملء المحتوى مع «أعد الربط» (M10) |
| غير متصل | `navigator.onLine` false | شريط علوي «لا اتصال بالإنترنت. سنحفظ تغييراتك حين يعود الاتصال»، والنشر معطّل |

#### 2.6.4 التنبيهات والتأكيد

**التنبيهات (Sonner)**:
- الموضع `bottom-left`، وهو جهة النهاية في RTL. والمكوّن بـ `dir="rtl"`.
- النجاح يختفي بعد 4 ثوانٍ. والخطأ يبقى حتى يُغلق، ومعه «إعادة المحاولة» إن أمكن.
- لا تنبيه للحفظ التلقائي، فحالته في `SaveStatus`.
- **الحذف القابل للتراجع لا يُسأل عنه**: حذف كتلة أو عنصر يتم فورًا، ثم تنبيه «حُذفت الكتلة» مع زر «تراجع» مدة 8 ثوانٍ.

**التأكيد (AlertDialog)** فقط لما له أثر خارج المسودة أو لا يُتراجع عنه. وهي سبع حالات: النشر، والرجوع إلى نسخة، وإرسال حملة، وطلب بناء، والموافقة على تقديم للمراجعة، وحذف صفحة منشورة، وكل فعل إداري (مفتاح إيقاف، وعلم، و`min_supported_app_version`، وبناء الأسطول).

| عنصر | القاعدة |
|---|---|
| العنوان | سؤال بالفعل المحدد: «نشر التغييرات الآن؟» |
| النص | جملة واحدة بالأثر: «ستظهر للمتسوقين خلال 5 دقائق عند تنقلهم التالي» |
| الزر الأساسي | الفعل نفسه («انشر الآن»)، لا «نعم» ولا «موافق». و`destructive` للأفعال الهدّامة |
| الإلغاء | «إلغاء»، وعليه التركيز الافتراضي في الأفعال الهدّامة |
| الأفعال الإدارية الحرجة | حقل «السبب» إلزامي (10 أحرف على الأقل) يُحفظ في التدقيق. وما يمس كل المتاجر يتطلب كتابة عبارة تأكيد |

#### 2.6.5 إمكانية الوصول

- **المستوى**: WCAG 2.2 AA في كل الشاشات.
- **لوحة المفاتيح**: كل مسار رئيسي يُنجز بها وحدها، ومنه إعادة ترتيب الكتل (القسم 3.3.3). وفي الصفحة رابط «تخطَّ إلى المحتوى»، والتركيز ظاهر بـ `ring`، ويعود إلى العنصر الذي فتح الحوار بعد إغلاقه.
- **البنية**: معالم `nav` و`main` و`aside`، وتسلسل عناوين صحيح، وكل حقل له `Label` وخطؤه مربوط بـ `aria-describedby`.
- **الإعلانات الحية**: `SaveStatus` وعدّاد التغييرات ونتائج السحب تُعلن بالعربية عبر `aria-live`.
- **الألوان**: لا يُعتمد على اللون وحده، فكل شارة حالة فيها أيقونة ونص. والتباين 4.5:1 للنص و3:1 للعناصر غير النصية ([WCAG 2.2 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- **الحركة**: `prefers-reduced-motion` يوقف الحركات الزخرفية وحركة السحب.
- **أهداف النقر**: 24×24 px على الأقل ([WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **المعاينة**: الـ `iframe` له `title="معاينة التطبيق"`. وFlutter Web ليس مصدرًا موثوقًا لقارئ الشاشة، لذلك **لوحة الكتل هي التمثيل المرجعي** للصفحة، والمعاينة مكمّلة بصريًا.

### 2.7 هيكل المعلومات والأدوار

#### 2.7.1 القائمة الجانبية للتاجر

| المجموعة | العنصر | المسار | المتطلب | الوحدة المالكة للمنطق |
|---|---|---|---|---|
| — | نظرة عامة | `/{tenant}` | F-M01، وF-M11 | M14، وM08، وM13 |
| التصميم | الهوية | `/{tenant}/design/brand` | F-M04 | M02، وM11 |
| التصميم | الصفحات | `/{tenant}/design/pages` | F-M02، وF-M03 | M03، وM11 |
| التصميم | الشاشات | `/{tenant}/design/screens` | F-M05 | M03، وM09، وM11 |
| التصميم | سجل النشر | `/{tenant}/design/history` | F-M06 | M11 |
| الإشعارات | الحملات | `/{tenant}/notifications/campaigns` | F-M07 | M06، وM07 |
| الإشعارات | الرسائل التلقائية | `/{tenant}/notifications/automations` | F-M07 | M06 |
| — | التحليلات | `/{tenant}/analytics` | F-M11 | M08 |
| التطبيق | الأصول | `/{tenant}/app/assets` | F-M09 | M13 |
| التطبيق | البناء والنشر | `/{tenant}/app/releases` | F-M09، وF-M10 | M13، وM14 |
| التطبيق | حسابات المطوّر | `/{tenant}/app/developer-accounts` | F-M10 | M14 |
| الإعدادات | الربط | `/{tenant}/settings/connection` | F-M01 | M10 |
| الإعدادات | الفريق | `/{tenant}/settings/team` | F-M14 (Could) | M12 |
| الإعدادات | الاشتراك | `/{tenant}/settings/subscription` | F-P05 | M10، وM12 |

خارج القائمة: `/{tenant}/onboarding` (M14، تخطيط مركّز)، و`/select-store` عند وجود أكثر من متجر، و`/login`، و`/connect/sign-in` و`/connect/confirm` (M12).

**لماذا المتجر في المسار؟** حتى يعمل تبويبان لمتجرين مختلفين دون أن يكتب أحدهما في متجر الآخر. ومعرّف المتجر في المسار هو المعرّف العام القصير (`t_8f2k1q`)، لا معرّف زد الرقمي.

#### 2.7.2 القائمة الجانبية للإدارة

| العنصر | المسار | المتطلب | الوحدة |
|---|---|---|---|
| المتاجر | `/admin/tenants`، و`/admin/tenants/{id}` | F-P01 | M12 |
| الربط والرموز | `/admin/connections` | F-P01 | M10 |
| صحة الـ webhooks | `/admin/webhooks` | F-P01 | M10 |
| البناء والأسطول | `/admin/builds` | F-P02 | M13 |
| الأعلام ومفاتيح الإيقاف | `/admin/flags` | F-P04 | M12 |
| المراقبة | `/admin/monitoring` | F-P03 | M12 |
| سجل التدقيق | `/admin/audit` | F-P01، وF-P04 | M12 |

#### 2.7.3 الظهور حسب الدور

الأدوار والقدرات تعرّفها [M12 القسم 2.5](M12-platform-core.md). والواجهة تُخفي ما لا يملكه الدور، والخادم يرفضه أيضًا. والواجهة تقرأ `permissions` من `GET /api/v1/me` ولا تستنتجها من اسم الدور.

**التاجر** (في الإصدار الأول دور `owner` وحده، والبقية مع F-M14):

| العنصر | القدرة | owner | manager | editor | marketer | viewer |
|---|---|---|---|---|---|---|
| نظرة عامة، والتحليلات | `analytics.view` | ✓ | ✓ | ✓ | ✓ | ✓ |
| التصميم: تعديل | `design.edit` | ✓ | ✓ | ✓ | — | — |
| التصميم: نشر ورجوع | `design.publish` | ✓ | ✓ | — | — | — |
| الإشعارات | `push.send` | ✓ | ✓ | — | ✓ | — |
| الأصول وطلب البناء والموافقة على التقديم | `builds.request` و`builds.submit` | ✓ | ✓ | — | — | — |
| الإعدادات: الربط ومفاتيح المتاجر | `settings.manage` | ✓ | — | — | — | — |
| الإعدادات: الفريق | `team.manage` | ✓ | — | — | — | — |

ومن يملك `design.edit` دون `design.publish` يرى «مراجعة» دون «انشر الآن».

**مدراء المنصة** (حارس `admin`):

| العنصر | super_admin | ops | support |
|---|---|---|---|
| المتاجر والصحة والتدقيق والمراقبة | ✓ | ✓ | قراءة |
| إعداد التاجر للقراءة (F-P06، Should) | ✓ | ✓ | ✓ |
| تجديد الرموز، وإعادة تسجيل الـ webhooks والمزامنة | ✓ | ✓ | — |
| البناء للتاجر وللأسطول | ✓ | ✓ | — |
| الاستحقاق اليدوي، وإيقاف مستأجر وإعادته | ✓ | ✓ | — |
| الأعلام ومفاتيح الإيقاف و`min_supported_app_version` | ✓ | — | قراءة |

السطر الأخير اقتراح من M15، فجدول M12 لا يذكر الأعلام (Q-11).

### 2.8 طبقة البيانات

#### 2.8.1 العقود والتوليد

| العقد | المصدر | الأداة | الناتج |
|---|---|---|---|
| واجهات API | `06-api/openapi.yaml` (OpenAPI 3.1) | `@hey-api/openapi-ts` 0.99.0 | `src/gen/api/`: أنواع، وعميل fetch، ومخططات zod للاستجابات، وخيارات TanStack Query |
| مخططات الكتل ومستند `app-shell` | `06-api/blocks/` كـ git submodule مثبت على وسم `contracts-r{N}` ([M03 القسم 2.4](M03-blocks-pages.md)) | `json-schema-to-typescript` 16.0.0 (`json2ts`) | `src/gen/blocks/blocks.d.ts`، وخريطة الإسقاط (القسم 5.3.3)، وقائمة حقول `x-ui` لكل `type@v` |
| تحقق نماذج الكتل | مخطط التحرير نفسه | Ajv 8.20.0 بوضع draft 2020-12 | تحقق فوري في المتصفح يطابق تحقق opis في الخادم (قرار M03) |
| بقية النماذج ورسائل المعاينة | مكتوبة في الكود | zod 4.6.7 | — |

1. كل بناء يعيد التوليد. ويفشل CI إن اختلف الناتج عن المحفوظ، أو إن لم يساوِ الثابت `CATALOG_REV` في اللوحة قيمة `schema_version` في `catalog.json`، كما يفعل `kCatalogRev` في Dart.
2. **قبل وجود `06-api/`** (المرحلة 1): مخططات zod يدوية في `features/*/contracts.ts` تطابق أمثلة [M11](M11-app-config-service.md) وM03، ومعها MSW. وتُحذف عند وصول الملفات المولّدة.
3. **لماذا لا تحويل JSON Schema إلى zod؟** `json-schema-to-zod` متوقف عن الصيانة منذ مارس 2026 ([npm: json-schema-to-zod](https://www.npmjs.com/package/json-schema-to-zod))، و`z.fromJSONSchema()` في zod 4 «تجريبي وليس جزءًا من الواجهة المستقرة» ([Zod: JSON Schema](https://zod.dev/json-schema)). لذلك تُتحقق نماذج الكتل بـ Ajv من المخطط مباشرة، ويبقى zod لما سواها (القسم 8.2).
4. **العميل**: `credentials: 'include'`، واعتراض يضيف `X-XSRF-TOKEN`، والمتجر في مسار كل طلب (`/api/v1/tenants/{tenant}/...`) حسب M12، واعتراض يفك الغلاف `data`، واعتراض أخطاء يحوّل الاستجابة إلى `ApiError`.

#### 2.8.2 TanStack Query

| الإعداد | القيمة |
|---|---|
| `staleTime` الافتراضي | 30 ثانية. و`me` خمس دقائق، والتحليلات خمس دقائق |
| `gcTime` | 5 دقائق |
| `retry` | مرتان لأخطاء 5xx والشبكة فقط، ولا إعادة لـ 4xx |
| `refetchOnWindowFocus` | مفعّل للقوائم، ومعطّل لمسودة المحرر لأنها مملوكة للمخزن المحلي |
| الاستطلاع | البناء كل 10 ثوانٍ ما دام بناء جاريًا، وإحصاءات حملة قيد الإرسال كل 15 ثانية، وأصل قيد المعالجة كل ثانية حتى `ready`، وصحة الـ webhooks في الإدارة كل 60 ثانية |
| SSR | لا جلب مسبق في الخادم في الإصدار الأول (القسم 2.3 البند 4) |

مفاتيح الاستعلام من مصنع واحد في `lib/query/keys.ts`، وكل مفتاح خاص بمتجر يبدأ بمعرّفه:

```ts
type DocKey = string; // 'home' أو مفتاح صفحة أو 'app-shell' أو 'theme'

export const qk = {
  me: () => ['me'] as const,
  pages: (t: string) => ['t', t, 'pages'] as const,
  catalogBlocks: (t: string) => ['t', t, 'catalog-blocks'] as const,
  presets: (t: string, sector = 'all') => ['t', t, 'presets', sector] as const,
  draft: (t: string, doc: DocKey) => ['t', t, 'draft', doc] as const,
  render: (t: string, doc: DocKey, lock: number, locale: string, asOf = 'now') =>
    ['t', t, 'render', doc, lock, locale, asOf] as const,
  diff: (t: string, doc: DocKey, from: string, to: string) => ['t', t, 'diff', doc, from, to] as const,
  versions: (t: string, doc: DocKey) => ['t', t, 'versions', doc] as const,
  asset: (t: string, id: string) => ['t', t, 'asset', id] as const,
  assets: (t: string) => ['t', t, 'assets'] as const,
  campaigns: (t: string, f?: object) => ['t', t, 'campaigns', f ?? {}] as const,
  analytics: (t: string, range: string) => ['t', t, 'analytics', range] as const,
  builds: (t: string) => ['t', t, 'builds'] as const,
  admin: { tenants: (f?: object) => ['admin', 'tenants', f ?? {}] as const },
};
```

جدول الإبطال بعد كل تغيير في القسم 5.5.

#### 2.8.3 النماذج من مخططات الكتل

1. `SchemaForm` يأخذ `type@v`، ويقرأ مخطط التحرير المضمّن وقت البناء من الـ submodule، ويستخرج الحقول من `x-ui` (القسم 5.4).
2. التسمية من `x-ui.label.ar` في المخطط نفسه، وهي التسمية التي يعرضها M11 في الفرق، فللحقل اسم واحد في المحرر والمراجعة. ونصوص الواجهة العامة (الأزرار والعناوين والرسائل) من `messages/ar.json`.
3. التحقق بـ `ajvResolver` من `@hookform/resolvers/ajv`، بمثيل Ajv 2020 مع `allErrors` و`ajv-formats`. وكل كلمة مخطط تُترجم إلى رسالة عربية من جدول ثابت (`minItems` تصبح «أضف عنصرًا واحدًا على الأقل»، و`maxLength` تصبح «الحد 40 حرفًا»).
4. أخطاء 422 من الخادم تحمل JSON Pointer ورسالة بلغتين ([M11 القسم 5.1](M11-app-config-service.md))، فتُربط بالحقل المطابق للمؤشر.
5. كل تغيير يُكتب في المخزن فورًا، والنصوص بعد 300 ms، فتتحدث المعاينة بالمسار المتفائل (القسم 5.3.3).
6. **فحص CI** (`scripts/check-block-ui.ts`) يضيف إلى فحص M03 (7 حقول أساسية على الأكثر): 8 متقدمة على الأكثر، وكل `widget` مسجّل في السجل، ووجود `label.ar`، وعدم تكرار `order`.
7. **الكتالوج** في المحرر من `GET /catalog/blocks` (M11، وBLK-15 في M03)، فلا يظهر نوع لا تدعمه المنصة أو علم مطفأ.

### 2.9 المعاينة: المستضيف والمستقبِل

| الجهة | المكان | المسؤولية |
|---|---|---|
| المستضيف (Next.js) | `features/preview/` | إنشاء الـ `iframe`، والمصافحة، وإرسال المسودة والتحكم، واستقبال النقرات والأخطاء، والتحقق من الأصل والرسائل، وإطار الهاتف |
| المستقبِل (Flutter Web، تنفذه M03 في BLK-13) | `storefront_ui/lib/src/preview/main_preview.dart` | الاستماع للرسائل، والتحقق من الأصل، ورسم غلاف التسليم بسجل الكتل والـ tokens، وإبراز الكتلة المحددة، والرد بـ `rendered` وبالأخطاء |
| الاستضافة | CDN على أصل مستقل، مثل `preview.{preview-domain}` (القسم 5.3.7) | ملفات ثابتة مُرقَّمة الإصدار، و`frame-ancestors` لأصول اللوحة فقط |

- **نمط التضمين**: `iframe` بوضع الصفحة الكاملة، وهو ما يوصي به توثيق Flutter للتضمين عبر iframe. والاتصال غير متزامن بـ `postMessage` ([Embedding Flutter web](https://docs.flutter.dev/platform-integration/web/embedding-flutter-web)).
- **لماذا لا multi-view؟** التضمين المباشر يربط بيئة Dart بصفحة اللوحة بلا عزل، ويخلط CSS. والـ iframe يعطي عزلًا كاملًا، ويُبدَّل بالبديل التقريبي دون تغيير المحرر.
- **الخدمات الوهمية**: في المستقبِل تصبح السلة والتنقل والتحليلات بلا أثر (M03 القسم 3.3). وهو يستلم **غلاف تسليم** جاهزًا بصيغة M03 (القسم 4.1)، فلا يحمل أي بيانات اعتماد ولا يطلب أي API، ويحمّل الصور فقط.
- **الاستمرار**: `PreviewHost` يُركَّب في `(editor)/layout.tsx`، فلا يُعاد تحميل محرك Flutter عند التنقل بين الهوية والصفحات والشاشات.
- **البناء**: `flutter build web --wasm`، ويرجع آليًا إلى `dart2js` مع CanvasKit في المتصفحات غير الداعمة ([Flutter Wasm](https://docs.flutter.dev/platform-integration/web/wasm)). وتعدد الخيوط يحتاج رؤوس COOP وCOEP، وأثر ذلك داخل iframe سؤال لـ SPK-15 (القسم 8).

## 3. التدفقات

### 3.1 شاشات لوحة التاجر

كل شاشة فيها حالات القسم 2.6.3. وتُذكر هنا الحالات الخاصة بها فقط.

#### نظرة عامة `/{tenant}`
- **الغرض**: أين وصل التاجر، وما أهم ما يفعله الآن.
- **التخطيط**: عمودان. **الأيمن** (البداية): قائمة «جهّز تطبيقك» من M14 (الربط، والهوية، والرئيسية، وحسابات المطوّر، وأول بناء، والتقديم)، ثم بطاقة «آخر نشر» مع «عدّل الرئيسية». **الأيسر**: بطاقة حالة التطبيق (iOS وأندرويد: الإصدار الحي وحالة المراجعة)، ثم أربع بطاقات KPI لآخر 7 أيام (إيرادات التطبيق، والطلبات، والمستخدمون النشطون، والجلسات الخالية من الانهيار).
- **حالات خاصة**: قبل إطلاق التطبيق تُستبدل بطاقات KPI بعبارة «ستظهر الأرقام بعد نشر تطبيقك». وتنبيه أعلى الصفحة إن فشل بناء أو احتاج الربط إعادة تفويض.
- **الأفعال**: الانتقال إلى الخطوة التالية في القائمة، و«عدّل الرئيسية»، و«حملة جديدة».
- **API**: M14 `onboarding`، وM08 `analytics/summary`، وM13 `builds?latest`، وM11 `publications?limit=1` (مقترح، Q-10).

#### الهوية `/{tenant}/design/brand`
- **الغرض**: هوية كاملة بأقل جهد (F-M04).
- **التخطيط**: غلاف المحرر بثلاث لوحات (القسم 3.2). **لوحة البداية**: أقسام الهوية (الهويات الجاهزة، والألوان، والخطوط، والشكل، والوضع الداكن، والشعار). **الوسط**: المعاينة، وفيها «فاتح وداكن جنبًا إلى جنب». **لوحة النهاية**: نموذج القسم المحدد.
- **المكونات**: معرض هويات بفلتر القطاع، و`TokenColorField` لكل دور لوني بقيمتين (فاتح وداكن)، و`ContrastBadge` بجانب كل زوج، وقائمة خطوط (المضمّنان والمنسّقة)، و`ToggleGroup` للشكل (حاد، ومتوسط، ودائري) والكثافة، و`RadioGroup` للوضع الداكن (يتبع الجهاز، أو فاتح دائمًا، أو داكن مخصص).
- **الأفعال**: تطبيق هوية جاهزة (قابل للتراجع)، وتعديل الأدوار، و«إصلاح التباين»، و«مراجعة ونشر».
- **API**: M11 `GET /presets` (هويات M02)، و`/theme/draft` و`/theme/diff` و`/theme/publish` و`/theme/versions`.
- التدفق في القسم 3.3.9.

#### الصفحات `/{tenant}/design/pages`
- **الغرض**: كل صفحات الكتل: الرئيسية، وصفحات الحملات، ورؤوس التصنيفات (ADR-0004).
- **التخطيط**: `PageHeader` مع «صفحة جديدة»، ثم جدول أعمدته: الاسم، والنوع، والحالة (منشورة، أو فيها تغييرات غير منشورة، أو لم تُنشر)، وآخر نشر، والأفعال.
- **حالات خاصة**: إن وُجدت اقتراحات استيراد غير مؤكدة (ADR-0009) يظهر شريط «راجع 3 أقسام استوردناها من متجرك».
- **الأفعال**: فتح المحرر، وإنشاء صفحة حملة (الاسم بلغتين، ونسخ من صفحة أو من فراغ)، ورأس تصنيف (اختيار تصنيف)، وتكرار، وأرشفة (غير الرئيسية، ومع تأكيد إن كانت منشورة)، ونسخ رابط الصفحة (M07).
- **API**: M11 `GET` و`POST /pages`، و`PATCH /pages/{key}` (العنوان والأرشفة)، و`/imports/{id}` و`/imports/{id}/apply`، و`/pages/{key}/bindings`. وM10 `catalog/categories`.

#### محرر الصفحة `/{tenant}/design/pages/{pageId}`
مفصّل في القسمين 3.2 و3.3.

#### الشاشات `/{tenant}/design/screens` و`/{tenant}/design/screens/{section}`
- **الغرض**: ضبط الشاشات الأصلية بقائمة وحدات لا بكتل حرة (F-M05، ADR-0004).
- **المستند**: كل الأقسام في مستند واحد هو `app-shell`، بدورة النشر نفسها ([M03 القسم 5.9](M03-blocks-pages.md)).
- **أقسام الإصدار الأول**: `product_page` (ترتيب الوحدات وإخفاؤها)، و`product_card` (النمط، ونسبة الصورة، والإضافة السريعة، وما يظهر على البطاقة)، و`tab_bar` (النمط، والأيقونات، والتسميات، وخمسة تبويبات)، و`top_bar` (التخطيط، والبحث، والأفعال)، و`announcement` (الشريط الإعلاني، ومنطقه من M09).
- **التخطيط**: غلاف المحرر نفسه. لوحة البداية تعرض وحدات القسم الثابتة (ترتيب وإخفاء فقط، ولا كتالوج). والمقفل منها لا يُخفى، ويظهر بشارة قفل. والمعاينة تنتقل إلى الشاشة برسالة `navigate` مع منتج نموذجي يغيّره التاجر من قائمة.
- **API**: M11 `/shell/draft` و`/shell/draft/render` و`/shell/diff` و`/shell/publish` و`/shell/versions`. وM09 لعقد قسم `announcement`، وM10 `catalog/products` لاختيار منتج المعاينة.

#### سجل النشر `/{tenant}/design/history`
- **الغرض**: كل عمليات النشر والرجوع عبر كل المستندات.
- **التخطيط**: `VersionTimeline`، وكل عنصر فيه: المستند، ورقم النسخة، والتاريخ ميلاديًا مع التسمية الهجرية، ومن نشر، والملاحظة. والنسخة الحية لكل مستند موسومة.
- **الأفعال**: «عرض» يفتح المحرر للقراءة على تلك النسخة، و«اجعلها الحية» (القسم 3.3.8).
- **API**: M11 `versions` لكل مستند (`/pages/{key}`، و`/shell`، و`/theme`) تُدمج في المتصفح مرتبة بالوقت. ونقترح على M11 `GET /publications` يعيد سجل النشر الموحد من `config_publications` (Q-10).

#### الحملات `/{tenant}/notifications/campaigns`، و`/new`، و`/{id}`
- **الغرض**: إشعارات فورية أو مجدولة بشرائح بسيطة وبلغتين (F-M07).
- **القائمة**: جدول أعمدته: العنوان، والحالة (مسودة، ومجدولة، وقيد الإرسال، وأُرسلت، وفشلت)، والجمهور، والوقت، ونسبة الفتح.
- **المنشئ** بعمودين: النموذج في البداية، و`PushPreview` لـ iOS وأندرويد في النهاية. حقول النموذج:
  - العنوان والنص بالعربية والإنجليزية، مع عدّاد أحرف من حدود M06.
  - صورة اختيارية عبر `ImageField`.
  - الوجهة عبر `ActionPicker` محصور في الرئيسية والمنتج والتصنيف والصفحة (M07).
  - الجمهور: الكل، أو المسجّلون، أو الزوار، أو حسب المنصة، أو حسب اللغة، مع تقدير حي للعدد.
  - التوقيت: الآن، أو تاريخ ووقت بتوقيت الرياض مع التسمية الهجرية.
- **التفاصيل**: الإحصاءات (أُرسل، وفُتح، ونسبة الفتح، والإيراد المنسوب من M08)، وإلغاء المجدولة.
- **حالات خاصة**: إن كان الجمهور صفرًا يتعطل الإرسال. وتنبيه إن كان الإرسال بين 11 مساءً و8 صباحًا بتوقيت الرياض.
- **الأفعال**: حفظ مسودة، وإرسال أو جدولة مع تأكيد بعدد الأجهزة، ونسخ حملة.
- **API**: M06 `push/campaigns` (GET وPOST وPATCH وDELETE)، و`send`، و`stats`، و`audience-estimate`.

#### الرسائل التلقائية `/{tenant}/notifications/automations`
- **الغرض**: آليات حالة الطلب والسلة المتروكة (F-M07).
- **التخطيط**: بطاقة لكل آلية فيها مفتاح تشغيل، ووصف، وقالب النص بلغتين مع متغيرات تُدرج من قائمة (رقم الطلب، واسم العميل، واسم المتجر)، ومعاينة. وفي آلية السلة المتروكة تأخير من خيارات ثابتة (ساعة، أو 4 ساعات، أو 24 ساعة) حسب M06.
- **الأفعال**: تشغيل وإيقاف (يُحفظ فورًا مع تنبيه)، وتعديل القالب، و«أرسل تجربة إلى جهازي» إن وفّرتها M06.
- **API**: M06 `push/automations` (GET وPATCH).

#### التحليلات `/{tenant}/analytics`
- **الغرض**: أثر التطبيق في المبيعات (F-M11).
- **التخطيط**:
  - صف أعلى فيه نطاق التاريخ (7 أو 30 أو 90 يومًا أو مخصص) وعبارة «آخر تحديث قبل 12 دقيقة».
  - ست بطاقات KPI: إيرادات التطبيق، والطلبات، ومتوسط قيمة الطلب، والمستخدمون النشطون، ونسبة فتح الإشعارات، والجلسات الخالية من الانهيار.
  - رسم زمني للإيرادات والطلبات.
  - جدول «الكتل الأكثر نقرًا» أعمدته: الكتلة، والصفحة، والظهور، والنقرات، ونسبة النقر.
- **حالات خاصة**: إن كانت نسبة الطلبات إلى التطبيق بالطريقة الاحتياطية (SPK-03) يظهر شريط يشرح الدقة المتوقعة.
- **API**: M08 `analytics/summary`، و`timeseries`، و`blocks`.

#### الأصول `/{tenant}/app/assets`
- **الغرض**: الأيقونة والسبلاش من الشعار، ونصوص قائمة المتجر (F-M09).
- **التخطيط**: ثلاث بطاقات:
  1. **الشعار والأيقونة**: رفع شعار مربع (1024×1024 على الأقل)، ولون الخلفية، ومعاينات مولّدة لأيقونة iOS بلا شفافية، وأيقونة أندرويد التكيفية بأقنعة دائرة ومربع منحني، وسبلاش أندرويد 12.
  2. **الاسم**: اسم التطبيق في المتجر وعلى الشاشة، مع حدود الأحرف من M13.
  3. **قائمة المتجر**: الوصف القصير والطويل بلغتين، والكلمات المفتاحية، ورابط سياسة الخصوصية، ورابط الدعم.
- **وسم «يحتاج بناءً جديدًا»** على كل حقل محفوظ في الملف التنفيذي (ADR-0002).
- **الأفعال**: حفظ، ثم «اطلب بناءً» ينقل إلى البناء والنشر.
- **API**: M13 `app/assets` (GET وPUT)، و`app/assets/generate`، وM11 `media`.

#### البناء والنشر `/{tenant}/app/releases`
- **الغرض**: حالة كل منصة، وطلب بناء بنقرة، والموافقة على كل تقديم للمراجعة (F-M09، ADR-0007).
- **التخطيط**: بطاقة لكل منصة فيها الإصدار الحي وخط زمني لآخر بناء: في الطابور، فيُبنى، فوُقّع، فرُفع، فقيد المراجعة، فمقبول أو مرفوض، فحي. ثم جدول الإصدارات السابقة. ورسائل الفشل بلغة التاجر لا السجل الخام.
- **حالات خاصة**: إن لم يكتمل معالج حسابات المطوّر فالحالة مقفلة، ومعها رابط المعالج. وإن كان بناء جاريًا يتعطل طلب بناء جديد.
- **الأفعال**: «اطلب بناءً جديدًا» (تأكيد)، و«وافق على التقديم للمراجعة» (تأكيد)، وروابط TestFlight وInternal testing.
- **API**: M13 `builds` (GET وPOST)، و`builds/{id}`، و`builds/{id}/submit`. وM14 `developer-accounts/status`.

#### حسابات المطوّر `/{tenant}/app/developer-accounts`
غلاف من M15 (PageHeader، وقائمة خطوات، وحالات). والخطوات ومنطقها ونصوصها من M14 (F-M10، SPK-14).

#### الربط `/{tenant}/settings/connection`
- **الغرض**: صحة الربط بزد (F-M01).
- **التخطيط**: بطاقة حالة (مربوط، أو يحتاج إعادة تفويض، أو مفصول). ثم اسم المتجر ونطاقه، والصلاحيات الممنوحة مقابل المطلوبة، وآخر webhook وصل، وآخر مزامنة.
- **حالات خاصة**: صلاحيات معلّقة (`APP_PERMISSIONS_PENDING_APPROVAL`) تُعرض معها خطوات «عطّل التطبيق في زد ثم فعّله».
- **الأفعال**: «أعد التفويض»، و«استورد الشعار والألوان مجددًا». والثاني ينشئ اقتراحًا في مسودة الهوية ولا يستبدل شيئًا منشورًا.
- **API**: M10 `connection`، و`connection/reauthorize`، و`connection/reimport`.

#### الفريق `/{tenant}/settings/team`
- **الإصدار الأول**: بطاقة المالك فقط مع عبارة «إضافة أعضاء قريبًا». والتفاصيل في F-M14 (Could).

#### الاشتراك `/{tenant}/settings/subscription`
- **التخطيط**: اسم الباقة من اشتراك زد، وقائمة المزايا المفعّلة والمقفلة، ورابط «إدارة الاشتراك في زد» يفتح في نافذة جديدة.
- **API**: M10 `subscription`.

### 3.2 المحرر: التخطيط وشجرة المكونات

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ‹ الصفحات / الرئيسية   [حُفظت المسودة]   ↶ ↷   [الجهاز ▾] [ع/En] [فاتح/داكن]  [السجل] [مراجعة ونشر (5)] │
├────────────────────┬────────────────────────────────────────┬────────────────┤
│ الإعدادات (النهاية)  │             المعاينة (الوسط)             │ الكتل (البداية)  │
│ 360px، قابلة للطي    │   إطار هاتف 390×844، أدنى عرض 420px      │ 300px          │
│ الأساسي (≤ 7)        │   [iframe: Flutter Web]                  │ ⋮⋮ سلايدر       │
│ ▸ متقدم (≤ 8)        │                                          │ ⋮⋮ تصنيفات      │
│ الظهور               │                                          │ ⋮⋮ منتجات       │
│ [تكرار] [حذف]        │                                          │ [+ أضف كتلة]    │
└────────────────────┴────────────────────────────────────────┴────────────────┘
```

في RTL تكون البداية يمينًا، فلوحة الكتل يمين الشاشة ولوحة الإعدادات يسارها. والعرض الأدنى للمحرر 1280px. وبين 1024 و1279 تُطوى لوحة الإعدادات إلى Sheet. وتحت 1024 تظهر رسالة «المحرر يحتاج شاشة أوسع» مع معاينة للقراءة فقط.

```text
(editor)/layout.tsx
└─ EditorProviders              # TenantContext، EditorStoreProvider، PreviewBridgeProvider
   ├─ EditorTopBar
   │  ├─ Breadcrumb   SaveStatus   UndoRedo
   │  ├─ PreviewToolbar         # الجهاز، واللغة، والوضع، و(لاحقًا) التاريخ والشريحة
   │  ├─ VersionHistoryButton ─► VersionHistorySheet
   │  └─ ReviewPublishButton ──► DiffReviewDialog ─► PublishConfirm
   └─ ResizablePanelGroup (direction="horizontal")
      ├─ StartPane: {children}  # يحدده المسار: BlockOutline أو BrandSections أو ScreenModules
      ├─ CenterPane: PhoneFrame ─► PreviewHost (iframe)  # يستمر عبر التنقل
      └─ EndPane: SettingsPanel  # SchemaForm أو BrandSectionForm أو ModuleForm

design/pages/[pageId]/page.tsx
└─ PageEditor
   ├─ BlockOutline
   │  ├─ DragDropProvider ─► SortableBlockRow[]   # مقبض، وأيقونة، واسم، وملخص، وشارات، وقائمة
   │  ├─ InsertSlot[]                             # «+» بين الصفوف
   │  └─ AddBlockButton ─► BlockCatalogDialog
   └─ BlockSettings (في EndPane عبر portal للحالة)
      ├─ BlockHeader (الاسم القابل للتعديل، والنوع، والمساعدة)
      ├─ SchemaForm group="basic"
      ├─ Accordion "متقدم" ─► SchemaForm group="advanced"
      ├─ VisibilityCard (إظهار وإخفاء. والتواريخ لاحقًا)
      └─ BlockFooterActions (تكرار، وحذف)
```

### 3.3 تدفقات المحرر والهوية

#### 3.3.1 فتح المحرر
1. `GET /pages/{key}/draft` (أو `/shell/draft` أو `/theme/draft`) يعيد الجسم و`lock_version` ونتيجة `lint`.
2. فحص النسخة الاحتياطية المحلية (القسم 4.2). إن كانت أحدث من `lock_version` الخادم يظهر حوار «لديك تغييرات لم تُحفظ من جلسة سابقة» بخيارين: «استعِدها» و«تجاهلها».
3. تعبئة مخزن المحرر، وجلب `GET /catalog/blocks`، وبناء فهرس الأصول المستخدمة في المسودة (`GET /assets/{id}` لما ليس في الكاش).
4. `POST /pages/{key}/draft/render` باللغة الحالية، ثم إرسال الغلاف إلى المعاينة برسالة `render` بعد وصول `ready`.
5. **مسار الخطأ**: 404 يعيد إلى قائمة الصفحات مع تنبيه. وفشل الشبكة يعرض `ErrorState` مع إعادة المحاولة. والمعاينة الفاشلة لا تمنع التحرير (القسم 5.3.8).

#### 3.3.2 إضافة كتلة من الكتالوج
1. يضغط التاجر «أضف كتلة» أو «+» بين صفين. موضع الإدراج بعد الكتلة المحددة، أو في الموضع المضغوط، أو في النهاية.
2. يُفتح `BlockCatalogDialog` بحقل بحث ومجموعات، والأنواع المتاحة من `GET /catalog/blocks`:
   - **الترويج**: `hero_slider`، و`banner_grid`، و`countdown`، و`announcement_bar`.
   - **المنتجات والتصنيفات**: `product_carousel`، و`product_grid`، و`category_strip`، و`brand_strip` (خلف علم `dash.brand_strip`).
   - **المحتوى**: `rich_text`، و`trust_badges`، و`spacer`.
   - **من متجرك**: `zid_theme_section` بعنوان «اربط قسمًا من متجرك».
3. كل بطاقة فيها أيقونة، واسم عربي، وسطر وصف، وصورة مصغرة ثابتة. والكتلة التي بلغت حدها (G-09: 40 كتلة في الصفحة، و6 كتل منتجات) تظهر معطلة ومعها السبب.
4. الاختيار ينشئ كتلة بمعرّف جديد بالنمط `^b_[a-z0-9]{8}$` (M03) وقيم `default` من المخطط، ثم قيم القطاع من الهوية الجاهزة، كنسبة 3:4 للأزياء. والكتل المرتبطة بمصدر تبدأ بمصدر غير فارغ («الأكثر مبيعًا» أو التصنيفات العليا)، حتى لا تظهر فارغة في المعاينة.
5. تُحدَّد الكتلة الجديدة، وتُفتح إعداداتها، وتُمرَّر المعاينة إليها (`select` مع `scroll: true`)، ويُعلن «أُضيفت كتلة سلايدر في الموضع 3 من 8».
6. يُسجَّل إدخال في التاريخ باسم «إضافة سلايدر»، ويبدأ الحفظ التلقائي.
7. **مسار الخطأ**: إن بلغت الصفحة 40 كتلة (G-09) يتعطل الكتالوج ومعه السبب.

#### 3.3.3 إعادة الترتيب بالسحب وبلوحة المفاتيح
- **بالفأرة واللمس**: من المقبض (`⋮⋮`) فقط، لا من الصف كله، حتى لا يتعارض مع التحديد. وأثناء السحب يُعرض `DragOverlay` بنسخة مصغرة، ومؤشر إدراج بين الصفوف. وعند الإفلات يُحرَّك العنصر بـ `move` من `@dnd-kit/helpers`، ويُسجَّل «نقل سلايدر من 1 إلى 3».
- **بلوحة المفاتيح عبر dnd-kit**: التركيز على المقبض، ثم Space أو Enter للالتقاط، والسهمان للأعلى والأسفل للتحريك، وSpace أو Enter للإفلات، وEscape للإلغاء. وهي المفاتيح الافتراضية الموثقة لمستشعر لوحة المفاتيح ([dnd-kit accessibility](https://dndkit.com/guides/accessibility)).
- **المسار المضمون بلا مكتبة**: في قائمة الصف «تحريك لأعلى» و«تحريك لأسفل»، واختصارا `Alt+↑` و`Alt+↓` على الصف المحدد. يعمل هذا المسار حتى لو تغيّرت واجهة dnd-kit.
- **الإعلانات بالعربية**: «التُقطت كتلة سلايدر، الموضع 1 من 8» ثم «الموضع 3 من 8» ثم «وُضعت في الموضع 3 من 8» أو «أُلغي النقل». والمواضع تبدأ من 1 لا من 0.
- بعد الإفلات تُرسل المسودة إلى المعاينة، وتبقى الكتلة محددة.
- **مسار الخطأ**: إفلات خارج القائمة أو Escape لا يغيّر شيئًا ولا يسجّل تاريخًا.

#### 3.3.4 الإعدادات: أساسي ومتقدم
1. تحديد كتلة (من القائمة أو بالنقر في المعاينة) يعرض نموذجها في لوحة النهاية.
2. **الأساسي**: 7 حقول على الأكثر، ظاهرة دائمًا ومرتبة بـ `x-ui.order`. مثال `hero_slider` (M03 القسم 5.8.1): الشرائح، والارتفاع (30% أو 40% أو 50% من الشاشة)، والتشغيل الآلي، والفاصل، والمؤشر، والهامش، والزوايا.
3. **متقدم**: Accordion مطوي افتراضيًا، فيه 8 حقول على الأكثر، بتسميات عربية مفهومة. لا أسماء مفاتيح ولا JSON خام ولا ألوان حرة خارج أدوار الهوية.
4. **الظهور**: مفتاح «إظهار في التطبيق» (`visibility.visible`). والكتلة المخفية تبقى في القائمة بشارة «مخفية»، وتُرسم في المعاينة شفافة بنسبة 40% مع وسم.
5. **قيود الحماية** (F-M03): القواعد G-01 إلى G-14 في [M03 القسم 5.6](M03-blocks-pages.md). المخطط يفرض الأعداد والأطوال (G-05، وG-09، وG-11)، والخادم يعيد بقيتها في `lint` فتُعرض على الكتلة والحقل. والمحرر يحسب محليًا وفورًا ما يمكن حسابه: التباين (G-02)، واختلاف نسب الشرائح (G-03)، والعرض الأدنى للصورة (G-04).
6. كل تعديل يمر بالمخزن، فالمعاينة، فالحفظ التلقائي. وأخطاء التحقق تظهر تحت الحقل، وتظهر شارة خطأ على الكتلة في القائمة.

#### 3.3.5 رفع صورة: اكتشاف النسبة واقتراح القص
1. يُفلت التاجر ملفًا في `ImageField`، أو يختار من مكتبة الوسائط (`GET /assets`).
2. **فحص فوري في المتصفح** قبل أي طلب: النوع (JPEG أو PNG أو WebP)، والحجم ضمن حد M11، والأبعاد بـ `createImageBitmap`، وبصمة `sha256` بـ `crypto.subtle.digest`. فيرى التاجر النسبة والدقة فورًا.
3. **الرفع** (M11): `POST /assets` بـ `mime` و`bytes` و`sha256` و`intended_slot` (من `x-ui.image.slot`، مثل `hero_slider`). ثم `PUT` مباشرة إلى الرابط الموقّع مع شريط تقدم، ثم `POST /assets/{id}/complete`.
4. **المعالجة**: استطلاع `GET /assets/{id}` كل ثانية حتى `ready`، وهو 10 ثوانٍ على الأكثر حسب M11. فيعود بـ `nearest_ratio`، و`crop_suggestions` لكل نسبة تسمح بها الخانة، و`focal`، و`has_alpha`، و`blurhash`، والمقاسات.
5. **اكتشاف النسبة والقرار**:
   - **الصورة الأولى في كتلة تأخذ نسبتها من الصورة** (`hero_slider`، و`banner_grid` بـ `aspect: auto`): تُقبل كما هي، وتحدد نسبة الإطار، وتظهر ملاحظة: «اكتشفنا نسبة 16:9، وسنعرض كل الشرائح بها».
   - **صورة لاحقة تختلف نسبتها أكثر من 10% عن الأولى** (G-03)، **أو خانة بنسبة ثابتة** (`banner_grid` بـ `aspect: 4:3` مثلًا): يُفتح `ImageCropDialog` على اقتراح القص المطابق من `crop_suggestions`، ومركزه نقطة الانتباه. ويستطيع التاجر تحريك المستطيل وتكبيره بـ `react-easy-crop`.
   - «اعتمد القص» يرسل `POST /assets/{id}/crops` بالنسبة والمستطيل، فينشئ M11 أصلًا مشتقًا. وقيمة الحقل `asset_ref` حسب M03: `asset_id` و`crop`.
6. **الدقة** (G-04): عرض أقل من 1080px يعطي تحذيرًا «الصورة أصغر من الموصى به وقد تبدو مشوشة». وأقل من 600px خطأ يمنع النشر، فيقترح المحرر صورة أكبر.
7. **الشفافية والوضع الداكن**: `has_alpha` مع لون سائد داكن يعطي تحذير «قد لا تظهر جيدًا على الخلفية الداكنة»، ومعه زر «اعرض في الوضع الداكن».
8. **صورة للإنجليزية**: رابط «صورة مختلفة للإنجليزية» يملأ `by_locale`، لأن البنرات كثيرًا ما تحمل نصًا عربيًا مدمجًا (M03 القسم 4.3).
9. **مسار الخطأ**: انقطاع الرفع يعرض «إعادة المحاولة» مع الاحتفاظ بالملف. والنوع غير المدعوم يعرض «استخدم JPG أو PNG أو WebP». والأصل الذي لم يصل إلى `ready` خلال 10 ثوانٍ يعرض «ما زالت الصورة قيد المعالجة» ويستمر الاستطلاع حتى 60 ثانية ثم رسالة. ورفض M11 (`failed`) يعرض سببه.

#### 3.3.6 التراجع والإعادة
- **النموذج**: كل فعل يُنتج `patches` و`inversePatches` عبر `produceWithPatches` من immer، ويُدفع إلى `past` ويُفرَّغ `future`.
- **الدمج**: تعديلات الحقل نفسه خلال 1000 ms تُدمج في إدخال واحد (`coalesceKey = blockId + path`)، حتى لا تصير كل ضغطة حرف خطوة.
- **الحد**: 100 خطوة لكل جلسة محرر. والتاريخ في الذاكرة فقط، ويضيع عند إعادة تحميل الصفحة، ويُذكر ذلك في المساعدة.
- **النطاق**: مكدس واحد يشمل المستندات المفتوحة في الجلسة (صفحة وهوية وشاشة). كل إدخال يحمل مرجع مستنده، والتراجع ينقل المستخدم إلى ذلك المستند إن كان غيره.
- **الاختصارات**: `Ctrl/Cmd+Z` للتراجع، و`Ctrl/Cmd+Shift+Z` أو `Ctrl+Y` للإعادة. ولا تعمل داخل حقل نص مُركَّز، فهناك يبقى سلوك المتصفح الأصلي.
- **الواجهة**: تلميح الزر يذكر الخطوة: «تراجع: تغيير الارتفاع».
- التراجع تغيير جديد في المسودة، فيُحفظ تلقائيًا كأي تعديل.

#### 3.3.7 الحفظ التلقائي للمسودة
1. أي تغيير يجعل المستند `dirty`، وتُكتب نسخة احتياطية محلية خلال ثانية (القسم 4.2).
2. الحفظ يبدأ بعد 1.5 ثانية من آخر تعديل كما في [M11 القسم 3.1](M11-app-config-service.md)، أو بعد 5 ثوانٍ على الأكثر أثناء الكتابة المستمرة.
3. `PUT /pages/{key}/draft` بالجسم كاملًا (`schema_rev` و`body`) وترويسة `If-Match: "{lock_version}"`. ولا يُرسل إلا طلب واحد في الوقت نفسه، وما يتغير أثناءه يُرسل بعده.
4. **200**: يُحدَّث `lock_version`، وتُحذف النسخة الاحتياطية، وتظهر «حُفظت المسودة». وتحذيرات `lint` (قواعد G-xx في M03) تُعرض على الكتل والحقول دون منع. ثم يُطلب الرسم من الخادم للمعاينة (القسم 5.3.3).
5. **409 تعارض**: حوار «عُدّلت هذه الصفحة من جلسة أخرى» يذكر من عدّل ومتى، بخيارين: «حمّل الأحدث» (تُنزَّل نسختي ملف JSON احتياطيًا) و«احتفظ بنسختي واستبدل» (تأكيد، ثم إعادة الإرسال بـ `If-Match: *` كما يسمح M11).
6. **الكتلة غير المكتملة لا توقف الحفظ**: الجسم يُتحقق منه بـ Ajv قبل الإرسال. والكتلة الجديدة التي لم تكتمل حقولها الإلزامية (مثل سلايدر بلا شريحة) تبقى محلية بشارة «أكمل الحقول المطلوبة لحفظها»، وتُستثنى من الجسم المرسل حتى تكتمل، وتبقى في النسخة الاحتياطية. أما الكتلة المحفوظة فالمحرر يمنع إفسادها: حذف آخر شريحة معطل مع السبب، والحقول النصية تحترم `maxLength`.
7. **422 من الخادم** رغم ذلك (اختلاف بين Ajv وopis، أو قاعدة خادم): لا يُحفظ شيء، وتُربط الأخطاء بالحقول بمؤشرها، وتُرسل الحادثة إلى Sentry لأنها تعني اختلافًا في العقد.
8. **5xx أو انقطاع**: إعادة بعد 2 ثم 4 ثم 8 ثم 16 ثم 32 ثانية، ثم «تعذّر الحفظ» مع زر يدوي. والنسخة الاحتياطية تحمي التغييرات.
9. **401 أو 419**: النسخة الاحتياطية محفوظة، ثم توجيه إلى الدخول، ثم عرض الاستعادة عند العودة.
10. `beforeunload` يحذّر فقط إن بقيت تغييرات لم تصل الخادم.

#### 3.3.8 مراجعة الفرق والنشر الفوري وسجل النسخ والرجوع
**المراجعة والنشر (F-M06)**:
1. زر «مراجعة ونشر» يعرض عدد المستندات التي تختلف مسودتها عن النسخة الحية (من حالة المسودة في `GET /pages` وفي مستندي `app-shell` و`theme`).
2. الضغط يفرغ الحفظ المعلّق أولًا (`flush`). فإن فشل يتوقف التدفق ويظهر السبب.
3. يُفتح `DiffReviewDialog`، ويطلب `GET /pages/{key}/diff?from=live&to=draft` لكل مستند متغير (والمسار نفسه تحت `/shell` و`/theme`). M11 يحسب الفرق بالكتل ثم بالحقول، بتسميات `x-ui.label` ([M11 القسم 5.1](M11-app-config-service.md)). والمحرر يحوّله إلى بطاقات عربية:
   - أُضيفت كتلة «منتجات: الأكثر مبيعًا» في الموضع 2.
   - حُذفت كتلة «عدّاد تنازلي».
   - نُقلت كتلة «تصنيفات» من 4 إلى 1.
   - تغيّر «الارتفاع» من متوسط إلى كبير.
   - تغيّرت صورة الشريحة 2، مع صورتين مصغرتين قبل وبعد من فهرس الأصول.
   - تغيّر اللون الأساسي، مع عيّنتين.
4. **قبل وبعد**: مفتاح يرسل إلى المعاينة الغلاف الحي أو غلاف المسودة (`mode: live` أو `draft`).
5. **التنبيهات**: تحذيرات `lint` من الخادم (مثل G-04 وG-10 وG-13) وتحذيرات التباين المحلية. وهي لا تمنع النشر.
6. **الأخطاء**: كل `lint.errors` (مثل G-07 وG-14) وأخطاء المخطط تمنع النشر، وكل خطأ رابط ينقل إلى الكتلة والحقل.
7. حقل «ملاحظة النشر» اختياري، ثم «انشر الآن» مع تأكيد: «ستظهر التغييرات في التطبيق عند التنقل التالي خلال 5 دقائق».
8. **الإرسال**: `POST /pages/{key}/publish` بـ `expected_lock_version` والملاحظة لكل مستند متغير، بالترتيب: `theme`، ثم `app-shell`، ثم الصفحات. وإن قبلت M11 النشر الموحد (Q-2) يصير طلبًا واحدًا.
9. **200**: تنبيه «نُشرت التغييرات» مع رقم نسخة كل مستند و«عرض السجل». و`unchanged: true` يُعامل نجاحًا صامتًا. ثم إبطال الاستعلامات (القسم 5.5).
10. **فشل جزئي** (نُشر مستند وفشل آخر): رسالة تذكر ما نُشر وما لم يُنشر وسببه، مع «أعد المحاولة» للباقي فقط.
11. **409** (`draft_conflict` أو `publish_in_progress`): رسالة «تغيّرت المسودة أثناء المراجعة» أو «نشر آخر جارٍ»، ثم إعادة جلب الفرق.
12. **422**: تُعرض الأخطاء كما في الخطوة 6.
13. **النشر الأول**: إن لم توجد نسخة حية يظهر الفرق كله إضافات بعنوان «النشر الأول».

**سجل النسخ والرجوع بنقرة**:
1. «السجل» في الشريط العلوي يفتح `VersionHistorySheet` للمستند الحالي (`GET /pages/{key}/versions`)، وفيه الرقم والتاريخ والناشر والملاحظة، والنسخة الحية موسومة.
2. اختيار نسخة يطلب جسمها (`GET .../versions/{number}`) ويعرضه في المعاينة للقراءة («تعرض النسخة 1840 للقراءة فقط»)، ويعرض فرقها عن الحية (`diff?from=live&to=1840`).
3. «اجعلها الحية»، ثم تأكيد: «سيعود التطبيق إلى النسخة 1840 خلال دقائق. ستبقى مسودتك كما هي».
4. `POST .../versions/{number}/rollback` ينقل مؤشر النسخة الحية إليها دون إنشاء نسخة جديدة، ويُسجَّل الفعل في سجل النشر ([M11 القسم 3.4](M11-app-config-service.md)).
5. إن حملت الاستجابة تحذيرًا بعدد كتل ستُسقط لعدم دعمها، يظهر تنبيه يذكر العدد مع رابط إلى الكتل.
6. «انسخ إلى المسودة» (`POST .../versions/{number}/restore`) يستبدل المسودة بجسم النسخة بعد تأكيد، لأنه يستبدل التعديلات غير المنشورة. وهو قابل للتراجع داخل الجلسة.

#### 3.3.9 الهوية: هوية جاهزة، والوضع الداكن جنبًا إلى جنب، وتحذيرات التباين
1. **الهويات الجاهزة**: معرض بفلتر القطاع (عطور، وأزياء، وإلكترونيات، وبقالة، وهدايا، ومطاعم) من M02 عبر `GET /presets` في M11، بين 8 و12 هوية. الضغط على هوية يعاينها مؤقتًا دون تسجيل، و«طبّق» يكتبها في المسودة كخطوة تراجع واحدة. وإن عدّل التاجر شيئًا بعد ذلك يظهر وسم «معدّلة من: هادئ».
2. **الأدوار اللونية**: `primary` و`secondary` و`accent` و`surface` و`sale` و`success` و`warning` و`error`، ولكل منها قيمة فاتحة وأخرى داكنة. وألوان `on_*` تُحسب آليًا ولا يُدخلها التاجر.
3. **فحص التباين** بـ `wcagContrast` من culori لكل زوج في الوضعين:
   - `on_primary` على `primary`، و`on_surface` على `surface`، و`sale` على `surface`: الحد 4.5:1.
   - `primary` على `surface` للأيقونات والحدود: الحد 3:1.
4. **ما دون الحد**: `ContrastBadge` أحمر بالنسبة الفعلية، وزر «أصلحه» يعدّل الإضاءة في OKLCH بخطوات حتى يبلغ الحد، مع ثبات الصبغة والتشبع، وفي 20 خطوة على الأكثر. فإن تعذّر يقترح أبيض أو أسود. وما بقي ناقصًا يظهر في قسم التنبيهات عند المراجعة.
5. **الوضع الداكن**: ثلاثة خيارات. «يتبع الجهاز» و«فاتح دائمًا» و«داكن مخصص». والأخير يفتح القيم الداكنة للتعديل، وقيمها الافتراضية مشتقة من لون العلامة (M02).
6. **جنبًا إلى جنب**: `theme_mode` بقيمة `split` يجعل المعاينة ترسم هاتفين متجاورين بالوضعين في محرك واحد، ويتسع إطار المعاينة. والبنرات المعلَّمة بتحذير الشفافية (القسم 3.3.5) يظهر عليها وسم في الهاتف الداكن.
7. **الخطوط**: خطان مضمّنان في كل ملف تنفيذي وقائمة منسّقة من M02. و`font_ar` و`font_en` مستقلان. ورفع خط خاص لاحقًا (F-M04b).
8. **الشكل والكثافة**: ثلاثة أنصاف أقطار (حاد، ومتوسط، ودائري) وكثافتان (مريحة، ومضغوطة)، تُطبق على كل الكتل.
9. **الشعار**: فاتح وداكن، ويُستورد من زد آليًا (F-M01). والتغيير هنا لا يغيّر أيقونة التطبيق، فتلك في الأصول وتحتاج بناءً.

#### 3.3.10 ضبط شاشة أصلية
1. اختيار قسم من `/design/screens` يفتح مستند `app-shell` على ذلك القسم.
2. المعاينة تنتقل إلى الشاشة المعنية برسالة `navigate`: `product` مع منتج نموذجي لقسمي صفحة المنتج والبطاقة، و`home` للشريطين.
3. **صفحة المنتج**: قائمة `product_page.modules` قابلة للترتيب والإخفاء بالأدوات نفسها، والمقفل منها بشارة قفل. ووحدة `trust_badges` تشير إلى كتلة (`ref`).
4. **البطاقة والشريطان**: نموذج القسم من مخطط `app-shell` بالقواعد نفسها (أساسي ومتقدم).
5. الحفظ والمراجعة والنشر كالصفحات تمامًا، عبر `/shell/...`.

### 3.4 تدفقات خارج المحرر

#### 3.4.1 الدخول والجلسة
1. **أول تثبيت**: «تفعيل» في سوق زد، ثم OAuth، ثم callback في M10، ثم `ZidHandoff` في M12 يُنشئ المالك والجلسة، ثم توجيه إلى `app.{domain}/{tenant}/onboarding`. وإن كان للمتجر مالك آخر أو لحساب قائم البريد نفسه، يحوّل M12 إلى `/connect/sign-in` ثم `/connect/confirm`.
2. **عودة التاجر** في `/login`:
   1. `GET /sanctum/csrf-cookie`.
   2. إدخال البريد، ثم `POST /api/v1/auth/email/code`. والرد 202 دائمًا، فتظهر «إن كان البريد مسجلًا ستصلك رسالة» دون كشف وجود الحساب.
   3. إدخال الرمز المكوّن من ستة أرقام (حقل OTP بأرقام لاتينية، ولصق الرمز كاملًا)، ثم `POST /api/v1/auth/email/verify`. والرد يحمل `me`.
   4. التوجيه إلى `next` أو `/{tenant}`، أو `/select-store` إن كان للمستخدم أكثر من متجر.
3. **فريق المنصة**: `/admin/login`، ثم `GET /sanctum/csrf-cookie`، ثم `POST /api/v1/auth/login` (الرد `two_factor: true`)، ثم `POST /api/v1/auth/two-factor` بالرمز أو رمز الاسترداد، ثم `/admin/tenants`. والمدير الذي لم يفعّل TOTP يُوجَّه إلى شاشة التفعيل.
4. **كل تحميل**: `proxy.ts` يتحقق من وجود كوكي الجلسة فقط. ثم `useMe()` يجلب `GET /api/v1/me?tenant={tenant}`. فإن أعاد 401 يُفرَّغ الكاش ويوجَّه إلى `/login?next=...`.
5. **`TenantGate`**: إن لم يكن `{tenant}` ضمن `me.tenants` تظهر 403. وإن كان الربط `disconnected` يظهر `DisconnectedState`.
6. **الخروج**: `POST /api/v1/auth/logout`، ثم `queryClient.clear()`، ثم `/login`.
7. **مسار الخطأ**: رمز خاطئ أو منتهٍ يعيد 422 `login_code_invalid`، فتظهر «الرمز غير صحيح أو انتهت صلاحيته» مع «أرسل رمزًا جديدًا». وتجاوز الحد يعيد 429 مع `Retry-After`، فيُعطَّل الإرسال مع عدّاد تنازلي.

#### 3.4.2 إرسال حملة
1. حملة جديدة، ثم ملء النموذج مع معاينة حية للإشعار وتقدير الجمهور (يُطلب بعد 500 ms من آخر تغيير في الجمهور).
2. «أرسل الآن» أو «جدولة»، ثم تأكيد: «سيُرسل إلى نحو 12,430 جهازًا الآن. لا يمكن إلغاء الإرسال بعد بدئه».
3. `POST campaigns` ثم `POST campaigns/{id}/send` (أو `schedule_at`).
4. التحويل إلى صفحة الحملة بحالة «قيد الإرسال» مع استطلاع الإحصاءات.
5. **مسار الخطأ**: 422 يظهر على الحقول. و`push_not_configured` (لم تكتمل إعدادات الإشعارات في البناء) يعرض `LockedState` ورابط البناء والنشر.

#### 3.4.3 طلب بناء والموافقة على التقديم
1. من الأصول أو البناء والنشر: «اطلب بناءً جديدًا»، ثم تأكيد يذكر ما سيتغير (الاسم والأيقونة).
2. `POST builds`، ثم استطلاع كل 10 ثوانٍ، ثم خط زمني حي.
3. عند `uploaded` يظهر زر «وافق على التقديم للمراجعة» (ADR-0007)، ثم تأكيد، ثم `POST builds/{id}/submit`.
4. **مسار الخطأ**: `failed` يعرض رسالة M13 المفهومة مع «أعد المحاولة» أو «تواصل مع الدعم» ومعرّف البناء.

#### 3.4.4 مفتاح إيقاف أو علم (الإدارة)
1. `/admin/flags`، ثم اختيار علم عام أو تجاوز لمتجر.
2. التبديل يفتح تأكيدًا فيه الأثر: عدد المتاجر، ونسبة الجلسات المتأثرة من M08 إن توفرت. وحقل السبب إلزامي. والأعلام العامة تتطلب كتابة اسم العلم.
3. `PUT` بالسبب، ثم تحديث الجدول وسجل التدقيق.
4. `min_supported_app_version` لكل منصة: إدخال semver يُتحقق منه، مع عرض نسبة الجلسات تحت هذا الإصدار، وتأكيد بكتابة الرقم.
5. **مسار الخطأ**: 409 إن عدّل مشرف آخر القيمة نفسها، فيُعاد التحميل مع رسالة.

### 3.5 شاشات لوحة الإدارة

| الشاشة | المحتوى والتخطيط | الأفعال | API |
|---|---|---|---|
| المتاجر | جدول من الخادم بـ 50 صفًا. الأعمدة: المتجر، ومعرّف زد، والباقة، وشارة الربط، وشارة الـ webhooks، وآخر بناء وإصداره، والجلسات الخالية من الانهيار لآخر 7 أيام، وآخر نشاط. وفلاتر الحالة والباقة و«فيه مشكلة»، وبحث بالاسم أو النطاق أو المعرّف | فتح التفاصيل | M12 `admin/tenants` |
| تفاصيل متجر | تبويبات: نظرة عامة، والربط والرموز، والـ webhooks، والبناء، والأعلام، والمزايا المفعّلة، والتدقيق. و(لاحقًا F-P06) الإعداد للقراءة ومعاينة التطبيق. **لا انتحال لحساب التاجر** | أفعال كل تبويب أدناه | M12، وM10، وM13 |
| الربط والرموز | قائمة عبر المتاجر: رموز تنتهي خلال 30 يومًا، وفشل تجديد، وصلاحيات معلّقة، وتطبيقات أُزيلت | «أعد محاولة التجديد» مع سبب | M10 `admin/connections` |
| صحة الـ webhooks | لكل متجر ونوع حدث: آخر وصول، والفشل خلال 24 ساعة، وهل علّقته زد (30 فشلًا في الساعة)، وتأخر الطابور | «أعد المزامنة» (جلب الكيانات من API) مع سبب | M10 `admin/webhooks` |
| البناء والأسطول | جدول البناءات (المتجر، والمنصة، والإصدار، والحالة، والمدة)، ورابط سجل CI | «ابنِ متجرًا»، و«ابنِ الأسطول» (اختيار الإصدار، والمجموعة، وتشغيل تجريبي، وتأكيد بالكتابة) | M13 `admin/builds`، و`admin/fleet-builds` |
| الأعلام ومفاتيح الإيقاف | جدول الأعلام العامة والتجاوزات لكل متجر، و`min_supported_app_version` لكل منصة | التبديل (القسم 3.4.4) | M12 `admin/flags` |
| المراقبة | لكل متجر: نسبة الجلسات الخالية من الانهيار ورابط أبرز انهيار في Sentry. وصحة API التخطيطات: p95، ونسبة الخطأ، ونسبة إصابة CDN. والعرض موجز، والتفصيل في Sentry ولوحات المراقبة | روابط خارجية | M12 `admin/monitoring` |
| سجل التدقيق | الفاعل، والفعل، والمتجر، والوقت، والسبب، وفرق القيمة، مع فلاتر | — | M12 `admin/audit-logs` |

### 3.6 لاحقًا (Should وCould)

| الميزة | الأولوية | التصميم المختصر |
|---|---|---|
| **جدولة النشر والحزم الموسمية** (F-M06b) | Should | في حوار النشر خيار ثانٍ «جدولة» بتاريخ بداية ونهاية اختيارية بتوقيت الرياض مع التسمية الهجرية. والحزمة الموسمية تجمع الهوية والرئيسية والسبلاش الداخلي والشريط الإعلاني في إصدار واحد يعود تلقائيًا إلى الأساس. والجدولة تظهر في السجل بحالة «مجدولة» مع «إلغاء». API من M11 |
| **محاكاة التاريخ** | Should | في شريط المعاينة «اعرض بتاريخ»، فيُطلب الرسم من الخادم بـ `as_of` (M11) وتُرسل `date`، فتُقيَّم نوافذ ظهور الكتل والعدّاد التنازلي والجدولة كأن اليوم ذلك التاريخ. مثاله «اعرض بتاريخ 1 رمضان» |
| **المعاينة على الجهاز بـ QR** (F-M08b) | Should | زر «اعرض على جوالي» يطلب `POST /pages/{key}/preview-tokens` من M11، فيعود `deep_link` صالح 30 دقيقة، وترسم اللوحة QR محليًا. والرابط يفتح مسار معاينة مخفيًا في تطبيق التاجر (M07). ويصبح Must إن فشل SPK-15 |
| **مساعد الذكاء الاصطناعي** (F-M12) | Should | تفصيله بعد الجدول |
| **رفع خط خاص** (F-M04b) | Should | رفع TTF أو OTF، ثم فحص تغطية العربية والأوزان من M02، ثم تقرير قبول أو رفض بالعربية |
| **النوافذ المنبثقة وشاشات الترحيب** (F-M05b) | Should | شاشتان تحت «التصميم»، بالمحرر نفسه وقيود M09: تكرار محدود، ولا تغطية كاملة |
| **لقطات المتجر من المعاينة** (F-M09b) | Should | في الأصول «ولّد اللقطات»: المعاينة ترسم شاشات محددة بإطارات وعناوين بلغتين، ثم تُرفع إلى M13 |
| **أدوات الدعم** (F-P06) | Should | تبويب «الإعداد» في تفاصيل المتجر: المستندات المنشورة والمسودة للقراءة فقط، والمعاينة نفسها بلا أدوات تعديل |
| **محاكاة الشريحة والاستهداف** (F-M13) | Could | «اعرض كـ: زائر، أو مسجّل، أو VIP» يرسل `segment`. وبطاقة «الظهور» تكسب حقل الشرائح |
| **فريق التاجر** (F-M14) | Could | دعوة بالبريد، وأدوار المحرر والمسوّق والمشاهد. والواجهة جاهزة لأنها مبنية على `permissions` |
| **الوضع الداكن للوحة، والواجهة بالإنجليزية** | Could | `next-themes` وقيم `.dark` لـ shadcn، وملء `messages/en.json` |

**مساعد الذكاء الاصطناعي (Should)**:
1. لوحة جانبية «المساعد» في جهة النهاية، فيها حقل أوامر عربي وأمثلة جاهزة، مثل «خلي المنتجات منتجين بالصف» و«سوّ قسم لعروض رمضان».
2. الطلب يُرسل مع مرجع المسودة و`lock_version`. والخادم يعيد شرحًا عربيًا و**JSON Patch** على المسودة (RFC 6902)، يتحقق منه بالمخطط قبل إعادته (ADR-0004).
3. تُعرض النتيجة `DiffCard` بالمكوّن نفسه الذي يرسم مراجعة الفرق، مع معاينة متفائلة مؤقتة. والفرق هنا يُحسب في المتصفح بـ `jsondiffpatch` لأن الاقتراح لم يُحفظ بعد.
4. «طبّق» يُدخل التعديل خطوة تراجع واحدة باسم «المساعد: …» ويحفظ تلقائيًا، و«تجاهل» يعيد المعاينة.
5. المساعد **لا ينشر أبدًا**، ولا يلمس إلا المسودة المفتوحة.
6. كتابة نصوص الإشعارات زر داخل منشئ الحملة يملأ الحقول بلغتين، والتاجر يعدّلها.
7. مالك الـ endpoint لم يُحدد في خريطة الوحدات (القسم 8).

## 4. نموذج البيانات

### 4.1 حالة المحرر في المتصفح

```ts
type DocKey = string;                       // 'home' أو مفتاح صفحة أو 'app-shell' أو 'theme'
type DocKind = 'page' | 'shell' | 'theme';

interface LintIssue {
  rule?: string;                            // 'G-04' … من M03
  blockId?: string;
  pointer: string;                          // JSON Pointer داخل الجسم
  severity: 'error' | 'warning';
  message: { ar: string; en: string };
  source: 'server' | 'ajv' | 'local';       // local: التباين المحسوب في المتصفح
}

interface DraftState {
  doc: DocKey;
  kind: DocKind;
  schemaRev: number;
  lockVersion: number;                      // آخر lock_version أكّده الخادم
  liveVersion: number | null;               // null قبل أول نشر
  body: unknown;                            // الأنواع من src/gen/blocks
  localOnlyBlockIds: string[];              // كتل جديدة لم تكتمل، لا تُرسل بعد
  dirty: boolean;
  saveState: 'idle' | 'pending' | 'saving' | 'saved' | 'blocked' | 'error' | 'conflict' | 'offline';
  issues: LintIssue[];
}

interface HistoryEntry {
  label: string;                            // «نقل سلايدر من 1 إلى 3»
  doc: DocKey;
  patches: Patch[];                         // من immer
  inverse: Patch[];
  at: number;
  coalesceKey?: string;
}

interface PreviewState {
  status: 'loading' | 'ready' | 'error' | 'outdated' | 'fallback';
  device: 'iphone_6_1' | 'android_compact' | 'large_6_7';
  locale: 'ar' | 'en';
  themeMode: 'light' | 'dark' | 'split';
  seq: number;                              // آخر render أرسلته اللوحة
  renderedSeq: number;                      // آخر ما أكدت المعاينة رسمه
  lastServer: Record<DocKey, { lockVersion: number; locale: string; envelope: unknown }>;
  supportedBlocks: Record<string, number>;  // من ready
}

interface EditorState {
  tenantId: string;
  activeDoc: DocKey;
  drafts: Record<DocKey, DraftState>;
  assetIndex: Record<string, AssetInfo>;    // من GET /assets/{id}
  selection: { blockId: string | null; itemIndex: number | null };
  hoverBlockId: string | null;
  past: HistoryEntry[];                     // 100 على الأكثر
  future: HistoryEntry[];
  preview: PreviewState;
}
```

### 4.2 ما يُخزَّن أين

| البيانات | المكان | المدة | ملاحظة |
|---|---|---|---|
| جلسة المستخدم | كوكي `httpOnly` من Laravel على `.{domain}` | حسب M12 | لا تصل إليها JavaScript |
| رمز CSRF | كوكي `XSRF-TOKEN` | حسب Laravel | يُقرأ ويُرسل في الترويسة |
| اللغة | كوكي `locale` | سنة | يكتبه Next.js |
| حالة المحرر والتاريخ | ذاكرة الصفحة (zustand) | الجلسة | يضيع عند إعادة التحميل، والمسودة محفوظة في الخادم |
| النسخة الاحتياطية للمسودة | `localStorage` بمفتاح `intishar:backup:{tenant}:{doc}` | حتى أول حفظ ناجح، أو 7 أيام | `{ v: 1, baseLockVersion, body, localOnlyBlockIds, savedAt }`. ولا بيانات شخصية فيها |
| تفضيلات الواجهة | `localStorage` بمفتاح `intishar:ui` | دائم | عرض اللوحات، وآخر جهاز معاينة، والأقسام المطوية |
| الكتلة المحددة والجهاز | الرابط عبر `nuqs` (`?block=b_h7k2m9qa&device=iphone_6_1`) | — | للمشاركة وإعادة التحميل |
| كاش الاستعلامات | ذاكرة TanStack Query | `gcTime` | لا يُحفظ على القرص |
| المسودات والنسخ والإصدارات والوسائط والحملات وغيرها | الخادم (M11، وM06، وM13) | دائم | مصدر الحقيقة |

اللوحة لا تملك قاعدة بيانات، وكل كيان دائم تملكه الوحدة المعنية في الخادم.

## 5. الواجهات والعقود

### 5.1 اصطلاحات مشتركة (تؤكدها M12)

- **البادئات** ([M12 القسم 5](M12-platform-core.md)): لوحة التاجر `https://api.{domain}/api/v1/tenants/{tenant}/...` ومعها `/api/v1/me`، والإدارة `/api/v1/admin/...`، والدخول `/api/v1/auth/...`.
- **المتجر في المسار**: يطابق مسار اللوحة (القسم 2.7.1)، فلا يكتب تبويب في متجر تبويب آخر. وM11 كتب مساراته بالبادئة `/api/dashboard/v1` بلا متجر، وهذا يخالف اصطلاح M12. واللوحة تتبع M12، ومسارات M11 تُقرأ تحت `/api/v1/tenants/{tenant}` (القسم 8.2).
- **الغلاف**: الاستجابة الناجحة داخل `data` حسب M12، والعميل يفكه.
- **الترويسات**: `Accept: application/json`، و`Accept-Language: ar`، و`X-XSRF-TOKEN` لكل ما ليس GET، و`If-Match` للمسودات.
- **الأخطاء**: بصيغة M12، وفيها حقل `code` ثابت مع حالة HTTP. وأمثلة M11 تستخدم الاسم `error` للحقل نفسه، فالعميل يقرأ `code` ويقبل `error` حتى يُوحَّد (القسم 8.2). وأخطاء الحقول بمؤشر JSON ورسالة بلغتين. والعميل يحوّلها:
  - `422` بأخطاء حقول: `setError` على الحقول المطابقة للمؤشر.
  - `409`: حوار التعارض أو «نشر آخر جارٍ».
  - `403`: صفحة لا صلاحية، أو تنبيه إن كان فعلًا داخل صفحة.
  - `401` و`419`: القسم 3.4.1.
  - `429`: تنبيه «حاول بعد X ثانية» من `Retry-After`.
  - `5xx`: `ErrorState` أو تنبيه، ومعه `request_id` من ترويسة الاستجابة.
- **الترقيم**: cursor كما في M11.

### 5.2 Endpoints التي تستدعيها اللوحة

مسارات المتجر نسبية إلى `/api/v1/tenants/{tenant}`، ومسارات الإدارة إلى `/api/v1/admin`، والجلسة والدخول كما هي.

| الشاشة | الطريقة والمسار | الوحدة المالكة |
|---|---|---|
| الجلسة | `GET /sanctum/csrf-cookie`، و`GET /api/v1/me?tenant=`، و`POST /api/v1/auth/logout` | M12 |
| الدخول | `POST /api/v1/auth/email/code`، و`POST /api/v1/auth/email/verify`، و`POST /api/v1/connect/confirm`، و`POST /api/v1/auth/login`، و`POST /api/v1/auth/two-factor`، و(Should) `GET /api/v1/auth/zid/redirect` | M12 وM10 |
| كتالوج الكتل | `GET /catalog/blocks` | M11 (وBLK-15 في M03) |
| الصفحات | `GET` و`POST /pages`، و`PATCH /pages/{key}` | M11 |
| المسودة | `GET` و`PUT` و`DELETE /pages/{key}/draft`، و`POST /pages/{key}/draft/render` | M11 |
| الفرق والنشر | `GET /pages/{key}/diff`، و`POST /pages/{key}/publish` | M11 |
| النسخ | `GET /pages/{key}/versions`، و`GET .../versions/{number}`، و`POST .../rollback`، و`POST .../restore` | M11 |
| الهوية والشاشات | المسارات نفسها تحت `/theme/...` و`/shell/...`، و`GET /presets` | M11، والمحتوى من M02 |
| الاستيراد والربط | `GET /imports/{id}`، و`POST /imports/{id}/apply`، و`GET /pages/{key}/bindings`، و`PATCH /bindings/{id}` | M11 |
| الوسائط | `POST /assets`، و`POST /assets/{id}/complete`، و`GET /assets/{id}`، و`POST /assets/{id}/crops`، و`GET /assets` | M11 |
| المعاينة على الجهاز (لاحقًا) | `POST /pages/{key}/preview-tokens` | M11 |
| منتقيات الكتالوج | `GET /catalog/products?q=`، و`GET /catalog/categories` | M10 |
| الإشعارات | `/push/campaigns`، و`.../{id}/send`، و`.../{id}/stats`، و`/push/automations`، و`/push/audience-estimate` | M06 |
| التحليلات | `GET /analytics/summary`، و`.../timeseries`، و`.../blocks` | M08 |
| الأصول والبناء | `/app/assets`، و`.../generate`، و`/builds`، و`.../{id}/submit` | M13 |
| الإعداد وحسابات المطوّر | `GET /onboarding`، و`/developer-accounts` | M14 |
| الربط والاشتراك | `GET /connection`، و`POST .../reauthorize`، و`POST .../reimport`، و`GET /subscription` | M10 |
| أحداث استخدام اللوحة | `POST /events` (القسم 5.6) | M08 |
| الإدارة | `/tenants`، و`/connections`، و`/webhooks`، و`/builds`، و`/fleet-builds`، و`/flags`، و`/monitoring`، و`/audit-logs` تحت `/api/v1/admin` | M12، وM10، وM13 |

أمثلة حفظ المسودة، والتعارض، وخطأ المخطط، والفرق، والنشر، وطلب الرفع، وحالة الأصل موجودة في [M11 القسم 5.1](M11-app-config-service.md) ولا تُكرر هنا. وهذا ما تضيفه اللوحة:

**`GET /api/v1/me?tenant={tenant}`**: شكله في [M12 القسم 5.3](M12-platform-core.md) داخل الغلاف `data`. واللوحة تعتمد منه: `tenants` لمبدّل المتجر، و`current_tenant.permissions` للقوائم والأزرار، و`current_tenant.entitlements.features` لحالة `LockedState`، و`current_tenant.connection.status` لحالة `DisconnectedState`، و`app_locales` للحقول ثنائية اللغة، و`flags` لأعلام اللوحة (`dash.preview_flutter`، و`dash.brand_strip`، و`dash.feature.zid_login`)، و`pending_link` لتحويل `/connect/confirm`.

**مقترح على M11: نشر موحد** (Q-2). طلب واحد ذري بدل نشر كل مستند منفردًا:

```json
{
  "items": [
    { "doc": "theme", "expected_lock_version": 7 },
    { "doc": "home", "expected_lock_version": 18 }
  ],
  "note": "عروض الجمعة البيضاء"
}
```

```json
{
  "release_id": "rel_01JD5Q",
  "published_at": "2026-11-10T09:20:00Z",
  "items": [
    { "doc": "theme", "version": 58, "unchanged": false },
    { "doc": "home", "version": 1843, "unchanged": false }
  ]
}
```

### 5.3 بروتوكول المعاينة (`intishar.preview` الإصدار 1)

M03 تنفذ الطرف المستقبِل (BLK-13)، وتسمي الرسائل الأساسية `ready` و`render` و`select` و`block_tap`، وتترك شكلها ومهلها لهذه الوحدة ([M03 القسم 3.6](M03-blocks-pages.md)). والأسماء أدناه تحافظ على تسمياتها.

#### 5.3.1 الغلاف

كل رسالة **نص JSON** يُرسل بـ `postMessage`، وحجمه 512 KB على الأكثر. النص يُبسّط فك الترميز في Dart (`jsonDecode`)، ويُفحص بـ zod في اللوحة.

```json
{
  "protocol": "intishar.preview",
  "v": 1,
  "id": "m_000124",
  "type": "render",
  "sent_at": 1762766400000,
  "payload": {}
}
```

| الحقل | النوع | القاعدة |
|---|---|---|
| `protocol` | نص ثابت | أي قيمة أخرى تُهمل بصمت |
| `v` | عدد صحيح | إصدار البروتوكول المتفق عليه في المصافحة |
| `id` | نص | فريد لكل مرسِل، ويتزايد |
| `type` | نص من القائمة | النوع المجهول يُهمل، ويرد المستقبِل بـ `error` من نوع `bad_message` |
| `sent_at` | ملّي ثانية | لقياس زمن التحديث |
| `payload` | كائن | يُتحقق منه بمخطط النوع |

#### 5.3.2 أنواع الرسائل

| الاتجاه | النوع | الحمولة | متى |
|---|---|---|---|
| المعاينة ← اللوحة | `ready` | `protocols`، و`build`، و`flutter`، و`renderer`، و`catalog_rev`، و`supported_blocks`، و`supported_screens` | بعد أول إطار |
| اللوحة ← المعاينة | `hello` | `protocol`، و`session_id`، و`tenant_id`، و`locale`، و`theme_mode`، و`device`، و`flags` | بعد التحقق من `ready` |
| اللوحة ← المعاينة | `render` | `seq`، و`source` (`optimistic` أو `server`)، و`doc`، و`lock_version`، و`mode` (`draft` أو `live` أو `version`)، و`locale`، و`envelope` (غلاف تسليم M03)، و`shell`، و`theme`، و`pending_blocks`، و`hidden_blocks` | بعد كل تعديل (متفائل)، وبعد كل رسم من الخادم |
| اللوحة ← المعاينة | `select` | `block_id` أو null، و`item_index`، و`scroll` | تحديد في القائمة |
| اللوحة ← المعاينة | `hover` | `block_id` أو null | مرور الفأرة على صف |
| اللوحة ← المعاينة | `viewport` | `device`، و`width`، و`height`، و`safe_area`، و`text_scale` | تغيير الجهاز |
| اللوحة ← المعاينة | `locale` | `locale` (`ar` أو `en`) | يسبق `render` باللغة الجديدة |
| اللوحة ← المعاينة | `theme_mode` | `mode` (`light` أو `dark` أو `split`) | تبديل الوضع |
| اللوحة ← المعاينة | `date` | `as_of` بصيغة ISO أو null | Should، مخفي في الإصدار الأول. والرسم من الخادم يُطلب بـ `as_of` أيضًا |
| اللوحة ← المعاينة | `segment` | `segment` أو null | Could، مخفي في الإصدار الأول |
| اللوحة ← المعاينة | `navigate` | `screen`، و`params` | الشاشات الأصلية |
| اللوحة ← المعاينة | `ping` | `{}` | كل 15 ثانية |
| المعاينة ← اللوحة | `rendered` | `seq`، و`duration_ms`، و`warnings` | بعد رسم كل `render` |
| المعاينة ← اللوحة | `block_tap` | `block_id`، و`item_index` | نقر على كتلة |
| المعاينة ← اللوحة | `block_hover` | `block_id` أو null | مرور على كتلة |
| المعاينة ← اللوحة | `error` | `code`، و`message`، و`block_id`، و`seq` | أي خطأ |
| المعاينة ← اللوحة | `pong` | `{}` | رد على `ping` |

رموز `error`:
- `render_failed`: كتلة رُسم بدلها حاجز خطأ.
- `unknown_block`: نوع أو إصدار لا يعرفه البناء.
- `bad_message`: رسالة فشل التحقق منها.
- `image_failed`: صورة تعذّر تحميلها.
- `fatal`: انهار المحرك.

#### 5.3.3 مساران للتحديث: متفائل ومن الخادم

المعاينة لا ترسم إلا **غلاف التسليم** بصيغة M03 (القسم 4.1)، لأن كتل `storefront_ui` تقرأ تلك الصيغة: نصوص محلولة إلى لغة واحدة، وصور محلولة، وبيانات منتجات مهيّأة. والتحويل من صيغة التحرير يملكه خط الرسم في M11. لذلك يوجد مساران:

| المسار | متى | ماذا يحدث | الزمن المستهدف |
|---|---|---|---|
| **من الخادم** | بعد كل حفظ ناجح، وعند تغيير اللغة، وعند فتح المحرر | `POST /pages/{key}/draft/render` باللغة، ثم `render` بـ `source: "server"` | سكون 1.5 ثانية للحفظ، ثم الرسم بـ p95 أقل من 1.5 ثانية (M11) |
| **متفائل** | فور كل تعديل في المتصفح | `projectDelivery()` تطبق التعديل على آخر غلاف من الخادم، ثم `render` بـ `source: "optimistic"` | 300 ms أو أقل عند p95 (معيار SPK-15) |

**`projectDelivery(lastServer, body, assetIndex, locale)`** دالة نقية في `features/preview/project.ts`:
1. ترتيب الكتل، والإضافة، والحذف من جسم التحرير.
2. كل كتلة موجودة في آخر غلاف بالنوع والإصدار نفسيهما تُنسخ منه، ثم تُطبق عليها الخصائص المسقطة.
3. **خريطة الإسقاط** مولّدة وقت البناء من مخططي التحرير والتسليم لكل `type@v`. كل خاصية لها مقابل في التسليم بالمسار نفسه، أو بمسار تعلنه M03 في `x-ui.delivery_path` (مثل `props.slides` إلى `data.slides`)، ومعها نوع التحويل:
   - `direct`: القيمة كما هي.
   - `localized`: نص اللغة الحالية، وإلا العربية (جدول M03 القسم 4.1).
   - `asset`: `image_source` من فهرس الأصول: `tpl` والمقاسات والأبعاد وblurhash واللون.
4. ما لا مقابل له في الخريطة (مصادر المنتجات، والربط بثيم زد، وما يقيّمه الخادم) يبقى من آخر غلاف. والكتلة الجديدة المرتبطة بمصدر تُرسم بهيكل تحميل (`pending_blocks`) حتى يصل الرسم من الخادم.
5. الكتلة المخفية (`visibility.visible: false`) تُرسل في `hidden_blocks`، فتُرسم باهتة مع وسم ولا تُحذف من المعاينة.
6. **اختبار عقد**: لكل fixture في `06-api/blocks/*/fixtures/` يُقارن ناتج `projectDelivery` بناتج خط الرسم في M11 للحقول المسقطة. واختلاف واحد يُفشل CI.

وصول `render` من الخادم بـ `lock_version` يساوي آخر حفظ أو يزيد عليه يستبدل الغلاف المتفائل. والمستقبِل يتجاهل أي `render` بـ `seq` أقل من آخر ما رسمه.

#### 5.3.4 أمثلة

```json
{ "protocol": "intishar.preview", "v": 1, "id": "p_000001", "type": "ready", "sent_at": 1762766400000,
  "payload": {
    "protocols": [1],
    "build": "storefront_ui@1.4.0+preview.37",
    "flutter": "3.47.9",
    "renderer": "skwasm",
    "catalog_rev": 3,
    "supported_blocks": { "hero_slider": 1, "banner_grid": 1, "category_strip": 1, "product_carousel": 1, "product_grid": 1, "announcement_bar": 1, "countdown": 1, "trust_badges": 1, "rich_text": 1, "spacer": 1, "zid_theme_section": 1, "brand_strip": 1 },
    "supported_screens": ["home", "page", "product", "category"]
  } }
```

```json
{ "protocol": "intishar.preview", "v": 1, "id": "m_000002", "type": "hello", "sent_at": 1762766400350,
  "payload": { "protocol": 1, "session_id": "ps_4hT9", "tenant_id": "t_8f2k1q", "locale": "ar", "theme_mode": "light", "device": "iphone_6_1", "flags": { "brand_strip": false } } }
```

مثال `render` متفائل بعد تغيير الارتفاع إلى «كبير». و`theme` مختصر من مخطط الـ tokens في [M02 القسم 4.1](M02-theming-i18n.md)، والكتلة بصيغة التسليم في M03 القسم 4.1:

```json
{ "protocol": "intishar.preview", "v": 1, "id": "m_000124", "type": "render", "sent_at": 1762766410000,
  "payload": {
    "seq": 57,
    "source": "optimistic",
    "doc": "home",
    "lock_version": 18,
    "mode": "draft",
    "locale": "ar",
    "pending_blocks": [],
    "hidden_blocks": [],
    "theme": { "token_schema": 1, "appearance": { "mode": "system_derived" }, "colors": { "light": { "primary": "#5B1A32", "on_primary": "#FFFFFF" }, "dark": null }, "typography": { "font_ar": "ibm_plex_sans_arabic" }, "shape": { "radius_sm": 4, "radius_md": 8, "radius_lg": 16 } },
    "shell": { "version": 12, "tab_bar": { "style": "icon_label" } },
    "envelope": {
      "schema_version": 3,
      "tenant": "t_8f2k1q",
      "page": { "key": "home", "kind": "home", "locale": "ar" },
      "blocks": [
        { "id": "b_h7k2m9qa", "type": "hero_slider", "v": 1,
          "props": { "height": "l", "autoplay": true, "interval_s": 5, "indicator": "dots", "margin": "edge", "corner": "inherit" },
          "data": { "slides": [ { "image": { "src": "https://cdn.intishar.app/a/t_8f2k1q/ast_01JC9Y1QW8/w960.webp", "w": 2400, "h": 1350 },
                                  "title": "عروض الجمعة البيضاء", "action": { "type": "open_category", "category_id": 412823 } } ] } }
      ]
    }
  } }
```

```json
{ "protocol": "intishar.preview", "v": 1, "id": "p_000058", "type": "rendered", "sent_at": 1762766410140,
  "payload": { "seq": 57, "duration_ms": 96, "warnings": [] } }
```

```json
{ "protocol": "intishar.preview", "v": 1, "id": "p_000059", "type": "block_tap", "sent_at": 1762766415200,
  "payload": { "block_id": "b_p3n8z1rt", "item_index": 3 } }
```

```json
{ "protocol": "intishar.preview", "v": 1, "id": "p_000060", "type": "error", "sent_at": 1762766416000,
  "payload": { "code": "unknown_block", "message": "video_strip@1 not in registry", "block_id": "b_v1d3o5tr", "seq": 58 } }
```

#### 5.3.5 المصافحة والإصدار

1. المستضيف ينشئ الـ `iframe` بالمصدر `{PREVIEW_URL}/{build}/index.html?parent={origin اللوحة}`، وتبدأ الحالة `loading`.
2. المستقبِل يقرأ `parent` من الرابط، ويقبله فقط إن كان ضمن `ALLOWED_PARENT_ORIGINS` المضمّنة وقت البناء. ثم يحمّل المحرك ويرسل `ready` إلى `window.parent` بذلك الأصل تحديدًا.
3. المستضيف يتحقق من الأصل والمصدر (القسم 5.3.6)، ومن أن `protocols` تحتوي 1، ومن أن `catalog_rev` يساوي `CATALOG_REV` في اللوحة. ثم يرسل `hello`، ثم `viewport`، ثم آخر `render` من الخادم، ثم المتفائل إن وُجد.
4. المستقبِل يرد بـ `rendered`، فتصير الحالة `ready`.
5. **عدم تطابق البروتوكول أو `catalog_rev`**: الحالة `outdated`، ورسالة «المعاينة تحتاج تحديثًا» مع «أعد التحميل» برابط إصدار البناء الحالي.
6. **كتلة لا يعرفها البناء** (ليست في `supported_blocks` أو إصدارها أعلى): المستقبِل يرسم مكانها عنصرًا نائبًا ويرسل `unknown_block`، والمستضيف يضع على الكتلة شارة «لا تظهر في المعاينة الحالية». ولا يمنع ذلك التحرير ولا النشر.
7. **المهلات**: لا `ready` خلال 15 ثانية يعني حالة `error` مع «أعد المحاولة» والبديل. ولا `rendered` خلال 2 ثانية من `render` يعني وسم «المعاينة متأخرة». وغياب `pong` مرتين متتاليتين يعني `error` (انهيار المحرك).
8. **الترتيب**: المستضيف يرسل أحدث حالة فقط ويتخطى الوسيطة، بمعدل `render` واحد على الأكثر لكل إطار (16 ms).

#### 5.3.6 التحقق من الأصل

**في اللوحة (TypeScript)**:

```ts
const PREVIEW_ORIGIN = env.NEXT_PUBLIC_PREVIEW_ORIGIN; // مثل https://preview.example-preview.app

function onMessage(e: MessageEvent) {
  if (e.origin !== PREVIEW_ORIGIN) return;                       // الأصل بالضبط
  if (e.source !== iframeRef.current?.contentWindow) return;      // من إطارنا لا من غيره
  if (typeof e.data !== 'string' || e.data.length > 512_000) return;
  const parsed = PreviewInbound.safeParse(safeJsonParse(e.data)); // zod لكل نوع
  if (!parsed.success) { Sentry.addBreadcrumb({ category: 'preview', message: 'bad_message' }); return; }
  dispatch(parsed.data);
}

function send(msg: PreviewOutbound) {
  iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), PREVIEW_ORIGIN); // لا '*' أبدًا
}
```

**في المستقبِل (Dart، `package:web` 1.1.2)**، مرجعًا لتنفيذ BLK-13:

```dart
const allowedParents = String.fromEnvironment('ALLOWED_PARENT_ORIGINS'); // مفصولة بفواصل

void listen() {
  web.window.onMessage.listen((web.MessageEvent e) {
    if (!allowedParents.split(',').contains(e.origin)) return;
    if (e.source != web.window.parent) return;
    final data = e.data;
    if (!data.isA<JSString>()) return;
    final msg = PreviewMessage.tryParse((data as JSString).toDart); // يتحقق من protocol وv وtype
    if (msg == null) return replyError('bad_message');
    handle(msg);
  });
}
```

- الإرسال من المستقبِل دائمًا إلى الأصل المعتمد، لا إلى `'*'` ([MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)).
- خصائص الـ `iframe`: `sandbox="allow-scripts allow-same-origin"`، و`referrerpolicy="no-referrer"`، و`allow=""`، و`title="معاينة التطبيق"`. والجمع بين `allow-scripts` و`allow-same-origin` آمن هنا لأن المعاينة **على أصل مختلف** عن اللوحة. أما على الأصل نفسه فتستطيع إزالة العزل عن نفسها ([MDN iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe)).
- CSP على أصل المعاينة: `frame-ancestors` لأصول اللوحة في كل بيئة فقط، و`img-src` لـ CDN المنصة و`media.zid.store` و`img.zid.store`، و`connect-src 'self'`.
- المستقبِل لا يحمل رموزًا ولا كوكيز ولا يطلب API. كل البيانات تأتي في الرسائل.

#### 5.3.7 الاستضافة والأصول

| البيئة | اللوحة | المعاينة |
|---|---|---|
| dev | `http://localhost:3000` | `http://localhost:5500` (`flutter run -d web-server`) |
| staging | `https://app.staging.{domain}` | `https://preview.staging.{preview-domain}` |
| prod | `https://app.{domain}` | `https://preview.{preview-domain}` |

**توصية**: نطاق مسجّل منفصل للمعاينة (`{preview-domain}`). السبب أن كوكي الجلسة مضبوطة على `.{domain}` لتعمل Sanctum، فلو كانت المعاينة نطاقًا فرعيًا من `{domain}` لأرسل المتصفح الكوكي مع كل طلب لملفاتها الثابتة إلى CDN. القرار مع D-06 (القسم 8).

وكل بناء للمعاينة في مجلد بإصداره (`/{build}/`) مع كاش طويل (`immutable`). واللوحة تثبّت الإصدار عبر `NEXT_PUBLIC_PREVIEW_BUILD`. وصفحة «الصفحات» تجلب أصول المحرك مسبقًا (`rel="prefetch"`) قبل فتح المحرر.

#### 5.3.8 البديل إن فشل SPK-15

حسب [spikes.md](../spikes.md): «معاينة على الجهاز بـ QR كمسار أساسي، ومعاينة ويب تقريبية». والتنفيذ:

1. **واجهة نقل واحدة**: `PreviewTransport` بتنفيذين، `FlutterIframeTransport` و`ApproxReactTransport`. المحرر يتعامل مع الواجهة فقط، فلا يتغير شيء فيه.
2. **المعاينة التقريبية**: مكونات React داخل `PhoneFrame` لكتل الإصدار الأول الاثنتي عشرة، تقرأ غلاف التسليم والـ tokens نفسها، وتطبق البروتوكول نفسه داخل الصفحة (التحديد، والمرور، و`rendered`). وعليها وسم دائم «معاينة تقريبية: الشكل النهائي على الجوال». ولا تشمل الشاشات الأصلية، فتلك تُعرض بقائمة الوحدات وصورة ثابتة لكل نمط.
3. **QR** (F-M08b) يصير Must، والمعاينة على الجهاز هي المرجع.
4. **مفتاح التبديل**: علم `dash.preview_flutter`، فيمكن الرجوع إلى البديل لمتجر أو للجميع دون نشر جديد.

### 5.4 عقد `x-ui` في مخططات الكتل (مع M03)

M03 يملك المخطط وكلمة `x-ui` فيه، وقد حدد منها: المجموعة (`group`: أساسي أو متقدم)، والترتيب، والتسمية بلغتين، ونوع الحقل ([M03 القسم 2.3](M03-blocks-pages.md)). وتحتاج اللوحة مفاتيح إضافية، مقترحة على M03 في الجدول (Q-12). وحسب JSON Schema، الكلمات المفتاحية غير المعروفة تُعامل تعليقات توضيحية، فلا يتأثر بها التحقق في opis ولا Ajv.

مقتطف من مخطط التحرير لـ `hero_slider` v1، والقيم من M03 القسم 5.8.1:

```json
{
  "$id": "https://schemas.intishar.app/blocks/hero_slider/v1.authoring.json",
  "type": "object",
  "x-ui": { "icon": "gallery-horizontal", "catalog_group": "promo", "label": { "ar": "سلايدر", "en": "Slider" } },
  "properties": {
    "props": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "slides": {
          "type": "array", "minItems": 1, "maxItems": 8,
          "x-ui": { "group": "basic", "order": 1, "widget": "items_repeater", "label": { "ar": "الشرائح", "en": "Slides" }, "delivery_path": "data.slides" },
          "items": {
            "type": "object",
            "properties": {
              "image": { "$ref": "../common/asset_ref.json",
                "x-ui": { "widget": "image", "label": { "ar": "الصورة", "en": "Image" }, "image": { "slot": "hero_slider" } } },
              "title": { "$ref": "../common/localized_text.json",
                "x-ui": { "widget": "localized_text", "label": { "ar": "العنوان", "en": "Title" } } },
              "action": { "$ref": "../action.schema.json",
                "x-ui": { "widget": "action_picker", "label": { "ar": "عند الضغط", "en": "On tap" }, "allowed": ["open_product", "open_category", "open_page", "open_url_inapp"] } }
            }
          }
        },
        "height": { "enum": ["s", "m", "l"], "default": "m",
          "x-ui": { "group": "basic", "order": 2, "widget": "size_toggle", "label": { "ar": "الارتفاع", "en": "Height" } } },
        "autoplay": { "type": "boolean", "default": true,
          "x-ui": { "group": "basic", "order": 3, "widget": "switch", "label": { "ar": "تشغيل تلقائي", "en": "Autoplay" } } },
        "interval_s": { "type": "integer", "minimum": 3, "maximum": 10, "default": 5,
          "x-ui": { "group": "basic", "order": 4, "widget": "slider", "label": { "ar": "المدة بين الشرائح (ثانية)", "en": "Interval (s)" }, "visible_if": { "autoplay": true } } },
        "overlay_opacity": { "type": "number", "minimum": 0, "maximum": 0.6, "default": 0.35,
          "x-ui": { "group": "advanced", "order": 2, "widget": "slider", "label": { "ar": "تعتيم الصورة تحت النص", "en": "Overlay" } } }
      }
    }
  }
}
```

| المفتاح | القيم | المعنى | المالك |
|---|---|---|---|
| `group` | `basic` أو `advanced` أو `hidden` | مكان الحقل. والمخفي لا يظهر أبدًا، مثل `id` و`v` | M03 |
| `order` | عدد صحيح | الترتيب داخل المجموعة | M03 |
| `label` | `ar` و`en` | التسمية في النموذج وفي الفرق | M03 |
| `widget` | `text`، `localized_text`، `select`، `size_toggle`، `switch`، `slider`، `number`، `color_ref`، `image`، `action_picker`، `source_picker`، `datetime`، `items_repeater`، `icon_select`، `module_list` | اسم الـ widget في سجل اللوحة (هو «نوع الحقل» في M03) | M15 تقترح القائمة |
| `visible_if` | كائن شروط مساواة بسيطة | إظهار مشروط | مقترح على M03 |
| `delivery_path` | مسار نقطي | مقابل الخاصية في صيغة التسليم إن اختلف مسارها، لخريطة الإسقاط | مقترح على M03 |
| `image.slot` | اسم الخانة | يُرسل `intended_slot` عند الرفع (M11) | مقترح على M03 |
| `allowed` | أفعال من ADR-0004 | تقييد `action_picker` | مقترح على M03 |
| `locked` | منطقي | وحدة في `app-shell` لا تُخفى | مقترح على M03 |
| `catalog_group` و`icon` | على مستوى الكتلة | مجموعة الكتلة وأيقونتها في الكتالوج | مقترح على M03 |

### 5.5 الإبطال بعد التغيير

| التغيير | ما يُحدَّث أو يُبطَل |
|---|---|
| حفظ المسودة | `setQueryData(qk.draft)` دون إعادة جلب، ثم طلب `qk.render` بالـ `lock_version` الجديد |
| النشر | `qk.pages`، و`qk.versions` و`qk.diff` لكل مستند منشور، و`qk.draft` (لتحديث النسخة الحية)، وملخص نظرة عامة |
| الرجوع | `qk.versions`، و`qk.pages`، و`qk.diff` |
| النسخ إلى المسودة | `qk.draft`، ثم إعادة تعبئة المخزن |
| إنشاء صفحة أو أرشفتها | `qk.pages` |
| اكتمال رفع أو قص | `qk.asset` للأصل الجديد، و`qk.assets` |
| تطبيق الاستيراد أو تعديل ربط | `qk.draft` للرئيسية، و`qk.pages` |
| إنشاء حملة أو إرسالها | `qk.campaigns`، والحملة نفسها، وملخص نظرة عامة |
| تعديل آلية | `automations` |
| طلب بناء أو موافقة | `qk.builds`، وملخص نظرة عامة |
| إعادة التفويض أو الاستيراد | `qk.me`، و`connection`، و`qk.draft` للهوية |
| تعديل علم أو إعادة محاولة (إدارة) | الجدول المعني، وتفاصيل المتجر، وسجل التدقيق |

### 5.6 أحداث استخدام اللوحة (إلى M08)

تقيس مؤشر PRD «نسبة التجار الذين يعدّلون الرئيسية خلال 30 يومًا»، وجودة المعاينة. وتحمل `tenant_id` و`user_role` و`route` فقط، **بلا محتوى ولا قيم حقول**. والتسمية النهائية في تصنيف M08.

| الحدث | الخصائص |
|---|---|
| `dash_editor_opened` | `doc_kind` |
| `dash_block_added` | `block_type`، و`source` (`catalog` أو `insert_slot`) |
| `dash_block_reordered` | `method` (`drag` أو `keyboard` أو `menu`) |
| `dash_image_uploaded` | `auto_ratio` (منطقي)، و`cropped` (منطقي) |
| `dash_contrast_fixed` | `pair` |
| `dash_publish_completed` | `docs_count`، و`changes_count` |
| `dash_rollback_completed` | `doc_kind` |
| `dash_preview_loaded` | `ms`، و`renderer`، و`cold` |
| `dash_preview_error` | `code` |
| `dash_draft_conflict` | — |

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| تبويبان يحرران الصفحة نفسها | الحفظ الثاني يعود بـ 409، فيظهر حوار التعارض (القسم 3.3.7). ولا يضيع شيء لأن النسخة الاحتياطية محلية |
| تبويبان لمتجرين مختلفين | لا تعارض، لأن المتجر في مسار اللوحة، وفي كل مفتاح استعلام، وفي مسار كل طلب API |
| انتهاء الجلسة أثناء التحرير | النسخة الاحتياطية محفوظة، ثم توجيه إلى الدخول مع `next`، ثم عرض الاستعادة |
| انقطاع الشبكة | شريط «لا اتصال»، والحفظ في طابور، والنشر وإرسال الحملات والبناء معطلة |
| المعاينة لم تُحمَّل خلال 15 ثانية | `ErrorState` في إطار الهاتف مع «أعد المحاولة» و«استخدم المعاينة التقريبية». والتحرير يستمر |
| انهيار محرك المعاينة | فشل `ping` مرتين، ثم إعادة إنشاء الـ iframe مرة واحدة آليًا، ثم حالة الخطأ |
| رسالة من أصل غير معتمد أو مصدر آخر | تُهمل، مع breadcrumb في Sentry. ولا يُرد عليها |
| بروتوكول المعاينة أو `catalog_rev` مختلف | حالة `outdated` مع «أعد التحميل» |
| كتلة في المسودة لا يعرفها بناء المعاينة | عنصر نائب في المعاينة وشارة على الكتلة. والتحرير والنشر مسموحان، وM11 تُسقطها للتطبيقات القديمة |
| غلاف أكبر من 512 KB | لا يُتوقع: 40 كتلة على الأكثر، وبيانات المنتج نحو 600 بايت (M03). وإن حدث تُرسل الرسالة كما هي ويُسجَّل تحذير في Sentry، ثم يُراجع الحد بعد القياس |
| كتلة جديدة لم تكتمل حقولها الإلزامية | تبقى محلية ولا تُرسل، ويستمر حفظ الباقي (القسم 3.3.7). وأخطاء `lint` بمستوى error تمنع النشر فقط |
| نشر والحفظ معلّق | `flush` أولًا. فإن فشل يتوقف النشر برسالة |
| تغيرت المسودة بعد فتح المراجعة | النشر يعيد 409، ثم «تغيّرت المسودة أثناء المراجعة» وإعادة جلب الفرق |
| نشر جزئي (نجح مستند وفشل آخر) | رسالة بما نُشر وما لم يُنشر، و«أعد المحاولة» للباقي فقط |
| نشر متزامن من جلستين | M11 يعيد 409 `publish_in_progress`، فتظهر «نشر آخر جارٍ» مع إعادة المحاولة |
| الرجوع إلى نسخة فيها كتل لم تعد مدعومة | الرجوع لا يُرفض، والاستجابة تحمل عدد الكتل التي ستُسقط، فيظهر تنبيه بها (M11) |
| لا نسخة منشورة بعد | الفرق كله إضافات بعنوان «النشر الأول» |
| صورة أصغر من 1080px | تحذير. وأقل من 600px خطأ يمنع النشر (G-04) |
| صورة أكبر من 10 MB أو نوع غير مدعوم | رفض في المتصفح برسالة واضحة قبل أي رفع |
| PNG شفاف بمحتوى داكن | تحذير الوضع الداكن، و«اعرض في الوضع الداكن» |
| انقطاع الرفع | «أعد المحاولة» مع الاحتفاظ بالملف. والوسائط اليتيمة ينظفها M11 |
| حذف كتلة بالخطأ | تنبيه «تراجع» لمدة 8 ثوانٍ، وتبقى في تاريخ التراجع |
| بلوغ حد الكتل في الصفحة أو حد كتلة معينة | البطاقة معطلة في الكتالوج والسبب ظاهر |
| تاريخ التراجع بلغ 100 | يُحذف الأقدم بصمت |
| شاشة أضيق من 1024px في المحرر | رسالة «المحرر يحتاج شاشة أوسع» ومعاينة للقراءة فقط |
| تباين ناقص لم يُصلح | تحذير في المراجعة، والنشر مسموح. وألوان `on_*` محسوبة آليًا فلا تقع تحت الحد |
| نص إنجليزي ناقص والإنجليزية مفعّلة للمتجر | تحذير، والتطبيق يعرض العربية بديلًا (M02) |
| كتلة مرتبطة بقسم ويب (`zid_theme_section`) تعذّر عرضها | شارة «مربوطة بمتجرك»، والمعاينة تعرض ما اختاره التاجر (إخفاء أو WebView) نائبًا |
| اقتراح استيراد بثقة منخفضة (SPK-09) | شارة «للتأكيد» مع «تأكيد النوع» أو «اختر نوعًا آخر» أو «احذف» |
| المتجر مفصول (أزيل التطبيق، أو أُلغيت الرموز) | كل طلب يعيد `tenant_disconnected`، فتظهر `DisconnectedState` بملء المحتوى |
| صلاحيات زد معلّقة بعد إضافة scope | شريط في كل الصفحات مع خطوات التعطيل وإعادة التفعيل |
| الميزة غير مفعّلة في الباقة | `LockedState` بدل الشاشة، والعنصر يبقى ظاهرًا في القائمة بقفل |
| المستخدم ليس عضوًا في `{tenant}` | 403 مع «اختر متجرًا» |
| جمهور الحملة صفر | زر الإرسال معطل مع السبب |
| إرسال حملة في وقت متأخر ليلًا | تحذير لا يمنع |
| طلب بناء والبناء جارٍ | الزر معطل مع «بناء جارٍ منذ 6 دقائق» |
| مفتاح إيقاف بلا سبب | زر التأكيد معطل حتى يُكتب السبب (10 أحرف على الأقل) |
| ساعة الجهاز غير مضبوطة | كل وقت يُعرض ويُحسب من وقت الخادم (`Date` في الاستجابات)، وبتوقيت الرياض |
| 429 من الـ API | تنبيه بمدة الانتظار من `Retry-After`، ولا إعادة آلية للأفعال |
| `request_id` في كل خطأ | يظهر في رسالة الخطأ مع «انسخ للدعم» |

## 7. المتطلبات غير الوظيفية

| المجال | المتطلب | القياس |
|---|---|---|
| الأداء: صفحات اللوحة | LCP 2.5 ثانية أو أقل، وINP 200 ms أو أقل، وCLS 0.1 أو أقل عند p75 | Lighthouse CI بإعداد desktop، وweb-vitals إلى Sentry |
| الأداء: حجم JavaScript | 180 KB مضغوطة أو أقل لأول تحميل في الصفحات العادية، و350 KB للمحرر دون المعاينة | Turbopack Bundle Analyzer في CI، ويفشل عند التجاوز |
| المعاينة: أول تحميل | 4 ثوانٍ أو أقل باردًا من CDN (معيار SPK-15)، و1.5 ثانية أو أقل دافئًا | `dash_preview_loaded` عند p75 |
| المعاينة: التحديث | المسار المتفائل 300 ms أو أقل من التعديل إلى `rendered` عند p95 (معيار SPK-15). ومسار الخادم 3.5 ثانية أو أقل من آخر تعديل عند p95 | `sent_at` مقابل `rendered` |
| السحب | لا تسقط إطارات ملحوظة (50 fps أو أكثر) في صفحة من 40 كتلة | Performance panel، اختبار يدوي موثق |
| الحفظ التلقائي | «حُفظت المسودة» خلال 3 ثوانٍ من آخر تعديل عند p95 | قياس في E2E |
| مراجعة الفرق | تظهر خلال ثانية من الضغط لصفحة من 40 كتلة، شاملة طلب M11 | E2E على staging |
| الجداول | ترقيم من الخادم بـ 25 أو 50 صفًا، ولا يُحمَّل أكثر من 200 صف في الذاكرة | مراجعة الكود |
| عدم فقد البيانات | لا تغيير يضيع عند انقطاع الشبكة أو انتهاء الجلسة أو إغلاق التبويب، وهو محفوظ محليًا خلال ثانية | E2E: قطع الشبكة ثم إعادة التحميل |
| الأمان: الجلسة | لا رمز ولا سر في `localStorage` أو في الرابط. والكوكيز `httpOnly` و`Secure` و`SameSite=Lax` | مراجعة، وفحص E2E لـ `localStorage` |
| الأمان: الرؤوس | CSP صارمة، و`frame-ancestors 'none'` للوحة، و`Referrer-Policy: strict-origin-when-cross-origin`، و`X-Content-Type-Options: nosniff` | فحص الرؤوس في E2E |
| الأمان: المعاينة | تحقق الأصل والمصدر والمخطط في الجهتين، و`postMessage` بأصل محدد دائمًا | اختبار وحدة ورسائل مزيفة من أصل آخر في E2E |
| الأمان: الإدارة | تحقق ثنائي إلزامي، وسبب لكل فعل حرج، وكل فعل في سجل التدقيق | E2E |
| الخصوصية | لا بيانات شخصية لعملاء التاجر في اللوحة إلا الأعداد المجمعة. وأحداث الاستخدام بلا محتوى | مراجعة العقد |
| العربية وRTL | 100% من الشاشات RTL، و0 أصناف اتجاه فيزيائية في الكود | قاعدة lint، ولقطات Playwright بصرية لكل شاشة رئيسية |
| إمكانية الوصول | WCAG 2.2 AA، و0 مخالفات `critical` أو `serious` في axe، وكل رحلة أساسية تُنجز بلوحة المفاتيح | `@axe-core/playwright` في كل اختبار E2E، واختبار رحلة بلوحة المفاتيح |
| المراقبة | `@sentry/nextjs` للأخطاء بوسوم `tenant_id` و`route` و`release`، ونسبة جلسات خالية من الأخطاء 99.5% أو أكثر | Sentry |
| التوافق | آخر إصدارين من Chrome وEdge وSafari وFirefox على سطح المكتب. والحد الأدنى من Next.js 16 هو Chrome 111 وSafari 16.4 | مصفوفة Playwright: chromium وwebkit وfirefox |

**اختبارات Playwright الأساسية** (تشغيل على كل PR ضد MSW، وليلًا ضد staging):

| الرحلة | التحقق |
|---|---|
| الدخول وانتهاء الجلسة | التوجيه، و`next`، ورسالة 419 |
| إضافة كتلة وترتيبها بالفأرة وبلوحة المفاتيح | الترتيب في القائمة، والإعلانات، و`render` في المعاينة عبر `frameLocator` |
| رفع صورة بنسبة مخالفة | فتح القص على اقتراح M11، وطلب `crops`، وقيمة الحقل |
| الحفظ التلقائي والتعارض | 409 من MSW، ثم الحوار والخياران |
| المراجعة والنشر | بطاقات الفرق، والتأكيد، والطلب بـ `expected_lock_version` الصحيح، والفشل الجزئي |
| الرجوع | التأكيد، ثم نقل النسخة الحية، والتنبيه بالكتل المسقطة |
| الهوية | تطبيق هوية جاهزة، وإصلاح تباين، والوضع جنبًا إلى جنب |
| حملة | التقدير، والتأكيد، والحالة |
| الإدارة | مفتاح إيقاف بسبب، وظهوره في التدقيق |

الإعداد: `locale: 'ar-SA'`، و`timezoneId: 'Asia/Riyadh'`، ولقطات بصرية بـ `toHaveScreenshot` على عرضي 1440 و1280.

**البيئات ومتغيراتها** (يُتحقق منها بـ zod في `env.ts`، ويفشل الإقلاع إن نقص متغير):

| المتغير | مثال | ملاحظة |
|---|---|---|
| `NEXT_PUBLIC_ENV` | `development` أو `staging` أو `production` | — |
| `NEXT_PUBLIC_APP_URL` | `https://app.example` | — |
| `NEXT_PUBLIC_API_URL` | `https://api.example` | — |
| `NEXT_PUBLIC_PREVIEW_ORIGIN` | `https://preview.example-preview.app` | للتحقق من الأصل |
| `NEXT_PUBLIC_PREVIEW_BUILD` | `1.4.0-preview.37` | يثبّت إصدار المعاينة |
| `NEXT_PUBLIC_MEDIA_HOSTS` | `cdn.example,media.zid.store,img.zid.store` | لـ `images.remotePatterns` وCSP |
| `NEXT_PUBLIC_SENTRY_DSN` | — | — |
| `SENTRY_AUTH_TOKEN` | — | وقت البناء فقط، لرفع source maps |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ar` | — |

**النشر**: `output: 'standalone'` في صورة Docker على Node.js 24 LTS، خلف CDN، في منطقة D-06. وبيئتا staging وprod، ونشر staging آلي من الفرع الرئيسي، والإنتاج بوسم. وأصول المعاينة تُنشر من خط Flutter (M13 أو CI المعاينة) إلى CDN المعاينة، بمجلد لكل إصدار.

## 8. الاعتماديات والمجهول

### 8.1 التجارب المرتبطة

| SPK | الأثر على M15 | ما يُبنى قبل نتيجتها |
|---|---|---|
| **SPK-15** (مهمة) | يحدد هل المعاينة Flutter Web أم البديل التقريبي مع QR. ويقيس أول تحميل (4 ثوانٍ أو أقل) والتحديث (300 ms أو أقل) | كل المحرر خلف `PreviewTransport`. وعند البدء تُستخدم معاينة وهمية تعرض JSON المسودة بشكل مرتب، لاختبار البروتوكول دون Flutter |
| **SPK-15: أسئلة إضافية مقترحة** | (1) هل يعمل Skwasm بخيط واحد داخل iframe بلا COOP وCOEP، وبأي أداء مقارنة بـ CanvasKit؟ فتعدد الخيوط يحتاج الرأسين ([Flutter Wasm](https://docs.flutter.dev/platform-integration/web/wasm))، وفرضهما على اللوحة قد يكسر صورًا من نطاقات أخرى. (2) حجم التحميل الأول. (3) فروق الخط العربي عن الجهاز | — |
| SPK-09 | دقة الاستيراد تحدد كثرة شارات «للتأكيد» في قائمة الصفحات والمحرر | واجهة الشارات والتأكيد بمحاكاة |
| SPK-03 | دقة نسبة الطلبات إلى التطبيق في التحليلات | الشاشة بشريط تنبيه شرطي |
| SPK-13 وSPK-14 | خطوات البناء والتقديم وحالاتها | الشاشات بحالات وهمية من MSW |

### 8.2 تعارضات وملاحظات على الـ ADRs وPRD والوحدات الأخرى

1. **ADR-0010 وdnd-kit**: للمكتبة الآن خطان. الأول `@dnd-kit/core` 6.3.1، آخر إصدار له في ديسمبر 2024، ويسميه التوثيق «Legacy». والثاني `@dnd-kit/react` 0.5.3 قبل 1.0، وهو «Latest» ([dndkit.com](https://dndkit.com/)). **قراري**: الخط الجديد مثبّتًا بدقة وملفوفًا في مكوّن `SortableList` واحد حتى يكون الاستبدال محليًا، مع مسار ترتيب بالأزرار والاختصارات لا يعتمد على المكتبة. هذا لا يخالف ADR-0010، لكنه يحتاج تأكيد المشرف (Q-7).
2. **ADR-0010 البند 3 («react-hook-form مع zod»)**: نماذج الكتل تُتحقق بـ Ajv لا بـ zod، تبعًا لقرار M03 (القسم 2.3). السبب أنه لا أداة مستقرة تحوّل JSON Schema إلى zod: `json-schema-to-zod` متوقف منذ مارس 2026، و`z.fromJSONSchema` تجريبي. والتحقق بـ Ajv من المخطط نفسه يطابق تحقق الخادم. ويبقى zod لبقية النماذج. هذا تضييق لنص ADR-0010 يحتاج ملاحظة فيه أو ADR مستبدِلًا.
3. **ADR-0010 البند 2 (`DirectionProvider`)**: shadcn يوفر الآن مكوّن `direction` وخيار `rtl: true`، والترحيل الآلي للأنماط الجديدة فقط (`radix-nova` و`base-nova`) ([shadcn RTL](https://ui.shadcn.com/docs/rtl)). لذلك يُنشأ المشروع بنمط جديد من البداية. وهذا متوافق مع ADR-0010.
4. **ADR-0010 البند 5 (Sanctum على نطاق أب مشترك)**: صحيح ومطابق للتوثيق. لكن له أثر جانبي على المعاينة، فكوكي الجلسة على `.{domain}` تُرسل إلى كل نطاق فرعي. **التوصية**: نطاق مسجّل منفصل للمعاينة (Q-4).
5. **ADR-0006 والنشر الموحد**: M11 يعرّف النشر لكل مستند (`/pages/{key}/publish`)، والتاجر يتوقع زرًا واحدًا لكل تغييراته. المحرر يوحّد المراجعة وينشر بالتتابع مع معالجة الفشل الجزئي. و**أقترح** على M11 `POST /releases` ذريًا (Q-2).
6. **M03 القسم 3.6 ومعيار SPK-15**: المعاينة ترسم صيغة التسليم وحدها، والرسم في الخادم يمر بالحفظ (سكون 1.5 ثانية) ثم الرسم (حتى 1.5 ثانية). وهذا لا يحقق وحده معيار SPK-15 (300 ms بعد كل تعديل). لذلك أضفت المسار المتفائل (القسم 5.3.3)، وهو يحتاج من M03 خاصية `x-ui.delivery_path` حيث يختلف المسار بين الصيغتين (Q-12).
7. **الرجوع في M11 ينقل المؤشر ولا ينشئ نسخة**: متوافق مع ADR-0006 («الرجوع إلى نسخة سابقة بنقرة»)، وصممت السجل عليه.
8. **تعارض بين M11 وM12 في المسارات والأخطاء**: M11 يقترح `/api/dashboard/v1/pages/...` بلا متجر وحقل الخطأ `error`، وM12 (مالك الاصطلاحات) يحدد `/api/v1/tenants/{tenant}/...` وحقل `code`. اللوحة تتبع M12، ويلزم تصحيح M11 (Q-11).
9. **PRD وF-M08**: المعاينة الحية Must وتعتمد على SPK-15، وهي «مهمة» لا «حرجة». فإن فشلت يجب نقل F-M08b (QR) من Should إلى Must بطلب تغيير، كما يذكر M11 أيضًا.
10. **PRD وجدولة النشر**: المهمة طلبت «انشر الآن أو جدول». والجدولة في PRD هي F-M06b (Should)، فوضعتها في «لاحقًا». أما جدولة **الحملات** فهي Must ضمن F-M07، وهي في المنشئ.
11. **خريطة الوحدات**: جدول الوحدات يذكر لـ M15 «F-M01 إلى F-M14، F-P01»، والمطلوب هنا واجهات F-P01 إلى F-P06. يحتاج README تحديثًا من المشرف.
12. **TypeScript**: الأحدث 7.0.2، واخترت 6.0.3 لأن أداة التوليد لا تعلن التوافق مع 7. يُعاد النظر عند دعمها.
13. **ازدواج محتمل مع M03**: M03 فيه القصة BLK-13 لمستقبِل المعاينة. لذلك لا تكرر M15 تنفيذه، وقصتها DASH-12 هي عقد الرسائل واختبارات التوافق المشتركة.
14. **دخول التاجر**: حسمه M12 برمز البريد، و«الدخول عبر زد» Should خلف علم. فصممت شاشة الدخول على ذلك، وأزلت السؤال من قراراتي المفتوحة.

### 8.3 قرارات مفتوحة للمشرف

| # | السؤال | توصيتي | يمس |
|---|---|---|---|
| Q-1 | هل يُرفع «الدخول عبر زد» (ZID-18) إلى Must؟ فالتاجر يعرف حساب زد ولا يتوقع بريدًا | نعم إن لم يكلّف أكثر من سباق، وإلا يبقى Should | M12 وM10، وDASH-04 |
| Q-2 | نشر موحد ذري لعدة مستندات (`POST /releases`) بدل النشر لكل مستند | نعم | M11، وDASH-13 |
| Q-3 | من يملك endpoint مساعد الذكاء الاصطناعي؟ | M11، لأنه يكتب على المسودات ويتحقق بالمخطط | DASH-36 |
| Q-4 | نطاق المعاينة: نطاق مسجّل منفصل أم فرعي؟ | منفصل | D-06، وDASH-11 وDASH-31 |
| Q-5 | الأرقام في اللوحة: لاتينية أم عربية مشرقية؟ | لاتينية (`nu-latn`) | DASH-01 |
| Q-6 | اللون الأساسي للمنصة في اللوحة | يختاره المشرف في DASH-02 من الكتالوج الحي | DASH-02 |
| Q-7 | تأكيد خيار dnd-kit (الخط الجديد قبل 1.0) | الخط الجديد مع الغلاف والمسار البديل | DASH-09 |
| Q-8 | مكان كود اللوحة (`apps/dashboard` في المستودع الواحد أم مستودع مستقل) | المستودع الواحد، لأن عقود `06-api` فيه | الدليل الهندسي `07` |
| Q-9 | الاستضافة: Docker مستقل أم منصة مُدارة | Docker standalone في منطقة D-06 | D-06، وDASH-31 |
| Q-10 | سجل نشر موحد `GET /publications` لصفحة سجل النشر ونظرة عامة | نعم | M11، وDASH-14 |
| Q-11 | توحيد M11 مع اصطلاح M12 (المتجر في المسار، وحقل `code`)، وإضافة صلاحية الأعلام إلى جدول أدوار المدراء في M12 | نعم | M11 وM12، وDASH-05 وDASH-28 |
| Q-12 | إضافة `widget` و`delivery_path` و`image.slot` و`visible_if` و`allowed` و`locked` و`catalog_group` إلى عقد `x-ui` | نعم | M03، وDASH-06 وDASH-11 |

### 8.4 ما يُبنى الآن خلف واجهة مؤقتة

- **MSW** لكل endpoint في القسم 5.2، بأمثلة M11 وM03 والقسم 5 حرفيًا. وتُستبدل عند جاهزية الخادم دون تغيير المكونات.
- **مخططان تجريبيان** (`hero_slider` و`product_carousel`) بعقد `x-ui`، حتى يجهز M03.
- **`MockPreviewTransport`**: يطبق البروتوكول داخل الصفحة ويعرض المسودة مرتبة، ويرد بـ `rendered` بعد 50 ms، حتى يكتمل SPK-15.
- **محتوى الهويات الجاهزة**: ثلاث هويات مؤقتة حتى يسلّم M02 القائمة.

## 9. تقسيم العمل

السباق أسبوعان لمنفذ واحد، والقصة لا تتجاوز سباقًا. والاختبارات (Vitest وPlaywright وaxe) جزء من كل قصة حسب [DoD](../process/definition-of-done.md)، لا قصة منفصلة.

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| DASH-01 | إنشاء المشروع: Next.js 16.4، وTypeScript 6، وTailwind 4، وshadcn بـ `rtl: true`، وnext-intl بالعربية، وIBM Plex Sans Arabic، وقاعدة lint للأصناف المنطقية، وCI (typecheck وlint وvitest وPlaywright smoke)، و`env.ts` | Must | نعم | — |
| DASH-02 | نظام التصميم: الـ tokens والإضافات، وترحيل Sidebar وCalendar وPagination إلى RTL، و`EmptyState` و`ErrorState` و`LockedState` و`DisconnectedState`، وأنماط Sonner و`ConfirmAction`، والكتالوج الحي | Must | نعم | DASH-01 |
| DASH-03 | الهيكل: `AppShell`، والقوائم حسب `permissions`، والمتجر في المسار، و`TenantGate`، ومبدّل المتجر، وصفحات 403 و404 والخطأ | Must | نعم (خلف MSW) | DASH-02 |
| DASH-04 | المصادقة: عميل API مع XSRF، و`proxy.ts`، ودخول التاجر برمز البريد، و`/connect/sign-in` و`/connect/confirm`، ودخول الإدارة بكلمة مرور وTOTP، والتعامل مع 401 و419 و429، والخروج | Must | نعم (خلف MSW)، والدمج ينتظر M12 | DASH-03 |
| DASH-05 | طبقة البيانات: `@hey-api/openapi-ts`، وsubmodule عقود الكتل مع `json2ts` وفحص `CATALOG_REV`، والمتجر في مسار الطلب وفك الغلاف `data`، وQueryClient، ومصنع المفاتيح، وتحويل الأخطاء، وMSW | Must | نعم | DASH-01 |
| DASH-06 | `SchemaForm` بتحقق Ajv: قراءة `x-ui`، والـ widgets الأساسية (نص ثنائي اللغة، وقائمة، والمقاسات، ومفتاح، ورقم، وشريط، ولون من الأدوار، وتاريخ)، وربط أخطاء 422 بالمؤشر، وفحص CI | Must | نعم (بمخططين تجريبيين)، والمخططات النهائية من M03 | DASH-05 |
| DASH-07 | الحقول المتقدمة: `ImageField` مع الرفع إلى M11 واكتشاف النسبة واقتراحات القص والأصل المشتق، و`ActionPicker`، و`SourcePicker`، و`ItemsRepeater` | Must | ينتظر M11 (الوسائط)، ويمكن بـ MSW | DASH-06 |
| DASH-08 | مخزن المحرر: zustand وimmer وpatches، والتراجع والإعادة مع الدمج، والتحديد، والاختصارات | Must | نعم | DASH-01 |
| DASH-09 | المحرر بثلاث لوحات: قائمة الكتل، والكتالوج، والسحب بـ dnd-kit، ولوحة المفاتيح، والإعلانات العربية، والإخفاء والتكرار والحذف مع التراجع | Must | نعم | DASH-06، DASH-08 |
| DASH-10 | الحفظ التلقائي: `If-Match` بـ `lock_version`، والكتل غير المكتملة المحلية، والنسخة الاحتياطية والاستعادة، والتعارض، و`SaveStatus`، وعدم الاتصال | Must | ينتظر M11 (عقد المسودة)، ويمكن بـ MSW | DASH-08 |
| DASH-11 | المعاينة في اللوحة: `PreviewTransport`، و`PreviewHost`، والمصافحة، والتحقق من الأصل والرسائل، والمهلات، و`PhoneFrame`، وشريط الجهاز واللغة والوضع، والرسم من الخادم، والمسار المتفائل `projectDelivery` مع اختبار العقد | Must | ينتظر SPK-15 (يبدأ بـ `MockPreviewTransport`) | DASH-09 |
| DASH-12 | عقد الرسائل المشترك: مخططات zod للرسائل، ورسائل نموذجية في `06-api/preview/` يشغّلها الطرفان في اختباراتهما، ومساعدة M03 في دمج BLK-13 | Must | ينتظر SPK-15 | DASH-11، وBLK-13 في M03 |
| DASH-13 | مراجعة الفرق والنشر الفوري: `DiffReviewDialog` من فرق M11، والبطاقات العربية، وقبل وبعد، والتنبيهات والأخطاء، والنشر بالتتابع مع الفشل الجزئي | Must | ينتظر M11 | DASH-10 |
| DASH-14 | سجل النسخ والرجوع بنقرة: `VersionHistorySheet`، ووضع القراءة، والرجوع بنقل المؤشر، والنسخ إلى المسودة، وصفحة سجل النشر | Must | ينتظر M11 | DASH-13 |
| DASH-15 | قائمة الصفحات (الرئيسية وصفحات الحملات ورؤوس التصنيفات)، ومراجعة الاستيراد بدرجات الثقة، والكتل المرتبطة | Must | ينتظر M11 وSPK-09 (لدقة الاستيراد) | DASH-09 |
| DASH-16 | محرر الهوية: الهويات الجاهزة، والأدوار اللونية بالوضعين، والتباين والإصلاح، والخطوط، والشكل، والوضع الداكن، والعرض جنبًا إلى جنب | Must | ينتظر M02 (عقد الـ tokens) | DASH-06، DASH-11 |
| DASH-17 | الشاشات الأصلية: أقسام مستند `app-shell` (صفحة المنتج، والبطاقة، والشريطان السفلي والعلوي، والشريط الإعلاني)، و`navigate` | Must | ينتظر M03 وM09 | DASH-09، DASH-11 |
| DASH-18 | نظرة عامة: قائمة الإعداد، وحالة التطبيق، والمؤشرات، وآخر نشر، والتنبيهات | Must | ينتظر M14 وM08 وM13 (يمكن بـ MSW) | DASH-03 |
| DASH-19 | الحملات: القائمة، والمنشئ، و`PushPreview`، والتقدير، والإرسال والجدولة، والتفاصيل والإحصاءات | Must | ينتظر M06 | DASH-07 |
| DASH-20 | الرسائل التلقائية: حالة الطلب والسلة المتروكة، والقوالب والمتغيرات | Must | ينتظر M06 | DASH-19 |
| DASH-21 | التحليلات: المؤشرات، والرسوم، والكتل الأكثر نقرًا، ونطاق التاريخ | Must | ينتظر M08 وSPK-03 | DASH-05 |
| DASH-22 | الأصول: الشعار والأيقونة والسبلاش ومعايناتها، والاسم، وقائمة المتجر، ووسم «يحتاج بناءً» | Must | ينتظر M13 | DASH-07 |
| DASH-23 | البناء والنشر: خط زمني لكل منصة، وطلب بناء، والموافقة على التقديم، والاستطلاع، وغلاف حسابات المطوّر | Must | ينتظر M13 وM14 (وSPK-13 وSPK-14) | DASH-22 |
| DASH-24 | الإعدادات: الربط وإعادة التفويض والاستيراد، والاشتراك والمزايا، وبطاقة الفريق | Must | ينتظر M10 وM12 | DASH-03 |
| DASH-25 | الإدارة: قائمة المتاجر وتفاصيل المتجر بتبويباته الأساسية | Must | ينتظر M12 | DASH-03 |
| DASH-26 | الإدارة: الربط والرموز، وصحة الـ webhooks، وأفعال إعادة المحاولة والمزامنة | Must | ينتظر M10 | DASH-25 |
| DASH-27 | الإدارة: البناء والأسطول | Must | ينتظر M13 | DASH-25 |
| DASH-28 | الإدارة: الأعلام ومفاتيح الإيقاف و`min_supported_app_version` بالسبب والتأكيد | Must | ينتظر M12 | DASH-25 |
| DASH-29 | الإدارة: المراقبة، والمزايا المفعّلة لكل متجر (F-P05)، وسجل التدقيق | Must | ينتظر M12 وM10 | DASH-25 |
| DASH-30 | الجودة: ميزانيات الحجم وLighthouse في CI، ولقطات RTL البصرية، ومصفوفة المتصفحات، وweb-vitals إلى Sentry | Must | نعم | DASH-01 |
| DASH-31 | النشر والبيئات: Docker standalone، ورؤوس الأمان وCSP، وSentry وsource maps، وstaging، ونشر المعاينة على CDN | Must | ينتظر D-06 | DASH-01 |
| DASH-32 | البديل إن فشل SPK-15: `ApproxReactTransport` لكتل الإصدار الأول مع الوسم، وعلم التبديل | Must عند فشل SPK-15 فقط | ينتظر SPK-15 | DASH-11 |
| DASH-33 | جدولة النشر والحزم الموسمية ومحاكاة التاريخ | Should | ينتظر M11 | DASH-13 |
| DASH-34 | المعاينة على الجهاز بـ QR | Should (Must إن فشل SPK-15) | ينتظر M11 وM07 | DASH-13 |
| DASH-35 | لقطات المتجر من المعاينة | Should | ينتظر M13 | DASH-11، DASH-22 |
| DASH-36 | مساعد الذكاء الاصطناعي: اللوحة، وبطاقة الفرق، والتطبيق والتجاهل، وكتابة نصوص الإشعارات | Should | ينتظر M11 (وQ-3) | DASH-13 |
| DASH-37 | رفع خط خاص مع تقرير التغطية | Should | ينتظر M02 | DASH-16 |
| DASH-38 | النوافذ المنبثقة وشاشات الترحيب | Should | ينتظر M09 | DASH-17 |
| DASH-39 | أدوات الدعم: الإعداد للقراءة والمعاينة في الإدارة | Should | ينتظر M12 | DASH-25، DASH-11 |
| DASH-40 | محاكاة الشريحة واستهداف الكتل | Could | ينتظر M11 | DASH-11 |
| DASH-41 | فريق التاجر وأدواره | Could | ينتظر M12 | DASH-24 |
| DASH-42 | الوضع الداكن للوحة، والواجهة بالإنجليزية | Could | نعم | DASH-02 |

**تقدير المدة للـ Must** (دون DASH-32): 31 قصة. وإن قُدّرت بنحو 0.6 سباق في المتوسط، فالمجموع نحو 19 سباقًا، أي 38 أسبوعًا من وقت منفذ واحد لو عمل على اللوحة وحدها. هذا أطول من المعلم M3 في [خارطة الطريق](../roadmap.md). على المشرف أن يأخذه في الحساب في CP-6، فقد يقلّص نطاق الإدارة في الإصدار الأول (مثلًا: المراقبة روابط فقط).

### معايير القبول لأهم القصص

**DASH-01: الأساس العربي**
1. **بافتراض** مشروعًا جديدًا، **عندما** أفتح أي صفحة، **إذن** يكون `html` بـ `lang="ar"` و`dir="rtl"`، والخط IBM Plex Sans Arabic، والشريط الجانبي على اليمين.
2. **بافتراض** مكوّنًا فيه `ml-4` أو `text-left`، **عندما** يعمل lint في CI، **إذن** يفشل البناء ويذكر الصنف المنطقي البديل.
3. **بافتراض** نصًا عربيًا مكتوبًا داخل مكوّن بدل `messages/ar.json`، **عندما** يعمل lint، **إذن** يفشل البناء.
4. **بافتراض** متغير بيئة إلزاميًا ناقصًا، **عندما** يبدأ التطبيق، **إذن** يتوقف برسالة تسمّي المتغير.

**DASH-04: المصادقة**
1. **بافتراض** زائرًا بلا جلسة، **عندما** يفتح `/t_8f2k1q/design/pages`، **إذن** يُوجَّه إلى `/login?next=%2Ft_8f2k1q%2Fdesign%2Fpages`، وبعد الدخول يعود إلى الصفحة نفسها.
2. **بافتراض** جلسة انتهت، **عندما** تعيد عدة طلبات 401 معًا، **إذن** يُفرَّغ الكاش ويُوجَّه المستخدم إلى الدخول مرة واحدة.
3. **بافتراض** طلبًا يعيد 419، **عندما** يعالجه العميل، **إذن** يجلب `/sanctum/csrf-cookie` ويعيد الطلب مرة واحدة. فإن عاد 419 ثانية يُوجَّه إلى الدخول.
4. **بافتراض** مستخدمًا ليس عضوًا في `t_9q4w7e2r`، **عندما** يفتح `/t_9q4w7e2r`، **إذن** تظهر 403 مع «اختر متجرًا»، ولا يُرسل أي طلب إلى مسارات ذلك المتجر.
5. **بافتراض** أي حالة، **عندما** أفحص `localStorage` و`sessionStorage`، **إذن** لا رمز ولا سر فيهما.
6. **بافتراض** بريدًا غير مسجل، **عندما** أطلب رمزًا، **إذن** تظهر الرسالة نفسها التي تظهر للبريد المسجل.
7. **بافتراض** رمزًا خاطئًا، **عندما** أرسله، **إذن** تظهر «الرمز غير صحيح أو انتهت صلاحيته». وبعد 429 يتعطل الإرسال بعدّاد تنازلي من `Retry-After`.

**DASH-06: النماذج من المخطط**
1. **بافتراض** مخطط `hero_slider` v1 بحقوله السبعة الأساسية في M03، **عندما** أحدد الكتلة، **إذن** تظهر السبعة مرتبة بـ `order`، ويكون «متقدم» مطويًا.
2. **بافتراض** مخططًا فيه 9 حقول في `advanced`، **عندما** يعمل `check-block-ui` في CI، **إذن** يفشل البناء ويذكر الكتلة والعدد.
3. **بافتراض** حقلًا ظاهرًا بلا `x-ui.label.ar`، **عندما** يعمل الفحص، **إذن** يفشل البناء.
4. **بافتراض** قيمة تخالف `maximum` في `interval_s`، **عندما** أغادر الحقل، **إذن** تظهر رسالة عربية تحته من Ajv، وتظهر شارة خطأ على الكتلة في القائمة.
5. **بافتراض** رد 422 من الخادم بمؤشر `/blocks/0/props/interval_s`، **عندما** يصل، **إذن** تظهر رسالته العربية تحت الحقل نفسه.

**DASH-07: الصورة واكتشاف النسبة**
1. **بافتراض** كتلة `hero_slider` بلا شرائح، **عندما** أرفع صورة 1920×1080 ويصير الأصل `ready`، **إذن** تُقبل دون قص، وتظهر ملاحظة «اكتشفنا نسبة 16:9».
2. **بافتراض** شريحة أولى بنسبة 16:9، **عندما** أرفع لشريحة ثانية صورة 1000×1500، **إذن** يُفتح القص على اقتراح 16:9 من `crop_suggestions`، و«اعتمد القص» يرسل `POST /assets/{id}/crops`، وتصير قيمة الحقل الأصل المشتق مع `crop`.
3. **بافتراض** صورة بعرض 800px، **عندما** تُرفع، **إذن** يظهر تحذير G-04 وتُسمح المتابعة. وبعرض 500px يظهر خطأ يمنع النشر.
4. **بافتراض** ملف HEIC أو ملفًا أكبر من حد M11، **عندما** أفلته، **إذن** يُرفض قبل أي طلب شبكة برسالة تذكر السبب.
5. **بافتراض** انقطاع الشبكة أثناء `PUT`، **عندما** يفشل الرفع، **إذن** يظهر «أعد المحاولة» ويبقى الملف محفوظًا في الحقل.

**DASH-09: الترتيب بالسحب وبلوحة المفاتيح**
1. **بافتراض** صفحة من 8 كتل، **عندما** أسحب الكتلة 1 من مقبضها إلى الموضع 3، **إذن** يصير ترتيب القائمة والمسودة كذلك، ويُسجَّل «نقل … من 1 إلى 3»، وتُرسل `render` متفائلة.
2. **بافتراض** التركيز على مقبض الكتلة 1، **عندما** أضغط Space ثم السهم للأسفل مرتين ثم Space، **إذن** تنتقل إلى الموضع 3، ويعلن قارئ الشاشة بالعربية الالتقاط والموضع والإفلات.
3. **بافتراض** سحبًا جاريًا، **عندما** أضغط Escape، **إذن** يعود الترتيب كما كان ولا يُسجَّل تاريخ.
4. **بافتراض** كتلة محددة، **عندما** أضغط `Alt+↑`، **إذن** تتحرك موضعًا لأعلى، وهذا يعمل حتى لو عُطّل مستشعر لوحة المفاتيح في dnd-kit.
5. **بافتراض** أني حذفت كتلة، **عندما** أضغط «تراجع» في التنبيه خلال 8 ثوانٍ، **إذن** تعود في موضعها نفسه بإعداداتها.

**DASH-10: الحفظ التلقائي والتعارض**
1. **بافتراض** مسودة بـ `lock_version = 17`، **عندما** أعدّل حقلًا وأتوقف، **إذن** يُرسل `PUT` واحد بـ `If-Match: "17"` بعد 1.5 ثانية تقريبًا، وتظهر «حُفظت المسودة».
2. **بافتراض** أن الخادم يعيد 409، **عندما** يصل الرد، **إذن** يظهر حوار التعارض باسم من عدّل ووقته وبالخيارين، ولا يُفقد تعديلي.
3. **بافتراض** أني أضفت سلايدر بلا شريحة ثم غيّرت عنوان كتلة أخرى، **عندما** يحين الحفظ، **إذن** يُحفظ تغيير العنوان، ويبقى السلايدر محليًا بشارة «أكمل الحقول المطلوبة لحفظها».
4. **بافتراض** انقطاع الشبكة، **عندما** أعدّل ثم أعيد تحميل الصفحة بعد عودة الاتصال، **إذن** يُعرض عليّ استعادة التعديلات من النسخة الاحتياطية.
5. **بافتراض** تغييرات لم تصل الخادم، **عندما** أحاول إغلاق التبويب، **إذن** يحذّر المتصفح. وإن لم توجد تغييرات معلّقة لا يحذّر.

**DASH-11: المعاينة**
1. **بافتراض** معاينة جاهزة، **عندما** أغيّر الارتفاع من «متوسط» إلى «كبير»، **إذن** تُرسل `render` بـ `source: "optimistic"` ويعود `rendered` خلال 300 ms، ثم تصل `render` بـ `source: "server"` بعد الحفظ والرسم دون وميض.
2. **بافتراض** رسالة صحيحة الشكل من أصل غير `NEXT_PUBLIC_PREVIEW_ORIGIN`، أو من نافذة غير الـ iframe، **عندما** تصل، **إذن** تُهمل ولا يتغير التحديد.
3. **بافتراض** `ready` بـ `protocols: [2]` أو بـ `catalog_rev` مختلف، **عندما** يتحقق المستضيف، **إذن** تظهر «المعاينة تحتاج تحديثًا» ولا تُرسل `hello`.
4. **بافتراض** معاينة لم ترسل `ready` خلال 15 ثانية، **عندما** تنتهي المهلة، **إذن** يظهر الخطأ مع «أعد المحاولة» و«المعاينة التقريبية»، ويبقى التحرير ممكنًا.
5. **بافتراض** نقرة في المعاينة على الكتلة `b_p3n8z1rt`، **عندما** تصل `block_tap`، **إذن** تُحدَّد في القائمة وتُفتح إعداداتها.
6. **بافتراض** أي رسالة صادرة من اللوحة، **عندما** أفحص استدعاء `postMessage`، **إذن** يكون الأصل الهدف `NEXT_PUBLIC_PREVIEW_ORIGIN` لا `'*'`.
7. **بافتراض** fixtures الكتل في `06-api/blocks/`، **عندما** يعمل اختبار العقد، **إذن** يطابق ناتج `projectDelivery` ناتج M11 في كل الحقول المسقطة.

**DASH-13: مراجعة الفرق والنشر**
1. **بافتراض** مسودة أضفت فيها كتلة ونقلت أخرى وغيّرت اللون الأساسي، **عندما** أفتح «مراجعة ونشر»، **إذن** أرى بطاقات عربية للتغييرات الثلاثة، والتغيير اللوني بعيّنتين قبل وبعد.
2. **بافتراض** خطأ `lint` بمستوى error (مثل G-14)، **عندما** أفتح المراجعة، **إذن** يتعطل «انشر الآن»، وينقلني الخطأ إلى الكتلة والحقل.
3. **بافتراض** حفظًا معلّقًا، **عندما** أضغط «مراجعة ونشر»، **إذن** يُفرَّغ الحفظ أولًا، ثم يُطلب الفرق بعد آخر `lock_version` محفوظ.
4. **بافتراض** أن المسودة تغيرت من جلسة أخرى بعد فتح المراجعة، **عندما** أنشر، **إذن** يعيد الخادم 409، وتظهر «تغيّرت المسودة أثناء المراجعة»، ويُعاد جلب الفرق.
5. **بافتراض** تغييرات في `theme` و`home`، **عندما** ينجح نشر `theme` ويفشل `home`، **إذن** تظهر رسالة بما نُشر وما لم يُنشر، و«أعد المحاولة» ترسل `home` وحده.
6. **بافتراض** نشرًا ناجحًا، **عندما** يعود 200، **إذن** تظهر أرقام النسخ الجديدة، ويختفي عدّاد التغييرات، وتظهر النسخ في السجل.

**DASH-14: الرجوع بنقرة**
1. **بافتراض** النسخ 1840 و1841 و1842 والحية 1842، **عندما** أختار 1840 وأضغط «اجعلها الحية» وأؤكد، **إذن** يُرسل `POST .../versions/1840/rollback`، وتصير 1840 هي الحية دون نسخة جديدة، وتبقى مسودتي كما هي.
2. **بافتراض** أن الاستجابة تحمل تحذيرًا بكتلتين ستُسقطان، **عندما** تكتمل، **إذن** يظهر تنبيه بالعدد ورابط إليهما.
3. **بافتراض** نسخة قديمة، **عندما** أضغط «انسخ إلى المسودة» وأؤكد، **إذن** تُستبدل المسودة بجسمها، وأستطيع التراجع داخل الجلسة.

**DASH-16: الهوية والتباين**
1. **بافتراض** هوية جاهزة مطبقة، **عندما** أغيّر `sale` إلى لون تباينه مع `surface` يساوي 2.8:1، **إذن** تظهر شارة حمراء بالنسبة 2.8:1، ويرفعها «أصلحه» إلى 4.5:1 على الأقل دون تغيير الصبغة.
2. **بافتراض** الوضع «جنبًا إلى جنب»، **عندما** أغيّر لونًا، **إذن** يتحدث الهاتفان الفاتح والداكن معًا في `render` واحدة.
3. **بافتراض** أني طبّقت هوية جاهزة، **عندما** أضغط تراجع مرة واحدة، **إذن** تعود الهوية السابقة كاملة.

**DASH-28: مفتاح الإيقاف**
1. **بافتراض** مديرًا بدور `super_admin`، **عندما** يطفئ علمًا عامًا، **إذن** يُطلب السبب (10 أحرف على الأقل) وكتابة اسم العلم، ثم يظهر الفعل في سجل التدقيق بالسبب والقيمتين.
2. **بافتراض** مديرًا بدور `support`، **عندما** يفتح `/admin/flags`، **إذن** يرى الجدول للقراءة بلا مفاتيح تبديل، والخادم يرفض أي `PUT` منه.

## 10. المصادر

**داخلية**
- [خريطة الوحدات](README.md)، و[قالب المواصفة](../process/module-spec-template.md)، و[PRD](../01-prd.md)، و[spikes.md](../spikes.md)، و[قرارات المنتج](../open-decisions.md)، و[خارطة الطريق](../roadmap.md).
- [ADR-0004](../adr/0004-hybrid-sdui-typed-blocks.md)، و[ADR-0006](../adr/0006-layouts-in-platform-api.md)، و[ADR-0009](../adr/0009-import-then-own-home.md)، و[ADR-0010](../adr/0010-nextjs-web-frontends.md).
- [M03: الكتل والصفحات](M03-blocks-pages.md) (عقود الكتل، و`x-ui`، وقواعد الحماية، وغلاف التسليم، ومستقبِل المعاينة)، و[M11: خدمة إعداد التطبيق](M11-app-config-service.md) (المسودة، والفرق، والنشر، والرجوع، والوسائط، والرسم للمعاينة)، و[M12: نواة المنصة](M12-platform-core.md) (الدخول، والأدوار، والبادئات، و`me`، والأخطاء).
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/local_builders_teardown.md`: محرر عناقيد، و146 إلى 214 زرًا للقسم، والوضع الأساسي، ومراجعة الفرق، ولوحة المساعد في staging.
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/global_builders_features.md`: مسودة ونشر ونسخ Tapcart، ومعاينة Shopney وSuperfans على الجهاز.
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/flutter_configurable_architecture.md`: تضمين Flutter Web والمعاينة بـ postMessage.
- `reports/مزايا وتخصيص تطبيقات متاجر زد.md`: أقسام «القوالب قبل الأزرار»، و«المسودة والجدولة والاستهداف والمعاينة»، و«الذكاء الاصطناعي».
- `research_notes/جدوى منصة تطبيقات متاجر زد/zid_api_headless.md`: شرط بدء OAuth عند التفعيل، وصلاحيات معلّقة.

**خارجية** (اطُّلع عليها في 2026-11-10)
- [Next.js 16](https://nextjs.org/blog/next-16)، و[Next.js 16.4](https://nextjs.org/blog/next-16-4)، و[Next.js blog](https://nextjs.org/blog).
- [shadcn/ui RTL](https://ui.shadcn.com/docs/rtl)، و[shadcn/ui RTL في Next.js](https://ui.shadcn.com/docs/rtl/next)، و[shadcn/ui theming](https://ui.shadcn.com/docs/theming)، و[Radix Direction Provider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider).
- [Tailwind CSS v4.3: padding والخصائص المنطقية](https://tailwindcss.com/docs/padding).
- [dnd-kit](https://dndkit.com/)، و[dnd-kit accessibility (Legacy)](https://dndkit.com/guides/accessibility)، و[dnd-kit changelog](https://dndkit.com/changelog).
- [TanStack Query: Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).
- [Zod: JSON Schema](https://zod.dev/json-schema)، و[npm: json-schema-to-zod](https://www.npmjs.com/package/json-schema-to-zod) (إشعار التوقف في README)، و[npm: @hey-api/openapi-ts](https://www.npmjs.com/package/@hey-api/openapi-ts).
- [next-intl بلا توجيه لغوي](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing).
- [Laravel 13: Sanctum SPA authentication](https://laravel.com/docs/13.x/sanctum#spa-authentication).
- [Flutter: Embedding Flutter web](https://docs.flutter.dev/platform-integration/web/embedding-flutter-web)، و[Flutter: WebAssembly](https://docs.flutter.dev/platform-integration/web/wasm).
- [MDN: Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)، و[MDN: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe)، و[MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
- [WCAG 2.2: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)، و[WCAG 2.2: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- [Saudi riyal sign (U+20C1)](https://en.wikipedia.org/wiki/Saudi_riyal_sign) (مصدر ثانوي).
- [Playwright: Accessibility testing](https://playwright.dev/docs/accessibility-testing)، و[Playwright: Emulation](https://playwright.dev/docs/emulation).
- [Node.js releases](https://nodejs.org/en/about/previous-releases).
- إصدارات الحزم: سجل npm عبر `npm view` بتاريخ 2026-11-10، وPackagist لـ `laravel/sanctum` 4.3.3 و`laravel/framework` 13.40.0، وقناة Flutter stable (3.47.9).
