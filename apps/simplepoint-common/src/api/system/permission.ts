import {get} from "@simplepoint/shared/api/methods";
import {Page} from "@simplepoint/shared/types/request"
import api from "@/api";

const {baseUrl} = api['rbac-permissions']

/**
 * 角色下拉选项接口
 */
export interface PermissionRelevantVo {
    name: string;
    description: string;
    authority: string;
}

/**
 * 获取下拉分页
 * @param params 查询参数
 */
export async function fetchItems(params: Record<string, string>) {
    return await get<Page<PermissionRelevantVo>>(`${baseUrl}/items`, params);
}