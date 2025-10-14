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

  http.get('/common/menus', () => {
    return HttpResponse.json(
      {
        "content": [
          {
            "id": 1941571637405159400,
            "updatedAt": "2025-07-05T18:55:25.696863Z",
            "uuid": "11c65b25-15aa-4b2d-b181-adc388a1e999",
            "label": "微服务中心",
            "parent": "d727e696-3c10-4a28-b3d7-ea6c70125385",
            "icon": "AppstoreOutlined",
            "path": "/ops/services",
            "type": "item",
            "component": "common/ops/MicroService"
          },
          {
            "id": 1941571637606486000,
            "updatedAt": "2025-07-05T18:55:25.720278Z",
            "uuid": "6b1e6393-5e25-4e48-a5a2-224cb3f167fe",
            "label": "国家和地区",
            "parent": "347ce030-e6c6-41b6-9d4b-bb1b27f419a5",
            "icon": "BankOutlined",
            "path": "/locale/country-range",
            "type": "item",
            "component": "common/locale/CountryRange"
          },
          {
            "id": 1941571637635846100,
            "updatedAt": "2025-07-05T18:55:25.727525Z",
            "uuid": "3b6a3cb8-aab3-4fb8-8635-8fcb0a0f05de",
            "label": "数据权限",
            "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "icon": "BarsOutlined",
            "path": "/ac/data",
            "type": "item",
            "component": "common/ac/Data"
          },
          {
            "id": 1941571637673595000,
            "updatedAt": "2025-07-05T18:55:25.735755Z",
            "uuid": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "label": "访问控制",
            "icon": "SecurityScanOutlined",
            "path": "/ac"
          },
          {
            "id": 1941571637702955000,
            "updatedAt": "2025-07-05T18:55:25.742633Z",
            "uuid": "1f9c9a49-5f06-4b1a-ba4a-3460647455b5",
            "label": "用户管理",
            "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "icon": "UserOutlined",
            "path": "/ac/user",
            "type": "item",
            "component": "common/ac/User"
          },
          {
            "id": 1941571637736509400,
            "updatedAt": "2025-07-05T18:55:25.750138Z",
            "uuid": "d727e696-3c10-4a28-b3d7-ea6c70125385",
            "label": "系统维护",
            "icon": "SettingOutlined",
            "path": "/ops"
          },
          {
            "id": 1941571637761675300,
            "updatedAt": "2025-07-05T18:55:25.757174Z",
            "uuid": "5dbd58e5-5a30-4a84-b312-7d1bbf7e4bcd",
            "label": "字段权限",
            "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "icon": "TableOutlined",
            "path": "/ac/field",
            "type": "item",
            "component": "common/ac/Field"
          },
          {
            "id": 1941571637791035400,
            "updatedAt": "2025-07-05T18:55:25.764141Z",
            "uuid": "347ce030-e6c6-41b6-9d4b-bb1b27f419a5",
            "label": "国际化多语言",
            "icon": "GlobalOutlined",
            "path": "/locale"
          },
          {
            "id": 1941571637820395500,
            "updatedAt": "2025-07-05T18:55:25.770428Z",
            "uuid": "50b77c63-95ca-490c-823c-666a6e4c9897",
            "label": "菜单管理",
            "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "icon": "MenuOutlined",
            "path": "/ac/menu",
            "type": "item",
            "component": "common/ac/Menu"
          },
          {
            "id": 1941571637849755600,
            "updatedAt": "2025-07-05T18:55:25.778221Z",
            "uuid": "5c80cf0f-cc35-4dfd-b62e-82a4f7a66a31",
            "label": "角色管理",
            "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "icon": "UsergroupAddOutlined",
            "path": "/ac/role",
            "type": "item",
            "component": "common/ac/Role"
          },
          {
            "id": 1941571637883310000,
            "updatedAt": "2025-07-05T18:55:25.786480Z",
            "uuid": "57b3826f-c2f5-4c48-a641-92cc76ad0c80",
            "label": "多语言管理",
            "parent": "347ce030-e6c6-41b6-9d4b-bb1b27f419a5",
            "icon": "TranslationOutlined",
            "path": "/locale/language",
            "type": "item",
            "component": "common/locale/Language"
          },
          {
            "id": 1941571637921058800,
            "updatedAt": "2025-07-05T18:55:25.795040Z",
            "uuid": "cc3bfc2c-fd59-4b37-9540-7fcc37b17d4b",
            "label": "时区",
            "parent": "347ce030-e6c6-41b6-9d4b-bb1b27f419a5",
            "icon": "HistoryOutlined",
            "path": "/locale/timezone",
            "type": "item",
            "component": "common/locale/timezone"
          },
          {
            "id": 1941571637954613200,
            "updatedAt": "2025-07-05T18:55:25.802047Z",
            "uuid": "93a4e7e1-c640-49b3-bd7a-a3526da9a3ed",
            "label": "端点管理",
            "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "icon": "ApiOutlined",
            "path": "/ac/endpoints",
            "type": "item",
            "component": "common/ac/Endpoint"
          },
          {
            "id": 1941571637979779000,
            "updatedAt": "2025-07-05T18:55:25.808551Z",
            "uuid": "d61c1685-8c8b-45aa-9960-7eccc805df72",
            "label": "国际化键值",
            "parent": "347ce030-e6c6-41b6-9d4b-bb1b27f419a5",
            "icon": "MessageOutlined",
            "path": "/locale/message",
            "type": "item",
            "component": "common/locale/message"
          },
          {
            "id": 1941571638013333500,
            "updatedAt": "2025-07-05T18:55:25.816705Z",
            "uuid": "feeddc89-ba43-4d65-9d4a-f583b9c39569",
            "label": "微应用中心",
            "parent": "d727e696-3c10-4a28-b3d7-ea6c70125385",
            "icon": "AppstoreAddOutlined",
            "path": "/ops/app",
            "type": "item",
            "component": "common/ops/MicroApp"
          },
          {
            "id": 1941571638042693600,
            "updatedAt": "2025-07-05T18:55:25.824781Z",
            "uuid": "f8b388a6-056a-4b02-bd44-bd2b684d1e9f",
            "label": "授权管理",
            "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "icon": "AppstoreOutlined",
            "path": "/ac/auth",
            "type": "item",
            "component": "common/ac/Auth"
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