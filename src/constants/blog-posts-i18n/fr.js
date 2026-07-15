/** French journal posts — same ids/hrefs/imageUrls as HOME_BLOG_POSTS. */
export const BLOG_POSTS_I18N = [
  {
    id: 'reading-hourly-forecasts',
    title: 'Lire une prévision horaire sans se laisser déborder',
    excerpt:
      'Température, risque de pluie et rafales arrivent chaque heure — ce qui compte d’abord pour planifier l’après-midi.',
    category: 'Guides',
    dateLabel: '12 juil. 2026',
    dateIso: '2026-07-12',
    href: '/journal/reading-hourly-forecasts',
    imageUrl:
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Soleil perçant les nuages sur un paysage côtier',
    body: [
      'Une bande horaire paraît chargée : chaque colonne empile température, icône de ciel, chance de précipitations et souvent le vent. L’astuce est de décider à quoi sert l’après-midi — dehors, trajet ou rester chez soi — puis de ne lire que les colonnes qui changent ce plan.',
      'Commencez par la probabilité et l’intensité de précipitations ensemble. 40 % de bruine légère gâche rarement une promenade ; la même chance avec de fortes averses, si. Ensuite, suivez la tendance de température sur quatre à six heures plutôt qu’un pic isolé : le refroidissement après un midi chaud compte plus pour le soir que le maximum absolu.',
      'Les rafales sont le troisième filtre. Une brise soutenue ne se vit pas comme des rafales sèches à vélo ou sur un littoral exposé. Sur meridian, parcourez d’abord la ligne densifiée next-hour, puis l’onglet hourly pour une fenêtre plus longue.',
      'Si les chiffres restent bruyants, choisissez une décision — partir à 15 h ou attendre — et demandez si une heure après maintenant casse clairement cette décision. Le reste peut rester non lu.',
    ],
  },
  {
    id: 'ten-day-outlook',
    title: 'Ce qu’une outlook à 10 jours peut — et ne peut pas — dire',
    excerpt:
      'La confiance baisse plus on s’éloigne. Comment meridian sépare le détail proche des jours estimés au-delà de la fenêtre gratuite OpenWeather.',
    category: 'Prévisions',
    dateLabel: '10 juil. 2026',
    dateIso: '2026-07-10',
    href: '/journal/ten-day-outlook',
    imageUrl:
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Orage d’éclairs sur une skyline de nuit',
    body: [
      'Une vue à 10 jours aide pour les bagages et le week-end, mais ce n’est pas un contrat. Les modèles convergent plus au jour deux qu’au jour neuf, et les flux free s’arrêtent souvent avant dix jours en haute résolution.',
      'Sur meridian, les jours proches portent un détail plus riche du feed One Call. Plus loin, un horizon quotidien étendu peut structurer le calendrier tout en restant honnête sur ce que renvoie vraiment la fenêtre gratuite OpenWeather.',
      'Traitez le bout lointain comme une direction : plus chaud ou plus froid qu’aujourd’hui, régime plus humide ou non — pas comme un timing d’averses précis. Rafraîchissez près de la date quand le plan devient une réservation.',
      'City detail sépare les onglets Today, Hourly et Daily pour zoomer sur une confiance utile, puis reculer vers le ruban long quand vous voulez seulement le sens de la semaine.',
    ],
  },
  {
    id: 'pinning-locations',
    title: 'Épingler les villes qui comptent sur votre tableau de bord',
    excerpt:
      'Vérifier n’importe quel lieu au monde, garder une liste courte en local et voir les conditions en un coup d’œil — sans compte.',
    category: 'Produit',
    dateLabel: '8 juil. 2026',
    dateIso: '2026-07-08',
    href: '/journal/pinning-locations',
    imageUrl:
      'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Carte de voyage avec des épingles de villes',
    body: [
      'Meridian est fait pour une courte liste de lieux qui vous importent — maison, bureau, famille, prochain voyage — pas pour un second fil social météo. Cherchez une ville, ouvrez la fiche et épinglez-la dans Your Locations.',
      'Les pins vivent dans le navigateur via localStorage. La démo free reste honnête : pas de mur de compte, la liste revient après un reload sur le même appareil. Effacer les données du site efface les pins — voulu pour cette stack.',
      'Recent checks côtoient les pins pour que les recherches ponctuelles n’encombrent pas le tableau sauvé. Allow Location sur le hero pour centrer le dashboard où vous êtes, puis épinglez le reste à garder visible.',
      'Si une carte semble figée, rafraîchissez cette ville plutôt que toute la page — nous cachons en respectant les rate limits pour que la clé OpenWeather partagée survive une journée de démo.',
    ],
  },
  {
    id: 'alerts-digests',
    title: 'Digests e-mail et alertes sévères, expliqués',
    excerpt:
      'Résumés hebdomadaires les semaines calmes, alertes lieu quand les seuils cassent — e-mail free sans noyer la boîte.',
    category: 'Alertes',
    dateLabel: '5 juil. 2026',
    dateIso: '2026-07-05',
    href: '/journal/alerts-digests',
    imageUrl:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Crête montagneuse sous une lumière d’orage',
    body: [
      'Toute boîte n’a pas besoin d’un pulse de midi. Meridian sépare digests calmes et alertes à seuils pour s’abonner à un résumé hebdo sans théâtre d’orage chaque après-midi.',
      'Les digests rassemblent une courte outlook pour les lieux suivis. Les alertes partent quand pluie, vent ou bandes de température croisent vos lignes, via le même chemin d’évaluation que le cron admin weather-check.',
      'Les fournisseurs e-mail free ont des plafonds d’envoi. Templates légers, shortcodes pour variables météo de lieu, connecteurs gérés depuis le panneau e-mail admin pour échanger SMTP ou clés API sans réécrire les pages produit.',
      'Unsubscribe et préférences honnêtes comptent autant que le contenu : si les alertes sont bruyantes, baissez les seuils ou mettez en pause la liste plutôt que d’abandonner le produit.',
    ],
  },
  {
    id: 'rate-limits',
    title: 'Rester dans les limites free d’OpenWeather',
    excerpt:
      'Cache, fenêtres de refresh, et pourquoi meridian n’assomme pas l’upstream à chaque clic d’onglet — débits pratiques pour une clé démo partagée.',
    category: 'Ingénierie',
    dateLabel: '2 juil. 2026',
    dateIso: '2026-07-02',
    href: '/journal/rate-limits',
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Visualisation abstraite de globe et réseau de données',
    body: [
      'Le free tier OpenWeather est généreux pour une démo ciblée et fragile si chaque survol devient un appel réseau. Meridian traite la clé comme un budget partagé : cacher les payloads météo, debouncer les refreshes, formater en local quand seuls unités ou onglets changent.',
      'Cartes et fiches réutilisent les snapshots déjà fetchés. Refresh manuel quand vous savez que les conditions ont changé ; les polls de fond restent prudents pour qu’une salle d’interview n’épuise pas le quota avant le déjeuner.',
      'Geocode et One Call comptent séparément en pratique — une faute de frappe de recherche ne doit pas coûter un pull météo complet. Les échecs upstream deviennent des erreurs UI honnêtes plutôt que des retries silencieux en boucle.',
      'Pour un fork à fort trafic, les premiers upgrades sont une clé privée, un cache serveur plus fort et moins de prefetch showcase — pas supprimer la conscience rate-limit qui a façonné ce code.',
    ],
  },
  {
    id: 'weather-icons',
    title: 'Des codes OpenWeather aux Meteocons sur meridian',
    excerpt:
      'Pourquoi les icônes SVG locales chargent plus vite, comment map condition et métriques, et ce que vous voyez si les symboles upstream changent.',
    category: 'Design',
    dateLabel: '28 juin 2026',
    dateIso: '2026-06-28',
    href: '/journal/weather-icons',
    imageUrl:
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Pluie sur une rue de ville avec parapluie',
    body: [
      'Les codes d’icônes upstream sont des clés utiles, pas l’artwork. Meridian mappe les IDs de condition OpenWeather vers des SVG Meteocon locaux pour des cartes nettes en rétine et un mode hors ligne une fois les assets en cache.',
      'Les icônes de condition (clair, pluie, tonnerre) côtoient des glyphes métriques pour humidité, vent, UV et pression. Les deux familles dans `/public/weather-icons` évitent un hop CDN à chaque carte ville.',
      'Quand OpenWeather ajoute ou renomme des codes, la couche de mapping est le seul endroit à mettre à jour — les composants UI gardent un nom local stable. Codes manquants : repli nuageux neutre plutôt qu’image cassée.',
      'Le but : météo glanceable dans la même langue visuelle sur hero, grille et city detail — pas des clones pixel-perfect des sprites raster OpenWeather.',
    ],
  },
];
