import {http, HttpResponse} from 'msw';

export const apis = [
  http.get('/common/table/schema', () => {
    return HttpResponse.json(
      {
        columns: [{
          name: 'Name',
          value: 'name',
          typeScriptType: 'string',
          nullable: true,
        }, {
          name: 'Age',
          value: 'age',
          typeScriptType: 'number',
        }, {
          name: 'Address',
          value: 'address',
          typeScriptType: 'string',
        }, {
          name: 'NA',
          value: 'na',
          typeScriptType: 'string',
        }],
        buttons: [
          {
            text: '添加',
            title: '添加',
            key: 'add',
            type: 'primary',
            color: 'blue',
            variant: 'outlined',
            icon: 'PlusCircleOutlined'
          }, {
            text: '编辑',
            title: '编辑',
            key: 'edit',
            type: 'primary',
            color: 'orange',
            variant: 'outlined',
            icon: 'EditOutlined',
          }, {
            text: '删除',
            title: '删除',
            key: 'del',
            type: 'primary',
            color: 'danger',
            variant: 'outlined',
            icon: 'MinusCircleOutlined',
          }
        ]
      }
    )
  }),

  http.get('/common/table', () => {
    return HttpResponse.json(
      {
        page: {
          number: 0,
          size: 10,
          totalElements: 4,
          totalPages: 1
        },
        content: [
          {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            na: 'New York No. 1 Lake Park',
          },
          {
            key: '2',
            name: 'Joe Black',
            age: 42,
            address: 'London No. 1 Lake Park',
            na: 'New York No. 1 Lake Park',
          },
          {
            key: '3',
            name: 'Jim Green',
            age: 32,
            address: 'Sydney No. 1 Lake Park',
            na: 'New York No. 1 Lake Park',
          },
          {
            key: '4',
            name: 'Jim Red',
            age: 32,
            address: 'London No. 2 Lake Park',
            na: 'New York No. 1 Lake Park',
          }
        ]
      }
    )
  }),
];

export default apis;