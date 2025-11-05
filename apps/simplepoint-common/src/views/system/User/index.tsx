import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from "@/api";
import {useI18n} from '@simplepoint/libs-shared/hooks/useI18n';
import React, {useEffect, useState} from "react";
import {Drawer} from "antd";
import RoleSelect from "@simplepoint/libs-components/RoleSelect";

const App = () => {
  const {t, ensure, locale} = useI18n();
  const [open, setOpen] = useState(false);

  // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(['users', 'roles']);
  }, [ensure, locale]);

  const customButtonEvents = {
    onConfigRoles: (_keys: React.Key[], _rows: any[]) => {
      setOpen(true);
    },
  } as const;


  return (
    <div>
      <SimpleTable
        {...apis['rbac-users']}
        customButtonEvents={customButtonEvents}
      />
      <Drawer
        title={t("users.button.configRoles")}
        open={open}
        onClose={() => setOpen(false)}
        placement={"bottom"}
        // height={700}
      >
        <RoleSelect/>
      </Drawer>
    </div>
  );
};

export default App;
