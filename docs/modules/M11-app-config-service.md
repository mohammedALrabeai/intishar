# M11: خدمة إعداد التطبيق

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Laravel (وحدة `AppConfig`)، وتخزين كائنات S3-compatible، وCDN، وRedis، والطوابير |
| المتطلبات | F-M02, F-M03, F-M06، ولاحقًا F-M06b وF-M08b وF-M13 |
| القرارات | ADR-0004, ADR-0005, ADR-0006, ADR-0009, ADR-0010 |
| تعتمد على | M03 (عقود الكتل، و`BlockCatalog`، وقواعد الحماية)، وM10 (عميل زد، وذاكرة الكتالوج، والـ webhooks)، وM12 (المستأجرون، والمصادقة، والأدوار، وسجل التدقيق، والأعلام، واصطلاحات API، والمراقبة)، وM02 (مخطط الـ tokens والهويات الجاهزة)، وM09 (إعداد الشريط الإعلاني العام)، وM15 (واجهة المحرر)، وM14 (يستدعي الاستيراد عند الإعداد)، وM07 (قواعد تحويل روابط زد إلى أفعال) |
| بادئة القصص | CFG |

## 1. الغرض والنطاق

هذه الوحدة **تخزّن** ما يعدّه التاجر للتطبيق **وتنشره وتقدّمه**: صفحات الكتل (الرئيسية وصفحات الحملات)، وإعداد الشاشات الأصلية (مستند `shell`)، والـ tokens. وتملك دورة الحياة كاملة: مسودة، ثم تحقق، ثم فرق، ثم نشر نسخة ثابتة، ثم رجوع بنقرة. وتقدّم للتطبيق غلافًا مهيّأً بالبيانات خلف CDN مع ETag. وتملك خط الوسائط، واستيراد ثيم زد مع الربط المستمر لبعض الكتل.

### داخل الإصدار الأول (Must)
1. نموذج «مستند الإعداد» الموحد لثلاثة أنواع: `page` و`shell` و`theme`، بنسخ ثابتة ومؤشر للنسخة الحية.
2. واجهات اللوحة: قراءة المسودة وحفظها مع منع التعارض، والتحقق بالمخطط عند الحفظ، والفرق، والنشر الموحد لعدة مستندات (`releases`)، وسجل النسخ، والرجوع، واستعادة نسخة إلى المسودة، وبيانات المعاينة الحية (F-M08).
3. واجهات التطبيق: الصفحة والـ shell والـ tokens بمفتاح ADR-0006، مع ETag و304 وCDN، ومساهمة في endpoint الأعلام (M12).
4. خط الرسم: التوطين، وحل الأصول، والتهيئة الخادمية لبيانات المنتجات والتصنيفات والعلامات من ذاكرة M10، وحسم الكتل المربوطة بثيم زد، وتطبيق قواعد التوافق من M03.
5. استراتيجية CDN وإبطال الذاكرة عند النشر وعند تغير البيانات.
6. خط الوسائط: رفع مباشر إلى التخزين، ومعالجة إلى WebP بمقاسات، وblurhash، ولون سائد، واكتشاف النسبة، واقتراح القص.
7. استيراد ثيم زد (ADR-0009): القراءة، والاختصار، وجدول التحويل، ودرجات الثقة، والتطبيق على المسودة، والربط مع المزامنة لكل كتلة.

### لاحقًا
- **Should**: جدولة النشر، والحزم الموسمية (F-M06b)، ورموز معاينة QR الموقّعة (F-M08b).
- **Could**: الشرائح واستهداف المحتوى، واختبارات A/B (F-M13).

التفاصيل المختصرة في القسم 9.3. لكن نموذج البيانات ومفتاح CDN يحملان `segment` من اليوم الأول بقيمة `default`، حتى لا تحتاج الشرائح ترحيلًا لاحقًا.

### ليس من مسؤولية هذه الوحدة
- تعريف الكتل ورسمها وعقودها: M03.
- معنى الـ tokens وقيم الهويات الجاهزة: M02. وهذه الوحدة تخزنها وتنشرها فقط.
- الاتصال بزد وحدود المعدّل والـ webhooks: M10.
- واجهة المحرر وبروتوكول المعاينة: M15.
- سلوك الشريط العام والنوافذ المنبثقة: M09.
- مخزن الأعلام وتقييمها: M12.

## 2. المكونات حسب الطبقة

### 2.1 Laravel

