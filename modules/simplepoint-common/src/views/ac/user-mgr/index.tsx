import Table, {
  getTable,
  ParameterTypeInstance,
  TableApiRequest,
  TableApiRequestEmpty
} from "@simplepoint/libs-components/Table";
import React, {useEffect, useState} from "react";
import {App as TableEdit} from "@simplepoint/libs-components/TableEdit";
import {SERVICE_USER} from "@/services.ts";

type DataType = {
  key: string,
  name: string,
  age: number,
  address: string,
  na: string,
}

const App = () => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [table, setTable] = useState<TableApiRequest<DataType>>(() => TableApiRequestEmpty);
  const [params] = useState(() => ParameterTypeInstance);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<DataType[]>([]);

  const api = SERVICE_USER;

  const refresh = async () => {
    setTable(await getTable<DataType>(api, params))
  }

  useEffect(() => {
    refresh().then()
  }, [])

  return (
    <div>
      <Table<DataType>
        conf={{
          columns: table.schema,
          data: table.pageable,
          buttons: table.buttons,
          params: params,
          rowKey: 'id',
          rowSelection: {
            type: 'checkbox',
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedRowKeys(selectedRowKeys);
              setSelectedRows(selectedRows);
            }
          },
          buttonEventProps: {
            api: api,
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows,
            openEdit: (open: boolean, edit: boolean) => {
              setOpen(open);
              setEdit(edit);
            }
          },
          refresh: refresh,
        }}
      />
      <TableEdit
        key={open ? 'open' : 'closed'}
        open={open}
        edit={edit}
        api={api}
        rowKey="id"
        columns={table.schema}
        setOpen={setOpen}
        form={{
          initialValues: selectedRows[0] || undefined,
        }}
        refresh={refresh}
      />
    </div>
  );
};

export default App;
