import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/menu/schema', () => {
    return HttpResponse.json(
      {
        "schema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "properties": {
            "ancestors": {
              "type": [
                "string",
                "null"
              ],
              "title": "祖先关系",
              "description": "菜单的层级祖先关系"
            },
            "component": {
              "type": [
                "string",
                "null"
              ],
              "title": "菜单组件",
              "description": "用于渲染菜单的UI组件",
              "minLength": 5,
              "maxLength": 100,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "danger": {
              "type": "boolean",
              "title": "危险标志",
              "description": "指示菜单项是否表示潜在的危险操作"
            },
            "disabled": {
              "type": "boolean",
              "title": "禁用标志",
              "description": "指示菜单项是否被禁用",
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "icon": {
              "type": [
                "string",
                "null"
              ],
              "title": "菜单图标",
              "description": "菜单的图标",
              "minLength": 1,
              "maxLength": 100,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "label": {
              "type": [
                "string",
                "null"
              ],
              "title": "菜单标签",
              "description": "菜单的标签",
              "minLength": 1,
              "maxLength": 50,
              "x-ui": {
                "x-list-visible": "true"
              },
              "x-order": 1
            },
            "parent": {
              "type": [
                "string",
                "null"
              ],
              "title": "父级菜单",
              "description": "父级菜单的标识符",
              "minLength": 1,
              "maxLength": 32
            },
            "path": {
              "type": [
                "string",
                "null"
              ],
              "title": "菜单路径",
              "description": "菜单的导航路径",
              "minLength": 1,
              "maxLength": 200,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "title": {
              "type": [
                "string",
                "null"
              ],
              "title": "菜单标题",
              "description": "菜单的显示标题",
              "minLength": 1,
              "maxLength": 50,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "type": {
              "type": [
                "string",
                "null"
              ],
              "title": "菜单类型",
              "description": "菜单项的类型",
              "minLength": 1,
              "maxLength": 20,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "uuid": {
              "type": [
                "string",
                "null"
              ],
              "title": "菜单UUID",
              "description": "菜单的唯一标识符",
              "minLength": 1,
              "maxLength": 32
            }
          }
        },
        "buttons": [
          {
            "path": "[default]",
            "color": "orange",
            "variant": "outlined",
            "icon": "EditOutlined",
            "argumentMaxSize": -1,
            "sort": 1,
            "type": "primary",
            "title": "编辑",
            "danger": false,
            "argumentMinSize": -1,
            "key": "edit"
          },
          {
            "path": "[default]",
            "color": "blue",
            "variant": "outlined",
            "icon": "PlusCircleOutlined",
            "argumentMaxSize": -1,
            "sort": 0,
            "type": "primary",
            "title": "添加",
            "danger": false,
            "argumentMinSize": -1,
            "key": "add"
          },
          {
            "path": "[default]",
            "color": "danger",
            "variant": "outlined",
            "icon": "MinusCircleOutlined",
            "argumentMaxSize": -1,
            "sort": 2,
            "type": "primary",
            "title": "删除",
            "danger": false,
            "argumentMinSize": -1,
            "key": "del"
          }
        ]
      }
      )
  }),

  http.get('/common/menu', () => {
    return HttpResponse.json(
      {
        "content": [
          {
            "id": "7dd653d1-f66b-4030-a27c-d7db47369bcf",
            "updatedAt": "2025-10-15T04:19:18.407190Z",
            "uuid": "36f8a64c-0d18-48d9-ab9c-6e58df3fe843",
            "label": "用户管理",
            "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "icon": "UserOutlined",
            "path": "/system/user",
            "type": "item",
            "component": "common/system/User",
            "children": []
          },
          {
            "id": "b3414896-cba9-4fd8-93b2-3cdb3f452f25",
            "updatedAt": "2025-10-15T04:19:18.431617Z",
            "uuid": "c8a66433-427f-440d-8130-f3f83b21fa09",
            "label": "国际化键值",
            "parent": "f1640a13-1fc0-4ee6-8758-b50b436ae07b",
            "icon": "MessageOutlined",
            "path": "/locale/message",
            "type": "item",
            "component": "common/locale/message"
          },
          {
            "id": "a333fea0-dc98-479c-a2fa-57764d81d20a",
            "updatedAt": "2025-10-15T04:19:18.433622Z",
            "uuid": "757173d0-2bf2-4760-ae16-276ce03bd8dc",
            "label": "菜单管理",
            "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "icon": "MenuOutlined",
            "path": "/system/menu",
            "type": "item",
            "component": "common/system/Menu"
          },
          {
            "id": "abc5e586-3919-4e6b-be46-adddf9b79035",
            "updatedAt": "2025-10-15T04:19:18.435622Z",
            "uuid": "93846769-cc52-451b-bfdd-cf400c955162",
            "label": "端点管理",
            "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "icon": "ApiOutlined",
            "path": "/system/endpoints",
            "type": "item",
            "component": "common/system/Endpoint"
          },
          {
            "id": "e46136d1-44ca-4f1f-ae17-ee0aca0bef4f",
            "updatedAt": "2025-10-15T04:19:18.437622Z",
            "uuid": "7fe316a2-18c4-4ea5-8ff0-df533fd61b0e",
            "label": "授权管理",
            "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "icon": "AppstoreOutlined",
            "path": "/system/auth",
            "type": "item",
            "component": "common/system/Auth"
          },
          {
            "id": "2110c7a6-6b41-482b-8154-d6a03464e58c",
            "updatedAt": "2025-10-15T04:19:18.440131Z",
            "uuid": "f082e1ec-e357-4781-ba57-af0e44f6089e",
            "label": "角色管理",
            "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "icon": "UsergroupAddOutlined",
            "path": "/system/role",
            "type": "item",
            "component": "common/system/Role"
          },
          {
            "id": "0380e919-f973-49a2-8ffb-584466966b1c",
            "updatedAt": "2025-10-15T04:19:18.441634Z",
            "uuid": "37888828-2733-4c33-85d2-f4608e25f794",
            "label": "系统维护",
            "icon": "SettingOutlined",
            "path": "/ops"
          },
          {
            "id": "1a727149-03cb-4fb2-b774-8ea550d23a7f",
            "updatedAt": "2025-10-15T04:19:18.444144Z",
            "uuid": "c711fb56-38cd-4e46-ba1c-d3f448b0eee3",
            "label": "字段权限",
            "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "icon": "TableOutlined",
            "path": "/system/field",
            "type": "item",
            "component": "common/system/Field"
          },
          {
            "id": "1d355be0-fda5-4917-af21-220f4058f4f8",
            "updatedAt": "2025-10-15T04:19:18.447757Z",
            "uuid": "7dd5907e-f36b-40dd-b9a0-3be5ff8bec9e",
            "label": "数据权限",
            "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "icon": "BarsOutlined",
            "path": "/system/data",
            "type": "item",
            "component": "common/system/Data"
          },
          {
            "id": "9bcd8e87-e775-40ad-ba7e-59a541f13c72",
            "updatedAt": "2025-10-15T04:19:18.448758Z",
            "uuid": "079d4e8f-8f3d-4711-99c4-2507b20bb0b8",
            "label": "多语言管理",
            "parent": "f1640a13-1fc0-4ee6-8758-b50b436ae07b",
            "icon": "TranslationOutlined",
            "path": "/locale/language",
            "type": "item",
            "component": "common/locale/Language"
          },
          {
            "id": "1a63bba0-2f55-4c0d-a812-0633704bb3c1",
            "updatedAt": "2025-10-15T04:19:18.450758Z",
            "uuid": "52bba776-926a-40b3-8546-03dba3ca94ac",
            "label": "国家和地区",
            "parent": "f1640a13-1fc0-4ee6-8758-b50b436ae07b",
            "icon": "BankOutlined",
            "path": "/locale/country-range",
            "type": "item",
            "component": "common/locale/CountryRange"
          },
          {
            "id": "ef7d1936-0aec-4caa-8f6c-c2835e4ca199",
            "updatedAt": "2025-10-15T04:19:18.451758Z",
            "uuid": "0ef85afb-963e-4989-bca2-3a9f82f818cd",
            "label": "微服务中心",
            "parent": "37888828-2733-4c33-85d2-f4608e25f794",
            "icon": "AppstoreOutlined",
            "path": "/ops/services",
            "type": "item",
            "component": "common/ops/MicroService"
          },
          {
            "id": "30a49a5d-5b61-40df-a226-e9e01b429757",
            "updatedAt": "2025-10-15T04:19:18.453835Z",
            "uuid": "7738ffb9-5eef-4dca-868d-6a3d7480de09",
            "label": "微应用中心",
            "parent": "37888828-2733-4c33-85d2-f4608e25f794",
            "icon": "AppstoreAddOutlined",
            "path": "/ops/app",
            "type": "item",
            "component": "common/ops/MicroApp"
          },
          {
            "id": "90fce924-2f6c-4f0f-8de9-85dcd822c663",
            "updatedAt": "2025-10-15T04:19:18.454833Z",
            "uuid": "9c21403f-357b-4f53-9267-9f86880cf370",
            "label": "时区",
            "parent": "f1640a13-1fc0-4ee6-8758-b50b436ae07b",
            "icon": "HistoryOutlined",
            "path": "/locale/timezone",
            "type": "item",
            "component": "common/locale/timezone"
          },
          {
            "id": "ea769b7a-6764-4317-ab98-616a401c2c0b",
            "updatedAt": "2025-10-15T04:19:18.459834Z",
            "uuid": "f1640a13-1fc0-4ee6-8758-b50b436ae07b",
            "label": "国际化多语言",
            "icon": "GlobalOutlined",
            "path": "/locale"
          },
          {
            "id": "8d14c87f-3270-4cf4-9a3d-19749783492d",
            "updatedAt": "2025-10-15T04:19:18.445753Z",
            "uuid": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "label": "平台管理",
            "icon": "KeyOutlined",
            "path": "/ac",
            "type": "item",
            "component": "common/system/Client"
          }
        ],
        "page": {
          "size": 20,
          "number": 0,
          "totalElements": 16,
          "totalPages": 1
        }
      }
    )
  }),
];

export default apis;