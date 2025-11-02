import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/roles/schema', () => {
    return HttpResponse.json(
      {"buttons":[{"path":"[default]","color":"blue","variant":"outlined","icon":"PlusCircleOutlined","argumentMaxSize":0,"sort":0,"type":"primary","danger":false,"title":"添加","argumentMinSize":0,"key":"add"},{"path":"[default]","color":"danger","variant":"outlined","icon":"MinusCircleOutlined","argumentMaxSize":10,"sort":2,"type":"primary","danger":true,"title":"删除","argumentMinSize":1,"key":"delete"},{"path":"[default]","color":"orange","variant":"outlined","icon":"EditOutlined","argumentMaxSize":1,"sort":1,"type":"primary","danger":false,"title":"编辑","argumentMinSize":1,"key":"edit"}],"schema":{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"address":{"type":["string","null"],"title":"i18n:users.title.address","description":"i18n:users.description.address","minLength":5,"maxLength":255},"birthdate":{"type":["string","null"],"title":"i18n:users.title.birthdate","description":"i18n:users.description.birthdate","format":"date-time"},"email":{"type":["string","null"],"title":"i18n:users.title.email","description":"i18n:users.description.email","minLength":5,"maxLength":64,"format":"email","x-ui":{"x-list-visible":"true"}},"enabled":{"type":"boolean","title":"i18n:users.title.enabled","description":"i18n:users.description.enabled","readOnly":true,"x-ui":{"x-list-visible":"true"}},"familyName":{"type":["string","null"],"title":"i18n:users.title.familyName","description":"i18n:users.description.familyName","minLength":1,"maxLength":50},"givenName":{"type":["string","null"],"title":"i18n:users.title.givenName","description":"i18n:users.description.givenName","minLength":1,"maxLength":50},"middleName":{"type":["string","null"],"title":"i18n:users.title.middleName","description":"i18n:users.description.middleName","minLength":1,"maxLength":50},"nickname":{"type":["string","null"],"title":"i18n:users.title.nickname","description":"i18n:users.description.nickname","minLength":1,"maxLength":50,"x-order":2,"x-ui":{"x-list-visible":"true"}},"password":{"type":["string","null"],"title":"i18n:users.title.password","description":"i18n:users.description.username","x-order":2,"x-ui":{"widget":"password"}},"phoneNumber":{"type":["string","null"],"title":"i18n:users.title.phoneNumber","description":"i18n:users.description.phoneNumber","minLength":5,"maxLength":50,"x-order":3,"x-ui":{"x-list-visible":"true"}},"picture":{"type":["string","null"],"title":"i18n:users.title.picture","description":"i18n:users.description.picture","format":"data-url"},"profile":{"type":["string","null"],"title":"i18n:users.title.profile","description":"i18n:users.description.profile"},"superAdmin":{"type":"boolean","title":"i18n:users.title.superAdmin","description":"i18n:users.description.superAdmin","x-ui":{"x-list-visible":"true"}},"username":{"type":["string","null"],"title":"i18n:users.title.username","description":"i18n:users.description.username","x-order":1,"x-ui":{"x-list-visible":"true"}}}}}
      )
  }),

  http.get('/common/roles', () => {
    return HttpResponse.json(
      {
        "content": [
          {
            "id": "1",
            "createdBy": null,
            "updatedBy": null,
            "createdAt": "2025-09-22T13:08:42.826Z",
            "updatedAt": "2025-09-22T13:08:45.546Z",
            "roleName": "超级管理员",
            "authority": "SYSTEM_ADMIN",
            "description": null,
            "priority": null
          }
        ],
        "page": {
          "size": 20,
          "number": 0,
          "totalElements": 1,
          "totalPages": 1
        }
      }
    )
  }),
];

export default apis;