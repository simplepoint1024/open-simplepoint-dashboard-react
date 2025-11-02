import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/oidc/clients/schema', () => {
    return HttpResponse.json(
      {
        "buttons": [
          {
            "path": "[default]",
            "color": "blue",
            "variant": "outlined",
            "icon": "PlusCircleOutlined",
            "argumentMaxSize": 0,
            "sort": 0,
            "type": "primary",
            "title": "添加",
            "danger": false,
            "argumentMinSize": 0,
            "key": "add"
          },
          {
            "path": "[default]",
            "color": "orange",
            "variant": "outlined",
            "icon": "EditOutlined",
            "argumentMaxSize": 1,
            "sort": 1,
            "type": "primary",
            "title": "编辑",
            "danger": false,
            "argumentMinSize": 1,
            "key": "edit"
          },
          {
            "path": "[default]",
            "color": "danger",
            "variant": "outlined",
            "icon": "MinusCircleOutlined",
            "argumentMaxSize": 10,
            "sort": 2,
            "type": "primary",
            "title": "删除",
            "danger": true,
            "argumentMinSize": 1,
            "key": "delete"
          }
        ],
        "schema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "properties": {
            "authorizationGrantTypes": {
              "type": [
                "string",
                "null"
              ],
              "title": "授权模式",
              "description": "客户端支持的授权模式",
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "clientAuthenticationMethods": {
              "type": [
                "string",
                "null"
              ],
              "title": "认证方式",
              "description": "客户端支持的认证方式",
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "clientId": {
              "type": [
                "string",
                "null"
              ],
              "title": "Client ID",
              "description": "客户端的唯一标识",
              "x-order": 0,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "clientIdIssuedAt": {
              "type": [
                "string",
                "null"
              ],
              "title": "有效时间",
              "description": "客户端的有效时间",
              "format": "date-time",
              "x-order": 0
            },
            "clientName": {
              "type": [
                "string",
                "null"
              ],
              "title": "客户端名称",
              "description": "客户端的名字",
              "x-order": 1,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "clientSecret": {
              "type": [
                "string",
                "null"
              ],
              "title": "Secret",
              "description": "客户端的秘钥",
              "x-order": 2,
              "x-ui": { "widget": "password" }
            },
            "clientSecretExpiresAt": {
              "type": [
                "string",
                "null"
              ]
            },
            "clientSettings": {
              "type": [
                "string",
                "null"
              ],
              "title": "客户端设置",
              "description": "JSON格式存储客户端的相关设置",
              "x-ui": { "widget": "textarea" }
            },
            "postLogoutRedirectUris": {
              "type": [
                "string",
                "null"
              ],
              "title": "登出重定向地址",
              "description": "如果是多个请使用英文逗号分隔"
            },
            "redirectUris": {
              "type": [
                "string",
                "null"
              ],
              "title": "重定向地址",
              "description": "如果是多个请使用英文逗号分隔"
            },
            "scopes": {
              "type": [
                "string",
                "null"
              ],
              "title": "授权范围",
              "description": "如果是多个请使用英文逗号分隔",
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "tokenSettings": {
              "type": [
                "string",
                "null"
              ],
              "title": "令牌设置",
              "description": "JSON格式存储令牌的相关设置",
              "x-ui": { "widget": "textarea" }
            }
          }
        }
      }
    )
  }),

  http.get('/common/oidc/clients', () => {
    return HttpResponse.json(
      {
        "content": [
          {
            "id": "1",
            "createdBy": null,
            "updatedBy": null,
            "createdAt": "2025-09-22T13:08:42.826Z",
            "updatedAt": "2025-09-22T13:08:45.546Z",
            "roleName": "超级管理员",
            "authority": "SYSTEM_ADMIN",
            "description": null,
            "priority": null
          }
        ],
        "page": {
          "size": 20,
          "number": 0,
          "totalElements": 1,
          "totalPages": 1
        }
      }
    )
  }),
];

export default apis;