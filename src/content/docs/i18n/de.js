/** German documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'Erste Schritte',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Überblick',
        body:
          'meridian ist ein Wetter-Dashboard für mehrere Städte. Sie suchen Orte, heften bis zu zehn Städte in Ihrem Browser an und verfolgen aktuelle Bedingungen, Kurzprognosen und optionale E-Mail-Updates. Kein Konto erforderlich — alle Städtelisten und Einstellungen werden pro Gerät in localStorage gespeichert.',
      },
      {
        id: 'requirements',
        title: 'Voraussetzungen',
        body:
          'Das Dashboard benötigt einen serverseitigen OpenWeather-API-Schlüssel (OPENWEATHER_API_KEY). Ohne ihn schlagen Wetter- und Geocode-Anfragen fehl. E-Mail-Abonnements, Cron-Jobs und AdSense sind optional und werden nur aktiv, wenn die zugehörigen Umgebungsvariablen / Connectors konfiguriert sind. SQLite (better-sqlite3) läuft immer für Cache und Quota.',
      },
      {
        id: 'add-city',
        title: 'Stadt anheften',
        body:
          'Nutzen Sie das Suchfeld im Hero der Startseite oder in der Kopfzeile. Tippen Sie mindestens zwei Zeichen; Ergebnisse erscheinen nach einem Debounce von 300 ms. Wählen Sie ein Geocode-Ergebnis, um die Stadt-Detailseite zu öffnen. Nutzen Sie An Ihre Orte anheften auf dieser Seite, um die Stadt unter Ihre Orte zu speichern. Duplikate werden abgelehnt. Jede Stadt erhält eine stabile ID: {slugified-name}-{country}-{latitude to four decimals}, verwendet in URLs wie /city/london-gb-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'Stadtlimit',
        body:
          'Sie können bis zu zehn Städte anheften (MAX_SAVED_CITIES). Ist das Limit erreicht, heften Sie eine weitere Stadt erst an, nachdem Sie eine aus Ihrem Raster entfernt haben.',
      },
      {
        id: 'first-visit',
        title: 'Erster Besuch: Cookies und Theme',
        body:
          'Beim ersten Besuch erklärt ein Cookie-Banner die lokale Speicherung. Schaltflächen: Alle akzeptieren (funktional + Werbung), Funktional akzeptieren, Nur essenziell und Einstellungen verwalten. Cookie-Einstellungen öffnen Sie jederzeit über die schwebende Einstellungssteuerung (Tab Cookies). Der schwebende Theme-Schalter wechselt zwischen Hell- und Dunkelmodus (gespeichert in meridian:theme).',
      },
      {
        id: 'navigation',
        title: 'Weiterlesen',
        body:
          'Dashboard erklärt das Layout der Startseite. City detail behandelt vollständige Prognoseseiten. Forecasts & cache erläutert TTLs und Cache-Schichten. Subscriptions deckt E-Mail ab. API limits und API reference dokumentieren das Serververhalten. Dokumentation ist auch unter docs.localhost:3000 erreichbar, wenn Sie lokal entwickeln (Middleware-Rewrite). CMS-bearbeitete Docs können abweichen, bis sie auf Datei-Defaults zurückgesetzt werden.',
      },
      {
        id: 'verify',
        title: 'Für Entwickler',
        body:
          'Führen Sie npm run verify für Lint, Test und Build aus. Starten Sie npm run dev und öffnen Sie localhost:3000. Optional: Melden Sie sich unter /login an und öffnen Sie /admin für Nutzungsdiagnostik und Plattformeinstellungen (Dev-Bypass kann greifen, wenn ADMIN_SECRET in der Entwicklung nicht gesetzt ist).',
      },
    ],
  },
  {
    slug: 'dashboard',
    title: 'Dashboard',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'layout',
        title: 'Seitenlayout',
        body:
          'Die Startseite ist in Bänder gegliedert: (1) Hero — Produktvorstellung, Standort-Wettercheck und eine quadratische Hero-Anzeige. (2) Kürzliche Checks — zwei Spalten („In Ihrer Nähe“ und „Beliebte Suchen“). (3) Ihre Orte — Wetterkarten für angeheftete Städte. (4) Dashboard-Anzeigen-Platzhalter/-Unit. (5) Journal — sechs Blog-Artikelkarten in einem links/rechts-Karussell mit Links zu `/journal/[slug]`-Beiträgen.',
      },
      {
        id: 'cards',
        title: 'Wetterkarten',
        body:
          'Jede Karte zeigt Stadtname, Region/Land, aktuelle Temperatur, Bedingungsbeschreibung, Meteocons-Wettericon, gefühlte Temperatur, Luftfeuchtigkeit und Wind. Karten verlinken zur Stadt-Detailseite. Beim Hover wird die Detailroute und Wetterdaten vorab geladen.',
      },
      {
        id: 'forecast-strip',
        title: 'Sieben-Tage-Mini-Prognose',
        body:
          'Unter der Hauptanzeige zeigt jede Karte eine Sieben-Tage-Aussicht (Tageslabel, Icon, Min/Max). Current- und Daily-Scopes werden zusammen in einer Dashboard-Batch-Anfrage geladen — es gibt keinen separaten idleCallback-Daily-Fetch. Der Streifen zeigt Tageslabel, Icon und Min/Max-Temperaturbereich.',
      },
      {
        id: 'card-actions',
        title: 'Kartenaktionen',
        body:
          'Abonnieren öffnet ein Modal für wöchentlichen Digest und Wetterwarnungs-E-Mails für diese Stadt. Entfernen (X) löscht die Stadt aus localStorage und leert den Browser-Wettercache. Bei aktiven E-Mail-Abonnements für diese Stadt bietet ein Dialog an, vor dem Entfernen abzumelden.',
      },
      {
        id: 'states',
        title: 'Lade- und Fehlerzustände',
        body:
          'Während Wetterdaten laden, wird eine Skelettkarte angezeigt. Bei Upstream-Fehler zeigt die Karte eine Fehlermeldung mit Aktionen Wiederholen und Entfernen. Ein leeres Raster zeigt Hinweise, die erste Stadt über die Stadt-Detailseite zu suchen und anzuheften.',
      },
      {
        id: 'refresh',
        title: 'Aktualisierungsverhalten',
        body:
          'Standardmäßig nutzt Ihre Orte manuelle Aktualisierung (`meridian:weather-refresh-mode`): Das Dashboard zeigt beim Seitenaufruf die zuletzt in diesem Browser gespeicherte Messung und holt Daten nur, wenn Sie auf einer Karte Aktualisieren tippen (oder wenn eine Stadt noch keinen lokalen Cache hat). Es gibt kein Einstellungen → Wetter-Panel in der aktuellen UI; der Schlüssel existiert für programmatische / zukünftige Nutzung. Daten werden auch serverseitig gecacht (Speicher + SQLite). Siehe Forecasts & cache für TTL-Details.',
      },
      {
        id: 'recent-checks',
        title: 'Kürzliche Checks',
        body:
          'Zwei Spalten zeigen jeweils bis zu fünf Karten von GET /api/recent-checks (beliebte Suchen aus location_weather_checks, API-Limit 20, source popular|empty). Karten verlinken zur Stadt-Detailseite, wenn Koordinaten vorhanden sind. npm run seed:checks füllt nur weather_snapshots — es befüllt diesen Streifen nicht. Siehe Recent checks & seeding.',
      },
    ],
  },
  {
    slug: 'city-detail',
    title: 'Stadt-Detail',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'access',
        title: 'Wer eine Stadtseite sehen kann',
        body:
          'Stadt-Detailseiten liegen unter /city/[cityId]. resolveCity() liefert immer die fünf PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney). Jede Ortszeile mit city_slug wird ebenfalls aufgelöst. Geparste IDs der Form {name}-{country}-{lat} passen, wenn lat/country in SQLite existieren. Unbekannte oder fehlerhafte Slugs liefern 404. Sie müssen eine Stadt nicht anheften, um ihre Seite zu öffnen.',
      },
      {
        id: 'tabs',
        title: 'Prognose-Tabs',
        body:
          'Sticky-Tabs: Heute, Stündlich, 10 Tage und Verlauf. Deep-Link mit ?tab=hourly, ?tab=daily oder ?tab=history. Legacy ?tab=next-hour leitet zu Heute um. Bis zu drei OpenWeather-Warnbanner erscheinen über dem Hero, wenn alertIds vorhanden sind. Ein city-detail AdSlot sitzt direkt unter den Tabs.',
      },
      {
        id: 'header',
        title: 'Seitenkopf und Hero',
        body:
          'Standardmäßig nutzt der Kopf eine OSM-Satellitenkarten-Hintergrund, wenn isCityHeroOsmEnabled() true ist (NEXT_PUBLIC_CITY_HERO_OSM nicht gesetzt oder nicht "0"). Setzen Sie NEXT_PUBLIC_CITY_HERO_OSM=0, um Fotos zu bevorzugen. Foto-Modus kaskadiert Unsplash → Wikimedia Commons → Pexels über getHeroImageForRegion, mit statischen SVG-Fallbacks bei fehlenden Schlüsseln. Optionales Google Street View greift, wenn OSM aus ist und NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1.',
      },
      {
        id: 'today',
        title: 'Tab Heute',
        body:
          'Hero mit aktuellen Bedingungen, Metrik-Kacheln mit Meteocon-Icons und Akkordeons Aktuelle Bedingungen / Standort / Sonnenzeiten. Stündliche Vorschau für den Rest des Tages, wenn stündliche Daten verfügbar sind.',
      },
      {
        id: 'hourly',
        title: 'Tab Stündlich',
        body:
          'Kartenliste für die nächsten 12 Stunden (eine Spalte) mit naher Temperatur, Niederschlagswahrscheinlichkeit und Wind.',
      },
      {
        id: 'daily',
        title: 'Tab 10 Tage',
        body:
          'Tagesaussicht-Liste (bis zu zehn Tage): Wochentag, Icon, Beschreibung/Zusammenfassung, Min/Max, Regenwahrscheinlichkeit, Wind, UV. Tagauswahl öffnet das Metrik-Diagramm für dieses Datum.',
      },
      {
        id: 'history',
        title: 'Tab Verlauf',
        body:
          'Vergangene Tage aus gespeicherten Beobachtungen und archivierten Prognosen via GET /api/weather/history, mit Tagesauswahl und Diagramm.',
      },
      {
        id: 'alerts',
        title: 'Wetterwarnungen',
        body:
          'Wenn OpenWeather Warnungen liefert, zeigt AlertBanner höchstens drei über dem Hero. Vollständiger Warnungstext ist via GET /api/alerts/[alertId] verfügbar.',
      },
      {
        id: 'data',
        title: 'Datenladen',
        body:
          'SSR hydratisiert current, daily und hourly, wenn verfügbar von getCityWeatherForSeo. Der Client-Hook useCityWeather batch-fetcht DETAIL_SCOPES = [current, hourly, daily] via POST /api/weather/batch — minutely wird nicht angefragt. Premium / MinutelyPrecipStrip ist nicht angebunden.',
      },
      {
        id: 'subscribe',
        title: 'Anheften und abonnieren',
        body:
          'Das Optionsmenü im Kopf bietet An Ihre Orte anheften und Abonnieren (wöchentlicher Digest + Wetterwarnungen) — dieselben Abläufe wie Dashboard-Karten. Anheften speichert in meridian:saved-cities; Abonnieren öffnet SubscribeDialog.',
      },
      {
        id: 'prefetch',
        title: 'Prefetch',
        body:
          'Beim Hover über eine Dashboard-Wetterkarte werden /city/[cityId] vorab geladen und der L0-Cache via prefetchCityDetail aufgewärmt, damit Detailseiten schneller öffnen.',
      },
      {
        id: 'seo',
        title: 'Suche und Auffindbarkeit',
        body:
          'Wenn ein Ort seinen ersten erfolgreichen Current-Weather-Check erhält, setzt markLocationIndexable city_slug und indexable_at, fügt die Stadt zur Sitemap hinzu und rendert serverseitig SEO-Metadaten plus einen Zusammenfassungsblock auf der Stadtseite.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'Prognosen & Cache',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'scopes',
        title: 'Wetter-Scopes',
        body:
          'Vom Client anfragbare Scopes: current (jetzt), hourly (Zeitachse), daily (Zeitachse), minutely (Niederschlag). Nur serverseitige Scopes: geocode (Stadtsuche-Cache mit Schlüssel geocode:{query}), alert (einzelne Warnungs-Payloads). Jeder Wetter-Scope nutzt Cache-Schlüssel {lat},{lon},{scope}; geocode nach Abfragestring.',
      },
      {
        id: 'layers',
        title: 'Cache-Schichten',
        body:
          'L0 — Browser localStorage meridian:weather-cache, Struktur {cityId: {scope: {payload, fetchedAt}}}. L1 — in-memory Map im Serverprozess. L2 — SQLite weather_snapshots mit fetched_at, expires_at, stale_until. Lesevorgänge prüfen L0 → API → L1/L2 → Upstream OpenWeather.',
      },
      {
        id: 'freshness',
        title: 'Frischezustände',
        body:
          'fresh — innerhalb expires_at. acceptable — nach expires, aber innerhalb stale_until (kann noch ausgeliefert werden). expired — jenseits stale_until, löst Upstream aus, wenn Quota erlaubt. emergency — Quota blockiert, aber abgelaufener/akzeptabler L2-Snapshot wird trotzdem ausgeliefert, damit Nutzer noch Daten sehen.',
      },
      {
        id: 'ttl-table',
        title: 'TTL-Defaults (SCOPE_TTL)',
        body:
          'current — fresh 1h, stale 2h (überschrieben durch platform_settings.refresh_interval_ms und stale_cache_max_ms; Admin kann 10m–2h setzen). hourly — fresh 2h, stale 6h. daily — fresh 6h, stale 12h. minutely — fresh 15m, stale 30m. geocode — fresh 7d, stale 30d. alert — fresh 1h, stale 6h.',
      },
      {
        id: 'upstream',
        title: 'OpenWeather-Integration',
        body:
          'Primär: One Call API 4.0 (onecall/current, timeline/1h, timeline/1day, timeline/1min). Current-Scope fällt auf API 2.5 /weather zurück, wenn One Call current fehlschlägt. Geocode nutzt OpenWeather Geocoding API (limit 5). Normalisierung in src/lib/one-call.js erzeugt konsistente UI-Payloads.',
      },
      {
        id: 'batch',
        title: 'Batch-Fetching',
        body:
          'POST /api/weather/batch akzeptiert { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Scopes sind pro Stadt (city.scopes), kein top-level scopes-Array. Dashboard lädt current + daily zusammen in einem Batch (ohne requestIdleCallback). City detail batcht nur current + hourly + daily. Der Handler staffelt Städte ~100 ms auseinander, um Burst-Rate-Limits zu vermeiden.',
      },
      {
        id: 'headers',
        title: 'Antwort-Metadaten',
        body:
          'API-Antworten enthalten meta: cacheLayer (memory, database, upstream), freshness, fetchedAt, ageMs, upstreamCallAvoided, source. X-Cache-Header spiegelt hit/miss wider, wo zutreffend. „Aktualisiert vor X“ in der UI nutzt meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'Quota-Interaktion',
        body:
          'Wenn Tages- oder Minutenlimits überschritten sind, stoppen Upstream-Aufrufe und emergency-stale L2-Daten werden zurückgegeben, falls verfügbar. Eine Stadt innerhalb der TTL erneut öffnen kostet null Upstream-Aufrufe.',
      },
      {
        id: 'logging',
        title: 'Cache-Hit-Logging',
        body:
          'L2-Datenbank-Cache-Hits werden in api_call_log mit cache_hit=1 protokolliert und erhöhen den täglichen Upstream-Zähler nicht. L1-Speicher-Hits werden ausgeliefert, aber absichtlich nicht in SQLite persistiert — sie feuern bei jedem SSR/Client-Remount und würden meridian.db unter File-Watchern belasten.',
      },
      {
        id: 'payload-fields',
        title: 'Current-Payload-Felder',
        body:
          'temperature, feelsLike, description, condition, icon (OpenWeather-Code), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'Kürzliche Checks & Seeding',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'Was kürzliche Checks sind',
        body:
          'Kürzliche Checks auf der Startseite zeigen plattformweite beliebte Suchen — Orte sortiert danach, wie oft Nutzer sie über die Suche ausgewählt oder in der Vorschau geöffnet haben — nicht Ihren persönlichen Suchverlauf und keinen Rohdump des Wetter-Snapshot-Caches.',
      },
      {
        id: 'api',
        title: 'API-Verhalten',
        body:
          'GET /api/recent-checks ruft getRecentChecksPayload() auf, das location_weather_checks (verknüpft mit locations) via listPopularSearchChecks liest. Standardlimit ist 20. Gezählte Trigger sind search_select und search_preview. Antwortform ist { checks, source }, wobei source popular ist, wenn Zeilen existieren, oder empty wenn keine. Es gibt keinen Showcase-Fallback.',
      },
      {
        id: 'ui',
        title: 'Startseiten-UI',
        body:
          'RecentChecksSection zeigt zwei Spalten („In Ihrer Nähe“ und „Beliebte Suchen“), jeweils bis zu fünf Karten. Karten nutzen Meteocons-Icons, Temperatur, Beschreibung und Stadtlabel. Bei vorhandenen Koordinaten verlinken Karten zu /city/[cityId]. Es gibt keinen recent-checks AdSlot auf der Startseite.',
      },
      {
        id: 'seed-script',
        title: 'Wetter-Snapshots seeden (nicht der Streifen)',
        body:
          'Führen Sie npm run seed:checks mit gesetztem OPENWEATHER_API_KEY aus. Das Skript holt aktuelles Wetter für dreiundvierzig Orte in Cumbria und Nordost-England (siehe src/constants/seed-locations.js), schreibt SQLite weather_snapshots mit gestaffelten fetched_at-Zeitstempeln und reichert Payloads mit Stadtnamen an. Das befüllt den L2-Cache für Demos — es fügt keine suchgetriggerten location_weather_checks-Zeilen ein und füllt daher nicht den recent-checks-/beliebte-Suchen-Streifen.',
      },
      {
        id: 'persistence',
        title: 'Persistenz',
        body:
          'Geseedete Snapshots liegen in DATABASE_PATH (Standard ./data/meridian.db). Erneutes Ausführen des Skripts upsertet nach cache_key. Beliebte-Suchen-Zeilen sammeln sich an, wenn echte Suchen protokolliert werden; Leeren der Datenbank entfernt Snapshots und Check-Verlauf (der Streifen bleibt leer, bis neue Suchen erfolgen).',
      },
    ],
  },
  {
    slug: 'subscriptions',
    title: 'Abonnements',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Überblick',
        body:
          'meridian unterstützt optionale E-Mail: Plattform-Newsletter (Produktupdates) und pro Stadt wöchentliche Digests plus Wetterwarnungen. Alle Abonnements erfordern explizites Opt-in. Kein Konto — eine anonyme UUID clientId in meridian:client-id verknüpft Browser-UI mit Server-Zeilen.',
      },
      {
        id: 'types',
        title: 'Abonnementtypen',
        body:
          'newsletter — meridian-Produktupdates über NewsletterSignup in der Fußzeile. city_weekly — wöchentliche Digest-E-Mail für eine gespeicherte Stadt. city_alerts — Benachrichtigungen, wenn aktivierte Warnungstypen passen (siehe Warnungsregeln). Typen liegen in SQLite subscriptions.type und spiegeln sich im lokalen Register meridian:subscriptions.',
      },
      {
        id: 'client-linking',
        title: 'Client-ID und lokales Register',
        body:
          'Beim ersten Besuch wird eine UUID in meridian:client-id geschrieben. POST /api/subscriptions verknüpft E-Mail + Einstellungen mit dieser clientId. GET /api/subscriptions?clientId= hydratisiert meridian:subscriptions beim Laden. DELETE deaktiviert nach clientId, Stadtkoordinaten und Typen.',
      },
      {
        id: 'alert-prefs',
        title: 'Warnungseinstellungen',
        body:
          'city_alerts-Zeilen speichern alert_prefs_json — eine boolesche Map mit Schlüsseln nach Warnungstyp-ID (rain, wind, thunderstorm, snow, ice, extreme_heat, fog, Schweregrade, hydrologisch, Luftqualität, maritim, UV, US-Schwerwetter und mehr — siehe ALL_ALERT_TYPES in constants/alert-types.js). PATCH /api/subscriptions aktualisiert partielle alertPrefs auf einer bestehenden alerts-Zeile. Legacy-Spalten alert_on_rain und alert_on_storm bleiben beim Anlegen synchron.',
      },
      {
        id: 'subscribe-ui',
        title: 'Abonnieren-Modal',
        body:
          'Auf jeder Wetterkarte und im Optionsmenü der Stadt-Detailseite: E-Mail-Feld, Checkbox wöchentlicher Digest und granulare Warnungsschalter (oder alle aktivieren). Intelligente Labels zeigen Abonniert / Verwalten bei aktivem Abo. Wöchentliche Digests sind begrenzt auf MAX_WEEKLY_DIGEST_LOCATIONS = 20 pro E-Mail-Adresse. Newsletter in der Fußzeile nutzt dieselbe API mit type newsletter.',
      },
      {
        id: 'emails',
        title: 'E-Mail-Zustellung',
        body:
          'sendTransactionalEmail routet über den aktiven ESP-Connector (Resend, SendGrid, SES oder SMTP), ausgewählt im Admin. React-Email-Vorlagen aus src/emails/ und SQLite email_templates: welcome (newsletter), weekly digest, weather alert (pro Warnungstyp-Slug). Ohne konfigurierten Connector schreibt die API Abonnements, aber Send-Funktionen liefern { sent: false }. Setzen Sie NEXT_PUBLIC_APP_URL für korrekte Abmelde-Links in Produktions-E-Mails.',
      },
      {
        id: 'unsubscribe',
        title: 'Abmelden',
        body:
          'Jedes Abonnement hat einen eindeutigen unsubscribe_token. GET /api/unsubscribe?token= deaktiviert die Zeile und zeigt Bestätigung. E-Mail-Vorlagen verlinken auf diese Route. Entfernen einer Stadt kann optional über RemoveCityDialog abmelden.',
      },
      {
        id: 'cron-weekly',
        title: 'Wöchentlicher Digest-Cron',
        body:
          'GET /api/cron/weekly-digests mit Authorization: Bearer CRON_SECRET. Lädt aktive city_weekly-Abonnements gruppiert nach E-Mail, batcht eindeutige Städte, holt aktuelles Wetter pro Stadt und sendet einen Digest pro E-Mail über den aktiven Connector. Extern planen (z. B. Vercel cron, GitHub Actions) — kein Zeitplan im Repo.',
      },
      {
        id: 'cron-alerts',
        title: 'Wetterwarnungs-Cron',
        body:
          'GET /api/cron/weather-alerts mit Bearer CRON_SECRET. Für jedes city_alerts-Abonnement werden aktivierte alertPrefs gegen zusammengeführte Treffer von evaluateOpenWeatherAlertMatches (aktuelle Bedingungen), evaluateOfficialAlertMatches (Open-Meteo-Nationalwarnungen) und NWS-Aktivwarnungen geprüft, wenn Plattform-Schalter erlauben. Dedup via subscription_send_log, damit dieselbe Warnung nicht zweimal für dieselbe Stadt/Bedingungsfenster per E-Mail geht.',
      },
      {
        id: 'remove-city',
        title: 'Stadt-Entfernen-Integration',
        body:
          'Löschen einer gespeicherten Stadt leert den L0-Wettercache. Existieren Abonnements für diese Stadt, fordert RemoveCityDialog auf, vor Bestätigung vom wöchentlichen Digest und/oder Warnungen abzumelden.',
      },
    ],
  },
  {
    slug: 'monetization',
    title: 'Monetarisierung & Consent',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'tiers',
        title: 'Free-Tier (Premium reserviert)',
        body:
          'Das Produkt läuft derzeit nur als kostenlos. ConsentProvider hardcodiert tier free; meridian:tier ist reserviert und zur Laufzeit ungenutzt. Stripe-Checkout und PremiumGate sind nicht angebunden. Anzeigen sind durch Werbe-Consent und AdSense-Konfiguration gegated — nicht durch ein Premium-Flag.',
      },
      {
        id: 'premium-features',
        title: 'Was Premium freischalten würde (nicht ausgeliefert)',
        body:
          'Reserviert / nicht in der UI implementiert: AdSense für ein bezahltes Tier ausblenden und ein minutely-Niederschlagsstreifen. City detail lädt heute nur current-, hourly- und daily-Scopes. Es gibt keine MinutelyPrecipStrip-Komponente in der App.',
      },
      {
        id: 'consent-model',
        title: 'Consent-Modell',
        body:
          'meridian:consent JSON-Felder: essential (immer an), functional (Wettercache-localStorage-Schreibvorgänge und GPS-Helfer), marketing (reserviert), analytics (GA4-Loader wenn konfiguriert), advertising (AdSense). meridian:cookie-consent Legacy-Flag. Cookie-Banner: Alle akzeptieren, Funktional akzeptieren, Nur essenziell, Einstellungen verwalten. Jederzeit über schwebende Einstellungssteuerung → Tab Cookies. „Alle akzeptieren“ aktiviert functional + advertising; Google Analytics separat in den Einstellungen einschalten, falls angeboten.',
      },
      {
        id: 'adsense',
        title: 'Google AdSense (live)',
        body:
          'Wenn GOOGLE_ADSENSE_CLIENT_ID und Placement-Slot-Umgebungsvariablen gesetzt sind, ist AdSense live — keine Platzhalter. AdSenseProvider lädt das Skript einmal nach Werbe-Consent, wenn konfiguriert. GET /api/ads/config liefert Skript-Konfiguration; GET /api/ads?placement= liefert Konfiguration pro Slot. GET /ads.txt liefert Publisher-Verifizierung aus der Umgebung. Client-ID serverseitig validiert (ca-pub-…-Format); nie in git committen.',
      },
      {
        id: 'placements',
        title: 'Anzeigenplatzierungen',
        body:
          'Aktive UI-Platzierungen mit AdSlot: dashboard (unter dem Stadtraster), hero (Startseiten-Hero + Journal-Seitenleiste), city-detail (unter Tabs). Placement-ID recent-checks existiert in constants/env, hat aber keinen AdSlot auf der Startseite. Slot-Umgebungsvariablen: GOOGLE_ADSENSE_SLOT_DASHBOARD, _HERO, _RECENT, _CITY_DETAIL, _DEFAULT. Ohne Slot-IDs zeigen Platzierungen gebrandete Demo-Platzhalter; Auto-Ads können trotzdem vom Skript laufen, wenn die Client-ID gesetzt ist.',
      },
      {
        id: 'adslot-states',
        title: 'AdSlot-UI-Zustände',
        body:
          'Standard (AdSense nicht gesetzt / kein Werbe-Consent): gebrandete PNG-Platzhalter unter public/ads/ (Banner und Quadrat). Overlay-Text nur für Screenreader (sr-only), nicht auf dem Bild. GET /api/ads/placeholder-bg kann weiterhin Hero-Bild-Lookups für andere Oberflächen liefern. Konfiguriert + Consent — ins.adsbygoogle-Unit nach Skriptbereitschaft.',
      },
      {
        id: 'analytics',
        title: 'Analytics',
        body:
          'First-Party SiteAnalyticsBeacon sendet Seitenpfad / Engagement an POST /api/analytics/collect in site_analytics_events, wenn consent.analytics an ist (collect-Endpunkt prüft auch das Consent-Flag im Request-Body). Ad-Slot-View-Events erfordern ebenfalls consent.advertising. Optionales GA4 (AnalyticsProvider) lädt nur, wenn NEXT_PUBLIC_GA_MEASUREMENT_ID gesetzt ist und consent.analytics an ist. Cookie-Banner „Alle akzeptieren“ aktiviert analytics nicht — in Einstellungen → Cookies einschalten.',
      },
      {
        id: 'stripe',
        title: 'Stripe (geplant)',
        body:
          'Premium / Stripe-Checkout ist nicht implementiert. Jede zukünftige Abrechnung bräuchte serverseitige Tier-Durchsetzung; behandeln Sie meridian:tier nicht als live.',
      },
      {
        id: 'data',
        title: 'Datenlizenzierung',
        body:
          'meridian verkauft oder lizenziert keine Nutzerdaten. First-Party-Analytics und optionales GA4 dienen dem Betrieb des Produkts. Jedes zukünftige B2B- oder anonymisierte Analytics-Produkt erfordert separate Consent- und Richtlinien-Updates.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'API-Limits',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'quota',
        title: 'Tages- und Minutenquota',
        body:
          'Defaults aus constants/weather.js: DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 Upstream-Aufrufe pro rollierender Minute. platform_settings kann daily_limit, soft_block_threshold, warning_threshold und per_minute_limit überschreiben (Defaults beim ersten DB-Öffnen geseedet). Zähler setzt um UTC-Mitternacht zurück.',
      },
      {
        id: 'status',
        title: 'Statuswerte',
        body:
          'ok — unter Warnschwelle. warning — bei oder über warning_threshold (Standard 800 Aufrufe heute). soft_block — bei oder über soft_block_threshold (Standard 950); Upstream blockiert. hard_block — bei daily_limit (Standard 1000). Minutenlimit blockiert Upstream ebenfalls, wenn per_minute_limit Aufrufe in den letzten 60 Sekunden erfolgten.',
      },
      {
        id: 'cache-hits',
        title: 'Cache-Hits vs. Upstream',
        body:
          'L2-Datenbank-Hits werden in api_call_log mit cache_hit=1 protokolliert und erhöhen den täglichen Upstream-Zähler nicht. L1-Speicher-Hits werden nicht in SQLite protokolliert — recordCacheHit kehrt früh zurück, wenn meta.layer memory ist. Nur erfolgreiche Upstream-OpenWeather-Aufrufe (Status 200, cache_hit=0) zählen zur Quota. Emergency-stale-Auslieferungen vermeiden Upstream bei Blockierung.',
      },
      {
        id: 'admin-shortcut',
        title: 'Admin-Diagnostik',
        body:
          'Öffnen Sie /admin (nach Login) für heute genutzt / Tageslimit, verbleibend, Status und Aktualisierungsintervall-Einstellungen. API: GET /api/admin/usage.',
      },
      {
        id: 'admin-api',
        title: 'Admin-API',
        body:
          'GET /api/admin/usage — Quota-Snapshot und letzte Aufrufe. GET|PATCH /api/admin/config — primäre Admin-Einstellungs-API (Aktualisierungsintervall, Connectors, Digest-Defaults, AdSense, Warnungsschalter usw.). Schmales Legacy: PATCH /api/admin/settings { refreshIntervalMs }. Auth: HttpOnly-Session-Cookie meridian_admin_session nach /login. Signaturgeheimnis ist ADMIN_SECRET (nicht ADMIN_PASSWORD). Dev-Bypass wenn NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 und ADMIN_SECRET nicht gesetzt.',
      },
      {
        id: 'openweather',
        title: 'OpenWeather-Provider-Limits',
        body:
          'meridian trackt seinen eigenen Upstream-Zähler; OpenWeather kann Schlüssel unabhängig rate-limiten oder ablehnen (401, 429). Der Orchestrator mappt diese auf strukturierte API-Fehler für den Client.',
      },
      {
        id: 'emergency',
        title: 'Notfallmodus',
        body:
          'Bei soft/hard block sehen Nutzer weiterhin den letzten akzeptablen SQLite-Snapshot mit freshness emergency statt eines leeren Fehlers — es sei denn, für diese Koordinate existierte nie ein Snapshot.',
      },
    ],
  },
  {
    slug: 'api-reference',
    title: 'API-Referenz',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Überblick',
        body:
          'Alle API-Routen sind Next.js App Router Handler unter src/app/api/. Wetter und Geocode benötigen OPENWEATHER_API_KEY. Cron-Routen benötigen Authorization: Bearer CRON_SECRET. Admin-Routen benötigen ein authentifiziertes Admin-Session-Cookie (meridian_admin_session) nach Login unter /login, sofern kein Dev-Bypass greift.',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query: lat, lon, scope (current|hourly|daily|minutely), optional trigger, lang. Liefert Wetter-Payload plus fetchedAt, cacheHit, freshness, source, trigger, tokensUsed. X-Cache-Header spiegelt Cache-Schicht. Fehler: 400 invalid params, 404 location not found, 429 rate_limited, 502 upstream_error oder service_unavailable.',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body: { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Liefert { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. Scopes sind pro Stadt, kein top-level Array. Rate-Limit 20 Anfragen/Minute pro IP. Genutzt von Dashboard- und City-Detail-Hooks.',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query: lat, lon, optional from, to (ISO-Daten), limit. Liefert { summary, observations, forecasts: { hourly, daily } } aus weather_observations und weather_forecast_archive.',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query: q (min. 2 Zeichen), optionale context-Parameter. Liefert normalisiertes Array: name, country, state, lat, lon, label. Upstream-Limit 5 Ergebnisse. In L2 mit geocode-Scope gecacht. Rate-Limit 60 Anfragen/Minute pro IP.',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'Keine Parameter. Liefert { checks, source }, wobei source popular ist, wenn suchgetriggerte Zeilen existieren, oder empty wenn keine. Standardlimit 20 aus location_weather_checks sortiert nach Suchvolumen (Trigger search_select und search_preview). Kein Showcase-Fallback.',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — aktive Abonnements für Client auflisten. POST — anlegen { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — alertPrefs auf city_alerts-Zeile aktualisieren { clientId, id, alertPrefs }. DELETE — Body { clientId, cityLat, cityLon, types[] }. Typen: newsletter, city_weekly, city_alerts.',
      },
      {
        id: 'unsubscribe',
        title: 'GET /api/unsubscribe',
        body:
          'Query: token (unsubscribe_token UUID). Deaktiviert Abonnement und liefert HTML-Bestätigung.',
      },
      {
        id: 'alerts',
        title: 'GET /api/alerts/[alertId]',
        body:
          'Liefert normalisierte Warnung: id, senderName, event, start, end, description. Quelle: gecachter alert-Scope.',
      },
      {
        id: 'cron',
        title: 'Cron-Routen',
        body:
          'GET /api/cron/weekly-digests — wöchentliche Digest-E-Mails gruppiert nach Abonnenten-E-Mail senden. GET /api/cron/weather-alerts — alertPrefs gegen OpenWeather-, Open-Meteo- und NWS-Feeds prüfen und Warnungs-E-Mails senden. Beide benötigen Bearer CRON_SECRET.',
      },
      {
        id: 'admin',
        title: 'Admin-Routen',
        body:
          'Nutzung und Konfiguration: GET /api/admin/usage; GET|PATCH /api/admin/config; Legacy PATCH /api/admin/settings { refreshIntervalMs }. Nutzer und Auth: GET|POST /api/admin/users; POST /api/admin/users/invite; GET /api/admin/me. Daten: GET /api/admin/checks; GET /api/admin/locations; GET|PATCH /api/admin/subscriptions; GET /api/admin/mailing-summary; GET /api/admin/analytics. Connectors: GET|PATCH /api/admin/connections; GET|PATCH /api/admin/openweather-key; GET|PATCH /api/admin/email-key. E-Mail-CMS: GET|POST|PATCH /api/admin/email-templates; POST /api/admin/email/test, /compose, /sync. AdSense: GET /api/admin/adsense/report; POST /api/admin/adsense/sync; OAuth GET /api/admin/adsense/oauth/start, /callback, /disconnect. CMS: GET|PATCH /api/admin/cms-pages. Alle benötigen meridian_admin_session, sofern kein Dev-Bypass.',
      },
      {
        id: 'ads',
        title: 'Ads-Routen',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — Platzierungskonfiguration mit slotId wenn gesetzt. GET /api/ads/placeholder-bg — Hero-Lookup für Platzhalter-Oberflächen. App-Route GET /ads.txt — AdSense-Publisher-Zeile aus env. Aktive AdSlot-Platzierungen: dashboard, hero, city-detail. recent-checks-Slot-env existiert, Startseite hat aber keinen AdSlot.',
      },
      {
        id: 'other',
        title: 'Weitere öffentliche Routen',
        body:
          'GET /api/platform/limits — öffentlicher Quota-Snapshot. POST /api/analytics/collect — First-Party-Analytics-Beacon. GET /api/location/region — IP/Region-Helfer. POST /api/weather/inaccurate-report — fehlerhafte Daten melden. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — OSM-Hero-Overlay-Kacheln. Auth: POST /api/auth/login, /logout; POST /api/auth/forgot-password; POST /api/auth/reset-password/[token]; GET|POST /api/auth/invite/[token]; GET /api/auth/session.',
      },
      {
        id: 'errors',
        title: 'Fehlerform',
        body:
          'JSON-Fehler typischerweise { error: code, message: string }. ApiError-Codes umfassen invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error, unauthorized, not_found, limit_reached.',
      },
    ],
  },
  {
    slug: 'weather-icons',
    title: 'Wetter-Icons',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'source',
        title: 'Icon-Set',
        body:
          'meridian nutzt Meteocons (MIT, Bas Milius) Fill-Style statische SVGs statt OpenWeather-CDN-PNGs. Icons liegen in public/weather-icons/ und werden von @meteocons/svg-static bei npm install (postinstall) oder via npm run copy:icons kopiert. Attribution in public/weather-icons/ATTRIBUTION.txt.',
      },
      {
        id: 'inventory',
        title: 'Ausgelieferte Icons',
        body:
          'scripts/copy-weather-icons.mjs kopiert 35 eindeutige SVGs: 17 OpenWeather-Bedingungsicons plus Metrik-/Detail-Kacheln (thermometer, humidity, barometer, wind, UV, raindrop, snowflake, compass, starry-night, time-afternoon und verwandte Varianten). Zählen Sie Dateien unter public/weather-icons/*.svg nach copy:icons.',
      },
      {
        id: 'mapping',
        title: 'OpenWeather-Code-Mapping',
        body:
          'OpenWeather-Icon-Codes (z. B. 01d, 10n) mappen auf Meteocon-Namen in src/features/weather/utils/weather-icon.js: 01d→clear-day, 01n→clear-night, 02d→partly-cloudy-day, 02n→partly-cloudy-night, 03d/03n→cloudy, 04d→overcast-day, 04n→overcast-night, 09d→overcast-day-rain, 09n→overcast-night-rain, 10d→partly-cloudy-day-rain, 10n→partly-cloudy-night-rain, 11d→thunderstorms-day, 11n→thunderstorms-night, 13d→overcast-day-snow, 13n→overcast-night-snow, 50d→fog-day, 50n→fog-night. Unbekannte Codes fallen auf cloudy zurück. METRIC_METEOCON mappt Detail-Kachel-Schlüssel auf weitere Icons.',
      },
      {
        id: 'component',
        title: 'WeatherIcon-Komponente',
        body:
          'src/features/weather/components/WeatherIcon.jsx umschließt getWeatherIconPath(icon) für lokale /weather-icons/{name}.svg. Genutzt auf Wetterkarten, kürzlichen Checks, Prognosestreifen, Stundendiagramm, Tageszeilen und Stadt-Detail-Metrik-Kacheln. Alt-Text nutzt Wetterbeschreibung, wenn angegeben.',
      },
      {
        id: 'maintenance',
        title: 'Icons hinzufügen oder aktualisieren',
        body:
          'Bearbeiten Sie OPENWEATHER_TO_METEOCON / METRIC_METEOCON in weather-icon.js und ICON_NAMES in scripts/copy-weather-icons.mjs, dann npm run copy:icons. Vitest-Tests in weather-icon.test.js prüfen das Mapping.',
      },
      {
        id: 'accessibility',
        title: 'Barrierefreiheit',
        body:
          'Icons sind dekorative Ergänzungen zu Textbeschreibungen (z. B. „Klarer Himmel“). WeatherIcon setzt alt aus description-Prop; leeres alt, wenn nur neben sichtbarem Bedingungstext verwendet.',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'Deployment & Umgebung',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'env-required',
        title: 'Erforderliche Umgebung',
        body:
          'OPENWEATHER_API_KEY — erforderlich für Wetter und Geocode. DATABASE_PATH — SQLite-Datei (Standard ./data/meridian.db); in Produktion persistentes Volume, damit Cache und Abonnements Neustarts überleben.',
      },
      {
        id: 'env-hero',
        title: 'Hero-Bild-Umgebung',
        body:
          'UNSPLASH_ACCESS_KEY — optional; erster Foto-Provider für Standort-Heros (nur Server, gecacht in hero_image_cache). PEXELS_API_KEY — optional dritter Provider nach Unsplash und Wikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — auf 0 setzen, um Satellitenkarten-Kopf zu deaktivieren (Standard an). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — Opt-in Google Street View, wenn OSM aus ist. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — optional Maps Embed API-Schlüssel für Street-View-Iframes.',
      },
      {
        id: 'env-email',
        title: 'E-Mail-Umgebung',
        body:
          'Multi-ESP über aktiven Connector in platform_settings (Admin-Auswahl): Resend (RESEND_API_KEY, RESEND_FROM_EMAIL), SendGrid (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL), Amazon SES (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION, AWS_SES_FROM_EMAIL) oder SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_SECURE). NEXT_PUBLIC_APP_URL — Basis-URL für Abmelde-Links in E-Mails (in .env.example aufgeführt; in Produktion erforderlich).',
      },
      {
        id: 'env-cron',
        title: 'Cron und Admin',
        body:
          'CRON_SECRET — Bearer für /api/cron/* (verweigert, wenn in Produktion nicht gesetzt). ADMIN_SECRET — signiert Admin-Session-Cookie und verschlüsselt Connector-Geheimnisse. ADMIN_PASSWORD — Root-Login nur für ADMIN_EMAIL. Dev-Bypass nur wenn NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 und ADMIN_SECRET nicht gesetzt. Siehe docs/SECURITY.md. Cron extern planen: weekly-digests (z. B. Montagmorgen), weather-alerts (z. B. alle 15–30 Minuten).',
      },
      {
        id: 'env-adsense',
        title: 'AdSense-Umgebung',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD, SLOT_HERO, SLOT_RECENT, SLOT_CITY_DETAIL, SLOT_DEFAULT — Display-Unit-IDs. AdSense Management API OAuth: GOOGLE_ADSENSE_OAUTH_CLIENT_ID, GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET, optional GOOGLE_ADSENSE_OAUTH_REDIRECT_URI (Standard ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). Client-ID nur in Host-Secrets. /ads.txt zur Laufzeit aus Client-ID generiert.',
      },
      {
        id: 'env-analytics',
        title: 'Analytics-Umgebung',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — optionaler GA4-Loader, wenn consent.analytics an ist. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — Search-Console-Meta-Tag.',
      },
      {
        id: 'scripts',
        title: 'npm-Skripte',
        body:
          'dev, build, start — Next.js. lint, test, test:watch, verify — Qualitätsgate (verify = lint + test + build). copy:icons — Meteocons nach public (auch postinstall). seed:checks — Nordengland-Demo-Snapshots. backfill:city-slugs — city_slug für bestehende Orte befüllen. email — React-Email-Vorschau-Server. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'SQLite-Tabellen',
        body:
          'Kern-Wetter: weather_snapshots, api_call_log. Orte und Checks: locations, location_weather_checks, weather_observations, weather_forecast_archive. Abonnements: subscriptions, subscription_send_log. Plattform: platform_settings (Singleton). Heros: hero_image_cache. Monetarisierung: adsense_report_snapshots. Analytics: site_analytics_events. E-Mail/CMS: email_templates, cms_pages. Admin: admin_users, admin_invites, admin_password_resets, admin_audit_log. Schema in src/lib/db/index.js. Erstes Öffnen seedet platform_settings mit refresh 1h, stale 2h, daily limit 1000, soft block 950, warning 800, per-minute 60.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js schreibt docs.localhost-Host auf /docs für lokale Dokumentations-Subdomain um. Keine Auth-Middleware auf Haupt-App-Routen.',
      },
      {
        id: 'localstorage-keys',
        title: 'Browser-Storage-Schlüssel',
        body:
          'Aus storage-keys.js: meridian:client-id, meridian:saved-cities, meridian:checked-cities, meridian:user-location, meridian:weather-cache, meridian:theme, meridian:cookie-consent, meridian:subscriptions, meridian:tier (reserviert), meridian:consent, meridian:accessibility, meridian:city-detail-accordion, meridian:temperature-unit, meridian:preferred-locale, meridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — First-Party-Analytics-Session-ID. Admin-Cookie meridian_admin_session (HttpOnly, serverseitig gesetzt). Custom-Event meridian:storage synchronisiert Hooks nach Schreibvorgängen.',
      },
    ],
  },
];
