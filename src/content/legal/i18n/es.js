const terms = {
  slug: 'terms',
  title: 'Condiciones de uso',
  lastUpdated: '2026-07-14',
  sections: [
    {
      id: 'who-we-are',
      title: 'Quiénes somos',
      body:
        'meridian es un nombre comercial de Website Servers Ltd, una empresa registrada en Inglaterra y Gales con el número de sociedad 17240780, con domicilio social en Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR.\n\nEstas Condiciones de uso rigen su acceso y uso del servicio meteorológico meridian disponible en meridianweather.co.uk (el «Servicio»). Al usar el Servicio, usted acepta estas condiciones. Si no está de acuerdo, no utilice el Servicio.\n\nEl sitio web de nuestra empresa matriz es websiteservers.co.uk. Para asuntos de privacidad, consulte nuestra Política de privacidad y Política de cookies. Preguntas sobre estas condiciones: privacy@meridianweather.co.uk.',
    },
    {
      id: 'service',
      title: 'El Servicio',
      body:
        'meridian ofrece monitorización del clima en varias ciudades, pronósticos, resúmenes y alertas meteorológicas opcionales por correo electrónico, documentación y funciones relacionadas. Los datos de pronóstico y observación los suministran proveedores meteorológicos externos (principalmente OpenWeather) y pueden estar incompletos, ser inexactos, estar retrasados o no estar disponibles.\n\nEl Servicio es solo informativo. No confíe en meridian para decisiones críticas para la seguridad, planificación de emergencias, aviación, navegación marítima ni ninguna situación en la que un fallo de los datos meteorológicos pueda causar daño. Siga siempre las indicaciones de los servicios meteorológicos y de emergencia oficiales de su zona.',
    },
    {
      id: 'browser-only',
      title: 'Cuentas y almacenamiento del navegador',
      body:
        'Los usuarios públicos no necesitan una cuenta de meridian. Las ciudades guardadas, las preferencias de visualización, los ajustes de accesibilidad y opciones similares se almacenan en su navegador (localStorage y almacenamiento del cliente relacionado). No se sincronizan entre navegadores ni dispositivos a menos que usted los configure de nuevo.\n\nEl personal y los operadores pueden usar cuentas administrativas separadas para operar la plataforma. Esas cuentas están sujetas a controles de acceso internos y no son cuentas de usuario consumidor.',
    },
    {
      id: 'tiers',
      title: 'Nivel gratuito, anuncios y Premium',
      body:
        'El Servicio se ofrece en un nivel gratuito que puede mostrar publicidad (incluido Google AdSense) cuando la publicidad está configurada y usted ha consentido cuando se requiere. Las funciones Premium descritas en el producto (por ejemplo, navegación sin anuncios o más detalle de pronóstico) pueden aparecer en la interfaz, pero la facturación de pago (incluido Stripe) no está en producción. Hasta que la facturación esté activada, cualquier control de «Premium» o de mejora puede no estar disponible o estar deshabilitado.\n\nPodemos cambiar la disponibilidad de funciones, los límites de tasa, el almacenamiento en caché o la ubicación de anuncios para proteger las cuotas de proveedores y la estabilidad del servicio.',
    },
    {
      id: 'email',
      title: 'Suscripciones por correo electrónico',
      body:
        'Si se suscribe al boletín, a los resúmenes semanales o a las alertas meteorológicas, debe proporcionar una dirección de correo válida y aceptar cada tipo de suscripción que desee. Cada correo incluye un método de baja. Podemos pausar o dejar de enviar si la entrega falla de forma repetida o si el uso parece abusivo.\n\nLos datos de suscripción se tratan según lo descrito en nuestra Política de privacidad.',
    },
    {
      id: 'acceptable-use',
      title: 'Uso aceptable',
      body:
        'No debe: abusar ni sobrecargar nuestras API; extraer, copiar o redistribuir claves o datos de pronóstico de forma masiva; automatizar solicitudes meteorológicas excesivas a proveedores; intentar interrumpir, realizar ingeniería inversa de controles de seguridad u obtener acceso no autorizado a sistemas de administración; usar el Servicio con fines ilícitos; ni falsear su afiliación con Website Servers Ltd o meridian.\n\nPodemos suspender o restringir el acceso que perjudique el Servicio, a otros usuarios o a nuestros proveedores.',
    },
    {
      id: 'api-dependency',
      title: 'Dependencias de terceros',
      body:
        'La disponibilidad depende de terceros, incluidos proveedores de datos meteorológicos, proveedores de entrega de correo, redes de publicidad y analítica (cuando estén habilitadas y se haya consentido), proveedores de imágenes para héroes regionales, infraestructura de alojamiento y ayudas de geolocalización. Podemos servir datos en caché, limitar las actualizaciones o degradar funciones cuando lo exijan las cuotas o las interrupciones.\n\nLas condiciones y avisos de privacidad de terceros se aplican a sus servicios; no somos responsables de su contenido ni de su disponibilidad.',
    },
    {
      id: 'intellectual-property',
      title: 'Propiedad intelectual',
      body:
        'El nombre meridian, la marca, el diseño del sitio, la documentación y el software original pertenecen a Website Servers Ltd o a sus licenciantes. Los iconos meteorológicos, los datos de pronóstico, los mapas y otros materiales de terceros siguen sujetos a los derechos de sus titulares.\n\nPuede usar el Servicio para el seguimiento meteorológico personal y no comercial. No puede copiar partes sustanciales del Servicio, hacer scraping para su reventa ni eliminar avisos de propiedad sin permiso previo por escrito.',
    },
    {
      id: 'age',
      title: 'Edad',
      body:
        'El Servicio está destinado a adultos y adolescentes mayores responsables. Si tiene menos de 13 años (o menos de la edad de consentimiento digital en su país, que es 13 en el Reino Unido para la mayoría de los servicios en línea y puede ser más alta en otros lugares), no debe usar funciones que recopilen datos personales, como las suscripciones por correo, sin la participación adecuada de un padre o tutor. No comercializamos a sabiendas a menores.',
    },
    {
      id: 'liability',
      title: 'Exenciones de responsabilidad y responsabilidad',
      body:
        'El Servicio se proporciona «tal cual» y «según disponibilidad», sin garantías de exactitud, integridad, tiempo de actividad o idoneidad para un fin concreto, en la máxima medida permitida por la ley.\n\nNada de estas condiciones excluye ni limita la responsabilidad por muerte o lesiones personales causadas por negligencia, fraude u otra responsabilidad que no pueda limitarse según la ley inglesa. Sin perjuicio de lo anterior, Website Servers Ltd y sus responsables no responden de decisiones tomadas únicamente sobre la base de datos de pronóstico, pérdidas indirectas o consecuentes, ni de la pérdida de datos porque usted borró el almacenamiento del navegador o retiró el consentimiento.\n\nSi es consumidor en el Reino Unido o la UE, conserva los derechos legales imperativos que no puedan renunciarse.',
    },
    {
      id: 'changes',
      title: 'Cambios',
      body:
        'Podemos actualizar estas condiciones cuando cambie el Servicio o la ley. La fecha de «Última actualización» al inicio de esta página cambiará cuando lo hagamos. El uso continuado tras la publicación constituye la aceptación de las condiciones revisadas para usos futuros. Los cambios materiales en el tratamiento de datos personales también se reflejan en la Política de privacidad y la Política de cookies.',
    },
    {
      id: 'governing-law',
      title: 'Ley aplicable',
      body:
        'Estas condiciones se rigen por las leyes de Inglaterra y Gales. Los tribunales de Inglaterra y Gales tienen jurisdicción exclusiva, salvo que los consumidores del Reino Unido o la UE puedan presentar reclamaciones ante los tribunales de su domicilio cuando la ley local obligatoria así lo exija.\n\nEstas páginas son la política del producto meridian y no sustituyen el asesoramiento jurídico independiente.',
    },
  ],
};

