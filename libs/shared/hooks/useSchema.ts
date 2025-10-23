import {get, useData} from "../api/methods";
import {RJSFSchema} from "@rjsf/utils";

export type TableSchemaProps = {
  schema: RJSFSchema
}

/**
 * 获取表单或表格的 schema
 * @param baseUrl 接口基础路径
 */
export function useSchema(baseUrl: string) {
  return useData(`${baseUrl}/schema`, async () => {
    const res = await get<TableSchemaProps>(`${baseUrl}/schema`);
    if (!res || !res.schema) return res;

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
      return { ...res, schema: sortArraySchema(s) };
    }

    if (s && typeof s === 'object') {
      const props = s.properties ?? {};
      const newProps = sortObjectProperties(props);
      return { ...res, schema: { ...(s as object), properties: newProps } };
    }

    return res;
  });
}