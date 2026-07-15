const terms = {
  slug: 'terms',
  title: 'Nutzungsbedingungen',
  lastUpdated: '2026-07-14',
  sections: [
    {
      id: 'who-we-are',
      title: 'Wer wir sind',
      body:
        'meridian ist ein Handelsname von Website Servers Ltd, einem in England und Wales unter der Unternehmensnummer 17240780 eingetragenen Unternehmen mit Sitz in Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR.\n\nDiese Nutzungsbedingungen regeln Ihren Zugang zu und die Nutzung des meridian-Wetterdienstes unter meridianweather.co.uk (der „Dienst“). Mit der Nutzung des Dienstes erklären Sie sich mit diesen Bedingungen einverstanden. Wenn Sie nicht einverstanden sind, nutzen Sie den Dienst nicht.\n\nDie Website unserer Muttergesellschaft ist websiteservers.co.uk. Zu Datenschutzfragen siehe unsere Datenschutzerklärung und Cookie-Richtlinie. Fragen zu diesen Bedingungen: privacy@meridianweather.co.uk.',
    },
    {
      id: 'service',
      title: 'Der Dienst',
      body:
        'meridian bietet Wettermoditoring für mehrere Städte, Prognosen, optionale E-Mail-Zusammenfassungen und Wetterwarnungen, Dokumentation sowie verwandte Funktionen. Prognose- und Beobachtungsdaten werden von Drittanbietern für Wetterdaten geliefert (hauptsächlich OpenWeather) und können unvollständig, ungenau, verzögert oder nicht verfügbar sein.\n\nDer Dienst dient ausschließlich der Information. Verlassen Sie sich nicht auf meridian für sicherheitskritische Entscheidungen, Notfallplanung, Luftfahrt, Schifffahrt oder Situationen, in denen ein Ausfall von Wetterdaten Schaden verursachen könnte. Befolgen Sie stets die Hinweise der offiziellen meteorologischen und Notfalldienste in Ihrer Region.',
    },
    {
      id: 'browser-only',
      title: 'Konten und Browser-Speicher',
      body:
        'Öffentliche Nutzer benötigen kein meridian-Konto. Gespeicherte Städte, Anzeigeeinstellungen, Barrierefreiheitseinstellungen und ähnliche Wahloptionen werden in Ihrem Browser gespeichert (localStorage und verwandter Client-Speicher). Sie werden nicht über Browser oder Geräte hinweg synchronisiert, es sei denn, Sie richten sie erneut selbst ein.\n\nMitarbeiter und Betreiber können separate Administratorkonten zur Betriebsführung der Plattform nutzen. Diese Konten unterliegen internen Zugangskontrollen und sind keine Verbraucherkonten.',
    },
    {
      id: 'tiers',
      title: 'Kostenlose Stufe, Werbung und Premium',
      body:
        'Der Dienst wird in einer kostenlosen Stufe angeboten, die Werbung anzeigen kann (einschließlich Google AdSense), wenn Werbung konfiguriert ist und Sie – soweit erforderlich – eingewilligt haben. Premium-Funktionen, die im Produkt beschrieben sind (zum Beispiel werbefreie Nutzung oder zusätzliche Prognosedetails), können in der Oberfläche erscheinen, jedoch ist die kostenpflichtige Abrechnung (einschließlich Stripe) noch nicht live. Bis die Abrechnung aktiviert ist, können „Premium“- oder Upgrade-Steuerungen nicht verfügbar oder deaktiviert sein.\n\nWir können die Verfügbarkeit von Funktionen, Ratenlimits, Caching oder Werbeplatzierungen ändern, um Upstream-Kontingente und die Stabilität des Dienstes zu schützen.',
    },
    {
      id: 'email',
      title: 'E-Mail-Abonnements',
      body:
        'Wenn Sie den Newsletter, wöchentliche Zusammenfassungen oder Wetterwarnungen abonnieren, müssen Sie eine gültige E-Mail-Adresse angeben und für jeden gewünschten Abonnementtyp eine Einwilligung erteilen. Jede E-Mail enthält eine Abmeldemöglichkeit. Wir können den Versand pausieren oder einstellen, wenn die Zustellung wiederholt fehlschlägt oder die Nutzung missbräuchlich erscheint.\n\nAbonnementdaten werden wie in unserer Datenschutzerklärung beschrieben verarbeitet.',
    },
    {
      id: 'acceptable-use',
      title: 'Zulässige Nutzung',
      body:
        'Sie dürfen nicht: unsere APIs missbrauchen oder überlasten; Schlüssel oder Prognosedaten in großen Mengen scrapen, kopieren oder weitergeben; übermäßige Upstream-Wetteranfragen automatisieren; versuchen, den Dienst zu stören, Sicherheitskontrollen zu reverse-engineern oder unbefugt Zugriff auf Admin-Systeme zu erlangen; den Dienst für rechtswidrige Zwecke nutzen; oder eine Zugehörigkeit zu Website Servers Ltd oder meridian falsch darstellen.\n\nWir können den Zugang aussetzen oder einschränken, wenn er dem Dienst, anderen Nutzern oder unseren Anbietern schadet.',
    },
    {
      id: 'api-dependency',
      title: 'Abhängigkeiten von Drittanbietern',
      body:
        'Die Verfügbarkeit hängt von Dritten ab, darunter Anbieter von Wetterdaten, E-Mail-Zustellungsdienste, Werbe- und Analyse-Netzwerke (wenn aktiviert und eingewilligt), Bildanbieter für regionale Hero-Bilder, Hosting-Infrastruktur und Geolocation-Hilfen. Wir können zwischengespeicherte Daten ausliefern, Aktualisierungen drosseln oder Funktionen einschränken, wenn Kontingente oder Ausfälle dies erfordern.\n\nDie Nutzungsbedingungen und Datenschutzhinweise der Drittanbieter gelten für deren Dienste; wir sind nicht für deren Inhalte oder Verfügbarkeit verantwortlich.',
    },
    {
      id: 'intellectual-property',
      title: 'Geistiges Eigentum',
      body:
        'Der Name meridian, die Markenauftritte, das Seitendesign, die Dokumentation und die ursprüngliche Software gehören Website Servers Ltd oder ihren Lizenzgebern. Wettersymbole, Prognosedaten, Karten und andere Materialien von Drittanbietern unterliegen weiterhin den Rechten ihrer Eigentümer.\n\nSie dürfen den Dienst für die persönliche, nicht kommerzielle Wetterüberwachung nutzen. Sie dürfen keine wesentlichen Teile des Dienstes kopieren, für den Weiterverkauf scrapen oder Eigentumshinweise ohne vorherige schriftliche Erlaubnis entfernen.',
    },
    {
      id: 'age',
      title: 'Alter',
      body:
        'Der Dienst richtet sich an Erwachsene und verantwortungsbewusste ältere Jugendliche. Wenn Sie unter 13 Jahre alt sind (oder unter dem digitalen Einwilligungsalter in Ihrem Land, das im Vereinigten Königreich für die meisten Online-Dienste bei 13 Jahren liegt und andernorts höher sein kann), sollten Sie Funktionen, die personenbezogene Daten erheben – etwa E-Mail-Abonnements – ohne angemessene Beteiligung eines Elternteils oder Erziehungsberechtigten nicht nutzen. Wir vermarkten den Dienst wissentlich nicht an Kinder.',
    },
    {
      id: 'liability',
      title: 'Haftungsausschlüsse und Haftung',
      body:
        'Der Dienst wird „wie besehen“ und „wie verfügbar“ ohne Gewährleistung der Genauigkeit, Vollständigkeit, Verfügbarkeit oder Eignung für einen bestimmten Zweck bereitgestellt, soweit dies gesetzlich zulässig ist.\n\nNichts in diesen Bedingungen schließt die Haftung für Tod oder Körperverletzung durch Fahrlässigkeit, Betrug oder eine sonstige Haftung aus oder beschränkt sie, soweit sie nach englischem Recht nicht beschränkt werden kann. Vorbehaltlich dessen haften Website Servers Ltd und ihre Organe nicht für Entscheidungen, die allein auf Prognosedaten beruhen, für mittelbare oder Folgeschäden oder für Datenverluste, die entstehen, weil Sie den Browser-Speicher gelöscht oder die Einwilligung widerrufen haben.\n\nWenn Sie Verbraucher im Vereinigten Königreich oder in der EU sind, behalten Sie alle zwingenden gesetzlichen Rechte, auf die nicht verzichtet werden kann.',
    },
    {
      id: 'changes',
      title: 'Änderungen',
      body:
        'Wir können diese Bedingungen aktualisieren, wenn sich der Dienst oder das Recht ändert. Das Datum „Zuletzt aktualisiert“ am Anfang dieser Seite ändert sich entsprechend. Die fortgesetzte Nutzung nach Veröffentlichung gilt als Annahme der geänderten Bedingungen für die künftige Nutzung. Wesentliche Änderungen in der Verarbeitung personenbezogener Daten spiegeln sich auch in der Datenschutzerklärung und der Cookie-Richtlinie wider.',
    },
    {
      id: 'governing-law',
      title: 'Anwendbares Recht',
      body:
        'Diese Bedingungen unterliegen dem Recht von England und Wales. Die Gerichte von England und Wales haben ausschließliche Zuständigkeit, es sei denn, Verbraucher im Vereinigten Königreich oder in der EU können Ansprüche vor ihren Heimatgerichten geltend machen, soweit zwingendes lokales Recht dies verlangt.\n\nDiese Seiten sind Produktpolitik für meridian und ersetzen keine unabhängige Rechtsberatung.',
    },
  ],
};

