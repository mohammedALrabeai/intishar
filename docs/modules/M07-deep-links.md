# M07: الروابط العميقة

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter، وLaravel (وحدة `Links`)، وبنية تحتية (نطاق روابط للمنصة، وDNS، وTLS، وCDN)، وNext.js (صفحة التنزيل، ومنشئ الروابط في M15) |
| المتطلبات | F-S15 (Should)، وF-M07 (الرابط الداخلي في الإشعار، Must)، وF-S07 (المشاركة عبر WhatsApp، Must)، وF-M08b (معاينة QR، Should)، وF-M11 (تحليلات فتح الروابط) |
| القرارات | ADR-0004 (موجّه واحد للأفعال والروابط)، وADR-0008 (بند الروابط العامة وSPK-10)، وADR-0002، وADR-0007، وADR-0010 |
| تعتمد على | M01 (go_router، وأسماء المسارات، والإقلاع، ونقطة الدخول)، وM03 (`ActionDispatcher` يمر عبر الموجّه)، وM04 وM05 (الشاشات الهدف وبوابة الدخول)، وM06 (روابط الإشعارات)، وM08 (الأحداث والـ UTM)، وM10 (كتابة إعدادات OneSignal في زد عند نجاح SPK-10)، وM11 (رموز معاينة المسودة، والصفحات)، وM12 (النطاقات والشهادات والمراقبة)، وM13 (entitlements وintent filters وقدرة Associated Domains)، وM14 (Team ID وبصمة توقيع Play)، وM15 (منتقي الروابط ومنشئها وQR) |
| بادئة القصص | LINK |

## 1. الغرض والنطاق

الوحدة تملك صيغة كل رابط يفتح شاشة في التطبيق، والموجّه الذي يحوّله إلى شاشة، أيًا كان مصدره:
- رابط ويب (Universal Link أو App Link).
- نظام مخصص (custom scheme).
- إشعار من M06.
- فعل كتلة من M03.
- رابط مشاركة، أو رابط حملة، أو QR.

وتملك كذلك نطاق الروابط الذي تخدمه المنصة وملفات الربط فيه، وما يحدث حين لا يكون التطبيق مثبتًا.

**المبدأ**: جدول توجيه واحد يطابق مسارات متجر زد كما هي (`/products/{slug}`…). فالرابط نفسه يعمل على نطاق المتجر، وعلى نطاق المنصة، وفي الإشعار، ولا يختلف إلا المضيف.

### داخل الإصدار الأول (Must)
- المحلّل `LinkResolver` وجدول التوجيه الكامل لمسارات زد، ومسارات المنصة تحت `/_/` (القسم 3.1).
- المنسّق `DeepLinkCoordinator`:
  - الإقلاع البارد والدافئ، والانتظار حتى نقطة الدخول في M01.
  - بوابة الدخول، وتسليم روابط الإشعارات وأفعال الكتل.
- نظام مخصص لكل تاجر، للاختبار ولـ QR إقران الأجهزة التجريبية (M06).
- مدقق الروابط في الخادم (`LinkValidator`) لـ M06 وM03، ومنتقي الرابط في اللوحة.
- سياق الحملة في الجلسة (UTM) لتمريره إلى الدفع (M04) والتحليلات (M08)، وأحداث فتح الروابط.
- المشاركة من صفحة المنتج (F-S07) برابط المتجر على الويب (`html_url`) إلى أن يعمل نطاق المنصة.

### لاحقًا (Should وCould)
تفصيلها في الأقسام 3.6 إلى 3.12.
- **Should** (F-S15، وF-M08b):
  - نطاق روابط للمنصة بنطاق فرعي لكل متجر، يخدم `apple-app-site-association` و`assetlinks.json` لكل تاجر.
  - Universal Links وApp Links في بناء كل تاجر.
  - التحويل حين لا يكون التطبيق مثبتًا.
  - روابط المشاركة، وروابط الحملات مع UTM وQR.
  - مسار معاينة المسودة بـ QR.
  - نطاق المتجر مسارًا ثانويًا إن نجح SPK-10.
- **Could**: الربط المؤجل (Deferred deep linking) على أندرويد عبر Play Install Referrer، وربط منصة قياس يملكها التاجر (AppsFlyer أو Adjust).

**توصية**: نقل نطاق المنصة وUniversal Links وApp Links (LINK-04 وLINK-05) إلى الإصدار الأول. السبب في القسم 8.

### خارج مسؤولية الوحدة
- رسم الشاشات الهدف: M04 وM05. وإصدار رموز المعاينة وتقديم المسودة: M11.
- إرسال الإشعار: M06. وتعريف حقول الكتل: M03، الذي يستخدم صيغة المسار هنا.
- تسجيل App ID وتفعيل قدراته والتوقيع: M13. وجمع Team ID وبصمة Play: M14.
- نموذج النسبة والإيراد: M08.

## 2. المكونات حسب الطبقة

### 2.1 نطاق الروابط (البنية)

**القرار**: نطاق مستقل تملكه المنصة، يُرمز له هنا `{link-domain}` (الاسم قرار مفتوح، القسم 8)، بنطاق فرعي لكل متجر: `https://{tenant_slug}.{link-domain}`.

