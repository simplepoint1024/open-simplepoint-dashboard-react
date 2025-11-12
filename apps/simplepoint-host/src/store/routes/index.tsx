import type {ItemType} from "antd/es/menu/interface";

export type MenuItemType = ItemType & Record<string, any>;

export interface MenuInfo {
  id?: string | number;
  path?: string;
  parent?: string;
  authority?: string;
  title?: string;
  label?: string;
  icon?: string;
  danger?: boolean;
  type?: 'group' | 'divider' | 'submenu' | 'item';
  disabled?: boolean;
  component?: string;
  sort?: number;
  children?: MenuInfo[];
}

// 判断是否存在子节点
export const hasChildren = (node?: MenuInfo) => Array.isArray(node?.children) && node!.children!.length > 0;

// 扁平化树形菜单（返回所有叶子节点）
export const flattenMenus = (nodes: MenuInfo[] = []): MenuInfo[] => {
  const res: MenuInfo[] = [];
  const dfs = (arr: MenuInfo[]) => {
    arr.forEach(n => {
      if (hasChildren(n)) {
        dfs(n!.children!);
      } else {
        res.push(n);
      }
    });
  };
  dfs(nodes);
  return res;
};
