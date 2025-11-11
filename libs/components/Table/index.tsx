import React, {MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {TableRowSelection} from 'antd/es/table/interface';
import {Button, Checkbox, Col, Popover, Row, Space, Table as AntTable} from 'antd';
import {SearchOutlined, SettingOutlined} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import {RJSFSchema} from '@rjsf/utils';
import {Pageable} from '@simplepoint/shared/types/request';
import {ButtonProps} from "antd/es/button/button";
import {createIcon} from '@simplepoint/shared/types/icon';
import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import ColumnFilter from './ColumnFilter';

export type TableButtonProps = ButtonProps & {
  key: string;
  sort: number;
  argumentMaxSize?: number;
  argumentMinSize?: number;
  text?: string;
  color?: string;
  variant?: string;
};

export interface TableProps<T> {
  refresh: () => void;
  pageable: Pageable<T>;
  schema: RJSFSchema | any[];
  filters?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;
  onChange?: (pagination: any, filters?: any, sorter?: any, extra?: any) => void;
  rowSelection?: { selectedKeys?: React.Key[] };
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  onButtonEvents?: Record<string, (selectedRowKeys: React.Key[], selectedRows: T[], props: TableButtonProps) => void>;
  buttons?: TableButtonProps[]
  storageKey?: string;
}

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

const parseVisibleTriState = (val: any): boolean | undefined => {
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  if (val === false || val === 'false' || val === 0 || val === '0') return false;
  return undefined;
};

const readVisibleFlag = (schema: any): boolean | undefined => {
  if (!schema) return undefined;
  const legacy1 = schema?.['x-ui']?.['x-list-visible'];
  return (
    parseVisibleTriState(legacy1)
  );
};

const computeVisibleKeys = (properties: Record<string, any>): string[] => {
  const keys = Object.keys(properties);
  let anyDeclared = false;
  const visible: string[] = [];
  for (const key of keys) {
    const flag = readVisibleFlag(properties[key]);
    if (flag !== undefined) {
      anyDeclared = true;
      if (flag) visible.push(key);
    }
  }
  return anyDeclared ? visible : keys;
};

const App = <T extends object = any>(props: TableProps<T>) => {
  const {t, locale} = useI18n();
  const [filters, setFilters] = useState<Record<string, string>>(props.filters ?? {});

  useEffect(() => {
    setFilters(props.filters ?? {});
  }, [props.filters]);

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

  const visibleKeys = useMemo(() => computeVisibleKeys(properties), [properties]);

  const storageKey = useMemo(() => (props.storageKey ? `sp.table.cols.${props.storageKey}` : undefined), [props.storageKey]);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setVisibleCols((prev) => {
      const base: Record<string, boolean> = {};
      visibleKeys.forEach((k) => {
        base[k] = k in prev ? prev[k] : true;
      });
      try {
        if (storageKey) {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const saved = JSON.parse(raw) as Record<string, boolean>;
            visibleKeys.forEach((k) => {
              if (typeof saved[k] === 'boolean') base[k] = saved[k];
            });
          }
        }
      } catch {
      }
      return base;
    });
  }, [visibleKeys, storageKey]);

  useEffect(() => {
    try {
      if (storageKey && Object.keys(visibleCols).length) {
        const payload: Record<string, boolean> = {};
        visibleKeys.forEach((k) => {
          if (typeof visibleCols[k] === 'boolean') payload[k] = visibleCols[k];
        });
        localStorage.setItem(storageKey, JSON.stringify(payload));
      }
    } catch {
    }
  }, [visibleCols, visibleKeys, storageKey]);

  const toggleCol = (key: string, checked: boolean) => {
    setVisibleCols((prev) => ({...prev, [key]: checked}));
  };

  const columns = useMemo<ColumnsType<T>>(() => {
    const entries = Object.entries(properties);

    return entries
      .filter(([key]) => (visibleCols[key] ?? visibleKeys.includes(key)))
      .map(([key, schemaDef]) => {
        const baseTitle = (schemaDef as any)?.title ?? key;
        const isBoolean = (schemaDef as any)?.type === 'boolean';
        const isNumber = (schemaDef as any)?.type === 'number' || (schemaDef as any)?.type === 'integer';
        const align = key === 'icon' ? 'center' : (isNumber ? 'right' : undefined);

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
          title: baseTitle,
          dataIndex: key,
          key,
          align,
        };

        column.filterDropdown = ({close}: any) => (
          <div onKeyDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}
               onClick={(e) => e.stopPropagation()}>
            <ColumnFilter
              initialOp={parseOp(filters[key])}
              initialText={parseText(filters[key])}
              onChange={(op: string, text: string) => {
                const value = text ? `${op}:${text}` : '';
                const next = {...filters};
                if (value) next[key] = value; else delete next[key];
                setFilters(next);
                props.onFilterChange?.(next);
                props.refresh();
                try {
                  close?.();
                } catch {
                }
              }}
            />
          </div>
        );
        column.filterIcon = () => <SearchOutlined style={{color: filters[key] ? '#1677ff' : undefined}}/>;

        if (renderCell) column.render = renderCell;

        return column;
      });
  }, [properties, visibleCols, visibleKeys, filters, props.onFilterChange, props.refresh, t, locale]);

  const dataSource = props.pageable?.content ?? [];

  const pagination = {
    total: props.pageable?.page?.totalElements ?? 0,
    pageSize: props.pageable?.page?.size ?? 10,
    current: (props.pageable?.page?.number ?? 0) + 1,
    showSizeChanger: true,
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(props.rowSelection?.selectedKeys ?? []);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  useEffect(() => {
    if (props.rowSelection?.selectedKeys) {
      setSelectedRowKeys(props.rowSelection.selectedKeys);
    }
  }, [props.rowSelection?.selectedKeys]);

  const anonKeyMapRef = useRef(new WeakMap<object, number>());
  const anonKeySeqRef = useRef(1);
  const keyOfRecord = useCallback((record: T): React.Key => {
    const anyRec: any = record as any;
    const k = anyRec.id ?? anyRec.key;
    if (k !== undefined && k !== null) return k as React.Key;
    const map = anonKeyMapRef.current;
    let n = map.get(anyRec as object);
    if (!n) {
      n = anonKeySeqRef.current++;
      map.set(anyRec as object, n);
    }
    return `~${n}`;
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
    if (button.onClick) return button.onClick as MouseEventHandler<HTMLElement>;
    if (props.onButtonEvents && props.onButtonEvents[button.key]) {
      return () => {
        props.onButtonEvents![button.key](selectedRowKeys, selectedRows, button);
      };
    }
    return undefined;
  };

  const onButtonDisabled = (button: TableButtonProps): boolean => {
    const {argumentMinSize, argumentMaxSize} = button;
    if (argumentMinSize === undefined && argumentMaxSize === undefined) return false;
    const size = selectedRowKeys.length;
    if (typeof argumentMinSize === 'number' && argumentMinSize !== -1 && size < argumentMinSize) return true;
    return typeof argumentMaxSize === 'number' && argumentMaxSize !== -1 && size > argumentMaxSize;
  };

  const settingsContent = (
    <div style={{maxHeight: 320, overflow: 'auto', padding: 8}}>
      <Checkbox
        checked={visibleKeys.length > 0 && visibleKeys.every((key) => (visibleCols[key] ?? true))}
        indeterminate={
          visibleKeys.some((key) => (visibleCols[key] ?? true)) && !visibleKeys.every((key) => (visibleCols[key] ?? true))
        }
        onChange={(e) => {
          const checked = e.target.checked;
          const next: Record<string, boolean> = {};
          visibleKeys.forEach((k) => (next[k] = checked));
          setVisibleCols(next);
        }}
        style={{marginBottom: 8}}
      >
        {t('table.selectAll', '全选')}
      </Checkbox>
      <div>
        {visibleKeys.map((key) => {
          const sd: any = (properties as any)[key] || {};
          const label = (sd as any)?.title ?? key;
          return (
            <div key={key} style={{padding: '4px 0'}}>
              <Checkbox checked={visibleCols[key] ?? true} onChange={(e) => toggleCol(key, e.target.checked)}>
                {label}
              </Checkbox>
            </div>
          );
        })}
      </div>
      {storageKey ? (
        <div style={{marginTop: 8, textAlign: 'right'}}>
          <Button type="link" size="small" onClick={() => {
            try {
              if (storageKey) localStorage.removeItem(storageKey);
            } catch {
            }
            const next: Record<string, boolean> = {};
            visibleKeys.forEach((k) => next[k] = true);
            setVisibleCols(next);
          }}>{t('table.resetColumns', '重置列')}</Button>
        </div>
      ) : null}
    </div>
  );

  const rowSelection: TableRowSelection<T> = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: T[]) => onSelectChange(keys, rows),
  };

  const renderButtons = (buttons?: TableButtonProps[]) => {
    if (!buttons || buttons.length === 0) return null;

    const getButtonText = (button: TableButtonProps) => {
      const anyBtn: any = button as any;
      const raw = anyBtn.text ?? anyBtn.title ?? button.key;
      if (typeof raw === 'string' && raw.startsWith('i18n:')) {
        const key = raw.slice(5);
        return t(key, key);
      }
      return t(`table.button.${button.key}`, raw);
    };

    const getButtonTitleAttr = (button: TableButtonProps): string | undefined => {
      const anyBtn: any = button as any;
      const raw = anyBtn.title as any;
      if (typeof raw === 'string' && raw.startsWith('i18n:')) {
        const key = raw.slice(5);
        return t(key, key);
      }
      return typeof raw === 'string' ? t(`table.button.${button.key}.title`, raw) : undefined;
    };

    return buttons.map((button) => {
      const {argumentMinSize, argumentMaxSize, sort, color, variant, text, icon, title, ...rest} = button as any;
      const mapped: any = {...rest};
      if (color === 'danger') mapped.danger = true;
      if (variant === 'outlined') mapped.ghost = true;
      const iconNode = typeof icon === 'string' ? createIcon(icon) : icon;
      const localizedTitle = getButtonTitleAttr(button);
      if (localizedTitle) mapped.title = localizedTitle;
      return (
        <Button
          {...mapped}
          key={button.key}
          onClick={onButtonEvent(button)}
          disabled={onButtonDisabled(button)}
          icon={iconNode}
        >{getButtonText(button)}</Button>
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
