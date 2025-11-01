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
            "title": "i18n:table.button.add",
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
            "title": "i18n:table.button.edit",
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
            "title": "i18n:table.button.delete",
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
              "schema": "i18n:roles.field.authority",
              "description": "i18n:roles.field.authority.desc",
              "x-ui":{
                "x-list-visible":"true"
              }
            },
            "description": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:roles.field.description",
              "description": "i18n:roles.field.description.desc",
              "x-ui":{
                "x-list-visible":"true"
              }
            },
            "priority": {
              "type": "integer",
              "title": "i18n:roles.field.priority",
              "description": "i18n:roles.field.priority.desc",
              "x-ui":{
                "x-list-visible":"true"
              }
            },
            "roleName": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:roles.field.roleName",
              "description": "i18n:roles.field.roleName.desc",
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