import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { get } from '@simplepoint/shared/types/request.ts';

export type UserInfo = any;

export async function fetchUserInfo(): Promise<UserInfo> {
  return get<UserInfo>('/userinfo');
}

export function useUserInfo() {
  // 读取会话缓存作为初始数据，提升首屏速度
  let cached: UserInfo | undefined;
  try {
    const raw = sessionStorage.getItem('sp.userinfo');
    cached = raw ? JSON.parse(raw) : undefined;
  } catch {}

  const result = useQuery({
    queryKey: ['userinfo'],
    queryFn: fetchUserInfo,
    // 2 分钟内视为新鲜数据，避免重复拉取
    staleTime: 2 * 60 * 1000,
    // 页面重新获得焦点不强制刷新
    refetchOnWindowFocus: false,
    // 用缓存作为初始值（可选）
    initialData: cached,
    initialDataUpdatedAt: cached ? Date.now() : undefined,
  });

  useEffect(() => {
    if (result.data) {
      try { sessionStorage.setItem('sp.userinfo', JSON.stringify(result.data)); } catch {}
    }
  }, [result.data]);

  return result;
}
