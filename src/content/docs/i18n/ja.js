/** Japanese documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'はじめに',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: '概要',
        body:
          'meridian は複数都市向けの天気ダッシュボードです。場所を検索し、ブラウザに最大10都市をピン留めし、現在の状況、短期予報、任意のメール更新を確認できます。アカウントは不要です。都市リストと設定はデバイスごとに localStorage に保存されます。',
      },
      {
        id: 'requirements',
        title: '要件',
        body:
          'ダッシュボードにはサーバー側の OpenWeather API キー（OPENWEATHER_API_KEY）が必要です。ない場合、天気とジオコードのリクエストはエラーを返します。メール購読、cron ジョブ、AdSense は任意で、環境変数やコネクタの設定時のみ有効になります。SQLite（better-sqlite3）はキャッシュとクォータのために常に動作します。',
      },
      {
        id: 'add-city',
        title: '都市のピン留め',
        body:
          'ホームページのヒーローまたはヘッダーの検索フィールドを使用します。2文字以上入力すると、300ms のデバウンス後に結果が表示されます。ジオコード結果を選択すると都市詳細ページが開きます。そのページの「Pin to your locations」で都市を「Your locations」に保存します。重複は拒否されます。各都市には安定した ID が付与されます：{slugified-name}-{country}-{latitude to four decimals}。URL 例：/city/london-gb-51.5073。',
      },
      {
        id: 'city-limit',
        title: '都市数の上限',
        body:
          '最大10都市までピン留めできます（MAX_SAVED_CITIES）。上限に達した場合、グリッドから1つ削除してから別の都市をピン留めしてください。',
      },
      {
        id: 'first-visit',
        title: '初回訪問：Cookie とテーマ',
        body:
          '初回訪問時、Cookie バナーがローカルストレージの使用を説明します。ボタン：Accept all（機能＋広告）、Accept functional、Essential only、Manage preferences。フローティングの設定コントロール（Cookies タブ）からいつでも Cookie 設定を再開できます。フローティングのテーマ切替でライト／ダーク設定を切り替えます（meridian:theme に保存）。',
      },
      {
        id: 'navigation',
        title: '次に読むページ',
        body:
          'Dashboard はホームページのレイアウトを説明します。City detail は予報ページ全体を扱います。Forecasts & cache は TTL とキャッシュ層を説明します。Subscriptions はメールを扱います。API limits と API reference はサーバー動作を文書化します。ローカル開発では docs.localhost:3000 でもドキュメントが提供されます（ミドルウェアのリライト）。CMS で編集したドキュメントは、ファイルのデフォルトにリセットするまで差分が生じる場合があります。',
      },
      {
        id: 'verify',
        title: '開発者向け',
        body:
          'npm run verify で lint、テスト、ビルドを実行します。npm run dev を実行し localhost:3000 を開きます。任意：/login でサインイン後 /admin で使用状況診断とプラットフォーム設定（開発時 ADMIN_SECRET 未設定なら dev bypass が適用される場合あり）。',
      },
    ],
  },
  {
    slug: 'dashboard',
    title: 'ダッシュボード',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'layout',
        title: 'ページレイアウト',
        body:
          'ホームページの帯：(1) Hero — 製品紹介、位置情報による天気確認、正方形のヒーロー広告。(2) Recent checks — 2列（「Near you」「Popular searches」）。(3) Your locations — ピン留め都市の天気カード。(4) ダッシュボード広告プレースホルダー／ユニット。(5) Journal — `/journal/[slug]` 投稿へリンクする6枚のブログ風記事カードの左右カルーセル。',
      },
      {
        id: 'cards',
        title: '天気カード',
        body:
          '各カードに都市名、地域／国、現在気温、状態の説明、Meteocons 天気アイコン、体感温度、湿度、風を表示します。カードは都市詳細ページへリンクします。ホバーで詳細ルートと天気データをプリフェッチします。',
      },
      {
        id: 'forecast-strip',
        title: '7日間ミニ予報',
        body:
          'メイン表示の下に、各カードが7日間の見通し（曜日ラベル、アイコン、最低／最高）を表示します。current と daily スコープはダッシュボードの1回のバッチリクエストで同時に読み込まれます。別途 idleCallback による daily 取得はありません。ストリップは曜日ラベル、アイコン、最低／最高気温範囲を表示します。',
      },
      {
        id: 'card-actions',
        title: 'カード操作',
        body:
          'Subscribe はその都市の週次ダイジェストと天気アラートメール用のモーダルを開きます。Remove（X）は localStorage から都市を削除し、ブラウザの天気キャッシュをクリアします。その都市に有効なメール購読がある場合、削除前に購読解除を促すダイアログが表示されます。',
      },
      {
        id: 'states',
        title: '読み込みとエラー状態',
        body:
          '天気読み込み中はスケルトンカードを表示します。上流障害時は Retry と Remove 操作付きのエラーアラートを表示します。グリッドが空の場合は、都市詳細ページから検索して最初の都市をピン留めする案内を表示します。',
      },
      {
        id: 'refresh',
        title: '更新の挙動',
        body:
          'デフォルトでは Your locations は手動更新（`meridian:weather-refresh-mode`）です。ページ読み込み時はこのブラウザに保存された最後の読み取り値を表示し、カードの更新をタップしたとき（または都市にローカルキャッシュがまだないとき）のみ取得します。現在の UI に Settings → Weather パネルはありません。キーはプログラム／将来用に存在します。データはサーバー側（メモリ＋SQLite）にもキャッシュされます。TTL の詳細は Forecasts & cache を参照してください。',
      },
      {
        id: 'recent-checks',
        title: 'Recent checks',
        body:
          '2列で GET /api/recent-checks から最大5枚ずつカードを表示（location_weather_checks の人気検索、API 上限20、source popular|empty）。座標がある場合カードは都市詳細へリンクします。npm run seed:checks は weather_snapshots のみを埋めます。このストリップは埋めません。Recent checks & seeding を参照してください。',
      },
    ],
  },
  {
    slug: 'city-detail',
    title: '都市詳細',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'access',
        title: '都市ページの閲覧者',
        body:
          '都市詳細ページは /city/[cityId] にあります。resolveCity() は常に5つの PLATFORM_SHOWCASE_CITIES（London、Dubai、New York、Tokyo、Sydney）を提供します。city_slug を持つ任意の location 行も解決されます。{name}-{country}-{lat} 形式の解析 ID は、SQLite に lat/country が存在すれば一致します。不明または不正なスラッグは 404 を返します。ページを開くのにピン留めは不要です。',
      },
      {
        id: 'tabs',
        title: '予報タブ',
        body:
          '固定タブ：Today、Hourly、10-Day、History。?tab=hourly、?tab=daily、?tab=history でディープリンク。レガシー ?tab=next-hour は Today へリダイレクト。alertIds がある場合、ヒーロー上に最大3つの OpenWeather アラートバナーを表示。タブ直下に city-detail の AdSlot を配置。',
      },
      {
        id: 'header',
        title: 'ページヘッダーとヒーロー',
        body:
          'デフォルトでは isCityHeroOsmEnabled() が true（NEXT_PUBLIC_CITY_HERO_OSM 未設定または "0" 以外）のとき、ヘッダーに OSM 衛星地図の背景を使用します。写真を優先するには NEXT_PUBLIC_CITY_HERO_OSM=0 を設定。写真モードは getHeroImageForRegion 経由で Unsplash → Wikimedia Commons → Pexels の順にフォールバックし、キーがない場合は静的 SVG にフォールバック。OSM オフかつ NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 のとき任意で Google Street View を適用。',
      },
      {
        id: 'today',
        title: 'Today タブ',
        body:
          '現在状況のヒーロー、Meteocon アイコン付きメトリックタイル、Current conditions／Location／Sun times のアコーディオン。hourly データがある場合は本日残りの時間別プレビュー。',
      },
      {
        id: 'hourly',
        title: 'Hourly タブ',
        body:
          '今後12時間のカードリスト（1列）：短期の気温、降水確率、風。',
      },
      {
        id: 'daily',
        title: '10-Day タブ',
        body:
          '日次見通しリスト（最大10日）：曜日、アイコン、説明／要約、最低／最高、降水確率、風、UV。日を選択するとその日付のメトリックチャートが開きます。',
      },
      {
        id: 'history',
        title: 'History タブ',
        body:
          'GET /api/weather/history 経由で保存観測とアーカイブ予報から過去日を表示。日付ピッカーとチャート付き。',
      },
      {
        id: 'alerts',
        title: '天気アラート',
        body:
          'OpenWeather がアラートを返す場合、AlertBanner はヒーロー上に最大3件表示。全文は GET /api/alerts/[alertId] で取得可能。',
      },
      {
        id: 'data',
        title: 'データ読み込み',
        body:
          'SSR は getCityWeatherForSeo から利用可能な current、daily、hourly をハイドレート。クライアントフック useCityWeather は POST /api/weather/batch で DETAIL_SCOPES = [current, hourly, daily] をバッチ取得します。minutely は要求しません。Premium / MinutelyPrecipStrip は未接続です。',
      },
      {
        id: 'subscribe',
        title: 'ピン留めと購読',
        body:
          'ヘッダーの Options メニューに Pin to your locations と Subscribe（週次ダイジェスト＋天気アラート）があります。ダッシュボードカードと同じフローです。Pin は meridian:saved-cities に保存。subscribe は SubscribeDialog を開きます。',
      },
      {
        id: 'prefetch',
        title: 'プリフェッチ',
        body:
          'ダッシュボードの天気カードにホバーすると /city/[cityId] をプリフェッチし、prefetchCityDetail 経由で L0 キャッシュを温め、詳細ページを高速に開きます。',
      },
      {
        id: 'seo',
        title: '検索と発見',
        body:
          '場所が初めて現在の天気チェックに成功すると、markLocationIndexable が city_slug と indexable_at を設定し、サイトマップに都市を追加し、都市ページに SEO メタデータと要約ブロックをサーバーレンダリングします。',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: '予報とキャッシュ',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'scopes',
        title: '天気スコープ',
        body:
          'クライアントが要求可能なスコープ：current（現在）、hourly（タイムライン）、daily（タイムライン）、minutely（降水）。サーバーのみのスコープ：geocode（キー geocode:{query} の都市検索キャッシュ）、alert（個別アラートペイロード）。各天気スコープのキャッシュキーは {lat},{lon},{scope}。geocode はクエリ文字列でキー化。',
      },
      {
        id: 'layers',
        title: 'キャッシュ層',
        body:
          'L0 — ブラウザ localStorage meridian:weather-cache、構造 {cityId: {scope: {payload, fetchedAt}}}。L1 — サーバープロセス上のインメモリ Map。L2 — fetched_at、expires_at、stale_until を持つ SQLite weather_snapshots。読み取りは L0 → API → L1/L2 → 上流 OpenWeather の順。',
      },
      {
        id: 'freshness',
        title: '鮮度状態',
        body:
          'fresh — expires_at 以内。acceptable — expires 超過だが stale_until 以内（配信可）。expired — stale_until 超過、クォータが許せば上流をトリガー。emergency — クォータブロック中でも expired/acceptable の L2 スナップショットを配信し、ユーザーにデータを表示し続けます。',
      },
      {
        id: 'ttl-table',
        title: 'TTL デフォルト（SCOPE_TTL）',
        body:
          'current — fresh 1h、stale 2h（platform_settings.refresh_interval_ms と stale_cache_max_ms で上書き。管理画面で 10m–2h 設定可）。hourly — fresh 2h、stale 6h。daily — fresh 6h、stale 12h。minutely — fresh 15m、stale 30m。geocode — fresh 7d、stale 30d。alert — fresh 1h、stale 6h。',
      },
      {
        id: 'upstream',
        title: 'OpenWeather 連携',
        body:
          '主：One Call API 4.0（onecall/current、timeline/1h、timeline/1day、timeline/1min）。current スコープは One Call current 失敗時 API 2.5 /weather にフォールバック。ジオコードは OpenWeather ジオコーディング API（上限5）。src/lib/one-call.js の正規化で一貫した UI ペイロードを生成。',
      },
      {
        id: 'batch',
        title: 'バッチ取得',
        body:
          'POST /api/weather/batch は { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? } を受け付けます。スコープは都市ごと（city.scopes）で、トップレベルの scopes 配列ではありません。ダッシュボードは1バッチで current + daily を同時読み込み（requestIdleCallback なし）。都市詳細は current + hourly + daily のみバッチ。ハンドラはバーストレート制限回避のため都市間を約100ms 空けます。',
      },
      {
        id: 'headers',
        title: 'レスポンスメタデータ',
        body:
          'API レスポンスに meta：cacheLayer（memory、database、upstream）、freshness、fetchedAt、ageMs、upstreamCallAvoided、source。X-Cache ヘッダーは該当時 hit/miss を反映。UI の「Updated X ago」は meta.fetchedAt を使用。',
      },
      {
        id: 'quota',
        title: 'クォータとの関係',
        body:
          '日次または分あたり上限超過時、上流呼び出しは停止し、利用可能なら emergency の stale L2 データを返します。TTL 内に都市を再開しても上流呼び出しはゼロです。',
      },
      {
        id: 'logging',
        title: 'キャッシュヒットのログ',
        body:
          'L2 データベースキャッシュヒットは api_call_log に cache_hit=1 で記録し、日次上流カウンタは増えません。L1 メモリヒットは配信されますが SQLite には永続化しません。SSR/クライアントの再マウントごとに発火し、file watcher 下では meridian.db が過負荷になります。',
      },
      {
        id: 'payload-fields',
        title: 'current ペイロードのフィールド',
        body:
          'temperature、feelsLike、description、condition、icon（OpenWeather コード）、humidity、pressure、dewPoint、uvi、clouds、visibility、windSpeedKmh、windGustKmh、windDeg、sunrise、sunset、alertIds、city、country、timezone、updatedAt、source。',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: 'Recent checks とシーディング',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'recent checks とは',
        body:
          'ホームページの recent checks はプラットフォーム全体の人気検索を表示します。検索でユーザーが選択またはプレビューした回数でランク付けされた場所であり、個人の検索履歴でも天気スナップショットキャッシュの生ダンプでもありません。',
      },
      {
        id: 'api',
        title: 'API の挙動',
        body:
          'GET /api/recent-checks は getRecentChecksPayload() を呼び出し、listPopularSearchChecks 経由で location_weather_checks（locations と結合）を読み取ります。デフォルト上限は20。カウントされるトリガーは search_select と search_preview。レスポンス形式は { checks, source }。行があるとき source は popular、ないとき empty。showcase fallback はありません。',
      },
      {
        id: 'ui',
        title: 'ホーム UI',
        body:
          'RecentChecksSection は2列（「Near you」「Popular searches」）で各最大5カード。Meteocons アイコン、気温、説明、都市ラベルを使用。座標がある場合カードは /city/[cityId] へリンク。ホームページに recent-checks の AdSlot はありません。',
      },
      {
        id: 'seed-script',
        title: 'weather snapshots のシーディング（ストリップではない）',
        body:
          'OPENWEATHER_API_KEY を設定して npm run seed:checks を実行。スクリプトはカンブリアとイングランド北東部の43地点の現在の天気を取得（src/constants/seed-locations.js 参照）、ずらした fetched_at で SQLite weather_snapshots に書き込み、都市名でペイロードを拡張します。これはデモ用 L2 キャッシュを埋めます。検索トリガーの location_weather_checks 行は挿入しないため、recent-checks／人気検索ストリップは埋まりません。',
      },
      {
        id: 'persistence',
        title: '永続化',
        body:
          'シードしたスナップショットは DATABASE_PATH（デフォルト ./data/meridian.db）に保存されます。再実行は cache_key で upsert します。人気検索行は実際の検索記録で蓄積されます。DB をクリアするとスナップショットとチェック履歴の両方が空になり、新しい検索が発生するまでストリップは empty を表示します。',
      },
    ],
  },
  {
    slug: 'subscriptions',
    title: '購読',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: '概要',
        body:
          'meridian は任意のメールをサポート：プラットフォームニュースレター（製品更新）と都市ごとの週次ダイジェスト＋天気アラート。すべての購読には明示的なオプトインが必要です。アカウントなし — meridian:client-id の匿名 UUID clientId がブラウザ UI とサーバー行をリンクします。',
      },
      {
        id: 'types',
        title: '購読タイプ',
        body:
          'newsletter — フッターの NewsletterSignup からの meridian 製品更新。city_weekly — 保存都市の週次ダイジェストメール。city_alerts — 有効なアラートタイプが一致したときの通知（アラートルール参照）。タイプは SQLite subscriptions.type に保存され meridian:subscriptions ローカルレジストリに反映されます。',
      },
      {
        id: 'client-linking',
        title: 'Client ID とローカルレジストリ',
        body:
          '初回訪問時に UUID が meridian:client-id に書き込まれます。POST /api/subscriptions でメール＋設定をこの clientId に関連付け。GET /api/subscriptions?clientId= で読み込み時に meridian:subscriptions をハイドレート。DELETE は clientId、都市座標、types で無効化。',
      },
      {
        id: 'alert-prefs',
        title: 'アラート設定',
        body:
          'city_alerts 行は alert_prefs_json を保存 — アラートタイプ id をキーにしたブールマップ（rain、wind、thunderstorm、snow、ice、extreme_heat、fog、深刻度レベル、水文、大気質、海洋、UV、米国の厳重天気など — constants/alert-types.js の ALL_ALERT_TYPES 参照）。PATCH /api/subscriptions は既存アラート行の部分 alertPrefs を更新。作成時はレガシー列 alert_on_rain と alert_on_storm を同期。',
      },
      {
        id: 'subscribe-ui',
        title: '購読モーダル',
        body:
          '各天気カードと都市詳細の Options メニュー：メール欄、週次ダイジェストチェックボックス、細かいアラートトグル（またはすべて有効）。既に有効なら Subscribed / Manage ラベル。週次ダイジェストはメールアドレスあたり MAX_WEEKLY_DIGEST_LOCATIONS = 20 まで。フッターのニュースレターは type newsletter で同じ API を使用。',
      },
      {
        id: 'emails',
        title: 'メール配信',
        body:
          'sendTransactionalEmail は管理画面で選択した有効 ESP コネクタ（Resend、SendGrid、SES、SMTP）経由でルーティング。src/emails/ と SQLite email_templates の React Email テンプレート：welcome（newsletter）、weekly digest、weather alert（アラートタイプスラッグごと）。コネクタ未設定時、API は購読を書き込みますが送信関数は { sent: false } を返します。本番メールの正しい購読解除リンクには NEXT_PUBLIC_APP_URL を設定してください。',
      },
      {
        id: 'unsubscribe',
        title: '購読解除',
        body:
          '各購読に一意の unsubscribe_token。GET /api/unsubscribe?token= でその行を無効化し確認を表示。メールテンプレートはこのルートへリンク。都市削除時は RemoveCityDialog 経由で任意に購読解除可能。',
      },
      {
        id: 'cron-weekly',
        title: '週次ダイジェスト cron',
        body:
          'GET /api/cron/weekly-digests、Authorization: Bearer CRON_SECRET。有効な city_weekly 購読をメールでグループ化、一意都市をバッチ、都市ごとに現在の天気を取得し、有効コネクタ経由でメールあたり1ダイジェストを送信。外部スケジュール（Vercel cron、GitHub Actions など）— リポジトリにスケジュールは同梱されません。',
      },
      {
        id: 'cron-alerts',
        title: '天気アラート cron',
        body:
          'GET /api/cron/weather-alerts、Bearer CRON_SECRET。各 city_alerts 購読について、evaluateOpenWeatherAlertMatches（現在状況）、evaluateOfficialAlertMatches（Open-Meteo 国内警報）、プラットフォームトグルが許す場合の NWS 有効アラートからマージした一致に対し有効な alertPrefs を評価。subscription_send_log で重複排除し、同じ都市／条件ウィンドウで同じアラートを2回メールしません。',
      },
      {
        id: 'remove-city',
        title: '都市削除との連携',
        body:
          '保存都市の削除は L0 天気キャッシュをクリア。その都市に購読がある場合、RemoveCityDialog が削除確認前に週次および／またはアラートの購読解除を促します。',
      },
    ],
  },
  {
    slug: 'monetization',
    title: '収益化と同意',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'tiers',
        title: '無料ティア（Premium は予約）',
        body:
          '製品は現在無料のみで動作。ConsentProvider は tier free をハードコード。meridian:tier は予約でランタイム未使用。Stripe checkout と PremiumGate は未接続。広告は広告同意と AdSense 設定でゲート — premium フラグではありません。',
      },
      {
        id: 'premium-features',
        title: 'Premium が解放する内容（未提供）',
        body:
          '予約／UI 未実装：有料ティアでの AdSense 非表示、minutely 降水ストリップ。都市詳細は現在 current、hourly、daily スコープのみ読み込み。アプリに MinutelyPrecipStrip コンポーネントはありません。',
      },
      {
        id: 'consent-model',
        title: '同意モデル',
        body:
          'meridian:consent JSON フィールド：essential（常時オン）、functional（天気キャッシュ localStorage 書き込みと GPS ヘルパー）、marketing（予約）、analytics（設定時 GA4 ローダー）、advertising（AdSense）。レガシー meridian:cookie-consent。Cookie バナー：Accept all、Accept functional、Essential only、Manage preferences。フローティング設定 → Cookies タブからいつでも再開。「Accept all」は functional + advertising を有効化。analytics は別途設定で有効化（提供時）。',
      },
      {
        id: 'adsense',
        title: 'Google AdSense（本番）',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID と配置スロット環境変数が設定されると AdSense は本番稼働 — プレースホルダーではありません。AdSenseProvider は設定時、広告同意後にスクリプトを1回読み込み。GET /api/ads/config はスクリプト設定を返す。GET /api/ads?placement= はスロットごとの設定。GET /ads.txt は env から出版社検証を提供。クライアント ID はサーバー側で検証（ca-pub-… 形式）。git にコミットしないこと。',
      },
      {
        id: 'placements',
        title: '広告配置',
        body:
          'AdSlot の有効 UI 配置：dashboard（都市グリッド下）、hero（ホームヒーロー＋ジャーナルサイドバー）、city-detail（タブ下）。配置 id recent-checks は constants/env に存在するがホームに AdSlot なし。スロット環境変数：GOOGLE_ADSENSE_SLOT_DASHBOARD、_HERO、_RECENT、_CITY_DETAIL、_DEFAULT。スロット ID なし時はブランド付きデモプレースホルダー。クライアント ID 設定時はスクリプトから自動広告が動作する場合あり。',
      },
      {
        id: 'adslot-states',
        title: 'AdSlot UI 状態',
        body:
          'デフォルト（AdSense 未設定／広告同意なし）：public/ads/ 下のブランド PNG プレースホルダー（バナーと正方形）。オーバーレイ文言はスクリーンリーダーのみ（sr-only）、画像には描画しません。GET /api/ads/placeholder-bg は他画面用にヒーロー検索を提供する場合あり。設定済み＋同意 — スクリプト準備後 ins.adsbygoogle ユニット。',
      },
      {
        id: 'analytics',
        title: 'アナリティクス',
        body:
          'ファーストパーティ SiteAnalyticsBeacon が consent.analytics オン時にページパス／エンゲージメントを POST /api/analytics/collect へ site_analytics_events に送信（collect エンドポイントもリクエスト本文の同意フラグを確認）。広告スロット表示イベントも consent.advertising が必要。任意 GA4（AnalyticsProvider）は NEXT_PUBLIC_GA_MEASUREMENT_ID 設定かつ consent.analytics オン時のみ読み込み。Cookie バナーの「Accept all」は analytics を有効化しません — Settings → Cookies で有効化。',
      },
      {
        id: 'stripe',
        title: 'Stripe（計画）',
        body:
          'Premium / Stripe checkout は未実装。将来の課金にはサーバー側ティア強制が必要。meridian:tier を有効と見なさないこと。',
      },
      {
        id: 'data',
        title: 'データライセンス',
        body:
          'meridian はユーザーデータを販売・ライセンスしません。ファーストパーティアナリティクスと任意 GA4 は製品運用用。将来の B2B や匿名化アナリティクス製品には別途同意とポリシー更新が必要です。',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'API 制限',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'quota',
        title: '日次・分あたりクォータ',
        body:
          'constants/weather.js のデフォルト：DAILY_LIMIT 1000、WARNING_THRESHOLD 800、SOFT_BLOCK_THRESHOLD 950、PER_MINUTE_LIMIT 60（ローリング1分あたりの上流呼び出し）。platform_settings で daily_limit、soft_block_threshold、warning_threshold、per_minute_limit を上書き可（初回 DB オープン時にデフォルトシード）。カウンタは UTC 深夜にリセット。',
      },
      {
        id: 'status',
        title: 'ステータス値',
        body:
          'ok — 警告閾値未満。warning — warning_threshold 以上（デフォルト本日800呼び出し）。soft_block — soft_block_threshold 以上（デフォルト950）。上流ブロック。hard_block — daily_limit（デフォルト1000）。過去60秒に per_minute_limit 回の呼び出しがある場合、分あたり上限も上流をブロック。',
      },
      {
        id: 'cache-hits',
        title: 'キャッシュヒットと上流',
        body:
          'L2 DB ヒットは api_call_log に cache_hit=1 で記録し日次上流カウンタは増えません。L1 メモリヒットは SQLite に記録されません — meta.layer が memory のとき recordCacheHit は早期 return。クォータにカウントするのは成功した上流 OpenWeather 呼び出し（status 200、cache_hit=0）のみ。ブロック時は emergency stale 配信で上流を回避。',
      },
      {
        id: 'admin-shortcut',
        title: '管理診断',
        body:
          'ログイン後 /admin で本日の使用量／日次上限、残り、ステータス、更新間隔設定。API：GET /api/admin/usage。',
      },
      {
        id: 'admin-api',
        title: '管理 API',
        body:
          'GET /api/admin/usage — クォータスナップショットと最近の呼び出し。GET|PATCH /api/admin/config — 主要管理設定 API（更新間隔、コネクタ、ダイジェストデフォルト、AdSense、アラートトグルなど）。狭いレガシー：PATCH /api/admin/settings { refreshIntervalMs }。認証：/login 後の HttpOnly セッション Cookie meridian_admin_session。署名シークレットは ADMIN_SECRET（ADMIN_PASSWORD ではない）。NODE_ENV=development、ALLOW_DEV_ADMIN_BYPASS=1、ADMIN_SECRET 未設定時の dev bypass。',
      },
      {
        id: 'openweather',
        title: 'OpenWeather プロバイダー制限',
        body:
          'meridian は独自の上流カウンタを追跡。OpenWeather も独立してレート制限やキー拒否（401、429）する場合あり。オーケストレーターはこれらをクライアント向け構造化 API エラーにマップ。',
      },
      {
        id: 'emergency',
        title: '緊急モード',
        body:
          'soft/hard ブロック時も、ユーザーは空白エラーではなく freshness emergency とマークされた最後の acceptable SQLite スナップショットを見ます — その座標にスナップショットが一度も存在しない場合を除きます。',
      },
    ],
  },
  {
    slug: 'api-reference',
    title: 'API リファレンス',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: '概要',
        body:
          'すべての API ルートは src/app/api/ 下の Next.js App Router ハンドラー。Weather と geocode には OPENWEATHER_API_KEY が必要。Cron ルートには Authorization: Bearer CRON_SECRET。管理ルートには /login 後の認証済み管理セッション Cookie（meridian_admin_session）が必要（dev bypass を除く）。',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query：lat、lon、scope（current|hourly|daily|minutely）、任意 trigger、lang。天気ペイロードと fetchedAt、cacheHit、freshness、source、trigger、tokensUsed を返す。X-Cache ヘッダーはキャッシュ層を反映。エラー：400 無効パラメータ、404 location not found、429 rate_limited、502 upstream_error または service_unavailable。',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body：{ cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }。{ cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] } を返す。スコープは都市ごと、トップレベル配列ではない。IP あたり20リクエスト/分に制限。ダッシュボードと都市詳細フックが使用。',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query：lat、lon、任意 from、to（ISO 日付）、limit。weather_observations と weather_forecast_archive テーブルから { summary, observations, forecasts: { hourly, daily } } を返す。',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query：q（最低2文字）、任意 context パラメータ。正規化配列を返す：name、country、state、lat、lon、label。上流上限5件。geocode スコープで L2 キャッシュ。IP あたり60リクエスト/分に制限。',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'パラメータなし。{ checks, source } を返す。検索トリガー行があるとき source は popular、ないとき empty。location_weather_checks から検索量順（search_select と search_preview トリガー）デフォルト上限20。showcase fallback なし。',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — クライアントの有効購読一覧。POST — 作成 { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }。PATCH — city_alerts 行の alertPrefs 更新 { clientId, id, alertPrefs }。DELETE — body { clientId, cityLat, cityLon, types[] }。Types：newsletter、city_weekly、city_alerts。',
      },
      {
        id: 'unsubscribe',
        title: 'GET /api/unsubscribe',
        body:
          'Query：token（unsubscribe_token UUID）。購読を無効化し HTML 確認を返す。',
      },
      {
        id: 'alerts',
        title: 'GET /api/alerts/[alertId]',
        body:
          '正規化アラートを返す：id、senderName、event、start、end、description。キャッシュされた alert スコープから取得。',
      },
      {
        id: 'cron',
        title: 'Cron ルート',
        body:
          'GET /api/cron/weekly-digests — 購読者メールごとにグループ化した週次ダイジェストメール送信。GET /api/cron/weather-alerts — OpenWeather、Open-Meteo、NWS フィードに対し alertPrefs を評価しアラートメール送信。両方 Bearer CRON_SECRET が必要。',
      },
      {
        id: 'admin',
        title: '管理ルート',
        body:
          '使用状況と設定：GET /api/admin/usage；GET|PATCH /api/admin/config；レガシー PATCH /api/admin/settings { refreshIntervalMs }。ユーザーと認証：GET|POST /api/admin/users；POST /api/admin/users/invite；GET /api/admin/me。データ：GET /api/admin/checks；GET /api/admin/locations；GET|PATCH /api/admin/subscriptions；GET /api/admin/mailing-summary；GET /api/admin/analytics。コネクタ：GET|PATCH /api/admin/connections；GET|PATCH /api/admin/openweather-key；GET|PATCH /api/admin/email-key。メール CMS：GET|POST|PATCH /api/admin/email-templates；POST /api/admin/email/test、/compose、/sync。AdSense：GET /api/admin/adsense/report；POST /api/admin/adsense/sync；OAuth GET /api/admin/adsense/oauth/start、/callback、/disconnect。CMS：GET|PATCH /api/admin/cms-pages。dev bypass を除きすべて meridian_admin_session が必要。',
      },
      {
        id: 'ads',
        title: '広告ルート',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }。GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — 設定時 slotId 付き配置設定。GET /api/ads/placeholder-bg — プレースホルダー画面用ヒーロー検索。アプリルート GET /ads.txt — env から AdSense 出版社行。有効 AdSlot 配置：dashboard、hero、city-detail。recent-checks スロット env はあるがホームに AdSlot なし。',
      },
      {
        id: 'other',
        title: 'その他の公開ルート',
        body:
          'GET /api/platform/limits — 公開クォータスナップショット。POST /api/analytics/collect — ファーストパーティアナリティクスビーコン。GET /api/location/region — IP/地域ヘルパー。POST /api/weather/inaccurate-report — 不正確データのフラグ。GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — OSM ヒーローオーバーレイタイル。認証：POST /api/auth/login、/logout；POST /api/auth/forgot-password；POST /api/auth/reset-password/[token]；GET|POST /api/auth/invite/[token]；GET /api/auth/session。',
      },
      {
        id: 'errors',
        title: 'エラー形式',
        body:
          'JSON エラーは通常 { error: code, message: string }。ApiError コードには invalid_request、service_unavailable、location_not_found、rate_limited、upstream_error、unauthorized、not_found、limit_reached が含まれます。',
      },
    ],
  },
  {
    slug: 'weather-icons',
    title: '天気アイコン',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'source',
        title: 'アイコンセット',
        body:
          'meridian は OpenWeather CDN の PNG ではなく Meteocons（MIT、Bas Milius）の塗りつぶしスタイル静的 SVG を使用。アイコンは public/weather-icons/ にあり、npm install（postinstall）または npm run copy:icons で @meteocons/svg-static からコピー。帰属表示は public/weather-icons/ATTRIBUTION.txt。',
      },
      {
        id: 'inventory',
        title: '同梱アイコン',
        body:
          'scripts/copy-weather-icons.mjs は35個の一意 SVG をコピー：17個の OpenWeather 状態アイコンとメトリック／詳細タイル（thermometer、humidity、barometer、wind、UV、raindrop、snowflake、compass、starry-night、time-afternoon および関連バリアント）。copy:icons 後に public/weather-icons/*.svg のファイル数を確認。',
      },
      {
        id: 'mapping',
        title: 'OpenWeather コードマッピング',
        body:
          'OpenWeather アイコンコード（例 01d、10n）は src/features/weather/utils/weather-icon.js で Meteocon 名にマップ：01d→clear-day、01n→clear-night、02d→partly-cloudy-day、02n→partly-cloudy-night、03d/03n→cloudy、04d→overcast-day、04n→overcast-night、09d→overcast-day-rain、09n→overcast-night-rain、10d→partly-cloudy-day-rain、10n→partly-cloudy-night-rain、11d→thunderstorms-day、11n→thunderstorms-night、13d→overcast-day-snow、13n→overcast-night-snow、50d→fog-day、50n→fog-night。不明コードは cloudy にフォールバック。METRIC_METEOCON は詳細タイルキーを追加アイコンにマップ。',
      },
      {
        id: 'component',
        title: 'WeatherIcon コンポーネント',
        body:
          'src/features/weather/components/WeatherIcon.jsx は getWeatherIconPath(icon) でローカル /weather-icons/{name}.svg をラップ。天気カード、recent checks、予報ストリップ、時間別チャート、日次行、都市詳細メトリックタイルで使用。alt テキストは description 指定時に天気説明を使用。',
      },
      {
        id: 'maintenance',
        title: 'アイコンの追加・更新',
        body:
          'weather-icon.js の OPENWEATHER_TO_METEOCON / METRIC_METEOCON と scripts/copy-weather-icons.mjs の ICON_NAMES を編集し npm run copy:icons。weather-icon.test.js の Vitest でマッピングを検証。',
      },
      {
        id: 'accessibility',
        title: 'アクセシビリティ',
        body:
          'アイコンはテキスト説明（例「Clear sky」）の装飾的補足。WeatherIcon は description prop から alt を設定。可視の状態テキストのみと併用時は空 alt。',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'デプロイと環境',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'env-required',
        title: '必須環境',
        body:
          'OPENWEATHER_API_KEY — weather と geocode に必須。DATABASE_PATH — SQLite ファイル（デフォルト ./data/meridian.db）。本番では再起動後もキャッシュと購読が残るよう永続ボリュームが必要。',
      },
      {
        id: 'env-hero',
        title: 'ヒーロー画像環境',
        body:
          'UNSPLASH_ACCESS_KEY — 任意。場所ヒーローの第一写真プロバイダー（サーバーのみ、hero_image_cache にキャッシュ）。PEXELS_API_KEY — Unsplash と Wikimedia Commons の後の第三プロバイダー（任意）。NEXT_PUBLIC_CITY_HERO_OSM — 0 で衛星地図ヘッダーを無効化（デフォルトオン）。NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — OSM オフ時の Google Street View オプトイン。NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — Street View iframe 用 Maps Embed API キー（任意）。',
      },
      {
        id: 'env-email',
        title: 'メール環境',
        body:
          'platform_settings の有効コネクタによるマルチ ESP（管理画面ピッカー）：Resend（RESEND_API_KEY、RESEND_FROM_EMAIL）、SendGrid（SENDGRID_API_KEY、SENDGRID_FROM_EMAIL）、Amazon SES（AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEY、AWS_SES_REGION、AWS_SES_FROM_EMAIL）、SMTP（SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASSWORD、SMTP_FROM_EMAIL、SMTP_SECURE）。NEXT_PUBLIC_APP_URL — メール内購読解除リンクのベース URL（.env.example に記載。本番必須）。',
      },
      {
        id: 'env-cron',
        title: 'Cron と管理',
        body:
          'CRON_SECRET — /api/cron/* の Bearer（本番未設定時は拒否）。ADMIN_SECRET — 管理セッション Cookie に署名しコネクタシークレットを暗号化。ADMIN_PASSWORD — ADMIN_EMAIL のみのルートログイン。dev bypass は NODE_ENV=development、ALLOW_DEV_ADMIN_BYPASS=1、ADMIN_SECRET 未設定時のみ。docs/SECURITY.md 参照。cron は外部スケジュール：weekly-digests（例：月曜朝）、weather-alerts（例：15–30分ごと）。',
      },
      {
        id: 'env-adsense',
        title: 'AdSense 環境',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID（ca-pub-…）。GOOGLE_ADSENSE_SLOT_DASHBOARD、SLOT_HERO、SLOT_RECENT、SLOT_CITY_DETAIL、SLOT_DEFAULT — ディスプレイユニット ID。AdSense Management API OAuth：GOOGLE_ADSENSE_OAUTH_CLIENT_ID、GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET、任意 GOOGLE_ADSENSE_OAUTH_REDIRECT_URI（デフォルト ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback）。クライアント ID はホストシークレットのみ。/ads.txt はクライアント ID からランタイム生成。',
      },
      {
        id: 'env-analytics',
        title: 'アナリティクス環境',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — consent.analytics オン時の任意 GA4 ローダー。NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — Search Console メタタグ。',
      },
      {
        id: 'scripts',
        title: 'npm スクリプト',
        body:
          'dev、build、start — Next.js。lint、test、test:watch、verify — 品質ゲート（verify = lint + test + build）。copy:icons — Meteocons を public へ（postinstall も）。seed:checks — イングランド北部デモスナップショット。backfill:city-slugs — 既存 location に city_slug を投入。email — React Email プレビューサーバー。audit:deps — npm audit --omit=dev。',
      },
      {
        id: 'sqlite',
        title: 'SQLite テーブル',
        body:
          'コア天気：weather_snapshots、api_call_log。場所とチェック：locations、location_weather_checks、weather_observations、weather_forecast_archive。購読：subscriptions、subscription_send_log。プラットフォーム：platform_settings（シングルトン）。ヒーロー：hero_image_cache。収益化：adsense_report_snapshots。アナリティクス：site_analytics_events。メール/CMS：email_templates、cms_pages。管理：admin_users、admin_invites、admin_password_resets、admin_audit_log。スキーマは src/lib/db/index.js。初回オープンで platform_settings を refresh 1h、stale 2h、日次上限1000、soft block 950、warning 800、分あたり60でシード。',
      },
      {
        id: 'middleware',
        title: 'ミドルウェア',
        body:
          'src/middleware.js はローカルドキュメントサブドメイン用に docs.localhost ホストを /docs にリライト。メインアプリルートに認証ミドルウェアなし。',
      },
      {
        id: 'localstorage-keys',
        title: 'ブラウザストレージキー',
        body:
          'storage-keys.js より：meridian:client-id、meridian:saved-cities、meridian:checked-cities、meridian:user-location、meridian:weather-cache、meridian:theme、meridian:cookie-consent、meridian:subscriptions、meridian:tier（予約）、meridian:consent、meridian:accessibility、meridian:city-detail-accordion、meridian:temperature-unit、meridian:preferred-locale、meridian:weather-refresh-mode。sessionStorage meridian_analytics_sid — ファーストパーティアナリティクスセッション ID。管理 Cookie meridian_admin_session（HttpOnly、サーバー設定）。カスタムイベント meridian:storage が書き込み後にフックを同期。',
      },
    ],
  },
];
