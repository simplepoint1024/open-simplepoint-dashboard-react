// typescript
// file: `libs/components/Table/index.tsx`
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Col, Input, Popover, Row, Select, Space, Table as AntTable } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { RJSFSchema } from '@rjsf/utils';
import { Pageable } from '@simplepoint/libs-shared/types/request';

const options = [
  { value: 'equals', label: '精确' },
  { value: 'not:equals', label: '精确取反' },
  { value: 'like', label: '模糊' },
  { value: 'not:like', label: '模糊取反' },
  { value: 'in', label: '集合包含' },
  { value: 'not:in', label: '集合不包含' },
  { value: 'between', label: '区间' },
  { value: 'not:between', label: '区间取反' },
  { value: 'than:greater', label: '大于' },
  { value: 'than:less', label: '小于' },
  { value: 'than:equal:greater', label: '大于等于' },
  { value: 'than:equal:less', label: '小于等于' },
  { value: 'is:null', label: '空' },
  { value: 'is:not:null', label: '非空' },
];

export interface TableProps<T> {
  refresh: () => void;
  pageable: Pageable<T>;
  schema: RJSFSchema | any[]; // 支持 schema 为对象或数组
  filters?: Record<string, string>; // 初始过滤器，例如 { username: 'like:张' }
  onFilterChange?: (filters: Record<string, string>) => void;
  onChange?: (pagination: any, filters?: any, sorter?: any, extra?: any) => void;
  // 行选择相关
  rowSelection?: { selectedKeys?: React.Key[] }; // 可选受控初始选中 keys
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
}

/* 可复用的列过滤组件，内部使用 Hook 安全 */
const ColumnFilter: React.FC<{
  initialOp?: string;
  initialText?: string;
  onChange?: (op: string, text: string) => void;
}> = ({ initialOp = 'like', initialText = '', onChange }) => {
  const [inputValue, setInputValue] = useState(initialText);
  const [selectValue, setSelectValue] = useState(initialOp);

  useEffect(() => {
    onChange?.(selectValue, inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectValue, inputValue]);

  useEffect(() => {
    setSelectValue(initialOp);
    setInputValue(initialText);
  }, [initialOp, initialText]);

  return (
    <div>
      <Space.Compact>
        <Select style={{ width: 160 }} value={selectValue} options={options} onChange={(value) => setSelectValue(value)} />
        <Input value={inputValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)} />
      </Space.Compact>
    </div>
  );
};

const parseOp = (stored?: string) => {
  if (!stored) return 'like';
  const idx = stored.indexOf(':');
  return idx === -1 ? stored : stored.slice(0, idx);
};
const parseText = (stored?: string) => {
  if (!stored) return '';
  const idx = stored.indexOf(':');
  return idx === -1 ? '' : stored.slice(idx + 1);
};

