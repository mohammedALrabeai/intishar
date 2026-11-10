# Mobile Shopping App UX Best Practices and Saudi/Arabic Shopper Expectations (for a White-Label Zid Store App Template)

Research date: 2026-11-10. Sources are dated where possible. Baymard's full guideline text is behind its Premium paywall, so Baymard figures below come from its free articles. Where figures came only from search snippets or secondary blogs, that is flagged.

---

## 1. What does Baymard's 2024–2026 mobile app / m-commerce research say about home, navigation, search, product lists, product pages, cart and checkout?

### Takeaway
Even the biggest retailers' apps are weak: 71% of 30 benchmarked US/EU apps perform "mediocre" or worse, and none rate "good" (2026). The most common failures are fixable template decisions: no visible "Shop/Categories" path, oversized homepage ads, no search submit button, poor autocomplete and typo handling, no pinch-to-zoom, tall carousels, missing essential filters and sorts, and checkouts that push account creation and hide delivery dates. A template that gets these defaults right would beat most incumbents.

### Cited Findings

**Benchmark context**
- Baymard's 2026 Mobile App benchmark covers 30 leading US/EU ecommerce apps, 11,000+ scored UX elements and 380+ guidelines in 39 topics. 71% of apps perform "mediocre" or worse. 67% are "mediocre", 29% "decent", one is "poor", and none is "good" or "perfect". (Article published Oct 24, 2024, updated Apr 14, 2026.) — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- A separate 2026 app case-study release (Mar 24, 2026) scored 10 apps (ASOS, Macy's, H&M, Nordstrom, Nike, GAP, M&S, Wayfair, IKEA, Crate & Barrel) across 340+ parameters. Nike and Nordstrom were labeled "Top 1%". — [Baymard, Mobile App UX Benchmark 2026](https://baymard.com/blog/mobile-app-ux-benchmark-2026)
- Mobile web: 75% of 150+ benchmarked mobile sites rate "Mediocre", 95% "Mediocre" or "Decent", and only one is "Good". Mobile is about three quarters of retail store visits (DynamicYield, cited by Baymard). (Published May 23, 2024, updated Jul 14, 2026.) — [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)

**Home screen and navigation (app-specific)**
- About one in three app users prefer browsing categories, especially when unsure what they want. 60% of test participants could not find how to start browsing categories in Amazon's app. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 40% of apps lack a highly visible "Shop"/"Categories" path. Baymard recommends a clearly labeled path to an "All Categories" page, ideally in the bottom navigation (tab bar) or as the leftmost top-nav link. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 76% of apps have overly prominent homepage ads. Large ads hide the product overview, clutter the page and cause accidental taps. Recommendation: keep ads small and avoid pop-ups and overlays. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 57% of apps have homepage links that don't state their full scope. Some users never notice a narrowed scope, misread the catalog and leave. Recommendation: show only top-level categories on the homepage and state the scope in the link text. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 50% of apps let promotions outrank subcategories on intermediary category pages. Recommendation: put subcategories at the top, before promotions. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 53% of apps use excessively tall horizontal scroll areas, which hijack vertical scrolling and cause mis-taps. Recommendation: avoid horizontal scrolling, or keep non-critical carousels under 50% of viewport height. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 21% of apps have illegible text overlays on images. Recommendation: use semi-transparent or solid high-contrast backgrounds, and real text rather than text baked into images. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- Mobile web: 42% of sites lack a "View All" option at each category level, and 94% don't highlight the current scope in the main navigation. Breadcrumbs were often missing or truncated. — [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)

**Search**
- 90% of apps have no submit button next to the search field. Recommendation: add an explicit submit button and set the keyboard return key to "Search". (On mobile web, 27% lack it.) — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends); [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)
- 33% of apps don't persist the query on the results page, which forces users to retype after poor results. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 42% of apps show repetitive or irrelevant autocomplete suggestions. Recommendation: rank suggestions from search-log data and merge semantically identical queries. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- Baymard's headline is that 69% of sites don't offer relevant autocomplete suggestions for closely misspelled queries. The mobile-web article gives 28%, so the two figures conflict. 56% of sites have "mediocre or worse" search UX in the 2026 search benchmark. — [Baymard guideline 1001](https://baymard.com/guidelines/1001-misspelled-search-terms); [Baymard Search benchmark](https://baymard.com/blog/eCommerce-search-report-and-benchmark); [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)

