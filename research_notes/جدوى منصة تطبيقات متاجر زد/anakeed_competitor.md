# Competitor Profile: عناقيد التطبيقات (Anakeed / AppsBunches), the mobile-app builder for Zid merchants

Research date: 10 Nov 2026. All "current" facts were pulled live on that date unless another date is given.
Verification labels: **[PRIMARY]** comes straight from AppsBunches' own site, Zid's own help center or public market API, or Apple's own API/pages. **[INFERRED]** is my reasoning from primary data. **[UNVERIFIED]** means a claim I could not confirm.

---

## 1. What exactly does AppsBunches offer, feature by feature and plan by plan?

### Takeaway
AppsBunches sells a white-label native iOS + Android shopping app for Zid stores on a yearly subscription. There are four tiers: a free web-only "Explore" preview, Basic, Advanced, and Ultra. The features that drive revenue are mostly locked to Ultra: visitor abandoned-cart tracking, cart popups, image push, Google/Meta analytics, wishlists lists, loyalty/wallet/cashback, the in-app blog, and advanced UI customisation. On top of the subscription, automated notifications are billed per message from a prepaid credit balance.

### Cited Findings
- **Positioning [PRIMARY]:** The Zid product page is titled "تطبيق متجرك على زد" and badged "تطبيق عناقيد التطبيقات بالشراكة مع زد". It sells "إشعارات ذكية، سلات مُستعادة، براندنج حصري، وتحليلات متكاملة". The footer reads "تطبيق معتمد على منصة زد". — [zid.appsbunches.com](https://zid.appsbunches.com/)
- **Base features in every paid plan [PRIMARY]:** updates and support, an app under the merchant's own brand, and automatic Zid sync. The sync covers products, quantities and settings, categories (multi-level), extra pages, all of the store's payment gateways and shipping companies, Deep Links, a unified OneLink share link, a sidebar (categories, payment, shipping, VAT no.), social links, a floating WhatsApp icon, Arabic and English, and basic UI customisation (sections and colours). Every plan can also send push to all users and send out-of-stock and wishlist notifications. — [zid.appsbunches.com comparison table](https://zid.appsbunches.com/)
- **Basic plan description in the Zid market [PRIMARY]:** the app home screen is just "عرض جميع المنتجات بشكل مباشر", with no banners or custom images, and the plan "لا تقبل أي تعديل إضافي على التطبيق". Listed features: an iOS and Android app (AR/EN), product favourites, push notifications to users, and an app-only discount. — [Zid market API, plans/421](https://api.zid.sa/v1/market/public/apps/plans/421)
- **Advanced adds [PRIMARY]:** mirroring of the store home page (banners, sections, images, products, customer reviews), multi-inventory, loyalty points support, splash-screen editing, category-page design, product-card design, push to a specific user, scheduled push, basic automatic abandoned-cart notifications, advanced automatic abandoned-cart notifications, and order-status notifications. — [zid.appsbunches.com](https://zid.appsbunches.com/); [Zid plans API](https://api.zid.sa/v1/market/public/apps/plans/421)
- **Ultra only [PRIMARY]:** advanced per-element customisation (header, bottom bar, login, cart, reviews, buttons), "تصميم احترافي بهويتك", an announcement bar, removal of developer branding with editable copyright text, a visitor (guest) abandoned-cart table, an abandoned-cart popup, images in general push, Google/Meta analytics linking (the marketing copy also mentions Snapchat), the in-app promo popup, wishlist lists, customer loyalty points and redemption, customer wallet and cashback, a private in-app blog (categories, articles, images and video, visibility limited to chosen phone numbers), and a one-time D-U-N-S number extraction service. — [zid.appsbunches.com](https://zid.appsbunches.com/)
- **Voice search [PRIMARY]:** "بحث صوتي + بحث مخصص داخل التصنيف" appears in the Zid listing. The Ultra plan description names "بحث صوتي". — [Zid description API](https://api.zid.sa/v1/market/public/apps/description/421); [plans API](https://api.zid.sa/v1/market/public/apps/plans/421)
- **Notification credits [PRIMARY]:** the features marked * (abandoned-cart push to a specific user, advanced automatic cart push, cart popup, order-status push, in-app popup, out-of-stock and wishlist notifications) "تتطلب شحن رصيد إشعارات مسبقاً". The cost per notification is "تصل إلى 1 هللة فقط". — [zid.appsbunches.com](https://zid.appsbunches.com/)
  - Zid's help center contradicts this. It says "إشعارات التطبيق مجانية، وعددها غير محدود", and it calls the plan with abandoned-cart alerts "الباقة الاحترافية", a name that appears nowhere in the current plans. — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **Free "Explore" plan [PRIMARY]:** "استكشف تطبيق متجرك" costs 0 SAR. It is a web-only preview in the store's branding, "ولا تشمل النشر أو استقبال الطلبات والإشعارات الفعلية". The product page labels it "جديد · مجاناً بالكامل". — [Zid plans API](https://api.zid.sa/v1/market/public/apps/plans/421); [zid.appsbunches.com](https://zid.appsbunches.com/)
- **Self-reported performance claims [PRIMARY claim, not independently verified]:**
  - App vs web, "results on subscribed stores": revenue per user ~49 SAR vs ~2 SAR, session ~10 min vs seconds, 59+ pages per session vs ~2, repeat purchase 19% vs under 1%, conversion 4.6% vs 0.5%.
  - Aggregate: "+10 مليون مستخدم", "+2 مليون طلب", "+1.3 مليار ريال مبيعات" through its store apps.
  - — [zid.appsbunches.com](https://zid.appsbunches.com/); [Zid description API](https://api.zid.sa/v1/market/public/apps/description/421)
- **Merchant-side analytics inside Zid [PRIMARY]:** Zid's dashboard has a native page at Channels > Mobile App. It shows app-only orders, sales, average order value and discounts, and lists every app order. It also links to an "app download banner" for the web store and to a push-notification sender with delivery and tap-rate tracking. — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)

### Inferences
- [INFERRED] It is a single template codebase configured per merchant. Every plan shares the same sync features, and tiering is done with feature flags. The Explore plan ("خلال دقائق يتحوّل متجرك إلى نموذج تطبيق") shows they can render a store's app automatically, so the 10–20-day build is mostly packaging, store-submission and human QA work rather than coding.
- [INFERRED] Home-page mirroring depends on the theme: only Zid's own themes and AppsBunches' SDK themes are "efficiently" supported. That ties the app product to their theme business.

### Gaps
- No public API docs, SDK, or self-serve app editor documentation was found. The dashboard (build.appsbunches.com) is a login-gated JS app.
- Exact pricing of notification credit bundles (only "up to 1 halala per notification" is stated).

---

## 2. Plans and current published prices: is the founder's "3,300 / 5,500 / 18,000" correct?

### Takeaway
Basic **3,300 SAR/yr** and Advanced **5,500 SAR/yr** are correct. The top tier is called **"Ultra" (ألترا), not "Premium"**, and it is listed at **16,000 SAR/yr, not 18,000**. All plans bill yearly only. A "subscribe one year, get one year free" promotion is live on Advanced and Ultra, which halves the effective price in year one.

### Cited Findings
| Plan | Zid market price (SAR, per 365 days) | AppsBunches site | Promo |
|---|---|---|---|
| استكشف تطبيق متجرك (Explore) | 0 | "مجاناً بالكامل" | — |
| الباقة الأساسية (Basic) | 3,300.01 | 3,300 ريال / سنة ("للبداية") | none |
| الباقة المتقدمة (Advanced) | 5,500.45 | 5,500 ريال / سنة ("الأكثر طلباً") | "اشترك سنة واحصل على سنة مجانًا" |
| ألترا (Ultra) | 16,000.00 | 16,000 ريال / سنة ("الأقوى") | "اشترك سنة واحصل على سنة مجانًا" |
— [Zid market plans API (live 10 Nov 2026)](https://api.zid.sa/v1/market/public/apps/plans/421); [zid.appsbunches.com pricing table](https://zid.appsbunches.com/)

- `invoice_period: 365` for every plan, with no monthly option. No plan has a free trial (`hasFreeTrial: false`) or one-time setup fees (`one_time_fees: 0`). — [Zid plans API](https://api.zid.sa/v1/market/public/apps/plans/421)
- The promo is a `buy_x_get_y` offer with `offer_period: 365` on Advanced (offer id 652) and Ultra (offer id 651). The listing is tagged "عروض اليوم الوطني" (Saudi National Day offers). — [Zid plans API](https://api.zid.sa/v1/market/public/apps/plans/421); [Zid description API](https://api.zid.sa/v1/market/public/apps/description/421)
- **Historical price check [PRIMARY, dated 15 Dec 2024]:** a Zid help-center article listed "الباقة الأساسية: 3300.01 ر.س \ سنوياً" and "الباقة المتقدمة: 5500 ر.س \ سنوياً". Basic and Advanced prices therefore haven't changed for at least ~2 years. — [intercom.help/zid article 8352507](https://intercom.help/zid/ar/articles/8352507-%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83-%D8%A8%D8%AE%D8%AF%D9%85%D8%A9-%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%84)
- Zid's current help center (updated 2 Nov 2026) names other plans, "الأساسية / المتقدمة / المسار السريع (Fast Track)" plus "الاحترافية", and gives no prices. The Fast Track plan "مزايا المتقدمة مع نسخة تجريبية أسرع". These names don't match the current market listing (Explore/Basic/Advanced/Ultra). — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- Upgrading from Basic to Advanced means paying the difference from the AppsBunches app page in the Zid dashboard. — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **Competitor price context, same Zid category "تطبيقات الجوال للمتجر" (id 66) [PRIMARY]:**
  - سبلينداب (Splendapp): from 1,300.01 SAR per 3 months, 12 ratings
  - منصة تطبيقي: from 3,335 SAR/yr, 2 ratings
  - تطبيقات نيوكسيرو: from 5,999.99 SAR/yr, 0 ratings
  - ام تي ثيمز: 14-day free trial, 5 ratings
  - تجدد: from 2,999 SAR/yr, 0 ratings
  - AppsBunches has the most ratings in the category (56).
  - — [Zid market API, category 66](https://api.zid.sa/v1/market/public/apps?app_category_ids[]=66&per_page=50)

### Inferences
- [INFERRED] With the promo, the effective yearly cost over two years is ~2,750 SAR for Advanced and ~8,000 SAR for Ultra.
- [INFERRED] The "Premium 18,000" figure was probably an older Ultra price or a sales quote. The jump from Advanced (5,500) to Ultra (16,000) is ~2.9×. That big gap separates "basic catalogue app" from "growth/retention features", and it is a natural place for a competitor to price into.
- [INFERRED] Zid plan IDs hint at the order plans were added: Advanced = id 86 (oldest), Basic = 247, Ultra = 2828, Explore = 3746 (newest). So Advanced was the original product, Basic came next, Ultra arrived much later, and the free Explore tier is the most recent.

### Gaps
- Whether the listed prices include 15% VAT is not stated.
- Exact price history of Ultra (and whether it was ever 18,000) is [UNVERIFIED]. The Wayback Machine has no usable captures of the JS-rendered pricing.
- Fast Track and "Professional" plan prices could not be found.

---

## 3. Marketplace presence (Zid App Market, Salla App Store) and merchant ratings

### Takeaway
On Zid it is app **#421** in the "تطبيقات الجوال للمتجر" category, with a perfect **5.0 from 56 reviews**, all 5-star, dated Apr 2022 to Sep 2026. Zid also embeds it natively: the dashboard's Channels > Mobile App "Create your app now" button sends merchants to AppsBunches' listing, and Zid's help center calls it "شريكة زد". I found **no AppsBunches mobile-app listing on the Salla App Store**.

### Cited Findings
- **Zid listing [PRIMARY]:** app id 421, name "عناقيد التطبيقات", developer "عناقيد التطبيقات" (name_en "Apps Bunches"). `is_embedded: true`, category 66 "تطبيقات الجوال للمتجر". `rate: {avg_rate: 5, total_rating: 56}`. Plan label "خطة مجانية متاحة". Developer email Apps@AppsBunches.com, phone +966 53 233 1339, website zid.appsbunches.com. — [Zid market API, description/421](https://api.zid.sa/v1/market/public/apps/description/421); listing UI at [apps.zid.sa/application/421](https://apps.zid.sa/application/421)
- **Install counts:** the Zid public API and listing expose none.
- **Review distribution [PRIMARY]:** 56 of 56 reviews are 5 stars. By year: 2022 = 11 (first on 12 Apr 2022), 2023 = 25, 2024 = 12, 2025 = 7, 2026 = 1 (6 Sep 2026, text "ممتاز"). — [Zid market API, rates/421](https://api.zid.sa/v1/market/public/apps/rates/421)
- **What reviewers praise [PRIMARY]:**
  - Speed of delivery: "انتهى العمل قبل موعده المحدد" (عوسج, Jun 2022); "اسرع احد يسوي تطبيق" (دايت واتشرز, Aug 2023)
  - Responsive support and after-sales: "خدمات ما بعد البيع رهيبه" (دخوني, Sep 2023); "اي تطوير او طلبات يتم تلبيتها فورا" (الريف الثلاثي, Sep 2022)
  - Fixing Google Play problems and continuous updates (رسيل, Sep 2022)
  - Sales impact: "فعلا زادت مبيعاتنا" (جوي قيمز, Jun 2023)
  - A conversion claim from تيجان قولد (Nov 2025): app conversion 5–7× higher than the web store
  - Custom requests honoured "حسب الإمكانية" (Youshop, Jul 2023)
  - — [Zid rates API](https://api.zid.sa/v1/market/public/apps/rates/421)
- **Complaints [PRIMARY]:** none appear on Zid. The listing shows no negative reviews. — [Zid rates API](https://api.zid.sa/v1/market/public/apps/rates/421)
- **Zid's native integration [PRIMARY]:** Zid's help center page (last updated 2 Nov 2026) says merchants open Channels > Mobile App and press "إنشاء تطبيقك الآن", which "تُفتح صفحة تطبيق الجوال في سوق التطبيقات". It adds: "تبني عناقيد التطبيقات، شريكة زد، تطبيقك وتنشره". The same page has a Zid-native performance dashboard for app orders. — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **Salla [PRIMARY negative evidence]:** AppsBunches' own Zid product page, its Zid listing and Zid's help center describe the mobile-app product as Zid-only. AppsBunches' main site lists only themes and customisation for Salla. Arabic and English searches for an AppsBunches listing on apps.salla.sa returned nothing. — [appsbunches.com](https://www.appsbunches.com/); [themes.appsbunches.com](https://themes.appsbunches.com/)

### Inferences
- [INFERRED] A uniform 5.0 with no critical reviews, nearly all praising service rather than product features, suggests the reviews were solicited from satisfied customers. Their pace is slowing too: 25 in 2023, 7 in 2025, 1 in 2026, while new apps kept launching. As a signal of merchant satisfaction, the ratings are weak.
- [INFERRED] Zid's "Channels > Mobile App" entry point makes AppsBunches the de-facto default mobile-app vendor on Zid. That distribution advantage is the hardest thing for a new entrant to match, since no other category-66 vendor appears to get this placement.
- [INFERRED] Salla is the open flank: AppsBunches has no Salla mobile-app product.

### Gaps
- Number of Zid installs or active subscribers (not public).
- Salla App Store presence could not be checked directly (JS-rendered store; no public API found). "Not present" rests on negative search evidence only.
- No independent forum, X or Reddit merchant complaints were found.

---

## 4. History: founding, company identity, Zid/Salla launch, funding, awards, and a reconstructed timeline

### Takeaway
AppsBunches is a Riyadh software agency founded in mid-2012 (CR 1010344677). It started as a general iOS/Android and web development shop, pivoted to e-commerce (Zid/Salla themes and the Zid app) around 2022, and became a Zoho partner in 2025. It has no public changelog. App Store data shows the Zid app business has been running at scale since 2022, adding roughly 20–40 merchant apps a year.

### Cited Findings
- **Founding [PRIMARY]:** "انطلقت عناقيد التطبيقات منتصف عام 2012م — شركة سعودية مقرها الرياض". — [zid.appsbunches.com](https://zid.appsbunches.com/)
- **Legal and registry [PRIMARY]:** commercial registration "1010344677", VAT no. "302167355900003". The site claims "2300+" completed projects overall. — [appsbunches.com](https://www.appsbunches.com/)
- **Apple seller entities [PRIMARY]:** two accounts.
  - "Apps Bunches", seller "Apps Bunches Co", artistId 912272175
  - "Apps Bunches Solutions LTD", artistId 1626104354
  - — [iTunes lookup, 912272175](https://itunes.apple.com/lookup?id=912272175&entity=software&country=sa&limit=200); [iTunes lookup, 1626104354](https://itunes.apple.com/lookup?id=1626104354&entity=software&country=sa&limit=200)
- **Company milestones from its own site [PRIMARY, self-reported]:**
  - 2012: founded in Riyadh
  - 2014: iOS/Android app development
  - 2017: expansion into web and digital systems and consulting
  - 2019: government and enterprise projects, including data analytics
  - 2022: "التخصص في التجارة الإلكترونية", building themes and solutions for Zid and Salla
  - 2025: "شراكة Zoho وجائزة التميز", described as a certified Zoho partner that won "أكثر شريك متفاعل لعام 2025". From context this is a Zoho partner award, not a Zid one.
  - — [appsbunches.com](https://www.appsbunches.com/)
- **Web presence [PRIMARY]:** the earliest Wayback capture of appsbunches.com is 19 Oct 2013. The earliest capture of the dashboard build.appsbunches.com is 25 Aug 2023. — [Wayback CDX appsbunches.com](http://web.archive.org/cdx/search/cdx?url=appsbunches.com&output=txt&fl=timestamp,statuscode,length&collapse=timestamp:6); [Wayback CDX build.appsbunches.com](http://web.archive.org/cdx/search/cdx?url=build.appsbunches.com&output=txt&fl=timestamp,statuscode,length&collapse=timestamp:6)
- **Zid partnership [PRIMARY]:**
  - The first Zid market review is dated 12 Apr 2022.
  - A Zid help article (15 Dec 2024) described the service as delivered by "فريق عناقيد التطبيقات".
  - Zid's help center (2 Nov 2026) calls AppsBunches "شريكة زد".
  - — [Zid rates API](https://api.zid.sa/v1/market/public/apps/rates/421); [intercom.help/zid 8352507](https://intercom.help/zid/ar/articles/8352507-%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83-%D8%A8%D8%AE%D8%AF%D9%85%D8%A9-%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%A7%D9%84%D8%AC%D9%88%D8%A7%D9%84); [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **Merchant app launches per year, from Apple's API [PRIMARY]:** these are iOS apps still live in the Saudi storefront under the two AppsBunches seller accounts (154 total), counted by first-release year:

| Year | Apps Bunches Co | Apps Bunches Solutions LTD | Total |
|---|---|---|---|
| 2019 | 0 | 2 | 2 |
| 2020 | 4 | 2 | 6 |
| 2021 | 2 | 0 | 2 |
| 2022 | 9 | 17 | 26 |
| 2023 | 5 | 35 | 40 |
| 2024 | 2 | 35 | 37 |
| 2025 | 5 | 18 | 23 |
| 2026 (to 25 Oct) | 15 | 3 | 18 |

  — [iTunes lookup 912272175](https://itunes.apple.com/lookup?id=912272175&entity=software&country=sa&limit=200); [iTunes lookup 1626104354](https://itunes.apple.com/lookup?id=1626104354&entity=software&country=sa&limit=200)

- **Bundle-ID evidence [PRIMARY]:**
  - Early apps use bundle IDs like `store.sulinda.com` (2020), `store.zid.sanabelraghd.zstore` (Jun 2020) and `store.raseel.zstores` (Mar 2021).
  - The first `com.appsbunches.*` bundle is لحوم ساقية, released 10 Mar 2022.
  - Merchant-owned apps carry migration traces: Reefi uses `com.salla.reefi`, and nssqi uses `com.splend.nasqicomapp.SA`.
  - — same iTunes lookups; [iTunes lookup Reefi](https://itunes.apple.com/lookup?id=1594619585&country=sa)
- **Funding:** none found. No funding round, investor or acquisition news turned up in Arabic or English searches.

### Reconstructed timeline (no official changelog exists)
- mid-2012: founded in Riyadh. [PRIMARY, self-reported]
- Oct 2013: website live. [PRIMARY, Wayback]
- 2014: mobile app development begins. [PRIMARY, self-reported] The "Apps Bunches" Apple account ID 912272175 has a magnitude consistent with ~2014 creation. [INFERRED]
- Apr–May 2020: first surviving e-commerce store apps on the Apple account (Sulinda, wowforbeauty, برهان, D'ORO). [PRIMARY]
- Jun 2020 – Mar 2021: apps with `zid…zstore(s)` bundle IDs. [PRIMARY] This suggests involvement with Zid store apps before the formal app-market listing. [INFERRED]
- Mar 2022: `com.appsbunches.*` bundle naming begins, a sign of the templated product. [PRIMARY]
- Apr 2022: first Zid app-market review, so the Zid listing #421 was live by then. [PRIMARY]
- mid-2022: second Apple account "Apps Bunches Solutions LTD" (ID 1626104354) starts publishing. [PRIMARY] Its first appsbunches-bundle app shipped 25 Aug 2022.
- 2022: "e-commerce specialisation" with Zid and Salla themes. [PRIMARY, self-reported]
- 2023–2024: peak velocity, ~40 and ~37 new iOS apps per year. [PRIMARY]
- Aug 2023: dashboard build.appsbunches.com first archived. [PRIMARY]
- 15 Dec 2024: Zid help article shows Basic 3,300.01 and Advanced 5,500 SAR/yr. [PRIMARY]
- 2025: Zoho partnership and the "most engaged partner 2025" award (Zoho). [PRIMARY, self-reported]
- 2025–2026: Ultra tier (16,000 SAR) and the free "Explore" web preview (labelled "جديد") are added. [PRIMARY for existence; INFERRED for timing, from plan IDs]
- 2 Nov 2026: Zid's help center documents the native "Channels > Mobile App" page, which routes merchants to AppsBunches. [PRIMARY]

### Inferences
- [INFERRED] The merchant-app business looks like roughly 150–200+ live apps: 154 under AppsBunches' own Apple accounts, plus an unknown number under merchants' accounts. New launches peaked in 2023–2024 and slowed in 2025.
- [INFERRED] The `com.salla.reefi` and `com.splend.*` bundles show AppsBunches winning merchants from Salla's app offering and from Splendapp. Migrating existing apps is part of their playbook.
- [INFERRED] "Solutions LTD" in an Apple seller name usually signals a separately registered entity, possibly foreign-registered. That entity's registration is unverified.

### Gaps
- No public changelog or "what's new" feed; App Store release notes are generic ("تحسينات عامة وإصلاح بعض الأخطاء").
- LinkedIn and X (@AppsBunches) posts could not be fetched, so dated announcements couldn't be read.
- Founder or owner names were not found in any primary source. A person named on the site ("محمد أحمد جعفر آل الشيخ") is a theme-testimonial author, not a founder.
- Exact Zid-market launch date for listing #421, and any formal Zid partnership agreement date.
- Registration details of "Apps Bunches Solutions LTD".

---

## 5. Delivery model: build time and who owns the Apple/Google developer accounts

### Takeaway
It is a done-for-you service, not self-serve. The steps are: subscribe in the Zid market, fill a request form in the AppsBunches dashboard, receive a test build, approve it, and AppsBunches publishes it. Zid's help center says the build takes **10–20 business days**, plus **2–14 days** of Apple/Google review. The merchant is supposed to own **company** developer accounts on both stores. If they have none, AppsBunches publishes on its own Apple "sub-accounts" (Apple only) and promises a free transfer later. In practice, 154 live iOS store apps sit on AppsBunches' own Apple seller accounts.

### Cited Findings
- **Timeline [PRIMARY]:** "من 10 إلى 20 يوم عمل بعد تعبئة نموذج الطلب والتأكد من بياناته". Store review "تستغرق عادة من يومين إلى 14 يومًا من اعتمادك النسخة التجريبية". — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **The 7 steps [PRIMARY]:**
  1. Subscribe.
  2. Get a password-reset email.
  3. Fill in the contact-details form.
  4. Submit "طلب إنشاء تطبيق" in the AppsBunches dashboard.
  5. Receive a full test build.
  6. After approval, "يتم الرفع على حساب المطورين الخاص بكم".
  7. Go live.
  - — [zid.appsbunches.com](https://zid.appsbunches.com/); [Zid description API](https://api.zid.sa/v1/market/public/apps/description/421)
- **Developer-account policy [PRIMARY]:**
  - "يلتزم التاجر بإنشاء حساب مطورين (شركة) في Apple / Google".
  - Without one, the app can go on "حسابات عناقيد الفرعية مجاناً في منصة Apple فقط (إذا كان متوافقاً مع سياسات Apple)".
  - "نلتزم بنقل التطبيق إلى حساب المطور الخاص بالتاجر مجاناً في أي وقت".
  - — [zid.appsbunches.com](https://zid.appsbunches.com/)
  - Zid's help center says the same and adds the costs: Apple $99/yr (needs a D-U-N-S number and a public website on the company's domain), Google $25 one-time (organisation account). — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **Observed reality on iOS [PRIMARY]:** 112 apps are live in the Saudi storefront under "Apps Bunches Solutions LTD" and 42 under "Apps Bunches Co". Example: متجر الشنب lists seller "Apps Bunches Solutions LTD" and copyright "عناقيد التطبيقات © Apps Bunches". — [iTunes lookup 1626104354](https://itunes.apple.com/lookup?id=1626104354&entity=software&country=sa&limit=200); [iTunes lookup 912272175](https://itunes.apple.com/lookup?id=912272175&entity=software&country=sa&limit=200); [App Store: متجر الشنب](https://apps.apple.com/app/id6738126180)
- **Observed reality on Android [PRIMARY]:** Google Play developer pages for "Apps Bunches", "Apps Bunches Co" and "Apps Bunches Solutions LTD" return Not Found. Example apps sit under merchant accounts: Avon Cake's `com.appsbunches.avoncake` is under developer "Avon Cake" with 1,000+ installs. — [Google Play: Avon Cake](https://play.google.com/store/apps/details?id=com.appsbunches.avoncake)
- **D-U-N-S service [PRIMARY]:** D-U-N-S extraction is a one-time service included only in Ultra, and "اطلب الخدمة بشكل مستقل" for others. — [zid.appsbunches.com](https://zid.appsbunches.com/)
- **Support and renewal [PRIMARY]:** support runs "طوال مدة الاشتراك". The subscription is "سنة واحدة، وينتهي الاشتراك إن لم تجدده". The app name can be changed at the next update. — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **Apple policy [PRIMARY]:** App Review Guideline 4.2.6 says apps from "a commercialized template or app generation service will be rejected unless they are submitted directly by the provider of the app's content", and that such services "should not submit apps on behalf of their clients". — [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Inferences
- [INFERRED] Publishing ~150 template-based client apps under the vendor's own Apple accounts is in tension with Guideline 4.2.6. That is platform risk both for AppsBunches and for the merchants whose apps live on those accounts. If Apple acted on an account, many merchant apps could be pulled at once. A competitor that requires merchant-owned accounts, and automates the D-U-N-S and Apple enrolment process, could pitch "you own your app" as a differentiator.
- [INFERRED] Android has no vendor-account fallback, so every merchant must open a Google Play organisation account. That is a real onboarding friction point to automate.
- [INFERRED] Fleet maintenance is batch-driven. 90 of the 112 Solutions LTD apps got an update between Sep and Nov 2026, so AppsBunches rebuilds and pushes the whole fleet at once. This is a real strength in keeping up with iOS/Android SDK changes.

### Gaps
- What happens to the app, and to the store listing on AppsBunches' account, if a merchant stops paying. Neither AppsBunches nor Zid states it.
- Who owns the source code and binaries; no terms of service were readable (the build.appsbunches.com/terms page is JS-rendered and returned empty).
- Real-world delivery times, as opposed to the stated 10–20 business days.

---

## 6. Example merchant apps built by AppsBunches

### Takeaway
The built apps are generally well rated by consumers: the median is about 4.7★ across 83 apps with 20+ ratings. They are updated frequently (monthly to quarterly, in fleet-wide batches), but release notes are generic. A few apps are poorly rated.

### Cited Findings
All data comes from Apple's iTunes lookup API (SA storefront) on 10 Nov 2026.

| App | Plan / account | First release | Current version (date) | Rating (count) |
|---|---|---|---|---|
| برفيوم كو perfume co (id6474072726) | Solutions LTD account | 2 Jan 2024 | v2.0.3 (22 Oct 2026) | 4.75 (2,509) |
| Sulinda - سوليندا (id1508013932) | Apps Bunches Co account | 21 Apr 2020 | v2.2.2 (6 Oct 2026) | 4.73 (2,312) |
| العطاوي للإتصالات (id6739163515) | Solutions LTD | 18 Dec 2024 | v1.0.6 (9 Sep 2026) | 4.80 (2,122) |
| روكسا ROXA (id1671575224) | Solutions LTD | 16 Feb 2023 | v1.1.10 (9 Nov 2026) | 4.64 (1,799) |
| التميمي للأقمشة الرجالية (id6443975349), named as an **Ultra** example | Apps Bunches Co | 12 Nov 2022 | v1.1.0 (7 Oct 2026) | 4.73 (969) |
| هوست - Host (id1632184823), named as a **Basic** example | Apps Bunches Co | 13 Jul 2022 | v1.1.4 (21 Oct 2026) | 4.82 (114) |
| ريفي Reefi (id1594619585), named as an **Advanced** example | merchant's own account (HAPPINESS EXPERTS TRADING COMPANY), bundle `com.salla.reefi` | 11 Nov 2021 | v4.3.9 (24 Aug 2026) | 4.68 (6,394) |
| سيار Sayyar (id1542643577), named as an **Advanced** example | merchant's own account (Sayyar Trading Company LLC) | 8 Feb 2021 | v2.2.9 (11 Oct 2026) | **2.84 (171)** |
| افون كيك Avon Cake (id6502334880), "custom design" example | merchant account AVON CAKE COMPANY | 10 Jan 2025 | v2.0 (24 Oct 2026) | 4.77 (560); Google Play 1,000+ installs |
| لنا لهم صكة (id532250011), "two apps in one" custom example | merchant account | 10 Jun 2012 (pre-existing app) | v5.1.1 (1 Sep 2026) | 4.5 (10,311) |

— Sources: [iTunes lookup 1626104354](https://itunes.apple.com/lookup?id=1626104354&entity=software&country=sa&limit=200); [iTunes lookup 912272175](https://itunes.apple.com/lookup?id=912272175&entity=software&country=sa&limit=200); plan examples from [Zid description API](https://api.zid.sa/v1/market/public/apps/description/421) and [zid.appsbunches.com](https://zid.appsbunches.com/); [Google Play Avon Cake](https://play.google.com/store/apps/details?id=com.appsbunches.avoncake)

- **Version history sample [PRIMARY]:** متجر الشنب went 1.0 (4 Dec 2024), 1.0.1 (12 Feb 2025), 1.0.2 (13 Feb 2025), 1.0.3 (10 Apr 2025), 1.0.4 (21 Apr), 1.0.5 (22 Sep). Release notes are mostly "تحسينات في الأداء". Size is ~80.8 MB, minimum iOS 15. — [App Store: متجر الشنب](https://apps.apple.com/app/id6738126180)
- **Fleet stats for the Solutions LTD account [PRIMARY]:** 26,010 total ratings, a median 4.71★ among the 83 apps with 20+ ratings, and a median binary size of ~88 MB. Most apps (94 of 112) require iOS 15.0+. — [iTunes lookup 1626104354](https://itunes.apple.com/lookup?id=1626104354&entity=software&country=sa&limit=200)
- **Low-rated outliers [PRIMARY]:**
  - خروف صح: 1.91 (11 ratings), last updated Apr 2023
  - برادو: 2.8 (15), last updated Feb 2023
  - دايت تايم: 3.0 (2)
  - راير rare: 3.67 (6)
  - My car: 4.11 (94)
  - — [iTunes lookup 1626104354](https://itunes.apple.com/lookup?id=1626104354&entity=software&country=sa&limit=200)

### Inferences
- [INFERRED] Consumer ratings are healthy, but they mix in merchant fulfilment quality, so they only loosely reflect the app technology. Sayyar's 2.84 is the notable weak spot among the showcased examples.
- [INFERRED] Some apps were abandoned (e.g., not updated since 2023, likely churned subscriptions) yet are still listed under AppsBunches' account.

### Gaps
- Google Play install counts for most apps (only Avon Cake was retrieved). No "Powered by AppsBunches" string was checked inside the apps.
- I couldn't retrieve App Store review text for these apps (Apple's RSS review feed returned nothing), so consumer complaint themes are unknown.

---

## 7. Other services the company offers

### Takeaway
AppsBunches is a diversified agency, not a pure SaaS company. Besides the Zid app it sells Zid/Salla themes (its SDK themes double as the best-supported themes for its app), custom store builds, Zoho implementations, and general software, web and app development.

### Cited Findings
- **Services [PRIMARY]:** technical consulting, brand identity, UI/UX, e-commerce themes and solutions for Zid and Salla, iOS/Android development, and Zoho integration. The products listed are zid.appsbunches.com, zohocrm.appsbunches.com, zohosalesiq.appsbunches.com and zohobooks.appsbunches.com. — [appsbunches.com](https://www.appsbunches.com/)
- **Themes [PRIMARY]:** themes.appsbunches.com lists الأصايل (Zid and Salla), إبراق, رونق and فرح (Zid), with الدانة and سُلاف "coming soon". The header claims "7 ثيمات احترافية". It also shows custom SDK store builds for brands including Avon Cake. — [themes.appsbunches.com](https://themes.appsbunches.com/)
- **App and theme coupling [PRIMARY]:** the app "يدعم تخصيص الواجهة الرئيسية بكفاءة مع ثيم الأصايل وثيمات زد". Third-party or custom themes need integration work from the theme developer. Zid's help center also names AppsBunches' SDK themes (الأصايل، فرح، إبراق، رونق) as supported. — [zid.appsbunches.com](https://zid.appsbunches.com/); [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- **Other channels [PRIMARY]:** a support portal (support.appsbunches.com, Zoho Desk), demo booking through Zoho Bookings, an ambassador/referral programme ("انضم إلى سفراء عناقيد"), and social accounts @appsbunches on Instagram, X and YouTube plus LinkedIn "apps-bunches". — [zid.appsbunches.com](https://zid.appsbunches.com/); [appsbunches.com](https://www.appsbunches.com/)
- **Ecosystem [PRIMARY, third party]:** an upsell app for Zid, "تاسك اب", is described as integrating with AppsBunches apps. — [katheeb.net](https://katheeb.net/platform/zid/apps/%D8%AA%D8%B7%D8%A8%D9%8A%D9%82-%D8%AA%D8%A7%D8%B3%D9%83-%D8%A7%D8%A8-%D9%84%D9%85%D8%AA%D8%A7%D8%AC%D8%B1-%D8%B2%D8%AF/)

### Inferences
- [INFERRED] Agency DNA (custom work, human onboarding, high-touch support) explains both the strong service reviews and the slow, non-self-serve delivery. A product-led competitor would win on speed and self-service, but must match their support reputation.

### Gaps
- Revenue, headcount and the share of revenue from the Zid app are not public.

---

## 8. Apparent weaknesses and openings for a competitor (synthesis)

### Takeaway
AppsBunches is entrenched on Zid: it is the native default in Zid's dashboard, has the most reviews in its category, runs ~150+ live apps, has been around since 2012, and is liked by merchants. Its weak points are its pricing structure, the manual delivery model, Apple-account and ownership risk, theme dependence, and having no Salla app product.

### Cited Findings
- Growth features are concentrated in the 16,000 SAR Ultra plan: analytics, visitor carts, popups, image push, loyalty and wallet, and the blog. Advanced is 5,500 SAR. — [zid.appsbunches.com](https://zid.appsbunches.com/)
- Basic is a bare product grid: "لا تعرض بنرات أو صور مخصصة... ولا تقبل أي تعديل إضافي". — [Zid plans API](https://api.zid.sa/v1/market/public/apps/plans/421)
- Notification usage is charged on top of the subscription through prepaid credits. — [zid.appsbunches.com](https://zid.appsbunches.com/)
- Billing is yearly only, with no monthly plan or trial on paid tiers. — [Zid plans API](https://api.zid.sa/v1/market/public/apps/plans/421)
- Time to launch is 10–20 business days plus 2–14 days of store review. — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app)
- Many apps are on vendor-owned Apple accounts, which sits uneasily with Apple Guideline 4.2.6. — [iTunes lookup](https://itunes.apple.com/lookup?id=1626104354&entity=software&country=sa&limit=200); [Apple guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Home-page mirroring depends on Zid's or AppsBunches' own themes; custom themes need extra integration. — [zid.appsbunches.com](https://zid.appsbunches.com/)
- Public plan names don't match between Zid's help center (Basic/Advanced/Fast Track/"Professional", plus "free unlimited notifications") and the live listing (Explore/Basic/Advanced/Ultra, plus paid notification credits). — [help.zid.sa/ar/mobile-app](https://help.zid.sa/ar/mobile-app); [Zid plans API](https://api.zid.sa/v1/market/public/apps/plans/421)

### Inferences
- [INFERRED] The likely openings are:
  - A monthly plan, or a cheaper mid-tier that includes analytics and abandoned-cart tools.
  - Self-serve, same-week publishing with automated Apple/Google enrolment help.
  - Guaranteed merchant ownership of accounts and builds.
  - Theme-agnostic home-page rendering.
  - A Salla product, where AppsBunches has no app offering.
- [INFERRED] The main barrier is distribution. Zid's dashboard sends merchants to AppsBunches by default, and Zid's help center names it as partner. Displacing that relationship, or getting equal placement, would probably need a direct deal with Zid.
- [INFERRED] Merchant reviews show no product complaints, and the main praise is speed and support. Competing on "better service" alone is unlikely to work. Price, speed to launch, ownership and features are stronger angles.

### Gaps
- No churn data, merchant complaint data, or independent satisfaction data beyond solicited marketplace reviews.
- Whether Zid's partnership with AppsBunches is exclusive is unknown.
