# M03: الكتل والصفحات

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter (حزمة `storefront_ui`، والتطبيق، ومعاينة Flutter Web)، وLaravel (فهرس الكتل وقواعد الحماية)، وعقد JSON Schema مشترك مع Next.js |
| المتطلبات | F-S02, F-M03, F-M05، ويخدم F-M08 (المعاينة) وF-S03 وF-S07 |
| القرارات | ADR-0004, ADR-0006, ADR-0009, ADR-0010 |
| تعتمد على | M11 (يخزّن الصفحات ويهيّئ بياناتها ويقدّمها)، وM02 (الـ tokens ونمط البطاقة والأيقونات)، وM07 (موجّه الأفعال والروابط)، وM08 (تصنيف الأحداث وجمعها)، وM09 (الشريط الإعلاني العام)، وM04 (ورقة الخيارات والسلة وشاشة القائمة)، وM01 (الإقلاع والشبكة والتخزين المؤقت والأعلام)، وM15 (المحرر وبروتوكول المعاينة)، وM01 وM13 (اللقطة المضمّنة وقت البناء) |
| بادئة القصص | BLK |

## 1. الغرض والنطاق

هذه الوحدة تعرّف **ما هي الكتلة** وكيف تُرسم. فهي تملك عقد JSON لكل نوع كتلة، وغلاف الصفحة، وقائمة الأفعال المغلقة، وسجل الكتل في Dart، وحاجز الأخطاء، وقواعد التوافق مع الإصدارات القديمة، وإعداد وحدات الشاشات الأصلية (F-M05). أما تخزين الصفحات ونسخها ونشرها وتقديمها وتهيئة بياناتها في الخادم فمن M11.

### داخل الإصدار الأول (Must)
1. حزمة `storefront_ui` بـ Dart خالص، تُبنى لـ iOS وأندرويد ولمعاينة Flutter Web (ADR-0004 البند 7).
2. غلاف الصفحة (envelope) بصيغتيه: صيغة التحرير التي تحفظها اللوحة، وصيغة التسليم التي يرسمها التطبيق.
3. سجل الكتل، وترويسة الكتل المدعومة، ورسم النوع المجهول فارغًا، وحاجز أخطاء لكل كتلة.
4. الأفعال الثمانية المغلقة وعقدها مع موجّه M07.
5. الكتل الاثنتا عشرة في PRD 5.4: `hero_slider`، و`banner_grid`، و`category_strip`، و`product_carousel`، و`product_grid`، و`announcement_bar`، و`countdown`، و`trust_badges`، و`rich_text`، و`spacer`، و`zid_theme_section`، و`brand_strip` (خلف علم).
6. إعداد الشاشات الأصلية: ترتيب وحدات صفحة المنتج وإخفاؤها، ونمط بطاقة المنتج، ونمط الشريط السفلي وأيقوناته، والشريط العلوي.
7. مكان مخطط JSON لكل كتلة، والتحقق منه، وتوليد أنواع Dart وTypeScript منه.
8. أداء الرسم: slivers، والتحميل الكسول، واختيار مقاس الصورة، وblurhash.
9. أحداث الظهور والنقر لكل كتلة، بالأسماء التي يعتمدها M08.

### لاحقًا (Should وCould)
كتل `stories`، و`video_strip`، و`buy_again`، و`recently_viewed`، و`loyalty_card`، و`testimonials`، و`video`، و`flash_deal`. واستهداف الكتلة حسب الشريحة واختبارات A/B (F-M13). وتبويب سفلي مخصص يفتح صفحة. والقسم 9.3 يلخّصها.

### ليس من مسؤولية هذه الوحدة
- تخزين الصفحات والمسودات والنسخ والنشر والجدولة وCDN: M11.
- قيم الـ tokens والهويات الجاهزة والخطوط: M02. وهذه الوحدة تستهلك `ThemeExtension<BrandTokens>` فقط.
- جدول المسارات وتحويل روابط زد إلى شاشات: M07.
- الشاشات الأصلية نفسها (صفحة المنتج، والقائمة، والسلة): M04. وهذه الوحدة تعرّف عقد ترتيب وحداتها فقط.
- سلوك الشريط الإعلاني العام (الإغلاق، والتكرار، والنطاق): M09.
- واجهة المحرر وبروتوكول المعاينة من جهة اللوحة: M15.

## 2. المكونات حسب الطبقة

### 2.1 Flutter

