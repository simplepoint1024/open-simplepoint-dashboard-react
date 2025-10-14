import {Form} from "@rjsf/antd";
import {FormProps} from "@rjsf/core";
import {Button} from "antd";
import "./index.css"
import validator from "@rjsf/validator-ajv8";
import {RJSFValidationError} from "@rjsf/utils";

type SFromProps = Omit<FormProps, "validator">;

const CustomSubmitButton = (props: any) => {
  const {onClick, disabled} = props;
  return (
    <Button
      type="primary"
      htmlType="submit"
      onClick={onClick}
      disabled={disabled}
      style={{backgroundColor: '#00b96b'}}
    >
      提交表单
    </Button>
  );
};

const transformErrors = (errors: RJSFValidationError[]) => {
  return errors.map(error => {
    console.log(error)
    switch (error.name) {
      case 'required':
        error.stack = '这是必填项';
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


const onSubmit = (data:any) => {
  console.log("提交的数据:", data.formData);
  alert("提交的数据:" + JSON.stringify(data.formData, null, 2));
}

const SForm = (props: SFromProps) => {
  return (
    <Form
      {...props}
      validator={validator}
      method={"POST"}
      showErrorList={false}
      onSubmit={onSubmit}
      transformErrors={transformErrors}
      templates={{
        ButtonTemplates: {
          SubmitButton: CustomSubmitButton
        },
      }}
    />
  );
};

export default SForm;