# M02: الهوية واللغة

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter (حزمة `storefront_ui` والتطبيق)، وLaravel (التحقق والتصحيح الآلي) |
| المتطلبات | F-M04, F-S01، وF-M04b (Should)، ودعم F-S03 (نمط الشريط السفلي) وF-S05 (السعر شاملًا الضريبة) |
| القرارات | ADR-0002 (خطان مضمّنان، والهوية اللونية دون بناء)، وADR-0004 (الـ tokens تضبط الشاشات الأصلية)، وADR-0006 (الـ tokens من API المنصة) |
| تعتمد على | M01 (الإقلاع والتخزين المؤقت وتسجيل الخط قبل الرسم)، وM11 (يخزّن الـ tokens وينشرها ويقدّمها)، وM15 (محرر الهوية في اللوحة)، وM14 (استيراد ألوان زد عند الإعداد) |
| بادئة القصص | THEME |

## 1. الغرض والنطاق

M02 يحدد كيف يبدو التطبيق وكيف يتكلم: مخطط tokens صغير ودلالي يعيد طلاء التطبيق كله، والهويات الجاهزة لكل قطاع، والخطوط، والوضع الداكن، وقواعد RTL، والترجمة، والأرقام، والسعر ورمز الريال، والتاريخ الهجري، وإمكانية الوصول. ويحدد كذلك ما يتحقق منه الخادم قبل أن يصل أي token إلى جهاز.

المبدأ من PRD: «القوالب قبل الأزرار». التاجر يختار هوية جاهزة ثم يعدّل لونين أو ثلاثة، ولا يرى أسماء مكونات ولا JSON. وكل ما يمكن حسابه آليًا يُحسب: ألوان النص فوق الألوان (`on_*`)، والوضع الداكن المشتق، وتصحيح التباين.

### داخل الإصدار الأول (Must)
- مخطط tokens الإصدار 1: الألوان بقيم فاتحة وداكنة، ومقياس الخط، والشكل، والكثافة، وأنماط المكونات (الزر، وبطاقة المنتج، والشريط السفلي، والشارات، والشريط العلوي، والحقول).
- التحويل إلى `ThemeData` بـ `ColorScheme.fromSeed` ونمط `DynamicSchemeVariant.fidelity` مع تجاوزات، و`ThemeExtension` باسم `BrandTheme`.
- 12 هوية جاهزة لأحد عشر قطاعًا، بصيغة JSON واحدة.
- خطان مضمّنان (IBM Plex Sans Arabic وTajawal)، وخط احتياطي صغير لرمز الريال، وقائمة منسقة من 8 عائلات تُحمَّل عند الحاجة بـ `FontLoader`.
- الوضع الداكن بثلاثة خيارات: يتبع الجهاز بألوان مشتقة، أو فاتح دائمًا، أو يتبع الجهاز بألوان داكنة يحددها التاجر.
- قواعد RTL: الودجتات الاتجاهية، والأيقونات التي تنعكس والتي لا تنعكس، وعزل الاتجاه للـ SKU والأسعار وأرقام الطلبات، و`letterSpacing: 0`، وارتفاع سطر أكبر للعربية.
- الترجمة بـ gen-l10n وملفات ARB، وصيغ الجمع العربية الست، والفصل بين نصوص الواجهة ومحتوى التاجر، وتبديل اللغة فوريًا (F-S01).
- الأرقام اللاتينية افتراضيًا، ومفتاح للتاجر يحوّلها إلى الهندية (٠١٢٣).
- تنسيق السعر ورمز الريال الجديد U+20C1 وفق قواعد ساما، بخط احتياطي مضمّن، و«ر.س» نصًا بديلًا وتسمية لقارئ الشاشة.
- إمكانية الوصول: تكبير النص حتى 200%، وتصحيح التباين آليًا إلى 4.5:1، وتسميات عربية لقارئ الشاشة.
- في الخادم: التحقق من الـ tokens بمخطط JSON، وفحص التباين وتصحيحه، والتحقق من الخطوط والأصول، وتحويل ألوان زد إلى tokens عند الإعداد.

### لاحقًا (Should/Could)
- التاريخ الهجري تسميةً ثانوية. Should، ومفصّل هنا لأنه صغير، لكنه ليس في قائمة Must في PRD.
- رفع خط خاص مع فحص تغطية العربية في الخادم (F-M04b). Should.
- حزم موسمية: طبقة tokens جزئية تُجدول فوق الهوية (F-M06b، والجدولة في M11). Should.
- وسم المقاطع الإنجليزية داخل النص العربي بلغتها لقارئ الشاشة. Should.
- اختيار المتسوق للوضع الداكن أو الفاتح من الحساب، ومزامنة اللغة مع إعداد لغة التطبيق في النظام. Could.

### ليس من مسؤولية M02
- واجهة محرر الهوية والمعاينة جنبًا إلى جنب: M15. ويعرّف M02 العقد والتحقق فقط.
- تخزين النسخ والمسودات والنشر والجدولة: M11.
- الأيقونة والسبلاش الأصلي واسم التطبيق: M13 عبر سكربت M01، لأنها تحتاج بناءً (ADR-0002).
- إعدادات كل كتلة (الحجم والمصدر): M03. والكتل تقرأ الـ tokens ولا تعرّف ألوانها.

## 2. المكونات حسب الطبقة

### 2.1 Flutter (في `packages/storefront_ui/lib/theme/` و`lib/l10n/`)

| الملف أو الصنف | المسؤولية |
|---|---|
| `BrandTokens` (freezed) | نموذج المخطط 4.1، و`fromJson` صارم يرفض القيم خارج المسموح |
| `ThemeBuilder.build(tokens, brightness, locale)` | دالة نقية تعيد `ThemeData` كاملًا. لا تقرأ `BuildContext` حتى تعمل في المعاينة والاختبارات |
| `BrandTheme extends ThemeExtension` | ما لا يملكه Material: لون التخفيض، ونمط البطاقة، وأنصاف الأقطار، ونمط الشريط السفلي، ونمط الشارات، ونسبة صورة المنتج |
| `ContrastGuard` | يحسب `on_*` الناقصة ويتحقق من أزواج التباين (4.3). دفاعي: الخادم هو المرجع |
| `TypographyBuilder` | المقياس بحسب اللغة، و`letterSpacing: 0`، وارتفاع السطر |
| `FontRegistry` | تسجيل الخطوط المحفوظة قبل `runApp`، وتنزيل خط القائمة المنسقة وتخزينه |
| `NumeralPolicy` و`AppNumberFormat` | الأرقام اللاتينية أو الهندية، وتطبيع الأرقام المدخلة |
| `PriceText` و`PriceFormatter` | السعر ورمز الريال والعزل والتسمية الصوتية |
| `Bidi` | `Bidi.ltr()` و`Bidi.auto()` لعزل المقاطع |
| `HijriLabel` | التاريخ الهجري الثانوي (Should) |
| `LocaleController` و`AppearanceController` | Notifiers للغة والوضع الداكن، وحفظهما |
| `LocalizedText.resolve(map, locale)` | اختيار نص التاجر بحسب اللغة مع البدائل |
| `l10n/app_ar.arb` و`l10n/app_en.arb` | نصوص الواجهة. القالب هو العربي |

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `material_ui` | 1.11.0 | `ThemeData` و`ColorScheme.fromSeed` و`GlobalMaterialLocalizations.delegates` ([دليل الترحيل](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)) |
| `material_color_utilities` | 0.13.1 (الإصدار الذي يحله `material_ui`) | `Hct` و`Contrast.darker` و`Contrast.lighter` لتصحيح التباين بالدرجة اللونية (tone) |
| `intl` | 0.20.3 | `NumberFormat` و`DateFormat` |
| `flutter_localizations` | من الـ SDK | يحتاجه gen-l10n |
| `hijri` | 3.0.1 | Umm al-Qura، للتسمية الهجرية (Should) |
| `flutter_svg` | 2.3.2 | الرسوم التوضيحية للحالات الفارغة فقط، لا لرمز الريال |

