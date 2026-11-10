# Product Teardown: Mobile-App Builders for Saudi Zid and Salla Merchants (features, shopper UX, merchant configuration and branding)

Research date: 10 Nov 2026. Everything below was pulled live on that date.

**Labels**
- **[PRIMARY]**: taken directly from the vendor's own site, its public code (JavaScript bundles and GitHub), the Zid market API, Salla's help center, or the Apple/Google store pages.
- **[SECONDARY]**: a search-engine summary or a third-party article.
- **[INFERRED]**: my own reasoning.

This note builds on `../جدوى منصة تطبيقات متاجر زد/anakeed_competitor.md` and does not repeat its plan, price, or history material. It is a product teardown only, so it leaves out legal and commercial analysis.

**Big new primary sources found in this round**
1. AppsBunches' merchant dashboard is a single-page app at `build.appsbunches.com`. Its public JavaScript bundle exposes every menu, form label, and validation rule.
2. AppsBunches' live app editor is publicly hosted on GitHub Pages at `appsbunches.github.io/zid_appsbunche_app_mockup/v2/`. The merchant dashboard embeds it in an iframe. Its JavaScript carries detailed developer comments that explain the architecture, the plan gating, and usage data from 572 stores.
3. AppsBunches publishes a public GitHub guide for Zid theme developers. It explains exactly how home-page mirroring works.

---

## 1. Anakeed / AppsBunches: what merchants can configure, how mirroring works, how fast changes go live, and what shoppers get

### Takeaway
AppsBunches is no longer purely agency-managed. Merchants now get a self-serve dashboard plus a very deep live-preview editor. It is a Flutter app driven by remote config, covering about 60 home-section types and around 20 screens, with hundreds of style knobs per section. Changes publish "live" without an App Store release.

Two things limit what merchants actually get:
- **Plan gates.** On Basic, edits show in the preview only and never reach the app. Most screen editors are unlocked only for Ultra.
- **Complexity.** The vendor's own code says merchants are "drowning" in 100–214 controls per section. Only 83 of the 572 stores it tracks ever changed even the most-edited section.

Home-page "mirroring" works by parsing the Zid theme's home-section settings JSON. It renders correctly only for 19 whitelisted theme IDs, or for themes whose developers follow AppsBunches' key conventions. Every other theme falls back to a default rendering. The store-listing assets (icon, screenshots, description) still go through ticketed "update requests" that the team carries out.

### Cited Findings

**A. Dashboard structure (merchant self-serve) [PRIMARY]**

