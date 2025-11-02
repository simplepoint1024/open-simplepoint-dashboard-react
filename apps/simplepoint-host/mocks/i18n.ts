import {http, HttpResponse} from 'msw';
import {zhCN} from './local/zh-CN';
import {enUS} from './local/en-US';
import {jaJP} from './local/ja-JP';

export const apis = [
  // 语言列表
  http.get('/common/i18n/languages/mapping', () => {
    return HttpResponse.json([
      {code: 'zh-CN', name: '中文（简体）'},
      {code: 'en-US', name: 'English'},
      {code: 'ja-JP', name: '日本語'},
    ]);
  }),

  // 指定语言的消息键值对（支持可选命名空间 ns=profile,settings）
  http.get('/common/i18n/messages/mapping', ({request}) => {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'zh-CN';
    const nsParam = url.searchParams.get('ns');
    const nsList = nsParam ? nsParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    const dict = locale === 'en-US' ? enUS : locale === 'ja-JP' ? jaJP : zhCN;

    if (!nsList || nsList.length === 0) {
      return HttpResponse.json(dict);
    }

    // 命名空间前缀映射
    const nsMap: Record<string, string[]> = {
      profile: ['profile.', 'field.', 'rule.', 'ph.', 'user.'],
      settings: ['settings.', 'size.', 'about.', 'label.language', 'tooltip.size'],
      common: ['app.', 'error.', 'nav.', 'greeting.', 'dashboard.', 'form.', 'table.', 'tools.', 'ok', 'cancel'],
      form: ['form.'],
      table: ['table.'],
      menu: ['menu.'],
      clients: ['clients.'],
      users: ['users.'],
      permissions: ['permissions.'],
    };
    const allowPrefixes = nsList.flatMap(name => nsMap[name] || [`${name}.`]);
    const filtered: Record<string, string> = {};
    Object.keys(dict).forEach((k) => {
      if (allowPrefixes.some(p => k.startsWith(p))) filtered[k] = (dict as any)[k];
    });
    return HttpResponse.json(filtered);
  }),
];

export default apis;
