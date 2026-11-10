# M04: التسوق: التصنيفات، والقوائم والفلاتر، والبحث، وصفحة المنتج، والمفضلة، والسلة، والدفع، وتأكيد الطلب

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter، وLaravel (محاولات الدفع في الـ BFF)، وخدمة خارجية: زد (Storefront API وصفحة الدفع) |
| المتطلبات | F-S04, F-S05, F-S06, F-S06b, F-S07, F-S08, F-S09, F-S13 (وF-S16 وF-S18 في «لاحقًا») |
| القرارات | ADR-0003, ADR-0004, ADR-0005 |
| تعتمد على | M01 (عميل HTTP ومخزن الـ cookies والموجّه والتخزين المحلي والأعلام)، وM02 (تنسيق السعر ورمز الريال والأرقام وRTL)، وM03 (ترتيب وحدات صفحة المنتج ونمط البطاقة وموجّه الأفعال)، وM05 (الدخول والجلسة ورمز المتسوق)، وM10 (webhook `order.create` وإعادة جلب الطلب)، وM11 (إعدادات المتجر المقدَّمة للتطبيق)، وM08 (تصنيف الأحداث)، وM06 وM09 (طلب إذن الإشعارات بعد الطلب) |
| بادئة القصص | SHOP |

## 1. الغرض والنطاق

تملك هذه الوحدة رحلة الشراء كلها في تطبيق المتسوق: من تبويب التصنيفات، إلى قائمة المنتجات والبحث، ثم صفحة المنتج والمفضلة والسلة، ثم الدفع في WebView، ثم شاشة تأكيد أصلية. كل الشاشات أصلية عبر Storefront API على نطاق المتجر، إلا الدفع فهو صفحة زد داخل WebView (ADR-0003). وهذا مسار واحد من مسارات الوحدة، يُبنى بعناية لكنه لا يحمل وحده قيمة المنتج.

**نمط كل شاشة** (التعريف في PRD القسم 5):

| الشاشة | المتطلب | الأولوية | النمط | ملاحظة |
|---|---|---|---|---|
| تبويب التصنيفات | F-S04 | Must | N | `GET categories` |
| قائمة المنتجات (PLP) | F-S05 | Must | N، وفلتر الماركة N\* | `GET products` مع `filters.attributes` |
| البحث | F-S06 | Must | N | `GET products/search` و`GET products?q=` |
| ماسح الباركود | F-S06b | Should | N | `mobile_scanner` |
| صفحة المنتج (PDP) | F-S07 | Must | N، وإعدادات المتجر N\* أو B | `GET products/{id}` و`POST products/{id}/options` |
| المفضلة | F-S13 | Must | N للمسجل، ومحلية للزائر | `account/wishlists` |
| السلة | F-S08 | Must | N | `cart` و`cart/coupons` و`cart/loyalty` و`cart/gift-cards` |
| الدفع | F-S09 | Must | W + B | `/checkout` و`/checkout/guest`، ومحاولات الدفع في الـ BFF |
| تأكيد الطلب | F-S09 | Must | B | شاشة أصلية بعد التأكيد من الخادم |

**داخل الإصدار الأول (Must)**: كل ما في الجدول عدا الماسح. ويشمل ذلك «نبهني» عبر `stock-alerts` في زد، والسعر شاملًا الضريبة، وترتيب النافد آخرًا، وسطر التقسيط الأصلي، والشراء كزائر ظاهرًا دائمًا.

**لاحقًا**: ماسح الباركود (Should)، وكتابة المراجعات (Should)، وعدّاد نهاية العرض والطلب المسبق (Should)، وجسر `purchase_event` كطبقة ثالثة لكشف النجاح (Should)، وتنبيه عودة المخزون وانخفاض السعر عبر إشعارات المنصة (F-S16، Should، يملكه M06)، والبحث العربي الذكي (F-S18، Should)، وحقول الرفع في المنتجات المخصصة (Could)، وأدوات تابي وتمارا الرسمية (Could). التفاصيل في القسم 3.10.

**ليس من مسؤولية الوحدة**:
- الكتل في الرئيسية وصفحات الحملات، ومنها `product_carousel` و`category_strip` (M03). لكن M03 يعيد استخدام `ProductCard` و`PriceText` المعرّفين هنا.
- الدخول والجلسة والملف والعناوين والطلبات (M05). وM04 يستدعي مسار الدخول من السلة ويستهلك حالة الجلسة فقط.
- إرسال الإشعارات ومركز تفضيلاتها (M06)، وصيغة الروابط العميقة (M07)، وتصنيف الأحداث وتقاريرها (M08).
- عميل HTTP ومخزن الـ cookies المشترك (M01). وM04 يملك أغلفة endpoints المتجر ونماذجها.

## 2. المكونات حسب الطبقة

### 2.1 Flutter

**الحزم** (آخر إصدار على pub.dev في 2026-11-10. الحزم المشتركة يثبّتها M01، وتُذكر هنا لأن هذه الوحدة تعتمد على سلوكها):