const privacy = {
  slug: 'privacy',
  title: 'Política de privacidad',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'who-we-are',
      title: 'Quiénes somos',
      body:
        'Website Servers Ltd («nosotros») es el responsable del tratamiento de datos de meridian, un nombre comercial de la empresa. Estamos registrados en Inglaterra y Gales con el número de sociedad 17240780. Domicilio social: Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR.\n\nSitio del producto: meridianweather.co.uk. Sitio del grupo: websiteservers.co.uk. Contacto de privacidad: privacy@meridianweather.co.uk.\n\nEsta política explica cómo tratamos los datos personales cuando usa meridian. Está redactada para alinearse con el UK GDPR y la Data Protection Act 2018, y para dar un aviso claro a visitantes fuera del Reino Unido. Es política de producto, no asesoramiento jurídico.',
    },
    {
      id: 'overview',
      title: 'Resumen',
      body:
        'No necesita una cuenta pública para usar meridian. La mayoría de las listas de ciudades y preferencias de visualización permanecen en su navegador. Nuestros servidores procesan solicitudes meteorológicas, suscripciones opcionales por correo, analítica de uso de primera parte (cuando activa Analítica), indicios de ubicación usados para adaptar la experiencia y (solo para el personal) cuentas administrativas.\n\nNo vendemos datos personales. La publicidad opcional (Google AdSense), la analítica de uso de primera parte y Google Analytics opcional solo se cargan cuando la categoría de consentimiento correspondiente está activada y la función está configurada. «Aceptar todo» en el banner de cookies activa las funciones funcionales y la publicidad — no Analítica.',
    },
    {
      id: 'data-we-collect',
      title: 'Datos que recopilamos',
      body:
        'Navegador / dispositivo (normalmente mediante localStorage o sessionStorage): ID de cliente anónimo (UUID que vincula suscripciones opcionales a este navegador); ciudades guardadas y búsquedas recientes (nombres, regiones, coordenadas); perfil de ubicación (coordenadas aproximadas o precisas, etiqueta, fuente como IP, GPS o elección confirmada, e historial de consultas); caché meteorológica; tema, unidad de temperatura, locale, preferencias de accesibilidad, preferencias de actualización del clima; indicadores de consentimiento y del banner de cookies; espejo local de preferencias de suscripción por correo; borradores opcionales de comentarios del diario almacenados solo en su dispositivo; ID de sesión de analítica en sessionStorage.\n\nServidor cuando opta o interactúa: dirección de correo; tipo de suscripción (boletín, resumen semanal de ciudad, alertas de ciudad); nombre de ciudad y coordenadas para correos de ciudad; JSON de preferencias de alertas; tokens de baja; instantáneas meteorológicas y registros de diagnóstico de API indexados principalmente por coordenadas y metadatos de solicitud, no por su nombre.\n\nSeñales de ubicación: geolocalización del navegador solo cuando usted la permite y se concede el consentimiento funcional; región aproximada a partir de cabeceras CDN o de alojamiento cuando estén disponibles; geolocalización IP de respaldo mediante ipwho.is cuando sea necesario para sugerir una región de origen.\n\nAnalítica de primera parte (solo cuando el consentimiento de Analítica está activado): ruta de página, identificador de sesión, tiempo de compromiso y profundidad de desplazamiento almacenados en nuestra base de datos. Los eventos de visualización de espacios publicitarios también requieren consentimiento de Publicidad. Las rutas del panel de administración quedan excluidas de esta baliza.\n\nSistemas del personal: correo de administrador, nombre para mostrar, hash de contraseña, tokens de invitación y restablecimiento de contraseña, cookie de sesión y registros de auditoría de acciones administrativas. La configuración de la plataforma puede incluir credenciales de API de terceros usadas para operar el Servicio.',
    },
    {
      id: 'legal-bases',
      title: 'Por qué usamos los datos (finalidades y bases jurídicas)',
      body:
        'Prestar el Servicio meteorológico y la seguridad (incluido el ID de cliente anónimo, preferencias esenciales, proxies meteorológicos y prevención de abuso): intereses legítimos (UK GDPR Art. 6(1)(f)) y, cuando el almacenamiento es estrictamente necesario para un servicio que usted solicita, ejecución de un contrato (Art. 6(1)(b)).\n\nFunciones funcionales opcionales como la escritura de caché meteorológica y GPS preciso cuando usted las elige: consentimiento (Art. 6(1)(a)), gestionado mediante nuestra Política de cookies y el centro de preferencias.\n\nResúmenes y alertas por correo: consentimiento / opt-in por tipo de suscripción (Art. 6(1)(a)); puede retirarlo mediante los enlaces de baja.\n\nPublicidad cuando está habilitada: consentimiento (Art. 6(1)(a)).\n\nAnalítica de uso de primera parte y Google Analytics (cuando están configurados): consentimiento (Art. 6(1)(a)) mediante la preferencia de Analítica. Los eventos de visualización de espacios publicitarios en la analítica de primera parte también requieren consentimiento de Publicidad.\n\nAdministración del personal: intereses legítimos y, cuando proceda, contrato con el operador.',
    },
    {
      id: 'cookies-consent',
      title: 'Cookies y tecnologías similares',
      body:
        'La navegación pública usa más el almacenamiento del navegador que las cookies clásicas de primera parte. Los socios de publicidad y analítica opcional pueden establecer sus propias cookies cuando usted consiente. El inventario completo y los controles PECR están en nuestra Política de cookies. Puede cambiar o retirar sus elecciones mediante el control de ajustes (preferencias de privacidad / cookies) o el banner de cookies.',
    },
    {
      id: 'third-party',
      title: 'Con quién compartimos datos',
      body:
        'Los encargados del tratamiento y proveedores que nos ayudan a operar meridian pueden recibir datos limitados según sea necesario: OpenWeather (coordenadas, consultas de búsqueda, locale) para clima y geocodificación; Open-Meteo y US National Weather Service para ciertas advertencias; ipwho.is para indicios de región basados en IP; proveedores de correo como Resend o SendGrid (y otros si se activan) para correo transaccional y de suscripción; Google (AdSense y, si está configurado, Google Analytics) cuando usted consiente; proveedores opcionales de imágenes de héroe (por ejemplo Unsplash, Wikimedia o Pexels) usando términos de búsqueda de región o monumento; proveedores de alojamiento y CDN que pueden ver direcciones IP y metadatos de solicitud.\n\nNo vendemos datos personales ni licenciamos perfiles de navegación identificables a terceros para su propio marketing.',
    },
    {
      id: 'international',
      title: 'Transferencias internacionales',
      body:
        'Algunos proveedores tienen su sede fuera del Reino Unido (incluido en Estados Unidos u otros países). Cuando el UK GDPR se aplica a una transferencia, nos basamos en reglamentos de adecuación cuando existen, o en salvaguardas apropiadas como las cláusulas contractuales tipo del proveedor / apéndice del Reino Unido, junto con las condiciones del proveedor. Las solicitudes a privacy@meridianweather.co.uk pueden pedir más información sobre las salvaguardas de una transferencia concreta.',
    },
    {
      id: 'retention',
      title: 'Conservación',
      body:
        'Los datos del navegador permanecen hasta que borre los datos del sitio, retire el consentimiento funcional (lo que borra ciertos almacenes funcionales) o sobrescriba las preferencias.\n\nLas suscripciones por correo permanecen hasta que se dé de baja o las eliminemos tras fallos de entrega o una solicitud válida de borrado.\n\nLas entradas de caché meteorológica caducan según los TTL del servidor. Los registros de diagnóstico de API y los eventos de analítica de primera parte se conservan para operaciones y mejora; pueden introducirse ventanas de purga automática a medida que la plataforma madure; contáctenos si necesita el borrado concreto de identificadores del servidor vinculados a su correo o ID de cliente.',
    },
    {
      id: 'your-rights',
      title: 'Sus derechos',
      body:
        'En virtud del UK GDPR puede tener derechos de acceso, rectificación, borrado, limitación, oposición y portabilidad de datos, y el derecho a retirar el consentimiento en cualquier momento sin afectar al tratamiento lícito previo.\n\nEn la práctica: borre los datos del sitio en el navegador; abra las preferencias de cookies / privacidad; use los enlaces de baja en los correos; o escriba a privacy@meridianweather.co.uk con el detalle suficiente para localizar sus registros (por ejemplo, el correo usado para suscribirse).\n\nPuede presentar una reclamación ante la UK Information Commissioner’s Office (ICO) en ico.org.uk. Si vive en el Espacio Económico Europeo, también puede contactar a su autoridad de control local.',
    },
    {
      id: 'children',
      title: 'Menores',
      body:
        'meridian no está dirigido a menores de 13 años. No recopilamos a sabiendas direcciones de correo de menores para marketing. Si cree que un menor ha facilitado datos personales, contacte a privacy@meridianweather.co.uk y los eliminaremos cuando corresponda.',
    },
    {
      id: 'recent-checks',
      title: 'Consultas recientes de la plataforma',
      body:
        'La página de inicio puede mostrar dos listas cortas de lugares:\n\n• Cerca de usted — lugares sugeridos cerca de su hogar o región (no es un registro privado de sus búsquedas).\n• Búsquedas populares — lugares buscados con frecuencia en el sitio, a partir de registros de consultas compartidos. En una instalación nueva o con poca actividad, la interfaz puede mostrar brevemente algunas ciudades de demostración hasta que exista actividad de búsqueda real.\n\nNinguna de las dos listas es un historial personal de sus búsquedas privadas.',
    },
    {
      id: 'changes',
      title: 'Cambios',
      body:
        'Podemos actualizar esta política cuando cambien nuestras prácticas o la ley. La fecha de «Última actualización» cambiará cuando lo hagamos. Los cambios significativos se reflejarán en esta página; cuando se exija, solicitaremos un nuevo consentimiento.',
    },
  ],
};

