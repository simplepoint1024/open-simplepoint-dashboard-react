import {http, HttpResponse} from 'msw';

export default [
  http.get('/common/users/schema', () => {
    return HttpResponse.json(
      {
        "buttons": [{
          "path": "[default]",
          "color": "blue",
          "variant": "outlined",
          "icon": "PlusCircleOutlined",
          "argumentMaxSize": 0,
          "sort": 0,
          "type": "primary",
          "danger": false,
          "title": "添加",
          "argumentMinSize": 0,
          "key": "add"
        }, {
          "path": "[default]",
          "color": "danger",
          "variant": "outlined",
          "icon": "MinusCircleOutlined",
          "argumentMaxSize": 10,
          "sort": 2,
          "type": "primary",
          "danger": true,
          "title": "删除",
          "argumentMinSize": 1,
          "key": "delete"
        }, {
          "path": "[default]",
          "color": "orange",
          "variant": "outlined",
          "icon": "EditOutlined",
          "argumentMaxSize": 1,
          "sort": 1,
          "type": "primary",
          "danger": false,
          "title": "编辑",
          "argumentMinSize": 1,
          "key": "edit"
        }, {
            "path": "[default]",
            "color": "orange",
            "variant": "outlined",
            "icon": "SafetyOutlined",
            "argumentMaxSize": 1,
            "sort": 2,
            "type": "primary",
            "title": "i18n:users.button.config.role",
            "danger": false,
            "argumentMinSize": 1,
            "key": "config.role"
          }
        ], "schema": {
          "$schema": "http://json-schema.org/draft-07/schema#", "type": "object", "properties": {
            "address": {
              "type": ["string", "null"],
              "title": "i18n:users.title.address",
              "description": "i18n:users.description.address",
              "minLength": 5,
              "maxLength": 255
            },
            "birthdate": {
              "type": ["string", "null"],
              "title": "i18n:users.title.birthdate",
              "description": "i18n:users.description.birthdate",
              "format": "date-time"
            },
            "email": {
              "type": ["string", "null"],
              "title": "i18n:users.title.email",
              "description": "i18n:users.description.email",
              "minLength": 5,
              "maxLength": 64,
              "format": "email",
              "x-ui": {"x-list-visible": "true"}
            },
            "enabled": {
              "type": "boolean",
              "title": "i18n:users.title.enabled",
              "description": "i18n:users.description.enabled",
              "readOnly": true,
              "x-ui": {"x-list-visible": "true"}
            },
            "familyName": {
              "type": ["string", "null"],
              "title": "i18n:users.title.familyName",
              "description": "i18n:users.description.familyName",
              "minLength": 1,
              "maxLength": 50
            },
            "givenName": {
              "type": ["string", "null"],
              "title": "i18n:users.title.givenName",
              "description": "i18n:users.description.givenName",
              "minLength": 1,
              "maxLength": 50
            },
            "middleName": {
              "type": ["string", "null"],
              "title": "i18n:users.title.middleName",
              "description": "i18n:users.description.middleName",
              "minLength": 1,
              "maxLength": 50
            },
            "nickname": {
              "type": ["string", "null"],
              "title": "i18n:users.title.nickname",
              "description": "i18n:users.description.nickname",
              "minLength": 1,
              "maxLength": 50,
              "x-order": 2,
              "x-ui": {"x-list-visible": "true"}
            },
            "password": {
              "type": ["string", "null"],
              "title": "i18n:users.title.password",
              "description": "i18n:users.description.username",
              "x-order": 2,
              "x-ui": {"widget": "password"}
            },
            "phoneNumber": {
              "type": ["string", "null"],
              "title": "i18n:users.title.phoneNumber",
              "description": "i18n:users.description.phoneNumber",
              "minLength": 5,
              "maxLength": 50,
              "x-order": 3,
              "x-ui": {"x-list-visible": "true"}
            },
            "picture": {
              "type": ["string", "null"],
              "title": "i18n:users.title.picture",
              "description": "i18n:users.description.picture",
              "format": "data-url"
            },
            "profile": {
              "type": ["string", "null"],
              "title": "i18n:users.title.profile",
              "description": "i18n:users.description.profile"
            },
            "superAdmin": {
              "type": "boolean",
              "title": "i18n:users.title.superAdmin",
              "description": "i18n:users.description.superAdmin",
              "x-ui": {"x-list-visible": "true"}
            },
            "username": {
              "type": ["string", "null"],
              "title": "i18n:users.title.username",
              "description": "i18n:users.description.username",
              "x-order": 1,
              "x-ui": {"x-list-visible": "true"}
            }
          }
        }
      }
    )
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