const privacy = {
  slug: 'privacy',
  title: 'Datenschutzerklärung',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'who-we-are',
      title: 'Wer wir sind',
      body:
        'Website Servers Ltd („wir“, „uns“) ist der für die Datenverarbeitung Verantwortliche für meridian, einen Handelsnamen des Unternehmens. Wir sind in England und Wales unter der Unternehmensnummer 17240780 eingetragen. Eingetragener Sitz: Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR.\n\nProduktwebsite: meridianweather.co.uk. Gruppenwebsite: websiteservers.co.uk. Datenschutzkontakt: privacy@meridianweather.co.uk.\n\nDiese Erklärung erläutert, wie wir personenbezogene Daten verarbeiten, wenn Sie meridian nutzen. Sie ist an die UK GDPR und den Data Protection Act 2018 angelehnt und soll Besuchern außerhalb des Vereinigten Königreichs klare Hinweise geben. Es handelt sich um Produktpolitik, nicht um Rechtsberatung.',
    },
    {
      id: 'overview',
      title: 'Überblick',
      body:
        'Sie benötigen kein öffentliches Konto, um meridian zu nutzen. Die meisten Stadtlistern und Anzeigeeinstellungen verbleiben in Ihrem Browser. Unsere Server verarbeiten Wetteranfragen, optionale E-Mail-Abonnements, First-Party-Nutzungsanalysen, Standort-Hinweise zur Anpassung der Erfahrung und (nur für Mitarbeiter) Administratorkonten.\n\nWir verkaufen keine personenbezogenen Daten. Optionale Werbung (Google AdSense) und optionales Google Analytics werden nur geladen, wenn die jeweilige Einwilligungskategorie aktiviert und die Funktion konfiguriert ist.',
    },
    {
      id: 'data-we-collect',
      title: 'Daten, die wir erheben',
      body:
        'Browser / Gerät (typischerweise über localStorage oder sessionStorage): anonyme Client-ID (UUID, die optionale Abonnements mit diesem Browser verknüpft); gespeicherte Städte und kürzliche Suchen (Namen, Regionen, Koordinaten); Standortprofil (ungefähre oder genaue Koordinaten, Bezeichnung, Quelle wie IP, GPS oder bestätigte Auswahl sowie Prüfhistorie); Wetter-Cache; Theme, Temperatureinheit, Locale, Barrierefreiheitseinstellungen, Wetter-Aktualisierungseinstellungen; Einwilligungs- und Cookie-Banner-Flags; lokale Spiegelung der E-Mail-Abonnementpräferenzen; optionale Journal-Kommentarentwürfe, die nur auf Ihrem Gerät gespeichert werden; Analyse-Sitzungs-ID in sessionStorage.\n\nServer bei Opt-in oder Interaktion: E-Mail-Adresse; Abonnementtyp (Newsletter, wöchentliche Stadt-Zusammenfassung, Stadt-Warnungen); Stadtname und Koordinaten für Städte-E-Mails; Alert-Präferenz-JSON; Abmeldetokens; Wetterschnappschüsse und API-Diagnoseprotokolle, die vorwiegend nach Koordinaten und Anfrage-Metadaten und nicht nach Ihrem Namen verschlüsselt sind.\n\nStandortsignale: Browser-Geolocation nur, wenn Sie sie zulassen und eine funktionale Einwilligung erteilt ist; ungefähre Region aus CDN- oder Hosting-Headern, sofern verfügbar; Fallback-IP-Geolocation über ipwho.is, wenn nötig, um eine Heimatregion vorzuschlagen.\n\nFirst-Party-Analysen: Seitenpfad, Sitzungskennung, Verweildauer, Scrolltiefe und Ad-Slot-View-Ereignisse, die in unserer Datenbank zur Produktverbesserung und zum Betrieb gespeichert werden. Admin-Dashboard-Routen sind von diesem Beacon ausgeschlossen.\n\nMitarbeitersysteme: Admin-E-Mail, Anzeigename, Passwort-Hash, Einladungs- und Passwort-Reset-Tokens, Sitzungs-Cookie und Audit-Protokolle administrativer Aktionen. Die Plattformkonfiguration kann API-Zugangsdaten von Drittanbietern enthalten, die zum Betrieb des Dienstes verwendet werden.',
    },
    {
      id: 'legal-bases',
      title: 'Warum wir Daten nutzen (Zwecke und Rechtsgrundlagen)',
      body:
        'Bereitstellung des Wetterdienstes und Sicherheit (einschließlich anonymer Client-ID, wesentlicher Einstellungen, Wetter-Proxys und Missbrauchsprävention): berechtigte Interessen (UK GDPR Art. 6(1)(f)) und, soweit die Speicherung für einen von Ihnen angeforderten Dienst zwingend erforderlich ist, Vertragserfüllung (Art. 6(1)(b)).\n\nOptionale funktionale Funktionen wie Schreiben in den Wetter-Cache und präzises GPS, wenn Sie diese wählen: Einwilligung (Art. 6(1)(a)), gesteuert über unsere Cookie-Richtlinie und das Präferenzzentrum.\n\nE-Mail-Zusammenfassungen und Warnungen: Einwilligung / Opt-in pro Abonnementtyp (Art. 6(1)(a)); Sie können über Abmeldelinks widerrufen.\n\nWerbung und Google Analytics, wenn aktiviert: Einwilligung (Art. 6(1)(a)).\n\nFirst-Party-Analysen zum Verständnis der Site-Nutzung und der Anzeigenauslieferung: berechtigte Interessen am Betrieb und an der Verbesserung des Dienstes; soweit PECR für nicht wesentliche Speicherung oder Zugriffe eine Einwilligung verlangt, stimmen wir die Steuerungen mit unseren Einwilligungskategorien ab und werden die Freigabe weiter verfeinern, wenn das Produkt reift.\n\nMitarbeiteradministration: berechtigte Interessen und, soweit anwendbar, Vertrag mit dem Betreiber.',
    },
    {
      id: 'cookies-consent',
      title: 'Cookies und ähnliche Technologien',
      body:
        'Beim öffentlichen Browsen wird eher Browser-Speicher als klassische First-Party-Cookies genutzt. Werbe- und optionale Analysepartner können eigene Cookies setzen, wenn Sie einwilligen. Eine vollständige Übersicht und PECR-Steuerungen finden Sie in unserer Cookie-Richtlinie. Sie können Ihre Wahl über die Einstellungssteuerung (Datenschutz- / Cookie-Präferenzen) oder das Cookie-Banner ändern oder widerrufen.',
    },
    {
      id: 'third-party',
      title: 'Mit wem wir Daten teilen',
      body:
        'Auftragsverarbeiter und Anbieter, die uns beim Betrieb von meridian helfen, können begrenzte Daten erhalten, soweit erforderlich: OpenWeather (Koordinaten, Suchanfragen, Locale) für Wetter und Geocoding; Open-Meteo und der US National Weather Service für bestimmte Warnungen; ipwho.is für IP-basierte Regionshinweise; E-Mail-Anbieter wie Resend oder SendGrid (und andere, falls aktiviert) für transaktionale und Abonnement-Mails; Google (AdSense und, falls konfiguriert, Google Analytics), wenn Sie einwilligen; optionale Hero-Bild-Anbieter (zum Beispiel Unsplash, Wikimedia oder Pexels) mit Regions- oder Wahrzeichen-Suchbegriffen; Hosting- und CDN-Anbieter, die IP-Adressen und Anfrage-Metadaten sehen können.\n\nWir verkaufen keine personenbezogenen Daten und lizenzieren keine identifizierbaren Surfprofile an Dritte zu deren eigenen Marketingzwecken.',
    },
    {
      id: 'international',
      title: 'Internationale Übermittlungen',
      body:
        'Einige Anbieter haben ihren Sitz außerhalb des Vereinigten Königreichs (einschließlich in den Vereinigten Staaten oder anderen Ländern). Soweit UK GDPR auf eine Übermittlung Anwendung findet, stützen wir uns auf Angemessenheitsbeschlüsse, soweit verfügbar, oder auf geeignete Garantien wie die Standardvertragsklauseln / den UK-Addendum des Lieferanten zusammen mit den Anbieterbedingungen. Anfragen an privacy@meridianweather.co.uk können um weitere Informationen zu Garantien für eine bestimmte Übermittlung bitten.',
    },
    {
      id: 'retention',
      title: 'Speicherdauer',
      body:
        'Browserdaten bleiben bestehen, bis Sie Site-Daten löschen, die funktionale Einwilligung widerrufen (wodurch bestimmte funktionale Speicher freigegeben werden) oder Einstellungen überschreiben.\n\nE-Mail-Abonnements bleiben bestehen, bis Sie sich abmelden oder wir sie nach fehlgeschlagener Zustellung oder einem gültigen Löschungsantrag löschen.\n\nEinträge im Wetter-Cache verfallen gemäß Server-TTLs. Diagnose-API-Protokolle und First-Party-Analyseereignisse werden für den Betrieb und die Verbesserung aufbewahrt; automatische Löschfenster können eingeführt werden, wenn die Plattform reift — kontaktieren Sie uns, wenn Sie eine gezielte Löschung serverseitig gespeicherter Kennungen benötigen, die mit Ihrer E-Mail oder Client-ID verknüpft sind.',
    },
    {
      id: 'your-rights',
      title: 'Ihre Rechte',
      body:
        'Nach der UK GDPR können Sie Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit sowie das Recht haben, die Einwilligung jederzeit zu widerrufen, ohne die Rechtmäßigkeit der vorherigen Verarbeitung zu beeinträchtigen.\n\nPraktisch: Site-Daten im Browser löschen; Cookie- / Datenschutzpräferenzen öffnen; Abmeldelinks in E-Mails nutzen; oder privacy@meridianweather.co.uk mit ausreichenden Angaben schreiben, damit wir Ihre Datensätze finden können (zum Beispiel die zum Abonnieren verwendete E-Mail).\n\nSie können sich bei der UK Information Commissioner’s Office (ICO) unter ico.org.uk beschweren. Wenn Sie im Europäischen Wirtschaftsraum wohnen, können Sie auch Ihre örtliche Aufsichtsbehörde kontaktieren.',
    },
    {
      id: 'children',
      title: 'Kinder',
      body:
        'meridian richtet sich nicht an Kinder unter 13 Jahren. Wir erheben wissentlich keine E-Mail-Adressen von Kindern für Marketingzwecke. Wenn Sie glauben, dass ein Kind personenbezogene Daten übermittelt hat, kontaktieren Sie privacy@meridianweather.co.uk und wir löschen sie, soweit erforderlich.',
    },
    {
      id: 'recent-checks',
      title: 'Aktuelle Prüfungen der Plattform',
      body:
        'Orte, die danach eingestuft werden, wie oft sie auf der Plattform gesucht wurden (Suchauswahlen / Vorschauen), können als Städtenamen und Bedingungen in einer Leiste im Stil „aktuelle Prüfungen“ / beliebte Suchen erscheinen. Diese Anzeige ist ein Plattform-Aggregat aus gemeinsamen Prüfprotokollen, nicht eine persönliche Historie Ihrer privaten Suchen.',
    },
    {
      id: 'changes',
      title: 'Änderungen',
      body:
        'Wir können diese Erklärung aktualisieren, wenn sich unsere Praktiken oder das Recht ändern. Das Datum „Zuletzt aktualisiert“ ändert sich entsprechend. Wesentliche Änderungen werden auf dieser Seite abgebildet; soweit erforderlich, holen wir eine erneute Einwilligung ein.',
    },
  ],
};

