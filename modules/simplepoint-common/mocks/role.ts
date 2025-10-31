import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/roles/schema', () => {
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
            "authority": {
              "type": [
                "string",
                "null"
              ],
              "title": "角色权限",
              "description": "定义角色的权限标识",
              "x-ui":{
                "x-list-visible":"true"
              }
            },
            "description": {
              "type": [
                "string",
                "null"
              ],
              "title": "角色描述",
              "description": "对角色的简要描述",
              "x-ui":{
                "x-list-visible":"true"
              }
            },
            "priority": {
              "type": "integer",
              "title": "角色优先级",
              "description": "定义角色的优先级，数值越大优先级越高",
              "x-ui":{
                "x-list-visible":"true"
              }
            },
            "roleName": {
              "type": [
                "string",
                "null"
              ],
              "title": "角色名称",
              "description": "定义角色的名称",
              "x-ui":{
                "x-list-visible":"true"
              }
            }
          }
        }
      }
      )
  }),

  http.get('/common/roles', () => {
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