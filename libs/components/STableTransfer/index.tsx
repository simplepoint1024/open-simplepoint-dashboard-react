import type {GetProp, TableColumnsType, TableProps, TransferProps} from 'antd';
import {Table, Transfer} from "antd";
import {useEffect, useRef, useState} from 'react';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface TableTransferProps<T> extends TransferProps<TransferItem> {
  dataSource: T[];
  leftColumns: TableColumnsType<T>;
  rightColumns: TableColumnsType<T>;
  // 不使用 React 的保留 prop 名称 `key`，改为 itemKey
  itemKey?: keyof T | string;
  /** 左右两侧统一高度（像素），用于表格内部滚动。默认 400 */
  listHeight?: number;
  /** 左侧表格纵向滚动高度优先级高于 listHeight */
  leftScrollY?: number;
  /** 右侧表格纵向滚动高度优先级高于 listHeight */
  rightScrollY?: number;
  /** 自适应父容器高度，动态计算滚动高度（优先级最高）。父容器需有确定高度（flex/百分比/固定值） */
  adaptiveHeight?: boolean;
  /** 当使用 adaptiveHeight 时，从实测高度中额外再减去的偏移量（已经自动减去 header/search/footer）。默认 0 */
  scrollOffset?: number;
}

const App = <T,>({leftColumns, rightColumns, itemKey = 'id', listHeight = 400, leftScrollY, rightScrollY, adaptiveHeight = false, scrollOffset = 0, ...restProps}: TableTransferProps<T>) => {
  // 统一行主键：优先使用 item[itemKey]，其次使用 id、key，最终保证返回字符串（避免返回 'undefined'）
  const getRowKey = (item: any) => {
    const val = item?.[itemKey as string] ?? item?.id ?? item?.key;
    return String(val ?? '');
  };

  const targetKeys = (restProps.targetKeys as (string | number)[] | undefined) || [];
  const onChange = restProps.onChange;

  const [leftAutoHeight, setLeftAutoHeight] = useState<number | undefined>();
  const [rightAutoHeight, setRightAutoHeight] = useState<number | undefined>();
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);

  // 监听父容器高度变化
  useEffect(() => {
    if (!adaptiveHeight) return;

    const computeScroll = (panel: HTMLDivElement | null): number | undefined => {
      if (!panel) return undefined;
      // 查找 Transfer 面板根节点 (.ant-transfer-list)
      const listRoot = panel.closest('.ant-transfer-list') as HTMLElement | null;
      const full = listRoot?.clientHeight ?? panel.clientHeight;
      // 查找需要减去的结构
      const header = listRoot?.querySelector('.ant-transfer-list-header') as HTMLElement | null;
      const search = listRoot?.querySelector('.ant-transfer-list-body-search-wrapper') as HTMLElement | null;
      const footer = listRoot?.querySelector('.ant-transfer-list-footer') as HTMLElement | null;
      const subtract = (header?.offsetHeight || 0) + (search?.offsetHeight || 0) + (footer?.offsetHeight || 0);
      const body = full - subtract - scrollOffset; // 额外偏移
      return Math.max(50, body);
    };

    const updateLeft = () => setLeftAutoHeight(computeScroll(leftPanelRef.current));
    const updateRight = () => setRightAutoHeight(computeScroll(rightPanelRef.current));

    // 初始计算
    updateLeft();
    updateRight();

    const observers: ResizeObserver[] = [];
    const observe = (panel: HTMLDivElement | null, cb: () => void) => {
      if (!panel) return;
      const listRoot = panel.closest('.ant-transfer-list') as HTMLElement | null;
      const target = listRoot || panel;
      const ro = new ResizeObserver(() => cb());
      ro.observe(target);
      observers.push(ro);
    };

    observe(leftPanelRef.current, updateLeft);
    observe(rightPanelRef.current, updateRight);

    window.addEventListener('resize', updateLeft);
    window.addEventListener('resize', updateRight);

    return () => {
      observers.forEach(o => o.disconnect());
      window.removeEventListener('resize', updateLeft);
      window.removeEventListener('resize', updateRight);
    };
  }, [adaptiveHeight, scrollOffset]);

  return (
    <Transfer {...restProps} rowKey={getRowKey}
              style={{...(restProps.style || {}), width: '100%', height: adaptiveHeight ? '100%' : (restProps.style?.height as any)}}
              listStyle={adaptiveHeight ? {height: '100%'} : (restProps as any).listStyle}
    >
      {({
          direction,
          filteredItems,
          onItemSelect,
          onItemSelectAll,
          selectedKeys: listSelectedKeys,
          disabled: listDisabled,
        }) => {
        const columns = direction === 'left' ? leftColumns : rightColumns;
        const rowSelection: TableRowSelection<TransferItem> = {
          getCheckboxProps: () => ({disabled: listDisabled}),
          onChange(selectedRowKeys) {
            onItemSelectAll(selectedRowKeys, 'replace');
          },
          selectedRowKeys: listSelectedKeys,
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
        };

        // 计算滚动高度：优先使用自适应，其次左右独立设置，最后统一高度
        const baseConfigured = direction === 'left' ? (leftScrollY ?? listHeight) : (rightScrollY ?? listHeight);
        const scrollY = adaptiveHeight
          ? (direction === 'left' ? leftAutoHeight : rightAutoHeight) ?? baseConfigured
          : baseConfigured;

        const panelRef = direction === 'left' ? leftPanelRef : rightPanelRef;

        return (
          <div ref={panelRef} style={{height: adaptiveHeight ? '100%' : scrollY, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <Table
              // 确保 Table 与 Transfer 使用相同的 rowKey
              pagination={false}
              rowKey={getRowKey}
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredItems as any}
              style={{pointerEvents: listDisabled ? 'none' : undefined}}
              // 独立滚动，不影响外层主布局
              scroll={{y: scrollY}}
              onRow={(record: any) => ({
                onClick: () => {
                  // 单击切换勾选（不直接移动）
                  const key = getRowKey(record);
                  const itemDisabled = record?.disabled;
                  if (itemDisabled || listDisabled) return;
                  onItemSelect(key, !listSelectedKeys.includes(key));
                },
                // Ant Design Table 会读取 onDoubleClick 事件，此处用于穿梭双击移动。
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onDoubleClick: () => {
                  const key = getRowKey(record);
                  const itemDisabled = record?.disabled;
                  if (itemDisabled || listDisabled) return;
                  if (!onChange) return;
                  const keyStr = String(key);
                  const current = targetKeys.map(k => String(k));
                  if (direction === 'left') {
                    if (!current.includes(keyStr)) {
                      onChange([...targetKeys, keyStr], 'right', [keyStr]);
                    }
                  } else {
                    if (current.includes(keyStr)) {
                      onChange(targetKeys.filter(k => String(k) !== keyStr), 'left', [keyStr]);
                    }
                  }
                },
              })}
            />
          </div>
        );
      }}
    </Transfer>
  );
};

export default App;
