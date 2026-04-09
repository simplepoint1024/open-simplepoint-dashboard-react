import {http, HttpResponse} from 'msw';
const {get} = http;

const microapps = [
    {
         name: 'common',
         entry: 'http://127.0.0.1:3001/common/mf/mf-manifest.json'
    },
    {
         name: 'auditing',
         entry: 'http://127.0.0.1:3002/auditing/mf/mf-manifest.json'
    }
]

const routes = {
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
                    "title": "menu.ops.microapps",
                    "icon": "DropboxOutlined",
                    "path": "/ops/microapp",
                    "component": "common/ops/Microapp",
                    "type": "item",
                    "disabled": false,
                    "children": []
                },
                {
                    "label": "微服务管理",
                    "title": "menu.ops.microService",
                    "icon": "QrcodeOutlined",
                    "path": "common/ops/micro-service",
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
            "authority": "monitoring.view",
            "type": "item",
            "disabled": false,
            "children": [
                {
                    "label": "登录日志",
                    "title": "menu.monitoring.loginLog",
                    "icon": "SendOutlined",
                    "path": "/monitoring/login-log",
                    "authority": "login.logs.view",
                    "sort": 0,
                    "component": "auditing/monitoring/LoginLog",
                    "type": "item",
                    "disabled": false,
                    "children": []
                },
                {
                    "label": "权限变更记录",
                    "title": "menu.monitoring.permissionChangeLog",
                    "icon": "SafetyCertificateOutlined",
                    "path": "/monitoring/permission-change-log",
                    "authority": "permission.change.logs.view",
                    "sort": 1,
                    "component": "auditing/monitoring/PermissionChangeLog",
                    "type": "item",
                    "disabled": false,
                    "children": []
                },
                {
                    "label": "错误日志",
                    "title": "menu.monitoring.errorLog",
                    "icon": "WarningOutlined",
                    "path": "/monitoring/error-log",
                    "authority": "error.logs.view",
                    "sort": 2,
                    "component": "auditing/monitoring/ErrorLog",
                    "type": "item",
                    "disabled": false,
                    "children": []
                },
                {
                    "label": "服务限流",
                    "title": "menu.monitoring.serviceRateLimit",
                    "icon": "CloudServerOutlined",
                    "path": "/monitoring/service-rate-limit",
                    "authority": "service.rate.limit.rules.view",
                    "sort": 3,
                    "component": "auditing/monitoring/ServiceRateLimitRule",
                    "type": "item",
                    "disabled": false,
                    "children": []
                },
                {
                    "label": "接口限流",
                    "title": "menu.monitoring.endpointRateLimit",
                    "icon": "ApiOutlined",
                    "path": "/monitoring/endpoint-rate-limit",
                    "authority": "endpoint.rate.limit.rules.view",
                    "sort": 4,
                    "component": "auditing/monitoring/EndpointRateLimitRule",
                    "type": "item",
                    "disabled": false,
                    "children": []
                },
                {
                    "label": "Redis管理",
                    "title": "menu.monitoring.redis",
                    "icon": "DatabaseOutlined",
                    "path": "/monitoring/redis",
                    "authority": "redis.entries.view",
                    "sort": 5,
                    "component": "auditing/monitoring/Redis",
                    "type": "item",
                    "disabled": false,
                    "children": []
                }
            ]
        },
        {
            "label": "平台管理",
            "title": "menu.platform",
            "icon": "ApartmentOutlined",
            "path": "/platform",
            "authority": "tenants.view",
            "type": "item",
            "sort": 3,
            "disabled": false,
            "permissions": [
                {
                    "name": "Platform View",
                    "authority": "tenants.view",
                    "resource": "/platform",
                    "description": "允许访问平台管理菜单"
                }
            ],
            "children": [
                {
                    "label": "租户管理",
                    "title": "menu.platform.tenants",
                    "icon": "TeamOutlined",
                    "path": "/platform/tenants",
                    "authority": "tenants.view",
                    "sort": 0,
                    "component": "common/platform/Tenant",
                    "type": "item",
                    "disabled": false,
                    "permissions": [
                        {
                            "name": "Tenant View",
                            "authority": "tenants.view",
                            "resource": "/platform/tenants",
                            "description": "允许访问租户管理页面"
                        },
                        {
                            "name": "Tenant Create",
                            "authority": "tenants.create",
                            "resource": "/platform/tenants",
                            "description": "允许创建租户"
                        },
                        {
                            "name": "Tenant Edit",
                            "authority": "tenants.edit",
                            "resource": "/platform/tenants",
                            "description": "允许编辑租户"
                        },
                        {
                            "name": "Tenant Delete",
                            "authority": "tenants.delete",
                            "resource": "/platform/tenants",
                            "description": "允许删除租户"
                        }
                    ]
                },
                {
                    "label": "套餐包管理",
                    "title": "menu.platform.packages",
                    "icon": "AppstoreOutlined",
                    "path": "/platform/packages",
                    "authority": "packages.view",
                    "sort": 1,
                    "component": "common/platform/Package",
                    "type": "item",
                    "disabled": false,
                    "permissions": [
                        {
                            "name": "Package View",
                            "authority": "packages.view",
                            "resource": "/platform/packages",
                            "description": "允许访问套餐包管理页面"
                        },
                        {
                            "name": "Package Create",
                            "authority": "packages.create",
                            "resource": "/platform/packages",
                            "description": "允许创建套餐包"
                        },
                        {
                            "name": "Package Edit",
                            "authority": "packages.edit",
                            "resource": "/platform/packages",
                            "description": "允许编辑套餐包"
                        },
                        {
                            "name": "Package Delete",
                            "authority": "packages.delete",
                            "resource": "/platform/packages",
                            "description": "允许删除套餐包"
                        }
                    ]
                },
                {
                    "label": "应用管理",
                    "title": "menu.platform.applications",
                    "icon": "AppstoreOutlined",
                    "path": "/platform/applications",
                    "authority": "applications.view",
                    "sort": 2,
                    "component": "common/platform/Application",
                    "type": "item",
                    "disabled": false,
                    "permissions": [
                        {
                            "name": "Application View",
                            "authority": "applications.view",
                            "resource": "/platform/applications",
                            "description": "允许访问应用管理页面"
                        },
                        {
                            "name": "Application Create",
                            "authority": "applications.create",
                            "resource": "/platform/applications",
                            "description": "允许创建应用"
                        },
                        {
                            "name": "Application Edit",
                            "authority": "applications.edit",
                            "resource": "/platform/applications",
                            "description": "允许编辑应用"
                        },
                        {
                            "name": "Application Delete",
                            "authority": "applications.delete",
                            "resource": "/platform/applications",
                            "description": "允许删除应用"
                        }
                    ]
                },
                {
                    "label": "功能管理",
                    "title": "menu.platform.features",
                    "icon": "FunctionOutlined",
                    "path": "/platform/features",
                    "authority": "features.view",
                    "sort": 3,
                    "component": "common/platform/Feature",
                    "type": "item",
                    "disabled": false,
                    "permissions": [
                        {
                            "name": "Feature View",
                            "authority": "features.view",
                            "resource": "/platform/features",
                            "description": "允许访问功能管理页面"
                        },
                        {
                            "name": "Feature Create",
                            "authority": "features.create",
                            "resource": "/platform/features",
                            "description": "允许创建功能"
                        },
                        {
                            "name": "Feature Edit",
                            "authority": "features.edit",
                            "resource": "/platform/features",
                            "description": "允许编辑功能"
                        },
                        {
                            "name": "Feature Delete",
                            "authority": "features.delete",
                            "resource": "/platform/features",
                            "description": "允许删除功能"
                        }
                    ]
                },
                {
                    "label": "字典管理",
                    "title": "menu.platform.dictionaries",
                    "icon": "BookOutlined",
                    "path": "/platform/dictionaries",
                    "authority": "dictionaries.view",
                    "sort": 4,
                    "component": "common/platform/Dictionary",
                    "type": "item",
                    "disabled": false,
                    "permissions": [
                        {
                            "name": "Dictionary View",
                            "authority": "dictionaries.view",
                            "resource": "/platform/dictionaries",
                            "description": "允许访问字典管理页面"
                        },
                        {
                            "name": "Dictionary Create",
                            "authority": "dictionaries.create",
                            "resource": "/platform/dictionaries",
                            "description": "允许创建字典"
                        },
                        {
                            "name": "Dictionary Edit",
                            "authority": "dictionaries.edit",
                            "resource": "/platform/dictionaries",
                            "description": "允许编辑字典"
                        },
                        {
                            "name": "Dictionary Delete",
                            "authority": "dictionaries.delete",
                            "resource": "/platform/dictionaries",
                            "description": "允许删除字典"
                        },
                        {
                            "name": "Dictionary Config Item",
                            "authority": "dictionaries.config.item",
                            "resource": "/platform/dictionaries",
                            "description": "允许配置字典项"
                        }
                    ]
                },
                {
                    "label": "组织机构管理",
                    "title": "menu.platform.organizations",
                    "icon": "ApartmentOutlined",
                    "path": "/platform/organizations",
                    "authority": "organizations.view",
                    "sort": 5,
                    "component": "common/platform/Organization",
                    "type": "item",
                    "disabled": false,
                    "permissions": [
                        {
                            "name": "Organization View",
                            "authority": "organizations.view",
                            "resource": "/platform/organizations",
                            "description": "允许访问组织机构管理页面"
                        },
                        {
                            "name": "Organization Create",
                            "authority": "organizations.create",
                            "resource": "/platform/organizations",
                            "description": "允许创建组织机构"
                        },
                        {
                            "name": "Organization Edit",
                            "authority": "organizations.edit",
                            "resource": "/platform/organizations",
                            "description": "允许编辑组织机构"
                        },
                        {
                            "name": "Organization Delete",
                            "authority": "organizations.delete",
                            "resource": "/platform/organizations",
                            "description": "允许删除组织机构"
                        }
                    ]
                },
                {
                    "label": "对象存储",
                    "title": "menu.platform.objectStorage",
                    "icon": "CloudUploadOutlined",
                    "path": "/platform/object-storage",
                    "authority": "storage.objects.view",
                    "sort": 6,
                    "component": "common/platform/ObjectStorage",
                    "type": "item",
                    "disabled": false,
                    "permissions": [
                        {
                            "name": "Object Storage View",
                            "authority": "storage.objects.view",
                            "resource": "/platform/object-storage",
                            "description": "允许访问对象存储页面"
                        },
                        {
                            "name": "Object Storage Create",
                            "authority": "storage.objects.create",
                            "resource": "/platform/object-storage",
                            "description": "允许上传对象"
                        },
                        {
                            "name": "Object Storage Delete",
                            "authority": "storage.objects.delete",
                            "resource": "/platform/object-storage",
                            "description": "允许删除对象"
                        },
                        {
                            "name": "Object Storage Quota View",
                            "authority": "storage.quotas.view",
                            "resource": "/platform/object-storage",
                            "description": "允许查看租户对象存储配额"
                        },
                        {
                            "name": "Object Storage Quota Create",
                            "authority": "storage.quotas.create",
                            "resource": "/platform/object-storage",
                            "description": "允许新增租户对象存储配额"
                        },
                        {
                            "name": "Object Storage Quota Edit",
                            "authority": "storage.quotas.edit",
                            "resource": "/platform/object-storage",
                            "description": "允许编辑租户对象存储配额"
                        },
                        {
                            "name": "Object Storage Quota Delete",
                            "authority": "storage.quotas.delete",
                            "resource": "/platform/object-storage",
                            "description": "允许删除租户对象存储配额"
                        }
                    ]
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

const serviceRoutes = {
    "services": microapps,
    "routes": routes.content
}

export default [
    get('/common/menus/service-routes', () => HttpResponse.json(serviceRoutes)),
];