| المعيار | نطاق فرعي لكل متجر (المختار) | مسار لكل متجر (`{link-domain}/s/{store}/...`) |
|---|---|---|
| حجم ملف AASA | ملف صغير لكل تاجر فيه تطبيق واحد | ملف واحد فيه كل التجار. وحد 128KB الذي وثّقته Apple ([سجل مراجعات Apple](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/RevisionHistory.html)) يصبح سقفًا لعدد التجار |
| العزل | خطأ في ملف تاجر لا يمس غيره | نشر خاطئ واحد يكسر روابط كل التجار |
| التحديث | الأجهزة تجلب الملف من CDN لدى Apple عند التثبيت، وتتحقق من التحديث نحو مرة أسبوعيًا، ولا يوجد إبطال يدوي للكاش ([Supporting associated domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains)، [TN3155](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links)). والأثر محصور في تاجر واحد | أي تعديل لتاجر يمر بدورة كاش الملف المشترك للجميع |
| أندرويد | التحقق لكل مضيف، ومضيف واحد لكل تطبيق | كل التطبيقات تتحقق على المضيف نفسه. وأندرويد 14 فأقدم يوجّه بالـ manifest فقط، فيلزم `pathPrefix` لكل تطبيق، وعند التداخل يفوز آخر تطبيق مثبت ([Add App Links](https://developer.android.com/training/app-links/add-applinks)) |
| الشهادة وDNS | شهادة wildcard وسجل DNS wildcard | شهادة واحدة |
| قاعدة النطاق نفسه | روابط موقع المتجر (نطاق آخر) إلى نطاق المنصة تفتح التطبيق | نفس الشيء |

**القواعد**
1. **`tenant_slug` ثابت لا يتغير**: يُخصص عند الإعداد (M14)، بالنمط `^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$`.
   - السبب: يدخل الملف التنفيذي في الـ entitlement وفي الـ manifest، فتغييره يحتاج بناءً جديدًا مع إبقاء القديم يحوّل.
   - لا يُشتق من نطاق متجر زد، لأن التاجر قد يغيّره.
2. **أسماء محجوزة**: `www`، و`api`، و`app`، و`admin`، و`get`، و`cdn`، و`static`، و`mail`، و`status`، و`docs`، و`preview`، و`link`، و`help`.
3. **لا wildcard في الـ entitlement** (`applinks:*.{link-domain}`): مع الـ wildcard يجلب iOS وأندرويد الملف من النطاق الجذر، فيجتمع فيه كل التجار ([TN3155](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links)، [Add App Links](https://developer.android.com/training/app-links/add-applinks)). كل تطبيق يُعلن مضيفه بالاسم الكامل.
4. **الخادم**:
   - DNS: سجل `*.{link-domain}` يشير إلى CDN، ثم إلى وحدة `Links` في Laravel.
   - شهادة wildcard عبر ACME بتحدي DNS-01، وتجديد آلي قبل 30 يومًا من الانتهاء.
5. **ملفات الربط**:
   - تُقدَّم عبر HTTPS بلا أي تحويل. Apple لا تقبل 301 ولا 302 ([TN3155](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links))، وAndroid كذلك ([Configure assetlinks](https://developer.android.com/training/app-links/configure-assetlinks)).
   - بنوع `application/json`، وتقبل أي User-Agent.
   - كاش الـ CDN ساعة واحدة، ويُمسح عند كل تحديث.
6. **صفحة التنزيل**: على المضيف المحجوز `get.{link-domain}`، يخدمه تطبيق Next.js (ADR-0010).

### 2.2 تطبيق Flutter

**الحزم** (من pub.dev في 2026-11-10):

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| [app_links](https://pub.dev/packages/app_links) | ^7.2.2 | Universal Links وApp Links والنظام المخصص. `uriLinkStream` يبث الرابط الأول واللاحق، و7.2.2 يحفظ الروابط التي تصل قبل أول اشتراك ([changelog](https://pub.dev/packages/app_links/changelog)) |
| [go_router](https://pub.dev/packages/go_router) | ^18.1.4 | الموجّه، ويملك M01 تعريفه |
| [share_plus](https://pub.dev/packages/share_plus) | ^13.3.1 | ورقة المشاركة |
| [url_launcher](https://pub.dev/packages/url_launcher) | ^6.3.3 | فتح الروابط الخارجية وWhatsApp |
| [play_install_referrer](https://pub.dev/packages/play_install_referrer) | ^0.6.0 | Could: الربط المؤجل على أندرويد. والبديل `android_play_install_referrer` متوقف |

> هذه الإصدارات تتطلب Flutter 3.44 وDart 3.12 على الأقل (القرار في M01).

**إيقاف معالج Flutter الافتراضي**: نعالج الروابط بأنفسنا عبر `app_links`، لأن التحويل من مسار زد إلى شاشة يحتاج منطقًا:
- بحثًا غير متزامن (اسم العلامة إلى معرّفها).
- وبوابة دخول، وتحليلات.

ومنذ Flutter 3.24 يجب إيقاف المعالج صراحة ([app_links: Android](https://github.com/llfbandit/app_links/blob/master/doc/README_android.md)، [iOS](https://github.com/llfbandit/app_links/blob/master/doc/README_ios.md)، [Flutter deep linking](https://docs.flutter.dev/ui/navigation/deep-linking)):
- iOS: `FlutterDeepLinkingEnabled = false` في Info.plist.
- أندرويد: `flutter_deeplinking_enabled = false` في `MainActivity`.

**الملفات** (`lib/core/links/`):

| الملف | المسؤولية |
|---|---|
| `route_table.g.dart` | جدول التوجيه مولّد من `06-api/links/route-table.json` (القسم 5.4) |
| `link_resolver.dart` | دالة خالصة: من `Uri` إلى `ResolvedLink`، بلا اعتماد على Flutter |
| `deep_link_coordinator.dart` | يستقبل كل المصادر، وينتظر الجاهزية، ويمنع التكرار، وينفذ التنقل |
| `link_context.dart` | سياق الحملة في الجلسة (UTM و`ish_*`) |
| `share_link_builder.dart` | بناء روابط المشاركة |
| `link_analytics.dart` | أحداث M08 |
| `install_referrer.dart` | Could: قراءة الإحالة مرة واحدة |

**إعداد المنصات** (يولّده M13 من إعداد البناء):

iOS، في `Runner.entitlements` (Should، مع F-S15):

```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:acme.intishar.link</string>
  <!-- يُضاف فقط إن نجح SPK-10 وفُعّل للتاجر -->
  <string>applinks:acme-store.com</string>
</array>
```

وفي Info.plist (Must):

```xml
<key>FlutterDeepLinkingEnabled</key><false/>
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>intishar-acme</string></array>
  </dict>
</array>
```

أندرويد، في `AndroidManifest.xml` داخل `MainActivity`، ومع `android:exported="true"` الإلزامي منذ أندرويد 12 ([Intents and filters](https://developer.android.com/guide/components/intents-filters)):

```xml
<meta-data android:name="flutter_deeplinking_enabled" android:value="false" />

<!-- Must: النظام المخصص -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="intishar-acme" />
</intent-filter>

<!-- Should: App Links على نطاق المنصة -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" />
  <data android:scheme="http" />
  <data android:host="acme.intishar.link" />
</intent-filter>
```

`autoVerify` إلزامي، والفلتر يحتاج `http` و`https` معًا ([Add App Links](https://developer.android.com/training/app-links/add-applinks)). واسم النظام المخصص `intishar-{tenant_slug}`، وهو فريد لكل تاجر حتى لا يتنازع تطبيقان عليه.

### 2.3 خادم Laravel (وحدة `Links`)

| المكوّن | المسؤولية |
|---|---|
| `TenantHostResolver` | يحدد المستأجر من `Host`. والمضيف المجهول يعيد 404 |
| `WellKnownController` | `apple-app-site-association` و`assetlinks.json` من إعداد التاجر |
| `FallbackController` | التحويل حين لا يكون التطبيق مثبتًا (القسم 3.6) |
| `LinkValidator` | يتحقق أن المسار يطابق جدول التوجيه، ويتحقق اختياريًا من وجود الهدف عبر M10. يستخدمه M06 وM11 |
| `LinkBuilder` | يبني رابط المنصة من هدف وUTM للوحة |
| `TargetSearch` | بحث المنتجات والتصنيفات والصفحات لمنتقي الرابط |
| `AssociationHealthCheck` | يعمل يوميًا وبعد كل تغيير: يفحص الملفين من نطاقنا، ومن CDN لدى Apple، ومن Digital Asset Links |
| `StoreDomainLinker` | Should، عند نجاح SPK-10: كتابة إعدادات OneSignal في زد عبر M10، والتحقق من ملف زد |

هذه وحدة جديدة صغيرة في المونوليث، تُضاف إلى قائمة ADR-0005 (القسم 8).

### 2.4 الويب (Next.js)

- **صفحة التنزيل** `get.{link-domain}/{tenant_slug}`:
  - شعار التاجر واسمه، وزرا App Store وGoogle Play، وزر «تصفح المتجر» إلى موقع المتجر.
  - وإن جاء الطلب برابط معاينة أو إقران، يظهر نص يشرح أنه يحتاج التطبيق.
  - بالعربية افتراضيًا، والإنجليزية بحسب `Accept-Language`.
- **متطلبات M15**:
  - منتقي الرابط: منتج أو تصنيف أو صفحة أو الرئيسية أو مسار مخصص، مع بحث. ويستخدمه محرر الكتل والإشعارات.
  - منشئ روابط الحملات (Should) بقوالب مصادر جاهزة: Instagram، وSnapchat، وTikTok، وX، وWhatsApp، وSMS.
  - توليد QR في المتصفح بتنزيل PNG وSVG.
  - بطاقة «حالة الروابط» في الإعدادات.

## 3. التدفقات

### 3.1 خوارزمية التحليل (`LinkResolver.resolve`)

1. **التطبيع**:
   - المسار النسبي (من الإشعار أو الكتلة) يُحل على `https://{tenant_slug}.{link-domain}`.
   - المضيف بأحرف صغيرة، وتُحذف الشرطة المائلة الأخيرة، ويُفك الترميز مرة واحدة.
2. **تصنيف المضيف**:
   - `tenant`: نطاق المنصة للتاجر، أو نطاقات متجره من الإعداد (النطاق المخصص و`{sub}.zid.store`)، أو النظام المخصص `intishar-{slug}`.
   - `external`: أي نطاق آخر، أو `tel:` أو `mailto:` أو `wa.me`.
3. **المضيف الخارجي**: يُفتح خارج التطبيق بـ `url_launcher` في وضع `externalApplication`. ولا يدخل جدول التوجيه.
4. **فصل معاملات التتبع**: `utm_source` و`utm_medium` و`utm_campaign` و`utm_term` و`utm_content` و`ish_src` و`ish_cid` و`ish_mid` تذهب إلى `tracking`، والباقي إلى معاملات الشاشة.
5. **المطابقة**: بالترتيب على جدول 3.2، وأول تطابق هو المعتمد.
6. **الناتج**: `ResolvedLink { route, params, requiresAuth, presentation, tracking, original }`. و`presentation` أحد ثلاثة:
   - `tab`: تبديل التبويب.
   - `push`: فوق الرئيسية.
   - `external`.
7. **مضيف التاجر بلا تطابق**: المسار `webview` بالعنوان `https://{store-domain}{path}`، وهو فعل `open_url_inapp` في ADR-0004. ولا يُفتح المتصفح الخارجي لرابط من المتجر نفسه.

### 3.2 جدول التوجيه

المسارات مطابقة لروابط متجر زد التي تظهر في القوائم والكتل وحقول `url` في الـ API (`zid_feature_capability_map.md`، Q3). وما عليه «يُتحقق منه» لم يُرَ بعد على متجر حي، ويُثبت في LINK-01 على المتجر التطويري.

| # | النمط | الشاشة (`route`) | المعاملات | دخول؟ | العرض | ملاحظة |
|---|---|---|---|---|---|---|
| 1 | `/` | `home` | — | لا | tab | — |
| 2 | `/products/{key}` | `product` | `key` = slug أو UUID، وزد تقبل الاثنين | لا | push | F-S07 |
| 3 | `/products` | `product_list` | بلا فلتر | لا | push | — |
| 4 | `/categories` | `categories` | — | لا | tab | — |
| 5 | `/categories/{id}` و`/categories/{id}/{slug}` | `product_list` | `category_id` رقمي، والـ slug للعرض فقط | لا | push | — |
| 6 | `/brands` | `brands` | — | لا | push | خلف علم `brands_enabled` (مسار غير موثق). وعند إطفائه يُفتح `webview` |
| 7 | `/brands/{slug}` | `product_list` | `brand` = UUID يُحل من `GET brands` المخزن | لا | push | إن تعذر الحل يُفتح `webview` |
| 8 | `/search?q={q}` | `search` | `q` | لا | tab | يُتحقق منه |
| 9 | `/cart` | `cart` | — | لا | tab | — |
| 10 | `/checkout` و`/checkout/guest` و`/checkout/*` | `cart` | — | لا | tab | الرابط لا يفتح الدفع مباشرة أبدًا (ADR-0003) |
| 11 | `/pages/{slug}` | `cms_page` | `slug` | لا | push | `GET pages/{slug}` |
| 12 | `/blogs` و`/blogs/{slug}` | `webview` | — | لا | push | المدونة ليست في نطاق PRD |
| 13 | `/account` | `account` | — | لا | tab | — |
| 14 | `/account/orders` و`/account/orders/*` | `orders` | — | نعم | push | الرابط المفرد للطلب في حساب الويب غير معروف (SPK-07) |
| 15 | `/account/addresses` | `addresses` | — | نعم | push | يُتحقق منه |
| 16 | `/account/wishlist` و`/wishlist` | `wishlist` | — | لا | push | يُتحقق منه. ومفضلة الزائر محلية (F-S13) |
| 17 | `/auth/login` و`/login` | `login` | `redirect` | — | push | M05 |
| 18 | `/l/{slug}` | `platform_page` إن وُجدت صفحة منصة بالاسم المستعار `l/{slug}`، وإلا `webview` | `slug` | لا | push | صفحات `theme_rules` في زد |
| 19 | `/locales/{lang}-{country}` | تبديل اللغة (F-S01)، ثم تحليل `redirect_to` | `lang` | لا | — | — |
| 20 | `/faqs` و`/shipping-and-payment` وصفحات معلومات أخرى | `webview` | — | لا | push | لا REST لها |
| 21 | أي مسار آخر على مضيف التاجر | `webview` | العنوان الكامل | لا | push | القسم 3.1، الخطوة 7 |
| 22 | `/_/o/{order_id}` | `order_detail` | `order_id` | نعم، أو طلب زائر مربوط بالجهاز (M05) | push | رابط إشعار الحالة (M06). Must |
| 23 | `/_/pages/{page_id}` | `platform_page` | `page_id` | لا | push | صفحة حملة من الكتل (M03 وM11). Must |
| 24 | `/_/home` | `home` | — | لا | tab | — |
| 25 | `/_/pair/{token}` | `push_pairing` | `token` | لا | push | إقران جهاز تجريبي (M06). Must عبر النظام المخصص |
| 26 | `/_/p/{token}` | `draft_preview` | `token` | لا | push | معاينة المسودة (M11). Should |
| 27 | `/_/dl` و`/_/dl/*` | — | — | — | — | مستثنى من AASA، ويبقى في المتصفح لصفحة التنزيل |

**قيود عامة على الجدول**
- المعاملات تُتحقق بالنمط قبل الاستخدام: `id` رقم، و`order_id` رقم، و`token` بين 16 و128 حرفًا من `[A-Za-z0-9_-]`. وأي معامل غير صالح يجعل الرابط `not_found`.
- طول الرابط حتى 2,048 حرفًا، وما زاد يُرفض.
- لا تُنفَّذ أفعال لها أثر من رابط، مثل الإضافة إلى السلة أو تطبيق كوبون. الفعل `apply_coupon` (ADR-0004) متاح للكتل فقط لا للروابط الخارجية. السبب: رابط خارجي لا يجوز أن يغيّر حالة دون فعل من المستخدم.

### 3.3 الإقلاع البارد

1. في `main()`، قبل `runApp`، يُنشأ `AppLinks()` ويشترك المنسّق في `uriLinkStream`. التوثيق يطلب الإنشاء المبكر لالتقاط رابط الإقلاع.
2. M06 يسلّم الإشعار الذي فتح التطبيق، من `getInitialMessage()`، إلى `DeepLinkCoordinator.handle(uri, source: push)`.
3. قبل إعلان M01 الجاهزية، يحتفظ المنسّق بآخر رابط فقط، وصلاحيته 60 ثانية. والجاهزية تعني: السبلاش، ثم التخطيط المخزن، ثم الموجّه، ثم فحص التحديث الإجباري.
4. **عند الجاهزية**:
   - إن طُلب تحديث إجباري (F-P04): يُسقط الرابط، ويُسجل `deep_link_failed {reason: force_update}`.
   - وإلا: `resolve`، ثم بناء المكدس. الرابط من نوع `push` يفتح الرئيسية بـ `router.go('/')` ثم الهدف بـ `router.push(...)`، فيعود زر الرجوع إلى الرئيسية بدل الخروج. ونوع `tab` يكفيه `router.go(tab)`.
5. **بوابة الدخول** (`requiresAuth`):
   - إن لم يكن المستخدم مسجلًا، تُفتح شاشة الدخول (M05) مع `redirect`.
   - بعد الدخول يُفتح الهدف. وعند الإلغاء يبقى على الرئيسية.
6. يُسجل `deep_link_opened {cold_start: true}`، وتُحدَّث `LinkContext` بالـ tracking.
7. عند الخطأ، مثل الاستثناء أو `not_found`: الرئيسية، و`deep_link_failed {reason}`.

### 3.4 الإقلاع الدافئ والروابط أثناء الاستخدام

1. حدث من `uriLinkStream`، أو من M06، أو من M03، يذهب إلى `resolve`.
2. **منع التكرار**:
   - الرابط نفسه خلال ثانيتين يُتجاهل، لأن أندرويد قد يبث مرتين.
   - إن كانت الشاشة الحالية هي الهدف بالمعاملات نفسها، لا تنقل ويُسجل الحدث.
3. **إن كانت صفحة الدفع مفتوحة** (علم من M04): لا يُقاطع الدفع. يُحفظ الرابط، ويظهر شريط «سنفتح الرابط بعد إتمام الدفع»، ثم يُنفذ عند إغلاق WebView الدفع.
4. التنقل حسب `presentation`، وبوابة الدخول كما في 3.3.
5. `deep_link_opened {cold_start: false}`.

### 3.5 الروابط من المصادر الداخلية

- **الإشعار (M06)**: الحقل `data.link` مسار نسبي، مثل `/_/o/41529903?ish_src=push&ish_mid=...`، يُحل على مضيف التاجر.
- **أفعال الكتل (M03)**: يحوّل `ActionDispatcher` الفعل إلى مسار، ثم يمرره إلى المنسّق بـ `source: in_app`. وبهذا يوجد موجّه واحد (ADR-0004، البند 5).
  - `open_product {id}`: `/products/{id}`.
  - `open_category {id}`: `/categories/{id}`.
  - `open_page {id}`: `/_/pages/{id}`.
  - `open_url_inapp {url}`: `webview`.
  - `search {q}`: `/search?q=`.
- **روابط داخل المحتوى**: روابط HTML في صفحات `cms_page` ونصوص `rich_text` تمر على المحلّل. فرابط المتجر يفتح شاشة أصلية، والخارجي يفتح المتصفح.

### 3.6 عند عدم تثبيت التطبيق (Should)

حين لا يكون التطبيق مثبتًا، أو لم يتحقق الربط، يفتح المتصفح الرابط فيصل الطلب إلى خادمنا:
1. `GET https://acme.{link-domain}/products/red-shoe?utm_source=instagram`.
2. `TenantHostResolver` يحدد التاجر. والمضيف المجهول يعيد 404 بصفحة بسيطة.
3. يُسجل الطلب: `link_fallback_served {tenant, route, ish_src, utm_campaign, ua_platform}`. لا يُحفظ عنوان IP ولا User-Agent كامل.
4. **التحويل** `302` مع `Cache-Control: no-store`:

| نوع المسار | الوجهة |
|---|---|
| مسارات زد (الأنماط 1 إلى 21) | `https://{store-domain}{path}?{query}` مع إبقاء UTM. فيرى المتسوق الصفحة نفسها على موقع المتجر، وتظهر معاينة الرابط في WhatsApp بصورة المنتج من وسوم الصفحة |
| `/_/o/{id}` | `https://{store-domain}/account/orders` |
| `/_/pages/{id}` و`/_/p/{token}` و`/_/pair/{token}` و`/_/dl` | `https://get.{link-domain}/{tenant_slug}?reason=...` |

5. إن لم يُنشر التطبيق بعد (لا روابط متاجر في الإعداد)، تتحول صفحة التنزيل إلى «التطبيق قادم قريبًا» مع زر المتجر.

### 3.7 نشر ملفات الربط وإعداد البناء (Should، مع M13 وM14)

1. **المحفّز**: M14 يعلن Team ID ومعرّف الحزمة واسم الحزمة، فيُنشأ `tenant_link_config` بالـ `slug` والمضيف والنظام المخصص.
2. يُنشر ملف AASA فورًا، وقبل أول توزيع على TestFlight بـ 24 ساعة على الأقل، لأن CDN لدى Apple يجلبه خلال 24 ساعة.

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["7K4XQ2M9ZD.sa.acme.store"],
        "components": [
          { "/": "/_/dl*", "exclude": true, "comment": "صفحة التنزيل تبقى في المتصفح" },
          { "/": "/" },
          { "/": "/*" }
        ]
      }
    ]
  }
}
```

الصيغة بـ `appIDs` و`components` من iOS 13 ([components](https://developer.apple.com/documentation/bundleresources/applinks/details-swift.dictionary/components-swift.dictionary)). ولا تُخلط بالصيغة القديمة `paths` ([TN3155](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links)).

3. **ملف `assetlinks.json`**:
   - يُنشر ببصمة مفتاح الرفع (upload key) أولًا.
   - بعد أول رفع إلى Play مع Play App Signing، ينسخ موظف التشغيل بصمة SHA-256 لمفتاح توقيع التطبيق من Play Console (Release، ثم Setup، ثم App signing) إلى M14. ويُعاد النشر بالبصمتين.
   - السبب: البصمة المحلية «لن تطابق عادةً» بصمة Play ([Configure assetlinks](https://developer.android.com/training/app-links/configure-assetlinks)).

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "sa.acme.store",
      "sha256_cert_fingerprints": [
        "AB:CD:...:PLAY_APP_SIGNING",
        "12:34:...:UPLOAD_KEY"
      ]
    }
  }
]
```

4. **يجب أن تُضاف بصمة Play قبل الإطلاق للعامة.** أندرويد 14 فأقدم يتحقق عند التثبيت والتحديث فقط. أما أندرويد 15 فأحدث فيعيد التحقق دوريًا، والتغيير قد يستغرق 7 أيام ([Verify App Links](https://developer.android.com/training/app-links/verify-android-applinks)).
5. **M13 في البناء**:
   - يحقن المضيف في الـ entitlement والـ manifest، والنظام المخصص في Info.plist والـ manifest.
   - يفعّل قدرة Associated Domains على App ID في فريق التاجر عبر App Store Connect API.
6. `AssociationHealthCheck` يعمل بعد كل نشر، ويوميًا (القسم 7).

### 3.8 روابط المشاركة

- **الإصدار الأول (Must، F-S07)**:
  - زر «مشاركة» يستخدم `share_plus` بنص: اسم المنتج، ثم سطر، ثم `html_url` من زد.
  - زر WhatsApp يفتح `https://wa.me/?text=` بالنص نفسه عبر `url_launcher`.
  - يُسجل `content_shared {type: product, id, channel}`.
- **بعد نطاق المنصة (Should، F-S15)**:
  - `ShareLinkBuilder.product(p)` يعيد `https://{slug}.{link-domain}/products/{slug}?ish_src=share`.
  - من لديه التطبيق يفتحه مباشرة، ومن ليس لديه يُحوَّل إلى الصفحة نفسها على موقع المتجر (3.6).
  - النتيجة للمتلقي غير المثبت مماثلة لرابط المتجر، والفائدة لمن ثبّت التطبيق.

### 3.9 روابط الحملات وUTM (Should)

1. يختار التاجر في اللوحة الهدف والمصدر، ثم `POST /dashboard/v1/links`. والنتيجة:

```
https://acme.intishar.link/categories/412823/perfumes?utm_source=instagram&utm_medium=social&utm_campaign=ramadan_2027&ish_src=campaign
```

2. ينسخ الرابط أو ينزّل QR.
3. عند الفتح في التطبيق تحفظ `LinkContext` آخر سياق حملة، ويبقى 24 ساعة أو حتى 30 دقيقة دون نشاط.
4. M04 يضيف `utm_source` و`utm_medium` و`utm_campaign` إلى رابط WebView الدفع. فتصل إلى `marketing_source` في طلب زد، وهي طريق ثانٍ لنسبة الطلب إلى التطبيق والحملة إن لم يكفِ `source` (SPK-03، `zid_feature_capability_map.md`).
5. M08 ينسب الطلبات إلى `utm_campaign`.
6. فتح الرابط في التطبيق لا يمر بخادمنا، فيُقاس من حدث `deep_link_opened`. والفتح دون التطبيق يُقاس من `link_fallback_served`.

### 3.10 معاينة المسودة بـ QR (Should، مع M11)

1. M11 يصدر رمزًا مبهمًا، طوله 32 بايت عشوائيًا، ومخزنًا عنده:
   - صلاحيته 30 دقيقة.
   - مقيد بمسودة واحدة، وقابل للإلغاء.
2. اللوحة تعرض QR للرابط `https://{slug}.{link-domain}/_/p/{token}`.
3. كاميرا الجهاز تفتح التطبيق إن كان مثبتًا. المسار `draft_preview` يطلب المسودة من M11 بالرمز، ثم يعرضها بشريط ثابت «معاينة مسودة: لا يراها المتسوقون» وزر خروج.
4. إن لم يكن التطبيق مثبتًا، وهي الحالة الغالبة قبل الإطلاق: صفحة التنزيل بشرح. وتطبيق معاينة عام عبر TestFlight أو المسار الداخلي في Play قرار في M11.
5. الرمز المنتهي: شاشة «انتهت صلاحية المعاينة، أنشئ رمزًا جديدًا من اللوحة».

### 3.11 نطاق المتجر مسارًا ثانويًا (Should، ينتظر SPK-10)

**الحقائق**:
- زد تخزن إعدادات OneSignal لكل متجر عبر `POST /v1/managers/store/settings/one-signal`، بصلاحية `third_one_signal_write`.
- المفاتيح هي: `ios_team_id`، و`ios_bundle_id`، و`android_package_name`، و`android_sha256_cert_fingerprints`، وغيرها.
- كل طلب «يمسح كاش المتجر ويعيد توليده» ([Zid: OneSignal settings](https://docs.zid.sa/create-or-update-onesignal-store-settings-39429264e0)).
- التوثيق لا يذكر AASA ولا assetlinks.
- متجر حي لمنافس يخدم AASA بالصيغة القديمة `"paths":["*","/"]` (`zid_feature_capability_map.md`، Q7).
- الإعداد خانة واحدة لكل متجر.

**المسار إن نجح SPK-10**:
1. يوافق التاجر في اللوحة صراحة، بنص يوضح أن ذلك يستبدل أي تطبيق آخر مربوط بنطاق متجره.
2. M10 يكتب المفاتيح الأربعة في طلب واحد، دون `app_id` ودون `app_key`، حتى لا ترسل زد إشعارات بنفسها.
3. `StoreDomainLinker` يتحقق من `https://{store-domain}/.well-known/apple-app-site-association` و`assetlinks.json`، ويتأكد أن `appID` لتطبيقنا موجود فيهما.
4. يُفعّل العلم `links.store_domain_enabled`، فيضيف بناء الأسطول التالي مضيف المتجر.

**الأثر**:
- كل مسارات المتجر تفتح التطبيق، بما فيها `/checkout` و`/auth/*` من الرسائل والبريد.
- لذلك جدول 3.2 يغطي كل مسار، والمجهول يُفتح في `webview`.
- والروابط داخل صفحات المتجر في Safari على النطاق نفسه لا تفتح التطبيق، وهذا سلوك Apple المعروف ([TN3155](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links)).

**إن فشل SPK-10**: يبقى نطاق المنصة وحده، ولا ينقص شيء من هذه المواصفة.

### 3.12 الربط المؤجل (Could)

**التوصية**: لا ربط مؤجلًا في الإصدار الأول. المتسوق غير المثبت يُحوَّل إلى موقع المتجر، وهو لا يفقد المنتج الذي جاء من أجله. ثم أندرويد فقط بطريقة حتمية بلا طرف ثالث. وiOS بلا ربط مؤجل.

| الخيار | الواقع في نوفمبر 2026 | الحكم |
|---|---|---|
| Firebase Dynamic Links | أُوقف في 25 أغسطس 2025، والروابط تعيد 404 ([FDL FAQ](https://firebase.google.com/support/dynamic-links-faq)) | غير متاح |
| Branch | Intro بـ 39 دولارًا شهريًا، وتطبيق واحد لكل حساب في Intro والخطط الأساسية ([Branch plans](https://help.branch.io/docs/branch-intro-plan)). وNativeLink لـ iOS يعتمد على الحافظة ويحتاج خطة premium ([NativeLink](https://help.branch.io/docs/nativelink-deferred-deep-linking)). وحزمة Flutter مجتمعية | حساب لكل تاجر. تكلفة وتشغيل لا يناسبان المنصة |
| AppsFlyer OneLink | خطة Zero المجانية فقدت الربط العميق المتقدم في 2026 ([AppsFlyer Zero update](https://www.appsflyer.com/zero-update-2026/))، والدفع 0.07 دولار لكل تحويل ([pricing](https://appsflyer.com/pricing?view=full)) | Could، إن ربطه التاجر بحسابه |
| Adjust | «كل روابط Adjust تؤجل تلقائيًا» ([Adjust deep links](https://help.adjust.com/en/article/deep-links)). والتسعير غير موثق لدينا (صفحة التسعير لم تُقرأ) | Could، إن ربطه التاجر بحسابه |
| ذاتي على أندرويد: Play Install Referrer | المكتبة `installreferrer:2.2`. الإحالة متاحة 90 يومًا، وتُقرأ مرة واحدة ([Install Referrer](https://developer.android.com/google/play/installreferrer/library)). والقيمة تُمرر في `&referrer=` مرمّزة، بحد 512 حرفًا ([referrer](https://developer.android.com/games/playgames/user-acquisition)) | Could: LINK-09 |
| ذاتي على iOS | لا مقابل للإحالة. وقراءة الحافظة تُظهر تنبيه لصق منذ iOS 16، و`UIPasteControl` عنصر أصلي ([UIPasteControl](https://developer.apple.com/documentation/uikit/uipastecontrol)). والبصمة (fingerprinting) ممنوعة ([Apple privacy](https://developer.apple.com/app-store/user-privacy-and-data-use/)، [required reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)) | لا يُبنى. يُعاد النظر إن أظهرت البيانات حاجة |

**تصميم أندرويد** (LINK-09):
1. زر Google Play في صفحة التنزيل:

```
https://play.google.com/store/apps/details?id=sa.acme.store&referrer=ish_link%3D%252Fproducts%252Fred-shoe%26utm_source%3Dinstagram
```

2. عند أول إقلاع على أندرويد: `install_referrer.dart` يقرأ الإحالة مرة واحدة، ويحفظ علم `links.install_referrer_checked`.
3. إن كان `referrerClickTimestampSeconds` خلال 24 ساعة ويحتوي `ish_link`: `handle(uri, source: deferred)`. والـ UTM تذهب إلى M08 لنسبة التثبيت.

## 4. نموذج البيانات

### 4.1 على الخادم

**`tenant_link_config`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `tenant_id` | uuid PK | — |
| `slug` | text unique | ثابت |
| `link_host` | text unique | `{slug}.{link-domain}` |
| `custom_scheme` | text unique | `intishar-{slug}` |
| `ios_team_id`، `ios_bundle_id` | text | من M14 |
| `android_package` | text | — |
| `android_sha256` | text[] | بصمة Play App Signing وبصمة الرفع |
| `app_store_id` | text, nullable | بعد النشر |
| `play_published` | bool | — |
| `store_domains` | text[] | النطاق المخصص و`{sub}.zid.store` من M10 |
| `store_domain_links` | enum: `off`، `requested`، `active`، `conflict`، `failed` | Should |
| `aasa_published_at`، `assetlinks_published_at` | timestamptz | — |
| `health` | jsonb | آخر نتيجة لكل فحص |
| `health_checked_at` | timestamptz | — |

**`link_slug_history`**: `slug`، و`tenant_id`، و`retired_at`. الـ slug القديم يبقى محجوزًا ويحوّل إلى الجديد. لا يُعاد استخدامه أبدًا.

**`campaign_links`** (Should): `id`، و`tenant_id`، و`name`، و`target_type`، و`target_ref`، و`path`، و`utm` jsonb، و`url`، و`created_by`، و`created_at`.

**`link_fallback_daily`**: `tenant_id`، و`day`، و`route`، و`ish_src`، و`utm_campaign`، و`ua_platform` (`ios`، `android`، `desktop`، `bot`، `other`)، و`hits`. تجميع يومي بلا بيانات شخصية.

### 4.2 على الجهاز

| المفتاح | التخزين | المحتوى |
|---|---|---|
| الرابط المعلّق | ذاكرة فقط | آخر رابط قبل الجاهزية، 60 ثانية |
| `links.context` | shared_preferences | `{utm_*, ish_src, ish_cid, captured_at, last_activity_at}` |
| `links.recent` | ذاكرة | آخر رابط ووقته لمنع التكرار |
| `links.install_referrer_checked` | shared_preferences | Could |
| `links.brands_cache` | كاش M01 | من slug العلامة إلى UUID، 24 ساعة |

## 5. الواجهات والعقود

### 5.1 مضيف الروابط (`{slug}.{link-domain}`)

| الطريقة والمسار | الاستجابة |
|---|---|
| `GET /.well-known/apple-app-site-association` | `200 application/json` (المثال في 3.7). بلا تحويل، وكاش CDN ساعة |
| `GET /.well-known/assetlinks.json` | `200 application/json` (المثال في 3.7) |
| `GET /{أي مسار}` | `302` إلى الوجهة في 3.6، مع `Cache-Control: no-store` |
| مضيف مجهول | `404` |

### 5.2 لوحة التاجر

**`GET /dashboard/v1/links/targets?type=product&q=عطر`** (منتقي الرابط):

```json
{
  "results": [
    { "type": "product", "id": "6f06bc89-0cd4-490f-9894-238a93962416", "title": "عطر العود الملكي", "path": "/products/royal-oud", "image": "https://media.zid.store/...jpg" }
  ]
}
```

**`POST /dashboard/v1/links`** (Should):

```json
{
  "target": { "type": "category", "id": "412823" },
  "utm": { "source": "instagram", "medium": "social", "campaign": "ramadan_2027" },
  "name": "بايو إنستغرام رمضان"
}
```

الاستجابة:

```json
{
  "id": "lnk_01J...",
  "url": "https://acme.intishar.link/categories/412823/perfumes?utm_source=instagram&utm_medium=social&utm_campaign=ramadan_2027&ish_src=campaign",
  "path": "/categories/412823/perfumes",
  "fallback_url": "https://acme-store.com/categories/412823/perfumes?utm_source=instagram&utm_medium=social&utm_campaign=ramadan_2027"
}
```

**`GET /dashboard/v1/links/status`**:

```json
{
  "link_host": "acme.intishar.link",
  "ios": { "aasa": "ok", "apple_cdn": "ok", "checked_at": "2026-11-10T03:00:00Z" },
  "android": { "assetlinks": "ok", "play_signing_fingerprint": "missing", "dal_api": "ok" },
  "store_domain": { "status": "off" }
}
```

### 5.3 لوحة الإدارة

- `GET /admin/v1/links/tenants/{id}/health`: تفصيل الفحوص وآخر الأخطاء.
- `POST /admin/v1/links/tenants/{id}/republish`: إعادة نشر الملفين ومسح كاش الـ CDN.
- `PUT /admin/v1/links/tenants/{id}/android-fingerprints`: `{ "play_app_signing": "AB:CD:..." }`.

### 5.4 عقد جدول التوجيه المشترك

الجدول في 3.2 يُكتب مرة واحدة في `06-api/links/route-table.json`، وهو المصدر الوحيد على نهج ADR-0010. ومنه يُولَّد:
- جدول Dart في التطبيق.
- `LinkValidator` في Laravel.
- حالات اختبار مشتركة: لكل نمط رابط صالح وآخر غير صالح.

```json
{
  "version": 1,
  "routes": [
    { "id": "product", "pattern": "/products/:key", "params": { "key": "^[A-Za-z0-9-_%]{1,200}$" }, "screen": "product", "presentation": "push", "auth": false },
    { "id": "category", "pattern": "/categories/:id(/:slug)?", "params": { "id": "^[0-9]{1,12}$" }, "screen": "product_list", "presentation": "push", "auth": false },
    { "id": "order", "pattern": "/_/o/:order_id", "params": { "order_id": "^[0-9]{1,20}$" }, "screen": "order_detail", "presentation": "push", "auth": "customer_or_linked_device" }
  ]
}
```

### 5.5 واجهات Flutter (عقود مع الوحدات)

| الواجهة | المستهلك | العقد |
|---|---|---|
| `DeepLinkCoordinator.handle(Uri uri, {required LinkSource source})` | M06، وM03، وM04 | `LinkSource` = `universal_link`، أو `app_link`، أو `custom_scheme`، أو `push`، أو `in_app`، أو `deferred` |
| `LinkResolver.resolve(Uri) → ResolvedLink` | M03 (معاينة الرابط في المحرر عبر Flutter Web) | دالة خالصة |
| `LinkContext.current → CampaignContext?` | M04 (إضافة UTM إلى الدفع)، وM08 | — |
| `ShareLinkBuilder.product(Product)` | M04 | يعيد `html_url` حتى F-S15، ثم رابط المنصة |
| نقطة الدخول في M01 | M07 | M01 يوفر `Future<void> appReady` (أو حالة `BootState.ready` في Riverpod)، ويضمن أن الموجّه جاهز وأن فحص التحديث الإجباري اكتمل. والاسم النهائي من مواصفة M01 |
| علم الدفع النشط | M04 | `checkoutInProgressProvider` (bool) |
| `LinkValidator::validate(string $path, bool $checkTarget = false)` | M06، وM11 (Laravel) | يعيد `{valid, route, reason}` |

### 5.6 أحداث التحليلات (في تصنيف M08)

| الحدث | الخصائص |
|---|---|
| `deep_link_opened` | `source`، و`route`، و`cold_start`، و`ish_src`، و`ish_cid`، و`utm_source`، و`utm_medium`، و`utm_campaign`، و`host_kind` (`link_domain`، `store_domain`، `scheme`، `relative`) |
| `deep_link_failed` | `source`، و`reason` (`not_found`، `invalid_param`، `force_update`، `auth_cancelled`، `exception`)، و`path_pattern`. والمسار الكامل لا يُرسل |
| `content_shared` | `type`، و`id`، و`channel` (`sheet`، `whatsapp`) |
| (خادم) `link_fallback_served` | يُجمّع في `link_fallback_daily` (4.1) |

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| رابط لمنتج حُذف أو أُخفي | شاشة «المنتج غير متوفر» مع البحث والرئيسية، و`deep_link_failed {reason: not_found}` |
| رابط تصنيف برقم غير موجود | قائمة فارغة برسالة «التصنيف غير موجود» وزر التصنيفات |
| `/brands/{slug}` والعلم مطفأ أو الحل فشل | `webview` للصفحة نفسها |
| رابط يحتاج دخولًا والمستخدم زائر | الدخول ثم الهدف. وعند الإلغاء: الرئيسية |
| `/_/o/{id}` لطلب لا يخص العميل الحالي | M05 يرفض (403 من الـ BFF)، فتُعرض قائمة الطلبات مع رسالة |
| رابط يصل أثناء الدفع | يُحفظ وينفذ بعد إغلاق الدفع (3.4) |
| رابط يصل أثناء تحديث إجباري | يُسقط بعد التحديث، ويُسجل |
| رابطان في الإقلاع البارد (إشعار ورابط) | يُنفذ الأحدث فقط |
| الرابط نفسه مرتين خلال ثانيتين | مرة واحدة |
| رابط بمضيف تاجر آخر على المنصة | لا يصل أصلًا، لأن كل تطبيق يعلن مضيفه فقط. وإن وصل نصًا داخل المحتوى يُعامل كخارجي |
| رابط `http` بدل `https` | يُطبع إلى `https` قبل المطابقة |
| معاملات زائدة أو مجهولة | تُحفظ في `params` وتُتجاهل إن لم يعرفها المسار |
| رابط طوله أكثر من 2,048 | يُرفض: الرئيسية و`invalid_param` |
| المستخدم كتب الرابط في Safari | لا يفتح التطبيق، وهذا سلوك Apple ([TN3155](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links)). والخادم يحوّله إلى موقع المتجر |
| الرابط من داخل Instagram أو Telegram | Universal Links لا تعمل هناك غالبًا (قائمة Branch، لا Apple: [Branch](https://help.branch.io/using-branch/docs/universal-links)). فيُحوَّل المتسوق إلى موقع المتجر، وصفحة المتجر تكفي |
| المستخدم اختار «فتح في Safari» بالضغط المطول | Apple تحفظ اختياره لهذا النطاق. ويعود بضغط مطول واختيار التطبيق |
| AASA لم يصل إلى CDN لدى Apple بعد | الرابط يفتح المتصفح حتى يُحدَّث. والفحص اليومي يكشف الحالة، والحل الوحيد هو الانتظار، لأنه لا إبطال يدوي |
| بصمة Play غير مضافة عند الإطلاق | التحقق يفشل على أندرويد 14 فأقدم حتى التحديث التالي للتطبيق. والفحص يمنع وسم «جاهز للإطلاق» في M14 دونها |
| التاجر غيّر نطاق متجره في زد | M10 يحدّث `store_domains`، فتتحول التحويلات إلى النطاق الجديد. ونطاق المنصة لا يتأثر |
| نطاق المتجر مربوط بتطبيق آخر (SPK-10) | `store_domain_links = conflict`، ولا كتابة دون موافقة صريحة من التاجر |
| رمز معاينة منتهٍ أو ملغى | شاشة «انتهت صلاحية المعاينة» |
| رمز إقران مستخدم أو منتهٍ | رسالة «الرمز غير صالح» من M06 |
| زاحف معاينة الروابط (WhatsApp أو X) | يتبع 302 إلى صفحة المتجر فيقرأ وسومها، ويُسجل بنوع `bot` |
| إحالة Play أقدم من 24 ساعة أو بلا `ish_link` | تُتجاهل للتوجيه، وتُرسل UTM إلى M08 فقط |
| تطبيق قديم لا يعرف مسارًا جديدًا في الجدول | يقع في النمط 21 (`webview`) إن كان على مضيف التاجر، أو الرئيسية لمسارات `/_/` المجهولة. ولا يتعطل |

## 7. المتطلبات غير الوظيفية

| المجال | المتطلب | القياس |
|---|---|---|
| زمن الفتح | من استلام الرابط في الإقلاع الدافئ إلى بدء انتقال الشاشة ≤ 300 ms، دون تحميل البيانات | قياس في الاختبارات التكاملية |
| الإقلاع البارد | من الضغط إلى شاشة الهدف ≤ 2.5 ثانية على أندرويد متوسط، مع تخطيط مخزن. ولا يؤخر الرابط الإطار الأول | قياس الإقلاع في M01 |
| التغطية | كل نمط في الجدول له اختبار وحدة لرابط صالح وغير صالح، من الملف المشترك. وتغطية `LinkResolver` ≥ 95% | CI |
| المتانة | لا انهيار من أي رابط: اختبار fuzz بـ 10,000 رابط عشوائي على المحلّل | CI |
| ملفات الربط | التوفر ≥ 99.9% شهريًا، وp95 ≤ 200 ms من الـ CDN، وبلا تحويل أبدًا | مراقب خارجي كل 5 دقائق |
| التحويل | p95 ≤ 300 ms للرد 302 | المراقبة في M12 |
| الصحة | فحص يومي لكل تاجر: ملفنا، ونسخة CDN لدى Apple، وواجهة Digital Asset Links. والتنبيه عند عدم التطابق أكثر من 48 ساعة | `AssociationHealthCheck` |
| الأمان | الروابط لا تحمل بيانات شخصية. ولا فعل له أثر من رابط خارجي. ورموز المعاينة والإقران مبهمة ومؤقتة (30 و10 دقائق) وقابلة للإلغاء. ونطاق الروابط مستقل عن نطاق اللوحة، فلا cookies مشتركة | مراجعة الكود |
| الخصوصية | لا IP ولا User-Agent كامل في سجلات التحويل، والتجميع يومي. ولا بصمة للأجهزة | مراجعة السجلات |
| العربية وRTL | صفحة التنزيل عربية أولًا بالاتجاه RTL. ونص المشاركة يبدأ باسم المنتج بلغة التطبيق. والمسارات بالحروف العربية المرمّزة تُفك وتُطابق | اختبار روابط بأسماء عربية |
| إمكانية الوصول | صفحة التنزيل تحقق WCAG 2.2 AA، وأزرار المتاجر بنص بديل | فحص آلي |

## 8. الاعتماديات والمجهول

### التجارب والقرارات المرتبطة

| البند | الأثر | ما يُبنى الآن |
|---|---|---|
| SPK-10 | نطاق المتجر مسار ثانوي فقط. لا شيء في الإصدار الأول ينتظره | كل شيء عدا LINK-08 |
| SPK-07 | رابط الطلب المفرد في حساب الويب غير معروف، فالنمط 14 يفتح القائمة. وتفاصيل الطلب الأصلية في M05 | — |
| SPK-03 | إن لم يكفِ `source`، فإضافة UTM إلى الدفع (3.9) هي طريق النسبة الثاني | `LinkContext` الآن |
| مسارات زد «يُتحقق منها» | البحث، والعناوين، والمفضلة | تُثبت على المتجر التطويري في LINK-01 |
| مواصفة M01 | اسم نقطة الدخول وأسماء المسارات | عقد مؤقت في 5.5 |

### التعارضات مع ADRs وPRD وspikes
1. **`spikes.md` (SPK-10، «إن فشل»)** يقترح `link.{platform}/s/{store}/...` بالمسار. هذه المواصفة توصي بنطاق فرعي لكل متجر، للأسباب في 2.1: حد حجم AASA، والعزل، وتداخل المسارات في أندرويد 14 فأقدم. ونطاق المنصة هنا هو المسار **الأساسي** لا البديل. يُحدَّث نص SPK-10 بعد الاعتماد.
2. **PRD F-S15 يعتمد على SPK-10، وADR-0008 يقول إن الروابط العامة «قد تحتاج» إعدادات OneSignal في زد.** بهذا التصميم لا يعتمد F-S15 على SPK-10 إلا للمسار الثانوي. يُحدَّث عمود «يعتمد على» في PRD وبند العواقب في ADR-0008.
3. **ADR-0005** لا يذكر وحدة `Links` في قائمة الوحدات. إضافة صغيرة.
4. **ADR-0004 البند 5** يضع `apply_coupon` و`add_to_cart` في قائمة الأفعال التي يخدمها الموجّه نفسه. هذه المواصفة تمنعهما من الروابط الخارجية والإشعارات، وتبقيهما للكتل فقط، حتى لا يغيّر رابط حالة دون فعل من المستخدم. توضيح لا تعارض.

### قرارات مفتوحة للمشرف

| # | السؤال | التوصية |
|---|---|---|
| 1 | نقل نطاق المنصة وUniversal Links وApp Links (LINK-04 وLINK-05) من Should إلى Must؟ | **نعم**. التكلفة نحو سباق ونصف. والفائدة: روابط Instagram وWhatsApp تفتح التطبيق لمن ثبّته من اليوم الأول، ولا اعتماد على SPK-10، ولا إعادة بناء للأسطول لاحقًا لإضافة القدرة |
| 2 | اسم نطاق الروابط | نطاق قصير محايد لا يحمل اسم «انتشار» الظاهر للمتسوق، لأن الرابط يظهر في رسائل متاجر التجار. يُشترى قبل LINK-04 |
| 3 | سياسة نطاق المتجر إن كان مربوطًا بتطبيق آخر | لا كتابة دون موافقة صريحة من التاجر، مع نص يوضح الأثر |
| 4 | تطبيق معاينة عام للمسودات قبل نشر تطبيق التاجر | قرار M11. والرابط والمسار هنا يعملان في الحالتين |
| 5 | الربط المؤجل | لا في الإصدار الأول. وأندرويد عبر Install Referrer (LINK-09) بعد CP-10 إن أظهرت بيانات `link_fallback_served` حجمًا يستحق |

### ما يُبنى الآن خلف واجهة مؤقتة
- المحلّل والجدول والاختبارات: لا تعتمد على أي شيء. والشاشات الهدف تُستبدل بشاشات مؤقتة بأسمائها.
- خدمة النطاق وملفات الربط: على نطاق اختبار، مع تطبيق اختبار المنصة على حساب Apple التجريبي (P-4)، وتطبيق داخلي في Play.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| LINK-01 | ملف جدول التوجيه المشترك، و`LinkResolver` في Dart، و`LinkValidator` في Laravel، والتوليد، والاختبارات، والتحقق من مسارات زد على المتجر التطويري | Must | نعم | P-2 (المتجر التطويري) للتحقق فقط |
| LINK-02 | `DeepLinkCoordinator`: الإقلاع البارد والدافئ، ونقطة الدخول، وبوابة الدخول، ومنع التكرار، وتأجيل الرابط أثناء الدفع، والنظام المخصص، وإيقاف معالج Flutter | Must | ينتظر M01 | LINK-01 |
| LINK-03 | `LinkContext` وأحداث التحليلات، ومنتقي الرابط (`/dashboard/v1/links/targets`)، وتسليم UTM إلى M04 | Must | ينتظر M08 | LINK-01، وM10 (البحث) |
| LINK-04 | خدمة نطاق المنصة: DNS وشهادة wildcard، و`TenantHostResolver`، وملفا الربط، والتحويل، والفحص اليومي، وواجهات الحالة | Should (يوصى بـ Must) | نعم | M12، وقرار اسم النطاق |
| LINK-05 | قالب البناء: حقن المضيف والنظام المخصص في entitlements والـ manifest، وتفعيل Associated Domains على App ID، وخطوة بصمة Play في M14، والتحقق على أجهزة حقيقية | Should (يوصى بـ Must) | ينتظر M13 | LINK-04 |
| LINK-06 | روابط المشاركة من نطاق المنصة، ومنشئ روابط الحملات وQR في اللوحة، و`campaign_links`، وصفحة التنزيل | Should | ينتظر M15 | LINK-04 |
| LINK-07 | مسار معاينة المسودة `/_/p/{token}` وشاشته وحالاته | Should | ينتظر M11 | LINK-02 |
| LINK-08 | نطاق المتجر مسارًا ثانويًا: الموافقة، والكتابة عبر M10، والتحقق، والعلم | Should | ينتظر SPK-10 | LINK-05، وM10 |
| LINK-09 | الربط المؤجل على أندرويد عبر Play Install Referrer | Could | نعم (بعد LINK-04) | LINK-04، وLINK-06 |
| LINK-10 | ربط منصة قياس يملكها التاجر (AppsFlyer أو Adjust) | Could | لا: ينتظر قرار منتج | M08 |

كل قصة مقدرة بسباق واحد أو أقل. وLINK-04 أكبرها، فإن تجاوز السباق يُفصل منه الفحص اليومي وواجهات الحالة.

### معايير القبول لأهم القصص

**LINK-01: المحلّل والجدول**
1. **بافتراض** الرابط `https://acme-store.com/categories/412823/perfumes?utm_source=instagram`، **عندما** يُحلل، **إذن** الناتج `product_list` مع `category_id = 412823` وعرض `push`، و`tracking.utm_source = instagram`، ولا تظهر `utm_source` في معاملات الشاشة.
2. **بافتراض** المسار النسبي `/_/o/41529903?ish_src=push`، **عندما** يُحلل، **إذن** الناتج `order_detail` مع `order_id = 41529903` و`requiresAuth = customer_or_linked_device`.
3. **بافتراض** `/checkout/guest`، **عندما** يُحلل، **إذن** الناتج `cart` بعرض `tab`، ولا يُفتح الدفع.
4. **بافتراض** مسار مجهول على نطاق المتجر مثل `/faqs`، **عندما** يُحلل، **إذن** الناتج `webview` بالعنوان الكامل على نطاق المتجر.
5. **بافتراض** `/categories/abc`، **عندما** يُحلل، **إذن** الناتج `not_found` بسبب `invalid_param`.
6. **بافتراض** ملف الجدول المشترك، **عندما** تعمل الاختبارات في Dart وPHP، **إذن** تنجح الحالات نفسها في الاثنين، ويفشل البناء إن اختلفا.

**LINK-02: المنسّق**
1. **بافتراض** التطبيق مغلقًا، **عندما** يضغط المستخدم رابط منتج، **إذن** يظهر السبلاش ثم صفحة المنتج، وزر الرجوع يعود إلى الرئيسية لا إلى خارج التطبيق.
2. **بافتراض** التطبيق مفتوحًا على صفحة الدفع، **عندما** يصل رابط تصنيف، **إذن** يظهر شريط «سنفتح الرابط بعد إتمام الدفع»، ولا تُغلق صفحة الدفع، ويُفتح التصنيف بعد إغلاقها.
3. **بافتراض** زائر، **عندما** يفتح إشعارًا برابط `/_/o/{id}` لطلب مربوط بجهازه، **إذن** تُفتح تفاصيل الطلب دون طلب دخول، إن سمح بها M05.
4. **بافتراض** مستخدم غير مسجل، **عندما** يفتح `/account/orders`، **إذن** تظهر شاشة الدخول، وبعد النجاح تظهر قائمة الطلبات، وعند الإلغاء يبقى على الرئيسية.
5. **بافتراض** أن أندرويد بث الرابط نفسه مرتين خلال ثانية، **عندما** يصلان، **إذن** يحدث تنقل واحد وحدث واحد.
6. **بافتراض** جهاز اختبار، **عندما** يُنفذ `xcrun simctl openurl booted intishar-acme://products/royal-oud` أو `adb shell am start -d "intishar-acme://products/royal-oud"`، **إذن** تُفتح صفحة المنتج.

**LINK-04: خدمة النطاق**
1. **بافتراض** تاجر بـ `slug = acme` وTeam ID وbundle ID معروفين، **عندما** يُطلب `https://acme.{link-domain}/.well-known/apple-app-site-association`، **إذن** يعود 200 بنوع `application/json` دون أي تحويل، وفيه `appIDs` لهذا التاجر فقط.
2. **بافتراض** المضيف `unknown.{link-domain}`، **عندما** يُطلب أي مسار، **إذن** يعود 404.
3. **بافتراض** متصفح على جهاز بلا التطبيق، **عندما** يفتح `https://acme.{link-domain}/products/royal-oud?utm_source=instagram`، **إذن** يُحوَّل بـ 302 إلى `https://{store-domain}/products/royal-oud?utm_source=instagram`، ويزيد عداد `link_fallback_daily`.
4. **بافتراض** أن بصمة Play App Signing لم تُضف، **عندما** يعمل الفحص اليومي، **إذن** تظهر حالة `play_signing_fingerprint: missing` في اللوحة، ويُمنع وسم «جاهز للإطلاق» في M14.
5. **بافتراض** إضافة البصمة، **عندما** يُعاد النشر، **إذن** يُمسح كاش CDN، وتُعيد واجهة Digital Asset Links البيان الجديد خلال ساعة.

**LINK-05: البناء والتحقق على الأجهزة**
1. **بافتراض** بناء TestFlight لتاجر نُشر ملفه قبل 24 ساعة، **عندما** يُضغط رابط منتج من تطبيق Notes على iPhone مثبت عليه البناء، **إذن** يُفتح التطبيق على صفحة المنتج.
2. **بافتراض** بناء من Play internal testing على أندرويد 14، **عندما** يُنفذ `adb shell pm get-app-links sa.acme.store`، **إذن** حالة `acme.{link-domain}` هي `verified`.
3. **بافتراض** بناءين لتاجرين مختلفين على الجهاز نفسه، **عندما** يُضغط رابط كل تاجر، **إذن** يفتح كل رابط تطبيق تاجره فقط.

**LINK-08: نطاق المتجر**
1. **بافتراض** نجاح SPK-10 وموافقة التاجر، **عندما** تُكتب الإعدادات، **إذن** تُرسل المفاتيح الأربعة في طلب واحد دون `app_id` ولا `app_key`، ويحتوي ملف المتجر `appID` لتطبيقنا خلال المدة التي يحددها SPK-10.
2. **بافتراض** أن ملف المتجر يحتوي `appID` تطبيق آخر، **عندما** يفتح التاجر الإعداد، **إذن** تظهر حالة `conflict`، ولا يُكتب شيء دون موافقته الصريحة.

## 10. المصادر

**داخلية**
- [خريطة الوحدات](README.md)، و[PRD](../01-prd.md)، و[ADR-0004](../adr/0004-hybrid-sdui-typed-blocks.md)، و[ADR-0008](../adr/0008-platform-managed-push.md)، و[ADR-0002](../adr/0002-flutter-single-codebase.md)، و[ADR-0003](../adr/0003-native-storefront-webview-checkout.md)، و[spikes.md](../spikes.md)، و[M06](M06-notifications.md)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md` (مسارات زد، وAASA لدى منافس، وإعدادات OneSignal، وUTM في `marketing_source`)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/flutter_configurable_architecture.md` (معاينة QR برمز موقّع)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/local_builders_teardown.md` (Deep Links وOneLink لدى عناقيد)

**Apple**
- [Supporting associated domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [TN3155: Debugging universal links](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links)
- [applinks components](https://developer.apple.com/documentation/bundleresources/applinks/details-swift.dictionary/components-swift.dictionary)
- [Associated Domains entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.associated-domains)
- [Allowing apps and websites to link to your content](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content)
- [App Search revision history (حد 128KB)](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/RevisionHistory.html)
- [UIPasteControl](https://developer.apple.com/documentation/uikit/uipastecontrol)، و[User privacy and data use](https://developer.apple.com/app-store/user-privacy-and-data-use/)، و[Required reason API](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)

**Android**
- [Add App Links](https://developer.android.com/training/app-links/add-applinks)، و[Configure assetlinks](https://developer.android.com/training/app-links/configure-assetlinks)، و[Verify App Links](https://developer.android.com/training/app-links/verify-android-applinks)
- [Dynamic App Links (أكتوبر 2025، أندرويد 15 فأحدث)](https://android-developers.googleblog.com/2025/10/dynamic-app-links-elevating-your.html)
- [Intents and intent filters](https://developer.android.com/guide/components/intents-filters)
- [Play Install Referrer library](https://developer.android.com/google/play/installreferrer/library)، و[ReferrerDetails](https://developer.android.com/reference/com/android/installreferrer/api/ReferrerDetails)، و[referrer في رابط Play](https://developer.android.com/games/playgames/user-acquisition)
- [Digital Asset Links: create statement](https://developers.google.com/digital-asset-links/v1/create-statement)

**Flutter والحزم**
- [Flutter: Deep linking](https://docs.flutter.dev/ui/navigation/deep-linking)، و[go_router: Deep linking](https://pub.dev/documentation/go_router/latest/topics/Deep%20linking-topic.html)
- [app_links](https://pub.dev/packages/app_links)، و[changelog](https://pub.dev/packages/app_links/changelog)، و[README Android](https://github.com/llfbandit/app_links/blob/master/doc/README_android.md)، و[README iOS](https://github.com/llfbandit/app_links/blob/master/doc/README_ios.md)
- [go_router](https://pub.dev/packages/go_router)، و[share_plus](https://pub.dev/packages/share_plus)، و[url_launcher](https://pub.dev/packages/url_launcher)، و[play_install_referrer](https://pub.dev/packages/play_install_referrer)، و[android_play_install_referrer (متوقف)](https://pub.dev/packages/android_play_install_referrer)

**الربط المؤجل والقياس**
- [Firebase Dynamic Links FAQ (الإيقاف في 25 أغسطس 2025)](https://firebase.google.com/support/dynamic-links-faq)
- [Branch: plans](https://help.branch.io/docs/branch-intro-plan)، و[Intro FAQ](https://help.branch.io/docs/intro-plan-faqs)، و[NativeLink](https://help.branch.io/docs/nativelink-deferred-deep-linking)، و[Universal Links في التطبيقات](https://help.branch.io/using-branch/docs/universal-links)
- [AppsFlyer pricing](https://appsflyer.com/pricing?view=full)، و[Zero update 2026](https://www.appsflyer.com/zero-update-2026/)
- [Adjust: Deep links](https://help.adjust.com/en/article/deep-links)

**زد**
- [Zid: Create or Update OneSignal Store Settings](https://docs.zid.sa/create-or-update-onesignal-store-settings-39429264e0)، و[OneSignal Store Settings](https://docs.zid.sa/onesignal-store-settings-39420053e0)
