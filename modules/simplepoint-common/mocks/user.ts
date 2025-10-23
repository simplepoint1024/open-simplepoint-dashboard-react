import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/user/schema', () => {
    return HttpResponse.json(
      {
        "access": {
          "name": "User",
          "value": "org.simplepoint.core.entity.User",
          "enabled": true,
          "enabledDataScope": false,
          "hidden": null,
          "description": ""
        },
        "schema": {
          "type": "object",
          "properties": {
            "address": {
              "type": "string",
              "title": "地址",
              "description": "用户的地址信息",
              "minLength": 5,
              "maxLength": 255
            },
            "birthdate": {
              "type": "string",
              "title": "出生日期",
              "description": "用户的出生日期",
              "readOnly": true
            },
            "email": {
              "type": "string",
              "title": "邮箱",
              "description": "用户的电子邮件地址",
              "minLength": 5,
              "maxLength": 64,
              "format": "email"
            },
            "familyName": {
              "type": "string",
              "title": "姓氏",
              "description": "用户的姓氏",
              "readOnly": true,
              "minLength": 1,
              "maxLength": 50
            },
            "givenName": {
              "type": "string",
              "title": "名字",
              "description": "用户的名字",
              "minLength": 1,
              "maxLength": 50
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
            "phoneNumber": {
              "type": "string",
              "title": "手机号",
              "description": "用户的联系电话",
              "minLength": 5,
              "maxLength": 50
            },
            "picture": {
              "type": "string",
              "title": "头像",
              "description": "用户的头像图片URL或路径",
              "format": "data-url"
            },
            "profile": {
              "type": "string",
              "title": "个人资料",
              "description": "用户的个人资料URL或路径"
            },
            "superAdmin": {
              "type": "boolean",
              "title": "是否为管理员",
              "description": "指示用户是否具有管理员权限"
            },
            "username": {
              "type": "string",
              "title": "用户名",
              "description": "用户的唯一标识符",
              "x-order": 1
            }
          }
        },
        "buttons": [{
          "text": "添加",
          "title": "添加",
          "key": "add",
          "type": "primary",
          "color": "blue",
          "variant": "outlined",
          "icon": "PlusCircleOutlined",
          "sort": 0
        }, {
          "text": "编辑",
          "title": "编辑",
          "key": "edit",
          "type": "primary",
          "color": "orange",
          "variant": "outlined",
          "icon": "EditOutlined",
          "sort": 1
        }, {
          "text": "删除",
          "title": "删除",
          "key": "del",
          "type": "primary",
          "color": "danger",
          "variant": "outlined",
          "icon": "MinusCircleOutlined",
          "sort": 2
        }]
      })
  }),

  http.get('/common/user', () => {
    return HttpResponse.json(
      {
        "content": [{
          "id": 1941503407424671744,
          "createdBy": null,
          "updatedBy": null,
          "createdAt": null,
          "updatedAt": "2025-07-05T14:24:18.395521Z",
          "username": "system",
          "email": null,
          "address": 18,
          "birthdate": null,
          "emailVerified": null,
          "familyName": null,
          "gender": null,
          "givenName": null,
          "locale": "zh_CN",
          "middleName": "System",
          "name": null,
          "nickname": null,
          "picture": null,
          "phoneNumber": null,
          "phoneNumberVerified": null,
          "preferredUsername": null,
          "profile": null,
          "website": "http://127.0.0.1",
          "zoneinfo": null,
          "enabled": true,
          "accountNonExpired": true,
          "accountNonLocked": true,
          "credentialsNonExpired": true,
          "superAdmin": true,
          "authorities": null
        }], "page": {"size": 20, "number": 0, "totalElements": 1, "totalPages": 1}
      }
    )
  }),
];

export default apis;