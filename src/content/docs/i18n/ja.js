/** Japanese documentation content pack — same slugs/section ids as English defaults. */
export const DOCS_PAGES_I18N = [
  {
    slug: 'getting-started',
    title: 'はじめに',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: 'meridian とは',
        body:
          'meridian は複数の場所を一度に見られる天気ダッシュボードです。都市を検索し、そのページを開き、「あなたの場所」にピン留めして、気温・天候・短期予報を確認できます。アカウントは不要です。ピン留めした都市とほとんどの設定はこの端末に保存されます。',
      },
      {
        id: 'add-city',
        title: '都市をピン留めする方法',
        body:
          '1. ホームページまたはヘッダーの検索欄に2文字以上入力します。少し待つと結果が表示されます。\n2. 一覧から場所を選ぶと都市ページが開きます。\n3. 「あなたの場所にピン留め」をタップして保存します。同じメニューから後で解除したり、ホームのグリッドから都市を削除したりできます。\n\nピン留めした場所はホームの「あなたの場所」に表示されます。最大10件までピン留めできます。都市ページのURLは /city/london-GB-51.5073 のような形式です。',
      },
      {
        id: 'city-limit',
        title: '10都市の上限',
        body:
          '「あなたの場所」にはピン留めした都市を最大10件まで登録できます。上限に達している場合は、別の都市をピン留めする前に1件削除してください。',
      },
      {
        id: 'first-visit',
        title: 'Cookie、広告、テーマ',
        body:
          '初回訪問時、バナーでストレージと広告の扱いを選べます：\n\n• すべて受け入れる — 便利な機能と広告\n• 機能のみ受け入れる — 広告なしの便利な機能\n• 必須のみ — サイト動作に必要な最低限\n• 設定を管理 — カテゴリを自分で選ぶ\n\n「すべて受け入れる」は Google Analytics や任意の利用状況分析をオンにしません — 提供されている場合は設定で Analytics を別途オンにしてください。\n\nフローティングの設定コントロール（歯車）から Cookie 設定を再度開けます。このコントロールは下にスクロールすると非表示になることがあり、端末が動きの削減を要求している場合は非表示になることもあります。テーマ（ライト／ダーク）には専用のフローティングコントロールがあります。',
      },
      {
        id: 'navigation',
        title: '次に読むページ',
        body:
          'ダッシュボードはホームページの説明です。都市詳細は予報タブを扱います。購読はメールダイジェストとアラートです。収益化と同意は広告とプライバシー選択の説明です。後半のページ（予報とキャッシュ、APIリファレンス、デプロイ）は主にサイト運営者向けです。',
      },
      {
        id: 'operators',
        title: 'サイト運営者向け',
        body:
          'ライブ天気にはサーバー上の OPENWEATHER_API_KEY が必要です。メール、cron、AdSense は任意です。SQLite（better-sqlite3）が共有キャッシュと利用制限を保持します。npm run verify で lint、テスト、ビルドを実行。管理：/login でサインイン後 /admin を開く。Dev bypass は NODE_ENV=development、ALLOW_DEV_ADMIN_BYPASS=1、ADMIN_SECRET 未設定のときのみ。CMS 編集ドキュメントはファイル既定にリセットするまで差異がある場合があります。ローカル docs サブドメイン：docs.localhost:3000。',
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
        title: 'ホームページで見えるもの',
        body:
          '上から順に：\n\n1. ヒーロー — 歓迎文、検索、現在地のクイック天気確認。\n2. あなたの場所 — ピン留めした場所の天気カード。\n3. 近くと人気 — 2列：「お近く」と「人気の検索」。\n4. 「あなたの場所」下のダッシュボード広告（プレースホルダーまたは AdSense）。\n5. Journal — 記事カルーセル。\n\nNEXT_PUBLIC_SHOW_HOME_STRETCH=0 で広告と Journal を非表示にできます。',
      },
      {
        id: 'cards',
        title: '場所カード',
        body:
          '各カードに地名、気温、天候、アイコン、体感温度、湿度、風が表示されます。カードをタップすると都市の詳細ページが開きます。読み込み中はプレースホルダー、取得失敗時は再試行と削除が表示されます。',
      },
      {
        id: 'forecast-strip',
        title: '7日間ストリップ',
        body:
          'メイン表示の下に、各カードに7日間の見通し（曜日、アイコン、最高・最低）が表示されます。現在の天候と見通しは同時に読み込まれるため、二段階で待つ必要はありません。',
      },
      {
        id: 'card-actions',
        title: '購読と削除',
        body:
          '購読では、その都市の週次ダイジェストと天気アラートのメール設定を開きます。削除は「あなたの場所」から都市を外し、この端末に保存された天気も消します。その都市のメールアラートが残っている場合、それも解除するか確認されます。',
      },
      {
        id: 'states',
        title: '空のダッシュボード',
        body:
          'ピン留めした都市がないとき、グリッドは都市ページから最初の場所を検索してピン留めする方法を案内します。',
      },
      {
        id: 'refresh',
        title: 'いつ更新されるか',
        body:
          '既定では「あなたの場所」はこの端末に保存された直近の読み取りを優先します。カードの更新をタップすると新しい取得を行います（保存がない新規都市も自動取得）。現在の UI に設定 → 天気のスイッチはありません。',
      },
      {
        id: 'recent-checks',
        title: 'お近くと人気の検索',
        body:
          'お近く — 自宅や地域周辺の場所と現在の天候。これは「過去の検索履歴」ではありません。\n\n人気の検索 — このサイトで多くの人が検索した場所、最大5枚のカード。静かな、または新しいインストールでは、実際の検索が溜まるまでデモ都市が数件表示されることがあります。\n\n座標がある場合、カードから都市ページへリンクします。詳細は「近くと人気」を参照。',
      },
      {
        id: 'operators',
        title: 'サイト運営者向け',
        body:
          'Home stretch（ダッシュボード AdSlot + Journal）：NEXT_PUBLIC_SHOW_HOME_STRETCH=1。API に行がないときのデモ人気都市：SHOW_DEMO_POPULAR_SEARCHES（既定オン；NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 で無効）。人気検索 API：GET /api/recent-checks（limit 20、source popular|empty）。お近くはこの API を使いません。seed スクリプト npm run seed:checks は weather_snapshots のみ — 人気の検索は埋めません。',
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
        title: '都市ページを開く',
        body:
          '検索結果とホームのカードからその場所のページが開きます。閲覧のためにピン留めは不要です。ピン留めはホームの「あなたの場所」に追加するだけです。いくつかのショーケース都市とサイトが既知の場所は常に開きます。未知の住所は案内付きの空状態または 404 です。',
      },
      {
        id: 'tabs',
        title: '予報タブ',
        body:
          'タブで切り替え：\n\n• 今日 — 現在の天候とクイック情報\n• 時間別 — これからの数時間\n• 10日間 — 長めの見通し\n• 履歴 — 保存がある過去の日\n\nタブを開くリンクを共有できます（例：?tab=hourly）。アラートがあるとき、ページ上部に最大3件の天気アラートバナーが表示されることがあります。タブの下に広告ユニットがある場合があります。',
      },
      {
        id: 'header',
        title: '上部の地図または写真',
        body:
          '既定ではヘッダーに衛星地図が表示されます。運営者は場所の写真に切り替え可能（利用可能な写真プロバイダー、なければシンプルなブランド画像）。地図背景がオフのとき、任意の Street View は運営者設定です。',
      },
      {
        id: 'today',
        title: '今日',
        body:
          '現在の気温と天候、指標タイル（湿度、風など）、詳細用の展開セクション。利用可能なら当日残りの時間別プレビュー。',
      },
      {
        id: 'hourly',
        title: '時間別',
        body:
          '今後12時間：気温、降水確率、風を一覧で。',
      },
      {
        id: 'daily',
        title: '10日間',
        body:
          '最大10日分の最高／最低、天候、降水確率、風、UV。日を選ぶとグラフがその日にフォーカスします。',
      },
      {
        id: 'history',
        title: '履歴',
        body:
          '保存された観測がある過去の日、日選択とグラフ付き。',
      },
      {
        id: 'subscribe',
        title: 'ピン留めとメール',
        body:
          'オプションメニューから「あなたの場所にピン留め」または、この場所の週次ダイジェストと天気アラートの購読ができます。',
      },
      {
        id: 'operators',
        title: 'サイト運営者向け',
        body:
          'resolveCity() は常に5つの PLATFORM_SHOWCASE_CITIES（London、Dubai、New York、Tokyo、Sydney）と city_slug 行を返す。既定ヒーロー：isCityHeroOsmEnabled() のとき OSM（NEXT_PUBLIC_CITY_HERO_OSM 未設定または "0" 以外）；OSM オフ時は写真（Unsplash → Wikimedia → Pexels）。Street View オプトイン：NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 と Maps キー。クライアント batch：current、hourly、daily のみ — minutely UI なし。履歴：GET /api/weather/history。初回 successful current 取得でサイトマップ／SEO 用に indexable 化される場合あり。',
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
        title: 'メール更新（任意）',
        body:
          'ログインなしで meridian にメール送信を依頼できます。製品ニュースレター、ピン留め都市の週次ダイジェスト、条件が合ったときの天気アラートから選べます。すべてオプトイン。各メールに停止方法があります。',
      },
      {
        id: 'types',
        title: '登録できるもの',
        body:
          '• ニュースレター — 製品更新（通常フッターフォーム）。\n• 週次ダイジェスト — フォローする都市の定期サマリー。\n• 天気アラート — 選んだアラート種別が都市で発火したときのメール（雨、風、雪、公式警報など）。\n\n天気カードの購読または都市ページのオプションメニューから管理できます。',
      },
      {
        id: 'subscribe-ui',
        title: '購読の手順',
        body:
          'メールを入力し、週次ダイジェストやアラートを選び、必要なアラート種別を選択（またはすべて有効）。アラート種別は後から変更可能。1つのメールアドレスで週次ダイジェストは最大20地点まで。既に購読済みの場合、ボタンは「購読済み」または「管理」と表示されることがあります。',
      },
      {
        id: 'unsubscribe',
        title: 'メールを止める',
        body:
          '購読メール内の配信停止リンクを使用してください。「あなたの場所」から都市を削除するとき、その都市のメールも解除するか確認されることがあります。',
      },
      {
        id: 'operators',
        title: 'サイト運営者向け',
        body:
          '匿名 meridian:client-id がブラウザと SQLite 購読を紐付け。API：GET/POST/DELETE/PATCH /api/subscriptions（PATCH は alertPrefs 更新）。配信はアクティブコネクタ（Resend、SendGrid、SES、SMTP）。コネクタなしでは行は保存されるが送信は { sent: false }。配信停止リンク用に NEXT_PUBLIC_APP_URL を設定。Cron：GET /api/cron/weekly-digests と /api/cron/weather-alerts、Bearer CRON_SECRET。アラートは OpenWeather 条件、Open-Meteo 公式警報、有効時 NWS を統合；subscription_send_log で dedup。MAX_WEEKLY_DIGEST_LOCATIONS = 20。',
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
        title: '現時点では全員無料',
        body:
          'meridian は無料の天気サイトとして動作します。広告を外す有効な Premium 決済や有料プランはありません。広告は広告同意を許可し、運営者が Google AdSense を設定した場合のみ表示されます。',
      },
      {
        id: 'consent-model',
        title: 'プライバシーの選択',
        body:
          '初回訪問バナーで選択：\n\n• すべて受け入れる — 便利な機能と広告\n• 機能のみ受け入れる — 広告なしの便利な機能\n• 必須のみ — サイト動作の基本\n• 設定を管理 — カテゴリを自分でオン／オフ\n\nカテゴリの簡単な説明：\n• 機能 — 訪問間でこの端末の天気を記憶；許可すれば精密位置の補助\n• 広告 — 設定時の Google 広告\n• Analytics — 任意の利用測定と設定時の Google Analytics（「すべて受け入れる」ではオンにならない）\n\nフローティング設定が利用可能なとき、後から設定 → Cookie で変更できます（スクロールで非表示になることがあり、動きの削減時はオフラインのことがあります）。',
      },
      {
        id: 'adsense',
        title: '表示されうる広告',
        body:
          '広告が許可され AdSense が設定されている場合、ホームヒーロー、「あなたの場所」の下（stretch オン時）、都市ページタブの下、一部 Journal レイアウトに広告が出ることがあります。広告未設定または広告を拒否した場合は、ライブ広告の代わりにブランドプレースホルダーが表示されます。',
      },
      {
        id: 'analytics',
        title: '利用状況の測定',
        body:
          'Analytics をオンにすると、どのページが閲覧されたかなどのシンプルなファーストパーティ利用を記録し、設定時は Google Analytics を読み込むことがあります。広告スロットの表示カウントにも広告同意が必要です。Analytics を拒否するとこれらのローダーはオフのままです。',
      },
      {
        id: 'data',
        title: 'データは販売しません',
        body:
          'meridian は個人データを販売しません。将来の有料データ製品には明確な告知と新たな同意が必要です。',
      },
      {
        id: 'operators',
        title: 'サイト運営者向け',
        body:
          'ティアはハードコードで無料；meridian:tier 未使用；PremiumGate / minutely UI 未接続。AdSense：GOOGLE_ADSENSE_CLIENT_ID および GOOGLE_ADSENSE_SLOT_DASHBOARD、GOOGLE_ADSENSE_SLOT_HERO、GOOGLE_ADSENSE_SLOT_RECENT、GOOGLE_ADSENSE_SLOT_CITY_DETAIL、GOOGLE_ADSENSE_SLOT_DEFAULT。アクティブ AdSlot：dashboard、hero、city-detail；recent-checks 配置にホーム UI なし。プレースホルダー：public/ads/*.png（sr-only overlay）。Analytics：SiteAnalyticsBeacon + consent.analytics 時 POST /api/analytics/collect；GA4 は NEXT_PUBLIC_GA_MEASUREMENT_ID + 同じ同意。Stripe 未実装。',
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
        title: 'アイコンについて',
        body:
          'カードと予報の天気画像は、はっきりした線／塗りつぶしアイコン（Bas Milius の Meteocons、MIT ライセンス）です。晴れ、曇り、雨、雪、霧などを文字説明の横に示します — 画像が読み込めなくても意味はテキストが担います。',
      },
      {
        id: 'accessibility',
        title: 'アクセシビリティ',
        body:
          'アイコンは画面上の文言を補助します。状態の説明が見える場合、画像は装飾として扱われます。そうでない場合は説明から短い代替テキストを提供します。',
      },
      {
        id: 'operators',
        title: 'サイト運営者向け',
        body:
          'アセットは public/weather-icons/（典型的な checkout で約35 SVG）。scripts/copy-weather-icons.mjs が postinstall / npm run copy:icons で @meteocons/svg-static から32の一意名をコピー；フォルダに余分（例：sunrise、sunset、horizon）があっても METRIC_METEOCON エイリアス経由でマップ。マッピング：src/features/weather/utils/weather-icon.js（OPENWEATHER_TO_METEOCON）。コンポーネント：WeatherIcon.jsx。帰属：public/weather-icons/ATTRIBUTION.txt。テスト：weather-icon.test.js。',
      },
    ],
  },
  {
    slug: 'recent-checks',
    title: '近くと人気',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'purpose',
        title: 'ホームの2列',
        body:
          '「あなたの場所」の下に、ホームには短い場所リストが2列あります。\n\nお近く — 自宅や地域近くの提案場所とライブ天候。検索したすべての私的ログではありません。\n\n人気の検索 — このサイトでよく検索される場所。これもサイト全体の話で、「個人の履歴」ではありません。',
      },
      {
        id: 'ui',
        title: 'カードの動作',
        body:
          '各列に最大5枚、アイコン、気温、説明、地名。座標があるとき、カードタップで都市ページを開きます。',
      },
      {
        id: 'demo-empty',
        title: '新規インストールで人気の検索が賑やかに見えるとき',
        body:
          'まだ誰もほとんど検索していない場合、列を空にしないよう人気の検索に有名なデモ都市を数件表示することがあります。運営者はそのデモリストをオフにできます。お近くは引き続き位置情報と近隣データに依存します。',
      },
      {
        id: 'operators',
        title: 'サイト運営者向け',
        body:
          '人気検索データ：GET /api/recent-checks → getRecentChecksPayload() → location_weather_checks の listPopularSearchChecks（triggers search_select / search_preview）、default limit 20、source popular|empty。API 自体は showcase を hydrate しない。\n\nUI デモフォールバック：API が空で SHOW_DEMO_POPULAR_SEARCHES が true（既定；NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 で無効）のとき、人気の検索は PLATFORM_SHOWCASE_CITIES から埋まる。\n\nお近く：ホーム位置プロファイルの近隣場所 + current 天気 batch — recent-checks API ではない。\n\nnpm run seed:checks は L2 キャッシュデモ用に North England の weather_snapshots を書き込む；検索トリガー check 行は挿入せず、単独では人気の検索を埋めない。',
      },
    ],
  },
  {
    slug: 'forecasts',
    title: '予報とキャッシュ',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'このページの対象',
        body:
          '一般訪問者はスキップして構いません。meridian を運用・統合する人向けに、天気データの保存と更新の仕組みを説明します。平易に言うと：ブラウザは直近の読み取りを覚え、サーバーも共有読み取りを覚えるので、クリックのたびに天気プロバイダーを呼びません。',
      },
      {
        id: 'scopes',
        title: '天気スコープ',
        body:
          'クライアント要求可能スコープ：current（現在）、hourly（タイムライン）、daily（タイムライン）、minutely（降水 — API のみ；都市詳細は現時点で minutely を読み込まない）。サーバーのみ：geocode（都市検索キャッシュ、キー geocode:{query}）、alert（個別アラート payload）。各天気スコープのキャッシュキーは {lat},{lon},{scope}；geocode はクエリ文字列。',
      },
      {
        id: 'layers',
        title: 'キャッシュ層',
        body:
          'L0 — ブラウザ localStorage meridian:weather-cache、構造 {cityId: {scope: {payload, fetchedAt}}}（書き込みは機能同意が必要）。L1 — サーバープロセスのインメモリ Map。L2 — fetched_at、expires_at、stale_until 付き SQLite weather_snapshots。クライアントは L0 を読んでから API；サーバーは L1 → L2 → upstream OpenWeather。',
      },
      {
        id: 'freshness',
        title: '鮮度状態',
        body:
          'fresh — expires_at 以内。acceptable — expires 超過だが stale_until 以内（配信可）。expired — stale_until 超過、クォータが許せば upstream 発火。emergency — クォータブロックだが期限切れ／acceptable の L2 スナップショットを配信しユーザーにデータを見せる。',
      },
      {
        id: 'ttl-table',
        title: 'TTL 既定（SCOPE_TTL）',
        body:
          'current — fresh 1h、stale 2h（platform_settings.refresh_interval_ms と stale_cache_max_ms で上書き；管理画面で 10m–2h）。hourly — fresh 2h、stale 6h。daily — fresh 6h、stale 12h。minutely — fresh 15m、stale 30m。geocode — fresh 7d、stale 30d。alert — fresh 1h、stale 6h。',
      },
      {
        id: 'upstream',
        title: 'OpenWeather 連携',
        body:
          '主：One Call API 4.0（onecall/current、timeline/1h、timeline/1day、timeline/1min）。current スコープは One Call current 失敗時 API 2.5 /weather にフォールバック。Geocode は OpenWeather geocoding API（limit 5）。src/lib/one-call.js で正規化し UI payload を統一。',
      },
      {
        id: 'batch',
        title: 'バッチ取得',
        body:
          'POST /api/weather/batch は { cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? } を受け付ける。スコープは都市ごと（city.scopes）、トップレベル scopes 配列ではない。ダッシュボードは current + daily を1バッチで（requestIdleCallback なし）。都市詳細は current + hourly + daily のみ。ハンドラはバースト制限回避のため都市間を約100ms 空ける。',
      },
      {
        id: 'headers',
        title: 'レスポンスメタデータ',
        body:
          'API レスポンスに meta：cacheLayer（memory、database、upstream）、freshness、fetchedAt、ageMs、upstreamCallAvoided、source。X-Cache ヘッダーは該当時 hit/miss を反映。「X 前に更新」は meta.fetchedAt を使用。',
      },
      {
        id: 'quota',
        title: 'クォータとの関係',
        body:
          '日次または分間制限超過時、upstream 呼び出しは止まり、利用可能なら emergency stale L2 を返す。TTL 内に同じ都市を再オープンしても upstream 呼び出しはゼロ。',
      },
      {
        id: 'logging',
        title: 'キャッシュヒットログ',
        body:
          'L2 DB キャッシュヒットは api_call_log に cache_hit=1 で記録し、日次 upstream カウンタは増やさない。L1 メモリヒットは配信するが SQLite には意図的に永続化しない — SSR/クライアント再マウントのたびに発火し、file watcher 下で meridian.db を churn させる。',
      },
      {
        id: 'payload-fields',
        title: 'current payload フィールド',
        body:
          'temperature、feelsLike、description、condition、icon（OpenWeather code）、humidity、pressure、dewPoint、uvi、clouds、visibility、windSpeedKmh、windGustKmh、windDeg、sunrise、sunset、alertIds、city、country、timezone、updatedAt、source。',
      },
    ],
  },
  {
    slug: 'api-limits',
    title: 'API制限',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'このページの対象',
        body:
          'サイト運営者向けです。閲覧された天気データは共有・キャッシュ向きにし、OpenWeather 無料枠（既定1000回/日）の消費を抑えます。',
      },
      {
        id: 'quota',
        title: '日次・分間クォータ',
        body:
          'constants/weather.js の既定：DAILY_LIMIT 1000、WARNING_THRESHOLD 800、SOFT_BLOCK_THRESHOLD 950、PER_MINUTE_LIMIT ローリング1分あたり60 upstream 呼び出し。platform_settings が daily_limit、soft_block_threshold、warning_threshold、per_minute_limit を上書き可能（初回 DB オープンで seed）。カウンタは UTC 深夜にリセット。',
      },
      {
        id: 'status',
        title: 'ステータス値',
        body:
          'ok — 警告閾値未満。warning — warning_threshold 以上（既定800回/今日）。soft_block — soft_block_threshold 以上（既定950）；upstream ブロック。hard_block — daily_limit（既定1000）。直近60秒で per_minute_limit 回あった場合、分間上限も upstream をブロック。',
      },
      {
        id: 'cache-hits',
        title: 'キャッシュヒット vs upstream',
        body:
          'L2 DB ヒットは api_call_log に cache_hit=1 で記録し日次 upstream カウンタは増やさない。L1 メモリヒットは SQLite に記録しない — meta.layer が memory のとき recordCacheHit は早期 return。クォータにカウントするのは成功した upstream OpenWeather 呼び出し（status 200、cache_hit=0）のみ。ブロック時 emergency stale は upstream を避ける。',
      },
      {
        id: 'admin-shortcut',
        title: '管理診断',
        body:
          '/admin（ログイン後）で本日の使用量／日次上限、残り、ステータス、更新間隔設定。API：GET /api/admin/usage。',
      },
      {
        id: 'admin-api',
        title: '管理 API',
        body:
          'GET /api/admin/usage — クォータスナップショットと最近の呼び出し。GET|PATCH /api/admin/config — 主管理設定 API（更新間隔、コネクタ、ダイジェスト既定、AdSense、アラートトグルなど）。狭いレガシー：PATCH /api/admin/settings { refreshIntervalMs }。認証：/login 後 HttpOnly セッション cookie meridian_admin_session。署名シークレットは ADMIN_SECRET（ADMIN_PASSWORD ではない）。Dev bypass：NODE_ENV=development、ALLOW_DEV_ADMIN_BYPASS=1、ADMIN_SECRET unset。',
      },
      {
        id: 'openweather',
        title: 'OpenWeather プロバイダ制限',
        body:
          'meridian は独自 upstream カウンタを追跡；OpenWeather も独立してレート制限やキー拒否（401、429）の可能性。オーケストレーターはこれをクライアント向け構造化 API エラーにマップ。',
      },
      {
        id: 'emergency',
        title: '緊急モード',
        body:
          'soft/hard block 時も、座標にスナップショットが一度もなければ除き、ユーザーは freshness emergency とマークされた最後の acceptable SQLite スナップショットを見る（空白エラーではない）。',
      },
    ],
  },
  {
    slug: 'api-reference',
    title: 'APIリファレンス',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'overview',
        title: '概要',
        body:
          'meridian API を統合する開発者・運営者向け — 一般訪問者はスキップ可。全 API ルートは src/app/api/ 下の Next.js App Router ハンドラ。天気と geocode は OPENWEATHER_API_KEY 必須。Cron ルートは Authorization: Bearer CRON_SECRET。管理ルートは /login 後の認証済み管理セッション cookie（meridian_admin_session）、開発時は ALLOW_DEV_ADMIN_BYPASS を除く。',
      },
      {
        id: 'weather',
        title: 'GET /api/weather',
        body:
          'Query：lat、lon、scope（current|hourly|daily|minutely）、任意 trigger、lang。天気 payload と fetchedAt、cacheHit、freshness、source、trigger、tokensUsed を返す。X-Cache ヘッダーはキャッシュ層を反映。エラー：400 invalid params、404 location not found、429 rate_limited、502 upstream_error または service_unavailable。',
      },
      {
        id: 'weather-batch',
        title: 'POST /api/weather/batch',
        body:
          'Body：{ cities: [{ lat, lon, scopes?: string[], id?, lang?, maxAgeMs?, trigger? }], trigger?, lang? }。{ cities: [{ lat, lon, scopes: { scope: { data, meta } | { error } } }] } を返す。スコープは都市ごと、トップレベル配列ではない。IP あたり20リクエスト/分。ダッシュボードと都市詳細フックが使用。',
      },
      {
        id: 'weather-history',
        title: 'GET /api/weather/history',
        body:
          'Query：lat、lon、任意 from/to（ISO 日付）、limit。weather_observations と weather_forecast_archive から { summary, observations, forecasts: { hourly, daily } } を返す。',
      },
      {
        id: 'geocode',
        title: 'GET /api/geocode',
        body:
          'Query：q（最低2文字）、任意 context パラメータ。正規化配列：name、country、state、lat、lon、label。upstream limit 5。geocode スコープで L2 キャッシュ。IP あたり60リクエスト/分。',
      },
      {
        id: 'recent-checks',
        title: 'GET /api/recent-checks',
        body:
          'パラメータなし。{ checks, source } を返す。source は検索トリガー行があるとき popular、なければ empty。既定 limit 20、location_weather_checks を検索量でランク（search_select と search_preview triggers）。API に showcase フォールバックなし — SHOW_DEMO_POPULAR_SEARCHES オンならホーム UI は空時にデモ人気都市を表示しうる。お近く列はこのルートを使わない。',
      },
      {
        id: 'subscriptions',
        title: '/api/subscriptions',
        body:
          'GET ?clientId= — クライアントのアクティブ購読一覧。POST — 作成 { clientId, email, type, cityName?, cityLat?, cityLon?, frequency?, alertOnRain?, alertOnStorm?, alertPrefs? }。PATCH — city_alerts 行の alertPrefs 更新 { clientId, id, alertPrefs }。DELETE — body { clientId, cityLat, cityLon, types[] }。Types：newsletter、city_weekly、city_alerts。',
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
          '正規化アラート：id、senderName、event、start、end、description。ソース：キャッシュされた alert スコープ。',
      },
      {
        id: 'cron',
        title: 'Cron ルート',
        body:
          'GET /api/cron/weekly-digests — 購読者メールごとに週次ダイジェストを送信。GET /api/cron/weather-alerts — alertPrefs を OpenWeather、Open-Meteo、NWS フィードと照合しアラートメール送信。両方 Bearer CRON_SECRET 必須。',
      },
      {
        id: 'admin',
        title: '管理ルート',
        body:
          '利用と設定：GET /api/admin/usage；GET|PATCH /api/admin/config；レガシー PATCH /api/admin/settings { refreshIntervalMs }。ユーザーと認証：GET|POST /api/admin/users；POST /api/admin/users/invite；GET /api/admin/me。データ：GET /api/admin/checks；GET /api/admin/locations；GET|PATCH /api/admin/subscriptions；GET /api/admin/mailing-summary；GET /api/admin/analytics。コネクタ：GET|PATCH /api/admin/connections；GET|PATCH /api/admin/openweather-key；GET|PATCH /api/admin/email-key。メール CMS：GET|POST|PATCH /api/admin/email-templates；POST /api/admin/email/test、/compose、/sync。AdSense：GET /api/admin/adsense/report；POST /api/admin/adsense/sync；OAuth GET /api/admin/adsense/oauth/start、/callback、/disconnect。CMS：GET|PATCH /api/admin/cms-pages。dev bypass を除きすべて meridian_admin_session 必須。',
      },
      {
        id: 'ads',
        title: '広告ルート',
        body:
          'GET /api/ads/config — { scriptEnabled, clientId, consentRequired }。GET /api/ads?placement=dashboard|hero|recent-checks|city-detail — 設定時 slotId 付き配置設定。GET /api/ads/placeholder-bg — プレースホルダー面用ヒーロー lookup。App ルート GET /ads.txt — env から AdSense パブリッシャー行。アクティブ AdSlot 配置：dashboard、hero、city-detail。recent-checks スロット env はあるがホームに AdSlot なし。',
      },
      {
        id: 'other',
        title: 'その他の公開ルート',
        body:
          'GET /api/platform/limits — 公開クォータスナップショット。POST /api/analytics/collect — ファーストパーティ analytics beacon。GET /api/location/region — IP/地域ヘルパー。POST /api/weather/inaccurate-report — 不正確データの報告。GET /api/weather/map-tile/[layer]/[z]/[x]/[y] — OSM ヒーローオーバーレイタイル。Auth：POST /api/auth/login、/logout；POST /api/auth/forgot-password；POST /api/auth/reset-password/[token]；GET|POST /api/auth/invite/[token]；GET /api/auth/session。',
      },
      {
        id: 'errors',
        title: 'エラー形式',
        body:
          'JSON エラーは通常 { error: code, message: string }。ApiError コードに invalid_request、service_unavailable、location_not_found、rate_limited、upstream_error、unauthorized、not_found、limit_reached。',
      },
    ],
  },
  {
    slug: 'deployment',
    title: 'デプロイと環境',
    lastUpdated: '2026-07-15',
    sections: [
      {
        id: 'audience',
        title: 'このページの対象',
        body:
          'meridian をデプロイする人向け。一般訪問者には不要な設定です。動作デモには OPENWEATHER_API_KEY のみ；それ以外は任意の stretch。',
      },
      {
        id: 'env-required',
        title: '必須環境',
        body:
          'OPENWEATHER_API_KEY — 天気と geocode に必須。DATABASE_PATH — SQLite ファイル（既定 ./data/meridian.db）；本番では永続ボリュームでキャッシュと購読が再起動後も残ること。NEXT_PUBLIC_SHOW_HOME_STRETCH=0 でダッシュボード広告 + Journal を非表示（既定オン）。NEXT_PUBLIC_SHOW_DEMO_POPULAR_SEARCHES=0 で API 空時のデモ人気都市を無効。',
      },
      {
        id: 'env-hero',
        title: 'ヒーロー画像環境',
        body:
          'UNSPLASH_ACCESS_KEY — 任意；場所ヒーローの第一写真プロバイダー（サーバーのみ、hero_image_cache にキャッシュ）。PEXELS_API_KEY — Unsplash と Wikimedia Commons の後の第三プロバイダー。NEXT_PUBLIC_CITY_HERO_OSM — 0 で衛星地図ヘッダー無効（既定オン）。NEXT_PUBLIC_CITY_HERO_STREET_VIEW=1 — OSM オフ時の Google Street View オプトイン。NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — Street View iframe 用任意 Maps Embed API キー。',
      },
      {
        id: 'env-email',
        title: 'メール環境',
        body:
          'platform_settings のアクティブコネクタ経由のマルチ ESP（管理画面選択）：Resend（RESEND_API_KEY、RESEND_FROM_EMAIL）、SendGrid（SENDGRID_API_KEY、SENDGRID_FROM_EMAIL）、Amazon SES（AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEY、AWS_SES_REGION、AWS_SES_FROM_EMAIL）、SMTP（SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASSWORD、SMTP_FROM_EMAIL、SMTP_SECURE）。NEXT_PUBLIC_APP_URL — メール内配信停止リンクのベース URL（.env.example に記載；本番必須）。',
      },
      {
        id: 'env-cron',
        title: 'Cron と管理',
        body:
          'CRON_SECRET — /api/cron/* 用 Bearer（本番で unset なら拒否）。ADMIN_SECRET — 管理セッション cookie 署名とコネクタシークレット暗号化。ADMIN_PASSWORD — ADMIN_EMAIL のみの root ログイン。Dev bypass は NODE_ENV=development、ALLOW_DEV_ADMIN_BYPASS=1、ADMIN_SECRET unset のときのみ。docs/SECURITY.md 参照。外部で cron スケジュール：weekly-digests（例：月曜朝）、weather-alerts（例：15–30分ごと）。',
      },
      {
        id: 'env-adsense',
        title: 'AdSense 環境',
        body:
          'GOOGLE_ADSENSE_CLIENT_ID（ca-pub-…）。GOOGLE_ADSENSE_SLOT_DASHBOARD、SLOT_HERO、SLOT_RECENT、SLOT_CITY_DETAIL、SLOT_DEFAULT — ディスプレイユニット ID。AdSense Management API OAuth：GOOGLE_ADSENSE_OAUTH_CLIENT_ID、GOOGLE_ADSENSE_OAUTH_CLIENT_SECRET、任意 GOOGLE_ADSENSE_OAUTH_REDIRECT_URI（既定 ${NEXT_PUBLIC_APP_URL}/api/admin/adsense/oauth/callback）。クライアント ID はホストシークレットのみ。/ads.txt は実行時にクライアント ID から生成。',
      },
      {
        id: 'env-analytics',
        title: 'Analytics 環境',
        body:
          'NEXT_PUBLIC_GA_MEASUREMENT_ID — consent.analytics オン時の任意 GA4 ローダー。NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION — Search Console メタタグ。',
      },
      {
        id: 'scripts',
        title: 'npm スクリプト',
        body:
          'dev、build、start — Next.js。lint、test、test:watch、verify — 品質ゲート（verify = lint + test + build）。copy:icons — Meteocons を public へ（postinstall も）。seed:checks — North England デモスナップショット。backfill:city-slugs — 既存 locations に city_slug を投入。email — React Email プレビューサーバー。audit:deps — npm audit --omit=dev。',
      },
      {
        id: 'sqlite',
        title: 'SQLite テーブル',
        body:
          'コア天気：weather_snapshots、api_call_log。場所と checks：locations、location_weather_checks、weather_observations、weather_forecast_archive。購読：subscriptions、subscription_send_log。プラットフォーム：platform_settings（シングルトン）。ヒーロー：hero_image_cache。収益化：adsense_report_snapshots。Analytics：site_analytics_events。メール/CMS：email_templates、cms_pages。管理：admin_users、admin_invites、admin_password_resets、admin_audit_log。スキーマは src/lib/db/index.js。初回オープンで platform_settings を refresh 1h、stale 2h、daily limit 1000、soft block 950、warning 800、per-minute 60 で seed。',
      },
      {
        id: 'middleware',
        title: 'Middleware',
        body:
          'src/middleware.js が docs.localhost ホストをローカルドキュメントサブドメイン用に /docs へリライト。メインアプリルートに auth middleware なし。',
      },
      {
        id: 'localstorage-keys',
        title: 'ブラウザストレージキー',
        body:
          'storage-keys.js より：meridian:client-id、meridian:saved-cities、meridian:checked-cities、meridian:user-location、meridian:weather-cache、meridian:theme、meridian:cookie-consent、meridian:subscriptions、meridian:tier（予約）、meridian:consent、meridian:accessibility、meridian:city-detail-accordion、meridian:temperature-unit、meridian:preferred-locale、meridian:weather-refresh-mode。sessionStorage meridian_analytics_sid — ファーストパーティ analytics セッション ID。管理 cookie meridian_admin_session（HttpOnly、サーバー設定）。カスタムイベント meridian:storage が書き込み後にフックを同期。',
      },
    ],
  },
];