const App = <T extends object = any>({ props }: { props: TableProps<T> }) => {
  // 本地 filters 状态（受控/非受控兼容）
  const [filters, setFilters] = useState<Record<string, string>>(props.filters ?? {});

  // 外部 filters 更新时同步
  useEffect(() => {
    setFilters(props.filters ?? {});
  }, [props.filters]);

  // 将 schema 转换为 properties 对象，兼容数组或对象
  const properties = useMemo(() => {
    const s = props.schema;
    if (Array.isArray(s)) {
      return (s as any[]).reduce((acc, cur) => {
        const key = cur.name ?? cur.key ?? cur.id;
        if (key) acc[key] = cur;
        return acc;
      }, {} as Record<string, any>);
    }
    return (s as any)?.properties ?? s ?? {};
  }, [props.schema]);

  // 列可见性状态，初次根据 properties 初始化
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const keys = Object.keys(properties);
    setVisibleCols((prev) => {
      // 保留已有设置，未设置的默认显示
      const next: Record<string, boolean> = {};
      keys.forEach((k) => {
        next[k] = k in prev ? prev[k] : true;
      });
      return next;
    });
  }, [properties]);

  const toggleCol = (key: string, checked: boolean) => {
    setVisibleCols((prev) => ({ ...prev, [key]: checked }));
  };

  const columns = useMemo<ColumnsType<T>>(() => {
    return Object.entries(properties)
      .filter(([key]) => visibleCols[key]) // 修复：未显式为 false 时默认显示
      .map(([key, schemaDef]) => {
        const isBoolean = (schemaDef as any)?.type === 'boolean';
        return {
          title: (schemaDef as any)?.title ?? key,
          dataIndex: key,
          key,
          // 对布尔类型做可视化处理：用禁用的 Checkbox 或 是/否 文本
          render: isBoolean
            ? (val: any) => (
              <span style={{ display: 'inline-block', width: '100%', textAlign: 'center', color: val ? '#52c41a' : '#999' }}>
                {val ? '√' : '×'}
              </span>
            )
            : undefined,
          filterDropdown: () => (
            <ColumnFilter
              initialOp={parseOp(filters[key])}
              initialText={parseText(filters[key])}
              onChange={(op, text) => {
                const value = text ? `${op}:${text}` : '';
                const next = { ...filters };
                if (value) next[key] = value;
                else delete next[key];
                setFilters(next);
                props.onFilterChange?.(next);
                props.refresh();
              }}
            />
          ),
          filterIcon: () => <SearchOutlined style={{ color: filters[key] ? '#1677ff' : undefined }} />,
        };
      });
  }, [properties, visibleCols, filters, props]);

  const dataSource = props.pageable?.content ?? [];

  const pagination = {
    total: props.pageable?.page?.totalElements ?? 0,
    pageSize: props.pageable?.page?.size ?? 10,
    current: (props.pageable?.page?.number ?? 0) + 1,
    showSizeChanger: true,
  };

  // 行选择状态（支持受控 initial）
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(props.rowSelection?.selectedKeys ?? []);

  // 外部受控变化同步
  useEffect(() => {
    if (props.rowSelection?.selectedKeys) {
      setSelectedRowKeys(props.rowSelection.selectedKeys);
    }
  }, [props.rowSelection?.selectedKeys]);

  // 根据 key 来寻找对应的行（用于回调） - 不使用 index 参数以避免 Antd 的 deprecation 警告
  const keyOfRecord = useCallback((record: T): React.Key => {
    return ((record as any).id ?? (record as any).key ?? 0) as React.Key;
  }, []);

  const onSelectChange = (keys: React.Key[], rows: T[]) => {
    setSelectedRowKeys(keys);
    props.onSelectionChange?.(keys, rows);
  };

  // Popover 内容：列开关列表
  const settingsContent = (
    <div style={{ maxHeight: 320, overflow: 'auto', padding: 8 }}>
      <Checkbox
        checked={Object.values(visibleCols).length > 0 && Object.values(visibleCols).every(Boolean)}
        onChange={(e) => {
          const checked = e.target.checked;
          const next: Record<string, boolean> = {};
          Object.keys(properties).forEach((k) => (next[k] = checked));
          setVisibleCols(next);
        }}
        style={{ marginBottom: 8 }}
      >
        全选
      </Checkbox>
      <div>
        {Object.entries(properties).map(([key, schemaDef]) => (
          <div key={key} style={{ padding: '4px 0' }}>
            <Checkbox checked={visibleCols[key] ?? true} onChange={(e) => toggleCol(key, e.target.checked)}>
              {(schemaDef as any)?.title ?? key}
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );

  // Antd rowSelection 配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: T[]) => onSelectChange(keys, rows),
  };

  return (
    <div>
      <Row justify="space-between">
        <Col key="table-buttons-start" />
        <Col key="table-buttons-end">
          <Button className="button-col" key="search" type="text" icon={<SearchOutlined />} onClick={() => props.refresh()} />
          <Popover placement="bottomRight" content={settingsContent} trigger="click">
            <Button icon={<SettingOutlined />} type="text" style={{ marginLeft: 8 }} />
          </Popover>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <AntTable<T>
            bordered
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            rowKey={keyOfRecord}
            onChange={props.onChange}
            rowSelection={rowSelection}
          />
        </Col>
      </Row>
    </div>
  );
};

export default App;