const cookies = {
  slug: 'cookies',
  title: 'Política de cookies',
  lastUpdated: '2026-07-15',
  sections: [
    {
      id: 'overview',
      title: 'Resumen',
      body:
        'Website Servers Ltd operando como meridian utiliza cookies y tecnologías similares (incluido localStorage y sessionStorage) en meridianweather.co.uk. Esta Política de cookies explica qué almacenamos, por qué y cómo puede controlarlo según las UK Privacy and Electronic Communications Regulations (PECR) y el UK GDPR.\n\nLos datos del responsable coinciden con nuestra Política de privacidad: Website Servers Ltd, número de sociedad 17240780, domicilio social Orchard Cottage, Beck Orchard, Brampton, United Kingdom, CA8 1UR. Contacto: privacy@meridianweather.co.uk.\n\nEn resumen: la mayoría de las opciones permanecen en su dispositivo. Google puede establecer cookies solo si permite publicidad o analítica y esos productos están activados.',
    },
    {
      id: 'what-we-use',
      title: 'Qué usamos (en lenguaje claro)',
      body:
        'Esencial / siempre activo: recordar que cerró el banner de cookies, su ID de cliente anónimo para enlaces de correo opcionales, preferencias de tema e idioma, y las ciudades que fija.\n\nFuncional (opcional): recordar el clima reciente en este dispositivo entre visitas, y ayudas de ubicación precisa si las permite.\n\nPublicidad (opcional): Google AdSense cuando está configurado. Medir si se vio un espacio publicitario también requiere esta elección.\n\nAnalítica (opcional): nuestra propia medición simple del uso de páginas y, si está configurado, Google Analytics. «Aceptar todo» no activa Analítica — elíjala en Gestionar preferencias si la desea.\n\nLa preferencia de correo de marketing está reservada y no se usa para rastreadores de marketing adicionales más allá de los correos a los que se suscribe explícitamente.',
    },
    {
      id: 'local-storage',
      title: 'Nombres almacenados en este dispositivo',
      body:
        'En este dispositivo podemos almacenar claves como:\n\nmeridian:client-id — ID anónimo que vincula suscripciones opcionales por correo a este navegador.\n\nmeridian:saved-cities — ciudades que fija (hasta diez).\n\nmeridian:checked-cities — búsquedas recientes de ciudades.\n\nmeridian:user-location — perfil de hogar / región e historial relacionado.\n\nmeridian:weather-cache — clima en caché (solo se escribe cuando Funcional está activado).\n\nmeridian:theme, meridian:temperature-unit, meridian:preferred-locale, meridian:accessibility, meridian:weather-refresh-mode, meridian:city-detail-accordion — preferencias de visualización.\n\nmeridian:consent — sus elecciones de categoría.\n\nmeridian:cookie-consent — indicador antiguo de reconocimiento del banner.\n\nmeridian:subscriptions — espejo local de preferencias de correo.\n\nmeridian:tier — reservado (el producto es gratuito hoy).\n\nsessionStorage meridian_analytics_sid — ID de sesión usado solo cuando Analítica está activada.\n\nLas publicaciones demo del diario pueden conservar comentarios solo en su dispositivo.\n\nSolo personal: una cookie HttpOnly meridian_admin_session para la consola de administración.',
    },
    {
      id: 'consent-categories',
      title: 'Cómo elegir',
      body:
        'essential — siempre activo para la memoria básica del servicio.\n\nfunctional — clima guardado en este dispositivo y ayudas de ubicación precisa que usted elige.\n\nadvertising — Google AdSense cuando está configurado; también requerido para eventos de visualización de espacios publicitarios de primera parte.\n\nanalytics — baliza de uso de primera parte y Google Analytics cuando están configurados.\n\nmarketing — reservado.\n\nOpciones del banner: Solo esenciales, Aceptar funcional, Aceptar todo o Gestionar preferencias. Vuelva a abrir las preferencias desde el control flotante de Ajustes cuando esté disponible (puede ocultarse al desplazarse y puede estar oculto con movimiento reducido). Aceptar todo = funcional + publicidad; active Analítica por separado si la desea.',
    },
    {
      id: 'third-party',
      title: 'Cookies de terceros',
      body:
        'Cuando el consentimiento de publicidad está activado y AdSense está en línea, Google puede establecer cookies según las políticas de Google.\n\nCuando el consentimiento de analítica está activado y GA4 está configurado, Google Analytics puede establecer sus propias cookies.\n\nNo controlamos por completo esas cookies de terceros. Revise la privacidad y los ajustes de anuncios de Google junto con esta política.',
    },
    {
      id: 'withdraw',
      title: 'Cómo cambiar o borrar',
      body:
        'Abra Ajustes → Cookies (cuando el engranaje esté disponible), o borre los datos del sitio de meridianweather.co.uk en su navegador.\n\nDesactivar la publicidad detiene nuestro script de AdSense en visitas posteriores. Desactivar la analítica detiene nuestra baliza de uso y el cargador de GA cuando está configurado.\n\nPreguntas: privacy@meridianweather.co.uk.',
    },
  ],
};

