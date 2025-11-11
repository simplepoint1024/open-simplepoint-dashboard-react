import {get, post} from "@simplepoint/shared/api/methods";
import {Pageable} from "@simplepoint/shared/api/pagination";
import api from "@/api";

const {baseUrl} = api['rbac-roles']

/**
 * 角色下拉选项接口
 */
export interface RoleSelect {
  name: string;
  description: string;
  authority: string;
}

export interface RoleSelectDto {
  // 用户名
  username: string | null;
  // 角色权限列表
  roleAuthorities?: string[];
}

/**
 * 获取下拉分页
 * @param params 查询参数
 */
export async function fetchItems(params: Record<string, string>) {
  return await get<Pageable<RoleSelect>>(`${baseUrl}/items`, params);
}

/**
 * 获取已分配角色下拉分页
 */
export async function fetchAuthorized(params: RoleSelectDto) {
  return await get<string[]>(`${baseUrl}/authorized`, params);
}

/**
 * 取消分配角色
 * @param data 请求数据
 */
export async function fetchUnauthorized(data: RoleSelectDto) {
  return await post<RoleSelectDto>(`${baseUrl}/unauthorized`, data);
}

export async function fetchAuthorize(data: RoleSelectDto) {
  return await post<RoleSelectDto>(`${baseUrl}/authorize`, data);
}