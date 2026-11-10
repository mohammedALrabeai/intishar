# ADR-0010: كل واجهات الويب بـ Next.js، وLaravel يقدم API فقط، ولا Filament

- الحالة: مقبول (D-04)
- التاريخ: 2026-11-10
- مرتبط بـ: ADR-0004, ADR-0005, F-M01 إلى F-M14, F-P01 إلى F-P06

## السياق
تجربة المستخدم أولوية لدى المشرف. ولوحة التاجر ليست شاشات CRUD: فيها محرر كتل بالسحب والإفلات، ومعاينة حية في iframe تتحدث بـ `postMessage`، وهوية بألوان وخطوط، وعرض فرق قبل النشر. Filament مصمم للوحات الإدارة، وشكله وتفاعله لا يناسبان هذا المنتج، وقد رُفض صراحة.

## القرار
1. **تطبيق Next.js واحد** (App Router وTypeScript) فيه منطقتان بحسب الدور: لوحة التاجر، ولوحة إدارة المنصة.
2. **نظام الواجهة**: Tailwind CSS وshadcn/ui، المبني على Radix. واتجاه RTL بـ `dir="rtl"` و`DirectionProvider`، وأدوات Tailwind المنطقية (`ms-` و`me-` و`ps-` و`pe-`).
3. **المحرر**: `dnd-kit` للسحب والإفلات، و`react-hook-form` مع `zod` للنماذج، وTanStack Query لجلب البيانات. ومعاينة Flutter Web في iframe ([ADR-0004](0004-hybrid-sdui-typed-blocks.md)).
4. **Laravel** يقدم API فقط ([ADR-0005](0005-laravel-modular-monolith-bff.md))، بلا Blade ولا Livewire ولا Filament.
5. **المصادقة**: Laravel Sanctum بنمط SPA على نطاق أب مشترك، مثل `app.` و`api.`. والتفصيل في `04-sdd.md`.
6. **عقد مشترك**: مخططات JSON للكتل في `06-api/` هي المصدر الوحيد، وتُولَّد منها أنواع TypeScript للوحة ونماذج Dart للتطبيق.

## البدائل المرفوضة
- **Filament**: شكل لوحة إدارة، وتجربة لا تناسب محررًا مرئيًا، ورفضه المشرف.
- **Laravel مع Inertia**: كان يُبقي كل شيء في مستودع واحد، لكن Next.js يعطي نشرًا مستقلًا للواجهة ومنظومة React أوسع للمحرر، وهو اختيار المشرف.
- **خادم Node بدل Laravel**: يوحّد لغة الويب، لكن ADR-0005 قائم على خبرة الفريق في Laravel.

## العواقب
- المنفذ يعمل بثلاث تقنيات: Flutter وLaravel وNext.js. لذلك يجب أن يحدد الدليل الهندسي (`07`) القوالب والاصطلاحات في كل منها بدقة، حتى لا يجتهد.
- تصميم اللوحة يتم بتركيب مكونات shadcn/ui، وهذا يقلل الحاجة إلى مصمم (D-08).
- نشر Next.js منفصل عن Laravel، ويحتاج إعداد CORS والكوكيز بين النطاقين.

## المصادر
- [shadcn/ui](https://ui.shadcn.com/)، [Radix Direction Provider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider)
- [Laravel Sanctum: SPA authentication](https://laravel.com/docs/sanctum#spa-authentication)
- [dnd-kit](https://dndkit.com/)
