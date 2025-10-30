import { request } from './client';
import {Pageable} from "./pagination";
import {useQuery} from "@tanstack/react-query";

export function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return request<T>(`${url}${query}`, { method: 'GET' });
}

export function post<T>(url: string, data: any): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function put<T>(url: string, data: any): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// 兼容 string | number | (string|number)[]
export function del<T>(url: string, ids: string[] | number[] | string | number): Promise<T> {
  const list = Array.isArray(ids) ? ids : [ids];
  const flat = (list as any).flat ? (list as any).flat() : list;
  const idsStr = flat.map((x: any) => String(x)).join(',');
  const query = idsStr ? `?ids=${encodeURIComponent(idsStr)}` : '';
  return request<T>(`${url}${query}`, {
    method: 'DELETE',
  });
}

export function usePageable<T>(
  key: string | readonly unknown[],
  fetchFn: () => Promise<Pageable<T>>,
  options?: any
) {
  const queryKey = Array.isArray(key) ? key : [key];
  return useQuery<Pageable<T>>({
    queryKey,
    queryFn: fetchFn,
    ...options,
  });
}

export function useData<T>(
  key: string,
  fetchFn: () => Promise<T>
) {
  return useQuery<T>({
    queryKey: [key],
    queryFn: fetchFn,
  });
}