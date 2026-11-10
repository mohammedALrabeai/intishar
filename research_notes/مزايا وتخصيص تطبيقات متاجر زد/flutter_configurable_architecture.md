# Configurable White-Label Flutter Shopping App: Technical Architecture (2025–2026)

Research date: 2026-11-10. pub.dev shows relative publish dates ("N days ago"). Absolute dates below are approximate and were converted from the fetch date. Recommendations and design proposals appear only under "Inferences". Every "Cited Findings" bullet has a source.

---

## 1. Server-Driven UI (SDUI) in Flutter: libraries, and how large companies structure SDUI

### Takeaway
No off-the-shelf Flutter SDUI library is a complete, production-proven commerce page builder. The best-supported pattern is the one Airbnb, Zalando and Nubank use: the app owns a registry of typed components, and the server sends ordered, typed sections with their data plus a version and targeting gate. Among open-source options:
- **Stac (formerly Mirai)** is the most active general-purpose framework (v1.6.0, around Sept 2026). It handles actions, navigation, caching and theming.
- **rfw** is official and stable (v2.0.0, around late Oct 2026), but it is deliberately limited to composing prebuilt widgets.
- **json_dynamic_widget** is now **discontinued**.
- **Duit** is young and has little adoption.

### Cited Findings

**Stac (stac.dev, formerly Mirai)**
- `stac` 1.6.0 was published about 58 days before 2026-11-10 (around mid-Sept 2026). It has 192 likes, 160 pub points and 13.3k downloads. Publisher: verified `stac.dev`. MIT license. Supports Android, iOS, web and desktop. — [pub.dev/stac](https://pub.dev/packages/stac)
- Advertised features:
  - Backend-controlled navigation: "Control routing, open dialogs, and trigger bottom sheets from the backend."
  - Network requests triggered from the payload.
  - Form state and validation.
  - Dynamic theming via `StacTheme`.
  - Custom widget registration.
  - A Dart DSL that compiles to JSON.
  - A CLI and a web "Stac Console".
  - The page lists no benchmarks. Performance claims such as "lightning-fast" are marketing language. — [pub.dev/stac](https://pub.dev/packages/stac)
- GitHub `StacDev/stac`: 930 stars, 112 forks, 1,634 commits on main, 21 open issues. — [GitHub StacDev/stac](https://github.com/StacDev/stac)
- Mirai was rebranded as Stac. The `mirai` 0.8.0 package is marked discontinued and "replaced by: stac". — [pub.dev/mirai](https://pub.dev/packages/mirai); [Medium: Introducing Mirai](https://medium.com/stac/introducing-mirai-a-server-driven-ui-framework-for-flutter-d020fd0c387d)
- Documented built-in actions: Navigate (push, pop, replace, clear stack), Network Request, Set Value, Get Form Value, Form Validate, Multi Action and Delay. Custom behavior is added through custom `StacAction` classes. The "Stac Registry" is "the hub for widget parsers, action parsers, and global state". UI can be rendered from Stac Cloud, local JSON, assets or network requests. — [docs.stac.dev index (llms.txt)](https://docs.stac.dev/llms.txt)
- The JSON loading entry points are `Stac.fromNetwork()`, `Stac.fromJson()` and `Stac.fromAsset()`. — [DEV: Stac SDUI framework](https://dev.to/smartterss/stac-server-driven-ui-framework-for-flutter-701)
- Stac ships 90+ built-in widgets. Updated widgets are pushed to Stac Cloud through the CLI. — [docs.stac.dev](https://docs.stac.dev/)
- Caching:
  - `StacCacheStrategy` options are `networkFirst` (the default), `optimistic` (serve cache, then refresh in the background), `cacheFirst`, `cacheOnly` and `networkOnly`.
  - `StacCacheConfig(maxAge, refreshInBackground)` is passed to `Stac.initialize`.
  - "Each cached screen stores its version number." When a background fetch sees a new version, the cache is updated for the next load.
  - Manual clearing uses `StacCloud.clearScreenCache('/home')` and `StacCloud.clearThemeCache(...)`. — [Stac caching docs](https://docs.stac.dev/concepts/caching.md)

**rfw (Remote Flutter Widgets, official)**
- `rfw` 2.0.0 was published about 19 days before 2026-11-10 (around late Oct 2026). It has 697 likes, 150 pub points and 32k downloads. Publisher: verified `flutter.dev`. It now depends on `material_ui ^1.0.0`. — [pub.dev/rfw](https://pub.dev/packages/rfw)
- README caveats:
  - "RFW is best suited for interfaces made out of prebuilt components."
  - It can use existing widgets but "doesn't let you *create* those widgets".
  - Moving a whole application to this model "won't work".
  - Changes to look and feel, navigation or features "are all changes that are best made in Flutter itself".
  - There are "known theoretical performance limitations".
  - Backward compatibility is "best-effort only".
  - The widget set is "somewhat arbitrary". — [pub.dev/rfw](https://pub.dev/packages/rfw)
- rfw mechanics:
  - Servers are recommended to send **binary** data.
  - The data format is JSON-like but distinguishes `int` from `double` and has no null.
  - Events fire a callback on the `RemoteWidget`.
  - Local state, such as button feedback, lives in the remote library because buttons "cannot wait for logic that's possibly running on a remote server".
  - Apps add their own local widget libraries. — [pub.dev/rfw](https://pub.dev/packages/rfw)

**json_dynamic_widget**
- 12.0.0+9 was published about 9 months before (around Feb 2026) and is **marked discontinued**. It has 299 likes and 130 pub points. — [pub.dev/json_dynamic_widget](https://pub.dev/packages/json_dynamic_widget)
- Model and features: JSON or YAML with `type`/`args`, `${}` variables, built-in functions (`navigate_named`, `set_value`, `for_each`, ...), and `@jsonWidget` codegen. Builds must use `--no-tree-shake-icons` "or your builds will fail". The 7.x release had breaking schema changes. — [pub.dev/json_dynamic_widget](https://pub.dev/packages/json_dynamic_widget)

**Duit**
- `flutter_duit` 4.4.1 was published about 7 months before (around Apr 2026). It has 19 likes, 140 pub points and 175 downloads. Publisher: `dev.duit.pro`.
- Features: HTTP and WebSocket transports, an Actions & Events API, "Components" templating, a scripting runtime, and Go and TypeScript backend DSLs.
- Its roadmap admits the widget collection is incomplete and that test coverage and documentation need to improve. It asks production users to get in touch. — [pub.dev/flutter_duit](https://pub.dev/packages/flutter_duit)

**How large companies structure SDUI**
- **Airbnb Ghost Platform**:
  - The building blocks are sections, screens (layouts) and actions, all served through Viaduct, a GraphQL data-service mesh.
  - Each section is wrapped in a `SectionContainer` with an `id`, a `sectionComponentType`, the `section` data, and logging metadata.
  - The `SectionComponentType` enum (e.g., `HERO`, `TITLE`, `PLUS_TITLE`) decides which renderer is used, so the same data can be rendered differently depending on context.
  - A `ScreenContainer` holds `screenProperties` (popup, sheet and so on) and a per-form-factor `layout`, e.g., `SingleColumnLayout` with `nav`, `main` and `floatingFooter` placements, or `MultiColumnLayout`.
  - The article does not describe how unknown sections or old app versions are handled. — [InfoQ on Airbnb SDUI](https://www.infoq.com/news/2021/07/airbnb-server-driven-ui/); [Airbnb Engineering deep dive](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5)
- **Zalando Appcraft** (May 2024 post):
  - Primitives: Label, Button, Image, Video and a Layout container. Layout uses a cross-platform Flex model.
  - Each node is JSON with `type`, `id`, `flex`, `props`, `children` and `events`.
  - The client uses an Elm-style Model/View/Update architecture.
  - **Schema versioning stays on the server.** Components can be enabled or disabled by app version, platform, market or A/B test, and each component can declare a **minimum supported app version**.
  - Faulty components can be removed server-side for specific app or OS versions, which avoids hotfixes.
  - Events (tap, long-press, scroll) map to actions (navigate, track). "All tracking events and their schema are defined on the server."
  - Deep links are resolved into API requests. A client release is needed only for new primitives.
  - The "Appcraft Browser" renders screen JSON from any URL for testing.
  - Appcraft serves 13 dynamic pages.
  - Stated lesson: "Striking the right balance between generality and restrictiveness" is hard. Monitoring gaps made launched screens hard to track. — [Zalando Engineering: Appcraft](https://engineering.zalando.com/posts/2024/05/appcraft.html)
- **Nubank Catalyst** (QCon London 2025 talk):
  - Catalyst is a custom Lisp-like expression language serialized as JSON and generated from a Clojure DSL. It has six expression types, including lambdas.
  - A tree-walk interpreter in Flutter of "around 500 lines of code or less" turns expressions into widget trees.
  - Device functions such as `navigate` are exposed as "constants". "The only time I need a client release right now is when I want to define one of those constants."
  - Screens come from per-team screen-provider endpoints (e.g., `/api/screens/xyz`), in a microfrontend style.
  - Expressions are cached on the client. Payloads "grow quickly" for complex screens, and delta updates are planned.
  - Scale: 14,000+ screens, 90%+ of app screens, 3,000+ engineers. Lead time fell from "4 or 5 weeks" to about 20 minutes.
  - App review passed.
  - Old binaries and fallbacks are not covered in the talk. — [InfoQ: Mobile SDUI at scale (Nubank)](https://www.infoq.com/presentations/mobile-server-driven-ui-scale); [QCon London 2025 abstract](https://qconlondon.com/presentation/apr2025/mobile-server-driven-ui-scale)
- Nubank job postings name "BDC (Backend Driven Content)" as the main SDUI platform. Its relation to Catalyst is unclear. — [Nubank job posting](https://job-boards.greenhouse.io/nubank/jobs/7554184)
- **Lyft**: Engineering wrote "The Journey to Server Driven UI At Lyft Bikes and Scooters" (Alex Hartwell and Tim Miko). It describes moving from server-supplemented UI to fully server-driven UI after the 2018 scooter launch. The search snippets describe it, but the full text could not be fetched. — [Lyft Engineering](https://eng.lyft.com/the-journey-to-server-driven-ui-at-lyft-bikes-and-scooters-c19264a0378e)
- **DoorDash**: A 2021 post on generic server-driven UI components gives these goals: "Release faster, by relying more on backend releases rather than mobile releases" and "Fixing problems caused by our previous server-driven UI attempt". DoorDash has a dedicated "Server Driven UI Platform" team building Web, Android and iOS SDKs (job postings). The name "Mosaic" appears only in a secondary source. — [DoorDash careers blog (search snippet)](https://careersatdoordash.com/blog/improving-development-velocity-with-generic-server-driven-ui-components/); [DoorDash SDUI platform job](https://www.mediabistro.com/jobs/1068218632-senior-software-engineer-full-stack-server-driven-ui-platform)

### Inferences
- **Recommended approach for this app: hybrid, "sections, not primitives".**
  - Build a **custom typed block registry** for storefront surfaces: home, landing pages, category or collection headers, promo pages. The server sends `[{type:"product_carousel", ...}, {type:"banner", ...}]`, and each type maps to a hand-written Flutter widget. This is Airbnb's `SectionComponentType` model.
  - Keep **PDP, cart, checkout, account and search as native Flutter screens**, configurable through flags and tokens. They should not be fully server-driven.
  - Reasons:
    - Commerce blocks need live data binding, pagination, cart side effects and impression analytics. These are much easier to get right in purpose-built widgets than in generic widget-tree SDUI.
    - A merchant dashboard is far simpler when merchants pick and configure blocks rather than compose Rows and Columns.
    - Both rfw's README and Zalando's "generality vs restrictiveness" lesson point toward this approach.
- **Where Stac fits.** Stac is the best open-source candidate if you want a generic SDUI layer for secondary or marketing screens. It can render JSON from your own Laravel endpoint via `Stac.fromNetwork`, so Stac Cloud is optional. Its registry, action parsers and cache strategies are also good patterns to copy even if you build your own.
- **Avoid json_dynamic_widget** because it is discontinued. **Treat Duit as experimental**: 19 likes and a self-described need for better tests and docs. Use **rfw** only if you truly need arbitrary remote composition, and accept its no-null data format, binary transport and "best-effort" back-compat.
- **Fallback for unknown components (defense in depth):**
  1. The server filters blocks by the `min_app_version` and capabilities the client sends (Zalando model).
  2. The client registry maps any unknown `type` to `SizedBox.shrink()` in release builds (a visible placeholder in debug) and logs a non-fatal "unknown_block" event.

### Gaps
- The full text of the Lyft and DoorDash posts was not retrieved (HTTP 403). Their versioning and fallback specifics are unverified.
- No independent performance benchmarks of Stac or rfw rendering were found.
- Stac Cloud and Console pricing and SLAs were not found.
- The latest GitHub release date for Stac was not visible.

---

## 2. Designing the page/block schema: data binding, versioning, targeting, scheduling

### Takeaway
Model each page as a versioned envelope holding an ordered list of typed blocks. Each block carries `type`, `id`, `props`, a data-source binding, actions, and visibility rules (min app version, segments, schedule, experiment). Resolve targeting and the first page of data on the server in a BFF, and keep compatibility logic server-side, as Zalando does. Firebase Remote Config's size limits make it unsuitable for storing full layouts.

### Cited Findings
- Zalando keeps schema versioning on the server. Components declare a minimum supported app version and can be toggled by app version, platform, market or A/B test. New pages ship by configuring a route plus a minimum app version. — [Zalando Appcraft](https://engineering.zalando.com/posts/2024/05/appcraft.html)
- Zalando defines tracking events and their schema on the server. Events (tap, long-press, scroll) map to actions (navigate, track). — [Zalando Appcraft](https://engineering.zalando.com/posts/2024/05/appcraft.html)
- Airbnb separates the render type (`sectionComponentType`) from the section data and puts logging metadata in the container. Layout placements (`nav`/`main`/`floatingFooter`) are part of the screen model. — [InfoQ on Airbnb SDUI](https://www.infoq.com/news/2021/07/airbnb-server-driven-ui/)
- Nubank found that complex screens make payloads "grow quickly" and plans delta updates and finer-grained caching. — [InfoQ (Nubank)](https://www.infoq.com/presentations/mobile-server-driven-ui-scale)
- Stac stores a version number per cached screen and refreshes when the server version changes. — [Stac caching docs](https://docs.stac.dev/concepts/caching.md)
- Firebase Remote Config limits: 3,000 parameters and 2,000 conditions per project, and "up to 1,000,000 characters across all parameter values within a project". JSON-typed parameters are supported and validated. — [Firebase Remote Config parameters](https://firebase.google.com/docs/remote-config/parameters)

### Inferences
- **Proposed envelope.** This is a design proposal, not taken from a source:
```json
{
  "schema_version": 3,
  "page": {"id": "home", "version": 1842, "etag": "W/\"a1b2\"", "published_at": "2026-11-01T10:00:00Z"},
  "theme_ref": "v57",
  "blocks": [
    {"id": "b1", "type": "hero_banner", "v": 2, "min_app_version": "1.4.0",
     "props": {"aspect_ratio": 2.0, "corner_radius": "md"},
     "items": [{"image": {"url": "https://cdn/x.jpg", "blurhash": "..."}, "title": {"ar": "...", "en": "..."},
                "action": {"type": "open_collection", "id": 77}}]},
    {"id": "b2", "type": "product_carousel", "v": 1,
     "source": {"kind": "collection", "id": 77, "sort": "best_selling", "limit": 12},
     "data": {"products": [/* first N products hydrated server-side */], "next_cursor": "abc"},
     "props": {"card_style": "compact", "show_add_to_cart": true}},
    {"id": "b3", "type": "countdown", "props": {"ends_at": "2026-11-30T21:00:00Z"},
     "visibility": {"starts_at": "2026-11-20T00:00:00Z", "ends_at": "2026-11-30T21:00:00Z",
                    "segments": ["vip"], "platforms": ["ios", "android"], "locales": ["ar"]}},
    {"id": "b4", "type": "product_grid", "experiment": {"key": "home_grid_cols", "variant": "B"}, "props": {"columns": 3}}
  ]
}
```
- **Core block catalog (v1):**
  - Media and promotion: `hero_banner`/`banner_slider`, `image_banner`, `video` (muted autoplay, poster image), `countdown`, `announcement_bar`, `coupon`.
  - Products and navigation: `category_list` (circles or grid), `product_carousel`, `product_grid`, `brand_strip`.
  - Content and layout: `rich_text` (restricted Markdown or HTML subset), `spacer`/`divider`, `testimonials`, `instagram_feed`/`external_embed`.
  - Fallback: `html_block` (WebView fallback, used sparingly).
- **Actions as a closed enum, not free code:** `open_product`, `open_collection`, `open_category`, `open_page`, `open_url_external`, `open_url_inapp`, `add_to_cart`, `apply_coupon`, `share`, `search`. Unknown actions are ignored. This mirrors Nubank's "constants" idea: new client capabilities need a release, while composition does not.
- **Data binding:**
  - Blocks declare a `source` (collection, category, manual product IDs, "recently viewed", "recommendations").
  - The Laravel BFF hydrates the first page (`data.products`) so the screen paints in one round trip.
  - The client paginates with `next_cursor` against the regular commerce API.
  - Keep presentation props separate from data, as Airbnb does.
- **Versioning and backward compatibility:**
  - The client sends `X-App-Version`, `X-Platform` and `X-Supported-Blocks: hero_banner@2,product_carousel@1,...`. The registry can generate this list automatically.
  - The server drops or downgrades blocks the binary can't render. Version each block type (`v`) independently.
  - Rules: never repurpose a field, only add optional fields, and keep the old renderer variant for N releases.
  - Keep a JSON Schema per block type in the Laravel repo. Validate on save in the dashboard, and run contract tests against the Dart models generated with `freezed`/`json_serializable`.
- **Targeting and A/B:**
  - Evaluate segments and experiments server-side. The response cache key should include segment and variant.
  - Bucket stickily by customer or device ID and emit an `experiment_exposure` analytics event when a block renders.
  - Evaluate schedule windows (`starts_at`/`ends_at`) server-side for caching. Re-check them on the client for cached pages, because a cached layout may outlive the window.
- **Publishing model:**
  - Keep draft and published versions with immutable published snapshots (`page.version` plus ETag) and one-click rollback. Zalando credits fast server deploys for lower incident MTTR.
  - Serve published JSON from a CDN keyed by `{tenant}/{page}/{segment}/{locale}/{schema_version}`.
- **Dart structure:**
  - `sealed class Block` with per-type `fromJson`.
  - `BlockRegistry` maps `type → BlockBuilder`, rendered lazily in a `CustomScrollView` of slivers.
  - An `UnknownBlock` fallback.
  - An `ActionDispatcher` maps action enum values to `go_router` routes and cart services.

### Gaps
- No public source gives a canonical commerce block schema (e.g., Shopify, Salla or Zid internals). The schema above is a synthesis.
- Laravel JSON-Schema validator packages (e.g., `opis/json-schema`, `justinrainbow/json-schema`) were not verified in this pass for current versions.

---

## 3. Theming and branding: remote design tokens, fonts, RTL/Arabic, dark mode

### Takeaway
Deliver a small design-token JSON (colors, typography, radii, spacing, component styles) from the API and map it into `ThemeData` and `ColorScheme`. Use `ColorScheme.fromSeed` with explicit overrides, because the seed color alone does not reproduce the brand color exactly. Bundle one or two Arabic-capable fonts in every binary and load merchant-specific fonts at runtime (via `FontLoader` or `google_fonts` with disk caching). For Arabic, avoid letter-spacing because it breaks letter joining.

### Cited Findings
- `ColorScheme.fromSeed({required Color seedColor, Brightness brightness = Brightness.light, DynamicSchemeVariant dynamicSchemeVariant = DynamicSchemeVariant.tonalSpot, double contrastLevel = 0.0, Color? primary, ...})`:
  - About 50 optional role overrides (primary, onPrimary, secondary, surface, ...).
  - `contrastLevel` ranges from -1.0 to 1.0. Material's medium and high contrast correspond to 0.5 and 1.0. — [api.flutter.dev ColorScheme.fromSeed](https://api.flutter.dev/flutter/material/ColorScheme/ColorScheme.fromSeed.html)
- The seedColor may not end up as one of the scheme's colors. `tonalSpot` (the default) gives muted, pastel palettes even for high-chroma seeds. `fidelity` matches the seed more closely. Use the override parameters to enforce a specific brand color. — [api.flutter.dev ColorScheme.fromSeed](https://api.flutter.dev/flutter/material/ColorScheme/ColorScheme.fromSeed.html)
- `google_fonts` 9.0.0 was published about 42 days before (around late Sept 2026). Publisher: `flutter.dev`. 6.49k likes.
  - It supports runtime HTTP fetching with "Font file caching, on device file system".
  - Fonts in assets "are prioritized over HTTP fetching", which is "Useful for offline-first apps".
  - Font licenses should be added to `LicenseRegistry`.
  - macOS needs a network entitlement for fetching. — [pub.dev/google_fonts](https://pub.dev/packages/google_fonts)
- `FontLoader` is "A class that enables the dynamic loading of fonts at runtime". Usage: `FontLoader(family)..addFont(Future<ByteData>)`, then `await load()`. Fonts can therefore be downloaded from your own CDN and registered under a family name. — [api.flutter.dev FontLoader](https://api.flutter.dev/flutter/services/FontLoader-class.html)
- Stac provides runtime theming (`StacTheme`) loaded from Cloud, network or JSON, and theme-cache clearing (`StacCloud.clearThemeCache`). This confirms the remote-theme pattern in an existing framework. — [pub.dev/stac](https://pub.dev/packages/stac); [Stac caching docs](https://docs.stac.dev/concepts/caching.md)
- Letter-spacing and Arabic:
  - A Stack Overflow report says Flutter `letterSpacing` behaves inconsistently with Arabic. — [SO mirror: letter spacing in Arabic](https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/71654313/letter-spacing-in-arabic-language)
  - WebKit tracked a bug that "Letter spacing shouldn't break Arabic words". — [WebKit bug 195745](https://lists.webkit.org/pipermail/webkit-unassigned/2019-March/864618.html)
  - W3C discussion argues that connected Arabic glyphs must stay connected under letter-spacing. — [W3C www-style](https://lists.w3.org/Archives/Public/www-style/2013Jun/0303.html)
  - The `arabic_text_justification` package uses kashida stretching instead of letter-spacing. — [pub.dev/arabic_text_justification](https://pub.dev/packages/arabic_text_justification/versions/0.5.0)

### Inferences
- **Token payload (proposal):**
  - `colors`: `brand_primary`, `brand_secondary`, `accent`, `surface`, `on_surface`, `sale`, `success`, each with light and dark values.
  - `typography`: `font_family_ar`, `font_family_en`, a scale map (`display`/`headline`/`title`/`body`/`label` with size, weight and height).
  - `shape`: radii `sm`/`md`/`lg`/`pill`.
  - `spacing`: base unit.
  - `components`: button style, product-card style (`elevated`/`outlined`/`flat`), app bar style, bottom-nav style and items.
  - `assets`: logo light and dark, placeholder image.
- **Mapping rule:** Build the scheme with `ColorScheme.fromSeed(seedColor: brand, dynamicSchemeVariant: DynamicSchemeVariant.fidelity, brightness: b)`, then `.copyWith(primary: brand, onPrimary: computedContrastColor)` so the exact brand hex is preserved. Extend `ThemeData` with a `ThemeExtension<BrandTokens>` for non-Material tokens (card style, sale color, radii). Merchants' "theme presets" in the dashboard are just token sets.
- **Fonts:**
  - Bundle a default Arabic and Latin pair in the binary (for example IBM Plex Sans Arabic or Noto Kufi/Naskh Arabic, plus Cairo or Tajawal as options) so first paint never waits on the network.
  - Merchant-selected fonts load at runtime from your CDN: download once, store on disk, register with `FontLoader` on later launches before `runApp`. Alternatively use `google_fonts` for Google-hosted families.
  - Keep `FlutterNativeSplash.preserve()` until cached tokens and fonts are registered to avoid a flash of the wrong theme.
- **RTL rules:**
  - Derive `Directionality` from the locale (`MaterialApp.locale` plus `flutter_localizations`).
  - Use `EdgeInsetsDirectional`, `AlignmentDirectional` and `PositionedDirectional` throughout block widgets.
  - Mirror directional icons (back arrows, chevrons) and carousels' start side.
  - Force `letterSpacing: 0` for Arabic text styles.
  - Use larger line height for Arabic, around 1.4–1.6. This is a heuristic and is not sourced.
  - Format prices with `intl` per locale, and decide explicitly whether to show Western or Arabic-Indic digits.
- **Dark mode:** Either the merchant provides explicit dark tokens, or dark is generated from the same seed with `Brightness.dark` plus brand overrides. Let merchants disable dark mode (force `ThemeMode.light`), since many brand palettes aren't designed for it.

### Gaps
- Official Flutter guidance on Arabic typography (line-height, letter-spacing) was not found. The rules above are practitioner heuristics backed by the joining-breakage sources.
- No measurements were found for runtime font load time or for its impact on cold start.

---

## 4. Build-time branding per merchant and automated white-label pipelines

### Takeaway
For more than a handful of merchants, don't hand-maintain one Flutter flavor per merchant. Keep a single base project with env flavors (dev/staging/prod) and inject the tenant at CI time:
1. Fetch a tenant config and asset zip.
2. Rewrite the bundle ID and package name, app name, icons and splash.
3. Drop in the Firebase config files.
4. Sign with per-tenant credentials.
5. Upload to the stores.

Codemagic's documented white-label flow does exactly this via a REST API your Laravel backend can call. GitHub Actions and fastlane is the cheaper DIY alternative. Firebase's 30-apps-per-project cap forces sharding or a project per merchant.

### Cited Findings
- **Flutter flavors (Android):**
  - Flavors are Gradle `productFlavors` with `applicationIdSuffix`. App names go in per-flavor `src/<flavor>/res/values/strings.xml` files, and icons in per-flavor `mipmap-*` folders.
  - Build with `flutter build appbundle --flavor production`.
  - The `appFlavor` constant is available in Dart. `pubspec.yaml` supports flavor-specific assets and a `default-flavor`.
  - With AGP 9.0+, `resValue()` for `app_name` fails by default.
  - iOS flavors are documented on a separate page. — [docs.flutter.dev flavors](https://docs.flutter.dev/deployment/flavors)
- **flutter_launcher_icons** 0.14.4 was published about 17 months before (around mid-2025). It has 8.05k likes. Publisher: `fluttercommunity.dev`.
  - Per-flavor configs are `flutter_launcher_icons-<flavor>.yaml`. A custom config is passed with `dart run flutter_launcher_icons -f <file>`.
  - Adaptive icons require both `adaptive_icon_background` and `adaptive_icon_foreground`.
  - `remove_alpha_ios` strips the alpha channel for iOS. — [pub.dev/flutter_launcher_icons](https://pub.dev/packages/flutter_launcher_icons)
- **flutter_native_splash** 2.4.8 was published about 5 months before (around Jun 2026). It has 9.81k likes.
  - Per-flavor `flutter_native_splash-<flavor>.yaml`, run with `dart run flutter_native_splash:create --flavor X`, `--flavors a,b` or `--all-flavors` (2.4.4+).
  - It has an Android 12 section (icon 1152×1152 without a background; "background image is not supported").
  - iOS needs manual Xcode storyboard steps per scheme.
  - `FlutterNativeSplash.preserve()` and `remove()` control when the splash is dismissed. — [pub.dev/flutter_native_splash](https://pub.dev/packages/flutter_native_splash)
- **Codemagic white-label workflow:**
  - One Codemagic app and one workflow serve all clients. Each client has a **variable group** (e.g., `WL_001`) holding `PACKAGE_NAME`, `BUNDLE_ID`, `APP_STORE_ID`, the base64 keystore, App Store Connect API key fields and the Google Play service-account JSON.
  - Assets are fetched per client, e.g., `aws s3 cp s3://$S3_BUCKET_NAME/assets_${CLIENT_ID}.zip`, or from a headless CMS via `curl`.
  - Rebranding steps:
    - Android package: `change_app_package_name`.
    - iOS bundle ID: `sed` on `project.pbxproj`.
    - App name: `sed` or PlistBuddy on `AndroidManifest.xml` and `Info.plist`.
    - Icons: copy the client's folders into `res` and `Assets.xcassets`.
  - Build numbers come from `google-play get-latest-build-number` or `app-store-connect get-latest-app-store-build-number`.
  - iOS signing: `app-store-connect fetch-signing-files "$BUNDLE_ID" --type IOS_APP_STORE --create`. — [Codemagic white-label docs](https://docs.codemagic.io/yaml-quick-start/white-label-getting-started)
- **Codemagic trigger API:**
  - `POST https://api.codemagic.io/builds` with header `x-auth-token` and body `{appId, workflowId, branch, labels:[clientId], environment:{variables:{CLIENT_ID}, groups:[groupName]}}`.
  - Variable groups can be populated via `POST https://codemagic.io/api/v3/variable-groups/{id}/variables`.
  - **"Each client's first app version must be created manually"**, because neither Apple nor Google offers an API to create apps. — [Codemagic white-label docs](https://docs.codemagic.io/yaml-quick-start/white-label-getting-started)
- **Codemagic at scale:**
  - There is no extra charge for white-label workflows.
  - With 40 versions and 3 concurrent builds, 3 start immediately and the rest queue.
  - Case study: Criton builds apps for 200+ hotels, with builds triggered from its back office via the Codemagic API. — [Codemagic white-label overview](https://docs.codemagic.io/knowledge-white-label/white-label-apps-overview/); [Codemagic Criton case study](https://blog.codemagic.io/criton-case-study/)
- **Codemagic pricing:**
  - Mac mini M2 $0.095/min, M4 $0.114/min, Linux $0.045/min.
  - 500 free M2 minutes per month.
  - Fixed annual plan: $3,990/yr with 3 concurrent M2 builds, plus $1,500 per extra M2 concurrency. — [codemagic.io/pricing](https://codemagic.io/pricing/)
- **GitHub Actions hosted runner rates:** macOS 3/4-core (M1) $0.062/min, macOS 5-core M2 Pro $0.102/min, Linux 2-core $0.006/min. — [GitHub Actions runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing)
- **Firebase cap:** 30 apps per project, counting Apple, Android and web together. Past this "performance starts to degrade (especially for Google Analytics)". An increase can be requested only in rare cases and only on the Blaze plan. — [Firebase FAQ](https://firebase.google.com/support/faq)
- **APNs keys:**
  - An APNs `.p8` auth key works across all apps on one Apple Developer team. It is uploaded per iOS app in Firebase Cloud Messaging with its Key ID and Team ID. — [anything.com APNs guide](https://www.anything.com/blog/apple-push-notification-service-certificate-setup); [SuprSend docs](https://docs.suprsend.com/docs/expo-push-setup)
  - Rotating a shared key requires re-uploading it everywhere. — [Notifica docs](https://docs.notifica.re/sdk/v4/expo/setup/platform)
  - These are third-party docs, not Apple or Firebase primary sources.
- Codemagic documents running Shorebird releases and patches in its pipelines. — [Codemagic: Code Push with Shorebird](https://docs.codemagic.io/flutter-distributing/shorebird/)

### Inferences
- **Tenant config, not per-merchant flavors.** Flutter's flavor setup needs a Gradle block, `strings.xml`, icon set and iOS scheme for every flavor, which doesn't scale to hundreds of merchants. Instead:
  - Keep env flavors only.
  - At CI time, download `tenant.json` from Laravel. It holds bundle ID, package name, display names (ar/en), version, API base URL, tenant ID, store ID, deep-link domain, feature flags and the Firebase app IDs.
  - Generate `flutter_launcher_icons-ci.yaml` and `flutter_native_splash-ci.yaml` from it and run both tools.
  - Write `google-services.json` and `GoogleService-Info.plist`.
  - Pass runtime constants with `--dart-define-from-file=tenant.json`.
  - Everything the app needs at runtime (theme, layout) still comes from the API. The build only bakes identity and a fallback layout and theme snapshot for offline first launch.
- **Orchestration from Laravel:**
  1. The merchant clicks "Publish app".
  2. A Laravel job validates assets (1024×1024 icon without alpha for iOS, splash sizes) and uploads them to S3.
  3. The job creates or updates the Codemagic variable group via API.
  4. The job calls `POST /builds` with `CLIENT_ID`.
  5. The job stores the build ID and listens to the Codemagic webhook to update status in the dashboard.
  6. Automate store-listing metadata and screenshots too (fastlane `deliver`/`supply` or Codemagic publishing).
  - A one-time manual step remains per merchant: creating the app record in App Store Connect and Play Console. Build an onboarding checklist for it.
- **DIY alternative.** GitHub Actions with a `workflow_dispatch` or `repository_dispatch` trigger from Laravel (with a `client_id` input), fastlane `match` for iOS certificates, and `supply`/`deliver` for upload. Per-minute macOS cost is lower ($0.062/min versus Codemagic's $0.095/min), but you build and maintain the rebranding scripts and signing yourself. Bitrise is a third option but was not researched here.
- **Firebase strategy.**
  - Each merchant is at least 2 Firebase apps (iOS and Android), so one shared project holds at most about 15 merchants.
  - Options: (a) one Firebase project per merchant, automated via the Firebase Management API, which gives clean analytics and Crashlytics isolation; or (b) shard merchants into projects of about 12–14.
  - For push, a single `.p8` is enough if all apps sit under the platform's Apple team. If each merchant publishes under its own Apple account, you need that merchant's key.
  - An alternative is to send pushes from Laravel via the FCM HTTP v1 API, keyed by the tenant's Firebase project service account.

### Gaps
- iOS flavor and scheme steps (docs.flutter.dev/deployment/flavors-ios) were not fetched.
- The Codemagic webhook payload format was not verified.
- Bitrise white-label tooling and pricing were not researched.
- The Firebase Management API project-creation quotas were not verified.
- Whether apps are published under each merchant's own Apple and Google developer accounts changes the signing and push design materially. That is a policy question and was out of scope.

---

## 5. Live preview for merchants in the web dashboard

### Takeaway
The cheapest, most interactive option is to compile the same block-rendering Flutter package to Flutter Web and embed it in the Laravel dashboard (iframe or multi-view), pushing draft JSON in on every edit. Add a "preview on device" path: a generic previewer app plus a QR code with a signed draft token. Reserve Appetize-style streamed simulators for showcasing a real branded binary, because they are billed by the minute and limited in concurrency.

### Cited Findings
- **Flutter Web embedding options:**
  - An iframe in "Full page mode", which is "recommended when embedding a Flutter web application through an `iframe`".
  - A custom `hostElement`.
  - Embedded multi-view mode (`multiViewEnabled: true`, `app.addView({hostElement, initialData})`, `runWidget(MultiViewApp(...))` instead of `runApp`).
  - iframes give full sandboxing but need async `postMessage`. Direct embedding allows synchronous JS interop.
  - The host element needs a non-zero CSS size.
  - The docs reflect Flutter 3.47. — [docs.flutter.dev embedding Flutter web](https://docs.flutter.dev/platform-integration/web/embedding-flutter-web)
- Flutter Web renders through the CanvasKit and Skwasm renderers (WebGL and WebGPU). It compiles to JS via `dart2js` or to WebAssembly via `dart2wasm` (`--wasm`). — [docs.flutter.dev web renderers](https://docs.flutter.dev/platform-integration/web/renderers)
- `cached_network_image` has minimal web support: "It currently doesn't include caching". — [pub.dev/cached_network_image](https://pub.dev/packages/cached_network_image)
- **Appetize pricing:**
  - Free: 30 min/month, 3-minute sessions.
  - Starter: $89/mo ($59/mo billed annually), 3 concurrent devices, 500 min then $0.06/min.
  - Premium: $449/mo ($319/mo annually), 16 concurrent devices.
  - Users queue when no device is free.
  - Features listed include embedding, API access, whitelabel branding and custom CNAMEs. — [Appetize pricing](https://www.appetize.io/pricing)
- Zalando built an "Appcraft Browser" that renders screen JSON from any URL in isolation, and tests PR builds in the debug app. — [Zalando Appcraft](https://engineering.zalando.com/posts/2024/05/appcraft.html)
- Stac offers a "Stac Console" web interface for managing the app. Its preview capabilities are not described. — [pub.dev/stac](https://pub.dev/packages/stac)

### Inferences
- **Code structure for previewability.** Put the block widgets, the theme mapper and the registry in a package, e.g. `packages/storefront_ui`, with no mobile-only plugin imports. Abstract the cart, navigation, analytics and image services behind interfaces. The mobile app wires the real implementations. The web previewer wires mocks: navigation becomes no-ops or highlights, and cart actions show a toast.
- **Dashboard preview (tier 1):**
  - The Laravel dashboard (Livewire, Vue or React) hosts the Flutter Web previewer in an iframe sized like a phone frame.
  - On every edit it sends `postMessage({type:"draft", page, theme, locale})`.
  - The previewer re-renders instantly and posts back block click events, so clicking a block in the preview selects it in the editor.
  - Fidelity caveats: web text rendering and font loading differ slightly from iOS and Android; there are no native plugins (video players, WebViews); and the first load is heavy because of the CanvasKit/Skwasm download. Mitigate the load by caching the previewer build on a CDN.
- **Device preview (tier 2):**
  - The dashboard shows a QR code for `https://preview.yourplatform.com/p/{signed_token}`. The link opens a universal or app link into either (a) the merchant's own installed app, via a hidden preview route that accepts drafts only with a valid signed token, or (b) a single generic "Previewer" app distributed via TestFlight or the Play internal track.
  - The token expires after about 30 minutes and authorizes only that draft.
- **Real-binary demo (tier 3):** Appetize (or similar) embeds an actual branded build. Use it for sales demos or QA rather than everyday editing, because cost scales with minutes and concurrency.

### Gaps
- No current figures were found for Flutter Web initial bundle size (CanvasKit or Skwasm) or time-to-first-frame for a previewer.
- Which Appetize tiers include embedding and API upload was not confirmed.
- No vendor (Stac Console or others) was confirmed to offer live draft preview.

---

## 6. Over-the-air updates: Shorebird, remote config versus your own config API, caching and cold start

### Takeaway
Ship changes through three channels, from most to least frequent:
- **SDUI page and theme JSON from your own Laravel API** for daily merchant edits.
- **Feature flags and kill switches** from Remote Config or your own flags endpoint.
- **Shorebird code push** for emergency Dart-only fixes across all white-label binaries.

Shorebird's compliance basis is Apple DPLA 3.3.1(B) and Google's interpreter exemption. It cannot patch native code or assets, and patched code on iOS can run slower. Use stale-while-revalidate caching with a layout snapshot baked into the binary for fast, offline-safe cold starts.

### Cited Findings
- **Shorebird compliance basis:**
  - Google Play's Device and Network Abuse policy exempts code that "runs in a virtual machine or an interpreter".
  - Apple DPLA §3.3.1(B) allows interpreted code that "does not change the primary purpose of the Application".
  - Using Shorebird to violate store guidelines breaches its Terms of Service. — [Shorebird FAQ](https://docs.shorebird.dev/code-push/faq/)
- **What Shorebird can patch:**
  - Dart code only.
  - Not native code, assets or the Flutter version. Native-code packages work only if they were already in the release.
- **How patches are applied:**
  - The app checks for patches at startup on a background thread, and a downloaded patch applies on the **next launch**.
  - `package:shorebird_code_push` exposes `checkForUpdate()`.
  - Patches can be rolled back.
- **Flavors and testing:**
  - Each flavor has its own app ID in `shorebird.yaml`.
  - Shorebird cannot target TestFlight groups or Play testing tracks.
  - A patch must reuse its release's `--dart-define` values. — [Shorebird FAQ](https://docs.shorebird.dev/code-push/faq/)
- **Shorebird performance:**
  - On iOS, new or changed code runs in an interpreter ("Interpreters are slow"), and dependent code may also become interpreted.
  - "9 out of 10 patches ... exhibit no difference after patching". A link percentage below 90% "is worth investigating", and since CLI 1.6.135 patches below 20% are refused.
  - Android patches are not linked, and the page notes no Android caveat. — [Shorebird patch performance](https://docs.shorebird.dev/code-push/performance/)
- **Shorebird pricing:**
  - Hobby: $0, 5,000 patch installs/month.
  - Pro: $20/mo, 50,000 installs.
  - Business: $400/mo, 1,000,000 installs, OIDC keyless CI.
  - Enterprise: custom.
  - Overage is $1 per 2,500 installs. Every plan includes "Unlimited apps & releases". — [Shorebird pricing](https://shorebird.dev/pricing)
- iOS support became stable with Shorebird 1.0. — [Shorebird 1.0 blog](https://shorebird.dev/blog/1.0)
- Some developers still call code push a "gray area" to use at your own risk. This is an opinion piece. — [Zenn article](https://zenn.dev/tsuruo/articles/13687d8455d1b1)
- Firebase Remote Config caps a project at 3,000 parameters, 2,000 conditions and 1,000,000 total characters of values. — [Firebase Remote Config parameters](https://firebase.google.com/docs/remote-config/parameters)
- Nubank caches SDUI expressions on the client. First load of a screen needs connectivity, and app review passed with a representative cached build. — [InfoQ (Nubank)](https://www.infoq.com/presentations/mobile-server-driven-ui-scale)
- Stac's `optimistic` strategy "returns cached data immediately and updates it in the background". Its `networkFirst` default falls back to cache only on failure. — [Stac caching docs](https://docs.stac.dev/concepts/caching.md)

### Inferences
- **Shorebird across many white-label apps.** Each merchant app is a separate Shorebird app ID, which is fine because apps are unlimited. A patch has to be built and pushed per merchant binary, so script it in the same CI matrix.
  - Patch installs add up across all merchants' devices. Example: 100 merchants × 2,000 active devices is about 200k installs per patch, which exceeds Pro and points to Business ($400/mo for 1M).
  - Treat Shorebird as a bug-fix and safety channel, not the feature channel. Keep SDUI changes within the app's "primary purpose" to stay inside the 3.3.1(B) rationale.
- **Own config API versus Firebase Remote Config.**
  - Page layouts are per-merchant, large, drafted, previewed and segmented, so they belong in your Laravel API behind a CDN with ETags. Remote Config's project-wide 1M-character cap and per-project scoping (and the 30-app Firebase cap) make it a poor store for layouts.
  - Remote Config, or a simple `/flags` endpoint, is fine for kill switches, minimum-supported-version prompts and rollout percentages.
- **Cold-start sequence:**
  1. `preserve` the native splash.
  2. Load cached tokens, fonts and the home layout from disk. Fall back to the snapshot baked into the build if there is no cache.
  3. Render immediately, then `remove` the splash.
  4. Revalidate in the background with `If-None-Match`.
  5. If a new version arrives, apply it on the next navigation to the page, or swap only if the user hasn't scrolled, to avoid layout jumps.
  - Prefetch images for the first viewport only.
- **Kill switch:** keep a `min_supported_app_version` and `force_update` flag per tenant, as the back-compat backstop for when old binaries can't render critical new flows.

### Gaps
- Firebase Remote Config fetch throttling and real-time listener limits were not fetched.
- Shorebird's exact iOS interpreter slowdown is not published as a figure.
- How Apple reviewers treat SDUI-heavy white-label apps is not documented by Apple. Nubank's experience is anecdotal.

---

## 7. Performance and quality: images, caching, state management, crash reporting, analytics

### Takeaway
Pair an image CDN that resizes on the fly with `cached_network_image` (actively maintained, 4.0.6 around Oct 2026) and request images at layout-width × devicePixelRatio. Use Riverpod 3.x (stable since 2025-09-10) for tenant-scoped dependency injection and per-block async state; Bloc also works. Instrument every block with impression and click events tagged with tenant, page version, block ID and experiment variant, because missing monitoring was Zalando's stated SDUI weakness.

### Cited Findings
- `cached_network_image` 4.0.6 was published about 11 days before 2026-11-10 (around late Oct 2026). Publisher: baseflow.com. 6.99k likes, 150 pub points. It uses `flutter_cache_manager ^3.4.5`. Web support is minimal and has no caching. — [pub.dev/cached_network_image](https://pub.dev/packages/cached_network_image)
- Riverpod 3.0.0 went stable on 2025-09-10 after dev builds through 3.0.0-dev.18. pub.dev lists later versions (riverpod 3.4.1, riverpod_annotation 4.0.0). — [pub.dev riverpod 3.4.1 changelog](https://pub.dev/packages/riverpod/versions/3.4.1/changelog); [riverpod_annotation changelog](https://pub.dev/packages/riverpod_annotation/changelog)
- Zalando's lessons: "gaps in monitoring" made it hard to track launched screens, so problems sometimes surfaced only as urgent fixes. Tracking schemas are server-defined. — [Zalando Appcraft](https://engineering.zalando.com/posts/2024/05/appcraft.html)
- Airbnb carries logging metadata on every `SectionContainer`. — [InfoQ on Airbnb SDUI](https://www.infoq.com/news/2021/07/airbnb-server-driven-ui/)
- rfw lists "known theoretical performance limitations". Stac publishes no benchmarks. — [pub.dev/rfw](https://pub.dev/packages/rfw); [pub.dev/stac](https://pub.dev/packages/stac)

### Inferences
- **Images:**
  - Store originals in S3 and serve through a resizing CDN (Cloudflare Images, imgproxy, Bunny Optimizer, or Laravel plus Glide behind a CDN).
  - Blocks request `?w={constraints.maxWidth*dpr}&q=75&fmt=webp|avif` and set `memCacheWidth` so decoded bitmaps aren't oversized. Confirm `memCacheWidth` in the cached_network_image API docs.
  - Send `blurhash` or a dominant color in the JSON for placeholders, and fix aspect ratios in block props to prevent layout shift.
- **Rendering:** Render pages as a `CustomScrollView` with one sliver per block. Carousels use `ListView.builder` with fixed item extents. Avoid nested shrink-wrapped lists. Keep JSON parsing off the UI isolate (`compute`/`Isolate.run`) for large pages.
- **State:**
  - Riverpod with a root `ProviderScope(overrides: [tenantConfigProvider.overrideWithValue(cfg)])`.
  - `pageLayoutProvider.family(pageId)` returns an `AsyncNotifier` with cache-then-network.
  - Per-block data providers are keyed by `block.id + source`.
  - A cart provider is shared by "add to cart" actions.
  - Bloc/Cubit works equally well. Choose the one your team knows; the multi-tenant requirement is mainly dependency injection of tenant config.
- **Crash reporting:**
  - Crashlytics is tied to the Firebase project, so it inherits the 30-app sharding problem.
  - Sentry (`sentry_flutter`) can use one organization with tags `tenant_id`, `app_id` and `layout_version`, plus release names per merchant build. This makes cross-merchant triage easier. Pricing was not verified.
  - Log `unknown_block`, `block_render_error` (catch per block with an error boundary widget) and `action_unhandled` as non-fatal events.
- **Analytics pipeline:**
  - Use a thin client SDK that batches events to a Laravel ingestion endpoint, then a queue, then a warehouse (e.g., ClickHouse or BigQuery).
  - Every event carries `tenant_id`, `app_version`, `page_id`, `page_version`, `block_id`, `block_type`, `position`, `experiment_key`/`variant`, `locale` and `platform`.
  - Optionally fan out to Firebase or GA4 per merchant.
  - This lets merchants see per-block CTR in the dashboard and powers A/B readouts.

### Gaps
- No primary-source benchmarks for SDUI rendering cost in Flutter were found.
- Sentry and Crashlytics pricing and limits, Bloc's current version, and image-CDN pricing were not researched.
- The `memCacheWidth` parameter was not confirmed from the fetched page.

---

## 8. Embedding a web checkout seamlessly in Flutter

### Takeaway
Use the first-party `webview_flutter` (4.14.1, maintained by flutter.dev) as the default. Use `flutter_inappwebview` when you need features like reading cookies and richer script injection, and accept its slow stable release cadence (6.1.5 is about 2 years old, with 6.2.0 in beta). The robust pattern has five parts:
- Hand off auth with a short-lived server-issued checkout token or cookie.
- Render a chromeless checkout server-side via an `embedded=1` flag rather than hiding headers after load.
- Detect completion primarily through a JS bridge message.
- Use URL matching as a backup signal.
- Send external payment and bank redirects out of the WebView.

### Cited Findings
- `webview_flutter` 4.14.1 was published about 4 months before (around Jul 2026). Publisher: `flutter.dev`. 4.54k likes, 160 pub points, 3.93M downloads.
  - API: `NavigationDelegate` with `onNavigationRequest` and `onPageFinished`, `WebViewController.runJavaScript` and `runJavaScriptReturningResult`, and `addJavaScriptChannel`.
  - "Use `WebViewCookieManager.setCookie` before calling `WebViewController.loadRequest`."
  - The page does not say whether cookies can be read. — [pub.dev/webview_flutter](https://pub.dev/packages/webview_flutter)
- `flutter_inappwebview`: latest stable 6.1.5 (about 2 years old) and prerelease 6.2.0-beta.3. 2.85k likes, 130 pub points, 1.33M downloads. — [pub.dev/flutter_inappwebview](https://pub.dev/packages/flutter_inappwebview)
- The GitHub repo has 3.8k stars, 2.2k forks, 133 open issues and 97 open PRs. The README lists requirements of Dart ^3.8.0 and Flutter >=3.32.0, which suggests main-branch work for recent toolchains, and it asks for donations. — [GitHub flutter_inappwebview](https://github.com/pichillilorenzo/flutter_inappwebview)
- `flutter_inappwebview` CookieManager:
  - `setCookie`, `getCookies(url)`, `getCookie(url,name)`, `deleteCookie` and `deleteCookies`.
  - Implemented with Android `CookieManager` and iOS `WKHTTPCookieStore`.
  - The docs don't say whether cookies are shared with native HTTP clients. — [inappwebview.dev CookieManager](https://inappwebview.dev/docs/cookie-manager/)

### Inferences
- **Auth handoff.**
  1. The native app is authenticated against the Laravel API with a bearer token.
  2. Before opening checkout, call `POST /api/checkout/session`. It returns a one-time, short-TTL URL like `https://store.example.com/checkout?st=…&embedded=1`.
  3. The web checkout exchanges `st` for its own session cookie server-side.
  - This avoids the unreliable work of syncing native HTTP cookies (e.g., `dio` cookie jars) with WKWebView's cookie store.
  - If you must inject cookies, set them before `loadRequest` with `WebViewCookieManager.setCookie` or the inappwebview `CookieManager`. On iOS, make sure they are set before the first load.
- **Chromeless rendering.** Have Laravel or Blade honor `embedded=1` (or a custom User-Agent suffix like `MyStoreApp/1.2 (embedded)`) to drop the header, footer and promos server-side. Injecting CSS in `onPageFinished` via `runJavaScript` works but shows a visible flash of the header. If you must inject, use `flutter_inappwebview`'s document-start `UserScript` (feature not verified on the fetched page) to inject before first paint.
- **Detecting completion.**
  - Primary: the thank-you page calls `window.AppBridge.postMessage(JSON.stringify({event:'order_completed', order_id}))` through a registered `addJavaScriptChannel('AppBridge', ...)`. This also covers SPA route changes that don't trigger navigations.
  - Backup: in `onNavigationRequest`, match `^https://store\.example\.com/(checkout/success|orders/\d+/thank-you)`, then close the WebView and route to the native order-confirmation screen.
  - Always confirm the order server-side (`GET /api/orders/{id}`) rather than trusting the URL.
- **External flows.** In `onNavigationRequest`, send non-HTTP schemes (bank apps, `intent://`, `tel:`, wallet apps) and payment-provider domains that need a full browser to `url_launcher`, and return `NavigationDecision.prevent`. 3-D Secure pages usually work inside the WebView.
- **UX polish.** Show a native app bar with a close button and a progress indicator. Handle the Android back button to step back through WebView history first. Clear checkout cookies on logout.
- **Choosing a package.** `webview_flutter` is first-party and gets steady releases, so prefer it. Switch to `flutter_inappwebview` only for document-start scripts, reading cookies or advanced interception. Pin its version and watch the 6.2.0 stable release.

### Gaps
- `webview_flutter`'s `NavigationDelegate.onUrlChange` (useful for SPA URL changes) was not confirmed on the fetched page.
- Apple Pay or Google Pay inside WKWebView/Android WebView, and payment-provider restrictions on embedded WebViews, were not researched.
- `flutter_inappwebview`'s `UserScript`, `injectCSSCode` and `shouldOverrideUrlLoading` were not verified from the fetched pages.
- No source was found on cookie sharing between native HTTP clients and WebViews in Flutter.
