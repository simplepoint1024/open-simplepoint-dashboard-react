import {createIcon} from "@simplepoint/shared/types/icon.ts";
import {MenuInfo, MenuItemType} from "@/store/routes";
import {MenuProps} from "antd";
import {aboutMeItem, logoItem, toolsSwitcherGroupItem} from "@/layouts/navigation-bar/top-bar.tsx";
import I18nText from '@/i18n/Text';

/**
 * 基于拍平(parent)关系构建菜单（保持返回数据原始顺序）
 */
const buildMenusFromFlat = (
  menus: Array<MenuInfo>,
  navigate: (path: string) => void,
  parent: string | number | undefined = undefined,
): MenuItemType[] => {
  const siblings = menus
    .filter((m) => m.parent === parent);

  return siblings.map((menu) => {
    const children = buildMenusFromFlat(menus, navigate, menu.id);
    const existsChildren = children.length > 0;
    const keyText = (menu as any).title ?? (menu as any).label ?? '';
    const component: string | undefined = (menu as any).component ?? undefined;
    const isExternal = typeof component === 'string' && component.startsWith('external:');
    const externalUrl = isExternal ? component!.slice('external:'.length) : undefined;
    // @ts-ignore
    const menuItem: MenuItemType = {
      key: menu.id || (menu as any).path || keyText || "",
      label: <I18nText k={(menu as any).title || ''} fallback={(menu as any).label || ''} />,
      icon: (menu as any).icon ? createIcon((menu as any).icon) : undefined,
      type: (menu as any).type ?? undefined,
      danger: (menu as any).danger ?? undefined,
      disabled: (menu as any).disabled ?? undefined,
      component: component,
      ...(existsChildren ? {children} : {}),
      // 叶子节点点击：如为 external: 前缀，打开新标签；否则按 path 导航
      ...(!existsChildren ? {
        onClick: (_info?: any) => {
          if (isExternal && externalUrl) {
            try { window.open(externalUrl, '_blank', 'noopener,noreferrer'); } catch {}
            return;
          }
          if ((menu as any).path) navigate(`${(menu as any).path}`)
        }
      } : {})
    };
    return menuItem;
  });
};

/**
 * 基于树结构(children)构建菜单（保持返回数据原始顺序）
 */
const buildMenusFromTree = (
  nodes: Array<MenuInfo>,
  navigate: (path: string) => void,
): MenuItemType[] => {
  return ([...(nodes || [])] as any[])
    .map((menu: any) => {
      const rawChildren = menu.children as Array<MenuInfo> | undefined;
      const builtChildren = Array.isArray(rawChildren) && rawChildren.length > 0 ? buildMenusFromTree(rawChildren, navigate) : undefined;
      const existsChildren = !!builtChildren && builtChildren.length > 0;
      const keyText = menu.title ?? menu.label ?? '';
      const component: string | undefined = menu.component ?? undefined;
      const isExternal = typeof component === 'string' && component.startsWith('external:');
      const externalUrl = isExternal ? component!.slice('external:'.length) : undefined;
      // @ts-ignore
      const item: MenuItemType = {
        key: menu.uuid || menu.path || keyText || "",
        label: <I18nText k={menu.title || ''} fallback={menu.label || ''} />,
        icon: menu.icon ? createIcon(menu.icon) : undefined,
        type: menu.type ?? undefined,
        danger: menu.danger ?? undefined,
        disabled: menu.disabled ?? undefined,
        component: component ?? undefined,
        ...(existsChildren ? {children: builtChildren} : {}),
        ...(!existsChildren ? {
          onClick: (_info?: any) => {
            if (isExternal && externalUrl) {
              try { window.open(externalUrl, '_blank', 'noopener,noreferrer'); } catch {}
              return;
            }
            if (menu.path) navigate(`${menu.path}`)
          }
        } : {})
      };
      return item;
    });
};

/**
 * 构建路由菜单：自动识别传入数据为拍平还是树结构
 * @param menus 菜单列表
 * @param navigate 路由跳转函数
 */
export const buildMenus = (
  menus: Array<MenuInfo>,
  navigate: (path: string) => void,
): MenuItemType[] => {
  const isTreeData = Array.isArray(menus) && menus.some(m => Array.isArray((m as any)?.children));
  return isTreeData ? buildMenusFromTree(menus, navigate) : buildMenusFromFlat(menus, navigate, undefined);
};

// 顶部菜单数据
export const useTopNavigation = (navigate: (path: string) => void, data: Array<MenuInfo>): MenuProps => {
  return {
    items: [
      logoItem(navigate),
      ...buildMenus(data, navigate),
      {
        key: 'spacer',
        label: '',
        style: {marginLeft: 'auto', pointerEvents: 'none'},
      },
      toolsSwitcherGroupItem(),
      aboutMeItem(navigate)
    ]
  }
}
// 侧边菜单
export const useSideNavigation = (navigate: (path: string) => void, menuData: Array<MenuInfo>): MenuProps => {
  return {
    items: buildMenus(menuData, navigate)
  }
}