# M01: أساس تطبيق المتسوق

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Flutter (iOS وأندرويد)، ومستهلك لعقود Laravel |
| المتطلبات | F-S01, F-S03, F-P04، ودعم F-P03 من جهة التطبيق |
| القرارات | ADR-0002, ADR-0003, ADR-0004, ADR-0006 |
| تعتمد على | M02 (الـ tokens والخطوط واللغة تُطبَّق فوق هذا الأساس)، وM11 (endpoints التخطيط والهوية)، وM12 (endpoint الأعلام وإصدار الحد الأدنى)، وM13 (يملك `tool/tenantize.dart` الذي يكتب الهوية الأصلية ويولّد ثوابت التاجر)، وM03 (رقم مراجعة حزمة العقود وقائمة الكتل) |
| بادئة القصص | APP |

## 1. الغرض والنطاق

M01 هو الهيكل الذي تُبنى فوقه كل شاشات التطبيق: المستودع والحزم، والبيئات، وحقن التاجر وقت البناء، وتسلسل الإقلاع، والتوجيه، والحالة، وعميلا الشبكة، والتخزين المؤقت، والأخطاء، والأعلام، والتحديث الإجباري، والمراقبة، والاختبار، وCI. لا يرسم M01 أي شاشة تجارية. كل الوحدات الأخرى في التطبيق (M02 إلى M09) تضيف شاشاتها ومزوّداتها عبر نقاط التوسعة المعرّفة هنا.

### داخل الإصدار الأول (Must)
- مستودع واحد بأربع حزم: `app` و`storefront_ui` و`zid_client` و`platform_client`، بـ Dart pub workspaces وMelos.
- ثلاث بيئات `dev` و`staging` و`prod`، وحقن التاجر بـ `--dart-define-from-file` وفق ADR-0002: مفاتيح `TenantConfig` التي يقرؤها التطبيق، وتشغيل محلي بتاجرين. أما أداة `tool/tenantize.dart` التي تكتب الهوية الأصلية فيملكها M13 (القسم 3.2 فيه).
- تسلسل إقلاع ثابت: إبقاء السبلاش الأصلي، ثم تحميل الإعداد المخزّن أو اللقطة المضمّنة، ثم الرسم، ثم إعادة التحقق في الخلفية (ADR-0006).
- التوجيه بـ `go_router`، والغلاف بخمسة تبويبات (F-S03)، ونقطة دخول واحدة للروابط تستخدمها M06 وM07.
- إدارة الحالة بـ Riverpod 3، مع تجاوز `tenantConfigProvider` في `ProviderScope`.
- عميل زد (Storefront API) بمخزن cookies آمن وترويستي `Zid-Client-Platform` و`Accept-Language`، وجسر cookies مع الـ WebView.
- عميل API المنصة بترويسات التوافق (`X-App-Version` وقائمة الكتل) وطلبات شرطية بـ ETag.
- طبقة تخزين مؤقت للإعداد والصور، وأداة `JsonCache` بعمر محدد تستخدمها الوحدات الأخرى.
- تصنيف موحّد للأخطاء، وحالات التحميل والفراغ والخطأ القياسية.
- الأعلام ومفاتيح الإيقاف و`min_supported_app_version`: تحديث فوري داخل التطبيق على أندرويد، وتحويل إلى App Store على iOS، وشاشة صيانة (F-P04).
- Sentry بوسوم `tenant_id` و`layout_version`، وتنظيف البيانات الشخصية، ورفع رموز التصحيح.
- ميزانية حجم ≤ 40 MB، وميزانية إقلاع، وفحصهما آليًا.
- إعداد الاختبارات (unit وwidget وgolden وintegration) وCI لمستودع التطبيق.

### لاحقًا (Should/Could)
- قناة Shorebird لإصلاحات Dart الطارئة (ADR-0006، البند 5). Should.
- التحديث المرن (flexible) على أندرويد وتنبيه «يتوفر إصدار جديد» غير الحاجب. Should.
- تصفح دون اتصال لما بعد الرئيسية (آخر تصنيفات ومنتجات زارها المتسوق). Could.

### ليس من مسؤولية M01
- مخطط الـ tokens وتحويلها إلى `ThemeData`، والخطوط، والـ RTL، والترجمة: M02.
- سجل الكتل وغلاف الصفحة وموجّه الأفعال: M03. يستخدم M03 نوع `AppLocation` المعرّف هنا.
- شاشات التسوق والدفع في WebView: M04. يستخدم M04 جسر الـ cookies المعرّف هنا.
- الدخول والجلسة والطلبات: M05.
- تسجيل الإشعارات: M06. وصيغة الروابط ومحلّلها: M07.
- تصنيف الأحداث التحليلية وجمعها: M08. يقدّم M01 واجهة `Telemetry` فقط.
- تقديم endpoints الأعلام والتخطيط والهوية من الخادم: M11 وM12. ويحدد M01 ما يحتاجه منها.
- جلب `tenant.json` من الخادم، وأداة `tool/tenantize.dart`، والتوقيع، والرفع إلى المتاجر: M13.

## 2. المكونات حسب الطبقة

### 2.1 سلسلة الأدوات

