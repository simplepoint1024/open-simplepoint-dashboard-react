import {createIcon} from "@simplepoint/libs-shared/types/icon.ts";
import {MenuInfo, MenuItemType} from "@/store/routes";
import {MenuProps} from "antd";
import {aboutMeItem, logoItem, toolsSwitcherGroupItem} from "@/layouts/navigation-bar/top-bar.tsx";
import {useI18n} from '@/i18n';

/**
 * 基于拍平(parent)关系构建菜单（同级按 sort 升序）
 */
const buildMenusFromFlat = (
  menus: Array<MenuInfo>,
  navigate: (path: string) => void,
  parent: string | undefined = undefined,
  translate: (key: string, fallback?: string) => string = (k, f) => f ?? k
): MenuItemType[] => {
  const siblings = menus
    .filter((m) => m.parent === parent)
    .sort((a: any, b: any) => (a?.sort ?? 0) - (b?.sort ?? 0));

  return siblings.map((menu) => {
    const children = buildMenusFromFlat(menus, navigate, menu.uuid, translate);
    const existsChildren = children.length > 0;
    const keyText = (menu as any).title ?? (menu as any).label ?? '';
    const labelText = translate((menu as any).title ?? '', (menu as any).label ?? '');
    // @ts-ignore
    const menuItem: MenuItemType = {
      key: menu.uuid || (menu as any).path || keyText || "",
      label: labelText,
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
 * 基于树结构(children)构建菜单（同级按 sort 升序）
 */
const buildMenusFromTree = (
  nodes: Array<MenuInfo>,
  navigate: (path: string) => void,
  translate: (key: string, fallback?: string) => string = (k, f) => f ?? k
): MenuItemType[] => {
  return ([...(nodes || [])] as any[])
    .sort((a: any, b: any) => (a?.sort ?? 0) - (b?.sort ?? 0))
    .map((menu: any) => {
      const rawChildren = menu.children as Array<MenuInfo> | undefined;
      const builtChildren = Array.isArray(rawChildren) && rawChildren.length > 0 ? buildMenusFromTree(rawChildren, navigate, translate) : undefined;
      const existsChildren = !!builtChildren && builtChildren.length > 0;
      const keyText = menu.title ?? menu.label ?? '';
      const labelText = translate(menu.title ?? '', menu.label ?? '');
      // @ts-ignore
      const item: MenuItemType = {
        key: menu.uuid || menu.path || keyText || "",
        label: labelText,
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
 * @param translate 国际化翻译函数
 */
export const buildMenus = (
  menus: Array<MenuInfo>,
  navigate: (path: string) => void,
  translate: (key: string, fallback?: string) => string = (k, f) => f ?? k
): MenuItemType[] => {
  const isTreeData = Array.isArray(menus) && menus.some(m => Array.isArray((m as any)?.children));
  return isTreeData ? buildMenusFromTree(menus, navigate, translate) : buildMenusFromFlat(menus, navigate, undefined, translate);
};

// 顶部菜单数据
export const useTopNavigation = (navigate: (path: string) => void, data: Array<MenuInfo>): MenuProps => {
  const {t} = useI18n();
  const translate = (key: string, fallback?: string) => t(key, fallback);
  return {
    items: [
      logoItem(navigate),
      ...buildMenus(data, navigate, translate),
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
  const {t} = useI18n();
  const translate = (key: string, fallback?: string) => t(key, fallback);
  return {
    items: buildMenus(menuData, navigate, translate)
  }
}