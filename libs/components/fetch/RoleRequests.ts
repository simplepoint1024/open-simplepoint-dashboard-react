import {get} from "@simplepoint/libs-shared/api/methods";
import {Pageable} from "@simplepoint/libs-shared/api/pagination";

/**
 * 角色下拉选项接口
 */
export interface RoleSelect {
  name: string;
  description: string;
  authority: string;
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