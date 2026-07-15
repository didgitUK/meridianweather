/** French documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'Premiers pas',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Vue d\'ensemble',
        body:
          'meridian est un tableau de bord météo multi-villes. Vous recherchez des lieux, épinglez jusqu\'à dix villes dans votre navigateur et suivez les conditions actuelles, les prévisions courtes et les mises à jour par e-mail optionnelles. Aucun compte requis — toutes les listes de villes et préférences sont stockées par appareil dans localStorage.',
      },
      {
        id: 'requirements',
        title: 'Prérequis',
        body:
          'Le tableau de bord nécessite une clé API OpenWeather côté serveur (OPENWEATHER_API_KEY). Sans elle, les requêtes météo et géocodage renvoient des erreurs. Les abonnements e-mail, les tâches cron et AdSense sont optionnels et ne s\'activent que lorsque leurs variables d\'environnement / connecteurs sont configurés. SQLite (better-sqlite3) tourne toujours pour le cache et les quotas.',
      },
      {
        id: 'add-city',
        title: 'Épingler une ville',
        body:
          'Utilisez le champ de recherche dans le hero de la page d\'accueil ou dans l\'en-tête. Saisissez au moins deux caractères ; les résultats apparaissent après un debounce de 300 ms. Sélectionnez un résultat de géocodage pour ouvrir la page détail ville. Utilisez Épingler à vos lieux sur cette page pour enregistrer la ville dans Vos lieux. Les doublons sont rejetés. Chaque ville reçoit un ID stable : {slugified-name}-{country}-{latitude to four decimals}, utilisé dans des URL comme /city/london-gb-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'Limite de villes',
        body:
          'Vous pouvez épingler jusqu\'à dix villes (MAX_SAVED_CITIES). Lorsque la limite est atteinte, épinglez une autre ville uniquement après en avoir retiré une de votre grille.',
      },
      {
        id: 'first-visit',
        title: 'Première visite : cookies et thème',
        body:
          'Lors de la première visite, une bannière cookies explique l\'utilisation du stockage local. Boutons : Tout accepter (fonctionnel + publicité), Accepter fonctionnel, Essentiel uniquement et Gérer les préférences. Rouvrez les paramètres cookies à tout moment via le contrôle flottant Paramètres (onglet Cookies). Le basculeur de thème flottant change la préférence clair ou sombre (stockée dans meridian:theme).',
      },
      {
        id: 'navigation',
        title: 'Où aller ensuite',
        body:
          'Dashboard explique la mise en page de l\'accueil. City detail couvre les pages de prévision complètes. Forecasts & cache explique les TTL et les couches de cache. Subscriptions traite l\'e-mail. API limits et API reference documentent le comportement serveur. La documentation est aussi servie sur docs.localhost:3000 en développement local (réécriture middleware). La documentation éditée via CMS peut diverger jusqu\'à réinitialisation aux valeurs par défaut des fichiers.',
      },
      {
        id: 'verify',
        title: 'Pour les développeurs',
        body:
          'Exécutez npm run verify pour lint, tests et build. Lancez npm run dev et ouvrez localhost:3000. Optionnel : connectez-vous sur /login puis ouvrez /admin pour les diagnostics d\'usage et les paramètres plateforme (un contournement dev peut s\'appliquer si ADMIN_SECRET n\'est pas défini en développement).',
      },
    ],
  },
  {
    slug: 'dashboard',
    title: 'Tableau de bord',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'layout',
        title: 'Mise en page',
        body:
          'Les bandes de la page d\'accueil : (1) Hero — présentation produit, vérification météo de localisation et une annonce hero carrée. (2) Consultations récentes — deux colonnes (« Près de vous » et « Recherches populaires »). (3) Vos lieux — cartes météo des villes épinglées. (4) Emplacement/unité publicitaire du tableau de bord. (5) Journal — six cartes d\'articles style blog dans un carrousel gauche/droite liant vers des publications `/journal/[slug]`.',
      },
      {
        id: 'cards',
        title: 'Cartes météo',
        body:
          'Chaque carte affiche le nom de ville, région/pays, température actuelle, description des conditions, icône météo Meteocons, température ressentie, humidité et vent. Les cartes lient vers la page détail ville. Le survol précharge la route détail et les données météo.',
      },
      {
        id: 'forecast-strip',
        title: 'Mini-prévision sur sept jours',
        body:
          'Sous la lecture principale, chaque carte affiche une perspective sur sept jours (libellé du jour, icône, min/max). Les scopes current et daily se chargent ensemble dans une requête batch du tableau de bord — il n\'y a pas de fetch daily idleCallback séparé. La bande affiche le libellé du jour, l\'icône et la plage de température min/max.',
      },
      {
        id: 'card-actions',
        title: 'Actions des cartes',
        body:
          'S\'abonner ouvre une modale pour le digest hebdomadaire et les e-mails d\'alertes météo pour cette ville. Supprimer (X) retire la ville de localStorage et vide son cache météo navigateur. Si vous avez des abonnements e-mail actifs pour cette ville, une boîte de dialogue propose de se désabonner avant la suppression.',
      },
      {
        id: 'states',
        title: 'États de chargement et d\'erreur',
        body:
          'Pendant le chargement météo, une carte squelette s\'affiche. En cas d\'échec upstream, la carte affiche une alerte d\'erreur avec les actions Réessayer et Supprimer. Une grille vide affiche des instructions pour rechercher et épingler votre première ville depuis la page détail ville.',
      },
      {
        id: 'refresh',
        title: 'Comportement d\'actualisation',
        body:
          'Par défaut, Vos lieux utilise l\'actualisation manuelle (`meridian:weather-refresh-mode`) : le tableau de bord sert la dernière lecture stockée dans ce navigateur au chargement de page, et ne récupère que lorsque vous appuyez sur actualiser sur une carte (ou quand une ville n\'a pas encore de cache local). Il n\'y a pas de panneau Paramètres → Météo dans l\'UI actuelle ; la clé existe pour un usage programmatique / futur. Les données sont aussi mises en cache côté serveur (mémoire + SQLite). Voir Forecasts & cache pour les détails TTL.',
      },
      {
        id: 'recent-checks',
        title: 'Consultations récentes',
        body:
          'Deux colonnes affichent jusqu\'à cinq cartes chacune depuis GET /api/recent-checks (recherches populaires depuis location_weather_checks, limite API 20, source popular|empty). Les cartes lient vers le détail ville lorsque des coordonnées existent. npm run seed:checks remplit uniquement weather_snapshots — il ne peuple pas cette bande. Voir Recent checks & seeding.',
      },
    ],
  },
  {
    slug: 'city-detail',
    title: 'Détail ville',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'access',
        title: 'Qui peut voir une page ville',
        body:
          'Les pages détail ville sont sur /city/[cityId]. resolveCity() sert toujours les cinq PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney). Toute ligne de lieu avec un city_slug se résout aussi. Les ID parsés de la forme {name}-{country}-{lat} correspondent quand lat/country existent dans SQLite. Les slugs inconnus ou mal formés renvoient 404. Vous n\'avez pas besoin d\'épingler une ville pour ouvrir sa page.',
      },
      {
        id: 'tabs',
        title: 'Onglets de prévision',
        body:
          'Onglets fixes : Aujourd\'hui, Horaire, 10 jours et Historique. Lien profond avec ?tab=hourly, ?tab=daily ou ?tab=history. Le legacy ?tab=next-hour redirige vers Aujourd\'hui. Jusqu\'à trois bannières d\'alerte OpenWeather s\'affichent au-dessus du hero lorsque alertIds sont présents. Un AdSlot city-detail se trouve directement sous les onglets.',
      },
      {
        id: 'header',
        title: 'En-tête de page et hero',
        body:
          'Par défaut, l\'en-tête utilise une carte satellite OSM en arrière-plan quand isCityHeroOsmEnabled() est true (NEXT_PUBLIC_CITY_HERO_OSM non défini ou différent de "0"). Définissez NEXT_PUBLIC_CITY_HERO_OSM=0 pour préférer les photos. Le mode photo enchaîne Unsplash → Wikimedia Commons → Pexels via getHeroImageForRegion, avec des replis SVG statiques si les clés manquent. Google Street View optionnel s\'applique quand OSM est désactivé et NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1.',
      },
      {
        id: 'today',
        title: 'Onglet Aujourd\'hui',
        body:
          'Hero des conditions actuelles, tuiles métriques avec icônes Meteocon, et accordéons Conditions actuelles / Lieu / Heures de soleil. Aperçu horaire pour le reste de la journée lorsque des données horaires sont disponibles.',
      },
      {
        id: 'hourly',
        title: 'Onglet Horaire',
        body:
          'Liste de cartes sur les 12 prochaines heures (une colonne) pour température à court terme, probabilité de précipitations et vent.',
      },
      {
        id: 'daily',
        title: 'Onglet 10 jours',
        body:
          'Liste de perspective quotidienne (jusqu\'à dix jours) : jour de semaine, icône, description/résumé, min/max, probabilité de pluie, vent, UV. La sélection d\'un jour ouvre le graphique métrique pour cette date.',
      },
      {
        id: 'history',
        title: 'Onglet Historique',
        body:
          'Jours passés depuis les observations stockées et prévisions archivées via GET /api/weather/history, avec sélecteur de jour et graphique.',
      },
      {
        id: 'alerts',
        title: 'Alertes météo',
        body:
          'Quand OpenWeather renvoie des alertes, AlertBanner en affiche au plus trois au-dessus du hero. Le texte complet d\'alerte est disponible via GET /api/alerts/[alertId].',
      },
      {
        id: 'data',
        title: 'Chargement des données',
        body:
          'Le SSR hydrate current, daily et hourly lorsqu\'ils sont disponibles depuis getCityWeatherForSeo. Le hook client useCityWeather récupère en batch DETAIL_SCOPES = [current, hourly, daily] via POST /api/weather/batch — minutely n\'est pas demandé. Premium / MinutelyPrecipStrip n\'est pas branché.',
      },
      {
        id: 'subscribe',
        title: 'Épingler et s\'abonner',
        body:
          'Le menu Options de l\'en-tête propose Épingler à vos lieux et S\'abonner (digest hebdomadaire + alertes météo) — les mêmes flux que les cartes du tableau de bord. Épingler enregistre dans meridian:saved-cities ; s\'abonner ouvre SubscribeDialog.',
      },
      {
        id: 'prefetch',
        title: 'Prefetch',
        body:
          'Survoler une carte météo du tableau de bord précharge /city/[cityId] et réchauffe le cache L0 via prefetchCityDetail pour que les pages détail s\'ouvrent plus vite.',
      },
      {
        id: 'seo',
        title: 'Recherche et découverte',
        body:
          'Lorsqu\'un lieu reçoit sa première vérification météo current réussie, markLocationIndexable définit city_slug et indexable_at, ajoute la ville au sitemap, et rend côté serveur les métadonnées SEO plus un bloc résumé sur la page ville.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'Prévisions & cache',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'scopes',
        title: 'Scopes météo',
        body:
          'Scopes demandables par le client : current (maintenant), hourly (chronologie), daily (chronologie), minutely (précipitations). Scopes serveur uniquement : geocode (cache de recherche ville clé geocode:{query}), alert (charges utiles d\'alerte individuelles). Chaque scope météo utilise la clé de cache {lat},{lon},{scope} ; geocode par chaîne de requête.',
      },
      {
        id: 'layers',
        title: 'Couches de cache',
        body:
          'L0 — localStorage navigateur meridian:weather-cache, structure {cityId: {scope: {payload, fetchedAt}}}. L1 — Map en mémoire sur le processus serveur. L2 — SQLite weather_snapshots avec fetched_at, expires_at, stale_until. Les lectures vérifient L0 → API → L1/L2 → upstream OpenWeather.',
      },
      {
        id: 'freshness',
        title: 'États de fraîcheur',
        body:
          'fresh — dans expires_at. acceptable — après expires mais dans stale_until (peut encore être servi). expired — au-delà de stale_until, déclenche l\'upstream si le quota le permet. emergency — quota bloqué mais snapshot L2 expiré/acceptable servi quand même pour que les utilisateurs voient encore des données.',
      },
      {
        id: 'ttl-table',
        title: 'Valeurs TTL par défaut (SCOPE_TTL)',
        body:
          'current — fresh 1h, stale 2h (remplacé par platform_settings.refresh_interval_ms et stale_cache_max_ms ; l\'admin peut définir 10m–2h). hourly — fresh 2h, stale 6h. daily — fresh 6h, stale 12h. minutely — fresh 15m, stale 30m. geocode — fresh 7d, stale 30d. alert — fresh 1h, stale 6h.',
      },
      {
        id: 'upstream',
        title: 'Intégration OpenWeather',
        body:
          'Principal : One Call API 4.0 (onecall/current, timeline/1h, timeline/1day, timeline/1min). Le scope current bascule sur API 2.5 /weather si One Call current échoue. Le géocodage utilise l\'API de géocodage OpenWeather (limit 5). La normalisation dans src/lib/one-call.js produit des charges utiles UI cohérentes.',
      },
      {
        id: 'batch',
        title: 'Récupération par lot',
        body:
          'POST /api/weather/batch accepte { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Les scopes sont par ville (city.scopes), pas un tableau scopes de niveau supérieur. Le tableau de bord charge current + daily ensemble dans un batch (sans requestIdleCallback). Le détail ville batch uniquement current + hourly + daily. Le gestionnaire espace les villes d\'environ 100 ms pour éviter les limites de débit en rafale.',
      },
      {
        id: 'headers',
        title: 'Métadonnées de réponse',
        body:
          'Les réponses API incluent meta : cacheLayer (memory, database, upstream), freshness, fetchedAt, ageMs, upstreamCallAvoided, source. L\'en-tête X-Cache reflète hit/miss le cas échéant. « Mis à jour il y a X » dans l\'UI utilise meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'Interaction avec le quota',
        body:
          'Lorsque les limites quotidiennes ou par minute sont dépassées, les appels upstream s\'arrêtent et des données L2 emergency stale sont renvoyées si disponibles. Rouvrir une ville dans le TTL coûte zéro appel upstream.',
      },
      {
        id: 'logging',
        title: 'Journalisation des hits cache',
        body:
          'Les hits cache base de données L2 sont journalisés dans api_call_log avec cache_hit=1 et n\'incrémentent pas le compteur upstream quotidien. Les hits mémoire L1 sont servis mais intentionnellement non persistés dans SQLite — ils se déclenchent à chaque remontage SSR/client et feraient tourner meridian.db sous les file watchers.',
      },
      {
        id: 'payload-fields',
        title: 'Champs de charge utile current',
        body:
          'temperature, feelsLike, description, condition, icon (code OpenWeather), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'Consultations récentes & seeding',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'Ce que sont les consultations récentes',
        body:
          'Les consultations récentes sur la page d\'accueil affichent les recherches populaires à l\'échelle de la plateforme — lieux classés selon la fréquence à laquelle les utilisateurs les ont sélectionnés ou prévisualisés via la recherche — pas votre historique de recherche personnel ni un dump brut du cache de snapshots météo.',
      },
      {
        id: 'api',
        title: 'Comportement API',
        body:
          'GET /api/recent-checks appelle getRecentChecksPayload(), qui lit location_weather_checks (joint à locations) via listPopularSearchChecks. La limite par défaut est 20. Les déclencheurs comptés sont search_select et search_preview. La forme de réponse est { checks, source } où source vaut popular quand des lignes existent, ou empty quand il n\'y en a pas. Il n\'y a pas de repli showcase.',
      },
      {
        id: 'ui',
        title: 'UI de l\'accueil',
        body:
          'RecentChecksSection affiche deux colonnes (« Près de vous » et « Recherches populaires »), jusqu\'à cinq cartes chacune. Les cartes utilisent des icônes Meteocons, température, description et libellé de ville. Lorsque des coordonnées existent, les cartes lient vers /city/[cityId]. Il n\'y a pas d\'AdSlot recent-checks sur la page d\'accueil.',
      },
      {
        id: 'seed-script',
        title: 'Seeding des snapshots météo (pas la bande)',
        body:
          'Exécutez npm run seed:checks avec OPENWEATHER_API_KEY défini. Le script récupère la météo actuelle pour quarante-trois lieux à travers Cumbria et le Nord-Est de l\'Angleterre (voir src/constants/seed-locations.js), écrit des weather_snapshots SQLite avec des horodatages fetched_at échelonnés, et enrichit les charges utiles avec les noms de ville. Cela peuple le cache L2 pour les démos — cela n\'insère pas de lignes location_weather_checks déclenchées par recherche, donc cela ne remplit pas la bande recent-checks / recherches populaires.',
      },
      {
        id: 'persistence',
        title: 'Persistance',
        body:
          'Les snapshots seedés vivent dans DATABASE_PATH (défaut ./data/meridian.db). Relancer le script fait un upsert par cache_key. Les lignes de recherche populaire s\'accumulent au fil des recherches réelles ; vider la base de données vide à la fois les snapshots et l\'historique des consultations (la bande reste vide jusqu\'à de nouvelles recherches).',
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
        title: 'Vue d\'ensemble',
        body:
          'meridian prend en charge l\'e-mail optionnel : newsletter plateforme (mises à jour produit) et digests hebdomadaires par ville plus alertes météo. Tous les abonnements exigent un opt-in explicite. Pas de compte — un UUID clientId anonyme dans meridian:client-id lie l\'UI navigateur aux lignes serveur.',
      },
      {
        id: 'types',
        title: 'Types d\'abonnement',
        body:
          'newsletter — mises à jour produit meridian depuis NewsletterSignup du pied de page. city_weekly — e-mail digest hebdomadaire pour une ville enregistrée. city_alerts — notifications quand les types d\'alerte activés correspondent (voir règles d\'alerte). Les types sont stockés dans SQLite subscriptions.type et reflétés dans le registre local meridian:subscriptions.',
      },
      {
        id: 'client-linking',
        title: 'ID client et registre local',
        body:
          'Lors de la première visite, un UUID est écrit dans meridian:client-id. POST /api/subscriptions associe e-mail + préférences à ce clientId. GET /api/subscriptions?clientId= hydrate meridian:subscriptions au chargement. DELETE désactive par clientId, coordonnées ville et types.',
      },
      {
        id: 'alert-prefs',
        title: 'Préférences d\'alerte',
        body:
          'Les lignes city_alerts stockent alert_prefs_json — une carte booléenne indexée par id de type d\'alerte (rain, wind, thunderstorm, snow, ice, extreme_heat, fog, niveaux de sévérité, hydrologique, qualité de l\'air, maritime, UV, météo sévère US, et plus — voir ALL_ALERT_TYPES dans constants/alert-types.js). PATCH /api/subscriptions met à jour des alertPrefs partiels sur une ligne alerts existante. Les colonnes legacy alert_on_rain et alert_on_storm restent synchronisées à la création.',
      },
      {
        id: 'subscribe-ui',
        title: 'Modale S\'abonner',
        body:
          'Sur chaque carte météo et menu Options du détail ville : champ e-mail, case digest hebdomadaire et bascules d\'alerte granulaires (ou tout activer). Des libellés intelligents affichent Abonné / Gérer quand déjà actif. Les digests hebdomadaires sont plafonnés à MAX_WEEKLY_DIGEST_LOCATIONS = 20 par adresse e-mail. La newsletter du pied de page utilise la même API avec type newsletter.',
      },
      {
        id: 'emails',
        title: 'Envoi des e-mails',
        body:
          'sendTransactionalEmail route via le connecteur ESP actif (Resend, SendGrid, SES ou SMTP) sélectionné dans l\'admin. Modèles React Email depuis src/emails/ et SQLite email_templates : welcome (newsletter), weekly digest, weather alert (par slug de type d\'alerte). Sans connecteur configuré, l\'API écrit les abonnements mais les fonctions d\'envoi renvoient { sent: false }. Définissez NEXT_PUBLIC_APP_URL pour des liens de désabonnement corrects dans les e-mails de production.',
      },
      {
        id: 'unsubscribe',
        title: 'Se désabonner',
        body:
          'Chaque abonnement a un unsubscribe_token unique. GET /api/unsubscribe?token= désactive cette ligne et affiche une confirmation. Les modèles e-mail lient vers cette route. Supprimer une ville peut optionnellement désabonner via RemoveCityDialog.',
      },
      {
        id: 'cron-weekly',
        title: 'Cron digest hebdomadaire',
        body:
          'GET /api/cron/weekly-digests avec Authorization: Bearer CRON_SECRET. Charge les abonnements city_weekly actifs groupés par e-mail, batch les villes uniques, récupère la météo actuelle par ville, et envoie un digest par e-mail via le connecteur actif. Planifiez en externe (ex. Vercel cron, GitHub Actions) — aucun planning n\'est livré dans le dépôt.',
      },
      {
        id: 'cron-alerts',
        title: 'Cron alertes météo',
        body:
          'GET /api/cron/weather-alerts avec Bearer CRON_SECRET. Pour chaque abonnement city_alerts, évalue les alertPrefs activées contre les correspondances fusionnées de evaluateOpenWeatherAlertMatches (conditions actuelles), evaluateOfficialAlertMatches (avertissements nationaux Open-Meteo), et alertes actives NWS lorsque les bascules plateforme le permettent. Déduplication via subscription_send_log pour que la même alerte ne soit pas envoyée deux fois pour la même ville/fenêtre de condition.',
      },
      {
        id: 'remove-city',
        title: 'Intégration suppression de ville',
        body:
          'Supprimer une ville enregistrée vide le cache météo L0. Si des abonnements existent pour cette ville, RemoveCityDialog invite à se désabonner du digest hebdomadaire et/ou des alertes avant de confirmer la suppression.',
      },
    ],
  },
  {
    slug: 'monetization',
    title: 'Monétisation & consentement',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'tiers',
        title: 'Niveau gratuit (Premium réservé)',
        body:
          'Le produit fonctionne actuellement en gratuit uniquement. ConsentProvider force tier free ; meridian:tier est réservé et inutilisé à l\'exécution. Le checkout Stripe et PremiumGate ne sont pas branchés. Les annonces sont conditionnées par le consentement publicitaire et la config AdSense — pas par un indicateur premium.',
      },
      {
        id: 'premium-features',
        title: 'Ce que Premium débloquerait (non livré)',
        body:
          'Réservé / non implémenté dans l\'UI : masquer AdSense pour un niveau payant, et une bande de précipitations minutely. Le détail ville charge aujourd\'hui uniquement les scopes current, hourly et daily. Il n\'y a pas de composant MinutelyPrecipStrip dans l\'app.',
      },
      {
        id: 'consent-model',
        title: 'Modèle de consentement',
        body:
          'Champs JSON meridian:consent : essential (toujours actif), functional (écritures cache météo localStorage et aides GPS), marketing (réservé), analytics (chargeur GA4 si configuré), advertising (AdSense). Drapeau legacy meridian:cookie-consent. Bannière cookies : Tout accepter, Accepter fonctionnel, Essentiel uniquement, Gérer les préférences. Rouvrez à tout moment via le contrôle flottant Paramètres → onglet Cookies. « Tout accepter » active functional + advertising ; activez Google Analytics séparément dans les préférences si proposé.',
      },
      {
        id: 'adsense',
        title: 'Google AdSense (en production)',
        body:
          'Lorsque GOOGLE_ADSENSE_CLIENT_ID et les variables d\'environnement de slot de placement sont définies, AdSense est en production — pas des placeholders. AdSenseProvider charge le script une fois après consentement publicitaire si configuré. GET /api/ads/config renvoie la config script ; GET /api/ads?placement= renvoie la config par slot. GET /ads.txt sert la vérification éditeur depuis l\'environnement. ID client validé côté serveur (format ca-pub-…) ; jamais commité dans git.',
      },
      {
        id: 'placements',
        title: 'Emplacements publicitaires',
        body:
          'Emplacements UI actifs avec AdSlot : dashboard (sous la grille de villes), hero (hero accueil + barre latérale journal), city-detail (sous les onglets). L\'id de placement recent-checks existe dans constants/env mais n\'a pas d\'AdSlot sur la page d\'accueil. Variables d\'environnement de slot : GOOGLE_ADSENSE_SLOT_DASHBOARD, _HERO, _RECENT, _CITY_DETAIL, _DEFAULT. Sans ID de slot, les emplacements affichent des placeholders démo de marque ; les annonces auto peuvent encore tourner depuis le script quand l\'ID client est défini.',
      },
      {
        id: 'adslot-states',
        title: 'États UI AdSlot',
        body:
          'Par défaut (AdSense non défini / pas de consentement publicitaire) : placeholders PNG de marque sous public/ads/ (bannière et carré). Le texte de superposition est réservé aux lecteurs d\'écran (sr-only), pas peint sur l\'image. GET /api/ads/placeholder-bg peut encore servir des recherches d\'image hero pour d\'autres surfaces. Configuré + consentement — unité ins.adsbygoogle après script prêt.',
      },
      {
        id: 'analytics',
        title: 'Analytics',
        body:
          'Le beacon first-party SiteAnalyticsBeacon envoie le chemin de page / l\'engagement vers POST /api/analytics/collect dans site_analytics_events quand consent.analytics est activé (le point de collecte vérifie aussi le drapeau de consentement dans le corps de requête). Les événements de vue de slot publicitaire exigent aussi consent.advertising. GA4 optionnel (AnalyticsProvider) se charge uniquement quand NEXT_PUBLIC_GA_MEASUREMENT_ID est défini et consent.analytics est activé. La bannière cookies « Tout accepter » n\'active pas analytics — activez-le dans Paramètres → Cookies.',
      },
      {
        id: 'stripe',
        title: 'Stripe (prévu)',
        body:
          'Premium / checkout Stripe n\'est pas implémenté. Toute facturation future nécessiterait une application de niveau côté serveur ; ne traitez pas meridian:tier comme actif.',
      },
      {
        id: 'data',
        title: 'Licence des données',
        body:
          'meridian ne vend ni ne licence les données utilisateur. L\'analytics first-party et GA4 optionnel servent à faire fonctionner le produit. Tout produit analytics B2B ou anonymisé futur exigerait des mises à jour de consentement et de politique séparées.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'Limites API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'quota',
        title: 'Quota quotidien et par minute',
        body:
          'Valeurs par défaut depuis constants/weather.js : DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 appels upstream par minute glissante. platform_settings peut remplacer daily_limit, soft_block_threshold, warning_threshold et per_minute_limit (valeurs par défaut seedées au premier ouverture DB). Le compteur se réinitialise à minuit UTC.',
      },
      {
        id: 'status',
        title: 'Valeurs de statut',
        body:
          'ok — sous le seuil d\'avertissement. warning — à ou au-dessus de warning_threshold (défaut 800 appels aujourd\'hui). soft_block — à ou au-dessus de soft_block_threshold (défaut 950) ; upstream bloqué. hard_block — à daily_limit (défaut 1000). Le plafond par minute bloque aussi l\'upstream quand per_minute_limit appels ont eu lieu dans les 60 dernières secondes.',
      },
      {
        id: 'cache-hits',
        title: 'Hits cache vs upstream',
        body:
          'Les hits base de données L2 sont journalisés dans api_call_log avec cache_hit=1 et n\'incrémentent pas le compteur upstream quotidien. Les hits mémoire L1 ne sont pas journalisés dans SQLite — recordCacheHit retourne tôt quand meta.layer est memory. Seuls les appels upstream OpenWeather réussis (statut 200, cache_hit=0) comptent pour le quota. Les servitudes emergency stale évitent l\'upstream quand bloqué.',
      },
      {
        id: 'admin-shortcut',
        title: 'Diagnostics admin',
        body:
          'Ouvrez /admin (après connexion) pour utilisé aujourd\'hui / limite quotidienne, restant, statut et paramètres d\'intervalle d\'actualisation. API : GET /api/admin/usage.',
      },
      {
        id: 'admin-api',
        title: 'API admin',
        body:
          'GET /api/admin/usage — instantané quota et appels récents. GET|PATCH /api/admin/config — API principale des paramètres admin (intervalle d\'actualisation, connecteurs, défauts digest, AdSense, bascules d\'alerte, etc.). Legacy étroit : PATCH /api/admin/settings { refreshIntervalMs }. Auth : cookie de session HttpOnly meridian_admin_session après /login. Le secret de signature est ADMIN_SECRET (pas ADMIN_PASSWORD). Contournement dev quand NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 et ADMIN_SECRET non défini.',
      },
      {
        id: 'openweather',
        title: 'Limites fournisseur OpenWeather',
        body:
          'meridian suit son propre compteur upstream ; OpenWeather peut aussi limiter ou rejeter les clés indépendamment (401, 429). L\'orchestrateur les mappe vers des erreurs API structurées pour le client.',
      },
      {
        id: 'emergency',
        title: 'Mode urgence',
        body:
          'Lorsque soft/hard bloqué, les utilisateurs voient encore le dernier snapshot SQLite acceptable marqué freshness emergency plutôt qu\'une erreur vide — sauf si aucun snapshot n\'a jamais existé pour ces coordonnées.',
      },
    ],
  },
  {
    slug: 'api-reference',
    title: 'Référence API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Vue d\'ensemble',
        body:
          'Toutes les routes API sont des handlers Next.js App Router sous src/app/api/. Météo et géocodage nécessitent OPENWEATHER_API_KEY. Les routes cron nécessitent Authorization: Bearer CRON_SECRET. Les routes admin nécessitent un cookie de session admin authentifié (meridian_admin_session) après connexion sur /login, sauf contournement dev.',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query : lat, lon, scope (current|hourly|daily|minutely), trigger optionnel, lang. Renvoie la charge utile météo plus fetchedAt, cacheHit, freshness, source, trigger, tokensUsed. L\'en-tête X-Cache reflète la couche de cache. Erreurs : 400 invalid params, 404 location not found, 429 rate_limited, 502 upstream_error ou service_unavailable.',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body : { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Renvoie { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. Les scopes sont par ville, pas un tableau de niveau supérieur. Limité à 20 requêtes/minute par IP. Utilisé par les hooks tableau de bord et détail ville.',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query : lat, lon, from, to optionnels (dates ISO), limit. Renvoie { summary, observations, forecasts: { hourly, daily } } depuis weather_observations et weather_forecast_archive.',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query : q (min 2 caractères), paramètres context optionnels. Renvoie un tableau normalisé : name, country, state, lat, lon, label. Limite upstream 5 résultats. Mis en cache en L2 avec scope geocode. Limité à 60 requêtes/minute par IP.',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'Sans paramètres. Renvoie { checks, source } où source vaut popular quand des lignes déclenchées par recherche existent, ou empty quand il n\'y en a pas. Limite par défaut 20 depuis location_weather_checks classées par volume de recherche (déclencheurs search_select et search_preview). Pas de repli showcase.',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — liste les abonnements actifs pour le client. POST — crée { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — met à jour alertPrefs sur une ligne city_alerts { clientId, id, alertPrefs }. DELETE — corps { clientId, cityLat, cityLon, types[] }. Types : newsletter, city_weekly, city_alerts.',
      },
      {
        id: 'unsubscribe',
        title: 'GET /api/unsubscribe',
        body:
          'Query : token (unsubscribe_token UUID). Désactive l\'abonnement et renvoie une confirmation HTML.',
      },
      {
        id: 'alerts',
        title: 'GET /api/alerts/[alertId]',
        body:
          'Renvoie une alerte normalisée : id, senderName, event, start, end, description. Source : scope alert mis en cache.',
      },
      {
        id: 'cron',
        title: 'Routes cron',
        body:
          'GET /api/cron/weekly-digests — envoie les e-mails digest hebdomadaires groupés par e-mail d\'abonné. GET /api/cron/weather-alerts — évalue alertPrefs contre les flux OpenWeather, Open-Meteo et NWS et envoie les e-mails d\'alerte. Les deux nécessitent Bearer CRON_SECRET.',
      },
      {
        id: 'admin',
        title: 'Routes admin',
        body:
          'Usage et config : GET /api/admin/usage ; GET|PATCH /api/admin/config ; legacy PATCH /api/admin/settings { refreshIntervalMs }. Utilisateurs et auth : GET|POST /api/admin/users ; POST /api/admin/users/invite ; GET /api/admin/me. Données : GET /api/admin/checks ; GET /api/admin/locations ; GET|PATCH /api/admin/subscriptions ; GET /api/admin/mailing-summary ; GET /api/admin/analytics. Connecteurs : GET|PATCH /api/admin/connections ; GET|PATCH /api/admin/openweather-key ; GET|PATCH /api/admin/email-key. CMS e-mail : GET|POST|PATCH /api/admin/email-templates ; POST /api/admin/email/test, /compose, /sync. AdSense : GET /api/admin/adsense/report ; POST /api/admin/adsense/sync ; OAuth GET /api/admin/adsense/oauth/start, /callback, /disconnect. CMS : GET|PATCH /api/admin/cms-pages. Toutes nécessitent meridian_admin_session sauf contournement dev.',
      },
      {
        id: 'ads',
        title: 'Routes ads',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — config de placement avec slotId si défini. GET /api/ads/placeholder-bg — recherche hero pour surfaces placeholder. Route app GET /ads.txt — ligne éditeur AdSense depuis env. Emplacements AdSlot actifs : dashboard, hero, city-detail. L\'env de slot recent-checks existe mais l\'accueil n\'a pas d\'AdSlot.',
      },
      {
        id: 'other',
        title: 'Autres routes publiques',
        body:
          'GET /api/platform/limits — instantané quota public. POST /api/analytics/collect — beacon analytics first-party. GET /api/location/region — aide IP/région. POST /api/weather/inaccurate-report — signaler de mauvaises données. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — tuiles overlay hero OSM. Auth : POST /api/auth/login, /logout ; POST /api/auth/forgot-password ; POST /api/auth/reset-password/[token] ; GET|POST /api/auth/invite/[token] ; GET /api/auth/session.',
      },
      {
        id: 'errors',
        title: 'Forme d\'erreur',
        body:
          'Les erreurs JSON sont typiquement { error: code, message: string }. Les codes ApiError incluent invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error, unauthorized, not_found, limit_reached.',
      },
    ],
  },
  {
    slug: 'weather-icons',
    title: 'Icônes météo',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'source',
        title: 'Jeu d\'icônes',
        body:
          'meridian utilise Meteocons (MIT, Bas Milius) SVG statiques style fill au lieu des PNG CDN OpenWeather. Les icônes sont dans public/weather-icons/ et copiées depuis @meteocons/svg-static à npm install (postinstall) ou via npm run copy:icons. Attribution dans public/weather-icons/ATTRIBUTION.txt.',
      },
      {
        id: 'inventory',
        title: 'Icônes livrées',
        body:
          'scripts/copy-weather-icons.mjs copie 35 SVG uniques : 17 icônes de condition OpenWeather plus tuiles métrique/détail (thermometer, humidity, barometer, wind, UV, raindrop, snowflake, compass, starry-night, time-afternoon, et variantes associées). Comptez les fichiers sous public/weather-icons/*.svg après copy:icons.',
      },
      {
        id: 'mapping',
        title: 'Mapping des codes OpenWeather',
        body:
          'Les codes d\'icône OpenWeather (ex. 01d, 10n) mappent vers des noms Meteocon dans src/features/weather/utils/weather-icon.js : 01d→clear-day, 01n→clear-night, 02d→partly-cloudy-day, 02n→partly-cloudy-night, 03d/03n→cloudy, 04d→overcast-day, 04n→overcast-night, 09d→overcast-day-rain, 09n→overcast-night-rain, 10d→partly-cloudy-day-rain, 10n→partly-cloudy-night-rain, 11d→thunderstorms-day, 11n→thunderstorms-night, 13d→overcast-day-snow, 13n→overcast-night-snow, 50d→fog-day, 50n→fog-night. Les codes inconnus basculent sur cloudy. METRIC_METEOCON mappe les clés de tuile détail vers des icônes supplémentaires.',
      },
      {
        id: 'component',
        title: 'Composant WeatherIcon',
        body:
          'src/features/weather/components/WeatherIcon.jsx encapsule getWeatherIconPath(icon) pour /weather-icons/{name}.svg local. Utilisé sur les cartes météo, consultations récentes, bandes de prévision, graphique horaire, lignes quotidiennes et tuiles métrique du détail ville. Le texte alt utilise la description météo si fournie.',
      },
      {
        id: 'maintenance',
        title: 'Ajouter ou mettre à jour des icônes',
        body:
          'Modifiez OPENWEATHER_TO_METEOCON / METRIC_METEOCON dans weather-icon.js et ICON_NAMES dans scripts/copy-weather-icons.mjs, puis npm run copy:icons. Les tests Vitest dans weather-icon.test.js vérifient le mapping.',
      },
      {
        id: 'accessibility',
        title: 'Accessibilité',
        body:
          'Les icônes sont des compléments décoratifs aux descriptions textuelles (ex. « Ciel dégagé »). WeatherIcon définit alt depuis la prop description ; alt vide quand utilisé uniquement à côté du texte de condition visible.',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'Déploiement & environnement',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'env-required',
        title: 'Environnement requis',
        body:
          'OPENWEATHER_API_KEY — requis pour météo et géocodage. DATABASE_PATH — fichier SQLite (défaut ./data/meridian.db) ; doit être un volume persistant en production pour que cache et abonnements survivent aux redémarrages.',
      },
      {
        id: 'env-hero',
        title: 'Environnement image hero',
        body:
          'UNSPLASH_ACCESS_KEY — optionnel ; premier fournisseur photo pour les heroes de lieu (serveur uniquement, mis en cache dans hero_image_cache). PEXELS_API_KEY — troisième fournisseur optionnel après Unsplash et Wikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — définir à 0 pour désactiver l\'en-tête carte satellite (activé par défaut). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — opt-in Google Street View quand OSM est désactivé. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — clé Maps Embed API optionnelle pour iframes Street View.',
      },
      {
        id: 'env-email',
        title: 'Environnement e-mail',
        body:
          'Multi-ESP via connecteur actif dans platform_settings (sélecteur admin) : Resend (RESEND_API_KEY, RESEND_FROM_EMAIL), SendGrid (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL), Amazon SES (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION, AWS_SES_FROM_EMAIL), ou SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_SECURE). NEXT_PUBLIC_APP_URL — URL de base pour les liens de désabonnement dans les e-mails (listée dans .env.example ; requise en production).',
      },
      {
        id: 'env-cron',
        title: 'Cron et admin',
        body:
          'CRON_SECRET — Bearer pour /api/cron/* (refusé si non défini en production). ADMIN_SECRET — signe le cookie de session admin et chiffre les secrets des connecteurs. ADMIN_PASSWORD — connexion root pour ADMIN_EMAIL uniquement. Contournement dev uniquement quand NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 et ADMIN_SECRET non défini. Voir docs/SECURITY.md. Planifiez cron en externe : weekly-digests (ex. lundi matin), weather-alerts (ex. toutes les 15–30 minutes).',
      },
      {
        id: 'env-adsense',
        title: 'Environnement AdSense',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD, SLOT_HERO, SLOT_RECENT, SLOT_CITY_DETAIL, SLOT_DEFAULT — IDs d\'unité d\'affichage. OAuth AdSense Management API : GOOGLE_ADSENSE_OAUTH_CLIENT_ID, GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET, GOOGLE_ADSENSE_OAUTH_REDIRECT_URI optionnel (défaut ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). Gardez l\'ID client uniquement dans les secrets hôte. /ads.txt généré à l\'exécution depuis l\'ID client.',
      },
      {
        id: 'env-analytics',
        title: 'Environnement analytics',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — chargeur GA4 optionnel quand consent.analytics est activé. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — balise meta Search Console.',
      },
      {
        id: 'scripts',
        title: 'Scripts npm',
        body:
          'dev, build, start — Next.js. lint, test, test:watch, verify — porte qualité (verify = lint + test + build). copy:icons — Meteocons vers public (aussi postinstall). seed:checks — snapshots démo Nord de l\'Angleterre. backfill:city-slugs — peupler city_slug sur les lieux existants. email — serveur d\'aperçu React Email. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'Tables SQLite',
        body:
          'Météo cœur : weather_snapshots, api_call_log. Lieux et consultations : locations, location_weather_checks, weather_observations, weather_forecast_archive. Abonnements : subscriptions, subscription_send_log. Plateforme : platform_settings (singleton). Heroes : hero_image_cache. Monétisation : adsense_report_snapshots. Analytics : site_analytics_events. E-mail/CMS : email_templates, cms_pages. Admin : admin_users, admin_invites, admin_password_resets, admin_audit_log. Schéma dans src/lib/db/index.js. La première ouverture seed platform_settings avec refresh 1h, stale 2h, daily limit 1000, soft block 950, warning 800, per-minute 60.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js réécrit l\'hôte docs.localhost vers /docs pour le sous-domaine documentation local. Pas de middleware auth sur les routes principales de l\'app.',
      },
      {
        id: 'localstorage-keys',
        title: 'Clés de stockage navigateur',
        body:
          'Depuis storage-keys.js : meridian:client-id, meridian:saved-cities, meridian:checked-cities, meridian:user-location, meridian:weather-cache, meridian:theme, meridian:cookie-consent, meridian:subscriptions, meridian:tier (réservé), meridian:consent, meridian:accessibility, meridian:city-detail-accordion, meridian:temperature-unit, meridian:preferred-locale, meridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — id de session analytics first-party. Cookie admin meridian_admin_session (HttpOnly, défini côté serveur). Événement personnalisé meridian:storage synchronise les hooks après écritures.',
      },
    ],
  },
];
