import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from "@/api";
import React, {useState} from 'react';
import {Drawer, Tabs} from "antd";
import { useI18n } from '@simplepoint/libs-shared/hooks/useI18n';
import MenuConfig from './config/menu'

const App = () => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Array<any>>([]);

  const customButtonEvents = {
    permissionConfig: (_keys: React.Key[], rows: any[]) => {
      setOpen(true);
      setRows(rows);
    },
  } as const;

  const {t} =useI18n();
  return (
    <div>
      <SimpleTable
        {...apis['rbac-roles']}
        customButtonEvents={customButtonEvents}
      />
      <Drawer
        title={t("roles.permissionConfig.title")}
        open={open}
        onClose={() => setOpen(false)}
        width={720}
      >
        <Tabs
          defaultActiveKey="2"
          items={[
            {
              label: t('roles.permissionConfig.menu'),
              key: 'MenuPermissionConfig',
              children: <MenuConfig selectRow = {rows[0]}/>
            }
          ]}
        />
      </Drawer>
    </div>
  );
};

export default App;