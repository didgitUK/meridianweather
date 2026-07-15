/** Arabic documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'البدء',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'نظرة عامة',
        body:
          'meridian لوحة طقس متعددة المدن. تبحث عن المواقع وتثبّت حتى عشر مدن في متصفحك وتراقب الظروف الحالية والتنبؤات القصيرة وتحديثات البريد الاختيارية. لا حاجة لحساب — قوائم المدن والتفضيلات تُخزَّن لكل جهاز في localStorage.',
      },
      {
        id: 'requirements',
        title: 'المتطلبات',
        body:
          'تحتاج اللوحة إلى مفتاح OpenWeather API على الخادم (OPENWEATHER_API_KEY). بدونه، تفشل طلبات الطقس والترميز الجغرافي. اشتراكات البريد ومهام cron وAdSense اختيارية وتُفعَّل فقط عند ضبط متغيرات البيئة أو الموصلات. SQLite (better-sqlite3) يعمل دائماً للتخزين المؤقت والحصص.',
      },
      {
        id: 'add-city',
        title: 'تثبيت مدينة',
        body:
          'استخدم حقل البحث في بطل الصفحة الرئيسية أو في الترويسة. اكتب حرفين على الأقل؛ تظهر النتائج بعد تأخير 300ms. اختر نتيجة ترميز جغرافي لفتح صفحة تفاصيل المدينة. استخدم Pin to your locations في تلك الصفحة لحفظ المدينة في Your locations. التكرارات مرفوضة. كل مدينة تحصل على معرّف ثابت: {slugified-name}-{country}-{latitude to four decimals}، يُستخدم في عناوين URL مثل /city/london-gb-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'حد المدن',
        body:
          'يمكنك تثبيت حتى عشر مدن (MAX_SAVED_CITIES). عند بلوغ الحد، ثبّت مدينة أخرى فقط بعد إزالة واحدة من الشبكة.',
      },
      {
        id: 'first-visit',
        title: 'الزيارة الأولى: ملفات تعريف الارتباط والسمة',
        body:
          'في الزيارة الأولى، يشرح شريط ملفات تعريف الارتباط استخدام التخزين المحلي. الأزرار: Accept all (وظيفي + إعلانات)، Accept functional، Essential only، وManage preferences. أعد فتح إعدادات ملفات تعريف الارتباط في أي وقت عبر عنصر الإعدادات العائم (تبويب Cookies). مفتاح السمة العائم يبدّل تفضيل الوضع الفاتح أو الداكن (يُخزَّن في meridian:theme).',
      },
      {
        id: 'navigation',
        title: 'إلى أين تنتقل بعد ذلك',
        body:
          'Dashboard يشرح تخطيط الصفحة الرئيسية. City detail يغطي صفحات التنبؤ الكاملة. Forecasts & cache يشرح TTL وطبقات التخزين المؤقت. Subscriptions يغطي البريد. API limits وAPI reference يوثّقان سلوك الخادم. الوثائق تُقدَّم أيضاً على docs.localhost:3000 في التطوير المحلي (إعادة كتابة middleware). الوثائق المحرَّرة في CMS قد تختلف حتى إعادة التعيين إلى افتراضيات الملف.',
      },
      {
        id: 'verify',
        title: 'للمطورين',
        body:
          'شغّل npm run verify للفحص والاختبار والبناء. شغّل npm run dev وافتح localhost:3000. اختياري: سجّل الدخول عند /login ثم افتح /admin لتشخيص الاستخدام وإعدادات المنصة (قد يُطبَّق تجاوز التطوير عندما ADMIN_SECRET غير مضبوط في التطوير).',
      },
    ],
  },
  {
    slug: 'dashboard',
    title: 'لوحة التحكم',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'layout',
        title: 'تخطيط الصفحة',
        body:
          'أقسام الصفحة الرئيسية: (1) Hero — مقدمة المنتج وفحص الطقس حسب الموقع وإعلان مربع في البطل. (2) Recent checks — عمودان («Near you» و«Popular searches»). (3) Your locations — بطاقات طقس للمدن المثبتة. (4) عنصر/وحدة إعلان اللوحة. (5) Journal — ست بطاقات مقالات بأسلوب مدونة في دوّار يسار/يمين تربط بمنشورات `/journal/[slug]`.',
      },
      {
        id: 'cards',
        title: 'بطاقات الطقس',
        body:
          'كل بطاقة تعرض اسم المدينة والمنطقة/البلد ودرجة الحرارة الحالية ووصف الحالة وأيقونة Meteocons ودرجة الحرارة المحسوسة والرطوبة والرياح. البطاقات تربط بصفحة تفاصيل المدينة. التمرير يُحمّل مسبقاً مسار التفاصيل وبيانات الطقس.',
      },
      {
        id: 'forecast-strip',
        title: 'تنبؤ مصغّر لسبعة أيام',
        body:
          'أسفل القراءة الرئيسية، تعرض كل بطاقة نظرة لسبعة أيام (تسمية اليوم والأيقونة والحد الأدنى/الأعلى). نطاقا current وdaily يُحمَّلان معاً في طلب batch واحد للوحة — لا يوجد جلب daily منفصل عبر idleCallback. الشريط يعرض تسمية اليوم والأيقونة ونطاق درجة الحرارة min/max.',
      },
      {
        id: 'card-actions',
        title: 'إجراءات البطاقة',
        body:
          'Subscribe يفتح نافذة للملخص الأسبوعي ورسائل تنبيهات الطقس لتلك المدينة. Remove (X) يحذف المدينة من localStorage ويمسح تخزين الطقس في المتصفح. إن وُجدت اشتراكات بريد نشطة لتلك المدينة، يعرض حوار إلغاء الاشتراك قبل الإزالة.',
      },
      {
        id: 'states',
        title: 'حالات التحميل والخطأ',
        body:
          'أثناء تحميل الطقس، تُعرض بطاقة هيكلية. عند فشل المصدر العلوي، تعرض البطاقة تنبيهاً بخطأ مع إجراءي Retry وRemove. الشبكة الفارغة تعرض إرشاداً للبحث وتثبيت أول مدينة من صفحة التفاصيل.',
      },
      {
        id: 'refresh',
        title: 'سلوك التحديث',
        body:
          'افتراضياً، Your locations يستخدم التحديث اليدوي (`meridian:weather-refresh-mode`): تعرض اللوحة آخر قراءة مخزّنة في هذا المتصفح عند تحميل الصفحة، وتجلب البيانات فقط عند النقر على تحديث في بطاقة (أو عندما لا يوجد تخزين محلي للمدينة بعد). لا يوجد لوحة Settings → Weather في الواجهة الحالية؛ المفتاح موجود للاستخدام البرمجي أو المستقبلي. البيانات تُخزَّن أيضاً على الخادم (ذاكرة + SQLite). راجع Forecasts & cache لتفاصيل TTL.',
      },
      {
        id: 'recent-checks',
        title: 'Recent checks',
        body:
          'عمودان يعرضان حتى خمس بطاقات لكل منهما من GET /api/recent-checks (عمليات البحث الشائعة من location_weather_checks، حد API 20، source popular|empty). البطاقات تربط بتفاصيل المدينة عند وجود إحداثيات. npm run seed:checks يملأ weather_snapshots فقط — لا يملأ هذا الشريط. راجع Recent checks & seeding.',
      },
    ],
  },
  {
    slug: 'city-detail',
    title: 'تفاصيل المدينة',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'access',
        title: 'من يمكنه عرض صفحة مدينة',
        body:
          'صفحات التفاصيل على /city/[cityId]. resolveCity() يقدّم دائماً خمس مدن PLATFORM_SHOWCASE_CITIES (London وDubai وNew York وTokyo وSydney). أي صف موقع بـ city_slug يُحلّ أيضاً. المعرّفات المحلّلة بصيغة {name}-{country}-{lat} تطابق عندما lat/country موجودان في SQLite. السلاجات غير المعروفة أو المعطوبة تُرجع 404. لا حاجة لتثبيت مدينة لفتح صفحتها.',
      },
      {
        id: 'tabs',
        title: 'تبويبات التنبؤ',
        body:
          'تبويبات ثابتة: Today وHourly و10-Day وHistory. رابط عميق بـ ?tab=hourly أو ?tab=daily أو ?tab=history. ?tab=next-hour القديم يُعيد التوجيه إلى Today. حتى ثلاثة لافتات تنبيه OpenWeather تُعرض فوق البطل عند وجود alertIds. AdSlot لـ city-detail مباشرة تحت التبويبات.',
      },
      {
        id: 'header',
        title: 'ترويسة الصفحة والبطل',
        body:
          'افتراضياً تستخدم الترويسة خلفية خريطة OSM فضائية عندما isCityHeroOsmEnabled() true (NEXT_PUBLIC_CITY_HERO_OSM غير مضبوط أو ليس "0"). اضبط NEXT_PUBLIC_CITY_HERO_OSM=0 لتفضيل الصور. وضع الصورة يتسلسل Unsplash → Wikimedia Commons → Pexels عبر getHeroImageForRegion، مع SVG ثابتة احتياطية عند غياب المفاتيح. Google Street View اختياري يُطبَّق عند إيقاف OSM وNEXT_PUBLIC_CITY_HERO_STREET_VIEW=1.',
      },
      {
        id: 'today',
        title: 'تبويب Today',
        body:
          'بطل الظروف الحالية وبلاطات مقاييس بأيقونات Meteocon وأكورديونات Current conditions / Location / Sun times. معاينة ساعية لبقية اليوم عند توفر بيانات hourly.',
      },
      {
        id: 'hourly',
        title: 'تبويب Hourly',
        body:
          'قائمة بطاقات للـ 12 ساعة القادمة (عمود واحد) لدرجة الحرارة قصيرة المدى واحتمال الهطول والرياح.',
      },
      {
        id: 'daily',
        title: 'تبويب 10-Day',
        body:
          'قائمة نظرة يومية (حتى عشرة أيام): يوم الأسبوع والأيقونة والوصف/الملخص والحد الأدنى/الأعلى واحتمال المطر والرياح والأشعة فوق البنفسجية. اختيار يوم يفتح مخطط المقاييس لذلك التاريخ.',
      },
      {
        id: 'history',
        title: 'تبويب History',
        body:
          'أيام سابقة من الملاحظات المخزّنة والتنبؤات المؤرشفة عبر GET /api/weather/history، مع منتقي يوم ومخطط.',
      },
      {
        id: 'alerts',
        title: 'تنبيهات الطقس',
        body:
          'عندما يُرجع OpenWeather تنبيهات، AlertBanner يعرض ثلاثة كحد أقصى فوق البطل. النص الكامل متاح عبر GET /api/alerts/[alertId].',
      },
      {
        id: 'data',
        title: 'تحميل البيانات',
        body:
          'SSR يُهيّئ current وdaily وhourly عند التوفر من getCityWeatherForSeo. خطاف العميل useCityWeather يجلب دفعة DETAIL_SCOPES = [current, hourly, daily] عبر POST /api/weather/batch — minutely غير مطلوب. Premium / MinutelyPrecipStrip غير موصول.',
      },
      {
        id: 'subscribe',
        title: 'التثبيت والاشتراك',
        body:
          'قائمة Options في الترويسة توفر Pin to your locations وSubscribe (ملخص أسبوعي + تنبيهات طقس) — نفس تدفقات بطاقات اللوحة. Pin يحفظ في meridian:saved-cities؛ subscribe يفتح SubscribeDialog.',
      },
      {
        id: 'prefetch',
        title: 'التحميل المسبق',
        body:
          'تمرير المؤشر على بطاقة طقس في اللوحة يُحمّل مسبقاً /city/[cityId] ويسخّن تخزين L0 عبر prefetchCityDetail لفتح صفحات التفاصيل أسرع.',
      },
      {
        id: 'seo',
        title: 'البحث والاكتشاف',
        body:
          'عند أول فحص طقس حالي ناجح لموقع، markLocationIndexable يضبط city_slug وindexable_at ويضيف المدينة إلى خريطة الموقع ويعرض بيانات SEO وكتلة ملخص على صفحة المدينة من الخادم.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'التنبؤات والتخزين المؤقت',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'scopes',
        title: 'نطاقات الطقس',
        body:
          'نطاقات يطلبها العميل: current (الآن) وhourly (جدول زمني) وdaily (جدول زمني) وminutely (هطول). نطاقات الخادم فقط: geocode (تخزين بحث المدن بمفتاح geocode:{query}) وalert (حمولات تنبيه فردية). كل نطاق طقس يستخدم مفتاح تخزين {lat},{lon},{scope}؛ geocode بسلسلة الاستعلام.',
      },
      {
        id: 'layers',
        title: 'طبقات التخزين المؤقت',
        body:
          'L0 — localStorage للمتصفح meridian:weather-cache، بنية {cityId: {scope: {payload, fetchedAt}}}. L1 — Map في الذاكرة على عملية الخادم. L2 — SQLite weather_snapshots مع fetched_at وexpires_at وstale_until. القراءة تفحص L0 → API → L1/L2 → OpenWeather العلوي.',
      },
      {
        id: 'freshness',
        title: 'حالات الحداثة',
        body:
          'fresh — ضمن expires_at. acceptable — بعد expires لكن ضمن stale_until (قد يُقدَّم still). expired — بعد stale_until، يُشغّل المصدر العلوي إن سمحت الحصة. emergency — الحصة محجوبة لكن يُقدَّم لقطة L2 منتهية/مقبولة حتى يرى المستخدمون بيانات.',
      },
      {
        id: 'ttl-table',
        title: 'افتراضيات TTL (SCOPE_TTL)',
        body:
          'current — fresh 1h وstale 2h (يُستبدل بـ platform_settings.refresh_interval_ms وstale_cache_max_ms؛ المشرف يمكنه 10m–2h). hourly — fresh 2h وstale 6h. daily — fresh 6h وstale 12h. minutely — fresh 15m وstale 30m. geocode — fresh 7d وstale 30d. alert — fresh 1h وstale 6h.',
      },
      {
        id: 'upstream',
        title: 'تكامل OpenWeather',
        body:
          'الأساسي: One Call API 4.0 (onecall/current وtimeline/1h وtimeline/1day وtimeline/1min). نطاق current يتراجع إلى API 2.5 /weather إذا فشل One Call current. الترميز الجغرافي يستخدم OpenWeather geocoding API (حد 5). التطبيع في src/lib/one-call.js ينتج حمولات واجهة متسقة.',
      },
      {
        id: 'batch',
        title: 'الجلب الدفعي',
        body:
          'POST /api/weather/batch يقبل { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. النطاقات لكل مدينة (city.scopes) وليست مصفوفة scopes عليا. اللوحة تحمّل current + daily معاً في دفعة واحدة (بدون requestIdleCallback). تفاصيل المدينة تجمع current + hourly + daily فقط. المعالج يباعد بين المدن ~100ms لتجنب حدود المعدل.',
      },
      {
        id: 'headers',
        title: 'بيانات الاستجابة الوصفية',
        body:
          'استجابات API تتضمن meta: cacheLayer (memory وdatabase وupstream) وfreshness وfetchedAt وageMs وupstreamCallAvoided وsource. رأس X-Cache يعكس hit/miss حيث ينطبق. «Updated X ago» في الواجهة يستخدم meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'تفاعل الحصة',
        body:
          'عند تجاوز الحدود اليومية أو في الدقيقة، تتوقف استدعاءات المصدر العلوي ويُرجع بيانات L2 قديمة emergency إن وُجدت. إعادة فتح مدينة ضمن TTL تكلف صفر استدعاءات علوية.',
      },
      {
        id: 'logging',
        title: 'تسجيل إصابات التخزين المؤقت',
        body:
          'إصابات تخزين L2 في قاعدة البيانات تُسجَّل في api_call_log بـ cache_hit=1 ولا تزيد العداد اليومي العلوي. إصابات L1 في الذاكرة تُقدَّم لكن لا تُحفَظ في SQLite — تُطلق عند كل إعادة mount SSR/عميل وستُرهق meridian.db تحت file watchers.',
      },
      {
        id: 'payload-fields',
        title: 'حقول حمولة current',
        body:
          'temperature وfeelsLike وdescription وcondition وicon (رمز OpenWeather) وhumidity وpressure وdewPoint وuvi وclouds وvisibility وwindSpeedKmh وwindGustKmh وwindDeg وsunrise وsunset وalertIds وcity وcountry وtimezone وupdatedAt وsource.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'Recent checks والبذر',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'ما هي recent checks',
        body:
          'recent checks في الصفحة الرئيسية تعرض عمليات البحث الشائعة على مستوى المنصة — مواقع مرتبة بمدى تكرار اختيار المستخدمين لها أو معاينتها عبر البحث — وليست سجل بحثك الشخصي ولا تفريغاً خاماً لتخزين لقطات الطقس.',
      },
      {
        id: 'api',
        title: 'سلوك API',
        body:
          'GET /api/recent-checks يستدعي getRecentChecksPayload() الذي يقرأ location_weather_checks (مربوطاً بـ locations) عبر listPopularSearchChecks. الحد الافتراضي 20. المحفّزات المحسوبة search_select وsearch_preview. شكل الاستجابة { checks, source } حيث source هو popular عند وجود صفوف أو empty عند عدمها. لا يوجد showcase fallback.',
      },
      {
        id: 'ui',
        title: 'واجهة الصفحة الرئيسية',
        body:
          'RecentChecksSection يعرض عمودين («Near you» و«Popular searches»)، حتى خمس بطاقات لكل منهما. البطاقات تستخدم أيقونات Meteocons ودرجة الحرارة والوصف وتسمية المدينة. عند وجود إحداثيات، تربط البطاقات بـ /city/[cityId]. لا يوجد AdSlot لـ recent-checks في الصفحة الرئيسية.',
      },
      {
        id: 'seed-script',
        title: 'بذر weather snapshots (ليس الشريط)',
        body:
          'شغّل npm run seed:checks مع ضبط OPENWEATHER_API_KEY. السكربت يجلب الطقس الحالي لثلاث وأربعين موقعاً في Cumbria وشمال شرق إنجلترا (انظر src/constants/seed-locations.js)، يكتب weather_snapshots في SQLite بفواصل زمنية fetched_at متدرجة ويُثرى الحمولة بأسماء المدن. ذلك يملأ تخزين L2 للعروض — لا يُدرج صفوف location_weather_checks مُحفَّزة بالبحث، ولن يملأ شريط recent-checks / عمليات البحث الشائعة.',
      },
      {
        id: 'persistence',
        title: 'الاستمرارية',
        body:
          'اللقطات المبذورة تعيش في DATABASE_PATH (افتراضي ./data/meridian.db). إعادة تشغيل السكربت تعمل upsert بـ cache_key. صفوف البحث الشائع تتراكم مع تسجيل عمليات بحث حقيقية؛ مسح قاعدة البيانات يفرغ اللقطات وسجل الفحوص (الشريط يظهر empty حتى تحدث عمليات بحث جديدة).',
      },
    ],
  },
  {
    slug: 'subscriptions',
    title: 'الاشتراكات',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'نظرة عامة',
        body:
          'meridian يدعم بريداً اختيارياً: نشرة المنصة (تحديثات المنتج) وملخصات أسبوعية لكل مدينة وتنبيهات طقس. كل الاشتراكات تتطلب موافقة صريحة. بلا حساب — UUID مجهول clientId في meridian:client-id يربط واجهة المتصفح بصفوف الخادم.',
      },
      {
        id: 'types',
        title: 'أنواع الاشتراك',
        body:
          'newsletter — تحديثات منتج meridian من NewsletterSignup في التذييل. city_weekly — بريد ملخص أسبوعي لمدينة محفوظة. city_alerts — إشعارات عند تطابق أنواع التنبيه المفعّلة (انظر قواعد التنبيه). الأنواع تُخزَّن في SQLite subscriptions.type وتُعكس في السجل المحلي meridian:subscriptions.',
      },
      {
        id: 'client-linking',
        title: 'معرّف العميل والسجل المحلي',
        body:
          'في الزيارة الأولى يُكتب UUID في meridian:client-id. POST /api/subscriptions يربط البريد والتفضيلات بهذا clientId. GET /api/subscriptions?clientId= يُهيّئ meridian:subscriptions عند التحميل. DELETE يعطّل حسب clientId وإحداثيات المدينة وtypes.',
      },
      {
        id: 'alert-prefs',
        title: 'تفضيلات التنبيه',
        body:
          'صفوف city_alerts تخزّن alert_prefs_json — خريطة منطقية بمفاتيح معرّف نوع التنبيه (rain وwind وthunderstorm وsnow وice وextreme_heat وfog ومستويات الشدة والهيدرولوجية وجودة الهواء والبحرية والأشعة فوق البنفسجية والطقس الشديد في الولايات المتحدة والمزيد — انظر ALL_ALERT_TYPES في constants/alert-types.js). PATCH /api/subscriptions يحدّث alertPrefs جزئياً على صف تنبيهات موجود. أعمدة alert_on_rain وalert_on_storm القديمة تُزامَن عند الإنشاء.',
      },
      {
        id: 'subscribe-ui',
        title: 'نافذة الاشتراك',
        body:
          'في كل بطاقة طقس وقائمة Options لتفاصيل المدينة: حقل بريد وخانة ملخص أسبوعي ومفاتيح تنبيه دقيقة (أو تفعيل الكل). التسميات الذكية تعرض Subscribed / Manage عند التفعيل. الملخصات الأسبوعية محدودة بـ MAX_WEEKLY_DIGEST_LOCATIONS = 20 لكل عنوان بريد. النشرة في التذييل تستخدم نفس API مع type newsletter.',
      },
      {
        id: 'emails',
        title: 'تسليم البريد',
        body:
          'sendTransactionalEmail يمر عبر موصل ESP النشط (Resend أو SendGrid أو SES أو SMTP) المختار في الإدارة. قوالب React Email من src/emails/ وSQLite email_templates: welcome (newsletter) وweekly digest وweather alert (لكل slug نوع تنبيه). بدون موصل مضبوط، API يكتب الاشتراكات لكن دوال الإرسال تُرجع { sent: false }. اضبط NEXT_PUBLIC_APP_URL لروابط إلغاء الاشتراك الصحيحة في بريد الإنتاج.',
      },
      {
        id: 'unsubscribe',
        title: 'إلغاء الاشتراك',
        body:
          'كل اشتراك له unsubscribe_token فريد. GET /api/unsubscribe?token= يعطّل ذلك الصف ويعرض تأكيداً. قوالب البريد تربط بهذا المسار. إزالة مدينة يمكن أن تلغي الاشتراك اختيارياً عبر RemoveCityDialog.',
      },
      {
        id: 'cron-weekly',
        title: 'cron الملخص الأسبوعي',
        body:
          'GET /api/cron/weekly-digests مع Authorization: Bearer CRON_SECRET. يحمّل اشتراكات city_weekly النشطة مجمّعة بالبريد، يجمع مدناً فريدة، يجلب الطقس الحالي لكل مدينة ويرسل ملخصاً واحداً لكل بريد عبر الموصل النشط. جدولة خارجية (مثل Vercel cron أو GitHub Actions) — لا جدولة مضمّنة في المستودع.',
      },
      {
        id: 'cron-alerts',
        title: 'cron تنبيهات الطقس',
        body:
          'GET /api/cron/weather-alerts مع Bearer CRON_SECRET. لكل اشتراك city_alerts، يقيّم alertPrefs المفعّلة مقابل التطابقات المدمجة من evaluateOpenWeatherAlertMatches (الظروف الحالية) وevaluateOfficialAlertMatches (تحذيرات Open-Meteo الوطنية) وتنبيهات NWS النشطة عندما تسمح مفاتيح المنصة. إزالة التكرار عبر subscription_send_log حتى لا يُرسل نفس التنبيه مرتين لنفس نافذة المدينة/الحالة.',
      },
      {
        id: 'remove-city',
        title: 'تكامل إزالة المدينة',
        body:
          'حذف مدينة محفوظة يمسح تخزين الطقس L0. إن وُجدت اشتراكات لتلك المدينة، RemoveCityDialog يطلب إلغاء الاشتراك من الملخص الأسبوعي و/أو التنبيهات قبل تأكيد الإزالة.',
      },
    ],
  },
  {
    slug: 'monetization',
    title: 'تحقيق الدخل والموافقة',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'tiers',
        title: 'المستوى المجاني (Premium محجوز)',
        body:
          'المنتج يعمل حالياً مجانياً فقط. ConsentProvider يثبت tier free؛ meridian:tier محجوز وغير مستخدم وقت التشغيل. Stripe checkout وPremiumGate غير موصولين. الإعلانات تُقيَّد بموافقة الإعلانات وإعداد AdSense — وليس بعلامة premium.',
      },
      {
        id: 'premium-features',
        title: 'ما الذي سيفتحه Premium (غير مُشحون)',
        body:
          'محجوز / غير منفّذ في الواجهة: إخفاء AdSense لمستوى مدفوع وشريط هطول minutely. تفاصيل المدينة اليوم تحمّل نطاقات current وhourly وdaily فقط. لا يوجد مكوّن MinutelyPrecipStrip في التطبيق.',
      },
      {
        id: 'consent-model',
        title: 'نموذج الموافقة',
        body:
          'حقول JSON لـ meridian:consent: essential (دائماً مفعّل) وfunctional (كتابات تخزين الطقس في localStorage ومساعدات GPS) وmarketing (محجوز) وanalytics (محمّل GA4 عند الضبط) وadvertising (AdSense). علامة meridian:cookie-consent القديمة. شريط ملفات تعريف الارتباط: Accept all وAccept functional وEssential only وManage preferences. أعد الفتح عبر الإعدادات العائمة → تبويب Cookies. «Accept all» يفعّل functional + advertising؛ فعّل Google Analytics منفصلاً في التفضيلات إن وُجد.',
      },
      {
        id: 'adsense',
        title: 'Google AdSense (مباشر)',
        body:
          'عند ضبط GOOGLE_ADSENSE_CLIENT_ID ومتغيرات بيئة فتحات الموضع، AdSense مباشر — وليس عناصر نائبة. AdSenseProvider يحمّل السكربت مرة بعد موافقة الإعلانات عند الضبط. GET /api/ads/config يُرجع إعداد السكربت؛ GET /api/ads?placement= يُرجع إعداد كل فتحة. GET /ads.txt يقدّم التحقق من الناشر من env. معرّف العميل يُتحقق منه على الخادم (صيغة ca-pub-…)؛ لا يُرفع إلى git.',
      },
      {
        id: 'placements',
        title: 'مواضع الإعلانات',
        body:
          'مواضع واجهة نشطة مع AdSlot: dashboard (أسفل شبكة المدن) وhero (بطل الصفحة الرئيسية + شريط جانبي للمجلة) وcity-detail (تحت التبويبات). معرّف الموضع recent-checks موجود في constants/env لكن لا AdSlot في الصفحة الرئيسية. متغيرات بيئة الفتحات: GOOGLE_ADSENSE_SLOT_DASHBOARD و_HERO و_RECENT و_CITY_DETAIL و_DEFAULT. بدون معرّفات فتحات، تعرض المواضع عناصر نائبة تجريبية بعلامة تجارية؛ الإعلانات التلقائية قد تعمل من السكربت عند ضبط معرّف العميل.',
      },
      {
        id: 'adslot-states',
        title: 'حالات واجهة AdSlot',
        body:
          'افتراضي (AdSense غير مضبوط / بلا موافقة إعلانات): عناصر نائبة PNG بعلامة تجارية تحت public/ads/ (لافتة ومربع). نص التراكب لقارئ الشاشة فقط (sr-only) وليس مرسوماً على الصورة. GET /api/ads/placeholder-bg قد يقدّم بحث بطل لأسطح أخرى. مضبوط + موافقة — وحدة ins.adsbygoogle بعد جاهزية السكربت.',
      },
      {
        id: 'analytics',
        title: 'التحليلات',
        body:
          'SiteAnalyticsBeacon من الطرف الأول يرسل مسار الصفحة / التفاعل إلى POST /api/analytics/collect في site_analytics_events عندما consent.analytics مفعّل (نقطة collect تتحقق أيضاً من علامة الموافقة في جسم الطلب). أحداث عرض فتحة الإعلان تتطلب consent.advertising أيضاً. GA4 اختياري (AnalyticsProvider) يُحمَّل فقط عند ضبط NEXT_PUBLIC_GA_MEASUREMENT_ID وconsent.analytics مفعّل. «Accept all» في شريط ملفات تعريف الارتباط لا يفعّل التحليلات — فعّلها في Settings → Cookies.',
      },
      {
        id: 'stripe',
        title: 'Stripe (مخطط)',
        body:
          'Premium / Stripe checkout غير منفّذ. أي فوترة مستقبلية تحتاج فرض مستوى على الخادم؛ لا تعامل meridian:tier كمفعّل.',
      },
      {
        id: 'data',
        title: 'ترخيص البيانات',
        body:
          'meridian لا يبيع ولا يُرخّص بيانات المستخدم. التحليلات من الطرف الأول وGA4 الاختياري لتشغيل المنتج. أي منتج B2B أو تحليلات مجهولة مستقبلي يتطلب موافقة وسياسات منفصلة.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'حدود API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'quota',
        title: 'الحصة اليومية وفي الدقيقة',
        body:
          'الافتراضيات من constants/weather.js: DAILY_LIMIT 1000 وWARNING_THRESHOLD 800 وSOFT_BLOCK_THRESHOLD 950 وPER_MINUTE_LIMIT 60 استدعاء علوي لكل دقيقة متحركة. platform_settings يمكنه تجاوز daily_limit وsoft_block_threshold وwarning_threshold وper_minute_limit (يُبذر افتراضياً عند أول فتح لقاعدة البيانات). العداد يُعاد عند منتصف الليل UTC.',
      },
      {
        id: 'status',
        title: 'قيم الحالة',
        body:
          'ok — دون عتبة التحذير. warning — عند أو فوق warning_threshold (افتراضي 800 استدعاء اليوم). soft_block — عند أو فوق soft_block_threshold (افتراضي 950)؛ المصدر العلوي محجوب. hard_block — عند daily_limit (افتراضي 1000). حد الدقيقة يحجب المصدر العلوي أيضاً عند حدوث per_minute_limit استدعاء في آخر 60 ثانية.',
      },
      {
        id: 'cache-hits',
        title: 'إصابات التخزين مقابل المصدر العلوي',
        body:
          'إصابات L2 في قاعدة البيانات تُسجَّل في api_call_log بـ cache_hit=1 ولا تزيد العداد اليومي العلوي. إصابات L1 في الذاكرة لا تُسجَّل في SQLite — recordCacheHit يعود مبكراً عندما meta.layer هو memory. فقط استدعاءات OpenWeather العلوية الناجحة (status 200 وcache_hit=0) تُحسب للحصة. التقديم stale emergency يتجنب المصدر العلوي عند الحجب.',
      },
      {
        id: 'admin-shortcut',
        title: 'تشخيصات الإدارة',
        body:
          'افتح /admin (بعد تسجيل الدخول) لاستخدام اليوم / الحد اليومي والمتبقي والحالة وإعدادات فترة التحديث. API: GET /api/admin/usage.',
      },
      {
        id: 'admin-api',
        title: 'API الإدارة',
        body:
          'GET /api/admin/usage — لقطة حصة واستدعاءات حديثة. GET|PATCH /api/admin/config — API إعدادات الإدارة الرئيسية (فترة التحديث والموصلات وافتراضيات الملخص وAdSense ومفاتيح التنبيه وغيرها). legacy ضيق: PATCH /api/admin/settings { refreshIntervalMs }. المصادقة: ملف تعريف ارتباط جلسة HttpOnly meridian_admin_session بعد /login. سر التوقيع ADMIN_SECRET (وليس ADMIN_PASSWORD). تجاوز التطوير عند NODE_ENV=development وALLOW_DEV_ADMIN_BYPASS=1 وADMIN_SECRET غير مضبوط.',
      },
      {
        id: 'openweather',
        title: 'حدود مزود OpenWeather',
        body:
          'meridian يتتبع عداده العلوي؛ OpenWeather قد يحد المعدل أو يرفض المفاتيح بشكل مستقل (401 و429). المنظم يحوّلها إلى أخطاء API منظمة للعميل.',
      },
      {
        id: 'emergency',
        title: 'وضع الطوارئ',
        body:
          'عند soft/hard block، يرى المستخدمون آخر لقطة SQLite مقبولة بعلامة freshness emergency بدلاً من خطأ فارغ — ما لم لم توجد لقطة أبداً لتلك الإحداثيات.',
      },
    ],
  },
  {
    slug: 'api-reference',
    title: 'مرجع API',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'نظرة عامة',
        body:
          'كل مسارات API هي معالجات Next.js App Router تحت src/app/api/. Weather وgeocode يتطلبان OPENWEATHER_API_KEY. مسارات cron تتطلب Authorization: Bearer CRON_SECRET. مسارات الإدارة تتطلب ملف تعريف ارتباط جلسة إدارة مصادق (meridian_admin_session) بعد /login، ما لم يُطبَّق تجاوز التطوير.',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query: lat وlon وscope (current|hourly|daily|minutely) وtrigger اختياري وlang. يُرجع حمولة طقس مع fetchedAt وcacheHit وfreshness وsource وtrigger وtokensUsed. رأس X-Cache يعكس طبقة التخزين. أخطاء: 400 معاملات غير صالحة و404 location not found و429 rate_limited و502 upstream_error أو service_unavailable.',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body: { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. يُرجع { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. النطاقات لكل مدينة وليست مصفوفة عليا. محدود بـ 20 طلباً/دقيقة لكل IP. يستخدمه خطافات اللوحة وتفاصيل المدينة.',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query: lat وlon وfrom وto اختياريان (تواريخ ISO) وlimit. يُرجع { summary, observations, forecasts: { hourly, daily } } من جداول weather_observations وweather_forecast_archive.',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query: q (حد أدنى حرفان) ومعاملات context اختيارية. يُرجع مصفوفة منظمة: name وcountry وstate وlat وlon وlabel. حد علوي 5 نتائج. مُخزَّن في L2 بنطاق geocode. محدود بـ 60 طلباً/دقيقة لكل IP.',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'بلا معاملات. يُرجع { checks, source } حيث source هو popular عند وجود صفوف مُحفَّزة بالبحث أو empty عند عدمها. الحد الافتراضي 20 من location_weather_checks مرتبة بحجم البحث (محفّزات search_select وsearch_preview). بلا showcase fallback.',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — قائمة اشتراكات نشطة للعميل. POST — إنشاء { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — تحديث alertPrefs على صف city_alerts { clientId, id, alertPrefs }. DELETE — body { clientId, cityLat, cityLon, types[] }. Types: newsletter وcity_weekly وcity_alerts.',
      },
      {
        id: 'unsubscribe',
        title: 'GET /api/unsubscribe',
        body:
          'Query: token (unsubscribe_token UUID). يعطّل الاشتراك ويُرجع تأكيد HTML.',
      },
      {
        id: 'alerts',
        title: 'GET /api/alerts/[alertId]',
        body:
          'يُرجع تنبيهاً منظماً: id وsenderName وevent وstart وend وdescription. من نطاق alert المخزّن.',
      },
      {
        id: 'cron',
        title: 'مسارات cron',
        body:
          'GET /api/cron/weekly-digests — إرسال رسائل ملخص أسبوعي مجمّعة ببريد المشترك. GET /api/cron/weather-alerts — تقييم alertPrefs مقابل خلاصات OpenWeather وOpen-Meteo وNWS وإرسال رسائل تنبيه. كلاهما يتطلب Bearer CRON_SECRET.',
      },
      {
        id: 'admin',
        title: 'مسارات الإدارة',
        body:
          'الاستخدام والإعداد: GET /api/admin/usage؛ GET|PATCH /api/admin/config؛ legacy PATCH /api/admin/settings { refreshIntervalMs }. المستخدمون والمصادقة: GET|POST /api/admin/users؛ POST /api/admin/users/invite؛ GET /api/admin/me. البيانات: GET /api/admin/checks؛ GET /api/admin/locations؛ GET|PATCH /api/admin/subscriptions؛ GET /api/admin/mailing-summary؛ GET /api/admin/analytics. الموصلات: GET|PATCH /api/admin/connections؛ GET|PATCH /api/admin/openweather-key؛ GET|PATCH /api/admin/email-key. CMS البريد: GET|POST|PATCH /api/admin/email-templates؛ POST /api/admin/email/test و/compose و/sync. AdSense: GET /api/admin/adsense/report؛ POST /api/admin/adsense/sync؛ OAuth GET /api/admin/adsense/oauth/start و/callback و/disconnect. CMS: GET|PATCH /api/admin/cms-pages. الكل يتطلب meridian_admin_session ما لم يُطبَّق تجاوز التطوير.',
      },
      {
        id: 'ads',
        title: 'مسارات الإعلانات',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — إعداد موضع مع slotId عند الضبط. GET /api/ads/placeholder-bg — بحث بطل لأسطح العناصر النائبة. مسار التطبيق GET /ads.txt — سطر ناشر AdSense من env. مواضع AdSlot النشطة: dashboard وhero وcity-detail. بيئة فتحة recent-checks موجودة لكن الصفحة الرئيسية بلا AdSlot.',
      },
      {
        id: 'other',
        title: 'مسارات عامة أخرى',
        body:
          'GET /api/platform/limits — لقطة حصة عامة. POST /api/analytics/collect — منارة تحليلات من الطرف الأول. GET /api/location/region — مساعد IP/منطقة. POST /api/weather/inaccurate-report — الإبلاغ عن بيانات خاطئة. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — بلاطات تراكب بطل OSM. المصادقة: POST /api/auth/login و/logout؛ POST /api/auth/forgot-password؛ POST /api/auth/reset-password/[token]؛ GET|POST /api/auth/invite/[token]؛ GET /api/auth/session.',
      },
      {
        id: 'errors',
        title: 'شكل الخطأ',
        body:
          'أخطاء JSON عادة { error: code, message: string }. رموز ApiError تشمل invalid_request وservice_unavailable وlocation_not_found وrate_limited وupstream_error وunauthorized وnot_found وlimit_reached.',
      },
    ],
  },
  {
    slug: 'weather-icons',
    title: 'أيقونات الطقس',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'source',
        title: 'مجموعة الأيقونات',
        body:
          'meridian يستخدم Meteocons (MIT، Bas Milius) SVG ثابتة بأسلوب تعبئة بدلاً من PNG من CDN OpenWeather. الأيقونات في public/weather-icons/ وتُنسخ من @meteocons/svg-static عند npm install (postinstall) أو عبر npm run copy:icons. الإسناد في public/weather-icons/ATTRIBUTION.txt.',
      },
      {
        id: 'inventory',
        title: 'الأيقونات المُشحونة',
        body:
          'scripts/copy-weather-icons.mjs ينسخ 35 SVG فريدة: 17 أيقونة حالة OpenWeather وبلاطات مقاييس/تفاصيل (thermometer وhumidity وbarometer وwind وUV وraindrop وsnowflake وcompass وstarry-night وtime-afternoon ومتغيرات ذات صلة). عد الملفات تحت public/weather-icons/*.svg بعد copy:icons.',
      },
      {
        id: 'mapping',
        title: 'تعيين رموز OpenWeather',
        body:
          'رموز أيقونات OpenWeather (مثل 01d و10n) تُعيَّن لأسماء Meteocon في src/features/weather/utils/weather-icon.js: 01d→clear-day و01n→clear-night و02d→partly-cloudy-day و02n→partly-cloudy-night و03d/03n→cloudy و04d→overcast-day و04n→overcast-night و09d→overcast-day-rain و09n→overcast-night-rain و10d→partly-cloudy-day-rain و10n→partly-cloudy-night-rain و11d→thunderstorms-day و11n→thunderstorms-night و13d→overcast-day-snow و13n→overcast-night-snow و50d→fog-day و50n→fog-night. الرموز غير المعروفة تتراجع إلى cloudy. METRIC_METEOCON يعيّن مفاتيح بلاطات التفاصيل لأيقونات إضافية.',
      },
      {
        id: 'component',
        title: 'مكوّن WeatherIcon',
        body:
          'src/features/weather/components/WeatherIcon.jsx يغلّف getWeatherIconPath(icon) لـ /weather-icons/{name}.svg محلي. يُستخدم في بطاقات الطقس وrecent checks وشرائط التنبؤ ومخطط الساعات وصفوف الأيام وبلاطات مقاييس تفاصيل المدينة. نص alt يستخدم وصف الطقس عند التوفير.',
      },
      {
        id: 'maintenance',
        title: 'إضافة أو تحديث الأيقونات',
        body:
          'حرّر OPENWEATHER_TO_METEOCON / METRIC_METEOCON في weather-icon.js وICON_NAMES في scripts/copy-weather-icons.mjs، ثم npm run copy:icons. اختبارات Vitest في weather-icon.test.js تتحقق من التعيين.',
      },
      {
        id: 'accessibility',
        title: 'إمكانية الوصول',
        body:
          'الأيقونات مكملات زخرفية للنص الوصفي (مثل «Clear sky»). WeatherIcon يضبط alt من خاصية description؛ alt فارغ عند الاستخدام مع نص حالة مرئي فقط.',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'النشر والبيئة',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'env-required',
        title: 'البيئة المطلوبة',
        body:
          'OPENWEATHER_API_KEY — مطلوب لـ weather وgeocode. DATABASE_PATH — ملف SQLite (افتراضي ./data/meridian.db)؛ يجب أن يكون حجمًا دائمًا في الإنتاج ليبقى التخزين والاشتراكات بعد إعادة التشغيل.',
      },
      {
        id: 'env-hero',
        title: 'بيئة صورة البطل',
        body:
          'UNSPLASH_ACCESS_KEY — اختياري؛ أول مزود صور لأبطال المواقع (خادم فقط، مُخزَّن في hero_image_cache). PEXELS_API_KEY — مزود ثالث اختياري بعد Unsplash وWikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — اضبط 0 لتعطيل ترويسة الخريطة الفضائية (مفعّل افتراضياً). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — اختيار Google Street View عند إيقاف OSM. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — مفتاح Maps Embed API اختياري لإطارات Street View.',
      },
      {
        id: 'env-email',
        title: 'بيئة البريد',
        body:
          'متعدد ESP عبر الموصل النشط في platform_settings (منتقي الإدارة): Resend (RESEND_API_KEY وRESEND_FROM_EMAIL) وSendGrid (SENDGRID_API_KEY وSENDGRID_FROM_EMAIL) وAmazon SES (AWS_ACCESS_KEY_ID وAWS_SECRET_ACCESS_KEY وAWS_SES_REGION وAWS_SES_FROM_EMAIL) أو SMTP (SMTP_HOST وSMTP_PORT وSMTP_USER وSMTP_PASSWORD وSMTP_FROM_EMAIL وSMTP_SECURE). NEXT_PUBLIC_APP_URL — عنوان URL أساسي لروابط إلغاء الاشتراك في البريد (مدرج في .env.example؛ مطلوب في الإنتاج).',
      },
      {
        id: 'env-cron',
        title: 'Cron والإدارة',
        body:
          'CRON_SECRET — Bearer لـ /api/cron/* (مرفوض عند عدم الضبط في الإنتاج). ADMIN_SECRET — يوقّع ملف تعريف ارتباط جلسة الإدارة ويشفّر أسرار الموصلات. ADMIN_PASSWORD — تسجيل دخول جذر لـ ADMIN_EMAIL فقط. تجاوز التطوير فقط عند NODE_ENV=development وALLOW_DEV_ADMIN_BYPASS=1 وADMIN_SECRET غير مضبوط. انظر docs/SECURITY.md. جدولة cron خارجياً: weekly-digests (مثلاً صباح الاثنين) وweather-alerts (مثلاً كل 15–30 دقيقة).',
      },
      {
        id: 'env-adsense',
        title: 'بيئة AdSense',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD وSLOT_HERO وSLOT_RECENT وSLOT_CITY_DETAIL وSLOT_DEFAULT — معرّفات وحدات العرض. OAuth لـ AdSense Management API: GOOGLE_ADSENSE_OAUTH_CLIENT_ID وGOOGLE_ADSENSE_OAUTH_CLIENT_SECRET وGOOGLE_ADSENSE_OAUTH_REDIRECT_URI اختياري (افتراضي ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). أبقِ معرّف العميل في أسرار المضيف فقط. /ads.txt يُولَّد وقت التشغيل من معرّف العميل.',
      },
      {
        id: 'env-analytics',
        title: 'بيئة التحليلات',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — محمّل GA4 اختياري عندما consent.analytics مفعّل. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — وسم meta لـ Search Console.',
      },
      {
        id: 'scripts',
        title: 'سكربتات npm',
        body:
          'dev وbuild وstart — Next.js. lint وtest وtest:watch وverify — بوابة الجودة (verify = lint + test + build). copy:icons — Meteocons إلى public (أيضاً postinstall). seed:checks — لقطات عرض شمال إنجلترا. backfill:city-slugs — ملء city_slug للمواقع الموجودة. email — خادم معاينة React Email. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'جداول SQLite',
        body:
          'الطقس الأساسي: weather_snapshots وapi_call_log. المواقع والفحوص: locations وlocation_weather_checks وweather_observations وweather_forecast_archive. الاشتراكات: subscriptions وsubscription_send_log. المنصة: platform_settings (مفرد). الأبطال: hero_image_cache. تحقيق الدخل: adsense_report_snapshots. التحليلات: site_analytics_events. البريد/CMS: email_templates وcms_pages. الإدارة: admin_users وadmin_invites وadmin_password_resets وadmin_audit_log. المخطط في src/lib/db/index.js. الفتح الأول يبذر platform_settings بتحديث 1h وstale 2h وحد يومي 1000 وsoft block 950 وwarning 800 و60 في الدقيقة.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js يعيد كتابة مضيف docs.localhost إلى /docs لنطاق فرعي للوثائق محلياً. بلا middleware مصادقة على مسارات التطبيق الرئيسية.',
      },
      {
        id: 'localstorage-keys',
        title: 'مفاتيح تخزين المتصفح',
        body:
          'من storage-keys.js: meridian:client-id وmeridian:saved-cities وmeridian:checked-cities وmeridian:user-location وmeridian:weather-cache وmeridian:theme وmeridian:cookie-consent وmeridian:subscriptions وmeridian:tier (محجوز) وmeridian:consent وmeridian:accessibility وmeridian:city-detail-accordion وmeridian:temperature-unit وmeridian:preferred-locale وmeridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — معرّف جلسة تحليلات من الطرف الأول. ملف تعريف ارتباط الإدارة meridian_admin_session (HttpOnly، يضبطه الخادم). حدث مخصص meridian:storage يزامن الخطافات بعد الكتابة.',
      },
    ],
  },
];
