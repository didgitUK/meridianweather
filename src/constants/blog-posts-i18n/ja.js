/** Japanese journal posts — same ids/hrefs/imageUrls as HOME_BLOG_POSTS. */
export const BLOG_POSTS_I18N = [
  {
    id: 'reading-hourly-forecasts',
    title: '時間別予報を迷わず読む方法',
    excerpt:
      '気温・降水確率・突風が毎時届く — 午後の計画で最初に見るべきもの。',
    category: 'ガイド',
    dateLabel: '2026年7月12日',
    dateIso: '2026-07-12',
    href: '/journal/reading-hourly-forecasts',
    imageUrl:
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: '海岸風景の雲間から差し込む陽光',
    body: [
      '時間帯の帯は一見忙しいです。各列に気温、空のアイコン、降水確率、しばしば風が重なります。コツは、午後が外出か移動か在宅かを決め、その計画を変える列だけを読むことです。',
      'まず降水確率と強度を一緒に見てください。弱い霧雨の 40％は散歩をほとんど壊しませんが、強いシャワーなら別です。次に単峰ではなく次の 4〜6 時間の気温トレンドを見る：暖かい昼のあとの冷え込みは、絶対最高気温より夕方計画に効きます。',
      '突風が第三のフィルタです。持続的なそよ風と、自転車やむき出しの岸での鋭い突風は感覚が違います。meridian ではまず densified な next-hour 行を眺め、長い窓が必要なら hourly タブへ。',
      '数字がまだ騒がしく感じたら、ひとつの判断 — 15 時までに出るか待つ — を選び、「今以降どの時間がその判断を明確に壊すか」と問いかけてください。残りは読まなくて大丈夫です。',
    ],
  },
  {
    id: 'ten-day-outlook',
    title: '10 日アウトルックが教えてくれること・教えてくれないこと',
    excerpt:
      '先に行くほど信頼は落ちます。meridian が近い詳細と OpenWeather 無料枠の先の推定日をどう示すか。',
    category: '予報',
    dateLabel: '2026年7月10日',
    dateIso: '2026-07-10',
    href: '/journal/ten-day-outlook',
    imageUrl:
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: '夜の都市スカイライン上の雷',
    body: [
      '10 日ビューは荷造りや週末計画に便利ですが契約ではありません。モデルは 9 日目より 2 日目で一致しやすく、無料上流フィードは高解像度 10 日分までは届かないことがよくあります。',
      'meridian では近い日は One Call フィードの詳細が濃いです。遠い日は、カレンダー構造のための拡張日次地平線を使いつつ、OpenWeather の無料窓が実際に返す内容に正直でいます。',
      '遠い端は方向として扱い、今日より暖かいか寒いか、湿り気のパターンかどうか — 細かいシャワー時刻としては見ないでください。予約になる直前に近くで再読み込みを。',
      '都市詳細は Today / Hourly / Daily を分けて、使える確信度にズームしてから、週の大まかな感覚だけでよいときは長いリボンに戻れます。',
    ],
  },
  {
    id: 'pinning-locations',
    title: 'ダッシュボードに大切な都市をピン留めする',
    excerpt:
      '世界中どこでも確認し、短いリストをローカル保存し、ライブ状況を一目で — アカウント不要。',
    category: 'プロダクト',
    dateLabel: '2026年7月8日',
    dateIso: '2026-07-08',
    href: '/journal/pinning-locations',
    imageUrl:
      'https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: '都市ピンのある旅行地図',
    body: [
      'Meridian は本当に気になる短いリスト — 自宅、職場、家族、次の旅 — 向けで、第二の天気 SNS ではありません。世界の都市を検索し、詳細を開き、Your Locations にピン留めします。',
      'ピンはブラウザの localStorage にあります。無料枠デモとして正直：アカウント壁なし、同じ端末のリロード後にリストが戻ります。サイトデータを消すとピンも消える — このスタックでは意図的です。',
      'Recent checks はピンの横にあり、一度きりの検索で保存ボードが散らかないようにしています。今いる場所を中心にしたいときはヒーローの Allow Location を使い、それ以外で常時表示したいものをピン留めします。',
      'カードが古く見えたらページ全体ではなくその都市を更新 — レート制限を意識してキャッシュし、共有 OpenWeather キーがデモ日を持ちこたえるようにしています。',
    ],
  },
  {
    id: 'alerts-digests',
    title: 'メール・ダイジェストと深刻な天気アラートの説明',
    excerpt:
      '静かな週の週間まとめ、閾値を超えたときの地点アラート — 受信箱を埋めない無料枠メール。',
    category: 'アラート',
    dateLabel: '2026年7月5日',
    dateIso: '2026-07-05',
    href: '/journal/alerts-digests',
    imageUrl:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: '劇的な嵐の光の下の山の稜線',
    body: [
      'すべての受信箱が昼のパルスを望むわけではありません。Meridian は穏やかなダイジェストと閾値アラートを分け、毎週まとめを購読しても毎午後の嵐劇に巻き込まれないようにします。',
      'ダイジェストはフォロー地点の短い見通しを集めます。アラートは雨・風・気温帯が設定線を超えたときに発火し、管理側 weather-check cron と同じ評価経路を使います。',
      '無料枠メールには送信上限があります。テンプレートは軽量、ショートコードが地点変数を埋め、コネクタは管理メールパネルで SMTP や API キーを差し替え、製品ページを書き換えずにデモできます。',
      '解除と正直な設定は内容と同じくらい重要です。うるさいと感じたら閾値を下げるかメーリングを一時停止し、製品自体を捨てないでください。',
    ],
  },
  {
    id: 'rate-limits',
    title: 'OpenWeather 無料枠の中に留まる',
    excerpt:
      'キャッシュ、更新窓、タブクリックごとに上流を叩かない理由 — 共有デモキー向けの現実的レート。',
    category: 'エンジニアリング',
    dateLabel: '2026年7月2日',
    dateIso: '2026-07-02',
    href: '/journal/rate-limits',
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: '抽象的な地球とデータネットワークの可視化',
    body: [
      'OpenWeather の無料枠は焦点の決まったデモには十分ですが、ホバーごとにネット呼び出しすると脆いです。Meridian はキーを共有予算として扱い、天気ペイロードをキャッシュし、更新をデバウンスし、単位やタブだけの変更はローカル整形します。',
      '都市カードと詳細は取得済みスナップショットを再利用します。条件が変わったと分かるとき手動更新；背景ポールは控えめにし、面接教室が昼前に日次枠を使い切らないようにします。',
      'ジオコードと One Call は実務上別カウント — 検索の誤入力でフル天気取得を溶かさない。上流失敗は黙ったリトライループではなく正直な UI エラーにします。',
      '重いフォークなら最初の強化は私有キー、強いサーバーキャッシュ、ショーケース・プリフェッチ削減 — このコードを形づくったレート制限意識の撤廃ではありません。',
    ],
  },
  {
    id: 'weather-icons',
    title: 'OpenWeather コードから meridian 上の Meteocons へ',
    excerpt:
      'ローカル SVG が速い理由、条件と指標アイコンの対応、上流シンボルが変わったときに見えるもの。',
    category: 'デザイン',
    dateLabel: '2026年6月28日',
    dateIso: '2026-06-28',
    href: '/journal/weather-icons',
    imageUrl:
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&h=675&q=80',
    imageAlt: '傘のある街の通りの雨',
    body: [
      '上流アイコンコードは有用なキーでありアートではありません。Meridian は OpenWeather 条件 ID をローカル Meteocon SVG にマップし、レチナでシャープなカードを保ち、アセットがキャッシュされればオフラインでも動きます。',
      '条件アイコン（晴れ、雨、雷）の横に湿度・風・UV・気圧の指標グリフがあります。どちらも `/public/weather-icons` に置き、都市カードごとの第三者 CDN を避けます。',
      'OpenWeather がコードを追加・改名したらマッピング層だけ更新 — UI は安定したローカル名を使い続けます。欠落コードは壊れた画像ではなく中立の cloudy に落ちます。',
      '目指すのはヒーロー・グリッド・都市詳細で同じ言語の一覧可能な天気 — OpenWeather ラスター・スプライトのピクセル完璧な複製ではありません。',
    ],
  },
];
