/**
 * 分页信息
 */
export type Page = {
  number: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
};

/**
 * 分页数据
 */
export type Pageable<T> = {
  content: T[];
  page: Page;
};
