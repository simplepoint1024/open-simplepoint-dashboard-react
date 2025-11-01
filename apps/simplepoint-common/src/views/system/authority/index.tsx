import SForm from "@simplepoint/libs-components/SForm";

import type {RJSFSchema} from '@rjsf/utils';

const schema: RJSFSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "authorities": {
      "type": "array",
      "items": {
        "type": "object"
      }
    },
    "createdAt": {
      "type": "string"
    },
    "createdBy": {
      "type": "string"
    },
    "givenName": {
      "type": "string",
      "title": "名字",
      "description": "用户的名字",
      "minLength": 1,
      "maxLength": 50
    },
    "id": {
      "type": "string"
    },
    "middleName": {
      "type": "string",
      "title": "中间名",
      "description": "用户的中间名",
      "minLength": 1,
      "maxLength": 50
    },
    "nickname": {
      "type": "string",
      "title": "昵称",
      "description": "用户的昵称",
      "minLength": 1,
      "maxLength": 50
    },
    "password": {
      "type": "string",
      "title": "密码",
      "description": "用户的登录密码"
    },
    "phoneNumber": {
      "type": "string",
      "title": "手机号",
      "description": "用户的联系电话",
      "minLength": 5,
      "maxLength": 50
    },
    "updatedAt": {
      "type": "string"
    },
    "updatedBy": {
      "type": "string"
    },
    "username": {
      "type": "string",
      "title": "用户名",
      "description": "用户的唯一标识符"
    }
  }
};

const AuthMgr = () => {
  return (
    <SForm schema={schema}/>
  );
};

export default AuthMgr;
