import SimpleTable from "@simplepoint/components/SimpleTable";
import api from '@/api/index';
import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import React, {useEffect, useState} from "react";
import {Drawer} from "antd";
import RoleConfig from "./config/role";
const baseConfig = api['rbac-users'];


const App = () => {
  const {t, ensure, locale} = useI18n();
  const [username, setUsername] = useState(null as string | null);
  const [open, setOpen] = useState(false);

  // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(baseConfig.i18nNamespaces);
  }, [ensure, locale]);

  const customButtonEvents = {
    'config.role': (_keys: React.Key[], rows: any[]) => {
      setOpen(true);
      setUsername(rows[0].username)
    },
  } as const;


  return (
    <div>
      <SimpleTable
        {...baseConfig}
        customButtonEvents={customButtonEvents}
      />
      <Drawer
        title={t("users.button.config.role")}
        open={open}
        onClose={() => { setOpen(false); setUsername(null); }}
        placement={"bottom"}
        destroyOnClose
      >
        <RoleConfig key={username || 'none'} username={username}/>
      </Drawer>
    </div>
  );
};

export default App;
