import { TableButtonProps } from "../../components/Table";
import { get, useData } from "../api/methods";
import { RJSFSchema } from "@rjsf/utils";
import { createIcon } from "../types/icon";
import type { UseQueryOptions } from "@tanstack/react-query";

export type TableSchemaProps = {
  schema: RJSFSchema;
  buttons: TableButtonProps[];
};

const getGlobalT = () =>
  typeof window !== "undefined" ? (window as any)?.spI18n?.t : undefined;

const resolveI18nStr = (v: unknown): string => {
  if (typeof v !== "string" || !v.startsWith("i18n:")) return String(v);
  const key = v.slice(5);
  return getGlobalT()?.(key, key) ?? key;
};

const normalizeSchemaI18n = (node: any): any => {
  if (!node || typeof node !== "object") return node;

  ["title", "description"].forEach((k) => {
    if (typeof node[k] === "string") node[k] = resolveI18nStr(node[k]);
  });

  if (typeof node.schema === "string" && !node.title)
    node.title = resolveI18nStr(node.schema);

  if (node.properties)
    Object.values(node.properties).forEach(normalizeSchemaI18n);

  if (node.items) normalizeSchemaI18n(node.items);
  return node;
};

// Only sort by x-order; keep original relative order for ties or when x-order is undefined
const sortByOrder = <T extends Record<string, any>>(items: T[], _keyFn: (item: T) => string = () => "") =>
  [...items].sort((a, b) => {
    const o1 = typeof a["x-order"] === "number" ? a["x-order"] : Infinity;
    const o2 = typeof b["x-order"] === "number" ? b["x-order"] : Infinity;
    if (o1 < o2) return -1;
    if (o1 > o2) return 1;
    return 0; // stable sort preserves original order
  });

const sortObjectProperties = (obj: Record<string, any>) =>
  Object.fromEntries(sortByOrder(Object.entries(obj), ([k]) => k));

const normalizeButtonI18n = (btn: TableButtonProps): TableButtonProps => ({
  ...btn,
  title: resolveI18nStr(btn.title),
  text: resolveI18nStr(btn.text ?? btn.title),
  icon: typeof btn.icon === "string" ? createIcon(btn.icon) : btn.icon,
});

export function useSchema(
  baseUrl: string,
  options?: Omit<UseQueryOptions<TableSchemaProps, Error, TableSchemaProps, readonly unknown[]>, 'queryKey' | 'queryFn'>) {
  return useData(`${baseUrl}/schema`, async () => {
    const res = await get<TableSchemaProps>(`${baseUrl}/schema`);
    if (!res) return res;

    const schema = Array.isArray(res.schema)
      ? sortByOrder(res.schema, (item) => item.name ?? item.key ?? item.id ?? "")
      : {
        ...res.schema,
        properties: sortObjectProperties(res.schema.properties ?? {}),
      };

    const buttons = sortByOrder(res.buttons ?? []).map(normalizeButtonI18n);

    return {
      ...res,
      schema: normalizeSchemaI18n(schema),
      buttons,
    };
  }, options);
}