const accessibility = {
  slug: 'accessibility',
  title: 'Declaración de accesibilidad',
  lastUpdated: '2026-07-14',
  sections: [
    {
      id: 'commitment',
      title: 'Nuestro compromiso',
      body:
        'Website Servers Ltd operando como meridian quiere que meridianweather.co.uk sea usable por el mayor número posible de personas. Aspiramos a cumplir las Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.\n\nEsta declaración se aplica al Servicio público de clima meridian. Sigue el espíritu del modelo de declaración de accesibilidad del Reino Unido usado en sitios del sector público y refleja nuestros deberes bajo la Equality Act 2010 de no discriminar a personas con discapacidad al prestar servicios.\n\nEstado: cumplimiento parcial de WCAG 2.1 AA. Algunas partes de la experiencia aún no cumplen plenamente ese estándar. Esta página se revisó por última vez el 14 de julio de 2026.',
    },
    {
      id: 'how-accessible',
      title: 'Cómo de accesible es este sitio web',
      body:
        'Creemos que la mayoría de los visitantes pueden: navegar las páginas principales con el teclado; usar esquemas de color claro, oscuro o del sistema; ampliar el texto; activar alto contraste, enlaces subrayados, anillos de foco mejorados y una fuente de sistema legible; reducir el movimiento; saltar al contenido principal; y usar el sitio en inglés (US/UK), alemán, francés, español, japonés o árabe (con diseño de derecha a izquierda para el árabe).\n\nSabemos que algunas personas pueden encontrar difíciles ciertas partes del Servicio. Los problemas conocidos se enumeran a continuación.',
    },
    {
      id: 'features',
      title: 'Medidas que adoptamos',
      body:
        'Puntos de referencia semánticos (header, main, footer); enlace opcional de salto a #main-content; controles etiquetados y estilos de foco visibles; centro de preferencias para accesibilidad y cookies; diálogos y paneles con controles de cierre para suscripción, quitar ciudad y ajustes; banner de cookies expuesto como diálogo; búsqueda de ciudades presentada como combobox con actualizaciones de región en vivo para resultados; iconos meteorológicos que complementan el texto de la condición en lugar de sustituirlo; cifras tabulares para temperaturas; gráficos que exponen nombres accesibles cuando están implementados; objetivos táctiles dimensionados para muchos controles interactivos; soporte de movimiento reducido que suprime animaciones no esenciales y carruseles que avanzan solos.',
    },
    {
      id: 'gaps',
      title: 'Contenido no accesible',
      body:
        'La búsqueda de ciudades aún no admite plenamente la navegación de combobox con teclas de flecha según lo documentado en el README del producto.\n\nLas áreas de pronóstico horario y por minutos son principalmente regiones visuales de desplazamiento horizontal y pueden carecer de un detalle equivalente no visual.\n\nAlgunas filas de pronóstico diario emparejan un icono con una fecha sin una frase visible separada de la condición.\n\nLos controles de Premium / mejora pueden aparecer deshabilitados sin un flujo de pago alternativo mientras la facturación no esté en producción.\n\nLas unidades de terceros de Google AdSense, cuando se consienten y cargan, quedan fuera de nuestro control editorial pleno; su accesibilidad puede variar.\n\nLa consola de administración está dirigida a operadores y no queda cubierta por esta declaración pública.\n\nEl banner de cookies usa semántica de diálogo pero puede no atrapar el foco con tanta solidez como otros modales.',
    },
    {
      id: 'feedback',
      title: 'Comentarios y contacto',
      body:
        'Si encuentra un problema de accesibilidad no listado aquí, o necesita información en otro formato, escriba a privacy@meridianweather.co.uk con «Accessibility» en el asunto. También puede contactar a Website Servers Ltd a través de websiteservers.co.uk.\n\nPretendemos acusar recibo de los comentarios de accesibilidad en un plazo de cinco días laborables y comunicarles qué ocurre a continuación.',
    },
    {
      id: 'enforcement',
      title: 'Procedimiento de reclamación',
      body:
        'Si no está satisfecho con nuestra respuesta, puede contactar a la Equality and Human Rights Commission (EHRC). Para consejo en Inglaterra, Escocia o Gales, consulte equalityadvisoryservice.com. Irlanda del Norte tiene una Equality Commission separada. La orientación oficial sobre reclamaciones de accesibilidad web la publica GOV.UK.',
    },
    {
      id: 'technical',
      title: 'Información técnica',
      body:
        'meridian es una aplicación web Next.js. La accesibilidad depende de un navegador moderno con JavaScript habilitado para las funciones interactivas (búsqueda, ajustes, suscripciones). Probamos principalmente con navegación por teclado y herramientas del navegador; no hemos publicado una auditoría completa frente a cada criterio de éxito de WCAG ni cada combinación de tecnología de apoyo.\n\nLas tecnologías de apoyo con las que esperamos un resultado razonable incluyen versiones recientes de lectores de pantalla (por ejemplo NVDA, VoiceOver) y el zoom del navegador hasta aproximadamente el 200 %, sujetos a las limitaciones anteriores.\n\nPreparación de esta declaración: basada en una autoevaluación interna de la UI implementada y las lagunas conocidas. Actualizaremos esta declaración cuando se publique un trabajo importante de accesibilidad.',
    },
  ],
};

export const LEGAL_POLICIES_I18N = [terms, privacy, cookies, accessibility];
