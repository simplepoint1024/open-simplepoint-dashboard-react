import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from "@/api";
import {useI18n} from '@simplepoint/libs-shared/hooks/useI18n';
import React, {useEffect, useMemo, useState} from "react";
import type {GetProp, TableColumnsType, TableProps, TransferProps} from 'antd';
import {Drawer, Flex, Table, Transfer} from "antd";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
  id: string,
  roleName: string;
  description: string;
  // 可选：是否禁用该行选择
  disabled?: boolean;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  leftColumns: TableColumnsType<DataType>;
  rightColumns: TableColumnsType<DataType>;
}

// Customize Table Transfer
const TableTransfer: React.FC<TableTransferProps> = (props) => {
  const {leftColumns, rightColumns, ...restProps} = props;

  // 统一行主键：优先使用 id，其次使用 key
  const getRowKey = (item: any) => String(item?.id ?? item?.key);

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
            rowKey={getRowKey}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems as any}
            size="small"
            style={{pointerEvents: listDisabled ? 'none' : undefined}}
            onRow={(record: any) => ({
              onClick: () => {
                const key = getRowKey(record);
                const itemDisabled = record?.disabled;
                if (itemDisabled || listDisabled) {
                  return;
                }
                onItemSelect(key, !listSelectedKeys.includes(key));
              },
            })}
          />
        );
      }}
    </Transfer>
  );
};

const mockData = [
  {
    id: '1',
    roleName: 'Admin',
    description: 'Administrator role with full permissions',
  }
]

const filterOption = (input: string, item: DataType) => {
  return item.roleName?.includes(input) || item.roleName?.includes(input);
}

const App = () => {
  const {t, ensure, locale} = useI18n();
  const [open, setOpen] = useState(false);

  // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(['users', 'roles']);
  }, [ensure, locale]);

  const columns: TableColumnsType<DataType> = useMemo(() => ([
    {
      key: 'roleName',
      dataIndex: 'roleName',
      title: t('roles.title.roleName'),
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: t('roles.title.description'),
    },
  ]), [t, locale]);

  const customButtonEvents = {
    onConfigRoles: (_keys: React.Key[], _rows: any[]) => {
      setOpen(true);
    },
  } as const;

  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
    if (direction === 'right') {
      // 分配角色的逻辑处理
      console.log('Assign roles:', moveKeys);
    }else {
      // 移除角色的逻辑处理
      console.log('Remove roles:', moveKeys);
    }
  };

  return (
    <div>
      <SimpleTable
        {...apis['rbac-users']}
        customButtonEvents={customButtonEvents}
      />
      <Drawer
        title={t("users.button.configRoles")}
        open={open}
        onClose={() => setOpen(false)}
        placement={"bottom"}
        height={700}
      >
        <Flex align="start" gap="middle" vertical>
          <TableTransfer
            dataSource={mockData}
            targetKeys={targetKeys}
            showSelectAll={false}
            onChange={onChange}
            filterOption={filterOption}
            leftColumns={columns}
            rightColumns={columns}
          />
        </Flex>
      </Drawer>
    </div>
  );
};

export default App;
