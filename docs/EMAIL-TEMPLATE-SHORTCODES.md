# Email template shortcodes

Editable email HTML lives in **Admin → Email**. You do not need to be a developer: type `{{likeThis}}` in the template body, and Meridian replaces it when the email is sent or previewed.

Where to edit:

- **Email → Mailing Lists** — welcome, weekly digest, weather alerts
- **Email → Auth Emails** — admin invite / welcome / password emails
- **Email → Admin Emails** — contact, DPO, complaint, and support replies

Some tokens (such as `{{logoUrl}}`, `{{appUrl}}`, `{{brandName}}`, `{{brandDomain}}`, `{{brandTagline}}`) are always filled in at send time even if they do not appear in the admin “chips” list for that template. Prefer the prebuilt HTML blocks (`{{locationsHtml}}`, `{{currentCardHtml}}`, `{{dailyForecastHtml}}`) when you want a full weather layout without assembling every field yourself.

## Branded layout (v2)

Every default template shares the Meridian shell:

1. **Black header** with `{{logoUrl}}` (`/brand/logo-on-dark.png`)
2. **Accent bar + eyebrow** unique per alert type or email reason
3. **Image band** — location `{{heroImageUrl}}` on weather alerts; atmospheric brand image on welcome / digest / auth / admin replies
4. **Body** — shortcode-driven copy
5. **Dark footer** — brand tagline; `{{unsubscribeUrl}}` on mailing alerts/digest/welcome; app link on auth/admin

Defaults are built from `src/constants/email-template-themes.js` and `src/lib/email-templates/branded-email-layout.js`. Stored rows without the `<!-- meridian-email-layout:2 -->` marker are upgraded to the new defaults on seed/send.

## Syntax

| Pattern | Behaviour |
| --- | --- |
| `{{variableName}}` | Replaced at send (and in admin preview). |
| Unknown `{{token}}` | Left unchanged in the output. |
| Keys ending in `Html` | Injected as raw HTML (not escaped). Example: `{{currentCardHtml}}`. |
| All other keys | HTML-escaped automatically. |

Whitespace inside braces is allowed: `{{ cityName }}` works the same as `{{cityName}}`.

Only `[a-zA-Z0-9_]` characters are valid in names (no dots or hyphens).

---

## Welcome (`welcome`)

Sent on platform newsletter signup.

| Shortcode | Example | Notes |
| --- | --- | --- |
| `{{email}}` | `you@example.com` | Subscriber address |
| `{{unsubscribeUrl}}` | `https://…/api/unsubscribe?token=…` | Opt out of newsletter |
| `{{logoUrl}}` | `https://…/brand/logo-on-dark.png` | Header logo |
| `{{appUrl}}` | `https://meridianweather.co.uk` | Public origin |

---

## Weekly digest (`weekly-digest`)

One email per address covering all subscribed digest locations.

| Shortcode | Example | Notes |
| --- | --- | --- |
| `{{locationCount}}` | `2` | Number of locations in this send |
| `{{locationNames}}` | `Manchester, Dubai` | Comma-separated city names |
| `{{locationsHtml}}` | *(HTML block)* | Prebuilt per-city sections (includes stop-digest links). **Use as HTML.** |
| `{{unsubscribeUrl}}` | `https://…/api/unsubscribe?token=…` | First location’s unsubscribe URL |
| `{{logoUrl}}` / `{{appUrl}}` | | Brand header / footer |
| `{{cityName}}` | `Manchester` | First location only (legacy helper) |
| `{{temperature}}` | `14°C` | First location, formatted °C |
| `{{condition}}` | `Partly cloudy` | First location |
| `{{humidity}}` | `62` | First location, percent number |
| `{{windSpeed}}` | `4.2` | First location only; value is **m/s** (legacy — prefer `{{locationsHtml}}`) |

---

## Weather alerts (`weather-alert` and `weather-alert-{alertTypeId}`)

Per-type slugs, e.g. `weather-alert-rain`, `weather-alert-tornado_warning`.  
Each type has a **unique eyebrow, accent colour, and lead sentence** in the default HTML (still driven by the shortcodes below). Cron resolves `weather-alert-{id}` first, then falls back to `weather-alert`.

### Alert identity

| Shortcode | Example | Notes |
| --- | --- | --- |
| `{{cityName}}` | `Manchester` | Subscribed location name |
| `{{alertLabel}}` | `Rain` | Human label for the alert type |
| `{{alertTypeId}}` | `rain` | Stable id (`rain`, `tornado_warning`, …) |
| `{{alertSource}}` | `openweather` | `openweather`, `open-meteo`, or `nws` |
| `{{matchLabel}}` | `light rain` | Specific match text from the evaluator / feed |
| `{{condition}}` | `Rain: light rain` | Combined `{{alertLabel}}: {{matchLabel}}` (legacy) |
| `{{unsubscribeUrl}}` | `https://…/api/unsubscribe?token=…` | Deactivates the **whole** location alert subscription |
| `{{logoUrl}}` / `{{appUrl}}` | | Brand header / footer |
| `{{heroImageUrl}}` | | Location hero (landscape) |
| `{{heroImageCredit}}` | `Photo: …` | Photographer credit under hero |

