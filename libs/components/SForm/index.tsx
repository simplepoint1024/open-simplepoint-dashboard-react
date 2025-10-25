import { Form } from "@rjsf/antd";
import { FormProps } from "@rjsf/core";
import { Button } from "antd";
import "./index.css";
import validator from "@rjsf/validator-ajv8";
import {RJSFValidationError, SubmitButtonProps} from "@rjsf/utils";
import { memo } from "react";

type SFormProps = Omit<FormProps, "validator">;

const CustomSubmitButton = (props: SubmitButtonProps) => {
  const { uiSchema } = props;
  const { "ui:submitButtonOptions": { submitText = "提交" } = {} } = uiSchema || {};
  return (
    <Button
      type="primary"
      htmlType="submit"
      style={{ backgroundColor: '#00b96b' }}
    >
      {submitText}
    </Button>
  );
};

const transformErrors = (errors: RJSFValidationError[]) => {
  return errors.map(error => {
    if (error.property === '.password_confirmation' && error.name === 'const') {
      error.message = '两次输入的密码不一致';
      return error;
    }
    switch (error.name) {
      case 'required':
        error.message = '这是必填项';
        break;
      case 'minLength':
        error.message = `长度不能少于 ${error.params.limit} 个字符`;
        break;
      case 'maximum':
        error.message = `不能大于 ${error.params.limit}`;
        break;
    }
    return error;
  });
};

const formTemplates = {
  ButtonTemplates: {
    SubmitButton: CustomSubmitButton
  },
};

const SForm = (props: SFormProps) => {
  return (
    <Form
      {...props}
      validator={validator}
      showErrorList={false}
      transformErrors={transformErrors}
      templates={formTemplates}
    />
  );
};

export default memo(SForm);