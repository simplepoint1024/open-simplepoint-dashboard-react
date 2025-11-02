import {http, HttpResponse} from 'msw';

const base = '/common/i18n/timezones';

export const apis = [
  http.get(`${base}/schema`, () => {
    return HttpResponse.json(
      {"schema":{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"countryCode":{"type":["string","null"],"title":"i18n:timezone.title.countryCode","description":"i18n:timezone.description.countryCode","x-ui":{"x-list-visible":"true"}},"enabled":{"type":"boolean","title":"i18n:timezone.title.enabled","description":"i18n:timezone.description.enabled","x-ui":{"x-list-visible":"true"}},"isDst":{"type":"boolean","title":"i18n:timezone.title.isDst","description":"i18n:timezone.description.isDst","x-ui":{"x-list-visible":"true"}},"nameEnglish":{"type":["string","null"],"title":"i18n:timezone.title.nameEnglish","description":"i18n:timezone.description.nameEnglish","x-ui":{"x-list-visible":"true"}},"nameNative":{"type":["string","null"],"title":"i18n:timezone.title.nameNative","description":"i18n:timezone.description.nameNative","x-ui":{"x-list-visible":"true"}},"timezoneCode":{"type":["string","null"],"title":"i18n:timezone.title.timezoneCode","description":"i18n:timezone.description.timezoneCode","x-ui":{"x-list-visible":"true"}},"utcOffset":{"type":["string","null"],"title":"i18n:timezone.title.utcOffset","description":"i18n:timezone.description.utcOffset","x-ui":{"x-list-visible":"true"}}}},"buttons":[{"path":"[default]","color":"danger","variant":"outlined","icon":"MinusCircleOutlined","argumentMaxSize":10,"sort":2,"type":"primary","title":"i18n:table.button.delete","danger":true,"argumentMinSize":1,"key":"delete"},{"path":"[default]","color":"orange","variant":"outlined","icon":"EditOutlined","argumentMaxSize":1,"sort":1,"type":"primary","title":"i18n:table.button.edit","danger":false,"argumentMinSize":1,"key":"edit"},{"path":"[default]","color":"blue","variant":"outlined","icon":"PlusCircleOutlined","argumentMaxSize":1,"sort":0,"type":"primary","title":"i18n:table.button.add","danger":false,"argumentMinSize":0,"key":"add"}]}    )
  }),

  http.get(`${base}`, () => {
    return HttpResponse.json(
      {"content":[],"page":{"size":20,"number":0,"totalElements":0,"totalPages":0}}
    )
  }),
];

export default apis;

