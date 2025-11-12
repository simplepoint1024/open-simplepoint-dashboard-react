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
      "content": [
        {
          "name": "I18n View",
          "authority": "i18n.view",
          "description": "允许访问国际化管理菜单"
        },
        {
          "name": "System Config View",
          "authority": "system.view",
          "description": "允许访问系统配置菜单"
        },
        {
          "name": "Dashboard View",
          "authority": "dashboard.view",
          "description": "允许访问Dashboard页面"
        },
        {
          "name": "Timezone Create",
          "authority": "timezones.create",
          "description": "允许创建时区"
        },
        {
          "name": "Timezone Edit",
          "authority": "timezones.edit",
          "description": "允许编辑时区"
        },
        {
          "name": "Timezone Delete",
          "authority": "timezones.delete",
          "description": "允许删除时区"
        },
        {
          "name": "Timezone View",
          "authority": "timezones.view",
          "description": "允许访问时区管理页面"
        },
        {
          "name": "Region Edit",
          "authority": "regions.edit",
          "description": "允许编辑区域"
        },
        {
          "name": "Region View",
          "authority": "regions.view",
          "description": "允许访问区域管理页面"
        },
        {
          "name": "Region Delete",
          "authority": "regions.delete",
          "description": "允许删除区域"
        },
        {
          "name": "Region Create",
          "authority": "regions.create",
          "description": "允许创建区域"
        },
        {
          "name": "Namespace View",
          "authority": "namespaces.view",
          "description": "允许访问国际化命名空间页面"
        },
        {
          "name": "Namespace Edit",
          "authority": "namespaces.edit",
          "description": "允许编辑国际化命名空间"
        },
        {
          "name": "Namespace Create",
          "authority": "namespaces.create",
          "description": "允许创建国际化命名空间"
        },
        {
          "name": "Namespace Delete",
          "authority": "namespaces.delete",
          "description": "允许删除国际化命名空间"
        },
        {
          "name": "Language Create",
          "authority": "languages.create",
          "description": "允许创建语言"
        },
        {
          "name": "Language Delete",
          "authority": "languages.delete",
          "description": "允许删除语言"
        },
        {
          "name": "Language View",
          "authority": "languages.view",
          "description": "允许访问语言管理页面"
        },
        {
          "name": "Language Edit",
          "authority": "languages.edit",
          "description": "允许编辑语言"
        },
        {
          "name": "Message Edit",
          "authority": "messages.edit",
          "description": "允许编辑国际化消息"
        },
        {
          "name": "Message Delete",
          "authority": "messages.delete",
          "description": "允许删除国际化消息"
        },
        {
          "name": "Message Create",
          "authority": "messages.create",
          "description": "允许创建国际化消息"
        },
        {
          "name": "Message View",
          "authority": "messages.view",
          "description": "允许访问国际化消息页面"
        },
        {
          "name": "Country View",
          "authority": "countries.view",
          "description": "允许访问国家管理页面"
        },
        {
          "name": "Country Create",
          "authority": "countries.create",
          "description": "允许创建国家"
        },
        {
          "name": "Country Delete",
          "authority": "countries.delete",
          "description": "允许删除国家"
        },
        {
          "name": "Country Edit",
          "authority": "countries.edit",
          "description": "允许编辑国家"
        },
        {
          "name": "Role Edit",
          "authority": "roles.edit",
          "description": "允许编辑角色"
        },
        {
          "name": "Role Create",
          "authority": "roles.create",
          "description": "允许创建角色"
        },
        {
          "name": "Role View",
          "authority": "roles.view",
          "description": "允许访问角色管理页面"
        },
        {
          "name": "Role Delete",
          "authority": "roles.delete",
          "description": "允许删除角色"
        },
        {
          "name": "User View",
          "authority": "users.view",
          "description": "允许访问用户管理页面"
        },
        {
          "name": "User Create",
          "authority": "users.create",
          "description": "允许创建用户"
        },
        {
          "name": "User Delete",
          "authority": "users.delete",
          "description": "允许删除用户"
        },
        {
          "name": "User Edit",
          "authority": "users.edit",
          "description": "允许编辑用户"
        },
        {
          "name": "Menu Delete",
          "authority": "menus.delete",
          "description": "允许删除菜单"
        },
        {
          "name": "Menu Edit",
          "authority": "menus.edit",
          "description": "允许编辑菜单"
        },
        {
          "name": "Menu View",
          "authority": "menus.view",
          "description": "允许访问菜单管理页面"
        },
        {
          "name": "Menu Create",
          "authority": "menus.create",
          "description": "允许创建菜单"
        },
        {
          "name": "Permission Delete",
          "authority": "permissions.delete",
          "description": "允许删除权限"
        },
        {
          "name": "Permission Edit",
          "authority": "permissions.edit",
          "description": "允许编辑权限"
        },
        {
          "name": "Permission View",
          "authority": "permissions.view",
          "description": "允许访问权限管理页面"
        },
        {
          "name": "Permission Create",
          "authority": "permissions.create",
          "description": "允许创建权限"
        },
        {
          "name": "OAuth Client Create",
          "authority": "oauthClients.create",
          "description": "允许创建客户端"
        },
        {
          "name": "OAuth Client View",
          "authority": "oauthClients.view",
          "description": "允许访问客户端管理页面"
        },
        {
          "name": "OAuth Client Edit",
          "authority": "oauthClients.edit",
          "description": "允许编辑客户端"
        },
        {
          "name": "OAuth Client Delete",
          "authority": "oauthClients.delete",
          "description": "允许删除客户端"
        }
      ],
      "page": {
        "size": 2000,
        "number": 0,
        "totalElements": 47,
        "totalPages": 1
      }
    })
  })
];



