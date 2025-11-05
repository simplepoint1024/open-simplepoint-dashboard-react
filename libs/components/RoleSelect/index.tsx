import {useI18n} from '@simplepoint/libs-shared/hooks/useI18n';
import {useEffect, useMemo, useState} from "react";
import type {GetProp, TableColumnsType, TransferProps} from 'antd';
import STableTransfer from "../STableTransfer";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

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
          <STableTransfer
            dataSource={mockData}
            targetKeys={targetKeys}
            showSelectAll={false}
            onChange={onChange}
            filterOption={filterOption}
            leftColumns={columns}
            rightColumns={columns}
          />
    </div>
  );
};

export default App;
