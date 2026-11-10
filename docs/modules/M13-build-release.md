# M13: البناء والنشر

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Laravel (وحدة `Builds`)، وCI (Codemagic)، وملفات البناء في مشروع Flutter، وApp Store Connect API، وGoogle Play Developer API |
| المتطلبات | F-M09, F-P02 (Must)، وF-M09b (Should) |
| القرارات | [ADR-0002](../adr/0002-flutter-single-codebase.md)، و[ADR-0007](../adr/0007-merchant-owned-store-accounts.md)، و[ADR-0008](../adr/0008-platform-managed-push.md)، و[ADR-0006](../adr/0006-layouts-in-platform-api.md)، و[ADR-0005](../adr/0005-laravel-modular-monolith-bff.md) |
| تعتمد على | M14 (مفاتيح المتاجر وبيانات الحساب ونصوص القائمة)، وM12 (خزنة الأسرار والتدقيق والأعلام)، وM06 (ملفات Firebase وعقد امتداد الإشعارات)، وM07 (النطاقات المرتبطة)، وM02 (الشعار والألوان مصدرًا للأيقونة والسبلاش)، وM11 (لقطة التخطيط الاحتياطية)، وM08 (نسبة الجلسات الخالية من الانهيار لإيقاف الطرح)، وM15 (الواجهات) |
| بادئة القصص | BLD |

## 1. الغرض والنطاق

تحوّل هذه الوحدة إعداد التاجر إلى تطبيقين موقّعين على حسابيه في Apple وGoogle، ثم تدير رحلة كل إصدار حتى يصل إلى المتسوقين. وتبني الأسطول كله عند كل إصدار للنواة.

### داخل الإصدار الأول (Must)
- **خط البناء لكل تاجر** من قاعدة كود واحدة (ADR-0002): جلب `tenant.json`، وتوليد الأيقونة والسبلاش، وضبط المعرّفات والاسم بلغتين والصلاحيات (entitlements)، وملفات Firebase، وامتداد الإشعارات الغنية.
- **التوقيع** لكل تاجر: iOS بمفتاح App Store Connect API الخاص بفريق التاجر، وأندرويد بمفتاح رفع (upload key) لكل تاجر مع Play App Signing.
- **الترقيم**: إصدار تسويقي مشترك للأسطول، ورقم بناء لكل تاجر.
- **الرفع** إلى TestFlight (اختبار داخلي) وإلى مسار Internal testing في Google Play.
- **بيانات قائمة المتجر** ولقطاتها ورسومها تُرفع عبر الـ API، مع تحقق من الأطوال والمقاسات.
- **التقديم للمراجعة بعد موافقة التاجر** (ADR-0007، البند 3)، ومتابعة حالة المراجعة والإطلاق، والإطلاق المرحلي.
- **بناء الأسطول** عند كل إصدار للنواة: موجات، وتزامن محدود، وطابور بأولويات، وإعادة محاولة، وإيقاف آلي عند الفشل الجماعي (F-P02).
- **دعم إنشاء السجل الأول يدويًا**: تسجيل المعرّفات آليًا، ثم قائمة تحقق للمشرف، ثم ربط السجل بالمنصة.
- **واجهات خادم** لحالة البناء والسجلات وإعادة المحاولة، تعرضها M15.

### لاحقًا (Should وCould)
- **Should**: مولّد لقطات المتجر من محرك المعاينة (F-M09b)، وإيقاف الطرح المرحلي آليًا عند ارتفاع الانهيارات، ولوحة تكلفة البناء ومدته.
- **Could**: محوّل GitHub Actions بديلًا لـ Codemagic، ورفع ملف iOS من الخادم عبر Build Uploads API، ورقع Shorebird لكل ملف تنفيذي (ADR-0006، البند 5)، وجهاز Mac ذاتي الاستضافة عند تجاوز 200 تاجر.

### ليس من مسؤوليتها
- جمع المفاتيح من التاجر وشرح إنشائها والتحقق الأول منها: **M14**.
- تخزين الأسرار وتشفيرها: **M12**. وM13 تقرأ منها فقط عبر واجهتها.
- إنشاء مشاريع Firebase وتطبيقاتها ورفع مفتاح APNs إلى FCM: **M06**.
- ملفا `apple-app-site-association` و`assetlinks.json` وصيغة الروابط: **M07**. وM13 تضع النطاقات في الملف التنفيذي وتعطي M07 بصمة شهادة التوقيع.
- شاشات اللوحة: **M15**. وM13 تملك العقود والمنطق.

## 2. المكونات حسب الطبقة

