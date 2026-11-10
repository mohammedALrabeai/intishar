# Global White-Label Mobile Shopping App Builders (Tapcart, Superfans/Vajro, Plobal, Shopney, MobiLoud, AppMaker, Shopify primitives): Features, Merchant Editor, Shopper UX (state as of Nov 2026)

Research date: 2026-11-10. Product/UX only. Most vendor feature pages carry no per-feature launch dates (footers show © 2024 for Tapcart's marketing pages, © 2026 for Superfans and Shopney), so "current" means "live on the vendor site or Shopify App Store listing as fetched in Nov 2026" unless a date is given. Source-quality notes: vendor pages and Shopify App Store listings are primary; one trade article (ecommerce-times.com) on Tapcart is secondary, uses unnamed or lightly sourced claims, and is flagged as low-confidence where used. Comparison blogs written by competing app builders were avoided as sources for facts.

## 1. Merchant editor: model, block catalog, page types, preview, scheduling, versioning, personalization, multi-language

### Takeaway
Every builder ships a drag-and-drop, block-based home-screen editor. The leader (Tapcart App Studio) has moved well beyond that: multi-screen editing including PDP, cart and account, React custom blocks with versioning and rollback, draft→schedule→publish workflow, conditional/segmented block visibility, layout A/B tests, heatmaps, and an MCP server that lets AI agents edit layouts. Mid-market builders (Shopney, Superfans, Plobal) mostly limit visual editing to the home screen ("Showcase"/"Change Content"), with per-widget scheduling, a preview app on the merchant's phone, and multi-layout or segmentation gated to top plans.

### Cited Findings

**Tapcart (App Studio): the most advanced editor**
- App Studio is a "drag-and-drop editor"; named blocks include Mixed-media Hero Banners, Hero Carousel, Media Grid Block, Variants Block, and Tabbed Product Carousel, plus pre-built block templates. Navigation can be switched between side and bottom navigation with selectable icons. — [Tapcart App Studio](https://www.tapcart.com/product/app-studio)
- Feature names on Tapcart's features page: "Drag-and-Drop Editor", "Custom Blocks", "Block Templates", "Customized Layouts", "Multi-Page Support", "Multi-Level Collection Menu", "Custom headers & navigation", "Conditional App Content", "Optimized Cart Experience", "Screen Transitions" (five styles), "2,000+ Icons & Fonts", "Global Components", "App Studio SDK", "Tapcart CLI", "Developer Sandbox", "Layout Scheduling", "A/B Testing" (layouts, banners, CTAs), "Custom Onboarding" (marked Coming Soon). — [Tapcart Features](https://www.tapcart.com/features)
- Editable screens/touchpoints: home screen, PDP and PLP, cart and checkout (promotions and upsells at the final step), post-purchase interactions, account settings. Global Components = reusable logic shared across screens (e.g., personalized Add to Cart, dynamic messaging, back-in-stock prompts). Configurable Blocks let developers expose text/color/layout options to marketers. Preview of unpublished layouts in real time with hot reloading. (Article dated Feb 19, 2025.) — [Tapcart blog, "App Unlocked"](https://www.tapcart.com/blog/app-unlocked)
- Custom blocks: React-based; blocks expose settings (fonts, colors, sizes, text) via JSON; "Live Preview & Hot Reloading"; teams can draft, schedule, and test app updates in advance to align with campaigns; past versions can be saved and cloned; "Conditionals & segmentation" with conditional tagging by behavior, preferences, cohort data. — [Tapcart App Studio](https://www.tapcart.com/product/app-studio)
- Plan-gated editor features (current pricing page): Growth = unlimited blocks, unlimited custom app screens, "App studio AI editing", "Product badging & gift w/ purchase"; Scale adds "A/B testing", "User segmentation", "Content and blocks conditional visibility", "Shopify metafields support", "Scheduling screen publishing", "Heatmaps & scrollmaps"; Enterprise+ adds "Tapcart Developer Tools, Agent MCP, and Tapcart CLI", "Sandbox UAT accounts w/ automated QA", "Multiple regional apps". FAQ also references "Dynamic Layouts" and "PDP Builder". — [Tapcart Pricing](https://www.tapcart.com/pricing)
- Draft/publish/version model is explicit in the developer docs (updated Aug 21, 2026): screens are layouts of block instances; edits apply only to drafts; publishing makes a draft live; custom blocks and components are versioned (JSX/TypeScript transpiled server-side), new versions start in development and go live only on request, enabling rollback; npm dependencies managed per app. — [Tapcart MCP Server docs](https://dev.tapcart.com/docs/mcp-server)
- On-device preview: Tapcart publishes a "Tapcart - Design & Preview" iOS app for previewing the app in real time. — [AppAdvice listing of Tapcart Design & Preview](https://appadvice.com/app/tapcart-design-preview/1198765791)
- Shopify App Store listing feature tags for Tapcart include: banners, homepage, login, cart page, product pages, templates, drag-and-drop editor, collections, multi-currency, multi-language, real-time preview, real-time sync. — [Tapcart on Shopify App Store](https://apps.shopify.com/shopify-mobile-apps)

**Superfans (formerly Vajro)**
- Editing happens in Design Editor > Change Content (home page). Widget library (14): Instagram Feed, Image Grid with Text, Empty Space, Product Grid, Product Slider, Circle Image Slider, Banner Images, Auto Slider Image, Image Grid Without Text, Slidable Banner Images, Video (MP4/MOV), Countdown Timer (optional banner + redirect link), StorifyMe (stories, via plugin + Widget ID), Live Video Banner (links to live stream). No PDP/collection/cart/account editing, segments, or multi-language mentioned. Doc dated Mar 24, 2026. — [Superfans docs: Working with widgets](https://docs.vajro.com/en/articles/5106146-working-with-superfans-widgets)
- Per-widget settings menu: Duplicate, Hide, Schedule (start/end dates), Delete. Auto slider per-image controls: upload, link (redirect), reorder, delete. Other addable elements mentioned: Live replays, Instagram feed. Doc dated Mar 23, 2026. — [Superfans docs: Design Editor – Change Content](https://docs.vajro.com/en/articles/8984970-the-design-editor-change-content)
- Countdown timer: set title and target date/time; a "Widget Banner Image" replaces the timer when it ends; optional redirect URL. — [Vajro docs: Setting up a countdown timer](https://docs.vajro.com/en/articles/4485136-setting-up-a-countdown-timer)
- Preview is via a "preview app" on the merchant's phone (docs say restart the preview app to see the Instagram feed). — [Superfans docs: Working with widgets](https://docs.vajro.com/en/articles/5106146-working-with-superfans-widgets)
- Site also lists pre-designed industry themes, "15+ widgets", and "Maintenance mode" (temporarily disables app access). — [Superfans Features](https://www.superfans.io/features)

**Shopney**
- Home screen is the "Showcase", built either from "Elements" (drag-and-drop) or "Templates". Element catalog (article dated Nov 25, 2025): Search Bar (3 display options), Divider (5 styles + custom 1080x58 image), Title (alignment, link to collection), Countdown Timer, Circle (circular carousel; content types incl. Web Url), Gallery (horizontal/vertical/square frames, S/M/L, show prices), Carousel, Image (vertical slider, Auto ratio), Video Player (MP4 upload/URL, thumbnail from frame, control bar, autoplay on entry, loop), Slideshow, Grid (4/3/2 per row, show/hide titles/prices/borders), Slider, App-Exclusive Discount, Recently Viewed (auto-populated), Loyalty Program (needs loyalty integration), Live Stream & Stream Replay (needs LiveMeUp). Each element documents exact image sizes and tap on/off. Preview via "our Preview app"; changes require "Save & Update". — [Shopney help: Showcase design elements](https://support.shopney.co/en/articles/2758858-detailed-explanation-of-showcase-design-elements)
- Template-based showcases are created as drafts and don't affect the live showcase until published (per search summary of the help article). — [Shopney help: Showcase Templates](https://support.shopney.co/en/articles/14818785-what-are-showcase-templates-and-how-to-use-them)
- Plan-gated: Silver = "PLP/PDP theme options"; Gold = "Bottom bar navigation", multi-language and currency integrations; Platinum = "Multiple showcases" (segment/multi-layout capability); Enterprise = "Scheduled showcases", multi-store support. Listing says merchants can "preview it on your phone before launch." — [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)

**Plobal Apps**
- "Interactive, drag and drop editor"; "Code Blocks" for custom HTML/CSS/JavaScript. — [Plobal Apps](https://www.plobalapps.com/)
- Shopify listing feature tags: app design, homepage, cart page, product pages, templates, drag-and-drop editor, collections, multi-currency, multi-language, real-time preview, real-time sync. Enterprise plan adds "app personalization", "multiple page setup", "customizable fonts". — [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)

**AppMaker.xyz**
- "Appmaker Studio": "A drag-and-drop CMS to launch banners, scrollers, videos, and timed content"; "Code Blocks"; "Tailored Storefronts" (on-brand UI/theming); "Extensions Marketplace" with plug-and-play modules (sticky carts, countdown timers, reorder scrollers, loyalty modules); showcase features: AI Color Swatches, Pet-Specific Onboarding, Shop The Look, Size Quiz Builder. — [AppMaker](https://appmaker.xyz/)
- Shopify listing highlights: Appmaker Studio drag-and-drop builder "with real-time preview"; "Conditional Blocks: personalization using Shopify Tags and Metafields". — [AppMaker on Shopify App Store](https://apps.shopify.com/appmaker)

**MobiLoud (different model: website-based, done-for-you)**
- MobiLoud positions itself as turning the existing website into an app "in 2 to 4 weeks" (homepage title); the MobiLoud team adds native touches (tab bar and navigation, push, deep linking, social sign-in, UI tweaks) while the site's checkout and features keep working. — [MobiLoud](https://www.mobiloud.com/) (homepage returned 403 on fetch; claim taken from search-result title/snippet)
- No merchant self-serve visual editor was found in sources; content/layout = the merchant's existing Shopify theme. — [MobiLoud blog: Shopify mobile app builders](https://www.mobiloud.com/blog/shopify-mobile-app-builders/) (snippet: app runs native code and can add native screens on request)

**Shopify's own taxonomy (baseline checklist)**
- Shopify App Store's mobile-app-builder category uses standardized feature tags that all these listings fill in: Customization = app design, banners, homepage, login, cart page, product pages, templates, drag-and-drop editor, collections, multi-currency, multi-language, real-time preview, real-time sync; Push = abandoned cart, auto-notifications, back in stock, personalized, promotions, rich media, scheduled, custom notifications. — [Tapcart on Shopify App Store](https://apps.shopify.com/shopify-mobile-apps); [AppMaker on Shopify App Store](https://apps.shopify.com/appmaker)

### Inferences
- Table stakes in 2026 = drag-and-drop home editor with ~14-17 block types (banner, slider/carousel, product grid, product slider, circle/collection slider, video, countdown, spacer/divider, title, search bar, Instagram feed, stories, recently viewed, loyalty, live stream), per-block scheduling, deep-link targets on every image, and an on-device preview app.
- Differentiators at the top end: (a) editing beyond home (PDP builder, cart upsells, account, custom screens); (b) explicit draft/publish with versions + rollback; (c) block-level conditional visibility by segment/metafield/tag; (d) layout A/B testing and heatmaps; (e) developer escape hatch (React custom blocks/CLI, or HTML/CSS/JS "Code Blocks"); (f) agent/AI editing via MCP. A Zid-focused builder could bring (a)-(c) to the mid-market price tier where competitors still gate them.
- None of the global builders' public docs surface RTL/Arabic layout mirroring as a feature, which suggests Arabic-first editing (RTL preview, bilingual content per block, Hijri-aware scheduling for Ramadan/White Friday takeovers) is an open lane.

### Gaps
- Version history UI (named versions, diff, restore) is documented only for Tapcart (and only via dev/MCP docs); not found for Shopney, Superfans, Plobal, AppMaker.
- In-browser simulator vs device-only preview: Tapcart's web preview mechanism (browser vs device) is not specified in fetched pages; Shopney/Superfans rely on a phone preview app. QR-code-to-preview flows were not confirmed for any vendor.
- Multi-language: listed as a feature tag for Tapcart, Plobal, AppMaker, Shopney (via integrations like Langify), but no vendor doc describing per-block translations or RTL was found.
- Quizzes: only AppMaker ("Size Quiz Builder") and Superfans ("Surveys") surfaced; UGC/reviews blocks beyond integrations not documented.
- Superfans' current editor scope beyond home (PDP etc.) not documented.

## 2. Branding controls and theme presets

### Takeaway
Branding is usually a central "Brand Kit"/theme panel (logo, colors, fonts, navigation style) plus industry templates. Tapcart is the most granular (Brand Kit, 2,000+ icons/fonts, custom headers, five screen transitions, side vs bottom nav); several builders gate custom fonts or bottom-bar navigation to higher plans. Dark mode and app-store listing asset generation were not documented by any vendor.

### Cited Findings
- Tapcart: themes managed under "App design" > "Brand Kit"; configurable blocks expose fonts, colors, sizes; templates can be cloned and saved as your own versions; side or bottom navigation with chosen icons. — [Tapcart App Studio](https://www.tapcart.com/product/app-studio)
- Tapcart: "Custom headers & navigation" (fonts, colors, layout), "Screen Transitions" (five styles), "2,000+ Icons & Fonts", "Multi-Level Collection Menu". — [Tapcart Features](https://www.tapcart.com/features)
- Superfans: "Pre-designed industry themes" with customizable colors and fonts; "Maintenance mode". — [Superfans Features](https://www.superfans.io/features)
- Shopney: Design Editor adjusts colors, fonts, logos, and showcase layout (per help-center search summary); "Bottom bar navigation" is a Gold-plan feature; "Industry themes" referenced. — [Shopney help: What is the Design Editor](https://support.shopney.co/en/articles/2843367-what-is-shopney-design-editor-and-how-can-i-use-it); [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)
- Shopney has a launch-readiness checklist for app design. — [Shopney help: How to make your app design launch-ready](https://support.shopney.co/en/articles/10174842-how-to-make-your-app-design-launch-ready)
- Plobal: "customizable fonts" listed only in Enterprise plan. — [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)
- AppMaker: "Tailored Storefronts: fully on-brand UI and theming"; "AI Color Swatches" generate product swatches from the brand palette. — [AppMaker](https://appmaker.xyz/)
- Tapcart: the merchant must have their own Apple Developer account ($99/yr) and Google Play account; iOS requires a registered business entity and DUNS number; Tapcart's onboarding specialist submits the app. — [Tapcart Pricing FAQ](https://www.tapcart.com/pricing)

### Inferences
- A design-token approach (color system, type scale, corner radius, button style, nav structure) set once and inherited by all blocks is what Tapcart's Brand Kit + configurable blocks implies; mid-market tools expose fewer tokens.
- Gating basic brand items (custom fonts, bottom bar) behind expensive plans is a visible weakness a challenger can exploit by including full brand tokens on every plan, including Arabic font choices.

### Gaps
- No vendor page fetched documents: splash/launch screen editor, app icon generator, corner-radius/button-style tokens, dark mode, or auto-generated App Store/Play Store screenshots. (Tapcart reviews complain merchants had to make their own store screenshots — see section 8.)

## 3. App-exclusive engagement features (push, in-app, loyalty, video, gamification, etc.)

### Takeaway
Push is the core engagement engine everywhere: abandoned cart, back-in-stock, welcome, win-back, scheduled, segmented, rich media, deep links, and AI-written copy are now standard; Shopney adds multilingual push per device language and custom sounds. Superfans has pivoted hardest toward app-only engagement (community/UGC feed, daily streaks, games + points, surveys, early-access drops, live selling). Live shopping and shoppable video are usually delivered via partners (Firework, LiveMeUp, StorifyMe, Videowise). No builder documents iOS Live Activities, Dynamic Island order tracking, or home-screen widgets.

### Cited Findings

**Push notifications**
- Tapcart: "Push Notification Engine" (GIFs, custom images, deep links), "Automated Push Notifications", "Segment Builder", "Inbox" (in-app message center), "Capture Kit" (QR code for app downloads). — [Tapcart Features](https://www.tapcart.com/features)
- Tapcart listing push tags: abandoned cart, auto-notifications, back in stock, personalized, promotions, rich media, scheduled, custom. — [Tapcart on Shopify App Store](https://apps.shopify.com/shopify-mobile-apps)
- Tapcart MCP tools expose push operations programmatically: `tapcart_campaign_schedule`, `tapcart_campaign_update`, `tapcart_campaign_cancel`, `tapcart_push_test_device`, `tapcart_segment_create`, `tapcart_segment_filters`. Campaigns can only be scheduled for a future time. — [Tapcart MCP Server docs](https://dev.tapcart.com/docs/mcp-server)
- Tapcart "Journeys" (in-app flow builder for onboarding, post-purchase education, win-back) reported as launched in 2025, with company-claimed 14-22% lift in 60-day repeat purchase. Low-confidence secondary source; not found on Tapcart's own pages. — [Ecommerce Times](https://ecommerce-times.com/tapcart-in-2026-mobile-app-platform-at-an-inflection-point/)
- Same article reports merchants saw opt-outs spike at 4-5 pushes/week and say Tapcart's guidance encouraged aggressive cadence (anecdotal, low-confidence). — [Ecommerce Times](https://ecommerce-times.com/tapcart-in-2026-mobile-app-platform-at-an-inflection-point/)
- Shopney push: scheduled; automated abandoned cart (adjustable timing, custom title/message); back-in-stock (with "product request count" dashboard; pairs with Back In Stock app for email); welcome (sent after first session ends); winback; segmentation by activity, behavior, purchase history and Klaviyo segments; custom images and emojis; "Custom push notification sound"; multilingual messages (multiple language versions in one notification, delivered per device language); "AI-generated push notifications"; "Unlimited, free push notifications". A/B testing and send-time optimization are not listed; price-drop and browse-abandonment not mentioned. — [Shopney Push Notifications](https://shopney.co/features/push-notifications)
- Shopney plan gating: Silver = unlimited push, back-in-stock, in-app chat and campaigns; Gold = abandoned cart notifications; Platinum = segmented and AI push. — [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)
- Superfans push: rich media (images, videos, GIFs), behavior-based messages (welcome, abandoned cart reminders), segmentation (e.g., customers who viewed a product/collection), scheduling. — [Superfans Features](https://www.superfans.io/features)
- Plobal: Essential plan adds "abandoned browse campaigns" and "user-segmented notifications"; push tags include abandoned cart, auto-notifications, promotions, rich media, scheduled. — [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)
- AppMaker: push tags abandoned cart, auto-notifications, back in stock, promotions, scheduled; "Extensions and Push: sticky carts, timers, reorder widgets, and automated pushes". — [AppMaker on Shopify App Store](https://apps.shopify.com/appmaker)
- MobiLoud: push runs through the merchant's own OneSignal (all plans) or Klaviyo (Business/Enterprise) account; Klaviyo Flows can trigger app push. — [MobiLoud Klaviyo integration](https://www.mobiloud.com/integrations/klaviyo) (search snippet). Companion Shopify app sends automatic order and shipping update pushes per order stage; types listed: cart recovery, order updates, promotions, reminders, retargeting. — [MobiLoud push on Shopify App Store](https://apps.shopify.com/mobile-push-notifications)

**In-app engagement / loyalty / gamification / community**
- Superfans (2026 site): "Community (BETA)" social feed with lifestyle content and customer UGC posting; "Daily streaks" ("A Reason to Open Everyday"); "Games and points (BETA)" ("Turn Browsing into Play"); "Surveys"; "Reviews"; "The Inside Track for Drops" (early access, exclusive previews, first pick for top customers); personalization for logged-in users. — [Superfans](https://www.superfans.io/)
- Superfans: social login via Google, Facebook, Apple, or phone number/SMS; product recommendations; image-based search. — [Superfans Features](https://www.superfans.io/features)
- Tapcart: "Loyalty HQ", "No-Password & Shop Login", "Customer Accounts", "In-App Order Tracking"; Scale plan adds "Shopify multipass support (OTP passwordless auth)"; Growth includes "Product badging & gift w/ purchase". — [Tapcart Features](https://www.tapcart.com/features); [Tapcart Pricing](https://www.tapcart.com/pricing)
- Shopney: App-Exclusive Discount element, Recently Viewed, Loyalty Program element; Platinum plan adds augmented reality, barcode scanning, live selling, loyalty and subscription integrations; in-app chat and campaigns. — [Shopney help: Showcase design elements](https://support.shopney.co/en/articles/2758858-detailed-explanation-of-showcase-design-elements); [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)
- Plobal: live selling ("QVC channel"), omnichannel (order in-app, pick up in store), smart filters and advanced search, AI-based product recommendations. — [Plobal Apps](https://www.plobalapps.com/). A UAE merchant review praises barcode-scanning search. — [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)
- AppMaker: Shop The Look, Size Quiz Builder, Pet-Specific Onboarding, sticky cart, reorder scrollers, loyalty modules. — [AppMaker](https://appmaker.xyz/)

**Live shopping / shoppable video / stories**
- Superfans live selling: in-app live streaming simultaneously shared to a Facebook page; automated messages when a viewer adds to cart/wishlist during a live sale; downloadable audience reports; replays (claims replays = 30% of live-sale revenue). — [Superfans Features](https://www.superfans.io/features)
- Superfans stories via StorifyMe plugin widget; "Live Video Banner" widget. — [Superfans docs: Working with widgets](https://docs.vajro.com/en/articles/5106146-working-with-superfans-widgets)
- Shopney Live Stream & Stream Replay elements require LiveMeUp integration. — [Shopney help: Showcase design elements](https://support.shopney.co/en/articles/2758858-detailed-explanation-of-showcase-design-elements)
- Firework in Tapcart: added via a Custom Block in the Tapcart editor by pasting embed code; widgets should use the `share_template` param so shared links work. Tapcart's own Firework integration page is labeled "Coming Soon". — [Firework help: Integrate with Tapcart](https://help.firework.com/integrate-with-tapcart); [Tapcart Firework integration page](https://tapcart.com/integrations/firework)
- Videowise markets embedding shoppable video "on site, Shop app, Tapcart & emails". — [Videowise on Shopify App Store](https://apps.shopify.com/videowise-shoppable-video)
- Tapcart AI add-on includes "AI Scenes" and "Gen AI Video"; features page lists "For You Feed". — [Tapcart Pricing](https://www.tapcart.com/pricing); [Tapcart Features](https://www.tapcart.com/features)

**Shopify-native app surfaces**
- Shop Minis: merchants enable a Shop Mini (mini-experience inside Shopify's Shop app) by installing the developer's Shopify app; Shopify says 50+ Minis are live (undated blog). — [Shop Minis docs](https://shop.app/minis/docs/getting-started/introduction); [Shopify blog: Shop Minis](https://www.shopify.com/blog/shop-minis-a-new-era-of-immersive-commerce)
- The Shop app tracks orders using carrier data, including manually added non-Shop orders. — [Shop help: Tracking your orders](https://help.shop.app/it/shop/delivery-tracking/track-orders)

### Inferences
- The engagement stack has bifurcated: Tapcart = "marketing OS" (segments, journeys, A/B, AI push, MCP automation); Superfans = "community/habit loop" (streaks, games, UGC feed, VIP drops). A Zid builder could combine both at a lower price point.
- Live Activities / Dynamic Island order tracking and iOS/Android home-screen widgets appear to be an unclaimed native differentiator among Shopify-focused builders as of Nov 2026 (no vendor documentation found), and are natural fits for Saudi COD/last-mile tracking.
- Multilingual push per device language (Shopney) is directly relevant to Arabic/English Saudi audiences.
- Push fatigue is a real complaint; building frequency caps and guidance into the product is a differentiator.

### Gaps
- Not found for any builder: Live Activities, Dynamic Island, home-screen widgets, offline mode, store locator, spin-wheel/scratch-card gamification (Superfans "games" unspecified), price-drop push (except none confirmed), send-time optimization, push A/B testing (Tapcart A/B is for layouts).
- AR try-on is only a Shopney Platinum line item; no details on implementation.
- Tapcart Journeys could not be verified on Tapcart's own site.

## 4. Analytics and integrations

### Takeaway
Tapcart offers the deepest analytics (push explorer with revenue attribution, acquisition, revenue, retention/LTV/dormancy modules, heatmaps/scrollmaps, data streaming to warehouses, and an insights query API exposed to AI agents). Others offer simpler dashboards (Plobal tracks "60 in-app actions"). Integration lists converge on Klaviyo, Yotpo, Gorgias, Rebuy, Nosto, Recharge, Judge.me, LoyaltyLion, Smile.io, Attentive, plus GA/Facebook and MMPs (AppsFlyer/Adjust) at the top tier.

### Cited Findings
- Tapcart analytics modules: "Push Notification Explorer" (sessions, cart adds, orders, conversion rate); "Customer Journey Analytics"; "Acquisition Analytics" (active users, open rates, traffic sources, time to first purchase); "Revenue Analytics" (order volume, traffic sources, promo code performance); "Retention Analytics" (returning sessions, repurchase rate, order frequency, LTV, dormancy); "Insights Data Streaming". — [Tapcart Features](https://www.tapcart.com/features)
- Tapcart Scale: "Realtime advanced analytics", "Heatmaps & scrollmaps"; Enterprise+: "Data streaming to 3rd party data warehouse"; "Insights Pro" add-on. — [Tapcart Pricing](https://www.tapcart.com/pricing)
- Tapcart MCP: `tapcart_insights_catalog` and `tapcart_insights_query` for metrics and reports. — [Tapcart MCP Server docs](https://dev.tapcart.com/docs/mcp-server)
- Tapcart integrations named: Attentive, Triple Whale, Recharge, Rebuy, Miris, Tagalys, Dynamic Yield, dotdigital, Kustomer, Klaviyo, Yotpo; Shopify listing "Works with": Gorgias, Klaviyo, Nosto, Rebuy, Recharge, Yotpo. — [Tapcart Features](https://www.tapcart.com/features); [Tapcart on Shopify App Store](https://apps.shopify.com/shopify-mobile-apps)
- A trade article claims cohort analysis, app-vs-web LTV and push revenue attribution still require exporting to Triple Whale/Northbeam (low-confidence; conflicts with Tapcart's own retention/LTV module claims). — [Ecommerce Times](https://ecommerce-times.com/tapcart-in-2026-mobile-app-platform-at-an-inflection-point/); contradicted by [Tapcart Features](https://www.tapcart.com/features)
- Plobal: "App analytics" dashboard tracking "60 in-app actions", engagement and sales in real time; Works with Shopify Flow, Gorgias, Klaviyo, Nosto, Recharge, Searchspring, Yotpo; integrations count gated by plan (2/4/7/unlimited). — [Plobal Apps](https://www.plobalapps.com/); [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)
- Shopney: Silver includes Google Analytics and Facebook Ad integration; Platinum adds Klaviyo/Rebuy/Nosto; Enterprise adds AppsFlyer and Adjust; Works with Growave, Kiwi Sizing, Klaviyo, Langify, LoyaltyLion, Smile.io, Nosto, Rebuy, Recharge, Appstle, Yotpo, Judge.me. — [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)
- AppMaker: "160+ integrations"; Works with Attentive, Checkout, Facebook SDK, Firebase, Judge.me, Klaviyo. — [AppMaker](https://appmaker.xyz/); [AppMaker on Shopify App Store](https://apps.shopify.com/appmaker)
- MobiLoud: Works with Checkout, Klaviyo, OneSignal; can tag app orders in Shopify. — [MobiLoud push on Shopify App Store](https://apps.shopify.com/mobile-push-notifications)
- Superfans: "Integrations Without the Waitlist" (custom integrations for marketing, loyalty, support platforms); only Facebook and Instagram named on features page. — [Superfans](https://www.superfans.io/); [Superfans Features](https://www.superfans.io/features)

### Inferences
- The metrics that matter for merchants (and that Tapcart leads with): app revenue share, push-attributed revenue/conversion, active users, time to first purchase, repurchase rate, LTV, dormancy. A Zid builder should ship push revenue attribution and app-vs-web comparison on day one.
- For Saudi, the equivalent integration set would replace Klaviyo/Yotpo with local CRM/loyalty/reviews/WhatsApp tools; integration count is marketed as a selling point (Shopney "52", AppMaker "160+").

### Gaps
- No vendor documented DAU/MAU or retention cohort charts explicitly; Braze integration not confirmed for any builder in fetched sources.

## 5. Checkout handling

### Takeaway
Two patterns: (1) Shopify-checkout-in-app (Shopney "mirrors your Shopify checkout"; MobiLoud keeps website checkout; Shopify's Checkout Kit is the official way to render checkout natively with branding, Functions, and extensions) and (2) vendor "native" checkout (Tapcart "one-step native checkout" with Apple Pay, Google Pay, PayPal, Amazon Pay; Plobal "native checkout", Apple Pay gated to Essential plan). Since Oct 2025 Shopify lets mobile apps place Shop Pay/Apple Pay express buttons directly on PDP and cart.

### Cited Findings
- Shopify's mobile building blocks: Storefront API (catalog, search, cart, creates `checkoutUrl`); Checkout Kit renders Shopify checkout natively in-app "with your branding, Shopify Functions, UI extensions, and payment methods"; accelerated checkouts (Shop Pay and Apple Pay buttons on product and cart pages, "complete a purchase in one tap, without opening checkout"); "Authenticate checkouts" to prefill with authenticated buyer info; supports iOS, Android, React Native. — [Shopify Mobile commerce docs](https://shopify.dev/docs/storefronts/mobile-next)
- Accelerated checkout buttons for mobile apps announced Oct 8, 2025 (Swift and React Native); iOS 16+ only (not Android/web); if Apple Pay fails, Checkout Kit presents full checkout as fallback; merchants can choose which wallets show and order. "Checkout Sheet Kit" is being renamed "Checkout Kit". — [Shopify changelog](https://shopify.dev/changelog/integrate-accelerated-checkout-buttons-shop-pay-and-apple-pay-on-mobile-app-storefronts); [Shopify accelerated checkouts overview](https://shopify.dev/docs/storefronts/mobile/checkout-kit/accelerated-checkouts-overview); [Checkout Sheet Kit Swift (GitHub)](https://github.com/Shopify/checkout-sheet-kit-swift)
- Apple Pay became available as a payment method inside Shop Pay checkout (Shopify changelog, Nov 13, 2025). — [Shopify changelog: Apple Pay in Shop Pay checkout](https://changelog.shopify.com/posts/apple-pay-available-as-a-payment-method-in-shop-pay-checkout)
- Tapcart: "We support all payment processors within the Tapcart one-step native checkout" incl. Apple Pay, PayPal, Google Pay, Amazon Pay; "Shopify multipass support (OTP passwordless auth)" (Scale) helps keep the shopper logged in through checkout. — [Tapcart Pricing](https://www.tapcart.com/pricing)
- Tapcart old reviews (2018-2021) complained customers had to re-enter payment even when signed in, digital downloads couldn't check out without a shipping method, and an address-entry bug. — [Tapcart 1-3 star reviews](https://apps.shopify.com/shopify-mobile-apps/reviews?ratings%5B%5D=1&ratings%5B%5D=2&ratings%5B%5D=3)
- Shopney: app supports all Shopify Payments and third-party Shopify payment providers; checkout in the app mirrors the Shopify checkout. — [Shopney help: Supported payment gateways](https://support.shopney.co/en/articles/3947411-supported-payment-gateways-on-shopney-mobile-app)
- Plobal: Apple Pay listed under the Essential plan ($499/mo); Shopify review summary says merchants value "native checkout". — [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)
- MobiLoud: keeps the website's checkout working inside the app. — [MobiLoud](https://www.mobiloud.com/) (search snippet)

### Inferences
- Best practice in 2026 = native cart + express wallet buttons on PDP/cart + platform checkout rendered in-app with the shopper pre-authenticated (no re-login). For Zid, the analog is embedding Zid's checkout in-app with session handoff, plus Apple Pay/mada/STC Pay/Tabby/Tamara express options on PDP/cart.
- Gating Apple Pay to a premium plan (Plobal) is a weakness to avoid.

### Gaps
- Superfans and AppMaker checkout implementations were not documented in fetched sources (AppMaker lists "Checkout" under Works with).
- No vendor publicly documents whether they've adopted Shopify Checkout Kit vs their own webview.

## 6. AI features launched 2025-2026

### Takeaway
AI has become a paid add-on/plan line across the category: AI layout/block generation (Tapcart App Studio AI, AppMaker Eidolon from screenshots/Figma), AI push copywriting (Tapcart AI Push Copilot, Shopney AI push), AI recommendations/"For You" feeds, AI video, and, most notably, agentic editing via MCP (Tapcart Agent MCP with 34 tools). Exact launch dates are rarely published.

### Cited Findings
- Tapcart AI names: "Tapcart AI", "AI Autopilot", "App Studio AI", "AI Push Copilot", "AI Push Notifications", "Gen AI Video / AI Scenes", "For You Feed". — [Tapcart Features](https://www.tapcart.com/features)
- Tapcart AI add-on ($250/mo, all plans): AI Push Notifications, AI Autopilot, AI Scenes, Gen AI Video; "App studio AI editing" included in Growth. — [Tapcart Pricing](https://www.tapcart.com/pricing)
- AI Autopilot detects new website content and syncs it to the app dashboard, suggesting blocks; App Studio AI generates blocks, layouts, and content from a description using brand and customer data (per search summaries of Tapcart pages). — [Tapcart Features](https://www.tapcart.com/features)
- Tapcart App Studio page demo mentions "App Agent", "AI Push Notifications", "Personalized Shopping". — [Tapcart App Studio](https://www.tapcart.com/product/app-studio)
- Tapcart hosted MCP server at `mcp.tapcart.com/mcp` with 34 tools for analytics, push campaigns, segments, blocks, screens/layouts (clone, add block, update, publish), components; write tools default to plan-only preview; doc updated Aug 21, 2026. Shopify listing tagline: "Turn your store into an AI-powered app that retains customers." — [Tapcart MCP Server docs](https://dev.tapcart.com/docs/mcp-server); [Tapcart on Shopify App Store](https://apps.shopify.com/shopify-mobile-apps)
- Reported: GPT-4o-powered push copy generator producing segmented variants (Q1 2026) and AI product recommendation blocks (low-confidence secondary). — [Ecommerce Times](https://ecommerce-times.com/tapcart-in-2026-mobile-app-platform-at-an-inflection-point/)
- AppMaker: "John AI" built-in assistant for analytics, campaigns, quick builds; "Eidolon AI" (Coming Soon) turns screenshots or Figma files into a branded app; "AI Color Swatches". — [AppMaker on Shopify App Store](https://apps.shopify.com/appmaker); [AppMaker](https://appmaker.xyz/)
- Shopney: "AI-generated push notifications" across all notification types; "segmented and AI push notifications" on Platinum. — [Shopney Push Notifications](https://shopney.co/features/push-notifications); [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)
- Plobal: "AI-based product recommendations" based on click and buying habits. — [Plobal Apps](https://www.plobalapps.com/)
- Superfans: personalization ("Logged In, Looked After"); no AI features named on its pages. — [Superfans](https://www.superfans.io/)

### Inferences
- The frontier is "AI as operator": generate a layout from the web store or a prompt, auto-sync new site content into blocks, write/segment/schedule pushes, and expose all of it to external agents (MCP). A Zid builder could make Arabic-native AI copy (Gulf dialect push copy, bilingual banners) and "import my Zid store → AI home layout" the onboarding default.

### Gaps
- Launch dates for App Studio AI, AI Autopilot, Eidolon AI are not published; performance data for AI features is anecdotal only.

## 7. Onboarding: signup to first preview

### Takeaway
Self-serve builders import the Shopify catalog instantly and let merchants preview on a phone preview app the same day; time-to-store-launch is dominated by app-store submission (developer accounts, DUNS, screenshots), which vendors handle as a managed service. MobiLoud is explicitly done-for-you in 2-4 weeks.

### Cited Findings
- Tapcart Free tier: "App Studio access, Shopify store import, free for 7 days". — [Tapcart on Shopify App Store](https://apps.shopify.com/shopify-mobile-apps)
- Tapcart: "Managed Apple & Google developer portal"; onboarding specialist submits the app; merchant needs Apple Developer + Google Play accounts, registered business entity and DUNS for iOS. — [Tapcart Pricing](https://www.tapcart.com/pricing)
- Shopney: 30-day free trial; "preview it on your phone before launch"; reviews praise help with app submission. — [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)
- Shopney help center has a "Design Your App" collection and a launch-readiness article. — [Shopney help: Design Your App](https://support.shopney.co/en/collections/1610413-design-your-app)
- Plobal: "Build powerful mobile apps, in minutes"; Starter free to install; Shopify review summary: setup "fast and non-technical". — [Plobal Apps](https://www.plobalapps.com/); [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)
- AppMaker: 14-day free trial; anecdotal reviews (2022) of "about a week to go active" and conversion "in just few hours". — [AppMaker on Shopify App Store](https://apps.shopify.com/appmaker); [AppMaker](https://appmaker.xyz/)
- Superfans: "Custom Onboarding" and "Dedicated Design & Growth Support"; publishes to the merchant's own Apple/Google accounts. — [Superfans](https://www.superfans.io/)
- MobiLoud: website-to-app "in 2 to 4 weeks", done by the MobiLoud team. — [MobiLoud](https://www.mobiloud.com/) (search-result title)
- Tapcart reviews: Olazion (Mar 22, 2026) said the app was uploaded with issues and old screenshots and they were told to make their own; JnJFarmKY (2018) said the LLC/Inc requirement wasn't disclosed. — [Tapcart 1-3 star reviews](https://apps.shopify.com/shopify-mobile-apps/reviews?ratings%5B%5D=1&ratings%5B%5D=2&ratings%5B%5D=3)

### Inferences
- Winning onboarding pattern: connect store → auto-import catalog/collections/branding → AI-generated starter home layout → instant phone preview (QR to preview app) in minutes; then a guided, vendor-managed store-submission checklist (developer accounts, auto-generated screenshots, listing copy). Automating store screenshots/listing assets addresses a documented complaint.

### Gaps
- No vendor publishes a step-by-step setup wizard description or measured time-to-first-preview; screen-level onboarding flows would require hands-on trials.

## 8. Marketed differentiators and what Shopify App Store reviews praise/complain about

### Takeaway
Ratings are high across the board (Shopney 5.0/773, Plobal 4.8/148, Tapcart 4.7/339, AppMaker 4.5/34). Reviews overwhelmingly praise human support and launch help rather than specific features; complaints cluster on support inconsistency, bugs, cancellation/contract friction, customization limits, and app-store submission issues. Notably, Superfans' Shopify App Store listing shows as "not currently available" (Nov 2026).

### Cited Findings
- Tapcart: 4.7 from 339 reviews (91% 5-star; 12 one-star). Highlights marketed: "Launch a fully branded app with creative control", "Automated, personalized push notifications and flows", "Tailored onboarding, loyalty, and order experiences", "AI-powered recommendations and automated push campaigns", "Real-time performance insights". Shopify's AI review summary: fast, easy launches with a no-code editor and strong branding control; praise for push, analytics, integrations, support. — [Tapcart on Shopify App Store](https://apps.shopify.com/shopify-mobile-apps)
- Tapcart low-star themes: support/communication (6 of 10 visible low reviews), bugs (Favourites list reorders after 24th item, address entry, checkout re-entry), contract/cancellation (~$1K/mo fees, five reps in a year; Nov 10, 2025), customization limits (limited design modules, scheduled drops can't link inactive products, no "similar items", pushes not editable; 2022), app submission/screenshots (Mar 2026). — [Tapcart 1-3 star reviews](https://apps.shopify.com/shopify-mobile-apps/reviews?ratings%5B%5D=1&ratings%5B%5D=2&ratings%5B%5D=3)
- Shopney: 5.0 from 773 reviews (758 five-star). Reviews praise responsive support, help with app submission, no-code drag-and-drop ease; Shopify summary mentions barcode scanning, search, cart handling, higher engagement and repeat orders. — [Shopney on Shopify App Store](https://apps.shopify.com/shopney-mobile-app)
- Plobal: 4.8 from 148 reviews; summary praises revenue impact, AOV, retention, fast setup, stable apps, push, native checkout, search, wishlists, flexible layouts, 24/7 support; one review notes a "rocky start". — [Plobal on Shopify App Store](https://apps.shopify.com/plobalapps-mobile-application)
- AppMaker: 4.5 from 34 reviews; Nov 2026 reviews praise integration/customization options and proactive support. — [AppMaker on Shopify App Store](https://apps.shopify.com/appmaker)
- Superfans: Shopify listing "Superfans - Mobile App Builder" shows it "is not currently available on the Shopify App Store"; no rating visible. — [Superfans on Shopify App Store](https://apps.shopify.com/vajro). Its site now markets community, streaks, games, surveys, early-access drops, flat $1,000/mo "No feature-gating, No success fees", Shopify Plus. — [Superfans](https://www.superfans.io/)
- Plobal marketed claims: "5X revenue boost", "27% incremental revenue", 12.1% conversion rate, 13.7% abandoned cart recovery (vendor claims). — [Plobal Apps](https://www.plobalapps.com/)
- MobiLoud: positions on "everything on your site works in your app" (no rebuild), done-for-you; Shopify push companion app has 5.0 from 2 reviews. — [MobiLoud push on Shopify App Store](https://apps.shopify.com/mobile-push-notifications)

### Inferences
- Merchants buy outcomes + hand-holding: support quality and launch assistance are the most-praised attributes; a Zid builder should treat Arabic-speaking managed onboarding and app-store submission as product, not afterthought.
- Recurring pain points to design against: inconsistent support, bugs in core flows (wishlist, address, checkout), hard cancellation, feature gating of basics, and store-listing asset burden.

### Gaps
- Review texts for Shopney's/Plobal's/AppMaker's low-star ratings were not visible; Superfans' historical Vajro reviews were not retrievable because the listing is unavailable.
- A third-party teardown claim that MobiLoud's iOS app uses a native UIKit tab bar around web views appeared in search results but its source page could not be pinned down, so it is not cited.
