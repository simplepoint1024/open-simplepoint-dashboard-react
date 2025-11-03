export const jaJP = {
  'common': {
    'app.title': 'Simple·Point プラットフォーム',
    'error.remoteLoadFail': 'リモートリソースの読み込みに失敗しました。しばらくしてから再試行してください。',
    'error.404': 'ページが存在しません',
    'error.requestFailed': 'リクエストに失敗しました',
    'error.networkError': 'ネットワークエラー',

    'nav.refresh': '現在のページを更新',
    'nav.closeLeft': '左側をすべて閉じる',
    'nav.closeRight': '右側をすべて閉じる',
    'nav.clear': 'キャッシュをクリア',
    'nav.closeAll': 'すべて閉じる',

    'greeting.early': '深夜おはようございます！',
    'greeting.morning': 'おはようございます！',
    'greeting.afternoon': 'こんにちは！',
    'greeting.evening': 'こんばんは！',

    'dashboard.welcomeTitle': 'Simple·Point へようこそ',
    'dashboard.welcomeSub': 'こちらはシステム概要です。現在の稼働状況とよく使う機能を素早く把握できます。',
    'dashboard.stats.totalUsers': '総ユーザー数',
    'dashboard.stats.activeSessions': 'アクティブセッション',
    'dashboard.stats.successRate': 'API成功率',
    'dashboard.stats.errors': 'エラー数',
    'dashboard.vsYesterday': '昨日比',

    'dashboard.health.title': 'システムの健全性',
    'dashboard.health.authService': '認証サービス',
    'dashboard.health.authService.desc': '正常に応答しています',
    'dashboard.health.gateway': 'ゲートウェイ',
    'dashboard.health.gateway.desc': '遅延がやや高めです',
    'dashboard.health.mq': 'メッセージキュー',
    'dashboard.health.mq.desc': 'スループットは正常です',
    'dashboard.health.storage': 'ストレージ',
    'dashboard.health.storage.desc': '残容量が少なくなっています',
    'dashboard.health.status.ok': '正常',
    'dashboard.health.status.warn': '注意',
    'dashboard.health.status.error': '異常',

    'dashboard.activities.title': '最近のアクティビティ',
    'dashboard.activity.tag.change': '変更',
    'dashboard.activity.tag.task': 'タスク',
    'dashboard.activity.tag.permission': '権限',
    'dashboard.activity.tag.system': 'システム',
    'dashboard.activity.1.title': '新しいアプリ @simplepoint-common を追加',
    'dashboard.activity.1.ts': '5 分前',
    'dashboard.activity.2.title': '国際化辞書を 134 件同期',
    'dashboard.activity.2.ts': '20 分前',
    'dashboard.activity.3.title': 'ユーザー jack に ROLE_ADMIN を付与',
    'dashboard.activity.3.ts': '1 時間前',
    'dashboard.activity.4.title': 'サービス micro-auth のヘルスチェックが成功',
    'dashboard.activity.4.ts': '2 時間前',

    'dashboard.quick.title': 'クイックアクセス',
    'dashboard.quick.users': 'ユーザー管理',
    'dashboard.quick.clients': 'アプリ管理',
    'dashboard.quick.services': 'マイクロサービス',
    'dashboard.quick.i18n': '国際化',

    'form.submit': '送信',
    'form.required': 'これは必須項目です',
    'form.minLength': '長さは {limit} 文字以上である必要があります',
    'form.maximum': '{limit} を超えてはいけません',
    'form.invalid': '無効な入力です',
    'form.jsonInvalid': 'JSON形式が正しくありません',
    'form.passwordMismatch': 'パスワードが一致しません',

    'tools.fullscreen.enter': '全画面表示にする',
    'tools.fullscreen.exit': '全画面表示を終了する',
    'tools.fullscreen.notAllowed': '現在の環境では全画面表示がサポートされていないか、ブラウザによりブロックされています',
    'tools.clearCache': 'キャッシュをクリア',
    'tools.clearCacheConfirm': 'グローバルキャッシュをクリアしてもよろしいですか？',
    'tools.clearDone': 'グローバルキャッシュをクリアしました',

    'ok': '確認',
    'cancel': 'キャンセル'

  },
  'table': {
    'table.confirmDeleteTitle': '削除の確認',
    'table.confirmDeleteContent': '選択された {count} 件のデータを削除してもよろしいですか？',
    'table.deleteSuccess': '削除に成功しました',
    'table.deleteFail': '削除に失敗しました: {msg}',
    'table.editSuccess': '編集に成功しました',
    'table.addSuccess': '追加に成功しました',
    'table.actionFail': '操作に失敗しました: {msg}',
    'table.loadFail': '読み込みに失敗しました',
    'table.checkAll': 'すべて選択',

    'table.filter.equals': '完全一致',
    'table.filter.notEquals': '完全一致しない',
    'table.filter.like': '部分一致',
    'table.filter.notLike': '部分一致しない',
    'table.filter.in': '集合に含まれる',
    'table.filter.notIn': '集合に含まれない',
    'table.filter.between': '範囲内',
    'table.filter.notBetween': '範囲外',
    'table.filter.greater': 'より大きい',
    'table.filter.less': 'より小さい',
    'table.filter.ge': '以上',
    'table.filter.le': '以下',
    'table.filter.isNull': '空',
    'table.filter.greaterOrEqual': '以上',
    'table.filter.lessOrEqual': '以下',
    'table.filter.null': '空',
    'table.filter.notNull': '空ではない',

    'table.button.add': '追加',
    'table.button.edit': '編集',
    'table.button.delete': '削除',

  },
  'profile': {
    // 个人资料 Profile
    'profile.basic': '基本情報',
    'profile.saveSuccess': '保存に成功しました',
    'profile.noEmail': 'メールアドレスが未登録です',

    'field.username': 'ユーザー名',
    'field.nickname': 'ニックネーム',
    'field.email': 'メールアドレス',
    'field.phone': '電話番号',
    'field.roles': 'ロール',
    'field.joinedAt': '参加日時',

    'rule.nickname': 'ニックネームを入力してください',
    'rule.email': 'メールアドレスの形式が正しくありません',

    'ph.nickname': 'ニックネームを入力してください',
    'ph.email': 'メールアドレスを入力してください',
    'ph.phone': '電話番号を入力してください',

    'user.defaultName': 'ユーザー',

    'group.account': 'アカウント',
    'group.app': 'アプリケーション',

  },
  'settings': {
    'settings.appearance': '外観設定',
    'settings.theme': 'テーマモード',
    'settings.system': 'システムに従う',
    'settings.size': 'グローバルサイズ',
    'settings.light': 'ライト',
    'settings.dark': 'ダーク',
    'settings.i18n': '国際化',
    'settings.language': 'インターフェース言語',
    'settings.preview': 'プレビュー効果',
    'settings.about': 'このアプリについて',
    'settings.themeUpdated': 'テーマが更新されました',
    'settings.sizeUpdated': 'サイズが更新されました',
    'settings.langUpdated': '言語が更新されました',
    'settings.resetApplied': 'デフォルトの外観設定に戻しました',
    'settings.resetLangApplied': 'デフォルト言語（簡体字中国語）に戻しました',
    'settings.sampleItem': 'サンプル項目',
    'settings.sampleDesc': 'これはサンプルの説明です',

    'size.small': '小',
    'size.middle': '中',
    'size.large': '大',

    'about.version': 'バージョン',
    'about.license': 'ライセンス',
    'about.repo': 'リポジトリ',
    'about.ui': 'UI',
    'about.licenseValue': 'Apache-2.0 ライセンス',

    'label.language': '言語',
    'tooltip.size': 'グローバルサイズを切り替え（小／中／大）',

  },
  'menu': {
    'menu.dashboard': 'ダッシュボード',
    'menu.profile': 'プロフィール',
    'menu.billing': '請求情報',
    'menu.settings': 'システム設定',
    'menu.logout': 'ログアウト',

// routes メニューキー補完
    'menu.i18n': '国際化管理',
    'menu.i18n.countryRange': '国と地域',
    'menu.i18n.message': '国際化メッセージ',

// 新規 routes 用キー
    'menu.i18n.countries': '国管理',
    'menu.i18n.regions': '地域管理',
    'menu.i18n.timezones': 'タイムゾーン管理',
    'menu.i18n.languages': '言語管理',
    'menu.i18n.namespace': '国際化ネームスペース',

    'menu.monitoring': '監査とモニタリング',
    'menu.monitoring.loginLog': 'ログインログ',
    'menu.monitoring.operationLog': '操作ログ',

    'menu.ops': 'システム保守',
    'menu.ops.microService': 'マイクロサービス管理',
    'menu.ops.microPlugin': 'プラグインマーケット',
    'menu.ops.microApplication': 'マイクロアプリ管理',

    'menu.system': 'システム構成',
// 新規 routes 用キー
    'menu.system.permission': '権限管理',
    'menu.system.oauthClient': 'クライアント管理',
    'menu.system.client': 'アプリ管理',
    'menu.system.endpoints': 'エンドポイント管理',
    'menu.system.role': 'ロール管理',
    'menu.system.auth': '認可管理',
    'menu.system.field': 'フィールド権限',
    'menu.system.data': 'データ権限',
    'menu.system.menu': 'メニュー管理',
    'menu.system.user': 'ユーザー管理'

  },
  'users': {
    'users.title.address': '住所',
    'users.description.address': '連絡先住所',
    'users.title.birthdate': '生年月日',
    'users.description.birthdate': 'ユーザーの生年月日',
    'users.title.email': 'メールアドレス',
    'users.description.email': 'ユーザーのメールアドレス',
    'users.title.enabled': '有効',
    'users.description.enabled': '有効かどうか',
    'users.title.familyName': '姓',
    'users.description.familyName': 'ユーザーの姓',
    'users.title.givenName': '名',
    'users.description.givenName': 'ユーザーの名',
    'users.title.middleName': 'ミドルネーム',
    'users.description.middleName': 'ユーザーのミドルネーム',
    'users.title.nickname': 'ニックネーム',
    'users.description.nickname': 'ユーザーのニックネーム',
    'users.title.password': 'パスワード',
    'users.description.password': 'ログインパスワード',
    'users.title.phoneNumber': '電話番号',
    'users.description.phoneNumber': 'ユーザーの電話番号',
    'users.title.picture': 'プロフィール画像',
    'users.description.picture': 'ユーザーのプロフィール画像',
    'users.title.profile': '個人プロフィール',
    'users.description.profile': 'ユーザーの個人ホームページリンク',
    'users.title.superAdmin': 'スーパー管理者',
    'users.description.superAdmin': 'スーパー管理者かどうか',
    'users.title.username': 'ユーザー名',
    'users.description.username': 'ログインユーザー名',

  },
  'menus': {
    'menus.title.component': 'コンポーネント',
    'menus.description.component': 'バインドされたコンポーネント識別子またはパス',

    'menus.title.danger': '危険フラグ',
    'menus.description.danger': 'このメニュー項目を危険スタイルで表示するかどうか',

    'menus.title.disabled': '無効',
    'menus.description.disabled': 'このメニュー項目が無効かどうか',

    'menus.title.icon': 'アイコン',
    'menus.description.icon': 'メニューアイコンの名称',

    'menus.title.label': 'ラベル',
    'menus.description.label': 'メニューの表示名',

    'menus.title.path': 'パス',
    'menus.description.path': 'ルーティングパスまたは外部リンク',

    'menus.title.sort': '並び順',
    'menus.description.sort': '表示順（数値が小さいほど前に表示）',

    'menus.title.title': 'タイトル',
    'menus.description.title': 'メニューまたはページのタイトル',

    'menus.title.type': 'タイプ',
    'menus.description.type': 'メニューの種類（ディレクトリ／グループ／項目など）',
  },
  'roles': {
    'roles.title.authority': '権限識別子',
    'roles.title.authority.desc': 'システム認可検証に使用される一意の識別子',

    'roles.title.description': '説明',
    'roles.title.description.desc': 'このロールの簡単な説明',

    'roles.title.priority': '優先度',
    'roles.title.priority.desc': '数値が大きいほど優先度が高い',

    'roles.title.roleName': 'ロール名',
    'roles.title.roleName.desc': '例：スーパー管理者',

  },
  'permissions': {
    'permissions.title.authority': '権限識別子',
    'permissions.description.authority': '権限文字列（例：system:user:read）',

    'permissions.title.method': 'HTTP メソッド',
    'permissions.description.method': 'HTTP メソッド（例：GET／POST）',

    'permissions.title.resource': 'リソースパス',
    'permissions.description.resource': '保護されたリソースのパス',

    'permissions.title.permissionName': '権限名',
    'permissions.description.permissionName': '権限の表示名',

  },
  'clients': {
    'clients.title.authorizationGrantTypes': '認可グラントタイプ',
    'clients.description.authorizationGrantTypes': 'クライアントがサポートする認可タイプ',

    'clients.title.clientAuthenticationMethods': 'クライアント認証方式',
    'clients.description.clientAuthenticationMethods': 'クライアントと認可サーバー間の認証方式',

    'clients.title.clientId': 'クライアントID',
    'clients.description.clientId': 'クライアントの一意な識別子',

    'clients.title.clientIdIssuedAt': '発行日時',
    'clients.description.clientIdIssuedAt': 'クライアントIDの発行日時',

    'clients.title.clientName': 'クライアント名',
    'clients.description.clientName': '識別しやすい名称',

    'clients.title.clientSecret': 'クライアントシークレット',
    'clients.description.clientSecret': 'クライアント認証に使用されるシークレット',

    'clients.title.clientSecretExpiresAt': 'シークレット有効期限',
    'clients.description.clientSecretExpiresAt': 'クライアントシークレットの有効期限',

    'clients.title.clientSettings': 'クライアント設定',
    'clients.description.clientSettings': 'クライアントに関連する設定（JSON）',

    'clients.title.postLogoutRedirectUris': 'ログアウト後リダイレクトURI',
    'clients.description.postLogoutRedirectUris': 'ログアウト後にリダイレクトされるURI（カンマ区切り）',

    'clients.title.redirectUris': 'リダイレクトURI',
    'clients.description.redirectUris': '認可フローのリダイレクトURI（カンマ区切り）',

    'clients.title.scopes': 'スコープ',
    'clients.description.scopes': 'クライアントが要求する権限範囲',

    'clients.title.tokenSettings': 'トークン設定',
    'clients.description.tokenSettings': 'トークンに関連する設定（JSON）',

  },
  'countries': {
    'countries.title.currencyCode': '通貨コード',
    'countries.description.currencyCode': 'その国／地域で使用される ISO 通貨コード',

    'countries.title.currencyName': '通貨名',
    'countries.description.currencyName': 'その国／地域で使用される通貨の名称',

    'countries.title.currencySymbol': '通貨記号',
    'countries.description.currencySymbol': '一般的な通貨記号（例：￥／$）',

    'countries.title.timezone': 'デフォルトタイムゾーン',
    'countries.description.timezone': 'その国／地域のデフォルトタイムゾーン',

    'countries.title.enabled': '有効かどうか',
    'countries.description.enabled': 'システムでその国／地域を有効にするかどうか',

    'countries.title.flagIcon': '国旗アイコン',
    'countries.description.flagIcon': '国旗アイコンまたはシンボル',

    'countries.title.isoCode2': 'ISO-2 国コード',
    'countries.description.isoCode2': 'ISO 3166-1 Alpha-2 コード',

    'countries.title.isoCode3': 'ISO-3 国コード',
    'countries.description.isoCode3': 'ISO 3166-1 Alpha-3 コード',

    'countries.title.nameEnglish': '英語名',
    'countries.description.nameEnglish': '国／地域の英語名称',

    'countries.title.nameNative': '現地名',
    'countries.description.nameNative': '国／地域の現地言語による名称',

    'countries.title.numericCode': '数値コード',
    'countries.description.numericCode': 'ISO 3166-1 数値コード',

    'countries.title.phoneCode': '国際電話コード',
    'countries.description.phoneCode': '国／地域の国際電話コード',

  },
  'regions': {
    'regions.title.code': '地域コード',
    'regions.description.code': '地域の一意なコード',

    'regions.title.countryCode': '国コード',
    'regions.description.countryCode': '所属する国／地域のコード',

    'regions.title.level': '階層',
    'regions.description.level': '行政階層（省／市／区など）',

    'regions.title.nameEnglish': '英語名',
    'regions.description.nameEnglish': '地域の英語名称',

    'regions.title.nameNative': '現地名',
    'regions.description.nameNative': '地域の現地言語による名称',

    'regions.title.parentCode': '上位コード',
    'regions.description.parentCode': '親地域のコード',

    'regions.title.postalCode': '郵便番号',
    'regions.description.postalCode': '地域の郵便番号',

  },
  'timezones': {
    'timezones.title.countryCode': '国コード',
    'timezones.description.countryCode': 'このタイムゾーンが属する国／地域のコード',

    'timezones.title.enabled': '有効かどうか',
    'timezones.description.enabled': 'このタイムゾーンをシステムで有効にするかどうか',

    'timezones.title.isDst': '夏時間',
    'timezones.description.isDst': '夏時間かどうか',

    'timezones.title.nameEnglish': '英語名',
    'timezones.description.nameEnglish': 'タイムゾーンの英語名称',

    'timezones.title.nameNative': '現地名',
    'timezones.description.nameNative': 'タイムゾーンの現地言語による名称',

    'timezones.title.timezoneCode': 'タイムゾーンコード',
    'timezones.description.timezoneCode': 'IANA タイムゾーンコード（例：Asia/Shanghai）',

    'timezones.title.utcOffset': 'UTC オフセット',
    'timezones.description.utcOffset': 'UTC との時間差（例：+08:00）',

  },
  'namespaces': {
    'namespaces.title.code': 'ネームスペースコード',
    'namespaces.description.code': 'ネームスペースの一意な識別子',

    'namespaces.title.description': '説明',
    'namespaces.description.description': 'ネームスペースの説明情報',

    'namespaces.title.module': '所属モジュール',
    'namespaces.description.module': '関連する機能モジュールまたはアプリケーション',

    'namespaces.title.name': '名称',
    'namespaces.description.name': 'ネームスペースの名称',

  },
  'languages': {
    'languages.title.code': '言語コード',
    'languages.description.code': '一意の言語コード（例：zh-CN）',

    'languages.title.dateFormat': '日付フォーマット',
    'languages.description.dateFormat': 'この言語で使用される日付の形式',

    'languages.title.description': '説明',
    'languages.description.description': '言語項目の説明情報',

    'languages.title.enabled': '有効かどうか',
    'languages.description.enabled': 'この言語をシステムで有効にするかどうか',

    'languages.title.locale': 'ロケール',
    'languages.description.locale': '言語ロケール識別子（例：en-US／ja-JP）',

    'languages.title.nameEnglish': '英語名',
    'languages.description.nameEnglish': '言語の英語名称',

    'languages.title.nameNative': '現地名',
    'languages.description.nameNative': '言語の現地名称',

    'languages.title.textDirection': '文字方向',
    'languages.description.textDirection': '文字の書き方向（LTR／RTL）',

  },
  'messages': {
    'messages.title.code': 'メッセージキー',
    'messages.description.code': '国際化メッセージのキー名',

    'messages.title.description': '説明',
    'messages.description.description': 'このメッセージキーの説明',

    'messages.title.global': 'グローバルキー',
    'messages.description.global': 'グローバルで表示可能なメッセージキーかどうか',

    'messages.title.locale': '言語',
    'messages.description.locale': 'メッセージが属する言語',

    'messages.title.message': 'メッセージ内容',
    'messages.description.message': '国際化メッセージの具体的な内容',

    'messages.title.namespace': 'ネームスペース',
    'messages.description.namespace': 'メッセージキーが属するネームスペース',

  }
}