### 2.1 Laravel: وحدة `Builds` (ADR-0005)

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `lcobucci/jwt` | 5.6.x | توقيع JWT بـ ES256 لـ App Store Connect API ([توليد الرموز](https://developer.apple.com/documentation/appstoreconnectapi/generating-tokens-for-api-requests)) |
| `google/apiclient` و`google/apiclient-services` | 2.20.x و0.466.x | عميل Google Play Developer API (`AndroidPublisher`) وIAM API |
| `phpseclib/phpseclib` | 4.0.x | توليد مفتاح RSA وطلب توقيع الشهادة (CSR) لشهادة التوزيع |
| `spatie/browsershot` | 5.5.x | التقاط اللقطات المركّبة (Should) |
| `intervention/image` | 4.4.x | إزالة قناة الشفافية وتحويل الصيغ والتحقق من المقاسات |
| Redis | — | الطوابير، وإشارة التزامن (semaphore)، ومحدّد المعدّل لكل حساب متجر |

| الملف أو الصنف | المسؤولية |
|---|---|
| `Builds/Ci/CiProvider` (واجهة) و`CodemagicProvider` | `dispatch`، و`status`، و`cancel`. واجهة واحدة حتى يُضاف `GithubActionsProvider` لاحقًا دون تغيير بقية الوحدة |
| `Builds/Config/TenantConfigBuilder` | يبني `tenant.json` وحزمة أسرار البناء من بيانات M02 وM06 وM07 وM11 وM14 |
| `Builds/Apple/AppStoreConnectClient` | JWT بعمر 15 دقيقة، وإعادة المحاولة عند 429 و5xx، وتحويل الأخطاء إلى أصناف (القسم 6) |
| `Builds/Apple/SigningProvisioner` | تسجيل معرّفات الحزمة وقدراتها، ومفتاح الشهادة لكل فريق |
| `Builds/Google/PlayPublisherClient` | دورة `edits`: إنشاء، ثم تعديل، ثم `commit` |
| `Builds/Versioning/BuildNumberAllocator` | رقم بناء متزايد لكل تطبيق، بقفل صف |
| `Builds/Listing/ListingPublisher` | مزامنة النصوص واللقطات والرسوم مع المتجرين |
| `Builds/Release/SubmissionService` | التقديم بعد موافقة التاجر |
| `Builds/Release/ReleaseMonitor` | webhooks من Apple، واستطلاع دوري للمتجرين |
| `Builds/Fleet/FleetOrchestrator` | قطار الإصدار: الموجات، والتزامن، والإيقاف الآلي |
| `Builds/Http/*` | واجهات التاجر والإدارة وCI والـ webhooks (القسم 5) |

**الطوابير**: `builds-dispatch` (أولوية: طلبات التاجر والدعم أولًا، ثم الأسطول)، و`store-api` (استدعاءات Apple وGoogle، بحد لكل حساب متجر)، و`assets` (توليد الصور).

### 2.2 CI: Codemagic

- تطبيق Codemagic واحد مربوط بمستودع Flutter، وworkflowان في `codemagic.yaml`: `ios-tenant` على `mac_mini_m2`، و`android-tenant` على Linux. والبناء يُطلق من Laravel فقط عبر `POST https://api.codemagic.io/builds` ([Builds API](https://docs.codemagic.io/rest-api/builds/)).
- **لا تُخزَّن أسرار التاجر في variable groups**. هذا عكس النمط الموثق في [دليل Codemagic للتطبيقات البيضاء](https://docs.codemagic.io/yaml-quick-start/white-label-getting-started). بدلًا منه يُمرَّر للبناء رمز لمرة واحدة، ويجلب به السكربت حزمة الأسرار من خادمنا. السبب: تبقى الأسرار في خزنة M12 وحدها (ADR-0007، البند 2)، ويبقى الخط قابلًا للنقل إلى CI آخر.
- أدوات CI:

| الأداة | الإصدار | الاستخدام |
|---|---|---|
| `codemagic-cli-tools` | 0.70.x | `app-store-connect fetch-signing-files`، و`keychain`، و`xcode-project use-profiles`، و`app-store-connect publish`. وهي حزمة pip مفتوحة، فتعمل خارج Codemagic أيضًا ([PyPI](https://pypi.org/project/codemagic-cli-tools/)) |
| Xcode | 26.x | إلزامي للرفع منذ 28 أبريل 2026 ([متطلبات Apple](https://developer.apple.com/news/upcoming-requirements/)) |
| Flutter | يثبّته الدليل الهندسي ويُمرَّر في `softwareVersions` | نسخة واحدة لكل قطار إصدار |
| `targetSdk` | 36 | إلزامي للتطبيقات الجديدة والتحديثات منذ 31 أغسطس 2026 ([Google](https://developer.android.com/google/play/requirements/target-sdk)) |

### 2.3 مشروع Flutter (ملفات البناء فقط)

| الملف | المسؤولية |
|---|---|
| `tool/tenantize.dart` | أداة Dart مستقلة عن CI: تقرأ `tenant.json` وتكتب كل ملفات الهوية (القسم 3.2). تُشغَّل محليًا أيضًا لإعادة إنتاج بناء أي تاجر |
| `ios/Flutter/Tenant.xcconfig` | يولّده `tenantize`: `TENANT_BUNDLE_ID`، و`TENANT_TEAM_ID`، و`TENANT_BUILD_NAME`، و`TENANT_BUILD_NUMBER`. ويُضمَّن في `Release.xcconfig`، فلا حاجة إلى `sed` على `project.pbxproj` |
| `ios/Runner/ar.lproj/InfoPlist.strings` و`en.lproj` | `CFBundleDisplayName` بلغتين |
| `ios/Runner/Runner.entitlements` | `aps-environment` و`com.apple.developer.associated-domains` |
| `ios/NotificationService/` | هدف امتداد (Notification Service Extension) للإشعارات الغنية، ومعرّفه `$(TENANT_BUNDLE_ID).NotificationService` |
| `android/tenant.properties` | يولّده `tenantize`: `applicationId`، و`versionCode`، و`versionName`، ومسار مفتاح الرفع |
| `android/app/build.gradle.kts` | يقرأ `tenant.properties`. ويبقى `namespace` ثابتًا (`sa.intishar.app`)، ويتغير `applicationId` فقط، فلا حاجة إلى نقل الحزم أو `change_app_package_name` |
| `android/app/src/main/res/values/strings.xml` و`values-ar/` | `app_name` بلغتين. يُكتب الملف مباشرة، لأن `resValue()` لـ `app_name` يفشل افتراضيًا مع AGP 9 ([Flutter flavors](https://docs.flutter.dev/deployment/flavors)) |
| `pubspec.yaml` (dev) | `flutter_launcher_icons: 0.14.4`، و`flutter_native_splash: 2.4.8` |

### 2.4 Next.js
لا مكونات خاصة بـ M13. شاشات «حالة التطبيق» و«قائمة المتجر» و«لوحة البناء» في M15، وتستهلك واجهات القسم 5.

## 3. التدفقات

### 3.1 اختيار خط البناء: Codemagic أم GitHub Actions مع fastlane

| المعيار | Codemagic (موصى به في D-05) | GitHub Actions مع fastlane |
|---|---|---|
| إطلاق البناء من الخادم | `POST /builds` مع متغيرات ومجموعات لكل بناء | `workflow_dispatch` عبر REST |
| التوقيع لكل تاجر | `fetch-signing-files --create` ينشئ الشهادة والملفات الشخصية للتطبيق والامتدادات ([التوقيع](https://docs.codemagic.io/yaml-code-signing/signing-ios/)) | `match` مع مخزن (git أو S3) لكل فريق، أو الأداة نفسها `codemagic-cli-tools` |
| الرفع للمتجرين | مدمج (`publishing`) | `pilot` و`supply` من fastlane 2.241 |
| حالة البناء | لا webhook صادر موثق. نستخدم استدعاءً من السكربت مع استطلاع `GET /builds/:id` احتياطيًا | webhook `workflow_run` واستطلاع |
| التزامن | 1 مضمّن، و49 دولارًا شهريًا لكل إضافي، أو خطة سنوية بـ 3 ([الأسعار](https://docs.codemagic.io/billing/pricing/)) | 5 مهام macOS كحد أعلى في خطة Team ([الحدود](https://docs.github.com/en/actions/reference/limits)) |
| سعر الدقيقة | macOS M2: 0.095، وLinux: 0.045 دولار | macOS M1 (3 أو 4 أنوية): 0.062، وLinux بنواتين: 0.006 دولار ([الأسعار](https://docs.github.com/en/billing/reference/actions-runner-pricing)) |
| الصيانة على منفذ واحد | أقل: سكربتات التوقيع والرفع جاهزة | أعلى: سكربتات التوقيع والرفع وإدارة الشهادات ملكنا |
| حالات مرجعية | Criton تبني لأكثر من 200 فندق عبر API ([دراسة حالة](https://blog.codemagic.io/criton-case-study/)) | لا مرجع خاص بالتطبيقات البيضاء |

**تكلفة البناء الواحد** (تقدير يُقاس في SPK-13: بناء iOS نحو 15 دقيقة على M2 ونحو 18 على M1، وأندرويد نحو 10 دقائق على Linux X2 ونحو 14 على Linux بنواتين):

| | Codemagic | GitHub Actions |
|---|---|---|
| iOS | 15 × 0.095 = 1.43 دولار | 18 × 0.062 = 1.12 دولار |
| أندرويد | 10 × 0.045 = 0.45 دولار | 14 × 0.006 = 0.08 دولار |
| **تاجر واحد (المنصتان)** | **1.88 دولار** | **1.20 دولار** |

**التوصية**: Codemagic للإصدار الأول، كما في D-05. الفرق نحو 0.7 دولار للتاجر في كل بناء، وهو أقل بكثير من كلفة أسبوعين إلى ثلاثة من وقت المنفذ لبناء سكربتات التوقيع وصيانتها. والحسم النهائي بأرقام SPK-13. وكل منطق التهيئة في `tool/tenantize.dart` وواجهة `CiProvider`، فالانتقال لاحقًا لا يمس بقية الوحدة.

### 3.2 بناء تطبيق تاجر واحد

1. **الطلب**: يأتي من التاجر (تغيير الاسم أو الأيقونة، F-M09)، أو من الدعم، أو من قطار الأسطول. يُنشأ صف `builds` لكل منصة بحالة `queued`، مع مفتاح منع التكرار (القسم 4).
2. **فحص الجاهزية** قبل الإرسال إلى CI. يفشل البناء فورًا بصنف `precondition` إن نقص أي من:
   - سجل التطبيق مرتبط بالمنصة (`store_apps.status` لا يقل عن `record_linked`)، أو البناء من نوع `first_upload`.
   - مفاتيح صالحة من M14 (`store_credentials.status = valid`).
   - ملفات Firebase من M06، والأصول المصدرية من M02.
3. **حجز رقم البناء** من `BuildNumberAllocator` (القسم 3.5).
4. **الإرسال**: `CodemagicProvider::dispatch` يرسل `POST /builds` بالمتغيرات `BUILD_ID` و`BUILD_TOKEN` (رمز لمرة واحدة، عمره 90 دقيقة)، والوسم `tenant:{slug}`. ثم تصبح الحالة `dispatched`، ويُحفظ `ci_build_id`.
5. **في CI، الجلب**: يستدعي السكربت `GET /api/internal/ci/builds/{id}/bundle` بالرمز. فيحصل على `tenant.json` وحزمة الأسرار (القسم 5.3). والرمز يُبطَل بعد أول استخدام لجزء الأسرار.
6. **التهيئة**: `dart run tool/tenantize.dart --config build/tenant.json`. وتفعل الأداة ما يلي بالترتيب:
   1. تتحقق من `tenant.json` بالمخطط (`schema_version`)، وتتوقف عند أي حقل ناقص.
   2. تنزّل الأيقونة المصدرية (1024×1024 PNG) وتتحقق من بصمتها `sha256`. ثم تكتب `flutter_launcher_icons-tenant.yaml` (مع `remove_alpha_ios: true`، و`adaptive_icon_background` لونًا، و`adaptive_icon_foreground`، و`adaptive_icon_monochrome`)، وتشغّل `dart run flutter_launcher_icons -f flutter_launcher_icons-tenant.yaml` ([الحزمة](https://pub.dev/packages/flutter_launcher_icons)).
   3. تكتب `flutter_native_splash-tenant.yaml` (اللون للوضعين، والصورة، وقسم `android_12` بأيقونة 1152×1152 بلا خلفية)، وتشغّل `dart run flutter_native_splash:create --path=flutter_native_splash-tenant.yaml` ([الحزمة](https://pub.dev/packages/flutter_native_splash)).
   4. تكتب `ios/Flutter/Tenant.xcconfig`، و`InfoPlist.strings` بلغتين، و`Runner.entitlements` (`aps-environment = production`، و`applinks:` لكل نطاق من M07).
   5. تكتب `android/tenant.properties`، و`strings.xml` بلغتين، و`intent-filter` لـ App Links بـ `android:autoVerify="true"` لكل نطاق من M07.
   6. تكتب `ios/Runner/GoogleService-Info.plist` و`android/app/google-services.json` من حزمة الأسرار (M06).
   7. تنزّل لقطة التخطيط الاحتياطية من M11 إلى `assets/tenant/snapshot.json` (ADR-0006، البند 3).
   8. تكتب `build/tenant.defines.json` بالثوابت غير السرية فقط، لـ `--dart-define-from-file`. وهذه الثوابت قابلة للاستخراج من الملف التنفيذي، فلا يوضع فيها سر.
7. **التوقيع والبناء**:
   - **iOS**: `keychain initialize`، ثم `app-store-connect fetch-signing-files "$BUNDLE_ID" --type IOS_APP_STORE --create` بمفتاح فريق التاجر ومفتاح الشهادة الخاص من الحزمة. هذا الأمر يجلب ملف التطبيق وملف الامتداد معًا، لأنه يطابق `$BUNDLE_ID` و`$BUNDLE_ID.*`. ثم `keychain add-certificates`، ثم `xcode-project use-profiles`، ثم `flutter build ipa --release --build-name=$BUILD_NAME --build-number=$BUILD_NUMBER --dart-define-from-file=build/tenant.defines.json --export-options-plist=/Users/builder/export_options.plist`.
   - **أندرويد**: يُفك مفتاح الرفع من الحزمة إلى ملف مؤقت، ثم `flutter build appbundle --release` بالمعاملات نفسها.
8. **فحوص ما بعد البناء**: حجم الملف (تحذير فوق 40 MB، وفشل فوق 60 MB، والهدف في PRD ≤ 40 MB)، وأن `CFBundleIdentifier` و`applicationId` يطابقان الإعداد، وأن `ITSAppUsesNonExemptEncryption = NO` موجود.
9. **الرفع**:
   - iOS إلى TestFlight عبر `app-store-connect publish` دون إرسال للاختبار الخارجي. ثم يضيف الخادم البناء إلى مجموعة الاختبار الداخلي `Intishar QA`، المنشأة عند ربط السجل.
   - أندرويد إلى مسار `internal` بحالة `completed`.
10. **الاستدعاء الراجع**: السكربت يرسل `POST /api/internal/ci/builds/{id}/events` موقّعًا بـ HMAC بعد كل خطوة، و`uploaded` في النهاية مع بصمة الملف وحجمه. وتصبح الحالة `processing` لـ iOS، و`ready` لأندرويد.
11. **اكتمال المعالجة في iOS**: `ReleaseMonitor` يستطلع `GET /v1/builds?filter[app]={appId}&filter[version]={buildNumber}` كل دقيقتين حتى `processingState = VALID`، ثم تصبح الحالة `ready`. ويُطلق الحدث `BuildReady`، فتعرض M14 وM15 روابط الاختبار.
12. **مسار الخطأ**: أي خطوة تفشل ترسل `step_failed` مع اسم الخطوة وآخر 200 سطر من السجل بعد تنقيته من الأسرار. ويُصنَّف الفشل (القسم 6). وإن لم يصل أي استدعاء خلال 75 دقيقة، يستطلع الخادم `GET /builds/:id`، ثم يلغي البناء بـ `POST /builds/:id/cancel` إن تجاوز 90 دقيقة.

**مقتطف `codemagic.yaml`** (iOS، مختصر):

```yaml
workflows:
  ios-tenant:
    name: iOS tenant build
    instance_type: mac_mini_m2
    max_build_duration: 90
    environment:
      flutter: $FLUTTER_VERSION
      xcode: 26.0
    scripts:
      - name: Fetch tenant bundle
        script: ci/scripts/fetch_bundle.sh   # يستخدم $BUILD_ID و$BUILD_TOKEN
      - name: Tenantize
        script: dart run tool/tenantize.dart --config build/tenant.json
      - name: Signing
        script: |
          keychain initialize
          app-store-connect fetch-signing-files "$BUNDLE_ID" \
            --type IOS_APP_STORE --create \
            --issuer-id "$ASC_ISSUER_ID" --key-id "$ASC_KEY_ID" \
            --private-key "@file:build/secrets/asc.p8" \
            --certificate-key "@file:build/secrets/dist_cert_key.pem"
          keychain add-certificates
          xcode-project use-profiles
      - name: Build
        script: |
          flutter build ipa --release \
            --build-name="$BUILD_NAME" --build-number="$BUILD_NUMBER" \
            --dart-define-from-file=build/tenant.defines.json \
            --export-options-plist=/Users/builder/export_options.plist
      - name: Upload
        script: ci/scripts/upload_ios.sh   # app-store-connect publish ثم استدعاء events
      - name: Cleanup secrets
        script: rm -rf build/secrets && keychain delete
    artifacts:
      - build/ios/ipa/*.ipa
```

### 3.3 ما يحتاج بناءً وما لا يحتاج

| التغيير | يحتاج بناءً؟ | المصدر |
|---|---|---|
| اسم التطبيق على الشاشة (بلغتين)، والأيقونة، والسبلاش الأصلي | نعم | ADR-0002، البند 4 |
| النطاقات المرتبطة، ومعرّفات Firebase | نعم | M07 وM06 |
| اسم القائمة في المتجر، ووصفها، ولقطاتها | لا. تُحدَّث مع أول تقديم تالٍ لنسخة جديدة | القسم 3.7 |
| التخطيط، والألوان، والخطوط، والسبلاش الداخلي | لا | M11 وM02 (ADR-0006) |

### 3.4 التوقيع

**iOS (لكل فريق تاجر)**
1. M14 تسلّم مفتاح فريق (Team key) بدور App Manager، بعد التحقق منه. المفتاح الفردي (Individual key) لا يكفي، لأن Apple تنص على أن المفاتيح الفردية لا تستطيع استخدام نقاط Provisioning ([Apple](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api)).
2. عند أول ربط، يولّد `SigningProvisioner` مفتاح RSA 2048 خاصًا بفريق التاجر، ويحفظه في خزنة M12 (`ios_dist_cert_key`). هذا المفتاح هو `--certificate-key`، فيعيد Codemagic استخدام شهادة Apple Distribution نفسها في كل بناء بدل إنشاء شهادة جديدة.
3. يسجّل المعرّفين عبر API: `POST /v1/bundleIds` للتطبيق (`IOS`) وللامتداد `{bundle}.NotificationService`. ثم `POST /v1/bundleIdCapabilities` لقدرة `PUSH_NOTIFICATIONS` و`ASSOCIATED_DOMAINS` على معرّف التطبيق.
4. شهادة التوزيع والملفات الشخصية يتولاها `fetch-signing-files --create` في CI.
5. **التوقيع اليدوي هو الافتراضي**، لا التوقيع الآلي في Xcode. السبب أن التوقيع الآلي بالشهادات المدارة سحابيًا يحتاج صلاحية إضافية من Admin، وسلوكه أقل حتمية في CI. وما نسميه هنا «يدويًا» آلي بالكامل عبر API.
6. **الحد**: Apple تسمح بثلاث شهادات Apple Distribution لكل فريق ([Codemagic](https://docs.codemagic.io/yaml-code-signing/signing-ios/)). إن امتلأ الحد، يتوقف البناء بصنف `credentials`، وتطلب M14 من التاجر حذف شهادة لا يستخدمها.

**أندرويد (لكل تطبيق)**
1. عند تسجيل التطبيق، يولّد الخادم مفتاح رفع (upload key) خاصًا بالتاجر: `keytool -genkeypair -keyalg RSA -keysize 4096 -validity 10000 -alias upload`، بكلمة مرور عشوائية بطول 32. ويُحفظ في خزنة M12.
2. مفتاح التوقيع النهائي يولّده Google ويحفظه عند أول رفع (Play App Signing). Google تولّد مفاتيح RSA 4096، وتشترط في مفتاح الرفع RSA 2048 فأكثر ([Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)).
3. بعد أول رفع، يجلب الخادم بصمة SHA-256 لشهادة توقيع التطبيق من `generatedapks.list` (الحقل `certificateSha256Hash`)، ويسلّمها إلى M07 من أجل `assetlinks.json`. يُتحقق من الحقل في SPK-14.
4. فقدان مفتاح الرفع أو تسريبه: يُولَّد مفتاح جديد، ويطلب المشرف «Request upload key reset» من صفحة Play app signing بحساب له صلاحية Admin ([Google](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)).

### 3.5 الترقيم

- **الإصدار التسويقي** `MAJOR.MINOR.PATCH`:
  - `MAJOR.MINOR` مشترك للأسطول، ويساوي إصدار النواة في قطار الإصدار. كل قطار للأسطول يرفع `MINOR` على الأقل، حتى إصلاحات الأسطول العاجلة.
  - `PATCH` لكل تاجر، ويبدأ بصفر في كل قطار. يرتفع فقط حين يحتاج تاجر تقديمًا جديدًا داخل القطار نفسه، بعد أن أُطلقت نسخته السابقة فعلًا (مثل تغيير الأيقونة بعد الإطلاق). السبب أن Apple تشترط إصدارًا أعلى من آخر إصدار منشور. وما دامت النسخة لم تُطلق، يُرفع بناء جديد على الإصدار نفسه دون رفع `PATCH`.
- **رقم البناء**: عدد صحيح واحد لكل تطبيق، يُستخدم كـ `CFBundleVersion` وكـ `versionCode` معًا.
  1. `BuildNumberAllocator` يقفل صف `store_apps` (`SELECT ... FOR UPDATE`)، ويأخذ `next_build_number`، ثم يزيده.
  2. **حماية من التصادم**: قبل أول بناء بعد الربط، وبعد كل فشل من نوع «رقم مستخدم»، يُقرأ أعلى رقم من المتجر (`GET /v1/builds?filter[app]=..&sort=-version&limit=1`، و`edits.tracks.list` في Google)، ويصبح العداد هو الأكبر + 1.
  3. حد أندرويد الأعلى لـ `versionCode` هو 2100000000، وهو بعيد عن الاستخدام الفعلي.

### 3.6 الرفع والاختبار قبل التقديم

1. **TestFlight**: البناء يصل إلى مجموعة داخلية `Intishar QA` تضم التاجر (Account Holder) ومستخدم المنصة. تُنشأ المجموعة عند ربط السجل عبر `POST /v1/betaGroups` بقيمتي `isInternalGroup: true` و`hasAccessToAllBuilds: true`. الاختبار الداخلي لا يحتاج مراجعة Beta.
2. **Play internal testing**: قائمة مختبرين بالبريد تُنشأ يدويًا عند السجل الأول. واجهة `edits.testers` لا تدعم قوائم البريد، بل مجموعات Google فقط ([Google](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.testers)). ورابط الانضمام يُحفظ في `store_apps.play_internal_opt_in_url` وتعرضه M14.
3. الحدث `BuildReady` ينقل خطوة «اختبر تطبيقك» في M14 إلى «جاهز».

### 3.7 بيانات القائمة واللقطات

**مصدر البيانات**: M14 وM15 تجمعان النص من التاجر في `store_listings` بنسخ (مسودة، ثم معتمدة). وM13 تتحقق منها وتزامنها.

| الحقل | Apple (`ar-SA` و`en-US`) | Google (`ar` و`en-US`) |
|---|---|---|
| الاسم | `appInfoLocalizations.name`، من 2 إلى 30 حرفًا ([Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information)) | `listings.title`، حتى 30 حرفًا |
| العنوان الفرعي أو الوصف القصير | `subtitle`، حتى 30 حرفًا | `shortDescription`، حتى 80 حرفًا ([Google](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)) |
| الوصف | `appStoreVersionLocalizations.description`، حتى 4000 حرف، نص بلا HTML | `fullDescription`، حتى 4000 حرف |
| الكلمات المفتاحية | `keywords`، حتى 100 بايت (العربية حرفان لكل حرف تقريبًا بترميز UTF-8) | لا يوجد |
| النص الترويجي | `promotionalText`، حتى 170 حرفًا | لا يوجد |
| الجديد في الإصدار | `whatsNew`، حتى 4000 حرف، وإلزامي بعد الإصدار الأول ([Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)) | `releaseNotes` في الإصدار، حتى 500 حرف |
| الروابط | `privacyPolicyUrl`، و`supportUrl`، و`marketingUrl` | `details.contactWebsite`، و`contactEmail`، وسياسة الخصوصية في App content |
| ملاحظات المراجعة | `appStoreReviewDetail`: جهة اتصال بهاتف دولي، وملاحظات حتى 4000 بايت تذكر أن التاجر مالك العلامة ومعها رقم السجل التجاري | لا يوجد |

**قالب ملاحظات المراجعة** (يُملأ آليًا بالعربية والإنجليزية): التطبيق متجر «{اسم المتجر}» المملوك لـ «{الاسم القانوني}» (سجل تجاري {رقم})، ومنشور من حسابه. التصفح والشراء متاحان دون دخول. والدفع لسلع مادية عبر صفحة المتجر، وفق الإرشادة 3.1.3(e).

**اللقطات والرسوم (Must: الرفع والتحقق)**

| المتجر | النوع | المقاس | العدد |
|---|---|---|---|
| Apple | `APP_IPHONE_67` (iPhone بـ Dynamic Island، شاشة كبيرة) | 1320×2868 | من 3 إلى 10 |
| Apple | `APP_IPHONE_61` (Dynamic Island، شاشة متوسطة) | 1206×2622 | من 3 إلى 10 |
| Google | `phoneScreenshots` | 1080×1920 (9:16)، والحد الأدنى 320 والأعلى 3840، ولا يتجاوز أحد البعدين ضعف الآخر | من 4 إلى 8 (4 بدقة 1080 فأكثر شرط للأهلية في الأشكال الترويجية) |
| Google | `featureGraphic` | 1024×500، JPEG أو PNG بلا شفافية، **إلزامية للنشر** | 1 |
| Google | `icon` | 512×512، PNG بـ 32 بت، حتى 1024 KB | 1 |

- صيغ Apple: JPEG أو PNG بلا قناة شفافية ([مواصفات اللقطات](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)).
- **لماذا مقاسان لـ Apple؟** صفحة Apple الحالية تذكر في «Required device sizes» فئة الشاشة المتوسطة. لكنها تذكر أيضًا أن كل فئة تُغطى بتصغير لقطات فئة أكبر. لذلك نرفع الفئتين معًا حتى لا يتوقف التقديم بسبب هذا الغموض.
- التطبيق **للآيفون فقط** (`TARGETED_DEVICE_FAMILY = 1`)، فلا تُطلب لقطات iPad.
- Apple تشترط لقطات «iPhone Duo» بدءًا من أبريل 2027 للتطبيقات المبنية بـ iOS 27.1 SDK أو أحدث. هذا بند لاحق يُتابع.

**خطوات الرفع إلى Apple**: `POST /v1/appScreenshotSets` (لكل نسخة ولغة ونوع عرض)، ثم `POST /v1/appScreenshots` بالاسم والحجم، فتعود `uploadOperations`. ثم `PUT` لكل جزء، ثم `PATCH /v1/appScreenshots/{id}` بقيمتي `uploaded: true` و`sourceFileChecksum` (MD5). ثم يُستطلع `assetDeliveryState` حتى `COMPLETE`.

**خطوات الرفع إلى Google**: داخل `edit` واحد: `edits.images.deleteall` لكل نوع ولغة، ثم `edits.images.upload`، ثم `edits.listings.update`، ثم `edits.details.update`، ثم `commit`.

**التحقق قبل أي رفع**: المقاس بالبكسل، وغياب قناة الشفافية، والصيغة، والعدد. ورفض لقطات مطابقة ببصمتها للقطات تاجر آخر، لأن Google تعدّ تكرار اللقطات بين التطبيقات مخالفة ([Google](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en)).

**رسمة Google المميزة (Must)**: تُولَّد آليًا من لون الهوية والشعار والاسم بالعربية، بقالب HTML يُلتقط بمقاس 1024×500. ويمكن للتاجر استبدالها برفع ملف.

### 3.8 التقديم للمراجعة بعد موافقة التاجر

1. التاجر يفتح «قدّم تطبيقك»، فتنشئ M13 تقديمًا بحالة `awaiting_merchant_approval`. ويُعرض عليه ملخص ثابت: البناء ورقمه، والإصدار، ونص القائمة، واللقطات، وطريقة الإطلاق (آليًا بعد القبول، أو يدويًا)، والإطلاق المرحلي.
2. يوافق صاحب الحساب في اللوحة (دور `owner` في M12). فيُحفظ `approved_by` و`approved_at` ولقطة JSON لما وافق عليه، ويُسجَّل في سجل التدقيق (M12).
3. **iOS**:
   1. `POST /v1/appStoreVersions`، أو `PATCH` على النسخة القائمة في `PREPARE_FOR_SUBMISSION`، بقيم `versionString` و`releaseType` (`AFTER_APPROVAL` أو `MANUAL`) و`copyright`.
   2. `PATCH /v1/appStoreVersions/{id}/relationships/build`.
   3. مزامنة القائمة واللقطات (القسم 3.7).
   4. للتحديثات فقط: `POST /v1/appStoreVersionPhasedReleases` بقيمة `phasedReleaseState: ACTIVE`.
   5. `POST /v1/reviewSubmissions` (علاقة `app`)، ثم `POST /v1/reviewSubmissionItems` (علاقة `appStoreVersion`)، ثم `PATCH /v1/reviewSubmissions/{id}` بقيمة `submitted: true`.
4. **أندرويد**:
   1. `edits.insert`، ثم مزامنة القائمة.
   2. `edits.tracks.update` على `production`. الإصدار الأول بحالة `completed`، والتحديثات بحالة `inProgress` مع `userFraction: 0.1`، ومع `releaseNotes` بلغتين.
   3. `edits.commit?changesInReviewBehavior=ERROR_IF_IN_REVIEW`، حتى لا يُلغى تقديم قيد المراجعة دون قصد. القيمة الافتراضية تلغيه ([Google](https://developers.google.com/android-publisher/api-ref/rest/v3/edits/commit)).
5. تصبح الحالة `waiting_for_review`، ويُطلق الحدث `SubmissionStatusChanged`.

### 3.9 متابعة المراجعة والإطلاق

**iOS، المصدر الأساسي webhook**:
- عند ربط السجل، يُنشأ webhook للتطبيق عبر `POST /v1/webhooks` بالحدثين `APP_STORE_VERSION_APP_VERSION_STATE_UPDATED` و`BUILD_UPLOAD_STATE_UPDATED`، وبسر عشوائي لكل تطبيق ([Apple](https://developer.apple.com/documentation/appstoreconnectapi/configuring-webhook-notifications)).
- إنشاء الـ webhook يحتاج دور Account Holder أو Admin أو App Manager. والحد عشرة لكل تطبيق ([Apple](https://developer.apple.com/help/app-store-connect/manage-your-team/manage-webhooks)).
- كل طلب يُتحقق منه بترويسة `x-apple-signature` (HMAC-SHA256 للجسم)، ثم يُعاد جلب النسخة بـ `GET /v1/appStoreVersions/{id}` قبل الوثوق بالحالة.
- **الاحتياط**: استطلاع كل 30 دقيقة للتقديمات المفتوحة، لأن Apple لا توثق إعادة إرسال آلية، بل إعادة يدوية فقط.

**أندرويد، استطلاع واستنتاج**:
- Google Play Developer API لا تكشف حالة «قيد المراجعة» أو «مقبول». ويؤكد ذلك مزودو أدوات الإصدار ([Runway](https://docs.runway.team/using-runway/release-steps/app-store-review)).
- لذلك: استطلاع `edits.tracks.get production` كل ساعتين، ثم فحص صفحة التطبيق العامة على Google Play. أول ظهور لها يعني `live` للإصدار الأول.
- للتحديثات، تُعرض الحالة «أُرسل للمراجعة (عادة خلال 7 أيام)» حتى يؤكدها المشرف أو تتجاوز 7 أيام، فيُنبَّه المشرف.
- الرفض يصل بالبريد إلى مالك الحساب، فيسجّله المشرف يدويًا.

**خريطة الحالات المعروضة للتاجر**:

| حالتنا | Apple (`appVersionState`) | Google | النص العربي |
|---|---|---|---|
| `waiting_for_review` | `WAITING_FOR_REVIEW` | بعد `commit` | بانتظار المراجعة |
| `in_review` | `IN_REVIEW` | لا يتوفر | قيد المراجعة |
| `rejected` | `REJECTED` أو `METADATA_REJECTED` | يدخله المشرف | مرفوض، وهذه الأسباب |
| `pending_release` | `PENDING_DEVELOPER_RELEASE` | لا يتوفر | مقبول، وبانتظار إطلاقك |
| `live` | `READY_FOR_DISTRIBUTION` | صفحة عامة أو تأكيد المشرف | متاح في المتجر |

**الإطلاق المرحلي**:
- **Apple**: سبعة أيام بنسب 1% ثم 2% ثم 5% ثم 10% ثم 20% ثم 50% ثم 100%. يمكن الإيقاف المؤقت 30 يومًا إجمالًا، والإطلاق للجميع في أي وقت ([Apple](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases)). يشمل التحديث الآلي فقط، أما التنزيل اليدوي فمتاح للجميع.
- **Google**: `userFraction` بقيم 0.1 ثم 0.5 ثم 1.0، بفاصل 48 ساعة. والتقدم آلي ما لم يُوقف.
- **الإيقاف** (يدويًا في الإصدار الأول، وآليًا في Should): إن هبطت نسبة الجلسات الخالية من الانهيار للإصدار الجديد تحت 99% (من M08 وSentry)، مع 200 جلسة على الأقل:
  - Apple: `PATCH /v1/appStoreVersionPhasedReleases/{id}` بقيمة `phasedReleaseState: PAUSED`.
  - Google: `status: halted`.
  - ثم تنبيه المشرف.

### 3.10 بناء الأسطول عند كل إصدار للنواة

1. **إنشاء قطار الإصدار**: المشرف ينشئه من لوحة الإدارة بالقيم: `version` (مثل 1.6.0)، و`git_tag`، ونسختي Flutter وXcode، ونص «الجديد» بلغتين، وحجم الموجة، وحد الفشل.
2. **فحص التقديمات المفتوحة**: كل تاجر عنده تقديم قيد المراجعة يُؤجَّل إلى آخر القطار، ولا يُلغى تقديمه.
3. **موجة الكناري**: متجر المنصة التجريبي، ثم ثلاثة تجار تجريبيين. يُبنى لهم، ويُرفعون، ويُختبرون يدويًا (فحص دخان من 15 دقيقة على جهازين). ثم يوافق المشرف على المتابعة.
4. **الموجات التالية**: بحجم افتراضي 10 تجار للموجة. كل وظيفة بناء تمر عبر:
   - **إشارة تزامن** في Redis (`ci:slots`)، قيمتها تساوي تزامن Codemagic المشترى ناقص واحد. الفتحة الباقية محجوزة لطلبات التاجر والدعم.
   - **محدّد معدّل** لكل حساب متجر، في استدعاءات `store-api`.
5. **إعادة المحاولة**: فقط للأصناف العابرة (`transient`). حتى محاولتين، بعد 10 دقائق ثم 30 دقيقة. ولا إعادة لأصناف `credentials` و`build` و`precondition`.
6. **قاطع الدائرة**: يتوقف القطار آليًا (`paused`) ويُنبَّه المشرف إن:
   - فشلت 20% أو أكثر من موجة لغير أسباب المفاتيح، أو
   - فشل 3 تجار بالبصمة نفسها (الخطوة مع أول سطر خطأ بعد تطبيعه).
7. **بعد الرفع**: لكل تاجر يُنشأ تقديم بحالة `awaiting_merchant_approval` مع إشعار له. وإن كان التاجر قد منح موافقة دائمة على تحديثات النواة (قرار مفتوح في القسم 8)، يُقدَّم آليًا.
8. **التذكير**: إن لم يوافق التاجر خلال 7 أيام، يذكَّر في اليوم 7 ثم في اليوم 14. وبعد 30 يومًا يظهر في لوحة الإدارة كـ «تطبيق متقادم». السبب أن إرشادة Apple 4.3(b) المحدّثة في يونيو 2026 تسمح بإزالة التطبيقات التي لا تُحدَّث (R-003).
9. **اكتمال القطار**: يكتمل حين يصل كل تاجر إلى `ready` أو `skipped` أو `failed_final`. ويُرفع `min_supported_app_version` في M12 فقط بقرار يدوي من المشرف بعد اكتمال الإطلاق.

**زمن بناء الأسطول المتوقع** (بناء iOS نحو 15 دقيقة، وأندرويد نحو 10):

| التجار | دقائق البناء | التزامن | الزمن الكلي |
|---|---|---|---|
| 10 | 250 | 2 | نحو ساعتين |
| 50 | 1250 | 3 | نحو 7 ساعات |
| 200 | 5000 | 7 | نحو 12 ساعة |

### 3.11 إنشاء السجل الأول يدويًا

لا توجد API لإنشاء سجل تطبيق في App Store Connect ولا في Play Console. فمرجع App Store Connect API لا يحوي `POST /v1/apps`، ويقرر Codemagic أن أول نسخة لكل عميل تُنشأ يدويًا ([Codemagic](https://docs.codemagic.io/yaml-quick-start/white-label-getting-started)). كما أن Google تتطلب رفع أول ملف لتطبيق جديد يدويًا، وإلا تعيد الـ API خطأ «Package not found» ([Codemagic](https://help.codemagic.io/articles/3880714096-why-did-publishing-to-google-play-fail-with-package-not-found-when-using-codemagic)، و[fastlane supply](https://docs.fastlane.tools/actions/supply/)).

**الخطوات**:
1. **آليًا**، بعد أن تؤكد M14 صلاحية المفاتيح: `SigningProvisioner` يسجّل معرّفي iOS وقدراتهما، ويولّد مفتاح الرفع لأندرويد. ثم تصبح `store_apps.status = identifiers_registered`، وتظهر المهمة في لوحة المشرف.
2. **يدويًا، Apple** (المشرف بحساب المنصة المدعو في فريق التاجر):
   1. App Store Connect، ثم تبديل الفريق إلى فريق التاجر، ثم Apps، ثم «+»، ثم New App.
   2. المنصة iOS. والاسم هو الاسم العربي من `store_listings`، ويجب أن يكون فريدًا في App Store.
   3. اللغة الأساسية Arabic. ومعرّف الحزمة هو المسجّل في الخطوة 1. وSKU بصيغة `intishar-{tenant_id}`. والوصول Full Access.
   4. App Information: الفئة الأساسية Shopping، وإعلان حقوق المحتوى، وأسئلة التصنيف العمري المحدّثة (إلزامية منذ 31 يناير 2026، [Apple](https://developer.apple.com/news/upcoming-requirements/)).
   5. App Privacy: أنواع البيانات حسب قالب المنصة. لا API لها.
   6. Pricing and Availability: مجاني، والدول حسب اختيار التاجر. الافتراضي دول الخليج، تجنبًا لاشتراط حالة التاجر (DSA) في الاتحاد الأوروبي ما لم يطلب التاجر ذلك.
   7. نسخ Apple ID الرقمي للتطبيق إلى لوحة الإدارة (`POST .../store-apps/ios/link`).
3. **آليًا بعد الربط**: التحقق بـ `GET /v1/apps?filter[bundleId]=...`، ثم إنشاء الـ webhook ومجموعة TestFlight الداخلية.
4. **يدويًا، Google** (المشرف بحساب المنصة المدعو):
   1. Play Console، ثم Create app. الاسم حتى 30 حرفًا، واللغة الافتراضية «العربية – ar»، والنوع App، والسعر Free، ثم الإقرارات.
   2. App content: سياسة الخصوصية، والإعلانات (لا)، وبيانات الدخول (التصفح متاح بلا دخول)، والجمهور المستهدف (18 فأكثر)، واستبيان تصنيف المحتوى، وData safety (عبر `POST /applications/{package}/dataSafety` بملف CSV من القالب، [Google](https://developers.google.com/android-publisher/api-ref/rest/v3/applications/dataSafety)، أو يدويًا)، والإقرارات الأخرى التي تظهر (التطبيقات الحكومية، والميزات المالية، والصحة، ومعرّف الإعلانات): لا.
   3. Store settings: الفئة Shopping، وبيانات الاتصال.
   4. **أول رفع**: تنزيل ملف AAB من بناء `first_upload` (بناء عادي لا يُرفع آليًا) من لوحة الإدارة، ثم رفعه إلى Internal testing. يُقبل مفتاح التوقيع الذي يولّده Google، وتُنشأ قائمة مختبرين بالبريد (بريد التاجر وبريد الفريق)، ثم يُطلق المسار.
   5. ربط التطبيق في لوحة الإدارة (`POST .../store-apps/android/link`).
5. **آليًا بعد الربط**: اختبار حساب الخدمة بـ `edits.insert` ثم `edits.delete`، ثم جلب بصمة شهادة التوقيع لـ M07، ثم `store_apps.status = record_linked`.

**قائمة تحقق المشرف** (تُخزَّن بنودها في `store_apps.checklist` وتعرضها M15):

| # | البند | المنصة | آلي أو يدوي | الزمن |
|---|---|---|---|---|
| 1 | مفاتيح التاجر صالحة (من M14) | الاثنتان | آلي | — |
| 2 | قبِل Account Holder أحدث اتفاقيات Apple (لا خطأ 403 على الاتفاقيات) | iOS | آلي | — |
| 3 | معرّفا الحزمة مسجّلان مع Push وAssociated Domains | iOS | آلي | — |
| 4 | الاسم متاح في App Store (وإلا يُختار بديل مع التاجر) | iOS | يدوي | 5 د |
| 5 | سجل التطبيق، والفئة، والتصنيف العمري، وحقوق المحتوى | iOS | يدوي | 10 د |
| 6 | App Privacy بالقالب | iOS | يدوي | 10 د |
| 7 | الدول والسعر | iOS | يدوي | 3 د |
| 8 | ربط Apple ID، ثم webhook ومجموعة TestFlight | iOS | يدوي ثم آلي | 2 د |
| 9 | مفتاح APNs مرفوع في Firebase لهذا التطبيق (M06، لا API له، [طلب ميزة مفتوح](https://github.com/firebase/firebase-admin-node/issues/2204)) | iOS | يدوي | 5 د |
| 10 | إنشاء التطبيق والإقرارات | Android | يدوي | 15 د |
| 11 | Data safety | Android | آلي أو يدوي | 5 د |
| 12 | أول AAB في Internal testing، وقائمة المختبرين، وPlay App Signing | Android | يدوي | 10 د |
| 13 | ربط التطبيق، واختبار حساب الخدمة، وبصمة الشهادة لـ M07 | Android | يدوي ثم آلي | 2 د |
| 14 | الفحص النهائي: بناء تجريبي ناجح على المنصتين | الاثنتان | آلي | 30 د |

### 3.12 تكلفة CI الشهرية

**الافتراضات**: قطاران للأسطول شهريًا (كل أسبوعين)، و0.5 بناء إضافي لكل تاجر (تغيير هوية أو دعم)، و10% إعادة محاولة. أي نحو 2.75 بناء لكل تاجر شهريًا على المنصتين، بتكلفة القسم 3.1.

| التجار | Codemagic بالدقيقة | Codemagic بالخطة السنوية | GitHub Actions (دقائق فقط) |
|---|---|---|---|
| 10 | 27.5 × 1.88 = 52، مع تزامن إضافي واحد (49): **نحو 101 دولار** | 3990 ÷ 12 = 333 (غير مجدية) | نحو 33 دولارًا، ويُضاف مقعدا Team (نحو 8) |
| 50 | 137.5 × 1.88 = 259، مع تزامنين (98): **نحو 357 دولارًا** | **نحو 333 دولارًا** بثلاث تزامنات ودقائق غير محدودة | نحو 166 دولارًا |
| 200 | 550 × 1.88 = 1034، مع 6 تزامنات (294): نحو 1328 دولارًا | 3990 + 4 × 1500 = 9990 سنويًا: **نحو 833 دولارًا** بسبع تزامنات | نحو 660 دولارًا، لكن حد macOS خمس مهام يجعل الأسطول نحو 12 ساعة دون مجال للنمو |

- **القرار التشغيلي**: الدفع بالدقيقة حتى نحو 45 تاجرًا، ثم الخطة السنوية (أسعار الخطة من [Codemagic](https://docs.codemagic.io/billing/pricing/)).
- تُسجَّل تكلفة كل بناء تقديريًا في `builds.cost_estimate_usd`، وتُراجع مع الفاتورة شهريًا.

## 4. نموذج البيانات

كل الجداول على الخادم (PostgreSQL)، وتحمل `tenant_id` بنمط العزل في M12. ولا يُخزَّن شيء من هذه الوحدة على جهاز المتسوق، عدا ما يُخبز في الملف التنفيذي.

**`store_apps`** (صف لكل تاجر ومنصة)

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | ulid | |
| `tenant_id` | ulid | فهرس |
| `platform` | enum: `ios`، `android` | فريد مع `tenant_id` |
| `bundle_id` | string | معرّف الحزمة في iOS، أو `applicationId` في أندرويد. ثابت بعد أول رفع |
| `apple_team_id` | string(10)، nullable | |
| `store_app_id` | string، nullable | Apple ID الرقمي. وفي Google هو `bundle_id` نفسه |
| `status` | enum | `not_ready`، ثم `identifiers_registered`، ثم `record_linked`، ثم `live`، أو `suspended` |
| `checklist` | jsonb | بنود القسم 3.11 مع الوقت ومن أنجزها |
| `next_build_number` | int | يبدأ بـ 1 |
| `live_version` | string، nullable | |
| `webhook_id` و`webhook_secret_ref` | string | الـ webhook في Apple، والسر في الخزنة |
| `play_internal_opt_in_url` | string، nullable | |
| `signing_cert_sha256` | string، nullable | بصمة توقيع Google لـ M07 |

**`release_trains`**: `id`، و`version` (فريد)، و`git_tag`، و`flutter_version`، و`xcode_version`، و`whats_new` (jsonb بلغتين)، و`status` (`draft`، `canary`، `rolling`، `paused`، `completed`، `cancelled`)، و`wave_size`، و`failure_threshold_pct`، و`created_by`، و`started_at`، و`finished_at`.

**`builds`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | ulid | |
| `tenant_id` و`store_app_id` | ulid | فهرس (`tenant_id`، `platform`، `created_at` تنازليًا) |
| `release_train_id` | ulid، nullable | |
| `trigger` | enum: `fleet`، `merchant`، `support`، `first_upload` | |
| `platform` | enum | |
| `marketing_version` و`build_number` | string وint | فريد (`store_app_id`، `build_number`) |
| `git_ref` | string | |
| `ci_provider` و`ci_build_id` | string | |
| `status` | enum | `queued`، و`dispatched`، و`building`، و`uploading`، و`processing`، و`ready`، و`failed`، و`cancelled` |
| `failure_class` | enum، nullable | `transient`، و`credentials`، و`build`، و`precondition`، و`store` |
| `failure_step` و`failure_fingerprint` | string | لقاطع الدائرة |
| `attempt` | smallint | فريد (`release_train_id`، `tenant_id`، `platform`، `attempt`) |
| `idempotency_key` | string | فريد |
| `bundle_token_hash` و`bundle_token_used_at` و`bundle_token_expires_at` | | الرمز نفسه لا يُخزَّن |
| `artifact_path` و`artifact_sha256` و`size_bytes` | | الملف في التخزين لمدة 30 يومًا |
| `duration_s` و`cost_estimate_usd` | int وdecimal | |
| `log_excerpt` | text | آخر 200 سطر بعد التنقية |

**`build_events`**: `build_id`، و`at`، و`type` (`step_started`، `step_failed`، `uploaded`، `processing_valid` …)، و`payload` (jsonb).

**`store_listings`**: `id`، و`tenant_id`، و`version` (int)، و`status` (`draft`، `approved`)، و`locales` (jsonb بمفاتيح `ar` و`en`، وحقول القسم 3.7)، و`urls` (jsonb)، و`review_notes`، و`created_by`، و`synced_ios_at`، و`synced_android_at`.

**`listing_assets`**: `id`، و`tenant_id`، و`listing_version`، و`platform`، و`display_type` (`APP_IPHONE_67`، `APP_IPHONE_61`، `phoneScreenshots`، `featureGraphic`، `icon`)، و`locale`، و`position`، و`path`، و`width`، و`height`، و`sha256`، و`md5`، و`source` (`generated`، `uploaded`)، و`store_asset_id`.

**`store_submissions`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | ulid | |
| `tenant_id` و`platform` و`build_id` و`listing_version` | | |
| `release_type` | enum: `after_approval`، `manual` | |
| `phased` | bool | افتراضيًا true للتحديثات |
| `status` | enum | `awaiting_merchant_approval`، و`approved`، و`submitting`، و`waiting_for_review`، و`in_review`، و`rejected`، و`pending_release`، و`live`، و`cancelled`، و`failed` |
| `approved_by` و`approved_at` و`approval_snapshot` | | لقطة JSON ثابتة لما وافق عليه التاجر |
| `approval_mode` | enum: `per_submission`، `standing_consent` | القسم 8 |
| `store_version_id` و`review_submission_id` و`play_edit_id` | string | |
| `rejection_reason` | text | |
| `rollout_state` | jsonb | النسبة الحالية وسجل الإيقاف |
| `submitted_at` و`decided_at` و`released_at` | timestamp | |

الأسرار لا تُخزَّن في هذه الجداول. M13 تطلبها من M12 بمفاتيح منطقية لكل تاجر: `asc_team_key`، و`ios_dist_cert_key`، و`android_upload_keystore`، و`play_service_account`، و`asc_webhook_secret`.

## 5. الواجهات والعقود

### 5.1 عقد `tenant.json`

ملف غير سري، يُنتج لكل بناء ويُحفظ معه للتدقيق وإعادة الإنتاج. ومخططه JSON Schema في `06-api/schemas/tenant.schema.json` (ADR-0010، البند 6).

```json
{
  "schema_version": 1,
  "tenant_id": "01JC8Z4V7N3QK2M5X9B1T6R0WD",
  "slug": "oud-house",
  "environment": "prod",
  "store": { "zid_store_id": 123456, "domain": "oudhouse.sa" },
  "app": {
    "bundle_id_ios": "sa.oudhouse.app",
    "application_id_android": "sa.oudhouse.app",
    "apple_team_id": "A1B2C3D4E5",
    "display_name": { "ar": "بيت العود", "en": "Oud House" },
    "marketing_version": "1.6.0",
    "build_number": 42,
    "default_locale": "ar"
  },
  "branding": {
    "icon": { "url": "https://cdn.intishar.app/t/oud-house/icon-1024.png", "sha256": "9f2c…" },
    "adaptive_icon": {
      "foreground_url": "https://cdn.intishar.app/t/oud-house/adaptive-fg-432.png",
      "monochrome_url": "https://cdn.intishar.app/t/oud-house/adaptive-mono-432.png",
      "background_color": "#1E1B18"
    },
    "splash": {
      "background_color": "#1E1B18",
      "background_color_dark": "#000000",
      "image_url": "https://cdn.intishar.app/t/oud-house/splash-logo.png",
      "android12_icon_url": "https://cdn.intishar.app/t/oud-house/splash-a12-1152.png"
    }
  },
  "links": {
    "ios_associated_domains": ["applinks:oudhouse.sa"],
    "android_app_link_hosts": ["oudhouse.sa"]
  },
  "push": { "firebase_project_id": "intishar-push-07", "rich_push_extension": true },
  "runtime": {
    "api_base_url": "https://api.intishar.app",
    "config_cdn_url": "https://cfg.intishar.app",
    "layout_snapshot_url": "https://cfg.intishar.app/t/oud-house/home/ar/v3.json",
    "sentry_dsn": "https://public@o0.ingest.sentry.io/0"
  }
}
```

**قواعد العقد**:
- كل حقل إلزامي ما لم يُذكر غير ذلك.
- `display_name.*` من 1 إلى 30 حرفًا، ويُنصح بـ 12 حرفًا أو أقل حتى لا يُقطع تحت الأيقونة. يُنبَّه التاجر في M15 ولا يُمنع.
- `bundle_id_ios` و`application_id_android` يطابقان النمط `^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$`. وهما ثابتان بعد أول رفع، فأي تغيير بعده يُرفض بخطأ `422 identifier_locked`.
- **المعرّف الافتراضي** هو نطاق التاجر معكوسًا مع `.app` (مثل `sa.oudhouse.app`). ولا يحمل اسم المنصة، لأن التطبيق ملك التاجر (ADR-0007). ويستطيع المشرف تعديله قبل التسجيل.
- `runtime.*` يُكتب في `tenant.defines.json` بأسماء `TENANT_ID` و`API_BASE_URL` و`CONFIG_CDN_URL` و`SENTRY_DSN` و`DEFAULT_LOCALE`.
- زيادة الحقول لا ترفع `schema_version`. وحذف حقل أو تغيير معناه يرفعه، وتدعم `tenantize` النسختين في قطار واحد على الأقل.

### 5.2 واجهات التاجر (Sanctum، من Next.js)

| الطريقة والمسار | الغرض |
|---|---|
| `GET /api/v1/merchant/app/release-status` | حالة كل منصة: السجل، وآخر بناء، وآخر تقديم، والإصدار المنشور، والطرح المرحلي |
| `POST /api/v1/merchant/app/builds` | طلب بناء بعد تغيير الاسم أو الأيقونة. الحد 3 طلبات يوميًا، ويرد `429` بعدها |
| `GET` و`PUT /api/v1/merchant/app/listing` | قراءة مسودة القائمة وحفظها، مع التحقق من الأطوال |
| `POST /api/v1/merchant/app/listing/assets` | رفع لقطة أو رسمة. ويرد `422` بسبب محدد عند خطأ المقاس أو الشفافية أو التكرار |
| `POST /api/v1/merchant/app/submissions` | إنشاء تقديم من آخر بناء جاهز |
| `POST /api/v1/merchant/app/submissions/{id}/approve` | موافقة صاحب الحساب |
| `POST /api/v1/merchant/app/submissions/{id}/release` | إطلاق نسخة في `pending_release` (الإطلاق اليدوي) |

```http
POST /api/v1/merchant/app/submissions/01JD0.../approve
{ "confirm_listing_version": 3, "release_type": "after_approval", "phased": true }

202 Accepted
{
  "data": {
    "id": "01JD0...",
    "platform": "ios",
    "status": "approved",
    "approved_at": "2026-11-10T09:12:44Z",
    "next": "submitting"
  }
}
```

```http
GET /api/v1/merchant/app/release-status

200 OK
{
  "data": {
    "ios": {
      "store_app": { "status": "record_linked", "bundle_id": "sa.oudhouse.app" },
      "latest_build": { "id": "01JC...", "version": "1.6.0 (42)", "status": "ready", "testflight": true },
      "submission": { "id": "01JD...", "status": "in_review", "status_label_ar": "قيد المراجعة", "updated_at": "2026-11-10T11:02:00Z" },
      "live_version": "1.5.0",
      "rollout": { "phased": true, "day": 3, "percent": 5, "state": "active" }
    },
    "android": {
      "store_app": { "status": "live", "bundle_id": "sa.oudhouse.app" },
      "latest_build": { "id": "01JC...", "version": "1.6.0 (42)", "status": "ready", "internal_opt_in_url": "https://play.google.com/apps/internaltest/..." },
      "submission": { "id": "01JD...", "status": "waiting_for_review", "status_label_ar": "بانتظار المراجعة (عادة خلال 7 أيام)" },
      "live_version": "1.5.0",
      "rollout": { "user_fraction": 0.1, "state": "inProgress" }
    }
  }
}
```

### 5.3 واجهات CI الداخلية

| الطريقة والمسار | المصادقة | الغرض |
|---|---|---|
| `GET /api/internal/ci/builds/{id}/bundle` | `Authorization: Bearer {BUILD_TOKEN}` (لمرة واحدة، 90 دقيقة) | `tenant.json` وحزمة الأسرار |
| `POST /api/internal/ci/builds/{id}/events` | ترويسة `X-Intishar-Signature` (HMAC-SHA256 بسر مشتق من الرمز) | أحداث الخطوات |

```json
{
  "build": { "id": "01JC...", "platform": "ios", "build_name": "1.6.0", "build_number": 42, "git_ref": "v1.6.0" },
  "tenant": { "schema_version": 1, "slug": "oud-house" },
  "secrets": {
    "asc": { "issuer_id": "57246542-96fe-1a63-e053-0824d011072a", "key_id": "2X9R4HXF34", "private_key_p8": "-----BEGIN PRIVATE KEY-----\n…" },
    "ios_dist_cert_key_pem": "-----BEGIN RSA PRIVATE KEY-----\n…",
    "firebase_ios_plist_b64": "PD94bWwg…"
  }
}
```

- لأندرويد تحل محل `asc` الحقول `upload_keystore_b64` و`keystore_password` و`key_alias` و`key_password` و`play_service_account_json` و`firebase_android_json_b64`.
- ترد الواجهة `410 Gone` إن استُخدم الرمز سابقًا، و`401` إن انتهى.
- يُسجَّل كل جلب في سجل التدقيق (M12).

```json
{ "type": "step_failed", "step": "signing", "at": "2026-11-10T09:40:02Z",
  "log_tail": "…No matching profiles found for bundle identifier…", "ci_build_id": "65f0…" }
```

### 5.4 واجهات الإدارة

| الطريقة والمسار | الغرض |
|---|---|
| `POST /api/v1/admin/release-trains` | إنشاء قطار |
| `POST /api/v1/admin/release-trains/{id}/start` و`pause` و`resume` و`cancel` | التحكم بالقطار |
| `GET /api/v1/admin/builds?status=failed&train=...&class=credentials` | قائمة البناءات مع التصفية |
| `POST /api/v1/admin/builds/{id}/retry` و`cancel` | إعادة محاولة أو إلغاء |
| `POST /api/v1/admin/tenants/{id}/store-apps/{platform}/identifiers` | تسجيل المعرّفات (القسم 3.11، الخطوة 1) |
| `POST /api/v1/admin/tenants/{id}/store-apps/{platform}/first-upload-build` | بناء AAB أو IPA دون رفع |
| `POST /api/v1/admin/tenants/{id}/store-apps/{platform}/link` | ربط السجل اليدوي `{ "store_app_id": "6740001234" }` |
| `PATCH /api/v1/admin/tenants/{id}/store-apps/{platform}/checklist` | تأشير بنود القائمة |
| `PATCH /api/v1/admin/submissions/{id}` | تسجيل حالة Google يدويًا (`live` أو `rejected` مع السبب) |

### 5.5 webhooks واردة

`POST /api/webhooks/app-store-connect/{store_app_id}`: يتحقق من `x-apple-signature` بسر التطبيق، ويرد `200` فورًا، ويعالج في الطابور. ولا يثق بالحمولة، بل يعيد جلب `appStoreVersions/{id}` أو `buildUploads/{id}`.

### 5.6 الأحداث الصادرة (أحداث نطاق داخل Laravel)

| الحدث | المستهلك |
|---|---|
| `BuildReady {tenant_id, platform, build_id, version}` | M14 (خطوة الاختبار)، وM15 |
| `BuildFailed {tenant_id, platform, failure_class, step}` | M14 (إن كان `credentials`)، والإدارة |
| `SubmissionStatusChanged {tenant_id, platform, from, to}` | M14، وM15، وإشعار بريدي للتاجر |
| `AppWentLive {tenant_id, platform, version, store_url}` | M14 (الخطوة 11)، وM08 |
| `StoreCredentialsRejected {tenant_id, kind, error_code}` | M14 (إعادة فتح خطوة المفتاح) |
| `SigningCertificateKnown {tenant_id, sha256}` | M07 |

### 5.7 العقود مع الوحدات الأخرى

| الوحدة | ما تعطيه لـ M13 | ما تأخذه من M13 |
|---|---|---|
| M14 | المفاتيح صالحة مع مراجعها في الخزنة، وبيانات الكيان، ومسودة القائمة الأولى، والفريق (Team ID) | الأحداث أعلاه، وحالة قائمة التحقق |
| M12 | `SecretVault::get(tenant, key)` و`put`، وسجل التدقيق، والأدوار، و`min_supported_app_version` | سجلات الوصول إلى الأسرار |
| M06 | `GoogleService-Info.plist` و`google-services.json`، وتأكيد رفع مفتاح APNs | معرّف الحزمة لتسجيل تطبيقات Firebase |
| M07 | قائمة النطاقات لكل تاجر | Team ID، ومعرّف الحزمة، وبصمة شهادة Google |
| M02 | الشعار وألوان الهوية، ومنها تُولَّد الأيقونة والسبلاش (F-M09) | — |
| M11 | رابط لقطة التخطيط الاحتياطية المنشورة | — |
| M08 | نسبة الجلسات الخالية من الانهيار لكل إصدار وتاجر | — |
| M15 | الشاشات | كل واجهات القسم 5 |

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| مفتاح App Store Connect أُلغي أو تغير دوره (401 أو 403) | فشل بصنف `credentials` دون إعادة محاولة. ثم `StoreCredentialsRejected`، فتعيد M14 فتح الخطوة وتذكّر التاجر |
| اتفاقيات Apple غير مقبولة (403 بمعنى أن الاتفاقيات ناقصة أو منتهية) | صنف `credentials` برسالة عربية: «يجب على صاحب الحساب قبول الاتفاقية في App Store Connect» |
| عضوية Apple السنوية منتهية | كما سبق، مع رابط التجديد، ويتوقف بناء الأسطول لهذا التاجر وحده |
| الوصول إلى حد شهادات Apple Distribution (3) | صنف `credentials`، ويُطلب من التاجر حذف شهادة غير مستخدمة. ولا يحذف النظام شهادات من تلقاء نفسه |
| اسم التطبيق محجوز في App Store | يقترح المشرف بديلًا (مثل «بيت العود للعطور») ويوافق التاجر، ثم يُحدَّث `store_listings` |
| رقم البناء مستخدم مسبقًا | قراءة أعلى رقم من المتجر، ثم ضبط العداد، ثم إعادة الرفع مرة واحدة |
| خطأ Google «Package not found» | السجل لم يُنشأ أو لم يُرفع أول ملف. يعود التطبيق إلى `identifiers_registered`، وتُفتح مهمة المشرف |
| خطأ Google بأن الإصدارات على تطبيق غير منشور يجب أن تكون مسودة | يعني أن التطبيق ما زال مسودة. يُرفع إلى `internal` بحالة `draft`، ويُنبَّه المشرف لإطلاق المسار من Console. يُتحقق من نص الخطأ في SPK-14 |
| تقديم قيد المراجعة في Google عند `commit` | `400 FAILED_PRECONDITION` مع `CHANGES_ALREADY_IN_REVIEW`: لا إلغاء، ويُعاد الجدولة بعد 24 ساعة، ويُنبَّه المشرف |
| تقديم iOS مفتوح عند بدء قطار جديد | يُؤجَّل التاجر إلى آخر القطار. ويُرفع البناء الجديد إلى TestFlight فقط |
| رفض المراجعة | الحالة `rejected` مع نص السبب (Apple عبر `GET` للتقديم، وGoogle يدويًا). يُشعَر التاجر والمشرف. وإن تكرر الرفض نفسه (4.3 أو 5.2.1) لثلاثة تجار، يُفتح بند في `inbox.md` (R-003) |
| تعطل Codemagic أو انتهاء مهلة البناء | صنف `transient`، ثم إعادة محاولتين، ثم `failed`. والقطار لا يتوقف إن لم يتجاوز الحد |
| فشل مزامنة اللقطات جزئيًا | تُعاد المزامنة لمجموعة اللقطات كاملة. ولا يُقدَّم التطبيق بقائمة ناقصة |
| تغيّر النطاق المرتبط (M07) بعد الإطلاق | يلزم بناء جديد. ويضعه النظام تلقائيًا في القطار التالي، أو كبناء دعم إن طلب المشرف |
| حجم الملف أكبر من 60 MB | يفشل البناء بصنف `build`، ويتوقف القطار إن تكرر لثلاثة تجار |
| مشروع Firebase للتاجر غير جاهز (M06) | صنف `precondition` قبل الإرسال، بلا استهلاك لدقائق CI |
| التاجر غيّر الأيقونة أثناء بناء جارٍ | البناء يكمل بالأصل المثبت ببصمته في `tenant.json`، ويقترح النظام بناءً جديدًا |
| بصمة لقطة تطابق تاجرًا آخر | رفض الرفع بخطأ `422 duplicate_asset` |
| التاجر لم يوافق على تحديث الأسطول خلال 30 يومًا | تذكير، ثم شارة «متقادم» في لوحة الإدارة. ولا تقديم دون موافقة ما لم تُعتمد الموافقة الدائمة |
| ارتفاع الانهيارات أثناء الطرح المرحلي | إيقاف يدوي في الإصدار الأول، وآلي في Should. ثم تنبيه، ثم قرار المشرف بالإصلاح عبر قطار عاجل |
| webhook من Apple بتوقيع غير صحيح | `401` وتسجيل أمني، دون معالجة |
| مغادرة التاجر للمنصة | تتوقف بناءاته، ويُطلب منه إلغاء المفاتيح وإزالة المستخدمين (M14). ويبقى التطبيق ملكه (ADR-0007) |

## 7. المتطلبات غير الوظيفية

| البند | المعيار |
|---|---|
| زمن بناء تاجر واحد | من الإرسال إلى `ready` في iOS: p90 ≤ 45 دقيقة. وفي أندرويد: p90 ≤ 30 دقيقة |
| زمن بناء الأسطول | 50 تاجرًا ≤ 8 ساعات بثلاث تزامنات. و200 تاجر ≤ 12 ساعة بسبع تزامنات |
| نجاح البناء | ≥ 95% من المحاولة الأولى، و≥ 99% بعد إعادة المحاولة، باستثناء صنفي `credentials` و`precondition` |
| زمن تحديث الحالة | ≤ دقيقة واحدة من وصول webhook من Apple، و≤ 30 دقيقة بالاستطلاع، و≤ ساعتين لـ Google |
| حجم الملف | ≤ 40 MB للتنزيل (هدف PRD)، يقاس بحجم IPA وحجم AAB في كل بناء ويُعرض في لوحة القطار |
| الأمان | لا سر في `tenant.json` ولا في `dart-define`. وأسرار CI تعيش في القرص المؤقت للبناء فقط وتُحذف في خطوة التنظيف. ورمز الحزمة لمرة واحدة وعمره 90 دقيقة. وJWT لـ Apple بعمر ≤ 15 دقيقة. وكل وصول إلى سر يُسجَّل باسم البناء |
| العزل | لا يُستخدم مفتاح تاجر في بناء تاجر آخر. وفحص آلي يقارن `apple_team_id` في الحزمة مع `TENANT_TEAM_ID` قبل التوقيع |
| التكلفة | تكلفة تقديرية لكل بناء مسجلة. وتنبيه إن تجاوزت تكلفة الشهر 120% من تقدير القسم 3.12 |
| العربية وRTL | كل حالة يراها التاجر لها نص عربي من ملف ترجمة. واللغة الأساسية للقائمة عربية، والإنجليزية ثانوية. واللقطات المولدة بنص عربي من اليمين إلى اليسار |
| إمكانية الوصول | M15 تعرض الحالات بنص وأيقونة، لا باللون وحده |
| المراقبة | لوحة القطار: عدد البناءات في كل حالة، ومعدل الفشل في كل موجة، وأكثر بصمات الفشل. وتنبيه عند توقف القطار، أو عند بناء عالق أكثر من 90 دقيقة، أو عند تقديم بلا تغيير حالة 72 ساعة في Apple و10 أيام في Google |
| قابلية الإعادة | أي بناء يُعاد إنتاجه محليًا من `tenant.json` المحفوظ، والوسم، ونسختي الأدوات |

## 8. الاعتماديات والمجهول

### التجارب المرتبطة
- **SPK-13 (حرجة)**: تثبت أن `tenantize` مع Codemagic يبني تطبيقين بهويتين ويرفعهما، وتقيس زمن البناء وتكلفته وحجم الملف. أرقام القسمين 3.1 و3.12 تقديرات حتى تُقاس. وتحسم D-05.
- **SPK-14 (حرجة)**، وتجيب عن:
  1. هل يكفي مفتاح فريق بدور App Manager لنقاط Provisioning (المعرّفات والقدرات والشهادات والملفات الشخصية) ولـ webhooks والتقديم؟ أم يلزم Admin؟ Codemagic توصي بـ App Manager ([Codemagic](https://docs.codemagic.io/yaml-code-signing/signing-ios/))، وجدول صلاحيات Apple لا يُقرأ آليًا.
  2. هل تُنشأ webhooks بمفتاح فريق؟
  3. ما نص خطأ Google عن «الإصدار المسودة على تطبيق غير منشور»؟
  4. هل يعيد `generatedapks.list` بصمة الشهادة؟
  5. هل يصل حدث `BUILD_UPLOAD_STATE_UPDATED` للرفع عبر `altool` أم فقط عبر Build Uploads API؟
- **SPK-10**: نطاق الروابط العامة (نطاق المتجر أم نطاق المنصة) يحدد قيم `links.*` في `tenant.json`. حتى حسمها، تبقى القيم فارغة ويُبنى دون Associated Domains.
- **SPK-15**: مولّد اللقطات (Should) يعتمد على محرك المعاينة نفسه.

### تعارضات مع الـ ADRs أو PRD
1. **ADR-0007، البند 3 («التاجر يوافق على كل تقديم»)** مقابل بناء الأسطول (ADR-0002، البند 3، وF-P02): مع 200 تاجر، ستتعطل تحديثات كثيرة بانتظار موافقات فردية، والتطبيقات المتقادمة معرضة للإزالة بإرشادة 4.3(b). **المقترح**: خيار «موافقة دائمة على تحديثات النواة التي لا تغير القائمة»، يفعّله صاحب الحساب صراحة، ويُسجَّل، ويُلغى في أي وقت، ويبقى التقديم الأول وكل تغيير في القائمة بموافقة فردية. هذا يحتاج قرار المشرف أو تعديل ADR-0007. وحتى ذلك، يعمل الإصدار الأول بالموافقة الفردية مع التذكيرات.
2. **PRD (F-M09b لقطات آلية = Should)** مقابل **ADR-0007، البند 5** (اللقطات «تتولد آليًا من المعاينة»): التقديم مستحيل بلا لقطات. فإن بقي المولّد Should، يجب أن يرفع كل تاجر لقطات بمقاسين لـ Apple ومقاس لـ Google، وهذه عقبة لتاجر غير تقني، وهي شكوى موثقة عند Tapcart. **المقترح**: رفع نسخة دنيا من المولّد (BLD-19) إلى Must، أو قبول رفع يدوي في الإصدار الأول وتعديل نص ADR-0007.
3. **ADR-0008 (FCM يوصل إلى iOS عبر APNs)**: رفع مفتاح APNs إلى Firebase بلا API عامة. فهي خطوة يدوية للمشرف لكل تاجر (البند 9 في قائمة التحقق). ليست تعارضًا، لكنها تكلفة تشغيل يجب أن تعرفها M06.
4. **ADR-0002، البند 2** يذكر إعادة كتابة `PRODUCT_BUNDLE_IDENTIFIER` و`applicationId`. هذه المواصفة تنفذه بملف `Tenant.xcconfig` و`tenant.properties` بدل `sed`. النتيجة واحدة، فلا يلزم تعديل ADR.
5. **مخزن الأسرار**: دليل Codemagic يضع الأسرار في variable groups. وهذه المواصفة تحفظها في خزنة M12 وتسلّمها بحزمة لمرة واحدة، التزامًا بـ ADR-0007، البند 2.

### قرارات مفتوحة للمشرف
- **D-05**: Codemagic أم GitHub Actions بعد SPK-13.
- خيار الموافقة الدائمة (التعارض 1).
- رتبة F-M09b (التعارض 2).
- معرّف الحزمة الافتراضي: نطاق التاجر معكوسًا (المقترح)، أم نمط موحد يحمل اسم المنصة.
- الدول الافتراضية للتوفر: الخليج (المقترح) أم كل الدول مع إعداد حالة التاجر (DSA).
- صفحة سياسة الخصوصية: يستضيف المنصة قالبًا لكل تاجر بلغتين (المقترح، لأن التطبيق يجمع رموز الإشعارات والتحليلات)، أم يُكتفى بصفحة سياسة متجر زد.

### ما يُبنى الآن خلف واجهة مؤقتة
- `CiProvider` بتنفيذ وهمي (`FakeCiProvider`) يحاكي الحالات، فتُبنى الطوابير والقطار والواجهات قبل SPK-13.
- `AppStoreConnectClient` و`PlayPublisherClient` مع اختبارات على ردود مسجلة.
- `TenantConfigBuilder` ومخطط `tenant.json` بقيم وهمية لـ M06 وM07 وM11.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| BLD-01 | هيكل وحدة `Builds`: الجداول (القسم 4)، وواجهة `CiProvider` مع `FakeCiProvider`، والطوابير الثلاثة | Must | نعم | M12 (العزل والخزنة) |
| BLD-02 | عقد `tenant.json`: مخطط JSON، و`TenantConfigBuilder`، وواجهة الحزمة برمز لمرة واحدة، وواجهة الأحداث بـ HMAC | Must | نعم | BLD-01، وM12 |
| BLD-03 | أداة `tool/tenantize.dart`: المعرّفات، والاسم بلغتين، والصلاحيات، وملفات Firebase، والأيقونة والسبلاش، واللقطة الاحتياطية، وملف الثوابت | Must | ينتظر SPK-13 | BLD-02 |
| BLD-04 | هدف امتداد الإشعارات (NSE) في iOS، وقالب الصلاحيات، وApp Links في أندرويد | Must | ينتظر M06 (عقد الإشعار الغني) وSPK-10 | BLD-03 |
| BLD-05 | workflowا Codemagic وسكربتاتهما، و`CodemagicProvider` (الإرسال، والاستطلاع، والإلغاء)، وتنقية السجلات | Must | ينتظر SPK-13 وD-05 | BLD-02، وBLD-03 |
| BLD-06 | عميلا App Store Connect وGoogle Play: JWT، وإعادة المحاولة، والمعدّل، وتصنيف الأخطاء، واختبارات على ردود مسجلة | Must | نعم | BLD-01 |
| BLD-07 | توقيع iOS: تسجيل المعرّفات والقدرات، ومفتاح الشهادة لكل فريق، وتمريره إلى `fetch-signing-files` | Must | ينتظر SPK-14 | BLD-06، وM14 (ONB-08) |
| BLD-08 | توقيع أندرويد: توليد مفتاح الرفع وحفظه، وجلب بصمة شهادة Google لـ M07 | Must | نعم | BLD-01، وM12 |
| BLD-09 | الترقيم: `BuildNumberAllocator` بقفل الصف، وقواعد `PATCH`، والمزامنة مع أعلى رقم في المتجر | Must | نعم | BLD-06 |
| BLD-10 | الرفع: TestFlight مع مجموعة داخلية، وInternal testing، واستطلاع المعالجة، وحدث `BuildReady` | Must | ينتظر SPK-14 | BLD-05، وBLD-07، وBLD-08 |
| BLD-11 | مزامنة القائمة: التوطين في Apple، والقوائم والتفاصيل في Google، وملاحظات المراجعة، والتحقق من الأطوال | Must | ينتظر SPK-14 | BLD-06 |
| BLD-12 | الأصول: رفع اللقطات والرسوم إلى المتجرين، والتحقق من المقاس والشفافية والتكرار، وتوليد رسمة Google المميزة | Must | ينتظر SPK-14 | BLD-11 |
| BLD-13 | التقديم بعد موافقة التاجر: لقطة الموافقة، وتسلسل `reviewSubmissions`، و`commit` في Google بـ `ERROR_IF_IN_REVIEW` | Must | ينتظر SPK-14 | BLD-10، وBLD-11، وBLD-12 |
| BLD-14 | متابعة المراجعة: webhook من Apple مع التحقق، والاستطلاع الاحتياطي، والاستنتاج في Google، وتسجيل الحالة يدويًا | Must | ينتظر BLD-13 | BLD-13 |
| BLD-15 | الطرح المرحلي: تفعيله في Apple، و`userFraction` في Google، وإيقاف واستئناف يدويان | Must | ينتظر BLD-13 | BLD-13 |
| BLD-16 | قطار الأسطول: الكناري، والموجات، والتزامن، والأولوية، وإعادة المحاولة، وقاطع الدائرة، والتذكيرات | Must | نعم (خلف `FakeCiProvider`) | BLD-01، وBLD-09 |
| BLD-17 | واجهات الإدارة للبناء والقطار وإعادة المحاولة والإلغاء، ومقتطف السجل | Must | نعم | BLD-01، وBLD-16 |
| BLD-18 | دعم السجل الأول: تسجيل المعرّفات، وبناء `first_upload`، وواجهة الربط، وقائمة التحقق، وإنشاء webhook ومجموعة TestFlight بعد الربط | Must | ينتظر SPK-14 | BLD-07، وBLD-08 |
| BLD-19 | مولّد اللقطات: قالب HTML بإطار جهاز عام وتعليق عربي وإنجليزي، ثم التقاط بـ Browsershot بالمقاسات الثلاثة | Should | ينتظر SPK-15 وM15 | BLD-12 |
| BLD-20 | إيقاف الطرح آليًا من مؤشر الانهيار | Should | ينتظر M08 | BLD-15 |
| BLD-21 | لوحة التكلفة والمدة وتنبيه الميزانية | Should | نعم | BLD-17 |
| BLD-22 | محوّل `GithubActionsProvider` | Could | ينتظر D-05 | BLD-05 |
| BLD-23 | رفع IPA من الخادم عبر Build Uploads API | Could | ينتظر SPK-14 | BLD-10 |

**مولّد اللقطات (BLD-19، Should)، للتوضيح فقط**: صفحة Next.js داخلية (`/render/store-shot`) برمز موقّع، تعرض معاينة Flutter Web للمشهد (الرئيسية، والتصنيفات، والقائمة، وصفحة المنتج، والسلة) داخل إطار جهاز مرسوم بـ SVG خاص بنا، لا إطارات Apple. فوق الإطار عنوان بلغة اللقطة وبخط الهوية، والخلفية بلون الهوية. ثم تلتقطها Browsershot بالمقاس الدقيق: 1320×2868، و1206×2622، و1080×1920. ثم تُزال قناة الشفافية. والنص الافتراضي من قوالب لكل قطاع، ويعدّله التاجر.

### معايير القبول

**BLD-02: عقد `tenant.json` وحزمة الأسرار**
- Given تاجر مكتمل الإعداد، When يُنشأ بناء iOS، Then يُنتج `tenant.json` يجتاز المخطط، ولا يحوي أي قيمة من مفاتيح الخزنة (اختبار آلي يبحث عن كل سر في الملف).
- Given رمز بناء صالح، When يُطلب `GET /bundle` مرتين، Then ينجح الطلب الأول، ويرد الثاني `410`، ويُسجَّل الطلبان في سجل التدقيق.
- Given رمز عمره أكثر من 90 دقيقة، When يُطلب، Then يرد `401` دون أسرار.

**BLD-03 وBLD-05: تطبيقان بهويتين من كود واحد**
- Given تاجران تجريبيان بمعرّفين وأيقونتين واسمين مختلفين، When يُبنيان من الوسم نفسه، Then يُرفع ملفان موقّعان كلٌّ إلى حساب صاحبه. ويظهر كل تطبيق باسمه العربي تحت الأيقونة على جهاز عربي، وباسمه الإنجليزي على جهاز إنجليزي، ودون أي أثر لهوية الآخر.
- Given بناء لتاجر، When يُشغَّل `tenantize` محليًا بـ `tenant.json` المحفوظ، Then ينتج ملفات مطابقة (بالبصمة) لما أُنتج في CI.
- Given إشعار بصورة، When يصل إلى تطبيق iOS مبني، Then تظهر الصورة (امتداد الإشعارات يعمل بمعرّف `{bundle}.NotificationService`).

**BLD-09: الترقيم**
- Given طلبا بناء متزامنان للتطبيق نفسه، When يحجزان رقمين، Then يحصلان على رقمين مختلفين متتاليين.
- Given رقم في المتجر أعلى من العداد (رفع يدوي سابق)، When يُرفض الرفع بسبب الرقم، Then يُضبط العداد على الأعلى + 1، ويُعاد الرفع مرة واحدة وينجح.
- Given نسخة 1.6.0 منشورة لتاجر، When يطلب بناءً بأيقونة جديدة داخل القطار نفسه، Then يُبنى بإصدار 1.6.1. وGiven نسخة 1.6.0 لم تُنشر بعد، Then يُبنى بإصدار 1.6.0 برقم بناء أعلى.

**BLD-13: التقديم بعد موافقة التاجر**
- Given بناء جاهز وقائمة معتمدة، When يحاول مستخدم بدور غير `owner` الموافقة، Then يرد `403`، ولا يُرسل شيء إلى المتجر.
- Given موافقة صاحب الحساب، When يكتمل التسلسل، Then تصبح حالة نسخة Apple `WAITING_FOR_REVIEW`. ويُحفظ `approval_snapshot` مطابقًا لما عُرض، ويظهر في سجل التدقيق.
- Given تقديم قيد المراجعة في Google، When يُرسل تقديم جديد، Then لا يُلغى التقديم القائم، وتُسجَّل الحالة «مؤجل» مع موعد إعادة المحاولة.

**BLD-14: متابعة المراجعة**
- Given webhook بتوقيع صحيح بحالة `IN_REVIEW`، When يصل، Then تتغير الحالة في الواجهة خلال دقيقة، ويصل إشعار للتاجر.
- Given webhook بتوقيع خاطئ، When يصل، Then يرد `401` ولا تتغير أي حالة.
- Given لم يصل أي webhook، When يمر 30 دقيقة، Then يلتقط الاستطلاع الحالة الجديدة.

**BLD-16: قطار الأسطول**
- Given قطار لعشرين تاجرًا وتزامن 2، When يبدأ بعد الكناري، Then لا يعمل أكثر من بناءين للأسطول في وقت واحد، ويبدأ طلب تاجر عاجل في الفتحة المحجوزة دون انتظار.
- Given موجة من 10 فشل فيها 3 بالبصمة نفسها، When يقع الفشل الثالث، Then يتوقف القطار (`paused`)، ولا تُرسل بناءات جديدة، ويصل تنبيه للمشرف.
- Given فشل بصنف `credentials` لتاجر واحد، When يقع، Then لا يُعاد البناء، ولا يُحسب في نسبة قاطع الدائرة، ويُرسل `StoreCredentialsRejected`.

## 10. المصادر

- Codemagic: [White-label getting started](https://docs.codemagic.io/yaml-quick-start/white-label-getting-started)، و[White-label overview](https://docs.codemagic.io/knowledge-white-label/white-label-apps-overview/)، و[Builds API](https://docs.codemagic.io/rest-api/builds/)، و[Signing iOS apps](https://docs.codemagic.io/yaml-code-signing/signing-ios/)، و[Pricing](https://docs.codemagic.io/billing/pricing/)، و[Package not found](https://help.codemagic.io/articles/3880714096-why-did-publishing-to-google-play-fail-with-package-not-found-when-using-codemagic)، و[Criton case study](https://blog.codemagic.io/criton-case-study/)
- [codemagic-cli-tools على PyPI](https://pypi.org/project/codemagic-cli-tools/)
- GitHub Actions: [Runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing)، و[Limits](https://docs.github.com/en/actions/reference/limits)
- fastlane: [match](https://docs.fastlane.tools/actions/match/)، و[deliver](https://docs.fastlane.tools/actions/deliver/)، و[supply](https://docs.fastlane.tools/actions/supply/)
- App Store Connect API: [API keys](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/)، و[Creating API keys](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api)، و[Generating tokens](https://developer.apple.com/documentation/appstoreconnectapi/generating-tokens-for-api-requests)، و[Webhook events](https://developer.apple.com/documentation/appstoreconnectapi/webhook-events)، و[Configuring webhooks](https://developer.apple.com/documentation/appstoreconnectapi/configuring-webhook-notifications)، و[Manage webhooks](https://developer.apple.com/help/app-store-connect/manage-your-team/manage-webhooks)، و[Create a Review Submission](https://developer.apple.com/documentation/appstoreconnectapi/post-v1-reviewsubmissions)
- Apple: [Roles](https://developer.apple.com/help/account/access/roles/)، و[Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)، و[App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information)، و[Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)، و[Phased release](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases)، و[Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/)، و[App Review](https://developer.apple.com/distribute/app-review/)، و[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Google Play: [Getting started](https://developers.google.com/android-publisher/getting_started)، و[REST reference](https://developers.google.com/android-publisher/api-ref/rest)، و[edits.commit](https://developers.google.com/android-publisher/api-ref/rest/v3/edits/commit)، و[edits.tracks](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.tracks)، و[edits.testers](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.testers)، و[dataSafety](https://developers.google.com/android-publisher/api-ref/rest/v3/applications/dataSafety)، و[Graphic assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)، و[Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)، و[Target API level](https://developer.android.com/google/play/requirements/target-sdk)، و[White label best practices](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en)
- [Runway: حدود حالة المراجعة في Google Play API](https://docs.runway.team/using-runway/release-steps/app-store-review)
- [Firebase: طلب API لرفع مفتاح APNs](https://github.com/firebase/firebase-admin-node/issues/2204)
- حزم Flutter: [flutter_launcher_icons](https://pub.dev/packages/flutter_launcher_icons)، و[flutter_native_splash](https://pub.dev/packages/flutter_native_splash)، و[Flutter flavors](https://docs.flutter.dev/deployment/flavors)
- ملاحظات البحث: `research_notes/مزايا وتخصيص تطبيقات متاجر زد/flutter_configurable_architecture.md` (القسم 4)، و`research_notes/جدوى منصة تطبيقات متاجر زد/app_store_policies.md` (القسمان 5 و6)
