import {http, HttpResponse} from 'msw';

export default [
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
            "label": "Dashboard",
            "title": "menu.dashboard",
            "icon": "DashboardOutlined",
            "path": "/dashboard",
            "sort": 0,
            "component": "common/Dashboard",
            "disabled": false,
            "children": []
          },
          {
            "label": "Test",
            "title": "menu.test",
            "icon": "DashboardOutlined",
            "path": "/test",
            "sort": 0,
            "component": "common/Test",
            "disabled": false,
            "children": []
          },
          {
            "label": "系统配置",
            "title": "menu.system",
            "icon": "SettingOutlined",
            "path": "/system",
            "sort": 1,
            "type": "item",
            "disabled": false,
            "children": [
              {
                "label": "用户管理",
                "title": "menu.system.user",
                "icon": "UserOutlined",
                "path": "/system/user",
                "sort": 0,
                "type": "item",
                "component": "common/system/User",
                "disabled": false,
                "children": []
              },
              {
                "label": "菜单管理",
                "title": "menu.system.menu",
                "icon": "MenuOutlined",
                "path": "/system/menu",
                "sort": 1,
                "type": "item",
                "component": "common/system/Menu",
                "disabled": false,
                "children": []
              },
              {
                "label": "角色管理",
                "title": "menu.system.role",
                "icon": "UsergroupAddOutlined",
                "path": "/system/role",
                "sort": 2,
                "type": "item",
                "component": "common/system/Role",
                "disabled": false,
                "children": []
              },
              {
                "label": "权限管理",
                "title": "menu.system.permission",
                "icon": "SafetyCertificateOutlined",
                "path": "/system/permission",
                "sort": 3,
                "type": "item",
                "component": "common/system/Permission",
                "disabled": false,
                "children": []
              },
              {
                "label": "客户端管理",
                "title": "menu.system.oauthClient",
                "icon": "ApiOutlined",
                "path": "/system/oauth-client",
                "sort": 3,
                "type": "item",
                "component": "common/system/OAuthClient",
                "disabled": false,
                "children": []
              }
            ]
          },
          {
            "label": "国际化管理",
            "title": "menu.i18n",
            "icon": "GlobalOutlined",
            "path": "/i18n",
            "type": "item",
            "sort": 2,
            "disabled": false,
            "children": [
              {
                "label": "国家管理",
                "title": "menu.i18n.countries",
                "icon": "GlobalOutlined",
                "path": "/i18n/countries",
                "sort": 0,
                "component": "common/i18n/Countries",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "label": "区域管理",
                "title": "menu.i18n.regions",
                "icon": "CompassOutlined",
                "path": "/i18n/regions",
                "sort": 1,
                "component": "common/i18n/Region",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "label": "时区管理",
                "title": "menu.i18n.timezones",
                "icon": "ClockCircleOutlined",
                "path": "/i18n/timezones",
                "sort": 2,
                "component": "common/i18n/Timezone",
                "type": "item",
                "disabled": false,
                "children": []
              }, {
                "label": "语言管理",
                "title": "menu.i18n.languages",
                "icon": "TranslationOutlined",
                "path": "/i18n/languages",
                "sort": 3,
                "component": "common/i18n/Language",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "label": "国际化命名空间",
                "title": "menu.i18n.namespace",
                "icon": "FolderOpenOutlined",
                "path": "/i18n/namespace",
                "sort": 4,
                "component": "common/i18n/Namespace",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "label": "国际化消息",
                "title": "menu.i18n.message",
                "icon": "CommentOutlined",
                "path": "/i18n/message",
                "sort": 5,
                "component": "common/i18n/Message",
                "type": "item",
                "disabled": false,
                "children": []
              },
            ]
          },
          {
            "label": "系统维护",
            "title": "menu.ops",
            "icon": "ClusterOutlined",
            "path": "/ops",
            "type": "item",
            "disabled": false,
            "children": [
              {
                "label": "插件市场",
                "title": "menu.ops.microPlugin",
                "icon": "BuildOutlined",
                "path": "/ops/micro-plugin",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "label": "微应用管理",
                "title": "menu.ops.microApplication",
                "icon": "DropboxOutlined",
                "path": "/ops/micro-application",
                "type": "item",
                "disabled": false,
                "children": []
              },
              {
                "label": "微服务管理",
                "title": "menu.ops.microService",
                "icon": "QrcodeOutlined",
                "path": "/ops/micro-service",
                "type": "item",
                "disabled": false,
                "children": []
              }
            ]
          },
          {
            "label": "监控审计",
            "title": "menu.monitoring",
            "icon": "EyeOutlined",
            "path": "/monitoring",
            "type": "item",
            "disabled": false,
            "children": [
              {
                "label": "登录日志",
                "title": "menu.monitoring.loginLog",
                "icon": "SendOutlined",
                "path": "/monitoring/login-log",
                "type": "item",
                "disabled": false,
                "children": []
              }
            ]
          },
          {
            "label": "外部链接",
            "title": "menu.externalLink",
            "icon": "LinkOutlined",
            "path": "/baidu",
            "component": "iframe:https://www.baidu.com",
          },
          {
            "label": "AntDesign 官网",
            "parent": "91639c9d-86b1-44cd-8539-1297df4f6218",
            "icon": "LinkOutlined",
            "path": "/ops/ant-design",
            "type": "item",
            "component": "external:https://ant.design",
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
