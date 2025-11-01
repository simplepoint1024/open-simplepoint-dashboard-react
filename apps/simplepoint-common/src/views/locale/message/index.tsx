import { Button, Result } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

const App = () => {
  return (
    <Result
      icon={<SmileOutlined />}
      title="该页面正在建设，敬请期待!"
      extra={<Button type="primary">Hello!</Button>}
    />
  );
};

export default App;