| الأداة | الإصدار المثبّت | ملاحظة |
|---|---|---|
| Flutter | 3.47.9 (stable، 2026-10-29) | يحمل Dart 3.13.7 ([قائمة إصدارات Flutter](https://storage.googleapis.com/flutter_infra_release/releases/releases_macos.json)). يُرفع إلى 3.50 بعد صدوره مستقرًا وبعد مرور CI |
| Dart | 3.13.7 | قيد `sdk: ^3.13.0` في كل الحزم، لأن `material_ui` و`google_fonts` 9 يشترطانه |
| Material | `material_ui` 1.11.0 بدل `package:flutter/material.dart` | المكتبة فُصلت عن الـ SDK، وتصبح مكتبة الإطار مهملة رسميًا في 3.50 ([دليل الترحيل](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)). و`go_router` 18 يعتمد عليها أصلًا ([سجل go_router](https://pub.dev/packages/go_router/changelog)) |
| Cupertino | `cupertino_ui` 1.1.6 | لا يُستخدم إلا عند الحاجة لمكوّن iOS بعينه |

قاعدة: لا يُكتب `import 'package:flutter/material.dart'` في أي ملف جديد. ويمنع ذلك lint مخصص في `analysis_options.yaml`، وتُرحَّل الملفات المولّدة بـ `dart fix --apply --code=migrate_design_widgets`. وإن اعتمدت حزمة خارجية على مكتبة الإطار القديمة، يُلف التطبيق بـ `MaterialUiCompatibilityBridge` في `MaterialApp.builder`، وهو ينقل الثيم والترجمة فقط ولا يحل تعارض الأنواع في واجهات الحزم ([المصدر](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)).

### 2.2 هيكل المستودع

مستودع مستقل للتطبيق باسم `intishar-app` (ADR-0001، البند 4)، بـ [pub workspaces](https://dart.dev/tools/pub/workspaces) ملف قفل واحد في الجذر، وMelos 8 للأوامر عبر الحزم، وإعداده تحت مفتاح `melos:` في `pubspec.yaml` الجذري بلا ملف `melos.yaml` ([pub.dev/melos](https://pub.dev/packages/melos)).

```text
intishar-app/
├── pubspec.yaml                 # workspace: [apps/shopper, packages/*] + melos: scripts
├── analysis_options.yaml        # very_good_analysis + قواعد المشروع
├── env/
│   ├── dev.json                 # ENV=dev, LOG_LEVEL, SENTRY_TRACES_SAMPLE_RATE
│   ├── staging.json
│   └── prod.json
├── tenants/
│   ├── sample-perfume.json      # tenant.json تجريبي بمخطط M13 (لا أسرار)
│   └── sample-electronics.json
├── tool/
│   ├── tenantize.dart           # يملكه M13: الهوية الأصلية، وtenant.defines.json، واللقطة
│   └── check_size.dart          # يقارن analyze-size بالميزانية
├── apps/shopper/                # تطبيق Flutter الوحيد
│   ├── android/ ios/
│   ├── assets/tenant/           # snapshot.json تكتبه tenantize، ولا يُحرَّر يدويًا
│   ├── lib/
│   │   ├── main.dart
│   │   ├── bootstrap/           # BootstrapLoader, SplashGate, BootstrapData
│   │   ├── config/              # TenantConfig, Env, FeatureFlags, ConfigRepository
│   │   ├── routing/             # AppRouter, AppLocation, AppEntry, routes.dart
│   │   ├── shell/               # AppShell (الشريط السفلي)
│   │   ├── data/                # CacheStore, JsonCache, SecureCookieStorage, ImageCache
│   │   ├── errors/              # AppFailure, AsyncValueView, حالات قياسية
│   │   ├── update/              # UpdateGate, ForceUpdateScreen, MaintenanceScreen
│   │   ├── observability/       # Sentry init, AppLogger, Telemetry
│   │   └── features/            # تضيفها M03 إلى M09، كل وحدة في مجلد
│   ├── test/ integration_test/
│   └── pubspec.yaml             # resolution: workspace
└── packages/
    ├── storefront_ui/           # Dart + Flutter فقط، بلا plugins (يُبنى للويب أيضًا)
    ├── zid_client/              # Dart خالص: Storefront API
    └── platform_client/         # Dart خالص: API المنصة
```

### 2.3 الحزم ومسؤولياتها وقواعد الاعتماد

| الحزمة | النوع | المسؤولية | يُسمح لها بالاعتماد على |
|---|---|---|---|
| `apps/shopper` | تطبيق Flutter | الإقلاع، والتوجيه، وربط التنفيذات الحقيقية (التخزين الآمن، والـ WebView، وSentry)، والشاشات | كل الحزم |
| `storefront_ui` | Flutter بلا plugins | الكتل (M03)، ومحوّل الـ tokens (M02)، والمكونات المشتركة، والحالات القياسية. تُبنى لمعاينة Flutter Web (SPK-15) | `material_ui`، و`intl`، وواجهات مجرّدة فقط (`ImageResolver` و`Telemetry` و`AppNavigator`) |
| `zid_client` | Dart خالص | عميل Storefront API: الطلبات، والترويسات، وتحويل الأخطاء، والنماذج | `dio`، و`cookie_jar`، و`dio_cookie_manager`، و`freezed_annotation`، و`json_annotation` |
| `platform_client` | Dart خالص | عميل API المنصة: الأعلام، والهوية، والصفحات، والطلبات الشرطية | `dio`، و`freezed_annotation`، و`json_annotation`، و`pub_semver` |

قاعدتان ملزمتان: لا تستورد `storefront_ui` أي plugin أصلي حتى تبقى قابلة للبناء للويب. ولا يعرف `zid_client` ولا `platform_client` شيئًا عن Flutter، فتُختبر بـ `dart test` بسرعة.

### 2.4 المكتبات والإصدارات

الإصدارات من [pub.dev API](https://pub.dev/api/packages/go_router) بتاريخ 2026-11-10. تُثبَّت بقيد `^` في `pubspec.yaml` الجذري، ويُحدَّث القفل في PR مستقل.

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `go_router` | 18.1.4 | التوجيه. يشترط Flutter 3.44 أو أحدث |
| `flutter_riverpod` | 3.5.0 | الحالة وحقن الاعتماديات |
| `riverpod_annotation` / `riverpod_generator` | 4.0.8 / 4.0.10 | توليد المزوّدات |
| `riverpod_lint` | 3.2.0 | قواعد تحليل Riverpod |
| `freezed` / `freezed_annotation` | 4.0.3 / 3.1.0 | النماذج غير القابلة للتعديل و`sealed` |
| `json_serializable` / `json_annotation` | 6.15.2 / 4.12.0 | تحويل JSON |
| `build_runner` | 2.17.1 | التوليد |
| `dio` | 5.11.1 | HTTP |
| `cookie_jar` / `dio_cookie_manager` | 4.0.9 / 3.5.0 | مخزن cookies زد |
| `flutter_secure_storage` | 11.2.0 | Keychain وKeystore للـ cookies |
| `shared_preferences` | 2.5.6 | تفضيلات صغيرة غير سرية |
| `path_provider` | 2.1.6 | مسارات القرص |
| `cached_network_image` / `flutter_cache_manager` | 4.0.6 / 3.5.0 | تخزين الصور |
| `flutter_native_splash` | 2.4.8 | السبلاش الأصلي و`preserve()` |
| `flutter_launcher_icons` | 0.14.4 | الأيقونات من `tenant.json` |
| `package_info_plus` | 10.2.2 | رقم الإصدار والبناء وقت التشغيل |
| `pub_semver` | 2.2.1 | مقارنة الإصدارات |
| `in_app_update` | 5.0.0 | التحديث الفوري على أندرويد |
| `url_launcher` | 6.3.3 | فتح App Store وروابط خارجية |
| `connectivity_plus` | 7.3.2 | تلميح حالة الاتصال |
| `sentry_flutter` / `sentry_dart_plugin` | 10.3.0 / 3.4.0 | الانهيارات ورفع الرموز |
| `uuid` | 4.6.0 | معرّف التثبيت |
| `webview_flutter` | 4.14.1 | يستخدمه M04 وM05. M01 يقدّم جسر الـ cookies فقط |
| `very_good_analysis` | 11.0.0 | قواعد التحليل |
| `mocktail` | 1.0.5 | المحاكاة في الاختبارات |
| `alchemist` | 0.14.1 | اختبارات golden |
| `patrol` | 4.11.0 | اختبارات تكامل مع حوارات النظام |
| `melos` | 8.10.1 | أوامر المستودع (dev dependency في الجذر) |

حزم مرفوضة صراحة: `upgrader` (منطق التحديث يأتي من endpoint الأعلام لا من متجر Apple مباشرة)، و`http_mock_adapter` (آخر إصدار 2023)، و`hive` وقواعد البيانات المحلية (لا يحتاج الإصدار الأول إلى أكثر من ملفات JSON).

### 2.5 البيئات

| البيئة | الغرض | API المنصة | متجر زد | Sentry environment | معرّف الحزمة |
|---|---|---|---|---|---|
| `dev` | التطوير المحلي والمحاكي | خادم محلي أو dev | المتجر التطويري (P-2) | `dev` | `{bundle_id}.dev` |
| `staging` | التحقق من معايير القبول، وTestFlight الداخلي | staging | المتجر التطويري أو متجر تاجر تجريبي | `staging` | `{bundle_id}.stg` |
| `prod` | المتاجر | prod | متجر التاجر | `prod` | `{bundle_id}` |

ملف البيئة يحمل ما يختلف بين البيئات ولا يخص تاجرًا. أما روابط الـ API وDSN فتأتي في ثوابت التاجر، لأن الخادم يولّد `tenant.json` لكل بيئة. وليس في أي منهما سر. كل ما يُمرَّر بـ `--dart-define` يمكن استخراجه من الملف التنفيذي، فـ DSN الخاص بـ Sentry وروابط الـ API مقبولة، أما مفاتيح الخادم فلا.

```json
{
  "ENV": "staging",
  "SENTRY_TRACES_SAMPLE_RATE": "1.0",
  "LOG_LEVEL": "debug"
}
```

### 2.6 ثوابت التاجر

يولّد الخادم `tenant.json` بمخطط M13 (القسم 5.1 فيه)، وتحوّله `tool/tenantize.dart` إلى `build/tenant.defines.json` بالثوابت غير السرية. ويُمرَّر مع ملف البيئة بتكرار الخيار، وهذا مدعوم: «Multiple defines can be passed by repeating "--dart-define-from-file"»، ويقبل الخيار ملفات `.json` و`.env` (من `flutter build -h`). وأي مفتاح في `--dart-define` المباشر يتقدم على الملف.

```bash
flutter build appbundle --release \
  --dart-define-from-file=env/prod.json \
  --dart-define-from-file=build/tenant.defines.json \
  --obfuscate --split-debug-info=build/symbols
```

| المفتاح | النوع | مثال | الاستخدام |
|---|---|---|---|
| `TENANT_ID` | String | `t_8f2k1q` | المعرّف العام في مسارات المنصة (M11)، ووسم Sentry |
| `API_BASE_URL` | String | `https://api.intishar.app` | API المنصة غير المخزّن (مثل BFF الطلبات في M05) |
| `CONFIG_CDN_URL` | String | `https://cfg.intishar.app` | الأعلام والهوية والصفحات خلف CDN |
| `SENTRY_DSN` | String | DSN عام | القسم 5.5 |
| `STORE_DOMAIN` | String | `mahasen.com` | أساس `https://{STORE_DOMAIN}/api/v1/` |
| `STORE_ID` | String | `123456` | التحليلات والطلبات (M05 وM08) |
| `APPLICATION_ID_ANDROID` | String | `sa.mahasen.app` | رابط Google Play في التحديث الإجباري |
| `APP_STORE_ID` | String | `6737545437` | رابط App Store في التحديث الإجباري |
| `DEFAULT_LOCALE` | String | `ar` | قبل أن يختار المتسوق |
| `SUPPORTED_LOCALES` | String | `ar,en` | ما يفعّله التاجر |
| `DEEP_LINK_HOSTS` | String | `mahasen.com,link.example-platform.sa` | يستخدمه M07 |
| `DEFAULT_FLAGS` | String (JSON مضغوط) | `{"wishlist":true}` | قيم الأعلام قبل أول جلب |
| `SNAPSHOT_VERSION` | String | `theme@57;home@1842` | للتحقق من عمر اللقطة المضمّنة |

يقرأ التطبيق هذه القيم في `TenantConfig.fromEnvironment()` بـ `String.fromEnvironment`، ويرفض الإقلاع في وضع debug إن نقص مفتاح إلزامي (assert)، ويسجّل خطأً قاتلًا في release. المفاتيح الخمسة الأولى يسميها M13 صراحة، والبقية يطلبها هذا المستند من M13 لتُضاف إلى `tenant.defines.json` (القسم 8.2).

### 2.7 حدود المسؤولية مع `tool/tenantize.dart`

الأداة في مستودع التطبيق، ويحدد M13 خطواتها: الأيقونات بـ `flutter_launcher_icons` (مع `remove_alpha_ios: true`)، والسبلاش بـ `flutter_native_splash` (أيقونة أندرويد 12 بقياس 1152×1152 داخل دائرة 768، [pub.dev](https://pub.dev/packages/flutter_native_splash))، و`Tenant.xcconfig` و`tenant.properties` والاسم بلغتين، وملفات Firebase، واللقطة، و`tenant.defines.json`. وما يطلبه M01 منها:

| المطلوب | لماذا |
|---|---|
| `android/app/build.gradle.kts` يقرأ `applicationId` من `android/tenant.properties`، و`Release.xcconfig` يضمّن `Tenant.xcconfig` | يكتبهما M01 في القالب مرة واحدة، فتعمل الأداة بلا تعديل يدوي |
| `flutter_deeplinking_enabled = false` و`FlutterDeepLinkingEnabled = false` ثابتان في القالب، ولا تغيّرهما الأداة | القسم 3.4 |
| `assets/tenant/snapshot.json` بالشكل في 4.3 (أعلام وهوية و`app-shell` والرئيسية لكل لغة مدعومة) | الإقلاع الأول بلا شبكة |
| أن تكون الأداة idempotent، وتفشل برسالة تسمي الحقل الناقص | التطوير المحلي وCI |

التشغيل المحلي: `dart run tool/tenantize.dart --config tenants/sample-perfume.json --offline`، ثم `flutter run --dart-define-from-file=env/dev.json --dart-define-from-file=build/tenant.defines.json`. وخيار `--offline` (يطلبه M01 من M13) يتخطى تنزيل الأصول ويستخدم نسخًا في `tenants/assets/`.

### 2.8 الاختبارات وCI لمستودع التطبيق

| النوع | الأداة | ما يغطي | أين يعمل |
|---|---|---|---|
| unit | `package:test` و`mocktail` | `zid_client` و`platform_client` و`UpdateGate` و`CacheStore` ومقارنة الإصدارات | كل PR، Linux |
| widget | `flutter_test` مع `ProviderScope` | الشاشات والحالات القياسية، في `ar` و`en`، وبتكبير 1.0 و2.0 | كل PR، Linux |
| golden | `alchemist` 0.14.1 | CI goldens بخط Ahem للشكل العام، ومجموعة صغيرة بخطوط حقيقية تُولَّد داخل صورة Docker مثبتة لـ Flutter 3.47.9 حتى تظهر الحروف العربية فعلًا ([pub.dev/alchemist](https://pub.dev/packages/alchemist)) | كل PR، Linux |
| integration | `integration_test` و`patrol` 4.11.0 | الإقلاع بلا شبكة، والرابط العميق البارد، والتحديث الإجباري، وحوارات النظام | ليليًا على محاكي أندرويد، ويدويًا على iOS قبل كل إصدار |
| contract | fixtures من `06-api/` وعينات SPK | شكل الأعلام والهوية والغلاف، واستجابات زد | كل PR |

مراحل CI على GitHub Actions:
1. `dart pub get` في الجذر (ملف قفل واحد).
2. `dart run build_runner build -d` لكل حزمة. الملفات المولّدة لا تُضاف إلى Git.
3. `dart format --set-exit-if-changed .` و`dart analyze --fatal-infos`.
4. `melos run test` مع التغطية: ≥ 80% لـ `zid_client` و`platform_client`، و≥ 60% لـ `apps/shopper`.
5. اختبارات golden.
6. `flutter build appbundle --release --target-platform android-arm64 --analyze-size` بتاجر تجريبي، ثم `tool/check_size.dart`.
7. ليليًا وعلى الفرع الرئيسي فقط: `flutter build ios --release --no-codesign` على macOS، واختبارات التكامل.

PR يعمل على Linux فقط، لأن دقيقة macOS أغلى بنحو عشر مرات (0.062 مقابل 0.006 دولار، وفق [تسعير GitHub Actions](https://docs.github.com/en/billing/reference/actions-runner-pricing)). وبناء المتاجر الموقّع ليس هنا، بل في M13 (D-05).

## 3. التدفقات

### 3.1 الإقلاع البارد

الميزانية الكلية: أقل من 2 ثانية حتى رئيسية تفاعلية على جهاز أندرويد متوسط من تخطيط مخزّن (PRD §3).

1. `main()` يستدعي `WidgetsFlutterBinding.ensureInitialized()`، ثم `FlutterNativeSplash.preserve(widgetsBinding: binding)` ([pub.dev](https://pub.dev/packages/flutter_native_splash)).
2. يقرأ `TenantConfig` و`Env` من الثوابت (متزامن، 0 ms).
3. يستدعي `SentryFlutter.init(..., appRunner: _run)`، ويكمل الإقلاع داخل `appRunner` حتى تُلتقط أخطاؤه.
4. يشغّل `BootstrapLoader.load()` بالتوازي (`Future.wait`)، وسقفه 600 ms:
   - فتح `CacheStore` في `getApplicationSupportDirectory()`.
   - قراءة cookies زد من التخزين الآمن إلى `PersistCookieJar`.
   - قراءة الأعلام والـ tokens وإعداد الشاشات الأصلية (`app-shell`) وتخطيط الرئيسية للغة الحالية من القرص.
   - إن غاب أي منها أو كان تالفًا أو كان `schema_version` الخاص به لا يطابق مراجعة حزمة العقود المضمّنة في هذا الإصدار (M03): يُقرأ بدله من `assets/tenant/snapshot.json`.
   - تسجيل خط التاجر إن كان غير مضمّن ومحفوظًا على القرص (M02، عبر `FontLoader`)، بحد عائلتين وأربعة ملفات.
5. إن تجاوز التحميل 600 ms: يكمل بما اكتمل، ويستخدم اللقطة لما لم يكتمل، ويسجّل `bootstrap_slow` في Telemetry.
6. يقيّم بوابة التحديث على الأعلام المخزّنة: إن كان الإصدار الحالي أقل من `min_supported_version` يكون أول مسار `/update-required`، وإن كانت الصيانة مفعّلة يكون `/maintenance`. وإلا يكون `/home`.
7. يبني `ProviderScope` بتجاوز `tenantConfigProvider` و`envProvider` و`bootstrapDataProvider`، ثم `runApp`.
8. حين ترسم الرئيسية أول إطار من التخطيط المخزّن، يستدعي `FlutterNativeSplash.remove()` في `addPostFrameCallback`، ويسجّل `home_first_frame_ms`. وسقف أمان: يُزال السبلاش بعد 2.5 ثانية مهما حدث.
9. بعد أول إطار تبدأ إعادة التحقق في الخلفية (3.2)، وتبدأ الوحدات الأخرى أعمالها المؤجلة، مثل فحص الجلسة (M05) وتسجيل الإشعارات (M06).

مسار الخطأ: أي استثناء في الخطوة 4 لا يوقف الإقلاع. تُحذف المدخلة التالفة من القرص، وتُستخدم اللقطة، ويُرسل خطأ non-fatal إلى Sentry. وإن كانت اللقطة نفسها غير صالحة (خطأ بناء)، تُعرض شاشة خطأ عامة بزر «إعادة المحاولة» تجلب من الشبكة، ويُسجَّل خطأ fatal.

### 3.2 إعادة التحقق في الخلفية وتطبيق النسخة الجديدة

1. بعد أول إطار، يطلب `GET flags` بـ `If-None-Match` بالـ ETag المخزّن.
2. إن عاد 304: يحدّث `fetched_at` فقط.
3. إن عاد 200: يحفظ الأعلام، ويطبّق مفاتيح الإيقاف وبوابة التحديث فورًا (3.3)، ويقارن أرقام `config` (مثل `home` و`app-shell` و`theme`) بالمخزّن.
4. لكل مورد تغيّر رقمه (الهوية أو صفحة): يطلبه بـ `If-None-Match`، ثم يتحقق منه بالنموذج (`fromJson` بلا استثناء)، ثم يحفظه ذريًا (كتابة إلى ملف مؤقت ثم `rename`).
5. لا تُبدَّل الشاشة المعروضة تحت إصبع المتسوق. تُعلَّم النسخة الجديدة «جاهزة»، وتُطبَّق عند التنقل التالي إلى الصفحة نفسها، أو عند العودة إلى التطبيق بعد 30 دقيقة في الخلفية، أو عند السحب للتحديث. والهوية (الألوان والخط) تُطبَّق عند الإقلاع التالي، أو فورًا إن كانت الرئيسية في أعلى التمرير ولم يلمس المتسوق الشاشة بعد.
6. عند عودة التطبيق إلى المقدمة بعد 15 دقيقة أو أكثر، تتكرر الخطوات 1 إلى 5.
7. مسار الخطأ: فشل الشبكة أو 5xx لا يظهر للمتسوق. يُعاد المحاولة مرة عند العودة إلى المقدمة. وإن فشل التحقق من النموذج، تُرفض النسخة وتبقى القديمة، ويُرسل non-fatal بوسم `config_invalid` مرة واحدة لكل نسخة.

### 3.3 الأعلام ومفاتيح الإيقاف والتحديث الإجباري

1. `UpdateGate` يقارن `PackageInfo.version` بقيم المنصة الحالية (`ios` أو `android`) بـ `pub_semver`.
2. **إصدار أقل من `min_supported_version`**: شاشة `ForceUpdateScreen` حاجبة، بلا زر رجوع، وبالعربية والإنجليزية.
   - **أندرويد**: يستدعي `InAppUpdate.checkForUpdate()`. إن كان التحديث متاحًا (`UPDATE_AVAILABLE` في Play Core) والنوع الفوري مسموحًا، يستدعي `performImmediateUpdate()` فيعرض Google Play تدفق التحديث ثم يعيد تشغيل التطبيق ([Android Developers](https://developer.android.com/guide/playcore/in-app-updates)). إن رفض المتسوق أو فشل التدفق، يبقى على الشاشة الحاجبة بزر «تحديث» يكرر المحاولة، وزر ثانٍ يفتح `https://play.google.com/store/apps/details?id={APPLICATION_ID}`. وإن عاد التطبيق إلى المقدمة وحالة التحديث `DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS`، يُستأنف التحديث ([Android Developers](https://developer.android.com/guide/playcore/in-app-updates/kotlin-java)).
   - **iOS**: لا يوجد API للتحديث داخل التطبيق. الزر يفتح `https://apps.apple.com/app/id{APP_STORE_ID}` بـ `url_launcher` في وضع `LaunchMode.externalApplication`.
3. **إصدار بين الحد الأدنى وآخر إصدار، و`update_policy = soft`**: شريط غير حاجب في أعلى الرئيسية «يتوفر إصدار أحدث»، يظهر مرة لكل إصدار جديد، ولا يعود قبل 72 ساعة إن أُغلق. (Should: التدفق المرن على أندرويد.)
4. **صيانة**: `maintenance.active = true` تعرض `MaintenanceScreen` برسالة التاجر أو المنصة، وزر «إعادة المحاولة» يعيد جلب الأعلام.
5. **مفتاح إيقاف ميزة**: `FeatureFlags.isKilled(Kill.checkout)` يقرأه كل مدخل للميزة. الميزة المطفأة تختفي من الواجهة، أو تُستبدل بحالة «غير متاحة مؤقتًا». وإيقاف الكتل المعطوبة يأتي في `blocks.disabled` (يضيفه M11)، ويقرؤه سجل الكتل في M03.
6. **وقت التطبيق**: بوابة التحديث والصيانة تُطبَّقان فورًا عند وصولهما، إلا إذا كان المتسوق داخل WebView الدفع. حينها تؤجَّلان حتى يُغلق الـ WebView أو يكتمل الطلب، حتى لا ينقطع دفع جارٍ.
7. مسار الخطأ: إن لم تصل أعلام قط (أول تشغيل بلا شبكة)، تُستخدم `DEFAULT_FLAGS` من `tenant.json` وأعلام اللقطة. ولا تُحجب الواجهة أبدًا بسبب فشل جلب الأعلام.

### 3.4 نقطة دخول الروابط (يستخدمها M06 وM07)

1. يُعطَّل الربط العميق المدمج في Flutter، لأنه مفعّل افتراضيًا منذ 3.27 ([Flutter](https://docs.flutter.dev/release/breaking-changes/deep-links-flag-change))، ولو بقي لفتح `go_router` مسارات الويب الخام مثل `/products/x` مباشرة دون تحليل:
   - أندرويد: `flutter_deeplinking_enabled = false` في `AndroidManifest.xml`.
   - iOS: `FlutterDeepLinkingEnabled = false` في `Info.plist`.
2. M07 يلتقط الروابط (Universal Links وApp Links وQR)، وM06 يلتقط نقرات الإشعارات. وكلاهما يستدعي `AppEntry.open(uri, source: ...)` فقط، ولا يستدعي `GoRouter` مباشرة.
3. `AppEntry` يضع الرابط في طابور بسعة رابط واحد (الأحدث يلغي الأقدم) إن كان الإقلاع لم يكتمل، أو كانت بوابة التحديث أو الصيانة فعّالة.
4. بعد أول إطار للرئيسية، يمرّر الرابط إلى `LinkResolver` الذي يقدّمه M07، فيعيد `AppLocation` أو `null`.
5. `AppNavigator.open(location)` يحوّل الموقع إلى مسار `go_router`. المسارات الفرعية للتبويبات تُدفع فوق الرئيسية، فيبقى زر الرجوع يعيد المتسوق إلى المتجر لا خارج التطبيق.
6. إن أعاد المحلّل `null`: تبقى الرئيسية، ويُرسل حدث `link_unresolved` عبر Telemetry (اسمه ومحتواه من M07 وM08).
7. حتى يكتمل M07، يُربط `NoopLinkResolver` الذي يعيد `null` دائمًا.

### 3.5 طلب إلى زد

1. الشاشة تستدعي مستودعًا (مثل `CatalogRepository` في M04)، والمستودع يستدعي `ZidClient`.
2. `ZidClient` يبني الطلب على `https://{STORE_DOMAIN}/api/v1/{path}`.
3. المعترِضات بالترتيب:
   - `ZidHeadersInterceptor`: يضيف `Zid-Client-Platform: mobile-app` و`Accept-Language` (من اللغة الحالية) و`Accept: application/json`.
   - `CookieManager(jar)`: يضيف cookies المتجر ويحفظ ما يعود.
   - `CsrfInterceptor`: إن وُجدت cookie باسم `csrftoken` والطريقة غير آمنة (`POST` و`PUT` و`PATCH` و`DELETE`)، يضيف `X-CSRFToken`. هذا خلف علم `zid.csrf_header` حتى يؤكده اختبار المتجر التطويري (8.1).
   - `RetryInterceptor`: لطلبات GET فقط. محاولتان بعد 400 ms ثم 1200 ms مع عشوائية ±20%، عند انقطاع الشبكة أو 502 أو 503 أو 504. وعند 429 محاولة واحدة بعد `Retry-After` إن كان ≤ 5 ثوانٍ.
   - `ErrorMappingInterceptor`: يحوّل الخطأ إلى `AppFailure` (القسم 5.4).
4. المهلة: الاتصال 10 ثوانٍ، والاستقبال 15 ثانية.
5. لا يُعاد أي طلب كتابة آليًا. إعادة محاولة إضافة إلى السلة قرار M04.
6. كل 401 أو 403 من مسار حساب يرسل حدث `SessionExpired` على `sessionEventsProvider`، ويقرر M05 ما يفعل.

### 3.6 جسر الـ cookies مع الـ WebView (لـ M04 وM05)

1. قبل فتح `/checkout` أو `/checkout/guest` أو صفحة الدخول، يستدعي M04 أو M05 `CookieBridge.pushToWebView(storeUri)`. فيقرأ cookies المتجر من الـ jar ويكتبها بـ `WebViewCookieManager.setCookie` قبل `loadRequest`.
2. عند إغلاق الـ WebView أو عند تغيّر الرابط إلى صفحة غير دفع، يستدعي `CookieBridge.pullFromWebView(storeUri)`. فيقرأ `WebViewCookieManager.getCookies(domain)` ([API](https://pub.dev/documentation/webview_flutter/latest/webview_flutter/WebViewCookieManager-class.html)) ويحدّث الـ jar، ثم يحفظه في التخزين الآمن.
3. عند الخروج يستدعي M05 `CookieBridge.clearAll()`، فتُمسح cookies الـ jar وcookies كل الـ WebViews (`clearCookies()`).
4. نجاح هذا التدفق للدخول مرهون بـ SPK-05، وللترويسة في كل تنقل بـ SPK-04. الجسر يُبنى الآن، ويُثبَّت سلوكه بعد التجربتين.

### 3.7 الإبلاغ عن الخطأ

1. `FlutterError.onError` و`PlatformDispatcher.instance.onError` يمرّان إلى Sentry (يتولاهما `SentryFlutter.init`).
2. في release، `ErrorWidget.builder` يرسم مربعًا محايدًا فارغًا بدل الشاشة الحمراء. وحاجز أخطاء الكتل في M03.
3. `beforeSend` ينظّف الحدث (القسم 7.2)، ثم يضيف الوسوم من `SentryScope`.
4. الأخطاء المتوقعة (`NetworkFailure` و`NotFoundFailure`) لا تُرسل إلى Sentry. تُضاف كـ breadcrumb فقط.

### 3.8 تشغيل تاجرين محليًا
1. `dart run tool/tenantize.dart --config tenants/sample-perfume.json --offline` (أداة M13).
2. `flutter run --dart-define-from-file=env/dev.json --dart-define-from-file=build/tenant.defines.json`.
3. تكرار الخطوتين بالتاجر الثاني يجب أن يعطي تطبيقين باسمين وأيقونتين ومعرّفين مختلفين على الجهاز نفسه. هذا هو اختبار القبول المحلي لـ ADR-0002، ويكمله SPK-13 في CI.
4. قبل أن تجهز الأداة: يكفي ملف `tenants/sample-perfume.defines.json` مكتوب يدويًا لتشغيل التطبيق بتاجر واحد دون تغيير الهوية الأصلية.

## 4. نموذج البيانات

### 4.1 على الجهاز

| البيانات | المكان | الصيغة | الحداثة | السقف | تُمسح عند |
|---|---|---|---|---|---|
| cookies زد (`session` و`csrftoken` و`locale`) | Keychain أو Keystore عبر `SecureCookieStorage` | سلاسل cookie_jar | حسب انتهاء الـ cookie، و`persistSession: true` | — | الخروج، وحذف الحساب |
| الأعلام | `support/config/flags.json` | JSON المنصة كما هو | تُعاد كل إقلاع وكل عودة بعد 15 دقيقة | 16 KB | ترقية الإصدار لا تمسحها |
| الهوية (tokens) | `support/config/theme.json` | مخطط M02 | بحسب `config.theme` | 16 KB | اختلاف `token_schema` أو `schema_version` عن الإصدار |
| الصفحات | `support/config/pages/{page}_{segment}_{locale}.json` | غلاف M03 | بحسب `config` | 300 KB للصفحة، و5 MB لكل الصفحات (M03، 4.4) | اختلاف `schema_version` عن مراجعة حزمة العقود في الإصدار |
| إعداد الشاشات الأصلية | `support/config/shell_{locale}.json` | مخطط M03 | بحسب `config.app-shell` | 64 KB | كذلك |
| فهرس الإعداد | `support/config/index.json` | `CacheEntry[]` | — | — | مع ما يفهرسه |
| خطوط التاجر | `support/fonts/` | TTF أو OTF | بحسب `font.version` | 4 ملفات، 2 MB | تغيّر الخط (M02) |
| الصور | `cache/intishar_images/` بـ `flutter_cache_manager` | ملفات | 14 يومًا | 600 ملف | قرار النظام عند امتلاء التخزين |
| `JsonCache` العام | `cache/json/{namespace}/{key}.json` | JSON | TTL يحدده المستخدم (مثل 24 ساعة لشجرة التصنيفات) | 2 MB للمساحة | انتهاء TTL |
| معرّف التثبيت | `shared_preferences` بمفتاح `install_id` | UUID v4 | دائم حتى حذف التطبيق | — | حذف التطبيق |
| تفضيلات اللغة والوضع الداكن والأرقام | `shared_preferences` (يملكها M02) | قيم بسيطة | — | — | — |
| آخر عرض لتنبيه التحديث | `shared_preferences` بمفتاح `update_nudge.{version}` | تاريخ | — | — | — |
| اللقطة المضمّنة | `assets/tenant/snapshot.json` | JSON للقراءة فقط | وقت البناء | 300 KB | — |

`support` هو `getApplicationSupportDirectory()`، و`cache` هو `getApplicationCacheDirectory()` الذي يستطيع النظام تفريغه. والإعداد في `support` لأن ضياعه يعني الرجوع إلى اللقطة.

### 4.2 الكيانات

```dart
@freezed
abstract class TenantConfig with _$TenantConfig {
  const factory TenantConfig({
    required String tenantId,
    required String storeDomain,
    required String storeId,
    required String appStoreId,          // فارغ في dev
    required String applicationId,
    required Uri apiBaseUrl,
    required Uri configCdnUrl,
    required Locale defaultLocale,
    required List<Locale> supportedLocales,
    required Set<String> deepLinkHosts,
    required Map<String, Object?> defaultFlags,
    required String snapshotVersion,
  }) = _TenantConfig;
}

@freezed
abstract class CacheEntry with _$CacheEntry {
  const factory CacheEntry({
    required String key,          // flags | theme | page:home:guest:ar
    required String path,         // مسار الملف النسبي
    String? etag,
    required int version,         // رقم النسخة في config
    required int schemaVersion,   // مراجعة حزمة العقود (M03)، و token_schema للهوية
    required DateTime fetchedAt,
    required String source,       // network | snapshot
  }) = _CacheEntry;
}

sealed class AppLocation {}       // القسم 5.3
sealed class AppFailure {}        // القسم 5.4
```

### 4.3 اللقطة المضمّنة

```json
{
  "snapshot_version": "theme@57;home@1842",
  "generated_at": "2026-11-10T08:00:00Z",
  "schema_version": 3,
  "flags": { "...": "نفس شكل GET flags" },
  "theme": { "...": "نفس شكل GET theme (M02)" },
  "shell": { "ar": { "...": "مخطط M03" }, "en": { "...": "مخطط M03" } },
  "pages": {
    "home:guest:ar": { "...": "غلاف M03" },
    "home:guest:en": { "...": "غلاف M03" }
  }
}
```

قاعدة: اللقطة تُولَّد لكل تاجر في كل بناء. لا تحتوي بيانات منتجات حية (الأسعار تتغير)، بل الكتل وإعداداتها فقط، وكتل المنتجات فيها بلا `data` فتجلبها من زد عند الرسم.

## 5. الواجهات والعقود

### 5.1 endpoints المنصة التي يستهلكها التطبيق

المالك: الأعلام لـ M12، والهوية والصفحات لـ M11. هنا ما يحتاجه التطبيق، وتُثبَّت التفاصيل في `06-api/openapi.yaml`. كلها `GET`، بلا مصادقة، وعامة لكل تاجر، وخلف CDN، وتدعم `ETag` و`If-None-Match` و`304`.

**الترويسات التي يرسلها `platform_client` في كل طلب**

| الترويسة | مثال | الغرض |
|---|---|---|
| `X-App-Version` | `1.4.0+42` | الإصدار ورقم البناء، بصيغة M03 (القسم 5.1 فيه). للتسجيل وفحص الحد الأدنى، ولا يدخل مفتاح CDN |
| `X-Platform` | `ios` | تصفية الكتل والأعلام |
| `X-OS-Version` | `18.6` | التشخيص |
| `X-Supported-Blocks` | `hero_slider@1,banner_grid@1,category_strip@1` | يُولَّد آليًا من السجل (M03)، وللتحقق والتسجيل فقط |
| `Accept-Language` | `ar` | لغة المحتوى |
| `X-Install-Id` | UUID | عدّ الأجهزة دون معرّف إعلاني |
| `X-Request-Id` | UUID لكل طلب | ربط سجلات الخادم بـ Sentry |

**مفتاح الـ CDN**: يطبّق ADR-0006 حرفيًا: المسار يحمل `{tenant}/{page}/{segment}/{locale}/{schema_version}`. و`schema_version` هو رقم مراجعة حزمة العقود التي بُني بها الملف التنفيذي (M03 القسم 5.1، وM11)، ثابت في الكود (`catalog_rev.dart`). ولكل مراجعة قائمة كتل ثابتة، فلا تدخل قائمة الكتل في المفتاح. المسارات والقواعد النهائية في M11، وهذا ما يستهلكه التطبيق منها.

**1) الأعلام**: `GET {CONFIG_CDN_URL}/api/app/v1/t/{tenant}/flags`. يملكه M12، ويضيف إليه M11 الحقلين `config` و`blocks`.

```json
{
  "tenant_id": "t_01JC8Z6Q",
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
      "store_url": "https://play.google.com/store/apps/details?id=sa.mahasen.app"
    }
  },
  "maintenance": {
    "active": false,
    "message": { "ar": "نحدّث المتجر، نعود خلال دقائق", "en": "We are updating the store" },
    "retry_after_seconds": 300
  },
  "kill": {
    "checkout": false,
    "native_reviews_write": false,
    "zid.settings_endpoint": false
  },
  "features": {
    "wishlist": true,
    "zid.csrf_header": false
  },
  "config": { "home": 1843, "app-shell": 12, "theme": 57 },
  "blocks": { "disabled": [ { "type": "countdown", "v": 1, "app_versions": ">=1.3.0 <1.3.2" } ] }
}
```

- `Cache-Control: public, max-age=60` في الـ CDN. والحجم المتوقع أقل من 2 KB.
- مفتاح مجهول في `kill` أو `features` يُتجاهل. ومفتاح غائب يأخذ قيمته من `DEFAULT_FLAGS`.
- قيمة `update_policy`: `none` أو `soft`. والإجبار يتحدد فقط بـ `min_supported_version`.

**2) الهوية**: `GET {CONFIG_CDN_URL}/api/app/v1/t/{tenant}/theme/{schema_version}`، بلا لغة في المسار. والمخطط والمثال في M02.

**3) إعداد الشاشات الأصلية**: `GET {CONFIG_CDN_URL}/api/app/v1/t/{tenant}/shell/{locale}/{schema_version}`، والمخطط في M03 (القسم 5.9 فيه).

**4) صفحة**: `GET {CONFIG_CDN_URL}/api/app/v1/t/{tenant}/pages/{page}/{segment}/{locale}/{schema_version}`، والغلاف في M03. والقيمة الافتراضية لـ `segment` هي `guest`، ويغيّرها M05 بعد الدخول إلى `customer`.

| الحالة | سلوك التطبيق |
|---|---|
| 200 | تحقق بالنموذج، ثم حفظ ذري، ثم «جاهز للتطبيق» |
| 304 | تحديث `fetchedAt` فقط |
| 404 للصفحة | الصفحة غير منشورة: يبقى المخزّن، ويُرسل non-fatal |
| 410 للتاجر | التاجر أُوقف: شاشة الصيانة برسالة عامة (يحدد M12 الحالات) |
| 400 `unsupported_schema_version` (M11) | مراجعة العقود في هذا الإصدار لم تعد مدعومة: يبقى المخزّن أو اللقطة، ويُرسل non-fatal. والمخرج الصحيح أن يرفع M12 `min_supported_version` قبل إسقاط أي مراجعة |
| 5xx أو مهلة | يبقى المخزّن، ومحاولة لاحقة عند العودة إلى المقدمة |

### 5.2 عقد `zid_client`

```dart
abstract interface class ZidClient {
  Future<T> get<T>(String path, {Map<String, Object?>? query,
      required T Function(Object? json) decode, CancelToken? cancel});
  Future<T> send<T>(String method, String path, {Object? body,
      required T Function(Object? json) decode});
  void setLanguage(String languageCode);   // يحدّث Accept-Language فورًا
}
```

مثال طلب يرسله التطبيق:

```http
GET /api/v1/products?page=1&page_size=24&categories=412823 HTTP/1.1
Host: mahasen.com
Zid-Client-Platform: mobile-app
Accept-Language: ar
Accept: application/json
Cookie: session=...; csrftoken=...; locale=ar-sa
```

المسارات ونماذجها تضيفها M04 وM05 داخل `zid_client`. وM01 يسلّم العميل الأساسي ونموذجًا واحدًا للتحقق (`GET settings` خلف علم `zid.settings_endpoint`، لأنه مسار غير موثق وفق ADR-0003).

### 5.3 عقود داخلية مع الوحدات الأخرى

```dart
/// المواقع التي يستطيع التطبيق فتحها. يحوّل إليها M03 الأفعال، وM07 الروابط.
sealed class AppLocation { const AppLocation(); }
final class HomeLocation extends AppLocation { const HomeLocation(); }
final class CategoryLocation extends AppLocation { const CategoryLocation(this.id); final String id; }
final class ProductLocation extends AppLocation { const ProductLocation(this.ref); final String ref; } // slug أو uuid
final class PageLocation extends AppLocation { const PageLocation(this.pageId); final String pageId; }
final class SearchLocation extends AppLocation { const SearchLocation({this.query}); final String? query; }
final class CartLocation extends AppLocation { const CartLocation(); }
final class AccountLocation extends AppLocation { const AccountLocation(); }
final class OrderLocation extends AppLocation { const OrderLocation(this.orderId); final String orderId; }
final class InAppWebLocation extends AppLocation { const InAppWebLocation(this.url); final Uri url; }

abstract interface class AppNavigator {          // ينفذه M01
  void open(AppLocation location);
  void switchTab(AppTab tab);
}

abstract interface class AppEntry {              // ينفذه M01، ويستدعيه M06 وM07
  Future<void> open(Uri uri, {required EntrySource source});
}
enum EntrySource { universalLink, appLink, push, qr, internal }

abstract interface class LinkResolver {          // ينفذه M07
  Future<AppLocation?> resolve(Uri uri);
}

abstract interface class CookieBridge {          // ينفذه M01، ويستخدمه M04 وM05
  Future<void> pushToWebView(Uri storeUri);
  Future<void> pullFromWebView(Uri storeUri);
  Future<void> clearAll();
}

abstract interface class Telemetry {             // ينفذه M08، وM01 يقدّم نسخة تكتب إلى السجل فقط
  void event(String name, [Map<String, Object?> props = const {}]);
}
```

جدول المسارات:

| المسار | الشاشة | المالك |
|---|---|---|
| `/home` | تبويب الرئيسية | M03 |
| `/categories` و`/categories/:id` | التصنيفات | M04 |
| `/search` و`/search/results?q=` | البحث | M04 |
| `/cart` | تبويب السلة بعدّاد | M04 |
| `/account` | تبويب الحساب | M05 |
| `/products/:ref` | صفحة المنتج | M04 |
| `/pages/:pageId` | صفحة حملة من كتل | M03 |
| `/checkout` | WebView الدفع (ملء الشاشة، خارج الغلاف) | M04 |
| `/orders/:id` | تفاصيل الطلب | M05 |
| `/web?url=` | WebView داخلي لنطاقات مسموحة | M01 |
| `/update-required` و`/maintenance` | البوابات | M01 |

الغلاف `StatefulShellRoute.indexedStack` بخمسة فروع، فيحتفظ كل تبويب بمكدسه وموضع تمريره. ترتيب التبويبات منطقي (الرئيسية أولًا)، وينعكس بصريًا في RTL تلقائيًا. ونمط الشريط وأيقوناته من tokens M02 (`components.tab_bar`). وعدّاد السلة يقرأ `cartCountProvider` الذي يقدّمه M04، وقيمته 0 حتى يُربط.

المزوّدات الأساسية (Riverpod):

| المزوّد | النوع | يُتجاوز في |
|---|---|---|
| `tenantConfigProvider` | `Provider<TenantConfig>`، يرمي `UnimplementedError` إن لم يُتجاوز | `main.dart` والاختبارات بـ `overrideWithValue` |
| `envProvider` | `Provider<Env>` | كذلك |
| `bootstrapDataProvider` | `Provider<BootstrapData>` | كذلك |
| `zidClientProvider` و`platformClientProvider` | `Provider`، `keepAlive` | الاختبارات بعملاء وهميين |
| `flagsProvider` | `Notifier<FeatureFlags>` | — |
| `configRepositoryProvider` | `Provider` | — |
| `routerProvider` | `Provider<GoRouter>` | — |
| `connectivityProvider` | `StreamProvider<bool>` | — |
| `telemetryProvider` | `Provider<Telemetry>` | M08 |
| `linkResolverProvider` | `Provider<LinkResolver>` | M07 |

مثال التجاوز:

```dart
runApp(ProviderScope(
  overrides: [
    tenantConfigProvider.overrideWithValue(tenant),
    envProvider.overrideWithValue(env),
    bootstrapDataProvider.overrideWithValue(boot),
  ],
  child: const ShopperApp(),
));
```

`overrideWithValue` متاح في Riverpod 3، واستُعيد لـ `FutureProvider` و`StreamProvider` في 3.0.0، وفيه `ProviderContainer.test()` للاختبارات ([سجل riverpod](https://pub.dev/packages/riverpod/changelog)).

### 5.4 تصنيف الأخطاء والحالات القياسية

```dart
sealed class AppFailure implements Exception {}
final class OfflineFailure extends AppFailure {}                  // لا اتصال
final class TimeoutFailure extends AppFailure {}
final class ServerFailure extends AppFailure { final int status; ... }  // 5xx
final class NotFoundFailure extends AppFailure {}                 // 404
final class UnauthorizedFailure extends AppFailure {}             // 401 و403
final class RateLimitedFailure extends AppFailure { final Duration? retryAfter; ... }
final class ValidationFailure extends AppFailure { final String? message; ... }  // 400 و422 من زد
final class ParseFailure extends AppFailure {}                    // JSON لا يطابق النموذج
final class FeatureKilledFailure extends AppFailure { final String kill; ... }
final class UnknownFailure extends AppFailure { final Object cause; ... }
```

| الفشل | الرسالة للمتسوق (ARB في M02) | زر | إلى Sentry |
|---|---|---|---|
| `OfflineFailure` | «لا يوجد اتصال بالإنترنت» | إعادة المحاولة | لا |
| `TimeoutFailure` | «الاتصال بطيء، حاول مجددًا» | إعادة المحاولة | breadcrumb |
| `ServerFailure` | «تعذّر تحميل المحتوى الآن» | إعادة المحاولة | نعم، non-fatal بعيّنة 10% |
| `NotFoundFailure` | «هذه الصفحة غير متاحة» | الرجوع للرئيسية | لا |
| `ValidationFailure` | رسالة زد إن وُجدت، وإلا رسالة عامة | — | لا |
| `ParseFailure` | «تعذّر تحميل المحتوى الآن» | إعادة المحاولة | نعم دائمًا (يكشف تغيّر عقد زد) |
| `RateLimitedFailure` | «حاول بعد لحظات» | إعادة المحاولة بعد المهلة | نعم، non-fatal |

المكونات القياسية في `storefront_ui` (يرسمها M02 بالـ tokens):
- `AsyncValueView<T>`: يأخذ `AsyncValue<T>` و`data` و`loading` و`isEmpty` و`empty`. الافتراضي للتحميل هيكل عظمي (skeleton) بأبعاد المحتوى، لا مؤشر دوّار، إلا في الأزرار.
- `ErrorStateView(failure, onRetry)` و`EmptyStateView(title, message, action)` و`OfflineBanner`.
- `AppMessenger.showError(failure)` لأخطاء الأفعال (مثل فشل الإضافة إلى السلة) في snackbar.
- حالة الخطأ والفراغ تعلنهما `Semantics(liveRegion: true)` لقارئ الشاشة.

### 5.5 وسوم Sentry وأحداث M01

| الوسم | المصدر |
|---|---|
| `tenant_id` | `TenantConfig` |
| `layout_version` | رقم نسخة الرئيسية المعروضة الآن |
| `theme_version` | رقم نسخة الهوية |
| `schema_version` | مراجعة حزمة العقود، ثابت في الكود |
| `config_source` | `network` أو `cache` أو `snapshot` |
| `locale` | اللغة الحالية |
| `env` | يأتي من `options.environment` |

- `options.release` بصيغة `{bundle_id}@{version}+{build}`، فيُحسب «الجلسات الخالية من الانهيار» لكل تاجر مباشرة. و`options.dist` يحمل رقم البناء.
- `options.sendDefaultPii = false`، و`attachScreenshot = false` لأن الشاشة قد تحوي بيانات المتسوق ([خيارات Sentry](https://docs.sentry.io/platforms/dart/guides/flutter/configuration/options/)).
- `tracesSampleRate`: ‏1.0 في dev وstaging، و0.05 في prod، و`sampleRate` للأخطاء 1.0.
- `user.id` = `install_id` فقط، لا رقم جوال ولا بريد ولا معرّف عميل زد.

أحداث يرسلها M01 عبر `Telemetry` (الأسماء النهائية في تصنيف M08):

| الحدث | الخصائص |
|---|---|
| `app_open` | `cold` أو `warm`، و`config_source` |
| `home_first_frame` | `ms` من بداية العملية، و`config_source` |
| `bootstrap_slow` | `ms`، وما لم يكتمل |
| `config_applied` | `resource`، و`from_version`، و`to_version` |
| `update_required_shown` | `current`، و`min` |
| `update_prompt_action` | `accepted` أو `declined` أو `store_opened` |
| `maintenance_shown` | — |
| `feature_killed_hit` | `kill` |

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| أول تشغيل بلا شبكة | الرئيسية من اللقطة. كتل المنتجات تعرض الهيكل العظمي ثم حالة «لا يوجد اتصال» بزر إعادة. شريط `OfflineBanner` أعلى الشاشة |
| ملف إعداد تالف على القرص | يُحذف، وتُستخدم اللقطة، ويُرسل non-fatal مرة واحدة |
| ترقية التطبيق بسجل كتل أحدث | كل صفحة مخزّنة `schemaVersion` فيها لا يطابق السجل تُتجاهل وتُستبدل باللقطة، ثم تُجلب النسخة المناسبة |
| خفض الإصدار (تثبيت إصدار أقدم من TestFlight) | الحكم نفسه: ما لا يطابق السجل يُتجاهل |
| الـ CDN يعيد نسخة أقدم من المخزّن (`version` أصغر) | تُرفض ويبقى الأحدث، إلا إذا كان الفرق رجوعًا مقصودًا (`rollback: true` في الغلاف، يحدده M11) |
| الأعلام تطلب التحديث والمتسوق داخل WebView الدفع | التأجيل حتى إغلاق الـ WebView أو تأكيد الطلب |
| `min_supported_version` أعلى من آخر إصدار منشور في المتجر | خطأ تشغيلي يقفل التاجر. يمنعه M12 عند الحفظ (لا يقبل قيمة أعلى من `latest_version` المنشور على المنصة نفسها). والتطبيق يعرض زر المتجر كالعادة |
| مراجع Apple يفتح إصدارًا قيد المراجعة | إصدار المراجعة دائمًا ≥ الحد الأدنى بحكم القاعدة السابقة، فلا تظهر له شاشة الإجبار |
| تطبيق أندرويد لم يُثبَّت من Google Play | `checkForUpdate` يفشل، فتظهر الشاشة الحاجبة بزر يفتح صفحة Play |
| iOS بلا `APP_STORE_ID` (بيئة dev) | زر التحديث مخفي، ونص يطلب التثبيت من TestFlight |
| ساعة الجهاز خاطئة | لا يعتمد أي قرار على ساعة الجهاز. قواعد الجدولة يقيّمها الخادم (ADR-0006)، والـ TTL المحلي يُقاس بـ `fetchedAt` الذي يُكتب من ترويسة `Date` في الاستجابة |
| رابط عميق يصل أثناء الإقلاع | في الطابور، ثم يُفتح بعد أول إطار. رابطان متتاليان: يُفتح الأحدث فقط |
| رابط عميق يصل والبوابة الحاجبة ظاهرة | يبقى في الطابور، ويُفتح بعد الخروج من البوابة إن حدث دون إعادة تشغيل |
| زد يعيد HTML بدل JSON (صفحة خطأ أو حماية) | `ParseFailure` بوسم `zid_non_json`، والمتسوق يرى رسالة عامة |
| 429 من زد | محاولة واحدة بعد `Retry-After` إن كان ≤ 5 ثوانٍ، وإلا `RateLimitedFailure` |
| cookie الجلسة انتهت | `UnauthorizedFailure` على مسارات الحساب، وحدث `SessionExpired` لـ M05. التصفح العام يستمر |
| فشل قراءة Keychain بعد إعادة تشغيل الجهاز قبل أول فتح قفل | التخزين بإمكانية `first_unlock` ([flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage)). وإن فشلت القراءة يبدأ الـ jar فارغًا، ويُعامل المتسوق كزائر |
| امتلاء تخزين الجهاز | فشل الكتابة يُسجَّل breadcrumb، ويستمر التطبيق من الذاكرة |
| تبديل اللغة أثناء طلب جارٍ | الطلب القديم يُلغى بـ `CancelToken`، ويُعاد الطلب باللغة الجديدة |
| `connectivity_plus` يقول متصل والشبكة لا تعمل | القرار من نتيجة الطلب لا من التلميح. الشريط يظهر عند `OfflineFailure` أيضًا |
| تاجر أُوقف في المنصة (410) | شاشة الصيانة برسالة عامة، ولا تُمسح بيانات المتسوق |
| تجاوز السبلاش 2.5 ثانية | يُزال، وتظهر الرئيسية بما توفر، ويُرسل `bootstrap_slow` |

## 7. المتطلبات غير الوظيفية

### 7.1 الأداء

| المقياس | الهدف | طريقة القياس |
|---|---|---|
| الإقلاع البارد حتى أول إطار للرئيسية من التخطيط المخزّن | P50 أقل من 1.5 ثانية، وP90 أقل من 2.0 ثانية | 20 تشغيلًا على الجهاز المرجعي (8.3)، بحدث `home_first_frame` وبـ `adb shell am start -W` لأندرويد |
| `BootstrapLoader.load()` | P90 أقل من 300 ms، وسقف قاطع 600 ms | توقيت داخلي يُرسل مع `app_open` |
| تطبيق نسخة جديدة من الإعداد بعد النشر | ≤ 5 دقائق عند التنقل التالي (PRD §3) | max-age للأعلام 60 ثانية، وعودة المقدمة بعد 15 دقيقة، والسحب للتحديث |
| حجم استجابة الأعلام | أقل من 2 KB | اختبار عقد |
| ذاكرة الصور | فك الصورة بقياس العرض (`memCacheWidth` = العرض × كثافة الشاشة) | widget test على `AppImage` |
| الإطارات أثناء تمرير الرئيسية | 95% من الإطارات أقل من 16 ms على الجهاز المرجعي | `flutter run --profile` وDevTools |

### 7.2 الحجم

| البند | الهدف |
|---|---|
| حجم التثبيت على iOS لجهاز مرجعي (تقرير App Thinning) | ≤ 40 MB (PRD §3) |
| حجم التنزيل على أندرويد في Play Console (arm64-v8a) | ≤ 40 MB، والمتوقع أقل بكثير |
| الخطوط المضمّنة | ≤ 1 MB: ثلاثة أوزان من IBM Plex Sans Arabic بنحو 674 KB، وثلاثة من Tajawal بنحو 167 KB، مقيسة من ملفات Google Fonts (M02) |
| `snapshot.json` | ≤ 300 KB |
| الصور النقطية في `assets` | ≤ 300 KB. والرسوم التوضيحية SVG أو أيقونات |
| نمو الحجم في PR | تحذير عند +2%، وفشل عند +5% مقارنة بالفرع الرئيسي |

القياس الموثوق هو أرقام المتاجر نفسها: Play Console (Android vitals ← App size) لأندرويد، وتقرير App Thinning أو App Store Connect لـ iOS ([Flutter: app size](https://docs.flutter.dev/perf/app-size)). ويستخدم CI `--analyze-size` للمقارنة النسبية فقط، لأنه لا يجتمع مع `--split-debug-info`، وناتجه على iOS هو `.app` لا IPA. قواعد تحافظ على الحجم: لا فيديو مضمّن، وخطان فقط (ADR-0002)، و`--split-debug-info` و`--obfuscate` في كل بناء متجر، وأي حزمة جديدة تضيف أكثر من 500 KB تحتاج موافقة المشرف في الـ PR.

### 7.3 الأمان والخصوصية
- لا سر في الملف التنفيذي. `tenant.json` وملفات البيئة قيم عامة فقط، ويفحص CI أنماط المفاتيح الخاصة (`-----BEGIN` و`sk_` وما يشبهها) ويرفض الـ PR.
- cookies زد في Keychain أو Keystore فقط، لا في ملفات نصية. وفي أندرويد تستخدم الحزمة منذ الإصدار 10 تشفير RSA OAEP مع AES-GCM ([flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage)).
- HTTPS فقط: ATS الافتراضي في iOS، و`usesCleartextTraffic=false` في أندرويد. ولا تثبيت للشهادات (certificate pinning) في الإصدار الأول، لأن نطاقات المتاجر تختلف وتتغير شهاداتها خارج سيطرتنا.
- لا IDFA ولا AAID، فلا حاجة لطلب App Tracking Transparency. ومعرّف التثبيت UUID عشوائي.
- `beforeSend` في Sentry يحذف ترويسات `Cookie` و`Set-Cookie` و`Authorization`، ويخفي معاملات الاستعلام `token` و`st` و`code`، ويستبدل الأرقام السعودية (`05XXXXXXXX` و`+9665XXXXXXXX`) والبريد في الرسائل والـ breadcrumbs بـ `[redacted]`.
- WebView الداخلي (`/web`) يقبل فقط نطاق المتجر ونطاقات المنصة، وما عداها يُفتح في المتصفح الخارجي.

### 7.4 العربية وRTL وإمكانية الوصول
- كل شاشات M01 (التحديث الإجباري، والصيانة، والأخطاء، والفراغ) بالعربية والإنجليزية، وتُختبر في RTL وLTR.
- تعمل عند تكبير النص 200% دون قص. وتُختبر كذلك في widget tests بـ `TextScaler.linear(2.0)`.
- أهداف اللمس 48×48 على الأقل.
- العناوين في الشاشات الحاجبة تُعلَّم بـ `Semantics(headingLevel: 1)`، لأن `header: true` لم يعد له أثر على iOS وأندرويد منذ 3.47 ([Flutter](https://docs.flutter.dev/release/breaking-changes/semantics-header-heading-level)).

### 7.5 المراقبة
- 100% من الانهيارات القاتلة تصل إلى Sentry بوسوم `tenant_id` و`layout_version`، ويُتحقق من ذلك باختبار انهيار مقصود في staging.
- الجلسات الخالية من الانهيار ≥ 99.5% لكل تاجر (PRD §3)، تُقرأ من Release Health في Sentry لكل `release`.
- رموز التصحيح مرفوعة لكل بناء متجر، وأي انهيار في prod يظهر بأسماء دوال مقروءة.
- الأخطاء غير القاتلة المتكررة (`config_invalid` و`zid_non_json`) لها حد: حدث واحد لكل نوع في الجلسة.

## 8. الاعتماديات والمجهول

### 8.1 التجارب المرتبطة

| SPK | ما يمس M01 | ما يُبنى الآن |
|---|---|---|
| SPK-04 | هل تكفي الترويسة في طلبات الـ API، أم يجب أن تصل في كل تنقل داخل الـ WebView؟ | `CookieBridge` والمعترِضات. ومنطق الـ WebView نفسه في M04 |
| SPK-05 | انتقال cookies الدخول من `sso.zid.store` إلى نطاق المتجر | `pullFromWebView` عام لأي نطاق. ويضاف نطاق `sso` إن لزم |
| SPK-12 | حد معدّل Storefront API | سياسة إعادة المحاولة الحالية محافظة (محاولتان لـ GET) وتُعدّل بالأرقام |
| SPK-13 | الحجم الفعلي، وزمن البناء، وتحقق حقن التاجر في CI | التشغيل المحلي بتاجرين (3.8)، وCI يقيس `--analyze-size`. والأرقام النهائية للميزانية بعد SPK-13 |
| SPK-15 | بناء `storefront_ui` للويب | قاعدة «بلا plugins» تُفرض في CI ببناء `flutter build web` لمثال صغير من الحزمة |
| SPK-10 | نطاق الروابط العامة | لا أثر على نقطة الدخول. `DEEP_LINK_HOSTS` قائمة مفتوحة |

سؤال إضافي يُضاف إلى تجربة SPK-05 أو SPK-11 على المتجر التطويري: هل تشترط طلبات الكتابة في Storefront API (مثل `POST cart/items`) ترويسة `X-CSRFToken` مع cookie `csrftoken`؟ وجود الـ cookie في الجلسة يرجّح ذلك، ولم يُختبر. لذلك يبقى `CsrfInterceptor` خلف علم `zid.csrf_header`.

### 8.2 ملاحظات على القرارات المعمارية
- **ADR-0006 ومفتاح الـ CDN**: ADR-0006 لم يعرّف `schema_version`. يتبع هذا المستند تعريف M03 وM11: رقم مراجعة حزمة العقود المضمّنة في الملف التنفيذي، و`X-Supported-Blocks` للتحقق فقط. وهو تفسير يحتاج إقرار المشرف، كما يذكر M03.
- **ما يطلبه M01 من M13**: إضافة `STORE_DOMAIN` و`STORE_ID` و`APP_STORE_ID` و`APPLICATION_ID_ANDROID` و`SUPPORTED_LOCALES` و`DEEP_LINK_HOSTS` و`DEFAULT_FLAGS` و`SNAPSHOT_VERSION` إلى `tenant.defines.json` (يسمي M13 حاليًا خمسة مفاتيح فقط). وأن تكون اللقطة حزمة واحدة فيها الأعلام والهوية و`app-shell` والرئيسية لكل لغة مدعومة، لا صفحة واحدة بلغة واحدة كما في مثال `layout_snapshot_url`. وخيار `--offline` للتشغيل المحلي.
- **ADR-0002 و«الأعلام» في `tenant.json`**: تُعامل هنا قيمًا افتراضية قبل أول جلب فقط. المرجع وقت التشغيل هو endpoint الأعلام (ADR-0006، البند 4).
- **فصل Material**: ليس في ADR، لكنه حقيقة في سلسلة الأدوات: `go_router` 18 يعتمد على `material_ui`، ومكتبة الإطار تُهمل في 3.50. يُسجَّل في الدليل الهندسي (`07`)، ولا يحتاج ADR جديدًا.
- **Shorebird (ADR-0006، البند 5)**: لا يقابله متطلب في PRD. وُضع هنا Should، وتكلفته تتراكم مع عدد الأجهزة في كل التجار.

### 8.3 قرارات مفتوحة للمشرف

| السؤال | التوصية |
|---|---|
| الحد الأدنى لأنظمة التشغيل | iOS 16.0، لأن Apple Pay داخل WKWebView مع حقن السكربت يعمل منذ iOS 16 (SPK-02). وAndroid 8.0 (API 26). ويُراجع بعد بيانات أول تاجر |
| الجهاز المرجعي لميزانية الإقلاع | جهاز أندرويد متوسط شائع في السوق السعودية، مثل Samsung Galaxy A-series من 2024، يشتريه المشرف ويثبَّت اسمه في الدليل الهندسي |
| خطة Sentry وحصة الأحداث | مشروع Sentry واحد لكل التجار (`intishar-shopper`) بوسم `tenant_id`، وخطة تكفي عيّنة الأداء 5% |
| تفعيل Shorebird | بعد أول 10 تجار، ومع قرار D-05 |
| اسم نطاق API المنصة وCDN | يحسمه D-06 وM12 |

### 8.4 ما يُبنى الآن خلف واجهة مؤقتة
- `platform_client` يُبنى ويُختبر على خادم وهمي محلي (`tool/fake_platform_server.dart`) يقدّم الأعلام والهوية والصفحة من ملفات JSON في `test/fixtures/`، حتى تجهز M11 وM12.
- `LinkResolver` بـ `NoopLinkResolver`، و`Telemetry` بـ `LogTelemetry`، و`cartCountProvider` بقيمة ثابتة 0.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| APP-01 | المستودع: workspace بأربع حزم، وMelos 8، و`material_ui`، وقواعد التحليل، وقاعدة «بلا plugins» في `storefront_ui` | Must | نعم | — |
| APP-02 | البيئات وثوابت التاجر: ملفات `env/`، و`TenantConfig`، والقالب الأصلي الذي تكتب فيه `tenantize` (2.7)، وتاجران تجريبيان على جهاز واحد | Must | نعم بتاجر واحد. والتاجر الثاني ينتظر أداة M13 | APP-01، وM13 (`tenantize`). والتحقق في CI ينتظر SPK-13 |
| APP-03 | الإقلاع واللقطة: السبلاش، و`BootstrapLoader`، و`CacheStore`، واللقطة المضمّنة، وإعادة التحقق، وتطبيق النسخة عند التنقل التالي | Must | نعم (خلف خادم وهمي) | APP-01، APP-07 |
| APP-04 | التوجيه والغلاف: `go_router`، والتبويبات الخمسة، و`AppLocation`، و`AppNavigator`، و`AppEntry` بطابوره، وتعطيل الربط العميق المدمج | Must | نعم | APP-01 |
| APP-05 | Riverpod: المزوّدات الأساسية، والتجاوزات، ومساعدات الاختبار `ProviderContainer.test()` | Must | نعم | APP-01 |
| APP-06 | `zid_client`: dio، والمعترِضات، وتحويل الأخطاء، ومخزن cookies آمن، و`CookieBridge`، وطلب `settings` للتحقق | Must | نعم. وسلوك الجسر النهائي ينتظر SPK-04 وSPK-05 | APP-01 |
| APP-07 | `platform_client`: الترويسات، والطلبات الشرطية، ونماذج الأعلام، والخادم الوهمي | Must | نعم | APP-01. والعقد النهائي ينتظر M11 وM12 |
| APP-08 | الصور و`JsonCache`: `AppImage`، و`ImageResolver`، ومدير تخزين الصور، وTTL | Must | نعم | APP-01 |
| APP-09 | الأخطاء والحالات القياسية: `AppFailure`، و`AsyncValueView`، والهيكل العظمي، والفراغ، والخطأ، و`OfflineBanner`، و`AppMessenger` | Must | نعم (بـ tokens افتراضية حتى M02) | APP-05 |
| APP-10 | الأعلام والتحديث: `FeatureFlags`، ومفاتيح الإيقاف، و`UpdateGate`، والتحديث الفوري على أندرويد، وتحويل App Store، وشاشة الصيانة، والتأجيل أثناء الدفع | Must | نعم (خلف خادم وهمي) | APP-03، APP-07. والعقد النهائي ينتظر M12 |
| APP-11 | المراقبة: Sentry، والوسوم، و`beforeSend`، و`AppLogger`، و`Telemetry` المؤقت، وأحداث الإقلاع | Must | نعم | APP-01 |
| APP-12 | الاختبارات: إعداد unit وwidget وgolden (alchemist) وintegration (integration_test وpatrol)، والـ fixtures، ومصفوفة RTL والتكبير | Must | نعم | APP-01 |
| APP-13 | CI لمستودع التطبيق: التحليل، والتنسيق، والتوليد، والاختبارات، والـ goldens، وبناء أندرويد للفحص، وفحص الحجم، وبناء iOS الليلي | Must | نعم | APP-12 |
| APP-14 | ميزانيات الحجم والإقلاع: `tool/check_size.dart`، وخط الأساس، وقياس الجهاز المرجعي، ورفع رموز Sentry في بناء المتجر | Must | ينتظر SPK-13 | APP-13، M13 |
| APP-15 | قناة Shorebird للإصلاحات الطارئة | Should | ينتظر M13 وD-05 | APP-14 |
| APP-16 | التحديث المرن على أندرويد وتنبيه iOS غير الحاجب بتواتر محدود | Should | نعم | APP-10 |
| APP-17 | تصفح دون اتصال لآخر تصنيفات ومنتجات زارها المتسوق | Could | ينتظر M04 | APP-08 |

حجم كل قصة لا يتجاوز سباقًا من أسبوعين لمنفذ واحد. أكبرها APP-03 وAPP-06 وAPP-10، ويُتوقع لكل منها أسبوع ونصف إلى أسبوعين.

### معايير القبول

**APP-02: حقن التاجر**
1. **بافتراض** ملفي `tenants/sample-perfume.json` و`tenants/sample-electronics.json` بمعرّفين واسمين وأيقونتين مختلفة، **عندما** يشغّل المنفذ `tenantize` ثم `flutter run` لكل منهما على الجهاز نفسه، **إذن** يُثبَّت تطبيقان منفصلان، لكل منهما اسمه بالعربية حين تكون لغة الجهاز عربية، وأيقونته، وسبلاشه.
2. **بافتراض** `tenant.defines.json` ينقصه `STORE_DOMAIN`، **عندما** يُشغَّل التطبيق في وضع debug، **إذن** يتوقف الإقلاع برسالة تسمي المفتاح الناقص.
3. **بافتراض** أن `tenantize` شُغّلت على القالب، **عندما** تُشغَّل مرة ثانية بالملف نفسه، **إذن** لا يظهر أي فرق في `git diff` (القالب يدعم ذلك بملفي `tenant.properties` و`Tenant.xcconfig` المنفصلين).
4. **بافتراض** بناء release، **عندما** يُفحص الملف التنفيذي بحثًا عن نص `-----BEGIN`، **إذن** لا يوجد.

**APP-03: الإقلاع**
1. **بافتراض** تثبيت جديد بلا شبكة، **عندما** يفتح المتسوق التطبيق، **إذن** تظهر الرئيسية من اللقطة المضمّنة خلال 2.5 ثانية على الأكثر، ويظهر شريط «لا يوجد اتصال»، ولا تظهر شاشة خطأ كاملة.
2. **بافتراض** تخطيط مخزّن للرئيسية بنسخة 1842، **عندما** يُفتح التطبيق على الجهاز المرجعي 20 مرة باردة، **إذن** يكون P90 لحدث `home_first_frame` أقل من 2000 ms، ولا يُنتظر أي طلب شبكة قبل أول إطار.
3. **بافتراض** أن الخادم نشر النسخة 1843 والمتسوق في منتصف تمرير الرئيسية، **عندما** تصل النسخة في إعادة التحقق، **إذن** لا تتغير الشاشة المعروضة، وعند التنقل إلى تبويب آخر والعودة تظهر النسخة 1843، ويُرسل `config_applied`.
4. **بافتراض** ملف `pages/home_guest_ar.json` تالف، **عندما** يُفتح التطبيق، **إذن** تُرسم الرئيسية من اللقطة، ويُحذف الملف، ويصل non-fatal واحد إلى Sentry بوسم `config_source=snapshot`.
5. **بافتراض** ترقية التطبيق من سجل كتل 6 إلى 7، **عندما** يُفتح أول مرة بعد الترقية، **إذن** لا تُرسم أي صفحة مخزّنة بـ `schemaVersion = 6`.

**APP-04: نقطة دخول الروابط**
1. **بافتراض** أن التطبيق مغلق و`LinkResolver` وهمي يحوّل `https://mahasen.com/products/abc` إلى `ProductLocation('abc')`، **عندما** يُفتح التطبيق من هذا الرابط، **إذن** تظهر الرئيسية أولًا ثم صفحة المنتج فوقها، وزر الرجوع يعيد إلى الرئيسية.
2. **بافتراض** أن شاشة التحديث الإجباري ظاهرة، **عندما** يصل رابط عميق، **إذن** لا يحدث تنقل، ويبقى الرابط في الطابور.
3. **بافتراض** وصول رابطين خلال الإقلاع، **عندما** يكتمل الإقلاع، **إذن** يُفتح الثاني فقط.
4. **بافتراض** رابط لا يعرفه المحلّل، **عندما** يصل، **إذن** تبقى الرئيسية ظاهرة، ويُرسل حدث `link_unresolved`.

**APP-06: عميل زد**
1. **بافتراض** المتجر التطويري، **عندما** يطلب العميل `GET products?page_size=2`، **إذن** يحمل الطلب `Zid-Client-Platform: mobile-app` و`Accept-Language: ar`، ويُتحقق من ذلك في اختبار وحدة بمحوّل HTTP وهمي، وعلى المتجر التطويري عبر proxy.
2. **بافتراض** استجابة تضع cookie `session`، **عندما** يُغلق التطبيق ويُفتح، **إذن** يرسل الطلب التالي الـ cookie نفسها، ولا يوجد ملف cookies نصي في مجلدات التطبيق.
3. **بافتراض** أن الخادم يعيد 503 ثم 200، **عندما** يُرسل GET، **إذن** ينجح بعد محاولة واحدة. **وبافتراض** أن `POST cart/items` أعاد 503، **إذن** لا تُعاد المحاولة آليًا، ويعود `ServerFailure`.
4. **بافتراض** استجابة HTML بحالة 200، **عندما** يُحلَّل الرد، **إذن** يعود `ParseFailure` بوسم `zid_non_json` ويُرسل إلى Sentry.
5. **بافتراض** cookies في الـ jar، **عندما** يستدعي M04 `pushToWebView` ثم يفتح `/cart` في WebView، **إذن** تظهر سلة المتسوق نفسها (يُتحقق على المتجر التطويري ضمن SPK-04).

**APP-10: الأعلام والتحديث**
1. **بافتراض** أعلام فيها `android.min_supported_version = 1.5.0` والإصدار المثبّت 1.4.0 من Google Play، **عندما** يُفتح التطبيق، **إذن** تظهر الشاشة الحاجبة ويبدأ تدفق Google Play الفوري، وبعد التحديث يعود التطبيق إلى الرئيسية.
2. **بافتراض** الحالة نفسها على iOS، **عندما** يضغط المتسوق «تحديث»، **إذن** يُفتح `https://apps.apple.com/app/id{APP_STORE_ID}` في App Store.
3. **بافتراض** أن المتسوق في WebView الدفع، **عندما** تصل أعلام ترفع الحد الأدنى، **إذن** لا تظهر الشاشة الحاجبة حتى يُغلق الـ WebView.
4. **بافتراض** `kill.checkout = true`، **عندما** يضغط المتسوق «إتمام الطلب» في السلة، **إذن** لا يُفتح الـ WebView، وتظهر رسالة «الدفع غير متاح مؤقتًا»، ويُرسل `feature_killed_hit`.
5. **بافتراض** فشل جلب الأعلام في أول تشغيل، **عندما** يُفتح التطبيق، **إذن** تُستخدم `DEFAULT_FLAGS` ولا تظهر أي بوابة.

**APP-11: المراقبة**
1. **بافتراض** بناء staging، **عندما** يُطلق زر انهيار مخفي في وضع المطوّر، **إذن** يظهر الحدث في Sentry خلال دقيقتين بوسوم `tenant_id` و`layout_version` و`theme_version`، وبـ `release` بصيغة `{bundle_id}@{version}+{build}`، وبأسماء دوال مقروءة.
2. **بافتراض** خطأ رسالته تحتوي `0551234567` و`a@b.com`، **عندما** يُرسل، **إذن** يصل إلى Sentry وفيه `[redacted]` بدلهما، ولا توجد ترويسة `Cookie` في الحدث.

**APP-13: CI**
1. **بافتراض** PR يضيف `import 'package:flutter/material.dart'`، **عندما** يعمل CI، **إذن** يفشل التحليل.
2. **بافتراض** PR يرفع حجم `analyze-size` لأندرويد arm64 بأكثر من 5%، **عندما** يعمل CI، **إذن** يفشل فحص الحجم بتقرير يسمي أكبر الحزم نموًا.
3. **بافتراض** PR يغيّر شكل شاشة التحديث الإجباري، **عندما** يعمل CI، **إذن** تفشل اختبارات golden حتى تُحدَّث الصور المرجعية في الـ PR نفسه.

## 10. المصادر

- [Flutter: قائمة الإصدارات (JSON)](https://storage.googleapis.com/flutter_infra_release/releases/releases_macos.json)، [Release notes](https://docs.flutter.dev/release/release-notes)
- [Flutter: Migrate to material_ui and cupertino_ui](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui)، [Flutter blog: decoupling](https://flutter.dev/blog/decoupling-material-cupertino)
- [Flutter: Deep links flag change](https://docs.flutter.dev/release/breaking-changes/deep-links-flag-change)
- [Flutter: Semantics header and headingLevel](https://docs.flutter.dev/release/breaking-changes/semantics-header-heading-level)
- [Flutter: Measuring app size](https://docs.flutter.dev/perf/app-size)
- [Dart: pub workspaces](https://dart.dev/tools/pub/workspaces)، [pub.dev/melos](https://pub.dev/packages/melos)
- [pub.dev/go_router](https://pub.dev/packages/go_router) و[سجلها](https://pub.dev/packages/go_router/changelog)
- [pub.dev/flutter_riverpod](https://pub.dev/packages/flutter_riverpod)، [riverpod changelog](https://pub.dev/packages/riverpod/changelog)
- [pub.dev/dio](https://pub.dev/packages/dio)، [dio_cookie_manager](https://pub.dev/packages/dio_cookie_manager)، [cookie_jar](https://pub.dev/packages/cookie_jar)
- [pub.dev/flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage)
- [pub.dev/cached_network_image](https://pub.dev/packages/cached_network_image)، [CachedNetworkImage API](https://pub.dev/documentation/cached_network_image/latest/cached_network_image/CachedNetworkImage-class.html)، [flutter_cache_manager](https://pub.dev/packages/flutter_cache_manager)
- [pub.dev/flutter_native_splash](https://pub.dev/packages/flutter_native_splash)، [flutter_launcher_icons](https://pub.dev/packages/flutter_launcher_icons)
- [pub.dev/in_app_update](https://pub.dev/packages/in_app_update)، [Android: In-app updates](https://developer.android.com/guide/playcore/in-app-updates)، [Kotlin/Java guide](https://developer.android.com/guide/playcore/in-app-updates/kotlin-java)
- [pub.dev/sentry_flutter](https://pub.dev/packages/sentry_flutter)، [Sentry Flutter options](https://docs.sentry.io/platforms/dart/guides/flutter/configuration/options/)
- [webview_flutter: WebViewCookieManager](https://pub.dev/documentation/webview_flutter/latest/webview_flutter/WebViewCookieManager-class.html)
- [pub.dev/alchemist](https://pub.dev/packages/alchemist)، [pub.dev/patrol](https://pub.dev/packages/patrol)
- [GitHub Actions runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing)
- [Zid: Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- `research_notes/مزايا وتخصيص تطبيقات متاجر زد/flutter_configurable_architecture.md`، و`zid_feature_capability_map.md`، و`mobile_shopping_ux.md`
- ADR-0002، وADR-0003، وADR-0004، وADR-0006
