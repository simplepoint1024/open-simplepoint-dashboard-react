import { TableButtonProps } from "../../components/Table";
import {get, useData} from "../api/methods";
import {RJSFSchema} from "@rjsf/utils";
import { createIcon } from "../types/icon";

export type TableSchemaProps = {
  schema: RJSFSchema
  buttons: TableButtonProps[]
}

// 读取全局 i18n.t（不依赖 React Hook）
function getGlobalT(): ((key: string, fallback?: string, params?: Record<string, any>) => string) | undefined {
  try { return (typeof window !== 'undefined' ? (window as any)?.spI18n?.t : undefined); } catch { return undefined; }
}

const isI18nStr = (v: any): v is string => typeof v === 'string' && v.startsWith('i18n:');
const resolveI18nStr = (v: any): string => {
  if (!isI18nStr(v)) return v;
  const key = String(v).slice(5);
  const t = getGlobalT();
  return t ? t(key, key) : key;
};

// 规范化/递归处理 schema：
// - 将 title/description 支持 i18n: 前缀
// - 若存在 schema 字段（后端误用），则在缺失 title 时作为 title 的后备，并同样支持 i18n:
function normalizeSchemaI18n(node: any): any {
  if (!node || typeof node !== 'object') return node;
  if (typeof node.title === 'string') node.title = resolveI18nStr(node.title);
  if (typeof node.description === 'string') node.description = resolveI18nStr(node.description);
  if (typeof (node as any).schema === 'string') {
    const val = resolveI18nStr((node as any).schema);
    if (!node.title) node.title = val;
  }
  if (node.properties && typeof node.properties === 'object') {
    Object.values(node.properties).forEach((child: any) => normalizeSchemaI18n(child));
  }
  if (node.items) normalizeSchemaI18n(node.items);
  return node;
}

/**
 * 获取并排序表单/表格的 schema 和 buttons
 * @param baseUrl 接口基础路径
 */
export function useSchema(baseUrl: string) {
  return useData(`${baseUrl}/schema`, async () => {
    const res = await get<TableSchemaProps>(`${baseUrl}/schema`);
    if (!res) return res;

    // 1. 排序 Schema
    let sortedSchema = res.schema;
    if (res.schema) {
      const s = res.schema as any;

      const sortArraySchema = (arr: any[]) =>
        [...arr].sort((a, b) => {
          const o1 = (a as any)?.['x-order'];
          const o2 = (b as any)?.['x-order'];
          const n1 = typeof o1 === 'number' ? o1 : Number.POSITIVE_INFINITY;
          const n2 = typeof o2 === 'number' ? o2 : Number.POSITIVE_INFINITY;
          if (n1 !== n2) return n1 - n2;
          const k1 = (a as any).name ?? (a as any).key ?? (a as any).id ?? '';
          const k2 = (b as any).name ?? (b as any).key ?? (b as any).id ?? '';
          return String(k1).localeCompare(String(k2));
        });

      const sortObjectProperties = (obj: Record<string, any>) => {
        const entries = Object.entries(obj).sort(([k1, v1], [k2, v2]) => {
          const o1 = (v1 as any)?.['x-order'];
          const o2 = (v2 as any)?.['x-order'];
          const n1 = typeof o1 === 'number' ? o1 : Number.POSITIVE_INFINITY;
          const n2 = typeof o2 === 'number' ? o2 : Number.POSITIVE_INFINITY;
          if (n1 !== n2) return n1 - n2;
          return String(k1).localeCompare(String(k2));
        });
        return entries.reduce((acc: Record<string, any>, [k, v]) => {
          acc[k] = v;
          return acc;
        }, {});
      };

      if (Array.isArray(s)) {
        sortedSchema = sortArraySchema(s);
      } else if (s && typeof s === 'object' && s.properties) {
        const newProps = sortObjectProperties(s.properties);
        sortedSchema = { ...(s as object), properties: newProps };
      }
    }

    // 1.1 递归解析 schema 的 i18n/title/description/schema
    sortedSchema = normalizeSchemaI18n(sortedSchema);

    // 2. 排序并处理 Buttons
    let processedButtons = res.buttons;
    if (Array.isArray(res.buttons)) {
      processedButtons = [...res.buttons]
        .sort((a, b) => {
          const s1 = typeof a.sort === 'number' ? a.sort : Number.POSITIVE_INFINITY;
          const s2 = typeof b.sort === 'number' ? b.sort : Number.POSITIVE_INFINITY;
          return s1 - s2;
        })
        .map(btn => {
           const titleRaw = (btn as any).title;
           const textRaw = (btn as any).text;
           let title = titleRaw;
           let text = textRaw;
           if (isI18nStr(titleRaw)) title = resolveI18nStr(titleRaw);
           if (isI18nStr(textRaw)) text = resolveI18nStr(textRaw);
           // 若仅提供了 title，用作文本回退
           const finalText = text ?? title;
           return {
             ...btn,
             title,
             text: finalText,
             icon: btn.icon && typeof btn.icon === 'string' ? createIcon(btn.icon) : btn.icon,
           } as TableButtonProps as any;
        });
    }

    return { ...res, schema: sortedSchema, buttons: processedButtons };
  });
}