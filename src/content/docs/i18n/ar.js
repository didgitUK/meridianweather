/** Arabic documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'البدء',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'ما هو meridian',
        body:
          'meridian لوحة طقس لعدة أماكن في آنٍ واحد. ابحث عن مدينة، افتح صفحتها، ثبّتها في مواقعك، وتابع الحرارة والأحوال والتوقعات القصيرة. لا تحتاج حسابًا. مدنك المثبتة ومعظم التفضيلات تبقى على هذا الجهاز.',
      },
      {
        id: 'add-city',
        title: 'كيفية تثبيت مدينة',
        body:
          '1. اكتب حرفين على الأقل في حقل البحث في الصفحة الرئيسية أو في الترويسة. تظهر النتائج بعد توقف قصير.\n2. اختر مكانًا من القائمة — يفتح ذلك صفحة المدينة.\n3. اضغط تثبيت في مواقعك لحفظها. يمكنك إلغاء التثبيت لاحقًا من نفس القائمة أو إزالة المدينة من شبكة الصفحة الرئيسية.\n\nالأماكن المثبتة تظهر تحت مواقعك في الصفحة الرئيسية. يمكنك تثبيت حتى عشر. عناوين صفحات المدن تبدو مثل /city/london-GB-51.5073.',
      },
      {
        id: 'city-limit',
        title: 'حد عشر مدن',
        body:
          'يمكن لمواقعك أن تحتوي على حتى عشر مدن مثبتة. إذا وصلت للحد، أزل مدينة قبل تثبيت أخرى.',
      },
      {
        id: 'first-visit',
        title: 'ملفات تعريف الارتباط والإعلانات والسمة',
        body:
          'في الزيارة الأولى، يطلب شريط كيف تريد عمل التخزين والإعلان:\n\n• قبول الكل — ميزات مفيدة مع إعلانات\n• قبول الوظيفي — ميزات مفيدة بدون إعلانات\n• الأساسي فقط — ما يلزم لعمل الموقع\n• إدارة التفضيلات — اختيار الفئات بنفسك\n\n«قبول الكل» لا يفعّل Google Analytics ولا تحليل الاستخدام الاختياري لدينا — فعّل Analytics بشكل منفصل في التفضيلات إن وُجد.\n\nيمكنك إعادة فتح تفضيلات ملفات تعريف الارتباط من عنصر الإعدادات العائم (ترس). قد يختفي هذا العنصر عند التمرير لأسفل، وقد يُخفى عندما يطلب جهازك تقليل الحركة. السمة (فاتح / داكن) لها عنصر تحكم عائم خاص.',
      },
      {
        id: 'navigation',
        title: 'إلى أين بعد ذلك',
        body:
          'لوحة التحكم تشرح الصفحة الرئيسية. تفاصيل المدينة تغطي تبويبات التوقعات. الاشتراكات تغطي ملخصات البريد والتنبيهات. تحقيق الدخل والموافقة يشرح الإعلانات وخيارات الخصوصية. الصفحات اللاحقة (التوقعات والتخزين المؤقت، مرجع API، النشر) موجهة أساسًا لمن يشغّلون الموقع.',
      },
      {
        id: 'operators',
        title: 'لمشغّلي الموقع',
        body:
          'الطقس المباشر يحتاج OPENWEATHER_API_KEY على الخادم. البريد ومهام cron وAdSense اختيارية. SQLite (better-sqlite3) يخزّن الذاكرة المؤقتة المشتركة وحدود الاستخدام. نفّذ npm run verify للفحص والاختبار والبناء. الإدارة: سجّل الدخول في /login ثم افتح /admin. تجاوز التطوير فقط عند NODE_ENV=development وALLOW_DEV_ADMIN_BYPASS=1 وADMIN_SECRET غير مضبوط. قد تختلف الوثائق المحررة عبر CMS حتى إعادة التعيين لقيم الملفات. نطاق docs المحلي: docs.localhost:3000.',
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
        title: 'ما تراه في الصفحة الرئيسية',
        body:
          'من الأعلى إلى الأسفل:\n\n1. البطل — نص ترحيب، بحث، وفحص سريع لطقس موقعك.\n2. مواقعك — بطاقات طقس للأماكن المثبتة.\n3. القريب والشائع — عمودان: بالقرب منك والبحث الشائع.\n4. إعلان تحت مواقعك (عنصر نائب أو AdSense).\n5. Journal — دوّار مقالات.\n\nأخفِ الإعلان وJournal باستخدام NEXT_PUBLIC_SHOW_HOME_STRETCH=0.',
      },
      {
        id: 'cards',
        title: 'بطاقات مواقعك',
        body:
          'كل بطاقة تعرض اسم المكان والحرارة والحالة وأيقونة الطقس والإحساس بالحرارة والرطوبة والرياح. اضغط بطاقة لفتح صفحة المدينة الكاملة. أثناء التحميل ترى عنصرًا نائبًا؛ عند الفشل يتوفر إعادة المحاولة وإزالة.',
      },
      {
        id: 'forecast-strip',
        title: 'شريط سبعة أيام',
        body:
          'تحت القراءة الرئيسية، كل بطاقة تعرض نظرة لسبعة أيام (اسم اليوم، أيقونة، أعلى وأسفل). الأحوال الحالية وهذه النظرة تُحمّل معًا فلا تنتظر خطوة ثانية.',
      },
      {
        id: 'card-actions',
        title: 'الاشتراك والإزالة',
        body:
          'الاشتراك يفتح خيارات البريد لملخص أسبوعي وتنبيهات طقس لهذه المدينة. الإزالة تخرج المدينة من مواقعك وتمحو طقسها المحفوظ على هذا الجهاز. إن بقيت تنبيهات بريد لهذه المدينة، يُسأل عما إذا كنت تريد إلغاءها أيضًا.',
      },
      {
        id: 'states',
        title: 'لوحة فارغة',
        body:
          'بدون مدن مثبتة، الشبكة تشرح كيف تبحث وتثبّت أول مكان من صفحة المدينة.',
      },
      {
        id: 'refresh',
        title: 'متى تُحدَّث القراءات',
        body:
          'افتراضيًا، مواقعك تفضّل آخر قراءة محفوظة على هذا الجهاز. اضغط تحديث على بطاقة لقراءة جديدة (المدن الجديدة بلا قراءة محفوظة تُجلب تلقائيًا أيضًا). لا يوجد مفتاح إعدادات → الطقس في الواجهة الحالية.',
      },
      {
        id: 'recent-checks',
        title: 'بالقرب منك والبحث الشائع',
        body:
          'بالقرب منك — أماكن حول منزلك أو منطقتك بأحوال حالية. هذه ليست «عمليات بحثك السابقة».\n\nالبحث الشائع — أماكن بحث عنها كثيرون على هذا الموقع، حتى خمس بطاقات. في تثبيت هادئ أو جديد قد ترى مدنًا تجريبية حتى يتراكم نشاط بحث حقيقي.\n\nالبطاقات تربط بصفحة المدينة عند توفر الإحداثيات. راجع القريب والشائع لمزيد من التفاصيل.',
      },
      {
        id: 'operators',
        title: 'لمشغّلي الموقع',
        body:
          'Home stretch (AdSlot لوحة التحكم + Journal): NEXT_PUBLIC_SHOW_HOME_STRETCH=0 (default on; set 0 to hide). مدن البحث الشائع التجريبية عندما لا توجد صفوف في API: SHOW_DEMO_POPULAR_SEARCHES (مفعّل افتراضيًا؛ NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 للتعطيل). API البحث الشائع: GET /api/recent-checks (limit 20، source popular|empty). بالقرب منك لا يستخدم هذا API. سكربت seed npm run seed:checks يملأ weather_snapshots فقط — لا يملأ البحث الشائع.',
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
        title: 'فتح صفحة مدينة',
        body:
          'نتائج البحث وبطاقات الصفحة الرئيسية تفتح صفحة لذلك المكان. لا تحتاج تثبيت مدينة لعرضها. التثبيت يضيفها فقط إلى مواقعك في الصفحة الرئيسية. بعض مدن العرض والأماكن المعروفة للموقع تفتح دائمًا؛ العناوين غير المعروفة تعرض حالة فارغة مفيدة أو 404.',
      },
      {
        id: 'tabs',
        title: 'تبويبات التوقعات',
        body:
          'استخدم التبويبات للتنقل بين:\n\n• اليوم — الأحوال الحالية وحقائق سريعة\n• كل ساعة — الساعات القادمة\n• 10 أيام — نظرة أطول\n• السجل — أيام سابقة عندما نخزنها\n\nيمكنك مشاركة رابط يفتح تبويبًا (مثلًا ?tab=hourly). قد تظهر حتى ثلاثة لافتات تنبيه طقس فوق الصفحة عند وجود تنبيهات. قد توجد وحدة إعلانية تحت التبويبات.',
      },
      {
        id: 'header',
        title: 'خريطة أو صورة في الأعلى',
        body:
          'افتراضيًا، الترويسة تعرض خريطة أقمار صناعية للمنطقة. يمكن للمشغّلين التبديل لصور الموقع (من مزودي صور عند التوفر، وإلا صورة علامة بسيطة). Street View الاختياري إعداد للمشغّل عند إيقاف خلفية الخريطة.',
      },
      {
        id: 'today',
        title: 'اليوم',
        body:
          'الحرارة والحالة الحالية، بلاطات مقاييس (رطوبة، رياح، وما شابه)، وأقسام قابلة للتوسيع لمزيد من التفاصيل. معاينة ساعية قصيرة لبقية اليوم عند التوفر.',
      },
      {
        id: 'hourly',
        title: 'كل ساعة',
        body:
          'الاثنتا عشرة ساعة القادمة: الحرارة، احتمال المطر، والرياح بنظرة سريعة.',
      },
      {
        id: 'daily',
        title: '10 أيام',
        body:
          'حتى عشرة أيام بأعلى/أسفل وأحوال واحتمال مطر ورياح وأشعة UV. اختر يومًا لتركيز الرسم البياني.',
      },
      {
        id: 'history',
        title: 'السجل',
        body:
          'أيام سابقة من ملاحظات مخزنة عند التوفر، مع منتقي يوم ورسم بياني.',
      },
      {
        id: 'subscribe',
        title: 'التثبيت والبريد',
        body:
          'قائمة الخيارات تتيح تثبيت في مواقعك أو الاشتراك لملخص أسبوعي وتنبيهات طقس لهذا المكان.',
      },
      {
        id: 'operators',
        title: 'لمشغّلي الموقع',
        body:
          'resolveCity() يخدم دائمًا خمس PLATFORM_SHOWCASE_CITIES (London، Dubai، New York، Tokyo، Sydney) مع صفوف city_slug. البطل الافتراضي: OSM عند isCityHeroOsmEnabled() (NEXT_PUBLIC_CITY_HERO_OSM غير مضبوط أو ليس "0")؛ صور عند إيقاف OSM (Unsplash → Wikimedia → Pexels). Opt-in Street View: NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 مع مفتاح Maps. دفعة العميل: current وhourly وdaily فقط — لا واجهة minutely. السجل: GET /api/weather/history. أول فحص current ناجح قد يجعل المدينة قابلة للفهرسة لخريطة الموقع/SEO.',
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
        title: 'تحديثات البريد (اختياري)',
        body:
          'يمكنك طلب أن يرسل لك meridian بريدًا — دون تسجيل دخول. اختر نشرة عن المنتج، ملخصًا أسبوعيًا لمدينة مثبتة، و/أو تنبيهات طقس عندما تطابق الأحوال ما يهمك. الكل اختياري؛ كل بريد يتضمن طريقة للإيقاف.',
      },
      {
        id: 'types',
        title: 'ما يمكنك الاشتراك فيه',
        body:
          '• النشرة — تحديثات المنتج (عادة من نموذج التذييل).\n• الملخص الأسبوعي — ملخص منتظم لمدينة تتابعها.\n• تنبيهات الطقس — بريد عند تفعيل أنواع التنبيه المختارة لمدينة (مطر، رياح، ثلج، تحذيرات رسمية، وغيرها).\n\nيمكنك إدارتها من اشتراك على بطاقة طقس أو قائمة خيارات صفحة المدينة.',
      },
      {
        id: 'subscribe-ui',
        title: 'كيفية الاشتراك',
        body:
          'أدخل بريدك، اختر الملخص الأسبوعي و/أو التنبيهات، وحدد أنواع التنبيه (أو فعّل الكل). يمكنك تغيير أنواع التنبيه لاحقًا. عنوان بريد واحد يمكنه متابعة حتى عشرين موقعًا في ملخصات أسبوعية. إن كنت مشتركًا بالفعل، قد يقول الزر مشترك أو إدارة.',
      },
      {
        id: 'unsubscribe',
        title: 'كيفية إيقاف البريد',
        body:
          'استخدم رابط إلغاء الاشتراك في أي بريد اشتراك. إزالة مدينة من مواقعك قد تسأل أيضًا عما إذا كنت تريد إلغاء بريد تلك المدينة.',
      },
      {
        id: 'operators',
        title: 'لمشغّلي الموقع',
        body:
          'meridian:client-id المجهول يربط المتصفح باشتراكات SQLite. API: GET/POST/DELETE/PATCH /api/subscriptions (PATCH يحدّث alertPrefs). التسليم عبر الموصل النشط (Resend، SendGrid، SES، أو SMTP). بلا موصل، تُحفظ الصفوف لكن الإرسال يعيد { sent: false }. اضبط NEXT_PUBLIC_APP_URL لروابط إلغاء الاشتراك. Crons: GET /api/cron/weekly-digests و/api/cron/weather-alerts مع Bearer CRON_SECRET. التنبيهات تدمج أحوال OpenWeather وتحذيرات Open-Meteo الرسمية وNWS عند التفعيل؛ dedup عبر subscription_send_log. MAX_WEEKLY_DIGEST_LOCATIONS = 20.',
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
        title: 'مجاني للجميع اليوم',
        body:
          'meridian يعمل كموقع طقس مجاني. لا يوجد دفع Premium فعّال ولا خطة مدفوعة تزيل الإعلانات. الإعلانات تظهر فقط إذا سمحت بموافقة الإعلانات وضبط المشغّل Google AdSense.',
      },
      {
        id: 'consent-model',
        title: 'خيارات الخصوصية',
        body:
          'شريط الزيارة الأولى يتيح الاختيار:\n\n• قبول الكل — ميزات مفيدة مع إعلانات\n• قبول الوظيفي — ميزات مفيدة بدون إعلانات\n• الأساسي فقط — ما يلزم لعمل الموقع\n• إدارة التفضيلات — تشغيل الفئات أو إيقافها بنفسك\n\nالفئات المفيدة ببساطة:\n• الوظيفي — تذكر الطقس على هذا الجهاز بين الزيارات؛ مساعدات الموقع الدقيق إن سمحت\n• الإعلانات — إعلانات Google عند الضبط\n• Analytics — قياس استخدام اختياري وGoogle Analytics عند الضبط (لا يُفعّل بـ «قبول الكل»)\n\nغيّر رأيك لاحقًا تحت إعدادات → ملفات تعريف الارتباط عندما يتوفر عنصر الإعدادات العائم (قد يختفي أثناء التمرير وقد يكون غير متاح مع تقليل الحركة).',
      },
      {
        id: 'adsense',
        title: 'إعلانات قد تراها',
        body:
          'عند السماح بالإعلانات وضبط AdSense، قد تظهر إعلانات في بطل الصفحة الرئيسية، تحت مواقعك، تحت تبويبات صفحة المدينة، وبعض تخطيطات Journal. إن لم تُضبط الإعلانات أو رفضت الإعلانات، ترى عنصرًا نائبًا للعلامة بدل إعلان مباشر.',
      },
      {
        id: 'analytics',
        title: 'قياس الاستخدام',
        body:
          'إن فعّلت Analytics، قد يسجل الموقع استخدامًا بسيطًا من الطرف الأول (مثل الصفحات التي شُوهدت) وعند الضبط يحمّل Google Analytics. عدّ ظهور فتحات الإعلانات يحتاج أيضًا موافقة إعلانات. رفض analytics يبقي هذه المحمّلات معطّلة.',
      },
      {
        id: 'data',
        title: 'لا نبيع بياناتك',
        body:
          'meridian لا يبيع بيانات شخصية. أي منتج بيانات مدفوع مستقبلًا يحتاج إشعارًا واضحًا وموافقة جديدة.',
      },
      {
        id: 'operators',
        title: 'لمشغّلي الموقع',
        body:
          'المستوى مثبت مجانيًا؛ meridian:tier غير مستخدم؛ PremiumGate / واجهة minutely غير موصولة. AdSense: GOOGLE_ADSENSE_CLIENT_ID مع GOOGLE_ADSENSE_SLOT_DASHBOARD وGOOGLE_ADSENSE_SLOT_HERO وGOOGLE_ADSENSE_SLOT_RECENT وGOOGLE_ADSENSE_SLOT_CITY_DETAIL وGOOGLE_ADSENSE_SLOT_DEFAULT. AdSlots النشطة: dashboard وhero وcity-detail؛ موضع recent-checks بلا واجهة رئيسية. عناصر نائبة: public/ads/*.png (overlay sr-only). Analytics: SiteAnalyticsBeacon + POST /api/analytics/collect عند consent.analytics؛ GA4 يحتاج NEXT_PUBLIC_GA_MEASUREMENT_ID + نفس الموافقة. Stripe غير منفّذ.',
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
        title: 'ما هي الأيقونات',
        body:
          'صور الطقس على البطاقات والتوقعات هي أيقونات خط/تعبئة واضحة (Meteocons لـ Bas Milius، رخصة MIT). تعرض مشمسًا وغائمًا ومطرًا وثلجًا وضبابًا وما شابه بجانب الوصف المكتوب — النص يحمل المعنى إن فشل تحميل الصورة.',
      },
      {
        id: 'accessibility',
        title: 'إمكانية الوصول',
        body:
          'الأيقونات تدعم الكلمات على الشاشة. عندما يكون وصف الحالة ظاهرًا، تُعامل الصورة كزخرفة؛ وإلا يُقدَّم نص بديل قصير من الوصف.',
      },
      {
        id: 'operators',
        title: 'لمشغّلي الموقع',
        body:
          'الأصول في public/weather-icons/ (حوالي 35 ملف SVG في checkout نموذجي). scripts/copy-weather-icons.mjs ينسخ 32 اسمًا فريدًا من @meteocons/svg-static عند postinstall / npm run copy:icons؛ قد توجد إضافات (مثل sunrise وsunset وhorizon) في المجلد لكنها تُربط عبر أسماء METRIC_METEOCON. الربط: src/features/weather/utils/weather-icon.js (OPENWEATHER_TO_METEOCON). المكوّن: WeatherIcon.jsx. الإسناد: public/weather-icons/ATTRIBUTION.txt. الاختبارات: weather-icon.test.js.',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'القريب والشائع',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'العمودان في الصفحة الرئيسية',
        body:
          'تحت مواقعك، الصفحة الرئيسية تعرض قائمتين قصيرتين من الأماكن.\n\nبالقرب منك — أماكن مقترحة قرب منزلك أو منطقتك بأحوال مباشرة. ليست سجلًا خاصًا بكل ما بحثت عنه.\n\nالبحث الشائع — أماكن يُبحث عنها كثيرًا على هذا الموقع. هذا أيضًا على مستوى الموقع، وليس «سجلك الشخصي».',
      },
      {
        id: 'ui',
        title: 'سلوك البطاقات',
        body:
          'كل عمود يعرض حتى خمس بطاقات بأيقونة وحرارة ووصف واسم المكان. اضغط بطاقة لفتح صفحة المدينة عند توفر الإحداثيات.',
      },
      {
        id: 'demo-empty',
        title: 'عندما يبدو البحث الشائع مزدحمًا في تثبيت جديد',
        body:
          'إن لم يبحث أحد تقريبًا بعد، قد يعرض الموقع مدنًا تجريبية معروفة في البحث الشائع حتى لا يبقى العمود فارغًا. يمكن للمشغّلين إيقاف قائمة التجربة. بالقرب منك يعتمد دائمًا على إشارات الموقع وبيانات الأماكن القريبة.',
      },
      {
        id: 'operators',
        title: 'لمشغّلي الموقع',
        body:
          'بيانات البحث الشائع: GET /api/recent-checks → getRecentChecksPayload() → listPopularSearchChecks على location_weather_checks (triggers search_select / search_preview)، default limit 20، source popular|empty. الـ API نفسه لا يملأ showcase.\n\nالبديل التجريبي للواجهة: عندما يعيد API فارغًا وSHOW_DEMO_POPULAR_SEARCHES true (افتراضي؛ التعطيل بـ NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0)، يُملأ البحث الشائع من PLATFORM_SHOWCASE_CITIES.\n\nبالقرب منك: أماكن قريبة من ملف موقع الصفحة الرئيسية + دفعة طقس current — ليس API recent-checks.\n\nnpm run seed:checks يكتب weather_snapshots لـ North England لعروض ذاكرة L2؛ لا يُدرج صفوف فحص مُشغَّلة بالبحث ولن يملأ البحث الشائع وحده.',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: 'التوقعات والتخزين المؤقت',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'لمن هذه الصفحة',
        body:
          'يمكن للزوار العاديين تخطيها. تشرح كيف يخزّن الموقع ويحدّث بيانات الطقس لمن يشغّلون أو يدمجون meridian. ببساطة: متصفحك يتذكر قراءة حديثة؛ الخادم يتذكر قراءات مشتركة حتى لا نستدعي مزود الطقس عند كل نقرة.',
      },
      {
        id: 'scopes',
        title: 'نطاقات الطقس',
        body:
          'نطاقات يطلبها العميل: current (الآن)، hourly (جدول زمني)، daily (جدول زمني)، minutely (هطول — API فقط؛ تفاصيل المدينة لا تحمّل minutely اليوم). نطاقات الخادم فقط: geocode (ذاكرة بحث مدن مفتاح geocode:{query})، alert (حمولات تنبيه فردية). كل نطاق طقس يستخدم مفتاح ذاكرة {lat},{lon},{scope}؛ geocode بسلسلة الاستعلام.',
      },
      {
        id: 'layers',
        title: 'طبقات الذاكرة المؤقتة',
        body:
          'L0 — localStorage المتصفح meridian:weather-cache، بنية {cityId: {scope: {payload, fetchedAt}}} (الكتابة تحتاج موافقة وظيفية). L1 — Map في الذاكرة على عملية الخادم. L2 — SQLite weather_snapshots مع fetched_at وexpires_at وstale_until. العميل يقرأ L0 ثم يستدعي API؛ الخادم يقرأ L1 ثم L2 ثم upstream OpenWeather.',
      },
      {
        id: 'freshness',
        title: 'حالات الحداثة',
        body:
          'fresh — ضمن expires_at. acceptable — بعد expires لكن ضمن stale_until (قد يُقدَّم). expired — بعد stale_until، يشغّل upstream إن سمحت الحصة. emergency — الحصة محجوبة لكن يُقدَّم snapshot L2 منتهٍ/مقبول حتى يرى المستخدمون بيانات.',
      },
      {
        id: 'ttl-table',
        title: 'TTL الافتراضي (SCOPE_TTL)',
        body:
          'current — fresh 1h، stale 2h (يُستبدل بـ platform_settings.refresh_interval_ms وstale_cache_max_ms؛ الإدارة يمكنها 10m–2h). hourly — fresh 2h، stale 6h. daily — fresh 6h، stale 12h. minutely — fresh 15m، stale 30m. geocode — fresh 7d، stale 30d. alert — fresh 1h، stale 6h.',
      },
      {
        id: 'upstream',
        title: 'تكامل OpenWeather',
        body:
          'الأساسي: One Call API 4.0 (onecall/current، timeline/1h، timeline/1day، timeline/1min). نطاق current يسقط على API 2.5 /weather إن فشل One Call current. Geocode يستخدم OpenWeather geocoding API (limit 5). التطبيع في src/lib/one-call.js ينتج حمولات واجهة متسقة.',
      },
      {
        id: 'batch',
        title: 'الجلب المجمّع',
        body:
          'POST /api/weather/batch يقبل { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. النطاقات لكل مدينة (city.scopes)، وليس مصفوفة scopes عليا. لوحة التحكم تحمّل current + daily معًا في دفعة واحدة (بلا requestIdleCallback). تفاصيل المدينة تجمع current + hourly + daily فقط. المعالج يباعد المدن ~100ms لتجنب حدود المعدل المفاجئة.',
      },
      {
        id: 'headers',
        title: 'بيانات وصف الاستجابة',
        body:
          'استجابات API تتضمن meta: cacheLayer (memory، database، upstream)، freshness، fetchedAt، ageMs، upstreamCallAvoided، source. ترويسة X-Cache تعكس hit/miss حيث ينطبق. «حُدّث منذ X» في الواجهة تستخدم meta.fetchedAt.',
      },
      {
        id: 'quota',
        title: 'تفاعل الحصة',
        body:
          'عند تجاوز الحدود اليومية أو بالدقيقة، تتوقف استدعاءات upstream ويُعاد بيانات L2 emergency stale إن وُجدت. إعادة فتح مدينة ضمن TTL تكلف صفر استدعاء upstream.',
      },
      {
        id: 'logging',
        title: 'تسجيل إصابات الذاكرة',
        body:
          'إصابات ذاكرة قاعدة L2 تُسجّل في api_call_log مع cache_hit=1 ولا تزيد عداد upstream اليومي. إصابات ذاكرة L1 تُقدَّم لكن لا تُحفظ عمدًا في SQLite — تُطلق عند كل إعادة mount SSR/عميل وستُرهق meridian.db تحت file watchers.',
      },
      {
        id: 'payload-fields',
        title: 'حقول حمولة current',
        body:
          'temperature، feelsLike، description، condition، icon (رمز OpenWeather)، humidity، pressure، dewPoint، uvi، clouds، visibility، windSpeedKmh، windGustKmh، windDeg، sunrise، sunset، alertIds، city، country، timezone، updatedAt، source.',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'حدود واجهة برمجة التطبيقات',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'لمن هذه الصفحة',
        body:
          'هذه الصفحة لمشغّلي الموقع. بيانات الطقس المُشاهدة مشتركة وصديقة للذاكرة المؤقتة حتى تُستهلك حدود OpenWeather المجانية (افتراضي 1000 استدعاء/يوم) بشكل أقل.',
      },
      {
        id: 'quota',
        title: 'الحصة اليومية وبالدقيقة',
        body:
          'الافتراضيات من constants/weather.js: DAILY_LIMIT 1000، WARNING_THRESHOLD 800، SOFT_BLOCK_THRESHOLD 950، PER_MINUTE_LIMIT 60 استدعاء upstream لكل دقيقة متحركة. platform_settings يمكنه تجاوز daily_limit وsoft_block_threshold وwarning_threshold وper_minute_limit (يُزرع عند أول فتح DB). العداد يُعاد عند منتصف الليل UTC.',
      },
      {
        id: 'status',
        title: 'قيم الحالة',
        body:
          'ok — تحت عتبة التحذير. warning — عند أو فوق warning_threshold (افتراضي 800 استدعاء اليوم). soft_block — عند أو فوق soft_block_threshold (افتراضي 950)؛ upstream محجوب. hard_block — عند daily_limit (افتراضي 1000). سقف الدقيقة يحجب upstream أيضًا عند per_minute_limit استدعاء في آخر 60 ثانية.',
      },
      {
        id: 'cache-hits',
        title: 'إصابات الذاكرة مقابل upstream',
        body:
          'إصابات قاعدة L2 تُسجّل في api_call_log مع cache_hit=1 ولا تزيد عداد upstream اليومي. إصابات ذاكرة L1 لا تُسجّل في SQLite — recordCacheHit يعود مبكرًا عندما meta.layer هو memory. فقط استدعاءات upstream OpenWeather الناجحة (status 200، cache_hit=0) تُحسب للحصة. تقديم emergency stale يتجنب upstream عند الحجب.',
      },
      {
        id: 'admin-shortcut',
        title: 'تشخيصات الإدارة',
        body:
          'افتح /admin (بعد تسجيل الدخول) للمستخدم اليوم / الحد اليومي والمتبقي والحالة وإعدادات فترة التحديث. API: GET /api/admin/usage.',
      },
      {
        id: 'admin-api',
        title: 'API الإدارة',
        body:
          'GET /api/admin/usage — لقطة حصة واستدعاءات حديثة. GET|PATCH /api/admin/config — API إعدادات الإدارة الرئيسية (فترة التحديث، الموصلات، افتراضيات الملخص، AdSense، مفاتيح التنبيه، إلخ). Legacy ضيق: PATCH /api/admin/settings { refreshIntervalMs }. Auth: cookie جلسة HttpOnly meridian_admin_session بعد /login. سر التوقيع ADMIN_SECRET (ليس ADMIN_PASSWORD). تجاوز dev عند NODE_ENV=development وALLOW_DEV_ADMIN_BYPASS=1 وADMIN_SECRET unset.',
      },
      {
        id: 'openweather',
        title: 'حدود مزود OpenWeather',
        body:
          'meridian يتتبع عداد upstream الخاص؛ OpenWeather قد يحدّ المعدل أو يرفض المفاتيح بشكل مستقل (401، 429). المنظم يحوّلها لأخطاء API منظمة للعميل.',
      },
      {
        id: 'emergency',
        title: 'وضع الطوارئ',
        body:
          'عند soft/hard block، يرى المستخدمون آخر snapshot SQLite مقبولًا مُعلَّمًا freshness emergency بدل خطأ فارغ — ما لم لم يوجد snapshot أبدًا لتلك الإحداثيات.',
      },
    ],
  },
  {
    slug: 'api-reference',
    title: 'مرجع واجهة برمجة التطبيقات',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'نظرة عامة',
        body:
          'هذه الصفحة للمطورين والمشغّلين الذين يدمجون APIs meridian — الزوار العاديون يمكنهم تخطيها. كل مسارات API هي معالجات Next.js App Router تحت src/app/api/. الطقس وgeocode يحتاجان OPENWEATHER_API_KEY. مسارات cron تحتاج Authorization: Bearer CRON_SECRET. مسارات الإدارة تحتاج cookie جلسة إدارة مصادق (meridian_admin_session) بعد /login، ما لم ينطبق ALLOW_DEV_ADMIN_BYPASS في التطوير.',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query: lat، lon، scope (current|hourly|daily|minutely)، trigger اختياري، lang. يعيد حمولة طقس مع fetchedAt وcacheHit وfreshness وsource وtrigger وtokensUsed. ترويسة X-Cache تعكس طبقة الذاكرة. أخطاء: 400 invalid params، 404 location not found، 429 rate_limited، 502 upstream_error أو service_unavailable.',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body: { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }. يعيد { cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] }. النطاقات لكل مدينة، وليس مصفوفة عليا. محدود بـ 20 طلب/دقيقة لكل IP. يستخدمه hooks لوحة التحكم وتفاصيل المدينة.',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query: lat، lon، from وto اختياريان (تواريخ ISO)، limit. يعيد { summary, observations, forecasts: { hourly, daily } } من weather_observations وweather_forecast_archive.',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query: q (حد أدنى حرفان)، معاملات context اختيارية. يعيد مصفوفة منظمة: name، country، state، lat، lon، label. حد upstream 5 نتائج. مخزّن في L2 بنطاق geocode. محدود بـ 60 طلب/دقيقة لكل IP.',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'بلا معاملات. يعيد { checks, source } حيث source هو popular عند وجود صفوف مُشغَّلة بالبحث، أو empty عند عدم وجودها. حد افتراضي 20 من location_weather_checks مرتبة بحجم البحث (triggers search_select وsearch_preview). الـ API بلا بديل showcase — واجهة الصفحة الرئيسية قد تعرض مدنًا شائعة تجريبية عند الفراغ إن كان SHOW_DEMO_POPULAR_SEARCHES مفعّلًا. عمود بالقرب منك لا يستخدم هذا المسار.',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — قائمة اشتراكات نشطة للعميل. POST — إنشاء { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }. PATCH — تحديث alertPrefs على صف city_alerts { clientId, id, alertPrefs }. DELETE — body { clientId, cityLat, cityLon, types[] }. الأنواع: newsletter، city_weekly، city_alerts.',
      },
      {
        id: 'unsubscribe',
        title: 'GET /api/unsubscribe',
        body:
          'Query: token (unsubscribe_token UUID). يعطّل الاشتراك ويعيد تأكيد HTML.',
      },
      {
        id: 'alerts',
        title: 'GET /api/alerts/[alertId]',
        body:
          'يعيد تنبيهًا منظمًا: id، senderName، event، start، end، description. المصدر: نطاق alert المخزّن.',
      },
      {
        id: 'cron',
        title: 'مسارات cron',
        body:
          'GET /api/cron/weekly-digests — إرسال رسائل الملخص الأسبوعي مجمّعة حسب بريد المشترك. GET /api/cron/weather-alerts — تقييم alertPrefs مقابل OpenWeather وOpen-Meteo وموجزات NWS وإرسال رسائل التنبيه. كلاهما يحتاج Bearer CRON_SECRET.',
      },
      {
        id: 'admin',
        title: 'مسارات الإدارة',
        body:
          'الاستخدام والإعداد: GET /api/admin/usage؛ GET|PATCH /api/admin/config؛ legacy PATCH /api/admin/settings { refreshIntervalMs }. المستخدمون والمصادقة: GET|POST /api/admin/users؛ POST /api/admin/users/invite؛ GET /api/admin/me. البيانات: GET /api/admin/checks؛ GET /api/admin/locations؛ GET|PATCH /api/admin/subscriptions؛ GET /api/admin/mailing-summary؛ GET /api/admin/analytics. الموصلات: GET|PATCH /api/admin/connections؛ GET|PATCH /api/admin/openweather-key؛ GET|PATCH /api/admin/email-key. CMS البريد: GET|POST|PATCH /api/admin/email-templates؛ POST /api/admin/email/test، /compose، /sync. AdSense: GET /api/admin/adsense/report؛ POST /api/admin/adsense/sync؛ OAuth GET /api/admin/adsense/oauth/start، /callback، /disconnect. CMS: GET|PATCH /api/admin/cms-pages. الكل يحتاج meridian_admin_session ما لم يكن تجاوز dev.',
      },
      {
        id: 'ads',
        title: 'مسارات الإعلانات',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }. GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — إعداد موضع مع slotId عند الضبط. GET /api/ads/placeholder-bg — بحث بطل لأسطح العناصر النائبة. مسار التطبيق GET /ads.txt — سطر ناشر AdSense من env. مواضع AdSlot النشطة: dashboard وhero وcity-detail. env فتحة recent-checks موجود لكن الصفحة الرئيسية بلا AdSlot.',
      },
      {
        id: 'other',
        title: 'مسارات عامة أخرى',
        body:
          'GET /api/platform/limits — لقطة حصة عامة. POST /api/analytics/collect — منارة analytics من الطرف الأول. GET /api/location/region — مساعد IP/منطقة. POST /api/weather/inaccurate-report — الإبلاغ عن بيانات سيئة. GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — بلاط overlay بطل OSM. Auth: POST /api/auth/login، /logout؛ POST /api/auth/forgot-password؛ POST /api/auth/reset-password/[token]؛ GET|POST /api/auth/invite/[token]؛ GET /api/auth/session.',
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
    slug: 'deployment',
    title: 'النشر والبيئة',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'لمن هذه الصفحة',
        body:
          'هذه الصفحة لمن ينشرون meridian. الزوار العاديون لا يحتاجون هذه الإعدادات. العرض التجريبي يعمل بـ OPENWEATHER_API_KEY فقط؛ الباقي stretch اختياري.',
      },
      {
        id: 'env-required',
        title: 'البيئة المطلوبة',
        body:
          'OPENWEATHER_API_KEY — مطلوب للطقس وgeocode. DATABASE_PATH — ملف SQLite (افتراضي ./data/meridian.db)؛ حجم دائم في الإنتاج حتى تبقى الذاكرة والاشتراكات بعد إعادة التشغيل. NEXT_PUBLIC_SHOW_HOME_STRETCH=0 يخفي إعلان لوحة التحكم + Journal (مفعّل افتراضيًا). NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 يعطّل مدن البحث الشائع التجريبية عند فراغ API.',
      },
      {
        id: 'env-hero',
        title: 'بيئة صورة البطل',
        body:
          'UNSPLASH_ACCESS_KEY — اختياري؛ أول مزود صور لأبطال المواقع (خادم فقط، مخزّن في hero_image_cache). PEXELS_API_KEY — مزود ثالث اختياري بعد Unsplash وWikimedia Commons. NEXT_PUBLIC_CITY_HERO_OSM — اضبطه 0 لتعطيل ترويسة الخريطة الفضائية (مفعّل افتراضيًا). NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — opt-in Google Street View عند إيقاف OSM. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — مفتاح Maps Embed API اختياري لإطارات Street View.',
      },
      {
        id: 'env-email',
        title: 'بيئة البريد',
        body:
          'Multi-ESP عبر الموصل النشط في platform_settings (اختيار الإدارة): Resend (RESEND_API_KEY، RESEND_FROM_EMAIL)، SendGrid (SENDGRID_API_KEY، SENDGRID_FROM_EMAIL)، Amazon SES (AWS_ACCESS_KEY_ID، AWS_SECRET_ACCESS_KEY، AWS_SES_REGION، AWS_SES_FROM_EMAIL)، أو SMTP (SMTP_HOST، SMTP_PORT، SMTP_USER، SMTP_PASSWORD، SMTP_FROM_EMAIL، SMTP_SECURE). NEXT_PUBLIC_APP_URL — عنوان أساس لروابط إلغاء الاشتراك في البريد (مدرج في .env.example؛ مطلوب في الإنتاج).',
      },
      {
        id: 'env-cron',
        title: 'Cron والإدارة',
        body:
          'CRON_SECRET — Bearer لـ /api/cron/* (يُرفض عند unset في الإنتاج). ADMIN_SECRET — يوقّع cookie جلسة الإدارة ويشفّر أسرار الموصلات. ADMIN_PASSWORD — دخول root لـ ADMIN_EMAIL فقط. تجاوز dev فقط عند NODE_ENV=development وALLOW_DEV_ADMIN_BYPASS=1 وADMIN_SECRET unset. راجع docs/SECURITY.md. جدولة cron خارجيًا: weekly-digests (مثل صباح الاثنين)، weather-alerts (مثل كل 15–30 دقيقة).',
      },
      {
        id: 'env-adsense',
        title: 'بيئة AdSense',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID (ca-pub-…). GOOGLE_ADSENSE_SLOT_DASHBOARD وSLOT_HERO وSLOT_RECENT وSLOT_CITY_DETAIL وSLOT_DEFAULT — معرفات وحدات العرض. OAuth AdSense Management API: GOOGLE_ADSENSE_OAUTH_CLIENT_ID وGOOGLE_ADSENSE_OAUTH_CLIENT_SECRET وGOOGLE_ADSENSE_OAUTH_REDIRECT_URI اختياري (افتراضي ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback). أبقِ معرف العميل في أسرار المضيف فقط. /ads.txt يُولَّد وقت التشغيل من معرف العميل.',
      },
      {
        id: 'env-analytics',
        title: 'بيئة Analytics',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — محمّل GA4 اختياري عند تفعيل consent.analytics. NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — وسم meta لـ Search Console.',
      },
      {
        id: 'scripts',
        title: 'سكربتات npm',
        body:
          'dev وbuild وstart — Next.js. lint وtest وtest:watch وverify — بوابة الجودة (verify = lint + test + build). copy:icons — Meteocons إلى public (أيضًا postinstall). seed:checks — لقطات تجريبية North England. backfill:city-slugs — ملء city_slug على locations الموجودة. email — خادوم معاينة React Email. audit:deps — npm audit --omit=dev.',
      },
      {
        id: 'sqlite',
        title: 'جداول SQLite',
        body:
          'الطقس الأساسي: weather_snapshots وapi_call_log. المواقع والفحوص: locations وlocation_weather_checks وweather_observations وweather_forecast_archive. الاشتراكات: subscriptions وsubscription_send_log. المنصة: platform_settings (singleton). الأبطال: hero_image_cache. تحقيق الدخل: adsense_report_snapshots. Analytics: site_analytics_events. البريد/CMS: email_templates وcms_pages. الإدارة: admin_users وadmin_invites وadmin_password_resets وadmin_audit_log. المخطط في src/lib/db/index.js. الفتح الأول يزرع platform_settings بـ refresh 1h وstale 2h وحد يومي 1000 وsoft block 950 وwarning 800 وper-minute 60.',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js يعيد كتابة مضيف docs.localhost إلى /docs لنطاق الوثائق المحلي. لا middleware مصادقة على مسارات التطبيق الرئيسية.',
      },
      {
        id: 'localstorage-keys',
        title: 'مفاتيح تخزين المتصفح',
        body:
          'من storage-keys.js: meridian:client-id وmeridian:saved-cities وmeridian:checked-cities وmeridian:user-location وmeridian:weather-cache وmeridian:theme وmeridian:cookie-consent وmeridian:subscriptions وmeridian:tier (محجوز) وmeridian:consent وmeridian:accessibility وmeridian:city-detail-accordion وmeridian:temperature-unit وmeridian:preferred-locale وmeridian:weather-refresh-mode. sessionStorage meridian_analytics_sid — معرف جلسة analytics من الطرف الأول. cookie الإدارة meridian_admin_session (HttpOnly، يضبطه الخادم). حدث مخصص meridian:storage يزامن hooks بعد الكتابة.',
      },
    ],
  },
];
