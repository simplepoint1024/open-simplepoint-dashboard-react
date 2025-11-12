import React, {useEffect, useState, useCallback} from 'react';
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
  // 新增：权限配置抽屉可拖拽高度
  const [permDrawerHeight, setPermDrawerHeight] = useState<number>(480);

  useEffect(() => {
    if (!openRoleConfig) {
      setPermDrawerHeight(480);
    }
  }, [openRoleConfig]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = permDrawerHeight;
    const minHeight = 240;
    const maxHeight = Math.max(320, window.innerHeight - 80);
    const onMove = (me: MouseEvent) => {
      const delta = startY - me.clientY; // bottom 抽屉向上拖动增高
      let next = startHeight + delta;
      if (next < minHeight) next = minHeight;
      if (next > maxHeight) next = maxHeight;
      setPermDrawerHeight(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [permDrawerHeight]);

  // 国际化
  const {t, ensure, locale} = useI18n();
  // 确保本页所需命名空间加载（roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(baseConfig.i18nNamespaces);
  }, [ensure, locale]);
  // 自定义添加：若选中一行，则将其 id 作为 parent，默认类型为 item
  const customButtonEvents = {
    add: (_keys: React.Key[], rows: any[]) => {
      const parent = rows && rows.length > 0 ? rows[0]?.id : undefined;
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
        // width 对 bottom 抽屉无效，使用高度控制
        height={permDrawerHeight}
        onClose={() => { setOpenRoleConfig(false); setAuthority(null); }}
        placement={"bottom"}
        destroyOnClose
        styles={{ body: { position: 'relative', paddingTop: 12 } }}
      >
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, cursor: 'ns-resize', zIndex: 10 }}
          onMouseDown={startResize}
        />
        {/* 使用 key 强制在 authority 变化时重建组件，避免内部状态残留 */}
        <PermissionConfig key={authority || 'none'} menuAuthority={authority}/>
      </Drawer>
    </div>
  );
};

export default App;