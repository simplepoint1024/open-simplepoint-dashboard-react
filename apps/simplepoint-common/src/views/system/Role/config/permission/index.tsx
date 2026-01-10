import { useI18n } from '@simplepoint/shared/hooks/useI18n';
import { useEffect, useMemo, useState } from 'react';
import { GetProp, TableColumnsType, TransferProps } from 'antd';
import STableTransfer from '@simplepoint/components/STableTransfer';
import { useData, usePage } from '@simplepoint/shared/api/methods';
import { fetchItems, PermissionRelevantVo } from '@/api/system/permission.ts';
import { fetchAuthorize, fetchAuthorized, fetchUnauthorized } from '@/api/system/role.ts';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

export interface RoleSelectProps {
    roleId: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
    dataSource: PermissionRelevantVo[];
    leftColumns: TableColumnsType<PermissionRelevantVo>;
    rightColumns: TableColumnsType<PermissionRelevantVo>;
}

const App = ({ roleId }: RoleSelectProps) => {
    const { t, messages } = useI18n();

    /** 1. 获取权限列表 */
    const { data: page } = usePage('fetchItems', () =>
        fetchItems({ page: '0', size: '10000000' })
    );
    const content = page?.content ?? [];

    /** 2. 列定义（依赖 messages 才能在语言切换时立即更新） */
    const columns: TableColumnsType<PermissionRelevantVo> = useMemo(
        () => [
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
        ],
        [messages] // ⭐ messages 是最稳定、最正确的依赖
    );

    /** 3. 穿梭框状态 */
    const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

    /** 4. 获取已分配权限 */
    const { data: authorized } = useData<string[]>(
        roleId ? ['fetchAuthorized', roleId] : '',
        () => fetchAuthorized(roleId),
        { enabled: !!roleId }
    );

    /** 5. 切换角色时清空状态 */
    useEffect(() => {
        setTargetKeys([]);
    }, [roleId]);

    /** 6. 初始化/更新已分配权限 */
    useEffect(() => {
        if (authorized) {
            setTargetKeys(authorized);
        }
    }, [authorized]);

    /** 7. 穿梭框变更事件 */
    const onChange: TableTransferProps['onChange'] = (
        nextTargetKeys,
        direction,
        moveKeys
    ) => {
        setTargetKeys(nextTargetKeys);

        if (!roleId) return;

        if (direction === 'right') {
            fetchAuthorize({
                roleId,
                permissionIds: moveKeys as string[],
            });
        } else {
            fetchUnauthorized({
                roleId,
                permissionIds: moveKeys as string[],
            });
        }
    };

    /** 8. roleId 为空时不渲染穿梭框（避免内部 DOM 计算报错） */
    if (!roleId) {
        return <div style={{ flex: 1, minHeight: 0 }} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 0 }}>
                <STableTransfer
                    dataSource={content}
                    targetKeys={targetKeys}
                    showSelectAll={false}
                    onChange={onChange}
                    leftColumns={columns}
                    rightColumns={columns}
                    itemKey="id"
                    adaptiveHeight
                    searchable
                />
            </div>
        </div>
    );
};

export default App;
