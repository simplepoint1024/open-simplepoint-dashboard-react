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
            "id": 1941571637673595000,
            "updatedAt": "2025-07-05T18:55:25.735755Z",
            "uuid": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
            "label": "系统配置",
            "icon": "SecurityScanOutlined",
            "path": "/system",
            "children": [
              {
                "id": 1941571637702955000,
                "updatedAt": "2025-07-05T18:55:25.742633Z",
                "uuid": "1f9c9a49-5f06-4b1a-ba4a-3460647455b5",
                "label": "用户配置",
                "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
                "icon": "UserOutlined",
                "path": "/system/user",
                "type": "item",
                "component": "common/system/User"
              },
              {
                "id": 1941571637820395500,
                "updatedAt": "2025-07-05T18:55:25.770428Z",
                "uuid": "50b77c63-95ca-490c-823c-666a6e4c9897",
                "label": "菜单配置",
                "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
                "icon": "MenuOutlined",
                "path": "/system/menu",
                "type": "item",
                "component": "common/system/Menu"
              },
              {
                "id": 1941571637849755600,
                "updatedAt": "2025-07-05T18:55:25.778221Z",
                "uuid": "5c80cf0f-cc35-4dfd-b62e-82a4f7a66a31",
                "label": "角色配置",
                "parent": "48ca9ebf-ab5d-4a83-8499-12a71bf5d04e",
                "icon": "UsergroupAddOutlined",
                "path": "/system/role",
                "type": "item",
                "component": "common/system/Role"
              }
            ]
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