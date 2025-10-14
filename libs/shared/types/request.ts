import {useEffect, useState} from "react";

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  return await fetch(url, {
    credentials: 'include', // 保持 session
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options,
  }).then( async (response) => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Request failed with status ${response.status}: ${text}`);
      });
    }
    return response.json();
  });
}

export async function post<T>(url: string, data: any): Promise<T> {
  return await request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return await request<T>(`${url}${query}`,{
    method: 'GET'
  });
}

export async function put<T>(url: string, data: any): Promise<T> {
  return await request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function del<T>(url: string,ids:string[]): Promise<T> {
  return await request<T>(`${url}?ids=${ids.join(',')}`, {
    method: 'DELETE',
  });
}
export type Page ={
  number: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
}

export type Pageable<T> = {
  content: Array<T>;
  page: Page
}

/**
 * 使用自定义 hook 来获取数据
 * @param fn 返回一个 Promise<Pageable<T>> 的函数
 * @returns 返回数据数组
 */
export function use<T>(fn: () => Promise<Pageable<T>>): Array<T> {
  const [data, setData] = useState<Array<T>>([]);
  useEffect(() => {
    const fetch = async () => {
      const {content} = await fn();
      setData(content);
    };
    fetch().then();
  }, []);
  return data;
}