import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {get} from '@simplepoint/shared/api/methods';
import {getStoredTenantId} from '@simplepoint/shared/api/contextId';

export type CurrentTenant = {
    tenantId: string;
    tenantName: string;
};

/**
 * 获取当前用户可切换的租户列表（部分后端会按当前 tenant 返回不同的列表）
 */
export async function fetchCurrentTenants(): Promise<CurrentTenant[]> {
    const res = await get<CurrentTenant[]>('/common/tenants/current');
    // 兜底：避免后端偶发返回 null/{} 导致页面静默失败
    return Array.isArray(res) ? res : [];
}

/**
 * 获取当前租户上下文 ID（部分接口需要单独传递）
 *
 * 已收敛到 @simplepoint/shared/api/contextId.ensureContextId。
 */
// export async function fetchGetContextId(tenantId:string): Promise<string | undefined> {
//     const res = await get<string>('/common/tenants/permission-context-id?tenantId='+tenantId);
//     return res ? res : undefined;
// }

export function useCurrentTenants() {
    // 会话级缓存，避免每次打开下拉都拉取
    const tenantId = getStoredTenantId();
    const cacheKey = tenantId ? `sp.currentTenants:${tenantId}` : 'sp.currentTenants';

    let cached: CurrentTenant[] | undefined;
    try {
        const raw = sessionStorage.getItem(cacheKey);
        cached = raw ? (JSON.parse(raw) as CurrentTenant[]) : undefined;
    } catch {
    }

    const result = useQuery({
        queryKey: ['common', 'tenants', 'current', tenantId],
        queryFn: fetchCurrentTenants,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        initialData: cached,
        initialDataUpdatedAt: cached ? Date.now() : undefined,
    });

    useEffect(() => {
        if (result.data) {
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(result.data));
            } catch {
            }
        }
    }, [cacheKey, result.data]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && result.isError) {
            // eslint-disable-next-line no-console
            console.warn('fetchCurrentTenants failed:', result.error);
        }
    }, [result.isError, result.error]);

    return result;
}
