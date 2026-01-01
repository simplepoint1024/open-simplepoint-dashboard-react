import {useEffect, useState} from "react";

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const notify = (title: string, desc?: string) => {
        try {
            // @ts-ignore
            import('antd').then(({notification}) => {
                notification.error({message: title || '请求失败', description: desc, duration: 4});
            }).catch(() => {
            });
        } catch {
        }
    };

    const method = (options?.method || 'GET').toUpperCase();

    return await fetch(url, {
        credentials: 'include', // 保持 session
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {})
        },
        ...options,
    }).then(async (response) => {
        if (!response.ok) {
            const text = await response.text();
            const msg = `HTTP ${response.status} ${response.statusText}`;
            notify('请求失败', `${method} ${url}\n${msg}\n${text?.slice(0, 500)}`);
            const err: any = new Error(`Request failed with status ${response.status}: ${text}`);
            err.__notified = true;
            throw err;
        }

        // 无内容
        if (response.status === 204) {
            return undefined as T;
        }

        const contentType = response.headers.get('content-type') || '';

        // 仅当响应为 JSON 时解析为 JSON
        if (contentType.includes('application/json')) {
            return await response.json() as Promise<T>;
        }

        // 其他情况：读取文本并报错（避免 JSON.parse 报错 `<`）
        const text = await response.text();
        notify('请求失败', `${method} ${url}\nUnexpected content-type: ${contentType || 'unknown'}\n${text?.slice(0, 500)}`);
        const err: any = new Error(`Unexpected content-type: ${contentType || 'unknown'}`);
        err.__notified = true;
        throw err;
    }).catch((error: any) => {
        if (!error?.__notified) {
            notify('网络错误', `${method} ${url}\n${String(error?.message || error)}`);
        }
        throw error;
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
    return await request<T>(`${url}${query}`, {
        method: 'GET'
    });
}

export async function put<T>(url: string, data: any): Promise<T> {
    return await request<T>(url, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function del<T>(url: string, ids: string[]): Promise<T> {
    return await request<T>(`${url}?ids=${ids.join(',')}`, {
        method: 'DELETE',
    });
}

/**
 * 空分页
 */
export const emptyPage: Page<any> = {
    content: [],
    page: {
        size: 0,
        totalElements: 0,
        totalPages: 0,
        number: 0,
    }
}


export type Page<T> = {
    content: Array<T>;
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    }
}

export type Sort = {
    empty: boolean,
    sorted: boolean,
    unsorted: boolean
}

/**
 * 将 Pageable 转换为 Ant Design Table 组件的分页配置
 * @param page Pageable 对象
 */
export function toPagination(page: Page<any>) {
    const {size,number,totalElements} = page.page
    return {
        total: totalElements ?? 0,
        pageSize: size ?? 10,
        current: (number ?? 0) + 1,
        showSizeChanger: true,
    }
}

/**
 * 使用自定义 hook 来获取数据
 * @param fn 返回一个 Promise<Pageable<T>> 的函数
 * @returns 返回数据数组
 */
export function use<T>(fn: () => Promise<Page<T>>): Array<T> {
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