const cookies = {
  slug: 'cookies',
  title: 'Cookie-Richtlinie',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'Überblick',
      body:
        'Website Servers Ltd, handelnd als meridian, verwendet Cookies und ähnliche Technologien (einschließlich localStorage und sessionStorage) auf meridianweather.co.uk. Diese Cookie-Richtlinie erläutert, was wir speichern, warum und wie Sie dies gemäß den UK Privacy and Electronic Communications Regulations (PECR) und der UK GDPR steuern können.\n\nAngaben zum Verantwortlichen entsprechen unserer Datenschutzerklärung: Website Servers Ltd, Unternehmensnummer 17240780, eingetragener Sitz Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR. Kontakt: privacy@meridianweather.co.uk.\n\nmeridian stützt sich vorwiegend auf First-Party-Browser-Speicher statt auf First-Party-Werbe-Cookies. Cookies von Drittanbietern können von Google gesetzt werden, wenn Sie die Einwilligung für Werbung oder Analysen aktivieren und diese Produkte konfiguriert sind.',
    },
    {
      id: 'what-we-use',
      title: 'Was wir verwenden',
      body:
        'Essenziell / Betrieb: anonyme Client-ID; Einwilligungsstatus; Banner-Bestätigung; Theme, Locale, Temperatureinheit, Barrierefreiheitseinstellungen und ähnliche Einstellungen, die speichern, wie Sie die Site nutzen; gespeicherte Städte und kürzliche Suchen, die Sie anfordern; lokale Spiegelung der Abonnementpräferenzen.\n\nFunktional (optional): Schreibvorgänge des Wetterdaten-Caches in localStorage und präzise Browser-Geolocation, wenn Sie sie zulassen — gesteuert über die Kategorie der funktionalen Einwilligung.\n\nWerbung (optional): Google-AdSense-Skript und zugehörige Google-Cookies oder Kennungen, wenn die Werbe-Einwilligung aktiv ist und AdSense konfiguriert ist. Ad-Slot-View-Ereignisse in unserer First-Party-Analyse erfordern ebenfalls Werbe-Einwilligung.\n\nAnalysen (optional): Google Analytics (GA4), wenn die Analyse-Einwilligung aktiv ist und eine Measurement-ID konfiguriert ist. Separat kann ein First-Party-Analyse-Beacon Seitenpfad, Verweildauer und Scrolltiefe in unserer eigenen Datenbank mit einer Sitzungs-ID in sessionStorage erfassen, wenn die Analyse-Einwilligung aktiv ist (kein klassisches Tracking-Cookie eines Drittanbieters).\n\nDie Marketing-E-Mail-Einwilligung ist in den Präferenzen reserviert und wird nicht genutzt, um Werbe-Mails über die Abonnementtypen hinaus zu versenden, in die Sie ausdrücklich eingewilligt haben.',
    },
    {
      id: 'local-storage',
      title: 'First-Party-Speicher-Schlüssel',
      body:
        'meridian:client-id — anonyme UUID, die optionale E-Mail-Abonnements mit diesem Browser verknüpft.\n\nmeridian:saved-cities — Städte, die Sie anheften (bis zu zehn).\n\nmeridian:checked-cities — kürzliche Stadt-Suchen.\n\nmeridian:user-location — Heimat-/Regionsprofil und zugehörige Historie.\n\nmeridian:weather-cache — zwischengespeicherte Wetterdaten (funktionale Schreibvorgänge).\n\nmeridian:theme, meridian:temperature-unit, meridian:preferred-locale, meridian:accessibility, meridian:weather-refresh-mode, meridian:city-detail-accordion — Anzeige- und Barrierefreiheitseinstellungen.\n\nmeridian:consent — JSON-Einwilligungskategorien (essential, functional, marketing, analytics, advertising).\n\nmeridian:cookie-consent — Legacy-Flag zur Banner-Bestätigung.\n\nmeridian:subscriptions — lokale Spiegelung der E-Mail-Präferenzen.\n\nmeridian:tier — reserviert (das Produkt läuft derzeit als kostenlos).\n\nsessionStorage meridian_analytics_sid — First-Party-Analyse-Sitzungskennung.\n\nGerätebezogene Journal-Kommentar-Schlüssel können für Demo-Journalbeiträge existieren.\n\nNur Mitarbeitende: ein HttpOnly-Cookie meridian_admin_session authentifiziert die Admin-Konsole; es wird nicht für öffentliches Marketing verwendet.',
    },
    {
      id: 'consent-categories',
      title: 'Einwilligungskategorien',
      body:
        'essential — immer aktiv; erforderlich für die Kernspeicherung des Dienstes und sicherheitsbezogene Kennungen.\n\nfunctional — Schreibvorgänge des Wetterdaten-Caches in localStorage und präzise GPS-/Standort-Hilfen, die Sie wählen; der Widerruf der funktionalen Einwilligung löscht zugehörige funktionale Speicher, soweit das Produkt eine Bereinigung umsetzt.\n\nadvertising — lädt Google AdSense, wenn konfiguriert; erforderlich auch für First-Party-Ad-Slot-View-Ereignisse.\n\nanalytics — lädt Google Analytics (GA4), wenn konfiguriert, und aktiviert den First-Party-Analyse-Beacon.\n\nmarketing — reserviert / im aktuellen Produkt nicht für separate Marketing-Pixel genutzt.\n\nDas Cookie-Banner beim ersten Besuch bietet Nur Essenzielles, Funktional akzeptieren, Alle akzeptieren oder Präferenzen verwalten. Sie können Präferenzen jederzeit über die schwebende Einstellungssteuerung erneut öffnen. „Alle akzeptieren“ aktiviert funktional und Werbung; Analysen (Beacon + GA4) schalten Sie gegebenenfalls separat in den Präferenzen ein.',
    },
    {
      id: 'third-party',
      title: 'Cookies von Drittanbietern',
      body:
        'Wenn die Werbe-Einwilligung erteilt und AdSense live ist, kann Google Cookies setzen oder ähnliche Technologien gemäß den Richtlinien von Google verwenden (einschließlich Einstellungen zur Anzeigenpersonalisierung, die Sie gegebenenfalls in Ihrem Google-Konto steuern).\n\nWenn die Analyse-Einwilligung erteilt und GA4 konfiguriert ist, kann Google Analytics eigene Cookies setzen.\n\nWir kontrollieren den vollständigen Cookie-Satz dieser Dritten nicht. Prüfen Sie die Datenschutz- und Anzeigeneinstellungen von Google parallel zu dieser Richtlinie.',
    },
    {
      id: 'withdraw',
      title: 'Wie Sie widerrufen oder löschen',
      body:
        'Öffnen Sie die Einstellungssteuerung der Site und nutzen Sie Cookie-Präferenzen, um Kategorien zu ändern oder nicht essenzielle Elemente abzulehnen. Sie können auch Site-Daten für meridianweather.co.uk in Ihrem Browser löschen.\n\nDas Deaktivieren von Werbung stoppt unser AdSense-Skript bei nachfolgenden Ladevorgängen. Das Deaktivieren von Analysen stoppt unseren GA-Loader (wenn konfiguriert) und unseren First-Party-Analyse-Beacon. Das Löschen des Speichers entfernt lokale Städte und Einstellungen, bis Sie sie erneut festlegen.\n\nBei Fragen oder PECR-/GDPR-Anfragen zu Cookies: privacy@meridianweather.co.uk.',
    },
  ],
};

