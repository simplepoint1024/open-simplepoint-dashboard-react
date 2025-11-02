import {createIcon} from "@simplepoint/libs-shared/types/icon.ts";
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
  parent: string | undefined = undefined,
): MenuItemType[] => {
  const siblings = menus
    .filter((m) => m.parent === parent);

  return siblings.map((menu) => {
    const children = buildMenusFromFlat(menus, navigate, menu.uuid);
    const existsChildren = children.length > 0;
    const keyText = (menu as any).title ?? (menu as any).label ?? '';
    // @ts-ignore
    const menuItem: MenuItemType = {
      key: menu.uuid || (menu as any).path || keyText || "",
      label: <I18nText k={(menu as any).title || ''} fallback={(menu as any).label || ''} />,
      icon: (menu as any).icon ? createIcon((menu as any).icon) : undefined,
      type: (menu as any).type ?? undefined,
      danger: (menu as any).danger ?? undefined,
      disabled: (menu as any).disabled ?? undefined,
      component: (menu as any).component ?? undefined,
      ...(existsChildren ? {children} : {}),
      ...(!existsChildren ? {
        onClick: () => {
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
      // @ts-ignore
      const item: MenuItemType = {
        key: menu.uuid || menu.path || keyText || "",
        label: <I18nText k={menu.title || ''} fallback={menu.label || ''} />,
        icon: menu.icon ? createIcon(menu.icon) : undefined,
        type: menu.type ?? undefined,
        danger: menu.danger ?? undefined,
        disabled: menu.disabled ?? undefined,
        component: menu.component ?? undefined,
        ...(existsChildren ? {children: builtChildren} : {}),
        ...(!existsChildren ? {
          onClick: () => {
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