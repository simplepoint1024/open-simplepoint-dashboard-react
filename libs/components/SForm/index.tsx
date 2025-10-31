import { Form } from "@rjsf/antd";
import { FormProps } from "@rjsf/core";
import { Button } from "antd";
import "./index.css";
import validator from "@rjsf/validator-ajv8";
import { RJSFValidationError, SubmitButtonProps } from "@rjsf/utils";
import { memo, useMemo } from "react";
import IconPicker from "./widgets/IconPicker";

type SFormProps = Omit<FormProps, "validator">;

// 自定义提交按钮（移除 i18n，只使用 uiSchema 中的 submitText 或默认文案）
const CustomSubmitButton = (props: SubmitButtonProps) => {
  const { uiSchema } = props;
  const { "ui:submitButtonOptions": { submitText } = {} } = (uiSchema || {}) as any;
  const text = submitText || '提交';
  return (
    <Button type="primary" htmlType="submit" style={{ backgroundColor: '#00b96b' }}>
      {text}
    </Button>
  );
};

const formTemplates = {
  ButtonTemplates: {
    SubmitButton: CustomSubmitButton
  },
};

const defaultWidgets = { IconPicker } as const;

const SForm = (props: SFormProps) => {
  const { schema, uiSchema, validate, ...rest } = props as any;

  // 从 schema.x-ui.widget 自动生成基础 uiSchema（含通用映射与 textarea 特例）
  const autoUiSchema = useMemo(() => {
    const result: any = {};
    if (!schema || typeof schema !== 'object') return result;
    const propsDef = (schema as any).properties || {};
    Object.keys(propsDef).forEach((k) => {
      const xui = propsDef[k]?.['x-ui'];
      const widget = xui?.widget || xui?.['ui:widget'];
      if (widget) {
        if (widget === 'textarea') {
          result[k] = {
            'ui:widget': 'textarea',
            'ui:options': { autoSize: { minRows: 4, maxRows: 16 } }
          };
        } else if (typeof widget === 'string') {
          result[k] = { 'ui:widget': widget };
        }
      }
    });
    return result;
  }, [schema]);

  // 若未显式设置 icon 的 widget，则默认启用 IconPicker
  const withIconPicker = useMemo(() => {
    const result: any = { ...autoUiSchema };
    const iconExists = !!(schema && typeof schema === 'object' && (((schema as any).properties?.icon) || (schema as any).icon));
    if (iconExists) {
      if (!uiSchema?.icon && !result.icon) {
        result.icon = { 'ui:widget': 'IconPicker' };
      }
    }
    return result;
  }, [schema, autoUiSchema, uiSchema]);

  // 合并优先级：props.uiSchema > 自动生成（移除 x-i18n.submitText 注入）
  const mergedUiSchema = useMemo(() => ({
    ...withIconPicker,
    ...(uiSchema || {})
  }) as any, [withIconPicker, uiSchema]);

  // 需要进行 JSON 校验的字段集合（通过 x-ui.format === 'json' 标记）
  const jsonKeys = useMemo(() => {
    const keys: string[] = [];
    if (schema && typeof schema === 'object') {
      const props = (schema as any).properties || {};
      Object.keys(props).forEach((k) => {
        const fmt = props[k]?.['x-ui']?.format;
        if (fmt === 'json') keys.push(k);
      });
    }
    return keys;
  }, [schema]);

  const mergedValidate = (formData: any, errors: any) => {
    // 内部 JSON 字段校验
    jsonKeys.forEach((k) => {
      const v = formData?.[k];
      if (v && typeof v === 'string') {
        try { JSON.parse(v); } catch (_) { errors[k]?.addError?.('JSON格式不正确'); }
      }
    });
    // 外部自定义校验
    if (typeof validate === 'function') validate(formData, errors);
    return errors;
  };

  // 保持错误信息为默认（不做 i18n 转换）
  const transformErrors = (errors: RJSFValidationError[]) => errors;

  return (
    <Form
      {...rest}
      schema={schema}
      uiSchema={mergedUiSchema}
      validator={validator}
      validate={mergedValidate}
      showErrorList={false}
      transformErrors={transformErrors}
      templates={formTemplates}
      widgets={defaultWidgets as any}
    />
  );
};

export default memo(SForm);