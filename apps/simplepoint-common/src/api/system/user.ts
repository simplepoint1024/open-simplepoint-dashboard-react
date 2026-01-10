import api from "@/api";
import {get, post} from "@simplepoint/shared/api/methods";

const {baseUrl} = api['rbac-users'];

/**
 * 用户角色分配接口
 */
export interface UserRoleRelevantDto {
    // 用户名
    userId: string | null;
    // 角色权限列表
    roleIds?: string[];
}

/**
 * 获取已分配角色下拉分页
 */
export async function fetchAuthorized(params: UserRoleRelevantDto) {
    // 避免 "authorized??userId=..." 的双问号，将查询参数交给 get 封装追加
    return await get<string[]>(`${baseUrl}/authorized`, params);
}

/**
 * 取消分配角色
 * @param data 请求数据
 */
export async function fetchUnauthorized(data: UserRoleRelevantDto) {
    return await post<UserRoleRelevantDto>(`${baseUrl}/unauthorized`, data);
}

/**
 * 分配角色
 * @param data
 */
export async function fetchAuthorize(data: UserRoleRelevantDto) {
    return await post<UserRoleRelevantDto>(`${baseUrl}/authorize`, data);
}