/** German journal posts — same ids/hrefs/imageUrls as HOME_BLOG_POSTS. */
export const BLOG_POSTS_I18N = [
  {
    id: 'reading-hourly-forecasts',
    title: 'Stundenprognosen lesen, ohne sich zu verzetteln',
    excerpt:
      'Temperatur, Regenwahrscheinlichkeit und Böen kommen stündlich — was zuerst zählt, wenn Sie den Nachmittag planen.',
    category: 'Leitfäden',
    dateLabel: '12. Jul 2026',
    dateIso: '2026-07-12',
    href: '/journal/reading-hourly-forecasts',
    imageUrl:
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Sonnenlicht bricht durch Wolken über einer Küstenlandschaft',
    body: [
      'Ein Stundenstreifen wirkt auf den ersten Blick voll: jede Spalte stapelt Temperatur, Himmel-Icon, Niederschlagschance und oft Wind. Der Trick ist zu entscheiden, wofür der Nachmittag ist — draußen, unterwegs oder drinnen — und nur die Spalten zu lesen, die diesen Plan ändern.',
      'Beginnen Sie mit Niederschlagswahrscheinlichkeit und Intensität zusammen. 40 % leichte Nieselregen verderben selten einen Spaziergang; dieselbe Chance mit starken Schauern schon. Prüfen Sie dann den Temperaturtrend über die nächsten vier bis sechs Stunden statt eines einzelnen Peaks: Abkühlung nach warmem Mittag zählt für den Abend mehr als das Absolute Maximum.',
      'Böen sind der dritte Filter. Gleichmäßiger Wind fühlt sich anders an als scharfe Böen beim Radfahren oder an offenen Küsten. Auf meridian zuerst die verdichtete Next-hour-Zeile scannen, dann den breiteren Hourly-Tab für ein längeres Fenster.',
      'Wenn Zahlen noch rauschen, wählen Sie eine Entscheidung — bis 15 Uhr los oder warten — und fragen, ob irgendeine Stunde danach diese Entscheidung klar bricht. Den Rest können Sie ungelesen lassen.',
    ],
  },
  {
    id: 'ten-day-outlook',
    title: 'Was ein 10-Tage-Ausblick kann — und was nicht',
    excerpt:
      'Je weiter weg, desto unsicherer. Wie meridian Nah-Detail und geschätzte Tage jenseits des kostenlosen OpenWeather-Fensters trennt.',
    category: 'Prognosen',
    dateLabel: '10. Jul 2026',
    dateIso: '2026-07-10',
    href: '/journal/ten-day-outlook',
    imageUrl:
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Gewitterblitze über einer Stadtskyline bei Nacht',
    body: [
      'Eine 10-Tage-Ansicht hilft beim Packen und Wochenendplanen, ist aber kein Vertrag. Modelle stimmen am Tag zwei eher überein als am Tag neun, und kostenlose Upstream-Feeds enden oft vor einer vollen Hochauflösung über zehn Tage.',
      'Auf meridian tragen Nah-Tage reichere Details aus dem One-Call-Feed. Weiter draußen kann ein erweiterter Tageshorizont den Kalender strukturieren und zugleich ehrlich bleiben, was das Free-Fenster von OpenWeather wirklich liefert.',
      'Behandeln Sie das ferne Ende als Richtung: wärmer oder kühler als heute, nasserer Muster oder nicht — nicht als präzises Schauer-Timing. Kurz vor dem Datum neu laden, wenn aus dem Plan eine Buchung wird.',
      'City detail hält Today-, Hourly- und Daily-Tabs getrennt, damit Sie in nutzbare Sicherheit zoomen und zur längeren Leiste zurücktreten, wenn Sie nur ein grobes Wochengefühl brauchen.',
    ],
  },
  {
    id: 'pinning-locations',
    title: 'Städte anheften, die auf dem Dashboard zählen',
    excerpt:
      'Jeden Ort weltweit prüfen, eine kurze Liste lokal speichern und Live-Bedingungen auf einen Blick halten — ohne Konto.',
    category: 'Produkt',
    dateLabel: '8. Jul 2026',
    dateIso: '2026-07-08',
    href: '/journal/pinning-locations',
    imageUrl:
      'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Reisekarte mit Pins für Städte',
    body: [
      'Meridian ist für eine kurze Liste echter Orte gebaut — Zuhause, Büro, Familie, nächste Reise — nicht für einen zweiten Wetter-Social-Feed. Beliebige Stadt weltweit suchen, Detailseite öffnen und zurück unter Your Locations anheften.',
      'Pins leben im Browser über localStorage. Das hält die Free-Tier-Demo ehrlich: keine Account-Mauer, die Liste kehrt nach Reload auf demselben Gerät zurück. Site-Daten löschen löscht Pins — so gewollt für diesen Stack.',
      'Recent checks sitzen neben Pins, damit Einmal-Lookups die gespeicherte Tafel nicht überfüllen. Allow Location im Hero, wenn das Dashboard um Ihren Standort zentrieren soll; alles andere anheften, was sichtbar bleiben soll.',
      'Wirkt eine Karte veraltet, diese Stadt refreshen statt der ganzen Seite — wir cachen mit Rate-Limits im Blick, damit der gemeinsame OpenWeather-Schlüssel einen Demo-Tag übersteht.',
    ],
  },
  {
    id: 'alerts-digests',
    title: 'E-Mail-Digests und Unwetterwarnungen erklärt',
    excerpt:
      'Wöchentliche Zusammenfassungen in ruhigen Wochen, Standort-Alerts bei Schwellen — Free-Tier-E-Mail ohne Inbox-Flut.',
    category: 'Alerts',
    dateLabel: '5. Jul 2026',
    dateIso: '2026-07-05',
    href: '/journal/alerts-digests',
    imageUrl:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Bergkamm unter dramatischem Sturmlichlicht',
    body: [
      'Nicht jedes Postfach will einen Mittags-Puls. Meridian trennt ruhige Digests von schwellenbasierten Alerts, damit Sie eine Wochenzusammenfassung abonnieren können, ohne jeden Nachmittag Sturmtheater.',
      'Digests sammeln einen kurzen Ausblick für verfolgte Orte. Alerts feuern, wenn konfigurierte Bedingungen — Regen, Wind, Temperatur-Bänder — Ihre Grenzen überschreiten, über denselben Auswertungspfad wie der Admin-Weather-Check-Cron.',
      'Free-Tier-Mailer haben Sendellimits. Templates bleiben leicht, Shortcodes füllen ortsspezifische Wettervariablen, Connectoren liegen im Admin-E-Mail-Panel, damit Demos SMTP oder API-Keys tauschen können, ohne Produktseiten umzuschreiben.',
      'Unsubscribe und ehrliche Präferenzen zählen so sehr wie der Inhalt: bei zu vielen Alerts Schwellen senken oder die Liste pausieren statt das Produkt aufzugeben.',
    ],
  },
  {
    id: 'rate-limits',
    title: 'Innerhalb der OpenWeather-Free-Tier-Limits bleiben',
    excerpt:
      'Caching, Refresh-Fenster und warum meridian Upstream nicht bei jedem Tab-Klick hammeriert — praxisnahe Raten für einen geteilten Demo-Key.',
    category: 'Engineering',
    dateLabel: '2. Jul 2026',
    dateIso: '2026-07-02',
    href: '/journal/rate-limits',
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Abstrakte Globus- und Datennetz-Visualisierung',
    body: [
      'OpenWeathers Free-Tier ist großzügig für eine fokussierte Demo und fragil, wenn jeder Hover ein Netzwerkanruf wird. Meridian behandelt den Key als gemeinsames Budget: Wetter-Payloads cachen, Refreshes entprellen, lokal formatieren, wenn nur Einheiten oder Tabs wechseln.',
      'Stadt-Karten und Detailseiten nutzen geladene Snapshots wo möglich. Manueller Refresh, wenn Sie wissen, dass sich Bedingungen ändern; Hintergrund-Polls bleiben konservativ, damit das Free-Tier-Kontingent den Tag überhält.',
      'Geocode und One Call zählen in der Praxis getrennt — Tippfehler in der Suche sollen keinen vollen Wetterzug kosten. Fehlgeschlagene Upstream-Antworten werden als ehrliche UI-Fehler statt stiller Retry-Schleifen gezeigt.',
      'Für Heavy-Traffic-Forks sind die ersten Upgrades privater Key, stärkerer Server-Cache und weniger Showcase-Prefetch — nicht das Entfernen der Rate-Limit-Achtsamkeit, die diesen Code geprägt hat.',
    ],
  },
  {
    id: 'weather-icons',
    title: 'Von OpenWeather-Codes zu Meteocons auf meridian',
    excerpt:
      'Warum lokale SVG-Wettericons schneller laden, wie Condition- und Metric-Icons zuordnen, und was Sie sehen, wenn Upstream-Symbole wechseln.',
    category: 'Design',
    dateLabel: '28. Jun 2026',
    dateIso: '2026-06-28',
    href: '/journal/weather-icons',
    imageUrl:
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Regen auf einer Stadtstraße mit Schirm',
    body: [
      'Upstream-Icon-Codes sind nützliche Schlüssel, kein Artwork. Meridian mappt OpenWeather-Condition-IDs auf lokale Meteocon-SVGs, damit Karten scharf auf Retina bleiben und offline weiterlaufen, sobald Assets cached sind.',
      'Condition-Icons (klar, Regen, Donner) sitzen neben Metric-Glyphs für Feuchte, Wind, UV und Druck. Beide Familien in `/public/weather-icons` vermeiden einen CDN-Hop bei jeder Stadtkarte.',
      'Wenn OpenWeather Codes hinzufügt oder umbenennt, ist die Mapping-Schicht der einzige Update-Ort — UI-Komponenten behalten stabile lokale Namen. Fehlende Codes fallen auf neutrales cloudy statt kaputtem Bild zurück.',
      'Ziel ist glanceable Wetter in derselben visuellen Sprache über Hero, Grid und City detail — nicht pixelgenaue Klone der OpenWeather-Raster-Sprites.',
    ],
  },
];
