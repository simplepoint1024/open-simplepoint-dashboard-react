import React, {ChangeEvent, useEffect, useMemo, useState} from 'react';
import {Input, Select, Space, Button} from 'antd';
import { useI18n } from '@simplepoint/shared/hooks/useI18n';

export interface ColumnFilterProps {
  initialOp?: string;
  initialText?: string;
  onChange?: (op: string, text: string) => void;
  options?: Array<{ value: string; label: string }>; // 可选，未传则使用 i18n 默认
}

const ColumnFilter: React.FC<ColumnFilterProps> = ({initialOp = 'like', initialText = '', onChange, options}) => {
  const { t, locale } = useI18n();

  const defaultOptions = useMemo(() => ([
    {value: 'equals', label: t('table.filter.equals','精确')},
    {value: 'not:equals', label: t('table.filter.notEquals','精确取反')},
    {value: 'like', label: t('table.filter.like','模糊')},
    {value: 'not:like', label: t('table.filter.notLike','模糊取反')},
    {value: 'in', label: t('table.filter.in','集合包含')},
    {value: 'not:in', label: t('table.filter.notIn','集合不包含')},
    {value: 'between', label: t('table.filter.between','区间')},
    {value: 'not:between', label: t('table.filter.notBetween','区间取反')},
    {value: 'than:greater', label: t('table.filter.greater','大于')},
    {value: 'than:less', label: t('table.filter.less','小于')},
    {value: 'than:equal:greater', label: t('table.filter.greaterOrEqual','大于等于')},
    {value: 'than:equal:less', label: t('table.filter.lessOrEqual','小于等于')},
    {value: 'is:null', label: t('table.filter.null','空')},
    {value: 'is:not:null', label: t('table.filter.notNull','非空')},
  ]), [t, locale]);

  const finalOptions = options ?? defaultOptions;

  const [inputValue, setInputValue] = useState(initialText);
  const [selectValue, setSelectValue] = useState(initialOp);

  // 仅在 props 变化时同步本地值
  useEffect(() => {
    setSelectValue(initialOp);
    setInputValue(initialText);
  }, [initialOp, initialText]);

  const apply = () => {
    onChange?.(selectValue, inputValue);
  };

  return (
    <div>
      <Space.Compact>
        <Select style={{width: 160}} value={selectValue} options={finalOptions} onChange={(value) => setSelectValue(value)}/>
        <Input
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          onPressEnter={apply}
          allowClear
        />
        <Button type="primary" onClick={apply}>{t('table.apply','应用')}</Button>
      </Space.Compact>
    </div>
  );
};

export default ColumnFilter;