| الحزمة | الإصدار | الاستخدام هنا | ملاحظة |
|---|---|---|---|
| `webview_flutter` | 4.14.1 | صفحة الدفع | يتطلب Flutter 3.38 وDart 3.10. وأضاف 4.14.0 الدالة `WebViewCookieManager.getCookies` ([pub.dev](https://pub.dev/packages/webview_flutter)) |
| `webview_flutter_wkwebview` | 3.27.2 | تنفيذ iOS | يُثبَّت صراحة لأن قاعدة منع الحقن (3.8) مبنية على سلوك هذا الإصدار |
| `webview_flutter_android` | 4.14.1 | تنفيذ أندرويد | `setOnShowFileSelector` و`setOnPlatformPermissionRequest` و`setAcceptThirdPartyCookies` |
| `dio` | 5.11.1 | عميل Storefront | من M01 |
| `cookie_jar` و`dio_cookie_manager` | 4.0.9 و3.5.0 | مخزن cookies واحد للـ API | `PersistCookieJar` بتخزين مشفّر من M01 |
| `cached_network_image` | 4.0.6 | صور المنتجات | يُختار المقاس من `images[].image` حسب العرض |
| `flutter_widget_from_html_core` | 0.17.4 | وصف المنتج HTML | الروابط تمر بموجّه M03 |
| `drift` | 2.35.4 | سجل البحث، والمفضلة المحلية، وذاكرة المنتجات، ومحاولة الدفع | جداول القسم 4.1 |
| `url_launcher` | 6.3.3 | الروابط الخارجية من صفحة الدفع، وWhatsApp | `LaunchMode.externalApplication` |
| `share_plus` | 13.3.1 | مشاركة المنتج | |
| `permission_handler` | 13.0.2 | الكاميرا لتابي داخل الـ WebView، والماسح لاحقًا | الطلب عند الحاجة فقط |
| `image_picker` | 1.2.4 | اختيار صورة الهوية في صفحة تابي على أندرويد | عبر `setOnShowFileSelector` |
| `connectivity_plus` | 7.3.2 | حالة عدم الاتصال | |
| `mobile_scanner` | 7.5.0 | ماسح الباركود (Should) | خلف علم `barcode_scanner` |

التكبير في المعرض بـ `InteractiveViewer` المدمج في Flutter، لا بحزمة `photo_view` التي لم تُحدَّث منذ أبريل 2024.

**الملفات الرئيسية**:

```text
packages/zid_storefront/                 # Dart خالص: أغلفة endpoints المتجر ونماذجها (يشاركها M05)
  lib/src/api/catalog_api.dart           # products, products/search, products/{id}, options, reviews, bundle-offers, stock-alerts
  lib/src/api/categories_api.dart
  lib/src/api/cart_api.dart              # cart, cart/items, cart/coupons, cart/loyalty, cart/gift-cards, cart/clone, bank-discounts
  lib/src/api/wishlist_api.dart
  lib/src/models/                        # Product, ProductSummary, Variant, Facet, Cart, CartLine, CartTotal ...
  test/fixtures/                         # استجابات حقيقية من المتجر التطويري (P-2)
packages/storefront_ui/                  # ADR-0004: يُبنى للجوال ولمعاينة الويب
  lib/src/product_card.dart              # البطاقة الموحدة (يعيد M03 استخدامها في الكتل)
  lib/src/price_text.dart                # يستلم القيمة المحسوبة، والتنسيق من M02
lib/features/shop/
  categories/  plp/  search/  pdp/  wishlist/  cart/  checkout/  confirmation/
  checkout/checkout_url_classifier.dart  # تصنيف الروابط حسب checkout_rules
  checkout/checkout_attempt_store.dart   # حفظ المحاولة على القرص للاستعادة
  checkout/success_detector.dart         # الطبقات الثلاث
```

**المسؤوليات**: كل شاشة لها `Controller` (حالة)، و`Repository` (يجمع API الشبكة مع الذاكرة المحلية)، وواجهة. والحالة المشتركة ثلاث: `CartState` (العدّاد في الشريط السفلي)، و`WishlistState` (مجموعة المعرّفات لقلب كل بطاقة)، و`SessionState` من M05.

### 2.2 Laravel (BFF)

| المكوّن | الوحدة في ADR-0005 | المسؤولية |
|---|---|---|
| `Orders\CheckoutAttempts` | `Orders` | تسجيل محاولة الدفع، ومطابقتها مع `order.create`، وإرجاع ملخص الطلب للتطبيق |
| مستمع `OrderCreated` | `Orders` | يستقبل الحدث الداخلي من `ZidConnector` (M10) بعد إعادة جلب الطلب من Merchant API |
| `checkout_rules` | `AppConfig` (M11) | قواعد تصنيف روابط الدفع، تُحدَّث دون إصدار جديد |

### 2.3 Next.js

لا شاشات خاصة بهذه الوحدة. وإعدادات التاجر التي تقرؤها (ترتيب وحدات صفحة المنتج، ونمط البطاقة، وحدود سطر التقسيط، وعناصر كتلة الثقة) تُحرَّر في لوحة M15 بعقد M11.

## 3. التدفقات

**قواعد عامة لكل الشاشات**:
- كل طلب إلى `https://{store-domain}/api/v1/` يحمل `Zid-Client-Platform: mobile-app` و`Accept-Language: ar|en`، ويمر بمخزن الـ cookies الواحد (M01).
- السعر يُنسَّق في التطبيق من الحقول الرقمية (`price` و`sale_price` و`value`)، لا من `formatted_price` أو `value_string`. فالتطبيق يتحكم في الأرقام ورمز الريال (M02).
- **السعر شامل الضريبة**: إعدادات الضريبة تأتي من إعدادات التطبيق (M11)، ويغذيها M10 من Merchant API، ومصدرها الاحتياطي `settings.general.tax_settings` (N\*). فإن كان `is_tax_included_in_product_price = true` يُعرض السعر كما هو. وإن كان `false` مع `tax_activate = true` والمنتج `is_taxable = true`، يُعرض `round_half_up(effective_price × (1 + tax_percentage), 2)`. ويظهر تحت عنوان القائمة نص «الأسعار شاملة ضريبة القيمة المضافة». أما مجاميع السلة فتُعرض من زد كما هي ولا تُحسب في التطبيق.
- **مقاس الصورة**: `thumbnail` للصفوف حتى 80dp، و`medium` لبطاقات الشبكة، و`large` لمعرض صفحة المنتج، و`full_size` عند بدء التكبير فقط.
- كل شاشة لها أربع حالات: تحميل بهيكل عظمي (skeleton) يطابق التخطيط، وفارغة، وخطأ مع «أعد المحاولة»، وعدم اتصال تعرض آخر نسخة محفوظة مع شريط «غير متصل».

### 3.1 تبويب التصنيفات (F-S04) · النمط N

**التخطيط والمكونات**:
- حقل بحث في الأعلى يفتح شاشة البحث.
- نمطان يختار التاجر بينهما (إعداد `categories_layout` من M11، والافتراضي `rail`):
  - `rail`: عمود جانبي بتصنيفات المستوى الأول على جهة البداية (يمين في RTL). وبجانبه منطقة المحتوى: صف «عرض كل {اسم التصنيف}» أولًا، ثم المستوى الثاني شبكة بصور (3 أعمدة)، ثم المستوى الثالث رقائق نصية تحت كل تصنيف من المستوى الثاني.
  - `list`: قائمة بصور تتعمق مستوى بعد مستوى، مع «عرض الكل» أعلى كل مستوى.
- التصنيفات الفرعية تأتي قبل أي بنر ترويجي ([Baymard](https://baymard.com/blog/mobile-app-ux-trends)). وصور التصنيفات بنسبة واحدة تفرضها الهوية (M02).

**البيانات**: `GET categories`. الحقول المستخدمة: `id` و`name` و`slug` و`image` و`products_count` و`is_published` و`sub_categories[]` (حتى 3 مستويات). الاستجابة نحو 231 KB لاثنين وعشرين تصنيفًا ([LIVE](https://pcpalace.com.sa/api/v1/categories))، فتُحلَّل في `Isolate.run` وتُخزَّن على القرص. التخزين: تُعرض النسخة المحفوظة فورًا، ويُحدَّث في الخلفية إذا مضت 6 ساعات على آخر جلب.

**التصفية**: يُخفى ما كان `is_published = false`، ويُخفى التصنيف الذي `products_count = 0` إذا لم يكن له فرع فيه منتجات.

**التفاعلات**: النقر على المستوى الأول يغيّر المحتوى دون انتقال. والنقر على تصنيف ورقي أو «عرض الكل» يفتح قائمة المنتجات بـ `categories={id}` وعنوان يحدد النطاق. والسحب للأسفل يحدّث.

**الحالات**: المتجر بلا تصنيفات تظهر فيه رسالة «لا توجد تصنيفات بعد» وزر «تصفح كل المنتجات».

**الأحداث**: `view_category_tree`، و`select_category`.

### 3.2 قائمة المنتجات PLP (F-S05) · النمط N، وفلتر الماركة N\*

**نقاط الدخول**: التصنيفات، والماركة (`brand={uuid}` خلف علم `brands_enabled`)، ونتائج البحث (المكوّن نفسه)، وروابط «عرض الكل» في الكتل (M03)، والروابط العميقة (M07).

**التخطيط والمكونات**:
1. شريط علوي فيه اسم النطاق وعدد النتائج: «إلكترونيات · 1,409 منتجات».
2. صف أزرار: «فرز: {الترتيب الحالي}» و«فلترة» مع عدد الفلاتر المطبقة بين قوسين.
3. صف رقائق للفلاتر المطبقة، قابل للتمرير أفقيًا. لكل رقاقة زر ×، وفي آخره «مسح الكل». ويختفي الصف إذا لم يُطبَّق فلتر.
4. شبكة بعمودين (أو قائمة بحسب نمط البطاقة من M03) بتمرير لا نهائي.

**بطاقة المنتج `ProductCard`**:

| العنصر | الحقل | القاعدة |
|---|---|---|
| الصورة | `images[0].image.medium` | نسبة ثابتة من الهوية. وفي نمط `gallery` حتى 3 صور قابلة للتمرير |
| الاسم | `name` | سطران كحد أقصى |
| السعر | `effective_price` أو `sale_price` أو `price` | شامل الضريبة كما في القواعد العامة. ويُشطب `price` إذا كان `sale_price` أقل منه |
| شارة الخصم | `discount_percentage` | «-15%»، وتُعزل اتجاهيًا |
| شارة التاجر | `badge.body` و`badge.icon.code` | خريطة أيقونات لـ `discount_value` و`limited_quantity` و`selling_fast` و`featured_product` و`free_shipping`. والرمز المجهول أو `null` يُعرض نصًا بلا أيقونة |
| «باقي 3 فقط» | `quantity` و`is_infinite` | تظهر إذا كان `low_stock_label_enabled` مفعّلًا، و`is_infinite = false`، و`0 < quantity ≤ low_stock_quantity_threshold` (الافتراضي 10 من الإعدادات) |
| التقييم | `rating.average` و`rating.total` | يظهر إذا وُجد وكان العدد 1 فأكثر |
| القلب | `WishlistState` | يُخفى إذا كان `wishlist_enabled = false` |
| زر الإضافة السريعة | `has_options` و`in_stock` | «+» للمنتج البسيط المتوفر. وللمنتج ذي الخيارات يفتح صفحة المنتج |
| النافد | `in_stock = false` | صورة باهتة، وشارة «نفدت الكمية»، وزر «نبهني» مكان الإضافة |

**الترتيبات الأربعة** (`sort_by` و`order`)، إضافة إلى الافتراضي:

| الاسم المعروض | المعاملات |
|---|---|
| المقترح (الافتراضي) | بلا `sort_by`، أي ترتيب المتجر `default_products_ordering`، ويدفع النافد آخرًا |
| الأكثر مبيعًا | `sort_by=popularity_order` (الاتجاه يُثبَّت على المتجر التطويري) |
| الأحدث | `sort_by=created_at&order=desc` |
| السعر: من الأقل | `sort_by=price&order=asc` |
| السعر: من الأعلى | `sort_by=price&order=desc` |

لا يدعم زد الترتيب بالتقييم، فلا يُعرض.

**النافد في الآخر مع كل ترتيب**: لا يوجد في زد فلتر «المتوفر فقط» ([LIVE](https://mahasen.com/api/v1/settings)). لذلك تعمل القائمة بـ «دلو مؤجل»:
1. كل صفحة تصل تُقسم إلى متوفر ونافد، مع الحفاظ على ترتيب كل قسم.
2. المتوفر يُلحق بالشبكة فورًا. والنافد يُضاف إلى الدلو.
3. إذا أضافت الصفحة أقل من 12 عنصرًا متوفرًا، تُجلب الصفحة التالية تلقائيًا، بحد 5 صفحات متتالية.
4. حين تكون `next = null` يُعرض الدلو تحت عنوان «نفدت الكمية» في آخر القائمة.

مع الترتيب الافتراضي يبقى الدلو فارغًا تقريبًا لأن المتجر يرتب النافد آخرًا أصلًا.

**ورقة الفلاتر** (Bottom sheet بارتفاع 90%):
- **السعر**: حقلا «من» و«إلى» بلوحة أرقام، وشريط نطاق. حدّه الأعلى أعلى سعر في النطاق، ويُجلب بطلب واحد `page_size=1&sort_by=price&order=desc` بالفلاتر الأخرى نفسها، ويُخزَّن لكل نطاق.
- **العروض فقط**: مفتاح يرسل `on_sale=true`.
- **التصنيف**: يظهر فقط حين يكون النطاق بحثًا أو ماركة. وفيه فروع النطاق الحالي.
- **الماركة**: خلف علم `brands_enabled`. القائمة من `GET brands` (N\*)، والفلتر `brand={uuid}`. واسم المعامل `brand` حرفيًا، لأن `brands=` و`brand_id=` يُتجاهلان بصمت ([LIVE](https://rawand.com.sa/api/v1/products?page_size=3&brand=01a12fba-2724-7f03-ac6a-0334ad6b08e9)).
- **السمات**: من `filters.attributes[]` بترتيب `display_order`، ويُتجاهل ما كان `is_enabled = false`. كل قيمة من `data[]` تظهر بعددها `count`. وإن دلّ `type` و`type_value` على لون أو صورة تظهر عينة. والقيمة التي عددها 0 تظهر باهتة وغير قابلة للاختيار.
- الاختيار المتعدد داخل السمة الواحدة مسموح، ويُرسل `attribute_values[]` بمعرّفات `data[].id`. وسلوك «أو» داخل السمة و«و» بين السمات يُثبَّت على المتجر التطويري قبل القبول.
- **العدّاد الحي**: بعد كل تغيير في الورقة، وبعد 300 ms من التوقف، يُرسل `GET products` بالفلاتر المعلقة و`page_size=1`. ومن الاستجابة يُحدَّث زر «عرض 554 منتجًا» وأعداد السمات (`filters` تتغير مع الفلاتر الأخرى). ويُلغى الطلب السابق بـ `CancelToken`.
- إن عادت `filters = {}` (التاجر أطفأ `has_products_filtration`)، تظهر في الورقة أقسام السعر والعروض والتصنيف فقط.
- أسفل الورقة زرّان: «مسح» و«عرض N منتج».

**البيانات**: `GET products` بالمعاملات `page`، و`page_size=24` (الحد الأعلى المرصود 100)، و`categories`، و`price_min`، و`price_max`، و`on_sale`، و`attribute_values[]`، و`sort_by`، و`order`، و`brand`. والاستجابة: `{results, count, page, page_size, filters, next, previous, pages_count}` ([List Products](https://docs.zid.sa/list-products-25510175e0)؛ [LIVE](https://pcpalace.com.sa/api/v1/products?page_size=2)). وتُجلب الصفحة التالية مسبقًا حين يبقى 6 عناصر على النهاية.

**الحالات**:
- فارغة لأن التصنيف بلا منتجات: «لا توجد منتجات هنا بعد» وزر «تصفح كل المنتجات».
- فارغة بسبب الفلاتر: «لا نتائج لهذه الفلاتر»، وزر «إزالة آخر فلتر»، وزر «مسح الفلاتر».
- خطأ في صفحة لاحقة: تبقى العناصر المحمّلة، ويظهر في الأسفل صف «تعذّر التحميل، أعد المحاولة».
- عدم الاتصال: تُعرض أول صفحة محفوظة للنطاق إن كان عمرها أقل من 24 ساعة.

**التفاعلات**: النقر على البطاقة يفتح صفحة المنتج، ويمرّر ملخص المنتج ليرسم الرأس فورًا. والقلب تبديل متفائل. والإضافة السريعة تتبع التدفق 3.6.1. و«نبهني» تتبع 3.4.4.

**الأحداث**: `view_item_list`، و`select_item`، و`apply_filters`، و`change_sort`، و`add_to_cart` (`source=plp_quick_add`)، و`add_to_wishlist`، و`stock_alert_subscribe`.

### 3.3 البحث (F-S06) · النمط N

**التخطيط والمكونات**:
- حقل بحث مثبت في الأعلى، وبجانبه زر «بحث» ظاهر دائمًا. ومعظم التطبيقات لا تضع زر إرسال، وهذا من أشيع أخطائها ([Baymard](https://baymard.com/blog/mobile-app-ux-trends)). ولوحة المفاتيح بـ `TextInputAction.search`، وزر × للمسح، وأيقونة الماسح خلف علم (Should).
- **حين يكون الحقل فارغًا**: «عمليات البحث الأخيرة» (حتى 10، مع حذف عنصر واحد أو «مسح الكل»)، ثم «عمليات بحث شائعة» إن أضافها التاجر في إعداداته (M11، اختياري).
- **أثناء الكتابة** (حرفان فأكثر): قائمة نتائج فورية حتى 10 صفوف (صورة مصغرة، واسم، وسعر). وأولها صف «عرض كل النتائج لـ «{q}»».
- **بعد الإرسال**: شاشة نتائج بمكوّن قائمة المنتجات نفسه (الفلاتر والترتيبات والدلو)، ويبقى الاستعلام في الحقل.

**البيانات**:
- **النتائج الفورية**: `GET products/search?q={q}`. الصفحة ثابتة على 10 نتائج أيًا كان `page_size`، والمطابقة بالبادئة تعمل، ولا يوجد endpoint للاقتراحات ([Search Products](https://docs.zid.sa/search-products-25720449e0)؛ [LIVE](https://pcpalace.com.sa/api/v1/products/search?q=del&page_size=2)). يُرسل الطلب بعد 350 ms من التوقف عن الكتابة، ويُلغى الطلب السابق، وتُتجاهل أي استجابة أقدم من آخر استعلام برقم تسلسلي.
- **نتائج الإرسال**: `GET products?q={q}&page_size=24`، لأنها تقبل الفلاتر وتعيد `filters` وأعدادها. وإن أظهر الاختبار على المتجر التطويري أن `q` في `products` لا يطابق `products/search`، تُستخدم `products/search` بصفحات من 10 دون فلاتر سمات.
- **التطبيع العربي**: يُرسل الاستعلام كما كتبه المتسوق. فإن عادت 0 نتائج، يُعاد الطلب مرة واحدة بصيغة مطبّعة: أ وإ وآ تصبح ا، وة تصبح ه، وى تصبح ي، وتُحذف الحركات والتطويل. وإن وُجدت نتائج يظهر «عرضنا نتائج لـ «{المطبّع}»».
- **السجل المحلي**: جدول `search_history` (القسم 4.1). يُحفظ الاستعلام المرسَل فقط، لا ما كُتب أثناء النتائج الفورية. وحده الأقصى 10، ويُدمج المكرر بعد التطبيع، ولا يُرسل إلى أي خادم.

**الحالات**: لا نتائج: «لم نجد نتائج لـ «{q}»»، مع نصائح (تحقق من الإملاء، جرّب كلمة أعم) وزر «تصفح التصنيفات». وعدم الاتصال: يظهر السجل فقط، ويتعطل الإرسال برسالة «تحتاج اتصالًا للبحث».

**الأحداث**: `search` (يحمل `search_term` و`results_count` و`source: typed|history|instant_all|barcode`)، و`select_item` (`item_list_id=search_instant`)، و`view_search_results`. وقبل الإرسال إلى التحليلات يُستبدل `search_term` بـ `[redacted]` إن طابق نمط رقم جوال أو بريد.

### 3.4 صفحة المنتج PDP (F-S07) · النمط N، والإعدادات N\* أو B

**الوحدات**: ترتيبها وإخفاؤها من إعداد التاجر (F-M05، وعقد `pdp_modules` من M03 وM11). والترتيب الافتراضي:

| المعرّف | الوحدة | المصدر | الظهور |
|---|---|---|---|
| `gallery` | المعرض | `images[]` و`main_image` وصور المتغير | دائمًا |
| `title_price` | الاسم، والسعر، والخصم، والتقييم المختصر | `name` و`price` و`sale_price` و`rating` | دائمًا |
| `badges` | شارات التاجر والشحن | `badge` و`shipping_badges[]` | إن وُجدت |
| `bnpl` | سطر التقسيط | إعداد `bnpl` من M11 | انظر 3.4.3 |
| `variants` | الخيارات بعينات | `options[]` و`variants[]` | إن كان `has_options` |
| `custom_fields` | الحقول المخصصة | `custom_user_input_fields` و`custom_option_fields` | إن وُجدت |
| `quantity` | الكمية | `purchase_restrictions` | دائمًا |
| `branch_stock` | التوفر في الفروع | `variants[].stocks[]` أو `stocks[]` | إن وُجد فرعان فأكثر أو فرع من نوع `PHYSICAL` |
| `bank_offers` | عروض البنوك | `GET cart/checkout/bank-discounts` | إن وُجد عرض ساري بـ `show_in_product_page` |
| `trust` | كتلة الثقة | إعداد `trust` من M11 | إن فعّلها التاجر |
| `description` | الوصف | `description` (HTML) | إن لم يكن فارغًا |
| `specs` | المواصفات | `attributes[]` | إن وُجدت |
| `bundles` | «اشترِها معًا» | `GET products/{id}/bundle-offers` | بعد SPK-11، وإن لم تكن الاستجابة فارغة |
| `reviews` | المراجعات | `rating` و`GET products/{id}/reviews` | إن كان `reviews_enabled` |
| `related` | منتجات مشابهة | `related_products[]` و`related_products_title` | إن لم تكن فارغة |

**شريط سفلي ثابت**: زر «أضف إلى السلة · {السعر}»، وزر القلب، وزر المشاركة في الشريط العلوي.

**البيانات**: `GET products/{slug-or-uuid}` يقبل الـ slug والـ UUID ([Get Product by Slug](https://docs.zid.sa/get-product-by-slug-25772175e0)؛ [LIVE](https://ppowerstore.com/api/v1/products/RP-CB058)). وتُعرض أولًا بيانات الملخص الممرَّرة من البطاقة (الصورة، والاسم، والسعر)، ثم تكتمل الصفحة. ويُحفظ آخر 20 منتجًا مفتوحًا على القرص لمدة ساعة.

#### 3.4.1 المعرض والتكبير
1. `PageView` للصور بمقاس `large`، وتحته شريط صور مصغرة لا نقاط فقط، لأن النقاط وحدها تجعل المتسوق يفوّت صورًا ([Baymard](https://baymard.com/research-articles/always-use-thumbnails-additional-images)). ويظهر عدّاد «2/7».
2. اتجاه التقليب ينعكس في RTL.
3. النقر على الصورة يفتح عارضًا بملء الشاشة بـ `InteractiveViewer`: التكبير بالقرص حتى 4×، والنقر المزدوج يكبّر 2.5× حول نقطة النقر، والسحب للأسفل يغلق. وعند بدء التكبير يُحمَّل `full_size` فوق `large`.
4. عند اختيار متغير له صور خاصة، يقفز المعرض إلى أول صورة له.

#### 3.4.2 الخيارات وتسعير المتغير
1. تُرسم `options[]` بحسب `choices_metadata[choice].type` و`type_value`: دائرة لون، أو صورة مصغرة، أو رقاقة نصية ([Display options as colors or images](https://docs.zid.sa/display-product-options-as-colors-or-images-2264161m0)).
2. عند كل اختيار، يُحل المتغير محليًا من `variants[]`، فيُطابق كل قيم الخيارات المختارة. ويُحدَّث فورًا السعر و`sale_price` والمخزون والصور من كائن المتغير.
3. الخيارات التي لا تقود إلى متغير متوفر مع بقية الاختيارات تظهر مشطوبة، لكنها تبقى قابلة للاختيار، فتعرض «نفدت الكمية» وزر «نبهني».
4. بعد 250 ms من آخر تغيير يُرسل `POST products/{id}/options` بالجسم `{attributes, option_fields, input_fields}` ([Calculate Product Options Price](https://docs.zid.sa/calculate-product-options-price-25720485e0)). فإن عادت الاستجابة بكائن منتج (كما يصف SDK زد: «updated ProductObject (resolved variant, price, stock)»، [JS Products](https://docs.zid.sa/products-1475307m0))، يُعتمد سعرها ومخزونها. وإن عادت نصًا، كما في المثال الموثق، يبقى الحل المحلي. ويُسجَّل حدث مراقبة `options_price_mismatch` إن اختلف السعران.
5. الحقول المخصصة: `TEXT` و`NUMBER` و`CHECKBOX` و`DROPDOWN` تُرسم أصليًا، وتُتحقق إلزاميتها قبل الإضافة. أما `IMAGE` و`FILE` فتحتاج `POST cart/uploads` غير الموثق، فيظهر بدلها في الإصدار الأول زر «أكمل الطلب من صفحة المنتج» يفتح `html_url` في WebView (القسم 3.10).
6. الكمية: من `max(1, min_quantity_per_cart)` إلى `min(max_quantity_per_cart, المخزون)`، ولا حد للمخزون إن كان `is_infinite`.
7. الإضافة إلى السلة: التدفق 3.6.1. ويُرسل `product_id` بمعرّف المتغير للمنتج ذي المتغيرات ([Add Cart Item](https://docs.zid.sa/add-cart-item-26083895e0)).

#### 3.4.3 سطر التقسيط، وعروض البنوك، ومخزون الفروع، والثقة
- **سطر التقسيط** تحت السعر وفوق زر الإضافة: «أو 4 دفعات بقيمة 57.25 ر.س بدون فوائد» مع شعار تابي أو تمارا. والنقر يفتح ورقة شرح ثابتة النص لكل مزوّد.
  - يظهر فقط إن فعّل التاجر المزوّد في إعدادات `bnpl` (M11). والقيمة الافتراضية لهذا الإعداد تُستورد من `settings.products.tabby_widget_enabled` و`tamara_widget_enabled` (N\*).
  - ويظهر فقط إن كان السعر داخل حدَّي `min_amount` و`max_amount` اللذين يحددهما التاجر، لأن زد لا تعيد حدود المزوّد.
  - القيمة = `round(price_with_tax / instalments, 2)`، و`instalments` افتراضيًا 4.
  - الإصدار الأول نص أصلي محسوب، لا أدوات SDK. فـ `TabbyPresentationSnippet` تحتاج مفتاح API لا تعيده زد، وأداة تمارا تُرسم بسكربت في WebView ([pub.dev/tabby_flutter_inapp_sdk](https://pub.dev/packages/tabby_flutter_inapp_sdk)؛ [pub.dev/tamara_flutter_sdk](https://pub.dev/packages/tamara_flutter_sdk)).
- **عروض البنوك**: `GET cart/checkout/bank-discounts`، ويُعرض ما كان `is_active` و`show_in_product_page` والتاريخ الحالي بين `date_start` و`date_end`. مثال: «خصم 15% مع بطاقات {bank_name} حتى 100 ر.س»، مع `bank_logo` وملاحظة ثابتة «لا يسري مع Apple Pay»، لأن خصم البنك لا يُطبق على مدفوعات Apple Pay ([Bank Discounts](https://docs.zid.sa/bank-discounts-2332488m0)). وتُخزَّن الاستجابة 30 دقيقة لكل التطبيق.
- **مخزون الفروع**: من `stocks[]` للمتغير المختار: `location.name`، و`available_quantity`، و`is_available` ([LIVE](https://ppowerstore.com/api/v1/products/RP-CB058)). يظهر أول 3 فروع فيها توفر، مثل «متوفر في: الخبر - العليا»، ثم «عرض كل الفروع» في ورقة. ولا يُعرض الرقم الدقيق للكمية، بل «متوفر» أو «كمية محدودة» (عند 5 فأقل) أو «غير متوفر».
- **كتلة الثقة** (من إعداد `trust` في M11): ملخص سياسة الاسترجاع وهو رابط إلى الصفحة الأصلية في M05، وشعارات طرق الدفع، وشارة توثيق المركز السعودي للأعمال أو السجل التجاري، والرقم الضريبي. ولكل عنصر مفتاح إظهار في اللوحة.

#### 3.4.4 «نبهني» (يُستخدم أيضًا في قائمة المنتجات والمفضلة)
1. يفتح ورقة فيها البريد (مطلوب، لأن زد تشترط `customer_email`)، والجوال (اختياري)، والاسم (اختياري). وتُملأ مسبقًا من الملف الشخصي للمسجل.
2. يُرسل `POST products/{variant_or_product_id}/stock-alerts` بالجسم `{customer_email, customer_phone_number, customer_name}` ([Notify Product Stock Availability](https://docs.zid.sa/notify-product-stock-availability-25721229e0)).
3. عند النجاح: «سنبلغك عند توفره»، ويُحفظ المعرّف محليًا ليتحول الزر إلى «سنبلغك». وعند 422: يظهر الخطأ تحت حقل البريد.
4. اشتراك إشعار المنصة لعودة المخزون يأتي لاحقًا (F-S16 في M06).

#### 3.4.5 المراجعات بالصور
- الملخص: المتوسط والعدد ومدرّج النجوم الخمس من `rating` في المنتج.
- القائمة: `GET products/{id}/reviews?page=1&page_size=5` في الصفحة نفسها، ثم شاشة «كل المراجعات» بصفحات من 20. حقول العنصر: `customer.name` (أو «مشترٍ» إن كان `is_anonymous`)، و`rating`، و`comment`، و`images[]`، و`created_at`، و`bought_this_item` (شارة «اشترى المنتج»)، و`reply` (رد التاجر) ([LIVE](https://ppowerstore.com/api/v1/products/6f06bc89-0cd4-490f-9894-238a93962416/reviews?page_size=3)).
- شريط «صور المتسوقين» أعلى المراجعات يجمع صور الصفحة الأولى. والنقر يفتح عارضًا يتنقل بين **كل** صور المراجعات المحمّلة، لا صور مراجعة واحدة فقط ([Baymard](https://baymard.com/blog/mobile-ux-ecommerce)).

#### 3.4.6 المشاركة
زر المشاركة يفتح `share_plus` بنص «{name} {html_url}». وزر «WhatsApp» المباشر يفتح `https://wa.me/?text={urlencoded}`. ويُضاف `utm_source=app_share` إلى الرابط. وتحويل الرابط إلى رابط يفتح التطبيق من مسؤولية M07 (F-S15، Should).

**الحالات**: 404 يعرض «هذا المنتج لم يعد متاحًا» مع المنتجات المشابهة من آخر قائمة. والمتجر مغلق (`availability.is_store_closed`) يعطّل زر الإضافة ويعرض رسالة المتجر ووقت الفتح.

**الأحداث**: `view_item`، و`select_variant`، و`view_item_gallery`، و`zoom_image`، و`add_to_cart`، و`add_to_wishlist`، و`share`، و`view_reviews`، و`bnpl_info_open`، و`stock_alert_subscribe`، و`select_item` (`item_list_id=related`).

### 3.5 المفضلة (F-S13) · النمط N للمسجل، ومحلية للزائر

**التخطيط**: شاشة من تبويب الحساب (M05)، ومن أيقونة في الشريط العلوي للرئيسية إن فعّلها التاجر. وفيها شبكة ببطاقة `ProductCard` نفسها، تحت كل بطاقة زر «أضف إلى السلة»، أو «اختر الخيارات» للمنتج ذي الخيارات، أو «نبهني» للنافد. وللزائر شريط غير مانع: «سجّل الدخول لتحفظ مفضلتك على كل أجهزتك».

**البيانات**:
- **المسجل**: `GET account/wishlists?page&page_size=24`، و`POST account/wishlists {product_ids:[...]}`، و`DELETE account/wishlists/{product_id}` ([Get Wishlist](https://docs.zid.sa/get-wishlist-26722764e0)). وحقول العنصر: `id` و`name` و`price` و`sale_price` و`effective_price` و`discount_percentage` و`images` و`in_stock` و`quantity` و`is_infinite` و`has_options` و`badge` و`added_at`.
- **الزائر**: يعيد `account/wishlists` الخطأ 400 «Customer is required.» ([LIVE](https://ppowerstore.com/api/v1/account/wishlists))، لذلك تُحفظ المفضلة في جدول `guest_wishlist` محليًا، بلقطة للاسم والصورة والسعر، وحد أقصى 200.
- **حالة القلب**: `WishlistState` يحمل مجموعة المعرّفات. للمسجل تُملأ بجلب كل الصفحات مرة عند الدخول وبحد 200، ثم تُحدَّث محليًا مع كل عملية.

**تدفق التبديل**:
1. تبديل متفائل للقلب.
2. للمسجل يُرسل `POST` أو `DELETE`، وعند الفشل يُعاد القلب ويظهر تنبيه. وللزائر كتابة محلية.

**تدفق الدمج بعد الدخول** (يطلقه حدث `session.logged_in` من M05):
1. تُقرأ معرّفات `guest_wishlist`.
2. تُرسل على دفعات من 50: `POST account/wishlists {product_ids}`.
3. الدفعة الناجحة تُحذف من الجدول المحلي.
4. الدفعة التي تفشل بـ 4xx تُعاد عنصرًا عنصرًا، ويُحذف محليًا ما يفشل منها بـ 4xx (منتج محذوف). أما الخطأ 5xx أو انقطاع الشبكة فيُبقي العناصر لمحاولة لاحقة مع الدخول التالي أو بعد 10 دقائق.
5. يُعاد جلب مفضلة الحساب، ويُرسل حدث `wishlist_merge` بعدد الناجح والفاشل.

**عند الخروج**: تبدأ مفضلة الزائر فارغة. لا تُنسخ مفضلة الحساب إلى الجهاز.

**الأحداث**: `view_wishlist`، و`add_to_wishlist`، و`remove_from_wishlist`، و`wishlist_merge`.

### 3.6 السلة (F-S08) · النمط N

**التخطيط والمكونات**، من الأعلى:
1. **شريط الشحن المجاني** من `free_shipping_rule.subtotal_condition`: «باقي لك 45 ر.س للشحن المجاني» مع شريط تقدم بقيمة `products_subtotal_percentage_from_min`، أو «شحنك مجاني» حين يكون `remaining ≤ 0`. ويُخفى إن كان `free_shipping_rule = null`. وإن لم يكن `shipping_cities_condition[]` فارغًا يُضاف «لمدن محددة» ([LIVE](https://mahasen.com/api/v1/cart)).
2. **تنبيه الحد الأدنى للطلب** من `checkout_restrictions`. شكل الحقل ينتظر SPK-11، وحتى ذلك الحين يُعرض نص الخطأ الذي تعيده زد إن وُجد.
3. **الأسطر**: صورة، واسم، وملخص الخيارات، والسعر، وأزرار الكمية «− 2 +» ([Baymard](https://baymard.com/blog/current-state-of-checkout-ux))، وزر حذف أو سحب للحذف. ويظهر `error_message` للسطر بلون الخطأ. والصورة والخيارات غير موثقة في عنصر السلة، فتُؤخذ من ذاكرة المنتجات المحلية بـ `product_id` إن لم تعدها زد (SPK-11).
4. **الباقات وقواعد الخصم** من `bundle_offers[]` و`discount_rules[]`. شكلها ينتظر SPK-11. وحتى ذلك الحين يظهر أثرها فقط في `totals[]`.
5. **الكوبون**: يظهر إن كان `settings.checkout.is_coupon_form_enabled`، أو الإعداد المقابل في M11.
6. **النقاط** للمسجل حين يكون `is_loyalty_enabled`: الرصيد، وخيارات الاستبدال، و«ستكسب 45 نقطة من هذا الطلب».
7. **خيار الهدية** إن كان `products/gifting/settings.is_enabled`.
8. **عروض البنوك** بـ `show_in_cart_page`، مع ملاحظة Apple Pay.
9. **المجاميع**: كل عناصر `totals[]` بترتيبها كما تعيدها زد (`title` والقيمة منسقة من `value`)، ثم `total` بخط أعرض، وتحته «شامل ضريبة القيمة المضافة». وأسطر الضريبة هي ما تعيده زد في `totals[]` بأكواده، ولا يحسب التطبيق الضريبة هنا ([Get Cart](https://docs.zid.sa/get-cart-26082659e0)).
10. **سطر تقسيط السلة** إن فعّل التاجر `is_tabby_cart_widget_enabled` أو `is_tamara_cart_widget_enabled`.
11. **زر ثابت**: «إتمام الطلب · 345.00 ر.س». يتعطل إن لم يتحقق الحد الأدنى، أو كان في أي سطر خطأ، أو كان المتجر مغلقًا.

**البيانات**: `GET cart` هو «single source of truth for checkout state» ([Get Cart](https://docs.zid.sa/get-cart-26082659e0)). يُجلب عند فتح التبويب، وبعد كل تعديل، وعند العودة من الدفع. ويُحدَّث العدّاد من `products_count`.

#### 3.6.1 الإضافة وتعديل الكمية
1. **الإضافة**: `POST cart/items {product_id, quantity, custom_fields[]}`. يُحدَّث العدّاد بتفاؤل من `cart_items_quantity` في الاستجابة، ويظهر تأكيد سفلي «أُضيف إلى السلة · عرض السلة».
2. **الكمية**: تحديث متفائل للسطر، ثم `PATCH cart/items/{item_id} {quantity}` بعد 400 ms من آخر نقرة، ثم `GET cart`. وعند 4xx (المخزون مثلًا) تُعاد الكمية ويُعرض الخطأ.
3. **الحذف**: `DELETE cart/items/{item_id}` مع شريط «تراجع» لمدة 5 ثوانٍ. والتراجع يعيد الإضافة بالكمية نفسها.

#### 3.6.2 الكوبون
1. يكتب المتسوق الرمز ويضغط «تطبيق».
2. `GET cart/coupons/validations?coupon_code={code}` ([Check Coupon Validity](https://docs.zid.sa/check-coupon-validity-26323357e0)). فإن عاد 422 تظهر رسالة `detail[0].msg` تحت الحقل، وينتهي التدفق.
3. `POST cart/coupons?coupon_code={code}` ([Apply Coupon](https://docs.zid.sa/apply-coupon-26257791e0))، ثم `GET cart`.
4. تظهر رقاقة «{CODE} مطبّق» وفيها قيمة الخصم من سطر الكوبون في `totals[]`، وزر إزالة يرسل `DELETE cart/coupons`.
5. إن ظهر `coupon_error_message` في السلة بعد تعديل لاحق (لم يعد الكوبون ينطبق)، يُعرض تحت الرقاقة.

#### 3.6.3 النقاط
1. `GET cart/loyalty/balance` و`GET cart/loyalty/redemption-options` ([Customer’s Current Points Balance](https://docs.zid.sa/customers-current-points-balance-26324317e0)).
2. يختار المتسوق خيارًا، فيُرسل `POST cart/loyalty/redemptions {method_ids:[id]}`، ثم `GET cart`. والإلغاء بـ `DELETE cart/loyalty/redemptions` ([Apply Loyalty Points](https://docs.zid.sa/apply-loyalty-points-26323433e0)).
3. «ستكسب N نقطة» من `GET cart/loyalty/calculate?cart_total={total}`.
4. الزائر يرى «سجّل الدخول لاستخدام نقاطك» إن كان البرنامج مفعّلًا. والرد 400 `LoyaltyNotEnabledException` يُخفي القسم.

#### 3.6.4 الهدية
1. مفتاح «أرسله هدية» يفتح ورقة فيها: اسم المرسل، واسم المستلم، وجوال المستلم (رمز الدولة والرقم)، والرسالة (مع قوالب `message_templates` من إعدادات الإهداء).
2. `POST cart/gift-cards` بالحقول `sender_name` و`receiver_name` و`recipient_country_code` و`recipient_mobile` و`gift_message` ([Add Gift Card](https://docs.zid.sa/add-gift-card-26257599e0)).
3. يظهر ملخص من `gift_card_details` مع «تعديل» و«إزالة» (`DELETE cart/gift-cards`). وتصميم البطاقة (`card_design`) يأتي لاحقًا.

#### 3.6.5 اختيار طريقة الإتمام (الشراء كزائر ظاهر دائمًا)
عند الضغط على «إتمام الطلب»:
1. إن كان المتسوق مسجلًا (`SessionState`)، يُفتح الدفع على `/checkout`.
2. وإن كان زائرًا:
   - إن كان `is_buy_as_a_guest_enabled = false`، يُفتح الدخول (M05)، ثم `/checkout` بعده.
   - وإن كان `is_direct_guest_checkout_enabled = true`، يُفتح `/checkout/guest` مباشرة.
   - وإلا تظهر ورقة بزرين بالوزن نفسه، والزائر أولًا: «أكمل كزائر» يفتح `/checkout/guest`، و«سجّل الدخول» يفتح الدخول ثم `/checkout`. لأن عدم رؤية خيار الزائر بوضوح يضر كما يضر غيابه ([Baymard 652](https://baymard.com/guidelines/652-guest-checkout-prominence)).

**الحالات**: السلة الفارغة: «سلتك فارغة» وزر «تصفح المنتجات»، وتحتها آخر عناصر المفضلة إن وُجدت.

**الأحداث**: `view_cart`، و`add_to_cart`، و`remove_from_cart`، و`update_cart_quantity`، و`apply_coupon` (`result: success|invalid`)، و`remove_coupon`، و`redeem_points`، و`add_gift`، و`begin_checkout` (`checkout_type: guest|customer`).

### 3.7 الدفع في WebView (F-S09) · النمط W + B

صفحة الدفع ملك زد. لا نتحكم في تصميمها ولا في طرق الدفع فيها. ودور التطبيق خمسة أمور: أن يسلّمها الجلسة الصحيحة، ويرسل الترويسة، ويدير الروابط الخارجية، ويلتزم بقواعد مزوّدي الدفع، ويعرف متى انتهت.

**التخطيط**: شاشة بملء الشاشة. فيها شريط علوي أصلي فيه زر إغلاق، والعنوان «إتمام الطلب»، وقفل ونطاق المتجر. وتحت الشريط مؤشر تقدم خطي أثناء تحميل الصفحات، ثم `WebViewWidget`.

**إعداد الـ WebView** (ملزم):

| البند | القيمة |
|---|---|
| JavaScript | `JavaScriptMode.unrestricted` |
| مخزن البيانات | المخزن الدائم الافتراضي، المشترك مع WebView الدخول في M05، لأن صفحة الدفع تقرأ `localStorage["vitrin-auth-token"]` ([LIVE](https://ppowerstore.com/checkout/guest)). لا وضع خفي |
| User agent | الافتراضي من `getUserAgent()` مع إضافة ` IntisharApp/{version}`. يُضبط بـ `setUserAgent`، وهذا لا يحقن سكربتًا |
| ممنوع على iOS | `addJavaScriptChannel`، و`runJavaScript`، و`runJavaScriptReturningResult`، و`setOnConsoleMessage`، و`enableZoom(false)`. فهذه كلها تضيف `WKUserScript` أو تستدعي `evaluateJavaScript` في `webview_flutter_wkwebview` 3.27.2. (الحزمة تحقن سكربت viewport حين يُعطَّل التكبير، وسكربت تغليف لكل قناة JavaScript، وسكربت لتحويل console.) وحقن السكربت يعطّل Apple Pay JS في WKWebView ([WebKit bug 205730](https://bugs.webkit.org/show_bug.cgi?id=205730)) |
| App-Bound Domains | لا تُفعَّل `WKAppBoundDomains`، لأن صفحات الدفع تمر بنطاقات كثيرة |
| أندرويد | `setAcceptThirdPartyCookies(true)` لإطارات 3-D Secure، و`setOnShowFileSelector` بـ `image_picker` (صور فقط)، و`setOnPlatformPermissionRequest` يطلب إذن الكاميرا بـ `permission_handler` ولا يمنحه إلا بعد موافقة المستخدم ([Tabby](https://docs.tabby.ai/pay-in-4-custom-integration/mobile-apps/integration-without-sdk)) |
| iOS Info.plist | `NSCameraUsageDescription`، و`NSPhotoLibraryUsageDescription`، و`NSMicrophoneUsageDescription` بنصوص عربية وإنجليزية (شرط تابي في الـ WebView) |

**التدفق**:
1. **فحص مسبق**: `GET cart` جديد. يجب ألا تكون السلة فارغة، ولا يكون في أي سطر `error_message`. ويُفحص الاتصال.
2. **تسجيل المحاولة**: `POST {platform-api}/v1/shopper/checkout-attempts` (القسم 5.2). وتُحفظ `attempt_id` ولقطة السلة في جدول `checkout_attempt` على القرص **قبل** فتح الصفحة، لأن العملية قد تموت أثناء الانتقال إلى تطبيق البنك أو تابي ([Tabby](https://docs.tabby.ai/pay-in-4-custom-integration/mobile-apps/integration-without-sdk)). وإن كان المتسوق مسجلًا، تُحفظ أيضًا لقطة أحدث طلب من `GET account/orders?page=1&page_size=1` لاستخدامها في الطبقة 2.
3. **مزامنة الـ cookies**: تُقرأ cookies نطاق المتجر من مخزن `dio` (`session` و`csrftoken` و`locale`)، وتُكتب في الـ WebView بـ `WebViewCookieManager.setCookie`، بالنطاق نفسه الذي يستخدمه الـ API، ومسار `/`. ويُنتظر اكتمال الكتابة قبل التحميل. وزد تشترط أن يشارك الـ WebView مخزن cookies عميل الـ API ([Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)).
4. **اللغة**: يُتأكد أن cookie `locale` تطابق لغة التطبيق ودولة المتجر الافتراضية. وإلا يُستدعى `GET /locales/{lang}-{country}?redirect_to=/` عبر `dio` قبل المزامنة (N\*، [LIVE](https://mahasen.com/api/v1/settings)). وتُستخدم دولة المتجر الافتراضية حتى لا تتحول العملة.
5. **الرابط**: `https://{store-domain}/checkout` أو `/checkout/guest`، مضافًا إليه `?utm_source=app&utm_medium={ios|android}&utm_campaign=checkout` كمسار نسبة احتياطي (SPK-03).
6. **التحميل**: `loadRequest(uri, headers: {Zid-Client-Platform: mobile-app, Accept-Language: {lang}})`. فزد تطلب الترويسة «with every request you make — page views and API calls alike» ([Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)).
7. **تصنيف كل تنقل** في `onNavigationRequest` بقواعد `checkout_rules` (القسم 5.3):

| الفئة | الشرط | القرار |
|---|---|---|
| مخطط غير HTTP | `tel:` و`mailto:` و`sms:` ومخططات تطبيقات البنوك وSTC Pay | `launchUrl(externalApplication)`، ثم `prevent` |
| `intent://` (أندرويد) | المخطط `intent` | يُحلَّل `scheme=` و`package=`، ويُفتح التطبيق خارجيًا. فإن لم يكن مثبتًا يُفتح `S.browser_fallback_url` داخل الـ WebView. ثم `prevent` |
| جسر التطبيق | المخطط `intishar-bridge` (الطبقة 3، لاحقًا) | يُقرأ `transaction_id`، ثم `prevent` |
| نطاق خارجي معروف | `wa.me`، و`api.whatsapp.com`، و`apps.apple.com`، و`play.google.com` | خارجي، ثم `prevent` |
| مسار الدفع | المضيف نطاق المتجر، والمسار يطابق `checkout_path_regex` | `navigate` |
| مسار السلة | المضيف نطاق المتجر، والمسار يطابق `cart_path_regex` | `prevent`، ثم إغلاق الشاشة والعودة إلى السلة الأصلية وتحديثها |
| نجاح أو فشل معروف | يطابق `success_url_patterns` أو `failure_url_patterns` (من SPK-01) | `navigate`، وتُطلق الطبقة 1 |
| خروج إلى صفحة متجر | المضيف نطاق المتجر، وليس دفعًا ولا سلة ولا `/auth` | `navigate`، وتُطلق الطبقة 1 بوصفه «خروجًا من الدفع» |
| الدخول | `sso.zid.store` | `navigate` |
| مزوّد تقسيط | مضيف في `bnpl_hosts` | `navigate`، ويُخفى زر الإغلاق (البند 8) |
| أي HTTPS آخر | صفحات 3-D Secure للبنوك وبوابات الدفع | `navigate` |
| HTTP غير مشفر | `http://` | `prevent`، ويظهر خطأ |

8. **زر الإغلاق والرجوع**:
   - تشترط تابي ألا يظهر من التطبيق أي زر تحكم («no control buttons (e.g., X, close, back, etc.)») أثناء صفحتها ([Tabby testing checklist](https://docs.tabby.ai/pay-in-4-custom-integration/full-testing-checklist)). لذلك حين يكون مضيف الصفحة الحالية في `bnpl_hosts`، يُخفى زر الإغلاق، ويُبتلع زر الرجوع في أندرويد، وتُعطَّل إيماءة الرجوع في iOS.
   - في غير ذلك: زر الرجوع في أندرويد ينفّذ `goBack()` إن أمكن. وفي صفحة الدفع الأولى يظهر حوار «مغادرة صفحة الدفع؟ سلتك محفوظة». والإغلاق يعيد إلى السلة، ويطلق فحص الفشل (3.8.3).
9. **الترويسة في التنقلات اللاحقة**: `loadRequest` يضع الترويسة في الطلب الأول فقط. وطلبات XHR التي تجريها صفحة زد نفسها لا يمكن للتطبيق تعديلها على iOS. لذلك:
   - (أ) الاعتماد الأساسي على الـ cookie، التي سجّلت `"source": "mobile_app"` حين أُرسلت الترويسة في طلبات الـ API ([LIVE](https://mahasen.com/api/v1/cart)).
   - (ب) خلف العلم `checkout_header_reinjection` (مطفأ افتراضيًا): كل تنقل رئيسي GET إلى نطاق المتجر، مصدره صفحة على نطاق المتجر نفسه، يُمنع ثم يُعاد بـ `loadRequest` مع الترويسة، مع حارس يمنع إعادة الرابط نفسه مرتين.
   - ويُحسم الاختيار بنتيجة SPK-04 وSPK-03.
10. **أحداث دورة الحياة**: عند عودة التطبيق إلى الواجهة أثناء الدفع (بعد الانتقال إلى تطبيق بنك مثلًا)، يُجرى فحص واحد للطبقة 2 دون إغلاق الصفحة.
11. **أخطاء التحميل**: `onWebResourceError` للإطار الرئيسي، أو `onHttpError` بـ 5xx، يعرض لوحة أصلية «تعذّر تحميل صفحة الدفع» مع «أعد المحاولة» (`reload`) و«العودة إلى السلة». وخطأ SSL يُرفض دائمًا ولا يُتجاوز.

**الأحداث**: `checkout_webview_open`، و`checkout_external_handoff` (`target: bank_app|whatsapp|other`)، و`checkout_closed` (`stage`)، و`checkout_load_error`.

### 3.8 كشف نجاح الطلب وفشله · النمط B

لا توثّق زد رابطًا لصفحة الشكر ولا callback للإتمام ([llms.txt](https://docs.zid.sa/llms.txt)). لذلك يُكشف النجاح بثلاث طبقات (ADR-0003، البند 4).

#### 3.8.1 الطبقات
| الطبقة | الإشارة | القوة | التوقيت |
|---|---|---|---|
| 1. التنقل | رابط يطابق `success_url_patterns`، أو خروج من مسار الدفع إلى صفحة متجر بعد تحميل صفحة دفع | ظن، يُطلق التأكيد ولا يكفي وحده | فوري |
| 2. الخادم | (أ) BFF طابق `order.create` مع المحاولة، أو (ب) للمسجل: ظهر في `account/orders` طلب أحدث من اللقطة، أو (ج) إشارة ضعيفة: `GET cart` تغيّر `id` فيه أو صار `products_count = 0` | (أ) و(ب) تأكيد. و(ج) تبقى ظنًا | عادة أقل من 10 ثوانٍ (معيار SPK-01) |
| 3. سكربت `purchase_event` (لاحقًا) | سكربت المنصة في App Scripts يرى `IntisharApp` في الـ user agent، فينتقل إلى `intishar-bridge://purchase?transaction_id=...` | تأكيد برقم الطلب، ويُتحقق منه في الخلفية | فوري |

#### 3.8.2 تدفق التأكيد
1. تُطلق الطبقة 1، فيُغطّى الـ WebView بطبقة أصلية «جارٍ تأكيد طلبك…» تمنع التفاعل، ولا تُهدم الصفحة. فتابي توصي بعدم هدم الـ WebView فور ظهور رابط العودة قبل التأكد من الحالة ([Tabby](https://docs.tabby.ai/pay-in-4-custom-integration/mobile-apps/integration-without-sdk)).
2. استطلاع `GET {platform-api}/v1/shopper/checkout-attempts/{id}` كل ثانيتين 10 مرات، ثم كل 5 ثوانٍ حتى 120 ثانية. وبالتوازي للمسجل: `GET account/orders?page=1&page_size=1` كل 5 ثوانٍ، و`GET cart` مرة كل 10 ثوانٍ.
3. عند أول تأكيد من (أ) أو (ب):
   - تُحدَّث المحاولة محليًا إلى `confirmed`.
   - `GET cart` لاستلام السلة الجديدة وتصفير العدّاد.
   - تُستبدل الشاشة بشاشة التأكيد (3.9) مع `zid_order_id` و`code`.
   - يُرسل `purchase` مرة واحدة، ومفتاح منع التكرار `transaction_id`.
4. إن انقضت 120 ثانية مع (ج) فقط، تظهر شاشة التأكيد بصيغة «قيد التأكيد» (3.9). ويستمر الاستطلاع في الخلفية كل 30 ثانية حتى 10 دقائق، ثم يتحقق مع كل فتح للتطبيق حتى 24 ساعة.
5. وإن انقضت 120 ثانية دون أي إشارة، تُعرض شاشة «لم نتمكن من تأكيد طلبك بعد»، وفيها «تحقق مجددًا» و«تواصل مع المتجر عبر WhatsApp» برسالة فيها وقت المحاولة، و«العودة إلى السلة».

#### 3.8.3 الفشل والإلغاء وإعادة المحاولة
1. **المحفز**: رابط فشل معروف، أو إغلاق المتسوق للصفحة، أو تنقل إلى السلة، أو العودة إلى التطبيق دون نجاح بعد الوصول إلى صفحة دفع.
2. `GET cart`. فإن كان `is_reserved = false` يعود المتسوق إلى السلة كما هي.
3. وإن كان `is_reserved = true` (بدأ الدفع، [Duplicate Cart](https://docs.zid.sa/duplicate-cart-26083625e0)):
   - فحص واحد لحالة المحاولة في الـ BFF. فإن كانت `confirmed` يذهب إلى التأكيد.
   - وإلا تظهر شاشة أصلية «لم يكتمل الدفع». فيها أن السلة محفوظة، وأن المتسوق يستطيع اختيار طريقة أخرى. وأزرارها: «أعد المحاولة» و«تواصل مع المتجر».
4. «أعد المحاولة» يرسل `POST cart/clone` ([Duplicate Cart](https://docs.zid.sa/duplicate-cart-26083625e0))، ثم `GET cart`، ثم تُسجَّل محاولة جديدة ويُعاد فتح الدفع. ولا يُنسخ إلا بضغطة من المتسوق، لا آليًا.
5. تُبلَّغ المحاولة القديمة بـ `PATCH .../checkout-attempts/{id} {status: "failed", reason}` لأغراض القياس فقط. ويبقى الـ BFF قادرًا على مطابقتها لاحقًا إن وصل طلب متأخر.

#### 3.8.4 الاستعادة بعد موت العملية
عند كل إقلاع وكل عودة إلى الواجهة: إن وُجدت محاولة `open` عمرها أقل من 24 ساعة في `checkout_attempt`، يُستطلع الـ BFF مرة واحدة.
- إن كانت `confirmed` تظهر شاشة التأكيد (مرة واحدة).
- وإن لم تكن، وعمرها أكثر من ساعتين، تتحول محليًا إلى `abandoned` دون إزعاج المتسوق.
- وإلا تبقى، ويظهر في السلة شريط «هل أكملت الدفع؟ تحقق من طلبك».

**الأحداث**: `checkout_detection` (`layer: 1|2a|2b|2c|3`، و`latency_ms`)، و`purchase`، و`checkout_failed` (`stage`، و`cart_reserved`)، و`checkout_retry`، و`checkout_recovered`.

### 3.9 شاشة تأكيد الطلب الأصلية (F-S09) · النمط B

**التخطيط**:
1. أيقونة نجاح، و«تم استلام طلبك»، ورقم الطلب `#rEXuB20myr` مع زر نسخ.
2. ملخص: الإجمالي، وطريقة الدفع، وطريقة الشحن، والمدة المتوقعة `estimated_delivery_time`، وصور مصغرة لأول 4 منتجات. وكلها من ملخص المحاولة في الـ BFF (5.2)، ومصدره Merchant API `orders/{id}` عبر M10.
3. أزرار:
   - «تتبع طلبك»: للمسجل يفتح تفاصيل الطلب في M05. وللزائر يكون «سجّل الدخول برقم جوالك لتتبع طلبك»، فيفتح الدخول (M05) ثم تفاصيل الطلب.
   - «متابعة التسوق».
4. طلب إذن الإشعارات في سياقه: إن لم يُحسم الإذن بعد، يظهر بعد ثانية واحدة شرح «نبلغك بحالة طلبك أولًا بأول» ثم حوار النظام. والعقد مع M06 وM09.
5. للتحويل البنكي: «أكمل التحويل حسب التعليمات التي وصلتك من المتجر». ورفع الإيصال يأتي لاحقًا (القسم 3.10).

**صيغة «قيد التأكيد»**: «استلمنا طلبك ونؤكده الآن» مع مؤشر انتظار. وتتحول تلقائيًا إلى الصيغة الكاملة عند وصول التأكيد. ولا يظهر طلب إذن الإشعارات قبل التأكيد.

**الحالات**: لا تُفتح الشاشة من رابط عميق، ولا تظهر مرتين لـ `attempt_id` واحد.

**الأحداث**: `view_order_confirmation` (`state: confirmed|pending`)، و`push_prompt_shown` (يملكه M06).

### 3.10 لاحقًا (Should وCould)

| البند | الأولوية | الفكرة | الاعتمادية |
|---|---|---|---|
| ماسح الباركود (F-S06b) | Should | أيقونة في حقل البحث تفتح `mobile_scanner` 7.5.0 بإذن الكاميرا في سياقه. الرمز يُرسل إلى `products/search?q={code}`. نتيجة واحدة تفتح صفحة المنتج مباشرة، وعدة نتائج تُعرض قائمة، ولا نتيجة تعرض «لم نجد منتجًا بهذا الرمز». ومطابقة البحث لـ `barcode` و`sku` تُختبر أولًا على المتجر التطويري | علم `barcode_scanner` |
| كتابة مراجعة بالصور | Should | `GET account/products/{id}/purchase-check`، ثم نموذج نجوم ونص وحتى 5 صور، ثم `POST products/{id}/reviews` multipart ([Create Product Review](https://docs.zid.sa/create-product-review-25768452e0)) | M05 |
| عدّاد العرض والطلب المسبق | Should | عدّاد إن بقي على `sale_price_period_end` أقل من 72 ساعة. وزر «اطلب مسبقًا» مع عدّاد الحملة من `preorder_campaign` و`can_be_preordered` | — |
| الطبقة 3 لكشف النجاح | Should | سكربت المنصة في App Scripts (Partner Dashboard). يعمل فقط حين يحمل الـ user agent `IntisharApp`، وينقل `transaction_id` بتنقل إلى مخطط `intishar-bridge`. ولا يُحقن شيء من التطبيق | M10 (نطاق Extra Addons)، وSPK-01 |
| تنبيه عودة المخزون وانخفاض السعر (F-S16) | Should | اشتراك في المنصة مع «نبهني» والمفضلة، والإرسال من M06 بعد `product.update` | M06، وSPK-08 |
| بحث عربي ذكي (F-S18) | Should | فهرس خاص بالمنصة (Meilisearch مثلًا) يتغذى من webhooks المنتجات، ويقدّم الاقتراحات والتسامح مع الأخطاء. ويبقى عقد شاشة البحث كما هو، ويتغير المصدر فقط | وحدة لم تُسند بعد في خريطة الوحدات |
| حقول `IMAGE` و`FILE` | Could | `POST cart/uploads` (غير موثق، N\*) | SPK-12 |
| أدوات تابي وتمارا الرسمية | Could | `TabbyPresentationSnippet` وأداة تمارا عند توفر مفاتيح التاجر | قرار المشرف (القسم 8) |
| «اشترِ الآن» | Could | إضافة ثم انتقال مباشر إلى الدفع | — |
| رفع إيصال التحويل البنكي | Could | `orders/{code}/transaction-slip` (N\*) | SPK-12 |

## 4. نموذج البيانات

### 4.1 على الجهاز (drift، قاعدة لكل تطبيق، أي لكل متجر)

| الجدول | الحقول | الفهارس | الاحتفاظ |
|---|---|---|---|
| `search_history` | `query TEXT`، و`normalized TEXT UNIQUE`، و`last_used_at INTEGER` | `last_used_at` | آخر 10 |
| `guest_wishlist` | `product_id TEXT PK`، و`snapshot_json TEXT` (الاسم، والصورة، والسعر، و`in_stock`)، و`added_at INTEGER` | `added_at` | حتى 200، ويُفرَّغ بعد الدمج |
| `product_cache` | `key TEXT PK` (المعرّف أو الـ slug)، و`json TEXT`، و`lang TEXT`، و`fetched_at INTEGER` | `fetched_at` | آخر 20، ولمدة ساعة |
| `listing_cache` | `scope_key TEXT PK` (نطاق القائمة والفلاتر والترتيب واللغة)، و`first_page_json TEXT`، و`fetched_at INTEGER` | — | 24 ساعة، وحتى 30 نطاقًا |
| `category_tree` | `lang TEXT PK`، و`json TEXT`، و`etag TEXT`، و`fetched_at INTEGER` | — | يُحدَّث بعد 6 ساعات |
| `stock_alert_local` | `product_id TEXT PK`، و`created_at INTEGER` | — | 90 يومًا |
| `checkout_attempt` | `attempt_id TEXT PK`، و`status TEXT` (`open\|confirmed\|failed\|abandoned`)، و`checkout_type TEXT`، و`cart_snapshot_json TEXT`، و`orders_snapshot_json TEXT`، و`started_at INTEGER`، و`confirmed_order_json TEXT` | `status, started_at` | 7 أيام |

الـ cookies لا تُخزَّن هنا، بل في مخزن M01 المشفّر.

### 4.2 على الخادم (PostgreSQL، وحدة `Orders`)

جدول `checkout_attempts`:

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | `uuid` PK | يُعاد للتطبيق باسم `attempt_id`، وهو 122 بت عشوائية ويعمل كرمز قدرة |
| `tenant_id` | `uuid` FK | |
| `device_id` | `uuid` | من تسجيل الجهاز (M06 أو M12) |
| `zid_customer_id` | `bigint` NULL | للمسجل فقط، ومن رمز المتسوق (M05)، لا من جسم الطلب |
| `checkout_type` | `varchar(10)` | `guest\|customer` |
| `cart_id` | `varchar(64)` | `cart.id` |
| `cart_total` | `numeric(12,2)` | للقياس فقط، لا للمطابقة (الطلب يضيف الشحن والرسوم) |
| `items_fingerprint` | `char(64)` | SHA-256 للأزواج `sku:quantity` مرتبة |
| `status` | `varchar(12)` | `open\|confirmed\|failed\|expired` |
| `matched_by` | `varchar(16)` NULL | `cart_ref\|customer_id\|fingerprint\|bridge` |
| `zid_order_id` | `bigint` NULL | |
| `order_summary` | `jsonb` NULL | الملخص المعروض في شاشة التأكيد |
| `platform`، و`app_version` | `varchar` | |
| `started_at`، و`confirmed_at`، و`expires_at` | `timestamptz` | `expires_at = started_at + 24h` |

الفهارس: `(tenant_id, status, started_at)`، و`(tenant_id, zid_customer_id, status)`، و`(tenant_id, items_fingerprint, status)`، وفهرس فريد على `(tenant_id, zid_order_id)` حين لا يكون فارغًا. والاحتفاظ 90 يومًا، ثم حذف بمهمة مجدولة.

## 5. الواجهات والعقود

### 5.1 Storefront API المستخدمة (نطاق المتجر `https://{store-domain}/api/v1/`)

| الطريقة والمسار | الاستخدام | النمط | المصدر |
|---|---|---|---|
| `GET categories` | تبويب التصنيفات | N | [DOC](https://docs.zid.sa/list-categories-26082032e0) |
| `GET products` | القائمة، والفلاتر، والعدّاد الحي، ونتائج البحث | N (`filters` غير موثق) | [DOC](https://docs.zid.sa/list-products-25510175e0) |
| `GET products/search` | النتائج الفورية | N | [DOC](https://docs.zid.sa/search-products-25720449e0) |
| `GET brands` | فلتر الماركة | N\* | [LIVE](https://rawand.com.sa/api/v1/brands) |
| `GET products/{slug-or-uuid}` | صفحة المنتج | N | [DOC](https://docs.zid.sa/get-product-by-slug-25772175e0) |
| `POST products/{id}/options` | سعر الاختيار | N | [DOC](https://docs.zid.sa/calculate-product-options-price-25720485e0) |
| `GET products/{id}/reviews` | المراجعات | N | [DOC](https://docs.zid.sa/list-product-reviews-25768213e0) |
| `GET products/{id}/bundle-offers` | «اشترِها معًا» | N (المخطط مجهول) | [DOC](https://docs.zid.sa/fetch-bundle-offers-for-a-product-25721877e0) |
| `POST products/{id}/stock-alerts` | «نبهني» | N | [DOC](https://docs.zid.sa/notify-product-stock-availability-25721229e0) |
| `GET cart/checkout/bank-discounts` | عروض البنوك | N | [DOC](https://docs.zid.sa/list-bank-discounts-42100288e0) |
| `GET/POST/DELETE account/wishlists` | المفضلة | N | [DOC](https://docs.zid.sa/get-wishlist-26722764e0) |
| `GET cart` | السلة | N | [DOC](https://docs.zid.sa/get-cart-26082659e0) |
| `POST cart/items`، و`PATCH/DELETE cart/items/{item_id}` | تعديل السلة | N | [DOC](https://docs.zid.sa/add-cart-item-26083895e0) |
| `GET cart/coupons/validations`، و`POST/DELETE cart/coupons` | الكوبون | N | [DOC](https://docs.zid.sa/apply-coupon-26257791e0) |
| `cart/loyalty/balance`، و`redemption-options`، و`calculate`، و`redemptions` | النقاط | N | [DOC](https://docs.zid.sa/apply-loyalty-points-26323433e0) |
| `GET products/gifting/settings`، و`POST/DELETE cart/gift-cards` | الهدية | N | [DOC](https://docs.zid.sa/add-gift-card-26257599e0) |
| `POST cart/clone` | إعادة محاولة الدفع | N | [DOC](https://docs.zid.sa/duplicate-cart-26083625e0) |
| `GET account/orders` | الطبقة 2 (ب) للمسجل | N (مخطط العناصر في SPK-07) | [DOC](https://docs.zid.sa/get-orders-26722142e0) |
| `GET /locales/{lang}-{country}` | مزامنة cookie اللغة | N\* | [LIVE](https://mahasen.com/api/v1/settings) |
| صفحة `/checkout` و`/checkout/guest` | الدفع | W | [DOC](https://docs.zid.sa/login-checkout-via-page-views-2258377m0) |

**مثال: `GET products?categories=412823&page_size=24`** (مختصر، والحقول من القراءة الحية):

```json
{
  "count": 1409, "page": 1, "page_size": 24, "pages_count": 59,
  "next": "https://store.example.sa/api/v1/products?categories=412823&page=2&page_size=24",
  "previous": null,
  "results": [
    {
      "id": "6f06bc89-0cd4-490f-9894-238a93962416",
      "name": "سماعة لاسلكية", "slug": "wireless-headset",
      "price": 765.0, "sale_price": 649.0, "effective_price": 649.0, "discount_percentage": 15,
      "in_stock": true, "quantity": 2, "is_infinite": false, "has_options": true, "is_taxable": true,
      "badge": { "body": { "ar": "يباع سريعًا" }, "icon": { "code": "selling_fast" } },
      "images": [ { "image": { "medium": "https://img.zid.store/...", "large": "https://img.zid.store/..." }, "alt_text": "" } ]
    }
  ],
  "filters": {
    "attributes": [
      { "name": "اللون", "slug": "color", "display_order": 1, "is_enabled": true,
        "data": [ { "id": "c1", "value": "أسود", "type": "color", "type_value": "#000000", "count": 98 } ] }
    ]
  }
}
```

**مثال: `POST products/{id}/options`** (الطلب كما في التوثيق، والمعرّفات UUIDs كما في SDK زد):

```json
{
  "attributes": { "8f1c0f7e-attr-color": "2b7d-value-black" },
  "option_fields": { "a91e-group-giftwrap": ["c33f-option-yes"] },
  "input_fields": ["d7a0-input-engraving"]
}
```

**مثال: مقتطف `GET cart`** (الحقول الموثقة والمرصودة):

```json
{
  "id": "cart_123", "phase": "cart", "is_reserved": false, "products_count": 3,
  "products": [
    { "id": 991, "product_id": "6f06bc89-...", "name": "سماعة لاسلكية", "sku": "RP-CB058",
      "quantity": 2, "price": 649.0, "total": 1298.0, "is_discounted": true, "error_message": "" }
  ],
  "free_shipping_rule": {
    "code": "free_shipping",
    "subtotal_condition": { "min": 200.0, "remaining": 45.0, "products_subtotal": 155.0,
      "products_subtotal_percentage_from_min": 77.5, "status": "pending" },
    "shipping_cities_condition": []
  },
  "coupon": null, "coupon_error_message": null,
  "discount_rules": [], "bundle_offers": [], "checkout_restrictions": null,
  "totals": [ { "code": "subtotal", "title": "المجموع", "value": 1298.0, "value_string": "1298.00 ر.س" } ],
  "total": { "value": 1298.0, "value_string": "1298.00 ر.س" }
}
```

**مثال: خطأ الكوبون (422)**:

```json
{ "detail": [ { "loc": ["query", "coupon_code"], "msg": "Coupon code is invalid or expired", "type": "business_rule_error" } ] }
```

**أخطاء الجلسة الموحدة (401)**: `ERROR_SESSION_MISSING` أو `ERROR_SESSION_INVALID` داخل `message.code`. وتُسلَّم إلى `SessionState` في M05، ولا تعالجها شاشات M04 بنفسها.

### 5.2 BFF: محاولات الدفع

المصادقة: `Authorization: Bearer {device_token}` من تسجيل الجهاز (اصطلاحات M12). ويُضاف `X-Shopper-Token` من M05 للمسجل. والمسار تحت `{platform-api}/v1/shopper/`.

**`POST /v1/shopper/checkout-attempts`**

```json
{
  "cart_id": "cart_123",
  "checkout_type": "customer",
  "cart_total": 1298.00,
  "currency": "SAR",
  "items": [ { "sku": "RP-CB058", "product_id": "6f06bc89-...", "quantity": 2 } ],
  "started_at": "2026-11-10T21:14:03+03:00"
}
```

الرد `201`:

```json
{ "attempt_id": "0b9a3c1e-5c7d-4f0e-9a51-1f2e3d4c5b6a", "status": "open", "poll_interval_ms": 2000, "expires_at": "2026-11-11T21:14:03+03:00" }
```

**`GET /v1/shopper/checkout-attempts/{attempt_id}`**: يرد `200`، ويرد `404` إن لم تخص المحاولة هذا الجهاز.

```json
{
  "attempt_id": "0b9a3c1e-5c7d-4f0e-9a51-1f2e3d4c5b6a",
  "status": "confirmed",
  "matched_by": "customer_id",
  "order": {
    "zid_order_id": 4512345, "code": "rEXuB20myr",
    "total": 1323.00, "currency": "SAR",
    "payment_method": "مدى", "shipping_method": "سمسا",
    "estimated_delivery_time": "2-4 أيام عمل",
    "items_preview": [ { "name": "سماعة لاسلكية", "quantity": 2, "image": "https://img.zid.store/..." } ],
    "created_at": "2026-11-10T21:15:40+03:00"
  }
}
```

**`PATCH /v1/shopper/checkout-attempts/{attempt_id}`** بالجسم `{ "status": "failed", "reason": "failure_url|closed|timeout" }`، والرد `204`. ولا يقبل الانتقال إلى `confirmed` من التطبيق.

**المطابقة في الخادم** عند الحدث الداخلي `OrderCreated` من M10 (بعد إعادة جلب الطلب):
1. إن حمل الطلب مرجع سلة يطابق `cart_id` لمحاولة `open` في المتجر نفسه، تُطابق `cart_ref`. ووجود هذا المرجع ينتظر SPK-01.
2. وإلا، إن كان `order.customer.id` يساوي `zid_customer_id` لمحاولة `open` بدأت قبل الطلب بما لا يزيد على ساعتين، تُطابق مع أحدث محاولة (`customer_id`).
3. وإلا، إن كان `source` يدل على التطبيق (`mobile_app` أو `Store App`، وSPK-03)، و`items_fingerprint` يطابق محاولة `open` **واحدة فقط** في آخر ساعتين، تُطابق `fingerprint`. وإن تعددت المرشحات لا تُطابق أي منها.
4. عند المطابقة: `status=confirmed`، ويُبنى `order_summary` من `orders/{id}` (`code`، و`order_total`، و`payment.method.name`، و`shipping.method.name`، و`estimated_delivery_time`، و`products[]`). ويمكن إرسال إشعار صامت عبر M06 للتسريع، والاستطلاع يبقى المسار المضمون.

**حدود المعدّل**: 60 طلبًا في الدقيقة لكل جهاز على `GET checkout-attempts`، و10 في الساعة على `POST`. وطلبات Merchant API تمر بمحدِّد M10، ولا تُستدعى من نقاط الاستطلاع مباشرة.

### 5.3 عقد `checkout_rules` (من M11، ويُحدَّث دون إصدار)

```json
{
  "version": 1,
  "checkout_path_regex": "^(?:/[a-z]{2}(?:-[a-z]{2})?)?/checkout(?:/guest|/payment)?/?$",
  "cart_path_regex": "^(?:/[a-z]{2}(?:-[a-z]{2})?)?/cart/?$",
  "auth_path_prefix": "/auth",
  "success_url_patterns": [],
  "failure_url_patterns": [],
  "bnpl_hosts": ["checkout.tabby.ai", "tabby.ai", "checkout.tamara.co", "tamara.co"],
  "external_hosts": ["wa.me", "api.whatsapp.com", "apps.apple.com", "play.google.com"],
  "header_reinjection": false,
  "bridge_scheme": "intishar-bridge",
  "poll": { "fast_ms": 2000, "fast_count": 10, "slow_ms": 5000, "max_wait_ms": 120000 }
}
```

`checkout_path_regex` مشتق من نمط مسارات الدفع في SDK زد ([SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)). و`success_url_patterns` و`failure_url_patterns` و`bnpl_hosts` تُملأ بنتيجة SPK-01. ويُختبر المصنّف بحالات وحدة من سجلات SPK-01.

### 5.4 أحداث التحليلات (مقترحة لتصنيف M08)

الأسماء بصيغة snake_case ومتوافقة مع أحداث التجارة في GA4. والخصائص المشتركة (`tenant_id`، و`app_version`، و`platform`، و`locale`، و`session_id`، و`customer_state`) يضيفها M08 تلقائيًا. و`items[]` بالحقول `item_id` و`item_variant` و`item_name` و`price` و`quantity` و`index`.

| الحدث | الشاشة | خصائص إضافية |
|---|---|---|
| `view_category_tree` | التصنيفات | `layout` |
| `select_category` | التصنيفات | `category_id`، و`level` |
| `view_item_list` | القائمة | `item_list_id`، و`item_list_name`، و`items[]` (أول 10) |
| `select_item` | القائمة، والبحث، والمشابهة | `item_list_id`، و`items[1]` |
| `apply_filters` | القائمة | `filters` (أسماء السمات وعدد القيم)، و`result_count` |
| `change_sort` | القائمة | `sort` |
| `search` | البحث | `search_term`، و`results_count`، و`source` |
| `view_search_results` | البحث | `search_term`، و`results_count` |
| `scan_barcode` | البحث (Should) | `result: found\|not_found\|multiple` |
| `view_item` | صفحة المنتج | `items[1]`، و`value` |
| `select_variant` | صفحة المنتج | `item_id`، و`item_variant` |
| `view_item_gallery`، و`zoom_image` | صفحة المنتج | `image_index` |
| `bnpl_info_open` | صفحة المنتج، والسلة | `provider` |
| `view_reviews` | صفحة المنتج | `item_id`، و`rating_avg` |
| `share` | صفحة المنتج | `method: system\|whatsapp`، و`item_id` |
| `stock_alert_subscribe` | القائمة، وصفحة المنتج، والمفضلة | `item_id` |
| `add_to_wishlist`، و`remove_from_wishlist` | الكل | `item_id`، و`customer_state` |
| `view_wishlist`، و`wishlist_merge` | المفضلة | `count`، و`failed` |
| `add_to_cart`، و`remove_from_cart`، و`update_cart_quantity` | الكل | `items[1]`، و`value`، و`source` |
| `view_cart` | السلة | `value`، و`items[]` |
| `apply_coupon`، و`remove_coupon` | السلة | `coupon`، و`result` |
| `redeem_points`، و`add_gift` | السلة | `points`، و— |
| `begin_checkout` | السلة | `value`، و`items[]`، و`checkout_type` |
| `checkout_webview_open`، و`checkout_closed`، و`checkout_load_error`، و`checkout_external_handoff` | الدفع | `attempt_id`، و`stage`، و`host_class` (فئة المضيف لا الرابط الكامل) |
| `checkout_detection` | الدفع | `layer`، و`latency_ms` |
| `purchase` | التأكيد | `transaction_id`، و`value`، و`currency`، و`tax`، و`shipping`، و`coupon`، و`payment_type`، و`items[]`، و`detection_layer` |
| `checkout_failed`، و`checkout_retry`، و`checkout_recovered` | الدفع | `attempt_id`، و`stage`، و`cart_reserved` |
| `view_order_confirmation` | التأكيد | `state` |

`purchase` يُرسل مرة واحدة لكل `transaction_id`. ويُستخدم المعرّف نفسه مفتاح منع تكرار مع بكسلات الويب التي تعمل داخل صفحة الدفع.

### 5.5 العقود مع الوحدات الأخرى

| الوحدة | ما تقدمه لـ M04 | ما يقدمه M04 لها |
|---|---|---|
| M01 | `Dio` مهيأ بالترويستين ومخزن الـ cookies، والموجّه، وقاعدة drift، والأعلام، وحالة الاتصال | الشاشات والمسارات `/category/{id}` و`/products` و`/product/{id}` و`/search` و`/cart` و`/wishlist` و`/checkout` |
| M02 | `PriceText` (الأرقام، ورمز الريال، والعزل الاتجاهي)، والـ tokens | القيمة الرقمية المحسوبة للسعر |
| M03 | `pdp_modules`، و`card_style`، و`categories_layout`، وموجّه الأفعال | `ProductCard` و`PriceText` ضمن `storefront_ui`، والفعل `add_to_cart` |
| M05 | `SessionState` (`guest\|customer`، و`zid_customer_id`، و`X-Shopper-Token`)، و`openLogin()` يعيد النتيجة، وحدث `session.logged_in`، وشاشة تفاصيل الطلب | حدث `checkout.completed` لتحديث قائمة الطلبات |
| M06 وM09 | `requestPushPermission(context: order_placed)` | استدعاؤه من شاشة التأكيد |
| M07 | تحويل الروابط إلى مسارات M04 | المسارات أعلاه |
| M08 | الجمع والتصنيف | الأحداث في 5.4 |
| M10 | الحدث الداخلي `OrderCreated {tenant_id, zid_order_id, customer_id, source, products[{sku, quantity}], created_at, cart_ref?}` بعد إعادة الجلب، و`getOrder(tenant, id)` بحدود المعدّل | — |
| M11 | `tax`، و`bnpl`، و`trust`، و`checkout_rules`، و`brands_enabled`، و`wishlist_enabled`، و`reviews_enabled`، و`is_coupon_form_enabled`، وأعلام الشراء كزائر | — |
| M12 | رمز الجهاز، واصطلاحات الأخطاء والإصدارات في API المنصة، وSentry | — |

## 6. الحالات الحدية والأخطاء

### 6.1 التصنيفات والقائمة والبحث

| الحالة | السلوك المتوقع |
|---|---|
| `page_size` أكبر من 100 | لا يُطلب أبدًا. الحد المرصود 100، والقيمة المستخدمة 24 |
| `filters = {}` | تظهر أقسام السعر والعروض والتصنيف فقط، ولا خطأ |
| قيمة سمة عددها 0 بعد فلتر آخر | تظهر باهتة وغير قابلة للاختيار. وإن كانت مختارة من قبل تبقى رقاقتها قابلة للإزالة |
| `brands=` أو `brand_id=` بدل `brand=` | ممنوع في الكود، واختبار وحدة يتحقق من اسم المعامل |
| صفحة كاملة من النافد | تُجلب التالية تلقائيًا بحد 5 صفحات متتالية. ثم يظهر زر «تحميل المزيد» |
| تغيّر الترتيب أو الفلتر أثناء جلب صفحة | يُلغى الطلب الجاري، ويبدأ النطاق من الصفحة 1 بدلو فارغ |
| `sale_price` أكبر من `price` أو يساويه | يُعرض `price` فقط، بلا شطب ولا شارة |
| رمز شارة مجهول | نص الشارة دون أيقونة |
| `is_infinite = true` و`quantity = 0` | المنتج متوفر، ولا شارة «باقي» |
| استجابة بحث فوري متأخرة | تُتجاهل إن كان رقمها التسلسلي أقدم من آخر استعلام |
| استعلام فيه رقم جوال أو بريد | لا يُحفظ في التحليلات (`[redacted]`)، ويبقى في السجل المحلي فقط |
| 0 نتائج بعد التطبيع أيضًا | حالة «لا نتائج» مع نصائح وزر التصنيفات |
| تصنيف بلا صورة | حرفه الأول على خلفية من لون الهوية |

### 6.2 صفحة المنتج

| الحالة | السلوك المتوقع |
|---|---|
| `has_options = true` و`variants[]` فارغة | يُعامل كمنتج بسيط، ويُسجَّل `pdp_data_anomaly` |
| اختيار لا يطابق أي متغير | زر الإضافة معطل بنص «اختر {اسم الخيار}» |
| `POST options` يفشل أو يتأخر أكثر من ثانيتين | يبقى سعر الحل المحلي، ولا يُمنع الإضافة |
| السعر من `options` مختلف عن المحلي | يُعتمد سعر `options`، ويُسجَّل `options_price_mismatch` |
| حقل مخصص إلزامي فارغ | تمرير إليه، ورسالة تحته، ولا طلب إلى السلة |
| منتج بحقل `IMAGE` أو `FILE` | زر «أكمل الطلب من صفحة المنتج» يفتح `html_url` في WebView داخلي بمزامنة الـ cookies |
| الكمية تتجاوز `max_quantity_per_cart` | زر + معطل، ونص «الحد الأقصى N» |
| `bank-discounts` يعيد خطأ أو قائمة فارغة | الوحدة لا تظهر، ولا خطأ للمتسوق |
| السعر خارج حدود التقسيط | سطر التقسيط لا يظهر |
| `bundle-offers` يعيد `null` أو `payload: []` | الوحدة لا تظهر ([LIVE](https://ppowerstore.com/api/v1/products/RP-CB058)) |
| `related_products` يحوي منتجًا نافدًا | يظهر بشارة النفاد في آخر الشريط |
| وصف HTML فيه `script` أو `iframe` | يُتجاهل الوسم، وتُعرض النصوص والصور فقط |
| رابط داخل الوصف لمنتج أو تصنيف في المتجر | يفتح الشاشة الأصلية عبر M07، وغيره يفتح خارجيًا |
| المتجر مغلق ويمكن تصفحه | الإضافة معطلة، ورسالة `availability.message` |

### 6.3 المفضلة

| الحالة | السلوك المتوقع |
|---|---|
| الزائر يتجاوز 200 عنصر | رسالة «سجّل الدخول لحفظ المزيد»، ولا يُضاف |
| الدمج: منتج محذوف | يُحذف من المحلي بعد فشل فردي بـ 4xx |
| الدمج: انقطاع الشبكة | تبقى العناصر، ويعاد الدمج مع الدخول التالي أو بعد 10 دقائق |
| انتهاء الجلسة أثناء التبديل (401) | يُعاد القلب، ويُطلب الدخول من M05 |
| `wishlist_enabled = false` | تختفي القلوب والشاشة. ولا تُحذف المفضلة المحلية |

### 6.4 السلة

| الحالة | السلوك المتوقع |
|---|---|
| ضياع cookie الجلسة (إعادة تثبيت أو مسح بيانات) | سلة فارغة جديدة. لا استعادة للزائر |
| سطر فيه `error_message` | يظهر تحت السطر، وزر الإتمام معطل حتى يُعدَّل السطر أو يُحذف |
| 4xx عند تعديل الكمية | تُعاد الكمية السابقة، ويُعرض الخطأ |
| نقرات متتالية سريعة على + | دمج في طلب واحد بعد 400 ms |
| الكوبون صالح لكنه لم يعد ينطبق بعد حذف سطر | `coupon_error_message` تحت الرقاقة، مع زر إزالة |
| الكوبون غير مفعّل في المتجر | الحقل لا يظهر |
| `LoyaltyNotEnabledException` | قسم النقاط لا يظهر |
| السلة تغيّرت من الموقع على جهاز آخر | تُحدَّث عند فتح التبويب وعند العودة إلى الواجهة |
| `free_shipping_rule` له شروط مدن | النص «لمدن محددة» |
| `checkout_restrictions` غير مفهوم الشكل قبل SPK-11 | لا يتعطل الزر إلا بخطأ صريح من زد |
| السلة محجوزة (`is_reserved = true`) عند فتحها | شريط «لديك دفع لم يكتمل» مع «أكمل» (يعيد فتح الدفع) و«ابدأ من جديد» (`cart/clone`) |

### 6.5 الدفع والتأكيد

| الحالة | السلوك المتوقع |
|---|---|
| نطاق المتجر في الـ API يختلف عن نطاق الصفحة (`www` أو `zid.store` أو نطاق مخصص) | يُستخدم دائمًا النطاق القانوني من إعداد المتجر (M11) في الطرفين. وأي تحويل من نطاق إلى آخر أثناء الدفع يُسجَّل كخطأ في Sentry |
| تحدي Cloudflare داخل الصفحة | يُسمح به داخل الـ WebView، فهو HTTPS عادي |
| Apple Pay لا يظهر | سلوك صفحة زد حين يعيد `canMakePayments()` قيمة false ([LIVE](https://ppowerstore.com/checkout/guest)). لا معالجة في التطبيق. والقبول ينتظر SPK-02 |
| `intent://` لتطبيق غير مثبت | يُفتح `S.browser_fallback_url` داخل الـ WebView، وإلا تظهر رسالة «التطبيق غير مثبت» |
| المتسوق يُتم الدفع في تطبيق البنك ولا يعود | الـ BFF يطابق الطلب. ومع فتح التطبيق التالي تظهر شاشة التأكيد (3.8.4) |
| إيقاف العملية أثناء رفع الهوية لتابي | استعادة من `checkout_attempt`. والصفحة لا تُستعاد، فإن لم يُؤكَّد الطلب يظهر «لم يكتمل الدفع» |
| رابط فشل ثم تأكيد متأخر من الخادم | شاشة الفشل تتحقق من الـ BFF قبل عرض «أعد المحاولة». وإن وصل التأكيد بعد النسخ، يظهر «تم تأكيد طلبك السابق» وتبقى السلة المنسوخة لقرار المتسوق |
| `cart/clone` يرد بخطأ لأن السلة لم تعد محجوزة | تُستخدم السلة الحالية كما هي |
| نقرتان على «إتمام الطلب» | محاولة واحدة. الزر معطل حتى يُفتح الـ WebView |
| تطابق بصمة مع أكثر من محاولة | لا مطابقة بالبصمة، وتبقى الطبقة (ب) أو الانتظار |
| `order.create` لم يصل (فشل webhook أو تعليقه) | الطبقة (ب) للمسجل، و«قيد التأكيد» للزائر. ويراقب M10 صحة الـ webhooks |
| خطأ SSL في أي إطار رئيسي | رفض دائم، ولوحة خطأ |
| تغيير لغة التطبيق والدفع مفتوح | لا يُعاد تحميل الصفحة. اللغة الجديدة تسري في المحاولة التالية |
| فتح شاشة التأكيد مرة ثانية للمحاولة نفسها | تُمنع بحالة `confirmed_shown` في الجدول المحلي |

## 7. المتطلبات غير الوظيفية

| المجال | المتطلب | القياس |
|---|---|---|
| الأداء: القائمة | أول محتوى حتى ثانية واحدة من الذاكرة، وحتى 1.5 ثانية من الشبكة (p75 على 4G) | تتبع أداء Sentry لكل شاشة |
| الأداء: صفحة المنتج | الرأس من الملخص في أقل من 100 ms من النقر، والصفحة الكاملة حتى ثانية واحدة (p75) | كما سبق |
| الأداء: البحث الفوري | النتائج في أقل من 800 ms بعد انتهاء مهلة الكتابة (p75) | مقياس مخصص |
| الأداء: التمرير | الإطارات التي تتجاوز 16 ms أقل من 1% في قائمة من 200 عنصر على جهاز أندرويد متوسط | اختبار `integration_test` بـ `traceAction` |
| الأداء: السلة | الاستجابة المتفائلة للكمية والقلب في أقل من 100 ms | اختبار واجهة |
| الأداء: الدفع | أول رسم لصفحة الدفع حتى 3 ثوانٍ (p75) | `onPageFinished` منذ النقر |
| كشف النجاح | 95% من الطلبات المؤكدة تُعرض شاشة تأكيدها خلال 10 ثوانٍ من وصول الدفع إلى نهايته | `checkout_detection.latency_ms` |
| الدقة | 0 شاشات تأكيد لطلب غير موجود. ونسبة «قيد التأكيد» أقل من 3% من الطلبات | مطابقة أسبوعية مع طلبات `Store App` في M10 |
| الذاكرة | تحليل شجرة التصنيفات (231 KB) وأي JSON أكبر من 100 KB خارج خيط الواجهة. وذاكرة الصور على القرص حتى 150 MB | |
| الأمان | لا رمز تاجر على الجهاز (ADR-0003). والـ cookies في مخزن مشفّر. ولا تُكتب cookies ولا روابط بمعاملاتها في السجلات (`host_class` فقط). وخطأ SSL يُرفض دائمًا. ولا حقن سكربت في صفحة الدفع، واختبار آلي يفشل إن استُدعيت الدوال الممنوعة في `CheckoutScreen` | مراجعة كود + اختبار |
| الخصوصية | سجل البحث والمفضلة المحلية لا يغادران الجهاز. و`search_term` منقّى من الجوال والبريد. والبصمة في الخادم بلا بيانات شخصية | |
| العربية وRTL | المعرض والتمرير الأفقي وشريط السعر وشريط الشحن المجاني تنعكس. وعدسة البحث ورمز الريال والأرقام لا تنعكس. والـ SKU ورقم الطلب معزولان LTR | لقطات ذهبية بالعربية والإنجليزية |
| إمكانية الوصول | تسميات عربية لكل زر أيقوني (القلب، والمشاركة، والفلتر، و+ و−). والسعر يُقرأ «649 ريالًا، بدلًا من 765». والنافد يُعلن نصًا لا لونًا فقط. وأهداف اللمس 44×44pt و48×48dp. وتكبير الخط حتى 200% دون قص | فحص VoiceOver وTalkBack يدويًا لكل شاشة |
| المراقبة | مقاييس: `checkout_detection` بحسب الطبقة، وزمن التأكيد، وعدد طلبات `order.create` من التطبيق التي لم تُطابق، وعدد مرات `options_price_mismatch` | لوحة في M08 |

## 8. الاعتماديات والمجهول

### 8.1 التجارب المرتبطة

| SPK | ما يحسمه هنا | ما يُبنى قبله خلف واجهة مؤقتة |
|---|---|---|
| SPK-01 | `success_url_patterns` و`failure_url_patterns` و`bnpl_hosts`، ووجود مرجع السلة في الطلب لقاعدة `cart_ref` | المصنّف بقواعد فارغة، والطبقة 2 كاملة |
| SPK-02 | قبول Apple Pay في الـ WebView | لا شيء خاص. قاعدة منع الحقن مطبقة من البداية |
| SPK-03 | قيمة `source` لقاعدة البصمة، وجدوى `utm_*` | البصمة تقبل `mobile_app` و`Store App` معًا |
| SPK-04 | إعادة حقن الترويسة (`header_reinjection`) | العلم مطفأ |
| SPK-05 | وصول جلسة الدخول إلى صفحة `/checkout` | الشراء كزائر يعمل دونه |
| SPK-07 | الطبقة 2 (ب) عبر `account/orders` | الطبقة 2 (أ) وحدها |
| SPK-11 | أشكال `discount_rules` و`bundle_offers` و`checkout_restrictions` وأكواد `totals[]`، وصور الأسطر وخياراتها | عرض `totals[]` كما هي، وصور الأسطر من الذاكرة المحلية |
| SPK-12 | `brands` و`settings` (N\*) | خلف أعلام، ومصدر الضريبة والإعدادات من M11 |

### 8.2 ملاحظات على ADR-0003 والـ PRD

1. **منع الحقن أوسع مما يبدو**. ADR-0003 يمنع حقن السكربت في صفحة الدفع. لكن تقرير المزايا يقترح نقل `transaction_id` عبر `addJavaScriptChannel`، وهذه الدالة نفسها تضيف `WKUserScript` في `webview_flutter_wkwebview` 3.27.2. وكذلك `enableZoom(false)` و`setOnConsoleMessage`. لذلك تستخدم الطبقة 3 هنا تنقلًا إلى مخطط مخصص بدل القناة. هذا لا يخالف الـ ADR، لكنه يصحح التقرير. والمقترح أن يضيف الـ ADR قائمة الدوال الممنوعة صراحة.
2. **تابي تفضّل المتصفح النظامي**. صفحة تابي الحالية تصف فتح الدفع في Custom Tabs أو `SFSafariViewController` بأنه «the most resilient option»، مع روابط `merchant_urls` عميقة. لكن روابط العودة هنا ملك زد وتعود إلى نطاق المتجر، والمتصفح النظامي لا يشارك الـ cookies، فتنكسر الجلسة. لذلك يبقى القرار WebView كما في ADR-0003، مع تطبيق ما يخص الـ WebView في توصيات تابي (الأذونات، والاستعادة، وعدم هدم الصفحة). ويُسأل فريق زد عن روابط العودة من التطبيقات الخارجية.
3. **«النافد في الآخر» مع كل ترتيب** لا يدعمه API زد. والحل هنا الدلو المؤجل (3.2). والأثر: مع ترتيب السعر لا يرى المتسوق النافد إلا بعد آخر صفحة. والمطلوب تأكيد هذا السلوك من المنتج.
4. **سعر الخيارات**: التوثيق يصف استجابة `POST options` بأنها نص، وSDK زد يصفها بكائن منتج. والحل المحلي من `variants[]` هو الأساس هنا، و`options` تأكيد فوقه.
5. **الضريبة**: مصدرها المقترح إعدادات M11 من Merchant API، لا `settings` غير الموثق.
6. **F-S18 (البحث الذكي)** غير مسند لأي وحدة في خريطة الوحدات.

### 8.3 قرارات مفتوحة للمشرف

| # | السؤال | التوصية |
|---|---|---|
| Q1 | عند السماح بالطريقتين: ورقة اختيار (زائر أو دخول)، أم زائر مباشر مع رابط دخول داخل صفحة زد؟ | ورقة بزرين متساويين، والزائر أولًا |
| Q2 | النافد: يُعرض في دلو آخر القائمة، أم يُخفى كليًا بإعداد للتاجر؟ | دلو افتراضيًا، ومفتاح «إخفاء النافد» للتاجر لاحقًا |
| Q3 | سطر التقسيط: نص أصلي محسوب، أم أدوات تابي وتمارا الرسمية حين يقدّم التاجر مفاتيحه؟ | النص الأصلي في الإصدار الأول |
| Q4 | زد تشترط البريد في «نبهني». هل نقبل هذا الاحتكاك، أم ننتظر تنبيه المنصة بالإشعار (F-S16)؟ | نقبله الآن مع تعبئة مسبقة للمسجل |
| Q5 | قاعدة البصمة للزائر: هل يُقبل خطر مطابقة خاطئة نادرة بين جهازين يشتريان السلة نفسها في الساعتين نفسيهما؟ | نعم، بشرط المرشح الوحيد، مع مراقبة المطابقات |

## 9. تقسيم العمل

الحجم: S حتى 3 أيام، وM حتى أسبوع، وL حتى أسبوعين. ولا تتجاوز قصة سباقًا واحدًا لمنفذ واحد.

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| SHOP-01 | حزمة `zid_storefront`: النماذج، وأغلفة endpoints الكتالوج والسلة والمفضلة، وfixtures من المتجر التطويري (M) | Must | نعم | M01 (عميل الشبكة، بالتوازي)، وP-2 للـ fixtures |
| SHOP-02 | تبويب التصنيفات بنمطيه، مع التخزين والتحليل في isolate (S) | Must | نعم | SHOP-01، وموجّه M01 |
| SHOP-03 | `ProductCard` و`PriceText` المحسوب: الضريبة، والخصم، والشارات، و«باقي N»، والنافد (M) | Must | نعم | SHOP-01، وM02 (`PriceText`) |
| SHOP-04 | قائمة المنتجات: الشبكة، والترقيم، والجلب المسبق، والترتيبات الأربعة، ودلو النافد (M) | Must | نعم | SHOP-03 |
| SHOP-05 | ورقة الفلاتر بالعدّاد الحي، وصف الفلاتر المطبقة، وفلتر الماركة خلف علم (M) | Must | نعم | SHOP-04 |
| SHOP-06 | البحث: النتائج الفورية، وزر الإرسال، وإبقاء الاستعلام، والسجل المحلي، والتطبيع (M) | Must | نعم | SHOP-04 |
| SHOP-07 | صفحة المنتج 1: المعرض والتكبير، والعنوان والسعر، والوصف، والمشاركة، وترتيب الوحدات (M) | Must | نعم | SHOP-03، وعقد `pdp_modules` من M03 (قيمة افتراضية حتى ذلك) |
| SHOP-08 | صفحة المنتج 2: العينات، والحل المحلي للمتغير، و`POST options`، والحقول النصية، والكمية، والإضافة إلى السلة (L) | Must | نعم | SHOP-07 |
| SHOP-09 | صفحة المنتج 3: مخزون الفروع، وعروض البنوك، وسطر التقسيط، وكتلة الثقة، والمنتجات المشابهة (M) | Must | نعم | SHOP-07، وإعدادات M11 (قيم وهمية حتى ذلك) |
| SHOP-10 | المراجعات بالصور: المدرّج، والقائمة، وعارض كل الصور (M) | Must | نعم | SHOP-07 |
| SHOP-11 | «نبهني» عبر `stock-alerts` في القائمة وصفحة المنتج والمفضلة (S) | Must | نعم | SHOP-03 |
| SHOP-12 | المفضلة: API للمسجل، والمحلية للزائر، والتبديل المتفائل، والشاشة (M) | Must | نعم | SHOP-03 (المسجل يُختبر بجلسة يدوية) |
| SHOP-13 | دمج مفضلة الزائر بعد الدخول (S) | Must | ينتظر M05 | SHOP-12، وحدث `session.logged_in` من M05 |
| SHOP-14 | السلة الأساسية: الأسطر، والكمية، والحذف والتراجع، والمجاميع وأسطر الضريبة، وشريط الشحن المجاني، والعدّاد، وورقة اختيار الإتمام (L) | Must | نعم | SHOP-01 |
| SHOP-15 | الكوبون: التحقق، ثم التطبيق، ثم الإزالة (S) | Must | نعم | SHOP-14 |
| SHOP-16 | استبدال النقاط وخيار الهدية (M) | Must | ينتظر M05 | SHOP-14، وجلسة مسجلة من M05 |
| SHOP-17 | الحد الأدنى للطلب، والباقات، وقواعد الخصم في السلة و«اشترِها معًا» في صفحة المنتج (M) | Must | ينتظر SPK-11 | SHOP-14، وSHOP-09 |
| SHOP-18 | غلاف الدفع في WebView: مزامنة الـ cookies، والترويسة، والمصنّف، والروابط الخارجية، وقاعدة تابي، والأذونات، واختبار منع الحقن (L) | Must | ينتظر SPK-04 (والقبول ينتظر SPK-02) | SHOP-14، وM01 |
| SHOP-19 | الـ BFF: جدول ونقاط محاولات الدفع، والمطابقة مع `OrderCreated` (M) | Must | ينتظر M10 | M10 (webhooks وإعادة الجلب)، وM12 (رمز الجهاز)، وSPK-01 لقاعدة `cart_ref` |
| SHOP-20 | كشف النجاح بالطبقتين 1 و2، ومسار الفشل والنسخ، والاستعادة بعد موت العملية (L) | Must | ينتظر SPK-01 | SHOP-18، وSHOP-19 |
| SHOP-21 | شاشة تأكيد الطلب بصيغتيها، وربط طلب الإذن (S) | Must | ينتظر SHOP-20 | SHOP-20، وM06 أو M09 للطلب، وM05 لـ «تتبع طلبك» |
| SHOP-22 | أحداث التحليلات لكل شاشات الوحدة (M) | Must | ينتظر M08 | تصنيف M08 (الواجهة قابلة للبدء بمحوّل وهمي) |
| SHOP-23 | الطبقة 3: سكربت `purchase_event` والمخطط المخصص (S) | Should | ينتظر M10 | M10 (نطاق Extra Addons)، وSPK-01 |
| SHOP-24 | ماسح الباركود (S) | Should | نعم | SHOP-06 |
| SHOP-25 | كتابة مراجعة بالصور (M) | Should | ينتظر M05 | SHOP-10 |
| SHOP-26 | عدّاد العرض والطلب المسبق (S) | Should | نعم | SHOP-08 |
| SHOP-27 | حقول `IMAGE` و`FILE` عبر `cart/uploads` (M) | Could | ينتظر SPK-12 | SHOP-08 |
| SHOP-28 | أدوات تابي وتمارا الرسمية (S) | Could | ينتظر قرار Q3 | SHOP-09 |

### معايير القبول لأهم القصص

**SHOP-03: البطاقة والسعر**
1. **بافتراض** أن المتجر لا يضمّن الضريبة في السعر (`is_tax_included_in_product_price = false`)، والنسبة 15%، والمنتج خاضع للضريبة بسعر 100، **عندما** تظهر بطاقته، **إذن** يُعرض السعر 115.00 مع رمز الريال، ويظهر «الأسعار شاملة ضريبة القيمة المضافة» تحت عنوان القائمة.
2. **بافتراض** أن `low_stock_label_enabled = true`، والحد 10، و`quantity = 3`، و`is_infinite = false`، **عندما** تظهر البطاقة، **إذن** تظهر شارة «باقي 3 فقط».
3. **بافتراض** أن `in_stock = false`، **عندما** تظهر البطاقة، **إذن** تظهر «نفدت الكمية» وزر «نبهني» مكان زر الإضافة، ويقرأ قارئ الشاشة «نفدت الكمية».

**SHOP-04: دلو النافد**
1. **بافتراض** ترتيب «السعر: من الأقل»، وأن الصفحة 1 فيها 20 متوفرًا و4 نافدة، **عندما** تُعرض، **إذن** تظهر الـ 20 فقط، ويُحفظ الـ 4 في الدلو.
2. **بافتراض** أن آخر صفحة وصلت (`next = null`)، **عندما** يصل المتسوق إلى النهاية، **إذن** يظهر عنوان «نفدت الكمية» وتحته كل عناصر الدلو بترتيبها.
3. **بافتراض** أن صفحة كاملة نافدة، **عندما** تصل، **إذن** تُجلب التالية تلقائيًا، بحد 5 صفحات متتالية، ثم يظهر «تحميل المزيد».

**SHOP-05: الفلاتر**
1. **بافتراض** أن ورقة الفلاتر مفتوحة، **عندما** يختار المتسوق قيمة «أسود» في سمة اللون، **إذن** يُرسل خلال 300 ms طلب `page_size=1` بالفلتر، ويتحدث الزر إلى «عرض N منتج» حيث N من `count`، وتتحدث أعداد بقية السمات.
2. **بافتراض** تطبيق فلترين، **عندما** تُغلق الورقة، **إذن** تظهر رقاقتان، ويُزال الفلتر بزر ×، ويعيد «مسح الكل» القائمة إلى نطاقها الأصلي.
3. **بافتراض** أن `filters = {}`، **عندما** تُفتح الورقة، **إذن** تظهر أقسام السعر والعروض والتصنيف فقط، دون خطأ.

**SHOP-06: البحث**
1. **بافتراض** أن المتسوق كتب «سما» وتوقف، **عندما** تمضي 350 ms، **إذن** تظهر حتى 10 نتائج من `products/search`، وأولها صف «عرض كل النتائج لـ «سما»».
2. **بافتراض** أنه ضغط زر «بحث»، **عندما** تظهر النتائج، **إذن** يبقى «سما» في الحقل، ويُحفظ في السجل المحلي، ويظهر في رأس «عمليات البحث الأخيرة» عند تفريغ الحقل.
3. **بافتراض** أن الاستعلام «ساعه» أعاد 0 نتائج، **عندما** يُعاد بصيغته المطبّعة فيجد نتائج، **إذن** تظهر مع نص «عرضنا نتائج لـ «ساعه»» بعد التطبيع.

**SHOP-08: تسعير المتغير**
1. **بافتراض** منتج بخياري اللون والمقاس، **عندما** يختار المتسوق «أسود» ثم «L»، **إذن** يتحدث السعر والمخزون والصورة خلال 100 ms من `variants[]`، ثم يُرسل `POST products/{id}/options` مرة واحدة بعد 250 ms.
2. **بافتراض** أن «L» مع «أسود» نافد، **عندما** يُختار، **إذن** تظهر «نفدت الكمية» وزر «نبهني»، ويتعطل زر الإضافة.
3. **بافتراض** أن `options` فشل، **عندما** يضغط المتسوق «أضف إلى السلة»، **إذن** يُضاف المتغير المحلول محليًا بمعرّفه، ولا رسالة خطأ للسعر.

**SHOP-13: دمج المفضلة**
1. **بافتراض** زائر في مفضلته المحلية 3 منتجات، **عندما** يسجل الدخول، **إذن** يُرسل `POST account/wishlists` بالمعرّفات الثلاثة، ويُفرَّغ الجدول المحلي، وتظهر الثلاثة في مفضلة الحساب.
2. **بافتراض** أن أحدها محذوف من المتجر، **عندما** تفشل الدفعة بـ 4xx، **إذن** تُعاد العناصر فرديًا، ويُدمج الاثنان الصالحان، ويُحذف الثالث محليًا، ويُرسل `wishlist_merge {count: 2, failed: 1}`.

**SHOP-14 وSHOP-15: السلة والكوبون**
1. **بافتراض** قاعدة شحن مجاني بحد 200، و`remaining = 45`، **عندما** تُفتح السلة، **إذن** يظهر «باقي لك 45 ر.س للشحن المجاني» والشريط عند 77.5%.
2. **بافتراض** أن المتسوق ضغط + ثلاث مرات خلال ثانية، **عندما** تنتهي المهلة، **إذن** يُرسل طلب `PATCH` واحد بالكمية النهائية، ويتحدث العدّاد.
3. **بافتراض** كوبون منتهٍ، **عندما** يضغط «تطبيق»، **إذن** يعيد طلب التحقق 422، وتظهر رسالته تحت الحقل، ولا يُرسل `POST cart/coupons`.

**SHOP-18: غلاف الدفع**
1. **بافتراض** مسجل في سلته منتجان، **عندما** يضغط «إتمام الطلب»، **إذن** تُكتب cookies `session` و`csrftoken` و`locale` في الـ WebView قبل التحميل، ويُحمَّل `/checkout?utm_source=app...` بالترويسة `Zid-Client-Platform: mobile-app`، وتظهر في الصفحة منتجات السلة نفسها.
2. **بافتراض** أن الصفحة الحالية على نطاق تابي، **عندما** يضغط المتسوق زر الرجوع في أندرويد، **إذن** لا يحدث شيء، ولا يظهر زر إغلاق في الشريط العلوي.
3. **بافتراض** أن صفحة الدفع طلبت فتح `intent://` لتطبيق بنك مثبت، **عندما** يُصنَّف التنقل، **إذن** يُفتح التطبيق الخارجي، ولا يتغير محتوى الـ WebView.
4. **بافتراض** بناء iOS، **عندما** يعمل الاختبار الآلي لـ `CheckoutScreen`، **إذن** يفشل إن استُدعيت أي من `addJavaScriptChannel` أو `runJavaScript` أو `runJavaScriptReturningResult` أو `setOnConsoleMessage` أو `enableZoom(false)`.

**SHOP-20: كشف النجاح والفشل**
1. **بافتراض** مسجل أتم الدفع بمدى، **عندما** يخرج الرابط من مسار الدفع إلى صفحة في المتجر، **إذن** تظهر طبقة «جارٍ تأكيد طلبك»، ثم شاشة التأكيد برقم الطلب فور أن يرد الـ BFF بـ `confirmed` أو يظهر طلب أحدث في `account/orders`.
2. **بافتراض** زائر ولم يصل `order.create` خلال 120 ثانية، وأن السلة تفرغت، **عندما** تنتهي المهلة، **إذن** تظهر صيغة «قيد التأكيد» دون رقم طلب، وتتحول إلى الكاملة عند وصول التأكيد.
3. **بافتراض** أن المتسوق أغلق الصفحة بعد بدء الدفع (`is_reserved = true`) ولم يُؤكَّد طلب، **عندما** يضغط «أعد المحاولة»، **إذن** يُرسل `POST cart/clone`، وتُسجل محاولة جديدة، ويُعاد فتح الدفع بالسلة المنسوخة.
4. **بافتراض** أن العملية ماتت أثناء الدفع وأن الـ BFF أكد الطلب، **عندما** يفتح المتسوق التطبيق خلال 24 ساعة، **إذن** تظهر شاشة التأكيد مرة واحدة فقط.

**SHOP-21: التأكيد**
1. **بافتراض** طلبًا مؤكدًا وإذن إشعارات غير محسوم، **عندما** تظهر الشاشة، **إذن** يظهر شرح «نبلغك بحالة طلبك» بعد ثانية ثم حوار النظام، ويُرسل `purchase` مرة واحدة بـ `transaction_id` الطلب.
2. **بافتراض** زائرًا، **عندما** يضغط «سجّل الدخول برقم جوالك لتتبع طلبك» ويُتم الدخول، **إذن** تُفتح تفاصيل الطلب في M05.

## 10. المصادر

- زد: [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)، و[List Products](https://docs.zid.sa/list-products-25510175e0)، و[Search Products](https://docs.zid.sa/search-products-25720449e0)، و[Get Product by Slug](https://docs.zid.sa/get-product-by-slug-25772175e0)، و[Calculate Product Options Price](https://docs.zid.sa/calculate-product-options-price-25720485e0)، و[JS Products](https://docs.zid.sa/products-1475307m0)، و[Display options as colors or images](https://docs.zid.sa/display-product-options-as-colors-or-images-2264161m0)، و[Notify Product Stock Availability](https://docs.zid.sa/notify-product-stock-availability-25721229e0)، و[List Product Reviews](https://docs.zid.sa/list-product-reviews-25768213e0)، و[Create Product Review](https://docs.zid.sa/create-product-review-25768452e0)، و[Fetch Bundle Offers for a Product](https://docs.zid.sa/fetch-bundle-offers-for-a-product-25721877e0)، و[List Categories](https://docs.zid.sa/list-categories-26082032e0)، و[Get Wishlist](https://docs.zid.sa/get-wishlist-26722764e0)، و[Get Cart](https://docs.zid.sa/get-cart-26082659e0)، و[Add Cart Item](https://docs.zid.sa/add-cart-item-26083895e0)، و[Duplicate Cart](https://docs.zid.sa/duplicate-cart-26083625e0)، و[Apply Coupon](https://docs.zid.sa/apply-coupon-26257791e0)، و[Check Coupon Validity](https://docs.zid.sa/check-coupon-validity-26323357e0)، و[Apply Loyalty Points](https://docs.zid.sa/apply-loyalty-points-26323433e0)، و[Customer’s Current Points Balance](https://docs.zid.sa/customers-current-points-balance-26324317e0)، و[Add Gift Card](https://docs.zid.sa/add-gift-card-26257599e0)، و[List Bank Discounts](https://docs.zid.sa/list-bank-discounts-42100288e0)، و[Bank Discounts](https://docs.zid.sa/bank-discounts-2332488m0)، و[Get Orders](https://docs.zid.sa/get-orders-26722142e0)، و[View Order](https://docs.zid.sa/view-order-12479054e0)، و[Webhooks](https://docs.zid.sa/webhooks)، و[Mobile Apps: Scripts](https://docs.zid.sa/scripts-1758413m0)، و[llms.txt](https://docs.zid.sa/llms.txt)، و[SDK زد v3.33.9](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js).
- قراءات حية (2026-11-10): [pcpalace products](https://pcpalace.com.sa/api/v1/products?page_size=2)، و[pcpalace categories](https://pcpalace.com.sa/api/v1/categories)، و[pcpalace search](https://pcpalace.com.sa/api/v1/products/search?q=del&page_size=2)، و[ppowerstore product](https://ppowerstore.com/api/v1/products/RP-CB058)، و[ppowerstore reviews](https://ppowerstore.com/api/v1/products/6f06bc89-0cd4-490f-9894-238a93962416/reviews?page_size=3)، و[ppowerstore wishlist](https://ppowerstore.com/api/v1/account/wishlists)، و[ppowerstore checkout/guest](https://ppowerstore.com/checkout/guest)، و[rawand brand filter](https://rawand.com.sa/api/v1/products?page_size=3&brand=01a12fba-2724-7f03-ac6a-0334ad6b08e9)، و[mahasen settings](https://mahasen.com/api/v1/settings)، و[mahasen cart](https://mahasen.com/api/v1/cart).
- تابي: [Integration without SDK](https://docs.tabby.ai/pay-in-4-custom-integration/mobile-apps/integration-without-sdk)، و[Full testing checklist](https://docs.tabby.ai/pay-in-4-custom-integration/full-testing-checklist)، و[tabby_flutter_inapp_sdk 2.1.0](https://pub.dev/packages/tabby_flutter_inapp_sdk). تمارا: [tamara_flutter_sdk 1.0.17](https://pub.dev/packages/tamara_flutter_sdk).
- WebKit وApple Pay: [WebKit bug 205730](https://bugs.webkit.org/show_bug.cgi?id=205730)، و[Apple forums 696572](https://developer.apple.com/forums/thread/696572).
- pub.dev: [webview_flutter 4.14.1](https://pub.dev/packages/webview_flutter)، و[webview_flutter_wkwebview 3.27.2](https://pub.dev/packages/webview_flutter_wkwebview)، و[webview_flutter_android 4.14.1](https://pub.dev/packages/webview_flutter_android)، و[mobile_scanner 7.5.0](https://pub.dev/packages/mobile_scanner)، و[dio 5.11.1](https://pub.dev/packages/dio)، و[drift 2.35.4](https://pub.dev/packages/drift)، و[cached_network_image 4.0.6](https://pub.dev/packages/cached_network_image)، و[flutter_widget_from_html_core 0.17.4](https://pub.dev/packages/flutter_widget_from_html_core)، و[photo_view 0.15.0](https://pub.dev/packages/photo_view).
- تجربة المستخدم: [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)، و[Baymard, Product List UX](https://baymard.com/blog/current-state-product-list-and-filtering)، و[Baymard, Checkout UX](https://baymard.com/blog/current-state-of-checkout-ux)، و[Baymard 652](https://baymard.com/guidelines/652-guest-checkout-prominence)، و[Baymard, Thumbnails](https://baymard.com/research-articles/always-use-thumbnails-additional-images)، و[Baymard, Mobile UX 2026](https://baymard.com/blog/mobile-ux-ecommerce).
- ملاحظات البحث: `research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md`، و`mobile_shopping_ux.md`، و`local_builders_teardown.md`، و`research_notes/جدوى منصة تطبيقات متاجر زد/zid_api_headless.md`، و`reports/مزايا وتخصيص تطبيقات متاجر زد.md`.
