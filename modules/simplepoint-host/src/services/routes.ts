import {MenuInfo} from "@/store/routes";
import {get, Pageable} from "@simplepoint/libs-shared/types/request.ts";

export type Remote = {
  name: string;
  entry: string;
}

export function routes(): Promise<Pageable<MenuInfo>> {
  return get<Pageable<MenuInfo>>("/common/menus/routes")
}

export function modules(): Promise<Pageable<Remote>> {
  return get<Pageable<Remote>>("/common/modules")
}