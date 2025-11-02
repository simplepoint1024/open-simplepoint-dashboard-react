import {http, HttpResponse} from 'msw';

const base = '/common/i18n/regions';

export const apis = [
  http.get(`${base}/schema`, () => {
    return HttpResponse.json(
      {
        "schema": {
          "$schema": "http://json-schema.org/draft-07/schema#", "type": "object", "properties": {
            "code": {
              "type": ["string", "null"],
              "title": "i18n:region.title.code",
              "description": "i18n:region.description.code",
              "x-ui": {"x-list-visible": "true"}
            },
            "countryCode": {
              "type": ["string", "null"],
              "title": "i18n:region.title.countryCode",
              "description": "i18n:region.description.countryCode",
              "x-ui": {"x-list-visible": "true"}
            },
            "level": {
              "type": ["string", "null"],
              "title": "i18n:region.title.level",
              "description": "i18n:region.description.level",
              "x-ui": {"x-list-visible": "true"}
            },
            "nameEnglish": {
              "type": ["string", "null"],
              "title": "i18n:region.title.nameEnglish",
              "description": "i18n:region.description.nameEnglish",
              "x-ui": {"x-list-visible": "true"}
            },
            "nameNative": {
              "type": ["string", "null"],
              "title": "i18n:region.title.nameNative",
              "description": "i18n:region.description.nameNative",
              "x-ui": {"x-list-visible": "true"}
            },
            "parentId": {
              "type": ["string", "null"],
              "title": "i18n:region.title.parentCode",
              "description": "i18n:region.description.parentCode",
              "x-ui": {"x-list-visible": "true"}
            },
            "postalCode": {
              "type": ["string", "null"],
              "title": "i18n:region.title.postalCode",
              "description": "i18n:region.description.postalCode",
              "x-ui": {"x-list-visible": "true"}
            }
          }
        },
        "buttons": [{
          "path": "[default]",
          "color": "danger",
          "variant": "outlined",
          "icon": "MinusCircleOutlined",
          "argumentMaxSize": 10,
          "sort": 2,
          "type": "primary",
          "title": "i18n:table.button.delete",
          "danger": true,
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
          "title": "i18n:table.button.edit",
          "danger": false,
          "argumentMinSize": 1,
          "key": "edit"
        }, {
          "path": "[default]",
          "color": "blue",
          "variant": "outlined",
          "icon": "PlusCircleOutlined",
          "argumentMaxSize": 1,
          "sort": 0,
          "type": "primary",
          "title": "i18n:table.button.add",
          "danger": false,
          "argumentMinSize": 0,
          "key": "add"
        }]
      })
  }),

  http.get(`${base}`, () => {
    return HttpResponse.json(
      {"content": [], "page": {"size": 20, "number": 0, "totalElements": 0, "totalPages": 0}}
    )
  }),
];

export default apis;

