# M05: الحساب والطلبات: الدخول والجلسة، والملف، والعناوين، وحذف الحساب، والسياسات، والطلبات والتتبع

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter، وLaravel (جلسة المتسوق وتفاصيل الطلب في الـ BFF)، وخدمة خارجية: زد (Storefront API، وصفحة الدخول `sso.zid.store`، وMerchant API عبر M10) |
| المتطلبات | F-S10, F-S11, F-S12 (وF-S11b وF-S17 وF-S21 وF-S22 في «لاحقًا») |
| القرارات | ADR-0003, ADR-0005, ADR-0008 |
| تعتمد على | M01 (عميل HTTP ومخزن الـ cookies والتخزين الآمن والموجّه)، وM02 (الأرقام والتاريخ وRTL)، وM04 (حزمة `zid_storefront`، وتحديث السلة ودمج المفضلة بعد الدخول)، وM10 (عميل Merchant API وحدوده وwebhooks الطلبات)، وM11 (رقم WhatsApp وإعدادات المتجر)، وM12 (رمز الجهاز، ومفاتيح التوقيع، وتنقية السجلات)، وM06 (ربط رمز الإشعارات بالعميل)، وM07 (الروابط إلى الطلبات)، وM08 (الأحداث) |
| بادئة القصص | ACC |

## 1. الغرض والنطاق

