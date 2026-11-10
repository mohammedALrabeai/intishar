# Zid Shopper-Feature Capability Map for a Third-Party Native App (Storefront API, Merchant API, Webhooks, WebView)

Research date: 2026-11-10. This file builds on `research_notes/جدوى منصة تطبيقات متاجر زد/zid_api_headless.md` and does not repeat its OAuth, billing, rate-limit or partner-program material. It goes down to the endpoint and field level.

**Status labels**
- **[DOC]** Documented on docs.zid.sa (the raw `.md` twin of each page was read).
- **[LIVE]** My own read-only GET against a public Zid storefront on 2026-11-10. No login, no cart writes, no orders. Stores used:
  - `pcpalace.com.sa`: 8,103 products, facets, uses an App Bunches app
  - `ppowerstore.com`: variants, reviews, pickup branches
  - `rawand.com.sa`: brands
  - `mahasen.com`: custom theme, multi-country
  - `opt.sa`: badges

  All of them load Zid's Vitrin SDK v3.33.9. This shows behaviour on that day, not a contract.
- **[SDK]** Seen in Zid's own storefront JavaScript SDK, which every Vitrin store loads (`https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js`). These are real endpoints Zid's web front end calls, but **they are undocumented and not offered to app developers**. Treat them as fragile and possibly off-limits without Zid's agreement.
- **[UNCLEAR]** Ambiguous, contradictory, or not testable without logging in.
- **[NOT FOUND]** Searched for and not found.

**Conventions**
- Storefront paths are relative to `https://{merchant-domain}/api/v1/`. The OpenAPI specs list `https://api.zid.sa/` as the server, but that host does not serve them (see the earlier notes).
- Every storefront call should send `Zid-Client-Platform: mobile-app`. Zid's own web SDK sends `"Zid-Client-Platform": "browser"` ([SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)).
- Merchant API paths are relative to `https://api.zid.sa/v1` and need OAuth.

---

## Q0. Overview: which shopper features can be native screens, which need a WebView, and which are impossible?

