# M06: الإشعارات

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter، وLaravel (وحدة `Push`)، وNext.js (الشاشات يرسمها M15)، وخدمات خارجية: FCM HTTP v1، وAPNs، وFirebase Management API، وCloud Resource Manager |
| المتطلبات | F-S14 (Must)، وF-M07 (Must)، وF-S09 (طلب الإذن بعد الطلب)، وF-M11 (فتح الإشعارات)، وF-P01 (صحة الإشعارات في لوحة الإدارة)، وF-S16 (Should) |
| القرارات | ADR-0008، وADR-0007، وADR-0002، وADR-0005، وADR-0010 |
| تعتمد على | M01 (تهيئة Firebase في الإقلاع، ونقطة الدخول، والتخزين المحلي، والأعلام)، وM05 (التحقق من هوية العميل من جلسة زد عبر الـ BFF، وشاشة تفاصيل الطلب)، وM07 (صيغة الرابط الذي يحمله الإشعار، والموجّه)، وM08 (تصنيف الأحداث ونموذج النسبة)، وM10 (استقبال webhooks زد وإعادة جلب الكيانات من Merchant API)، وM12 (تعدد المستأجرين، وخزنة الأسرار، والمراقبة، واصطلاحات الـ API)، وM13 (ملفات Firebase في البناء، وهدف Notification Service Extension، والـ entitlements، وأيقونة الإشعار)، وM14 (جمع مفتاح APNs من التاجر)، وM15 (رسم الشاشات) |
| بادئة القصص | PUSH |

## 1. الغرض والنطاق

الوحدة توصل الإشعار من المنصة إلى جهاز المتسوق وتقيس أثره. تبدأ بتجهيز Firebase وAPNs لكل تاجر، ثم تسجيل الجهاز وطلب الإذن في سياقه، ثم الإرسال من الحملات والآليات التلقائية، وتنتهي بإحصاءات الإرسال والفتح والتحويل. كل ذلك دون أن يملك التاجر حسابًا في أي خدمة إشعارات (ADR-0008).

### داخل الإصدار الأول (Must)

| المجال | ما يُبنى |
|---|---|
| التجهيز | إنشاء مشاريع Firebase وتسجيل تطبيقَي كل تاجر آليًا عبر Firebase Management API، وتجميع حتى 14 تاجرًا (28 تطبيقًا) في المشروع الواحد. واستلام مفتاح APNs `.p8` من التاجر وفحصه، ثم رفعه يدويًا في Firebase Console بمهمة تشغيل موثقة، لأنه لا يوجد API لذلك (القسم 3.1). |
| iOS | هدف Notification Service Extension لعرض الصورة، يدخل قالب البناء في M13. |
| الجهاز | إذن الإشعارات في سياقه (بعد أول طلب، وعند «نبهني»، ومن مركز التفضيلات)، وقنوات أندرويد، ودورة حياة التسجيل (FID أو token)، والعرض في المقدمة، وفتح الرابط من الإشعار عبر M07، ومركز تفضيلات بالفئات. |
| الهوية | ربط الجهاز بالعميل بعد الدخول وفكّه عند الخروج، وربط الطلب بالجهاز عند تأكيده، ومنه يصل إشعار الحالة للزائر أيضًا. |
| الإرسال | الحملات فورية أو مجدولة بشرائح بسيطة، ونص بلغتين يُختار حسب لغة التطبيق، وصورة، ورابط داخلي، وساعات هدوء، وحدود تكرار. |
| الآليات | حالة الطلب من `order.status.update`، والسلة المتروكة من `abandoned_cart.created` بخطوات مؤجلة تُلغى عند الإتمام. |
| البنية | طوابير Laravel وHorizon، والإرسال المتوازي إلى FCM HTTP v1، ومعالجة الأخطاء وإعادة المحاولة، وتنظيف السجلات. |
| القياس | الإرسال والفتح والتحويل بنافذة نسبة 24 ساعة، والإحصاءات التي تعرضها M15، وصحة الإشعارات لكل تاجر في لوحة الإدارة. |

### لاحقًا (Should وCould)
تفصيلها المختصر في القسم 3.14.
- **Should**: رسالة الترحيب من `customer.create`، وتنبيهات عودة المخزون وانخفاض السعر (F-S16، تنتظر SPK-08)، وتذكير محلي بالسلة للزائر غير المعرّف، وإحصاء الوصول (Delivery)، وكتابة نصوص الإشعار بالذكاء الاصطناعي (F-M12).
- **Could**: صندوق إشعارات داخل التطبيق، واختبار A/B للنصوص، وأصوات مخصصة لكل نوع، وتوقيت الإرسال الأمثل لكل جهاز، وLive Activities (F-S19).

### خارج مسؤولية الوحدة
- صيغة الروابط والموجّه الذي يفتح الشاشة: M07.
- تصنيف الأحداث الموحّد وتعريف الإيراد ونموذج النسبة النهائي: M08. وM06 يزوّده بالفتح والإرسال.
- الاشتراك في webhooks زد واستقبالها والتحقق منها وحدود Merchant API: M10.
- إنشاء هدف الـ extension في Xcode وتوقيعه وتسجيل App IDs: M13.
- واجهة معالج جمع مفتاح APNs: M14. والرسائل عبر SMS وWhatsApp والبريد ليست في المنتج.
- مكوّن الطلب في السياق العام للأذونات الأخرى (الكاميرا، والموقع): M09، ويعيد استخدام نمط هذه الوحدة.

## 2. المكونات حسب الطبقة

### 2.1 Firebase وAPNs

**استراتيجية المشاريع**

