/** Spanish documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'Primeros pasos',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'Qué es meridian',
        body:
          'meridian es un panel del tiempo para varios lugares a la vez. Busca una ciudad, abre su página, fíjala en Tus ubicaciones y sigue la temperatura, las condiciones y pronósticos breves. No necesitas una cuenta. Tus ciudades fijadas y la mayoría de preferencias permanecen en este dispositivo.',
      },
      {
        id: 'add-city',
        title: 'Cómo fijar una ciudad',
        body:
          '1. Escribe al menos dos caracteres en el campo de búsqueda de la página de inicio o del encabezado. Los resultados aparecen tras una breve pausa.\n2. Elige un lugar de la lista — eso abre la página de la ciudad.\n3. Pulsa Fijar en tus ubicaciones para guardarla. Puedes desfijarla después en el mismo menú o quitar la ciudad de la cuadrícula de inicio.\n\nLos lugares fijados aparecen bajo Tus ubicaciones en la página de inicio. Puedes fijar hasta diez. Las direcciones de página de ciudad se ven así: /city/london-GB-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'Límite de diez ciudades',
        body:
          'Tus ubicaciones pueden tener hasta diez ciudades fijadas. Si estás en el límite, quita una antes de fijar otra.',
      },
      {
        id: 'first-visit',
        title: 'Cookies, anuncios y tema',
        body:
          'En la primera visita, un banner pregunta cómo quieres que funcionen el almacenamiento y la publicidad:\n\n• Aceptar todo — funciones útiles más publicidad\n• Aceptar funcional — funciones útiles sin publicidad\n• Solo esencial — lo básico para que el sitio funcione\n• Gestionar preferencias — elegir categorías tú mismo\n\n«Aceptar todo» no activa Google Analytics ni nuestro análisis de uso opcional — activa Analytics por separado en preferencias si se ofrece.\n\nPuedes volver a abrir Preferencias de cookies desde el control flotante de Ajustes (engranaje). Ese control puede ocultarse al desplazarte hacia abajo y puede estar oculto si tu dispositivo pide movimiento reducido. El tema (claro / oscuro) tiene su propio control flotante.',
      },
      {
        id: 'navigation',
        title: 'A dónde ir después',
        body:
          'Panel principal explica la página de inicio. Detalle de la ciudad cubre las pestañas de pronóstico. Suscripciones trata los resúmenes por correo y alertas. Monetización y consentimiento explica anuncios y opciones de privacidad. Las páginas posteriores (Pronósticos y caché, Referencia de API, Despliegue) son sobre todo para quienes gestionan el sitio.',
      },
      {
        id: 'operators',
        title: 'Para operadores del sitio',
        body:
          'El tiempo en vivo necesita OPENWEATHER_API_KEY en el servidor. Correo, tareas cron y AdSense son opcionales. SQLite (better-sqlite3) almacena caché compartida y límites de uso. Ejecuta npm run verify para lint, pruebas y build. Admin: inicia sesión en /login y abre /admin. Bypass de desarrollo solo con NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 y ADMIN_SECRET sin definir. La documentación editada por CMS puede diferir hasta restablecer a valores de archivo. Subdominio docs local: docs.localhost:3000.',
      },
    ],
  },
  {
    slug: 'dashboard',
    title: 'Panel principal',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'layout',
        title: 'Qué ves en la página de inicio',
        body:
          'De arriba a abajo:\n\n1. Hero — texto de bienvenida, búsqueda y una comprobación rápida del tiempo en tu ubicación.\n2. Tus ubicaciones — tarjetas del tiempo para los lugares que fijaste.\n3. Cerca y popular — dos columnas: Cerca de ti y Búsquedas populares.\n4. Un anuncio bajo Tus ubicaciones (marcador o AdSense).\n5. Journal — carrusel de artículos.\n\nOcultar con NEXT_PUBLIC_SHOW_HOME_STRETCH=0.',
      },
      {
        id: 'cards',
        title: 'Tus tarjetas de ubicación',
        body:
          'Cada tarjeta muestra el nombre del lugar, temperatura, condición, icono del tiempo, sensación térmica, humedad y viento. Pulsa una tarjeta para abrir la página completa de la ciudad. Mientras carga el tiempo verás un marcador de posición; si falla la petición tendrás Reintentar y Quitar.',
      },
      {
        id: 'forecast-strip',
        title: 'Franja de siete días',
        body:
          'Bajo la lectura principal, cada tarjeta muestra una perspectiva de siete días (nombre del día, icono, máxima y mínima). Las condiciones actuales y esa perspectiva se cargan juntas para no esperar un segundo paso.',
      },
      {
        id: 'card-actions',
        title: 'Suscribirse y quitar',
        body:
          'Suscribirse abre opciones de correo para un resumen semanal y alertas del tiempo para esa ciudad. Quitar saca la ciudad de Tus ubicaciones y borra su tiempo guardado en este dispositivo. Si aún tienes alertas por correo para esa ciudad, se te preguntará si también quieres cancelarlas.',
      },
      {
        id: 'states',
        title: 'Panel vacío',
        body:
          'Sin ciudades fijadas, la cuadrícula explica cómo buscar y fijar tu primer lugar desde la página de la ciudad.',
      },
      {
        id: 'refresh',
        title: 'Cuándo se actualizan las lecturas',
        body:
          'Por defecto Tus ubicaciones prefieren la última lectura guardada en este dispositivo. Pulsa actualizar en una tarjeta para una comprobación nueva (las ciudades nuevas sin lectura guardada también se obtienen automáticamente). No hay un interruptor Ajustes → Tiempo en la interfaz actual.',
      },
      {
        id: 'recent-checks',
        title: 'Cerca de ti y Búsquedas populares',
        body:
          'Cerca de ti — lugares alrededor de tu hogar o región, con condiciones actuales. No son «tus búsquedas anteriores».\n\nBúsquedas populares — lugares que mucha gente en este sitio ha buscado, hasta cinco tarjetas. En una instalación tranquila o nueva puedes ver algunas ciudades de demostración hasta que se acumule actividad de búsqueda real.\n\nLas tarjetas enlazan a la página de la ciudad cuando tenemos coordenadas. Consulta Cerca y popular para más detalle.',
      },
      {
        id: 'operators',
        title: 'Para operadores del sitio',
        body:
          'Home stretch (AdSlot del panel + Journal): NEXT_PUBLIC_SHOW_HOME_STRETCH=0 (default on; set 0 to hide). Ciudades populares de demostración cuando la API no tiene filas: SHOW_DEMO_POPULAR_SEARCHES (activado por defecto; NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 para desactivar). API Búsquedas populares: GET /api/recent-checks (limit 20, source popular|empty). Cerca de ti no usa esa API. Script seed npm run seed:checks rellena solo weather_snapshots — no Búsquedas populares.',
      },
    ],
  },
  {
    slug: 'city-detail',
    title: 'Detalle de la ciudad',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'access',
        title: 'Abrir una página de ciudad',
        body:
          'Los resultados de búsqueda y las tarjetas de inicio abren una página para ese lugar. No necesitas fijar una ciudad para verla. Fijarla solo la añade a Tus ubicaciones en la página de inicio. Algunas ciudades de muestra y lugares ya conocidos por el sitio siempre abren; direcciones desconocidas muestran un estado vacío útil o 404.',
      },
      {
        id: 'tabs',
        title: 'Pestañas de pronóstico',
        body:
          'Usa las pestañas para moverte entre:\n\n• Hoy — condiciones actuales y datos rápidos\n• Por hora — las próximas horas\n• 10 días — perspectiva más larga\n• Historial — días pasados cuando los tenemos almacenados\n\nPuedes compartir un enlace que abra una pestaña (por ejemplo con ?tab=hourly). Hasta tres banners de alerta meteorológica pueden aparecer sobre la página cuando existan alertas. Una unidad publicitaria puede ir bajo las pestañas.',
      },
      {
        id: 'header',
        title: 'Mapa o foto arriba',
        body:
          'Por defecto el encabezado muestra un mapa satelital de la zona. Los operadores pueden cambiar a fotos del lugar (de proveedores de fotos cuando estén disponibles, si no una imagen de marca simple). Street View opcional es un ajuste del operador cuando el fondo de mapa está desactivado.',
      },
      {
        id: 'today',
        title: 'Hoy',
        body:
          'Temperatura y condición actuales, mosaicos de métricas (humedad, viento y similares) y secciones expandibles para más detalle. Una breve vista previa por hora del resto del día cuando esté disponible.',
      },
      {
        id: 'hourly',
        title: 'Por hora',
        body:
          'Las próximas doce horas: temperatura, probabilidad de lluvia y viento de un vistazo.',
      },
      {
        id: 'daily',
        title: '10 días',
        body:
          'Hasta diez días con máxima/mínima, condiciones, probabilidad de lluvia, viento y UV. Selecciona un día para enfocar el gráfico.',
      },
      {
        id: 'history',
        title: 'Historial',
        body:
          'Días pasados de observaciones almacenadas cuando estén disponibles, con selector de día y gráfico.',
      },
      {
        id: 'subscribe',
        title: 'Fijar y correo',
        body:
          'El menú Opciones permite Fijar en tus ubicaciones o Suscribirse para un resumen semanal y alertas del tiempo para este lugar.',
      },
      {
        id: 'operators',
        title: 'Para operadores del sitio',
        body:
          'resolveCity() siempre sirve cinco PLATFORM_SHOWCASE_CITIES (London, Dubai, New York, Tokyo, Sydney) más filas con city_slug. Hero por defecto: OSM cuando isCityHeroOsmEnabled() (NEXT_PUBLIC_CITY_HERO_OSM unset o no "0"); fotos cuando OSM off (Unsplash → Wikimedia → Pexels). Opt-in Street View: NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 con clave Maps. Batch cliente: current, hourly, daily solo — sin UI minutely. Historial: GET /api/weather/history. La primera comprobación current exitosa puede marcar la ciudad como indexable para sitemap/SEO.',
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
        title: 'Actualizaciones por correo (opcional)',
        body:
          'Puedes pedir a meridian que te envíe correos — sin iniciar sesión. Elige un boletín sobre el producto, un resumen semanal para una ciudad fijada y/o alertas del tiempo cuando las condiciones coincidan con lo que te importa. Todo es voluntario; cada correo incluye una forma de darte de baja.',
      },
      {
        id: 'types',
        title: 'A qué puedes suscribirte',
        body:
          '• Boletín — actualizaciones del producto (normalmente desde el formulario del pie).\n• Resumen semanal — un resumen regular para una ciudad que sigues.\n• Alertas del tiempo — correos cuando los tipos de alerta elegidos se activan para una ciudad (lluvia, viento, nieve, avisos oficiales y más).\n\nPuedes gestionarlas desde Suscribirse en una tarjeta del tiempo o el menú Opciones de la página de ciudad.',
      },
      {
        id: 'subscribe-ui',
        title: 'Cómo suscribirse',
        body:
          'Introduce tu correo, elige resumen semanal y/o alertas, y selecciona los tipos de alerta que quieres (o activa todos). Puedes cambiar los tipos de alerta después. Una dirección de correo puede seguir hasta veinte ubicaciones en resúmenes semanales. Si ya estás suscrito, el botón puede decir Suscrito o Gestionar.',
      },
      {
        id: 'unsubscribe',
        title: 'Cómo dejar de recibir correos',
        body:
          'Usa el enlace de baja en cualquier correo de suscripción. Quitar una ciudad de Tus ubicaciones también puede preguntar si quieres cancelar los correos de esa ciudad.',
      },
      {
        id: 'operators',
        title: 'Para operadores del sitio',
        body:
          'meridian:client-id anónimo enlaza el navegador con suscripciones SQLite. API: GET/POST/DELETE/PATCH /api/subscriptions (PATCH actualiza alertPrefs). Entrega usa el conector activo (Resend, SendGrid, SES o SMTP). Sin conector, las filas se guardan pero los envíos devuelven { sent: false }. Define NEXT_PUBLIC_APP_URL para enlaces de baja. Crons: GET /api/cron/weekly-digests y /api/cron/weather-alerts con Bearer CRON_SECRET. Las alertas combinan condiciones OpenWeather, avisos oficiales Open-Meteo y NWS donde esté activado; dedup vía subscription_send_log. MAX_WEEKLY_DIGEST_LOCATIONS = 20.',
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
        title: 'Gratis para todos hoy',
        body:
          'meridian funciona como un sitio del tiempo gratuito. No hay un pago Premium operativo ni un plan de pago que quite anuncios. La publicidad solo aparece si permites el consentimiento publicitario y el operador configuró Google AdSense.',
      },
      {
        id: 'consent-model',
        title: 'Tus opciones de privacidad',
        body:
          'El banner de la primera visita te deja elegir:\n\n• Aceptar todo — funciones útiles más publicidad\n• Aceptar funcional — funciones útiles sin publicidad\n• Solo esencial — lo básico para que el sitio funcione\n• Gestionar preferencias — activar o desactivar categorías tú mismo\n\nCategorías útiles explicadas de forma simple:\n• Funcional — recordar el tiempo en este dispositivo entre visitas; ayudas de ubicación precisa si las permites\n• Publicidad — anuncios de Google cuando estén configurados\n• Analytics — medición de uso opcional y Google Analytics cuando esté configurado (no se activa con «Aceptar todo»)\n\nCambia de opinión después en Ajustes → Cookies cuando el control flotante de Ajustes esté disponible (puede ocultarse al desplazarte y puede no estar disponible con movimiento reducido).',
      },
      {
        id: 'adsense',
        title: 'Anuncios que podrías ver',
        body:
          'Cuando la publicidad está permitida y AdSense configurado, los anuncios pueden aparecer en el hero de inicio, bajo Tus ubicaciones, bajo las pestañas de página de ciudad y en algunos diseños del journal. Si los anuncios no están configurados o rechazaste la publicidad, verás un marcador de marca en lugar de un anuncio en vivo.',
      },
      {
        id: 'analytics',
        title: 'Medición de uso',
        body:
          'Si activas Analytics, el sitio puede registrar uso first-party simple (como qué páginas se vieron) y, si está configurado, cargar Google Analytics. El recuento de visibilidad de espacios publicitarios también necesita consentimiento publicitario. Rechazar analytics mantiene esos cargadores desactivados.',
      },
      {
        id: 'data',
        title: 'No vendemos tus datos',
        body:
          'meridian no vende datos personales. Cualquier futuro producto de datos de pago necesitaría aviso claro y consentimiento nuevo.',
      },
      {
        id: 'operators',
        title: 'Para operadores del sitio',
        body:
          'Tier always free; meridian:tier unused; no Premium weather UI. AdSense: GOOGLE_ADSENSE_CLIENT_ID (runtime script after advertising consent; meta verification only in root HTML). Auto ads; ad-free via Stripe when STRIPE_* + ADFEEE_LICENSE_SECRET set. Analytics: SiteAnalyticsBeacon + POST /api/analytics/collect with signed meridian_consent cookie; GA4 needs NEXT_PUBLIC_GA_MEASUREMENT_ID + analytics consent.',
      },
    ],
  },
  {
    slug: 'weather-icons',
    title: 'Iconos del tiempo',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'source',
        title: 'Qué son los iconos',
        body:
          'Las imágenes del tiempo en tarjetas y pronósticos son iconos de línea/relleno claros (Meteocons de Bas Milius, licencia MIT). Muestran sol, nubes, lluvia, nieve, niebla y condiciones similares junto a la descripción escrita — el texto lleva el significado si una imagen no carga.',
      },
      {
        id: 'accessibility',
        title: 'Accesibilidad',
        body:
          'Los iconos apoyan las palabras en pantalla. Donde hay descripción de condición visible, la imagen se trata como decorativa; si no, se proporciona una alternativa de texto breve desde la descripción.',
      },
      {
        id: 'operators',
        title: 'Para operadores del sitio',
        body:
          'Los assets están en public/weather-icons/ (unos 35 archivos SVG en un checkout típico). scripts/copy-weather-icons.mjs copia 32 nombres únicos de @meteocons/svg-static en postinstall / npm run copy:icons; algunos extras (p. ej. sunrise, sunset, horizon) pueden existir en la carpeta pero se mapean vía alias METRIC_METEOCON. Mapeo: src/features/weather/utils/weather-icon.js (OPENWEATHER_TO_METEOCON). Componente: WeatherIcon.jsx. Atribución: public/weather-icons/ATTRIBUTION.txt. Pruebas: weather-icon.test.js.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'Cerca y popular',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'Las dos columnas de inicio',
        body:
          'Bajo Tus ubicaciones la página de inicio muestra dos listas cortas de lugares.\n\nCerca de ti — lugares sugeridos cerca de tu hogar o región, con condiciones en vivo. No es un registro privado de todo lo que buscaste.\n\nBúsquedas populares — lugares que se buscan a menudo en este sitio. También es a nivel del sitio, no «tu historial personal».',
      },
      {
        id: 'ui',
        title: 'Comportamiento de las tarjetas',
        body:
          'Cada columna muestra hasta cinco tarjetas con icono, temperatura, descripción y nombre del lugar. Pulsa una tarjeta para abrir la página de la ciudad cuando haya coordenadas.',
      },
      {
        id: 'demo-empty',
        title: 'Cuando Búsquedas populares parece llena en una instalación nueva',
        body:
          'Si casi nadie ha buscado aún, el sitio puede mostrar algunas ciudades de demostración conocidas en Búsquedas populares para que la columna no esté vacía. Los operadores pueden desactivar esa lista de demostración. Cerca de ti sigue dependiendo de señales de ubicación y datos de lugares cercanos.',
      },
      {
        id: 'operators',
        title: 'Para operadores del sitio',
        body:
          'Datos Búsquedas populares: GET /api/recent-checks → getRecentChecksPayload() → listPopularSearchChecks en location_weather_checks (triggers search_select / search_preview), default limit 20, source popular|empty. La API en sí no hidrata showcases.\n\nRespaldo demo UI: cuando la API devuelve vacío y SHOW_DEMO_POPULAR_SEARCHES es true (por defecto; desactivar con NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0), Búsquedas populares se rellena desde PLATFORM_SHOWCASE_CITIES.\n\nCerca de ti: lugares cercanos del perfil de ubicación de inicio + batch de tiempo current — no la API recent-checks.\n\nnpm run seed:checks escribe weather_snapshots de North England para demos de caché L2; no inserta filas de comprobación por búsqueda y no rellena Búsquedas populares por sí solo.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'Pronósticos y caché',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'Para quién es esta página',
        body:
          'Los visitantes habituales pueden omitir esta página. Explica cómo el sitio almacena y actualiza datos del tiempo para quienes operan o integran meridian. En términos simples: tu navegador recuerda una lectura reciente; el servidor también recuerda lecturas compartidas para no llamar al proveedor del tiempo en cada clic.',
      },
      {
        id: 'scopes',
        title: 'Scopes del tiempo',
        body:
          'Scopes solicitables por el cliente: current (ahora), hourly (línea temporal), daily (línea temporal), minutely (precipitación — solo API; detalle de ciudad no carga minutely hoy). Scopes solo servidor: geocode (caché de búsqueda de ciudad clave geocode:{query}), alert (payloads de alerta individuales). Cada scope del tiempo usa clave de caché {lat},{lon},{scope}; geocode por cadena de consulta.',
      },
      {
        id: 'layers',
        title: 'Capas de caché',
        body:
          'L0 — localStorage del navegador meridian:weather-cache, estructura {cityId: {scope: {payload, fetchedAt}}} (escrituras necesitan consentimiento funcional). L1 — Map en memoria en el proceso del servidor. L2 — SQLite weather_snapshots con fetched_at, expires_at, stale_until. El cliente lee L0 luego llama a la API; el servidor lee L1 luego L2 luego upstream OpenWeather.',
      },
      {
        id: 'freshness',
        title: 'Estados de frescura',
        body:
          'fresh — dentro de expires_at. acceptable — pasado expires pero dentro de stale_until (puede seguir sirviéndose). expired — más allá de stale_until, dispara upstream si la cuota lo permite. emergency — cuota bloqueada pero snapshot L2 caducado/aceptable servido igual para que los usuarios sigan viendo datos.',
      },
      {
        id: 'ttl-table',
        title: 'TTL por defecto (SCOPE_TTL)',
        body:
          'current — fresh 1h, stale 2h (anulado por platform_settings.refresh_interval_ms y stale_cache_max_ms; admin puede poner 10m–2h). hourly — fresh 2h, stale 6h. daily — fresh 6h, stale 12h. minutely — fresh 15m, stale 30m. geocode — fresh 7d, stale 30d. alert — fresh 1h, stale 6h.',
      },
      {
        id: 'upstream',
        title: 'Integración OpenWeather',
        body:
          'Principal: One Call API 4.0 (onecall/current, timeline/1h, timeline/1day, timeline/1min). El scope current recurre a API 2.5 /weather si One Call current falla. Geocode usa la API de geocodificación OpenWeather (limit 5). Normalización en src/lib/one-call.js produce payloads UI coherentes.',
      },
      {
        id: 'batch',
        title: 'Obtención por lotes',
        body:
          'POST /api/weather/batch acepta { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Los scopes son por ciudad (city.scopes), no un array scopes de nivel superior. El panel carga current + daily juntos en un lote (sin requestIdleCallback). Detalle de ciudad agrupa solo current + hourly + daily. El manejador espacia ciudades ~100ms para evitar límites de ráfaga.',
      },
      {
        id: 'headers',
        title: 'Metadatos de respuesta',
        body:
          'Las respuestas API incluyen meta: cacheLayer (memory, database, upstream), freshness, fetchedAt, ageMs, upstreamCallAvoided, source. La cabecera X-Cache refleja hit/miss cuando aplique. «Actualizado hace X» en la UI usa meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'Interacción con cuota',
        body:
          'Cuando se superan límites diarios o por minuto, las llamadas upstream se detienen y se devuelven datos L2 emergency stale si están disponibles. Reabrir una ciudad dentro del TTL cuesta cero llamadas upstream.',
      },
      {
        id: 'logging',
        title: 'Registro de aciertos de caché',
        body:
          'Los aciertos de caché de base L2 registran en api_call_log con cache_hit=1 y no incrementan el contador upstream diario. Los aciertos de memoria L1 se sirven pero intencionalmente no se persisten en SQLite — se disparan en cada remontaje SSR/cliente y harían girar meridian.db bajo file watchers.',
      },
      {
        id: 'payload-fields',
        title: 'Campos del payload current',
        body:
          'temperature, feelsLike, description, condition, icon (código OpenWeather), humidity, pressure, dewPoint, uvi, clouds, visibility, windSpeedKmh, windGustKmh, windDeg, sunrise, sunset, alertIds, city, country, timezone, updatedAt, source.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'Límites de API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'Para quién es esta página',
        body:
          'Esta página es para quienes gestionan el sitio. Los datos del tiempo visitados se comparten y son favorables a la caché para que los límites gratuitos de OpenWeather (por defecto 1000 llamadas/día) se agoten con menos frecuencia.',
      },
      {
        id: 'quota',
        title: 'Cuota diaria y por minuto',
        body:
          'Valores por defecto de constants/weather.js: DAILY_LIMIT 1000, WARNING_THRESHOLD 800, SOFT_BLOCK_THRESHOLD 950, PER_MINUTE_LIMIT 60 llamadas upstream por minuto móvil. platform_settings puede anular daily_limit, soft_block_threshold, warning_threshold y per_minute_limit (valores por defecto sembrados en la primera apertura de DB). El contador se reinicia a medianoche UTC.',
      },
      {
        id: 'status',
        title: 'Valores de estado',
        body:
          'ok — bajo el umbral de advertencia. warning — en o por encima de warning_threshold (por defecto 800 llamadas hoy). soft_block — en o por encima de soft_block_threshold (por defecto 950); upstream bloqueado. hard_block — en daily_limit (por defecto 1000). El tope por minuto también bloquea upstream cuando per_minute_limit llamadas ocurrieron en los últimos 60 segundos.',
      },
      {
        id: 'cache-hits',
        title: 'Aciertos de caché vs upstream',
        body:
          'Los aciertos de base L2 registran en api_call_log con cache_hit=1 y no incrementan el contador upstream diario. Los aciertos de memoria L1 no se registran en SQLite — recordCacheHit retorna pronto cuando meta.layer es memory. Solo las llamadas upstream OpenWeather exitosas (estado 200, cache_hit=0) cuentan para la cuota. Los serves emergency stale evitan upstream cuando está bloqueado.',
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
          'GET /api/admin/usage — instantánea de cuota y llamadas recientes. GET|PATCH /api/admin/config — API principal de ajustes admin (intervalo de actualización, conectores, valores por defecto de digest, AdSense, interruptores de alerta, etc.). Legacy estrecho: PATCH /api/admin/settings { refreshIntervalMs }. Auth: cookie de sesión HttpOnly meridian_admin_session tras /login. Secreto de firma es ADMIN_SECRET (no ADMIN_PASSWORD). Bypass de desarrollo con NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 y ADMIN_SECRET unset.',
      },
      {
        id: 'openweather',
        title: 'Límites del proveedor OpenWeather',
        body:
          'meridian rastrea su propio contador upstream; OpenWeather también puede limitar o rechazar claves de forma independiente (401, 429). El orquestador los mapea a errores API estructurados para el cliente.',
      },
      {
        id: 'emergency',
        title: 'Modo de emergencia',
        body:
          'Con soft/hard block, los usuarios siguen viendo el último snapshot SQLite aceptable marcado freshness emergency en lugar de un error en blanco — a menos que nunca existió un snapshot para esas coordenadas.',
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
          'Esta página es para desarrolladores y operadores que integran las API de meridian — los visitantes habituales pueden omitirla. Todas las rutas API son manejadores Next.js App Router bajo src/app/api/. Tiempo y geocode requieren OPENWEATHER_API_KEY. Las rutas cron requieren Authorization: Bearer CRON_SECRET. Las rutas admin requieren cookie de sesión admin autenticada (meridian_admin_session) tras iniciar sesión en /login, salvo que ALLOW_DEV_ADMIN_BYPASS aplique en desarrollo.',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query: lat, lon, scope (current|hourly|daily|minutely), trigger opcional, lang. Devuelve payload del tiempo más fetchedAt, cacheHit, freshness, source, trigger, tokensUsed. La cabecera X-Cache refleja la capa de caché. Errores: 400 invalid params, 404 location not found, 429 rate_limited, 502 upstream_error o service_unavailable.',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body: { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. Devuelve { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. Scopes por ciudad, no un array de nivel superior. Limitado a 20 peticiones/minuto por IP. Usado por hooks del panel y detalle de ciudad.',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query: lat, lon, from, to opcionales (fechas ISO), limit. Devuelve { summary, observations, forecasts: { hourly, daily } } de weather_observations y weather_forecast_archive.',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query: q (mín. 2 caracteres), parámetros context opcionales. Devuelve array normalizado: name, country, state, lat, lon, label. Límite upstream 5 resultados. En caché L2 con scope geocode. Limitado a 60 peticiones/minuto por IP.',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'Sin parámetros. Devuelve { checks, source } donde source es popular cuando existen filas disparadas por búsqueda, o empty cuando no hay ninguna. Límite por defecto 20 de location_weather_checks ordenadas por volumen de búsqueda (triggers search_select y search_preview). La API no tiene respaldo showcase — la UI de inicio puede mostrar ciudades populares de demostración cuando está vacía si SHOW_DEMO_POPULAR_SEARCHES está activado. La columna Cerca de ti no usa esta ruta.',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — listar suscripciones activas del cliente. POST — crear { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — actualizar alertPrefs en fila city_alerts { clientId, id, alertPrefs }. DELETE — body { clientId, cityLat, cityLon, types[] }. Tipos: newsletter, city_weekly, city_alerts.',
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
          'Devuelve alerta normalizada: id, senderName, event, start, end, description. Fuente: scope alert en caché.',
      },
      {
        id: 'cron',
        title: 'Rutas cron',
        body:
          'GET /api/cron/weekly-digests — enviar correos de resumen semanal agrupados por correo del suscriptor. GET /api/cron/weather-alerts — evaluar alertPrefs contra OpenWeather, Open-Meteo y feeds NWS y enviar correos de alerta. Ambas requieren Bearer CRON_SECRET.',
      },
      {
        id: 'admin',
        title: 'Rutas admin',
        body:
          'Uso y config: GET /api/admin/usage; GET|PATCH /api/admin/config; legacy PATCH /api/admin/settings { refreshIntervalMs }. Usuarios y auth: GET|POST /api/admin/users; POST /api/admin/users/invite; GET /api/admin/me. Datos: GET /api/admin/checks; GET /api/admin/locations; GET|PATCH /api/admin/subscriptions; GET /api/admin/mailing-summary; GET /api/admin/analytics. Conectores: GET|PATCH /api/admin/connections; GET|PATCH /api/admin/openweather-key; GET|PATCH /api/admin/email-key. CMS de correo: GET|POST|PATCH /api/admin/email-templates; POST /api/admin/email/test, /compose, /sync. AdSense: GET /api/admin/adsense/report; POST /api/admin/adsense/sync; OAuth GET /api/admin/adsense/oauth/start, /callback, /disconnect. CMS: GET|PATCH /api/admin/cms-pages. Todas requieren meridian_admin_session salvo bypass de desarrollo.',
      },
      {
        id: 'ads',
        title: 'Rutas de anuncios',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — config de colocación con slotId si está definido. GET /api/ads/placeholder-bg — búsqueda hero para superficies placeholder. Ruta app GET /ads.txt — línea de editor AdSense desde env. Colocaciones AdSlot activas: dashboard, hero, city-detail. env de slot recent-checks existe pero inicio no tiene AdSlot.',
      },
      {
        id: 'other',
        title: 'Otras rutas públicas',
        body:
          'GET /api/platform/limits — instantánea pública de cuota. POST /api/analytics/collect — beacon de analytics first-party. GET /api/location/region — ayuda IP/región. POST /api/weather/inaccurate-report — marcar datos incorrectos. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — mosaicos overlay hero OSM. Auth: POST /api/auth/login, /logout; POST /api/auth/forgot-password; POST /api/auth/reset-password/[token]; GET|POST /api/auth/invite/[token]; GET /api/auth/session.',
      },
      {
        id: 'errors',
        title: 'Forma de error',
        body:
          'Errores JSON típicamente { error: code, message: string }. Códigos ApiError incluyen invalid_request, service_unavailable, location_not_found, rate_limited, upstream_error, unauthorized, not_found, limit_reached.',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'Despliegue y entorno',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'Para quién es esta página',
        body:
          'Esta página es para quienes despliegan meridian. Los visitantes habituales no necesitan estos ajustes. Una demo funcional solo necesita OPENWEATHER_API_KEY; todo lo demás es stretch opcional.',
      },
      {
        id: 'env-required',
        title: 'Entorno requerido',
        body:
          'OPENWEATHER_API_KEY — requerido para tiempo y geocode. DATABASE_PATH — archivo SQLite (por defecto ./data/meridian.db); volumen persistente en producción para que caché y suscripciones sobrevivan reinicios. NEXT_PUBLIC_SHOW_HOME_STRETCH=0 oculta anuncio del panel + Journal (activado por defecto). NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 desactiva ciudades populares de demostración cuando la API está vacía.',
      },
      {
        id: 'env-hero',
        title: 'Entorno de imagen hero',
        body:
          'UNSPLASH_ACCESS_KEY — opcional; primer proveedor de fotos para heroes de ubicación (solo servidor, en caché en hero_image_cache). PEXELS_API_KEY — tercer proveedor opcional tras Unsplash y Wikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — poner a 0 para desactivar encabezado de mapa satelital (activado por defecto). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — opt-in Google Street View cuando OSM está off. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — clave Maps Embed API opcional para iframes Street View.',
      },
      {
        id: 'env-email',
        title: 'Entorno de correo',
        body:
          'Multi-ESP vía conector activo en platform_settings (selector admin): Resend (RESEND_API_KEY, RESEND_FROM_EMAIL), SendGrid (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL), Amazon SES (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION, AWS_SES_FROM_EMAIL) o SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_SECURE). NEXT_PUBLIC_APP_URL — URL base para enlaces de baja en correos (listado en .env.example; requerido en producción).',
      },
      {
        id: 'env-cron',
        title: 'Cron y admin',
        body:
          'CRON_SECRET — Bearer para /api/cron/* (denegado si unset en producción). ADMIN_SECRET — firma la cookie de sesión admin y cifra secretos de conectores. ADMIN_PASSWORD — login root solo para ADMIN_EMAIL. Bypass de desarrollo solo con NODE_ENV=development, ALLOW_DEV_ADMIN_BYPASS=1 y ADMIN_SECRET unset. Ver docs/SECURITY.md. Programar cron externamente: weekly-digests (p. ej. lunes por la mañana), weather-alerts (p. ej. cada 15–30 minutos).',
      },
      {
        id: 'env-adsense',
        title: 'Entorno AdSense',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD, SLOT_HERO, SLOT_RECENT, SLOT_CITY_DETAIL, SLOT_DEFAULT — IDs de unidades display. OAuth AdSense Management API: GOOGLE_ADSENSE_OAUTH_CLIENT_ID, GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET, GOOGLE_ADSENSE_OAUTH_REDIRECT_URI opcional (por defecto ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). Mantener ID de cliente solo en secretos del host. /ads.txt generado en tiempo de ejecución desde ID de cliente.',
      },
      {
        id: 'env-analytics',
        title: 'Entorno de analytics',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — cargador GA4 opcional cuando consent.analytics está activado. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — metaetiqueta Search Console.',
      },
      {
        id: 'scripts',
        title: 'Scripts npm',
        body:
          'dev, build, start — Next.js. lint, test, test:watch, verify — puerta de calidad (verify = lint + test + build). copy:icons — Meteocons a public (también postinstall). seed:checks — snapshots demo North England. backfill:city-slugs — rellenar city_slug en locations existentes. email — servidor de vista previa React Email. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'Tablas SQLite',
        body:
          'Tiempo núcleo: weather_snapshots, api_call_log. Ubicaciones y checks: locations, location_weather_checks, weather_observations, weather_forecast_archive. Suscripciones: subscriptions, subscription_send_log. Plataforma: platform_settings (singleton). Heroes: hero_image_cache. Monetización: adsense_report_snapshots. Analytics: site_analytics_events. Correo/CMS: email_templates, cms_pages. Admin: admin_users, admin_invites, admin_password_resets, admin_audit_log. Esquema en src/lib/db/index.js. Primera apertura siembra platform_settings con refresh 1h, stale 2h, límite diario 1000, soft block 950, warning 800, per-minute 60.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js reescribe el host docs.localhost a /docs para subdominio de documentación local. Sin middleware de auth en rutas principales de la app.',
      },
      {
        id: 'localstorage-keys',
        title: 'Claves de almacenamiento del navegador',
        body:
          'Desde storage-keys.js: meridian:client-id, meridian:saved-cities, meridian:checked-cities, meridian:user-location, meridian:weather-cache, meridian:theme, meridian:cookie-consent, meridian:subscriptions, meridian:tier (reservado), meridian:consent, meridian:accessibility, meridian:city-detail-accordion, meridian:temperature-unit, meridian:preferred-locale, meridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — ID de sesión analytics first-party. Cookie admin meridian_admin_session (HttpOnly, definida por servidor). Evento custom meridian:storage sincroniza hooks tras escrituras.',
      },
    ],
  },
];
