/** German documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'Erste Schritte',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Was meridian ist',
        body:
          'meridian ist ein Wetter-Dashboard für mehrere Orte gleichzeitig. Suchen Sie eine Stadt, öffnen Sie ihre Seite, heften Sie sie unter Ihre Orte an und behalten Sie Temperatur, Bedingungen und kurze Prognosen im Blick. Sie brauchen kein Konto. Ihre angehefteten Städte und die meisten Einstellungen bleiben auf diesem Gerät.',
      },
      {
        id: 'add-city',
        title: 'So heften Sie eine Stadt an',
        body:
          '1. Geben Sie mindestens zwei Zeichen in das Suchfeld auf der Startseite oder in der Kopfzeile ein. Ergebnisse erscheinen nach einer kurzen Pause.\n2. Wählen Sie einen Ort aus der Liste — das öffnet die Stadtseite.\n3. Tippen Sie An Ihre Orte anheften, um sie zu speichern. Sie können sie später im gleichen Menü wieder lösen oder die Stadt aus dem Start-Raster entfernen.\n\nAngeheftete Orte erscheinen unter Ihre Orte auf der Startseite. Sie können bis zu zehn anheften. Stadtseiten-Adressen sehen so aus: /city/london-GB-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'Limit von zehn Städten',
        body:
          'Ihre Orte können bis zu zehn angeheftete Städte aufnehmen. Sind Sie am Limit, entfernen Sie eine, bevor Sie eine weitere anheften.',
      },
      {
        id: 'first-visit',
        title: 'Cookies, Werbung und Theme',
        body:
          'Beim ersten Besuch fragt ein Banner, wie Speicherung und Werbung funktionieren sollen:\n\n• Alle akzeptieren — nützliche Funktionen plus Werbung\n• Funktional akzeptieren — nützliche Funktionen ohne Werbung\n• Nur essenziell — das Nötigste, damit die Seite funktioniert\n• Einstellungen verwalten — Kategorien selbst wählen\n\n„Alle akzeptieren“ schaltet weder Google Analytics noch unsere optionale Nutzungsanalyse ein — aktivieren Sie Analytics bei Bedarf separat unter den Einstellungen.\n\nCookie-Einstellungen öffnen Sie über die schwebende Einstellungssteuerung (Zahnrad). Diese Steuerung kann beim Scrollen nach unten ausgeblendet werden und kann ausgeblendet sein, wenn Ihr Gerät reduzierte Bewegung wünscht. Das Theme (hell / dunkel) hat eine eigene schwebende Steuerung.',
      },
      {
        id: 'navigation',
        title: 'Wohin als Nächstes',
        body:
          'Dashboard erklärt die Startseite. Stadt-Detail behandelt Prognose-Tabs. Abonnements deckt E-Mail-Digests und Warnungen ab. Monetarisierung & Einwilligung erklärt Werbung und Datenschutz. Spätere Seiten (Prognosen & Cache, API-Referenz, Deployment) richten sich vor allem an Betreiber der Seite.',
      },
      {
        id: 'operators',
        title: 'Für Seitenbetreiber',
        body:
          'Live-Wetter benötigt OPENWEATHER_API_KEY auf dem Server. E-Mail, Cron-Jobs und AdSense sind optional. SQLite (better-sqlite3) speichert gemeinsamen Cache und Nutzungslimits. Führen Sie npm run verify für Lint, Test und Build aus. Admin: Anmeldung unter /login, dann /admin öffnen. Dev-Bypass nur bei NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 und wenn ADMIN_SECRET nicht gesetzt ist. CMS-bearbeitete Docs können abweichen, bis sie auf Datei-Defaults zurückgesetzt werden. Lokale Docs-Subdomain: docs.localhost:3000.',
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
        title: 'Was Sie auf der Startseite sehen',
        body:
          'Von oben nach unten:\n\n1. Hero — Willkommenstext, Suche und eine schnelle Wetterprüfung für Ihren Standort.\n2. Ihre Orte — Wetterkarten für die angehefteten Orte.\n3. In der Nähe & beliebt — zwei Spalten: In Ihrer Nähe und Beliebte Suchen.\n4. Eine Dashboard-Anzeige unter Ihre Orte (Platzhalter oder AdSense).\n5. Journal — Artikelkarussell.\n\nMit NEXT_PUBLIC_SHOW_HOME_STRETCH=0 lassen sich Anzeige und Journal ausblenden.',
      },
      {
        id: 'cards',
        title: 'Ihre Ortskarten',
        body:
          'Jede Karte zeigt Ortsname, Temperatur, Bedingung, Wetter-Icon, gefühlte Temperatur, Luftfeuchtigkeit und Wind. Tippen Sie auf eine Karte, um die vollständige Stadtseite zu öffnen. Während das Wetter lädt, sehen Sie einen Platzhalter; schlägt ein Abruf fehl, gibt es Wiederholen und Entfernen.',
      },
      {
        id: 'forecast-strip',
        title: 'Sieben-Tage-Streifen',
        body:
          'Unter der Hauptanzeige zeigt jede Karte einen Sieben-Tage-Ausblick (Wochentag, Icon, Höchst- und Tiefstwert). Aktuelle Bedingungen und dieser Ausblick werden zusammen geladen, sodass Sie nicht auf einen zweiten Schritt warten müssen.',
      },
      {
        id: 'card-actions',
        title: 'Abonnieren und entfernen',
        body:
          'Abonnieren öffnet E-Mail-Optionen für einen wöchentlichen Digest und Wetterwarnungen für diese Stadt. Entfernen nimmt die Stadt aus Ihre Orte und löscht ihr gespeichertes Wetter auf diesem Gerät. Haben Sie noch E-Mail-Warnungen für diese Stadt, werden Sie gefragt, ob Sie diese ebenfalls beenden möchten.',
      },
      {
        id: 'states',
        title: 'Leeres Dashboard',
        body:
          'Ohne angeheftete Städte erklärt das Raster, wie Sie über die Stadtseite Ihren ersten Ort suchen und anheften.',
      },
      {
        id: 'refresh',
        title: 'Wann sich die Werte aktualisieren',
        body:
          'Standardmäßig bevorzugen Ihre Orte die zuletzt auf diesem Gerät gespeicherte Messung. Tippen Sie auf Aktualisieren auf einer Karte für eine frische Abfrage (neue Städte ohne gespeicherte Messung werden auch automatisch abgerufen). Es gibt keinen Schalter Einstellungen → Wetter in der aktuellen Oberfläche.',
      },
      {
        id: 'recent-checks',
        title: 'In Ihrer Nähe und Beliebte Suchen',
        body:
          'In Ihrer Nähe — Orte rund um Ihr Zuhause oder Ihre Region, mit aktuellen Bedingungen. Das sind nicht „Ihre früheren Suchen“.\n\nBeliebte Suchen — Orte, die viele Besucher dieser Seite gesucht haben, bis zu fünf Karten. Bei einer ruhigen oder neuen Installation können Sie einige Demo-Städte sehen, bis echte Suchaktivität entsteht.\n\nKarten verlinken zur Stadtseite, wenn Koordinaten vorliegen. Mehr unter In der Nähe & beliebt.',
      },
      {
        id: 'operators',
        title: 'Für Seitenbetreiber',
        body:
          'Home stretch (Dashboard AdSlot + Journal): NEXT_PUBLIC_SHOW_HOME_STRETCH=0 (default on; set 0 to hide). Demo-Beliebte-Suchen-Städte, wenn die API keine Zeilen hat: SHOW_DEMO_POPULAR_SEARCHES (standardmäßig an; NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 zum Deaktivieren). Beliebte-Suchen-API: GET /api/recent-checks (limit 20, source popular|empty). In Ihrer Nähe nutzt diese API nicht. Seed-Skript npm run seed:checks füllt nur weather_snapshots — nicht Beliebte Suchen.',
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
        title: 'Eine Stadtseite öffnen',
        body:
          'Suchergebnisse und Startkarten öffnen eine Seite für diesen Ort. Sie müssen eine Stadt nicht anheften, um sie anzusehen. Anheften fügt sie nur zu Ihre Orte auf der Startseite hinzu. Einige Showcase-Städte und der Seite bereits bekannte Orte öffnen immer; unbekannte Adressen zeigen einen hilfreichen Leerzustand oder 404.',
      },
      {
        id: 'tabs',
        title: 'Prognose-Tabs',
        body:
          'Nutzen Sie die Tabs, um zu wechseln zwischen:\n\n• Heute — aktuelle Bedingungen und Kurzinfos\n• Stündlich — die nächsten Stunden\n• 10 Tage — der längere Ausblick\n• Verlauf — vergangene Tage, wenn wir sie gespeichert haben\n\nSie können einen Link teilen, der einen Tab öffnet (z. B. mit ?tab=hourly). Bis zu drei Wetterwarn-Banner können oberhalb der Seite erscheinen, wenn Warnungen vorliegen. Eine Anzeige kann unter den Tabs stehen.',
      },
      {
        id: 'header',
        title: 'Karte oder Foto oben',
        body:
          'Standardmäßig zeigt der Kopfbereich eine Satellitenkarte der Gegend. Betreiber können auf Standortfotos umschalten (von Fotoanbietern, wenn verfügbar, sonst ein einfaches Markenbild). Optionales Street View ist eine Betreibereinstellung, wenn die Kartenkulisse aus ist.',
      },
      {
        id: 'today',
        title: 'Heute',
        body:
          'Aktuelle Temperatur und Bedingung, Metrik-Kacheln (Luftfeuchtigkeit, Wind und Ähnliches) und Ausklapper für mehr Details. Eine kurze stündliche Vorschau für den Rest des Tages, wenn verfügbar.',
      },
      {
        id: 'hourly',
        title: 'Stündlich',
        body:
          'Die nächsten zwölf Stunden: Temperatur, Regenwahrscheinlichkeit und Wind auf einen Blick.',
      },
      {
        id: 'daily',
        title: '10 Tage',
        body:
          'Bis zu zehn Tage mit Höchst-/Tiefstwerten, Bedingungen, Regenwahrscheinlichkeit, Wind und UV. Wählen Sie einen Tag, um das Diagramm zu fokussieren.',
      },
      {
        id: 'history',
        title: 'Verlauf',
        body:
          'Vergangene Tage aus gespeicherten Beobachtungen, wenn verfügbar, mit Tagesauswahl und Diagramm.',
      },
      {
        id: 'subscribe',
        title: 'Anheften und E-Mail',
        body:
          'Das Menü Optionen ermöglicht An Ihre Orte anheften oder Abonnieren für einen wöchentlichen Digest und Wetterwarnungen für diesen Ort.',
      },
      {
        id: 'operators',
        title: 'Für Seitenbetreiber',
        body:
          'resolveCity() liefert immer fünf PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney) plus Zeilen mit city_slug. Standard-Hero: OSM wenn isCityHeroOsmEnabled() (NEXT_PUBLIC_CITY_HERO_OSM unset oder nicht "0"); Fotos wenn OSM aus (Unsplash → Wikimedia → Pexels). Street View Opt-in: NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 mit Maps-Key. Client-Batch: current, hourly, daily nur — keine minutely-UI. Verlauf: GET /api/weather/history. Erste erfolgreiche current-Abfrage kann die Stadt für Sitemap/SEO indexierbar machen.',
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
        title: 'E-Mail-Updates (optional)',
        body:
          'Sie können meridian bitten, Ihnen E-Mails zu senden — ohne Anmeldung. Wählen Sie einen Newsletter über das Produkt, einen wöchentlichen Digest für eine angeheftete Stadt und/oder Wetterwarnungen, wenn Bedingungen Ihren Kriterien entsprechen. Alles ist Opt-in; jede E-Mail enthält eine Möglichkeit zum Abbestellen.',
      },
      {
        id: 'types',
        title: 'Wofür Sie sich anmelden können',
        body:
          '• Newsletter — Produkt-Updates (meist über das Footer-Formular).\n• Wöchentlicher Digest — eine regelmäßige Zusammenfassung für eine Stadt, der Sie folgen.\n• Wetterwarnungen — E-Mails, wenn ausgewählte Warnungstypen für eine Stadt auslösen (Regen, Wind, Schnee, offizielle Warnungen und mehr).\n\nVerwalten können Sie diese über Abonnieren auf einer Wetterkarte oder im Menü Optionen der Stadtseite.',
      },
      {
        id: 'subscribe-ui',
        title: 'So abonnieren Sie',
        body:
          'Geben Sie Ihre E-Mail ein, wählen Sie wöchentlichen Digest und/oder Warnungen und legen Sie die gewünschten Warnungstypen fest (oder alle aktivieren). Warnungstypen können Sie später ändern. Eine E-Mail-Adresse kann bis zu zwanzig Orte für wöchentliche Digests verfolgen. Haben Sie bereits abonniert, steht auf dem Button vielleicht Abonniert oder Verwalten.',
      },
      {
        id: 'unsubscribe',
        title: 'So beenden Sie E-Mails',
        body:
          'Nutzen Sie den Abmelde-Link in jeder Abonnement-E-Mail. Das Entfernen einer Stadt aus Ihre Orte kann ebenfalls fragen, ob E-Mails für diese Stadt beendet werden sollen.',
      },
      {
        id: 'operators',
        title: 'Für Seitenbetreiber',
        body:
          'Anonymes meridian:client-id verknüpft den Browser mit SQLite-Abonnements. API: GET/POST/DELETE/PATCH /api/subscriptions (PATCH aktualisiert alertPrefs). Zustellung über den aktiven Connector (Resend, SendGrid, SES oder SMTP). Ohne Connector werden Zeilen gespeichert, Sendungen liefern { sent: false }. NEXT_PUBLIC_APP_URL für Abmelde-Links setzen. Crons: GET /api/cron/weekly-digests und /api/cron/weather-alerts mit Bearer CRON_SECRET. Warnungen kombinieren OpenWeather-Bedingungen, Open-Meteo offizielle Warnungen und NWS wo aktiviert; Dedup via subscription_send_log. MAX_WEEKLY_DIGEST_LOCATIONS = 20.',
      },
    ],
  },
  {
    slug: 'monetization',
    title: 'Monetarisierung & Einwilligung',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'tiers',
        title: 'Heute für alle kostenlos',
        body:
          'meridian läuft als kostenlose Wetterseite. Es gibt keinen funktionierenden Premium-Checkout oder bezahlten Plan, der Werbung entfernt. Werbung erscheint nur, wenn Sie Werbeeinwilligung erteilen und der Betreiber Google AdSense konfiguriert hat.',
      },
      {
        id: 'consent-model',
        title: 'Ihre Datenschutz-Entscheidungen',
        body:
          'Das Banner beim ersten Besuch lässt Sie wählen:\n\n• Alle akzeptieren — nützliche Funktionen plus Werbung\n• Funktional akzeptieren — nützliche Funktionen ohne Werbung\n• Nur essenziell — das Nötigste für den Betrieb der Seite\n• Einstellungen verwalten — Kategorien selbst ein- oder ausschalten\n\nNützliche Kategorien in einfachen Worten:\n• Funktional — Wetter auf diesem Gerät zwischen Besuchen merken; präzise Standorthilfen, wenn Sie sie erlauben\n• Werbung — Google-Anzeigen, wenn konfiguriert\n• Analytics — optionale Nutzungsmessung und Google Analytics, wenn konfiguriert (wird nicht durch „Alle akzeptieren“ eingeschaltet)\n\nÄndern Sie Ihre Meinung später unter Einstellungen → Cookies, wenn die schwebende Einstellungssteuerung verfügbar ist (sie kann beim Scrollen ausgeblendet werden und kann bei reduzierter Bewegung aus sein).',
      },
      {
        id: 'adsense',
        title: 'Anzeigen, die Sie sehen könnten',
        body:
          'Wenn Werbung erlaubt ist und AdSense konfiguriert ist, können Anzeigen im Start-Hero, unter Ihre Orte, unter Stadtseiten-Tabs und in einigen Journal-Layouts erscheinen. Sind Anzeigen nicht konfiguriert oder haben Sie Werbung abgelehnt, sehen Sie einen Marken-Platzhalter statt einer Live-Anzeige.',
      },
      {
        id: 'analytics',
        title: 'Nutzungsmessung',
        body:
          'Schalten Sie Analytics ein, kann die Seite einfache First-Party-Nutzung erfassen (z. B. welche Seiten aufgerufen wurden) und bei Konfiguration Google Analytics laden. Sichtbarkeitszählung für Anzeigen-Slots braucht ebenfalls Werbeeinwilligung. Lehnt man Analytics ab, bleiben diese Loader aus.',
      },
      {
        id: 'data',
        title: 'Wir verkaufen Ihre Daten nicht',
        body:
          'meridian verkauft keine personenbezogenen Daten. Jedes künftige kostenpflichtige Datenprodukt bräuchte klare Hinweise und neue Einwilligung.',
      },
      {
        id: 'operators',
        title: 'Für Seitenbetreiber',
        body:
          'Tier always free; meridian:tier unused; no Premium weather UI. AdSense: GOOGLE_ADSENSE_CLIENT_ID (runtime script after advertising consent; meta verification only in root HTML). Auto ads; ad-free via Stripe when STRIPE_* + ADFEEE_LICENSE_SECRET set. Analytics: SiteAnalyticsBeacon + POST /api/analytics/collect with signed meridian_consent cookie; GA4 needs NEXT_PUBLIC_GA_MEASUREMENT_ID + analytics consent.',
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
        title: 'Was die Icons sind',
        body:
          'Wetterbilder auf Karten und Prognosen sind klare Linien-/Füll-Icons (Meteocons von Bas Milius, MIT-Lizenz). Sie zeigen Sonne, Wolken, Regen, Schnee, Nebel und ähnliche Bedingungen neben der Textbeschreibung — der Text trägt die Bedeutung, falls ein Bild nicht lädt.',
      },
      {
        id: 'accessibility',
        title: 'Barrierefreiheit',
        body:
          'Icons unterstützen die Worte auf dem Bildschirm. Wo eine Zustandsbeschreibung sichtbar ist, gilt das Bild als dekorativ; sonst gibt es eine kurze Textalternative aus der Beschreibung.',
      },
      {
        id: 'operators',
        title: 'Für Seitenbetreiber',
        body:
          'Assets liegen in public/weather-icons/ (etwa 35 SVG-Dateien in einem typischen Checkout). scripts/copy-weather-icons.mjs kopiert 32 eindeutige Namen von @meteocons/svg-static bei postinstall / npm run copy:icons; einige Extras (z. B. sunrise, sunset, horizon) können im Ordner existieren, werden aber über METRIC_METEOCON-Aliase gemappt. Mapping: src/features/weather/utils/weather-icon.js (OPENWEATHER_TO_METEOCON). Komponente: WeatherIcon.jsx. Attribution: public/weather-icons/ATTRIBUTION.txt. Tests: weather-icon.test.js.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'In der Nähe & beliebt',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'Die zwei Start-Spalten',
        body:
          'Unter Ihre Orte zeigt die Startseite zwei kurze Ortslisten.\n\nIn Ihrer Nähe — vorgeschlagene Orte nahe Ihrem Zuhause oder Ihrer Region, mit Live-Bedingungen. Das ist kein privates Protokoll aller Ihrer Suchen.\n\nBeliebte Suchen — Orte, die auf dieser Seite oft gesucht werden. Auch das ist seitenweit, nicht „Ihr persönlicher Verlauf“.',
      },
      {
        id: 'ui',
        title: 'Wie sich die Karten verhalten',
        body:
          'Jede Spalte zeigt bis zu fünf Karten mit Icon, Temperatur, Beschreibung und Ortsname. Tippen Sie auf eine Karte, um die Stadtseite zu öffnen, wenn Koordinaten vorliegen.',
      },
      {
        id: 'demo-empty',
        title: 'Wenn Beliebte Suchen auf einer neuen Installation voll wirkt',
        body:
          'Haben noch fast niemand gesucht, kann die Seite einige bekannte Demo-Städte in Beliebte Suchen zeigen, damit die Spalte nicht leer ist. Betreiber können diese Demo-Liste abschalten. In Ihrer Nähe hängt weiterhin von Standortsignalen und Daten zu Orten in der Nähe ab.',
      },
      {
        id: 'operators',
        title: 'Für Seitenbetreiber',
        body:
          'Beliebte-Suchen-Daten: GET /api/recent-checks → getRecentChecksPayload() → listPopularSearchChecks auf location_weather_checks (triggers search_select / search_preview), default limit 20, source popular|empty. Die API selbst hydratiert keine Showcases.\n\nUI-Demo-Fallback: wenn die API leer zurückgibt und SHOW_DEMO_POPULAR_SEARCHES true ist (Standard; deaktivieren mit NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0), füllt Beliebte Suchen aus PLATFORM_SHOWCASE_CITIES.\n\nIn Ihrer Nähe: Orte in der Nähe aus dem Home-Standortprofil + current-weather-Batch — nicht die recent-checks-API.\n\nnpm run seed:checks schreibt North-England-weather_snapshots für L2-Cache-Demos; fügt keine suchgetriggerten Check-Zeilen ein und füllt Beliebte Suchen nicht von selbst.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'Prognosen & Cache',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'Für wen diese Seite ist',
        body:
          'Alltagsbesucher können diese Seite überspringen. Sie erklärt, wie die Seite Wetterdaten speichert und aktualisiert — für Betreiber oder Integratoren von meridian. Kurz: Ihr Browser merkt sich eine aktuelle Messung; der Server merkt sich gemeinsame Messungen, damit wir nicht bei jedem Klick den Wetteranbieter aufrufen.',
      },
      {
        id: 'scopes',
        title: 'Wetter-Scopes',
        body:
          'Vom Client anfragbare Scopes: current (jetzt), hourly (Zeitleiste), daily (Zeitleiste), minutely (Niederschlag — nur API; Stadt-Detail lädt minutely heute nicht). Nur-Server-Scopes: geocode (Stadtsuche-Cache mit Schlüssel geocode:{query}), alert (einzelne Warnungs-Payloads). Jeder Wetter-Scope nutzt Cache-Schlüssel {lat},{lon},{scope}; geocode nach Abfragestring.',
      },
      {
        id: 'layers',
        title: 'Cache-Schichten',
        body:
          'L0 — Browser localStorage meridian:weather-cache, Struktur {cityId: {scope: {payload, fetchedAt}}} (Schreiben braucht funktionale Einwilligung). L1 — In-Memory-Map im Serverprozess. L2 — SQLite weather_snapshots mit fetched_at, expires_at, stale_until. Client liest L0, dann API; Server liest L1, dann L2, dann Upstream OpenWeather.',
      },
      {
        id: 'freshness',
        title: 'Frische-Zustände',
        body:
          'fresh — innerhalb expires_at. acceptable — nach expires, aber innerhalb stale_until (kann noch ausgeliefert werden). expired — über stale_until, löst Upstream aus, wenn Quota es erlaubt. emergency — Quota blockiert, aber abgelaufener/akzeptabler L2-Snapshot wird trotzdem ausgeliefert, damit Nutzer noch Daten sehen.',
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
          'Primär: One Call API 4.0 (onecall/current, timeline/1h, timeline/1day, timeline/1min). Current-Scope fällt auf API 2.5 /weather zurück, wenn One Call current fehlschlägt. Geocode nutzt OpenWeather Geocoding API (limit 5). Normalisierung in src/lib/one-call.js liefert konsistente UI-Payloads.',
      },
      {
        id: 'batch',
        title: 'Batch-Abruf',
        body:
          'POST /api/weather/batch akzeptiert { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Scopes sind pro Stadt (city.scopes), kein top-level scopes-Array. Dashboard lädt current + daily zusammen in einem Batch (kein requestIdleCallback). Stadt-Detail batcht nur current + hourly + daily. Der Handler staffelt Städte ~100ms auseinander, um Burst-Rate-Limits zu vermeiden.',
      },
      {
        id: 'headers',
        title: 'Antwort-Metadaten',
        body:
          'API-Antworten enthalten meta: cacheLayer (memory, database, upstream), freshness, fetchedAt, ageMs, upstreamCallAvoided, source. X-Cache-Header spiegelt hit/miss wo zutreffend. „Vor X aktualisiert“ in der UI nutzt meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'Quota-Interaktion',
        body:
          'Sind Tages- oder Minutenlimits überschritten, stoppen Upstream-Aufrufe und emergency-stale L2-Daten werden zurückgegeben, wenn verfügbar. Eine Stadt innerhalb der TTL erneut öffnen kostet null Upstream-Aufrufe.',
      },
      {
        id: 'logging',
        title: 'Cache-Hit-Logging',
        body:
          'L2-Datenbank-Cache-Hits loggen in api_call_log mit cache_hit=1 und erhöhen den täglichen Upstream-Zähler nicht. L1-Speicher-Hits werden ausgeliefert, aber absichtlich nicht in SQLite persistiert — sie feuern bei jedem SSR/Client-Remount und würden meridian.db unter File-Watchern belasten.',
      },
      {
        id: 'payload-fields',
        title: 'Current-Payload-Felder',
        body:
          'temperature, feelsLike, description, condition, icon (OpenWeather code), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'API-Limits',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'Für wen diese Seite ist',
        body:
          'Diese Seite richtet sich an Seitenbetreiber. Besuchte Wetterdaten werden geteilt und cache-freundlich gehalten, damit OpenWeather-Free-Tier-Limits (Standard 1000 Aufrufe/Tag) seltener verbrannt werden.',
      },
      {
        id: 'quota',
        title: 'Tages- und Minuten-Quota',
        body:
          'Defaults aus constants/weather.js: DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 Upstream-Aufrufe pro rollierender Minute. platform_settings kann daily_limit, soft_block_threshold, warning_threshold und per_minute_limit überschreiben (Defaults beim ersten DB-Öffnen gesät). Zähler setzt um UTC-Mitternacht zurück.',
      },
      {
        id: 'status',
        title: 'Statuswerte',
        body:
          'ok — unter Warnschwelle. warning — bei oder über warning_threshold (Standard 800 Aufrufe heute). soft_block — bei oder über soft_block_threshold (Standard 950); Upstream blockiert. hard_block — bei daily_limit (Standard 1000). Minuten-Obergrenze blockiert Upstream ebenfalls, wenn per_minute_limit Aufrufe in den letzten 60 Sekunden stattfanden.',
      },
      {
        id: 'cache-hits',
        title: 'Cache-Hits vs. Upstream',
        body:
          'L2-Datenbank-Hits loggen in api_call_log mit cache_hit=1 und erhöhen den täglichen Upstream-Zähler nicht. L1-Speicher-Hits werden nicht in SQLite geloggt — recordCacheHit kehrt früh zurück, wenn meta.layer memory ist. Nur erfolgreiche Upstream-OpenWeather-Aufrufe (Status 200, cache_hit=0) zählen zur Quota. Emergency-stale liefert ohne Upstream, wenn blockiert.',
      },
      {
        id: 'admin-shortcut',
        title: 'Admin-Diagnose',
        body:
          'Öffnen Sie /admin (nach Anmeldung) für heute genutzt / Tageslimit, verbleibend, Status und Aktualisierungsintervall-Einstellungen. API: GET /api/admin/usage.',
      },
      {
        id: 'admin-api',
        title: 'Admin-API',
        body:
          'GET /api/admin/usage — Quota-Snapshot und letzte Aufrufe. GET|PATCH /api/admin/config — primäre Admin-Einstellungs-API (Aktualisierungsintervall, Connectors, Digest-Defaults, AdSense, Warnungs-Toggles usw.). Schmales Legacy: PATCH /api/admin/settings { refreshIntervalMs }. Auth: HttpOnly-Session-Cookie meridian_admin_session nach /login. Signatur-Geheimnis ist ADMIN_SECRET (nicht ADMIN_PASSWORD). Dev-Bypass bei NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 und ADMIN_SECRET unset.',
      },
      {
        id: 'openweather',
        title: 'OpenWeather-Anbieterlimits',
        body:
          'meridian trackt seinen eigenen Upstream-Zähler; OpenWeather kann Schlüssel unabhängig rate-limiten oder ablehnen (401, 429). Der Orchestrator mappt diese auf strukturierte API-Fehler für den Client.',
      },
      {
        id: 'emergency',
        title: 'Notfallmodus',
        body:
          'Bei soft/hard block sehen Nutzer weiterhin den letzten akzeptablen SQLite-Snapshot mit freshness emergency statt eines leeren Fehlers — außer es gab nie einen Snapshot für diese Koordinate.',
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
          'Diese Seite richtet sich an Entwickler und Betreiber, die meridian-APIs integrieren — Alltagsbesucher können sie überspringen. Alle API-Routen sind Next.js App Router Handler unter src/app/api/. Wetter und Geocode brauchen OPENWEATHER_API_KEY. Cron-Routen brauchen Authorization: Bearer CRON_SECRET. Admin-Routen brauchen authentifiziertes Admin-Session-Cookie (meridian_admin_session) nach Anmeldung unter /login, außer ALLOW_DEV_ADMIN_BYPASS greift in der Entwicklung.',
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
          'Body: { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Liefert { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. Scopes sind pro Stadt, kein top-level Array. Rate-Limit 20 Anfragen/Minute pro IP. Genutzt von Dashboard- und Stadt-Detail-Hooks.',
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
          'Keine Parameter. Liefert { checks, source }, wobei source popular ist, wenn suchgetriggerte Zeilen existieren, oder empty wenn keine. Standard limit 20 aus location_weather_checks nach Suchvolumen (search_select und search_preview triggers). API hat keinen Showcase-Fallback — die Home-UI kann trotzdem Demo-Beliebte-Städte zeigen, wenn leer und SHOW_DEMO_POPULAR_SEARCHES an ist. Spalte In Ihrer Nähe nutzt diese Route nicht.',
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
          'GET /api/cron/weekly-digests — wöchentliche Digest-E-Mails nach Abonnenten-E-Mail gruppieren und senden. GET /api/cron/weather-alerts — alertPrefs gegen OpenWeather, Open-Meteo und NWS-Feeds prüfen und Warn-E-Mails senden. Beide brauchen Bearer CRON_SECRET.',
      },
      {
        id: 'admin',
        title: 'Admin-Routen',
        body:
          'Nutzung und Config: GET /api/admin/usage; GET|PATCH /api/admin/config; Legacy PATCH /api/admin/settings { refreshIntervalMs }. Nutzer und Auth: GET|POST /api/admin/users; POST /api/admin/users/invite; GET /api/admin/me. Daten: GET /api/admin/checks; GET /api/admin/locations; GET|PATCH /api/admin/subscriptions; GET /api/admin/mailing-summary; GET /api/admin/analytics. Connectors: GET|PATCH /api/admin/connections; GET|PATCH /api/admin/openweather-key; GET|PATCH /api/admin/email-key. E-Mail-CMS: GET|POST|PATCH /api/admin/email-templates; POST /api/admin/email/test, /compose, /sync. AdSense: GET /api/admin/adsense/report; POST /api/admin/adsense/sync; OAuth GET /api/admin/adsense/oauth/start, /callback, /disconnect. CMS: GET|PATCH /api/admin/cms-pages. Alle brauchen meridian_admin_session außer Dev-Bypass.',
      },
      {
        id: 'ads',
        title: 'Ads-Routen',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — Platzierungs-Config mit slotId wenn gesetzt. GET /api/ads/placeholder-bg — Hero-Lookup für Platzhalterflächen. App-Route GET /ads.txt — AdSense-Publisher-Zeile aus env. Aktive AdSlot-Platzierungen: dashboard, hero, city-detail. recent-checks-Slot-env existiert, Home hat keinen AdSlot.',
      },
      {
        id: 'other',
        title: 'Weitere öffentliche Routen',
        body:
          'GET /api/platform/limits — öffentlicher Quota-Snapshot. POST /api/analytics/collect — First-Party-Analytics-Beacon. GET /api/location/region — IP/Region-Helfer. POST /api/weather/inaccurate-report — schlechte Daten melden. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — OSM-Hero-Overlay-Kacheln. Auth: POST /api/auth/login, /logout; POST /api/auth/forgot-password; POST /api/auth/reset-password/[token]; GET|POST /api/auth/invite/[token]; GET /api/auth/session.',
      },
      {
        id: 'errors',
        title: 'Fehlerform',
        body:
          'JSON-Fehler typischerweise { error: code, message: string }. ApiError-Codes u. a. invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error, unauthorized, not_found, limit_reached.',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'Deployment & Umgebung',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'Für wen diese Seite ist',
        body:
          'Diese Seite richtet sich an Personen, die meridian deployen. Alltagsbesucher brauchen diese Einstellungen nicht. Eine funktionierende Demo braucht nur OPENWEATHER_API_KEY; alles andere ist optionaler Stretch.',
      },
      {
        id: 'env-required',
        title: 'Erforderliche Umgebung',
        body:
          'OPENWEATHER_API_KEY — erforderlich für Wetter und Geocode. DATABASE_PATH — SQLite-Datei (Standard ./data/meridian.db); in Produktion persistentes Volume, damit Cache und Abonnements Neustarts überleben. NEXT_PUBLIC_SHOW_HOME_STRETCH=0 blendet Dashboard-Anzeige + Journal aus (standardmäßig an). NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 deaktiviert Demo-Beliebte-Städte, wenn die API leer ist.',
      },
      {
        id: 'env-hero',
        title: 'Hero-Bild-Umgebung',
        body:
          'UNSPLASH_ACCESS_KEY — optional; erster Fotoanbieter für Standort-Heroes (nur Server, gecacht in hero_image_cache). PEXELS_API_KEY — optional dritter Anbieter nach Unsplash und Wikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — auf 0 setzen, um Satellitenkarten-Header zu deaktivieren (Standard an). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — Opt-in Google Street View, wenn OSM aus. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — optional Maps Embed API Key für Street-View-Iframes.',
      },
      {
        id: 'env-email',
        title: 'E-Mail-Umgebung',
        body:
          'Multi-ESP über aktiven Connector in platform_settings (Admin-Auswahl): Resend (RESEND_API_KEY, RESEND_FROM_EMAIL), SendGrid (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL), Amazon SES (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION, AWS_SES_FROM_EMAIL) oder SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_SECURE). NEXT_PUBLIC_APP_URL — Basis-URL für Abmelde-Links in E-Mails (in .env.example; in Produktion erforderlich).',
      },
      {
        id: 'env-cron',
        title: 'Cron und Admin',
        body:
          'CRON_SECRET — Bearer für /api/cron/* (verweigert wenn unset in Produktion). ADMIN_SECRET — signiert Admin-Session-Cookie und verschlüsselt Connector-Geheimnisse. ADMIN_PASSWORD — Root-Login nur für ADMIN_EMAIL. Dev-Bypass nur bei NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 und ADMIN_SECRET unset. Siehe docs/SECURITY.md. Cron extern planen: weekly-digests (z. B. Montagmorgen), weather-alerts (z. B. alle 15–30 Minuten).',
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
          'dev, build, start — Next.js. lint, test, test:watch, verify — Qualitätsgate (verify = lint + test + build). copy:icons — Meteocons nach public (auch postinstall). seed:checks — North-England-Demo-Snapshots. backfill:city-slugs — city_slug auf bestehenden locations füllen. email — React-Email-Vorschau-Server. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'SQLite-Tabellen',
        body:
          'Kern-Wetter: weather_snapshots, api_call_log. Orte und Checks: locations, location_weather_checks, weather_observations, weather_forecast_archive. Abonnements: subscriptions, subscription_send_log. Plattform: platform_settings (Singleton). Heroes: hero_image_cache. Monetarisierung: adsense_report_snapshots. Analytics: site_analytics_events. E-Mail/CMS: email_templates, cms_pages. Admin: admin_users, admin_invites, admin_password_resets, admin_audit_log. Schema in src/lib/db/index.js. Erstes Öffnen säht platform_settings mit refresh 1h, stale 2h, daily limit 1000, soft block 950, warning 800, per-minute 60.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js schreibt docs.localhost-Host auf /docs um für lokale Dokumentations-Subdomain. Keine Auth-Middleware auf Haupt-App-Routen.',
      },
      {
        id: 'localstorage-keys',
        title: 'Browser-Speicher-Schlüssel',
        body:
          'Aus storage-keys.js: meridian:client-id, meridian:saved-cities, meridian:checked-cities, meridian:user-location, meridian:weather-cache, meridian:theme, meridian:cookie-consent, meridian:subscriptions, meridian:tier (reserviert), meridian:consent, meridian:accessibility, meridian:city-detail-accordion, meridian:temperature-unit, meridian:preferred-locale, meridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — First-Party-Analytics-Session-ID. Admin-Cookie meridian_admin_session (HttpOnly, server-set). Custom-Event meridian:storage synchronisiert Hooks nach Schreibvorgängen.',
      },
    ],
  },
];
