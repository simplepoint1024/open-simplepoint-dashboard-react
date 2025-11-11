import {http, HttpResponse} from 'msw';

export default [
  http.get('/common/menus/schema', () => {
    return HttpResponse.json(
      {
        "buttons": [
          {
            "path": "[default]",
            "color": "blue",
            "authority": "menus:add",
            "variant": "outlined",
            "icon": "PlusCircleOutlined",
            "argumentMaxSize": 1,
            "sort": 0,
            "type": "primary",
            "title": "i18n:table.button.add",
            "danger": false,
            "argumentMinSize": 0,
            "key": "add"
          },
          {
            "path": "[default]",
            "color": "danger",
            "authority": "menus:delete",
            "variant": "outlined",
            "icon": "MinusCircleOutlined",
            "argumentMaxSize": 10,
            "sort": 2,
            "type": "primary",
            "title": "i18n:table.button.delete",
            "danger": true,
            "argumentMinSize": 1,
            "key": "delete"
          },
          {
            "path": "[default]",
            "color": "orange",
            "authority": "menus:edit",
            "variant": "outlined",
            "icon": "EditOutlined",
            "argumentMaxSize": 1,
            "sort": 1,
            "type": "primary",
            "title": "i18n:table.button.edit",
            "danger": false,
            "argumentMinSize": 1,
            "key": "edit"
          }
        ],
        "schema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "object",
          "properties": {
            "label": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:menus.title.label",
              "description": "i18n:menus.description.label",
              "minLength": 1,
              "maxLength": 50,
              "x-order": 0,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "title": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:menus.title.title",
              "description": "i18n:menus.description.title",
              "minLength": 1,
              "maxLength": 100,
              "x-order": 0,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "icon": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:menus.title.icon",
              "description": "i18n:menus.description.icon",
              "minLength": 1,
              "maxLength": 100,
              "x-order": 1,
              "x-ui": {
                "x-list-visible": "true",
                "widget": "IconPicker"
              }
            },
            "sort": {
              "type": "integer",
              "title": "i18n:menus.title.sort",
              "description": "i18n:menus.description.sort",
              "x-order": 1,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "type": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:menus.title.type",
              "description": "i18n:menus.description.type",
              "minLength": 1,
              "maxLength": 32,
              "x-order": 2,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "path": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:menus.title.path",
              "description": "i18n:menus.description.path",
              "minLength": 1,
              "maxLength": 200,
              "x-order": 3,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "component": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:menus.title.component",
              "description": "i18n:menus.description.component",
              "minLength": 5,
              "maxLength": 100,
              "x-order": 4,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "authority": {
              "type": [
                "string",
                "null"
              ],
              "title": "i18n:menus.title.authority",
              "description": "i18n:menus.description.authority",
              "minLength": 1,
              "maxLength": 36,
              "x-ui": {
                "x-list-visible": "true"
              }
            },
            "danger": {
              "type": "boolean",
              "title": "i18n:menus.title.danger",
              "description": "i18n:menus.description.danger"
            },
            "disabled": {
              "type": "boolean",
              "title": "i18n:menus.title.disabled",
              "description": "i18n:menus.description.disabled",
              "x-ui": {
                "x-list-visible": "true"
              }
            }
          }
        }
      }
    )
  }),

  http.get('/common/menus', () => {
    return HttpResponse.json(
      {
        "content": [
          {
            "id": "38765bf8-9617-40f3-9031-68ab50c3a410",
            "updatedAt": "2025-10-29T11:33:38.693763Z",
            "uuid": "91639c9d-86b1-44cd-8539-1297df4f6218",
            "label": "系统维护",
            "icon": "SettingOutlined",
            "path": "/ops",
            "children": [
              {
                "id": "718ae0a1-de9f-4788-a698-d86fa0142560",
                "updatedAt": "2025-10-29T11:33:38.676644Z",
                "uuid": "4b8b6611-ff34-49c8-a85d-93b71800355a",
                "label": "微应用中心",
                "parent": "91639c9d-86b1-44cd-8539-1297df4f6218",
                "icon": "AppstoreAddOutlined",
                "path": "/ops/app",
                "type": "item",
                "component": "common/ops/MicroApp",
                "children": []
              },
              {
                "id": "f2868061-f647-4f8c-aa99-666dca54ddec",
                "updatedAt": "2025-10-29T11:33:38.692253Z",
                "uuid": "0d7a3d08-2845-4aeb-96c0-1d5809c7aa5d",
                "label": "微服务中心",
                "parent": "91639c9d-86b1-44cd-8539-1297df4f6218",
                "icon": "AppstoreOutlined",
                "path": "/ops/services",
                "type": "item",
                "component": "common/ops/MicroService",
                "children": []
              },
              {
                "id": "a5f2c1b0-9e3e-4a7f-8c11-2b4c6d7e8f90",
                "updatedAt": "2025-10-29T11:33:38.800000Z",
                "uuid": "c1d2e3f4-5678-49ab-90cd-ef0123456789",
                "label": "百度",
                "parent": "91639c9d-86b1-44cd-8539-1297df4f6218",
                "icon": "LinkOutlined",
                "path": "/ops/baidu",
                "type": "item",
                "component": "iframe:https://www.baidu.com",
                "children": []
              }
            ]
          },
          {
            "id": "36a7a730-fdab-471c-adbb-601e606cb140",
            "updatedAt": "2025-10-29T11:33:38.702761Z",
            "uuid": "ebf8fa9f-a70e-4ad4-af23-8baa9f01c27a",
            "label": "国际化多语言",
            "icon": "GlobalOutlined",
            "path": "/locale",
            "children": [
              {
                "id": "11177141-c56b-4c6d-b1e7-a1be3714f43f",
                "updatedAt": "2025-10-29T11:33:38.678160Z",
                "uuid": "07c5cc21-098c-4206-b170-7de325c4ecb3",
                "label": "时区",
                "parent": "ebf8fa9f-a70e-4ad4-af23-8baa9f01c27a",
                "icon": "HistoryOutlined",
                "path": "/locale/timezone",
                "type": "item",
                "component": "common/locale/timezone",
                "children": []
              },
              {
                "id": "4f1bd1bd-fcfe-436c-9621-c4629aaec848",
                "updatedAt": "2025-10-29T11:33:38.681253Z",
                "uuid": "410165a9-2ad7-4e6d-be53-e1d89b78667a",
                "label": "国家和地区",
                "parent": "ebf8fa9f-a70e-4ad4-af23-8baa9f01c27a",
                "icon": "BankOutlined",
                "path": "/locale/country-range",
                "type": "item",
                "component": "common/locale/CountryRange",
                "children": []
              },
              {
                "id": "615717aa-e68d-4d12-8771-97df48e67329",
                "updatedAt": "2025-10-29T11:33:38.688253Z",
                "uuid": "cc8c0b48-e26f-4c56-a28d-0fd5f062d342",
                "label": "多语言管理",
                "parent": "ebf8fa9f-a70e-4ad4-af23-8baa9f01c27a",
                "icon": "TranslationOutlined",
                "path": "/locale/language",
                "type": "item",
                "component": "common/locale/Language",
                "children": []
              },
              {
                "id": "37be1336-765f-48a2-8c9a-484820985dd0",
                "updatedAt": "2025-10-29T11:33:38.695762Z",
                "uuid": "4b0babd7-f09e-46d9-a110-90c42233a92a",
                "label": "国际化键值",
                "parent": "ebf8fa9f-a70e-4ad4-af23-8baa9f01c27a",
                "icon": "MessageOutlined",
                "path": "/locale/message",
                "type": "item",
                "component": "common/locale/message",
                "children": []
              }
            ]
          },
          {
            "id": "8d14c87f-3270-4cf4-9a3d-19749783492d",
            "updatedAt": "2025-10-15T04:19:18.445753Z",
            "uuid": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
            "label": "平台管理",
            "icon": "KeyOutlined",
            "path": "/system",
            "type": "item",
            "component": "common/ac/Client",
            "children": [
              {
                "id": "abc5e586-3919-4e6b-be46-adddf9b79035",
                "updatedAt": "2025-10-15T04:19:18.435622Z",
                "uuid": "93846769-cc52-451b-bfdd-cf400c955162",
                "label": "端点管理",
                "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
                "icon": "ApiOutlined",
                "path": "/system/endpoints",
                "type": "item",
                "component": "common/ac/Endpoint",
                "children": []
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
                "component": "common/ac/Menu",
                "children": []
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
                "component": "common/ac/Role",
                "children": []
              },
              {
                "id": "7dd653d1-f66b-4030-a27c-d7db47369bcf",
                "updatedAt": "2025-10-15T04:19:18.407190Z",
                "uuid": "36f8a64c-0d18-48d9-ab9c-6e58df3fe843",
                "label": "用户配置",
                "parent": "6a8cb86d-e9d2-4a53-a3eb-11e396786b96",
                "icon": "UserOutlined",
                "path": "/system/user",
                "type": "item",
                "component": "common/ac/User",
                "children": []
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
                "component": "common/ac/Data",
                "children": []
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
                "component": "common/ac/Field",
                "children": []
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
                "component": "common/ac/Auth",
                "children": []
              }
            ]
          },
          {
            "id": "af83acf1-8496-44e3-a3f1-c9442214f6bc",
            "updatedAt": "2025-10-29T11:33:38.685253Z",
            "uuid": "2bd71ac7-5392-4c1e-affa-ff2015c5b660",
            "label": "访问控制",
            "icon": "SecurityScanOutlined",
            "path": "/system",
            "children": []
          }
        ],
        "page": {
          "size": 20,
          "number": 0,
          "totalElements": 4,
          "totalPages": 1
        }
      }
    )
  }),
];



