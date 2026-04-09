import {http, HttpResponse} from 'msw';

const base = '/common/platform/features';

const features = [
  {
    id: 'feat-dashboard',
    name: '首页工作台',
    code: 'DASHBOARD',
    description: '租户工作台首页与聚合卡片。',
    parentCode: '',
    type: 1,
    sort: 10,
    enabled: true,
  },
  {
    id: 'feat-approval',
    name: '审批中心',
    code: 'APPROVAL',
    description: '覆盖请假、报销等流程审批。',
    parentCode: '',
    type: 1,
    sort: 20,
    enabled: true,
  },
];

let featurePermissions: Record<string, string[]> = {
  DASHBOARD: ['dashboard.view'],
  APPROVAL: ['approval.view', 'approval.audit'],
};

const schema = {
  buttons: [
    {key: 'add', title: 'i18n:table.button.add', authority: 'features.create', sort: 0, argumentMinSize: 0, argumentMaxSize: 0},
    {key: 'edit', title: 'i18n:table.button.edit', authority: 'features.edit', sort: 1, argumentMinSize: 1, argumentMaxSize: 1},
    {key: 'delete', title: 'i18n:table.button.delete', authority: 'features.delete', sort: 2, argumentMinSize: 1, argumentMaxSize: 10},
    {key: 'config.permission', title: 'i18n:table.button.config.permission', authority: 'features.config.permission', sort: 3, argumentMinSize: 1, argumentMaxSize: 1},
  ],
  schema: {
    type: 'object',
    properties: {
      name: {type: 'string', title: '功能名称'},
      code: {type: 'string', title: '功能编码'},
      description: {type: 'string', title: '功能描述'},
      parentCode: {type: 'string', title: '父级编码'},
      type: {type: 'integer', title: '功能类型', 'x-ui': {'x-list-visible': 'true', dictCode: 'feature.type'}},
      sort: {type: 'integer', title: '排序'},
      enabled: {type: 'boolean', title: '启用状态'},
    },
  },
};

const pageData = {
  content: features,
  page: {
    size: 10,
    number: 0,
    totalElements: features.length,
    totalPages: 1,
  },
};

const itemsData = {
  content: features,
  page: {
    size: 2000,
    number: 0,
    totalElements: features.length,
    totalPages: 1,
  },
};

const unique = (values: string[]) => Array.from(new Set(values));

export default [
  http.get(`${base}/schema`, () => HttpResponse.json(schema)),
  http.get(base, () => HttpResponse.json(pageData)),
  http.get(`${base}/items`, () => HttpResponse.json(itemsData)),
  http.get(`${base}/authorized`, ({request}) => {
    const featureCode = new URL(request.url).searchParams.get('featureCode') ?? '';
    return HttpResponse.json(featurePermissions[featureCode] ?? []);
  }),
  http.post(`${base}/authorize`, async ({request}) => {
    const payload = await request.json() as {featureCode?: string | null; permissionAuthority?: string[]};
    const featureCode = payload.featureCode ?? '';
    featurePermissions[featureCode] = unique([...(featurePermissions[featureCode] ?? []), ...(payload.permissionAuthority ?? [])]);
    return HttpResponse.json((featurePermissions[featureCode] ?? []).map((authority) => ({featureCode, permissionAuthority: authority})));
  }),
  http.post(`${base}/unauthorized`, async ({request}) => {
    const payload = await request.json() as {featureCode?: string | null; permissionAuthority?: string[]};
    const featureCode = payload.featureCode ?? '';
    const removing = new Set(payload.permissionAuthority ?? []);
    featurePermissions[featureCode] = (featurePermissions[featureCode] ?? []).filter((authority) => !removing.has(authority));
    return HttpResponse.json(null);
  }),
];
