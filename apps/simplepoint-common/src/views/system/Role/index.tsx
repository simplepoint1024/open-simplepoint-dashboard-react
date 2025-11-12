import SimpleTable from "@simplepoint/components/SimpleTable";
import api from '@/api/index';
import React, {useEffect, useState} from 'react';
import {Drawer} from "antd";
import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import PermissionConfig from './config/permission'

// 获取基础表格配置
const baseConfig = api['rbac-roles'];

const App = () => {
  const [openRoleConfig, setOpenRoleConfig] = useState(false);
  const [authority, setAuthority] = useState<string | null>(null);

  // 国际化
  const {t, ensure, locale} = useI18n();
  // 确保本页所需命名空间加载（roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(baseConfig.i18nNamespaces);
  }, [ensure, locale]);

  // 自定义按钮事件
  const customButtonEvents = {
    // 角色权限配置
    'config.permission': (_keys: React.Key[], rows: any[]) => {
      setOpenRoleConfig(true);
      setAuthority(rows[0].authority);
    },
  };

  return (
    <div>
      <SimpleTable
        {...baseConfig}
        customButtonEvents={customButtonEvents}
      />
      <Drawer
        title={t("roles.config.permission")}
        open={openRoleConfig}
        onClose={() => { setOpenRoleConfig(false); setAuthority(null); }}
        placement={"bottom"}
        width={720}
        destroyOnClose
      >
        <PermissionConfig key={authority || 'none'} roleAuthority={authority}/>
      </Drawer>
    </div>
  );
};

export default App;