### Takeaway
Almost all browse and account features can be native, using the cookie-session Storefront API: catalog, faceted filters, search, product detail with variants and per-branch stock, reviews, Q&A, categories, brands, CMS pages, blog, home-page sections, store branding, cart, coupons, loyalty, wishlist, addresses and profile. Three flows must be WebViews: **checkout and payment**, **login** (by Zid's own Mobile Apps guidance, even though OTP endpoints exist), and **order detail, tracking and returns** (no shopper endpoints). There is no API for saved cards, stored-value gift-card balances, store-wide "buy X get Y" or progressive-discount rules, or "suggestions-style" autocomplete. The vendor's backend must build those, or they are unavailable.

### Cited Findings
Capability matrix. **N** = native via the Storefront API. **N\*** = native only through undocumented endpoints. **W** = WebView. **B** = vendor backend through the Merchant API or webhooks. **X** = not available.

| Feature | Mode | Endpoint / source | Status |
|---|---|---|---|
| Product grid with pagination and sort | N | `GET products` (`page`, `page_size`, `sort_by`, `order`) | [DOC](https://docs.zid.sa/list-products-25510175e0) + [LIVE](https://pcpalace.com.sa/api/v1/products?page_size=2) |
| Faceted attribute filters with counts | N | `GET products` returns `filters.attributes[].data[].count` | [LIVE](https://pcpalace.com.sa/api/v1/products?page_size=2) (response field undocumented) |
| Category, price-range and on-sale filters | N | `categories`, `price_min`, `price_max`, `on_sale` | [DOC](https://docs.zid.sa/list-products-25510175e0) + [LIVE] |
| Brand filter | N\* | `GET products?brand={uuid}` | [LIVE](https://rawand.com.sa/api/v1/products?page_size=3&brand=01a12fba-2724-7f03-ac6a-0334ad6b08e9) only |
| "In stock only" filter | X | No parameter; `in_stock` per item; store default ordering pushes out-of-stock last | [LIVE] |
| Full-text search | N | `GET products/search?q=` (prefix matching works) | [DOC](https://docs.zid.sa/search-products-25720449e0) + [LIVE] |
| Search suggestions endpoint | X | None found; reuse `products/search` | [NOT FOUND] |
| Product detail, gallery, video, variants, options | N | `GET products/{slug-or-uuid}` | [DOC](https://docs.zid.sa/get-product-by-slug-25772175e0) + [LIVE] |
| Live price for chosen options | N | `POST products/{id}/options` | [DOC](https://docs.zid.sa/calculate-product-options-price-25720485e0) |
| Custom input fields (text or file) | N | `custom_user_input_fields`, `custom_option_fields`; `POST cart/items` `custom_fields[]`; file upload | [DOC] / upload path [SDK] |
| Metafields (custom product fields) | N | `metafields[]` on product, page, category | [DOC] + [LIVE] |
| Badges ("selling fast", "free shipping"…) | N | `badge.body`, `badge.icon.code` | [LIVE](https://opt.sa/api/v1/products?page_size=40) |
| Related products | N | `related_products[]`, resolved in the detail call | [LIVE](https://ppowerstore.com/api/v1/products/RP-CB058) |
| Bundle offers / "buy together" | N | `GET products/{id}/bundle-offers`, `GET products/bundle-offers?product_ids=` | [DOC](https://docs.zid.sa/fetch-bundle-offers-for-a-product-25721877e0); response schema undocumented |
| Dynamic ("build your own") bundles | N | `GET products/{id}/selection-groups`; `POST cart/items` `sub_items[]` | [DOC](https://docs.zid.sa/get-selection-groups-25773150e0) |
| Reviews: list and histogram | N | `GET products/{id}/reviews`; `rating.{1..5}_ratings` | [DOC] + [LIVE](https://ppowerstore.com/api/v1/products/6f06bc89-0cd4-490f-9894-238a93962416/reviews?page_size=3) |
| Write, edit or delete a review with photos | N (logged in) | `POST/PATCH/DELETE products/{id}/reviews` | [DOC](https://docs.zid.sa/create-product-review-25768452e0) |
| Product Q&A | N (answers come from the merchant) | `GET/POST products/{id}/questions` | [DOC](https://docs.zid.sa/list-product-questions-25771715e0) |
| Back-in-stock sign-up | N | `POST products/{id}/stock-alerts` | [DOC](https://docs.zid.sa/notify-product-stock-availability-25721229e0) |
| Stock per branch, pickup branches | N | `stocks[]` on product and variant; `GET locations/inventories?lat&lng&fulfillment_type=pickup` | [LIVE] / inventories path [SDK] |
| Preorder (countdown, slots) | N | `preorder_campaign`, `can_be_preordered`, `preorder_slot…` | [LIVE] fields; [DOC](https://docs.zid.sa/add-preorder-support-to-your-theme-2132176m0) |
| Multi-currency prices | N | `/locales/{lang}-{country}` sets a `locale` cookie, after which prices come back converted | [LIVE] / [SDK] |
| Arabic / English | N | `Accept-Language: ar\|en` | [LIVE] |
| Category tree with images | N | `GET categories` (nested `sub_categories`) | [DOC](https://docs.zid.sa/list-categories-26082032e0) + [LIVE](https://pcpalace.com.sa/api/v1/categories) |
| Brands list and brand page | N\* | `GET brands` | [LIVE](https://rawand.com.sa/api/v1/brands) (storefront path undocumented) |
| Store main menu | N\* | `GET settings` → `settings.menus.main_menu` | [LIVE](https://mahasen.com/api/v1/settings) |
| CMS pages and policies | N | `GET pages/{slug}`; list via `GET blogs` | [DOC](https://docs.zid.sa/pages-26361426e0) + [LIVE] |
| Blog | N | `GET blogs/{slug}`; list via `GET blogs` | [DOC](https://docs.zid.sa/blogs-26361790e0) + [LIVE](https://mahasen.com/api/v1/blogs) |
| Merchant's home-page sections (banners, sliders, featured) | N (theme-specific parsing) | `GET template-settings?template=home` | [DOC](https://docs.zid.sa/theme-sections-settings-2258380m0) "early version" + [LIVE] |
| Branding (logo, colours, socials, WhatsApp) | N\* | `GET settings`, `GET storewhatsapp/widget` | [LIVE] |
| OTP login (SMS, WhatsApp, email) | N or W | `POST auth/sms\|whatsapp\|email` + verify | [DOC](https://docs.zid.sa/sms-login-38265943e0); but Zid says login must be a page view ([DOC](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)) |
| Registration, guest registration | N | `POST auth/register`, `POST auth/register/guest` | [DOC](https://docs.zid.sa/register-38268416e0) |
| Profile view, edit, delete account | N | `GET/PATCH/DELETE account` | [DOC](https://docs.zid.sa/get-profile-26363082e0) |
| Addresses with Saudi national-address fields and map pin | N | `account/addresses` CRUD; `GET locations?lat&lng` reverse geocode | [DOC](https://docs.zid.sa/create-an-address-26572341e0) + [LIVE](https://ppowerstore.com/api/v1/locations?lat=26.28&lng=50.2) |
| Wishlist, including share link | N (logged in) | `account/wishlists` | [DOC](https://docs.zid.sa/get-wishlist-26722764e0) |
| Order history list | N (logged in) | `GET account/orders` | [DOC](https://docs.zid.sa/get-orders-26722142e0); item schema undocumented |
| Order detail and shipment tracking | W, or B (Merchant API) | Merchant `GET orders/{id}` has `shipping.method.tracking{number,status,url}` | [DOC](https://docs.zid.sa/view-order-12479054e0) |
| Returns / exchanges | W, or B | Merchant Reverse Orders only | [DOC](https://docs.zid.sa/reverse-orders-1810994f0) |
| Loyalty points balance, history, redeem | N | `cart/loyalty/*` | [DOC](https://docs.zid.sa/customers-current-points-balance-26324317e0) |
| Wallet / cashback (store credit) | N\* | `account/wallet/balance`, `account/wallet/transactions`; checkout `wallet/redeem` | [SDK]; feature: [DOC](https://docs.zid.sa/customer-wallet-cashback-2072778m0) |
| Referral program | N\* | `account/referral/identity\|stats`, `cart/loyalty/referral-program` | [SDK] + [LIVE] |
| Gift order (send as a gift with a card) | N | `POST/DELETE cart/gift-cards`; `GET products/gifting/settings` | [DOC](https://docs.zid.sa/add-gift-card-26257599e0) + [LIVE] |
| Stored-value gift-card balance | X | None found | [NOT FOUND] |
| Saved payment cards | X | None found | [NOT FOUND] |
| Cart: add, update, remove, empty | N | `cart`, `cart/items` | [DOC](https://docs.zid.sa/add-cart-item-26083895e0) |
| Coupons: apply, remove, validate | N | `cart/coupons`, `cart/coupons/validations` | [DOC](https://docs.zid.sa/apply-coupon-26257791e0) |
| Bank-card discounts banner | N | `GET cart/checkout/bank-discounts` | [DOC](https://docs.zid.sa/list-bank-discounts-42100288e0) + [LIVE] |
| Free-shipping progress bar | N | `cart.free_shipping_rule.subtotal_condition{min,remaining,…}` | [LIVE](https://mahasen.com/api/v1/cart) (field undocumented) |
| VAT breakdown | N | `cart.totals[]` (`code` / `title` / `value_string`) | [DOC](https://docs.zid.sa/get-cart-26082659e0) |
| Tabby / Tamara promo messaging | N (own widget) | `settings.products.tabby_widget_enabled`, `tamara_public_key` | [LIVE] |
| Shipping-method choice, payment, place order | W | Checkout page; internal APIs exist | [DOC] says web only; [SDK] |
| Apple Pay, mada, STC Pay, Tabby, Tamara, COD | W | ZidPay-hosted checkout | [LIVE] payment list |
| Order-status, abandoned-cart and welcome push | B | Webhooks `order.status.update`, `abandoned_cart.created`, `customer.create` | [DOC](https://docs.zid.sa/webhooks) |
| Universal / App Links on the store domain | B | Merchant OneSignal settings; Zid serves AASA and `assetlinks.json` | [DOC](https://docs.zid.sa/create-or-update-onesignal-store-settings-39429264e0) + [LIVE](https://pcpalace.com.sa/.well-known/apple-app-site-association) |
| Attributing orders to the app channel | B | Merchant order `source` = `mobile_app` / "Store App" | [DOC](https://docs.zid.sa/list-of-orders) |

### Inferences
- The native surface is large enough for a full "native shell plus web checkout" app. Three things decide feasibility: (a) the WebView checkout handoff and success detection (Q8); (b) whether the app may use the undocumented endpoints marked N\* (`settings`, `brands`, `wallet`); (c) per-theme parsing of `template-settings`.
- The N\* endpoints (`/api/v1/settings`, `/api/v1/brands`, wallet, referral) are what Zid's own web front end uses daily. They are probably stable in practice but carry no contract. The Merchant API offers documented alternatives for branding, localization and brands, through the vendor backend.

### Gaps
- No live logged-in testing was done, so these response shapes are unverified: `account/orders` items, the verify-OTP responses (their docs pages return 404), wallet, referral and loyalty.
- Zid has not said whether third-party app vendors may use the undocumented endpoints.

---

## Q1. Catalog: listing, filters, sorting, search, product detail, reviews, stock, price, currency, language

### Takeaway
The catalog is strong.
- **List and search:** `GET products` and `GET products/search` take category, price range, on-sale and attribute filters, plus 4 sort keys. The live response also carries **faceted attribute counts**.
- **Product detail:** returns variants with per-location stock, option metadata (colour or image swatches), badges, related products, rating histogram, preorder data, SEO, metafields and sale-price periods.
- **Missing:** a documented brand filter (`brand=` works live), an in-stock filter, and a dedicated autocomplete endpoint.
- **Search paging:** search returns a fixed 10 results per page.

### Cited Findings
**Listing and filters**
- [DOC] `GET /products` takes `page` (default 1), `page_size` (default 24), `q`, `sort_by` ∈ {`popularity_order`, `price`, `display_order`, `created_at`}, `order` ∈ {`asc`, `desc`}, `categories` (category id), `price_min`, `price_max`, `on_sale` and `attribute_values[]`. The spec shows these as a JSON body on a GET request. — [List Products](https://docs.zid.sa/list-products-25510175e0)
- [LIVE] The same parameters work as query strings: `categories=412823` → 1,409 of 8,103 products; `price_min=100&price_max=200` → 554; `sort_by=price&order=desc` and `sort_by=created_at&order=desc` sort correctly. `page_size` is **capped at 100** (asking for 500 returned 100). — [pcpalace products](https://pcpalace.com.sa/api/v1/products?page_size=100)
- [LIVE] The list response is `{results, count, page, page_size, filters, next, previous, pages_count}`.
  - `filters.attributes[]` holds facets: `name`, `slug`, `display_order`, `is_enabled`, and `data[]` items of `{id, value, type, type_value, count}`. For example, Processor → i9 (98), i7… across 16 attribute facets.
  - Facet counts change with the other filters. With a price filter, the RAM facet showed counts of 1, 4, 8…
  - The field is undocumented.
  - On another store `filters` was `{}`. That store's settings show `products.has_products_filtration: false`, which suggests the merchant must enable filtration.

  — [pcpalace products](https://pcpalace.com.sa/api/v1/products?page_size=2); [mahasen settings](https://mahasen.com/api/v1/settings)
- [LIVE] Brand filter: `brand={brand_uuid}` filters correctly (96 HP products of 528). `brands=` and `brand_id=` are silently ignored. — [rawand products?brand=](https://rawand.com.sa/api/v1/products?page_size=3&brand=01a12fba-2724-7f03-ac6a-0334ad6b08e9)
- [LIVE] There is no availability filter parameter. Each item carries `in_stock`, `quantity` and `is_infinite`. Store settings expose `products.default_products_ordering: "-is_infinite,-quantity"` (out-of-stock items sort last), plus `low_stock_label_enabled` and `low_stock_quantity_threshold: 10` for "only N left" labels. — [mahasen settings](https://mahasen.com/api/v1/settings)

**Search**
- [DOC] `GET /products/search` takes the same parameters, and is described as "optimized for search-driven experiences (e.g., global search, autocomplete results…)". — [Search Products](https://docs.zid.sa/search-products-25720449e0)
- [LIVE] Search returned exactly 10 results whatever `page_size` was (2 or 30), with `page_size: 10` in the response.
  - Prefix and partial matching works: `q=del` matched "Dell" products, 680 hits; `q=hp` gave 764 hits.
  - Search items came back with an empty `categories` array.

  — [pcpalace search](https://pcpalace.com.sa/api/v1/products/search?q=del&page_size=2)
- [NOT FOUND] No suggestions, popular-searches or typo-tolerance endpoint in the docs index or in the SDK. — [llms.txt](https://docs.zid.sa/llms.txt); [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)

**Product detail**
- [DOC] `GET /products/{slug}` documents these fields:
  - Identity and pricing: `id`, `sku`, `barcode`, `name` (localized by `Accept-Language`), `price`, `sale_price`, `formatted_price`, `formatted_sale_price`, `currency`, `currency_symbol`
  - Structure: `attributes[]`, `categories[]`, `has_options`, `has_fields`, `images[]`, `videos[]`, `quantity`, `is_infinite`, `html_url`, `weight`, `keywords`, `requires_shipping`, `is_taxable`, `structure`
  - SEO and social proof: `seo{title,description}{ar,en}`, `rating` (average, total, and count and percentage per star)
  - `purchase_restrictions`: `min_quantity_per_cart`, `max_quantity_per_cart`, `availability_period_start` / `availability_period_end`, `sale_price_period_start` / `sale_price_period_end`
  - Extras: `metafields[]`, `meta.location_id`, `related_products_settings`, `related_products_title`, `badge`
  - `variants[]`, each with `stocks[]` of `{location{id,name,type,full_address}, available_quantity, is_infinite}`

  — [Get Product by Slug](https://docs.zid.sa/get-product-by-slug-25772175e0)
- [LIVE] The same path accepts the product **UUID** as well as the slug. The response adds fields that are not in the spec:
  - `description` (HTML)
  - `options[]`: `{id, name, slug, choices[], choices_metadata{choice:{id, value{ar}, type, type_value}}}`, where `type` / `type_value` drive colour or image swatches ([DOC] [Display options as colours/images](https://docs.zid.sa/display-product-options-as-colors-or-images-2264161m0))
  - `variants[]` (each a full product object with its own price, `sale_price`, `quantity` and `stocks[]`)
  - `default_variant_id`, `selected_variant`, `related_products[]` (fully resolved product objects)
  - `media[]`, `main_image`, `brand{id,name,…}`, `brand_name`, `shipping_badges[]`
  - `discount_percentage`, `effective_price`, `in_stock`, `group_products`
  - Preorder fields: `preorder_campaign`, `effective_preorder_campaign`, `can_be_preordered`, `preorder_slot`, `preorder_slots_available`, `preorder_stock_behavior`
  - `custom_input_fields`, `custom_user_input_fields`, `custom_option_fields`

  — [ppowerstore product RP-CB058](https://ppowerstore.com/api/v1/products/RP-CB058)
- [LIVE] Images come in several sizes: `images[].image{full_size, large, medium, small, thumbnail}` and `alt_text`, served through the `img.zid.store` resizing CDN. — [pcpalace products](https://pcpalace.com.sa/api/v1/products?page_size=2)
- [LIVE] Variant stock per branch: variant `stocks[]` returned `location.name: "الخبر - العليا"`, `type: "PHYSICAL"`, `full_address`, `available_quantity: 117` and `is_available: true`. — [ppowerstore product](https://ppowerstore.com/api/v1/products/RP-CB058)
- [LIVE] Badge examples: `{"body":{"ar":"يباع سريعًا"},"icon":{"code":"selling_fast"}}`. Icon codes seen: `discount_value`, `limited_quantity`, `selling_fast`, `featured_product`, `free_shipping`. Merchant free-text badges have `icon: null`. — [opt.sa products](https://opt.sa/api/v1/products?page_size=40)
- [DOC] `POST /products/{product_id}/options` takes `{attributes, option_fields, input_fields[]}` and returns the resolved price for the selection. The JS SDK equivalent `zid.products.getProductOptions` "returns an updated ProductObject (resolved variant, price, stock)". — [Calculate Product Options Price](https://docs.zid.sa/calculate-product-options-price-25720485e0); [JS Products](https://docs.zid.sa/products-1475307m0)
- [DOC] `GET /products/{id}/selection-groups` returns `selection_group_id`, `name`, `required_selection_count`, `allow_duplicate_items` and `items[{item_id, variants[]}]` for dynamic bundles. [LIVE] A normal product returns 400 `"المنتج ليس حزمة مرنة."` ("the product is not a flexible bundle"). — [Get Selection Groups](https://docs.zid.sa/get-selection-groups-25773150e0); [Dynamic Bundle Products](https://docs.zid.sa/dynamic-bundle-products-1893948m0)
- [DOC] Bundle offers: `GET /products/{id}/bundle-offers` and `GET /products/bundle-offers` (`product_ids[]`). The response schema is only "Bundle offers fetched successfully". [LIVE] Stores without offers returned `null` and `{"code":"SUCCESS_WITH_LIST_PAYLOAD_OBJECTS","payload":[]}`. — [Fetch Bundle Offers for a Product](https://docs.zid.sa/fetch-bundle-offers-for-a-product-25721877e0)

**Reviews and Q&A**
- [DOC] Reviews: list (`page`, `page_size`); create as multipart (`rating` 1–5, `comment`, `is_anonymous`, `order_id`, repeatable `images`); update (`deleted_images`, `append_extra_images`); delete; "my reviews" (`GET products/reviews/me`); `GET account/products/{id}/purchase-check` → `bought_this_item`. — [Create Product Review](https://docs.zid.sa/create-product-review-25768452e0); [Check Product Purchase Status](https://docs.zid.sa/check-product-purchase-status-26761806e0)
- [LIVE] Review item shape: `{id, customer{id,name}, bought_this_item, is_anonymous, rating, comment, reply, images[], created_at, status:"approved", edit_requested}`. `reply` is the merchant's reply. — [ppowerstore reviews](https://ppowerstore.com/api/v1/products/6f06bc89-0cd4-490f-9894-238a93962416/reviews?page_size=3)
- [DOC] Questions: `GET /products/{id}/questions` and `POST` (`name`, `email`, `question`, `is_anonymous`). Answers are created by the merchant through the Merchant API Q&A endpoints. — [List Product Questions](https://docs.zid.sa/list-product-questions-25771715e0); [Merchant Q&A](https://docs.zid.sa/product-questions-answers-1810995f0)
- [LIVE] Store toggles in `settings.products`: `reviews_enabled`, `questions_enabled`, `wishlist_enabled`, `is_metafields_enabled`. — [mahasen settings](https://mahasen.com/api/v1/settings)

**Stock alerts**
- [DOC] `POST /products/{id}/stock-alerts` takes `{customer_email, customer_phone_number, customer_name}`. [SDK] The web SDK also posts to `api/v1/availability/notifications`. — [Notify Product Stock Availability](https://docs.zid.sa/notify-product-stock-availability-25721229e0)

**Multi-inventory and pickup**
- [LIVE] `GET locations/inventories?lat=…&lng=…&fulfillment_type=pickup` lists the merchant's branches: `{id, coordinates{latitude, longitude}, name, full_address, short_address, district, street, city{…}, distance_m, shipping_met…}`. Without `fulfillment_type` it returns 422.
- [SDK] More paths: `locations/zones`, `locations/selection`, `locations/destinations`, `locations/search`.
- [LIVE] Related settings: `filter_by_city`, `city_selection_required`, `filter_by_nearest_inventory`, `zones{selection_enabled, precision:"city"}`, and checkout `show_pickup_option_stock_availability_for_checkout`.

  — [ppowerstore inventories](https://ppowerstore.com/api/v1/locations/inventories?lat=26.28&lng=50.2&fulfillment_type=pickup); [Region & Language Popup](https://docs.zid.sa/region-language-popup-1861342m0)

**Price, tax and currency**
- [LIVE] Tax: `settings.general.tax_settings` gives `tax_percentage: 0.15`, `tax_activate`, `is_tax_included_in_product_price: true` (on both stores tested) and `is_shipping_fee_included_in_tax`. Product prices are therefore VAT-inclusive on those stores. — [mahasen settings](https://mahasen.com/api/v1/settings)
- [LIVE] Multi-currency:
  - `GET /locales/ar-AE?redirect_to=/` returned 307 and set an HttpOnly `locale=ar-ae` cookie.
  - The next `GET products` returned converted prices: 765.00 SAR → 750.4 AED, `currency: "AED"`.
  - `settings.countries[]` lists the selling countries (6 on this store) with `currency_code`, `flag` and `names{ar,en}`.
  - `settings.general.currency` has `symbol_left`, `symbol_right`, `format` and `exchange_rate`.
  - [SDK] The web SDK builds the same `/locales/{lang}-{country}?redirect_to=…&city_id=…` URL.

  — [mahasen settings](https://mahasen.com/api/v1/settings); [SDK set-locale chunk](https://static.zid.store/sdk/v3.33.9/vendor/set-locale-DJBH2viY.js)
- [LIVE] Language: `Accept-Language: en` returned "HP 216A Black Original LaserJet Toner Cartridge" and `formatted_price: "265.00 SAR"`. `ar` returned the Arabic name and "ر.س". Some fields are always bilingual objects `{ar, en}` (SEO, category description, options). — [rawand products](https://rawand.com.sa/api/v1/products?page_size=1)
- [DOC] Merchant API `GET /v1/managers/account/store/localization` (scope `third_store_details_read`) returns the store's `languages[]` (with `direction`) and `currencies[]`. — [Localization](https://docs.zid.sa/localization-33664641e0)

**Digital products**
- [DOC] Downloadable files and digital vouchers are managed through the Merchant API (Create Downloadable Product, Order Vouchers). — [llms.txt index](https://docs.zid.sa/llms.txt)

### Inferences
- The facet response means a designer can promise a Shopify-style filter sheet: attribute chips with counts, a price slider, on-sale and category. The brand filter is usable but undocumented, and stock availability works only as a sort, not a filter.
- Autocomplete must call `products/search` with debouncing. It always gets 10 product hits with no category or query suggestions. "Recent searches" and "popular searches" would have to be stored by the app or vendor.
- Countdown timers for sales can be driven by `purchase_restrictions.sale_price_period_end`. Preorder countdowns can be driven by the preorder campaign fields.
- Per-branch stock combined with `locations/inventories` makes "available at branch X / pick up today" screens possible.

### Gaps
- No video payloads were seen populated, so the shape of `videos[]` and `media[]` video items was not observed.
- The digital-product download flow for shoppers was not found in the storefront API. It is probably email or the web account page.
- The bundle-offer response schema is unknown, because no live store tested had active offers.
- The maximum page size is undocumented. 100 was observed.

---

## Q2. Categories and navigation: tree, images, brands, collections, menus, pages, blog

### Takeaway
All navigation data is available without auth:
- **Categories:** a nested category tree with images.
- **Brands:** a brands list with logos (undocumented storefront path).
- **Menu:** the merchant's main menu, inside the undocumented `settings` payload.
- **Pages and blog:** CMS pages by slug, and a combined pages-and-posts list.

There is no "collections" object. Merchants use categories (for example a "Weekly Offers" category) and home-page sections instead.

### Cited Findings
- [LIVE] `GET categories` returns an array of top-level categories:
  - Fields: `id`, `uuid`, `name`, `slug`, `description`, `image` (260×260), `image_full_size`, `cover_image`, `img_alt_text`, `seo{title,description}`, `url`, `products_count`, `metafields[]`, `parent_id`, `is_published`
  - Nesting: `sub_categories[]`, observed up to 3 levels deep. The response for 22 top categories was 231 KB.

  [DOC] lists the endpoint without a schema. — [pcpalace categories](https://pcpalace.com.sa/api/v1/categories); [List Categories](https://docs.zid.sa/list-categories-26082032e0)
- [LIVE] `GET brands` returns `{results[{id, name, display_name, slug, logo, url:"/brands/hp", products_count, description}], count, page, page_size:24, pages_count}`. It returned an empty list on stores without brands. The storefront path is undocumented. The Merchant API documents `GET /v2/products/brands` (search, `is_active`, ordering), with `logo`, `seo_title` and `seo_content` in {ar, en}. — [rawand brands](https://rawand.com.sa/api/v1/brands); [List Brands (Merchant)](https://docs.zid.sa/list-brands-43653974e0)
- [LIVE] Menus: `GET menus` and `GET store` return 404. The main menu is in `GET settings` under `settings.menus.main_menu` as `{id, label, title, slug, type, enabled, items[{id, label, slug, url:"/products/", is_system_page, items[], resource_type:"products", sort_order}], children}`. [DOC] The Store Settings Mapping page documents `store.settings.menus.main_menu.*`, with children in `items/children`, as the theme-side object. — [mahasen settings](https://mahasen.com/api/v1/settings); [Store Settings Mapping](https://docs.zid.sa/store-settings-mapping-1379317m0)
- [DOC] + [LIVE] `GET pages/{slug}` returns `{id, title, content (HTML), slug, seo, priority, metafields, updated_at}`. For example, `privacy-policy` returned the store's policy. There is no `GET pages` list (404). — [Pages](https://docs.zid.sa/pages-26361426e0); [ppowerstore page](https://ppowerstore.com/api/v1/pages/privacy-policy)
- [LIVE] The undocumented `GET blogs` list returns an array that **mixes CMS pages and blog posts**:
  - On mahasen, 36 items: "المدونة", "من نحن ؟" (About us), "ضمان محاسن" (warranty), then articles.
  - On pcpalace it included "سياسة الخصوصية" (privacy policy).
  - Fields: `{id, title, content, slug, seo, priority, metafields, updated_at, i18n_SEO_page_title, …}`.

  [DOC] `GET blogs/{slug}` returns a single post. The Merchant API also lists "Blogs > Storefront > Posts / Categories / Tags" endpoints. — [mahasen blogs](https://mahasen.com/api/v1/blogs); [Blogs](https://docs.zid.sa/blogs-26361790e0); [llms.txt](https://docs.zid.sa/llms.txt)
- [LIVE] `settings.policies` gives flags `privacy_policy`, `refund_exchange_policy`, `terms_and_conditions`, `complaints_and_suggestions` and `licensing`, each `{enabled}`. `settings.blog.is_enabled` and `settings.brands.is_enabled` are also present. — [mahasen settings](https://mahasen.com/api/v1/settings)
- [DOC] The theme JS SDK exposes `zid.store.getTermsAndCondition()`, `getPrivacyPolicy()`, `getFaqs()` and `getShippingAndPayment()`. Their REST paths are not documented, and `GET faqs` returned 404. — [JS Store](https://docs.zid.sa/store-1578829m0)
- [LIVE] "Collections": the merchant's home sections reference categories used as curated lists (for example `more_url: "/categories/413265/weekly-offers"`). `settings.theme_rules[]` can map URL paths such as `l/national-day` to product landing pages. — [pcpalace template-settings](https://pcpalace.com.sa/api/v1/template-settings?template=home); [mahasen settings](https://mahasen.com/api/v1/settings)

### Inferences
- The app can build a native category browser, mega-menu, brand grid and brand page (`products?brand=`) with no backend.
- The app can mirror the web main menu, but menu items carry storefront URLs (`/products/`, `/categories/{id}/{slug}`, `/brands/hp`). The app needs a URL-to-screen router for these, and the same router serves deep links.
- The FAQ page has no known REST path. Use a WebView of `/faqs`, or have the vendor maintain FAQ content.

### Gaps
- The REST paths for FAQs, terms and shipping-and-payment info used by `zid.store.*` were not identified.
- The `settings.menus` payload contains only `main_menu`. Footer link groups live in theme global settings (see Q3).

---

## Q3. Store theme and home data: can the app read the merchant's home-page configuration and branding?

### Takeaway
Yes, with caveats.
- **Home sections:** `GET template-settings?template=home` returns the merchant's ordered home sections with **fully resolved data**: slider images and links, banner grids, embedded category and product objects. Section keys are **theme-specific**, though. Zid's normalizing `meta.type` field is experimental and populated only by themes that declare it.
- **Branding:** the undocumented `GET settings` returns everything a branded app shell needs: logo, mobile-app logo, colour palette, social links, phone, email, announcement bar, store open or closed state, and BNPL widget flags. The WhatsApp widget config has its own endpoint.

### Cited Findings
- [DOC] "Template settings are now accessible through the Storefront APIs: `GET api/v1/template-settings?template=home`… This is an **early version** and is subject to change." `meta.type` is "currently applied only to Soft Theme Vitrin". — [Theme Sections Settings](https://docs.zid.sa/theme-sections-settings-2258380m0)
- [LIVE] Only `template=home` is accepted. `template=product` returned 422 `"Input should be 'home'"`. — [mahasen template-settings product](https://mahasen.com/api/v1/template-settings?template=product)
- [LIVE] The response shape is `{settings: {...global theme settings...}, components: [{section_id, template, display, meta, settings}]}`.
  - On pcpalace (a stock-style theme), components had `template` values `sections/main-slider.jinja`, `sections/home-categories-section.jinja`, `sections/home-banners-section.jinja` and `sections/offers.jinja`, and `meta` was `{}` or null.
  - Settings examples:
    - `slider[{link:"/categories/1261106/gaming-pc", type:"image", image}]`, `autoplay`, `height_mobile`
    - `categories[{bg, category{…full category…}}]`
    - `ads[{link, image, show_button}]`, `display_type:"four_columns"`
    - `products[{product{…full product…}}]`, `more_url`, `banner_image`
  - The response was **11 MB**, because product and category objects are embedded.

  — [pcpalace template-settings](https://pcpalace.com.sa/api/v1/template-settings?template=home)
- [LIVE] On mahasen (a custom theme), every section *did* declare `meta.type` (`mh-hero`, `mh-stats`, `mh-packs`, `mh-reviews`, `mh-faq`…). These are bespoke types with bespoke settings keys (`title1`, `counter_text`, `show_counter`…). — [mahasen template-settings](https://mahasen.com/api/v1/template-settings?template=home)
- [LIVE] Global theme `settings` (pcpalace) holds footer and header data: `links_links`, `links_title`, `about_us_des`, `about_us_image`, `news_text` / `news_items` (ticker), `menu_logo`, `mega_menu_show`, `color_settings_bg`, `apps_payments_hide`… — [pcpalace template-settings](https://pcpalace.com.sa/api/v1/template-settings?template=home)
- [LIVE] `GET settings` (undocumented, about 22–71 KB) returns:
  - Top level: `name`, `logo`, `icon`, `phone`, `email`, `language`, `languages[]`, `country`, `countries[]`, `timezone`, `theme{id, version, theme_name}`
  - `settings.branding`: `colors{primary, on_primary, primary_variant, secondary, on_secondary, secondary_variant}`, `logo`, `icon`, `cover`, `mobile_app_logo`, `copyrights`, `description`, `seo`
  - `settings.contact`: `instagram`, `snapchat`, `tiktok`, `twitter`, `facebook`, `phone`, `email`, `website`, `business_center`
  - `settings.about_us`, `settings.announcement_bar`
  - `settings.general.availability`: `is_store_closed`, `closed_now`, `title`, `message`, `time_until_reopening`, `is_store_browsable`
  - `settings.seo_pages`, `settings.badges[]`

  These paths match the documented Jinja `store.settings.*` mapping. — [mahasen settings](https://mahasen.com/api/v1/settings); [Store Settings Mapping](https://docs.zid.sa/store-settings-mapping-1379317m0)
- [LIVE] `GET storewhatsapp/widget` returns `settings{status, type, label, position, size, style, theme, icon_color, background_color, phone_number, intro_message}`. — [mahasen WhatsApp widget](https://mahasen.com/api/v1/storewhatsapp/widget)
- [DOC] Merchant API alternative: `GET /v1/managers/account/store/branding` (scope `third_store_details_read`) returns `theme{id, code, name}`, `logo`, `logos{ar,en}`, `cover`, `icon`, and button `colors{btn_default_background_color,…}`. — [Branding](https://docs.zid.sa/branding-33664604e0)
- [LIVE] Mobile-app promo data already in the store model: `settings.general.mobile_app_tab{is_active, icon, name{ar,en}, developer_name, promotion_description}` and `settings.general.one_signal{android_package_name:"com.appsbunches.pcpalace", ios_app_id:"6737545437"}`. Zid's `smartbanner.js` is loaded on that store. — [pcpalace settings](https://pcpalace.com.sa/api/v1/settings); [smartbanner.js](https://static.zid.store/sdk/v3.33.9/theme-statics/smartbanner.js)

### Inferences
- **"Mirror my website home page" works best per theme.** A generic renderer can support well-known Zid themes (Soft Vitrin with `meta.type`, plus popular marketplace themes) by mapping `template` file names to native widgets. For bespoke themes like mahasen, fall back to an app-side home builder (vendor CMS) or a WebView section.
- The 11 MB payload makes `template-settings` unsuitable to call on every launch. The vendor backend should fetch, slim and cache it, or the app should cache it with ETags.
- Branding (colours, logos, `mobile_app_logo`) can auto-theme the app at onboarding. Zid already has a `mobile_app_logo` slot meant for apps.

### Gaps
- `meta.type` coverage across Zid's theme marketplace is unknown. Zid gives no list of standard section types beyond "slider".
- It is not documented whether `template-settings` returns preview or draft content or only the published theme. Observed responses appear to be the published theme.

---

## Q4. Customer: login, registration, guest, profile, addresses, wishlist, orders, tracking, returns, loyalty, wallet, gift cards, saved cards

### Takeaway
Profile, addresses (with Saudi national-address fields and map-pin reverse geocoding), wishlist, order list, loyalty and newsletter consent are all native-capable once the shopper is logged in. Login itself:
- **API:** OTP endpoints exist (SMS, WhatsApp, email, register, guest).
- **Zid's guidance:** Zid's Mobile Apps page says to do login as a web page view. The web login redirects to `sso.zid.store`.
- **Turnstile:** Cloudflare Turnstile can gate OTP requests.

Order detail and tracking, returns, saved cards and stored-value gift cards are **not** in the Storefront API. Order detail and tracking can be served through the vendor backend from the Merchant API. Returns, saved cards and gift-card balances cannot.

### Cited Findings
**Login and registration**
- [DOC] OTP endpoints:
  - `POST auth/sms` (`mobile_number`, `country_code`, `resend`), `POST auth/email` (`email`, `resend`), `POST auth/whatsapp`
  - Responses include `login_type`, `status`, `channel`, `email_exists`, `customer_id`, `cart_session_id`, `is_active_abandoned_cart_merged`, `has_addresses`
  - `POST auth/register?register_type=SMS|Email|Whatsapp` (`name`, `email`, `country_code`, `mobile_number`, `is_newsletter_subscriber`)
  - `POST auth/register/guest` (`name`, `email`, `mobile_number`, `country_code`, `override_required_shipping`)
  - `POST auth/logout`, `GET auth/login-status`

  — [SMS Login](https://docs.zid.sa/sms-login-38265943e0); [Email Login](https://docs.zid.sa/email-login-38267924e0); [Register](https://docs.zid.sa/register-38268416e0); [Register Guest](https://docs.zid.sa/register-guest-38268430e0)
- [UNCLEAR] The Verify SMS, WhatsApp and Email doc pages listed in the index returned the 404 docs shell on 2026-11-10. [SDK] The web SDK posts to `auth/sms/verify`, `auth/email/verify` and `auth/whatsapp/verify` with a `register_type` query parameter. — [llms.txt](https://docs.zid.sa/llms.txt); [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)
- [DOC] Zid says "The Storefront APIs do **not** provide endpoints for login or checkout… This applies to the **login page** and the **checkout page** only." — [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- [LIVE] Web login flow: `GET /auth/login` → 302 to `https://sso.zid.store/auth/login?redirect_to=https%3A%2F%2Fppowerstore.com%2F&has_products=false`. `/account` and `/account/orders` → 307 to `/auth/login?redirect_to=%2Faccount`. — [ppowerstore /auth/login](https://ppowerstore.com/auth/login)
- [LIVE] / [SDK] Bot protection: `auth/login-status` returns `is_turnstile_exempt`. It was `true` on 2026-11-10 with platform headers `browser`, `mobile-app` and none. When a store is not exempt, the SDK loads Cloudflare Turnstile before OTP calls. Stores also sit behind Cloudflare (a `__cf_bm` cookie was set). — [login-status](https://ppowerstore.com/api/v1/auth/login-status)
- [SDK] Besides the `session` cookie, the SDK and the checkout page use a token: `localStorage["vitrin-auth-token"]` is sent as `Authorization: Bearer`, plus an `x-vitrin-guest-auth-session` header and `x-csrftoken` from the `csrftoken` cookie. — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js); [checkout page HTML](https://ppowerstore.com/checkout/guest)
- [LIVE] Store login options are in `settings.customers`: `login_by_sms_enabled`, `login_by_email_enabled`, `login_by_whatsapp_enabled`, `show_login_as_popup`, `is_customers_email_mandatory`, `show_marketing_consent_checkbox_in_login`. Guest options are in `settings.checkout`: `is_buy_as_a_guest_enabled`, `is_direct_guest_checkout_enabled`, `is_buy_as_b2b_enabled`. — [mahasen settings](https://mahasen.com/api/v1/settings)
- [NOT FOUND] Social login (Google, Apple, Snapchat) for shoppers: none in the docs index, SDK or settings. — [llms.txt](https://docs.zid.sa/llms.txt)

**Profile**
- [DOC] `GET account` returns `id`, `name`, `mobile`, `mobile_object`, `email`, `hashed_id`, `hashed_mobile`, `hashed_email`, `verified`, `is_newsletter_subscriber`, `created_at`. `PATCH account` updates `name`, `email`, `is_newsletter_subscriber`, `gender`, `birth_date`. `DELETE account` permanently deletes the account. — [Get Profile](https://docs.zid.sa/get-profile-26363082e0); [Update Customer Profile](https://docs.zid.sa/update-customer-profile-26364098e0); [Delete Account](https://docs.zid.sa/delete-account-26363588e0)
- [SDK] There is also `account/b2b-profile` (GET and PATCH). — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)

**Addresses**
- [DOC] `account/addresses` CRUD body:
  - Required: `address_district`, `address_city_id`, `address_country_id`
  - Optional: `address_type`, `name`, `mobile`, `address_street`, `address_formatted`, `short_address`, `address_lat`, `address_lng`, `is_default`, and `meta{city_name, postcode, building_number, additional_number}`
  - `?set_shipping_address=true` also sets the address on the current cart
  - `GET account/addresses/schema?country_code=` returns a dynamic per-country form (it returned 401 for guests)

  — [Create an Address](https://docs.zid.sa/create-an-address-26572341e0); [JS Account](https://docs.zid.sa/account-1579470m0); [Get Address Form Schema](https://docs.zid.sa/get-address-form-schema-26761547e0)
- [LIVE] Saudi national address support:
  - `GET locations?lat=26.28&lng=50.2` returned `{"address":"EEDA4458، 4458 4، 8374، حي الخبر الجنوبية، الخبر 34621، السعودية","city":"الخبر","country":"SA","district":"حي الخبر الجنوبية","street":"4","cityId":"31"}`. `EEDA4458` is the national-address short code.
  - Store flags: `spl_in_address_enabled`, `gmaps_in_address_enabled`, `gmaps_in_address_mandatory`, `gmaps_or_spl_enabled`.
  - `checkout.address_field_settings[]` gives per-field `is_mandatory`, `is_active` and `display_name{ar,en}` for district, street, building_number, additional_number and postal code.
  - [SDK] adds `locations/national-address` and `orders/{id}/national-address`.

  — [ppowerstore locations](https://ppowerstore.com/api/v1/locations?lat=26.28&lng=50.2); [mahasen settings](https://mahasen.com/api/v1/settings)
- [LIVE] `GET countries/{id}/cities` returns `cities[{id, national_id, ar_name, en_name, name, priority, country_id, region_id}]`, 111 KB for Saudi Arabia. — [ppowerstore cities](https://ppowerstore.com/api/v1/countries/184/cities)

**Wishlist**
- [DOC] Wishlist endpoints:
  - `GET account/wishlists` (`page`, `page_size`, `share_token`). Items include `in_stock`, `effective_price`, `discount_percentage`, `badge`, `added_at`, `main_image`.
  - `POST account/wishlists` with `product_ids[]` (bulk)
  - `DELETE account/wishlists/{product_id}`
  - `GET account/wishlists/share-link`

  — [Get Wishlist](https://docs.zid.sa/get-wishlist-26722764e0)
- [LIVE] For guests, `GET account/wishlists` returns 400 `{"customer":"Customer is required."}`. There is no guest wishlist. — [ppowerstore wishlist](https://ppowerstore.com/api/v1/account/wishlists)

**Orders and tracking**
- [DOC] `GET account/orders` (`page`, `page_size`) returns `{results[], count, page, page_size}`, but the item schema is not documented. [LIVE] It returns 401 for guests. — [Get Orders](https://docs.zid.sa/get-orders-26722142e0)
- [NOT FOUND] No storefront "get one order", tracking or invoice endpoint.
- [SDK] Order-scoped calls exist only for: `orders/{code}/transaction-slip` (upload a bank-transfer receipt), `orders/{code}/reviews`, `orders/recipient-address`, `orders/{id}/national-address`. — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)
- [DOC] Merchant API `GET /v1/managers/store/orders/{id}` includes:
  - Status: `order_status{name, code}`, `display_status{id, code, color, name}`, `payment_status`, `is_gift_order`
  - Shipping: `shipping.method{name, code, icon, estimated_delivery_time, waybill, waybill_tracking_id, tracking{number, status, url}, courier, return_shipment, packages_count}`, `order_shipping_status`
  - Money: `payment.method{name, code}`, `invoice[{code: sub_totals_before_vat | coupon | vat | total…, value_string}]`
  - Documents and channel: invoice PDF URLs, `source`, `marketing_source`

  — [View Order](https://docs.zid.sa/view-order-12479054e0)
- [DOC] Order status values usable for filtering: `new`, `preparing`, `ready`, `inDelivery`, `delivered`, `cancelled`. [SDK] The UI strings also include `reversed` and `reverse_in_progress`. — [Webhooks](https://docs.zid.sa/webhooks)

**Returns**
- [DOC] Returns exist only in the Merchant API "Reverse Orders" group: create reverse order, reasons, waybill, calculate totals, refund, upload bank-transfer receipt, update returned products, order view for return. — [Reverse Orders](https://docs.zid.sa/reverse-orders-1810994f0)
- [NOT FOUND] No shopper-initiated return request in the Storefront API or SDK.

**Loyalty, wallet, referral**
- [DOC] Loyalty endpoints (under `cart/loyalty/`): `balance`, `wallet` (paginated history), `redemption-options`, `calculate?cart_total=` (points the shopper will earn), `POST/DELETE redemptions` (`method_ids[]`). [LIVE] When loyalty is off they return 400 `exceptions.LoyaltyNotEnabledException`. The store flag is `settings.checkout.is_loyalty_enabled`. — [Customer's Current Points Balance](https://docs.zid.sa/customers-current-points-balance-26324317e0); [mahasen redemption-options](https://mahasen.com/api/v1/cart/loyalty/redemption-options)
- [SDK] Customer wallet (store credit):
  - Balance and history: `account/wallet/balance`, `account/wallet/transactions`
  - Use at checkout: `cart/checkout/wallet/redeem`, `cart/checkout/wallet/remove`
  - Store flag: `is_customer_wallets_enabled` ([LIVE] true on mahasen)
  - [DOC] The theme feature page describes cashback (percentage or fixed, optional expiry) on Elite / Professional plans. The Merchant API has "Customer Wallets".

  — [Customer Wallet & Cashback](https://docs.zid.sa/customer-wallet-cashback-2072778m0); [Merchant Customer Wallets](https://docs.zid.sa/customer-wallets)
- [SDK] Referral paths: `account/referral/identity`, `account/referral/stats`, `account/referral/orders/{id}`, `cart/loyalty/referral-program`. [LIVE] A store without a programme returned 404 `"لم يُعدّ برنامج إحالة لهذا المتجر."` ("no referral programme has been set up for this store"). — [mahasen referral-program](https://mahasen.com/api/v1/cart/loyalty/referral-program)
- [SDK] / [LIVE] Third-party loyalty (Qitaf, Mokafaa, MoneyHash): `cart/qitaf/otps`, `cart/qitaf/redemptions`, `cart/moneyhash/burn|earn|status`, with flags `is_qitaf_enabled`, `is_mokafaa_enabled`, `is_moneyhash_qitaf_enabled`. — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)

**Gift cards and saved cards**
- [DOC] "Gift card" in Zid's storefront means **gifting an order**: `POST cart/gift-cards` with `receiver_name`, `sender_name`, `gift_message`, `media_link`, `card_design` or `card_design_file`, `recipient_country_code`, `recipient_mobile`. The result appears in `cart.gift_card_details`. [LIVE] `GET products/gifting/settings` returns `is_enabled`, `is_v2_enabled`, `message_templates` and a `card_builder` layout. — [Add Gift Card](https://docs.zid.sa/add-gift-card-26257599e0); [New Gifting Experience](https://docs.zid.sa/new-gifting-experience-2381965m0); [mahasen gifting settings](https://mahasen.com/api/v1/products/gifting/settings)
- [NOT FOUND] No stored-value gift card or balance redemption for shoppers. Merchant "Digital Vouchers" are codes sold as products. — [llms.txt](https://docs.zid.sa/llms.txt)
- [NOT FOUND] No saved or tokenized cards in the Storefront API or SDK. Card entry happens on the ZidPay-hosted checkout.

### Inferences
- **Recommended login:** native OTP screens give the best UX and are technically present. But Zid's explicit page-view rule, the undocumented verify responses and Turnstile make the **WebView SSO login (`/auth/login` → `sso.zid.store`) the safe default**. Native OTP could be piloted after confirming with Zid.
- After login the app can read `GET account` (`id`, `hashed_id`) for identity, push targeting and personalization.
- An "order detail and tracking" screen should be either:
  - (a) a WebView of the account order page, or
  - (b) native, fed by the vendor backend calling the Merchant API View Order with an ownership check against the logged-in customer `id`. Never expose Merchant tokens to the app.
- Returns should be a WebView or a "contact the store / WhatsApp" flow. A native return wizard would need a vendor backend that creates reverse orders through the Merchant API, which is risky to ship without the merchant's approval rules.

### Gaps
- Response shapes for OTP verify, `account/orders` items, wallet, referral and the address schema need a logged-in test account.
- The exact customer-facing order URL inside the account area (for deep-linking a WebView to one order) was not determined.
- Whether `sso.zid.store` cookies propagate back to custom-domain stores inside a WebView (third-party cookie policies) is untested.

---

## Q5. Cart: CRUD, options and custom inputs, coupons, gift cards, loyalty, bank discounts, free-shipping progress, VAT totals, persistence, BNPL messaging

### Takeaway
The cart is fully native-capable and richer than the docs show. Live `GET cart` includes `discount_rules[]`, `bundle_offers[]`, `free_shipping_rule` (with progress fields), `checkout_restrictions` (min and max order), `service_fee_config`, coupon error messages and VAT totals. The cart is session-cookie based, so persistence depends on the 30-day cookie and on merging into the customer cart at login. BNPL messaging needs the app's own Tabby or Tamara widget, using flags and keys from `settings`.

### Cited Findings
- [DOC] `GET cart` is "the single source of truth for checkout state" and documents:
  - Identity and state: `id`, `session_id`, `phase`, `required_customer_email`, `currency{cart_currency, cart_store_currency}`, `customer`
  - Shipping: `skip_address`, `requires_shipping`, `shipping_address{…short_address…}`
  - Lines: `products[{id, product_id, name, sku, quantity, price, price_string, total, total_string, is_discounted, is_taxable, error_message}]`, `products_count`, `products_weight`, `products_subtotal`
  - Totals: `totals[{code, title, value, value_string}]`, `total{value, value_string}`
  - Other: `is_reserved`, `basket_url`, `has_bundle_offer`

  — [Get Cart](https://docs.zid.sa/get-cart-26082659e0)
- [LIVE] Extra cart fields seen:
  - `shipping_method`, `payment_method`, `discount_rules[]`, `bundle_offers[]`, `coupon`, `compliment_coupon`, `coupon_error_message`, `checkout_restrictions`, `gift_card_details`, `loyalty_applied_redemption_method`, `service_fee_config`, `total_value`
  - `free_shipping_rule{code, subtotal_condition{min, max, min_string, max_string, products_subtotal, cart_total, products_subtotal_percentage_from_min, remaining, status}, shipping_cities_condition[]}`

  — [mahasen cart](https://mahasen.com/api/v1/cart)
- [DOC] `POST cart/items` takes `product_id` (the variant id for variant products), `quantity`, `custom_fields[{group_id, price_settings, type, value}]`, `sub_items[{id, quantity, selection_group_id}]` and `share_token`. It returns `item{…custom_fields[{name, label, type, value, formatted_value}]}` and `cart_items_quantity`. Other cart calls:
  - `PATCH cart/items/{item_id}` (`quantity`), `DELETE cart/items/{item_id}`, `DELETE cart/items` (empty), `DELETE cart` (remove)
  - `POST cart/clone` (duplicate a reserved cart, "to retry a failed payment")

  — [Add Cart Item](https://docs.zid.sa/add-cart-item-26083895e0); [Duplicate Cart](https://docs.zid.sa/duplicate-cart-26083625e0)
- [SDK] Custom input field types are `TEXT`, `IMAGE`, `FILE`, `NUMBER`, `CHECKBOX`, `DROPDOWN`. Files are uploaded through `POST cart/uploads` ("Upload Cart Input Field"; its doc page is the 404 shell). — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js); [llms.txt](https://docs.zid.sa/llms.txt)
- [DOC] Coupons: `POST cart/coupons?coupon_code=`, `DELETE cart/coupons`, and `GET cart/coupons/validations?coupon_code=` (validate without applying). [LIVE] `settings.checkout.is_coupon_form_enabled` tells whether to show the coupon field. — [Apply Coupon](https://docs.zid.sa/apply-coupon-26257791e0); [Check Coupon Validity](https://docs.zid.sa/check-coupon-validity-26323357e0)
- [DOC] Bank discounts: `GET cart/checkout/bank-discounts` returns `coupons[{name, conditions[{field, action, value[], operator}], discount_type p|f, discount, min_total_amount, maximum_discount_value, date_start, date_end, show_in_cart_page, show_in_product_page, bank_code, card_network, bank_name, bank_logo, is_active}]`. The feature doc says "applied automatically during checkout… **Apple Pay payments are excluded**". It requires ZidPay. — [List Bank Discounts](https://docs.zid.sa/list-bank-discounts-42100288e0); [Bank Discounts](https://docs.zid.sa/bank-discounts-2332488m0)
- [DOC] / [LIVE] Loyalty redemption: `cart/loyalty/redemption-options`, then `POST cart/loyalty/redemptions {method_ids}`. Earned-points preview: `GET cart/loyalty/calculate?cart_total=`. — [Apply Loyalty Points](https://docs.zid.sa/apply-loyalty-points-26323433e0)
- [SDK] Service fees: `POST cart/service-fee` and `GET cart/service-fee/terms-and-conditions`. `POST cart/refresh-products`. — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)
- [DOC] Login merges carts. The SMS / email / guest login responses carry `cart_session_id` and `is_active_abandoned_cart_merged` ("whether an active abandoned cart was merged into the customer's current cart"). — [SMS Login](https://docs.zid.sa/sms-login-38265943e0)
- [LIVE] The session cookie decoded to `{"carts": {}, "source": "mobile_app"}` when the mobile header was sent. — [mahasen cart](https://mahasen.com/api/v1/cart) (cookie jar inspection)
- [LIVE] BNPL data:
  - `settings.products`: `tabby_widget_enabled`, `tamara_widget_enabled`, `mispay_widget_enabled`
  - `settings.checkout`: `tamara_public_key` (a UUID), `tamara_supported_currencies:["SAR"]`, `is_tabby_cart_widget_enabled`, `is_tamara_cart_widget_enabled`
  - No Tabby public key was found in `settings`.

  — [mahasen settings](https://mahasen.com/api/v1/settings)

### Inferences
- A free-shipping progress bar ("add 45 SAR more for free shipping") can be built directly from `free_shipping_rule.subtotal_condition.remaining` / `min`.
- A min-order warning can come from `checkout_restrictions`, and VAT lines from `totals[]`.
- Cross-device cart: a logged-in shopper's abandoned cart merges into the current session at login, so carts follow the customer account to some extent. A guest cart lives only in the device's cookie. Full real-time multi-device sync is not documented.
- Tamara's product and cart widget can be rendered natively with Tamara's SDK using `tamara_public_key`. For Tabby, the vendor needs the merchant's Tabby public key from onboarding, or can show generic "split in 4" copy computed locally.

### Gaps
- The shapes of `discount_rules[]` and `bundle_offers[]` inside the cart, and the `totals[].code` values on the storefront cart, were not observed populated, because no cart writes were made.
- Cart expiry and the reservation window (`is_reserved`) are undocumented.

---

## Q6. Promotions: can the app read active promotions to show badges and countdowns?

### Takeaway
Partly.
- **Product-level, readable:** sale price, discount %, badges, sale-period end dates (for countdowns) and preorder campaigns, all on product objects.
- **Readable through dedicated endpoints:** bundle offers and bank discounts.
- **Only after they hit the cart:** store-wide automatic discounts (progressive tiers, buy X get Y, cart rules) appear as `cart.discount_rules`, with no public endpoint to list them beforehand.
- **Merchant API:** coupons and bundle offers are listable there, but there is no list of automatic discount rules.

### Cited Findings
- [DOC] / [LIVE] Product fields that drive promos: `sale_price`, `formatted_sale_price`, `discount_percentage`, `effective_price`, `badge{body, icon.code}`, `purchase_restrictions.sale_price_period_start/end` and `availability_period_start/end`. — [Get Product by Slug](https://docs.zid.sa/get-product-by-slug-25772175e0); [opt.sa products](https://opt.sa/api/v1/products?page_size=40)
- [DOC] Preorder campaigns: the merchant sets a campaign period, a "show/hide countdown timer" option, an order limit and stock behaviour. The theme shows a preorder badge, a countdown and a special button label. — [Add Preorder Support](https://docs.zid.sa/add-preorder-support-to-your-theme-2132176m0)
- [DOC] Progressive discounts: 2–3 tiers on cart total or quantity, percentage or fixed, "Only one progressive discount can be active at a time", applies to the whole cart. They are rendered by a Zid kit component (`zidCustomStyles` key `progressive_discount`). There is no REST read endpoint in the docs. — [Progressive Discounts](https://docs.zid.sa/progressive-discounts-2072813m0)
- [DOC] Bundle offers: storefront read endpoints exist (Q1). "Set-price" bundles ("Any 3 for 100 SAR") drive a Bundle Progress component, with the saving taken from the cart's `discount_total_string`. The Merchant API has full Bundle Offers CRUD (list, view, create, update, delete). — [Bundle Progress](https://docs.zid.sa/bundle-progress-2470540m0); [Merchant Bundle Offers](https://docs.zid.sa/bundle-offers-1934530f0)
- [DOC] Coupons can be read only through the Merchant API (`List Coupons`, a sensitive "Coupons" scope). — [llms.txt](https://docs.zid.sa/llms.txt); [Justifying your scopes](https://docs.zid.sa/justifying-your-scopes-2490953m0)
- [DOC] Bank discounts are readable on the storefront with date ranges and display flags (Q5). — [List Bank Discounts](https://docs.zid.sa/list-bank-discounts-42100288e0)
- [LIVE] The cart contains `discount_rules[]` and `bundle_offers[]` arrays, empty in an empty cart. — [mahasen cart](https://mahasen.com/api/v1/cart)
- [LIVE] Store-level shipping badges: `settings.badges[{badge_type:"quick_delivery", is_enabled, text, description}]`. Products have `shipping_badges[]`. — [mahasen settings](https://mahasen.com/api/v1/settings)
- [NOT FOUND] No storefront or Merchant endpoint lists automatic "discounts" (Marketing → Discounts: buy X get Y, progressive, cart-amount rules) for display before they apply. — [llms.txt](https://docs.zid.sa/llms.txt)

### Inferences
- **Feasible natively:** "SALE −44%" and badge chips, a sale countdown from `sale_price_period_end`, preorder countdowns, a bank-offer banner on PDP and cart, a bundle "buy together" block, and free-shipping or bundle progress after add-to-cart.
- **Not feasible without the vendor backend:** a "Today's offers" hub listing BXGY or progressive rules. The workaround is a vendor-side promo CMS where the merchant (or an onboarding step) describes active campaigns. Alternatively, use a "Weekly offers" category the merchant already curates (as pcpalace does).
- "Available coupons" lists for shoppers would need the sensitive Coupons scope and server-side filtering. Most merchants will not want all codes exposed.

### Gaps
- Live shapes of `discount_rules[]` and the bundle-offer payload were not observed.
- Whether `sale_price_period_end` is set by merchants in practice, and so whether countdowns are common, is unknown.

---

## Q7. Engagement events: abandoned cart, back-in-stock, price drop, order-status push, welcome flows, identity for push targeting

### Takeaway
The building blocks exist through webhooks (Merchant API app) and storefront identity:
- **Webhooks:** `order.create`, `order.status.update`, `order.payment_status.update`, `abandoned_cart.created`, `abandoned_cart.completed`, `customer.create`, `customer.login`, `product.update` (plus product create/publish/delete and category events). Order events can be filtered by status or payment method.
- **Identity:** the app knows the logged-in customer from `GET account` (`id`, `hashed_id`) and from login responses (`customer_id`), so the vendor can map `customer_id` to device tokens.
- **Missing events:** there are no stock-back or price-change events. They must be derived from `product.update`.
- **Zid's own path:** Zid already integrates OneSignal push and universal links at the store level, configurable by a partner app.

### Cited Findings
- [DOC] Webhook events and conditions:
  - Orders: `order.create`, `order.status.update`, `order.payment_status.update`
  - Products: `product.create`, `product.update`, `product.publish`, `product.delete`
  - Abandoned carts: `abandoned_cart.created`, `abandoned_cart.completed`
  - Customers: `customer.create`, `customer.update`, `customer.merchant.update`, `customer.login`
  - Categories: `category.create`, `category.update`, `category.delete`
  - Conditions (order.create and order.status.update only): `status` ∈ {new, preparing, ready, inDelivery, delivered, cancelled}; `payment_method` ∈ {Cash On Delivery, Credit Card, Bank Transfer}

  — [Webhooks](https://docs.zid.sa/webhooks)
- [DOC] Merchant `GET abandoned-carts/{id}` returns:
  - Cart: `url` (recovery link), `products[{product_url, name, price, quantity, images, custom_field[]}]`, `city`, `cart_total`, `cart_total_string`
  - Funnel: `phase` ∈ {new, login, shipping_address, shipping_method, payment_method, verification, completed}
  - Customer: `customer_id`, `customer_name`, `customer_email`, `customer_mobile`
  - Reminders: `reminders_count`, `whatsapp_message`
  - Channel: `source` ∈ {api, mobile_app, catalog, pos, mazeed, md, mazeed_marketplace, mazeed_channels}
  - There is also "Send Abandoned Cart Notification Manually".

  — [View Abandoned Cart](https://docs.zid.sa/get-abandoned-cart-details); [llms.txt](https://docs.zid.sa/llms.txt)
- [DOC] Back-in-stock: shoppers register through `POST products/{id}/stock-alerts` (email or phone). The docs do not say which channel Zid uses to notify. Merchant variant objects include `waiting_customers_count`. No "back in stock" webhook exists. — [Notify Product Stock Availability](https://docs.zid.sa/notify-product-stock-availability-25721229e0); [Get Product by Slug](https://docs.zid.sa/get-product-by-slug-25772175e0)
- [DOC] Identity:
  - `GET account` returns `id`, `hashed_id`, `hashed_email`, `hashed_mobile`.
  - Login and register responses return `customer_id`.
  - Storefront Events expose `window.customer` and `window.customerAuthState` in web pages.

  — [Get Profile](https://docs.zid.sa/get-profile-26363082e0); [StoreFront Events](https://docs.zid.sa/storefront-events-649611m0)
- [DOC] Zid's built-in OneSignal integration: Merchant `GET/POST /v1/managers/store/settings/one-signal` (scope `third_one_signal_write`) stores keys "such as `app_id`, `app_key`, `one_signal_auth_key`, `android_package_name`, `android_namespace`, `android_sha256_cert_fingerprints`, `ios_app_id`, `ios_bundle_id`, and `ios_team_id`", "for the store where the partner app is installed". — [Create or Update OneSignal Store Settings](https://docs.zid.sa/create-or-update-onesignal-store-settings-39429264e0); [OneSignal Store Settings](https://docs.zid.sa/onesignal-store-settings-39420053e0)
- [LIVE] A store with an App Bunches app serves universal-link files from its own domain:
  - `https://pcpalace.com.sa/.well-known/apple-app-site-association` → `{"applinks":{"details":[{"appID":"LKS5247GKX.com.appsbunches.pcpalace","paths":["*","/"]}]}}`
  - `/.well-known/assetlinks.json` → 200
  - A store without app settings (mahasen) returned 400 for both.

  — [pcpalace AASA](https://pcpalace.com.sa/.well-known/apple-app-site-association); [pcpalace assetlinks](https://pcpalace.com.sa/.well-known/assetlinks.json)
- [DOC] Zid's first-party mobile-app channel (App Bunches) advertises free unlimited push notifications, with abandoned-cart notifications in the Professional plan. — [Zid Help: تطبيق متجرك على الجوال](https://help.zid.sa/ar/mobile-app)

### Inferences
- **Order-status push:** subscribe to `order.status.update` and look up the device token by `customer.id` from the payload.
- **Abandoned-cart push:**
  - Use `abandoned_cart.created` → push "you left items" with the recovery `url` (opened in the app, or deep-linked).
  - Use `abandoned_cart.completed` to cancel the sequence.
  - Filtering on `source=mobile_app` lets you target app carts.
- **Back-in-stock and price-drop alerts:**
  - The vendor stores its own subscriptions (customer, product or variant, last price and stock).
  - On `product.update`, it re-fetches the product (webhook product payloads were not readable in the docs) and diffs quantity and price.
  - Zid's built-in `stock-alerts` can still be called so the merchant's dashboard counts stay right.
- **Welcome flow:** `customer.create` (plus `customer.login` for "first app login") triggers onboarding pushes or a coupon. Coupon creation needs the sensitive Coupons write scope.
- **Deep links:** writing the OneSignal settings (`ios_team_id`, `ios_bundle_id`, `android_sha256_cert_fingerprints`) appears to make Zid serve AASA and `assetlinks.json` for the merchant's domain. That would let product links shared from the website open the app. This is inferred from the field names plus the live App Bunches example, and is not documented as such. It also means a third-party vendor and App Bunches would compete for the same single setting per store.
- Whether Zid's platform *sends* OneSignal pushes itself (for example order updates) once keys are set is not documented. The presence of `app_key` and `one_signal_auth_key` (server keys) suggests Zid may send pushes server-side.

### Gaps
- The product webhook payload schema (doc page returned 404) is needed to see whether price and stock are included.
- Webhook delivery is per app per store. The vendor must be an installed Zid app for each merchant (see the earlier notes on the partner program).
- Whether Zid's OneSignal integration sends transactional pushes automatically is unconfirmed. Ask Zid or App Bunches.

---

## Q8. Checkout via WebView: URL, session sharing, success detection, payment methods, mobile header, scripts

### Takeaway
- **URLs:** open `https://{domain}/checkout` (logged in) or `/checkout/guest` (guest) in a WebView. Use the same cookie jar (`session`, `csrftoken`, `locale`) as the API client, and send `Zid-Client-Platform: mobile-app` on every request.
- **Success detection:** Zid documents **no thank-you URL or completion callback**. Detection must combine navigation observation, the `purchase` event surfaced through Storefront Events and app scripts, and server confirmation (the `order.create` webhook or `account/orders`).
- **Payments:** the checkout uses Apple Pay JS (`ApplePaySession`), ZidPay cards (mada, Visa, Mastercard), STC Pay, Tabby, Tamara, MisPay, Emkan, Madfu, bank transfer and COD. Apple Pay inside WKWebView works on iOS 16+ only if script-injection rules are respected. Tabby requires camera permissions and no app close buttons.

### Cited Findings
- [DOC] Zid's three requirements:
  - Pass the session cookie: "The page uses this cookie to attach the logged-in session… Make sure your WebView shares its cookie store with your API client."
  - Send `Zid-Client-Platform: mobile-app` "with **every request** you make — page views and API calls alike."

  — [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- [LIVE] Routes:
  - `GET /checkout` (not logged in) → 307 to `/auth/login?redirect_to=/checkout`, then 302 to `https://sso.zid.store/auth/login?redirect_to=https%3A%2F%2Fppowerstore.com%2Fcheckout&has_products=false`
  - `GET /checkout/guest` → 200 (page title "اشترِ الآن", "Buy now")
  - `GET /cart` → 200

  [SDK] Checkout and account route regex: `^(?:/{lang}(-{cc})?)?/(?:checkout(?:/guest|/payment)?|account(?:/.*)?|addresses(?:/.*)?)/?$`. — [ppowerstore /checkout](https://ppowerstore.com/checkout); [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)
- [LIVE] On load, the checkout page:
  - reads `localStorage["vitrin-auth-token"]` into an `Authorization: Bearer` header,
  - computes `payment_excludes` (adds `apple_pay` if `window.ApplePaySession?.canMakePayments()` is false; adds `samsung_pay` on Apple devices),
  - calls `POST /api/v2/checkout/initialize`,
  - fires a `zid-checkout-rendered` DOM event.

  — [ppowerstore /checkout/guest](https://ppowerstore.com/checkout/guest)
- [LIVE] Payment methods listed in `settings.checkout.payment_methods` (mahasen): `apple_pay`, `samsung_pay`, `visa`, `mastercard`, `mada`, `tamara`, `tabby_installments`, `mispay_installments`, `emkan_installments`, `madfu_installments`, plus COD ("دفع عند الاستلام"). Related flags: `is_apple_pay_enabled`, `is_apple_pay_enabled_in_all_browsers`, `is_apple_pay_quick_checkout_enabled`, `is_single_page_checkout_enabled`, `is_checkout_v2_enabled`, `show_checkout_as_popup`. — [mahasen settings](https://mahasen.com/api/v1/settings)
- [SDK] Gateway enums: `zid_bank_transfer`, `zid_cod`, `zid_cop`, `zidpay`, `tap`, `tabby`, `mispay`, `emkan`, `madfu`, `tamara`. Method enums: `mada`, `stc_pay`, `tabby_installments`, `tamara`, `emkan_installments`, `madfu_installments`, `mispay_installments`. — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)
- [SDK] Undocumented internal checkout API used by Zid's web checkout:
  - Under `cart/checkout/`: `shipping-addresses` (GET/POST, `/guest`), `shipping-methods` (GET/POST), `pickup-destinations`, `payment-methods` (GET/POST), `verify`, `{payment_token}/confirm`, `{payment_token}/cancel`, `set-bank-and-network`
  - Under `quick-checkout/`: `initialize`, `buy-now`, `payment-object`, `confirm`

  These conflict with Zid's statement that checkout is web-only. — [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js); [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- [DOC] Success signals available to scripts:
  - The `/api/v1/scripts` manifest has a `purchase_event` key ("Snippets intended to run once a purchase is completed") and `start_checkout_event`.
  - Storefront Events document a Purchase event carrying `order` (the full order object), `transaction_id` (the order ID), `value` and `items`.
  - App partners inject scripts through the Partner Dashboard.

  — [Mobile Apps: Scripts](https://docs.zid.sa/scripts-1758413m0); [StoreFront Events](https://docs.zid.sa/storefront-events-649611m0)
- [SDK] Zid's tracking script tags a `thankyou_page` action. The checkout tracking emits `place_order` with `is_success` or `outcome: "accepted_handoff"` (a handoff to an external payment app). — [tracking.js](https://static.zid.store/sdk/v3.33.9/theme-statics/tracking.js); [dmd-events chunk](https://static.zid.store/sdk/v3.33.9/vendor/dmd-events-BJN6jf_A.js)
- [NOT FOUND] No documented thank-you or order-success URL pattern. Searches of docs and the web found none. — [llms.txt](https://docs.zid.sa/llms.txt)
- [DOC] Duplicate Cart exists "to retry a failed payment" when the cart `is_reserved` (payment initiated). — [Duplicate Cart](https://docs.zid.sa/duplicate-cart-26083625e0)
- Apple Pay in WKWebView:
  - Since iOS 13, Apple Pay JS is disabled if the app injects scripts (`WKUserScript`, `evaluateJavaScript`) before the page uses Apple Pay, and vice versa.
  - Safari 16 / iOS 16 allowed script injection alongside Apple Pay.
  - macOS WKWebView does not support it.

  — [WebKit bug 205730](https://bugs.webkit.org/show_bug.cgi?id=205730); [Apple forums thread 696572](https://developer.apple.com/forums/thread/696572); [WebKit bug 282078](https://bugs.webkit.org/show_bug.cgi?id=282078)
- Tabby in apps: the hosted page may open in a WebView or the system browser. An embedded WebView means "camera and gallery permissions for ID upload and state recovery". Checkout must show "no control buttons (e.g., X, close, back…) from your app". A WebView close or app return "is a navigation event, not a payment result". — [Tabby: integration without SDK](https://docs.tabby.ai/pay-in-4-custom-integration/mobile-apps/integration-without-sdk); [Tabby testing checklist](https://docs.tabby.ai/pay-in-4-custom-integration/full-testing-checklist)
- [DOC] Bank discounts are excluded for Apple Pay payments. — [Bank Discounts](https://docs.zid.sa/bank-discounts-2332488m0)
- [LIVE] `/api/v1/scripts` returns `external_scripts[]` and `app_scripts_bundle{scripts{head, global_head_script, purchase_event, product_details_event, add_to_cart_event, start_checkout_event, body}, params{google_analytics, google_tag_manager, facebook_pixel, tiktok_pixel, google_ads, zamConversionsSnapchatPixelId,…}}`. — [ppowerstore scripts](https://ppowerstore.com/api/v1/scripts)

### Inferences
- **Recommended success detection, in layers:**
  1. Watch WebView navigation. When the URL leaves the checkout regex for a non-checkout, non-payment-gateway URL on the store domain, treat checkout as finished and show a native "processing" state.
  2. Confirm by polling `GET cart` (it empties or `phase` changes) and `GET account/orders` (a new order appears). Better: the vendor backend receives the `order.create` webhook, filtered by customer id and `source=mobile_app`, and pushes or sockets the result to the app.
  3. Optionally, a vendor app script injected through Zid's App Scripts on `purchase_event` could post `transaction_id` to the native layer through a JS bridge. On iOS, keep it to a script the page loads itself (not `WKUserScript`) to avoid the Apple Pay conflict on iOS < 16.
- **Payment methods inside a WebView:**
  - **Apple Pay:** works in WKWebView on iOS 16+ if the merchant's ZidPay domain registration covers the store domain. Test it. If it fails, `ApplePaySession.canMakePayments()` returns false and Zid's checkout hides Apple Pay automatically.
  - **mada, Visa, Mastercard and STC Pay:** card and OTP or redirect flows. 3-D Secure redirects work in a WebView. STC Pay may hand off to the STC app.
  - **Tabby and Tamara:** they work, but follow their rules: camera permission, allowing external-app handoff, no app close button.
  - **COD and bank transfer:** no special handling.
  - **Samsung Pay:** excluded on Apple devices. On Android WebView, likely unavailable (unverified).
- Use SFSafariViewController or Custom Tabs only as a fallback. They do not share cookies with the app's HTTP client, which breaks the cart and session handoff.

### Gaps
- No test order was placed, so the actual success URL, the order-id parameter and the redirect sequence for each payment method remain unverified.
- Whether the merchant's Apple Pay domain verification (through ZidPay) works for an in-app WKWebView on a custom domain is untested.
- Zid gives no guidance on deep-linking back from external apps (bank, Tabby or STC) into the WebView session.

---

## Q9. Analytics: can the app attribute orders to the mobile-app channel, and does the Zid dashboard report it?

### Takeaway
Yes at the data level. Zid orders and abandoned carts carry a `source` field with a `mobile_app` / "Store App" value, and the storefront session records `source: mobile_app` when the documented header is sent. Orders also store `marketing_source` (UTMs, platform, device). The merchant's Zid reports can filter sales by "sales channels" (Professional and Large Business plans). The docs do not confirm that a third-party app's WebView orders are labelled "Store App".

### Cited Findings
- [DOC] Merchant `GET /orders/{id}` `source` field: "Source from which the order was created. Examples: web, mobile_app, pos, api", plus `source_code`. — [View Order](https://docs.zid.sa/view-order-12479054e0)
- [DOC] Merchant `List Orders` filter `source` enum: `Mazeed`, `Mazeed Services`, `Merchant Admin`, `Order Api`, `Store`, **`Store App` ("Represents operations triggered from the Store mobile application")**, `ZidPOS`, `Others`. — [List Orders](https://docs.zid.sa/list-of-orders)
- [DOC] `marketing_source{utm_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referer, platform, device_type, browser, os, ip, ip_country, ip_city…}` on orders. — [View Order](https://docs.zid.sa/view-order-12479054e0)
- [DOC] Abandoned-cart `source` enum includes `mobile_app`. — [View Abandoned Cart](https://docs.zid.sa/get-abandoned-cart-details)
- [LIVE] With `Zid-Client-Platform: mobile-app`, the HttpOnly `session` cookie payload was `{"carts": {}, "source": "mobile_app"}`. — [mahasen cart](https://mahasen.com/api/v1/cart)
- [DOC] Zid reports: sales reports can be filtered by "قنوات البيع" (sales channels). They are available on the Professional and Large Business plans. The article (dated 19 Feb 2025) does not list a mobile-app channel by name. — [تقارير زد (Zid Reports)](https://intercom.help/zid/ar/articles/10026049-تقارير-زد)
- [LIVE] / [SDK] Pixel IDs for app-side analytics are available from `GET scripts` → `params` (GA4, GTM, Meta, TikTok, Snapchat, Google Ads). Zid also runs a server-side conversion endpoint `POST /api/v1/events` ("unified API" for purchase, page_view, add_to_cart, view_content, initiate_checkout, add_payment_info); the store flag is `has_capi: true`. — [ppowerstore scripts](https://ppowerstore.com/api/v1/scripts); [conversion-events.js](https://static.zid.store/sdk/v3.33.9/theme-statics/conversion-events.js)

### Inferences
- The app should always send `Zid-Client-Platform: mobile-app`, and should also append UTM parameters (for example `utm_source=app&utm_medium=ios`) to the WebView checkout URL. That gives a second attribution path through `marketing_source` if `source` is not set.
- The vendor can build its own "app revenue" dashboard from the Merchant API (`List Orders` with `source=Store App`, or `mobile_app` orders) plus webhooks, without relying on Zid reports.
- Native app analytics (Firebase or GA4 app streams, Meta App Events) need app-specific IDs, not the web pixel IDs from `scripts`. Web pixels will still fire inside the checkout WebView. Deduplicate purchase events between the app SDK and the WebView pixels, using `transaction_id` as the event ID.

### Gaps
- No test order was placed, so the exact `source` value for an order placed in a third-party WebView with the header (`mobile_app` vs `Store App` vs `Store`) is unverified.
- No screenshot or documentation confirms a mobile-app breakdown in the Zid dashboard.

---

## Q10. Practical gaps: features shoppers expect that Zid's APIs don't support, and workarounds

### Takeaway
The main gaps:
- Checkout and payment (WebView only)
- Order detail, tracking and returns (no shopper API)
- Saved cards and stored-value gift cards
- Automatic-discount discovery and search suggestions
- Guest wishlist
- Back-in-stock and price-drop push
- Social login
- Stable contracts for `settings` and `brands`

Most can be covered by a thin vendor backend: Merchant API, webhooks, and its own data stores for wishlist, alerts and promo CMS. The rest are WebView fallbacks.

### Cited Findings
- [DOC] Login and checkout are page views only. — [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- [NOT FOUND] Storefront single-order detail, tracking or returns endpoints. The Merchant API has View Order (with tracking) and Reverse Orders. — [View Order](https://docs.zid.sa/view-order-12479054e0); [Reverse Orders](https://docs.zid.sa/reverse-orders-1810994f0)
- [NOT FOUND] Saved cards and gift-card balance (Q4). Search suggestions (Q1). A list of automatic discounts (Q6). Social login (Q4).
- [LIVE] Wishlist requires login ("Customer is required."). — [ppowerstore wishlist](https://ppowerstore.com/api/v1/account/wishlists)
- [LIVE] Undocumented but load-bearing endpoints: `settings`, `brands`, `blogs` (list), `storewhatsapp/widget`, `locations`, wallet and referral. — [mahasen settings](https://mahasen.com/api/v1/settings); [SDK](https://static.zid.store/sdk/v3.33.9/vendor/vitrin-zidderjs-CpUtaP6G.js)
- [LIVE] `template-settings` can be about 11 MB and is theme-specific. — [pcpalace template-settings](https://pcpalace.com.sa/api/v1/template-settings?template=home)
- [DOC] Webhooks cover product changes and abandoned carts, but have no stock or price-specific events. — [Webhooks](https://docs.zid.sa/webhooks)
- [DOC] The Zid-endorsed incumbent (App Bunches) is already wired into store settings (OneSignal keys, smart banner, AASA). — [Zid Help: mobile app](https://help.zid.sa/ar/mobile-app); [pcpalace AASA](https://pcpalace.com.sa/.well-known/apple-app-site-association)

### Inferences
Workaround table:

| Gap | Workaround | Where it runs |
|---|---|---|
| Guest wishlist / wishlist sync before login | Local wishlist on device; bulk-push to `POST account/wishlists {product_ids}` after login | App + Storefront API |
| Back-in-stock push | Vendor subscription store + `product.update` webhook → re-fetch → push; also call Zid `stock-alerts` | Vendor backend |
| Price-drop alerts | Snapshot price on wishlist or alert subscribe; diff on `product.update` | Vendor backend |
| Order detail and tracking | Native screen fed by the vendor proxy of Merchant View Order (ownership check by customer id), or a WebView of the account order page | Backend or WebView |
| Order-status push | `order.status.update` webhook → push using the customer-id-to-token map | Backend |
| Abandoned-cart push | `abandoned_cart.created` (source filter) → push with recovery `url`; stop on `.completed` | Backend |
| Returns | WebView, or "contact store via WhatsApp" using `storewhatsapp/widget.phone_number` | WebView / native |
| Offers hub (BXGY, progressive) | Vendor promo CMS, or a merchant-curated "Offers" category; display Zid bundle and bank offers natively | Backend + Storefront |
| Search suggestions and recent searches | Debounced `products/search`; store recent queries locally; optional vendor index (Algolia or Meilisearch fed by product webhooks) | App / backend |
| Saved cards | Not possible; rely on Apple Pay, mada and BNPL in the checkout WebView | n/a |
| Gift-card balance | Not available; offer "send as gift" (`cart/gift-cards`) instead | Storefront |
| Reviews with app-only features (video, helpful votes) | Use Zid reviews for the source of truth; extra signals in the vendor DB | Hybrid |
| Home-page builder for bespoke themes | App-side layout builder in the vendor CMS, seeded from `template-settings` where parsable | Backend |
| Contract risk on undocumented endpoints | Fall back to the Merchant API (Branding, Localization, Brands) through the backend; feature-flag N\* calls | Backend |

- **Product-design implication:**
  - **Fully native:** Home, PLP and filters, search, PDP, reviews and Q&A, categories, brands, cart, coupons, loyalty, wishlist, addresses, profile, order list, CMS pages and blog.
  - **WebView:** checkout and payment, login (initially), order detail and returns (unless the backend proxy is built), FAQ.
  - **Vendor backend:** push and engagement, alerts, offers hub, app analytics.

### Gaps
- Commercial and policy permission to use the undocumented endpoints, and conflict with App Bunches over the single OneSignal / AASA slot per store, need confirmation with Zid. Legal and commercial topics were out of scope.
- No logged-in or test-order validation was done. A sandbox or development store test is the next step to close the shape gaps for OTP verify, order list items, the success URL and the `source` label.
