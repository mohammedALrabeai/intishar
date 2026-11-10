# Zid Developer Platform: Feasibility of a Third-Party Native (Flutter) Shopping App for Zid Merchants

Research date: 2026-11-10. Primary source: docs.zid.sa (an Apidog-hosted portal; the full page index is at https://docs.zid.sa/llms.txt and each page has a raw `.md` twin, which is what was read). Status labels used below:
- **[CONFIRMED-DOC]**: documented on an official Zid page
- **[UNCLEAR]**: mentioned, but ambiguous, contradictory or labelled early or experimental
- **[NOT FOUND]**: searched for and not found
- **[OBSERVED]**: my own read-only HTTP probe of a live Zid store's public endpoints on 2026-11-10. This is evidence of how the system behaved on that day, not a contract.

Caveat on doc freshness: the raw markdown of several core pages (Authorization, OAuth troubleshooting, Submit for review) contains editorial HTML comments such as `<!-- CHANGED: ... confirmed with Zid engineering, Oct 2026 -->` and `<!-- PUBLISH DEPENDENCY ... -->`. These pages are mid-revision. The rendered page and the `.md` source may disagree (for example, older rendered text said tokens last "1 year"). The figures below come from the newest `.md` text.

## Q0. Overall verdict: can a third party build a complete native shopping app on Zid?

### Takeaway
Mostly, but checkout cannot be fully native. Zid's own docs have a "Mobile Apps" section. It tells mobile apps to use the public, cookie-session **Storefront APIs** for browsing, cart, coupons, account, addresses, order history and wishlist. For **checkout** (and, per the same page, **login**), the app must open the Zid storefront web page in a **WebView**, sharing the session cookie and sending the header `Zid-Client-Platform: mobile-app`. Payment therefore happens inside Zid's hosted web checkout. No API lets a third party place an order and take payment natively as a shopper.

### Cited Findings
- [CONFIRMED-DOC] "The Storefront APIs do **not** provide endpoints for login or checkout. Mobile apps must handle both flows by opening the storefront **web pages** (e.g. in a WebView) instead of calling an API." The page continues: "This applies to the **login page** and the **checkout page** only. All other storefront functionality remains available through the APIs." — [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- [CONFIRMED-DOC] The same page requires passing the **session cookie** with the page view ("The same cookie is then used across all API requests… Make sure your WebView shares its cookie store with your API client"). It also requires the header `Zid-Client-Platform: mobile-app` on "every request you make — page views and API calls alike." — [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0)
- [CONFIRMED-DOC] The docs nav has a dedicated **"Mobile Apps"** group with three pages: *Scripts*, *Login & Checkout via Page Views* and *Theme Sections Settings*. — [docs index llms.txt](https://docs.zid.sa/llms.txt)
- [CONFIRMED-DOC] The Storefront "Checkout (Cart)" endpoint group covers cart CRUD, gift cards, coupons, loyalty points and bank discounts. It has **no "place order", "select shipping method" or "pay" endpoint**. — [docs index llms.txt](https://docs.zid.sa/llms.txt); [Get Cart](https://docs.zid.sa/get-cart-26082659e0)
- [CONFIRMED-DOC] The Get Cart schema returns `shipping_address`, `requires_shipping`, totals and `basket_url`, but **no shipping-method or rate list and no payment methods**. — [Get Cart](https://docs.zid.sa/get-cart-26082659e0)

### Inferences
- A Flutter app can render native screens for home, categories, product list and detail, search, cart, coupons, wishlist, account, addresses and order history. Checkout, shipping-method choice, payment (mada, cards, Apple Pay, Tabby or Tamara, COD) and possibly login need an embedded web checkout. That is the "native shell plus web checkout" pattern that Shopify-based app builders used before native checkout APIs.
- Building the app does not require a Zid App Market app (OAuth) at all, because the Storefront APIs are session-based and public (see Q3). The business layer does need one, for push or abandoned-cart webhooks, merchant onboarding, billing through Zid, and order-status sync (see Q2, Q5 and Q6).

### Gaps
- Zid does not say whether third parties are *permitted* to use the Storefront APIs commercially. No terms of use for these endpoints were found. The "Mobile Apps" pages do not say who they are for: any developer, or only Zid's mobile-app partner (see Q7).

## Q1. Does "Zid Headless" (or a Storefront API / headless commerce offering) exist?

### Takeaway
I found **no product called "Zid Headless"**. There is no announcement, press release, pricing page or docs section by that name. What exists is a set of **"Storefront APIs"**. Zid documents them under the *Themes (Vitrin)* section, and the "Mobile Apps" pages refer to them for mobile use. They are free, need no API key, are tied to the store's own domain and are partly labelled "early version." They behave like a headless storefront API, but Zid has not packaged or marketed them as a headless offering, so there is no GA date, partner gate or price.

### Cited Findings
- [NOT FOUND] Searches in English ("Zid headless commerce storefront API", "Zid launches headless commerce 2025") and Arabic ("زد هيدلس Headless") returned no Zid headless product. Zid's 2024–2025 announcements were "Total Commerce" (Dec 2024, Ripple event) and an MCP/AI integration. — [Crowdfund Insider, Dec 2024](https://www.crowdfundinsider.com/2024/12/234596-saudi-arabias-commerce-enablement-platform-zid-unveils-ecosystem-solution-redefining-digital-retail/)
- [NOT FOUND] The full docs index has no page with "headless" in the title. — [llms.txt](https://docs.zid.sa/llms.txt)
- [NOT FOUND] Zid's developer-program page does not mention headless, storefront API or mobile apps. It mentions general APIs and SDKs, plus a "Partner MCP". — [Zid Developer Programs](https://zid.sa/en/partners/developers/)
- [CONFIRMED-DOC] Every Storefront API endpoint is tagged under `Themes (Vitrin)/API's/...`, for example `Themes (Vitrin)/API's/Products`, `/Checkout`, `/Authentication` and `/Account`. The specs declare `security: []` and `securitySchemes: {}`, meaning no API key or OAuth. — [List Products](https://docs.zid.sa/list-products-25510175e0); [Add Cart Item](https://docs.zid.sa/add-cart-item-26083895e0); [Register Guest](https://docs.zid.sa/register-guest-38268430e0); [Get Orders (customer)](https://docs.zid.sa/get-orders-26722142e0)
- [CONFIRMED-DOC] Template/home-layout settings are "now accessible through the Storefront APIs: `GET api/v1/template-settings?template=home`". The page adds: "This is an **early version** and is subject to change." A `meta.type` field on sections is "being tested… to help developers build sections that are more **mobile-compatible**". It applies only to *Soft Theme Vitrin* for now. — [Theme Sections Settings](https://docs.zid.sa/theme-sections-settings-2258380m0)
- [UNCLEAR] The specs list the server as `https://api.zid.sa/`, but that host returns 404 for `/products`. **[OBSERVED]** `GET https://api.zid.sa/products` gave HTTP 404 `{"status":"error",…"description":"لم نعثر على هذه الصفحة"}` on 2026-11-10.
- [OBSERVED] The Storefront APIs actually live on **each store's own domain** under `/api/v1/`. On a live store (`jahz24.zid.store`), with no credentials:
  - `GET /api/v1/products?page=1` returned 200 JSON `{"results":[],"count":0,"page":1,"page_size":24,"next":null,"previous":null,"pages_count":0}`
  - `GET /api/v1/cart` returned 200 with a full cart object (`coupon`, `checkout_restrictions`, `free_shipping_rule`, `service_fee_config`, `basket_url`…)
  - `GET /api/v1/auth/login-status` returned `{"is_authenticated":false,"browsing_country":"SA","is_turnstile_exempt":true}`
  - `GET /api/v1/template-settings?template=home` returned the home-page section JSON
  - The server set an HttpOnly `session` cookie (`Max-Age=2592000`, i.e. 30 days). With `Zid-Client-Platform: mobile-app`, the session payload decoded to `{"source": "mobile_app", "carts": {}}`.

### Inferences
- The store is identified by its domain, so a multi-tenant app would call `https://{merchant-domain}/api/v1/...` per merchant (custom domain or `*.zid.store`).
- `is_turnstile_exempt` points to Cloudflare Turnstile bot protection on some flows, likely login. The mobile-app header or source may be what exempts the app. This is unverified.
- These APIs carry no SLA, versioning promise or partner contract. They are a **dependency risk**: Zid can change them (one is already labelled "early version and subject to change").

### Gaps
- No official GA, launch date, pricing or access policy for the Storefront APIs as a product.
- No published rate limits for the Storefront APIs. The 60 req/min rule on the Rate Limiting page is framed for "third-party system[s]" calling Zid's API (the Merchant API).
- The LinkedIn and Zid newsroom feeds could not be checked directly, and the partner changelog (changelog.partner.zid.sa) rendered no entries when fetched.

## Q2. Zid Merchant API: OAuth flow, tokens, scopes, endpoint coverage

### Takeaway
The Merchant API (`https://api.zid.sa/v1`, OAuth at `https://oauth.zid.sa`) is mature and broad. It uses an OAuth 2.0 Authorization Code grant for confidential, server-side clients only (no PKCE). Every call needs two headers: `Authorization: Bearer <authorization>` and `X-Manager-Token: <access_token>`. Per the latest doc text, new tokens last 3 years and refresh tokens 1 year. It covers products, categories, variants, stock and inventory locations, orders (including partner-created orders), customers, coupons, abandoned carts, reviews, Q&A, loyalty, wallets, bundles, webhooks and app subscriptions. It is a back-office API, though, not a shopper API.

### Cited Findings
- [CONFIRMED-DOC] Zid uses "the **authorization code grant** type, which is ideal for confidential clients." "**PKCE is not used.**" `state` is "strongly recommended." The authorize URL is `https://oauth.zid.sa/oauth/authorize` and the token URL is `https://oauth.zid.sa/oauth/token`. — [Authorization](https://docs.zid.sa/authorization)
- [CONFIRMED-DOC] Header model: the Authorization token (JWT) goes in `Authorization: Bearer`. `X-MANAGER-TOKEN` "grants access to one specific store". `Access-Token` is "the same value as `X-MANAGER-TOKEN`" and is used by Product-component endpoints. "Almost every API request requires **both** the `Authorization` and `X-Manager-Token` headers." Always send `Accept-Language: en` or `ar`; otherwise Zid replies in Arabic. — [Authorization](https://docs.zid.sa/authorization)
- [CONFIRMED-DOC] Base URIs: API `https://api.zid.sa/v1` ("Older versions are deprecated"), OAuth `https://oauth.zid.sa`. — [Authorization](https://docs.zid.sa/authorization)
- [CONFIRMED-DOC] Token lifetimes:
  - Authorization code: **10 minutes, single use**
  - `authorization` token: **3 years** (`expires_in: 94608000`; tokens issued before mid-2025 carry 1 year)
  - `access_token` (X-Manager-Token): same expiry as the authorization token
  - `refresh_token`: **1 year**, and "**Expires two years before the access token**"
  - Zid advises refreshing "on a schedule… roughly every 10 months". A refresh returns a new refresh token and revokes the old one.

  — [Authorization](https://docs.zid.sa/authorization). Conflict: the earlier rendered page said "1 year". The newer `.md` text says this was changed and "confirmed with Zid engineering, Oct 2026". Read `expires_in` at runtime.
- [CONFIRMED-DOC] On uninstall, Zid sends `app.market.application.uninstall`, and "every token you hold for that store is revoked immediately". Adding a scope after launch puts installs into a pending state (`403 APP_PERMISSIONS_PENDING_APPROVAL`) until the merchant deactivates and reactivates the app. — [Authorization](https://docs.zid.sa/authorization); [Justifying your scopes](https://docs.zid.sa/justifying-your-scopes-2490953m0)
- [CONFIRMED-DOC] Scopes are groups with None, Read, or Read & Write levels, written for example as `Product.read` and `Product.write`. Groups listed as sensitive: Customers, Orders, Abandoned Carts, Account / Account Identity, Customer Wallet, Customer Referrals, Coupons, Bundle Offers, Loyalty, Order Create, Payments, Extra Addons (storefront JS), Catalog, Store Core / Business Details, Store Domain, Languages & Currencies, and Webhooks. Example raw scope identifiers: `third_webhook_write`, `third_create_order`, `Subscription.read` / `Subscription.read_write`, and `embedded_apps_tokens_write`. — [Justifying your scopes](https://docs.zid.sa/justifying-your-scopes-2490953m0); [Create Webhook](https://docs.zid.sa/create-a-webhook); [Create Order](https://docs.zid.sa/create-order-20612055e0); [Usage-based plans](https://docs.zid.sa/usage-based-plans-2490913m0); [Test your app](https://docs.zid.sa/test-your-app)
- [CONFIRMED-DOC] Merchant endpoint coverage, from the official index:
  - **Products:** create, list, view, update, bulk update and delete; variants (`add-product-variants`), custom options and input fields, images, attributes and presets, badges, brands, sorting, CSV import and export, digital and downloadable products, and vouchers
  - **Categories:** list, view, create, subcategory, publish, nesting and assignment
  - **Stock / inventory:** product stock CRUD and bulk; inventory locations, and stock per location
  - **Orders:** list, view, change status, comments, tags, custom statuses, credit notes, highlights, Create Order and Validate Order Request; reverse orders
  - **Abandoned carts:** list, view, and send notification manually
  - **Customers:** list, view, find by phone, add, update, delete, bulk add, import and tags
  - **Coupons:** full CRUD, bulk and status changes
  - **Reviews:** List Reviews and Count Reviews; product Q&A CRUD
  - **Other:** loyalty, wallets and cashback, bundle offers, shipping methods list (`list-store-delivery-options`), payment methods list, VAT settings, OneSignal store settings, and webhooks CRUD

  — [llms.txt index](https://docs.zid.sa/llms.txt); [Start Here](https://docs.zid.sa/start-here)
- [CONFIRMED-DOC] **Create Order** is `POST /v1/managers/store/drafts` with scope `third_create_order`: "allows Partners to create orders on behalf of merchants". It supports a ZidPay payment link (payment method code `"payment_link.zidpay"`, with `payment_link_configs.expiryDateTime`). — [Create Order](https://docs.zid.sa/create-order-20612055e0)
- [CONFIRMED-DOC] An official Python SDK exists (`github.com/zidsa/sdk-python`) with a demo app. Laravel and TypeScript SDKs are marked "Coming soon". There are sample OAuth apps for Laravel and Express. No mobile or Flutter SDK. — [Zid SDKs](https://docs.zid.sa/zid-sdks-2008123m0); [Authorization](https://docs.zid.sa/authorization)
- [OBSERVED] Zid's GitHub org (`zidsa`) has no mobile, Flutter or headless SDK repo. Recently updated repos include `growth-theme`, `soft-theme-vitrin`, `vitrin-cli`, `sdk-python`, `zid-agent-skill`, `laravel-sample-app` and `express-sample-app`. — [GitHub zidsa repos (API)](https://api.github.com/orgs/zidsa/repos)
- [CONFIRMED-DOC] Private apps (not listed, no review) can be installed only on stores with a **Professional or Enterprise plan**, or where the merchant has activated **API Access**. — [Zid Apps Overview](https://docs.zid.sa/zid-apps-overview)

### Inferences
- The Merchant API is the right channel for the **vendor's backend**: onboarding a merchant, syncing catalog and orders, pushing order-status notifications, reading abandoned carts, and reading coupons and loyalty settings.
- The Merchant "Create Order" plus ZidPay payment-link path is a theoretical workaround for a more native checkout: build the cart natively, create the order server-side, then open a payment link. It is designed for partner or merchant order creation (draft orders). It needs the sensitive `Order Create` scope, a 60/min per-store budget, and server-side reconstruction of shipping, discounts and VAT. It does not reuse the shopper's storefront cart, session, coupons or loyalty. This is not a recommended checkout path, and Zid has not documented it for that use.

### Gaps
- No complete public scope catalogue (the exact raw scope string for each group) was found in one place. Scopes are chosen in the Partner Dashboard UI.
- I could not confirm whether the Merchant API exposes shipping-rate calculation for a given cart and address. Only a "List Store Shipping Methods" endpoint was found.

## Q3. Storefront (shopper-facing) capabilities: login, cart, coupons, shipping, checkout, payment

### Takeaway
The Storefront APIs offer shopper login via OTP (SMS, WhatsApp, email), registration and guest registration. They also cover cart CRUD, coupons, gift cards, loyalty points, bank discounts, addresses, order history, wishlist and reviews. They offer **no shipping-rate selection, payment or place-order endpoint**. Zid's documented mobile-app approach is native APIs plus a **WebView for checkout (and login)**. Zid's documents disagree on login: the OTP endpoints are documented, yet the Mobile Apps page says login is not available via API.

### Cited Findings
- [CONFIRMED-DOC] Customer Authentication endpoints:
  - Logout
  - Login Status (`GET /auth/login-status`)
  - SMS Login (`POST /auth/sms`, form fields `mobile_number`, `country_code`, `resend`; response includes `customer_id` and `cart_session_id`), and Verify SMS Login
  - WhatsApp Login and Verify
  - Email Login and Verify
  - Register
  - Register Guest (`POST /auth/register/guest`): "can be used during guest checkout to associate customer information with the current session"

  — [SMS Login](https://docs.zid.sa/sms-login-38265943e0); [Login Status](https://docs.zid.sa/login-status-38265898e0); [Register Guest](https://docs.zid.sa/register-guest-38268430e0); [index](https://docs.zid.sa/llms.txt)
- [UNCLEAR] Contradiction: the Mobile Apps page says "The Storefront APIs do **not** provide endpoints for login or checkout", yet the OTP login endpoints above are documented. They sit in the same Vitrin "Authentication" folder, with higher doc IDs (`38265xxx`) than the cart endpoints (`26082xxx`), which suggests they were added later. — [Login & Checkout via Page Views](https://docs.zid.sa/login-checkout-via-page-views-2258377m0) vs [SMS Login](https://docs.zid.sa/sms-login-38265943e0)
- [CONFIRMED-DOC] Cart endpoints:
  - Get Cart (`GET /cart`), Remove Cart, Duplicate Cart
  - Add Cart Item (`POST /cart/items`; supports custom fields, selection groups and bundles, and a `share_token` for shared carts)
  - Update, Remove and Empty Cart Items; Upload Cart Input Field
  - Add and Remove Gift Card
  - Apply Coupon, Remove Coupon, Check Coupon Validity
  - Apply and Remove Loyalty Points, Preview Rewarded Points, Redemption Methods, Loyalty Wallet, Points Balance
  - List Bank Discounts

  — [Add Cart Item](https://docs.zid.sa/add-cart-item-26083895e0); [Apply Coupon](https://docs.zid.sa/apply-coupon-26257791e0); [index](https://docs.zid.sa/llms.txt)
- [CONFIRMED-DOC] Catalog endpoints:
  - List Products (paginated; filters for search, sort, category, price range, on-sale and attributes) and Search Products
  - Get Product by Slug and Calculate Product Options Price
  - Notify Stock Availability
  - Bundle offers
  - Product reviews (list, create, update, delete) and product questions
  - Selection groups
  - List Categories
  - Pages, Blogs, Store Scripts, Countries and Cities

  — [List Products](https://docs.zid.sa/list-products-25510175e0); [index](https://docs.zid.sa/llms.txt)
- [CONFIRMED-DOC] Customer account endpoints: Get, Update and Delete profile; Addresses CRUD and Address Form Schema; Get Orders (`GET /account/orders`, paginated with `page` and `page_size`); Wishlist get, add and remove, plus a shareable link; Check Product Purchase Status. — [Get Orders](https://docs.zid.sa/get-orders-26722142e0); [index](https://docs.zid.sa/llms.txt)
- [CONFIRMED-DOC] Get Cart is session-authenticated (401 codes `ERROR_SESSION_MISSING` and `ERROR_SESSION_INVALID`). It is described as the "single source of truth for checkout state". — [Get Cart](https://docs.zid.sa/get-cart-26082659e0)
- [CONFIRMED-DOC] Payment docs on docs.zid.sa ("Zid Payments Open APIs", Direct and Embedded payment, Apple Pay provider endpoints, Refund) target **payment service providers integrating into Zid Payments**, not app developers. Base URLs are `https://zidpay.org/` and `https://testing.zidpay.org/`. — [Payments Overview (PSP)](https://docs.zid.sa/overview-1340225m0); [Payment checkout types](https://docs.zid.sa/overview-1340608m0)
- [CONFIRMED-DOC] Theme-side checkout features ("Checkout as a Popup", "Login as a Popup", "Apple Pay Quick Checkout") are Jinja/JS includes for web themes. For example, `{% include "vitrin:checkout/checkout_dialog.jinja" %}` exposes `window.checkout_dialog.open()`. These are web constructs and cannot be reused in Flutter. — [Checkout as a Popup](https://docs.zid.sa/checkout-as-a-popup-1806668m0)
- [CONFIRMED-DOC] The "Mobile Apps > Scripts" page documents `GET /api/v1/scripts`, which returns a manifest of `external_scripts` and `app_scripts_bundle` (tracking-pixel snippets, event keys such as `purchase_event` and `add_to_cart_event`). It describes loading them in a WebView for hybrid apps, or as remote config for React Native "and similar". — [Mobile Apps: Scripts](https://docs.zid.sa/scripts-1758413m0)

### Inferences
- A practical Flutter architecture:
  1. A native catalog and cart built on `https://{store}/api/v1/*` with a shared cookie jar and `Zid-Client-Platform: mobile-app`.
  2. Native OTP login via `/auth/sms` and `/auth/whatsapp` if those keep working for mobile clients; otherwise the WebView login page.
  3. A WebView checkout page sharing the same cookies, to handle shipping, payment, 3-D Secure and Apple Pay.
  4. Order tracking natively via `/account/orders`, with Merchant API webhooks feeding push notifications.
- **Apple Pay inside a WebView** is constrained on iOS (Apple Pay JS works in WKWebView only under specific conditions). Merchant-domain Apple Pay registration belongs to Zid/ZidPay, so "native Apple Pay" in a third-party app is very likely impossible. This is an inference and was not verified in Zid docs.
- App Store review risk: Apple guideline 4.2 (minimum functionality) is lower for an app whose catalog and cart are native and whose web checkout is embedded than for a pure website wrapper.

### Gaps
- No public documentation of the checkout page URL pattern, how to detect order completion in the WebView (redirect URL or JS event), or how to deep-link back to native screens.
- No documented rate limits, CORS, bot-protection (Turnstile) or abuse rules for the Storefront APIs.
- I could not confirm whether native OTP login is officially supported for mobile apps or limited to themes (see the contradiction above).

## Q4. Rate limits, pagination, Retry-After

### Takeaway
**Confirmed.** The Merchant API limit is **60 requests per 60 seconds, per app, per store**, enforced with a leaky-bucket algorithm. A 429 response carries a `Retry-After` header. Zid says limits are configurable, and exceptions can be requested by email. Pagination is page-based.

### Cited Findings
- [CONFIRMED-DOC] "When any third-party system calls our API, we have introduced a restriction of `60 requests / Minute` per application per store." The page names the **Leaky Bucket Algorithm** and says exceptions are evaluated if you "email us with details". It recommends webhooks over polling. — [Rate Limiting](https://docs.zid.sa/rate-limiting-644369m0)
- [CONFIRMED-DOC] "Zid rate-limits app requests **per app, per store** — the default is **60 requests per 60 seconds**… Per-app and per-store limits can be configured by Zid, so treat 60/60s as a floor, not a contract." Response: "HTTP `429`, `message.code` = `MSG_HIDDEN`, plus a **`Retry-After`** header giving the seconds until the window resets." The page warns that the most common cause of 429s is a "401 refresh loop" (refreshing on a missing-scope 401). — [OAuth Errors & Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)
- [CONFIRMED-DOC] Error catalogue: `429 too_many_requests`, "Implement retry logic or reduce the request rate"; "Implement exponential backoff strategies". — [Responses](https://docs.zid.sa/responses)
- [CONFIRMED-DOC] Merchant list endpoints use `page` and `per_page` (for example, List Orders). Storefront uses `page` and `page_size` (customer orders, products). — [List Orders](https://docs.zid.sa/list-of-orders); [Get Orders (customer)](https://docs.zid.sa/get-orders-26722142e0)
- [OBSERVED] The Storefront products response has the shape `{"results":[…],"count","page","page_size":24,"next","previous","pages_count"}`, and no rate-limit headers were returned.

### Inferences
- 60 req/min per store is fine for webhook-driven sync but tight for bulk catalog pulls on large stores. A 10,000-product store at about 50–100 products per page needs roughly 100–200 calls, about 2–4 minutes. Shopper traffic should therefore go to the Storefront APIs on the store domain, which are not covered by this rule, rather than be proxied through the Merchant API.

### Gaps
- Maximum `per_page` values and any Storefront API rate limits are undocumented.

## Q5. Webhooks: events, retries, signature verification

### Takeaway
There are two webhook systems:
- **Store data webhooks**, created through the Merchant API: order, product, abandoned cart, customer and category events.
- **App and subscription events**, configured in the Partner Dashboard: install, uninstall and subscription lifecycle.

Retries are 3 attempts at 1, 5 and 15 minutes, with health tracking that suspends ("breaks") endpoints after 30 failures per hour. There is **no HMAC signature**. Verification is optional HTTP Basic Auth (username and password you set) or custom headers.

### Cited Findings
- [CONFIRMED-DOC] Store events:
  - Orders: `order.create`, `order.status.update`, `order.payment_status.update`
  - Products: `product.create`, `product.update`, `product.publish`, `product.delete`
  - Abandoned carts: `abandoned_cart.created`, `abandoned_cart.completed`
  - Customers: `customer.create`, `customer.update`, `customer.merchant.update`, `customer.login`
  - Categories: `category.create`, `category.update`, `category.delete`

  Conditions (`delivery_option_id`, `status`, `payment_method`) are supported only on `order.create` and `order.status.update`. Requests for new events go to appmarket@zid.sa. — [Webhooks Overview](https://docs.zid.sa/webhooks)
- [CONFIRMED-DOC] Webhooks are created via `POST /v1/managers/webhooks` (scope `third_webhook_write`). "If `username` and `password` are provided when creating a webhook, Zid will include a `Basic Authentication` header… This allows partners to verify that the webhook request is coming from Zid." — [Create Webhook](https://docs.zid.sa/create-a-webhook)
- [CONFIRMED-DOC] Retries: "Each webhook event is attempted up to **3 times** with exponential backoff" (1 min, 5 min, 15 min). Health states: **degraded** at 10 or more failures per hour, **broken** at 30 or more failures in a sliding 60-minute window ("Event delivery is suspended until you recover the webhook"). Broken webhooks trigger an hourly email with a CSV, and `GET /v1/managers/webhooks/broken` plus `POST /v1/managers/webhooks/broken/recover` handle recovery, which requires a new target URL. — [Webhook Health Tracking](https://docs.zid.sa/webhook-health-tracking-2197281m0)
- [CONFIRMED-DOC] App and subscription events:
  - App: `app.market.application.authorized`, `.install`, `.uninstall`, `.rated`; `app.market.private.plan.request`
  - Subscription: `app.market.subscription.active`, `.warning`, `.suspended`, `.expired`, `.renew`, `.upgrade`, `.refunded`, `.usage_based.payment_success`

  These are subscribed per event in the Partner Dashboard, and reviewers expect paid apps to handle the full lifecycle. — [Subscription and app events](https://docs.zid.sa/subscription-and-app-events-2490915m0); [Submit for review](https://docs.zid.sa/submit-app-for-review)
- [CONFIRMED-DOC] Test checklist: "A token or secret in the `target_url` is not accepted. Send it in a header instead." — [Test your app](https://docs.zid.sa/test-your-app)
- [CONFIRMED-DOC] Order webhook payloads may contain "placeholder email" addresses that are not deliverable. — [Order webhook schema](https://docs.zid.sa/webhook-events-order)

### Inferences
- These events are enough for order-status push notifications (`order.status.update`) and abandoned-cart push (`abandoned_cart.created`). Mapping a Zid customer to an app device token must happen on the vendor's side, for example at login using `customer_id`.
- With no HMAC, the vendor should use HTTPS, Basic Auth and per-store secrets, and re-fetch the order via the API before trusting payload contents.

### Gaps
- No documented ordering guarantees, idempotency keys, delivery timeout or payload size limits.

## Q6. Zid App Market partner program: requirements, billing, revenue share, approval timeline

### Takeaway
Publishing a public app requires the following:
- Partner onboarding: Saudi CR (10 digits) for companies or an ID document for individuals, plus VAT details where applicable
- A signed partnership agreement and agreed "commercial terms"
- A bank account
- An installation on a development store
- Justified minimal scopes
- At least a free plan, or a paid plan with a free trial

Zid bills merchants (SAR only) and pays partners monthly against invoices, keeping a **"Zid Share"**. The **percentage is not public**: it is set in the partner agreement or commercial terms. No review timeline is published.

### Cited Findings
- [CONFIRMED-DOC] Company onboarding requires names in Arabic and English, a "Commercial Registration Number — Saudi CR numbers must be exactly 10 digits", the CR certificate, VAT status and number (15 digits, starting and ending with 3), and an address. Individuals need an ID document, with a freelancer document optional. Document verification does not block submission, but "payouts cannot be settled" until finance verifies. — [Submitting your app for review](https://docs.zid.sa/submit-app-for-review)
- [CONFIRMED-DOC] Reviewer checks include "Bank account present…", "Partnership agreement **signed**", and "Commercial terms agreed with your partnership manager". OAuth must start "the moment the merchant clicks Activate", with no signup before OAuth and no manual token or Store ID entry. — [Submitting your app for review](https://docs.zid.sa/submit-app-for-review); [Test your app](https://docs.zid.sa/test-your-app)
- [CONFIRMED-DOC] "This installation [on a development store] is required, and we check it first." The most common rejection reason is scopes that don't match features. — [Submitting your app for review](https://docs.zid.sa/submit-app-for-review); [Justifying your scopes](https://docs.zid.sa/justifying-your-scopes-2490953m0)
- [CONFIRMED-DOC] Plan rules:
  - Before review, the app needs "a free plan, or a paid plan with a free trial"; "Apps are not published as permanently free."
  - Plan types are Free, Recurring (1–11 months or 1 year) and Usage-based (charged up to twice a month), and an app cannot mix them.
  - Limits: 8 plans per app, **SAR only**.
  - Extras: free trials up to 90 days, discounts up to 60%, and a one-time installation fee are allowed.
  - Private plans are available for single merchants.

  — [Plans and pricing](https://docs.zid.sa/plans-and-pricing-2490911m0). Conflict: a Sept 2026 Zid partner blog says "at least one pricing plan (up to four)". — [Your first Zid app blog](https://zid.sa/en/partners/developers/blog/first-app-dev-store/)
- [CONFIRMED-DOC] Payouts: a monthly payout record arrives on the 6th for the previous month. The table shows "Partner Share" and "Zid Share" (both excluding VAT) plus "Withholding Tax" for partners outside KSA. Partners upload a VAT invoice, and statuses run Pending, In Review, Rejected, Settled. — [Help-partner: For Subscription App Partners](https://help-partner.zid.sa/en/articles/8750100-for-subscription-app-partners)
- [CONFIRMED-DOC] "Zid takes a share of your solution's revenue only once it starts selling". The share is defined in the partner agreement, and no percentage is published. Optional paid "Partner Ads" and sponsored placement exist for green-tier partners. Critical support responses start at 4 business hours. — [Zid Developer Programs](https://zid.sa/en/partners/developers/)
- [NOT FOUND] No public App Market revenue-share percentage. Zid's 30–35% figures belong to the affiliate and channel *referral* programs, not the App Market. — [Zid Affiliate](https://zid.sa/en/affiliate/); [Zid Channel](https://channel.zid.sa/en/home-en/)
- [NOT FOUND] No published review SLA or number of days. The partner blog says only that you are notified of review status "and an estimated publish date". — [Your first Zid app blog](https://zid.sa/en/partners/developers/blog/first-app-dev-store/)

### Inferences
- Zid, not the vendor, collects merchant subscription payments for public apps, through Zid's billing in SAR. A vendor selling a mobile-app service through the App Market would therefore pay Zid's share on every subscription. Selling outside the market as a private app is limited to Professional or Enterprise plans, or merchants with API Access.

### Gaps
- The actual revenue-share percentage, which requires the partner agreement at partner.zid.sa/partnership-details or a conversation with a Zid partnership manager.
- Typical approval duration.

## Q7. Does Zid offer its own (first-party) mobile app for merchant stores?

### Takeaway
Yes, effectively. Zid's dashboard has a **Channels > Mobile App (القنوات > تطبيق الجوال)** sales channel that sells branded store apps, built and published by Zid's partner **App Bunches (عناقيد التطبيقات)** through the App Market. The plans are Basic, Advanced, Quick Track and Professional, on annual subscriptions. This is the incumbent, Zid-endorsed competitor for a third-party native app.

### Cited Findings
- [CONFIRMED-DOC] The Arabic help page "تطبيق متجرك على الجوال" (last updated 2 Nov 2026) says:
  - The app is enabled from **القنوات > تطبيق الجوال** by clicking "إنشاء تطبيقك الآن", which leads to the App Market to subscribe.
  - It is built and published by Zid partner **عناقيد التطبيقات (App Bunches)**.
  - Plans: Basic, Advanced, Quick Track and Professional; one-year subscription.
  - Push notifications are free and unlimited; abandoned-cart notifications only in the Professional plan.
  - Delivery takes 10–20 business days, plus 2–14 days of store review.
  - Without their own developer account, merchants get publication on the Apple App Store under an App Bunches sub-account, transferable later.
  - The Advanced plan's look depends on the theme, and "App Bunches SDK themes" are supported.

  — [Zid Help: تطبيق متجرك على الجوال](https://help.zid.sa/ar/mobile-app)
- [CONFIRMED-DOC] The help-center onboarding lists the sales channels as: online store, **mobile app**, POS, and marketplaces. — [ابدأ مع زد](https://help.zid.sa/ar/getting-started)
- [CONFIRMED-DOC] The theme settings mapping includes mobile-app fields (`store.apps.ios_app_id`, `store.apps.android_package_name`, `store.mobile_app_tab_settings`). This shows mobile-app integration built into the store model, including an app-download banner. — [Store Settings Mapping](https://docs.zid.sa/store-settings-mapping-1379317m0)
- [CONFIRMED-DOC] Other third-party Zid mobile-app vendors are visible: MobiLoud markets a Zid "native app" conversion (its page returned HTTP 403 to my fetch), and API2Cart markets a "Mobile APP Builder Integration with Zid". — [MobiLoud Zid](https://www.mobiloud.com/use-cases/zid-mobile-app); [API2Cart Zid mobile builder](https://api2cart.com/zid-mobile-app-builder-integration/)
- Not to be confused: "زد" on the [App Store](https://apps.apple.com/us/app/%D8%B2%D8%AF-%D9%85%D8%AA%D8%AC%D8%B1%D9%83-%D8%A7%D9%84%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A-%D9%81%D9%8A-%D8%AC%D9%88%D8%A7%D9%84%D9%83/id6443907047?l=ar) and [Google Play](https://play.google.com/store/apps/details?id=sa.zid.merchants&hl=en_US) is the **merchant-management** app, not a shopper app.

### Inferences
- The docs' "Mobile Apps" section (session cookie, `Zid-Client-Platform: mobile-app`, scripts manifest, section `meta.type` for "mobile-compatible" sections) appears built to support mobile app builders like App Bunches. The docs do not say it is exclusive, so a third party can likely use the same rails. A new entrant would compete with a Zid-integrated, dashboard-promoted incumbent.

### Gaps
- App Bunches plan prices, and whether App Bunches has privileged API access beyond the public docs.

## Q8. Known limitations, deprecations and developer pain points

### Takeaway
The main hard limits are: no native checkout or payment API; possibly no API login for mobile; no published terms, SLA or rate limits for the Storefront APIs; 60 req/min per store on the Merchant API; no webhook HMAC; and revenue share hidden behind the agreement. The docs themselves are mid-revision, with known errors flagged in their own editorial comments. I found no substantive public GitHub issues or forum complaints.

### Cited Findings
- [CONFIRMED-DOC] Zid's own doc revision notes flag errors on live pages:
  - Samples that embedded "what looks like a real 40-character client secret"
  - A sample pointing at `https://api.zid.dev/app/v1/...`, a non-production host
  - A stray editorial line "currently published live"
  - Mislabelled token expiry ("1 year")

  — [Authorization (.md source)](https://docs.zid.sa/authorization.md)
- [CONFIRMED-DOC] Operational pitfalls Zid itself highlights: the refresh token expires 2 years before the access token ("the single most common way Zid integrations die"); a 401 refresh loop on missing scopes causes 429s; adding scopes forces every merchant to deactivate and reactivate; and Zid replies in Arabic by default without `Accept-Language`. — [Authorization](https://docs.zid.sa/authorization); [OAuth Troubleshooting](https://docs.zid.sa/oauth-troubleshooting)
- [CONFIRMED-DOC] API versions other than v1 are deprecated. Themes are migrating from legacy Twig to "Vitrin" (Jinja), with a "Breaking Changes" page and "Legacy Theme Migration". The JS SDK renamed functions (e.g., old `zid.store.cart.fetch()` became `window.zid.cart.*`). — [Authorization](https://docs.zid.sa/authorization); [Cart (JS)](https://docs.zid.sa/cart-1475306m0); [index](https://docs.zid.sa/llms.txt)
- [CONFIRMED-DOC] Template-settings and section `meta.type` (both mobile-relevant) are "early version… subject to change", applied only to Soft Theme Vitrin. — [Theme Sections Settings](https://docs.zid.sa/theme-sections-settings-2258380m0)
- [UNCLEAR] Storefront API specs list `https://api.zid.sa/` as their server, but the endpoints actually respond on store domains (see Q1, [OBSERVED]). This documentation inaccuracy will confuse integrators.
- [CONFIRMED-DOC] Zid provides an MCP server (`npx zid-open-apis-mcp`) for querying the API docs from AI IDEs, and a "Zid Agent Skill". Feature requests go to changelog.partner.zid.sa/feedback. — [Our custom MCP server](https://docs.zid.sa/our-custom-mcp-server-1363315m0); [Start Here](https://docs.zid.sa/start-here)

### Inferences
- Because older stores may still run legacy (Twig) themes, a native app that reads home-page layout from `template-settings` may behave inconsistently across merchants. The docs scope `meta.type` to one theme today.

### Gaps
- No public GitHub issues, forum threads or developer complaints specifically about Zid's APIs were found. The partner Telegram community (t.me/zidpartnersthemes) was not accessible to search.
- No deprecation timeline for legacy themes or for any Storefront API endpoint.
