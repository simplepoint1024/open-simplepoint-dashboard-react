import React, {ChangeEvent, MouseEventHandler, useCallback, useEffect, useMemo, useState} from 'react';
import {Button, Checkbox, Col, Input, Popover, Row, Select, Space, Table as AntTable} from 'antd';
import {SearchOutlined, SettingOutlined} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import {RJSFSchema} from '@rjsf/utils';
import {Pageable} from '@simplepoint/libs-shared/types/request';
import {ButtonProps} from "antd/es/button/button";
import {createIcon} from '@simplepoint/libs-shared/types/icon';


export type TableButtonProps = ButtonProps & {
  key: string;
  sort: number;
  argumentMaxSize?: number;
  argumentMinSize?: number;
  text?: string; // 兼容 schema 按钮结构
  color?: string; // 兼容 schema 按钮结构
  variant?: string; // 兼容 schema 按钮结构
};

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
  // 按钮事件
  onButtonEvents?: Record<string, (selectedRowKeys: React.Key[], selectedRows: T[], props: TableButtonProps) => void>;
  buttons?: TableButtonProps[]
  // 可选：列可见性持久化 key（localStorage）
  storageKey?: string;
}

// 轻量 i18n t() 获取
const useI18nT = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick(v => v + 1);
    try { window.addEventListener('sp-i18n-updated', h as any); } catch {}
    return () => { try { window.removeEventListener('sp-i18n-updated', h as any); } catch {} };
  }, []);
  const t: (key: string, fallback?: string) => string = (window as any)?.spI18n?.t || ((k: string, f?: string) => f ?? k);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  tick; // 让语言切换触发重渲染
  return t;
};

