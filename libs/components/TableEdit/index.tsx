import React from 'react';
import {Button, Drawer, Form, FormProps, Input} from 'antd';
import {ClearOutlined, SaveOutlined} from "@ant-design/icons";
import {TableColumnsTypeInfo} from "../Table";
import {post, put} from "@simplepoint/libs-shared/types/request";

export interface TableEditProps<T> {
  open: boolean;
  edit: boolean;
  api: string;
  columns: TableColumnsTypeInfo<T>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rowKey: string;
  form?: FormProps<T>;
  refresh: () => Promise<void>;
}

export const App = <T extends object>(
  props: TableEditProps<T>
) => {
  const [form] = Form.useForm();
  const onFinish: FormProps['onFinish'] = (values) => {
    if (props.edit) {
      put<T>(props.api, {[props.rowKey]:props.form?.initialValues?.[props.rowKey], ...values}).then(() => {        props.setOpen(false);
        form.resetFields()
        props.refresh().then()
      })
    } else {
      post<T>(props.api, values).then(() => {
        props.setOpen(false);
        form.resetFields()
        props.refresh().then()
      })
    }
  };

  const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <Drawer
        title={props.edit ? 'Edit Item' : 'Add Item'}
        placement='right'
        closable={false}
        onClose={() => props.setOpen(false)}
        open={props.open}
        key='right'
      >
        <Form
          name="basic"
          form={form}
          labelCol={{span: 8}}
          wrapperCol={{span: 16}}
          style={{maxWidth: 600}}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          {...props.form}
        >
          {props.columns.filter(col => !(col as TableColumnsTypeInfo<T>).readonly).map((col) => (
            <Form.Item
              key={col.key as string}
              label={col.title as string}
              name={col.key as string}
              required={(col as TableColumnsTypeInfo<T>).required}
              rules={[
                {
                  required: (col as TableColumnsTypeInfo<T>).required,
                  type: (col as TableColumnsTypeInfo<T>).type === 'number' ? 'number' : 'string'
                }
              ]}
            >
              {<Input type={(col as TableColumnsTypeInfo<T>).type}/>}
            </Form.Item>
          ))}

          <Form.Item label={null}>
            <Button className='button-col' type="primary" htmlType="submit" icon={<SaveOutlined/>}>
              保存
            </Button>
            <Button className='button-col' type="primary" variant='solid' color='danger' htmlType="reset"
                    icon={<ClearOutlined/>}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