**SDK**: Flutter 3.47.x المستقر. توثيق Flutter يعكس 3.47، و3.50 ما زال «tentative» في صفحة الإصدارات ([Flutter release notes](https://docs.flutter.dev/release/release-notes)). يُثبَّت الإصدار في `.fvmrc` أو ما يحدده الدليل الهندسي (07).

| الحزمة | الإصدار | الاستخدام هنا |
|---|---|---|
| `flutter_riverpod` | 3.5.0 | حالة كل كتلة، ومزوّد الصفحة `pageEnvelopeProvider.family` |
| `riverpod_annotation` و`riverpod_generator` | 4.0.8 و4.0.10 | توليد المزوّدات |
| `freezed` و`freezed_annotation` | 4.0.3 و3.1.0 | نماذج الغلاف والإعدادات غير القابلة للتعديل |
| `json_serializable` و`json_annotation` | 6.15.2 و4.12.0 | التحويل من JSON. يتجاهل الحقول المجهولة افتراضيًا، وهذا مطلوب للتوافق الأمامي |
| `build_runner` | 2.17.1 | التوليد |
| `cached_network_image` و`flutter_cache_manager` | 4.0.6 و3.5.0 | الصور مع تخزين على القرص. على الويب بلا تخزين ([pub.dev](https://pub.dev/packages/cached_network_image)) |
| `flutter_blurhash` | 0.9.1 | عنصر نائب للصور. فك فقط، وفيه `optimizationMode` ([pub.dev](https://pub.dev/packages/flutter_blurhash)) |
| `visibility_detector` | 0.4.0+2 | قياس الظهور للتحليلات وإيقاف المؤقتات خارج الشاشة. يعمل على الويب ([pub.dev](https://pub.dev/packages/visibility_detector)) |
| `smooth_page_indicator` | 3.0.0 | مؤشر شرائح `hero_slider` |
| `hijri` | 3.0.1 | تسمية هجرية (أم القرى) في `countdown` ([pub.dev](https://pub.dev/packages/hijri)) |
| `intl` | 0.20.3 | تنسيق التاريخ والأرقام |
| `pub_semver` | 2.2.1 | مقارنة `min_app_version` على الجهاز |
| `widgetbook` | 3.25.0 | كتالوج حي لكل كتلة بكل حالاتها، وهو المرجع البصري (D-08) |
| `alchemist` | 0.14.1 | اختبارات golden، بنمط CI الذي يستبدل النص بمربعات ثابتة ([pub.dev](https://pub.dev/packages/alchemist)) |
| `go_router` | 18.1.4 | لا تستورده الحزمة. يستخدمه M07 خلف واجهة `ActionHandler` |

**قاعدة**: `storefront_ui` لا تستورد أي إضافة خاصة بالجوال (`webview_flutter`، و`url_launcher`، و`sentry_flutter`، والتخزين). كل ما يخص المنصة يمر عبر واجهات تُحقن من التطبيق، ولها نسخ وهمية في المعاينة.

**هيكل الحزمة**

```text
packages/storefront_ui/
  lib/storefront_ui.dart                  # التصدير العام
  lib/src/contract/                       # نماذج الغلاف والأفعال والأنواع المشتركة (freezed)
    page_envelope.dart  block_node.dart  action.dart  visibility.dart
    image_source.dart  localized.dart  product_card_data.dart
  lib/src/registry/
    block_definition.dart  block_registry.dart  supported_blocks.dart  catalog_rev.dart
  lib/src/runtime/
    page_renderer.dart        # CustomScrollView من الأوصاف
    block_boundary.dart       # حاجز الأخطاء + BlockScope
    error_widget.dart         # storefrontErrorWidgetBuilder
    impression_tracker.dart   # قواعد الظهور والنقر
    server_clock.dart         # فرق ساعة الخادم
  lib/src/services/           # واجهات تُحقن من التطبيق
    action_handler.dart  analytics_sink.dart  product_paging.dart
    cart_commands.dart  error_reporter.dart  image_url_policy.dart
  lib/src/blocks/<type>/      # props.dart + definition.dart + widgets/
  lib/src/shell/              # product_card/ tab_bar/ top_bar/ pdp_modules/
  lib/src/preview/            # نقطة دخول الويب ومستقبل postMessage
  test/contract/              # يقرأ fixtures العقد
  test/golden/
widgetbook/                   # تطبيق الكتالوج
```

### 2.2 Laravel (جزء M03 داخل وحدة `AppConfig`)
- `BlockCatalog`: يقرأ `catalog.json` من مجلد العقود، ويعرف أي `type@v` تدعمه كل مراجعة عقد (`schema_version`). يستخدمه M11 عند تقديم الصفحة لإسقاط الكتل أو تخفيضها.
- `BlockDownConverters`: محوّل لكل كتلة رُفع إصدارها، يحوّل `v2` إلى `v1` للملفات القديمة، أو يعلن أن التحويل مستحيل فتُسقط الكتلة.
- `GuardrailLinter`: قواعد الحماية القابلة للفحص في الخادم (القسم 5.6)، بمعرّفات ثابتة يعرضها المحرر.
- مكتبة التحقق: `opis/json-schema` 2.6.1، وتدعم draft 2020-12 ([Packagist](https://packagist.org/packages/opis/json-schema)).

### 2.3 Next.js (ما يستهلكه M15 من هذه الوحدة)
- أنواع TypeScript مولدة بـ `json-schema-to-typescript` 16.0.0.
- تحقق فوري في المحرر بـ Ajv 8.20.0 بوضع draft 2020-12 ([Ajv](https://ajv.js.org/json-schema.html))، من المخطط نفسه الذي يتحقق به الخادم.
- تلميحات المحرر من الكلمة المخصصة `x-ui` داخل كل مخطط: المجموعة (أساسي أو متقدم)، والترتيب، والتسمية بلغتين، ونوع الحقل.
- يبقى `zod` (ADR-0010) لنماذج اللوحة غير المرتبطة بالكتل. وZod 4 يوفر `z.fromJSONSchema()` لكنه موسوم «experimental» ([zod.dev](https://zod.dev/json-schema))، فلا يُعتمد عليه لعقد الكتل.

### 2.4 العقد المشترك: مكان المخططات والتوليد

المصدر الوحيد هو مجلد `06-api/blocks/` في مستودع المواصفات (ADR-0001 وADR-0010). والمستودعات الثلاثة تستهلكه نسخةً مثبتة:

```text
06-api/blocks/
  catalog.json                      # schema_version الحالي، وقائمة type@v، والأعلام، وmin_app_version
  envelope.authoring.schema.json    # ما تحفظه اللوحة
  envelope.delivery.schema.json     # ما يستلمه التطبيق
  action.schema.json                # الأفعال الثمانية
  common/                           # localized_text, asset_ref, image_source, color_ref,
                                    # visibility, product_source, product_card_data, block_header
  hero_slider/
    v1.authoring.schema.json
    v1.delivery.schema.json
    fixtures/                       # min.json, full.json, edge-*.json, invalid-*.json
  ...                               # مجلد لكل كتلة
  shell/app_shell.authoring.schema.json, app_shell.delivery.schema.json
```

**آلية الاستهلاك**:
1. كل تغيير في `06-api/blocks/` يرفع `schema_version` في `catalog.json` بمقدار 1 إن غيّر أي `type@v` أو الغلاف.
2. يُوسم المستودع `contracts-r{N}`.
3. كل مستودع كود يضم المجلد كـ git submodule مثبت على الوسم، ويفحص CI أن الثابت `kCatalogRev` في Dart والقيمة في Laravel وNext.js تساوي `N`.
4. **Dart**: النماذج تُكتب بـ `freezed` يدويًا لكل كتلة، ويحميها اختباران آليان: الأول يقرأ كل fixture صالح ويحلله ثم يعيد تسلسله ويقارن. والثاني يقارن أسماء الخصائص في مخطط التسليم بمفاتيح `toJson`. أداة توليد Dart من JSON Schema مثل `json_schema_to_freezed` تُجرَّب في BLK-01 خلال يوم واحد فقط. وإن لم تنتج اتحادات مختومة نظيفة تُترك.
5. **TypeScript**: `json2ts` يولّد `blocks.d.ts` في كل بناء.
6. **PHP**: لا توليد. يُحمَّل المخطط في `opis` ويُخزَّن مُجمّعًا في الذاكرة.
7. **ملفا التحقق**: سكربت في CI يولّد من كل مخطط تحرير ملفين: `draft` بحذف `required` و`minItems` و`minLength` آليًا، و`publish` كاملًا. M11 يمنع حفظ المسودة بفشل `draft` فقط، ويمنع النشر بفشل `publish` (M11 القسم 3.1).
8. **اختبار عقد ثلاثي**: كل fixture صالح يجب أن ينجح في opis وAjv وDart. وكل fixture يبدأ اسمه بـ `invalid-` يجب أن يفشل في opis وAjv.

**قواعد التطور (ADR-0004 البند 6)**:
- لا يُعاد استخدام حقل لمعنى آخر، ولا يُحذف حقل من مخطط التسليم ما دامت مراجعة تستخدمه.
- الحقل الجديد اختياري دائمًا، وله قيمة افتراضية موثقة في المخطط (`default`).
- التغيير الذي لا يُعبَّر عنه بحقل اختياري يرفع `v` للكتلة، ويُكتب له محوّل تخفيض في `BlockDownConverters` يبقى مراجعتين على الأقل.
- مخطط التحرير صارم (`additionalProperties: false`). وقارئ التسليم في Dart متسامح ويتجاهل الحقول المجهولة.
- فحص lint في CI: عدد الخصائص ذات `x-ui.group = "basic"` لا يتجاوز 7 لكل كتلة (F-M03).

## 3. التدفقات

### 3.1 رسم صفحة من الغلاف في التطبيق
1. يطلب M01 الصفحة `home` عبر `PageRepository` (عقد في القسم 5.2)، فيعيد أولًا آخر غلاف مخزّن على القرص لنفس `(page, locale, schema_version)`. وإن لم يوجد، يعيد غلاف الصفحة من اللقطة المضمّنة في الملف التنفيذي `assets/bootstrap/snapshot.json`. واللقطة يملكها M01 وتولّدها أداته `tool/make_snapshot.dart` في خط البناء (M13)، وفيها غلافا `home` و`shell` بصيغة التسليم لكل لغة مفعّلة.
2. يُحلَّل JSON. إن تجاوز حجمه 64 KB على الجوال يُحلَّل في `Isolate.run`. وعلى الويب يُحلَّل في الخيط الرئيسي.
3. يُحلَّل كل عنصر في `blocks[]` منفردًا داخل `try/catch`:
   - النوع مسجّل والإصدار مدعوم: يُنشأ `BlockInstance`.
   - النوع أو الإصدار مجهول: يُنشأ `UnknownBlock` (القسم 3.4).
   - فشل التحليل: تُسقط الكتلة ويُرسل `block_render_error` بـ `phase = parse`.
4. تُطبَّق قواعد الظهور على الجهاز: `visible`، و`starts_at` و`ends_at` مقارنةً بساعة الخادم (القسم 5.5)، و`platforms`، و`min_app_version` و`max_app_version` مقارنةً بإصدار الملف التنفيذي، و`disabled_blocks` من endpoint الأعلام (M12).
5. يبني `PageRenderer` شاشة `CustomScrollView` واحدة. لكل كتلة sliver واحد يبنيه الإطار نفسه من وصف التخطيط الذي تعيده الكتلة (القسم 5.4)، داخل `BlockBoundary`.
6. يُزال السبلاش الأصلي (M01). ثم يعيد `PageRepository` التحقق في الخلفية بـ `If-None-Match`.
7. إن وصل غلاف جديد (200) يُخزَّن، ولا يُستبدل المعروض إلا عند التنقل التالي إلى الصفحة، أو فورًا إن كان موضع التمرير صفرًا ولم يلمس المستخدم الشاشة بعد (ADR-0006 البند 3).
8. إن فشل الطلب (شبكة أو 5xx) تبقى النسخة المعروضة، ويُعاد المحاولة بتأخير أسي (30 ثانية، ثم دقيقتان، ثم 10 دقائق) أو عند عودة الشبكة.

### 3.2 دورة حياة الكتلة على الشاشة
1. `BlockBoundary` يضع `BlockScope` (InheritedWidget يحمل `block_id` و`type` و`position` و`page_version`) فوق الكتلة.
2. يستدعي دالة البناء داخل `try/catch`. الاستثناء المتزامن يحوّل الكتلة إلى `SizedBox.shrink()` ويُرسل `block_render_error` بـ `phase = build`.
3. الأخطاء في العناصر الأبناء لا تصعد في Flutter، بل تستبدل العنصر المعطوب بـ `ErrorWidget.builder` ([ErrorWidget.builder](https://api.flutter.dev/flutter/widgets/ErrorWidget/builder.html)). لذلك تصدّر الحزمة `storefrontErrorWidgetBuilder`، ويثبّته M01 في `main`. وهو يعيد `_CollapsedError` الذي يقرأ `BlockScope.maybeOf(context)` من موضعه في الشجرة، فيرسل `block_render_error` منسوبًا إلى الكتلة (`phase = descendant`) ويرسم `SizedBox.shrink()`. وفي وضع debug والمعاينة يرسم مربعًا أحمر يحمل `type@v` و`block_id`.
4. يبدأ `ImpressionTracker` القياس بـ `VisibilityDetector` بفاصل تحديث 250 ms. الظهور يُحسب حين تكون 50% من الكتلة مرئية لمدة متصلة لا تقل عن ثانية، مرة واحدة لكل `(page_version, block_id)` في الجلسة، وهو تعريف M08.
5. المؤقتات (تشغيل السلايدر الآلي، وعداد `countdown`، وحركة الشريط) تعمل فقط حين تكون الكتلة مرئية بنسبة 50% أو أكثر، والتطبيق في الواجهة.

### 3.3 تنفيذ فعل
1. يضغط المستخدم عنصرًا يحمل `action`.
2. ترسل الكتلة `block_click` أولًا (القسم 5.7)، ثم تستدعي `ActionHandler.handle(action, ActionContext(blockId, itemIndex, pageKey))`.
3. ينفّذ M07 الفعل الملاحي (`open_*` و`search` و`share`) عبر موجّهه، وينفّذ M04 فعلي `add_to_cart` و`apply_coupon` عبر `CartCommands`.
4. النتيجة `ActionResult`: `handled`، أو `unsupported` (يُرسل `action_unhandled`)، أو `failed(reason)` (رسالة قصيرة للمستخدم من M04 أو M07).
5. في المعاينة على الويب: الأفعال الملاحية لا تنقل، بل ترسل رسالة `block.clicked` إلى اللوحة. وأفعال السلة تعرض إشعارًا وهميًا.

### 3.4 النوع المجهول والكتلة المعطوبة
1. الخادم يُسقط مسبقًا ما لا تدعمه `schema_version` (القسم 5.3). لذلك وصول نوع مجهول للتطبيق خطأ في الخادم أو بناء تطويري.
2. في الإنتاج: `SizedBox.shrink()`، و`unknown_block` مرة واحدة لكل `(page_version, block_id)`.
3. في debug والمعاينة: بطاقة رمادية مكتوب عليها «كتلة غير مدعومة: type@v».
4. إن تجاوزت أخطاء نوع واحد 1% من مرات ظهوره في 24 ساعة، يضيفه فريق المنصة إلى `disabled_blocks` في الأعلام لذلك النطاق من إصدارات التطبيق، دون نشر صفحة جديدة (نمط Zalando في إزالة المكوّن المعطوب عن إصدارات بعينها ([Appcraft](https://engineering.zalando.com/posts/2024/05/appcraft.html))).

### 3.5 تحميل الصفحة التالية في `product_grid`
1. الخادم يهيّئ الصفحة الأولى، ويضع في `data.paging` وصف الاستعلام بصيغة زد (`categories`، و`sort_by`، و`order`، و`on_sale`، و`page_size`) و`next_page`.
2. حين يقترب التمرير من آخر 4 بطاقات، يستدعي `ProductPaging.fetch(query, page)`. ينفّذها M04 عبر `zid_client` إلى `GET products` في نطاق المتجر مباشرة ([List Products](https://docs.zid.sa/list-products-25510175e0)).
3. تُضاف النتائج إلى نفس `SliverGrid`. ويتوقف التحميل عند `max_items` أو حين يعود `next` فارغًا.
4. عند الفشل يظهر زر «أعد المحاولة» في آخر الشبكة، ولا تُفقد البطاقات المعروضة.

### 3.6 المعاينة في اللوحة (Flutter Web)
1. تُبنى نقطة الدخول `lib/src/preview/main_preview.dart` لـ Flutter Web وتُرفع إلى CDN (المسار يحدده M15).
2. تُضمَّن في iframe في صفحة Next.js ([Embedding Flutter web](https://docs.flutter.dev/platform-integration/web/embedding-flutter-web)).
3. البروتوكول `intishar.preview` يملكه M15. ترسل المعاينة `preview.ready` ومعها `supported_blocks` من `supportedBlocksHeader()`. وتردّ اللوحة بـ `host.hello`، ثم ترسل `draft.update` بمستند **صيغة التحرير** مع الـ tokens.
4. تحوّل المعاينة مستند التحرير إلى صيغة التسليم محليًا بـ `DraftAdapter` في Dart: تختار نص اللغة، وتحل الصور من كائنات الوسائط المرسلة مع المستند (`url` و`w` و`h` و`blurhash`)، وتدمج بيانات المنتجات والتصنيفات التي جلبتها اللوحة من `preview/hydrate` (M11) لكل كتلة تغيّر مصدرها. بذلك لا يحتاج تعديل خاصية عرض رحلة إلى الخادم، ويمكن بلوغ هدف 300 ms في SPK-15. واختبار عقد يقارن ناتج `DraftAdapter` بناتج محلّل M11 لنفس fixtures، والفرق المسموح صفر في الحقول.
5. تعيد المعاينة الرسم دون إعادة تحميل، وترد بـ `render.done`. والنقر على كتلة يرسل `block.clicked` بـ `block_id` و`item_index`، فيحدد المحرر الكتلة. وأي خطأ كتلة يُرسل `preview.error` بدل الحدث التحليلي.
6. رسالة التحديد من اللوحة تمرّر الصفحة إلى الكتلة وتؤطرها. وأسماء الرسائل كلها كما في M15 القسم 5.3.
7. شكل الرسائل ومهلها يملكها M15. وهذه الوحدة تنفذ الطرف المستقبل فقط، والقيود المعروفة: لا تخزين للصور على الويب، واختلاف طفيف في رسم الخطوط، وحِمل CanvasKit الأول. والأرقام المستهدفة من SPK-15.

### 3.7 إضافة نوع كتلة أو رفع إصداره (عملية تطوير)
1. يُكتب المخططان (تحرير وتسليم) وfixtures في `06-api/blocks/<type>/`، ويُرفع `schema_version`.
2. يُضاف التعريف في Dart، ويُسجَّل في `blockRegistry`، ويُضاف إلى Widgetbook وإلى اختبارات golden.
3. يُضاف المحلّل (resolver) في M11 إن احتاجت الكتلة بيانات من زد.
4. يُضاف المحوّل في `BlockDownConverters` إن كان رفع إصدار.
5. تبقى الكتلة الجديدة مخفية في كتالوج المحرر حتى يصل الإصدار الداعم لها إلى 80% من الأجهزة النشطة للتاجر (القيمة من M08). وقبل ذلك، تُسقط تلقائيًا للملفات الأقدم.

## 4. نموذج البيانات

### 4.1 غلاف التسليم (ما يستلمه التطبيق)

```json
{
  "schema_version": 3,
  "tenant": "t_8f2k1q",
  "page": {
    "key": "home",
    "kind": "home",
    "version": 1842,
    "segment": "default",
    "locale": "ar",
    "published_at": "2026-11-10T09:12:00Z",
    "rendered_at": "2026-11-10T09:12:41Z"
  },
  "theme_ref": {"version": 57},
  "shell_ref": {"version": 12},
  "blocks": [
    {
      "id": "b_h7k2m9qa",
      "type": "hero_slider",
      "v": 1,
      "props": {"height": "m", "autoplay": true, "interval_s": 5, "indicator": "dots", "margin": "edge", "corner": "inherit"},
      "data": {
        "slides": [
          {
            "image": {"src": "https://cdn.intishar.app/a/t_8f2k1q/med_91x/w960.webp", "tpl": "https://cdn.intishar.app/a/t_8f2k1q/med_91x/w{w}.webp",
                      "variants": [320, 640, 960, 1280], "w": 1290, "h": 860, "blurhash": "LKO2?U%2Tw=w]~RBVZRi};RPxuwH", "color": "#E8D9C4", "focal": [0.5, 0.42]},
            "title": "عروض رمضان",
            "subtitle": "خصم حتى 40%",
            "action": {"type": "open_category", "category_id": 412823}
          }
        ]
      },
      "visibility": {"starts_at": null, "ends_at": "2027-03-19T21:00:00Z", "platforms": ["ios", "android"], "min_app_version": null}
    },
    {
      "id": "b_p3n8z1rt",
      "type": "product_carousel",
      "v": 1,
      "props": {"title": "الأكثر مبيعًا", "limit": 12, "card": "inherit", "show_view_all": true, "quick_add": true, "out_of_stock": "last"},
      "data": {
        "products": [
          {"id": "6f06bc89-0cd4-490f-9894-238a93962416", "slug": "oud-royal-100ml", "name": "عود رويال 100 مل",
           "image": {"thumbnail": "https://img.zid.store/img/fit=scale-down,width=370,height=370/https://media.zid.store/x/y.png",
                     "small": "https://img.zid.store/img/fit=scale-down,width=770,height=770/https://media.zid.store/x/y.png",
                     "large": "https://img.zid.store/img/fit=scale-down,width=1000,height=1000/https://media.zid.store/x/y.png"},
           "price": 450.0, "sale_price": 360.0, "currency": "SAR", "discount_percentage": 20,
           "in_stock": true, "quantity": 3, "is_infinite": false, "has_options": false,
           "badge": {"text": "يباع سريعًا", "icon": "selling_fast"}, "rating": {"average": 4.6, "count": 128}}
        ],
        "view_all": {"type": "open_category", "category_id": 413265}
      }
    },
    {
      "id": "b_c9d4w2xs",
      "type": "banner_grid",
      "v": 1,
      "origin": {"kind": "zid_section", "section_id": "73a36651-ad5d-48e2-bac6-65b02091a576", "synced_at": "2026-11-10T06:00:03Z"},
      "props": {"layout": "2", "aspect": "auto", "gap": "s", "corner": "inherit", "margin": "inset"},
      "data": {"items": [{"image": {"src": "https://cdn.intishar.app/a/t_8f2k1q/med_77c/w640.webp", "w": 1080, "h": 1080, "variants": [320, 640, 960], "tpl": "https://cdn.intishar.app/a/t_8f2k1q/med_77c/w{w}.webp", "blurhash": "L6PZfSi_.AyE_3t7t7R**0o#DgR4", "color": "#F2F2F2"},
                          "alt": "عطور نسائية", "action": {"type": "open_category", "category_id": 32261}}]}
    }
  ]
}
```

**الفرق بين صيغة التحرير وصيغة التسليم** (يطبّقه محلّل M11):

| في التحرير | في التسليم |
|---|---|
| نص بلغتين `{"ar": "…", "en": "…"}` | سلسلة واحدة بلغة الطلب، أو بلغة المتجر الافتراضية إن كانت فارغة |
| `{"media_id": "med_91x", "crop": "2:1"}`، ولكل لغة صورة اختيارية | كائن `image_source` محلول (القسم 4.3) |
| مصدر بيانات `source` | `data` مهيّأ من الخادم، ويبقى `source` في الخادم |
| `zid_theme_section` | كتلة من النوع المحدد في `render_as` مع حقل `origin`، أو لا شيء |
| شروط ظهور تشمل الشريحة (لاحقًا) | تُحسم في الخادم ولا تصل |

### 4.2 حقول عقدة الكتلة

| الحقل | النوع | إلزامي | المعنى |
|---|---|---|---|
| `id` | string، النمط `^b_[a-z0-9]{8}$` | نعم | ثابت عبر النسخ. يُستخدم في التحليلات وفي ربط المعاينة. النسخ يولّد معرّفًا جديدًا |
| `type` | string | نعم | من `catalog.json` |
| `v` | integer ≥ 1 | نعم | إصدار عقد الكتلة |
| `props` | object | نعم | إعدادات العرض فقط |
| `data` | object | حسب الكتلة | بيانات مهيّأة، يكتبها الخادم وحده |
| `visibility` | object | لا | `visible`، و`starts_at`، و`ends_at`، و`platforms`، و`min_app_version`، و`max_app_version` |
| `origin` | object | لا | مصدر الكتلة إن جاءت من ربط بثيم زد |

### 4.3 الأنواع المشتركة (`06-api/blocks/common/`)

| النوع | الحقول | ملاحظات |
|---|---|---|
| `localized_text` | `ar`، و`en` | الحد الأقصى للطول يحدده كل حقل في مخطط كتلته |
| `asset_ref` (تحرير) | `media_id`، و`crop` اختياري، و`by_locale` اختياري لصورة إنجليزية مختلفة | البنرات كثيرًا ما تحمل نصًا عربيًا مدمجًا، لذا تُسمح صورة لكل لغة |
| `image_source` (تسليم) | `src`، و`tpl`، و`variants[]`، و`w`، و`h`، و`blurhash`، و`color`، و`focal` | `tpl` قالب يُستبدل فيه `{w}` بعرض من `variants` |
| `zid_image` (تسليم) | `thumbnail` (370)، و`small` (770)، و`large` (1000) | مقاسات `img.zid.store` كما رُصدت في 2026-11-10، والعرض بين قوسين. `medium` يساوي `small` و`full_size` يساوي `large`، فيُحذفان |
| `color_ref` | `token` من `primary`، و`secondary`، و`accent`، و`surface`، و`sale`، أو `hex` | `hex` في لوحة «متقدم» فقط، ويخضع لفحص التباين |
| `block_header` | `title`، و`show_view_all` | مشترك بين الكتل التي لها عنوان و«عرض الكل» |
| `product_source` (تحرير) | `kind` من `category` أو `manual` أو `on_sale` أو `newest` أو `best_selling`، و`category_id`، و`product_ids[]`، و`sort` | يُحوَّل إلى استعلام زد في M11 |
| `product_card_data` (تسليم) | الحقول في مثال 4.1 فقط | نحو 600 بايت للمنتج بدل نحو 27 KB في كائن زد الكامل (رُصد في `template-settings` لمتجر pcpalace) |

### 4.4 ما يُخزَّن على الجهاز

| المفتاح | المحتوى | الحد |
|---|---|---|
| `page:{key}:{locale}:{schema_version}` | الغلاف + `ETag` + وقت الجلب | آخر نسخة فقط لكل مفتاح، و5 MB لكل الصفحات |
| `shell:{locale}:{schema_version}` | إعداد الشاشات الأصلية | آخر نسخة |
| `imp:{session_id}` | أزواج `(page_version, block_id)` التي أُرسل ظهورها في الجلسة | في الذاكرة فقط، ويُمسح بانتهاء الجلسة (تعريف الجلسة من M08) |
| `server_clock_offset` | فرق ساعة الخادم بالثواني | يُحدَّث مع كل استجابة |

مكان التخزين ومكتبته يحددهما M01. والصور في مخزن `flutter_cache_manager`.

## 5. الواجهات والعقود

### 5.1 الترويسات التي يرسلها التطبيق
| الترويسة | مثال | الاستخدام |
|---|---|---|
| `X-App-Version` | `1.4.0+42` | للتسجيل وفحص `min_supported_app_version`. لا يدخل مفتاح CDN |
| `X-Platform` | `ios` أو `android` أو `web-preview` | للتسجيل وفلترة `platforms` في الخادم إن احتاجت |
| `X-Supported-Blocks` | `hero_slider@1,banner_grid@1,category_strip@1,...` | تولّده `supportedBlocksHeader()` من السجل. يفحص الخادم أنه يطابق `catalog.json` للمراجعة الموجودة في المسار |
| `If-None-Match` | `W/"9c1f…"` | إعادة التحقق |
| `Accept-Language` | `ar` | للاحتياط فقط، واللغة الحاسمة في المسار |

**لماذا لا تدخل قائمة الكتل في مفتاح CDN؟** مفتاح ADR-0006 هو `{tenant}/{page}/{segment}/{locale}/{schema_version}`. هذه الوحدة تعرّف `schema_version` بأنه **رقم مراجعة حزمة العقود** التي بُني بها الملف التنفيذي. ولكل مراجعة مجموعة `type@v` ثابتة في `catalog.json`. إذن قائمة الكتل المدعومة تُشتق من `schema_version`، فلا تحتاج أن تكون في المفتاح، ويبقى عدد نسخ الصفحة في CDN بعدد المراجعات النشطة (المتوقع 3 إلى 6). والترويسة تبقى (ADR-0004 البند 4) للتحقق والتسجيل: إن لم تطابق المراجعة، يرد الخادم بالنسخة المحسوبة من الترويسة نفسها مع `Cache-Control: private, no-store` ويسجّل تحذيرًا. وهذا لا يحدث إلا في بناء تطويري.

### 5.2 العقد مع M01 (تحميل الصفحة)

```dart
abstract interface class PageRepository {
  /// يعيد فورًا آخر نسخة محلية أو اللقطة المضمّنة، ثم نسخًا أحدث عند وصولها.
  Stream<PageSnapshot> watch(PageKey key, Locale locale);
  Future<void> revalidate(PageKey key, Locale locale);
}

final class PageSnapshot {
  final PageEnvelope envelope;
  final PageSource source; // bundled, disk, network
  final String? etag;
  final DateTime fetchedAt;
}
```

الطلب: `GET {api}/api/app/v1/t/{tenant}/pages/{page}/{segment}/{locale}/{schema_version}`، والتفاصيل في M11. وتنفيذ HTTP والتخزين من M01.

### 5.3 قواعد التوافق في الخادم (يطبّقها M11 بـ `BlockCatalog`)
1. لكل كتلة في النسخة المنشورة: إن كانت `type@v` موجودة في `catalog[schema_version]` تبقى.
2. وإلا، إن وُجد محوّل تخفيض إلى إصدار مدعوم، تُحوَّل.
3. وإلا تُسقط، ويُسجَّل `block_dropped{type, v, schema_version}` في سجلات الخادم.
4. الكتلة خلف علم ميزة (`brand_strip`) تُسقط إن كان العلم مغلقًا للتاجر.
5. `min_app_version` في الكتلة لا يُقيَّم في الخادم، لأن إصدار التطبيق ليس في مفتاح CDN. بل يقيّمه التطبيق (القسم 3.1، الخطوة 4).

### 5.4 سجل الكتل (Dart)

```dart
sealed class BlockLayout {}
/// صندوق واحد بعرض الصفحة؛ يضعه الإطار في SliverToBoxAdapter.
final class BoxLayout extends BlockLayout { BoxLayout(this.build); final WidgetBuilder build; }
/// شبكة أو قائمة طويلة؛ يضعها الإطار في SliverMainAxisGroup = رأس + SliverGrid.
final class GridLayout extends BlockLayout {
  GridLayout({required this.crossAxisCount, required this.childAspectRatio, required this.itemCount,
              required this.itemBuilder, this.header, this.footer});
  final int crossAxisCount; final double childAspectRatio; final int itemCount;
  final IndexedWidgetBuilder itemBuilder; final WidgetBuilder? header; final WidgetBuilder? footer;
}

abstract base class BlockDefinition<P extends Object> {
  const BlockDefinition();
  String get type;
  Set<int> get versions;                       // مثل {1}
  P parse(Map<String, Object?> json, int v);   // يرمي FormatException عند الخلل
  BlockLayout layout(BuildContext context, BlockInstance<P> block);
  bool isEmpty(BlockInstance<P> block) => false; // الكتلة الفارغة لا تُرسم
}

const blockRegistry = BlockRegistry([
  HeroSliderBlock(), BannerGridBlock(), CategoryStripBlock(), ProductCarouselBlock(),
  ProductGridBlock(), AnnouncementBarBlock(), CountdownBlock(), TrustBadgesBlock(),
  RichTextBlock(), SpacerBlock(), BrandStripBlock(),
]);
// لا يوجد تعريف لـ zid_theme_section: الخادم يحوّلها قبل التسليم (القسم 5.8.11).
```

**قاعدة الـ slivers**: كود الكتلة لا يبني sliver بنفسه أبدًا. الإطار يحوّل `BlockLayout` إلى sliver، لأن عنصر الخطأ البديل صندوق (box)، ولو وقع خطأ في موضع sliver لانكسر `CustomScrollView` كله. والإطار يستخدم `SliverMainAxisGroup` لتجميع رأس الكتلة مع شبكتها ([SliverMainAxisGroup](https://api.flutter.dev/flutter/widgets/SliverMainAxisGroup-class.html)).

### 5.5 الأفعال المغلقة والعقد مع M07

| الفعل | الحقول | من ينفذه | السلوك |
|---|---|---|---|
| `open_product` | `product_id` (uuid)، و`slug` اختياري | M07 ثم M04 | يفتح صفحة المنتج. والـ `slug` للمشاركة فقط |
| `open_category` | `category_id` (integer) | M07 ثم M04 | يفتح قائمة منتجات التصنيف |
| `open_page` | `page_key` | M07 ثم هذه الوحدة | يفتح صفحة كتل أخرى (صفحة حملة). إن لم تكن منشورة: `failed(page_not_found)` |
| `open_url_inapp` | `url` (https فقط) | M07 | إن طابق الرابط نطاق المتجر يحوّله M07 إلى شاشة أصلية (`/products/…`، و`/categories/{id}/{slug}`، و`/brands/…`). وإن كان من قائمة النطاقات الخارجية المعروفة (`wa.me` و`api.whatsapp.com` و`instagram.com` و`tiktok.com` و`snapchat.com`) يُسلَّم إلى النظام. وغير ذلك WebView داخل التطبيق |
| `add_to_cart` | `product_id`، و`quantity` (1 إلى 10) | M04 | إن كان للمنتج خيارات تفتح ورقة الخيارات، وإلا يُضاف مباشرة |
| `apply_coupon` | `code` (حتى 30 حرفًا) | M04 | يطبّق الكوبون على السلة، أو يحفظه ليُطبَّق عند أول إضافة إن كانت السلة فارغة |
| `share` | `url`، و`text` | M07 | ورقة المشاركة في النظام |
| `search` | `query`، و`filters` (`category_id`، و`brand_id`، و`on_sale`، و`price_min`، و`price_max`)، و`sort` | M07 ثم M04 | يفتح شاشة القائمة بالفلاتر. وهو مسار «عرض الكل» لمصادر `on_sale` و`newest` و`best_selling`، ومسار فتح العلامة التجارية من `brand_strip` |

العقد في Dart:

```dart
sealed class BlockAction { const BlockAction(); }
// OpenProduct, OpenCategory, OpenPage, OpenUrlInApp, AddToCart, ApplyCoupon, Share, Search
// + UnsupportedAction(type) لأي قيمة مجهولة: لا يُنفَّذ، ويُرسل action_unhandled.

abstract interface class ActionHandler {
  Future<ActionResult> handle(BlockAction action, ActionContext context);
}
```

- M07 يملك تحويل `BlockAction` إلى مسار، ويملك الدالة نفسها لروابط زد في الإشعارات والروابط العميقة، ويملك قائمة النطاقات الخارجية.
- الخادم (M11) يحوّل روابط زد في الأقسام المستوردة (`/categories/1261106/gaming-pc`) إلى أفعال بقواعد M07 نفسها. فإن لم يتعرف عليها تصبح `open_url_inapp`.
- لا يوجد فعل `open_brand` ولا `open_url_external` في ADR-0004. وقد غطّتهما هذه المواصفة بـ `search` و`open_url_inapp` دون خروج عن القائمة. وانظر القسم 8.

### 5.6 قواعد الحماية

| المعرّف | القاعدة | أين تُفرض | عند المخالفة |
|---|---|---|---|
| G-01 | ارتفاع `hero_slider` لا يتجاوز 50% من ارتفاع الشاشة | التطبيق عند الرسم | يُقص الارتفاع إلى الحد، ويُملأ الإطار بـ `cover` حول نقطة التركيز |
| G-02 | تباين النص الحي مع خلفيته 4.5:1 على الأقل ([WCAG 1.4.3](https://www.w3.org/TR/WCAG21/#contrast-minimum)) | المحرر والخادم، والتطبيق يختار لون `on` آليًا | لون مخصص يفشل: تحذير مع تصحيح آلي إلى أبيض أو أسود |
| G-03 | اختلاف نسب صور الشرائح أكثر من 10% | الخادم (من أبعاد الأصل) | تحذير مع اقتراح القص من M11 |
| G-04 | عرض صورة السلايدر والبنر الكامل 1080 px على الأقل | الخادم | تحذير دون 1080، وخطأ يمنع النشر دون 600 |
| G-05 | الحدود العددية: شرائح 1 إلى 8، وبنرات 1 إلى 6، وشارات ثقة 2 إلى 4، وتصنيفات يدوية حتى 20، وكاروسيل 4 إلى 24، وشبكة حتى 60 | المخطط | خطأ حفظ |
| G-06 | فاصل التشغيل الآلي 3 إلى 10 ثوانٍ، ولا تشغيل آلي مع «تقليل الحركة» | المخطط والتطبيق (`MediaQuery.disableAnimationsOf`) | — |
| G-07 | `countdown.ends_at` في المستقبل عند النشر، ولا يبعد أكثر من 90 يومًا | الخادم | خطأ يمنع النشر، وتحذير بعد 90 يومًا |
| G-08 | `product_grid` بلا حد أقصى (`max_items = 0`) واحدة فقط، وآخر كتلة في الصفحة | الخادم | خطأ يمنع النشر |
| G-09 | 40 كتلة على الأكثر في الصفحة، و6 كتل منتجات على الأكثر | المخطط والخادم | خطأ حفظ |
| G-10 | لا فاصلين `spacer` متتاليين | الخادم | تحذير |
| G-11 | الأطوال: نص الشريط 90 حرفًا، والعناوين 40، وعنوان الشارة 24، ووصفها 40 | المخطط | خطأ حفظ |
| G-12 | أهداف اللمس 48 dp على الأقل | التطبيق (اختبار golden وفحص `meetsGuideline`) | فشل الاختبار |
| G-13 | ترجمة إنجليزية ناقصة في متجر بلغتين | الخادم | تحذير، ويُعرض النص العربي احتياطًا |
| G-14 | هدف الفعل موجود: التصنيف أو المنتج موجود، والصفحة منشورة | الخادم | خطأ يمنع النشر |

### 5.7 أحداث التحليلات (يعتمد M08 التصنيف)

الأحداث `block_impression` و`block_click` و`unknown_block` موجودة في تصنيف M08 بنفس الأسماء والحقول. أما `block_item_impression` و`block_render_error` و`action_unhandled` و`block_data_refetch` فهي **مقترحة على M08** هنا، ولم تُضف إلى تصنيفه بعد.

كل حدث يحمل الحقول المشتركة: `tenant_id`، و`app_version`، و`platform`، و`locale`، و`page_key`، و`page_version`، و`segment`، و`schema_version`.

| الحدث | حقول إضافية | متى |
|---|---|---|
| `block_impression` | `block_id`، و`block_type`، و`block_v`، و`block_position`، و`origin` | 50% مرئي لمدة ثانية متصلة، مرة لكل `(page_version, block_id)` في الجلسة |
| `block_item_impression` | ما سبق + `item_index` | لشرائح `hero_slider` فقط: الشريحة 50% مرئية ثانية |
| `block_click` | ما سبق + `item_index`، و`target_id`، و`action_type` | قبل تنفيذ الفعل |
| `unknown_block` | `block_type`، و`block_v` | مرة لكل `(page_version, block_id)` |
| `block_render_error` | `block_id`، و`block_type`، و`phase` (parse أو build أو descendant أو image)، و`error_class` | عند الخطأ، بحد 5 لكل جلسة لكل كتلة |
| `action_unhandled` | `action_type`، و`reason` | فعل مجهول أو فشل |
| `block_data_refetch` | `block_id`، و`reason` (currency) | حين يعيد التطبيق جلب الأسعار بعملة أخرى |

### 5.8 مواصفة الكتل

لكل كتلة: الغرض، والإعدادات (7 أساسية على الأكثر)، والمصدر والتهيئة، والرسم، والحماية، والتحليلات، والحالات الحدية. والعنوان و«عرض الكل» من `block_header` المشترك. والظهور (`visibility`) مشترك ولا يُحسب ضمن السبعة.

#### 5.8.1 `hero_slider` (v1)
**الغرض**: بنرات متتابعة بعرض الشاشة أعلى الصفحة.

| الإعداد الأساسي | النوع والقيم | الافتراضي |
|---|---|---|
| `slides[]` | 1 إلى 8. كل شريحة: `image` (`asset_ref`)، و`action`، و`title` و`subtitle` و`cta_label` اختيارية بلغتين | — |
| `height` | `s` (30% من ارتفاع الشاشة) أو `m` (40%) أو `l` (50%) | `m` |
| `autoplay` | boolean | `true` |
| `interval_s` | 3 إلى 10 | 5 |
| `indicator` | `dots` أو `bar` أو `none` | `dots` |
| `margin` | `edge` (بلا هوامش) أو `inset` | `edge` |
| `corner` | `inherit` (من الـ tokens) أو `none` | `inherit` |

**متقدم**: `loop` (افتراضي true)، و`overlay_opacity` من 0 إلى 0.6 (افتراضي 0.35 حين يوجد نص)، و`text_align` (`start` أو `center`)، و`fit` (`cover` أو `contain`)، و`starts_at` و`ends_at` لكل شريحة.

**المصدر والتهيئة**: صور يرفعها التاجر إلى M11، أو قسم سلايدر مربوط من ثيم زد (5.8.11). يحل الخادم `asset_ref` إلى `image_source`، ويُسقط الشرائح المنتهية، ويحوّل النص إلى لغة الطلب.

**الرسم**:
- نسبة الإطار من أبعاد أول شريحة: `ratio = w / h`. والارتفاع `min(screenWidth / ratio, cap)` حيث `cap` نسبة `height` من ارتفاع الشاشة (G-01).
- `PageView.builder` يحترم الاتجاه: في RTL تكون الشريحة الأولى يمينًا والسحب معكوسًا. والحلقة اللانهائية بفهرس modulo.
- التشغيل الآلي يتوقف أثناء اللمس، وخارج الشاشة، وحين يكون التطبيق في الخلفية، ومع «تقليل الحركة».
- النص الحي يُرسم فوق تدرج من أسفل الصورة بشفافية `overlay_opacity`. ولونه `on_surface` المحسوب آليًا للتباين (G-02).
- المؤشر خارج الصورة أسفلها في `dots` و`bar`، بهدف لمس 48 dp.
- الصورة الأولى تُجلب مسبقًا بـ `precacheImage` بعد معرفة العرض.

**الحماية**: G-01، وG-02، وG-03، وG-04، وG-05 (8 شرائح)، وG-06.

**التحليلات**: `block_impression`، و`block_item_impression` لكل شريحة، و`block_click` بـ `item_index`.

| الحالة الحدية | السلوك |
|---|---|
| شريحة واحدة | لا تشغيل آلي ولا مؤشر |
| كل الشرائح منتهية الصلاحية على الجهاز | تُخفى الكتلة كلها |
| فشل تحميل صورة | يبقى blurhash أو اللون السائد بنفس الارتفاع، والشريحة قابلة للضغط |
| صورة شاهقة (نسبة أقل من 0.8) | يُقص الارتفاع بـ G-01 ويُملأ بـ `cover` حول `focal` |
| لا صورة إنجليزية | تُعرض العربية |
| شريحة بلا `action` | لا تأثير ضغط، ولا `block_click` |

#### 5.8.2 `banner_grid` (v1)
**الغرض**: بنر واحد أو شبكة بنرات ثابتة غير متحركة.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `layout` | `1`، و`2`، و`3`، و`4` (عمودان × صفان)، و`1+2` (كبير ثم صف من اثنين) | `2` |
| `items[]` | 1 إلى 6: `image`، و`action`، و`alt` بلغتين | — |
| `aspect` | `auto` (من الصورة الأولى)، و`1:1`، و`4:3`، و`3:4`، و`16:9`، و`2:1` | `auto` |
| `gap` | `none`، و`s` (8 dp)، و`m` (12 dp) | `s` |
| `corner` | `inherit` أو `none` | `inherit` |
| `margin` | `edge` أو `inset` | `inset` |
| `title` | `localized_text` اختياري | — |

**المصدر**: رفع التاجر، أو استيراد من أقسام البنرات في زد. والتهيئة كما في `hero_slider`.

**الرسم**: `BoxLayout` من صفوف وأعمدة ثابتة بـ `AspectRatio`. وإن زاد عدد العناصر عن خانات التخطيط تتكرر الصفوف بنفس النمط. في `1+2` العنصر الأول بنسبة `aspect` بعرض كامل، والباقي بنسبة مضاعفة الارتفاع.

**الحماية**: G-04 (العرض الأدنى بحسب عرض الخانة)، وG-05، وتحذير إن لم يقسم عدد العناصر على التخطيط.

**التحليلات**: `block_impression`، و`block_click` بـ `item_index`.

| الحالة الحدية | السلوك |
|---|---|
| العدد لا يملأ الصف الأخير | آخر عنصر يأخذ عرض الصف كله |
| `alt` فارغ | يُقرأ `Semantics` بعنوان التصنيف أو المنتج الهدف إن وُجد |
| فشل صورة | اللون السائد، ويبقى الضغط |

#### 5.8.3 `category_strip` (v1)
**الغرض**: وصول سريع إلى التصنيفات.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `style` | `circles` (قائمة أفقية)، و`cards` (أفقية)، و`grid` (شبكة) | `circles` |
| `source` | `top_level` (تلقائي) أو `manual` | `top_level` |
| `category_ids[]` | حتى 20، حين يكون المصدر يدويًا | — |
| `size` | `s` أو `m` أو `l` | `m` |
| `show_names` | boolean | `true` |
| `title` | `localized_text` | — |
| `show_view_all` | boolean | `true` |

**متقدم**: `limit` (4 إلى 20، افتراضي 12)، و`columns` للشبكة (3 أو 4)، و`overrides[]` لصورة بديلة يرفعها التاجر لتصنيف بعينه.

**المصدر والتهيئة**: `GET categories` من نطاق المتجر عبر ذاكرة M10، ثم يضع الخادم في `data.categories[]`: `id`، و`name` بلغة الطلب، و`image` (`zid_image` أو صورة التاجر البديلة)، و`products_count`. والتصنيفات غير المنشورة أو المحذوفة تُسقط.

**الرسم**: `circles` و`cards` قائمة `ListView.builder` أفقية بـ `itemExtent` ثابت (s: 64، وm: 80، وl: 96 dp للصورة). و`grid` يُرسم `GridLayout`. والاسم سطران على الأكثر مع ellipsis. وزر «عرض الكل» يفتح تبويب التصنيفات.

**الحماية**: G-05 (20 يدويًا)، وتحذير إن كان أكثر من نصف التصنيفات بلا صورة.

**التحليلات**: `block_impression`، و`block_click` بـ `target_id = category_id`.

| الحالة الحدية | السلوك |
|---|---|
| تصنيف بلا صورة | دائرة بلون `secondary` وأول حرف من الاسم |
| صفر تصنيفات بعد الفلترة | تُخفى الكتلة |
| حُذف تصنيف يدوي من زد | يُسقط عند التهيئة التالية (webhook `category.delete`) ويظهر تحذير في المحرر |

#### 5.8.4 `product_carousel` (v1)
**الغرض**: صف أفقي من بطاقات المنتجات.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `source` | `product_source`: `category`، أو `manual`، أو `on_sale`، أو `newest`، أو `best_selling` | `best_selling` |
| `limit` | 4 إلى 24 | 12 |
| `card` | `inherit` (من إعداد البطاقة في الـ shell)، أو `classic`، أو `horizontal`، أو `framed`، أو `minimal` | `inherit` |
| `title` | `localized_text` | — |
| `show_view_all` | boolean | `true` |
| `quick_add` | boolean | من الـ shell |

**متقدم**: `sort` لمصدر التصنيف (`popularity`، و`price_asc`، و`price_desc`، و`newest`، و`display_order`)، و`out_of_stock` (`last` أو `hide`، افتراضي `last` وفق F-S05)، و`visible_cards` (2.2 أو 2.5 أو 3.2، يحدد عرض البطاقة).

**المصدر والتهيئة**: M11 يحوّل المصدر إلى `GET products` في زد: `category` إلى `categories={id}`، و`on_sale` إلى `on_sale=true`، و`newest` إلى `sort_by=created_at&order=desc`، و`best_selling` إلى `sort_by=popularity_order&order=desc`، و`manual` إلى جلب كل معرّف ([List Products](https://docs.zid.sa/list-products-25510175e0)). يُختصر كل منتج إلى `product_card_data`، وتُرتّب النافدة آخرًا أو تُحذف. و`data.view_all` فعل محسوب: `open_category` لمصدر التصنيف، و`search` بفلتر للبقية، ولا شيء للمصدر اليدوي.

**الرسم**: `ListView.builder` أفقي بـ `itemExtent = (viewportWidth - padding) / visible_cards`. والبطاقة من `shell/product_card` (القسم 5.9.2). والسعر شامل الضريبة كما تعيده زد. وشارة «باقي N» حين `quantity` من 1 إلى عتبة المتجر (`low_stock_quantity_threshold`، والافتراضي 10 إن غاب). والإضافة السريعة تستدعي `add_to_cart`، وإن كان `has_options = true` تفتح ورقة الخيارات (M04).

**العملة**: الأسعار المهيّأة بعملة المتجر الافتراضية. إن كانت cookie `locale` في `zid_client` تشير إلى عملة أخرى، يعيد التطبيق جلب المنتجات نفسها من زد (`GET products` بالمعرّفات أو بالاستعلام) ويرسل `block_data_refetch`.

**الحماية**: G-05، وG-09، وتحذير في المحرر إن كان المصدر يعيد أقل من 4 منتجات.

**التحليلات**: `block_impression`، و`block_click` بـ `target_id = product_id` و`action_type` (`open_product` أو `add_to_cart`).

| الحالة الحدية | السلوك |
|---|---|
| المصدر فارغ | تُخفى الكتلة في التطبيق. والمعاينة تعرض «لا منتجات في هذا المصدر» |
| منتج حُذف بعد التهيئة | فتحه يعرض شاشة «غير متوفر» من M04. ويُسقط عند التهيئة التالية |
| السعر تغيّر بعد التهيئة | صفحة المنتج والسلة تعرضان السعر الحي. والبطاقة تتحدث عند التهيئة التالية (القسم 7) |
| `best_selling` لا يطابق «الأكثر مبيعًا» فعليًا | انظر القسم 8 |

#### 5.8.5 `product_grid` (v1)
**الغرض**: شبكة منتجات، وقد تكون آخر الصفحة بتمرير لا نهائي.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `source` | `product_source` | `newest` |
| `columns` | 2 أو 3 | 2 |
| `page_size` | 12 أو 24 | 12 |
| `max_items` | 0 (بلا حد، للكتلة الأخيرة فقط) أو 12 إلى 60 | 24 |
| `card` | كما في الكاروسيل | `inherit` |
| `title` | `localized_text` | — |
| `show_view_all` | boolean | `true` |

**متقدم**: `sort`، و`out_of_stock`، و`quick_add`.

**المصدر والتهيئة**: الصفحة الأولى كما في الكاروسيل، و`data.paging = {"query": {...}, "next_page": 2}` للمصادر القائمة على استعلام. والمصدر اليدوي بلا ترقيم.

**الرسم**: `GridLayout` بنسبة البطاقة من الـ shell. والترقيم في القسم 3.5. و«عرض الكل» يظهر بعد آخر عنصر إن وصلت الشبكة إلى `max_items`.

**الحماية**: G-08، وG-09.

**التحليلات**: كالكاروسيل، ويُضاف `page` إلى `block_click`.

| الحالة الحدية | السلوك |
|---|---|
| فشل الصفحة التالية | زر «أعد المحاولة» في آخر الشبكة |
| المتجر يعيد عناصر مكررة بين الصفحات | تُزال المكررات بالمعرّف |
| بحث زد يعيد 10 عناصر دائمًا | لا يُستخدم `products/search` هنا، بل `products` فقط |

#### 5.8.6 `announcement_bar` (v1)، بالتنسيق مع M09
**الغرض**: شريط نصي قصير داخل الصفحة. **والشريط العام** الثابت أعلى الشاشات يملك سلوكه M09، ويستخدم الويدجت نفسه `AnnouncementBarView` والمخطط نفسه للخصائص `announcement_bar_props`.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `text` | `localized_text` حتى 90 حرفًا | — |
| `action` | فعل اختياري | — |
| `style` | `static` أو `marquee` | `static` |
| `background` | `color_ref` | `primary` |
| `icon` | مفتاح من مجموعة الأيقونات (M02) أو لا شيء | — |

**متقدم**: `speed` للحركة (`slow` أو `normal`)، و`text_color` (يخضع لـ G-02).

**المصدر**: يدوي، أو اقتراح عند الاستيراد من `settings.announcement_bar` أو من قسم `advertisement-bar.jinja`.

**الرسم**: ارتفاع 36 dp. النص سطر واحد. في `marquee` يتحرك في اتجاه القراءة، ويتوقف مع «تقليل الحركة» أو خارج الشاشة فيصبح ثابتًا بسطرين على الأكثر.

**تقسيم المسؤولية مع M09**:

| البند | M03 | M09 |
|---|---|---|
| الويدجت والمخطط والتباين | ✔ | يستهلك |
| الكتلة داخل الصفحة (تتمرر معها) | ✔ | — |
| الشريط العام في الـ shell، ونطاقه (كل الصفحات أو الرئيسية)، وإغلاقه وتذكّر الإغلاق، وانتهاؤه | — | ✔ |
| التخزين والنشر | M11 | M11 |

**التحليلات**: `block_impression`، و`block_click`. وللشريط العام أحداث M09.

| الحالة الحدية | السلوك |
|---|---|
| الشريط العام والكتلة بنفس النص في الرئيسية | تحذير في المحرر |
| نص أطول من العرض في `static` | سطران ثم ellipsis |

#### 5.8.7 `countdown` (v1)
**الغرض**: عدّاد تنازلي لعرض أو موسم.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `ends_at` | تاريخ ووقت UTC (يُدخل بتوقيت المتجر) | — |
| `title` | `localized_text` | — |
| `style` | `boxes`، أو `inline`، أو `banner` (بصورة خلفية) | `boxes` |
| `background_image` | `asset_ref` لنمط `banner` | — |
| `action` | فعل اختياري | — |
| `on_end` | `hide` أو `ended_text` | `hide` |
| `show_hijri` | boolean: «ينتهي 29 رمضان» | `false` |

**متقدم**: `source` (`manual` أو `product_sale_end` مع `product_id`، فيُقرأ `purchase_restrictions.sale_price_period_end` ([Get Product](https://docs.zid.sa/get-product-by-slug-25772175e0)))، و`ended_text`.

**التهيئة**: لمصدر المنتج، يملأ الخادم `data.ends_at` من حقل المنتج، ويُخفي الكتلة إن كان الحقل فارغًا.

**الرسم**:
- الوقت المتبقي = `ends_at - (now() + server_clock_offset)`. والفرق مأخوذ من ترويسة `Date` لآخر استجابة من M11، فتغيير ساعة الجهاز لا يغيّر العداد.
- يتحدث كل ثانية عبر `ValueNotifier` يعيد رسم الأرقام فقط، وفقط حين تكون الكتلة مرئية.
- أيام وساعات ودقائق وثوانٍ، والأرقام عربية أو لاتينية حسب إعداد M02.
- التسمية الهجرية بتقويم أم القرى عبر `hijri` 3.0.1، وهي تسمية تقريبية قد تختلف يومًا عن الرؤية، فتُكتب «يوافق تقريبًا».

**الحماية**: G-07.

**التحليلات**: `block_impression`، و`block_click`.

| الحالة الحدية | السلوك |
|---|---|
| انتهى العد والصفحة مفتوحة | `hide`: تُطوى الكتلة بانتقال 200 ms (بلا انتقال مع تقليل الحركة). أو `ended_text` |
| فرق ساعة الخادم غير معروف (لقطة مضمّنة دون شبكة) | ساعة الجهاز، ويُصحَّح عند أول استجابة |
| `ends_at` بعد أكثر من 99 يومًا | تحذير G-07، ويُعرض «99+ يوم» |

#### 5.8.8 `trust_badges` (v1)
**الغرض**: وعود المتجر (توصيل سريع، واسترجاع، ومنتجات أصلية، ودفع آمن). وتُستخدم الكتلة نفسها وحدةً في صفحة المنتج (F-S07).

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `items[]` | 2 إلى 4: `icon` (مفتاح من مجموعة مختارة: `fast_delivery`، و`free_shipping`، و`easy_returns`، و`authentic`، و`secure_payment`، و`cash_on_delivery`، و`installments`، و`support`، و`gift`) أو `asset_ref`، و`title` حتى 24 حرفًا، و`subtitle` حتى 40 | — |
| `layout` | `row`، أو `grid`، أو `list` | `row` |
| `style` | `plain` أو `card` | `plain` |
| `icon_color` | `color_ref` | `primary` |
| `title` | `localized_text` اختياري | — |

**المصدر**: يدوي. وعند الاستيراد يُقترح من `settings.badges[]` (مثل `quick_delivery`) ومن أقسام الميزات في الثيم.

**الرسم**: `row` يقسم العرض بالتساوي (4 على الأكثر)، و`grid` عمودان، و`list` صف لكل شارة مع النص الفرعي.

**الحماية**: G-05، وG-11. ولا تُرسم شعارات طرق الدفع في هذا الإصدار، لأن التطبيق لا يعرف الطرق المفعّلة فعلًا في المتجر.

**التحليلات**: `block_impression` فقط إن لم يكن للشارات أفعال.

#### 5.8.9 `rich_text` (v1)
**الغرض**: نص منسق قصير، مثل نبذة أو سياسة مختصرة.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `content` | مستند منظم لكل لغة (أدناه)، 2,000 حرف لكل لغة على الأكثر | — |
| `align` | `start` أو `center` | `start` |
| `size` | `body` أو `large` | `body` |
| `background` | `none`، أو `surface`، أو `tint` | `none` |
| `padding` | `s`، أو `m`، أو `l` | `m` |
| `collapse_lines` | 0 (بلا طي)، أو 3، أو 5، أو 8 مع «اقرأ المزيد» | 0 |

**صيغة المحتوى**: ليس HTML ولا Markdown، بل شجرة JSON محدودة يتحقق منها المخطط: العقد `paragraph`، و`heading` (المستوى 2 أو 3)، و`bullet_list`، و`ordered_list`، و`list_item`، و`text` بعلامات `bold` و`italic` و`link` (والرابط فعل من القائمة المغلقة لا عنوان حر). والمحرر في M15 يُخرج هذه البنية مباشرة. بذلك لا يحتاج التطبيق محلل HTML، ولا ثغرة حقن. ويُذكر أن `flutter_markdown` موسومة «discontinued» على pub.dev، وهذا سبب إضافي لتجنب Markdown.

**الرسم**: `Text.rich` لكل فقرة، و`TapGestureRecognizer` للروابط، ونمط الخط من الـ tokens، و`letterSpacing: 0` للعربية.

**التحليلات**: `block_impression`، و`block_click` للروابط.

| الحالة الحدية | السلوك |
|---|---|
| المحتوى الإنجليزي فارغ | يُعرض العربي (G-13) |
| عقدة غير مدعومة في مراجعة أقدم | تُتجاهل العقدة ويبقى نصها كفقرة |

#### 5.8.10 `spacer` (v1)
**الغرض**: مسافة أو فاصل بين الكتل.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `height` | `xs` (8)، و`s` (16)، و`m` (24)، و`l` (40)، و`xl` (64) dp | `m` |
| `divider` | `none` أو `line` | `none` |
| `inset` | boolean: هامش جانبي للخط | `true` |

**الحماية**: G-10. ولا أحداث تحليلية.

#### 5.8.11 `zid_theme_section` (v1، كتلة تحرير تُحسم في الخادم)
**الغرض**: قسم من ثيم زد يبقى مربوطًا به، فتتحدث صوره وروابطه حين يغيّرها التاجر في متجره (ADR-0009 البند 3).

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `binding` | `section_id`، و`template`، و`meta_type` | من الاستيراد |
| `render_as` | `hero_slider`، أو `banner_grid`، أو `category_strip`، أو `product_carousel`، أو `trust_badges`، أو `announcement_bar`، أو `countdown`، أو `rich_text`، أو `none` | من جدول التحويل في M11 |
| `sync` | `on` (يتحدث) أو `off` (لقطة وقت الاستيراد) | `on` |
| `fallback` | `hide` أو `link` | `hide` |
| `props_override` | إعدادات العرض لكتلة `render_as` (مثل `height`) | — |

**الحسم في الخادم**: التطبيق لا يستلم هذا النوع أبدًا. عند الرسم، يقرأ M11 آخر لقطة للقسم، ويحوّلها إلى كتلة من نوع `render_as` بنفس `id`، ويضيف `origin`. فإن تعذّر التحويل، أو صار الربط يتيمًا (حُذف القسم أو تغيّر الثيم):
- `hide`: لا تُرسل الكتلة.
- `link`: تُرسل كتلة `announcement_bar` ثابتة بنص «تصفح هذا القسم في المتجر» وفعل `open_url_inapp` إلى رابط الرئيسية في المتجر.

**عرض WebView داخل الصفحة**: لا يُقدَّم في الإصدار الأول. انظر القسم 8.

**التحليلات**: أحداث الكتلة الناتجة، ومعها `origin = zid_section`.

#### 5.8.12 `brand_strip` (v1، خلف العلم `blocks.brand_strip`)
**الغرض**: شعارات العلامات التجارية.

| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `style` | `logos_row` أو `grid` | `logos_row` |
| `source` | `auto` (بعدد المنتجات تنازليًا) أو `manual` | `auto` |
| `brand_ids[]` | حتى 20 للمصدر اليدوي | — |
| `limit` | 4 إلى 20 | 12 |
| `show_names` | boolean | `false` |
| `title` | `localized_text` | — |
| `show_view_all` | boolean | `false` |

**المصدر والتهيئة**: `GET brands` في نطاق المتجر، وهو غير موثق (N\*). فإن فشل، يستخدم M10 البديل الموثق في Merchant API `GET /v2/products/brands` ([List Brands](https://docs.zid.sa/list-brands-43653974e0)). ويضع الخادم في `data.brands[]`: `id` (uuid)، و`name`، و`logo`.

**الفعل**: `search` بـ `filters.brand_id`. وM04 يحوّله إلى `products?brand={uuid}`، وهو فلتر يعمل حيًا لكنه غير موثق.

**العلم**: مغلق، فيُسقط الخادم الكتلة ويخفيها المحرر. وكذلك إن كانت `settings.brands.is_enabled = false` في المتجر.

| الحالة الحدية | السلوك |
|---|---|
| علامة بلا شعار | شريحة نصية بالاسم |
| أقل من 3 علامات | تُخفى الكتلة |

### 5.9 إعداد الشاشات الأصلية (F-M05)

مستند واحد من نوع `shell` بالمفتاح `default`، بدورة النشر نفسها في M11 (مسودة، ثم نشر، ثم رجوع). وM15 يقترح مستندًا لكل شاشة، والخلاف مسجل في M11 القسم 8.2-10. ومخططه `06-api/blocks/shell/`. وصيغة التسليم:

```json
{
  "schema_version": 3,
  "shell": {
    "version": 12,
    "tab_bar": {
      "style": "icon_label",
      "tabs": [
        {"key": "home", "icon": "home", "label": "الرئيسية", "visible": true},
        {"key": "categories", "icon": "grid", "label": "الأقسام", "visible": true},
        {"key": "search", "icon": "search", "label": "بحث", "visible": true},
        {"key": "cart", "icon": "bag", "label": "السلة", "visible": true},
        {"key": "account", "icon": "user", "label": "حسابي", "visible": true}
      ]
    },
    "top_bar": {"layout": "logo_center", "search": "icon", "background": "surface", "actions": ["wishlist"]},
    "product_card": {"style": "classic", "image_ratio": "3:4", "image_fit": "cover", "title_lines": 2,
                     "quick_add": true, "show_rating": true, "show_wishlist": true,
                     "show_discount_badge": true, "show_low_stock": true},
    "product_page": {"modules": [
      {"key": "gallery", "visible": true}, {"key": "title_price", "visible": true},
      {"key": "installments", "visible": true}, {"key": "bank_offer", "visible": true},
      {"key": "options", "visible": true}, {"key": "branch_stock", "visible": false},
      {"key": "trust_badges", "visible": true, "ref": "b_t1r2u3s4"},
      {"key": "description", "visible": true}, {"key": "bundles", "visible": true},
      {"key": "reviews", "visible": true}, {"key": "similar_products", "visible": true},
      {"key": "share_whatsapp", "visible": true}
    ]},
    "announcement": {"ref": "m09"}
  }
}
```

#### 5.9.1 وحدات صفحة المنتج
| الوحدة | قابلة للإخفاء | قابلة للنقل | ملاحظة |
|---|---|---|---|
| `gallery` | لا | لا (الأولى دائمًا) | — |
| `title_price` | لا | لا (بعد المعرض) | السعر شامل الضريبة |
| `options` | لا | نعم | تُتخطى تلقائيًا إن لم تكن للمنتج خيارات |
| زر الإضافة إلى السلة | — | — | ثابت أسفل الشاشة، ليس وحدة في القائمة |
| `installments` | نعم | نعم | سطر تابي أو تمارا (M04) |
| `bank_offer` | نعم | نعم | من خصومات البنوك في زد |
| `branch_stock` | نعم | نعم | مخزون الفروع |
| `trust_badges` | نعم | نعم | يشير إلى كتلة `trust_badges` معرّفة في الـ shell |
| `description` | نعم | نعم | — |
| `bundles` | نعم | نعم | عروض الباقات |
| `reviews` | نعم | نعم | تُخفى تلقائيًا إن كانت `reviews_enabled = false` في المتجر |
| `similar_products` | نعم | نعم | تستخدم بطاقة الـ shell |
| `share_whatsapp` | نعم | نعم | — |

القاعدة: مفتاح وحدة مجهول في مراجعة أقدم يُتجاهل. ووحدة إلزامية مفقودة من القائمة تُضاف في موضعها الافتراضي. وM04 يرسم كل وحدة. وهذه الوحدة توفر `ModuleOrder.resolve(config, product)` الذي يعيد القائمة النهائية بعد تطبيق القواعد.

#### 5.9.2 بطاقة المنتج
| الإعداد الأساسي | القيم | الافتراضي |
|---|---|---|
| `style` | `classic`، و`horizontal`، و`framed`، و`minimal` (بلا زر سلة بارز) | من الهوية الجاهزة (M02) |
| `image_ratio` | `1:1`، أو `3:4`، أو `4:5` | من الهوية |
| `image_fit` | `cover` أو `contain` | `cover` |
| `title_lines` | 1 أو 2 | 2 |
| `quick_add` | boolean | `true` |
| `show_rating` | boolean | `true` |
| `show_wishlist` | boolean | `true` |

**متقدم**: `show_discount_badge` (افتراضي true)، و`show_low_stock` (افتراضي من `low_stock_label_enabled` في المتجر).

البطاقة ويدجت واحد في `storefront_ui` تستخدمه الكتل وM04 في القوائم والمنتجات المشابهة. والأنماط الأربعة مأخوذة مما يقدمه المنافسون (`research_notes/مزايا وتخصيص تطبيقات متاجر زد/local_builders_teardown.md`، قسم بطاقة المنتج لدى عناقيد).

#### 5.9.3 الشريط السفلي
| الإعداد | القيم |
|---|---|
| `style` | `icon_label`، و`icon_only`، و`icon_pill` (خلفية للمحدد)، و`indicator_top`، و`indicator_bottom`، و`dot`. وهي الأنماط الستة التي تقدمها سلة ([Salla help](https://help.salla.sa/category/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1/sgzgn084wdb6wxnv3om7fgst)) |
| `tabs[]` | المفاتيح الخمسة الثابتة في F-S03. ولكل تبويب: `icon` من مجموعة M02، و`label` بلغتين حتى 12 حرفًا، و`visible` |

القواعد: `home` أول تبويب دائمًا. و`home` و`cart` و`account` لا تُخفى. والحد الأدنى للظاهر 3 والأقصى 5. وعدّاد السلة من M04. والألوان من الـ tokens: المحدد `primary`، وغير المحدد `on_surface` بشفافية 60%.

**الأيقونات**: مفاتيح نصية تُحوَّل إلى `IconData` من خريطة ثابتة `const` في الحزمة، فيعمل tree-shaking للخط. ومفتاح مجهول يرسم أيقونة افتراضية للتبويب.

#### 5.9.4 الشريط العلوي
| الإعداد | القيم | الافتراضي |
|---|---|---|
| `layout` | `logo_center`، أو `logo_start`، أو `title` | `logo_center` |
| `search` | `icon`، أو `field` (حقل بحث تحت الشعار)، أو `none` | `icon` |
| `background` | `surface` أو `primary` | `surface` |
| `actions[]` | حتى 2 من `wishlist`، و`whatsapp`، و`language` | `["wishlist"]` |

الشعار من M02 (فاتح وداكن). والشريط يحصل على ظل عند التمرير.

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| أول تشغيل دون شبكة | تُرسم اللقطة المضمّنة. والكتل التي تحتاج بيانات حية تُرسم من بياناتها المضمّنة، ويُعاد التحقق عند عودة الشبكة |
| اللقطة المضمّنة أقدم من 30 يومًا | تُرسم كما هي، وتُستبدل عند أول نجاح. M13 يجددها في كل بناء |
| الخادم يعيد 304 | لا تغيير، ويُحدَّث وقت الجلب فقط |
| الخادم يعيد 404 للصفحة | `home`: تبقى النسخة المحلية ويُرسل خطأ مراقبة. وصفحة حملة: شاشة «الصفحة غير متاحة» مع زر للرئيسية |
| الخادم يعيد 410 (تاجر موقوف) | يتولاه M01 عبر الأعلام |
| غلاف تالف لا يُحلَّل | تبقى النسخة السابقة، ويُرسل `block_render_error` بـ `phase = parse` و`block_id = "_envelope"` |
| `schema_version` في الاستجابة لا يطابق الملف التنفيذي | يُرفض الغلاف ويُرسل خطأ مراقبة. وهذا لا يحدث إلا بخطأ في الخادم |
| كتلة تتجاوز عرض الشاشة (overflow) | الإطار يقص المحتوى. واختبارات golden على 320 dp تمنع ذلك قبل الإصدار |
| تبديل اللغة أثناء التشغيل | يُعاد بناء الصفحة من نسخة اللغة الأخرى إن وُجدت، وإلا هيكل تحميل ثم جلب |
| تبديل الوضع الداكن | إعادة رسم بالـ tokens الداكنة دون جلب. والصور الشفافة بنص أسود تحذير في المحرر (M02) |
| شاشة صغيرة (320 dp) أو تكبير خط 200% | لا قص للنص. العناوين سطران ثم ellipsis، والأزرار تكبر ارتفاعًا |
| قارئ الشاشة | كل صورة قابلة للضغط لها `Semantics(button: true, label: alt أو عنوان الهدف)`. والسلايدر الآلي يتوقف حين يكون قارئ الشاشة مفعّلًا |
| جهاز أندرويد ضعيف وصفحة طويلة | الكتل خارج الشاشة لا تُبنى (slivers)، والمؤقتات متوقفة |
| فعل `open_page` إلى صفحة نُشرت بعد بناء الغلاف | يُجلب الغلاف عند الفتح عاديًا |
| فعلان متتاليان بسرعة (ضغط مزدوج) | تجاهل الضغطات خلال 500 ms من فعل ملاحي |

## 7. المتطلبات غير الوظيفية

| البند | الهدف | القياس |
|---|---|---|
| الإقلاع البارد إلى رئيسية تفاعلية | أقل من 2 ثانية من غلاف مخزّن (PRD 3) | `integration_test` بوضع profile على جهاز أندرويد مرجعي يحدده M01 |
| تحليل غلاف 150 KB | 30 ms أو أقل في Isolate | اختبار أداء في CI على المحاكي، ورقم الجهاز المرجعي يدويًا مرة لكل إصدار |
| التمرير | الإطارات التي تتجاوز 16.7 ms أقل من 1% في صفحة من 20 كتلة | `FrameTiming` في اختبار profile |
| ذاكرة الصور | سقف `imageCache` عند 100 MB و300 صورة | إعداد في M01، وفحص في اختبار التمرير |
| حجم الغلاف | تحذير عند 150 KB غير مضغوط، ورفض عند 300 KB | `GuardrailLinter` في الخادم |
| حجم الحزمة | `storefront_ui` لا تضيف أكثر من 2 MB إلى الملف التنفيذي | `flutter build apk --analyze-size` |
| المعاينة على الويب | التحميل الأول وزمن التحديث بأرقام SPK-15 (أقل من 4 ثوانٍ، وأقل من 300 ms) | قياس في SPK-15 ثم في CI |
| الصور | مقاس الطلب لا يتجاوز `ceil(عرض الإطار × DPR)` إلا بأقرب مقاس متاح | اختبار وحدة لـ `ImageUrlPolicy` |
| RTL | كل كتلة لها golden بالعربية والإنجليزية، فاتح وداكن، على 320 و390 و430 dp | `alchemist` بنمط CI |
| إمكانية الوصول | أهداف لمس 48 dp، وتباين 4.5:1، وقارئ الشاشة، وتقليل الحركة | `meetsGuideline` في اختبارات الويدجت |
| المراقبة | كل خطأ كتلة يصل إلى Sentry (عبر `ErrorReporter` في M12) بوسوم `tenant_id` و`page_version` و`block_type` | لوحة M12 |
| الاستقرار | نسبة `block_render_error` إلى `block_impression` أقل من 0.1% لكل نوع | تقرير M08 أسبوعي |

**قواعد الأداء الملزمة**:
1. صفحة واحدة = `CustomScrollView` واحدة، وكتلة واحدة = sliver واحد. لا `shrinkWrap` ولا قوائم متداخلة غير محدودة.
2. القوائم الأفقية بـ `ListView.builder` وعرض عنصر ثابت.
3. **اختيار مقاس الصورة**: العرض المطلوب بالبكسل = عرض الإطار × `devicePixelRatio`.
   - صور التاجر: أصغر قيمة في `variants` تساوي المطلوب أو تزيد عليه، أو أكبر قيمة إن لم توجد. والرابط من `tpl`.
   - صور زد: `thumbnail` حتى 370 px، ثم `small` حتى 770، ثم `large`. وعرض هذه المقاسات رُصد من روابط `img.zid.store` الحية، وزد لا توثقه.
   - `memCacheWidth` يساوي العرض المطلوب، حتى لا تُفك الصورة أكبر من حاجتها.
4. **العنصر النائب**: blurhash لصور التاجر بـ `optimizationMode: approximation`. ولون سائد أو لون `surface` لصور زد، لأن زد لا ترسل blurhash. والانتقال إلى الصورة 150 ms، أو بلا انتقال مع تقليل الحركة.
5. الإطار يعرف الارتفاع قبل وصول الصورة دائمًا (من `w` و`h` أو من النسبة)، فلا تقفز الصفحة.
6. `cacheExtent` بارتفاع شاشة واحدة.
7. المؤقتات والحركة تعمل فقط للكتل المرئية.

## 8. الاعتماديات والمجهول

### 8.1 التجارب المرتبطة
| SPK | الأثر على هذه الوحدة | ما يُبنى الآن |
|---|---|---|
| SPK-15 (معاينة Flutter Web) | BLK-13 ينتظر نتيجتها. إن فشلت تصبح المعاينة على الجهاز بـ QR هي الأساس (F-M08b من M11) | كل الكتل تُبنى بلا إضافات جوال، وتُختبر على الويب في Widgetbook من اليوم الأول |
| SPK-09 (دقة الاستيراد) | قيم `render_as` الافتراضية وجدول التحويل في M11 | مخطط `zid_theme_section` الآن، والتحويل بعد التجربة |
| SPK-12 (حدود المعدّل) | عدد كتل المنتجات المسموح في الصفحة (G-09) وتكرار تحديث التهيئة | الحد 6 مبدئيًا |
| SPK-11 (السلة) | سلوك `apply_coupon` حين تكون السلة فارغة | العقد `ActionResult` الآن |

### 8.2 تعارضات واختيارات تحتاج قرار المشرف
1. **مكان المخططات**: ADR-0004 يقول «JSON Schema في الخادم»، وADR-0010 يقول إن `06-api/` هو المصدر الوحيد، وADR-0001 يفصل الكود عن مستودع المواصفات. هذه المواصفة تجمعها: المصدر في `06-api/blocks/`، ويُستهلك بـ submodule مثبت على وسم في المستودعات الثلاثة، والخادم يتحقق به عند الحفظ. **يحتاج إقرارًا** لأنه يضيف خطوة إلى سير العمل.
2. **معنى `schema_version`**: عُرّف هنا رقمًا لمراجعة حزمة العقود كلها (الغلاف والكتل)، لا لإصدار الغلاف وحده. هذا يحفظ مفتاح ADR-0006 كما هو، ويجعل `X-Supported-Blocks` للتحقق فقط. ونتيجته أن `min_app_version` للكتلة يُقيَّم في الجهاز لا في الخادم. **ليس خروجًا عن ADR-0004، لكنه تفسير يحتاج إقرارًا**.
3. **عرض `zid_theme_section` في WebView** (ADR-0009 البند 3): البحث لم يجد رابطًا في زد يعرض قسمًا واحدًا منفردًا. فالـ WebView يعني تحميل صفحة المتجر كاملة داخل كتلة، وهذا ثقيل ويكسر التمرير. لذلك قُدّم في الإصدار الأول `hide` و`link` فقط. **مقترح**: تعديل البند في ADR-0009، أو إضافة سؤال إلى SPK-09: هل يمكن عرض قسم بمرساة `#section_id` في صفحة ويب بارتفاع ثابت؟
4. **الأفعال**: لا يوجد `open_brand` ولا `open_url_external` في ADR-0004. غُطّيا بـ `search` و`open_url_inapp` مع قائمة نطاقات خارجية في M07. إن رأى المشرف أن الوضوح أهم، يُضاف `open_brand` بـ ADR جديد يستبدل البند 5.
5. **`best_selling`**: لا يوجد ترتيب «الأكثر مبيعًا» موثق في Storefront API. المتاح `popularity_order`، ومعناه غير موثق. **يُسأل فريق زد**، أو يُحسب الترتيب في الخادم من webhooks `order.create` (عمل إضافي في M10).
6. **الأيقونات**: مجموعة الأيقونات ومكتبتها قرار M02. هذه المواصفة تفترض مفاتيح نصية وخريطة `const`.
7. **صفحات الحملات**: PRD لا يذكرها صراحة في Must، لكن الفعل `open_page` في القائمة المغلقة يفترضها. هذه المواصفة تدعمها لأن كلفتها في التطبيق صفر (نفس المحرك). ورؤوس التصنيفات مؤجلة.

### 8.3 ما يمكن بناؤه الآن خلف واجهة مؤقتة
- كل الكتل بـ fixtures من `06-api/blocks/**/fixtures`، وخدمات وهمية لـ `ActionHandler` و`CartCommands` و`ProductPaging` و`AnalyticsSink`.
- `ThemeExtension<BrandTokens>` مؤقت بقيم هوية واحدة حتى يكتمل M02.

## 9. تقسيم العمل

### 9.1 القصص

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| BLK-01 | هيكل العقود: `06-api/blocks/` بالغلاف والأفعال والأنواع المشتركة و`catalog.json`، وfixtures، وlint الخصائص الأساسية، والتحقق الثلاثي (opis وAjv وDart) في CI، وتجربة أداة توليد Dart ليوم واحد | Must | نعم | قرار 8.2-1 |
| BLK-02 | حزمة `storefront_ui`: نماذج الغلاف، و`BlockRegistry`، و`PageRenderer` بالـ slivers، و`BlockBoundary` و`BlockScope` و`storefrontErrorWidgetBuilder`، والنوع المجهول، و`supportedBlocksHeader()`، وواجهات الخدمات ونسخها الوهمية، وتطبيق Widgetbook | Must | نعم | BLK-01 |
| BLK-03 | الأفعال: `BlockAction` المختومة، والتحليل، و`ActionHandler`، ومنع الضغط المزدوج، وتنفيذ وهمي للاختبار | Must | نعم (خلف واجهة) | BLK-02؛ وM07 للتنفيذ الحقيقي |
| BLK-04 | `ImpressionTracker` وأحداث الكتل السبعة عبر `AnalyticsSink` | Must | نعم | BLK-02؛ وM08 لاعتماد الأسماء |
| BLK-05 | الصور: `ImageSource`، و`ImageUrlPolicy` لصور التاجر وزد، وblurhash، و`memCacheWidth`، والجلب المسبق | Must | نعم | BLK-02؛ وعقد الأصول في M11 |
| BLK-06 | `hero_slider` و`banner_grid` بكل حالاتهما، وgolden بالعربية والإنجليزية | Must | نعم | BLK-02, BLK-05 |
| BLK-07 | بطاقة المنتج بأنماطها الأربعة، و`product_carousel` | Must | نعم (بـ fixtures) | BLK-02, BLK-05؛ وM02 للـ tokens؛ وM04 لورقة الخيارات |
| BLK-08 | `product_grid` مع الترقيم عبر `ProductPaging` | Must | نعم (خلف واجهة) | BLK-07؛ وM04 أو M01 لـ `zid_client` |
| BLK-09 | `category_strip`، و`brand_strip` خلف العلم | Must | نعم | BLK-02, BLK-05 |
| BLK-10 | `announcement_bar` (والويدجت المشترك مع M09)، و`countdown` بساعة الخادم والتسمية الهجرية | Must | نعم | BLK-02؛ وM09 للتنسيق |
| BLK-11 | `trust_badges`، و`rich_text` بصيغة المستند المنظم، و`spacer` | Must | نعم | BLK-02 |
| BLK-12 | إعداد الشاشات الأصلية: مخطط `shell`، والشريط السفلي بأنماطه الستة، والشريط العلوي، و`ModuleOrder.resolve` لصفحة المنتج | Must | نعم (العقود والويدجتات) | BLK-01, BLK-07؛ وM01 للهيكل؛ وM04 لرسم الوحدات |
| BLK-13 | نقطة دخول المعاينة على الويب، ومستقبل بروتوكول `intishar.preview`، و`DraftAdapter` من صيغة التحرير إلى صيغة التسليم مع اختبار المطابقة مع محلّل M11 | Must | ينتظر SPK-15 | BLK-02؛ وM15 للبروتوكول |
| BLK-14 | `PageRepository`: نسخة القرص ثم اللقطة المضمّنة، وإعادة التحقق بـ `If-None-Match`، والتطبيق عند التنقل التالي، وتبديل اللغة، و`disabled_blocks` و`min_app_version` على الجهاز | Must | ينتظر M01 (طبقة الشبكة والتخزين) | BLK-02؛ وM11 (CFG-07) |
| BLK-15 | في Laravel: `BlockCatalog` و`BlockDownConverters` وendpoint كتالوج الكتل للمحرر `GET /block-types?schema_version=N` (المسار الذي يتوقعه M15) | Must | نعم | BLK-01؛ وM12 لاصطلاحات API |
| BLK-16 | في Laravel: `GuardrailLinter` بالقواعد G-02 إلى G-14 ورسائلها بلغتين | Must | نعم | BLK-01, BLK-15 |
| BLK-17 | مخطط `zid_theme_section` ومحوّلات `render_as` في الخادم (مع M11) | Must | ينتظر SPK-09 | BLK-15؛ وM11 (CFG-12) |
| BLK-18 | التصليب: golden لكل كتلة بالحالات كلها، وفحوص إمكانية الوصول، واختبار أداء التمرير والإقلاع | Must | لا، بعد BLK-06 إلى BLK-12 | BLK-06 إلى BLK-12 |

### 9.2 معايير القبول لأهم القصص

**BLK-02: السجل وحاجز الأخطاء**
1. **بافتراض** غلاف فيه 5 كتل، الثالثة من نوع `video@1` غير المسجّل، **عندما** تُرسم الصفحة في الإنتاج، **إذن** تظهر الكتل الأربع الأخرى بترتيبها، ولا يظهر أي أثر للثالثة، ويُرسل `unknown_block` مرة واحدة بـ `block_type = video`.
2. **بافتراض** كتلة `banner_grid` يرمي أحد أبنائها استثناءً عند البناء، **عندما** تُرسم الصفحة، **إذن** يُطوى العنصر المعطوب، وتعمل بقية الصفحة والتمرير، ويُرسل `block_render_error` بـ `phase = descendant` وبـ `block_id` الكتلة الصحيح.
3. **بافتراض** كتلة `props` فيها نوع خاطئ (`interval_s: "five"`)، **عندما** يُحلَّل الغلاف، **إذن** تُسقط هذه الكتلة وحدها، ويُرسل `block_render_error` بـ `phase = parse`.
4. **بافتراض** السجل الحالي، **عندما** يُستدعى `supportedBlocksHeader()`، **إذن** يعيد كل `type@v` في السجل مرتبة أبجديًا، وتطابق قائمة `catalog.json` لنفس المراجعة (اختبار وحدة يفشل عند أي اختلاف).

**BLK-06: `hero_slider`**
1. **بافتراض** شريحة صورتها 1080×1620 (نسبة 2:3) و`height = l` على شاشة 390×844، **عندما** تُرسم، **إذن** يكون الارتفاع 422 dp (50% من الشاشة) لا 585، والصورة مقصوصة حول `focal`.
2. **بافتراض** 3 شرائح و`autoplay = true` و`interval_s = 5`، **عندما** يلمس المستخدم السلايدر، **إذن** يتوقف التقدم الآلي، ويُستأنف بعد 5 ثوانٍ من رفع الإصبع.
3. **بافتراض** أن «تقليل الحركة» مفعّل في الجهاز، **عندما** تُرسم الكتلة، **إذن** لا تتقدم الشرائح آليًا.
4. **بافتراض** أن اللغة العربية، **عندما** يسحب المستخدم من اليسار إلى اليمين، **إذن** ينتقل إلى الشريحة التالية، والشريحة الأولى تكون أقصى اليمين.
5. **بافتراض** أن الشريحة الثانية ظهرت 50% أو أكثر لمدة 1.2 ثانية، **إذن** يُرسل `block_item_impression` بـ `item_index = 1` مرة واحدة في الجلسة.

**BLK-07: `product_carousel`**
1. **بافتراض** مصدر تصنيف يعيد 12 منتجًا منها اثنان نافدان، و`out_of_stock = last`، **عندما** تُرسم الكتلة، **إذن** يظهر النافدان في آخر الصف بشارة «نفد».
2. **بافتراض** منتج `has_options = true` و`quick_add = true`، **عندما** يضغط زر الإضافة، **إذن** تُفتح ورقة الخيارات عبر `ActionHandler` ولا يُضاف المنتج مباشرة.
3. **بافتراض** أن المصدر يعيد صفر منتجات، **عندما** تُرسم الصفحة، **إذن** لا تظهر الكتلة ولا عنوانها.
4. **بافتراض** منتج `quantity = 3` وعتبة المتجر 10، **إذن** تظهر شارة «باقي 3».

**BLK-10: `countdown`**
1. **بافتراض** `ends_at` بعد 90 ثانية من وقت الخادم، وساعة الجهاز متقدمة ساعة، **عندما** تُرسم الكتلة، **إذن** يعرض العداد 00:01:30 تقريبًا لا قيمة سالبة.
2. **بافتراض** `on_end = hide` والصفحة مفتوحة، **عندما** يصل العداد إلى الصفر، **إذن** تُطوى الكتلة دون إعادة تحميل الصفحة.
3. **بافتراض** أن الكتلة خارج الشاشة، **إذن** لا يعيد العداد بناء أي ويدجت (يُتحقق باختبار عدد مرات البناء).

**BLK-14: `PageRepository`**
1. **بافتراض** أول تشغيل دون شبكة، **عندما** يُفتح التطبيق، **إذن** تُرسم الرئيسية من `assets/bootstrap/snapshot.json` (غلاف `home` بالعربية) دون مؤشر خطأ.
2. **بافتراض** نسخة مخزنة بـ `ETag` يساوي ما في الخادم، **عندما** يُعاد التحقق، **إذن** يعيد الخادم 304 ولا تُعاد كتابة الملف.
3. **بافتراض** وصول نسخة جديدة والمستخدم قد مرّر الرئيسية، **إذن** لا تتغير الشاشة المعروضة، وتظهر النسخة الجديدة عند العودة إلى الرئيسية من شاشة أخرى.
4. **بافتراض** أن الأعلام تحوي `disabled_blocks` بـ `countdown@1` لإصدار التطبيق الحالي، **عندما** تُرسم الرئيسية، **إذن** لا تظهر كتل `countdown`، ويبقى الباقي.

**BLK-15: `BlockCatalog`**
1. **بافتراض** نسخة منشورة فيها `hero_slider@2`، والمراجعة 3 تدعم `hero_slider@1` فقط ولها محوّل، **عندما** يُطلب المسار بـ `schema_version = 3`، **إذن** تصل الكتلة بـ `v = 1`.
2. **بافتراض** كتلة `stories@1` لا تدعمها المراجعة 3 ولا محوّل لها، **إذن** لا تصل، ويُسجَّل `block_dropped`.
3. **بافتراض** علم `blocks.brand_strip` مغلق للتاجر، **إذن** لا تصل `brand_strip` لأي مراجعة.

### 9.3 لاحقًا (Should وCould)
- **كتل Should**: `buy_again` (للمسجلين، من `account/orders`، وتنتظر SPK-07)، و`recently_viewed` (محلية على الجهاز، بلا تهيئة خادم)، و`flash_deal` (عداد + منتجات من حقول الخصم)، و`testimonials`، و`video` و`video_strip` (مشغل فيديو وصورة غلاف، وكتمان الصوت افتراضيًا)، و`stories`، و`loyalty_card` (تنتظر SPK-12). كل منها: مخطط، وتعريف Dart، ومحلّل في M11 إن لزم، وتُطرح بعد وصول الإصدار الداعم لـ 80% من الأجهزة.
- **تبويب سفلي مخصص** يفتح صفحة حملة (Should).
- **استهداف الكتلة واختبارات A/B** (F-M13، Could): `visibility.segments` و`experiment` تُحسم في الخادم (M11 القسم «لاحقًا»)، ويُضاف حدث `experiment_exposure` عند رسم الكتلة.
- **رؤوس التصنيفات**: صفحة كتل تظهر أعلى قائمة تصنيف (Should)، بنفس المحرك ومفتاح `category_header:{id}`.

## 10. المصادر
- قرارات المشروع: [ADR-0004](../adr/0004-hybrid-sdui-typed-blocks.md)، و[ADR-0006](../adr/0006-layouts-in-platform-api.md)، و[ADR-0009](../adr/0009-import-then-own-home.md)، و[ADR-0010](../adr/0010-nextjs-web-frontends.md)، و[PRD](../01-prd.md)، و[spikes.md](../spikes.md).
- البحث الداخلي: [تقرير المزايا والتخصيص](../../reports/مزايا%20وتخصيص%20تطبيقات%20متاجر%20زد.md)، و`research_notes/مزايا وتخصيص تطبيقات متاجر زد/` (`flutter_configurable_architecture.md`، و`local_builders_teardown.md`، و`global_builders_features.md`، و`zid_feature_capability_map.md`).
- Flutter: [Release notes](https://docs.flutter.dev/release/release-notes)، و[Embedding Flutter web](https://docs.flutter.dev/platform-integration/web/embedding-flutter-web)، و[ErrorWidget.builder](https://api.flutter.dev/flutter/widgets/ErrorWidget/builder.html)، و[SliverMainAxisGroup](https://api.flutter.dev/flutter/widgets/SliverMainAxisGroup-class.html)، و[MediaQuery.disableAnimationsOf](https://api.flutter.dev/flutter/widgets/MediaQuery/disableAnimationsOf.html).
- pub.dev (الإصدارات في 2026-11-10): [flutter_riverpod](https://pub.dev/packages/flutter_riverpod)، و[freezed](https://pub.dev/packages/freezed)، و[json_serializable](https://pub.dev/packages/json_serializable)، و[go_router](https://pub.dev/packages/go_router)، و[cached_network_image](https://pub.dev/packages/cached_network_image)، و[flutter_blurhash](https://pub.dev/packages/flutter_blurhash)، و[visibility_detector](https://pub.dev/packages/visibility_detector)، و[hijri](https://pub.dev/packages/hijri)، و[widgetbook](https://pub.dev/packages/widgetbook)، و[alchemist](https://pub.dev/packages/alchemist)، و[smooth_page_indicator](https://pub.dev/packages/smooth_page_indicator)، و[flutter_markdown](https://pub.dev/packages/flutter_markdown).
- JSON Schema والتوليد: [Draft 2020-12](https://json-schema.org/draft/2020-12)، و[opis/json-schema](https://packagist.org/packages/opis/json-schema)، و[Ajv](https://ajv.js.org/json-schema.html)، و[json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript)، و[Zod JSON Schema](https://zod.dev/json-schema)، و[json_schema_to_freezed](https://pub.dev/packages/json_schema_to_freezed).
- زد: [Theme Sections Settings](https://docs.zid.sa/theme-sections-settings-2258380m0)، و[List Products](https://docs.zid.sa/list-products-25510175e0)، و[Get Product by Slug](https://docs.zid.sa/get-product-by-slug-25772175e0)، و[List Brands (Merchant)](https://docs.zid.sa/list-brands-43653974e0)، و[llms.txt](https://docs.zid.sa/llms.txt). ومقاسات `img.zid.store` من قراءة حية لـ [pcpalace template-settings](https://pcpalace.com.sa/api/v1/template-settings?template=home) في 2026-11-10.
- أنماط SDUI: [Zalando Appcraft](https://engineering.zalando.com/posts/2024/05/appcraft.html).
- إمكانية الوصول: [WCAG 2.1: Contrast (Minimum)](https://www.w3.org/TR/WCAG21/#contrast-minimum).
