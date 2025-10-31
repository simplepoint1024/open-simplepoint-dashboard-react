import { Form } from "@rjsf/antd";
import { FormProps } from "@rjsf/core";
import { Button } from "antd";
import "./index.css";
import validator from "@rjsf/validator-ajv8";
import { RJSFValidationError, SubmitButtonProps } from "@rjsf/utils";
import { memo, useEffect, useMemo, useState } from "react";
import IconPicker from "./widgets/IconPicker";

type SFormProps = Omit<FormProps, "validator">;

// 获取全局翻译函数（来自 Host），不在时回退为 (key, fallback)=>fallback||key
const useI18nT = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick(v => v + 1);
    try { window.addEventListener('sp-i18n-updated', h as any); } catch {}
    return () => { try { window.removeEventListener('sp-i18n-updated', h as any); } catch {} };
  }, []);
  const t: (key: string, fallback?: string, params?: Record<string, any>) => string = (window as any)?.spI18n?.t || ((k: string, f?: string) => f ?? k);
  // 依赖 tick 以在语言变更后重新计算
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  tick;
  return t;
};

const CustomSubmitButton = (props: SubmitButtonProps) => {
  const t = useI18nT();
  const { uiSchema } = props;
  const { "ui:submitButtonOptions": { submitText, submitTextKey } = {} } = uiSchema || {} as any;
  const text = submitTextKey
    ? t(submitTextKey, submitText || t('form.submit', '提交'))
    : (submitText ? t(submitText, submitText) : t('form.submit', '提交'));
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
  const t = useI18nT();
  const { schema, uiSchema, validate, ...rest } = props as any;

  // 确保加载 form 命名空间（若后端按命名空间拆分）
  useEffect(() => {
    try { (window as any)?.spI18n?.ensure?.(['form']); } catch {}
  }, []);

  // 基于 schema['x-i18n'] 和 properties[*]['x-i18n'] 注入 title/description
  const i18nSchema = useMemo(() => {
    if (!schema || typeof schema !== 'object') return schema;
    const cloned: any = { ...(schema as any) };
    if (schema.properties) cloned.properties = { ...(schema as any).properties };

    const sxi = (schema as any)['x-i18n'] || {};
    if (sxi.title) cloned.title = t(sxi.title, (schema as any).title);
    if (sxi.description) cloned.description = t(sxi.description, (schema as any).description);

    const propsMap = (schema as any).properties || {};
    Object.keys(propsMap).forEach((k) => {
      const orig: any = propsMap[k] || {};
      const xi = orig['x-i18n'] || {};
      const next = { ...orig };
      if (xi.title) next.title = t(xi.title, orig.title || k);
      if (xi.description) next.description = t(xi.description, orig.description);
      cloned.properties[k] = next;
    });

    return cloned;
  }, [schema, t]);

  // 从 schema.x-ui.widget 自动生成基础 uiSchema（含通用映射与 textarea 特例），并支持 placeholder/help 的 i18n
  const autoUiSchema = useMemo(() => {
    const result: any = {};
    if (!i18nSchema || typeof i18nSchema !== 'object') return result;
    const propsDef = (i18nSchema as any).properties || {};
    Object.keys(propsDef).forEach((k) => {
      const xui = propsDef[k]?.['x-ui'];
      const xi18n = propsDef[k]?.['x-i18n'] || {};
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
      if (xi18n.placeholder) {
        result[k] = { ...(result[k] || {}), 'ui:placeholder': t(xi18n.placeholder) };
      }
      if (xi18n.help) {
        result[k] = { ...(result[k] || {}), 'ui:help': t(xi18n.help) };
      }
    });
    return result;
  }, [i18nSchema, t]);

  // 若未显式设置 icon 的 widget，则默认启用 IconPicker
  const withIconPicker = useMemo(() => {
    const result: any = { ...autoUiSchema };
    const iconExists = !!(i18nSchema && typeof i18nSchema === 'object' && ((i18nSchema as any).properties?.icon || (i18nSchema as any).icon));
    if (iconExists) {
      if (!uiSchema?.icon && !result.icon) {
        result.icon = { 'ui:widget': 'IconPicker' };
      }
    }
    return result;
  }, [i18nSchema, autoUiSchema, uiSchema]);

  // 合并优先级：props.uiSchema > 自动生成；并从 schema['x-i18n'].submitText 注入默认提交文案
  const mergedUiSchema = useMemo(() => {
    const base = {
      ...withIconPicker,
      ...(uiSchema || {})
    } as any;
    const sxi = (i18nSchema as any)?.['x-i18n'] || {};
    const existing = base['ui:submitButtonOptions'] || {};
    // 若 schema 定义了 submitText（作为 i18n key），则写入 submitTextKey；保留任何已有 submitText 以作为回退
    if (sxi.submitText && !existing.submitTextKey) {
      base['ui:submitButtonOptions'] = { ...existing, submitTextKey: sxi.submitText };
    }
    return base;
  }, [withIconPicker, uiSchema, i18nSchema, t]);

  // 需要进行 JSON 校验的字段集合（通过 x-ui.format === 'json' 标记）
  const jsonKeys = useMemo(() => {
    const keys: string[] = [];
    if (i18nSchema && typeof i18nSchema === 'object') {
      const props = (i18nSchema as any).properties || {};
      Object.keys(props).forEach((k) => {
        const fmt = props[k]?.['x-ui']?.format;
        if (fmt === 'json') keys.push(k);
      });
    }
    return keys;
  }, [i18nSchema]);

  // 支持 i18n 的错误转换：优先字段级 -> 全局 -> 默认
  const transformErrors = (errors: RJSFValidationError[]) => {
    return errors.map(error => {
      const name = error.name;
      // 推导字段名
      let field = (error.property || '').replace(/^\./, '');
      if (!field && (error as any)?.params?.missingProperty) field = (error as any).params.missingProperty;

      const sxi = (i18nSchema as any)?.['x-i18n'] || {};
      const pxi = field ? (i18nSchema as any)?.properties?.[field]?.['x-i18n'] || {} : {};
      const perror = (pxi.errors || {}) as Record<string, string>;
      const gerror = (sxi.errors || {}) as Record<string, string>;

      if (name === 'const') {
        error.message = t(perror.const || gerror.const || 'form.passwordMismatch', '两次输入的密码不一致');
        return error;
      }
      switch (name) {
        case 'required':
          error.message = t(perror.required || gerror.required || 'form.required', '这是必填项');
          break;
        case 'minLength':
          error.message = t(perror.minLength || gerror.minLength || 'form.minLength', '长度不能少于 {limit} 个字符', { limit: (error as any)?.params?.limit });
          break;
        case 'maximum':
          error.message = t(perror.maximum || gerror.maximum || 'form.maximum', '不能大于 {limit}', { limit: (error as any)?.params?.limit });
          break;
        default:
          // 保留原始 message，或使用全局/字段其他映射
          error.message = error.message || t('form.invalid', '输入不合法');
      }
      return error;
    });
  };

  const mergedValidate = (formData: any, errors: any) => {
    // 内部 JSON 字段校验
    jsonKeys.forEach((k) => {
      const v = formData?.[k];
      if (v && typeof v === 'string') {
        try { JSON.parse(v); } catch (_) { errors[k]?.addError?.(t('form.jsonInvalid', 'JSON格式不正确')); }
      }
    });
    // 外部自定义校验
    if (typeof validate === 'function') validate(formData, errors);
    return errors;
  };

  return (
    <Form
      {...rest}
      schema={i18nSchema}
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