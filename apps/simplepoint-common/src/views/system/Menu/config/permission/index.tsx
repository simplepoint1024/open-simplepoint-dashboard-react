import { useI18n } from '@simplepoint/shared/hooks/useI18n';
import { useEffect, useMemo, useState } from 'react';
import { GetProp, TableColumnsType, TransferProps } from 'antd';
import STableTransfer from '@simplepoint/components/STableTransfer';
import { useData, usePage } from '@simplepoint/shared/api/methods';
import { fetchItems, PermissionRelevantVo } from '@/api/system/permission.ts';
import {
    fetchAuthorize,
    fetchAuthorized,
    fetchUnauthorized,
    RolePermissionRelevantDto,
} from '@/api/system/menu';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

export interface RoleSelectProps {
    menuId: string | null;
}

interface TableTransferProps extends TransferProps<TransferItem> {
    dataSource: RolePermissionRelevantDto[];
    leftColumns: TableColumnsType<RolePermissionRelevantDto>;
    rightColumns: TableColumnsType<RolePermissionRelevantDto>;
}

const App = ({ menuId }: RoleSelectProps) => {
    const { t, messages } = useI18n();

    /** 1. menuId 为空时不渲染，避免内部 DOM 计算报错 */
    if (!menuId) {
        return <div style={{ flex: 1, minHeight: 0 }} />;
    }

    /** 2. 获取权限列表 */
    const { data: page } = usePage('fetchItems', () =>
        fetchItems({ page: '0', size: '10000000' })
    );
    const content = page?.content ?? [];

    /** 3. 列定义（依赖 messages 才能在语言切换时立即更新） */
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
        [messages] // ⭐ messages 是最正确的依赖
    );

    /** 4. 穿梭框状态 */
    const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

    /** 5. 获取已分配权限 */
    const { data: authorized } = useData<string[]>(
        menuId ? ['fetchAuthorizedMenuPermissions', menuId] : '',
        () => fetchAuthorized({ menuId }),
        { enabled: !!menuId }
    );

    /** 6. 切换菜单时清空状态 */
    useEffect(() => {
        setTargetKeys([]);
    }, [menuId]);

    /** 7. 初始化/更新已分配权限 */
    useEffect(() => {
        if (authorized) {
            setTargetKeys(authorized);
        }
    }, [authorized]);

    /** 8. 穿梭框变更事件 */
    const onChange: TableTransferProps['onChange'] = (
        nextTargetKeys,
        direction,
        moveKeys
    ) => {
        setTargetKeys(nextTargetKeys);

        if (direction === 'right') {
            fetchAuthorize({
                menuId,
                permissionIds: moveKeys as string[],
            });
        } else {
            fetchUnauthorized({
                menuId,
                permissionIds: moveKeys as string[],
            });
        }
    };

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
