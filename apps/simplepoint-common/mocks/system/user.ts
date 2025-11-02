import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/users/schema', () => {
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
            "email": {
              "type": "string",
              "title": "邮箱",
              "description": "用户的电子邮件地址",
              "minLength": 5,
              "maxLength": 64,
              "format": "email"
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
            "superAdmin": {
              "type": "boolean",
              "title": "是否为管理员",
              "description": "指示用户是否具有管理员权限"
            },
            "username": {
              "type": "string",
              "title": "用户名",
              "description": "用户的唯一标识符",
              "x-order": 1,
              "x-ui":{
                "x-list-visible":"true"
              }
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
          "key": "delete",
          "type": "primary",
          "color": "danger",
          "variant": "outlined",
          "icon": "MinusCircleOutlined",
          "sort": 2
        }]
      })
  }),

  http.get('/userinfo', () => {
    return HttpResponse.json(
      {
        "sub": "system",
        "zoneinfo": null,
        "address": null,
        "gender": null,
        "roles": [
          "SYSTEM_ADMIN"
        ],
        "iss": "http://127.0.0.1:9000",
        "locale": "zh_CN",
        "middle_name": "System",
        "given_name": "管理员",
        "nonce": "hzmoVmvL15YR9w_QRpGf0iQKYhqT8N2ArMsY-vxejnU",
        "picture": null,
        "sid": "xGZqVY3VZiWZ_36TTXezOW0Ricez8jpCApiNC5F03BU",
        "aud": [
          "simplepoint-client"
        ],
        "phone": "18288888888",
        "super_admin": true,
        "azp": "simplepoint-client",
        "auth_time": "2025-10-30T12:55:14Z",
        "name": "管理员",
        "nickname": "系统用户",
        "exp": "2025-10-30T13:43:59Z",
        "iat": "2025-10-30T13:13:59Z",
        "email": "xxxx@gmail.com",
        "jti": "17d8b4f6-898d-4045-a9c4-adc44c93074a"
      }
      )
  }),

  http.get('/common/users', () => {
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