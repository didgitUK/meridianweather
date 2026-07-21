/** French documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'Premiers pas',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Ce qu’est meridian',
        body:
          'meridian est un tableau de bord météo pour plusieurs lieux à la fois. Recherchez une ville, ouvrez sa page, épinglez-la dans Vos lieux et suivez température, conditions et courtes prévisions. Aucun compte requis. Vos villes épinglées et la plupart des préférences restent sur cet appareil.',
      },
      {
        id: 'add-city',
        title: 'Comment épingler une ville',
        body:
          '1. Saisissez au moins deux caractères dans le champ de recherche de l’accueil ou de l’en-tête. Les résultats apparaissent après une courte pause.\n2. Choisissez un lieu dans la liste — cela ouvre la page ville.\n3. Appuyez sur Épingler à vos lieux pour l’enregistrer. Vous pourrez la retirer plus tard dans le même menu ou supprimer la ville de la grille d’accueil.\n\nLes lieux épinglés apparaissent sous Vos lieux sur l’accueil. Vous pouvez en épingler jusqu’à dix. Les adresses des pages ville ressemblent à /city/london-GB-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'Limite de dix villes',
        body:
          'Vos lieux peuvent contenir jusqu’à dix villes épinglées. Si vous êtes à la limite, retirez-en une avant d’en épingler une autre.',
      },
      {
        id: 'first-visit',
        title: 'Cookies, publicité et thème',
        body:
          'Lors d’une première visite, une bannière demande comment vous souhaitez gérer le stockage et la publicité :\n\n• Tout accepter — fonctionnalités utiles plus publicité\n• Accepter fonctionnel — fonctionnalités utiles sans publicité\n• Essentiel uniquement — le minimum pour que le site fonctionne\n• Gérer les préférences — choisir les catégories vous-même\n\n« Tout accepter » n’active ni Google Analytics ni notre analyse d’usage optionnelle — activez Analytics séparément dans les préférences si proposé.\n\nVous pouvez rouvrir Préférences cookies via le contrôle flottant Paramètres (engrenage). Ce contrôle peut se masquer en défilant vers le bas et peut être masqué si votre appareil demande une réduction des animations. Le thème (clair / sombre) a son propre contrôle flottant.',
      },
      {
        id: 'navigation',
        title: 'Où aller ensuite',
        body:
          'Tableau de bord explique la page d’accueil. Détail de la ville couvre les onglets de prévision. Abonnements traite des e-mails récapitulatifs et alertes. Monétisation et consentement explique publicité et choix de confidentialité. Les pages suivantes (Prévisions et cache, Référence API, Déploiement) s’adressent surtout aux personnes qui gèrent le site.',
      },
      {
        id: 'operators',
        title: 'Pour les opérateurs du site',
        body:
          'La météo en direct nécessite OPENWEATHER_API_KEY sur le serveur. E-mail, tâches cron et AdSense sont optionnels. SQLite (better-sqlite3) stocke le cache partagé et les limites d’usage. Exécutez npm run verify pour lint, tests et build. Admin : connexion sur /login puis ouvrir /admin. Contournement dev uniquement quand NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 et ADMIN_SECRET non défini. La doc modifiée via CMS peut différer jusqu’à réinitialisation aux valeurs fichier. Sous-domaine docs local : docs.localhost:3000.',
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
        title: 'Ce que vous voyez sur l’accueil',
        body:
          'De haut en bas :\n\n1. Hero — texte de bienvenue, recherche et vérification météo rapide de votre position.\n2. Vos lieux — cartes météo pour les endroits épinglés.\n3. À proximité et populaire — deux colonnes : Près de vous et Recherches populaires.\n4. Une publicité sous Vos lieux (placeholder ou AdSense).\n5. Journal — carrousel d’articles.\n\nMasquer l’annonce et le Journal avec NEXT_PUBLIC_SHOW_HOME_STRETCH=0.',
      },
      {
        id: 'cards',
        title: 'Vos cartes de lieux',
        body:
          'Chaque carte affiche le nom du lieu, la température, la condition, l’icône météo, le ressenti, l’humidité et le vent. Appuyez sur une carte pour ouvrir la page ville complète. Pendant le chargement, un placeholder s’affiche ; en cas d’échec, vous avez Réessayer et Supprimer.',
      },
      {
        id: 'forecast-strip',
        title: 'Bandeau sept jours',
        body:
          'Sous la lecture principale, chaque carte montre une perspective sur sept jours (nom du jour, icône, max et min). Les conditions actuelles et cette perspective se chargent ensemble pour éviter une seconde étape.',
      },
      {
        id: 'card-actions',
        title: 'S’abonner et supprimer',
        body:
          'S’abonner ouvre les options e-mail pour un récapitulatif hebdomadaire et des alertes météo pour cette ville. Supprimer retire la ville de Vos lieux et efface sa météo enregistrée sur cet appareil. Si vous avez encore des alertes e-mail pour cette ville, on vous demandera si vous souhaitez aussi les annuler.',
      },
      {
        id: 'states',
        title: 'Tableau de bord vide',
        body:
          'Sans villes épinglées, la grille explique comment rechercher et épingler votre premier lieu depuis la page ville.',
      },
      {
        id: 'refresh',
        title: 'Quand les relevés se mettent à jour',
        body:
          'Par défaut, Vos lieux préfèrent le dernier relevé enregistré sur cet appareil. Appuyez sur actualiser sur une carte pour une nouvelle vérification (les nouvelles villes sans relevé enregistré se chargent aussi automatiquement). Il n’y a pas de commutateur Paramètres → Météo dans l’interface actuelle.',
      },
      {
        id: 'recent-checks',
        title: 'Près de vous et Recherches populaires',
        body:
          'Près de vous — lieux autour de votre domicile ou région, avec conditions actuelles. Ce ne sont pas « vos recherches passées ».\n\nRecherches populaires — lieux que beaucoup de personnes sur ce site ont recherchés, jusqu’à cinq cartes. Sur une installation calme ou toute neuve, vous pouvez voir quelques villes de démo jusqu’à ce que l’activité de recherche réelle s’accumule.\n\nLes cartes mènent à la page ville quand nous avons les coordonnées. Voir À proximité et populaire pour plus de détails.',
      },
      {
        id: 'operators',
        title: 'Pour les opérateurs du site',
        body:
          'Home stretch (AdSlot tableau de bord + Journal) : NEXT_PUBLIC_SHOW_HOME_STRETCH=0 (default on; set 0 to hide). Villes populaires de démo quand l’API n’a pas de lignes : SHOW_DEMO_POPULAR_SEARCHES (activé par défaut ; NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 pour désactiver). API Recherches populaires : GET /api/recent-checks (limit 20, source popular|empty). Près de vous n’utilise pas cette API. Script seed npm run seed:checks remplit uniquement weather_snapshots — pas Recherches populaires.',
      },
    ],
  },
  {
    slug: 'city-detail',
    title: 'Détail de la ville',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'access',
        title: 'Ouvrir une page ville',
        body:
          'Les résultats de recherche et les cartes d’accueil ouvrent une page pour ce lieu. Vous n’avez pas besoin d’épingler une ville pour la consulter. L’épinglage l’ajoute seulement à Vos lieux sur l’accueil. Quelques villes vitrine et les lieux déjà connus du site s’ouvrent toujours ; les adresses inconnues affichent un état vide utile ou une 404.',
      },
      {
        id: 'tabs',
        title: 'Onglets de prévision',
        body:
          'Utilisez les onglets pour passer entre :\n\n• Aujourd’hui — conditions actuelles et faits rapides\n• Horaire — les prochaines heures\n• 10 jours — perspective plus longue\n• Historique — jours passés quand nous les avons stockés\n\nVous pouvez partager un lien ouvrant un onglet (par exemple avec ?tab=hourly). Jusqu’à trois bannières d’alerte météo peuvent apparaître au-dessus de la page quand des alertes existent. Une unité publicitaire peut se trouver sous les onglets.',
      },
      {
        id: 'header',
        title: 'Carte ou photo en haut',
        body:
          'Par défaut, l’en-tête affiche une carte satellite de la zone. Les opérateurs peuvent passer aux photos de lieu (fournisseurs photo quand disponibles, sinon une image de marque simple). Street View optionnel est un réglage opérateur quand la carte de fond est désactivée.',
      },
      {
        id: 'today',
        title: 'Aujourd’hui',
        body:
          'Température et condition actuelles, tuiles métriques (humidité, vent, etc.) et sections dépliables pour plus de détails. Un court aperçu horaire pour le reste de la journée quand disponible.',
      },
      {
        id: 'hourly',
        title: 'Horaire',
        body:
          'Les douze prochaines heures : température, risque de pluie et vent en un coup d’œil.',
      },
      {
        id: 'daily',
        title: '10 jours',
        body:
          'Jusqu’à dix jours avec max/min, conditions, risque de pluie, vent et UV. Sélectionnez un jour pour focaliser le graphique.',
      },
      {
        id: 'history',
        title: 'Historique',
        body:
          'Jours passés à partir d’observations stockées quand disponibles, avec sélecteur de jour et graphique.',
      },
      {
        id: 'subscribe',
        title: 'Épingler et e-mail',
        body:
          'Le menu Options permet d’Épingler à vos lieux ou de S’abonner pour un récapitulatif hebdomadaire et des alertes météo pour ce lieu.',
      },
      {
        id: 'operators',
        title: 'Pour les opérateurs du site',
        body:
          'resolveCity() sert toujours cinq PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney) plus les lignes avec city_slug. Hero par défaut : OSM quand isCityHeroOsmEnabled() (NEXT_PUBLIC_CITY_HERO_OSM unset ou pas "0") ; photos quand OSM off (Unsplash → Wikimedia → Pexels). Opt-in Street View : NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 avec clé Maps. Batch client : current, hourly, daily uniquement — pas d’UI minutely. Historique : GET /api/weather/history. Une première vérification current réussie peut rendre la ville indexable pour sitemap/SEO.',
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
        title: 'Mises à jour par e-mail (optionnel)',
        body:
          'Vous pouvez demander à meridian de vous envoyer des e-mails — sans connexion. Choisissez une newsletter sur le produit, un récapitulatif hebdomadaire pour une ville épinglée et/ou des alertes météo quand les conditions correspondent à ce qui vous intéresse. Tout est sur inscription volontaire ; chaque e-mail inclut un moyen de se désabonner.',
      },
      {
        id: 'types',
        title: 'À quoi vous pouvez vous inscrire',
        body:
          '• Newsletter — mises à jour produit (généralement via le formulaire du pied de page).\n• Récapitulatif hebdomadaire — résumé régulier pour une ville suivie.\n• Alertes météo — e-mails quand les types d’alerte choisis se déclenchent pour une ville (pluie, vent, neige, avertissements officiels, etc.).\n\nGérez-les via S’abonner sur une carte météo ou le menu Options de la page ville.',
      },
      {
        id: 'subscribe-ui',
        title: 'Comment s’abonner',
        body:
          'Saisissez votre e-mail, choisissez récapitulatif hebdomadaire et/ou alertes, et sélectionnez les types d’alerte souhaités (ou activez tout). Vous pouvez modifier les types d’alerte plus tard. Une adresse e-mail peut suivre jusqu’à vingt lieux en récapitulatifs hebdomadaires. Si vous êtes déjà abonné, le bouton peut afficher Abonné ou Gérer.',
      },
      {
        id: 'unsubscribe',
        title: 'Comment arrêter les e-mails',
        body:
          'Utilisez le lien de désabonnement dans tout e-mail d’abonnement. Retirer une ville de Vos lieux peut aussi demander si vous souhaitez annuler les e-mails pour cette ville.',
      },
      {
        id: 'operators',
        title: 'Pour les opérateurs du site',
        body:
          'meridian:client-id anonyme lie le navigateur aux abonnements SQLite. API : GET/POST/DELETE/PATCH /api/subscriptions (PATCH met à jour alertPrefs). Livraison via le connecteur actif (Resend, SendGrid, SES ou SMTP). Sans connecteur, les lignes sont enregistrées mais les envois retournent { sent: false }. Définir NEXT_PUBLIC_APP_URL pour les liens de désabonnement. Crons : GET /api/cron/weekly-digests et /api/cron/weather-alerts avec Bearer CRON_SECRET. Les alertes fusionnent conditions OpenWeather, avertissements officiels Open-Meteo et NWS quand activé ; dédup via subscription_send_log. MAX_WEEKLY_DIGEST_LOCATIONS = 20.',
      },
    ],
  },
  {
    slug: 'monetization',
    title: 'Monétisation et consentement',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'tiers',
        title: 'Gratuit pour tous aujourd’hui',
        body:
          'meridian fonctionne comme un site météo gratuit. Il n’y a pas de paiement Premium fonctionnel ni de forfait payant supprimant les annonces. La publicité n’apparaît que si vous autorisez le consentement publicitaire et que l’opérateur a configuré Google AdSense.',
      },
      {
        id: 'consent-model',
        title: 'Vos choix de confidentialité',
        body:
          'La bannière de première visite vous laisse choisir :\n\n• Tout accepter — fonctionnalités utiles plus publicité\n• Accepter fonctionnel — fonctionnalités utiles sans publicité\n• Essentiel uniquement — le minimum pour que le site fonctionne\n• Gérer les préférences — activer ou désactiver les catégories vous-même\n\nCatégories utiles expliquées simplement :\n• Fonctionnel — mémoriser la météo sur cet appareil entre les visites ; aides de localisation précise si vous les autorisez\n• Publicité — annonces Google quand configurées\n• Analytics — mesure d’usage optionnelle et Google Analytics quand configurés (non activés par « Tout accepter »)\n\nChangez d’avis plus tard sous Paramètres → Cookies quand le contrôle flottant Paramètres est disponible (il peut se masquer en défilant et peut être indisponible avec réduction des animations).',
      },
      {
        id: 'adsense',
        title: 'Annonces que vous pourriez voir',
        body:
          'Quand la publicité est autorisée et AdSense configuré, des annonces peuvent apparaître sur le hero d’accueil, sous Vos lieux (quand le mode stretch est activé), sous les onglets de page ville et dans certains layouts journal. Si les annonces ne sont pas configurées ou que vous avez refusé la publicité, vous voyez un placeholder de marque au lieu d’une annonce live.',
      },
      {
        id: 'analytics',
        title: 'Mesure d’usage',
        body:
          'Si vous activez Analytics, le site peut enregistrer une utilisation first-party simple (comme quelles pages ont été vues) et, si configuré, charger Google Analytics. Le comptage de visibilité des emplacements publicitaires nécessite aussi le consentement publicitaire. Refuser analytics garde ces chargeurs désactivés.',
      },
      {
        id: 'data',
        title: 'Nous ne vendons pas vos données',
        body:
          'meridian ne vend pas de données personnelles. Tout futur produit de données payant nécessiterait un avis clair et un nouveau consentement.',
      },
      {
        id: 'operators',
        title: 'Pour les opérateurs du site',
        body:
          'Tier always free; meridian:tier unused; no Premium weather UI. AdSense: GOOGLE_ADSENSE_CLIENT_ID (runtime script after advertising consent; meta verification only in root HTML). Auto ads; ad-free via Stripe when STRIPE_* + ADFEEE_LICENSE_SECRET set. Analytics: SiteAnalyticsBeacon + POST /api/analytics/collect with signed meridian_consent cookie; GA4 needs NEXT_PUBLIC_GA_MEASUREMENT_ID + analytics consent.',
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
        title: 'Ce que sont les icônes',
        body:
          'Les images météo sur les cartes et prévisions sont des icônes ligne/remplissage claires (Meteocons par Bas Milius, licence MIT). Elles montrent soleil, nuages, pluie, neige, brouillard et conditions similaires à côté de la description écrite — le texte porte le sens si une image ne charge pas.',
      },
      {
        id: 'accessibility',
        title: 'Accessibilité',
        body:
          'Les icônes soutiennent les mots à l’écran. Quand une description de condition est visible, l’image est traitée comme décorative ; sinon une courte alternative textuelle est fournie à partir de la description.',
      },
      {
        id: 'operators',
        title: 'Pour les opérateurs du site',
        body:
          'Assets dans public/weather-icons/ (environ 35 fichiers SVG dans un checkout typique). scripts/copy-weather-icons.mjs copie 32 noms uniques depuis @meteocons/svg-static au postinstall / npm run copy:icons ; quelques extras (ex. sunrise, sunset, horizon) peuvent exister dans le dossier mais passent par les alias METRIC_METEOCON. Mapping : src/features/weather/utils/weather-icon.js (OPENWEATHER_TO_METEOCON). Composant : WeatherIcon.jsx. Attribution : public/weather-icons/ATTRIBUTION.txt. Tests : weather-icon.test.js.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'À proximité et populaire',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'Les deux colonnes d’accueil',
        body:
          'Sous Vos lieux, l’accueil affiche deux courtes listes de lieux.\n\nPrès de vous — lieux suggérés près de votre domicile ou région, avec conditions en direct. Ce n’est pas un journal privé de tout ce que vous avez recherché.\n\nRecherches populaires — lieux souvent recherchés sur ce site. Là aussi, c’est à l’échelle du site, pas « votre historique personnel ».',
      },
      {
        id: 'ui',
        title: 'Comportement des cartes',
        body:
          'Chaque colonne affiche jusqu’à cinq cartes avec icône, température, description et nom du lieu. Appuyez sur une carte pour ouvrir la page ville quand les coordonnées sont disponibles.',
      },
      {
        id: 'demo-empty',
        title: 'Quand Recherches populaires semble rempli sur une nouvelle installation',
        body:
          'Si presque personne n’a encore recherché, le site peut afficher quelques villes de démo connues dans Recherches populaires pour que la colonne ne soit pas vide. Les opérateurs peuvent désactiver cette liste de démo. Près de vous dépend toujours des signaux de localisation et des données de lieux proches.',
      },
      {
        id: 'operators',
        title: 'Pour les opérateurs du site',
        body:
          'Données Recherches populaires : GET /api/recent-checks → getRecentChecksPayload() → listPopularSearchChecks sur location_weather_checks (triggers search_select / search_preview), default limit 20, source popular|empty. L’API elle-même n’hydrate pas les showcases.\n\nRepli démo UI : quand l’API renvoie vide et SHOW_DEMO_POPULAR_SEARCHES est true (défaut ; désactiver avec NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0), Recherches populaires se remplit depuis PLATFORM_SHOWCASE_CITIES.\n\nPrès de vous : lieux proches depuis le profil de localisation accueil + batch météo current — pas l’API recent-checks.\n\nnpm run seed:checks écrit des weather_snapshots North England pour démos cache L2 ; n’insère pas de lignes de vérification déclenchées par recherche et ne remplit pas Recherches populaires seul.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'Prévisions et cache',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'À qui s’adresse cette page',
        body:
          'Les visiteurs quotidiens peuvent ignorer cette page. Elle explique comment le site stocke et rafraîchit les données météo pour ceux qui exploitent ou intègrent meridian. En termes simples : votre navigateur retient un relevé récent ; le serveur retient aussi des relevés partagés pour ne pas appeler le fournisseur météo à chaque clic.',
      },
      {
        id: 'scopes',
        title: 'Scopes météo',
        body:
          'Scopes demandables par le client : current (maintenant), hourly (chronologie), daily (chronologie), minutely (précipitations — API uniquement ; détail ville ne charge pas minutely aujourd’hui). Scopes serveur uniquement : geocode (cache recherche ville clé geocode:{query}), alert (payloads d’alerte individuels). Chaque scope météo utilise la clé cache {lat},{lon},{scope} ; geocode par chaîne de requête.',
      },
      {
        id: 'layers',
        title: 'Couches de cache',
        body:
          'L0 — localStorage navigateur meridian:weather-cache, structure {cityId: {scope: {payload, fetchedAt}}} (écritures nécessitent consentement fonctionnel). L1 — Map en mémoire sur le processus serveur. L2 — SQLite weather_snapshots avec fetched_at, expires_at, stale_until. Le client lit L0 puis appelle l’API ; le serveur lit L1 puis L2 puis upstream OpenWeather.',
      },
      {
        id: 'freshness',
        title: 'États de fraîcheur',
        body:
          'fresh — dans expires_at. acceptable — après expires mais dans stale_until (peut encore être servi). expired — au-delà de stale_until, déclenche upstream si quota le permet. emergency — quota bloqué mais snapshot L2 expiré/acceptable servi quand même pour que les utilisateurs voient encore des données.',
      },
      {
        id: 'ttl-table',
        title: 'TTL par défaut (SCOPE_TTL)',
        body:
          'current — fresh 1h, stale 2h (remplacé par platform_settings.refresh_interval_ms et stale_cache_max_ms ; admin peut définir 10m–2h). hourly — fresh 2h, stale 6h. daily — fresh 6h, stale 12h. minutely — fresh 15m, stale 30m. geocode — fresh 7d, stale 30d. alert — fresh 1h, stale 6h.',
      },
      {
        id: 'upstream',
        title: 'Intégration OpenWeather',
        body:
          'Principal : One Call API 4.0 (onecall/current, timeline/1h, timeline/1day, timeline/1min). Le scope current bascule sur API 2.5 /weather si One Call current échoue. Geocode utilise l’API geocoding OpenWeather (limit 5). Normalisation dans src/lib/one-call.js produit des payloads UI cohérents.',
      },
      {
        id: 'batch',
        title: 'Récupération par lot',
        body:
          'POST /api/weather/batch accepte { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Les scopes sont par ville (city.scopes), pas un tableau scopes de niveau supérieur. Le tableau de bord charge current + daily ensemble en un lot (pas de requestIdleCallback). Détail ville batch uniquement current + hourly + daily. Le handler espace les villes ~100ms pour éviter les limites de débit en rafale.',
      },
      {
        id: 'headers',
        title: 'Métadonnées de réponse',
        body:
          'Les réponses API incluent meta : cacheLayer (memory, database, upstream), freshness, fetchedAt, ageMs, upstreamCallAvoided, source. L’en-tête X-Cache reflète hit/miss le cas échéant. « Mis à jour il y a X » dans l’UI utilise meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'Interaction quota',
        body:
          'Quand les limites journalières ou par minute sont dépassées, les appels upstream s’arrêtent et des données L2 emergency stale sont renvoyées si disponibles. Rouvrir une ville dans le TTL coûte zéro appel upstream.',
      },
      {
        id: 'logging',
        title: 'Journalisation des hits cache',
        body:
          'Les hits cache base L2 journalisent dans api_call_log avec cache_hit=1 et n’incrémentent pas le compteur upstream journalier. Les hits mémoire L1 sont servis mais intentionnellement non persistés dans SQLite — ils se déclenchent à chaque remontage SSR/client et feraient tourner meridian.db sous file watchers.',
      },
      {
        id: 'payload-fields',
        title: 'Champs payload current',
        body:
          'temperature, feelsLike, description, condition, icon (code OpenWeather), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'Limites API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'À qui s’adresse cette page',
        body:
          'Cette page s’adresse aux personnes qui gèrent le site. Les données météo consultées sont partagées et favorables au cache pour que les limites OpenWeather gratuites (défaut 1000 appels/jour) soient moins souvent épuisées.',
      },
      {
        id: 'quota',
        title: 'Quota journalier et par minute',
        body:
          'Défauts depuis constants/weather.js : DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 appels upstream par minute glissante. platform_settings peut remplacer daily_limit, soft_block_threshold, warning_threshold et per_minute_limit (défauts semés au premier ouverture DB). Compteur remis à zéro à minuit UTC.',
      },
      {
        id: 'status',
        title: 'Valeurs de statut',
        body:
          'ok — sous le seuil d’avertissement. warning — à ou au-dessus de warning_threshold (défaut 800 appels aujourd’hui). soft_block — à ou au-dessus de soft_block_threshold (défaut 950) ; upstream bloqué. hard_block — à daily_limit (défaut 1000). Le plafond par minute bloque aussi upstream quand per_minute_limit appels ont eu lieu dans les 60 dernières secondes.',
      },
      {
        id: 'cache-hits',
        title: 'Hits cache vs upstream',
        body:
          'Les hits base L2 journalisent dans api_call_log avec cache_hit=1 et n’incrémentent pas le compteur upstream journalier. Les hits mémoire L1 ne sont pas journalisés dans SQLite — recordCacheHit retourne tôt quand meta.layer est memory. Seuls les appels upstream OpenWeather réussis (statut 200, cache_hit=0) comptent pour le quota. Les serves emergency stale évitent upstream quand bloqué.',
      },
      {
        id: 'admin-shortcut',
        title: 'Diagnostics admin',
        body:
          'Ouvrez /admin (après connexion) pour utilisé aujourd’hui / limite journalière, restant, statut et réglages d’intervalle de rafraîchissement. API : GET /api/admin/usage.',
      },
      {
        id: 'admin-api',
        title: 'API admin',
        body:
          'GET /api/admin/usage — instantané quota et appels récents. GET|PATCH /api/admin/config — API principale des réglages admin (intervalle de rafraîchissement, connecteurs, défauts digest, AdSense, bascules alertes, etc.). Legacy étroit : PATCH /api/admin/settings { refreshIntervalMs }. Auth : cookie de session HttpOnly meridian_admin_session après /login. Secret de signature ADMIN_SECRET (pas ADMIN_PASSWORD). Contournement dev quand NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 et ADMIN_SECRET unset.',
      },
      {
        id: 'openweather',
        title: 'Limites fournisseur OpenWeather',
        body:
          'meridian suit son propre compteur upstream ; OpenWeather peut aussi limiter ou rejeter les clés indépendamment (401, 429). L’orchestrateur les mappe vers des erreurs API structurées pour le client.',
      },
      {
        id: 'emergency',
        title: 'Mode urgence',
        body:
          'En soft/hard block, les utilisateurs voient encore le dernier snapshot SQLite acceptable marqué freshness emergency plutôt qu’une erreur vide — sauf si aucun snapshot n’a jamais existé pour ces coordonnées.',
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
        title: 'Vue d’ensemble',
        body:
          'Cette page s’adresse aux développeurs et opérateurs intégrant les API meridian — les visiteurs quotidiens peuvent l’ignorer. Toutes les routes API sont des handlers Next.js App Router sous src/app/api/. Météo et geocode nécessitent OPENWEATHER_API_KEY. Les routes cron nécessitent Authorization: Bearer CRON_SECRET. Les routes admin nécessitent un cookie de session admin authentifié (meridian_admin_session) après connexion sur /login, sauf ALLOW_DEV_ADMIN_BYPASS en développement.',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query : lat, lon, scope (current|hourly|daily|minutely), trigger optionnel, lang. Renvoie payload météo plus fetchedAt, cacheHit, freshness, source, trigger, tokensUsed. L’en-tête X-Cache reflète la couche cache. Erreurs : 400 invalid params, 404 location not found, 429 rate_limited, 502 upstream_error ou service_unavailable.',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body : { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Renvoie { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. Scopes par ville, pas de tableau de niveau supérieur. Limité à 20 requêtes/minute par IP. Utilisé par les hooks tableau de bord et détail ville.',
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
          'Query : q (min 2 caractères), paramètres context optionnels. Renvoie tableau normalisé : name, country, state, lat, lon, label. Limite upstream 5 résultats. Mis en cache L2 avec scope geocode. Limité à 60 requêtes/minute par IP.',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'Sans paramètres. Renvoie { checks, source } où source est popular quand des lignes déclenchées par recherche existent, ou empty quand aucune. Limite par défaut 20 depuis location_weather_checks classées par volume de recherche (triggers search_select et search_preview). L’API n’a pas de repli showcase — l’UI accueil peut quand même montrer des villes populaires de démo quand vide si SHOW_DEMO_POPULAR_SEARCHES est activé. La colonne Près de vous n’utilise pas cette route.',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — lister les abonnements actifs pour le client. POST — créer { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — mettre à jour alertPrefs sur une ligne city_alerts { clientId, id, alertPrefs }. DELETE — body { clientId, cityLat, cityLon, types[] }. Types : newsletter, city_weekly, city_alerts.',
      },
      {
        id: 'unsubscribe',
        title: 'GET /api/unsubscribe',
        body:
          'Query : token (unsubscribe_token UUID). Désactive l’abonnement et renvoie une confirmation HTML.',
      },
      {
        id: 'alerts',
        title: 'GET /api/alerts/[alertId]',
        body:
          'Renvoie alerte normalisée : id, senderName, event, start, end, description. Source : scope alert en cache.',
      },
      {
        id: 'cron',
        title: 'Routes cron',
        body:
          'GET /api/cron/weekly-digests — envoyer les e-mails récapitulatifs hebdomadaires groupés par e-mail abonné. GET /api/cron/weather-alerts — évaluer alertPrefs contre OpenWeather, Open-Meteo et flux NWS et envoyer les e-mails d’alerte. Les deux nécessitent Bearer CRON_SECRET.',
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
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — config placement avec slotId si défini. GET /api/ads/placeholder-bg — lookup hero pour surfaces placeholder. Route app GET /ads.txt — ligne éditeur AdSense depuis env. Placements AdSlot actifs : dashboard, hero, city-detail. env slot recent-checks existe mais l’accueil n’a pas d’AdSlot.',
      },
      {
        id: 'other',
        title: 'Autres routes publiques',
        body:
          'GET /api/platform/limits — instantané quota public. POST /api/analytics/collect — beacon analytics first-party. GET /api/location/region — aide IP/région. POST /api/weather/inaccurate-report — signaler de mauvaises données. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — tuiles overlay hero OSM. Auth : POST /api/auth/login, /logout ; POST /api/auth/forgot-password ; POST /api/auth/reset-password/[token] ; GET|POST /api/auth/invite/[token] ; GET /api/auth/session.',
      },
      {
        id: 'errors',
        title: 'Forme d’erreur',
        body:
          'Erreurs JSON typiquement { error: code, message: string }. Codes ApiError incluent invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error, unauthorized, not_found, limit_reached.',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'Déploiement et environnement',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'À qui s’adresse cette page',
        body:
          'Cette page s’adresse aux personnes déployant meridian. Les visiteurs quotidiens n’ont pas besoin de ces réglages. Une démo fonctionnelle ne nécessite que OPENWEATHER_API_KEY ; tout le reste est du stretch optionnel.',
      },
      {
        id: 'env-required',
        title: 'Environnement requis',
        body:
          'OPENWEATHER_API_KEY — requis pour météo et geocode. DATABASE_PATH — fichier SQLite (défaut ./data/meridian.db) ; volume persistant en production pour que cache et abonnements survivent aux redémarrages. NEXT_PUBLIC_SHOW_HOME_STRETCH=0 masque annonce tableau de bord + Journal (activé par défaut). NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 désactive les villes populaires de démo quand l’API est vide.',
      },
      {
        id: 'env-hero',
        title: 'Environnement image hero',
        body:
          'UNSPLASH_ACCESS_KEY — optionnel ; premier fournisseur photo pour heroes de lieu (serveur uniquement, cache dans hero_image_cache). PEXELS_API_KEY — troisième fournisseur optionnel après Unsplash et Wikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — mettre à 0 pour désactiver l’en-tête carte satellite (activé par défaut). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — opt-in Google Street View quand OSM est off. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — clé Maps Embed API optionnelle pour iframes Street View.',
      },
      {
        id: 'env-email',
        title: 'Environnement e-mail',
        body:
          'Multi-ESP via connecteur actif dans platform_settings (sélecteur admin) : Resend (RESEND_API_KEY, RESEND_FROM_EMAIL), SendGrid (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL), Amazon SES (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION, AWS_SES_FROM_EMAIL) ou SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_SECURE). NEXT_PUBLIC_APP_URL — URL de base pour liens de désabonnement dans les e-mails (listé dans .env.example ; requis en production).',
      },
      {
        id: 'env-cron',
        title: 'Cron et admin',
        body:
          'CRON_SECRET — Bearer pour /api/cron/* (refusé si unset en production). ADMIN_SECRET — signe le cookie de session admin et chiffre les secrets connecteurs. ADMIN_PASSWORD — connexion root pour ADMIN_EMAIL uniquement. Contournement dev uniquement quand NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 et ADMIN_SECRET unset. Voir docs/SECURITY.md. Planifier cron en externe : weekly-digests (ex. lundi matin), weather-alerts (ex. toutes les 15–30 minutes).',
      },
      {
        id: 'env-adsense',
        title: 'Environnement AdSense',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD, SLOT_HERO, SLOT_RECENT, SLOT_CITY_DETAIL, SLOT_DEFAULT — IDs d’unités display. OAuth AdSense Management API : GOOGLE_ADSENSE_OAUTH_CLIENT_ID, GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET, GOOGLE_ADSENSE_OAUTH_REDIRECT_URI optionnel (défaut ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). Garder l’ID client uniquement dans les secrets hôte. /ads.txt généré à l’exécution depuis l’ID client.',
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
          'dev, build, start — Next.js. lint, test, test:watch, verify — porte qualité (verify = lint + test + build). copy:icons — Meteocons vers public (aussi postinstall). seed:checks — snapshots démo North England. backfill:city-slugs — remplir city_slug sur locations existantes. email — serveur aperçu React Email. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'Tables SQLite',
        body:
          'Météo cœur : weather_snapshots, api_call_log. Lieux et checks : locations, location_weather_checks, weather_observations, weather_forecast_archive. Abonnements : subscriptions, subscription_send_log. Plateforme : platform_settings (singleton). Heroes : hero_image_cache. Monétisation : adsense_report_snapshots. Analytics : site_analytics_events. E-mail/CMS : email_templates, cms_pages. Admin : admin_users, admin_invites, admin_password_resets, admin_audit_log. Schéma dans src/lib/db/index.js. Première ouverture sème platform_settings avec refresh 1h, stale 2h, limite journalière 1000, soft block 950, warning 800, per-minute 60.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js réécrit l’hôte docs.localhost vers /docs pour le sous-domaine documentation local. Pas de middleware auth sur les routes app principales.',
      },
      {
        id: 'localstorage-keys',
        title: 'Clés stockage navigateur',
        body:
          'Depuis storage-keys.js : meridian:client-id, meridian:saved-cities, meridian:checked-cities, meridian:user-location, meridian:weather-cache, meridian:theme, meridian:cookie-consent, meridian:subscriptions, meridian:tier (réservé), meridian:consent, meridian:accessibility, meridian:city-detail-accordion, meridian:temperature-unit, meridian:preferred-locale, meridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — ID session analytics first-party. Cookie admin meridian_admin_session (HttpOnly, défini serveur). Événement custom meridian:storage synchronise les hooks après écritures.',
      },
    ],
  },
];
