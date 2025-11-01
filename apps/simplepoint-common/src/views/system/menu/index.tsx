import React, {useState} from 'react';
import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from '@/api';

const App = () => {
  // 受控抽屉与编辑数据
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [initialValues, setInitialValues] = useState<any>({});

  // 自定义添加：若选中一行，则将其 uuid 作为 parent，默认类型为 item
  const customButtonEvents = {
    add: (_keys: React.Key[], rows: any[]) => {
      const parent = rows && rows.length > 0 ? rows[0]?.uuid : undefined;
      const path = rows && rows.length > 0 ? rows[0]?.path : undefined;
      setEditingRecord(null);
      setInitialValues({path, parent, type: 'item'});
      setDrawerOpen(true);
    },
  } as const;

  return (
    <div>
      <SimpleTable
        {...apis['rbac-menus']}
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
        editingRecord={editingRecord}
        onEditingRecordChange={setEditingRecord}
        initialValues={initialValues}
        customButtonEvents={customButtonEvents}
      />
    </div>
  );
};

export default App;