const accessibility = {
  slug: 'accessibility',
  title: 'Barrierefreiheitserklärung',
  lastUpdated: '2026-07-14',
  sections: [
    {
      id: 'commitment',
      title: 'Unser Engagement',
      body:
        'Website Servers Ltd, handelnd als meridian, möchte, dass meridianweather.co.uk von möglichst vielen Menschen nutzbar ist. Wir streben die Konformität mit den Web Content Accessibility Guidelines (WCAG) 2.1 Level AA an.\n\nDiese Erklärung gilt für den öffentlichen meridian-Wetterdienst. Sie folgt dem Geist der britischen Modell-Barrierefreiheitserklärung für öffentliche Stellen und spiegelt unsere Pflichten nach dem Equality Act 2010 wider, Menschen mit Behinderungen bei der Erbringung von Dienstleistungen nicht zu benachteiligen.\n\nStatus: teilweise konform mit WCAG 2.1 AA. Einige Teile der Erfahrung erfüllen diesen Standard noch nicht vollständig. Diese Seite wurde zuletzt am 14. Juli 2026 überprüft.',
    },
    {
      id: 'how-accessible',
      title: 'Wie barrierefrei diese Website ist',
      body:
        'Wir gehen davon aus, dass die meisten Besucher: Primärseiten mit Tastaturfokus navigieren; helle, dunkle oder System-Farbschemas nutzen; Text vergrößern; hohen Kontrast, unterstrichene Links, verstärkte Fokusringe und eine gut lesbare Systemschrift aktivieren; Bewegung reduzieren; zum Hauptinhalt springen; und die Site auf Englisch (US/UK), Deutsch, Französisch, Spanisch, Japanisch oder Arabisch (mit Rechts-nach-links-Layout für Arabisch) nutzen können.\n\nWir wissen, dass manche Personen Teile des Dienstes als schwierig empfinden können. Bekannte Probleme sind unten aufgeführt.',
    },
    {
      id: 'features',
      title: 'Maßnahmen, die wir ergreifen',
      body:
        'Semantische Landmarks (Header, Main, Footer); optionaler Skip-Link zu #main-content; beschriftete Steuerelemente und sichtbare Fokusstile; Präferenzzentrum für Barrierefreiheits- und Cookie-Einstellungen; Dialoge und Sheets mit Schließen-Steuerungen für Abonnieren, Stadt-entfernen und Einstellungsabläufe; Cookie-Banner als Dialog exponiert; Stadt-Suche als Combobox mit Live-Region-Updates für Ergebnisse; Wettersymbole, die den geschriebenen Bedingungstext ergänzen statt ersetzen; tabellarische Ziffern für Temperaturen; Diagramme mit zugänglichen Namen, soweit implementiert; Touch-Ziele in angemessener Größe für viele interaktive Steuerelemente; Unterstützung für reduzierte Bewegung, die nicht wesentliche Animation und automatisch weiterlaufende Karussells unterdrückt.',
    },
    {
      id: 'gaps',
      title: 'Nicht barrierefreie Inhalte',
      body:
        'Die Stadt-Suche unterstützt noch nicht vollständig die Pfeiltasten-Navigation einer Combobox, wie in unserem Produkt-README dokumentiert.\n\nBereiche für stündliche und minutengenaue Prognosen sind vorwiegend visuelle horizontale Scrollbereiche und können äquivalente nicht visuelle Details vermissen lassen.\n\nEinige tägliche Prognosezeilen koppeln ein Symbol mit einem Datum ohne separaten sichtbaren Bedingungssatz.\n\nPremium-/Upgrade-Steuerungen können deaktiviert erscheinen, ohne einen alternativen kostenpflichtigen Ablauf, solange die Abrechnung nicht live ist.\n\nGoogle-AdSense-Einheiten von Drittanbietern liegen bei Einwilligung und Ladung außerhalb unserer vollständigen redaktionellen Kontrolle; ihre Barrierefreiheit kann variieren.\n\nDie Admin-Konsole richtet sich an Betreiber und ist von dieser öffentlichen Erklärung nicht erfasst.\n\nDas Cookie-Banner verwendet Dialog-Semantik, fängt den Fokus jedoch möglicherweise nicht so robust ein wie andere Modals.',
    },
    {
      id: 'feedback',
      title: 'Feedback und Kontakt',
      body:
        'Wenn Sie ein hier nicht aufgeführtes Barrierefreiheitsproblem finden oder Informationen in einem anderen Format benötigen, schreiben Sie an privacy@meridianweather.co.uk mit dem Betreff „Accessibility“. Sie können Website Servers Ltd auch über websiteservers.co.uk kontaktieren.\n\nWir bemühen uns, Feedback zur Barrierefreiheit innerhalb von fünf Werktagen zu bestätigen und Ihnen mitzuteilen, wie es weitergeht.',
    },
    {
      id: 'enforcement',
      title: 'Durchsetzungsverfahren',
      body:
        'Wenn Sie mit unserer Antwort nicht zufrieden sind, können Sie die Equality and Human Rights Commission (EHRC) kontaktieren. Für Beratung in England, Schottland oder Wales siehe equalityadvisoryservice.com. Nordirland hat eine separate Equality Commission. Offizielle Hinweise zu Beschwerden zur Website-Barrierefreiheit veröffentlicht GOV.UK.',
    },
    {
      id: 'technical',
      title: 'Technische Angaben',
      body:
        'meridian ist eine Next.js-Webanwendung. Die Barrierefreiheit setzt einen modernen Browser mit aktiviertem JavaScript für interaktive Funktionen voraus (Suche, Einstellungen, Abonnements). Wir testen vorwiegend mit Tastaturnavigation und Browser-Werkzeugen; wir haben kein vollständiges Audit gegen jedes WCAG-Erfolgskriterium oder jede Kombination assistiver Technologien veröffentlicht.\n\nAssistive Technologien, von denen wir bei vernünftiger Nutzung Erfolg erwarten, umfassen aktuelle Versionen von Screenreadern (zum Beispiel NVDA, VoiceOver) und Browser-Zoom bis etwa 200 %, vorbehaltlich der oben genannten Einschränkungen.\n\nErstellung dieser Erklärung: auf Grundlage einer internen Selbstbewertung der implementierten UI und bekannter Lücken. Wir aktualisieren diese Erklärung, wenn wesentliche Arbeiten zur Barrierefreiheit ausgeliefert werden.',
    },
  ],
};

export const LEGAL_POLICIES_I18N = [terms, privacy, cookies, accessibility];
