import {createIcon} from "@simplepoint/libs-shared/types/icon.ts";
import {MenuInfo, MenuItemType} from "@/store/routes";
import {GetProps, Input, MenuProps} from "antd";
import {aboutMeItem, logoItem} from "@/layouts/navigation-bar/top-bar.tsx";
const {Search} = Input;

/**
 * 基于拍平(parent)关系构建菜单
 */
const buildMenusFromFlat = (menus: Array<MenuInfo>, navigate: (path: string) => void, parent: string | undefined = undefined): MenuItemType[] => {
  return menus.reduce<MenuItemType[]>((acc, menu) => {
    if (menu.parent !== parent) return acc;
    const children = buildMenusFromFlat(menus, navigate, menu.uuid);
    const existsChildren = children.length > 0;
    // @ts-ignore
    const menuItem: MenuItemType = {
      key: menu.uuid ?? "",
      label: menu.label ?? "",
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
    return [...acc, menuItem];
  }, []);
};

/**
 * 基于树结构(children)构建菜单
 */
const buildMenusFromTree = (nodes: Array<MenuInfo>, navigate: (path: string) => void): MenuItemType[] => {
  return (nodes || []).map((menu) => {
    const rawChildren = (menu as any).children as Array<MenuInfo> | undefined;
    const builtChildren = Array.isArray(rawChildren) && rawChildren.length > 0 ? buildMenusFromTree(rawChildren, navigate) : undefined;
    const existsChildren = !!builtChildren && builtChildren.length > 0;
    // @ts-ignore
    const item: MenuItemType = {
      key: menu.uuid ?? "",
      label: menu.label ?? "",
      icon: (menu as any).icon ? createIcon((menu as any).icon) : undefined,
      type: (menu as any).type ?? undefined,
      danger: (menu as any).danger ?? undefined,
      disabled: (menu as any).disabled ?? undefined,
      component: (menu as any).component ?? undefined,
      ...(existsChildren ? {children: builtChildren} : {}),
      ...(!existsChildren ? {
        onClick: () => {
          if ((menu as any).path) navigate(`${(menu as any).path}`)
        }
      } : {})
    };
    return item;
  });
};

/**
 * 构建路由菜单：自动识别传入数据为拍平还是树结构
 * @param menus 菜单列表
 * @param navigate
 */
export const buildMenus = (menus: Array<MenuInfo>, navigate: (path: string) => void): MenuItemType[] => {
  const isTreeData = Array.isArray(menus) && menus.some(m => Array.isArray((m as any)?.children));
  return isTreeData ? buildMenusFromTree(menus, navigate) : buildMenusFromFlat(menus, navigate, undefined);
};

type SearchProps = GetProps<typeof Input.Search>;
const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

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
      }, {
        key: 'search',
        disabled: true,
        label: (
          <div style={{
            flexShrink: 0,
            display: 'flex',
            paddingTop: '15px'
          }}>
            <Search placeholder="input search text" onSearch={onSearch} enterButton/>
          </div>
        ),

      },
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