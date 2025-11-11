import { MenuInfo } from '@/store/routes';

export type MenuNode = MenuInfo & { children?: MenuNode[] };

export function flattenLeafRoutes(nodes: MenuNode[] = []): MenuNode[] {
  const res: MenuNode[] = [];
  const dfs = (arr: MenuNode[]) => {
    arr.forEach((n) => {
      const children = n.children as MenuNode[] | undefined;
      if (Array.isArray(children) && children.length > 0) {
        dfs(children);
      } else {
        res.push(n);
      }
    });
  };
  dfs(nodes);
  return res;
}