**Category and product list pages**
- 78% of mobile sites perform "poor" to "mediocre" on product lists, compared with 58% of desktop sites (updated Sep 9, 2025). — [Baymard, Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering)
- Product list pitfalls (% of sites that don't follow the practice): — [Baymard, Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering)
  - 80% don't show 3+ thumbnails per list item. Apparel may need 5–15.
  - 69% of mobile sites lack all 4 essential sorts: price, user rating, best selling, newest.
  - 67% don't show unit price when sizes or quantities differ.
  - 51% lack the 5 essential filter types where applicable: price, user rating, color, size, brand.
  - 42% don't combine color/size variations into one list item.
  - 20% don't show an applied-filters overview. On mobile, a horizontally scrolling or stacked list at the top of the results is recommended.
  - 14% don't allow multiple values within one filter type.
  - Horizontal filter toolbars should be used with caution because they hide options and handle few filter types.
- Mobile web: 73% don't show all color swatches in list items for visually driven products, and 66% don't display an applied-filters overview above the mobile list. Baymard's related articles give different percentages for some of these. — [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)
- Older (2019) Baymard rule: any information important enough to show in the list item also needs a filter. 38% of sites lacked these filters. — [Baymard, list-item info filters](https://baymard.com/research-articles/have-filters-for-list-item-info)

**Product page**
- 80% of apps don't support pinch-to-zoom. Recommendation: support pinch and double-tap zoom app-wide, signal that zoom exists, and load higher-resolution images when zoom starts. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- 76% of mobile sites don't use thumbnails for additional images. Dot indicators alone caused some users to miss images, including the "in scale" image that answered their size question. — [Baymard, Always Use Thumbnails](https://baymard.com/research-articles/always-use-thumbnails-additional-images)
- 50% of mobile users unhappy with small product images tried rotating to landscape. This comes from a Baymard mirror page. — [Baymard (mirror), Scale mobile images in landscape](https://marketing-site-f2tmuig6e-baymard.vercel.app/blog/scale-mobile-product-images-in-landscape)
- 57% of mobile sites don't let users browse all reviewer-submitted images from within the review image overlay. — [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)
- 31% of apps show cross-sells that aren't limited to alternatives. 76% of users look at cross-sells at least sometimes, and 59% check them for a better option they missed (2025 survey of 1,005 US shoppers). — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)

**Cart and checkout**
- 60% of apps (and 59% of mobile sites) have "mediocre" or worse checkout UX in the 2026 checkout benchmark (article updated Nov 3, 2026). — [Baymard, Checkout UX](https://baymard.com/blog/current-state-of-checkout-ux)
- Checkout pitfalls (% that don't): — [Baymard, Checkout UX](https://baymard.com/blog/current-state-of-checkout-ux)
  - 95% don't use buttons, or buttons plus a text field, for cart quantity.
  - 83% don't show a live cutoff countdown for delivery.
  - 72% don't collapse completed steps into summaries.
  - 68% don't let users mark gifts.
  - 56% push account creation before checkout is complete instead of after.
  - 53% don't show all fulfillment options in the shipping step.
  - 50% don't mark both required and optional fields.
  - 48% show only a shipping speed instead of a delivery date or range.
  - 47% don't explain why the phone number is required. About 68% of survey respondents are reluctant to share a phone number.
  - Related article titles: 47% don't make guest checkout the most prominent option, 82% have overly complex password rules, 64% lack input masks, and 98% don't use adaptive error messages.
- Not being able to find "Guest Checkout" is as severe as not offering it. The guideline is tagged as applying to mobile apps (updated Jul 2026). — [Baymard guideline 652](https://baymard.com/guidelines/652-guest-checkout-prominence); [Baymard guideline 637](https://baymard.com/guidelines/637-guest-checkout-options)
- Mobile web: 54% lack an address validator. Mobile users make more address errors because of autocorrect and small keyboards. — [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)
- Average documented cart abandonment is 70.22% (50 studies, 2006–2025). Reasons for abandonment, excluding "just browsing" (42%), are: — [Baymard, Cart Abandonment Rate](https://baymard.com/blog/cart-abandonment-rate)
  - 40% extra costs too high
  - 20% delivery too slow
  - 19% didn't trust the site with card details
  - 18% forced account creation
  - 17% checkout too long or complicated
  - 17% errors or crashes
  - 13% unsatisfactory returns policy
  - 12% couldn't see the total cost up front
  - 10% card declined
  - 9% not enough payment methods
- Average US checkout shows 23.48 form elements, against an ideal of 12–14 (7–8 fields). Better checkout design could lift conversion by 35.26%. — [Baymard, Cart Abandonment Rate](https://baymard.com/blog/cart-abandonment-rate)

### Inferences
These are per-screen do/don't defaults for the template, drawn from the findings above.
- **Tab bar (5 items).** Use Home, Categories/Shop (explicitly labeled), Search (or a search field pinned at the top of Home), Cart with a badge, and Account. A visible "Categories" tab addresses the 40% failure and the finding that a third of users prefer browsing. In RTL the tab order mirrors, so Home sits at the far right.
- **Home.** Use merchant-configurable blocks with guardrails:
  - Cap banner and carousel height (under 50% of the viewport) and don't allow full-screen pop-ups.
  - Render text overlays as live text on a contrast scrim, not baked into images. This also matters for Arabic text rendering and accessibility.
  - Show top-level categories with clear scope labels.
- **Search.**
  - Add an explicit search button and set the keyboard return key to "Search".
  - Keep the query in the field on the results page.
  - Base autocomplete on search logs, with duplicates merged.
  - Handle typos. This needs Arabic normalization: alef variants (أ/إ/آ/ا), taa marbuta/haa (ة/ه), yaa/alef maqsura (ي/ى), diacritics and tatweel. Also handle Arabic-English cross-script queries.
  - Show recent searches.
- **Product list.**
  - Show 3+ swipeable thumbnails per item and group variants into one item with swatches.
  - Show unit price where relevant.
  - Offer the essential filters (price, rating, color, size, brand) with multi-select, an applied-filter chip row at the top, and the 4 essential sorts.
  - Keep filters in a bottom sheet that shows a live result count.
- **Product page.**
  - Use a full-screen gallery with thumbnails, pinch and double-tap zoom, and an in-scale image.
  - Make variant selection explicit with out-of-stock states.
  - Place a size guide link near the size selector.
  - Show reviews with a browsable photo gallery.
  - Limit cross-sells to alternatives, and show "frequently bought together" separately.
- **Cart and checkout handoff.**
  - Use +/- quantity steppers.
  - Show the full cost early (VAT-inclusive price, delivery fee, COD fee if any) and a delivery date range rather than "standard shipping".
  - Make guest checkout the default.
  - Offer account creation on the confirmation screen.
  - Mark required and optional fields, use input masks for the Saudi mobile format (+966 5X XXX XXXX), and validate addresses (national address / map pin).
  - Use adaptive error messages.
  - Show a gift option.

### Gaps
- Baymard's app-specific guideline text on tab bar composition, onboarding, wishlist and account screens is behind Premium. Only the 11 pitfalls above were available publicly.
- No Baymard data was found on Arabic-language or Saudi apps. All Baymard benchmarks are US/EU.
- Size-guide and variant-selection percentages for 2025–2026 were only available in secondary blogs (e.g., "28% show no in-scale image"), so they were not used.
- Several Baymard percentages conflict between article bodies and related-article titles (e.g., typo autocomplete 28% vs. 69%, applied filters 66% vs. 20–28%, quantity buttons 95% vs. 61%). Treat them as directional.

---

## 2. App-specific engagement UX: push permission priming, onboarding and guest browsing, biometrics, wishlists, recently viewed, reorder, order tracking, and why shoppers keep or uninstall store apps

### Takeaway
Shoppers keep a store app when they use it often and when it tracks orders and rewards in one place. They delete it after one-off use, for storage reasons, or because of notification fatigue. Push opt-in now hovers around 50% on both iOS and Android, so a contextual, value-first priming screen and fewer, more relevant notifications matter more than ever. Order and delivery updates are the notifications most likely to bring people back.

### Cited Findings

**Push notification opt-in and priming**
- Median push opt-in is 53.3% on Android and 48.85% on iOS (Airship, 2025 data, 3B+ users, published 2026). Airship says the two platforms are converging and default opt-in on Android "is no longer a meaningful advantage". The retail iOS floor (10th percentile) is 18.1%. No MENA breakdown is given. — [Airship 2026 Benchmarks](https://www.airship.com/mobile-app-push-notification-benchmarks-for-2026/)
- Onboarding campaigns that restate the app's value lifted opt-ins by up to 40% above the category average. Airship recommends stating value on the app store page, offering in-app exclusives, letting users customize notification settings, and re-prompting after contextual intent signals. "Too frequently" is the top reason users opt out. — [Airship 2026 Benchmarks](https://www.airship.com/mobile-app-push-notification-benchmarks-for-2026/)
- Rich media lifts direct opens by 22% on average, advanced personalization by 37%, and zero-party data by 82% (Airship's own research). — [Airship 2026 Benchmarks](https://www.airship.com/mobile-app-push-notification-benchmarks-for-2026/)
- Android opt-in fell from 85% to 67% in a year after Android 13 made notifications opt-in. iOS moved from 58% to 56%. This is from a search snippet. — [Batch benchmark](https://batch.com/blog/case-studies/benchmark-notifications-push-crm-mobile)
- In e-commerce and retail, just over half of iOS users subscribe to push, below the all-industry average. Android is higher. — [Pushwoosh benchmarks](https://www.pushwoosh.com/blog/push-notification-benchmarks/)
- NN/g guidance on permission requests (2019): — [NN/g, Permission Requests](https://www.nngroup.com/articles/permission-requests/)
  - Explain the user benefit in plain language. Users were 12% more likely to grant a request when given any reason, and a compelling reason produced an 81% lift over a weak one.
  - Ask in context, triggered by a user action, rather than all at install.
  - Provide value before asking for noncritical permissions.
  - Use a priming screen before the Android system dialog.
  - After a denial, explain why the feature is unavailable and deep-link to Settings.
  - Avoid dark patterns such as disguised requests, "Recommended" labels, or a hidden decline option.

**Retention and uninstall**
- AppsFlyer's 2025 uninstall report (Aug–Sep 2024 data) puts the shopping app uninstall rate at 21% on Android and 9% on iOS globally. Non-organic shopping installs uninstall at 70.75%. This is from a search snippet. — [AppsFlyer Uninstall Report 2025](https://www.appsflyer.com/?p=455079)
- In the UAE (published Feb 2024), 64% of shopping apps remained installed past 30 days, and non-organic shopping installs had a 66% uninstall rate. — [Communicate Online / AppsFlyer UAE](https://communicateonline.me/news/over-half-of-android-apps-downloaded-by-uae-consumers-uninstalled-in-under-30-days/)
- Adobe survey of 1,000 US consumers (Aug 2026): — [PPC Land / Adobe](https://ppc.land/adobe-finds-72-of-shoppers-delete-retail-apps-after-one-use/)
  - Ownership: 72% have installed a retail app for one discount or purchase and then deleted it. The average device holds 10 retail apps, 5 unopened in the last month.
  - Install reasons: loyalty program (45%), one-time discount (42%), easier shopping (37%).
  - Delete reasons: no longer needed (64%), storage (43%), lack of ongoing relevance (43%), no deals (38%), notification fatigue (30%).
  - Keep reasons: frequent use (61%), ease of navigation (24%), exclusive offers or early access (23%).
  - Most valued features: ease of navigation (27%), personalized deals and rewards (22%), a single place to track orders (19%).
  - Notifications most likely to drive an open: order or delivery status (39%), personalized offers (37%), price drops on saved or viewed items (33%), expiring rewards (30%), back-in-stock wishlist items (13%).
  - Features that would make users keep the app: order tracking (65%), loyalty points tracking (57%), instant returns (42%).

**Regional seasonality (engagement)**
- Ramadan 2025 (AppsFlyer): Middle East in-app purchase revenue was about $1.7B (+18.6% YoY). Shopping app sessions in the UAE, Saudi Arabia and Qatar rose 20%+ YoY to 682M. Shopping non-organic installs rose 76%, peaking in the second half of Ramadan. — [Campaign ME / AppsFlyer](https://campaignme.com/research-confirms-ramadan-effect-as-regions-mobile-app-revenues-surpass-us1-7-bn/)

### Inferences
- **Onboarding.** Open straight into the store, with no forced sign-up, a language choice only if the device locale is ambiguous, and at most one value-led intro screen. Let users browse and fill the cart as guests. Ask for login only at checkout, wishlist save, or order tracking, using OTP to a Saudi mobile number. Offer Sign in with Apple and Google.
- **Push priming.** Never show the OS prompt on first launch. Show a soft-ask (Arabic-first copy such as "نبلغك بحالة طلبك وبالعروض الحصرية") at moments of clear value, then the OS dialog:
  - after the first order is placed, framed as "track your delivery" (order updates are the top open driver)
  - when the user taps "notify me when back in stock" or the wishlist heart
  - when the user subscribes to a sale countdown
  
  Add a notification preferences center by category (orders, offers, price drops, restock) to reduce opt-outs. Cap marketing frequency, since "too frequently" and notification fatigue lead to opt-out and deletion.
- **Retention features to ship as defaults:**
  - order tracking with a timeline and courier link, plus a WhatsApp/support shortcut
  - loyalty points balance, if the merchant has a loyalty program
  - wishlist with price-drop and back-in-stock alerts
  - recently viewed
  - "buy again" or reorder from order history, which suits beauty, perfume and grocery merchants
  - instant return or exchange requests
- **Biometric login.** Face ID or fingerprint to unlock a saved session, plus Apple Pay or saved-card confirmation, fits the "invisible payments" expectation in Section 3. No usability data on biometrics was found.
- **App size and storage.** Storage is the second most common deletion reason, so keep the binary lean (on-demand assets, no bundled video).

### Gaps
- No KSA- or MENA-specific push opt-in rates were found. Airship's 2026 report has no regional breakdown.
- No Saudi-specific uninstall-reason survey was found. The Adobe data is US-only and AppsFlyer MENA shopping data covers the UAE.
- No published usability data on biometric login, recently viewed or reorder features specifically. Those recommendations are inferred.
- No 2025–2026 Saudi data on in-app messaging (stories, inbox) effectiveness was found.

---

## 3. Saudi/GCC shopper expectations: payments, BNPL messaging, WhatsApp support, delivery, Arabic-first content, occasions and seasonal theming, trust signals

### Takeaway
Saudi shoppers are digital-first: e-payments were 85% of retail payments in 2025 and wallets are used monthly by 65%. They expect a seamless, "invisible" payment step with their preferred method (mada, Apple Pay, STC Pay, Tabby/Tamara, with COD declining). Payment declines and security doubts drive abandonment. WhatsApp is near-universal and is the natural support channel. Ramadan, especially after iftar and late at night, is the biggest engagement peak. Official trust signals moved from Maroof to the Saudi Business Center's platform in 2023.

### Cited Findings

**Payments**
- Electronic payments were 85% of retail payments in 2025, up from 79% in 2024 and 70% in 2023. Non-cash transactions rose to 14.6 billion in 2025 from 12.6 billion in 2024, driven by mada volumes at POS and in e-commerce. — [SAMA 2025](https://sama.gov.sa/en-US/MediaCenter/News/pages/news-1139.aspx); [SAMA 2024](https://www.sama.gov.sa/en-us/mediacenter/news/pages/news-1083.aspx)
- mada e-commerce spending rose 25.82% YoY to SAR 197.42B in 2024. This appeared in search-result summaries of the SAMA 2024 coverage and was not verified on the page. — [Argaam](https://www.argaam.com/en/article/articledetail/id/1805070)
- Checkout.com *MENA Digital Commerce 2026* (Saudi respondents; sample size not disclosed in the coverage): — [Checkout.com blog](https://www.checkout.com/blog/mastering-payments-saudi-arabia); [Zawya press release](https://www.zawya.com/en/press-release/research-and-studies/from-invisible-payments-to-ai-agents-why-trust-is-the-new-currency-for-digital-commerce-in-saudi-arabia-b6fiec4k)
  - Wallets and payment preference:
    - 65% use digital wallets monthly or more, and 79% buy with them.
    - 36% say using their preferred payment method is a top priority online.
    - 25% say being unable to use it could erode trust and loyalty.
  - Declines and friction:
    - 57% would abandon or switch to a competitor if a payment were declined despite available funds. The press release gives 36% for switching directly after a false decline.
    - 25% often abandon when asked for an OTP.
    - 98% want "invisible" payments without manual credential entry or redirects, and 96% believe payments should happen in the background.
    - 58% would save card details for faster checkout if fraud protection is strong.
  - Security and trust:
    - 27% abandoned because of payment security concerns (up from 24% in 2025).
    - 31% were victims of online fraud in the past 12 months, against a MENA average of 27%.
  - Shopping habits:
    - 50% shop online weekly and 22% daily.
    - 51% compare prices on their phone in-store.
    - 26% shop via social platforms.
    - Top online categories: food delivery 54%, fashion 52%, beauty, electronics and travel 38% each.
- 64% of Saudi shoppers agree that "the safety of my online payments depends on which payment method I use" (Checkout.com MENA report, via search snippet). — [Checkout.com newsroom (AR)](https://www.checkout.com/ar-sa/newsroom/checkout-com-highlights-importance-of-payment-and-revenue-optimization-in-digital-transformation-report)
- Method shares from vendor blogs are inconsistent. One cites Worldpay: wallets 40%, mada debit 19%, BNPL about 4% (2025). Treat these as indicative only. — [TransFi](https://www.transfi.com/blog/popular-local-payment-methods-and-solutions-in-saudi-arabia)

**BNPL and how it is shown on product pages**
- Tabby's merchant help center recommends promoting Tabby on the homepage and product pages before checkout, with banners and payment messaging, "to reduce cart abandonment and boost conversion". — [Tabby Help Centre](https://tabby.ai/help-business/marketing/promoting-tabby-online)
- The product-page widget pattern is "or 4 payments of [amount] with Tabby" below the price. The cart widget shows the per-installment amount for the whole cart. — [Tabby seller guide (third-party)](https://checkoutflow.pages.dev/ae-en/best-payment-gateway-ecommerce/tabby-guide-sellers)
- Tabby's React Native SDK provides a `TabbyProductPageWidget` with props for price, currency, lang, merchantCode, publicKey and installmentsCount, so it can be embedded natively in an app PDP. — [Tabby RN SDK typings](https://cdn.jsdelivr.net/npm/tabby-react-native-sdk@1.4.1/build/components/TabbyProductPageWidget.d.ts)
- An agency claims a 20–40% AOV lift when the BNPL widget is shown above the fold, and argues it must sit above Add to Cart on mobile. This is unverified marketing content. — [Tabby seller guide (third-party)](https://checkoutflow.pages.dev/ae-en/best-payment-gateway-ecommerce/tabby-guide-sellers)
- Tabby's late-2024 survey of 2,500 Tabby shoppers found that 77% use BNPL for essential purchases. This covers Tabby users only, not all Saudis. — [Arab News](https://www.arabnews.pk/node/2584441)
- 55% of Saudi consumers used BNPL in 2021 (Checkout.com/YouGov, via a search snippet). — [PYMNTS](https://www.pymnts.com/?p=1649127)
- Tamara offers plans of up to 24 months (Ramadan 2026 playbook). — [Tamara](https://tamara.co/en-sa/blog-post/the-ramadan-2026-playbook-turn-business-insights-into-revenue)

**WhatsApp and support**
- WhatsApp is the most used app in Saudi Arabia, used by 94.4% of men and 90.4% of women, followed by Snapchat (80.2% / 88.2%) and TikTok (CST *Saudi Internet 2025*, as reported Aug 2026). 61.3% of users are online 7+ hours a day. Usage peaks at 9–11 p.m., and Friday is the busiest day. Smartphone use is 99.6%. — [Minute Mirror / CST](https://minutemirror.com.pk/whatsapp-is-most-used-app-in-saudi-arabia-report-finds-620330/)
- Zoho (advisory, not survey data) says Saudi customers expect to reach brands in Arabic via WhatsApp, live chat or phone. It describes English-only or email-only support as a trust barrier. — [Zoho](https://www.zoho.com/en-mea/techbizz/ways-to-build-customer-trust-in-saudi-retail.html)

**Delivery**
- Same-day capacity is concentrated in Riyadh and Jeddah. The Central region was about 45.76% of deliveries in 2025 (market report). — [Nexdigm](https://www.nexdigm.com/market-research/insights/blog/ksa-last-mile-delivery-industry/)
- Nice One, a large Saudi beauty retailer, offers delivery across all regions within 5 working days and within 72 hours in Riyadh, plus COD (third-party app listing). — [mwm.ai listing](https://mwm.ai/apps/nice-one/1271754138)

**Occasions, Ramadan and seasonal behavior**
- Saudi shopping app installs rose 67% during Ramadan 2024 (industry interview). Tamara saw order volumes rise up to 60% in KSA and the UAE in the first week of Ramadan 2025. — [Arab News](https://www.arabnews.pk/node/2593733); [Tamara](https://tamara.co/en-sa/blog-post/the-ramadan-2026-playbook-turn-business-insights-into-revenue)
- Saudi spending rose 34.7% in the week before Ramadan 2025 to $4.6B. Shopping activity rises after Taraweeh (38%) and before the pre-dawn fast (24%), and 10 p.m.–2 a.m. is called a key window. 86% of MENA consumers see Ramadan as ideal for discounts (Google, 2024). 61% in KSA/UAE shop directly via Instagram or TikTok during Ramadan (YouGov, Jan 2025). Founding Day ("heritage mode") drives interest in traditional attire. These are third-party figures cited by Tamara and unverified. — [Tamara Ramadan 2026 playbook](https://tamara.co/en-sa/blog-post/the-ramadan-2026-playbook-turn-business-insights-into-revenue)
- 2022 survey (AdColony/GWI): 75% of Saudi respondents preferred shopping after iftar, against 33% for 12–6 p.m. — [Arab News](https://www.arabnews.pk/node/2043951/media)
- A payments vendor describes post-iftar as the strongest daily spike, with a second late-night wave. This is a vendor source without methodology. — [Noon Payments blog](https://blog.noonpayments.com/?p=1836)

**Trust signals**
- In March 2023 the Ministry of Commerce told e-stores to authenticate through the Saudi Business Center's Business Platform instead of Maroof. By September 2023 authentication had moved there, and it is described as the only approved platform for e-commerce authentication. Requirements are a valid CR or freelance certificate and a linked commercial bank account. Maroof previously issued a "Golden Certificate". — [Saudi Gazette](https://saudigazette.com.sa/article/631184/SAUDI-ARABIA/E-stores-must-be-registered-via-nbspBusiness-platform-instead-of-Maroof); [MoC](https://mc.gov.sa/en/mediacenter/News/Pages/29-03-23-02.aspx)
- 19% of shoppers abandon because they don't trust the site with card details, and 13% because of an unsatisfactory returns policy (Baymard, US). — [Baymard](https://baymard.com/blog/cart-abandonment-rate)

### Inferences
- **Payment logos and BNPL on the PDP.** Show payment logos (mada, Apple Pay, STC Pay, Visa/Mastercard, Tabby, Tamara) on the product page and in the cart, not only at checkout. Put a native Tabby/Tamara installment line directly under the price and above Add to Cart, with a bottom-sheet explainer. Make it merchant-toggleable and show it only when the provider is enabled.
- **Checkout handoff.** Since Zid hosts checkout, the app should:
  - pre-fill known data
  - prefer Apple Pay and saved mada cards to minimize OTP and redirects (25% abandon on OTP)
  - show clear retry and alternative-method UI after declines (57% abandon after a false decline)
  - show the COD fee up front if one applies
- **Support.** Add a persistent but unobtrusive WhatsApp support entry point (PDP, order detail, account), with prefilled context such as order number or product link. Show operating hours in Arabic.
- **Trust block on the PDP and in the cart.** Include:
  - Saudi Business Center authentication badge or link
  - VAT registration number (in the footer/about section)
  - return and exchange policy summary (e.g., "استرجاع خلال 7 أيام")
  - "100% original" claims only where true, as in beauty and perfume
  - delivery date estimate by city
- **Delivery messaging.** Show city-aware delivery estimates ("يصلك الثلاثاء - الخميس" in Riyadh vs. other regions) and same-day badges when the merchant supports them.
- **Seasonal theming engine.** Let merchants schedule themes, icons and banners for:
  - Ramadan (iftar countdown, after-iftar flash deals, a late-night "سحور" deal window)
  - Eid al-Fitr and Eid al-Adha
  - Founding Day (Feb 22)
  - National Day (Sep 23)
  - White Friday / 11.11
  - back-to-school
  
  Schedule push campaigns for the post-iftar and 9–11 p.m. peaks rather than mornings during Ramadan. Show Hijri dates as secondary labels on campaign countdowns (e.g., "١ شوال"), with Gregorian dates for delivery estimates.

### Gaps
- No primary 2025–2026 Saudi survey giving the share of online orders by payment method (mada vs. Apple Pay vs. STC Pay vs. BNPL vs. COD) was found. Vendor blogs conflict. SAMA does not publish method splits for e-commerce in the pages reviewed.
- No independent (non-vendor) study quantifying the conversion or AOV impact of BNPL widgets on PDPs was found.
- No credible survey of Saudi expectations for WhatsApp response time was found. The "80% expect immediate replies" figure from a chatbot vendor is unsourced and was excluded.
- No survey on Saudi delivery-time or tracking expectations was found. The "75% expect 24-hour delivery" figure is from a weak aggregator and was excluded. A search snippet attributed to PwC said 54% of Saudi consumers (vs. 63% in the UAE) would pay more for same-day delivery, but the source page and year could not be verified.
- The design or display rules of the Saudi Business Center e-commerce authentication badge were not found. Check business.sa.
- White Friday, National Day and Hijri calendar usage conventions weren't verified with sources in this pass. The dates in the Inferences come from general knowledge, so verify them.
- No data on Arabic-first versus English-first preference among Saudi app users was found.

---

## 4. Arabic/RTL design: typography, line height, mirroring, numerals, mixed bidi text with prices and SKUs, and the new SAR symbol

### Takeaway
Mirror the layout and anything that shows reading direction or linear progress. Don't mirror clocks, media playback, right-handed objects such as search, numbers, or logos. Give Arabic text more line height and a slightly larger minimum size than Latin. Use Western digits (0–9) as the default in Saudi commerce UI. CLDR's ar_SA exemplar data and app-market practice point that way, but make it configurable. The new riyal sign (U+20C1, Unicode 17.0, Sep 2025) still lacks broad font support, so ship it as a bundled font glyph or SVG with a text fallback ("ر.س" / "SAR").

### Cited Findings

**Mirroring rules (Material Design)**
- An RTL layout is the mirror image of the LTR layout. — [Material Design, Bidirectionality](https://m1.material.io/usability/bidirectionality.html)
  - Back and forward buttons reverse, and tabs align right.
  - Directional icons flip, including icons showing forward motion such as a person walking.
  - Checkboxes sit to the right of their labels.
  - Progress bars fill right-to-left.
  - Sliders progress right-to-left.
  - Calendars run right-to-left.
  - Text-based icons (lists, chat) mirror.
- Do not mirror: — [Material Design, Bidirectionality](https://m1.material.io/usability/bidirectionality.html)
  - numbers, clock times and phone numbers
  - clocks, refresh and history icons ("Clocks still turn clockwise")
  - media playback controls and their progress bars
  - charts and graphs
  - physical objects such as keyboards and headsets
  - right-handed icons such as search and the cafe cup
  - slashes, in most RTL countries
- Numbers, including numbers inside icons, must be localized for languages that use different numerals. LTR fragments such as URLs stay LTR inside RTL UI. — [Material Design, Bidirectionality](https://m1.material.io/usability/bidirectionality.html)
- Jetpack Compose provides an `Icons.AutoMirrored` set that flips automatically in RTL. — [Android Developers](https://developer.android.com/reference/kotlin/androidx/compose/material/icons/Icons.AutoMirrored)
- Sources conflict on checkmarks and media icons. Wikimedia Codex says to mirror check icons and media icons, while Material says not to mirror media playback. — [Wikimedia Codex bidi guide](https://doc.wikimedia.org/codex/latest/style-guide/bidirectionality.html); [Material Design](https://m1.material.io/usability/bidirectionality.html)

**Numerals**
- CLDR sets the default numbering system per locale. Generic `ar` defaults to Arabic-Indic digits (`arab`), while `ar_MA` and `ar_DZ` default to Latin. `-u-nu-latn` forces Western digits. — [CLDR users list (2019)](https://corp.unicode.org/pipermail/cldr-users/2019-April/000916.html); [Unicode TR35 Numbers](https://www.unicode.org/reports/tr35/tr35-78/tr35-numbers.html)
- The current CLDR `ar_SA.xml` lists Latin digits 0–9 with an LRM in its numbers exemplar set (`[‎ \- ‑ , . ٪ ‰ + 0 1 2 3 4 5 6 7 8 9]`). This suggests Latin digits are the expected numerals for Saudi Arabic. The `defaultNumberingSystem` value itself was not visible in the fetch. — [CLDR ar_SA.xml](https://github.com/unicode-org/cldr/blob/main/common/main/ar_SA.xml)
- A WebKit bug notes that stock ICU uses `arab` for `ar`, while Google's fork uses Latin digits for Arabic. Implementations therefore differ by platform. — [WebKit bug 236121](https://bugs.webkit.org/show_bug.cgi?id=236121)
- An app-marketing vendor says Saudi apps in productivity, banking/fintech, e-commerce and SaaS default to Western digits. It says Eastern digits remain common in newspapers, government documents, religious content and signage. — [AppScreenshotStudio](https://appscreenshotstudio.com/blog/arabic-app-store-screenshots-4-typography-tripwires-2026)
- Conflicting guidance: a localization vendor says it is common in Saudi Arabia to use Eastern Arabic digits. — [Phrase](https://phrase.com/blog/posts/number-localization/)

**SAR currency symbol**
- King Salman approved the new riyal symbol on 20 Feb 2025. It is encoded as U+20C1 SAUDI RIYAL SIGN, was in the Unicode 17.0 beta on 20 May 2025, and was released on 9 Sep 2025. — [Wikipedia, Saudi riyal sign](https://en.wikipedia.org/wiki/Saudi_riyal_sign); [Unicode SEW recommendation](https://www.unicode.org/L2/L2025/25076-sew-recommendations-saudi-riyal.pdf)
- SAMA usage rules (as summarized by Wikipedia, which carries a promotional-content warning): — [Wikipedia](https://en.wikipedia.org/wiki/Saudi_riyal_sign)
  - The symbol goes to the left of the number in all languages, with a space between them.
  - Its height matches the text height, and its direction aligns with the text direction.
  - Clear space around it equals one-third of its height.
  - Its geometry must be preserved, with sufficient contrast.
- Unicode (Mar 13, 2025) said CLDR 48 (Oct 2025) would add the sign only as an "alternative" symbol so that devices without the glyph don't show missing boxes. A future CLDR would make it the default once fonts catch up. Full deployment "could take months or years." — [Unicode blog](https://blog.unicode.org/2025/03/support-for-new-saudi-riyal-currency.html)
- U+FDFC RIAL SIGN (﷼) is a different character, and fonts should not map it to the new sign. — [riyal.js guide](https://riyal.js.org/blog/saudi-riyal-symbol-in-react/)
- As of a May 2026 guide, most OS fonts hadn't shipped the glyph, so developers embed a font or use inline SVG. The community "Saudi Riyal Font" uses private-use U+E900 for legacy compatibility and recommends U+20C1 for new work. — [riyal.js guide](https://riyal.js.org/blog/saudi-riyal-symbol-in-react/); [Saudi Riyal Font (GitHub)](https://github.com/emran-alhaddad/Saudi-Riyal-Font)

**Typography**
- IBM Plex Sans Arabic is described by Google Fonts as a "neutral, yet friendly Grotesque" designed for legibility in print, web and mobile. This is the designer's claim, not a test result. — [Google Fonts](https://fonts.google.com/specimen/IBM%2BPlex%2BSans%2BArabic/about)
- Cairo, Tajawal, Almarai, IBM Plex Sans Arabic and Noto Sans Arabic are among the most-used Google Fonts Arabic sans families for websites and apps. — [Lemonade Digital Media](https://lemonadedigitalmedia.com/en/free-arabic-fonts-every-designer-needs/)
- Practitioner guidance says Arabic needs more line height than Latin at the same nominal size because of marks above and below letters. One guide suggests increasing Arabic line height by 10–15% over Latin. — [Arabic typography guide](https://freezil-website-wjfnk.kinsta.page/blog/arabic-typography-guide.html)
- Practitioner suggestions for Arabic UI sizes are 14px minimum body, 16px subtitles and 17–20px titles. These are unverified. — [LinkedIn post via search](https://kw.linkedin.com/in/hadeelalhulail)

### Inferences
- **Fonts.** Ship a curated set of 4–6 merchant-selectable Arabic+Latin fonts:
  - IBM Plex Sans Arabic (paired with IBM Plex Sans)
  - Noto Kufi Arabic or Noto Sans Arabic (broad weights; Noto Naskh for long text)
  - Tajawal and Almarai (popular, light-weight, good for headings and prices)
  - Cairo (has Latin glyphs built in)
  - Rubik (Arabic + Latin, rounded, playful brands)
  
  Each font must cover the SAR glyph via a bundled fallback font.
- **Type sizes.** Use a type scale with an Arabic body of at least 15–16pt, 1.5–1.7 line height for body and about 1.3 for headings. Avoid letter-spacing on Arabic, which breaks joins. Never use all-caps style transforms. Avoid italics for Arabic.
- **Prices.**
  - Use Western digits by default for the ar-SA UI (`-u-nu-latn`), with a merchant/user setting for Arabic-Indic digits.
  - Wrap prices in bidi isolation (Unicode FSI/PDI, or platform text direction APIs) so a price like "١٢٩٫٠٠" or "129.00" with the riyal sign doesn't reorder.
  - Place the riyal sign per SAMA rules: left of the number, with a space.
  - Render the sign via the bundled glyph, with "ر.س" as an accessible label and fallback text.
  - Strikethrough sale prices, discount percentages ("-30%" vs. "٪30-") and installment amounts need explicit bidi testing.
- **SKUs, model numbers, English brand names, emails, phone numbers and order IDs.** Force LTR isolation inside Arabic strings. Phone inputs should be LTR fields even in RTL forms.
- **Mirroring checklist for the template.**
  - Mirror: back chevrons, carousel and pager direction, swipe-to-next-image, progress steppers (checkout, order timeline), sliders including the price range filter, star-rating fill direction, cart/send/forward arrows.
  - Don't mirror: search magnifier, play/pause, clock, cart and bag icons (unless they show motion), checkmarks (per Material), logos, product photos, charts.
- **Locales.** Support Arabic-first plus English, with a runtime language switch that re-lays out the app without a restart.

### Gaps
- Apple's HIG "Right to left" page could not be fetched (JS-rendered), so Apple-specific guidance (SF Arabic, Dynamic Type with Arabic) isn't directly cited here.
- No empirical legibility study comparing Arabic UI fonts (Tajawal, Cairo, Almarai, Plex, Noto) at mobile sizes was found.
- Whether iOS 26 or Android 16 system fonts render U+20C1 natively was not confirmed. No platform release notes were found. Test on devices.
- No authoritative Saudi government guidance on digit style in commercial apps was found. A claim that the Ministry of Culture declared 0–9 official could not be verified.
- The CLDR ar_SA `defaultNumberingSystem` value was not directly confirmed. Only the exemplar set was seen.

---

## 5. Performance and perceived speed: cold start targets, skeleton loaders, image optimization, impact on conversion

### Takeaway
Speed has measurable revenue impact. A 0.1s mobile speed improvement raised retail conversions by 8.4% and AOV by 9.2% (Deloitte/Google). Android vitals flag cold starts of 5s or more as excessive. Target a cold start well under 2s to the first meaningful Home frame, cached content on relaunch, and skeletons instead of spinners.

### Cited Findings
- Deloitte/Google's "Milliseconds Make Millions" studied 37 brands and 30M+ sessions. A 0.1s mobile site speed improvement increased retail conversions by 8.4% and AOV by 9.2%. The largest funnel gain was Product Details to Add to Basket (+9.1%). Every page in the journey had to improve for the effect to appear. — [web.dev case study](https://web.dev/case-studies/milliseconds-make-millions); [Deloitte PDF](https://www2.deloitte.com/content/dam/Deloitte/ie/Documents/Consulting/Milliseconds_Make_Millions_report.pdf)
- Google reports that bounce probability rises 32% as mobile page load goes from 1s to 3s (2017 data). — [Think with Google](https://thinkwithgoogle.com/data/page-load-time-statistics)
- Android vitals treat a cold start of 5s or more as excessive (warm 2s or more, hot 1.5s or more, per secondary sources). Google measures time to initial display (TTID). — [Android Developers, App startup time](https://developer.android.com/topic/performance/launch-time); [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9844486?hl=en-GB)
- 17% of shoppers abandon checkout because the site had errors or crashed (Baymard). — [Baymard](https://baymard.com/blog/cart-abandonment-rate)
- Baymard recommends loading higher-resolution images when zoom starts, which implies progressive image loading. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)

### Inferences
- **Template budgets.**
  - Cold start to an interactive Home in under 2s on a mid-range Android device, from the cached last-known Home layout. Then refresh in the background.
  - PLP and PDP first content in under 1s from cache or prefetch.
  - Crash-free sessions above 99.5%.
- **Perceived speed.**
  - Use skeleton loaders that match final layouts.
  - Prefetch the PDP when a product card becomes visible or is tapped.
  - Do optimistic add-to-cart (instant badge update with rollback on failure).
  - Use paginated or infinite lists with stable item heights.
- **Images.** Serve CDN-resized WebP/AVIF at device width × DPR, with a low-quality placeholder or blurhash, and full resolution only for zoom. Cap the number of homepage banners per merchant.
- **Ramadan peaks.** Traffic spikes after iftar (Section 3), so backend and CDN capacity for the merchant API matter as much as client speed.

### Gaps
- No Saudi- or MENA-specific data on app speed and conversion was found.
- No published study on the effectiveness of skeleton screens versus spinners for e-commerce conversion was found. The skeleton recommendation is best practice, not evidence from this search.
- Apple's launch-time guidance (e.g., first frame within about 400ms) wasn't fetched in this pass.

---

## 6. Accessibility basics for shopping apps: dynamic type, contrast, Arabic screen readers

### Takeaway
Evidence specific to Arabic screen-reader use in shopping apps is thin. Practical guidance is to build RTL correctly so TalkBack and VoiceOver read in the right order, label every icon-only control in Arabic, avoid text baked into images, and support system font scaling.

### Cited Findings
- TalkBack announces elements in RTL order when the language requires it, but only if the app's layout supports RTL properly. — [Ficode (developer blog)](https://www.ficode.com/?p=14697)
- Screen-reader testing finds label and content-description errors that automated scanners miss. ScreenAudit (2025) found errors Google's Accessibility Scanner overlooked. — [ScreenAudit, arXiv 2504.02110](https://arxiv.org/pdf/2504.02110)
- Text baked into images is hard to read, hurts accessibility and is invisible to search. 21% of apps have illegible image text overlays. — [Baymard, Mobile App UX Trends](https://baymard.com/blog/mobile-app-ux-trends)
- Arabic VoiceOver users have historically reported trouble with mixed Arabic/English content. This is an old forum report (around iOS 7) and may be outdated. — [AppleVis forum](https://mail.applevis.com/comment/26963)
- 93–98% of sites don't use adaptive validation error messages. Specific errors help all users, including screen-reader users. — [Baymard, Mobile UX Trends 2026](https://baymard.com/blog/mobile-ux-ecommerce)

### Inferences
- **Template accessibility checklist.**
  - Support Dynamic Type and Android font scale up to at least 200% without clipping. Arabic glyphs need extra vertical room.
  - Text contrast of at least 4.5:1 (WCAG AA). Merchant brand colors must be auto-checked, and button text colors adjusted, when a merchant picks a low-contrast primary color.
  - Touch targets of at least 44×44pt (iOS) or 48×48dp (Android).
  - Arabic accessibility labels for icon-only buttons (wishlist heart, cart, filter, share).
  - Prices read with currency, e.g., "١٢٩ ريال". Don't rely on the U+20C1 glyph being announced.
  - Sale and discount states announced in words, not only through color or strikethrough.
  - Focus order follows RTL.
  - Respect the reduce-motion setting for animated banners and stories.
- Test with Arabic VoiceOver and TalkBack voices on real devices, since bidi strings (price + SKU + English brand) are where reading breaks.

### Gaps
- No peer-reviewed or industry study on Arabic or RTL screen-reader usability in e-commerce apps (2023–2026) was found.
- No data on the prevalence of disability or assistive-technology use among Saudi online shoppers was found.
- No Saudi regulatory accessibility requirement for private e-commerce apps was researched. That is out of scope (legal).

---

## 7. Examples of top-rated Saudi/GCC shopping apps and the UX patterns they share

### Takeaway
Publicly verifiable detail on leading regional apps is thin. The patterns that recur in sources are app-exclusive flash deals, loyalty and VIP tiers with cashback, wallet credit, fast or express delivery tiers, COD and BNPL acceptance, Arabic-first interfaces, and strong seasonal (Ramadan/White Friday) merchandising. Independent UX evaluations of these apps were not found.

### Cited Findings
- **noon.**
  - Launched a "VIP" package in 2021 with cashback, faster delivery and priority support. Customers with 6+ purchases in the prior 12 months were auto-enrolled. — [Arab News (2021)](https://www.arabnews.pk/node/1821276/business-economy)
  - Pushes daily flash sales, app-exclusive offers and bundle discounts (Jul 2025 comparison). — [AR-Pay blog](https://ar-pay.com/blog/en/articles/online-shopping-noon-ksa-vs-amazon/)
  - Often runs wallet-cashback promotions on specific categories. — [ClicFlyer](https://blog.clicflyer.com/en/online-shopping-hacks-for-2025)
- **Namshi.** The app offers faster delivery with app-prioritized processing, quick returns, and flash sales not shown on the website. A loyalty points program is also mentioned. — [ClicFlyer, Namshi app guide](https://blog.clicflyer.com/en/how-to-order-from-namshi-ksa-app)
- **Nice One.** Saudi beauty e-retailer founded 2017, listed on the Saudi Exchange. Its app offers COD, nationwide delivery within 5 working days and within 72 hours in Riyadh. — [mwm.ai listing](https://mwm.ai/apps/nice-one/1271754138); [Personal Care Insights](https://www.personalcareinsights.com/news/nice-one-beauty-retailer-launches-on-saudi-exchange-underscores-middle-east-beauty-sector-strength.html)
- **Ramadan app effect.** Shopping app sessions in KSA, UAE and Qatar exceeded 682M in Ramadan 2025 (+20% YoY). — [Campaign ME / AppsFlyer](https://campaignme.com/research-confirms-ramadan-effect-as-regions-mobile-app-revenues-surpass-us1-7-bn/)
- **Social commerce.** 61% in KSA/UAE shop directly via Instagram or TikTok during Ramadan (YouGov Jan 2025, cited by Tamara). Snapchat is the second most used app in KSA. — [Tamara](https://tamara.co/en-sa/blog-post/the-ramadan-2026-playbook-turn-business-insights-into-revenue); [Minute Mirror / CST](https://minutemirror.com.pk/whatsapp-is-most-used-app-in-saudi-arabia-report-finds-620330/)

### Inferences
These are pattern recommendations for a Zid template, combining the regional patterns with the evidence in Sections 1–3.
- **Stories / short-video strip on Home.** Merchant-uploaded, Snapchat/Instagram-style. This mirrors where Saudi shoppers already spend time. Keep it compact, given Baymard's warning on tall carousels.
- **Flash deals block** with a countdown and an "app-only" badge. App-exclusive deals give shoppers a reason to keep the app (23% keep apps for exclusive offers or early access, per Adobe).
- **Loyalty and wallet.** Show points and store credit in the Account header and at checkout, with expiring-points push notifications (30% open rate driver).
- **Delivery tiers.** Express/same-day badges by city, plus the delivery date on PDP and cart.
- **Arabic search.** Normalize Arabic orthography, support transliteration (e.g., "عطر" / "perfume" / "3etr"), and support Arabic-English synonym lists managed by the merchant. Regional players are described as "Arabic-first", but no source evaluated their search quality.
- **Social proof.** Show "sold in last 24h" and review counts where data exists. Keep these honest.
- **Gifting.** Add gift wrapping and gift messages, especially for perfume and beauty around Eid. 68% of sites lack gift designation in checkout (Baymard).

### Gaps
- No independent UX audits or usability studies of noon, Namshi, Nahdi, Jarir, SHEIN Arabic, Ounass, Golden Scent, Nice One or Bath & Body Works Arabia were found. App Store/Play ratings and feature lists were not systematically collected in this pass.
- No current (2025–2026) primary source was found on noon VIP/noon One, Nahdi's loyalty ("Nahdi Wallet/Points"), Jarir, Ounass or Golden Scent app features. Claims about these apps beyond the cited ones should be verified via their app store listings.
- The claim that Namshi was acquired by noon (2023) appeared only in secondary sources and was not verified.
