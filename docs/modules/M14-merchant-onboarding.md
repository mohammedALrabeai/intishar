# M14: إعداد التاجر

| البند | القيمة |
|---|---|
| الحالة | 🟡 مسودة |
| الطبقات | Laravel (وحدة `Onboarding`)، وNext.js (الواجهات تبنيها M15)، وخدمات خارجية: App Store Connect API، وAPNs، وGoogle Play Developer API، وGoogle Cloud IAM API |
| المتطلبات | F-M01, F-M10 (Must)، وF-M08b (Should) |
| القرارات | [ADR-0007](../adr/0007-merchant-owned-store-accounts.md)، و[ADR-0008](../adr/0008-platform-managed-push.md)، و[ADR-0009](../adr/0009-import-then-own-home.md)، و[ADR-0010](../adr/0010-nextjs-web-frontends.md) |
| تعتمد على | M10 (التثبيت وOAuth وبيانات المتجر)، وM11 وM02 (الاستيراد والهويات الجاهزة)، وM12 (حسابات اللوحة والأدوار والخزنة والتدقيق والبريد)، وM13 (المعرّفات والسجل والبناء والتقديم)، وM06 (استلام مفتاح APNs)، وM15 (الواجهات) |
| بادئة القصص | ONB |

## 1. الغرض والنطاق

تقود هذه الوحدة التاجر من تثبيت التطبيق في سوق زد حتى صدور تطبيقه في المتجرين. وتجمع منه ما لا تستطيع المنصة إنشاءه نيابة عنه: حساباته في Apple وGoogle، ودعوة المنصة إليهما، ومفاتيح الـ API. ثم تتحقق من كل مفتاح باستدعاء حقيقي قبل تسليمه إلى خزنة M12.

**مبدأ**: لا تُطلب كلمة مرور Apple ID أو Google أبدًا. اتفاقية Apple (DPLA 2.1) تمنع طلبها ([Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/))، والمنافس المحلي يطلب كلمة مرور OneSignal ونريد أن نتميز عنه (ADR-0008).

### داخل الإصدار الأول (Must)
- **التدفق الكامل** بإحدى عشرة مرحلة (القسم 3.1)، وآلة حالات على الخادم.
- **معالج حسابات المطوّر بالعربية** (F-M10): نوع المنشأة، والبريد والموقع، وD-U-N-S، وحساب Apple للمنظمات، والاتفاقيات، ودعوة المنصة، ومفتاح فريق App Store Connect، ومفتاح APNs، وحساب Google Play للمنظمات، ودعوة المنصة فيه، ووصول Google Play API.
- **استلام المفاتيح والتحقق منها** باستدعاءات اختبار، ثم تسليمها إلى خزنة M12.
- **متابعة الحالة**: تقدير زمني لكل خطوة، وتذكيرات، وتصعيد إلى الدعم، ولوحة متابعة للمشرف.
- **متطلبات واجهة الإعداد** المسلّمة إلى M15 (القسم 5.6).

### لاحقًا (Should وCould)
- **Should**: المعاينة على الجهاز بـ QR (F-M08b)، وتذكيرات WhatsApp، وتدوير المفاتيح ذاتيًا، وأحداث قمع الإعداد في M08، ووصول Google بلا مفاتيح دائمة (انتحال حساب الخدمة).
- **Could**: كشف قبول دعوات المنصة آليًا من صندوق البريد، وحجز مكالمة إعداد، ومسار الحساب الشخصي في Google (اختبار 12 مختبرًا لمدة 14 يومًا).

### ليس من مسؤوليتها
- OAuth وحفظ رموز زد: **M10**.
- منطق الاستيراد وتوليد الرئيسية: **M11** (ADR-0009). والهويات الجاهزة: **M02**.
- تسجيل المعرّفات، وإنشاء السجل، والبناء، والتقديم: **M13**.
- تشفير الأسرار وتخزينها: **M12**.
- مكونات الواجهة ونظام التصميم: **M15**.

## 2. المكونات حسب الطبقة

### 2.1 Laravel: وحدة `Onboarding`

| الحزمة | الإصدار | الاستخدام |
|---|---|---|
| `lcobucci/jwt` | 5.6.x | JWT بـ ES256 لاختبار مفتاح App Store Connect ومفتاح APNs |
| Laravel HTTP client (Guzzle وcurl بـ HTTP/2) | — | استدعاء APNs، الذي يشترط HTTP/2 |
| `google/apiclient` و`google/apiclient-services` | 2.20.x و0.466.x | IAM API لإنشاء حسابات الخدمة، وAndroidPublisher للتحقق |

| الصنف | المسؤولية |
|---|---|
| `Onboarding/StateMachine` | مراحل الإعداد وانتقالاتها (القسم 3.1)، والتحقق من شروط كل انتقال |
| `Onboarding/Steps/StepRegistry` | تعريف خطوات المعالج من `config/onboarding.php`: المفتاح، والمالك، والاعتماديات، والمنصة، والتقديرات الزمنية، وقواعد التذكير |
| `Onboarding/Credentials/CredentialIntake` | يستلم الملف في الذاكرة فقط، ويحدد نوعه، ويطلق التحقق، ثم يسلّمه إلى `SecretVault` في M12 |
| `Onboarding/Credentials/AscKeyValidator` و`ApnsKeyValidator` و`PlayAccessValidator` | استدعاءات الاختبار (القسم 3.5) |
| `Onboarding/Credentials/ManagedServiceAccountProvisioner` | ينشئ حساب خدمة لكل تاجر في مشروع Google Cloud تملكه المنصة |
| `Onboarding/Tracking/ReminderScheduler` | مهمة مجدولة كل ساعة: التذكيرات والتأخر والتصعيد |
| `Onboarding/Tracking/EscalationService` | فتح طلب دعم بسياق الخطوة |
| `Onboarding/Http/*` | واجهات التاجر والإدارة (القسم 5) |

### 2.2 محتوى المعالج
- نصوص المعالج العربية ملفات MDX في تطبيق Next.js: `content/onboarding/ar/{step_key}.mdx`، مع صور الشرح في `public/onboarding/`.
- مفاتيح الخطوات تطابق `StepRegistry` على الخادم، واختبار آلي يتحقق من التطابق.
- القسم 3.4 هو المصدر الأول لهذه النصوص. وأي تعديل عليها يمر بمراجعة المشرف كأي تغيير في المستودع (ADR-0001).
- لقطات شاشات Apple وGoogle تُلتقط بواجهتهما الإنجليزية مع أسهم وتعليقات عربية، لأن أغلب التجار يرونهما بالإنجليزية. وتُراجع كل ثلاثة أشهر، لأن واجهات المتجرين تتغير.

### 2.3 Next.js
الشاشات في M15، وتتبع متطلبات القسم 5.6.

## 3. التدفقات

### 3.1 التدفق الكامل