| البند | القرار | المصدر أو السبب |
|---|---|---|
| الحد | 30 تطبيقًا لكل مشروع، تُحسب فيها تطبيقات Apple وأندرويد والويب. ويمكن طلب زيادته «في الحالات النادرة» على خطة Blaze فقط | [Firebase FAQ](https://firebase.google.com/support/faq) |
| السعة التشغيلية | 14 تاجرًا (28 تطبيقًا) لكل مشروع، ويبقى مقعدان احتياطًا لإعادة تسجيل تطبيق (تغيير معرّف حزمة) دون نقل التاجر | قرار هذه الوحدة. يخالف رقم ADR-0008 (15) بهامش، انظر القسم 8 |
| ما نستخدمه من Firebase | FCM فقط. لا Analytics ولا Crashlytics ولا Remote Config، فتراجع الأداء بعد 30 تطبيقًا «خاصة في Google Analytics» لا يمسنا | [Firebase FAQ](https://firebase.google.com/support/faq)، وADR-0006، وSentry في M12 |
| حصة إنشاء المشاريع | محدودة لكل حساب («نحو 5 إلى 10» على Spark)، والحذف يبقى محسوبًا 30 يومًا. لذلك نطلب زيادة الحصة مسبقًا، ولا ننشئ مشروعًا لكل تاجر | [Firebase FAQ](https://firebase.google.com/support/faq) |
| حصة الإرسال | 600 ألف رسالة في الدقيقة لكل مشروع افتراضيًا، والتجار في المشروع الواحد يتشاركونها | [FCM Throttling and Quotas](https://firebase.google.com/docs/cloud-messaging/throttling-and-quotas) |
| التسمية | `intishar-push-p001`، و`intishar-push-p002`… داخل مجلد GCP واحد `push-prod` في منظمة المنصة | — |
| الحسابات الخدمية | حسابان: `push-provisioner` بصلاحية إنشاء المشاريع على المجلد وإدارة Firebase، و`push-sender` بدور Firebase Cloud Messaging Admin على كل مشروع. وكلاهما في خزنة M12 | فصل صلاحية الإنشاء عن صلاحية الإرسال |

**الأتمتة عبر Firebase Management API** ([سير العمل الرسمي](https://firebase.google.com/docs/projects/api/workflow_set-up-and-manage-project)):

| الخطوة | الاستدعاء | ملاحظة |
|---|---|---|
| إنشاء مشروع GCP | Cloud Resource Manager `projects.create` مع `parent` = المجلد | صفحة Firebase تحيل إليه ولا تشرحه، ولا تذكر شرط وجود مجلد أو منظمة لحساب خدمي. يُتحقق منه في PUSH-01 |
| تفعيل الخدمات | Service Usage `services.enable` لـ `firebase.googleapis.com` و`fcm.googleapis.com` و`firebaseinstallations.googleapis.com` | — |
| إضافة Firebase | `POST projects/{id}:addFirebase` | يعيد Operation، ويلزم انتظار اكتمالها قبل أي استدعاء آخر |
| تسجيل iOS | `projects.iosApps.create` مع `bundleId` (إلزامي) و`displayName` | يعيد Operation ثم `IosApp.appId` |
| تسجيل أندرويد | `projects.androidApps.create` مع `packageName` | البصمة `sha.create` لا تلزم لـ FCM |
| ملفات الإعداد | `projects.iosApps.getConfig` و`projects.androidApps.getConfig` | المحتوى base64، يُخزَّن ويسلَّم لـ M13 |
| متابعة العمليات | `operations.get` حتى `done = true` | العمليات المكتملة تُحذف آليًا |

**APNs**
- مفتاح واحد `.p8` من فريق Apple الخاص بكل تاجر (ADR-0007)، يُرفع لتطبيق iOS الخاص به في إعدادات Cloud Messaging مع Key ID وTeam ID.
- منذ فبراير 2025 يمكن تقييد المفتاح ببيئة (team-scoped)، أو ربطه بمعرّف حزمة واحد (topic-specific). والمفاتيح القديمة تبقى صالحة لكل البيئات ([Apple News](https://developer.apple.com/news/?id=wy4tb0uo)، [Token-based connection](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns)).
- **التوصية**: مفتاح team-scoped لبيئة Production. TestFlight وApp Store يستخدمان Production، ونحن لا نوزع بناءات تطوير على حساب التاجر. وتجربة مفتاح topic-specific مع FCM بند في PUSH-02 قبل أن نوصي به.
- **لا يوجد API لرفع مفتاح APNs إلى Firebase.** طلب الميزة مفتوح منذ 31 مايو 2023 بلا رد من الفريق ([firebase-admin-node#2204](https://github.com/firebase/firebase-admin-node/issues/2204)). لذلك الرفع خطوة تشغيل يدوية من فريق المنصة، مرة لكل تاجر وعند تدوير المفتاح، مع فحص آلي قبلها وبعدها (القسم 3.1).

**Notification Service Extension (للصورة في iOS)**
- يلزم هدف NSE لعرض الصورة، مع `mutable-content: 1` و`apns.fcm_options.image`. وحجم الصورة حتى 1MB، ويجب أن ينتهي رابطها بامتداد صحيح ([FCM: Send an image](https://firebase.google.com/docs/cloud-messaging/ios/send-image)).
- يُضاف الهدف `NotificationService` مرة واحدة إلى مشروع `ios/` في قاعدة الكود (ADR-0002). وفيه ملف Swift واحد يستدعي `Messaging.serviceExtension().populateNotificationContent(_:withContentHandler:)`، ومكتبة FirebaseMessaging مضافة للهدف.
- **المطلوب من M13 لكل تاجر**:
  1. إعادة كتابة معرّف حزمة الـ extension إلى `{bundle_id}.NotificationService` مع المعرّف الرئيسي.
  2. تسجيل App ID للـ extension في فريق التاجر عبر App Store Connect API.
  3. ملف توقيع App Store للهدفين.
  4. `aps-environment = production` في entitlements التطبيق.
  5. `UIBackgroundModes` تشمل `remote-notification`.
  6. نسخة الهدف الدنيا مساوية للتطبيق.
- لا يلزم App Group، لأن الـ extension لا يشارك بيانات مع التطبيق في الإصدار الأول.

### 2.2 تطبيق Flutter

**الحزم** (الإصدارات من pub.dev في 2026-11-10):

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| [firebase_core](https://pub.dev/packages/firebase_core) | ^5.1.0 | التهيئة بملفات الإعداد التي يحقنها M13 |
| [firebase_messaging](https://pub.dev/packages/firebase_messaging) | ^17.0.1 | الإذن، والتسجيل (`register` و`onRegistered` في وضع FID)، والاستقبال. ويتطلب 17.0.0 أندرويد minSdk 24 وFirebase iOS SDK 13 |
| [flutter_local_notifications](https://pub.dev/packages/flutter_local_notifications) | ^23.0.0 | إنشاء قنوات أندرويد، وقراءة حالتها. ولاحقًا التذكير المحلي بالسلة |
| [app_settings](https://pub.dev/packages/app_settings) | ^9.0.1 | فتح إعدادات إشعارات التطبيق عند الرفض |
| [package_info_plus](https://pub.dev/packages/package_info_plus) | ^10.2.2 | `app_version` في سجل الجهاز |
| [device_info_plus](https://pub.dev/packages/device_info_plus) | ^13.3.0 | `os_version`، ورقم SDK أندرويد لقرار طلب الإذن |
| [shared_preferences](https://pub.dev/packages/shared_preferences) | ^2.5.6 | `device_id` وحالة الطلب في السياق |
| [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage) | ^11.2.0 | `device_secret` |

> آخر إصدارات `flutter_local_notifications` و`go_router` و`app_links` تتطلب Flutter 3.44 وDart 3.12 على الأقل. القرار في M01.

**الملفات** (داخل `lib/features/push/` بهيكل M01):

| الملف | المسؤولية |
|---|---|
| `push_service.dart` | التهيئة بعد أول إطار، والاشتراك في `onRegistered` و`onMessage` و`onMessageOpenedApp`، وقراءة `getInitialMessage()` |
| `device_registrar.dart` | مزامنة سجل الجهاز مع الخادم، مع إعادة المحاولة وعلم «مزامنة معلقة» محفوظ |
| `push_permission_controller.dart` | آلة حالة الإذن والطلب في السياق (القسم 3.3) |
| `push_priming_sheet.dart` | الورقة السفلية قبل نافذة النظام، بنصوص كل سياق |
| `notification_preferences_screen.dart` | مركز التفضيلات (القسم 3.7) |
| `android_channels.dart` | إنشاء القنوات بأسماء مترجمة |
| `push_open_handler.dart` | تحويل الإشعار المفتوح إلى حدث، وتسليم الرابط إلى M07 |
| `push_in_app_banner.dart` | شريط داخل التطبيق للإشعار في المقدمة |
| `order_link_reporter.dart` | إرسال رقم الطلب بعد التأكيد (القسم 3.5) |

**إعداد المنصات** (يولّده M13 من `tenant.json`):
- **iOS**:
  - `FirebaseMessagingInstallationIdEnabled = YES` في وضع FID، انظر قرار وضع التسجيل في القسم 8.
  - الـ entitlements وUIBackgroundModes كما في 2.1.
  - `setForegroundNotificationPresentationOptions(alert: false, badge: false, sound: false)`، لأن المقدمة يعرضها شريط داخل التطبيق.
- **أندرويد**:
  - `POST_NOTIFICATIONS` في الـ manifest، و`targetSdk` 35 أو أحدث.
  - `firebase_messaging_installation_id_enabled = true` في وضع FID.
  - `com.google.firebase.messaging.default_notification_channel_id = general`.
  - أيقونة أحادية اللون `ic_stat_notify` يولّدها M13 من الشعار، ولون `default_notification_color` من الهوية.

**قنوات أندرويد** (تُنشأ عند كل إقلاع، والعملية لا تتكرر إن وُجدت، وأسماؤها بلغة التطبيق):

| المعرّف | الاسم بالعربية | الأهمية | ما يُرسل عليها |
|---|---|---|---|
| `orders` | طلباتي | High | حالة الطلب |
| `offers` | العروض والتذكيرات | Default | الحملات، والسلة المتروكة، والترحيب |
| `price_alerts` | انخفاض الأسعار | Default | F-S16 لاحقًا |
| `stock_alerts` | عودة المنتجات | Default | F-S16 لاحقًا |
| `general` | عام | Default | احتياط لأي رسالة بلا قناة |

### 2.3 خادم Laravel (وحدة `Push`)

**الحزم**: [laravel/framework](https://packagist.org/packages/laravel/framework) ^13.0 (الإصدار 13 صدر في 2026-03-17)، و[laravel/horizon](https://packagist.org/packages/laravel/horizon) ^5.50، و[google/auth](https://packagist.org/packages/google/auth) ^1.55 لرموز OAuth، وGuzzle 7 بـ HTTP/2.

**لماذا ناقل خاص بدل kreait/firebase-php؟** حزمة [kreait/firebase-php](https://github.com/beste/firebase-php) 8.6 لا تدعم الحقل `fid` في الرسالة، ولا تضبط التوازي (تستخدم افتراضي Guzzle وهو 25). أما FCM فقد جعل `token` مهجورًا لصالح `fid`، مع قبول FID في `token` أثناء المرحلة الانتقالية ([FCM v1 Message](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)). الناقل الخاص نحو 300 سطر، ويعطينا تحكمًا في الهدف والتوازي وتفسير الأخطاء. ويبقى kreait بديلًا مقبولًا خلف الواجهة نفسها.

| المكوّن | المسؤولية |
|---|---|
| `Provisioning\FirebaseProvisioner` | إنشاء المشاريع وتسجيل التطبيقات وجلب الإعداد (القسم 3.1) |
| `Provisioning\ProjectPool` | اختيار مشروع له سعة، بقفل صف |
| `Provisioning\ApnsKeyService` | فحص المفتاح وحفظه في الخزنة ومتابعة حالة الرفع |
| `Devices\DeviceRegistry` | التسجيل والتحديث والهوية وربط الطلبات |
| `Devices\PreferenceService` | تفضيلات الفئات |
| `Audience\AudienceResolver` | تحويل تعريف الشريحة إلى مؤشر (cursor) على الأجهزة |
| `Campaigns\CampaignService` | الإنشاء والتحقق والجدولة والإلغاء والإرسال التجريبي |
| `Automations\OrderStatusAutomation` | القسم 3.9 |
| `Automations\AbandonedCartAutomation` | القسم 3.10 |
| `Delivery\DeliveryPolicy` | ساعات الهدوء، وحدود التكرار، والتفضيلات، والتقادم، ومنع التكرار |
| `Delivery\MessageComposer` | اختيار اللغة، والمتغيرات، وبناء حمولة FCM |
| `Transport\FcmHttpV1Transport` | الإرسال المتوازي وتفسير الأخطاء (القسم 3.11) |
| `Stats\PushStatsAggregator` | تجميع الإحصاءات والنسبة |
| `Console\DispatchDuePush` | يعمل كل دقيقة: الحملات المجدولة وخطوات السلة المستحقة |
| `Console\PushJanitor` | يعمل يوميًا: التقادم والحذف وتقسيم الجداول |

**الطوابير** (Horizon على Redis):

| الطابور | المحتوى | العمال (بداية) | المهلة |
|---|---|---|---|
| `push-transactional` | حالة الطلب، والإرسال التجريبي | 2 | 30 ث |
| `push-campaign` | دفعات الحملات وخطوات السلة | 4 | 120 ث |
| `push-maint` | التجهيز، والتنظيف، والتجميع | 1 | 600 ث |

### 2.4 لوحة التاجر ولوحة الإدارة (متطلبات يرسمها M15)

| الشاشة | العناصر الإلزامية | الحالات |
|---|---|---|
| قائمة الحملات | الاسم، والحالة (مسودة، ومجدولة، وقيد الإرسال، وأُرسلت، وأُلغيت، وفشلت)، وموعد الإرسال، والمرسَل، ونسبة الفتح، والطلبات، والإيراد. مع فلتر بالحالة، و«حملة جديدة»، ونسخ حملة | فارغة بشرح ودعوة، وتحميل، وخطأ |
| محرر الحملة | تبويبان للعربية والإنجليزية بعدّاد أحرف، والعربية إلزامية. ورفع صورة بفحص الحجم والنسبة، ومنتقي رابط من M07 (منتج، أو تصنيف، أو صفحة، أو رابط). ومنشئ الشريحة بعدد تقديري حي، والإرسال الآن أو بموعد بتوقيت الرياض. ومعاينة شكل الإشعار على iOS وأندرويد باللغتين، و«إرسال تجريبي إلى أجهزتي»، وتحذير ساعات الهدوء وحدود التكرار قبل التأكيد | تحقق مباشر من الحقول، وحالة «لا أجهزة تجريبية» |
| تفاصيل الحملة | قمع: المستهدف، ثم المستبعد بأسبابه، ثم المرسل، ثم الفاشل، ثم المفتوح، ثم الطلبات والإيراد. وتوزيع حسب المنصة واللغة. و«إلغاء» ما دامت مجدولة | «الإحصاء يتحدث كل 5 دقائق» |
| الآليات: حالة الطلب | مفتاح عام، ثم لكل حالة من الحالات الست: مفتاح، ونص بلغتين بمتغيرات تُدرج بنقرة، ومعاينة. والقيم الافتراضية جاهزة | — |
| الآليات: السلة المتروكة | مفتاح عام، وحتى 3 خطوات بتأخير (30 دقيقة إلى 7 أيام) ونص بلغتين. وحد أدنى لقيمة السلة، ونطاق المصدر. وإحصاء: سلال مستهدفة، ومرسل، ومفتوح، ومستعاد | — |
| الإعدادات | ساعات الهدوء العادية وساعات رمضان مع تفعيل آلي، وحدود التكرار ضمن مدى مسموح، واللغة الافتراضية، والأجهزة التجريبية مع إضافة جهاز بـ QR أو رمز | — |
| نظرة عامة (ضمن تحليلات M08) | المشتركون (الأجهزة المسموح لها)، ونسبة الموافقة، والمرسل في 30 يومًا، ونسبة الفتح، والإيراد المنسوب | — |
| لوحة الإدارة: صحة الإشعارات | لكل تاجر: المشروع، وتطبيقا iOS وأندرويد، وحالة مفتاح APNs، ومعدل الفشل في 24 ساعة حسب الرمز. ومهام «رفع مفتاح APNs» المفتوحة مع زر تنزيل المفتاح المسجَّل في التدقيق | تنبيه أحمر عند `THIRD_PARTY_AUTH_ERROR` |

## 3. التدفقات

### 3.1 تجهيز Firebase وAPNs لتاجر جديد

**أ. Firebase** (آلي بالكامل)

المحفّز: M14 يعلن أن هوية التطبيق جاهزة (معرّف الحزمة، واسم الحزمة، وTeam ID)، فتُطلق `ProvisionTenantPushJob(tenant_id)` على `push-maint`.
1. `ProjectPool` يختار مشروعًا نشطًا بسعة كافية، فيه `app_count` + 2 ≤ 28. ويُفضَّل الأكثر امتلاءً (`ORDER BY app_count DESC ... FOR UPDATE`).
2. إن لم يوجد مشروع: تُنشأ `CreateFirebaseProjectJob` لمشروع جديد بالخطوات التالية، ثم يُكمَل التجهيز.
   1. `projects.create`.
   2. تفعيل الخدمات.
   3. `addFirebase`.
   4. منح `push-sender` دوره.
   5. `status = active`.
3. `iosApps.create`، ثم انتظار العملية كل 5 ثوانٍ لمدة أقصاها دقيقتان، ثم حفظ `firebase_app_id`.
4. `androidApps.create` بالطريقة نفسها.
5. `getConfig` للتطبيقين. يُحفظ الملفان في تخزين كائنات خاص (`push/{tenant}/...`)، ويُحدَّث إعداد البناء الذي يقرؤه M13، ويُطلق حدث `PushProvisioned`.
6. تُفتح مهمة تشغيل «رفع مفتاح APNs» بحالة `pending`، إن كان المفتاح قد استُلم.

كل خطوة تفحص الحالة المخزنة قبل الاستدعاء، فإعادة تشغيل المهمة آمنة.

| الخطأ | السلوك |
|---|---|
| تجاوز حصة إنشاء المشاريع | `provisioning_blocked`، وتنبيه للإدارة لطلب زيادة الحصة. ولا يتأثر التجار الحاليون |
| فشل عملية Management API | إعادة المحاولة 3 مرات (بعد 1 و5 و30 دقيقة)، ثم مهمة يدوية |
| معرّف الحزمة مسجل في مشروع آخر | `ALREADY_EXISTS`، فتُفتح مهمة يدوية بلا حذف آلي |

**ب. مفتاح APNs** (نصف آلي)
1. في معالج M14 ينشئ التاجر المفتاح في Apple Developer، ثم يرفع ملف `.p8` ويكتب Key ID. وTeam ID معروف من حسابه.
2. `ApnsKeyService` يفحص الصيغة: PEM من نوع PKCS#8 لمنحنى P-256، وKey ID وTeam ID بعشرة أحرف لكل منهما.
3. **فحص مسبق مع APNs**:
   - يوقّع JWT بخوارزمية ES256، ثم يرسل `POST https://api.push.apple.com/3/device/{64 صفرًا}` مع `apns-topic` = معرّف الحزمة.
   - الرد `400 BadDeviceToken` يعني أن المفتاح والفريق صالحان.
   - الرد `403 InvalidProviderToken` يعني أن المفتاح يُرفض، وتُعرض رسالة عربية واضحة.
   - رموز الأخطاء من [Apple: Handling notification responses](https://developer.apple.com/documentation/usernotifications/handling-notification-responses-from-apns). أما سلوك الرمز الصفري فيُتحقق منه في PUSH-02.
4. يُحفظ المفتاح في الخزنة (M12) تحت `tenants/{id}/apns_p8`، ولا يُعرض للتاجر بعد ذلك.
5. في لوحة الإدارة يفتح موظف التشغيل المهمة، وفيها:
   - رابط صفحة Cloud Messaging للمشروع، ومعرّف الحزمة، وKey ID، وTeam ID.
   - زر «تنزيل المفتاح»، صالح 10 دقائق ومسجَّل في التدقيق.
   
   يرفع الموظف المفتاح في Firebase Console، ثم يضغط «تم الرفع»، فتصبح الحالة `uploaded`.
6. عند تسجيل أول جهاز iOS حقيقي، وهو جهاز الاختبار في TestFlight ضمن قائمة الإطلاق في M13 وM14:
   - يرسل الموظف إشعارًا تجريبيًا.
   - النجاح يجعل الحالة `verified`.
   - `THIRD_PARTY_AUTH_ERROR` يجعلها `failed` ويعيد فتح المهمة.
7. **تدوير المفتاح أو إلغاؤه**: فشل متكرر بـ `THIRD_PARTY_AUTH_ERROR` يوقف إرسال iOS للتاجر (القسم 3.11)، ويظهر للتاجر طلب مفتاح جديد في لوحته.

**SLA التشغيل**: رفع المفتاح خلال يوم عمل واحد من استلامه.

### 3.2 تسجيل الجهاز وتحديثه

1. M01 يهيئ Firebase أثناء الإقلاع من الملفات المحقونة. أما `PushService.init()` فيعمل بعد أول إطار، حتى لا يؤخر الرسم.
2. يُقرأ `device_id` من `shared_preferences`، أو يُنشأ UUIDv4 جديد إن لم يوجد. ولا يُستخدم keychain، حتى لا يبقى المعرّف بعد حذف التطبيق.
3. تُقرأ حالة الإذن بـ `getNotificationSettings()`.
   - على أندرويد 13 فأحدث، لا تفرّق الحزمة بين «لم يُسأل» و«رُفض» ([FCM Flutter client](https://firebase.google.com/docs/cloud-messaging/flutter/client)).
   - لذلك تُقرن الحالة بعلم محلي `push_os_prompted`: إن لم يُطلب الإذن من قبل، تُعامل `denied` على أنها `not_determined`.
4. وضع التسجيل:
   - **FID** (الافتراضي): الاشتراك في `onRegistered`، والـ SDK يستدعيه في مزامنات الإقلاع وعند تغيّر المعرّف.
   - **token** (احتياط): `getToken()` و`onTokenRefresh`.
   - على iOS تُستدعى العمليات بعد توفر `getAPNSToken()` كما يشترط الـ SDK.
5. تُنشأ قنوات أندرويد.
6. `DeviceRegistrar.sync()` يرسل `PUT /app/v1/push/devices/{device_id}` إذا تحقق أي مما يلي:
   - تغيّر معرّف التسجيل، أو الإذن، أو اللغة، أو نسخة التطبيق.
   - أو مرّ أكثر من 24 ساعة على آخر مزامنة. وهذا يحقق توصية Firebase بتحديث الطابع الزمني مع كل رفع ([Manage tokens](https://firebase.google.com/docs/cloud-messaging/manage-tokens)).
7. يُسجَّل الجهاز حتى دون إذن، لقياس نسبة الموافقة ولهوية الزائر. والإرسال لا يتم إلا لمن `permission_status` عنده `authorized` أو `provisional`.
8. عند عودة التطبيق إلى المقدمة (`resumed`) تُقرأ حالة الإذن من جديد، لأن المستخدم قد يغيّرها من الإعدادات. وتتم المزامنة إن تغيّرت.

| الخطأ | السلوك |
|---|---|
| لا شبكة | علم «مزامنة معلقة»، وإعادة المحاولة بعد 1 ثم 5 ثم 30 دقيقة، وعند الإقلاع التالي |
| `409 device_conflict`: معرّف الجهاز موجود والسر لا يطابق | يُولَّد `device_id` جديد ويُعاد التسجيل |
| `410 tenant_push_disabled`: مفتاح إيقاف من M12 | يتوقف التسجيل حتى الإقلاع التالي |

### 3.3 طلب الإذن في سياقه

**القاعدة**: لا تظهر نافذة النظام عند الفتح الأول، ولا دون ورقة تمهيد قبلها. والاستثناء الوحيد أن يضغط المستخدم مفتاحًا في مركز التفضيلات. والسبب أن متوسط الموافقة نحو 49% على iOS و53% على أندرويد، وأن الرسالة التي تشرح القيمة ترفعها ([Airship 2026](https://www.airship.com/mobile-app-push-notification-benchmarks-for-2026/))، ولأن إرشاد أندرويد يوصي بالطلب بعد فعل من المستخدم، مثل إرسال طلب ([Android: notification permission](https://developer.android.com/develop/ui/views/notifications/notification-permission)).

**السياقات**

| السياق | من يستدعيه | عنوان الورقة ونصها | الأولوية |
|---|---|---|---|
| `order_placed` | شاشة تأكيد الطلب (M04، F-S09) | «تابع طلبك لحظة بلحظة»: «نرسل لك تنبيهًا عند تجهيز طلبك وشحنه وتوصيله.» | Must |
| `back_in_stock` | زر «نبهني» على منتج نافد (M04، F-S05) | «نبلغك فور توفره»: «فعّل التنبيهات ليصلك إشعار عند عودة المنتج.» | Must (الطلب)، والاشتراك نفسه Should |
| `settings` | مفتاح في مركز التفضيلات | نافذة النظام مباشرة | Must |
| `wishlist_first` | أول إضافة إلى المفضلة | «نبلغك إن انخفض سعره» | Should |

**الخطوات**
1. الشاشة تستدعي `PushPermissionController.maybePrime(context)`.
2. إن كانت الحالة `authorized` أو `provisional`، ينتهي الطلب.
3. إن كانت `denied` والنظام لن يعرض النافذة:
   - على iOS بعد أي رفض.
   - وعلى أندرويد بعد رفضين، مع `shouldShowRequestPermissionRationale = false`.
   
   فلا يُعرض شيء إلا في سياق `settings`: رسالة «التنبيهات متوقفة من إعدادات الجهاز» مع زر يفتح الإعدادات بـ `app_settings`. وفي سياق `back_in_stock` يظهر سطر توضيح تحت الزر فقط.
4. **حد الورقة**: لا تُعرض إن عُرضت خلال 14 يومًا، أو بلغت 3 مرات. ويُستثنى `back_in_stock` لأنه نية صريحة، مع حد مرة واحدة في الجلسة.
5. تُعرض الورقة بزرين: «فعّل التنبيهات» و«ليس الآن». ويُسجَّل `push_permission_prompt_shown {context, kind: soft}`.
6. «فعّل التنبيهات»:
   - `requestPermission(alert: true, badge: true, sound: true)`، ثم `push_os_prompted = true`، وزيادة العدّاد.
   - يُسجَّل `push_permission_result {context, status}` وتتم مزامنة الجهاز.
   - عند الموافقة تُفعَّل كل الفئات افتراضيًا، ويُكمَل فعل السياق (مثل الاشتراك في التنبيه).
7. «ليس الآن» يحفظ وقت الرفض، ويسجل `push_permission_result {status: soft_declined}`.

### 3.4 ربط الجهاز بالعميل، والخروج

1. بعد نجاح الدخول ونجاح `GET account`، يطلق M05 `CustomerSignedIn(customer_id)`.
2. التطبيق يرسل `POST /app/v1/push/devices/{device_id}/identity`، ومعه:
   - رقم العميل المدّعى.
   - ترويسة `X-Zid-Session`: قيمة cookie الجلسة من مخزن الـ API نفسه (ADR-0003).
3. الخادم يستدعي `StorefrontIdentityVerifier` من M05.
   - المحقق يطلب `GET https://{store-domain}/api/v1/account/profile` بالـ cookie والترويسة `Zid-Client-Platform: mobile-app`، ثم يقارن `id`.
   - الـ cookie لا تُخزَّن ولا تُسجَّل.
4. **التطابق**:
   - `customer_id` و`customer_linked_at` على الجهاز.
   - إن تجاوز العميل 10 أجهزة نشطة، يُفك الأقدم.
   - حدث `DeviceIdentified`.
5. **عدم التطابق**: `403 identity_mismatch` بلا ربط. وعند تعذّر المحقق: `503`، والتطبيق يعيد المحاولة مع المزامنة التالية.
6. **الخروج**: M05 يطلق `CustomerSignedOut`، فيُرسل `DELETE .../identity`.
   - `customer_id = null`.
   - تُحذف روابط الطلبات التي جاءت عبر الهوية لهذا الجهاز.
   - التفضيلات تبقى، لأنها للجهاز لا للعميل.
7. **حذف الحساب**: M05 يطلق `CustomerDeleted`، فيُفك كل أجهزة العميل وتُحذف روابط طلباته فورًا.

> **الاعتماد على SPK-07**: هذا الربط لا يفيد إشعار الحالة إلا إذا طابق `customer.id` في Merchant API (وهو ما يحمله الـ webhook) رقم العميل في Storefront. ولهذا يوجد ربط الطلب بالجهاز (3.5) مسارًا مستقلًا يعمل في الحالتين.

### 3.5 ربط الطلب بالجهاز عند التأكيد

1. شاشة التأكيد في M04 تحصل على `order_id` (SPK-01)، فيستدعي `OrderLinkReporter.report(order_id)`. ويتم ذلك حتى قبل منح الإذن، لأن الإذن قد يأتي بعد ثوانٍ من ورقة `order_placed`.
2. `POST /app/v1/push/devices/{device_id}/orders`.
3. الخادم يجلب الطلب من M10. يُستخدم ما خُزّن من `order.create` إن وصل، وإلا `GET orders/{id}`. ثم يتحقق:
   - أن الطلب أُنشئ قبل 60 دقيقة على الأكثر.
   - أن روابطه أقل من 3 أجهزة.
   - أن الجهاز، إن كان معرّفًا، يخص عميل الطلب نفسه.
4. عند النجاح: صف في `push_order_links` بقيمة `linked_via = checkout`.
5. `404 order_not_found`: الطلب لم يظهر بعد في Merchant API. التطبيق يعيد بعد 10 ثم 30 ثم 90 ثانية.
6. بعد ذلك تُعرض ورقة `order_placed` إن لزمت (3.3).

### 3.6 استقبال الإشعار وفتحه

| حالة التطبيق | من يعرض | ما يحدث عند الضغط |
|---|---|---|
| مغلق | النظام، والصورة عبر NSE أو FCM | إقلاع بارد. بعد جاهزية الموجّه، يقرأ M01 `getInitialMessage()` ويسلّمه إلى `PushOpenHandler` بحالة `terminated` |
| في الخلفية | النظام | `onMessageOpenedApp`، ثم `PushOpenHandler` بحالة `background` |
| في المقدمة | `PushInAppBanner` لمدة 5 ثوانٍ، بلا إشعار نظام في المنصتين | الضغط يمرر إلى `PushOpenHandler` بحالة `foreground`. ويُسجَّل `push_received_foreground` |

`PushOpenHandler` يعمل بهذا الترتيب:
1. يتجاهل أي `mid` عولج من قبل (آخر 50 معرّفًا محفوظة).
2. يرسل `POST /app/v1/push/opens` دون انتظار، وفي طابور محلي عند انقطاع الشبكة.
3. يسجل `push_opened {mid, cid, kind, cat, app_state}` إلى M08.
4. يسلّم `data.link` إلى `DeepLinkCoordinator.handle(uri, source: push)` من M07، وM07 ينتظر نقطة الدخول في M01 في الإقلاع البارد.
5. إن كان الرابط فارغًا أو غير صالح، تُفتح الرئيسية ويُسجل M07 `deep_link_failed`.

وفي المقدمة، إن وصل `kind = order_status` لطلب معروض حاليًا، يُبطل M05 مزوّد الطلب ليُعاد جلبه، ويظهر الشريط أيضًا.

لا نرسل رسائل data-only في الإصدار الأول. لذلك لا يلزم `onBackgroundMessage`. وإن أُضيفت لاحقًا، فالمعالج دالة على المستوى الأعلى مع `@pragma('vm:entry-point')`، وفي isolate منفصل على أندرويد، ولا يتجاوز نحو 30 ثانية ([FCM Flutter receive](https://firebase.google.com/docs/cloud-messaging/flutter/receive)).

### 3.7 مركز التفضيلات

1. المدخل في شاشة الحساب (M05): «الإشعارات».
2. الشاشة تعرض:
   - **حالة النظام**:
     - إن كانت مرفوضة، يظهر شريط «التنبيهات متوقفة من إعدادات الجهاز» مع زر «افتح الإعدادات».
     - إن لم يُطلب الإذن بعد، يظهر زر «فعّل التنبيهات»، وهو سياق `settings`.
   - **مفاتيح الفئات**:
     - «طلباتي»، و«العروض والتذكيرات».
     - و«انخفاض الأسعار» و«عودة المنتجات»، ولا تظهران إلا عند تفعيل علم `push.alerts_enabled` (F-S16).
     - كل مفتاح عليه سطر يشرح ما يصل منه.
   - **على أندرويد**: إن أوقف المستخدم قناة من إعدادات النظام، يظهر مفتاحها مطفأً معطلًا مع «متوقفة من إعدادات الجهاز»، إن أمكن قراءة أهمية القناة.
3. التغيير يحدّث الحالة المحلية فورًا، ثم يرسل `PATCH .../preferences`. ويُحفظ في طابور محلي عند انقطاع الشبكة.
4. إطفاء «طلباتي» يعرض تأكيدًا: «لن تصلك تنبيهات حالة طلباتك».
5. حدث `push_preferences_changed {cat, enabled}`.

الخادم هو مصدر الحقيقة في قرار الإرسال، والنسخة المحلية للعرض فقط.

### 3.8 الحملة: فورية أو مجدولة

1. التاجر ينشئ مسودة: `POST /dashboard/v1/push/campaigns`. التحقق:
   - النص العربي إلزامي، والعنوان حتى 65 حرفًا، والنص حتى 240 حرفًا.
   - الصورة JPEG أو PNG من وسائط M11، حتى 1MB، والرابط ينتهي بامتداد.
   - الرابط يمر بمدقق M07 (`LinkValidator`).
   - الفئة دائمًا `offers` في الإصدار الأول.
2. العدد التقديري: `POST /dashboard/v1/push/audiences/estimate`، ويعرض المستبعدين بأسبابهم.
3. إرسال تجريبي إلى أجهزة التاجر التجريبية، حتى 5 أجهزة، دون حدود التكرار.
4. الجدولة: `POST .../schedule` بنوع `now` أو `at`. التحقق:
   - موعد `at` بين الآن + 5 دقائق والآن + 30 يومًا.
   - حد 3 حملات مرسلة للتاجر في اليوم.
   - إن وقع الموعد في ساعات الهدوء: رفض برسالة تقترح نهايتها، إلا إذا أطفأ التاجر `respect_quiet_hours` صراحةً.
5. كل دقيقة يلتقط `DispatchDuePush` الحملات المستحقة (`status = scheduled AND send_at ≤ now()`). يحوّلها ذريًا إلى `sending`، ثم يطلق `StartCampaignJob`.
6. `StartCampaignJob` يمر على الشريحة بمؤشر في دفعات من 1,000 جهاز، ولكل جهاز:
   - يطبق `DeliveryPolicy`.
   - يدرج صفًا في `push_messages`، بحالة `queued` أو `suppressed` مع السبب.
   - ثم يضيف `SendMessagesChunkJob` إلى `Bus::batch` على `push-campaign`.
7. كل دفعة تُرسل عبر الناقل (3.11) وتحدّث الحالات.
8. عند انتهاء الـ batch:
   - تصبح الحالة `sent`، أو `partially_failed` إن تجاوز الفشل 5% من المرسل.
   - تُحسب لقطة إحصاء، ويُطلق `CampaignSent`.
9. **الإلغاء**:
   - في `scheduled`: فوري.
   - في `sending`: يُلغى الـ batch، والدفعات تتوقف عند `batch()->cancelled()`. وما أُرسل لا يُسترجع.
10. **التعديل**: مسموح في `draft` و`scheduled` فقط.

**سياسة الإرسال** (`DeliveryPolicy`، بالترتيب، وأول سبب يمنع هو المسجَّل):

| # | الشرط | سبب الاستبعاد |
|---|---|---|
| 1 | `registration_status = active` | `invalid` |
| 2 | `permission_status` = `authorized` أو `provisional` | `no_permission` |
| 3 | تفضيل الفئة مفعّل | `pref_off` |
| 4 | `last_seen_at` خلال 30 يومًا، للحملات والسلة فقط. ويوافق تعريف FCM الافتراضي للتقادم ([Manage tokens](https://firebase.google.com/docs/cloud-messaging/manage-tokens)) | `stale` |
| 5 | ليس في ساعات الهدوء، للسلة والترحيب. والسلة تؤجَّل ولا تُستبعد | `quiet_hours` |
| 6 | لم يتلق الجهاز حملة خلال 24 ساعة | `cap_daily` |
| 7 | رسائل التسويق للجهاز (حملات وسلة وترحيب) أقل من الحد الأسبوعي (4 افتراضيًا، والتاجر يختار بين 2 و6) خلال 7 أيام متحركة | `cap_weekly` |
| 8 | مفتاح منع التكرار غير مستخدم | `duplicate` |

الحدود الافتراضية مبنية على أن التكرار الزائد أول أسباب إلغاء الاشتراك ([Airship 2026](https://www.airship.com/mobile-app-push-notification-benchmarks-for-2026/)). ورسائل حالة الطلب لا تخضع للبنود 4 إلى 7.

**ساعات الهدوء** (بتوقيت التاجر، والافتراضي `Asia/Riyadh`):
- عادي: من 23:00 إلى 09:00.
- رمضان: من 03:00 إلى 12:00. يُطبَّق آليًا بين تاريخي بداية رمضان ونهايته من جدول تقويم موسمي تديره المنصة، ويشترك فيه M11 للحزم الموسمية.
- السبب: ذروة التسوق في رمضان بعد التراويح وبين 10 مساءً و2 فجرًا (`research_notes/مزايا وتخصيص تطبيقات متاجر زد/mobile_shopping_ux.md`).

### 3.9 الآلية: حالة الطلب

1. M10 يستقبل `order.status.update` ويرد 200 فورًا. ثم يعيد جلب الطلب ويطلق `OrderStatusUpdated {tenant_id, order_id, order_code, status, customer_id, source, created_at}`.
2. مستمع M06 على `push-transactional`: إن كانت الآلية أو قالب الحالة معطّلًا، ينتهي.
3. **ترتيب الحالات**: `new` ثم `preparing` ثم `ready` ثم `inDelivery` ثم `delivered`، و`cancelled` حالة نهائية. حالة أقدم من آخر حالة أُرسلت لهذا الطلب تُتجاهل، لأن الـ webhooks قد تصل بغير ترتيبها.
4. منع التكرار بالمفتاح `order:{order_id}:{status}`، بقيد فريد في `push_dedup`. وزد تعيد الإرسال حتى 3 مرات (ADR-0005).
5. **المستلمون**:
   - الأجهزة المربوطة بالطلب في `push_order_links`.
   - مع الأجهزة المعرّفة بـ `customer_id` = عميل الطلب، إن أكد SPK-07 تطابق المعرفات.
   - ثم الفلترة بالبنود 1 إلى 3 و8 من السياسة، وحد 10 أجهزة.
6. **التركيب**:
   - قالب لغة الجهاز بالمتغيرات `{customer_first_name}` و`{order_code}` و`{store_name}`.
   - الرابط `/_/o/{order_id}`، والقناة `orders`، والأولوية عالية، ومدة الصلاحية 72 ساعة.
   - `apns-collapse-id` و`android.notification.tag` = `order-{order_id}`، حتى تحل الحالة الأحدث محل الأقدم.
7. الإرسال والتسجيل. وإن لم يوجد مستلم: سطر `no_recipient` في سجل الآلية دون صف رسالة.

**القوالب الافتراضية** (يعدّلها التاجر):

| الحالة | مفعّلة افتراضيًا | العنوان والنص بالعربية |
|---|---|---|
| `new` | لا (شاشة التأكيد تكفي) | «استلمنا طلبك»: «طلبك رقم `{order_code}` وصلنا، وسنبدأ تجهيزه قريبًا.» |
| `preparing` | نعم | «طلبك قيد التجهيز»: «نجهّز طلبك رقم `{order_code}` الآن.» |
| `ready` | نعم | «طلبك جاهز»: «طلبك رقم `{order_code}` جاهز للشحن أو الاستلام.» |
| `inDelivery` | نعم | «طلبك في الطريق»: «طلبك رقم `{order_code}` مع شركة الشحن. تابعه من التطبيق.» |
| `delivered` | نعم | «وصل طلبك»: «نتمنى أن ينال إعجابك يا `{customer_first_name}`.» |
| `cancelled` | نعم | «أُلغي طلبك»: «أُلغي طلبك رقم `{order_code}`. تواصل معنا إن كان لديك استفسار.» |

النص العربي يبدأ بحرف عربي لا برقم أو رمز، حتى يُرسم من اليمين في الإشعار. والمتغير الفارغ يُحذف بما حوله من مسافة، ويُستبدل الاسم الفارغ بـ «عميلنا العزيز».

### 3.10 الآلية: السلة المتروكة

1. M10 يستقبل `abandoned_cart.created`، ويعيد جلب `GET abandoned-carts/{id}`. ثم يطلق `AbandonedCartCreated {cart_id, customer_id, source, phase, cart_total, url, created_at}`. الحقول من [View Abandoned Cart](https://docs.zid.sa/get-abandoned-cart-details).
2. **الفلاتر**:
   - إن كانت الآلية معطلة، أو `cart_total` أقل من الحد الأدنى، أو المصدر خارج النطاق (`all` أو `mobile_app`)، ينتهي.
   - إن كان للعميل تسلسل نشط خلال 72 ساعة، يُتجاهل الجديد.
3. إن لم يكن للعميل أجهزة معرّفة مسموح لها، يُسجل `no_recipient` وينتهي. سلة الزائر غير المعرّف تُعالج بالتذكير المحلي لاحقًا (3.14).
4. يُنشأ صف في `push_sequences`، وصف في `push_pending_sends` لكل خطوة: `due_at = created_at + delay`.
5. `DispatchDuePush` يلتقط كل دقيقة الصفوف المستحقة: `FOR UPDATE SKIP LOCKED`، و1,000 صف في المرة.
6. قبل الإرسال:
   - إن أُلغي التسلسل، ينتهي.
   - إن مرّ أكثر من 30 دقيقة على آخر فحص، يُعاد جلب السلة عبر M10 ضمن حد المعدّل. والـ `phase = completed` يلغي التسلسل.
   - ساعات الهدوء تؤجّل `due_at` إلى نهايتها مع تشتيت عشوائي من 0 إلى 20 دقيقة.
   - تجاوز الحد الأسبوعي يتخطى الخطوة بـ `suppressed`، ولا يؤجّلها.
7. **الإرسال** إلى الأجهزة المعرّفة:
   - الفئة `offers`، والرابط `/cart?ish_src=push`، ومدة الصلاحية 12 ساعة.
   - المتغيرات `{customer_first_name}` و`{cart_total}` و`{store_name}`.
8. **الإلغاء**: يحدث عند `AbandonedCartCompleted` للسلة، أو `OrderCreated` لنفس العميل بعد `created_at` للسلة. فيصبح التسلسل وكل خطواته المعلقة `cancelled`.

**الخطوات الافتراضية**: بعد ساعة واحدة «نسيت شيئًا في سلتك؟»، وبعد 24 ساعة «منتجاتك ما زالت بانتظارك». والخطوة الثالثة معطلة افتراضيًا.

المنصة لا تنشئ كوبونات، لأن ذلك يحتاج صلاحية الكوبونات الحساسة. والتاجر يكتب الكود في النص إن أراد.

### 3.11 الإرسال إلى FCM ومعالجة الأخطاء

1. **المصادقة**: رمز OAuth لحساب `push-sender` بنطاق `https://www.googleapis.com/auth/firebase.messaging` عبر google/auth، مخزن في Redis لمدة 50 دقيقة.
2. **الطلب**: `POST https://fcm.googleapis.com/v1/projects/{project}/messages:send`، رسالة واحدة لكل جهاز. فواجهات الدفعات القديمة أُوقفت، وkreait نفسه انتقل إلى طلب لكل رسالة.
3. **التوازي**: `GuzzleHttp\Pool` بـ HTTP/2 وتوازي 50 في المهمة.
4. **حدود المعدّل عندنا**: `Redis::throttle` بسقف 3,000 رسالة في الثانية لكل مشروع، و1,000 لكل تاجر، حتى لا يستهلك تاجر كبير حصة مشروع مشترك.
   - حصة FCM هي 600 ألف في الدقيقة لكل مشروع، وأخطاء 4xx (عدا 429) تُحسب منها.
   - وعلى أندرويد حد 240 رسالة في الدقيقة لكل جهاز ([Throttling and Quotas](https://firebase.google.com/docs/cloud-messaging/throttling-and-quotas)).
5. **الهدف**: الحقل `fid` إن كان `registration_type = fid`، وإلا `token` ([v1 Message](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)).

| الاستجابة | المعنى | الإجراء |
|---|---|---|
| 200 | قبلها FCM | `sent`، و`fcm_message_name` |
| 404 `UNREGISTERED` | التسجيل لم يعد صالحًا | `failed`، والجهاز `invalid`، وسبب الإبطال `unregistered` ([Manage tokens](https://firebase.google.com/docs/cloud-messaging/manage-tokens)) |
| 400 `INVALID_ARGUMENT` | قد يكون التسجيل أو الحمولة | إن نجح التحقق بـ `validate_only` على حمولة مماثلة فالعيب في التسجيل، فيُبطل الجهاز. وإلا تفشل الرسالة دون إبطال، ويُطلق تنبيه «حمولة غير صالحة» |
| 403 `SENDER_ID_MISMATCH` | الجهاز مسجل في مشروع آخر، كأن نُقل التاجر | الجهاز `invalid`، والتطبيق يعيد التسجيل في إقلاعه التالي |
| 401 `THIRD_PARTY_AUTH_ERROR` | مفتاح APNs مفقود أو ملغى | `failed`. فإن تكرر 20 مرة في 5 دقائق للتاجر: `apns_status = failed`، وإيقاف إرسال iOS له، وتنبيه للتشغيل |
| 429 `QUOTA_EXCEEDED`، 503 `UNAVAILABLE`، 500 `INTERNAL`، أو انتهاء المهلة | عابر | إعادة المحاولة بعد 30 ثم 120 ثم 600 ثانية، مع احترام `Retry-After` إن وُجد. وبعد 3 محاولات: `failed` |

المرجع: [FCM ErrorCode](https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode).

### 3.12 تنظيف السجلات (`PushJanitor`، يوميًا 03:00)

1. كل جهاز `last_seen_at` عنده أقدم من 30 يومًا يصبح `stale`، فيُستبعد من الحملات والسلة ويبقى لحالة الطلب. وعودته تعيده `active` تلقائيًا.
2. يُحذف كل جهاز `last_seen_at` عنده أقدم من 270 يومًا، وهي المدة التي يُنهي بعدها FCM التسجيل غير النشط على أندرويد. وكل جهاز `invalid` منذ أكثر من 30 يومًا.
3. تُحذف أقسام `push_messages` الأقدم من 90 يومًا، بعد التأكد من تجميعها في `push_campaign_stats` و`push_daily_stats`.
4. تُحذف روابط الطلبات الأقدم من 120 يومًا.

### 3.13 قياس الفتح والتحويل

| المقياس | التعريف | المصدر |
|---|---|---|
| مستهدف | أجهزة الشريحة قبل السياسة | `push_messages` + المستبعد |
| مرسل | قبلها FCM (200) | الناقل |
| فاشل | فشل نهائي بعد المحاولات | الناقل |
| مفتوح | `mid` فريد وصل في `/opens` | التطبيق |
| نسبة الفتح | مفتوح ÷ مرسل | — |
| طلبات منسوبة | طلب أنشأه الجهاز أو عميله خلال 24 ساعة من آخر فتح لإشعار. وعند تعدد الإشعارات تُنسب لآخر فتح (last-touch) | القسم أدناه |
| إيراد منسوب | `order_total` للطلبات المنسوبة، بالريال، بتعريف الإيراد في M08 | M10 |
| وصل (أندرويد) | Should: بيانات FCM Data API المجمعة حسب `analytics_label` ([understand delivery](https://firebase.google.com/docs/cloud-messaging/understand-delivery)، [fcmdata](https://firebase.google.com/docs/reference/fcmdata/rest)) | لاحقًا |

**خطوات النسبة**
1. الطلب يصل من مصدرين:
   - `OrderCreated` من M10.
   - ربط الطلب من التطبيق (3.5)، ومنه نعرف جهاز الزائر.
2. يُبحث عن آخر فتح خلال 24 ساعة قبل `created_at` للطلب، بالجهاز المربوط أو بأجهزة العميل.
3. يُنشأ صف واحد لكل طلب في `push_attributions`، فيه: الرسالة، والحملة أو الآلية، والإيراد، و`order_source` (تطبيق أو غيره).
4. `PushStatsAggregator` يحدّث إحصاء حملات آخر 7 أيام كل 5 دقائق.

نافذة الـ 24 ساعة إعداد على مستوى المنصة، ويثبتها M08 في نموذجه الموحّد.

### 3.14 لاحقًا (Should وCould)

- **الترحيب (Should)**:
  - المحفز `customer.create`. بعد 10 دقائق، إن كان للعميل جهاز معرّف خلال 24 ساعة، تُرسل رسالة واحدة في فئة `offers`.
  - منع التكرار للأبد لكل عميل، وتخضع لساعات الهدوء والحد الأسبوعي.
  - لا ينشئ كوبونًا.
- **عودة المخزون وانخفاض السعر (Should، F-S16، SPK-08)**:
  - **الاشتراك**:
    - جدول `push_product_alerts`: الجهاز، والعميل، والمنتج، والخيار، والنوع، و`baseline_price`، و`baseline_in_stock`، وصلاحية 90 يومًا.
    - يأتي من «نبهني» (مخزون)، ومن المفضلة (سعر ومخزون). والتطبيق يرفع معرّفات المفضلة عند تفعيل العلم.
  - **الكشف**:
    - `product.update` يُجمَّع لكل منتج 5 دقائق، لأن التعديلات الجماعية تتكرر.
    - ثم يعاد الجلب عبر M10، إلا إذا ثبت في SPK-08 أن الحمولة تكفي.
    - المخزون: الانتقال من 0 إلى أكثر من 0. والسعر: انخفاض 5% أو أكثر عن خط الأساس.
  - **حدود**: تنبيه سعر واحد لكل منتج وجهاز كل 7 أيام، و3 تنبيهات في اليوم لكل جهاز.
  - **التوازي مع زد**: يُستدعى `stock-alerts` الخاص بزد للعميل المسجل، حتى تبقى عدادات التاجر صحيحة (`zid_feature_capability_map.md`).
- **تذكير محلي بالسلة للزائر (Should)**:
  - حين يغادر الزائر التطبيق وسلته غير فارغة، يجدول التطبيق إشعارًا محليًا بـ `flutter_local_notifications.zonedSchedule` بوضع `inexactAllowWhileIdle`، فلا يحتاج إذن exact alarm.
  - موعده بعد ساعتين خارج ساعات الهدوء.
  - يُلغى عند فتح التطبيق أو إفراغ السلة. ويحترم تفضيل `offers`، ونوعه `local_cart`.
- **إحصاء الوصول (Should)**: لأندرويد من FCM Data API يوميًا. ولـ iOS بطلب `POST /opens` من نوع `delivered` يرسله الـ NSE، ويحتاج App Group ومفتاح الجهاز.
- **نصوص بالذكاء الاصطناعي (Should، F-M12)**: زر «اقترح نصًا» في المحرر. والعقد في وحدة المساعد.
- **iOS provisional (قرار مفتوح)**: إذن مؤقت يوصل الإشعار إلى مركز الإشعارات بهدوء دون نافذة. معطل في الإصدار الأول، انظر القسم 8.
- **Could**: صندوق إشعارات داخل التطبيق، وA/B للنصوص، وأصوات لكل نوع (تحتاج بناءً جديدًا على أندرويد)، وتوقيت مثالي لكل جهاز، وLive Activities.

## 4. نموذج البيانات

### 4.1 على الخادم (PostgreSQL)

كل الجداول فيها `tenant_id` وتمر بنطاق المستأجر من M12.

**`push_firebase_projects`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | bigint PK | — |
| `gcp_project_id` | text unique | `intishar-push-p001` |
| `status` | enum: `provisioning`، `active`، `full`، `retired`، `blocked` | — |
| `app_count` | smallint | يُحدَّث داخل معاملة التسجيل |
| `capacity` | smallint | 28 |
| `created_at`، `updated_at` | timestamptz | — |

**`push_tenant_apps`** (فريد على `tenant_id` + `platform`)

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | bigint PK | — |
| `tenant_id` | uuid FK | — |
| `platform` | enum: `ios`، `android` | — |
| `bundle_or_package` | text | — |
| `firebase_project_id` | FK إلى `push_firebase_projects` | — |
| `firebase_app_id` | text | `1:123:ios:abc` |
| `config_file_path` | text | مسار في التخزين الخاص |
| `apns_key_id`، `apns_team_id` | text, nullable | iOS فقط |
| `apns_secret_ref` | text, nullable | مرجع في الخزنة، لا المفتاح |
| `apns_status` | enum: `missing`، `received`، `uploaded`، `verified`، `failed` | — |
| `apns_checked_at` | timestamptz | — |
| `provisioning_status` | enum: `pending`، `done`، `failed`، `blocked` | — |
| `last_error` | jsonb | — |

**`push_devices`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | uuid PK | يولّده التطبيق |
| `tenant_id` | uuid | — |
| `secret_hash` | text | sha256 لـ `device_secret` |
| `platform` | enum: `ios`، `android` | — |
| `registration_id` | text, nullable | FID أو token |
| `registration_type` | enum: `fid`، `token` | — |
| `registration_status` | enum: `active`، `stale`، `invalid` | — |
| `invalid_reason` | text, nullable | `unregistered`، `sender_mismatch`، `invalid_argument` |
| `permission_status` | enum: `not_determined`، `authorized`، `provisional`، `denied` | — |
| `locale` | enum: `ar`، `en` | لغة التطبيق، لا النظام |
| `timezone` | text | افتراضي `Asia/Riyadh` |
| `app_version`، `os_version` | text | — |
| `customer_id` | text, nullable | رقم العميل في زد |
| `customer_linked_at` | timestamptz, nullable | — |
| `is_test` | bool | جهاز تجريبي للتاجر |
| `pref_orders`، `pref_offers`، `pref_prices`، `pref_stock` | bool | افتراضيًا true |
| `last_seen_at`، `registration_updated_at`، `created_at`، `invalidated_at` | timestamptz | — |

الفهارس:
- فريد على `(tenant_id, registration_id)` حيث `registration_id` غير فارغ.
- `(tenant_id, customer_id)`.
- `(tenant_id, registration_status, permission_status, last_seen_at)`.
- جزئي على `(tenant_id) WHERE is_test`.

**`push_order_links`**: `tenant_id`، و`order_id` (text)، و`device_id`، و`linked_via` (`checkout` أو `identity`)، و`created_at`. والمفتاح الأساسي `(tenant_id, order_id, device_id)`.

**`push_campaigns`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | uuid PK | يظهر في `cid` |
| `tenant_id` | uuid | — |
| `name` | text | داخلي |
| `category` | enum | `offers` في الإصدار الأول |
| `status` | enum: `draft`، `scheduled`، `sending`، `sent`، `partially_failed`، `cancelled`، `failed` | — |
| `content` | jsonb | `ar`، و`en`، و`default_locale`، و`image_url`، و`link` |
| `audience` | jsonb | تعريف الشريحة (5.2) |
| `send_mode` | enum: `now`، `at` | — |
| `send_at` | timestamptz | — |
| `respect_quiet_hours` | bool | — |
| `batch_id` | text, nullable | معرّف Laravel batch |
| `created_by` | FK مستخدم اللوحة | — |
| `started_at`، `finished_at`، `cancelled_at` | timestamptz | — |

**`push_automations`**: `tenant_id`، و`type` (`order_status` أو `abandoned_cart` أو `welcome` أو `back_in_stock` أو `price_drop`)، و`enabled`، و`config` jsonb، و`updated_by`، و`updated_at`. والقيد فريد على `(tenant_id, type)`.

**`push_settings`**: `tenant_id` PK، و`quiet_start` و`quiet_end` (time)، و`ramadan_auto` (bool)، و`ramadan_quiet_start` و`ramadan_quiet_end`، و`weekly_marketing_cap` (2 إلى 6)، و`default_locale`، و`timezone`.

**`push_messages`** (مقسّم شهريًا حسب `queued_at`، ويُحفظ 90 يومًا)

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | uuid | يظهر في `mid` |
| `tenant_id`، `device_id` | uuid | — |
| `campaign_id` | uuid, nullable | — |
| `automation_type` | text, nullable | — |
| `trigger_ref` | text, nullable | رقم الطلب أو السلة |
| `category`، `locale` | enum | — |
| `status` | enum: `queued`، `sent`، `failed`، `suppressed` | — |
| `reason` | text, nullable | سبب الاستبعاد أو رمز الخطأ |
| `attempts` | smallint | — |
| `fcm_message_name` | text, nullable | — |
| `queued_at`، `sent_at`، `opened_at` | timestamptz | — |

الفهارس: `(tenant_id, campaign_id, status)`، و`(device_id, sent_at)`، و`(tenant_id, opened_at)` الجزئي.

**`push_dedup`**: `key` (text PK)، و`created_at`، وتُحذف بعد 30 يومًا.

**`push_sequences`** و**`push_pending_sends`**:
- `push_sequences`: `id`، و`tenant_id`، و`cart_id`، و`customer_id`، و`status` (`active`، `completed`، `cancelled`)، و`cancel_reason`، و`created_at`.
- `push_pending_sends`: `id`، و`sequence_id`، و`step`، و`due_at`، و`status` (`pending`، `sent`، `skipped`، `cancelled`)، و`last_checked_at`.
- فهرس `(status, due_at)`.

**`push_attributions`**: `tenant_id`، و`order_id` (فريد مع المستأجر)، و`message_id`، و`campaign_id`، و`automation_type`، و`device_id`، و`customer_id`، و`order_total` (numeric)، و`currency`، و`order_source`، و`opened_at`، و`order_created_at`.

**`push_campaign_stats`** و**`push_daily_stats`**: أعداد مجمعة (مستهدف، ومستبعد حسب السبب، ومرسل، وفاشل، ومفتوح، وطلبات، وإيراد) لكل حملة، ولكل تاجر ويوم ونوع.

**`push_pairing_codes`**: `code` (6 أرقام)، و`token` (عشوائي 32 بايت)، و`tenant_id`، و`created_by`، و`expires_at` (10 دقائق)، و`used_at`.

### 4.2 في Redis

| المفتاح | المحتوى | الصلاحية |
|---|---|---|
| `push:oauth:{project}` | رمز الوصول | 50 دقيقة |
| `push:cap:d:{tenant}:{device}` | وقت آخر حملة | 24 ساعة |
| `push:cap:w:{tenant}:{device}` | sorted set بأوقات رسائل التسويق | 7 أيام |
| `push:throttle:project:{project}` و`push:throttle:tenant:{tenant}` | حدود الإرسال | — |
| `push:apns_fail:{tenant}` | عدّاد أخطاء المصادقة | 5 دقائق |

### 4.3 على الجهاز

| المفتاح | التخزين | المحتوى |
|---|---|---|
| `push.device_id` | shared_preferences | UUID |
| `push.device_secret` | flutter_secure_storage | سر الجهاز |
| `push.last_sync` | shared_preferences | آخر مزامنة، وبصمة الحقول المرسلة |
| `push.pending_sync` | shared_preferences | علم |
| `push.os_prompted`، `push.os_prompt_count` | shared_preferences | حالة نافذة النظام |
| `push.soft_ask_history` | shared_preferences | أوقات عرض الورقة ورفضها لكل سياق |
| `push.preferences` | shared_preferences | نسخة العرض من التفضيلات |
| `push.handled_mids` | shared_preferences | آخر 50 `mid` |
| `push.pending_opens` | shared_preferences | طابور الفتح غير المرسل |

## 5. الواجهات والعقود

اصطلاحات المسارات والأخطاء والمصادقة تتبع M12. والمسارات هنا ثابتة في المعنى، وقد تتغير بادئتها عند كتابة M12.

### 5.1 Endpoints التطبيق

المصادقة: الترويسة `X-Tenant: {tenant_id}` من `tenant.json`، ثم `Authorization: Device {device_secret}` بعد أول تسجيل. وحد المعدّل 60 طلبًا في الدقيقة لكل جهاز.

**`PUT /app/v1/push/devices/{device_id}`**: تسجيل الجهاز أو تحديثه.

```json
{
  "platform": "ios",
  "registration_id": "cJ3kZ...9Q",
  "registration_type": "fid",
  "permission_status": "authorized",
  "locale": "ar",
  "timezone": "Asia/Riyadh",
  "app_version": "1.3.0+31",
  "os_version": "iOS 19.1"
}
```

الاستجابة `200`، أو `201` في أول تسجيل، ولا يعود `device_secret` إلا فيه:

```json
{
  "device_id": "5f0c2b7e-8a7d-4a51-9a0e-0b8f8a1c2d3e",
  "device_secret": "9f2c...e1",
  "preferences": { "orders": true, "offers": true, "prices": true, "stock": true },
  "is_test": false
}
```

الأخطاء: `409 device_conflict`، و`410 tenant_push_disabled`، و`422 validation_failed`.

**`PATCH /app/v1/push/devices/{device_id}/preferences`**

```json
{ "offers": false }
```

الاستجابة `200` بالتفضيلات كاملة.

**`POST /app/v1/push/devices/{device_id}/identity`**، مع الترويسة `X-Zid-Session` (قيمة cookie الجلسة):

```json
{ "claimed_customer_id": "48213377" }
```

الاستجابة `200 { "customer_linked": true }`، أو `403 identity_mismatch`، أو `503 verifier_unavailable`.

**`DELETE /app/v1/push/devices/{device_id}/identity`**: الاستجابة `204`.

**`POST /app/v1/push/devices/{device_id}/orders`**

```json
{ "order_id": "41529903", "detected_by": "checkout_confirmation" }
```

الاستجابة `202 { "linked": true }`، أو `404 order_not_found`، أو `409 order_link_limit`، أو `422 order_too_old`، أو `403 customer_mismatch`.

**`POST /app/v1/push/opens`**

```json
{
  "mid": "0b3d6a1e-2f4c-4f7e-9a51-7c0d2e9b1a44",
  "device_id": "5f0c2b7e-8a7d-4a51-9a0e-0b8f8a1c2d3e",
  "opened_at": "2026-11-10T19:42:10Z",
  "app_state": "terminated"
}
```

الاستجابة `204`. والتكرار آمن: أول فتح هو المحسوب.

**`POST /app/v1/push/devices/{device_id}/pair`**: تحويل الجهاز إلى جهاز تجريبي للتاجر، من رابط `/_/pair/{token}` في M07 أو من رمز من 6 أرقام.

```json
{ "token": "pr_8c1f...", "code": null }
```

الاستجابة `200 { "is_test": true }`، أو `410 pairing_expired`.

### 5.2 Endpoints لوحة التاجر

المصادقة بـ Sanctum (ADR-0010)، والصلاحية «إدارة الإشعارات».

| الطريقة والمسار | الغرض |
|---|---|
| `GET /dashboard/v1/push/campaigns?status=&page=` | القائمة مع إحصاء مختصر |
| `POST /dashboard/v1/push/campaigns` | إنشاء مسودة |
| `GET`، `PATCH`، `DELETE` على `/dashboard/v1/push/campaigns/{id}` | القراءة والتعديل (مسودة أو مجدولة)، والحذف (مسودة) |
| `POST /dashboard/v1/push/campaigns/{id}/schedule` | `{ "mode": "now" }` أو `{ "mode": "at", "send_at": "..." }` |
| `POST /dashboard/v1/push/campaigns/{id}/cancel` | الإلغاء |
| `POST /dashboard/v1/push/campaigns/{id}/test` | إرسال تجريبي إلى الأجهزة التجريبية |
| `GET /dashboard/v1/push/campaigns/{id}/stats` | الإحصاء |
| `POST /dashboard/v1/push/audiences/estimate` | العدد التقديري |
| `GET`، `PUT` على `/dashboard/v1/push/automations/{type}` | إعداد آلية |
| `GET`، `PUT` على `/dashboard/v1/push/settings` | ساعات الهدوء والحدود واللغة |
| `GET`، `DELETE` على `/dashboard/v1/push/test-devices` | الأجهزة التجريبية |
| `POST /dashboard/v1/push/test-devices/pairing` | يعيد `{ code, link, expires_at }`. ورسم الـ QR في اللوحة |
| `GET /dashboard/v1/push/overview?from=&to=` | بطاقات النظرة العامة |

**إنشاء حملة**:

```json
{
  "name": "عرض نهاية الأسبوع",
  "category": "offers",
  "content": {
    "default_locale": "ar",
    "ar": { "title": "خصم 20% على العطور", "body": "العرض ينتهي الليلة. تسوّق الآن" },
    "en": { "title": "20% off perfumes", "body": "Ends tonight. Shop now" },
    "image_url": "https://cdn.example-platform.com/t/acme/push/2026/11/perfume.jpg",
    "link": { "type": "category", "id": "412823", "path": "/categories/412823/perfumes" }
  },
  "audience": {
    "platform": "all",
    "locale": "all",
    "login_state": "all",
    "active_within_days": 30,
    "has_ordered": null
  },
  "respect_quiet_hours": true
}
```

**الشريحة في الإصدار الأول**: خمسة فلاتر تُدمج بـ AND.
- `platform`: `all` أو `ios` أو `android`.
- `locale`: `all` أو `ar` أو `en`.
- `login_state`: `all` أو `logged_in` أو `guest`.
- `active_within_days`: 7 أو 14 أو 30.
- `has_ordered`: `null` (الكل)، أو `true` (له طلب مربوط)، أو `false`.

الشرائح السلوكية من M08 تأتي مع F-M13.

**العدد التقديري** (الاستجابة):

```json
{
  "eligible": 12840,
  "excluded": { "no_permission": 9104, "pref_off": 311, "stale": 2207, "invalid": 96 },
  "by_platform": { "ios": 7310, "android": 5530 },
  "computed_at": "2026-11-10T12:00:03Z"
}
```

**إحصاء حملة**:

```json
{
  "campaign_id": "c1a7...",
  "status": "sent",
  "targeted": 12840,
  "suppressed": { "cap_daily": 120, "cap_weekly": 64, "quiet_hours": 0 },
  "sent": 12626,
  "failed": 30,
  "opened": 1012,
  "open_rate": 0.0802,
  "orders": 37,
  "revenue": { "amount": "8420.50", "currency": "SAR" },
  "attribution_window_hours": 24,
  "by_platform": {
    "ios": { "sent": 7190, "opened": 640 },
    "android": { "sent": 5436, "opened": 372 }
  },
  "updated_at": "2026-11-10T20:05:00Z"
}
```

**آلية حالة الطلب** (`PUT .../automations/order_status`). ونصوص الحالات الأخرى بالشكل نفسه:

```json
{
  "enabled": true,
  "scope": "all_channels",
  "statuses": {
    "new": { "enabled": false },
    "preparing": {
      "enabled": true,
      "ar": { "title": "طلبك قيد التجهيز", "body": "نجهّز طلبك رقم {order_code} الآن." },
      "en": { "title": "Your order is being prepared", "body": "We're preparing order {order_code} now." }
    }
  }
}
```

**آلية السلة المتروكة**:

```json
{
  "enabled": true,
  "source_filter": "all",
  "min_cart_total": 0,
  "steps": [
    { "delay_minutes": 60, "ar": { "title": "نسيت شيئًا في سلتك؟", "body": "منتجاتك بانتظارك يا {customer_first_name}." }, "en": { "title": "Forgot something?", "body": "Your cart is waiting." } },
    { "delay_minutes": 1440, "ar": { "title": "سلتك ما زالت محفوظة", "body": "أكمل طلبك بقيمة {cart_total} قبل نفاد الكمية." }, "en": { "title": "Your cart is saved", "body": "Complete your order of {cart_total}." } }
  ]
}
```

**الإعدادات**:

```json
{
  "timezone": "Asia/Riyadh",
  "default_locale": "ar",
  "quiet_hours": { "start": "23:00", "end": "09:00" },
  "ramadan_auto": true,
  "ramadan_quiet_hours": { "start": "03:00", "end": "12:00" },
  "weekly_marketing_cap": 4
}
```

### 5.3 Endpoints لوحة الإدارة

| الطريقة والمسار | الغرض |
|---|---|
| `GET /admin/v1/push/projects` | المشاريع والسعة |
| `GET /admin/v1/push/tenants/{id}/health` | حالة التجهيز وAPNs، ومعدل الفشل في 24 ساعة حسب الرمز، والأجهزة، ونسبة الموافقة |
| `POST /admin/v1/push/tenants/{id}/provision` | إعادة تشغيل التجهيز |
| `GET /admin/v1/push/tasks?type=apns_upload&status=open` | مهام الرفع |
| `POST /admin/v1/push/tenants/{id}/apns/download` | رابط تنزيل مؤقت للمفتاح (10 دقائق، مسجل في التدقيق) |
| `POST /admin/v1/push/tenants/{id}/apns/mark-uploaded` | `apns_status = uploaded` |
| `POST /admin/v1/push/tenants/{id}/test-send` | `{ "device_id": "..." }` |

### 5.4 رسالة FCM (HTTP v1)

حملة إلى جهاز iOS بوضع FID:

```json
{
  "message": {
    "fid": "cJ3kZ...9Q",
    "notification": { "title": "خصم 20% على العطور", "body": "العرض ينتهي الليلة. تسوّق الآن" },
    "data": {
      "mid": "0b3d6a1e-2f4c-4f7e-9a51-7c0d2e9b1a44",
      "kind": "campaign",
      "cat": "offers",
      "cid": "c1a7...",
      "link": "/categories/412823/perfumes?ish_src=push&ish_cid=c1a7&ish_mid=0b3d6a1e"
    },
    "android": {
      "priority": "NORMAL",
      "ttl": "86400s",
      "notification": { "channel_id": "offers", "image": "https://cdn.example-platform.com/t/acme/push/2026/11/perfume.jpg" }
    },
    "apns": {
      "headers": { "apns-priority": "10", "apns-expiration": "1762887730" },
      "payload": { "aps": { "mutable-content": 1, "sound": "default", "thread-id": "offers" } },
      "fcm_options": { "image": "https://cdn.example-platform.com/t/acme/push/2026/11/perfume.jpg" }
    },
    "fcm_options": { "analytics_label": "cmp_c1a7" }
  }
}
```

قواعد الحمولة:
- `data` كلها نصوص.
- الحمولة الكاملة ≤ 4KB.
- `link` مسار نسبي بصيغة M07، ويُحل على نطاق التاجر.
- حالة الطلب:
  - `kind = order_status`، و`cat = orders`، و`android.priority = HIGH`.
  - `ttl` = 259200s.
  - `apns-collapse-id` و`android.notification.tag` = `order-{id}`.
- `analytics_label`: `cmp_{id}` للحملة، و`auto_{type}` للآلية.

### 5.5 الأحداث الداخلية

| الحدث | المصدر | المستهلك |
|---|---|---|
| `OrderCreated`، و`OrderStatusUpdated`، و`AbandonedCartCreated`، و`AbandonedCartCompleted`، و`CustomerCreated`، و`ProductUpdated` | M10، بعد إعادة الجلب | M06 |
| `CustomerSignedIn`، و`CustomerSignedOut` (في التطبيق) | M05 | M06 (Flutter) |
| `CustomerDeleted` | M05 (الخادم) | M06 |
| `PushProvisioned {tenant_id, ios_app_id, android_app_id}` | M06 | M13 (تحديث إعداد البناء)، وM14 (حالة المعالج) |
| `CampaignSent`، و`PushMessageOpened` | M06 | M08 |
| `ApnsAuthFailed {tenant_id}` | M06 | M12 (التنبيه)، وM15 (إشعار التاجر) |

### 5.6 أحداث التحليلات (تُسجل في تصنيف M08)

| الحدث | الخصائص |
|---|---|
| `push_permission_prompt_shown` | `context`، و`kind` (`soft` أو `os`) |
| `push_permission_result` | `context`، و`status` (`authorized`، `provisional`، `denied`، `soft_declined`) |
| `push_preferences_changed` | `cat`، و`enabled` |
| `push_received_foreground` | `mid`، و`kind`، و`cat` |
| `push_opened` | `mid`، و`cid`، و`kind`، و`cat`، و`app_state` |
| (خادم) `push_sent`، و`push_suppressed`، و`push_failed` | `tenant_id`، و`kind`، و`cat`، و`reason` أو `code` |

### 5.7 العقود مع الوحدات الأخرى

| الوحدة | العقد |
|---|---|
| M01 | تهيئة `Firebase.initializeApp` في الإقلاع، ونقطة دخول تعلن جاهزية الموجّه، وتمرير `getInitialMessage()` بعدها، وعلم `push.enabled` لكل تاجر |
| M04 | يستدعي `PushPermissionController.maybePrime(order_placed)` و`OrderLinkReporter.report(order_id)` من شاشة التأكيد، و`maybePrime(back_in_stock)` من «نبهني» |
| M05 | `StorefrontIdentityVerifier.verify(tenant, sessionCookie) → customer_id` في الخادم، وأحداث الدخول والخروج والحذف، ومسار تفاصيل الطلب لرابط `/_/o/{order_id}`، ومدخل «الإشعارات» في الحساب |
| M07 | `DeepLinkCoordinator.handle(Uri, source)`، و`LinkValidator` في الخادم، ومنتقي الرابط في اللوحة، ومسار `/_/pair/{token}` |
| M08 | نموذج النسبة: نافذة 24 ساعة، وآخر فتح، وتعريف الإيراد. والأحداث في 5.6 |
| M10 | الاشتراك في الأحداث الستة لكل تاجر مفعّل، وإعادة الجلب، و`GET orders/{id}`، و`GET abandoned-carts/{id}` ضمن محدد المعدّل |
| M11 | رفع صورة الإشعار إلى الوسائط والـ CDN، وجدول التقويم الموسمي |
| M12 | الخزنة (`apns_p8` وحسابات الخدمة)، ونطاق المستأجر، والأعلام، والتدقيق، والمراقبة |
| M13 | يقرأ من إعداد البناء: `firebase.ios_config_path`، و`firebase.android_config_path`، و`push.registration_mode`. ويبني هدف NSE ويسجله، ويولّد `ic_stat_notify` |
| M14 | يجمع `.p8` وKey ID ويستدعي `ApnsKeyService.store()`، ويعرض حالة `apns_status` |
| M15 | يرسم الشاشات في 2.4 على العقود في 5.2 و5.3 |

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| المستخدم رفض الإذن على iOS | لا تظهر الورقة في أي سياق إلا `settings`، وهناك يظهر زر «افتح الإعدادات». ويبقى الجهاز مسجلًا بحالة `denied` |
| أندرويد 13 فأحدث، رفض المستخدم مرتين | النظام لا يعرض النافذة. والتطبيق يعامل الحالة كـ iOS المرفوض |
| أندرويد 12 أو أقدم | الإذن ممنوح افتراضيًا (`authorized`)، ولا تُعرض الورقة. والإرسال يعمل ما لم يوقفه المستخدم |
| المستخدم أعاد التفعيل من الإعدادات | عند `resumed` تتغير الحالة وتتم المزامنة، ثم يبدأ الإرسال |
| حذف التطبيق ثم إعادة تثبيته | `device_id` جديد. والقديم يصل إلى `UNREGISTERED` عند أول إرسال، أو يتقادم |
| تغيّر FID أو token | `onRegistered` أو `onTokenRefresh` يستدعي المزامنة، والخادم يحدّث الصف نفسه |
| معرّف تسجيل واحد ظهر على جهازين (استعادة نسخة احتياطية) | القيد الفريد يجعل آخر جهاز سجّل هو المالك، ويُفرّغ المعرّف من الصف الأقدم |
| عميل له 4 أجهزة | حالة الطلب تصل إلى كلها، بحد 10 |
| الخروج من حساب ودخول حساب آخر على الجهاز نفسه | `DELETE identity` ثم `POST identity`، وحالات طلبات الأول لا تصل بعد الخروج |
| طلب زائر | يصل إشعار الحالة عبر ربط الطلب بالجهاز (3.5) |
| فشل ربط الطلب بعد 3 محاولات | لا إشعار حالة للزائر، ويُسجَّل `order_link_failed` لتحليل SPK-01 |
| `customer.id` في الـ webhook لا يطابق Storefront (فشل SPK-07) | الإرسال بالهوية يتوقف بعلم، ويبقى ربط الطلب. وطلبات الويب للعميل لا يصلها إشعار |
| الـ webhook وصل مكررًا | `push_dedup` يمنع التكرار |
| `delivered` وصل قبل `inDelivery` | تُرسل `delivered`، وتُتجاهل `inDelivery` المتأخرة |
| إشعار حالة لطلب ملغى بعد التوصيل (استرجاع) | `cancelled` نهائية تُرسل مرة. والحالات الأخرى غير المعرّفة (`reversed`) تُتجاهل في الإصدار الأول |
| أُتمت السلة قبل الخطوة الأولى | `AbandonedCartCompleted` أو `OrderCreated` يلغي التسلسل، ولا إرسال |
| وصلت `abandoned_cart.completed` ولم تصل `created` | تُتجاهل، ولا تسلسل |
| خطوة سلة مستحقة في ساعات الهدوء | تُؤجل إلى نهايتها مع تشتيت |
| التاجر عطّل آلية السلة وفيها تسلسلات نشطة | الخطوات المعلقة تُلغى عند التقاطها، بسبب `automation_disabled` |
| حملة مجدولة والتاجر أوقف اشتراكه (M10 أو F-P05) | تُلغى آليًا عند التقاطها، بسبب `tenant_inactive` |
| صورة الحملة أكبر من 1MB أو بلا امتداد | رفض في التحقق برسالة عربية. وفي الإرسال، إن تعذر تحميلها، يظهر الإشعار دون صورة |
| رابط الحملة لمنتج حُذف | يفتح M07 شاشة «المنتج غير متوفر» مع البحث |
| الجهاز بلغة إنجليزية والحملة بلا نص إنجليزي | يُرسل نص `default_locale` |
| `THIRD_PARTY_AUTH_ERROR` لكل أجهزة iOS للتاجر | بعد 20 خطأ في 5 دقائق يتوقف إرسال iOS، وتُفتح مهمة، ويُنبَّه التاجر. وأندرويد يستمر |
| مشروع Firebase بلغ السعة | `status = full`، والتاجر الجديد يذهب إلى مشروع جديد |
| تاجر غادر المنصة | حذف تطبيقيه من المشروع عبر API، وحذف أجهزته بعد 30 يومًا. وأثر الحذف على حد الثلاثين يُتحقق منه في PUSH-01 |
| 429 من FCM أثناء حملة كبيرة | إعادة المحاولة بالتأخير، ورسائل حالة الطلب على طابور منفصل لا تتأخر |
| الإشعار وصل والتطبيق في المقدمة على شاشة الطلب نفسه | شريط داخلي، وتحديث شاشة الطلب |
| الضغط على إشعار، والتطبيق يطلب تحديثًا إجباريًا (F-P04) | شاشة التحديث أولًا، ويُسقط الرابط. والفتح يُحسب |
| تطبيق قديم لا يعرف مسار الرابط | M07 يفتح الرئيسية ويسجل `deep_link_failed`، والفتح يُحسب |
| تغيير لغة التطبيق | المزامنة تحدّث `locale`، وأسماء القنوات تُعاد بالاسم الجديد |

## 7. المتطلبات غير الوظيفية

| المجال | المتطلب | القياس |
|---|---|---|
| زمن حالة الطلب | p95 ≤ 60 ثانية من استلام الـ webhook إلى قبول FCM، وp99 ≤ 3 دقائق | الفرق بين `received_at` في M10 و`sent_at` |
| سعة الحملة | 100,000 جهاز تُرسل خلال ≤ 5 دقائق من البدء | اختبار حمل على مشروع اختبار بـ `validate_only` |
| دقة الجدولة | الحملة تبدأ خلال ≤ 60 ثانية من `send_at` | — |
| واجهات التطبيق | p95 ≤ 300 ms، والتوفر ≥ 99.9% شهريًا | المراقبة في M12 |
| الإقلاع | تهيئة الإشعارات لا تضيف أكثر من 50 ms إلى الإطار الأول، والتسجيل في الخلفية | قياس الإقلاع في M01 |
| النجاح | ≥ 99% من الرسائل الصالحة تُقبل من FCM، باستثناء التسجيلات غير الصالحة | `sent ÷ (sent + failed − invalid)` |
| التكرار | صفر رسالة مكررة لنفس مفتاح منع التكرار | القيد الفريد واختبار التكامل |
| التنظيف | كل `UNREGISTERED` يُبطل في المهمة نفسها، والمتقادم يُستبعد يوميًا | — |
| الموافقة | ≥ 50% ممن رأوا نافذة النظام بعد الورقة يوافقون (هدف PRD) | `push_permission_result` ÷ `push_permission_prompt_shown{kind=os}` |
| الأمان | `.p8` ومفاتيح الحسابات الخدمية مشفرة في الخزنة، ولا تظهر في السجلات ولا في الأخطاء. وكل تنزيل للمفتاح مسجل في التدقيق. و`device_secret` مخزن مجزأً (hash). وcookie زد لا تُخزن ولا تُسجل | مراجعة الكود، وفحص السجلات آليًا بالأنماط |
| الخصوصية | الحمولة لا تحمل إلا الاسم الأول ورقم الطلب، بلا عنوان ولا جوال ولا مبلغ في حالة الطلب. ورسائل التسويق تتطلب إذن النظام ومفتاح الفئة. وحذف الحساب يفك الأجهزة فورًا. والرسائل تُحذف بعد 90 يومًا، بما يتوافق مع نظام حماية البيانات الشخصية | اختبارات الحمولة |
| العربية وRTL | النصوص الافتراضية تبدأ بحرف عربي. والمعاينة في اللوحة تُرسم بالاتجاهين. وأسماء القنوات وورقة التمهيد ومركز التفضيلات باللغتين | فحص بصري في M6 |
| إمكانية الوصول | مفاتيح التفضيلات بعناوين دلالية (Semantics)، والورقة تدعم تكبير الخط إلى 200% دون قص، والشريط الداخلي يُعلن لقارئ الشاشة | فحص VoiceOver وTalkBack |
| المراقبة | مقاييس لكل تاجر: المرسل، والفاشل حسب الرمز، ونسبة الإبطال، وتأخر الطوابير. وتنبيهات عند: `THIRD_PARTY_AUTH_ERROR` > 0، أو فشل > 5% خلال 15 دقيقة، أو تأخر طابور > 5 دقائق، أو مشروع بسعة ≥ 26 | Horizon وM12 |

## 8. الاعتماديات والمجهول

### التجارب المرتبطة

| SPK | أثرها على M06 | ما يُبنى الآن |
|---|---|---|
| SPK-07 | هل `customer.id` في Merchant API هو رقم العميل في Storefront؟ منه يتحدد إرسال الحالة بالهوية | ربط الطلب بالجهاز (3.5) يعمل في الحالتين، والإرسال بالهوية خلف علم `push.identity_targeting` |
| SPK-01 | رقم الطلب على شاشة التأكيد لربط الطلب بالجهاز | الربط يقبل رقمًا من أي مصدر. ومع بديل وهمي إلى أن تُحسم |
| SPK-05 | استمرار الجلسة بعد الدخول في WebView، وهو شرط التحقق من الهوية | المحقق خلف واجهة في M05 |
| SPK-08 | هل تكفي حمولة `product.update` لكشف المخزون والسعر؟ | لاحقًا فقط (F-S16) |
| SPK-10 | إن كتبنا إعدادات OneSignal لروابط نطاق المتجر (M07)، فهل ترسل زد إشعارات بنفسها فتتكرر؟ | M06 لا يكتب `app_id` ولا `app_key` لـ OneSignal أبدًا. ونتيجة SPK-10 تُراجع هنا |
| SPK-03 | قيمة `source` للطلب. تؤثر على `order_source` في النسبة لا على النسبة نفسها | — |

### التعارضات مع ADRs وPRD
1. **ADR-0008 البند 2 (15 تاجرًا لكل مشروع)**: نوصي بسعة 14 (28 تطبيقًا) لترك مقعدين لإعادة التسجيل. هذا تعديل رقم لا قرار، ويُثبت في مراجعة ADR-0008.
2. **ADR-0008 لا يذكر أن رفع مفتاح APNs يدوي.** الإنشاء الآلي مؤكد للمشاريع والتطبيقات، أما رفع `.p8` فلا API له ([#2204](https://github.com/firebase/firebase-admin-node/issues/2204)). يُضاف إلى «العواقب» في الـ ADR: خطوة تشغيل لكل تاجر، بنحو 5 دقائق، وبـ SLA يوم عمل.
   - البديل إن صار ذلك عائقًا: إرسال iOS مباشرة إلى APNs من Laravel بمفتاح التاجر. هذا يخالف البند 1 من ADR-0008 (FCM يوصل إلى iOS)، ويحتاج ADR جديدًا.
3. **ADR-0008 البند 4 (الاستهداف بمعرّف العميل)** صحيح لكنه لا يكفي وحده: يعتمد على SPK-07، ولا يغطي الزائر. نضيف ربط الطلب بالجهاز مسارًا ثانيًا.
4. **FCM ينتقل من tokens إلى FID.** الحقل `token` مهجور لصالح `fid` مع دعم مشترك حاليًا ([Manage tokens](https://firebase.google.com/docs/cloud-messaging/manage-tokens)). ولا يغيّر ذلك ADR-0008، لكنه يغيّر نموذج البيانات والحزمة، انظر القرار 1 أدناه.
5. **PRD F-S14 (Must) يذكر 4 فئات، ومرسل فئتين منها (F-S16) Should.** في الإصدار الأول تظهر فئتان فقط، والأخريان خلف علم. البيانات تدعم الأربع من البداية.
6. **ADR-0008 البند 3 يذكر `customer.create`، وF-M07 (Must) لا يذكر الترحيب.** صُنّف الترحيب Should.
7. **إصدار Flutter**: الحزم الحالية تفرض Flutter 3.44 فأحدث. القرار في M01.

### قرارات مفتوحة للمشرف

| # | السؤال | التوصية |
|---|---|---|
| 1 | وضع التسجيل: FID أم token؟ | FID افتراضيًا، مع علم بناء `push.registration_mode` للرجوع إلى token دون تغيير الخادم. يُحسم بعد تجربته في PUSH-05 على الجهازين |
| 2 | تفعيل iOS provisional للإشعارات التشغيلية قبل الموافقة الصريحة؟ | لا في الإصدار الأول، لأنه يربك قياس هدف الموافقة. يُعاد النظر بعد بيانات CP-10 |
| 3 | نطاق إشعار الحالة: طلبات التطبيق فقط أم كل القنوات للعميل المعرّف؟ | كل القنوات، والإعداد `scope` متاح للتاجر |
| 4 | وجهة رابط السلة المتروكة: سلة التطبيق أم رابط الاستعادة في WebView؟ | سلة التطبيق (`/cart`)، لأن زد تدمج السلة المتروكة عند الدخول. وإن ظهرت فارغة يعرض M04 «استعادة سلتك» برابط `url` في WebView. يُتحقق منه في PUSH-11 |
| 5 | ساعات الهدوء الافتراضية العادية ورمضان | 23:00–09:00، ورمضان 03:00–12:00 |
| 6 | من يرفع مفتاح APNs في Firebase Console؟ | فريق المنصة، بمهمة في لوحة الإدارة و SLA يوم عمل |
| 7 | حساب إرسال واحد لكل المشاريع أم حساب لكل مشروع؟ | حساب واحد بدور على كل مشروع. أبسط تدويرًا، والخطر مماثل ما دامت المفاتيح في خزنة واحدة. وWorkload Identity Federation لاحقًا إن استُضفنا على GCP (D-06) |

### التحقق من جدوى ADR-0008 مقارنة بـ OneSignal

| المعيار | FCM تديره المنصة (ADR-0008) | OneSignal بحساب منظمة للمنصة |
|---|---|---|
| التكلفة | الإرسال عبر FCM مجاني، والحصة 600 ألف في الدقيقة لكل مشروع | مجاني حتى 1,000 مستخدم نشط شهريًا للمنظمة. ثم Growth بـ 19 دولارًا شهريًا + 0.012 دولار لكل مستخدم نشط ([OneSignal pricing](https://onesignal.com/pricing)). مثال: 100 تاجر × 5,000 مستخدم نشط ≈ 6,000 دولار شهريًا |
| هل يلغي Firebase؟ | — | لا. كل تطبيق في OneSignal يحتاج ملف حساب خدمة FCM v1 ([OneSignal: Android credentials](https://documentation.onesignal.com/docs/android-firebase-credentials)). فتجهيز مشاريع Firebase يبقى |
| مفتاح APNs | رفع يدوي في Firebase Console | آلي: `POST /apps` يقبل `apns_p8` وKey ID وTeam ID بمفتاح منظمة ([Create an app](https://documentation.onesignal.com/reference/create-an-app)). والخطة المطلوبة لهذا غير موثقة |
| المزايا الجاهزة | نبنيها: الشرائح، وساعات الهدوء، والحدود، والإحصاء | موجودة، وتوفر نحو 2 إلى 3 سباقات |
| البيانات | عندنا، وتدخل لوحتنا وM08 مباشرة | عند طرف ثالث، والإحصاء يُجلب عبر API |
| موقف المنتج | لا حساب خارجي على التاجر (ميزة على عناقيد) | يتحقق أيضًا إن كان الحساب للمنصة لا للتاجر |

**النتيجة**: ADR-0008 قابل للتنفيذ. الإنشاء الآلي للمشاريع والتطبيقات مؤكد، والحصص تكفي بفارق كبير، والتكلفة صفر مقابل تكلفة تنمو مع المستخدمين. والثغرة الوحيدة رفع مفتاح APNs اليدوي، وOneSignal لا يلغيها إلا بإبقاء Firebase أيضًا. يُعاد التقييم إن تجاوز التجهيز 50 تاجرًا في الشهر.

### ما يُبنى الآن خلف واجهة مؤقتة
- التجهيز وسجل الأجهزة والناقل والحملات والسياسة: على مشروع Firebase تجريبي واحد، وتطبيق اختبار للمنصة على حساب Apple التجريبي (P-4).
- الآليات: بأحداث M10 وهمية بالعقد في 5.5، تُطلق من أمر Artisan حتى يجهز M10.
- التحقق من الهوية: محقق وهمي يقبل رقمًا ثابتًا في بيئة `dev`.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| PUSH-01 | تجهيز Firebase آليًا: مجمّع المشاريع، وإنشاء المشروع وتفعيل الخدمات، وتسجيل تطبيقَي التاجر، وجلب ملفات الإعداد، وحدث `PushProvisioned`، والتحقق من شرط المجلد وأثر حذف التطبيقات على الحد | Must | نعم | M12 (الخزنة) |
| PUSH-02 | مفتاح APNs: فحص الصيغة، والفحص المسبق مع APNs، والحفظ في الخزنة، ومهمة الرفع في لوحة الإدارة، والحالات، وتجربة مفتاح topic-specific | Must | نعم | M12. وواجهة الجمع في M14 |
| PUSH-03 | هدف Notification Service Extension في مشروع `ios/` مع FirebaseMessaging، وصورة تعمل على تطبيق اختبار المنصة، وتسليم متطلبات التوقيع إلى M13 | Must | نعم | M13 للتكامل في خط البناء |
| PUSH-04 | نموذج بيانات الأجهزة وواجهات التطبيق: التسجيل، والتفضيلات، والفتح، والإقران، والمصادقة بسر الجهاز | Must | نعم | M12 |
| PUSH-05 | التطبيق: التهيئة، ووضع FID مع احتياط token، والقنوات، والمزامنة، والشريط في المقدمة، ومعالجة الفتح وتسليم الرابط إلى M07 | Must | ينتظر M01 | PUSH-04، وM07 (LINK-02) |
| PUSH-06 | التطبيق: الإذن في السياق (الورقة، والحدود، وحالات الرفض)، ومركز التفضيلات | Must | ينتظر M01 | PUSH-05 |
| PUSH-07 | الهوية: الربط والفك وحذف الحساب، وربط الطلب بالجهاز من شاشة التأكيد | Must | ينتظر SPK-07 | M05، وSPK-01، وSPK-05 |
| PUSH-08 | نواة الإرسال: الناقل HTTP v1، والمركّب، والسياسة (الهدوء، والحدود، والتفضيلات، والتقادم، ومنع التكرار)، والأخطاء وإعادة المحاولة، والطوابير، والتنظيف اليومي | Must | نعم | PUSH-01، وPUSH-04 |
| PUSH-09 | الحملات في الخادم: الإنشاء والتحقق، والشريحة والعدد التقديري، والجدولة والإلغاء، والإرسال التجريبي، والإحصاء | Must | نعم | PUSH-08 |
| PUSH-10 | آلية حالة الطلب: المستمع، والترتيب، والمستلمون، والقوالب الافتراضية، والإعداد | Must | ينتظر M10 | PUSH-07، وPUSH-08 |
| PUSH-11 | آلية السلة المتروكة: التسلسل، والخطوات المستحقة، وإعادة الفحص، والإلغاء، والإعداد | Must | ينتظر M10 | PUSH-08 |
| PUSH-12 | القياس: الفتح، والنسبة بنافذة 24 ساعة، والتجميع، وواجهة النظرة العامة | Must | ينتظر M08 | PUSH-07، وPUSH-09 |
| PUSH-13 | اللوحة: قائمة الحملات، والمحرر بالمعاينة، والتفاصيل، والإرسال التجريبي وإقران الأجهزة | Must | ينتظر M15 | PUSH-09، وM07 (منتقي الرابط) |
| PUSH-14 | اللوحة: شاشات الآليات والإعدادات | Must | ينتظر M15 | PUSH-10، وPUSH-11 |
| PUSH-15 | لوحة الإدارة: صحة الإشعارات لكل تاجر، ومهام APNs، والإرسال التجريبي | Must | ينتظر M15 | PUSH-02، وPUSH-08 |
| PUSH-16 | رسالة الترحيب من `customer.create` | Should | ينتظر M10 | PUSH-08، وPUSH-07 |
| PUSH-17 | تنبيهات عودة المخزون وانخفاض السعر، واشتراكات «نبهني» والمفضلة | Should | ينتظر SPK-08 | PUSH-08، وM04 |
| PUSH-18 | التذكير المحلي بسلة الزائر | Should | ينتظر M01 | PUSH-06، وM04 |
| PUSH-19 | إحصاء الوصول: FCM Data API لأندرويد، وإشارة الـ NSE لـ iOS | Should | نعم | PUSH-12، وPUSH-03 |

كل قصة مقدرة بسباق واحد أو أقل لمنفذ واحد. وأكبرها PUSH-08 وPUSH-09، فإن تجاوزت إحداهما السباق تُفصل منها إعادة المحاولة والتنظيف (PUSH-08)، أو العدد التقديري والإحصاء (PUSH-09).

### معايير القبول لأهم القصص

**PUSH-01: تجهيز Firebase**
1. **بافتراض** مشروع نشط فيه 24 تطبيقًا، **عندما** يُجهَّز تاجر جديد، **إذن** يُسجَّل تطبيقاه في المشروع نفسه، ويصبح `app_count = 26`، ويُخزن ملفا الإعداد، ويُطلق `PushProvisioned`.
2. **بافتراض** أن كل المشاريع فيها 27 تطبيقًا أو أكثر، **عندما** يُجهَّز تاجر، **إذن** يُنشأ مشروع جديد داخل مجلد `push-prod`، ويُضاف إليه Firebase، ويُمنح `push-sender` دوره، ثم يُسجَّل التطبيقان فيه.
3. **بافتراض** أن المهمة فشلت بعد تسجيل تطبيق iOS، **عندما** تُعاد، **إذن** لا يُنشأ تطبيق iOS ثانٍ، ويُكمَل من خطوة أندرويد.
4. **بافتراض** رفض إنشاء المشروع بسبب الحصة، **عندما** يحدث ذلك، **إذن** تصبح الحالة `blocked`، ويصل تنبيه للإدارة، ولا تتأثر إرسالات التجار الآخرين.

**PUSH-06: الإذن في السياق**
1. **بافتراض** متسوق جديد على iOS لم يُطلب منه الإذن، **عندما** يفتح التطبيق أول مرة ويتصفح، **إذن** لا تظهر ورقة ولا نافذة نظام.
2. **بافتراض** أنه أتم أول طلب، **عندما** تظهر شاشة التأكيد، **إذن** تظهر ورقة «تابع طلبك لحظة بلحظة». وعند «فعّل التنبيهات» تظهر نافذة النظام. وعند الموافقة يصبح `permission_status = authorized` في الخادم خلال 5 ثوانٍ، والفئات كلها مفعلة.
3. **بافتراض** أنه اختار «ليس الآن» قبل 3 أيام، **عندما** يتم طلبًا ثانيًا، **إذن** لا تظهر الورقة.
4. **بافتراض** أنه رفض نافذة النظام، **عندما** يفتح مركز التفضيلات، **إذن** يظهر «التنبيهات متوقفة من إعدادات الجهاز» وزر يفتح إعدادات التطبيق.
5. **بافتراض** جهاز أندرويد 12، **عندما** يتم المستخدم طلبًا، **إذن** لا تظهر ورقة، لأن الإذن ممنوح.
6. **بافتراض** أن المستخدم أطفأ «العروض والتذكيرات»، **عندما** تُرسل حملة، **إذن** يُستبعد جهازه بسبب `pref_off`، ويظهر في العدد المستبعد.

**PUSH-07: الهوية وربط الطلب**
1. **بافتراض** زائر أتم طلبًا رقمه 41529903 قبل دقيقة، **عندما** يرسل التطبيق الربط، **إذن** يُنشأ رابط `checkout`، ويصل إليه إشعار `preparing` لهذا الطلب.
2. **بافتراض** جهاز يرسل ربطًا لطلب عمره ساعتان، **عندما** يصل الطلب، **إذن** يُرفض بـ `422 order_too_old`.
3. **بافتراض** جهاز معرّف بالعميل A، **عندما** يرسل ربطًا لطلب العميل B، **إذن** يُرفض بـ `403 customer_mismatch`.
4. **بافتراض** دخول ناجح، **عندما** يرسل التطبيق الهوية برقم عميل لا يطابق ما تعيده جلسة زد، **إذن** يُرفض بـ `403 identity_mismatch`، ولا يتغير `customer_id`.
5. **بافتراض** خروج المستخدم، **عندما** يتغير لاحقًا حال طلب ربطه عبر الهوية، **إذن** لا يصل الإشعار إلى هذا الجهاز.

**PUSH-08: نواة الإرسال**
1. **بافتراض** جهاز رد عليه FCM بـ `UNREGISTERED`، **عندما** تنتهي الدفعة، **إذن** يصبح الجهاز `invalid`، ولا يُستهدف في أي إرسال لاحق.
2. **بافتراض** رد 429 لعشر رسائل مع `Retry-After: 20`، **عندما** تُعاد، **إذن** لا تُعاد قبل 20 ثانية، ولا تتجاوز 3 محاولات، ثم تُسجل `failed`.
3. **بافتراض** جهاز تلقى حملة قبل 10 ساعات، **عندما** تُرسل حملة ثانية، **إذن** يُستبعد بسبب `cap_daily`.
4. **بافتراض** 20 خطأ `THIRD_PARTY_AUTH_ERROR` لتاجر خلال 5 دقائق، **عندما** يحدث ذلك، **إذن** يتوقف إرسال iOS له، وتصبح `apns_status = failed`، ويصل تنبيه، ويستمر أندرويد.
5. **بافتراض** حملة إلى 100,000 جهاز في بيئة الاختبار بـ `validate_only`، **عندما** تبدأ، **إذن** تنتهي خلال 5 دقائق، ورسائل حالة الطلب أثناءها تحقق p95 ≤ 60 ثانية.

**PUSH-09: الحملات**
1. **بافتراض** حملة بنص عربي فقط، **عندما** تُرسل، **إذن** يتلقى جهاز إنجليزي النص العربي، ويتلقى جهاز عربي النص العربي.
2. **بافتراض** حملة مجدولة الساعة 23:30 وساعات الهدوء 23:00–09:00، **عندما** يجدولها التاجر، **إذن** تُرفض برسالة تقترح 09:00، إلا إذا أطفأ احترام الهدوء صراحة.
3. **بافتراض** حملة مجدولة، **عندما** يلغيها التاجر قبل موعدها، **إذن** لا تُرسل أي رسالة، وتصبح الحالة `cancelled`.
4. **بافتراض** 3 حملات أُرسلت اليوم، **عندما** يجدول التاجر رابعة لليوم نفسه، **إذن** تُرفض بـ `422 daily_campaign_limit`.
5. **بافتراض** إرسال تجريبي، **عندما** يضغطه التاجر، **إذن** يصل إلى أجهزته التجريبية فقط خلال 30 ثانية، ولا يُحسب في الحدود ولا في الإحصاء.

**PUSH-10: حالة الطلب**
1. **بافتراض** طلب مربوط بجهاز، **عندما** يصل `order.status.update` بحالة `inDelivery`، **إذن** يصل إشعار «طلبك في الطريق» بلغة الجهاز خلال 60 ثانية، وفيه رابط `/_/o/{order_id}`.
2. **بافتراض** وصول الـ webhook نفسه 3 مرات، **عندما** يُعالج، **إذن** يُرسل إشعار واحد.
3. **بافتراض** أن التاجر عطّل قالب `ready`، **عندما** تتغير الحالة إلى `ready`، **إذن** لا يُرسل شيء.
4. **بافتراض** أُرسلت `delivered`، **عندما** تصل `inDelivery` متأخرة، **إذن** تُتجاهل.
5. **بافتراض** أن المتسوق أطفأ «طلباتي»، **عندما** تتغير الحالة، **إذن** لا يُرسل إليه.

**PUSH-11: السلة المتروكة**
1. **بافتراض** آلية بخطوتين (ساعة، و24 ساعة) وعميل معرّف بجهاز مسموح له، **عندما** يصل `abandoned_cart.created`، **إذن** تُجدول خطوتان.
2. **بافتراض** أن العميل أتم الطلب بعد 40 دقيقة، **عندما** يصل `abandoned_cart.completed` أو `order.create`، **إذن** تُلغى الخطوتان ولا يُرسل شيء.
3. **بافتراض** أن الخطوة الأولى تستحق الساعة 23:40، **عندما** يحين موعدها، **إذن** تُؤجل إلى ما بين 09:00 و09:20.
4. **بافتراض** عميل بلا أجهزة معرّفة، **عندما** يصل الحدث، **إذن** لا يُنشأ تسلسل، ويُسجل `no_recipient`.

## 10. المصادر

**داخلية**
- [خريطة الوحدات](README.md)، و[PRD](../01-prd.md)، و[ADR-0008](../adr/0008-platform-managed-push.md)، و[ADR-0007](../adr/0007-merchant-owned-store-accounts.md)، و[ADR-0002](../adr/0002-flutter-single-codebase.md)، و[ADR-0005](../adr/0005-laravel-modular-monolith-bff.md)، و[spikes.md](../spikes.md)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/zid_feature_capability_map.md` (Q7: الـ webhooks، وOneSignal في زد، والهوية)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/mobile_shopping_ux.md` (الطلب في السياق، ورمضان، والإرهاق)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/global_builders_features.md` (مزايا المنافسين، والرسائل متعددة اللغات)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/local_builders_teardown.md` (محرر الإشعارات عند عناقيد وطلبه كلمة مرور OneSignal)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/flutter_configurable_architecture.md` (استراتيجية Firebase)

**Firebase**
- [Firebase FAQ: حد التطبيقات والمشاريع](https://firebase.google.com/support/faq)
- [Firebase Management API: إعداد المشاريع وإدارتها](https://firebase.google.com/docs/projects/api/workflow_set-up-and-manage-project)
- [FCM: Manage registrations (FID والتقادم و270 يومًا)](https://firebase.google.com/docs/cloud-messaging/manage-tokens)
- [FCM: Throttling and Quotas](https://firebase.google.com/docs/cloud-messaging/throttling-and-quotas)
- [FCM v1: Message](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)، و[ErrorCode](https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode)
- [FCM: Send an image (iOS)](https://firebase.google.com/docs/cloud-messaging/ios/send-image)
- [FCM Flutter: client](https://firebase.google.com/docs/cloud-messaging/flutter/client)، و[receive](https://firebase.google.com/docs/cloud-messaging/flutter/receive)
- [FCM: Understanding delivery](https://firebase.google.com/docs/cloud-messaging/understand-delivery)، و[FCM Data API](https://firebase.google.com/docs/reference/fcmdata/rest)
- [firebase-admin-node#2204: طلب API لرفع مفتاح APNs](https://github.com/firebase/firebase-admin-node/issues/2204)

**Apple وAndroid**
- [Apple: New features for APNs token authentication (فبراير 2025)](https://developer.apple.com/news/?id=wy4tb0uo)
- [Apple: Establishing a token-based connection to APNs](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns)
- [Apple: Handling notification responses from APNs](https://developer.apple.com/documentation/usernotifications/handling-notification-responses-from-apns)
- [Android: Notification runtime permission](https://developer.android.com/develop/ui/views/notifications/notification-permission)

**الحزم**
- [firebase_core](https://pub.dev/packages/firebase_core)، و[firebase_messaging](https://pub.dev/packages/firebase_messaging)، و[flutter_local_notifications](https://pub.dev/packages/flutter_local_notifications)، و[app_settings](https://pub.dev/packages/app_settings)
- [laravel/framework](https://packagist.org/packages/laravel/framework)، و[Laravel 13 Queues](https://laravel.com/docs/13.x/queues)، و[Horizon](https://laravel.com/docs/13.x/horizon)، و[google/auth](https://packagist.org/packages/google/auth)، و[kreait/firebase-php (beste)](https://github.com/beste/firebase-php)

**زد وOneSignal والأبحاث**
- [Zid: Webhooks](https://docs.zid.sa/webhooks)، و[View Abandoned Cart](https://docs.zid.sa/get-abandoned-cart-details)، و[OneSignal Store Settings](https://docs.zid.sa/create-or-update-onesignal-store-settings-39429264e0)
- [OneSignal pricing](https://onesignal.com/pricing)، و[Create an app](https://documentation.onesignal.com/reference/create-an-app)، و[Android Firebase credentials](https://documentation.onesignal.com/docs/android-firebase-credentials)
- [Airship: Push Notification Benchmarks 2026](https://www.airship.com/mobile-app-push-notification-benchmarks-for-2026/)
