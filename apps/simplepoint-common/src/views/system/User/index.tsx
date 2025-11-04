import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from "@/api";
import {useI18n} from '@simplepoint/libs-shared/hooks/useI18n';
import React, {useEffect, useMemo, useState} from "react";
import type {GetProp, TableColumnsType, TableProps, TransferProps} from 'antd';
import {Drawer, Flex, Table, Transfer} from "antd";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
  roleName: string;
  description: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  leftColumns: TableColumnsType<DataType>;
  rightColumns: TableColumnsType<DataType>;
}

// Customize Table Transfer
const TableTransfer: React.FC<TableTransferProps> = (props) => {
  const {leftColumns, rightColumns, ...restProps} = props;
  return (
    <Transfer style={{width: '100%'}} {...restProps}>
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
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size="small"
            style={{pointerEvents: listDisabled ? 'none' : undefined}}
            onRow={({key, disabled: itemDisabled}) => ({
              onClick: () => {
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
      dataIndex: 'roleName',
      title: t('roles.title.roleName'),
    },
    {
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

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
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
            showSearch
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