| المكوّن | الإصدار | الاستخدام |
|---|---|---|
| `laravel/framework` | 13.40.0 (Laravel 13 صدر في 2026-03-17 ويتطلب PHP 8.3 أو أحدث ([Laravel News](https://laravel-news.com/laravel-13-released))) | الإطار. وPHP 8.4 في الإنتاج |
| PostgreSQL | 16 أو أحدث | `jsonb` لأجسام المستندات |
| Redis | 7 أو أحدث | نتائج الرسم، والأقفال، و`data_epoch`، وطوابير |
| Laravel Horizon | المتوافق مع Laravel 13 | مراقبة الطوابير |
| `opis/json-schema` | 2.6.1 | التحقق بـ draft 2020-12 ([Packagist](https://packagist.org/packages/opis/json-schema)) |
| `league/flysystem-aws-s3-v3` | 3.35.3 | تخزين S3-compatible، و`Storage::temporaryUploadUrl` للرفع المباشر ([Laravel Filesystem](https://laravel.com/docs/13.x/filesystem)) |
| `jcupitt/vips` | 2.6.1 | معالجة الصور بـ libvips عبر FFI. يحتاج `ext-ffi` وlibvips 8.15 أو أحدث في صورة الخادم |
| `bepsvpt/blurhash` | 4.1.1 | ترميز blurhash |
| `intervention/image` مع `intervention/image-driver-vips` | 4.4.1 و4.2.0 | بديل أعلى مستوى إن تعذّر FFI. والقرار في CFG-10 |

**هيكل الوحدة**

```text
app/Modules/AppConfig/
  Domain/        ConfigDocument, ConfigVariant, ConfigDraft, ConfigVersion, Publication, Asset, ...
  Contracts/     06-api/blocks (git submodule مثبت على وسم contracts-rN)
  Validation/    SchemaRegistry (opis), GuardrailLinter (من M03)
  Rendering/     PageRenderer, Resolvers/<BlockType>Resolver, Localizer, AssetResolver,
                 ZidLinkResolver, RenderArtifactStore
  Publishing/    PublishService, RollbackService, DiffService
  Delivery/      Http/AppPageController, AppShellController, AppThemeController
  Dashboard/     Http/DraftController, VersionController, AssetController, ImportController
  Cdn/           CdnPurger (interface), CloudflarePurger, CloudFrontPurger, NullPurger
  Media/         UploadService, ProcessAssetJob, VipsProcessor, CropSuggester
  ZidImport/     RunZidImportJob, Slimmer, SectionClassifier, MappingTable, ProposalBuilder,
                 SyncZidBindingsJob
  Scheduling/    (Should) ActivateSchedulesJob
```

### 2.2 الخدمات الخارجية
- **التخزين**: حاوية S3-compatible، فيها مجلد خاص للأصول الأصلية ومجلد عام يقدمه CDN. ومزوّدها ومنطقتها في D-06.
- **CDN**: المزوّد في D-06. هذه المواصفة مكتوبة بمتطلبات عامة (القسم 5.4)، وCloudflare هو المرجع لأنه يتيح الإبطال بالوسوم في كل الخطط منذ أبريل 2025 ([Cloudflare changelog](https://developers.cloudflare.com/changelog/post/2025-04-01-purge-for-all/))، وله نقاط حضور داخل المملكة. وCloudFront بديل مكتوب له محوّل.

### 2.3 ما يستهلكه Next.js (M15)
واجهات القسم 5.1 بمصادقة Sanctum (ADR-0010)، والأنواع المولدة من عقود M03.

## 3. التدفقات

### 3.1 حفظ المسودة (حفظ تلقائي)
1. يرسل المحرر `PUT /tenants/{t}/drafts/{kind}/{key}` بالمستند كاملًا (`document`) وترويسة `If-Match` تحمل `revision`، بعد سكون 1.5 ثانية من آخر تعديل. ولا يرسل M15 إلا طلبًا واحدًا في الوقت نفسه.
2. يتحقق الخادم من صلاحية المستخدم على المستأجر (M12).
3. إن لم يطابق `revision` الحالي: **409** مع اسم من عدّل ووقته. والمحرر يعرض «عُدّلت المسودة من جلسة أخرى» مع خياري تحميل الأحدث أو الكتابة فوقها (إعادة الإرسال بالـ `revision` الجديد بعد تأكيد).
4. **التحقق بملفين يُولَّدان من مخطط التحرير** (M03 القسم 2.4):
   - ملف `draft`: الأنواع، والقيم المسموحة، والحقول المجهولة، والحدود العليا للأطوال والأعداد، وحجم المستند (512 KB على الأكثر). الفشل يعني **422** ولا يُحفظ شيء، لأن مستندًا بهذه الأخطاء لا يمكن رسمه حتى في المعاينة.
   - ملف `publish` الكامل: الحقول الإلزامية والحدود الدنيا (مثل شريحة واحدة على الأقل). نتائجه تُعاد في `issues` بدرجة `error` **دون منع الحفظ**، لأن المسودة قيد التحرير قد تكون ناقصة. وهذا ما اقترحه M15 (القسم 5.2 فيه).
5. يشغّل `GuardrailLinter` (M03)، وتُضاف نتائجه إلى `issues` بدرجتها (`error` أو `warning`).
6. يُكتب المستند، ويُرفع `revision`، وتُحدَّث جداول استخدام الأصول.
7. يرد **200** بـ `revision` الجديد و`issues`.

### 3.2 بيانات المعاينة
1. **التهيئة لكل كتلة**: حين يتغير مصدر كتلة (تصنيف، أو منتجات يدوية، أو مصدر تلقائي) يطلب المحرر `POST /tenants/{t}/preview/hydrate` بالكتل المتغيرة فقط. ويرد الخادم بحقل `data` لكل كتلة بصيغة التسليم في M03 (مثل `product_card_data`)، من ذاكرة M10. ثم يحوّل `DraftAdapter` في المعاينة المستند محليًا (M03 القسم 3.6). بذلك لا تحتاج تعديلات الخصائص رحلة إلى الخادم.
2. **الرسم الكامل**: `POST /tenants/{t}/drafts/{kind}/{key}/render` باللغة والمراجعة (الافتراضي آخرها) ووقت محاكاة اختياري `as_of`. يمر المستند بخط الرسم (3.6) دون تخزين في CDN، مع ترك الكتل الفارغة ظاهرة بعلامة `preview_empty` ليعرض المحرر سبب غيابها. ويُستخدم عند فتح المحرر، وقبل النشر للمراجعة الأخيرة، ولمعاينة QR لاحقًا.

### 3.3 النشر الموحد (`releases`)
التاجر يتوقع زرًا واحدًا ينشر كل تغييراته (صفحة، وهوية، وشاشات). لذلك يُنشر عبر «إصدار» يضم مستندًا أو أكثر في عملية ذرية واحدة، كما اقترح M15.
1. `POST /tenants/{t}/releases` بقائمة المستندات، ولكل مستند `draft_revision` الذي راجعه التاجر في شاشة الفرق، مع ملاحظة اختيارية.
2. قفل `release:{tenant}` لمدة 30 ثانية لمنع إصدارين متزامنين.
3. لكل مستند:
   - إن تغيّر `revision` المسودة عما راجعه التاجر: **409** `draft_changed` للإصدار كله، لأن التاجر نشر ما لم يره.
   - تحقق صارم: ملف `publish`، ثم كل قواعد الحماية بدرجة `error`، ثم وجود أهداف الأفعال (G-14). أي خطأ في أي مستند يعني **422** بقائمة `issues` لكل مستند، ولا يُنشر شيء.
   - إن كان `body_hash` يساوي النسخة الحية: يُعلَّم `unchanged` ويُتخطى.
4. داخل معاملة واحدة:
   - يُنشأ سطر في `config_releases`.
   - لكل مستند متغير: نسخة جديدة في `config_versions` برقم تالٍ و`source = publish` و`release_id`، ثم نقل `live_version_id`، ثم سطر في `config_publications`.
   - فشل أي خطوة يلغي الإصدار كله.
5. بعد المعاملة:
   - سجل تدقيق في M12.
   - `RenderDocumentJob` يرسم المستندات المنشورة لكل مراجعة نشطة ولكل لغة مفعّلة.
   - ثم `PurgeCdnJob` بوسوم المستندات: `p-{tenant}-{key}` للصفحات، و`s-{tenant}` للـ shell، و`th-{tenant}` للهوية.
   - ثم الحدث `ConfigReleased`.
6. يرد **200** بـ `release_id` ورقم نسخة كل مستند. والهدف أن تخدم الـ CDN النسخ الجديدة خلال 60 ثانية (القسم 7).

### 3.4 الرجوع إلى نسخة سابقة
1. `POST /tenants/{t}/versions/{kind}/{key}/{number}/rollback`، ويقبل `?dry_run=true`.
2. **التشغيل التجريبي** يعيد دون أي كتابة: رقم النسخة التي ستُنشأ، والكتل التي ستُسقط لكل مراجعة عقد نشطة لأن المراجعة لا تدعمها، والكتل التي لها `min_app_version` أعلى من بعض الإصدارات النشطة. ونسبة الجلسات المتأثرة تأتي من M08 إن توفرت.
3. **التنفيذ**: تُنشأ نسخة **جديدة** برقم تالٍ، بجسم النسخة المطلوبة نفسه، و`source = rollback`، و`restored_from_version_id`. ثم الخطوة 5 من النشر.
4. لماذا نسخة جديدة لا نقل المؤشر إلى الخلف؟ حتى يبقى رقم النسخة الحية متزايدًا دائمًا. فالتطبيق يقارن `config` في الأعلام برقم نسخته (القسم 5.2)، والتحليلات تفرّق بين «النسخة 1841 قبل أسبوع» و«محتوى 1841 أعيد اليوم» (`page_version` مختلف).
5. إن كان جسم النسخة المطلوبة يساوي الحية: **200** بـ `unchanged: true`.
6. الرجوع إلى نسخة فيها كتل لم تعد المراجعة تدعمها لا يُرفض، فخط الرسم يُسقطها. والتشغيل التجريبي يُظهر ذلك قبل التنفيذ.

### 3.5 تقديم الصفحة للتطبيق
1. يطلب التطبيق `GET /api/app/v1/t/{tenant}/pages/{page}/{segment}/{locale}/{schema_version}`.
2. CDN: إصابة وETag مطابق تعني **304**. وإصابة دون تطابق تعني **200** من الذاكرة.
3. عند الإخفاق يصل الطلب إلى الخادم:
   1. يتحقق من المستأجر: غير موجود أو محذوف يعني **404**، وموقوف يعني **410**. وكلاهما يُخزَّن في CDN دقيقة واحدة.
   2. يتحقق من وجود الصفحة ونسخة حية لها.
   3. يتحقق من أن `schema_version` مراجعة معروفة. المراجعة الأحدث من الخادم أو الأقدم من أدنى مراجعة مدعومة تعني **400**.
   4. يقرأ نتيجة الرسم من Redis بالمفتاح `cfg:render:{tenant}:{page}:{segment}:{locale}:{rev}`.
   5. إن لم توجد، أو كان `version` أو `data_epoch` فيها قديمًا، يرسم تحت قفل `Cache::lock` لمدة 10 ثوانٍ، حتى لا يرسم طلبان متزامنان النتيجة نفسها. ومن ينتظر القفل يقرأ النتيجة بعده.
   6. يقارن `If-None-Match` بالـ ETag، فيرد **304** أو **200**.
4. يفحص `X-Supported-Blocks` مقابل `catalog.json`. إن لم يطابق يرد بنسخة محسوبة من الترويسة مع `Cache-Control: private, no-store`، ويسجّل تحذيرًا.

### 3.6 خط الرسم
لكل نسخة حية (أو مسودة في المعاينة)، لكل `(locale, schema_version)`:
1. **التوافق**: `BlockCatalog` من M03 يُبقي الكتلة أو يحولها لإصدار أقدم أو يُسقطها.
2. **الأعلام**: تُسقط الكتل خلف علم مغلق للتاجر (`brand_strip`).
3. **الظهور**: تُسقط الكتل المخفية (`visible = false`) والمنتهية (`ends_at` في الماضي). أما `starts_at` المستقبلي فيبقى في `visibility` ليحسمه الجهاز.
4. **الحسم بالنوع**: محلّل لكل نوع (`<Type>Resolver`):
   - **التوطين**: كل `localized_text` يصبح سلسلة بلغة الطلب، أو بلغة المتجر الافتراضية إن كان فارغًا.
   - **الأصول**: كل `asset_ref` يصبح `image_source` (رابط القالب، والمقاسات، والأبعاد، وblurhash، واللون، ونقطة التركيز). والصورة الخاصة باللغة تُختار إن وُجدت.
   - **المنتجات**: `product_source` يصبح استعلامًا إلى `CatalogReader` (M10)، ثم تُختصر النتائج إلى `product_card_data` (M03 القسم 4.3)، وتُرتب النافدة.
   - **التصنيفات والعلامات**: من `CatalogReader` أيضًا.
   - **الأفعال**: يُتحقق من الهدف. فعل إلى تصنيف أو منتج محذوف يصبح `null`، ويُسجَّل تحذير يظهر في المحرر.
   - **`zid_theme_section`**: يُقرأ آخر snapshot للقسم المربوط (3.10) ويُحوَّل إلى كتلة من نوع `render_as`، أو يطبَّق `fallback`.
5. **الكتل الفارغة**: كتلة منتجات بلا منتجات، أو تصنيفات بلا عناصر، تُسقط في التسليم.
6. **التجميع**: الغلاف مع `rendered_at`، ويُفحص حجمه (تحذير عند 150 KB، ورفض النشر عند 300 KB).
7. **التخزين**: الجسم مضغوطًا بـ gzip في Redis مع `etag = W/"xxh128"` و`version` و`data_epoch` و`built_at`، ومهلة 24 ساعة. والنتيجة تُبنى من جديد عند الطلب إن انتهت.

### 3.7 تحديث البيانات المهيّأة
1. يرسل M10 الحدث `CatalogChanged{tenant, kind, ids}` بعد معالجة webhooks `product.create` و`product.update` و`product.publish` و`product.delete` و`category.create` و`category.update` و`category.delete`. هذه الأحداث الستة عشر هي كل ما تتيحه زد، ولا يوجد بينها حدث للثيم أو الإعدادات ([Zid Webhooks](https://docs.zid.sa/webhooks)).
2. يُضاف المستأجر إلى مجموعة `cfg:dirty` مع وقت أول تغيير، ويُعالج بعد سكون 60 ثانية، حتى لا يُعاد الرسم مئات المرات عند تعديل جماعي.
3. `RefreshHydrationJob` يرفع `cfg:data_epoch:{tenant}`، ويعيد رسم الصفحات الحية التي فيها كتل منتجات أو تصنيفات للمراجعات النشطة.
4. إن تغيّر الـ ETag لصفحة، يُبطَل وسمها في CDN.
5. **تحديث دوري**: الصفحات التي فيها مصادر `newest` أو `best_selling` أو `on_sale` يُعاد رسمها كل 15 دقيقة، لأن ترتيبها يتغير دون حدث يدل عليه. والإبطال فقط إن تغيّر الـ ETag.

### 3.8 رفع الوسائط ومعالجتها
1. يطلب المحرر `POST /media/uploads` بالاسم والنوع والحجم وبصمة `sha256` والغرض (`purpose`، مثل `hero_slider`).
2. إن وُجد أصل جاهز بنفس البصمة للمستأجر: **200** بالأصل نفسه (`deduplicated: true`).
3. وإلا يُنشأ أصل بحالة `pending_upload`، ويُعاد رابط رفع مؤقت مدته 10 دقائق من `Storage::temporaryUploadUrl` مع الترويسات المطلوبة.
4. يرفع المتصفح الملف مباشرة إلى التخزين، ثم يستدعي `POST /media/{id}/complete`.
5. يتحقق الخادم من وجود الملف وحجمه (10 MB على الأكثر)، ويغيّر الحالة إلى `processing`، ويضيف `ProcessAssetJob` إلى الطابور.
6. **المعالجة** بـ libvips:
   1. قراءة الترويسة فقط، ورفض ما تجاوز 40 ميغابكسل أو 8,000 بكسل في أي بُعد (حماية من قنابل الضغط).
   2. التحقق من النوع الحقيقي من محتوى الملف: JPEG، أو PNG، أو WebP، أو AVIF، أو HEIC إن كانت libvips مبنية بـ libheif. وGIF المتحرك يُؤخذ أول إطاره مع تحذير.
   3. تدوير تلقائي حسب EXIF، ثم حذف كل البيانات الوصفية (ومنها الموقع الجغرافي)، ثم التحويل إلى sRGB.
   4. حساب `ratio = w / h`، وأقرب نسبة قياسية من 1:1، و4:3، و3:4، و16:9، و2:1، و3:1، و2:3.
   5. اقتراح القص: لكل نسبة تسمح بها الخانة المقصودة، يُستدعى `smartcrop` بطريقة `attention`، فيعيد مستطيل القص ومركز الانتباه ([libvips smartcrop](https://www.libvips.org/API/current/method.Image.smartcrop.html)). ومركز الانتباه يصبح `focal` للأصل.
   6. المقاسات: 320، و640، و960، و1280، و1920 بكسل عرضًا، دون تجاوز عرض الأصل. بصيغة WebP بجودة 80. وللوحة نسخة AVIF بعرض 640 فقط.
   7. blurhash بمكونات 4×3 من نسخة مصغرة 32 بكسل، ولون سائد من متوسط نسخة 1×1، وعلامة `has_alpha` للصور الشفافة (يستخدمها M02 لتحذير الوضع الداكن).
   8. رفع المقاسات إلى المجلد العام بترويسة `Cache-Control: public, max-age=31536000, immutable`.
7. الحالة `ready` والحدث `AssetReady`. والمحرر يستطلع `GET /media/{id}` كل ثانية حتى 20 ثانية.
8. **قبول اقتراح القص**: `POST /media/{id}/crops` بالنسبة والمستطيل ينشئ أصلًا مشتقًا جديدًا (`parent_asset_id`) يمر بالخطوات 6.6 و6.7. والأصول لا تُعدَّل أبدًا بعد جاهزيتها، فروابطها ثابتة ويصح تخزينها سنة.

**عند الفشل**: الحالة `failed` مع رمز (`too_large`، و`unsupported_type`، و`corrupt`، و`dimensions_exceeded`، و`processing_error`) ورسالة بلغتين، والملف الأصلي يُحذف بعد 24 ساعة.

**لماذا WebP للتطبيق؟** لم يُعثر على دعم مضمّن لفك AVIF في Flutter. والحزم المتاحة إضافات طرف ثالث، مثل `flutter_avif` الذي يضم libavif، و`piksel_avif` الذي يعتمد على مفكك النظام في Android 12 وiOS 16 فما فوق ([pub.dev/flutter_avif](https://pub.dev/packages/flutter_avif)، [pub.dev/piksel_avif](https://pub.dev/packages/piksel_avif)). فإضافة AVIF تكلّف حجمًا في الملف التنفيذي، أما WebP فمدعوم.

### 3.9 استيراد ثيم زد (ADR-0009)
1. **البدء**: يستدعيه M14 بعد اكتمال OAuth، أو التاجر من اللوحة. وينشئ `zid_imports` بحالة `queued`. ولا يُسمح باستيرادين متزامنين لمستأجر واحد.
2. **الجلب** (`fetching`):
   - النطاق من M10 فقط (نطاق المتجر المسجل)، لا من مدخل المستخدم. وهذا يمنع SSRF.
   - `GET https://{store}/api/v1/template-settings?template=home` بترويسات `Accept-Encoding: gzip` و`Accept-Language` لكل لغة مفعّلة و`Zid-Client-Platform: mobile-app`. المهلة 60 ثانية، والحد 30 MB بعد فك الضغط.
   - `GET settings` للهوية والشريط الإعلاني والشارات و`theme{id, version, theme_name}`.
   - `GET categories` للتحقق من المعرّفات وحل الروابط.
   - يُحفظ الرد الخام مضغوطًا في التخزين الخاص 30 يومًا للتشخيص.
   - قياس فعلي في 2026-11-10 لمتجر pcpalace: 11.1 MB خامًا، و0.77 MB منقولًا بـ gzip. وهذا يجعل المزامنة الدورية مقبولة الكلفة إن طُلبت مضغوطة.
3. **الاختصار** (`Slimmer`):
   - لكل قسم في `components[]`: `section_id`، و`template`، و`display`، و`meta.type`، وترتيبه في المصفوفة.
   - والإعدادات المعروفة في جدول التحويل فقط.
   - كائنات المنتجات والتصنيفات تُستبدل بمعرّفاتها. وقد رُصد شكلان للمنتجات: مصفوفة `[{product: {...}}]` في ثيم pcpalace، و`{results: [...]}` في ثيم ppowerstore.
   - روابط الصور تبقى، مع تفضيل `image_mobile` أو `img_mobile` على `image` و`image_pc` و`img_banner`.
   - الهدف 64 KB أو أقل للمتجر.
4. **التصنيف** (`SectionClassifier`) بالترتيب، وأول قاعدة تنطبق تحدد الثقة الأساسية:
   1. `meta.type` معروف: 0.95. وزد تقول إن الحقل لا يُملأ إلا في Soft Vitrin حتى الآن ([Theme Sections Settings](https://docs.zid.sa/theme-sections-settings-2258380m0)).
   2. اسم `template` مطابق في الجدول: 0.90.
   3. اسم `template` يطابق نمطًا بديلًا في الجدول: 0.80.
   4. شكل الإعدادات (heuristic)، مثل مصفوفة عناصر فيها صورة ورابط، أو مصفوفة تصنيفات، أو منتجات: 0.60.
   5. `ai_generated.jinja` بالـ heuristic نفسه، وبحد أقصى 0.50.
   6. لا شيء: 0.
5. **حساب الثقة النهائية** = الثقة الأساسية × نسبة الحقول الإلزامية المحلولة للكتلة الهدف (مثل صورة واحدة على الأقل للسلايدر)، ثم ناقص 0.05 لكل رابط لم يُحل، بحد أقصى ناقص 0.3.
6. **حل الروابط** (`ZidLinkResolver`، بقواعد M07):
   - `/categories/{id}/{slug}` يصبح `open_category`.
   - `/categories/{slug}` بلا معرّف (رُصد مثل `/categories/alot`) يُحل من شجرة التصنيفات بالـ slug.
   - `/products/{slug}` يصبح `open_product` بعد جلب المعرّف بالـ slug.
   - `/brands/{slug}` يصبح `search` بـ `brand_id`.
   - روابط `/pages/…` و`/l/…` والروابط الخارجية تصبح `open_url_inapp`.
   - رابط فارغ يعني بلا فعل.
7. **نقل الصور**: كل صورة من `media.zid.store` أو `img.zid.store` تمر بخط الوسائط (`source = zid_import`). وقائمة المضيفين المسموحة ثابتة.
8. **الاقتراحات** (`ready`): لكل قسم، الكتلة المقترحة والثقة والأسباب، والقرار الافتراضي:

| الثقة | القرار الافتراضي في المعالج |
|---|---|
| 0.80 أو أكثر | تُضاف ظاهرة |
| من 0.50 إلى 0.79 | تُضاف مخفية بعلامة «راجعها» |
| أقل من 0.50 | لا تُضاف. تظهر في قائمة «أقسام لم تُحوَّل»، مع خيار إضافتها كـ `zid_theme_section` مخفية أو تجاهلها |
| القسم مخفي في الويب (`display: false`) | يُضاف مخفيًا بعلامة «مخفي في الويب» |

9. **الربط**: الأقسام التي تتغير كثيرًا (السلايدر والبنرات) يقترح المعالج ربطها (`sync = on`). فإن قبل التاجر تُكتب الكتلة `zid_theme_section` بـ `render_as` المقترح بدل كتلة مستقلة، ويُنشأ سطر في `zid_section_bindings`.
10. **التطبيق**: `POST /imports/{id}/apply` بقرارات التاجر يكتب **مسودة** الرئيسية (لا ينشر). وإن كانت للتاجر مسودة غير فارغة، يُطلب تأكيد صريح بالاستبدال (`replace_draft: true`).
11. **الهوية والشريط**: ألوان `settings.branding.colors` والشعار و`mobile_app_logo` تُمرر إلى M02 بوصفها بذرة للهوية. و`settings.announcement_bar` يُقترح على M09 للشريط العام.
12. **إن فشل الجلب** (مهلة، أو 4xx أو 5xx، أو حجم زائد): الحالة `failed` برمز الخطأ، والمعالج يعرض بديلًا هو قالب رئيسية جاهز لقطاع المتجر من `presets`.

### 3.10 مزامنة الكتل المربوطة
1. `SyncZidBindingsJob` يعمل كل 6 ساعات للمستأجرين الذين لهم ربط نشط واحد على الأقل، وعند ضغط «مزامنة الآن» (مرة كل 5 دقائق على الأكثر).
2. يجلب أولًا `GET settings` (نحو 22 إلى 71 KB). إن تغيّر `theme.id` عن آخر استيراد: تصبح كل الروابط `orphaned`، ويظهر للتاجر اقتراح إعادة الاستيراد.
3. يجلب `template-settings` مضغوطًا، ويختصر الأقسام المربوطة فقط، ويحسب بصمة `xxh128` لكل قسم.
4. **القسم لم يتغير**: يُحدَّث `last_synced_at` فقط.
5. **القسم تغيّر**: تمر الصور الجديدة بخط الوسائط، ويُكتب snapshot جديد، ويُرفع `data_epoch`، فيُعاد الرسم ويُبطَل وسم الصفحة إن تغيّر الـ ETag.
6. **القسم اختفى من الرد**: الربط `orphaned`، والكتلة تطبق `fallback`، ويصل إشعار إلى لوحة التاجر.
7. **فشل الجلب**: يبقى آخر snapshot يُخدَم، ويُعاد المحاولة في الدورة التالية. وبعد 4 إخفاقات متتالية يُنبَّه فريق المنصة (M12).
8. **السجل**: النسخة المنشورة لا تتغير بالمزامنة، لأن الكتلة المربوطة تحمل المرجع لا المحتوى. لذلك يعرض الفرق والسجل «محتوى مربوط بثيم الويب، آخر مزامنة: …».

## 4. نموذج البيانات

### 4.1 الجداول (PostgreSQL)

كل جدول يحمل `tenant_id` مع نطاق عام (global scope) من M12، والمعرّفات ULID.

**`config_documents`**: مستند إعداد لكل صفحة أو shell أو هوية.

| الحقل | النوع | ملاحظات |
|---|---|---|
| `id` | ulid | PK |
| `tenant_id` | ulid | FK |
| `kind` | enum: `page`، و`shell`، و`theme` | — |
| `key` | varchar(64)، النمط `^[a-z0-9][a-z0-9-]{0,63}$` | للصفحات: `home` محجوز. وللـ shell والهوية: `default` |
| `page_kind` | enum: `home`، و`landing`، أو null | للصفحات فقط |
| `title` | jsonb بلغتين | اسم داخلي في اللوحة |
| `status` | enum: `active` أو `archived` | الأرشفة تُخفي الصفحة من التطبيق (404) |
| `created_at`، `updated_at` | timestamptz | — |

فهرس فريد: `(tenant_id, kind, key)`. وعند إنشاء مستأجر تُنشأ ثلاثة مستندات: `page:home`، و`shell:default`، و`theme:default`.

**`config_variants`**: نسخة لكل شريحة. في الإصدار الأول متغير واحد `default` لكل مستند.

| الحقل | النوع | ملاحظات |
|---|---|---|
| `id` | ulid | PK |
| `document_id` | ulid | FK |
| `segment_key` | varchar(32) | `default` |
| `priority` | smallint | للشرائح لاحقًا |
| `live_version_id` | ulid، nullable | مؤشر النسخة الحية |

فهرس فريد: `(document_id, segment_key)`.

**`config_drafts`**: مسودة واحدة لكل متغير.

| الحقل | النوع | ملاحظات |
|---|---|---|
| `variant_id` | ulid | PK و FK |
| `body` | jsonb | صيغة التحرير (M03) |
| `schema_rev` | integer | المراجعة التي حُفظ بها |
| `base_version_id` | ulid، nullable | النسخة التي بدأت منها المسودة |
| `revision` | integer | يزيد مع كل حفظ، ويُرسل في `If-Match` |
| `lint` | jsonb | آخر نتيجة لقواعد الحماية |
| `updated_by`، `updated_at` | — | — |

**`config_versions`**: نسخ ثابتة.

| الحقل | النوع | ملاحظات |
|---|---|---|
| `id` | ulid | PK |
| `variant_id` | ulid | FK |
| `number` | integer | يزيد لكل مستند، ويظهر للتاجر وفي التحليلات (`page_version`) |
| `body` | jsonb | صيغة التحرير |
| `body_hash` | char(32) | xxh128 |
| `schema_rev` | integer | — |
| `source` | enum: `publish`، و`rollback`، و`schedule` | — |
| `release_id` | ulid، nullable | الإصدار الذي نُشرت فيه |
| `restored_from_version_id` | ulid، nullable | للرجوع |
| `note` | varchar(200) | — |
| `created_by`، `created_at` | — | — |

فهرس: `(variant_id, number DESC)`. وعدم القابلية للتعديل يُفرض بـ trigger في قاعدة البيانات يرفض `UPDATE` و`DELETE`، لا بالكود وحده. وكل تغيير للمحتوى الحي (نشر، أو رجوع، أو جدولة) ينشئ نسخة جديدة، فالنسخة الحية هي دائمًا الأعلى رقمًا، و`live_version_id` اختصار للبحث فقط.

**`config_releases`**: `(id, tenant_id, note, created_by, created_at)`. والإصدار يجمع نسخ المستندات التي نُشرت معًا، ويعرضه سجل اللوحة.

**`config_publications`**: سجل إلحاقي فقط.

| الحقل | النوع |
|---|---|
| `id` | ulid |
| `variant_id`، `version_id`، `previous_version_id`، `release_id` | ulid |
| `action` | enum: `publish`، و`rollback`، و`schedule_start`، و`schedule_end` |
| `actor_type` | enum: `user` أو `system` |
| `actor_id` | ulid، nullable |
| `at` | timestamptz |

**`assets`**

| الحقل | النوع | ملاحظات |
|---|---|---|
| `id` | varchar، `med_` + ulid | PK. ويظهر في API باسم `media_id` |
| `tenant_id` | ulid | — |
| `status` | enum: `pending_upload`، و`processing`، و`ready`، و`failed`، و`deleted` | — |
| `source` | enum: `upload`، و`zid_import`، و`zid_sync` | — |
| `source_url` | text، nullable | للمستورد |
| `original_key` | text | في المجلد الخاص |
| `mime`، `bytes`، `sha256` | — | — |
| `width`، `height`، `ratio`، `nearest_ratio` | integer، وinteger، وnumeric(6,4)، وvarchar(5) | — |
| `blurhash`، `dominant_color`، `has_alpha` | varchar(64)، وchar(7)، وboolean | — |
| `focal_x`، `focal_y` | numeric(4,3) | من 0 إلى 1 |
| `variants` | jsonb | مصفوفة `{w, fmt, key, bytes}` |
| `crop_suggestions` | jsonb | مصفوفة `{ratio, x, y, w, h}` |
| `parent_asset_id`، `crop_rect` | للمشتق | — |
| `alt` | jsonb بلغتين | — |
| `error_code` | varchar(32) | — |
| `created_by`، `created_at` | — | — |

فهرس فريد جزئي: `(tenant_id, sha256)` حيث `parent_asset_id IS NULL` و`status = ready`.

**`asset_usages`**: `(asset_id, owner_type: draft أو version، owner_id, block_id)`. والأصل المستخدم في أي نسخة لا يُحذف أبدًا، لأن الرجوع ممكن دائمًا. والأصل غير المستخدم في أي مسودة أو نسخة لمدة 7 أيام يُحذف بمهمة يومية.

**`zid_imports`**

| الحقل | النوع |
|---|---|
| `id`، `tenant_id` | ulid |
| `status` | enum: `queued`، و`fetching`، و`mapping`، و`ready`، و`applied`، و`failed` |
| `trigger` | enum: `onboarding` أو `manual` |
| `theme` | jsonb: `{id, name, version}` |
| `raw_key`، `raw_bytes`، `transfer_bytes` | — |
| `slim` | jsonb |
| `proposals` | jsonb |
| `stats` | jsonb: العدد الكلي، والمضاف آليًا، والمعلّم للمراجعة، وغير المحوّل، ومتوسط الثقة |
| `error_code`، `created_at`، `applied_at`، `applied_by` | — |

**`zid_section_bindings`**

| الحقل | النوع |
|---|---|
| `id`، `tenant_id`، `document_id` | ulid |
| `block_id` | varchar(10) |
| `section_id` | uuid (معرّف زد) |
| `template`، `meta_type` | varchar |
| `render_as`، `fallback` | varchar |
| `sync` | boolean |
| `status` | enum: `active`، و`orphaned`، و`paused` |
| `last_fingerprint`، `last_synced_at`، `last_error`، `consecutive_failures` | — |

**`zid_section_snapshots`**: `(id, tenant_id, section_id, fingerprint, slim jsonb, resolved jsonb, fetched_at)`. ويُحفظ آخر 5 لكل قسم.

**`presets`**: هويات جاهزة (يملأ M02 محتواها) وقوالب رئيسية لكل قطاع.

| الحقل | النوع |
|---|---|
| `id` | ulid |
| `scope` | enum: `platform` أو `tenant` |
| `kind` | enum: `theme`، و`home_template`، و`block_template` |
| `sector` | enum: `perfume`، و`fashion`، و`electronics`، و`grocery`، و`gifts`، و`restaurants`، و`general` |
| `name` | jsonb |
| `body` | jsonb |
| `schema_rev` | integer |
| `preview_asset_id` | — |
| `is_active`، `sort` | — |

**جداول لاحقة** (القسم 9.3): `config_schedules`، و`seasonal_packs`، و`preview_tokens`، و`segments`، و`customer_facts`.

### 4.2 Redis

| المفتاح | المحتوى | المهلة |
|---|---|---|
| `cfg:render:{tenant}:{key}:{segment}:{locale}:{rev}` | الغلاف بـ gzip، و`etag`، و`version`، و`data_epoch`، و`built_at` | 24 ساعة |
| `cfg:data_epoch:{tenant}` | عدد صحيح | بلا مهلة |
| `cfg:dirty` | مجموعة مرتبة بوقت أول تغيير | — |
| `cfg:active_revs:{tenant}` | المراجعات التي طُلبت في آخر 30 يومًا | 30 يومًا |
| `lock:render:…`، و`lock:publish:{document}` | أقفال | 10 و30 ثانية |

### 4.3 التخزين
```text
private/t/{tenant}/a/{asset_id}/orig                 # الأصل كما رُفع، لا يُقدَّم
public/a/{tenant}/{asset_id}/w{320..1920}.webp        # يقدمه CDN، immutable
public/a/{tenant}/{asset_id}/w640.avif                # للوحة فقط
private/imports/{tenant}/{import_id}.json.gz          # 30 يومًا
```

### 4.4 على الجهاز
لا شيء من هذه الوحدة مباشرة. التطبيق يخزّن الأغلفة عبر M01 وM03.

## 5. الواجهات والعقود

المسارات تتبع اصطلاحات M12، وأسماؤها مطابقة لما يستدعيه M15 (القسم 5.2 فيه). مسارات اللوحة تحت `/api/v1/tenants/{t}` بمصادقة Sanctum. ومسارات التطبيق تحت `/api/app/v1/t/{tenant}` وهي عامة. و`{tenant}` في مسارات التطبيق معرّف عام مثل `t_8f2k1q` يُحقن في الملف التنفيذي. و`{kind}` أحد `page` أو `shell` أو `theme`، و`{key}` هو `home` أو مفتاح صفحة حملة للصفحات، و`default` للـ shell والهوية.

### 5.1 واجهات اللوحة

| الطريقة | المسار (بعد `/api/v1/tenants/{t}`) | الغرض |
|---|---|---|
| GET | `/pages` | قائمة الصفحات مع النسخة الحية وحالة المسودة |
| POST | `/pages` | إنشاء صفحة حملة |
| PATCH | `/pages/{key}` | تعديل العنوان |
| DELETE | `/pages/{key}` | أرشفة (حذف ناعم). و`home` لا تُحذف |
| GET | `/drafts/{kind}/{key}` | المسودة و`revision` و`issues` |
| PUT | `/drafts/{kind}/{key}` | حفظ المسودة (`If-Match`) |
| DELETE | `/drafts/{kind}/{key}` | إلغاء المسودة والعودة إلى النسخة الحية |
| POST | `/drafts/{kind}/{key}/render` | غلاف تسليم كامل للمراجعة |
| POST | `/preview/hydrate` | بيانات الكتل التي تغيّر مصدرها |
| GET | `/diff/{kind}/{key}?from=live&to=draft` | الفرق، ويقبل أيضًا رقمي نسختين |
| POST | `/releases` | النشر الموحد لمستند أو أكثر |
| GET | `/releases` | سجل الإصدارات |
| GET | `/versions/{kind}/{key}` | سجل النسخ بترقيم cursor |
| GET | `/versions/{kind}/{key}/{number}` | جسم نسخة |
| POST | `/versions/{kind}/{key}/{number}/rollback` | الرجوع، ويقبل `?dry_run=true` |
| POST | `/versions/{kind}/{key}/{number}/restore` | نسخ نسخة إلى المسودة |
| GET | `/api/v1/block-types?schema_version=N` | كتالوج الكتل للمحرر (M03، BLK-15)، خارج نطاق المستأجر |
| POST | `/media/uploads` | طلب رفع |
| POST | `/media/{id}/complete` | إنهاء الرفع |
| GET | `/media/{id}` | الحالة والمقاسات واقتراحات القص |
| POST | `/media/{id}/crops` | أصل مشتق بقص |
| GET | `/media` | مكتبة الوسائط |
| DELETE | `/media/{id}` | حذف (409 إن كان مستخدمًا في نسخة) |
| POST | `/imports/zid-theme` | بدء الاستيراد (202) |
| GET | `/imports/{id}` | الحالة والاقتراحات |
| POST | `/imports/{id}/apply` | تطبيق القرارات على المسودة |
| GET | `/bindings?page={key}` | الروابط وحالتها |
| PATCH | `/bindings/{id}` | `sync` أو `fallback` أو `render_as` |
| POST | `/bindings/sync` | «مزامنة الآن» |

**صيغة `issues`** في كل الاستجابات: مصفوفة عناصر فيها `severity` (`error` أو `warning`)، و`code` (معرّف قاعدة حماية مثل `G-04`، أو كلمة المخطط مثل `maximum`، أو `required_for_locale`)، و`path` (JSON Pointer)، و`block_id`، و`message` بلغتين.

**حفظ المسودة**

```http
PUT /api/v1/tenants/tnt_8f3k2/drafts/page/home
If-Match: "17"
Content-Type: application/json

{"document": {"schema_version": 3, "blocks": [
  {"id": "b_h7k2m9qa", "type": "hero_slider", "v": 1,
   "props": {"height": "m", "autoplay": true, "interval_s": 5, "indicator": "dots", "margin": "edge", "corner": "inherit",
             "slides": [{"image": {"media_id": "med_01JC9Y1QW8", "crop": "2:1"},
                         "title": {"ar": "عروض رمضان", "en": "Ramadan deals"},
                         "action": {"type": "open_category", "category_id": 412823}}]}}
]}}
```

```json
{
  "revision": 18,
  "saved_at": "2026-11-10T10:41:07Z",
  "issues": [
    {"severity": "warning", "code": "G-04", "block_id": "b_h7k2m9qa", "path": "/blocks/0/props/slides/0/image",
     "message": {"ar": "عرض الصورة 900 بكسل، والموصى به 1080 على الأقل", "en": "Image is 900px wide; 1080px or more is recommended"}}
  ]
}
```

**خطأ البنية (422)**

```json
{
  "code": "schema_validation_failed",
  "status": 422,
  "issues": [
    {"severity": "error", "code": "maximum", "block_id": "b_h7k2m9qa", "path": "/blocks/0/props/interval_s",
     "message": {"ar": "القيمة يجب ألا تتجاوز 10", "en": "Must be at most 10"}}
  ]
}
```

**تعارض (409)**

```json
{"code": "draft_conflict", "status": 409, "current_revision": 19,
 "updated_by": {"id": "usr_01JC9X4T", "name": "نورة العتيبي"}, "updated_at": "2026-11-10T10:40:55Z"}
```

**الفرق**

```json
{
  "from": {"version": 1842}, "to": {"draft_revision": 18},
  "summary": {"added": 1, "removed": 0, "moved": 2, "changed": 1},
  "blocks": [
    {"block_id": "b_c9d4w2xs", "type": "countdown", "change": "added", "position": 1},
    {"block_id": "b_p3n8z1rt", "type": "product_carousel", "change": "moved", "from_position": 1, "to_position": 3},
    {"block_id": "b_h7k2m9qa", "type": "hero_slider", "change": "changed",
     "fields": [{"path": "/props/height", "label": {"ar": "الارتفاع", "en": "Height"}, "before": "m", "after": "l"}]}
  ]
}
```

الفرق يُحسب على مستوى الكتل بمعرّفاتها أولًا (إضافة، وحذف، ونقل)، ثم على مستوى الحقول للكتل المتغيرة. والتسمية من `x-ui.label` في المخطط، حتى يقرأه تاجر غير تقني.

**النشر الموحد**

```json
// POST /api/v1/tenants/tnt_8f3k2/releases
{"items": [{"kind": "page", "key": "home", "draft_revision": 18},
           {"kind": "theme", "key": "default", "draft_revision": 7}],
 "note": "بنرات رمضان"}

// 200
{"release_id": "rel_01JD5Q", "published_at": "2026-11-10T10:42:30Z",
 "items": [{"kind": "page", "key": "home", "version": 1843, "unchanged": false},
           {"kind": "theme", "key": "default", "version": 58, "unchanged": false}],
 "propagation": {"render": "queued", "cdn_purge": "queued", "tags": ["p-t_8f2k1q-home", "th-t_8f2k1q"]},
 "issues": [{"severity": "warning", "code": "G-13", "block_id": "b_p3n8z1rt", "path": "/blocks/2/props/title/en"}]}
```

**الرجوع التجريبي**

```json
// POST /api/v1/tenants/tnt_8f3k2/versions/page/home/1840/rollback?dry_run=true
{"would_create_version": 1844,
 "compatibility": [{"schema_version": 2, "dropped_blocks": [{"block_id": "b_C0unT3r1", "type": "countdown", "v": 1}]}],
 "min_app_version_blocks": [{"block_id": "b_C0unT3r1", "min_app_version": "1.4.0", "sessions_share_below": 0.07}]}
```

**تهيئة المعاينة**

```json
// POST /api/v1/tenants/tnt_8f3k2/preview/hydrate
{"locale": "ar", "blocks": [{"id": "b_p3n8z1rt", "type": "product_carousel", "v": 1,
  "props": {"source": {"kind": "category", "category_id": 413265, "sort": "popularity"}, "limit": 12, "out_of_stock": "last"}}]}

// 200 — data لكل كتلة بصيغة التسليم في M03 (القسم 4.1 و4.3)
{"data": {"b_p3n8z1rt": {
   "products": [{"id": "6f06bc89-0cd4-490f-9894-238a93962416", "slug": "oud-royal-100ml", "name": "عود رويال 100 مل",
                 "image": {"thumbnail": "https://img.zid.store/…", "small": "https://img.zid.store/…", "large": "https://img.zid.store/…"},
                 "price": 450.0, "sale_price": 360.0, "currency": "SAR", "discount_percentage": 20,
                 "in_stock": true, "quantity": 3, "is_infinite": false, "has_options": false}],
   "view_all": {"type": "open_category", "category_id": 413265}}},
 "ttl_s": 300}
```

**طلب رفع وسائط**

```json
// POST /api/v1/tenants/tnt_8f3k2/media/uploads
{"filename": "ramadan-hero.jpg", "content_type": "image/jpeg", "bytes": 1834221,
 "sha256": "9f2c…", "purpose": "hero_slider"}

// 201
{"media_id": "med_01JC9Y1QW8", "status": "pending_upload",
 "upload": {"method": "PUT", "url": "https://storage…/private/t/…/orig?X-Amz-Signature=…",
            "headers": {"Content-Type": "image/jpeg"}, "expires_at": "2026-11-10T10:52:00Z"}}
```

**حالة وسائط جاهزة**

```json
{
  "media_id": "med_01JC9Y1QW8", "status": "ready", "width": 2400, "height": 1350,
  "ratio": 1.7778, "nearest_ratio": "16:9", "blurhash": "LKO2?U%2Tw=w]~RBVZRi};RPxuwH",
  "dominant_color": "#E8D9C4", "has_alpha": false, "focal": [0.52, 0.41],
  "url": "https://cdn.intishar.app/a/t_8f2k1q/med_01JC9Y1QW8/w640.webp",
  "variants": [{"w": 320, "fmt": "webp"}, {"w": 640, "fmt": "webp"}, {"w": 960, "fmt": "webp"},
               {"w": 1280, "fmt": "webp"}, {"w": 1920, "fmt": "webp"}],
  "crop_suggestions": [{"ratio": "2:1", "x": 0, "y": 112, "w": 2400, "h": 1200},
                       {"ratio": "3:2", "x": 175, "y": 0, "w": 2025, "h": 1350}]
}
```

**اقتراحات الاستيراد**

```json
{
  "import_id": "imp_01JCA0", "status": "ready",
  "theme": {"id": "…", "name": "…", "version": "…"},
  "stats": {"sections": 12, "auto": 7, "review": 3, "unsupported": 2, "avg_confidence": 0.78},
  "proposals": [
    {"section_id": "7d529039-a25b-4b75-b1e0-cf4ebe508ca2", "template": "sections/main-slider.jinja", "order": 0,
     "web_display": true, "block_type": "hero_slider", "confidence": 0.9, "decision": "add",
     "suggest_binding": true, "reasons": ["template_exact"],
     "preview_block": {"type": "hero_slider", "v": 1, "props": {"height": "m", "autoplay": true, "interval_s": 5}}},
    {"section_id": "…", "template": "sections/home-tabs-section.jinja", "order": 6,
     "block_type": "product_carousel", "confidence": 0.5, "decision": "add_hidden",
     "reasons": ["template_partial", "tabs_not_supported_first_tab_only"]},
    {"section_id": "…", "template": "sections/testimonials.jinja",
     "block_type": null, "confidence": 0, "decision": "skip", "reasons": ["block_not_in_mvp"]}
  ]
}
```

**تطبيق الاستيراد**

```json
// POST /api/v1/tenants/tnt_8f3k2/imports/imp_01JCA0/apply
{"replace_draft": true, "decisions": [
  {"section_id": "7d529039-…", "action": "add", "bind": true},
  {"section_id": "…", "action": "add", "visible": false},
  {"section_id": "…", "action": "skip"}
]}
// 200 → {"draft_revision": 1, "blocks_added": 9, "bindings_created": 2}
```

### 5.2 واجهات التطبيق

| الطريقة | المسار | الاستجابة |
|---|---|---|
| GET | `/api/app/v1/t/{tenant}/pages/{page}/{segment}/{locale}/{schema_version}` | غلاف الصفحة (M03 القسم 4.1) |
| GET | `/api/app/v1/t/{tenant}/shell/{locale}/{schema_version}` | إعداد الشاشات الأصلية (M03 القسم 5.9) |
| GET | `/api/app/v1/t/{tenant}/theme/{schema_version}` | الـ tokens بصيغة M02. ولا لغة في المفتاح |
| GET | `/api/app/v1/t/{tenant}/flags` | يملكه M12، وتضيف هذه الوحدة الحقلين `config` و`blocks` |

**ترويسات الاستجابة لـ 200 أو 304**

```http
HTTP/2 200
Content-Type: application/json; charset=utf-8
Content-Encoding: gzip
ETag: W/"5f1c0b2e9a7d4c31a2b6e0f4c9d8a713"
Cache-Control: public, max-age=300, stale-while-revalidate=600, stale-if-error=86400
Cache-Tag: t-t_8f2k1q,p-t_8f2k1q-home,d-t_8f2k1q
Vary: Accept-Encoding
Date: Tue, 10 Nov 2026 10:43:02 GMT
```

- **لماذا لا `s-maxage`؟** في Cloudflare تحمل `s-maxage` دلالة `proxy-revalidate`، فتُلغي تقديم النسخة القديمة أثناء إعادة التحقق ([Cloudflare Cache-Control](https://developers.cloudflare.com/cache/concepts/cache-control/)). أما `max-age` فلا أثر لها على التطبيق، لأن عميله لا يستخدم ذاكرة HTTP بل ذاكرته الخاصة بالـ ETag (M03).
- **إن احتجنا مهلة مختلفة للـ CDN**: `Cloudflare-CDN-Cache-Control` يتحكم في Cloudflare وحده ولا يُمرَّر للعميل ([CDN-Cache-Control](https://developers.cloudflare.com/cache/concepts/cdn-cache-control/))، وهو مبني على [RFC 9213](https://www.rfc-editor.org/rfc/rfc9213).
- **الـ ETag ضعيف عمدًا**: Cloudflare قد يحوّل الـ ETag القوي إلى ضعيف أو يحذفه عند الضغط ([Cloudflare ETag](https://developers.cloudflare.com/cache/reference/etag-headers/))، والمقارنة الضعيفة كافية لـ `If-None-Match`. والقيمة xxh128 لجسم الغلاف، مثل ما يفعله `cache.headers:…;etag` في Laravel 13 ([Laravel Responses](https://laravel.com/docs/13.x/responses))، لكنها تُحسب مرة واحدة عند الرسم وتُخزَّن.
- **وسوم الإبطال**: `t-` كل ما للمستأجر، و`p-` الصفحة بكل لغاتها ومراجعاتها وشرائحها، و`d-` كل ما فيه بيانات مهيّأة.

**أخطاء التطبيق**

| الحالة | الرمز | التخزين في CDN |
|---|---|---|
| مستأجر غير موجود | 404 `tenant_not_found` | 60 ثانية |
| مستأجر موقوف | 410 `tenant_disabled` | 60 ثانية |
| صفحة غير موجودة أو مؤرشفة أو بلا نسخة حية | 404 `page_not_found` | 60 ثانية |
| مراجعة غير مدعومة | 400 `unsupported_schema_version` مع `min` و`max` | 300 ثانية |
| خطأ رسم | 503 مع `Retry-After: 30` | لا، والـ CDN يقدم القديم بـ `stale-if-error` |

**مساهمة هذه الوحدة في endpoint الأعلام**

```json
{
  "min_supported_app_version": "1.2.0",
  "config": {"page:home": 1843, "shell:default": 12, "theme:default": 57},
  "blocks": {"disabled": [{"type": "countdown", "v": 1, "app_versions": ">=1.3.0 <1.3.2"}]}
}
```

`config` يعطي رقم النسخة الحية، فيعرف التطبيق هل يحتاج إعادة التحقق دون طلب الصفحة. و`blocks.disabled` مفتاح إيقاف للكتل المعطوبة يحسمه الجهاز (M03 القسم 3.4).

### 5.3 العقود مع الوحدات الأخرى

| مع | العقد |
|---|---|
| M03 | عقود `06-api/blocks/` ومراجعاتها، و`BlockCatalog` و`BlockDownConverters` و`GuardrailLinter` (تستدعيها هذه الوحدة)، وصيغتا التحرير والتسليم |
| M10 | واجهة `CatalogReader` أدناه، والحدث `CatalogChanged`، ونطاق المتجر، وعميل HTTP لـ `template-settings` و`settings` |
| M12 | المستأجر والنطاق العام، وSanctum والأدوار، وسجل التدقيق (`config.published`، و`config.rolled_back`، و`config.import_applied`، و`asset.deleted`)، والأعلام، وSentry، واصطلاحات الأخطاء |
| M02 | مخطط مستند `theme`، ومحتوى `presets` من نوع `theme` |
| M09 | قسم `announcement` في مستند `shell` |
| M07 | قواعد `ZidLinkResolver` (الوحدة نفسها في PHP، واختبارات مشتركة بجدول حالات واحد) |
| M14 | يستدعي `POST /imports/zid-theme` بعد OAuth، ويقرأ الحالة لعرض «أول معاينة» |
| M08 | `page_version` في الأحداث هو `config_versions.number` |
| M01 وM13 | أداة `tool/make_snapshot.dart` (M01) تطلب في خط البناء غلافي `home` و`shell` بكل لغة لمراجعة البناء، وتضمّنهما في `assets/bootstrap/snapshot.json` |

```php
interface CatalogReader // يقدّمه M10 بذاكرة Redis وحدّ معدّل لكل متجر
{
    /** GET products بالاستعلام. الذاكرة 10 دقائق بمفتاح (tenant, hash(query), locale). */
    public function products(TenantId $t, ProductQuery $q, Locale $l): ProductPage;
    /** GET products/{id} لكل معرّف، مع ذاكرة لكل منتج. */
    public function productsByIds(TenantId $t, array $ids, Locale $l): array;
    /** GET categories، والذاكرة 60 دقيقة، وتُبطَل بأحداث category.*. */
    public function categories(TenantId $t, Locale $l): CategoryTree;
    /** GET brands (N*)، وإن فشل فـ Merchant API ‎/v2/products/brands. */
    public function brands(TenantId $t, Locale $l): array;
}
```

### 5.4 استراتيجية CDN

| البند | القرار |
|---|---|
| ما يُخزَّن | مسارات `/api/app/v1/t/…` بطريقة GET فقط، ومفتاح الذاكرة هو المسار كاملًا. ولا تدخل الترويسات المخصصة في المفتاح، ولا cookies |
| المهلة | 300 ثانية، و600 ثانية لتقديم القديم أثناء إعادة التحقق، و24 ساعة عند أخطاء الأصل |
| الإبطال عند النشر والرجوع | وسم `p-{tenant}-{key}` بعد اكتمال الرسم المسبق |
| الإبطال عند تغير البيانات | وسم الصفحة المعنية فقط إن تغيّر الـ ETag |
| الإبطال عند إيقاف المستأجر | وسم `t-{tenant}` |
| الأصول | مسار مستقل ثابت المحتوى بمهلة سنة، فلا إبطال أبدًا. والقص ينتج أصلًا جديدًا |
| Cloudflare | Purge by Tag بترويسة `Cache-Tag`. والحد 16 KB للترويسة و1,024 حرفًا للوسم في الطلب ([Purge by tag](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-tags/)) |
| CloudFront (بديل) | لا وسوم. يُبطَل المسار `/api/app/v1/t/{tenant}/pages/{key}/*` بمسار واحد بحرف بدل. وأول 1,000 مسار في الشهر مجانًا ثم 0.005 دولار للمسار ([AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PayingForInvalidation.html)). بتقدير 100 تاجر × 30 نشرًا في الشهر، تكون الكلفة نحو 10 دولارات |
| فشل الإبطال | `PurgeCdnJob` يعيد المحاولة 5 مرات بتأخير أسي. وإن فشل تبقى المهلة 300 ثانية سقفًا للتأخير، ويُنبَّه فريق المنصة |
| حماية الأصل | حد 120 طلبًا في الدقيقة لكل IP على مسارات التطبيق في الخادم، والـ CDN يمتص الباقي |

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| تبويبان يحرران المسودة نفسها | الحفظ الثاني يأخذ 409. والكتابة فوقه بقرار صريح فقط |
| إصداران متزامنان من جلستين | القفل يجعل الثاني ينتظر حتى 30 ثانية، ثم 409 `release_in_progress` |
| فشل جزئي داخل إصدار متعدد المستندات | لا يوجد: المعاملة واحدة، فإما تُنشر كل المستندات أو لا شيء |
| النشر دون تغيير | 200 وكل العناصر `unchanged: true`، ولا نسخة ولا إبطال |
| الرجوع إلى نسخة جسمها يساوي الحية | 200 بـ `unchanged: true` بلا نسخة جديدة |
| نسخة فيها أصل حُذف يدويًا من التخزين | `AssetResolver` يُسقط الصورة، والكتلة تصبح فارغة فتُسقط. وتنبيه مراقبة بخطأ حرج، لأن هذا يخرق قاعدة عدم الحذف |
| زد لا ترد أثناء الرسم | تُستخدم آخر نتيجة في ذاكرة M10 مهما كان عمرها. وإن لم توجد، تُسقط كتل المنتجات من هذا الرسم فقط، ويُعاد الرسم بعد 60 ثانية |
| حد المعدّل في زد | M10 يرد بالذاكرة. والرسم لا يتجاوز 6 كتل منتجات (G-09)، أي 6 طلبات على الأكثر لكل لغة عند إخفاق الذاكرة |
| تعديل جماعي لـ 2,000 منتج | سكون 60 ثانية يجعلها إعادة رسم واحدة |
| صفحة حملة تُؤرشف وهناك بنرات تشير إليها | النشر التالي لأي صفحة فيها `open_page` إليها يفشل بـ G-14. والنسخ الحية الحالية تبقى، والتطبيق يعرض «الصفحة غير متاحة» |
| رفع ملف أكبر من 10 MB رغم الرابط المؤقت | `complete` يرد 422 `too_large` ويُحذف الملف |
| ملف بامتداد صورة ومحتوى غير صورة | `unsupported_type` بعد فحص المحتوى |
| صورة 12,000 × 9,000 | `dimensions_exceeded` قبل فك الصورة |
| `template-settings` يعيد 422 أو 404 (ثيم قديم أو غير Vitrin) | الاستيراد `failed` برمز `template_settings_unavailable`، والمعالج يعرض القوالب الجاهزة |
| `template-settings` أكبر من 30 MB | `failed` برمز `payload_too_large` |
| ثيم بأقسام خاصة كلها (مثل `mh-*` في متجر mahasen) | معظم الأقسام دون 0.5. ويُقترح قالب القطاع، مع إضافة ما تحوّل |
| التاجر غيّر ثيم الويب | كل الروابط `orphaned` واقتراح إعادة الاستيراد. والكتل المستقلة لا تتأثر |
| قسم مربوط أُخفي في الويب (`display: false`) | يُحترم الإخفاء: الكتلة تطبق `fallback = hide` حتى يعود ظاهرًا |
| رابط في قسم مربوط يشير إلى منتج محذوف | الفعل `null` للعنصر، ويبقى العنصر ظاهرًا |
| طلب التطبيق بمراجعة أقدم من أدنى مراجعة مدعومة | 400، والتطبيق يعرض التحديث الإجباري من الأعلام (M12) |
| حذف تاجر لحسابه أو إلغاء الاشتراك | M12 يطلق الحذف: تُعلَّم المستندات، وتُحذف الأصول بعد 30 يومًا، ويُبطَل وسم `t-` |

## 7. المتطلبات غير الوظيفية

| البند | الهدف | القياس |
|---|---|---|
| نسبة الإصابة في CDN لمسارات التطبيق | 95% أو أكثر | تحليلات CDN أسبوعيًا |
| زمن الأصل عند وجود نتيجة رسم | p95 أقل من 120 ms | مقياس `cfg_delivery_duration` |
| زمن الرسم البارد مع ذاكرة كتالوج دافئة | p95 أقل من 1.5 ثانية | `cfg_render_duration` |
| زمن الرسم البارد دون ذاكرة | p95 أقل من 4 ثوانٍ لصفحة فيها 6 كتل منتجات | اختبار حمل |
| من النشر إلى خدمة CDN للنسخة الجديدة | p95 أقل من 60 ثانية. وPRD يطلب 5 دقائق إلى التطبيق عند التنقل التالي | مقياس من `published_at` إلى أول 200 بالـ ETag الجديد |
| توفر مسارات التطبيق | 99.9% شهريًا عند الحافة، بفضل `stale-if-error` | مراقب خارجي كل دقيقة (M12) |
| حفظ المسودة | p95 أقل من 300 ms لمسودة 200 KB، والتحقق وحده أقل من 50 ms | مقياس |
| الفرق | p95 أقل من 200 ms | مقياس |
| معالجة صورة 12 ميغابكسل | p95 أقل من 10 ثوانٍ من `complete` إلى `ready` | مقياس الطابور |
| الاستيراد | p95 أقل من 90 ثانية لثيم 11 MB، دون نقل الصور | مقياس |
| حجم الغلاف | تحذير عند 150 KB، ورفض النشر عند 300 KB | `GuardrailLinter` |
| الأمان | مسارات اللوحة بنطاق المستأجر وصلاحية الدور (M12). ومسارات التطبيق للقراءة ولا تحمل بيانات شخصية. والاستيراد يجلب فقط من نطاق المتجر المسجل، والصور فقط من `media.zid.store` و`img.zid.store`. والأصول تُجرَّد من EXIF | اختبارات تكامل للعزل بين مستأجرين |
| التدقيق | كل نشر ورجوع واستيراد مطبَّق وحذف أصل في سجل M12 بالفاعل والوقت والنسخة | اختبار |
| العربية | كل رسائل الأخطاء والتحذيرات بلغتين، والمسودات تقبل نصوصًا عربية بلا تطبيع يغيّرها | اختبار |
| المراقبة | مقاييس: `cfg_render_duration`، و`cfg_delivery_duration`، و`cfg_cdn_purge_latency`، و`cfg_schema_failures`، و`cfg_import_confidence`، و`cfg_binding_sync_failures`. وكل خطأ في Sentry بوسوم `tenant_id` و`document` و`version` | لوحة M12 |

## 8. الاعتماديات والمجهول

### 8.1 التجارب المرتبطة
| SPK | الأثر | ما يُبنى الآن |
|---|---|---|
| SPK-09 | عتبات الثقة، وجدول التحويل، وهل يعيد `template-settings` المنشور فقط. ومعيار نجاحها 70% تحويلًا صحيحًا لأقسام أشهر خمسة ثيمات | الجلب والاختصار وجدول التحويل الأولي مبني على عينات حية (القسم 8.3). والعتبات قابلة للضبط من الإعداد |
| SPK-12 | هل لـ Storefront API حد معدّل يقيّد التهيئة والمزامنة؟ وهل تلتزم زد باستقرار `settings` و`brands`؟ | الحد 6 كتل منتجات، والذاكرة 10 دقائق، والمزامنة كل 6 ساعات، وكلها قابلة للضبط |
| SPK-15 | إن فشلت، تصبح معاينة QR (F-M08b) أساسية، فتُرفع CFG-18 إلى Must | `draft/render` يخدم الطريقتين |

### 8.2 تعارضات وأسئلة للمشرف
1. **الشرائح Could في PRD (F-M13)، والتكليف يطلب تقييمها في الخادم**. هذه المواصفة تبني المفتاح والجداول جاهزة للشرائح، وتؤجل التقييم إلى «لاحقًا» مع تصميم كامل (القسم 9.3). **القرار**: هل تُرفع إلى Should؟ وانتبه إلى أن `has_purchased` يحتاج ربط هوية العميل (SPK-07)، وأن مستوى الولاء لا مصدر موثقًا له.
2. **الجدولة والحزم الموسمية Should**. لكن موسم رمضان التالي يبدأ نحو منتصف فبراير 2027. إن كان الإطلاق قبله أو أثناءه، فالجدولة قيمة تجارية مباشرة. **مقترح**: إبقاؤها Should مع تقديم CFG-16 أول قصص المرحلة الثانية.
3. **مكان المخططات**: نفس سؤال M03 القسم 8.2-1. هذه الوحدة تفترض submodule مثبتًا على وسم.
4. **WebView لقسم مربوط** (ADR-0009 البند 3): غير مقدّم في الإصدار الأول. والسبب في M03 القسم 8.2-3.
5. **لا webhook للثيم في زد**: الأحداث الستة عشر لا تشمل الثيم ولا الإعدادات ([Zid Webhooks](https://docs.zid.sa/webhooks)). فالمزامنة استطلاع دوري (كل 6 ساعات) مع زر «مزامنة الآن». **يُسأل فريق زد** عن حدث لتغيير الثيم أو إعداداته، ويُضاف السؤال إلى قناة P-5.
6. **ADR-0006 لم يحدد معنى `schema_version`**: عُرّف هنا رقمَ مراجعة حزمة العقود (M03 القسم 5.1). النتيجة أن عدد نسخ الصفحة في CDN يساوي عدد اللغات × المراجعات النشطة × الشرائح.
7. **CDN** (D-06): المواصفة تفترض CDN يدعم الإبطال بالوسوم أو بالمسار مع حرف بدل، و`stale-while-revalidate` و`stale-if-error`. Cloudflare يحقق ذلك موثقًا. وCloudFront يحتاج محوّل إبطال بالمسار.
8. **`best_selling`**: نفس سؤال M03 القسم 8.2-5.
9. **مقترحات M15 التي اعتُمدت هنا**: أسماء المسارات (`/tenants/{t}/drafts/{kind}/{key}` و`releases` و`media` و`preview/hydrate` و`block-types`)، و`revision` في `If-Match`، و`issues` الموحدة، والتحقق المزدوج (البنية تمنع الحفظ، والاكتمال يمنع النشر فقط)، والنشر الذري الموحد، والرجوع بنسخة جديدة مع تشغيل تجريبي. ومعنى «الرجوع بنقرة» في ADR-0006 محفوظ.
10. **خلاف مفتوح مع M15**: M15 يعامل كل شاشة أصلية مستندًا مستقلًا (`drafts/screen/{screen}`)، وهذه المواصفة (وM03 القسم 5.9) تجمعها في مستند `shell:default` واحد، لأن التطبيق يجلبها في طلب واحد عند الإقلاع، ولأن قيودها متداخلة (مثل بطاقة المنتج المستخدمة في الصفحة والقوائم). **القرار للمشرف**. ويمكن لـ M15 أن يعرض محرر كل شاشة على قسم من المستند نفسه.
11. **شكل مستند الصفحة في أمثلة M15** (`items` في أعلى الكتلة، و`hero_slider` بإصدار 2، و`height: md`، و`source.kind: zid_category`) يختلف عن عقد M03 (`props.slides`، والإصدار 1، و`height: m`، و`source.kind: category`). وM15 يصرّح بأن الشكل يملكه M03، فالأمثلة هناك تُحدَّث.

### 8.3 جدول التحويل الأولي (من عينات حية في 2026-11-10)

قُرئ `template-settings?template=home` من خمسة متاجر عامة بطلب GET للقراءة فقط: pcpalace، وppowerstore، وopt، وrawand، وmahasen. لم يحمل `meta.type` إلا متجر mahasen بأنواع خاصة (`mh-hero`، و`mh-stats`…). والجدول نقطة البداية، وSPK-09 يوسّعه.

| `template` أو `meta.type` | الكتلة | التحويل | الثقة الأساسية |
|---|---|---|---|
| `meta.type = slider`، و`sections/main-slider.jinja`، و`sections/slider_img.jinja` | `hero_slider` | `slider[]`: الصورة `image_mobile` أو `image` أو `image_pc`، والرابط `link` أو `url`. و`autoplay` أو `autoplay_enabled`، و`autoplay_delay` إلى `interval_s` | 0.95 و0.90 |
| `sections/home-banners-section.jinja` | `banner_grid` | `ads[]` (`image` و`link`). و`display_type` إلى `layout` (مثل `four_columns` إلى `4`) | 0.90 |
| `sections/banner.jinja`، و`sections/mini-banner.jinja` | `banner_grid` بتخطيط `1` | `image_mobile` أو `img_mobile` أو `image` أو `img_banner`، و`url` | 0.90 |
| `sections/ggallery.jinja` | `banner_grid` | `gallery[]`، والتخطيط من عدد العناصر | 0.80 |
| `sections/home-categories-section.jinja`، و`sections/category-section.jinja`، و`sections/category-list.jinja` | `category_strip` يدوي | `categories[].category.id`. و`square_shape` إلى `cards`، وغيره `circles` | 0.90 |
| `sections/category-products-section.jinja` | `product_carousel` بمصدر تصنيف | `category.id` | 0.90 |
| `sections/offers.jinja`، و`sections/products-section.jinja`، و`sections/product-category.jinja`، و`sections/product_grid.jinja` | `product_carousel` | إن طابق `more_url` النمط `/categories/{id}/…` فالمصدر تصنيف، وإلا يدوي من معرّفات المنتجات. و`product_limit` أو `products_count` إلى `limit` | 0.80 |
| `sections/home-tabs-section.jinja`، و`sections/multi-products.jinja` | `product_carousel` للتبويب الأول فقط | لا كتلة تبويبات في الإصدار الأول | 0.50 |
| `sections/home-columns-products.jinja` | `product_carousel` لأول عمود | — | 0.40 |
| `sections/advertisement-bar.jinja` | `announcement_bar` | أول عنصر في `advertisement_bar[]` (`title`). ويُقترح أيضًا للشريط العام (M09) | 0.70 |
| `sections/features-section.jinja`، و`sections/store-features.jinja` | `trust_badges` | `store_features[]` أو `features[]`: العنوان، والوصف إلى `subtitle`، والصورة أيقونة مخصصة. وأول 4 فقط | 0.75 |
| `sections/partners.jinja` | `banner_grid` بتخطيط `4` ونسبة `1:1` | `store_partners[]` (`image` و`url`). و`brand_strip` إن كانت كل الروابط `/brands/…` والعلم مفعّلًا | 0.60 |
| `sections/testimonials.jinja`، و`sections/video.jinja`، و`sections/home-faqs-section.jinja`، و`sections/branches.jinja`، و`sections/compare-content.jinja`، و`sections/points-products.jinja` | لا شيء في الإصدار الأول | تظهر في «أقسام لم تُحوَّل». و`testimonials` و`video` كتلتان مؤجلتان (Should) | 0 |
| `vitrin:sections/ai_generated.jinja` وأي اسم مجهول | heuristic | مصفوفة صور وروابط: سلايدر إن احتوى المفتاح كلمة `slider`، وإلا بنرات. ومصفوفة تصنيفات: `category_strip`. ومنتجات: `product_carousel`. ونص فقط: `rich_text` | 0.60، أو 0.50 لأقسام الذكاء الاصطناعي |

## 9. تقسيم العمل

### 9.1 القصص

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| CFG-01 | الجداول والترحيلات: المستندات، والمتغيرات، والمسودات، والنسخ بـ trigger يمنع التعديل، وسجل النشر، وإنشاء المستندات الثلاثة مع المستأجر | Must | نعم | M12 (المستأجرون) |
| CFG-02 | المسودة: القراءة، والحفظ بـ `If-Match` و`revision`، والتحقق بملفي `draft` و`publish` (opis) بمؤشرات JSON Pointer ورسائل بلغتين، و`issues` الموحدة، واستدعاء قواعد الحماية، والإلغاء | Must | نعم | CFG-01، وBLK-01، وBLK-16 (يمكن البدء بنسخة فارغة منه) |
| CFG-03 | النشر الموحد `releases` الذري لعدة مستندات، وسجل النسخ والإصدارات، والرجوع بنسخة جديدة مع التشغيل التجريبي، والاستعادة إلى المسودة، والتدقيق | Must | نعم | CFG-02، وM12 (التدقيق) |
| CFG-04 | الفرق المنظم بالكتل والحقول وتسمياتها | Must | نعم | CFG-02 |
| CFG-05 | خط الرسم: المحللات، والتوطين، وحل الأصول، والتحقق من الأفعال، و`BlockCatalog`، ونتائج الرسم في Redis مع القفل، و`draft/render` | Must | نعم (بيانات المنتجات وهمية) | CFG-03، وBLK-15 |
| CFG-06 | التهيئة الخادمية: المنتجات والتصنيفات والعلامات عبر `CatalogReader`، و`data_epoch`، والتحديث بالأحداث مع سكون 60 ثانية، والتحديث الدوري كل 15 دقيقة | Must | ينتظر M10 (`CatalogReader`)، وتُبنى الآن على نسخة وهمية | CFG-05، وM10، وSPK-12 للحدود |
| CFG-07 | مسارات التطبيق الثلاثة مع ETag و304 والترويسات والأخطاء وفحص `X-Supported-Blocks` وحد الطلبات، والمساهمة في الأعلام | Must | نعم | CFG-05، وM12 (الأعلام) |
| CFG-08 | محوّل CDN: الواجهة، وCloudflare بالوسوم، وCloudFront بالمسار، و`PurgeCdnJob` بإعادة المحاولة | Must | ينتظر D-06 للمزوّد، والواجهة و`NullPurger` الآن | CFG-07 |
| CFG-09 | رفع الوسائط: طلب الرفع، والرابط المؤقت، وإزالة التكرار، والإنهاء، والمكتبة، والحذف مع فحص الاستخدام، والحذف الدوري لغير المستخدم | Must | نعم | CFG-01، وM12 (إعداد التخزين) |
| CFG-10 | معالجة الوسائط بـ libvips: الحدود، وفحص النوع، وEXIF، والمقاسات WebP، وblurhash، واللون، والنسبة، و`smartcrop`، والأصول المشتقة | Must | نعم | CFG-09 |
| CFG-11 | الاستيراد، الجزء الأول: الجلب الآمن، والحفظ الخام، والاختصار، والمصنف، وجدول التحويل، و`ZidLinkResolver`، ونقل الصور، مع fixtures من العينات الحية | Must | نعم | CFG-10، وM10 (نطاق المتجر)، وM07 (قواعد الروابط) |
| CFG-12 | الاستيراد، الجزء الثاني: الاقتراحات بالثقة والعتبات، وواجهة التطبيق على المسودة، وبذرة الهوية لـ M02، واقتراح الشريط لـ M09 | Must | ينتظر SPK-09 | CFG-11، وM14 (الاستدعاء) |
| CFG-13 | الربط والمزامنة: snapshots، والبصمات، واكتشاف تغيير الثيم، والروابط اليتيمة، و«مزامنة الآن»، وحسم `zid_theme_section` في الرسم | Must | ينتظر SPK-09 | CFG-12، وBLK-17 |
| CFG-14 | مستندا `shell` و`theme` بنفس دورة الحياة، وجدول `presets` وبذرته (الهويات من M02، وقوالب القطاعات) | Must | نعم | CFG-03، وM02 (مخطط الـ tokens) |
| CFG-15 | التصليب: المقاييس، واختبار حمل لمسارات التطبيق، وقياس زمن النشر إلى CDN، واختبارات العزل بين المستأجرين | Must | لا، بعد CFG-07 وCFG-08 | CFG-07، وCFG-08 |
| CFG-16 | جدولة النشر ومهمة التفعيل | Should | نعم | CFG-03 |
| CFG-17 | الحزم الموسمية | Should | لا | CFG-16، وCFG-14 |
| CFG-18 | رموز معاينة QR | Should (تصبح Must إن فشلت SPK-15) | نعم | CFG-05، وM07 (المسار المخفي) |
| CFG-19 | الشرائح وendpoint السياق | Could | لا | قرار 8.2-1، وSPK-07 |
| CFG-20 | اختبارات A/B للكتل | Could | لا | CFG-19، وM08 |

### 9.2 معايير القبول لأهم القصص

**CFG-02: المسودة**
1. **بافتراض** مسودة بـ `revision = 17`، **عندما** يحفظ المحرر بـ `If-Match: "17"`، **إذن** يرد 200 بـ `revision = 18`.
2. **بافتراض** أن جلسة أخرى حفظت فصار `revision = 18`، **عندما** يحفظ المحرر بـ `If-Match: "17"`، **إذن** يرد 409 باسم من عدّل ووقته، ولا يتغير الجسم المخزَّن.
3. **بافتراض** كتلة `hero_slider` بـ `interval_s = 15`، **عندما** يُحفظ، **إذن** يرد 422 بخطأ واحد مؤشره `/blocks/0/props/interval_s` وكلمته `maximum` ورسالته بالعربية والإنجليزية.
4. **بافتراض** صورة شريحة عرضها 900 بكسل، **عندما** يُحفظ، **إذن** يرد 200 وفيه `issue` بدرجة `warning` ورمز `G-04`.
5. **بافتراض** سلايدر بلا شرائح (ينقص الحد الأدنى في ملف `publish`)، **عندما** يُحفظ، **إذن** يرد 200 وفيه `issue` بدرجة `error`، وتُحفظ المسودة. **وعندما** يحاول النشر، **إذن** يرد 422.

**CFG-03: النشر والرجوع**
1. **بافتراض** مسودة صالحة تختلف عن الحية، **عندما** ينشر التاجر عبر `releases`، **إذن** تُنشأ نسخة برقم يزيد 1 بـ `release_id`، ويشير إليها المؤشر، ويُكتب سطر `publish` وسطر تدقيق.
1ب. **بافتراض** إصدار يضم `page:home` و`theme:default`، ومسودة الهوية فيها خطأ G-02 بدرجة `error`، **عندما** ينشر التاجر، **إذن** يرد 422 بـ `issues` للهوية، ولا تُنشأ نسخة لأي من المستندين.
1ج. **بافتراض** أن التاجر راجع `draft_revision = 18`، ثم حُفظت المسودة من جلسة أخرى فصارت 19، **عندما** ينشر، **إذن** يرد 409 `draft_changed` ولا يُنشر شيء.
2. **بافتراض** نسخة منشورة، **عندما** يُنفَّذ `UPDATE config_versions SET body = …` مباشرة في قاعدة البيانات، **إذن** يرفضه الـ trigger بخطأ.
3. **بافتراض** النسخ 1841 و1842 و1843، والحية 1843، **عندما** يرجع التاجر إلى 1841، **إذن** تُنشأ النسخة 1844 بجسم 1841 و`source = rollback` و`restored_from_version_id` يشير إلى 1841، وتبقى كل النسخ في السجل، ويُبطَل وسم الصفحة.
3ب. **بافتراض** الطلب نفسه مع `dry_run=true`، **إذن** يرد بـ `would_create_version = 1844` وقائمة الكتل التي ستُسقط لكل مراجعة نشطة، ولا يُكتب شيء.
4. **بافتراض** مسودة فيها `countdown` انتهى وقته، **عندما** ينشر، **إذن** يرد 422 بخطأ G-07 ولا تُنشأ نسخة.

**CFG-07: التقديم للتطبيق**
1. **بافتراض** نسخة حية للصفحة `home`، **عندما** يطلب التطبيق المسار بـ `ar` والمراجعة 3، **إذن** يرد 200 بغلاف `schema_version = 3`، وترويسات `ETag` ضعيف، و`Cache-Tag` فيه `p-{tenant}-home`، وبلا `s-maxage`.
2. **بافتراض** أن التطبيق أرسل `If-None-Match` يساوي الـ ETag الحالي، **إذن** يرد 304 بلا جسم.
3. **بافتراض** نشر نسخة جديدة، **عندما** يطلب التطبيق المسار بعد 60 ثانية، **إذن** يستلم ETag جديدًا.
4. **بافتراض** طلب بالمراجعة 1 والأدنى المدعوم 2، **إذن** يرد 400 `unsupported_schema_version` بـ `min = 2`.
5. **بافتراض** مستأجرين A وB، **عندما** يُطلب مسار A بمعرّف صفحة لا يوجد إلا عند B، **إذن** يرد 404.

**CFG-06: التحديث بالأحداث**
1. **بافتراض** رئيسية فيها `product_carousel` بمصدر تصنيف، **عندما** يصل `CatalogChanged` لمنتج في التصنيف، **إذن** يُعاد الرسم خلال 90 ثانية، ويُبطَل الوسم إن تغيّر الـ ETag.
2. **بافتراض** وصول 500 حدث خلال 30 ثانية، **إذن** تحدث إعادة رسم واحدة لكل صفحة متأثرة.
3. **بافتراض** أن زد لا ترد، **عندما** يُعاد الرسم، **إذن** تُستخدم آخر نتيجة مخزنة للكتالوج، ولا يتغير الغلاف المقدَّم.

**CFG-10: معالجة الوسائط**
1. **بافتراض** JPEG بأبعاد 2400×1350 فيه بيانات GPS، **عندما** يكتمل الرفع، **إذن** يصبح الأصل `ready` خلال 10 ثوانٍ بخمسة مقاسات WebP، و`nearest_ratio = 16:9`، وblurhash، ولون سائد، وتخلو كل المقاسات من EXIF.
2. **بافتراض** رفع بخانة `hero_slider`، **إذن** تحوي `crop_suggestions` اقتراحًا لنسبة 2:1 على الأقل.
3. **بافتراض** ملف بامتداد `.jpg` محتواه PDF، **إذن** يصبح الأصل `failed` برمز `unsupported_type`.
4. **بافتراض** رفع الملف نفسه مرتين، **إذن** يعيد الطلب الثاني الأصل الأول بـ `deduplicated: true` دون رفع جديد.

**CFG-11 وCFG-12: الاستيراد**
1. **بافتراض** fixture من متجر pcpalace (12 قسمًا، بلا `meta.type`)، **عندما** يُشغَّل المصنف، **إذن** يتحول `main-slider.jinja` إلى `hero_slider` بثقة 0.80 أو أكثر، وتتحول أقسام البنرات إلى `banner_grid`، وأقسام التصنيفات إلى `category_strip` بمعرّفات صحيحة.
2. **بافتراض** رابط شريحة `/categories/1261106/gaming-pc`، **إذن** يصبح الفعل `open_category` بـ `category_id = 1261106`.
3. **بافتراض** رابط `/categories/alot` بلا معرّف، و`alot` موجود في شجرة التصنيفات، **إذن** يُحل إلى معرّفه.
4. **بافتراض** قسم `testimonials.jinja`، **إذن** يظهر في «أقسام لم تُحوَّل» ولا يُضاف إلى المسودة.
5. **بافتراض** مسودة غير فارغة، **عندما** يطبَّق الاستيراد دون `replace_draft`، **إذن** يرد 409 `draft_not_empty`.
6. **بافتراض** أي نتيجة استيراد، **إذن** لا تُنشأ نسخة منشورة، ولا يتغير ما يراه المتسوقون.

**CFG-13: المزامنة**
1. **بافتراض** سلايدر مربوط، وغيّر التاجر صورة في ثيم الويب، **عندما** تعمل المزامنة، **إذن** تُنقل الصورة الجديدة إلى الأصول، ويتغير الغلاف المقدَّم، ولا تُنشأ نسخة جديدة.
2. **بافتراض** أن التاجر حذف القسم المربوط من الثيم، **إذن** يصبح الربط `orphaned`، والكتلة تطبق `fallback`، ويصل إشعار إلى اللوحة.
3. **بافتراض** أن `settings.theme.id` تغيّر، **إذن** تصبح كل الروابط `orphaned` ويُقترح إعادة الاستيراد.

### 9.3 لاحقًا

**جدولة النشر (CFG-16، Should)**
- جدول `config_schedules`: المتغير، ولقطة ثابتة من المستند (`document` و`body_hash`) تُؤخذ من المسودة عند الجدولة وتُتحقق بملف `publish`، و`starts_at`، و`ends_at` الاختياري، وسياسة العودة (`previous` أو `none`)، والحالة (`pending`، و`active`، و`completed`، و`cancelled`، و`skipped`، و`failed`)، و`pack_id`.
- `ActivateSchedulesJob` كل دقيقة عبر جدولة Laravel ([Scheduling](https://laravel.com/docs/13.x/scheduling)). يلتقط الجداول المستحقة بـ `FOR UPDATE SKIP LOCKED`، وينشئ نسخة جديدة من اللقطة بـ `source = schedule` (فيبقى رقم النسخة الحية متزايدًا)، ويكتب `schedule_start`، ويرسم، ويُبطل.
- **عند الانتهاء**: تُنشأ نسخة جديدة بجسم النسخة التي كانت حية قبل البدء، **فقط** إن كانت النسخة الحية ما زالت نسخة الجدولة. وإن نشر التاجر يدويًا أثناء الجدولة، تصبح الحالة `skipped` ويُشعَر التاجر.
- جدولان متداخلان لنفس المتغير يُرفضان بـ 409.
- المحرر يعرض التاريخ الهجري تسمية ثانوية (M15).
- التطبيق يرى التغيير عند التنقل التالي بعد الإبطال. وما يحتاج دقة الثانية يُعبَّر عنه بـ `visibility.starts_at` في الكتل.

**الحزم الموسمية (CFG-17، Should)**
- جدول `seasonal_packs` بالموسم (`ramadan`، و`eid_fitr`، و`eid_adha`، و`national_day`، و`founding_day`، و`white_friday`، و`custom`)، والاسم، والفترة.
- الحزمة تجمع جداول لمستندات `theme` و`home` و`shell` (والشريط والسبلاش الداخلي من خلاله) بـ `pack_id` واحد، وتُفعَّل وتنتهي معًا في معاملة واحدة.
- قوالب الحزم في `presets` بنوع `block_template` لكل موسم.

**رموز معاينة QR (CFG-18، Should)**
- `POST /pages/{key}/preview-tokens` يعيد رمزًا عشوائيًا بطول 32 بايت (base64url)، يُخزَّن مجزّأً بـ SHA-256 في `preview_tokens` مع المستأجر والمستند والمنشئ و`expires_at` بعد 30 دقيقة.
- ويعيد `deep_link` على نطاق M07، مثل `https://{link-domain}/preview/{token}`، واللوحة ترسم QR محليًا.
- التطبيق (مسار مخفي في M07) يطلب `GET /api/app/v1/preview/{token}?locale=ar&schema_version=3`، فيستلم غلاف تسليم للمسودة الحالية (لا لقطة ثابتة) مع `Cache-Control: no-store`، وشريط «معاينة» ثابت.
- رمز منتهٍ أو ملغى يرد 410. والإلغاء بـ `DELETE /preview-tokens/{id}`، وحد 20 رمزًا نشطًا لكل مستأجر.

**الشرائح والاستهداف (CFG-19، Could)**

| الحقيقة | القيم | المصدر |
|---|---|---|
| `auth` | `visitor` أو `logged_in` | الجهاز (حالة جلسة زد) |
| `lifecycle` | `new` (أول فتح قبل أقل من 7 أيام) أو `returning` | الجهاز |
| `has_purchased` | boolean | الخادم: جدول `customer_facts` من webhooks `order.create` (M10)، بشرط ربط هوية العميل (SPK-07) |
| `loyalty_tier` | نص | **مجهول**: لم يُعثر على مصدر موثق لمستويات الولاء في زد. يُبحث قبل التنفيذ |
| `city_id` | رقم مدينة | الجهاز (المدينة المختارة)، أو عنوان العميل الافتراضي |
| `language` | `ar` أو `en` | مسار الطلب |
| `platform` | `ios` أو `android` | الترويسة |
| `app_version` | semver | الترويسة |

- **التقييم**: `POST /api/app/v1/t/{tenant}/context` بحقائق الجهاز ورمز العميل إن وُجد. يضيف الخادم حقائقه، ويقيّم شرائح المستأجر بالأولوية (أول شريحة تنطبق لكل صفحة لها متغيرات)، ويعيد `{"segments": {"home": "s2"}, "ttl_s": 3600}`.
- يطلب التطبيق مسار CDN بمفتاح الشريحة. والمفتاح معرّف غامض (`s2`) لا يكشف شيئًا عن المتسوق.
- **القواعد** JSON بصيغة `{"all": [{"fact": "has_purchased", "op": "eq", "value": true}]}`، مع العوامل `eq`، و`in`، و`gte`، و`lte`، و`semver_gte`.
- **الحدود**: 10 شرائح لكل مستأجر، و5 متغيرات لكل صفحة.
- الحقائق القادمة من الجهاز غير موثوقة، وهذا مقبول، لأن الشريحة تحدد محتوى تسويقيًا لا صلاحيات.

**اختبارات A/B (CFG-20، Could)**: متغيرات بنسب، وتوزيع ثابت بتجزئة معرّف الجهاز، وحدث `experiment_exposure` من M03، وتقرير من M08.

## 10. المصادر
- قرارات المشروع: [ADR-0004](../adr/0004-hybrid-sdui-typed-blocks.md)، و[ADR-0005](../adr/0005-laravel-modular-monolith-bff.md)، و[ADR-0006](../adr/0006-layouts-in-platform-api.md)، و[ADR-0009](../adr/0009-import-then-own-home.md)، و[ADR-0010](../adr/0010-nextjs-web-frontends.md)، و[PRD](../01-prd.md)، و[spikes.md](../spikes.md)، و[M03](M03-blocks-pages.md).
- البحث الداخلي: [تقرير المزايا والتخصيص](../../reports/مزايا%20وتخصيص%20تطبيقات%20متاجر%20زد.md)، و`research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md`، و`flutter_configurable_architecture.md`، و`local_builders_teardown.md`.
- زد: [Theme Sections Settings](https://docs.zid.sa/theme-sections-settings-2258380m0)، و[Webhooks](https://docs.zid.sa/webhooks)، و[Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0)، و[List Products](https://docs.zid.sa/list-products-25510175e0)، و[Store Settings Mapping](https://docs.zid.sa/store-settings-mapping-1379317m0)، و[List Brands (Merchant)](https://docs.zid.sa/list-brands-43653974e0)، و[llms.txt](https://docs.zid.sa/llms.txt).
- عينات حية (GET للقراءة فقط، 2026-11-10): [pcpalace](https://pcpalace.com.sa/api/v1/template-settings?template=home)، و[ppowerstore](https://ppowerstore.com/api/v1/template-settings?template=home)، و[opt.sa](https://opt.sa/api/v1/template-settings?template=home)، و[rawand](https://rawand.com.sa/api/v1/template-settings?template=home)، و[mahasen](https://mahasen.com/api/v1/template-settings?template=home).
- Laravel: [Laravel 13 released](https://laravel-news.com/laravel-13-released)، و[HTTP Responses: cache.headers](https://laravel.com/docs/13.x/responses)، و[File Storage: temporaryUploadUrl](https://laravel.com/docs/13.x/filesystem)، و[Task Scheduling](https://laravel.com/docs/13.x/scheduling).
- JSON Schema: [Draft 2020-12](https://json-schema.org/draft/2020-12)، و[opis/json-schema](https://packagist.org/packages/opis/json-schema).
- الصور: [libvips smartcrop](https://www.libvips.org/API/current/method.Image.smartcrop.html)، و[jcupitt/vips](https://packagist.org/packages/jcupitt/vips)، و[bepsvpt/blurhash](https://packagist.org/packages/bepsvpt/blurhash)، و[intervention/image](https://packagist.org/packages/intervention/image)، و[flutter_avif](https://pub.dev/packages/flutter_avif)، و[piksel_avif](https://pub.dev/packages/piksel_avif).
- CDN: [Cloudflare Cache-Control](https://developers.cloudflare.com/cache/concepts/cache-control/)، و[CDN-Cache-Control](https://developers.cloudflare.com/cache/concepts/cdn-cache-control/)، و[ETag headers](https://developers.cloudflare.com/cache/reference/etag-headers/)، و[Purge by cache-tags](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-tags/)، و[Purge for all plans](https://developers.cloudflare.com/changelog/post/2025-04-01-purge-for-all/)، و[CloudFront invalidation pricing](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PayingForInvalidation.html)، و[RFC 9213](https://www.rfc-editor.org/rfc/rfc9213).
