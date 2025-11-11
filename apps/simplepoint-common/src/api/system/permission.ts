import {get, post} from "@simplepoint/shared/api/methods";
import {Pageable} from "@simplepoint/shared/api/pagination";
import api from "@/api";

const {baseUrl} = api['rbac-permissions']

/**
 * 角色下拉选项接口
 */
export interface PermissionSelect {
  name: string;
  description: string;
  authority: string;
}

export interface RolePermissionDto {
  // 所选角色
  roleAuthority: string | null;
  // 权限列表
  permissionAuthorities?: string[];
}

/**
 * 获取下拉分页
 * @param params 查询参数
 */
export async function fetchItems(params: Record<string, string>) {
  return await get<Pageable<PermissionSelect>>(`${baseUrl}/items`, params);
}

/**
 * 获取已分配角色下拉分页
 */
export async function fetchAuthorized(params: RolePermissionDto) {
  return await get<string[]>(`${baseUrl}/authorized`, params);
}

/**
 * 取消分配角色
 * @param data 请求数据
 */
export async function fetchUnauthorized(data: RolePermissionDto) {
  return await post<RolePermissionDto>(`${baseUrl}/unauthorized`, data);
}

export async function fetchAuthorize(data: RolePermissionDto) {
  return await post<RolePermissionDto>(`${baseUrl}/authorize`, data);
}