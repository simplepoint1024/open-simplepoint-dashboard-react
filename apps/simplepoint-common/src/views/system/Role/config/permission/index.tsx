import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import {useEffect, useMemo, useState} from "react";
import {GetProp, TableColumnsType, TransferProps} from 'antd';
import STableTransfer from '@simplepoint/components/STableTransfer'
import {useData, usePageable} from '@simplepoint/shared/api/methods';
import {fetchItems} from "@/api/system/permission.ts";
import {fetchAuthorize, fetchAuthorized, fetchUnauthorized} from "@/api/system/role.ts";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

export interface RoleSelectProps {
  roleAuthority: string | null;
}

interface DataType {
  name: string;
  description: string;
  authority: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  leftColumns: TableColumnsType<DataType>;
  rightColumns: TableColumnsType<DataType>;
}

const filterOption = (input: string, item: DataType) => {
  return item.name?.includes(input) || item.authority?.includes(input);
}

const App = (props: RoleSelectProps) => {
  const {t, ensure, locale} = useI18n();

  // 获取权限列表数据
  const {data: page} = usePageable('fetchItems', () => fetchItems({
    page: '0',
    size: '10000000'
  }));
  const {content} = page || {content: []};

  // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(['permissions']);
  }, [ensure, locale]);

  const columns: TableColumnsType<DataType> = useMemo(() => ([
    {
      key: 'name',
      dataIndex: 'name',
      title: t('permissions.title.name'),
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: t('permissions.title.description'),
    },
  ]), [t, locale]);

  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  // 获取已分配权限（随 roleAuthority 变化而变化）
  const {data: authorized} = useData<string[]>(
    ['fetchAuthorized', props.roleAuthority],
    () => fetchAuthorized({ roleAuthority: props.roleAuthority }),
    { enabled: !!props.roleAuthority }
  );

  // 切换不同角色时，先清空以避免显示上一次的内容
  useEffect(() => {
    setTargetKeys([]);
  }, [props.roleAuthority]);

  // 初始化/更新已分配权限
  useEffect(() => {
    setTargetKeys(authorized || []);
  }, [authorized]);

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
    if (direction === 'right') {
      // 分配权限的逻辑处理
      fetchAuthorize({
        roleAuthority: props.roleAuthority,
        permissionAuthorities: moveKeys as string[],
      }).then(_res => {
        // 处理返回结果
      })
    } else {
      // 移除权限的逻辑处理
      fetchUnauthorized({
        roleAuthority: props.roleAuthority,
        permissionAuthorities: moveKeys as string[],
      }).then(_res => {
        // 处理返回结果
      })
    }
  };

  return (
    <div>
      <STableTransfer
        dataSource={content}
        targetKeys={targetKeys}
        showSelectAll={false}
        onChange={onChange}
        filterOption={filterOption}
        leftColumns={columns}
        rightColumns={columns}
        itemKey={'authority'}
      />
    </div>
  );
};

export default App;