### Current conditions

| Shortcode | Example | Notes |
| --- | --- | --- |
| `{{temperature}}` | `14°C` | Rounded display (°C) |
| `{{temperatureC}}` | `14.2` | Raw Celsius number as string |
| `{{feelsLike}}` | `12°C` | Feels-like, formatted with unit |
| `{{description}}` | `Light rain` | Long description |
| `{{weatherCondition}}` | `Rain` | Short OpenWeather main group |
| `{{humidity}}` | `82` | Percent (no `%` suffix) |
| `{{pressure}}` | `1013` | hPa |
| `{{dewPoint}}` | `9°C` | Dew point with unit |
| `{{visibilityKm}}` | `10` | km |
| `{{clouds}}` | `75` | Percent |
| `{{windSpeedKmh}}` | `15` | km/h |
| `{{windGustKmh}}` | `28` | km/h |
| `{{windDeg}}` | `220` | Degrees |
| `{{windDirection}}` | `SW` | Compass label |
| `{{rain1h}}` / `{{snow1h}}` | `0.4` | mm |
| `{{pop}}` | `40` | Probability of precipitation |
| `{{sunrise}}` / `{{sunset}}` | | Local times |
| `{{lat}}` / `{{lon}}` / `{{country}}` / `{{timezone}}` | | Location metadata |
| `{{updatedAt}}` | | Reading timestamp |
| `{{weatherId}}` / `{{iconCode}}` / `{{iconName}}` | | OpenWeather ids / codes |
| `{{uvi}}` | `3` | UV index |
| `{{iconUrlPng}}` | CDN PNG | Prefer over SVG for email clients |
| `{{iconUrl}}` | | Hosted Meteocons when available |
| `{{currentCardHtml}}` | *(HTML)* | Prebuilt current-conditions card. **Raw HTML.** |
| `{{dailyForecastHtml}}` | *(HTML)* | Prebuilt 10-day table. **Raw HTML.** Prefer over per-day tokens. |

Per-day tokens `{{day1Date}}`, `{{day1Condition}}`, `{{day1High}}`, `{{day1Low}}` … `{{day10Low}}` still interpolate when present; prefer `{{dailyForecastHtml}}`.

Canonical list: `WEATHER_ALERT_EMAIL_VARIABLES` in `src/lib/email-templates/build-weather-email-vars.js`.

---

## Auth emails

Editable under **Email → Auth Emails**. Slugs: `admin-invite`, `admin-welcome`, `admin-forgot-password`, `admin-password-changed`. Shared brand header; distinct accent/eyebrow/CTA per template.

| Shortcode | Used in | Notes |
| --- | --- | --- |
| `{{email}}` | all | Account email |
| `{{displayName}}` | all | Display name |
| `{{inviteUrl}}` | invite | Accept link |
| `{{resetUrl}}` | forgot password | Reset link |
| `{{expiresAt}}` | invite, forgot | Human expiry |
| `{{invitedBy}}` | invite | Inviter name |
| `{{logoUrl}}` / `{{appUrl}}` | all | Brand |

---

## Admin reply emails

Editable under **Email → Admin Emails**. Slugs: `admin-reply-contact`, `admin-reply-dpo`, `admin-reply-complaint`, `admin-reply-support`. Compose & send fills these at send time.

| Shortcode | Example | Notes |
| --- | --- | --- |
| `{{recipientName}}` | `Sam Neighbor` | To name |
| `{{recipientEmail}}` | `sam@example.com` | To address |
| `{{subject}}` | `Re: Your message` | Subject line (also used as template subject token) |
| `{{messageHtml}}` | *(HTML)* | Free-form reply body. **Raw HTML.** |
| `{{adminName}}` | `Alex Admin` | Sending admin |
| `{{appUrl}}` / `{{logoUrl}}` | | Brand footer / header |

---

## Admin preview

Mailing Lists template preview uses sample Manchester values for every weather-alert shortcode (including a sample 10-day table and landmark hero), so you can design offline without waiting for a live alert send.

Auth and Admin Emails previews include `logoUrl` / `appUrl` so the branded header renders in the iframe.

**Reset to default** restores the seeded v2 branded HTML. Rows missing the layout v2 marker are auto-upgraded on seed/send.

---

## Implementation pointers

| Concern | Path |
| --- | --- |
| Themes (accents / eyebrows / leads) | `src/constants/email-template-themes.js` |
| Branded HTML shell builders | `src/lib/email-templates/branded-email-layout.js` |
| Brand vars (`logoUrl`, `appUrl`) | `src/lib/email-templates/build-email-brand-vars.js` |
| Interpolation rules | `src/lib/email-templates/render-email-template.js` |
| Alert var builder + cards / forecast / hero | `src/lib/email-templates/build-weather-email-vars.js` |
| Layout upgrade + seed | `src/lib/email-templates/email-template-repo.js` |
| Send path | `src/lib/email.jsx` |
| Defaults / variable lists | `src/constants/email-templates.js` |
| Cron (current + daily scopes) | `src/app/api/cron/weather-alerts/route.js` |
