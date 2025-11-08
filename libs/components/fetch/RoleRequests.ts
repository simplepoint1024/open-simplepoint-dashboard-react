import {get, post} from "@simplepoint/libs-shared/api/methods";
import {Pageable} from "@simplepoint/libs-shared/api/pagination";

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
  roleAuthorities: string[];
}

/**
 * 获取下拉分页
 * @param params 查询参数
 */
export async function fetchItems(params: Record<string, string>) {
  return await get<Pageable<RoleSelect>>('/common/roles/items', params);
}

/**
 * 获取已分配角色下拉分页
 */
export async function fetchAuthorized() {
  return await get<string[]>('/common/roles/authorized');
}

/**
 * 取消分配角色
 * @param data 请求数据
 */
export async function fetchUnauthorized(data: RoleSelectDto) {
  return await post<RoleSelectDto>('/common/roles/unauthorized', data);
}

export async function fetchAuthorize(data: RoleSelectDto) {
  return await post<RoleSelectDto>('/common/roles/authorize', data);
}