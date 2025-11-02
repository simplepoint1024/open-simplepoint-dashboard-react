import {http, HttpResponse} from 'msw';

const base = '/common/i18n/languages';

export const apis = [
  http.get(`${base}/schema`, () => {
    return HttpResponse.json(
      {"schema":{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"code":{"type":["string","null"],"title":"i18n:language.title.code","description":"i18n:language.description.code","x-ui":{"x-list-visible":"true"}},"dateFormat":{"type":["string","null"],"title":"i18n:language.title.dateFormat","description":"i18n:language.description.dateFormat","x-ui":{"x-list-visible":"true"}},"description":{"type":["string","null"],"title":"i18n:language.title.description","description":"i18n:language.description.description","x-ui":{"x-list-visible":"true"}},"enabled":{"type":"boolean","title":"i18n:language.title.enabled","description":"i18n:language.description.enabled","x-ui":{"x-list-visible":"true"}},"locale":{"type":["string","null"],"title":"i18n:language.title.locale","description":"i18n:language.description.locale","x-ui":{"x-list-visible":"true"}},"nameEnglish":{"type":["string","null"],"title":"i18n:language.title.nameEnglish","description":"i18n:language.description.nameEnglish","x-ui":{"x-list-visible":"true"}},"nameNative":{"type":["string","null"],"title":"i18n:language.title.nameNative","description":"i18n:language.description.nameNative","x-ui":{"x-list-visible":"true"}},"textDirection":{"type":["string","null"],"title":"i18n:language.title.textDirection","description":"i18n:language.description.textDirection","x-ui":{"x-list-visible":"true"}}}},"buttons":[{"path":"[default]","color":"danger","variant":"outlined","icon":"MinusCircleOutlined","argumentMaxSize":10,"sort":2,"type":"primary","title":"i18n:table.button.delete","danger":true,"argumentMinSize":1,"key":"delete"},{"path":"[default]","color":"orange","variant":"outlined","icon":"EditOutlined","argumentMaxSize":1,"sort":1,"type":"primary","title":"i18n:table.button.edit","danger":false,"argumentMinSize":1,"key":"edit"},{"path":"[default]","color":"blue","variant":"outlined","icon":"PlusCircleOutlined","argumentMaxSize":1,"sort":0,"type":"primary","title":"i18n:table.button.add","danger":false,"argumentMinSize":0,"key":"add"}]}    )
  }),

  http.get(`${base}`, () => {
    return HttpResponse.json(
      {"content":[],"page":{"size":20,"number":0,"totalElements":0,"totalPages":0}}
    )
  }),
];

export default apis;

