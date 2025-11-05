import { TableButtonProps } from "../../components/Table";
import { get, useData } from "../api/methods";
import { RJSFSchema } from "@rjsf/utils";
import { createIcon } from "../types/icon";

export type TableSchemaProps = {
  schema: RJSFSchema;
  buttons: TableButtonProps[];
};

// 获取全局 i18n.t（不依赖 React Hook）
function getGlobalT(): ((key: string, fallback?: string, params?: Record<string, unknown>) => string) | undefined {
  try {
    return typeof window !== "undefined" ? (window as any)?.spI18n?.t : undefined;
  } catch {
    return undefined;
  }
}

function isI18nReady(): boolean {
  const g = typeof window !== "undefined" ? (window as any)?.spI18n : undefined;
  return !!(g?.t && g?.messages && Object.keys(g.messages).length > 1);
}

const isI18nStr = (v: unknown): v is string => typeof v === "string" && v.startsWith("i18n:");

const resolveI18nStr = (v: unknown): string => {
  if (!isI18nStr(v)) return String(v);
  const key = v.slice(5);
  const t = getGlobalT();
  return t?.(key, key) ?? key;
};

function normalizeSchemaI18n(node: any): any {
  if (!node || typeof node !== "object") return node;

  if (typeof node.title === "string") node.title = resolveI18nStr(node.title);
  if (typeof node.description === "string") node.description = resolveI18nStr(node.description);

  if (typeof node.schema === "string" && !node.title) {
    node.title = resolveI18nStr(node.schema);
  }

  if (node.properties && typeof node.properties === "object") {
    Object.values(node.properties).forEach((child: any) => normalizeSchemaI18n(child));
  }

  if (node.items) normalizeSchemaI18n(node.items);

  return node;
}

function sortArraySchema(arr: any[]): any[] {
  return [...arr].sort((a, b) => {
    const o1 = a?.["x-order"];
    const o2 = b?.["x-order"];
    const n1 = typeof o1 === "number" ? o1 : Number.POSITIVE_INFINITY;
    const n2 = typeof o2 === "number" ? o2 : Number.POSITIVE_INFINITY;
    if (n1 !== n2) return n1 - n2;
    const k1 = a.name ?? a.key ?? a.id ?? "";
    const k2 = b.name ?? b.key ?? b.id ?? "";
    return String(k1).localeCompare(String(k2));
  });
}

function sortObjectProperties(obj: Record<string, any>): Record<string, any> {
  const entries = Object.entries(obj).sort(([k1, v1], [k2, v2]) => {
    const o1 = v1?.["x-order"];
    const o2 = v2?.["x-order"];
    const n1 = typeof o1 === "number" ? o1 : Number.POSITIVE_INFINITY;
    const n2 = typeof o2 === "number" ? o2 : Number.POSITIVE_INFINITY;
    if (n1 !== n2) return n1 - n2;
    return k1.localeCompare(k2);
  });

  return Object.fromEntries(entries);
}

function normalizeButtonI18n(btn: TableButtonProps): TableButtonProps {
  const title = isI18nStr(btn.title) ? resolveI18nStr(btn.title) : btn.title;
  const text = isI18nStr(btn.text) ? resolveI18nStr(btn.text) : btn.text ?? title;
  const icon = typeof btn.icon === "string" ? createIcon(btn.icon) : btn.icon;

  return { ...btn, title, text, icon };
}

export function useSchema(baseUrl: string) {
  return useData(`${baseUrl}/schema`, async () => {
    const res = await get<TableSchemaProps>(`${baseUrl}/schema`);
    if (!res) return res;

    // 排序 schema
    let sortedSchema = res.schema;
    if (Array.isArray(sortedSchema)) {
      sortedSchema = sortArraySchema(sortedSchema);
    } else if (sortedSchema?.properties) {
      sortedSchema = {
        ...sortedSchema,
        properties: sortObjectProperties(sortedSchema.properties),
      };
    }

    // 国际化 schema
    sortedSchema = normalizeSchemaI18n(sortedSchema);

    // 排序并处理按钮
    const processedButtons = Array.isArray(res.buttons)
      ? res.buttons
        .sort((a, b) => {
          const s1 = typeof a.sort === "number" ? a.sort : Number.POSITIVE_INFINITY;
          const s2 = typeof b.sort === "number" ? b.sort : Number.POSITIVE_INFINITY;
          return s1 - s2;
        })
        .map(normalizeButtonI18n)
      : [];
    // 等待 i18n 准备完成（最多等待 10 秒）
    const maxWait = 1500;
    const interval = 100;
    let waited = 0;
    while (!isI18nReady() && waited < maxWait) {
      await new Promise((r) => setTimeout(r, interval));
      waited += interval;
    }
    return { ...res, schema: sortedSchema, buttons: processedButtons };
  });
}
