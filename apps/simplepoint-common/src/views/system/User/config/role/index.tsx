import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import {useEffect, useMemo, useState} from "react";
import {GetProp, TableColumnsType, TransferProps} from 'antd';
import STableTransfer from "@simplepoint/components/STableTransfer";
import {useData, usePageable} from '@simplepoint/shared/api/methods';
import {fetchItems} from "@/api/system/role";
import {fetchAuthorize, fetchAuthorized, fetchUnauthorized} from "@/api/system/user";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

export interface RoleSelectProps {
  username: string | null;
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

  // 获取角色列表数据
  const {data: page} = usePageable('fetchItems', () => fetchItems({
    page: '0',
    size: '10000000'
  }));
  const {content} = page || {content: []};

  // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(['roles']);
  }, [ensure, locale]);

  const columns: TableColumnsType<DataType> = useMemo(() => ([
    {
      key: 'name',
      dataIndex: 'name',
      title: t('roles.title.roleName'),
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: t('roles.title.description'),
    },
  ]), [t, locale]);

  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  // 获取已分配角色（随 username 变化）
  const {data: authorized} = useData<string[]>(
    ['fetchAuthorizedUserRoles', props.username],
    () => fetchAuthorized({ username: props.username }),
    { enabled: !!props.username }
  );

  // 切换不同用户时，先清空以避免显示上一次内容
  useEffect(() => {
    setTargetKeys([]);
  }, [props.username]);

  // 初始化/更新已分配角色
  useEffect(() => {
    setTargetKeys(authorized || []);
  }, [authorized]);

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
    if (direction === 'right') {
      // 分配角色的逻辑处理
      fetchAuthorize({
        username: props.username,
        roleAuthorities: moveKeys as string[],
      }).then(_res => {
        // 处理返回结果
      })
    } else {
      // 移除角色的逻辑处理
      fetchUnauthorized({
        username: props.username,
        roleAuthorities: moveKeys as string[],
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
