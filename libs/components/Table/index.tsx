import {Button, ButtonProps, Col, Input, Row, Select, Space, Table, TableColumnsType, TableProps} from 'antd';
import {get, Page, Pageable} from '@simplepoint/libs-shared/types/request'
import {SearchOutlined} from "@ant-design/icons";
import {ChangeEvent, useState} from "react";
import {ButtonEventProps, ButtonEvents} from "../ButtonEvents";
import {ButtonDisabledRules} from "../ButtonDisabledRules";
import {createIcon} from "@simplepoint/libs-shared/types/icon";

const TABLE_METADATA_API = '/schema';

export type ParameterType = Record<string, any> & Page;

export const ParameterTypeInstance: ParameterType = {
  number: 0,
  size: 10,
}

export interface TableConfig<T> extends TableProps<T> {
  data: Pageable<T>;
  columns: TableColumnsType<T>;
  buttons: Array<TableButtonProps>;
  buttonEventProps: ButtonEventProps<T>;
  params: ParameterType;
  refresh: () => Promise<void>;
}

export interface TableButtonProps extends ButtonProps {
  text?: string;
  key?: string | number;
  iconTag?: string;
}

export interface TableColumnsTypeInfo<T> extends TableColumnsType<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  readonly ?: boolean;
  type?: string;
}

export interface TableApiRequest<T> {
  pageable: Pageable<T>
  schema: TableColumnsTypeInfo<T>
  buttons: Array<TableButtonProps>
}

export const TableApiRequestEmpty: TableApiRequest<any> = {
  pageable: {
    content: [],
    page: {
      number: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    }
  },
  schema: [],
  buttons: []
}

export interface TableSchema {
  columns: TableColumnMetadata[];
  buttons?: Array<TableButtonProps>;
}

export interface TableColumnMetadata {
  name: string;
  value: string;
  accessValue?: string;
  javaType?: string;
  typeScriptType?: string;
  format?: string;
  sort?: number;
  hidden?: boolean;
  nullable?: boolean;
  readonly?: boolean;
  maxLength?: number;
  minLength?: number;
  description?: string;
}

const options = [
  {
    value: 'equals',
    label: '精确',
  },
  {
    value: 'not:equals',
    label: '精确取反',
  },
  {
    value: 'like',
    label: '模糊',
  },
  {
    value: 'not:like',
    label: '模糊取反',
  },
  {
    value: 'in',
    label: '集合包含',
  },
  {
    value: 'not:in',
    label: '集合不包含',
  },
  {
    value: 'between',
    label: '区间',
  },
  {
    value: 'not:between',
    label: '区间取反',
  },
  {
    value: 'than:greater',
    label: '大于',
  },
  {
    value: 'than:less',
    label: '小于',
  },
  {
    value: 'than:equal:greater',
    label: '大于等于',
  },
  {
    value: 'than:equal:less',
    label: '小于等于',
  },
  {
    value: 'is:null',
    label: '空',
  },
  {
    value: 'is:not:null',
    label: '非空',
  },
];

export async function getTable<T>(url: string, params?: Record<string, any>): Promise<TableApiRequest<T>> {
  const pageable = await get<Pageable<T>>(url, params);
  const {columns, buttons} = await get<TableSchema>(`${url}${TABLE_METADATA_API}`);

  return {
    pageable,
    buttons: buttons || [],
    schema: columns.map((item) => ({
      title: item.name,
      dataIndex: item.value,
      key: item.value,
      width: 'auto',
      hidden: item.hidden,
      readonly: item.readonly,
      required: !item.nullable,
      type: item.typeScriptType,
      filterDropdown: () => {
        const [inputValue, setInputValue] = useState('');
        const [selectValue, setSelectValue] = useState('like');

        const setValue = (event: ChangeEvent<HTMLInputElement>) => {
          setInputValue(event.target.value);
          if (params) {
            if (event.target.value === '') {
              delete params[item.value]
            } else {
              params[item.value] = selectValue ? `${selectValue}:${event.target.value}` : event.target.value;
            }
          }
        }
        return (
          <div>
            <Space.Compact>
              <Select
                style={{width: '160px'}}
                value={selectValue}
                options={options}
                onChange={(value) => setSelectValue(value)}
              />
              <Input
                value={inputValue}
                onChange={(e) => {
                  setValue(e);
                }}/>
            </Space.Compact>
          </div>
        )
      },
      filterIcon: () => (
        <SearchOutlined style={{color: params?.[item.value] ? '#1677ff' : undefined}}/>
      ),
    })) as TableColumnsTypeInfo<T>
  } as TableApiRequest<T>;
}

const App = <T extends object = any>(
  {
    conf
  }: {
    conf: TableConfig<T>;
  }) => {
  return (
    <div>
      <Row justify='space-between'>
        <Col key='table-buttons-start'>
          {conf.buttons.map(({key, ...buttonProps}) => (
            <Button
              className='button-col'
              key={key}
              onClick={() => {
                if (ButtonEvents[key as keyof typeof ButtonEvents]) {
                  ButtonEvents[key as keyof typeof ButtonEvents](conf.buttonEventProps, conf.refresh);
                } else {
                  console.warn(`Button event for key "${key}" is not defined.`);
                }
              }}
              disabled={
                ButtonDisabledRules[key as keyof typeof ButtonDisabledRules] ?
                  ButtonDisabledRules[key as keyof typeof ButtonDisabledRules](conf.buttonEventProps) :
                  false
              }
              {...{
                ...buttonProps,
                icon: buttonProps.icon ? typeof buttonProps.icon === 'string' ? createIcon(buttonProps.icon) : buttonProps.icon : undefined
              } as ButtonProps}
            >
              {buttonProps.text}
            </Button>
          ))}
        </Col>
        <Col key='table-buttons-end'>
          <Button
            className='button-col'
            key='search' type="text"
            icon={<SearchOutlined/>}
            onClick={() => conf.refresh().then()}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table<T> bordered
                    dataSource={conf.dataSource ? conf.dataSource : conf.data.content}
                    pagination={conf.pagination ? conf.pagination : {
                      total: conf.data.page.totalElements,
                      pageSize: conf.data.page.size,
                      current: conf.data.page.number + 1,
                      showSizeChanger: true,
                      onChange: (page, pageSize) => {
                        conf.params.number = page - 1;
                        conf.params.size = pageSize;
                        conf.refresh().then();
                      }
                    }}
                    {...conf}
          />
        </Col>
      </Row>
    </div>
  );
};

export default App;