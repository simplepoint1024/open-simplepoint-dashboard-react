import {http, HttpResponse} from 'msw';

const base = '/common/permissions';

export default [
  http.get(`${base}/schema`, () => {
    return HttpResponse.json(
      {
        "buttons": [{
          "path": "[default]",
          "color": "blue",
          "variant": "outlined",
          "icon": "PlusCircleOutlined",
          "argumentMaxSize": 1,
          "sort": 0,
          "type": "primary",
          "danger": false,
          "title": "i18n:table.button.add",
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
          "title": "i18n:table.button.delete",
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
          "title": "i18n:table.button.edit",
          "argumentMinSize": 1,
          "key": "edit"
        }],
        "schema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "properties": {
            "authority": {
              "type": ["string", "null"],
              "title": "i18n:permissions.title.authority",
              "description": "i18n:permissions.description.authority",
              "x-ui": {"x-list-visible": "true"}
            },
            "method": {
              "type": ["string", "null"],
              "title": "i18n:permissions.title.method",
              "description": "i18n:permissions.description.method",
              "x-ui": {"x-list-visible": "true"}
            },
            "resource": {
              "type": ["string", "null"],
              "title": "i18n:permissions.title.resource",
              "description": "i18n:permissions.description.resource",
              "x-ui": {"x-list-visible": "true"}
            },
            "resourceType": {
              "type": ["string", "null"],
              "title": "i18n:permissions.title.permissionName",
              "description": "i18n:permissions.description.permissionName",
              "x-ui": {"x-list-visible": "true"}
            }
          }
        }
      }
    )
  }),
  http.get(`${base}`, () => {
    return HttpResponse.json(
      {"content": [], "page": {"size": 20, "number": 0, "totalElements": 0, "totalPages": 0}}
    )
  }),
  http.get(`${base}/items`, () => {
    return HttpResponse.json({
      'content': [
        {
          'name': '测试权限',
          'description': '拥有系统内所有权限',
          'authority': 'SYSTEM'
        },
        {
          'name': '测试权限2',
          'description': '通用权限',
          'authority': 'COMMON'
        }
      ],
      "page": {
        "size": 10,
        "number": 0,
        "totalElements": 2,
        "totalPages": 1
      }
    })
  })
];



