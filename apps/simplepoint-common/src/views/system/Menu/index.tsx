import React, {useEffect, useState} from 'react';
import SimpleTable from "@simplepoint/components/SimpleTable";
import api from '@/api/index';
import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import {Drawer} from "antd";
import PermissionConfig from "@/views/system/Menu/config/permission";
const baseConfig = api['rbac-menus'];

const App = () => {
  // 受控抽屉与编辑数据
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [initialValues, setInitialValues] = useState<any>({});
  const [openRoleConfig, setOpenRoleConfig] = useState(false);
  const [authority, setAuthority] = useState<string | null>(null);

  // 国际化
  const {t, ensure, locale} = useI18n();
  // 确保本页所需命名空间加载（roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(baseConfig.i18nNamespaces);
  }, [ensure, locale]);
  // 自定义添加：若选中一行，则将其 uuid 作为 parent，默认类型为 item
  const customButtonEvents = {
    add: (_keys: React.Key[], rows: any[]) => {
      const parent = rows && rows.length > 0 ? rows[0]?.uuid : undefined;
      const path = rows && rows.length > 0 ? rows[0]?.path : undefined;
      setEditingRecord(null);
      setInitialValues({path, parent, type: 'item'});
      setDrawerOpen(true);
    },
    'config.permission':(_keys: React.Key[], rows: any[]) => {
      setOpenRoleConfig(true);
      setAuthority(rows[0].authority);
    },
  } as const;

  return (
    <div>
      <SimpleTable
        {...api['rbac-menus']}
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
        editingRecord={editingRecord}
        onEditingRecordChange={setEditingRecord}
        initialValues={initialValues}
        customButtonEvents={customButtonEvents}
      />
      <Drawer
        title={t("menus.config.permission")}
        open={openRoleConfig}
        width={1440}
        onClose={() => { setOpenRoleConfig(false); setAuthority(null); }}
        placement={"bottom"}
      >
        {/* 使用 key 强制在 authority 变化时重建组件，避免内部状态残留 */}
        <PermissionConfig key={authority || 'none'} menuAuthority={authority}/>
      </Drawer>
    </div>
  );
};

export default App;