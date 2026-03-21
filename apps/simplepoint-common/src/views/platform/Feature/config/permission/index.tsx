import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import {useEffect, useMemo, useState} from 'react';
import {GetProp, TableColumnsType, TransferProps} from 'antd';
import STableTransfer from '@simplepoint/components/STableTransfer';
import {useData, usePage} from '@simplepoint/shared/api/methods';
import {PermissionRelevantVo, fetchItems} from '@/api/system/permission';
import {fetchAuthorized, fetchAuthorize, fetchUnauthorized} from '@/api/platform/feature';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

export interface FeaturePermissionConfigProps {
  featureCode: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: PermissionRelevantVo[];
  leftColumns: TableColumnsType<PermissionRelevantVo>;
  rightColumns: TableColumnsType<PermissionRelevantVo>;
}

const App = ({featureCode}: FeaturePermissionConfigProps) => {
  const {t, messages, ensure, locale} = useI18n();

  useEffect(() => {
    void ensure(['permissions']);
  }, [ensure, locale]);

  const {data: page} = usePage<PermissionRelevantVo>(
    ['platform-permission-items'],
    () => fetchItems({page: '0', size: '10000000'})
  );
  const content = page?.content ?? [];

  const columns: TableColumnsType<PermissionRelevantVo> = useMemo(
    () => [
      {key: 'name', dataIndex: 'name', title: t('permissions.title.name')},
      {key: 'authority', dataIndex: 'authority', title: t('permissions.title.authority')},
      {key: 'description', dataIndex: 'description', title: t('permissions.title.description')},
    ],
    [messages],
  );

  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  const {data: authorized} = useData<string[]>(
    featureCode ? ['fetchAuthorizedFeaturePermissions', featureCode] : '',
    () => fetchAuthorized({featureCode}),
    {enabled: !!featureCode},
  );

  useEffect(() => {
    setTargetKeys([]);
  }, [featureCode]);

  useEffect(() => {
    if (authorized) {
      setTargetKeys(authorized);
    }
  }, [authorized]);

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
    if (!featureCode) return;

    if (direction === 'right') {
      void fetchAuthorize({featureCode, permissionAuthority: moveKeys as string[]});
    } else {
      void fetchUnauthorized({featureCode, permissionAuthority: moveKeys as string[]});
    }
  };

  if (!featureCode) {
    return <div style={{flex: 1, minHeight: 0}}/>;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0}}>
      <div style={{flex: 1, minHeight: 0}}>
        <STableTransfer
          dataSource={content}
          targetKeys={targetKeys}
          showSelectAll={false}
          onChange={onChange}
          leftColumns={columns}
          rightColumns={columns}
          itemKey="authority"
          adaptiveHeight
          searchable
        />
      </div>
    </div>
  );
};

export default App;
