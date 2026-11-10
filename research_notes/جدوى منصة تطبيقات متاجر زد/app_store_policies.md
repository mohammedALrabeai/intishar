# App Store and Google Play Policies for White-Label / Template-Generated Shopping Apps (one Flutter codebase, one branded app per merchant)

Research date: 2026-11-10. Policy text was fetched live where possible. Apple's guideline page shows no "last updated" stamp in the fetched text, so change dates below come from secondary coverage and are marked as such.

---

## 1. Current text of Apple guidelines 4.2.6, 4.3, 4.2 / 4.2.2, 2.5.2 and 3.1, and whether 4.2.6 changed in 2024–2026

### Takeaway
4.2.6 is unchanged in substance since the 20 Dec 2017 revision. It allows template-built apps only when "submitted directly by the provider of the app's content", meaning the merchant's own developer account, or as one aggregated "picker" app. The big 2026 change is a stricter 4.3(b) (June 9, 2026), which adds removal of low-value or stale apps and threatens Developer Program removal for repeat low-effort submissions. Physical goods must not use IAP (3.1.3(e)), and the same holds on Google Play.

### Cited Findings
**Verbatim current text** (fetched from [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Nov 2026):
- **4.2.6:** "Apps created from a commercialized template or app generation service will be rejected unless they are submitted directly by the provider of the app's content. These services should not submit apps on behalf of their clients and should offer tools that let their clients create customized, innovative apps that provide unique customer experiences. Another acceptable option for template providers is to create a single binary to host all client content in an aggregated or "picker" model, for example as a restaurant finder app with separate customized entries or pages for each client restaurant, or as an event app with separate entries for each client event." — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **4.3(a):** "Don't create multiple Bundle IDs of the same app (for example, submitting a separate map app for every city in the world instead of a single worldwide map that allows users to search any city). This practice results in unnecessary apps, which makes it hard for users to find the apps they want. If your app has different versions for specific locations, sports teams, universities, etc., consider submitting a single app and providing the variations using in-app purchase." — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **4.3(b):** "Don't submit apps that are indistinguishable from what's already widely available. Opportunistically creating variants of existing app categories or popular apps degrades App Store discovery, reduces overall app quality, and harms both users and developers. Certain kinds of apps, such as dating, flashlight, sound effects, wallpaper, simple timers, and fortune telling, are well established on the App Store and we will not accept new submissions unless they offer a meaningfully different or improved experience. We may remove these apps from the App Store going forward if they are not updated, improved, or do not attract customers. Other kinds of apps, such as drinking games, Kama Sutra, fart, and burp apps, are mediocre, low-quality, or low-effort and do not add value to the App Store. Repeated submissions of this kind may lead to removal from the Apple Developer Program." — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **4.2 (intro):** "Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or "app-like," it doesn't belong on the App Store. If your App doesn't provide some sort of lasting entertainment value or adequate utility, it may not be accepted…" — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **4.2.2:** "Other than catalogs, apps shouldn't primarily be marketing materials, advertisements, web clippings, content aggregators, or a collection of links." — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **4.2.3:** "(i) Your app should work on its own without requiring installation of another app to function. (ii) If your app needs to download additional resources in order to function on initial launch, disclose the size of the download and prompt users before doing so." — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **2.5.2:** "Apps should be self-contained in their bundles, and may not read or write data outside the designated container area, nor may they download, install, or execute code which introduces or changes features or functionality of the app, including other apps. Educational apps designed to teach, develop, or allow students to test executable code may, in limited circumstances, download code provided that such code is not used for other purposes…" — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **Developer Program License Agreement 3.3.1(B), Executable Code** (the contractual twin of 2.5.2): "an Application may not download or install executable code. Interpreted code may be downloaded to an Application but only so long as such code: (a) does not change the primary purpose of the Application by providing features or functionality that are inconsistent with the intended and advertised purpose of the Application (b) does not bypass signing, sandbox, or other security features of the OS; and (c) for Applications distributed on the App Store, does not create a store or storefront for other Applications." — [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- **3.1.1 (first paragraph):** "If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, game levels, access to premium content, or unlocking a full version), you must use in-app purchase…" It does not mention physical goods. — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **3.1.3(e) Goods and Services Outside of the App:** "If your app enables people to purchase physical goods or services that will be consumed outside of the app, you must use purchase methods other than in-app purchase to collect those payments, such as Apple Pay or traditional credit card entry." Physical-goods shopping apps are therefore not only exempt from IAP but forbidden from using it. — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **5.2.1:** "…Apps should be submitted by the person or legal entity that owns or has licensed the intellectual property and other relevant rights." — [Apple](https://developer.apple.com/app-store/review/guidelines/)
- **Google Play equivalent for physical goods:** Play Billing is not required where "payment is primarily… for the purchase or rental of physical goods (such as groceries, clothing, housewares, electronics)". — [Google Play Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en)

**Change history:**
- 4.2.6 was revised on 20 Dec 2017, after builder pushback, from a near-total ban on template apps to the current "submitted directly by the provider of the app's content" wording, with the "picker" option added. — [MacRumors, Dec 2017](https://macrumors.com/2017/12/20/app-store-guidelines-updated-template-apps); [TechCrunch, Dec 2017](https://techcrunch.com/2017/12/20/apple-revises-its-controversial-guidelines-on-template-based-apps/); [GoodBarber (quotes the 20 Dec 2017 wording, which matches today's)](https://www.goodbarber.com/blog/app-store-4-2-6-rule-and-app-builders-a885/)
- No 2024–2026 amendment to 4.2.6 was found. Secondary 2025–2026 sources still cite the same text. — [Newly guide, Oct 2026](https://newly.app/guides/can-no-code-apps-go-on-the-app-store); [Choicely](https://www.choicely.com/tutorials/app-store-rejection-reasons)
- **9 June 2026:** Apple tightened 4.3(b). Apps in saturated categories that are "not updated, improved, or do not attract customers" may now be removed. A new tier labels some apps "mediocre, low-quality, or low-effort", with "removal from the Apple Developer Program" for repeat submissions. The same update touched 1.2 (UGC) and 4.5.3 (Live Activities). — [MacRumors, 9 Jun 2026](https://www.macrumors.com/2026/06/09/app-store-guidelines-low-quality-apps/); [9to5Mac, 9 Jun 2026](https://9to5mac.com/2026/06/09/apple-tightens-app-review-guidelines-against-apps-that-do-not-add-value-to-the-app-store/); [iPhone in Canada, 10 Jun 2026](https://www.iphoneincanada.ca/2026/06/10/apple-updates-app-store-guidelines/)
- **~16–17 Oct 2026:** Further update covering nonconsensual intimate imagery and "bait-and-switch" apps (Section 5). 2.3.1(a) now reportedly requires specific descriptions of new features in App Review notes. This comes from secondary trackers, and the section-level diff was not verifiable. — [PPC Land](https://ppc.land/apples-app-store-rules-now-require-apps-to-remove-ai-intimate-imagery/); [ConductAtlas change record (diff locked)](https://conductatlas.com/change/2026-10-17-apple-apple-app-store-review-guidelines-5687/); [ConductAtlas provision: describe new features](https://conductatlas.com/platform/apple/apple-app-store-review-guidelines/provision/CA-P-018845/apps-must-describe-new-features-in-whats-new-text/)
- A RuntimeWire article (10 Oct 2026) restates that app-generation services "should not submit on clients' behalf" and that "Automating code and builds, or using a customer's account, does not guarantee approval." The page carries an editorial note that its claims came from an emailed tip and need verification. — [RuntimeWire](https://runtimewire.com/article/apple-guideline-426-app-generation-submission)

### Inferences
- A native Flutter shopping app with catalog, cart, checkout, accounts, order tracking and push notifications fits 4.2.2's explicit "Other than catalogs" carve-out. It should clear 4.2 more easily than a thin WebView wrapper. Rendering checkout or the whole store in a WebView increases 4.2 "repackaged website" risk.
- Under 2.5.2 and DPLA 3.3.1(B), server-driven theming, layout JSON, feature flags and merchant content are fine as data. Shipping new Dart or executable logic over the air is not, nor is materially changing what the app does after review. The Oct 2026 "bait-and-switch" tightening makes post-review feature changes via remote config riskier. Any new capability should go through a new binary with an accurate "What's New" / review note.
- The 2026 4.3(b) language ("not updated, improved, or do not attract customers") adds a new operational risk for low-traffic merchant apps that are never updated. The platform should push periodic real binary updates to every merchant app and monitor engagement.
- Payments: a Saudi merchant app must use card, Apple Pay or local gateways (e.g., Mada via a PSP) for goods, never IAP. Any digital extras sold in-app (paid memberships unlocking app features, digital gift content consumed in-app) would trigger 3.1.1 / Play Billing.

### Gaps
- Apple's page did not show a "last updated" date in the fetched text. The exact Oct 2026 section-level changes could not be confirmed from Apple directly, because the ConductAtlas diff is paywalled.
- No Apple statement was found clarifying 4.2.6 specifically for 2024–2026. The "unchanged" conclusion rests on the text match with the 2017 revision plus secondary sources.

---

## 2. What "submitted directly by the provider of the app's content" means in practice: merchant-owned accounts, platform as team member, and how builders do it

### Takeaway
In practice each merchant must hold its own Apple Developer Program membership, ideally as an organization, and the app must list the merchant as seller. The builder is then invited into the merchant's team, typically as Admin, and builds, uploads and submits via an App Store Connect API key. Tapcart, Vajro, Shopney and MobiLoud all follow this model. The DPLA, however, contains a sentence that literally forbids using a "Service Provider" to submit to the App Store or TestFlight. The industry relies on the "contractors added to your team" carve-out, so this is a tolerated practice rather than an explicitly blessed one.

### Cited Findings
**Apple's own contractual language (DPLA):**
- **Section 1.2 note on contractors:** "For the sake of clarity, You may authorize contractors to develop Applications on Your behalf, but any such Applications must be owned by You, submitted under Your own developer account, and distributed as Applications only as expressly permitted herein. You are responsible to Apple for Your contractors' activities under Your account (e.g., adding them to Your team to perform development work for You) and their compliance with this Agreement." — [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- **Section 2.9 Third-Party Service Providers:** A developer may retain a Service Provider "to assist You in using the Apple Software and Services… provided that any such Service Provider's use… is done solely on Your behalf… Notwithstanding the foregoing, You may not use a Service Provider to submit an Application to the App Store or use TestFlight on Your behalf. You agree to have a binding written agreement with Your Service Provider with terms at least as restrictive and protective of Apple as those set forth herein. Any actions undertaken by any such Service Provider… shall be deemed to have been taken by You… Apple reserves the right to require You to cease using such Service Provider." — [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- **Section 2.1:** "You agree not to share, sell, resell, rent, lease, lend, or otherwise provide access to Your developer account… to anyone who is not an Authorized Developer on Your team, and You agree not to solicit or request Apple Developer Program members to provide You with their Apple Accounts, authentication credentials, and/or related account information and materials (e.g., Apple Certificates used for distribution…). You understand that each team member must have their own Apple Account or authentication credentials to access Your account…" — [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- **"Authorized Developers"** are defined as "Your employees and contractors, members of Your organization…" who each have their own Apple Developer account and a need to use the Apple Software. — [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- The service-provider restriction is old. A 2019 New Jersey state IT policy paraphrases it: "the Apple Developer Agreement does not permit contractors (Service Providers) to upload applications directly to the Apple Store on behalf of the State". — [NJ OIT policy 19-01 (PDF)](https://www.nj.gov/it/docs/ps/19-01-NJOIT_Enterprise_Apple_Developer_Account.pdf)

**How Apple App Review enforces it (rejection text):**
- Guideline 5.2.1 rejection (forum post, Mar 2023): "We noticed that your app was created from an app generation service or a commercialized template, but does not appear to be directly submitted by the owner or provider of the business, brand, or service… this app must be submitted by the owner of the business or organization for which the app has been designed under its own Apple Developer Program account. Alternatively, you may provide documentation that shows your ownership of the business… from a governmental authority or other reputable source of business registration… providing documentation of your rights to include third-party content within your app is not sufficient… For new apps, you will need to ask your client to enroll in the Apple Developer Program and submit this app under its own Apple Developer Account." — [Apple Developer Forums thread 727183](https://developer.apple.com/forums/thread/727183)

**Builder practices:**
- **Tapcart** (help article dated 17 Apr 2026) asks merchants to "Enroll as a Company/Organization — not Individual" on Apple, pay "The $99 annual fee", and give Tapcart Admin access ("Tapcart needs Admin access to your Apple Developer account to submit and manage your iOS app"). Merchants also generate an App Store Connect API key, which requires "Admin or Account Holder permissions", for "the access it needs to build and submit your iOS app". On Google Play, merchants "Enroll as an Organization or Business", pay "The $25 one-time fee", and invite Tapcart with "Administrator permissions". Tapcart advises using "a shared or role-based email" because "the account owner cannot be changed later". It calls account setup "the single biggest factor in how quickly you can go live." — [Tapcart: Step 4 Register Your Developer Accounts](https://help.tapcart.com/en/articles/14660540-step-4-register-your-developer-accounts)
- Tapcart also has a guide for migrating an Individual Apple account to Organization. It needs a D-U-N-S number matching the legal entity name exactly, and only the Account Holder can do it. — [Tapcart: Migrating your Apple Developer account](https://help.tapcart.com/en/articles/13800702-migrating-your-apple-developer-account)
- **Vajro:** "You must enroll in the Apple Developer Program as an Organization". The merchant invites Vajro via Users and Access → Invite People, then enters the Issuer ID, API Key ID, .p8 file and Vendor ID into Vajro so it can handle "publishing and management of your iOS app". — [Vajro docs](https://docs.vajro.com/en/articles/12504715-how-to-set-up-your-apple-developer-account-with-vajro). An older Vajro article snippet says to "complete the Individual Account steps first, even if you have an Organization account" and that once set up "they would be able to upload the app in one business day, and Apple would take 24-48 hours to approve". This conflicts on account type with the newer article. — [Vajro older invite article](https://docs.vajro.com/en/articles/1745884-inviting-vajro-to-your-apple-developer-account)
- **Shopney:** The user role "must be selected as 'Admin'", which is needed to submit and publish. Merchants verify invitations in the Shopney dashboard, then contact support to start submission. — [Shopney: grant admin access](https://support.shopney.co/en/articles/10275867-how-to-grant-shopney-team-admin-access-to-your-developer-accounts); [Shopney: verify invitations and submit](https://intercom.help/shopney/en/articles/10173149-how-to-verify-invitations-and-submit-your-app)
- **MobiLoud:** For MobiLoud to submit under the client's account, the client must "provide us with your Apple's account credentials or add us as an Admin team member to your team (for Organisation accounts only)". — [MobiLoud KB: how to provide access to your Apple account](https://www.mobiloud.com/help-knowledge-base/how-to-provide-access-to-your-apple-account)
- **GoodBarber,** after talking with Apple's review team: "The developer account used to submit the app to the App Store must be that of the app's content creator". Apple wants a contractual link with the content creator, not the technology provider or its resellers. For a public body, "Under no circumstances can the developer account be one personally belonging to an employee in charge of the project." — [GoodBarber blog (2018, updated 2020)](https://www.goodbarber.com/blog/app-store-4-2-6-rule-and-app-builders-a885/); [GoodBarber help on 4.2.6/5.2.1](https://www.goodbarber.com/help/manage-developer-accounts-apple-google-r97/understand-apple-developer-account-compliance-with-guidelines-4-2-6-and-5-2-1-a323/)
- **Mobincube** stopped publishing under its own account: "if only one app on our account would happen to be considered to be infringing the 4.2.6 clause, Apple could ban our whole account and all other publishers would be affected." — [Mobincube blog](https://blog.mobincube.com/highly-recommended-publish-your-ios-apps-under-your-own-apple-developer-account/)
- **Community reading** (Apple Developer Forums, Aug 2026, not Apple staff): "If it's your client that owns the app, then they have to be the account holder… You can have them create an account and give you the Developer role or equivalent so that you can develop and publish THEIR app." — [Forum thread 840982](https://developer.apple.com/forums/thread/840982). Another community reply (Mar 2024): "4.2.6 just says they all have to be submitted under their own accounts. No problem there." — [Forum thread 743316](https://developer.apple.com/forums/thread/743316)

**Account-type mechanics:**
- For individual enrollments, users added in App Store Connect "receive access only to your content in App Store Connect and are not considered part of your team in the Apple Developer Program". Full team membership, needed for certificates and profiles, requires an organization enrollment. — [Apple: Roles](https://developer.apple.com/help/account/access/roles/)
- The Account Holder alone must "renew your annual program membership, accept legal agreements on behalf of your organization, initially add Admins to the team, and approve banking changes". When an agreement is updated, "your Account Holder will be notified and must accept the agreement." — [Apple: Roles](https://developer.apple.com/help/account/access/roles/)

### Inferences
- The defensible model for this platform is the **decentralized, merchant-owned** one, which every major builder uses:
  - The merchant (legal entity) is the Account Holder.
  - The platform's staff or a dedicated platform Apple Account is invited as Admin, or App Manager if that suffices.
  - The platform builds, signs and uploads with a team or individual API key.
  - The seller name is the merchant's legal entity.
- The platform must **never ask merchants for their Apple ID and password**. DPLA 2.1 prohibits soliciting credentials, and each team member must have their own Apple Account. MobiLoud's "provide us with your Apple's account credentials" option is a pattern to avoid.
- DPLA 2.9 ("may not use a Service Provider to submit an Application to the App Store or use TestFlight on Your behalf") sits in tension with 1.2 ("contractors… adding them to Your team"). Tapcart, Vajro, Shopney and MobiLoud operate openly as team-member submitters, so Apple appears to treat an invited team member as an "Authorized Developer/contractor" rather than a barred "Service Provider".
- A conservative design would mitigate this residual legal risk three ways:
  - Have the merchant click "Submit for Review" for the first submission, or at least explicitly approve it in the platform dashboard.
  - Put DPLA-compliant flow-down terms in the merchant contract, since 2.9 requires a "binding written agreement… at least as restrictive and protective of Apple".
  - Keep evidence that the merchant owns the brand and content (commercial registration, trademark, store domain), because App Review may demand it under 5.2.1.
- A **single "picker"/marketplace app** (one binary listing all merchants) is the only Apple-sanctioned way to publish many merchants under the platform's own account. It cannot give each merchant its own branded App Store listing, so it is a complementary product, not a substitute.

### Gaps
- No Apple statement was found reconciling DPLA 2.9 with builder practice, or saying which role (Admin vs App Manager vs Developer) satisfies "submitted directly by the provider".
- Plobal Apps, AppMaker, Appy Pie and BuildFire onboarding docs were not retrieved, so their exact current practice is unverified. No search results surfaced Plobal-specific documentation.
- The exact App Store Connect permission matrix (which roles can upload builds or submit for review) did not render in the fetched page. Tapcart's choice of Admin suggests App Manager may not cover API key generation.

---

## 3. Apple organization enrollment requirements (D-U-N-S, legal entity, fee, timelines) and Saudi specifics; individual vs organization

### Takeaway
An organization account requires a legal entity (no DBAs, trade names or branches), a D-U-N-S number, a signatory with binding authority, a working website on the company domain, and a domain email. The fee is 99 USD/yr (local currency where available). The merchant's legal entity name appears as "Seller". Saudi merchants obtain D-U-N-S via D&B's Apple portal using their commercial registration (CR) plus its English translation. Salla reports 7–14 days, while Apple cites up to 5 + 2 business days. Sole proprietors must enroll as individuals and appear under their personal name, which matters for Saudi "مؤسسة فردية" (sole establishment) merchants.

### Cited Findings
- "your organization must be a legal entity so that it can enter into contracts with Apple. We don't accept DBAs, fictitious businesses, trade names, or branches. The legal entity name will appear as the seller for apps you distribute." — [Apple: Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)
- "Your organization must have a D‑U‑N‑S Number so that we can verify your organization's identity and legal entity status… They're free in most jurisdictions. (Not required for government organizations.)" — [Apple: Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)
- The enroller "must be the organization's owner/founder, executive team member, senior project lead, or an employee with legal authority granted to you by a senior employee". Other requirements:
  - The work email must be on the organization's domain.
  - The website "must be publicly available and functional… Links to social media webpages or websites that contain minimal content… won't be accepted".
  - Apple may ask for notarized business documents.
  - Non-owners must provide a reference.

  — [Apple: Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)
- Individuals and sole proprietors: "If you're an individual or sole proprietor/single-person business, your personal legal name will be listed as the seller on the App Store." Sole proprietors must enroll as individuals. — [Apple: Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)
- Fee: "The Apple Developer Program annual fee is 99 USD… in local currency where available. Prices may vary by region." Organizations can purchase only after Apple Developer Support verifies their information. Both account types need an Apple Account with two-factor authentication. — [Apple: Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)
- Apple's D-U-N-S timeline: allow "up to 5 business days to receive your number from D&B, and then up to 2 business days for Apple to receive your information". Expediting does not shorten this. — [Apple: D-U-N-S support page](https://developer.apple.com/support/D-U-N-S/index.html) (via search summary)
- **Saudi process (Salla help center):**
  - Apply at D&B's Apple portal, `support.dnb.com/?CUST=APPLEDEV`.
  - Choose "Developer Program" as user group and "Create New D-U-N-S".
  - "Indicate that your business operates outside the United States".
  - Enter data "exactly as listed on the commercial registration".
  - Match the "official English translation/version issued by the Ministry of Commerce".
  - Upload the original commercial registration, the English version and address documentation.
  - "Processing time typically takes 7 to 14 days."

  — [Salla Help: Global company identifier D-U-N-S](https://help.salla.sa/en/article/global-company-identifier-d-u-n-s-number/ctwmupb60kgolxag4v3i1cjo)
- A Saudi developer asked on Apple Developer Forums how long D-U-N-S takes in KSA. No answer was visible in results. — [Apple Developer Forums thread 854537](https://developer.apple.com/forums/thread/854537)
- Some vendors claim D-U-N-S can take up to 30 business days, which conflicts with Apple's figure. — [Magora Systems (Sep 2026)](https://magora-systems.com/duns-number-apple-developer/)
- Tapcart tells merchants D-U-N-S "can take up to 5 business days to process". — [Tapcart](https://help.tapcart.com/en/articles/14660540-step-4-register-your-developer-accounts)
- Google's developer verification page says D-U-N-S issuance "can take up to 28 days" and warns about third parties charging fees for this free registration. — [Google: Understanding Android developer verification](https://support.google.com/android-developer-console/answer/16561738)

### Inferences
- Realistic onboarding lead time for a Saudi merchant without an existing D-U-N-S is about 2–5 weeks:
  - D-U-N-S: 1–2+ weeks.
  - Apple organization verification: days to weeks, sometimes with a callback or extra documents.
  - Google organization verification.
  - First review.
- Account setup is the critical path, as Tapcart's docs also stress. The platform should offer white-glove D-U-N-S and enrollment assistance in Arabic.
- Many small Saudi merchants operate as a **sole establishment (مؤسسة فردية)** under a CR, which is legally not a separate entity from the owner. Apple's rule that sole proprietors enroll as individuals implies three things for them:
  - The App Store seller line may show the owner's personal legal name.
  - Platform staff cannot be full Developer Program team members, only App Store Connect users.
  - Tapcart- and Vajro-style "organization only" requirements may exclude them.

  Companies (شركة ذات مسؤولية محدودة, LLC) fit the organization path cleanly. Freelancers (وثيقة العمل الحر) and Maroof-only sellers likely have no CR or D-U-N-S path.
- The merchant's website and domain email must be real and functional. A Zid-hosted storefront on the merchant's own domain likely satisfies the website requirement, but a subdomain of the platform or social-media-only presence may not.
- **Arabic store listings:** each merchant app should ship full Arabic (and ideally English) metadata, screenshots and an Arabic privacy policy URL. Unique localized metadata also helps with 4.3 and Google's repetitive-content rules.

### Gaps
- No primary source confirms whether Apple accepts a Saudi "مؤسسة فردية" holding a CR and D-U-N-S as an organization, or forces individual enrollment.
- No Saudi-specific Apple pricing in SAR or Saudi-specific verification timelines were found.
- No primary source covering Arabic App Store metadata requirements was retrieved. Arabic listing guidance above is inference.

---

## 4. Google Play: white-label guidance, verification, fees, testing rule, Android developer verification, associated-account risk

### Takeaway
Google explicitly advises white-label developers to use a **decentralized** model, one developer account per client, and to make "very limited use" of a centralized account, because a violation in one app can take down every app. Organization accounts need D-U-N-S and pay a one-time 25 USD fee. The 12-tester / 14-day closed test applies to **personal** accounts created after 13 Nov 2023, so merchants should open organization accounts. Android developer verification became enforceable on 30 Sep 2026 in the first four countries, with global rollout in 2027. Play-distributed apps were auto-registered, but stragglers had to be registered or be removed. Google terminates "related accounts", so linkage risk is real.

### Cited Findings
**White-label guidance:**
- Google's "Best Practices for White Label Developers" (announced 10 Feb 2025):
  - Decentralized model: "Each client (or group of clients) has a separate developer account."
  - Centralized model: "All apps are managed under a single developer account."
  - "We strongly recommend that white-label app developers use the decentralized account management approach." / "We advise very limited use of the centralized model."
  - Under the centralized model, "Policy violations on a single account can lead to the removal of all associated apps."
  - The decentralized model "Enables your clients to manage their own apps AND publish apps under their own unique developer name".
  - In the managed sub-model, "The white-label developer retains administrative access and oversees the client's accounts."

  — [Google Play Console Help: Best Practices for White Label Developers](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en); [Announcement, 10 Feb 2025](https://support.google.com/googleplay/android-developer/answer/15931448?hl=en)
- The same article says "Ensure store listings are unique… Each app – even if it is a branded template app – should have its own compelling store listing." Listed violations include "Using the exact same descriptions for multiple apps" and "Using the same store listing screenshots for multiple apps". The goal is "preventing a sea of identical looking apps". Further guidance:
  - Include "an active demo account, login credentials".
  - Consider a code freeze during review and Managed Publishing.
  - "Reviews are typically completed within 7 days".
  - "repeated or severe policy violations can result in an account ban, removing all associated apps and preventing future submissions."

  — [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en)
- The Spam policy says: "We don't allow apps that merely provide the same experience as other apps already on Google Play." It gives the example "Creating multiple apps with highly similar functionality, content, and user experience". It also bans apps whose primary purpose is "to drive affiliate traffic to a website or provide a webview of a website" without the site owner's permission. — [Google Play Spam policy](https://support.google.com/googleplay/android-developer/answer/9899034?hl=en)

**Account types, verification and fee:**
- "Choose an organization account if you're creating an account for an organization or business… To create a developer account for an organization, you must provide a D-U-N-S number… Google Play uses this mandatory requirement to verify your organization's identity." Personal accounts are for "students, hobbyists, and amateur developers". — [Google: Choose a developer account type](https://support.google.com/googleplay/android-developer/answer/13634885?hl=en)
- The registration fee is 25 USD one-time. — [Tapcart](https://help.tapcart.com/en/articles/14660540-step-4-register-your-developer-accounts); [Google: Understanding Android developer verification](https://support.google.com/android-developer-console/answer/16561738)

**Testing requirement:**
- Personal accounts created after 13 Nov 2023 must "run a closed test for their app with a minimum of 12 testers who have been opted in continuously for at least 14 days", then "Apply for production". Production-access review usually takes about 7 days. — [Google Play Console Help: App testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- The tester count was reportedly cut from 20 to 12 around 11 Dec 2024. Third parties state that organization accounts (D-U-N-S verified) are exempt; Google's page itself speaks only of personal accounts. One 2026 guide claims engagement checks were added, which is unverified. — [Testers Community](https://www.testerscommunity.com/google-play-production-access-12-testers); [Choicely](https://www.choicely.com/blog/google-play-12-tester-rule); [ExtendsClass 2026](https://extendsclass.com/blog/google-plays-closed-testing-requirement-what-developers-need-to-know-in-2026)

**Android developer verification (2025–2026):**
- Verified developers must register apps distributed to certified Android devices. Enforcement started 30 Sep 2026 in the first countries, and "Verification capability will be expanded globally for all apps on certified Android devices in 2027." Full-distribution accounts pay a 25 USD fee, and organization verification needs D-U-N-S. — [Google: Understanding Android developer verification](https://support.google.com/android-developer-console/answer/16561738)
- The first countries are Brazil, Indonesia, Singapore and Thailand. Google's own page text, as fetched, listed only three of the "four countries", omitting Brazil. Unregistered apps can still be installed via adb or an "advanced flow". — [Help Net Security](https://www.helpnetsecurity.com/?p=375237); [Android Authority timeline](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/)
- Google auto-registered most Play package names; the cited figure is ~98–99%. New apps created in Play Console are auto-registered and linked to the account. Per Play help, "all Play packages must be registered" by 30 Sep 2026, and unregistered apps "will be removed from Play". — [Android Developers: Register on Google Play Console](https://developer.android.com/developer-verification/guides/google-play-console); [Play Console Help 16761053](https://support.google.com/googleplay/android-developer/answer/16761053)
- No Saudi-specific rollout date was found. KSA falls under the 2027 global expansion. — [Help Net Security](https://www.helpnetsecurity.com/?p=375237)

**Associated-account risk:**
- When an account is terminated, "related accounts" are also closed, and new registrations are closed without a fee refund. — [Google: Why do accounts get terminated?](https://support.google.com/googleplay/android-developer/answer/2491922?hl=en); [Play Console Help 9899234](https://support.google.com/googleplay/android-developer/answer/9899234?hl=en)
- Developers report terminations citing "strong indications" of relation to previously terminated accounts. Google does not disclose the linking signals. These are anecdotal reports. — [Habr Q&A](https://qna.habr.com/q/1291118); [r/androiddev thread](https://redlib.hbubli.cc/r/androiddev/comments/1529mu3/google_play_app_termination_without_explanation)

### Inferences
- Merchants should open **organization** Play accounts with D-U-N-S, using the same D-U-N-S as Apple. This avoids the personal-account 12-tester/14-day gate and gets a business developer name.
- The platform should be invited as a user with app-level admin or release permissions, and should use a Google Cloud service account linked to the merchant's Play account for the Publishing API.
- Shared platform users and service accounts across hundreds of merchant accounts create a technical "association" footprint. Because Google closes "related accounts", one bad merchant could in principle taint others. Mitigations:
  - Vet merchants (no prohibited goods).
  - Run quality and policy QA before each release.
  - Use separate service accounts per merchant.
  - Avoid identical listings.
  - Monitor policy status centrally.
- If the platform published under one centralized account, any single violation would endanger every merchant's app. Google advises against it, and it is effectively impossible on iOS anyway.
- A Play-only shopping app needs no extra Android developer verification work beyond normal Play Console identity verification. Any sideloaded or alternative-store distribution would need registration.

### Gaps
- Google's page did not explicitly state that organization accounts are exempt from the closed-testing rule. That is inferred from its "personal accounts" scope and third-party sources.
- No official Google statement on how shared users or service accounts across client accounts affect "related account" determinations was found.
- The exact roles Google recommends granting the white-label developer were not specified beyond "administrative access".

---

## 5. Rejection risk patterns: real 4.2.6 / 4.3 / 5.2.1 cases and what differentiation Apple expects

### Takeaway
Three rejection families recur:
- **5.2.1/4.2.6 ownership:** "not directly submitted by the owner". This is fixed by submitting from the merchant's own account or providing government business-registration proof.
- **4.3(a) spam:** "similar binary, metadata, and/or concept as apps submitted… by other developers, with only minor differences". This can hit even when each client has its own account.
- **4.2 minimum functionality** for thin web wrappers.

Apple publishes no objective differentiation threshold. Many near-identical template apps from the same platform are live, so outcomes are inconsistent and reviewer-dependent.

### Cited Findings
- **4.3(a) on separate client accounts (July 2024):** A developer submitted several white-label apps that differed only in logo, name and configuration, each from the client's own account. All were rejected with: "Guideline 4.3(a) - Design - Spam. We noticed your app shares a similar binary, metadata, and/or concept as apps submitted to the App Store by other developers, with only minor differences. Submitting similar or repackaged apps is a form of spam that creates clutter and makes it difficult for users to discover new apps." Apple staff replied only that they were investigating, and no resolution was posted. — [Apple Developer Forums thread 759119](https://developer.apple.com/forums/thread/759119)
- **5.2.1 ownership rejection:** see the verbatim text in section 2. The remedy is the owner's own account or government business-registration documents, and "documentation of your rights to include third-party content… is not sufficient". — [Forum thread 727183](https://developer.apple.com/forums/thread/727183)
- **Client account alone is not always enough:** in a 2019-era report, a radio-app builder said Apple kept rejecting after clients used their own accounts and clicked submit themselves. Apple reportedly asked for proof of content ownership. — [Forum thread 114866 (via search summary)](https://developer.apple.com/forums/thread/114866)
- **Same-source-code apps owned by different people:** one was hit under 4.3(a) on an update despite distinct names, colors and user bases. Apple's spam message lists factors such as submitting an app with the same source code as other apps and submitting similar apps across multiple accounts. — [Forum thread 825522](https://developer.apple.com/forums/thread/825522); [Forum thread 771798](https://developer.apple.com/forums/thread/771798) (via search summary)
- **Counter-evidence that template apps pass:** a Dec 2023 thread lists many live apps (ADM Farmview, Valero Cornnow, Scoular View, Graincraft Grower Connect, etc.) built on the same "Bushel platform", with "identical screenshots, descriptions, and version numbers". Each sits under its own company account. — [Forum thread 743316](https://developer.apple.com/forums/thread/743316)
- **No official answer on differentiation:** an Aug 2026 thread asked Apple what makes per-client builds "sufficiently distinct" under 4.3 and which model applies to a B2B SaaS. No Apple staff answered. — [Forum thread 840982](https://developer.apple.com/forums/thread/840982)
- Whether private distribution via Apple Business Manager Custom Apps avoids 4.3 also remains unanswered publicly. — [Apple Community thread 256311446](https://discussions.apple.com/thread/256311446)
- 4.2.6 itself says builders "should offer tools that let their clients create customized, innovative apps that provide unique customer experiences". — [Apple](https://developer.apple.com/app-store/review/guidelines/). GoodBarber's reading, from talking with Apple: "The application must have real added value for App Store users" and must meet 4.2. — [GoodBarber](https://www.goodbarber.com/blog/app-store-4-2-6-rule-and-app-builders-a885/)
- Vendors note that "Apple refuses to give specific guidance on what will be rejected or accepted", and that even custom apps can be rejected under 4.2.6 if they reuse blocks of code. These are vendor claims. — [Shoutem](https://shoutem.com/?p=12973)

### Inferences
- Rejections cluster on **identity** (who submits, who owns the brand) and **sameness** (binary, metadata, screenshots). The platform's differentiation levers:
  - Each merchant's own catalog and content, visible in the review build.
  - Merchant-specific branding, layout and home-screen composition from the builder.
  - Unique Arabic/English name, subtitle, description, keywords and screenshots.
  - Merchant-specific features where possible: loyalty, store locator, local delivery, Arabic-first content.
  - A working demo login and real products.
  - Clear App Review notes stating the merchant owns the business, with the CR attached if challenged.
- For 4.3(a) rejections, the usual paths are:
  - Reply in App Store Connect explaining that each app is a distinct retailer's storefront, submitted by that retailer under its own account, with its own catalog and customers.
  - Attach CR and trademark evidence.
  - Escalate via an App Review Board appeal.
- Seeing the same 4.3(a) message repeatedly across merchants signals that the template needs more per-merchant variability.
- The June 2026 4.3(b) language adds post-approval removal risk for stale, low-engagement merchant apps.

### Gaps
- No Reddit thread, Medium post or forum report documenting a 2024–2026 rejection specifically of a Tapcart, Plobal, Vajro, Shopney or MobiLoud e-commerce app was found. The cited cases are generic white-label cases.
- No published rejection rates for e-commerce app builders were found.
- Resolutions of the cited 4.3(a) threads are not public.

---

## 6. Automation: building and submitting via App Store Connect API and Google Play Developer API with merchant credentials (fastlane, Codemagic, Bitrise)

### Takeaway
Automating builds and uploads with API keys is standard and is exactly how Tapcart and Vajro operate: merchants hand over the Issuer ID, Key ID and .p8 file. Apple's key model allows it. Team keys need Admin or Account Holder, can be generated with a role, and apply across all apps in the account. Individual keys can be generated by an invited user, including Admin, App Manager or Developer. The policy risks are about Apple-ID credential sharing (forbidden), the DPLA 2.9 "service provider submission" sentence, and security of keys held at scale. API automation itself is not the issue.

### Cited Findings
- "To get started, the Account Holder must request access to the API in App Store Connect." Team API keys require the "Account Holder or Admin" role. "Under Access, select the role permissions to determine what the API can be used for." "Team API keys are applied across all apps, so app access can't be limited for an API key." — [App Store Connect Help: App Store Connect API](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/)
- Individual API keys can be generated by "Account Holder, Admin, App Manager, Customer Support, Developer, or Marketing". "All App Store Connect users can generate and revoke API keys for individual use by default, unless an Admin or Account Holder has revoked this ability." "Each user can only have one active API key at a time." — [App Store Connect Help](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/)
- "API keys are private and can only be downloaded once… Revoke a key immediately if it becomes lost or compromised." Access level can't be edited after creation. Revoked keys can't be reinstated. — [App Store Connect Help](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api/)
- **Tapcart** requires merchants to create an App Store Connect API key "for iOS Builds", which "Tapcart requires to automate your iOS builds" and which needs Admin or Account Holder permissions. — [Tapcart](https://help.tapcart.com/en/articles/14660540-step-4-register-your-developer-accounts); [Tapcart invite article](https://help.tapcart.com/en/articles/13798875-inviting-tapcart-to-your-apple-developer-account)
- **Vajro** collects Issuer ID, API Key ID, the .p8 file and Vendor ID, then has the merchant click "Validate Setup". — [Vajro](https://docs.vajro.com/en/articles/12504715-how-to-set-up-your-apple-developer-account-with-vajro)
- DPLA 2.1 forbids soliciting members' "Apple Accounts, authentication credentials, and/or related account information and materials (e.g., Apple Certificates used for distribution or submission to the App Store or TestFlight)". DPLA 2.9 says a developer "may not use a Service Provider to submit an Application to the App Store or use TestFlight on Your behalf", while 1.2 permits contractors added to the team. — [Apple DPLA](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/)
- RuntimeWire (Oct 2026, flagged as unverified tip): "Automating code and builds, or using a customer's account, does not guarantee approval." — [RuntimeWire](https://runtimewire.com/article/apple-guideline-426-app-generation-submission)
- For Play, the white-label article notes that "The white-label developer retains administrative access" in managed decentralized accounts and recommends Managed Publishing for controlling release timing. — [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/15884185?hl=en)

### Inferences
- **Recommended iOS pattern:**
  - The merchant (Account Holder) invites a platform-controlled Apple Account into their team as Admin. Admin is needed to create distribution certificates and profiles and team keys; App Manager may suffice for upload and submit.
  - Either the merchant generates a **team key** scoped to App Manager rather than Admin, or the platform's invited user generates its own **individual key** inside the merchant's team. The individual-key route keeps the merchant from handling .p8 files and leaves a per-user audit trail.
  - CI (fastlane `app_store_connect_api_key` with Codemagic, Bitrise or self-hosted macOS) then builds the Flutter app, signs with the merchant's distribution certificate, uploads to TestFlight and App Store Connect, and pushes metadata.
  - Never store or use merchant Apple ID passwords. Never share one distribution certificate across merchants.
- **Recommended Android pattern:**
  - The merchant invites the platform's Google account with release-level permissions.
  - The merchant links a per-merchant Google Cloud service account for the Google Play Developer API (fastlane `supply`).
  - App signing is managed by Play App Signing, with a separate upload key per merchant.
- **Governance:**
  - Keep keys in a secrets vault with per-merchant isolation and rotation.
  - Have merchants explicitly approve each submission in the dashboard, which supports the "submitted by the content provider" narrative.
  - Use contract terms that flow down Apple and Google obligations (DPLA 2.9 written-agreement requirement).
  - Run an offboarding procedure: revoke keys and remove users. If a merchant leaves, the app stays theirs, which is a selling point, but the platform must also be able to hand over or retire builds.
- Team keys "apply across all apps" in the merchant's account. Merchants with other apps in the same account are granting broader access than needed, so a per-user individual key or a dedicated account is preferable.

### Gaps
- No explicit Apple or Google statement was found that a third-party SaaS holding many merchants' API keys is permitted or prohibited. The practice is inferred to be tolerated from the public onboarding docs of Tapcart, Vajro and Shopney.
- Codemagic and Bitrise documentation on white-label pipelines was not retrieved. Their suitability is inferred from general knowledge of their fastlane and App Store Connect API support, not verified here.
- The precise App Store Connect role needed to upload builds versus submit for review was not confirmed from Apple's permission matrix, which did not render in fetch.