حزمة مرفوضة لوقت التشغيل: `google_fonts` 9.0.0. تجلب الخطوط من خوادم Google، ولا تدعم الخطوط الخاصة، وتشترط Flutter 3.47 ([pub.dev](https://pub.dev/packages/google_fonts)). المسار الواحد هو `FontLoader` من CDN المنصة للقائمة المنسقة وللخطوط المرفوعة معًا، فيبقى التحكم في التخزين والإصدارات والتوفر عندنا.

### 2.2 Laravel (داخل وحدة `AppConfig` التي يملكها M11)

| الصنف | المسؤولية |
|---|---|
| `resources/schemas/theme-tokens.v1.json` | مخطط JSON (draft 2020-12)، نسخته المرجعية في `06-api/schemas/` ومنه تُولَّد أنواع TypeScript للوحة (ADR-0010) |
| `ThemeTokensValidator` | يتحقق بـ `opis/json-schema` 2.6.1 ([Packagist](https://packagist.org/packages/opis/json-schema)) ثم بالقواعد التجارية |
| `ContrastFixer` | حساب `on_*`، وفحص الأزواج، والتصحيح بالبحث في L* من فضاء CIELAB، وتقرير التصحيحات |
| `ThemePresetSeeder` | الهويات الجاهزة من `resources/theme-presets/*.json`، تُزرع في جدول `presets` الذي يملكه M11 بنوع `theme` |
| `ZidBrandingImporter` | يحوّل ألوان زد وشعارها إلى tokens أولية (يستدعيه M14) |
| `FontCatalog` | القائمة المنسقة وملفاتها على CDN ومجاميعها (sha256) |
| `FontCoverageChecker` | (Should) فحص الخط المرفوع بـ fontTools 4.68.0 ([PyPI](https://pypi.org/project/fonttools/)) في job معزول |

### 2.3 Next.js (M15)
محرر الهوية يستهلك عقود القسم 5.2. ويعرض التحذيرات والتصحيحات التي يعيدها الخادم كما هي، ولا يحسب التباين بنفسه إلا للعرض الفوري أثناء السحب.

### 2.4 قواعد RTL

#### الودجتات الاتجاهية
- الاتجاه يأتي من `MaterialApp.locale` و`Directionality` فقط، ولا يُمرَّر `TextDirection` يدويًا إلا لحقول LTR (انظر «عزل الاتجاه»).
- في `storefront_ui` والتطبيق يُستخدم فقط: `EdgeInsetsDirectional`، و`AlignmentDirectional`، و`PositionedDirectional`، و`BorderRadiusDirectional`، و`TextAlign.start` و`TextAlign.end`.
- يمنع CI بالبحث النصي: `EdgeInsets.only(left:` و`EdgeInsets.only(right:` و`Alignment.centerLeft` و`Alignment.centerRight` و`TextAlign.left` و`TextAlign.right` و`Positioned(left:` و`Positioned(right:`. والاستثناء الوحيد في ملف `ltr_field.dart` بتعليق `// rtl-ok`.
- القوائم الأفقية و`PageView` تنعكس تلقائيًا في RTL، فيبدأ أول عنصر من اليمين. ولا يُستخدم `reverse: true` لمحاكاة الانعكاس.
- مؤشرات التقدم والمنزلقات (`LinearProgressIndicator` و`RangeSlider`) تتبع الاتجاه، وتملأ من اليمين في العربية.

#### الأيقونات

| تنعكس في RTL | لا تنعكس |
|---|---|
| الرجوع والتقدم (`arrow_back` و`arrow_forward`) | البحث (العدسة) |
| الأسهم الصغيرة (`chevron_left` و`chevron_right` و`arrow_forward_ios`) | السلة والحقيبة |
| الإرسال (`send`) | القلب (المفضلة) والنجمة الكاملة |
| نصف النجمة (`star_half`) في التقييم | التشغيل والإيقاف وشريط تقدم الفيديو |
| أيقونات القوائم والنصوص (`list` و`notes`) | الساعة والتحديث والسجل |
| خطوات الدفع وخط تتبع الطلب | علامة الصح، والشعارات، وصور المنتجات |
| الخروج (`logout`) | الأرقام داخل الأيقونات، والرسوم البيانية |

القاعدة من [Material Design: Bidirectionality](https://m1.material.io/usability/bidirectionality.html). في Flutter، أيقونات Material التي تنعكس معرّفة أصلًا بـ `matchTextDirection: true`، ومنها `arrow_back` ([API](https://api.flutter.dev/flutter/material/Icons/arrow_back-constant.html)) و`chevron_left` و`send` و`star_half`. أما `search` و`shopping_cart` فلا. والأيقونات الخاصة (SVG) تُرسم داخل `DirectionalIcon(mirror: true)` الذي يطبق `Transform.flip(flipX: isRtl)`.

أيقونات الشريط السفلي من أيقونات Material المضمّنة بالمجموعات الثلاث (`rounded` و`outlined` و`sharp`): الرئيسية `home`، والتصنيفات `grid_view`، والبحث `search`، والسلة `shopping_bag` أو `shopping_cart`، والحساب `person`. ولا ينعكس أي منها.

#### عزل الاتجاه

| المحتوى | الطريقة |
|---|---|
| السعر | `PriceText` يعزل الوحدة كاملة (الرمز والمسافة والرقم) داخل LRI…PDI، أي U+2066 ثم U+2069 |
| رقم الطلب، والـ SKU، والباركود، وكود الكوبون | `Bidi.ltr(text)`، وتبقى أرقامها لاتينية دائمًا مهما كان إعداد الأرقام |
| رقم الجوال والبريد والرابط | `Bidi.ltr(text)` في العرض، وحقل `LtrField` في الإدخال |
| اسم ماركة أو منتج إنجليزي داخل جملة عربية | `Bidi.auto(text)` بـ FSI…PDI (U+2068 ثم U+2069) |
| النسبة المئوية | عبارة كاملة من ARB: «خصم {percentText}» بدل «‎-30%» |

`Bidi` يستخدم علامات العزل (isolates) لا علامات التضمين: `BidiFormatter` في `intl` يلف النص بـ LRE/RLE وPDF (من مصدر `intl` 0.20.2)، وهي أضعف في النصوص المختلطة. و`LtrField` حقل بـ `textDirection: TextDirection.ltr`، ومحاذاة إلى بداية الحقل في الواجهة (اليمين في العربية)، ولوحة مفاتيح رقمية حيث يلزم. ولا يُستخدم `WidgetSpan` لرسم رمز الريال داخل السطر، لأن ترتيب `WidgetSpan` في النص RTL تغيّر في Flutter 3.50 ([Flutter](https://docs.flutter.dev/release/breaking-changes/widgetspan-rtl-bidi-order))، فتُراجع الـ goldens عند الترقية.

### 2.5 الأرقام
- الافتراضي لاتيني (0 إلى 9). مجموعة الأمثلة في CLDR لـ `ar_SA` تسرد الأرقام اللاتينية ([CLDR ar_SA.xml](https://github.com/unicode-org/cldr/blob/main/common/main/ar_SA.xml))، والمصادر تتعارض، فبقي خيارًا للتاجر (`research_notes/.../mobile_shopping_ux.md`، القسم 4).
- `NumberFormat` في `intl` 0.20.2 للغة `ar` يعطي أرقامًا لاتينية، و`ar_SA` يُختزل إلى `ar`، و`ar_EG` يعطي أرقامًا هندية بفاصلتي `٬` و`٫`. وكذلك `DateFormat.yMMMMd('ar')` يعطي «10 نوفمبر 2026». تحقق المنفذ من ذلك بتشغيل `intl` 0.20.2 محليًا.
- `AppNumberFormat` يُنسّق دائمًا بـ `ar` أو `en` (أرقام لاتينية)، ثم إن كان `numerals = arabic_indic` وكانت اللغة عربية: يحوّل 0 إلى 9 إلى ٠ إلى ٩، والنقطة العشرية إلى `٫`، والفاصلة إلى `٬`، و`%` إلى `٪`.
- لا يُحوَّل: محتوى التاجر الحر (مثل «iPhone 15»)، والمعرّفات (رقم الطلب والـ SKU والكوبون والجوال).
- الواجهة الإنجليزية لاتينية دائمًا.
- الإدخال: `normalizeDigits()` يحوّل الأرقام الهندية (U+0660 إلى U+0669) والفارسية (U+06F0 إلى U+06F9) إلى لاتينية قبل أي إرسال إلى زد، في الكمية والجوال والكوبون والبحث.
- منتقيات التاريخ من Material تتبع ترجمات `material_ui`. وأرقامها تُختبر بعد الترقية، لأن Flutter 3.47 أصلح `ZERODIGIT` لترجمة التاريخ العربية ([ملاحظات 3.47](https://docs.flutter.dev/release/release-notes/release-notes-3.47.0)).

### 2.6 السعر ورمز الريال
**الحقائق**:
- الرمز مُرمَّز في Unicode 17.0 باسم U+20C1 SAUDI RIYAL SIGN، وصنفه الاتجاهي `ET` (European Terminator)، وليس له انعكاس ([UnicodeData 17.0](https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt)).
- CLDR 48 أضافه رمزًا «بديلًا» فقط، كي لا تظهر مربعات فارغة على الأجهزة التي لا تملك خطوطها الرمز. وقالت Unicode إن الانتشار قد يستغرق أشهرًا أو سنوات ([Unicode blog](https://blog.unicode.org/2025/03/support-for-new-saudi-riyal-currency.html)). ولم يُعثر على مصدر يؤكد دعمه في خطوط iOS 26 أو Android 16 حتى نوفمبر 2026.
- U+FDFC (﷼) حرف مختلف، ولا يُستخدم أبدًا.
- قواعد ساما الثماني في طلب الترميز ([L2/25-075](https://www.unicode.org/L2/L2025/25075-saudi-central-bank.pdf)): الرمز على يسار الرقم، وبينهما مسافة، وتُحفظ نسبه وشكله الهندسي، وارتفاعه بارتفاع النص، واتجاهه يطابق اتجاه النص (لا يُعكس)، وحوله فراغ بثلث ارتفاعه، وتباين كافٍ مع الخلفية.

**التنفيذ**:
1. خط `intishar_riyal` المضمّن يحمل رسم U+20C1 من ملف SVG الرسمي الذي تنشره ساما، ويُضاف إلى `fontFamilyFallback` في كل `TextStyle` يبنيه `ThemeBuilder`. فإن لم يملك خط التاجر الرمز، يُرسم من هذا الخط قبل خطوط النظام.
2. `PriceText` يبني النص هكذا: LRI، ثم U+20C1، ثم مسافة غير قابلة للكسر U+00A0، ثم الرقم المنسق، ثم PDI. العزل بـ LTR يضع الرمز يسار الرقم في العربية والإنجليزية معًا، وهذا ما تطلبه ساما. والمسافة غير القابلة للكسر تمنع انفصال الرمز عن الرقم في سطرين.
3. `price_decimals = auto`: «129» إن كان الكسر صفرًا، و«129.50» إن لم يكن. و`always`: «129.00».
4. السعر قبل الخصم: `PriceText(strike: true)` بلون `on_surface_muted` وخط في المنتصف.
5. تسمية قارئ الشاشة: `Semantics(label: ..., excludeSemantics: true)` بنص ARB `priceSemantics` = «{amount} ر.س»، والقيمة قبل الخصم «السعر قبل الخصم {amount} ر.س». وتُختبر قراءتها بـ VoiceOver وTalkBack العربيين على جهاز حقيقي (THEME-11). فإن نُطقت «ر.س» حرفين منفصلين، تتغير القيمة في ARB إلى «ريال» بصيغ الجمع، دون تغيير في الكود.
6. النص البديل المرئي «ر.س» (عربي) و«SAR» (إنجليزي) يُستخدم في حالتين: إن اختار التاجر إظهار السعر نصًا (إعداد لاحق)، أو في سياق لا يتحكم في الخط، مثل نص المشاركة وWhatsApp ونصوص الإشعارات. هذه تُرسل دائمًا بـ «ر.س» أو «SAR».
7. العملات الأخرى (حين يغيّر المتسوق العملة عبر cookie `locale` في زد): يُستخدم `currency_symbol` الذي يعيده زد، بنمط `intl` للغة: في العربية الرقم ثم مسافة غير قابلة للكسر ثم الرمز، مسبوقًا بـ RLM U+200F (من بيانات `intl` 0.20.2 للغة `ar`).

### 2.7 التاريخ الهجري (Should)
- يُعرض تسميةً ثانوية فقط، تحت التاريخ الميلادي أو بجانبه، وفي الأماكن التي يفعّلها التاجر (`hijri_secondary`) أو تطلبها كتلة (مثل `countdown` بخاصية `hijri_label` في M03). ومواعيد التوصيل تبقى ميلادية.
- يُحسب بـ `HijriCalendar.fromDate(date)` من حزمة `hijri` 3.0.1، وهي جدول أم القرى للمدى من 1356 هـ (14 مارس 1937) إلى 1500 هـ (16 نوفمبر 2077) (من مصدر الحزمة). وخارج المدى لا تظهر التسمية.
- يُقرأ `hYear` و`hMonth` و`hDay` فقط، ولا تُستخدم `toFormat()`. السبب أن اللغة في الحزمة متغير ثابت عام (`static String language`)، وأن اللغة `ar` تفرض الأرقام الهندية دائمًا (من مصدر الحزمة)، فيتعارض ذلك مع إعداد الأرقام. أسماء الأشهر من ARB، والأرقام من `AppNumberFormat`، واللاحقة «هـ».
- لا تُبنى أي مهلة أو عدّ تنازلي على التاريخ الهجري. أم القرى تقويم محسوب، وقد يختلف يوم بداية رمضان أو العيد المعلن بالرؤية عنه بيوم. والعدّ التنازلي يعتمد على وقت ميلادي يحدده التاجر.

### 2.8 الترجمة

#### الإعداد
- ملفات ARB في `packages/storefront_ui/lib/l10n/`، حتى تتوفر النصوص لمعاينة الويب (SPK-15). القالب `app_ar.arb`، لأن العربية هي اللغة الأولى ومرجع الصيغ.
- `l10n.yaml`:

```yaml
arb-dir: lib/l10n
template-arb-file: app_ar.arb
output-localization-file: app_localizations.dart
output-dir: lib/l10n/gen
synthetic-package: false
nullable-getter: false
use-escaping: true
required-resource-attributes: true
```

- `synthetic-package: false` إلزامي، لأن الحزمة الاصطناعية `package:flutter_gen` لم تعد تُولَّد منذ Flutter 3.32 ([Flutter](https://docs.flutter.dev/release/breaking-changes/flutter-generate-i10n-source)). و`required-resource-attributes: true` يفرض وصفًا (`@key.description`) لكل نص، يشرح سياقه لمن يراجع الترجمة.
- في `MaterialApp`: `localizationsDelegates: [AppLocalizations.delegate, ...GlobalMaterialLocalizations.delegates]`، و`GlobalMaterialLocalizations.delegates` من `material_ui` يضم Cupertino وWidgets ([دليل الترحيل](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)). ويتحقق THEME-08 من أن الكود المولّد لا يجلب نسخة الإطار القديمة من `GlobalMaterialLocalizations`.
- تسمية المفاتيح: `{شاشة}{عنصر}{حالة}` بـ camelCase، مثل `cartEmptyTitle` و`errorOfflineMessage`.

#### صيغ الجمع العربية
العربية لها ست فئات جمع. والسلوك الفعلي في `intl` 0.20.2 (`Intl.plural` للغة `ar`): 0 ← `zero`، و1 ← `one`، و2 ← `two`، و3 إلى 10 ← `few`، و11 إلى 99 ← `many`، و100 و101 و102 ← `other`، و103 ← `few`.

```json
{
  "cartItemsCount": "{count, plural, zero{السلة فارغة} one{منتج واحد} two{منتجان} few{{countText} منتجات} many{{countText} منتجًا} other{{countText} منتج}}",
  "@cartItemsCount": {
    "description": "عدد المنتجات في رأس السلة",
    "placeholders": {
      "count": { "type": "int" },
      "countText": { "type": "String", "example": "3" }
    }
  },
  "lowStockBadge": "{count, plural, one{باقي قطعة واحدة} two{باقي قطعتان} few{باقي {countText} قطع} many{باقي {countText} قطعة} other{باقي {countText} قطعة}}",
  "@lowStockBadge": {
    "description": "شارة المخزون المنخفض في بطاقة المنتج",
    "placeholders": { "count": { "type": "int" }, "countText": { "type": "String" } }
  }
}
```

قاعدة: الرقم المعروض يُمرَّر نصًا جاهزًا (`countText`) من `AppNumberFormat`، والعدد الصحيح (`count`) يختار الفئة فقط. بهذا يحترم النص إعداد الأرقام دون أن يمر بتنسيق `intl` الداخلي.

#### نصوص الواجهة ومحتوى التاجر

| النوع | مصدره | يُترجم بواسطة | مثال |
|---|---|---|---|
| نصوص الواجهة | ARB داخل الملف التنفيذي | فريق المنصة | «أضف إلى السلة» |
| محتوى التاجر في الكتل والإشعارات | M11، كائن `{ar, en}` | التاجر في اللوحة | عنوان البانر |
| بيانات زد | Storefront API بحسب `Accept-Language` | التاجر في زد | اسم المنتج ووصفه |

نصوص الواجهة لا يعدّلها التاجر في الإصدار الأول، وتغييرها يحتاج إصدارًا للتطبيق.

### 2.9 إمكانية الوصول

- **تكبير النص**: يُحترم `MediaQuery.textScalerOf(context)` دون سقف عام. يدعم أندرويد 14 التكبير حتى 200% بمنحنى غير خطي ([Android 14](https://developer.android.com/about/versions/14/features#non-linear-font-scaling)). ويُقيَّد التكبير فقط في المكونات الكثيفة بـ `MediaQuery.withClampedTextScaling`: تسميات الشريط السفلي حتى 1.3، والشارات حتى 1.2. ولا ارتفاع ثابت لأي حاوية نص.
- **التخطيط عند التكبير**: شبكة المنتجات تنتقل من عمودين إلى عمود واحد حين يتجاوز التكبير 1.6، وأزرار الصف الواحد تلتف إلى سطرين بدل القص.
- **التباين**: 4.3، مفروض في الخادم ومُتحقق منه في التطبيق.
- **أهداف اللمس**: 48×48 على الأقل، وارتفاع الزر لا يقل عن 44 حتى في `compact`.
- **قارئ الشاشة بالعربية**:
  - كل زر بأيقونة فقط له تسمية عربية من ARB: المفضلة، والسلة، والفلتر، والمشاركة، والرجوع.
  - السعر يُقرأ بعملته (2.6). والتخفيض يُقرأ بالكلمات «خصم 30 بالمئة» لا بالرمز. والتقييم «4.5 من 5».
  - العناوين بـ `Semantics(headingLevel: n)`، لأن `header: true` بلا أثر على iOS وأندرويد منذ 3.47 ([Flutter](https://docs.flutter.dev/release/breaking-changes/semantics-header-heading-level)).
  - ترتيب القراءة يتبع RTL تلقائيًا ما دامت الودجتات اتجاهية (2.4).
  - (Should) المقاطع الإنجليزية داخل النص العربي تُوسم بلغتها عبر `LocaleStringAttribute` في `AttributedString`، فيقرؤها القارئ بنطق إنجليزي.
- **الحركة**: الكتل المتحركة (السلايدر التلقائي، والعدّ التنازلي) تتوقف حين يكون `MediaQuery.disableAnimationsOf(context)` صحيحًا، والتنفيذ في M03.
- **الاختبار اليدوي**: قبل كل إصدار، قائمة فحص على جهازي P-3 بـ VoiceOver وTalkBack بالعربية، تغطي: الرئيسية، وصفحة المنتج، والسلة، وشاشة التحديث الإجباري.

## 3. التدفقات

### 3.1 التاجر يختار هوية ويعدّلها
1. يفتح التاجر «الهوية» في اللوحة، فتعرض M15 قائمة `GET theme-presets` مصنفة بالقطاع، ومعاينة لكل هوية.
2. يختار هوية، فتُنسخ كل tokens الهوية إلى مسودة التاجر، ويُحفظ `based_on_preset` و`preset_version` للمرجع فقط. تحديث الهوية الجاهزة لاحقًا لا يغيّر مسودات التجار.
3. يعدّل التاجر من الواجهة المبسطة: اللون الرئيسي، واللون الثانوي، والخط، ونمط البطاقة، ونمط الشريط السفلي، والوضع الداكن، والأرقام. والحقول الأخرى في لوحة «متقدم» بأسماء عربية.
4. كل حفظ يرسل `PUT drafts/theme/default` (M11)، فيتحقق الخادم (3.6) ويعيد الـ tokens بحقولها المحسوبة، مع `issues` فيها التحذيرات والتصحيحات. والمسودة تُحفظ حتى مع أخطاء، والمنع عند النشر فقط (قاعدة M11).
5. المعاينة (M15) تعرض الوضعين الفاتح والداكن معًا، وتنبّه إن وُجدت تصحيحات آلية: «عدّلنا لون نص الأزرار ليُقرأ بوضوح».
6. النشر عبر دورة M11 (F-M06). والخادم يعيد التحقق عند النشر، ولا يُنشر token لم يمر.
7. مسار الخطأ: إن رفض المخطط قيمة (مثل لون بصيغة خاطئة)، تُحفظ المسودة ويظهر الحقل في `issues` بدرجة `error`، فتعرضه اللوحة بجانب الحقل. وإن تعذّر التصحيح (4.3)، يُرفض النشر بـ 422 ويُشرح السبب بالعربية.

### 3.2 الاستيراد من زد عند الإعداد (يستدعيه M14)
1. يقرأ الخادم ألوان المتجر: أولًا Merchant API `GET /v1/managers/account/store/branding` الموثق، وفيه `logo` و`logos` و`colors{btn_default_background_color,...}`. وإن لم تكفِ، `GET settings` غير الموثق وفيه `settings.branding.colors{primary, on_primary, secondary, on_secondary}` و`mobile_app_logo`، خلف علم وفق ADR-0003 (`research_notes/.../zid_feature_capability_map.md`، Q3).
2. يطلب معالج الإعداد من التاجر قطاعه، فيُختار preset القطاع.
3. تُستبدل `primary` و`secondary` في الـ preset بألوان زد، وتُمسح `on_*` لتُحسب من جديد.
4. الشعار: `mobile_app_logo` إن وُجد، وإلا `logo`، ويُرفع إلى CDN المنصة بنسخة فاتحة. والنسخة الداكنة فارغة حتى يرفعها التاجر، فيُرسم الشعار الفاتح فوق سطح فاتح مستدير في الوضع الداكن.
5. يمر الناتج بـ `ContrastFixer`، ويُحفظ مسودة أولى. ويُعرض للتاجر ملخص: «استوردنا لونك الرئيسي وشعارك».
6. مسار الخطأ: إن غابت ألوان زد أو كانت غير صالحة، تبقى ألوان الـ preset كما هي، ويُسجَّل السبب.

### 3.3 تطبيق الهوية في التطبيق
1. M01 يحمّل `theme.json` من القرص أو من اللقطة المضمّنة (M01، 3.1).
2. `FontRegistry.registerCached()` يسجّل الخط المحفوظ إن كان غير مضمّن، بحد عائلتين.
3. `ThemeBuilder.build` يُستدعى مرتين، للفاتح وللداكن، ويُمرّر الناتج إلى `MaterialApp.theme` و`darkTheme`، و`themeMode` من 3.5.
4. عند وصول نسخة أحدث من الـ tokens في إعادة التحقق: تُحفظ، وتُطبَّق عند الإقلاع التالي. ويُستثنى من ذلك أن تكون الرئيسية في أعلى التمرير ولم يلمس المتسوق الشاشة بعد، فتُطبَّق فورًا (M01، 3.2).
5. إن كانت النسخة الجديدة تطلب خطًا غير محفوظ: يُنزَّل في الخلفية (3.4)، ولا تُطبَّق النسخة قبل اكتمال تنزيله، حتى لا تظهر الهوية بخط بديل.

### 3.4 تحميل خط من القائمة المنسقة
1. الـ tokens تذكر `typography.font_ar = "cairo"` و`font_version = 3`.
2. `FontRegistry` يبحث في `support/fonts/cairo/3/`. إن وجد الملفات، يسجّلها بـ `FontLoader('cairo')..addFont(bytes)` لكل وزن، ثم `await load()` ([FontLoader](https://api.flutter.dev/flutter/services/FontLoader-class.html)). ويختار Flutter الوزن من بيانات كل ملف.
3. إن لم يجدها: ينزّل من `font_files[].url` في الـ tokens، بمهلة 10 ثوانٍ لكل ملف، ويتحقق من `sha256`، ثم يكتب في مجلد مؤقت وينقله ذريًا.
4. حتى يكتمل التنزيل: يُستخدم الخط المضمّن المحدد في `typography.fallback_family` (IBM Plex Sans Arabic افتراضيًا).
5. مسار الخطأ: فشل التنزيل أو اختلاف `sha256` يعني البقاء على الخط المضمّن، ومحاولة واحدة في الإقلاع التالي، وحدث `font_fallback_used` مرة في الجلسة.
6. التنظيف: عند تغيّر `font_ar` أو `font_en` أو `font_version`، تُحذف ملفات النسخة القديمة بعد أن تسجّل النسخة الجديدة بنجاح.

### 3.5 تحديد الوضع الفاتح أو الداكن

| `appearance.mode` | `ThemeMode` | مصدر الألوان الداكنة |
|---|---|---|
| `system_derived` (الافتراضي) | `ThemeMode.system` | مشتقة آليًا (3.7) |
| `light_only` | `ThemeMode.light` | لا يُبنى ثيم داكن |
| `system_custom` | `ThemeMode.system` | `colors.dark` كما أدخلها التاجر بعد التصحيح |

`system_custom` يشترط وجود `colors.dark` كاملًا، والخادم يرفض غيابه. والمعاينة في اللوحة تعرض الوضعين جنبًا إلى جنب، وتنبّه إلى الصور الشفافة ذات النص الأسود التي تختفي فوق خلفية داكنة.

### 3.6 التحقق في الخادم (عند كل حفظ ونشر)
1. **المخطط**: `opis/json-schema` على `theme-tokens.v1.json`. القيم الخارجة عن القوائم المسموحة أو الألوان التي لا تطابق `^#[0-9A-F]{6}$` تصير `issues` بدرجة `error`.
2. **التطبيع**: الألوان إلى أحرف كبيرة، وحذف المفاتيح المجهولة (لا يُخزَّن ما لا يعرفه المخطط).
3. **المراجع**: `font_ar` و`font_en` موجودان في `FontCatalog` أو في خطوط التاجر الجاهزة (`status = ready`)، وكل رابط أصل على نطاق CDN المنصة.
4. **التباين**: `ContrastFixer` يحسب `on_*` الفارغة، ثم يفحص الأزواج (4.3)، ثم يصحح ما يمكن تصحيحه، ويكتب التصحيحات في الـ tokens وفي التقرير.
5. **الاتساق**: `system_custom` يشترط `colors.dark`. و`numerals` قيمة من القائمة.
6. **الحجم**: الـ JSON المنشور ≤ 16 KB.
7. الاستجابة عند الحفظ: 200 بالـ tokens النهائية و`issues`، حتى مع أخطاء. وعند النشر: أي `error` يعني 422 ولا يُنشر شيء (قاعدة M11).

### 3.7 الألوان الداكنة المشتقة
1. `scheme = ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.dark, dynamicSchemeVariant: DynamicSchemeVariant.fidelity)`. ونمط `fidelity` يقترب من لون البذرة أكثر من `tonalSpot` الافتراضي الذي يعطي ألوانًا باهتة ([ColorScheme.fromSeed](https://api.flutter.dev/flutter/material/ColorScheme/ColorScheme.fromSeed.html)).
2. يُحتفظ بلون العلامة الأصلي `primary` في الداكن فقط إن حقق تباين 3:1 مع السطح الداكن. وإلا يُستخدم لون مرفوع الدرجة بالـ hue نفسه، يحقق 4.5:1 مع السطح للنص.
3. مثال محسوب: `#5B1A32` (perfume_luxe) تباينه مع السطح الداكن `#141218` هو 1.45:1، فيُرفع إلى `#B46B80` بتباين 4.74:1.
4. `sale` و`success` و`warning` و`error` و`rating` الداكنة لها قيم افتراضية في كل preset، ويمكن تجاوزها في `system_custom`.

### 3.8 تبديل اللغة فوريًا (F-S01)
1. اللغة الأولى: لغة الجهاز إن كانت ضمن `SUPPORTED_LOCALES` للتاجر، وإلا `DEFAULT_LOCALE`. ولا تُعرض شاشة اختيار لغة عند الفتح الأول.
2. يغيّر المتسوق اللغة من الحساب، فيستدعي `LocaleController.set(Locale('en'))`.
3. يُحفظ الاختيار في `shared_preferences`، ويُعاد بناء `MaterialApp.locale`، فينقلب `Directionality` دون إعادة تشغيل.
4. `ZidClient.setLanguage('en')` يغيّر `Accept-Language`، ويُلغى كل طلب جارٍ ويُعاد.
5. `localeEpochProvider` يزداد بواحد، فتُعيد كل المزوّدات التي تحمل بيانات زد مترجمة (الكتالوج، ونصوص إجماليات السلة) الجلب، لأنها تراقبه.
6. صفحات المنصة تُقرأ من مخزن اللغة الجديدة (المفتاح يحمل اللغة)، أو تُجلب.
7. يُرسل حدث `language_changed`، ويُبلَّغ M06 لتحديث لغة الإشعارات.
8. موضع التنقل: يبقى المتسوق على الشاشة نفسها، ويعود تمرير الصفحة إلى أعلاها.

### 3.9 لاحقًا: رفع خط خاص مع فحص التغطية (F-M04b، Should)
1. يرفع التاجر ملفات TTF أو OTF، بحد 4 أوزان و2 MB للملف، ويقرّ بأنه يملك ترخيص استخدامه في تطبيق.
2. job في الطابور يشغّل fontTools في بيئة معزولة بلا شبكة، ويقرأ:
   - `cmap`: يجب أن يغطي 100% من U+0621 إلى U+063A ومن U+0641 إلى U+064A، والعلامات `،` (U+060C) و`؛` (U+061B) و`؟` (U+061F). وتحذير فقط إن غابت الحركات (U+064B إلى U+0652)، أو التطويل (U+0640)، أو الأرقام الهندية (U+0660 إلى U+0669)، أو اللاتينية الأساسية (U+0020 إلى U+007E، ويُستكمل نقصها من الخط الاحتياطي).
   - `GSUB`: يجب أن يحوي نص `arab` بخصائص `init` و`medi` و`fina`، و`rlig` أو `liga` للام ألف. بدونها لا تتصل الحروف.
   - `OS/2.fsType`: يُرفض إن كان التضمين مقيدًا (القيمة 0x0002).
   - `OS/2.usWeightClass` لتحديد وزن كل ملف.
3. النتيجة في `font_families.coverage`، والحالة `ready` أو `rejected` برسالة عربية تسمّي الحروف الناقصة.
4. الملفات المقبولة تُنشر على CDN بمجموع sha256، وتصبح قابلة للاختيار في الهوية.

### 3.10 لاحقًا: الحزم الموسمية (F-M06b، Should)
طبقة tokens جزئية بالمخطط نفسه، تحمل ما يتغير فقط (`accent` و`secondary` والشعار الموسمي)، وتُدمج فوق الهوية في الخادم عند النشر المجدول (M11). والتطبيق لا يعرف أنها موسمية، بل يستقبل نسخة tokens كاملة جديدة. وكل حزمة تمر بالتحقق نفسه (3.6).

## 4. نموذج البيانات

### 4.1 مخطط الـ tokens (الإصدار 1)

```json
{
  "token_schema": 1,
  "version": 57,
  "based_on_preset": { "id": "perfume_luxe", "version": 1 },
  "appearance": { "mode": "system_derived" },
  "colors": {
    "light": {
      "primary": "#5B1A32",
      "on_primary": "#FFFFFF",
      "primary_text": "#5B1A32",
      "secondary": "#B8894A",
      "on_secondary": "#111111",
      "accent": "#B8894A",
      "on_accent": "#111111",
      "background": "#FFFDF9",
      "surface": "#FFFDF9",
      "surface_variant": "#F4EEE8",
      "on_surface": "#1C1B1F",
      "on_surface_muted": "#5F5B57",
      "outline": "#8C857F",
      "sale": "#C62828",
      "success": "#2E7D32",
      "warning": "#8A5300",
      "error": "#B3261E",
      "rating": "#C77700"
    },
    "dark": null
  },
  "typography": {
    "font_ar": "ibm_plex_sans_arabic",
    "font_en": "ibm_plex_sans_arabic",
    "fallback_family": "ibm_plex_sans_arabic",
    "font_version": 1,
    "font_files": [],
    "scale": "default"
  },
  "shape": { "radius_sm": 4, "radius_md": 8, "radius_lg": 16 },
  "density": "comfortable",
  "components": {
    "button": { "shape": "rounded", "height": 48 },
    "product_card": { "style": "classic", "image_aspect": "3:4", "image_fit": "cover", "quick_add": false, "elevation": "flat" },
    "tab_bar": { "style": "classic", "labels": "always", "icon_set": "rounded", "cart_icon": "bag", "active_color": "primary" },
    "badges": { "shape": "pill", "sale_format": "percent", "cart_badge_color": "sale" },
    "app_bar": { "style": "surface", "logo_position": "center" },
    "input": { "style": "outlined" }
  },
  "locale_settings": { "numerals": "latin", "price_decimals": "auto", "hijri_secondary": false },
  "assets": {
    "logo_light": "https://cdn.example-platform.sa/t/t_01JC8Z6Q/logo-light@3x.webp",
    "logo_dark": null,
    "placeholder_image": null
  }
}
```

| الحقل | النوع | المسموح | ملاحظة |
|---|---|---|---|
| `token_schema` | int | `1` | يتغير فقط بإصدار تطبيق يدعم مخططًا جديدًا، ويُربط بمراجعة حزمة العقود التي يخدمها مسار `theme/{schema_version}` (M11) |
| `version` | int | تزايدي | يضعه M11 عند النشر |
| `appearance.mode` | enum | `system_derived`، `light_only`، `system_custom` | 3.5 |
| `colors.light.*` | hex | `#RRGGBB` | 18 لونًا دلاليًا. `on_*` و`primary_text` تُحسب إن كانت `null` |
| `colors.dark` | object أو null | نفس مفاتيح `light` | إلزامي في `system_custom` فقط |
| `typography.font_ar` | string | معرّف من `FontCatalog` أو خط التاجر | للواجهة العربية، وللنص العربي في أي واجهة |
| `typography.font_en` | string | كذلك | للواجهة الإنجليزية. الافتراضي يساوي `font_ar`، لأن كل خطوط القائمة تحمل اللاتينية. وحد العائلات المنزّلة اثنتان |
| `typography.fallback_family` | enum | `ibm_plex_sans_arabic`، `tajawal` | مضمّن دائمًا |
| `typography.font_files[]` | array | `{weight, url, sha256, bytes}` | يملؤه الخادم للخطوط غير المضمّنة |
| `typography.scale` | enum | `compact`، `default`، `large` | يضرب المقياس في 0.94 أو 1.0 أو 1.06 |
| `shape.radius_*` | int | 0 إلى 28 | `pill` ثابت 999 |
| `density` | enum | `compact`، `comfortable` | يحدد `VisualDensity` والمسافات |
| `components.button.shape` | enum | `square`، `rounded`، `pill` | — |
| `components.button.height` | int | 44، 48، 52 | لا أقل من 44 |
| `components.product_card.style` | enum | `classic`، `horizontal`، `outlined`، `minimal` | الأنماط الأربعة عند عناقيد مرجعًا (تقرير المزايا) |
| `components.product_card.image_aspect` | enum | `1:1`، `3:4`، `4:5` | 3:4 للأزياء، و1:1 للإلكترونيات |
| `components.product_card.image_fit` | enum | `cover`، `contain` | `contain` لصور المنتجات بخلفية بيضاء |
| `components.product_card.quick_add` | bool | — | زر إضافة سريعة في البطاقة |
| `components.product_card.elevation` | enum | `flat`، `outlined`، `elevated` | — |
| `components.tab_bar.style` | enum | `classic`، `floating`، `pill_indicator` | — |
| `components.tab_bar.labels` | enum | `always`، `selected` | لا خيار لإخفاء التسميات، لأن تسمية «التصنيفات» الصريحة من توصيات Baymard |
| `components.tab_bar.icon_set` | enum | `rounded`، `outlined`، `sharp` | من أيقونات Material المضمّنة، بلا حزمة إضافية |
| `components.tab_bar.cart_icon` | enum | `bag`، `cart` | — |
| `components.tab_bar.active_color` | enum | `primary`، `on_surface` | — |
| `components.badges.shape` | enum | `pill`، `rounded`، `square` | — |
| `components.badges.sale_format` | enum | `percent`، `amount`، `text` | «خصم 30%» أو «وفّر 50 ر.س» أو «تخفيض» |
| `components.badges.cart_badge_color` | enum | `sale`، `primary` | — |
| `components.app_bar.style` | enum | `surface`، `primary` | — |
| `components.app_bar.logo_position` | enum | `start`، `center` | — |
| `components.input.style` | enum | `outlined`، `filled` | — |
| `locale_settings.numerals` | enum | `latin`، `arabic_indic` | القسم 2.5 |
| `locale_settings.price_decimals` | enum | `auto`، `always` | `auto` يخفي «.00» |
| `locale_settings.hijri_secondary` | bool | — | Should |
| `assets.*` | URL أو null | نطاق CDN المنصة | الشعار بعرض لا يقل عن 600 بكسل |

لا يوجد حقل للمسافة بين الحروف ولا لتحويل الحروف إلى كبيرة. القيمة 0 ثابتة في الكود (3.9).

### 4.2 مقياس الخط

القيم بالبكسل المنطقي، قبل تكبير النظام وقبل `typography.scale`. ارتفاع السطر للعربية أكبر بنحو 10 إلى 15% من اللاتينية، وهي قاعدة عملية من مصادر الممارسين لا من مصدر رسمي، وتُثبَّت بالـ goldens (`research_notes/.../mobile_shopping_ux.md`، القسم 4).

| الدور | يقابل في `TextTheme` | الحجم | الوزن | ارتفاع السطر (ar) | ارتفاع السطر (en) |
|---|---|---|---|---|---|
| `display` | `displaySmall` | 30 | 700 | 1.35 | 1.2 |
| `headline` | `headlineSmall` | 24 | 700 | 1.4 | 1.25 |
| `title_lg` | `titleLarge` | 20 | 600 | 1.45 | 1.3 |
| `title` | `titleMedium` | 17 | 600 | 1.5 | 1.35 |
| `body_lg` | `bodyLarge` | 16 | 400 | 1.65 | 1.5 |
| `body` | `bodyMedium` | 15 | 400 | 1.6 | 1.45 |
| `label` | `labelLarge` | 14 | 500 | 1.45 | 1.35 |
| `caption` | `bodySmall` و`labelSmall` | 12 | 400 | 1.5 | 1.4 |
| `price` | `BrandTheme.priceStyle` | 17 | 700 | 1.25 | 1.25 |

قواعد: `letterSpacing: 0` في كل الأدوار وفي اللغتين، لأن محتوى زد قد يصل عربيًا حتى في الواجهة الإنجليزية، والمسافة تكسر وصل الحروف ([WebKit bug 195745](https://lists.webkit.org/pipermail/webkit-unassigned/2019-March/864618.html)). و`leadingDistribution: TextLeadingDistribution.even`. ولا مائل في العربية. والسعر بـ `FontFeature.tabularFigures()` إن دعمه الخط.

### 4.3 أزواج التباين والتصحيح

| النص أو العنصر | الخلفية | الحد الأدنى | التصحيح الآلي |
|---|---|---|---|
| `on_primary` | `primary` | 4.5:1 | يُختار الأبيض أو `#111111` أيهما أعلى. وإن لم يبلغ أي منهما 4.5، يُشتق `primary_fill` بدرجة أغمق أو أفتح للأزرار فقط |
| `on_secondary` و`on_accent` | `secondary` و`accent` | 4.5:1 | كذلك |
| `on_surface` | `surface` و`background` | 4.5:1، والهدف 7:1 | لا يصحَّح، ويُرفض النشر إن فشل |
| `on_surface_muted` | `surface` | 4.5:1 | تُعتم درجته حتى يبلغ الحد |
| `primary_text` (روابط، وسعر بلون العلامة) | `surface` | 4.5:1 | يُشتق من `primary` بالـ hue نفسه وبدرجة أغمق أو أفتح |
| `sale` نصًا | `surface` | 4.5:1 | كذلك |
| نص الشارة | خلفية الشارة | 4.5:1 | الأبيض أو `#111111` |
| `outline` (حدود الحقول) | `surface` | 3:1 | تُعتم درجته |
| أيقونة التبويب النشط وغير النشط | خلفية الشريط | 3:1 | كذلك |
| `rating` (النجوم) | `surface` | 3:1 | كذلك |

الحدود من WCAG 2.2: 4.5:1 للنص العادي، و3:1 للنص الكبير (18pt، أو 14pt عريض) ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))، و3:1 لمكونات الواجهة والرسوم ([SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)). النسبة لا تُقرَّب: 4.499 تفشل.

**الخوارزمية** (الخادم مرجع، والتطبيق ينفذ النسخة نفسها دفاعيًا):
1. التباين = `(L1 + 0.05) / (L2 + 0.05)` بالإضاءة النسبية لـ sRGB ([WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
2. للتصحيح: يُحوَّل اللون إلى CIELAB، ويُثبَّت a* وb*، ويُبحث ثنائيًا في L* (أغمق إن كانت الخلفية فاتحة، وأفتح إن كانت داكنة) حتى يبلغ التباين الحد مضافًا إليه 0.1، كي لا يسقط تحته عند التقريب إلى hex. ثم يُقصّ اللون إلى نطاق sRGB.
3. في Dart: `Hct.fromInt(argb)`، ثم `Contrast.darker(tone: surfaceTone, ratio: 4.6)` أو `Contrast.lighter(...)`، ثم `Hct.from(hue, chroma, tone)`. ودرجة HCT هي L* نفسها، فتتقارب النتيجتان.
4. مثال: `#E4572E` (kids_toys) تباينه مع الأبيض 3.68:1. فيصبح `on_primary = #111111` (5.13:1)، ويصبح `primary_text = #CF461F` (4.62:1 مع الأبيض).
5. يُرفض النشر (`theme.contrast.unfixable`) فقط إن فشل `on_surface` مع `surface`، لأن التصحيح هنا يعني تغيير هوية الصفحة كلها.

### 4.4 صيغة الهوية الجاهزة

```json
{
  "id": "grocery_fresh",
  "version": 1,
  "sector": "grocery",
  "name": { "ar": "طازج", "en": "Fresh" },
  "description": { "ar": "للبقالة والخضار والمنتجات اليومية", "en": "Grocery and daily essentials" },
  "preview_image": "https://cdn.example-platform.sa/presets/grocery_fresh@2x.webp",
  "sort": 50,
  "tokens": { "token_schema": 1, "...": "مجموعة tokens كاملة بنفس مخطط 4.1" }
}
```

الهويات الاثنتا عشرة المقترحة. ألوانها مبدئية، تُراجع مع مكتبة التصميم في D-08، وكل الأرقام محسوبة بمعادلة WCAG:

| المعرّف | القطاع | `primary` | `on_primary` (التباين) | `secondary` | الخط | البطاقة ونسبة الصورة | الزر | الكثافة |
|---|---|---|---|---|---|---|---|---|
| `perfume_luxe` | عطور وبخور | `#5B1A32` | أبيض (12.8) | `#B8894A` | IBM Plex Sans Arabic | classic، 3:4 | rounded، 4 | comfortable |
| `abaya_elegance` | عبايات وأزياء محتشمة | `#2F2A26` | أبيض (14.2) | `#9C7A45` | Tajawal | minimal، 3:4 | square | comfortable |
| `fashion_modern` | أزياء | `#111111` | أبيض (18.9) | `#D6336C` | Tajawal | minimal، 3:4 | square | comfortable |
| `beauty_soft` | تجميل وعناية | `#A8326A` | أبيض (6.3) | `#E9A8C4` | Tajawal | classic، 4:5 | pill | comfortable |
| `electronics_tech` | إلكترونيات | `#0B57D0` | أبيض (6.4) | `#00897B` | IBM Plex Sans Arabic | outlined، 1:1 contain | rounded، 8 | compact |
| `grocery_fresh` | بقالة | `#1B7A3A` | أبيض (5.4) | `#F2A900` | Tajawal | horizontal، 1:1 مع إضافة سريعة | rounded، 12 | compact |
| `coffee_dates` | قهوة وتمور ومنتجات محلية | `#6B3E26` | أبيض (9.0) | `#C08A52` | IBM Plex Sans Arabic | classic، 1:1 | rounded، 8 | comfortable |
| `gifts_flowers` | هدايا وورود | `#7B2E83` | أبيض (8.2) | `#E0699B` | Tajawal | classic، 4:5 | pill | comfortable |
| `kids_toys` | أطفال وألعاب | `#E4572E` | `#111111` (5.1)، و`primary_text = #CF461F` | `#1B998B` | Tajawal | classic، 1:1 | pill | comfortable |
| `home_living` | أثاث ومنزل | `#33506E` | أبيض (8.4) | `#B5835A` | IBM Plex Sans Arabic | minimal، 4:5 | rounded، 4 | comfortable |
| `sports_active` | رياضة | `#0D1B2A` | أبيض (17.4) | `#E63946` | IBM Plex Sans Arabic | outlined، 1:1 | rounded، 8 | compact |
| `restaurant_cafe` | مطاعم ومقاهي | `#9A3412` | أبيض (7.3) | `#F4A259` | Tajawal | horizontal، 1:1 | rounded، 12 | comfortable |

قيمة `sector` من القائمة: `perfume`، و`fashion`، و`beauty`، و`electronics`، و`grocery`، و`gifts`، و`restaurants`، و`kids`، و`home`، و`sports`، و`general`. والقطاعات الأربعة `beauty` و`kids` و`home` و`sports` غير موجودة اليوم في تعداد `sector` بجدول `presets` في M11، فتُضاف إليه (8.3). و`coffee_dates` تحت `grocery`.

الألوان الثانوية الفاتحة (مثل `#E9A8C4` و`#F2A900` و`#F4A259`) تُستخدم تعبئة فقط، مع `on_secondary` محسوب. ولا تُرسم نصًا أو أيقونة فوق السطح إلا إن حققت الحد.

الألوان الدلالية المشتركة بين كل الهويات في الوضع الفاتح، ونسبها مع الأبيض: `sale` ‏`#C62828` (5.6)، و`success` ‏`#2E7D32` (5.1)، و`warning` ‏`#8A5300` (6.3)، و`error` ‏`#B3261E` (6.5)، و`rating` ‏`#C77700` (3.5، رسم)، و`outline` ‏`#8C857F` (3.6).

### 4.5 الخطوط

| المعرّف | العائلة | المصدر | الأوزان | الحجم التقريبي | ملاحظة |
|---|---|---|---|---|---|
| `ibm_plex_sans_arabic` | IBM Plex Sans Arabic | مضمّن | 400، 500، 700 | 674 KB للثلاثة | عربي ولاتيني |
| `tajawal` | Tajawal | مضمّن | 400، 500، 700 | 167 KB للثلاثة | عربي ولاتيني |
| `intishar_riyal` | خط داخلي برمز واحد | مضمّن | — | أقل من 5 KB | U+20C1 فقط، من ملف SVG الرسمي لساما |
| `cairo` | Cairo | القائمة المنسقة | 400، 700 | نحو 92 KB للوزن | — |
| `almarai` | Almarai | القائمة المنسقة | 400، 700 | نحو 150 KB للوزن | — |
| `noto_kufi_arabic` | Noto Kufi Arabic | القائمة المنسقة | 400، 700 | نحو 178 KB للوزن | — |
| `readex_pro` | Readex Pro | القائمة المنسقة | 400، 700 | نحو 92 KB للوزن | — |
| `rubik` | Rubik | القائمة المنسقة | 400، 700 | يُقاس | للعلامات المرحة |
| `alexandria` | Alexandria | القائمة المنسقة | 400، 700 | يُقاس | — |
| `changa` | Changa | القائمة المنسقة | 400، 700 | يُقاس | طابع عرضي |
| `el_messiri` | El Messiri | القائمة المنسقة | 400، 700 | يُقاس | طابع زخرفي، يناسب العطور والهدايا |

العائلات كلها على Google Fonts بنطاقي `arabic` و`latin`، ومفتوحة المصدر (بيانات [Google Fonts](https://fonts.google.com/metadata/fonts) في 2026-11-10). وأحجام الملفات قيست من ملفات TTF التي يقدمها Google Fonts للأوزان المذكورة. قبل نسخ أي عائلة إلى CDN المنصة، يُحفظ ملف ترخيصها معها، ويُسجَّل في `LicenseRegistry` داخل التطبيق.

### 4.6 جداول الخادم

**الهويات الجاهزة**: تُخزَّن في جدول `presets` الذي يملكه M11 (القسم 4.1 فيه) بقيمة `kind = theme` و`scope = platform`. وM02 يحدد المحتوى: `body` هو ملف الهوية في 4.4 بلا `id` (الذي يصبح مفتاحًا ثابتًا في `body.slug`)، و`schema_rev` هو `token_schema`، و`sector` من القائمة أعلاه. ونسخ هوية التاجر نفسها مستند `theme` بمفتاح `default` في نسخ M11، لا جدول خاصًا بـ M02.

**`font_families`** (القائمة المنسقة، وخطوط التجار لاحقًا)

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | string PK | مثل `cairo`، أو `t_01JC8Z6Q_brandfont` |
| `tenant_id` | ulid أو null | null للقائمة المنسقة |
| `family_name` | string | — |
| `source` | enum | `bundled`، `curated`، `uploaded` |
| `version` | int | يزداد عند تغيير الملفات |
| `files` | jsonb | `[{weight, style, url, sha256, bytes}]` |
| `coverage` | jsonb | نتيجة الفحص (Should) |
| `license` | string | `OFL-1.1` أو إقرار التاجر |
| `status` | enum | `processing`، `ready`، `rejected` |

### 4.7 على الجهاز

| البيانات | المكان |
|---|---|
| الـ tokens المنشورة | `support/config/theme.json` (M01) |
| ملفات الخطوط المنزّلة | `support/fonts/{family}/{version}/{weight}.ttf` |
| لغة المتسوق | `shared_preferences`، المفتاح `locale` |
| (Could) اختيار المتسوق للوضع | `shared_preferences`، المفتاح `appearance_override` |

## 5. الواجهات والعقود

### 5.1 ما يقرؤه التطبيق
`GET {CONFIG_CDN_URL}/api/app/v1/t/{tenant}/theme/{schema_version}` (M11)، بلا لغة في المسار، وبالترويسات والطلب الشرطي المعرّفة في M01 (5.1). و`schema_version` هنا مراجعة حزمة العقود (M03)، والرد مخطط 4.1 كاملًا ومصحَّحًا. والتطبيق لا يقبل ردًا `token_schema` فيه غير 1.

### 5.2 ما تستهلكه لوحة التاجر (M15)، ويقدّمه M11
المسارات بعد `/api/v1/tenants/{t}` بمصادقة Sanctum، وفق M11 (القسم 5.1 فيه). وM02 يضيف التحقق والحساب داخلها، لا مسارات حفظ خاصة.

| الطريقة والمسار | الغرض | المالك |
|---|---|---|
| `GET /theme-presets?sector=` | الهويات الجاهزة من جدول `presets` بنوع `theme` | M11، والمحتوى من M02 |
| `GET /drafts/theme/default` | مسودة الهوية و`revision` و`issues` | M11 |
| `PUT /drafts/theme/default` | حفظ بـ `If-Match`. والخادم يحسب `on_*` و`primary_text` و`font_files` ويعيدها في الجسم | M11، والتحقق من M02 |
| `POST /drafts/theme/default/validate` | تحقق وحساب دون حفظ، تستدعيه المعاينة بعد توقف السحب 300 ms | M02 داخل وحدة M11 |
| `GET /fonts` | القائمة المنسقة وخطوط التاجر | M02 داخل وحدة M11 |
| `POST /fonts` | (Should) رفع خط | M02 داخل وحدة M11 |

تطبيق هوية جاهزة لا يحتاج مسارًا: تنسخ اللوحة `body.tokens` إلى المسودة وتحفظها بـ `PUT`.

الحقول المحسوبة (`on_*` و`primary_text` و`font_files`) يكتبها الخادم دائمًا ويتجاهل ما يرسله العميل فيها. والتحذيرات بصيغة `issues` الموحدة في M11 (`severity` و`code` و`path` بصيغة JSON Pointer و`message` بلغتين)، مع حقول إضافية للتصحيح. مثال استجابة `PUT`:

```json
{
  "revision": 14,
  "body": { "token_schema": 1, "colors": { "light": { "primary": "#E4572E", "on_primary": "#111111", "primary_text": "#CF461F" } } },
  "issues": [
    {
      "severity": "warning",
      "code": "theme.contrast.autofixed",
      "path": "/colors/light/on_primary",
      "message": { "ar": "اخترنا نصًا داكنًا فوق لونك الرئيسي ليُقرأ بوضوح", "en": "Dark text chosen on your primary color for readability" },
      "before": null,
      "after": "#111111",
      "ratio": 5.13
    },
    {
      "severity": "warning",
      "code": "theme.contrast.autofixed",
      "path": "/colors/light/primary_text",
      "message": { "ar": "عدّلنا درجة لون الروابط والأسعار قليلًا لتُقرأ على الخلفية", "en": "Adjusted link and price color for readability" },
      "before": "#E4572E",
      "after": "#CF461F",
      "ratio": 4.62
    }
  ]
}
```

ومثال `issues` بدرجة `error` (تُحفظ المسودة، ويُمنع النشر بـ 422):

```json
[
  { "severity": "error", "code": "theme.schema.invalid", "path": "/colors/light/primary", "message": { "ar": "اللون يجب أن يكون بصيغة ‎#RRGGBB", "en": "Color must be #RRGGBB" } },
  { "severity": "error", "code": "theme.dark.missing", "path": "/colors/dark", "message": { "ar": "اخترت ألوانًا داكنة خاصة، فأكمل كل الألوان الداكنة", "en": "Custom dark mode requires all dark colors" } }
]
```

رموز `issues` من M02: `theme.schema.invalid`، و`theme.font.unknown`، و`theme.font.not_ready`، و`theme.asset.foreign_host`، و`theme.dark.missing`، و`theme.contrast.unfixable`، و`theme.size.exceeded` (كلها `error`)، و`theme.contrast.autofixed` (`warning`).

### 5.3 عقود Dart للوحدات الأخرى

```dart
final brand = BrandTheme.of(context);          // نمط البطاقة، ولون التخفيض، وأنصاف الأقطار ...
final l10n = context.l10n;                      // AppLocalizations
PriceText(amount: Decimal.parse('1299.5'), currency: 'SAR', strike: false);
AppNumberFormat.of(context).count(3);           // "3" أو "٣" بحسب NumeralPolicy
Bidi.ltr(order.number);                         // LRI + النص + PDI
LocalizedText.resolve(block.title, locale);    // نص التاجر بلغة المتسوق أو بديله
HijriLabel(date: campaign.endsAt);             // Should
```

- الكتل (M03) تقرأ `Theme.of(context)` و`BrandTheme.of(context)` فقط، ولا تحمل ألوانًا ثابتة. ويُفرض ذلك بقاعدة تمنع `Color(0x...)` في مجلد الكتل، ما عدا الشفافية.
- محتوى التاجر من M11 يصل دائمًا كائنًا `{ar, en}`. والبديل: لغة المتسوق، ثم `DEFAULT_LOCALE`، ثم أول لغة غير فارغة، ثم يُخفى العنصر.

### 5.4 الأحداث (الأسماء النهائية من M08)

| الحدث | الخصائص |
|---|---|
| `language_changed` | `from`، و`to` |
| `theme_applied` | `version`، و`mode`، و`brightness` الفعلي |
| `font_fallback_used` | `family`، و`reason` |

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| لون رئيسي متوسط الدرجة لا يحقق 4.5 مع الأبيض ولا مع الأسود | `on_primary` = أعلاهما، ويُشتق `primary_fill` للأزرار بدرجة تحقق الحد، ويبقى اللون الأصلي للعناصر غير النصية. وتحذير للتاجر |
| `on_surface` يفشل مع `surface` | رفض النشر برمز `theme.contrast.unfixable` ورسالة عربية |
| `system_custom` بلا `colors.dark` | `issues` بدرجة `error` ورمز `theme.dark.missing`، ويُمنع النشر بـ 422 |
| التاجر يختار `light_only` والجهاز داكن | التطبيق فاتح، وشريط الحالة بأيقونات داكنة |
| شعار داكن غير مرفوع والوضع داكن | الشعار الفاتح فوق خلفية فاتحة مستديرة بنصف قطر `radius_md` |
| خط منسق لم يكتمل تنزيله عند أول إقلاع | الخط الاحتياطي المضمّن، ولا تُطبَّق نسخة الهوية الجديدة قبل اكتمال الخط |
| ملف خط تالف أو `sha256` لا يطابق | يُحذف، والخط الاحتياطي، وحدث `font_fallback_used` |
| خط التاجر يفتقد رمز الريال | يُرسم الرمز من `intishar_riyal` عبر `fontFamilyFallback` |
| خط التاجر يفتقد حرفًا عربيًا نادرًا (مثل ڤ أو گ) في اسم منتج | يُرسم من الخط الاحتياطي ثم خطوط النظام. وفي الخطوط المرفوعة يحذّر الفحص (Should) |
| `token_schema` في الرد غير 1 | يُرفض الرد ويبقى المخزّن، وخطأ non-fatal (M01) |
| قيمة enum مجهولة في الـ tokens وصلت للتطبيق رغم التحقق | `fromJson` يستخدم قيمة الـ preset الافتراضية للحقل، ويرسل non-fatal |
| اسم منتج إنجليزي في الواجهة العربية | يُعرض كما هو داخل `Bidi.auto`، بلا مسافة بين الحروف |
| محتوى تاجر بالعربية فقط والواجهة إنجليزية | يُعرض العربي (بديل اللغة)، بمحاذاة تتبع اتجاه النص نفسه |
| متجر لا يدعم الإنجليزية (`SUPPORTED_LOCALES = ar`) | يُخفى خيار اللغة، والتطبيق عربي حتى لو كان الجهاز إنجليزيًا |
| جهاز بلغة غير مدعومة (مثل الفرنسية) | `DEFAULT_LOCALE` للتاجر |
| أرقام هندية مكتوبة في حقل الكوبون | تُطبَّع إلى لاتينية قبل الإرسال إلى زد |
| تاريخ هجري خارج مدى 1356 إلى 1500 هـ | لا تظهر التسمية الهجرية |
| سعر سالب أو صفر | الصفر يُعرض «مجانًا» من ARB. والسالب لا يُعرض، ويُسجَّل خطأ |
| تكبير النص 200% في بطاقة المنتج | السطر الثاني من الاسم يُقص بعلامة الحذف، والسعر لا يُقص أبدًا، والشبكة تصير عمودًا واحدًا |
| الترقية إلى Flutter 3.50 | مراجعة كل goldens النص المختلط، لأن ترتيب `WidgetSpan` في RTL تغيّر |

## 7. المتطلبات غير الوظيفية

| المجال | المتطلب | القياس |
|---|---|---|
| الأداء | `ThemeBuilder.build` أقل من 8 ms للثيمين معًا على الجهاز المرجعي | اختبار أداء في وضع profile |
| الأداء | تبديل اللغة يعيد رسم الشاشة الحالية خلال 300 ms، دون إعادة تشغيل | قياس من الضغط إلى أول إطار |
| الأداء | تسجيل خطين محفوظين قبل `runApp` أقل من 60 ms | توقيت داخل `BootstrapLoader` |
| الحجم | الخطوط المضمّنة ≤ 1 MB، وخط الريال أقل من 5 KB | M01، ميزانية الحجم |
| الحجم | tokens منشورة ≤ 16 KB، والمتوقع نحو 4 KB | تحقق الخادم |
| الحجم | خط منسق يُنزَّل ≤ 400 KB لوزنين | `FontCatalog` |
| التباين | 100% من أزواج 4.3 تحقق حدودها في كل هوية منشورة | اختبار وحدة على الهويات الاثنتي عشرة، وفحص الخادم عند كل نشر |
| RTL | صفر استخدام لـ `left` و`right` الثابتة خارج الاستثناءات | فحص CI |
| RTL | كل مكوّن في `storefront_ui` له golden بالعربية والإنجليزية، وفاتح وداكن | 4 صور لكل مكوّن |
| الوصول | الشاشات الأساسية تعمل عند تكبير 200% دون قص للسعر أو للأزرار | widget tests بـ `TextScaler.linear(2.0)` |
| الوصول | كل `IconButton` له تسمية دلالية | فحص `meetsGuideline(labeledTapTargetGuideline)` في widget tests |
| الوصول | أهداف اللمس ≥ 48×48 | `meetsGuideline(androidTapTargetGuideline)` |
| الترجمة | لا نص ظاهر للمتسوق خارج ARB أو محتوى التاجر | قاعدة تحليل تمنع النصوص الحرفية في الودجتات، مع استثناءات للاختبارات |
| الترجمة | كل مفتاح في `app_ar.arb` موجود في `app_en.arb` | يفشل gen-l10n عند الغياب |

## 8. الاعتماديات والمجهول

### 8.1 التجارب والوحدات
- **SPK-15**: المعاينة على الويب تستخدم `ThemeBuilder` نفسه. وأي فرق في رسم الخطوط العربية بين الويب والجهاز يُسجَّل في نتيجة التجربة. لذلك يُحمَّل خط التاجر في المعاينة من CDN المنصة نفسه.
- **SPK-09**: لا أثر مباشر. استيراد ألوان زد (3.2) يعتمد على `branding` و`settings`، لا على `template-settings`.
- **M11**: تخزين نسخ الـ tokens ونشرها وCDN، ومسارات اللوحة في 5.2.
- **M15**: واجهة المحرر والمعاينة جنبًا إلى جنب.
- **M14**: يستدعي `ZidBrandingImporter` في معالج الإعداد ويسأل عن القطاع.
- **M03**: الكتل تقرأ `BrandTheme` ولا تعرّف ألوانها.

### 8.2 ما يُبنى الآن خلف واجهة مؤقتة
- `ThemeBuilder` ونماذج الـ tokens والهويات الجاهزة والـ goldens، من ملفات JSON محلية في `test/fixtures/themes/`.
- `ContrastFixer` في PHP صنفًا مستقلًا باختبارات وحدة على متجهات اختبار مشتركة مع Dart (`06-api/fixtures/contrast-vectors.json`: لون، وخلفية، والنتيجة المتوقعة). ويُربط بمسار اللوحة حين يجهز M11.
- `FontRegistry` بخادم ملفات محلي حتى يجهز CDN المنصة (D-06).

### 8.3 ملاحظات على PRD والقرارات
- **رفع الخط الخاص**: ورد في نطاق هذه المواصفة، لكنه Should في PRD (F-M04b). فُصّل في 3.9 بإيجاز ولم يدخل قصص Must.
- **التاريخ الهجري**: ليس في PRD. مفصّل لأنه صغير، وأولويته Should.
- **ADR-0002** يقول «خطان مضمّنان فقط». خيار للمشرف: أن يكون الخط المضمّن الثاني هو خط التاجر من القائمة المنسقة وقت البناء بدل Tajawal، فلا ينتظر أول إقلاع أي تنزيل. يزيد هذا عمل M13 قليلًا، ولا يزيد الحجم، ولا يخالف القرار.
- **تسمية قارئ الشاشة للسعر**: المطلوب «ر.س». وتبقى قابلة للتغيير من ARB بعد اختبار النطق على الأجهزة (2.6).

- **تعارض مع M15 في تصحيح التباين**: يصف M15 (القسم 3.3.9 فيه) زر «أصلحه» في المتصفح يعدّل الإضاءة في OKLCH بـ culori، ويترك ما بقي ناقصًا تنبيهًا. وهذه المواصفة تجعل الخادم يحسب `on_*` و`primary_text` آليًا عند كل حفظ بالبحث في L* من CIELAB. الاقتراح: يبقى زر M15 لتعديل الألوان التي يدخلها التاجر نفسه (`primary` وغيرها)، ويستدعي `validate` للنتيجة، فلا يوجد إلا تنفيذ مرجعي واحد للحساب. ويحتاج قرار المشرف.
- **تعداد القطاعات في M11**: جدول `presets` في M11 يعرّف `sector` بسبع قيم. والهويات هنا تحتاج أربع قيم إضافية (`beauty` و`kids` و`home` و`sports`).
- **الخطوط بحسب اللغة**: اتبعت هذه المواصفة M15 وتقرير المزايا في فصل `font_ar` عن `font_en`.

### 8.4 قرارات مفتوحة للمشرف

| السؤال | التوصية |
|---|---|
| اعتماد الهويات الاثنتي عشرة وألوانها | تُراجع مع مكتبة التصميم في D-08 قبل THEME-05 |
| الخطان المضمّنان | IBM Plex Sans Arabic وTajawal |
| نطاق إعداد الأرقام | على مستوى التاجر فقط في الإصدار الأول، دون خيار للمتسوق |
| إظهار الهجري افتراضيًا | مطفأ، ويفعّله التاجر |
| اختيار الوضع الداكن للمتسوق | Could، بعد قياس استخدام الوضع الداكن |

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| THEME-01 | مخطط tokens v1: ملف JSON Schema، ونموذج `BrandTokens`، والتحليل الصارم، والـ fixtures | Must | نعم | APP-01 |
| THEME-02 | `ThemeBuilder` و`BrandTheme`: `ColorScheme.fromSeed` بنمط fidelity مع التجاوزات، وثيمات المكونات (الزر، والبطاقة، والشريط السفلي، والشارات، والشريط العلوي، والحقول)، والـ goldens | Must | نعم | THEME-01 |
| THEME-03 | التباين: `ContrastGuard` في Dart و`ContrastFixer` في PHP، ومتجهات اختبار مشتركة، والألوان الداكنة المشتقة | Must | نعم | THEME-01 |
| THEME-04 | تحقق الخادم ومسارات اللوحة (5.2)، و`ZidBrandingImporter` | Must | ينتظر M11 (التخزين والمسارات)، وM14 للاستدعاء | THEME-03 |
| THEME-05 | الهويات الاثنتا عشرة: ملفات JSON، وصور المعاينة، والزرع، ومعرض golden لكل هوية | Must | نعم للملفات. والاعتماد البصري ينتظر D-08 | THEME-02، THEME-03 |
| THEME-06 | الخطوط: تضمين الخطين وخط الريال، و`FontRegistry` بـ `FontLoader`، والقائمة المنسقة على CDN، والتنزيل والتحقق والبديل | Must | نعم (CDN وهمي حتى D-06) | APP-03، THEME-02 |
| THEME-07 | الوضع الداكن بخياراته الثلاثة، وشريط الحالة، والشعار الداكن | Must | نعم | THEME-02، THEME-03 |
| THEME-08 | الترجمة: gen-l10n في `storefront_ui`، وملفا ARB، وصيغ الجمع، و`LocalizedText`، و`LocaleController` والتبديل الفوري وإبطال بيانات زد | Must | نعم | APP-05، APP-06 |
| THEME-09 | عدة RTL: فحص CI للاتجاهات الثابتة، و`DirectionalIcon`، و`Bidi`، و`LtrField`، ومصفوفة goldens باللغتين | Must | نعم | APP-12 |
| THEME-10 | الأرقام والسعر: `NumeralPolicy`، و`AppNumberFormat`، و`PriceText` برمز U+20C1، والتخفيض والنسبة، وتطبيع الأرقام المدخلة | Must | نعم | THEME-06، THEME-09 |
| THEME-11 | إمكانية الوصول: قواعد التكبير والتقييد، والتسميات العربية، وفحوص `meetsGuideline`، وقائمة الفحص اليدوي بـ VoiceOver وTalkBack | Must | نعم | THEME-02، THEME-10 |
| THEME-12 | التسمية الهجرية | Should | نعم | THEME-10 |
| THEME-13 | رفع خط خاص وفحص تغطيته | Should | ينتظر M11 وM15 | THEME-06 |
| THEME-14 | الحزم الموسمية | Should | ينتظر M11 (الجدولة) | THEME-04 |
| THEME-15 | اختيار المتسوق للوضع، ومزامنة لغة النظام، ووسم المقاطع الإنجليزية لقارئ الشاشة | Could | نعم | THEME-07، THEME-08 |

كل قصة لا تتجاوز سباقًا من أسبوعين لمنفذ واحد. أكبرها THEME-02 وTHEME-08.

### معايير القبول

**THEME-02: تحويل الـ tokens إلى ثيم**
1. **بافتراض** tokens فيها `primary = #5B1A32`، **عندما** يُبنى الثيم الفاتح، **إذن** يكون `colorScheme.primary` هو `#5B1A32` بالضبط، لا لونًا مشتقًا.
2. **بافتراض** أي هوية من الاثنتي عشرة، **عندما** يُبنى أي `TextStyle` في `textTheme`، **إذن** قيمة `letterSpacing` تساوي 0، وتحوي `fontFamilyFallback` الخط `intishar_riyal`.
3. **بافتراض** `components.product_card.style = outlined` و`image_aspect = 1:1`، **عندما** تُرسم بطاقة المنتج في golden، **إذن** تظهر بإطار وصورة مربعة، بالعربية والإنجليزية وبالفاتح والداكن.
4. **بافتراض** `components.tab_bar.labels = selected`، **عندما** يُرسم الشريط السفلي، **إذن** تظهر تسمية التبويب النشط فقط، ولكل تبويب تسمية دلالية بالعربية.

**THEME-03: التباين**
1. **بافتراض** `primary = #E4572E` و`on_primary = null`، **عندما** يحفظ الخادم المسودة، **إذن** يصبح `on_primary = #111111`، و`primary_text = #CF461F`، ويحوي التقرير تحذيرين `theme.contrast.autofixed` بالنسبتين 5.13 و4.62.
2. **بافتراض** متجهات `contrast-vectors.json`، **عندما** تُشغَّل اختبارات Dart وPHP، **إذن** تكون نتائج التنفيذين متطابقة في كل متجه، أو مختلفة بدرجة L* لا تتجاوز 1 مع تحقيق الحد في كليهما.
3. **بافتراض** `surface = #777777` و`on_surface = #888888`، **عندما** يطلب التاجر النشر، **إذن** يُرفض بـ `theme.contrast.unfixable` ورسالة عربية.
4. **بافتراض** `appearance.mode = system_derived` و`primary = #5B1A32`، **عندما** يُبنى الثيم الداكن، **إذن** يحقق اللون المستخدم للنص بلون العلامة تباينًا ≥ 4.5 مع السطح الداكن.

**THEME-06: الخطوط**
1. **بافتراض** هوية بخط `cairo` غير محفوظ وجهاز متصل، **عندما** يُفتح التطبيق أول مرة، **إذن** يُرسم بالخط الاحتياطي المضمّن، ويُنزَّل Cairo في الخلفية، وفي الإقلاع التالي يُرسم بـ Cairo دون أي طلب شبكة قبل أول إطار.
2. **بافتراض** ملف خط وصل بـ `sha256` لا يطابق، **عندما** يكتمل التنزيل، **إذن** يُحذف الملف، ويبقى الخط الاحتياطي، ويُرسل `font_fallback_used` مرة واحدة.
3. **بافتراض** خط لا يحوي U+20C1، **عندما** يُرسم `PriceText`، **إذن** يظهر رمز الريال بالشكل الرسمي لا مربعًا فارغًا (golden بخطوط حقيقية).

**THEME-07: الوضع الداكن**
1. **بافتراض** `mode = light_only` وجهاز في الوضع الداكن، **عندما** يُفتح التطبيق، **إذن** يكون التطبيق فاتحًا بالكامل.
2. **بافتراض** `mode = system_custom` و`colors.dark.surface = #101418`، **عندما** يتحول الجهاز إلى الداكن والتطبيق مفتوح، **إذن** يتحول التطبيق فورًا بالألوان الداكنة التي حددها التاجر.
3. **بافتراض** `logo_dark = null` والوضع داكن، **عندما** تُرسم الرئيسية، **إذن** يظهر الشعار الفاتح فوق خلفية فاتحة مستديرة.

**THEME-08: الترجمة وتبديل اللغة**
1. **بافتراض** جهاز بالإنجليزية وتاجر يدعم اللغتين، **عندما** يُفتح التطبيق أول مرة، **إذن** يظهر بالإنجليزية وLTR دون شاشة اختيار لغة.
2. **بافتراض** المتسوق في صفحة منتج بالعربية، **عندما** يغيّر اللغة إلى الإنجليزية من الحساب ثم يعود، **إذن** ينقلب الاتجاه خلال 300 ms دون إعادة تشغيل، ويُعاد جلب اسم المنتج بـ `Accept-Language: en`، ويبقى الاختيار بعد إغلاق التطبيق.
3. **بافتراض** القيم 0 و1 و2 و3 و11 و100 و103، **عندما** يُعرض `cartItemsCount`، **إذن** تظهر الفئات zero وone وtwo وfew وmany وother وfew على الترتيب.
4. **بافتراض** نص بانر من التاجر بالعربية فقط والواجهة إنجليزية، **عندما** تُرسم الكتلة، **إذن** يظهر النص العربي بمحاذاة RTL داخل الواجهة الإنجليزية.

**THEME-09: RTL**
1. **بافتراض** PR يضيف `EdgeInsets.only(left: 8)` في `storefront_ui`، **عندما** يعمل CI، **إذن** يفشل الفحص ويسمي الملف والسطر.
2. **بافتراض** الواجهة العربية، **عندما** تُرسم صفحة فيها سهم رجوع وأيقونة بحث وأيقونة سلة، **إذن** ينعكس سهم الرجوع فقط.
3. **بافتراض** رقم الطلب `ZD-10234` داخل جملة عربية، **عندما** تُرسم، **إذن** يظهر الرقم كما هو بترتيب LTR، ولا تتبادل أجزاؤه مواضعها (golden).

**THEME-10: الأرقام والسعر**
1. **بافتراض** `numerals = latin` والواجهة عربية، **عندما** يُعرض سعر 1299.5 ريال، **إذن** يظهر الرمز U+20C1 على يسار «1,299.50» بينهما مسافة غير قابلة للكسر، في سطر واحد.
2. **بافتراض** `numerals = arabic_indic`، **عندما** يُعرض السعر نفسه، **إذن** يظهر «١٬٢٩٩٫٥٠» والرمز على يساره، ويبقى رقم الطلب والكوبون بأرقام لاتينية.
3. **بافتراض** الواجهة الإنجليزية، **عندما** يُعرض السعر، **إذن** يظهر الرمز على يسار الرقم أيضًا، وفق قاعدة ساما للغات كلها.
4. **بافتراض** `price_decimals = auto`، **عندما** يُعرض سعر 129.00، **إذن** يظهر «129» بلا كسور.
5. **بافتراض** إدخال «١٢٣» في حقل الكمية، **عندما** يُرسل الطلب إلى زد، **إذن** تكون القيمة المرسلة `123`.
6. **بافتراض** قارئ الشاشة مفعّل بالعربية، **عندما** يصل التركيز إلى سعر، **إذن** يُقرأ المبلغ متبوعًا بنص `priceSemantics`، ولا يُقرأ الرمز U+20C1 حرفًا مجهولًا.

**THEME-11: إمكانية الوصول**
1. **بافتراض** تكبير نص 200%، **عندما** تُرسم بطاقة المنتج وزر «أضف إلى السلة» وشاشة التحديث الإجباري، **إذن** لا يُقص السعر ولا نص الزر، وتمر widget tests.
2. **بافتراض** أي شاشة في `storefront_ui`، **عندما** تُشغَّل `meetsGuideline(labeledTapTargetGuideline)` و`androidTapTargetGuideline`، **إذن** تمر.
3. **بافتراض** TalkBack بالعربية على جهاز أندرويد من P-3، **عندما** يتنقل المختبر في بطاقة منتج مخفّض، **إذن** يسمع الاسم، ثم السعر الحالي، ثم «السعر قبل الخصم»، ثم «خصم 30 بالمئة»، بهذا الترتيب.

## 10. المصادر

- [ColorScheme.fromSeed](https://api.flutter.dev/flutter/material/ColorScheme/ColorScheme.fromSeed.html)، [FontLoader](https://api.flutter.dev/flutter/services/FontLoader-class.html)، [TextScaler](https://api.flutter.dev/flutter/painting/TextScaler-class.html)، [Icons.arrow_back](https://api.flutter.dev/flutter/material/Icons/arrow_back-constant.html)
- [Flutter: material_ui وcupertino_ui](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)، [WidgetSpan في RTL](https://docs.flutter.dev/release/breaking-changes/widgetspan-rtl-bidi-order)، [headingLevel](https://docs.flutter.dev/release/breaking-changes/semantics-header-heading-level)، [ملاحظات 3.47](https://docs.flutter.dev/release/release-notes/release-notes-3.47.0)
- [Flutter: Internationalization](https://docs.flutter.dev/ui/internationalization)، [توليد الترجمة في المصدر](https://docs.flutter.dev/release/breaking-changes/flutter-generate-i10n-source)
- [pub.dev/material_ui](https://pub.dev/packages/material_ui)، [material_color_utilities](https://pub.dev/packages/material_color_utilities)، [intl](https://pub.dev/packages/intl)، [hijri](https://pub.dev/packages/hijri)، [google_fonts](https://pub.dev/packages/google_fonts)
- [Google Fonts metadata](https://fonts.google.com/metadata/fonts)
- [Unicode: UnicodeData 17.0](https://www.unicode.org/Public/17.0.0/ucd/UnicodeData.txt)، [Unicode blog: Saudi riyal](https://blog.unicode.org/2025/03/support-for-new-saudi-riyal-currency.html)، [SAMA: L2/25-075](https://www.unicode.org/L2/L2025/25075-saudi-central-bank.pdf)
- [CLDR ar_SA.xml](https://github.com/unicode-org/cldr/blob/main/common/main/ar_SA.xml)
- [WCAG 2.2: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)، [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Material Design: Bidirectionality](https://m1.material.io/usability/bidirectionality.html)
- [Android 14: non-linear font scaling](https://developer.android.com/about/versions/14/features#non-linear-font-scaling)
- [WebKit bug 195745: letter-spacing وArabic](https://lists.webkit.org/pipermail/webkit-unassigned/2019-March/864618.html)
- [Packagist: opis/json-schema](https://packagist.org/packages/opis/json-schema)، [PyPI: fonttools](https://pypi.org/project/fonttools/)
- [Zid: Branding (Merchant API)](https://docs.zid.sa/branding-33664604e0)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/mobile_shopping_ux.md`، و`flutter_configurable_architecture.md`، و`zid_feature_capability_map.md`، و`reports/مزايا وتخصيص تطبيقات متاجر زد.md`
