import {get, post} from "@simplepoint/shared/api/methods";
import {Page} from "@simplepoint/shared/types/request"
import api from "@/api";

const {baseUrl} = api['rbac-roles']

/**
 * 角色下拉选项接口
 */
export interface RoleRelevantVo {
  name: string;
  description: string;
  id: string;
}

/**
 * 角色权限分配接口
 */
export interface RolePermissionRelevantDto {
  // 所选角色
  roleId: string | null;
  // 权限列表
  permissionIds?: string[];
}

/**
 * 获取下拉角色分页
 * @param params 查询参数
 */
export async function fetchItems(params: Record<string, string>) {
  return await get<Page<RoleRelevantVo>>(`${baseUrl}/items`, params);
}

/**
 * 获取已分配角色的权限下拉分页
 */
export async function fetchAuthorized(roleId: string) {
  return await get<string[]>(`${baseUrl}/authorized?roleId=${roleId}`);
}

/**
 * 取消分配角色权限
 * @param data 请求数据
 */
export async function fetchUnauthorized(data: RolePermissionRelevantDto) {
  return await post<RolePermissionRelevantDto>(`${baseUrl}/unauthorized`, data);
}

/**
 * 分配角色权限
 * @param data 请求数据
 */
export async function fetchAuthorize(data: RolePermissionRelevantDto) {
  return await post<RolePermissionRelevantDto>(`${baseUrl}/authorize`, data);
}