تملك هذه الوحدة هوية المتسوق وما بعد الشراء: الدخول عبر صفحة زد وتبادل الجلسة بين الـ WebView والعميل الأصلي، والملف الشخصي، والعناوين بالعنوان الوطني، وحذف الحساب، والسياسات معروضة أصليًا، وقائمة الطلبات، وتفاصيل الطلب بخط زمني للتتبع عبر الـ BFF، والتواصل عبر WhatsApp برقم الطلب. وما بعد الطلب هو الموضع الذي يتفوق فيه المنتج على المنافسين، لأن تتبع الطلب أقوى سبب لإبقاء تطبيق المتجر على الهاتف (65%) ([PPC Land / Adobe](https://ppc.land/adobe-finds-72-of-shoppers-delete-retail-apps-after-one-use/)).

| الشاشة أو القدرة | المتطلب | الأولوية | النمط | ملاحظة |
|---|---|---|---|---|
| تبويب الحساب (المحور) | F-S12 | Must | — | يجمع روابط الوحدة وروابط M04 وM06 وM02 |
| الدخول | F-S11 | Must | W | `/auth/login` يحوّل إلى `sso.zid.store`، وينتظر SPK-05 |
| الجلسة والخروج | F-S11 | Must | N + B | `auth/login-status`، و`auth/logout`، وتبادل الجلسة مع الـ BFF |
| الملف الشخصي | F-S12 | Must | N | `GET/PATCH account` |
| العناوين | F-S12 | Must | N | `account/addresses`، و`locations?lat&lng`، و`countries/{id}/cities` |
| حذف الحساب | F-S12 | Must | N + B | `DELETE account`، وحذف بيانات المنصة |
| السياسات | F-S12 | Must | N | `pages/{slug}` |
| قائمة الطلبات | F-S10 | Must | N، وبديل B | `account/orders`، وينتظر SPK-07 |
| تفاصيل الطلب والتتبع | F-S10 | Must | B | Merchant API `orders/{id}/view` عبر M10، وينتظر SPK-07 |
| WhatsApp برقم الطلب | F-S10 | Must | B (الرقم من M11) | `wa.me` |
| دخول OTP أصلي وفتح الجلسة بالبصمة | F-S11b | Should | N | SPK-06 |
| «اشترِ مجددًا» | F-S17 | Should | N | SPK-07 |
| طلب استرجاع أو استبدال | F-S22 | Could | B | WhatsApp أولًا، ثم Reverse Orders |
| ملخص النقاط والمحفظة والإحالة | F-S21 | Could | N للنقاط، وN\* للمحفظة والإحالة | SPK-12 |

**ليس من مسؤولية الوحدة**: مركز تفضيلات الإشعارات (M06)، وتبديل اللغة (M02)، والمفضلة والسلة والدفع (M04)، وصيغة الروابط العميقة (M07)، وإرسال إشعارات حالة الطلب (M06 من webhooks يستقبلها M10).

## 2. المكونات حسب الطبقة

### 2.1 Flutter

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `webview_flutter` | 4.14.1 | صفحة الدخول. والإصدار 4.14.0 فأحدث مطلوب لـ `WebViewCookieManager.getCookies` ([pub.dev](https://pub.dev/packages/webview_flutter)) |
| `dio` و`cookie_jar` و`dio_cookie_manager` | 5.11.1 و4.0.9 و3.5.0 | عميل Storefront ومخزن الـ cookies (من M01) |
| `flutter_secure_storage` | 11.2.0 | رمز المتسوق `shopper_token` (Keychain وKeystore) |
| `google_maps_flutter` | 2.19.0 | دبوس العنوان (القرار Q2 في القسم 8) |
| `geolocator` | 14.1.2 | الموقع الحالي عند طلب المتسوق فقط |
| `permission_handler` | 13.0.2 | إذن الموقع في سياقه |
| `url_launcher` | 6.3.3 | WhatsApp خارجيًا، ورابط تتبع الشحنة بـ `LaunchMode.inAppBrowserView` |
| `flutter_widget_from_html_core` | 0.17.4 | محتوى السياسات |
| `drift` | 2.35.4 | المدن، وذاكرة الطلبات، وذاكرة السياسات |
| `local_auth` | 3.0.2 | فتح الجلسة بالبصمة (Should) |
| `pinput` | 7.0.0 | حقل رمز OTP (Should) |

**الملفات الرئيسية**:

```text
packages/zid_storefront/lib/src/api/
  auth_api.dart            # auth/login-status, auth/logout (وauth/sms لاحقًا)
  account_api.dart         # account, account/addresses, account/orders
  locations_api.dart       # countries, countries/{id}/cities, locations?lat&lng
  pages_api.dart           # pages/{slug}
lib/features/account/
  hub/  login/  session/  profile/  addresses/  deletion/  policies/  orders/  order_detail/
  session/session_controller.dart     # المصدر الوحيد لحالة guest|customer
  session/cookie_bridge.dart          # WebView ⇄ cookie jar
  orders/order_status_mapper.dart     # احتياطي محلي لخريطة الحالات (المصدر الأساسي من الـ BFF)
  support/whatsapp_launcher.dart
```

### 2.2 Laravel (BFF)

| المكوّن | الموضع المقترح | المسؤولية |
|---|---|---|
| `ShopperSession` | وحدة `Shoppers` جديدة، أو داخل `Orders` (القرار Q4) | تبادل جلسة زد برمز متسوق موقّع، وربط الجهاز بالعميل لـ M06، والإلغاء |
| `OrderDetail` | `Orders` | جلب الطلب من Merchant API عبر M10، والتحقق من الملكية، والتطبيع، وخريطة الحالات، والتخزين المؤقت |
| `OrderStatusEvents` | `Orders` | حفظ أوقات تغير الحالة من `order.status.update` لبناء الخط الزمني |
| `ShopperDataDeletion` | `Shoppers` | حذف بيانات المتسوق من المنصة عند حذف الحساب |

### 2.3 Next.js

لا شاشات خاصة. ويحرر التاجر في لوحة M15 (بعقد M11): رقم WhatsApp ونص رسالته، وإظهار «طلب استرجاع»، وتسميات الحالات المخصصة إن أراد تعديلها (Could).

## 3. التدفقات

**قواعد عامة**: كل طلب Storefront يحمل `Zid-Client-Platform: mobile-app` و`Accept-Language`، ويمر بمخزن الـ cookies الواحد (M01). وأي رد 401 بالرمز `ERROR_SESSION_MISSING` أو `ERROR_SESSION_INVALID` على endpoint يحتاج دخولًا يُسلَّم إلى `SessionController` (3.3.3)، ولا تعالجه الشاشة بنفسها. والتواريخ ميلادية بصيغة «10 نوفمبر 2026» وأرقام لاتينية افتراضيًا (M02).

### 3.1 تبويب الحساب (المحور)

**الزائر**: بطاقة في الأعلى «سجّل الدخول لتتبع طلباتك وحفظ عناوينك» وزر «تسجيل الدخول». ثم: طلباتي (يطلب الدخول)، والمفضلة (M04)، والإشعارات (M06)، واللغة (M02)، وتواصل معنا (WhatsApp)، والسياسات، وعن المتجر.

**المسجل**: رأس فيه الاسم والجوال (معزول LTR). ثم: طلباتي، والمفضلة، والعناوين، والملف الشخصي، والإشعارات، واللغة، وتواصل معنا، والسياسات، وتسجيل الخروج. و«حذف الحساب» داخل الملف الشخصي، ظاهر وغير مخفي في قوائم فرعية بعيدة ([Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app/)).

**الأحداث**: `view_account`.

### 3.2 الدخول عبر WebView (F-S11) · النمط W · ينتظر SPK-05

زد تنص على أن Storefront APIs لا توفر الدخول، وأن التطبيقات تفتح صفحته كصفحة ويب تشارك مخزن cookies عميل الـ API، مع الترويسة في كل طلب ([Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)). والصفحة `/auth/login` تحوّل إلى `https://sso.zid.store/auth/login?redirect_to=...` ([LIVE](https://ppowerstore.com/auth/login)).

**نقاط الدخول**: تبويب الحساب، وورقة الإتمام في السلة (M04)، وشريط المفضلة (M04)، وطلباتي، وشاشة التأكيد للزائر (M04)، والروابط العميقة إلى طلب (M07). ويعيد `openLogin(entryPoint)` نتيجة `success|cancelled|failed` لمن استدعاه.

**التخطيط**: شاشة منبثقة بملء الشاشة. فيها شريط أصلي بزر إغلاق والعنوان «تسجيل الدخول»، ومؤشر تحميل خطي، ثم الـ WebView.

**التدفق**:
1. **مزامنة إلى الـ WebView**: تُكتب cookies نطاق المتجر من المخزن (`session` و`csrftoken` و`locale`) بـ `WebViewCookieManager.setCookie`، حتى تكون سلة الزائر هي نفسها الجلسة التي تُرقّى. فزد تدمج السلة المتروكة في سلة الجلسة الحالية عند الدخول (`is_active_abandoned_cart_merged`) ([SMS Login](https://docs.zid.sa/sms-login-38265943e0)).
2. **التحميل**: `loadRequest("https://{store-domain}/auth/login?redirect_to=%2F", headers: {Zid-Client-Platform: mobile-app, Accept-Language: {lang}})`. ومخزن البيانات هو الدائم الافتراضي، المشترك مع WebView الدفع (M04)، لأن صفحات زد تحفظ `vitrin-auth-token` في `localStorage` ([LIVE](https://ppowerstore.com/checkout/guest)).
3. **تصنيف التنقلات**:
   - نطاق المتجر، و`sso.zid.store`، و`challenges.cloudflare.com` (Turnstile): داخل الـ WebView.
   - `tel:` و`mailto:` و`wa.me`: خارجيًا.
   - أي نطاق آخر: خارجيًا، مع تسجيل `login_unexpected_host` في Sentry (المضيف فقط).
4. **كشف الإتمام**: عند `onPageFinished` لصفحة على نطاق المتجر مسارها لا يبدأ بـ `/auth`، وبعد المرور على `sso.zid.store` في الجلسة نفسها:
   1. `WebViewCookieManager.getCookies(domain: https://{store-domain})`، وكتابة كل cookie في مخزن `dio` بالنطاق نفسه، فتحل `session` الجديدة محل القديمة.
   2. `GET auth/login-status`. والشكل المرصود: `{"is_authenticated": false, "browsing_country": "SA", "is_turnstile_exempt": true}` ([LIVE](https://ppowerstore.com/api/v1/auth/login-status)).
   3. إن كان `is_authenticated = true` ينجح الدخول. وإن كان `false` يبقى الـ WebView مفتوحًا، فقد يكون المتسوق عاد دون أن يدخل.
5. **بعد النجاح**، بالترتيب، ويكفي اكتمال الخطوة (أ) لإغلاق الشاشة:
   - (أ) `GET account` وحفظ الملف في الذاكرة، وتحديث `SessionController` إلى `customer` مع `zid_customer_id = account.id`.
   - (ب) تبادل الجلسة مع الـ BFF (3.3.1) في الخلفية.
   - (ج) بث حدث `session.logged_in`، فيحدّث M04 السلة ويبدأ دمج المفضلة، ويربط M06 رمز الإشعارات.
   - (د) إغلاق الشاشة بنتيجة `success`، والعودة إلى نقطة الدخول. فإن كانت ورقة الإتمام، يُفتح `/checkout` (M04).
6. **الإلغاء**: زر الإغلاق يعيد `cancelled` دون تغيير الجلسة.
7. **الأخطاء**: خطأ تحميل الإطار الرئيسي يعرض لوحة «تعذّر فتح صفحة الدخول» مع «أعد المحاولة». وبقاء الصفحة دون تفاعل 10 دقائق يغلقها بـ `cancelled`.

**بديل إن فشل SPK-05** (لا تصل الجلسة إلى نطاق المتجر داخل الـ WebView): يبقى الشراء كزائر هو المسار الأساسي، ويصبح SPK-06 (OTP أصلي) حرجًا كما ينص spikes.md. وتظهر قائمة الطلبات عبر WebView لصفحة `/account/orders`.

**الأحداث**: `login_start` (`entry_point`)، و`login` (`method: webview`، و`result`)، و`login_cancel`.

### 3.3 الجلسة والخروج · النمط N + B

#### 3.3.1 تبادل الجلسة مع الـ BFF
تفاصيل الطلب تُقرأ من Merchant API برمز التاجر، فلا بد أن يعرف الخادم هوية المتسوق بطريقة يمكن التحقق منها، لا من رقم يرسله التطبيق (ADR-0003، البند 5).
1. يرسل التطبيق `POST {platform-api}/v1/shopper/session` برمز الجهاز، وفي الجسم قيمتا cookie `session` و`csrftoken` لنطاق المتجر (5.2).
2. يستدعي الخادم `GET https://{store-domain}/api/v1/account` بهاتين القيمتين والترويسة `Zid-Client-Platform: mobile-app`، بمهلة 5 ثوانٍ.
3. إن كان الرد 200، يأخذ `id`، ويصدر `shopper_token`: JWT موقّع ES256، صالح 24 ساعة، فيه `sub = zid_customer_id` و`tid` و`did`. ويسجل الجلسة في `shopper_sessions`، ويبلغ M06 بربط الجهاز بالعميل.
4. **قيمتا الـ cookie لا تُخزَّنان ولا تُسجَّلان** في أي سجل أو أداة مراقبة (تنقية في وسيط M12)، وتُستخدمان في هذا الطلب الواحد فقط.
5. إن كان الرد 401، يعيد الخادم 401 للتطبيق، فيعامل الجلسة كمنتهية (3.3.3).
6. وإن رد المتجر بتحدٍّ من Cloudflare أو بخطأ 5xx، يعيد الخادم 503 بالرمز `SHOPPER_VERIFY_UNAVAILABLE`. ويبقى المتسوق مسجلًا في الشاشات الأصلية N، وتعمل تفاصيل الطلب بالبديل (WebView) حتى تنجح محاولة لاحقة.
7. التجديد: قبل انتهاء الرمز بساعة، أو عند رد 401 من الـ BFF بالرمز `SHOPPER_TOKEN_EXPIRED`، يعيد التطبيق التبادل بصمت ما دامت جلسة زد صالحة.

#### 3.3.2 التحقق الدوري
عند كل عودة للتطبيق إلى الواجهة، إن مضت 15 دقيقة على آخر فحص، يُرسل `GET auth/login-status`. والنتيجة `false` لمتسوق يُعتقد أنه مسجل تقود إلى 3.3.3.

#### 3.3.3 انتهاء الجلسة
1. `SessionController.expire()`: تتحول الحالة إلى `guest`، ويُحذف `shopper_token`، ويُمسح الملف والعناوين والطلبات من الذاكرة. ويبقى مخزن الـ cookies كما هو، لأن زد قد تكون أصدرت جلسة زائر جديدة.
2. إن كان المتسوق في شاشة تحتاج دخولًا، تظهر ورقة «انتهت جلستك، سجّل الدخول للمتابعة» مع زر الدخول. وفي غيرها لا يظهر شيء.
3. يُرسل `session_expired`.

#### 3.3.4 الخروج
1. حوار تأكيد: «تسجيل الخروج؟ ستبقى سلتك على هذا الجهاز».
2. `POST auth/logout` ([Logout](https://docs.zid.sa/logout-25508912e0)). ويستمر التدفق حتى لو فشل الطلب.
3. `DELETE {platform-api}/v1/shopper/session`، ففك ربط رمز الإشعارات بالعميل (M06). ويُعاد في الطابور المحلي إن فشل.
4. مسح cookies نطاق المتجر من مخزن `dio` عدا `locale`، ثم `WebViewCookieManager.clearCookies()` و`WebViewController.clearLocalStorage()`.
5. مسح `shopper_token` والملف والعناوين والطلبات من الجهاز. ولا تُمسح المدن ولا السياسات.
6. `GET cart` للحصول على جلسة زائر جديدة، وتحديث العدّاد.
7. الانتقال إلى تبويب الحساب بحالة الزائر، وإرسال `logout`.

### 3.4 الملف الشخصي (F-S12) · النمط N

**البيانات**: `GET account` يعيد `id` و`name` و`mobile` و`mobile_object` و`email` و`verified` و`is_newsletter_subscriber` و`created_at` ([Get Profile](https://docs.zid.sa/get-profile-26363082e0)). والتعديل `PATCH account` بالحقول `name` و`email` و`is_newsletter_subscriber` و`gender` و`birth_date` بصيغة `YYYY-MM-DD` ([Update Customer Profile](https://docs.zid.sa/update-customer-profile-26364098e0)).

**التخطيط**: الاسم (مطلوب، من 2 إلى 60 حرفًا)، والبريد (اختياري، إلا إن كان `is_customers_email_mandatory` مفعّلًا في إعدادات المتجر)، والجنس (ذكر، أو أنثى، أو «أفضّل ألا أقول» فلا يُرسل الحقل)، وتاريخ الميلاد (منتقي تاريخ ميلادي)، ومفتاح «أرغب في تلقي العروض بالبريد». والجوال للقراءة فقط مع ملاحظة «لتغيير رقم الجوال تواصل مع المتجر». وفي الأسفل رابط «حذف الحساب» بلون الخطر.

**التدفق**: «حفظ» يرسل الحقول المتغيرة فقط. والرد 422 يربط كل `detail[].loc` آخر عنصر فيه باسم الحقل، ويعرض `msg` تحته. وعند النجاح: «تم حفظ التغييرات»، ثم `GET account`.

**الحالات**: الجنس وتاريخ الميلاد يظهران بقيمتهما فقط إن أعادهما `GET account`، وإلا يظهران فارغين.

**الأحداث**: `profile_update` (أسماء الحقول المتغيرة فقط، بلا قيم).

### 3.5 العناوين (F-S12) · النمط N

**القائمة**: `GET account/addresses`. يظهر العنوان الافتراضي أولًا بشارة «الافتراضي». ولكل عنوان «تعديل» و«حذف» (بتأكيد) و«اجعله الافتراضي» (`PATCH account/addresses/{id} {is_default: true}`).

**النموذج**، من الأعلى:
1. معاينة خريطة صغيرة وزر «حدد موقعك على الخريطة» (3.5.1).
2. الاسم، والجوال بقناع سعودي `5X XXX XXXX` بعد `+966` وحقل LTR.
3. المدينة: منتقٍ قابل للبحث من المدن المخزنة (3.5.2).
4. الحي (مطلوب)، والشارع.
5. العنوان الوطني: العنوان المختصر (4 أحرف لاتينية كبيرة و4 أرقام مثل `EEDA4458`)، ورقم المبنى (4 أرقام)، والرقم الإضافي (4 أرقام)، والرمز البريدي (5 أرقام).
6. نوع العنوان (المنزل، أو العمل، أو آخر)، ومفتاح «اجعله العنوان الافتراضي».

**الإلزام**: من `settings.checkout.address_field_settings[]` (N\*، [LIVE](https://mahasen.com/api/v1/settings))، أي `is_mandatory` و`is_active` و`display_name{ar,en}` لكل حقل. وإن لم يتوفر: المدينة والحي مطلوبان فقط، وبقية الحقول اختيارية بعلامة «(اختياري)» ([Baymard](https://baymard.com/blog/current-state-of-checkout-ux)).

**الحفظ**: `POST account/addresses` أو `PATCH account/addresses/{id}`، بالحقول `name` و`mobile` و`address_country_id` و`address_city_id` و`address_district` و`address_street` و`short_address` و`address_lat` و`address_lng` و`address_type` و`is_default`، و`meta{city_name, postcode, building_number, additional_number}` ([Create an Address](https://docs.zid.sa/create-an-address-26572341e0)؛ [Update an Existing Address](https://docs.zid.sa/update-an-existing-address-26572838e0)). ولا يُرسل `set_shipping_address=true` من هذه الشاشة. وأخطاء 422 تُعرض تحت حقولها.

#### 3.5.1 دبوس الخريطة والبحث العكسي
1. «حدد موقعك» يعرض شرحًا قصيرًا «لنملأ عنوانك تلقائيًا»، ثم يطلب إذن الموقع أثناء الاستخدام. والرفض لا يمنع شيئًا: تتمركز الخريطة على المدينة المختارة، أو على الرياض (24.7136, 46.6753).
2. خريطة بملء الشاشة، والدبوس ثابت في المنتصف، والمتسوق يحرك الخريطة.
3. بعد 600 ms من توقف الكاميرا: `GET locations?lat={lat}&lng={lng}`، ويُلغى الطلب السابق. والشكل المرصود:
   `{"address":"EEDA4458، 4458 4، 8374، حي الخبر الجنوبية، الخبر 34621، السعودية","city":"الخبر","country":"SA","district":"حي الخبر الجنوبية","street":"4","cityId":"31"}` ([LIVE](https://ppowerstore.com/api/v1/locations?lat=26.28&lng=50.2)).
4. تظهر بطاقة سفلية بنص `address`، وزر «تأكيد الموقع».
5. التأكيد يملأ الحقول، وتبقى كلها قابلة للتعديل:
   - `address_district` من `district`، و`address_street` من `street`.
   - `address_city_id`: يُطابق `cityId` مع `id` في المدن المخزنة. وإن لم يوجد، يُطابق `city` بالاسم بعد التطبيع العربي. وإن فشلت المطابقة يُفتح منتقي المدينة.
   - `short_address`: أول جزء من `address` إن طابق `^[A-Z]{4}[0-9]{4}`.
   - رقم المبنى والرقم الإضافي والرمز البريدي: تحليل تقريبي لأجزاء `address` المفصولة بفاصلة عربية. فالجزء الثاني يبدأ برقم المبنى، والثالث الرقم الإضافي، والرمز البريدي آخر 5 أرقام قبل اسم الدولة. وما لا يُفهم يُترك فارغًا.
   - `address_lat` و`address_lng` من مركز الخريطة نصًا بست خانات عشرية.
6. إن كان `country` غير `SA` أو الرد فارغًا أو خطأ: «تعذّر تحديد العنوان، أكمل الحقول يدويًا».

#### 3.5.2 المدن والدول
1. `GET countries` يعيد `{countries: [...]}`. ويُحدد معرّف السعودية بالبحث عن `code == "SA"`، ولا يُكتب في الكود. فالقراءة الحية أعادت `id: 184` ([LIVE](https://ppowerstore.com/api/v1/countries))، بينما مثال التوثيق يستخدم 183 ([Get Cities By Country](https://docs.zid.sa/get-cities-by-country-26362508e0)).
2. `GET countries/{id}/cities` يعيد نحو 111 KB للسعودية، بالحقول `id` و`national_id` و`ar_name` و`en_name` و`priority` و`region_id` ([LIVE](https://ppowerstore.com/api/v1/countries/184/cities)). يُحلَّل في isolate، ويُخزَّن في جدول `cities`.
3. الصلاحية 30 يومًا. وعند فتح نموذج العنوان بعد انقضائها يُحدَّث في الخلفية، وتُستخدم النسخة القديمة حتى يكتمل.
4. البحث في المنتقي بالاسمين بعد التطبيع العربي. والترتيب: `priority` ثم الاسم.

**الأحداث**: `address_add` (`with_pin`)، و`address_update`، و`address_delete`، و`address_pin_lookup` (`result: filled|partial|failed`). ولا تُرسل الإحداثيات ولا النصوص إلى التحليلات.

### 3.6 حذف الحساب (F-S12) · النمط N + B

يشترط Apple أن يستطيع المستخدم بدء حذف حسابه من داخل التطبيق إن كان التطبيق يتيح إنشاء الحسابات، وأن يكون الخيار سهل الوصول، وأن الإيقاف المؤقت لا يكفي ([Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app/)). ويشترط Google Play مسارًا داخل التطبيق، ورابط ويب لطلب الحذف دون العودة إلى التطبيق ([Google Play](https://support.google.com/googleplay/android-developer/answer/13327111)). والدخول هنا يمر بصفحة زد داخل التطبيق، فالشرطان ينطبقان.

**التدفق**:
1. الملف الشخصي، ثم «حذف الحساب».
2. شاشة شرح فيها:
   - ما يُحذف: حسابك في {اسم المتجر}، وعناوينك، ومفضلتك، وربط الإشعارات بحسابك.
   - ما قد يحتفظ به المتجر: سجلات الطلبات والفواتير بحكم الأنظمة.
   - أن الحذف نهائي ولا يمكن التراجع عنه.
3. مربع «أفهم أن الحذف نهائي»، ثم زر «احذف حسابي» بلون الخطر، يتفعل بعد التأشير.
4. `DELETE account` ([Delete Account](https://docs.zid.sa/delete-account-26363588e0)). والرد 200 يعني «Permanently deletes the currently authenticated customer account».
5. `DELETE {platform-api}/v1/shopper/me`: يحذف من المنصة جلسات المتسوق، وربط أجهزته بالعميل (M06)، وأحداث حالة طلباته، ويُفصل `zid_customer_id` عن محاولات الدفع (M04). ويُعاد في الطابور المحلي إن فشل، ويُنفَّذ في الخادم خلال 24 ساعة.
6. الخروج المحلي (3.3.4 من الخطوة 4).
7. شاشة «تم حذف حسابك» ثم الرئيسية.

**الأخطاء**: الرد 401 يعني جلسة منتهية، فيُطلب الدخول ثم يعود المتسوق إلى الخطوة 3. وفشل الشبكة في الخطوة 4 لا يغيّر شيئًا، ويظهر «أعد المحاولة».

**الأحداث**: `account_delete_start`، و`account_delete` (`result`).

### 3.7 السياسات (F-S12) · النمط N

من الشكاوى الموثقة لدى متسوقي التطبيقات المنافسة أن سياسة الاسترجاع «ما تفتح بتطبيقهم» ([Google Play: Reefi](https://play.google.com/store/apps/details?id=com.salla.reefi&hl=ar&gl=SA)). لذلك تُعرض أصليًا، وتُخزَّن لتفتح دون اتصال.

| السياسة | الـ slug | التحقق الحي على متجر واحد |
|---|---|---|
| سياسة الخصوصية | `privacy-policy` | 200 |
| سياسة الاسترجاع والاستبدال | `refund-exchange-policy` | 200 |
| الشروط والأحكام | `terms-and-conditions` | 200 |
| الشكاوى والاقتراحات | `complaints-and-suggestions` (متوقع) | 404 على المتجر المختبر |
| التراخيص | `licensing` (متوقع) | 404 على المتجر المختبر |

**البيانات**: `GET pages/{slug}` يعيد `{id, title, content (HTML), slug, seo, priority, metafields, updated_at}` ([Pages](https://docs.zid.sa/pages-26361426e0)). والقائمة المعروضة من أعلام `settings.policies.*.enabled` (N\*)، ومن إعداد M11 إن وُجد. وتُخفى السياسة التي يعود طلبها 404.

**العرض**: `flutter_widget_from_html_core` باتجاه المحتوى. وتُحذف أنماط `style` المضمّنة الخاصة بالخطوط والمقاسات، فالمحتوى منسوخ من Word غالبًا (`MsoListParagraph`). وتبقى العناوين والقوائم والروابط والجداول. وروابط المتجر الداخلية تفتح شاشاتها عبر M07، وغيرها خارجيًا.

**التخزين**: 24 ساعة. ودون اتصال تُعرض النسخة المحفوظة مع تاريخها.

**الحالات**: المحتوى الفارغ (مثل `<p></p>` فقط) يعرض «لم يضف المتجر هذه السياسة بعد»، مع زر WhatsApp.

**الأحداث**: `view_policy` (`slug`).

### 3.8 قائمة الطلبات (F-S10) · النمط N، وبديل B · ينتظر SPK-07

**البيانات**: `GET account/orders?page={n}&page_size=10`. والتوثيق يصف `results` بأنها «Order identifier or order summary representation»، دون حقول ([Get Orders](https://docs.zid.sa/get-orders-26722142e0)). والزائر يُرد عليه 401 `{"message":"Unauthorized"}` ([LIVE](https://ppowerstore.com/api/v1/account/orders)). لذلك يُبنى محوّل `AccountOrderItemAdapter`، وتحسم SPK-07 أحد مسارين:
- **(أ) العناصر كائنات** فيها الرمز والحالة والإجمالي والتاريخ: تُعرض مباشرة، وتُطبع الحالة بخريطة 3.9.2 المحلية الاحتياطية.
- **(ب) العناصر معرّفات فقط**: يُستخدم `GET {platform-api}/v1/shopper/orders?page={n}`، ويخدمه الخادم من Merchant `List Orders` بالمعامل `customer_id` من رمز المتسوق (5.2). وهذا الفلتر موثق في `List Orders` ([List Orders](https://docs.zid.sa/list-of-orders)).

**التخطيط**: بطاقة لكل طلب فيها: رقم الطلب `#rEXuB20myr` (LTR)، والتاريخ، ورقاقة الحالة بلونها، والإجمالي، وحتى 3 صور مصغرة ثم «+N». وتمرير لا نهائي، وسحب للتحديث.

**الحالات**:
- الزائر: «سجّل الدخول لرؤية طلباتك»، مع ملاحظة «إن طلبت كزائر، سجّل الدخول بالجوال نفسه». وظهور طلبات الزائر بعد الدخول يُتحقق منه في SPK-07.
- فارغة: «لا توجد طلبات بعد» وزر «ابدأ التسوق».
- التخزين: آخر صفحتين للعميل الحالي لمدة 24 ساعة، للعرض دون اتصال.

**التفاعلات**: النقر يفتح تفاصيل الطلب (3.9). وحدث `checkout.completed` من M04 يُبطل الذاكرة ويعيد الجلب.

**الأحداث**: `view_orders`، و`select_order`.

### 3.9 تفاصيل الطلب والتتبع (F-S10) · النمط B · ينتظر SPK-07

#### 3.9.1 التدفق
1. **المصادر**: قائمة الطلبات، أو شاشة التأكيد (M04)، أو إشعار حالة الطلب (M06 عبر M07). ويتطلب دخولًا، فإن لم يكن المتسوق مسجلًا يُفتح الدخول ثم يُكمل.
2. يرسل التطبيق `GET {platform-api}/v1/shopper/orders/{zid_order_id}` برمز الجهاز و`X-Shopper-Token`.
3. **في الخادم**:
   1. يتحقق من الرمز، ويستخرج `tid` و`sub`.
   2. يبحث في ذاكرة Redis بالمفتاح `order:{tenant}:{id}:{lang}`.
   3. عند عدم الوجود، يطلب عبر M10: `GET https://api.zid.sa/v1/managers/store/orders/{id}/view` بالترويسات `Authorization` و`X-Manager-Token` و`Accept-Language` ([View Order](https://docs.zid.sa/view-order-12479054e0)).
   4. **التحقق من الملكية**: `order.customer.id` يجب أن يساوي `sub`. وإلا يُرد 404 بالرمز `ORDER_NOT_FOUND`، لا 403، حتى لا يُكشف وجود الطلب. وتطابق المعرّفين بين Storefront وMerchant API هو سؤال SPK-07.
   5. التطبيع (5.2) وخريطة الحالات (3.9.2)، ودمج أوقات `order_status_events`.
   6. التخزين: 60 ثانية للحالات غير النهائية، و24 ساعة للنهائية (`delivered` و`cancelled` و`reversed`). ويُبطل M10 المفتاح عند `order.status.update` أو `order.payment_status.update` لهذا الطلب.
   7. إن ردت Merchant API بـ 429 أو 5xx، تُعاد آخر نسخة مخزنة عمرها حتى 24 ساعة مع `stale: true`. وإلا يُرد 503.
4. **في التطبيق**: تُرسم الشاشة، ويُحفظ الرد في `order_detail_cache` للعرض دون اتصال.
5. **البديل** (SPK-07 فشل، أو `SHOPPER_VERIFY_UNAVAILABLE`، أو 503 بلا ذاكرة): زر «عرض الطلب في صفحة المتجر» يفتح WebView على صفحة الطلب في حساب الويب، بمزامنة الـ cookies. والرابط المفرد يحدده SPK-07، وإلا يُفتح `/account/orders`.

#### 3.9.2 خريطة حالات زد إلى حالات المتسوق

المصدر الأساسي `order_status.code`. والمطابقة لا تتأثر بحالة الأحرف ولا بالشرطة السفلية، لأن التوثيق يكتب `inDelivery` و`cancelled` في الـ webhooks ([Webhooks](https://docs.zid.sa/webhooks))، و`indelivery` و`canceled` في فلتر `List Orders` ([List Orders](https://docs.zid.sa/list-of-orders)).

| رمز زد (وصيغه) | المفتاح الموحد | النص العربي للمتسوق | English | خطوة الخط الزمني |
|---|---|---|---|---|
| `new` | `received` | تم استلام طلبك | Order received | 1 |
| `preparing` | `preparing` | جارٍ تجهيز طلبك | Being prepared | 2 |
| `ready` | `ready` | جاهز للشحن، أو «جاهز للاستلام» إن كان الشحن `zid_pickup` | Ready to ship / Ready for pickup | 3 |
| `inDelivery`، و`indelivery`، و`in_delivery` | `in_delivery` | طلبك في الطريق إليك | On its way | 4 |
| `delivered` | `delivered` | تم التوصيل، أو «تم الاستلام» للاستلام من الفرع | Delivered | 5 (نهائية) |
| `cancelled`، و`canceled` | `cancelled` | تم إلغاء الطلب | Cancelled | فرع نهائي يحل محل الخطوات الباقية |
| `reverse_in_progress` | `return_in_progress` | جارٍ الاسترجاع | Return in progress | فرع بعد «تم التوصيل» |
| `reversed` | `returned` | تم الاسترجاع | Returned | فرع نهائي |
| أي رمز آخر | `unknown` | `display_status.name` كما هو | — | لا يُرسم خط زمني، وتظهر الحالة فقط، ويُسجَّل `order_status_unmapped` |

**طبقات فوق الحالة**:
- **الحالة المخصصة**: إن اختلف `display_status.code` عن `order_status.code`، يظهر `display_status.name` سطرًا فرعيًا تحت الخطوة الحالية، مثل «تم التغليف» تحت «جارٍ تجهيز طلبك». واللون من `display_status.color` إن حقق تباين 4.5:1 مع الخلفية، وإلا لون الحالة الدلالي من M02.
- **الدفع**:
  - `payment_status = pending` مع تحويل بنكي (`zid_bank_transfer`): شريط «بانتظار تأكيد التحويل البنكي».
  - `refunded`: شريط «تم استرداد المبلغ».
  - `voided`: شريط «أُلغيت عملية الدفع».
  - والدفع عند الاستلام مع `pending`: لا شريط.

**أوقات الخطوات**: الخطوة 1 من `created_at`. والبقية من `order_status_events` التي تسجلها المنصة من `order.status.update`. والخطوة بلا وقت تظهر بلا وقت، كالحالات التي سبقت ربط المتجر بالمنصة.

#### 3.9.3 التخطيط
1. **الرأس**: رقم الطلب مع زر نسخ، والتاريخ، ورقاقة الحالة.
2. **الخط الزمني**: عمودي بخمس خطوات، ينعكس في RTL. الخطوات المكتملة بعلامة ووقت، والحالية مميزة مع السطر الفرعي، والقادمة باهتة. وللإلغاء والاسترجاع يُستبدل ما بعد آخر خطوة مكتملة بخطوة الفرع.
3. **بطاقة الشحن**: اسم طريقة الشحن، وشركة الشحن `courier`، والمدة المتوقعة `estimated_delivery_time`، ورقم التتبع `tracking.number` مع زر نسخ، وزر «تتبع الشحنة» يفتح `tracking.url` في متصفح داخل التطبيق. وعدد الطرود إن كان `packages_count` أكبر من 1.
4. **العنوان**: `shipping.address.formatted_address` والمدينة. ولطلب الاستلام من الفرع: اسم الفرع.
5. **المنتجات**: صورة، واسم، وكمية، وسعر، ومجموع السطر.
6. **الفاتورة**: أسطر `payment.invoice[]` بترتيبها (`sub_totals_before_vat` و`coupon` و`vat` و`total` وغيرها)، بعناوينها `title` وقيم منسقة من `value`. وطريقة الدفع `payment.method.name`.
7. **الأزرار**: «تواصل مع المتجر عبر WhatsApp» (3.10). و«طلب استرجاع» (Could) إن فعّله التاجر وكانت الحالة `delivered`. و«اشترِ مجددًا» (Should).
8. **طلب الهدية**: `is_gift_order = 1` يُظهر شارة «طلب هدية».

**الأحداث**: `view_order_detail` (`status_key`، و`source: list|push|confirmation|deeplink`، و`stale`)، و`track_shipment_open`، و`copy_tracking_number`، و`order_detail_fallback_webview` (`reason`).

### 3.10 WhatsApp برقم الطلب (F-S10) · النمط B

1. **الرقم**: من إعداد `support.whatsapp_number` في M11. ويُستورد عند الإعداد من `storewhatsapp/widget.settings.phone_number` (N\*، [LIVE](https://mahasen.com/api/v1/storewhatsapp/widget))، ويعدّله التاجر من اللوحة.
2. **التطبيع**: تُحذف كل الرموز عدا الأرقام. و`05XXXXXXXX` يصبح `9665XXXXXXXX`، و`00966` يصبح `966`. والرقم الناتج الذي لا يطابق `^[1-9][0-9]{7,14}$` يُعامل كمفقود.
3. **الرسالة**: قالب بلغة التطبيق، ويعدّله التاجر في M11. والافتراضي:
   - طلب: «مرحبًا، لدي استفسار عن طلبي رقم {code}»
   - عام: «مرحبًا، لدي استفسار»
   - استرجاع (Could): «مرحبًا، أرغب في استرجاع أو استبدال منتج من طلبي رقم {code}»
4. **الفتح**: `https://wa.me/{digits}?text={urlencoded}` بـ `LaunchMode.externalApplication`. وإن لم يكن WhatsApp مثبتًا يفتح الرابط في المتصفح، وهذا سلوك `wa.me` نفسه.
5. **الرقم المفقود**: يختفي زر WhatsApp، ويظهر الجوال أو البريد من `settings.contact` إن وُجد.

**الأحداث**: `contact_whatsapp` (`context: order|general|return`).

### 3.11 لاحقًا (Should وCould)

| البند | الأولوية | الفكرة | الاعتمادية |
|---|---|---|---|
| دخول OTP أصلي (F-S11b) | Should | شاشة جوال بقناع سعودي، ثم `POST auth/sms` (`mobile_number` و`country_code`)، ثم رمز بـ `pinput`، ثم `POST auth/sms/verify`. والتوثيق صار يصف التحقق: الرد يحمل `customer_id` و`cart_session_id` و`is_active_abandoned_cart_merged` و`has_addresses` ([Verify SMS Login](https://docs.zid.sa/verify-sms-login-38267137e0)). ويُفحص `is_turnstile_exempt` أولًا، فإن كان `false` يبقى الدخول عبر WebView. وبعد النجاح التدفق نفسه من 3.2 الخطوة 5 | SPK-06، وموافقة زد كتابةً |
| فتح الجلسة بالبصمة (F-S11b) | Should | بعد 7 أيام دون فتح، تُطلب البصمة بـ `local_auth` قبل عرض الطلبات والعناوين. وهذا قفل محلي، لا دخول جديد إلى زد | ACC-03 |
| «اشترِ مجددًا» (F-S17) | Should | من تفاصيل الطلب: إضافة كل الأسطر المتوفرة إلى السلة بـ `POST cart/items`، مع تقرير «أضفنا 3 من 4، ونفد منتج واحد». ويحتاج معرّف المنتج أو المتغير في عناصر الطلب (SPK-07) | SPK-07، وM04 |
| طلب استرجاع (F-S22) | Could | المرحلة الأولى: زر WhatsApp بقالب الاسترجاع مع رابط السياسة الأصلية. والمرحلة الثانية: معالج أصلي (اختيار المنتجات، والسبب من `List Reverse Reasons`، وصور)، ينشئ طلبًا عكسيًا عبر Merchant API بقواعد يعتمدها التاجر ([Reverse Orders](https://docs.zid.sa/reverse-orders-1810994f0)) | M10، وقرار التاجر |
| النقاط والمحفظة والإحالة (F-S21) | Could | رقاقة في رأس الحساب: النقاط من `GET cart/loyalty/balance` (N، موثق)، والمحفظة من `account/wallet/balance` (N\*)، والإحالة من `account/referral/stats` (N\*). وكلها خلف أعلام، وتختفي عند الخطأ 400 أو 404 | SPK-12 |
| تعديل تسميات الحالات المخصصة | Could | التاجر يعيد تسمية `display_status` من اللوحة | M15 |
| رفع إيصال التحويل البنكي | Could | `orders/{code}/transaction-slip` (N\*) من تفاصيل الطلب | SPK-12 |

## 4. نموذج البيانات

### 4.1 على الجهاز

| المخزن | الحقول | الاحتفاظ |
|---|---|---|
| التخزين الآمن (`flutter_secure_storage`) | `shopper_token`، و`shopper_token_expires_at`، و`zid_customer_id` | حتى الخروج أو الانتهاء |
| مخزن الـ cookies (M01) | `session`، و`csrftoken`، و`locale`، و`__cf_bm` لنطاق المتجر | بحسب صلاحية كل cookie (`session` نحو 30 يومًا) |
| drift: `profile_cache` | `json`، و`fetched_at` | حتى الخروج |
| drift: `cities` | `id INTEGER PK`، و`country_id`، و`national_id`، و`ar_name`، و`en_name`، و`ar_normalized`، و`priority`، و`region_id`، و`fetched_at`. فهرس على `(country_id, ar_normalized)` | 30 يومًا |
| drift: `orders_cache` | `customer_id`، و`page`، و`json`، و`fetched_at` | صفحتان، و24 ساعة، ويُمسح عند الخروج |
| drift: `order_detail_cache` | `zid_order_id PK`، و`customer_id`، و`json`، و`fetched_at` | آخر 20، و24 ساعة، ويُمسح عند الخروج |
| drift: `policy_cache` | `slug`، و`lang`، و`title`، و`html`، و`fetched_at`. المفتاح `(slug, lang)` | 24 ساعة، ولا يُمسح عند الخروج |
| drift: `pending_platform_calls` | `method`، و`path`، و`body`، و`attempts`، و`next_at` | لعمليات الخروج والحذف التي فشلت، حتى 7 أيام |

### 4.2 على الخادم (PostgreSQL وRedis)

**`shopper_sessions`**:

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | `uuid` PK | `jti` في الرمز |
| `tenant_id` | `uuid` FK | |
| `device_id` | `uuid` | من تسجيل الجهاز |
| `zid_customer_id` | `bigint` | |
| `created_at`، و`expires_at`، و`revoked_at` | `timestamptz` | |

الفهارس: `(tenant_id, zid_customer_id)`، و`(device_id)`. والاحتفاظ 30 يومًا بعد الانتهاء أو الإلغاء.

**`order_status_events`**:

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | `bigserial` PK | |
| `tenant_id` | `uuid` | |
| `zid_order_id` | `bigint` | |
| `zid_customer_id` | `bigint` NULL | |
| `status_code` | `varchar(32)` | الرمز الخام من زد |
| `status_key` | `varchar(24)` | المفتاح الموحد بعد الخريطة |
| `display_status_code` | `varchar(64)` NULL | |
| `occurred_at` | `timestamptz` | وقت الحدث بحسب زد إن وُجد، وإلا وقت الاستلام |
| `received_at` | `timestamptz` | |

فهرس فريد على `(tenant_id, zid_order_id, status_code)`، فالحدث المكرر لا يكرر الخطوة. والاحتفاظ 13 شهرًا. ويُحذف ما يخص العميل عند حذف حسابه.

**Redis**: `order:{tenant}:{zid_order_id}:{lang}`، بصلاحية 60 ثانية للحالات غير النهائية و24 ساعة للنهائية. و`orders:list:{tenant}:{customer}:{page}:{lang}` لمسار البديل (ب)، بصلاحية 60 ثانية.

## 5. الواجهات والعقود

### 5.1 Storefront API المستخدمة (نطاق المتجر `https://{store-domain}/api/v1/`)

| الطريقة والمسار | الاستخدام | النمط | المصدر |
|---|---|---|---|
| صفحة `/auth/login` | الدخول | W | [DOC](https://docs.zid.sa/login-checkout-via-page-views-2258377m0) و[LIVE](https://ppowerstore.com/auth/login) |
| `GET auth/login-status` | كشف الدخول والتحقق الدوري | N (المخطط الموثق نص، والمرصود كائن) | [DOC](https://docs.zid.sa/login-status-38265898e0) |
| `POST auth/logout` | الخروج | N | [DOC](https://docs.zid.sa/logout-25508912e0) |
| `GET/PATCH/DELETE account` | الملف والحذف | N | [DOC](https://docs.zid.sa/get-profile-26363082e0) |
| `GET/POST account/addresses`، و`PATCH/DELETE account/addresses/{id}` | العناوين | N | [DOC](https://docs.zid.sa/create-an-address-26572341e0) |
| `GET countries`، و`GET countries/{id}/cities` | المدن | N | [DOC](https://docs.zid.sa/get-cities-by-country-26362508e0) |
| `GET locations?lat&lng` | البحث العكسي للعنوان | N (المسار موثق في الملاحظات كقراءة حية) | [LIVE](https://ppowerstore.com/api/v1/locations?lat=26.28&lng=50.2) |
| `GET pages/{slug}` | السياسات | N | [DOC](https://docs.zid.sa/pages-26361426e0) |
| `GET account/orders` | قائمة الطلبات | N (مخطط العناصر في SPK-07) | [DOC](https://docs.zid.sa/get-orders-26722142e0) |
| `GET settings` | `policies`، و`customers`، و`checkout.address_field_settings`، و`contact` | N\* | [LIVE](https://mahasen.com/api/v1/settings) |

**مثال: `POST account/addresses`**:

```json
{
  "name": "أحمد السعيد",
  "mobile": "+966501234567",
  "address_country_id": 184,
  "address_city_id": 31,
  "address_district": "حي الخبر الجنوبية",
  "address_street": "4",
  "short_address": "EEDA4458",
  "address_lat": "26.280000",
  "address_lng": "50.200000",
  "address_type": "home",
  "is_default": true,
  "meta": { "city_name": "الخبر", "postcode": "34621", "building_number": "4458", "additional_number": "8374" }
}
```

**مثال: `PATCH account`**:

```json
{ "name": "أحمد السعيد", "email": "ahmed@example.com", "gender": "male", "birth_date": "1995-08-21", "is_newsletter_subscriber": false }
```

### 5.2 BFF (`{platform-api}/v1/shopper/`)

المصادقة: `Authorization: Bearer {device_token}` (M12) في كل الطلبات، و`X-Shopper-Token: {shopper_token}` في الطلبات الخاصة بالعميل. والأخطاء بصيغة M12 الموحدة.

**`POST /v1/shopper/session`**: تبادل الجلسة.

```json
{ "zid_cookies": { "session": "eyJjYXJ0cyI6...", "csrftoken": "kq3...Zt" } }
```

الرد `201`:

```json
{ "shopper_token": "eyJhbGciOiJFUzI1NiIs...", "expires_at": "2026-11-11T21:20:00+03:00", "zid_customer_id": 1441 }
```

والأخطاء: `401 ZID_SESSION_INVALID`، و`503 SHOPPER_VERIFY_UNAVAILABLE`، و`429` (10 طلبات في الساعة لكل جهاز).

**`DELETE /v1/shopper/session`**: يلغي جلسة هذا الجهاز ويفك ربط الإشعارات. والرد `204`.

**`DELETE /v1/shopper/me`**: يحذف بيانات المتسوق من المنصة في هذا المتجر، عبر كل أجهزته. والرد `202`، والتنفيذ في طابور خلال 24 ساعة.

**`GET /v1/shopper/orders/{zid_order_id}`**: تفاصيل الطلب المطبّعة.

```json
{
  "id": 4512345,
  "code": "rEXuB20myr",
  "created_at": "2026-11-10T21:15:40+03:00",
  "status": {
    "key": "in_delivery", "label": "طلبك في الطريق إليك",
    "zid_code": "inDelivery", "display_name": "مع المندوب", "display_color": "#3498db", "is_terminal": false
  },
  "payment_notice": null,
  "timeline": [
    { "key": "received", "label": "تم استلام طلبك", "state": "done", "at": "2026-11-10T21:15:40+03:00" },
    { "key": "preparing", "label": "جارٍ تجهيز طلبك", "state": "done", "at": "2026-11-11T09:02:11+03:00" },
    { "key": "ready", "label": "جاهز للشحن", "state": "done", "at": null },
    { "key": "in_delivery", "label": "طلبك في الطريق إليك", "state": "current", "at": "2026-11-12T10:40:00+03:00" },
    { "key": "delivered", "label": "تم التوصيل", "state": "upcoming", "at": null }
  ],
  "payment": { "method": "مدى", "status": "paid" },
  "shipping": {
    "method": "سمسا", "courier": "SMSA", "is_pickup": false,
    "estimated_delivery_time": "2-4 أيام عمل", "packages_count": 1,
    "tracking": { "number": "290012345678", "status": "in_transit", "url": "https://track.example.com/290012345678" },
    "address": { "formatted": "4458 شارع 4، حي الخبر الجنوبية، الخبر", "city": "الخبر" }
  },
  "items": [ { "name": "سماعة لاسلكية", "sku": "RP-CB058", "quantity": 2, "price": 649.0, "total": 1298.0, "image": "https://media.zid.store/..." } ],
  "invoice": [
    { "code": "sub_totals_before_vat", "title": "المجموع قبل الضريبة", "value": 1128.70 },
    { "code": "vat", "title": "ضريبة القيمة المضافة", "value": 169.30 },
    { "code": "total", "title": "الإجمالي", "value": 1323.00 }
  ],
  "currency": "SAR",
  "is_gift_order": false,
  "fetched_at": "2026-11-12T10:41:02+03:00",
  "stale": false
}
```

**مصدر كل حقل في View Order** ([View Order](https://docs.zid.sa/view-order-12479054e0)):

| الحقل المطبّع | حقل زد |
|---|---|
| `id` و`code` و`created_at` | `id` و`code` و`created_at` |
| `status.zid_code` | `order_status.code` |
| `status.display_name` و`status.display_color` | `display_status.name` و`display_status.color` |
| `payment.method` و`payment.status` | `payment.method.name` و`payment_status` |
| `shipping.method`، و`courier`، و`estimated_delivery_time`، و`tracking` | `shipping.method.name`، و`.courier`، و`.estimated_delivery_time`، و`.tracking{number,status,url}` |
| `shipping.address` | `shipping.address.formatted_address` و`.city` |
| `items[]` | `products[]`: `name` و`sku` و`quantity` و`price` و`total` و`images[0]` |
| `invoice[]` | `payment.invoice[]`: `code` و`title` و`value` |
| `currency` | `order_currency.code` |
| `is_gift_order` | `is_gift_order` (1 أو 0) |
| فحص الملكية | `customer.id` |

والأخطاء: `404 ORDER_NOT_FOUND` (غير موجود أو لا يخص العميل)، و`401 SHOPPER_TOKEN_EXPIRED`، و`503 ORDER_UNAVAILABLE`. وحد المعدّل 30 طلبًا في الدقيقة لكل متسوق.

**`GET /v1/shopper/orders?page={n}`** (البديل ب، يُفعَّل بعلم `orders_list_via_bff` بعد SPK-07): يخدمه الخادم من `GET /v1/managers/store/orders?customer_id={sub}&page={n}&per_page=10&payload_type=default&sort_by=desc&order_by=created_at` ([List Orders](https://docs.zid.sa/list-of-orders)).

```json
{
  "page": 1, "has_more": true,
  "results": [
    { "id": 4512345, "code": "rEXuB20myr", "created_at": "2026-11-10T21:15:40+03:00",
      "status": { "key": "in_delivery", "label": "طلبك في الطريق إليك" },
      "total": 1323.00, "currency": "SAR", "items_count": 2, "thumbnails": ["https://media.zid.store/..."] }
  ]
}
```

**ميزانية Merchant API**: كل طلبات هذه الوحدة تمر بمحدِّد M10، بحد 20 طلبًا في الدقيقة لكل متجر، لتبقى سعة لبقية المزامنات من أصل 60 ([Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0)). وعند بلوغ الحد يُخدم المخزّن (`stale: true`) أو يُرد 503.

### 5.3 الأحداث بين المكونات

| الحدث | المصدر | المستهلك | الحمولة |
|---|---|---|---|
| `session.logged_in` (داخل التطبيق) | `SessionController` | M04 (السلة والمفضلة)، وM06 (الربط)، وM08 | `zid_customer_id`، و`method` |
| `session.logged_out` و`session.expired` (داخل التطبيق) | `SessionController` | M04، وM06، وM08 | — |
| `checkout.completed` (داخل التطبيق) | M04 | قائمة الطلبات | `zid_order_id` |
| `OrderStatusChanged` (في الخادم) | M10 بعد `order.status.update` وإعادة الجلب | `Orders`: إضافة إلى `order_status_events` وإبطال الذاكرة. وM06 للإشعار | `tenant_id`، و`zid_order_id`، و`customer_id`، و`status_code`، و`display_status`، و`occurred_at` |
| `ShopperBound` و`ShopperUnbound` (في الخادم) | `ShopperSession` | M06 (ربط رمز FCM بالعميل) | `tenant_id`، و`device_id`، و`zid_customer_id` |
| `ShopperDeleted` (في الخادم) | `ShopperDataDeletion` | M06، وM04 (محاولات الدفع)، وM08 | `tenant_id`، و`zid_customer_id` |

### 5.4 أحداث التحليلات (مقترحة لتصنيف M08)

| الحدث | الخصائص |
|---|---|
| `view_account` | `customer_state` |
| `login_start` | `entry_point: account\|checkout\|wishlist\|orders\|confirmation\|deeplink` |
| `login` | `method: webview\|otp`، و`result: success\|failed` |
| `login_cancel`، و`logout`، و`session_expired` | — |
| `profile_update` | `fields[]` (أسماء فقط) |
| `address_add`، و`address_update`، و`address_delete` | `with_pin` |
| `address_pin_lookup` | `result: filled\|partial\|failed` |
| `account_delete_start`، و`account_delete` | `result` |
| `view_policy` | `slug` |
| `view_orders`، و`select_order` | `orders_count` |
| `view_order_detail` | `status_key`، و`source`، و`stale` |
| `track_shipment_open`، و`copy_tracking_number` | `status_key` |
| `contact_whatsapp` | `context: order\|general\|return` |
| `order_detail_fallback_webview` | `reason: spk07\|verify_unavailable\|bff_error` |

لا تُرسل في أي حدث: الجوال، أو البريد، أو العنوان، أو الإحداثيات، أو رقم التتبع.

### 5.5 العقود مع الوحدات الأخرى

| الوحدة | ما تقدمه لـ M05 | ما يقدمه M05 لها |
|---|---|---|
| M01 | مخزن الـ cookies، والتخزين الآمن، والموجّه، وقاعدة drift | المسارات `/account` و`/account/orders` و`/account/orders/{id}` و`/account/addresses` و`/account/profile` و`/policies/{slug}` و`/login` |
| M04 | حزمة `zid_storefront`، وحدث `checkout.completed` | `openLogin(entryPoint)`، و`SessionState`، و`X-Shopper-Token`، وشاشة تفاصيل الطلب، والسياسة الأصلية لكتلة الثقة |
| M06 | ربط الجهاز بالعميل، والإشعار عند تغير الحالة | `ShopperBound` و`ShopperUnbound` و`ShopperDeleted`، وشاشة الطلب هدفًا للإشعار |
| M07 | تحويل `/account/orders/{code}` وروابط الإشعارات إلى المسار | المسارات أعلاه، وشرط الدخول قبل فتحها |
| M10 | `getOrder`، و`listOrders(customer_id)`، و`OrderStatusChanged`، والمحدِّد، وإعدادات المتجر المستوردة (WhatsApp، والسياسات) | — |
| M11 | `support.whatsapp_number` وقوالبه، و`returns_enabled`، ومفاتيح الأعلام | — |
| M12 | رمز الجهاز، ومفتاح توقيع ES256 وتدويره، ووسيط تنقية السجلات، واصطلاحات الأخطاء | — |
| M13 وM14 | — | رابط ويب لطلب حذف الحساب (شرط Google Play) يُضاف إلى بيانات قائمة المتجر (القرار Q6) |

## 6. الحالات الحدية والأخطاء

### 6.1 الدخول والجلسة

| الحالة | السلوك المتوقع |
|---|---|
| صفحة المتجر تحمّلت بعد SSO لكن `login-status` يعيد `false` | يبقى الـ WebView مفتوحًا، ويُسجَّل `login_cookie_not_shared` مع المنصة وإصدارها. وتكراره يعني فشل SPK-05 |
| `getCookies` لا يعيد `session` على أندرويد | محاولة ثانية بعد 500 ms لأن `CookieManager` قد يتأخر في الكتابة، ثم خطأ «تعذّر إكمال الدخول، أعد المحاولة» |
| ظهور Turnstile | يُعرض داخل الـ WebView، فهو جزء من صفحة زد |
| المتسوق أغلق الشاشة أثناء SSO | `cancelled`، ولا تغيير على الجلسة ولا السلة |
| تحويل من الصفحة إلى نطاق غير متوقع | يُفتح خارجيًا، ويُسجَّل المضيف |
| الدخول من ورقة الإتمام وسلة الحساب أكبر بعد الدمج | تُحدَّث السلة. وإن تغير المجموع يظهر «حدّثنا سلتك بمنتجات من حسابك» قبل فتح الدفع |
| 401 من زد في منتصف تدفق (حفظ عنوان مثلًا) | `expire()`، ثم ورقة الدخول، وبعد النجاح يُعاد الحفظ بالبيانات نفسها دون فقدها |
| `SHOPPER_VERIFY_UNAVAILABLE` | الشاشات N تعمل، وتفاصيل الطلب بالبديل، وإعادة التبادل كل 10 دقائق |
| الخروج دون اتصال | خروج محلي كامل، و`auth/logout` و`DELETE session` في الطابور |
| الدخول على جهازين | لكل جهاز جلسة زد ورمز متسوق مستقل. والخروج من أحدهما لا يؤثر في الآخر |
| انحراف ساعة الجهاز | صلاحية الرمز يقررها الخادم بالرد 401، لا ساعة الجهاز |

### 6.2 الملف والعناوين والحذف

| الحالة | السلوك المتوقع |
|---|---|
| البريد مستخدم في حساب آخر (422) | الرسالة تحت حقل البريد |
| الدبوس خارج السعودية | «تعذّر تحديد العنوان، أكمل الحقول يدويًا»، وتُحفظ الإحداثيات فقط |
| `cityId` غير موجود في المدن المخزنة | مطابقة بالاسم، ثم المنتقي. وتحديث المدن في الخلفية إن كان عمرها أكثر من 7 أيام |
| تحليل العنوان الوطني فشل جزئيًا | تُملأ الأجزاء المفهومة فقط |
| العنوان المختصر بأحرف صغيرة | يُحوَّل إلى أحرف كبيرة قبل التحقق |
| حذف العنوان الافتراضي | تأكيد إضافي «هذا عنوانك الافتراضي». وبعد الحذف تحدد زد الافتراضي الجديد، ويُعاد الجلب |
| رفض إذن الموقع نهائيًا | زر «فتح الإعدادات» في الشرح، والخريطة تبقى قابلة للتحريك يدويًا |
| الحذف من زد نجح وفشل طلب المنصة | يبقى في `pending_platform_calls`، ويكتمل الخروج المحلي |
| الحذف لمتسوق دخل كزائر فقط | الزر لا يظهر للزائر، فلا حساب يُحذف |

### 6.3 السياسات

| الحالة | السلوك المتوقع |
|---|---|
| الـ slug يعيد 404 | تُخفى من القائمة، وتُحفظ النتيجة 24 ساعة |
| المحتوى فارغ | «لم يضف المتجر هذه السياسة بعد» مع WhatsApp |
| HTML كبير (أكثر من 200 KB) | يُحلَّل خارج خيط الواجهة، ويُرسم بالتدريج |
| رابط داخلي إلى سياسة أخرى | يفتح الشاشة الأصلية للسياسة |
| `script` أو `iframe` في المحتوى | يُتجاهل |

### 6.4 الطلبات والتتبع

| الحالة | السلوك المتوقع |
|---|---|
| عناصر `account/orders` نصوص فقط | المسار (ب) خلف العلم، أو بطاقة برقم الطلب فقط وزر التفاصيل |
| الطلب لا يخص العميل | 404 من الخادم، و«الطلب غير موجود»، دون تمييز عن غير الموجود فعلًا |
| الطلب غير موجود في Merchant API بعد الدفع مباشرة | 404 مؤقت. وإن جاء المتسوق من التأكيد خلال 5 دقائق، تُعاد المحاولة 3 مرات كل 5 ثوانٍ قبل إظهار الخطأ |
| 429 من Merchant API | النسخة المخزنة مع شريط «آخر تحديث قبل N دقيقة»، وإلا «تعذّر التحميل، أعد المحاولة» |
| رمز حالة مجهول | `display_status.name`، دون خط زمني، ويُسجَّل `order_status_unmapped` |
| `tracking.url` فارغ | يظهر رقم التتبع واسم الشركة فقط، دون زر |
| `tracking.url` بـ `http://` | يُفتح خارجيًا لا داخل التطبيق |
| `packages_count` أكبر من 1 | «يُشحن طلبك في N طرود»، ورابط التتبع الأول فقط إن لم تعد زد غيره |
| طلب استلام من الفرع (`zid_pickup`) | «جاهز للاستلام» و«تم الاستلام»، واسم الفرع مكان العنوان |
| طلب هدية | شارة «طلب هدية»، والعنوان عنوان المستلم كما تعيده زد |
| ملغي بعد الدفع | خطوة «تم إلغاء الطلب»، وشريط «تم استرداد المبلغ» إن كان `refunded` |
| فتح إشعار طلب على جهاز سُجّل منه الخروج | الدخول أولًا، ثم التفاصيل. وإن كان العميل مختلفًا: «الطلب غير موجود» |
| حالات قبل ربط المتجر بالمنصة | الخطوات تظهر مكتملة بلا أوقات |
| أحداث `order.status.update` بترتيب مقلوب | الخط الزمني يُبنى من الحالة الحالية، لا من آخر حدث وصل. والأوقات تُعرض لما يسبق الحالة الحالية فقط |

### 6.5 WhatsApp

| الحالة | السلوك المتوقع |
|---|---|
| الرقم مفقود أو غير صالح | الزر لا يظهر، والبدائل من `settings.contact` |
| WhatsApp غير مثبت | `wa.me` يفتح في المتصفح |
| رقم الطلب في نص عربي | يُعزل LTR داخل الرسالة |

## 7. المتطلبات غير الوظيفية

| المجال | المتطلب | القياس |
|---|---|---|
| الأداء: الدخول | أول رسم لصفحة الدخول حتى 3 ثوانٍ (p75). ومن تحميل صفحة العودة إلى إغلاق الشاشة حتى ثانيتين (p75)، وتشمل `getCookies` و`login-status` و`account` | تتبع Sentry |
| الأداء: تفاصيل الطلب | حتى 1.2 ثانية من ذاكرة الـ BFF، وحتى 2.5 ثانية دونها (p75). ونسبة إصابة الذاكرة 70% فأكثر في ساعة الذروة | مقاييس الخادم |
| الأداء: القائمة | الصفحة الأولى حتى 1.5 ثانية (p75)، وفورية من الذاكرة | |
| الأداء: العنوان | البحث العكسي حتى ثانية واحدة (p75). والمنتقي يُفتح في أقل من 100 ms من الذاكرة | |
| السعة | طلبات Merchant API من هذه الوحدة حتى 20 في الدقيقة لكل متجر حتى في الذروة | عدّاد M10 |
| الأمان | `shopper_token` بـ ES256، وصالح 24 ساعة، ومحفوظ في Keychain وKeystore. والـ cookies المرحّلة للتبادل عبر TLS فقط، ولا تُخزَّن ولا تُسجَّل، واختبار آلي يتحقق من خلو السجلات منها. وفحص الملكية في كل طلب تفاصيل. والرد 404 لا 403. ولا رمز تاجر على الجهاز | مراجعة أمنية + اختبار |
| الخصوصية | الموقع يُطلب عند ضغط المتسوق فقط، ولا يغادر الجهاز إلا إلى نطاق المتجر في `locations`. ولا بيانات شخصية في التحليلات. وحذف بيانات المنصة خلال 24 ساعة من طلب الحذف | |
| العربية وRTL | الخط الزمني والخطوات تنعكس. والجوال ورقم الطلب ورقم التتبع والعنوان المختصر معزولة LTR. والتواريخ ميلادية | لقطات ذهبية بالعربية والإنجليزية |
| إمكانية الوصول | كل خطوة تُقرأ «الخطوة 4 من 5، طلبك في الطريق إليك، الحالية». وأزرار النسخ لها تسميات. ورقاقة الحالة لا تعتمد على اللون وحده. وأهداف اللمس 44pt و48dp. وتكبير الخط حتى 200% | فحص VoiceOver وTalkBack |
| المراقبة | معدل نجاح الدخول (الهدف 95% فأكثر من المحاولات غير الملغاة)، ومعدل `SHOPPER_VERIFY_UNAVAILABLE`، و`order_status_unmapped`، ونسبة الردود `stale` | لوحة M08 وتنبيهات M12 |

## 8. الاعتماديات والمجهول

### 8.1 التجارب المرتبطة

| SPK | ما يحسمه هنا | ما يُبنى قبله |
|---|---|---|
| SPK-05 | وصول جلسة `sso.zid.store` إلى نطاق المتجر، وظهورها في `login-status` و`account` على iOS وأندرويد | غلاف الـ WebView وجسر الـ cookies واختبارهما بجلسة يدوية |
| SPK-06 | الدخول الأصلي بـ OTP وTurnstile وموافقة زد | لا شيء (Should) |
| SPK-07 | مخطط عناصر `account/orders`، وتطابق `account.id` مع `customer.id` في Merchant API، ورابط الطلب المفرد في حساب الويب، وظهور طلبات الزائر بعد الدخول | المحوّل، وشاشة التفاصيل بعقد 5.2 وبيانات وهمية، والخريطة |
| SPK-12 | `settings` و`storewhatsapp/widget` و`address_field_settings` (N\*) | خلف أعلام، وقيم افتراضية من M11 |
| مقترح: إضافة إلى SPK-07 | هل يقبل نطاق المتجر طلب `GET account` من خادم المنصة بـ cookie المتسوق، أم يعترضه Cloudflare (`__cf_bm`)؟ | تبادل الجلسة مع البديل `SHOPPER_VERIFY_UNAVAILABLE` |

### 8.2 ملاحظات على ADR-0003 وADR-0005 والـ PRD

1. **ADR-0003، البند 5** يشترط التحقق من أن الطلب يخص العميل المسجل، ولا يحدد كيف يعرف الخادم هوية المتسوق. والمقترح هنا ترحيل cookie جلسة زد إلى الخادم مرة واحدة للتحقق بـ `GET account`، ثم إصدار رمز خاص بالمنصة. وهذا قرار أمني يحتاج اعتمادًا (Q1)، لأن الخادم يمسك لحظيًا اعتمادًا يمثل المتسوق في المتجر.
2. **ADR-0005** لا يحدد وحدة لهوية المتسوق. وجلسة المتسوق يستهلكها `Orders` و`Push` معًا. والمقترح وحدة `Shoppers` (Q4).
3. **التوثيق تغيّر منذ البحث**: صفحات التحقق من OTP (مثل [Verify SMS Login](https://docs.zid.sa/verify-sms-login-38267137e0)) صارت موثقة بحقولها، بعد أن كانت تعيد 404 في ملاحظات البحث. لكن صفحة Mobile Apps ما زالت تقول إن الدخول صفحة ويب فقط. فالتعارض في توثيق زد قائم، وSPK-06 يبقى ضروريًا لموافقة زد.
4. **تهجئة الحالات غير متسقة** في توثيق زد: `inDelivery` و`cancelled` في الـ webhooks، مقابل `indelivery` و`canceled` في `List Orders`. والخريطة هنا تتسامح مع الصيغتين.
5. **معرّف السعودية**: القراءة الحية `184`، ومثال التوثيق `183`. فلا يُكتب في الكود.
6. **حذف الحساب**: Google Play يشترط رابط ويب لطلب الحذف إلى جانب المسار داخل التطبيق. وهذا خارج نطاق PRD الحالي، ويحتاج صفحة تملكها المنصة لكل تطبيق (Q6).

### 8.3 قرارات مفتوحة للمشرف

| # | السؤال | التوصية |
|---|---|---|
| Q1 | هل يُعتمد ترحيل cookie المتسوق إلى الخادم للتحقق من هويته مرة واحدة لكل جلسة؟ | نعم، بشروط القسم 3.3.1 والقسم 7، مع إبلاغ زد بالنمط |
| Q2 | مزوّد الخرائط ومالك المفتاح: Google Maps بمفتاح للمنصة مقيد بمعرّفات كل تطبيق (Google تصف استخدام SDK الجوال بأنه غير محدود لكنه يتطلب حساب فوترة، [Maps SDK for Android](https://developers.google.com/maps/documentation/android-sdk/usage-and-billing))، أم مفتاح لكل تاجر؟ | مفتاح واحد للمنصة يحقنه M13 وقت البناء |
| Q3 | إن جاءت عناصر `account/orders` فقيرة: قائمة عبر الـ BFF (تستهلك حد Merchant API)، أم WebView لصفحة الطلبات؟ | الـ BFF مع ذاكرة 60 ثانية |
| Q4 | أين تعيش هوية المتسوق في الخادم؟ | وحدة `Shoppers` صغيرة، وتحديث ADR-0005 |
| Q5 | هل يدخل «طلب استرجاع عبر WhatsApp بقالب» في الإصدار الأول رغم أن F-S22 أولويته Could؟ | نعم، فتكلفته يوم واحد ويعالج شكوى موثقة |
| Q6 | رابط الويب لطلب حذف الحساب (Google Play): صفحة تملكها المنصة لكل متجر، تشرح الحذف من التطبيق وتتيح طلبه بالجوال؟ | نعم، ويملكها M14 وتُضاف إلى قائمة المتجر في M13 |

## 9. تقسيم العمل

الحجم: S حتى 3 أيام، وM حتى أسبوع، وL حتى أسبوعين.

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| ACC-01 | تبويب الحساب بحالتي الزائر والمسجل (S) | Must | نعم | M01 (الموجّه) |
| ACC-02 | الدخول عبر WebView: المزامنة في الاتجاهين، وكشف الإتمام، ونتيجة `openLogin` (M) | Must | ينتظر SPK-05 | SHOP-01 من M04، وM01 |
| ACC-03 | دورة الجلسة: `SessionController`، والتحقق الدوري، والانتهاء، والخروج ومسح البيانات (M) | Must | نعم (يُختبر بجلسة مضبوطة يدويًا) | ACC-02 للتكامل |
| ACC-04 | الـ BFF: تبادل الجلسة، ورمز المتسوق، و`shopper_sessions`، وأحداث الربط لـ M06 (M) | Must | ينتظر M12 | M12 (رمز الجهاز ومفاتيح التوقيع وتنقية السجلات) |
| ACC-05 | الملف الشخصي عرضًا وتعديلًا (S) | Must | نعم | ACC-03 |
| ACC-06 | الدول والمدن وتخزينها، وقائمة العناوين ونموذجها بحقول العنوان الوطني والإلزام (M) | Must | نعم | SHOP-01 من M04 |
| ACC-07 | دبوس الخريطة، و`locations?lat&lng`، وتحليل العنوان الوطني، وإذن الموقع في سياقه (M) | Must | نعم (والقرار Q2 قبل الدمج) | ACC-06 |
| ACC-08 | حذف الحساب في التطبيق والخادم (M) | Must | نعم (الجزء الخاص بالتطبيق) | ACC-03، وACC-04 لجزء الخادم |
| ACC-09 | السياسات الأصلية بالتخزين والتنقية (S) | Must | نعم | SHOP-01 من M04 |
| ACC-10 | قائمة الطلبات بالمحوّل والمسار البديل خلف علم (M) | Must | ينتظر SPK-07 | ACC-03 |
| ACC-11 | الـ BFF: تفاصيل الطلب عبر M10، والملكية، والتطبيع، وخريطة الحالات، والتخزين والإبطال، و`order_status_events` (L) | Must | ينتظر M10 | M10 (`getOrder` و`OrderStatusChanged`)، وACC-04، وSPK-07 للتحقق النهائي من الملكية |
| ACC-12 | شاشة تفاصيل الطلب: الخط الزمني، والتتبع، والمنتجات، والفاتورة، والبديل WebView (M) | Must | نعم (بعقد 5.2 وبيانات وهمية) | ACC-11 للتكامل |
| ACC-13 | WhatsApp: التطبيع، والقوالب، ونقاط الظهور (S) | Must | نعم | M11 (قيمة وهمية حتى ذلك) |
| ACC-14 | أحداث التحليلات للوحدة (S) | Must | ينتظر M08 | تصنيف M08 |
| ACC-15 | دخول OTP أصلي وقفل البصمة (L) | Should | ينتظر SPK-06 | ACC-02، وACC-03 |
| ACC-16 | «اشترِ مجددًا» من تفاصيل الطلب (M) | Should | ينتظر SPK-07 | ACC-12، وM04 |
| ACC-17 | طلب استرجاع بقالب WhatsApp، ثم المعالج الأصلي لاحقًا (S للمرحلة الأولى) | Could | نعم (المرحلة الأولى) | ACC-13 |
| ACC-18 | ملخص النقاط والمحفظة والإحالة في رأس الحساب (M) | Could | ينتظر SPK-12 | ACC-01 |

### معايير القبول لأهم القصص

**ACC-02: الدخول**
1. **بافتراض** زائر في سلته منتجان، **عندما** يُتم الدخول بـ OTP في صفحة زد وتعود الصفحة إلى نطاق المتجر، **إذن** تُنسخ cookies النطاق إلى مخزن `dio`، ويعيد `login-status` القيمة `is_authenticated = true`، وتُغلق الشاشة خلال ثانيتين، وتظهر في السلة المنتجات نفسها أو أكثر.
2. **بافتراض** أن الدخول بدأ من ورقة الإتمام، **عندما** ينجح، **إذن** تُفتح صفحة الدفع `/checkout` مباشرة دون خطوة إضافية.
3. **بافتراض** أن المتسوق ضغط زر الإغلاق أثناء صفحة SSO، **عندما** تُغلق الشاشة، **إذن** تبقى الحالة `guest`، والسلة كما هي، ويُرسل `login_cancel`.

**ACC-03: الخروج والانتهاء**
1. **بافتراض** متسوق مسجل، **عندما** يؤكد الخروج، **إذن** يُرسل `POST auth/logout` و`DELETE /v1/shopper/session`، وتُمسح cookies النطاق عدا `locale`، ويُمسح تخزين الـ WebView، ويظهر تبويب الحساب بحالة الزائر، ويعود عدّاد السلة من سلة جديدة.
2. **بافتراض** أن جلسة زد انتهت، **عندما** يفتح المتسوق «عناويني» ويرد الخادم 401 `ERROR_SESSION_INVALID`، **إذن** تظهر ورقة «انتهت جلستك» مرة واحدة، وبعد الدخول تُفتح العناوين نفسها.
3. **بافتراض** عدم وجود اتصال، **عندما** يؤكد الخروج، **إذن** يكتمل الخروج المحلي فورًا، ويُرسل الطلبان عند عودة الاتصال.

**ACC-04: تبادل الجلسة**
1. **بافتراض** cookie جلسة صالحة لعميل رقمه 1441، **عندما** يُرسل التطبيق `POST /v1/shopper/session`، **إذن** يرد الخادم 201 برمز فيه `sub = 1441`، ولا تظهر قيمة الـ cookie في أي سجل أو أداة مراقبة، وهذا يتحقق منه اختبار آلي.
2. **بافتراض** cookie منتهية، **عندما** تُرسل، **إذن** يرد الخادم 401 `ZID_SESSION_INVALID`.
3. **بافتراض** أن المتجر رد على الخادم بتحدي Cloudflare، **عندما** يكتمل الطلب، **إذن** يرد الخادم 503 `SHOPPER_VERIFY_UNAVAILABLE`، ويبقى المتسوق مسجلًا في التطبيق، وتعرض تفاصيل الطلب زر البديل.

**ACC-07: دبوس الخريطة**
1. **بافتراض** أن المتسوق حرّك الخريطة إلى (26.28, 50.2) وتوقف، **عندما** تمضي 600 ms، **إذن** يُرسل `GET locations?lat=26.28&lng=50.2`، وبعد «تأكيد الموقع» تُملأ المدينة «الخبر»، والحي «حي الخبر الجنوبية»، والعنوان المختصر `EEDA4458`، والرمز البريدي `34621`، وكلها قابلة للتعديل.
2. **بافتراض** أن `cityId` غير موجود في المدن المخزنة، **عندما** يؤكد، **إذن** تُطابق المدينة بالاسم، فإن فشلت يُفتح منتقي المدينة.
3. **بافتراض** رفض إذن الموقع، **عندما** يفتح الخريطة، **إذن** تتمركز على المدينة المختارة أو الرياض، ويستطيع تحريكها يدويًا.

**ACC-08: حذف الحساب**
1. **بافتراض** متسوق مسجل، **عندما** يؤشر «أفهم أن الحذف نهائي» ويضغط «احذف حسابي»، **إذن** يُرسل `DELETE account` ثم `DELETE /v1/shopper/me`، ويخرج المتسوق محليًا، وتظهر «تم حذف حسابك».
2. **بافتراض** أن `DELETE account` رد 401، **عندما** يُكمل المتسوق الدخول، **إذن** يعود إلى شاشة التأكيد نفسها دون أن يُحذف شيء.
3. **بافتراض** أن زد حذفت الحساب وفشل طلب المنصة، **عندما** يعود الاتصال، **إذن** يُعاد الطلب من الطابور، ويكتمل الحذف في الخادم خلال 24 ساعة.

**ACC-09: السياسات**
1. **بافتراض** أن `refund-exchange-policy` يعيد 200، **عندما** يفتحها المتسوق مرة ثم يفقد الاتصال ويفتحها ثانية، **إذن** تُعرض النسخة المحفوظة مع تاريخها.
2. **بافتراض** أن `licensing` يعيد 404، **عندما** تُعرض قائمة السياسات، **إذن** لا تظهر فيها.

**ACC-11: تفاصيل الطلب في الخادم**
1. **بافتراض** طلب `customer.id = 1441` ورمز متسوق `sub = 1441`، **عندما** يُطلب، **إذن** يُرد 200 بالحالة المطبّعة والخط الزمني، ويُخزَّن 60 ثانية.
2. **بافتراض** رمز متسوق `sub = 2000` للطلب نفسه، **عندما** يُطلب، **إذن** يُرد 404 `ORDER_NOT_FOUND`، ولا يُستدعى Merchant API إن كان الطلب في الذاكرة.
3. **بافتراض** وصول `order.status.update` بالحالة `inDelivery`، **عندما** يُعالج، **إذن** يُبطل مفتاح الذاكرة، ويُضاف حدث إلى `order_status_events`، والطلب التالي يعيد `status.key = in_delivery`.
4. **بافتراض** أن Merchant API رد 429 ويوجد في الذاكرة نسخة عمرها 10 دقائق، **عندما** يُطلب الطلب، **إذن** يُرد 200 بالنسخة و`stale: true`.

**ACC-12 وACC-13: الشاشة وWhatsApp**
1. **بافتراض** طلب حالته `preparing` و`display_status.name = "تم التغليف"`، **عندما** تُفتح الشاشة، **إذن** تكون الخطوة 2 «جارٍ تجهيز طلبك» حالية وتحتها «تم التغليف»، والخطوة 1 مكتملة بوقت `created_at`.
2. **بافتراض** أن رقم WhatsApp للمتجر `0501234567`، **عندما** يضغط المتسوق «تواصل مع المتجر» في الطلب `rEXuB20myr`، **إذن** يُفتح `https://wa.me/966501234567?text=` وفيه نص «مرحبًا، لدي استفسار عن طلبي رقم rEXuB20myr» مرمَّزًا.
3. **بافتراض** أن `tracking.url` موجود، **عندما** يضغط «تتبع الشحنة»، **إذن** يُفتح الرابط في متصفح داخل التطبيق، ويُرسل `track_shipment_open`.

## 10. المصادر

- زد: [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)، و[Login Status](https://docs.zid.sa/login-status-38265898e0)، و[Logout](https://docs.zid.sa/logout-25508912e0)، و[SMS Login](https://docs.zid.sa/sms-login-38265943e0)، و[Verify SMS Login](https://docs.zid.sa/verify-sms-login-38267137e0)، و[Get Profile](https://docs.zid.sa/get-profile-26363082e0)، و[Update Customer Profile](https://docs.zid.sa/update-customer-profile-26364098e0)، و[Delete Account](https://docs.zid.sa/delete-account-26363588e0)، و[Create an Address](https://docs.zid.sa/create-an-address-26572341e0)، و[Update an Existing Address](https://docs.zid.sa/update-an-existing-address-26572838e0)، و[Get Address Form Schema](https://docs.zid.sa/get-address-form-schema-26761547e0)، و[Get Cities By Country](https://docs.zid.sa/get-cities-by-country-26362508e0)، و[Pages](https://docs.zid.sa/pages-26361426e0)، و[Get Orders](https://docs.zid.sa/get-orders-26722142e0)، و[View Order](https://docs.zid.sa/view-order-12479054e0)، و[List Orders](https://docs.zid.sa/list-of-orders)، و[Webhooks](https://docs.zid.sa/webhooks)، و[Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0)، و[Reverse Orders](https://docs.zid.sa/reverse-orders-1810994f0)، و[Customer’s Current Points Balance](https://docs.zid.sa/customers-current-points-balance-26324317e0)، و[Customer Wallet & Cashback](https://docs.zid.sa/customer-wallet-cashback-2072778m0).
- قراءات حية (2026-11-10): [ppowerstore /auth/login](https://ppowerstore.com/auth/login)، و[login-status](https://ppowerstore.com/api/v1/auth/login-status)، و[account/orders للزائر](https://ppowerstore.com/api/v1/account/orders)، و[countries](https://ppowerstore.com/api/v1/countries)، و[cities](https://ppowerstore.com/api/v1/countries/184/cities)، و[locations](https://ppowerstore.com/api/v1/locations?lat=26.28&lng=50.2)، و[refund-exchange-policy](https://ppowerstore.com/api/v1/pages/refund-exchange-policy)، و[mahasen settings](https://mahasen.com/api/v1/settings)، و[mahasen WhatsApp widget](https://mahasen.com/api/v1/storewhatsapp/widget)، و[checkout/guest](https://ppowerstore.com/checkout/guest).
- المتاجر: [Apple: Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/)، و[Google Play: account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111)، و[Google Maps SDK for Android: usage and billing](https://developers.google.com/maps/documentation/android-sdk/usage-and-billing).
- pub.dev: [webview_flutter 4.14.1](https://pub.dev/packages/webview_flutter)، و[flutter_secure_storage 11.2.0](https://pub.dev/packages/flutter_secure_storage)، و[google_maps_flutter 2.19.0](https://pub.dev/packages/google_maps_flutter)، و[geolocator 14.1.2](https://pub.dev/packages/geolocator)، و[local_auth 3.0.2](https://pub.dev/packages/local_auth)، و[pinput 7.0.0](https://pub.dev/packages/pinput)، و[url_launcher 6.3.3](https://pub.dev/packages/url_launcher).
- تجربة المستخدم: [Baymard, Checkout UX](https://baymard.com/blog/current-state-of-checkout-ux)، و[PPC Land / Adobe](https://ppc.land/adobe-finds-72-of-shoppers-delete-retail-apps-after-one-use/)، و[Play: Reefi](https://play.google.com/store/apps/details?id=com.salla.reefi&hl=ar&gl=SA).
- ملاحظات البحث: `research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md`، و`mobile_shopping_ux.md`، و`local_builders_teardown.md`، و`research_notes/جدوى منصة تطبيقات متاجر زد/zid_api_headless.md`، و`reports/مزايا وتخصيص تطبيقات متاجر زد.md`.
