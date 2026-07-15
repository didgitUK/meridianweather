/** Spanish journal posts — same ids/hrefs/imageUrls as HOME_BLOG_POSTS. */
export const BLOG_POSTS_I18N = [
  {
    id: 'reading-hourly-forecasts',
    title: 'Cómo leer un pronóstico por horas sin darle mil vueltas',
    excerpt:
      'Temperatura, probabilidad de lluvia y rachas llegan cada hora — qué mirar primero al planear la tarde.',
    category: 'Guías',
    dateLabel: '12 jul 2026',
    dateIso: '2026-07-12',
    href: '/journal/reading-hourly-forecasts',
    imageUrl:
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Luz del sol entre nubes sobre un paisaje costero',
    body: [
      'Una franja horaria parece cargada: cada columna apila temperatura, icono de cielo, probabilidad de precipitación y a menudo viento. El truco es decidir para qué es la tarde — salir, viajar o quedarse — y leer solo las columnas que cambian ese plan.',
      'Empieza por probabilidad e intensidad de precipitación juntas. Un 40 % de llovizna ligera casi nunca arruina un paseo; la misma chance con chubascos fuertes sí. Luego mira la tendencia de temperatura en las siguientes cuatro a seis horas, no un pico aislado: el enfriamiento tras un mediodía cálido importa más para la noche que el máximo absoluto.',
      'Las rachas son el tercer filtro. Una brisa constante no se siente como rachas secas en bici o en costa expuesta. En meridian, mira primero la fila densificada de next-hour y luego la pestaña hourly si necesitas una ventana más larga.',
      'Si los números siguen ruidosos, elige una decisión — salir a las 15:00 o esperar — y pregunta si alguna hora de ahora en adelante rompe claramente esa decisión. El resto puede quedar sin leer.',
    ],
  },
  {
    id: 'ten-day-outlook',
    title: 'Lo que un outlook a 10 días sí — y no — puede decirte',
    excerpt:
      'La confianza baja cuanto más lejos miras. Cómo meridian separa el detalle cercano de días estimados fuera de la ventana gratuita de OpenWeather.',
    category: 'Pronósticos',
    dateLabel: '10 jul 2026',
    dateIso: '2026-07-10',
    href: '/journal/ten-day-outlook',
    imageUrl:
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Tormenta eléctrica sobre el skyline de una ciudad de noche',
    body: [
      'Una vista a 10 días sirve para empacar y el fin de semana, pero no es un contrato. Los modelos coinciden más el día dos que el nueve, y los feeds free a menudo se cortan antes de diez días en alta resolución.',
      'En meridian, los días cercanos llevan más detalle del feed One Call. Más lejos, un horizonte diario extendido puede estructurar el calendario sin fingir que la ventana gratuita de OpenWeather lo entrega todo.',
      'Trata el extremo lejano como dirección: más cálido o más frío que hoy, patrón más húmedo o no — no como horario preciso de chubascos. Recarga cerca de la fecha cuando el plan se convierte en reserva.',
      'City detail separa las pestañas Today, Hourly y Daily para acercarte a confianza útil y luego volver a la cinta larga cuando solo necesitas una idea de la semana.',
    ],
  },
  {
    id: 'pinning-locations',
    title: 'Fijar las ciudades que importan en tu panel',
    excerpt:
      'Consulta cualquier lugar del mundo, guarda una lista corta en local y mantén condiciones en vivo de un vistazo — sin cuenta.',
    category: 'Producto',
    dateLabel: '8 jul 2026',
    dateIso: '2026-07-08',
    href: '/journal/pinning-locations',
    imageUrl:
      'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Mapa de viaje con pines marcando ciudades',
    body: [
      'Meridian está pensado para una lista corta de lugares que te importan — casa, oficina, familia, próximo viaje — no para otro feed social del clima. Busca cualquier ciudad, abre el detalle y fíjala en Your Locations.',
      'Los pines viven en el navegador vía localStorage. La demo free se mantiene honesta: sin muro de cuenta, la lista vuelve tras recargar en el mismo dispositivo. Borrar datos del sitio borra los pines; es intencional en este stack.',
      'Recent checks van junto a los pines para que las consultas puntuales no saturen el tablero guardado. Usa Allow Location en el hero para centrar el panel donde estás y fija lo demás que deba seguir visible.',
      'Si una tarjeta se ve vieja, actualiza esa ciudad en vez de toda la página: cacheamos con límites de tasa en mente para que la clave OpenWeather compartida aguante un día de demo.',
    ],
  },
  {
    id: 'alerts-digests',
    title: 'Resúmenes por correo y alertas severas, explicados',
    excerpt:
      'Resúmenes semanales en semanas tranquilas, alertas de ubicación cuando se cruzan umbrales — correo free sin inundar la bandeja.',
    category: 'Alertas',
    dateLabel: '5 jul 2026',
    dateIso: '2026-07-05',
    href: '/journal/alerts-digests',
    imageUrl:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Cresta de montaña bajo luz de tormenta dramática',
    body: [
      'No toda bandeja quiere un pulso al mediodía. Meridian separa digests tranquilos de alertas por umbral para que puedas suscribirte a un resumen semanal sin teatro de tormenta cada tarde.',
      'Los digests reúnen un outlook corto de los lugares que sigues. Las alertas se disparan cuando lluvia, viento o bandas de temperatura cruzan tus líneas, con la misma ruta de evaluación que el cron admin weather-check.',
      'Los proveedores de correo free tienen techos de envío. Las plantillas son ligeras, los shortcodes rellenan variables de clima por ubicación y los conectores se gestionan en el panel de correo admin para cambiar SMTP o claves API sin reescribir páginas de producto.',
      'Unsubscribe y preferencias honestas importan tanto como el contenido: si las alertas hacen ruido, baja umbrales o pausa la lista en vez de abandonar el producto.',
    ],
  },
  {
    id: 'rate-limits',
    title: 'Mantenerse dentro de los límites free de OpenWeather',
    excerpt:
      'Caché, ventanas de refresh y por qué meridian no martillea el upstream en cada clic de pestaña — tasas prácticas para una clave demo compartida.',
    category: 'Ingeniería',
    dateLabel: '2 jul 2026',
    dateIso: '2026-07-02',
    href: '/journal/rate-limits',
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Visualización abstracta de globo y red de datos',
    body: [
      'El free tier de OpenWeather es generoso para una demo enfocada y frágil si cada hover es una llamada de red. Meridian trata la clave como presupuesto compartido: cachea payloads, debounces el refresh y formatea en local cuando solo cambian unidades o pestañas.',
      'Tarjetas y detalle reutilizan snapshots ya obtenidos. Refresh manual cuando sabes que cambiaron las condiciones; los polls de fondo se quedan conservadores para que un aula de entrevistadores no agote la cuota antes del almuerzo.',
      'Geocode y One Call cuentan por separado en la práctica: un typo de búsqueda no debe costar un pull completo de clima. Los fallos upstream se muestran como errores honestos de UI, no reintentos silenciosos en bucle.',
      'Si haces fork para más tráfico, los primeros upgrades son clave privada, caché servidor más fuerte y menos prefetch de showcase — no quitar la conciencia de rate-limit que moldeó este código.',
    ],
  },
  {
    id: 'weather-icons',
    title: 'De códigos OpenWeather a Meteocons en meridian',
    excerpt:
      'Por qué los iconos SVG locales cargan más rápido, cómo se mapean condición y métricas, y qué ves si cambian los símbolos upstream.',
    category: 'Diseño',
    dateLabel: '28 jun 2026',
    dateIso: '2026-06-28',
    href: '/journal/weather-icons',
    imageUrl:
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: 'Lluvia en una calle de ciudad con paraguas',
    body: [
      'Los códigos de icono upstream son claves útiles, no el artwork. Meridian mapea IDs de condición de OpenWeather a SVG Meteocon locales para tarjetas nítidas en retina y uso offline cuando los assets están en caché.',
      'Los iconos de condición (despejado, lluvia, tormenta) van junto a glifos métricos de humedad, viento, UV y presión. Ambas familias en `/public/weather-icons` evitan un hop a CDN en cada tarjeta de ciudad.',
      'Cuando OpenWeather añade o renombra códigos, la capa de mapeo es el único sitio a actualizar — la UI sigue nombres locales estables. Códigos faltantes caen a un cloudy neutro en vez de una imagen rota.',
      'El objetivo es clima glanceable en el mismo lenguaje visual en hero, rejilla y city detail — no clones pixel perfect de los sprites raster de OpenWeather.',
    ],
  },
];
