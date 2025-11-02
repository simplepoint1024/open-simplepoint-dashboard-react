import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/modules', () => {
    return HttpResponse.json({
      page: {
        number: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1
      },
      content: [
        {
          name: 'common',
          entry: 'http://127.0.0.1:3001/common/mf/mf-manifest.json'
        }
      ]
    })
  }),

  http.get('/common/menus/routes', () => {
    return HttpResponse.json(
      {
        "content": [
          {
            "id": "9ce7ce2f-2d3d-4cbb-b4ef-8d2862962fbd",
            "uuid": "8af57547-6ccd-4974-a393-91d84793dd94",
            "label": "Dashboard",
            "title": "menu.dashboard",
            "icon": "DashboardOutlined",
            "sort": 0,
            "path": "/dashboard",
            "component": "common/dashboard",
            "disabled": false,
            "children": []
          },
          {
            "id": "96d99150-b1aa-4c39-9a5f-166e7ae2eb8c",
            "uuid": "edee2369-e371-400f-9967-0876bc55c727",
            "label": "系统配置",
            "title": "menu.system",
            "icon": "SettingOutlined",
            "sort": 1,
            "path": "/system",
            "type": "item",
            "disabled": false,
            "children": [
              {
                "id": "c6d2af00-18cb-45cb-86f4-8bbb2c7e1d1e",
                "uuid": "982c97ac-9427-470c-ab03-7044fd14a9ad",
                "label": "用户管理",
                "title": "menu.system.user",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "UserOutlined",
                "sort": 0,
                "path": "/system/user",
                "type": "item",
                "component": "common/system/user",
                "disabled": false,
                "children": []
              },
              {
                "id": "c4363acb-3599-4dc6-8680-f37bbba9c49f",
                "uuid": "c45bb4dc-d8fb-45e7-8ecb-4949f741197b",
                "label": "菜单管理",
                "title": "menu.system.menu",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "MenuOutlined",
                "sort": 1,
                "path": "/system/menu",
                "type": "item",
                "component": "common/system/menu",
                "disabled": false,
                "children": []
              },
              {
                "id": "a8334de6-fbe8-4856-81f2-13578551337c",
                "uuid": "b1d44620-96d0-4f02-a791-504813d093bc",
                "label": "角色管理",
                "title": "menu.system.role",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "UsergroupAddOutlined",
                "sort": 2,
                "path": "/system/role",
                "type": "item",
                "component": "common/system/role",
                "disabled": false,
                "children": []
              },
              {
                "id": "03da8e3e-0ec3-4766-9a51-f482800c5b51",
                "uuid": "ad619e4c-580d-4564-8b39-333698af49f6",
                "label": "应用管理",
                "title": "menu.system.client",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "KeyOutlined",
                "sort": 3,
                "path": "/system/client",
                "type": "item",
                "component": "common/system/client",
                "disabled": false,
                "children": []
              },
              {
                "id": "b234e854-55e2-4477-b8a8-220eaff605e9",
                "uuid": "3b0551a4-5698-4658-816b-938ee1b864f5",
                "label": "授权管理",
                "title": "menu.system.auth",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "AppstoreOutlined",
                "sort": 4,
                "path": "/system/auth",
                "type": "item",
                "component": "common/system/auth",
                "disabled": false,
                "children": []
              },
              {
                "id": "5c0835f3-6ce0-4b02-a19d-bedbbde5a4d9",
                "uuid": "7df65bc1-7d95-4294-a66c-7294830d1a2a",
                "label": "字段权限",
                "title": "menu.system.field",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "TableOutlined",
                "path": "/system/field",
                "type": "item",
                "component": "common/system/field",
                "disabled": false,
                "children": []
              },
              {
                "id": "6020c51c-6b19-4691-bed0-5b2f5bd5da6f",
                "uuid": "3b2b7f1c-d03c-4ab7-8ea6-589d59ac3807",
                "label": "端点管理",
                "title": "menu.system.endpoints",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "ApiOutlined",
                "path": "/system/endpoints",
                "type": "item",
                "component": "common/system/endpoint",
                "disabled": false,
                "children": []
              },
              {
                "id": "f84d99c6-d93d-46e8-8794-80c3a96cba5a",
                "uuid": "44616c84-0aaa-4df9-89e0-cac693fe93d2",
                "label": "数据权限",
                "title": "menu.system.data",
                "parent": "edee2369-e371-400f-9967-0876bc55c727",
                "icon": "BarsOutlined",
                "path": "/system/data",
                "type": "item",
                "component": "common/system/data",
                "disabled": false,
                "children": []
              }
            ]
          },
          {
            "id": "fdaf0641-a114-4ee2-9a6b-913d2f85704d",
            "uuid": "58db1b24-e36a-4493-addf-678f87b355c0",
            "label": "系统维护",
            "title": "menu.ops",
            "icon": "ClusterOutlined",
            "path": "/ops",
            "type": "item",
            "disabled": false,
            "children": [
              {
                "id": "db754171-3e22-4745-b767-8063b12aa0b2",
                "uuid": "6704b821-9ac0-4715-986b-0f2391064927",
                "label": "插件市场",
                "title": "menu.ops.microPlugin",
                "parent": "58db1b24-e36a-4493-addf-678f87b355c0",
                "icon": "BuildOutlined",
                "path": "/ops/micro-plugin",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "id": "b4f7b2d0-2b7b-4f38-b004-bb71f626d52f",
                "uuid": "33635e4c-117f-481a-85c8-d7d48569ffff",
                "label": "微应用管理",
                "title": "menu.ops.microApplication",
                "parent": "58db1b24-e36a-4493-addf-678f87b355c0",
                "icon": "DropboxOutlined",
                "path": "/ops/micro-application",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "id": "df76ecef-1583-494b-b5d5-83b2c6231fd7",
                "uuid": "b145ad07-9f6b-4c82-87cd-3bb19225bcaa",
                "label": "微服务管理",
                "title": "menu.ops.microService",
                "parent": "58db1b24-e36a-4493-addf-678f87b355c0",
                "icon": "QrcodeOutlined",
                "path": "/ops/micro-service",
                "type": "item",
                "disabled": false,
                "children": []
              }
            ]
          },
          {
            "id": "b96b408c-fb98-4fc1-8529-162d3e604fa4",
            "uuid": "b076c998-c123-4585-b413-eb49a5b01cb5",
            "label": "监控审计",
            "title": "menu.monitoring",
            "icon": "EyeOutlined",
            "path": "/monitoring",
            "type": "item",
            "disabled": false,
            "children": [
              {
                "id": "46ba6aab-ff48-4575-a1d3-315894a192e5",
                "uuid": "1cc11ebc-ce67-4ab2-964e-21a8125fb77d",
                "label": "登录日志",
                "title": "menu.monitoring.loginLog",
                "parent": "b076c998-c123-4585-b413-eb49a5b01cb5",
                "icon": "SendOutlined",
                "path": "/monitoring/login-log",
                "type": "item",
                "disabled": false,
                "children": []
              }
            ]
          },
          {
            "id": "9caac4b3-03b0-42d7-890e-47c0357818ce",
            "uuid": "de233e0c-7b13-4ffb-9754-0857a59a8f69",
            "label": "国际化管理",
            "title": "menu.i18n",
            "icon": "GlobalOutlined",
            "path": "/i18n",
            "type": "item",
            "disabled": false,
            "children": [
              {
                "id": "5e12d965-e913-4f9b-9d97-0d7436e1e2f1",
                "uuid": "96a5be80-e389-41d7-952f-716e25d900c6",
                "label": "国际化消息",
                "title": "menu.i18n.message",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f69",
                "icon": "CommentOutlined",
                "path": "/i18n/message",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "id": "e095e26c-588c-4642-b890-9ad2dbeaa62c",
                "uuid": "4b6b45ef-f0b4-4cf4-b5f7-94e26621ca65",
                "label": "国家和地区",
                "title": "menu.i18n.countryRange",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f69",
                "icon": "GlobalOutlined",
                "path": "/i18n/country-range",
                "type": "item",
                "disabled": false,
                "children": []
              }
            ]
          }
        ],
        "page": {
          "size": 4,
          "number": 0,
          "totalElements": 4,
          "totalPages": 1
        }
      }
    )
  }),
];

export default apis;