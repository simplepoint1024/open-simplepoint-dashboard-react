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
            "id": "5f3f3f6e-B7c5-4d3e-8f4a-2c1e5d6f7a8b",
            "updatedAt": "2025-10-30T06:05:28.455Z",
            "uuid": "de233e0c-7b13-4ffb-9754-0857a59a8f09",
            "label": "Dashboard",
            "icon": "DashboardOutlined",
            "path": "/dashboard",
            "component": "common/dashboard"
          },
          {
            "id": "e9985023-f307-44de-aae4-88b6ebc2d37e",
            "updatedAt": "2025-10-30T06:07:42.549409Z",
            "uuid": "de233e0c-7b13-4ffb-9754-0857a59a8f69",
            "label": "国际化管理",
            "icon": "GlobalOutlined",
            "path": "/i18n",
            "type": "item",
            "children": [
              {
                "id": "06eeea53-08a6-4e31-b0bd-24efee7f29c6",
                "updatedAt": "2025-10-30T06:11:07.358479Z",
                "uuid": "de233e0c-7b13-4ffb-9754-0857a59a8f68",
                "label": "国家和地区",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f69",
                "icon": "GlobalOutlined",
                "path": "/i18n/country-range",
                "type": "item",
                "children": []
              },
              {
                "id": "84005594-1951-4013-a879-719e3bccb5f3",
                "updatedAt": "2025-10-30T06:18:29.643159Z",
                "uuid": "1df8808f-7302-44f5-9d77-1dba4238e6c8",
                "label": "国际化消息",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f69",
                "icon": "CommentOutlined",
                "path": "/i18n/message",
                "type": "item",
                "children": []
              }
            ]
          },
          {
            "id": "a7e64824-e835-4a0d-b34a-2a8c87c13bfe",
            "updatedAt": "2025-10-30T06:21:22.436333Z",
            "uuid": "388bf12a-054f-4aad-88fe-967a2bb9dd66",
            "label": "监控审计",
            "icon": "EyeOutlined",
            "path": "/monitoring",
            "type": "item",
            "children": [
              {
                "id": "4c2c5f86-6460-442c-ab13-7dd741147d95",
                "updatedAt": "2025-10-30T06:23:20.661221Z",
                "uuid": "018045be-56d6-493e-b320-f7cd9fdf26d5",
                "label": "登录日志",
                "parent": "388bf12a-054f-4aad-88fe-967a2bb9dd66",
                "icon": "SendOutlined",
                "path": "/monitoring/login-log",
                "type": "item",
                "children": []
              },
              {
                "id": "33123378-902b-496e-a990-cfc9a4a9a82d",
                "updatedAt": "2025-10-30T06:24:26.248449Z",
                "uuid": "f67daf2a-11ba-4fc8-8388-6879b7e2cbd3",
                "label": "操作日志",
                "parent": "388bf12a-054f-4aad-88fe-967a2bb9dd66",
                "icon": "FormOutlined",
                "path": "/monitoring",
                "type": "item",
                "children": []
              }
            ]
          },
          {
            "id": "efdcbf57-da05-4950-b133-ec2a656b37a4",
            "updatedAt": "2025-10-30T06:25:37.883837Z",
            "uuid": "9b3d3b2d-37bf-46ff-879a-84d66f0740c7",
            "label": "系统维护",
            "icon": "ClusterOutlined",
            "path": "/ops",
            "type": "item",
            "children": [
              {
                "id": "26a8428b-b7f1-4dee-8855-918ddd10c69c",
                "updatedAt": "2025-10-30T06:27:44.515324Z",
                "uuid": "724f2736-ecc0-41b5-8567-5da2862fcc50",
                "label": "微服务管理",
                "parent": "9b3d3b2d-37bf-46ff-879a-84d66f0740c7",
                "icon": "QrcodeOutlined",
                "path": "/ops/micro-service",
                "type": "item",
                "children": []
              },
              {
                "id": "9e517903-7760-4db1-b7ad-b19018398235",
                "updatedAt": "2025-10-30T06:29:05.309408Z",
                "uuid": "7de24df0-0711-4ece-acc6-e121e50cfcba",
                "label": "插件市场",
                "parent": "9b3d3b2d-37bf-46ff-879a-84d66f0740c7",
                "icon": "BuildOutlined",
                "path": "/ops/micro-plugin",
                "type": "item",
                "children": []
              },
              {
                "id": "0aa55a40-1fba-48f0-af36-b8f804d4f52b",
                "updatedAt": "2025-10-30T06:29:16.384552Z",
                "uuid": "b7cf27d8-b3a2-48a9-be96-27c62bd7cb01",
                "label": "微应用管理",
                "parent": "9b3d3b2d-37bf-46ff-879a-84d66f0740c7",
                "icon": "DropboxOutlined",
                "path": "/ops/micro-application",
                "type": "item",
                "children": []
              }
            ]
          },
          {
            "id": "182a10eb-5245-4717-8b5a-7fc48e516b53",
            "updatedAt": "2025-10-30T06:30:35.983310Z",
            "uuid": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
            "label": "系统配置",
            "icon": "SettingOutlined",
            "path": "/system",
            "type": "item",
            "children": [
              {
                "id": "daad6728-ca6b-4739-b930-9d0effdc47d6",
                "updatedAt": "2025-10-30T07:56:50.102221Z",
                "uuid": "9082a9a3-be25-4b8c-8472-d54a5552e206",
                "label": "应用管理",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "KeyOutlined",
                "path": "/system/client",
                "type": "item",
                "component": "common/system/client",
                "children": []
              },
              {
                "id": "77d52c17-2b4f-4a26-b0c8-3d6a4c4c8e0e",
                "updatedAt": "2025-10-30T04:10:41.548053Z",
                "uuid": "f05fe303-ea90-4a78-a413-fb90b0c274bb",
                "label": "端点管理",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "ApiOutlined",
                "path": "/system/endpoints",
                "type": "item",
                "component": "common/system/endpoint",
                "children": []
              },
              {
                "id": "c7157df0-10d2-4f99-a15c-8915a9b807b7",
                "updatedAt": "2025-10-30T04:10:41.557309Z",
                "uuid": "9ddf575b-4352-4da8-85b5-47b19e9a1a9b",
                "label": "角色管理",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "UsergroupAddOutlined",
                "path": "/system/role",
                "type": "item",
                "component": "common/system/role",
                "children": []
              },
              {
                "id": "f799cced-da52-487d-969a-2209509370d3",
                "updatedAt": "2025-10-30T04:10:41.562102Z",
                "uuid": "30d799ec-1935-46b5-a170-e3b08d263386",
                "label": "授权管理",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "AppstoreOutlined",
                "path": "/system/auth",
                "type": "item",
                "component": "common/system/auth",
                "children": []
              },
              {
                "id": "21e229a6-808b-48a9-8d9b-ca63ca69adcf",
                "updatedAt": "2025-10-30T04:10:41.566992Z",
                "uuid": "820851bc-d89e-4b48-a226-bbb3dfa3d57a",
                "label": "字段权限",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "TableOutlined",
                "path": "/system/field",
                "type": "item",
                "component": "common/system/field",
                "children": []
              },
              {
                "id": "19e25336-fc9c-49a8-91cc-1dee212714f6",
                "updatedAt": "2025-10-30T04:10:41.569926Z",
                "uuid": "49cbc34d-7237-4fc6-92e4-b6547c68f9c0",
                "label": "数据权限",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "BarsOutlined",
                "path": "/system/data",
                "type": "item",
                "component": "common/system/data",
                "children": []
              },
              {
                "id": "6d96279b-aa69-44ca-a9e4-a31c51ebe245",
                "updatedAt": "2025-10-30T04:10:41.569926Z",
                "uuid": "0ded81d8-0af5-4534-94fb-2e6eaf656676",
                "label": "菜单管理",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "MenuOutlined",
                "path": "/system/menu",
                "type": "item",
                "component": "common/system/menu",
                "children": []
              },
              {
                "id": "05eeea1b-751a-4ae6-a683-fda8c60b9577",
                "updatedAt": "2025-10-30T04:10:41.577389Z",
                "uuid": "2e1ad60f-d9d2-42ce-bdca-937eb6c0df89",
                "label": "用户管理",
                "parent": "de233e0c-7b13-4ffb-9754-0857a59a8f67",
                "icon": "UserOutlined",
                "path": "/system/user",
                "type": "item",
                "component": "common/system/user",
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