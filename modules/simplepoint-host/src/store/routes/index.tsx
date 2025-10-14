import {createContext,useContext} from "react";
import type {ItemType} from "antd/es/menu/interface";

export type MenuItemType = ItemType & Record<string, any>;

export interface RouteState {
  top: MenuItemType[],
  side: MenuItemType[],
}

export const RouteStoreContext = createContext<{
  state: RouteState;
  setTopState: (update: Partial<RouteState>) => void;
  setSideState: (update: Partial<RouteState>) => void;
}>({
  state: {
    top: [],
    side: []
  },
  setTopState: () => {
  },
  setSideState: () => {
  }
});

export const useRouteStore = () => {
  return useContext(RouteStoreContext);
};

export interface MenuInfo {
  id: string | undefined;
  uuid: string | undefined;
  path?: string | undefined;
  parent?: string | undefined;
  title?: string | undefined;
  label?: string | undefined;
  icon?: string | undefined;
  danger?: boolean | undefined;
  type?: 'group' | 'divider' | 'submenu' | 'item' | undefined;
  disabled?: boolean | undefined;
  component?: string | undefined;
}


