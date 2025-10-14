import {createIcon} from "@simplepoint/libs-shared/types/icon.ts";
import {MenuInfo, MenuItemType} from "@/store/routes";
import {GetProps, Input, MenuProps} from "antd";
import {aboutMeItem, logoItem} from "@/layouts/navigation-bar/top-bar.tsx";
const {Search} = Input;

/**
 * 构建路由菜单
 * @param menus 菜单列表
 * @param navigate
 * @param parent
 */
export const buildMenus = (menus: Array<MenuInfo>, navigate: (path: string) => void, parent: string | undefined = undefined): MenuItemType[] => {
  return menus.reduce<MenuItemType[]>((acc, menu) => {
    if (menu.parent !== parent) return acc;
    const children = buildMenus(menus, navigate, menu.uuid);
    const existsChildren = children.length > 0;
    // @ts-ignore
    const menuItem: MenuItemType = {
      key: menu.uuid ?? "",
      label: menu.label ?? "",
      icon: menu.icon ? createIcon(menu.icon) : undefined,
      type: menu.type ?? undefined,
      danger: menu.danger ?? undefined,
      disabled: menu.disabled ?? undefined,
      component: menu.component ?? undefined,
      ...(existsChildren ? {children} : {}),
      ...(!existsChildren ? {
        onClick: () => {
          navigate(`${menu.path}`)
        }
      } : {})
    };
    return [...acc, menuItem];
  }, []);
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