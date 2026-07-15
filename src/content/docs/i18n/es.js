/** Spanish documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'Primeros pasos',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Resumen',
        body:
          'meridian es un panel meteorológico multi-ciudad. Busca ubicaciones, fija hasta diez ciudades en tu navegador y consulta las condiciones actuales, pronósticos breves y actualizaciones opcionales por correo. No se requiere cuenta: las listas de ciudades y las preferencias se guardan por dispositivo en localStorage.',
      },
      {
        id: 'requirements',
        title: 'Requisitos',
        body:
          'El panel necesita una clave de API de OpenWeather en el servidor (OPENWEATHER_API_KEY). Sin ella, las solicitudes de clima y geocodificación devuelven errores. Las suscripciones por correo, los trabajos cron y AdSense son opcionales y solo se activan cuando se configuran sus variables de entorno o conectores. SQLite (better-sqlite3) siempre está activo para caché y cuotas.',
      },
      {
        id: 'add-city',
        title: 'Fijar una ciudad',
        body:
          'Usa el campo de búsqueda en el hero de la página de inicio o en la cabecera. Escribe al menos dos caracteres; los resultados aparecen tras un debounce de 300 ms. Selecciona un resultado de geocodificación para abrir la página de detalle de la ciudad. Usa Fijar en tus ubicaciones en esa página para guardar la ciudad en Tus ubicaciones. Los duplicados se rechazan. Cada ciudad recibe un ID estable: {slugified-name}-{country}-{latitude to four decimals}, usado en URLs como /city/london-gb-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'Límite de ciudades',
        body:
          'Puedes fijar hasta diez ciudades (MAX_SAVED_CITIES). Al alcanzar el límite, solo puedes fijar otra ciudad después de eliminar una de tu cuadrícula.',
      },
      {
        id: 'first-visit',
        title: 'Primera visita: cookies y tema',
        body:
          'En la primera visita, un banner de cookies explica el uso del almacenamiento local. Botones: Aceptar todo (funcional + publicidad), Aceptar funcional, Solo esenciales y Gestionar preferencias. Vuelve a abrir la configuración de cookies en cualquier momento mediante el control flotante de Ajustes (pestaña Cookies). El interruptor flotante de tema cambia la preferencia claro u oscuro (guardada en meridian:theme).',
      },
      {
        id: 'navigation',
        title: 'Próximos pasos',
        body:
          'Dashboard explica el diseño de la página de inicio. City detail cubre las páginas de pronóstico completas. Forecasts & cache explica los TTL y las capas de caché. Subscriptions trata el correo electrónico. API limits y API reference documentan el comportamiento del servidor. La documentación también se sirve en docs.localhost:3000 en desarrollo local (reescritura de middleware). Los documentos editados en el CMS pueden divergir hasta restablecer los valores por defecto de archivo.',
      },
      {
        id: 'verify',
        title: 'Para desarrolladores',
        body:
          'Ejecuta npm run verify para lint, pruebas y build. Ejecuta npm run dev y abre localhost:3000. Opcional: inicia sesión en /login y abre /admin para diagnósticos de uso y ajustes de la plataforma (puede aplicarse bypass de desarrollo cuando ADMIN_SECRET no está definido en desarrollo).',
      },
    ],
  },
  {
    slug: 'dashboard',
    title: 'Panel',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'layout',
        title: 'Diseño de la página',
        body:
          'Bandas de la página de inicio: (1) Hero — presentación del producto, consulta meteorológica por ubicación y un anuncio cuadrado en el hero. (2) Recent checks — dos columnas («Cerca de ti» y «Búsquedas populares»). (3) Your locations — tarjetas meteorológicas de ciudades fijadas. (4) Marcador/unidad de anuncio del panel. (5) Journal — seis tarjetas de artículos tipo blog en un carrusel izquierda/derecha que enlazan a publicaciones `/journal/[slug]`.',
      },
      {
        id: 'cards',
        title: 'Tarjetas meteorológicas',
        body:
          'Cada tarjeta muestra nombre de la ciudad, región/país, temperatura actual, descripción de la condición, icono Meteocons, sensación térmica, humedad y viento. Las tarjetas enlazan a la página de detalle de la ciudad. Al pasar el cursor se precarga la ruta de detalle y los datos meteorológicos.',
      },
      {
        id: 'forecast-strip',
        title: 'Mini pronóstico de siete días',
        body:
          'Debajo de la lectura principal, cada tarjeta muestra una perspectiva de siete días (etiqueta del día, icono, mín/máx). Los ámbitos current y daily se cargan juntos en una sola solicitud batch del panel — no hay una carga daily separada con idleCallback. La franja muestra etiqueta del día, icono y rango de temperatura mín/máx.',
      },
      {
        id: 'card-actions',
        title: 'Acciones de la tarjeta',
        body:
          'Subscribe abre un modal para el resumen semanal y los correos de alertas meteorológicas de esa ciudad. Remove (X) elimina la ciudad de localStorage y borra su caché meteorológica del navegador. Si tienes suscripciones de correo activas para esa ciudad, un diálogo ofrece darse de baja antes de eliminarla.',
      },
      {
        id: 'states',
        title: 'Estados de carga y error',
        body:
          'Mientras carga el clima, se muestra una tarjeta esqueleto. Si falla el servicio upstream, la tarjeta muestra una alerta de error con acciones Retry y Remove. Una cuadrícula vacía muestra orientación para buscar y fijar tu primera ciudad desde la página de detalle.',
      },
      {
        id: 'refresh',
        title: 'Comportamiento de actualización',
        body:
          'Por defecto, Your locations usa actualización manual (`meridian:weather-refresh-mode`): el panel muestra la última lectura guardada en este navegador al cargar la página y solo obtiene datos cuando pulsas actualizar en una tarjeta (o cuando una ciudad aún no tiene caché local). No hay panel Settings → Weather en la UI actual; la clave existe para uso programático o futuro. Los datos también se cachean en el servidor (memoria + SQLite). Consulta Forecasts & cache para los detalles de TTL.',
      },
      {
        id: 'recent-checks',
        title: 'Recent checks',
        body:
          'Dos columnas muestran hasta cinco tarjetas cada una desde GET /api/recent-checks (búsquedas populares de location_weather_checks, límite de API 20, source popular|empty). Las tarjetas enlazan al detalle de la ciudad cuando existen coordenadas. npm run seed:checks solo rellena weather_snapshots — no rellena esta franja. Consulta Recent checks & seeding.',
      },
    ],
  },
  {
    slug: 'city-detail',
    title: 'Detalle de ciudad',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'access',
        title: 'Quién puede ver una página de ciudad',
        body:
          'Las páginas de detalle viven en /city/[cityId]. resolveCity() siempre sirve las cinco PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney). Cualquier fila de ubicación con city_slug también se resuelve. Los ID parseados con la forma {name}-{country}-{lat} coinciden cuando lat/country existen en SQLite. Slugs desconocidos o mal formados devuelven 404. No necesitas fijar una ciudad para abrir su página.',
      },
      {
        id: 'tabs',
        title: 'Pestañas de pronóstico',
        body:
          'Pestañas fijas: Today, Hourly, 10-Day e History. Enlace profundo con ?tab=hourly, ?tab=daily o ?tab=history. El legado ?tab=next-hour redirige a Today. Hasta tres banners de alerta de OpenWeather se renderizan sobre el hero cuando hay alertIds. Un AdSlot de city-detail se sitúa directamente bajo las pestañas.',
      },
      {
        id: 'header',
        title: 'Cabecera y hero de la página',
        body:
          'Por defecto la cabecera usa un fondo de mapa satelital OSM cuando isCityHeroOsmEnabled() es true (NEXT_PUBLIC_CITY_HERO_OSM sin definir o distinto de "0"). Define NEXT_PUBLIC_CITY_HERO_OSM=0 para preferir fotos. El modo foto hace cascada Unsplash → Wikimedia Commons → Pexels vía getHeroImageForRegion, con SVG estáticos de respaldo cuando faltan claves. Google Street View opcional se aplica cuando OSM está desactivado y NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1.',
      },
      {
        id: 'today',
        title: 'Pestaña Today',
        body:
          'Hero de condiciones actuales, mosaicos de métricas con iconos Meteocon y acordeones Current conditions / Location / Sun times. Vista previa horaria del resto del día cuando hay datos hourly disponibles.',
      },
      {
        id: 'hourly',
        title: 'Pestaña Hourly',
        body:
          'Lista de tarjetas de las próximas 12 horas (una columna) para temperatura a corto plazo, probabilidad de precipitación y viento.',
      },
      {
        id: 'daily',
        title: 'Pestaña 10-Day',
        body:
          'Lista de perspectiva diaria (hasta diez días): día de la semana, icono, descripción/resumen, mín/máx, probabilidad de lluvia, viento, UV. Al seleccionar un día se abre el gráfico de métricas de esa fecha.',
      },
      {
        id: 'history',
        title: 'Pestaña History',
        body:
          'Días pasados desde observaciones almacenadas y pronósticos archivados vía GET /api/weather/history, con selector de día y gráfico.',
      },
      {
        id: 'alerts',
        title: 'Alertas meteorológicas',
        body:
          'Cuando OpenWeather devuelve alertas, AlertBanner muestra como máximo tres sobre el hero. El texto completo de la alerta está disponible vía GET /api/alerts/[alertId].',
      },
      {
        id: 'data',
        title: 'Carga de datos',
        body:
          'SSR hidrata current, daily y hourly cuando están disponibles desde getCityWeatherForSeo. El hook cliente useCityWeather obtiene por batch DETAIL_SCOPES = [current, hourly, daily] vía POST /api/weather/batch — minutely no se solicita. Premium / MinutelyPrecipStrip no está conectado.',
      },
      {
        id: 'subscribe',
        title: 'Fijar y suscribirse',
        body:
          'El menú Options de la cabecera ofrece Pin to your locations y Subscribe (resumen semanal + alertas meteorológicas) — los mismos flujos que las tarjetas del panel. Pin guarda en meridian:saved-cities; subscribe abre SubscribeDialog.',
      },
      {
        id: 'prefetch',
        title: 'Precarga',
        body:
          'Al pasar el cursor sobre una tarjeta meteorológica del panel se precarga /city/[cityId] y se calienta la caché L0 vía prefetchCityDetail para que las páginas de detalle abran más rápido.',
      },
      {
        id: 'seo',
        title: 'Búsqueda y descubrimiento',
        body:
          'Cuando una ubicación recibe su primera comprobación exitosa de clima actual, markLocationIndexable establece city_slug e indexable_at, añade la ciudad al sitemap y renderiza en servidor metadatos SEO más un bloque de resumen en la página de la ciudad.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'Pronósticos y caché',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'scopes',
        title: 'Ámbitos meteorológicos',
        body:
          'Ámbitos solicitables por el cliente: current (ahora), hourly (línea temporal), daily (línea temporal), minutely (precipitación). Ámbitos solo servidor: geocode (caché de búsqueda de ciudades con clave geocode:{query}), alert (cargas de alertas individuales). Cada ámbito meteorológico usa clave de caché {lat},{lon},{scope}; geocode por cadena de consulta.',
      },
      {
        id: 'layers',
        title: 'Capas de caché',
        body:
          'L0 — localStorage del navegador meridian:weather-cache, estructura {cityId: {scope: {payload, fetchedAt}}}. L1 — Map en memoria en el proceso del servidor. L2 — SQLite weather_snapshots con fetched_at, expires_at, stale_until. Las lecturas comprueban L0 → API → L1/L2 → upstream OpenWeather.',
      },
      {
        id: 'freshness',
        title: 'Estados de frescura',
        body:
          'fresh — dentro de expires_at. acceptable — pasado expires pero dentro de stale_until (puede seguir sirviéndose). expired — más allá de stale_until, dispara upstream si la cuota lo permite. emergency — cuota bloqueada pero se sirve de todos modos snapshot L2 expired/acceptable para que los usuarios sigan viendo datos.',
      },
      {
        id: 'ttl-table',
        title: 'TTL por defecto (SCOPE_TTL)',
        body:
          'current — fresh 1h, stale 2h (sobrescrito por platform_settings.refresh_interval_ms y stale_cache_max_ms; el admin puede fijar 10m–2h). hourly — fresh 2h, stale 6h. daily — fresh 6h, stale 12h. minutely — fresh 15m, stale 30m. geocode — fresh 7d, stale 30d. alert — fresh 1h, stale 6h.',
      },
      {
        id: 'upstream',
        title: 'Integración con OpenWeather',
        body:
          'Principal: One Call API 4.0 (onecall/current, timeline/1h, timeline/1day, timeline/1min). El ámbito current hace fallback a API 2.5 /weather si falla One Call current. Geocode usa la API de geocodificación de OpenWeather (límite 5). La normalización en src/lib/one-call.js produce cargas coherentes para la UI.',
      },
      {
        id: 'batch',
        title: 'Obtención por lotes',
        body:
          'POST /api/weather/batch acepta { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Los ámbitos son por ciudad (city.scopes), no un array scopes de nivel superior. El panel carga current + daily juntos en un batch (sin requestIdleCallback). El detalle de ciudad hace batch solo de current + hourly + daily. El manejador espacia ciudades ~100 ms para evitar picos de límite de tasa.',
      },
      {
        id: 'headers',
        title: 'Metadatos de respuesta',
        body:
          'Las respuestas de API incluyen meta: cacheLayer (memory, database, upstream), freshness, fetchedAt, ageMs, upstreamCallAvoided, source. La cabecera X-Cache refleja hit/miss cuando aplica. «Updated X ago» en la UI usa meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'Interacción con la cuota',
        body:
          'Cuando se superan los límites diarios o por minuto, las llamadas upstream se detienen y se devuelven datos L2 stale en modo emergency si están disponibles. Reabrir una ciudad dentro del TTL cuesta cero llamadas upstream.',
      },
      {
        id: 'logging',
        title: 'Registro de aciertos de caché',
        body:
          'Los aciertos de caché L2 en base de datos se registran en api_call_log con cache_hit=1 y no incrementan el contador diario upstream. Los aciertos L1 en memoria se sirven pero no se persisten en SQLite — se disparan en cada remount SSR/cliente y saturarían meridian.db bajo file watchers.',
      },
      {
        id: 'payload-fields',
        title: 'Campos de la carga current',
        body:
          'temperature, feelsLike, description, condition, icon (código OpenWeather), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'Recent checks y seeding',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'Qué son recent checks',
        body:
          'Recent checks en la página de inicio muestran búsquedas populares de toda la plataforma — ubicaciones ordenadas por la frecuencia con que los usuarios las seleccionaron o previsualizaron en la búsqueda — no tu historial personal de búsqueda ni un volcado bruto de la caché de snapshots meteorológicos.',
      },
      {
        id: 'api',
        title: 'Comportamiento de la API',
        body:
          'GET /api/recent-checks llama a getRecentChecksPayload(), que lee location_weather_checks (unido a locations) vía listPopularSearchChecks. El límite por defecto es 20. Los triggers contados son search_select y search_preview. La forma de respuesta es { checks, source } donde source es popular cuando hay filas, o empty cuando no hay ninguna. No hay showcase fallback.',
      },
      {
        id: 'ui',
        title: 'UI de inicio',
        body:
          'RecentChecksSection muestra dos columnas («Cerca de ti» y «Búsquedas populares»), hasta cinco tarjetas cada una. Las tarjetas usan iconos Meteocons, temperatura, descripción y etiqueta de ciudad. Cuando existen coordenadas, las tarjetas enlazan a /city/[cityId]. No hay AdSlot de recent-checks en la página de inicio.',
      },
      {
        id: 'seed-script',
        title: 'Seeding de weather snapshots (no la franja)',
        body:
          'Ejecuta npm run seed:checks con OPENWEATHER_API_KEY definido. El script obtiene el clima actual de cuarenta y tres ubicaciones en Cumbria y el noreste de Inglaterra (ver src/constants/seed-locations.js), escribe weather_snapshots en SQLite con marcas de tiempo fetched_at escalonadas y enriquece las cargas con nombres de ciudad. Eso rellena la caché L2 para demos — no inserta filas location_weather_checks disparadas por búsqueda, así que no rellenará la franja recent-checks / búsquedas populares.',
      },
      {
        id: 'persistence',
        title: 'Persistencia',
        body:
          'Los snapshots sembrados viven en DATABASE_PATH (por defecto ./data/meridian.db). Volver a ejecutar el script hace upsert por cache_key. Las filas de búsqueda popular se acumulan cuando se registran búsquedas reales; vaciar la base de datos borra snapshots e historial de comprobaciones (la franja queda vacía hasta que ocurran nuevas búsquedas).',
      },
    ],
  },
  {
    slug: 'subscriptions',
    title: 'Suscripciones',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Resumen',
        body:
          'meridian admite correo opcional: boletín de la plataforma (actualizaciones del producto) y resúmenes semanales por ciudad más alertas meteorológicas. Todas las suscripciones requieren opt-in explícito. Sin cuenta — un UUID anónimo clientId en meridian:client-id enlaza la UI del navegador con las filas del servidor.',
      },
      {
        id: 'types',
        title: 'Tipos de suscripción',
        body:
          'newsletter — actualizaciones del producto meridian desde NewsletterSignup del pie de página. city_weekly — correo de resumen semanal para una ciudad guardada. city_alerts — notificaciones cuando los tipos de alerta habilitados coinciden (ver reglas de alerta). Los tipos se guardan en SQLite subscriptions.type y se reflejan en el registro local meridian:subscriptions.',
      },
      {
        id: 'client-linking',
        title: 'Client ID y registro local',
        body:
          'En la primera visita se escribe un UUID en meridian:client-id. POST /api/subscriptions asocia correo + preferencias con este clientId. GET /api/subscriptions?clientId= hidrata meridian:subscriptions al cargar. DELETE desactiva por clientId, coordenadas de ciudad y types.',
      },
      {
        id: 'alert-prefs',
        title: 'Preferencias de alerta',
        body:
          'Las filas city_alerts almacenan alert_prefs_json — un mapa booleano por id de tipo de alerta (rain, wind, thunderstorm, snow, ice, extreme_heat, fog, niveles de severidad, hidrológicas, calidad del aire, marinas, UV, alertas severas de EE. UU. y más — ver ALL_ALERT_TYPES en constants/alert-types.js). PATCH /api/subscriptions actualiza alertPrefs parciales en una fila de alertas existente. Las columnas legacy alert_on_rain y alert_on_storm se mantienen sincronizadas al crear.',
      },
      {
        id: 'subscribe-ui',
        title: 'Modal de suscripción',
        body:
          'En cada tarjeta meteorológica y menú Options del detalle de ciudad: campo de correo, casilla de resumen semanal y interruptores granulares de alerta (o activar todo). Las etiquetas inteligentes muestran Subscribed / Manage cuando ya está activo. Los resúmenes semanales están limitados a MAX_WEEKLY_DIGEST_LOCATIONS = 20 por dirección de correo. El boletín del pie usa la misma API con type newsletter.',
      },
      {
        id: 'emails',
        title: 'Entrega de correo',
        body:
          'sendTransactionalEmail enruta por el conector ESP activo (Resend, SendGrid, SES o SMTP) seleccionado en admin. Plantillas React Email de src/emails/ y SQLite email_templates: welcome (newsletter), weekly digest, weather alert (por slug de tipo de alerta). Sin conector configurado, la API escribe suscripciones pero las funciones de envío devuelven { sent: false }. Define NEXT_PUBLIC_APP_URL para enlaces de baja correctos en correos de producción.',
      },
      {
        id: 'unsubscribe',
        title: 'Baja',
        body:
          'Cada suscripción tiene un unsubscribe_token único. GET /api/unsubscribe?token= desactiva esa fila y muestra confirmación. Las plantillas de correo enlazan a esta ruta. Eliminar una ciudad puede dar de baja opcionalmente vía RemoveCityDialog.',
      },
      {
        id: 'cron-weekly',
        title: 'Cron de resumen semanal',
        body:
          'GET /api/cron/weekly-digests con Authorization: Bearer CRON_SECRET. Carga suscripciones city_weekly activas agrupadas por correo, hace batch de ciudades únicas, obtiene clima actual por ciudad y envía un digest por correo vía el conector activo. Programa externamente (p. ej. Vercel cron, GitHub Actions) — no hay programación incluida en el repositorio.',
      },
      {
        id: 'cron-alerts',
        title: 'Cron de alertas meteorológicas',
        body:
          'GET /api/cron/weather-alerts con Bearer CRON_SECRET. Para cada suscripción city_alerts, evalúa alertPrefs habilitadas contra coincidencias fusionadas de evaluateOpenWeatherAlertMatches (condiciones actuales), evaluateOfficialAlertMatches (avisos nacionales Open-Meteo) y alertas activas NWS cuando los toggles de plataforma lo permiten. Dedup vía subscription_send_log para no enviar dos veces la misma alerta en la misma ventana ciudad/condición.',
      },
      {
        id: 'remove-city',
        title: 'Integración al eliminar ciudad',
        body:
          'Eliminar una ciudad guardada borra la caché meteorológica L0. Si existen suscripciones para esa ciudad, RemoveCityDialog pide darse de baja del resumen semanal y/o alertas antes de confirmar la eliminación.',
      },
    ],
  },
  {
    slug: 'monetization',
    title: 'Monetización y consentimiento',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'tiers',
        title: 'Nivel gratuito (Premium reservado)',
        body:
          'El producto opera actualmente solo en modo gratuito. ConsentProvider fija tier free de forma fija; meridian:tier está reservado y sin uso en tiempo de ejecución. Stripe checkout y PremiumGate no están conectados. Los anuncios dependen del consentimiento de publicidad y la configuración de AdSense — no de una bandera premium.',
      },
      {
        id: 'premium-features',
        title: 'Qué desbloquearía Premium (no enviado)',
        body:
          'Reservado / no implementado en la UI: ocultar AdSense para un nivel de pago y una franja de precipitación minutely. El detalle de ciudad hoy carga solo ámbitos current, hourly y daily. No hay componente MinutelyPrecipStrip en la app.',
      },
      {
        id: 'consent-model',
        title: 'Modelo de consentimiento',
        body:
          'Campos JSON meridian:consent: essential (siempre activo), functional (escrituras de caché meteorológica en localStorage y ayudantes GPS), marketing (reservado), analytics (cargador GA4 cuando está configurado), advertising (AdSense). Bandera legacy meridian:cookie-consent. Banner de cookies: Accept all, Accept functional, Essential only, Manage preferences. Reabre en cualquier momento vía el control flotante de Ajustes → pestaña Cookies. «Accept all» habilita functional + advertising; activa Google Analytics por separado en preferencias si se ofrece.',
      },
      {
        id: 'adsense',
        title: 'Google AdSense (activo)',
        body:
          'Cuando GOOGLE_ADSENSE_CLIENT_ID y las variables de entorno de colocación están definidas, AdSense está activo — no son marcadores. AdSenseProvider carga el script una vez tras consentimiento de publicidad cuando está configurado. GET /api/ads/config devuelve configuración del script; GET /api/ads?placement= devuelve configuración por slot. GET /ads.txt sirve verificación del editor desde env. El client ID se valida en servidor (formato ca-pub-…); nunca se sube a git.',
      },
      {
        id: 'placements',
        title: 'Colocaciones de anuncios',
        body:
          'Colocaciones activas en la UI con AdSlot: dashboard (bajo la cuadrícula de ciudades), hero (hero de inicio + barra lateral del journal), city-detail (bajo pestañas). El id de colocación recent-checks existe en constants/env pero no hay AdSlot en la página de inicio. Variables de entorno de slot: GOOGLE_ADSENSE_SLOT_DASHBOARD, _HERO, _RECENT, _CITY_DETAIL, _DEFAULT. Sin IDs de slot, las colocaciones muestran marcadores demo de marca; los anuncios automáticos pueden seguir ejecutándose desde el script cuando el client ID está definido.',
      },
      {
        id: 'adslot-states',
        title: 'Estados de UI de AdSlot',
        body:
          'Por defecto (AdSense sin definir / sin consentimiento de publicidad): marcadores PNG de marca bajo public/ads/ (banner y cuadrado). El texto superpuesto es solo para lectores de pantalla (sr-only), no pintado en la imagen. GET /api/ads/placeholder-bg puede seguir sirviendo búsquedas de hero para otras superficies. Configurado + consentimiento — unidad ins.adsbygoogle tras script listo.',
      },
      {
        id: 'analytics',
        title: 'Analítica',
        body:
          'SiteAnalyticsBeacon de primera parte envía ruta de página / engagement a POST /api/analytics/collect en site_analytics_events cuando consent.analytics está activo (el endpoint collect también comprueba la bandera de consentimiento en el cuerpo de la solicitud). Los eventos de vista de slot de anuncio también requieren consent.advertising. GA4 opcional (AnalyticsProvider) solo carga cuando NEXT_PUBLIC_GA_MEASUREMENT_ID está definido y consent.analytics está activo. «Accept all» del banner de cookies no habilita analítica — actívala en Settings → Cookies.',
      },
      {
        id: 'stripe',
        title: 'Stripe (planificado)',
        body:
          'Premium / Stripe checkout no está implementado. Cualquier facturación futura necesitaría aplicación de tier en servidor; no trates meridian:tier como activo.',
      },
      {
        id: 'data',
        title: 'Licencia de datos',
        body:
          'meridian no vende ni licencia datos de usuario. La analítica de primera parte y GA4 opcional sirven para operar el producto. Cualquier producto B2B o de analítica anonimizada futuro requeriría consentimiento y actualizaciones de política por separado.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'Límites de API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'quota',
        title: 'Cuota diaria y por minuto',
        body:
          'Valores por defecto de constants/weather.js: DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 llamadas upstream por minuto móvil. platform_settings puede sobrescribir daily_limit, soft_block_threshold, warning_threshold y per_minute_limit (valores por defecto sembrados al abrir la BD por primera vez). El contador se reinicia a medianoche UTC.',
      },
      {
        id: 'status',
        title: 'Valores de estado',
        body:
          'ok — por debajo del umbral de advertencia. warning — en o por encima de warning_threshold (por defecto 800 llamadas hoy). soft_block — en o por encima de soft_block_threshold (por defecto 950); upstream bloqueado. hard_block — en daily_limit (por defecto 1000). El tope por minuto también bloquea upstream cuando ocurrieron per_minute_limit llamadas en los últimos 60 segundos.',
      },
      {
        id: 'cache-hits',
        title: 'Aciertos de caché vs upstream',
        body:
          'Los aciertos L2 en base de datos se registran en api_call_log con cache_hit=1 y no incrementan el contador diario upstream. Los aciertos L1 en memoria no se registran en SQLite — recordCacheHit retorna pronto cuando meta.layer es memory. Solo las llamadas upstream exitosas a OpenWeather (status 200, cache_hit=0) cuentan para la cuota. Las servidas stale en emergency evitan upstream cuando está bloqueado.',
      },
      {
        id: 'admin-shortcut',
        title: 'Diagnósticos de admin',
        body:
          'Abre /admin (tras iniciar sesión) para usado hoy / límite diario, restante, estado y ajustes de intervalo de actualización. API: GET /api/admin/usage.',
      },
      {
        id: 'admin-api',
        title: 'API de admin',
        body:
          'GET /api/admin/usage — instantánea de cuota y llamadas recientes. GET|PATCH /api/admin/config — API principal de ajustes de admin (intervalo de actualización, conectores, valores por defecto de digest, AdSense, toggles de alerta, etc.). Legacy estrecho: PATCH /api/admin/settings { refreshIntervalMs }. Auth: cookie de sesión HttpOnly meridian_admin_session tras /login. El secreto de firma es ADMIN_SECRET (no ADMIN_PASSWORD). Bypass de desarrollo cuando NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 y ADMIN_SECRET sin definir.',
      },
      {
        id: 'openweather',
        title: 'Límites del proveedor OpenWeather',
        body:
          'meridian rastrea su propio contador upstream; OpenWeather también puede limitar la tasa o rechazar claves de forma independiente (401, 429). El orquestador los mapea a errores de API estructurados para el cliente.',
      },
      {
        id: 'emergency',
        title: 'Modo de emergencia',
        body:
          'Cuando hay soft/hard block, los usuarios siguen viendo el último snapshot SQLite acceptable marcado freshness emergency en lugar de un error en blanco — salvo que nunca existió snapshot para esas coordenadas.',
      },
    ],
  },
  {
    slug: 'api-reference',
    title: 'Referencia de API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Resumen',
        body:
          'Todas las rutas de API son manejadores de Next.js App Router bajo src/app/api/. Weather y geocode requieren OPENWEATHER_API_KEY. Las rutas cron requieren Authorization: Bearer CRON_SECRET. Las rutas admin requieren cookie de sesión de admin autenticada (meridian_admin_session) tras iniciar sesión en /login, salvo bypass de desarrollo.',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query: lat, lon, scope (current|hourly|daily|minutely), trigger opcional, lang. Devuelve carga meteorológica más fetchedAt, cacheHit, freshness, source, trigger, tokensUsed. La cabecera X-Cache refleja la capa de caché. Errores: 400 parámetros inválidos, 404 ubicación no encontrada, 429 rate_limited, 502 upstream_error o service_unavailable.',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body: { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Devuelve { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. Los ámbitos son por ciudad, no un array de nivel superior. Limitado a 20 solicitudes/minuto por IP. Usado por hooks del panel y detalle de ciudad.',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query: lat, lon, from y to opcionales (fechas ISO), limit. Devuelve { summary, observations, forecasts: { hourly, daily } } de las tablas weather_observations y weather_forecast_archive.',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query: q (mín. 2 caracteres), parámetros context opcionales. Devuelve array normalizado: name, country, state, lat, lon, label. Límite upstream 5 resultados. Cacheado en L2 con ámbito geocode. Limitado a 60 solicitudes/minuto por IP.',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'Sin parámetros. Devuelve { checks, source } donde source es popular cuando existen filas disparadas por búsqueda, o empty cuando no hay ninguna. Límite por defecto 20 de location_weather_checks ordenadas por volumen de búsqueda (triggers search_select y search_preview). Sin showcase fallback.',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — lista suscripciones activas del cliente. POST — crear { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — actualizar alertPrefs en fila city_alerts { clientId, id, alertPrefs }. DELETE — body { clientId, cityLat, cityLon, types[] }. Types: newsletter, city_weekly, city_alerts.',
      },
      {
        id: 'unsubscribe',
        title: 'GET /api/unsubscribe',
        body:
          'Query: token (unsubscribe_token UUID). Desactiva la suscripción y devuelve confirmación HTML.',
      },
      {
        id: 'alerts',
        title: 'GET /api/alerts/[alertId]',
        body:
          'Devuelve alerta normalizada: id, senderName, event, start, end, description. Obtenida del ámbito alert en caché.',
      },
      {
        id: 'cron',
        title: 'Rutas cron',
        body:
          'GET /api/cron/weekly-digests — envía correos de resumen semanal agrupados por correo del suscriptor. GET /api/cron/weather-alerts — evalúa alertPrefs contra feeds OpenWeather, Open-Meteo y NWS y envía correos de alerta. Ambas requieren Bearer CRON_SECRET.',
      },
      {
        id: 'admin',
        title: 'Rutas admin',
        body:
          'Uso y configuración: GET /api/admin/usage; GET|PATCH /api/admin/config; legacy PATCH /api/admin/settings { refreshIntervalMs }. Usuarios y auth: GET|POST /api/admin/users; POST /api/admin/users/invite; GET /api/admin/me. Datos: GET /api/admin/checks; GET /api/admin/locations; GET|PATCH /api/admin/subscriptions; GET /api/admin/mailing-summary; GET /api/admin/analytics. Conectores: GET|PATCH /api/admin/connections; GET|PATCH /api/admin/openweather-key; GET|PATCH /api/admin/email-key. CMS de correo: GET|POST|PATCH /api/admin/email-templates; POST /api/admin/email/test, /compose, /sync. AdSense: GET /api/admin/adsense/report; POST /api/admin/adsense/sync; OAuth GET /api/admin/adsense/oauth/start, /callback, /disconnect. CMS: GET|PATCH /api/admin/cms-pages. Todas requieren meridian_admin_session salvo bypass de desarrollo.',
      },
      {
        id: 'ads',
        title: 'Rutas de anuncios',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — configuración de colocación con slotId cuando está definido. GET /api/ads/placeholder-bg — búsqueda de hero para superficies de marcador. Ruta de app GET /ads.txt — línea de editor AdSense desde env. Colocaciones AdSlot activas: dashboard, hero, city-detail. La variable env del slot recent-checks existe pero la página de inicio no tiene AdSlot.',
      },
      {
        id: 'other',
        title: 'Otras rutas públicas',
        body:
          'GET /api/platform/limits — instantánea pública de cuota. POST /api/analytics/collect — beacon de analítica de primera parte. GET /api/location/region — ayudante IP/región. POST /api/weather/inaccurate-report — marcar datos incorrectos. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — teselas de superposición hero OSM. Auth: POST /api/auth/login, /logout; POST /api/auth/forgot-password; POST /api/auth/reset-password/[token]; GET|POST /api/auth/invite/[token]; GET /api/auth/session.',
      },
      {
        id: 'errors',
        title: 'Forma de error',
        body:
          'Los errores JSON suelen ser { error: code, message: string }. Los códigos ApiError incluyen invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error, unauthorized, not_found, limit_reached.',
      },
    ],
  },
  {
    slug: 'weather-icons',
    title: 'Iconos meteorológicos',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'source',
        title: 'Conjunto de iconos',
        body:
          'meridian usa Meteocons (MIT, Bas Milius), SVG estáticos de estilo relleno, en lugar de PNG del CDN de OpenWeather. Los iconos viven en public/weather-icons/ y se copian desde @meteocons/svg-static en npm install (postinstall) o vía npm run copy:icons. Atribución en public/weather-icons/ATTRIBUTION.txt.',
      },
      {
        id: 'inventory',
        title: 'Iconos incluidos',
        body:
          'scripts/copy-weather-icons.mjs copia 35 SVG únicos: 17 iconos de condición OpenWeather más mosaicos de métricas/detalle (thermometer, humidity, barometer, wind, UV, raindrop, snowflake, compass, starry-night, time-afternoon y variantes relacionadas). Cuenta archivos bajo public/weather-icons/*.svg tras copy:icons.',
      },
      {
        id: 'mapping',
        title: 'Mapeo de códigos OpenWeather',
        body:
          'Los códigos de icono OpenWeather (p. ej. 01d, 10n) se mapean a nombres Meteocon en src/features/weather/utils/weather-icon.js: 01d→clear-day, 01n→clear-night, 02d→partly-cloudy-day, 02n→partly-cloudy-night, 03d/03n→cloudy, 04d→overcast-day, 04n→overcast-night, 09d→overcast-day-rain, 09n→overcast-night-rain, 10d→partly-cloudy-day-rain, 10n→partly-cloudy-night-rain, 11d→thunderstorms-day, 11n→thunderstorms-night, 13d→overcast-day-snow, 13n→overcast-night-snow, 50d→fog-day, 50n→fog-night. Códigos desconocidos hacen fallback a cloudy. METRIC_METEOCON mapea claves de mosaicos de detalle a iconos adicionales.',
      },
      {
        id: 'component',
        title: 'Componente WeatherIcon',
        body:
          'src/features/weather/components/WeatherIcon.jsx envuelve getWeatherIconPath(icon) para /weather-icons/{name}.svg local. Usado en tarjetas meteorológicas, recent checks, franjas de pronóstico, gráfico horario, filas diarias y mosaicos de métricas del detalle de ciudad. El texto alt usa la descripción meteorológica cuando se proporciona.',
      },
      {
        id: 'maintenance',
        title: 'Añadir o actualizar iconos',
        body:
          'Edita OPENWEATHER_TO_METEOCON / METRIC_METEOCON en weather-icon.js e ICON_NAMES en scripts/copy-weather-icons.mjs, luego npm run copy:icons. Las pruebas Vitest en weather-icon.test.js verifican el mapeo.',
      },
      {
        id: 'accessibility',
        title: 'Accesibilidad',
        body:
          'Los iconos son complementos decorativos del texto descriptivo (p. ej. «Clear sky»). WeatherIcon establece alt desde la prop description; alt vacío cuando se usa junto a texto de condición visible únicamente.',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'Despliegue y entorno',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'env-required',
        title: 'Entorno requerido',
        body:
          'OPENWEATHER_API_KEY — requerido para weather y geocode. DATABASE_PATH — archivo SQLite (por defecto ./data/meridian.db); debe ser volumen persistente en producción para que caché y suscripciones sobrevivan reinicios.',
      },
      {
        id: 'env-hero',
        title: 'Entorno de imagen hero',
        body:
          'UNSPLASH_ACCESS_KEY — opcional; primer proveedor de fotos para heroes de ubicación (solo servidor, cacheado en hero_image_cache). PEXELS_API_KEY — tercer proveedor opcional tras Unsplash y Wikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — definir 0 para desactivar cabecera de mapa satelital (activo por defecto). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — opt-in de Google Street View cuando OSM está desactivado. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — clave opcional de Maps Embed API para iframes de Street View.',
      },
      {
        id: 'env-email',
        title: 'Entorno de correo',
        body:
          'Multi-ESP vía conector activo en platform_settings (selector admin): Resend (RESEND_API_KEY, RESEND_FROM_EMAIL), SendGrid (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL), Amazon SES (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION, AWS_SES_FROM_EMAIL) o SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_SECURE). NEXT_PUBLIC_APP_URL — URL base para enlaces de baja en correos (listada en .env.example; requerida en producción).',
      },
      {
        id: 'env-cron',
        title: 'Cron y admin',
        body:
          'CRON_SECRET — Bearer para /api/cron/* (denegado cuando no está definido en producción). ADMIN_SECRET — firma la cookie de sesión admin y cifra secretos de conectores. ADMIN_PASSWORD — inicio de sesión root solo para ADMIN_EMAIL. Bypass de desarrollo solo cuando NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 y ADMIN_SECRET sin definir. Ver docs/SECURITY.md. Programa cron externamente: weekly-digests (p. ej. lunes por la mañana), weather-alerts (p. ej. cada 15–30 minutos).',
      },
      {
        id: 'env-adsense',
        title: 'Entorno AdSense',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD, SLOT_HERO, SLOT_RECENT, SLOT_CITY_DETAIL, SLOT_DEFAULT — IDs de unidad de display. OAuth de AdSense Management API: GOOGLE_ADSENSE_OAUTH_CLIENT_ID, GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET, GOOGLE_ADSENSE_OAUTH_REDIRECT_URI opcional (por defecto ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). Mantén el client ID solo en secretos del host. /ads.txt generado en tiempo de ejecución desde el client ID.',
      },
      {
        id: 'env-analytics',
        title: 'Entorno de analítica',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — cargador GA4 opcional cuando consent.analytics está activo. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — metaetiqueta de Search Console.',
      },
      {
        id: 'scripts',
        title: 'Scripts npm',
        body:
          'dev, build, start — Next.js. lint, test, test:watch, verify — control de calidad (verify = lint + test + build). copy:icons — Meteocons a public (también postinstall). seed:checks — snapshots demo del norte de Inglaterra. backfill:city-slugs — rellenar city_slug en ubicaciones existentes. email — servidor de vista previa React Email. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'Tablas SQLite',
        body:
          'Clima principal: weather_snapshots, api_call_log. Ubicaciones y comprobaciones: locations, location_weather_checks, weather_observations, weather_forecast_archive. Suscripciones: subscriptions, subscription_send_log. Plataforma: platform_settings (singleton). Heroes: hero_image_cache. Monetización: adsense_report_snapshots. Analítica: site_analytics_events. Correo/CMS: email_templates, cms_pages. Admin: admin_users, admin_invites, admin_password_resets, admin_audit_log. Esquema en src/lib/db/index.js. La primera apertura siembra platform_settings con refresh 1h, stale 2h, límite diario 1000, soft block 950, warning 800, por minuto 60.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js reescribe el host docs.localhost al subdominio de documentación /docs para desarrollo local. Sin middleware de auth en rutas principales de la app.',
      },
      {
        id: 'localstorage-keys',
        title: 'Claves de almacenamiento del navegador',
        body:
          'Desde storage-keys.js: meridian:client-id, meridian:saved-cities, meridian:checked-cities, meridian:user-location, meridian:weather-cache, meridian:theme, meridian:cookie-consent, meridian:subscriptions, meridian:tier (reservado), meridian:consent, meridian:accessibility, meridian:city-detail-accordion, meridian:temperature-unit, meridian:preferred-locale, meridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — id de sesión de analítica de primera parte. Cookie admin meridian_admin_session (HttpOnly, definida por servidor). Evento personalizado meridian:storage sincroniza hooks tras escrituras.',
      },
    ],
  },
];
