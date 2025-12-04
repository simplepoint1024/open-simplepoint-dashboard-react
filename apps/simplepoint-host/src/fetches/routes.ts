import {MenuInfo} from "@/store/routes";
import {get, Page} from "@simplepoint/shared/types/request.ts";

export type Remote = {
    name: string;
    entry: string;
}

export function routes(): Promise<Page<MenuInfo>> {
    return get<Page<MenuInfo>>("/common/menus/routes")
}

export function modules(): Promise<Page<Remote>> {
    return get<Page<Remote>>("/common/modules")
}