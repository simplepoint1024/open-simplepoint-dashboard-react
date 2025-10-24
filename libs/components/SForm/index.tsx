import {Form} from "@rjsf/antd";
import {FormProps} from "@rjsf/core";
import {Button} from "antd";
import "./index.css"
import validator from "@rjsf/validator-ajv8";
import {RJSFValidationError} from "@rjsf/utils";
import {useEffect, useRef} from "react";

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


const SForm = (props: SFromProps) => {
  const formRef = useRef<any>(null);

  useEffect(() => {
    if (formRef.current) {
      // 当 formData 变化时，重置表单并设置新值
      formRef.current.reset();
      formRef.current.setState({
        ...formRef.current.state,
        formData: props.formData,
      });
    }
  }, [props.formData]);


  return (
    <Form
      {...props}
      ref={formRef}
      validator={validator}
      method={"POST"}
      showErrorList={false}
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