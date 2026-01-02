import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import {useEffect, useMemo, useState} from "react";
import {GetProp, TableColumnsType, TransferProps} from 'antd';
import STableTransfer from '@simplepoint/components/STableTransfer'
import {useData, usePage} from '@simplepoint/shared/api/methods';
import {fetchItems, PermissionRelevantVo} from "@/api/system/permission.ts";
import {fetchAuthorize, fetchAuthorized, fetchUnauthorized} from "@/api/system/role.ts";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

export interface RoleSelectProps {
    roleId: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
    dataSource: PermissionRelevantVo[];
    leftColumns: TableColumnsType<PermissionRelevantVo>;
    rightColumns: TableColumnsType<PermissionRelevantVo>;
}

// 删除本地 filterOption，启用组件内“全列搜索+高亮”
const App = (props: RoleSelectProps) => {
    const {t, ensure, locale} = useI18n();

    // 获取权限列表数据
    const {data: page} = usePage('fetchItems', () => fetchItems({
        page: '0',
        size: '10000000'
    }));
    const {content} = page || {content: []};

    // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
    useEffect(() => {
        void ensure(['permissions']);
    }, [ensure, locale]);

    const columns: TableColumnsType<PermissionRelevantVo> = useMemo(() => ([
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

    // 获取已分配权限（随 roleId 变化而变化）
    const {data: authorized} = useData<string[]>(
        ['fetchAuthorized', props.roleId],
        () => fetchAuthorized(props.roleId),
        {enabled: !!props.roleId}
    );

    // 切换不同角色时，先清空以避免显示上一次的内容
    useEffect(() => {
        setTargetKeys([]);
    }, [props.roleId]);

    // 初始化/更新已分配权限
    useEffect(() => {
        setTargetKeys(authorized || []);
    }, [authorized]);

    const onChange: TableTransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
        setTargetKeys(nextTargetKeys);
        if (direction === 'right') {
            // 分配权限的逻辑处理
            fetchAuthorize({
                roleId: props.roleId,
                permissionIds: moveKeys as string[],
            }).then(_res => {
                // 处理返回结果
            })
        } else {
            // 移除权限的逻辑处理
            fetchUnauthorized({
                roleId: props.roleId,
                permissionIds: moveKeys as string[],
            }).then(_res => {
                // 处理返回结果
            })
        }
    };

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
                    itemKey={'id'}
                    adaptiveHeight={true}
                    searchable={true}
                    // 如需微调底部空隙，可调整 scrollOffset（例如 8、12、16）
                    // scrollOffset={8}
                />
            </div>
        </div>
    );
};

export default App;