/* 可复用的列过滤组件，内部使用 Hook 安全 */
const ColumnFilter: React.FC<{
  initialOp?: string;
  initialText?: string;
  onChange?: (op: string, text: string) => void;
  options: Array<{ value: string; label: string }>;
}> = ({initialOp = 'like', initialText = '', onChange, options}) => {
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
        <Select style={{width: 160}} value={selectValue} options={options} onChange={(value) => setSelectValue(value)}/>
        <Input value={inputValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}/>
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

// Helper: 解析可见性的三态值（true/false/undefined）
const parseVisibleTriState = (val: any): boolean | undefined => {
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  if (val === false || val === 'false' || val === 0 || val === '0') return false;
  return undefined;
};

// 读取 schema 中的可见性标记，兼容多种写法：
// - 嵌套: x-ui.x-list.visible
// - 扁平: 'x-ui.x-list.visible'
// - 兼容历史: x-ui.x-list-visible 或 x-list-visible
const readVisibleFlag = (schema: any): boolean | undefined => {
  if (!schema) return undefined;
  const nested = schema?.['x-ui']?.['x-list']?.['visible'];
  const flat = schema?.['x-ui.x-list.visible'];
  const legacy1 = schema?.['x-ui']?.['x-list-visible'];
  const legacy2 = schema?.['x-list-visible'];
  return (
    parseVisibleTriState(nested) ??
    parseVisibleTriState(flat) ??
    parseVisibleTriState(legacy1) ??
    parseVisibleTriState(legacy2)
  );
};

// 读取 x-ui.x-list.* 元数据（兼容多种写法）
const readListProp = (schema: any, key: string) => {
  if (!schema) return undefined;
  const xui = schema?.['x-ui'] ?? {};
  const nested = xui?.['x-list']?.[key];
  const flat = schema?.[`x-ui.x-list.${key}`];
  const legacy1 = xui?.[`x-list-${key}`];
  const legacy2 = schema?.[`x-list-${key}`];
  return nested ?? flat ?? legacy1 ?? legacy2;
};

// 最终判定：当任意字段声明了可见性时，仅渲染被标记为 true 的；否则回退为全部可见
const computeVisibleKeys = (properties: Record<string, any>): string[] => {
  const entries = Object.keys(properties).map((key) => ({ key, flag: readVisibleFlag(properties[key]) }));
  const anyDeclared = entries.some((e) => e.flag !== undefined);
  if (anyDeclared) {
    return entries.filter((e) => e.flag === true).map((e) => e.key);
  }
  return Object.keys(properties);
};

const App = <T extends object = any>(props: TableProps<T>) => {
  const t = useI18nT();
  useEffect(() => { try { (window as any)?.spI18n?.ensure?.(['table']); } catch {} }, []);

  // 本地化过滤器选项
  const localizedOptions = useMemo(() => ([
    {value: 'equals', label: t('table.filter.equals', '精确')},
    {value: 'not:equals', label: t('table.filter.notEquals', '精确取反')},
    {value: 'like', label: t('table.filter.like', '模糊')},
    {value: 'not:like', label: t('table.filter.notLike', '模糊取反')},
    {value: 'in', label: t('table.filter.in', '集合包含')},
    {value: 'not:in', label: t('table.filter.notIn', '集合不包含')},
    {value: 'between', label: t('table.filter.between', '区间')},
    {value: 'not:between', label: t('table.filter.notBetween', '区间取反')},
    {value: 'than:greater', label: t('table.filter.greater', '大于')},
    {value: 'than:less', label: t('table.filter.less', '小于')},
    {value: 'than:equal:greater', label: t('table.filter.ge', '大于等于')},
    {value: 'than:equal:less', label: t('table.filter.le', '小于等于')},
    {value: 'is:null', label: t('table.filter.isNull', '空')},
    {value: 'is:not:null', label: t('table.filter.notNull', '非空')},
  ]), [t]);

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
        const key = (cur as any).name ?? (cur as any).key ?? (cur as any).id;
        if (key) acc[key] = cur;
        return acc;
      }, {} as Record<string, any>);
    }
    return (s as any)?.properties ?? s ?? {};
  }, [props.schema]);

  // 基于 schema 的可见性规则，计算可见列；若无声明则全部可见
  const visibleKeys = useMemo(() => computeVisibleKeys(properties), [properties]);

  // 列可见性状态，初次根据 properties 初始化 + 本地持久化
  const storageKey = useMemo(() => (props.storageKey ? `sp.table.cols.${props.storageKey}` : undefined), [props.storageKey]);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({});

  // 初次/visibleKeys 变化：从 localStorage 恢复
  useEffect(() => {
    setVisibleCols((prev) => {
      const base: Record<string, boolean> = {};
      // 默认可见
      visibleKeys.forEach((k) => { base[k] = k in prev ? prev[k] : true; });
      try {
        if (storageKey) {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const saved = JSON.parse(raw) as Record<string, boolean>;
            visibleKeys.forEach((k) => { if (typeof saved[k] === 'boolean') base[k] = saved[k]; });
          }
        }
      } catch {}
      return base;
    });
  }, [visibleKeys, storageKey]);

  // 持久化 visibleCols
  useEffect(() => {
    try {
      if (storageKey && Object.keys(visibleCols).length) {
        const payload: Record<string, boolean> = {};
        visibleKeys.forEach((k) => { if (typeof visibleCols[k] === 'boolean') payload[k] = visibleCols[k]; });
        localStorage.setItem(storageKey, JSON.stringify(payload));
      }
    } catch {}
  }, [visibleCols, visibleKeys, storageKey]);

  const toggleCol = (key: string, checked: boolean) => {
    setVisibleCols((prev) => ({...prev, [key]: checked}));
  };

  // 生成列（支持从 schema 的 x-ui.x-list.* 读取元信息）
  const columns = useMemo<ColumnsType<T>>(() => {
    const ordered = Object.entries(properties)
      .map(([key, schemaDef]) => ({
        key,
        schemaDef,
        order: readListProp(schemaDef, 'order') ?? Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => (a.order as number) - (b.order as number));

    return ordered
      .filter(({key}) => (visibleCols[key] ?? visibleKeys.includes(key)))
      .map(({key, schemaDef}) => {
        const listTitle = readListProp(schemaDef, 'title');
        const title = listTitle ?? (schemaDef as any)?.title ?? key;
        const alignFromSchema = readListProp(schemaDef, 'align');
        const fixed = readListProp(schemaDef, 'fixed');
        const width = readListProp(schemaDef, 'width');
        const ellipsis = readListProp(schemaDef, 'ellipsis');
        const sortable = readListProp(schemaDef, 'sortable');
        const filterableRaw = readListProp(schemaDef, 'filterable');
        const filterable = filterableRaw === undefined ? true : !!filterableRaw;
        const di = readListProp(schemaDef, 'dataIndex');
        const dataIndex = typeof di === 'string' ? (di.includes('.') ? di.split('.') : di) : (di ?? key);

        const isBoolean = (schemaDef as any)?.type === 'boolean';
        const isNumber = (schemaDef as any)?.type === 'number' || (schemaDef as any)?.type === 'integer';

        const align = key === 'icon' ? 'center' : (alignFromSchema ?? (isNumber ? 'right' : undefined));

        const renderCell = isBoolean
          ? (val: any) => (
              <span
                style={{display: 'inline-block', width: '100%', textAlign: 'center', color: val ? '#52c41a' : '#999'}}>
                {val ? '√' : '×'}
              </span>
            )
          : key === 'icon'
            ? (val: any) => (
                <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                  {typeof val === 'string' ? createIcon(val) : null}
                </span>
              )
            : undefined;

        const column: any = {
          title,
          dataIndex,
          key,
          align,
          fixed,
          width,
          ellipsis,
        };

        if (sortable) column.sorter = true;

        if (filterable) {
          column.filterDropdown = () => (
            <ColumnFilter
              initialOp={parseOp(filters[key])}
              initialText={parseText(filters[key])}
              onChange={(op, text) => {
                const value = text ? `${op}:${text}` : '';
                const next = {...filters};
                if (value) next[key] = value; else delete next[key];
                setFilters(next);
                props.onFilterChange?.(next);
                props.refresh();
              }}
              options={localizedOptions}
            />
          );
          column.filterIcon = () => <SearchOutlined style={{color: filters[key] ? '#1677ff' : undefined}}/>;
        }

        if (renderCell) column.render = renderCell;

        return column;
      });
  }, [properties, visibleCols, visibleKeys, filters, props, localizedOptions]);

  const dataSource = props.pageable?.content ?? [];

  const pagination = {
    total: props.pageable?.page?.totalElements ?? 0,
    pageSize: props.pageable?.page?.size ?? 10,
    current: (props.pageable?.page?.number ?? 0) + 1,
    showSizeChanger: true,
  };

  // 行选择状态（支持受控 initial）
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(props.rowSelection?.selectedKeys ?? []);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

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

  const onSelectChange = useCallback(
    (keys: React.Key[], rows: T[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
      props.onSelectionChange?.(keys, rows);
    },
    [props],
  );

  const onButtonEvent = (button: TableButtonProps): MouseEventHandler<HTMLElement> | undefined => {
    if (button.onClick) {
      return button.onClick as MouseEventHandler<HTMLElement>;
    }
    if (props.onButtonEvents && props.onButtonEvents[button.key]) {
      return () => {
        props.onButtonEvents![button.key](selectedRowKeys, selectedRows, button);
      };
    }
    return undefined;
  }

  const onButtonDisabled = (button: TableButtonProps): boolean => {
    const {argumentMinSize, argumentMaxSize} = button;
    // 如果都未设置，则默认不禁用；传入 -1 表示该边界不限制
    if (argumentMinSize === undefined && argumentMaxSize === undefined) {
      return false;
    }
    const size = selectedRowKeys.length;
    if (typeof argumentMinSize === 'number' && argumentMinSize !== -1 && size < argumentMinSize) return true;
    return typeof argumentMaxSize === 'number' && argumentMaxSize !== -1 && size > argumentMaxSize;
  }

  // Popover 内容：列开关列表 + 重置
  const settingsContent = (
    <div style={{maxHeight: 320, overflow: 'auto', padding: 8}}>
      <Checkbox
        checked={visibleKeys.length > 0 && visibleKeys.every((key) => visibleCols[key] ?? true)}
        indeterminate={
          visibleKeys.some((key) => visibleCols[key] ?? true) && !visibleKeys.every((key) => visibleCols[key] ?? true)
        }
        onChange={(e) => {
          const checked = e.target.checked;
          const next: Record<string, boolean> = {};
          visibleKeys.forEach((k) => (next[k] = checked));
          setVisibleCols(next);
        }}
        style={{marginBottom: 8}}
      >
        {t('table.checkAll', '全选')}
      </Checkbox>
      <div>
        {visibleKeys.map((key) => (
          <div key={key} style={{padding: '4px 0'}}>
            <Checkbox checked={visibleCols[key] ?? true} onChange={(e) => toggleCol(key, e.target.checked)}>
              {(properties[key] as any)?.title ?? key}
            </Checkbox>
          </div>
        ))}
      </div>
      {storageKey ? (
        <div style={{marginTop: 8, textAlign: 'right'}}>
          <Button type="link" size="small" onClick={() => {
            try { if (storageKey) localStorage.removeItem(storageKey); } catch {}
            const next: Record<string, boolean> = {}; visibleKeys.forEach((k) => next[k] = true); setVisibleCols(next);
          }}>{t('table.resetColumns', '重置列')}</Button>
        </div>
      ) : null}
    </div>
  );

  // Antd rowSelection 配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: T[]) => onSelectChange(keys, rows),
  };

  // 兼容 schema 按钮结构，过滤不被 antd 接受的属性，映射颜色/样式
  const renderButtons = (buttons?: TableButtonProps[]) => {
    if (!buttons || buttons.length === 0) return null;
    return buttons.map((button) => {
      const { argumentMinSize, argumentMaxSize, sort, color, variant, text, icon, ...rest } = button as any;
      const mapped: any = { ...rest };
      // 颜色到 danger/simple 样式映射
      if (color === 'danger') mapped.danger = true;
      // 轮廓样式到 ghost
      if (variant === 'outlined') mapped.ghost = true;
      // 图标兼容字符串
      const iconNode = typeof icon === 'string' ? createIcon(icon) : icon;
      return (
        <Button
          {...mapped}
          key={button.key}
          onClick={onButtonEvent(button)}
          disabled={onButtonDisabled(button)}
          icon={iconNode}
        >{text ?? (button as any).title}</Button>
      );
    });
  };

  return (
    <div>
      <Row justify="space-between" style={{marginBottom: 16}}>
        <Col>
          <Space>
            {renderButtons(props.buttons)}
          </Space>
        </Col>
        <Col>
          <Button className="button-col" type="text" icon={<SearchOutlined/>} onClick={() => props.refresh()}/>
          <Popover placement="bottomRight" content={settingsContent} trigger="click">
            <Button icon={<SettingOutlined/>} type="text" style={{marginLeft: 8}}/>
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