| # | المرحلة (`stage`) | من يعمل | آلي؟ | شرط الخروج | الزمن المستهدف |
|---|---|---|---|---|---|
| 1 | `installed`: التثبيت من سوق زد | التاجر، ثم M10 | نعم | OAuth ناجح، ونُشئ المستأجر (M12) | دقيقة |
| 2 | `account_created`: حساب انتشار | التاجر | جزئيًا | حساب صاحب المتجر مفعّل، وقُبلت اتفاقية الخدمة | دقيقتان |
| 3 | `importing`: استيراد الهوية والرئيسية | M10 وM11 | نعم | الشعار والألوان وWhatsApp والقوائم محفوظة، ومسودة رئيسية مستوردة (ADR-0009) | ≤ دقيقتين |
| 4 | `preset_selected`: اختيار هوية جاهزة | التاجر | لا | هوية مختارة (M02) | دقيقتان |
| 5 | `preview_ready`: المعاينة | M15 | نعم | المعاينة تعمل في اللوحة. وQR للجهاز في Should | **≤ 15 دقيقة من الخطوة 1** (مؤشر PRD) |
| 6 | `accounts_in_progress`: معالج الحسابات | التاجر | لا | كل خطوات المعالج للمنصات المختارة `done` | من أسبوعين إلى خمسة (ADR-0007) |
| 7 | `app_records`: سجل التطبيق | المشرف، ثم M13 | جزئيًا | `store_apps.status = record_linked` لكل منصة | يوم عمل |
| 8 | `first_build`: أول بناء | M13 | نعم | `BuildReady` لكل منصة | ساعة |
| 9 | `testing`: يختبر التاجر | التاجر | لا | التاجر يؤكد «جرّبته وهو جاهز» | من يوم إلى ثلاثة |
| 10 | `submitted`: التقديم | التاجر، ثم M13 | جزئيًا | قائمة المتجر معتمدة، وموافقة صاحب الحساب، والتقديم مرسل | 20 دقيقة |
| 11 | `live`: الإطلاق | M13 | نعم | `AppWentLive` لمنصة واحدة على الأقل | Apple: 50% من المراجعات خلال 24 ساعة و90% خلال 48 ساعة ([Apple](https://developer.apple.com/distribute/app-review/)). Google: عادة خلال 7 أيام ([Google](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en)) |

**التوازي**: الخطوة 6 تُعرض مباشرة بعد المعاينة، بشارة «ابدأ الآن: هذه الخطوة تحتاج أيامًا من الانتظار». ويمكن فتحها قبل المعاينة من القائمة الجانبية. والمنصتان مستقلتان بعد الخطوة 6، فقد يُطلق iOS قبل أندرويد أو العكس. وتبقى المرحلة الكلية عند أبطأ منصة، مع حالة لكل منصة.

**مسار الخطأ العام**: أي خطوة يمكن أن تنتقل إلى `needs_attention`، مع سبب ورسالة عربية وإجراء مقترح. وكل خطوة لها زر «أحتاج مساعدة» يفتح تصعيدًا (القسم 3.6).

### 3.2 تفاصيل المراحل 1 إلى 5

1. **التثبيت**: M10 تكمل OAuth وتطلق `StoreInstalled`، فتنشئ M14 صف `onboardings` بمرحلة `installed`، وتنشئ خطوات المعالج بحالة `locked` أو `not_started`.
2. **حساب انتشار**:
   1. يُنشأ مستخدم صاحب المتجر (دور `owner` في M12) من بيانات التاجر في زد (الاسم والبريد والجوال)، ويُرسل له رابط دخول.
   2. يقبل اتفاقية الخدمة. وتشمل بندًا يلزمه بشروط لا تقل حماية لـ Apple عن الاتفاقية، لأن DPLA 2.9 تشترط اتفاقًا مكتوبًا مع مزود الخدمة ([Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)). وتُحفظ نسخة الاتفاقية ووقت القبول.
3. **الاستيراد**: يُطلق مباشرة بعد التثبيت دون انتظار الخطوة 2، فيوفر دقيقتين. وتعرض اللوحة تقدمًا بثلاث مراحل (الهوية، ثم القوائم، ثم الرئيسية). وإن فشل استيراد الرئيسية (SPK-09)، تُستخدم رئيسية القالب الافتراضي للقطاع، وتظهر رسالة «استوردنا هويتك، والرئيسية من قالب جاهز يمكنك تعديله».
4. **الهوية الجاهزة**: تُقترح ثلاث هويات أولًا حسب قطاع المتجر في زد، ثم «عرض الكل». وتُطبَّق فورًا على المعاينة.
5. **المعاينة**: معاينة Flutter Web داخل اللوحة (SPK-15). وفي Should: QR يفتح المعاينة على الجهاز برمز موقّع عمره 30 دقيقة (F-M08b).

### 3.3 تفرع نوع المنشأة (الخطوة W0)

| نوع المنشأة | Apple | Google | الأثر |
|---|---|---|---|
| **شركة** (ذات مسؤولية محدودة أو غيرها) لها سجل تجاري | حساب منظمة بـ D-U-N-S | حساب منظمة بـ D-U-N-S | المسار الأساسي. اسم الشركة القانوني يظهر بائعًا |
| **مؤسسة فردية** لها سجل تجاري | Apple تطلب من المنشآت الفردية التسجيل كأفراد، فيظهر اسم المالك الشخصي بائعًا ([Apple](https://developer.apple.com/help/account/membership/program-enrollment/)). ويُجرَّب البحث في أداة D-U-N-S أولًا: إن ظهرت رسالة «Your organization is not listed as a legal entity» فمسار الأفراد ([Apple](https://developer.apple.com/support/D-U-N-S/)) | حساب منظمة بـ D-U-N-S إن أمكن (يُتحقق مع أول التجار التجريبيين) | في حساب الفرد، المستخدمون المضافون لا يدخلون فريق المطوّر ([Apple](https://developer.apple.com/help/account/access/roles/))، فلا يصل مستخدم المنصة إلى Certificates, Identifiers & Profiles. يعمل البناء عبر مفتاح API، وينشئ التاجر مفتاح APNs بنفسه |
| **بلا سجل تجاري** (عمل حر أو معروف فقط) | حساب فرد | حساب شخصي، مع شرط اختبار مغلق بـ 12 مختبرًا لمدة 14 يومًا للحسابات الشخصية الجديدة ([Google](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)) | **غير مدعوم في الإصدار الأول**. تظهر رسالة توضح السبب، ويُسجَّل الاهتمام للمرحلة الثانية |

### 3.4 خطوات المعالج ونصوصها العربية

كل خطوة في الواجهة لها: العنوان، و«لماذا نحتاجها»، و«ما تحتاجه»، والخطوات المرقمة، والمدة، والأخطاء الشائعة، وزر الإتمام. النص المقتبس أدناه هو نص الواجهة.

**ترتيب الاعتماديات**: W0، ثم W1، ثم W2. بعدها مساران متوازيان: Apple (W3، ثم W4، ثم W5 وW6 وW7)، وGoogle (W8، ثم W9، ثم W10).

#### W0: نوع منشأتك
> **ما نوع سجلك التجاري؟**
> نسألك لأن Apple وGoogle تتعاملان مع الشركات والمؤسسات الفردية بطريقة مختلفة، وهذا يحدد الاسم الذي يظهر «بائعًا» تحت تطبيقك في المتجر.
> - شركة (ذات مسؤولية محدودة، أو مساهمة، أو غيرها)
> - مؤسسة فردية
> - لا أملك سجلًا تجاريًا
>
> اكتب أيضًا رقم السجل التجاري، واسم المنشأة **بالإنجليزية كما في النسخة الإنجليزية من السجل** الصادرة من وزارة التجارة.

- **الإتمام**: يُحفظ `entity_type` و`cr_number` و`legal_name_en`. وللمؤسسة الفردية تظهر بطاقة تنبيه دائمة في خطوة Apple.

#### W1: بريد على نطاقك وموقع يعمل
> **جهّز بريدًا على نطاق متجرك**
> **لماذا؟** تشترط Apple أن يكون بريد العمل على نطاق المنشأة، وأن يكون للمنشأة موقع عام يعمل ومرتبط بها. ولا تقبل روابط حسابات التواصل الاجتماعي ولا المواقع شبه الفارغة.
> **ما تحتاجه**:
> 1. موقع متجرك على نطاقك الخاص (مثل `oudhouse.sa`). متجر زد على نطاقك الخاص يكفي غالبًا.
> 2. بريد على النطاق نفسه، مثل `apps@oudhouse.sa`.
>
> **نصيحتنا**: أنشئ بريدًا مخصصًا للتطبيقات (مثل `apps@`) لا بريدك الشخصي. ستُسجَّل به حسابات Apple وGoogle، وتصل عليه رسائل المراجعة، وتغيير مالك الحساب لاحقًا صعب.
> **المدة**: 10 دقائق إن كان البريد جاهزًا، ويوم أو يومان إن احتجت إعداده.

- المصادر: [متطلبات Apple](https://developer.apple.com/help/account/membership/program-enrollment/)، ونصيحة البريد المؤسسي من [Tapcart](https://help.tapcart.com/en/articles/14660540-step-4-register-your-developer-accounts).
- **فحص آلي**: يُطلب الموقع (`HEAD` ثم `GET`) ويُتحقق أن الرد 200 وأن الصفحة ليست صفحة «نطاق للبيع». وإن كان المتجر على نطاق فرعي من زد، تظهر رسالة: «قد لا تقبل Apple نطاقًا فرعيًا. يُفضَّل ربط نطاقك الخاص بمتجرك في زد قبل التسجيل».

#### W2: رقم D-U-N-S
> **احصل على رقم D-U-N-S لمنشأتك (مجاني)**
> **لماذا؟** D-U-N-S رقم دولي من تسعة أرقام تصدره Dun & Bradstreet. تتحقق به Apple وGoogle من أن منشأتك كيان حقيقي، ولا يمكن فتح حساب منظمة بدونه.
> **ما تحتاجه**:
> - السجل التجاري، ونسخته الإنجليزية الرسمية من وزارة التجارة.
> - العنوان الوطني.
> - بيانات التواصل (البريد من الخطوة السابقة).
>
> **الخطوات**:
> 1. افتح [أداة البحث عن D-U-N-S من Apple](https://developer.apple.com/enroll/duns-lookup/) وسجّل الدخول بحساب Apple.
> 2. ابحث باسم منشأتك **بالإنجليزية تمامًا كما في السجل** وعنوانها. إن ظهر لك رقم، فانسخه، وانتقل مباشرة إلى الخطوة التالية.
> 3. إن لم تظهر منشأتك، فأرسل طلب رقم جديد من الأداة نفسها. ستتواصل معك D&B بالبريد، وقد تطلب السجل ونسخته الإنجليزية وإثبات العنوان.
> 4. إن طال الانتظار أو احتجت تعديل بياناتك، تواصل مع دعم D&B الخاص بمطوري Apple: `support.dnb.com/?CUST=APPLEDEV`.
> 5. عند وصول الرقم، اكتبه هنا.
>
> **المدة**: 20 دقيقة من وقتك. ثم انتظار: Apple تقول حتى 5 أيام عمل لإصدار الرقم، ثم يومي عمل لتصل بياناته إليها. وتجارب التجار في السعودية بين 7 و14 يومًا، وGoogle تقول إنه قد يستغرق حتى 30 يومًا.
> **أخطاء شائعة**:
> - كتابة الاسم التجاري أو اسم العلامة بدل الاسم القانوني.
> - اختلاف تهجئة الاسم الإنجليزي عن السجل.
> - الدفع لجهة تعرض «تسريع» الرقم، فالرقم مجاني والتسريع لا يقصر المدة.

- المصادر: [Apple: D-U-N-S](https://developer.apple.com/support/D-U-N-S/)، و[دليل سلة لرقم D-U-N-S](https://help.salla.sa/en/article/global-company-identifier-d-u-n-s-number/ctwmupb60kgolxag4v3i1cjo)، و[Google: متطلبات حساب المنظمة](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en).
- **الإتمام**: رقم من تسعة أرقام (فحص الصيغة فقط، إذ لا API للتحقق). وتصبح الخطوة `waiting_external` إن اختار التاجر «طلبت رقمًا وأنتظر». ويُتحقق من الرقم فعليًا حين ينجح تسجيل Apple أو Google.

#### W3: حساب Apple Developer للمنظمات
> **سجّل منشأتك في برنامج Apple للمطورين**
> **لماذا؟** تشترط Apple أن يُنشر تطبيق المتجر من حساب صاحب المتجر نفسه (الإرشادة 4.2.6). فيبقى التطبيق ملكك دائمًا، ويظهر اسم منشأتك بائعًا له.
> **ما تحتاجه**:
> - رقم D-U-N-S.
> - حساب Apple بالبريد المؤسسي مع التحقق بخطوتين.
> - أن تكون مالك المنشأة أو مفوَّضًا بالتوقيع عنها.
> - بطاقة دفع للرسوم السنوية: 99 دولارًا أو ما يعادلها بالعملة المحلية.
>
> **الخطوات**:
> 1. افتح [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/) أو تطبيق Apple Developer، وسجّل الدخول بحساب Apple المؤسسي.
> 2. اختر التسجيل كـ **Company / Organization**.
> 3. أدخل الاسم القانوني **بالإنجليزية كما في D-U-N-S**، ورقم D-U-N-S، والموقع، ورقم الهاتف.
> 4. انتظر بريد Apple. قد تتصل بك Apple للتحقق من صفتك، وقد تطلب وثائق موثقة، وإن لم تكن المالك فستطلب مرجعًا يؤكد تفويضك.
> 5. بعد قبول البيانات، ادفع الرسوم من الرابط الذي يصلك.
> 6. عندما يصلك بريد «Welcome to the Apple Developer Program»، اضغط «تم».
>
> **المدة**: 30 دقيقة من وقتك. ثم انتظار التحقق من بضعة أيام إلى أسبوعين، وقد يطول في حالات نادرة.
> **أخطاء شائعة**: اختلاف الاسم عن D-U-N-S، وموقع لا يعمل، وبريد عام مثل Gmail.

**بطاقة المؤسسة الفردية** (تظهر عند `entity_type = sole_establishment`):
> **تنبيه للمؤسسات الفردية**: تعامل Apple المؤسسة الفردية غالبًا كـ «منشأة فردية» لا كيان قانوني مستقل. فإن رفضت تسجيلك كمنظمة، أو ظهرت لك رسالة «Your organization is not listed as a legal entity»، فسجّل **كفرد** باسمك القانوني.
> الأثر:
> - يظهر **اسمك الشخصي** بائعًا تحت التطبيق بدل اسم المؤسسة.
> - ستنشئ أنت مفتاح الإشعارات بنفسك، لأن مستخدم المنصة لا يصل إلى إعدادات الشهادات في حسابات الأفراد.
>
> كل شيء آخر يعمل كما هو. وإن أردت ظهور اسم منشأة، فالحل تحويل المؤسسة إلى شركة ثم طلب تحويل الحساب من Apple.

- المصادر: [Apple: التسجيل](https://developer.apple.com/help/account/membership/program-enrollment/)، و[Apple: الأدوار](https://developer.apple.com/help/account/access/roles/).
- **الإتمام**: يُدخل التاجر Team ID (عشرة أحرف من صفحة Membership details)، ويختار «منظمة» أو «فرد». ويُتحقق من Team ID لاحقًا بمفتاح APNs.

#### W4: قبول اتفاقيات Apple
> **اقبل الاتفاقيات في App Store Connect**
> **لماذا؟** صاحب الحساب وحده يقبل اتفاقيات Apple، وأي اتفاقية جديدة غير مقبولة توقف رفع التطبيق وتحديثه.
> **الخطوات**:
> 1. افتح [App Store Connect](https://appstoreconnect.apple.com)، ثم Business.
> 2. اقبل أي اتفاقية معلقة. وللتطبيقات المجانية تكفي اتفاقية Free Apps، فلا حاجة إلى بيانات بنكية أو ضريبية.
>
> **المدة**: 5 دقائق.
> **ستعود هذه الخطوة** كلما نشرت Apple اتفاقية جديدة، وسننبهك حينها.

- **الإتمام**: يُتحقق منها آليًا عند التحقق من المفتاح (W6). خطأ 403 الخاص بالاتفاقيات يعيد فتح الخطوة.

#### W5: دعوة فريق انتشار إلى App Store Connect
> **أضف فريق انتشار مستخدمًا في حسابك**
> **لماذا؟** نحتاج مستخدمًا في حسابك لإنشاء سجل التطبيق لأول مرة، ولمتابعة المراجعة. لن نطلب كلمة مرورك أبدًا، وتستطيع إزالتنا في أي وقت.
> **الخطوات**:
> 1. في App Store Connect افتح Users and Access، ثم People، ثم «+».
> 2. الاسم: Intishar Ops. والبريد: `apple-ops@intishar.app` (زر نسخ).
> 3. الدور (Role): **App Manager**.
> 4. من Additional Resources فعّل:
>    - Access to Certificates, Identifiers & Profiles.
>    - صلاحية إنشاء التطبيقات (Create Apps).
> 5. التطبيقات: All Apps. ثم Invite.
> 6. اضغط «أرسلت الدعوة». سنقبلها خلال يوم عمل ونؤكد لك.
>
> **المدة**: 5 دقائق.
> **لماذا App Manager لا Admin؟** نطلب أقل صلاحية تكفي. App Manager لا يدير مستخدميك ولا اتفاقياتك ولا بياناتك المالية.

- **ملاحظة**: الدور الأدنى معلّق على SPK-14. وإن ثبت أن App Manager لا يكفي، يتغير النص إلى Admin بقرار من المشرف. وأسماء خيارات Additional Resources تُطابق مع واجهة Apple الحالية عند تصوير الشرح.
- **الإتمام**: يؤشر المشرف «مقبولة» من لوحة الإدارة بعد قبول الدعوة. وفي حسابات الأفراد يُخفى البند 4 الأول.

#### W6: مفتاح App Store Connect API (مفتاح فريق)
> **أنشئ مفتاح API للفريق وارفعه هنا**
> **لماذا؟** بهذا المفتاح نبني تطبيقك ونوقّعه ونرفعه ونحدّث صفحته في المتجر، دون أي كلمة مرور.
> **لماذا مفتاح فريق (Team Key) لا مفتاح فردي؟** المفتاح الفردي مرتبط بمستخدم واحد، ولا يستطيع إدارة الشهادات والمعرّفات التي يحتاجها توقيع التطبيق. لذلك نحتاج مفتاح فريق بدور App Manager.
> **الخطوات**:
> 1. في App Store Connect افتح Users and Access، ثم Integrations، ثم App Store Connect API.
> 2. إن كانت أول مرة، فاضغط Request Access. صاحب الحساب وحده يستطيع ذلك، وقد تراجع Apple الطلب.
> 3. اختر Team Keys، ثم Generate API Key أو «+».
> 4. الاسم: Intishar. والوصول (Access): **App Manager**. ثم Generate.
> 5. اضغط Download API Key. **الملف (`AuthKey_XXXXXXXXXX.p8`) يُنزَّل مرة واحدة فقط**، فلا تغلق الصفحة قبل رفعه هنا.
> 6. انسخ Key ID من الجدول، وIssuer ID من أعلى الصفحة.
> 7. ارفع الملف، والصق القيمتين، ثم اضغط «تحقق».
>
> **المدة**: 10 دقائق.
> **تنبيه**: مفتاح الفريق يعمل على كل التطبيقات في حسابك. إن كان في حسابك تطبيقات أخرى، فاعلم أن المفتاح يصل إليها أيضًا، ونحن لا نستخدمه إلا لتطبيق متجرك.
> **أخطاء شائعة**:
> - رفع مفتاح الإشعارات (APNs) هنا، فكلاهما ملف `.p8`.
> - اختيار مفتاح فردي من صفحة الملف الشخصي.
> - ضياع الملف بعد تنزيله: ألغِ المفتاح وأنشئ جديدًا، فالإلغاء لا يمكن التراجع عنه، لكن المفتاح الجديد يعمل فورًا.

- المصادر: [Apple: مفاتيح API](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/)، و[Apple: أنواع المفاتيح](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api).
- **الإتمام**: التحقق الآلي (القسم 3.5.1). وعند النجاح يُطلق `CredentialsValidated(asc_team_key)`، فتسجّل M13 معرّفات الحزمة (BLD-07).

#### W7: مفتاح الإشعارات (APNs)
> **أنشئ مفتاح الإشعارات من حسابك**
> **لماذا؟** تصل إشعارات تطبيقك إلى أجهزة iPhone عبر خدمة Apple للإشعارات. وApple تشترط أن يكون المفتاح من فريقك أنت. لن تحتاج أي حساب في خدمة إشعارات خارجية.
> **من يستطيع؟** صاحب الحساب (Account Holder) أو Admin فقط.
> **الخطوات**:
> 1. افتح [Certificates, Identifiers & Profiles، ثم Keys](https://developer.apple.com/account/resources/keys/list)، ثم «+».
> 2. الاسم: Intishar Push.
> 3. فعّل Apple Push Notification service (APNs)، ثم Configure.
> 4. البيئة (Environment): **Production**. وإن ظهر خيار Sandbox & Production فاختره.
> 5. نوع المفتاح: **Team Scoped**. ثم Save، ثم Continue، ثم Register.
> 6. اضغط Download. الملف يُنزَّل مرة واحدة.
> 7. انسخ Key ID. وTeam ID تجده في Membership details.
> 8. ارفع الملف، والصق القيمتين، ثم اضغط «تحقق».
>
> **المدة**: 5 دقائق.
> **إن ظهر أنك بلغت الحد**: Apple تسمح بمفتاحين من نوع Team Scoped لكل بيئة. إن كان لديك مفتاح قائم وملفه محفوظ عندك، فارفعه بدل إنشاء جديد. ولا تلغِ مفتاحًا تستخدمه تطبيقات أخرى قبل التأكد، لأن إلغاءه يوقف إشعاراتها.

- المصادر: [Apple: إنشاء مفتاح](https://developer.apple.com/help/account/keys/create-a-private-key)، و[Apple: الاتصال بـ APNs بالرموز](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns).
- **الإتمام**: التحقق الآلي (القسم 3.5.2). وهو ينتظر تسجيل معرّف الحزمة في M13، فتظهر الحالة «استلمنا المفتاح، وسنتحقق منه خلال دقائق».

#### W8: حساب Google Play Console للمنظمات
> **افتح حساب مطوّر في Google Play باسم منشأتك**
> **لماذا؟** Google توصي بأن يكون لكل متجر حسابه الخاص. والحساب الشخصي الجديد يشترط اختبارًا مغلقًا مع 12 مختبرًا لمدة 14 يومًا قبل النشر، أما حساب المنظمة فلا.
> **ما تحتاجه**:
> - رقم D-U-N-S.
> - حساب Google بالبريد المؤسسي.
> - هاتف المنشأة، وموقعها.
> - الرسوم: 25 دولارًا مرة واحدة.
>
> **الخطوات**:
> 1. افتح [play.google.com/console/signup](https://play.google.com/console/signup) بحساب Google المؤسسي.
> 2. اختر نوع الحساب **Organization**.
> 3. اسم المطوّر الظاهر في المتجر: اسم متجرك بالعربية أو الإنجليزية، ويمكن تغييره لاحقًا.
> 4. أنشئ ملف الدفع (Payments profile) **باسم المنشأة وعنوانها كما في D-U-N-S تمامًا**.
> 5. أدخل D-U-N-S، وهاتف المنشأة، وموقعها.
> 6. أكّد بريد التواصل وهاتفه برمز تحقق، ثم بريد المطوّر وهاتفه الظاهرين في المتجر.
> 7. ادفع الرسوم.
> 8. انتظر التحقق من الهوية. قد تطلب Google وثائق، وقد يحتاج التحقق من وسيلة الدفع حتى 5 أيام.
> 9. عندما يفتح لك Play Console، اضغط «تم». واكتب أيضًا بريد حساب Google الذي تستخدمه على جوال أندرويد، لنضيفك مختبرًا لتطبيقك.
>
> **المدة**: 30 دقيقة من وقتك، ثم انتظار من يومين إلى أسبوع.

- المصادر: [Google: متطلبات حساب المنظمة](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en)، و[Google: اختبار الحسابات الشخصية](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)، و[Google: إرشادات التطبيقات البيضاء](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en).
- **ملاحظة**: تحقق مطوري أندرويد (Android developer verification) يتوسع عالميًا في 2027. والتطبيقات الموزعة عبر Play تُسجَّل فيه تلقائيًا ([Google](https://support.google.com/android-developer-console/answer/16561738)). لا خطوة إضافية الآن.

#### W9: دعوة فريق انتشار إلى Play Console
> **أضف فريق انتشار مستخدمًا في Play Console**
> **الخطوات**:
> 1. في Play Console افتح Users and permissions، ثم Invite new users.
> 2. البريد: `play-ops@intishar.app` (زر نسخ).
> 3. من Account permissions فعّل هذه الصلاحيات فقط:
>    - Create, edit, and delete draft apps
>    - Release to production, exclude devices, and use Play App Signing
>    - Release apps to testing tracks
>    - Manage testing tracks and edit tester lists
>    - Manage store presence
>    - Manage policy declarations
>    - View app information and download bulk reports (read-only)
> 4. اضغط Invite user، ثم «أرسلت الدعوة».
>
> **المدة**: 5 دقائق.
> **لماذا لا Admin؟** لا نحتاج بياناتك المالية ولا إدارة مستخدميك.

- المصدر: [Google: صلاحيات المستخدمين](https://support.google.com/googleplay/android-developer/answer/9844686?hl=en).
- **الإتمام**: يؤشر المشرف «مقبولة».

#### W10: وصول Google Play API
**المسار الموصى به (مُدار)**: تنشئ المنصة حساب خدمة خاصًا بالتاجر في مشروع Google Cloud تملكه، ويدعوه التاجر ببريده فقط. لا يتعامل التاجر مع أي ملف أو مشروع سحابي. وGoogle لم تعد تشترط ربط مشروع Cloud بحساب المطوّر، بل تكفي دعوة بريد حساب الخدمة ([Google](https://developers.google.com/android-publisher/getting_started)).

> **امنح وصول النشر لحساب الخدمة الخاص بمتجرك**
> **الخطوات**:
> 1. انسخ هذا البريد: `zid-123456@intishar-play-01.iam.gserviceaccount.com` (يُولَّد لمتجرك).
> 2. في Play Console افتح Users and permissions، ثم Invite new users، والصق البريد.
> 3. فعّل الصلاحيات نفسها في الخطوة السابقة، عدا Create, edit, and delete draft apps.
> 4. اضغط Invite user، ثم «تحقق».
>
> **المدة**: 5 دقائق.

**المسار البديل (ملف JSON)**: يُعرض فقط إن قرر المشرف ذلك أو طلبه التاجر.

> **أنشئ حساب خدمة في Google Cloud وارفع ملف المفتاح**
> 1. افتح [console.cloud.google.com](https://console.cloud.google.com) وأنشئ مشروعًا باسم `intishar-publishing`.
> 2. من APIs & Services، ثم Library، فعّل **Google Play Android Developer API**.
> 3. من IAM & Admin، ثم Service Accounts، ثم Create service account. الاسم: `intishar-publisher`. لا يحتاج أدوارًا في Cloud.
> 4. افتح الحساب، ثم Keys، ثم Add key، ثم Create new key، ثم JSON. سيُنزَّل الملف.
> 5. ارفع الملف هنا.
> 6. ادعُ بريد حساب الخدمة في Play Console بالصلاحيات الموضحة أعلاه.
>
> **إن ظهر أن إنشاء المفاتيح ممنوع** في مؤسستك على Google Cloud، فاستخدم المسار الموصى به.

- **الإتمام**: التحقق الآلي (القسم 3.5.3). ويكتمل نهائيًا بعد إنشاء التطبيق في Play Console (M13).

### 3.5 التحقق من المفاتيح وتسليمها

**قواعد عامة لكل مفتاح**:
- يُستلم الملف في الذاكرة. وحده الأقصى 10 KB لملف `.p8` و20 KB لملف JSON. ولا يُكتب على القرص، ولا في السجلات، ولا في رسائل الأخطاء.
- يُحسب `fingerprint_sha256` لكشف التكرار وتمييز المفاتيح، ثم يُسلَّم إلى `SecretVault::put` في M12 خلال الطلب نفسه.
- يُسجَّل في سجل التدقيق: من رفع، ومتى، ونتيجة التحقق.
- لا تعيد أي واجهة المفتاح بعد رفعه، بل بيانات وصفية فقط.
- ثلاث محاولات فاشلة متتالية للخطوة نفسها تفتح تصعيدًا آليًا.

#### 3.5.1 مفتاح فريق App Store Connect
1. **فحص الشكل**: الملف مفتاح EC P-256 بصيغة PEM، وKey ID عشرة أحرف `[A-Z0-9]`، وIssuer ID بصيغة UUID.
2. يُوقَّع JWT بـ ES256 مع `aud: appstoreconnect-v1` وعمر 5 دقائق ([Apple](https://developer.apple.com/documentation/appstoreconnectapi/generating-tokens-for-api-requests)).
3. `GET /v1/apps?limit=1`:
   - `200`: المصادقة سليمة.
   - `401`: «المفتاح أو Key ID أو Issuer ID غير صحيح». وإن كان ملف `.p8` نفسه قد اجتاز التحقق كمفتاح APNs سابقًا، تظهر رسالة: «يبدو أنك رفعت مفتاح الإشعارات مكان مفتاح API».
   - `403` لسبب الاتفاقيات: تُعاد فتح W4.
4. `GET /v1/bundleIds?limit=1`:
   - `200`: مفتاح فريق يصل إلى Provisioning. المفاتيح الفردية لا تصل إليها ([Apple](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api)).
   - `403`: «هذا مفتاح فردي أو بدور أقل من المطلوب. أنشئ مفتاح فريق بدور App Manager».
5. **كشف الفريق**: إن وُجدت معرّفات حزمة، يُقرأ `seedId` ويُقارن بـ Team ID المدخل في W3. فإن اختلف: «هذا المفتاح من فريق آخر».
6. صلاحية الكتابة تُختبر فعليًا عند أول كتابة في M13 (تسجيل المعرّف). وأي `403` هناك يعيد الخطوة إلى `needs_attention` عبر `StoreCredentialsRejected`.
7. النجاح: `status = valid`، ثم `CredentialsValidated(asc_team_key)`.

#### 3.5.2 مفتاح APNs
1. **فحص الشكل**: مفتاح EC P-256، وKey ID وTeam ID عشرة أحرف لكل منهما.
2. **ينتظر** حدث `IdentifiersRegistered` من M13، لأن الاختبار يحتاج `apns-topic` مسجلًا في الفريق. وحتى ذلك تكون الحالة `pending_dependency`.
3. يُرسل طلب إلى `https://api.push.apple.com/3/device/{token}` برمز جهاز وهمي من 64 خانة ست عشرية، وبالترويسات `apns-topic: {bundle_id}` و`apns-push-type: alert` و`authorization: bearer {JWT}`، حيث `iss` هو Team ID و`kid` هو Key ID. ثم يُفسَّر الرد:

| الرد | المعنى | الرسالة للتاجر |
|---|---|---|
| `400 BadDeviceToken` | المفتاح والفريق والموضوع صحيحة، والرمز وهمي كما هو متوقع | ✅ تم التحقق |
| `403 InvalidProviderToken` | المفتاح أو Key ID أو Team ID غير صحيح | «تأكد من Key ID وTeam ID، وأنك رفعت ملف مفتاح الإشعارات» |
| `403 BadEnvironmentKeyIdInToken` | المفتاح لبيئة Sandbox فقط | «أنشئ مفتاحًا لبيئة Production» |
| `400 TopicDisallowed` | المفتاح من نوع Topic Specific ولا يشمل تطبيقك | «اختر نوع Team Scoped» |

4. النجاح: `valid`، ثم `CredentialsValidated(apns_key)`. فتضيف M13 بند «ارفع المفتاح إلى Firebase» في قائمة تحقق المشرف، لأنه لا API له. وتستلم M06 المرجع.

#### 3.5.3 وصول Google Play
1. **المسار المُدار**: عند فتح W10:
   1. `ManagedServiceAccountProvisioner` يستدعي IAM API: `POST https://iam.googleapis.com/v1/projects/{project}/serviceAccounts` بالقيمتين `accountId: zid-{store_id}` و`displayName: Intishar – {slug}`.
   2. ثم `POST .../serviceAccounts/{email}/keys`، ويُحفظ المفتاح في الخزنة مباشرة.
   3. المشاريع تُقسَّم بحد 90 حساب خدمة لكل مشروع (`intishar-play-01`، و`-02` …)، لأن الحد الافتراضي 100 حساب لكل مشروع.
2. **المسار البديل**: فحص JSON: `type = service_account`، ووجود `client_email` و`private_key`. ثم طلب رمز OAuth بنطاق `androidpublisher`. ونجاحه يعني أن المفتاح صالح وغير معطل.
3. **قبل وجود التطبيق** في Play Console، لا يمكن التحقق من الصلاحيات. فتكون الحالة `pending_dependency` بنص «سنتحقق تلقائيًا بعد إنشاء التطبيق».
4. **بعد ربط السجل في M13**: `POST .../applications/{package}/edits` ثم حذف الـ edit:
   - `200`: `valid`.
   - `403` مع «The caller does not have permission»: الدعوة ناقصة أو الصلاحيات ناقصة.
   - `403` مع `SERVICE_DISABLED`: الـ API غير مفعّلة في المشروع (المسار البديل فقط)، وتظهر تعليمات تفعيلها.

### 3.6 المتابعة والتذكير والتصعيد

**حالات الخطوة**: `locked` (اعتمادياتها لم تكتمل)، و`not_started`، و`in_progress`، و`waiting_external` (ننتظر Apple أو Google أو D&B)، و`needs_attention` (خطأ يحتاج إجراء)، و`done`، و`skipped` (منصة غير مختارة).

**التقديرات الزمنية** (تُعرض للتاجر، وتُحسب منها `expected_done_at`):

| الخطوة | وقتك | الانتظار المعتاد | الانتظار الأقصى قبل التصعيد |
|---|---|---|---|
| W0 نوع المنشأة | دقيقتان | — | — |
| W1 البريد والموقع | 10 دقائق | يوم إن احتجت إعداد البريد | 3 أيام |
| W2 D-U-N-S | 20 دقيقة | 7 أيام عمل | 14 يوم عمل |
| W3 حساب Apple | 30 دقيقة | 3 أيام عمل | 10 أيام عمل |
| W4 الاتفاقيات | 5 دقائق | — | يومان |
| W5 دعوة Apple | 5 دقائق | يوم عمل (قبولنا) | يوما عمل |
| W6 مفتاح API | 10 دقائق | — | يومان |
| W7 مفتاح APNs | 5 دقائق | — | يومان |
| W8 حساب Google | 30 دقيقة | 3 أيام | 7 أيام |
| W9 دعوة Google | 5 دقائق | يوم عمل | يوما عمل |
| W10 وصول API | 5 دقائق (المُدار) أو 20 دقيقة (البديل) | — | يومان |
| السجل (المشرف) | — | يوم عمل | يوما عمل |
| أول بناء | — | ساعة | يوم |
| الاختبار | 30 دقيقة | يوم | 3 أيام |
| التقديم والمراجعة | 20 دقيقة | Apple يومان، وGoogle حتى 7 أيام | Apple 5 أيام، وGoogle 10 أيام |

**المجموع**: نحو 3 ساعات من وقت التاجر. والمدة الكلية من أسبوعين إلى خمسة إن لم يكن لديه D-U-N-S، ومن 4 أيام إلى 10 إن كان لديه رقم وحسابات جاهزة.

**قواعد التذكير** (`ReminderScheduler` كل ساعة، في نافذة 9 صباحًا إلى 9 مساءً بتوقيت الرياض):

| الحالة | التذكير |
|---|---|
| خطوة على التاجر بحالة `not_started` أو `in_progress` دون نشاط 48 ساعة | بريد وإشعار في اللوحة، ثم بعد 5 أيام، ثم بعد 10. والحد 3 تذكيرات للخطوة |
| خطوة `waiting_external` تجاوزت الانتظار المعتاد | رسالة «هل وصلك الرد؟» مع أزرار «وصل» و«ما زلت أنتظر» و«أحتاج مساعدة» |
| `needs_attention` | تذكير فوري، ثم بعد 24 ساعة |
| لا نشاط في الإعداد كله 30 يومًا | يتوقف التذكير، وتصبح الحالة `dormant`. وبعد 60 يومًا تصبح `abandoned`، ويمكن الاستئناف في أي وقت |
| خطوة على المنصة (قبول دعوة، سجل التطبيق) | تنبيه للمشرف في لوحة الإدارة عند تجاوز الزمن المعتاد |

**التصعيد** (`support_escalations`) يُفتح آليًا إن:
- تجاوزت خطوة «الانتظار الأقصى»،
- أو فشل التحقق 3 مرات متتالية،
- أو ضغط التاجر «أحتاج مساعدة»،
- أو رُفض التطبيق في المراجعة.

ويحمل التصعيد: الخطوة، وآخر رسالة خطأ، والمراحل المنجزة، ونوع المنشأة. ويُعيَّن للمشرف. والهدف: أول رد خلال يوم عمل.

### 3.7 الاختبار والتقديم والإطلاق (المراحل 8 إلى 11)

1. **أول بناء**: حين تصبح `store_apps.status = record_linked` لمنصة، تطلب M14 من M13 بناءً فوريًا بأولوية طلبات التاجر.
2. **الاختبار**: عند `BuildReady`:
   - **iOS**: يُضاف بريد حساب Apple للتاجر إلى مجموعة TestFlight الداخلية في M13. وتعرض الشاشة: «نزّل تطبيق TestFlight من App Store، وافتح الدعوة التي وصلت إلى بريدك».
   - **أندرويد**: يُعرض رابط الانضمام إلى الاختبار الداخلي و QR له، بشرط أن يكون بريد Google الذي أدخله التاجر في W8 ضمن قائمة المختبرين (البند 12 في قائمة M13).
   - زر «أبلغ عن مشكلة» يفتح نموذجًا بلقطة شاشة، ثم تصعيدًا. وزر «جربته وهو جاهز» ينقل المرحلة إلى `ready_to_submit`.
3. **التقديم**:
   1. نموذج قائمة المتجر من M13 (الاسم بلغتين، والعنوان الفرعي، والوصفان، والكلمات المفتاحية، ورابطا الدعم والخصوصية، وهاتف مراجعة Apple). يُعبأ مسبقًا من بيانات زد مع اقتراح نص.
   2. اللقطات: مولّدة (Should في M13) أو مرفوعة.
   3. معاينة لصفحة المتجر، ثم موافقة صاحب الحساب. فتنفذ M13 التقديم (BLD-13).
4. **الإطلاق**: عند `AppWentLive`:
   - شاشة تهنئة فيها روابط المتجرين.
   - تُغلق مرحلة الإعداد لتلك المنصة، وتنتقل اللوحة إلى وضعها اليومي.
   - في Should: QR للتنزيل لاستخدامه في المتجر وعلى الأغلفة.

## 4. نموذج البيانات

كل الجداول على الخادم، وتحمل `tenant_id`. لا شيء على جهاز المتسوق. وفي المتصفح تُحفظ مسودات النماذج غير السرية فقط، ولا يُحفظ أي مفتاح.

**`onboardings`** (صف لكل تاجر)

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | ulid | |
| `tenant_id` | ulid | فريد |
| `stage` | enum | `installed`، و`account_created`، و`importing`، و`preset_selected`، و`preview_ready`، و`accounts_in_progress`، و`app_records`، و`first_build`، و`testing`، و`ready_to_submit`، و`submitted`، و`live`، و`dormant`، و`abandoned` |
| `platform_stages` | jsonb | `{ "ios": "testing", "android": "app_records" }` |
| `target_platforms` | enum: `ios`، `android`، `both` | الافتراضي `both` |
| `entity_type` | enum | `company`، و`sole_establishment`، و`no_cr`، و`unknown` |
| `cr_number` و`legal_name_ar` و`legal_name_en` و`duns_number` | string | |
| `apple_account_type` | enum: `organization`، `individual`، nullable | |
| `owner_user_id` و`assigned_support_user_id` | ulid | |
| `terms_version` و`terms_accepted_at` | string وtimestamp | |
| `started_at` و`first_preview_at` و`accounts_ready_at` و`first_build_at` و`first_submitted_at` و`live_ios_at` و`live_android_at` | timestamp | لقياس القمع |
| `last_activity_at` | timestamp | فهرس، للتذكير |

**`onboarding_steps`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | ulid | |
| `onboarding_id` و`key` | | فريد معًا. `key` من `W0` إلى `W10`، ثم `RECORD_IOS` و`RECORD_ANDROID` و`TEST` و`SUBMIT` |
| `platform` | enum: `ios`، `android`، `both` | |
| `owner` | enum: `merchant`، `platform` | |
| `status` | enum | القسم 3.6 |
| `status_reason` | string، nullable | رمز السبب، وله نص عربي في ملف الترجمة |
| `data` | jsonb | بيانات غير سرية: Team ID، وبريد Google للاختبار، واسم المطوّر |
| `started_at` و`completed_at` و`expected_done_at` و`escalate_at` | timestamp | |
| `reminder_count` و`last_reminder_at` | | |
| `completed_by` | ulid | التاجر أو المشرف |

**`store_credentials`**

| الحقل | النوع | ملاحظة |
|---|---|---|
| `id` | ulid | |
| `tenant_id` | ulid | فهرس (`tenant_id`، `kind`، `status`) |
| `kind` | enum | `asc_team_key`، و`apns_key`، و`play_sa_managed`، و`play_sa_uploaded` |
| `vault_ref` | string | مرجع في خزنة M12. والسر نفسه لا يُخزَّن هنا |
| `key_id` و`issuer_id` و`team_id` و`service_account_email` | string، nullable | بيانات وصفية |
| `fingerprint_sha256` | string | كشف إعادة رفع المفتاح نفسه أو رفعه في الخانة الخطأ |
| `status` | enum | `validating`، و`pending_dependency`، و`valid`، و`invalid`، و`revoked`، و`superseded` |
| `last_error_code` و`validation_report` | string وjsonb | الاستدعاءات ونتائجها، بلا أسرار |
| `validated_at` و`last_used_at` و`uploaded_by` | | |
| قيد | فريد جزئي | صف `valid` واحد لكل (`tenant_id`، `kind`) |

**`onboarding_notifications`**: `onboarding_id`، و`step_key`، و`channel` (`email`، `in_app`، و`whatsapp` في Should)، و`template`، و`sent_at`.

**`support_escalations`**: `id`، و`onboarding_id`، و`step_key`، و`reason` (`merchant_request`، `overdue`، `validation_failed`، `store_rejection`)، و`status` (`open`، `in_progress`، `resolved`)، و`assigned_to`، و`opened_at`، و`first_response_at`، و`resolved_at`، و`summary`.

## 5. الواجهات والعقود

### 5.1 واجهات التاجر (Sanctum)

| الطريقة والمسار | الغرض | الدور |
|---|---|---|
| `GET /api/v1/merchant/onboarding` | الحالة الكاملة: المرحلة، والخطوات، والتقديرات | أي مستخدم للمتجر |
| `PATCH /api/v1/merchant/onboarding/profile` | نوع المنشأة، والسجل، والاسم الإنجليزي، والمنصات المستهدفة | `owner` |
| `POST /api/v1/merchant/onboarding/steps/{key}/start` و`complete` و`waiting` | تحديث خطوة يدوية مع بياناتها | `owner` |
| `POST /api/v1/merchant/onboarding/steps/{key}/help` | فتح تصعيد | أي مستخدم |
| `POST /api/v1/merchant/credentials/asc-key` | multipart: `file`، و`key_id`، و`issuer_id` | `owner` |
| `POST /api/v1/merchant/credentials/apns-key` | multipart: `file`، و`key_id`، و`team_id` | `owner` |
| `POST /api/v1/merchant/credentials/play/managed` | إنشاء حساب الخدمة المُدار (idempotent) وإرجاع بريده | `owner` |
| `POST /api/v1/merchant/credentials/play/upload` | ملف JSON (المسار البديل) | `owner` |
| `POST /api/v1/merchant/credentials/{id}/verify` | إعادة التحقق | `owner` |
| `GET /api/v1/merchant/credentials` | بيانات وصفية فقط | `owner` |

```http
GET /api/v1/merchant/onboarding

200 OK
{
  "data": {
    "stage": "accounts_in_progress",
    "platform_stages": { "ios": "accounts_in_progress", "android": "accounts_in_progress" },
    "entity_type": "company",
    "progress": { "done": 6, "total": 15 },
    "estimate": { "merchant_minutes_left": 55, "expected_live_on": "2026-11-28" },
    "steps": [
      { "key": "W2", "platform": "both", "owner": "merchant", "status": "done", "completed_at": "2026-11-03T10:12:00Z" },
      { "key": "W3", "platform": "ios", "owner": "merchant", "status": "waiting_external",
        "status_label_ar": "بانتظار تحقق Apple", "expected_done_at": "2026-11-12T00:00:00Z" },
      { "key": "W6", "platform": "ios", "owner": "merchant", "status": "locked", "blocked_by": ["W3", "W4"] },
      { "key": "W8", "platform": "android", "owner": "merchant", "status": "in_progress" }
    ],
    "open_escalation": null
  }
}
```

```http
POST /api/v1/merchant/credentials/asc-key
Content-Type: multipart/form-data
file=AuthKey_2X9R4HXF34.p8, key_id=2X9R4HXF34, issuer_id=57246542-96fe-1a63-e053-0824d011072a

202 Accepted
{ "data": { "id": "01JD2...", "kind": "asc_team_key", "status": "validating" } }
```

```http
GET /api/v1/merchant/credentials

200 OK
{
  "data": [
    {
      "id": "01JD2...", "kind": "asc_team_key", "status": "invalid",
      "key_id": "2X9R4HXF34", "error_code": "individual_or_insufficient_role",
      "message_ar": "هذا مفتاح فردي أو بدور أقل من المطلوب. أنشئ مفتاح فريق بدور App Manager.",
      "checks": [
        { "name": "auth", "ok": true },
        { "name": "provisioning_access", "ok": false, "http_status": 403 }
      ],
      "validated_at": "2026-11-10T09:31:12Z"
    }
  ]
}
```

### 5.2 واجهات الإدارة

| الطريقة والمسار | الغرض |
|---|---|
| `GET /api/v1/admin/onboardings?stage=&stalled=true&entity_type=` | لوحة المتابعة مع التصفية |
| `GET /api/v1/admin/onboardings/{id}` | الخط الزمني الكامل والتصعيدات والمفاتيح (بيانات وصفية) |
| `PATCH /api/v1/admin/onboardings/{id}/steps/{key}` | تأشير خطوات المنصة (قبول الدعوات) أو تصحيح حالة |
| `POST /api/v1/admin/onboardings/{id}/notes` | ملاحظات الدعم |
| `PATCH /api/v1/admin/escalations/{id}` | تعيين، ورد، وإغلاق |

### 5.3 الأحداث الواردة

| الحدث | من | الأثر |
|---|---|---|
| `StoreInstalled` | M10 | إنشاء الإعداد، وبدء الاستيراد |
| `StoreUninstalled` | M10 | `abandoned`، وتوقف التذكير، وبريد بخطوات إلغاء المفاتيح وإزالة المستخدمين |
| `ImportCompleted` و`ImportFailed` | M11 | المرحلة 3 |
| `PreviewReady` | M15 | `first_preview_at` |
| `IdentifiersRegistered` | M13 | بدء التحقق من APNs |
| `StoreAppLinked` | M13 | مرحلة `first_build` للمنصة، والتحقق من وصول Play |
| `BuildReady` و`SubmissionStatusChanged` و`AppWentLive` | M13 | المراحل 9 إلى 11 |
| `StoreCredentialsRejected` | M13 | إعادة فتح خطوة المفتاح (`needs_attention`) مع السبب |

### 5.4 الأحداث الصادرة

| الحدث | المستهلك |
|---|---|
| `CredentialsValidated {tenant_id, kind, credential_id}` | M13 (يبدأ تسجيل المعرّفات عند `asc_team_key`)، وM06 (عند `apns_key`) |
| `OnboardingStageChanged {tenant_id, from, to, platform}` | M15، وM08 (القمع) |
| `OnboardingStalled {tenant_id, step_key, days}` | لوحة الإدارة |
| `EscalationOpened {tenant_id, step_key, reason}` | لوحة الإدارة، وبريد المشرف |

### 5.5 العقود مع الوحدات الأخرى

| الوحدة | ما تعطيه لـ M14 | ما تأخذه من M14 |
|---|---|---|
| M10 | أحداث التثبيت وإلغائه، وبيانات التاجر (الاسم والبريد والجوال والنطاق والقطاع) | — |
| M11 وM02 | الاستيراد، والهويات المقترحة للقطاع | اختيار الهوية |
| M12 | المستخدمون والأدوار، و`SecretVault::put` و`get` و`revoke`، وسجل التدقيق، وقنوات البريد والإشعارات | الأسرار ومراجعها |
| M13 | `store_apps` وقائمة تحقق السجل، والبناء، والتقديم، والأحداث | المفاتيح الصالحة، وTeam ID، وبريد التاجر للاختبار، ومسودة القائمة الأولى |
| M06 | — | مرجع مفتاح APNs وTeam ID |
| M08 | — | أحداث القمع (Should) |

### 5.6 متطلبات واجهة الإعداد المسلّمة إلى M15

**الشاشات**:
1. **صفحة «تطبيقك» في مرحلة الإعداد**:
   - شريط تقدم بالمراحل الإحدى عشرة، وحالة لكل منصة.
   - بطاقة «الخطوة التالية» واضحة، وتقدير «وقتك المتبقي» و«التاريخ المتوقع للإطلاق».
2. **قالب صفحة خطوة في المعالج**:
   - العنوان، و«لماذا»، و«ما تحتاجه»، والخطوات المرقمة مع صور.
   - المدة، وأخطاء شائعة قابلة للطي، وزر الإتمام، وزر «أحتاج مساعدة».
   - المحتوى من ملفات MDX (القسم 2.2).
3. **نموذج رفع المفتاح**:
   - منطقة سحب وإفلات تقبل `.p8` أو `.json` فقط، مع فحص الامتداد والحجم في المتصفح.
   - حقول المعرّفات بأقنعة إدخال (عشرة أحرف، وUUID).
   - حالات العرض: «جارٍ التحقق» مع مؤشر، و«تم» مع قائمة الفحوص الناجحة، و«يحتاج إجراء» مع الرسالة وخطوة الإصلاح.
   - لا يُعرض محتوى الملف أبدًا، ولا يُحفظ في `localStorage`.
4. **متتبع الحالة**: خط زمني لكل خطوة بتاريخ البدء والإتمام والانتظار المتوقع.
5. **خطوة الاختبار**: روابط TestFlight وPlay، وQR لرابط أندرويد، و«أبلغ عن مشكلة» بلقطة، و«جربته وهو جاهز».
6. **خطوة التقديم**: نموذج القائمة بعدّاد للأحرف (وللبايتات في الكلمات المفتاحية)، ومعاينة صفحة المتجر، وملخص ما سيُقدَّم، وزر الموافقة لصاحب الحساب فقط.
7. **شاشة الإطلاق**: روابط المتجرين، والخطوات التالية.
8. **لوحة الإدارة**:
   - لوحة Kanban بالمراحل، وتصفية «متأخر» و«نوع المنشأة».
   - صفحة تاجر بخطه الزمني وتصعيداته وملاحظاته.
   - قائمة تحقق السجل الأول من M13 مع أزرار التأشير وحقول ربط Apple ID واسم الحزمة.

**قواعد التجربة**:
- RTL كامل، والأرقام حسب إعداد M02. وأسماء عناصر Apple وGoogle تبقى بالإنجليزية كما تظهر في واجهتيهما، داخل `code` أو بخط مميز.
- زر نسخ بجانب كل بريد أو اسم صلاحية أو قيمة يجب لصقها.
- روابط Apple وGoogle تُفتح في تبويب جديد، ويبقى تقدم التاجر محفوظًا.
- الصفحات تعمل على عرض 360 بكسل، لأن كثيرًا من التجار يتابعون من الجوال. لكن رفع المفاتيح يُنصح به من الحاسوب، فتظهر ملاحظة بذلك على الجوال.
- إمكانية الوصول WCAG 2.2 AA: تسميات لكل حقل، وحالات بنص لا بلون فقط، وتنقل كامل بلوحة المفاتيح، وإعلان تغير حالة التحقق لقارئ الشاشة (`aria-live`).
- لا رسالة خطأ تقنية خام للتاجر. كل رمز خطأ له نص عربي وإجراء.

**قوالب البريد** (بالعربية، وتنفذها M12): ترحيب، وتذكير بخطوة، و«هل وصلك الرد؟»، وإجراء مطلوب في مفتاح، وتطبيقك جاهز للاختبار، وتغير حالة المراجعة، وتطبيقك منشور، واتفاقية Apple جديدة تحتاج قبولك.

## 6. الحالات الحدية والأخطاء

| الحالة | السلوك المتوقع |
|---|---|
| مفتاح APNs مرفوع في خانة مفتاح API (كلاهما `.p8`) | فشل المصادقة مع رسالة تقترح الخانة الصحيحة. وإن طابقت البصمة مفتاحًا مرفوعًا في الخانة الأخرى، تُذكر الحالة صراحة |
| مفتاح فردي بدل مفتاح فريق | `403` على Provisioning، ثم رسالة W6 لإنشاء مفتاح فريق |
| مفتاح من فريق Apple آخر (للتاجر حسابان) | عدم تطابق `seedId` أو Team ID، فيُرفض المفتاح مع ذكر الفريقين |
| ضاع ملف `.p8` قبل رفعه | تعليمات إلغاء المفتاح وإنشاء جديد، ولا يحتاج التاجر دعمًا |
| بلوغ حد مفتاحي APNs من نوع Team Scoped | رفع مفتاح قائم إن كان ملفه محفوظًا. وإلا تصعيد، فلا ينصح النظام بإلغاء مفتاح قد تعتمد عليه تطبيقات أخرى |
| Apple ترفض التسجيل كمنظمة لمؤسسة فردية | تحويل المسار إلى «فرد» مع البطاقة التوضيحية، و`apple_account_type = individual` |
| اسم D-U-N-S لا يطابق الاسم الإنجليزي في السجل | رسالة بخطوات تعديل بيانات D&B عبر بوابة دعمها، وتمديد الانتظار المتوقع 5 أيام |
| تاجر بلا سجل تجاري | المعالج يتوقف عند W0 برسالة واضحة، ويبقى التطبيق في وضع المعاينة، ويُسجَّل الاهتمام |
| تاجر عنده حساب Google شخصي قائم | توصية بفتح حساب منظمة. وإن أصر، تُعرض متطلبات الاختبار المغلق (Could) |
| تاجر عنده تطبيق قائم على **حسابه** من مزود سابق | خيار «استخدم السجل القائم»: يُربط Apple ID واسم الحزمة القائمان بدل إنشاء جديد. وفي iOS يُنشئ الفريق شهادة جديدة. وفي أندرويد يحتاج التاجر مفتاح الرفع القديم، أو طلب «إعادة تعيين مفتاح الرفع» بشهادة نولّدها ([Google](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)) |
| تطبيق التاجر الحالي على **حساب المزود السابق** | يحتاج نقل التطبيق (App Transfer في Apple، ونقل التطبيق في Google) بين الحسابين، أو تطبيقًا جديدًا. القرار للتاجر، والنقل خارج الإصدار الأول ويُدار كتصعيد |
| دعوة المنصة لم تصل | إعادة عرض البريد الصحيح للنسخ، وفحص البريد غير المرغوب، وإعادة الإرسال من Apple أو Google |
| مستخدم غير صاحب الحساب يحاول رفع مفتاح | `403`، ورسالة «صاحب الحساب فقط يستطيع ذلك» |
| اتفاقية Apple جديدة بعد الإطلاق | `StoreCredentialsRejected` من M13، فتُفتح W4 من جديد، ويُرسل بريد للتاجر |
| انتهاء عضوية Apple السنوية | يُسجَّل تاريخ اكتمال W3، ويُذكَّر التاجر بعد 11 شهرًا ثم قبل الانتهاء بأسبوع. وعند فشل البناء بسبب العضوية تُفتح W3 |
| Google تطلب وثائق تحقق إضافية | التاجر يختار «طُلبت مني وثائق»، فتصبح الخطوة `needs_attention` مع شرح وتصعيد اختياري |
| حذف تطبيق انتشار من زد أثناء الإعداد | `abandoned`، وبريد بخطوات إلغاء المفاتيح وإزالة مستخدمي المنصة، وطلب إلغاء المفاتيح من الخزنة (M12) |
| حساب الخدمة المُدار حُذف أو عُطّل من جهتنا | `invalid` لكل التجار المتأثرين، وتنبيه حرج للمشرف، وإعادة الإنشاء آليًا مع طلب دعوة جديدة من التاجر |
| تجاوز حد حسابات الخدمة في مشروع | إنشاء المشروع التالي آليًا، أو تنبيه المشرف إن فشل |
| المعاينة تتجاوز 15 دقيقة من التثبيت | تُسجَّل كمخالفة لمؤشر PRD في لوحة الإدارة، ويُعرض للتاجر المعالج بدلها حتى لا ينتظر |

## 7. المتطلبات غير الوظيفية

| البند | المعيار |
|---|---|
| زمن أول معاينة | p90 ≤ 15 دقيقة من `StoreInstalled` إلى `PreviewReady`، دون تدخل من الفريق (مؤشر PRD) |
| زمن التحقق من مفتاح | p95 ≤ 20 ثانية من الرفع إلى النتيجة، باستثناء `pending_dependency` |
| زمن ما بعد التبعية | التحقق من APNs يبدأ خلال دقيقة من `IdentifiersRegistered`، ومن Play خلال دقيقة من `StoreAppLinked` |
| الأمان | الملف في الذاكرة فقط، وفي الخزنة خلال الطلب نفسه. ولا واجهة تعيد سرًا. وكل رفع وتحقق وإلغاء في سجل التدقيق. وTLS 1.2 فأعلى. وحد معدّل 10 طلبات رفع في الساعة لكل متجر |
| الخصوصية | رقم السجل والاسم القانوني وD-U-N-S بيانات منشأة لا تُعرض لغير مستخدمي المتجر والمشرف. وبريد المختبر يُستخدم للاختبار فقط |
| التذكير | لا يزيد عن 3 تذكيرات للخطوة الواحدة، ولا يُرسل خارج نافذة 9 صباحًا إلى 9 مساءً بتوقيت الرياض |
| التصعيد | أول رد ≤ يوم عمل لـ 90% من التصعيدات (يُقاس شهريًا) |
| العربية وRTL | كل نص للتاجر عربي من ملفات المحتوى أو الترجمة. ولا نص إنجليزي إلا أسماء عناصر Apple وGoogle |
| إمكانية الوصول | WCAG 2.2 AA لشاشات المعالج (القسم 5.6) |
| المراقبة | قمع بعدد التجار في كل مرحلة، ووسيط زمن كل خطوة، وعدد المتأخرين، ونسبة فشل التحقق لكل نوع مفتاح |
| الإتاحة | توقف Apple أو Google لا يكسر الواجهة: التحقق يعاد آليًا كل 15 دقيقة لمدة ساعتين، مع رسالة «خدمة Apple لا ترد الآن، سنعيد المحاولة» |

## 8. الاعتماديات والمجهول

### التجارب المرتبطة
- **SPK-14 (حرجة)**، وتحسم:
  1. الدور الأدنى لمستخدم المنصة ولمفتاح الفريق: App Manager أم Admin.
  2. أسماء خيارات Additional Resources في واجهة Apple الحالية.
  3. هل يقبل FCM مفاتيح APNs من نوع Topic Specific أو المقيدة ببيئة واحدة. Firebase أعلنت في نوفمبر 2024 أن المفاتيح الجديدة صارت لبيئة واحدة ([Firebase status](https://status.firebase.google.com/incidents/6iqMpw4rRo7wtaMC3Axd))، وApple تحد المفاتيح من نوع Team Scoped بمفتاحين لكل بيئة ([Apple](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns)).
  4. ردود التحقق المذكورة في القسم 3.5.
  
  نصوص W5 وW6 وW7 تُراجع بعد SPK-14.
- **SPK-15**: المعاينة في المرحلة 5. وإن فشلت، يصبح QR للجهاز هو المسار الأساسي، وترتفع F-M08b إلى Must.
- **SPK-09**: دقة الاستيراد في المرحلة 3.

### تعارضات مع الـ ADRs أو PRD
1. **ADR-0007، البند 2** يذكر «Play service account» لكل تاجر. المسار المُدار هنا يبقى حساب خدمة مستقلًا لكل تاجر ومفتاحه في الخزنة، لكن المنصة هي من تنشئه في مشروعها لا التاجر. هذا لا يخالف نص القرار، لكنه يغير من يملك حساب الخدمة. **يحتاج قرار المشرف**. البديل (ملف JSON من التاجر) موثق كاملًا في W10.
2. **PRD، الرحلة 1** ترتب المعالج بعد المعاينة. هذه المواصفة تبقي الترتيب، وتشجع بدء المعالج مبكرًا وبالتوازي، لأن انتظار D-U-N-S هو المسار الحرج. تحسين لا تعارض.
3. **ADR-0007، البند 1** يقول «يُفضَّل أن يكون حساب منظمة». المؤسسات الفردية، وهي شريحة كبيرة من تجار زد الصغار، ستُدفع غالبًا إلى حساب فرد في Apple باسم المالك الشخصي. نقترح قبول ذلك في الإصدار الأول مع البطاقة التوضيحية. **يحتاج تأكيد المشرف**، وتجربة مع أول تاجر تجريبي من هذا النوع.

### قرارات مفتوحة للمشرف
- **هوية حساب المنصة لدى Apple وGoogle**: حساب Apple وحساب Google مخصصان للعمليات (`apple-ops@` و`play-ops@`) تحت ملكية شخص مسمى، والتحقق بخطوتين على جهاز للشركة (المقترح). أم حساب لكل موظف؟ DPLA 2.1 تشترط أن يكون لكل عضو فريق حساب Apple خاص به.
- **من ينشئ مفتاح APNs**: التاجر (المقترح، لأن App Manager لا يكفي له)، أم منح مستخدم المنصة دور Admin.
- **مسار W10**: المُدار (المقترح) أم ملف JSON من التاجر.
- **دعم المؤسسات الفردية** في الإصدار الأول، والتاجر بلا سجل (المقترح: لا).
- **صياغة بند الالتزامات في اتفاقية الخدمة** (DPLA 2.9) ومراجعتها قانونيًا.
- **قنوات التذكير**: البريد والإشعار في اللوحة في الإصدار الأول (المقترح)، وWhatsApp عبر مزود رسائل أعمال لاحقًا.

### ما يُبنى الآن خلف واجهة مؤقتة
- آلة الحالات والتذكيرات والتصعيد ولوحة الإدارة، مع أحداث وهمية بدل M10 وM11 وM13.
- `AscKeyValidator` و`ApnsKeyValidator` مع اختبارات على ردود مسجلة، ثم يُجرَّب على حساب SPK-14.
- محتوى المعالج (القسم 3.4) يُكتب الآن، ويُراجع بعد SPK-14.

## 9. تقسيم العمل

| القصة | الوصف | الأولوية | يمكن البدء الآن؟ | تعتمد على |
|---|---|---|---|---|
| ONB-01 | نموذج البيانات، وآلة الحالات، و`StepRegistry` من `config/onboarding.php`، و`GET /onboarding` | Must | نعم | M12 (العزل والأدوار) |
| ONB-02 | بدء الإعداد بعد التثبيت: إنشاء حساب صاحب المتجر، وقبول اتفاقية الخدمة بنسختها، وإطلاق الاستيراد | Must | ينتظر M10 | ONB-01، وM12 |
| ONB-03 | تنسيق الاستيراد واختيار الهوية والمعاينة (المراحل 3 إلى 5) وقياس زمن أول معاينة | Must | ينتظر M11 وM02 وSPK-15 | ONB-02 |
| ONB-04 | خطوات المعالج اليدوية W0 إلى W5 وW8 وW9: الإتمام، والانتظار، والتفرع حسب نوع المنشأة، وفحص الموقع في W1 | Must | نعم | ONB-01 |
| ONB-05 | محتوى المعالج العربي بصيغة MDX مع صور الشرح، واختبار تطابق المفاتيح مع الخادم | Must | نعم (يُراجع بعد SPK-14) | ONB-04 |
| ONB-06 | `CredentialIntake`: الاستلام في الذاكرة، والبصمة، والتسليم إلى الخزنة، والتدقيق، وحد المعدّل | Must | نعم | M12 (الخزنة) |
| ONB-07 | التحقق من مفتاح فريق App Store Connect (القسم 3.5.1) وحدث `CredentialsValidated` | Must | نعم | ONB-06 |
| ONB-08 | التحقق من مفتاح APNs بعد `IdentifiersRegistered` (القسم 3.5.2) | Must | ينتظر SPK-14 | ONB-06، وM13 (BLD-07) |
| ONB-09 | وصول Google Play: المسار المُدار عبر IAM API، والمسار البديل بملف JSON، والتحقق بعد ربط السجل | Must | ينتظر SPK-14 | ONB-06، وM13 (BLD-18) |
| ONB-10 | `ReminderScheduler`: التقديرات، و`expected_done_at`، وقواعد التذكير، وقوالب البريد العربية | Must | نعم | ONB-01، وM12 (البريد) |
| ONB-11 | التصعيد ولوحة الإدارة: التصفية، والخط الزمني، والملاحظات، وتأشير خطوات المنصة | Must | نعم | ONB-01 |
| ONB-12 | مراحل الاختبار والتقديم والإطلاق: ربط أحداث M13، وإضافة المختبرين، والإبلاغ عن مشكلة، و«جاهز» | Must | ينتظر M13 (BLD-10 وBLD-13) | ONB-01 |
| ONB-13 | إعادة فتح الخطوات من `StoreCredentialsRejected` (الاتفاقيات، والعضوية، والمفاتيح الملغاة) | Must | نعم (بأحداث وهمية) | ONB-07 |
| ONB-14 | المغادرة: عند `StoreUninstalled`، تعليمات الإلغاء وطلب إلغاء الأسرار من الخزنة | Must | ينتظر M10 | ONB-06 |
| ONB-15 | معاينة على الجهاز بـ QR ورمز موقّع (F-M08b) | Should | ينتظر SPK-15 | ONB-03 |
| ONB-16 | تدوير المفاتيح ذاتيًا مع إبقاء المفتاح القديم حتى نجاح الجديد | Should | نعم | ONB-07 |
| ONB-17 | تذكيرات WhatsApp | Should | ينتظر قرار مزود الرسائل | ONB-10 |
| ONB-18 | أحداث قمع الإعداد إلى M08 | Should | ينتظر M08 | ONB-01 |
| ONB-19 | وصول Google بلا مفاتيح دائمة (انتحال حساب الخدمة) | Should | ينتظر قرار W10 | ONB-09 |
| ONB-20 | مسار الحساب الشخصي في Google (متابعة الاختبار المغلق) | Could | لا | ONB-09 |
| ONB-21 | كشف قبول دعوات المنصة آليًا من صندوق البريد | Could | نعم | ONB-11 |

### معايير القبول

**ONB-03: زمن أول معاينة**
- Given متجر تطويري في زد بشعار وألوان، When يثبّت التاجر التطبيق ويكمل حسابه ويختار هوية، Then تظهر المعاينة بهويته خلال 15 دقيقة من التثبيت في 9 من 10 محاولات، دون أي إجراء من الفريق.
- Given فشل استيراد الرئيسية، When يكتمل الاستيراد، Then تظهر المعاينة برئيسية القالب الافتراضي للقطاع مع الرسالة المحددة، ولا تتوقف الرحلة.

**ONB-04: التفرع حسب نوع المنشأة**
- Given التاجر اختار «مؤسسة فردية»، When يفتح خطوة Apple، Then تظهر بطاقة المؤسسة الفردية. وعند اختياره «فرد» تُخفى خيارات Certificates, Identifiers & Profiles من W5، ويُحفظ `apple_account_type = individual`.
- Given التاجر اختار «لا أملك سجلًا»، When يحاول المتابعة، Then يتوقف المعالج برسالة توضح السبب، وتبقى المعاينة متاحة.

**ONB-07: التحقق من مفتاح فريق App Store Connect**
- Given مفتاح فريق صالح بدور App Manager، When يُرفع، Then تصبح الحالة `valid` خلال 20 ثانية، ويُطلق `CredentialsValidated`، ولا يظهر محتوى الملف في أي سجل أو رد أو قاعدة بيانات خارج الخزنة (اختبار آلي يبحث عن نص المفتاح).
- Given مفتاح فردي، When يُرفع، Then تكون الحالة `invalid` برمز `individual_or_insufficient_role` والرسالة العربية المحددة.
- Given ملف مفتاح APNs في خانة مفتاح API، When يُرفع، Then تظهر رسالة تقترح الخانة الصحيحة.
- Given مستخدم بدور غير `owner`، When يرفع مفتاحًا، Then يرد `403`، ولا يُحفظ شيء.

**ONB-08: التحقق من مفتاح APNs**
- Given مفتاح رُفع قبل تسجيل معرّف الحزمة، When يُرفع، Then تكون الحالة `pending_dependency`. وبعد `IdentifiersRegistered` يُتحقق منه خلال دقيقة.
- Given مفتاح صحيح، When يُرسل الطلب الاختباري ويعود `400 BadDeviceToken`، Then تصبح الحالة `valid`، وتُضاف مهمة «ارفع المفتاح إلى Firebase» إلى قائمة المشرف.
- Given Team ID خاطئ، When يعود `403 InvalidProviderToken`، Then تكون الحالة `invalid` برسالة تذكر Team ID وKey ID.

**ONB-09: وصول Google Play**
- Given المسار المُدار، When يفتح التاجر W10 مرتين، Then يُنشأ حساب خدمة واحد فقط ويُعرض البريد نفسه.
- Given التطبيق غير موجود بعد، When يضغط التاجر «تحقق»، Then تكون الحالة `pending_dependency`. وبعد `StoreAppLinked` ينجح `edits.insert`، فتصبح الحالة `valid`.
- Given دعوة ناقصة الصلاحيات، When يُتحقق بعد ربط السجل، Then تكون الحالة `invalid` مع قائمة الصلاحيات المطلوبة.

**ONB-10: التذكير**
- Given خطوة على التاجر بلا نشاط 48 ساعة، When يعمل المجدول داخل نافذة الإرسال، Then يُرسل تذكير واحد بالبريد وفي اللوحة، ولا يُرسل غيره للخطوة نفسها قبل 5 أيام، ولا أكثر من 3 إجمالًا.
- Given خطوة `waiting_external` تجاوزت انتظارها الأقصى، When يعمل المجدول، Then يُفتح تصعيد بسبب `overdue` معيَّن للمشرف، ويظهر في لوحة الإدارة.

## 10. المصادر

- Apple: [Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)، و[D-U-N-S](https://developer.apple.com/support/D-U-N-S/)، و[Roles](https://developer.apple.com/help/account/access/roles/)، و[App Store Connect API keys](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/)، و[Creating API keys](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api)، و[Generating tokens](https://developer.apple.com/documentation/appstoreconnectapi/generating-tokens-for-api-requests)، و[Create a private key](https://developer.apple.com/help/account/keys/create-a-private-key)، و[Token-based connection to APNs](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns)، و[App Review](https://developer.apple.com/distribute/app-review/)، و[DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)، و[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Google: [Organization account requirements](https://support.google.com/googleplay/android-developer/answer/13628312?hl=en)، و[Users and permissions](https://support.google.com/googleplay/android-developer/answer/9844686?hl=en)، و[Testing requirements for personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)، و[White label best practices](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en)، و[Play Developer API getting started](https://developers.google.com/android-publisher/getting_started)، و[Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)، و[Android developer verification](https://support.google.com/android-developer-console/answer/16561738)
- [Firebase status: مفاتيح APNs لبيئة واحدة (2024)](https://status.firebase.google.com/incidents/6iqMpw4rRo7wtaMC3Axd)
- [سلة: رقم D-U-N-S](https://help.salla.sa/en/article/global-company-identifier-d-u-n-s-number/ctwmupb60kgolxag4v3i1cjo)
- [Tapcart: تسجيل حسابات المطوّر](https://help.tapcart.com/en/articles/14660540-step-4-register-your-developer-accounts)، و[Vajro: إعداد حساب Apple](https://docs.vajro.com/en/articles/12504715-how-to-set-up-your-apple-developer-account-with-vajro)
- ملاحظات البحث: `research_notes/جدوى منصة تطبيقات متاجر زد/app_store_policies.md` (الأقسام 2 و3 و4 و6)، و`research_notes/مزايا وتخصيص تطبيقات متاجر زد/local_builders_teardown.md` (نموذج إعداد المنافس وطلبات أصول المتجر بالتذاكر)، و`research_notes/مزايا وتخصيص تطبيقات متاجر زد/global_builders_features.md` (القسم 7)