The `build.appsbunches.com` sidebar has five groups — [AppsBunches dashboard JS bundle](https://build.appsbunches.com/assets/index-CqP64lrL.js):
- **Setup:** "طلب إنشاء تطبيق", "خدماتنا".
- **Marketing & retargeting:**
  - "الإشعارات التسويقية"
  - "عرض السلات المتروكة"
  - "بوب أب السلات المتروكة"
  - manual, basic, and advanced cart notifications
  - "إشعارات حالات الطلبات"
  - "البوب أب بدون إشعار"
  - "المنتجات المفضلة والقوائم"
  - "إشعارات المنتجات غير المتوفرة"
  - "المدونة"
- **Customization:**
  - "سوق ثيمات التطبيق"
  - "تخصيص واجهة التطبيق"
  - "الشريط الإعلاني"
  - "واجهة البداية (السبلاش)"
  - "تصميم واجهة التصنيفات"
  - "تصميم بطاقة المنتج"
  - "توقيع التطبيق"
  - "أصوات الإشعارات"
- **Store:** "الطلبات", "تحديث بيانات التطبيق", "طلبات الاستبدال".
- **Analytics & services:** "إحصائيات المتجر", "ربط البكسل".

**B. Onboarding form (what the merchant supplies) [PRIMARY]** — [dashboard JS](https://build.appsbunches.com/assets/index-CqP64lrL.js)
- App icon: "مقاس 500×500 بكسل كحد أدنى".
- Splash image or video: "400 × 800 بكسل (نسبة الأبعاد 1:2)".
- Store-listing name.
- On-device name: "يفضل ألا يتجاوز 12 حرفًا".
- Short and long description: "لا يجب استخدام أي من الرموز أو العلامات التعبيرية".
- ASO keywords.
- Screenshots and a privacy-policy URL.
- An Apple email for TestFlight invites.
- Answers to "هل تمتلك حساب آبل/جوجل للمطورين؟" plus the account details. If the app already exists, a JKS keystore and its password.
- **OneSignal account credentials:** "حقل بريد OneSignal مطلوب لإرسال الإشعارات… حقل كلمة مرور OneSignal مطلوب". The merchant must register on OneSignal's free plan first.
- Firebase is optional.
- Test builds are delivered via TestFlight and a downloadable APK. The merchant files "الإبلاغ عن مشكلة في النسخة التجريبية" with screenshots or video, then approves.
- A request can be rejected and re-filled.

**C. Post-launch store-listing changes are ticketed, not self-serve [PRIMARY]** — [dashboard JS](https://build.appsbunches.com/assets/index-CqP64lrL.js)
- "تحديث بيانات التطبيق" covers updating the icon (1024×1024 PNG ≤4MB), the description (minimum 200 characters), and up to 5 screenshots per platform.
- Each change is a request that "سيقوم فريقنا بمراجعة طلبك وتنفيذ التحديث".
- Requests draw from a per-plan free quota: "متبقي طلبان مجانيان في باقتك الحالية". After that a paid "رسوم الخدمة" applies.
- Some settings warn "هذا التغيير يتطلب تحديث التطبيق" (shown next to app name and language).

**D. Live editor ("تخصيص واجهة التطبيق") [PRIMARY]**
- The dashboard iframes `https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/?storeUrl=…&token=…&env=production&current_plan=…` — [dashboard JS](https://build.appsbunches.com/assets/index-CqP64lrL.js).
- The page shows a phone preview ("iPhone 17 Pro Max") of the real Flutter app running against the merchant's live store — [editor page](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/).
- The toolbar offers "إرسال التحديثات لايف", "سجل التعديلات", "مراجعة التعديلات قبل النشر", "حذف التخصيصات" (with per-item restore to default), and undo/redo (Ctrl+Z) — [editor page](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/).
- **Architecture:**
  - "Record the latest customization for a section, then forward it to the Flutter preview". Publishing goes "through the same /remote-config/update batch".
  - Keys must "equal the Dart Remote Config key". The Flutter codebase is referred to as "entaj's lib/src/core/remote_config_keys.dart".
  - Sources: [04-core.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/04-core.js); [18-app-settings-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/18-app-settings-editor.js)
- **Editor navigation:**
  - Screens: home, product page (PDP), product card, cart, orders, order details, order success, bank-transfer receipt upload, account, pages, page details, categories, category details.
  - "الأشرطة الثابتة": app bar and bottom nav.
  - Colours, app settings, and a separate «الثيمات» identity store.
  - Source: [14-nav-menu.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/14-nav-menu.js)
- **More screens in the editor:**
  - search
  - wishlist
  - "المحفظة" / "نقاطي" / "من نحن" / "الأسئلة الشائعة" / "الشحن إلى" / "خيارات الشحن" / "التقييمات" / "المدونة" / "ادعُ صديقًا"
  - auth screens (login, register, OTP)
  - drawer
  - prompt sheets
  - Sources: [editor script list](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/); [17-wallet-loyalty-content-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/17-wallet-loyalty-content-editor.js)

**E. Colours [PRIMARY]** — [editor page](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/)
The colours form ("التحكم الشامل بجميع ألوان التطبيق") has dozens of named tokens grouped by area:
- **Core:** primary, secondary, home background, loyalty-programme colour, error, and warning.
- **Header:** background, text, store-availability (open/closed) bar.
- **Account header** and **bottom bar:** selected and unselected icon colours.
- **Registration screen.**
- **Categories:** cards, sub-categories, and category pills on the PDP.
- **Cart and order:** about 20 tokens, including coupon-field border colours for error, success, and normal states, applied-offer backgrounds, and tax-line text.
- **Reviews.**
- **Buttons:** add-to-cart, call, login, pay.
- **Prices:** sale, final, and struck-through.
- **Filter and discount badges.**
- **Dropdowns.**

**F. App "identity" theme store with fonts [PRIMARY]** — [11-theme-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/11-theme-editor.js)
- "Released to production 2026-10-08". It is "a token bundle that repaints every screen at once".
- Shipped identities:
  - الافتراضي
  - هادئ (minimal)
  - حيوي (bold)
  - فسيح (airy)
  - حادّ (noir)
  - قرمز
  - طويق ("قرمزي دافئ على بيج، بخط نسخ مائل")
  - لافندر
- The backend decides "which store may use which one". Locked identities still preview but show a lock and a "شراء الثيم" button.
- **Font choice is limited to bundled fonts:** المراعي (Almarai), تجوال (Tajawal), تشانجا (Changa), أميري مائل (AmiriSlanted), and Inria Serif / Noto Naskh. The editor notes: "هذه الخطوط وحدها مضمّنة في التطبيق — أي خط آخر يسقط للمراعي".
- Other tokens: font weights, "معامل تكبير الخطوط" (font scale), and radii for cards, buttons, sheets, fields, and pills.
- **No dark-mode toggle** was found in the editor or the dashboard strings. The only "dark" options are header styles such as `dark_hero` ("رأس داكن…"). This absence is [INFERRED] from searching the code.

**G. Home builder: about 60 section types, each with deep controls [PRIMARY]**
- Editable section types listed on the editor page:
  - Banners, Banner Tabs, Store Features, Partners, Slider
  - Products, Categories, Countdown, Testimonials
  - Video, Description, Instagram, Icon Box
  - Advertisement Bar, Gallery, Text Section, Counter Up, Categories Nav
  - Video Slider, Video Stories, Brands, Flash Sale, Media Banner
  - Blog slider, category-video cards, offers, "المنتجات على الصورة"
  - Branches and branch map, quick links, text block, stories, spacer
  - Reels, TikTok product videos, editorial cards, shoppable image, welcome hero
  - "ساعة العروض", bento cards, "نشرة العروض" (offers flyer with PDF download)
  - "السلال" ("أضف السلة كلها", a bundle basket)
  - live stream band, "رحلتنا", "اكتب لنا" (feedback form), image hero, size tabs
  - a vertical-specific "مخطط المياه" (a household water-subscription planner quiz)
  - "أعد طلبك" (reorder in one tap), intro section, comparison, contact us
  - Trust Payment, Announcement Bar, FAQs, Products Tabs
  - Source: [editor page](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/)
- **Depth:** the banner card alone shows "إعدادات متقدمة — 82 خاصية":
  - image fit (cover / contain / fit-height…) and aspect ratio
  - floating-button position on a 9-point grid
  - grid columns and spacing
  - carousel dots
  - "بانر كبير + صف" layout
  - Source: [editor page](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/)
- **Two edit modes:** "عام — كل العناصر" or "لكل عنصر + ترتيب". Per-instance cards can be dragged, and the order is published as `section_order` — [04-core.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/04-core.js).
- **Merchant-added sections** come from 03-custom-sections.js. Normally the editor can "restyle it, hide it and move it, but it can never create one, because the store's home response is read-only". Custom sections let the merchant author content that lives only in the app (`custom_sections` in THEME_OVERRIDES) — [03-custom-sections.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/03-custom-sections.js).

**H. Plan gating inside the editor [PRIMARY]**
- **Basic:** "متجرك على الباقة الأساسية — هذه التعديلات ستظهر هنا في المعاينة فقط، ولن تنعكس على التطبيق إلا في حال ترقية الباقة" — [editor page](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/).
- **Free (Explore):** "Free-plan stores can preview everything but cannot publish live" — [04-core.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/04-core.js).
- **Ultra:** Ultra stores "get them all: every screen editor, the splash card in app settings, authoring custom home sections and saving uploads to the media library" — [01-bootstrap.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/01-bootstrap.js).
- The bottom-nav, search, and wallet/loyalty/content screen editors each say "Production runs it only for an Ultra store" — [07-bottom-nav-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/07-bottom-nav-editor.js); [15-search-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/15-search-editor.js).
- **Staging-only, not yet available to merchants:**
  - an **AI design assistant** («مساعد التصميم»), where the merchant types Arabic such as "خلي المنتجات منتجين بالصف", reviews an old→new diff card, then applies
  - the attribution editor
  - raw JSON
  - Sources: [12-agent-panel.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/12-agent-panel.js); [01-bootstrap.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/01-bootstrap.js)

**I. Evidence of merchant overwhelm and real usage [PRIMARY]** — [13-basic-mode.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/13-basic-mode.js)
- The code comment reads: "Merchants were drowning: a single section card can carry 100+ control rows (categories: 146, products: 214)". The fix is a basic/advanced fold that shows the "5–7 most-used fields".
- Usage counts come from "the tracker export of every store's THEME_OVERRIDES, 572 stores, 2026-11-04". The number of stores that changed each section type:

| Section | Stores |
|---|---|
| categories | 83 |
| products | 62 |
| slider | 51 |
| announcement bar | 30 |
| gallery | 30 |
| testimonials | 30 |
| features | 18 |
| partners | 13 |
| many others | 0–9 |

- The most-changed fields are sizes and aspect ratios. For example, categories `listHeight` was changed by 62 stores, products `cardAspectRatio` by 40, and slider `aspectRatio` by 29.

**J. How home-page mirroring works [PRIMARY]**
- The app parses the Zid theme's home sections. It supports "both Vitrin themes (`.jinja`) and legacy themes (`.twig`)" through "a unified component model". Each module file (e.g. `main-slider.jinja`) is read with long fallback lists of settings keys:
  - titles: `title`, `banner_title`, `section_title`…
  - images: the mobile image is preferred
  - countdown: `expiry_date`…
  - Source: [AppsBunches theme-developer guide](https://github.com/appsbunches/Apps-Bunches-Recommendation-For-Zid-Themes-Developers)
- The guide documents 54 modules, from Slider to Reorder. It also documents global theme keys the app inherits (`colors_*`, `fonts_*`, header, footer, menu, product_card, "Chat & WhatsApp Buttons", "Splash & PWA") and per-section `entaj_props` overrides — [guide](https://github.com/appsbunches/Apps-Bunches-Recommendation-For-Zid-Themes-Developers).
- **Theme whitelist.** Only 19 storefront theme IDs get a "dedicated theme config":
  - alpha, shofy, asayel, glory, ibraq, nomo, perfect
  - duvet, farah, foody, gamma, rawnaq, royal, soft
  - zeyada, ghassq, unaizah pro, pixela, ebtikar

  "Anything outside this list falls back to DefaultThemeConfig, so the home screen only comes out right when the theme itself follows the published guidelines". The merchant sees "ثيم متجرك غير مدعوم بشكل مخصص في التطبيق" — [04-core.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/04-core.js); [editor page](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/).
- **Zid AI-generated sections.** Sections made with "Zid's AI builder (`vitrin:sections/ai_generated.jinja`)" have invented settings names. The app "guesses which native section it is (AiSectionClassifier)", and the panel lets the merchant pin the right type or hide it, because "A guess can be wrong" — [03-ai-sections.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/03-ai-sections.js).

**K. Other dashboard-level controls [PRIMARY]** — [dashboard JS](https://build.appsbunches.com/assets/index-CqP64lrL.js)

*Splash*
- Image or video (MP4/MOV under 5MB).
- Fit options: stretch, fill width, fill height, full screen.
- The default is "شعار التطبيق ولونه الثانوي".
- The landing page says splash edits apply "فوراً دون الحاجة لرفع تحديث للمتجر" — [zid.appsbunches.com](https://zid.appsbunches.com/).
- Editor app-settings add splash duration, video skip button, logo animation and size, "استخدام أيقونة التطبيق بدل شعار السبلاش" — [18-app-settings-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/18-app-settings-editor.js).

*Category screen*
- Two layouts: "عرض تقليدي، صور ونصوص" and "قائمة مكدسة بسيطة".
- Optional category description, category icon upload, and English category names.
- Drag "لإعادة ترتيب التصنيفات كما تظهر في التطبيق".

*Product card*
- Four styles per page (home, in-category, similar products):
  - "كلاسيكي"
  - "أفقي"
  - "نمط العرض بالإطار"
  - "نمط العرض الخفيف" ("بدون زر سلة بارز")

*Announcement bar*
- Marquee text moving left or right, alignment, background colour, expiry date.
- "كامل الصفحات" or "الرئيسية فقط".

*App signature (removing developer branding)*
- Default AppsBunches&Zid logo under «حسابي», custom text, logo only, or logo plus text.

*Notification sounds*
- A library of sounds (Bell, Ding, Pop, Chime, "كاش (Cash) … مناسب لإشعارات الطلبات", Rise, Silent), applied per notification type.
- "على أندرويد، يُطبق الصوت الجديد بعد قيام العميل بتحديث التطبيق".

*Push composer*
- Arabic and English title, subtitle (iOS only), and body.
- Image up to 3MB and 2000×2000.
- Target page: home, category, or product.
- Audience: all subscribers or manually picked users.
- Platform targeting: "تطبيق iOS فقط / تطبيق Android فقط".
- Send now or schedule.
- Stats: sent count and "نسبة الذين قاموا بالضغط".

*Order-status pushes*
- Per-status on/off with Arabic and English templates.
- Variables `{{order_id}}`, `{{customer_name}}`, `{{store_name}}`.

*Abandoned carts*
- Separate tables for guests ("الزوار") and members, with "كان زائر وتحول الى عميل" tracking.
- Totals: abandoned value, converted value, recovery %.
- Rules by delay after abandonment (minutes, hours, or days), "إجمالي المشتريات أكثر من", and "خطوة ترك السلة" (choosing shipping company, choosing payment method, order confirmation, address).
- Saved message templates.
- The cart popup has title, text, "كوبون الخصم", button text, show-delay, and frequency ("كل مرة يفتح التطبيق").

*General popups*
- With or without a push.
- Target pages, schedule start and end or "العرض بشكل دائم".
- Title, description, and button colours; image up to 500×500.

*Other*
- Back-in-stock ("notify-me") stats and notifications; wishlist lists and notifications.
- Analytics tiles: app users, iPhone downloads, Android downloads, notification subscribers, app orders.
- "ربط البكسل" goes through a tracking intermediary: "AppsFlyer أو Adjust".
- Blog ("المحتوى التعليمي"): categories and articles in Arabic and English with images and a video link, plus visibility limited to whitelisted phone numbers (CSV import, auto-normalised to 9665…).

**L. Custom client modules shipped in the same codebase [PRIMARY]** — [dashboard JS](https://build.appsbunches.com/assets/index-CqP64lrL.js)
- "طلبات الاستبدال والشكاوى":
  - replaceable-product list
  - a "شجرة الأسئلة" per problem type (yes/no, number, text, photo-upload answers)
  - accept or reject with mandatory reason
  - automatic compensation coupon issued "عبر زد"
  - an immutable audit log
- The blog and replacement menus carry `requires:"vitalaire"`, and the spec IDs read "FR-VIT-RPL-16/17".

**M. Shopper-side features in AppsBunches apps [PRIMARY unless noted]**
- **Search:**
  - "اقتراحات البحث", "سجل البحث", "ماسح الباركود"
  - "فلاتر البحث الذكي (Lableb)", an integration with the Lableb search service
  - results bar with count and view switcher
  - Source: [15-search-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/15-search-editor.js)
  - Voice search and in-category search are marketed for Ultra — [zid.appsbunches.com](https://zid.appsbunches.com/).
- **Authentication:**
  - phone OTP ("العدد أربع خانات دائماً — الرمز يُرسل تلقائياً باكتمالها") or email
  - guest checkout shown only "عند القدوم من السلة مع تفعيل الشراء كزائر"
  - Source: [11-auth-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/11-auth-editor.js)
- **Account-area screens:** wallet, points, about, FAQs, ship-to, shipping options, reviews, blog, "ادعُ صديقًا" (referral) — [17-wallet-loyalty-content-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/17-wallet-loyalty-content-editor.js).
- **Order flow:** order-success screen, bank-transfer receipt upload screen, order details — [14-nav-menu.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/14-nav-menu.js).
- **WhatsApp floating button:** configurable per screen (all pages, home tabs, category tab, cart, wishlist, account, product page) with its own number — [18-app-settings-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/18-app-settings-editor.js).
- **Hide products** by name prefix or SKU pattern (e.g., subscription-plan SKUs) — [18-app-settings-editor.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/18-app-settings-editor.js).
- **Also offered:** Deep Links, OneLink smart share link, multi-inventory (Advanced), AR/EN — [zid.appsbunches.com](https://zid.appsbunches.com/).
- **zid-dev.appsbunches.com** is a staging copy of the same landing page. It lacks the newest elements, such as the "جرّب مجاناً" button and the D-U-N-S menu — [zid-dev.appsbunches.com](https://zid-dev.appsbunches.com/).

### Inferences
- [INFERRED] **Self-serve vs. done-for-you.** Day-to-day merchandising is self-serve: pushes, popups, carts, banners, card styles, splash, category order. Three things still need the team: the initial build and store submission, store-listing metadata changes (ticketed and metered), and any theme that isn't whitelisted, which needs theme-developer work. The old "agency-managed" picture in the earlier note is outdated.
- [INFERRED] **How fast changes appear.** Visual and config changes go out over remote config, so no App Store review is needed. Shoppers likely see them on the next app open or config refresh; the exact interval was not found. App name, language, icon, and Android notification sounds still need a new binary.
- [INFERRED] **Too much control, too little guidance.**
  - The editor exposes developer-level knobs: JSON key names such as `banners_item_fit` and `overlayIsPositioned` appear in the advanced list.
  - Only about 15% of tracked stores (83 of 572) touched even the most popular section.
  - Most edits are size and aspect-ratio fixes, which suggests merchants are correcting how the mirrored theme renders rather than designing.
  - Opportunity: opinionated presets, automatic image-ratio detection, and an AI assistant shipped to production. AppsBunches has the assistant only in staging.
- [INFERRED] **Theme dependence is structural.** Native mirroring needs either a whitelisted theme ID or a theme developer who follows a 54-module key spec. Zid AI-generated sections are classified heuristically. Rendering bugs are the likely result whenever a merchant switches theme or uses AI sections.
- [INFERRED] **Branding ceiling.** There are only 5 bundled fonts with no upload, no evidence of dark mode, and theme "identities" that are locked or paid. That is weaker than Salla App Maker, which supports custom font upload and dark mode (Section 4).
- [INFERRED] **Custom work feeds the product.** Client-specific modules (VitalAire's replacement/complaints flow and blog) ship in the shared codebase behind flags. That explains the growing, uneven feature set.

### Gaps
- How long remote-config changes take to reach shoppers (fetch interval or cache TTL) was not found.
- How quickly mirrored Zid home changes reach the app (live per session, or cached) is not stated in primary sources.
- Whether a merchant can rename or reorder bottom-tab items on non-Ultra plans: the bottom-nav editor is Ultra-only in production, and nothing documents lower tiers.
- No YouTube demo of the AppsBunches dashboard was found. The two videos the dashboard embeds are OneSignal and Firebase stock videos, not AppsBunches demos.

---

## 2. Real AppsBunches-built apps: listings, ratings, and what shoppers praise or complain about

### Takeaway
The showcase apps are highly rated: 4.6–4.8★ on iOS and 4.5–4.7★ on Google Play. Store listings are generic brand blurbs with release notes like "performance improvement", and they say nothing about app features.

Most written reviews are about the merchant (delivery delays, unresponsive support, stock-outs, product quality), not the app. The app-specific complaints that do appear are about freezing or kick-outs, Android crashes, slowness, policy pages not opening, and tax-exclusive price shock. The app-specific praise is about ease of use, guest ordering, fast browsing, and Zid's National-Address autofill.

### Cited Findings

**iOS listing facts [PRIMARY]**

| App | Bundle | Rating | Version | Size |
|---|---|---|---|---|
| برفيوم كو perfume co | `com.appsbunches.perfume.co` | 4.75 (2,509) | v2.0.3 (22 Oct 2026) | 90 MB |
| Sulinda | `store.sulinda.com` | 4.73 (2,312) | — | 90 MB |
| ROXA | `com.appsbunches.roxa` | 4.64 (1,799) | v1.1.10 (9 Nov 2026) | 91 MB |
| Reefi | `com.salla.reefi` | 4.68 (6,394) | — | 85 MB |
| العطاوي للإتصالات | `com.appsbunches.aletawiksa` | 4.80 (2,122) | — | 75 MB |

- Perfume Co supports AR+EN and requires iOS 15. Every app in the table requires iOS 15 and supports AR/EN.
- Descriptions are short brand copy. Release notes read "performance improvement", "تحسينات عامة وإصلاح بعض الأخطاء", or "تحسينات في الأداء".
- Sources: iTunes lookup [6474072726](https://itunes.apple.com/lookup?id=6474072726&country=sa), [1508013932](https://itunes.apple.com/lookup?id=1508013932&country=sa), [1671575224](https://itunes.apple.com/lookup?id=1671575224&country=sa), [1594619585](https://itunes.apple.com/lookup?id=1594619585&country=sa), [6739163515](https://itunes.apple.com/lookup?id=6739163515&country=sa)

**Google Play [PRIMARY]**

| App | Package | Installs | Rating |
|---|---|---|---|
| العطاوي | `com.appsbunches.aletawiksa` | 10K+ | 4.7 (~520 reviews) |
| Reefi | `com.salla.reefi` | 50K+ | 4.5 (~544) |
| Perfume Co | `com.appsbunches.perfumeco` | 10K+ | 4.6 (283) |
| Sulinda | `store.sulinda.com` | 10K+ | — (212 reviews) |
| Sayyar | `com.sayyar.store` | 50K+ | 3.6 (163) |

- Sulinda's Play page shows "المزيد من عناقيد التطبيقات Apps Bunches" with AppsBunches' phone number, so AppsBunches **does** have a Google Play developer account. That contradicts the earlier note that its Play developer pages were not found.
- Sources: [Play: العطاوي](https://play.google.com/store/apps/details?id=com.appsbunches.aletawiksa&hl=ar&gl=SA); [Play: Reefi](https://play.google.com/store/apps/details?id=com.salla.reefi&hl=ar&gl=SA); [Play: Perfume Co](https://play.google.com/store/apps/details?id=com.appsbunches.perfumeco&hl=ar&gl=SA); [Play: Sulinda](https://play.google.com/store/apps/details?id=store.sulinda.com&hl=ar&gl=SA); [Play: Sayyar](https://play.google.com/store/apps/details?id=com.sayyar.store&hl=ar&gl=SA)

**App-specific complaints [PRIMARY]**
- العطاوي (iOS, 3★, 30 Jul 2026): "التطبيق يعلق ويطلعني كثير" — [App Store](https://apps.apple.com/sa/app/id6739163515).
- Sayyar (Play, Dec 2025), an Android crash loop: "كل ما ادخل 30 ثانيه بالضبط ويطردني، جوالي samsung s25… التطبيقات في الايفون تشتغل كويس" — [Play: Sayyar](https://play.google.com/store/apps/details?id=com.sayyar.store&hl=ar&gl=SA).
- Sayyar (iOS, 1★, Feb 2026): "Very slow" — [Apple RSS reviews](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1542643577/sortby=mostrecent/json).
- Older Sayyar reviews (2021, v0.4–0.5x) complain about address saving: "معقد جدا تسجل العنوان … وما يقبل يحفظ". Those versions may predate AppsBunches — [Apple RSS reviews](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1542643577/sortby=mostrecent/json).
- Reefi (Play, Jun 2026): the return/exchange policy "ما تفتح بتطبيقهم"; the shopper wanted an in-app exchange. Another review calls a "حمل التطبيق وتحصل 50 ريال" promise false — [Play: Reefi](https://play.google.com/store/apps/details?id=com.salla.reefi&hl=ar&gl=SA); [App Store: Reefi](https://apps.apple.com/sa/app/id1594619585).
- Perfume Co (iOS, Sep 2026): "كل التطبيق نفذت الكميات", i.e. the catalogue is dominated by out-of-stock items — [App Store](https://apps.apple.com/sa/app/id6474072726).
- عالم الهزازي (an ex-AppsBunches app now on MT Themes; bundle `com.appsbunches.alamalhazazy`): "ليه تكتبون السعر بدون ضريبه ولما ادخل ادفع اتفاجئ ان السلعه اللي كانت ب ٥٠ اصبحت ب ٧٣" — [App Store](https://apps.apple.com/sa/app/id1632726580).

**App-specific praise [PRIMARY]**
- Perfume Co (Play, Oct 2025): "تطبيق جميل وسهل وحبيت فكرة طلب كزائر فيه" — [Play](https://play.google.com/store/apps/details?id=com.appsbunches.perfumeco&hl=ar&gl=SA).
- العطاوي (Play, Sep 2025): checkout is "مربوط مع المنصة الوطنية، تدخل رقم جوالك فقط وتطلع لك البيانات كلها بدون ادخال بيانات العنوان" — [Play](https://play.google.com/store/apps/details?id=com.appsbunches.aletawiksa&hl=ar&gl=SA).
- Reefi (Play, Jun 2026): "تصفح سريع" — [Play](https://play.google.com/store/apps/details?id=com.salla.reefi&hl=ar&gl=SA).
- Sulinda (Play, Nov 2025): "سهل الاستخدام ومرونه خيارات الدفع" — [Play](https://play.google.com/store/apps/details?id=store.sulinda.com&hl=ar&gl=SA).
- Sayyar (2021): "Easier to use than the website" — [Apple RSS](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1542643577/sortby=mostrecent/json).

**Merchant-driven complaints dominate [PRIMARY]**
- Perfume Co: non-delivery for 18 days to a month, nobody answering WhatsApp, refunds stuck.
- Sulinda: 7–14 day delivery outside Riyadh, items out of stock.
- Sayyar: service and quality.
- Sources: [App Store Perfume Co](https://apps.apple.com/sa/app/id6474072726); [App Store Sulinda](https://apps.apple.com/sa/app/id1508013932); [Apple RSS Sayyar](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1542643577/sortby=mostrecent/json)

**Odd review patterns [PRIMARY]**
- Several 5★ "reviews" are just city or address strings: "القريات حي الرفاع محطة طيبه…", "الدمام / الروضة", "محافظة/ خليص حي السلام".
- One review hopes to win "جائزة من جوائزكم الكبيرة".
- Sources: [App Store العطاوي](https://apps.apple.com/sa/app/id6739163515); [App Store ROXA](https://apps.apple.com/sa/app/id1671575224)

### Inferences
- [INFERRED] App-store ratings are inflated by contest-linked or prompt-driven rating requests: address-like titles point to shoppers being told to "rate to enter a draw". Ratings are therefore a weak signal of app UX quality. Quality signals should come from crash-free sessions and funnel data.
- [INFERRED] Recurring UX failure modes worth designing against:
  - Android stability and crash loops on new devices
  - session timeouts that "kick out" users
  - slowness
  - CMS/policy pages that fail to render
  - catalogues cluttered with out-of-stock items: hide them or sort them last, and push back-in-stock alerts
  - prices shown without VAT: show VAT-inclusive totals early
- [INFERRED] Shoppers value features that remove friction: guest checkout, National Address autofill, and Apple Pay / multiple payment options. Self-service returns and exchanges inside the app are an explicit unmet wish.
- [INFERRED] Binary sizes of 75–132 MB are large for a shopping app and may hurt install conversion on data-constrained users.

### Gaps
- Apple's RSS review feed returned empty results for 5 of the 6 apps (only Sayyar worked). Review text comes from the ~10 featured reviews on each App Store web page and the ~3 on each Play page, not full histories.
- No crash-rate or Android-vitals data is public.
- Whether Sayyar's 2021 complaints refer to the AppsBunches build is unknown.

---

## 3. Other Zid "تطبيقات الجوال للمتجر" builders: Splendapp, MT Themes, Tatbiqi, Neoxero, Tajadad

### Takeaway
**MT Themes** is the most feature-forward rival on paper:
- dark mode with independent colours
- drag-and-drop home rebuild
- real-time theme swaps
- placement-targeted in-app ads
- loyalty points
- push with A/B tests and 50+ targeting criteria
- live chat and an AI chatbot add-on
- 9 Arabic and 9 English fonts in its demo configurator

It is also already taking an AppsBunches client (عالم الهزازي). **Tajadad** and **Splendapp** sell speed and self-serve drag-and-drop ("10 minutes" and "48 hours"). **Neoxero** sells pixel-identical mirroring of Zid's new Vitrin theme system. **Tatbiqi** is a thinly documented newcomer. Every vendor except AppsBunches and MT Themes has 0–12 reviews, and none publishes detailed editor documentation.

### Cited Findings

**MT Themes ("ام تي ثيمز - تطبيق جوال", Zid app #5212) [PRIMARY]** — [Zid API description/5212](https://api.zid.sa/v1/market/public/apps/description/5212)
- **Presentation layer:**
  - "إدارة الثيمات بدون قيود على الباقات"
  - "تخصيص شامل للألوان، الخطوط، الأقسام، وترتيب العناصر"
  - "Dark Mode بألوان مستقلة"
  - "إعادة بناء الصفحة الرئيسية بالسحب والإفلات"
  - "نافذة منبثقة مخصصة مع عداد زمني"
  - "إعلانات داخل التطبيق مع تحديد موضع الظهور بدقة (منتج – قسم – صفحة محددة)"
  - "نظام النقاط والولاء"
- **Real-time:** "أي تعديل… ينعكس فورًا… حتى تبديل الثيم بالكامل… دون انتظار تحديث متجر".
- **Languages:** Arabic and English, with the option to run one language or both.
- **Notifications:**
  - instant, scheduled, automatic
  - abandoned carts, order status, birthdays
  - advanced segments, deep links, images
  - "تقارير أداء دقيقة (Reach / Open / Click)"
- **Tracking:** Meta, TikTok, Snapchat, GA4/Firebase, AppsFlyer, Adjust, Branch, Singular, X, Pinterest, Custom Webhooks.
- **Add-ons:**
  - Live Chat: staff roles, customer profile with past orders, tags, CSAT ratings, media
  - an AI chatbot
  - both sold in message-based tiers, each with a free tier
- **Flow:** sign up on MT-Themes → link the store → request the app → "ابدأ في تخصيص تطبيقك" → receive an APK. Apps are published "علي حساباتنا في جوجل وابل ستور".
- **Plans:** 14-day trial — [Zid API plans/5212](https://api.zid.sa/v1/market/public/apps/plans/5212). The plan text says "تحكم كامل في تخصيص الصفحة الرئيسية وجميع أقسام الثيمات الحالية والمستقبلية… دعم كامل للوضع الليلي".
- **Website demo configurator** — [mt-themes.com](https://mt-themes.com/); [mt-themes.com/apps](https://mt-themes.com/apps):
  - 13 colour tokens, including the bottom-nav bar and product-card background
  - Arabic fonts: Cairo, Tajawal, Almarai, IBM Plex Arabic, Changa, Harmattan, Amiri, Noto Kufi, Rubik
  - English fonts: Roboto, Open Sans, Lato, Poppins, Montserrat, Source Sans Pro, Playfair Display, Inter, Nunito
  - add and reorder sections with a live phone preview
  - push marketing copy: "اختبار A/B", "+50 معيار استهداف", "شرائح ذكية", "إشعارات تلقائية بتنزيل الأسعار ورجوع المنتجات", "تنظيف تلقائي للأجهزة غير النشطة"
- **Reviews:** 5 reviews, all 5★, Apr–Sep 2026. Praise covers speed, support, and control: "يعطي التاجر تحكمًا عاليًا… التصميم، القوالب، الألوان، ترتيب العناصر، والإشعارات" — [Zid API rates/5212](https://api.zid.sa/v1/market/public/apps/rates/5212).
- **Showcase apps:**
  - عالم الهزازي, iOS v7.2.40, 4.68★ (699), 132 MB. Its bundle is `com.appsbunches.alamalhazazy`, so it was migrated from AppsBunches — [iTunes lookup](https://itunes.apple.com/lookup?id=1632726580&country=sa).
  - Maspro Store, seller "MT THEMES LTD", first released 28 Apr 2026, 2 ratings — [iTunes lookup](https://itunes.apple.com/lookup?id=6763944547&country=sa).
  - The developer phone and WhatsApp numbers are +20 (Egypt) — [Zid API](https://api.zid.sa/v1/market/public/apps/description/5212).

**Splendapp (سبلينداب, Zid app #929) [PRIMARY]** — [Zid API description/929](https://api.zid.sa/v1/market/public/apps/description/929)
- Claims:
  - "تطبيق جوال… في 48 ساعة فقط"
  - "إمكانيات تعديل غير محدودة… لوحة تحكم متقدمة تعتمد على تقنية السحب والإفلات" after publishing
  - "إشعارات غير محدودة"
  - "الرسائل والإعلانات داخل التطبيق (In-App Messages)"
  - store-page design and ASO
  - "إمكانية النشر على حسابات سبلينداب أو حسابك الخاص"
- Flow: activate → pick a plan → "فريقنا يتواصل معك لإطلاق التطبيق في 48 ساعة".
- Plans run quarterly, semi-annual, or annual — [plans/929](https://api.zid.sa/v1/market/public/apps/plans/929).
- 12 reviews, all 5★, Dec 2022–May 2025, praising service: "خدمة ممتازة ومتابعة مستمرة من مسؤولة التطبيقات" — [rates/929](https://api.zid.sa/v1/market/public/apps/rates/929).
- The embedded video is marketing, not a demo: "تصميم تطبيق هاتف يناسب متجرك الإلكتروني - لماذا يجب أن تفكر في امتلاك تطبيق لمتجرك الإلكتروني | Splendapp" — [YouTube oEmbed](https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=eO_ou_7nfxw&format=json).
- [SECONDARY] Splendapp is an Egyptian no-code SaaS founded in 2020. It also targets Shopify, WooCommerce, and others, and its FAQ lists a "push-notification manager, page builder, marketing analysis tools" — [Wamda](https://www.wamda.com/2022/01/splendapp-raises-pre-seed-round-fuel-expansion); [search summary of splendapp.com](https://splendapp.com/?p=21619). Its site sits behind a Cloudflare challenge and could not be read directly.

**Tajadad (تجدد, Zid app #2275) [PRIMARY]** — [Zid API description/2275](https://api.zid.sa/v1/market/public/apps/description/2275)
- "إنشاء تطبيق جوال… في 10 دقائق… باستخدام تقنيات الذكاء الاصطناعي". The listing is tagged "مدعوم بالذكاء الاصطناعي".
- Editor features:
  - "تصميم التطبيق بتخصيص كامل عن طريق تحريك العناصر"
  - "اختيار ثيم جاهز أو صنع ثيم خاص بك"
  - interactive elements: "القصص التفاعلية - صفحات مخصصة - عرض أفقي ورأسي للمنتجات - النوافذ المنبثقة - شريط الأقسام المتحرك - العداد التنازلي للعروض"
  - pushes linked to a product or category, abandoned-cart pushes
  - analytics integrations
- Fully self-serve flow: subscribe → activate → land in the Tajadad dashboard → "قم بإعداد التطبيق الخاص بك ومعاينته" → request publishing → review → publish.
- Plans: Basic (push) and Growth ("ميزات احترافية ومتقدمة") — [plans/2275](https://api.zid.sa/v1/market/public/apps/plans/2275).
- **Website:**
  - The page title says "امتلك تطبيق لمتجرك الالكتروني في ٢٤ ساعة", while the hero says "جاهز في ١٠ دقائق".
  - "من ألوان التطبيق وحتى شكل الأيقونات".
  - The higher tier adds "القصص التفاعلية Stories", popups, "صفحات مخصصة و متعددة", and analytics.
  - "فترة تجريبية مجانية ١٤ يوم".
  - The footer says © 2024.
  - Sources: [tajadad.app](https://tajadad.app/); [tajadad.app/features](https://tajadad.app/features)
- **Tutorial playlist:** 6 videos, 4 of them unavailable, posted about 2 years ago, 194 views. Titles include "شرح كامل لإعداد البنرات بالتطبيق" and "شرح كامل لإعدادات التطبيق على منصة تجدد" — [YouTube playlist](https://www.youtube.com/playlist?list=PLGWci_ea5WhlcKKklO2X7jWpJHFDCuHFR).
- **Showcase app:** "Yazan Store", seller "Khtwah", bundle `com.matjrah.yazanStore`. It has 0 ratings and its last update was 1 May 2024 — [iTunes lookup](https://itunes.apple.com/lookup?id=6466815531&country=sa).
- 0 Zid ratings — [Zid API](https://api.zid.sa/v1/market/public/apps/description/2275).

**Neoxero (تطبيقات نيوكسيرو, Zid app #5989) [PRIMARY]** — [Zid API description/5989](https://api.zid.sa/v1/market/public/apps/description/5989)
- "أول تطبيق موبايل متوافق مع نظام الثيمات الجديد من زد".
- "نفس الألوان، الخطوط، الأزرار، والتخطيطات. لا فروقات بصرية بين الموقع والتطبيق".
- "أي تعديل على الثيم أو المحتوى يظهر مباشرة في التطبيق. لا حاجة لإعادة بناء".
- Requires the theme to support Zid's new ("فاترن"/Vitrin) system. Activation is by email to support.
- Plans: Basic and "المخصصة" — [plans/5989](https://api.zid.sa/v1/market/public/apps/plans/5989).
- 0 ratings.
- The linked website is a generic software-house page, with no product detail, screenshots, or demo — [zidapp.neoxero.net](https://zidapp.neoxero.net/).

**Tatbiqi (منصة تطبيقي, Zid app #6949) [PRIMARY]** — [Zid API description/6949](https://api.zid.sa/v1/market/public/apps/description/6949)
- "تصميم مخصص بألوانك وشعارك", "مزامنة تلقائية مع زد", "لوحة تحكم احترافية: تحكم في البنرات، والإعدادات، والمحتوى، والإشعارات".
- Website — [tatbiqi.app](https://www.tatbiqi.app/):
  - "شريك معتمد لمنصة زد"
  - "دفع بنقرة واحدة (Apple Pay)… FaceID"
  - "إشعارات Push مجانية ١٠٠٪"
  - "استهداف جغرافي وحسب الجهاز"
  - "تحليلات الجمهور"
  - a mock abandoned-cart nudge: "إرسال إشعار وخصم 5%"
- The Zid plan description is copy-pasted from Neoxero's ("أول تطبيق جوال… متوافق مع نظام الثيمات الجديد"), which is odd — [plans/6949](https://api.zid.sa/v1/market/public/apps/plans/6949).
- 2 reviews (Aug 2026): "سرعة في الإنجاز وسرعة في اي تحديث" — [rates/6949](https://api.zid.sa/v1/market/public/apps/rates/6949).

### Inferences
- [INFERRED] Three product philosophies are competing:
  1. **Native mirror plus deep style overrides:** AppsBunches.
  2. **Native app with its own theme and section builder**, decoupled from the web theme: MT Themes, Tajadad, Splendapp, Salla's Default template.
  3. **Exact theme parity:** Neoxero, and Salla's WebView template.

  A founder must choose. Mirroring saves the merchant double work but inherits theme quirks. A separate builder gives app-native UX but doubles the merchandising effort.
- [INFERRED] MT Themes is the rival to benchmark for branding and engagement depth (dark mode, fonts, A/B pushes, chat). Its weaknesses are an Egypt-based support presence, publishing on its own store accounts, and very few reviews.
- [INFERRED] The "10 minutes" and "48 hours" claims mean time to a configured preview or APK, not time to App Store availability, which still needs developer accounts and review.

### Gaps
- No public screenshots or dashboard walkthroughs could be read for Splendapp (Cloudflare-blocked), Tatbiqi, or Neoxero. Zid listing slider images exist but were not machine-readable.
- Which shopper features each of these apps actually offers (guest checkout, wishlist, loyalty, filters, voice search) is not documented beyond marketing copy.
- No independent reviews of the apps these vendors built, except عالم الهزازي and Maspro.

---

## 4. Salla App Maker (صانع التطبيقات): editor and merchant configuration

### Takeaway
Salla's first-party App Maker is a self-serve, template-based native builder with a live preview. It offers three templates: Default (native), Menu (for restaurants), and WebView (theme parity).

Its branding controls are broader than AppsBunches' in several places:
- dark-mode toggle with separate light and dark backgrounds
- custom font upload
- six bottom-tab styles with up to 5 custom tabs
- onboarding screens (image or video)
- motion (animated) splash
- a 12-element home builder, including "طلبات سابقة" (reorder)
- product cards with quick-add, a quantity stepper, and option pickers

Design edits apply without a store resubmission. Salla claims 450+ launched apps and readiness 72 hours after the data is complete.

### Cited Findings

**Overview [PRIMARY]** — [salla.com/app-maker](https://salla.com/app-maker/)
- "تقنية السحب والإفلات… بعناصر متنوّعة… وبميزة المعاينة قبل الإطلاق".
- "سيكون تطبيقك جاهزًا خلال 72 ساعة".
- "450+ تطبيقًا أطلقه تجّار سلّة".
- "إشعارات مجّانية لا محدودة": instant or scheduled with an image, and automated (order tracking, abandoned carts).
- Integrations: Zendesk, gifting, Adjust, Intercom, Firebase, loyalty, Smartlook, size chart, OneSignal.
- Supported in SA, UAE, KW, QA, BH, and OM.
- After publishing, the design stays editable from the dashboard. Salla reviews submissions in 2–7 days when the merchant has company developer accounts.

**Live editing [SECONDARY]**
- Merchants "can update the app's interface at any time without submitting a new version to the app stores", and there are "ready-made templates such as the Default or Menu templates" — [Salla help center (search summary)](https://help.salla.sa/en/category/%D8%B5%D8%A7%D9%86%D8%B9-%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%D8%A7%D8%AA/x3x1uhi9h4dujzanmm5d6ik3).

**Templates and tabs [PRIMARY]** — [Salla help: ابدأ بتصميم التطبيق](https://help.salla.sa/article/%D8%A7%D8%A8%D8%AF%D8%A3-%D8%A8%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82/r4f54u89q3ivwaj9is0jc6qs); [Salla help: تطبيق المتجر category](https://help.salla.sa/category/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1/sgzgn084wdb6wxnv3om7fgst)
- The Default template is selected automatically, and the merchant can switch to other templates.
- Default-template editor tabs: Home, Categories (plus category templates), Top bar and tabs, Splash and onboarding, Product details page, General settings, Bottom tabs, Announcement bar, Product card.
- A dedicated article covers "دعم الصور المتحركة (الموشن)" (animated images in the splash).

**Home elements (Default template) [PRIMARY]** — [Salla help: الصفحة الرئيسية](https://help.salla.sa/article/%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A8%D8%A7%D9%84%D9%82%D8%A7%D9%84%D8%A8-%D8%A7%D9%84%D8%A7%D9%81%D8%AA%D8%B1%D8%A7%D8%B6%D9%8A-%D8%A7%D9%84%D8%B5%D9%81%D8%AD%D8%A9-%D8%A7%D9%84%D8%B1%D8%A6%D9%8A%D8%B3%D9%8A%D8%A9-1/dcekc1wac21wzj1kfqqmma60) (updated 31 Aug 2026)

The merchant adds elements with "+ إضافة عنصر جديد". The twelve elements:
1. **المدونة:** a carousel of articles; needs the blog app installed.
2. **طلبات سابقة:** "منتجات تم طلبها مسبقاً"; most-ordered or latest; maximum 10 products; shown only to logged-in users.
3. **عداد العروض:** links to a category, product, offers page, or brand; colour options.
4. **بانر عريض:** 428×268; sizes large, medium, or small; links to product, category, offers, page, brand, or an external URL.
5. **صور متحركة:** a slider; 1290×860 or 1290×574; 4 designs.
6. **آراء العملاء.**
7. **مميزات المتجر.**
8. **فيديو يوتيوب.**
9. **قائمة عناصر.**
10. **منتجات ثابتة.**
11. **منتجات متحركة.**
12. **خلفية المتجر.**

**General settings [PRIMARY]** — [Salla help: إعدادات عامة](https://help.salla.sa/article/%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A8%D8%A7%D9%84%D9%82%D8%A7%D9%84%D8%A8-%D8%A7%D9%84%D8%A7%D9%81%D8%AA%D8%B1%D8%A7%D8%B6%D9%8A-%D8%A5%D8%B9%D8%AF%D8%A7%D8%AF%D8%AA-%D8%B9%D8%A7%D9%85%D8%A9-1/p8p76kwdgvduehuyw57qigm2) (updated 26 Oct 2026)
- **Product card:**
  - "فرض تحديد خيارات المنتج"
  - price before and after discount
  - "الإضافة للسلة مع التحكم بالكميات" (a +/− stepper on the card)
  - 4 product-grid designs
  - wishlist button
  - maximum title characters
  - image display mode
- **Promo ribbon** ("العنوان الترويجي"): styles, top or bottom position, colour.
- **App appearance:**
  - transition-indicator style (3 kinds)
  - brand identity
  - "تفعيل المظهر الداكن"
  - font type, plus "رفع خط خاص" (custom font upload)
- **App background:** image, logo, or colour, with "خلفيات الوضع (الفاتح)" and "خلفيات الوضع (الداكن)".

**Product card article [PRIMARY]** — [Salla help: بطاقة المنتج](https://help.salla.sa/article/%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A8%D8%B7%D8%A7%D9%82%D8%A9-%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC-1/k14pnh15pbpy9tnz39a8cdpj)

Beyond the general settings, the card can show or control:
- discount %
- rating
- sub-category
- custom fields
- frame style (black border, grey shadow, or none)
- "إظهار خيارات المنتج في الإضافة السريعة" (colour and size picked in a quick-add sheet)
- add-button behaviour

**Product page [PRIMARY]** — [Salla help: صفحة المنتج](https://help.salla.sa/article/%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A8%D8%A7%D9%84%D9%82%D8%A7%D9%84%D8%A8-%D8%A7%D9%84%D8%A7%D9%81%D8%AA%D8%B1%D8%A7%D8%B6%D9%8A-%D8%B5%D9%81%D8%AD%D8%A9-%D8%AA%D9%81%D8%A7%D8%B5%D9%8A%D9%84-%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AC-1/r76nt355fwgfno5mear8b53s)
- Default vs. "التصميم الجديد".
- Options on a separate screen.
- Show or hide subtitle, promo text, and tags.
- A design for digital cards.

**WebView template [PRIMARY]** — [Salla help: قالب الويب فيو](https://help.salla.sa/article/%D8%AA%D8%B5%D9%85%D9%8A%D9%85-%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A8%D8%A7%D8%B3%D8%AA%D8%AE%D8%AF%D8%A7%D9%85-%D9%82%D8%A7%D9%84%D8%A8-%D8%A7%D9%84%D9%88%D9%8A%D8%A8-%D9%81%D9%8A%D9%88-webview/aa14wn5r3icmy91zwlswiix2) (updated 26 Oct 2026)
- "يعتمد على نفس تصميم المتجر… يتيح اختيار نسخة محددة من نسخ الثيم… يعكس التحديثات المطبقة على الثيم في التطبيق… يتكامل مع محرر الثيمات".
- **Bottom tabs:**
  - Six styles: icon with background, icon+title, icon only, icon with bottom bar, icon with dot, icon with top bar.
  - Colours for the bar, selected tab, and unselected tab.
  - Rename, reorder, hide, or add a tab linked to any page ("بشرط عدم تجاوز 5 تبويبات سفلية ظاهرة"), and change the icon.
- **Splash:** colour plus a 512×512 image, with optional motion.
- **Onboarding** ("شاشات الترحيب"): shown once after install; images (three sizes) or video; can be added, edited, hidden, or deleted.

**Menu template [PRIMARY]**
- "طريقة جذابة لعرض المنتجات والإشعارات والتخفيضات، بالإضافة لسهولة إدارة الطلبات" — [Salla help category listing](https://help.salla.sa/category/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1/sgzgn084wdb6wxnv3om7fgst).

**Store-metadata changes are also a purchased service [PRIMARY]**
- "شراء تحديث لبيانات التطبيق" lets the merchant edit basic data such as the name after publishing — [Salla help category listing](https://help.salla.sa/category/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1/sgzgn084wdb6wxnv3om7fgst).

### Inferences
- [INFERRED] Salla treats the app as a first-class sales channel inside the merchant dashboard (المتجر وقنوات البيع → تطبيق الجوال). Its configuration is simpler and more opinionated than AppsBunches' (about 12 home elements vs. about 60), but it covers the branding basics AppsBunches lacks: dark mode and custom font upload.
- [INFERRED] Offering both a native template and a WebView template is a hedge. It lets merchants choose between app-native UX and zero double-maintenance. A Zid-side competitor could offer the same choice.
- [INFERRED] Salla's reorder element ("طلبات سابقة"), the card quantity stepper, and quick-add option sheets are concrete repeat-purchase UX patterns for a Zid builder to match.

### Gaps
- No public screenshots or video of the App Maker dashboard were viewed: help articles embed images, but only the text was parsed.
- Salla-specific shopper-side features (guest checkout, search filters, loyalty or wallet screens in the app) were not documented in the articles read.
- How many of the 450+ apps use WebView vs. Default is unknown.

---

## 5. Cross-builder gaps, weaknesses, and UX pain points (opportunities)

### Takeaway
No local builder combines all four of the following:
- deep but *usable* customization: presets and AI rather than 200 raw knobs
- full self-serve branding: custom fonts, dark mode, icon and store-listing edits without tickets
- theme-agnostic, robust home rendering
- strong retention UX: reorder, in-app returns, live chat, smart out-of-stock handling

Each incumbent has some of these. AppsBunches has depth and mirroring but gates it heavily and still runs a ticketed workflow. Salla has polish and dark mode/fonts but a smaller element set. MT Themes has engagement depth but thin proof. The shopper complaints point to stability, speed, pricing transparency, and post-purchase self-service.

### Cited Findings

**Feature matrix: Y = verified in primary source; "?" = not found; N = documented absence**

| Capability | AppsBunches | Salla App Maker | MT Themes | Tajadad | Splendapp | Neoxero | Tatbiqi |
|---|---|---|---|---|---|---|---|
| Live preview editor | Y | Y | Y | Y | ? | ? | ? |
| Drag-and-drop home sections | Y | Y | Y | Y | Y (claim) | N/A (mirror) | ? |
| Changes without store release | Y (remote config) | Y | Y | Y | Y (claim) | Y (claim) | ? |
| Dark mode | ? (not found) | Y | Y | ? | ? | ? | ? |
| Custom font upload | N (5 bundled) | Y | N (9 AR + 9 EN list) | ? | ? | inherits theme | ? |
| Bottom-tab customization | Y (Ultra) | Y (6 styles, 5 tabs) | ? | ? | ? | ? | ? |
| Onboarding screens | ? | Y | ? | ? | ? | ? | ? |
| Reorder / previous orders | Y (section) | Y | ? | ? | ? | ? | ? |
| Live chat in app | N (WhatsApp button) | via Zendesk/Intercom | Y (add-on) | ? | ? | ? | ? |
| Push A/B testing | ? | ? | Y | ? | ? | ? | ? |
| AI design help | staging only | ? | AI chatbot (shopper-facing) | "AI" tag | ? | ? | ? |

Sources: Sections 1, 3, and 4 above.

**Ticketed or metered store-listing changes [PRIMARY]**
- AppsBunches: icon, description, and screenshots via "طلب تحديث" with a free quota, then a fee — [dashboard JS](https://build.appsbunches.com/assets/index-CqP64lrL.js).
- Salla: "شراء تحديث لبيانات التطبيق" — [Salla help](https://help.salla.sa/category/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1/sgzgn084wdb6wxnv3om7fgst).

**Onboarding friction [PRIMARY]**
- AppsBunches requires the merchant to create a OneSignal account and hand over its email and password, plus developer-account details and keystore files — [dashboard JS](https://build.appsbunches.com/assets/index-CqP64lrL.js).
- Salla and AppsBunches both write long D-U-N-S and Apple/Google account guides — [Salla help](https://help.salla.sa/category/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D9%85%D8%AA%D8%AC%D8%B1/sgzgn084wdb6wxnv3om7fgst); [zid.appsbunches.com](https://zid.appsbunches.com/).

**Over-complex editor and limited adoption [PRIMARY]**
- 146–214 controls per section. 83 of 572 stores changed the most-edited section — [13-basic-mode.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/13-basic-mode.js).

**Theme-dependency failures [PRIMARY]**
- 19 whitelisted themes; everything else falls back to a default.
- Heuristic classification of Zid AI sections.
- Sources: [04-core.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/04-core.js); [03-ai-sections.js](https://appsbunches.github.io/zid_appsbunche_app_mockup/v2/js/03-ai-sections.js)

**Shopper pain points [PRIMARY]**
- freezing and kick-outs
- Android crash loop on a Samsung S25
- slowness
- policy page not opening
- out-of-stock-heavy catalogue
- VAT shock at checkout
- Sources: Section 2 sources

### Inferences
Opportunities for a new product [INFERRED]:

1. **Opinionated design system plus an AI stylist in production.**
   - Ship 8–12 polished, vertical-specific presets (perfume, fashion, electronics, groceries) with sensible image ratios.
   - Expose 5–7 key knobs per section, using AppsBunches' own usage data as a guide.
   - Ship a natural-language Arabic editor that previews diffs. AppsBunches has built this but keeps it in staging.
2. **Branding completeness at every tier.** Offer dark mode, custom font upload, app-icon and splash changes, and store-listing metadata edits as self-serve flows, not paid tickets.
3. **Theme-agnostic rendering.** Combine a native renderer that reads Zid's theme settings with automatic fallback, a "pin section type" UI, and a WebView fallback per section, so that any theme, including AI-generated Zid sections, renders acceptably on day one.
4. **Frictionless onboarding.**
   - Never ask for third-party passwords (OneSignal, Apple, or Google).
   - Use App Store Connect API keys or Google service accounts, or invite-based access.
   - Provide a guided D-U-N-S, Apple, and Google enrolment wizard.
   - Bundle push infrastructure instead of requiring the merchant's own OneSignal account.
5. **Retention UX missing or weak in most builders:**
   - in-app returns and exchanges, which AppsBunches has only as one client's custom module
   - one-tap reorder, which Salla and AppsBunches each have only as a single home section
   - native live chat, beyond a WhatsApp deeplink
   - auto-hide or sort-last for out-of-stock items, plus back-in-stock alerts
   - VAT-inclusive price display
   - guest checkout by default
   - National Address autofill
6. **Quality as a feature.**
   - Publish crash-free and performance budgets.
   - Reduce binary size from the 75–132 MB observed.
   - Monitor Android stability on new devices.
   - Shopper reviews show these are the app-attributable failures.
7. **Honest rating prompts.** Use in-app review prompts gated on post-delivery satisfaction rather than contests, to build credible ratings.

### Gaps
- No direct hands-on test of any builder's merchant dashboard (all are login-gated). AppsBunches' editor was examined through its public code, not by using it with a real store.
- No crash or performance telemetry for any builder's apps.
- Salla-built apps' shopper reviews were not sampled, so the cross-builder shopper pain-point comparison is limited to AppsBunches and MT Themes apps.
- Whether Splendapp, Tatbiqi, or Neoxero support dark mode, custom fonts, or loyalty and wallet could not be verified.
