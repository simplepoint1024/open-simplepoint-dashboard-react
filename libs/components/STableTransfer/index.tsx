import type {GetProp, TableColumnsType, TableProps, TransferProps} from 'antd';
import {Table, Transfer} from "antd";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface TableTransferProps<T> extends TransferProps<TransferItem> {
  dataSource: T[];
  leftColumns: TableColumnsType<T>;
  rightColumns: TableColumnsType<T>;
  // 不使用 React 的保留 prop 名称 `key`，改为 itemKey
  itemKey?: keyof T | string;
}

const App = <T,>({leftColumns, rightColumns, itemKey = 'id', ...restProps}: TableTransferProps<T>) => {
  // 统一行主键：优先使用 item[itemKey]，其次使用 id、key，最终保证返回字符串（避免返回 'undefined'）
  const getRowKey = (item: any) => {
    const val = item?.[itemKey as string] ?? item?.id ?? item?.key;
    return String(val ?? '');
  };

  const targetKeys = (restProps.targetKeys as (string | number)[] | undefined) || [];
  const onChange = restProps.onChange;

  return (
    <Transfer style={{width: '100%'}} rowKey={getRowKey} {...restProps}>
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

        return (
          <Table
            // 确保 Table 与 Transfer 使用相同的 rowKey
            pagination={false}
            rowKey={getRowKey}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems as any}
            style={{pointerEvents: listDisabled ? 'none' : undefined}}
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
        );
      }}
    </Transfer>
  );
};

export default App;
