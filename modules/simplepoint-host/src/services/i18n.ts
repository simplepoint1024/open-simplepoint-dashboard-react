// 后端国际化服务封装
import { get } from '@simplepoint/libs-shared/api/methods';

export type Language = {
  code: string;   // 例如 zh-CN / en-US
  name: string;   // 展示名，例如 中文（简体）/ English
};

export type Messages = Record<string, string>;

// 获取可选语言列表
export async function fetchLanguages(): Promise<Language[]> {
  try {
    const data = await get<Language[]>('/i18n/languages');
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (_) {}
  // 兜底：最少提供中英文
  return [
    { code: 'zh-CN', name: '中文（简体）' },
    { code: 'en-US', name: 'English' },
  ];
}

// 获取指定语言的消息键值对
export async function fetchMessages(locale: string): Promise<Messages> {
  try {
    const data = await get<Messages>('/i18n/messages', { locale });
    if (data && typeof data === 'object') return data;
  } catch (_) {}
  // 兜底：返回空，让调用方使用 key 或默认文案
  return {};
}

