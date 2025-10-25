import { TableButtonProps } from "../../components/Table";
import {get, useData} from "../api/methods";
import {RJSFSchema} from "@rjsf/utils";
import { createIcon } from "../types/icon";

export type TableSchemaProps = {
  schema: RJSFSchema
  buttons: TableButtonProps[]
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

    // 2. 排序并处理 Buttons
    let processedButtons = res.buttons;
    if (Array.isArray(res.buttons)) {
      processedButtons = [...res.buttons]
        .sort((a, b) => {
          const s1 = typeof a.sort === 'number' ? a.sort : Number.POSITIVE_INFINITY;
          const s2 = typeof b.sort === 'number' ? b.sort : Number.POSITIVE_INFINITY;
          return s1 - s2;
        })
        .map(btn => ({
          ...btn,
          icon: btn.icon && typeof btn.icon === 'string' ? createIcon(btn.icon) : btn.icon,
        }));
    }

    return { ...res, schema: sortedSchema, buttons: processedButtons };
  });
}